import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/supabaseApi'
import { useAuth } from '../context/AuthContext'
import IoTReadings from '../components/IoTReadings'
import BatchCard from '../components/BatchCard'
import BottomNav from '../components/BottomNav'
import './Dashboard.css'
import { supabase } from '../lib/supabase'
import { Bell, Plus, ArrowUpRight } from 'lucide-react'

export default function Dashboard() {
  const { user, isOperator } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recommended, setRecommended] = useState([])
  const prevSafeRef = useRef(true)

  const load = () => {
    api.dashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const loadRecommended = () => {
    // For buyers: fetch a few marketplace listings
    api.marketplace().then((res) => setRecommended(res?.slice(0, 3) || [])).catch(() => setRecommended([]))
  }

  useEffect(() => {
    load()
    if (!isOperator) loadRecommended()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!data) return
    // Only notify operators
    if (!user) return
    const isOperator = user?.role === 'STALL_OPERATOR'
    if (!isOperator) return
    const temp = data?.live_temperature
    const humidity = data?.live_humidity
    const overThreshold = (temp != null && temp > 30) || (humidity != null && humidity > 85)
    if (overThreshold && prevSafeRef.current) {
      // create an in-app notification for the operator
      supabase.from('notifications').insert({
        user_id: user.id,
        notification_type: 'IOT_ALERT',
        title: 'IoT Alert',
        message: `Sensor reading outside safe range: ${temp ? `${temp.toFixed(1)}°C` : ''} ${humidity ? `${humidity}% RH` : ''}`,
      }).catch(console.error)
      prevSafeRef.current = false
    }
    if (!overThreshold) prevSafeRef.current = true
  }, [data, user])

  return (
    <div className="app-shell">
      <div className="page dashboard">
        <header className="dash-header">
          <div>
            <p className="dash-greet">Good day,</p>
            <h1>{user?.full_name || user?.email?.split('@')[0]}</h1>
            <p className="role-tag">{isOperator ? 'Stall Operator' : 'Rescue Buyer'}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link to="/notifications" className="notif-btn" aria-label="Notifications"><Bell size={20} strokeWidth={2.2} />{data?.unread_notifications > 0 && (<span className="notif-badge">{data.unread_notifications}</span>)}</Link>
          </div>
        </header>

        {isOperator && (
          <section className="dash-section">
            <h2 className="section-title">Live Environmental Readings</h2>
            <IoTReadings
              temp={data?.live_temperature}
              humidity={data?.live_humidity}
              ethylene={data?.live_ethylene}
            />
          </section>
        )}

        {isOperator && data?.at_risk_count > 0 && (
          <div className="alert-banner">
            ⚠️ {data.at_risk_count} batch(es) at risk — auto-discount applied & listed in Listings
          </div>
        )}

        <section className="dash-section">
          <div className="section-row">
            <h2 className="section-title">{isOperator ? 'My Batches' : 'Fresh Picks'}</h2>
            {isOperator && <Link to="/batch/new" className="add-link"><Plus size={16} /> Add Product</Link>}
          </div>
          {loading ? (
            <p className="muted">Loading...</p>
          ) : data?.active_batches?.length ? (
            data.active_batches.map((b) => <BatchCard key={b.id} batch={b} />)
          ) : (
            <div className="empty-state card">
              <p>No active batches yet.</p>
              {isOperator && <Link to="/batch/new">Add product (ESP32-CAM scan) <ArrowUpRight size={15} /></Link>}
            </div>
          )}
        </section>

        {!isOperator && (
          <section className="dash-section">
            <h2 className="section-title">Recommended for you</h2>
            {recommended.length ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {recommended.map((l) => <BatchCard key={l.id} batch={l.products} />)}
              </div>
            ) : (
              <p className="muted">No recommendations yet.</p>
            )}
          </section>
        )}

        {isOperator && (
          <section className="dash-section">
            <h2 className="section-title">Dynamic Pricing</h2>
            <div className="pricing-legend card">
              <div><span className="legend-dot fresh" /> Fresh — full price</div>
              <div><span className="legend-dot at-risk" /> At-Risk — 30% auto-discount</div>
              <div><span className="legend-dot spoiled" /> Rotten — removed from market</div>
            </div>
          </section>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
