import { Link } from 'react-router-dom'
import { CROP_LABELS, CROP_IMAGES } from '../utils/helpers'
import StatusBadge from './StatusBadge'
import './BatchCard.css'

export default function BatchCard({ batch }) {
  const crop = batch.crop_type
  return (
    <Link to={`/batch/${batch.id}`} className="batch-card card">
      <img src={batch.image_url || CROP_IMAGES[crop]} alt={CROP_LABELS[crop]} className="batch-img" />
      <div className="batch-body">
        <div className="batch-header">
          <h4>{CROP_LABELS[crop]} Batch #{batch.id}</h4>
          <StatusBadge status={batch.freshness_status} showPercent percent={batch.freshness_percent} size="sm" />
        </div>
        <p className="batch-meta">
          {batch.quantity_kg} kg · Stall {batch.profiles?.stall_number || batch.stall_number || '—'}
        </p>
        {batch.harvest_datetime && (
          <p className="batch-harvest">Harvest: {new Date(batch.harvest_datetime).toLocaleString('en-PH')}</p>
        )}
        <div className="batch-footer">
          <span>{batch.discount_percent > 0 ? `${batch.discount_percent}% off` : 'Full price'}</span>
          <span>₱{Number(batch.current_price_per_kg || 0).toFixed(2)}/kg</span>
          <span>{Number(batch.predicted_shelf_life).toFixed(1)}d left</span>
        </div>
      </div>
    </Link>
  )
}
