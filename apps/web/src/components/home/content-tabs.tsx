import type { Database } from '@portfolio/shared'
import { ChevronDown, FileText, FolderOpen } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ArticleItem } from './articles/article-item'
import { ProjectItem } from './projects/project-item'
import { cn } from '@/lib/utils'
import { formatDate } from '@/utils/formater'

type Project = Database['public']['Tables']['projects']['Row']
type Article = Database['public']['Tables']['articles']['Row']

const ITEMS_PER_PAGE = 9

/* ── Tab definitions ── */
type TabId = 'projects' | 'articles'

interface Tab {
  id: TabId
  label: string
}

const TABS: Tab[] = [
  { id: 'projects', label: 'Projects' },
  { id: 'articles', label: 'Articles' },
]

/* ── Helpers ── */

function groupByYear(projects: Project[]): Map<string, Project[]> {
  const groups = new Map<string, Project[]>()
  for (const p of projects) {
    const year = formatDate(p.project_date, 'YYYY')
    const list = groups.get(year)
    if (list) {
      list.push(p)
    } else {
      groups.set(year, [p])
    }
  }
  return groups
}

function getAllTypes(projects: Project[]): string[] {
  const set = new Set<string>()
  for (const p of projects) {
    for (const t of p.type) {
      set.add(t)
    }
  }
  return Array.from(set).sort()
}

/* ── Empty state placeholder ── */

function EmptyPlaceholder({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FolderOpen
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Icon className="h-14 w-14 text-muted-foreground/20 mb-4" />
      <h3 className="text-lg font-semibold text-foreground/60">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground/50 max-w-xs">{description}</p>
    </div>
  )
}

/* ── Projects content (with year-grouping + type filter) ── */

function ProjectsContent({ data }: { data: Project[] }) {
  const allTypes = useMemo(() => getAllTypes(data), [data])
  const [activeType, setActiveType] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  // Reset pagination when filter changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE)
  }, [activeType])

  const filtered = useMemo(() => {
    if (!activeType) return data
    return data.filter((p) =>
      p.type.includes(activeType as Database['public']['Enums']['project_type']),
    )
  }, [data, activeType])

  const grouped = groupByYear(filtered)
  const years = Array.from(grouped.keys()).sort((a, b) => Number(b) - Number(a))

  // Flatten projects for pagination while preserving year grouping
  const flatProjects = useMemo(() => {
    const all: Project[] = []
    for (const year of years) {
      all.push(...(grouped.get(year) ?? []))
    }
    return all
  }, [years, grouped])

  const visibleProjects = flatProjects.slice(0, visibleCount)
  const hasMore = visibleCount < flatProjects.length

  // Re-group only visible projects
  const visibleGrouped = groupByYear(visibleProjects)
  const visibleYears = Array.from(visibleGrouped.keys()).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="w-full mx-auto">
      {/* ── Type filter bar ── */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveType(null)}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded border transition-colors',
            activeType === null
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-secondary/30 text-muted-foreground hover:border-primary hover:text-foreground',
          )}
        >
          All
        </button>
        {allTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setActiveType(type)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded border capitalize transition-colors',
              activeType === type
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-secondary/30 text-muted-foreground hover:border-primary hover:text-foreground',
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {/* ── Project groups ── */}
      {visibleYears.length === 0 ? (
        <EmptyPlaceholder
          icon={FolderOpen}
          title={activeType ? `No ${activeType} projects` : 'No projects yet'}
          description={activeType ? `No projects of type "${activeType}" yet.` : 'Projects will appear here once created.'}
        />
      ) : (
        <>
          {visibleYears.map((year, yi) => {
            const projects = visibleGrouped.get(year)!
            return (
              <section key={year} className={cn('relative', yi < visibleYears.length - 1 && 'mb-12')}>
                {/* ── Year header ── */}
                <div className="mb-8 flex items-center gap-4">
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-background">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    </span>
                    <span className="text-2xl font-bold tracking-tight text-foreground/80">
                      {year}
                    </span>
                  </div>
                  <div className="h-px flex-1 bg-border/60" />
                </div>

                {/* ── Project grid ── */}
                <div
                  className={cn(
                    'grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 place-content-center gap-6',
                  )}
                >
                  {projects.map((item) => (
                    <ProjectItem item={item} key={item.id} />
                  ))}
                </div>
              </section>
            )
          })}

          {/* ── Load More ── */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
                className={cn(
                  'inline-flex items-center gap-2 px-6 py-3 text-sm font-medium',
                  'border border-secondary/30 rounded',
                  'hover:bg-accent hover:text-accent-foreground transition-colors',
                )}
              >
                <ChevronDown className="h-4 w-4" />
                Load More ({flatProjects.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ── Articles content (with pagination) ── */

function ArticlesContent({ data }: { data: Article[] }) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  const visibleArticles = data.slice(0, visibleCount)
  const hasMore = visibleCount < data.length

  return (
    <div className="w-full mx-auto">
      {data.length === 0 ? (
        <EmptyPlaceholder
          icon={FileText}
          title="No articles yet"
          description="Articles will appear here once published. Stay tuned!"
        />
      ) : (
        <>
          <div
            className={cn(
              'grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 place-content-center gap-6',
            )}
          >
            {visibleArticles.map((item) => (
              <ArticleItem item={item} key={item.id} />
            ))}
          </div>

          {/* ── Load More ── */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
                className={cn(
                  'inline-flex items-center gap-2 px-6 py-3 text-sm font-medium',
                  'border border-secondary/30 rounded',
                  'hover:bg-accent hover:text-accent-foreground transition-colors',
                )}
              >
                <ChevronDown className="h-4 w-4" />
                Load More ({data.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ── Main content tabs component ── */

interface ContentTabsProps {
  projects: Project[]
  articles: Article[]
}

export default function ContentTabs({ projects, articles }: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('projects')

  return (
    <div className="w-full">
      {/* ── Tab bar (left-aligned) ── */}
      <div className="flex items-center gap-8 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'text-2xl font-bold uppercase transition-colors',
              activeTab === tab.id
                ? 'underline underline-offset-8 text-foreground'
                : 'no-underline text-muted-foreground/50 hover:text-muted-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {activeTab === 'projects' ? (
        <ProjectsContent data={projects} />
      ) : (
        <ArticlesContent data={articles} />
      )}
    </div>
  )
}
