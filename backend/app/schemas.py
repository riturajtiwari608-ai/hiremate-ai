from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator


def normalize_password(value):
    if isinstance(value, bool) or not isinstance(value, (str, int)):
        raise ValueError("Password must be a string or integer")

    return str(value)


class UserRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)
    role: str = "candidate"

    @field_validator("password", mode="before")
    @classmethod
    def allow_string_or_int_password(cls, value):
        return normalize_password(value)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(max_length=72)

    @field_validator("password", mode="before")
    @classmethod
    def allow_string_or_int_password(cls, value):
        return normalize_password(value)


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class AnalysisCreate(BaseModel):
    job_title: str = Field(min_length=2, max_length=150)
    company_name: str | None = None
    resume_text: str = Field(min_length=20)
    job_description: str = Field(min_length=20)


class AnalysisResponse(BaseModel):
    id: int
    candidate_id: int
    job_title: str
    company_name: str | None
    resume_text: str
    job_description: str
    match_score: int
    matched_skills: str | None
    missing_skills: str | None
    suggestions: str | None
    interview_questions: str | None
    preparation_roadmap: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminStatsResponse(BaseModel):
    total_candidates: int
    total_admins: int
    total_analyses: int
    average_match_score: float
    top_missing_skills: list[str]


class AnalysisSummaryResponse(BaseModel):
    analysis_id: int
    candidate_id: int
    job_title: str
    company_name: str | None
    match_score: int
    readiness_level: str
    matched_skills: str | None
    missing_skills: str | None
    short_summary: str
    next_steps: list[str]
    preparation_roadmap: str | None

class CompanySettingBase(BaseModel):
    company_name: str = "HireMate AI"
    tagline: str = "AI-powered hiring readiness platform"
    logo_url: str | None = None
    primary_color: str = "#2563eb"
    report_title: str = "Candidate Hiring Readiness Report"


class CompanySettingUpdate(BaseModel):
    company_name: str | None = None
    tagline: str | None = None
    logo_url: str | None = None
    primary_color: str | None = None
    report_title: str | None = None


class CompanySettingResponse(BaseModel):
    id: int
    company_name: str
    tagline: str
    logo_url: str | None
    primary_color: str
    report_title: str

    model_config = ConfigDict(from_attributes=True)

class UserStatusUpdate(BaseModel):
    is_active: bool
class InterviewSessionResponse(BaseModel):
    id: int
    candidate_id: int
    analysis_id: int
    title: str
    status: str
    total_questions: int
    answered_questions: int
    average_score: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InterviewAnswerSubmit(BaseModel):
    question: str = Field(min_length=5)
    answer: str = Field(min_length=10)


class InterviewAnswerResponse(BaseModel):
    id: int
    session_id: int
    question: str
    answer: str
    score: int

    technical_score: int
    communication_score: int
    confidence_score: int

    feedback: str | None
    improvement_tip: str | None
    strengths: str | None
    weaknesses: str | None

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InterviewSessionDetailResponse(BaseModel):
    session: InterviewSessionResponse
    questions: list[str]
    answers: list[InterviewAnswerResponse]


class InterviewResultResponse(BaseModel):
    session_id: int
    title: str
    status: str
    total_questions: int
    answered_questions: int
    average_score: int

    average_technical_score: int
    average_communication_score: int
    average_confidence_score: int

    overall_feedback: str
    final_recommendation: str

    answers: list[InterviewAnswerResponse]

class DashboardAnalyticsResponse(BaseModel):

    overall_score: int

    average_technical_score: int

    average_communication_score: int

    average_confidence_score: int

    total_interviews: int

    completed_interviews: int

    interview_history: list

    strengths: list[str]

    weaknesses: list[str]

    recommendations: list[str]