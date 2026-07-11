from report import generate_report

generate_report(
    {
        "risk": "High",
        "confidence": "98%",
        "reason": [
            "Suspicious URL",
            "Password Request",
            "Urgency"
        ],
        "recommendation": "Do not click the link."
    }
)

print("Done")