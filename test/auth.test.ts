import { describe, it, expect, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth'

describe('auth', () => {
  const original = process.env.PANEL_AUTH_TOKEN

  afterEach(() => {
    if (original === undefined) delete process.env.PANEL_AUTH_TOKEN
    else process.env.PANEL_AUTH_TOKEN = original
    vi.restoreAllMocks()
  })

  it('allows all when no token configured', () => {
    delete process.env.PANEL_AUTH_TOKEN
    const req = new NextRequest('http://localhost/api/agents')
    expect(requireAuth(req)).toBe(true)
  })

  it('rejects missing header when token configured', () => {
    process.env.PANEL_AUTH_TOKEN = 'secret'
    const req = new NextRequest('http://localhost/api/agents')
    expect(requireAuth(req)).toBe(false)
  })

  it('rejects wrong token', () => {
    process.env.PANEL_AUTH_TOKEN = 'secret'
    const req = new NextRequest('http://localhost/api/agents', {
      headers: { authorization: 'Bearer wrong' },
    })
    expect(requireAuth(req)).toBe(false)
  })

  it('accepts correct token', () => {
    process.env.PANEL_AUTH_TOKEN = 'secret'
    const req = new NextRequest('http://localhost/api/agents', {
      headers: { authorization: 'Bearer secret' },
    })
    expect(requireAuth(req)).toBe(true)
  })

  it('unauthorized returns 401', () => {
    expect(unauthorized().status).toBe(401)
  })
})
