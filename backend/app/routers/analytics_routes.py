from app.services.ai_service import analyze_dashboard_with_gemini
from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import InterviewAnswer, InterviewSession, User
from app.schemas import DashboardAnalyticsResponse


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


def _top_feedback_items(answers: list[InterviewAnswer], attribute: str) -> list[str]:
    """Return the most common comma-separated feedback items from answers."""
    items = Counter()

    for answer in answers:
        value = getattr(answer, attribute) or ""
        for item in value.split(","):
            clean_item = item.strip()
            if clean_item:
                items[clean_item] += 1

    return [item for item, _ in items.most_common(3)]


@router.get("/dashboard", response_model=DashboardAnalyticsResponse)
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.candidate_id == current_user.id)
        .all()
    )

    answers = (
        db.query(InterviewAnswer)
        .join(InterviewSession, InterviewSession.id == InterviewAnswer.session_id)
        .filter(InterviewSession.candidate_id == current_user.id)
        .all()
    )

    total_interviews = len(sessions)
    completed_interviews = sum(session.status == "completed" for session in sessions)
    overall_score = (
        int(sum(session.average_score or 0 for session in sessions) / total_interviews)
        if total_interviews
        else 0
    )

    def average_score(attribute: str) -> int:
        if not answers:
            return 0
        return int(sum(getattr(answer, attribute) or 0 for answer in answers) / len(answers))

    strengths = _top_feedback_items(answers, "strengths")
    weaknesses = _top_feedback_items(answers, "weaknesses")

    interview_text = []

    for answer in answers:

        interview_text.append(
            f"""
    Question:
    {answer.question}

    Answer:
    {answer.answer}
    """
    )

    dashboard_ai = analyze_dashboard_with_gemini(interview_text)

    return {
        "overall_score": overall_score,
        "average_technical_score": average_score("technical_score"),
        "average_communication_score": average_score("communication_score"),
        "average_confidence_score": average_score("confidence_score"),
        "total_interviews": total_interviews,
        "completed_interviews": completed_interviews,
        "interview_history": [
            {
                "title": session.title,
                "score": session.average_score or 0,
                "status": session.status,
            }
            for session in sessions
        ],
        "strengths": (
    dashboard_ai["strengths"]
    if dashboard_ai and dashboard_ai.get("strengths")
    else strengths
),

"weaknesses": (
    dashboard_ai["weaknesses"]
    if dashboard_ai and dashboard_ai.get("weaknesses")
    else weaknesses
),

"recommendations": (
    dashboard_ai["recommendations"]
    if dashboard_ai and dashboard_ai.get("recommendations")
    else (
        [
            f"Improve {weakness.lower()}."
            for weakness in weaknesses
        ]
        or [
            "Complete an interview to receive personalised recommendations."
        ]
    )
),
    }
