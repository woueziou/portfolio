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
  FolderOpen,
  Search,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Layers,
  ExternalLink,
} from 'lucide-react'

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
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'web', label: 'Web' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'backend', label: 'Backend' },
  { value: 'api', label: 'API' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'library', label: 'Library' },
  { value: 'other', label: 'Other' },
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

export function ProjectList({ initialData }: { initialData: PaginatedResult }) {
  const [data, setData] = useState<PaginatedResult>(initialData)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(initialData.page)
  const [loading, setLoading] = useState(false)
  const perPage = initialData.perPage

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const { error, data: result } = await actions.projects.list({
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
    fetchProjects()
  }, [fetchProjects])

  // Client-side search filter (on top of server-side)
  const filtered = data.projects
    .filter((p) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        p.title?.toLowerCase().includes(q) ||
        p.slug?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      )
    })
    .filter((p) => {
      if (typeFilter === 'all') return true
      return p.type?.includes(typeFilter)
    })

  return (
    <div className="space-y-6">
      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            aria-label="Search projects"
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
        <Select
          value={typeFilter}
          onValueChange={(value) => {
            setTypeFilter(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-[160px] border-0 bg-muted/50">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div
          role="status"
          aria-label="Loading"
          className="text-center text-sm text-muted-foreground py-8"
        >
          Loading...
        </div>
      )}

      {/* Project List */}
      {!loading && filtered.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            No projects found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {search || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your filters.'
              : 'Create your first project to get started.'}
          </p>
          {!search && statusFilter === 'all' && typeFilter === 'all' && (
            <Button variant="ghost" className="mt-4" asChild>
              <a href="/admin/projects/new">
                <Plus className="h-4 w-4 mr-1.5" />
                New Project
              </a>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((project) => (
            <a
              key={project.id}
              href={`/admin/projects/${project.id}/edit`}
              className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group -mx-4"
            >
              {/* Thumbnail or icon */}
              {project.main_image_url ? (
                <div className="h-12 w-12 shrink-0 overflow-hidden bg-muted">
                  <img
                    src={project.main_image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-12 w-12 shrink-0 bg-muted flex items-center justify-center">
                  <FolderOpen className="h-5 w-5 text-muted-foreground/60" />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground truncate group-hover:text-foreground/80 transition-colors">
                    {project.title}
                  </h3>
                  <Badge
                    variant={STATUS_VARIANT[project.publication_status] || 'outline'}
                    className="text-[10px] px-1.5 py-0 h-4 font-normal shrink-0"
                  >
                    {project.publication_status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {project.type && project.type.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {project.type.join(', ')}
                    </span>
                  )}
                  {project.tech_stack && project.tech_stack.length > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      {project.tech_stack.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                <Calendar className="h-3 w-3" />
                {formatDate(project.created_at)}
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
            {data.total} projects
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
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
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
