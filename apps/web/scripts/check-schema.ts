/**
 * Build-time schema health check.
 *
 * Runs before `astro build` to verify that the Supabase database schema matches
 * what the application expects. If the schema is out of date the build fails
 * with a clear message, preventing a broken deployment from reaching production.
 *
 * Requires the following env vars to be available at build time:
 *   SUPABASE_URL      — your project URL (e.g. https://xxx.supabase.co)
 *   SUPABASE_ANON_KEY — your project anon/public key
 *
 * On Vercel: mark both variables as "Build" in the Environment Variables settings.
 */

import { createClient } from '@supabase/supabase-js'
import { assertCoreSchema } from '../src/lib/supabase/schema-health'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn(
    '[schema-check] SUPABASE_URL or SUPABASE_ANON_KEY not set — skipping schema check.\n' +
    '  To enable: add both as Build environment variables in Vercel (or your local .env).',
  )
  process.exit(0)
}

console.log('[schema-check] Verifying database schema...')

const supabase = createClient(url, key)

try {
  await assertCoreSchema(supabase)
  console.log('[schema-check] ✓ All tables and views are present.')
} catch (err) {
  console.error(
    '[schema-check] ✗ Schema check failed — apply pending Supabase migrations before deploying.\n',
    err instanceof Error ? err.message : err,
  )
  process.exit(1)
}
