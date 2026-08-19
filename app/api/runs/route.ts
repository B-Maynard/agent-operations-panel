import { NextRequest, NextResponse } from 'next/server'
import { clearRuns, createRun, getAgent, getTemplate, listRuns, updateRun } from '@/lib/store'
import { dispatchRun, startTracker } from '@/lib/hermes'
import { resolveTemplate } from '@/lib/utils'
import type { DispatchBody } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const agentId = searchParams.get('agentId') ?? undefined
  const status = searchParams.get('status') ?? undefined
  const batchId = searchParams.get('batchId') ?? undefined
  const limit = Number(searchParams.get('limit') ?? 100)
  return NextResponse.json(listRuns({ agentId, status, batchId, limit }))
}

export async function DELETE() {
  clearRuns()
  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  let body: DispatchBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { agentId, prompt, templateId, variables } = body ?? {}
  if (!agentId || !prompt) {
    return NextResponse.json({ error: 'agentId and prompt are required' }, { status: 400 })
  }

  const agent = getAgent(agentId)
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  if (!agent.enabled) return NextResponse.json({ error: 'Agent is disabled' }, { status: 400 })

  let finalPrompt = prompt
  let resolvedTemplateId: string | null = null
  if (templateId) {
    const template = getTemplate(templateId)
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    try {
      finalPrompt = resolveTemplate(template, variables ?? {})
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 })
    }
    resolvedTemplateId = templateId
  }

  const run = createRun({
    batchId: null,
    agentId: agent.id,
    agentName: agent.name,
    upstreamRunId: null,
    prompt: finalPrompt,
    templateId: resolvedTemplateId,
    status: 'queued',
    startedAt: null,
    endedAt: null,
    outputTail: '',
    usage: null,
    error: null,
  })

  try {
    const { runId } = await dispatchRun(agent, finalPrompt)
    const updated = updateRun(run.id, { upstreamRunId: runId, status: 'running', startedAt: new Date().toISOString() })
    startTracker(run.id)
    return NextResponse.json(updated, { status: 201 })
  } catch (e) {
    const failed = updateRun(run.id, {
      status: 'failed',
      error: (e as Error).message,
      endedAt: new Date().toISOString(),
    })
    return NextResponse.json(failed, { status: 502 })
  }
}