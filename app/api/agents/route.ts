import { NextRequest, NextResponse } from 'next/server'
import { createAgent, listAgents } from '@/lib/store'
import { toPublicAgent } from '@/lib/utils'
import { checkHealth } from '@/lib/hermes'
import type { Agent } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json(listAgents().map(toPublicAgent))
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const name = typeof body?.name === 'string' ? body.name : ''
  const baseUrl = typeof body?.baseUrl === 'string' ? body.baseUrl : ''
  const apiKey = typeof body?.apiKey === 'string' ? body.apiKey : ''
  const profile = body?.profile && typeof body.profile === 'object' ? (body.profile as Record<string, unknown>) : {}
  const enabled = typeof body?.enabled === 'boolean' ? body.enabled : true
  if (!name || !baseUrl || !apiKey) {
    return NextResponse.json({ error: 'name, baseUrl, and apiKey are required' }, { status: 400 })
  }

  // Validate by calling the agent's /health first (timeout 5s). Only persist after it passes.
  const candidate = { name, baseUrl, apiKey, profile, enabled } as Agent
  const health = await Promise.race([
    checkHealth(candidate),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
  ])
  if (!health?.online) {
    const error =
      !health || health.error === 'connection'
        ? `Unable to reach agent at ${baseUrl}`
        : health.error === 'auth'
          ? 'Invalid API key'
          : `Health check failed for agent at ${baseUrl}`
    return NextResponse.json({ error }, { status: 400 })
  }

  const agent = createAgent({ name, baseUrl, apiKey, profile, enabled })
  return NextResponse.json(toPublicAgent(agent), { status: 201 })
}