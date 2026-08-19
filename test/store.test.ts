import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  clearRuns,
  createAgent,
  createRun,
  createTemplate,
  deleteAgent,
  getAgent,
  listRuns,
  updateRun,
} from '@/lib/store'

let dir: string

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'ops-store-'))
  process.chdir(dir)
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

describe('store', () => {
  it('creates and reads an agent', () => {
    const agent = createAgent({
      name: 'atlas',
      baseUrl: 'http://localhost:8080',
      apiKey: 'secret',
      profile: {},
      enabled: true,
    })
    expect(getAgent(agent.id)?.name).toBe('atlas')
    expect(getAgent(agent.id)?.apiKey).toBe('secret')
  })

  it('deletes an agent', () => {
    const agent = createAgent({
      name: 'a',
      baseUrl: 'http://x',
      apiKey: 'k',
      profile: {},
      enabled: true,
    })
    expect(deleteAgent(agent.id)).toBe(true)
    expect(getAgent(agent.id)).toBeNull()
  })

  it('lists runs newest first with limit', () => {
    const a = createAgent({ name: 'a', baseUrl: 'http://x', apiKey: 'k', profile: {}, enabled: true })
    const r1 = createRun({ batchId: null, agentId: a.id, agentName: a.name, upstreamRunId: null, prompt: 'one', templateId: null, status: 'queued', startedAt: null, endedAt: null, outputTail: '', usage: null, error: null })
    const r2 = createRun({ batchId: null, agentId: a.id, agentName: a.name, upstreamRunId: null, prompt: 'two', templateId: null, status: 'queued', startedAt: null, endedAt: null, outputTail: '', usage: null, error: null })
    const runs = listRuns({ limit: 1 })
    expect(runs).toHaveLength(1)
    expect(runs[0].id).toBe(r2.id)
    expect(r1.id).not.toBe(r2.id)
  })

  it('clears runs', () => {
    const a = createAgent({ name: 'a', baseUrl: 'http://x', apiKey: 'k', profile: {}, enabled: true })
    createRun({ batchId: null, agentId: a.id, agentName: a.name, upstreamRunId: null, prompt: 'one', templateId: null, status: 'queued', startedAt: null, endedAt: null, outputTail: '', usage: null, error: null })
    createRun({ batchId: null, agentId: a.id, agentName: a.name, upstreamRunId: null, prompt: 'two', templateId: null, status: 'queued', startedAt: null, endedAt: null, outputTail: '', usage: null, error: null })
    expect(clearRuns()).toBe(2)
    expect(listRuns()).toHaveLength(0)
  })

  it('updates a run', () => {
    const a = createAgent({ name: 'a', baseUrl: 'http://x', apiKey: 'k', profile: {}, enabled: true })
    const r = createRun({ batchId: null, agentId: a.id, agentName: a.name, upstreamRunId: null, prompt: 'p', templateId: null, status: 'queued', startedAt: null, endedAt: null, outputTail: '', usage: null, error: null })
    const updated = updateRun(r.id, { status: 'completed' })
    expect(updated?.status).toBe('completed')
  })

  it('creates a template', () => {
    const t = createTemplate({ name: 'deploy', prompt: 'Deploy {{env}}', variables: ['env'] })
    expect(t.variables).toEqual(['env'])
  })
})
