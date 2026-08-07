import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("rituraj@example.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

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

    try {
      const loginData = new FormData();
      loginData.append("username", email);
      loginData.append("password", password);

      const response = await api.post("/auth/login", loginData);

      localStorage.setItem("token", response.data.access_token);

      await fetchProfileAndRedirect();
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>HireMate AI</h1>
        <p>Login to your hiring readiness dashboard.</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="primary-btn">
            Login
          </button>
        </form>

        <p className="small-text">
          New user? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;