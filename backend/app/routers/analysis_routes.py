from fastapi.responses import StreamingResponse
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Analysis, CompanySetting
from app.schemas import AnalysisCreate, AnalysisResponse, AdminStatsResponse, AnalysisSummaryResponse
from app.dependencies import get_current_user, require_admin
from app.services.pdf_service import generate_analysis_pdf_report
from app.services.resume_parser import extract_text_from_pdf
from app.services.ai_service import analyze_with_gemini


router = APIRouter(
    prefix="/analyses",
    tags=["Analyses"]
)


SKILL_CATEGORIES = {
    "programming_languages": [
        "python", "java", "javascript", "typescript", "c++", "c#"
    ],
    "backend": [
        "fastapi", "flask", "django", "node.js", "express.js",
        "rest api", "api", "jwt", "authentication"
    ],
    "frontend": [
        "react", "html", "css", "tailwind", "bootstrap"
    ],
    "database": [
        "sql", "postgresql", "mysql", "mongodb", "sqlite", "redis"
    ],
    "ai_ml": [
        "machine learning", "deep learning", "tensorflow", "pytorch",
        "opencv", "nlp", "pandas", "numpy", "scikit-learn"
    ],
    "devops_tools": [
        "git", "github", "docker", "aws", "azure", "render",
        "vercel", "linux"
    ],
    "cs_fundamentals": [
        "data structures", "algorithms", "oops", "dbms", "operating system",
        "computer networks"
    ]
}


def get_all_skills():
    all_skills = []

    for skills in SKILL_CATEGORIES.values():
        all_skills.extend(skills)

    return all_skills


def extract_skills_from_text(text: str):
    text_lower = text.lower()
    found_skills = []

    for skill in get_all_skills():
        if skill in text_lower:
            found_skills.append(skill)

    return found_skills


def better_skill_match(resume_text: str, job_description: str):
    resume_skills = extract_skills_from_text(resume_text)
    jd_skills = extract_skills_from_text(job_description)

    matched_skills = []
    missing_skills = []

    for skill in jd_skills:
        if skill in resume_skills:
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)

    if not jd_skills:
        match_score = 0
    else:
        match_score = int((len(matched_skills) / len(jd_skills)) * 100)

    matched_text = ", ".join(matched_skills) if matched_skills else "No matched skills found."
    missing_text = ", ".join(missing_skills) if missing_skills else "No major missing skills found."

    suggestions = generate_better_suggestions(
        match_score=match_score,
        matched_skills=matched_skills,
        missing_skills=missing_skills
    )

    interview_questions = generate_interview_questions(
        matched_skills=matched_skills,
        missing_skills=missing_skills
    )

    return match_score, matched_text, missing_text, suggestions, interview_questions
def generate_analysis_output(resume_text: str, job_description: str, job_title: str):
    """
    Pehle Gemini se analysis try karega.
    Agar Gemini fail ho gaya, to rule-based system use karega.
    """

    ai_result = analyze_with_gemini(
        resume_text=resume_text,
        job_description=job_description,
        job_title=job_title
    )

    if ai_result:
        return (
            ai_result["match_score"],
            ai_result["matched_skills"],
            ai_result["missing_skills"],
            ai_result["suggestions"],
            ai_result["interview_questions"],
            ai_result["preparation_roadmap"],
        )

    match_score, matched_skills, missing_skills, suggestions, interview_questions = better_skill_match(
        resume_text=resume_text,
        job_description=job_description
    )

    fallback_roadmap = (
        "Day 1: Understand the job description and identify missing skills.\n"
        "Day 2: Revise core technical concepts related to the role.\n"
        "Day 3: Improve resume bullets with project-based proof.\n"
        "Day 4: Practice technical interview questions.\n"
        "Day 5: Practice HR and project explanation questions.\n"
        "Day 6: Build or improve one relevant mini feature/project.\n"
        "Day 7: Take a mock interview and revise weak areas."
    )

    return (
        match_score,
        matched_skills,
        missing_skills,
        suggestions,
        interview_questions,
        fallback_roadmap,
    )

def generate_better_suggestions(
    match_score: int,
    matched_skills: list[str],
    missing_skills: list[str]
):
    suggestions = []

    if match_score >= 80:
        suggestions.append(
            "Strong match. Your resume aligns well with this job description."
        )
    elif match_score >= 50:
        suggestions.append(
            "Moderate match. Your resume has useful skills but needs stronger alignment with the job description."
        )
    else:
        suggestions.append(
            "Low match. Improve your resume by adding relevant skills, projects, and role-specific keywords."
        )

    if matched_skills:
        suggestions.append(
            "Highlight these matched skills more clearly in your resume: "
            + ", ".join(matched_skills)
            + "."
        )

    if missing_skills:
        suggestions.append(
            "Learn or add project proof for these missing skills: "
            + ", ".join(missing_skills)
            + "."
        )

    suggestions.append(
        "Use measurable resume bullets such as: Built REST APIs using FastAPI, implemented JWT authentication, integrated PostgreSQL database, and deployed the backend."
    )

    suggestions.append(
        "Add GitHub link, deployment link, project architecture, and database/API details wherever possible."
    )

    return " ".join(suggestions)


