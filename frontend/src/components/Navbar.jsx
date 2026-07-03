import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("full_name");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h2>HireMate AI</h2>

      <div className="nav-links">
        {role === "candidate" && (
          <>
            <Link to="/candidate/dashboard">Dashboard</Link>
            <Link to="/candidate/create-analysis">Create Analysis</Link>
            <Link to="/candidate/my-analyses">My Analyses</Link>
          </>
        )}

        {role === "admin" && (
          <>
            <Link to="/admin/dashboard">Admin Dashboard</Link>
          </>
        )}

        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;