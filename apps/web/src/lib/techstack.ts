export interface TechBadge {
  /** Canonical key, also used to pick the icon. */
  key: string
  /** Label shown on the badge. */
  label: string
}

// Normalized token (lowercase, letters and digits only) -> canonical badge.
const ALIASES: Record<string, TechBadge> = {
  next: { key: 'next', label: 'Next.js' },
  nextjs: { key: 'next', label: 'Next.js' },
  postgres: { key: 'postgres', label: 'PostgreSQL' },
  postgresql: { key: 'postgres', label: 'PostgreSQL' },
  node: { key: 'node', label: 'Node.js' },
  nodejs: { key: 'node', label: 'Node.js' },
  ts: { key: 'typescript', label: 'TypeScript' },
  typescript: { key: 'typescript', label: 'TypeScript' },
  js: { key: 'javascript', label: 'JavaScript' },
  javascript: { key: 'javascript', label: 'JavaScript' },
  react: { key: 'react', label: 'React' },
  reactjs: { key: 'react', label: 'React' },
  nuxt: { key: 'nuxt', label: 'Nuxt' },
  nuxtjs: { key: 'nuxt', label: 'Nuxt' },
  mongo: { key: 'mongodb', label: 'MongoDB' },
  mongodb: { key: 'mongodb', label: 'MongoDB' },
  dotnet: { key: 'dotnet', label: '.NET' },
  net: { key: 'dotnet', label: '.NET' },
}

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/** Resolve one raw tech name to its canonical badge. */
export function toTechBadge(name: string): TechBadge {
  const trimmed = name.trim()
  const key = normalize(trimmed)
  return ALIASES[key] ?? { key, label: trimmed }
}

/** Canonicalize and drop duplicates (e.g. "Next" + "Next.js"), keeping first-seen order. */
export function dedupeTechs(names: string[]): TechBadge[] {
  const seen = new Set<string>()
  const badges: TechBadge[] = []
  for (const name of names) {
    if (!name.trim()) continue
    const badge = toTechBadge(name)
    if (seen.has(badge.key)) continue
    seen.add(badge.key)
    badges.push(badge)
  }
  return badges
}
