import type { Database } from '@portfolio/shared'
import type { HomeArticle, HomeProject } from '@/components/home/projects/model'
import { createSupabaseAnonClient } from '@/lib/supabase/anon'

type ProjectRow = Database['public']['Tables']['projects']['Row']
type ArticleRow = Database['public']['Tables']['articles']['Row']

export interface HomeProfile {
  firstName: string
  lastName: string
  title: string
  bio: string
  avatarUrl: string | null
  initials: string
}

export interface TechstackInfo {
  id: string
  name: string
  icon: string
}

export interface ProjectPage {
  project: ProjectRow
  techstacks: TechstackInfo[]
  articles: Pick<
    ArticleRow,
    | 'id'
    | 'title'
    | 'slug'
    | 'content'
    | 'published_at'
    | 'created_at'
    | 'reading_time_minutes'
    | 'status'
  >[]
  authorName: string
}

const PROJECT_CARD_COLUMNS =
  'id, title, description, main_image_url, url, access_link, state, project_date, type, tech_stack, slug, publication_status'
const ARTICLE_CARD_COLUMNS =
  'id, title, slug, summary, image_url, published_at, reading_time_minutes, status'

/** Unwrap a Supabase result; any error fails the build instead of shipping an empty site. */
function unwrap<T>(name: string, result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(`[build-data] ${name} failed: ${result.error.message}`)
  if (result.data === null) throw new Error(`[build-data] ${name} returned no data`)
  return result.data
}

function toProfile(
  row: {
    first_name: string
    last_name: string
    title: string
    description: string | null
    avatar_url: string | null
  } | null,
): HomeProfile {
  return {
    firstName: row?.first_name || 'Taas',
    lastName: row?.last_name || 'Ekpaye',
    title: row?.title || 'Full Stack Engineer',
    bio:
      row?.description ||
      'From building my first Flutter app in 2019 to deploying AI-powered tools in 2026 — each project marks a step forward.',
    avatarUrl: row?.avatar_url || null,
    initials:
      `${(row?.first_name || 'T').charAt(0)}${(row?.last_name || 'E').charAt(0)}`.toUpperCase(),
  }
}

export async function getHomeData() {
  const supabase = createSupabaseAnonClient()

  const [projectsRes, articlesRes, profileRes, configRes] = await Promise.all([
    supabase
      .from('projects')
      .select(PROJECT_CARD_COLUMNS)
      .eq('publication_status', 'published')
      .order('project_date', { ascending: false }),
    supabase
      .from('articles')
      .select(ARTICLE_CARD_COLUMNS)
      .eq('status', 'published')
      .order('published_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('first_name, last_name, title, description, avatar_url')
      .limit(1)
      .maybeSingle(),
    supabase.from('site_config').select('social_links').limit(1).maybeSingle(),
  ])

  const projects = unwrap<HomeProject[]>('projects', projectsRes)
  if (projects.length === 0) {
    throw new Error('[build-data] no published project found; refusing to build an empty site')
  }
  const articles = unwrap<HomeArticle[]>('articles', articlesRes)
  if (profileRes.error) throw new Error(`[build-data] profile failed: ${profileRes.error.message}`)
  if (configRes.error)
    throw new Error(`[build-data] site_config failed: ${configRes.error.message}`)

  return {
    profile: toProfile(profileRes.data),
    socialLinks: (configRes.data?.social_links ?? {}) as Record<string, string>,
    projects,
    articles,
  }
}

export async function getProjectPages(): Promise<ProjectPage[]> {
  const supabase = createSupabaseAnonClient()

  const [projectsRes, profileRes] = await Promise.all([
    supabase
      .from('projects')
      .select(
        `*, project_techstacks(techstack_id, techstacks(id, name, icon)), articles(id, title, slug, content, published_at, created_at, reading_time_minutes, status)`,
      )
      .eq('publication_status', 'published'),
    supabase.from('profiles').select('first_name, last_name').limit(1).maybeSingle(),
  ])

  type Row = ProjectRow & {
    project_techstacks: { techstack_id: string; techstacks: TechstackInfo | null }[] | null
    articles: ProjectPage['articles'] | null
  }
  const rows = unwrap<Row[]>('project pages', projectsRes as never)
  if (profileRes.error) throw new Error(`[build-data] profile failed: ${profileRes.error.message}`)
  const authorName = profileRes.data
    ? `${profileRes.data.first_name} ${profileRes.data.last_name}`
    : 'Taas S. Ekpaye'

  return rows
    .filter((r) => Boolean(r.slug))
    .map(({ project_techstacks, articles, ...project }) => ({
      project: project as ProjectRow,
      techstacks: (project_techstacks ?? [])
        .map((pt) => pt.techstacks)
        .filter((t): t is TechstackInfo => t !== null),
      articles: (articles ?? [])
        .filter((a) => a.status === 'published')
        .sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? '')),
      authorName,
    }))
}
