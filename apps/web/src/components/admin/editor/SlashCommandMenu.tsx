import { useState, useEffect, useCallback, useRef } from 'react'
import { type Editor } from '@tiptap/react'

interface SlashCommandMenuProps {
  editor: Editor
  position: { top: number; left: number }
  onClose: () => void
  onImageUpload: (file: File) => void
}

interface CommandItem {
  icon: React.ReactNode
  label: string
  description: string
  action: () => void
}

export default function SlashCommandMenu({
  editor,
  position,
  onClose,
  onImageUpload,
}: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filterText, setFilterText] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Delete the slash character that triggered the menu
  useEffect(() => {
    const { from } = editor.state.selection
    const textBefore = editor.state.doc.textBetween(
      Math.max(0, from - 1),
      from
    )

    if (textBefore === '/') {
      editor
        .chain()
        .focus()
        .deleteRange({ from: from - 1, to: from })
        .run()
    }
  }, [editor])

  const commands: CommandItem[] = [
    {
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 12h8m-8 6h12M6 6h12"
          />
        </svg>
      ),
      label: 'Heading 1',
      description: 'Large section heading',
      action: () => {
        editor.chain().focus().toggleHeading({ level: 1 }).run()
        onClose()
      },
    },
    {
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 12h6m-6 6h8M6 6h8"
          />
        </svg>
      ),
      label: 'Heading 2',
      description: 'Medium section heading',
      action: () => {
        editor.chain().focus().toggleHeading({ level: 2 }).run()
        onClose()
      },
    },
    {
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 12h4m-4 6h6M6 6h6"
          />
        </svg>
      ),
      label: 'Heading 3',
      description: 'Small section heading',
      action: () => {
        editor.chain().focus().toggleHeading({ level: 3 }).run()
        onClose()
      },
    },
    {
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h7"
          />
        </svg>
      ),
      label: 'Bullet List',
      description: 'Unordered list',
      action: () => {
        editor.chain().focus().toggleBulletList().run()
        onClose()
      },
    },
    {
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
      label: 'Ordered List',
      description: 'Numbered list',
      action: () => {
        editor.chain().focus().toggleOrderedList().run()
        onClose()
      },
    },
    {
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      label: 'Blockquote',
      description: 'Quote block',
      action: () => {
        editor.chain().focus().toggleBlockquote().run()
        onClose()
      },
    },
    {
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      ),
      label: 'Code Block',
      description: 'Syntax highlighted code',
      action: () => {
        editor.chain().focus().toggleCodeBlock().run()
        onClose()
      },
    },
    {
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      label: 'Image',
      description: 'Upload an image',
      action: () => {
        fileInputRef.current?.click()
      },
    },
    {
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 12H4"
          />
        </svg>
      ),
      label: 'Horizontal Rule',
      description: 'Divider line',
      action: () => {
        editor.chain().focus().setHorizontalRule().run()
        onClose()
      },
    },
    {
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      ),
      label: 'Link',
      description: 'Add a hyperlink',
      action: () => {
        // This will be handled by the FloatingToolbar
        onClose()
      },
    },
  ]

  // Filter commands based on input
  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(filterText.toLowerCase()) ||
      cmd.description.toLowerCase().includes(filterText.toLowerCase())
  )

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
        default:
          // Update filter text
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            setFilterText((prev) => prev + e.key)
            setSelectedIndex(0)
          } else if (e.key === 'Backspace') {
            setFilterText((prev) => prev.slice(0, -1))
            setSelectedIndex(0)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [filteredCommands, selectedIndex, onClose])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Adjust position to stay in viewport
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight

      if (rect.bottom > viewportHeight) {
        menuRef.current.style.top = `${position.top - rect.height - 16}px`
      }
    }
  }, [position])

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onImageUpload(file)
        onClose()
      }
    },
    [onImageUpload, onClose]
  )

  return (
    <>
      <div
        ref={menuRef}
        className="absolute z-50 w-72 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden"
        style={{ top: position.top, left: position.left }}
      >
        <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-700">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {filterText ? `Filtering: ${filterText}` : 'Insert block'}
          </p>
        </div>
        <div className="max-h-80 overflow-y-auto py-1">
          {filteredCommands.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No matching commands
            </div>
          ) : (
            filteredCommands.map((cmd, index) => (
              <button
                key={cmd.label}
                onClick={cmd.action}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                  index === selectedIndex
                    ? 'bg-zinc-100 dark:bg-zinc-700'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <span className="text-zinc-600 dark:text-zinc-400">
                  {cmd.icon}
                </span>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {cmd.label}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {cmd.description}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
        <div className="px-3 py-2 border-t border-zinc-200 dark:border-zinc-700">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            ↑↓ Navigate · Enter Select · Esc Cancel
          </p>
        </div>
      </div>

      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleImageUpload}
        className="hidden"
      />
    </>
  )
}
