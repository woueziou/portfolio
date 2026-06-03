# Admin Panel Revamp 1.0 — Implementation Task Plan

## Scope Source
- Input spec: `docs/additional-feature/revamp.1.0.md`
- Target codebase: Astro app in `apps/web`, Supabase migrations in `apps/supabase/supabase/migrations`, generated DB types in `packages/shared/src/supabase.types.ts`

## Current Project Context (from codebase)
- Admin shell and nav currently live in `apps/web/src/layouts/AdminLayout.astro` (header + sidebar, dashboard/projects/articles only).
- Admin list pages are table-based and server-rendered in:
  - `apps/web/src/pages/admin/index.astro`
  - `apps/web/src/pages/admin/projects/index.astro`
  - `apps/web/src/pages/admin/articles/index.astro`
- Admin CRUD flows are powered by Astro actions:
  - `apps/web/src/actions/projects.ts`
  - `apps/web/src/actions/articles.ts`
  - `apps/web/src/actions/auth.ts`
- Public project detail route is `apps/web/src/pages/projects/[slug].astro`, currently rendering project + linked articles.
- DB schema health gating for admin is enforced in:
  - `apps/web/src/middleware.ts`
  - `apps/web/src/lib/supabase/schema-health.ts`
- Shared generated DB types are consumed from `@repo/shared` (`packages/shared/src/supabase.types.ts`), so schema changes must be reflected there.
- No real visitor analytics source is currently wired in the web app; dashboard currently shows project counts only.

---

## Phase 0 — Foundations & Migration Safety

### 0.1 Baseline and rollout safety
- [ ] Capture baseline SQL/data snapshot and confirm existing RLS behavior for `projects` and `articles`.
- [ ] Define migration order so admin does not fail `assertCoreSchema` during deployment.
- [ ] Add rollback notes for each migration (drop view/table/fk/index policies only if needed).

### 0.2 Type sync contract
- [ ] Define when and how `packages/shared/src/supabase.types.ts` will be regenerated after schema changes.
- [ ] Add explicit verification step to prevent runtime/schema drift in admin pages and actions.

---

## Phase 1 — Database Schema & Data Model

### 1.1 Create `project_types_view`
- [ ] Add a new migration in `apps/supabase/supabase/migrations/` to create `public.project_types_view`.
- [ ] Implement view from distinct values already used by projects (`projects.type` array enum values), exposed as UI-ready rows (e.g. `value`, `label`).
- [ ] Grant read access required by authenticated admin role; keep read-only.

### 1.2 Create `techstacks` table
- [ ] Add migration for `public.techstacks` with columns:
  - `id` text PK (slug)
  - `name` text not null
  - `icon` text not null
  - `description` text nullable
- [ ] Add unique/index constraints for stable lookups (`id`, optional `name`).
- [ ] Seed/migrate known hardcoded stack values into this table.

### 1.3 Create project ↔ techstack relation
- [ ] Add join table `public.project_techstacks` (`project_id`, `techstack_id`) with composite PK.
- [ ] Add FK constraints (`project_id -> projects.id`, `techstack_id -> techstacks.id`) and indexes.
- [ ] Backfill relation data from legacy `projects.tech_stack` string array.
- [ ] Keep `projects.tech_stack` temporarily for compatibility, then deprecate after app migration completes.

### 1.4 Articles as project details
- [ ] Confirm and preserve nullable `articles.project_id` relationship (already exists).
- [ ] Add/update constraints and indexes as needed for efficient project detail fetches.
- [ ] Decide canonical rule: one primary project-detail article or many linked articles; document in code contract.

### 1.5 Update schema-health checks
- [ ] Extend `apps/web/src/lib/supabase/schema-health.ts` requirements to include new tables/view needed by admin routes.
- [ ] Ensure schema-health changes are deployed after migrations to avoid blocking `/admin/*`.

---

## Phase 2 — Shared Types, Validation, and Server Actions

### 2.1 Regenerate and align DB types
- [ ] Regenerate `packages/shared/src/supabase.types.ts` to include:
  - `techstacks`
  - `project_techstacks`
  - `project_types_view`
- [ ] Verify `Database['public']['Enums']['project_type']` and app-level enums are consistent.

### 2.2 Align Zod schemas with DB truth
- [ ] Update `apps/web/src/lib/schemas/project.ts` to use DB-accurate project type values.
- [ ] Move tech stack validation from free-form strings toward relation IDs.

### 2.3 Update Astro actions
- [ ] Update `apps/web/src/actions/projects.ts` create/update/list/get flows to read/write `project_techstacks`.
- [ ] Keep compatibility layer while migrating old data (read from join first, fallback legacy array until removed).
- [ ] Update `apps/web/src/actions/articles.ts` listing/filter payloads for project detail usage.

---

## Phase 3 — Admin Information Architecture & Theme Alignment

