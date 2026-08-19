import { AgentList } from '@/components/agents/AgentList'

export default function AgentsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-xl font-semibold">Agents</h1>
      <p className="mb-6 mt-1 text-sm text-[#8b949e]">
        Manage your Hermes agent connections. Add, edit, or remove agent endpoints and monitor their
        health.
      </p>
      <AgentList />
    </div>
  )
}