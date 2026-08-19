import type { Agent, PublicAgent, Template } from './types'

export function toPublicAgent(agent: Agent): PublicAgent {
  const pub: PublicAgent = { ...agent }
  delete (pub as Partial<Agent>).apiKey
  return pub
}

export function id(prefix = 'id'): string {
  return `${prefix}_${crypto.randomUUID()}`
}

export function now(): string {
  return new Date().toISOString()
}

/** Resolve a template's prompt, substituting {{variables}}. Throws on missing vars. */
export function resolveTemplate(
  template: Template,
  variables: Record<string, string> = {},
): string {
  let prompt = template.prompt
  for (const v of template.variables) {
    const value = variables[v]
    if (value === undefined) {
      throw new Error(`Missing variable: {{${v}}}`)
    }
    prompt = prompt.split(`{{${v}}}`).join(value)
  }
  return prompt
}

/** Extract {{variable}} names from a prompt string. */
export function detectVariables(prompt: string): string[] {
  const names = new Set<string>()
  const re = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(prompt)) !== null) {
    names.add(m[1])
  }
  return [...names]
}

export function isTerminal(status: string): boolean {
  return ['completed', 'failed', 'stopped', 'rejected'].includes(status)
}

export function formatTime(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  if (diff < 0) return 'now'
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return d.toLocaleDateString()
}

export function truncate(s: string, n = 80): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}