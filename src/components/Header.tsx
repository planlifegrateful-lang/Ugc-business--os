import { Key, Shield } from 'lucide-react'
import './Header.css'

export function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-mark">Ω</div>
        <div className="logo-text">
          <span className="logo-title serif">UGC Ad Script Engine</span>
          <span className="logo-sub">ZERO-API · LOCAL-FIRST</span>
        </div>
      </div>
      <div className="header-right">
        <div className="badge">
          <Shield size={12} />
          <span>No API keys required</span>
        </div>
      </div>
    </header>
  )
}
