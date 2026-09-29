import type { Database } from '@portfolio/shared'
import { createClient } from '@supabase/supabase-js'
import { withTimeout } from '@/lib/supabase/with-timeout'

export const DEFAULT_OG_IMAGE = '/og-default.svg'
/** On-demand endpoint serving the site-wide share image (see pages/og-image.ts). */
export const SITE_OG_IMAGE_ROUTE = '/og-image'

interface OgImageSources {
  pageImage?: string | null
  useAvatar?: boolean | null
  avatarUrl?: string | null
  siteOgImage?: string | null
}

/**
 * Pick the share image for a page. Priority:
 * page-specific image > profile avatar (if enabled in settings) > site OG image > default.
 */
export function resolveOgImage({
  pageImage,
  useAvatar,
  avatarUrl,
  siteOgImage,
}: OgImageSources): string {
  if (pageImage) return pageImage
  if (useAvatar && avatarUrl) return avatarUrl
  if (siteOgImage) return siteOgImage
  return DEFAULT_OG_IMAGE
}

/**
 * Fetch the site-wide share image settings. Uses a cookie-less client since
 * the settings are public.
 */
export async function fetchSiteOgImage(): Promise<Omit<OgImageSources, 'pageImage'>> {
  const url = import.meta.env.SUPABASE_URL
  const key = import.meta.env.SUPABASE_ANON_KEY
  if (!url || !key) return {}

  const supabase = createClient<Database>(url, key, { auth: { persistSession: false } })

  try {
    const [{ data: config }, { data: profile }] = await Promise.all([
      withTimeout(
        supabase
          .from('site_config')
          .select('seo_og_image, use_avatar_as_og_image')
          .eq('id', 1)
          .maybeSingle(),
        3000,
      ),
      withTimeout(supabase.from('profiles').select('avatar_url').limit(1).maybeSingle(), 3000),
    ])

    return {
      useAvatar: config?.use_avatar_as_og_image ?? false,
      siteOgImage: config?.seo_og_image ?? null,
      avatarUrl: profile?.avatar_url ?? null,
    }
  } catch {
    return {}
  }
}
