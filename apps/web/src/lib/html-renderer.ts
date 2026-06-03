/**
 * Server-side HTML renderer for TipTap JSON content
 * Converts TipTap JSON to HTML for storage in content_html column
 * This avoids client-side rendering and enables fast page loads
 */

interface TipTapNode {
  type?: string
  text?: string
  marks?: Array<{ type: string; attrs?: Record<string, any> }>
  content?: TipTapNode[]
  attrs?: Record<string, any>
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Render marks (bold, italic, etc.) around text
 */
function renderMarks(text: string, marks?: TipTapNode['marks']): string {
  if (!marks || marks.length === 0) return escapeHtml(text)

  let result = escapeHtml(text)

  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':
        result = `<strong>${result}</strong>`
        break
      case 'italic':
        result = `<em>${result}</em>`
        break
      case 'underline':
        result = `<u>${result}</u>`
        break
      case 'code':
        result = `<code>${result}</code>`
        break
      case 'link': {
        const href = mark.attrs?.href || '#'
        const target = mark.attrs?.target || '_blank'
        result = `<a href="${escapeHtml(href)}" target="${target}" rel="noopener noreferrer">${result}</a>`
        break
      }
      case 'highlight':
        result = `<mark>${result}</mark>`
        break
      case 'strike':
        result = `<s>${result}</s>`
        break
    }
  }

  return result
}

/**
 * Render a single node to HTML
 */
function renderNode(node: TipTapNode): string {
  // Text node
  if (node.text !== undefined) {
    return renderMarks(node.text, node.marks)
  }

  // Container node
  const children = node.content?.map(renderNode).join('') || ''

  switch (node.type) {
    case 'doc':
      return children

    case 'paragraph':
      return `<p>${children}</p>`

    case 'heading': {
      const level = node.attrs?.level || 2
      return `<h${level}>${children}</h${level}>`
    }

    case 'bulletList':
      return `<ul>${children}</ul>`

    case 'orderedList':
      return `<ol>${children}</ol>`

    case 'listItem':
      return `<li>${children}</li>`

    case 'blockquote':
      return `<blockquote>${children}</blockquote>`

    case 'codeBlock': {
      const language = node.attrs?.language || ''
      const langAttr = language ? ` class="language-${escapeHtml(language)}"` : ''
      return `<pre><code${langAttr}>${escapeHtml(children)}</code></pre>`
    }

    case 'horizontalRule':
      return '<hr />'

    case 'hardBreak':
      return '<br />'

    case 'image': {
      const src = node.attrs?.src || ''
      const alt = node.attrs?.alt || ''
      const title = node.attrs?.title || ''
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : ''
      return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${titleAttr} />`
    }

    default:
      return children
  }
}

/**
 * Convert TipTap JSON content to HTML string
 * @param content - TipTap JSON content (or string)
 * @returns HTML string
 */
export function renderTiptapToHtml(content: any): string {
  if (!content) return ''

  // If content is a string, try to parse as JSON
  let jsonContent = content
  if (typeof content === 'string') {
    try {
      jsonContent = JSON.parse(content)
    } catch {
      // If not valid JSON, wrap in paragraph
      return `<p>${escapeHtml(content)}</p>`
    }
  }

  // Validate it looks like a TipTap document
  if (jsonContent.type !== 'doc' || !jsonContent.content) {
    return ''
  }

  return renderNode(jsonContent)
}
