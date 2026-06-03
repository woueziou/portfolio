import { useEffect, useState } from 'react'
import { GitHubCalendar as ReactGitHubCalendar } from 'react-github-calendar'

type ApiResponse = {
  total: Record<string, number>
  contributions: Array<{ date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }>
}

const YEAR = 'last'

const lightTheme = ['#ece9e0', '#c4bc9d', '#9b8e62', '#6b5d3a', '#3d3220']
const darkTheme = ['#1c1a14', '#2d281a', '#4a3f24', '#7a683a', '#c49a3c']

function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark')
}

export default function GitHubCalendar() {
  const [totalContributions, setTotalContributions] = useState<number | null>(null)
  const [error, setError] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetch(`https://github-contributions-api.jogruber.de/v4/woueziou?y=${YEAR}`)
      .then((res) => res.json())
      .then((data: ApiResponse) => {
        if (!cancelled) {
          setTotalContributions(data.total.lastYear ?? null)
        }
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Track dark mode via class on <html>
  useEffect(() => {
    setDark(isDarkMode())

    const observer = new MutationObserver(() => {
      setDark(isDarkMode())
    })

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Total contributions — prominent */}
      <div className="text-center">
        {error ? (
          <p className="text-sm text-muted-foreground">Could not load contribution data.</p>
        ) : totalContributions !== null ? (
          <>
            <span className="text-3xl font-bold tabular-nums">
              {totalContributions.toLocaleString()}
            </span>
            <span className="ml-1.5 text-base text-muted-foreground">
              public contributions this year
            </span>
          </>
        ) : (
          <div className="h-9 w-48 animate-pulse rounded bg-muted" />
        )}
      </div>

      {/* Calendar */}
      <div className="w-full overflow-x-auto">
        <ReactGitHubCalendar
          username="woueziou"
          theme={{ light: dark ? darkTheme : lightTheme }}
          showColorLegend
          labels={{
            totalCount: '{{count}} contributions in the last year',
          }}
        />
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Public contributions on GitHub. I also contribute to private repositories.
      </p>
    </div>
  )
}
