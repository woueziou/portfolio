import type { Database } from '@repo/shared'
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

export default function ProjectClient({ data }: { data: Project[] }) {
  const grouped = groupByYear(data)
  // Years descending (most recent first)
  const years = Array.from(grouped.keys()).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="w-full">
      {years.map((year, yi) => {
        const projects = grouped.get(year)!
        return (
          <section key={year} className={cn('relative', yi < years.length - 1 && 'mb-12')}>
            {/* ── Year header with timeline dot ── */}
            <div className="mb-8 flex items-center gap-4">
              {/* Dot + label */}
              <div className="flex shrink-0 items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-background">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="text-2xl font-bold tracking-tight text-foreground/80">
                  {year}
                </span>
              </div>
              {/* Horizontal rule extending to the right */}
              <div className="h-px flex-1 bg-border/60" />
            </div>

            {/* ── Project grid ── */}
            <div
              className={cn(
                'grid md:grid-cols-3 w-full',
                'grid-cols-1',
                'place-content-center',
              )}
            >
              {projects.map((item) => (
                <ProjectItem item={item} key={item.id} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
