# Projects & Articles Publishing System — Implementation Plan

**Project**: Taas S. Ekpaye Portfolio  
**Date**: 2026-06-02  
**Status**: Planning — Decisions Approved (Ready for Implementation)  

---

## Table of Contents

1. [Current State Summary](#current-state-summary)
2. [User Review Required](#user-review-required)
3. [Open Questions](#open-questions)
4. [Architecture Overview](#architecture-overview)
5. [Phase 1: Database Schema Evolution](#phase-1-database-schema-evolution)
6. [Phase 2: Authentication & Admin Foundation](#phase-2-authentication--admin-foundation)
7. [Phase 3: Project CRUD in Admin](#phase-3-project-crud-in-admin)
8. [Phase 4: Rich Text Editor (Medium-like)](#phase-4-rich-text-editor-medium-like)
9. [Phase 5: Project Detail Pages (Public)](#phase-5-project-detail-pages-public)
10. [Phase 6: Publication Workflow](#phase-6-publication-workflow)
11. [Phase 7: Quality Controls & Testing](#phase-7-quality-controls--testing)
12. [Verification Plan](#verification-plan)

---

## Current State Summary

| Aspect | Status |
|---|---|
| Framework | **Astro 5.10** (SSG, `output: 'static'`) with React islands |
| Monorepo | Bun workspaces: `apps/web`, `apps/supabase`, `packages/shared` (`apps/ui` has been completely removed) |
| Database | **Supabase** — 4 public tables: `profiles`, `projects`, `articles`, `contact_providers` |
| Existing `projects` table | Has `title`, `description`, `main_image_url`, `url`, `state`, `user_id`, `project_date`, `type[]`, `tech_stack[]` |
| Existing `articles` table | Minimal — `id`, `title`, `summary`, `image_url`, `user_id`, `url` (no content body, no slug, no status) |
| Auth | Supabase Auth enabled (email provider), but **no auth code currently exists** (old `apps/ui` has been removed) |
| Admin panel | **Does not exist** |
| Project detail pages | **Do not exist** |
| Rich text editor | **Does not exist** |
| Deployment | Vercel, static output |

---

## User Review Required

### SSG → Hybrid (SSR) Migration Required
The current Astro app uses `output: 'static'` (pure SSG). To support:
- Authentication (admin login)
- Dynamic project detail pages (slug-based)
- Server-side API endpoints (CRUD operations)
- Protected admin routes

We **must** switch to `output: 'hybrid'` (or `output: 'server'`). This means:
- Adding a Vercel adapter (`@astrojs/vercel`)
- Some pages remain static (homepage), others are server-rendered on demand
- Vercel deployment changes from pure static CDN to serverless functions

**Recommendation**: Use `output: 'hybrid'` — static by default, opt-in SSR for admin and dynamic pages.

### Admin Panel Location Decision
Two options for the admin panel:

**Option A — Admin as a route in `apps/web`** (Recommended)
- Admin lives at `/admin/*` within the same Astro app
- Shared Supabase client, shared types, shared layout system
- Simpler deployment (one app)
- Auth middleware protects `/admin/*` routes

**Option B — Admin as a separate app (`apps/admin`)**
- Separate Astro/Vite app in the monorepo
- Complete isolation, separate deployment
- More complex to maintain, but cleaner separation

**I recommend Option A.** The admin is lightweight (only you use it), and co-locating avoids duplication.

### Deployment Model Change
Moving from static to hybrid means Vercel will deploy serverless functions for SSR pages. This is well within the free tier but is a meaningful infrastructure change. Builds may take slightly longer.

### Performance Note for Hybrid Mode
Switching to `output: 'hybrid'` does not automatically slow down all pages:
- Static pages (e.g., homepage if kept prerendered) still ship as static assets and keep static performance.
- SSR pages (e.g., `/admin/*`, `/projects/:slug`) can be slightly slower on first request due to serverless cold starts.
- Typical impact is small for normal traffic and can be reduced with caching and by keeping only truly dynamic routes SSR.

---

## Decisions Confirmed (2026-06-02)

| Question | Decision |
|---|---|
| Q1: Astro output mode | **Approved**: switch to `output: 'hybrid'` |
| Q2: Admin panel location | **Option A**: `/admin/*` inside `apps/web` |
| Q3: Rich text editor | **TipTap** |
| Q4: Publication workflow | **Simple v1**: `draft -> published -> archived` |
| Q5: Article scope | **Both**: standalone + project-linked articles |
| Q6: Image strategy | **Supabase Storage** |

---

## Open Questions

### Q1: Astro Hybrid Mode
Resolved: approved.

### Q2: Admin Panel Location
Resolved: Option A (`/admin/*` within `apps/web`).

### Q3: Rich Text Editor Choice
Based on research, the two strongest candidates for a Medium-like editor are:

| | **TipTap** | **BlockNote** |
|---|---|---|
| Architecture | Headless (you build the UI) | Pre-built UI (Notion-like) |
| Medium-like feel | ⭐⭐⭐⭐⭐ (custom) | ⭐⭐⭐⭐ (close) |
| Setup effort | Higher (build toolbar, menus) | Lower (comes with UI) |
| Customization | Unlimited | Limited by abstraction |
| SSR rendering | `generateHTML()` from `@tiptap/html` | Via TipTap under the hood |
| Maturity | 37k ⭐, battle-tested | 9.8k ⭐, newer |
| Bundle | ~150KB (tree-shakable) | ~250KB |

**Recommendation: TipTap** — maximum control, best Medium-like UX, native JSON output for Supabase `jsonb`, excellent SSR support.

Resolved: TipTap selected.

### Q4: Publication Workflow Complexity
Two levels of workflow:

**Simple (Recommended for v1)**:
- States: `draft` → `published` → `archived`
- No version history
- Instant publish/unpublish

**Full**:
- States: `draft` → `in_review` → `published` → `archived`
- Version history (rollback)
- Draft changes on live content

Resolved: simple workflow for v1.

### Q5: Article Scope
Resolved: support both project-linked and standalone articles. Data model:
- **Project articles only**: Article is always linked to a project via `project_id`
- **Both**: Articles can be standalone OR linked to a project (optional `project_id`)

### Q6: Image Upload Strategy
For the editor, images can be:
- **Supabase Storage** (recommended) — native, free tier includes 1GB, transformations available
- **External URLs** — paste image URLs directly
- **Both** — upload to Supabase Storage + paste external URLs

Resolved: Supabase Storage selected.

---

## Architecture Overview

### System Architecture

```
Public (Static/SSR)
├── / Homepage ──(static)──> Project Cards Grid
└── /projects/:slug ──(SSR)──> Project Detail + Article

Admin (SSR, Auth-Protected)
├── /admin/login ──> Auth Gate
├── /admin/dashboard
├── /admin/projects ──> Project List
├── /admin/projects/new ──> Create Form
├── /admin/projects/:id/edit ──> Edit Form
└── /admin/projects/:id/article ──> TipTap Rich Editor

Backend
├── Supabase Auth ──> Auth Gate
├── Supabase DB ──> projects, articles
└── Supabase Storage ──> images
```

### Data Flow

```
Admin User → Actions: projects.create(data) → Supabase DB (INSERT INTO projects)

Admin User → TipTap Editor → Actions: projects.uploadImage(file) → Supabase Storage (returns URL)
                            → Actions: projects.updateArticle(content) → Supabase DB (UPDATE articles SET content = {json})

Admin User → Actions: projects.publish({ id, publish: true }) → Supabase DB (UPDATE projects SET status = 'published')

Public Page → GET /projects/:slug → Supabase DB (SELECT project + article) → Render HTML (SSR)
```

---

## Phase 1: Database Schema Evolution

### Goal
Evolve the existing `projects` and `articles` tables to support the full feature set.

---

### [NEW] Migration: `alter_projects_table.sql`

Add the following columns to the existing `projects` table:

```sql
-- Add slug for URL-friendly project detail pages
ALTER TABLE public.projects ADD COLUMN slug TEXT UNIQUE;

-- Add publication status (replaces the ambiguous 'state' column for publication flow)
-- Keep 'state' as project lifecycle status (ongoing/finished/production)
CREATE TYPE public.publication_status AS ENUM ('draft', 'published', 'archived');
ALTER TABLE public.projects ADD COLUMN publication_status public.publication_status DEFAULT 'draft' NOT NULL;

-- Add published_at timestamp
ALTER TABLE public.projects ADD COLUMN published_at TIMESTAMPTZ;

-- Add updated_at with auto-update trigger
ALTER TABLE public.projects ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();

-- Add access_link (live demo URL, separate from 'url' which is repo link)
ALTER TABLE public.projects ADD COLUMN access_link TEXT;

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

### [NEW] Migration: `alter_articles_table.sql`

Evolve the existing `articles` table to support rich content:

```sql
-- Add slug for URL
ALTER TABLE public.articles ADD COLUMN slug TEXT UNIQUE;

-- Add rich content body (TipTap JSON)
ALTER TABLE public.articles ADD COLUMN content JSONB;

-- Add cached HTML (generated from TipTap JSON on publish)
ALTER TABLE public.articles ADD COLUMN content_html TEXT;

-- Add publication status
ALTER TABLE public.articles ADD COLUMN status public.publication_status DEFAULT 'draft' NOT NULL;

-- Add published_at
ALTER TABLE public.articles ADD COLUMN published_at TIMESTAMPTZ;

-- Add updated_at
ALTER TABLE public.articles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();

-- Link article to project (optional — allows standalone articles too)
ALTER TABLE public.articles ADD COLUMN project_id BIGINT REFERENCES public.projects(id) ON DELETE SET NULL;

-- Add reading time (computed on save)
ALTER TABLE public.articles ADD COLUMN reading_time_minutes INTEGER;

-- Auto-update trigger
CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

### [NEW] Migration: `rls_policies.sql`

```sql
-- Projects: public read for published, full access for authenticated owner
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published projects"
  ON public.projects FOR SELECT
  USING (publication_status = 'published');

CREATE POLICY "Owner can manage own projects"
  ON public.projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Articles: same pattern
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published articles"
  ON public.articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "Owner can manage own articles"
  ON public.articles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### [NEW] Supabase Storage bucket

```sql
-- Create a storage bucket for article/project images
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-images', 'content-images', true);

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload content images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'content-images' AND auth.role() = 'authenticated');

-- Public can read
CREATE POLICY "Public can read content images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'content-images');
```

---

## Phase 2: Authentication & Admin Foundation

### Goal
Set up Supabase Auth with email/password login and create the admin shell with route protection.

---

### Pre-requisites
- Switch Astro to `output: 'hybrid'`
- Add `@astrojs/vercel` adapter

### [MODIFY] `apps/web/astro.config.mjs`

```diff
 import { defineConfig } from 'astro/config'
 import react from '@astrojs/react'
 import sitemap from '@astrojs/sitemap'
 import tailwindcss from '@tailwindcss/vite'
+import vercel from '@astrojs/vercel'
 import path from 'path'

 export default defineConfig({
   site: 'https://taas-s-ekpaye.vercel.app',
-  output: 'static',
+  output: 'hybrid',
+  adapter: vercel(),
   integrations: [
     react(),
     sitemap(),
   ],
```

### [NEW] `src/lib/supabase/server.ts`

Server-side Supabase client that reads cookies from Astro request context.

### [NEW] `src/lib/supabase/browser.ts`

Browser-side Supabase client for React islands.

### [NEW] `src/middleware.ts`

Astro middleware for auth-protected routes — only protects `/admin/*` (except `/admin/login`).

### Admin Routes Structure

```
src/pages/admin/
├── login.astro              ← Public login page
├── index.astro              ← Dashboard (redirect to /admin/projects)
├── projects/
│   ├── index.astro          ← Project list (admin view)
│   ├── new.astro            ← Create project form
│   └── [id]/
│       ├── edit.astro       ← Edit project metadata
│       └── article.astro    ← Rich text editor for project article
```

### [NEW] `src/components/admin/LoginForm.tsx`

React island (`client:load`) with email + password fields, Supabase auth, error display.

### [NEW] `src/layouts/AdminLayout.astro`

Admin-specific layout with sidebar navigation, top bar, breadcrumbs.

---

## Phase 3: Project CRUD in Admin

### Goal
Build the admin interface for creating, editing, listing, and deleting projects.

---

### Astro Actions (Unified Server Endpoints)

Instead of traditional REST API routes, we will use **Astro Actions** (fully supported in Astro 5.x) to handle all backend mutations in a type-safe manner. 

All actions will be defined and exported from `src/actions/`:
- `src/actions/index.ts` — Core Actions export file.
- `src/actions/auth.ts` — Actions for auth (e.g., `login`, `logout`).
- `src/actions/projects.ts` — Actions for project lifecycle (e.g., `create`, `update`, `delete`, `publish`, `uploadImage`).

#### Action Definitions & Validation
We will use Astro's built-in Zod validation schemas (`astro:schema`) to validate action inputs:
*   `actions.auth.login({ email, password })` — Handles server-side Supabase authentication and sets the session cookie.
*   `actions.projects.create(projectData)` — Validates project metadata and inserts into Supabase.
*   `actions.projects.update({ id, ...projectData })` — Updates existing project metadata.
*   `actions.projects.delete({ id })` — Soft-deletes/archives a project.
*   `actions.projects.publish({ id, publish })` — Toggles project publication status.
*   `actions.projects.uploadImage(formData)` — Accepts a file and uploads it to Supabase Storage, returning the public URL.

### Admin UI Components (React Islands)

- `ProjectList.tsx` — Table with pagination, search, status filters. Calls Astro Actions on user interactions.
- `ProjectForm.tsx` — Full form with Zod validation, auto-save. Submits form data via Astro Actions.
- `TechStackInput.tsx` — Tag input for tech stack.
- `TypeSelector.tsx` — Multi-select for project types.

---

## Phase 4: Rich Text Editor (Medium-like)

### Goal
Implement a TipTap-based Medium-style editor for writing project articles.

---

### Dependencies

```bash
bun add @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/html \
  @tiptap/extension-image @tiptap/extension-code-block-lowlight \
  @tiptap/extension-placeholder @tiptap/extension-link \
  @tiptap/extension-heading @tiptap/extension-blockquote \
  @tiptap/extension-horizontal-rule @tiptap/extension-underline \
  @tiptap/extension-text-align @tiptap/extension-highlight \
  @tiptap/extension-typography lowlight
```

### Editor Components

- `ArticleEditor.tsx` — Main editor with auto-save, word count, reading time
- `FloatingToolbar.tsx` — Medium-style floating toolbar on text selection
- `SlashCommandMenu.tsx` — Slash commands for blocks (headings, lists, code, images)
- `ImageUpload.tsx` — Drag-drop / paste / click upload to Supabase Storage
- `CodeBlockComponent.tsx` — Syntax highlighting with language selector

### Content Model (TipTap JSON → Supabase)

```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 2 },
      "content": [{ "type": "text", "text": "What Ignited This Project" }]
    },
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "The idea came from " },
        { "type": "text", "marks": [{ "type": "bold" }], "text": "a real problem" },
        { "type": "text", "text": " I faced daily..." }
      ]
    }
  ]
}
```

### Storage Strategy

| Field | Type | Purpose |
|---|---|---|
| `content` | `jsonb` | TipTap JSON — source of truth, used by editor |
| `content_html` | `text` | Cached HTML — generated on save/publish via `generateHTML()` |
| `reading_time_minutes` | `integer` | Computed from word count (avg 200 wpm) |

### Auto-Save Flow

```
Keystroke → Debounce (2s) → editor.getJSON() → 
  Actions: projects.updateArticle({ id, content: json }) →
  Server: save json + generateHTML() + compute reading_time →
  UPDATE articles SET content=$1, content_html=$2, reading_time_minutes=$3
```

---

## Phase 5: Project Detail Pages (Public)

### Goal
Create beautiful, SEO-optimized project detail pages that render the article content.

---

### [NEW] `src/pages/projects/[slug].astro`

Server-rendered project detail page with:
- Full project header (title, date, reading time, tech stack)
- Cover image
- Article body rendered from cached HTML
- Project links (source, live demo)
- JSON-LD `TechArticle` schema

### SEO for Detail Pages

- Dynamic `<title>`: `"{Project Title} — Taas S. Ekpaye"`
- `<meta description>`: Project description
- Open Graph tags: title, description, image
- Twitter Card: summary_large_image
- Canonical URL: `/projects/{slug}`

### [NEW] `src/components/projects/ArticleRenderer.astro`

Renders cached `content_html` with `@tailwindcss/typography` prose classes.

### [MODIFY] `ProjectCard.astro`

Update project cards to link to `/projects/${project.slug}`.

---

## Phase 6: Publication Workflow

### Goal
Implement a simple but effective draft → published → archived workflow.

---

### Status Flow

```
[Create] → Draft → Published → Archived
              ↑        |           |
              |        ↓           |
              ←── Unpublish        |
              ←────── Restore ─────┘
```

### Implementation

- **Draft**: Default state. Only visible in admin. Auto-saved.
- **Published**: Visible on public site. Sets `published_at` on first publish.
- **Archived**: Hidden from public. Preserved in admin for reference.

### Admin UI

- `StatusBadge.tsx` — Color-coded: 🟡 Draft | 🟢 Published | ⚫ Archived
- `PublishDialog.tsx` — Confirmation with pre-publish checks (title, description, content, cover image)
- Slug auto-generation from title, editable, validated for uniqueness

---

## Phase 7: Quality Controls & Testing

### Goal
Establish linting, testing, and quality gates.

---

### Linting & Formatting

Extend existing Biome config for new admin code and import sorting.

### CI Pipeline (`.github/workflows/ci.yml`)

```yaml
- Lint: biome check
- Type check: bun run typecheck
- Unit tests: bun run test
- Build: bun run build
```

### Testing Strategy

| Layer | Tool | What to Test |
|---|---|---|
| Unit | Vitest | Slug generation, reading time, Zod schemas, utils |
| Component | Vitest + Testing Library | ProjectForm, StatusBadge, TypeSelector |
| Integration | Vitest + Supabase local | API routes, auth middleware, RLS |
| E2E (future) | Playwright | Full admin flow end-to-end |

### Benchmarks

| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 90 |
| Lighthouse SEO | ≥ 95 |
| Time to Interactive | < 2s |
| Editor load time | < 1.5s |
| Build time | < 60s |

---

## Verification Plan

### Automated Tests

```bash
bun run test        # Unit + component tests
bun run typecheck   # Type checking
bunx biome check .  # Linting
bun run build       # Build verification
```

### Manual Verification

| Step | What to Verify |
|---|---|
| 1 | Admin login works with Supabase email/password |
| 2 | Create a new project with all fields |
| 3 | Upload cover image to Supabase Storage |
| 4 | Write article in TipTap editor (headings, bold, images, code blocks) |
| 5 | Auto-save works (check DB for JSON content) |
| 6 | Publish project — appears on public homepage |
| 7 | Visit `/projects/:slug` — full article renders |
| 8 | SEO: meta tags, OG tags, JSON-LD on detail page |
| 9 | Unpublish — disappears from public site |
| 10 | Mobile responsiveness (admin + public) |

---

## Implementation Order & Effort Estimate

| Phase | Dependencies | Estimated Effort | Priority |
|---|---|---|---|
| **Phase 1**: Database Schema | None | 2-3 hours | 🔴 Critical |
| **Phase 2**: Auth & Admin Shell | Phase 1 | 4-6 hours | 🔴 Critical |
| **Phase 3**: Project CRUD | Phase 2 | 6-8 hours | 🔴 Critical |
| **Phase 4**: Rich Text Editor | Phase 3 | 8-12 hours | 🔴 Critical |
| **Phase 5**: Public Detail Pages | Phase 1, 4 | 4-6 hours | 🟡 High |
| **Phase 6**: Publication Workflow | Phase 3, 5 | 3-4 hours | 🟡 High |
| **Phase 7**: Quality Controls | All phases | 4-6 hours | 🟢 Medium |
| **Total** | | **~31-45 hours** | |

---

## New Dependencies Summary

```bash
# Astro SSR + Vercel
bun add @astrojs/vercel

# Supabase SSR (cookie-based auth)
bun add @supabase/ssr

# TipTap Editor
bun add @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/html \
  @tiptap/extension-image @tiptap/extension-code-block-lowlight \
  @tiptap/extension-placeholder @tiptap/extension-link \
  @tiptap/extension-heading @tiptap/extension-blockquote \
  @tiptap/extension-horizontal-rule @tiptap/extension-underline \
  @tiptap/extension-text-align @tiptap/extension-highlight \
  @tiptap/extension-typography lowlight

# Testing
bun add -D vitest @testing-library/react @testing-library/dom jsdom
```

### File Structure After Implementation

```
apps/web/src/
├── components/
│   ├── admin/
│   │   ├── editor/
│   │   │   ├── ArticleEditor.tsx
│   │   │   ├── FloatingToolbar.tsx
│   │   │   ├── SlashCommandMenu.tsx
│   │   │   ├── ImageUpload.tsx
│   │   │   └── CodeBlockComponent.tsx
│   │   ├── projects/
│   │   │   ├── ProjectList.tsx
│   │   │   ├── ProjectForm.tsx
│   │   │   ├── TechStackInput.tsx
│   │   │   ├── TypeSelector.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── PublishDialog.tsx
│   │   ├── LoginForm.tsx
│   │   └── AdminSidebar.tsx
│   ├── projects/
│   │   ├── ArticleRenderer.astro
│   │   └── (existing ProjectCard.astro)
│   └── ui/
│       └── (existing shadcn components)
├── actions/
│   ├── index.ts
│   ├── auth.ts
│   └── projects.ts
├── layouts/
│   ├── BaseLayout.astro (existing)
│   └── AdminLayout.astro (new)
├── lib/
│   ├── supabase.ts (new - unified client helper)
│   ├── editor/
│   │   ├── extensions.ts
│   │   └── html-renderer.ts
│   ├── slug.ts
│   ├── reading-time.ts
│   └── (existing utils.ts)
├── middleware.ts (new)
├── pages/
│   ├── index.astro (existing)
│   ├── 404.astro (existing)
│   ├── projects/
│   │   └── [slug].astro (new, SSR)
│   └── admin/
│       ├── login.astro
│       ├── index.astro
│       └── projects/
│           ├── index.astro
│           ├── new.astro
│           └── [id]/
│               ├── edit.astro
│               └── article.astro
└── styles/
    └── global.css (existing, extend for editor + admin)
```
