import { Eye, FileText, FolderOpen, PenLine, Plus, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { navigate } from 'astro:transitions/client'
import { Button } from '@/components/ui/button'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

interface Stats {
  totalProjects: number
  publishedProjects: number
  draftProjects: number
  totalArticles: number
  todayViews: number
  monthViews: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const supabase = createSupabaseBrowserClient()
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        navigate('/admin/login')
        return
      }
      setAuthLoading(false)

      const today = new Date().toISOString().slice(0, 10)
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .slice(0, 10)

      const [
        { count: totalProjects },
        { count: publishedProjects },
        { count: draftProjects },
        { count: totalArticles },
        todayViews,
        monthViews,
      ] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('publication_status', 'published'),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('publication_status', 'draft'),
        supabase.from('articles').select('*', { count: 'exact', head: true }),
        supabase.from('page_views').select('count').eq('date', today),
        supabase.from('page_views').select('count').gte('date', monthStart),
      ])

      const todayCount = (todayViews.data || []).reduce((sum: number, r: { count: number }) => sum + (r.count || 0), 0)
      const monthCount = (monthViews.data || []).reduce((sum: number, r: { count: number }) => sum + (r.count || 0), 0)

      setStats({
        totalProjects: totalProjects ?? 0,
        publishedProjects: publishedProjects ?? 0,
        draftProjects: draftProjects ?? 0,
        totalArticles: totalArticles ?? 0,
        todayViews: todayCount,
        monthViews: monthCount,
      })
      setLoading(false)
    }
    init()
  }, [])

  if (authLoading) return null
  if (loading) return <div className="animate-pulse space-y-4">{' '}<div className="h-24 bg-muted rounded" />{' '}</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Overview of your portfolio</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Eye className="h-4 w-4" />
            <span className="text-xs font-medium">Today</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{stats!.todayViews}</p>
          <p className="text-xs text-muted-foreground mt-1">{stats!.monthViews} this month</p>
        </div>
        <div className="bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <FolderOpen className="h-4 w-4" />
            <span className="text-xs font-medium">Projects</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{stats!.totalProjects}</p>
          <p className="text-xs text-muted-foreground mt-1">{stats!.publishedProjects} published</p>
        </div>
        <div className="bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <PenLine className="h-4 w-4" />
            <span className="text-xs font-medium">Drafts</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{stats!.draftProjects}</p>
        </div>
        <div className="bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <FileText className="h-4 w-4" />
            <span className="text-xs font-medium">Articles</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{stats!.totalArticles}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a href="/admin/projects/new">
              <Plus className="h-4 w-4 mr-1.5" />
              New Project
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="/admin/articles/new">
              <Plus className="h-4 w-4 mr-1.5" />
              New Article
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="/admin/projects">
              View Projects
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
