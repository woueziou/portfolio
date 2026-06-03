import { useEffect, useMemo, useState } from 'react'
import StatusBadge from '@/components/admin/StatusBadge'
import ArticleEditor from './ArticleEditor'
import PublishDrawer from './PublishDrawer'

type ArticleStatus = 'draft' | 'published' | 'archived'
type SaveState = 'saved' | 'saving' | 'unsaved' | 'error'

interface EditorShellProps {
  article: {
    id: number
    title: string
    slug: string
    status: ArticleStatus
    published_at: string | null
    updated_at: string
    content: unknown
    summary: string | null
    image_url: string | null
    url: string | null
  }
}

function formatRelativeTime(iso: string | null) {
  if (!iso) return 'Not saved yet'

  const deltaSeconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (deltaSeconds < 10) return 'Saved just now'
  if (deltaSeconds < 60) return `Saved ${deltaSeconds}s ago`

  const minutes = Math.floor(deltaSeconds / 60)
  if (minutes < 60) return `Saved ${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Saved ${hours}h ago`

  const days = Math.floor(hours / 24)
  return `Saved ${days}d ago`
}

export default function EditorShell({ article }: EditorShellProps) {
  const [status, setStatus] = useState<ArticleStatus>(article.status)
  const [publishedAt, setPublishedAt] = useState<string | null>(article.published_at)
  const [updatedAt, setUpdatedAt] = useState<string>(article.updated_at)
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [summary, setSummary] = useState<string | null>(article.summary)
  const [imageUrl, setImageUrl] = useState<string | null>(article.image_url)
  const [canonicalUrl, setCanonicalUrl] = useState<string | null>(article.url)

  const saveLabel = useMemo(() => {
    if (saveState === 'saving') return 'Saving...'
    if (saveState === 'unsaved') return 'Unsaved changes'
    if (saveState === 'error') return 'Save failed'
    return formatRelativeTime(updatedAt)
  }, [saveState, updatedAt])

  useEffect(() => {
    const interval = setInterval(() => {
      if (saveState === 'saved') {
        setUpdatedAt((prev) => prev)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [saveState])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isMeta = event.metaKey || event.ctrlKey
      if (!isMeta) return

      if (event.shiftKey && event.key.toLowerCase() === 'p') {
        event.preventDefault()
        setDrawerOpen(true)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="space-y-5">
      <header className="sticky top-16 z-30 flex items-center justify-between rounded-xl border border-border bg-background/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <StatusBadge status={status} size="md" />
          <span
            className={`text-sm ${
              saveState === 'error'
                ? 'text-destructive'
                : saveState === 'unsaved'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-muted-foreground'
            }`}
            aria-live="polite"
          >
            {saveLabel}
          </span>
          {status === 'published' && publishedAt && (
            <span className="text-xs text-muted-foreground">
              Published {new Date(publishedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
          onClick={() => setDrawerOpen(true)}
        >
          Publish settings
        </button>
      </header>

      <ArticleEditor
        articleId={article.id}
        initialContent={article.content}
        onSave={(savedArticle) => {
          setUpdatedAt(savedArticle.updated_at)
        }}
        onSaveStateChange={setSaveState}
      />

      <PublishDrawer
        isOpen={drawerOpen}
        articleId={article.id}
        initialStatus={status}
        initialSummary={summary}
        initialImageUrl={imageUrl}
        initialCanonicalUrl={canonicalUrl}
        onClose={() => setDrawerOpen(false)}
        onSaved={(next) => {
          setStatus(next.status)
          setPublishedAt(next.published_at)
          setUpdatedAt(next.updated_at)
          setSummary(next.summary)
          setImageUrl(next.image_url)
          setCanonicalUrl(next.url)
        }}
      />
    </div>
  )
}
