import { AgentHealthGrid } from '@/components/dashboard/AgentHealthGrid'
import { RecentRunsList } from '@/components/dashboard/RecentRunsList'
import { QuickDispatch } from '@/components/dashboard/QuickDispatch'
import { ShortcutBar } from '@/components/shortcuts/ShortcutBar'
import { Card } from '@/components/ui/Card'

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="mb-6 mt-1 text-sm text-[#8b949e]">
        Overview of your Hermes agents and their recent activity. Monitor health, dispatch commands,
        and track runs across all connected agents.
      </p>

      <div className="mb-8">
        <ShortcutBar />
      </div>

      <div className="mb-8">
        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-[#8b949e]">Agents</div>
        <AgentHealthGrid />
      </div>

      <div className="mb-8">
        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-[#8b949e]">
          Recent Runs
        </div>
        <RecentRunsList />
      </div>

      <div>
        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-[#8b949e]">
          Quick Dispatch
        </div>
        <Card className="p-4 md:max-w-md">
          <QuickDispatch />
        </Card>
      </div>
    </div>
  )
}