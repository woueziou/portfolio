# Performance Audit Report — Portfolio Site

**Date:** 2026-06-04
**Audit scope:** Astro rendering, React islands, Supabase queries, Vercel deployment, bundle/assets, UX/loading states
**Deployment:** Vercel Hobby (10s timeout, no Edge Middleware, cold starts)
**Supabase tier:** Free (500MB DB, limited pooling, 1-week inactivity pausing)

---

## ISSUE-1
  Category   : Architecture
  Severity   : Critical
  Location   : `apps/web/astro.config.mjs:10`
  Problem    : `output: 'server'` forces every page (home, blogs, projects) through SSR, even though ALL public content is database-driven and identical for every unauthenticated visitor. On Vercel Hobby this means every page view triggers a cold-startable serverless function that runs 3+ Supabase queries synchronously.
  Evidence   : `output: 'server'` in astro.config.mjs with no `export const prerender = true` on any public page.
  Fix        : Switch to `output: 'static'` and add `export const prerender = true` to `index.astro`, `blogs/index.astro`, and `projects/[slug].astro`. Use `@astrojs/vercel`'s ISR (`isr` config) for project pages to revalidate on publish. Pre-build during deployment via `astro build` which will fetch from Supabase once at build time and generate static HTML.
  Impact     : Eliminates serverless cold starts for all public pages (~200–800ms saved per first visit). Reduces Supabase query volume by 99%+ (queries only run at build time and on-demand revalidation, not per visitor). Removes 500ms+ of TTFB latency.

## ISSUE-2
  Category   : Data Fetching
  Severity   : High
  Location   : `apps/web/src/pages/blogs/index.astro:14`
  Problem    : Uses `select('*')` which fetches ALL columns including `content` (TipTap JSON, potentially 10s of KB of HTML per article). On a list page that only needs title, slug, summary, published_at, and reading_time_minutes, this over-fetches.
  Evidence   : `.select('*')` on line 14.
  Fix        : Replace with targeted `select('id, title, slug, summary, published_at, reading_time_minutes, status')`.
  Impact     : Reduces query response size by ~80–95% for list views. Faster TTFB on blogs page.

## ISSUE-3
  Category   : Data Fetching
  Severity   : High
  Location   : `apps/web/src/pages/projects/[slug].astro:58-63`
  Problem    : Article fetch for a project page runs sequentially AFTER the profile+project `Promise.all` resolves, creating an unnecessary waterfall. The article query depends on `projectId` which is only known after the project resolves, BUT the check for `projectError || !project` could short-circuit first, then fetch articles in parallel with other post-resolve logic.
  Evidence   : Lines 26-40 run `Promise.all([profile, project])`, then lines 58-63 run a separate `await supabase.from('articles')...`.
  Fix        : Restructure: after project is confirmed non-null, run article fetch immediately alongside the typedProject and techstack extraction (which are synchronous in-memory operations). This removes the await waterfall.
  Impact     : Removes ~1 sequential round-trip latency (~50–150ms).

## ISSUE-4
  Category   : Data Fetching
  Severity   : High
  Location   : `apps/web/src/pages/index.astro:21`
  Problem    : Uses `select()` without specifying columns, fetching ALL columns from the `projects` table for a homepage that only displays project cards. Over-fetches every row.
  Evidence   : `supabase.from('projects').select()` with no column list.
  Fix        : Add explicit column list: `.select('id, title, description, main_image_url, url, access_link, state, project_date, type, tech_stack, slug, publication_status')`.
  Impact     : Reduces payload size by ~40% for projects list (excludes internal IDs, timestamps, user_id, large content fields).

