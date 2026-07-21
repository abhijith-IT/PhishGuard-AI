import json
from database import SessionLocal
from crud import save_analysis
from datetime import datetime, timezone
import models

def run_test():
    db = SessionLocal()
    
    timestamp = datetime.now(timezone.utc).isoformat()
    processing_time = 1234
    attack_type = "Test Attack"
    target_brand = "Test Brand"
    
    print(f"1. Generated timestamp: {timestamp}")
    print(f"2. Processing time: {processing_time}")
    print(f"3. Validated attack: {attack_type}")
    print(f"4. Target brand: {target_brand}")
    
    analysis = save_analysis(
        db=db,
        message="Test message",
        risk="High",
        confidence=99,
        recommendation="Do nothing",
        reason=[{"text": "Test", "type": "warning"}],
        analysis_source="Test Source",
        analysis_version="1.0",
        timestamp=timestamp,
        processing_time=processing_time,
        validated_attack=attack_type,
        target_brand=target_brand
    )
    
    print(f"5. After db.commit(), returned analysis object:")
    print(f"   timestamp: {analysis.timestamp}")
    print(f"   processing_time: {analysis.processing_time}")
    print(f"   validated_attack: {analysis.validated_attack}")
    print(f"   target_brand: {analysis.target_brand}")
    
    # Immediately query it
    queried = db.query(models.Analysis).filter(models.Analysis.id == analysis.id).first()
    print(f"6. Queried from DB by ID {queried.id}:")
    print(f"   timestamp: {queried.timestamp}")
    print(f"   processing_time: {queried.processing_time}")
    print(f"   validated_attack: {queried.validated_attack}")
    print(f"   target_brand: {queried.target_brand}")
    
    db.close()

if __name__ == "__main__":
    run_test()
