# Article Editor Revamp — Actionable Execution Plan

Source reviewed: `docs/edit-plan/article-editor-medium-plan.md`

## 1) Review outcome

The source plan has strong UX direction, but it is not directly executable against this repo without adaptation.

### What is strong and reusable
- Clear editorial UX target (canvas-first, contextual tools, publish drawer).
- Good behavior specs for autosave, slash menu, and floating toolbar.
- Practical keyboard shortcut matrix and responsive constraints.

### Gaps to resolve before implementation
- **Framework mismatch**: the source uses TanStack route-loader examples, while this project is Astro pages + React islands.
- **State architecture mismatch**: source proposes Stunk atoms, but current admin editor uses React state/hooks and no stunk in `apps/web`.
- **Data model mismatch**: source expects fields not in current schema/types (`subtitle`, tags array, canonical URL, SEO fields, cover alt/url pair).
- **Route mismatch**: current editor is only in `admin/articles/[id]/edit`, not in create flow.

---

## 2) Delivery strategy

Ship in 3 incremental releases to avoid regressions in existing admin publishing flows.

- **Release A (Foundation + UX shell)**: editor shell, top bar, canvas structure, improved existing editor behavior.
- **Release B (Metadata + publish drawer + shortcuts)**: metadata panel, validation, autosave orchestration improvements.
- **Release C (Schema-backed enhancements)**: new DB fields, richer publish metadata, create-mode editor parity.

---

## 3) Action plan by workstream

## Workstream 0 — Freeze scope and contracts (required first)

- [ ] Define **V1 schema policy**:
  - **V1.0 (no DB migration)**: map metadata to existing fields only (`summary`, `image_url`, `url`, `status`).
  - **V1.1 (with DB migration)**: add missing columns for subtitle/tags/canonical/seo/cover alt.
- [ ] Approve execution sequence: A -> B -> C.
- [ ] Define feature flags (optional) for staged rollout in admin only.

**Acceptance criteria**
- A written decision in this file section for V1.0 vs V1.1 before coding starts.

---

## Workstream 1 — Current-state hardening (small, high impact)

### Tasks
- [ ] Replace remaining hardcoded color classes in editor components with theme tokens where feasible.
- [ ] Ensure save status uses consistent tokenized colors and text contrast.
- [ ] Add deterministic cleanup for debounce timers and global listeners.

### Files
- `apps/web/src/components/admin/editor/ArticleEditor.tsx`
- `apps/web/src/components/admin/editor/FloatingToolbar.tsx`
- `apps/web/src/components/admin/editor/SlashCommandMenu.tsx`

**Acceptance criteria**
- No console errors from dangling listeners when navigating away from edit page.
- Keyboard/mouse interactions still work across light/dark.

---

## Workstream 2 — Editor shell refactor (Astro-compatible)

### Tasks
- [ ] Create a new client shell component to orchestrate editor UI surfaces.
- [ ] Split current monolithic editor into composable parts:
  - `EditorTopBar`
  - `EditorCanvas`
  - `SelectionBubbleToolbar`
  - `SlashCommandMenu` (refined)
  - `PublishDrawer` (initial skeleton)
- [ ] Keep existing `ArticleEditorIsland` lazy-loading + error boundary behavior.

### Files (target)
- `apps/web/src/components/admin/editor/EditorShell.tsx` (new)
- `apps/web/src/components/admin/editor/EditorTopBar.tsx` (new)
- `apps/web/src/components/admin/editor/EditorCanvas.tsx` (new)
- `apps/web/src/components/admin/editor/ArticleEditor.tsx` (refactor)
- `apps/web/src/components/admin/editor/ArticleEditorIsland.tsx` (wire shell)

**Acceptance criteria**
- Existing edit route renders unchanged core functionality (content loads, edits save).
- Top bar is sticky and contains back/status/save/publish entry action.

---

## Workstream 3 — State and API contract (without stunk)

### Decision
Use a typed React reducer/context in V1 to align with current codebase and avoid introducing a new state library.

### Tasks
- [ ] Create `editor-state.ts` with reducer actions for:
  - mode (`create` / `edit`)
  - content draft
  - save lifecycle (`idle/dirty/saving/saved/error`)
  - UI overlays (publish drawer, toolbar, slash menu)
- [ ] Create `editor-api.ts` wrappers around Astro actions (`articles.saveContent`, `articles.update`, `articles.publish`).
- [ ] Add data normalization helpers for initial article payload hydration.

### Files (target)
- `apps/web/src/components/admin/editor/editor-state.ts` (new)
- `apps/web/src/components/admin/editor/editor-api.ts` (new)
- `apps/web/src/components/admin/editor/ArticleEditor.tsx` (consume contracts)

**Acceptance criteria**
- State transitions are explicit and testable.
- Save status and drawer open/close no longer rely on implicit component-local coupling.

---

## Workstream 4 — Floating toolbar + slash menu parity

### Tasks
- [ ] Convert current sticky formatting toolbar into true contextual selection bubble behavior.
- [ ] Keep slash menu trigger at block start and improve close conditions.
- [ ] Add mobile-safe fallback action set (Bold/Italic/Link/More).
- [ ] Add link popover that supports edit/remove on selected link mark.

### Files
- `apps/web/src/components/admin/editor/FloatingToolbar.tsx`
- `apps/web/src/components/admin/editor/SlashCommandMenu.tsx`
- `apps/web/src/components/admin/editor/ArticleEditor.tsx`

