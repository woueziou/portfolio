import { BubbleMenu } from '@tiptap/react/menus'
import type { Editor } from '@tiptap/react'
import { useCallback, useRef, useState } from 'react'

interface BubbleMenuToolbarProps {
  editor: Editor
  onImageUpload?: (file: File) => void
}

export default function BubbleMenuToolbar({ editor, onImageUpload }: BubbleMenuToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const handleLinkSubmit = useCallback(() => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    }
    setShowLinkInput(false)
    setLinkUrl('')
  }, [editor, linkUrl])

  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && onImageUpload) {
        onImageUpload(file)
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [onImageUpload],
  )

  const items = [
    {
      icon: <strong className="text-sm">B</strong>,
      label: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
    },
    {
      icon: <em className="text-sm">I</em>,
      label: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
    },
    {
      icon: <u className="text-sm">U</u>,
      label: 'Underline',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
    },
    {
      icon: <s className="text-sm">S</s>,
      label: 'Strike',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
    },
    {
      icon: <span className="text-xs bg-yellow-200 dark:bg-yellow-800 px-1 rounded">H</span>,
      label: 'Highlight',
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: editor.isActive('highlight'),
    },
    { type: 'separator' },
    {
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      label: 'Link',
      action: () => {
        if (editor.isActive('link')) {
          editor.chain().focus().extendMarkRange('link').unsetLink().run()
          return
        }
        const previousUrl = editor.getAttributes('link').href || ''
        setLinkUrl(previousUrl)
        setShowLinkInput(true)
      },
      isActive: editor.isActive('link'),
    },
    {
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Image',
      action: handleImageClick,
    },
    { type: 'separator' },
    {
      icon: <span className="text-sm font-semibold">H1</span>,
      label: 'Heading 1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
    },
    {
      icon: <span className="text-sm font-semibold">H2</span>,
      label: 'Heading 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
    },
    {
      icon: <span className="text-sm font-semibold">H3</span>,
      label: 'Heading 3',
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }),
    },
    { type: 'separator' },
    {
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h10M4 18h13" />
        </svg>
      ),
      label: 'Align Left',
      action: () => editor.chain().focus().setTextAlign('left').run(),
      isActive: editor.isActive('textAlign') && editor.getAttributes('textAlign').textAlign === 'left',
    },
    {
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      label: 'Align Center',
      action: () => editor.chain().focus().setTextAlign('center').run(),
      isActive: editor.isActive('textAlign') && editor.getAttributes('textAlign').textAlign === 'center',
    },
    {
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M10 12h10M7 18h13" />
        </svg>
      ),
      label: 'Align Right',
      action: () => editor.chain().focus().setTextAlign('right').run(),
      isActive: editor.isActive('textAlign') && editor.getAttributes('textAlign').textAlign === 'right',
    },
  ]

  return (
    <>
      <BubbleMenu
        editor={editor}
        className="flex items-center gap-0.5 rounded-lg border border-border bg-background px-1.5 py-1 shadow-md"
      >
        {items.map((item, index) => {
          if ('type' in item && item.type === 'separator') {
            return <div key={index} className="mx-0.5 h-5 w-px bg-border" />
          }

          const btn = item as {
            icon: React.ReactNode
            label: string
            action: () => void
            isActive: boolean
          }

          return (
            <button
              key={btn.label}
              type="button"
              onClick={btn.action}
              title={btn.label}
              className={`flex h-7 w-7 items-center justify-center rounded text-xs transition-colors ${
                btn.isActive
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              {btn.icon}
            </button>
          )
        })}
      </BubbleMenu>

      {showLinkInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => { setShowLinkInput(false); setLinkUrl('') }} onKeyDown={() => {}} role="presentation">
          <div
            className="flex items-center gap-2 rounded-lg border border-border bg-background p-3 shadow-lg"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={() => {}}
            role="presentation"
          >
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-64 rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') { handleLinkSubmit() }
                if (e.key === 'Escape') { setShowLinkInput(false); setLinkUrl('') }
              }}
            />
            <button
              type="button"
              onClick={handleLinkSubmit}
              className="rounded-md bg-foreground px-3 py-2 text-xs text-background hover:bg-foreground/90 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  )
}
