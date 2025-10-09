// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../../services/AuthService";
import { useAuth } from "../../context/AuthContext";
import "../../styles.css"; // ensure global styles are loaded

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const auth = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // call AuthService (it will set cookies / token)
      await AuthService.login({ username, password });
      // also update context if available
      if (auth && auth.login) {
        await auth.login(username, password);
      }
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      

      <main className="login-main">
        <div className="login-card" role="main" aria-labelledby="login-title">
          <h1 id="login-title" className="login-title">Sign in</h1>
          <p className="login-subtitle">Inventory & POS — enter credentials to continue</p>

          <form className="login-form" onSubmit={submit} noValidate>
            <label className="field">
              <span className="field-label">Username</span>
              <div className="input-wrap">
                <input
                  className="input"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </label>

            <label className="field">
              <span className="field-label">Password</span>
              <div className="input-wrap">
                <input
                  className="input"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </label>

            <div className="login-row">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              {/* <button
                type="button"
                className="link-button"
                onClick={() => alert("Use your admin credentials or demo button.")}
              >
                Forgot?
              </button> */}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn btn-primary" type="submit">Log in</button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setUsername("demo");
                  setPassword("demo");
                }}
              >
                
              </button>
            </div>

            {error && <div className="form-error" role="alert">{error}</div>}
          </form>

          <footer className="login-footer">
            <small>© {new Date().getFullYear()} Small Business — Inventory & POS</small>
          </footer>
        </div>
      </main>
    </div>
  );
}
