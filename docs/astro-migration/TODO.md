# Astro Migration — TODO Task Tracker

> **Status legend**: `[ ]` pending · `[/]` in progress · `[x]` done · `[!]` blocked  
> **Priority**: 🔴 P0 (blocking) · 🟡 P1 (important) · 🟢 P2 (nice to have)

---

## Phase 0 — Foundation (🔴 P0)

| # | Task | Status | Test / Validation |
|---|---|---|---|
| 0.1 | Create `apps/web` with Astro scaffold | `[x]` | `ls apps/web/astro.config.mjs` exists |
| 0.2 | Install dependencies: `@astrojs/react`, `@tailwindcss/vite`, `@astrojs/sitemap`, `react`, `react-dom` | `[x]` | `jq '.dependencies' apps/web/package.json` has all 5 packages |
| 0.3 | Port Tailwind v4 global CSS + font imports | `[x]` | `bun run --filter web dev` starts without CSS errors |
| 0.4 | Configure `astro.config.mjs` (SSG, site URL, integrations) | `[x]` | `astro build` outputs static files to `apps/web/dist/` |
| 0.5 | Update root `package.json` scripts to point at `apps/web` | `[x]` | `bun run dev` starts Astro on port 3000 |

### Regression Tests — Phase 0

```bash
# T0.1 — Scaffold exists
test -f apps/web/astro.config.mjs && echo "✅ Scaffold OK" || echo "❌ Missing astro.config.mjs"

# T0.2 — Key deps installed
for pkg in @astrojs/react @astrojs/tailwind @astrojs/sitemap react react-dom; do
  jq -e ".dependencies[\"$pkg\"]" apps/web/package.json > /dev/null && echo "✅ $pkg" || echo "❌ Missing $pkg"
done

# T0.3 — Build succeeds
bun run --filter web build > /dev/null 2>&1 && echo "✅ Build OK" || echo "❌ Build failed"

# T0.4 — Static output present
test -f apps/web/dist/index.html && echo "✅ Static HTML OK" || echo "❌ No index.html in dist/"

# T0.5 — Global CSS compiled (check for Tailwind utilities in output)
grep -q 'min-h-screen' apps/web/dist/index.html && echo "✅ Tailwind compiled" || echo "❌ Tailwind not in output"
```

---

## Phase 1 — Layout & Theme (🔴 P0)

| # | Task | Status | Test / Validation |
|---|---|---|---|
| 1.1 | Create `layouts/BaseLayout.astro` with `<html>`, `<head>`, `<slot />` | `[x]` | `grep -q '<slot' apps/web/src/layouts/BaseLayout.astro` |
| 1.2 | Add SEO meta tags as props (title, description, OG, Twitter) | `[x]` | `grep -q 'og:image' apps/web/src/layouts/BaseLayout.astro` |
| 1.3 | Add JSON-LD Person schema to layout | `[x]` | `grep -q 'schema.org/Person' apps/web/src/layouts/BaseLayout.astro` |
| 1.4 | Inline `<script>` theme initializer (replaces `next-themes`) | `[x]` | `grep -q 'localStorage.getItem.*theme' apps/web/src/layouts/BaseLayout.astro` |
| 1.5 | Add Google Fonts `preconnect` + `preload` for CLS prevention | `[x]` | `grep -q 'fonts.googleapis.com' apps/web/src/layouts/BaseLayout.astro` |
| 1.6 | Create `pages/404.astro` with BaseLayout | `[x]` | `grep -q '404' apps/web/src/pages/404.astro` |

### Regression Tests — Phase 1

