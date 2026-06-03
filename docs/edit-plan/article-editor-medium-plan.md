# Article Editor UI Plan (Medium-Style)

## Project context from codebase
- **Framework in this repo:** Astro (`apps/web`) with React islands for interactive UI.
- **Styling system in this repo:** Tailwind CSS (utility-first classes throughout components).
- **Data layer in this repo:** Supabase (server client in middleware/pages + Astro actions).
- **Current editor baseline:** `ArticleEditor.tsx` already uses Tiptap and autosave action endpoints.

---

## 1) Layout anatomy

### Reasoning
Medium’s writing UX reduces chrome and gives priority to the manuscript column. The page should feel like a document, not an admin form. That means: one centered reading-width canvas, no fixed heavy toolbar, contextual controls only when needed, and metadata/settings separated into a side drawer so they don’t interrupt writing flow.

### Deliverable
- **Top utility bar (always visible, sticky)**
  - Contains: back button, document state (Draft/Published), autosave timestamp, "Publish" button, overflow menu.
  - Behavior: sticky at top (`top: 0`), minimal height (~56px desktop, 48px mobile), subtle border and translucent background.
  - Scroll: remains visible while canvas scrolls.

- **Cover image region (always present but compact when empty)**
  - Contains: cover image preview or empty placeholder CTA.
  - Behavior: sits at top of manuscript, before title.
  - Size: full content column width; image area fixed ratio (16:9), max height ~420px desktop.
  - Scroll: scrolls with content (not sticky).

- **Title + subtitle block (always visible in flow)**
  - Contains: large title input and optional subtitle/dek input.
  - Behavior: no card/chrome; appears as plain typography fields.
  - Size: title 52–64px visual scale desktop, subtitle 24–28px.
  - Scroll: in document flow.

- **Writing canvas (primary scroll area)**
  - Contains: Tiptap editor body.
  - Behavior: centered, max width **680px** for text; controls hidden unless selection or slash command context.
  - Scroll: normal page scroll; editor itself is not separately scrollable.

- **Floating selection toolbar (contextual, toggled)**
  - Contains: inline formatting actions only.
  - Behavior: appears near text selection; hidden when no valid non-collapsed selection.
  - Size: compact pill row (~36px height).
  - Scroll: follows selection; repositioned on scroll/resize.

- **Slash command menu (contextual, toggled)**
  - Contains: insert blocks (H2, H3, quote, divider, image, code block).
  - Behavior: appears at caret when user types `/` at block start.
  - Size: dropdown panel ~280px.
  - Scroll: anchored to caret; closes on escape/blur.

- **Publish/settings panel (toggled drawer)**
  - Contains: excerpt, tags, canonical URL, SEO title/description, status action.
  - Behavior: right-side drawer on desktop/tablet; full-screen sheet on mobile.
  - Size: 400–440px width desktop.
  - Scroll: internal scroll if content exceeds viewport.

- **Toasts / transient notices (floating)**
  - Contains: save success, save error, validation errors.
  - Behavior: bottom-right desktop, bottom-center mobile.
  - Scroll: fixed overlay, auto-dismiss except errors.

---

## 2) Component tree

### Reasoning
Keep page-level data loading on server, but move all interaction into a single editor client shell to avoid prop drilling across Astro boundaries. Split concerns by manuscript vs metadata vs command surfaces.

### Deliverable (annotated tree)

- `ArticleEditorPage` **[server]** — route-level shell and data fetching
  - `EditorRouteGuard` **[server]** — ensures auth/ownership
  - `EditorShell` **[client]** — orchestrates editor state and UI composition
    - `EditorTopBar` **[client]** — sticky utility actions (back/status/save/publish)
      - `BackToArticlesButton` **[client]**
      - `SaveStatusIndicator` **[client]**
      - `PublishButton` **[client]**
      - `EditorOverflowMenu` **[client]**
    - `EditorCanvas` **[client]** — centered manuscript column wrapper
      - `CoverImageBlock` **[client]** — cover preview, add/replace/remove
      - `ArticleTitleField` **[client]** — title input
      - `ArticleSubtitleField` **[client]** — subtitle/dek input
      - `ArticleBodyEditor` **[client]** — Tiptap content area
        - `SelectionBubbleToolbar` **[client]**
          - `LinkPopover` **[client]**
        - `SlashCommandMenu` **[client]**
    - `PublishDrawer` **[client]** — settings + publish action
      - `ExcerptField` **[client]**
      - `TagInput` **[client]**
        - `TagTypeaheadList` **[client]**
      - `CanonicalUrlField` **[client]**
      - `SeoTitleField` **[client]**
      - `SeoDescriptionField` **[client]**
      - `StatusActionFooter` **[client]**
    - `EditorToastRegion` **[client]** — global toasts for save/publish errors

