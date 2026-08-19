import { NextRequest, NextResponse } from 'next/server'
import { deleteShortcut, getShortcut, updateShortcut } from '@/lib/store'
import type { Shortcut } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const shortcut = getShortcut(id)
  if (!shortcut) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(shortcut)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const existing = getShortcut(id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const patch: Partial<Shortcut> = {}
  if (typeof body.name === 'string') patch.name = body.name
  if (Array.isArray(body.agentIds)) {
    patch.agentIds = (body.agentIds as unknown[]).filter((x): x is string => typeof x === 'string')
  }
  if (typeof body.templateId === 'string' || body.templateId === null) patch.templateId = body.templateId
  if (typeof body.prompt === 'string' || body.prompt === null) patch.prompt = body.prompt ?? undefined
  if (body.variables && typeof body.variables === 'object') patch.variables = body.variables as Record<string, string>

  const updated = updateShortcut(id, patch)
  return NextResponse.json(updated)
}

export async function DELETE({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!deleteShortcut(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
