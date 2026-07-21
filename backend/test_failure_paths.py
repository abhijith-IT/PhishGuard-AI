import os
import time
from fastapi.testclient import TestClient
from unittest import mock

# Ensure the app starts with a dummy key so startup doesn't fail
os.environ["GROQ_API_KEY"] = "mock_key"

from main import app

client = TestClient(app)

def test_ai_timeout():
    """Test that a timeout falls back to deterministic analysis"""
    def mock_analyze(*args, **kwargs):
        raise TimeoutError("Simulated timeout")
        
    with mock.patch("main.analyze_with_ai", side_effect=mock_analyze):
        response = client.post("/analyze", json={"text": "Click here to reset your PayPal password immediately."})
        assert response.status_code == 200
        data = response.json()
        assert data["analysis_source"] == "Rule-Based Detector"
        assert data["risk"] in ["High", "Critical"]

def test_ai_invalid_json():
    """Test that invalid JSON from AI falls back to deterministic analysis"""
    def mock_analyze(*args, **kwargs):
        raise ValueError("Simulated JSON decode error")
        
    with mock.patch("main.analyze_with_ai", side_effect=mock_analyze):
        response = client.post("/analyze", json={"text": "I am the CEO. Wire $50k to this account immediately."})
        assert response.status_code == 200
        data = response.json()
        assert data["analysis_source"] == "Rule-Based Detector"
        assert data["risk"] in ["High", "Critical"]

def test_ai_returns_none_attack():
    """Test that if AI returns None, deterministic detection can still elevate risk"""
    def mock_analyze(*args, **kwargs):
        return {
            "possible_attack": "None",
            "confidence": 10,
            "reasoning": "Looks safe.",
            "recommended_action": "Do nothing."
        }
        
    with mock.patch("main.analyze_with_ai", side_effect=mock_analyze):
        response = client.post("/analyze", json={"text": "Click here to reset your Microsoft password immediately."})
        assert response.status_code == 200
        data = response.json()
        assert data["analysis_source"] == "Groq AI"
        assert data["risk"] in ["Medium", "High", "Critical"] # Because deterministic engine overrides

def test_ai_network_error():
    """Test that generic Exception falls back gracefully"""
    def mock_analyze(*args, **kwargs):
        raise Exception("Simulated network failure")
        
    with mock.patch("main.analyze_with_ai", side_effect=mock_analyze):
        response = client.post("/analyze", json={"text": "Hello, how are you?"})
        assert response.status_code == 200
        data = response.json()
        assert data["analysis_source"] == "Rule-Based Detector"
        assert data["risk"] == "Low"

def test_database_persistence_despite_ai_failure():
    """Test that history still persists if AI fails"""
    def mock_analyze(*args, **kwargs):
        raise Exception("Simulated network failure")
        
    with mock.patch("main.analyze_with_ai", side_effect=mock_analyze):
        res1 = client.post("/analyze", json={"text": "Send bitcoin to this address."})
        assert res1.status_code == 200
        data1 = res1.json()
        assert data1["analysis_source"] == "Rule-Based Detector"
        
        # Check history
        res2 = client.get("/history")
        assert res2.status_code == 200
        data2 = res2.json()
        assert any(item["message"] == "Send bitcoin to this address." for item in data2)

if __name__ == "__main__":
    print("Running failure path tests...")
    tests = [
        test_ai_timeout,
        test_ai_invalid_json,
        test_ai_returns_none_attack,
        test_ai_network_error,
        test_database_persistence_despite_ai_failure
    ]
    
    passed = 0
    for t in tests:
        try:
            t()
            print(f"✓ {t.__name__} passed")
            passed += 1
        except AssertionError as e:
            print(f"✗ {t.__name__} failed: AssertionError")
        except Exception as e:
            print(f"✗ {t.__name__} failed: {e}")
            
    print(f"\n{passed}/{len(tests)} failure path tests passed.")
