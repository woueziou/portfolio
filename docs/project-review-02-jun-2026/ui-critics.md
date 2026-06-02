# UI Critics & Recommendations

Visual and interface-level critique of the current design.

---

## 1. Hero Section Layout Feels Unbalanced Vertically

**Issue**: The hero `<div>` is set to `md:h-[90vh]` with `flex flex-col items-center justify-center`, but the content (avatar, name, title, contacts, calendar) is quite tall on mobile and scrolls. On desktop, the 90vh height works but the GitHub calendar at the bottom adds a lot of visual weight that isn't balanced at the top.

**Recommendation**:
- On mobile, drop the forced `90vh` and let content flow naturally.
- On desktop, consider reducing to `70vh` or adding more top padding so the calendar doesn't feel crammed at the bottom edge.
- The `grid place-items-center md:gap-y-2 pt-4` container has an empty `""` string in `cn()` — clean up dead classes.

---

## 2. Project Image Placeholder Is a Solid Block of `bg-primary`

**Issue**: Every project card shows a `h-[350px] w-full bg-primary` div (dark brown/black in light mode). When no image is available, this large color block is visually overwhelming and looks like a bug, not a design choice.

**Recommendation**:
- Add a subtle gradient, pattern, or an icon (folder/code) inside the placeholder.
- If an image URL exists, render it with `object-cover`.
- Use a lighter, more neutral placeholder color (e.g., `bg-muted` or `bg-secondary/30`) with a centered icon.
- Add rounded corners (`rounded-lg` or `rounded-xl`) — the current block has sharp corners while cards have rounded styles elsewhere.

---

## 3. Typography Hierarchy Is Weak

**Issue**: 
- Title: `text-3xl font-black lg:text-7xl font-audiowide` — jumps from 30px to 72px with no intermediate step. On tablet (~768-1024px), the title is 30px which feels small.
- The "Software Developer" subtitle uses `lg:text-xl font-semibold` — good sizing but the years badge next to it is visually jarring (border heavy, different font).
- Project titles are `text-xl font-bold` — fine, but project descriptions are `text-sm` in `muted-foreground`. There is little contrast between different informational hierarchies.

**Recommendation**:
- Add intermediate title sizes: `md:text-5xl` between `text-3xl` and `lg:text-7xl`.
- The years badge should use the same font (`font-sans` or `font-baufra`) instead of default system font.
- Distinguish project type badges more clearly from the description.

---

## 4. Contact Links Have Inconsistent Styling

