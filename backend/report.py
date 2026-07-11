from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

def generate_report(data):

    pdf = SimpleDocTemplate("analysis_report.pdf")

    styles = getSampleStyleSheet()

    story = []

    story.append(Paragraph("<b>PhishGuard AI Report</b>", styles["Heading1"]))

    story.append(Paragraph(f"<b>Risk:</b> {data['risk']}", styles["BodyText"]))

    story.append(Paragraph(f"<b>Confidence:</b> {data['confidence']}", styles["BodyText"]))

    story.append(Paragraph("<b>Reasons:</b>", styles["Heading2"]))

    for reason in data["reason"]:
        story.append(Paragraph("• " + reason, styles["BodyText"]))

    story.append(Paragraph("<b>Recommendation:</b>", styles["Heading2"]))

    story.append(
        Paragraph(data["recommendation"], styles["BodyText"])
    )

    pdf.build(story)

    return "analysis_report.pdf"