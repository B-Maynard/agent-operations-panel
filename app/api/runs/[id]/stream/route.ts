import { NextRequest } from 'next/server'
import { getRun } from '@/lib/store'
import { events } from '@/lib/events'
import { sseEncode, sseHeaders } from '@/lib/sse'
import type { Run } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const run = getRun(id)
  if (!run) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (payload: unknown) => controller.enqueue(sseEncode(payload))
      send(run) // immediate snapshot
      const listener = (r: Run) => send(r)
      events.on(`run:${id}`, listener)
      req.signal.addEventListener('abort', () => {
        events.off(`run:${id}`, listener)
        controller.close()
      })
    },
  })

  return new Response(stream, { headers: sseHeaders() })
}