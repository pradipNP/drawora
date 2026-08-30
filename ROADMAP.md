# Drawora Roadmap

Permanent source of truth for development. Implement **one stage at a time**. After a stage is complete, stop. Do not start the following stage unless asked.

Statuses:

| Mark | Meaning |
| ---- | ------- |
| ✅ | COMPLETED |
| 🟡 | IN PROGRESS |
| 🔵 | NEXT |
| ⚪ | PLANNED |
| 🔴 | BLOCKED |

**Current:** Stages 1–26 complete. Stage 27 is next.

---

## Vision

Professional, free, open-source, browser-based digital teaching and productivity canvas.

Useful concepts from Paint, OneNote, Word, Excel, Miro, FigJam, Figma, Excalidraw, classroom whiteboards, and digital notebooks — without copying any of them blindly.

**Primary users:** teachers, students, tutors, online educators, presenters, and anyone who wants a free personal digital canvas.

**Uses:** classroom and online teaching, handwritten notes, mathematics, science diagrams, programming explanations, presentations, brainstorming, mind maps, study notes, document creation, image annotation, diagrams, free drawing, digital notebooks.

The product must feel like a real productivity application, not a student demo.

---

## Design philosophy

Professional, clean, fast, minimal, intuitive, teacher-friendly, keyboard-friendly, responsive, accessible, local-first, offline-capable, extensible, maintainable.

```
minimum clean architecture + maximum useful functionality
```

Do not maximize files, dependencies, or code.

Before creating a file: can this live in an existing file?  
Before adding a dependency: can native browser APIs solve this?

Never create backup files, temp files, duplicate CSS/JS, unused components, placeholder services, or folders that exist only to look professional.

---

## Technology

**Preferred:** HTML5, CSS3, modern JavaScript, Canvas API, DOM APIs, IndexedDB, Web APIs. Later: PWA (manifest + service worker), Cloudflare Pages/Workers, WebSockets, Durable Objects.

**Do not introduce** React, Vue, Angular, TypeScript, Python, Node backend, PostgreSQL, Firebase, Supabase, or Docker unless a later stage genuinely requires it.

Stay vanilla JavaScript unless explicitly changed.

Do not install packages automatically. If a dependency is needed, stop and report: package name, why, why native APIs are insufficient, architectural impact — then wait for approval.

---

## Document model

This is **not** a simple bitmap editor. The canvas is a structured document:

```
Workspace → Document → Pages → Objects → Rendering
```

Objects (pen stroke, shapes, text, sticky note, image, table, and future types) have structured properties: id, type, position, dimensions, rotation, style, content, z-order.

Do not over-engineer. The goal is future editing, saving, exporting, and collaboration.

Pages are configurable teaching surfaces (board, notebook, grid, etc.). Page background is independent from user content.

---

## Local-first

Personal use must work without login, account, cloud, or database. Cloud is an enhancement. Target is a $0 open-source project.

---

## UI direction

Evolve toward a Paint/Office-like original ribbon. Do not blindly copy Microsoft Paint.

```
┌─────────────────────────────────────────────────────┐
│ File   Home   Insert   View   Page   Draw   Help   │
├─────────────────────────────────────────────────────┤
│                 SUBNAVBAR / RIBBON                  │
├─────────────────────────────────────────────────────┤
│                      CANVAS                         │
├─────────────────────────────────────────────────────┤
│ Page 1       Zoom 100%       Canvas information     │
└─────────────────────────────────────────────────────┘
```

Common operations should be obvious to a teacher without documentation.

**Text (later):** double-click anywhere and type. Wrapping should feel like writing on the board, not filling a traditional textbox.

---

## How to execute a stage

When asked **“Move to the next stage”** or **“Start Stage X”**:

