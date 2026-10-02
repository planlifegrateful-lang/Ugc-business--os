import { useCallback, useEffect, useRef, useState } from 'react'
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

function generateOfflineScripts(config: CampaignConfig): string[] {
  const product = config.productName.trim() || 'your product'
  const audience = config.targetAudience.trim() || 'busy creators and small businesses'
  const benefitText = (config.keyBenefits || 'saves time, removes friction, improves consistency')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(', ')

  const hookPool = [
    'Here’s the truth no one tells you...',
    'If you’re still doing this, stop.',
    'This is the shortcut nobody talks about.',
    'I wish I knew this before I started.',
    'Most people get this wrong.',
  ]

  const hook = hookPool[Math.floor(Math.random() * hookPool.length)]

  return [
    [
      `HOOK: ${hook}`,
      `PROBLEM: ${audience} keep trying to grow with ${product}, but they lose time, get inconsistent results, and feel stuck.` ,
      `BRIDGE: The real solution isn’t more work — it’s a simpler system that helps you stay focused and get better outcomes.` ,
      `PROOF: ${product} gives you ${benefitText} without the overwhelm.` ,
      `CTA: Stop guessing. Start with ${product} today.` ,
      `DIRECTOR NOTE: Keep the pacing fast, show a pain-point moment in the first 2 seconds, then transition to the solution.` ,
      `ESTIMATED RUNTIME: 20-30 seconds`,
    ].join('\n\n'),
    [
      `HOOK: ${product} is easier than it looks.`,
      `PROBLEM: People think they need more tools, more effort, and more stress to get real results.`,
      `BRIDGE: The better move is using a system that keeps things simple and effective from day one.`,
      `PROOF: ${product} helps ${audience} improve with ${benefitText}.`,
      `CTA: Try ${product} and make this process simpler.`,
      `DIRECTOR NOTE: Use a clean shot list, show the product in action, and close with a confident CTA.`,
      `ESTIMATED RUNTIME: 25-35 seconds`,
    ].join('\n\n'),
    [
      `HOOK: This is why ${product} works.`,
      `PROBLEM: Most people waste effort because they don’t have a repeatable system.`,
      `BRIDGE: ${product} gives ${audience} a cleaner path to better results without the guesswork.`,
      `PROOF: With ${benefitText}, it becomes easier to move faster and stay consistent.`,
      `CTA: Use ${product} and see the difference for yourself.`,
      `DIRECTOR NOTE: Open with a quick before/after style visual and end on a strong, direct CTA.`,
      `ESTIMATED RUNTIME: 15-25 seconds`,
    ].join('\n\n'),
  ]
}

export default function App() {
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
      const full = generateOfflineScripts(config).join('\n\n---VARIANT---\n\n')
      const parts = splitVariants(full)
      const parsed = parts.map(parseScript)

      setScripts(parsed)
      setActiveVariant(0)
      setRawStream(full)

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
      <Header />
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
