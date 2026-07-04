import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const ResetPassword = () => {
  // Grab the security tokens from the URL that Brevo emailed to the user
  const { uidb64, token } = useParams(); 
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/reset-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            uidb64: uidb64, 
            token: token, 
            password: password 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsSuccess(true);
        setMessage("Your password has been successfully reset!");
      } else {
        setError(data.error || "Failed to reset password. The link might be expired.");
      }
    } catch (err) {
      setError("Cannot connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Create New Password</h2>
        <p className="text-sm text-slate-500 mb-6">Your new password must be different from previous used passwords.</p>
        
        {}
        {message && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {}
        {isSuccess ? (
          <div className="mt-4">
            <Link to="/" className="block w-full text-center py-2.5 bg-[#2A6B48] text-white rounded-xl text-sm font-bold hover:bg-[#1f5035] transition-colors">
              Continue to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500" 
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500" 
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-2.5 mt-2 bg-[#2A6B48] text-white rounded-xl text-sm font-bold hover:bg-[#1f5035] transition-colors disabled:opacity-70"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;