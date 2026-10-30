import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt, buildUserPrompt } from '../src/lib/prompt.ts'
import { validateCampaignConfig } from './validation.ts'

type RuntimeGlobal = typeof globalThis & {
  process?: { env?: Record<string, string | undefined> }
}

const env = (globalThis as RuntimeGlobal).process?.env ?? {}
const MODEL = 'claude-sonnet-4-6'
const MAX_BODY_BYTES = 16 * 1024

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  })
}

function isAllowedOrigin(value: string): boolean {
  try {
    const url = new URL(value)
    const isLocalHttp = url.protocol === 'http:' &&
      ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    return url.origin === value && (url.protocol === 'https:' || isLocalHttp)
  } catch {
    return false
  }
}

function constantTimeEqual(candidate: string, expected: string): boolean {
  const maxLength = Math.max(candidate.length, expected.length)
  let difference = candidate.length ^ expected.length
  for (let index = 0; index < maxLength; index += 1) {
    difference |= (candidate.charCodeAt(index) || 0) ^ (expected.charCodeAt(index) || 0)
  }
  return difference === 0
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: { allow: 'POST' },
      })
    }

    const apiKey = env.ANTHROPIC_API_KEY ?? ''
    const accessToken = env.APP_ACCESS_TOKEN ?? ''
    const configuredOrigins = (env.APP_ALLOWED_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin && isAllowedOrigin(origin))

    if (!apiKey || accessToken.length < 32 || configuredOrigins.length === 0) {
      return jsonResponse(503, { error: 'service_not_configured' })
    }

    const origin = request.headers.get('origin') ?? ''
    if (!origin || !configuredOrigins.includes(origin)) {
      return jsonResponse(403, { error: 'origin_not_allowed' })
    }

    if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
      return jsonResponse(415, { error: 'content_type_must_be_json' })
    }

    const authorization = request.headers.get('authorization') ?? ''
    const suppliedToken = authorization.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : ''
    if (!constantTimeEqual(suppliedToken, accessToken)) {
      return jsonResponse(401, { error: 'unauthorized' })
    }

    let rawBody: string
    try {
      rawBody = await request.text()
    } catch {
      return jsonResponse(400, { error: 'invalid_request' })
    }

    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return jsonResponse(413, { error: 'request_too_large' })
    }

    let body: unknown
    try {
      body = JSON.parse(rawBody)
    } catch {
      return jsonResponse(400, { error: 'invalid_request' })
    }

    const candidateConfig = body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>).config
      : undefined
    const validation = validateCampaignConfig(candidateConfig)
    if (!validation.ok) {
      return jsonResponse(400, { error: 'invalid_campaign', fields: validation.errors })
    }

    try {
      const client = new Anthropic({
        apiKey,
        timeout: 45_000,
        maxRetries: 0,
      })
      const message = await client.messages.create(
        {
          model: MODEL,
          max_tokens: 4096,
          system: buildSystemPrompt(validation.config),
          messages: [{ role: 'user', content: buildUserPrompt(validation.config) }],
        },
        { signal: request.signal },
      )

      const text = message.content
        .filter((block) => block.type === 'text')
        .map((block) => block.type === 'text' ? block.text : '')
        .join('\n')
        .trim()

      if (!text) return jsonResponse(502, { error: 'empty_provider_response' })
      return jsonResponse(200, { text })
    } catch {
      if (request.signal.aborted) return jsonResponse(408, { error: 'request_aborted' })
      return jsonResponse(502, { error: 'generation_failed' })
    }
  },
}
