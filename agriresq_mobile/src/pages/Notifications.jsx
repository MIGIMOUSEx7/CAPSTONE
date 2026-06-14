import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/supabaseApi'
import { useAuth } from '../context/AuthContext'
import { formatTime } from '../utils/helpers'
import './Notifications.css'

const TYPE_ICONS = {
  IOT_ALERT: '🌡️',
  STATUS_CHANGE: '⚠️',
  NEW_MESSAGE: '💬',
  MARKETPLACE: '🛒',
  ORDER_UPDATE: '📦',
  PRICE_DROP: '💰',
}

export default function Notifications() {
  const { user } = useAuth()
  const [notifs, setNotifs] = useState([])

  const load = () => api.notifications().then(setNotifs).catch(() => setNotifs([]))

  useEffect(() => {
    load()
    if (!user?.id) return
    const unsub = api.subscribeNotifications(user.id, load)
    return unsub
  }, [user?.id])

  const markAll = async () => {
    await api.markAllRead()
    setNotifs((n) => n.map((x) => ({ ...x, is_read: true })))
  }

  return (
    <div className="app-shell">
      <div className="page page-no-nav notifications">
        <header className="notif-header">
          <Link to="/home" className="back-link">← Back</Link>
          <div className="notif-title-row">
            <h1>Notifications</h1>
            <button onClick={markAll} className="mark-read">Mark all read</button>
          </div>
          <p className="notif-sub">In-app alerts only — no SMS/email</p>
        </header>

        {notifs.length ? (
          notifs.map((n) => (
            <div key={n.id} className={`notif-card card ${n.is_read ? '' : 'unread'}`}>
              <span className="notif-icon">{TYPE_ICONS[n.notification_type] || '🔔'}</span>
              <div>
                <strong>{n.title}</strong>
                <p>{n.message}</p>
                <span className="notif-time">{formatTime(n.created_at)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state card"><p>No notifications yet.</p></div>
        )}
      </div>
    </div>
  )
}
