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

    // Kick off the schema check (or reuse the in-flight/completed promise from a
    // prior warm invocation) concurrently with the auth check — both are independent
    // network calls and there is no reason to wait for one before starting the other.
    if (!schemaCheckPromise) {
      schemaCheckPromise = assertCoreSchema(supabase).catch((schemaError) => {
        schemaCheckPromise = null
        throw schemaError
      })
    }

    const [authResult, schemaResult] = await Promise.allSettled([
      supabase.auth.getUser(),
      schemaCheckPromise,
    ])

    // Handle schema failure
    if (schemaResult.status === 'rejected') {
      console.error('Supabase schema health check failed:', schemaResult.reason)
      return new Response(
        'Admin is unavailable because the database schema is out of date. Apply pending Supabase migrations and retry.',
        { status: 500 },
      )
    }

    // Handle auth failure
    if (authResult.status === 'rejected') {
      return redirect('/admin/login')
    }
    const { data: { user }, error } = authResult.value
    if (error || !user) {
      return redirect('/admin/login')
    }

    // Attach user to locals for use in pages
    context.locals.user = user
    context.locals.supabase = supabase
  }

  return next()
})
