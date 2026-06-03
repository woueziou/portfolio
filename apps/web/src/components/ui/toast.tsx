import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Toast {
  id: number
  message: string
}

let nextId = 0
let listeners: Array<(toast: Toast) => void> = []

function notify(message: string) {
  const toast: Toast = { id: nextId++, message }
  for (const listener of listeners) {
    listener(toast)
  }
}

/**
 * Show a brief toast notification. Call from any event handler.
 */
export function showToast(message: string) {
  notify(message)
}

/**
 * Renders a toast stack in the bottom-right corner.
 * Include once per layout.
 */
export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const handler = (toast: Toast) => {
      setToasts((prev) => [...prev, toast])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, 2500)
    }
    listeners.push(handler)
    return () => {
      listeners = listeners.filter((l) => l !== handler)
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'animate-in slide-in-from-bottom-2 fade-in rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-lg',
            'transition-all duration-300',
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
