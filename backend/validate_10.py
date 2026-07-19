import requests
import json
import time

emails = [
    {
        "name": "1. Legitimate HR Email",
        "text": "From: hr@company.com\nSubject: Q3 Townhall\n\nPlease join us for the Q3 townhall next Tuesday. The agenda is attached as a PDF."
    },
    {
        "name": "2. Legitimate Newsletter",
        "text": "From: news@techweekly.com\nSubject: Top 10 Frameworks\n\nCheck out our latest post on the top frameworks for 2026. Read more at https://techweekly.com/post10"
    },
    {
        "name": "3. Legitimate Colleague",
        "text": "From: alice@company.com\nSubject: Lunch?\n\nHey Bob, want to grab lunch around 12:30 at the usual place?"
    },
    {
        "name": "4. Low Risk Spam",
        "text": "From: sales@random-offers.net\nSubject: Buy cheap watches!\n\nGet 50% off on all watches today only. Click here: http://random-offers.net/deals"
    },
    {
        "name": "5. Low-Medium Marketing",
        "text": "From: marketing@unknown-startup.io\nSubject: Transform your workflow\n\nDownload our new productivity tool and transform how your team works. See attachment for details."
    },
    {
        "name": "6. Medium Risk - Urgent Request",
        "text": "From: IT-Support (via external)\nSubject: Urgent: Action Required\n\nPlease review the attached policy update immediately or your network access may be restricted. Link: http://internal-policy-update.com"
    },
    {
        "name": "7. High Risk - Credential Harvesting",
        "text": "From: admin@company-portal-update.com\nSubject: Password Expiry Notice\n\nYour Office365 password expires in 24 hours. Please log in here to retain access: http://office365-login-secure.com"
    },
    {
        "name": "8. High Risk - Brand Impersonation",
        "text": "From: support@paypa1.com\nSubject: Account Suspended\n\nDear Customer, your PayPal account has been temporarily suspended due to unusual activity. Click here to verify your identity."
    },
    {
        "name": "9. Critical - Financial Fraud & Malware",
        "text": "From: ceo@c0mpany.com\nSubject: URGENT WIRE TRANSFER\n\nI need you to process an urgent wire transfer to our new vendor. Download the attached executable invoice for the wiring details immediately."
    },
    {
        "name": "10. Critical - Targeted Spear Phishing",
        "text": "From: security@chase-bank-alert.com\nSubject: Fraud Alert - Action Required\n\nWe detected unauthorized cryptocurrency transactions on your Chase account. Please log in immediately at http://chase-bank-alert.com/login to cancel the transfer."
    }
]

print(f"Running {len(emails)} tests...\n" + "-"*50)

for idx, email in enumerate(emails):
    try:
        res = requests.post('http://127.0.0.1:8000/analyze', json={'text': email['text']}).json()
        print(f"\n{email['name']}")
        print(f"Risk: {res.get('risk')}")
        print(f"Confidence: {res.get('confidence')}%")
        
        reasons = res.get('reason', [])
        threats = [r for r in reasons if r['type'] == 'critical']
        warnings = [r for r in reasons if r['type'] == 'warning']
        info = [r for r in reasons if r['type'] == 'info']
        
        print(f"Threats ({len(threats)}), Warnings ({len(warnings)}), Info ({len(info)})")
        
    except Exception as e:
        print(f"{email['name']} - Error: {e}")
        
    time.sleep(1) # Be nice to the API

print("\n" + "-"*50 + "\nValidation complete.")
