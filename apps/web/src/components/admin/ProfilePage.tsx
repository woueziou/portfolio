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

  useEffect(() => {
    async function init() {
      const supabase = createSupabaseBrowserClient()

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        navigate('/admin/login')
        return
      }

      const userId = session.session.user.id

      const [{ data: profileData }, { data: configs }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('site_config').select('social_links').eq('id', 1).single(),
      ])

      setProfile(
        (profileData as ProfileData) || {
          id: userId,
          first_name: '',
          last_name: '',
          title: '',
          description: '',
          avatar_url: '',
          username: '',
          socials: {},
        },
      )
      setSocialLinks(((configs as Record<string, unknown>)?.social_links as Record<string, string>) || {})
      setLoading(false)
    }
    init()
  }, [])

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-48 bg-muted rounded" /></div>
  }

  if (!profile) return null

  return (
    <ProfileForm
      profile={profile}
      socialLinks={socialLinks}
    />
  )
}
