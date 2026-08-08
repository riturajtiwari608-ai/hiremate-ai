from fastapi.responses import StreamingResponse
from io import BytesIO

from app.services.pdf_service import generate_interview_pdf
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Analysis, InterviewSession, InterviewAnswer
from app.schemas import (
    InterviewSessionResponse,
    InterviewAnswerSubmit,
    InterviewAnswerResponse,
    InterviewSessionDetailResponse,
    InterviewResultResponse,
)
from app.dependencies import get_current_user
from app.services.ai_service import evaluate_answer_with_gemini


router = APIRouter(
    prefix="/interviews",
    tags=["Mock Interviews"]
)


def parse_questions(interview_questions: str | None):
    if not interview_questions:
        return [
            "Tell me about yourself.",
            "Explain your best project in detail.",
            "What technical challenges did you face in your project?",
            "Why should we hire you for this role?"
        ]

    lines = interview_questions.split("\n")
    questions = []

    for line in lines:
        clean_line = line.strip()

        if not clean_line:
            continue

        # Remove numbering like 1. or 2)
        clean_line = clean_line.lstrip("0123456789. )-").strip()

        if len(clean_line) >= 5:
            questions.append(clean_line)

    if not questions:
        questions = [
            "Tell me about yourself.",
            "Explain your best project in detail.",
            "What technical challenges did you face in your project?",
            "Why should we hire you for this role?"
        ]

    return questions


def fallback_answer_evaluation(answer: str):
    answer_length = len(answer.strip())

    if answer_length < 40:
        score = 35
        technical_score = 30
        communication_score = 35
        confidence_score = 35
        feedback = (
            "Your answer is too short and does not explain the concept clearly. "
            "In interviews, you should give a structured answer with definition, example, and project connection."
        )
        strengths = "Attempted the answer"
        weaknesses = "Too short, lacks technical depth, no project example"
        improvement_tip = "Use this structure: definition + simple explanation + real project example."
    elif answer_length < 120:
        score = 60
        technical_score = 55
        communication_score = 65
        confidence_score = 60
        feedback = (
            "Your answer is understandable but needs more depth. "
            "You should add examples, technical terms, and explain how you used this in a project."
        )
        strengths = "Basic explanation, understandable answer"
        weaknesses = "Needs more technical detail, weak project connection"
        improvement_tip = "Add one project-based example and explain the practical use."
    else:
        score = 78
        technical_score = 75
        communication_score = 80
        confidence_score = 78
        feedback = (
            "Your answer has decent detail and structure. "
            "To make it stronger, add measurable impact, trade-offs, and clearer technical explanation."
        )
        strengths = "Detailed answer, better structure, some interview readiness"
        weaknesses = "Can improve with stronger technical depth and real-world trade-offs"
        improvement_tip = "End your answer with a real-world or project-specific example."

    return {
        "score": score,
        "technical_score": technical_score,
        "communication_score": communication_score,
        "confidence_score": confidence_score,
        "feedback": feedback,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "improvement_tip": improvement_tip,
    }


def evaluate_candidate_answer(question: str, answer: str, job_title: str):
    ai_result = evaluate_answer_with_gemini(
        question=question,
        answer=answer,
        job_title=job_title
    )

    if ai_result:
        return ai_result

    return fallback_answer_evaluation(answer)


def recalculate_session_score(session: InterviewSession, db: Session):
    answers = db.query(InterviewAnswer).filter(
        InterviewAnswer.session_id == session.id
    ).all()

    session.answered_questions = len(answers)

    if answers:
        total_score = sum(answer.score for answer in answers)
        session.average_score = int(total_score / len(answers))
    else:
        session.average_score = 0

    if session.answered_questions >= session.total_questions:
        session.status = "completed"
    else:
        session.status = "in_progress"

    db.commit()
    db.refresh(session)


@router.post("/start/{analysis_id}", response_model=InterviewSessionResponse, status_code=status.HTTP_201_CREATED)
def start_interview(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "candidate":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only candidates can start mock interviews"
        )

    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )

    if analysis.candidate_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can start interview only for your own analysis"
        )

    questions = parse_questions(analysis.interview_questions)

    new_session = InterviewSession(
        candidate_id=current_user.id,
        analysis_id=analysis.id,
        title=f"Mock Interview - {analysis.job_title}",
        total_questions=len(questions),
        answered_questions=0,
        average_score=0,
        status="in_progress"
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return new_session


@router.get("/my", response_model=list[InterviewSessionResponse])
def get_my_interviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.candidate_id == current_user.id)
        .order_by(InterviewSession.created_at.desc())
        .all()
    )

    return sessions


@router.get("/{session_id}", response_model=InterviewSessionDetailResponse)
def get_interview_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )

    if current_user.role != "admin" and session.candidate_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to view this interview"
        )

    analysis = db.query(Analysis).filter(Analysis.id == session.analysis_id).first()

    questions = parse_questions(analysis.interview_questions if analysis else None)

    answers = db.query(InterviewAnswer).filter(
        InterviewAnswer.session_id == session.id
    ).order_by(InterviewAnswer.created_at.asc()).all()

    return {
        "session": session,
        "questions": questions,
        "answers": answers
    }


