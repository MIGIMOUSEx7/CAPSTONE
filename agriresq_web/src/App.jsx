import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import all pages and components
import Login from "./pages/Login";
import Register from "./pages/Register";
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Batches from './pages/Batches';
import Marketplace from './pages/Marketplace';
import Profile from "./pages/Profile";
import Sensors from './pages/Sensors';
import Analytics from './pages/Analytics'; // <-- Add this import!
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  const [screen, setScreen] = useState("login"); // "login" | "register" | "app"

  // LOGIN SCREEN (Includes Forgot/Reset Password flows)
  if (screen === "login") {
    return (
      <Router>
        <Routes>
          <Route path="/" element={
            <Login
              onLogin={() => setScreen("app")}
              onRegister={() => setScreen("register")}
            />
          } />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    );
  }

  // REGISTER SCREEN
  if (screen === "register") {
    return (
      <Router>
        <Routes>
          <Route path="*" element={
            <Register
              onRegister={() => setScreen("app")}
              onBack={() => setScreen("login")}
            />
          } />
        </Routes>
      </Router>
    );
  }

  // MAIN APP SCREEN (Dashboard, Batches, Marketplace, etc.)
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar onLogout={() => setScreen("login")} />
        <main className="flex-1 ml-64 p-8 min-h-screen overflow-y-auto">
          <Routes>
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/batches" element={<Batches />} />
            <Route path="/sensors" element={<Sensors />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/analytics" element={<Analytics />} /> {/* <-- Add this route! */}
            <Route path="/login" element={<Navigate to="/" />} />
            
            {/* Catch-all for modules we haven't built yet */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400 animate-fadeIn">
                <span className="text-6xl block mb-4">🚧</span>
                <h2 className="text-2xl font-bold text-slate-600 mb-2">Module Under Construction</h2>
                <p className="text-sm">This interface segment is preparing for incoming components.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;