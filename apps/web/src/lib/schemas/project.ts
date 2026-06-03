import { z } from 'zod'

// Project type enum matching the database (all DB values)
export const projectTypeEnum = z.enum([
  'web',
  'mobile',
  'script',
  'backend',
  'infra',
  'llm',
  'ai',
  'desktop',
  'api',
  'library',
  'other',
])

// Publication status enum
export const publicationStatusEnum = z.enum(['draft', 'published', 'archived'])

// Project state enum (lifecycle)
export const projectStateEnum = z.enum(['ongoing', 'finished', 'production'])

// Create project schema
export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  main_image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  access_link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  state: projectStateEnum.default('ongoing'),
  project_date: z.string().optional(),
  type: z.array(projectTypeEnum).min(1, 'Select at least one project type'),
  tech_stack: z.array(z.string()).min(1, 'Add at least one technology'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens (e.g., my-project)'),
})

// Update project schema (all fields optional except id)
export const updateProjectSchema = z.object({
  id: z.number().int().positive('Invalid project ID'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  main_image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  access_link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  state: projectStateEnum.optional(),
  project_date: z.string().optional(),
  type: z.array(projectTypeEnum).min(1, 'Select at least one project type').optional(),
  tech_stack: z.array(z.string()).min(1, 'Add at least one technology').optional(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens')
    .optional(),
})

// Publish/unpublish schema
export const publishProjectSchema = z.object({
  id: z.number().int().positive('Invalid project ID'),
  publish: z.boolean(),
})

// Delete project schema
export const deleteProjectSchema = z.object({
  id: z.number().int().positive('Invalid project ID'),
})

// Type exports
export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type PublishProjectInput = z.infer<typeof publishProjectSchema>
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>
export type ProjectType = z.infer<typeof projectTypeEnum>
export type PublicationStatus = z.infer<typeof publicationStatusEnum>
export type ProjectState = z.infer<typeof projectStateEnum>
