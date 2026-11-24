export interface ExperienceEntry {
  company: string
  role: string
  /** Employment type shown next to the period. Hidden when omitted. */
  type?: string
  /** "YYYY-MM", or "YYYY" when the month is unknown. */
  start: string
  /** Same format; omit while the position is ongoing. */
  end?: string
  summary?: string
  /** 2-3 short, concrete achievements. Hidden while empty. */
  highlights?: string[]
  /** Optional link to a related page on the site. */
  link?: { label: string; href: string }
}

// Most recent first. Edit this file, the page is rebuilt on deploy.
export const experience: ExperienceEntry[] = [
  {
    company: 'Trida',
    role: 'Consultant · Lead Developer',
    type: 'Consulting',
    start: '2026',
  },
  {
    company: 'ASKY',
    role: 'Senior Operational Software Engineer',
    start: '2021-09',
    summary: 'Airline software.',
    link: { label: 'Travel Manager', href: '/projects/travel-manager' },
  },
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2021-09" -> "Sep 2021", "2026" -> "2026" (no Date parsing). */
export function formatMonth(value: string): string {
  const [year, month] = value.split('-')
  if (!month) return year
  return `${MONTHS[Number(month) - 1] ?? ''} ${year}`.trim()
}

export function formatPeriod(entry: Pick<ExperienceEntry, 'start' | 'end'>): string {
  return `${formatMonth(entry.start)} – ${entry.end ? formatMonth(entry.end) : 'Present'}`
}
