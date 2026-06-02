import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { AstroCookies } from 'astro'

export function createSupabaseServerClient(cookies: AstroCookies) {
  return createServerClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookies.set(name, value, {
            ...options,
            path: '/',
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'lax',
          })
        },
        remove(name: string, options: CookieOptions) {
          cookies.delete(name, {
            ...options,
            path: '/',
          })
        },
      },
    },
  )
}
