import { useState, useEffect, useCallback } from 'react'
import { actions } from 'astro:actions'
import { navigate } from 'astro:transitions/client'
import { generateSlug } from '@/lib/slug'

interface ProjectFormProps {
  project?: {
    id: number
    title: string
    description: string
    main_image_url: string | null
    url: string | null
    access_link: string | null
    state: string
    project_date: string | null
    type: string[]
    tech_stack: string[]
    slug: string
  }
  onSuccess?: (project: any) => void
  onCancel?: () => void
  onSuccessPath?: string
  onCancelPath?: string
}

const PROJECT_TYPES = [
  { value: 'web', label: 'Web' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'api', label: 'API' },
  { value: 'library', label: 'Library' },
  { value: 'other', label: 'Other' },
]

const PROJECT_STATES = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'finished', label: 'Finished' },
  { value: 'production', label: 'Production' },
]

interface ProjectFormData {
  title: string
  description: string
  main_image_url: string
  url: string
  access_link: string
  state: string
  project_date: string
  type: string[]
  tech_stack: string[]
  slug: string
}

export default function ProjectForm({ project, onSuccess, onCancel, onSuccessPath, onCancelPath }: ProjectFormProps) {
  const isEditing = !!project

  const [formData, setFormData] = useState<ProjectFormData>({
    title: project?.title || '',
    description: project?.description || '',
    main_image_url: project?.main_image_url || '',
    url: project?.url || '',
    access_link: project?.access_link || '',
    state: project?.state || 'ongoing',
    project_date: project?.project_date?.split('T')[0] || '',
    type: project?.type || [],
    tech_stack: project?.tech_stack || [],
    slug: project?.slug || '',
  })

  const [techInput, setTechInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!project?.slug)

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && formData.title) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(prev.title),
      }))
    }
  }, [formData.title, slugManuallyEdited])

  const handleTypeToggle = useCallback((type: string) => {
    setFormData(prev => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter(t => t !== type)
        : [...prev.type, type],
    }))
  }, [])

  const handleAddTech = useCallback(() => {
    const tech = techInput.trim()
    if (tech && !formData.tech_stack.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        tech_stack: [...prev.tech_stack, tech],
      }))
      setTechInput('')
    }
  }, [techInput, formData.tech_stack])

  const handleRemoveTech = useCallback((tech: string) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter(t => t !== tech),
    }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      let result

      const submitData = {
        ...formData,
        main_image_url: formData.main_image_url || undefined,
        url: formData.url || undefined,
        access_link: formData.access_link || undefined,
        project_date: formData.project_date || undefined,
        state: formData.state as 'ongoing' | 'finished' | 'production',
        type: formData.type as ('web' | 'mobile' | 'desktop' | 'api' | 'library' | 'other')[],
      }

      if (isEditing && project) {
        result = await actions.projects.update({
          id: project.id,
          ...submitData,
        })
      } else {
        result = await actions.projects.create(submitData)
      }

      if (result.error) {
        setError(result.error.message)
      } else {
        onSuccess?.(result.data.project)
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
        <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Title *
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
          maxLength={200}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:focus:ring-zinc-400/20 transition-colors"
          placeholder="My Awesome Project"
        />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Slug *
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">/projects/</span>
          <input
            id="slug"
            type="text"
            value={formData.slug}
            onChange={e => {
              setSlugManuallyEdited(true)
              setFormData(prev => ({ ...prev, slug: e.target.value }))
            }}
            required
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:focus:ring-zinc-400/20 transition-colors"
            placeholder="my-awesome-project"
          />
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Lowercase letters, numbers, and hyphens only
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
          maxLength={2000}
          rows={4}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:focus:ring-zinc-400/20 transition-colors resize-none"
          placeholder="A brief description of your project..."
        />
      </div>

      {/* Project Type */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Project Type *
        </label>
        <div className="flex flex-wrap gap-2">
          {PROJECT_TYPES.map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => handleTypeToggle(type.value)}
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                formData.type.includes(type.value)
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Tech Stack *
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={techInput}
            onChange={e => setTechInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTech()
              }
            }}
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:focus:ring-zinc-400/20 transition-colors"
            placeholder="Add technology..."
          />
          <button
            type="button"
            onClick={handleAddTech}
            className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tech_stack.map(tech => (
            <span
              key={tech}
              className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-sm text-zinc-700 dark:text-zinc-300"
            >
              {tech}
              <button
                type="button"
                onClick={() => handleRemoveTech(tech)}
                className="ml-1 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* State */}
      <div>
        <label htmlFor="state" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Project State
        </label>
        <select
          id="state"
          value={formData.state}
          onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:focus:ring-zinc-400/20 transition-colors"
        >
          {PROJECT_STATES.map(state => (
            <option key={state.value} value={state.value}>
              {state.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <label htmlFor="project_date" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Project Date
        </label>
        <input
          id="project_date"
          type="date"
          value={formData.project_date}
          onChange={e => setFormData(prev => ({ ...prev, project_date: e.target.value }))}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:focus:ring-zinc-400/20 transition-colors"
        />
      </div>

      {/* URLs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Repository URL
          </label>
          <input
            id="url"
            type="url"
            value={formData.url}
            onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:focus:ring-zinc-400/20 transition-colors"
            placeholder="https://github.com/..."
          />
        </div>
        <div>
          <label htmlFor="access_link" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Live Demo URL
          </label>
          <input
            id="access_link"
            type="url"
            value={formData.access_link}
            onChange={e => setFormData(prev => ({ ...prev, access_link: e.target.value }))}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:focus:ring-zinc-400/20 transition-colors"
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Image URL */}
      <div>
        <label htmlFor="main_image_url" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Cover Image URL
        </label>
        <input
          id="main_image_url"
          type="url"
          value={formData.main_image_url}
          onChange={e => setFormData(prev => ({ ...prev, main_image_url: e.target.value }))}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-500 dark:focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:focus:ring-zinc-400/20 transition-colors"
          placeholder="https://..."
        />
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
          {loading ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </form>
  )
}
