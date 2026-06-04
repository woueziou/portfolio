import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface HeroAvatarProps {
  src: string | null | undefined
  alt: string
  initials: string
}

/**
 * Avatar with shadcn's Radix Avatar (handles image error fallback internally).
 * Extracted as a single React component so Radix context works in Astro SSR.
 */
export default function HeroAvatar({ src, alt, initials }: HeroAvatarProps) {
  return (
    <Avatar className="w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44 ring-2 ring-border">
      <AvatarImage src={src ?? undefined} alt={alt} className="object-cover" />
      <AvatarFallback className="text-2xl md:text-4xl font-bold">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