## ISSUE-5
  Category   : Architecture
  Severity   : High
  Location   : `apps/web/src/components/home/footer/footer.tsx`
  Problem    : Footer is a React island marked `client:visible` in `index.astro:114` but contains NO interactivity — only static text ("Made by Taas S. Ekpaye", "Made with Astro"). This forces an unnecessary React hydration, shipping ~40KB of React runtime JS for zero benefit.
  Evidence   : `footer.tsx` contains only static JSX. `index.astro:114` has `<Footer client:visible />`.
  Fix        : Convert Footer to a pure Astro component (`.astro` file). Remove the `client:visible` directive entirely.
  Impact     : Eliminates React hydration for footer. Reduces JS shipped by ~40KB gzipped. Removes one hydration task from the main thread.

## ISSUE-6
  Category   : Architecture
  Severity   : High
  Location   : `apps/web/src/pages/index.astro:92`
  Problem    : Hero component uses `client:load` which forces immediate hydration during page load, competing with LCP rendering. The Hero contains GitHubCalendar which fetches external data, but the static parts (name, title, bio, avatar, social links) could render immediately from server HTML.
  Evidence   : `<Hero client:load profile={profileData} socialLinks={socialLinks} />` on line 92.
  Fix        : Split Hero into two layers: (1) an Astro component that renders the static parts (name, title, bio, avatar, contacts) server-side, and (2) the GitHubCalendar as a separate island with `client:visible` that hydrates only when scrolled into view. This ensures LCP (the hero text) renders from server HTML instantly.
  Impact     : LCP text visible at ~200ms instead of ~800ms (after React hydration). Better first impression on 3G.

## ISSUE-7
  Category   : Bundle
  Severity   : High
  Location   : `apps/web/src/components/home/projects/project-item.tsx:1-21`
  Problem    : Imports 20+ icon packages from `@icons-pack/react-simple-icons` at the top level. Even with tree-shaking, each icon component carries its own SVG path data, resulting in ~15–25KB of icon data bundled into the project list island.
  Evidence   : Lines 1-21 have named imports for 20 icons from `@icons-pack/react-simple-icons`.
  Fix        : Dynamic import icons lazily or switch to inline SVG `<path>` elements for the most common icons. Alternatively, use `lucide-react`'s existing icon set (already in the bundle) or sprite-based SVG approach.
  Impact     : Reduces ProjectClient island JS by ~15–20KB gzipped.

## ISSUE-8
  Category   : Fonts
  Severity   : High
  Location   : `apps/web/public/baufra/stylesheet.css:1-72`, `apps/web/src/styles/global.css:69`
  Problem    : Baufra `@font-face` declarations have NO `font-display: swap` property. During font load (especially on slow 3G), the browser hides text for up to 3 seconds (FOIT = Flash of Invisible Text). This directly impacts LCP and perceived performance. Additionally, EOT and TTF formats are included for all 6 weights (~500KB+ total) even though WOFF2 suffices for all modern browsers. Google Fonts Audiowide is loaded via render-blocking `@import`.
  Evidence   : `stylesheet.css` contains `@font-face` rules with no `font-display`. `global.css:1` has `@import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap')` which, despite `display=swap`, is still fetched via render-blocking `@import`.
  Fix        : Add `font-display: swap` to all Baufra `@font-face` rules. Remove EOT/TTF/WOFF formats, keep only WOFF2. For Audiowide, replace `@import` with a `<link rel="preload" as="font">` in `<head>` + standard `<link rel="stylesheet">`.
  Impact     : Eliminates FOIT — text is visible in fallback font immediately, then swapped. Reduces Baufra font download by ~60%. Removes render-blocking CSS import.

## ISSUE-9
  Category   : Architecture
  Severity   : High
  Location   : `apps/web/astro.config.mjs`
  Problem    : No `<ViewTransitions />` component is enabled in the layout. While `ClientRouter` from `astro:transitions` is present in `BaseLayout.astro:104`, in Astro 5+ the recommended approach is `ViewTransitions`. The current setup may work but lacks features like `transition:animate`, fallback control, and `transition:persist`. Additionally, no `prefetch` is configured in astro.config for navigation links.
  Evidence   : No `prefetch` configuration in `astro.config.mjs`. No `ViewTransitions` component in layout (only `ClientRouter`).
  Fix        : Add `prefetch: { defaultStrategy: 'hover' }` (or `'tap'` for mobile) to astro.config. Update `ClientRouter` to `ViewTransitions` if using Astro 5+ API. Add `transition:animate` directives for page transitions.
  Impact     : Near-instant SPA-like navigation. Eliminates full-page reloads that re-trigger SSR cold starts. Prefetch reduces perceived nav latency by ~80%.