**Acceptance criteria**
- Toolbar appears only with non-collapsed selection and hides correctly on blur/escape.
- Slash menu keyboard navigation remains functional after refactor.

---

## Workstream 5 — Publish drawer (V1 existing schema mapping)

### V1 field mapping (no migration)
- Excerpt -> `articles.summary`
- Cover image URL -> `articles.image_url`
- Canonical URL (temporary) -> `articles.url`
- Status -> `articles.status`
- SEO title/description/tags/subtitle -> **deferred** (not persisted yet)

### Tasks
- [ ] Implement right drawer on desktop, full-screen sheet on mobile.
- [ ] Render mapped fields with validation and advisory counters.
- [ ] Add publish/unpublish actions and disable publish on blocking validation.

### Files
- `apps/web/src/components/admin/editor/PublishDrawer.tsx` (new)
- `apps/web/src/actions/articles.ts` (extend update path if needed)
- `apps/web/src/lib/schemas/article.ts` (extend validation for mapped fields)

**Acceptance criteria**
- Users can publish/update/unpublish without leaving editor.
- Drawer preserves unsaved values until persisted.

---

## Workstream 6 — Autosave and shortcuts completion

### Tasks
- [ ] Move autosave orchestration into centralized module with debounce 1500ms.
- [ ] Add forced save on `Cmd/Ctrl+S`, publish click, and route-leave guard.
- [ ] Add relative "last saved" display tick update (30s interval).
- [ ] Implement shortcut registry and prevent browser default where required.

### Files
- `apps/web/src/components/admin/editor/ArticleEditor.tsx`
- `apps/web/src/components/admin/editor/editor-state.ts`
- `apps/web/src/components/admin/editor/EditorTopBar.tsx`

**Acceptance criteria**
- No data loss on quick navigation after edits.
- Shortcut behavior works on macOS and Windows/Linux conventions.

---

## Workstream 7 — Create-mode editor parity

### Tasks
- [ ] Upgrade `admin/articles/new` to support same editor shell (not only metadata form).
- [ ] On first save, create article then continue autosaving content in-place.
- [ ] Keep legacy `ArticleForm` only as fallback or migrate fully into drawer metadata.

### Files
- `apps/web/src/pages/admin/articles/new.astro`
- `apps/web/src/components/admin/ArticleForm.tsx`
- `apps/web/src/components/admin/editor/ArticleEditorIsland.tsx`
- `apps/web/src/actions/articles.ts`

**Acceptance criteria**
- New article flow supports immediate writing without context switch.
- After first save, route/state remains stable.

---

## Workstream 8 — Optional schema expansion (Release C)

### Tasks
- [ ] Add migration for richer article metadata (if approved):
  - `subtitle` text
  - `tags` text[]
  - `canonical_url` text
  - `seo_title` text
  - `seo_description` text
  - `cover_image_alt` text
- [ ] Update generated types in `packages/shared/src/supabase.types.ts`.
- [ ] Extend `article` zod schemas and action payloads.

### Files
- `apps/supabase/supabase/migrations/<timestamp>_article_editor_metadata.sql`
- `packages/shared/src/supabase.types.ts`
- `apps/web/src/lib/schemas/article.ts`
- `apps/web/src/actions/articles.ts`

**Acceptance criteria**
- New metadata persists and reloads reliably in edit mode.
- No schema-health regressions on `/admin/*`.

---

## 4) Execution order (ticket-ready)

1. WS0 scope decision (V1.0 vs V1.1)
2. WS1 hardening
3. WS2 shell refactor
4. WS3 state/API contracts
5. WS4 contextual toolbar + slash menu
6. WS5 publish drawer (mapped fields)
7. WS6 autosave + shortcuts
8. WS7 create-mode parity
9. WS8 schema expansion (if approved)

---

## 5) Suggested ticket breakdown

- T1: Editor shell scaffold + top bar (WS2)
- T2: Reducer/context state + API adapters (WS3)
- T3: Selection bubble + link popover (WS4)
- T4: Slash menu behavior refinement (WS4)
- T5: Publish drawer UI + mapped persistence (WS5)
- T6: Autosave lifecycle + route leave guard + save timestamp (WS6)
- T7: Keyboard shortcuts matrix implementation (WS6)
- T8: New article route editor parity (WS7)
- T9: Optional DB migration + types + schema/actions (WS8)

---

## 6) QA checklist (must pass before rollout)

- [ ] Edit existing article: save/publish/unpublish all succeed.
- [ ] Network failure simulation keeps dirty state and allows retry.
- [ ] Keyboard shortcuts work while avoiding browser conflicts.
- [ ] Mobile (<768) editor remains usable with simplified controls.
- [ ] Accessibility: focus order, visible focus rings, ARIA labels for icon-only controls.
- [ ] Light/dark theme contrast remains AA for editor controls and status text.

---

## 7) Commands for validation

Run from repo root:

```bash
bun run --filter web typecheck
bun run --filter web test
bun run lint
```

---

## 8) Definition of done

- [ ] Article editor UX is manuscript-first and supports contextual formatting.
- [ ] Autosave is robust and visible to users.
- [ ] Publish flow is in-editor with clear status transitions.
- [ ] New and edit modes are aligned in behavior.
- [ ] Optional metadata schema (if included) is end-to-end persisted and typed.
