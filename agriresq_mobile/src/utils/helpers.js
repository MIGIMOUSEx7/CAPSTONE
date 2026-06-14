export const CROP_LABELS = {
  EGGPLANT: 'Eggplant',
  CUCUMBER: 'Cucumber',
  CARROT: 'Carrot',
}

export const CROP_IMAGES = {
  EGGPLANT: 'https://images.unsplash.com/photo-1659261201616-6ec5d6b5e0ec?w=400&q=80',
  CUCUMBER: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400&q=80',
  CARROT: 'https://images.unsplash.com/photo-1598170845058-32b9d6a947da?w=400&q=80',
}

export function statusLabel(status) {
  return { GREEN: 'Fresh', AMBER: 'At-Risk', RED: 'Spoiled' }[status] || status
}

export function statusClass(status) {
  return { GREEN: 'status-green', AMBER: 'status-amber', RED: 'status-red' }[status] || ''
}

export function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
}

export function formatCurrency(n) {
  return `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
}
