import { Key, Shield } from 'lucide-react'
import './Header.css'

interface Props {
  apiKey: string
  onApiKeyChange: (v: string) => void
}

export function Header({ apiKey, onApiKeyChange }: Props) {
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
        <div className="api-key-wrap">
          <Key size={14} className="key-icon" />
          <input
            type="password"
            placeholder="Anthropic API key"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            className="api-key-input"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="badge">
          <Shield size={12} />
          <span>Local-first</span>
        </div>
      </div>
    </header>
  )
}
