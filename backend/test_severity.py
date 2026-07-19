import requests

email = '''From: hr@company-careers.net
Subject: Updated Salary Structure

This is the updated salary structure for the engineering department. Please review the attached PDF.

Click here to download: http://company-careers.net/download/salary-2026.pdf
'''

try:
    res = requests.post('http://127.0.0.1:8000/analyze', json={'text': email}).json()
    print('Risk:', res.get('risk'))
    print('Confidence:', res.get('confidence'))
    print('Evidence Score:', res.get('evidence_score'))
    print('Raw AI output:', res)
    for reason in res.get('reason', []):
        print(f"- [{reason['type'].upper()}] {reason['text']}")
except Exception as e:
    print("Error:", e)
