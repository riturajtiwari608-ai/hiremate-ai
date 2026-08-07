import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getBranding } from "../api/branding";

function Navbar() {
  const navigate = useNavigate();
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
      } catch (error) {
        console.log("Branding load failed");
      }
    };

    loadBranding();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("full_name");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link
        to={role === "admin" ? "/admin/dashboard" : "/candidate/dashboard"}
        className="brand"
      >
        {branding.logo_url ? (
          <img src={branding.logo_url} alt="Logo" className="brand-image" />
        ) : (
          <span className="brand-logo">
            {branding.company_name?.charAt(0) || "H"}
          </span>
        )}

        <div>
          <h2>{branding.company_name}</h2>
          <small>{role === "admin" ? "Admin Panel" : "Candidate Panel"}</small>
        </div>
      </Link>

      <div className="nav-links">
        {role === "candidate" && (
          <>
            <Link to="/candidate/dashboard">Dashboard</Link>
            <Link to="/candidate/create-analysis">Create Analysis</Link>
            <Link to="/candidate/my-analyses">My Analyses</Link>
            <Link to="/candidate/interviews">My Interviews</Link>
          </>
        )}

        {role === "admin" && (
          <>
    <Link to="/admin/dashboard">Dashboard</Link>
    <Link to="/admin/users">Users</Link>
  </>
)}

        <span className="user-pill">{fullName}</span>

        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;