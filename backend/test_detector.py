import time
from detector import extract_deterministic_indicators

# Define tests as a list of dictionaries to allow detailed reporting
# Each case has:
# - category: For reporting
# - text: The email/message body
# - expect: List of indicators that MUST be present
# - not_expect: List of indicators that MUST NOT be present

TEST_CORPUS = [
    # ─── LEGITIMATE EMAILS (True Negatives) ───
    {"category": "Legitimate - HR", "text": "Dear team, the new health benefits summary is available on the intranet.", "expect": [], "not_expect": ["credential_request", "malware_delivery", "urgency"]},
    {"category": "Legitimate - GitHub", "text": "Your pull request #123 on repo/backend was successfully merged.", "expect": [], "not_expect": ["suspicious_domain", "wire_transfer_request"]},
    {"category": "Legitimate - Security Alert", "text": "Microsoft: We detected a new login to your account from a Windows device. No action needed if this was you.", "expect": ["brand_impersonation"], "not_expect": ["credential_request", "fake_login_page"]},
    {"category": "Legitimate - Order Confirm", "text": "Amazon order confirmation: Your package will arrive tomorrow. View order details at amazon.com.", "expect": ["brand_impersonation"], "not_expect": ["delivery_scam", "invoice_scam"]},
    {"category": "Legitimate - Password Update", "text": "As part of our regular security policy, your corporate password will expire in 14 days. Please change it via the IT portal.", "expect": [], "not_expect": ["credential_request", "urgency"]},
    {"category": "Legitimate - Invoice", "text": "Attached is the invoice for last month's cloud hosting. It will be auto-deducted from your card.", "expect": [], "not_expect": ["invoice_scam"]},
    {"category": "Legitimate - Customer Support", "text": "Thank you for contacting us. A support representative will review your ticket within 24 hours.", "expect": ["urgency"], "not_expect": ["fear_tactics", "unusual_request"]},
    {"category": "Legitimate - Bank Statement", "text": "Your monthly account statement for checking account ending in 1234 is now available.", "expect": [], "not_expect": ["wire_transfer_request", "credential_request"]},
    {"category": "Legitimate - Meeting Invite", "text": "Please join the Q3 sync tomorrow at 10 AM. Agenda is attached.", "expect": [], "not_expect": ["malware_delivery"]},
    {"category": "Legitimate - Marketing", "text": "Limited time offer! Subscribe to our newsletter to get 20% off your next purchase.", "expect": [], "not_expect": ["urgency", "credential_request"]},

    # ─── CREDENTIAL PHISHING (True Positives) ───
    {"category": "Credential - Password Reset", "text": "Verify your password immediately to avoid account suspension. Click here to login.", "expect": ["credential_request", "urgency", "fear_tactics"], "not_expect": []},
    {"category": "Credential - Fake O365", "text": "Authenticate your Microsoft 365 credential to view the secure document. http://evil.com/login", "expect": ["credential_request", "brand_impersonation", "fake_login_page"], "not_expect": []},
    {"category": "Credential - PayPal", "text": "PayPal: Confirm your identity by entering your password at this link or your account will be restricted.", "expect": ["credential_request", "brand_impersonation", "fear_tactics"], "not_expect": []},
    {"category": "Credential - Direct Ask", "text": "Please reply with your username and password for IT migration.", "expect": ["credential_request"], "not_expect": []},
    {"category": "Credential - Validated Action", "text": "Reset your credential by clicking the link below.", "expect": ["credential_request"], "not_expect": []},

    # ─── FINANCIAL SCAMS ───
    {"category": "Financial - Fake Invoice", "text": "Your overdue invoice is attached. Immediate action is required to avoid penalty fees.", "expect": ["invoice_scam"], "not_expect": []},
    {"category": "Financial - Urgent Bank Transfer", "text": "We need to process the wire transfer immediately for the new acquisition. Please send funds to this routing number.", "expect": ["wire_transfer_request", "urgency"], "not_expect": []},
    {"category": "Financial - CEO Fraud", "text": "I am the CEO. This is an urgent discreet request. Wire the funds to the contractor right now.", "expect": ["business_email_compromise", "wire_transfer_request", "urgency"], "not_expect": []},
    {"category": "Financial - Supplier Change", "text": "Please update our bank transfer routing number immediately for all future invoices.", "expect": ["wire_transfer_request", "urgency"], "not_expect": []},
    {"category": "Financial - Extortion", "text": "I have compromised your system. Send funds to my account within 24 hours.", "expect": ["wire_transfer_request", "urgency", "fear_tactics"], "not_expect": []},

    # ─── TECHNICAL SUPPORT SCAMS ───
    {"category": "Tech Support - TeamViewer", "text": "Your computer is infected. Install TeamViewer so our technician can remove the virus.", "expect": ["unusual_request"], "not_expect": []},
    {"category": "Tech Support - Defender", "text": "Windows Defender alert: Trojan detected. Call us and install AnyDesk for support.", "expect": ["unusual_request"], "not_expect": []},
    {"category": "Tech Support - Refund", "text": "Your refund is ready. Please open remote desktop so we can process it.", "expect": ["unusual_request"], "not_expect": []},
    {"category": "Tech Support - Diagnostics", "text": "We need to run diagnostics. Please install this tool.", "expect": ["unusual_request"], "not_expect": []},

    # ─── QR PHISHING ───
    {"category": "QR Phishing - Verification", "text": "Scan this QR code with your phone camera to verify your account.", "expect": ["external_link"], "not_expect": []},
    {"category": "QR Phishing - Login", "text": "Scan this code to log into your portal.", "expect": ["external_link"], "not_expect": []},

    # ─── CRYPTO SCAMS ───
    {"category": "Crypto - Wallet Verification", "text": "Verify your bitcoin wallet deposit address by sending a test transaction.", "expect": ["crypto_scam"], "not_expect": []},
    {"category": "Crypto - Giveaway", "text": "Send 1 ETH to this crypto address and we will send you 2 ETH back.", "expect": ["crypto_scam"], "not_expect": []},
    {"category": "Crypto - Blackmail", "text": "Pay $500 in bitcoin to prevent your data from being leaked.", "expect": ["crypto_scam"], "not_expect": []},

    # ─── MFA BYPASS ───
    {"category": "MFA - OTP Request", "text": "Enter your OTP code to verify this transaction.", "expect": ["mfa_bypass"], "not_expect": []},
    {"category": "MFA - Share Code", "text": "Please provide the 2FA code sent to your mobile device.", "expect": ["mfa_bypass"], "not_expect": []},
    {"category": "MFA - Verification Call", "text": "Our agent will call you. Please verify your security code with them.", "expect": ["mfa_bypass"], "not_expect": []},

    # ─── MALWARE DELIVERY ───
    {"category": "Malware - Exe", "text": "Please review the attached report.exe.", "expect": ["malware_delivery"], "not_expect": []},
    {"category": "Malware - Script", "text": "Run this update.ps1 script immediately.", "expect": ["malware_delivery", "urgency"], "not_expect": []},
    {"category": "Malware - Macro", "text": "Enable macros to view the invoice.xlsm", "expect": ["malware_delivery"], "not_expect": []},

    # ─── MIXED ATTACKS ───
    {"category": "Mixed - Credential + URL + Urgency", "text": "Action required within 24 hours: Update your login credential at http://bit.ly/123", "expect": ["urgency", "credential_request", "suspicious_domain"], "not_expect": []},
    {"category": "Mixed - Brand + Fear + Delivery", "text": "UPS: Your delivery has been suspended. Pay the fee or the package will be returned.", "expect": ["brand_impersonation", "delivery_scam", "fear_tactics"], "not_expect": []},
    {"category": "Mixed - Invoice + Brand + Malware", "text": "Amazon invoice overdue. Open the attached receipt.docm to review.", "expect": ["brand_impersonation", "invoice_scam", "malware_delivery"], "not_expect": []},

    # ─── EDGE CASES ───
    {"category": "Edge - Empty Input", "text": "", "expect": [], "not_expect": ["credential_request", "malware_delivery", "urgency"]},
    {"category": "Edge - Unicode Obfuscation", "text": "vërïfy yöür päsśwörd immëdiatëly!", "expect": [], "not_expect": ["credential_request"]},
    {"category": "Edge - HTML Email", "text": "<html><body><p>Wire transfer the funds urgently.</p></body></html>", "expect": ["wire_transfer_request", "urgency"], "not_expect": []},
    {"category": "Edge - Very Long", "text": "A" * 5000 + " Please confirm your password to proceed.", "expect": ["credential_request"], "not_expect": []},
    {"category": "Edge - Mixed Case", "text": "pLeAsE VeRiFy YoUr PaSsWoRd", "expect": ["credential_request"], "not_expect": []},
    {"category": "Edge - Punctuation", "text": "verify... your... password!!!", "expect": ["credential_request"], "not_expect": []},
    {"category": "Edge - Newlines", "text": "verify\nyour\npassword", "expect": ["credential_request"], "not_expect": []}
]

