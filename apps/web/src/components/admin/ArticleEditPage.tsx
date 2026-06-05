import { navigate } from 'astro:transitions/client'
import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import EditorShell from './editor/EditorShell'

export default function ArticleEditPage() {
  const [article, setArticle] = useState<Record<string, unknown> | null>(null)
  const [projects, setProjects] = useState<Array<{ id: number; title: string }>>([])
  const [loading, setLoading] = useState(true)

  const articleId = Number(new URLSearchParams(window.location.search).get('id'))

  useEffect(() => {
    async function init() {
      if (!articleId) {
        navigate('/admin/articles')
        return
      }

      const supabase = createSupabaseBrowserClient()

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        navigate('/admin/login')
        return
      }

      const { data: articleData, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single()

      if (error || !articleData) {
        navigate('/admin/articles')
        return
      }

      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, title')
        .order('title')

      setArticle(articleData as Record<string, unknown>)
      setProjects((projectsData as Array<{ id: number; title: string }>) || [])
      setLoading(false)
    }
    init()
  }, [articleId])

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-64 bg-muted rounded" /></div>
  }

  if (!article) return null

  const a = article as {
    id: number
    title: string
    slug: string
    status: 'draft' | 'published' | 'archived'
    published_at: string | null
    updated_at: string
    content: unknown
    summary: string | null
    image_url: string | null
    url: string | null
    project_id: number | null
    created_at: string
    reading_time_minutes: number | null
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Article</h1>
          <p className="mt-1 text-sm text-muted-foreground">{a.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/admin/articles"
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            Back to Articles
          </a>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <EditorShell
          article={{
            id: a.id,
            title: a.title,
            slug: a.slug,
            status: a.status,
            published_at: a.published_at,
            updated_at: a.updated_at,
            content: a.content,
            summary: a.summary,
            image_url: a.image_url,
            url: a.url,
          }}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Article Info</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-muted-foreground">Created</dt>
            <dd className="text-sm text-foreground">{new Date(a.created_at).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Last Updated</dt>
            <dd className="text-sm text-foreground">{new Date(a.updated_at).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Published At</dt>
            <dd className="text-sm text-foreground">
              {a.published_at ? new Date(a.published_at).toLocaleString() : 'Not published'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Reading Time</dt>
            <dd className="text-sm text-foreground">
              {a.reading_time_minutes ? `${a.reading_time_minutes} min` : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Linked Project</dt>
            <dd className="text-sm text-foreground">
              {a.project_id ? (projects.find(p => p.id === a.project_id)?.title || '—') : 'Standalone'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
