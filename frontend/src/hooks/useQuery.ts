import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, toApiError } from '@/api/client'

/**
 * Minimal cached data fetching: one request per key, results cached in memory for `staleTime`,
 * request cancelled when the key changes or the component unmounts, and `invalidateQueries(prefix)`
 * to refresh every subscriber after a mutation.
 */
interface CacheEntry {
  data: unknown
  updatedAt: number
}

const cache = new Map<string, CacheEntry>()
const subscribers = new Map<string, Set<() => void>>()

export function invalidateQueries(prefix: string) {
  for (const key of [...cache.keys()]) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
  subscribers.forEach((listeners, key) => {
    if (key.startsWith(prefix)) listeners.forEach((listener) => listener())
  })
}

/** Test helper. */
export function clearQueryCache() {
  cache.clear()
}

interface QueryState<T> {
  data: T | undefined
  error: ApiError | undefined
  isLoading: boolean
  isFetching: boolean
}

interface QueryOptions {
  /** How long cached data counts as fresh (ms). */
  staleTime?: number
  /** Keep showing the previous key's data while the next one loads (pagination, filters). */
  keepPrevious?: boolean
}

export function useQuery<T>(
  key: string | null,
  fetcher: (signal: AbortSignal) => Promise<T>,
  { staleTime = 60_000, keepPrevious = false }: QueryOptions = {},
) {
  const [state, setState] = useState<QueryState<T>>(() => {
    const entry = key ? cache.get(key) : undefined
    return { data: entry?.data as T | undefined, error: undefined, isLoading: !!key && !entry, isFetching: false }
  })
  const [version, setVersion] = useState(0)
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    if (!key) return
    const listeners = subscribers.get(key) ?? new Set<() => void>()
    subscribers.set(key, listeners)
    const listener = () => setVersion((v) => v + 1)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
      if (listeners.size === 0) subscribers.delete(key)
    }
  }, [key])

  useEffect(() => {
    if (!key) {
      setState({ data: undefined, error: undefined, isLoading: false, isFetching: false })
      return
    }
    const entry = cache.get(key)
    if (entry && Date.now() - entry.updatedAt < staleTime) {
      setState({ data: entry.data as T, error: undefined, isLoading: false, isFetching: false })
      return
    }
    setState((previous) => {
      const data = entry ? (entry.data as T) : keepPrevious ? previous.data : undefined
      return { data, error: undefined, isLoading: data === undefined, isFetching: true }
    })

    const controller = new AbortController()
    fetcherRef.current(controller.signal)
      .then((data) => {
        cache.set(key, { data, updatedAt: Date.now() })
        if (!controller.signal.aborted) setState({ data, error: undefined, isLoading: false, isFetching: false })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState((previous) => ({
          data: previous.data,
          error: toApiError(error),
          isLoading: false,
          isFetching: false,
        }))
      })
    return () => controller.abort()
  }, [key, version, staleTime, keepPrevious])

  const refetch = useCallback(() => {
    if (!key) return
    cache.delete(key)
    setVersion((v) => v + 1)
  }, [key])

  return { ...state, refetch }
}
