import time
import statistics
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

SCENARIOS = [
    # Legitimate
    {"name": "Legitimate - HR", "text": "Hi team, please find the updated holiday schedule attached. Best, HR.", "expect_risk": ["Low"]},
    {"name": "Legitimate - Meeting", "text": "Let's sync up tomorrow at 10 AM. Here is the Zoom link.", "expect_risk": ["Low"]},
    {"name": "Legitimate - GitHub", "text": "Someone requested a review on your pull request in GitHub.", "expect_risk": ["Low"]},
    {"name": "Legitimate - Amazon", "text": "Your Amazon order has shipped and will arrive by Tuesday.", "expect_risk": ["Low"]},
    {"name": "Legitimate - Banking", "text": "Your monthly statement for your checking account is now available online.", "expect_risk": ["Low"]},

    # Credential
    {"name": "Credential - M365", "text": "Verify your password immediately to avoid Microsoft account suspension. Click here to login.", "expect_risk": ["Medium", "High", "Critical"]},
    {"name": "Credential - Google", "text": "Authenticate your Google login to secure your account. Click here.", "expect_risk": ["Medium", "High", "Critical"]},
    {"name": "Credential - PayPal", "text": "Confirm your identity by providing your password for PayPal or your account will be restricted.", "expect_risk": ["Medium", "High", "Critical"]},
    {"name": "Credential - Password Reset", "text": "Click here to reset your password immediately due to unauthorized access.", "expect_risk": ["Medium", "High", "Critical"]},

    # Financial
    {"name": "Financial - Fake Invoice", "text": "Attached is your overdue invoice. Immediate action required to pay.", "expect_risk": ["Medium", "High", "Critical"]},
    {"name": "Financial - CEO Fraud", "text": "I am the CEO. Please transfer funds discreetly right now to this new account.", "expect_risk": ["Medium", "High", "Critical"]},
    {"name": "Financial - Wire", "text": "Wire the funds to the new routing number immediately for the acquisition.", "expect_risk": ["Medium", "High", "Critical"]},

    # Tech Support
    {"name": "Tech Support - TeamViewer", "text": "Please install TeamViewer so IT can fix your computer.", "expect_risk": ["Medium", "High", "Critical"]},
    {"name": "Tech Support - AnyDesk", "text": "Download AnyDesk for remote desktop support right now.", "expect_risk": ["Medium", "High", "Critical"]},
    {"name": "Tech Support - Fake AV", "text": "Your PC is compromised. Call Microsoft support immediately.", "expect_risk": ["Medium", "High", "Critical"]},

    # QR, Crypto, Gift Card, Mixed
    {"name": "QR Phishing", "text": "Scan this QR code to verify your account.", "expect_risk": ["Medium", "High", "Critical"]},
    {"name": "Crypto Scam", "text": "Send Bitcoin to this wallet address to double your investment.", "expect_risk": ["High", "Critical"]},
    {"name": "Gift Card Scam", "text": "I need you to buy 5 Google Play gift cards and send me the codes.", "expect_risk": ["High", "Critical"]},
    {"name": "Mixed Attack", "text": "Urgent: The CEO demands you reset your Microsoft password and scan this QR code or your account will be suspended.", "expect_risk": ["Medium", "High", "Critical"]},
]

def main():
    print("Starting E2E Phishing Analysis Pipeline Tests...\n")
    
    # Clear history
    client.delete("/history")

    passed = 0
    failed = 0
    times = []

    for idx, scenario in enumerate(SCENARIOS):
        print(f"[{idx+1}/{len(SCENARIOS)}] Testing: {scenario['name']}")
        start = time.time()
        
        try:
            resp = client.post("/analyze", json={"text": scenario["text"]})
            resp.raise_for_status()
            data = resp.json()
            
            elapsed = (time.time() - start) * 1000
            times.append(elapsed)

            # Verification Checks
            if data["analysis_source"] != "Groq AI":
                raise AssertionError(f"Fell back to {data['analysis_source']}")
            
            if data["risk"] not in scenario["expect_risk"]:
                raise AssertionError(f"Expected {scenario['expect_risk']}, got {data['risk']}. Reason: {data.get('reason')}")
            
            # Verify required schema fields
            required_keys = ["validation_status", "possible_attack", "confidence", "reason", "recommendation"]
            for k in required_keys:
                if k not in data:
                    raise AssertionError(f"Missing schema key: {k}")
                    
            passed += 1
            print(f"  ✓ Passed ({elapsed:.0f}ms) | Risk: {data['risk']} | Status: {data['validation_status']}")
            
        except Exception as e:
            failed += 1
            print(f"  ✗ Failed: {e}")

    # Verify History Persistence
    print(f"[{len(SCENARIOS)+1}/{len(SCENARIOS)+1}] Testing: Database History Retrieval")
    try:
        hist_resp = client.get("/history")
        hist_resp.raise_for_status()
        hist_data = hist_resp.json()
        
        if len(hist_data) != len(SCENARIOS):
            raise AssertionError(f"Expected {len(SCENARIOS)} items, got {len(hist_data)}")
            
        passed += 1
        print(f"  ✓ Passed | Retrieved {len(hist_data)} items from database")
    except Exception as e:
        print(f"  ✗ Failed: {e}")
        failed += 1

    avg_time = statistics.mean(times) if times else 0

    print("\n==================================================")
    print("E2E PIPELINE TEST RESULTS")
    print("==================================================")
    print(f"Tests Run: {len(SCENARIOS) + 1}")
    print(f"Passed:    {passed}")
    print(f"Failed:    {failed}")
    print(f"Average Processing Time: {avg_time:.0f}ms")
    print("==================================================")

if __name__ == "__main__":
    main()
