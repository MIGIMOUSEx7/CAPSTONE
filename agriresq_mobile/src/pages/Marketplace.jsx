import { useEffect, useState } from 'react'
import { api } from '../api/supabaseApi'
import ProduceCard from '../components/ProduceCard'
import BottomNav from '../components/BottomNav'
import './Marketplace.css'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'EGGPLANT', label: 'Eggplant' },
  { id: 'CUCUMBER', label: 'Cucumber' },
  { id: 'CARROT', label: 'Carrot' },
]

export default function Marketplace() {
  const [listings, setListings] = useState([])
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = tab !== 'all' ? { crop_type: tab } : {}
    api.marketplace(params)
      .then(setListings)
      .catch(() => setListings([]))
      .finally(() => setLoading(false))
  }, [tab])

  const filtered = listings.filter((l) => {
    const crop = l.products?.crop_type || ''
    return crop.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="app-shell">
      <div className="page marketplace">
        <header className="market-header">
          <h1>Rescue Marketplace</h1>
          <p>Color-coded freshness · verified listings · chat with vendor</p>
        </header>

        <div className="search-bar">
          <input type="search" placeholder="Search produce..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="category-tabs">
          {TABS.map((t) => (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="muted">Loading from Supabase...</p>
        ) : filtered.length ? (
          filtered.map((l) => <ProduceCard key={l.id} listing={l} />)
        ) : (
          <div className="empty-state card">
            <p>No listings yet.</p>
            <p className="muted">At-risk products auto-list with dynamic pricing.</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
