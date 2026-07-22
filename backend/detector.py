import re

# ---------------------------------------------------------
# REGEX PATTERNS MAPPED TO MAIN.PY INDICATORS
# ---------------------------------------------------------

CRITICAL_INDICATORS = [
    "credential_request", "fake_login_page", "malware_delivery",
    "mfa_bypass", "business_email_compromise", "wire_transfer_request"
]

HIGH_INDICATORS = [
    "brand_impersonation", "suspicious_domain", "external_link",
    "delivery_scam", "invoice_scam", "crypto_scam", "gift_card_request",
    "remote_access_request", "payment_fraud", "recruitment_scam"
]

MEDIUM_INDICATORS = [
    "urgency", "fear_tactics", "generic_greeting",
    "spoofed_display_name", "unusual_request", "confidentiality_request"
]

BEC_PATTERNS = [
    "i'm in a meeting",
    "cannot take calls",
    "can't answer calls",
    "travelling",
    "need this urgently",
    "ceo",
    "cfo",
    "president",
    "director",
    "executive",
    "managing director",
    "from ceo"
]

WIRE_TRANSFER_PATTERNS = [
    "wire transfer",
    "transfer ₹",
    "transfer rs",
    "vendor account",
    "transaction receipt",
    "send payment",
    "bank transfer",
    "transfer funds",
    "make payment",
    "transfer money",
    "send money",
    "payment immediately",
    "swift code",
    "routing number",
    "send funds"
]

CONFIDENTIAL_PATTERNS = [
    "confidential",
    "don't call",
    "don't discuss",
    "keep this private",
    "do not tell",
    "between us",
    "don't tell anyone"
]

REMOTE_ACCESS_PATTERNS = [
    "teamviewer",
    "anydesk",
    "quick assist",
    "ultraviewer",
    "remote desktop"
]

CREDENTIAL_REQUEST_PATTERNS = [
    "reset your password",
    "verify your password",
    "sign in again",
    "login immediately",
    "verify password",
    "confirm password",
    "update password",
    "validate password",
    "authenticate account",
    "enter your password",
    "confirm your identity",
    "click here to login"
]

PAYMENT_FRAUD_PATTERNS = [
    "invoice attached",
    "outstanding invoice",
    "overdue payment",
    "payment failed",
    "outstanding balance",
    "payment declined"
]

RECRUITMENT_SCAM_PATTERNS = [
    "interview",
    "recruitment",
    "offer letter",
    "salary package"
]

INDICATOR_PATTERNS = {
    # ─── CRITICAL INDICATORS ───
    "credential_request": CREDENTIAL_REQUEST_PATTERNS,
    "fake_login_page": [
        r'\b(login|sign in|verify|authenticate)\b.{0,100}https?://'
    ],
    "malware_delivery": [
        r'\.(exe|scr|vbs|bat|cmd|js|jar|wsf|ps1|docm|xlsm)\b'
    ],
    "mfa_bypass": [
        r'\b(enter|provide|verify|share).{0,20}(otp|2fa|mfa|verification code|one time passcode|security code)\b'
    ],
    "business_email_compromise": BEC_PATTERNS,
    "wire_transfer_request": WIRE_TRANSFER_PATTERNS,

    # ─── HIGH INDICATORS ───
    "brand_impersonation": [
        r'\b(microsoft|apple|amazon|paypal|netflix|chase|wells fargo|dhl|fedex|ups|usps)\b.{0,50}\b(support|account|billing|login|verify|suspend|security|update)\b',
        r'\b(support|account|billing|login|verify|suspend|security|update)\b.{0,50}\b(microsoft|apple|amazon|paypal|netflix|chase|wells fargo|dhl|fedex|ups|usps)\b'
    ],
    "suspicious_domain": [
        r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', # raw_ip_url
        r'https?://(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|qr\.ae)', # shortened_url
        r'https?://[a-zA-Z0-9-]+\.(xyz|tk|ru|top|pw|cc)' # mismatched_domain
    ],
    "external_link": [
        r'https?://',
        r'\b(qr code|scan this code)\b' # qr_code_reference
    ],
    "delivery_scam": [
        r'\b(delivery|package|tracking|shipment|parcel)\b.{0,50}\b(failed|pending|suspended|reschedule|fee)\b'
    ],
    "invoice_scam": [
        r'\b(invoice|receipt|billing|payment).{0,30}(overdue|immediate action|click|verify|pay)\b',
        r'\b(overdue|immediate action|click|verify|pay).{0,30}(invoice|receipt|billing|payment)\b'
    ],
    "crypto_scam": [
        r'\b(bitcoin|btc|ethereum|eth|crypto|wallet|deposit address)\b'
    ],
    "gift_card_request": [
        r'\b(gift card|apple card|steam card|google play)\b'
    ],
    "remote_access_request": REMOTE_ACCESS_PATTERNS,
    "payment_fraud": PAYMENT_FRAUD_PATTERNS,
    "recruitment_scam": RECRUITMENT_SCAM_PATTERNS,

    # ─── MEDIUM INDICATORS ───
    "urgency": [
        r'\b(urgent(ly)?|immediately|action required|within 24 hours|asap|final notice)\b'
    ],
    "fear_tactics": [
        r'\b(suspen(d|ded|sion)|block(ed)?|close(d)?|terminate(d)?|unauthorized|compromised|legal action|arrest|penalty|restrict(ed)?)\b'
    ],
    "generic_greeting": [
        r'\b(dear customer|dear user|dear member|dear account holder)\b'
    ],
    "unusual_request": [
        r'\b(reward|winner|prize|claim)\b'
    ],
    "spoofed_display_name": [
        r'\bvia\b.{1,20}(?:mailchimp|sendgrid|mailgun)' # sender_mismatch
    ],
    "confidentiality_request": CONFIDENTIAL_PATTERNS
}

