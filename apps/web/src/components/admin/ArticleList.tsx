import { actions } from 'astro:actions'
import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Search,
  Plus,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'

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
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  draft: 'secondary',
  published: 'default',
  archived: 'outline',
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
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(initialData.page)
  const [loading, setLoading] = useState(false)
  const perPage = initialData.perPage

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const { error, data: result } = await actions.articles.list({
        page,
        perPage,
        status: statusFilter !== 'all' ? (statusFilter as 'draft' | 'published' | 'archived') : undefined,
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
    <div className="space-y-6">
      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search articles..."
            aria-label="Search articles"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9 border-0 bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-[160px] border-0 bg-muted/50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {loading && (
        <div
          role="status"
          aria-label="Loading"
          className="text-center text-sm text-muted-foreground py-8"
        >
          Loading...
        </div>
      )}

      {/* Article List */}
      {!loading && filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            No articles found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your filters.'
              : 'Create your first article to get started.'}
          </p>
          {!search && statusFilter === 'all' && (
            <Button variant="ghost" className="mt-4" asChild>
              <a href="/admin/articles/new">
                <Plus className="h-4 w-4 mr-1.5" />
                New Article
              </a>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((article) => (
            <a
              key={article.id}
              href={`/admin/articles/${article.id}/edit`}
              className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group -mx-4"
            >
              {/* Icon */}
              <div className="h-10 w-10 shrink-0 bg-muted flex items-center justify-center">
                <FileText className="h-4 w-4 text-muted-foreground/60" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground truncate group-hover:text-foreground/80 transition-colors">
                    {article.title}
                  </h3>
                  <Badge
                    variant={
                      STATUS_VARIANT[article.status || 'draft'] || 'outline'
                    }
                    className="text-[10px] px-1.5 py-0 h-4 font-normal shrink-0"
                  >
                    {article.status || 'draft'}
                  </Badge>
                </div>
                {article.summary && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {article.summary}
                  </p>
                )}
              </div>

              {/* Meta */}
              <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                {article.reading_time_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.reading_time_minutes}m
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(article.created_at)}
                </span>
              </div>

              {/* Arrow */}
              <ExternalLink className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
            </a>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            {data.total} articles
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              aria-label="Previous page"
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              {data.page} / {data.totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setPage((p) => Math.min(data.totalPages, p + 1))
              }
              disabled={page >= data.totalPages}
              aria-label="Next page"
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
