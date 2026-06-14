import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'
import './Profile.css'

export default function Profile() {
  const { user, logout, isOperator } = useAuth()

  return (
    <div className="app-shell">
      <div className="page profile">
        <div className="profile-hero card">
          <div className="avatar">{user?.first_name?.[0] || '?'}</div>
          <h2>{user?.first_name} {user?.last_name}</h2>
          <p>{user?.email}</p>
          <span className="role-badge">{isOperator ? 'Stall Operator' : 'Rescue Buyer'}</span>
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
