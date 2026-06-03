## Summary

Implements Phases 4-7 of the Projects & Articles Publishing System, completing the full content management feature for the portfolio.

## Changes

### Phase 4: Rich Text Editor
- **ArticleEditor** component with TipTap and auto-save indicator
- **FloatingToolbar** for text selection formatting
- **SlashCommandMenu** for block insertions (headings, lists, code blocks, etc.)
- **CodeBlockComponent** with syntax highlighting via lowlight
- Server-side **HTML renderer** for cached content (`content_html` column)
- **Reading time** calculation utility

### Phase 5: Project Detail Pages (Public)
- Dynamic SSR route `/projects/[slug]` for published project pages
- **ArticleRenderer** component with `@tailwindcss/typography` prose styling
- JSON-LD structured data (`SoftwareApplication` for projects, `TechArticle` for articles)
- SEO meta tags (title, description, OG image, Twitter cards)
- Project cards now link to `/projects/:slug` for published items
- Updated Supabase types with Phase 1 schema changes

### Phase 6: Publication Workflow
- **StatusBadge** component (Draft/Published/Archived with color coding)
- **PublishDialog** with context-aware status transition actions
- **ProjectPublishControls** with public URL display
- **ArticlePublishControls** with linked project visibility info
- Publication controls integrated into project and article edit pages

### Phase 7: Quality Controls & Testing
- Configured **Vitest** test runner
- **105 unit tests** across 6 test files:
  - HTML renderer (15 tests)
  - Reading time calculation (8 tests)
  - JSON-LD schema generation (10 tests)
  - Publication workflow transitions (18 tests)
  - Slug generation utilities (18 tests)
  - Form schema validation (36 tests)
- Biome formatting and lint fixes applied

## Test Results

```
✅ bun run test         — 105 tests passed
✅ bun run typecheck    — 0 errors
✅ bun run build        — successful
⏳ supabase db reset    — requires local Supabase
```

## Commits

```
72704be docs: mark execution workflow items as complete
93db291 chore: add .astro directory to gitignore
0162217 docs: update task checklist for phases 4-7 completion
ded94cd refactor: apply biome formatting and lint fixes
902f75d test: add Phase 7 - Quality Controls & Testing
b4c7051 feat: implement Phase 6 - Publication Workflow
a142428 feat: implement Phase 5 - Project Detail Pages (Public)
d5fa203 feat: implement Phase 4 - Rich Text Editor with TipTap
```

## Screenshots

> Add screenshots of:
> - Project detail page (`/projects/[slug]`)
> - Admin publication controls
> - Publish dialog

## Checklist

- [x] Tests pass (`bun run test`)
- [x] Typecheck passes (`bun run typecheck`)
- [x] Build succeeds (`bun run build`)
- [ ] Manual test: Project detail page renders correctly
- [ ] Manual test: Publication workflow in admin UI
- [ ] Manual test: SEO meta tags and JSON-LD output

## Related

Closes Phase 4-7 of #task-projects-articles
