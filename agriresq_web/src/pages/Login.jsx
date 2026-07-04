import React, { useState } from "react";
import { Link } from "react-router-dom"; // Added this import so the forgot password route works!

export default function Login({ onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("agriresq_users") || "[]");
    const match = users.find(
      (u) => u.email === email && u.password === password
    );

    if (match) {
      setError("");
      // Save logged in user so Profile can read it
      localStorage.setItem("agriresq_current_user", JSON.stringify(match));
      onLogin();
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Left green panel */}
      <div style={{
        background: "#1D9E75",
        width: "280px",
        flexShrink: 0,
        padding: "2.5rem 2rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}>
        <div>
          <div style={{
            width: "40px", height: "40px",
            background: "rgba(255,255,255,0.15)",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "12px", fontSize: "20px"
          }}>🌿</div>
          <p style={{ fontSize: "20px", fontWeight: 600, color: "#E1F5EE", margin: 0 }}>AgriResQ</p>
          <p style={{ fontSize: "12px", color: "#9FE1CB", margin: "4px 0 0" }}>Digital Vegetable Platform</p>
        </div>

        <div>
          <p style={{ fontSize: "13px", color: "#9FE1CB", lineHeight: 1.6 }}>
            Connecting farmers and buyers across Cagayan de Oro City.
          </p>
          <div style={{
            background: "rgba(255,255,255,0.12)",
            borderRadius: "8px", padding: "8px 12px", marginTop: "8px"
          }}>
            <div style={{ fontSize: "18px", fontWeight: 600, color: "#E1F5EE" }}>42</div>
            <div style={{ fontSize: "11px", color: "#9FE1CB" }}>Active respondents</div>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.12)",
            borderRadius: "8px", padding: "8px 12px", marginTop: "6px"
          }}>
            <div style={{ fontSize: "18px", fontWeight: 600, color: "#E1F5EE" }}>Bulua</div>
            <div style={{ fontSize: "11px", color: "#9FE1CB" }}>Primary terminal</div>
          </div>
        </div>

        <p style={{ fontSize: "11px", color: "#5DCAA5", margin: 0 }}>Cagayan de Oro City, PH</p>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc"
      }}>
        <div style={{ width: "100%", maxWidth: "400px", padding: "2rem" }}>

          <p style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px", color: "#1a1a1a" }}>
            Welcome back
          </p>
          <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 2rem" }}>
            Sign in to your AgriResQ account
          </p>

          <form onSubmit={handleLogin}>

            {error && (
              <div style={{
                background: "#fee2e2", color: "#b91c1c",
                borderRadius: "8px", padding: "10px 14px",
                fontSize: "13px", marginBottom: "1rem"
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: "1rem" }}>
              <label style={{
                fontSize: "12px", color: "#64748b",
                display: "block", marginBottom: "6px"
              }}>
                Email address
              </label>
              <input
                type="email"
                placeholder="you@agriresq.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%", padding: "10px 12px",
                  border: "1px solid #e2e8f0", borderRadius: "8px",
                  fontSize: "14px", outline: "none",
                  boxSizing: "border-box", background: "#fff", color: "#1a1a1a"
                }}
              />
            </div>

            <div style={{ marginBottom: "0.5rem" }}>
              <label style={{
                fontSize: "12px", color: "#64748b",
                display: "block", marginBottom: "6px"
              }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%", padding: "10px 12px",
                  border: "1px solid #e2e8f0", borderRadius: "8px",
                  fontSize: "14px", outline: "none",
                  boxSizing: "border-box", background: "#fff", color: "#1a1a1a"
                }}
              />
            </div>

            <div style={{ textAlign: "right", marginBottom: "1.5rem" }}>
              {/* REPLACED THE <a> TAG WITH <Link> TO MAKE FORGOT PASSWORD WORK */}
              <Link to="/forgot-password" style={{ fontSize: "12px", color: "#1D9E75", textDecoration: "none" }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              style={{
                width: "100%", padding: "11px",
                background: "#1D9E75", color: "#fff",
                border: "none", borderRadius: "8px",
                fontSize: "15px", fontWeight: 600,
                cursor: "pointer", marginBottom: "1rem"
              }}
              onMouseOver={(e) => e.target.style.background = "#0F6E56"}
              onMouseOut={(e) => e.target.style.background = "#1D9E75"}
            >
              Sign in
            </button>

            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "13px", color: "#64748b" }}>Don't have an account? </span>
              <button
                type="button"
                onClick={onRegister}
                style={{
                  background: "none", border: "none",
                  color: "#1D9E75", fontSize: "13px",
                  fontWeight: 600, cursor: "pointer", padding: 0
                }}
              >
                Register
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}