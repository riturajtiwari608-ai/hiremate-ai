import { useState } from "react";

export default function ResumeOptimizerModal({ data, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([data.full_optimized_resume], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `ATS_Optimized_Resume_${data.job_title.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <span className="eyebrow dark-eyebrow">AI ATS Resume Optimizer</span>
            <h2>Optimized for {data.job_title}</h2>
          </div>

          <button className="close-btn" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="ats-score-banner">
            <div>
              <h3>Projected ATS Readiness</h3>
              <p>Tailored specifically with keywords and STAR format for this JD</p>
            </div>
            <div className="ats-badge">{data.ats_score}% ATS MATCH</div>
          </div>

          {data.added_keywords && data.added_keywords.length > 0 && (
            <div className="keyword-section">
              <h4>🎯 Target Keywords Injected:</h4>
              <div className="keyword-tags">
                {data.added_keywords.map((kw, i) => (
                  <span key={i} className="kw-tag">
                    +{kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="summary-section">
            <h4>✨ Tailored Professional Summary:</h4>
            <div className="summary-box">
              <p>{data.tailored_summary}</p>
              <button
                type="button"
                className="copy-mini-btn"
                onClick={() => copyToClipboard(data.tailored_summary)}
              >
                {copied ? "Copied!" : "📋 Copy Summary"}
              </button>
            </div>
          </div>

          <div className="bullets-section">
            <h4>⭐ Re-engineered Bullet Points (STAR Method):</h4>
            <ul className="star-bullets">
              {data.optimized_bullets.map((bullet, idx) => (
                <li key={idx}>
                  <strong>•</strong> {bullet}
                </li>
              ))}
            </ul>
          </div>

          <div className="full-resume-section">
            <h4>📄 Complete ATS-Formatted Plain Text Resume:</h4>
            <pre className="resume-preview">{data.full_optimized_resume}</pre>

            <div className="button-row" style={{ marginTop: "16px" }}>
              <button
                type="button"
                className="primary-btn"
                onClick={() => copyToClipboard(data.full_optimized_resume)}
              >
                {copied ? "✅ Copied Full Resume!" : "📋 Copy Full Resume"}
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={downloadTxt}
              >
                📥 Download ATS .txt File
              </button>

              <button
                type="button"
                className="secondary-btn"
                style={{ background: "#64748b" }}
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
