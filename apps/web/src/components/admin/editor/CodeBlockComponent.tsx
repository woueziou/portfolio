import { useState, useCallback } from 'react'
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'

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

export default function CodeBlockComponent({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) {
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
    [updateAttributes]
  )

  return (
    <NodeViewWrapper
      className={`relative group rounded-lg overflow-hidden ${
        selected ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 dark:bg-zinc-900 border-b border-zinc-700">
        <select
          value={node.attrs.language || ''}
          onChange={handleLanguageChange}
          className="text-xs bg-zinc-700 dark:bg-zinc-800 text-zinc-300 border border-zinc-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors opacity-0 group-hover:opacity-100"
        >
          {copied ? (
            <>
              <svg
                className="h-3.5 w-3.5 text-green-400"
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
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <svg
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
      <pre className="bg-zinc-900 dark:bg-zinc-950 p-4 overflow-x-auto">
        <code
          className={`text-sm text-zinc-100 font-mono ${
            node.attrs.language
              ? `language-${node.attrs.language}`
              : ''
          }`}
        >
          {/* Content is rendered by TipTap */}
        </code>
      </pre>
    </NodeViewWrapper>
  )
}
