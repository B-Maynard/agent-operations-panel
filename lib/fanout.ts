import { createRun, getAgent, updateRun } from './store'
import { dispatchRun, startTracker } from './hermes'
import type { Run } from './types'

export async function dispatchFanout(
  agentIds: string[],
  prompt: string,
  templateId: string | null,
): Promise<{ batchId: string; runs: Run[] }> {
  const uniqueIds = [...new Set(agentIds)]
  const batchId = `batch_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

  const results = await Promise.allSettled(
    uniqueIds.map(async (agentId) => {
      const agent = getAgent(agentId)
      if (!agent) throw new Error('Agent not found')
      if (!agent.enabled) throw new Error('Agent is disabled')
      const run = createRun({
        batchId,
        agentId: agent.id,
        agentName: agent.name,
        upstreamRunId: null,
        prompt,
        templateId,
        status: 'queued',
        startedAt: null,
        endedAt: null,
        outputTail: '',
        usage: null,
        error: null,
      })
      try {
        const { runId } = await dispatchRun(agent, prompt)
        const updated = updateRun(run.id, {
          upstreamRunId: runId,
          status: 'running',
          startedAt: new Date().toISOString(),
        })
        startTracker(run.id)
        return updated
      } catch (e) {
        return updateRun(run.id, {
          status: 'failed',
          error: (e as Error).message,
          endedAt: new Date().toISOString(),
        })
      }
    }),
  )

  const runs = results.map((r) => (r.status === 'fulfilled' ? r.value : null)).filter(Boolean) as Run[]
  return { batchId, runs }
}
