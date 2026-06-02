# Task Checklist: Projects & Articles Publishing System

## Decisions Confirmed (Locked)
- [x] Q1: Approve Astro `output: 'hybrid'`
- [x] Q2: Use Option A (`/admin/*` inside `apps/web`)
- [x] Q3: Use TipTap editor
- [x] Q4: Use simple publication workflow (`draft -> published -> archived`)
- [x] Q5: Support both standalone and project-linked articles
- [x] Q6: Use Supabase Storage for uploads

## Phase 1: Database Schema Evolution
- [ ] Run migration to alter `projects` table (add slug, publication_status, published_at, access_link, triggers)
- [ ] Run migration to alter `articles` table (add slug, content, content_html, status, project_id, reading_time_minutes, triggers)
- [ ] Update RLS policies for projects and articles (replace permissive public-read policies with publication-aware policies)
- [ ] Create Supabase Storage bucket `content-images` and configure access policies

## Phase 2: Authentication & Admin Foundation
- [ ] Switch Astro to hybrid output mode and install `@astrojs/vercel` and `@supabase/ssr` dependencies
- [ ] Configure `apps/web/astro.config.mjs` with Vercel adapter
- [ ] Create `src/lib/supabase/server.ts` for server-side Supabase client
- [ ] Create `src/lib/supabase/browser.ts` for browser-side Supabase client
- [ ] Create `src/middleware.ts` for `/admin/*` route protection
- [ ] Create Admin layout `src/layouts/AdminLayout.astro`
- [ ] Create `src/pages/admin/login.astro` and `src/components/admin/LoginForm.tsx` React island
- [ ] Create `/admin` dashboard landing page
- [ ] Set `export const prerender = false` on dynamic/auth routes (`/admin/*`, `/projects/[slug]`) to ensure SSR behavior in hybrid mode

## Phase 3: Project CRUD in Admin
- [ ] Define Zod validation schemas for project metadata
- [ ] Create Astro Actions entry point `src/actions/index.ts`
- [ ] Create `src/actions/auth.ts` (actions for `login` and `signOut`)
- [ ] Create `src/actions/projects.ts` (actions for `create`, `update`, `delete`, `publish`, `uploadImage`)
- [ ] Create `ProjectList.tsx` dashboard component with pagination and status badges
- [ ] Create `ProjectForm.tsx` metadata manager with tag inputs
- [ ] Implement create/edit views under `/admin/projects/`

## Phase 4: Rich Text Editor (Medium-like)
- [ ] Install TipTap editor packages
- [ ] Create `ArticleEditor.tsx` main component with auto-save indicator
- [ ] Create `FloatingToolbar.tsx` for text selection formatting
- [ ] Create `SlashCommandMenu.tsx` for block insertions
- [ ] Create `ImageUpload.tsx` for drag-drop / paste uploading via Actions
- [ ] Create `CodeBlockComponent.tsx` with syntax highlighting
- [ ] Implement server-side HTML rendering helper for cached HTML

## Phase 5: Project Detail Pages (Public)
- [ ] Create dynamic SSR route `src/pages/projects/[slug].astro`
- [ ] Build `ArticleRenderer.astro` utilizing `@tailwindcss/typography`
- [ ] Integrate JSON-LD TechArticle schema and SEO meta tags
- [ ] Update home project card components (`project-item.tsx` / `project-client.tsx`) to link to `/projects/:slug`
- [ ] Keep homepage static unless live publish visibility requires SSR or client-side revalidation

## Phase 6: Publication Workflow
- [ ] Create `StatusBadge.tsx` and `PublishDialog.tsx` for publication checks
- [ ] Implement draft/publish/archive state transitions

## Phase 7: Quality Controls & Testing
- [ ] Update root `biome.jsonc` formatting and lint rules
- [ ] Add unit tests for slug generation, reading time, and form schemas
- [ ] Verify production build (`bun run build`)
