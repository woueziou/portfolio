import { defineAction, ActionError } from 'astro:actions'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const auth = {
  login: defineAction({
    accept: 'json',
    input: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
    }),
    handler: async ({ email, password }, context) => {
      const supabase = createSupabaseServerClient(context.cookies)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new ActionError({
          message: error.message,
          code: 'UNAUTHORIZED',
        })
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      }
    },
  }),

  signOut: defineAction({
    handler: async (_, context) => {
      const supabase = createSupabaseServerClient(context.cookies)

      const { error } = await supabase.auth.signOut()

      if (error) {
        throw new ActionError({
          message: error.message,
          code: 'INTERNAL_SERVER_ERROR',
        })
      }

      return { success: true }
    },
  }),

  getUser: defineAction({
    handler: async (_, context) => {
      const supabase = createSupabaseServerClient(context.cookies)

      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        return { user: null }
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
        },
      }
    },
  }),
}
