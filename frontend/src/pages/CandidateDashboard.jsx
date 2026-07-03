import Navbar from "../components/Navbar";

function CandidateDashboard() {
  const fullName = localStorage.getItem("full_name") || "Candidate";

  return (
    <>
      <Navbar />

      <main className="container">
        <div className="hero-card">
          <h1>Welcome, {fullName}</h1>
          <p>
            Analyze your resume against job descriptions, check missing skills,
            generate interview questions, and download readiness reports.
          </p>
        </div>

        <div className="grid-3">
          <div className="info-card">
            <h3>Create Analysis</h3>
            <p>Paste resume text and job description to get match score.</p>
          </div>

          <div className="info-card">
            <h3>Interview Questions</h3>
            <p>Get role-specific technical and project-based questions.</p>
          </div>

          <div className="info-card">
            <h3>PDF Report</h3>
            <p>Download a professional hiring readiness report.</p>
          </div>
        </div>
      </main>
    </>
  );
}

export default CandidateDashboard;