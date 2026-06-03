/**
 * Provides a cached Supabase select helper for client-side components.
 * Implements stale-while-revalidate: returns cached data immediately
 * while refreshing in the background.
 */

import type { Database } from '@repo/shared'
import { createSupabaseBrowserClient } from './browser'
import { getCached, setCache } from './cache'

type TableName = keyof Database['public']['Tables']

export async function cachedSelect<T extends TableName>(
  table: T,
  options?: {
    queryKey?: string
    ttl?: number
    order?: { column: string; ascending?: boolean }
  },
): Promise<{ data: Database['public']['Tables'][T]['Row'][]; error: string | null }> {
  const queryKey = options?.queryKey ?? 'all'
  const ttl = options?.ttl

  // Try cache first
  const cached = getCached<Database['public']['Tables'][T]['Row'][]>(table as string, queryKey)
  if (cached && !cached.stale) {
    return { data: cached.data, error: null }
  }

  // Fetch fresh
  const supabase = createSupabaseBrowserClient()
  let query = supabase.from(table as string).select()
  if (options?.order) {
    query = query.order(options.order.column, {
      ascending: options.order.ascending ?? true,
    })
  }

  const { data, error } = await query

  if (error) {
    // If we have stale data, return it instead of the error
    if (cached) {
      console.warn(
        `Supabase fetch for ${table as string} failed, serving stale cache.`,
        error.message,
      )
      return { data: cached.data, error: null }
    }
    return { data: [], error: error.message }
  }

  const rows = (data ?? []) as Database['public']['Tables'][T]['Row'][]
  setCache(table as string, queryKey, rows, ttl)
  return { data: rows, error: null }
}
