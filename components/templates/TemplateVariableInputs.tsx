'use client'

import { Input } from '@/components/ui/Input'
import type { Template } from '@/lib/types'

/** Input field for each {{variable}} in a template. Values are controlled by the parent. */
export function TemplateVariableInputs({
  template,
  values,
  onChange,
}: {
  template: Template
  values: Record<string, string>
  onChange: (values: Record<string, string>) => void
}) {
  if (template.variables.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      {template.variables.map((v) => (
        <label key={v} className="text-xs text-[#8b949e]">
          {`{{${v}}}`}
          <Input
            value={values[v] ?? ''}
            onChange={(e) => onChange({ ...values, [v]: e.target.value })}
            placeholder={v}
          />
        </label>
      ))}
    </div>
  )
}