export const prerender = false

import type { APIRoute } from 'astro'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const POST: APIRoute = async (context) => {
  const supabase = createSupabaseServerClient(context.cookies)
  await supabase.auth.signOut()
  return context.redirect('/admin/login')
}
