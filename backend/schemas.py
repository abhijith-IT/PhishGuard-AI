from pydantic import BaseModel, Field, field_validator
import json


class Finding(BaseModel):
    text: str
    type: str


class AnalysisCreate(BaseModel):
    message: str
    risk: str
    confidence: int
    recommendation: str
    reason: list[Finding] = Field(default_factory=list)
    analysis_source: str | None = None
    analysis_version: str | None = None
    timestamp: str | None = None
    processing_time: int | None = None
    possible_attack: str | None = None
    validated_attack: str | None = None
    attack_confidence: int | None = None
    validation_status: str | None = None
    validation_notes: str | None = None
    executive_summary: str | None = None
    confidence_explanation: str | None = None
    detected_categories: list[str] = Field(default_factory=list)
    supporting_indicators: list[str] = Field(default_factory=list)
    recommended_actions: list[str] = Field(default_factory=list)
    target_brand: str | None = None
    attack_type: str | None = None  # API-level alias for backward compatibility


class AnalysisResponse(AnalysisCreate):
    id: int

    class Config:
        from_attributes = True

    @field_validator("reason", mode="before")
    @classmethod
    def deserialize_reason(cls, v):
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    res = []
                    for item in parsed:
                        if isinstance(item, str):
                            res.append({"text": item, "type": "warning"})
                        else:
                            res.append(item)
                    return res
                return parsed
            except (json.JSONDecodeError, TypeError):
                return []

        if isinstance(v, list):
            res = []
            for item in v:
                if isinstance(item, str):
                    res.append({"text": item, "type": "warning"})
                else:
                    res.append(item)
            return res

        return v or []

    @field_validator("detected_categories", mode="before")
    @classmethod
    def deserialize_detected_categories(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return []
        return v or []

    @field_validator("supporting_indicators", mode="before")
    @classmethod
    def deserialize_supporting_indicators(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return []
        return v or []

    @field_validator("recommended_actions", mode="before")
    @classmethod
    def deserialize_recommended_actions(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return []
        return v or []