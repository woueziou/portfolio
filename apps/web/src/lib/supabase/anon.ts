import type { Database } from '@portfolio/shared'
import { createClient } from '@supabase/supabase-js'

/**
 * Cookie-less, session-less client using the public anon key only.
 * For build-time reads of published content. Never use the service role here.
 */
export function createSupabaseAnonClient() {
  const url = import.meta.env.SUPABASE_URL
  const key = import.meta.env.SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('[supabase] SUPABASE_URL and SUPABASE_ANON_KEY must be set at build time')
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
