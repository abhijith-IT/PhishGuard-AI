from sqlalchemy.orm import Session
import models

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

def save_analysis(
    db: Session,
    message: str,
    risk: str,
    confidence: str,
    recommendation: str,
):

    analysis = models.Analysis(
        message=message,
        risk=risk,
        confidence=confidence,
        recommendation=recommendation,
    )

    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return analysis