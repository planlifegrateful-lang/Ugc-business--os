import { useCallback, useEffect, useRef, useState } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import {
  CampaignConfig,
  PLATFORM_MAX,
  ParsedScript,
  Platform,
  SessionRun,
} from './types'
import { buildSystemPrompt, buildUserPrompt } from './lib/prompt'
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
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('anthropic-api-key') || '')
  const [config, setConfig] = useState<CampaignConfig>(DEFAULT_CONFIG)
  const [streaming, setStreaming] = useState(false)
  const [rawStream, setRawStream] = useState('')
  const [scripts, setScripts] = useState<ParsedScript[]>([])
  const [activeVariant, setActiveVariant] = useState(0)
  const [history, setHistory] = useState<SessionRun[]>([])
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  useEffect(() => {
    if (apiKey) localStorage.setItem('anthropic-api-key', apiKey)
    else localStorage.removeItem('anthropic-api-key')
  }, [apiKey])

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
    if (!apiKey.trim()) {
      setError('Paste your Anthropic API key first.')
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

    const client = new Anthropic({
      apiKey: apiKey.trim(),
      dangerouslyAllowBrowser: true,
    })

    try {
      const stream = await client.messages.stream(
        {
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: buildSystemPrompt(config),
          messages: [{ role: 'user', content: buildUserPrompt(config) }],
        },
        { signal: controller.signal }
      )

      let full = ''
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          full += event.delta.text
          setRawStream(full)
        }
      }

      const parts = splitVariants(full)
      const parsed = parts.map(parseScript)
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
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
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
      <Header apiKey={apiKey} onApiKeyChange={setApiKey} />
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