1. Read this file.
2. Find the stage marked 🔵 NEXT (or the named stage).
3. Inspect the existing implementation.
4. Implement **only** that stage.
5. Test it, including regressions from prior stages.
6. Fix problems.
7. Update this file: completed → ✅ COMPLETED, only the following stage → 🔵 NEXT, later stages stay ⚪ PLANNED.
8. Stop. Do not automatically continue.

Do not skip stages. Do not implement future features early. Small architectural preparation for a later stage is allowed; the future feature itself is not.

Prefer existing files. Prefer native APIs. Prefer the simpler implementation when it provides the same experience.

---

## Stages

### Stage 1 — Foundation

**Status:** ✅ COMPLETED

Application shell, initial canvas, base UI, initial toolbar, basic structure.

Do not rebuild.

---

### Stage 2 — Freehand drawing

**Status:** ✅ COMPLETED

Pen, eraser, colors, stroke size, pointer drawing.

Do not rebuild.

---

### Stage 3 — Shapes

**Status:** ✅ COMPLETED

Line, rectangle, rounded rectangle, ellipse, triangle, arrow, shape styling.

Do not rebuild.

---

### Stage 4 — Object editing + undo/redo

**Status:** ✅ COMPLETED

Selection, move, resize, rotate, delete, duplicate, copy/paste, undo, redo.

Do not rebuild unless fixing an actual defect.

---

### Stage 5 — Text + notes

**Status:** ✅ COMPLETED

Text objects, basic formatting, sticky notes.

Do not rebuild unless necessary.

---

### Stage 6 — Professional ribbon / subnavbar

**Status:** ✅ COMPLETED

Application chrome is a compact ribbon: Home, Draw, Insert, View, Page, Export, Help.

- **Home** — Select, clipboard (copy/paste/duplicate), pen, eraser, shapes, text, sticky notes, font formatting
- **Draw** — Pen and eraser, plus placeholders for pencil, marker, and highlighter
- **Insert / View / Page / Export** — Grouped controls; later-stage actions are visible but disabled
- **Help** — Existing keyboard shortcuts
- Stroke color, fill, size, undo, redo, and delete stay available on every tab
- Status bar shows page thumbnails and live zoom

Do not rebuild unless fixing an actual defect.

---

### Stage 7 — Advanced selection + clipboard

**Status:** ✅ COMPLETED

Marquee drag-select, Shift-click / Shift-marquee, select all, cut, copy, paste, duplicate, delete, group, ungroup, and object alignment (left / center / right / top / middle / bottom).

Shortcuts: `Ctrl+A`, `Ctrl+C`, `Ctrl+V`, `Ctrl+X`, `Ctrl+D`, `Ctrl+G`, `Ctrl+Shift+G`.

Do not implement layers yet.

---

### Stage 8 — Zoom, pan, and infinite canvas

**Status:** ✅ COMPLETED

Zoom in/out, live zoom percentage, reset to 100%, fit all objects, fit selection, wheel zoom around the cursor, pan tool, Space+drag, and middle-mouse pan.

Canvas drawing, selection, text, and shapes use world coordinates so they stay correct while zoomed.

---

### Stage 9 — Page system

**Status:** ✅ COMPLETED

Add, delete, duplicate, rename, reorder, and switch pages. Status-bar thumbnails. Sizes A4 / A3 / A5 / A2 / Letter / Legal / custom, with portrait and landscape.

Each page keeps its own objects and camera. The visible sheet is a white page on the workspace; drawings are not clipped. **View → Fit** fits the page. Insert → Page adds a page.

Do not make pages depend on cloud storage.

---

### Stage 10 — Teacher / student page modes

**Status:** ✅ COMPLETED

Page templates sit behind user content. Changing the background does not erase drawings.

**Teacher:** plain white, presentation, dark board, grid, custom paper color.  
**Student:** ruled, narrow/wide ruled, graph, dotted, mathematics grid, handwriting paper.

Modes: Teacher / Student / Custom. Paper color, line color, line spacing, grid size, and margin are adjustable. New pages inherit the current look.

