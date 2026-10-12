import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '', email: '', phone_number: '', password: '',
    role: 'STALL_OPERATOR', stall_number: '', buyer_type: 'RETAILER', location: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ ...form })
      navigate('/home')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page auth-page--bulua page-no-nav">
      <div className="auth-header">
        <Link to="/" className="back-link">← Back</Link>
        <h2>Create Account</h2>
        <p>Join the AgriResQ marketplace</p>
      </div>
      <form className="auth-form card" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Full Name</label>
          <input value={form.full_name} onChange={(e) => set('full_name', e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Phone Number</label>
          <input type="tel" value={form.phone_number} onChange={(e) => set('phone_number', e.target.value)} placeholder="09XX XXX XXXX" />
        </div>
        <div className="input-group">
          <label>Password</label>
          <div className="password-row">
            <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={8} />
            <button type="button" className="btn-link small" onClick={() => setShowPassword((s) => !s)}>{showPassword ? 'Hide' : 'Show'}</button>
          </div>
        </div>
        <div className="input-group">
          <label>Role</label>
          <div className="role-options">
            <label className={`role-chip ${form.role === 'WHOLESALER' || form.role === 'STALL_OPERATOR' ? 'active' : ''}`}>
              <input type="radio" name="role" value="STALL_OPERATOR" checked={form.role === 'WHOLESALER' || form.role === 'STALL_OPERATOR'} onChange={() => set('role', 'STALL_OPERATOR')} />
              Stall Operator
            </label>
            <label className={`role-chip ${form.role === 'RESCUE_BUYER' ? 'active' : ''}`}>
              <input type="radio" name="role" value="RESCUE_BUYER" checked={form.role === 'RESCUE_BUYER'} onChange={() => set('role', 'RESCUE_BUYER')} />
              Rescue Buyer
            </label>
          </div>
        </div>
        {form.role === 'STALL_OPERATOR' && (
          <div className="input-group">
            <label>Stall Number</label>
            <input value={form.stall_number} onChange={(e) => set('stall_number', e.target.value)} placeholder="e.g. Stall 1" required />
          </div>
        )}
        {/* Location and profile photo removed per request */}
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn btn-green" disabled={loading}>
          {loading ? 'Creating...' : 'Create Account'}
        </button>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </form>
    </div>
  )
}

