# Admin Panel Revamp — Full Scope Prompt

## Context
You are working on a personal portfolio/blog web application with an existing admin panel and client-facing side. The client-side already has an established theme. Your task is to revamp the admin panel end-to-end: schema changes, data migrations, UI redesign, and feature additions.

---

## 1. Schema & Data Changes

### 1.1 — `project_types` View
Create a database view named `project_types_view` (or equivalent for your ORM/DB) that extracts **unique** project type values from all existing projects.
- It must be read-only and derived from the `project_type` field of the projects table.
- Use it as the source of truth wherever a project type selector is needed in the UI.

### 1.2 — New `techstacks` Table
Create a `techstacks` table with the following columns:

| Column        | Type   | Notes                                              |
|---------------|--------|----------------------------------------------------|
| `id`          | string | Slug-style identifier, e.g. `docker`, `postgres`  |
| `name`        | string | Display name, e.g. `Docker`, `PostgreSQL`         |
| `icon`        | string | URL to the icon (currently hardcoded — migrate)   |
| `description` | string | Short description of the technology               |

Migrate all currently hardcoded tech stack references into rows in this table.

### 1.3 — Project ↔ Techstack Relation
Add a join table or array relation linking projects to techstacks:
```
project → techstack_id[]
```
Each project can reference multiple techstack IDs. Update the project model and any related queries accordingly.

### 1.4 — Project Details as Articles
Project details are a variant of articles. Implement this as follows:
- Reuse the article model/schema for project detail content.
- Add a nullable `project_id` foreign key to the articles table (or equivalent relation).
- A project detail is simply an article associated with a project.
- On the public-facing project detail page, render the article body with a structured header section displaying:
  - Project name, description
  - Techstack badges/icons (pulled from the linked techstacks)
  - Any other relevant base project metadata

---

## 2. Admin UI Redesign

### 2.1 — Theme Alignment
Align the admin panel's visual theme (colors, typography, spacing tokens, component styles) with the existing client-side theme. Reuse the same CSS variables or design tokens.

### 2.2 — Layout: Replace Sidebar with Tab Bar
Remove the current sidebar navigation. Replace it with a **top or bottom tab bar** with exactly four tabs:

| Tab         | Content                                                   |
|-------------|-----------------------------------------------------------|
| **Me**      | Profile editor — edit personal info, bio, avatar, etc.   |
| **Projects**| Project management                                        |
| **Articles**| Article management                                        |
| **Settings**| Website configuration options                             |

### 2.3 — Admin Home — Bento Grid Dashboard
Replace the current admin home with a **bento grid layout** showing visitor insights. Use cards, not data tables. Display the following metrics:

- Visitors **today**
- Visitors **this month**
- Visitors **this year**

Each metric should be a standalone card. Fill remaining bento cells with other useful at-a-glance stats (e.g. total projects, total articles, most viewed content).

### 2.4 — Projects & Articles Pages
Both the Projects and Articles management pages must have:
- **Search box** — filters results by title or relevant field
- **Filter controls** — by type, status, date, or other relevant dimensions
- **Action buttons** — primary actions (e.g. New Project, New Article) clearly visible
- **Pagination** — server-side or client-side, clearly navigable
- **Click-to-edit** — clicking any list item immediately opens it in edit/edition mode (no separate "Edit" button required)
- Use **cards** instead of data tables for displaying items

---

## 3. Accessibility & Theming

- Follow **WCAG 2.1 AA** accessibility best practices throughout:
  - Sufficient color contrast ratios
  - Keyboard navigability for all interactive elements
  - ARIA labels where semantic HTML is insufficient
  - Focus-visible styles
  - Screen-reader-friendly markup
- Support both **light mode** and **dark mode** using the existing theme token system (CSS variables or equivalent). All new components must respect both modes without hardcoded colors.

---

## Deliverables Checklist
- [ ] `project_types_view` created
- [ ] `techstacks` table created and populated from hardcoded data
- [ ] Project ↔ techstack relation implemented
- [ ] Project detail page uses article model with project header
- [ ] Admin theme aligned with client-side
- [ ] Sidebar replaced with tab bar (Me / Projects / Articles / Settings)
- [ ] Admin home redesigned as bento grid with visitor insight cards
- [ ] Projects page: search, filters, actions, pagination, click-to-edit, cards
- [ ] Articles page: search, filters, actions, pagination, click-to-edit, cards
- [ ] Light/dark mode support
- [ ] Accessibility best practices applied
```

