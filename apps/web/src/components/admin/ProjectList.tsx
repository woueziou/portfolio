import { actions } from 'astro:actions'
import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Project {
  id: number
  title: string
  slug: string
  description: string | null
  publication_status: string
  type: string[]
  tech_stack: string[]
  project_date: string | null
  published_at: string | null
  created_at: string
  main_image_url: string | null
  project_techstacks?: Array<{
    techstack_id: string
    techstacks: { id: string; name: string; icon: string } | null
  }>
}

interface PaginatedResult {
  projects: Project[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'web', label: 'Web' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'backend', label: 'Backend' },
  { value: 'api', label: 'API' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'library', label: 'Library' },
  { value: 'other', label: 'Other' },
]

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400',
}

function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getTypeBadgeColor(type: string): string {
  const colors: Record<string, string> = {
    web: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    mobile: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    backend: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    api: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    desktop: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    library: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    infra: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
    script: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    llm: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    ai: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  }
  return colors[type] || 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
}

export function ProjectList({ initialData }: { initialData: PaginatedResult }) {
  const [data, setData] = useState<PaginatedResult>(initialData)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(initialData.page)
  const [loading, setLoading] = useState(false)
  const perPage = initialData.perPage

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const { error, data: result } = await actions.projects.list({
        page,
        perPage,
        status: statusFilter || undefined,
      })
      if (!error && result) {
        setData(result as PaginatedResult)
      }
    } finally {
      setLoading(false)
    }
  }, [page, perPage, statusFilter])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Client-side search filter (on top of server-side)
  const filtered = data.projects.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.title?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    )
  }).filter((p) => {
    if (!typeFilter) return true
    return p.type?.includes(typeFilter)
  })

  return (
    <div class="space-y-6">
      {/* Search + Filters */}
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <input
            type="search"
            placeholder="Search projects by title or slug..."
            aria-label="Search projects"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            class="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          aria-label="Filter by status"
          class="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
          aria-label="Filter by type"
          class="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div role="status" aria-label="Loading" class="text-center text-sm text-zinc-500 py-4">Loading...</div>
      )}

      {/* Cards grid */}
      {!loading && filtered.length === 0 ? (
        <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">No projects found</h3>
          <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {search || statusFilter || typeFilter ? 'Try adjusting your filters.' : 'Create your first project to get started.'}
          </p>
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <a
              key={project.id}
              href={`/admin/projects/${project.id}/edit`}
              class="block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
            >
              {/* Card header: image or initials */}
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1 min-w-0">
                  <h3 class="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                    {project.title}
                  </h3>
                  <p class="text-xs text-zinc-400 mt-0.5 truncate">{project.slug}</p>
                </div>
                <span class={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ml-2', STATUS_COLORS[project.publication_status] || '')}>
                  {project.publication_status}
                </span>
              </div>

              {/* Type badges */}
              {project.type && project.type.length > 0 && (
                <div class="flex flex-wrap gap-1.5 mb-3">
                  {project.type.map((t) => (
                    <span key={t} class={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', getTypeBadgeColor(t))}>
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              {project.description && (
                <p class="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3">
                  {project.description}
                </p>
              )}

              {/* Tech stack badges */}
              {project.tech_stack && project.tech_stack.length > 0 && (
                <div class="flex flex-wrap gap-1 mb-3">
                  {project.tech_stack.slice(0, 4).map((tech) => (
                    <span key={tech} class="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                      {tech}
                    </span>
                  ))}
                  {project.tech_stack.length > 4 && (
                    <span class="text-xs text-zinc-400 self-center">
                      +{project.tech_stack.length - 4} more
                    </span>
                  )}
                </div>
              )}

              {/* Date */}
              <div class="flex items-center gap-3 text-xs text-zinc-400 mt-auto pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span>Created: {formatDate(project.created_at)}</span>
                {project.published_at && <span>Published: {formatDate(project.published_at)}</span>}
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div class="flex items-center justify-between">
          <p class="text-sm text-zinc-500">
            Page {data.page} of {data.totalPages} ({data.total} total)
          </p>
          <div class="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              aria-label="Previous page"
              class={cn(
                'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                page <= 1
                  ? 'border-zinc-200 dark:border-zinc-700 text-zinc-400 cursor-not-allowed'
                  : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500',
              )}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
              aria-label="Next page"
              class={cn(
                'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                page >= data.totalPages
                  ? 'border-zinc-200 dark:border-zinc-700 text-zinc-400 cursor-not-allowed'
                  : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500',
              )}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
