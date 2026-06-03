import type { Database } from '@repo/shared'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Minimal profile shape for updates (matches the profiles table Row,
 * but we only expose fields the service layer manages).
 */
export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type ProfileUpdate = Partial<
  Pick<ProfileRow, 'first_name' | 'last_name' | 'title' | 'description' | 'avatar_url' | 'socials' | 'skills'>
>

/** Keys that the service layer is allowed to write */
const KNOWN_PROFILE_KEYS: (keyof ProfileUpdate)[] = [
  'first_name',
  'last_name',
  'title',
  'description',
  'avatar_url',
  'socials',
  'skills',
]

export interface UploadResult {
  url: string
  path: string
}

/** Allowed image MIME types for avatar uploads */
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const AVATAR_BUCKET = 'content-images'
const AVATAR_FOLDER = 'avatars'

export class ProfileService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  // ---------------------------------------------------------------------------
  //  Read
  // ---------------------------------------------------------------------------

  /**
   * Fetch a single profile by user id.
   *
   * Uses `.maybeSingle()` instead of `.single()` to avoid PostgREST's
   * "JSON object requested, multiple (or no) rows returned" error when
   * the profile does not yet exist. We handle the 0-row case explicitly.
   */
  async getProfile(userId: string): Promise<ProfileRow> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      throw new ProfileServiceError(error.message, 'INTERNAL_SERVER_ERROR')
    }

    if (!data) {
      throw new ProfileServiceError('Profile not found', 'NOT_FOUND')
    }

    return data
  }

  // ---------------------------------------------------------------------------
  //  Write
  // ---------------------------------------------------------------------------

  /**
   * Update one or more profile fields. Only the supplied keys are written;
   * omitted keys are left untouched.
   *
   * - Empty `socials` / `skills` values are stripped to avoid JSONB
   *   update issues in PostgreSQL.
   * - If the resulting update payload is empty (no meaningful changes),
   *   the method simply re-fetches and returns the current profile
   *   without making a write query.
   */
  async updateProfile(userId: string, updates: ProfileUpdate): Promise<ProfileRow> {
    // Strip empty JSONB / array values that may confuse Supabase.
    const sanitized = this.sanitizeUpdates(updates)

    // If nothing meaningful to update, just return the current profile.
    if (Object.keys(sanitized).length === 0) {
      console.log("Nothing to update")
      return this.getProfile(userId)
    }

    console.log(sanitized)
    const { data, error } = await this.supabase
      .from('profiles')
      .update(sanitized as Database['public']['Tables']['profiles']['Update'])
      .eq('id', userId)
      .select()
      .maybeSingle()

    if (error) {
      throw new ProfileServiceError(error.message, 'INTERNAL_SERVER_ERROR')
    }

    // If the update matched 0 rows (e.g. RLS filtered the user out),
    // fall back to a read so the caller gets a meaningful error.
    if (!data) {
      console.log("No data found")
      return this.getProfile(userId)
    }

    console.log("updated data", data)
    return data
  }

  private sanitizeUpdates(updates: ProfileUpdate): Record<string, unknown> {
    const result: Record<string, unknown> = {}

    for (const key of KNOWN_PROFILE_KEYS) {
      const value = updates[key]
      if (value === null || value === undefined) continue

      // Skip empty objects (JSONB edge case).
      if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) continue

      // Skip empty arrays.
      if (Array.isArray(value) && value.length === 0) continue

      // Skip empty strings.
      if (typeof value === 'string' && value.trim() === '') continue

      result[key] = value
    }

    return result
  }

  // ---------------------------------------------------------------------------
  //  Avatar
  // ---------------------------------------------------------------------------

  /**
   * Validate an image file and upload it to Supabase Storage under the
   * `avatars/` folder inside the configured bucket.
   *
   * Returns the public URL and the storage path.
   */
  async uploadAvatar(userId: string, file: File): Promise<UploadResult> {
    this.validateImageFile(file)

    const ext = file.name.split('.').pop() ?? 'jpg'
    const filename = `${userId}/${Date.now()}-${this.randomId()}.${ext}`
    const storagePath = `${AVATAR_FOLDER}/${filename}`

    const { error: uploadError } = await this.supabase.storage
      .from(AVATAR_BUCKET)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      throw new ProfileServiceError(uploadError.message, 'INTERNAL_SERVER_ERROR')
    }

    const { data: urlData } = this.supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(storagePath)

    return { url: urlData.publicUrl, path: storagePath }
  }

  /**
   * Delete an existing avatar from storage (useful before uploading a
   * replacement or clearing the avatar).
   */
  async deleteAvatar(storagePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(AVATAR_BUCKET)
      .remove([storagePath])

    if (error) {
      console.error('Failed to delete avatar from storage:', error.message)
    }
  }

  /**
   * Delete the old avatar associated with a profile (if any). Called
   * during the profile update action when `avatar_url` has changed, so
   * stale storage files don't accumulate.
   */
  async cleanUpOldAvatar(previousAvatarUrl: string | null): Promise<void> {
    if (!previousAvatarUrl) return
    const storagePath = this.extractStoragePath(previousAvatarUrl)
    if (!storagePath) return
    await this.deleteAvatar(storagePath)
  }

  // ---------------------------------------------------------------------------
  //  Validation helpers
  // ---------------------------------------------------------------------------

  private validateImageFile(file: File): void {
    if (!file) {
      throw new ProfileServiceError('No file provided', 'BAD_REQUEST')
    }

    if (!(ALLOWED_MIME as readonly string[]).includes(file.type)) {
      throw new ProfileServiceError(
        `Invalid file type "${file.type}". Allowed: JPEG, PNG, GIF, WebP`,
        'BAD_REQUEST',
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ProfileServiceError(
        'File too large. Maximum size is 5 MB',
        'BAD_REQUEST',
      )
    }
  }

  // ---------------------------------------------------------------------------
  //  Helpers
  // ---------------------------------------------------------------------------

  private randomId(): string {
    return Math.random().toString(36).substring(2, 9)
  }

  /**
   * Extract the storage-relative path from a public Supabase URL.
   * Example:
   *   https://xxx.supabase.co/storage/v1/object/public/content-images/avatars/abc/123.jpg
   *   →  avatars/abc/123.jpg
   */
  private extractStoragePath(publicUrl: string): string | null {
    const marker = `/object/public/${AVATAR_BUCKET}/`
    const idx = publicUrl.indexOf(marker)
    if (idx === -1) return null
    return publicUrl.slice(idx + marker.length)
  }
}

// ---------------------------------------------------------------------------
//  Custom error
// ---------------------------------------------------------------------------

export class ProfileServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'BAD_REQUEST' | 'INTERNAL_SERVER_ERROR',
  ) {
    super(message)
    this.name = 'ProfileServiceError'
  }
}
