import { actions } from 'astro:actions'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { common, createLowlight } from 'lowlight'
import { useCallback, useEffect, useRef, useState } from 'react'
import FloatingToolbar from './FloatingToolbar'
import SlashCommandMenu from './SlashCommandMenu'

// Create lowlight instance with common languages
const lowlight = createLowlight(common)

interface ArticleEditorProps {
  articleId: number
  initialContent?: any
  onContentChange?: (content: any) => void
  onSave?: (article: any) => void
}

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

export default function ArticleEditor({
  articleId,
  initialContent,
  onContentChange,
  onSave,
}: ArticleEditorProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 })
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedContentRef = useRef<string>('')

  // Auto-save function
  const autoSave = useCallback(
    async (content: any) => {
      const contentString = JSON.stringify(content)

      // Skip if content hasn't changed
      if (contentString === lastSavedContentRef.current) {
        return
      }

      setSaveStatus('saving')

      try {
        const result = await actions.articles.saveContent({
          id: articleId,
          content,
        })

        if (result.error) {
          setSaveStatus('error')
          console.error('Auto-save failed:', result.error)
        } else {
          setSaveStatus('saved')
          lastSavedContentRef.current = contentString
          onSave?.(result.data.article)
        }
      } catch (err) {
        setSaveStatus('error')
        console.error('Auto-save error:', err)
      }
    },
    [articleId, onSave],
  )

  // Debounced auto-save
  const debouncedSave = useCallback(
    (content: any) => {
      setSaveStatus('unsaved')

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(() => {
        autoSave(content)
      }, 1500) // 1.5 second debounce
    },
    [autoSave],
  )

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'hljs',
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'Heading'
          }
          return "Type '/' for commands..."
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-600 underline',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: false,
      }),
    ],
    content: initialContent || {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [],
        },
      ],
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-zinc dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-4 py-2',
      },
      handleKeyDown: (view, event) => {
        // Handle slash command menu
        if (event.key === '/' && !showSlashMenu) {
          const { from } = view.state.selection
          const coords = view.coordsAtPos(from)

          // Check if we're at the start of an empty paragraph
          const { $from } = view.state.selection
          const isAtStart = $from.parentOffset === 0
          const isEmptyParagraph =
            $from.parent.type.name === 'paragraph' && $from.parent.content.size === 0

          if (isAtStart || isEmptyParagraph) {
            setShowSlashMenu(true)
            setSlashMenuPosition({
              top: coords.bottom + 8,
              left: coords.left,
            })
            return false // Let the character be typed
          }
        }

        // Close slash menu on escape
        if (event.key === 'Escape' && showSlashMenu) {
          setShowSlashMenu(false)
          return true
        }

        return false
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getJSON()
      onContentChange?.(content)
      debouncedSave(content)
    },
    onFocus: () => {
      // Close slash menu when editor is focused
      // (unless we just opened it)
      setTimeout(() => {
        // Small delay to allow slash menu clicks to register
      }, 100)
    },
  })

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Handle image upload
  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return

      try {
        const formData = new FormData()
        formData.append('file', file)

        const result = await actions.projects.uploadImage(formData)

        if (result.error) {
          console.error('Image upload failed:', result.error)
          return
        }

        // Insert image into editor
        editor.chain().focus().setImage({ src: result.data.url, alt: file.name }).run()
      } catch (err) {
        console.error('Image upload error:', err)
      }
    },
    [editor],
  )

  // Handle paste with images
  useEffect(() => {
    if (!editor) return

    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          event.preventDefault()
          const file = item.getAsFile()
          if (file) {
            handleImageUpload(file)
          }
          return
        }
      }
    }

    const editorElement = editor.view.dom
    editorElement.addEventListener('paste', handlePaste)

    return () => {
      editorElement.removeEventListener('paste', handlePaste)
    }
  }, [editor, handleImageUpload])

  // Handle drag and drop images
  useEffect(() => {
    if (!editor) return

    const handleDrop = (event: DragEvent) => {
      const files = event.dataTransfer?.files
      if (!files || files.length === 0) return

      const file = files[0]
      if (file.type.startsWith('image/')) {
        event.preventDefault()
        handleImageUpload(file)
      }
    }

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault()
    }

    const editorElement = editor.view.dom
    editorElement.addEventListener('drop', handleDrop)
    editorElement.addEventListener('dragover', handleDragOver)

    return () => {
      editorElement.removeEventListener('drop', handleDrop)
      editorElement.removeEventListener('dragover', handleDragOver)
    }
  }, [editor, handleImageUpload])

  if (!editor) {
    return <div className="animate-pulse bg-muted rounded-lg h-[500px]" />
  }

  return (
    <div className="relative">
      {/* Save status indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              saveStatus === 'saved'
                ? 'bg-green-500'
                : saveStatus === 'saving'
                  ? 'bg-yellow-500 animate-pulse'
                  : saveStatus === 'unsaved'
                    ? 'bg-orange-500'
                    : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-muted-foreground">
            {saveStatus === 'saved'
              ? 'All changes saved'
              : saveStatus === 'saving'
                ? 'Saving...'
                : saveStatus === 'unsaved'
                  ? 'Unsaved changes'
                  : 'Save failed'}
          </span>
        </div>
        <button
          onClick={() => autoSave(editor.getJSON())}
          disabled={saveStatus === 'saving' || saveStatus === 'saved'}
          className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Save now
        </button>
      </div>

      {/* Toolbar */}
      <div className="sticky top-20 z-30 bg-card border border-border rounded-lg p-2 mb-4">
        <FloatingToolbar editor={editor} onImageUpload={handleImageUpload} />
      </div>

      {/* Editor content */}
      <div className="relative border border-border rounded-lg bg-card min-h-[500px]">
        <EditorContent editor={editor} />

        {/* Slash command menu */}
        {showSlashMenu && (
          <SlashCommandMenu
            editor={editor}
            position={slashMenuPosition}
            onClose={() => setShowSlashMenu(false)}
            onImageUpload={handleImageUpload}
          />
        )}
      </div>

      {/* Keyboard shortcuts help */}
      <div className="mt-4 text-xs text-muted-foreground">
        <p>
          <strong>Shortcuts:</strong>{' '}
          <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+B</kbd> Bold ·{' '}
          <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+I</kbd> Italic ·{' '}
          <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+U</kbd> Underline ·{' '}
          <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+K</kbd> Link · Type{' '}
          <kbd className="px-1 py-0.5 bg-muted rounded">/</kbd> for commands
        </p>
      </div>
    </div>
  )
}
