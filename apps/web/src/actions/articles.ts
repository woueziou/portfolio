import { ActionError, defineAction } from 'astro:actions'
import { z } from 'zod'
import { renderTiptapToHtml } from '@/lib/html-renderer'
import { getReadingTimeMinutes } from '@/lib/reading-time'
import {
  createArticleSchema,
  deleteArticleSchema,
  publishArticleSchema,
  saveArticleContentSchema,
  updateArticleSchema,
} from '@/lib/schemas/article'
import { generateSlug, makeUniqueSlug } from '@/lib/slug'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const articles = {
  /**
   * Create a new article
   */
  create: defineAction({
    accept: 'json',
    input: createArticleSchema,
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
      const { data: existingArticle } = await supabase
        .from('articles')
        .select('slug')
        .eq('slug', slug)
        .single()

      if (existingArticle) {
        const { data: existingSlugs } = await supabase
          .from('articles')
          .select('slug')
          .like('slug', `${slug}%`)

        slug = makeUniqueSlug(slug, existingSlugs?.map((a) => a.slug) || [])
      }

      // Calculate reading time and render HTML if content provided
      const readingTime = input.content ? getReadingTimeMinutes(input.content) : null
      const contentHtml = input.content ? renderTiptapToHtml(input.content) : null

      // Insert article
      const { data: article, error: insertError } = await supabase
        .from('articles')
        .insert({
          title: input.title,
          slug,
          content: input.content || null,
          content_html: contentHtml,
          project_id: input.project_id || null,
          status: input.status || 'draft',
          reading_time_minutes: readingTime,
          user_id: user.id,
        })
        .select()
        .single()

      if (insertError) {
        throw new ActionError({
          message: insertError.message,
          code: 'INTERNAL_SERVER_ERROR',
        })
      }

      return { article }
    },
  }),

  /**
   * Update an existing article
   */
  update: defineAction({
    accept: 'json',
    input: updateArticleSchema,
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

      // Check ownership
      const { data: existingArticle, error: fetchError } = await supabase
        .from('articles')
        .select('user_id, slug')
        .eq('id', id)
        .single()

      if (fetchError || !existingArticle) {
        throw new ActionError({
          message: 'Article not found',
          code: 'NOT_FOUND',
        })
      }

      if (existingArticle.user_id !== user.id) {
        throw new ActionError({
          message: 'You can only edit your own articles',
          code: 'FORBIDDEN',
        })
      }

      // Handle slug update
      const slug = updates.slug
      if (slug && slug !== existingArticle.slug) {
        // Check new slug uniqueness
        const { data: slugCheck } = await supabase
          .from('articles')
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

      // Recalculate reading time and render HTML if content changed
      let readingTime: number | undefined
      let contentHtml: string | undefined
      if (updates.content !== undefined) {
        readingTime = updates.content ? getReadingTimeMinutes(updates.content) : undefined
        contentHtml = updates.content ? renderTiptapToHtml(updates.content) : undefined
      }

      // Update article
      const { data: article, error: updateError } = await supabase
        .from('articles')
        .update({
          ...updates,
          slug: slug || existingArticle.slug,
          ...(readingTime !== undefined && {
            reading_time_minutes: readingTime,
          }),
          ...(contentHtml !== undefined && { content_html: contentHtml }),
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

      return { article }
    },
  }),

  /**
   * Delete an article
   */
  delete: defineAction({
    accept: 'json',
    input: deleteArticleSchema,
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

      // Check ownership
      const { data: existingArticle } = await supabase
        .from('articles')
        .select('user_id')
        .eq('id', id)
        .single()

      if (!existingArticle) {
        throw new ActionError({
          message: 'Article not found',
          code: 'NOT_FOUND',
        })
      }

      if (existingArticle.user_id !== user.id) {
        throw new ActionError({
          message: 'You can only delete your own articles',
          code: 'FORBIDDEN',
        })
      }

      // Delete article
      const { error: deleteError } = await supabase
        .from('articles')
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

  /**
   * Publish or unpublish an article
   */
  publish: defineAction({
    accept: 'json',
    input: publishArticleSchema,
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

      // Check ownership
      const { data: existingArticle } = await supabase
        .from('articles')
        .select('user_id, status, published_at')
        .eq('id', id)
        .single()

      if (!existingArticle) {
        throw new ActionError({
          message: 'Article not found',
          code: 'NOT_FOUND',
        })
      }

      if (existingArticle.user_id !== user.id) {
        throw new ActionError({
          message: 'You can only publish your own articles',
          code: 'FORBIDDEN',
        })
      }

      // Determine new status
      const newStatus = publish ? 'published' : 'draft'

      // Set published_at only on first publish
      const publishedAt =
        publish && !existingArticle.published_at
          ? new Date().toISOString()
          : existingArticle.published_at

      // Update article
      const { data: article, error: updateError } = await supabase
        .from('articles')
        .update({
          status: newStatus,
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

      return { article }
    },
  }),

  /**
   * Save article content (for auto-save)
   */
  saveContent: defineAction({
    accept: 'json',
    input: saveArticleContentSchema,
    handler: async ({ id, content }, context) => {
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

      // Check ownership
      const { data: existingArticle } = await supabase
        .from('articles')
        .select('user_id')
        .eq('id', id)
        .single()

      if (!existingArticle) {
        throw new ActionError({
          message: 'Article not found',
          code: 'NOT_FOUND',
        })
      }

      if (existingArticle.user_id !== user.id) {
        throw new ActionError({
          message: 'You can only edit your own articles',
          code: 'FORBIDDEN',
        })
      }

      // Calculate reading time and render HTML
      const readingTime = content ? getReadingTimeMinutes(content) : null
      const contentHtml = content ? renderTiptapToHtml(content) : null

      // Update content
      const { data: article, error: updateError } = await supabase
        .from('articles')
        .update({
          content,
          content_html: contentHtml,
          reading_time_minutes: readingTime,
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

      return { article }
    },
  }),

  /**
   * Get article by ID
   */
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

      const { data: article, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error || !article) {
        throw new ActionError({
          message: 'Article not found',
          code: 'NOT_FOUND',
        })
      }

      return { article }
    },
  }),

  /**
   * List articles with pagination
   */
  list: defineAction({
    accept: 'json',
    input: z.object({
      page: z.number().int().positive().default(1),
      perPage: z.number().int().positive().max(100).default(10),
      status: z.enum(['draft', 'published', 'archived']).optional(),
      projectId: z.number().int().positive().optional(),
    }),
    handler: async ({ page, perPage, status, projectId }, context) => {
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
        .from('articles')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + perPage - 1)

      if (status) {
        query = query.eq('status', status)
      }

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data: articles, error, count } = await query

      if (error) {
        throw new ActionError({
          message: error.message,
          code: 'INTERNAL_SERVER_ERROR',
        })
      }

      return {
        articles: articles || [],
        total: count || 0,
        page,
        perPage,
        totalPages: Math.ceil((count || 0) / perPage),
      }
    },
  }),
}
