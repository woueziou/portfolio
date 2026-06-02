# Monorepo - TanStack Start & Supabase Portfolio

This is a Bun-powered monorepo containing a TanStack Start application and shared utility packages.

## Monorepo Structure

- `apps/ui`: Frontend application powered by TanStack Start and Tailwind v4.
- `apps/supabase`: Edge Functions and database migrations for local development (empty for now).
- `packages/shared`: Shared library containing the Supabase client and generated database types.

## Getting Started

### Local Development

To run the dev server:

```bash
bun dev
```

This starts the Vite dev server for `apps/ui` at [http://localhost:3000](http://localhost:3000).

### Supabase Local Dev

1. Start the local Supabase environment:
   ```bash
   supabase start
   ```
2. Copy the credentials from `supabase status` and populate `.env` in `apps/ui`:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

## Development Guidelines

### How to Add a New Route

Create a route file in `apps/ui/src/routes/` (e.g., `src/routes/about.tsx`) and export a `Route` using `createFileRoute`:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutComponent,
})

function AboutComponent() {
  return <div>About Page</div>
}
```

The TanStack Router Vite plugin automatically generates code splitting and updates the route tree.

### How to Add a New Store

We use `stunk` for global state management. Create a store file under `apps/ui/src/stores/` (e.g., `src/stores/theme.store.ts`), exporting atoms and actions:

```ts
import { chunk as atom } from 'stunk'

export const themeAtom = atom<'light' | 'dark'>('light')

export function toggleTheme() {
  themeAtom.set((prev) => (prev === 'light' ? 'dark' : 'light'))
}
```

Then consume it in React using:

```tsx
import { useChunk } from 'stunk/use-react'
import { themeAtom } from '@/stores/theme.store'

const [theme] = useChunk(themeAtom)
```

### How to Add a New Server Function

To perform server-side actions, use `createServerFn`:

```ts
import { createServerFn } from '@tanstack/start'

export const submitForm = createServerFn('POST', async (payload: { name: string }) => {
  // Executed on the server
  return { success: true }
})
```

Call it directly from your React components or route loaders:

```tsx
const result = await submitForm({ name: 'Taas' })
```
