'use client'

import { useState } from 'react'
import { useTemplates } from '@/hooks/useTemplates'
import { Button } from '@/components/ui/Button'
import { TemplateForm } from './TemplateForm'
import { TestDispatchModal } from './TestDispatchModal'
import type { Template } from '@/lib/types'

export function TemplateList() {
  const { templates, refresh } = useTemplates()
  const [editing, setEditing] = useState<Template | null>(null)
  const [creating, setCreating] = useState(false)
  const [testing, setTesting] = useState<Template | null>(null)

  async function remove(id: string) {
    if (!confirm('Delete this template?')) return
    await fetch(`/api/templates/${id}`, { method: 'DELETE' })
    refresh()
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreating(true)}>+ Template</Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-[#30363d] bg-[#161b22]">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-[#30363d] text-left text-xs uppercase tracking-wider text-[#8b949e]">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Prompt</th>
              <th className="px-4 py-3">Variables</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id} className="border-b border-[#30363d] last:border-0 hover:bg-[rgba(88,166,255,0.05)]">
                <td className="px-4 py-3 font-mono text-sm">{t.name}</td>
                <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-[#8b949e]">
                  {t.prompt}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[#58a6ff]">
                  {t.variables.length ? t.variables.join(', ') : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => setTesting(t)}>
                      Test Dispatch
                    </Button>
                    <Button variant="secondary" onClick={() => setEditing(t)}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => remove(t.id)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TemplateForm
        open={creating || editing !== null}
        template={editing}
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
      <TestDispatchModal template={testing} onClose={() => setTesting(null)} />
    </div>
  )
}