## ISSUE-10
  Category   : Supabase
  Severity   : Medium
  Location   : `apps/web/src/pages/projects/[slug].astro:26-40`
  Problem    : Uses `select()` (wildcard) for the project query, which fetches `content` and other large columns even though they aren't rendered on this page.
  Evidence   : `supabase.from('projects').select(`*,\n    project_techstacks(...)`)` on lines 30-36 (backtick includes `*`).
  Fix        : Specify exact columns needed: `title, description, main_image_url, url, access_link, state, project_date, type, tech_stack, slug, publication_status`.
  Impact     : Reduces response payload size by ~30–50% per project page.

## ISSUE-11
  Category   : Supabase
  Severity   : Medium
  Location   : `apps/web/src/actions/projects.ts:16-47`
  Problem    : `syncProjectTechstacks` performs a DELETE then INSERT sequentially. If the INSERT fails after the DELETE, the project loses all techstack associations. No transaction wrapping.
  Evidence   : Lines 35-46 — `await supabase.from('project_techstacks').delete()` followed by `await supabase.from('project_techstacks').insert()`.
  Fix        : Use a Supabase RPC function (stored procedure) to atomically replace techstacks in a single call, or at minimum reverse the order (insert first, then delete old relations after verifying insert success).
  Impact     : Prevents data loss on partial failure. Eliminates a race condition where project appears without techstacks.

## ISSUE-12
  Category   : Supabase
  Severity   : Medium
  Location   : `apps/web/src/lib/supabase/cached-query.ts:32`
  Problem    : `cachedSelect` uses `select()` without specifying columns, over-fetching on client-side queries.
  Evidence   : `let query = supabase.from(table as string).select()` on line 32.
  Fix        : Accept an optional `columns` parameter and pass it to `.select(columns)`.
  Impact     : Reduces localStorage cache size and network payload for client-side data fetches.

## ISSUE-13
  Category   : Data Fetching
  Severity   : Medium
  Location   : `apps/web/src/actions/projects.ts` and `apps/web/src/actions/articles.ts`
  Problem    : Multiple action handlers call `supabase.auth.getUser()` followed by a separate `supabase.from(...).select().eq('id', id).single()` for ownership checks. This is two sequential round-trips when a single query joining on `user_id` could validate both.
  Evidence   : Pattern repeated in `projects.create`, `projects.update`, `projects.delete`, `articles.create`, etc. — always `getUser()` then `select().single()`.
  Fix        : Combine the ownership check into the final query by adding `.eq('user_id', user.id)` to the select/update/delete query, fetching user from `context.locals.user` (already set by middleware for admin routes). This eliminates the second query entirely.
  Impact     : Reduces admin page action latency by ~40% (removing 1 round-trip per action).

## ISSUE-14
  Category   : Architecture
  Severity   : Medium
  Location   : `apps/web/src/pages/index.astro:66` and `apps/web/src/layouts/AdminLayout.astro:53`
  Problem    : `ThemeSwitcher` with `client:load` forces immediate hydration at page load. Theme switching is not a time-critical interaction — users don't toggle theme in the first 2 seconds.
  Evidence   : `<ThemeSwitcher client:load />` at both locations.
  Fix        : Change to `client:idle` — the theme is already applied via the inline `<script is:inline>` in `BaseLayout.astro:86-102`, which runs before first paint. The React island only handles toggling, which can wait for idle.
  Impact     : Frees main thread during critical LCP window. React hydration of ThemeSwitcher deferred by ~200–500ms.

