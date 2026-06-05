import type { Editor } from '@tiptap/react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface ContextMenuProps {
  editor: Editor
  position: { top: number; left: number }
  onClose: () => void
  onImageUpload: (file: File) => void
}

interface MenuItem {
  kind: 'item'
  icon: React.ReactNode
  label: string
  action: () => void
}

interface MenuSeparator {
  kind: 'separator'
}

type MenuEntry = MenuItem | MenuSeparator

export default function ContextMenu({
  editor,
  position,
  onClose,
  onImageUpload,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Focus the menu on mount for keyboard nav
  useEffect(() => {
    menuRef.current?.focus()
  }, [])

  // Click outside to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Delay to avoid the same right-click closing immediately
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [onClose])

  // Adjust position to stay in viewport
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      const viewW = window.innerWidth
      const viewH = window.innerHeight

      let top = position.top
      let left = position.left

      if (rect.right > viewW) left = viewW - rect.width - 8
      if (rect.bottom > viewH) top = viewH - rect.height - 8
      if (left < 8) left = 8
      if (top < 8) top = 8

      menuRef.current.style.top = `${top}px`
      menuRef.current.style.left = `${left}px`
    }
  }, [position])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onImageUpload(file)
        onClose()
      }
    },
    [onImageUpload, onClose],
  )

  const items: MenuEntry[] = [
    {
      kind: 'item',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Image',
      action: () => fileInputRef.current?.click(),
    },
    {
      kind: 'item',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      label: 'Link',
      action: () => {
        const { from, to } = editor.state.selection
        if (from !== to) {
          editor.chain().focus().setLink({ href: '' }).run()
        }
        onClose()
      },
    },
    { kind: 'separator' },
    {
      kind: 'item',
      icon: <span className="text-xs font-bold">H1</span>,
      label: 'Heading 1',
      action: () => {
        editor.chain().focus().toggleHeading({ level: 1 }).run()
        onClose()
      },
    },
    {
      kind: 'item',
      icon: <span className="text-xs font-bold">H2</span>,
      label: 'Heading 2',
      action: () => {
        editor.chain().focus().toggleHeading({ level: 2 }).run()
        onClose()
      },
    },
    {
      kind: 'item',
      icon: <span className="text-xs font-bold">H3</span>,
      label: 'Heading 3',
      action: () => {
        editor.chain().focus().toggleHeading({ level: 3 }).run()
        onClose()
      },
    },
    { kind: 'separator' },
    {
      kind: 'item',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      ),
      label: 'Bullet List',
      action: () => {
        editor.chain().focus().toggleBulletList().run()
        onClose()
      },
    },
    {
      kind: 'item',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      label: 'Ordered List',
      action: () => {
        editor.chain().focus().toggleOrderedList().run()
        onClose()
      },
    },
    {
      kind: 'item',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: 'Blockquote',
      action: () => {
        editor.chain().focus().toggleBlockquote().run()
        onClose()
      },
    },
    {
      kind: 'item',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      label: 'Code Block',
      action: () => {
        editor.chain().focus().toggleCodeBlock().run()
        onClose()
      },
    },
    { kind: 'separator' },
    {
      kind: 'item',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
        </svg>
      ),
      label: 'Horizontal Rule',
      action: () => {
        editor.chain().focus().setHorizontalRule().run()
        onClose()
      },
    },
  ]

  return (
    <>
      <div
        ref={menuRef}
        tabIndex={-1}
        className="fixed z-50 w-52 rounded-lg border border-border bg-background py-1 shadow-xl outline-none"
        style={{ top: position.top, left: position.left }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose()
        }}
      >
        {items.map((item, index) => {
          if (item.kind === 'separator') {
            return <div key={index} className="my-1 border-t border-border" />
          }

          return (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
            >
              <span className="text-muted-foreground">{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </div>

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
