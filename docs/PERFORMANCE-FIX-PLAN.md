# Performance Fix Plan

Targets all 26 issues from `PERFORMANCE-AUDIT.md`. Organized in 5 phases, ordered by impact-to-effort ratio.

---

## Phase 1 — Critical Quick Wins (Day 1, ~2 hours total)

These changes are individually small, safe, and deliver immediate measurable improvements.

### 1.1 Switch to `output: 'hybrid'` + prerender public pages
  **Addresses:** ISSUE-1, ISSUE-16
  **Files:**
  - `apps/web/astro.config.mjs` — change `output: 'server'` to `output: 'hybrid'`
  - `apps/web/src/pages/index.astro` — add `export const prerender = true` in frontmatter
  - `apps/web/src/pages/blogs/index.astro` — add `export const prerender = true` in frontmatter
  - `apps/web/src/pages/projects/[slug].astro` — add `export const prerender = true` in frontmatter
  - `apps/web/src/pages/404.astro` — remove `export const prerender = false`, let hybrid handle it
  - `apps/web/vercel.json` — remove the catch-all route (no longer needed)

  **Steps:**
  1. Add `export const prerender = true` to the 3 public pages + remove `prerender = false` from 404.
  2. Change `output: 'server'` → `output: 'hybrid'` in `astro.config.mjs`.
  3. Remove the catch-all route block from `vercel.json`.
  4. Run `astro build` locally. Verify that `dist/` contains static `.html` files for `/`, `/blogs`, `/404`.
  5. Verify admin pages (`/admin/*`) still SSR correctly. Confirm login redirect works.

  **Verification:** Deploy to Vercel preview, run `curl -sI https://preview.vercel.app/` and confirm no `x-vercel-cache: MISS` on the homepage (should be `HIT` or no serverless invocation).

### 1.2 Add `font-display: swap` to Baufra
  **Addresses:** ISSUE-8
  **File:** `apps/web/public/baufra/stylesheet.css`

  **Steps:**
  1. Add `font-display: swap;` to all 6 `@font-face` rules.
  2. Delete all `.eot` and `.ttf` files from `public/baufra/`.
  3. Update each `@font-face` to reference only `.woff2` and `.woff` formats. Remove EOT/TTF `src` entries.

  **Verification:** Load homepage, throttle to Slow 3G in DevTools, confirm text renders in fallback font immediately (not hidden).

### 1.3 Fix `select('*')` over-fetching on list pages
  **Addresses:** ISSUE-2, ISSUE-4, ISSUE-10
  **Files:**
  - `apps/web/src/pages/blogs/index.astro:13-16` — replace `.select('*')` with `.select('id, title, slug, summary, published_at, reading_time_minutes, status')`
  - `apps/web/src/pages/index.astro:21` — replace `.select()` with `.select('id, title, description, main_image_url, url, access_link, state, project_date, type, tech_stack, slug, publication_status')`
  - `apps/web/src/pages/projects/[slug].astro:30-36` — replace backtick `*` wildcard with explicit columns

  **Verification:** Deploy, check Network tab — response payloads should be significantly smaller (particularly the blogs list, which no longer fetches `content`).

### 1.4 Convert Footer to pure Astro component
  **Addresses:** ISSUE-5
  **Steps:**
  1. Create `apps/web/src/components/home/footer/footer.astro` with the same HTML/CSS as `footer.tsx` (just static markup).
  2. In `apps/web/src/pages/index.astro`, replace `<Footer client:visible />` with `<Footer />` (importing from the new `.astro` file).
  3. Delete `apps/web/src/components/home/footer/footer.tsx`.

  **Verification:** Footer renders identically. DevTools Sources panel: no React chunk loaded for footer.

### 1.5 Change `client:load` to `client:idle` for non-critical islands
  **Addresses:** ISSUE-14, ISSUE-15
  **Files:**
  - `apps/web/src/pages/index.astro:66` — ThemeSwitcher: `client:load` → `client:idle`
  - `apps/web/src/pages/index.astro:118` — ToastContainer: `client:load` → `client:idle`
  - `apps/web/src/layouts/AdminLayout.astro:53` — ThemeSwitcher: `client:load` → `client:idle`

  **Verification:** Theme toggle still works. Toast still appears. Page load has fewer hydration tasks in Performance profiler.

