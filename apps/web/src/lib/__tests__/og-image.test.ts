import { describe, expect, it } from 'vitest'
import { DEFAULT_OG_IMAGE, resolveOgImage } from '../og-image'

describe('resolveOgImage', () => {
  const avatarUrl = 'https://cdn.example.com/avatar.jpg'
  const siteOgImage = 'https://cdn.example.com/og.png'

  it('prefers the page-specific image', () => {
    expect(
      resolveOgImage({ pageImage: '/cover.png', useAvatar: true, avatarUrl, siteOgImage }),
    ).toBe('/cover.png')
  })

  it('uses the avatar when enabled', () => {
    expect(resolveOgImage({ useAvatar: true, avatarUrl, siteOgImage })).toBe(avatarUrl)
  })

  it('ignores the avatar when disabled', () => {
    expect(resolveOgImage({ useAvatar: false, avatarUrl, siteOgImage })).toBe(siteOgImage)
  })

  it('falls back when enabled but no avatar is set', () => {
    expect(resolveOgImage({ useAvatar: true, avatarUrl: null })).toBe(DEFAULT_OG_IMAGE)
  })
})
