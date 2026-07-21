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
from typing import List

import models
import crud
from schemas import AnalysisResponse

from sqlalchemy.orm import Session

from detector import detect_phishing, extract_deterministic_indicators
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
# Constants: Attack Classification
# ----------------------------

CRITICAL_ATTACKS = [
    "Credential Harvesting", "Malware Delivery", "Financial Fraud",
    "Business Email Compromise", "Remote Access Scam", "MFA Phishing"
]

HIGH_ATTACKS = [
    "Brand Impersonation", "Delivery Scam", "Invoice Scam",
    "QR Code Phishing", "Crypto Scam", "Tech Support Scam"
]

CRITICAL_INDICATORS = [
    "credential_request", "fake_login_page", "malware_delivery",
    "mfa_bypass", "business_email_compromise", "wire_transfer_request"
]

HIGH_INDICATORS = [
    "brand_impersonation", "suspicious_domain", "external_link",
    "delivery_scam", "invoice_scam", "crypto_scam"
]

MEDIUM_INDICATORS = [
    "urgency", "fear_tactics", "generic_greeting",
    "spoofed_display_name", "unusual_request"
]

# ----------------------------
# Corroboration Matrix
# Maps each attack type to required evidence indicators.
# At least ONE of the listed indicators must be present.
# ----------------------------

CORROBORATION_MATRIX = {
    "Credential Harvesting": ["credential_request", "fake_login_page", "mfa_bypass"],
    "Malware Delivery": ["malware_delivery"],
    "Financial Fraud": ["wire_transfer_request", "business_email_compromise", "invoice_scam"],
    "Business Email Compromise": ["business_email_compromise", "wire_transfer_request"],
    "Remote Access Scam": ["unusual_request", "fear_tactics", "external_link"],
    "MFA Phishing": ["mfa_bypass", "credential_request"],
    "Brand Impersonation": ["brand_impersonation"],
    "Delivery Scam": ["delivery_scam"],
    "Invoice Scam": ["invoice_scam"],
    "QR Code Phishing": ["external_link"],
    "Crypto Scam": ["crypto_scam"],
    "Tech Support Scam": ["unusual_request", "fear_tactics", "external_link"],
}

# ----------------------------
# Home
# ----------------------------

@app.get("/")
def home():
    return {"message": "PhishGuard Backend Running"}

# ============================================================
# STAGE 1: AI Hypothesis
# STAGE 1.5: Deterministic Evidence Extraction
# STAGE 2: Deterministic Validation (Hybrid)
# STAGE 3: Risk Engine
# STAGE 4: Consistency Validator
# STAGE 5: Post-Validation Summary Generation
# STAGE 6: Response Assembly
# ============================================================

def _validate_attack(possible_attack: str, indicators: dict) -> tuple[str, str, str]:
    """
    Stage 2: Validate whether the AI's proposed attack is supported by evidence.
    Returns (validated_attack, validation_status, validation_notes).
    """
    if not possible_attack or possible_attack == "None":
        return "None", "no_threat", "AI did not identify a primary attack vector."

    required = CORROBORATION_MATRIX.get(possible_attack)

    if required is None:
        # Unknown attack type from AI — treat as unverified
        has_any_indicator = any(indicators.get(ind, False) for ind in CRITICAL_INDICATORS + HIGH_INDICATORS)
        if has_any_indicator:
            return possible_attack, "unverified", f"AI proposed '{possible_attack}' which is not in the corroboration matrix, but supporting indicators are present."
        return "Suspicious Communication", "downgraded", f"AI proposed '{possible_attack}' but no supporting evidence was found in the extracted indicators."

    has_evidence = any(indicators.get(ind, False) for ind in required)

    if has_evidence:
        matched = [ind for ind in required if indicators.get(ind, False)]
        return possible_attack, "confirmed", f"Attack hypothesis '{possible_attack}' confirmed by evidence: {', '.join(ind.replace('_', ' ').title() for ind in matched)}."
    else:
        return "Suspicious Communication", "downgraded", f"AI proposed '{possible_attack}' but required evidence ({', '.join(ind.replace('_', ' ').title() for ind in required)}) was not detected. Downgraded to Suspicious Communication."


