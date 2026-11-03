import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CampaignConfig,
  PLATFORM_MAX,
  ParsedScript,
  Platform,
  SessionRun,
} from './types'
import { parseScript, scriptsToPlainText } from './lib/parser'
import { addRun, loadHistory } from './lib/storage'
import { Header } from './components/Header'
import { Controls } from './components/Controls'
import { OutputPanel } from './components/OutputPanel'
import { HistoryPanel } from './components/HistoryPanel'
import './App.css'

const DEFAULT_CONFIG: CampaignConfig = {
  productName: '',
  productDescription: '',
  targetAudience: '',
  keyBenefits: '',
  platform: 'tiktok',
  hookStyle: 'pain-point',
  tone: 'casual',
  objective: 'conversion',
  variantCount: 2,
  shariaCompliant: false,
  maxDurationSec: 60,
  additionalNotes: '',
}

function splitVariants(full: string): string[] {
  return full
    .split(/---VARIANT---/i)
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function App() {
  const [accessCode, setAccessCode] = useState('')
  const [config, setConfig] = useState<CampaignConfig>(DEFAULT_CONFIG)
  const [streaming, setStreaming] = useState(false)
  const [rawStream, setRawStream] = useState('')
  const [scripts, setScripts] = useState<ParsedScript[]>([])
  const [activeVariant, setActiveVariant] = useState(0)
  const [history, setHistory] = useState<SessionRun[]>([])
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    try {
      localStorage.removeItem('anthropic-api-key')
    } catch {
      // Storage may be unavailable in restricted browser contexts.
    }
    setHistory(loadHistory())
  }, [])

  const updateConfig = useCallback((patch: Partial<CampaignConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch }
      if (patch.platform) {
        next.maxDurationSec = PLATFORM_MAX[patch.platform as Platform]
      }
      return next
    })
  }, [])

  const stop = () => {
    abortRef.current?.abort()
    abortRef.current = null
    setStreaming(false)
  }

  const generate = async () => {
    if (!accessCode.trim()) {
      setError('Enter the private app access code first.')
      return
    }
    if (!config.productName.trim()) {
      setError('Product name is required.')
      return
    }

    setError(null)
    setStreaming(true)
    setRawStream('')
    setScripts([])
    setActiveVariant(0)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${accessCode.trim()}`,
        },
        body: JSON.stringify({ config }),
        signal: controller.signal,
      })
      const payload = await response.json() as { text?: unknown; error?: string }
      if (!response.ok) {
        const messages: Record<string, string> = {
          service_not_configured: 'The secure server is not configured yet.',
          origin_not_allowed: 'This app address is not approved for generation.',
          unauthorized: 'The private app access code is not correct.',
          content_type_must_be_json: 'The request format was rejected.',
          request_too_large: 'Shorten the campaign details and try again.',
          invalid_request: 'The request could not be read. Please try again.',
          invalid_campaign: 'Check the campaign fields and try again.',
          generation_failed: 'The model service could not complete the request. Try again later.',
          empty_provider_response: 'The model returned an empty response. Try again.',
          request_aborted: 'Generation was stopped.',
        }
        setError(messages[payload.error ?? ''] ?? 'Generation failed. Please try again.')
        return
      }
      if (typeof payload.text !== 'string' || !payload.text.trim()) {
        setError('The secure generation service returned an empty response.')
        return
      }

      const full = payload.text
      setRawStream(full)
      const parsed = splitVariants(full).map(parseScript)
      setScripts(parsed)
      setActiveVariant(0)

      const run: SessionRun = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        config: { ...config },
        scripts: parsed,
        activeVariant: 0,
      }
      setHistory((prev) => addRun(run, prev))
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') return
      setError(err instanceof TypeError
        ? 'Could not reach the secure generation endpoint. Use the deployed app or run it with Vercel CLI.'
        : 'Generation failed. Please try again.')
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  const loadRun = (run: SessionRun) => {
    setConfig(run.config)
    setScripts(run.scripts)
    setActiveVariant(run.activeVariant)
    setRawStream('')
    setError(null)
  }

  const copyActive = () => {
    const text = scripts[activeVariant]?.raw || rawStream
    if (text) navigator.clipboard.writeText(text)
  }

  const downloadAll = () => {
    const text = scripts.length
      ? scriptsToPlainText(scripts)
      : rawStream
    if (!text) return
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ugc-scripts-${config.productName.replace(/\s+/g, '-').toLowerCase() || 'export'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app">
      <Header accessCode={accessCode} onAccessCodeChange={setAccessCode} />
      <main className="main">
        <aside className="sidebar">
          <Controls
            config={config}
            onChange={updateConfig}
            onGenerate={generate}
            onStop={stop}
            streaming={streaming}
            error={error}
          />
          <HistoryPanel history={history} onSelect={loadRun} />
        </aside>
        <OutputPanel
          streaming={streaming}
          rawStream={rawStream}
          scripts={scripts}
          activeVariant={activeVariant}
          onVariantChange={setActiveVariant}
          onCopy={copyActive}
          onDownload={downloadAll}
        />
      </main>
    </div>
  )
}
