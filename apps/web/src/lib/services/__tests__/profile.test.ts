import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ProfileService, ProfileServiceError } from '../profile'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@repo/shared'

// ---------------------------------------------------------------------------
//  Factories
// ---------------------------------------------------------------------------

function fakeFile(
  overrides: Partial<File> & { name?: string } = {},
): File {
  return {
    name: overrides.name ?? 'avatar.jpg',
    type: overrides.type ?? 'image/jpeg',
    size: overrides.size ?? 1024 * 500, // 500 KB
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    slice: () => new Blob(),
    stream: () => new ReadableStream(),
    text: () => Promise.resolve(''),
    lastModified: Date.now(),
    ...overrides,
  } as File
}

function fakeProfile(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    first_name: 'John',
    last_name: 'Doe',
    title: 'Engineer',
    description: 'Building cool stuff',
    avatar_url: null,
    username: 'johndoe',
    socials: { github: 'https://github.com/johndoe' },
    skills: ['TypeScript', 'React'],
    created_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
//  Mock supabase — returns the client + all mock fns for assertions
// ---------------------------------------------------------------------------

interface MockSupabase {
  client: SupabaseClient<Database>
  mockSelect: ReturnType<typeof vi.fn>
  mockMaybeSingle: ReturnType<typeof vi.fn>
  mockEq: ReturnType<typeof vi.fn>
  mockUpdate: ReturnType<typeof vi.fn>
  mockUpload: ReturnType<typeof vi.fn>
  mockRemove: ReturnType<typeof vi.fn>
  mockGetPublicUrl: ReturnType<typeof vi.fn>
  mockFrom: ReturnType<typeof vi.fn>
}

function createMockSupabase(): MockSupabase {
  const mockSelect = vi.fn()
  const mockMaybeSingle = vi.fn()
  const mockEq = vi.fn()
  const mockUpdate = vi.fn()
  const mockUpload = vi.fn()
  const mockRemove = vi.fn()
  const mockGetPublicUrl = vi.fn()
  const mockFrom = vi.fn()

  const mockBuilder = {
    select: mockSelect,
    maybeSingle: mockMaybeSingle,
    eq: mockEq,
    update: mockUpdate,
  }

  // Default wiring: .from('profiles').select().eq().maybeSingle()
  mockSelect.mockReturnValue(mockBuilder)
  mockEq.mockReturnValue(mockBuilder)
  mockMaybeSingle.mockResolvedValue({
    data: null,
    error: null,
  })
  mockUpdate.mockReturnValue(mockBuilder)

  mockFrom.mockImplementation((table: string) => {
    if (table === 'profiles') return mockBuilder
    return {}
  })

  // Storage mocks
  const mockStorageFrom = vi.fn()
  const mockStorageBucket = {
    upload: mockUpload,
    remove: mockRemove,
    getPublicUrl: mockGetPublicUrl,
  }
  mockStorageFrom.mockReturnValue(mockStorageBucket)

  const client = {
    from: mockFrom,
    storage: { from: mockStorageFrom },
    auth: {},
  } as unknown as SupabaseClient<Database>

  return { client, mockSelect, mockMaybeSingle, mockEq, mockUpdate, mockUpload, mockRemove, mockGetPublicUrl, mockFrom }
}

describe('ProfileService', () => {
  let mock: MockSupabase
  let service: ProfileService

  beforeEach(() => {
    mock = createMockSupabase()
    service = new ProfileService(mock.client)
  })

  // -----------------------------------------------------------------------
  //  getProfile
  // -----------------------------------------------------------------------

  describe('getProfile', () => {
    it('returns the profile for a valid user', async () => {
      const expected = fakeProfile()
      mock.mockMaybeSingle.mockResolvedValue({ data: expected, error: null })

      const result = await service.getProfile('user-1')

      expect(result).toEqual(expected)
      expect(mock.mockFrom).toHaveBeenCalledWith('profiles')
      expect(mock.mockSelect).toHaveBeenCalledWith('*')
      expect(mock.mockEq).toHaveBeenCalledWith('id', 'user-1')
    })

    it('throws INTERNAL_SERVER_ERROR when Supabase returns an error', async () => {
      mock.mockMaybeSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed', code: 'PGRST000' },
      })

      await expect(service.getProfile('error-user')).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
      })
    })

    it('throws NOT_FOUND when data is null (profile does not exist)', async () => {
      mock.mockMaybeSingle.mockResolvedValue({ data: null, error: null })

      await expect(service.getProfile('user-1')).rejects.toMatchObject({
        code: 'NOT_FOUND',
      })
    })
  })

  // -----------------------------------------------------------------------
  //  updateProfile
  // -----------------------------------------------------------------------

  describe('updateProfile', () => {
    it('updates and returns the profile', async () => {
      const updated = fakeProfile({ first_name: 'Jane' })
      mock.mockMaybeSingle.mockResolvedValue({ data: updated, error: null })

      const result = await service.updateProfile('user-1', { first_name: 'Jane' })

      expect(result.first_name).toBe('Jane')
      expect(mock.mockUpdate).toHaveBeenCalledWith({ first_name: 'Jane' })
      expect(mock.mockEq).toHaveBeenCalledWith('id', 'user-1')
    })

    it('throws on database error', async () => {
      mock.mockMaybeSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database constraint violation', code: '23505' },
      })

      await expect(
        service.updateProfile('user-1', { first_name: 'Jane' }),
      ).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Database constraint violation',
      })
    })

    it('works with partial updates (single field)', async () => {
      const updated = fakeProfile({ avatar_url: 'https://example.com/avatar.png' })
      mock.mockMaybeSingle.mockResolvedValue({ data: updated, error: null })

      const result = await service.updateProfile('user-1', {
        avatar_url: 'https://example.com/avatar.png',
      })

      expect(result.avatar_url).toBe('https://example.com/avatar.png')
      expect(mock.mockUpdate).toHaveBeenCalledWith({
        avatar_url: 'https://example.com/avatar.png',
      })
    })

    it('updates socials and skills', async () => {
      const updated = fakeProfile({
        socials: { twitter: '@jane' },
        skills: ['Go', 'Kubernetes'],
      })
      mock.mockMaybeSingle.mockResolvedValue({ data: updated, error: null })

      const result = await service.updateProfile('user-1', {
        socials: { twitter: '@jane' },
        skills: ['Go', 'Kubernetes'],
      })

      expect(result.socials).toEqual({ twitter: '@jane' })
      expect(result.skills).toEqual(['Go', 'Kubernetes'])
    })

    it('strips empty socials object (JSONB edge case)', async () => {
      const existing = fakeProfile({ socials: { github: 'old' } })
      // Empty socials → stripped, so getProfile is called as fallback
      mock.mockMaybeSingle.mockResolvedValue({ data: existing, error: null })

      const result = await service.updateProfile('user-1', { socials: {} })

      expect(result.socials).toEqual({ github: 'old' }) // unchanged
      expect(mock.mockUpdate).not.toHaveBeenCalled() // no write query
    })

    it('strips empty avatar_url string', async () => {
      const existing = fakeProfile({ avatar_url: 'https://example.com/avatar.png' })
      mock.mockMaybeSingle.mockResolvedValue({ data: existing, error: null })

      const result = await service.updateProfile('user-1', { avatar_url: '' })

      expect(result.avatar_url).toBe('https://example.com/avatar.png') // unchanged
      expect(mock.mockUpdate).not.toHaveBeenCalled()
    })

    it('strips empty skills array', async () => {
      const existing = fakeProfile({ skills: ['Go'] })
      mock.mockMaybeSingle.mockResolvedValue({ data: existing, error: null })

      const result = await service.updateProfile('user-1', { skills: [] })

      expect(result.skills).toEqual(['Go']) // unchanged
      expect(mock.mockUpdate).not.toHaveBeenCalled()
    })

    it('strips null values', async () => {
      const existing = fakeProfile({ description: 'Original bio' })
      mock.mockMaybeSingle.mockResolvedValue({ data: existing, error: null })

      const result = await service.updateProfile('user-1', { description: null })

      expect(result.description).toBe('Original bio') // unchanged
      expect(mock.mockUpdate).not.toHaveBeenCalled()
    })

    it('falls back to getProfile when all fields are sanitized away', async () => {
      mock.mockMaybeSingle.mockResolvedValue({
        data: fakeProfile({ first_name: 'John' }),
        error: null,
      })

      // All empty / null values should be sanitized away, triggering
      // a getProfile fallback instead of an update.
      const result = await service.updateProfile('user-1', {
        socials: {},
        skills: [],
        avatar_url: '',
      })

      expect(result.first_name).toBe('John')
      expect(mock.mockUpdate).not.toHaveBeenCalled()
      // Should have called select (via getProfile) instead
      expect(mock.mockSelect).toHaveBeenCalledWith('*')
    })
  })

  // -----------------------------------------------------------------------
  //  uploadAvatar
  // -----------------------------------------------------------------------

  describe('uploadAvatar', () => {
    beforeEach(() => {
      mock.mockUpload.mockResolvedValue({
        data: { path: 'avatars/user-1/123456789.abc.jpg' },
        error: null,
      })
      mock.mockGetPublicUrl.mockReturnValue({
        data: {
          publicUrl:
            'https://xxx.supabase.co/storage/v1/object/public/content-images/avatars/user-1/123456789.abc.jpg',
        },
      })
    })

    it('uploads a valid image and returns public URL', async () => {
      const file = fakeFile()

      const result = await service.uploadAvatar('user-1', file)

      expect(result.url).toContain('content-images/avatars/user-1/')
      expect(result.path).toContain('avatars/user-1/')
      expect(mock.mockUpload).toHaveBeenCalledOnce()
      expect(mock.mockGetPublicUrl).toHaveBeenCalledWith(
        expect.stringContaining('avatars/user-1/'),
      )
    })

    it('rejects files with invalid MIME type', async () => {
      const file = fakeFile({ type: 'application/pdf' })

      await expect(service.uploadAvatar('user-1', file)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      })
      expect(mock.mockUpload).not.toHaveBeenCalled()
    })

    it('rejects files exceeding 5 MB', async () => {
      const file = fakeFile({ size: 6 * 1024 * 1024 })

      await expect(service.uploadAvatar('user-1', file)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      })
      expect(mock.mockUpload).not.toHaveBeenCalled()
    })

    it('rejects empty / null file', async () => {
      await expect(
        service.uploadAvatar('user-1', null as unknown as File),
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
    })

    it('accepts all allowed MIME types', async () => {
      for (const mime of ['image/jpeg', 'image/png', 'image/gif', 'image/webp']) {
        const file = fakeFile({ type: mime })
        mock.mockUpload.mockResolvedValue({
          data: { path: `avatars/user-1/${Date.now()}.test` },
          error: null,
        })

        const result = await service.uploadAvatar('user-1', file)
        expect(result.url).toBeTruthy()
      }
    })

    it('throws on storage upload failure', async () => {
      mock.mockUpload.mockResolvedValue({
        data: null,
        error: { message: 'Bucket not found' },
      })

      await expect(
        service.uploadAvatar('user-1', fakeFile()),
      ).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
      })
    })
  })

  // -----------------------------------------------------------------------
  //  deleteAvatar
  // -----------------------------------------------------------------------

  describe('deleteAvatar', () => {
    it('removes the file from storage', async () => {
      mock.mockRemove.mockResolvedValue({ data: {}, error: null })

      await service.deleteAvatar('avatars/user-1/old.jpg')

      expect(mock.mockRemove).toHaveBeenCalledWith([
        'avatars/user-1/old.jpg',
      ])
    })

    it('does not throw on removal failure (non-critical)', async () => {
      mock.mockRemove.mockResolvedValue({
        data: null,
        error: { message: 'File not found' },
      })

      // Should not throw — fire-and-forget
      await expect(
        service.deleteAvatar('avatars/user-1/missing.jpg'),
      ).resolves.toBeUndefined()
    })
  })

  // -----------------------------------------------------------------------
  //  uploadAndSetAvatar  (integration: upload + profile update + cleanup)
  // -----------------------------------------------------------------------

  describe('uploadAndSetAvatar', () => {
    const existingUrl =
      'https://xxx.supabase.co/storage/v1/object/public/content-images/avatars/user-1/old.jpg'
    const newUrl =
      'https://xxx.supabase.co/storage/v1/object/public/content-images/avatars/user-1/new.jpg'

    beforeEach(() => {
      // Upload succeeds
      mock.mockUpload.mockResolvedValue({
        data: { path: 'avatars/user-1/new.jpg' },
        error: null,
      })
      mock.mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: newUrl },
      })
      mock.mockRemove.mockResolvedValue({ data: {}, error: null })
    })

    it('uploads, updates profile, and cleans up old avatar', async () => {
      // Sequential calls to .single(): first getProfile returns existing,
      // then updateProfile returns the updated record.
      mock.mockMaybeSingle
        .mockResolvedValueOnce({
          data: fakeProfile({ avatar_url: existingUrl }),
          error: null,
        })
        .mockResolvedValueOnce({
          data: fakeProfile({ avatar_url: newUrl }),
          error: null,
        })

      const profile = await service.uploadAndSetAvatar('user-1', fakeFile())

      expect(profile.avatar_url).toBe(newUrl)
      // Old file should be removed
      expect(mock.mockRemove).toHaveBeenCalledWith([
        'avatars/user-1/old.jpg',
      ])
    })

    it('works when no previous avatar exists (no cleanup)', async () => {
      mock.mockMaybeSingle
        .mockResolvedValueOnce({
          data: fakeProfile({ avatar_url: null }),
          error: null,
        })
        .mockResolvedValueOnce({
          data: fakeProfile({ avatar_url: newUrl }),
          error: null,
        })

      const profile = await service.uploadAndSetAvatar('user-1', fakeFile())

      expect(profile.avatar_url).toBe(newUrl)
      // Should NOT call remove since there was no old avatar
      expect(mock.mockRemove).not.toHaveBeenCalled()
    })

    it('still saves the new avatar even if old cleanup fails', async () => {
      mock.mockMaybeSingle
        .mockResolvedValueOnce({
          data: fakeProfile({ avatar_url: existingUrl }),
          error: null,
        })
        .mockResolvedValueOnce({
          data: fakeProfile({ avatar_url: newUrl }),
          error: null,
        })
      mock.mockRemove.mockResolvedValue({
        data: null,
        error: { message: 'Remove failed' },
      })

      const profile = await service.uploadAndSetAvatar('user-1', fakeFile())

      // Profile update should still succeed
      expect(profile.avatar_url).toBe(newUrl)
    })

    it('throws if the upload itself fails', async () => {
      mock.mockMaybeSingle.mockResolvedValueOnce({
        data: fakeProfile({ avatar_url: existingUrl }),
        error: null,
      })
      mock.mockUpload.mockResolvedValue({
        data: null,
        error: { message: 'Storage quota exceeded' },
      })

      await expect(
        service.uploadAndSetAvatar('user-1', fakeFile()),
      ).rejects.toMatchObject({ code: 'INTERNAL_SERVER_ERROR' })
    })
  })

  // -----------------------------------------------------------------------
  //  Error types
  // -----------------------------------------------------------------------

  describe('ProfileServiceError', () => {
    it('is instanceof Error', () => {
      const err = new ProfileServiceError('test', 'BAD_REQUEST')
      expect(err).toBeInstanceOf(Error)
      expect(err).toBeInstanceOf(ProfileServiceError)
    })

    it('carries the correct code', () => {
      const err = new ProfileServiceError('Not found', 'NOT_FOUND')
      expect(err.code).toBe('NOT_FOUND')
      expect(err.message).toBe('Not found')
      expect(err.name).toBe('ProfileServiceError')
    })
  })
})
