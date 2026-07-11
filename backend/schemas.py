from pydantic import BaseModel

class AnalysisCreate(BaseModel):
    message: str
    risk: str
    confidence: str
    recommendation: str

class AnalysisResponse(AnalysisCreate):
    id: int

    class Config:
        from_attributes = True