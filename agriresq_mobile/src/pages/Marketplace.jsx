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

const CROP_LABELS = {
  EGGPLANT: 'Eggplant',
  CUCUMBER: 'Cucumber',
  CARROT: 'Carrot',
}

export default function Marketplace() {
  const [listings, setListings] = useState([])
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [producer, setProducer] = useState('')
  const [sort, setSort] = useState('newest')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = tab !== 'all' ? { crop_type: tab } : {}
    api.marketplace(params)
      .then((data) => {
        console.debug('Marketplace load success', { params, count: (data || []).length })
        setListings(data)
      })
      .catch((err) => {
        console.error('Marketplace load failed', err)
        setListings([])
      })
      .finally(() => setLoading(false))
  }, [tab])

  useEffect(() => {
    const unsub = api.subscribeMarketplace((payload) => {
      console.debug('marketplace change payload', payload)
      const params = tab !== 'all' ? { crop_type: tab } : {}
      api.marketplace(params).then((data) => setListings(data)).catch((err) => { console.error('marketplace refresh failed', err); setListings([]) })
    })
    return () => unsub()
  }, [tab])

  const filtered = listings.filter((l) => {
    const crop = l.products?.crop_type || ''
    const cropLabel = (CROP_LABELS[crop] || crop).toLowerCase()
    const matchesTab = tab === 'all' ? true : crop === tab
    const matchesSearch = !search || cropLabel.includes(search.toLowerCase()) || (l.products?.notes || '').toLowerCase().includes(search.toLowerCase())
    const matchesProducer = !producer || (l.profiles?.full_name || '').toLowerCase().includes(producer.toLowerCase())
    return matchesTab && matchesSearch && matchesProducer
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'newest') return new Date(b.created_at) - new Date(a.created_at)
    if (sort === 'price_asc') return (a.listed_price || a.products?.current_price_per_kg || 0) - (b.listed_price || b.products?.current_price_per_kg || 0)
    if (sort === 'price_desc') return (b.listed_price || b.products?.current_price_per_kg || 0) - (a.listed_price || a.products?.current_price_per_kg || 0)
    if (sort === 'freshness') return (b.products?.freshness_percent || 0) - (a.products?.freshness_percent || 0)
    return 0
  })

  return (
    <div className="app-shell">
      <div className="page marketplace">
        <header className="market-header">
          <h1>Rescue Listings</h1>
          <p>Color-coded freshness · verified listings · chat with vendor</p>
        </header>

        <div className="search-bar">
          <input type="search" placeholder="Search produce (crop or notes)" value={search} onChange={(e) => setSearch(e.target.value)} />
          <input type="search" placeholder="Filter by vendor name" value={producer} onChange={(e) => setProducer(e.target.value)} />
        </div>

          <div className="category-tabs">
          {TABS.map((t) => (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
          <div className="sort-select">
            <label>Sort:</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="freshness">Freshness</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="muted">Loading from Supabase...</p>
        ) : sorted.length ? (
          sorted.map((l) => <ProduceCard key={l.id} listing={l} />)
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
