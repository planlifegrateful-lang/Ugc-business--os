import { Key, Shield } from 'lucide-react'
import './Header.css'

interface Props {
  accessCode: string
  onAccessCodeChange: (value: string) => void
}

export function Header({ accessCode, onAccessCodeChange }: Props) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-mark">Ω</div>
        <div className="logo-text">
          <span className="logo-title serif">UGC Ad Script Engine</span>
          <span className="logo-sub">OMEGA SWARM v10 · Limitless</span>
        </div>
      </div>
      <div className="header-right">
        <div className="access-code-wrap">
          <Key size={14} className="key-icon" />
          <input
            type="password"
            placeholder="Private app access code"
            aria-label="Private app access code"
            value={accessCode}
            onChange={(event) => onAccessCodeChange(event.target.value)}
            className="access-code-input"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="badge">
          <Shield size={12} />
          <span>Server-side key</span>
        </div>
      </div>
    </header>
  )
}
