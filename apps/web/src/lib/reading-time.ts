/**
 * Estimate reading time for content
 * Uses average reading speed of 200-250 words per minute
 */

interface ReadingTimeResult {
  minutes: number
  words: number
  text: string
}

interface TipTapNode {
  type?: string
  text?: string
  content?: TipTapNode[]
}

/**
 * Extract plain text from TipTap JSON content
 */
function extractTextFromTiptapJson(json: TipTapNode | null | undefined): string {
  if (!json?.content) return ''

  const texts: string[] = []

  function traverse(node: TipTapNode) {
    if (node.text) {
      texts.push(node.text)
    }
    if (node.content && Array.isArray(node.content)) {
      for (const child of node.content) {
        traverse(child)
      }
    }
  }

  traverse(json)
  return texts.join(' ')
}

/**
 * Calculate reading time from plain text
 */
function calculateFromText(text: string): ReadingTimeResult {
  const wordsPerMinute = 225 // Average reading speed
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute))

  let readingText: string
  if (minutes === 1) {
    readingText = '1 min read'
  } else {
    readingText = `${minutes} min read`
  }

  return {
    minutes,
    words,
    text: readingText,
  }
}

/**
 * Calculate reading time from TipTap JSON content
 */
export function calculateReadingTime(
  content: string | TipTapNode | null | undefined,
): ReadingTimeResult {
  if (!content) {
    return { minutes: 1, words: 0, text: '1 min read' }
  }

  // If content is a string, try to parse as JSON
  let jsonContent: TipTapNode | null = null
  if (typeof content === 'string') {
    try {
      jsonContent = JSON.parse(content) as TipTapNode
    } catch {
      // If not valid JSON, treat as plain text
      return calculateFromText(content)
    }
  } else {
    jsonContent = content
  }

  const text = extractTextFromTiptapJson(jsonContent)
  return calculateFromText(text)
}

/**
 * Quick utility to get just the minutes value
 */
export function getReadingTimeMinutes(content: string | TipTapNode | null | undefined): number {
  return calculateReadingTime(content).minutes
}
