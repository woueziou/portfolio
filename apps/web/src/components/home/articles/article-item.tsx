import type { Database } from '@portfolio/shared'
import { Calendar, Clock, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/utils/formater'

type Article = Database['public']['Tables']['articles']['Row']

export const ArticleItem = ({ item }: { item: Article }) => {
  const articleUrl =
    item.status === 'published' && item.slug ? `/blogs/${item.slug}` : null

  return (
    <div
      className={cn(
        'flex py-4 px-2 sm:py-6 sm:px-3 md:py-8 md:px-4 transition-all duration-150 ease-linear flex-col space-y-3 sm:space-y-4',
        'hover:scale-[1.02] hover:drop-shadow-sm',
        'group/card',
        'items-start',
        'justify-center',
      )}
    >
      {/* ── Article visual placeholder ── */}
      <div className="h-[200px] sm:h-[240px] md:h-[280px] w-full overflow-hidden bg-primary/10 flex items-center justify-center">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title ?? 'Article cover'}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <FileText className="h-16 w-16 text-primary/30" />
          </div>
        )}
      </div>

      {/* ── Meta row: date + reading time ── */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {item.published_at && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(item.published_at, 'MMM D, YYYY')}
          </span>
        )}
        {item.reading_time_minutes && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {item.reading_time_minutes} min read
          </span>
        )}
      </div>

      {/* ── Title ── */}
      <div className="flex flex-col items-start space-y-2">
        {articleUrl ? (
          <a
            href={articleUrl}
            className={cn(
              'text-xl font-bold border-b-2 border-transparent',
              'hover:border-foreground transition-colors',
            )}
          >
            {item.title}
          </a>
        ) : (
          <span className="text-xl font-bold">{item.title}</span>
        )}
      </div>

      {/* ── Summary (2-3 lines) ── */}
      {item.summary && (
        <div className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {item.summary}
        </div>
      )}
    </div>
  )
}
