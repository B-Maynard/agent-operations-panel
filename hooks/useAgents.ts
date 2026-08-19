'use client'

import { useCallback, useEffect, useState } from 'react'
import type { PublicAgent } from '@/lib/types'

export function useAgents() {
  const [agents, setAgents] = useState<PublicAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/agents')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setAgents(await res.json())
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { agents, loading, error, refresh }
}