import type { SessionRun } from '../types'

const KEY = 'ugc-ad-script-engine-history'
const MAX = 10

export function loadHistory(): SessionRun[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.slice(0, MAX) : []
  } catch {
    return []
  }
}

export function saveHistory(runs: SessionRun[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(runs.slice(0, MAX)))
  } catch {
    // quota or private mode — ignore
  }
}

export function addRun(run: SessionRun, existing: SessionRun[]): SessionRun[] {
  const next = [run, ...existing.filter((r) => r.id !== run.id)].slice(0, MAX)
  saveHistory(next)
  return next
}
