import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../api/supabaseApi'
import { CROP_LABELS, CROP_IMAGES, formatCurrency, formatDate } from '../utils/helpers'
import FreshnessGauge from '../components/FreshnessGauge'
import IoTReadings from '../components/IoTReadings'
import StatusBadge from '../components/StatusBadge'
import './ProduceDetail.css'

export default function ProduceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [chatting, setChatting] = useState(false)

  useEffect(() => {
    api.listing(id).then(setListing).catch(console.error)
  }, [id])

  const handleChat = async () => {
    setChatting(true)
    try {
      const thread = await api.startChat(id)
      navigate(`/chat/${thread.id}`)
    } catch (err) {
      alert(err.message)
    } finally {
      setChatting(false)
    }
  }

  if (!listing) return <div className="page"><p>Loading...</p></div>

  const product = listing.products
  const crop = product?.crop_type

  return (
    <div className="app-shell">
      <div className="produce-detail">
        <img src={product?.image_url || CROP_IMAGES[crop]} alt="" className="produce-hero" />
        <div className="produce-body">
          <Link to="/marketplace" className="back-link">← Marketplace</Link>
          <div className="detail-title-row">
            <h1>{CROP_LABELS[crop]}</h1>
            <StatusBadge status={product?.freshness_status} showPercent percent={product?.freshness_percent} />
          </div>
          <p className="produce-price-lg">
            {formatCurrency(listing.listed_price)}
            {listing.discount_percent > 0 && (
              <span className="strike-original"> was {formatCurrency(listing.original_price)}</span>
            )}
          </p>

          <FreshnessGauge
            percent={product?.freshness_percent}
            status={product?.freshness_status}
            daysLeft={product?.predicted_shelf_life}
          />

          <section className="card detail-block">
            <h3>Batch Info</h3>
            <div className="info-row"><span>Quantity</span><strong>{product?.quantity_kg} kg</strong></div>
            <div className="info-row"><span>Harvest</span><strong>{product?.harvest_datetime ? new Date(product.harvest_datetime).toLocaleString('en-PH') : '—'}</strong></div>
            <div className="info-row"><span>Price/kg</span><strong>{formatCurrency(product?.current_price_per_kg)}</strong></div>
            <div className="info-row"><span>Days to spoil</span><strong>{Number(product?.predicted_shelf_life).toFixed(1)}</strong></div>
          </section>

          <section className="card detail-block seller-block">
            <div className="seller-header">
              <h3>Stall Operator</h3>
              <span className="verified">✓ Verified</span>
            </div>
            <p className="seller-name">{listing.profiles?.full_name} — Stall {listing.profiles?.stall_number}</p>
            <p className="seller-note">{product?.notes || 'IoT-monitored surplus from Bulua Westbound Terminal.'}</p>
          </section>

          <section className="card detail-block">
            <h3>📍 Pickup Location</h3>
            <div className="map-placeholder">
              <span>{product?.pickup_location || 'Bulua West Terminal, Cagayan de Oro'}</span>
            </div>
          </section>
        </div>

        <footer className="produce-footer">
          <IoTReadings compact temp={null} humidity={null} ethylene={null} />
          <button className="btn btn-green chat-cta" onClick={handleChat} disabled={chatting}>
            {chatting ? 'Opening chat...' : '💬 Chat Now with Vendor'}
          </button>
        </footer>
      </div>
    </div>
  )
}
