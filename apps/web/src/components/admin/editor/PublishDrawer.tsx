import { actions } from 'astro:actions'
import { Loader2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import StatusBadge from '@/components/admin/StatusBadge'

type ArticleStatus = 'draft' | 'published' | 'archived'

interface PublishDrawerProps {
  isOpen: boolean
  articleId: number
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
  }) => void
}

export default function PublishDrawer({
  isOpen,
  articleId,
  initialStatus,
  initialSummary,
  initialImageUrl,
  initialCanonicalUrl,
  onClose,
  onSaved,
}: PublishDrawerProps) {
  const [summary, setSummary] = useState(initialSummary ?? '')
  const [imageUrl, setImageUrl] = useState(initialImageUrl ?? '')
  const [canonicalUrl, setCanonicalUrl] = useState(initialCanonicalUrl ?? '')
  const [status, setStatus] = useState<ArticleStatus>(initialStatus)
  const [savingMeta, setSavingMeta] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const excerptLength = summary.length
  const isValidExcerpt = excerptLength <= 280

  const canSubmit = useMemo(() => {
    if (!isValidExcerpt) return false
    return true
  }, [isValidExcerpt])

  const saveMetadata = async () => {
    if (!canSubmit) return

    setSavingMeta(true)
    setError(null)

    try {
      const result = await actions.articles.update({
        id: articleId,
        summary: summary.trim() || null,
        image_url: imageUrl.trim() || null,
        url: canonicalUrl.trim() || null,
      })

      if (result.error) {
        setError(result.error.message)
        return
      }

      onSaved({
        status: result.data.article.status,
        summary: result.data.article.summary,
        image_url: result.data.article.image_url,
        url: result.data.article.url,
        updated_at: result.data.article.updated_at,
        published_at: result.data.article.published_at,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save metadata')
    } finally {
      setSavingMeta(false)
    }
  }

  const updateStatus = async (publish: boolean) => {
    setPublishing(true)
    setError(null)

    try {
      const result = await actions.articles.publish({ id: articleId, publish })

      if (result.error) {
        setError(result.error.message)
        return
      }

      const nextStatus = result.data.article.status as ArticleStatus
      setStatus(nextStatus)
      onSaved({
        status: nextStatus,
        summary,
        image_url: imageUrl || null,
        url: canonicalUrl || null,
        updated_at: result.data.article.updated_at,
        published_at: result.data.article.published_at,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update publication status')
    } finally {
      setPublishing(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-border bg-background p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Publish settings</h2>
          <button
            type="button"
            aria-label="Close publish settings"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
            <span className="text-sm text-muted-foreground">Current status</span>
            <StatusBadge status={status} size="md" />
          </div>

          <div>
            <label htmlFor="article-excerpt" className="mb-1 block text-sm font-medium text-foreground">
              Excerpt
            </label>
            <textarea
              id="article-excerpt"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="Short summary shown on article previews"
            />
            <p
              className={`mt-1 text-xs ${isValidExcerpt ? 'text-muted-foreground' : 'text-destructive'}`}
              aria-live="polite"
            >
              {excerptLength}/280
            </p>
          </div>

          <div>
            <label htmlFor="article-cover-url" className="mb-1 block text-sm font-medium text-foreground">
              Cover image URL
            </label>
            <input
              id="article-cover-url"
              type="url"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label htmlFor="article-canonical-url" className="mb-1 block text-sm font-medium text-foreground">
              Canonical URL
            </label>
            <input
              id="article-canonical-url"
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

          <div className="space-y-2 pt-2">
            <button
              type="button"
              disabled={!canSubmit || savingMeta}
              onClick={() => {
                void saveMetadata()
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingMeta && <Loader2 className="h-4 w-4 animate-spin" />}
              Save metadata
            </button>

            {status === 'published' ? (
              <>
                <button
                  type="button"
                  disabled={publishing}
                  onClick={() => {
                    void updateStatus(true)
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update published article
                </button>
                <button
                  type="button"
                  disabled={publishing}
                  onClick={() => {
                    void updateStatus(false)
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Move to draft
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={publishing || !canSubmit}
                onClick={() => {
                  void updateStatus(true)
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
                Publish article
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
