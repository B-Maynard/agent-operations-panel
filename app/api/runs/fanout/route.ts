import { NextRequest, NextResponse } from 'next/server'
import { getTemplate } from '@/lib/store'
import { dispatchFanout } from '@/lib/fanout'
import { resolveTemplate } from '@/lib/utils'
import type { FanoutBody } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  let body: FanoutBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { agentIds, prompt, templateId, variables } = body ?? {}
  if (!Array.isArray(agentIds) || agentIds.length === 0 || !prompt) {
    return NextResponse.json({ error: 'agentIds (non-empty) and prompt are required' }, { status: 400 })
  }

  let finalPrompt = prompt
  if (templateId) {
    const template = getTemplate(templateId)
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    try {
      finalPrompt = resolveTemplate(template, variables ?? {})
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 })
    }
  }

  const { batchId, runs } = await dispatchFanout(agentIds, finalPrompt, templateId ?? null, variables ?? null)
  return NextResponse.json({ batchId, runs }, { status: 201 })
}