- `editorState` module **[shared]** — Stunk atoms + typed actions
- `editorApi` module **[shared]** — Supabase/Astro action adapters
- `editorSchema` module **[shared]** — zod validations for publish payload

---

## 3) State design

### Reasoning
State should separate: (1) manuscript content, (2) metadata, (3) UI surfaces, (4) persistence lifecycle. Keep autosave status explicit so every surface can render truthfully.

### Deliverable (Stunk atoms)

#### `editorModeAtom`
- Type: `'create' | 'edit'`
- Initial: `'create'`
- Read by: `EditorShell`, `EditorTopBar`, `PublishDrawer`
- Mutated by: `initializeEditorState(mode, payload)`

#### `articleIdAtom`
- Type: `number | null`
- Initial: `null`
- Read by: `EditorShell`, `autosaveTick`, `publishArticle`
- Mutated by: `initializeEditorState`, `setArticleId(id: number)`

#### `titleAtom`
- Type: `string`
- Initial: `''`
- Read by: `ArticleTitleField`, `EditorTopBar`, `PublishDrawer`
- Mutated by: `setTitle(value: string)`

#### `subtitleAtom`
- Type: `string`
- Initial: `''`
- Read by: `ArticleSubtitleField`, `PublishDrawer`
- Mutated by: `setSubtitle(value: string)`

#### `coverImageAtom`
- Type: `{ url: string; alt: string } | null`
- Initial: `null`
- Read by: `CoverImageBlock`, `PublishDrawer`
- Mutated by: `setCoverImage(image)`, `removeCoverImage()`

#### `bodyJsonAtom`
- Type: `Record<string, unknown>`
- Initial:
```ts
{ type: 'doc', content: [{ type: 'paragraph' }] }
```
- Read by: `ArticleBodyEditor`, `autosaveTick`, `publishArticle`
- Mutated by: `setBodyJson(doc)`

#### `excerptAtom`
- Type: `string`
- Initial: `''`
- Read by: `PublishDrawer`
- Mutated by: `setExcerpt(value: string)`

#### `tagsAtom`
- Type: `string[]`
- Initial: `[]`
- Read by: `TagInput`, `PublishDrawer`
- Mutated by: `addTag(tag: string)`, `removeTag(tag: string)`, `reorderTags(tags: string[])`

#### `canonicalUrlAtom`
- Type: `string`
- Initial: `''`
- Read by: `CanonicalUrlField`, `PublishDrawer`
- Mutated by: `setCanonicalUrl(value: string)`

#### `seoTitleAtom`
- Type: `string`
- Initial: `''`
- Read by: `SeoTitleField`, `PublishDrawer`
- Mutated by: `setSeoTitle(value: string)`

#### `seoDescriptionAtom`
- Type: `string`
- Initial: `''`
- Read by: `SeoDescriptionField`, `PublishDrawer`
- Mutated by: `setSeoDescription(value: string)`

#### `statusAtom`
- Type: `'draft' | 'published'`
- Initial: `'draft'`
- Read by: `EditorTopBar`, `PublishDrawer`
- Mutated by: `setStatus(status)`, `publishArticle()`, `unpublishArticle()`

#### `isPublishDrawerOpenAtom`
- Type: `boolean`
- Initial: `false`
- Read by: `EditorTopBar`, `PublishDrawer`
- Mutated by: `openPublishDrawer()`, `closePublishDrawer()`, `togglePublishDrawer()`

#### `selectionToolbarAtom`
- Type: `{ visible: boolean; x: number; y: number; linkEditOpen: boolean }`
- Initial: `{ visible: false, x: 0, y: 0, linkEditOpen: false }`
- Read by: `SelectionBubbleToolbar`
- Mutated by: `showSelectionToolbar(pos)`, `hideSelectionToolbar()`, `toggleInlineLinkEditor(open)`

#### `slashMenuAtom`
- Type: `{ visible: boolean; x: number; y: number; query: string }`
- Initial: `{ visible: false, x: 0, y: 0, query: '' }`
- Read by: `SlashCommandMenu`
- Mutated by: `openSlashMenu(pos)`, `updateSlashQuery(q)`, `closeSlashMenu()`

#### `saveStateAtom`
- Type: `'idle' | 'dirty' | 'saving' | 'saved' | 'error'`
- Initial: `'idle'`
- Read by: `SaveStatusIndicator`, `EditorTopBar`, `EditorToastRegion`
- Mutated by: `markDirty()`, `saveDraft()`, `handleSaveSuccess()`, `handleSaveError(err)`

