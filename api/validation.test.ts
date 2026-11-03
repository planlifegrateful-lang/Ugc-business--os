import assert from 'node:assert/strict'
import test from 'node:test'
import { validateCampaignConfig } from './validation.ts'
import { readBoundedBody } from './request-body.ts'

const validConfig = {
  productName: 'Plan Life Grateful',
  productDescription: 'A practical gratitude guide.',
  targetAudience: 'Busy adults',
  keyBenefits: 'Simple daily exercises',
  platform: 'tiktok',
  hookStyle: 'pain-point',
  tone: 'casual',
  objective: 'conversion',
  variantCount: 2,
  shariaCompliant: true,
  maxDurationSec: 9999,
  additionalNotes: '',
}

test('accepts valid campaign and derives duration from the server allowlist', () => {
  const result = validateCampaignConfig(validConfig)
  assert.equal(result.ok, true)
  if (result.ok) assert.equal(result.config.maxDurationSec, 60)
})

test('rejects missing product name', () => {
  const result = validateCampaignConfig({ ...validConfig, productName: '   ' })
  assert.equal(result.ok, false)
  if (!result.ok) assert.ok(result.errors.includes('productName'))
})

test('rejects unsupported platform values', () => {
  const result = validateCampaignConfig({ ...validConfig, platform: 'unknown' })
  assert.equal(result.ok, false)
  if (!result.ok) assert.ok(result.errors.includes('platform'))
})

test('rejects invalid variant counts', () => {
  const result = validateCampaignConfig({ ...validConfig, variantCount: 9 })
  assert.equal(result.ok, false)
  if (!result.ok) assert.ok(result.errors.includes('variantCount'))
})

test('rejects non-boolean Sharia option', () => {
  const result = validateCampaignConfig({ ...validConfig, shariaCompliant: 'true' })
  assert.equal(result.ok, false)
  if (!result.ok) assert.ok(result.errors.includes('shariaCompliant'))
})

test('rejects overlong free-text fields', () => {
  const result = validateCampaignConfig({ ...validConfig, productDescription: 'x'.repeat(1601) })
  assert.equal(result.ok, false)
  if (!result.ok) assert.ok(result.errors.includes('productDescription_too_long'))
})

test('rejects arrays and null as configuration objects', () => {
  assert.equal(validateCampaignConfig([]).ok, false)
  assert.equal(validateCampaignConfig(null).ok, false)
})

test('bounded body reader accepts a body at the exact byte limit', async () => {
  const payload = 'x'.repeat(16)
  const request = new Request('https://example.test/api', { method: 'POST', body: payload })
  assert.deepEqual(await readBoundedBody(request, 16), { ok: true, text: payload })
})

test('bounded body reader cancels an oversized streamed body without Content-Length', async () => {
  let cancelled = false
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      controller.enqueue(new Uint8Array(17))
    },
    cancel() {
      cancelled = true
    },
  })
  const request = new Request('https://example.test/api', {
    method: 'POST',
    body: stream,
    duplex: 'half',
  } as RequestInit)

  assert.deepEqual(await readBoundedBody(request, 16), { ok: false, reason: 'too_large' })
  assert.equal(cancelled, true)
})

test('bounded body reader rejects an oversized declared Content-Length before reading', async () => {
  let cancelled = false
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      controller.enqueue(new Uint8Array([1]))
    },
    cancel() { cancelled = true },
  })
  const request = new Request('https://example.test/api', {
    method: 'POST',
    headers: { 'content-length': '17' },
    body: stream,
    duplex: 'half',
  } as RequestInit)

  assert.deepEqual(await readBoundedBody(request, 16), { ok: false, reason: 'too_large' })
  assert.equal(cancelled, true)
})

test('bounded body reader rejects malformed UTF-8', async () => {
  const request = new Request('https://example.test/api', {
    method: 'POST',
    body: new Uint8Array([0xff]),
  })
  assert.deepEqual(await readBoundedBody(request, 16), { ok: false, reason: 'invalid_utf8' })
})