import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/supabaseApi'
import { CROP_LABELS, CROP_IMAGES, formatCurrency } from '../utils/helpers'
import IoTReadings from '../components/IoTReadings'
import FreshnessGauge from '../components/FreshnessGauge'
import StatusBadge from '../components/StatusBadge'
import './BatchDetail.css'

const TIMELINE = ['Harvested', 'Vision Scan', 'At Stall', 'Listed']

export default function BatchDetail() {
  const { id } = useParams()
  const [batch, setBatch] = useState(null)
  const [prediction, setPrediction] = useState(null)

  useEffect(() => {
    const load = () => {
      api.batch(id).then(setBatch).catch(console.error)
      api.predict(id).then(setPrediction).catch(console.error)
    }
    load()
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
  }, [id])

  if (!batch) return <div className="page page-no-nav"><p>Loading...</p></div>

  const crop = batch.crop_type
  const step = batch.is_listed ? 3 : 2

  return (
    <div className="app-shell">
      <div className="page batch-detail page-no-nav" style={{ paddingBottom: 24 }}>
        <Link to="/home" className="back-link">← Back to Dashboard</Link>
        <img src={batch.image_url || CROP_IMAGES[crop]} alt="" className="detail-hero" />
        <div className="detail-title-row">
          <h1>{CROP_LABELS[crop]} #{batch.id}</h1>
          <StatusBadge status={batch.freshness_status} showPercent percent={batch.freshness_percent} />
        </div>

        <FreshnessGauge
          percent={batch.freshness_percent}
          status={batch.freshness_status}
          daysLeft={batch.predicted_shelf_life}
        />

        <section className="detail-section card">
          <h3>Batch Info</h3>
          <div className="info-grid">
            <div><span>Quantity</span><strong>{batch.quantity_kg} kg</strong></div>
            <div><span>Harvest</span><strong>{batch.harvest_datetime ? new Date(batch.harvest_datetime).toLocaleString('en-PH') : '—'}</strong></div>
            <div><span>Base Price</span><strong>{formatCurrency(batch.base_price_per_kg)}/kg</strong></div>
            <div><span>Current Price</span><strong>{formatCurrency(batch.current_price_per_kg)}/kg</strong></div>
            {batch.discount_percent > 0 && (
              <div><span>Auto-Discount</span><strong className="discount-text">-{batch.discount_percent}%</strong></div>
            )}
            {batch.ml_confidence && (
              <div><span>ML Confidence</span><strong>{batch.ml_confidence}%</strong></div>
            )}
          </div>
        </section>

        <section className="detail-section">
          <h3 className="section-title">Live IoT Reading</h3>
          <IoTReadings temp={batch.latest_temp} humidity={batch.latest_humidity} ethylene={batch.latest_ethylene} />
        </section>

        <section className="detail-section card">
          <h3>Status Timeline</h3>
          <div className="timeline">
            {TIMELINE.map((label, i) => (
              <div key={label} className={`timeline-step ${i <= step ? 'done' : ''}`}>
                <div className="timeline-dot" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {batch.predictions?.length > 0 && (
          <section className="detail-section card">
            <h3>Spoilage Predictions</h3>
            {batch.predictions.map((p) => (
              <div key={p.id} className="prediction-row">
                <StatusBadge status={p.predicted_status} size="sm" />
                <span>{Number(p.days_to_spoil).toFixed(1)} days · {p.source}</span>
                <span className="pred-time">{new Date(p.created_at).toLocaleString('en-PH')}</span>
              </div>
            ))}
          </section>
        )}

        {prediction && (
          <section className="detail-section card">
            <h3>Latest Prediction</h3>
            <p>Days to spoil: <strong>{Number(prediction.days_to_spoil).toFixed(1)}</strong></p>
            <p>Freshness: <strong>{prediction.freshness_percent}%</strong></p>
          </section>
        )}
      </div>
    </div>
  )
}
