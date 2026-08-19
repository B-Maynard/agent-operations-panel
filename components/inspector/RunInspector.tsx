'use client'

import { useSearchParams } from 'next/navigation'
import { useRunStream } from '@/hooks/useRunStream'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { OutputLog } from './OutputLog'
import { SteerControls } from './SteerControls'

export function RunInspector() {
  const searchParams = useSearchParams()
  const runId = searchParams.get('runId')
  const { run, connected, error } = useRunStream(runId)

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
      <div className="rounded-md border border-[#30363d] bg-[#0d1117] p-3 font-mono text-sm text-[#e6edf3]">
        {run.prompt}
      </div>
      <OutputLog run={run} />
      <SteerControls runId={run.id} status={run.status} />
    </div>
  )
}