import { SiGithub, SiMedium } from '@icons-pack/react-simple-icons'
import { Linkedin, Mail } from 'lucide-react'
import { useCallback, useState } from 'react'
import type React from 'react'
import GitHubCalendar from '@/components/GitHubCalendar'
import { showToast } from '@/components/ui/toast'
import { Image } from '@/components/ui/image'
import { cn } from '@/lib/utils'

type ContactType = {
  name: string
  value: string
  icon: React.ReactNode
  type: 'email' | 'url'
}

interface HeroProps {
  profile: {
    firstName: string
    lastName: string
    title: string
    bio: string
    avatarUrl: string | null
    initials: string
  }
  socialLinks: Record<string, string>
}

/** Track an outbound link click (analytics placeholder). */
function trackOutbound(label: string, url: string) {
  if (typeof window !== 'undefined') {
    console.info('[track] outbound', { label, url })
  }
}

export default function Hero({ profile, socialLinks }: HeroProps) {
  const linkClass =
    'h-10 flex space-x-2 items-center border border-secondary/30 px-4 hover:bg-accent hover:text-accent-foreground active:scale-95 transition-all duration-150'

  const fullName = `${profile.firstName} ${profile.lastName}`

  // Build contacts from social links
  const contacts: ContactType[] = []

  if (socialLinks.github) {
    contacts.push({
      name: 'Github',
      value: socialLinks.github,
      icon: <SiGithub className="h-5 w-5" />,
      type: 'url',
    })
  }

  if (socialLinks.email) {
    contacts.push({
      name: 'Email',
      value: socialLinks.email,
      icon: <Mail className="h-5 w-5" />,
      type: 'email',
    })
  }

  if (socialLinks.medium) {
    contacts.push({
      name: 'Medium',
      value: socialLinks.medium,
      icon: <SiMedium className="h-5 w-5" />,
      type: 'url',
    })
  }

  if (socialLinks.linkedin) {
    contacts.push({
      name: 'LinkedIn',
      value: socialLinks.linkedin,
      icon: <Linkedin className="h-5 w-5" />,
      type: 'url',
    })
  }

  function getYearsSince2019(): number {
    const currentYear = new Date().getFullYear()
    return currentYear - 2019
  }

  const yearsSince2019 = `${getYearsSince2019()}+`

  const handleEmailClick = useCallback((email: string) => {
    trackOutbound('email', email)
    navigator.clipboard.writeText(email).then(
      () => showToast('Email copied to clipboard!'),
      () => { },
    )
  }, [])

  const handleUrlClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, name: string, url: string) => {
      trackOutbound(name, url)
    },
    [],
  )

  const [imgError, setImgError] = useState(false)

  return (
    <div className="md:h-[90vh] w-full rounded-md relative flex flex-col items-center justify-center antialiased">
      <div
        className={cn(
          'w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-background rounded-full flex items-center justify-center',
        )}
      >
        {imgError || !profile.avatarUrl ? (
          <span className="select-none text-2xl font-bold text-muted-foreground md:text-4xl">
            {profile.initials}
          </span>
        ) : (
          <Image
            alt={`${fullName} portrait`}
            src={profile.avatarUrl}
            width={200}
            height={200}
            loading="eager"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className={cn('grid place-items-center md:gap-y-2 pt-4', '')}>
        <h1 className={cn('text-3xl font-black lg:text-7xl font-audiowide')}>
          {fullName}
        </h1>
        <div className="row-span-1 flex flex-col items-center md:gap-8 gap-2">
          <h3 className="text-balance text-muted-foreground px-8 py-2 rounded-full lg:text-xl font-semibold flex items-center space-x-2">
            <div className="font-extrabold item flex h-8 w-8 justify-center rounded-sm items-center">
              {yearsSince2019}
            </div>
            <div>{profile.title}</div>
          </h3>
          <p className="max-w-md text-center text-sm text-muted-foreground/70 italic">
            {profile.bio}
          </p>
          <div className={cn('md:flex md:space-x-4', 'grid gap-y-4')}>
            {contacts.map((contact, index) => {
              if (contact.type === 'email') {
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleEmailClick(contact.value)}
                    className={cn(
                      linkClass,
                      'relative overflow-hidden',
                      'after:absolute after:inset-0 after:rounded-[inherit] after:bg-primary/10 after:opacity-0 after:transition-opacity after:duration-300 active:after:opacity-100',
                    )}
                  >
                    <span>{contact.icon}</span>
                    <span>{contact.value}</span>
                  </button>
                )
              }
              return (
                <a
                  key={index}
                  target="_blank"
                  href={contact.value}
                  onClick={(e) => handleUrlClick(e, contact.name, contact.value)}
                  className={cn(
                    linkClass,
                    'relative overflow-hidden',
                    'after:absolute after:inset-0 after:rounded-[inherit] after:bg-primary/10 after:opacity-0 after:transition-opacity after:duration-300 active:after:opacity-100',
                  )}
                  rel="noopener"
                >
                  <span>{contact.icon}</span>
                  <span>{contact.name}</span>
                </a>
              )
            })}
          </div>
          <div className={cn('pt-4 md:w-full', 'w-screen px-2')}>
            <GitHubCalendar />
          </div>
        </div>
      </div>
    </div>
  )
}
