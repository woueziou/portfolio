import { describe, expect, it } from 'vitest'

/**
 * Tests for publication workflow logic.
 * These test the allowed status transitions and related behavior.
 */

type PublicationStatus = 'draft' | 'published' | 'archived'

interface StatusTransition {
  from: PublicationStatus
  to: PublicationStatus
  action: 'publish' | 'unpublish' | 'archive' | 'restore'
}

// Define allowed transitions
const allowedTransitions: StatusTransition[] = [
  { from: 'draft', to: 'published', action: 'publish' },
  { from: 'draft', to: 'archived', action: 'archive' },
  { from: 'published', to: 'draft', action: 'unpublish' },
  { from: 'published', to: 'archived', action: 'archive' },
  { from: 'archived', to: 'published', action: 'publish' },
  { from: 'archived', to: 'draft', action: 'restore' },
]

function isTransitionAllowed(from: PublicationStatus, to: PublicationStatus): boolean {
  return allowedTransitions.some((t) => t.from === from && t.to === to)
}

function getAvailableActions(status: PublicationStatus): string[] {
  return allowedTransitions.filter((t) => t.from === status).map((t) => t.action)
}

describe('Publication Status Transitions', () => {
  describe('Allowed transitions', () => {
    it('allows draft -> published', () => {
      expect(isTransitionAllowed('draft', 'published')).toBe(true)
    })

    it('allows draft -> archived', () => {
      expect(isTransitionAllowed('draft', 'archived')).toBe(true)
    })

    it('allows published -> draft (unpublish)', () => {
      expect(isTransitionAllowed('published', 'draft')).toBe(true)
    })

    it('allows published -> archived', () => {
      expect(isTransitionAllowed('published', 'archived')).toBe(true)
    })

    it('allows archived -> published', () => {
      expect(isTransitionAllowed('archived', 'published')).toBe(true)
    })

    it('allows archived -> draft (restore)', () => {
      expect(isTransitionAllowed('archived', 'draft')).toBe(true)
    })
  })

  describe('Disallowed transitions', () => {
    it('disallows draft -> draft (no-op)', () => {
      expect(isTransitionAllowed('draft', 'draft')).toBe(false)
    })

    it('disallows published -> published (no-op)', () => {
      expect(isTransitionAllowed('published', 'published')).toBe(false)
    })

    it('disallows archived -> archived (no-op)', () => {
      expect(isTransitionAllowed('archived', 'archived')).toBe(false)
    })
  })

  describe('Available actions per status', () => {
    it('draft has publish and archive actions', () => {
      const actions = getAvailableActions('draft')
      expect(actions).toContain('publish')
      expect(actions).toContain('archive')
      expect(actions).not.toContain('unpublish')
      expect(actions).not.toContain('restore')
    })

    it('published has unpublish and archive actions', () => {
      const actions = getAvailableActions('published')
      expect(actions).toContain('unpublish')
      expect(actions).toContain('archive')
      expect(actions).not.toContain('publish')
      expect(actions).not.toContain('restore')
    })

    it('archived has publish and restore actions', () => {
      const actions = getAvailableActions('archived')
      expect(actions).toContain('publish')
      expect(actions).toContain('restore')
      expect(actions).not.toContain('unpublish')
      expect(actions).not.toContain('archive')
    })
  })
})

describe('Published At Timestamp Behavior', () => {
  it('sets published_at on first publish', () => {
    const state = {
      published_at: null as string | null,
      status: 'draft' as PublicationStatus,
    }

    // Simulate first publish
    if (state.published_at === null) {
      state.published_at = new Date().toISOString()
    }
    state.status = 'published'

    expect(state.published_at).toBeTruthy()
    expect(state.status).toBe('published')
  })

  it('preserves published_at on republish', () => {
    const originalDate = '2024-01-15T00:00:00Z'
    const state = {
      published_at: originalDate,
      status: 'draft' as PublicationStatus,
    }

    // Simulate republish - should preserve original date
    if (state.published_at === null) {
      state.published_at = new Date().toISOString()
    }
    state.status = 'published'

    expect(state.published_at).toBe(originalDate)
  })

  it('preserves published_at when unpublishing', () => {
    const originalDate = '2024-01-15T00:00:00Z'
    const state = {
      published_at: originalDate,
      status: 'published' as PublicationStatus,
    }

    // Unpublish should keep the date
    state.status = 'draft'

    expect(state.published_at).toBe(originalDate)
  })

  it('preserves published_at when archiving', () => {
    const originalDate = '2024-01-15T00:00:00Z'
    const state = {
      published_at: originalDate,
      status: 'published' as PublicationStatus,
    }

    // Archive should keep the date
    state.status = 'archived'

    expect(state.published_at).toBe(originalDate)
  })
})

describe('Visibility Rules', () => {
  function canAnonymousRead(status: PublicationStatus): boolean {
    return status === 'published'
  }

  function canOwnerRead(_status: PublicationStatus): boolean {
    // Owners can read all their own content
    return true
  }

  it('anonymous can only read published items', () => {
    expect(canAnonymousRead('published')).toBe(true)
    expect(canAnonymousRead('draft')).toBe(false)
    expect(canAnonymousRead('archived')).toBe(false)
  })

  it('owner can read all statuses', () => {
    expect(canOwnerRead('published')).toBe(true)
    expect(canOwnerRead('draft')).toBe(true)
    expect(canOwnerRead('archived')).toBe(true)
  })
})
