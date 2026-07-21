from sqlalchemy import Column, Integer, String
from database import Base

class Analysis(Base):
    __tablename__ = "analysis"

    id = Column(Integer, primary_key=True, index=True)

    message = Column(String)

    risk = Column(String)

    confidence = Column(Integer)

    recommendation = Column(String)

    reason = Column(String, nullable=True)

    analysis_source = Column(String, nullable=True)

    analysis_version = Column(String, nullable=True)

    timestamp = Column(String, nullable=True)

    processing_time = Column(Integer, nullable=True)

    # --- Hypothesis-Evidence-Validation fields ---

    possible_attack = Column(String, nullable=True)

    validated_attack = Column(String, nullable=True)

    attack_confidence = Column(Integer, nullable=True)

    validation_status = Column(String, nullable=True)

    validation_notes = Column(String, nullable=True)

    executive_summary = Column(String, nullable=True)

    confidence_explanation = Column(String, nullable=True)

    detected_categories = Column(String, nullable=True)  # JSON array

    supporting_indicators = Column(String, nullable=True)  # JSON array

    recommended_actions = Column(String, nullable=True)  # JSON array

    target_brand = Column(String, nullable=True)