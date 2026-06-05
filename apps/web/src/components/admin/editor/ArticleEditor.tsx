import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { EditorContent, type JSONContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { common, createLowlight } from 'lowlight'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import FloatingToolbar from './FloatingToolbar'
import SlashCommandMenu from './SlashCommandMenu'

const lowlight = createLowlight(common)

interface ArticleEditorProps {
  articleId: number
  initialContent?: JSONContent
  onContentChange?: (content: JSONContent) => void
  onSave?: (article: Record<string, unknown>) => void
  onSaveStateChange?: (status: SaveStatus) => void
}

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

export default function ArticleEditor({
  articleId,
  initialContent,
  onContentChange,
  onSave,
  onSaveStateChange,
}: ArticleEditorProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 })
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedContentRef = useRef<string>('')

  const autoSave = useCallback(
    async (content: JSONContent) => {
      const contentString = JSON.stringify(content)
      if (contentString === lastSavedContentRef.current) return

      setSaveStatus('saving')
      onSaveStateChange?.('saving')

      try {
        const supabase = createSupabaseBrowserClient()

        const { data, error } = await supabase
          .from('articles')
          .update({ content })
          .eq('id', articleId)
          .select()
          .single()

        if (error) {
          setSaveStatus('error')
          onSaveStateChange?.('error')
          console.error('Auto-save failed:', error)
        } else {
          setSaveStatus('saved')
          onSaveStateChange?.('saved')
          lastSavedContentRef.current = contentString
          onSave?.(data as Record<string, unknown>)
        }
      } catch (err) {
        setSaveStatus('error')
        onSaveStateChange?.('error')
        console.error('Auto-save error:', err)
      }
    },
    [articleId, onSave, onSaveStateChange],
  )

  const debouncedSave = useCallback(
    (content: JSONContent) => {
      setSaveStatus('unsaved')
      onSaveStateChange?.('unsaved')

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(() => {
        autoSave(content)
      }, 1500)
    },
    [autoSave, onSaveStateChange],
  )

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Image.configure({ HTMLAttributes: { class: 'rounded-lg max-w-full' } }),
      CodeBlockLowlight.configure({ lowlight, HTMLAttributes: { class: 'hljs' } }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') return 'Heading'
          return "Type '/' for commands..."
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-500 hover:text-blue-600 underline', target: '_blank', rel: 'noopener noreferrer' },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: false }),
    ],
    content: initialContent || { type: 'doc', content: [{ type: 'paragraph', content: [] }] },
    editorProps: {
      attributes: {
        class: 'prose prose-zinc dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-4 py-2',
      },
      handleKeyDown: (view, event) => {
        if (event.key === '/' && !showSlashMenu) {
          const { from } = view.state.selection
          const coords = view.coordsAtPos(from)
          const { $from } = view.state.selection
          const isAtStart = $from.parentOffset === 0
          const isEmptyParagraph = $from.parent.type.name === 'paragraph' && $from.parent.content.size === 0

          if (isAtStart || isEmptyParagraph) {
            setShowSlashMenu(true)
            setSlashMenuPosition({ top: coords.bottom + 8, left: coords.left })
            return false
          }
        }
        if (event.key === 'Escape' && showSlashMenu) {
          setShowSlashMenu(false)
          return true
        }
        const isMeta = event.metaKey || event.ctrlKey
        if (isMeta && event.key.toLowerCase() === 's') {
          event.preventDefault()
          void autoSave(view.state.doc.toJSON())
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
  })

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return

      try {
        const supabase = createSupabaseBrowserClient()

        const ext = file.name.split('.').pop()
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

        const { data, error: uploadError } = await supabase.storage
          .from('content-images')
          .upload(filename, file, { upsert: false })

        if (uploadError) {
          console.error('Image upload failed:', uploadError)
          return
        }

        const { data: urlData } = supabase.storage.from('content-images').getPublicUrl(data.path)

        editor.chain().focus().setImage({ src: urlData.publicUrl, alt: file.name }).run()
      } catch (err) {
        console.error('Image upload error:', err)
      }
    },
    [editor],
  )

  useEffect(() => {
    if (!editor) return

    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          event.preventDefault()
          const file = item.getAsFile()
          if (file) { handleImageUpload(file); return }
        }
      }
    }

    const editorElement = editor.view.dom
    editorElement.addEventListener('paste', handlePaste)
    return () => editorElement.removeEventListener('paste', handlePaste)
  }, [editor, handleImageUpload])

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

    const handleDragOver = (event: DragEvent) => { event.preventDefault() }

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              saveStatus === 'saved' ? 'bg-green-500'
                : saveStatus === 'saving' ? 'bg-yellow-500 animate-pulse'
                  : saveStatus === 'unsaved' ? 'bg-orange-500'
                    : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-muted-foreground">
            {saveStatus === 'saved' ? 'All changes saved'
              : saveStatus === 'saving' ? 'Saving...'
                : saveStatus === 'unsaved' ? 'Unsaved changes'
                  : 'Save failed'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => autoSave(editor.getJSON())}
          disabled={saveStatus === 'saving' || saveStatus === 'saved'}
          className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Save now
        </button>
      </div>

      <div className="sticky top-20 z-30 bg-card border border-border rounded-lg p-2 mb-4">
        <FloatingToolbar editor={editor} onImageUpload={handleImageUpload} />
      </div>

      <div className="relative border border-border rounded-lg bg-card min-h-[500px]">
        <EditorContent editor={editor} />
        {showSlashMenu && (
          <SlashCommandMenu
            editor={editor}
            position={slashMenuPosition}
            onClose={() => setShowSlashMenu(false)}
            onImageUpload={handleImageUpload}
          />
        )}
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        <p>
          <strong>Shortcuts:</strong> <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+B</kbd> Bold ·{' '}
          <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+I</kbd> Italic ·{' '}
          <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+U</kbd> Underline ·{' '}
          <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+K</kbd> Link · Type{' '}
          <kbd className="px-1 py-0.5 bg-muted rounded">/</kbd> for commands
        </p>
      </div>
    </div>
  )
}
