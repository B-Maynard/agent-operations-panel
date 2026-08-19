'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { detectVariables } from '@/lib/utils'
import type { Template } from '@/lib/types'

export function TemplateForm({
  open,
  template,
  onClose,
  onSaved,
}: {
  open: boolean
  template: Template | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const variables = detectVariables(prompt)

  useEffect(() => {
    if (open) {
      setName(template?.name ?? '')
      setPrompt(template?.prompt ?? '')
      setError(null)
    }
  }, [open, template])

  async function submit() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(template ? `/api/templates/${template.id}` : '/api/templates', {
        method: template ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, prompt }),
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
    <Modal open={open} title={template ? 'Edit Template' : 'New Template'} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <label className="text-xs text-[#8b949e]">
          Name
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="deploy" />
        </label>
        <label className="text-xs text-[#8b949e]">
          Prompt
          <Textarea
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Deploy {{env}} to {{region}}"
          />
        </label>
        <div className="text-xs text-[#8b949e]">
          Variables:{' '}
          {variables.length ? (
            <span className="font-mono text-[#58a6ff]">{variables.join(', ')}</span>
          ) : (
            'none detected'
          )}
        </div>
        {error && <p className="text-sm text-[#f85149]">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy || !name || !prompt}>
            {busy ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}