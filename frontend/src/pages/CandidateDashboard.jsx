import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getBranding } from "../api/branding";

function CandidateDashboard() {
  const fullName = localStorage.getItem("full_name") || "Candidate";
  const [branding, setBranding] = useState({
  company_name: "HireMate AI",
  tagline: "AI-powered hiring readiness platform",
});

useEffect(() => {
  const loadBranding = async () => {
    try {
      const data = await getBranding();
      setBranding(data);
    } catch (error) {
      console.log("Branding failed");
    }
  };

  loadBranding();
}, []);

  return (
    <>
      <Navbar />

      <main className="container">
        <section className="hero-card hero-gradient">
          <div>
            <p className="eyebrow">Candidate Workspace</p>
            <h1>Welcome, {fullName}</h1>
            <p>
              {branding.tagline}. Analyze your resume against job descriptions, find
              missing skills, generate interview questions, and download professional
              readiness reports.
            </p>

            <div className="button-row">
              <Link className="primary-link-btn" to="/candidate/create-analysis">
                Create New Analysis
              </Link>

              <Link className="secondary-link-btn" to="/candidate/my-analyses">
                View My Reports
              </Link>
              <Link className="secondary-link-btn" to="/candidate/interviews">
                My Interviews
              </Link>
            </div>
          </div>
        </section>

        <div className="grid-4">
          <div className="info-card">
            <h3>Resume-JD Match</h3>
            <p>
              Get a match score based on skills required in the job description.
            </p>
          </div>
          <div className="info-card">
            <h3>Mock Interview</h3>
            <p>
              Practice role-specific questions and get AI score with improvement feedback.
            </p>
          </div>

          <div className="info-card">
            <h3>Interview Questions</h3>
            <p>
              Generate technical, HR, and project-based questions from your
              analysis.
            </p>
          </div>

          <div className="info-card">
            <h3>PDF Report</h3>
            <p>
              Download a professional report you can use for preparation and
              review.
            </p>
          </div>
        </div>

        <div className="result-card">
          <h2>How to use HireMate AI</h2>
          <ol>
            <li>Paste your resume text.</li>
            <li>Paste the job description.</li>
            <li>Check match score, missing skills, and suggestions.</li>
            <li>Prepare using generated interview questions.</li>
            <li>Download the PDF readiness report.</li>
          </ol>
        </div>
      </main>
    </>
  );
}

export default CandidateDashboard;