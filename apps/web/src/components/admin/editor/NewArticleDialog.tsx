import { useEffect, useState } from 'react'
import { navigate } from 'astro:transitions/client'
import { generateSlug } from '@/lib/slug'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { renderTiptapToHtml } from '@/lib/html-renderer'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { JSONContent } from '@tiptap/react'

interface NewArticleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  content: JSONContent
  onCreated: (article: { id: number; title: string; slug: string }) => void
}

export default function NewArticleDialog({
  open,
  onOpenChange,
  content,
  onCreated,
}: NewArticleDialogProps) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slugManuallyEdited && title) {
      setSlug(generateSlug(title))
    }
  }, [title, slugManuallyEdited])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)
    setError(null)

    try {
      const supabase = createSupabaseBrowserClient()
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        navigate('/admin/login')
        return
      }

      const finalSlug = slug.trim() || generateSlug(title)
      const contentHtml = renderTiptapToHtml(content as Parameters<typeof renderTiptapToHtml>[0])
      const { data, error: insertError } = await supabase
        .from('articles')
        .insert({
          title: title.trim(),
          slug: finalSlug,
          content,
          content_html: contentHtml || null,
          user_id: session.session.user.id,
          status: 'draft',
        })
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
        return
      }

      const article = data as { id: number; title: string; slug: string }
      onCreated({ id: article.id, title: title.trim(), slug: article.slug })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create article')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create article</DialogTitle>
          <DialogDescription>
            Give your article a title before saving.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="new-article-title" className="block text-sm font-medium text-foreground mb-1.5">
              Title
            </label>
            <input
              id="new-article-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              autoFocus
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
              placeholder="My Awesome Article"
            />
          </div>

          <div>
            <label htmlFor="new-article-slug" className="block text-sm font-medium text-foreground mb-1.5">
              Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground shrink-0">/articles/</span>
              <input
                id="new-article-slug"
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true)
                  setSlug(e.target.value)
                }}
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
                placeholder="my-awesome-article"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Lowercase letters, numbers, and hyphens only
            </p>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="rounded-lg bg-foreground text-background px-5 py-2 text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Creating...' : 'Create & Save'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
