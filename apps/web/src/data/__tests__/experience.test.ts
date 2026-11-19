import { describe, expect, it } from 'vitest'
import { experience, formatMonth, formatPeriod } from '../experience'

describe('experience', () => {
  it('formats a year-month', () => {
    expect(formatMonth('2021-09')).toBe('Sep 2021')
    expect(formatMonth('2026')).toBe('2026')
  })

  it('formats an ongoing and a closed period', () => {
    expect(formatPeriod({ start: '2021-09' })).toBe('Sep 2021 – Present')
    expect(formatPeriod({ start: '2019-03', end: '2021-08' })).toBe('Mar 2019 – Aug 2021')
  })

  it('lists entries most recent first', () => {
    const starts = experience.map((e) => e.start)
    expect([...starts].sort().reverse()).toEqual(starts)
  })
})
