/**
 * Client-side localStorage cache for Supabase queries.
 * Implements stale-while-revalidate: serves cached data instantly
 * while refreshing in the background.
 */

const CACHE_PREFIX = 'portfolio:supabase:'
const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutes

interface CacheEntry<T> {
  data: T
  cachedAt: number
  ttl: number
}

function cacheKey(table: string, queryKey: string): string {
  return `${CACHE_PREFIX}${table}:${queryKey}`
}

export function getCached<T>(table: string, queryKey: string): { data: T; stale: boolean } | null {
  try {
    const raw = localStorage.getItem(cacheKey(table, queryKey))
    if (!raw) return null

    const entry: CacheEntry<T> = JSON.parse(raw)
    const age = Date.now() - entry.cachedAt
    const stale = age > entry.ttl

    return { data: entry.data, stale }
  } catch {
    return null
  }
}

export function setCache<T>(
  table: string,
  queryKey: string,
  data: T,
  ttl: number = DEFAULT_TTL_MS,
): void {
  try {
    const entry: CacheEntry<T> = { data, cachedAt: Date.now(), ttl }
    localStorage.setItem(cacheKey(table, queryKey), JSON.stringify(entry))
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function invalidateCache(table: string): void {
  try {
    const prefix = `${CACHE_PREFIX}${table}:`
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(prefix)) {
        localStorage.removeItem(key)
      }
    }
  } catch {
    // silently ignore
  }
}
