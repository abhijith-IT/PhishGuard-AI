from sqlalchemy import Column, Integer, String
from database import Base

class Analysis(Base):
    __tablename__ = "analysis"

    id = Column(Integer, primary_key=True, index=True)

    message = Column(String)

    risk = Column(String)

    confidence = Column(String)

    recommendation = Column(String)