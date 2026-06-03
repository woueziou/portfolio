import { actions } from 'astro:actions'
import { useEffect, useState } from 'react'
import { useFileDialog } from '@mantine/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Save,
  User,
  Briefcase,
  ImageIcon,
  Upload,
  Github,
  Mail,
  Globe,
  Link2,
  PenLine,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfileFormProps {
  profile: {
    id: string
    first_name: string | null
    last_name: string | null
    title: string | null
    description: string | null
    avatar_url: string | null
    username: string | null
    socials: Record<string, string> | null
  }
  socialLinks: Record<string, string>
}

export default function ProfileForm({
  profile,
  socialLinks,
}: ProfileFormProps) {
  const [firstName, setFirstName] = useState(profile.first_name || '')
  const [lastName, setLastName] = useState(profile.last_name || '')
  const [title, setTitle] = useState(profile.title || '')
  const [description, setDescription] = useState(profile.description || '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [githubUsername, setGithubUsername] = useState(
    socialLinks.github?.replace('https://github.com/', '') || ''
  )
  const [email, setEmail] = useState(socialLinks.email || '')
  const [mediumUsername, setMediumUsername] = useState(
    socialLinks.medium?.replace('https://medium.com/@', '') || ''
  )
  const [linkedinUsername, setLinkedinUsername] = useState(
    socialLinks.linkedin?.replace('https://www.linkedin.com/in/', '').replace(/\/$/, '') || ''
  )
  const [website, setWebsite] = useState(socialLinks.website || '')

  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [status, setStatus] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const avatarDialog = useFileDialog({
    accept: 'image/*',
    multiple: false,
  })

  // Handle avatar upload
  useEffect(() => {
    const uploadFile = async () => {
      if (avatarDialog.files && avatarDialog.files.length > 0) {
        const file = avatarDialog.files[0]
        setUploadingAvatar(true)
        setStatus(null)

        try {
          const formData = new FormData()
          formData.append('file', file)

          const { data, error: uploadError } =
            await actions.projects.uploadImage(formData)

          if (uploadError) {
            setStatus({ type: 'error', message: uploadError.message })
          } else if (data?.url) {
            setAvatarUrl(data.url)
            setStatus({ type: 'success', message: 'Avatar uploaded' })
          }
        } catch {
          setStatus({ type: 'error', message: 'Failed to upload avatar' })
        } finally {
          setUploadingAvatar(false)
        }
      }
    }

    uploadFile()
  }, [avatarDialog.files])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    try {
      // Update profile
      const { error: profileError } = await actions.profiles.update({
        first_name: firstName,
        last_name: lastName,
        title,
        description,
        avatar_url: avatarUrl,
      })

      if (profileError) {
        setStatus({ type: 'error', message: profileError.message })
        return
      }

      // Update social links in site_config
      const newSocialLinks: Record<string, string> = {}
      if (githubUsername) newSocialLinks.github = `https://github.com/${githubUsername}`
      if (email) newSocialLinks.email = email
      if (mediumUsername) newSocialLinks.medium = `https://medium.com/@${mediumUsername}`
      if (linkedinUsername) newSocialLinks.linkedin = `https://www.linkedin.com/in/${linkedinUsername}`
      if (website) newSocialLinks.website = website

      const { error: configError } = await actions.siteConfig.update({
        social_links: newSocialLinks,
      })

      if (configError) {
        setStatus({ type: 'error', message: configError.message })
        return
      }

      setStatus({ type: 'success', message: 'Profile saved successfully!' })
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'An error occurred',
      })
    } finally {
      setLoading(false)
    }
  }

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U'

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
      {/* Avatar Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <User className="h-4 w-4" />
          Profile Photo
        </div>
        <div className="flex items-center gap-6">
          <div
            onClick={() => !uploadingAvatar && avatarDialog.open()}
            className={cn(
              'relative h-24 w-24 bg-muted flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden',
              uploadingAvatar && 'pointer-events-none opacity-70'
            )}
          >
            {uploadingAvatar ? (
              <div className="h-6 w-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            ) : avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                {initials}
              </span>
            )}
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Upload className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Change Photo
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Click the avatar to upload a new photo
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG or WebP, max 5MB
            </p>
          </div>
        </div>
      </section>

      {/* Personal Info */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <User className="h-4 w-4" />
          Personal Information
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="border-0 bg-muted/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="border-0 bg-muted/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title" className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            Professional Title
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Full Stack Engineer"
            className="border-0 bg-muted/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="flex items-center gap-1.5">
            <PenLine className="h-3.5 w-3.5" />
            Bio
          </Label>
          <Textarea
            id="bio"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="From building my first Flutter app in 2019 to deploying AI-powered tools in 2026 — each project marks a step forward."
            className="border-0 bg-muted/50 resize-none"
          />
        </div>
      </section>

      {/* Account */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Mail className="h-4 w-4" />
          Account
        </div>

        <div className="space-y-2">
          <Label htmlFor="github" className="flex items-center gap-1.5">
            <Github className="h-3.5 w-3.5" />
            GitHub Username
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground shrink-0">
              github.com/
            </span>
            <Input
              id="github"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="username"
              className="border-0 bg-muted/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="border-0 bg-muted/50"
          />
        </div>
      </section>

      {/* Social Links */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Link2 className="h-4 w-4" />
          Social Links
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medium" className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              Medium
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground shrink-0">
                medium.com/@
              </span>
              <Input
                id="medium"
                value={mediumUsername}
                onChange={(e) => setMediumUsername(e.target.value)}
                placeholder="username"
                className="border-0 bg-muted/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin" className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              LinkedIn
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground shrink-0">
                linkedin.com/in/
              </span>
              <Input
                id="linkedin"
                value={linkedinUsername}
                onChange={(e) => setLinkedinUsername(e.target.value)}
                placeholder="username"
                className="border-0 bg-muted/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              Website
            </Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yoursite.com"
              className="border-0 bg-muted/50"
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={loading}>
          <Save className="h-4 w-4 mr-1.5" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        {status && (
          <span
            className={cn(
              'text-sm',
              status.type === 'success' ? 'text-green-600' : 'text-destructive'
            )}
          >
            {status.message}
          </span>
        )}
      </div>
    </form>
  )
}
