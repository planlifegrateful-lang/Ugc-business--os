import assert from 'node:assert/strict'
import test from 'node:test'
import { validateCampaignConfig } from './validation.ts'

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
