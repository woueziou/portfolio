import { defineMiddleware } from 'astro:middleware'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context
  const pathname = url.pathname

  // Only protect /admin/* routes
  if (pathname.startsWith('/admin')) {
    // Allow public access to login page
    if (pathname === '/admin/login') {
      return next()
    }

    const supabase = createSupabaseServerClient(cookies)

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return redirect('/admin/login')
    }

    context.locals.user = user
    context.locals.supabase = supabase
  }

  return next()
})
