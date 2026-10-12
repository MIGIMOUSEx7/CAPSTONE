import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'
import { supabase } from '../lib/supabase'
import './Profile.css'

export default function Profile() {
  const { user, logout, isOperator } = useAuth()
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
      const path = `avatars/${user.id}-${Date.now()}-${file.name}`
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (uploadErr) throw uploadErr
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = data.publicUrl
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      // refresh user object by reloading page or calling a simple reload
      window.location.reload()
    } catch (err) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="app-shell">
      <div className="page profile">
        <div className="profile-hero card">
          <div className="avatar">
            {user?.avatar_url ? <img src={user.avatar_url} alt="avatar" /> : (user?.full_name?.[0] || '?')}
          </div>
          <h2>{user?.full_name || user?.email}</h2>
          <p>{user?.email}</p>
          <span className="role-badge">{isOperator ? 'Stall Operator' : 'Rescue Buyer'}</span>
          <div className="avatar-upload">
            <input type="file" accept="image/*" onChange={handleFile} />
            <small>{uploading ? 'Uploading...' : 'Change profile photo'}</small>
          </div>
          <div className="edit-controls">
            {!editing ? (
              <button className="btn btn-outline" onClick={() => { setName(user?.full_name || ''); setRole(user?.role || 'RESCUE_BUYER'); setEditing(true) }}>Edit Profile</button>
            ) : (
              <div className="edit-form">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="RESCUE_BUYER">Rescue Buyer</option>
                  <option value="STALL_OPERATOR">Stall Operator</option>
                </select>
                <button className="btn btn-green" onClick={async () => {
                  setSaving(true)
                  try {
                    await supabase.from('profiles').update({ full_name: name, role }).eq('id', user.id)
                    window.location.reload()
                  } catch (err) {
                    alert('Save failed: ' + (err.message || err))
                  } finally {
                    setSaving(false)
                  }
                }} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            )}
          </div>
        </div>

        <div className="stats-row">
          <div className="stat card">
            <strong>—</strong>
            <span>Total Orders</span>
          </div>
          <div className="stat card">
            <strong>—</strong>
            <span>Completed</span>
          </div>
          <div className="stat card">
            <strong>5.0</strong>
            <span>Rating</span>
          </div>
        </div>

        <div className="settings-list card">
          <button className="settings-item">Account Settings</button>
          <button className="settings-item">Transaction History</button>
          <button className="settings-item">Notification Preferences</button>
          {isOperator && <button className="settings-item">IoT Device Management</button>}
        </div>

        <button className="btn btn-green sign-out" onClick={logout}>
          Sign Out
        </button>
      </div>
      <BottomNav />
    </div>
  )
}
