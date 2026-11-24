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
    highlights: [
      'Lead developer on Kwabo (kwabo.io), the ticketing platform for CAF 2026 (Cotonou, Nov 16–17), with more than 3,000 participants handled.',
      'Lead developer on Trida Platform (in design) and on Aqointa (aqointa.com).',
    ],
  },
  {
    company: 'Strant Solutions',
    role: 'Lead Software Developer',
    start: '2024',
    summary: 'USA · Remote',
    highlights: [
      'Built the first versions (MVPs) of the applications.',
      'Tracked how well deployments worked and folded user feedback into new features.',
      'Supervised the quality of the code the team produced (optimization, maintainability).',
      'Validated later versions (V2) against business needs and functional tests.',
    ],
  },
  {
    company: 'BBLY Analytics',
    role: 'Senior Lead Developer',
    start: '2022',
    end: '2026',
    summary: 'Pennsylvania, USA · Remote',
    highlights: [
      'Owned the quality of the web and mobile development lifecycle: every deliverable was tested, optimized and deployed through automated CI/CD pipelines, which lowered regression risk and sped up production releases.',
    ],
  },
  {
    company: 'ASKY',
    role: 'Senior Operational Software Engineer',
    start: '2021-09',
    summary: 'The Panafrican Airline · Lomé, Togo',
    highlights: [
      'Handled BSP sales files: decryption, archiving and distribution to partners and internal systems.',
      'Built web and mobile applications for a range of business needs.',
      'Trained and supported users of the deployed applications.',
    ],
    link: { label: 'Travel Manager', href: '/projects/travel-manager' },
  },
  {
    company: 'Freelance',
    role: 'Software Developer',
    start: '2020-03',
    end: '2022-07',
    highlights: [
      'Built custom software for clients in a range of sectors.',
      'Optimized backend performance and server configuration to reduce load.',
      'Designed and maintained reliable, highly available REST APIs.',
    ],
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
