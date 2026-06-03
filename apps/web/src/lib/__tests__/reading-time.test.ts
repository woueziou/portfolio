import { describe, expect, it } from 'vitest'
import { calculateReadingTime, getReadingTimeMinutes } from '../reading-time'

describe('calculateReadingTime', () => {
  it('returns 1 min for empty/null content', () => {
    expect(calculateReadingTime(null)).toEqual({ minutes: 1, words: 0, text: '1 min read' })
    expect(calculateReadingTime(undefined)).toEqual({ minutes: 1, words: 0, text: '1 min read' })
  })

  it('calculates reading time for plain text', () => {
    const text = 'word '.repeat(225) // 225 words = ~1 min at 225 wpm
    const result = calculateReadingTime(text)
    expect(result.minutes).toBe(1)
    expect(result.words).toBe(225)
    expect(result.text).toBe('1 min read')
  })

  it('calculates reading time for longer text', () => {
    const text = 'word '.repeat(450) // 450 words = ~2 min
    const result = calculateReadingTime(text)
    expect(result.minutes).toBe(2)
    expect(result.words).toBe(450)
    expect(result.text).toBe('2 min read')
  })

  it('calculates reading time from TipTap JSON', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'word '.repeat(225) }],
        },
      ],
    }
    const result = calculateReadingTime(content)
    expect(result.minutes).toBe(1)
    expect(result.words).toBe(225)
  })

  it('parses JSON string input', () => {
    const jsonStr = JSON.stringify({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hello world' }] }],
    })
    const result = calculateReadingTime(jsonStr)
    expect(result.words).toBe(2)
    expect(result.minutes).toBe(1)
  })

  it('handles nested TipTap content', () => {
    const content = {
      type: 'doc',
      content: [
        { type: 'heading', content: [{ type: 'text', text: 'Title' }] },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Some ' },
            { type: 'text', text: 'bold text' },
          ],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'item one' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'item two' }] }],
            },
          ],
        },
      ],
    }
    const result = calculateReadingTime(content)
    expect(result.words).toBe(8) // Title + Some + bold + text + item + one + item + two
    expect(result.minutes).toBe(1)
  })
})

describe('getReadingTimeMinutes', () => {
  it('returns just the minutes number', () => {
    expect(getReadingTimeMinutes(null)).toBe(1)
    expect(getReadingTimeMinutes('short text')).toBe(1)
  })

  it('returns correct minutes for long content', () => {
    const longText = 'word '.repeat(1000)
    expect(getReadingTimeMinutes(longText)).toBe(5) // 1000/225 = 4.44, ceil = 5
  })
})
