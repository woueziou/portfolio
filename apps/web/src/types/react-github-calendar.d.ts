declare module 'react-github-calendar' {
  import type { ComponentType } from 'react'

  interface GitHubCalendarProps {
    username: string
    blockSize?: number
    blockMargin?: number
    color?: string
    fontSize?: number
    hideColorLegend?: boolean
    hideMonthLabels?: boolean
    hideTotalCount?: boolean
    showColorLegend?: boolean
    style?: React.CSSProperties
    theme?: {
      light?: string[]
      dark?: string[]
    }
    throwOnError?: boolean
    errorMessage?: string
    // biome-ignore lint/suspicious/noExplicitAny: third-party type declaration
    transformData?: (contributions: any[]) => any[]
    labels?: {
      totalCount?: string
    }
  }

  export const GitHubCalendar: ComponentType<GitHubCalendarProps>
  export default GitHubCalendar
}
