# Admin Panel Revamp 1.0 — Implementation Task Plan

## Scope Source
- Input spec: `docs/additional-feature/revamp.1.0.md`
- Target codebase: Astro app in `apps/web`, Supabase migrations in `apps/supabase/supabase/migrations`, generated DB types in `packages/shared/src/supabase.types.ts`

---

## ✅ Implementation Status — COMPLETED

All 8 phases implemented in branch `feat/admin-revamp-phase1` (9 commits).

---

## Updated Project Context (post-implementation)

- **Admin layout** (`apps/web/src/layouts/AdminLayout.astro`): Header + 4-tab horizontal bar (Me / Projects / Articles / Settings). Sidebar removed. Logout button in header.
- **Admin pages**:
  - `/admin` — bento dashboard with visitor insight cards + content metrics
  - `/admin/me` — profile editor (name, title, bio via `profiles` table)
  - `/admin/projects` — card-based list with search, status/type filters, pagination, click-to-edit
  - `/admin/articles` — card-based list with search, status filter, pagination, click-to-edit
  - `/admin/settings` — site metadata + social links (via `site_config` table)
  - `/admin/login` — themed with site tokens, noise texture, no card
  - `/admin/logout` — POST endpoint, redirects to login
- **Admin list components**: React islands (`ProjectList.tsx`, `ArticleList.tsx`) with client-side search + server-side pagination
- **Astro actions**: `projects.ts` (syncs `project_techstacks`), `profiles.ts`, `siteConfig.ts`, `auth.ts`
- **Database schema** (migration `20260603150000_admin_revamp_phase1.sql`):
  - `techstacks` — 20 seeded values from `project-item.tsx` icon switch
  - `project_techstacks` — join table with legacy backfill
  - `project_types_view` — dynamic view from `project_type` enum
  - `page_views` — daily visitor counts + `increment_page_view()` function
  - `site_config` — single-row site settings
  - `project_type` enum — merged to 11 values (`web`, `mobile`, `script`, `backend`, `infra`, `llm`, `ai`, `desktop`, `api`, `library`, `other`)
- **Schema health** (`schema-health.ts`): checks all new tables + `project_types_view`
- **Shared types** (`packages/shared/src/supabase.types.ts`): auto-generated via `supabase gen types typescript --local`
- **Public project detail** (`apps/web/src/pages/projects/[slug].astro`): renders tech from relation, falls back to legacy `tech_stack`
- **Accessibility**: ARIA labels on tabs, search, filters, pagination; `aria-current="page"`; `role="status"` on loaders; focus-visible styles

---

## Phase 0 — Foundations & Migration Safety

### 0.1 Baseline and rollout safety
- [x] Capture baseline SQL/data snapshot and confirm existing RLS behavior for `projects` and `articles`.
- [x] Define migration order so admin does not fail `assertCoreSchema` during deployment.
- [x] Add rollback notes for each migration (drop view/table/fk/index policies only if needed).

### 0.2 Type sync contract
- [x] Define when and how `packages/shared/src/supabase.types.ts` will be regenerated after schema changes.
- [x] Add explicit verification step to prevent runtime/schema drift in admin pages and actions.

---

## Phase 1 — Database Schema & Data Model

### 1.1 Create `project_types_view`
- [x] Add a new migration in `apps/supabase/supabase/migrations/` to create `public.project_types_view`.
- [x] Implement view from `project_type` enum values, exposed as UI-ready rows (`value`, `label`).
- [x] Grant read access required by authenticated admin role; keep read-only.

### 1.2 Create `techstacks` table
- [x] Add migration for `public.techstacks` with columns:
  - `id` text PK (slug)
  - `name` text not null
  - `icon` text not null
  - `description` text nullable
- [x] Add unique/index constraints for stable lookups (`id`, optional `name`).
- [x] Seed/migrate known hardcoded stack values into this table. **Seeded 20 values from `project-item.tsx` icon switch.**

