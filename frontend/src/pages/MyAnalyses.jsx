import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/api";

function MyAnalyses() {
  const [analyses, setAnalyses] = useState([]);
  const [error, setError] = useState("");

  const fetchAnalyses = async () => {
    try {
      const response = await api.get("/analyses/my");
      setAnalyses(response.data);
    } catch (err) {
      setError("Failed to fetch analyses");
    }
  };

  useEffect(() => {
    fetchAnalyses();
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
    const confirmDelete = window.confirm("Delete this analysis?");

    if (!confirmDelete) return;

    try {
      await api.delete(`/analyses/${analysisId}`);
      fetchAnalyses();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <>
      <Navbar />

      <main className="container">
        <h1>My Analyses</h1>

        {error && <div className="error-box">{error}</div>}

        {analyses.length === 0 && (
          <p>No analyses found. Create your first analysis.</p>
        )}

        <div className="analysis-list">
          {analyses.map((item) => (
            <div className="analysis-card" key={item.id}>
              <div className="analysis-header">
                <div>
                  <h2>{item.job_title}</h2>
                  <p>{item.company_name || "No company name"}</p>
                </div>

                <div className="score-badge">{item.match_score}%</div>
              </div>

              <p>
                <strong>Matched:</strong> {item.matched_skills}
              </p>

              <p>
                <strong>Missing:</strong> {item.missing_skills}
              </p>

              <p>
                <strong>Suggestions:</strong> {item.suggestions}
              </p>

              <details>
                <summary>View Interview Questions</summary>
                <pre>{item.interview_questions}</pre>
              </details>

              <div className="button-row">
                <button
                  className="secondary-btn"
                  onClick={() => downloadReport(item.id)}
                >
                  Download PDF
                </button>

                <button
                  className="danger-btn"
                  onClick={() => deleteAnalysis(item.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

export default MyAnalyses;