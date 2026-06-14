import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/supabaseApi'
import { useAuth } from '../context/AuthContext'
import IoTReadings from '../components/IoTReadings'
import BatchCard from '../components/BatchCard'
import BottomNav from '../components/BottomNav'
import './Dashboard.css'

export default function Dashboard() {
  const { user, isOperator } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    api.dashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="app-shell">
      <div className="page dashboard">
        <header className="dash-header">
          <div>
            <p className="dash-greet">Good day,</p>
            <h1>{user?.full_name || user?.email?.split('@')[0]} 👋</h1>
            <p className="role-tag">{isOperator ? 'Stall Operator' : 'Rescue Buyer'}</p>
          </div>
          <Link to="/notifications" className="notif-btn">
            🔔
            {data?.unread_notifications > 0 && (
              <span className="notif-badge">{data.unread_notifications}</span>
            )}
          </Link>
        </header>

        <section className="dash-section">
          <h2 className="section-title">Live Environmental Readings</h2>
          <IoTReadings
            temp={data?.live_temperature}
            humidity={data?.live_humidity}
            ethylene={data?.live_ethylene}
          />
        </section>

        {isOperator && data?.at_risk_count > 0 && (
          <div className="alert-banner">
            ⚠️ {data.at_risk_count} batch(es) at risk — auto-discount applied & listed in marketplace
          </div>
        )}

        <section className="dash-section">
          <div className="section-row">
            <h2 className="section-title">{isOperator ? 'My Batches' : 'Fresh Picks'}</h2>
            {isOperator && <Link to="/batch/new" className="add-link">+ Add Product</Link>}
          </div>
          {loading ? (
            <p className="muted">Loading...</p>
          ) : data?.active_batches?.length ? (
            data.active_batches.map((b) => <BatchCard key={b.id} batch={b} />)
          ) : (
            <div className="empty-state card">
              <p>No active batches yet.</p>
              {isOperator && <Link to="/batch/new">Add product (ESP32-CAM scan) →</Link>}
            </div>
          )}
        </section>

        {isOperator && (
          <section className="dash-section">
            <h2 className="section-title">Dynamic Pricing</h2>
            <div className="pricing-legend card">
              <div><span className="legend-dot fresh" /> Fresh — full price</div>
              <div><span className="legend-dot at-risk" /> At-Risk — 30% auto-discount</div>
              <div><span className="legend-dot spoiled" /> Spoiled — removed from market</div>
            </div>
          </section>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
