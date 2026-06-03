import { ActionError, defineAction } from 'astro:actions'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const updateSiteConfigSchema = z.object({
  site_title: z.string().min(1, 'Site title is required').max(200).optional(),
  site_tagline: z.string().max(500).optional().nullable(),
  social_links: z.record(z.string()).optional(),
  seo_description: z.string().max(500).optional().nullable(),
  seo_og_image: z.string().url().optional().nullable().or(z.literal('')),
})

export const siteConfig = {
  get: defineAction({
    handler: async (_, context) => {
      const supabase = createSupabaseServerClient(context.cookies)

      const { data: config, error } = await supabase
        .from('site_config')
        .select('*')
        .eq('id', 1)
        .single()

      if (error || !config) {
        throw new ActionError({ message: 'Site config not found', code: 'NOT_FOUND' })
      }

      return { config }
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

      const { data: config, error } = await supabase
        .from('site_config')
        .update({
          site_title: input.site_title,
          site_tagline: input.site_tagline ?? null,
          social_links: input.social_links,
          seo_description: input.seo_description ?? null,
          seo_og_image: input.seo_og_image || null,
        })
        .eq('id', 1)
        .select()
        .single()

      if (error) {
        throw new ActionError({ message: error.message, code: 'INTERNAL_SERVER_ERROR' })
      }

      return { config }
    },
  }),
}
