# Next.js to TanStack Start Migration Audit

## Routes inventory

| File | Route | Type | Layout |
|------|-------|------|--------|
| `src/app/page.tsx` | `/` | dynamic | `src/app/layout.tsx` |

## Next.js-specific APIs in use

### `getServerSideProps` / `getStaticProps` / `getStaticPaths`
- None

### `pages/api/*` (API routes)
- None

### `middleware.ts`
- `src/middleware.ts` (updates Supabase session)

### `next/image`
- `src/components/home/hero/hero.tsx`
- `src/components/home/hero/hero.client.tsx`

### `next/font`
- `src/components/home/hero/hero.tsx` (uses `Audiowide` from `next/font/google`)

### `next/link`, `next/navigation`, `next/router`
- None

### `export const dynamic`, `export const revalidate`, and similar directives
- None

## Tailwind version
- `tailwindcss: ^3.4.1`
- **Flag**: `NEEDS MIGRATION (< 4.0)`

## Environment variables
- `process.env.NEXT_PUBLIC_SUPABASE_URL` (used in `src/utils/supabase/client.ts`, `src/utils/supabase/middleware.ts`, `src/utils/supabase/server.ts`)
- `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` (used in `src/utils/supabase/client.ts`, `src/utils/supabase/middleware.ts`, `src/utils/supabase/server.ts`)

## State management
- Theme provider: `src/providers/theme.tsx` (wraps `next-themes`)
- No other global state libraries (Redux, Zustand, SWR, React Query) are in use.
