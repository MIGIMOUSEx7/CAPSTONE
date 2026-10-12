import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../api/supabaseApi'
import { useAuth } from '../context/AuthContext'
import { CROP_LABELS, CROP_IMAGES, formatCurrency, formatDate } from '../utils/helpers'
import FreshnessGauge from '../components/FreshnessGauge'
import IoTReadings from '../components/IoTReadings'
import StatusBadge from '../components/StatusBadge'
import './ProduceDetail.css'
import './Chat.css'

export default function ProduceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [listingError, setListingError] = useState('')
  const [sensors, setSensors] = useState({ temp: null, humidity: null, ethylene: null })
  const [chatting, setChatting] = useState(false)
  const { user } = useAuth()
  const [thread, setThread] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [inlineError, setInlineError] = useState('')
  const messagesRef = useRef(null)

  useEffect(() => {
    api.listing(id).then((l) => { setListing(l); setListingError('') }).catch((err) => { console.error(err); setListing(null); setListingError(err.message || 'Listing not found or unavailable') })
  }, [id])

  useEffect(() => {
    if (!listing) return
    const productId = listing.products?.id || listing.products?.product_id || null
    if (!productId) return
    api.batch(productId).then((b) => {
      setSensors({ temp: b.latest_temp ?? null, humidity: b.latest_humidity ?? null, ethylene: b.latest_ethylene ?? null })
    }).catch(() => {})
  }, [listing])

  const handleChat = async () => {
    // keep for compatibility: open full chat view
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

  // Inline chat support for buyers: create/get thread and poll messages
  const loadInlineThread = async () => {
    if (!user) return
    try {
      console.debug('loadInlineThread: attempting startChat', { listingId: id, user })
      const t = await api.startChat(id)
      console.debug('loadInlineThread: thread', t)
      setThread(t)
      if (t && t.id) {
        const full = await api.chatThread(t.id)
        setMessages(full.messages || [])
      } else {
        // no thread yet (common when operator views listing before buyer starts chat)
        setMessages([])
      }
      setInlineError('')
    } catch (err) {
      console.error('inline chat load failed', err)
      setInlineError(err.message || String(err))
    }
  }

  useEffect(() => {
    let interval = null
    if (user?.role === 'RESCUE_BUYER' || user?.role === 'STALL_OPERATOR') {
      loadInlineThread()
      interval = setInterval(() => {
        if (thread?.id) api.chatThread(thread.id).then((t) => setMessages(t.messages || [])).catch(() => {})
      }, 3000)
    }
    return () => clearInterval(interval)
  }, [user, thread?.id])

  const sendInline = async (e) => {
    e.preventDefault()
    if (!text.trim() || !thread?.id) return
    setSending(true)
    try {
      await api.sendMessage(thread.id, text.trim())
      setText('')
      const updated = await api.chatThread(thread.id)
      setMessages(updated.messages || [])
    } catch (err) {
      alert(err.message)
    } finally {
      setSending(false)
    }
  }

  // scroll to bottom when messages update
  useEffect(() => {
    if (!messagesRef?.current) return
    try {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    } catch (e) {}
  }, [messages])

  if (listingError) return <div className="page"><p>{listingError}</p><p><a href="/marketplace">Back to Marketplace</a></p></div>
  if (!listing) return <div className="page"><p>Loading...</p></div>

  const product = listing.products
  const crop = product?.crop_type

  return (
    <div className="app-shell">
      <div className="produce-detail">
        <img src={product?.image_url || CROP_IMAGES[crop]} alt="" className="produce-hero" />
        <div className="produce-body">
          {/* DEBUG: show current user role/id for troubleshooting */}
          {user && (
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
              Debug role: <strong>{user.role}</strong> — id: <strong>{user.id}</strong>
            </div>
          )}
          <Link to="/marketplace" className="back-link">← Listings</Link>
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
          {/* Inline chat placed directly under Pickup Location for buyers only */}
          {user && user.role === 'RESCUE_BUYER' && (
            <section className="card detail-block inline-chat-block">
              <h3>💬 Chat with Vendor</h3>
              <div className="inline-chat">
                <div className="chat-messages-inline" ref={messagesRef} style={{ maxHeight: 240, overflowY: 'auto' }}>
                  {messages.length === 0 ? (
                    <div className="muted">No messages yet.</div>
                  ) : messages.map((m) => (
                    <div key={m.id} className={`bubble ${m.sender_id === user.id ? 'mine' : 'theirs'}`}>
                      <div className="bubble-meta"><strong>{m.profiles?.full_name || (m.sender_id === user.id ? 'You' : 'Partner')}</strong> <span className="time">{m.sent_at ? new Date(m.sent_at).toLocaleTimeString() : ''}</span></div>
                      <div className="bubble-body">{m.message_text}</div>
                    </div>
                  ))}
                </div>
                {inlineError ? (
                  <div className="card" style={{ padding: 8, marginTop: 8 }}>
                    <p className="error-text">Chat unavailable: {inlineError}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline" onClick={() => { setInlineError(''); loadInlineThread() }}>Retry</button>
                      <button className="btn btn-outline" onClick={() => navigate(`/chat/${thread?.id}`)} disabled={!thread}>Open Full Chat</button>
                    </div>
                  </div>
                ) : (
                  <form className="chat-input-inline" onSubmit={sendInline}>
                    <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." />
                    <button type="submit" disabled={sending}>{sending ? '...' : 'Send'}</button>
                    <button type="button" className="btn btn-outline" onClick={() => navigate(`/chat/${thread?.id}`)} style={{ marginLeft: 8 }}>Open Full Chat</button>
                  </form>
                )}
              </div>
            </section>
          )}
        </div>
        <footer className="produce-footer">
          <IoTReadings compact temp={sensors.temp} humidity={sensors.humidity} ethylene={sensors.ethylene} />
        </footer>
      </div>
    </div>
  )
}
