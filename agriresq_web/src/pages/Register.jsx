import React, { useState } from "react";

export default function Register({ onRegister, onBack }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    // Create the payload matching your Django RegisterSerializer
    const payload = {
      full_name: form.name,
      email: form.email,
      password: form.password,
      role: "WHOLESALER",       // Defaulting to Wholesaler for your Capstone
      stall_number: "Stall 1"   // Required by Django if role is WHOLESALER
    };

    try {
      // Actually send the data to Django!
      const response = await fetch('http://127.0.0.1:8000/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onRegister();
        }, 1500);
      } else {
        console.error("Django Validation Error:", data); // Add this line!
        
        // Show the actual error message coming from Django (e.g., "Email already registered")
        if (data.email) setError(data.email[0]);
        else if (data.password) setError(data.password[0]);
        else setError(data.detail || "Registration failed. Please check your details.");
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Cannot connect to the server. Is Django running?");
    } finally {
      setIsLoading(false);
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

          {success ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "1rem" }}>✅</div>
              <p style={{ fontSize: "20px", fontWeight: 700, color: "#1D9E75" }}>Account created!</p>
              <p style={{ fontSize: "14px", color: "#64748b" }}>Redirecting you to the dashboard...</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px", color: "#1a1a1a" }}>
                Create account
              </p>
              <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 2rem" }}>
                Register a new AgriResQ account
              </p>

              <form onSubmit={handleSubmit}>

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
                  <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px" }}>
                    Full name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Juan dela Cruz"
                    value={form.name}
                    onChange={handleChange}
                    style={{
                      width: "100%", padding: "10px 12px",
                      border: "1px solid #e2e8f0", borderRadius: "8px",
                      fontSize: "14px", outline: "none",
                      boxSizing: "border-box", background: "#fff", color: "#1a1a1a"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px" }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@agriresq.ph"
                    value={form.email}
                    onChange={handleChange}
                    style={{
                      width: "100%", padding: "10px 12px",
                      border: "1px solid #e2e8f0", borderRadius: "8px",
                      fontSize: "14px", outline: "none",
                      boxSizing: "border-box", background: "#fff", color: "#1a1a1a"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px" }}>
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    style={{
                      width: "100%", padding: "10px 12px",
                      border: "1px solid #e2e8f0", borderRadius: "8px",
                      fontSize: "14px", outline: "none",
                      boxSizing: "border-box", background: "#fff", color: "#1a1a1a"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px" }}>
                    Confirm password
                  </label>
                  <input
                    type="password"
                    name="confirm"
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={handleChange}
                    style={{
                      width: "100%", padding: "10px 12px",
                      border: "1px solid #e2e8f0", borderRadius: "8px",
                      fontSize: "14px", outline: "none",
                      boxSizing: "border-box", background: "#fff", color: "#1a1a1a"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: "100%", padding: "11px",
                    background: "#1D9E75", color: "#fff",
                    border: "none", borderRadius: "8px",
                    fontSize: "15px", fontWeight: 600,
                    cursor: isLoading ? "not-allowed" : "pointer", 
                    marginBottom: "1rem",
                    opacity: isLoading ? 0.7 : 1
                  }}
                  onMouseOver={(e) => !isLoading && (e.target.style.background = "#0F6E56")}
                  onMouseOut={(e) => !isLoading && (e.target.style.background = "#1D9E75")}
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </button>

                <button
                  type="button"
                  onClick={onBack}
                  style={{
                    width: "100%", padding: "11px",
                    background: "transparent", color: "#64748b",
                    border: "1px solid #e2e8f0", borderRadius: "8px",
                    fontSize: "15px", cursor: "pointer"
                  }}
                  onMouseOver={(e) => e.target.style.background = "#f1f5f9"}
                  onMouseOut={(e) => e.target.style.background = "transparent"}
                >
                  ← Back to login
                </button>

              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}