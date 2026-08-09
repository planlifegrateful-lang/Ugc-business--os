export type Platform = 'tiktok' | 'reels' | 'facebook' | 'youtube-shorts'
export type HookStyle = 'pain-point' | 'pattern-interrupt' | 'story' | 'result-first' | 'question' | 'before-after'
export type ToneMode = 'casual' | 'authoritative' | 'urgent' | 'empathetic' | 'luxury' | 'spiritual-taqwa'
export type Objective = 'awareness' | 'engagement' | 'consideration' | 'conversion' | 'direct-sale'

export interface CampaignConfig {
  productName: string
  productDescription: string
  targetAudience: string
  keyBenefits: string
  platform: Platform
  hookStyle: HookStyle
  tone: ToneMode
  objective: Objective
  variantCount: 1 | 2 | 3
  shariaCompliant: boolean
  maxDurationSec: number
  additionalNotes: string
}

export interface ParsedScript {
  hook: string
  problem: string
  bridge: string
  proof: string
  cta: string
  directorNote: string
  estimatedRuntime: string
  raw: string
}

export interface SessionRun {
  id: string
  timestamp: number
  config: CampaignConfig
  scripts: ParsedScript[]
  activeVariant: number
}

export const PLATFORM_MAX: Record<Platform, number> = {
  'tiktok': 60,
  'reels': 90,
  'facebook': 60,
  'youtube-shorts': 60,
}

export const HOOK_LABELS: Record<HookStyle, string> = {
  'pain-point': 'Pain Point',
  'pattern-interrupt': 'Pattern Interrupt',
  'story': 'Story',
  'result-first': 'Result First',
  'question': 'Question',
  'before-after': 'Before / After',
}

export const TONE_LABELS: Record<ToneMode, string> = {
  'casual': 'Casual',
  'authoritative': 'Authoritative',
  'urgent': 'Urgent',
  'empathetic': 'Empathetic',
  'luxury': 'Luxury',
  'spiritual-taqwa': 'Spiritual / Taqwa',
}

export const OBJECTIVE_LABELS: Record<Objective, string> = {
  'awareness': 'Awareness',
  'engagement': 'Engagement',
  'consideration': 'Consideration',
  'conversion': 'Conversion',
  'direct-sale': 'Direct Sale',
}
