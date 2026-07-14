from dotenv import load_dotenv

load_dotenv()  # Must run before any os.getenv() calls

from fastapi import FastAPI, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from google import genai  # type: ignore[import-untyped]
from google.genai import errors as genai_errors  # type: ignore[import-untyped]

import os
import json
import logging
import time
from datetime import datetime, timezone
from typing import List

import models
import crud
from schemas import AnalysisResponse

from sqlalchemy.orm import Session

from detector import detect_phishing
from database import engine, get_db
from fastapi.responses import FileResponse
from report import generate_report

logger = logging.getLogger(__name__)

# ----------------------------
# App Initialization
# ----------------------------

app = FastAPI()

models.Base.metadata.create_all(bind=engine)

# ----------------------------
# Startup Validation
# ----------------------------

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError(
        "GEMINI_API_KEY is not set. "
        "Add it to your .env file: GEMINI_API_KEY=your_key_here"
    )

client = genai.Client(api_key=api_key)

# ----------------------------
# Gemini Model Priority
# ----------------------------

GEMINI_MODELS = [
    "gemini-flash-latest",
    "gemini-3.5-flash",
    "gemini-2.0-flash",
]

# ----------------------------
# Gemini Resilient Call
# ----------------------------

def call_gemini_with_retry(prompt: str) -> dict | None:

    for model in GEMINI_MODELS:

        for attempt in range(1, 4):

            logger.info("Gemini attempt %d/3 with model '%s'", attempt, model)

            try:

                response = client.models.generate_content(
                    model=model,
                    contents=prompt,
                )

                text = (response.text or "").strip()

                if text.startswith("```json"):
                    text = text.replace("```json", "").replace("```", "").strip()
                elif text.startswith("```"):
                    text = text.replace("```", "").strip()

                result = json.loads(text)

                logger.info("Gemini success with model '%s'", model)

                return result

            except genai_errors.ServerError as e:

                if e.code == 503:

                    if attempt < 3:
                        wait = 2 ** attempt
                        logger.warning(
                            "Gemini 503 on '%s' attempt %d/3 — retrying in %ds",
                            model, attempt, wait,
                        )
                        time.sleep(wait)

                    else:
                        logger.warning(
                            "Gemini '%s' failed after 3 attempts — trying next model",
                            model,
                        )

                else:
                    logger.error(
                        "Gemini non-retryable server error on '%s': %s",
                        model, e,
                    )
                    break

            except Exception as e:
                logger.error(
                    "Gemini non-retryable error on '%s': %s",
                    model, e,
                )
                break

    logger.warning(
        "All Gemini models failed after retries — "
        "switching to rule-based detector"
    )

    return None

# ----------------------------
# CORS
# ----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Request Model
# ----------------------------

class AnalyzeRequest(BaseModel):
    text: str = Field(
        min_length=1,
        max_length=5000,
        description="The email, SMS, or URL text to analyze for phishing.",
    )

    @field_validator("text")
    @classmethod
    def text_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("text must not be empty or whitespace only")
        return v

# ----------------------------
# Home
# ----------------------------

@app.get("/")
def home():
    return {"message": "PhishGuard Backend Running"}

# ----------------------------
# Analyze
# ----------------------------

@app.post("/analyze")
def analyze(request: AnalyzeRequest, db: Session = Depends(get_db)):

    prompt = f"""
You are an expert cybersecurity analyst.

Analyze the following email, SMS, or URL for phishing.

Return ONLY valid JSON.

Format:

{{
  "risk": "...",
  "confidence": "Return a percentage such as 95%, 82%, or 30%",
  "reason": [
      "...",
      "...",
      "..."
  ],
  "recommendation": "..."
}}

Message:

{request.text}
"""

    result = call_gemini_with_retry(prompt)

    if result is None:
        result = detect_phishing(request.text)
        result["analysis_source"] = "Rule-Based Detector"
    else:
        result["analysis_source"] = "Gemini AI"

    # Save to Database

    crud.save_analysis(
        db=db,
        message=request.text,
        risk=result["risk"],
        confidence=result["confidence"],
        recommendation=result["recommendation"],
        reason=result.get("reason", []),
        analysis_source=result.get("analysis_source", ""),
    )

    return result

# ----------------------------
# History
# ----------------------------

@app.get("/history", response_model=list[AnalysisResponse])
def history(db: Session = Depends(get_db)):

    data = crud.get_analysis(db)

    return data

# ----------------------------
# Download Request Model
# ----------------------------

class DownloadRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=5000,
        description="The original message that was analyzed.",
    )
    risk: str
    confidence: str
    reasons: List[str]
    recommendation: str
    source: str

# ----------------------------
# Download PDF
# ----------------------------

@app.post("/download-report")
def download_report(request: DownloadRequest, background_tasks: BackgroundTasks):

    data = {
        "message":        request.message,
        "risk":           request.risk,
        "confidence":     request.confidence,
        "reason":         request.reasons,
        "recommendation": request.recommendation,
        "source":         request.source,
        "timestamp":      datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
    }

    file = generate_report(data)

    background_tasks.add_task(os.remove, file)

    return FileResponse(
        file,
        media_type="application/pdf",
        filename="PhishGuard_Report.pdf",
        background=background_tasks,
    )