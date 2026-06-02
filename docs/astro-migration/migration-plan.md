# Technical Migration Report — TanStack Router SPA → Astro SSG

**Project**: Taas S. Ekpaye Portfolio  
**Date**: 2026-06-02  
**Status**: Planning  
**Author**: AI-assisted architecture review  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Audit](#2-current-state-audit)
   - 2.1 [Stack Correction](#21-stack-correction)
   - 2.2 [Project Health](#22-project-health)
   - 2.3 [What Currently Works](#23-what-currently-works)
   - 2.4 [Known Issues & Dead Code](#24-known-issues--dead-code)
3. [Why Migrate to Astro](#3-why-migrate-to-astro)
4. [Architecture Decision — SSG vs SSR](#4-architecture-decision--ssg-vs-ssr)
5. [Component Migration Map](#5-component-migration-map)
6. [Target File Structure](#6-target-file-structure)
7. [Dependency Changes](#7-dependency-changes)
8. [Environment Variables](#8-environment-variables)
9. [Step-by-Step Migration Plan](#9-step-by-step-migration-plan)
10. [Vercel Deployment](#10-vercel-deployment)
11. [Risks & Mitigations](#11-risks--mitigations)
12. [Effort Estimate](#12-effort-estimate)

---

## 1. Executive Summary

The portfolio is currently a **client-side SPA** built with TanStack Router + Vite. While functional, this architecture has three critical weaknesses for a developer portfolio:

- **Zero SEO** — the page renders blank HTML to crawlers; no `<title>`, no Open Graph, no structured data.
- **Client-side data fetching** — projects are fetched from Supabase after the page loads, causing a visible skeleton flash on every visit.
- **Unnecessary JS weight** — the full React bundle ships for content that is almost entirely static (a name, a bio, contact links, and a list of projects).

**Astro** solves all three by design: it outputs static HTML at build time, has first-class `<head>` management, and only ships JavaScript for components that explicitly need it (the Islands architecture).

The migration is **low-risk and medium effort**. The codebase is small (8 components, 2 routes), the shared Supabase package is framework-agnostic and transfers unchanged, and the Vercel project is already configured — only the build output needs updating.

**Expected outcome after migration:**

| Metric | Before (SPA) | After (Astro SSG) |
|---|---|---|
| SEO | ❌ None | ✅ Full meta, OG, JSON-LD |
| JS sent to browser | ~300 KB+ (full React bundle) | ~40–80 KB (only islands) |
| Projects visible on first paint | ❌ Skeleton flash | ✅ Rendered in HTML |
| Lighthouse Performance | ~60–70 | ~90–100 |
| Vercel deployment type | Static SPA | Static CDN (no adapter needed) |

---

## 2. Current State Audit

### 2.1 Stack Correction

> ⚠️ **The `docs/project.md` incorrectly states the framework is "TanStack Start".** An inspection of `apps/ui/package.json` shows the actual dependencies are `@tanstack/react-router` + `vite` + `@vitejs/plugin-react`. This is **TanStack Router running in SPA mode** — not TanStack Start, which requires `@tanstack/start` and provides SSR/SSG capabilities. This distinction is important: the current app has **no server-side rendering**, no streaming, and no build-time data fetching.

**Actual current stack:**

| Layer | Technology | Version |
|---|---|---|
| Package manager / runtime | Bun | workspace monorepo |
| Framework | TanStack Router (SPA) | latest |
| Build tool | Vite | ^8.0.0 |
| UI library | React | ^19.2.0 |
| Styling | Tailwind CSS v4 + tw-animate-css | ^4.1.18 |
| Component library | shadcn/ui (Radix Nova) | ^1.4.3 |
| Backend / Database | Supabase (PostgreSQL) | latest |
| State management | stunk | ^3.0.0-rc.3 |
| Animations | Framer Motion | ^12.3.1 |
| Fonts | Baufra (local), Audiowide (Google Fonts), Geist Variable | — |
| Icons | Lucide React + @icons-pack/react-simple-icons | — |
| Theme | next-themes | ^0.4.4 |
| Deployment | Vercel | project ID: `prj_HlE99EykiJxInq0L8qBFAsATg3UN` |

**Monorepo layout:**

```
portfolio/
├── apps/
│   ├── ui/          # TanStack Router SPA (port 3000)
│   └── supabase/    # Local Supabase config + migrations
└── packages/
    └── shared/      # Supabase client + generated DB types (@repo/shared)
```

### 2.2 Project Health

| Dimension | Score | Verdict |
|---|---|---|
| Visual hierarchy | 40/100 | Typography jumps, inconsistent sizing |
| SEO / Discoverability | 10/100 | No meta tags at all |
| Component consistency | 35/100 | shadcn Card unused, manual divs everywhere |
| Responsiveness | 40/100 | Missing `sm:grid-cols-2`, broken avatar sizing |
| Accessibility | 25/100 | No focus states, hover-only patterns on mobile |
| Code quality | 50/100 | Dead code, `@ts-expect-error`, fragile switch, no tests |

### 2.3 What Currently Works

- ✅ Hero section renders (avatar, name, contact links, GitHub calendar)
- ✅ Projects are fetched from Supabase and rendered in a grid
- ✅ Dark/light mode via `next-themes` (ThemeProvider is wired)
- ✅ Monorepo structure with shared Supabase types
- ✅ Vercel deployment is live and linked

### 2.4 Known Issues & Dead Code

The following will be **dropped or fixed** during the migration:

| Item | Location | Action |
|---|---|---|
| `BackgroundBeams` component | `components/ui/background-beams.tsx` | Remove (never imported anywhere) |
| `auth.store.ts` + `initAuth()` | `stores/auth.store.ts`, `__root.tsx` | Remove (public portfolio needs no auth) |
| `next-themes` | `providers/theme.tsx` | Replace with a lightweight vanilla JS script |
| `stunk` state atoms | `stores/auth.store.ts` | Remove along with auth store |
| `@ts-expect-error` on calendar | `components/home/hero/hero.tsx` | Fix with a proper type declaration |
| `linkClass` duplication | `hero.tsx` (email link) | Deduplicate during port |
| `w-15 h-15` (invalid Tailwind) | `hero.tsx` | Fix to `w-16 h-16` |
| `getIcon()` switch statement | `project-item.tsx` | Refactor to a `Record<string, Component>` map |
| `main_image_url` never rendered | `project-item.tsx` | Wire up during migration |
| Footer still says "TanStack Start" | `footer.tsx` | Update copy to "Astro" |

---

## 3. Why Migrate to Astro

### The Core Problem with a React SPA for a Portfolio

A React SPA sends a mostly-empty HTML document to the browser. The browser then downloads the JavaScript bundle, parses it, executes it, and only then fetches data from Supabase — after which the content is finally rendered. For a **public, mostly-static portfolio**, this is the worst possible architecture:

1. Search engine crawlers see blank content → **no indexing**.
2. Visitors see a skeleton/flash before content appears → **poor first impression**.
3. 300 KB+ of JS is downloaded to display a name, a bio, and a list of projects → **wasteful**.

### Why Astro Specifically

Astro was designed for **content-heavy sites** (portfolios, docs, blogs, marketing pages). Its key properties align exactly with what this portfolio needs:

**1. Build-time data fetching (SSG)**  
Astro's frontmatter in `.astro` files runs at build time. The Supabase query runs once during `astro build`, and the result is baked into static HTML. No client-side fetching, no skeleton, no flash.

```astro
---
// Runs at BUILD TIME — result is static HTML
import { supabase } from '@repo/shared'
const { data: projects } = await supabase.from('projects').select().order('project_date', { ascending: false })
---
<ul>
  {projects.map(p => <ProjectCard project={p} />)}
</ul>
```

**2. Islands Architecture**  
Only components that need interactivity ship JavaScript. Everything else is zero-JS HTML. For this portfolio, only two components need React:

- `ThemeSwitcher` — needs `localStorage` + DOM class toggling
- `GitHubCalendar` — third-party React component with its own state

Everything else (hero, project cards, footer, layout) becomes pure `.astro` — zero JS.

**3. Native `<head>` management**  
No need for TanStack Router's `head` API or a third-party Helmet library. Every `.astro` page has a standard `<head>` slot. SEO meta, Open Graph, `<link rel="preload">`, and JSON-LD structured data are first-class.

**4. Tailwind v4 compatibility**  
Astro's official `@astrojs/tailwind` integration supports Tailwind v4 with the CSS-first config approach already in use in this project.

**5. Framework-agnostic islands**  
Astro can render React, Svelte, Vue, and Solid islands in the same project. If a component is later replaced with something lighter, no full rewrite is needed.

---

## 4. Architecture Decision — SSG vs SSR

| | SSG (Static) | SSR (Serverless/Edge) |
|---|---|---|
| **How** | Fetch Supabase at `astro build`, output static HTML | `@astrojs/vercel` adapter, fetch per request |
| **Data freshness** | Fresh on every deploy | Fresh on every request |
| **Performance** | Fastest — served from CDN edge | Adds cold start / function latency |
| **Complexity** | None — no adapter needed | Requires Vercel adapter + serverless functions |
| **Cost** | Free on Vercel Hobby | Free on Vercel Hobby (within limits) |
| **Fits this project?** | ✅ Yes — projects change rarely | ⚠️ Overkill for a static portfolio |

**Decision: SSG.**

Projects are added or edited infrequently (a few times per year). There is no need for per-request freshness. A re-deploy is the correct trigger for new content — it also invalidates Vercel's CDN cache automatically.

SSR can be introduced later if a **contact form with server-side processing**, **auth-gated admin panel**, or **per-request personalization** is added. The migration path from SSG → SSR in Astro is a one-line config change + adding the adapter.

---

## 5. Component Migration Map

### Routes / Pages

| TanStack Router | Astro | Notes |
|---|---|---|
| `routes/__root.tsx` | `layouts/BaseLayout.astro` | Global HTML shell, `<head>`, theme script, footer |
| `routes/index.tsx` | `pages/index.astro` | Supabase fetch moves to frontmatter (build-time) |

### Components

| Current | Target | Hydration | Reason |
|---|---|---|---|
| `components/home/hero/hero.tsx` | `components/Hero.astro` | None | Fully static — avatar, name, bio, contact links |
| `components/home/projects/project-client.tsx` | Inline in `pages/index.astro` | None | Just a `map()` over static data |
| `components/home/projects/project-item.tsx` | `components/ProjectCard.astro` | None | Static card — no interactivity |
| `components/home/footer/footer.tsx` | `components/Footer.astro` | None | Two lines of static text |
| `components/theme-switcher.tsx` | `components/ThemeSwitcher.tsx` | `client:load` | Needs `localStorage` + DOM access |
| `GitHubCalendar` (inside hero) | `components/GitHubCalendar.tsx` | `client:visible` | Third-party React component, lazy-loaded when scrolled into view |
| `components/ui/hover-card.tsx` | `components/ui/HoverCard.tsx` | `client:idle` | Radix UI requires React |
| `components/ui/button.tsx` | `components/ui/button.tsx` | Keep as-is | Used only in React islands |
| `components/ui/card.tsx` | `components/ui/card.tsx` | Keep as-is | Used only in React islands |
| `components/ui/skeleton.tsx` | **Drop** | — | Not needed — data is static at build time |
| `components/ui/background-beams.tsx` | **Drop** | — | Never used |

### Providers & Stores

| Current | Target | Notes |
|---|---|---|
| `providers/theme.tsx` (next-themes) | Inline `<script>` in `BaseLayout.astro` | 10-line vanilla JS: reads `localStorage`, applies class to `<html>` |
| `stores/auth.store.ts` (stunk) | **Drop entirely** | Public portfolio — no auth needed |

### Shared Package

| Current | Target | Notes |
|---|---|---|
| `packages/shared/src/supabase.ts` | Keep, minor env var rename | `import.meta.env.VITE_*` → `import.meta.env.*` (Astro uses `PUBLIC_` prefix for client-side) |
| `packages/shared/src/supabase.types.ts` | Keep unchanged | Framework-agnostic TypeScript types |
| `packages/shared/src/index.ts` | Keep unchanged | Re-exports supabase client + types |

---

## 6. Target File Structure

```
portfolio/
├── apps/
│   ├── web/                              ← NEW: Astro app (replaces apps/ui)
│   │   ├── src/
│   │   │   ├── layouts/
│   │   │   │   └── BaseLayout.astro     ← global shell: <html>, <head>, SEO, theme script
│   │   │   ├── pages/
│   │   │   │   ├── index.astro          ← home page: Supabase fetch + Hero + Projects
│   │   │   │   └── 404.astro            ← not found page
│   │   │   ├── components/
│   │   │   │   ├── Hero.astro           ← static hero section
│   │   │   │   ├── ProjectCard.astro    ← static project card
│   │   │   │   ├── Footer.astro         ← static footer
│   │   │   │   ├── ThemeSwitcher.tsx    ← React island (client:load)
│   │   │   │   ├── GitHubCalendar.tsx   ← React island (client:visible)
│   │   │   │   └── ui/
│   │   │   │       ├── HoverCard.tsx    ← React island (client:idle)
│   │   │   │       ├── button.tsx       ← shadcn button (React)
│   │   │   │       └── card.tsx         ← shadcn card (React)
│   │   │   ├── styles/
│   │   │   │   └── global.css           ← Tailwind v4 @import + font declarations
│   │   │   └── env.d.ts                 ← /// <reference types="astro/client" />
│   │   ├── public/
│   │   │   └── noise-bg.png             ← copied from apps/ui/public
│   │   ├── astro.config.mjs
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── supabase/                        ← unchanged
└── packages/
    └── shared/                          ← unchanged
```

> **`apps/ui` is kept until the migration is fully verified and deployed.** It is deleted in the final cleanup step.

---

## 7. Dependency Changes

### Add to `apps/web`

| Package | Purpose |
|---|---|
| `astro` | Core framework |
| `@astrojs/react` | React islands integration |
| `@astrojs/tailwind` | Tailwind CSS v4 integration |
| `@astrojs/sitemap` | Auto-generate `sitemap.xml` for SEO |
| `react` + `react-dom` | Required for React islands |

### Keep (port from `apps/ui`)

| Package | Notes |
|---|---|
| `tailwindcss` v4 | Config is CSS-first — transfers directly |
| `@repo/shared` | Supabase client + types — unchanged |
| `@supabase/supabase-js` | Used inside `@repo/shared` |
| `lucide-react` | Used in React islands |
| `@icons-pack/react-simple-icons` | Used in React islands |
| `react-github-calendar` | React island |
| `class-variance-authority` + `clsx` + `tailwind-merge` | Utility libs — unchanged |
| `radix-ui` | Used by shadcn components in React islands |
| `dayjs` | Date formatting |
| `@fontsource-variable/geist` | Font — import in `global.css` |
| `tw-animate-css` | Animations — import in `global.css` |

### Drop

| Package | Reason |
|---|---|
| `@tanstack/react-router` | Replaced by Astro file-based routing |
| `@tanstack/router-plugin` | Vite plugin — no longer needed |
| `@tanstack/react-devtools` | No longer relevant |
| `@tanstack/react-router-devtools` | No longer relevant |
| `vite` + `@vitejs/plugin-react` | Replaced by Astro's build pipeline |
| `next-themes` | Replaced by inline vanilla JS theme script |
| `stunk` | Auth store dropped; no other state needed |
| `framer-motion` | Currently unused — drop unless animations are added |
| `shadcn` (CLI package) | Dev tool only — not needed at runtime |

---

## 8. Environment Variables

The Supabase client in `packages/shared` currently uses Vite-style env vars (`import.meta.env.VITE_*`). Astro uses a different convention:

| Current (Vite) | Astro convention | Where used |
|---|---|---|
| `VITE_SUPABASE_URL` | `SUPABASE_URL` | Server-only (build-time frontmatter only) |
| `VITE_SUPABASE_ANON_KEY` | `SUPABASE_ANON_KEY` | Server-only (build-time frontmatter only) |

Since the Supabase client is used exclusively in Astro's build-time frontmatter (SSG), the keys never need to reach the browser. They do **not** need the `PUBLIC_` prefix.

**Required changes:**

1. Rename vars in `.env.local`:
   ```
   SUPABASE_URL=https://kfbzgkjffmfzjzbxoqvr.supabase.co
   SUPABASE_ANON_KEY=...
   ```

2. Update `packages/shared/src/supabase.ts`:
   ```ts
   // Before
   export const supabase = createClient(
     import.meta.env.VITE_SUPABASE_URL,
     import.meta.env.VITE_SUPABASE_ANON_KEY,
   )

   // After
   export const supabase = createClient(
     import.meta.env.SUPABASE_URL,
     import.meta.env.SUPABASE_ANON_KEY,
   )
   ```

3. Add the same vars to the **Vercel project dashboard** (Settings → Environment Variables), replacing the old `VITE_*` names.

---

## 9. Step-by-Step Migration Plan

Each step maps to one focused branch/PR.

---

### Step 1 — Scaffold Astro App

**Branch**: `feat/astro-scaffold`

```bash
cd apps
bunx create-astro@latest web --template minimal --typescript strict --no-git
```

Then configure `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://taas-s-ekpaye.vercel.app',
  output: 'static',
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    sitemap(),
  ],
})
```

Update root `package.json`:

```json
{
  "scripts": {
    "dev":   "bun run --filter web dev",
    "build": "bun run --filter web build"
  }
}
```

**Verification**: `bun dev` starts Astro on port 4321. Default welcome page loads.

---

### Step 2 — Port Global Styles & Fonts

**Branch**: `feat/astro-styles`

Copy `apps/ui/src/index.css` → `apps/web/src/styles/global.css`. Remove Vite-specific syntax if any. Ensure Tailwind v4 `@import "tailwindcss"` is at the top.

Add font imports:

```css
/* global.css */
@import "tailwindcss";
@import "@fontsource-variable/geist";
@import "tw-animate-css";

/* Baufra custom font */
@font-face {
  font-family: 'Baufra';
  src: url('/fonts/baufra.woff2') format('woff2');
  font-display: swap;
}

/* Audiowide — moved from Google Fonts CDN to @font-face or keep CDN with display=swap */
```

**Verification**: Tailwind utility classes apply correctly. Fonts load without CLS.

---

### Step 3 — Base Layout & Theme Script

**Branch**: `feat/astro-layout`

Create `src/layouts/BaseLayout.astro` with:

- Proper `<html lang="en">` with theme class binding
- `<head>`: charset, viewport, favicon, canonical, OG tags (accept as props), font preloads
- Inline `<script>` for theme initialization (replaces `next-themes`)
- `<slot />` for page content

**Theme script** (replaces the entire `next-themes` dependency):

```html
<script is:inline>
  const theme = localStorage.getItem('theme') ??
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', theme === 'dark')
</script>
```

This runs before the first paint — no flash of wrong theme.

**Verification**: Page renders in correct theme on load. No FOUC.

---

### Step 4 — Port Supabase Data Fetching

**Branch**: `feat/astro-data`

Create `src/pages/index.astro` with build-time data fetching:

```astro
---
import { supabase } from '@repo/shared'
import BaseLayout from '../layouts/BaseLayout.astro'

const { data: projects, error } = await supabase
  .from('projects')
  .select()
  .order('project_date', { ascending: false })

if (error) throw new Error(`Failed to fetch projects: ${error.message}`)
---

<BaseLayout title="Taas S. Ekpaye — Software Developer">
  <!-- sections go here -->
</BaseLayout>
```

Update `packages/shared/src/supabase.ts` to use `import.meta.env.SUPABASE_URL`.  
Update `.env.local` to rename `VITE_*` → `SUPABASE_*`.

**Verification**: `astro build` completes. `dist/index.html` contains the fetched project titles as static text (inspect with `grep "project-title" dist/index.html`).

---

### Step 5 — Port Static Components

**Branch**: `feat/astro-components`

Port each static component as an `.astro` file:

**`Hero.astro`** — remove React hooks, replace `useEffect`/state with static markup. Contact links become plain `<a>` tags. The `getYearsSince2019()` calculation moves to frontmatter.

**`ProjectCard.astro`** — accepts a `project` prop typed against `Database["public"]["Tables"]["projects"]["Row"]`. The `getIcon()` switch is refactored into a `TECH_ICONS` record. The `main_image_url` is finally wired to an `<img>` tag with `loading="lazy"`.

**`Footer.astro`** — update copy from "Made with TanStack Start" → "Made with Astro".

**Verification**: `bun dev` — hero renders, project cards render with real data, footer is correct.

---

### Step 6 — Port React Islands

**Branch**: `feat/astro-islands`

**`ThemeSwitcher.tsx`** — keep as a React component. Remove `next-themes` imports. Read/write `localStorage` and toggle `document.documentElement.classList` directly. Mount in `BaseLayout.astro` with `client:load`.

**`GitHubCalendar.tsx`** — wrap `react-github-calendar` in a thin React component. Fix the `@ts-expect-error` by adding `src/types/react-github-calendar.d.ts`. Mount in `Hero.astro` with `client:visible` (only loads when scrolled into view — saves ~30 KB on initial load).

**`HoverCard.tsx`** — keep Radix UI `HoverCard` as a React island. Mount in `ProjectCard.astro` wrapping the description with `client:idle`.

**Verification**: Theme toggle works. GitHub calendar loads on scroll. Hover card triggers on desktop.

---

### Step 7 — SEO & Meta Tags

**Branch**: `feat/astro-seo`

Add to `BaseLayout.astro`:

```astro
---
interface Props {
  title: string
  description?: string
  ogImage?: string
}
const {
  title,
  description = 'Software Developer — 6+ years building full-stack web & mobile applications.',
  ogImage = '/og-default.png'
} = Astro.props
---
<head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="sitemap" href="/sitemap-index.xml" />

  <!-- JSON-LD Person schema -->
  <script type="application/ld+json" set:html={JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Taas S. Ekpaye",
    "url": "https://taas-s-ekpaye.vercel.app",
    "sameAs": [
      "https://github.com/woueziou",
      "https://www.linkedin.com/in/taas-ekpaye/",
      "https://medium.com/@taasekpaye"
    ],
    "jobTitle": "Software Developer"
  })} />
</head>
```

**Verification**: `astro build` → inspect `dist/index.html` for all meta tags. Paste URL into [opengraph.xyz](https://opengraph.xyz) to preview OG card.

---

### Step 8 — Cleanup

**Branch**: `chore/remove-tanstack-app`

- Delete `apps/ui/`
- Remove `@tanstack/*`, `next-themes`, `stunk`, `framer-motion`, `vite`, `@vitejs/plugin-react` from the workspace
- Update root `README.md` to reflect new stack
- Update `docs/project.md` to correct the stack description

**Verification**: `bun install` succeeds. `bun build` produces a clean `dist/`. No references to old packages remain (`grep -r "tanstack" apps/web/src` returns nothing).

---

## 10. Vercel Deployment

### Current Configuration

```json
// .vercel/project.json
{
  "projectId": "prj_HlE99EykiJxInq0L8qBFAsATg3UN",
  "orgId":     "team_xwviLDN8Wf6a3o9i81CBvIEA",
  "projectName": "taas-s-ekpaye"
}
```

The `.vercel` directory is already present — the project is linked. No re-linking is needed.

### No Adapter Required (SSG)

Since `output: 'static'` is used in `astro.config.mjs`, Astro emits a self-contained `dist/` folder of HTML, CSS, and JS files. Vercel serves this as a static site with no serverless functions needed. **No `@astrojs/vercel` adapter is required.**

### Vercel Dashboard Settings

Update the following in the Vercel project settings:

| Setting | Old value | New value |
|---|---|---|
| Framework Preset | Vite (or Other) | **Astro** (auto-detected) |
| Root Directory | `.` | `.` (unchanged — monorepo root) |
| Build Command | `bun run build` | `bun run build` (unchanged) |
| Output Directory | `apps/ui/dist` | **`apps/web/dist`** |
| Install Command | `bun install` | `bun install` (unchanged) |

### Environment Variables

Remove old Vite-prefixed variables and add the renamed ones:

| Remove | Add |
|---|---|
| `VITE_SUPABASE_URL` | `SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | `SUPABASE_ANON_KEY` |

Apply to: **Production**, **Preview**, and **Development** environments.

### Deploy Preview Flow

```
push to feature branch
  → Vercel Preview deployment (apps/web/dist served at preview URL)
  → verify build log: Supabase fetch runs, all projects appear in HTML source
  → merge PR to main
  → Vercel Production deployment (CDN cache invalidated globally)
```

### SSG → SSR Upgrade Path (future)

If server-side features are needed later (contact form, auth-gated admin):

```js
// astro.config.mjs — one-line change
import vercel from '@astrojs/vercel/serverless'

export default defineConfig({
  output: 'server',       // was 'static'
  adapter: vercel(),      // add this
  integrations: [react(), tailwind(), sitemap()],
})
```

Then add `@astrojs/vercel` to `apps/web/package.json`. No other changes needed — Astro handles the rest.

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `packages/shared` env var mismatch breaks build-time Supabase fetch | Medium | High | Step 4 explicitly addresses the rename; verify with `grep VITE_ packages/` before closing the PR |
| `react-github-calendar` types still broken after adding declaration file | Low | Low | Worst case: keep `@ts-expect-error` with a comment; doesn't affect runtime |
| Tailwind v4 CSS-first config incompatible with `@astrojs/tailwind` | Low | Medium | `@astrojs/tailwind` supports v4 as of Astro 4.x; verify version compatibility on scaffold |
| Radix UI `HoverCard` hydration mismatch (server HTML vs client) | Low | Low | Use `client:only="react"` directive if mismatch occurs — skips SSR for that island |
| Vercel output directory misconfigured → 404 on deploy | Low | High | Explicitly set output dir to `apps/web/dist` in Vercel dashboard before first deploy |
| `apps/ui` deleted before `apps/web` is fully verified | Low | High | Keep both apps until production deploy is confirmed healthy (Step 8 is last) |
| Bun workspace resolution differs between Vite and Astro | Low | Medium | Test `@repo/shared` import in Astro context early (Step 4) to surface issues before they compound |

---

## 12. Effort Estimate

| Step | Branch | Estimated Time |
|---|---|---|
| 1 — Scaffold Astro App | `feat/astro-scaffold` | 30 min |
| 2 — Port Global Styles & Fonts | `feat/astro-styles` | 45 min |
| 3 — Base Layout & Theme Script | `feat/astro-layout` | 1 h |
| 4 — Port Supabase Data Fetching | `feat/astro-data` | 45 min |
| 5 — Port Static Components | `feat/astro-components` | 2 h |
| 6 — Port React Islands | `feat/astro-islands` | 1.5 h |
| 7 — SEO & Meta Tags | `feat/astro-seo` | 45 min |
| 8 — Cleanup | `chore/remove-tanstack-app` | 30 min |
| **Total** | | **~8 hours** |

Work can be done in two focused sessions:
- **Session A (4 h)**: Steps 1–5 — scaffolding, styles, layout, data, static components
- **Session B (4 h)**: Steps 6–8 — React islands, SEO, cleanup, Vercel config update

---

*End of report.*
