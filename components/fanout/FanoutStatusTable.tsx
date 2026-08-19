'use client'

import { useSearchParams } from 'next/navigation'
import { usePolling } from '@/hooks/usePolling'
import { Badge } from '@/components/ui/Badge'
import { formatTime } from '@/lib/utils'
import type { Run } from '@/lib/types'

export function FanoutStatusTable() {
  const searchParams = useSearchParams()
  const batchId = searchParams.get('batchId')
  const { data } = usePolling<Run[]>(
    () => fetch(`/api/runs?batchId=${batchId}`).then((r) => r.json()),
    3000,
    [batchId],
  )
  const runs = data ?? []

  if (!batchId) {
    return <p className="text-sm text-[#8b949e]">Build a fan-out to see its status matrix.</p>
  }
  if (runs.length === 0) {
    return <p className="text-sm text-[#8b949e]">No runs in this batch yet.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#30363d] bg-[#161b22]">
      <table className="w-full min-w-[560px] border-collapse">
      <thead>
        <tr className="border-b border-[#30363d] text-left text-xs uppercase tracking-wider text-[#8b949e]">
          <th className="px-4 py-3">Agent</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Started</th>
          <th className="px-4 py-3">Ended</th>
        </tr>
      </thead>
      <tbody>
        {runs.map((r) => (
          <tr key={r.id} className="border-b border-[#30363d] last:border-0 hover:bg-[rgba(88,166,255,0.05)]">
            <td className="px-4 py-3 font-mono text-sm">{r.agentName}</td>
            <td className="px-4 py-3">
              <Badge status={r.status} />
            </td>
            <td className="px-4 py-3 font-mono text-xs text-[#8b949e]">{formatTime(r.startedAt)}</td>
            <td className="px-4 py-3 font-mono text-xs text-[#8b949e]">{formatTime(r.endedAt)}</td>
          </tr>
        ))}
      </tbody>
      </table>
    </div>
  )
}