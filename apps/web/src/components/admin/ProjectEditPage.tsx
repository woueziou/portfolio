import { navigate } from 'astro:transitions/client'
import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import ProjectForm from './ProjectForm'

interface ProjectData {
  id: number
  title: string
  description: string
  main_image_url: string | null
  url: string | null
  access_link: string | null
  state: string
  project_date: string | null
  type: string[]
  tech_stack: string[]
  slug: string
}

interface ArticleSummary {
  id: number
  title: string
  slug: string
  status: string
}

export default function ProjectEditPage() {
  const [project, setProject] = useState<ProjectData | null>(null)
  const [articles, setArticles] = useState<ArticleSummary[]>([])
  const [loading, setLoading] = useState(true)

  const projectId = typeof window !== 'undefined'
    ? Number(new URLSearchParams(window.location.search).get('id'))
    : 0

  useEffect(() => {
    async function init() {
      if (!projectId) {
        navigate('/admin/projects')
        return
      }

      const supabase = createSupabaseBrowserClient()

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        navigate('/admin/login')
        return
      }

      const { data: projectData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error || !projectData) {
        navigate('/admin/projects')
        return
      }

      const { data: articlesData } = await supabase
        .from('articles')
        .select('id, title, slug, status')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      setProject(projectData as ProjectData)
      setArticles((articlesData as ArticleSummary[]) || [])
      setLoading(false)
    }
    init()
  }, [projectId])

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-64 bg-muted rounded" /></div>
  }

  if (!project) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Edit Project</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{project.title}</p>
      </div>

      <ProjectForm
        project={project}
        articles={articles}
        onSuccessPath="/admin/projects"
        onCancelPath="/admin/projects"
      />
    </div>
  )
}
