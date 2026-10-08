import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { clearAuth, hasValidSession } from "../api/auth";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("candidate@hiremate.ai");
  const [password, setPassword] = useState("candidate123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotStep, setForgotStep] = useState(1); // 1: enter email, 2: set new password
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!hasValidSession()) {
      clearAuth();
      return;
    }

    if (token && role === "admin") {
      navigate("/admin/dashboard");
    }

    if (token && role === "candidate") {
      navigate("/candidate/dashboard");
    }
  }, [navigate]);

  const fetchProfileAndRedirect = async () => {
    const response = await api.get("/users/me");
    const user = response.data;

    localStorage.setItem("role", user.role);
    localStorage.setItem("full_name", user.full_name);

    if (user.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/candidate/dashboard");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginData = new FormData();
      loginData.append("username", email);
      loginData.append("password", password);

      const response = await api.post("/auth/login", loginData);
      localStorage.setItem("token", response.data.access_token);
      await fetchProfileAndRedirect();
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotMsg("");
    setForgotLoading(true);

    try {
      await api.post("/auth/forgot-password", { email: forgotEmail });
      setForgotMsg("Account verified! Please set your new password below.");
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.response?.data?.detail || "No account found with this email address.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotMsg("");
    setForgotLoading(true);

    try {
      await api.post("/auth/reset-password", {
        email: forgotEmail,
        new_password: newPassword,
      });
      setForgotMsg("🎉 Password successfully reset! You can now log in.");
      setTimeout(() => {
        setShowForgotModal(false);
        setPassword(newPassword);
        setEmail(forgotEmail);
        setForgotStep(1);
        setForgotMsg("");
      }, 1500);
    } catch (err) {
      setForgotError(err.response?.data?.detail || "Failed to reset password. Minimum 6 characters.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Dynamic Ambient Background Elements */}
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>
      <div className="ambient-orb orb-3"></div>

      <div className="auth-card-v2">
        {/* Brand Header */}
        <div className="auth-brand-header">
          <div className="auth-logo-badge">
            <span className="auth-logo-icon">✨</span>
          </div>
          <h1 className="auth-title">HireMate AI</h1>
          <p className="auth-subtitle">AI-Powered Hiring Readiness & Interview Intelligence</p>
        </div>

        {error && (
          <div className="modern-error-box">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="auth-form-v2">
          <div className="input-group-modern">
            <label>Email Address</label>
            <div className="input-field-wrapper">
              <span className="field-prefix-icon">📧</span>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group-modern">
            <div className="label-row-between">
              <label>Password</label>
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => {
                  setForgotEmail(email);
                  setShowForgotModal(true);
                  setForgotStep(1);
                  setForgotError("");
                  setForgotMsg("");
                }}
              >
                Forgot password?
              </button>
            </div>
            <div className="input-field-wrapper">
              <span className="field-prefix-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <button type="submit" className="auth-primary-btn" disabled={loading}>
            {loading ? (
              <span className="btn-loader-text">
                <span className="spinner-dot"></span> Authenticating...
              </span>
            ) : (
              "Sign In to Dashboard →"
            )}
          </button>
        </form>

        <div className="auth-footer-divider">
          <span>or</span>
        </div>

        <p className="auth-switch-text">
          Don't have an account?{" "}
          <Link to="/register" className="auth-accent-link">
            Create Free Account
          </Link>
        </p>
      </div>

      {/* Forgot Password Glass Modal */}
      {showForgotModal && (
        <div className="modal-backdrop-blur">
          <div className="forgot-password-modal">
            <div className="modal-header-row">
              <h3>🔑 Reset Your Password</h3>
              <button
                className="modal-close-icon"
                onClick={() => setShowForgotModal(false)}
              >
                ✕
              </button>
            </div>

            {forgotError && (
              <div className="modern-error-box">
                <span>⚠️ {forgotError}</span>
              </div>
            )}
            {forgotMsg && (
              <div className="modern-success-box">
                <span>{forgotMsg}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleSendResetEmail} className="modal-form">
                <p className="modal-desc">
                  Enter your registered account email to verify your identity.
                </p>
                <div className="input-group-modern">
                  <label>Account Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="modal-btn-row">
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="auth-primary-btn"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? "Verifying..." : "Continue →"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="modal-form">
                <p className="modal-desc">
                  Enter your new password below (minimum 6 characters).
                </p>
                <div className="input-group-modern">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
                <div className="modal-btn-row">
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => setForgotStep(1)}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="auth-primary-btn"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? "Saving..." : "Update Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
