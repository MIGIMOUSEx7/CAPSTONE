import { useNavigate } from 'react-router-dom'
import './Splash.css'

export default function Splash() {
  const navigate = useNavigate()
  return (
    <div className="splash page-no-nav">
      <div className="splash-content">
        <div className="logo-wrap">
          <div className="logo-icon">🌿</div>
          <h1>AgriResQ</h1>
          <p>IoT-Assisted Rescue Distribution for Surplus Vegetables</p>
        </div>
        <div className="splash-actions">
          <button className="btn btn-primary" onClick={() => navigate('/register')}>Get Started</button>
          <button className="btn btn-outline" onClick={() => navigate('/login')}>Login</button>
        </div>
      </div>
    </div>
  )
}
