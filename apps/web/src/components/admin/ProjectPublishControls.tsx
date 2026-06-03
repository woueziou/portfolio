import { ExternalLink } from 'lucide-react'
import { useState } from 'react'
import type { PublicationStatus } from '@/lib/schemas/project'
import PublishDialog from './PublishDialog'
import StatusBadge from './StatusBadge'

interface ProjectPublishControlsProps {
  projectId: number
  projectTitle: string
  currentStatus: PublicationStatus | string
  publishedAt: string | null
  slug: string
}

export default function ProjectPublishControls({
  projectId,
  projectTitle,
  currentStatus,
  publishedAt,
  slug,
}: ProjectPublishControlsProps) {
  const [status, setStatus] = useState<PublicationStatus | string>(currentStatus)
  const [dialogOpen, setDialogOpen] = useState(false)

  const publicUrl = status === 'published' ? `/projects/${slug}` : null

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

      {/* Public URL */}
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
        type="project"
        id={projectId}
        currentStatus={status}
        title={projectTitle}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onStatusChange={(newStatus) => {
          setStatus(newStatus)
          // Reload to reflect changes (published_at, slug link, etc.)
          window.location.reload()
        }}
      />
    </div>
  )
}
