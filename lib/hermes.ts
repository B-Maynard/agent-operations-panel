import type { Agent, Run } from './types'
import { getAgent, getRun, updateRun } from './store'
import { emitRun } from './events'
import { isTerminal } from './utils'

const POLL_INTERVAL_MS = 2000
const MAX_TRACK_MS = 30 * 60 * 1000

async function upstreamFetch(
  agent: Agent,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = agent.baseUrl.replace(/\/+$/, '') + path
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${agent.apiKey}`,
      ...(init.headers ?? {}),
    },
  })
}

async function upstreamJson(
  agent: Agent,
  path: string,
  init: RequestInit = {},
): Promise<Record<string, unknown>> {
  const res = await upstreamFetch(agent, path, init)
  if (!res.ok) {
    await res.text().catch(() => '') // drain body; never relay upstream body to client
    throw new Error(`Upstream ${res.status} ${path}`)
  }
  return res.json().catch(() => ({}))
}

export async function checkHealth(agent: Agent): Promise<{
  online: boolean
  status: string | null
  detailed: Record<string, unknown> | null
  error?: 'connection' | 'auth' | 'other'
}> {
  let res: Response
  try {
    res = await upstreamFetch(agent, '/health')
  } catch {
    return { online: false, status: null, detailed: null, error: 'connection' }
  }
  if (res.status === 401 || res.status === 403) {
    return { online: false, status: null, detailed: null, error: 'auth' }
  }
  if (!res.ok) {
    return { online: false, status: null, detailed: null, error: 'other' }
  }
  const status = await res.json().catch(() => ({}))
  let detailed: Record<string, unknown> | null = null
  try {
    detailed = await upstreamJson(agent, '/health/detailed')
  } catch {
    detailed = null
  }
  return { online: true, status: typeof status?.status === 'string' ? status.status : 'ok', detailed }
}

export async function dispatchRun(
  agent: Agent,
  prompt: string,
  sessionId?: string,
): Promise<{ runId: string }> {
  const body: Record<string, unknown> = { input: prompt }
  if (sessionId) body.session_id = sessionId
  const res = await upstreamJson(agent, '/v1/runs', { method: 'POST', body: JSON.stringify(body) })
  return { runId: String(res.run_id) }
}

export async function getUpstreamRun(
  agent: Agent,
  upstreamRunId: string,
): Promise<Record<string, unknown>> {
  return upstreamJson(agent, `/v1/runs/${upstreamRunId}`)
}

export async function stopUpstream(agent: Agent, upstreamRunId: string): Promise<void> {
  await upstreamJson(agent, `/v1/runs/${upstreamRunId}/stop`, { method: 'POST' })
}

export async function approveUpstream(agent: Agent, upstreamRunId: string): Promise<void> {
  await upstreamJson(agent, `/v1/runs/${upstreamRunId}/approval`, {
    method: 'POST',
    body: JSON.stringify({ decision: 'approve' }),
  })
}

export async function rejectUpstream(agent: Agent, upstreamRunId: string): Promise<void> {
  await upstreamJson(agent, `/v1/runs/${upstreamRunId}/approval`, {
    method: 'POST',
    body: JSON.stringify({ decision: 'reject' }),
  })
}

export async function steerUpstream(
  agent: Agent,
  upstreamRunId: string,
  message: string,
): Promise<void> {
  await upstreamJson(agent, `/v1/runs/${upstreamRunId}/steer`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

export async function proxyDiscovery(agent: Agent, path: string): Promise<{
  status: number
  body: unknown
}> {
  const res = await upstreamFetch(agent, path)
  const body = await res.json().catch(() => ({}))
  return { status: res.status, body }
}

// ---- Background tracker ----

const trackers = new Map<string, NodeJS.Timeout>()
const consecutiveFailures = new Map<string, number>()

function mapUpstreamStatus(status: string): Run['status'] {
  switch (status) {
    case 'started':
    case 'running':
      return 'running'
    case 'approval-paused':
    case 'queued':
      return 'awaiting_approval'
    case 'completed':
      return 'completed'
    case 'failed':
      return 'failed'
    case 'cancelled':
    case 'stopped':
      return 'stopped'
    default:
      return 'running'
  }
}

export function startTracker(runId: string): void {
  if (trackers.has(runId)) return
  const started = Date.now()

  const tick = async () => {
    const run = getRun(runId)
    if (!run) return stopTracker(runId)
    if (isTerminal(run.status)) {
      emitRun(run)
      return stopTracker(runId)
    }
    if (Date.now() - started > MAX_TRACK_MS) {
      updateRun(runId, { status: 'failed', error: 'Timed out after 30 minutes', endedAt: new Date().toISOString() })
      emitRun(getRun(runId))
      return stopTracker(runId)
    }

    const agent = getAgent(run.agentId)
    if (!agent || !run.upstreamRunId) {
      const error = !agent
        ? `Agent '${run.agentId}' not found`
        : 'No upstream run ID — dispatch may have failed'
      const updated = updateRun(runId, { status: 'failed', error, endedAt: new Date().toISOString() })
      if (updated) emitRun(updated)
      consecutiveFailures.delete(runId)
      return stopTracker(runId)
    }

    try {
      const up = await getUpstreamRun(agent, run.upstreamRunId)
      const upStatus = typeof up?.status === 'string' ? up.status : run.status
      const upOutput = typeof up?.output === 'string' ? up.output : undefined
      const upOutputTail = typeof up?.output_tail === 'string' ? up.output_tail : undefined
      const upUsage = up?.usage && typeof up.usage === 'object' ? (up.usage as Record<string, unknown>) : undefined
      const upError = typeof up?.error === 'string' ? up.error : undefined
      const upLastEvent = typeof up?.last_event === 'string' ? up.last_event : undefined
      const patch: Partial<Run> = {
        status: mapUpstreamStatus(upStatus),
        outputTail: upOutput ?? upOutputTail ?? run.outputTail,
        usage: upUsage ?? run.usage,
        lastEvent: upLastEvent ?? run.lastEvent,
      }
      if (isTerminal(patch.status as string)) {
        patch.endedAt = new Date().toISOString()
        if (patch.status === 'failed') patch.error = upError ?? run.error
      }
      const updated = updateRun(runId, patch)
      if (updated) {
        emitRun(updated)
        if (isTerminal(updated.status)) {
          consecutiveFailures.delete(runId)
          return stopTracker(runId)
        }
      }
      consecutiveFailures.delete(runId)
    } catch {
      const count = (consecutiveFailures.get(runId) ?? 0) + 1
      consecutiveFailures.set(runId, count)
      // ponytail: 15 failures ≈ 30s, enough for slow agent reboots
      if (count >= 15) {
        const updated = updateRun(runId, {
          status: 'failed',
          error: 'Upstream unreachable after repeated failures',
          endedAt: new Date().toISOString(),
        })
        if (updated) emitRun(updated)
        consecutiveFailures.delete(runId)
        stopTracker(runId)
      }
      return
    }
  }

  const timer = setInterval(tick, POLL_INTERVAL_MS)
  trackers.set(runId, timer)
  tick()
}

export function stopTracker(runId: string): void {
  const timer = trackers.get(runId)
  if (timer) {
    clearInterval(timer)
    trackers.delete(runId)
  }
  consecutiveFailures.delete(runId)
}