import { navigate } from 'astro:transitions/client'
import { useEffect, useState } from 'react'
import { generateSlug } from '@/lib/slug'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

interface ArticleFormProps {
  article?: {
    id: number
    title: string
    slug: string
    project_id: number | null
    status: string
  }
  onSuccess?: (article: Record<string, unknown>) => void
  onCancel?: () => void
  onSuccessPath?: string
  onCancelPath?: string
}

interface ArticleFormData {
  title: string
  slug: string
  project_id: string
  status: 'draft' | 'published' | 'archived'
}

export default function ArticleForm({
  article,
  onSuccess,
  onCancel,
  onSuccessPath,
  onCancelPath,
}: ArticleFormProps) {
  const isEditing = !!article

  const [formData, setFormData] = useState<ArticleFormData>({
    title: article?.title || '',
    slug: article?.slug || '',
    project_id: article?.project_id?.toString() || '',
    status: (article?.status as ArticleFormData['status']) || 'draft',
  })

  const [projects, setProjects] = useState<Array<{ id: number; title: string }>>([])
  const [loading, setLoading] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!article?.slug)

  useEffect(() => {
    async function fetchProjects() {
      const supabase = createSupabaseBrowserClient()
      try {
        const { data } = await supabase
          .from('projects')
          .select('id, title')
          .order('title')
        setProjects((data as Array<{ id: number; title: string }>) || [])
      } catch (err) {
        console.error('Failed to fetch projects:', err)
      } finally {
        setLoadingProjects(false)
      }
    }
    fetchProjects()
  }, [])

  useEffect(() => {
    if (!slugManuallyEdited && formData.title) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(prev.title),
      }))
    }
  }, [formData.title, slugManuallyEdited])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createSupabaseBrowserClient()

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        navigate('/admin/login')
        return
      }

      let result: Record<string, unknown>

      const payload = {
        title: formData.title,
        slug: formData.slug || undefined,
        project_id: formData.project_id ? parseInt(formData.project_id, 10) : null,
        status: formData.status,
      }

      if (isEditing && article) {
        const { data, error: updateError } = await supabase
          .from('articles')
          .update(payload)
          .eq('id', article.id)
          .select()
          .single()

        if (updateError) {
          setError(updateError.message)
          return
        }
        result = data as Record<string, unknown>
      } else {
        const { data, error: insertError } = await supabase
          .from('articles')
          .insert({
            ...payload,
            slug: (payload.slug as string) || generateSlug(formData.title || 'untitled'),
            user_id: session.session.user.id,
          })
          .select()
          .single()

        if (insertError) {
          setError(insertError.message)
          return
        }
        result = data as Record<string, unknown>
      }

      onSuccess?.(result)
      if (!onSuccess && onSuccessPath) {
        await navigate(onSuccessPath)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (onCancel) {
      onCancel()
      return
    }
    if (onCancelPath) {
      await navigate(onCancelPath)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
          Title *
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          required
          maxLength={200}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
          placeholder="My Awesome Article"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-2">
          Slug *
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">/articles/</span>
          <input
            id="slug"
            type="text"
            value={formData.slug}
            onChange={(e) => {
              setSlugManuallyEdited(true)
              setFormData((prev) => ({ ...prev, slug: e.target.value }))
            }}
            required
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
            placeholder="my-awesome-article"
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Lowercase letters, numbers, and hyphens only
        </p>
      </div>

      <div>
        <label htmlFor="project_id" className="block text-sm font-medium text-foreground mb-2">
          Linked Project (Optional)
        </label>
        <select
          id="project_id"
          value={formData.project_id}
          onChange={(e) => setFormData((prev) => ({ ...prev, project_id: e.target.value }))}
          disabled={loadingProjects}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors disabled:opacity-50"
        >
          <option value="">Standalone article</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted-foreground">
          Link this article to a project, or leave empty for a standalone article
        </p>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              status: e.target.value as ArticleFormData['status'],
            }))
          }
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
        {(onCancel || onCancelPath) && (
          <button
            type="button"
            onClick={() => { void handleCancel() }}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-foreground text-background px-6 py-2.5 text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating...' : isEditing ? 'Update Article' : 'Create Article'}
        </button>
      </div>
    </form>
  )
}