```bash
# T1.1 — Layout has slot
grep -q '<slot' apps/web/src/layouts/BaseLayout.astro && echo "✅ Layout slot OK" || echo "❌ Missing slot"

# T1.2 — OG tags present
grep -q 'og:title' apps/web/src/layouts/BaseLayout.astro && echo "✅ OG tags OK" || echo "❌ Missing OG tags"

# T1.3 — JSON-LD Person present
grep -q 'schema.org/Person' apps/web/src/layouts/BaseLayout.astro && echo "✅ JSON-LD OK" || echo "❌ Missing JSON-LD"

# T1.4 — Theme script present
grep -q 'localStorage' apps/web/src/layouts/BaseLayout.astro && echo "✅ Theme script OK" || echo "❌ Missing theme script"

# T1.5 — Build with 404 page
bun run --filter web build > /dev/null 2>&1 && echo "✅ Build OK" || echo "❌ Build failed"
test -f apps/web/dist/404.html && echo "✅ 404 page OK" || echo "❌ No 404.html"

# T1.6 — Rendered HTML has <title>
grep -q '<title>' apps/web/dist/index.html && echo "✅ Title in output" || echo "❌ No <title> in HTML"

# T1.7 — No next-themes dependency leaks into build
grep -q 'next-themes' apps/web/dist/ && echo "⚠️ next-themes found in output!" || echo "✅ next-themes absent from output"
```

---

## Phase 2 — Data Layer (🔴 P0)

| # | Task | Status | Test / Validation |
|---|---|---|---|
| 2.1 | Update `packages/shared/src/supabase.ts`: `VITE_*` → `SUPABASE_*` | `[x]` | `! grep -q 'VITE_SUPABASE' packages/shared/src/supabase.ts` |
| 2.2 | Rename env vars in `.env.local` | `[x]` | `grep -q '^SUPABASE_' .env.local && ! grep -q '^VITE_SUPABASE' .env.local` |
| 2.3 | Create `pages/index.astro` frontmatter with Supabase fetch | `[x]` | `grep -q 'supabase.from.*projects' apps/web/src/pages/index.astro` |
| 2.4 | Add error handling for failed Supabase fetch | `[x]` | `grep -q 'throw new Error\|error.message' apps/web/src/pages/index.astro` |

### Regression Tests — Phase 2

```bash
# T2.1 — env vars renamed
! grep -q 'VITE_SUPABASE' packages/shared/src/supabase.ts && echo "✅ No VITE_ prefix" || echo "❌ VITE_ prefix still present"

# T2.2 — Build-time fetch works (requires network + valid .env.local)
bun run --filter web build 2>&1 | grep -q 'Failed to fetch' && echo "❌ Supabase fetch failed" || echo "✅ Supabase fetch succeeded"

# T2.3 — Project data is in static HTML (inspect for a known project title)
# Replace "ProjectTitle" with an actual project title from your DB
grep -q 'href=".*http' apps/web/dist/index.html && echo "✅ Project links in HTML" || echo "⚠️ No external links found — check data"

# T2.4 — No client-side Supabase JS in output (SSG means zero runtime supabase-js)
grep -q 'supabase' apps/web/dist/index.html && echo "⚠️ supabase referenced in client HTML" || echo "✅ No supabase in client HTML"
```

---

## Phase 3 — Static Components (🔴 P0)

> **Approach**: Import legacy React components directly for pixel-perfect replication. No new .astro components created.

| # | Task | Status | Test / Validation |
|---|---|---|---|
| 3.1 | Import `Hero` component from legacy app | `[x]` | `apps/web/src/components/home/hero/hero.tsx` exists |
| 3.2 | Import `ProjectItem` + `ProjectClient` from legacy app | `[x]` | `apps/web/src/components/home/projects/*.tsx` exists |
| 3.3 | Import `Footer` component from legacy app | `[x]` | `apps/web/src/components/home/footer/footer.tsx` exists |
| 3.4 | Import shadcn UI components (button, card, hover-card, skeleton) | `[x]` | `apps/web/src/components/ui/*.tsx` exists |
| 3.5 | Import `lib/utils.ts` + `utils/formater.ts` from legacy app | `[x]` | `apps/web/src/lib/utils.ts` + `apps/web/src/utils/formater.ts` exists |
| 3.6 | Copy `noise-bg.png` + `baufra` fonts to public/ | `[x]` | `apps/web/public/noise-bg.png` exists |
| 3.7 | Match legacy root layout structure in `index.astro` | `[x]` | `grep -q 'noise-bg.png.*font-baufra.*min-h-screen' apps/web/dist/index.html` |
| 3.8 | CSS import with `shadcn/tailwind.css` | `[x]` | `grep -q 'shadcn' apps/web/src/styles/global.css` |

