from dotenv import load_dotenv

load_dotenv()  # Must run before any os.getenv() calls

from fastapi import FastAPI, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from ai_provider import analyze_with_ai
import os
import json
import logging
import time
from datetime import datetime, timezone
from typing import List, TypedDict, cast

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

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise RuntimeError(
        "GROQ_API_KEY is not set."
    )

class AnalysisResult(TypedDict):
    risk: str
    confidence: str
    recommendation: str
    reason: list[str]
    analysis_source: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
    ],
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
You are an expert cybersecurity analyst specializing in phishing detection.

Analyze the following email, SMS, or URL.

Determine whether it contains:
- Phishing
- Scam
- Credential theft
- Brand impersonation
- Fake login pages
- Suspicious URLs
- Social engineering
- Urgency tactics
- Financial fraud

Return ONLY valid JSON.

{{
    "risk":"Low | Medium | High",
    "confidence":"0-100%",
    "reason":[
        "...",
        "...",
        "..."
    ],
    "recommendation":"One clear action the user should take"
}}

Rules:
- Give exactly 3 reasons.
- Confidence must be a percentage.
- Recommendation must be concise.
- Do not include markdown.
- Do not include explanations outside the JSON.

Message:

{request.text}
"""

    ai_result = analyze_with_ai(prompt)

    if ai_result is None:
        result: AnalysisResult = {
            "risk": detect_phishing(request.text)["risk"],
            "confidence": detect_phishing(request.text)["confidence"],
            "recommendation": detect_phishing(request.text)["recommendation"],
            "reason": detect_phishing(request.text)["reason"],
            "analysis_source": "Rule-Based Detector",
        }
    else:
        result = {
    "risk": cast(str, ai_result["risk"]),
    "confidence": cast(str, ai_result["confidence"]),
    "recommendation": cast(str, ai_result["recommendation"]),
    "reason": cast(list[str], ai_result.get("reason", [])),
    "analysis_source": "Groq AI",
}

    crud.save_analysis(
        db=db,
        message=request.text,
        risk=result["risk"],
        confidence=result["confidence"],
        recommendation=result["recommendation"],
        reason=result["reason"],
        analysis_source=result["analysis_source"],
    )

    return result
# ----------------------------
# History
# ----------------------------

@app.get("/history", response_model=list[AnalysisResponse])
def history(db: Session = Depends(get_db)):
    return crud.get_analysis(db)

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