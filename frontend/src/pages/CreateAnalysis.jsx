import { useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/api";

function CreateAnalysis() {
  const [mode, setMode] = useState("pdf");

  const [formData, setFormData] = useState({
    job_title: "",
    company_name: "",
    resume_text: "",
    job_description: "",
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const createTextAnalysis = async () => {
    const response = await api.post("/analyses/", formData);
    return response.data;
  };

  const createPdfAnalysis = async () => {
    if (!resumeFile) {
      throw new Error("Please upload your resume PDF");
    }

    const uploadData = new FormData();

    uploadData.append("job_title", formData.job_title);
    uploadData.append("company_name", formData.company_name);
    uploadData.append("job_description", formData.job_description);
    uploadData.append("resume_file", resumeFile);

    const response = await api.post("/analyses/upload-resume", uploadData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  };

  const handleCreateAnalysis = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      let analysisResult;

      if (mode === "pdf") {
        analysisResult = await createPdfAnalysis();
      } else {
        analysisResult = await createTextAnalysis();
      }

      setResult(analysisResult);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Analysis failed. Please try again."
      );
    } finally {
      setLoading(false);
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
        <div className="page-header">
          <p className="eyebrow dark-eyebrow">Resume Analysis</p>
          <h1>Create Resume-JD Analysis</h1>
          <p>
            Upload a resume PDF or paste resume text, then compare it with a job
            description.
          </p>
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="mode-tabs">
          <button
            className={mode === "pdf" ? "active-tab" : ""}
            onClick={() => setMode("pdf")}
            type="button"
          >
            Upload Resume PDF
          </button>

          <button
            className={mode === "text" ? "active-tab" : ""}
            onClick={() => setMode("text")}
            type="button"
          >
            Paste Resume Text
          </button>
        </div>

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

          {mode === "pdf" ? (
            <>
              <label>Upload Resume PDF</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                required
              />

              {resumeFile && (
                <p className="file-note">
                  Selected file: <strong>{resumeFile.name}</strong>
                </p>
              )}
            </>
          ) : (
            <>
              <label>Resume Text</label>
              <textarea
                name="resume_text"
                placeholder="Paste your resume text here..."
                value={formData.resume_text}
                onChange={handleChange}
                rows="8"
                required={mode === "text"}
              />
            </>
          )}

          <label>Job Description</label>
          <textarea
            name="job_description"
            placeholder="Paste job description here..."
            value={formData.job_description}
            onChange={handleChange}
            rows="8"
            required
          />

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </form>

        {result && (
          <div className="result-card">
            <div className="analysis-header">
              <div>
                <h2>Analysis Result</h2>
                <p>
                  {result.job_title}{" "}
                  {result.company_name ? `at ${result.company_name}` : ""}
                </p>
              </div>

              <div className="score-badge">{result.match_score}%</div>
            </div>

            <p>
              <strong>Matched Skills:</strong> {result.matched_skills}
            </p>

            <p>
              <strong>Missing Skills:</strong> {result.missing_skills}
            </p>

            <p>
              <strong>Suggestions:</strong> {result.suggestions}
            </p>
            <h3>Preparation Roadmap</h3>
            <pre>{result.preparation_roadmap}</pre>

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