### 1.6 Add prefetch to astro.config
  **Addresses:** ISSUE-9
  **File:** `apps/web/astro.config.mjs`

  **Steps:**
  1. Add `prefetch: { defaultStrategy: 'hover' }` inside the `defineConfig` object.
  2. Also add `prefetch: { defaultStrategy: 'hover' }` with `prefetch: { prefetchAll: true }` for anchor links within the same origin.

  **Verification:** Navigate between pages — should feel instant (prefetched pages load from cache). Check Network tab for prefetch requests on link hover.

---

## Phase 2 — Data Fetching Optimization (Day 2, ~3 hours)

### 2.1 Fix waterfall fetch in project detail page
  **Addresses:** ISSUE-3
  **File:** `apps/web/src/pages/projects/[slug].astro:44-63`

  **Steps:**
  1. After the `Promise.all` on line 26-40, the early return on line 44-46 is correct.
  2. But on line 55, `const projectId = typedProject.id` is synchronous.
  3. So the article fetch on line 58 can start immediately after line 55 — restructure to remove the serial await.
  4. Actually, the issue is that articles are fetched sequentially after projects. Instead, since articles depend on `projectId`, restructure: after `projectId` is assigned, immediately kick off the article fetch and do the techstack extraction in parallel (the extraction is synchronous so no real parallelism needed, but the article fetch should start ASAP).

  The current code does this:
  ```
  const project = await fetchProject
  const projectId = project.id
  const articles = await fetchArticles  // waits
  const techstacks = extract(project)   // sync, but after articles
  ```
  Change to:
  ```
  const project = await fetchProject
  const projectId = project.id
  const techstacks = extract(project)  // sync, no reason to wait
  ```
  The article fetch already runs right after and there's no way to parallelize it since it needs projectId. The real fix: remove the sequential barrier. The current code is actually fine — the article fetch runs immediately. The fix is just to move the sync extraction before the fetch for clarity.

  **Actual issue re-examined:** Lines 55-71 extract techstacks synchronously inside a `const` block, while the `await` on line 58 for articles is above them. This means extraction happens AFTER article fetch. Move extraction before article fetch: no functional change but the extraction doesn't need to wait.

  **Verification:** No measurable perf change here (extraction is sub-millisecond). The real fix was in 1.3 (column selection). This issue is cosmetic/documentation only — mark as resolved by 1.3.

### 2.2 Combine auth + ownership checks in action handlers
  **Addresses:** ISSUE-13
  **Files:**
  - `apps/web/src/actions/projects.ts` — `update`, `delete`, `publish`, `getById`, `uploadImage`
  - `apps/web/src/actions/articles.ts` — `update`, `delete`, `publish`, `getById`, `saveContent`

  **Steps:**
  1. For admin routes, middleware already sets `context.locals.user`. In action handlers, instead of calling `supabase.auth.getUser()` followed by `supabase.from(...).select(...).eq('id', id).single()` for ownership, do ONE query:
     ```
     const { data: row, error } = await supabase
       .from(table)
       .select('user_id')
       .eq('id', id)
       .eq('user_id', context.locals.user.id)
       .single()
     ```
  2. If `error || !row`, the user either doesn't own it or it doesn't exist (same error response).
  3. Remove the separate `getUser()` call from each handler.

  **Example for `projects.update`:**
  ```typescript
  // BEFORE (lines 124-158):
  const supabase = createSupabaseServerClient(context.cookies)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw ...
  const { data: existingProject } = await supabase.from('projects').select('user_id, slug').eq('id', id).single()
  if (!existingProject || existingProject.user_id !== user.id) throw ...

  // AFTER:
  const supabase = createSupabaseServerClient(context.cookies)
  const userId = context.locals.user?.id
  if (!userId) throw new ActionError({ message: 'Unauthorized', code: 'UNAUTHORIZED' })
  const { data: existingProject } = await supabase
    .from('projects')
    .select('user_id, slug')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (!existingProject) throw new ActionError(...)
  ```

  **Verification:** Admin actions still work. Auth errors still return 401. Ownership check still blocks unauthorized edits.

