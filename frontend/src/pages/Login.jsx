import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleSelection, setRoleSelection] = useState("admin"); // 'admin' or 'intern'
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "intern") {
        navigate("/intern");
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);
      const { token, user } = response.data;

      // Check if user's actual role matches their intended login selection
      // If we want a unified login, we can let the API decide the role and redirect automatically,
      // but showing warning if there's a mismatch is nice, or we can just bypass and log in anyway.
      // Let's just log them in and redirect based on their actual role returned by the API.
      
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("name", user.name);
      localStorage.setItem("email", user.email);
      localStorage.setItem("id", user.id);

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/intern");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-glow-orb-1"></div>
      <div className="login-glow-orb-2"></div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🌀</div>
          <h1 className="login-title">Welcome to InternSphere</h1>
          <p className="login-subtitle">Manage, assign, and track internship progress seamlessly</p>
        </div>

        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${roleSelection === "admin" ? "active" : ""}`}
            onClick={() => setRoleSelection("admin")}
          >
            Admin Portal
          </button>
          <button
            type="button"
            className={`login-tab ${roleSelection === "intern" ? "active" : ""}`}
            onClick={() => setRoleSelection("intern")}
          >
            Intern Portal
          </button>
        </div>

        {error && <div className="login-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="e.g. name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg btn-login"
            disabled={loading}
          >
            {loading ? "Authenticating..." : `Sign In as ${roleSelection === "admin" ? "Admin" : "Intern"}`}
          </button>
        </form>

        <div className="login-footer">
          <p>InternSphere © 2026 • Secure Enterprise Portal</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