def _calculate_risk(validated_attack: str, indicators: dict) -> tuple[str, int]:
    """
    Stage 3: Calculate risk from validated attack + evidence.
    """
    if validated_attack in CRITICAL_ATTACKS:
        return "Critical", 95

    if validated_attack in HIGH_ATTACKS:
        return "High", 80

    if validated_attack == "Suspicious Communication":
        return "Medium", 55

    # No attack but check for medium-severity behavioral indicators
    med_count = sum(1 for ind in MEDIUM_INDICATORS if indicators.get(ind, False))
    if med_count >= 1:
        return "Medium", 50

    return "Low", 10

def _consistency_validator(risk: str, validated_attack: str | None, confidence: int, indicators: dict) -> tuple[str, str | None, int]:
    """
    Stage 4: Catch impossible combinations and force downgrade or correction.
    """
    has_threat_inds = any(indicators.get(ind, False) for ind in CRITICAL_INDICATORS + HIGH_INDICATORS)
    
    # Low Risk + Attack Type -> Downgrade Attack
    if risk == "Low" and validated_attack and validated_attack != "None":
        validated_attack = None
        
    # No Primary Attack + Critical/High Risk -> Downgrade Risk
    if (not validated_attack or validated_attack == "None") and risk in ["Critical", "High"]:
        risk = "Medium" if has_threat_inds else "Low"
        
    # No Indicators + High Confidence -> Lower Confidence
    if not has_threat_inds and confidence > 60:
        confidence = 50
        
    # Legitimate Summary (implied by Low Risk) + High Risk handled above (risk drives summary)
    
    return risk, validated_attack, confidence


def _build_findings(indicators: dict) -> list[dict]:
    """
    Build the deterministic findings list from extracted indicators.
    """
    findings = []

    for ind in CRITICAL_INDICATORS:
        if indicators.get(ind, False):
            findings.append({"text": f"{ind.replace('_', ' ').title()} detected", "type": "critical"})

    for ind in HIGH_INDICATORS:
        if indicators.get(ind, False):
            findings.append({"text": f"{ind.replace('_', ' ').title()} detected", "type": "warning"})

    for ind in MEDIUM_INDICATORS:
        if indicators.get(ind, False):
            findings.append({"text": f"{ind.replace('_', ' ').title()} detected", "type": "warning"})

    safe_checks = [
        ("credential_request", "No credential requests"),
        ("fake_login_page", "No fake login pages"),
        ("malware_delivery", "No malware delivery indicators"),
        ("business_email_compromise", "No BEC patterns"),
    ]
    for ind, safe_text in safe_checks:
        if not indicators.get(ind, False):
            findings.append({"text": safe_text, "type": "safe"})

    return findings


def _build_detected_categories(indicators: dict, risk: str) -> list[str]:
    """
    Build detected categories deterministically from validated indicators.
    """
    if risk == "Low":
        return ["Text Analysis"]

    categories = []
    if indicators.get("credential_request") or indicators.get("fake_login_page") or indicators.get("mfa_bypass"):
        categories.append("Credential Theft")
    if indicators.get("brand_impersonation"):
        categories.append("Impersonation")
    if indicators.get("external_link") or indicators.get("suspicious_domain"):
        categories.append("URL")
    if indicators.get("urgency") or indicators.get("fear_tactics"):
        categories.append("Urgency")
    if indicators.get("malware_delivery"):
        categories.append("Malware")
    if indicators.get("wire_transfer_request") or indicators.get("invoice_scam"):
        categories.append("Financial")
    if indicators.get("delivery_scam"):
        categories.append("Delivery")
    if indicators.get("crypto_scam"):
        categories.append("Crypto")

    return categories if categories else ["Text Analysis"]


def _build_supporting_indicators(indicators: dict, risk: str) -> list[str]:
    """
    Build the supporting indicators list for the Detection Summary card.
    """
    if risk == "Low":
        return ["Standard text analysis passed", "No deceptive patterns found"]

    result = []
    all_indicators = CRITICAL_INDICATORS + HIGH_INDICATORS + MEDIUM_INDICATORS
    for ind in all_indicators:
        if indicators.get(ind, False):
            result.append(ind.replace("_", " ").title())

    return result[:6] if result else ["No specific indicators triggered"]


