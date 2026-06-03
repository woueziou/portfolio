import { ActionError, defineAction } from 'astro:actions'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const updateProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  title: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
  socials: z.record(z.string()).optional(),
  skills: z.array(z.string()).optional(),
})

export const profiles = {
  get: defineAction({
    handler: async (_, context) => {
      const supabase = createSupabaseServerClient(context.cookies)

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new ActionError({ message: 'Unauthorized', code: 'UNAUTHORIZED' })
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error || !profile) {
        throw new ActionError({ message: 'Profile not found', code: 'NOT_FOUND' })
      }

      return { profile }
    },
  }),

  update: defineAction({
    accept: 'json',
    input: updateProfileSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context.cookies)

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new ActionError({ message: 'Unauthorized', code: 'UNAUTHORIZED' })
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .update({
          first_name: input.first_name,
          last_name: input.last_name,
          title: input.title || '',
          description: input.description || null,
          avatar_url: input.avatar_url || null,
          socials: input.socials || {},
          skills: input.skills || [],
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        throw new ActionError({ message: error.message, code: 'INTERNAL_SERVER_ERROR' })
      }

      return { profile }
    },
  }),
}
