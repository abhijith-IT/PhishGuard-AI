from sqlalchemy.orm import Session
import models
import json

def create_analysis(db: Session, analysis):

    db_analysis = models.Analysis(
        message=analysis.message,
        risk=analysis.risk,
        confidence=analysis.confidence,
        recommendation=analysis.recommendation,
    )

    db.add(db_analysis)

    db.commit()

    db.refresh(db_analysis)

    return db_analysis


def get_analysis(db: Session):

    return db.query(models.Analysis).all()

def delete_all_history(db: Session):
    try:
        db.query(models.Analysis).delete()
        db.commit()
    except Exception as e:
        db.rollback()
        raise e

def save_analysis(
    db: Session,
    message: str,
    risk: str,
    confidence: str,
    recommendation: str,
    reason: list[dict] | None = None,
    analysis_source: str | None = None,
    analysis_version: str | None = None,
):
    
    if analysis_version:
        source_val = json.dumps({"source": analysis_source, "version": analysis_version})
    else:
        source_val = analysis_source

    analysis = models.Analysis(
        message=message,
        risk=risk,
        confidence=confidence,
        recommendation=recommendation,
        reason=json.dumps(reason or []),
        analysis_source=source_val,
    )

    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return analysis