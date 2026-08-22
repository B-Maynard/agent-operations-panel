import { NextRequest, NextResponse } from 'next/server'
import { getShortcut, getTemplate } from '@/lib/store'
import { dispatchFanout } from '@/lib/fanout'
import { resolveTemplate } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const shortcut = getShortcut(id)
  if (!shortcut) return NextResponse.json({ error: 'Shortcut not found' }, { status: 404 })

  const templateId = shortcut.templateId ?? null
  let finalPrompt = shortcut.prompt ?? ''
  if (templateId) {
    const template = getTemplate(templateId)
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    try {
      finalPrompt = resolveTemplate(template, shortcut.variables ?? {})
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 })
    }
  }
  if (!finalPrompt) return NextResponse.json({ error: 'Shortcut has no prompt' }, { status: 400 })
  if (shortcut.agentIds.length === 0) return NextResponse.json({ error: 'Shortcut has no agents' }, { status: 400 })

  const { batchId, runs } = await dispatchFanout(
    shortcut.agentIds,
    finalPrompt,
    templateId,
    shortcut.variables ?? null,
  )
  return NextResponse.json({ batchId, runs }, { status: 201 })
}