def extract_deterministic_indicators(text: str) -> dict:
    """
    Extracts deterministic evidence using regular expressions or direct string matching.
    Returns a dictionary of indicator keys mapped to a list of unique matched texts.
    """
    indicators = {}

    for indicator_key, patterns in INDICATOR_PATTERNS.items():
        matches_for_key = []
        for pattern in patterns:
            # If pattern looks like regex or is long, try regex first, otherwise substring
            if r'\b' in pattern or r'\.' in pattern or r'{' in pattern or r'(' in pattern or r'[' in pattern:
                regex = pattern
            else:
                # Plain string, wrap with \b if it starts/ends with word chars to prevent partial matches
                start_bound = r'\b' if re.match(r'^\w', pattern) else ''
                end_bound = r'\b' if re.search(r'\w$', pattern) else ''
                regex = start_bound + re.escape(pattern) + end_bound
            
            # Find all occurrences
            for match in re.finditer(regex, text, re.IGNORECASE | re.DOTALL):
                m_str = match.group(0).strip()
                if m_str:
                    matches_for_key.append(m_str)

        if matches_for_key:
            # Deduplicate case-insensitively while preserving original casing
            seen_lower = set()
            unique_matches = []
            for m in matches_for_key:
                if m.lower() not in seen_lower:
                    seen_lower.add(m.lower())
                    unique_matches.append(m)
            indicators[indicator_key] = unique_matches

    return indicators

def detect_phishing(text: str):
    """
    Fallback deterministic detection matching the exact fallback schema in main.py.
    """
    indicators = extract_deterministic_indicators(text)
    reasons = []
    
    crit_count = sum(1 for ind in CRITICAL_INDICATORS if indicators.get(ind))
    high_count = sum(1 for ind in HIGH_INDICATORS if indicators.get(ind))
    med_count = sum(1 for ind in MEDIUM_INDICATORS if indicators.get(ind))
    
    for ind, matched_texts in indicators.items():
        matched_str = " | ".join(matched_texts)
        reasons.append({"text": f"Detected suspicious pattern: {ind.replace('_', ' ').title()} - \"{matched_str}\"", "type": "warning"})
            
    if crit_count > 0:
        risk = "Critical"
        confidence = 95
        recommendation = "Do NOT interact with this message. Report immediately."
    elif high_count > 0:
        risk = "High"
        confidence = 80
        recommendation = "Do NOT click any links. Verify the sender."
    elif med_count > 0:
        risk = "Medium"
        confidence = 50
        recommendation = "Verify the sender before taking any action."
    else:
        risk = "Low"
        confidence = 10
        recommendation = "No obvious phishing indicators detected."
        
    return {
        "risk": risk,
        "confidence": confidence,
        "reason": reasons,
        "recommendation": recommendation,
        "supporting_indicators": [{"indicator": ind.replace('_', ' ').title(), "matched_text": matched_texts} for ind, matched_texts in indicators.items()]
    }