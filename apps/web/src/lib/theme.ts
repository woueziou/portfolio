export type ThemePreference = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

/** New key: the previous 'theme' key stored an explicit light/dark and would pin everyone. */
export const THEME_STORAGE_KEY = 'theme-preference'

export function parsePreference(value: string | null): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'system'
}

export function resolveTheme(preference: ThemePreference, systemDark: boolean): ResolvedTheme {
  if (preference === 'system') return systemDark ? 'dark' : 'light'
  return preference
}

/** system -> light -> dark -> system */
export function nextPreference(current: ThemePreference): ThemePreference {
  if (current === 'system') return 'light'
  if (current === 'light') return 'dark'
  return 'system'
}
