'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/** Poll a fetch callback every `intervalMs` while mounted. */
export function usePolling<T>(fetcher: () => Promise<T>, intervalMs: number, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const mountedRef = useRef(false)

  const refetch = useCallback(async () => {
    try {
      const result = await fetcherRef.current()
      if (!mountedRef.current) return
      setData(result)
      setError(null)
    } catch (e) {
      if (mountedRef.current) setError((e as Error).message)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    refetch()
    const timer = setInterval(refetch, intervalMs)
    return () => {
      mountedRef.current = false
      clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps])

  return { data, error, refetch }
}