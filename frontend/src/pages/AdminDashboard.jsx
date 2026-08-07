import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/api";
import BrandingForm from "../components/BrandingForm";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [error, setError] = useState("");

  const fetchAdminData = async () => {
    try {
      const statsResponse = await api.get("/analyses/admin/stats");
      const analysesResponse = await api.get("/analyses/admin/all");

      setStats(statsResponse.data);
      setAnalyses(analysesResponse.data);
    } catch (err) {
      setError("Failed to fetch admin data. Make sure you are logged in as admin.");
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const downloadReport = async (analysisId) => {
    try {
      const response = await api.get(`/analyses/${analysisId}/report`, {
        responseType: "blob",
      });

      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      const fileLink = document.createElement("a");

      fileLink.href = fileURL;
      fileLink.setAttribute("download", `hiremate_report_${analysisId}.pdf`);
      document.body.appendChild(fileLink);

      fileLink.click();
      fileLink.remove();
    } catch (err) {
      alert("PDF download failed");
    }
  };
  const deleteAnalysis = async (analysisId) => {
    const confirmDelete = window.confirm("Delete this candidate analysis?");

    if (!confirmDelete) return;

    try {
        await api.delete(`/analyses/${analysisId}`);
        fetchAdminData();
    } catch (err) {
        alert("Delete failed");
    }
};

  return (
    <>
      <Navbar />

      <main className="container">
        <h1>Admin Dashboard</h1>
        <div className="button-row">
          <Link className="primary-link-btn dark-btn" to="/admin/users">
              Manage Users
          </Link>
        </div>
        <BrandingForm />

        {error && <div className="error-box">{error}</div>}

        {stats && (
          <div className="grid-4">
            <div className="stat-card">
              <h3>Total Candidates</h3>
              <p>{stats.total_candidates}</p>
            </div>

            <div className="stat-card">
              <h3>Total Admins</h3>
              <p>{stats.total_admins}</p>
            </div>

            <div className="stat-card">
              <h3>Total Analyses</h3>
              <p>{stats.total_analyses}</p>
            </div>

            <div className="stat-card">
              <h3>Average Score</h3>
              <p>{stats.average_match_score}%</p>
            </div>
          </div>
        )}

        {stats && (
          <div className="result-card">
            <h2>Top Missing Skills</h2>
            {stats.top_missing_skills.length === 0 ? (
              <p>No missing skills found yet.</p>
            ) : (
              <ul>
                {stats.top_missing_skills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <h2>All Candidate Analyses</h2>

        <div className="analysis-list">
          {analyses.map((item) => (
            <div className="analysis-card" key={item.id}>
              <div className="analysis-header">
                <div>
                  <h2>{item.job_title}</h2>
                  <p>
                    Candidate ID: {item.candidate_id} |{" "}
                    {item.company_name || "No company"}
                  </p>
                </div>

                <div className="score-badge">{item.match_score}%</div>
              </div>

              <p>
                <strong>Missing:</strong> {item.missing_skills}
              </p>
              <details>
                <summary>View Preparation Roadmap</summary>
                <pre>{item.preparation_roadmap}</pre>
              </details>
              <button
                className="secondary-btn"
                onClick={() => downloadReport(item.id)}
              >
                Download PDF Report
              </button>
              <button
                className="danger-btn"
                onClick={() => deleteAnalysis(item.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

export default AdminDashboard;