### 2.3 Add Supabase query timeout wrapper
  **Addresses:** ISSUE-21
  **New file:** `apps/web/src/lib/supabase/with-timeout.ts`

  **Implementation:**
  ```typescript
  const SERVER_TIMEOUT_MS = 8000 // Vercel Hobby: 10s, leave 2s buffer
  const CLIENT_TIMEOUT_MS = 5000

  export async function withTimeout<T>(
    promise: Promise<T>,
    ms: number = SERVER_TIMEOUT_MS,
    fallback?: T,
  ): Promise<T> {
    if (typeof window !== 'undefined') ms = CLIENT_TIMEOUT_MS
    try {
      return await Promise.race([
        promise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), ms),
        ),
      ])
    } catch (err) {
      if (fallback !== undefined) return fallback
      throw err
    }
  }
  ```

  **Apply to all Supabase calls in Astro pages:**
  - `index.astro` — wrap each `.from(...)` call in `withTimeout()`
  - `projects/[slug].astro` — wrap profile, project, and articles fetches
  - `blogs/index.astro` — wrap articles fetch
  - `admin/index.astro` — wrap stats queries

  **Apply to all Supabase calls in action handlers:**
  - Wrap each query in `withTimeout(..., 8000)` with appropriate error fallback.

  **Verification:** Simulate a slow Supabase by adding a deliberate delay in test. Confirm the page returns cached/fallback data instead of a 502.

### 2.4 Remove debug `console.log` statements
  **Addresses:** ISSUE-22
  **Files:**
  - `apps/web/src/actions/profiles.ts` — lines 121, 122, 125
  - `apps/web/src/lib/services/profile.ts` — lines 90, 94, 109, 113

  **Steps:** Delete all `console.log` calls in production action code paths. Leave only error logging (`console.error`).

---

## Phase 3 — React Island Optimizations (Day 3, ~4 hours)

### 3.1 Split Hero into static Astro + lazy GitHub calendar island
  **Addresses:** ISSUE-6, ISSUE-24
  **Files:**
  - Create: `apps/web/src/components/home/hero/hero-static.astro` (name, title, bio, avatar, contacts)
  - Create: `apps/web/src/components/home/hero/GitHubCalendarIsland.tsx` (lazy wrapper)
  - Modify: `apps/web/src/components/home/hero/hero.tsx` — remove everything except GitHubCalendar, or delete and replace
  - Modify: `apps/web/src/pages/index.astro` — replace `<Hero client:load />` with static component + `<GitHubCalendarIsland client:visible />`

  **Steps:**
  1. Extract the static portion (profile info, name, title, bio, contacts, avatar) into `hero-static.astro`. This is pure HTML/CSS, no React.
  2. The contacts section (email copy button, outbound link tracking) needs interactivity. Either keep a small `ContactButtons` island with `client:visible`, or use vanilla JS for email copy behavior (no React needed for `navigator.clipboard.writeText`).
  3. Move `GitHubCalendar` into a separate island with `client:visible` and lazy-load `react-github-calendar` via `React.lazy`.
  4. In `index.astro`, render `hero-static.astro` inline (no client directive) + `<GitHubCalendarIsland client:visible />`.

  **Verification:** LCP (hero name text) renders from server HTML at ~100ms. GitHub Calendar hydrates only when scrolled near. No React JS in initial page load critical path.

