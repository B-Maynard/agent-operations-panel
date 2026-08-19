'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import type { PublicAgent } from '@/lib/types'

export function AgentForm({
  open,
  agent,
  onClose,
  onSaved,
}: {
  open: boolean
  agent: PublicAgent | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(agent?.name ?? '')
      setBaseUrl(agent?.baseUrl ?? '')
      setApiKey('')
      setEnabled(agent?.enabled ?? true)
      setError(null)
    }
  }, [open, agent])

  async function submit() {
    setBusy(true)
    setError(null)
    const body: Record<string, unknown> = { name, baseUrl, enabled }
    if (apiKey) body.apiKey = apiKey // write-only; omit to keep existing
    try {
      const res = await fetch(agent ? `/api/agents/${agent.id}` : '/api/agents', {
        method: agent ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const b = await res.json()
      if (!res.ok) throw new Error(b.error ?? `HTTP ${res.status}`)
      onSaved()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} title={agent ? 'Edit Agent' : 'New Agent'} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <label className="text-xs text-[#8b949e]">
          Name
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="atlas-01" />
        </label>
        <label className="text-xs text-[#8b949e]">
          Base URL
          <Input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="http://localhost:8080"
          />
        </label>
        <label className="text-xs text-[#8b949e]">
          API Key {agent && <span className="text-[#8b949e]">(leave blank to keep)</span>}
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={agent ? '••••••••' : 'sk-…'}
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-[#8b949e]">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Enabled
        </label>
        {error && <p className="text-sm text-[#f85149]">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy || !name || !baseUrl || (!agent && !apiKey)}>
            {busy ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}