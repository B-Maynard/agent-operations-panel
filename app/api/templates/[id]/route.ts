import { NextRequest, NextResponse } from 'next/server'
import { deleteTemplate, getTemplate, updateTemplate } from '@/lib/store'
import { detectVariables } from '@/lib/utils'
import type { Template } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const existing = getTemplate(id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const patch: Partial<Template> = {}
  if (typeof body.name === 'string') patch.name = body.name
  if (typeof body.prompt === 'string') {
    patch.prompt = body.prompt
    patch.variables = detectVariables(body.prompt)
  }
  const updated = updateTemplate(id, patch)
  return NextResponse.json(updated)
}

export async function DELETE({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!deleteTemplate(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}