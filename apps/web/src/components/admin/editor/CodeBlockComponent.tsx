import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { useCallback, useState } from 'react'

const LANGUAGES = [
  { value: '', label: 'Auto' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'jsx', label: 'JSX' },
  { value: 'tsx', label: 'TSX' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'json', label: 'JSON' },
  { value: 'python', label: 'Python' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'bash', label: 'Bash' },
  { value: 'sql', label: 'SQL' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'yaml', label: 'YAML' },
  { value: 'toml', label: 'TOML' },
  { value: 'dockerfile', label: 'Dockerfile' },
]

export default function CodeBlockComponent({ node, updateAttributes, selected }: NodeViewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(node.textContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [node])

  const handleLanguageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateAttributes({ language: e.target.value })
    },
    [updateAttributes],
  )

  return (
    <NodeViewWrapper
      className={`relative group rounded-lg overflow-hidden ${selected ? 'ring-2 ring-ring' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
        <select
          value={node.attrs.language || ''}
          onChange={handleLanguageChange}
          className="text-xs bg-background text-foreground border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
        >
          {copied ? (
            <>
              <svg
                aria-hidden="true"
                className="h-3.5 w-3.5 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <svg
                aria-hidden="true"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <pre className="bg-foreground/5 p-4 overflow-x-auto">
        <code
          className={`text-sm text-foreground font-mono ${
            node.attrs.language ? `language-${node.attrs.language}` : ''
          }`}
        >
          {/* Content is rendered by TipTap */}
        </code>
      </pre>
    </NodeViewWrapper>
  )
}
