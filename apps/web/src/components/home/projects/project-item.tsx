import {
  SiAgora,
  SiCloudcannon,
  SiDart,
  SiDotnet,
  SiFastapi,
  SiFlutter,
  SiGit,
  SiGnubash,
  SiHono,
  SiMongodb,
  SiNextdotjs,
  SiNuxt,
  SiPayloadcms,
  SiPostgresql,
  SiPython,
  SiSanity,
  SiSupabase,
  SiTelegram,
  SiTypescript,
} from '@icons-pack/react-simple-icons'
import type { Database } from '@repo/shared'
import { DatabaseZap, ExternalLink } from 'lucide-react'
import { Image } from '@/components/ui/image'
import { cn } from '@/lib/utils'
import { formatDate } from '@/utils/formater'

function getIcon(arg0: string): import('react').ReactNode {
  const iconClass = 'h-5 w-5 shrink-0'
  switch (arg0) {
    case 'agora':
      return <SiAgora className={iconClass} />
    case 'supabase':
      return <SiSupabase className={iconClass} />
    case 'flutter':
      return <SiFlutter className={iconClass} />
    case 'next':
      return <SiNextdotjs className={iconClass} />
    case 'typescript':
      return <SiTypescript className={iconClass} />
    case 'dart':
      return <SiDart className={iconClass} />
    case 'postgres':
      return <SiPostgresql className={iconClass} />
    case 'bash':
      return <SiGnubash className={iconClass} />
    case 'hono':
      return <SiHono className={iconClass} />
    case 'nuxt':
      return <SiNuxt className={iconClass} />
    case 'dotnet':
      return <SiDotnet className={iconClass} />
    case 'git':
      return <SiGit className={iconClass} />
    case 'mongodb':
      return <SiMongodb className={iconClass} />
    case 'telegram':
      return <SiTelegram className={iconClass} />
    case 'payloadcms':
      return <SiPayloadcms className={iconClass} />
    case 'sanity':
      return <SiSanity className={iconClass} />
    case 'sql':
      return <DatabaseZap className={iconClass} />
    case 'fastapi':
      return <SiFastapi className={iconClass} />
    case 'aws':
      return <SiCloudcannon className={iconClass} />
    case 'python':
      return <SiPython className={iconClass} />
    default:
      return <div />
  }
}

/** Format state + type into a readable "what I built" sub-line. */
function formatRoleLine(state: string | null, types: string[]): string {
  const stateLabel =
    state === 'production'
      ? 'In Production'
      : state === 'ongoing'
        ? 'Ongoing'
        : state === 'finished'
          ? 'Completed'
          : null

  const typeLabels = types.map((t) => t.charAt(0).toUpperCase() + t.slice(1))
  const typeStr = typeLabels.join(' · ')

  return stateLabel ? `${stateLabel} — ${typeStr}` : typeStr
}

/** Extract 1-2 initials from a title for the placeholder. */
function getInitials(title: string): string {
  return title
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const ProjectItem = ({
  item,
}: {
  item: Database['public']['Tables']['projects']['Row']
}) => {
  const projectUrl =
    item.publication_status === 'published' && item.slug
      ? `/projects/${item.slug}`
      : item.url || null

  const isInternalLink = projectUrl?.startsWith('/')

  return (
    <div
      className={cn(
        'flex py-8 px-4 transition-all duration-150 ease-linear flex-col space-y-4 ',
        'hover:scale-[1.02] hover:drop-shadow-sm',
        'group/card',
        'items-start',
        'justify-center',
      )}
    >
      {/* ── Project image (or initials placeholder) ── */}
      <div className="h-[350px] w-full overflow-hidden bg-primary/10">
        {item.main_image_url ? (
          <Image
            src={item.main_image_url}
            alt={item.title ?? 'Project screenshot'}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <span className="select-none text-6xl font-bold text-primary/30">
              {item.title ? getInitials(item.title) : '?'}
            </span>
          </div>
        )}
      </div>

      {/* ── Type badges ── */}
      <div className="flex space-x-2">
        {item.type.map((t, index) => (
          <div
            key={index}
            className={cn('border-r pr-2 last:border-none font-semibold text-sm')}
          >
            {t}
          </div>
        ))}
      </div>

      {/* ── Title + year ── */}
      <div className="flex flex-col items-start space-y-2">
        {projectUrl ? (
          <div className="flex items-center space-x-1 border-b-2">
            <a
              href={projectUrl}
              {...(isInternalLink ? {} : { target: '_blank', rel: 'noopener' })}
              className={cn('text-xl font-bold', 'underline-offset-4')}
            >
              {item.title}
            </a>
            {!isInternalLink && <ExternalLink className="w-4 h-4" />}
          </div>
        ) : (
          <div className={cn('text-xl font-bold')}>{item.title}</div>
        )}
        <div className={cn('text-xs text-muted-foreground')}>
          {formatDate(item.project_date, 'YYYY')}
        </div>
      </div>

      {/* ── "What I built" sub-line ── */}
      <div className="text-sm font-medium text-muted-foreground">
        {formatRoleLine(item.state, item.type)}
      </div>

      {/* ── Description (3-4 lines visible by default) ── */}
      <div className="line-clamp-4 text-sm leading-relaxed">{item.description}</div>

      {/* ── Tech stack (always shows icon + name) ── */}
      <div className="flex flex-wrap gap-2">
        {item.tech_stack.map((tech, ix) => (
          <div
            key={ix}
            className={cn(
              'flex items-center gap-1.5 border border-secondary/30 px-2.5 py-1.5 text-sm',
              'hover:bg-primary hover:text-white transition-colors',
            )}
          >
            <span className="shrink-0">{getIcon(tech.toLowerCase())}</span>
            <span>{tech}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
