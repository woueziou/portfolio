import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

/**
 * Format in UTC so the build server and every visitor's browser agree
 * (a local-timezone format breaks hydration and shifts dates near midnight).
 */
export const formatDate = (date: Date | string, format?: string) => {
  return dayjs.utc(date).format(format ?? 'YYYY-MM-DD')
}
