import { actions } from 'astro:actions'
import { navigate } from 'astro:transitions/client'
import { useEffect, useState } from 'react'
import { generateSlug } from '@/lib/slug'

interface ArticleFormProps {
  article?: {
    id: number
    title: string
    slug: string
    project_id: number | null
    status: string
  }
  onSuccess?: (article: any) => void
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
    status: (article?.status as any) || 'draft',
  })

  const [projects, setProjects] = useState<Array<{ id: number; title: string }>>([])
  const [loading, setLoading] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!article?.slug)

  // Fetch projects for the dropdown
  useEffect(() => {
    async function fetchProjects() {
      try {
        const result = await actions.projects.list({ page: 1, perPage: 100 })
        if (result.data) {
          setProjects(result.data.projects)
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err)
      } finally {
        setLoadingProjects(false)
      }
    }

    fetchProjects()
  }, [])

  // Auto-generate slug from title
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
      let result

      const submitData = {
        title: formData.title,
        slug: formData.slug || undefined,
        project_id: formData.project_id ? parseInt(formData.project_id, 10) : null,
        status: formData.status,
      }

      if (isEditing && article) {
        result = await actions.articles.update({
          id: article.id,
          ...submitData,
        })
      } else {
        result = await actions.articles.create(submitData)
      }

      if (result.error) {
        setError(result.error.message)
      } else {
        onSuccess?.(result.data.article)
        if (!onSuccess && onSuccessPath) {
          await navigate(onSuccessPath)
        }
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
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
        >
          Title *
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          required
          maxLength={200}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:focus:ring-zinc-400/20 transition-colors"
          placeholder="My Awesome Article"
        />
      </div>

      {/* Slug */}
      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
        >
          Slug *
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">/articles/</span>
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
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:focus:ring-zinc-400/20 transition-colors"
            placeholder="my-awesome-article"
          />
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Lowercase letters, numbers, and hyphens only
        </p>
      </div>

      {/* Project Link */}
      <div>
        <label
          htmlFor="project_id"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
        >
          Linked Project (Optional)
        </label>
        <select
          id="project_id"
          value={formData.project_id}
          onChange={(e) => setFormData((prev) => ({ ...prev, project_id: e.target.value }))}
          disabled={loadingProjects}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:focus:ring-zinc-400/20 transition-colors disabled:opacity-50"
        >
          <option value="">Standalone article</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Link this article to a project, or leave empty for a standalone article
        </p>
      </div>

      {/* Status */}
      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
        >
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as any }))}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:focus:ring-zinc-400/20 transition-colors"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        {(onCancel || onCancelPath) && (
          <button
            type="button"
            onClick={() => {
              void handleCancel()
            }}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 dark:bg-zinc-100 px-6 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating...' : isEditing ? 'Update Article' : 'Create Article'}
        </button>
      </div>
    </form>
  )
}
