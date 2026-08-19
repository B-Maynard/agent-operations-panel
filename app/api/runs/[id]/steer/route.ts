import { NextRequest, NextResponse } from 'next/server'
import { getAgent, getRun } from '@/lib/store'
import { steerUpstream } from '@/lib/hermes'
import { requireAuth, unauthorized } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAuth(req)) return unauthorized()
  const { id } = await params
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const message = typeof body?.message === 'string' ? body.message : ''
  if (!message) return NextResponse.json({ error: 'message is required' }, { status: 400 })

  const run = getRun(id)
  if (!run) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const agent = getAgent(run.agentId)
  if (!agent || !run.upstreamRunId) {
    return NextResponse.json({ error: 'No upstream run to steer' }, { status: 400 })
  }
  try {
    await steerUpstream(agent, run.upstreamRunId, message)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 })
  }
}