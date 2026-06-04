import { navigate } from 'astro:transitions/client'
import { ExternalLink } from 'lucide-react'
import { useState } from 'react'
import type { PublicationStatus } from '@/lib/schemas/project'
import PublishDialog from './PublishDialog'
import StatusBadge from './StatusBadge'

interface ArticlePublishControlsProps {
  articleId: number
  articleTitle: string
  currentStatus: PublicationStatus | string
  publishedAt: string | null
  slug: string
  projectId: number | null
}

export default function ArticlePublishControls({
  articleId,
  articleTitle,
  currentStatus,
  publishedAt,
  slug,
  projectId,
}: ArticlePublishControlsProps) {
  const [status, setStatus] = useState<PublicationStatus | string>(currentStatus)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Articles linked to projects are shown on the project page
  const publicUrl = status === 'published' && !projectId ? `/articles/${slug}` : null

  return (
    <div className="space-y-4">
      {/* Status Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusBadge status={status} size="md" />
          {publishedAt && (
            <span className="text-sm text-muted-foreground">
              Published {new Date(publishedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
        >
          Change Status
        </button>
      </div>

      {/* Info about linked articles */}
      {status === 'published' && projectId && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-3">
          <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-700 dark:text-blue-300">
            This article is published and visible on its linked project page.
          </span>
        </div>
      )}

      {/* Standalone article URL */}
      {publicUrl && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3">
          <ExternalLink className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-700 dark:text-green-300">Public URL:</span>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-green-600 dark:text-green-400 hover:underline"
          >
            {publicUrl}
          </a>
        </div>
      )}

      {/* Publish Dialog */}
      <PublishDialog
        type="article"
        id={articleId}
        currentStatus={status}
        title={articleTitle}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onStatusChange={(newStatus) => {
          setStatus(newStatus)
          // Navigate to same page to reflect server-side changes
          navigate(window.location.pathname)
        }}
      />
    </div>
  )
}