def _generate_executive_summary(validated_attack: str | None, risk: str, validation_status: str, target_brand: str | None, ai_summary_draft: str | None = None) -> str:
    """
    Stage 5: Generate executive summary AFTER validation.
    If confirmed, we can retain the AI's draft summary.
    If downgraded/unverified, we throw it away and build a deterministic one.
    """
    if validation_status == "confirmed" and ai_summary_draft:
        return ai_summary_draft

    if risk == "Low":
        return "This analysis indicates no significant threat. The content appears legitimate based on the evaluated indicators. Proceed with normal caution."

    if risk == "Medium":
        if validated_attack == "Suspicious Communication":
            return "This analysis detected suspicious behavioral patterns but insufficient evidence to confirm a specific attack type. The content should be treated with caution. Verify the sender through official channels before taking any action."
        return "This analysis detected mild suspicious indicators. While no definitive attack was confirmed, exercise caution and verify the sender's identity."

    # High or Critical
    brand_clause = f" impersonating {target_brand}" if target_brand else ""
    if risk == "Critical":
        return f"This analysis confirmed a {validated_attack} attack{brand_clause} with strong supporting evidence. This is a high-severity threat. Do not interact with this message. Report it to your security team immediately."
    else:
        return f"This analysis identified a {validated_attack} attack{brand_clause}. While the threat is significant, the evidence level places it below critical severity. Avoid interacting with any links or attachments and verify through official channels."


def _generate_confidence_explanation(risk: str, validation_status: str, validation_notes: str, findings: list[dict]) -> str:
    """
    Generate a human-readable confidence explanation based on validation outcome.
    """
    threats = [f for f in findings if f["type"] in ("critical", "warning")]
    safe = [f for f in findings if f["type"] == "safe"]

    if risk == "Low":
        return f"The engine classified this content as safe. {len(safe)} standard security checks passed with no anomalies detected."

    if validation_status == "confirmed":
        return f"The AI hypothesis was confirmed by deterministic evidence validation. {len(threats)} threat indicator(s) corroborate the classification. {validation_notes}"

    if validation_status == "downgraded":
        return f"The AI proposed a more severe classification, but evidence validation found insufficient proof. The threat level was downgraded. {validation_notes}"

    return f"The classification is based on {len(threats)} detected indicator(s). {validation_notes}"


def _generate_recommended_actions(risk: str, validated_attack: str | None) -> list[str]:
    """
    Generate recommended response actions based on validated attack and risk.
    """
    if risk == "Low":
        return ["Proceed with normal operations.", "Monitor for future anomalies."]

    actions = []

    if validated_attack in ("Credential Harvesting", "MFA Phishing"):
        actions.append("Do not enter any credentials or verification codes.")
        actions.append("Verify sender identity via a separate, trusted channel.")
    elif validated_attack == "Malware Delivery":
        actions.append("Do not download or open any attachments.")
    elif validated_attack in ("Financial Fraud", "Business Email Compromise"):
        actions.append("Do not transfer funds or approve any financial requests.")
        actions.append("Verify the request through your organization's financial approval process.")
    elif validated_attack == "Brand Impersonation":
        actions.append("Do not click any embedded links.")
        actions.append("Navigate to the official website directly to verify.")
    else:
        actions.append("Avoid interacting with any links or attachments in this message.")

    actions.append("Report this message to your IT security team.")
    actions.append("Delete the message from your inbox.")

    return actions[:3]


# ----------------------------
# Analyze Endpoint
# ----------------------------

