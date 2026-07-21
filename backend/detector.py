def detect_phishing(text: str):

    text = text.lower()

    reasons = []

    phishing_keywords = [
        "bank",
        "account",
        "verify",
        "password",
        "otp",
        "click",
        "urgent",
        "login",
        "confirm",
        "credit card",
        "limited time",
        "winner",
        "gift card",
        "security alert"
    ]

    url_shorteners = [
        "bit.ly",
        "tinyurl",
        "t.co",
        "goo.gl"
    ]

    suspicious_domains = [
        ".ru",
        ".xyz",
        ".tk",
        ".top"
    ]

    for word in phishing_keywords:
        if word in text:
            reasons.append(f"Suspicious keyword detected: {word}")

    for shortener in url_shorteners:
        if shortener in text:
            reasons.append(f"Shortened URL detected: {shortener}")

    for domain in suspicious_domains:
        if domain in text:
            reasons.append(f"Suspicious domain detected: {domain}")

    if "http://" in text or "https://" in text:
        reasons.append("Message contains a URL")

    score = len(reasons)

    if score >= 5:
        risk = "High"
        confidence = 98
        recommendation = "Do NOT click any links. Delete the message immediately."

    elif score >= 2:
        risk = "Medium"
        confidence = 72
        recommendation = "Verify the sender before taking any action."

    else:
        risk = "Low"
        confidence = 25
        recommendation = "No obvious phishing indicators detected."

    return {
        "risk": risk,
        "confidence": confidence,
        "reason": reasons,
        "recommendation": recommendation
    }

def extract_deterministic_indicators(text: str) -> dict:
    text = text.lower()
    indicators = {}
    
    # Critical
    if any(w in text for w in ["password", "otp", "login", "credential"]):
        indicators["credential_request"] = True
    if any(w in text for w in ["wire", "transfer", "bank", "account"]):
        indicators["wire_transfer_request"] = True
        
    # High
    if any(w in text for w in ["amazon", "paypal", "microsoft", "apple"]):
        indicators["brand_impersonation"] = True
    if "http://" in text or "https://" in text:
        indicators["external_link"] = True
    if "invoice" in text:
        indicators["invoice_scam"] = True
    if any(w in text for w in ["delivery", "package", "tracking"]):
        indicators["delivery_scam"] = True
    if any(w in text for w in ["bitcoin", "crypto", "wallet"]):
        indicators["crypto_scam"] = True
        
    # Medium
    if any(w in text for w in ["urgent", "limited time", "immediately", "alert"]):
        indicators["urgency"] = True
    if any(w in text for w in ["suspend", "block", "close", "unauthorized"]):
        indicators["fear_tactics"] = True
        
    return indicators