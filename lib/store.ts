import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Agent, Run, Shortcut, Template } from './types'
import { id, now } from './utils'

// ponytail: data dir resolved per-call so tests can chdir to a temp dir
function dataDir(): string {
  return join(process.cwd(), 'data')
}

function file(name: string): string {
  return join(dataDir(), name)
}

function ensureDir(): void {
  if (!existsSync(dataDir())) mkdirSync(dataDir(), { recursive: true })
}

function read<T>(name: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(file(name), 'utf8')) as T
  } catch {
    return fallback
  }
}

function write(name: string, data: unknown): void {
  ensureDir()
  writeFileSync(file(name), JSON.stringify(data, null, 2))
}

// ---- Agents ----

export function listAgents(): Agent[] {
  return read<Agent[]>('agents.json', [])
}

export function getAgent(id: string): Agent | null {
  return listAgents().find((a) => a.id === id) ?? null
}

export function createAgent(input: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Agent {
  const agent: Agent = {
    ...input,
    id: id('agent'),
    createdAt: now(),
    updatedAt: now(),
  }
  const agents = listAgents()
  agents.push(agent)
  write('agents.json', agents)
  return agent
}

export function updateAgent(id: string, patch: Partial<Agent>): Agent | null {
  const agents = listAgents()
  const idx = agents.findIndex((a) => a.id === id)
  if (idx === -1) return null
  agents[idx] = { ...agents[idx], ...patch, id, updatedAt: now() }
  write('agents.json', agents)
  return agents[idx]
}

export function deleteAgent(id: string): boolean {
  const agents = listAgents()
  const next = agents.filter((a) => a.id !== id)
  if (next.length === agents.length) return false
  write('agents.json', next)
  return true
}

// ---- Runs ----

export function listRuns(opts: {
  agentId?: string
  status?: string
  batchId?: string
  limit?: number
} = {}): Run[] {
  let runs = read<Run[]>('runs.json', [])
  if (opts.agentId) runs = runs.filter((r) => r.agentId === opts.agentId)
  if (opts.status) runs = runs.filter((r) => r.status === opts.status)
  if (opts.batchId) runs = runs.filter((r) => r.batchId === opts.batchId)
  runs = [...runs].sort((a, b) => {
    const byTime = (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
    if (byTime !== 0) return byTime
    return b.id.localeCompare(a.id)
  })
  if (opts.limit && opts.limit > 0) runs = runs.slice(0, opts.limit)
  return runs
}

export function getRun(id: string): Run | null {
  return read<Run[]>('runs.json', []).find((r) => r.id === id) ?? null
}

export function createRun(input: Omit<Run, 'id' | 'createdAt'>): Run {
  const run: Run = {
    ...input,
    id: id('run'),
    createdAt: now(),
  }
  const runs = read<Run[]>('runs.json', [])
  runs.push(run)
  write('runs.json', runs)
  return run
}

export function updateRun(id: string, patch: Partial<Run>): Run | null {
  const runs = read<Run[]>('runs.json', [])
  const idx = runs.findIndex((r) => r.id === id)
  if (idx === -1) return null
  runs[idx] = { ...runs[idx], ...patch, id }
  write('runs.json', runs)
  return runs[idx]
}

export function clearRuns(): number {
  const runs = read<Run[]>('runs.json', [])
  write('runs.json', [])
  return runs.length
}

// ---- Templates ----

export function listTemplates(): Template[] {
  return read<Template[]>('templates.json', [])
}

export function getTemplate(id: string): Template | null {
  return listTemplates().find((t) => t.id === id) ?? null
}

export function createTemplate(input: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Template {
  const template: Template = {
    ...input,
    id: id('tpl'),
    createdAt: now(),
    updatedAt: now(),
  }
  const templates = listTemplates()
  templates.push(template)
  write('templates.json', templates)
  return template
}

export function updateTemplate(id: string, patch: Partial<Template>): Template | null {
  const templates = listTemplates()
  const idx = templates.findIndex((t) => t.id === id)
  if (idx === -1) return null
  templates[idx] = { ...templates[idx], ...patch, id, updatedAt: now() }
  write('templates.json', templates)
  return templates[idx]
}

export function deleteTemplate(id: string): boolean {
  const templates = listTemplates()
  const next = templates.filter((t) => t.id !== id)
  if (next.length === templates.length) return false
  write('templates.json', next)
  return true
}

// ---- Shortcuts ----

export function listShortcuts(): Shortcut[] {
  return read<Shortcut[]>('shortcuts.json', [])
}

export function getShortcut(id: string): Shortcut | null {
  return listShortcuts().find((s) => s.id === id) ?? null
}

export function createShortcut(input: Omit<Shortcut, 'id' | 'createdAt' | 'updatedAt'>): Shortcut {
  const shortcut: Shortcut = {
    ...input,
    id: id('sc'),
    createdAt: now(),
    updatedAt: now(),
  }
  const shortcuts = listShortcuts()
  shortcuts.push(shortcut)
  write('shortcuts.json', shortcuts)
  return shortcut
}

export function updateShortcut(id: string, patch: Partial<Shortcut>): Shortcut | null {
  const shortcuts = listShortcuts()
  const idx = shortcuts.findIndex((s) => s.id === id)
  if (idx === -1) return null
  shortcuts[idx] = { ...shortcuts[idx], ...patch, id, updatedAt: now() }
  write('shortcuts.json', shortcuts)
  return shortcuts[idx]
}

export function deleteShortcut(id: string): boolean {
  const shortcuts = listShortcuts()
  const next = shortcuts.filter((s) => s.id !== id)
  if (next.length === shortcuts.length) return false
  write('shortcuts.json', next)
  return true
}