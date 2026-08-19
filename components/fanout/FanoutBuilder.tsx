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

export function FanoutBuilder() {
  const { agents } = useAgents()
  const { templates } = useTemplates()
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])
  const [templateId, setTemplateId] = useState('')
  const [prompt, setPrompt] = useState('')
  const [vars, setVars] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const template = templates.find((t) => t.id === templateId) ?? null
  const missingVars = template ? template.variables.some((v) => !vars[v]?.trim()) : false

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

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
    if (selected.length === 0 || !finalPrompt) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/runs/fanout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentIds: selected, prompt: finalPrompt }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`)
      router.push(`/fanout?batchId=${body.batchId}`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {agents.map((a) => {
          const on = selected.includes(a.id)
          return (
            <button
              key={a.id}
              onClick={() => toggle(a.id)}
              className={`min-h-11 rounded-md border px-3 py-2 text-sm transition-colors ${
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
          rows={4}
          placeholder="Prompt to fan out…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      )}
      {error && <p className="text-sm text-[#f85149]">{error}</p>}
      <div className="flex items-center gap-3">
        <Button
          onClick={submit}
          disabled={busy || selected.length === 0 || (!template && !prompt) || missingVars}
        >
          {busy ? 'Fanning out…' : `Fan out to ${selected.length} agent${selected.length === 1 ? '' : 's'}`}
        </Button>
      </div>
    </div>
  )
}