import { ActionError, defineAction } from 'astro:actions'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const updateSiteConfigSchema = z.object({
  site_title: z.string().min(1, 'Site title is required').max(200).optional(),
  site_tagline: z.string().max(500).optional().nullable(),
  social_links: z.record(z.string(), z.string()).optional(),
  seo_description: z.string().max(500).optional().nullable(),
  seo_og_image: z.string().url().optional().nullable().or(z.literal('')),
})

export const siteConfig = {
  get: defineAction({
    handler: async (_, context) => {
      const supabase = createSupabaseServerClient(context.cookies)

      const { data: configs, error } = await supabase.from('site_config').select('*').limit(1)

      if (error) {
        throw new ActionError({ message: error.message, code: 'INTERNAL_SERVER_ERROR' })
      }

      if (!configs || configs.length === 0) {
        // Create default config if none exists
        const { data: newConfig, error: insertError } = await supabase
          .from('site_config')
          .insert({
            site_title: 'Portfolio',
            site_tagline: null,
            social_links: {},
            seo_description: null,
            seo_og_image: null,
          })
          .select()
          .single()

        if (insertError) {
          throw new ActionError({ message: insertError.message, code: 'INTERNAL_SERVER_ERROR' })
        }

        return { config: newConfig }
      }

      return { config: configs[0] }
    },
  }),

  update: defineAction({
    accept: 'json',
    input: updateSiteConfigSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context.cookies)

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new ActionError({ message: 'Unauthorized', code: 'UNAUTHORIZED' })
      }

      // First, get the existing config
      const { data: existingConfigs, error: fetchError } = await supabase
        .from('site_config')
        .select('id')
        .limit(1)

      if (fetchError) {
        throw new ActionError({ message: fetchError.message, code: 'INTERNAL_SERVER_ERROR' })
      }

      let configId: number

      if (!existingConfigs || existingConfigs.length === 0) {
        // Create new config
        const { data: newConfig, error: insertError } = await supabase
          .from('site_config')
          .insert({
            site_title: input.site_title || 'Portfolio',
            site_tagline: input.site_tagline ?? null,
            social_links: input.social_links || {},
            seo_description: input.seo_description ?? null,
            seo_og_image: input.seo_og_image || null,
          })
          .select('id')
          .single()

        if (insertError) {
          throw new ActionError({ message: insertError.message, code: 'INTERNAL_SERVER_ERROR' })
        }

        configId = newConfig.id
      } else {
        configId = existingConfigs[0].id
      }

      // Update the config
      const updateData: Record<string, unknown> = {}
      if (input.site_title !== undefined) updateData.site_title = input.site_title
      if (input.site_tagline !== undefined) updateData.site_tagline = input.site_tagline
      if (input.social_links !== undefined) updateData.social_links = input.social_links
      if (input.seo_description !== undefined) updateData.seo_description = input.seo_description
      if (input.seo_og_image !== undefined) updateData.seo_og_image = input.seo_og_image

      const { data: config, error: updateError } = await supabase
        .from('site_config')
        .update(updateData)
        .eq('id', configId)
        .select()
        .single()

      if (updateError) {
        throw new ActionError({ message: updateError.message, code: 'INTERNAL_SERVER_ERROR' })
      }

      return { config }
    },
  }),
}
