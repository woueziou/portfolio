import { Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  nextPreference,
  parsePreference,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from '@/lib/theme'
import { Button } from './ui/button'

const query = () => window.matchMedia('(prefers-color-scheme: dark)')

function readPreference(): ThemePreference {
  return parsePreference(localStorage.getItem(THEME_STORAGE_KEY))
}

function applyPreference(preference: ThemePreference) {
  const dark = resolveTheme(preference, query().matches) === 'dark'
  document.documentElement.classList.toggle('dark', dark)
}

const LABELS: Record<ThemePreference, string> = {
  system: 'Theme: follows your device',
  light: 'Theme: light',
  dark: 'Theme: dark',
}

export default function ThemeSwitcher() {
  const [preference, setPreference] = useState<ThemePreference>('system')

  useEffect(() => {
    const sync = () => {
      const current = readPreference()
      setPreference(current)
      applyPreference(current)
    }
    sync()

    // Follow the device live while in "system" mode.
    const media = query()
    const onSystemChange = () => {
      if (readPreference() === 'system') applyPreference('system')
    }
    media.addEventListener('change', onSystemChange)
    document.addEventListener('astro:page-load', sync)
    document.addEventListener('astro:after-swap', sync)

    return () => {
      media.removeEventListener('change', onSystemChange)
      document.removeEventListener('astro:page-load', sync)
      document.removeEventListener('astro:after-swap', sync)
    }
  }, [])

  function cycle() {
    const next = nextPreference(preference)
    setPreference(next)
    if (next === 'system') localStorage.removeItem(THEME_STORAGE_KEY)
    else localStorage.setItem(THEME_STORAGE_KEY, next)
    applyPreference(next)
  }

  const Icon = preference === 'system' ? Monitor : preference === 'dark' ? Moon : Sun

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      onClick={cycle}
      aria-label={`${LABELS[preference]}. Click to change.`}
      title={LABELS[preference]}
      className="size-11 cursor-pointer bg-background/70 backdrop-blur-sm"
    >
      <Icon className="size-5" />
    </Button>
  )
}
