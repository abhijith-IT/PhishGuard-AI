from pydantic import BaseModel, Field, field_validator
import json

class AnalysisCreate(BaseModel):
    message: str
    risk: str
    confidence: str
    recommendation: str
    reason: list[str] = Field(default_factory=list)
    analysis_source: str | None = None

class AnalysisResponse(AnalysisCreate):
    id: int

    class Config:
        from_attributes = True

    @field_validator("reason", mode="before")
    @classmethod
    def deserialize_reason(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return []
        return v or []