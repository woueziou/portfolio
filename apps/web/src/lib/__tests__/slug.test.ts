import { describe, expect, it } from 'vitest'
import { generateSlug, isValidSlug, makeUniqueSlug } from '../slug'

describe('generateSlug', () => {
  it('converts text to lowercase', () => {
    expect(generateSlug('Hello World')).toBe('hello-world')
  })

  it('replaces spaces with hyphens', () => {
    expect(generateSlug('my project name')).toBe('my-project-name')
  })

  it('removes special characters', () => {
    expect(generateSlug('My Project! @#$%')).toBe('my-project')
  })

  it('replaces underscores with hyphens', () => {
    expect(generateSlug('my_project_name')).toBe('my-project-name')
  })

  it('collapses multiple hyphens', () => {
    expect(generateSlug('my---project')).toBe('my-project')
  })

  it('trims leading and trailing hyphens', () => {
    expect(generateSlug('-my-project-')).toBe('my-project')
  })

  it('handles empty string', () => {
    expect(generateSlug('')).toBe('')
  })

  it('handles string with only special chars', () => {
    expect(generateSlug('!@#$%')).toBe('')
  })

  it('preserves numbers', () => {
    expect(generateSlug('Project 2024 v2')).toBe('project-2024-v2')
  })

  it('handles complex real-world titles', () => {
    expect(generateSlug('My Portfolio — Built with Astro & Supabase!')).toBe(
      'my-portfolio-built-with-astro-supabase',
    )
  })
})

describe('isValidSlug', () => {
  it('accepts valid slugs', () => {
    expect(isValidSlug('my-project')).toBe(true)
    expect(isValidSlug('project-2024')).toBe(true)
    expect(isValidSlug('a')).toBe(true)
    expect(isValidSlug('my-awesome-project-v2')).toBe(true)
  })

  it('rejects slugs with uppercase', () => {
    expect(isValidSlug('My-Project')).toBe(false)
  })

  it('rejects slugs with spaces', () => {
    expect(isValidSlug('my project')).toBe(false)
  })

  it('rejects slugs with special characters', () => {
    expect(isValidSlug('my-project!')).toBe(false)
    expect(isValidSlug('my@project')).toBe(false)
  })

  it('rejects slugs starting with hyphen', () => {
    expect(isValidSlug('-my-project')).toBe(false)
  })

  it('rejects slugs ending with hyphen', () => {
    expect(isValidSlug('my-project-')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidSlug('')).toBe(false)
  })
})

describe('makeUniqueSlug', () => {
  it('returns base slug if not in existing list', () => {
    expect(makeUniqueSlug('my-project', ['other-project'])).toBe('my-project')
  })

  it('appends -1 if base slug exists', () => {
    expect(makeUniqueSlug('my-project', ['my-project'])).toBe('my-project-1')
  })

  it('increments counter until unique', () => {
    expect(makeUniqueSlug('my-project', ['my-project', 'my-project-1', 'my-project-2'])).toBe(
      'my-project-3',
    )
  })

  it('handles empty existing slugs list', () => {
    expect(makeUniqueSlug('my-project', [])).toBe('my-project')
  })
})
