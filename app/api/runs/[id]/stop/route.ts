import { NextRequest, NextResponse } from 'next/server'
import { getAgent, getRun, updateRun } from '@/lib/store'
import { stopUpstream } from '@/lib/hermes'
import { emitRun } from '@/lib/events'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const run = getRun(id)
  if (!run) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const agent = getAgent(run.agentId)
  if (!agent || !run.upstreamRunId) {
    return NextResponse.json({ error: 'No upstream run to stop' }, { status: 400 })
  }
  try {
    await stopUpstream(agent, run.upstreamRunId)
    const updated = updateRun(id, { status: 'stopped', endedAt: new Date().toISOString() })
    emitRun(updated)
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 })
  }
}