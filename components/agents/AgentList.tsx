'use client'

import { useState } from 'react'
import { useAgents } from '@/hooks/useAgents'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AgentForm } from './AgentForm'
import type { PublicAgent } from '@/lib/types'

export function AgentList() {
  const { agents, refresh } = useAgents()
  const [editing, setEditing] = useState<PublicAgent | null>(null)
  const [creating, setCreating] = useState(false)

  async function remove(id: string) {
    if (!confirm('Delete this agent?')) return
    await fetch(`/api/agents/${id}`, { method: 'DELETE' })
    refresh()
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreating(true)}>+ Agent</Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-[#30363d] bg-[#161b22]">
        <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className="border-b border-[#30363d] text-left text-xs uppercase tracking-wider text-[#8b949e]">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">URL</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((a) => (
            <tr key={a.id} className="border-b border-[#30363d] last:border-0 hover:bg-[rgba(88,166,255,0.05)]">
              <td className="px-4 py-3 font-mono text-sm">{a.name}</td>
              <td className="px-4 py-3">
                <Badge status={a.enabled ? 'running' : 'stopped'} />
              </td>
              <td className="px-4 py-3 font-mono text-xs text-[#8b949e]">{a.baseUrl}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setEditing(a)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => remove(a.id)}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>

      <AgentForm
        open={creating || editing !== null}
        agent={editing}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        onSaved={() => {
          setCreating(false)
          setEditing(null)
          refresh()
        }}
      />
    </div>
  )
}