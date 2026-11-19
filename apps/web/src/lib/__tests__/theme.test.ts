import { describe, expect, it } from 'vitest'
import { nextPreference, parsePreference, resolveTheme } from '../theme'

describe('theme', () => {
  it('defaults to the device theme for missing or unknown values', () => {
    expect(parsePreference(null)).toBe('system')
    expect(parsePreference('auto')).toBe('system')
    expect(parsePreference('dark')).toBe('dark')
    expect(parsePreference('light')).toBe('light')
  })

  it('follows the device only in system mode', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('cycles system, light, dark', () => {
    expect(nextPreference('system')).toBe('light')
    expect(nextPreference('light')).toBe('dark')
    expect(nextPreference('dark')).toBe('system')
  })
})
