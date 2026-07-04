import React, { useState, useRef } from "react";

export default function Profile() {
  const fileInputRef = useRef(null);

  const storedUser = JSON.parse(localStorage.getItem("agriresq_current_user") || "{}");

  const [name, setName] = useState(storedUser.name || "Admin Terminal");
  const [email, setEmail] = useState(storedUser.email || "");
  const [location, setLocation] = useState(storedUser.location || "Bulua Westbound");
  const [avatar, setAvatar] = useState(storedUser.avatar || null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [passErr, setPassErr] = useState("");

  const handleAvatarClick = () => fileInputRef.current.click();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileErr("");

    if (!name || !email) {
      setProfileErr("Name and email cannot be empty.");
      return;
    }

    const updatedUser = { ...storedUser, name, email, location, avatar };
    localStorage.setItem("agriresq_current_user", JSON.stringify(updatedUser));

    // Also update in users list
    const users = JSON.parse(localStorage.getItem("agriresq_users") || "[]");
    const updatedUsers = users.map((u) =>
      u.email === storedUser.email ? { ...u, name, email, location, avatar } : u
    );
    localStorage.setItem("agriresq_users", JSON.stringify(updatedUsers));

    setProfileMsg("Profile updated successfully.");
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    setPassMsg("");
    setPassErr("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassErr("Please fill in all password fields.");
      return;
    }
    if (currentPassword !== storedUser.password) {
      setPassErr("Current password is incorrect.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassErr("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPassErr("New password must be at least 6 characters.");
      return;
    }

    const updatedUser = { ...storedUser, password: newPassword };
    localStorage.setItem("agriresq_current_user", JSON.stringify(updatedUser));

    const users = JSON.parse(localStorage.getItem("agriresq_users") || "[]");
    const updatedUsers = users.map((u) =>
      u.email === storedUser.email ? { ...u, password: newPassword } : u
    );
    localStorage.setItem("agriresq_users", JSON.stringify(updatedUsers));

    setPassMsg("Password changed successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px",
    border: "1px solid #e2e8f0", borderRadius: "8px",
    fontSize: "14px", outline: "none",
    boxSizing: "border-box", background: "#fff", color: "#1a1a1a"
  };

  const labelStyle = {
    fontSize: "12px", color: "#64748b",
    display: "block", marginBottom: "6px"
  };

  const fieldWrap = { marginBottom: "1rem" };

  const successBox = {
    background: "#dcfce7", color: "#15803d",
    borderRadius: "8px", padding: "10px 14px",
    fontSize: "13px", marginBottom: "1rem"
  };

  const errorBox = {
    background: "#fee2e2", color: "#b91c1c",
    borderRadius: "8px", padding: "10px 14px",
    fontSize: "13px", marginBottom: "1rem"
  };

  const sectionCard = {
    background: "#fff", borderRadius: "12px",
    border: "1px solid #e2e8f0", padding: "1.5rem 2rem",
    marginBottom: "1.5rem"
  };

  const saveBtn = {
    padding: "10px 24px", background: "#1D9E75",
    color: "#fff", border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: 600, cursor: "pointer"
  };

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "2rem 1rem" }}>

      <p style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a1a", margin: "0 0 0.25rem" }}>
        My Profile
      </p>
      <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 2rem" }}>
        Manage your account information and password
      </p>

      {/* Avatar + Profile Info */}
      <div style={sectionCard}>
        <p style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", margin: "0 0 1.25rem" }}>
          Profile information
        </p>

        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.5rem" }}>
          <div
            onClick={handleAvatarClick}
            style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: avatar ? "transparent" : "#1D9E75",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", overflow: "hidden",
              border: "3px solid #e2e8f0", flexShrink: 0
            }}
          >
            {avatar ? (
              <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "28px", fontWeight: 700, color: "#fff" }}>
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <button
              onClick={handleAvatarClick}
              style={{
                padding: "8px 16px", background: "transparent",
                border: "1px solid #e2e8f0", borderRadius: "8px",
                fontSize: "13px", cursor: "pointer", color: "#64748b",
                marginBottom: "6px", display: "block"
              }}
            >
              📷 Change photo
            </button>
            <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>
              JPG or PNG. Max 2MB.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
        </div>

        <form onSubmit={handleProfileSave}>
          {profileMsg && <div style={successBox}>{profileMsg}</div>}
          {profileErr && <div style={errorBox}>{profileErr}</div>}

          <div style={fieldWrap}>
            <label style={labelStyle}>Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Location / Terminal</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            style={saveBtn}
            onMouseOver={(e) => e.target.style.background = "#0F6E56"}
            onMouseOut={(e) => e.target.style.background = "#1D9E75"}
          >
            Save changes
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div style={sectionCard}>
        <p style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", margin: "0 0 1.25rem" }}>
          Change password
        </p>

        <form onSubmit={handlePasswordSave}>
          {passMsg && <div style={successBox}>{passMsg}</div>}
          {passErr && <div style={errorBox}>{passErr}</div>}

          <div style={fieldWrap}>
            <label style={labelStyle}>Current password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>New password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Confirm new password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            style={saveBtn}
            onMouseOver={(e) => e.target.style.background = "#0F6E56"}
            onMouseOut={(e) => e.target.style.background = "#1D9E75"}
          >
            Update password
          </button>
        </form>
      </div>

    </div>
  );
}