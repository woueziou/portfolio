import { Loader2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { generateSlug, isValidSlug } from '@/lib/slug'
import StatusBadge from '@/components/admin/StatusBadge'

type ArticleStatus = 'draft' | 'published' | 'archived'

interface PublishDrawerProps {
  isOpen: boolean
  articleId: number
  initialTitle: string
  initialSlug: string
  initialStatus: ArticleStatus
  initialSummary: string | null
  initialImageUrl: string | null
  initialCanonicalUrl: string | null
  onClose: () => void
  onSaved: (next: {
    status: ArticleStatus
    summary: string | null
    image_url: string | null
    url: string | null
    updated_at: string
    published_at: string | null
    title?: string
    slug?: string
  }) => void
}

export default function PublishDrawer({
  isOpen,
  articleId,
  initialTitle,
  initialSlug,
  initialStatus,
  initialSummary,
  initialImageUrl,
  initialCanonicalUrl,
  onClose,
  onSaved,
}: PublishDrawerProps) {
  const [title, setTitle] = useState(initialTitle)
  const [slug, setSlug] = useState(initialSlug)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(true)
  const [summary, setSummary] = useState(initialSummary ?? '')
  const [imageUrl, setImageUrl] = useState(initialImageUrl ?? '')
  const [canonicalUrl, setCanonicalUrl] = useState(initialCanonicalUrl ?? '')
  const [status, setStatus] = useState<ArticleStatus>(initialStatus)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugError, setSlugError] = useState<string | null>(null)

  // Reset form when drawer opens with fresh props
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle)
      setSlug(initialSlug)
      setSummary(initialSummary ?? '')
      setImageUrl(initialImageUrl ?? '')
      setCanonicalUrl(initialCanonicalUrl ?? '')
      setStatus(initialStatus)
      setError(null)
      setSlugError(null)
    }
  }, [isOpen, initialTitle, initialSlug, initialStatus, initialSummary, initialImageUrl, initialCanonicalUrl])

  // Auto-generate slug from title if not manually edited
  useEffect(() => {
    if (!slugManuallyEdited && title) {
      setSlug(generateSlug(title))
    }
  }, [title, slugManuallyEdited])

  // Validate slug on change
  useEffect(() => {
    if (slug && !isValidSlug(slug)) {
      setSlugError('Lowercase letters, numbers, and hyphens only')
    } else {
      setSlugError(null)
    }
  }, [slug])

  const excerptLength = summary.length
  const isValidExcerpt = excerptLength <= 280
  const canSubmit = useMemo(() => isValidExcerpt, [isValidExcerpt])

  const saveAll = async () => {
    if (!canSubmit || !title.trim()) return

    setSaving(true)
    setError(null)

    const finalSlug = slug.trim() || generateSlug(title)

    try {
      const supabase = createSupabaseBrowserClient()
      const { data, error: updateError } = await supabase
        .from('articles')
        .update({
          title: title.trim(),
          slug: finalSlug,
          summary: summary.trim() || null,
          image_url: imageUrl.trim() || null,
          url: canonicalUrl.trim() || null,
        })
        .eq('id', articleId)
        .select()
        .single()

      if (updateError) {
        setError(updateError.message)
        return
      }

      const a = data as Record<string, unknown>
      onSaved({
        status: a.status as ArticleStatus,
        summary: a.summary as string | null,
        image_url: a.image_url as string | null,
        url: a.url as string | null,
        updated_at: a.updated_at as string,
        published_at: a.published_at as string | null,
        title: a.title as string,
        slug: a.slug as string,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (publish: boolean) => {
    setPublishing(true)
    setError(null)

    try {
      const supabase = createSupabaseBrowserClient()
      const now = new Date().toISOString()

      const { data: current, error: fetchError } = await supabase
        .from('articles')
        .select('published_at')
        .eq('id', articleId)
        .single()

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      const newStatus = publish ? 'published' : 'draft'
      const publishedAt = publish && !current?.published_at ? now : current?.published_at

      const { data, error: updateError } = await supabase
        .from('articles')
        .update({ status: newStatus, published_at: publishedAt })
        .eq('id', articleId)
        .select()
        .single()

      if (updateError) {
        setError(updateError.message)
        return
      }

      const a = data as Record<string, unknown>
      const nextStatus = a.status as ArticleStatus
      setStatus(nextStatus)
      onSaved({
        status: nextStatus,
        summary,
        image_url: imageUrl || null,
        url: canonicalUrl || null,
        updated_at: a.updated_at as string,
        published_at: a.published_at as string | null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update publication status')
    } finally {
      setPublishing(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
        role="presentation"
        aria-hidden="true"
      />
      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-border bg-background p-6 shadow-xl overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Publish settings</h2>
          <button
            type="button"
            aria-label="Close"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Status */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
            <span className="text-sm text-muted-foreground">Current status</span>
            <StatusBadge status={status} size="md" />
          </div>

          {/* Title */}
          <div>
            <label htmlFor="drawer-title" className="mb-1 block text-sm font-medium text-foreground">
              Title
            </label>
            <input
              id="drawer-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
              placeholder="Article title"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="drawer-slug" className="mb-1 block text-sm font-medium text-foreground">
              Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground shrink-0">/articles/</span>
              <input
                id="drawer-slug"
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true)
                  setSlug(e.target.value)
                }}
                required
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
                placeholder="article-slug"
              />
            </div>
            {slugError && (
              <p className="mt-1 text-xs text-destructive">{slugError}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Lowercase letters, numbers, and hyphens only
            </p>
          </div>

          {/* Separator */}
          <hr className="border-border" />

          {/* Excerpt */}
          <div>
            <label htmlFor="drawer-excerpt" className="mb-1 block text-sm font-medium text-foreground">
              Excerpt
            </label>
            <textarea
              id="drawer-excerpt"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="Short summary shown on article previews"
            />
            <p className={`mt-1 text-xs ${isValidExcerpt ? 'text-muted-foreground' : 'text-destructive'}`} aria-live="polite">
              {excerptLength}/280
            </p>
          </div>

          {/* Cover image */}
          <div>
            <label htmlFor="drawer-cover-url" className="mb-1 block text-sm font-medium text-foreground">
              Cover image URL
            </label>
            <input
              id="drawer-cover-url"
              type="url"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Canonical URL */}
          <div>
            <label htmlFor="drawer-canonical-url" className="mb-1 block text-sm font-medium text-foreground">
              Canonical URL
            </label>
            <input
              id="drawer-canonical-url"
              type="url"
              value={canonicalUrl}
              onChange={(event) => setCanonicalUrl(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="https://example.com/post"
            />
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              disabled={!canSubmit || saving || !title.trim() || !!slugError}
              onClick={() => { void saveAll() }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </button>

            <div className="border-t border-border pt-2">
              {status === 'published' ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center">Publication actions</p>
                  <button
                    type="button"
                    disabled={publishing}
                    onClick={() => { void updateStatus(true) }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
                    Update published article
                  </button>
                  <button
                    type="button"
                    disabled={publishing}
                    onClick={() => { void updateStatus(false) }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Move to draft
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={publishing || !canSubmit}
                  onClick={() => { void updateStatus(true) }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
                  Publish article
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
