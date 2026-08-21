'use client'

import type { Run } from '@/lib/types'

export function OutputLog({ run }: { run: Run }) {
  const lines = run.outputTail ? run.outputTail.split('\n') : []
  return (
    <div className="rounded-md border border-[#30363d] bg-[#0d1117] p-3">
      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8b949e]">Output</div>
      {lines.length === 0 ? (
        run.status === 'running' ? (
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#3fb950]" />
            <p className="font-mono text-sm text-[#8b949e]">{run.lastEvent ? `${run.lastEvent}...` : 'Agent is working...'}</p>
          </div>
        ) : (
          <p className="font-mono text-sm text-[#8b949e]">No output yet.</p>
        )
      ) : (
        <pre className="max-h-96 overflow-auto font-mono text-sm text-[#e6edf3]">
          {lines.map((l, i) => (
            <div key={i} className="whitespace-pre-wrap">
              {l}
            </div>
          ))}
        </pre>
      )}
      {run.error && (
        <div className="mt-2 rounded border border-[#f85149]/40 bg-[rgba(248,81,73,0.1)] p-2 font-mono text-sm text-[#f85149]">
          {run.error}
        </div>
      )}
    </div>
  )
}