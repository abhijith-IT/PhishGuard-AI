from pydantic import BaseModel, Field, field_validator, model_validator
import json

class Finding(BaseModel):
    text: str
    type: str

class AnalysisCreate(BaseModel):
    message: str
    risk: str
    confidence: str
    evidence_score: int | None = None
    recommendation: str
    reason: list[Finding] = Field(default_factory=list)
    analysis_source: str | None = None

from typing import Any

class AnalysisResponse(AnalysisCreate):
    id: int
    analysis_version: str | None = None

    class Config:
        from_attributes = True

    @field_validator("analysis_source", mode="before")
    @classmethod
    def deserialize_source(cls, v):
        if isinstance(v, str) and v.startswith("{"):
            try:
                parsed = json.loads(v)
                return parsed.get("source", v)
            except:
                return v
        return v
        
    @model_validator(mode="before")
    @classmethod
    def extract_version(cls, data: Any):
        if hasattr(data, '__dict__'):
            data_dict = {k: getattr(data, k) for k in data.__table__.columns.keys()}
        elif isinstance(data, dict):
            data_dict = data.copy()
        else:
            data_dict = dict(data)
            
        source = data_dict.get("analysis_source")
        if isinstance(source, str) and source.startswith("{"):
            try:
                parsed = json.loads(source)
                data_dict["analysis_version"] = parsed.get("version")
                # We don't overwrite analysis_source here, the field_validator does it
            except:
                pass
        return data_dict

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