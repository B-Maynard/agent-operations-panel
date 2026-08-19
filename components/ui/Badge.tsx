import type { RunStatus } from '@/lib/types'

const colors: Record<RunStatus, string> = {
  queued: 'bg-[rgba(139,148,158,0.15)] text-[#8b949e]',
  running: 'bg-[rgba(88,166,255,0.15)] text-[#58a6ff]',
  awaiting_approval: 'bg-[rgba(210,153,34,0.15)] text-[#d29922]',
  approved: 'bg-[rgba(63,185,80,0.15)] text-[#3fb950]',
  rejected: 'bg-[rgba(248,81,73,0.15)] text-[#f85149]',
  completed: 'bg-[rgba(63,185,80,0.15)] text-[#3fb950]',
  failed: 'bg-[rgba(248,81,73,0.15)] text-[#f85149]',
  stopped: 'bg-[rgba(139,148,158,0.15)] text-[#8b949e]',
}

export function Badge({ status }: { status: RunStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${colors[status]}`}>
      {status}
    </span>
  )
}