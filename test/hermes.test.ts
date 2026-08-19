import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createServer, Server } from 'node:http'
import { FakeHermes } from './fake-hermes'
import { checkHealth, dispatchRun, getUpstreamRun, stopUpstream, approveUpstream, rejectUpstream, steerUpstream } from '@/lib/hermes'
import type { Agent } from '@/lib/types'

let server: Server
let url: string
let fake: FakeHermes

beforeAll(async () => {
  fake = new FakeHermes('http://unused')
  server = createServer((req, res) => {
    const body: Buffer[] = []
    req.on('data', (c) => body.push(c))
    req.on('end', async () => {
      const headers = { ...req.headers, 'content-type': 'application/json' }
      const r = new Request(`http://localhost${req.url}`, {
        method: req.method,
        headers,
        body: body.length ? Buffer.concat(body).toString() : undefined,
      })
      const resp = await fake.handle(r)
      res.writeHead(resp.status, Object.fromEntries(resp.headers))
      res.end(await resp.text())
    })
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const addr = server.address() as { port: number }
  url = `http://127.0.0.1:${addr.port}`
})

afterAll(() => server.close())

function makeAgent(): Agent {
  return {
    id: 'a1',
    name: 'atlas',
    baseUrl: url,
    apiKey: 'secret',
    profile: {},
    enabled: true,
    createdAt: '',
    updatedAt: '',
  }
}

describe('hermes client', () => {
  it('checks health', async () => {
    const h = await checkHealth(makeAgent())
    expect(h.online).toBe(true)
    expect(h.status).toBe('ok')
  })

  it('dispatches a run and reads it back', async () => {
    const { runId } = await dispatchRun(makeAgent(), 'hello')
    const up = await getUpstreamRun(makeAgent(), runId)
    expect(up.status).toBe('started')
    expect(up.output).toBe('hello')
  })

  it('stops a run', async () => {
    const { runId } = await dispatchRun(makeAgent(), 'x')
    await stopUpstream(makeAgent(), runId)
    expect(fake.runs.get(runId)?.status).toBe('cancelled')
  })

  it('approves and rejects', async () => {
    const a = await dispatchRun(makeAgent(), 'x')
    await approveUpstream(makeAgent(), a.runId)
    expect(fake.runs.get(a.runId)?.status).toBe('running')

    const r = await dispatchRun(makeAgent(), 'y')
    await rejectUpstream(makeAgent(), r.runId)
    expect(fake.runs.get(r.runId)?.status).toBe('cancelled')
  })

  it('steers', async () => {
    const { runId } = await dispatchRun(makeAgent(), 'x')
    await expect(steerUpstream(makeAgent(), runId, 'go faster')).resolves.toBeUndefined()
  })

  it('distinguishes auth failure from connection failure on health check', async () => {
    const authServer = createServer((_req, res) => {
      res.writeHead(401, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: 'unauthorized' }))
    })
    await new Promise<void>((resolve) => authServer.listen(0, '127.0.0.1', resolve))
    const authAddr = authServer.address() as { port: number }
    const authAgent = { ...makeAgent(), baseUrl: `http://127.0.0.1:${authAddr.port}` }
    const authHealth = await checkHealth(authAgent)
    expect(authHealth.online).toBe(false)
    expect(authHealth.error).toBe('auth')
    authServer.close()

    const connAgent = { ...makeAgent(), baseUrl: 'http://127.0.0.1:1' } // unroutable port
    const connHealth = await checkHealth(connAgent)
    expect(connHealth.online).toBe(false)
    expect(connHealth.error).toBe('connection')
  })
})
