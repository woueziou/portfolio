import { z } from 'zod'

/**
 * Schema for creating a new article
 */
export const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only')
    .optional(),
  content: z.any().optional(), // TipTap JSON content
  project_id: z.number().int().positive().nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
})

/**
 * Schema for updating an existing article
 */
export const updateArticleSchema = z.object({
  id: z.number().int().positive(),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only')
    .optional(),
  content: z.any().optional(), // TipTap JSON content
  project_id: z.number().int().positive().nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
})

/**
 * Schema for deleting an article
 */
export const deleteArticleSchema = z.object({
  id: z.number().int().positive(),
})

/**
 * Schema for publishing/unpublishing an article
 */
export const publishArticleSchema = z.object({
  id: z.number().int().positive(),
  publish: z.boolean(),
})

/**
 * Schema for saving article content (auto-save)
 */
export const saveArticleContentSchema = z.object({
  id: z.number().int().positive(),
  content: z.any(), // TipTap JSON content
})

export type CreateArticleInput = z.infer<typeof createArticleSchema>
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>
export type DeleteArticleInput = z.infer<typeof deleteArticleSchema>
export type PublishArticleInput = z.infer<typeof publishArticleSchema>
export type SaveArticleContentInput = z.infer<typeof saveArticleContentSchema>
