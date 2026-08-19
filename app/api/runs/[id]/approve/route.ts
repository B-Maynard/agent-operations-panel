import { NextResponse } from 'next/server'
import { getAgent, getRun, updateRun } from '@/lib/store'
import { approveUpstream } from '@/lib/hermes'
import { emitRun } from '@/lib/events'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const run = getRun(id)
  if (!run) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const agent = getAgent(run.agentId)
  if (!agent || !run.upstreamRunId) {
    return NextResponse.json({ error: 'No upstream run to approve' }, { status: 400 })
  }
  try {
    await approveUpstream(agent, run.upstreamRunId)
    const updated = updateRun(id, { status: 'approved' })
    emitRun(updated)
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 })
  }
}