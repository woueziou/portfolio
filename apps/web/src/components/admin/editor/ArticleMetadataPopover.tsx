import { Info } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import StatusBadge from '@/components/admin/StatusBadge'

type ArticleStatus = 'draft' | 'published' | 'archived'

interface ArticleMetadataPopoverProps {
  status: ArticleStatus
  slug: string
  createdAt: string | null
  updatedAt: string | null
  publishedAt: string | null
  readingTimeMinutes: number | null
  projectTitle: string | null
  summary: string | null
  imageUrl: string | null
  canonicalUrl: string | null
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

export default function ArticleMetadataPopover({
  status,
  slug,
  createdAt,
  updatedAt,
  publishedAt,
  readingTimeMinutes,
  projectTitle,
  summary,
  imageUrl,
  canonicalUrl,
}: ArticleMetadataPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          aria-label="Article information"
        >
          <Info className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="w-80 p-0" sideOffset={8}>
        <div className="divide-y divide-border text-sm">
          {/* Status row */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-muted-foreground">Status</span>
            <StatusBadge status={status} size="sm" />
          </div>

          {/* Slug */}
          <MetadataRow label="Slug" value={`/${slug}`} />

          {/* Summary */}
          {summary && (
            <div className="px-4 py-3">
              <span className="block text-xs text-muted-foreground mb-1">Summary</span>
              <p className="text-sm text-foreground leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Created */}
          <MetadataRow label="Created" value={formatDate(createdAt)} />
          {/* Updated */}
          <MetadataRow label="Last updated" value={formatDate(updatedAt)} />
          {/* Published */}
          <MetadataRow label="Published" value={formatDate(publishedAt)} />
          {/* Reading time */}
          <MetadataRow
            label="Reading time"
            value={readingTimeMinutes ? `${readingTimeMinutes} min` : '—'}
          />
          {/* Linked project */}
          <MetadataRow label="Linked project" value={projectTitle || 'Standalone'} />
          {/* Cover image */}
          {imageUrl && (
            <div className="px-4 py-3">
              <span className="block text-xs text-muted-foreground mb-1">Cover image</span>
              <p className="text-xs text-foreground truncate">{imageUrl}</p>
            </div>
          )}
          {/* Canonical URL */}
          {canonicalUrl && <MetadataRow label="Canonical URL" value={canonicalUrl} />}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-foreground text-xs text-right max-w-[180px] truncate">{value}</span>
    </div>
  )
}
