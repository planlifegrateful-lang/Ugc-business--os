import {
  HOOK_LABELS,
  OBJECTIVE_LABELS,
  PLATFORM_MAX,
  TONE_LABELS,
} from '../src/types.ts'
import type {
  CampaignConfig,
  HookStyle,
  Objective,
  Platform,
  ToneMode,
} from '../src/types.ts'

const hasKey = (source: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(source, key)

function readText(
  input: Record<string, unknown>,
  key: string,
  maxLength: number,
  errors: string[],
  required = false,
): string {
  const value = input[key] ?? ''
  if (typeof value !== 'string') {
    errors.push(key)
    return ''
  }
  const trimmed = value.trim()
  if (required && !trimmed) errors.push(key)
  if (trimmed.length > maxLength) errors.push(`${key}_too_long`)
  return trimmed
}

export type ValidationResult =
  | { ok: true; config: CampaignConfig }
  | { ok: false; errors: string[] }

export function validateCampaignConfig(input: unknown): ValidationResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, errors: ['config'] }
  }

  const value = input as Record<string, unknown>
  const errors: string[] = []
  const productName = readText(value, 'productName', 120, errors, true)
  const productDescription = readText(value, 'productDescription', 1600, errors)
  const targetAudience = readText(value, 'targetAudience', 300, errors)
  const keyBenefits = readText(value, 'keyBenefits', 1200, errors)
  const additionalNotes = readText(value, 'additionalNotes', 1000, errors)

  const platform = typeof value.platform === 'string' && hasKey(PLATFORM_MAX, value.platform)
    ? value.platform as Platform
    : null
  if (!platform) errors.push('platform')

  const hookStyle = typeof value.hookStyle === 'string' && hasKey(HOOK_LABELS, value.hookStyle)
    ? value.hookStyle as HookStyle
    : null
  if (!hookStyle) errors.push('hookStyle')

  const tone = typeof value.tone === 'string' && hasKey(TONE_LABELS, value.tone)
    ? value.tone as ToneMode
    : null
  if (!tone) errors.push('tone')

  const objective = typeof value.objective === 'string' && hasKey(OBJECTIVE_LABELS, value.objective)
    ? value.objective as Objective
    : null
  if (!objective) errors.push('objective')

  const variantCount = value.variantCount === 1 || value.variantCount === 2 || value.variantCount === 3
    ? value.variantCount
    : null
  if (!variantCount) errors.push('variantCount')

  if (typeof value.shariaCompliant !== 'boolean') errors.push('shariaCompliant')

  if (errors.length || !platform || !hookStyle || !tone || !objective || !variantCount || typeof value.shariaCompliant !== 'boolean') {
    return { ok: false, errors: [...new Set(errors)] }
  }

  return {
    ok: true,
    config: {
      productName,
      productDescription,
      targetAudience,
      keyBenefits,
      platform,
      hookStyle,
      tone,
      objective,
      variantCount,
      shariaCompliant: value.shariaCompliant,
      maxDurationSec: PLATFORM_MAX[platform],
      additionalNotes,
    },
  }
}
