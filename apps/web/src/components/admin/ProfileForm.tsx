import { actions } from 'astro:actions'
import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useStore } from '@tanstack/react-store'
import { z } from 'zod'
import { useFileDialog } from '@mantine/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { cn } from '@/lib/utils'
import {
  Save,
  User,
  Briefcase,
  Upload,
  Github,
  Mail,
  Globe,
  Link2,
  PenLine,
} from 'lucide-react'

/* -------------------------------------------------------------------------- */
/*  Zod schema (mirrors the server action schema)                             */
/* -------------------------------------------------------------------------- */

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  title: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function extractUsername(url: string, prefix: string): string {
  return url.replace(prefix, '').replace(/\/$/, '') || ''
}

/** Run a Zod schema as a TanStack Form field validator */
function zodValidator<T>(schema: z.ZodSchema<T>) {
  return ({ value }: { value: unknown }) => {
    const result = schema.safeParse(value)
    return result.success ? undefined : result.error.issues[0]?.message
  }
}

export default function ProfileForm({
  profile,
  socialLinks,
}: ProfileFormProps) {
  // --------------- social-link state (not in profile table) ---------------
  const [githubUsername, setGithubUsername] = useState(
    extractUsername(socialLinks.github ?? '', 'https://github.com/'),
  )
  const [email, setEmail] = useState(socialLinks.email ?? '')
  const [mediumUsername, setMediumUsername] = useState(
    extractUsername(socialLinks.medium ?? '', 'https://medium.com/@'),
  )
  const [linkedinUsername, setLinkedinUsername] = useState(
    extractUsername(socialLinks.linkedin ?? '', 'https://www.linkedin.com/in/'),
  )
  const [website, setWebsite] = useState(socialLinks.website ?? '')

  // --------------- UI state ---------------
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [status, setStatus] = useState<
    { type: 'success' | 'error'; message: string } | null
  >(null)

  const avatarDialog = useFileDialog({
    accept: 'image/jpeg,image/png,image/gif,image/webp',
    multiple: false,
  })

  // --------------- TanStack Form ---------------
  const form = useForm({
    defaultValues: {
      first_name: profile.first_name ?? '',
      last_name: profile.last_name ?? '',
      title: profile.title ?? '',
      description: profile.description ?? '',
    },
    onSubmit: async ({ value }) => {
      setStatus(null)

      try {
        // Build social links map
        const newSocialLinks: Record<string, string> = {}
        if (githubUsername) newSocialLinks.github = `https://github.com/${githubUsername}`
        if (email) newSocialLinks.email = email
        if (mediumUsername) newSocialLinks.medium = `https://medium.com/@${mediumUsername}`
        if (linkedinUsername) newSocialLinks.linkedin = `https://www.linkedin.com/in/${linkedinUsername}`
        if (website) newSocialLinks.website = website

        // Update profile (includes socials to keep both tables in sync)
        const { error: profileError } = await actions.profiles.update({
          first_name: value.first_name,
          last_name: value.last_name,
          title: value.title,
          description: value.description,
          socials: newSocialLinks,
        })

        if (profileError) {
          setStatus({ type: 'error', message: profileError.message })
          return
        }

        // Update social links in site_config
        const { error: configError } = await actions.siteConfig.update({
          social_links: newSocialLinks,
        })

        if (configError) {
          setStatus({ type: 'error', message: configError.message })
          return
        }

        setStatus({ type: 'success', message: 'Profile saved successfully!' })

        // Refresh with latest data from server
        await refreshData()
      } catch (err) {
        setStatus({
          type: 'error',
          message: err instanceof Error ? err.message : 'An error occurred',
        })
      }
    },
  })

  // --------------- Refetch after save ---------------
  const refreshData = async () => {
    try {
      const [profileResult, configResult] = await Promise.all([
        actions.profiles.get(),
        actions.siteConfig.get(),
      ])

      if (profileResult.data?.profile) {
        const p = profileResult.data.profile
        form.setFieldValue('first_name', p.first_name ?? '')
        form.setFieldValue('last_name', p.last_name ?? '')
        form.setFieldValue('title', p.title ?? '')
        form.setFieldValue('description', p.description ?? '')
        // avatar_url is managed independently — no form field to sync
      }

      if (configResult.data?.config?.social_links) {
        const sl = configResult.data.config.social_links as Record<string, string>
        setGithubUsername(extractUsername(sl.github ?? '', 'https://github.com/'))
        setEmail(sl.email ?? '')
        setMediumUsername(extractUsername(sl.medium ?? '', 'https://medium.com/@'))
        setLinkedinUsername(extractUsername(sl.linkedin ?? '', 'https://www.linkedin.com/in/'))
        setWebsite(sl.website ?? '')
      }
    } catch {
      // silent — user can refresh manually
    }
  }

  // --------------- Avatar upload ---------------
  useEffect(() => {
    const uploadFile = async () => {
      if (!avatarDialog.files?.length) return

      const file = avatarDialog.files[0]
      setUploadingAvatar(true)
      setAvatarError(null)

      try {
        const fd = new FormData()
        fd.append('file', file)

        // Uploads, cleans up old avatar, and persists URL to profile in one call
        const { data, error: uploadError } = await actions.profiles.uploadAvatar(fd)

        if (uploadError) {
          setAvatarError(uploadError.message)
        } else if (data?.url) {
          setAvatarUrl(data.url)
          // await actions.profiles.update({ avatar_url: data.url }) 
        }
      } catch {
        setAvatarError('Failed to upload avatar')
      } finally {
        setUploadingAvatar(false)
      }
    }

    uploadFile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarDialog.files])

  // --------------- Reactive subscriptions ---------------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formValues = useStore(form.store, (s: any) => s.values) as ProfileFormValues
  const firstName = formValues.first_name ?? ''
  const lastName = formValues.last_name ?? ''

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U'

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */
  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      {/* ======================================================== */}
      {/* Avatar Section                                           */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <User className="h-4 w-4" />
          Profile Photo
        </div>

        <div className="flex items-center gap-6">
          {/* Avatar preview + upload trigger */}
          <div
            onClick={() => !uploadingAvatar && avatarDialog.open()}
            className={cn(
              'relative h-24 w-24 bg-muted flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden rounded-md',
              uploadingAvatar && 'pointer-events-none opacity-70',
            )}
          >
            {uploadingAvatar ? (
              <div className="h-6 w-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            ) : avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                {initials}
              </span>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Upload className="h-5 w-5 text-white" />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">Change Photo</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click the avatar to upload a new photo
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG or WebP, max 5MB
            </p>
            {uploadingAvatar && (
              <p className="text-xs text-muted-foreground mt-1">Uploading…</p>
            )}
            {avatarError && (
              <p className="text-xs text-destructive mt-1">{avatarError}</p>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* Personal Information                                     */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <User className="h-4 w-4" />
          Personal Information
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <form.Field
            name="first_name"
            validators={{ onChange: zodValidator(profileSchema.shape.first_name) }}
          >
            {(field) => (
              <FormItem>
                <FormLabel htmlFor={field.name} required>
                  First Name
                </FormLabel>
                <FormControl>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    required
                    className="border-0 bg-muted/50"
                  />
                </FormControl>
                <FormMessage field={field} />
              </FormItem>
            )}
          </form.Field>

          <form.Field
            name="last_name"
            validators={{ onChange: zodValidator(profileSchema.shape.last_name) }}
          >
            {(field) => (
              <FormItem>
                <FormLabel htmlFor={field.name} required>
                  Last Name
                </FormLabel>
                <FormControl>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    required
                    className="border-0 bg-muted/50"
                  />
                </FormControl>
                <FormMessage field={field} />
              </FormItem>
            )}
          </form.Field>
        </div>

        <form.Field
          name="title"
          validators={{ onChange: zodValidator(profileSchema.shape.title) }}
        >
          {(field) => (
            <FormItem>
              <FormLabel htmlFor={field.name} className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                Professional Title
              </FormLabel>
              <FormControl>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="e.g., Full Stack Engineer"
                  className="border-0 bg-muted/50"
                />
              </FormControl>
              <FormMessage field={field} />
            </FormItem>
          )}
        </form.Field>

        <form.Field
          name="description"
          validators={{ onChange: zodValidator(profileSchema.shape.description) }}
        >
          {(field) => (
            <FormItem>
              <FormLabel htmlFor="bio" className="flex items-center gap-1.5">
                <PenLine className="h-3.5 w-3.5" />
                Bio
              </FormLabel>
              <FormControl>
                <Textarea
                  id="bio"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  rows={3}
                  placeholder="From building my first Flutter app in 2019 to deploying AI-powered tools in 2026 — each project marks a step forward."
                  className="border-0 bg-muted/50 resize-none"
                />
              </FormControl>
              <FormMessage field={field} />
            </FormItem>
          )}
        </form.Field>
      </section>

      {/* ======================================================== */}
      {/* Account                                                  */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Mail className="h-4 w-4" />
          Account
        </div>

        <FormItem>
          <FormLabel htmlFor="github" className="flex items-center gap-1.5">
            <Github className="h-3.5 w-3.5" />
            GitHub Username
          </FormLabel>
          <FormControl>
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
          </FormControl>
        </FormItem>

        <FormItem>
          <FormLabel htmlFor="email" className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            Email
          </FormLabel>
          <FormControl>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="border-0 bg-muted/50"
            />
          </FormControl>
        </FormItem>
      </section>

      {/* ======================================================== */}
      {/* Social Links                                             */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Link2 className="h-4 w-4" />
          Social Links
        </div>

        <div className="space-y-4">
          <FormItem>
            <FormLabel htmlFor="medium" className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              Medium
            </FormLabel>
            <FormControl>
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
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel htmlFor="linkedin" className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              LinkedIn
            </FormLabel>
            <FormControl>
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
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel htmlFor="website" className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              Website
            </FormLabel>
            <FormControl>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yoursite.com"
                className="border-0 bg-muted/50"
              />
            </FormControl>
          </FormItem>
        </div>
      </section>

      {/* ======================================================== */}
      {/* Actions                                                  */}
      {/* ======================================================== */}
      <div className="flex items-center gap-3">
        <form.Subscribe
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          selector={(s: any) => ({
            isSubmitting: s.isSubmitting,
          })}
        >
          {(sub) => (
            <Button type="submit" size="sm" disabled={sub.isSubmitting}>
              <Save className="h-4 w-4 mr-1.5" />
              {sub.isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </form.Subscribe>

        {status && (
          <span
            className={cn(
              'text-sm',
              status.type === 'success' ? 'text-green-600' : 'text-destructive',
            )}
          >
            {status.message}
          </span>
        )}
      </div>
    </Form>
  )
}
