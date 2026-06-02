import { defineAction, ActionError } from 'astro:actions'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  createProjectSchema,
  updateProjectSchema,
  publishProjectSchema,
  deleteProjectSchema,
} from '@/lib/schemas/project'
import { generateSlug, makeUniqueSlug } from '@/lib/slug'

export const projects = {
  create: defineAction({
    accept: 'json',
    input: createProjectSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context.cookies)

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new ActionError({
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        })
      }

      // Generate slug if not provided
      let slug = input.slug || generateSlug(input.title)

      // Check slug uniqueness
      const { data: existingProject } = await supabase
        .from('projects')
        .select('slug')
        .eq('slug', slug)
        .single()

      if (existingProject) {
        const { data: existingSlugs } = await supabase
          .from('projects')
          .select('slug')
          .like('slug', `${slug}%`)

        slug = makeUniqueSlug(
          slug,
          existingSlugs?.map((p) => p.slug) || []
        )
      }

      // Insert project
      const { data: project, error: insertError } = await supabase
        .from('projects')
        .insert({
          title: input.title,
          description: input.description,
          main_image_url: input.main_image_url || null,
          url: input.url || null,
          access_link: input.access_link || null,
          state: input.state,
          project_date: input.project_date || null,
          type: input.type,
          tech_stack: input.tech_stack,
          slug,
          user_id: user.id,
          publication_status: 'draft',
        })
        .select()
        .single()

      if (insertError) {
        throw new ActionError({
          message: insertError.message,
          code: 'INTERNAL_SERVER_ERROR',
        })
      }

      return { project }
    },
  }),

  update: defineAction({
    accept: 'json',
    input: updateProjectSchema,
    handler: async ({ id, ...updates }, context) => {
      const supabase = createSupabaseServerClient(context.cookies)

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new ActionError({
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        })
      }

      // Check ownership
      const { data: existingProject, error: fetchError } = await supabase
        .from('projects')
        .select('user_id, slug')
        .eq('id', id)
        .single()

      if (fetchError || !existingProject) {
        throw new ActionError({
          message: 'Project not found',
          code: 'NOT_FOUND',
        })
      }

      if (existingProject.user_id !== user.id) {
        throw new ActionError({
          message: 'You can only edit your own projects',
          code: 'FORBIDDEN',
        })
      }

      // Handle slug update
      let slug = updates.slug
      if (slug && slug !== existingProject.slug) {
        // Check new slug uniqueness
        const { data: slugCheck } = await supabase
          .from('projects')
          .select('slug')
          .eq('slug', slug)
          .neq('id', id)
          .single()

        if (slugCheck) {
          throw new ActionError({
            message: 'Slug already in use',
            code: 'CONFLICT',
          })
        }
      }

      // Update project
      const { data: project, error: updateError } = await supabase
        .from('projects')
        .update({
          ...updates,
          slug: slug || existingProject.slug,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        throw new ActionError({
          message: updateError.message,
          code: 'INTERNAL_SERVER_ERROR',
        })
      }

      return { project }
    },
  }),

  delete: defineAction({
    accept: 'json',
    input: deleteProjectSchema,
    handler: async ({ id }, context) => {
      const supabase = createSupabaseServerClient(context.cookies)

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new ActionError({
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        })
      }

      // Check ownership
      const { data: existingProject } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', id)
        .single()

      if (!existingProject) {
        throw new ActionError({
          message: 'Project not found',
          code: 'NOT_FOUND',
        })
      }

      if (existingProject.user_id !== user.id) {
        throw new ActionError({
          message: 'You can only delete your own projects',
          code: 'FORBIDDEN',
        })
      }

      // Delete project
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        throw new ActionError({
          message: deleteError.message,
          code: 'INTERNAL_SERVER_ERROR',
        })
      }

      return { success: true }
    },
  }),

  publish: defineAction({
    accept: 'json',
    input: publishProjectSchema,
    handler: async ({ id, publish }, context) => {
      const supabase = createSupabaseServerClient(context.cookies)

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new ActionError({
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        })
      }

      // Check ownership
      const { data: existingProject } = await supabase
        .from('projects')
        .select('user_id, publication_status, published_at')
        .eq('id', id)
        .single()

      if (!existingProject) {
        throw new ActionError({
          message: 'Project not found',
          code: 'NOT_FOUND',
        })
      }

      if (existingProject.user_id !== user.id) {
        throw new ActionError({
          message: 'You can only publish your own projects',
          code: 'FORBIDDEN',
        })
      }

      // Determine new status
      const newStatus = publish ? 'published' : 'draft'

      // Set published_at only on first publish
      const publishedAt =
        publish && !existingProject.published_at
          ? new Date().toISOString()
          : existingProject.published_at

      // Update project
      const { data: project, error: updateError } = await supabase
        .from('projects')
        .update({
          publication_status: newStatus,
          published_at: publishedAt,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        throw new ActionError({
          message: updateError.message,
          code: 'INTERNAL_SERVER_ERROR',
        })
      }

      return { project }
    },
  }),

  uploadImage: defineAction({
    accept: 'form',
    input: z.instanceof(FormData),
    handler: async (formData, context) => {
      const supabase = createSupabaseServerClient(context.cookies)

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new ActionError({
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        })
      }

      const file = formData.get('file') as File
      if (!file) {
        throw new ActionError({
          message: 'No file provided',
          code: 'BAD_REQUEST',
        })
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        throw new ActionError({
          message: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP',
          code: 'BAD_REQUEST',
        })
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        throw new ActionError({
          message: 'File too large. Maximum size: 5MB',
          code: 'BAD_REQUEST',
        })
      }

      // Generate unique filename
      const ext = file.name.split('.').pop()
      const filename = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('content-images')
        .upload(filename, file, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        throw new ActionError({
          message: uploadError.message,
          code: 'INTERNAL_SERVER_ERROR',
        })
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('content-images')
        .getPublicUrl(data.path)

      return { url: urlData.publicUrl, path: data.path }
    },
  }),

  getById: defineAction({
    accept: 'json',
    input: z.object({
      id: z.number().int().positive(),
    }),
    handler: async ({ id }, context) => {
      const supabase = createSupabaseServerClient(context.cookies)

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new ActionError({
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        })
      }

      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error || !project) {
        throw new ActionError({
          message: 'Project not found',
          code: 'NOT_FOUND',
        })
      }

      return { project }
    },
  }),

  list: defineAction({
    accept: 'json',
    input: z.object({
      page: z.number().int().positive().default(1),
      perPage: z.number().int().positive().max(100).default(10),
      status: z.enum(['draft', 'published', 'archived']).optional(),
    }),
    handler: async ({ page, perPage, status }, context) => {
      const supabase = createSupabaseServerClient(context.cookies)

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new ActionError({
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        })
      }

      const offset = (page - 1) * perPage

      let query = supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + perPage - 1)

      if (status) {
        query = query.eq('publication_status', status)
      }

      const { data: projects, error, count } = await query

      if (error) {
        throw new ActionError({
          message: error.message,
          code: 'INTERNAL_SERVER_ERROR',
        })
      }

      return {
        projects: projects || [],
        total: count || 0,
        page,
        perPage,
        totalPages: Math.ceil((count || 0) / perPage),
      }
    },
  }),
}