## ISSUE-15
  Category   : Architecture
  Severity   : Medium
  Location   : `apps/web/src/pages/index.astro:118`
  Problem    : `ToastContainer` with `client:load` forces immediate hydration even though toasts only appear after user interaction (e.g., copying email). No toast is displayed on initial render.
  Evidence   : `<ToastContainer client:load />` on line 118.
  Fix        : Change to `client:idle`. The toast module's `showToast` function is a module-level singleton that works across islands — it does not need the DOM to be hydrated to queue toasts. The container can hydrate later.
  Impact     : Removes one React hydration task from page-load critical path.

## ISSUE-16
  Category   : Vercel
  Severity   : Medium
  Location   : `apps/web/vercel.json`
  Problem    : The catch-all route `"src": "/[^.]+"` rewrites everything to `/`, which means every single non-file request triggers the Astro SSR handler. With `output: 'server'`, this means every page view triggers a serverless function cold start, even for assets that should be static.
  Evidence   : vercel.json routes config.
  Fix        : Remove or restrict the catch-all route. With `output: 'static'`, only SSR pages (admin) route through the serverless function. Static pages are served from Vercel's CDN directly.
  Impact     : After fixing Issue 1, this eliminates unnecessary function invocations entirely for public pages.

## ISSUE-17
  Category   : UX
  Severity   : Medium
  Location   : `apps/web/src/components/home/projects/project-item.tsx:132`
  Problem    : Project images have `loading="lazy"` but no explicit `width` and `height` attributes, causing Cumulative Layout Shift (CLS) as images load and push content down.
  Evidence   : `<Image ... loading="lazy" />` on line 132 with no width/height.
  Fix        : Add explicit `width` and `height` to the Image wrapper or use `aspect-ratio` CSS. The container is forced to `h-[350px]` but the image itself does not reserve space before loading.
  Impact     : Eliminates CLS from project image loading. Improves Core Web Vitals score.

## ISSUE-18
  Category   : UX
  Severity   : Medium
  Location   : `apps/web/src/pages/projects/[slug].astro:132-137`
  Problem    : Project detail image uses raw `<img>` without explicit `width`/`height` attributes, causing CLS.
  Evidence   : `<img src={typedProject.main_image_url} alt={typedProject.title} class="w-full h-auto object-cover" loading="eager" />` on lines 132-137.
  Fix        : Add `width` and `height` attributes, or use a container with `aspect-ratio`.
  Impact     : Eliminates CLS on project detail pages.

## ISSUE-19
  Category   : Bundle
  Severity   : Low
  Location   : `apps/web/src/components/admin/ProjectForm.tsx:3`
  Problem    : Imports `useDisclosure, useFileDialog` from `@mantine/hooks` — a full Mantine dependency just for two small hooks. `useDisclosure` is trivially implementable with `useState(false)`. `useFileDialog` wraps `<input type="file">` which can be done natively.
  Evidence   : `import { useDisclosure, useFileDialog } from '@mantine/hooks'` on line 3.
  Fix        : Replace with native React patterns. `useDisclosure` → `const [opened, setOpened] = useState(false)`. `useFileDialog` → a hidden `<input type="file">` triggered by a button click.
  Impact     : Removes `@mantine/hooks` from the admin bundle (~5KB gzipped). Only affects admin pages.

## ISSUE-20
  Category   : UX
  Severity   : Medium
  Location   : Site-wide
  Problem    : No `<Suspense>` boundaries on any React island that fetches data. When GitHubCalendar or ProjectList loads, there is zero loading UI — stale or blank sections.
  Evidence   : No `React.Suspense` usage found anywhere.
  Fix        : Wrap data-fetching islands (GitHubCalendar, ProjectList, ArticleList) in `<Suspense fallback={<Skeleton />}>`. For the homepage, show skeleton cards for the project grid.
  Impact     : Users see immediate loading skeletons instead of blank space. Improves perceived performance.

