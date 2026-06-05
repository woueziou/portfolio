import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import StatusBadge from '@/components/admin/StatusBadge'
import ArticleEditor from './ArticleEditor'
import ArticleMetadataPopover from './ArticleMetadataPopover'
import NewArticleDialog from './NewArticleDialog'
import PublishDrawer from './PublishDrawer'
import type { JSONContent } from '@tiptap/react'

type ArticleStatus = 'draft' | 'published' | 'archived'
type SaveState = 'saved' | 'saving' | 'unsaved' | 'error'

interface ArticleData {
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
  created_at?: string
  reading_time_minutes?: number | null
  project_id?: number | null
}

interface EditorShellProps {
  article?: ArticleData
  projects?: Array<{ id: number; title: string }>
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

export default function EditorShell({ article, projects = [] }: EditorShellProps) {
  const [articleCreated, setArticleCreated] = useState(false)
  const isNew = !article && !articleCreated
  const [status, setStatus] = useState<ArticleStatus>(article?.status || 'draft')
  const [publishedAt, setPublishedAt] = useState<string | null>(article?.published_at || null)
  const [updatedAt, setUpdatedAt] = useState<string>(article?.updated_at || '')
  const [saveState, setSaveState] = useState<SaveState>(isNew ? 'unsaved' : 'saved')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [newArticleDialogOpen, setNewArticleDialogOpen] = useState(false)
  const [currentContent, setCurrentContent] = useState<JSONContent | null>(null)
  const [articleId, setArticleId] = useState<number | undefined>(article?.id)
  const [currentArticle, setCurrentArticle] = useState<ArticleData | undefined>(article)

  const [summary, setSummary] = useState<string | null>(article?.summary || null)
  const [imageUrl, setImageUrl] = useState<string | null>(article?.image_url || null)
  const [canonicalUrl, setCanonicalUrl] = useState<string | null>(article?.url || null)

  const linkedProject = article?.project_id
    ? projects.find((p) => p.id === article.project_id)?.title || null
    : null

  const saveLabel = useMemo(() => {
    if (isNew) return 'Unsaved draft'
    if (saveState === 'saving') return 'Saving...'
    if (saveState === 'unsaved') return 'Unsaved changes'
    if (saveState === 'error') return 'Save failed'
    return formatRelativeTime(updatedAt)
  }, [isNew, saveState, updatedAt])

  useEffect(() => {
    const interval = setInterval(() => {
      if (saveState === 'saved') setUpdatedAt((prev) => prev)
    }, 30000)
    return () => clearInterval(interval)
  }, [saveState])

  const handleSave = () => {
    if (isNew && currentContent) {
      setNewArticleDialogOpen(true)
    }
  }

  const handleCreateArticle = (created: { id: number; title: string; slug: string }) => {
    const now = new Date().toISOString()
    setArticleId(created.id)
    setArticleCreated(true)
    setSaveState('saved')
    setUpdatedAt(now)
    setCurrentArticle({
      id: created.id,
      title: created.title,
      slug: created.slug,
      status: 'draft',
      published_at: null,
      updated_at: now,
      content: currentContent,
      summary: null,
      image_url: null,
      url: null,
    })
  }

  // Keyboard shortcut: Ctrl/Cmd+S
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isMeta = event.metaKey || event.ctrlKey
      if (isMeta && event.key.toLowerCase() === 's' && !event.shiftKey) {
        event.preventDefault()
        handleSave()
      }
      if (isMeta && event.shiftKey && event.key.toLowerCase() === 'p') {
        event.preventDefault()
        if (!isNew) setDrawerOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isNew, handleSave])

  return (
    <div className="space-y-6">
      {/* Header bar — all actions before the editor zone */}
      <header className="sticky top-16 z-30 flex items-center justify-between border-b border-border/40 bg-background/95 pb-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {isNew ? 'Save draft' : 'Save'}
          </button>

          <div
            className={`h-2 w-2 rounded-full ${
              saveState === 'saved' ? 'bg-green-500'
                : saveState === 'saving' ? 'bg-yellow-500 animate-pulse'
                  : saveState === 'unsaved' ? 'bg-orange-500'
                    : 'bg-red-500'
            }`}
          />

          <span
            className={`text-sm ${
              saveState === 'error' ? 'text-destructive'
                : saveState === 'unsaved' ? 'text-amber-600 dark:text-amber-400'
                  : 'text-muted-foreground'
            }`}
            aria-live="polite"
          >
            {saveLabel}
          </span>

          {!isNew && (
            <span className="hidden sm:inline">
              <StatusBadge status={status} size="sm" />
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {!isNew && currentArticle && (
            <ArticleMetadataPopover
              status={status}
              slug={currentArticle.slug}
              createdAt={currentArticle.created_at || null}
              updatedAt={updatedAt}
              publishedAt={publishedAt}
              readingTimeMinutes={currentArticle.reading_time_minutes ?? null}
              projectTitle={linkedProject}
              summary={summary}
              imageUrl={imageUrl}
              canonicalUrl={canonicalUrl}
            />
          )}

          {!isNew && (
            <button
              type="button"
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
              onClick={() => setDrawerOpen(true)}
            >
              Publish settings
            </button>
          )}
        </div>
      </header>

      {/* Editor */}
      <ArticleEditor
        articleId={articleId}
        initialContent={
          currentArticle?.content
            ? (currentArticle.content as JSONContent)
            : undefined
        }
        onContentChange={(content) => {
          if (isNew) setCurrentContent(content)
        }}
        onSave={(savedArticle) => {
          const a = savedArticle as Record<string, string>
          setUpdatedAt(a.updated_at as string)
        }}
        onSaveStateChange={setSaveState}
        onCreateArticle={(content) => {
          setCurrentContent(content)
          setNewArticleDialogOpen(true)
        }}
      />

      {/* New article dialog */}
      {isNew && (
        <NewArticleDialog
          open={newArticleDialogOpen}
          onOpenChange={setNewArticleDialogOpen}
          content={currentContent || { type: 'doc', content: [{ type: 'paragraph', content: [] }] }}
          onCreated={handleCreateArticle}
        />
      )}

      {/* Publish drawer */}
      {!isNew && currentArticle && (
        <PublishDrawer
          isOpen={drawerOpen}
          articleId={articleId!}
          initialTitle={currentArticle.title}
          initialSlug={currentArticle.slug}
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
            if (next.title !== undefined) {
              setCurrentArticle((prev) => prev ? { ...prev, title: next.title! } : prev)
            }
            if (next.slug !== undefined) {
              setCurrentArticle((prev) => prev ? { ...prev, slug: next.slug! } : prev)
            }
          }}
        />
      )}
    </div>
  )
}