### 3.2 Lazy-load icon imports in project-item
  **Addresses:** ISSUE-7
  **File:** `apps/web/src/components/home/projects/project-item.tsx`

  **Steps:**
  1. Replace the top-level icon imports (20 packages) with a lazy icon loader:
     ```typescript
     const iconCache = new Map<string, Promise<{ default: React.ComponentType<{ className?: string }> }>>()

     function loadIcon(name: string) {
       if (!iconCache.has(name)) {
         iconCache.set(name, import(`@icons-pack/react-simple-icons/si/${name}`))
       }
       return iconCache.get(name)!
     }
     ```
  2. Use `React.lazy` + `Suspense` inside the `getIcon` function, or render a generic placeholder while the icon loads.
  3. Alternatively, inline the SVG paths for the most common icons (5–6) and only lazy-load the rest.

  **Verification:** Bundle analyzer shows icon packages are code-split, not in the main ProjectClient chunk.

### 3.3 Add Suspense boundaries and loading skeletons
  **Addresses:** ISSUE-20
  **Files:**
  - `apps/web/src/components/home/projects/project-client.tsx` — wrap in Suspense with skeleton grid
  - `apps/web/src/components/GitHubCalendar.tsx` — already has inline loading state (pulse animation), good

  **Steps:**
  1. Create a `ProjectGridSkeleton` component with 3–6 animated placeholder cards.
  2. In `index.astro`, wrap `<ProjectClient client:visible />` in `<Suspense fallback={<ProjectGridSkeleton />}>`.
  3. For admin list components (`ProjectList`, `ArticleList`), add a loading skeleton prop that shows on initial data fetch.

  **Verification:** On slow connections, users see skeleton placeholders instead of blank sections.

### 3.4 Replace `@mantine/hooks` with native patterns
  **Addresses:** ISSUE-19
  **File:** `apps/web/src/components/admin/ProjectForm.tsx`

  **Steps:**
  1. Replace `useDisclosure` (from `@mantine/hooks`):
     ```typescript
     // BEFORE
     import { useDisclosure, useFileDialog } from '@mantine/hooks'
     const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false)
     // AFTER
     const [drawerOpened, setDrawerOpened] = useState(false)
     const openDrawer = () => setDrawerOpened(true)
     const closeDrawer = () => setDrawerOpened(false)
     ```
  2. Replace `useFileDialog` with a native hidden input:
     ```typescript
     const fileInputRef = useRef<HTMLInputElement>(null)
     const openFileDialog = () => fileInputRef.current?.click()
     // <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={...} />
     ```
  3. Remove `@mantine/hooks` from `package.json` dependencies if no other usage exists.

  **Verification:** File upload still works. Sheet/drawer still opens. Mantine is no longer in the admin bundle.

### 3.5 Replace `window.location.reload()` with client-side navigation
  **Addresses:** ISSUE-23
  **Files:**
  - `apps/web/src/components/admin/ProjectPublishControls.tsx:75`
  - `apps/web/src/components/admin/ArticlePublishControls.tsx:88`

  **Steps:**
  1. Import `navigate` from `astro:transitions/client`.
  2. Replace `window.location.reload()` with `navigate(window.location.pathname)`.
  3. Alternatively, refetch data via actions and update local state without navigation.

  **Verification:** After publish/unpublish, page transitions smoothly without full reload.

---

## Phase 4 — Supabase & Error Resilience (Day 3–4, ~3 hours)

### 4.1 Fix `syncProjectTechstacks` atomicity
  **Addresses:** ISSUE-11
  **File:** `apps/web/src/actions/projects.ts:16-47`

  **Steps:**
  1. Reverse the order: insert new techstacks first, verify success, THEN delete old ones.
  2. Better: wrap both in a try-catch that rolls back (re-inserts old relations on failure).
  3. Best: create a Supabase database function (stored procedure) that does the replace atomically:
     ```sql
     CREATE OR REPLACE FUNCTION replace_project_techstacks(p_project_id INT, p_techstack_ids TEXT[])
     RETURNS void AS $$
     BEGIN
       DELETE FROM project_techstacks WHERE project_id = p_project_id;
       INSERT INTO project_techstacks (project_id, techstack_id)
       SELECT p_project_id, unnest(p_techstack_ids);
     END;
     $$ LANGUAGE plpgsql;
     ```
  4. Call it via `supabase.rpc('replace_project_techstacks', { p_project_id: projectId, p_techstack_ids: ids })`.

  **Verification:** During an insert failure (simulate by passing invalid IDs), the existing relations remain intact.

