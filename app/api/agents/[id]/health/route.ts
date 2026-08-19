import { NextRequest, NextResponse } from 'next/server'
import { getAgent } from '@/lib/store'
import { checkHealth } from '@/lib/hermes'
import { requireAuth, unauthorized } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAuth(req)) return unauthorized()
  const { id } = await params
  const agent = getAgent(id)
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const health = await checkHealth(agent)
  return NextResponse.json({ agentId: id, ...health, checkedAt: new Date().toISOString() })
}