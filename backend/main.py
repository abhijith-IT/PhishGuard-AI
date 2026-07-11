from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import models
import crud

from detector import detect_phishing

from database import SessionLocal
from database import engine

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
    return detect_phishing(request.text)


@app.get("/history")
def history():

    db = SessionLocal()

    data = crud.get_analysis(db)

    db.close()

    return data