#### `lastSavedAtAtom`
- Type: `string | null`
- Initial: `null`
- Read by: `SaveStatusIndicator`
- Mutated by: `handleSaveSuccess(savedAtIso: string)`

#### `validationErrorsAtom`
- Type: `Record<string, string>`
- Initial: `{}`
- Read by: `PublishDrawer`, `EditorToastRegion`
- Mutated by: `setValidationErrors(errors)`, `clearValidationErrors()`

### Action functions (non-atom)
```ts
export type EditorBootstrapPayload = {
  id?: number
  title?: string
  subtitle?: string
  coverImage?: { url: string; alt: string } | null
  bodyJson?: Record<string, unknown>
  excerpt?: string
  tags?: string[]
  canonicalUrl?: string
  seoTitle?: string
  seoDescription?: string
  status?: 'draft' | 'published'
}

export function initializeEditorState(
  mode: 'create' | 'edit',
  payload: EditorBootstrapPayload,
): void

export function setTitle(value: string): void
export function setSubtitle(value: string): void
export function setBodyJson(doc: Record<string, unknown>): void
export function setCoverImage(image: { url: string; alt: string }): void
export function removeCoverImage(): void
export function setExcerpt(value: string): void
export function addTag(tag: string): void // max 5 enforced
export function removeTag(tag: string): void
export function setCanonicalUrl(value: string): void
export function setSeoTitle(value: string): void
export function setSeoDescription(value: string): void

export async function saveDraft(force?: boolean): Promise<{ id: number; savedAt: string }>
export async function publishArticle(): Promise<{ id: number; publishedAt: string }>
export async function unpublishArticle(): Promise<{ id: number }>

export function openPublishDrawer(): void
export function closePublishDrawer(): void
export function togglePublishDrawer(): void

export function showSelectionToolbar(pos: { x: number; y: number }): void
export function hideSelectionToolbar(): void
export function toggleInlineLinkEditor(open: boolean): void

export function openSlashMenu(pos: { x: number; y: number }): void
export function updateSlashQuery(query: string): void
export function closeSlashMenu(): void
```

---

## 4) Mode handling (create vs edit)

### Reasoning
Mode should be route-derived and immutable during session. Create mode initializes empty atoms and does not require article ownership lookup. Edit mode requires ownership check and full payload hydration from server loader before client mounts.

### Deliverable

#### Route behavior
- `/articles/new` → `mode = 'create'`
- `/articles/$id/edit` → `mode = 'edit'`

#### Loader contract (TanStack Start style requested)
```ts
export type EditorLoaderData =
  | {
      mode: 'create'
      article: null
      defaults: {
        title: ''
        subtitle: ''
        bodyJson: { type: 'doc'; content: [{ type: 'paragraph' }] }
      }
    }
  | {
      mode: 'edit'
      article: {
        id: number
        title: string
        subtitle: string | null
        content: Record<string, unknown> | null
        cover_image_url: string | null
        cover_image_alt: string | null
        excerpt: string | null
        tags: string[] | null
        canonical_url: string | null
        seo_title: string | null
        seo_description: string | null
        status: 'draft' | 'published'
        updated_at: string
        published_at: string | null
      }
      defaults: null
    }
```

```ts
// /articles/new
export const Route = createFileRoute('/articles/new')({
  loader: async (): Promise<EditorLoaderData> => ({
    mode: 'create',
    article: null,
    defaults: {
      title: '',
      subtitle: '',
      bodyJson: { type: 'doc', content: [{ type: 'paragraph' }] },
    },
  }),
})

// /articles/$id/edit
export const Route = createFileRoute('/articles/$id/edit')({
  loader: async ({ params, context }): Promise<EditorLoaderData> => {
    const article = await context.articleRepo.getOwnedArticleForEdit(Number(params.id))
    if (!article) throw notFound()
    return { mode: 'edit', article, defaults: null }
  },
})
```

#### Hydration sequence
1. Server loader returns `EditorLoaderData`.
2. `EditorShell` runs `initializeEditorState(mode, payload)` once on mount.
3. Autosave starts only after initialization complete.

---

## 5) Rich text editor choice

### Reasoning
Tiptap is already integrated and is the right fit for Medium-like behavior: precise control over marks, contextual toolbars, slash commands, and document JSON storage for Supabase persistence.

