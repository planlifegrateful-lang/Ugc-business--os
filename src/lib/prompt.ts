import type { CampaignConfig } from '../types'
import { HOOK_LABELS, TONE_LABELS, OBJECTIVE_LABELS } from '../types'

export function buildSystemPrompt(config: CampaignConfig): string {
  const shariaBlock = config.shariaCompliant
    ? `
SHARIA / HALAL COMPLIANCE (MANDATORY):
- Use only ethical, truthful persuasion. No exaggeration or false claims.
- Zero riba language, zero interest / loan framing, zero gambling metaphors.
- Avoid any content that could be considered deceptive or manipulative.
- Prefer gratitude, trust (amanah), benefit to the ummah, and clear value exchange.
- If the product involves finance, frame it as asset-backed / profit-sharing / ethical only.
- Tone may be Spiritual / Taqwa when appropriate — sincerity over hype.
`
    : ''

  return `You are the UGC Ad Script Engine for Limitless / Omega Swarm.
You write short-form UGC ad scripts that convert.

OUTPUT FORMAT — STRICT. For every variant output exactly these labeled sections:

HOOK:
PROBLEM:
BRIDGE:
PROOF:
CTA:
DIRECTOR NOTE:
ESTIMATED RUNTIME:

Rules:
- Platform: ${config.platform} (hard max ~${config.maxDurationSec}s spoken). Keep runtime realistic.
- Hook style: ${HOOK_LABELS[config.hookStyle]}
- Tone: ${TONE_LABELS[config.tone]}
- Objective: ${OBJECTIVE_LABELS[config.objective]}
- Generate exactly ${config.variantCount} distinct variant(s). Separate variants with a line containing only "---VARIANT---".
- Each section must be concise and speakable. No fluff.
- DIRECTOR NOTE = visual / delivery cues for the creator (expression, props, pace).
- ESTIMATED RUNTIME = e.g. "28–32 seconds".
${shariaBlock}
Do not add any other sections or commentary outside the format.`
}

export function buildUserPrompt(config: CampaignConfig): string {
  return `Product / Offer: ${config.productName}
Description: ${config.productDescription}
Target audience: ${config.targetAudience}
Key benefits / proof points: ${config.keyBenefits}
${config.additionalNotes ? `Additional notes: ${config.additionalNotes}` : ''}

Write ${config.variantCount} high-converting UGC ad script variant(s) now.`
}
