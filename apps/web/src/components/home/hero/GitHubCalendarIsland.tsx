import GitHubCalendar from '@/components/GitHubCalendar'

/**
 * Standalone React island wrapping the GitHubCalendar component.
 * Used with client:visible so it hydrates only when scrolled near.
 */
export default function GitHubCalendarIsland() {
  return (
    <div className="py-8 lg:flex items-center justify-center">
      <GitHubCalendar />
    </div>
  )
}
