from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import models
import crud

from detector import detect_phishing

from database import SessionLocal
from database import engine

from fastapi.responses import FileResponse
from report import generate_report

app = FastAPI()

models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    text: str


@app.get("/")
def home():
    return {"message": "PhishGuard Backend Running"}


@app.post("/analyze")
def analyze(request: AnalyzeRequest):

    result = detect_phishing(request.text)

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


@app.get("/history")
def history():

    db = SessionLocal()

    data = crud.get_analysis(db)

    db.close()

    return data
@app.get("/download-report")
def download_report():

    data = {
        "risk": "Sample Risk",
        "confidence": "95%",
        "reason": [
            "Suspicious URL",
            "Password request",
            "Urgent language"
        ],
        "recommendation": "Do not click the link."
    }

    file = generate_report(data)

    return FileResponse(
        file,
        media_type="application/pdf",
        filename="PhishGuard_Report.pdf"
    )