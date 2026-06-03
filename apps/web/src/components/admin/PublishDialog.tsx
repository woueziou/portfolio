import { actions } from 'astro:actions'
import { useState } from 'react'
import type { PublicationStatus } from '@/lib/schemas/project'
import StatusBadge from './StatusBadge'

interface PublishDialogProps {
  /** 'project' or 'article' — determines which action to call */
  type: 'project' | 'article'
  /** Current item ID */
  id: number
  /** Current publication status */
  currentStatus: PublicationStatus | string
  /** Item title for display */
  title: string
  /** Callback after successful status change */
  onStatusChange?: (newStatus: PublicationStatus) => void
  /** Whether the dialog is open */
  isOpen: boolean
  /** Callback to close the dialog */
  onClose: () => void
}

type TransitionAction = 'publish' | 'unpublish' | 'archive' | 'restore'

interface TransitionConfig {
  label: string
  description: string
  targetStatus: PublicationStatus
  variant: 'primary' | 'danger' | 'secondary'
}

const transitions: Record<PublicationStatus, Record<TransitionAction, TransitionConfig>> = {
  draft: {
    publish: {
      label: 'Publish',
      description: 'Make this item publicly visible. It will appear on your portfolio.',
      targetStatus: 'published',
      variant: 'primary',
    },
    unpublish: {
      label: 'Unpublish',
      description: 'This item is not published yet.',
      targetStatus: 'draft',
      variant: 'secondary',
    },
    archive: {
      label: 'Archive',
      description: 'Archive this item. It will be hidden from your admin dashboard by default.',
      targetStatus: 'archived',
      variant: 'danger',
    },
    restore: {
      label: 'Restore',
      description: 'This item is already in draft status.',
      targetStatus: 'draft',
      variant: 'secondary',
    },
  },
  published: {
    publish: {
      label: 'Publish',
      description: 'This item is already published.',
      targetStatus: 'published',
      variant: 'primary',
    },
    unpublish: {
      label: 'Unpublish',
      description: 'Remove this item from public view. It will return to draft status.',
      targetStatus: 'draft',
      variant: 'danger',
    },
    archive: {
      label: 'Archive',
      description: 'Archive this item. It will be hidden from your portfolio and admin dashboard.',
      targetStatus: 'archived',
      variant: 'danger',
    },
    restore: {
      label: 'Restore',
      description: 'Restore this item to its previous state.',
      targetStatus: 'published',
      variant: 'secondary',
    },
  },
  archived: {
    publish: {
      label: 'Publish',
      description: 'Restore and publish this item immediately.',
      targetStatus: 'published',
      variant: 'primary',
    },
    unpublish: {
      label: 'Unpublish',
      description: 'Restore to draft status without publishing.',
      targetStatus: 'draft',
      variant: 'secondary',
    },
    archive: {
      label: 'Archive',
      description: 'This item is already archived.',
      targetStatus: 'archived',
      variant: 'danger',
    },
    restore: {
      label: 'Restore to Draft',
      description: 'Restore this item back to draft status.',
      targetStatus: 'draft',
      variant: 'secondary',
    },
  },
}

function getAvailableActions(status: PublicationStatus): TransitionAction[] {
  switch (status) {
    case 'draft':
      return ['publish', 'archive']
    case 'published':
      return ['unpublish', 'archive']
    case 'archived':
      return ['publish', 'restore']
    default:
      return []
  }
}

export default function PublishDialog({
  type,
  id,
  currentStatus,
  title,
  onStatusChange,
  isOpen,
  onClose,
}: PublishDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableActions = getAvailableActions(currentStatus as PublicationStatus)

  const handleAction = async (action: TransitionAction) => {
    const config = transitions[currentStatus as PublicationStatus]?.[action]
    if (!config) return

    setLoading(true)
    setError(null)

    try {
      const shouldPublish = config.targetStatus === 'published'

      const result =
        type === 'project'
          ? await actions.projects.publish({ id, publish: shouldPublish })
          : await actions.articles.publish({ id, publish: shouldPublish })

      if (result.error) {
        setError(result.error.message)
      } else {
        onStatusChange?.(config.targetStatus)
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click handler */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: overlay div */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Publication Settings
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 truncate">{title}</p>
        </div>

        {/* Current Status */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Current status:</span>
          <StatusBadge status={currentStatus} size="md" />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {availableActions.map((action) => {
            const config = transitions[currentStatus as PublicationStatus]?.[action]
            if (!config) return null

            return (
              <button
                type="button"
                key={action}
                onClick={() => void handleAction(action)}
                disabled={loading}
                className={`w-full rounded-lg border px-4 py-3 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  config.variant === 'primary'
                    ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                    : config.variant === 'danger'
                      ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                      : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                }`}
              >
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{config.label}</div>
                <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {config.description}
                </div>
              </button>
            )
          })}
        </div>

        {/* Cancel */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="mt-4 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
