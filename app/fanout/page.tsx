import { Suspense } from 'react'
import { FanoutBuilder } from '@/components/fanout/FanoutBuilder'
import { FanoutStatusTable } from '@/components/fanout/FanoutStatusTable'
import { Card } from '@/components/ui/Card'

export default function FanoutPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-xl font-semibold">Fan-out</h1>
      <p className="mb-6 mt-1 text-sm text-[#8b949e]">
        Send the same command to multiple agents at once. Compare results side-by-side across your
        fleet.
      </p>
      <div className="mb-8">
        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-[#8b949e]">Builder</div>
        <Card className="p-4">
          <FanoutBuilder />
        </Card>
      </div>
      <div>
        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-[#8b949e]">
          Status Matrix
        </div>
        <Suspense fallback={<p className="text-sm text-[#8b949e]">Loading…</p>}>
          <FanoutStatusTable />
        </Suspense>
      </div>
    </div>
  )
}