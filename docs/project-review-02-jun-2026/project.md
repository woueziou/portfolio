# Project Overview — Taas S. Ekpaye Portfolio

## Context

This is the personal developer portfolio of **Taas S. Ekpaye**, a software developer with ~6+ years of experience (since 2019). The portfolio serves as a single landing page showcasing his identity, contact channels, GitHub activity, and an auto-generated list of projects fetched from Supabase.

The project is a **Bun-powered monorepo** that was recently migrated from Next.js (App Router) to **TanStack Start** (Vite-based), with Tailwind CSS v4, shadcn/ui (Radix Nova style), and Supabase as the backend/database.

## The Problem It Solves

1. **Developer Visibility**: Creates a polished, single-page web presence that a recruiter or collaborator can visit to quickly assess skills, experience timeline, and project history.

2. **Dynamic Portfolio Management**: Instead of hardcoding projects in source code, they live in a Supabase database — so adding, editing, or removing projects does not require a code deploy.

3. **GitHub Activity Proof**: The embedded GitHub contribution calendar provides live, verifiable proof of coding consistency without manual screenshots.

4. **Contact Aggregation**: All relevant contact channels (GitHub, LinkedIn, Medium, Email) are visible as tappable links in one place.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun (package manager + runner) |
| Framework | TanStack Start (Vite + React 19 + file-based routing) |
| Styling | Tailwind CSS v4 + tw-animate-css + shadcn/ui (Radix Nova) |
| Backend / DB | Supabase (PostgreSQL) |
| State | stunk (atomic state management) |
| Animations | Framer Motion |
| Fonts | Baufra (custom), Audiowide (Google Fonts), Geist Variable |
| Icons | Lucide React + @icons-pack/react-simple-icons |

## Architecture

```
portfolio/
├── apps/
│   ├── ui/                  # TanStack Start frontend (port 3000)
│   │   ├── src/routes/      # File-based routes (index, __root)
│   │   ├── src/components/  # home/hero, home/projects, home/footer, ui/*
│   │   ├── src/providers/   # ThemeProvider (next-themes wrapper)
│   │   ├── src/stores/      # auth.store (stunk atoms)
│   │   └── src/utils/       # formater (date), supabase client
│   └── supabase/            # Local supabase config + migrations
├── packages/
│   └── shared/              # Supabase client + generated DB types
└── web/                     # (legacy) Old Next.js app — kept for reference
```

### Data Flow

1. **Route Loader** (`routes/index.tsx`) calls `supabase.from('projects').select().order('project_date', { ascending: false })` at request time
2. Data is passed to `ProjectClient` → maps over rows → renders `ProjectItem` components
3. Each `ProjectItem` displays: title (with optional external link), type badges, tech stack icons (hover reveals label), description (with `HoverCard`), and date
4. Auth state (`initAuth()`) is initialized in `__root.tsx` on mount, syncing session/user to `stunk` atoms

### Database Schema (`public.projects`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint (auto) | Primary key |
| `title` | text | Project title |
| `description` | text | Full description (shown in hover card) |
| `main_image_url` | text? | Not yet rendered in UI |
| `url` | text? | External link (shows ExternalLink icon if present) |
| `state` | project_status enum | `ongoing` / `finished` / `production` |
| `type` | project_type[] | Array of `web` / `mobile` / `script` / `backend` / `infra` / `llm` / `ai` |
| `tech_stack` | text[] | Array of technology names (mapped to icons) |
| `project_date` | timestamptz | Sorted descending |
| `user_id` | uuid | Owner FK to `auth.users` |

## Examples of Similar Projects That Have Succeeded

| Project | What they do well |
|---------|-------------------|
| **[brittanychiang.com](https://brittanychiang.com)** | Clean, single-page dev portfolio with hero, projects, contact. Built with Next.js + styled-components. Became a widely-cloned open-source template (4k+ stars). |
| **[joshwcomeau.com](https://joshwcomeau.com)** | Highly polished personal site with interactive animations, blog, and project showcase. Proves a dev portfolio can double as a personal brand engine. |
| **[leerob.io](https://leerob.io)** | Lee Robinson (Vercel VP) — minimalist Next.js portfolio showing projects, blog, and stats. Demonstrates that simplicity + fast loading wins. |
| **[bento.me](https://bento.me)** | "Link in bio" style portfolios that aggregate links, projects, and socials — validating the demand for single-page developer identity hubs. |
| **[github.com/ashutosh1919/masterPortfolio](https://github.com/ashutosh1919/masterPortfolio)** | Open-source developer portfolio React template (2k+ stars). Proves there's huge demand for plug-and-play dev portfolios with project sections, GitHub stats, and contact forms. |

> **Key takeaway**: Successful developer portfolios share these traits — they load fast, show real projects (not lorem ipsum), prove credibility (GitHub stats, live demos), and make contacting the developer frictionless. This portfolio already checks most of these boxes; the remaining work is polish, content, and discoverability.

## Key Design Decisions

1. **Migration from Next.js → TanStack Start**: Chosen for better Vite integration, simpler deployment (static SPA), and first-class TypeScript support without the Next.js server overhead.

2. **Supabase as headless CMS**: The `projects` table acts as a CMS. No need for Strapi/Payload/Contentful — just rows in a database. The `tech_stack` array maps to a hardcoded `getIcon()` switch statement.

3. **Custom fonts**: Baufra (sans-serif body) + Audiowide (display/heading) give the portfolio a distinctive, non-generic typographic identity.

4. **Monorepo structure**: Shared types between frontend and potential future apps (admin panel, API) through `packages/shared`.

## Current Status

The portfolio is functional and deployed. It renders a hero section and a Supabase-fed project grid. The migration from Next.js to TanStack Start is complete. Remaining work is primarily polish, content completeness, and UX improvements (see feature-critics.md, ui-critics.md, ux-critics.md).
