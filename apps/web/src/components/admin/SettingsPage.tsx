import { navigate } from 'astro:transitions/client'
import { Github, Globe, Link2, LinkedinIcon, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

export default function SettingsPage() {
  const [config, setConfig] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingSite, setSavingSite] = useState(false)
  const [savingSocial, setSavingSocial] = useState(false)
  const [siteStatus, setSiteStatus] = useState<string>('')
  const [socialStatus, setSocialStatus] = useState<string>('')

  useEffect(() => {
    async function init() {
      const supabase = createSupabaseBrowserClient()

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        navigate('/admin/login')
        return
      }

      const { data } = await supabase.from('site_config').select('*').eq('id', 1).single()
      setConfig(data as Record<string, unknown>)
      setLoading(false)
    }
    init()
  }, [])

  async function saveSiteInfo(e: React.FormEvent) {
    e.preventDefault()
    setSavingSite(true)
    setSiteStatus('Saving...')

    const supabase = createSupabaseBrowserClient()
    const form = e.target as HTMLFormElement
    const data: Record<string, unknown> = {}
    const fd = new FormData(form)
    for (const [key, val] of fd.entries()) {
      data[key] = val
    }
    for (const key of ['site_tagline', 'seo_description', 'seo_og_image']) {
      if (!data[key]) data[key] = null
    }

    try {
      const { error } = await supabase.from('site_config').update(data).eq('id', 1)
      if (error) {
        setSiteStatus(`Error: ${error.message}`)
      } else {
        setSiteStatus('Saved successfully!')
      }
    } catch (err: unknown) {
      setSiteStatus(`Error: ${(err as Error).message || 'Unknown error'}`)
    } finally {
      setSavingSite(false)
      setTimeout(() => setSiteStatus(''), 3000)
    }
  }

  async function saveSocialLinks(e: React.FormEvent) {
    e.preventDefault()
    setSavingSocial(true)
    setSocialStatus('Saving...')

    const supabase = createSupabaseBrowserClient()
    const socials: Record<string, string> = {}
    const fields = ['github', 'twitter', 'linkedin', 'website']
    for (const field of fields) {
      const val = (document.getElementById(`social_${field}`) as HTMLInputElement)?.value.trim()
      if (val) socials[field] = val
    }

    try {
      const { error } = await supabase.from('site_config').update({ social_links: socials }).eq('id', 1)
      if (error) {
        setSocialStatus(`Error: ${error.message}`)
      } else {
        setSocialStatus('Saved successfully!')
      }
    } catch (err: unknown) {
      setSocialStatus(`Error: ${(err as Error).message || 'Unknown error'}`)
    } finally {
      setSavingSocial(false)
      setTimeout(() => setSocialStatus(''), 3000)
    }
  }

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-48 bg-muted rounded" /></div>
  }

  const socialLinks = ((config?.social_links as Record<string, string>) || {})

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Configure your site metadata and social links</p>
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Globe className="h-4 w-4" />
          Site Information
        </div>
        <form id="settings-form" className="space-y-4" onSubmit={saveSiteInfo}>
          <div className="space-y-2">
            <Label htmlFor="site_title">Site Title</Label>
            <Input
              id="site_title"
              name="site_title"
              type="text"
              defaultValue={(config?.site_title as string) || 'Portfolio'}
              required
              className="border-0 bg-muted/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site_tagline">Tagline</Label>
            <Input
              id="site_tagline"
              name="site_tagline"
              type="text"
              defaultValue={(config?.site_tagline as string) || ''}
              placeholder="A short description of your site"
              className="border-0 bg-muted/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo_description">SEO Description</Label>
            <Textarea
              id="seo_description"
              name="seo_description"
              rows={3}
              placeholder="Meta description for search engines"
              className="border-0 bg-muted/50 resize-none"
            >{(config?.seo_description as string) || ''}</Textarea>
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo_og_image">Open Graph Image URL</Label>
            <Input
              id="seo_og_image"
              name="seo_og_image"
              type="url"
              defaultValue={(config?.seo_og_image as string) || ''}
              placeholder="https://example.com/og-image.png"
              className="border-0 bg-muted/50"
            />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" size="sm" disabled={savingSite}>
              <Save className="h-4 w-4 mr-1.5" />
              {savingSite ? 'Saving...' : 'Save Site Info'}
            </Button>
            {siteStatus && <span className={`text-sm ${siteStatus.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>{siteStatus}</span>}
          </div>
        </form>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Link2 className="h-4 w-4" />
          Social Links
        </div>
        <form id="social-form" className="space-y-4" onSubmit={saveSocialLinks}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="social_github" className="flex items-center gap-1.5">
                <Github className="h-3.5 w-3.5" />
                GitHub
              </Label>
              <Input
                id="social_github"
                type="url"
                defaultValue={socialLinks.github || ''}
                placeholder="https://github.com/username"
                className="border-0 bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="social_twitter" className="flex items-center gap-1.5">
                <X className="h-3.5 w-3.5" />
                Twitter / X
              </Label>
              <Input
                id="social_twitter"
                type="url"
                defaultValue={socialLinks.twitter || ''}
                placeholder="https://twitter.com/username"
                className="border-0 bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="social_linkedin" className="flex items-center gap-1.5">
                <LinkedinIcon className="h-3.5 w-3.5" />
                LinkedIn
              </Label>
              <Input
                id="social_linkedin"
                type="url"
                defaultValue={socialLinks.linkedin || ''}
                placeholder="https://linkedin.com/in/username"
                className="border-0 bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="social_website" className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Website
              </Label>
              <Input
                id="social_website"
                type="url"
                defaultValue={socialLinks.website || ''}
                placeholder="https://example.com"
                className="border-0 bg-muted/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" size="sm" disabled={savingSocial}>
              <Save className="h-4 w-4 mr-1.5" />
              {savingSocial ? 'Saving...' : 'Save Social Links'}
            </Button>
            {socialStatus && <span className={`text-sm ${socialStatus.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>{socialStatus}</span>}
          </div>
        </form>
      </section>
    </div>
  )
}