def generate_interview_questions(
    matched_skills: list[str],
    missing_skills: list[str]
):
    questions = []
    question_number = 1

    skill_question_map = {
        "python": [
            "What are lists, tuples, sets, and dictionaries in Python?",
            "Explain exception handling in Python.",
            "What is the difference between shallow copy and deep copy?"
        ],
        "fastapi": [
            "What is FastAPI and why is it used?",
            "How do you create GET and POST APIs in FastAPI?",
            "How does dependency injection work in FastAPI?"
        ],
        "flask": [
            "What is Flask and how is it different from FastAPI?",
            "How do you create routes in Flask?"
        ],
        "sql": [
            "What is the difference between WHERE and HAVING?",
            "Explain primary key, foreign key, and joins in SQL."
        ],
        "postgresql": [
            "Why is PostgreSQL used in production applications?",
            "How do you connect FastAPI with PostgreSQL?"
        ],
        "mongodb": [
            "What is the difference between SQL and NoSQL databases?",
            "When would you choose MongoDB over PostgreSQL?"
        ],
        "jwt": [
            "What is JWT authentication?",
            "What information is usually stored inside a JWT token?"
        ],
        "authentication": [
            "Explain login authentication flow in a backend application.",
            "Why should passwords be hashed before saving in database?"
        ],
        "react": [
            "What are components, props, and state in React?",
            "How does React communicate with backend APIs?"
        ],
        "docker": [
            "What is Docker and why is it useful for deployment?",
            "What is the purpose of a Dockerfile?"
        ],
        "git": [
            "What is Git and why do developers use it?",
            "What is the difference between git pull and git fetch?"
        ],
        "github": [
            "How do you push a project to GitHub?",
            "What is a pull request?"
        ],
        "machine learning": [
            "What is the difference between supervised and unsupervised learning?",
            "How do you evaluate a machine learning model?"
        ],
        "opencv": [
            "What is OpenCV used for?",
            "How does face detection work in OpenCV?"
        ],
        "tensorflow": [
            "What is TensorFlow used for?",
            "What is the role of layers in a neural network?"
        ],
        "data structures": [
            "Explain array, stack, queue, and linked list.",
            "How do you choose the right data structure for a problem?"
        ],
        "algorithms": [
            "What is time complexity?",
            "Explain binary search and its complexity."
        ],
        "oops": [
            "Explain inheritance, polymorphism, encapsulation, and abstraction.",
            "What is the difference between class and object?"
        ]
    }

    important_skills = matched_skills + missing_skills

    for skill in important_skills:
        if skill in skill_question_map:
            for question in skill_question_map[skill]:
                questions.append(f"{question_number}. {question}")
                question_number += 1

    if not questions:
        questions.append("1. Tell me about yourself.")
        questions.append("2. Explain your best project in detail.")
        questions.append("3. What technical challenges did you face in your project?")
        questions.append("4. Why should we hire you for this role?")

    questions.append(f"{question_number}. Explain one project from your resume that is most relevant to this job role.")
    question_number += 1

    questions.append(f"{question_number}. What was the hardest technical problem you solved in your project?")
    question_number += 1

    questions.append(f"{question_number}. How will you improve yourself for this job role in the next 30 days?")

    return "\n".join(questions)

def get_readiness_level(match_score: int):
    if match_score >= 80:
        return "Strong"
    elif match_score >= 50:
        return "Moderate"
    else:
        return "Needs Improvement"


def build_analysis_summary(analysis: Analysis):
    readiness_level = get_readiness_level(analysis.match_score)

    if analysis.match_score >= 80:
        short_summary = (
            "Candidate profile is strongly aligned with the job role. "
            "They should focus on project explanation and interview confidence."
        )
    elif analysis.match_score >= 50:
        short_summary = (
            "Candidate profile has moderate alignment with the job role. "
            "Some important job-specific skills need stronger resume proof."
        )
    else:
        short_summary = (
            "Candidate profile currently has low alignment with the job role. "
            "They should improve skills, resume keywords, and project-based evidence."
        )

    next_steps = []

    if analysis.missing_skills and analysis.missing_skills != "No major missing skills found.":
        next_steps.append("Add project-based proof for missing skills: " + analysis.missing_skills)

    next_steps.append("Improve resume bullets with measurable impact and action verbs.")
    next_steps.append("Prepare answers for generated technical and HR interview questions.")
    next_steps.append("Add GitHub, deployment link, API documentation, and project architecture details.")

    return {
        "analysis_id": analysis.id,
        "candidate_id": analysis.candidate_id,
        "job_title": analysis.job_title,
        "company_name": analysis.company_name,
        "match_score": analysis.match_score,
        "readiness_level": readiness_level,
        "matched_skills": analysis.matched_skills,
        "missing_skills": analysis.missing_skills,
        "short_summary": short_summary,
        "next_steps": next_steps,
        "preparation_roadmap": analysis.preparation_roadmap,
    }


