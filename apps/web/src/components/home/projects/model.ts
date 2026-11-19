import type { Database } from '@portfolio/shared'

type ProjectRow = Database['public']['Tables']['projects']['Row']
type ArticleRow = Database['public']['Tables']['articles']['Row']

export type ProjectType = ProjectRow

/** Fields the home page needs for a project card (serialized into island props). */
export type HomeProject = Pick<
  ProjectRow,
  | 'id'
  | 'title'
  | 'description'
  | 'main_image_url'
  | 'url'
  | 'access_link'
  | 'state'
  | 'project_date'
  | 'type'
  | 'tech_stack'
  | 'slug'
  | 'publication_status'
>

/** Fields the home page needs for an article card (no article body). */
export type HomeArticle = Pick<
  ArticleRow,
  | 'id'
  | 'title'
  | 'slug'
  | 'summary'
  | 'image_url'
  | 'published_at'
  | 'reading_time_minutes'
  | 'status'
>
