import { ActionError, defineAction } from 'astro:actions'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@repo/shared'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ProfileService, ProfileServiceError } from '@/lib/services/profile'

const updateProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  title: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  avatar_url: z.string().optional(),
  socials: z.record(z.string()).optional(),
  skills: z.array(z.string()).optional(),
})

/**
 * Bootstrap a single Supabase client, authenticate, and return both
 * the client and the user id. This avoids creating two separate clients
 * (one for auth, one for queries) which can lead to mismatched auth
 * contexts and RLS-driven "no rows returned" errors.
 */
async function bootstrap(
  context: { cookies: import('astro').AstroCookies },
): Promise<{ userId: string; service: ProfileService }> {
  const supabase = createSupabaseServerClient(context.cookies) as SupabaseClient<Database>

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new ActionError({ message: 'Unauthorized', code: 'UNAUTHORIZED' })
  }

  return { userId: user.id, service: new ProfileService(supabase) }
}

export const profiles = {
  get: defineAction({
    handler: async (_, context) => {
      const { userId, service } = await bootstrap(context)

      try {
        const profile = await service.getProfile(userId)
        return { profile }
      } catch (e: unknown) {
        if (e instanceof ProfileServiceError) {
          throw new ActionError({ message: e.message, code: e.code })
        }
        throw e
      }
    },
  }),

  update: defineAction({
    accept: 'json',
    input: updateProfileSchema,
    handler: async (input, context) => {
      const { userId, service } = await bootstrap(context)

      // Only send fields that were explicitly provided.
      // Skip empty values to avoid JSONB issues and unintended null writes.
      const updateData: Record<string, unknown> = {}
      if (input.first_name !== undefined) updateData.first_name = input.first_name
      if (input.last_name !== undefined) updateData.last_name = input.last_name
      if (input.title !== undefined) updateData.title = input.title || ''
      if (input.description !== undefined) updateData.description = input.description || null
      if (input.avatar_url !== undefined && input.avatar_url) {
        updateData.avatar_url = input.avatar_url
      }
      if (input.socials !== undefined && Object.keys(input.socials).length > 0) {
        updateData.socials = input.socials
      }
      if (input.skills !== undefined && input.skills.length > 0) {
        updateData.skills = input.skills
      }

      try {
        const profile = await service.updateProfile(userId, updateData)
        return { profile }
      } catch (e: unknown) {
        if (e instanceof ProfileServiceError) {
          throw new ActionError({ message: e.message, code: e.code })
        }
        throw e
      }
    },
  }),

  /**
   * Upload an avatar image and persist the URL to the user's profile in
   * one call.
   */
  uploadAvatar: defineAction({
    accept: 'form',
    input: z.instanceof(FormData),
    handler: async (formData, context) => {
      const { userId, service } = await bootstrap(context)

      const file = formData.get('file') as File | null
      if (!file) {
        throw new ActionError({ message: 'No file provided', code: 'BAD_REQUEST' })
      }

      try {
        const profile = await service.uploadAndSetAvatar(userId, file)
        return { profile, url: profile.avatar_url }
      } catch (e: unknown) {
        if (e instanceof ProfileServiceError) {
          throw new ActionError({ message: e.message, code: e.code })
        }
        throw e
      }
    },
  }),
}
