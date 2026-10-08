import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getBranding } from "../api/branding";
import { clearAuth } from "../api/auth";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");
  const fullName = localStorage.getItem("full_name") || "User";

  const [branding, setBranding] = useState({
    company_name: "HireMate AI",
    tagline: "AI-powered hiring readiness platform",
    primary_color: "#2563eb",
  });

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const data = await getBranding();
        setBranding(data);
        document.documentElement.style.setProperty(
          "--primary-color",
          data.primary_color || "#2563eb"
        );
      } catch {
        console.log("Branding load failed");
      }
    };

    loadBranding();
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      {/* Brand & Portal Badge */}
      <Link
        to={role === "admin" ? "/admin/dashboard" : "/candidate/dashboard"}
        className="brand"
      >
        <div className="brand-logo-wrapper">
          {branding.logo_url ? (
            <img src={branding.logo_url} alt="Logo" className="brand-image" />
          ) : (
            <span className="brand-logo-icon">✨</span>
          )}
        </div>

        <div className="brand-meta">
          <span className="brand-title">{branding.company_name}</span>
          <span className="portal-badge">
            <span className="portal-dot"></span>
            {role === "admin" ? "Admin Portal" : "Candidate Portal"}
          </span>
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="nav-center">
        {role === "candidate" && (
          <div className="nav-links-group">
            <Link
              to="/candidate/dashboard"
              className={`nav-item ${isActive("/candidate/dashboard") ? "active" : ""}`}
            >
              <span className="nav-icon">📊</span> Dashboard
            </Link>
            <Link
              to="/candidate/create-analysis"
              className={`nav-item ${isActive("/candidate/create-analysis") ? "active" : ""}`}
            >
              <span className="nav-icon">⚡</span> Create Analysis
            </Link>
            <Link
              to="/candidate/my-analyses"
              className={`nav-item ${isActive("/candidate/my-analyses") ? "active" : ""}`}
            >
              <span className="nav-icon">📑</span> My Analyses
            </Link>
            <Link
              to="/candidate/interviews"
              className={`nav-item ${isActive("/candidate/interviews") ? "active" : ""}`}
            >
              <span className="nav-icon">🎙️</span> Mock Interviews
            </Link>
            <Link
              to="/candidate/analytics"
              className={`nav-item ${isActive("/candidate/analytics") ? "active" : ""}`}
            >
              <span className="nav-icon">📈</span> Analytics
            </Link>
          </div>
        )}

        {role === "admin" && (
          <div className="nav-links-group">
            <Link
              to="/admin/dashboard"
              className={`nav-item ${isActive("/admin/dashboard") ? "active" : ""}`}
            >
              <span className="nav-icon">📊</span> Admin Overview
            </Link>
            <Link
              to="/admin/users"
              className={`nav-item ${isActive("/admin/users") ? "active" : ""}`}
            >
              <span className="nav-icon">👥</span> Users & Candidates
            </Link>
          </div>
        )}
      </div>

      {/* Integrated User Profile & Logout */}
      <div className="nav-user-section">
        <div className="user-profile-badge">
          <div className="user-avatar-circle">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className="user-info-text">
            <span className="user-display-name">{fullName}</span>
            <span className="user-role-label">{role || "Member"}</span>
          </div>
        </div>

        <button onClick={handleLogout} className="nav-logout-btn" title="Sign out">
          <svg
            className="logout-svg-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
