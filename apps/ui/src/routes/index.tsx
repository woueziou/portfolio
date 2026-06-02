import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '@repo/shared'
import Hero from '@/components/home/hero/hero'
import ProjectClient from '@/components/home/projects/project-client'
import { ProjectItemSkeleton } from '@/components/home/projects/project-item-skeleton'
import { Suspense } from 'react'

export const Route = createFileRoute('/')({
  loader: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select()
      .order('project_date', { ascending: false })
      
    if (error || !data) {
      throw new Error(error?.message || 'Failed to fetch projects')
    }
    return { projects: data }
  },
  component: Home,
})

function Home() {
  const { projects } = Route.useLoaderData()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Hero />
      <div className="grid w-full grid-cols-1 container mx-auto place-items-center pt-8 gap-y-10">
        <h1 className="text-2xl font-bold uppercase underline underline-offset-8">Projects</h1>
        <Suspense fallback={<ProjectItemSkeleton />}>
          <ProjectClient data={projects} />
        </Suspense>
      </div>
    </div>
  )
}
