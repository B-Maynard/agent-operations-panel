import { NextRequest, NextResponse } from 'next/server'
import { createShortcut, listShortcuts } from '@/lib/store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json(listShortcuts())
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const name = typeof body?.name === 'string' ? body.name : ''
  const agentIds = Array.isArray(body?.agentIds)
    ? (body.agentIds as unknown[]).filter((x): x is string => typeof x === 'string')
    : []
  const templateId = typeof body?.templateId === 'string' ? body.templateId : null
  const prompt = typeof body?.prompt === 'string' ? body.prompt : undefined
  const variables =
    body?.variables && typeof body.variables === 'object'
      ? (body.variables as Record<string, string>)
      : undefined

  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })
  if (agentIds.length === 0) return NextResponse.json({ error: 'agentIds (non-empty) is required' }, { status: 400 })
  if (!templateId && !prompt) return NextResponse.json({ error: 'templateId or prompt is required' }, { status: 400 })

  const shortcut = createShortcut({ name, agentIds, templateId, prompt, variables })
  return NextResponse.json(shortcut, { status: 201 })
}
