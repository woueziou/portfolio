const SERVER_TIMEOUT_MS = 8000 // Vercel Hobby: 10s, leave 2s buffer
const CLIENT_TIMEOUT_MS = 5000

type Thenable<T> = { then: (onfulfilled: (value: T) => unknown) => unknown }

/**
 * Wraps a thenable (e.g. a Supabase query builder) with a timeout.
 * If the promise doesn't settle within `ms` milliseconds, it rejects
 * with a timeout error.
 *
 * When a `fallback` value is provided, the function returns the
 * fallback on timeout instead of throwing — useful for graceful
 * degradation.
 */
export async function withTimeout<T>(
  thenable: Thenable<T>,
  ms: number = SERVER_TIMEOUT_MS,
  fallback?: T,
): Promise<T> {
  if (typeof window !== 'undefined') ms = CLIENT_TIMEOUT_MS
  try {
    return await Promise.race([
      Promise.resolve(thenable),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Supabase query timed out')), ms),
      ),
    ])
  } catch (err) {
    if (fallback !== undefined) return fallback
    throw err
  }
}