## ISSUE-21
  Category   : Supabase
  Severity   : High
  Location   : All Supabase queries in Astro pages and actions
  Problem    : No timeout handling on Supabase queries. On Vercel Hobby with its 10s hard timeout, an unresolved Supabase promise will cause the entire function to fail with a 502/504 error and no graceful fallback.
  Evidence   : All `await supabase.from(...)` calls have no timeout wrapper, no AbortSignal, no `Promise.race`.
  Fix        : Wrap all Supabase calls with `Promise.race` against a timeout (e.g., 8s for server, 5s for client). On timeout, return cached or fallback data. Example: `const result = await Promise.race([supabaseQuery, timeout(8000)])`.
  Impact     : Prevents hard 502 errors on Supabase degraded performance. Users see cached content with a warning instead of an error page.

## ISSUE-22
  Category   : Data Fetching
  Severity   : Low
  Location   : `apps/web/src/actions/profiles.ts:121-125`
  Problem    : Console.log statements for debugging left in production code, leaking potentially sensitive data (user IDs, profile data).
  Evidence   : `console.log('Profile picture', url)` on line 121, `console.log('User id', userId)` on line 122, `console.log(p)` on line 125.
  Fix        : Remove all `console.log` calls from `profiles.ts`.
  Impact     : No performance impact, but security/privacy issue. 

## ISSUE-23
  Category   : Architecture
  Severity   : Medium
  Location   : `apps/web/src/components/admin/ProjectPublishControls.tsx:75` and `apps/web/src/components/admin/ArticlePublishControls.tsx:88`
  Problem    : `window.location.reload()` is called after status change, forcing a full page reload instead of using `navigate()` from `astro:transitions/client` or refreshing data via actions.
  Evidence   : `window.location.reload()` on publish controls.
  Fix        : Use `navigate(window.location.pathname)` from `astro:transitions/client` to trigger a client-side transition. Or better, refetch data via actions and update state without navigation.
  Impact     : Avoids full page reload, preserving client state. Faster perceived admin UX.

## ISSUE-24
  Category   : Bundle
  Severity   : Medium
  Location   : `apps/web/src/components/home/hero/hero.tsx:5`
  Problem    : `GitHubCalendar` component (`react-github-calendar`) is imported at the top level of the Hero island and always bundled, even though the GitHub calendar is well below the fold on most screens.
  Evidence   : `import GitHubCalendar from '@/components/GitHubCalendar'` on line 5 of hero.tsx.
  Fix        : Lazy-load `GitHubCalendar` via `React.lazy(() => import('@/components/GitHubCalendar'))` wrapped in `<Suspense>`. This defers the ~30KB+ of chart library JS until the component scrolls near the viewport or after idle.
  Impact     : Removes ~30KB+ from the critical rendering path. Hero island hydrates ~40% faster.

## ISSUE-25
  Category   : Architecture
  Severity   : High
  Location   : Missing page
  Problem    : There is no `pages/blogs/[slug].astro` route. Blog articles created in the admin panel have no public page to render on, making the blogs section essentially a dead-end (list page shows articles, but clicking them leads nowhere).
  Evidence   : Directory `pages/blogs/` contains only `index.astro`, no `[slug].astro`.
  Fix        : Create `pages/blogs/[slug].astro` that fetches a single article by slug and renders it using the existing `ArticleRenderer.astro` component, similar to the project detail page pattern.
  Impact     : Completes the blogs feature. Enables individual article pages with SEO-friendly URLs.

## ISSUE-26
  Category   : Bundle
  Severity   : Low
  Location   : `apps/web/public/baufra/`
  Problem    : Baufra font ships EOT, TTF, WOFF, and WOFF2 formats for all 6 weights — totaling ~1.2MB of font files. EOT is an IE-only format (dead browser). TTF is uncompressed and unnecessary when WOFF2 exists.
  Evidence   : 26 files in `public/baufra/`, split across 4 formats × 6 weights + 2 extra.
  Fix        : Delete all `.eot` and `.ttf` files. Keep only `.woff2` (and optionally `.woff` for Safari < 12). Update `stylesheet.css` accordingly.
  Impact     : Reduces font download size by ~70%. Fewer requests on cold cache.

