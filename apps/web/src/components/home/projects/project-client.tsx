import type { Database } from '@repo/shared'
import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/utils/formater'
import { ProjectItem } from './project-item'

type Project = Database['public']['Tables']['projects']['Row']

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

/** Extract the unique type values across all projects, sorted. */
function getAllTypes(projects: Project[]): string[] {
  const set = new Set<string>()
  for (const p of projects) {
    for (const t of p.type) {
      set.add(t)
    }
  }
  return Array.from(set).sort()
}

export default function ProjectClient({ data }: { data: Project[] }) {
  const allTypes = useMemo(() => getAllTypes(data), [data])

  // Read initial type from URL search params
  const [activeType, setActiveType] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    return params.get('type') || null
  })

  // Sync activeType → URL search params
  useEffect(() => {
    const url = new URL(window.location.href)
    if (activeType) {
      url.searchParams.set('type', activeType)
    } else {
      url.searchParams.delete('type')
    }
    window.history.replaceState({}, '', url.pathname + url.search)
  }, [activeType])

  // Filter projects by selected type
  const filtered = useMemo(() => {
    if (!activeType) return data
    return data.filter((p) =>
      p.type.includes(activeType as Database['public']['Enums']['project_type']),
    )
  }, [data, activeType])

  const grouped = groupByYear(filtered)
  const years = Array.from(grouped.keys()).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="w-full">
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
      {years.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          No {activeType} projects yet.
        </p>
      ) : (
        years.map((year, yi) => {
          const projects = grouped.get(year)!
          return (
            <section key={year} className={cn('relative', yi < years.length - 1 && 'mb-12')}>
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
                className={cn('grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 place-content-center gap-6')}
              >
                {projects.map((item) => (
                  <ProjectItem item={item} key={item.id} />
                ))}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}
