## Recommendation for the blog overhaul


## 1. Project Cards Don't Communicate Value at a Glance

**Issue**: A project card shows: a colored rectangle, type badges ("web", "backend"), a title, a date, a 2-line description clamped, and tech icons. The visitor has to:
1. Read the title (what is this?)
2. Hover to read the full description
3. Hover over each tech icon to reveal its name
4. Guess what the project did

This is too many steps to evaluate whether a project is interesting.

**Recommendation**:
- Show the full description (or 3-4 lines) by default — the hover card can show even more detail.
- Always show tech names (not just icons).
- Add a "role" or "what I built" sub-line: e.g., "Built the mobile app & backend API" or "Solo developer — full stack".
- Make the image placeholder show a project image. if unavailable show placeholder.

---


## 2. GitHub Calendar Is the Only Proof of Activity — But It's Misleading

**Issue**: The GitHub contribution calendar shows green squares for commits, but this only proves commit frequency — not code quality, project complexity, or impact. A visitor might think "many commits = good" which is a flawed signal. Conversely, private repo contributions don't show up by default.

**Recommendation**:
- Keep the calendar but complement it with:
  - Total contributions count for the year
- Add a small disclaimer or context: "Public contributions on GitHub. I also contribute to private repositories."

---


## 3. No Perceived Progress or Storytelling

**Issue**: Projects are sorted by date descending — most recent first. This is logical but misses an opportunity to tell a story. The visitor sees the latest project and has no context about growth trajectory, increasing complexity, or expanding skillset over time.

**Recommendation**:
- Add a subtle timeline visual (vertical line with dots) or year headers.
- Group projects by year: "2024", "2023", "2022" with increasing complexity visible.
- Add a brief narrative in the hero: "From building my first Flutter app in 2019 to deploying AI-powered tools in 2025..."


## 4. No Offline / Poor Network Resilience

**Issue**: The entire page depends on:
- Supabase API (for projects)
- GitHub API (for calendar)
- Google Fonts CDN (for Audiowide)
- Supabase Storage (for avatar)

If any of these are slow or unreachable, the page degrades poorly.

**Recommendation**:
- Cache Supabase responses in `localStorage` with a TTL (stale-while-revalidate).
- Show cached projects immediately, then refresh in the background.
- Fallback gracefully if GitHub calendar fails (hide the section, don't show an error).
- Host the avatar locally instead of from Supabase Storage.

---

## 5. No Way to Share or Bookmark Specific Content

**Issue**: The page is a single route (`/`). There's no way to link to a specific project, filter state, or section. A visitor who wants to share "check out Taas's AI projects" cannot.

**Recommendation**:
- Add URL search params for filters: `/?type=ai` → shows only AI projects.
- Add hash links for sections: `/#projects`, `/#contact`.
- Individual project pages/routes: `/projects/1`.

---

## 6. Hover Card on Project Descriptions Is Discoverability Problem

**Issue**: The project description is clamped to 2 lines. To read more, users must hover over it to trigger a `HoverCard`. On first visit, there's no visual indicator that hovering reveals more content — no ellipsis, no "read more" hint, no cursor change.

**Recommendation**:
- Add an ellipsis indicator or a subtle "..." at the end of the clamped text.
- Change the cursor to `cursor-pointer` on the description.
- On mobile, replace the hover card with a "Read more" button that expands the description inline or opens a modal.
- The `HoverCardContent` has `border-none` — add a subtle border or shadow so it's distinguishable from the background.

---