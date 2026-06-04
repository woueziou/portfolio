import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

function getTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem('theme')
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: 'dark' | 'light') {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export default function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(false)

  // Apply theme on mount and listen for Astro navigation events
  useEffect(() => {
    const theme = getTheme()
    setIsDark(theme === 'dark')
    applyTheme(theme)

    // Re-apply theme after each client-side navigation
    const handlePageLoad = () => {
      const currentTheme = getTheme()
      setIsDark(currentTheme === 'dark')
      applyTheme(currentTheme)
    }

    document.addEventListener('astro:page-load', handlePageLoad)
    document.addEventListener('astro:after-swap', handlePageLoad)

    return () => {
      document.removeEventListener('astro:page-load', handlePageLoad)
      document.removeEventListener('astro:after-swap', handlePageLoad)
    }
  }, [])

  function toggle() {
    const next = !isDark
    setIsDark(next)
    applyTheme(next ? 'dark' : 'light')
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex items-center justify-center size-9 rounded-md text-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  )
}
