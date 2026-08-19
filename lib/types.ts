export interface Agent {
  id: string
  name: string
  baseUrl: string
  apiKey: string // server-side only, NEVER serialized to client
  profile: Record<string, unknown>
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export type PublicAgent = Omit<Agent, 'apiKey'>

export type RunStatus =
  | 'queued'
  | 'running'
  | 'awaiting_approval'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'failed'
  | 'stopped'

export interface Run {
  id: string
  batchId: string | null
  agentId: string
  agentName: string
  upstreamRunId: string | null
  prompt: string
  templateId: string | null
  status: RunStatus
  createdAt: string
  startedAt: string | null
  endedAt: string | null
  outputTail: string
  usage: Record<string, unknown> | null
  error: string | null
}

export interface Template {
  id: string
  name: string
  prompt: string
  variables: string[]
  createdAt: string
  updatedAt: string
}

export interface AgentHealth {
  agentId: string
  online: boolean
  status: string | null
  detailed: Record<string, unknown> | null
  checkedAt: string
}

export interface DispatchBody {
  agentId: string
  prompt: string
  templateId?: string | null
  variables?: Record<string, string>
}

export interface FanoutBody {
  agentIds: string[]
  prompt: string
  templateId?: string | null
  variables?: Record<string, string>
}

export interface Shortcut {
  id: string
  name: string
  agentIds: string[]
  templateId?: string | null
  prompt?: string
  variables?: Record<string, string>
  createdAt: string
  updatedAt: string
}