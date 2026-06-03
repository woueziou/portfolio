import { defineMiddleware } from 'astro:middleware'
import { assertCoreSchema } from '@/lib/supabase/schema-health'
import { createSupabaseServerClient } from '@/lib/supabase/server'

let schemaCheckPromise: Promise<void> | null = null

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

    if (!schemaCheckPromise) {
      schemaCheckPromise = assertCoreSchema(supabase).catch((schemaError) => {
        schemaCheckPromise = null
        throw schemaError
      })
    }

    try {
      await schemaCheckPromise
    } catch (schemaError) {
      console.error('Supabase schema health check failed:', schemaError)
      return new Response(
        'Admin is unavailable because the database schema is out of date. Apply pending Supabase migrations and retry.',
        { status: 500 },
      )
    }

    // Attach user to locals for use in pages
    context.locals.user = user
    context.locals.supabase = supabase
  }

  return next()
})