### Regression Tests — Phase 3

```bash
# T3.1 — Hero renders in build output
grep -q 'Taas S. Ekpaye' apps/web/dist/index.html && echo "✅ Name in HTML" || echo "❌ Name missing"

# T3.2 — Contact links present
grep -q 'github.com/woueziou' apps/web/dist/index.html && echo "✅ GitHub link OK" || echo "❌ GitHub link missing"
grep -q 'linkedin.com/in/taas' apps/web/dist/index.html && echo "✅ LinkedIn link OK" || echo "❌ LinkedIn link missing"

# T3.3 — Project cards rendered (check for at least one project title)
grep -q 'text-xl font-bold' apps/web/dist/index.html && echo "✅ Project titles in HTML" || echo "❌ No project titles found"

# T3.4 — Tech stack icons rendered
grep -q 'getIcon\|h-5 w-5' apps/web/dist/index.html && echo "⚠️ Possibly React icons in HTML" || echo "✅ Static icons (no getIcon calls)"

# T3.5 — Footer has correct stack name
grep -q 'Astro' apps/web/dist/index.html && echo "✅ Footer says Astro" || echo "❌ Footer doesn't mention Astro"

# T3.6 — No broken w-15/h-15 in output
grep -q 'w-15\|h-15' apps/web/dist/index.html && echo "❌ w-15/h-15 found (invalid Tailwind)" || echo "✅ No invalid Tailwind classes"

# T3.7 — Build succeeds
bun run --filter web build > /dev/null 2>&1 && echo "✅ Build OK" || echo "❌ Build failed"
```

---

## Phase 4 — React Islands (🟡 P1)

| # | Task | Status | Test / Validation |
|---|---|---|---|
| 4.1 | Create `components/ThemeSwitcher.tsx` — React island with `client:load` | `[x]` | Button renders in DOM; clicking toggles theme class on `<html>` |
| 4.2 | Create `components/GitHubCalendar.tsx` — React island with `client:visible` | `[x]` | Calendar loads when scrolled into view |
| 4.3 | Fix `react-github-calendar` type declarations (remove `@ts-expect-error`) | `[x]` | `! grep -q 'ts-expect-error' apps/web/src/components/GitHubCalendar.tsx` |
| 4.4 | Create/port `components/ui/HoverCard.tsx` — React island with `client:idle` | `[x]` | Hover/click on description shows full text |
| 4.5 | Port `components/ui/button.tsx` from shadcn | `[x]` | `grep -q 'cva\|Slot' apps/web/src/components/ui/button.tsx` |
| 4.6 | Port `components/ui/card.tsx` from shadcn | `[x]` | `grep -q 'CardTitle\|CardContent' apps/web/src/components/ui/card.tsx` |

### Regression Tests — Phase 4