@router.post("/{session_id}/answer", response_model=InterviewAnswerResponse, status_code=status.HTTP_201_CREATED)
def submit_interview_answer(
    session_id: int,
    answer_data: InterviewAnswerSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )

    if session.candidate_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can answer only your own interview"
        )

    if session.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This interview is already completed"
        )
    existing_answer = db.query(InterviewAnswer).filter(
        InterviewAnswer.session_id == session.id,
        InterviewAnswer.question == answer_data.question
    ).first()

    if existing_answer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This question has already been answered"
        )

    analysis = db.query(Analysis).filter(Analysis.id == session.analysis_id).first()

    job_title = analysis.job_title if analysis else "Software Developer"

    evaluation = evaluate_candidate_answer(
        question=answer_data.question,
        answer=answer_data.answer,
        job_title=job_title
    )

    new_answer = InterviewAnswer(
        session_id=session.id,
        question=answer_data.question,
        answer=answer_data.answer,
        score=evaluation["score"],
        technical_score=evaluation["technical_score"],
        communication_score=evaluation["communication_score"],
        confidence_score=evaluation["confidence_score"],
        feedback=evaluation["feedback"],
        strengths=evaluation["strengths"],
        weaknesses=evaluation["weaknesses"],
        improvement_tip=evaluation["improvement_tip"]
    )

    db.add(new_answer)
    db.commit()
    db.refresh(new_answer)

    recalculate_session_score(session=session, db=db)

    return new_answer


@router.get("/{session_id}/result", response_model=InterviewResultResponse)
def get_interview_result(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )

    if current_user.role != "admin" and session.candidate_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to view this result"
        )

    answers = db.query(InterviewAnswer).filter(
        InterviewAnswer.session_id == session.id
    ).order_by(InterviewAnswer.created_at.asc()).all()

    if answers:
        average_technical_score = int(
            sum(answer.technical_score for answer in answers) / len(answers)
        )
        average_communication_score = int(
            sum(answer.communication_score for answer in answers) / len(answers)
        )
        average_confidence_score = int(
            sum(answer.confidence_score for answer in answers) / len(answers)
        )
    else:
        average_technical_score = 0
        average_communication_score = 0
        average_confidence_score = 0

    if session.average_score >= 80:
        overall_feedback = (
            "Strong interview performance. Your answers are clear and role-relevant. "
            "Focus on adding more project impact and production-level details."
        )
    elif session.average_score >= 60:
        overall_feedback = (
            "Moderate interview performance. You understand the basics, but your answers need more depth, "
            "examples, and stronger technical explanation."
        )
    else:
        overall_feedback = (
            "Needs improvement. Practice structured answers, revise core concepts, "
            "and connect every answer with your project experience."
        )
    
    if session.average_score >= 80:
        final_recommendation = (
            "Candidate is interview-ready for this role. Focus on polishing project storytelling and advanced follow-up questions."
        )
    elif session.average_score >= 60:
        final_recommendation = (
            "Candidate is partially ready. They should practice deeper technical explanations and add project-based examples."
        )
    else:
        final_recommendation = (
            "Candidate is not ready yet. They should revise fundamentals, practice structured answers, and improve technical clarity."
        )

    return {
    "session_id": session.id,
    "title": session.title,
    "status": session.status,
    "total_questions": session.total_questions,
    "answered_questions": session.answered_questions,
    "average_score": session.average_score,
    "average_technical_score": average_technical_score,
    "average_communication_score": average_communication_score,
    "average_confidence_score": average_confidence_score,
    "overall_feedback": overall_feedback,
    "final_recommendation": final_recommendation,
    "answers": answers
}
@router.get("/{session_id}/report")
def download_interview_report(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(InterviewSession)
        .filter(InterviewSession.id == session_id)
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found",
        )

    if (
        current_user.role != "admin"
        and session.candidate_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not allowed",
        )

    answers = (
        db.query(InterviewAnswer)
        .filter(InterviewAnswer.session_id == session.id)
        .all()
    )

    if answers:
        avg_technical = int(
            sum(a.technical_score for a in answers) / len(answers)
        )

        avg_communication = int(
            sum(a.communication_score for a in answers) / len(answers)
        )

        avg_confidence = int(
            sum(a.confidence_score for a in answers) / len(answers)
        )
    else:
        avg_technical = 0
        avg_communication = 0
        avg_confidence = 0

    result = {
        "title": session.title,
        "average_score": session.average_score,
        "average_technical_score": avg_technical,
        "average_communication_score": avg_communication,
        "average_confidence_score": avg_confidence,
        "overall_feedback": (
            "AI generated interview performance report."
        ),
        "final_recommendation": (
            "Keep practicing consistently to improve interview performance."
        ),
        "answers": answers,
    }

    pdf = generate_interview_pdf(
        result=result,
        user=current_user,
    )

    return StreamingResponse(
        BytesIO(pdf),
        media_type="application/pdf",
        headers={
            "Content-Disposition":
            f'attachment; filename="Interview_Report_{session.id}.pdf"'
        },
    )