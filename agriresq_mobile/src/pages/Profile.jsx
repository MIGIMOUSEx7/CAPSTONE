import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, ChevronRight, UserCog, Receipt, Bell, Cpu, LogOut, Pencil } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'
import { supabase } from '../lib/supabase'
import './Profile.css'

export default function Profile() {
  const { user, logout, isOperator } = useAuth()
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.full_name || '')
  const [role, setRole] = useState(user?.role || 'RESCUE_BUYER')
  const [saving, setSaving] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}-${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (uploadErr) throw uploadErr
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id)
      window.location.reload()
    } catch (err) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) return alert('Please enter your name.')
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').update({ full_name: name.trim(), role }).eq('id', user.id)
      if (error) throw error
      window.location.reload()
    } catch (err) {
      alert('Could not save changes: ' + (err.message || err))
    } finally {
      setSaving(false)
    }
  }

  const startEditing = () => {
    setName(user?.full_name || '')
    setRole(user?.role || 'RESCUE_BUYER')
    setEditing(true)
  }

  const menu = [
    { icon: UserCog, label: 'Account Settings', hint: 'Name, email and password', onClick: () => navigate('/account-settings') },
    { icon: Receipt, label: 'Transaction History', hint: 'Your orders and payments' },
    { icon: Bell, label: 'Notification Preferences', hint: 'Choose what you get alerted about' },
    ...(isOperator ? [{ icon: Cpu, label: 'IoT Device Management', hint: 'Sensors and connected devices' }] : []),
  ]

  return (
    <div className="app-shell">
      <div className="page profile">
        <h1 className="profile-title">Profile</h1>

        <section className="profile-hero card">
          <div className="avatar-wrap">
            <div className="avatar">
              {user?.avatar_url ? <img src={user.avatar_url} alt="Profile" /> : (user?.full_name?.[0]?.toUpperCase() || '?')}
            </div>
            <label className="avatar-edit" aria-label="Change profile photo">
              <Camera size={16} />
              <input type="file" accept="image/*" onChange={handleFile} hidden />
            </label>
          </div>
          {uploading && <small className="upload-note">Uploading photo...</small>}

          <h2>{user?.full_name || 'Your name'}</h2>
          <p className="profile-email">{user?.email}</p>
          <span className="role-badge">{isOperator ? 'Stall Operator' : 'Rescue Buyer'}</span>

          {!editing ? (
            <button className="btn btn-outline edit-btn" onClick={startEditing}>
              <Pencil size={15} /> Edit Profile
            </button>
          ) : (
            <div className="edit-form">
              <div className="field">
                <label>Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
              </div>
              <div className="field">
                <label>I am a</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="RESCUE_BUYER">Rescue Buyer</option>
                  <option value="STALL_OPERATOR">Stall Operator</option>
                </select>
              </div>
              <div className="edit-actions">
                <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
                <button className="btn btn-green" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="stats-row">
          <div className="stat card"><strong>—</strong><span>Orders</span></div>
          <div className="stat card"><strong>—</strong><span>Completed</span></div>
          <div className="stat card"><strong>5.0</strong><span>Rating</span></div>
        </section>

        <section className="settings-list card">
          {menu.map(({ icon: Icon, label, hint, onClick }) => (
            <button key={label} className="settings-item" onClick={onClick}>
              <span className="settings-icon"><Icon size={18} /></span>
              <span className="settings-text">
                <strong>{label}</strong>
                <small>{hint}</small>
              </span>
              <ChevronRight size={18} className="settings-chevron" />
            </button>
          ))}
        </section>

        <button className="sign-out" onClick={logout}>
          <LogOut size={17} /> Sign Out
        </button>
      </div>
      <BottomNav />
    </div>
  )
}