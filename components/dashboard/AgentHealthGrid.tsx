'use client'

import Link from 'next/link'
import { useAgents } from '@/hooks/useAgents'
import { usePolling } from '@/hooks/usePolling'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import type { AgentHealth } from '@/lib/types'

function HealthTile({ agentId, name }: { agentId: string; name: string }) {
  const { data } = usePolling<AgentHealth>(
    () => fetch(`/api/agents/${agentId}/health`).then((r) => r.json()),
    15000,
    [agentId],
  )
  const online = data?.online ?? false
  return (
    <Card className="p-4 transition-transform hover:-translate-y-0.5 hover:border-[#1f6feb]">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-sm font-bold">{name}</span>
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            online ? 'bg-[#3fb950] shadow-[0_0_8px_rgba(63,185,80,0.6)]' : 'bg-[#f85149]'
          }`}
        />
      </div>
      <div className="mb-3 text-xs text-[#8b949e]">
        {online ? (
          <span className="text-[#58a6ff]">● active</span>
        ) : (
          <span>○ offline</span>
        )}{' '}
        · {online ? 'online' : 'offline'}
      </div>
      <Link
        href={`/inspector?agentId=${agentId}`}
        className="block w-full rounded-md border border-[#1f6feb] py-2 text-center text-sm font-semibold text-[#58a6ff] transition-colors hover:bg-[rgba(31,111,235,0.15)]"
      >
        Open
      </Link>
    </Card>
  )
}

export function AgentHealthGrid() {
  const { agents, loading } = useAgents()
  if (loading) return <Spinner />
  if (agents.length === 0) return <p className="text-sm text-[#8b949e]">No agents registered.</p>
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {agents.map((a) => (
        <HealthTile key={a.id} agentId={a.id} name={a.name} />
      ))}
    </div>
  )
}