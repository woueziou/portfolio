import { navigate } from 'astro:transitions/client'
import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import ProfileForm from './ProfileForm'

interface ProfileData {
  id: string
  first_name: string | null
  last_name: string | null
  title: string | null
  description: string | null
  avatar_url: string | null
  username: string | null
  socials: Record<string, string> | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [accountEmail, setAccountEmail] = useState('')

  useEffect(() => {
    async function init() {
      const supabase = createSupabaseBrowserClient()

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        navigate('/admin/login')
        return
      }

      const userId = session.session.user.id
      setAccountEmail(session.session.user.email ?? '')

      const [{ data: profileData }, { data: configs }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('site_config').select('social_links').eq('id', 1).single(),
      ])

      setProfile((profileData as ProfileData | null) ?? null)
      setSocialLinks(((configs as Record<string, unknown>)?.social_links as Record<string, string>) || {})
      setLoading(false)
    }
    init()
  }, [])

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-48 bg-muted rounded" /></div>
  }

  if (!profile) {
    return (
      <div role="alert" className="border border-destructive/40 p-4 text-sm space-y-1">
        <p className="font-medium">No profile found for this account.</p>
        <p className="text-muted-foreground">
          You are signed in as {accountEmail || 'an unknown account'}, which does not own the portfolio
          profile. Sign out and sign in with the owner account to edit it.
        </p>
      </div>
    )
  }

  return (
    <ProfileForm
      profile={profile}
      socialLinks={socialLinks}
    />
  )
}