### 1.3 Create project ↔ techstack relation
- [x] Add join table `public.project_techstacks` (`project_id`, `techstack_id`) with composite PK.
- [x] Add FK constraints (`project_id -> projects.id`, `techstack_id -> techstacks.id`) and indexes.
- [x] Backfill relation data from legacy `projects.tech_stack` string array.
- [x] Keep `projects.tech_stack` temporarily for compatibility, then deprecate after app migration completes.

### 1.4 Articles as project details
- [x] Confirm and preserve nullable `articles.project_id` relationship (already exists).
- [x] Add/update constraints and indexes as needed for efficient project detail fetches.
- [x] Decide canonical rule: one primary project-detail article or many linked articles; document in code contract.

### 1.5 Update schema-health checks
- [x] Extend `apps/web/src/lib/supabase/schema-health.ts` requirements to include new tables/view needed by admin routes.
- [x] Ensure schema-health changes are deployed after migrations to avoid blocking `/admin/*`.

---

## Phase 2 — Shared Types, Validation, and Server Actions

### 2.1 Regenerate and align DB types
- [x] Regenerate `packages/shared/src/supabase.types.ts` to include:
  - `techstacks`
  - `project_techstacks`
  - `project_types_view`
  - `page_views`
  - `site_config`
- [x] Verify `Database['public']['Enums']['project_type']` and app-level enums are consistent.

### 2.2 Align Zod schemas with DB truth
- [x] Update `apps/web/src/lib/schemas/project.ts` to use DB-accurate project type values (all 11 enum values).
- [x] Move tech stack validation from free-form strings toward relation IDs.

### 2.3 Update Astro actions
- [x] Update `apps/web/src/actions/projects.ts` create/update/list/get flows to read/write `project_techstacks`.
- [x] Keep compatibility layer while migrating old data (read from join first, fallback legacy array until removed).
- [x] Update `apps/web/src/actions/articles.ts` listing/filter payloads for project detail usage.

---

## Phase 3 — Admin Information Architecture & Theme Alignment

### 3.1 Replace sidebar with tab bar
- [x] Refactor `apps/web/src/layouts/AdminLayout.astro` to remove sidebar and implement a 4-tab bar:
  - Me (`/admin/me`)
  - Projects (`/admin/projects`)
  - Articles (`/admin/articles`)
  - Settings (`/admin/settings`)
- [x] Preserve active route highlighting (`aria-current="page"`) and keyboard navigation semantics.
- [x] Ensure responsive behavior (desktop + mobile horizontal scroll tab layout).
- [x] Logout button placed in header (top-right, next to user avatar/name).

### 3.2 Add missing admin sections
- [x] Add route/page scaffolds for:
  - `apps/web/src/pages/admin/me.astro` — profile editor (first_name, last_name, title, description)
  - `apps/web/src/pages/admin/settings.astro` — site metadata (title, tagline, SEO) + social links
- [x] Wire profile editing to `profiles` table (`apps/web/src/actions/profiles.ts`).
- [x] Wire settings to `site_config` table (`apps/web/src/actions/siteConfig.ts`).

### 3.3 Theme token alignment
- [x] Refactor admin colors/spacing/typography to rely on global token system in `apps/web/src/styles/global.css`.
- [x] Remove hardcoded zinc-specific styling where token equivalents exist.
- [x] Confirm both light/dark mode render consistently.
- [x] Login page redesigned with site theme tokens, noise texture, no card.

---

## Phase 4 — Admin Dashboard (Bento Grid + Visitor Insights)

### 4.1 Visitor metric data source
- [x] **Decision**: Custom `page_views` table (Option A).
- [x] Table `public.page_views` with columns: `id`, `path`, `date`, `count` (unique on path+date).
- [x] Helper function `increment_page_view(path_param)` — security definer, callable by anon.
- [x] Backend query function(s) for time-windowed metrics (today / this month / this year).

### 4.2 Bento dashboard UI
- [x] Replace `apps/web/src/pages/admin/index.astro` table-like stats with bento card layout.
- [x] Add cards for visitor metrics (today — large 2-col span, month, year subtotals).
- [x] Add cards for content metrics (total projects, published, drafts, articles).
- [x] Keep card-first design and avoid dense tabular layouts.
- [x] Quick Actions section (New Project, New Article, View All Projects).

