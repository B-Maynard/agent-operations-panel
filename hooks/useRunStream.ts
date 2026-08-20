'use client'

import { useEffect, useRef, useState } from 'react'
import type { Run } from '@/lib/types'

/**
 * Stream a run's updates via SSE using fetch (so we can send the
 * Authorization header). Returns the latest run state.
 */
export function useRunStream(runId: string | null) {
  const [run, setRun] = useState<Run | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!runId) return
    const abort = new AbortController()
    abortRef.current = abort
    setConnected(false)
    setError(null)

    let buffer = ''
    const decoder = new TextDecoder()
    let reconnectTimer: ReturnType<typeof setTimeout>

    async function connect() {
      try {
        const res = await fetch(`/api/runs/${runId}/stream`, {
          signal: abort.signal,
          headers: { Accept: 'text/event-stream' },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setConnected(true)
        setError(null)
        const reader = res.body!.getReader()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          let idx: number
          while ((idx = buffer.indexOf('\n\n')) !== -1) {
            const chunk = buffer.slice(0, idx)
            buffer = buffer.slice(idx + 2)
            for (const line of chunk.split('\n')) {
              if (line.startsWith('data: ')) {
                try {
                  setRun(JSON.parse(line.slice(6)))
                } catch {
                  // ignore malformed frames
                }
              }
            }
          }
        }
      } catch (e) {
        if ((e as Error).name === 'AbortError' || abort.signal.aborted) return
        setError((e as Error).message)
      } finally {
        setConnected(false)
        // ponytail: 1s reconnect — re-hydrates tracker via SSE route on next connect
        if (!abort.signal.aborted) {
          reconnectTimer = setTimeout(connect, 1000)
        }
      }
    }

    connect()
    return () => {
      abort.abort()
      clearTimeout(reconnectTimer)
    }
  }, [runId])

  return { run, connected, error }
}
