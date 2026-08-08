# 🚀 HireMate AI

> AI-powered career intelligence platform that helps candidates analyze their resumes, understand job requirements, practice interviews, and track their interview performance.

HireMate AI is a full-stack web application designed to bridge the gap between a candidate's resume and real-world job requirements.

The platform combines resume analysis, job-description matching, AI-powered interview preparation, mock interviews, performance analytics, and personalized career recommendations in one application.

---

## ✨ Key Features

### 🔐 Authentication

- User registration
- User login
- JWT-based authentication
- Protected routes
- Secure password hashing
- Automatic token handling

---

### 📄 Resume & Job Analysis

Users can upload their resume and provide a Job Description.

HireMate AI analyzes both and provides:

- Resume vs Job Description match score
- Matching skills
- Missing skills
- Resume improvement suggestions
- Job-specific recommendations
- Interview preparation questions

---

### 🤖 AI-Powered Analysis

The platform uses AI to generate intelligent career insights such as:

- Resume feedback
- Job-specific interview questions
- Technical interview questions
- HR interview questions
- Candidate improvement suggestions
- Project explanation assistance
- Interview answer evaluation

---

### 🎤 AI Mock Interview

Candidates can practice interviews inside the platform.

Features include:

- Interview session creation
- Job-specific questions
- Candidate answers
- Answer evaluation
- Technical score
- Communication score
- Confidence score
- Overall interview score
- Interview feedback
- Interview history

---

### 📊 Analytics Dashboard

Candidates can track their progress through a dedicated analytics dashboard.

The dashboard provides:

- Overall performance score
- Technical performance
- Communication performance
- Confidence score
- Total interviews
- Completed interviews
- Strengths
- Weaknesses
- Improvement recommendations
- Skill performance chart
- Interview history

---

## 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │      User / HR       │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    React Frontend    │
                         │      Vite + UI       │
                         └──────────┬───────────┘
                                    │
                              REST API / JSON
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    FastAPI Backend   │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       Authentication          Resume Analysis       Interview Engine
              │                     │                     │
              ▼                     ▼                     ▼
          JWT Auth              AI Services          Answer Evaluation
                                    │
                                    ▼
                              Gemini / AI Layer
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    PostgreSQL DB     │
                         └──────────────────────┘