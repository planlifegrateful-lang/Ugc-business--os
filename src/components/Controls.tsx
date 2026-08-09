import {
  CampaignConfig,
  HOOK_LABELS,
  OBJECTIVE_LABELS,
  PLATFORM_MAX,
  Platform,
  TONE_LABELS,
  HookStyle,
  ToneMode,
  Objective,
} from '../types'
import { Sparkles, Square } from 'lucide-react'
import './Controls.css'

interface Props {
  config: CampaignConfig
  onChange: (patch: Partial<CampaignConfig>) => void
  onGenerate: () => void
  onStop: () => void
  streaming: boolean
  error: string | null
}

export function Controls({ config, onChange, onGenerate, onStop, streaming, error }: Props) {
  return (
    <div className="controls">
      <section className="ctrl-section">
        <h3 className="ctrl-heading serif">Campaign</h3>
        <label className="field">
          <span>Product / Offer</span>
          <input
            value={config.productName}
            onChange={(e) => onChange({ productName: e.target.value })}
            placeholder="e.g. Limitless Focus Protocol"
          />
        </label>
        <label className="field">
          <span>Description</span>
          <textarea
            rows={2}
            value={config.productDescription}
            onChange={(e) => onChange({ productDescription: e.target.value })}
            placeholder="What it is, who it's for, core promise"
          />
        </label>
        <label className="field">
          <span>Target audience</span>
          <input
            value={config.targetAudience}
            onChange={(e) => onChange({ targetAudience: e.target.value })}
            placeholder="e.g. Muslim professionals 25–40"
          />
        </label>
        <label className="field">
          <span>Key benefits / proof</span>
          <textarea
            rows={2}
            value={config.keyBenefits}
            onChange={(e) => onChange({ keyBenefits: e.target.value })}
            placeholder="Results, testimonials, differentiators"
          />
        </label>
        <label className="field">
          <span>Additional notes</span>
          <input
            value={config.additionalNotes}
            onChange={(e) => onChange({ additionalNotes: e.target.value })}
            placeholder="Optional constraints or angles"
          />
        </label>
      </section>

      <section className="ctrl-section">
        <h3 className="ctrl-heading serif">Format</h3>
        <label className="field">
          <span>Platform</span>
          <select
            value={config.platform}
            onChange={(e) => onChange({ platform: e.target.value as Platform })}
          >
            {(Object.keys(PLATFORM_MAX) as Platform[]).map((p) => (
              <option key={p} value={p}>
                {p === 'youtube-shorts' ? 'YouTube Shorts' : p.charAt(0).toUpperCase() + p.slice(1)} · max {PLATFORM_MAX[p]}s
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Hook style</span>
          <select
            value={config.hookStyle}
            onChange={(e) => onChange({ hookStyle: e.target.value as HookStyle })}
          >
            {(Object.keys(HOOK_LABELS) as HookStyle[]).map((k) => (
              <option key={k} value={k}>{HOOK_LABELS[k]}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Tone</span>
          <select
            value={config.tone}
            onChange={(e) => onChange({ tone: e.target.value as ToneMode })}
          >
            {(Object.keys(TONE_LABELS) as ToneMode[]).map((k) => (
              <option key={k} value={k}>{TONE_LABELS[k]}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Objective</span>
          <select
            value={config.objective}
            onChange={(e) => onChange({ objective: e.target.value as Objective })}
          >
            {(Object.keys(OBJECTIVE_LABELS) as Objective[]).map((k) => (
              <option key={k} value={k}>{OBJECTIVE_LABELS[k]}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Variants</span>
          <select
            value={config.variantCount}
            onChange={(e) => onChange({ variantCount: Number(e.target.value) as 1 | 2 | 3 })}
          >
            <option value={1}>1 variant</option>
            <option value={2}>2 variants</option>
            <option value={3}>3 variants</option>
          </select>
        </label>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={config.shariaCompliant}
            onChange={(e) => onChange({ shariaCompliant: e.target.checked })}
          />
          <span>Sharia compliance — halal framing only</span>
        </label>
      </section>

      {error && <div className="ctrl-error">{error}</div>}

      <div className="ctrl-actions">
        {streaming ? (
          <button type="button" className="btn-stop" onClick={onStop}>
            <Square size={14} /> Stop
          </button>
        ) : (
          <button type="button" className="btn-generate" onClick={onGenerate}>
            <Sparkles size={16} /> Generate Scripts
          </button>
        )}
      </div>
    </div>
  )
}
