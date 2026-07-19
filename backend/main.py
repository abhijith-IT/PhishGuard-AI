from dotenv import load_dotenv

load_dotenv(override=True)  # Must run before any os.getenv() calls

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
    evidence_score: int
    recommendation: str
    reason: list[dict]
    analysis_source: str

cors_origins_str = os.getenv("CORS_ORIGINS", "")
origins = [origin.strip() for origin in cors_origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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

Determine whether it contains any of the following phishing indicators:
Low Severity:
- Generic sender
- External link
- Suspicious attachment
- Unknown domain
- Grammar issues

Medium Severity:
- Suspicious URL (Medium unless it explicitly delivers malware or fake login)
- Urgent language
- Unusual request
- Spoofed display name
- Fear tactics

High Severity (Requires strong evidence):
- Credential request (Asking for passwords/logins)
- Fake login page (Link to a credential harvesting site)
- Fake domain (e.g., paypa1.com instead of paypal.com)
- Brand impersonation (Pretending to be Microsoft, Chase, etc.)
- Account suspension (Threatening account deletion/lockout)
- Financial fraud (Requesting wire transfers or gift cards)
- Cryptocurrency scam (Requesting Bitcoin/crypto)
- Malware indicators (Links to executable files or explicitly malicious scripts, NOT regular PDFs)

Return ONLY valid JSON. Do not include markdown or text outside the JSON.

{{
    "indicators": {{
        "generic_sender": true | false,
        "external_link": true | false,
        "suspicious_attachment": true | false,
        "unknown_domain": true | false,
        "grammar_issues": true | false,
        "suspicious_url": true | false,
        "urgent_language": true | false,
        "unusual_request": true | false,
        "spoofed_display_name": true | false,
        "fear_tactics": true | false,
        "credential_request": true | false,
        "fake_login_page": true | false,
        "fake_domain": true | false,
        "brand_impersonation": true | false,
        "account_suspension": true | false,
        "financial_fraud": true | false,
        "cryptocurrency_scam": true | false,
        "malware_indicators": true | false
    }},
    "specific_observations": [
        "Observation 1 about the email...",
        "Observation 2 about the email..."
    ],
    "recommendation": "One clear action the user should take"
}}

Rules:
- Identify active indicators and set them to true, else false.
- Under "specific_observations", provide 1-2 concise observations about the text.
- Recommendation must be concise.
- Do not include confidence or risk in your response.

Message:

{request.text}
"""

    ai_result = analyze_with_ai(prompt)

    if ai_result is None:
        fallback_res = detect_phishing(request.text)
        fallback_reasons = fallback_res["reason"]
        
        # Convert simple strings to finding objects for fallback
        findings = []
        for r in fallback_reasons:
            if "Low" in fallback_res["risk"]:
                findings.append({"text": r, "type": "safe"})
            else:
                findings.append({"text": r, "type": "warning"})
                
        result = {
            "risk": fallback_res["risk"],
            "confidence": fallback_res["confidence"],
            "evidence_score": int(fallback_res["confidence"].replace("%", "")) if "%" in fallback_res["confidence"] else 0,
            "recommendation": fallback_res["recommendation"],
            "reason": findings,
            "analysis_source": "Rule-Based Detector",
        }
    else:
        indicators = ai_result.get("indicators", {})
        
        # Low: 3-8, Med: 10-15, High: 25-35
        indicator_weights = {
            "generic_sender": 5,
            "external_link": 5,
            "suspicious_attachment": 8,
            "unknown_domain": 5,
            "grammar_issues": 3,
            "suspicious_url": 15,
            "urgent_language": 10,
            "unusual_request": 10,
            "spoofed_display_name": 12,
            "fear_tactics": 10,
            "credential_request": 35,
            "fake_login_page": 35,
            "fake_domain": 30,
            "brand_impersonation": 30,
            "account_suspension": 25,
            "financial_fraud": 30,
            "cryptocurrency_scam": 30,
            "malware_indicators": 35
        }
        
        raw_sum = sum(weight for key, weight in indicator_weights.items() if indicators.get(key, False))
        
        high_severity = [
            "credential_request", "fake_login_page", "fake_domain", 
            "brand_impersonation", "account_suspension", 
            "financial_fraud", "cryptocurrency_scam", "malware_indicators"
        ]
        
        medium_severity = [
            "suspicious_url", "urgent_language", "unusual_request", "spoofed_display_name", "fear_tactics"
        ]
        
        low_severity = [
            "generic_sender", "external_link", "suspicious_attachment", "unknown_domain", "grammar_issues"
        ]
        
        severe_count = sum(1 for ind in high_severity if indicators.get(ind, False))
        
        synergy_bonus = 0
        if severe_count >= 2:
            synergy_bonus = 20
            
        negative_weights = {
            "credential_request": 3,
            "urgent_language": 2,
            "suspicious_url": 2,
            "financial_fraud": 3,
            "generic_sender": 2
        }
        negative_sum = sum(weight for key, weight in negative_weights.items() if not indicators.get(key, False))
        
        evidence_score = max(0, raw_sum + synergy_bonus - negative_sum)
        score = min(100, evidence_score) # 1-to-1 scaling up to 100
            
        if score >= 90 and severe_count >= 2:
            calculated_risk = "Critical"
        elif score >= 80:
            calculated_risk = "High"
        elif score >= 60:
            calculated_risk = "Medium"
        elif score >= 40:
            calculated_risk = "Low-Medium"
        else:
            calculated_risk = "Low"
            
        # Deterministically build findings
        generated_findings = []
        
        # Threats (Critical)
        for ind in high_severity:
            if indicators.get(ind, False):
                generated_findings.append({"text": f"Detected high-risk indicator: {ind.replace('_', ' ').title()}", "type": "critical"})
                
        # Warnings
        for ind in medium_severity + low_severity:
            if indicators.get(ind, False):
                generated_findings.append({"text": f"Detected indicator: {ind.replace('_', ' ').title()}", "type": "warning"})
                
        # Passed Checks (Safe)
        safe_checks = [
            ("credential_request", "No credential requests detected"),
            ("fake_login_page", "No fake login pages detected"),
            ("malware_indicators", "No malware delivery indicators found"),
            ("financial_fraud", "No financial fraud detected")
        ]
        for ind, safe_text in safe_checks:
            if not indicators.get(ind, False):
                generated_findings.append({"text": safe_text, "type": "safe"})
                
        # Append LLM observations as Info
        observations = ai_result.get("specific_observations", [])
        for obs in observations:
            generated_findings.append({"text": obs, "type": "info"})

        result: AnalysisResult = {
            "risk": calculated_risk,
            "confidence": str(score),
            "evidence_score": score,
            "recommendation": cast(str, ai_result.get("recommendation", "")),
            "reason": generated_findings,
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
        analysis_version="2.0",
    )

    return result

# ----------------------------
# History
# ----------------------------

@app.get("/history", response_model=list[AnalysisResponse])
def history(db: Session = Depends(get_db)):
    return crud.get_analysis(db)

@app.delete("/history")
def clear_history(db: Session = Depends(get_db)):
    crud.delete_all_history(db)
    return {"message": "History cleared successfully"}

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