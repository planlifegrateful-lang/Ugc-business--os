export type BoundedBodyResult =
  | { ok: true; text: string }
  | { ok: false; reason: 'too_large' | 'invalid_length' | 'read_error' | 'invalid_utf8' }

/**
 * Read a request body without buffering more than maxBytes in memory.
 * Content-Length is an early-rejection hint only; the stream is always bounded.
 */
export async function readBoundedBody(
  request: Request,
  maxBytes: number,
): Promise<BoundedBodyResult> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
    throw new RangeError('maxBytes must be a non-negative safe integer')
  }

  const declaredLength = request.headers.get('content-length')
  if (declaredLength !== null) {
    const normalizedLength = declaredLength.trim()
    if (!/^\d+$/.test(normalizedLength)) {
      return { ok: false, reason: 'invalid_length' }
    }
    if (Number(normalizedLength) > maxBytes) {
      return { ok: false, reason: 'too_large' }
    }
  }

  const reader = request.body?.getReader()
  if (!reader) return { ok: true, text: '' }

  const chunks: Uint8Array[] = []
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value) continue

      totalBytes += value.byteLength
      if (totalBytes > maxBytes) {
        try {
          await reader.cancel()
        } catch {
          // The size limit is already enforced; cancellation is best effort.
        }
        return { ok: false, reason: 'too_large' }
      }
      chunks.push(value)
    }
  } catch {
    return { ok: false, reason: 'read_error' }
  } finally {
    try {
      reader.releaseLock()
    } catch {
      // A cancelled/errored stream may already have released its reader.
    }
  }

  const bytes = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }

  try {
    return {
      ok: true,
      text: new TextDecoder('utf-8', { fatal: true }).decode(bytes),
    }
  } catch {
    return { ok: false, reason: 'invalid_utf8' }
  }
}