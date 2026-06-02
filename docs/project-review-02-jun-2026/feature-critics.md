# Feature Critics & Recommendations

This document is a critical audit of the current features, listing what is missing, broken, or improvable, with concrete recommendations.

---

## 1. Project Images Are Stored But Never Rendered

**Issue**: The `projects` table has a `main_image_url` column, and the `ProjectItem` component allocates a 350px-tall placeholder div (`<div className="h-[350px] w-full bg-primary"></div>`), but the image URL is never passed to an `<img>` tag. Every project card shows a solid color block.

**Recommendation**:
- If `item.main_image_url` exists, render the `<Image>` component (the custom one or a regular `<img>`) with `objectFit: 'cover'` inside that div.
- If no image is available, keep a fallback (gradient placeholder or pattern).
- Consider using Supabase Storage public URLs or a transformation URL (e.g., Supabase Image Transformations via `?width=600`).

---

## 2. Project Status (`state`) Is Never Displayed

**Issue**: The `state` column (`ongoing` / `finished` / `production`) exists in the DB and is fetched by the loader, but the UI never renders it. Users cannot distinguish active projects from completed ones.

**Recommendation**:
- Add a small status badge (e.g., 🟢 Ongoing / ✅ Finished / 🚀 Production) near the project title or in the type badges row.
- Style it with subtle background colors matching each status.

---

## 3. No Project Detail / Individual Page

**Issue**: Projects are listed as cards in a grid with only a title, truncated description (2-line clamp), and hover card. There's no way to see full details, screenshots, tech stack explanations, or a "read more" deep dive.

**Recommendation**:
- Add a `/projects/$projectId` route (or a modal/dialog) with:
  - Full description
  - Multiple images (if `main_image_url` expands to an array later)
  - Full tech stack with explanations
  - Link to live demo / GitHub repo
  - Date, status, related projects
- Even a simple expandable drawer using shadcn's Sheet or Dialog would be a vast improvement.

---

## 4. No Filtering / Categorization of Projects

**Issue**: All projects are rendered in one flat grid. If a user wants to see only "mobile" or "ai" projects, there's no way to filter.

**Recommendation**:
- Add category filter buttons above the grid (e.g., "All", "Web", "Mobile", "AI", "Backend", "Infra").
- Filter client-side based on `item.type` array.
- Use URL search params (`?type=mobile`) for shareable filtered views.

---

## 5. GitHub Calendar Has No Configurable Year Range

**Issue**: The `GitHubCalendar` component from `react-github-calendar` is rendered with only `username="woueziou"` and `showColorLegend={false}`. It defaults to showing the last year. There's no way to view older contributions or customize the look.

**Recommendation**:
- Add the `year` prop (e.g., `year="last"` or a year selector).
- Consider adding `blockMargin`, `blockSize`, `colorScheme` to match the site's color palette.
- Hide the calendar on mobile if it's too cramped (or use `responsive` mode).

---

## 6. No SEO / Meta Tags

**Issue**: There are no `<title>`, `<meta name="description">`, Open Graph tags, or structured data (`JSON-LD`). The page is invisible to search engines and has no preview card when shared on social media.

**Recommendation**:
- Add a `<Head>` or `<Meta>` component in `__root.tsx` (TanStack Start supports `createRootRoute` with `head`).
- Minimum tags: `title`, `description`, `og:title`, `og:description`, `og:image`, `twitter:card`.
- Add `JSON-LD` structured data for a `Person` schema.

---

## 7. No Error Boundary / Graceful Error Handling

**Issue**: If the Supabase fetch fails, `throw new Error(...)` in the route loader will crash the page with an unhandled error. No fallback UI is shown.

**Recommendation**:
- Add an `errorComponent` to the route (TanStack Router supports `errorComponent` in `createFileRoute`).
- Show a user-friendly message: "Could not load projects. Please try again later."
- Optionally add a retry button.

---

## 8. No Loading State Beyond Skeleton

**Issue**: The page uses `<Suspense fallback={<ProjectItemSkeleton />}>`, which shows skeleton cards. This is good, but there's no loading state for the hero section (avatar image, GitHub calendar). The avatar could flash or load slowly.

**Recommendation**:
- Add a blur-up placeholder or skeleton for the avatar image.
- Add a skeleton or spinner for the GitHub calendar while it loads.

---

## 9. Theme Switcher Is Imported But Never Used in the Layout

**Issue**: The `ThemeModeToggle` component exists (`components/theme-switcher.tsx`) but is never rendered in `__root.tsx` or any route. Users have no way to change the theme from the default.

**Recommendation**:
- Add `<ThemeModeToggle />` to the `__root.tsx` layout, ideally in a fixed position (top-right corner) or in the footer.
- The `ThemeProvider` is already configured — the toggle just needs to be placed.

---

## 10. No Responsive Navigation / Header

**Issue**: There is no nav bar, no header, no menu. The page starts directly with the hero section. While acceptable for a single-page portfolio, it feels incomplete.

**Recommendation**:
- Add a minimal sticky header with:
  - Name/logo (left)
  - Theme toggle (right)
  - Optional: smooth-scroll anchor links to sections (if page gets sections)

---

## 11. Footer Is Minimal and Unbalanced

