import { describe, expect, it } from 'vitest'

/**
 * Tests for JSON-LD schema generation logic used in project detail pages.
 * These test the schema structure that would be output to the page.
 */

interface Project {
  title: string | null
  description: string | null
  url: string | null
  published_at: string | null
}

interface Article {
  title: string
  published_at: string | null
  created_at: string
  reading_time_minutes: number | null
  content_html: string | null
}

function buildProjectJsonLd(project: Project) {
  const projectTitle = project.title ?? 'Untitled Project'
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: projectTitle,
    description: project.description ?? '',
    url: project.url || undefined,
    applicationCategory: 'WebApplication',
    datePublished: project.published_at || undefined,
    author: {
      '@type': 'Person',
      name: 'Taas S. Ekpaye',
    },
  }
}

function buildArticleJsonLd(article: Article, projectTitle: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: article.title,
    datePublished: article.published_at || article.created_at,
    author: {
      '@type': 'Person',
      name: 'Taas S. Ekpaye',
    },
    isPartOf: {
      '@type': 'SoftwareApplication',
      name: projectTitle,
    },
    wordCount: article.content_html ? article.content_html.split(/\s+/).length : undefined,
    timeRequired: article.reading_time_minutes ? `PT${article.reading_time_minutes}M` : undefined,
  }
}

describe('Project JSON-LD Schema', () => {
  it('generates valid SoftwareApplication schema', () => {
    const project: Project = {
      title: 'My Portfolio',
      description: 'A portfolio website',
      url: 'https://example.com',
      published_at: '2024-01-15T00:00:00Z',
    }

    const schema = buildProjectJsonLd(project)

    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('SoftwareApplication')
    expect(schema.name).toBe('My Portfolio')
    expect(schema.description).toBe('A portfolio website')
    expect(schema.url).toBe('https://example.com')
    expect(schema.datePublished).toBe('2024-01-15T00:00:00Z')
    expect(schema.author).toEqual({
      '@type': 'Person',
      name: 'Taas S. Ekpaye',
    })
  })

  it('handles null title gracefully', () => {
    const project: Project = {
      title: null,
      description: null,
      url: null,
      published_at: null,
    }

    const schema = buildProjectJsonLd(project)
    expect(schema.name).toBe('Untitled Project')
    expect(schema.description).toBe('')
    expect(schema.url).toBeUndefined()
    expect(schema.datePublished).toBeUndefined()
  })

  it('omits undefined fields from JSON-LD output', () => {
    const project: Project = {
      title: 'Test',
      description: 'Desc',
      url: null,
      published_at: null,
    }

    const schema = buildProjectJsonLd(project)
    const json = JSON.stringify(schema)
    const parsed = JSON.parse(json)

    expect(parsed.url).toBeUndefined()
    expect(parsed.datePublished).toBeUndefined()
  })
})

describe('Article JSON-LD Schema', () => {
  it('generates valid TechArticle schema', () => {
    const article: Article = {
      title: 'Getting Started with Astro',
      published_at: '2024-02-01T00:00:00Z',
      created_at: '2024-01-28T00:00:00Z',
      reading_time_minutes: 5,
      content_html: '<p>Content here with multiple words</p>',
    }

    const schema = buildArticleJsonLd(article, 'My Project')

    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('TechArticle')
    expect(schema.headline).toBe('Getting Started with Astro')
    expect(schema.datePublished).toBe('2024-02-01T00:00:00Z')
    expect(schema.timeRequired).toBe('PT5M')
    expect(schema.wordCount).toBe(5)
    expect(schema.isPartOf).toEqual({
      '@type': 'SoftwareApplication',
      name: 'My Project',
    })
  })

  it('falls back to created_at when published_at is null', () => {
    const article: Article = {
      title: 'Draft Article',
      published_at: null,
      created_at: '2024-03-15T00:00:00Z',
      reading_time_minutes: null,
      content_html: null,
    }

    const schema = buildArticleJsonLd(article, 'Test Project')
    expect(schema.datePublished).toBe('2024-03-15T00:00:00Z')
    expect(schema.timeRequired).toBeUndefined()
    expect(schema.wordCount).toBeUndefined()
  })
})

describe('Slug Route Resolution', () => {
  it('constructs correct canonical URL from slug', () => {
    const slug = 'my-awesome-project'
    const canonicalURL = new URL(`/projects/${slug}`, 'https://taas-s-ekpaye.vercel.app')

    expect(canonicalURL.pathname).toBe('/projects/my-awesome-project')
    expect(canonicalURL.href).toBe('https://taas-s-ekpaye.vercel.app/projects/my-awesome-project')
  })

  it('handles slugs with special characters', () => {
    const slug = 'project-2024-v2'
    const canonicalURL = new URL(`/projects/${slug}`, 'https://taas-s-ekpaye.vercel.app')

    expect(canonicalURL.pathname).toBe('/projects/project-2024-v2')
  })

  it('generates correct page title format', () => {
    const projectTitle = 'My Portfolio'
    const pageTitle = `${projectTitle} — Taas S. Ekpaye`

    expect(pageTitle).toBe('My Portfolio — Taas S. Ekpaye')
  })

  it('generates page description from project description', () => {
    const description =
      'A full-stack portfolio built with Astro, Supabase, and Tailwind CSS. Features include project management, article publishing, and more.'
    const pageDescription = description.slice(0, 160)

    expect(pageDescription.length).toBeLessThanOrEqual(160)
    expect(pageDescription).toContain('A full-stack portfolio')
  })
})
