import { NextRequest } from 'next/server'
import { getRun } from '@/lib/store'
import { events } from '@/lib/events'
import { sseEncode, sseHeaders } from '@/lib/sse'
import type { Run } from '@/lib/types'
import { startTracker } from '@/lib/hermes'
import { isTerminal } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const run = getRun(id)
  if (!run) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })

  if (run && !isTerminal(run.status)) {
    startTracker(run.id)
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (payload: unknown) => controller.enqueue(sseEncode(payload))
      send(run) // immediate snapshot
      const listener = (r: Run) => send(r)
      events.on(`run:${id}`, listener)
      // ponytail: SSE comment heartbeat keeps proxies from killing idle connections
      const heartbeat = setInterval(() => {
        controller.enqueue(new TextEncoder().encode(': ping\n\n'))
      }, 15000)
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        events.off(`run:${id}`, listener)
        controller.close()
      })
    },
  })

  return new Response(stream, { headers: sseHeaders() })
}