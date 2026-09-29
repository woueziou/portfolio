import type { APIRoute } from 'astro'
import { DEFAULT_OG_IMAGE, fetchSiteOgImage, resolveOgImage } from '@/lib/og-image'

// Rendered on demand so the share image follows the admin settings without a
// rebuild. Keep this route's imports minimal: it must cold-start well within
// the Vercel function timeout.
export const prerender = false

const CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=86400'

export const GET: APIRoute = async ({ url, redirect }) => {
  const image = resolveOgImage(await fetchSiteOgImage())

  // Local assets are served by the CDN; social crawlers follow the redirect.
  if (image === DEFAULT_OG_IMAGE || image.startsWith('/')) {
    return redirect(new URL(image, url).toString(), 302)
  }

  // Serve remote images (e.g. the Supabase-hosted avatar) directly, as some
  // crawlers don't follow redirects for og:image.
  try {
    const res = await fetch(image, { signal: AbortSignal.timeout(5000) })
    const contentType = res.headers.get('content-type') ?? ''
    if (!res.ok || !contentType.startsWith('image/')) throw new Error(`Bad image response: ${res.status}`)

    return new Response(res.body, {
      headers: { 'Content-Type': contentType, 'Cache-Control': CACHE_CONTROL },
    })
  } catch {
    return redirect(new URL(DEFAULT_OG_IMAGE, url).toString(), 302)
  }
}
