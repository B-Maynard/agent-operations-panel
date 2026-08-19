import { NextResponse } from 'next/server'
import { getAgent } from '@/lib/store'
import { checkHealth } from '@/lib/hermes'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const agent = getAgent(id)
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const health = await checkHealth(agent)
  return NextResponse.json({ agentId: id, ...health, checkedAt: new Date().toISOString() })
}