import { Link } from 'react-router-dom'
import { CROP_LABELS, CROP_IMAGES, formatCurrency } from '../utils/helpers'
import StatusBadge from './StatusBadge'
import './ProduceCard.css'

export default function ProduceCard({ listing }) {
  const product = listing.products || listing.batch || listing.crop_batch
  const crop = product?.crop_type
  const price = listing.listed_price || product?.current_price_per_kg
  return (
    <Link to={`/produce/${listing.id}`} className="produce-card card">
      <img src={product?.image_url || CROP_IMAGES[crop]} alt={CROP_LABELS[crop]} />
      <div className="produce-info">
        <h4>{CROP_LABELS[crop]}</h4>
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
      </div>
    </Link>
  )
}
