'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { RunStatus } from '@/lib/types'

export function SteerControls({ runId, status }: { runId: string; status: RunStatus }) {
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function act(action: string, body?: unknown) {
    setBusy(action)
    setError(null)
    try {
      const res = await fetch(`/api/runs/${runId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error(b.error ?? `HTTP ${res.status}`)
      }
      if (action === 'steer') setMessage('')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const terminal = ['completed', 'failed', 'stopped', 'rejected'].includes(status)

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-[#f85149]">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button variant="danger" onClick={() => act('stop')} disabled={busy !== null || terminal}>
          {busy === 'stop' ? 'Stopping…' : 'Stop'}
        </Button>
        {status === 'awaiting_approval' && (
          <>
            <Button onClick={() => act('approve')} disabled={busy !== null}>
              Approve
            </Button>
            <Button variant="danger" onClick={() => act('reject')} disabled={busy !== null}>
              Reject
            </Button>
          </>
        )}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Steer message…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={terminal}
        />
        <Button
          variant="secondary"
          onClick={() => act('steer', { message })}
          disabled={busy !== null || !message || terminal}
        >
          Steer
        </Button>
      </div>
    </div>
  )
}