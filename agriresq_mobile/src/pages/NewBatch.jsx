import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api/supabaseApi'
import { computeDynamicPrice } from '../api/pricing'
import StatusBadge from '../components/StatusBadge'
import './Auth.css'
import './NewBatch.css'

export default function NewBatch() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [nodes, setNodes] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [form, setForm] = useState({
    crop_type: 'EGGPLANT', quantity_kg: '', base_price_per_kg: '',
    harvest_datetime: new Date().toISOString().slice(0, 16),
    iot_node_id: '', notes: '', pickup_location: 'Bulua West Terminal',
    auto_discount_enabled: true,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.nodes().then(setNodes).catch(() => setNodes([]))
  }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setAnalysis(null)
  }

  const handleCaptureClick = () => {
    fileInputRef.current?.click()
  }

  const getFreshnessDistribution = (percent) => {
    const pct = Number(percent ?? 0)
    const fresh = Math.min(100, Math.max(0, Math.round(((pct - 60) / 40) * 100)))
    const spoiled = Math.min(100, Math.max(0, Math.round(((40 - pct) / 40) * 100)))
    const atRisk = Math.max(0, 100 - fresh - spoiled)
    return { fresh, atRisk, spoiled }
  }

  /** Step 2–3: ESP32-CAM / upload → backend analyzes freshness */
  const runAnalysis = async () => {
    if (!imageFile) {
      setError('Capture or upload a product image first (ESP32-CAM).')
      return
    }
    setAnalyzing(true)
    setError('')
    try {
      const result = await api.analyzeFreshness(imageFile, form.crop_type)
      setAnalysis(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  /** Step 4–5: Save product + freshness to Supabase → marketplace */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      let freshness = analysis
      if (!freshness && imageFile) {
        freshness = await api.analyzeFreshness(imageFile, form.crop_type)
      }
      const status = freshness?.freshness_status || 'GREEN'
      const pricing = computeDynamicPrice(form.base_price_per_kg, form.quantity_kg, status, form.auto_discount_enabled)

      const batch = await api.createBatch({
        ...form,
        quantity_kg: parseFloat(form.quantity_kg),
        base_price_per_kg: parseFloat(form.base_price_per_kg) || 0,
        iot_node_id: form.iot_node_id ? parseInt(form.iot_node_id) : null,
        harvest_datetime: new Date(form.harvest_datetime).toISOString(),
        freshness_status: status,
        freshness_percent: freshness?.freshness_percent ?? 100,
        predicted_shelf_life: freshness?.days_to_spoil ?? 5,
        ml_confidence: freshness?.ml_confidence,
        image_url: freshness?.image_url || imagePreview || '',
        is_listed: status === 'AMBER' || status === 'GREEN',
      })
      navigate(`/batch/${batch.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const previewPricing = analysis
    ? computeDynamicPrice(form.base_price_per_kg, form.quantity_kg, analysis.freshness_status, form.auto_discount_enabled)
    : null

  const freshnessDistribution = analysis ? getFreshnessDistribution(analysis.freshness_percent) : null

  return (
    <div className="app-shell">
      <div className="page page-no-nav auth-page">
        <Link to="/home" className="back-link">← Back</Link>
        <h2 className="page-heading">Add Product</h2>
        <p className="flow-hint">ESP32-CAM capture → AI freshness analysis → save to database → marketplace</p>

        <form className="card auth-form new-batch-form" onSubmit={handleSubmit}>
          <div className="flow-steps card inner-card">
            <div className="step">1. Product details</div>
            <div className="step">2. ESP32-CAM image</div>
            <div className="step">3. Freshness analysis</div>
            <div className="step">4. Save & list</div>
          </div>

          <div className="input-group">
            <label>Crop Type</label>
            <select value={form.crop_type} onChange={(e) => set('crop_type', e.target.value)}>
              <option value="EGGPLANT">Eggplant</option>
              <option value="CUCUMBER">Cucumber</option>
              <option value="CARROT">Carrot</option>
            </select>
          </div>
          <div className="input-group">
            <label>Quantity (kg)</label>
            <input type="number" step="0.1" value={form.quantity_kg} onChange={(e) => set('quantity_kg', e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Base Price per kg (₱)</label>
            <input type="number" step="0.01" value={form.base_price_per_kg} onChange={(e) => set('base_price_per_kg', e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Harvest Date & Time</label>
            <input type="datetime-local" value={form.harvest_datetime} onChange={(e) => set('harvest_datetime', e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={form.auto_discount_enabled} onChange={(e) => set('auto_discount_enabled', e.target.checked)} />
              Enable auto-discount when At-Risk (30%)
            </label>
          </div>

          <div className="input-group">
            <label>Product Image (ESP32-CAM / Camera)</label>
            <div className="camera-actions">
              <button type="button" className="btn btn-outline-dark" onClick={handleCaptureClick}>
                Capture with Camera
              </button>
              <span className="camera-hint">or upload from device</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImage}
              style={{ display: 'none' }}
            />
            <input type="file" accept="image/*" onChange={handleImage} />
            {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
          </div>

          {imageFile && !analysis && (
            <button type="button" className="btn btn-green" onClick={runAnalysis} disabled={analyzing}>
              {analyzing ? 'Analyzing freshness...' : 'Analyze Freshness (AI)'}
            </button>
          )}

          {analysis && (
            <div className="analysis-result card inner-card">
              <h4>Freshness Analysis Result</h4>
              <StatusBadge status={analysis.freshness_status} showPercent percent={analysis.freshness_percent} />
              <div className="freshness-distribution">
                <div className="freshness-bar freshness-fresh" style={{ width: `${freshnessDistribution.fresh}%` }}>
                  <span>{freshnessDistribution.fresh}% Fresh</span>
                </div>
                <div className="freshness-bar freshness-risk" style={{ width: `${freshnessDistribution.atRisk}%` }}>
                  <span>{freshnessDistribution.atRisk}% At-Risk</span>
                </div>
                <div className="freshness-bar freshness-spoiled" style={{ width: `${freshnessDistribution.spoiled}%` }}>
                  <span>{freshnessDistribution.spoiled}% Spoiled</span>
                </div>
              </div>
              <p>Days to spoil: <strong>{analysis.days_to_spoil}</strong></p>
              <p>ML confidence: <strong>{analysis.ml_confidence}%</strong></p>
              {previewPricing && (
                <p>Dynamic price: <strong>₱{previewPricing.current_price_per_kg}/kg</strong>
                  {previewPricing.discount_percent > 0 && ` (${previewPricing.discount_percent}% off)`}
                </p>
              )}
            </div>
          )}

          <div className="input-group">
            <label>IoT Node (optional)</label>
            <select value={form.iot_node_id} onChange={(e) => set('iot_node_id', e.target.value)}>
              <option value="">— None —</option>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>{n.stall_location} (Node #{n.id})</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Notes</label>
            <textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>

          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-green" disabled={loading}>
            {loading ? 'Saving to database...' : 'Save Product & Show in Marketplace'}
          </button>
        </form>
      </div>
    </div>
  )
}
