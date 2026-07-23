from sqlalchemy.orm import Session
import models
import json


def get_analysis(db: Session):
    return db.query(models.Analysis).all()


def delete_all_history(db: Session):
    try:
        db.query(models.Analysis).delete()
        db.commit()
    except Exception as e:
        db.rollback()
        raise e


def delete_analysis(db: Session, analysis_id: int):
    try:
        db.query(models.Analysis).filter(models.Analysis.id == analysis_id).delete()
        db.commit()
    except Exception as e:
        db.rollback()
        raise e


def save_analysis(
    db: Session,
    message: str,
    risk: str,
    confidence: int,
    recommendation: str,
    reason: list[dict] | None = None,
    analysis_source: str | None = None,
    analysis_version: str | None = None,
    timestamp: str | None = None,
    processing_time: int | None = None,
    possible_attack: str | None = None,
    validated_attack: str | None = None,
    attack_confidence: int | None = None,
    validation_status: str | None = None,
    validation_notes: str | None = None,
    executive_summary: str | None = None,
    confidence_explanation: str | None = None,
    detected_categories: list[str] | None = None,
    supporting_indicators: list[str] | None = None,
    recommended_actions: list[str] | None = None,
    target_brand: str | None = None,
):
    analysis = models.Analysis(
        message=message,
        risk=risk,
        confidence=confidence,
        recommendation=recommendation,
        reason=json.dumps(reason or []),
        analysis_source=analysis_source,
        analysis_version=analysis_version,
        timestamp=timestamp,
        processing_time=processing_time,
        possible_attack=possible_attack,
        validated_attack=validated_attack,
        attack_confidence=attack_confidence,
        validation_status=validation_status,
        validation_notes=validation_notes,
        executive_summary=executive_summary,
        confidence_explanation=confidence_explanation,
        detected_categories=json.dumps(detected_categories or []),
        supporting_indicators=json.dumps(supporting_indicators or []),
        recommended_actions=json.dumps(recommended_actions or []),
        target_brand=target_brand,
    )

    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return analysis