def run_tests():
    total_tests = len(TEST_CORPUS)
    passed = 0
    failed = 0
    false_positives = 0
    false_negatives = 0

    print(f"Running {total_tests} detector regression tests...\n")

    for idx, case in enumerate(TEST_CORPUS):
        text = str(case["text"])
        indicators = extract_deterministic_indicators(text)
        
        case_passed = True
        
        # Check Expected Positives
        for exp in case["expect"]:
            if not indicators.get(exp):
                case_passed = False
                false_negatives += 1
                print(f"[FAIL] {case['category']} - Expected '{exp}' but it was not detected.")
        
        # Check Expected Negatives
        for not_exp in case["not_expect"]:
            if indicators.get(not_exp):
                case_passed = False
                false_positives += 1
                print(f"[FAIL] {case['category']} - Did not expect '{not_exp}' but it was detected.")
                
        if case_passed:
            passed += 1

    failed = total_tests - passed
    # Metrics
    precision = 100.0 if passed == total_tests else (passed / total_tests) * 100
    
    print("\n" + "="*50)
    print("DETECTOR TEST RESULTS")
    print("="*50)
    print(f"Tests run: {total_tests}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print("")
    print(f"Detection precision (test corpus): {precision:.2f}%")
    print(f"False-positive regression cases: {false_positives}")
    print(f"False-negative regression cases: {false_negatives}")
    print("="*50)

    if failed > 0:
        exit(1)

if __name__ == "__main__":
    run_tests()
