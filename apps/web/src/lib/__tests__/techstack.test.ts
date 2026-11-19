import { describe, expect, it } from 'vitest'
import { dedupeTechs, toTechBadge } from '../techstack'

describe('toTechBadge', () => {
  it('maps aliases to the canonical key and label', () => {
    expect(toTechBadge('Next')).toEqual({ key: 'next', label: 'Next.js' })
    expect(toTechBadge('next.js')).toEqual({ key: 'next', label: 'Next.js' })
    expect(toTechBadge('Postgres')).toEqual({ key: 'postgres', label: 'PostgreSQL' })
  })

  it('keeps unknown names as typed, with a letters-and-digits key', () => {
    expect(toTechBadge('Payload CMS')).toEqual({ key: 'payloadcms', label: 'Payload CMS' })
  })
})

describe('dedupeTechs', () => {
  it('drops duplicates across aliases and keeps first-seen order', () => {
    const result = dedupeTechs(['Next', 'Supabase', 'Next.js', 'Postgres', 'PostgreSQL'])
    expect(result.map((b) => b.label)).toEqual(['Next.js', 'Supabase', 'PostgreSQL'])
  })

  it('ignores blank entries', () => {
    expect(dedupeTechs(['', '  ', 'Dart'])).toEqual([{ key: 'dart', label: 'Dart' }])
  })
})
