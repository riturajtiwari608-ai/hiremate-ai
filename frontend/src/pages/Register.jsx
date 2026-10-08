import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "candidate",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role === "admin") {
      navigate("/admin/dashboard");
    }
    if (token && role === "candidate") {
      navigate("/candidate/dashboard");
    }
  }, [navigate]);

  // Calculate Password Strength
  const evaluatePassword = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "#e2e8f0", width: "0%" };

    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) {
      return { score: 1, label: "Weak 🔴", color: "#ef4444", width: "25%" };
    } else if (score === 2) {
      return { score: 2, label: "Fair 🟠", color: "#f97316", width: "50%" };
    } else if (score === 3) {
      return { score: 3, label: "Medium 🟡", color: "#eab308", width: "75%" };
    } else {
      return { score: 4, label: "Strong 🟢", color: "#10b981", width: "100%" };
    }
  };

  const strength = evaluatePassword(formData.password);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/auth/register", formData);
      setSuccess("Account successfully created! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Dynamic Ambient Background Elements */}
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>
      <div className="ambient-orb orb-3"></div>

      <div className="auth-card-v2 auth-card-register">
        {/* Brand Header */}
        <div className="auth-brand-header">
          <div className="auth-logo-badge">
            <span className="auth-logo-icon">🚀</span>
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join HireMate AI and fast-track your hiring readiness</p>
        </div>

        {error && (
          <div className="modern-error-box">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="modern-success-box">
            <span className="success-icon">✅</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="auth-form-v2">
          {/* Full Name */}
          <div className="input-group-modern">
            <label>Full Name</label>
            <div className="input-field-wrapper">
              <span className="field-prefix-icon">👤</span>
              <input
                type="text"
                name="full_name"
                placeholder="e.g. Alex Johnson"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="input-group-modern">
            <label>Email Address</label>
            <div className="input-field-wrapper">
              <span className="field-prefix-icon">📧</span>
              <input
                type="email"
                name="email"
                placeholder="alex@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password with Strength Meter */}
          <div className="input-group-modern">
            <div className="label-row-between">
              <label>Password</label>
              {formData.password && (
                <span
                  className="strength-badge-pill"
                  style={{ color: strength.color, borderColor: strength.color }}
                >
                  {strength.label}
                </span>
              )}
            </div>
            <div className="input-field-wrapper">
              <span className="field-prefix-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-pwd-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {/* Password Strength Progress Bar */}
            {formData.password && (
              <div className="strength-meter-container">
                <div
                  className="strength-meter-fill"
                  style={{
                    width: strength.width,
                    backgroundColor: strength.color,
                  }}
                ></div>
              </div>
            )}
          </div>

          {/* Account Role */}
          <div className="input-group-modern">
            <label>I am joining as a</label>
            <div className="role-selector-grid">
              <label
                className={`role-choice-card ${formData.role === "candidate" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="role"
                  value="candidate"
                  checked={formData.role === "candidate"}
                  onChange={handleChange}
                  className="hidden-radio"
                />
                <span className="role-icon">💼</span>
                <span className="role-title">Candidate</span>
                <small className="role-desc">Practice mock interviews & ATS analysis</small>
              </label>

              <label
                className={`role-choice-card ${formData.role === "admin" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={formData.role === "admin"}
                  onChange={handleChange}
                  className="hidden-radio"
                />
                <span className="role-icon">🏛️</span>
                <span className="role-title">College / Recruiter</span>
                <small className="role-desc">Manage batch students & export CSVs</small>
              </label>
            </div>
          </div>

          <button type="submit" className="auth-primary-btn" disabled={loading}>
            {loading ? (
              <span className="btn-loader-text">
                <span className="spinner-dot"></span> Creating Account...
              </span>
            ) : (
              "Get Started Free →"
            )}
          </button>
        </form>

        <p className="auth-switch-text">
          Already have an account?{" "}
          <Link to="/login" className="auth-accent-link">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;