import type { ParsedScript } from '../types'

const SECTIONS = [
  'HOOK',
  'PROBLEM',
  'BRIDGE',
  'PROOF',
  'CTA',
  'DIRECTOR NOTE',
  'ESTIMATED RUNTIME',
] as const

export function parseScript(raw: string): ParsedScript {
  const result: ParsedScript = {
    hook: '',
    problem: '',
    bridge: '',
    proof: '',
    cta: '',
    directorNote: '',
    estimatedRuntime: '',
    raw: raw.trim(),
  }

  const lines = raw.split(/\r?\n/)
  let current: string | null = null
  const buffers: Record<string, string[]> = {}

  for (const line of lines) {
    const upper = line.trim().toUpperCase()
    const matched = SECTIONS.find((s) => upper.startsWith(s + ':') || upper === s)
    if (matched) {
      current = matched
      buffers[current] = buffers[current] || []
      const after = line.slice(line.toUpperCase().indexOf(matched) + matched.length).replace(/^[:\s]+/, '')
      if (after) buffers[current].push(after)
    } else if (current) {
      buffers[current].push(line)
    }
  }

  result.hook = (buffers['HOOK'] || []).join('\n').trim()
  result.problem = (buffers['PROBLEM'] || []).join('\n').trim()
  result.bridge = (buffers['BRIDGE'] || []).join('\n').trim()
  result.proof = (buffers['PROOF'] || []).join('\n').trim()
  result.cta = (buffers['CTA'] || []).join('\n').trim()
  result.directorNote = (buffers['DIRECTOR NOTE'] || []).join('\n').trim()
  result.estimatedRuntime = (buffers['ESTIMATED RUNTIME'] || []).join('\n').trim()

  if (!result.hook && !result.problem && raw.trim()) {
    result.hook = raw.trim()
  }

  return result
}

export function scriptsToPlainText(scripts: ParsedScript[]): string {
  return scripts
    .map((s, i) => {
      const parts = [
        `=== VARIANT ${i + 1} ===`,
        `HOOK:\n${s.hook}`,
        `PROBLEM:\n${s.problem}`,
        `BRIDGE:\n${s.bridge}`,
        `PROOF:\n${s.proof}`,
        `CTA:\n${s.cta}`,
        `DIRECTOR NOTE:\n${s.directorNote}`,
        `ESTIMATED RUNTIME:\n${s.estimatedRuntime}`,
      ]
      return parts.join('\n\n')
    })
    .join('\n\n----------------------------\n\n')
}
