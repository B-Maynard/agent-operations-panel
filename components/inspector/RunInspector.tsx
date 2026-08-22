'use client'

import { useSearchParams } from 'next/navigation'
import { useRunStream } from '@/hooks/useRunStream'
import { useTemplates } from '@/hooks/useTemplates'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { OutputLog } from './OutputLog'
import { SteerControls } from './SteerControls'

export function RunInspector() {
  const searchParams = useSearchParams()
  const runId = searchParams.get('runId')
  const { run, connected, error } = useRunStream(runId)
  const { templates } = useTemplates()
  const template = run?.templateId ? templates.find((t) => t.id === run.templateId) ?? null : null

  if (!runId) {
    return <p className="text-sm text-[#8b949e]">Select a run to inspect (add ?runId=…).</p>
  }
  if (!run) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#8b949e]">
        <Spinner /> Connecting to run stream…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h2 className="font-mono text-lg font-bold">{run.agentName}</h2>
          <Badge status={run.status} />
        </div>
        <span className="text-xs text-[#8b949e]">
          {connected ? '● live' : '○ disconnected'}
        </span>
      </div>
      {error && <p className="text-sm text-[#f85149]">{error}</p>}
      {run.templateId ? (
        <div className="rounded-md border border-[#30363d] bg-[#0d1117] p-3 font-mono text-sm text-[#e6edf3]">
          <div className="mb-2 text-xs text-[#8b949e]">
            Template: <span className="font-mono text-[#58a6ff]">{template?.name ?? run.templateId}</span>
          </div>
          {run.variables && Object.keys(run.variables).length > 0 ? (
            <div className="flex flex-col gap-1">
              {Object.entries(run.variables).map(([k, v]) => (
                <div key={k} className="text-xs">
                  <span className="text-[#8b949e]">{k}: </span>
                  <span className="text-[#e6edf3]">{String(v)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-[#8b949e]">No variables</div>
          )}
        </div>
      ) : (
        <div className="rounded-md border border-[#30363d] bg-[#0d1117] p-3 font-mono text-sm text-[#e6edf3]">
          {run.prompt}
        </div>
      )}
      <OutputLog run={run} />
      <SteerControls runId={run.id} status={run.status} />
    </div>
  )
}