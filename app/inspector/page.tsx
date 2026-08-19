import { Suspense } from 'react'
import { RunInspector } from '@/components/inspector/RunInspector'

export default function InspectorPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-xl font-semibold">Run Inspector</h1>
      <p className="mb-6 mt-1 text-sm text-[#8b949e]">
        Watch a run in real-time. View streaming output, approve or reject commands, and steer
        running agents.
      </p>
      <Suspense fallback={<p className="text-sm text-[#8b949e]">Loading…</p>}>
        <RunInspector />
      </Suspense>
    </div>
  )
}