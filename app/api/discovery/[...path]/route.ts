import { NextRequest, NextResponse } from 'next/server'
import { getAgent } from '@/lib/store'
import { proxyDiscovery } from '@/lib/hermes'
import { requireAuth, unauthorized } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  if (!requireAuth(req)) return unauthorized()
  const { path } = await params
  const agentId = path[0]
  const upstreamPath = '/' + path.slice(1).join('/')
  const agent = getAgent(agentId)
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  try {
    const { status, body } = await proxyDiscovery(agent, upstreamPath)
    return NextResponse.json(body, { status })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 })
  }
}