---

### Stage 11 — Advanced text / Word-like editing

**Status:** ✅ COMPLETED

Double-click empty board to start writing. Text wraps by width; the box grows with height. Side handles resize width without scaling the font.

Font family and size, bold, italic, underline, strikethrough, color, alignment, line height, letter spacing, text background, paragraph spacing, bullets, numbered lists, and indent. The overlay editor provides the caret and text selection.

Formatting is per text object (or sticky note), not per character.

---

### Stage 12 — Image system

**Status:** ✅ COMPLETED

Upload (Insert → Image), drag and drop, and paste. Images move, resize (hold Shift to ignore aspect), and rotate with the existing handles.

Picture tools: crop, flip horizontal/vertical, opacity, border (stroke color + size), rounded corners, shadow, brightness, contrast, saturation, grayscale, and blur. Edits are properties on the object; the original pixels stay shared across duplicate, copy, and undo.

Do not rebuild unless fixing an actual defect.

---

### Stage 13 — Insert system

**Status:** ✅ COMPLETED

Professional Insert tab. Click an Insert item to place a default object at the viewport center, then select it. Home and Draw still draw by dragging.

Objects: image, text, shape, line, arrow, sticky note, link, page, diagram.

Links: double-click to edit, Ctrl+click or Open to visit (http, https, mailto). Diagrams are grouped shapes plus labels. Add a `data-insert` button and a `runInsert` case to extend.

---

### Stage 14 — Paint-level tools

**Status:** ✅ COMPLETED

Ink tools on the Draw tab: pencil, brush, marker, highlighter, spray, plus the existing pen and eraser. Each stroke is still an object with a `tool` style.

Fill paints the object you click (shape fill, sticky/text background, or stroke color). Eyedropper samples the board and returns to the previous tool. Lasso selects objects whose centers lie inside the path. Extra shapes: diamond, pentagon, hexagon, star. Draw → Image flips the selection (and crops a selected picture). Resize stays on the object handles.

Do not treat this as a bitmap Paint clone.

---

### Stage 15 — Teaching tools

**Status:** ✅ COMPLETED

View: overlay grid (also snaps shapes and moves), rulers (drag off a ruler to add a guide), guides, full screen. Present: laser pointer (non-permanent, `R`), spotlight, freeze, clear page with confirmation. Measure (`M`) and protractor are overlays; compass draws a circle. Insert → Math places π, roots, and common operators as text.

Freeze locks drawing and edits; pan, laser, zoom, and view toggles still work. Laser and measure do not create objects.

---

### Stage 16 — Tables / spreadsheet-like tools

**Status:** ✅ COMPLETED

Insert → Table places a 3×3 table at the viewport center, then selects it. Double-click a cell to type; Tab / Shift+Tab and arrow keys move between cells; Enter starts editing or moves down. Shift-click selects a cell range to merge. Insert → Table tools add or delete rows and columns, merge, and split. Drag inner grid lines to resize columns or rows; corner handles scale the whole table. Stroke/size are borders; fill and text format apply to the selected cells. Copy/paste copies cell text when a table cell is selected. No formulas.

Do not recreate Excel.

---

### Stage 17 — Document / file insertion

**Status:** ✅ COMPLETED

Insert → File, or drop a file on the board. Images stay pictures. `.txt` / `.md` become text. CSV (and a first Excel sheet when readable) become a table. PDF, Word, and other files become a placeholder card when a live preview is not available. Word `.docx` text is extracted when the file can be read in the browser. No extra libraries. Not a Word/Excel clone.

---

### Stage 18 — Layers / object organization

**Status:** ✅ COMPLETED

Layers panel (Objects list) with z-order controls (front/forward/backward/back), lock/unlock, hide/show, inline rename, drag-and-drop layer reordering, group visual indicators, and quick keyboard shortcuts (`Ctrl+L`, `Ctrl+[`, `Ctrl+]`, `Ctrl+Shift+[`, `Ctrl+Shift+]`). Collapsible floating panel that doesn't consume permanent canvas space.

