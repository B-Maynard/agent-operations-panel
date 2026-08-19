'use client'

import Link from 'next/link'
import { usePolling } from '@/hooks/usePolling'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatTime, truncate } from '@/lib/utils'
import type { Run } from '@/lib/types'

export function RecentRunsList() {
  const { data } = usePolling<Run[]>(
    () => fetch('/api/runs?limit=10').then((r) => r.json()),
    5000,
    [],
  )
  const runs = data ?? []

  async function clear() {
    if (!confirm('Clear all recent runs?')) return
    await fetch('/api/runs', { method: 'DELETE' })
  }

  if (runs.length === 0) return <p className="text-sm text-[#8b949e]">No runs yet.</p>
  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button variant="danger" onClick={clear}>
          Clear
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-[#30363d] bg-[#161b22]">
      <table className="w-full min-w-[560px] border-collapse">
      <thead>
        <tr className="border-b border-[#30363d] text-left text-xs uppercase tracking-wider text-[#8b949e]">
          <th className="px-4 py-3">Run</th>
          <th className="px-4 py-3">Agent</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Time</th>
        </tr>
      </thead>
      <tbody>
        {runs.map((r) => (
          <tr key={r.id} className="border-b border-[#30363d] last:border-0 hover:bg-[rgba(88,166,255,0.05)]">
            <td className="px-4 py-3 font-mono text-sm">
              <Link href={`/inspector?runId=${r.id}`} className="text-[#58a6ff] hover:underline">
                {truncate(r.prompt, 40)}
              </Link>
            </td>
            <td className="px-4 py-3 font-mono text-sm">{r.agentName}</td>
            <td className="px-4 py-3">
              <Badge status={r.status} />
            </td>
            <td className="px-4 py-3 font-mono text-xs text-[#8b949e]">{formatTime(r.createdAt)}</td>
          </tr>
        ))}
      </tbody>
      </table>
      </div>
    </div>
  )
}