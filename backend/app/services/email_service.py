import smtplib
from email.message import EmailMessage
import os

def send_pdf_report_email(
    to_email: str,
    candidate_name: str,
    job_title: str,
    match_score: int,
    pdf_bytes: bytes,
    filename: str = "HireMate_Readiness_Report.pdf",
    company_name: str = "HireMate AI"
) -> bool:
    """
    Sends candidate readiness PDF report via SMTP.
    If SMTP server is not configured in env, runs in Sandbox demo mode safely.
    """
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("SMTP_FROM_EMAIL", smtp_user or "noreply@hiremate.ai")

    msg = EmailMessage()
    msg["Subject"] = f"[{company_name}] Your Hiring Readiness Report - {job_title}"
    msg["From"] = from_email
    msg["To"] = to_email

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6; }}
            .container {{ max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }}
            .header {{ background: #0f172a; color: white; padding: 24px; text-align: center; }}
            .content {{ padding: 24px; background: #ffffff; }}
            .badge {{ display: inline-block; background: #2563eb; color: white; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 18px; }}
            .footer {{ background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>{company_name}</h2>
                <p style="margin: 0; color: #94a3b8;">Candidate Hiring Readiness Platform</p>
            </div>
            <div class="content">
                <h3>Hello {candidate_name},</h3>
                <p>Your AI-powered Hiring Readiness Analysis for the role of <strong>{job_title}</strong> has been generated.</p>
                <div style="text-align: center; margin: 20px 0;">
                    <span class="badge">Match Score: {match_score}%</span>
                </div>
                <p>We have attached your complete, detailed PDF report to this email including:</p>
                <ul>
                    <li>Matched and missing technical skills</li>
                    <li>Resume improvement suggestions</li>
                    <li>7-day role preparation roadmap</li>
                    <li>Target technical and HR interview questions</li>
                </ul>
                <p>Keep preparing and practicing!</p>
            </div>
            <div class="footer">
                &copy; 2026 {company_name}. Generated for hiring preparation guidance.
            </div>
        </div>
    </body>
    </html>
    """

    msg.set_content(
        f"Hello {candidate_name},\n\nYour Hiring Readiness Report for {job_title} is attached.\nMatch Score: {match_score}%\n\nBest regards,\n{company_name}"
    )
    msg.add_alternative(html_content, subtype="html")

    msg.add_attachment(
        pdf_bytes,
        maintype="application",
        subtype="pdf",
        filename=filename
    )

    if not smtp_host or not smtp_user or not smtp_password:
        print(f"[Sandbox Demo Mode] Email simulated successfully to {to_email} (Report: {filename})")
        return True

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
            return True
    except Exception as e:
        print(f"SMTP sending failed: {e}")
        return False