### Deliverable
- Keep **Tiptap** as the canonical body editor.
- Standard extension set:
  - `StarterKit` (without default code block if using lowlight block)
  - `Underline`, `Link`, `Highlight`
  - `TextAlign` (paragraph + heading)
  - `Image`
  - `Placeholder`
  - `CodeBlockLowlight`
- Output format:
  - Store **JSON document** as source of truth.
  - Derive HTML on save for public rendering/search indexing.

---

## 6) Floating toolbar design

### Reasoning
Selection tools should appear only when text is selected; fixed top toolbars create visual noise and reduce writing focus.

### Deliverable
- **Actions (left → right):**
  1. Bold (`Bold` icon)
  2. Italic (`Italic` icon)
  3. Underline (`Underline` icon)
  4. Strikethrough (`Strikethrough` icon)
  5. Link (`Link` icon)
  6. Inline code (`Code` icon)
  7. Highlight (`Highlighter` icon)
  8. Remove formatting (`Eraser` icon)

- **Positioning strategy**
  - Anchor to `selection.getRangeAt(0).getBoundingClientRect()`.
  - Base position: centered above selection, 10px offset.
  - If top collision (`y < 8`): flip below selection.
  - If horizontal collision: clamp within viewport with 8px gutter.

- **Overflow handling**
  - Toolbar max width ~340px, horizontal scroll disabled.
  - If viewport < 360px, collapse secondary actions into `...` popover.

- **Show/hide trigger**
  - Show on `mouseup` + non-empty selection + editor focus.
  - Update on `keyup` (shift-selection), `scroll`, and `resize`.
  - Hide on collapsed selection, blur, escape, or click outside.

- **Layering**
  - `z-index: 60` (above canvas, below modal drawer).
  - Shadow: `shadow-lg` + 1px border for contrast on white/dark themes.

- **Inline link editing**
  - Link button toggles an inline popover attached to toolbar.
  - Popover fields: URL input + "Apply" + "Remove".
  - Applies to current selection via `extendMarkRange('link')`.

---

## 7) Cover image UX

### Reasoning
Medium-style hero image should feel editorial: prominent when present, unobtrusive when absent.

### Deliverable
- **Empty state**
  - Dashed block at top of manuscript (16:9 box).
  - Copy: "Add a cover image" + secondary "or paste image URL".
  - Show drag target highlight on file drag-over.

- **Add methods**
  - Primary: file upload (click or drag-and-drop).
  - Secondary: paste image URL in small inline input.
  - Optional: paste image from clipboard if browser supports it.

- **Display behavior**
  - Aspect ratio: `16 / 9`.
  - Rendering: `object-cover`, centered focal point.
  - Width: full manuscript width (680px max), centered.

- **Edit controls on hover/focus**
  - "Replace" button (re-opens picker).
  - "Remove" button (clears image atom).
  - Alt text field in publish drawer for accessibility.

- **No-image layout**
  - Keep placeholder height smaller (~180px) to avoid huge empty region.
  - When user starts typing title and never adds image, collapse placeholder to compact CTA line.

---

## 8) Publish flow

### Reasoning
Users need confidence: draft safety via autosave, explicit publish intent via dedicated panel, and clear error recovery without losing content.

### Deliverable

### Status model
- `draft` — editable, autosaved, not publicly visible.
- `published` — publicly visible.

### Publish panel design
- **Container:** right drawer (desktop/tablet), full-screen sheet (mobile).
- **Fields:**
  - Excerpt (`textarea`, 280 chars max, counter)
  - Tags (`typeahead`, max 5, displayed as pills)
  - Canonical URL (`url` input)
  - SEO title (`input`, 60 chars advisory)
  - SEO description (`textarea`, 160 chars advisory)

### Tag behavior
- Type to filter suggestions from known tags.
- Enter/comma confirms a tag.
- Deduplicate case-insensitively.
- Hard limit 5 tags; show inline validation at limit.

### Primary button labels
- If `status === 'draft'`: **"Publish article"**
- If `status === 'published'`: **"Update published article"**
- Secondary action when published: **"Move to draft"**

### Autosave behavior
- Trigger on dirty changes with debounce **1500ms**.
- Save only changed fields/body hash.
- Display `Last saved 2m ago` in top bar (relative time updates every 30s).
- Force save on `Cmd/Ctrl + S`, publish click, route leave attempt.

### Error states
- **Network save failure**
  - Keep dirty state.
  - Inline top bar error badge + retry action.
  - Toast: "Could not save draft. Retrying…" then "Retry failed".

- **Validation errors**
  - Highlight field-level errors in drawer.
  - Disable publish until blocking errors resolved.

- **Publish API failure**
  - Drawer remains open.
  - Show non-dismissable error summary at drawer footer with retry.

