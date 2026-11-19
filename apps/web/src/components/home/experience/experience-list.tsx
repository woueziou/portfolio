import { Briefcase } from 'lucide-react'
import { type ExperienceEntry, formatPeriod } from '@/data/experience'

export function ExperienceList({ data }: { data: ExperienceEntry[] }) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Briefcase className="h-14 w-14 text-muted-foreground/20 mb-4" />
        <h3 className="text-lg font-semibold text-foreground/60">No experience yet</h3>
      </div>
    )
  }

  return (
    <ol className="w-full mx-auto space-y-10 border-l border-border pl-6 max-w-3xl">
      {data.map((entry) => (
        <li key={`${entry.company}-${entry.start}`} className="relative">
          <span className="absolute -left-[1.85rem] top-2 h-2.5 w-2.5 rounded-full bg-primary" />
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
            <h3 className="text-lg font-semibold">
              {entry.role} · {entry.company}
            </h3>
            <p className="text-sm text-muted-foreground">
              <time dateTime={entry.start}>{formatPeriod(entry)}</time>
              {entry.type ? ` · ${entry.type}` : ''}
            </p>
          </div>
          {entry.summary && <p className="mt-1 text-sm text-muted-foreground">{entry.summary}</p>}
          {entry.highlights && entry.highlights.length > 0 && (
            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
              {entry.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {entry.link && (
            <a
              href={entry.link.href}
              className="mt-2 inline-block text-sm underline underline-offset-4 hover:text-primary transition-colors"
            >
              {entry.link.label}
            </a>
          )}
        </li>
      ))}
    </ol>
  )
}