**Issue**: The footer has a `md:col-start-2` grid layout that pushes content to the center column, but it only contains two text lines. It looks sparse and provides no value.

**Recommendation**:
- Add useful links: GitHub, LinkedIn, Email.
- Add a "Back to top" button.
- Add copyright year dynamically (`© {new Date().getFullYear()}`).
- Consider adding the theme toggle here if not in a header.

---

## 12. Medium Link Is Hardcoded but There's No Blog Feed

**Issue**: A Medium link exists in contacts, but there's no integration showing recent articles. The profile advertises Medium but gives visitors no preview of content.

**Recommendation**:
- Fetch the Medium RSS feed (`https://medium.com/feed/@taasekpaye`) and display 2-3 recent article cards.
- Or use a simpler approach: link to Medium with a stronger CTA ("Read my articles on Medium →").

---

## 13. `react-github-calendar` Is Imported with `@ts-expect-error`

**Issue**: The import of `GitHubCalendar` from `react-github-calendar` uses `//@ts-expect-error`, meaning the types are broken or the package doesn't export proper types.

**Recommendation**:
- Check if `@types/react-github-calendar` exists.
- Or create a local declaration file (`src/types/react-github-calendar.d.ts`).
- Remove the `@ts-expect-error` once typed.

---

## 14. `getIcon()` Switch Statement Is Fragile

**Issue**: The `getIcon()` function in `project-item.tsx` is a 20-case switch on lowercase tech names. It's hardcoded, fragile (typos break it silently — returns empty `<div>`), and requires code changes to add new tech stacks.

**Recommendation**:
- Extract tech icons to a data-driven map/record:
  ```ts
  const TECH_ICONS: Record<string, React.ComponentType<{className?: string}>> = {
    agora: SiAgora,
    supabase: SiSupabase,
    // ...
  }
  ```
- If a tech name is unknown, render a fallback (e.g., first letter in a circle) instead of an empty div.

---

## 15. No Analytics / Visitor Tracking

**Issue**: There's no way to know if anyone visits the portfolio, which projects get the most clicks, or where visitors come from.

**Recommendation**:
- Add a lightweight, privacy-friendly analytics tool (e.g., Plausible, Umami, or even a simple Supabase counter).
- Track: page views, project link clicks, contact link clicks.

---

## 16. `next-themes` Dependency Despite TanStack Migration

**Issue**: The ThemeProvider wraps `next-themes` which is a Next.js library. While it works in any React app with SSR, it's an odd dependency for a pure Vite/TanStack app.

**Recommendation**:
- Consider replacing with a simpler custom hook (localStorage + class toggle + `matchMedia` for system preference) or keep it since it works — but document the reason.

---

## 17. Database Has Stale / Unused Schemas

**Issue**: The remote database contains schemas from old Payload CMS projects (`taaseekpaye-dev`, `taasekpaye-cms`, `cac_auth`, `cac_store`, `cac_marketing`, `degarde`, `drizzle`, `chris_test`). These are unrelated to the portfolio.

**Recommendation**:
- Audit and drop unused schemas to reduce confusion and Supabase compute costs.
- Keep `public` schema only (profiles, projects, articles, contact_providers).
- Do NOT drop schemas without confirming they're unused in other live projects.

---

## 18. No Tests

**Issue**: There are zero tests. `vitest` and `@testing-library/react` are in devDependencies but unused.

**Recommendation**:
- Add at minimum:
  - Unit test for `getIcon()` and `formatDate()`.
  - Component test for `ProjectItem` rendering with mock data.
  - Snapshot test for the index route.

---

## 19. Image Component Is a Thin `<img>` Wrapper (Not Next.js Image)

**Issue**: The custom `<Image>` component at `components/ui/image.tsx` only wraps `<img>` with an optional `fill` prop (which sets width/height 100%). There's no lazy loading, no srcset, no blur placeholder, no format optimization.

**Recommendation**:
- At minimum, add `loading="lazy"` and `decoding="async"` to all images.
- For the avatar, use an explicit width/height to avoid layout shift.
- Consider using a lightweight image optimization library or Supabase Image Transformations.

---

## 20. `background-beams.tsx` Is Imported but Not Used

**Issue**: The `BackgroundBeams` component (a complex Framer Motion SVG animation) exists in `components/ui/` but is never imported anywhere. It's dead code.

**Recommendation**:
- Either integrate it into the hero section as a subtle background animation (behind the avatar) or remove it to reduce bundle size.
- Alternatively, use it on a 404 page or a future "about" section.

---

## Overall Feature Score: **42/100**

| Dimension | Score | Comment |
|-----------|-------|---------|
| Core portfolio display | 65 | Projects render, hero works — but no images, no detail pages |
| Dynamic content management | 60 | Supabase-backed — good. But no admin UI to add/edit projects |
| Developer credibility | 55 | GitHub calendar works, social links present. Missing: blog feed, stats |
| SEO / Discoverability | 10 | No meta tags, no OG, no structured data |
| Navigation / IA | 30 | Single page, no header, no filter, no project detail |
| Polish / UX | 30 | Theme toggle hidden, no error states, placeholder images, no animations |
| Code quality | 50 | Clean monorepo, but has dead code, ts-expect-error, fragile switch, no tests |
| Analytics / Feedback | 0 | No analytics, no contact form |
