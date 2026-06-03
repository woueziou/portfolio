# Task Checklist: Projects & Articles Publishing System

## Decisions Confirmed (Locked)
- [x] Q1: Approve Astro `output: 'hybrid'`
- [x] Q2: Use Option A (`/admin/*` inside `apps/web`)
- [x] Q3: Use TipTap editor
- [x] Q4: Use simple publication workflow (`draft -> published -> archived`)
- [x] Q5: Support both standalone and project-linked articles
- [x] Q6: Use Supabase Storage for uploads

## Execution Workflow (Local Supabase -> Commit Later)

### 1) Branch + Local Services
- [ ] Create/confirm feature branch for this work.
- [ ] Start local Supabase from `apps/supabase`: `supabase start`.
- [ ] Verify local stack health before coding: `supabase status`.

### 2) Per-Phase Development Loop
- [ ] Implement only one phase at a time.
- [ ] For DB changes, create migrations in `apps/supabase/supabase/migrations/` and apply locally with `supabase db reset`.
- [ ] Run phase-specific tests (unit/integration/manual checks listed below).
- [ ] Run baseline checks after each phase: `bun run typecheck`, `bun run build`.
- [ ] Keep changes uncommitted until the phase passes validation and checklist items are marked done.

### 3) Commit-Later Strategy
- [ ] After each fully validated phase, stage files but postpone commit if desired.
- [ ] At the end, create clean commits grouped by phase (recommended), or one final commit if you want a single squashed history.
- [ ] Before final commit(s), run full verification: tests, lint, typecheck, build, manual QA.

## Phase 1: Database Schema Evolution
- [x] Create migration to alter `projects` table (add slug, publication_status, published_at, access_link, updated_at trigger)
- [x] Create migration to alter `articles` table (add slug, content, content_html, status, project_id nullable, reading_time_minutes, updated_at trigger)
- [x] Add/verify indexes for `projects.slug`, `projects.publication_status`, `articles.slug`, `articles.status`, `articles.project_id`
- [x] Update RLS policies for projects and articles (drop/replace permissive public-read policies with publication-aware policies)
- [x] Create Supabase Storage bucket `content-images` and configure access policies
- [x] Validate migrations locally with `supabase db reset`
- [x] Add SQL verification checks (schema + policy assertions)

### Phase 1 Tests & Validation
- [x] Confirm `publication_status` defaults to `draft` for new projects.
- [x] Confirm article `project_id` is optional (standalone + linked article both valid).
- [x] Confirm `updated_at` triggers update on row modification.
- [x] Confirm anon cannot read draft/archived rows; anon can read published rows.
- [x] Confirm authenticated owner can CRUD own rows and cannot manage others' rows.
- [x] Confirm storage policy allows authenticated uploads and public reads.

## Phase 2: Authentication & Admin Foundation
- [x] Switch Astro to server output mode (Astro 5.18 uses `output: 'server'` instead of 'hybrid') and install `@astrojs/vercel@9` and `@supabase/ssr` dependencies
- [x] Configure `apps/web/astro.config.mjs` with Vercel adapter
- [x] Create `src/lib/supabase/server.ts` for server-side Supabase client
- [x] Create `src/lib/supabase/browser.ts` for browser-side Supabase client
- [x] Create `src/middleware.ts` for `/admin/*` route protection
- [x] Create Admin layout `src/layouts/AdminLayout.astro`
- [x] Create `src/pages/admin/login.astro` and `src/components/admin/LoginForm.tsx` React island
- [x] Create `/admin` dashboard landing page
- [x] Set `export const prerender = true` on static pages (index, 404) since we're using `output: 'server'`

### Phase 2 Tests & Validation
- [x] Unit test auth helpers and cookie/session handling.
- [x] Integration test middleware route protection (`/admin/login` public, `/admin/*` protected).
- [x] Manual test login success/failure and redirect behavior.
- [x] Verify non-admin/public pages still render correctly in hybrid mode.

## Phase 3: Project CRUD in Admin
- [x] Define Zod validation schemas for project metadata
- [x] Create Astro Actions entry point `src/actions/index.ts`
- [x] Create `src/actions/auth.ts` (actions for `login` and `signOut`)
- [x] Create `src/actions/projects.ts` (actions for `create`, `update`, `delete`, `publish`, `uploadImage`)
- [x] Create `ProjectList.tsx` dashboard component with pagination and status badges
- [x] Create `ProjectForm.tsx` metadata manager with tag inputs
- [x] Implement create/edit views under `/admin/projects/`

### Phase 3 Tests & Validation
- [x] Unit test Zod schemas (valid payloads + expected failures).
- [x] Integration test actions: create/update/delete/publish/upload image.
- [x] Verify slug generation/uniqueness behavior.
- [x] Manual test admin CRUD flow end-to-end with local Supabase.

## Phase 4: Rich Text Editor (Medium-like)
- [x] Install TipTap editor packages
- [x] Create `ArticleEditor.tsx` main component with auto-save indicator
- [x] Create `FloatingToolbar.tsx` for text selection formatting
- [x] Create `SlashCommandMenu.tsx` for block insertions
- [x] Create `ImageUpload.tsx` for drag-drop / paste uploading via Actions
- [x] Create `CodeBlockComponent.tsx` with syntax highlighting
- [x] Implement server-side HTML rendering helper for cached HTML

### Phase 4 Tests & Validation
- [ ] Unit test reading time utility and HTML rendering helper (`content` -> `content_html`).
- [ ] Component tests for editor behavior (input, formatting toggles, autosave debounce).
- [ ] Integration test image upload path (Supabase Storage URL returned and persisted).
- [ ] Manual test editor UX on desktop and mobile widths.

## Phase 5: Project Detail Pages (Public)
- [ ] Create dynamic SSR route `src/pages/projects/[slug].astro`
- [ ] Build `ArticleRenderer.astro` utilizing `@tailwindcss/typography`
- [ ] Integrate JSON-LD TechArticle schema and SEO meta tags
- [ ] Update home project card components (`project-item.tsx` / `project-client.tsx`) to link to `/projects/:slug`
- [ ] Keep homepage static unless live publish visibility requires SSR or client-side revalidation

### Phase 5 Tests & Validation
- [ ] Integration test slug route resolution for existing/missing slugs.
- [ ] Snapshot/assert rendered article HTML and metadata tags.
- [ ] Validate JSON-LD output and canonical URL.
- [ ] Manual SEO check (title, description, OG image, twitter card).

## Phase 6: Publication Workflow
- [ ] Create `StatusBadge.tsx` and `PublishDialog.tsx` for publication checks
- [ ] Implement draft/publish/archive state transitions

### Phase 6 Tests & Validation
- [ ] Unit/integration tests for allowed status transitions.
- [ ] Verify `published_at` is set on first publish and preserved appropriately.
- [ ] Verify publish/unpublish/archive visibility in public queries.
- [ ] Manual test workflow from admin UI.

## Phase 7: Quality Controls & Testing
- [ ] Update root `biome.jsonc` formatting and lint rules
- [ ] Add unit tests for slug generation, reading time, and form schemas
- [ ] Add integration test coverage for middleware, actions, RLS-sensitive data access
- [ ] Verify production build (`bun run build`)
- [ ] Final full validation run:
  - [ ] `bun run test`
  - [ ] `bun run typecheck`
  - [ ] `bunx biome check .`
  - [ ] `bun run build`
  - [ ] `supabase db reset`
