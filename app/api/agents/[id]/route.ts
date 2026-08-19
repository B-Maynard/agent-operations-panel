import { NextRequest, NextResponse } from 'next/server'
import { deleteAgent, getAgent, updateAgent } from '@/lib/store'
import { toPublicAgent } from '@/lib/utils'
import { requireAuth, unauthorized } from '@/lib/auth'
import type { Agent } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAuth(req)) return unauthorized()
  const { id } = await params
  const agent = getAgent(id)
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(toPublicAgent(agent))
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAuth(req)) return unauthorized()
  const { id } = await params
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const existing = getAgent(id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const patch: Partial<Agent> = {}
  if (typeof body.name === 'string') patch.name = body.name
  if (typeof body.baseUrl === 'string' && body.baseUrl !== existing.baseUrl) {
    if (typeof body.apiKey !== 'string' || !body.apiKey) {
      return NextResponse.json({ error: 'apiKey is required when changing baseUrl' }, { status: 400 })
    }
    patch.baseUrl = body.baseUrl
    patch.apiKey = body.apiKey
  } else if (typeof body.apiKey === 'string' && body.apiKey) {
    patch.apiKey = body.apiKey
  }
  if (body.profile && typeof body.profile === 'object') patch.profile = body.profile as Record<string, unknown>
  if (typeof body.enabled === 'boolean') patch.enabled = body.enabled

  const updated = updateAgent(id, patch)
  return NextResponse.json(toPublicAgent(updated!))
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAuth(req)) return unauthorized()
  const { id } = await params
  if (!deleteAgent(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}