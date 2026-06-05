import { navigate } from 'astro:transitions/client'
import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

export default function AdminNav() {
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient()
      const { data } = await supabase.auth.getSession()
      if (data.session?.user) {
        const u = data.session.user
        setUserName(u.user_metadata?.full_name || u.email || 'Admin')
      } else {
        navigate('/admin/login')
      }
    }
    load()
  }, [])

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const initial = userName?.charAt(0).toUpperCase() || 'A'

  return (
    <div className="flex items-center gap-2 pl-2">
      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
        {initial}
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
        aria-label="Sign out"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </div>
  )
}