@app.post("/analyze")
def analyze(request: AnalyzeRequest, db: Session = Depends(get_db)):

    # ─── STAGE 1: AI Hypothesis ───

    prompt = f"""
You are an expert cybersecurity analyst specializing in phishing detection.

Analyze the following email, SMS, or URL.

Your task is to propose a HYPOTHESIS about the attacker's intent. Your output will be validated by a deterministic engine. Be precise and honest — only flag indicators you are confident about.

Determine whether it contains any of the following phishing indicators:

Critical Severity (Requires definitive proof of malicious intent):
- Credential Request (Asking for passwords, logins, or MFA codes)
- Fake Login Page (Link to a credential harvesting site)
- Malware Delivery (Links to executable files or explicitly malicious scripts, NOT regular PDFs)
- MFA Bypass (Attempting to steal or bypass Multi-Factor Authentication)
- Business Email Compromise (Targeted executive impersonation for financial gain)
- Wire Transfer Request (Explicit request to wire money to a new account)

High Severity (Strong indicators of deception):
- Brand Impersonation (Pretending to be a known entity like Microsoft, Chase, etc.)
- Suspicious Domain (e.g., paypa1.com instead of paypal.com)
- External Link (Links to external, unaffiliated domains)
- Delivery Scam (Fake package tracking or delivery issues)
- Invoice Scam (Fake invoices requiring immediate action)
- Crypto Scam (Requesting Bitcoin or cryptocurrency)

Medium Severity (Suspicious but could be legitimate):
- Urgency (Creating artificial time pressure)
- Fear Tactics (Threatening account suspension or legal action)
- Generic Greeting (e.g., "Dear Customer" instead of a name)
- Spoofed Display Name (Display name does not match email address domain)
- Unusual Request (Asking the user to do something out of the ordinary)

Return ONLY valid JSON. Do not include markdown or text outside the JSON.

{{
    "possible_attack": "Credential Harvesting | Business Email Compromise | Brand Impersonation | Delivery Scam | Financial Fraud | Malware Delivery | Remote Access Scam | MFA Phishing | Tech Support Scam | Invoice Scam | QR Code Phishing | Crypto Scam | None",
    "attack_confidence": 85,
    "executive_summary": "A 2-3 sentence executive summary explaining what the attacker is doing and why. Keep it professional.",
    "indicators": {{
        "credential_request": true | false,
        "fake_login_page": true | false,
        "malware_delivery": true | false,
        "mfa_bypass": true | false,
        "business_email_compromise": true | false,
        "wire_transfer_request": true | false,
        "brand_impersonation": true | false,
        "suspicious_domain": true | false,
        "external_link": true | false,
        "delivery_scam": true | false,
        "invoice_scam": true | false,
        "crypto_scam": true | false,
        "urgency": true | false,
        "fear_tactics": true | false,
        "generic_greeting": true | false,
        "spoofed_display_name": true | false,
        "unusual_request": true | false
    }},
    "specific_observations": [
        "Observation 1 about the email...",
        "Observation 2 about the email..."
    ],
    "recommendation": "One clear action the user should take",
    "target_brand": "Specific organization being impersonated or null"
}}

Rules:
- First, determine possible_attack. What is the attacker's true intent?
- Set attack_confidence to your honest confidence (0-100) in the possible_attack.
- Provide a draft executive summary.
- Only set indicators to true if you see concrete evidence in the text.
- Under "specific_observations", provide 1-2 concise observations about the text.
- Recommendation must be concise.
- If the message is clearly legitimate, set possible_attack to "None" and all indicators to false.

Message:

{request.text}
"""

    start_time = time.time()
    
    # ─── STAGE 1: AI Analysis ───
    try:
        ai_result = analyze_with_ai(prompt)
        if not isinstance(ai_result, dict):
            ai_result = None
    except Exception as e:
        logger.error(f"AI Provider failed or returned invalid JSON: {e}")
        ai_result = None
        
    processing_time = int((time.time() - start_time) * 1000)
    current_timestamp = datetime.now(timezone.utc).isoformat()

    # ─── STAGE 2: Deterministic Evidence Extraction ───
    det_indicators = extract_deterministic_indicators(request.text)

    if ai_result is None:
        # ─── FALLBACK: Rule-based detector ───
        fallback_res = detect_phishing(request.text)
        fallback_reasons = fallback_res["reason"]

        findings = []
        for r in fallback_reasons:
            if fallback_res["risk"] == "Low":
                findings.append({"text": r, "type": "safe"})
            else:
                findings.append({"text": r, "type": "warning"})

        risk = fallback_res["risk"]
        conf = fallback_res["confidence"]

        result = {
            "risk": risk,
            "confidence": conf,
            "recommendation": fallback_res["recommendation"],
            "reason": findings,
            "analysis_source": "Rule-Based Detector",
            "possible_attack": None,
            "validated_attack": None,
            "attack_confidence": None,
            "validation_status": "fallback",
            "validation_notes": "AI provider was unavailable. Results are from the rule-based fallback detector.",
            "executive_summary": "AI analysis was unavailable. A basic rule-based scan was performed. Results may be less accurate than AI-powered analysis.",
            "confidence_explanation": f"Classification is based on keyword matching. {len(fallback_reasons)} keyword(s) matched against known phishing patterns.",
            "detected_categories": ["Rule-Based Scan"],
            "recommended_actions": [fallback_res["recommendation"]],
            "target_brand": None,
            "attack_type": None,
        }
    else:
        # ─── STAGE 1: Extract AI hypothesis ───
        possible_attack = ai_result.get("possible_attack", "None")
        attack_confidence = ai_result.get("attack_confidence", 0)
        ai_indicators = ai_result.get("indicators", {})
        ai_recommendation = ai_result.get("recommendation", "Exercise caution.")
        ai_summary_draft = ai_result.get("executive_summary", "")
        target_brand = ai_result.get("target_brand")

        # ─── STAGE 3: Validation ───
        # AI MUST NEVER validate itself. Validate using ONLY deterministic evidence.
        validated_attack, validation_status, validation_notes = _validate_attack(possible_attack, det_indicators)

        # ─── STAGE 4: Risk Engine ───
        calculated_risk, score = _calculate_risk(validated_attack, det_indicators)

        # Adjust confidence based on validation outcome
        if validation_status == "confirmed":
            final_confidence = min(attack_confidence, 99)
        elif validation_status == "downgraded":
            final_confidence = min(attack_confidence, 50)
        else:
            final_confidence = score

        # ─── STAGE 5: Consistency Validation ───
        calculated_risk, validated_attack, final_confidence = _consistency_validator(
            calculated_risk, validated_attack, final_confidence, det_indicators
        )

        # ─── STAGE 6: Response Assembly ───
        findings = _build_findings(det_indicators)

        # Append AI observations as info
        observations = ai_result.get("specific_observations", [])
        for obs in observations:
            findings.append({"text": obs, "type": "info"})

        detected_categories = _build_detected_categories(det_indicators, calculated_risk)
        supporting_indicators = _build_supporting_indicators(det_indicators, calculated_risk)
        executive_summary = _generate_executive_summary(validated_attack, calculated_risk, validation_status, target_brand, ai_summary_draft)
        confidence_explanation = _generate_confidence_explanation(calculated_risk, validation_status, validation_notes, findings)
        recommended_actions = _generate_recommended_actions(calculated_risk, validated_attack)

        # Use the AI recommendation only if validated; otherwise use deterministic
        final_recommendation = ai_recommendation if validation_status == "confirmed" else recommended_actions[0] if recommended_actions else "Exercise caution."

        # ─── STAGE 6: Response Assembly ───
        result = {
            "risk": calculated_risk,
            "confidence": final_confidence,
            "recommendation": final_recommendation,
            "reason": findings,
            "analysis_source": "Groq AI",
            "possible_attack": possible_attack if possible_attack != "None" else None,
            "validated_attack": validated_attack if validated_attack not in ("None", None) else None,
            "attack_confidence": attack_confidence,
            "validation_status": validation_status,
            "validation_notes": validation_notes,
            "executive_summary": executive_summary,
            "confidence_explanation": confidence_explanation,
            "detected_categories": detected_categories,
            "recommended_actions": recommended_actions,
            "target_brand": target_brand,
            "attack_type": validated_attack if validated_attack not in ("None", None) else None, # Alias for backward compatibility
        }

    # ─── PERSISTENCE ───
    saved_obj = crud.save_analysis(
        db=db,
        message=request.text,
        risk=str(result.get("risk", "Low")),
        confidence=int(str(result.get("confidence", 0))),
        recommendation=str(result.get("recommendation", "")),
        reason=result.get("reason"),  # type: ignore
        analysis_source=result.get("analysis_source"),  # type: ignore
        analysis_version="3.0",
        timestamp=current_timestamp,
        processing_time=processing_time,
        possible_attack=result.get("possible_attack"),  # type: ignore
        validated_attack=result.get("validated_attack"),  # type: ignore
        attack_confidence=result.get("attack_confidence"),  # type: ignore
        validation_status=result.get("validation_status"),  # type: ignore
        validation_notes=result.get("validation_notes"),  # type: ignore
        executive_summary=result.get("executive_summary"),  # type: ignore
        confidence_explanation=result.get("confidence_explanation"),  # type: ignore
        detected_categories=result.get("detected_categories"),  # type: ignore
        recommended_actions=result.get("recommended_actions"),  # type: ignore
        target_brand=result.get("target_brand"),  # type: ignore
    )

    logger.info("--- /analyze complete ---")
    logger.info(f"Possible: {result.get('possible_attack')} → Validated: {result.get('validated_attack')} [{result.get('validation_status')}]")
    logger.info(f"Risk: {result['risk']} | Confidence: {result['confidence']}")

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