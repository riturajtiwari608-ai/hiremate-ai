import { useEffect, useState } from "react";
import { getBranding, updateBranding } from "../api/branding";

function BrandingForm() {
  const [formData, setFormData] = useState({
    company_name: "",
    tagline: "",
    logo_url: "",
    primary_color: "#2563eb",
    report_title: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadBranding = async () => {
    try {
      const data = await getBranding();

      setFormData({
        company_name: data.company_name || "",
        tagline: data.tagline || "",
        logo_url: data.logo_url || "",
        primary_color: data.primary_color || "#2563eb",
        report_title: data.report_title || "",
      });
    } catch (err) {
      setError("Failed to load branding");
    }
  };

  useEffect(() => {
    loadBranding();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const updated = await updateBranding(formData);

      document.documentElement.style.setProperty(
        "--primary-color",
        updated.primary_color || "#2563eb"
      );

      setMessage("Branding updated successfully. Refresh pages to see all changes.");
    } catch (err) {
      setError(err.response?.data?.detail || "Branding update failed");
    }
  };

  return (
    <div className="result-card">
      <h2>White-label Branding Settings</h2>
      <p>
        Customize platform name, logo, primary color, and PDF report title for
        the buyer company.
      </p>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleUpdate}>
        <label>Company Name</label>
        <input
          type="text"
          name="company_name"
          value={formData.company_name}
          onChange={handleChange}
          placeholder="TalentBridge AI"
        />

        <label>Tagline</label>
        <input
          type="text"
          name="tagline"
          value={formData.tagline}
          onChange={handleChange}
          placeholder="Smart hiring readiness platform"
        />

        <label>Logo URL</label>
        <input
          type="text"
          name="logo_url"
          value={formData.logo_url}
          onChange={handleChange}
          placeholder="https://example.com/logo.png"
        />

        <label>Primary Color</label>
        <input
          type="color"
          name="primary_color"
          value={formData.primary_color}
          onChange={handleChange}
        />

        <label>PDF Report Title</label>
        <input
          type="text"
          name="report_title"
          value={formData.report_title}
          onChange={handleChange}
          placeholder="Candidate Readiness Report"
        />

        <button type="submit" className="primary-btn">
          Save Branding
        </button>
      </form>
    </div>
  );
}

export default BrandingForm;