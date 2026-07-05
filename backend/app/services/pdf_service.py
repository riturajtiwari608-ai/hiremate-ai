from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


def safe_text(value):
    if value is None:
        return "N/A"

    value = str(value)
    value = value.replace("&", "&amp;")
    value = value.replace("<", "&lt;")
    value = value.replace(">", "&gt;")

    return value


def get_score_color(score: int):
    if score >= 80:
        return colors.green
    elif score >= 50:
        return colors.orange
    else:
        return colors.red


def generate_analysis_pdf_report(analysis, summary: dict, branding=None):
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        name="TitleStyle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=20,
        leading=24,
        spaceAfter=18,
    )

    subtitle_style = ParagraphStyle(
        name="SubtitleStyle",
        parent=styles["Heading2"],
        alignment=TA_CENTER,
        fontSize=12,
        leading=16,
        textColor=colors.darkgray,
        spaceAfter=20,
    )

    heading_style = ParagraphStyle(
        name="HeadingStyle",
        parent=styles["Heading2"],
        alignment=TA_LEFT,
        fontSize=14,
        leading=18,
        spaceBefore=12,
        spaceAfter=8,
        textColor=colors.HexColor("#1F2937"),
    )

    normal_style = ParagraphStyle(
        name="NormalStyle",
        parent=styles["BodyText"],
        fontSize=10,
        leading=14,
        spaceAfter=6,
    )

    small_style = ParagraphStyle(
        name="SmallStyle",
        parent=styles["BodyText"],
        fontSize=9,
        leading=12,
    )

    elements = []

    company_name = "HireMate AI"
    report_title = "Candidate Hiring Readiness Report"

    if branding:
        company_name = branding.company_name or company_name
        report_title = branding.report_title or report_title

    elements.append(Paragraph(safe_text(company_name), title_style))
    elements.append(Paragraph(safe_text(report_title), subtitle_style))

    score = analysis.match_score
    readiness_level = summary.get("readiness_level", "N/A")

    overview_data = [
        ["Job Title", safe_text(analysis.job_title)],
        ["Company Name", safe_text(analysis.company_name)],
        ["Match Score", f"{score}%"],
        ["Readiness Level", safe_text(readiness_level)],
    ]

    overview_table = Table(overview_data, colWidths=[1.7 * inch, 4.8 * inch])

    overview_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#E5E7EB")),
                ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#111827")),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BACKGROUND", (1, 2), (1, 2), get_score_color(score)),
                ("TEXTCOLOR", (1, 2), (1, 2), colors.white),
                ("FONTNAME", (1, 2), (1, 2), "Helvetica-Bold"),
            ]
        )
    )

    elements.append(overview_table)
    elements.append(Spacer(1, 12))

    elements.append(Paragraph("Summary", heading_style))
    elements.append(Paragraph(safe_text(summary.get("short_summary")), normal_style))

    elements.append(Paragraph("Matched Skills", heading_style))
    elements.append(Paragraph(safe_text(analysis.matched_skills), normal_style))

    elements.append(Paragraph("Missing Skills", heading_style))
    elements.append(Paragraph(safe_text(analysis.missing_skills), normal_style))

    elements.append(Paragraph("Suggestions", heading_style))
    elements.append(Paragraph(safe_text(analysis.suggestions), normal_style))

    elements.append(Paragraph("Next Steps", heading_style))

    next_steps = summary.get("next_steps", [])

    if next_steps:
        for index, step in enumerate(next_steps, start=1):
            elements.append(
                Paragraph(f"{index}. {safe_text(step)}", normal_style)
            )
    else:
        elements.append(Paragraph("No next steps available.", normal_style))

    elements.append(Paragraph("Preparation Roadmap", heading_style))

    roadmap = getattr(analysis, "preparation_roadmap", None) or "No preparation roadmap available."

    for line in roadmap.split("\n"):
        if line.strip():
            elements.append(Paragraph(safe_text(line.strip()), normal_style))

    elements.append(Paragraph("Interview Questions", heading_style))

    interview_questions = analysis.interview_questions or "No interview questions generated."

    for line in interview_questions.split("\n"):
        if line.strip():
            elements.append(Paragraph(safe_text(line.strip()), small_style))

    elements.append(Spacer(1, 16))

    footer_text = (
        "Disclaimer: This report is generated for interview preparation and hiring readiness guidance. "
        "It does not guarantee job selection."
    )

    elements.append(Paragraph(footer_text, small_style))

    doc.build(elements)

    buffer.seek(0)
    return buffer