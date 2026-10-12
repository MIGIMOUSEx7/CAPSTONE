import { Link, useNavigate } from 'react-router-dom'
import { CROP_LABELS, CROP_IMAGES, formatCurrency } from '../utils/helpers'
import StatusBadge from './StatusBadge'
import { api } from '../api/supabaseApi'
import { useAuth } from '../context/AuthContext'
import './ProduceCard.css'
import { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'

export default function ProduceCard({ listing }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { loading } = useAuth()
  const product = listing.products || listing.batch || listing.crop_batch
  const crop = product?.crop_type
  const price = listing.listed_price || product?.current_price_per_kg
  const vendorAvatar = listing.profiles?.avatar_url

  const handleChat = async (e) => {
    e.preventDefault()
    try {
      const thread = await api.startChat(listing.id)
      navigate(`/chat/${thread.id}`)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await api.saveListing(listing.id)
      alert('Saved to your bookmarks')
    } catch (err) {
      console.warn(err)
      // fallback to localStorage
      const saved = JSON.parse(localStorage.getItem('saved_listings') || '[]')
      if (!saved.includes(listing.id)) saved.push(listing.id)
      localStorage.setItem('saved_listings', JSON.stringify(saved))
      alert('Saved locally (server table missing)')
    }
  }
  const handleFinalize = async (e) => {
    e.preventDefault()
    setConfirmFinalize(true)
  }

  const handleRemoveBatch = async (e) => {
    e.preventDefault()
    const productId = listing.products?.id || listing.product_id
    if (!productId) return alert('No product id')
    setConfirmRemove(true)
  }
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [confirmFinalize, setConfirmFinalize] = useState(false)
  const doRemove = async () => {
    const productId = listing.products?.id || listing.product_id
    try {
      await api.removeBatch(productId)
      setConfirmRemove(false)
      alert('Batch removed')
      window.location.reload()
    } catch (err) {
      alert('Failed: ' + (err.message || err))
    }
  }
  const doFinalize = async () => {
    try {
      await api.markListingSold(listing.id)
      setConfirmFinalize(false)
      alert('Listing marked as sold')
      window.location.reload()
    } catch (err) {
      alert('Failed: ' + (err.message || err))
    }
  }
  return (
    <Link to={`/produce/${listing.id}`} className="produce-card card">
      <img src={product?.image_url || CROP_IMAGES[crop]} alt={CROP_LABELS[crop]} />
      <div className="produce-info">
        <h4>{CROP_LABELS[crop]}</h4>
        <p className="producer-name">{listing.profiles?.full_name || 'Unknown Vendor'}</p>
        <p className="produce-price">
          {formatCurrency(price)}
          {listing.discount_percent > 0 && (
            <span className="discount-tag"> -{listing.discount_percent}%</span>
          )}
        </p>
        <p className="produce-loc">📍 {product?.pickup_location || 'Bulua West Terminal'}</p>
        <StatusBadge
          status={product?.freshness_status}
          showPercent
          percent={product?.freshness_percent}
          size="sm"
        />
        <div className="card-actions">
          {user ? (
            user.role === 'RESCUE_BUYER' ? (
              <button className="btn btn-sm" onClick={handleChat}>💬 Chat</button>
            ) : null
          ) : (
            <button className="btn btn-sm" onClick={(e) => { e.preventDefault(); window.location.href = '/login' }}>🔐 Sign in to chat</button>
          )}
          {user && user.role === 'STALL_OPERATOR' && user.id === listing.operator_id && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button title="Finalize Sale" className="icon-btn green" onClick={handleFinalize}>✓</button>
              <button title="Remove Batch" className="icon-btn danger" onClick={handleRemoveBatch}>🗑</button>
            </div>
          )}
          <button className="btn btn-outline" onClick={handleSave}>🔖 Save</button>
        </div>
        <ConfirmDialog open={confirmRemove} title="Remove Batch" message="Remove this batch? This will delete the product and its listing." onConfirm={doRemove} onCancel={() => setConfirmRemove(false)} confirmLabel="Remove" />
        <ConfirmDialog open={confirmFinalize} title="Finalize Sale" message="Mark this listing as SOLD? This will remove it from the marketplace." onConfirm={doFinalize} onCancel={() => setConfirmFinalize(false)} confirmLabel="Mark Sold" />
      </div>
    </Link>
  )
}
