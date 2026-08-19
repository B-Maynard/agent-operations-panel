'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Shortcut } from '@/lib/types'

export function useShortcuts() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/shortcuts')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setShortcuts(await res.json())
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

  return { shortcuts, loading, error, refresh }
}
