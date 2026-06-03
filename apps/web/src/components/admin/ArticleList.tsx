import { actions } from 'astro:actions'
import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Article {
  id: number
  title: string
  slug: string
  status: string
  reading_time_minutes: number | null
  project_id: number | null
  published_at: string | null
  created_at: string
  summary: string | null
}

interface PaginatedResult {
  articles: Article[]
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

export function ArticleList({ initialData }: { initialData: PaginatedResult }) {
  const [data, setData] = useState<PaginatedResult>(initialData)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(initialData.page)
  const [loading, setLoading] = useState(false)
  const perPage = initialData.perPage

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      // Use the server action — falls back to client search for simplicity
      const { error, data: result } = await actions.articles.list({
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
    fetchArticles()
  }, [fetchArticles])

  // Client-side search
  const filtered = data.articles.filter((a) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      a.title?.toLowerCase().includes(q) ||
      a.slug?.toLowerCase().includes(q) ||
      a.summary?.toLowerCase().includes(q)
    )
  })

  return (
    <div class="space-y-6">
      {/* Search + Filters */}
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <input
            type="search"
            placeholder="Search articles by title or slug..."
            aria-label="Search articles"
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
      </div>

      {/* Loading */}
      {loading && (
        <div role="status" aria-label="Loading" class="text-center text-sm text-zinc-500 py-4">Loading...</div>
      )}

      {/* Cards */}
      {!loading && filtered.length === 0 ? (
        <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">No articles found</h3>
          <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {search || statusFilter ? 'Try adjusting your filters.' : 'Create your first article to get started.'}
          </p>
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((article) => (
            <a
              key={article.id}
              href={`/admin/articles/${article.id}/edit`}
              class="block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
            >
              {/* Card header */}
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1 min-w-0">
                  <h3 class="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                    {article.title}
                  </h3>
                  <p class="text-xs text-zinc-400 mt-0.5 truncate">{article.slug}</p>
                </div>
                <span class={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ml-2', STATUS_COLORS[article.status || 'draft'] || '')}>
                  {article.status}
                </span>
              </div>

              {/* Summary */}
              {article.summary && (
                <p class="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3">
                  {article.summary}
                </p>
              )}

              {/* Meta footer */}
              <div class="flex items-center justify-between text-xs text-zinc-400 mt-auto pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div class="flex items-center gap-3">
                  <span>Created: {formatDate(article.created_at)}</span>
                  {article.reading_time_minutes && (
                    <span>{article.reading_time_minutes} min read</span>
                  )}
                </div>
                {article.published_at && (
                  <span>Published: {formatDate(article.published_at)}</span>
                )}
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
