'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useShortcuts } from '@/hooks/useShortcuts'
import { useAgents } from '@/hooks/useAgents'
import { useTemplates } from '@/hooks/useTemplates'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { ShortcutModal } from './ShortcutModal'
import type { Shortcut } from '@/lib/types'

export function ShortcutBar() {
  const { shortcuts, loading, refresh } = useShortcuts()
  const { agents } = useAgents()
  const { templates } = useTemplates()
  const router = useRouter()
  const [modal, setModal] = useState<{ open: boolean; shortcut: Shortcut | null }>({ open: false, shortcut: null })
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const agentName = (id: string) => agents.find((a) => a.id === id)?.name ?? id

  async function dispatch(s: Shortcut) {
    setBusyId(s.id)
    setError(null)
    try {
      const res = await fetch(`/api/shortcuts/${s.id}/run`, { method: 'POST' })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`)
      router.push(`/fanout?batchId=${body.batchId}`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">Shortcuts</div>
        <Button variant="ghost" onClick={() => setModal({ open: true, shortcut: null })}>
          + New Shortcut
        </Button>
      </div>

      {loading ? (
        <Spinner />
      ) : shortcuts.length === 0 ? (
        <p className="text-sm text-[#8b949e]">No shortcuts yet. Create one to fan out with a single click.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {shortcuts.map((s) => (
            <div key={s.id} className="flex items-center gap-1">
              <Button variant="secondary" onClick={() => dispatch(s)} disabled={busyId === s.id}>
                {s.name}
                {s.agentIds.length > 0 && (
                  <span className="ml-1 text-xs font-medium text-[#8b949e]">
                    · {s.agentIds.map(agentName).join(' · ')}
                  </span>
                )}
                {busyId === s.id && <Spinner className="ml-1" />}
              </Button>
              <button
                className="rounded-md px-1.5 py-1 text-xs font-semibold text-[#58a6ff] transition-colors hover:bg-[rgba(31,111,235,0.15)]"
                onClick={() => setModal({ open: true, shortcut: s })}
                title={`Edit ${s.name}`}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-[#f85149]">{error}</p>}

      <ShortcutModal
        open={modal.open}
        shortcut={modal.shortcut}
        agents={agents}
        templates={templates}
        onClose={() => setModal({ open: false, shortcut: null })}
        onSaved={refresh}
      />
    </div>
  )
}
