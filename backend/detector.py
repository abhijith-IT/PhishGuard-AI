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
        risk = "🔴 High"
        confidence = "98%"
        recommendation = "Do NOT click any links. Delete the message immediately."

    elif score >= 2:
        risk = "🟠 Medium"
        confidence = "72%"
        recommendation = "Verify the sender before taking any action."

    else:
        risk = "🟢 Low"
        confidence = "25%"
        recommendation = "No obvious phishing indicators detected."

    return {
        "risk": risk,
        "confidence": confidence,
        "reason": reasons,
        "recommendation": recommendation
    }