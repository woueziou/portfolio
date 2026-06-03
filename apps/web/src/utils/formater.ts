import dayjs from 'dayjs'

export const formatDate = (date: Date | string, format?: string) => {
  return dayjs(date).format(format ?? 'YYYY-MM-DD')
}