---

### Stage 19 — Local project manager

**Status:** ✅ COMPLETED

IndexedDB storage engine with automatic background autosaving (`Ctrl+S` or debounced on edit), auto-recovery on restart/refresh. Complete board management: New board (`Ctrl+Alt+N`), Open & Recents manager modal (`Ctrl+O`), Duplicate, Rename, and Delete with visual board preview thumbnails and search filtering. 100% offline, privacy-focused, zero accounts.

---

### Stage 20 — Professional export

**Status:** ✅ COMPLETED

Comprehensive export suite:
- **Raster (PNG, JPG)**: 1× to 4× scaling, optional transparent background, adjustable JPEG quality (40%–100%).
- **Vector (SVG)**: Clean SVG rendering of shapes, strokes, texts, sticky notes, and styled elements with rotation/transform support.
- **Document (PDF)**: Clean native multi-page and single-page PDF generator matching exact canvas page sizes and aspect ratios.
- **Editable Project Format (.drawora / .json)**: Complete serializable board format preserving pages, objects, layers, colors, and fonts with full import/re-open capabilities.
- **Export Scope**: Current page, selection only, or all pages.
- **Export Ribbon & Shortcuts**: Dedicated Export panel tools, `Ctrl+E` shortcut, real-time export preview, custom filename input.

---

### Stage 21 — Full-screen / presentation mode

**Status:** ✅ COMPLETED

Dedicated distraction-free presentation experience:
- Fullscreen browser mode with hidden header chrome, ribbon toolbar, statusbar, and panels.
- Floating glassmorphic presenter control bar (Presenter HUD) with page counter, Previous / Next page controls, quick laser pointer (`R`), pen annotation (`P`), eraser (`E`), fit to screen, and exit button.
- Instant Black screen (`B` / `.`) and White screen (`W` / `,`) curtain overlays for classroom focus and lecture pauses.
- Page navigation via arrow keys (`Left` / `Right` / `Up` / `Down`), `Space`, `PageUp`, and `PageDown`.
- Seamless start with `F5` / `Present` ribbon button, and exit via `Esc` or fullscreen change.

---

### Stage 22 — PWA / install / offline

**Status:** ✅ COMPLETED

Progressive Web App (PWA) & Offline Shell:
- Web App Manifest (`manifest.webmanifest`) with standalone window configuration, theme color `#0f766e`, background `#f3f0eb`, app shortcuts, and categories.
- High-resolution adaptive app icons (192x192, 512x512, SVG, and maskable).
- Service Worker (`sw.js`) caching all core application assets (HTML, CSS, JS, manifest, icons) with cache-first and stale-while-revalidate strategy for instant offline startup.
- Seamless PWA install prompt button integrated into the menubar, reacting to `beforeinstallprompt` and `appinstalled` events.
- 100% offline board creation and management powered by browser IndexedDB without breaking local `file://` execution or desktop browsers.

---

### Stage 23 — Cloudflare deployment

**Status:** ✅ COMPLETED

Cloudflare Pages & Edge Infrastructure:
- Full Cloudflare Pages compatibility with zero-build static site configuration.
- `_headers` configuration enforcing security headers (nosniff, SAMEORIGIN, strict referrer, permissions policy) and HTTP caching rules for PWA and assets.
- `wrangler.toml` project configuration for local Pages emulation (`npm run pages:dev`) and production deployment (`npm run pages:deploy`).
- Serverless Cloudflare Pages Functions (`/api/health`) ready for edge requests.
- 100% offline and standalone personal local use preserved with zero cloud lock-in.

---

### Stage 24 — Real-time collaboration

**Status:** ✅ COMPLETED