### 4.2 Fix `cachedSelect` to accept column list
  **Addresses:** ISSUE-12
  **File:** `apps/web/src/lib/supabase/cached-query.ts:32`

  **Steps:**
  1. Add optional `columns` to the options parameter: `{ columns?: string }`.
  2. Pass to `.select(options?.columns ?? '*')`.

  **Verification:** Check Network tab — client-side cached queries no longer fetch unnecessary columns.

---

## Phase 5 — Missing Feature & Polish (Day 4, ~3 hours)

### 5.1 Create `blogs/[slug].astro` page
  **Addresses:** ISSUE-25
  **New file:** `apps/web/src/pages/blogs/[slug].astro`

  **Implementation:**
  1. Follow the same pattern as `projects/[slug].astro`:
     - Fetch article by slug + `status = 'published'`
     - Fetch profile for author name
     - Render `ArticleRenderer` with `content_html`
     - Add JSON-LD structured data
     - SEO meta tags
  2. Show 404 redirect if article not found.
  3. Link from `blogs/index.astro` article titles to `/blogs/${article.slug}`.

  **Verification:** Navigate from blogs list → article detail. Share URL. Check SEO metadata.

### 5.2 Clean up Baufra font files
  **Addresses:** ISSUE-26
  **File:** `apps/web/public/baufra/`

  **Steps:**
  1. Delete all `.eot` and `.ttf` files (12 files).
  2. Update `stylesheet.css` to reference only `.woff2` and `.woff`.
  3. Verify font still loads correctly in Chrome, Firefox, Safari.

### 5.3 Move Audiowide font from `@import` to `<link>`
  **Addresses:** ISSUE-8 (sub-issue)
  **Files:**
  - `apps/web/src/styles/global.css:1` — remove the `@import`
  - `apps/web/src/layouts/BaseLayout.astro` — add `<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Audiowide&display=swap">` and `<link rel="stylesheet" href="...">` after the Google Fonts preconnects.

---

## Execution Order Summary

```
Day 1 (2h):  Phase 1 (1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6)
             After this phase: TTFB down 80%, FOIT eliminated, JS bundle down ~40KB

Day 2 (3h):  Phase 2 (2.1 → 2.2 → 2.3 → 2.4)
             After this phase: Admin actions 40% faster, no 502s on Supabase degradation

Day 3 (4h):  Phase 3 (3.1 → 3.2 → 3.3 → 3.4 → 3.5)
             After this phase: LCP text visible at ~100ms, smooth skeleton loading

Day 4 (3h):  Phase 4 + 5 (4.1 → 4.2 → 5.1 → 5.2 → 5.3)
             After this phase: Blog pages functional, fonts optimized, atomic DB ops
```

## Risk Assessment

| Change | Risk | Mitigation |
|--------|------|------------|
| `output: 'hybrid'` | Medium — admin pages must stay SSR | Use per-page `export const prerender = true/false`. Test all routes. |
| Replacing `@mantine/hooks` | Low — only used in ProjectForm | File upload behavior identical. Manual test. |
| Combining auth + ownership checks | Medium — changes all action handlers | Test every CRUD operation in admin panel. |
| Atomic techstack sync via RPC | Low — new DB function | Run migration in Supabase dashboard. Test create/update project. |
| Splitting Hero component | Low — visual regression | Compare screenshots before/after. Contact section behavior must match. |

---

## Target Metrics After All Phases

| Metric | Before | After |
|--------|--------|-------|
| TTFB (homepage, cold) | ~800ms | ~80ms (CDN edge) |
| LCP (homepage) | ~2.5s | ~0.8s |
| Total JS (homepage) | ~180KB | ~90KB |
| CLS (project page) | 0.15 | 0.00 |
| Supabase queries per page view | 3 (every visit) | 0 (static, build-time only) |
| Blog article pages | 404/not found | Working |
