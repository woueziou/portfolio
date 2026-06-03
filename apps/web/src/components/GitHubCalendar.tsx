import { useEffect, useState } from 'react'
import { GitHubCalendar as ReactGitHubCalendar } from 'react-github-calendar'
import { cn } from '@/lib/utils'

type ApiResponse = {
  total: Record<string, number>
  contributions: Array<{ date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }>
}

const YEAR = 'last'

export default function GitHubCalendar() {
  const [totalContributions, setTotalContributions] = useState<number | null>(null)
  const [error, setError] = useState(false)

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
      <div className={cn('w-full overflow-x-auto')}>
        <ReactGitHubCalendar showColorLegend={false} username="woueziou" />
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Public contributions on GitHub. I also contribute to private repositories.
      </p>
    </div>
  )
}
