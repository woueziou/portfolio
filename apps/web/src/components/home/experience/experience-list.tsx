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
    <ol className="w-full">
      {data.map((entry) => (
        <li
          key={`${entry.company}-${entry.start}`}
          className="grid grid-cols-1 gap-3 md:grid-cols-[16rem_1fr] md:gap-10 border-t border-border/60 py-8 first:border-t-0 first:pt-0"
        >
          {/* ── Period ── */}
          <div className="flex items-start gap-3">
            <span className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background">
              <span className="h-2 w-2 rounded-full bg-primary" />
            </span>
            <div>
              <time dateTime={entry.start} className="block text-2xl font-bold tracking-tight text-foreground/80">
                {formatPeriod(entry)}
              </time>
              {entry.type && <p className="mt-1 text-sm text-muted-foreground">{entry.type}</p>}
            </div>
          </div>

          {/* ── Position ── */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold">{entry.company}</h3>
            <p className="text-base font-medium text-muted-foreground">{entry.role}</p>
            {entry.summary && <p className="text-sm leading-relaxed">{entry.summary}</p>}
            {entry.highlights && entry.highlights.length > 0 && (
              <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed">
                {entry.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {entry.link && (
              <a
                href={entry.link.href}
                className="inline-block text-sm font-medium underline underline-offset-4 hover:text-primary transition-colors"
              >
                {entry.link.label}
              </a>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