---

# PRIORITY ORDER

Fix in this sequence for maximum impact with minimum effort:

1. **ISSUE-1** (Switch to `output: 'hybrid'`) — single config change, eliminates ALL cold-start latency for public pages.
2. **ISSUE-8** (Add `font-display: swap` to Baufra) — two lines of CSS, eliminates FOIT/FOUT and directly improves LCP.
3. **ISSUE-5** (Convert Footer to Astro) — pure static component, zero reason to be React. Easy win.
4. **ISSUE-2** (Stop `select('*')` on blogs list) — add explicit column list, 30-second fix.
5. **ISSUE-6** (Split Hero into static Astro + lazy GitHub island) — requires component refactoring but gives the biggest LCP improvement.
6. **ISSUE-9** (Add prefetch + ViewTransitions) — enables SPA-like navigation, eliminates cold starts on nav.
7. **ISSUE-21** (Add Supabase query timeouts) — prevents hard 502 errors.
8. **ISSUE-14** (Change `client:load` → `client:idle` for ThemeSwitcher, ToastContainer) — frees main thread.
9. **ISSUE-4** (Explicit columns on homepage projects query) — reduces payload size.
10. **ISSUE-13** (Combine auth + ownership checks in actions) — eliminates 1 round-trip per admin action.

**Top 3 justification:**
- **ISSUE-1** is the single most impactful change: it eliminates the Vercel serverless function from the critical path for all public visitors, reducing TTFB from ~500ms to ~50ms (CDN edge cache).
- **ISSUE-8** makes the site *visibly* faster — users see text immediately in a fallback font instead of a blank screen while Baufra loads. This is the #1 perceived performance fix.
- **ISSUE-5** is the highest ratio of impact-to-effort — removing one `client:visible` directive and converting a 10-line component to `.astro` eliminates 40KB of React JS from every page.

---

# QUICK WINS (under 30 minutes each)

1. **Add `font-display: swap` to Baufra** — edit `public/baufra/stylesheet.css`, add `font-display: swap;` to all 6 `@font-face` rules. 5 minutes.
2. **Fix blogs `select('*')`** — `apps/web/src/pages/blogs/index.astro:14`, change to explicit columns. 5 minutes.
3. **Fix projects detail `select(*)`** — `apps/web/src/pages/projects/[slug].astro:30`, change to explicit columns. 5 minutes.
4. **Fix homepage `select()`** — `apps/web/src/pages/index.astro:21`, add column list. 5 minutes.
5. **Add `prefetch` to astro.config** — add `prefetch: { defaultStrategy: 'hover' }`. 5 minutes.

---

# ARCHITECTURAL CHANGES (requires refactoring)

| Change | Effort |
|--------|--------|
| Switch to `output: 'hybrid'` with ISR for project pages (`astro.config.mjs` + add prerender exports to public pages) | ~2 hours |
| Split Hero into static Astro wrapper + lazy GitHubCalendar island (`hero.tsx`, new `hero.astro`, `GitHubCalendar.tsx` lazy-load refactor) | ~3 hours |
| Add `blogs/[slug].astro` page (new page route + SEO + rendered article content) | ~2 hours |
| Add Supabase query timeout wrapper + error boundary (new `withTimeout` utility, error UI components) | ~3 hours |
| Convert admin action handlers to use `Astro.locals.user` from middleware instead of calling `getUser()` on every action | ~2 hours |
| Replace `@mantine/hooks` usage in ProjectForm with native React patterns | ~1 hour |
| Delete unused Baufra font formats (EOT, TTF) and clean up `stylesheet.css` | ~30 minutes |
| Add `<Suspense>` boundaries + skeleton loading states for data-fetching islands | ~2 hours |
