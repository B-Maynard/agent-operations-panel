'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAgents } from '@/hooks/useAgents'
import { resolveTemplate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { TemplateVariableInputs } from './TemplateVariableInputs'
import type { Template } from '@/lib/types'

export function TestDispatchModal({
  template,
  onClose,
}: {
  template: Template | null
  onClose: () => void
}) {
  const { agents } = useAgents()
  const router = useRouter()
  const [agentId, setAgentId] = useState('')
  const [vars, setVars] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!template || !agentId) return
    let prompt: string
    try {
      prompt = resolveTemplate(template, vars)
    } catch (e) {
      setError((e as Error).message)
      return
    }
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, prompt }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`)
      onClose()
      router.push(`/inspector?runId=${body.id}`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const missingVars = template ? template.variables.some((v) => !vars[v]?.trim()) : true

  return (
    <Modal open={template !== null} title="Test Dispatch" onClose={onClose}>
      {template && (
        <div className="flex flex-col gap-3">
          <div className="text-xs text-[#8b949e]">
            Template: <span className="font-mono text-[#58a6ff]">{template.name}</span>
          </div>
          <p className="break-words rounded-md border border-[#30363d] bg-[#0d1117] p-2 font-mono text-xs text-[#8b949e]">
            {template.prompt}
          </p>
          <Select value={agentId} onChange={(e) => setAgentId(e.target.value)}>
            <option value="">Select agent…</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
          <TemplateVariableInputs template={template} values={vars} onChange={setVars} />
          {error && <p className="text-sm text-[#f85149]">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={busy || !agentId || missingVars}>
              {busy ? 'Dispatching…' : 'Dispatch'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}