import { ParsedScript } from '../types'
import { Copy, Download, Loader2 } from 'lucide-react'
import './OutputPanel.css'

interface Props {
  streaming: boolean
  rawStream: string
  scripts: ParsedScript[]
  activeVariant: number
  onVariantChange: (i: number) => void
  onCopy: () => void
  onDownload: () => void
}

const SECTION_KEYS: { key: keyof ParsedScript; label: string }[] = [
  { key: 'hook', label: 'HOOK' },
  { key: 'problem', label: 'PROBLEM' },
  { key: 'bridge', label: 'BRIDGE' },
  { key: 'proof', label: 'PROOF' },
  { key: 'cta', label: 'CTA' },
  { key: 'directorNote', label: 'DIRECTOR NOTE' },
  { key: 'estimatedRuntime', label: 'ESTIMATED RUNTIME' },
]

export function OutputPanel({
  streaming,
  rawStream,
  scripts,
  activeVariant,
  onVariantChange,
  onCopy,
  onDownload,
}: Props) {
  const hasScripts = scripts.length > 0
  const active = hasScripts ? scripts[activeVariant] : null
  const showRaw = streaming || (!hasScripts && rawStream)

  return (
    <div className="output">
      <div className="output-toolbar">
        <div className="variant-tabs">
          {hasScripts
            ? scripts.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`variant-tab ${i === activeVariant ? 'active' : ''}`}
                  onClick={() => onVariantChange(i)}
                >
                  Variant {i + 1}
                </button>
              ))
            : (
              <span className="output-status">
                {streaming ? (
                  <>
                    <Loader2 size={14} className="spin" /> Streaming…
                  </>
                ) : (
                  'Ready'
                )}
              </span>
            )}
        </div>
        <div className="output-actions">
          <button type="button" className="icon-btn" onClick={onCopy} title="Copy">
            <Copy size={15} />
          </button>
          <button type="button" className="icon-btn" onClick={onDownload} title="Download all">
            <Download size={15} />
          </button>
        </div>
      </div>

      <div className="output-body">
        {showRaw && !hasScripts ? (
          <pre className="stream-raw">{rawStream || (streaming ? '' : 'Configure campaign and generate.')}</pre>
        ) : active ? (
          <div className="script-sections">
            {SECTION_KEYS.map(({ key, label }) => {
              const val = active[key]
              if (!val || key === 'raw') return null
              return (
                <div key={key} className="script-block">
                  <div className="script-label">{label}</div>
                  <div className="script-content">{val}</div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="output-empty serif">
            <p>Configure the campaign → Generate Scripts</p>
            <p className="empty-sub">Live Anthropic stream · Structured HOOK → CTA · Creator handoff</p>
          </div>
        )}
      </div>
    </div>
  )
}
