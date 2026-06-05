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
import { renderTiptapToHtml } from '@/lib/html-renderer'
import BubbleMenuToolbar from './BubbleMenuToolbar'
import SlashCommandMenu from './SlashCommandMenu'

const lowlight = createLowlight(common)

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

interface ArticleEditorProps {
  articleId?: number
  initialContent?: JSONContent
  onContentChange?: (content: JSONContent) => void
  onSave?: (article: Record<string, unknown>) => void
  onSaveStateChange?: (status: SaveStatus) => void
  onCreateArticle?: (content: JSONContent) => void
}

export default function ArticleEditor({
  articleId,
  initialContent,
  onContentChange,
  onSave,
  onSaveStateChange,
  onCreateArticle,
}: ArticleEditorProps) {
  const [, setSaveStatus] = useState<SaveStatus>('saved')
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 })
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedContentRef = useRef<string>('')

  const autoSave = useCallback(
    async (content: JSONContent) => {
      if (!articleId) return
      const contentString = JSON.stringify(content)
      if (contentString === lastSavedContentRef.current) return

      setSaveStatus('saving')
      onSaveStateChange?.('saving')

      try {
        const supabase = createSupabaseBrowserClient()
        const contentHtml = renderTiptapToHtml(content as Parameters<typeof renderTiptapToHtml>[0])
        const { data, error } = await supabase
          .from('articles')
          .update({ content, content_html: contentHtml || null })
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
        class: 'prose prose-zinc dark:prose-invert max-w-none focus:outline-none min-h-[70vh] px-0 py-4',
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
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
          event.preventDefault()
          if (articleId) {
            void autoSave(view.state.doc.toJSON())
          } else {
            onCreateArticle?.(view.state.doc.toJSON())
          }
          return true
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getJSON()
      onContentChange?.(content)
      if (articleId) {
        debouncedSave(content)
      }
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

  // Paste handler for images
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

  // Drag & drop handler for images
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
    return <div className="animate-pulse h-[70vh] rounded-lg bg-muted/30" />
  }

  return (
    <div className="relative">
      {/* Bubble menu on text selection */}
      <BubbleMenuToolbar editor={editor} onImageUpload={handleImageUpload} />

      {/* Slash command menu */}
      {showSlashMenu && (
        <SlashCommandMenu
          editor={editor}
          position={slashMenuPosition}
          onClose={() => setShowSlashMenu(false)}
          onImageUpload={handleImageUpload}
        />
      )}

      {/* Editor content — clean paper-like surface */}
      <EditorContent editor={editor} />
    </div>
  )
}