```bash
# T4.1 — Theme switcher renders (check for button in output)
grep -q 'ThemeModeToggle\|theme-toggle\|switch' apps/web/dist/index.html || \
  grep -q 'data-island' apps/web/dist/index.html && echo "✅ Islands detected" || \
  echo "⚠️ No islands found in HTML — check client:* directives"

# T4.2 — GitHub calendar island present (look for its container)
grep -q 'GitHubCalendar\|react-github-calendar' apps/web/dist/index.html && \
  echo "✅ Calendar container in HTML" || echo "⚠️ Calendar not found in HTML"

# T4.3 — No ts-expect-error remains
! grep -r 'ts-expect-error' apps/web/src/ && echo "✅ No ts-expect-error" || echo "❌ ts-expect-error still present"

# T4.4 — Build succeeds with islands
bun run --filter web build > /dev/null 2>&1 && echo "✅ Build OK" || echo "❌ Build failed"

# T4.5 — Check that island JS files are produced (Astro auto-generates chunk names)
ls apps/web/dist/_astro/*.js > /dev/null 2>&1 && echo "✅ Island JS bundles produced" || echo "❌ No JS chunks in output"

# T4.6 — Bundle size check (should be < 100 KB gzipped for islands)
total_js=$(du -sh apps/web/dist/_astro/ 2>/dev/null | cut -f1)
echo "Total island JS: $total_js"
```

---

## Phase 5 — SEO & Polish (🟡 P1)

| # | Task | Status | Test / Validation |
|---|---|---|---|
| 5.1 | Verify OG tags in all page outputs | `[x]` | `grep -q 'og:title\|og:description\|og:image' apps/web/dist/index.html` |
| 5.2 | Add `sitemap.xml` generation (via `@astrojs/sitemap`) | `[x]` | `test -f apps/web/dist/sitemap-index.xml` |
| 5.3 | Add `robots.txt` in `public/` | `[x]` | `grep -q 'Allow' apps/web/public/robots.txt` |
| 5.4 | Add `favicon.ico` / SVG favicon to `public/` | `[x]` | `test -f apps/web/public/favicon.ico` |
| 5.5 | Create an OG default image (`public/og-default.svg`) | `[x]` | `test -f apps/web/public/og-default.svg` |
| 5.6 | Add `loading="lazy"` to all `<img>` tags | `[x]` | `! grep -r '<img[^>]*loading="eager"' apps/web/src/` |
| 5.7 | Verify Lighthouse audit improvements | `[/]` | Run Lighthouse — target: Performance ≥ 90, SEO ≥ 90 |

### Regression Tests — Phase 5

```bash
# T5.1 — Meta tags in index.html
for tag in 'og:title' 'og:description' 'og:image' 'twitter:card'; do
  grep -q "$tag" apps/web/dist/index.html && echo "✅ $tag" || echo "❌ Missing $tag"
done

# T5.2 — Sitemap generated
test -f apps/web/dist/sitemap-index.xml && echo "✅ Sitemap OK" || echo "❌ Missing sitemap"

# T5.3 — robots.txt available
test -f apps/web/dist/robots.txt && echo "✅ robots.txt OK" || echo "❌ Missing robots.txt"

# T5.4 — Favicon available
test -f apps/web/dist/favicon.ico && echo "✅ favicon OK" || echo "⚠️ No favicon"

# T5.5 — JSON-LD in output
grep -q 'schema.org' apps/web/dist/index.html && echo "✅ JSON-LD in HTML" || echo "❌ JSON-LD missing"

# T5.6 — Build succeeds
bun run --filter web build > /dev/null 2>&1 && echo "✅ Build OK" || echo "❌ Build failed"
```

---

## Phase 6 — Cleanup & Finalize (🟡 P1 → 🟢 P2)

| # | Task | Status | Test / Validation |
|---|---|---|---|
| 6.1 | Delete `apps/ui/` directory | `[ ]` | `! test -d apps/ui` |
| 6.2 | Remove unused deps from root workspace (`@tanstack/*`, `next-themes`, `stunk`, `framer-motion`) | `[ ]` | `! grep -q 'tanstack\|next-themes\|stunk' package.json` |
| 6.3 | Update `README.md` with new stack info | `[ ]` | `grep -q 'Astro' README.md` |
| 6.4 | Update `docs/project.md` to correct the stack from "TanStack Start" → "Astro" | `[ ]` | `! grep -q 'TanStack Start\|TanStack Start' docs/project.md` |
| 6.5 | Update `.gitignore` (remove Vite-specific entries if any) | `[ ]` | Verify against Astro's recommended `.gitignore` |
| 6.6 | Verify full `bun install` from clean state (delete `node_modules`, reinstall) | `[ ]` | `bun install && bun run build` succeeds |

