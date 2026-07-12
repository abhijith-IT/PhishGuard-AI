from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai

import os
import json

import models
import crud

from detector import detect_phishing
from database import SessionLocal, engine
from fastapi.responses import FileResponse
from report import generate_report

# ----------------------------
# App Initialization
# ----------------------------

app = FastAPI()

models.Base.metadata.create_all(bind=engine)

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# ----------------------------
# CORS
# ----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Request Model
# ----------------------------

class AnalyzeRequest(BaseModel):
    text: str

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
def analyze(request: AnalyzeRequest):

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

    try:

        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt,
        )

        text = response.text.strip()

        if text.startswith("```json"):
            text = text.replace("```json", "").replace("```", "").strip()

        elif text.startswith("```"):
            text = text.replace("```", "").strip()

        result = json.loads(text)

    except Exception as e:

        print("Gemini Error:", e)

        # Fallback to rule-based detector
        result = detect_phishing(request.text)

    # Save to Database

    db = SessionLocal()

    crud.save_analysis(
        db=db,
        message=request.text,
        risk=result["risk"],
        confidence=result["confidence"],
        recommendation=result["recommendation"],
    )

    db.close()

    return result

# ----------------------------
# History
# ----------------------------

@app.get("/history")
def history():

    db = SessionLocal()

    data = crud.get_analysis(db)

    db.close()

    return data

# ----------------------------
# Download PDF
# ----------------------------

@app.get("/download-report")
def download_report():

    data = {
        "risk": "Sample Risk",
        "confidence": "95%",
        "reason": [
            "Suspicious URL",
            "Password Request",
            "Urgent Language"
        ],
        "recommendation": "Do not click any links."
    }

    file = generate_report(data)

    return FileResponse(
        file,
        media_type="application/pdf",
        filename="PhishGuard_Report.pdf"
    )