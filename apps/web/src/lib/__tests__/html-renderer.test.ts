import { describe, expect, it } from 'vitest'
import { renderTiptapToHtml } from '../html-renderer'

describe('renderTiptapToHtml', () => {
  it('returns empty string for null/undefined input', () => {
    expect(renderTiptapToHtml(null)).toBe('')
    expect(renderTiptapToHtml(undefined)).toBe('')
  })

  it('wraps plain string in paragraph', () => {
    expect(renderTiptapToHtml('hello')).toBe('<p>hello</p>')
  })

  it('escapes HTML in plain strings', () => {
    expect(renderTiptapToHtml('<script>alert("xss")</script>')).toBe(
      '<p>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</p>',
    )
  })

  it('renders a simple doc with paragraphs', () => {
    const content = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello world' }] }],
    }
    expect(renderTiptapToHtml(content)).toBe('<p>Hello world</p>')
  })

  it('renders headings with correct levels', () => {
    const content = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Title' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Subtitle' }] },
        { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Section' }] },
      ],
    }
    const html = renderTiptapToHtml(content)
    expect(html).toContain('<h1>Title</h1>')
    expect(html).toContain('<h2>Subtitle</h2>')
    expect(html).toContain('<h3>Section</h3>')
  })

  it('renders bold, italic, and underline marks', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' and ' },
            { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
          ],
        },
      ],
    }
    const html = renderTiptapToHtml(content)
    expect(html).toContain('<strong>bold</strong>')
    expect(html).toContain('<em>italic</em>')
  })

  it('renders links with href and target', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'click here',
              marks: [{ type: 'link', attrs: { href: 'https://example.com', target: '_blank' } }],
            },
          ],
        },
      ],
    }
    const html = renderTiptapToHtml(content)
    expect(html).toContain(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">click here</a>',
    )
  })

  it('renders bullet lists', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 1' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 2' }] }],
            },
          ],
        },
      ],
    }
    const html = renderTiptapToHtml(content)
    expect(html).toContain('<ul>')
    expect(html).toContain('<li><p>Item 1</p></li>')
    expect(html).toContain('<li><p>Item 2</p></li>')
  })

  it('renders ordered lists', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'First' }] }],
            },
          ],
        },
      ],
    }
    const html = renderTiptapToHtml(content)
    expect(html).toContain('<ol>')
    expect(html).toContain('<li><p>First</p></li>')
  })

  it('renders code blocks with language', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'codeBlock',
          attrs: { language: 'javascript' },
          content: [{ type: 'text', text: 'const x = 1;' }],
        },
      ],
    }
    const html = renderTiptapToHtml(content)
    expect(html).toContain('<pre><code class="language-javascript">')
  })

  it('renders blockquotes', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'blockquote',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A wise quote' }] }],
        },
      ],
    }
    const html = renderTiptapToHtml(content)
    expect(html).toContain('<blockquote>')
    expect(html).toContain('A wise quote')
  })

  it('renders images with src, alt, and title', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'image',
          attrs: { src: 'https://example.com/img.png', alt: 'My image', title: 'Image title' },
        },
      ],
    }
    const html = renderTiptapToHtml(content)
    expect(html).toContain(
      '<img src="https://example.com/img.png" alt="My image" title="Image title" />',
    )
  })

  it('renders horizontal rules', () => {
    const content = {
      type: 'doc',
      content: [{ type: 'horizontalRule' }],
    }
    expect(renderTiptapToHtml(content)).toContain('<hr />')
  })

  it('parses JSON string input', () => {
    const jsonStr = JSON.stringify({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Parsed from string' }] }],
    })
    expect(renderTiptapToHtml(jsonStr)).toContain('Parsed from string')
  })

  it('returns empty string for non-doc type', () => {
    expect(renderTiptapToHtml({ type: 'paragraph' })).toBe('')
  })

  it('produces valid HTML for a complex document', () => {
    const content = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'My Article' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Introduction paragraph.' }] },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Section 1' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Some ' },
            { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' text.' },
          ],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Point 1' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Point 2' }] }],
            },
          ],
        },
      ],
    }
    const html = renderTiptapToHtml(content)

    expect(html).toContain('<h1>My Article</h1>')
    expect(html).toContain('<h2>Section 1</h2>')
    expect(html).toContain('<p>Introduction paragraph.</p>')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).toContain('<ul>')
    expect(html).toContain('<li>')
  })
})