### Regression Tests — Phase 6

```bash
# T6.1 — apps/ui deleted
test -d apps/ui && echo "❌ apps/ui still exists" || echo "✅ apps/ui removed"

# T6.2 — No old deps in root lockfile
grep -q 'next-themes' bun.lock && echo "⚠️ next-themes in lockfile" || echo "✅ next-themes purged"
grep -q 'stunk' bun.lock && echo "⚠️ stunk in lockfile" || echo "✅ stunk purged"

# T6.3 — Fresh install + build from clean state
cd /tmp && cp -r "$OLDPWD" /tmp/portfolio-clean-test && \
  cd /tmp/portfolio-clean-test && \
  bun install > /dev/null 2>&1 && \
  bun run build > /dev/null 2>&1 && \
  echo "✅ Clean install + build OK" || echo "❌ Clean install failed"
rm -rf /tmp/portfolio-clean-test

# T6.4 — Final build produces expected output
test -f apps/web/dist/index.html && echo "✅ Final index.html OK" || echo "❌ Missing final index.html"

# T6.5 — No references to old framework
! grep -r 'TanStack\|tanstack\|@tanstack' apps/web/ && echo "✅ No TanStack references" || echo "❌ Old framework references remain"
```

---

## Bonus — Post-Migration Improvements (🟢 P2)

| # | Task | Status | Test / Validation |
|---|---|---|---|
| B.1 | Add responsive nav header with name + theme toggle | `[ ]` | Header visible on all viewports |
| B.2 | Add project category filter buttons (All / Web / Mobile / AI / Backend) | `[ ]` | Filtering works without JS (static anchors + query params) |
| B.3 | Add year-grouped project sections with timeline visual | `[ ]` | Projects grouped under "2025", "2024" headers |
| B.4 | Add "Download Resume" button | `[ ]` | `grep -q 'resume\|cv\|download' apps/web/dist/index.html` |
| B.5 | Add contact form with Supabase submission | `[ ]` | Form submits to Supabase; success toast shown |
| B.6 | Add privacy-friendly analytics (Plausible / Umami) | `[ ]` | Script tag in layout, events fire on interaction |
| B.7 | Add `srcset` / responsive images via Supabase Image Transformations | `[ ]` | Images load correct size per viewport |
| B.8 | Add `astro/transition` view transition for SPA-like navigation | `[ ]` | Page transitions animate smoothly |

### Validation — Bonus Phase

```bash
# TB.1 — Build succeeds with bonus features
bun run --filter web build > /dev/null 2>&1 && echo "✅ Build OK" || echo "❌ Build failed"

# TB.2 — Filter params work
grep -q '?type=' apps/web/dist/index.html && echo "✅ Filter params wired" || echo "⚠️ Filter params not found"

# TB.3 — Analytics script present (if added)
grep -q 'plausible\|umami' apps/web/dist/index.html && echo "✅ Analytics found" || echo "⚠️ No analytics (optional)"
```

---

## Quick Reference — Common Commands

| Action | Command |
|---|---|
| Start dev server | `bun run dev` |
| Build for production | `bun run build` |
| Type-check | `bun run --filter web typecheck` (once tsconfig is set) |
| Run all regression tests | `make test-migration` or copy-paste tests per phase |
| Preview production build | `cd apps/web && bunx astro preview` |
| Check bundle size | `du -sh apps/web/dist/ && du -sh apps/web/dist/_astro/*.js` |
| View dependency tree | `bun run --filter web why <package>` |

---

*Last updated: 2026-06-02*
