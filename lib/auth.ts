import { NextRequest } from 'next/server'

export function requireAuth(req: NextRequest): boolean {
  const token = process.env.PANEL_AUTH_TOKEN
  if (!token) return process.env.NODE_ENV !== 'production'
  const header = req.headers.get('authorization')
  return header === `Bearer ${token}`
}

export function unauthorized(): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}