def extract_top_missing_skills(analyses: list[Analysis]):
    skill_count = {}

    for analysis in analyses:
        if not analysis.missing_skills:
            continue

        if analysis.missing_skills == "No major missing skills found.":
            continue

        skills = analysis.missing_skills.split(",")

        for skill in skills:
            clean_skill = skill.strip().lower()

            if not clean_skill:
                continue

            skill_count[clean_skill] = skill_count.get(clean_skill, 0) + 1

    sorted_skills = sorted(
        skill_count.items(),
        key=lambda item: item[1],
        reverse=True
    )

    top_skills = []

    for skill, count in sorted_skills[:10]:
        top_skills.append(f"{skill} ({count})")

    return top_skills


@router.post("/", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
def create_analysis(
    analysis_data: AnalysisCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "candidate":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only candidates can create analyses"
        )

    match_score, matched_skills, missing_skills, suggestions, interview_questions, preparation_roadmap = generate_analysis_output(
        resume_text=analysis_data.resume_text,
        job_description=analysis_data.job_description,
        job_title=analysis_data.job_title
    )

    new_analysis = Analysis(
        candidate_id=current_user.id,
        job_title=analysis_data.job_title,
        company_name=analysis_data.company_name,
        resume_text=analysis_data.resume_text,
        job_description=analysis_data.job_description,
        match_score=match_score,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        suggestions=suggestions,
        interview_questions=interview_questions,
        preparation_roadmap=preparation_roadmap
    )

    db.add(new_analysis)
    db.commit()
    db.refresh(new_analysis)

    return new_analysis

@router.post("/upload-resume", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def create_analysis_from_resume_pdf(
    job_title: str = Form(...),
    company_name: str | None = Form(None),
    job_description: str = Form(...),
    resume_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "candidate":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only candidates can create analyses"
        )

    resume_text = await extract_text_from_pdf(resume_file)

    match_score, matched_skills, missing_skills, suggestions, interview_questions, preparation_roadmap = generate_analysis_output(
        resume_text=resume_text,
        job_description=job_description,
        job_title=job_title
    )

    new_analysis = Analysis(
        candidate_id=current_user.id,
        job_title=job_title,
        company_name=company_name,
        resume_text=resume_text,
        job_description=job_description,
        match_score=match_score,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        suggestions=suggestions,
        interview_questions=interview_questions,
        preparation_roadmap=preparation_roadmap
    )

    db.add(new_analysis)
    db.commit()
    db.refresh(new_analysis)

    return new_analysis


@router.get("/my", response_model=list[AnalysisResponse])
def get_my_analyses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    analyses = (
        db.query(Analysis)
        .filter(Analysis.candidate_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .all()
    )

    return analyses


@router.get("/admin/all", response_model=list[AnalysisResponse])
def get_all_analyses_for_admin(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    analyses = (
        db.query(Analysis)
        .order_by(Analysis.created_at.desc())
        .all()
    )

    return analyses

@router.get("/admin/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    total_candidates = db.query(User).filter(User.role == "candidate").count()
    total_admins = db.query(User).filter(User.role == "admin").count()
    total_analyses = db.query(Analysis).count()

    analyses = db.query(Analysis).all()

    if total_analyses == 0:
        average_match_score = 0.0
    else:
        total_score = sum(analysis.match_score for analysis in analyses)
        average_match_score = round(total_score / total_analyses, 2)

    top_missing_skills = extract_top_missing_skills(analyses)

    return {
        "total_candidates": total_candidates,
        "total_admins": total_admins,
        "total_analyses": total_analyses,
        "average_match_score": average_match_score,
        "top_missing_skills": top_missing_skills
    }


@router.get("/admin/candidate/{candidate_id}", response_model=list[AnalysisResponse])
def get_candidate_analyses_for_admin(
    candidate_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    candidate = db.query(User).filter(
        User.id == candidate_id,
        User.role == "candidate"
    ).first()

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )

    analyses = (
        db.query(Analysis)
        .filter(Analysis.candidate_id == candidate_id)
        .order_by(Analysis.created_at.desc())
        .all()
    )

    return analyses


@router.get("/{analysis_id}/summary", response_model=AnalysisSummaryResponse)
def get_analysis_summary(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )

    if current_user.role != "admin" and analysis.candidate_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to view this analysis summary"

        )

    return build_analysis_summary(analysis)

@router.get("/{analysis_id}/report")
def download_analysis_report(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )

    if current_user.role != "admin" and analysis.candidate_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to download this report"
        )

    summary = build_analysis_summary(analysis)
    branding = db.query(CompanySetting).first()

    pdf_buffer = generate_analysis_pdf_report(
        analysis=analysis,
        summary=summary,
        branding=branding
    )

    filename = f"hiremate_report_analysis_{analysis.id}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

@router.delete("/{analysis_id}")
def delete_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )

    if current_user.role != "admin" and analysis.candidate_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to delete this analysis"
        )

    db.delete(analysis)
    db.commit()

    return {
        "message": "Analysis deleted successfully",
        "analysis_id": analysis_id
    }



@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis_by_id(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )

    if current_user.role != "admin" and analysis.candidate_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to view this analysis"
        )

    return analysis