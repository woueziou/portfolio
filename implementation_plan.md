# Implementation Plan - Next.js to TanStack Start & Bun Monorepo Migration

We will migrate the portfolio website from Next.js 15 App Router to a Bun-powered monorepo using TanStack Start, Tailwind v4, and Stunk for state management.

## User Review Required

> [!IMPORTANT]
> - **Workspaces Configuration**: We will create a workspace structure with `apps/ui` (TanStack Start), `apps/supabase` (Supabase functions), and `packages/shared` (shared client/types). The current `web` directory containing Next.js will be kept until final cleanup in Phase 6.
> - **Tailwind v4 Upgrade**: The Next.js application currently uses Tailwind v3 (`3.4.1`). We will migrate to Tailwind v4 in `apps/ui` and integrate custom styles (colors, fonts, etc.) from `tailwind.config.ts`.
> - **Font handling**: We will copy the local font files (`Baufra`) from Next.js `public/baufra` to `apps/ui/public/baufra` and reference them correctly using CSS `@import`.
> - **Supabase Auth & Client**: We will migrate to the shared `@repo/shared` Supabase client using standard `@supabase/supabase-js`, and handle user session tracking using Stunk store.

## Proposed Changes

### Component 1: Monorepo Root & Shared Package

Create workspace files at the root and under `packages/shared`.

#### [NEW] [package.json](file:///Users/woueziou/works/personal_projects/portfolio/package.json)
Configure root workspace package.json with workspace configurations and scripts.

#### [NEW] [packages/shared/package.json](file:///Users/woueziou/works/personal_projects/portfolio/packages/shared/package.json)
Shared library containing `@supabase/supabase-js`.

#### [NEW] [packages/shared/src/supabase.ts](file:///Users/woueziou/works/personal_projects/portfolio/packages/shared/src/supabase.ts)
Supabase client using environment variables.

#### [NEW] [packages/shared/src/index.ts](file:///Users/woueziou/works/personal_projects/portfolio/packages/shared/src/index.ts)
Re-exports the supabase client.

---

### Component 2: Bootstrap `apps/ui` (TanStack Start)

Initialise and configure the new TanStack Start frontend app.

#### [NEW] [apps/ui/package.json](file:///Users/woueziou/works/personal_projects/portfolio/apps/ui/package.json)
TanStack Start UI application configuration.

#### [NEW] [apps/ui/vite.config.ts](file:///Users/woueziou/works/personal_projects/portfolio/apps/ui/vite.config.ts)
Vite configuration with TanStack Router, Tailwind v4, and react plugins.

#### [NEW] [apps/ui/tsconfig.json](file:///Users/woueziou/works/personal_projects/portfolio/apps/ui/tsconfig.json)
Typescript configuration mapping path aliases.

#### [NEW] [apps/ui/src/__root.tsx](file:///Users/woueziou/works/personal_projects/portfolio/apps/ui/src/__root.tsx)
Root layout using TanStack Router `<Outlet />` and initializing auth.

#### [NEW] [apps/ui/src/routes/index.tsx](file:///Users/woueziou/works/personal_projects/portfolio/apps/ui/src/routes/index.tsx)
Index page mapping `/` route with a loader for projects.

---

### Component 3: Tailwind v4 and UI Components

Migrate Tailwind and add components.

#### [NEW] [apps/ui/src/index.css](file:///Users/woueziou/works/personal_projects/portfolio/apps/ui/src/index.css)
Tailwind v4 css file containing theme configurations, variables, and imported Baufra font styles.

#### [NEW] [apps/ui/src/lib/utils.ts](file:///Users/woueziou/works/personal_projects/portfolio/apps/ui/src/lib/utils.ts)
Copy shadcn helper function.

#### [NEW] [apps/ui/src/components/ui/image.tsx](file:///Users/woueziou/works/personal_projects/portfolio/apps/ui/src/components/ui/image.tsx)
Create a thin image wrapper for `next/image` replacement.

---

### Component 4: State Management & Stores

Setup Stunk store and authentication synchronization.

#### [NEW] [apps/ui/src/stores/auth.store.ts](file:///Users/woueziou/works/personal_projects/portfolio/apps/ui/src/stores/auth.store.ts)
Authentication store utilizing Stunk atoms.

---

## Verification Plan

### Automated Tests
- Run `bunx tsc --noEmit` across all workspaces to ensure type safety.
- Run `bun run build` in the monorepo root to verify successful builds.

### Manual Verification
- Start the Vite dev server with `bun dev` and inspect the layout, typography, projects loading state, and styling matching the original application.
- Check Supabase integration and verify project data loads successfully.
