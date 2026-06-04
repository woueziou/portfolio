import { ActionError, defineAction } from 'astro:actions'
import { z } from 'zod'
import {
  createProjectSchema,
  deleteProjectSchema,
  publishProjectSchema,
  updateProjectSchema,
} from '@/lib/schemas/project'
import { generateSlug, makeUniqueSlug } from '@/lib/slug'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Helper: sync project_techstacks from legacy tech_stack string array.
 * Inserts rows for matching techstacks, ignoring unmatched names.
 */
async function syncProjectTechstacks(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  projectId: number,
  techStack: string[],
): Promise<void> {
  if (!techStack.length) return

  // Get matching techstack IDs (lowercased comparison)
  const { data: matchingStacks } = await supabase
    .from('techstacks')
    .select('id')
    .in(
      'id',
      techStack.map((t) => t.toLowerCase()),
    )

  if (!matchingStacks?.length) return

  const newIds = matchingStacks.map((ts) => ts.id)

  // Get currently associated techstack IDs
  const { data: existing } = await supabase
    .from('project_techstacks')
    .select('techstack_id')
    .eq('project_id', projectId)

  const existingIds = existing?.map((r) => r.techstack_id) || []

  // Compute diff — only modify what changed
  const toAdd = newIds.filter((id) => !existingIds.includes(id))
  const toRemove = existingIds.filter((id) => !newIds.includes(id))

  if (!toAdd.length && !toRemove.length) return

  // INSERT new ones first — if this fails, existing relations remain untouched
  if (toAdd.length > 0) {
    const { error: insertError } = await supabase.from('project_techstacks').insert(
      toAdd.map((techstackId) => ({
        project_id: projectId,
        techstack_id: techstackId,
      })),
    )

    if (insertError) {
      console.error('Failed to insert project_techstacks:', insertError)
      return // Abort — don't delete, existing relations stay intact
    }
  }

  // DELETE removed ones only after insert succeeded
  if (toRemove.length > 0) {
    await supabase
      .from('project_techstacks')
      .delete()
      .eq('project_id', projectId)
      .in('techstack_id', toRemove)
  }
}

export const projects = {
  create: defineAction({
    accept: 'json',
    input: createProjectSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context.cookies)

      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
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

        slug = makeUniqueSlug(slug, existingSlugs?.map((p) => p.slug) || [])
      }

      // Insert project (keep legacy tech_stack for compatibility)
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

      // Sync project_techstacks relation
      await syncProjectTechstacks(supabase, project.id, input.tech_stack)

      return { project }
    },
  }),

  update: defineAction({
    accept: 'json',
    input: updateProjectSchema,
    handler: async ({ id, ...updates }, context) => {
      const supabase = createSupabaseServerClient(context.cookies)

      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new ActionError({
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        })
      }

      // Fetch slug — ownership is enforced by .eq('user_id', user.id) on the UPDATE below
      const { data: existingProject } = await supabase
        .from('projects')
        .select('slug')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (!existingProject) {
        throw new ActionError({
          message: 'Project not found',
          code: 'NOT_FOUND',
        })
      }

      // Handle slug update
      const slug = updates.slug
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

      const { tech_stack, ...projectUpdates } = updates

      // Update project
      const { data: project, error: updateError } = await supabase
        .from('projects')
        .update({
          ...projectUpdates,
          ...(tech_stack ? { tech_stack } : {}),
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

      // Sync project_techstacks relation if tech_stack was updated
      if (tech_stack) {
        await syncProjectTechstacks(supabase, id, tech_stack)
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
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new ActionError({
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        })
      }

      // Delete project — ownership is enforced by .eq('user_id', user.id)
      const { data: deleted, error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .select('id')
        .single()

      if (deleteError || !deleted) {
        throw new ActionError({
          message: 'Project not found',
          code: 'NOT_FOUND',
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
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new ActionError({
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        })
      }

      // Fetch current state — ownership is enforced by .eq('user_id', user.id)
      const { data: existingProject } = await supabase
        .from('projects')
        .select('publication_status, published_at')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (!existingProject) {
        throw new ActionError({
          message: 'Project not found',
          code: 'NOT_FOUND',
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
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
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
      const { data: urlData } = supabase.storage.from('content-images').getPublicUrl(data.path)

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

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new ActionError({
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        })
      }

      const { data: project, error } = await supabase
        .from('projects')
        .select(
          `*,
          project_techstacks(
            techstack_id,
            techstacks(id, name, icon)
          )`,
        )
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
      techstack_id: z.string().optional(),
    }),
    handler: async ({ page, perPage, status, techstack_id }, context) => {
      const supabase = createSupabaseServerClient(context.cookies)

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new ActionError({
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        })
      }

      const offset = (page - 1) * perPage

      let query = supabase
        .from('projects')
        .select(
          `*,
          project_techstacks(
            techstack_id,
            techstacks(id, name, icon)
          )`,
          { count: 'exact' },
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + perPage - 1)

      if (status) {
        query = query.eq('publication_status', status)
      }

      if (techstack_id) {
        // Filter projects by techstack via the join table
        const { data: filteredIds } = await supabase
          .from('project_techstacks')
          .select('project_id')
          .eq('techstack_id', techstack_id)

        const projectIds = filteredIds?.map((pt) => pt.project_id) || []
        if (projectIds.length > 0) {
          query = query.in('id', projectIds)
        } else {
          // No projects match this techstack, return empty
          return {
            projects: [],
            total: 0,
            page,
            perPage,
            totalPages: 0,
          }
        }
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
