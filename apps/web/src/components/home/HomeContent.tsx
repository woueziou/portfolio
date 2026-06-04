import { useEffect, useState } from 'react'
import type { Database } from '@portfolio/shared'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { withTimeout } from '@/lib/supabase/with-timeout'
import ContentTabs from './content-tabs'
import GitHubCalendarIsland from './hero/GitHubCalendarIsland'

type Project = Database['public']['Tables']['projects']['Row']
type Article = Database['public']['Tables']['articles']['Row']

interface ProfileData {
  firstName: string
  lastName: string
  title: string
  bio: string
  avatarUrl: string | null
  initials: string
}

interface HeroStaticProps {
  profile: ProfileData
  socialLinks: Record<string, string>
}

/* ── Lazy-load HeroStatic — only the Astro component, wrapped as a React island ── */

function HeroSkeleton() {
  return (
    <div className="w-full rounded-md relative flex flex-col items-center justify-center antialiased animate-pulse">
      <div className="w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44 bg-muted rounded-full" />
      <div className="grid place-items-center md:gap-y-2 pt-4">
        <div className="h-10 w-64 bg-muted rounded lg:h-16 lg:w-96" />
        <div className="h-6 w-48 bg-muted rounded mt-4" />
        <div className="h-4 w-80 bg-muted rounded mt-4" />
      </div>
    </div>
  )
}

export default function HomeContent() {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false
    const supabase = createSupabaseBrowserClient()

    async function fetchData() {
      const [projectsRes, articlesRes, profilesRes, configRes] = await Promise.all([
        withTimeout(
          supabase
            .from('projects')
            .select('id, title, description, main_image_url, url, access_link, state, project_date, type, tech_stack, slug, publication_status')
            .order('project_date', { ascending: false }),
          8000,
          { data: null, error: { message: 'Projects query timed out' } } as any,
        ),
        withTimeout(
          supabase
            .from('articles')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false }),
          8000,
          { data: null, error: { message: 'Articles query timed out' } } as any,
        ),
        withTimeout(
          supabase
            .from('profiles')
            .select('first_name, last_name, title, description, avatar_url, username')
            .limit(1),
          8000,
          { data: null, error: { message: 'Profile query timed out' } } as any,
        ),
        withTimeout(
          supabase.from('site_config').select('social_links').limit(1),
          8000,
          { data: null, error: { message: 'Site config query timed out' } } as any,
        ),
      ])

      if (cancelled) return

      const p = profilesRes?.data?.[0]
      const sl = (configRes?.data?.[0]?.social_links || {}) as Record<string, string>

      setProjects((projectsRes?.data || []) as Project[])
      setArticles((articlesRes?.data || []) as Article[])
      setProfile({
        firstName: p?.first_name || 'Taas',
        lastName: p?.last_name || 'Ekpaye',
        title: p?.title || 'Full Stack Engineer',
        bio:
          p?.description ||
          'From building my first Flutter app in 2019 to deploying AI-powered tools in 2026 — each project marks a step forward.',
        avatarUrl: p?.avatar_url || null,
        initials: `${(p?.first_name || 'T').charAt(0)}${(p?.last_name || 'E').charAt(0)}`.toUpperCase(),
      })
      setSocialLinks(sl)
      setLoading(false)
    }

    fetchData()
    return () => { cancelled = true }
  }, [])

  return (
    <>
      <section id="hero">
        {loading ? (
          <HeroSkeleton />
        ) : (
          <HeroStaticShell profile={profile!} socialLinks={socialLinks} />
        )}
        <GitHubCalendarIsland />
      </section>

      <section
        id="projects"
        className="w-full px-4 sm:px-6 md:px-8 lg:px-12 mx-auto max-w-7xl pt-16 pb-8 scroll-mt-20"
      >
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-64 w-full bg-muted/50 rounded animate-pulse" />
          </div>
        ) : (
          <ContentTabs projects={projects} articles={articles} />
        )}
      </section>
    </>
  )
}

/* ── HeroStatic rendered as a React component (same output as hero-static.astro) ── */

function HeroStaticShell({ profile, socialLinks }: HeroStaticProps) {
  const fullName = `${profile.firstName} ${profile.lastName}`
  const yearsSince2019 = new Date().getFullYear() - 2019

  const socialIcons: Record<string, string> = {
    github:
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>',
    linkedin:
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>',
    medium:
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12Zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42c1.87 0 3.38 2.88 3.38 6.42ZM24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12Z"/></svg>',
    email:
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  }

  const contacts: Array<{ name: string; value: string; icon: string; type: 'email' | 'url' }> = []
  if (socialLinks.github) contacts.push({ name: 'Github', value: socialLinks.github, icon: socialIcons.github, type: 'url' })
  if (socialLinks.email) contacts.push({ name: 'Email', value: socialLinks.email, icon: socialIcons.email, type: 'email' })
  if (socialLinks.medium) contacts.push({ name: 'Medium', value: socialLinks.medium, icon: socialIcons.medium, type: 'url' })
  if (socialLinks.linkedin) contacts.push({ name: 'LinkedIn', value: socialLinks.linkedin, icon: socialIcons.linkedin, type: 'url' })

  return (
    <div className="w-full rounded-md relative flex flex-col items-center justify-center antialiased">
      <div className="w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44 bg-muted rounded-full overflow-hidden flex items-center justify-center ring-2 ring-border">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={`${fullName} portrait`} width={200} height={200} loading="eager" className="w-full h-full object-cover" />
        ) : (
          <span className="select-none text-2xl font-bold text-muted-foreground md:text-4xl">{profile.initials}</span>
        )}
      </div>
      <div className="grid place-items-center md:gap-y-2 pt-4">
        <h1 className="text-3xl font-black lg:text-7xl font-audiowide">{fullName}</h1>
        <div className="row-span-1 flex flex-col items-center md:gap-8 gap-2">
          <h3 className="text-balance text-muted-foreground px-8 py-2 rounded-full lg:text-xl font-semibold flex items-center space-x-2">
            <div className="font-extrabold item flex h-8 w-8 justify-center rounded-sm items-center">{yearsSince2019}+</div>
            <div>{profile.title}</div>
          </h3>
          <p className="max-w-md text-center text-sm italic">{profile.bio}</p>
          <div className="md:flex md:space-x-4 grid gap-y-4">
            {contacts.map((contact) =>
              contact.type === 'email' ? (
                <button
                  key={contact.value}
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(contact.value).then(
                      () => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Email copied to clipboard!' } })),
                      () => {},
                    )
                  }}
                  className="h-10 flex space-x-2 items-center border border-secondary/30 px-4 hover:bg-accent hover:text-accent-foreground active:scale-95 transition-all duration-150 relative overflow-hidden"
                  aria-label="Copy email"
                >
                  <span dangerouslySetInnerHTML={{ __html: contact.icon }} />
                  <span>{contact.value}</span>
                </button>
              ) : (
                <a
                  key={contact.name}
                  href={contact.value}
                  target="_blank"
                  rel="noopener"
                  className="h-10 flex space-x-2 items-center border border-secondary/30 px-4 hover:bg-accent hover:text-accent-foreground active:scale-95 transition-all duration-150 relative overflow-hidden"
                >
                  <span dangerouslySetInnerHTML={{ __html: contact.icon }} />
                  <span>{contact.name}</span>
                </a>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
