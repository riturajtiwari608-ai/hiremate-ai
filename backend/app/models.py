from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    role = Column(String, default="candidate")
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    analyses = relationship("Analysis", back_populates="candidate")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)

    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    job_title = Column(String, nullable=False)
    company_name = Column(String, nullable=True)

    resume_text = Column(Text, nullable=False)
    job_description = Column(Text, nullable=False)

    match_score = Column(Integer, default=0)
    matched_skills = Column(Text, nullable=True)
    missing_skills = Column(Text, nullable=True)
    suggestions = Column(Text, nullable=True)
    interview_questions = Column(Text, nullable=True)
    preparation_roadmap = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    candidate = relationship("User", back_populates="analyses")
class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)

    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=False)

    title = Column(String, nullable=False)
    status = Column(String, default="in_progress")  # in_progress/completed

    total_questions = Column(Integer, default=0)
    answered_questions = Column(Integer, default=0)
    average_score = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    candidate = relationship("User")
    analysis = relationship("Analysis")
    answers = relationship("InterviewAnswer", back_populates="session")


class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)

    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)

    score = Column(Integer, default=0)
    technical_score = Column(Integer, default=0)
    communication_score = Column(Integer, default=0)
    confidence_score = Column(Integer, default=0)

    feedback = Column(Text, nullable=True)
    improvement_tip = Column(Text, nullable=True)
    strengths = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("InterviewSession", back_populates="answers")

class CompanySetting(Base):
    __tablename__ = "company_settings"

    id = Column(Integer, primary_key=True, index=True)

    company_name = Column(String, default="HireMate AI")
    tagline = Column(String, default="AI-powered hiring readiness platform")
    logo_url = Column(String, nullable=True)
    primary_color = Column(String, default="#2563eb")
    report_title = Column(String, default="Candidate Hiring Readiness Report")

    created_at = Column(DateTime(timezone=True), server_default=func.now())