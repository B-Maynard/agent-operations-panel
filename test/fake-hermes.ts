import { EventEmitter } from 'node:events'

/**
 * In-memory fake of the upstream Hermes agent API for tests.
 * Records dispatched runs and lets tests advance their status.
 */
export class FakeHermes {
  runs = new Map<string, { status: string; output?: string; usage?: Record<string, unknown> }>()
  events = new EventEmitter()
  healthOk = true
  healthDetailed: Record<string, unknown> = { ready: true }

  constructor(private baseUrl: string) {}

  async handle(req: Request): Promise<Response> {
    const url = new URL(req.url)
    const path = url.pathname

    if (path === '/health') {
      return this.healthOk
        ? Response.json({ status: 'ok' })
        : new Response('down', { status: 503 })
    }
    if (path === '/health/detailed') {
      return Response.json(this.healthDetailed)
    }

    if (path === '/v1/runs' && req.method === 'POST') {
      const body = await req.json()
      const runId = `up_${this.runs.size + 1}`
      this.runs.set(runId, { status: 'started', output: body.input })
      return Response.json({ run_id: runId, status: 'started' })
    }

    const m = path.match(/^\/v1\/runs\/([^/]+)$/)
    if (m && req.method === 'GET') {
      const run = this.runs.get(m[1])
      if (!run) return new Response('not found', { status: 404 })
      return Response.json({ run_id: m[1], status: run.status, output: run.output, usage: run.usage })
    }

    const stop = path.match(/^\/v1\/runs\/([^/]+)\/stop$/)
    if (stop && req.method === 'POST') {
      const run = this.runs.get(stop[1])
      if (run) run.status = 'cancelled'
      return Response.json({ status: 'stopping' })
    }

    const approval = path.match(/^\/v1\/runs\/([^/]+)\/approval$/)
    if (approval && req.method === 'POST') {
      const body = await req.json()
      const run = this.runs.get(approval[1])
      if (run) run.status = body.decision === 'approve' ? 'running' : 'cancelled'
      return Response.json({ decision: body.decision })
    }

    const steer = path.match(/^\/v1\/runs\/([^/]+)\/steer$/)
    if (steer && req.method === 'POST') {
      return Response.json({ ok: true })
    }

    return new Response('not found', { status: 404 })
  }

  setStatus(runId: string, status: string): void {
    const run = this.runs.get(runId)
    if (run) run.status = status
  }
}
