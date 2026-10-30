import { describe, expect, it } from 'vitest'
import nextConfig from './next.config'

describe('next.config', () => {
  it('sends the four security headers on every route (BUG-4)', async () => {
    const rules = await nextConfig.headers?.()
    const rule = rules?.find((r) => r.source === '/:path*')
    const headers = Object.fromEntries((rule?.headers ?? []).map((h) => [h.key, h.value]))

    expect(headers['X-Frame-Options']).toBe('DENY')
    expect(headers['X-Content-Type-Options']).toBe('nosniff')
    expect(headers['Referrer-Policy']).toBe('origin-when-cross-origin')
    expect(headers['Strict-Transport-Security']).toBe('max-age=31536000; includeSubDomains')
  })

  it('does not announce the framework (BUG-4)', () => {
    expect(nextConfig.poweredByHeader).toBe(false)
  })
})
