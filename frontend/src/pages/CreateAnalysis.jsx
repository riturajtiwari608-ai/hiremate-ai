import { useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/api";

function CreateAnalysis() {
  const [formData, setFormData] = useState({
    job_title: "",
    company_name: "",
    resume_text: "",
    job_description: "",
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateAnalysis = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    try {
      const response = await api.post("/analyses/", formData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Analysis failed");
    }
  };

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

  return (
    <>
      <Navbar />

      <main className="container">
        <h1>Create Resume-JD Analysis</h1>

        {error && <div className="error-box">{error}</div>}

        <form className="analysis-form" onSubmit={handleCreateAnalysis}>
          <label>Job Title</label>
          <input
            type="text"
            name="job_title"
            placeholder="Python Backend Developer"
            value={formData.job_title}
            onChange={handleChange}
            required
          />

          <label>Company Name</label>
          <input
            type="text"
            name="company_name"
            placeholder="Demo Company"
            value={formData.company_name}
            onChange={handleChange}
          />

          <label>Resume Text</label>
          <textarea
            name="resume_text"
            placeholder="Paste your resume text here..."
            value={formData.resume_text}
            onChange={handleChange}
            rows="8"
            required
          />

          <label>Job Description</label>
          <textarea
            name="job_description"
            placeholder="Paste job description here..."
            value={formData.job_description}
            onChange={handleChange}
            rows="8"
            required
          />

          <button type="submit" className="primary-btn">
            Analyze
          </button>
        </form>

        {result && (
          <div className="result-card">
            <h2>Analysis Result</h2>

            <p>
              <strong>Match Score:</strong> {result.match_score}%
            </p>

            <p>
              <strong>Matched Skills:</strong> {result.matched_skills}
            </p>

            <p>
              <strong>Missing Skills:</strong> {result.missing_skills}
            </p>

            <p>
              <strong>Suggestions:</strong> {result.suggestions}
            </p>

            <h3>Interview Questions</h3>
            <pre>{result.interview_questions}</pre>

            <button
              className="secondary-btn"
              onClick={() => downloadReport(result.id)}
            >
              Download PDF Report
            </button>
          </div>
        )}
      </main>
    </>
  );
}

export default CreateAnalysis;