**Issue**: 
- The `linkClass` constant is defined as `"h-10 flex space-x-2 items-center border border-secondary/30 px-4 hover:bg-primary hover:text-white "` with a trailing space.
- Email link uses this class inline (not via `linkClass` — it's literally repeated).
- URL links use `cn(linkClass)`.
- The hover effect (`hover:bg-primary hover:text-white`) creates a solid dark block on hover but the transition is instantaneous. No smooth color transition.

**Recommendation**:
- Add `transition-colors duration-150` to `linkClass`.
- Use `linkClass` consistently — the email link duplicates the class string.
- Consider using the shadcn `Button` component with `variant="outline"` for consistency.

---

## 5. Tech Stack Icons — Hover-to-Reveal Pattern Is Confusing

**Issue**: Tech stack icons are displayed as bordered boxes with just the icon visible. On hover, the name slides in. This means at a glance, a visitor has no idea what technologies were used unless they hover over every single icon. On mobile, there is no hover — so the names are **permanently hidden**.

**Recommendation**:
- Always show the tech name next to the icon, or use a `@media (hover: hover)` query to show names on desktop and always on touch devices.
- Consider a compact pill/badge style: `[icon] React` instead of icon-only with hidden text.
- The current `min-w-10` on the container creates very wide empty boxes if a name is short — use `min-w-fit` with padding instead.

---

## 6. Grid Layout Breaks at Certain Breakpoints

**Issue**: The project grid uses `grid md:grid-cols-3` but `grid-cols-1`. There's no 2-column layout — it jumps from 1 to 3 columns. Between ~480px and 768px, you get a single-column layout with very wide cards that look stretched.

**Recommendation**:
- Add `sm:grid-cols-2` for an intermediate 2-column layout.
- Add `lg:grid-cols-3` and let md be 2 columns.
- Use `gap-6` or `gap-8` for better spacing between cards.

---

## 7. Color Palette Is Monochromatic and Low Contrast

**Issue**: The entire site uses a single hue — `hsl(50, ...)` (a warm yellow/beige) — for all semantic colors:
- Background: `hsl(50 28% 95%)` — light cream
- Primary: `hsl(50 20% 15%)` — dark brown
- Border: `hsl(50 28% 50%)` — mid beige

In dark mode, `hsl(50 28% 5%)` is very dark brown (almost black), and borders are `hsl(50 28% 18%)` — borderline invisible.

**Recommendation**:
- Lighten dark mode borders to at least `30%` lightness.
- Introduce an accent color (blue, teal, or purple) for interactive elements — currently EVERYTHING is warm beige/brown. The `BackgroundBeams` component uses cyan/purple gradients that would contrast beautifully.
- The hover effect `hover:bg-primary hover:text-white` works but the `primary` color is the same brown — for project cards, consider a subtle blue or purple accent on hover instead.

---

## 8. GitHub Calendar Styling Clashes

**Issue**: `react-github-calendar` renders with its own default green color scheme. The portfolio uses warm beige/brown tones. The green calendar grid is visually disconnected from the rest of the page. On mobile, `w-screen px-2` forces full-width which may not be desirable.

**Recommendation**:
- Customize the calendar's color scheme to match the portfolio palette (brown/warm tones).
- Use `react-github-calendar`'s `theme` prop or `colorScheme` prop.
- On desktop, constrain the calendar width (e.g., `max-w-xl mx-auto`) rather than full width.
- Add the `labels` prop with `totalCount` and a legend.

---

## 9. Empty Space Between Hero and Projects Section

**Issue**: The hero section ends with the GitHub calendar, then the projects section starts with a heading. There's a `pt-8` on the grid container but no visual separator, no margin breathing room — it feels like the sections run into each other.

**Recommendation**:
- Add a visual separator (a subtle horizontal rule, a gradient line, or simply `py-16` padding).
- Consider a section background color change (alternating `bg-background` and `bg-muted/30`) to delineate sections.

---

## 10. Shadcn Card Component Exists but Isn't Used for Project Items

**Issue**: A comprehensive `Card` component suite exists (`components/ui/card.tsx`) with `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. But `ProjectItem` uses plain `<div>` elements with manual styling. The shadcn card system is designed for exactly this use case.

**Recommendation**:
- Refactor `ProjectItem` to use the existing `Card` components. This would:
  - Inherit dark/light mode styles automatically.
  - Get built-in ring/border styles.
  - Reduce custom CSS.
  - Make the UI consistent with the design system.

---

## 11. Missing Focus States and Keyboard Accessibility

**Issue**: 
- Contact links have `hover:bg-primary hover:text-white` but no `focus-visible` styles.
- Project item wrapper has no focus ring — it's a `<div>`, not a button/link, but it contains interactive content.
- Theme toggle button appears to use shadcn Button which has focus styles — but it's not mounted anywhere.

**Recommendation**:
- Add `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary` to all interactive elements.
- Wrap project cards (or their title links) in proper `<a>` tags with appropriate ARIA roles.
- Test full keyboard navigation: Tab → Tab → Enter on all elements.

---

## 12. Avatar Has No Alt Text Fallback

**Issue**: The avatar image uses `<Image alt="logo" .../>`. The alt text is "logo" — not descriptive. If the image fails to load, there's no fallback (no initials, no placeholder).

**Recommendation**:
- Change alt to "Taas S. Ekpaye" or "Taas Ekpaye portrait".
- Add an `onError` handler that shows initials "TE" in a circle.
- Use a grey/neutral background on the image container so it's visible even before loading.

---

## 13. Responsive Avatar Sizing Is Abrupt

**Issue**: `w-15 h-15` on mobile, `md:w-40 md:h-40` on desktop. The jump from 60px to 160px is large. There's also a typo/bug: `w-15 h-15` is not a standard Tailwind class (Tailwind goes w-14, w-16). This likely renders as `w-15` (invalid/ignored).

**Recommendation**:
- Use standard Tailwind sizes: `w-20 h-20 md:w-40 md:h-40` or `w-24 md:w-40`.
- Add `sm:w-32` for intermediate sizing.

---

## 14. Font Loading Causes Layout Shift

**Issue**: Audiowide is loaded from Google Fonts (`@import url(...)` in CSS). Baufra is a local custom font. When the page loads, the fallback system font renders first, then Audiowide/Baufra swap in, causing text to reflow. There's no `font-display: swap` optimization visible.

**Recommendation**:
- For the Google Fonts import, add `&display=swap` to the URL.
- For Baufra, add `font-display: swap` in the `@font-face` declaration (if using `stylesheet.css`).
- Use `size-adjust` in `@font-face` to reduce layout shift.

---

## 15. `noise-bg.png` Background Adds Visual Noise Without Benefit

**Issue**: The `__root.tsx` layout sets `bg-[url('/noise-bg.png')]` on the body container. This adds a subtle grain texture overlay. However, on screens with scaling (retina) or compression, noise textures can look like JPEG artifacts or dirty screen smudges rather than intentional grain.

**Recommendation**:
- Evaluate if the noise texture is visible at all on common displays. If not, remove it — it adds to page weight.
- If keeping it, use a smaller tileable noise pattern and ensure it's rendered with `image-rendering: pixelated` or via a CSS `filter` for a cleaner effect.
- Consider making it theme-dependent (lighter grain on dark mode, subtler on light).

---

## Overall UI Score: **38/100**

| Dimension | Score | Comment |
|-----------|-------|---------|
| Visual hierarchy | 40 | Typography jumps, inconsistent sizing, no intermediate breakpoints |
| Color system | 45 | Cohesive palette but monochromatic, low contrast in dark mode, no accent |
| Component consistency | 35 | Card system unused, custom divs everywhere, dead BackgroundBeams |
| Responsiveness | 40 | Missing 2-col grid, broken avatar sizing, calendar overflows on mobile |
| Accessibility | 25 | No focus states, missing alt text, hover-only tech names on mobile |
| Polish | 35 | Placeholder images look broken, no transitions, noise texture questionable |
| Typography | 50 | Custom fonts are great, but hierarchy is off and layout shift occurs |