Real-Time Multi-User Collaboration & Synchronization:
- **Edge WebSocket Rooms (`functions/api/room.js`)**: Serverless Cloudflare Pages Function WebSocket room router supporting multi-client real-time synchronization.
- **Dual-mode Sync (WebSocket + BroadcastChannel)**: Seamless multi-client communication over Cloudflare WebSockets with automatic zero-config fallback to browser `BroadcastChannel` for local/cross-tab collaboration.
- **Structured Operation Model**: Lightweight operation packets for object CRUD (`object-upsert`, `object-delete`), page operations (`page-sync`), and board snapshots (`board-sync-request` / `board-sync-response`).
- **Live Cursors & Presence**: Real-time remote cursors rendered with world-space coordinates, user name badges, custom avatar colors, and synchronized live laser pointer trails (`R`).
- **Presence UI & Room Management**: Navbar presence badge with connection state dot, active avatar chips, custom username & palette color picker, random room code generator, and instant shareable room link copying.

---

### Stage 25 — Sharing / collaboration rooms

**Status:** ✅ COMPLETED

Share Links, Room Management & Role Permissions:
- **Share Links Suite**: Dedicated Editor invite link (`?room=XYZ&role=editor`) and Viewer invite link (`?room=XYZ&role=viewer`) with one-click copy buttons.
- **Role Hierarchy (Owner / Editor / Viewer)**:
  - **Owner (Host)**: Full board authority with ability to promote, demote, or kick participants in real time.
  - **Editor**: Full drawing, object creation, transform, page management, and collaborative editing capabilities.
  - **Viewer**: Read-only observation mode with interactive panning, zooming, measuring, laser-pointer highlights, and instant presenter tracking.
- **Viewer-Mode Protection & Banner**: Top indicator banner when in Viewer mode with strict drawing, mutation, and shortcut disabling.
- **Real-Time Role Synchronization**: Live role broadcasts (`role-update`, `role-announce`, `kick-user`) propagating permissions immediately across all connected clients without requiring account login or cloud lock-in.

---

### Stage 26 — Performance / accessibility / security

**Status:** ✅ COMPLETED

Comprehensive Performance, Accessibility & Security Suite:
- **Viewport Culling**: Intelligent canvas viewport culling (`getViewportWorldBounds()`) preventing off-screen object rendering on large boards and preserving a steady 60 FPS under high zoom and object density.
- **Memory & Asset Garbage Collection**: Automatic image asset pruning (`pruneUnusedImageAssets()`) stripping orphaned image assets and detached memory buffers from undo/redo history.
- **Modal Focus Traps & ARIA Compliance**: Strict keyboard focus trapping inside dialogs (`trapModalFocus`, `releaseModalFocus`, `handleModalTabKey`) with automatic focus restoration upon modal dismissal.
- **Screen Reader Announcements**: Live region (`#a11y-live-region`, `aria-live="polite"`) announcing tool selections, page switches, autosaves, and export statuses in real time.
- **High-Contrast Focus Rings & Reduced Motion**: Universal `:focus-visible` ring indicators across all buttons, swatches, and inputs, plus full `@media (prefers-reduced-motion: reduce)` animation suppression.
- **Security & Headers Hardening**: Strict scheme validation (`http:`, `https:`, `mailto:`), zero `eval()` / `new Function()`, and Cloudflare Pages Content-Security-Policy (CSP), `X-Content-Type-Options: nosniff`, and permissions policies in `_headers`.

---

### Stage 27 — Final professional polish

**Status:** 🔵 NEXT

Product-quality review: visuals, shortcuts, dialogs, empty/loading states, desktop/tablet/mobile, templates, export, PWA, offline, performance, collaboration.

Remove dead code, unused files, duplicates, console errors. Do not add features merely to add features.

---

## Testing

Every stage must be tested before it is marked complete. No testing framework unless required. Verify JavaScript errors, important interactions, and that previous stages still work.

Never mark a stage complete if a major existing feature is broken.