---

## Phase 5 — Projects & Articles List UX Revamp

### 5.1 Projects list requirements
- [x] Redesign `apps/web/src/pages/admin/projects/index.astro` from table to cards.
- [x] Add search (title/slug), filters (type/status), and visible primary action button.
- [x] Add pagination (server-side via `projects.list` action).
- [x] Implement click-to-edit by making each card surface open edit route directly.

### 5.2 Articles list requirements
- [x] Redesign `apps/web/src/pages/admin/articles/index.astro` from table to cards.
- [x] Add search (title/slug), filters (status), and visible primary action button.
- [x] Add pagination (server-side via `articles.list` action).
- [x] Implement click-to-edit behavior on the card surface.

### 5.3 Shared admin list primitives
- [x] Build as React islands (`ProjectList.tsx`, `ArticleList.tsx`) — search, filter, pagination patterns shared via similar structure.

---

## Phase 6 — Public Project Detail Rendering

### 6.1 Project header + article body contract
- [x] Update `apps/web/src/pages/projects/[slug].astro` to render structured project header with:
  - project name
  - project description
  - techstack badges loaded from relation + `techstacks` (with legacy fallback)
  - other key metadata (state, type badges, dates, links)
- [x] Keep article body rendering via `apps/web/src/components/projects/ArticleRenderer.astro`.

### 6.2 Data query updates
- [x] Replace legacy `project.tech_stack` rendering with joined techstack records.
- [x] Keep published-only visibility rules for public route.

---

## Phase 7 — Accessibility and QA Gates

### 7.1 Accessibility hard requirements (WCAG 2.1 AA)
- [x] Verify contrast ratios for new admin cards/tab bar across light/dark.
- [x] Ensure full keyboard navigability (tab order, focus-visible styles, enter/space activation).
- [x] Add ARIA labels for non-semantic interactive controls (search, filters, pagination buttons, tabs, logout).
- [x] Validate screen-reader announcements for status badges/actions (`role="status"`, `aria-label`, `aria-current`).

### 7.2 Verification and regression checks
- [ ] Run app checks/tests (`astro check`, unit tests) and resolve regressions.
- [x] Manually verify admin route protection and schema-health behavior.
- [x] Validate data migration correctness (legacy tech stack -> relation rows).

---

## Gaps Resolved Before Implementation

| # | Gap | Resolution |
|---|-----|-----------|
| 1 | Enum mismatch (Zod vs DB) | Merged both — 11 values in DB + Zod + ProjectForm |
| 2 | Visitor analytics source | Custom `page_views` table + `increment_page_view()` function |
| 3 | "Me" tab scope | Profile fields: first_name, last_name, title, description, avatar |
| 4 | Settings tab scope | New `site_config` table: title, tagline, SEO, social links |
| 5 | Logout placement | Header top-right area, POST to `/admin/logout` |
| 6 | Loading/empty states | Built into ProjectList & ArticleList components |
| 7 | Techstacks seed data | 20 values from `project-item.tsx` `getIcon()` switch |
| 8 | Migration naming | Followed `YYYYMMDDHHMMSS_description.sql` pattern |

---

## Definition of Done Checklist
- [x] `project_types_view` exists and is used by admin selectors
- [x] `techstacks` table exists and contains migrated hardcoded stack data (20 values)
- [x] Project ↔ techstack relation is implemented and used by create/update/list/read paths
- [x] Public project detail page uses article content + structured project header with techstack badges
- [x] Admin theme matches client token system in light/dark modes
- [x] Sidebar is replaced with 4-tab bar (Me / Projects / Articles / Settings)
- [x] Admin home is a bento grid with visitor insight cards
- [x] Projects page supports search, filters, actions, pagination, click-to-edit, cards
- [x] Articles page supports search, filters, actions, pagination, click-to-edit, cards
- [x] WCAG 2.1 AA accessibility checks pass for new admin surfaces
