import sys
import os

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database import Base, engine, SessionLocal
from app.models import User, Analysis, InterviewSession, InterviewAnswer, CompanySetting
from app.auth import hash_password

def seed():
    print("[*] Initializing HireMate AI Database and Seeding Demo Data...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. White-label default company settings
        setting = db.query(CompanySetting).first()
        if not setting:
            setting = CompanySetting(
                company_name="HireMate AI",
                tagline="AI-powered hiring readiness and interview preparation platform",
                primary_color="#2563eb",
                report_title="Candidate Hiring Readiness & Placement Report"
            )
            db.add(setting)

        # 2. Seed Admin User
        admin_email = "admin@hiremate.ai"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                full_name="Sarah Jenkins (HR Director)",
                email=admin_email,
                hashed_password=hash_password("admin123"),
                role="admin",
                is_active=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print(f"[+] Created Admin: {admin.email} / admin123")

        # 3. Seed Demo Candidate
        demo_cand_email = "candidate@hiremate.ai"
        demo_cand = db.query(User).filter(User.email == demo_cand_email).first()
        if not demo_cand:
            demo_cand = User(
                full_name="Alex Rivera",
                email=demo_cand_email,
                hashed_password=hash_password("candidate123"),
                role="candidate",
                is_active=True
            )
            db.add(demo_cand)
            db.commit()
            db.refresh(demo_cand)
            print(f"[+] Created Demo Candidate: {demo_cand.email} / candidate123")

        # 4. Seed Additional Realistic Candidates
        sample_candidates_data = [
            ("Rohan Sharma", "rohan.sharma@example.com", "Python Backend Developer", "FinTech Global", 86, "python, fastapi, sql, postgresql, docker, rest api", "redis, aws"),
            ("Priya Patel", "priya.patel@example.com", "Frontend React Engineer", "SaaSify Inc", 91, "react, javascript, typescript, html, css, tailwind", "next.js, cypress"),
            ("David Kim", "david.kim@example.com", "Machine Learning Engineer", "NeuroAI Labs", 78, "python, machine learning, tensorflow, pytorch, pandas, numpy", "docker, kubernetes, mlops"),
            ("Ananya Gupta", "ananya.gupta@example.com", "Full Stack Developer", "CloudScale Tech", 64, "python, react, sql, git, html, css", "fastapi, docker, redis, microservices"),
            ("Marcus Vance", "marcus.v@example.com", "DevOps & Cloud Engineer", "InfraCore Systems", 52, "git, github, linux, docker", "aws, terraform, kubernetes, ci/cd"),
        ]

        for full_name, email, job_title, company, score, matched, missing in sample_candidates_data:
            existing = db.query(User).filter(User.email == email).first()
            if not existing:
                cand_user = User(
                    full_name=full_name,
                    email=email,
                    hashed_password=hash_password("password123"),
                    role="candidate",
                    is_active=True
                )
                db.add(cand_user)
                db.commit()
                db.refresh(cand_user)

                # Create Analysis
                analysis = Analysis(
                    candidate_id=cand_user.id,
                    job_title=job_title,
                    company_name=company,
                    resume_text=f"Experienced professional specializing in {matched}. Built scalable software solutions and high-performance APIs.",
                    job_description=f"We are hiring a {job_title} proficient in {matched}, {missing}.",
                    match_score=score,
                    matched_skills=matched,
                    missing_skills=missing,
                    suggestions=f"Strong match for core skills. Recommend adding production proof and certifications for missing skills: {missing}.",
                    interview_questions=f"1. Explain your experience working with {matched.split(',')[0].strip()}.\n2. How do you handle database concurrency and indexing in production?\n3. Describe the hardest technical bug you solved.\n4. Why are you interested in joining {company}?",
                    preparation_roadmap=f"Day 1: Revise {matched}\nDay 2: Practice system design questions\nDay 3: Deep dive into missing skills ({missing})\nDay 4: Technical mock interview\nDay 5: Behavioral STAR answers\nDay 6: Mini project showcase\nDay 7: Final revision"
                )
                db.add(analysis)
                db.commit()
                db.refresh(analysis)

                # Create Mock Interview Session
                session = InterviewSession(
                    candidate_id=cand_user.id,
                    analysis_id=analysis.id,
                    title=f"Mock Interview - {job_title}",
                    total_questions=3,
                    answered_questions=3,
                    average_score=score,
                    status="completed"
                )
                db.add(session)
                db.commit()
                db.refresh(session)

                # Add answers
                answers_data = [
                    (f"Explain your experience working with {matched.split(',')[0].strip()}.", f"I have built production-grade web services using {matched.split(',')[0].strip()} for over 2 years, implementing clean architecture and unit tests.", score, score + 2, score - 3, score),
                    ("How do you handle database concurrency and indexing?", "I utilize B-Tree indexing on frequently queried foreign keys and leverage database transactions with proper isolation levels.", score + 4, score + 5, score + 2, score + 4),
                    (f"Why are you interested in joining {company}?", f"I admire {company}'s engineering culture and high-scale product impact. My technical skill set aligns directly with your team's goals.", score - 2, score - 1, score, score - 2)
                ]

                for q, a, s, tech_s, comm_s, conf_s in answers_data:
                    ans = InterviewAnswer(
                        session_id=session.id,
                        question=q,
                        answer=a,
                        score=s,
                        technical_score=tech_s,
                        communication_score=comm_s,
                        confidence_score=conf_s,
                        feedback="Solid structured answer with technical proof.",
                        strengths="Good structure, technical depth, relevant examples",
                        weaknesses="Could add more quantifiable business metrics",
                        improvement_tip="Always end with measurable impact (e.g. reduced latency by 30%)."
                    )
                    db.add(ans)

                db.commit()
                print(f"  [-] Seeded Candidate & Analysis: {full_name} ({job_title}, Score: {score}%)")

        print("\n==================================================")
        print("DEMO SEED COMPLETED SUCCESSFULLY!")
        print("==================================================")
        print("Admin Login:     admin@hiremate.ai     / admin123")
        print("Candidate Login: candidate@hiremate.ai / candidate123")
        print("==================================================")

    except Exception as e:
        db.rollback()
        print(f"[!] Seeding error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
