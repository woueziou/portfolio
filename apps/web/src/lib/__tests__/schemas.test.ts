import { describe, expect, it } from 'vitest'
import {
  createArticleSchema,
  deleteArticleSchema,
  publishArticleSchema,
  saveArticleContentSchema,
  updateArticleSchema,
} from '../schemas/article'
import {
  createProjectSchema,
  deleteProjectSchema,
  publishProjectSchema,
  updateProjectSchema,
} from '../schemas/project'

describe('Project Schemas', () => {
  describe('createProjectSchema', () => {
    const validProject = {
      title: 'My Project',
      description: 'A project description',
      state: 'ongoing' as const,
      project_date: '2024-01-15',
      type: ['web' as const],
      tech_stack: ['TypeScript', 'Astro'],
      slug: 'my-project',
    }

    it('accepts valid project data', () => {
      const result = createProjectSchema.safeParse(validProject)
      expect(result.success).toBe(true)
    })

    it('requires title', () => {
      const result = createProjectSchema.safeParse({ ...validProject, title: '' })
      expect(result.success).toBe(false)
    })

    it('requires description', () => {
      const result = createProjectSchema.safeParse({ ...validProject, description: '' })
      expect(result.success).toBe(false)
    })

    it('requires at least one type', () => {
      const result = createProjectSchema.safeParse({ ...validProject, type: [] })
      expect(result.success).toBe(false)
    })

    it('requires at least one tech', () => {
      const result = createProjectSchema.safeParse({ ...validProject, tech_stack: [] })
      expect(result.success).toBe(false)
    })

    it('validates slug format', () => {
      const result = createProjectSchema.safeParse({ ...validProject, slug: 'Invalid Slug!' })
      expect(result.success).toBe(false)
    })

    it('accepts valid slug format', () => {
      const result = createProjectSchema.safeParse({ ...validProject, slug: 'my-project-2024' })
      expect(result.success).toBe(true)
    })

    it('defaults state to ongoing', () => {
      const { state, ...rest } = validProject
      const result = createProjectSchema.safeParse(rest)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.state).toBe('ongoing')
      }
    })

    it('accepts optional URLs', () => {
      const result = createProjectSchema.safeParse({
        ...validProject,
        url: 'https://github.com/test',
        access_link: 'https://example.com',
      })
      expect(result.success).toBe(true)
    })

    it('accepts empty string URLs', () => {
      const result = createProjectSchema.safeParse({
        ...validProject,
        url: '',
        access_link: '',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('updateProjectSchema', () => {
    it('requires id', () => {
      const result = updateProjectSchema.safeParse({ title: 'Test' })
      expect(result.success).toBe(false)
    })

    it('accepts partial updates with id', () => {
      const result = updateProjectSchema.safeParse({
        id: 1,
        title: 'Updated Title',
      })
      expect(result.success).toBe(true)
    })

    it('accepts id-only update', () => {
      const result = updateProjectSchema.safeParse({ id: 1 })
      expect(result.success).toBe(true)
    })
  })

  describe('publishProjectSchema', () => {
    it('accepts valid publish data', () => {
      const result = publishProjectSchema.safeParse({ id: 1, publish: true })
      expect(result.success).toBe(true)
    })

    it('accepts unpublish data', () => {
      const result = publishProjectSchema.safeParse({ id: 1, publish: false })
      expect(result.success).toBe(true)
    })

    it('requires id', () => {
      const result = publishProjectSchema.safeParse({ publish: true })
      expect(result.success).toBe(false)
    })

    it('requires publish boolean', () => {
      const result = publishProjectSchema.safeParse({ id: 1 })
      expect(result.success).toBe(false)
    })
  })

  describe('deleteProjectSchema', () => {
    it('accepts valid id', () => {
      const result = deleteProjectSchema.safeParse({ id: 1 })
      expect(result.success).toBe(true)
    })

    it('rejects negative id', () => {
      const result = deleteProjectSchema.safeParse({ id: -1 })
      expect(result.success).toBe(false)
    })
  })
})

describe('Article Schemas', () => {
  describe('createArticleSchema', () => {
    const validArticle = {
      title: 'My Article',
      slug: 'my-article',
      status: 'draft' as const,
    }

    it('accepts valid article data', () => {
      const result = createArticleSchema.safeParse(validArticle)
      expect(result.success).toBe(true)
    })

    it('requires title', () => {
      const result = createArticleSchema.safeParse({ ...validArticle, title: '' })
      expect(result.success).toBe(false)
    })

    it('validates slug format', () => {
      const result = createArticleSchema.safeParse({ ...validArticle, slug: 'Bad Slug!' })
      expect(result.success).toBe(false)
    })

    it('defaults status to draft', () => {
      const { status, ...rest } = validArticle
      const result = createArticleSchema.safeParse(rest)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('draft')
      }
    })

    it('accepts optional project_id', () => {
      const result = createArticleSchema.safeParse({
        ...validArticle,
        project_id: 1,
      })
      expect(result.success).toBe(true)
    })

    it('accepts null project_id', () => {
      const result = createArticleSchema.safeParse({
        ...validArticle,
        project_id: null,
      })
      expect(result.success).toBe(true)
    })

    it('accepts optional content', () => {
      const result = createArticleSchema.safeParse({
        ...validArticle,
        content: { type: 'doc', content: [] },
      })
      expect(result.success).toBe(true)
    })
  })

  describe('updateArticleSchema', () => {
    it('requires id', () => {
      const result = updateArticleSchema.safeParse({ title: 'Test' })
      expect(result.success).toBe(false)
    })

    it('accepts partial updates', () => {
      const result = updateArticleSchema.safeParse({
        id: 1,
        title: 'Updated',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('publishArticleSchema', () => {
    it('accepts valid publish data', () => {
      const result = publishArticleSchema.safeParse({ id: 1, publish: true })
      expect(result.success).toBe(true)
    })

    it('rejects missing publish field', () => {
      const result = publishArticleSchema.safeParse({ id: 1 })
      expect(result.success).toBe(false)
    })
  })

  describe('deleteArticleSchema', () => {
    it('accepts valid id', () => {
      const result = deleteArticleSchema.safeParse({ id: 1 })
      expect(result.success).toBe(true)
    })
  })

  describe('saveArticleContentSchema', () => {
    it('accepts valid content save', () => {
      const result = saveArticleContentSchema.safeParse({
        id: 1,
        content: { type: 'doc', content: [] },
      })
      expect(result.success).toBe(true)
    })

    it('requires id', () => {
      const result = saveArticleContentSchema.safeParse({
        content: { type: 'doc' },
      })
      expect(result.success).toBe(false)
    })
  })
})