---

## 9) Keyboard shortcuts

### Reasoning
Shortcuts should mirror common editors and be cross-platform (`Cmd` on macOS, `Ctrl` on Windows/Linux).

### Deliverable

| Shortcut | Action | Notes |
|---|---|---|
| `Cmd/Ctrl + B` | Toggle bold | Selection mark |
| `Cmd/Ctrl + I` | Toggle italic | Selection mark |
| `Cmd/Ctrl + U` | Toggle underline | Selection mark |
| `Cmd/Ctrl + Shift + X` | Toggle strikethrough | Selection mark |
| ``Cmd/Ctrl + ` `` | Toggle inline code | Selection mark |
| `Cmd/Ctrl + K` | Insert/Edit link | Opens link popover |
| `Cmd/Ctrl + Alt + 2` | Heading 2 | Block transform |
| `Cmd/Ctrl + Alt + 3` | Heading 3 | Block transform |
| `Cmd/Ctrl + Shift + 7` | Ordered list | Block transform |
| `Cmd/Ctrl + Shift + 8` | Bullet list | Block transform |
| `Cmd/Ctrl + Shift + 9` | Blockquote | Block transform |
| `Cmd/Ctrl + Z` | Undo | Editor history |
| `Cmd/Ctrl + Shift + Z` | Redo | macOS convention |
| `Cmd/Ctrl + Y` | Redo | Windows/Linux fallback |
| `Cmd/Ctrl + S` | Save draft now | Prevent browser save dialog |
| `Cmd/Ctrl + Shift + P` | Open publish panel | Focus first field |
| `Cmd/Ctrl + Enter` | Publish / Update published | Contextual by status |
| `/` (at empty block start) | Open slash command menu | Block insertion menu |
| `Esc` | Close toolbar/menu/drawer | Priority: popover > toolbar > drawer |

---

## 10) Responsive behavior

### Reasoning
The experience should stay editorial across breakpoints, but mobile needs reduced UI complexity and larger tap targets.

### Deliverable
- **Desktop (≥ 1280px)**
  - Manuscript max width 680px centered.
  - Publish drawer as right side panel (420px).
  - Floating toolbar full actions visible.

- **Tablet (768px–1279px)**
  - Manuscript max width 640px.
  - Publish drawer width 360px.
  - Top bar keeps all actions, but overflow menu collapses non-essential items.

- **Mobile (< 768px)**
  - Manuscript width `calc(100vw - 32px)`.
  - Publish panel becomes full-screen sheet.
  - Floating toolbar simplified to: Bold, Italic, Link, More.
  - Cover controls become bottom action row with large touch targets.

### Mobile editing model decision
- **Inline rich editing remains viable** (do not degrade to plain textarea).
- Reason: Tiptap mobile support is acceptable for this scope; losing rich editing would break content parity.
- Mitigation: simplify toolbar/actions, and provide optional “Preview” tab in publish sheet for confidence.

---

## Implementation order

1. **Define editor data contracts and validation schemas** — Create typed payloads for create/edit loader + publish input validation. **(M)**
2. **Create route loaders for new/edit modes** — Implement mode-aware server loaders and ownership checks. **(M)**
3. **Build `editorState` atoms + action layer** — Add Stunk atoms and pure action API for mutations. **(L)**
4. **Refactor page into `EditorShell` composition** — Introduce top bar/canvas/drawer scaffolding with existing article routes. **(M)**
5. **Implement title/subtitle/cover blocks** — Add manuscript header fields and cover image UX states. **(M)**
6. **Integrate Tiptap body editor into new shell** — Wire body JSON to atoms and dirty-state tracking. **(L)**
7. **Implement selection bubble toolbar + link popover** — Add selection detection, positioning, and mark actions. **(L)**
8. **Implement slash command menu polish** — Improve insert menu behavior, keyboard nav, and close conditions. **(M)**
9. **Build publish drawer and metadata fields** — Add excerpt/tags/canonical/SEO controls and validation rendering. **(M)**
10. **Implement autosave orchestration** — Debounced saves, last-saved time, retry/error states. **(L)**
11. **Implement publish/unpublish actions and button logic** — Contextual primary action and status transitions. **(M)**
12. **Add keyboard shortcuts map + command handler** — Global editor keybindings and conflict handling. **(M)**
13. **Responsive tuning for desktop/tablet/mobile** — Breakpoint-specific layout and simplified mobile controls. **(M)**
14. **QA pass: persistence, navigation, error recovery** — Validate no data loss, smooth transitions, and API error flows. **(M)**
