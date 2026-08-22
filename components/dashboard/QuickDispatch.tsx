'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAgents } from '@/hooks/useAgents'
import { useTemplates } from '@/hooks/useTemplates'
import { resolveTemplate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { TemplateVariableInputs } from '@/components/templates/TemplateVariableInputs'

export function QuickDispatch() {
  const { agents } = useAgents()
  const { templates } = useTemplates()
  const router = useRouter()
  const [agentId, setAgentId] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [prompt, setPrompt] = useState('')
  const [vars, setVars] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const template = templates.find((t) => t.id === templateId) ?? null
  const missingVars = template ? template.variables.some((v) => !vars[v]?.trim()) : false

  async function submit() {
    let finalPrompt = prompt
    if (template) {
      try {
        finalPrompt = resolveTemplate(template, vars)
      } catch (e) {
        setError((e as Error).message)
        return
      }
    }
    if (!agentId || !finalPrompt) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          prompt: finalPrompt,
          ...(template ? { templateId: template.id, variables: vars } : {}),
        }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`)
      router.push(`/inspector?runId=${body.id}`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Select value={agentId} onChange={(e) => setAgentId(e.target.value)}>
        <option value="">Select agent…</option>
        {agents.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </Select>
      <Select
        value={templateId}
        onChange={(e) => {
          setTemplateId(e.target.value)
          setVars({})
        }}
      >
        <option value="">No template</option>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </Select>
      {template ? (
        <>
          <p className="break-words rounded-md border border-[#30363d] bg-[#0d1117] p-2 font-mono text-xs text-[#8b949e]">
            {template.prompt}
          </p>
          <TemplateVariableInputs template={template} values={vars} onChange={setVars} />
        </>
      ) : (
        <Textarea
          rows={3}
          placeholder="Prompt to dispatch…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      )}
      {error && <p className="text-sm text-[#f85149]">{error}</p>}
      <Button onClick={submit} disabled={busy || !agentId || (!template && !prompt) || missingVars}>
        {busy ? 'Dispatching…' : 'Dispatch'}
      </Button>
    </div>
  )
}