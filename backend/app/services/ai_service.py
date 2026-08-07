import json
import re

from app.database import settings


def clean_json_response(text: str) -> str:
    """
    Gemini kabhi-kabhi JSON ko ```json block me return karta hai.
    Ye function usko clean karega.
    """
    text = text.strip()

    text = re.sub(r"^```json", "", text)
    text = re.sub(r"^```", "", text)
    text = re.sub(r"```$", "", text)

    return text.strip()


def build_ai_prompt(resume_text: str, job_description: str, job_title: str):
    return f"""
You are an AI hiring readiness evaluator.

Analyze the candidate resume against the job description.

Return ONLY valid JSON. Do not include markdown, explanation, or extra text.

JSON format:
{{
  "match_score": 0,
  "matched_skills": "comma separated matched skills",
  "missing_skills": "comma separated missing skills",
  "suggestions": "clear resume improvement suggestions in 5-7 lines",
  "interview_questions": "numbered technical, HR, and project-based questions separated by new lines",
  "preparation_roadmap": "7 day preparation roadmap in clear steps"
}}

Rules:
- match_score should be from 0 to 100.
- Focus on real hiring readiness.
- Make suggestions practical for a fresher.
- Interview questions should be role-specific.
- Include project-based questions if resume has project details.
- Keep response useful for Indian fresher/intern/SDE hiring.

Job Title:
{job_title}

Resume:
{resume_text[:6000]}

Job Description:
{job_description[:4000]}
"""


def analyze_with_gemini(resume_text: str, job_description: str, job_title: str):
    """
    Gemini se AI analysis generate karega.
    Agar API key missing ya error hua, to None return karega.
    """

    if not settings.USE_GEMINI:
        return None

    if not settings.GEMINI_API_KEY:
        return None

    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.GEMINI_API_KEY)

        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = build_ai_prompt(
            resume_text=resume_text,
            job_description=job_description,
            job_title=job_title
        )

        response = model.generate_content(prompt)

        if not response or not response.text:
            return None

        cleaned_text = clean_json_response(response.text)

        parsed = json.loads(cleaned_text)

        return {
            "match_score": int(parsed.get("match_score", 0)),
            "matched_skills": str(parsed.get("matched_skills", "")),
            "missing_skills": str(parsed.get("missing_skills", "")),
            "suggestions": str(parsed.get("suggestions", "")),
            "interview_questions": str(parsed.get("interview_questions", "")),
            "preparation_roadmap": str(parsed.get("preparation_roadmap", "")),
        }

    except Exception as error:
        print("Gemini analysis failed:", error)
        return None
def build_answer_evaluation_prompt(question: str, answer: str, job_title: str):
    return f"""
You are an AI technical interviewer.

Evaluate the candidate answer for the given interview question.

Return ONLY valid JSON. Do not include markdown or extra text.

JSON format:
{{
  "score": 0,
  "technical_score": 0,
  "communication_score": 0,
  "confidence_score": 0,
  "feedback": "clear feedback in 3-4 lines",
  "strengths": "comma separated strengths",
  "weaknesses": "comma separated weaknesses",
  "improvement_tip": "specific improvement tip"
}}

Rules:
- All scores should be from 0 to 100.
- score means overall answer score.
- technical_score means correctness and depth.
- communication_score means clarity, structure, and explanation quality.
- confidence_score means how confident and interview-ready the answer sounds.
- Be strict but helpful for a fresher.
- If answer is too short or vague, give low score.
- If answer has examples and project connection, give better score.
- Do not give unrealistic high score for generic answers.

Job Title:
{job_title}

Question:
{question}

Candidate Answer:
{answer}
"""


def evaluate_answer_with_gemini(question: str, answer: str, job_title: str):
    if not settings.USE_GEMINI:
        return None

    if not settings.GEMINI_API_KEY:
        return None

    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.GEMINI_API_KEY)

        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = build_answer_evaluation_prompt(
            question=question,
            answer=answer,
            job_title=job_title
        )

        response = model.generate_content(prompt)

        if not response or not response.text:
            return None

        cleaned_text = clean_json_response(response.text)

        parsed = json.loads(cleaned_text)

        return {
            "score": int(parsed.get("score", 0)),
            "technical_score": int(parsed.get("technical_score", parsed.get("score", 0))),
            "communication_score": int(parsed.get("communication_score", parsed.get("score", 0))),
            "confidence_score": int(parsed.get("confidence_score", parsed.get("score", 0))),
            "feedback": str(parsed.get("feedback", "")),
            "strengths": str(parsed.get("strengths", "")),
            "weaknesses": str(parsed.get("weaknesses", "")),
            "improvement_tip": str(parsed.get("improvement_tip", "")),
}

    except Exception as error:
        print("Gemini answer evaluation failed:", error)
        return None
