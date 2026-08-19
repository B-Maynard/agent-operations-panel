'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { TemplateVariableInputs } from '@/components/templates/TemplateVariableInputs'
import type { PublicAgent, Shortcut, Template } from '@/lib/types'

export function ShortcutModal({
  open,
  shortcut,
  agents,
  templates,
  onClose,
  onSaved,
}: {
  open: boolean
  shortcut: Shortcut | null
  agents: PublicAgent[]
  templates: Template[]
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(shortcut?.name ?? '')
  const [agentIds, setAgentIds] = useState<string[]>(shortcut?.agentIds ?? [])
  const [templateId, setTemplateId] = useState(shortcut?.templateId ?? '')
  const [prompt, setPrompt] = useState(shortcut?.prompt ?? '')
  const [vars, setVars] = useState<Record<string, string>>(shortcut?.variables ?? {})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const template = templates.find((t) => t.id === templateId) ?? null
  const missingVars = template ? template.variables.some((v) => !vars[v]?.trim()) : false

  function toggleAgent(id: string) {
    setAgentIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  async function save() {
    if (!name || agentIds.length === 0 || (!template && !prompt) || missingVars) return
    setBusy(true)
    setError(null)
    const body = {
      name,
      agentIds,
      templateId: template ? template.id : null,
      prompt: template ? undefined : prompt,
      variables: template ? vars : undefined,
    }
    try {
      const res = await fetch(shortcut ? `/api/shortcuts/${shortcut.id}` : '/api/shortcuts', {
        method: shortcut ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      onSaved()
      onClose()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!shortcut) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/shortcuts/${shortcut.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      onSaved()
      onClose()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} title={shortcut ? 'Edit Shortcut' : 'New Shortcut'} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <label className="text-xs text-[#8b949e]">
          Name
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Shortcut name" />
        </label>

        <div className="text-xs text-[#8b949e]">Agents</div>
        <div className="flex flex-wrap gap-2">
          {agents.map((a) => {
            const on = agentIds.includes(a.id)
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleAgent(a.id)}
                className={`min-h-9 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  on
                    ? 'border-[#58a6ff] bg-[rgba(88,166,255,0.15)] text-[#58a6ff]'
                    : 'border-[#30363d] text-[#8b949e] hover:border-[#58a6ff]'
                }`}
              >
                {a.name}
              </button>
            )
          })}
        </div>

        <label className="text-xs text-[#8b949e]">
          Template
          <Select
            value={templateId}
            onChange={(e) => {
              setTemplateId(e.target.value)
              setVars({})
            }}
          >
            <option value="">Raw prompt</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </label>

        {template ? (
          <>
            <p className="break-words rounded-md border border-[#30363d] bg-[#0d1117] p-2 font-mono text-xs text-[#8b949e]">
              {template.prompt}
            </p>
            <TemplateVariableInputs template={template} values={vars} onChange={setVars} />
          </>
        ) : (
          <label className="text-xs text-[#8b949e]">
            Prompt
            <Textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Prompt to fan out…"
            />
          </label>
        )}

        {error && <p className="text-sm text-[#f85149]">{error}</p>}

        <div className="flex items-center justify-between gap-2">
          {shortcut ? (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <Button variant="danger" onClick={remove} disabled={busy}>
                  Confirm delete
                </Button>
                <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                Delete
              </Button>
            )
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={save} disabled={busy || !name || agentIds.length === 0 || (!template && !prompt) || missingVars}>
              {busy ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
