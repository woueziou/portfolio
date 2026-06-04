import GitHubCalendar from '@/components/GitHubCalendar'

/**
 * Standalone React island wrapping the GitHubCalendar component.
 * Used with client:visible so it hydrates only when scrolled near.
 */
export default function GitHubCalendarIsland() {
  return (
    <div className="pt-4 w-full flex justify-center px-2">
      <GitHubCalendar />
    </div>
  )
}
