import { NavLink } from 'react-router-dom'
import { Home, ShoppingBasket, MessageCircle, UserRound } from 'lucide-react'
import './BottomNav.css'

const tabs = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/marketplace', label: 'Listings', icon: ShoppingBasket },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/profile', label: 'Profile', icon: UserRound },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <t.icon className="nav-icon" strokeWidth={2.2} />
          <span className="nav-label">{t.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
