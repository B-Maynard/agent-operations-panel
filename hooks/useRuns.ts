'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Run } from '@/lib/types'

export function useRuns(opts: { agentId?: string; status?: string; batchId?: string; limit?: number } = {}) {
  const [runs, setRuns] = useState<Run[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const params = new URLSearchParams()
    if (opts.agentId) params.set('agentId', opts.agentId)
    if (opts.status) params.set('status', opts.status)
    if (opts.batchId) params.set('batchId', opts.batchId)
    if (opts.limit) params.set('limit', String(opts.limit))
    try {
      const res = await fetch(`/api/runs?${params.toString()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setRuns(await res.json())
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [opts.agentId, opts.status, opts.batchId, opts.limit])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { runs, loading, error, refresh }
}