### 3.1 Replace sidebar with tab bar
- [ ] Refactor `apps/web/src/layouts/AdminLayout.astro` to remove sidebar and implement a 4-tab bar:
  - Me
  - Projects
  - Articles
  - Settings
- [ ] Preserve active route highlighting and keyboard navigation semantics.
- [ ] Ensure responsive behavior (desktop + mobile bottom/top tab layout).

### 3.2 Add missing admin sections
- [ ] Add route/page scaffolds for:
  - `apps/web/src/pages/admin/me.astro`
  - `apps/web/src/pages/admin/settings.astro`
- [ ] Wire profile editing to `profiles` table and settings to appropriate config source.

### 3.3 Theme token alignment
- [ ] Refactor admin colors/spacing/typography to rely on global token system in `apps/web/src/styles/global.css`.
- [ ] Remove hardcoded zinc-specific styling where token equivalents exist.
- [ ] Confirm both light/dark mode render consistently.

---

## Phase 4 — Admin Dashboard (Bento Grid + Visitor Insights)

### 4.1 Visitor metric data source
- [ ] Introduce/choose visitor analytics source (table/view/provider) for:
  - visitors today
  - visitors this month
  - visitors this year
- [ ] Add backend query function(s) for time-windowed metrics.

### 4.2 Bento dashboard UI
- [ ] Replace `apps/web/src/pages/admin/index.astro` table-like stats with bento card layout.
- [ ] Add cards for required visitor metrics and useful content metrics (total projects, total articles, most viewed).
- [ ] Keep card-first design and avoid dense tabular layouts.

---

## Phase 5 — Projects & Articles List UX Revamp

### 5.1 Projects list requirements
- [ ] Redesign `apps/web/src/pages/admin/projects/index.astro` from table to cards.
- [ ] Add search (title/slug), filters (type/status/date), and visible primary action button.
- [ ] Add pagination (server-side preferred for future scale).
- [ ] Implement click-to-edit by making each card row/surface open edit route directly.

### 5.2 Articles list requirements
- [ ] Redesign `apps/web/src/pages/admin/articles/index.astro` from table to cards.
- [ ] Add search (title/slug), filters (status/date/project), and visible primary action button.
- [ ] Add pagination.
- [ ] Implement click-to-edit behavior on the card surface.

### 5.3 Shared admin list primitives
- [ ] Extract reusable components/hooks for search/filter/pagination card lists to avoid duplicated logic.

---

## Phase 6 — Public Project Detail Rendering

### 6.1 Project header + article body contract
- [ ] Update `apps/web/src/pages/projects/[slug].astro` to render structured project header with:
  - project name
  - project description
  - techstack badges/icons loaded from relation + `techstacks`
  - other key metadata
- [ ] Keep article body rendering via `apps/web/src/components/projects/ArticleRenderer.astro`.

### 6.2 Data query updates
- [ ] Replace legacy `project.tech_stack` rendering with joined techstack records.
- [ ] Keep published-only visibility rules for public route.

---

## Phase 7 — Accessibility and QA Gates

### 7.1 Accessibility hard requirements (WCAG 2.1 AA)
- [ ] Verify contrast ratios for new admin cards/tab bar across light/dark.
- [ ] Ensure full keyboard navigability (tab order, focus-visible styles, enter/space activation).
- [ ] Add ARIA labels for non-semantic interactive controls.
- [ ] Validate screen-reader announcements for status badges/actions.

### 7.2 Verification and regression checks
- [ ] Run app checks/tests (`astro check`, unit tests) and resolve regressions.
- [ ] Manually verify admin route protection and schema-health behavior.
- [ ] Validate data migration correctness (legacy tech stack -> relation rows).

---

## Suggested Implementation Order (Execution)
1. Phase 0 (safety/type sync policy)
2. Phase 1 (schema/view/table/relation + backfill)
3. Phase 2 (types, zod, actions)
4. Phase 3 (admin IA + tab bar + theme alignment)
5. Phase 5 (projects/articles list UX revamp)
6. Phase 4 (dashboard bento + visitor insights, once source is decided)
7. Phase 6 (public project detail relation rendering)
8. Phase 7 (a11y + QA gates)

---

## Definition of Done Checklist
- [ ] `project_types_view` exists and is used by admin selectors
- [ ] `techstacks` table exists and contains migrated hardcoded stack data
- [ ] Project ↔ techstack relation is implemented and used by create/update/list/read paths
- [ ] Public project detail page uses article content + structured project header with techstack icons/badges
- [ ] Admin theme matches client token system in light/dark modes
- [ ] Sidebar is replaced with 4-tab bar (Me / Projects / Articles / Settings)
- [ ] Admin home is a bento grid with visitor insight cards
- [ ] Projects page supports search, filters, actions, pagination, click-to-edit, cards
- [ ] Articles page supports search, filters, actions, pagination, click-to-edit, cards
- [ ] WCAG 2.1 AA accessibility checks pass for new admin surfaces
