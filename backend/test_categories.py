from main import app
from fastapi.testclient import TestClient
import json

client = TestClient(app)

categories = {
    'Business Email Compromise': 'I\'m in a meeting. I cannot take calls. This is confidential. Regards, CEO',
    'QR Code Phishing': 'Scan the QR code below using your mobile device to verify your identity.',
    'Credential Harvesting': 'Verify your account by clicking here. Update your password now to keep it active.',
    'MFA Phishing': 'Enter the multi-factor authentication code sent to your device to proceed.',
    'Invoice Scam': 'Please see the attached invoice for $5,000 for services rendered.',
    'Payment Fraud': 'Your payment failed. Please update your billing information immediately.',
    'Remote Access Scam': 'Please install AnyDesk or TeamViewer to allow our IT support to assist you.',
    'HR Recruitment Scam': 'Congratulations on your new job offer. Please review the attached salary package and offer letter.',
    'Crypto Scam': 'Send bitcoin to the deposit address below to claim your reward.'
}

for cat, text in categories.items():
    print(f'\n--- Testing {cat} ---')
    res = client.post('/analyze', json={'text': text})
    data = res.json()
    indicators = data.get('supporting_indicators', [])
    for ind in indicators:
        print(f'Indicator: {ind["indicator"]}')
        print(f'Matched Texts: {ind["matched_text"]}')
