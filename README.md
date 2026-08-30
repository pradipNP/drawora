# Drawora

A free, open-source, browser-based collaborative whiteboard.

License: [MIT](LICENSE). Development plan: see [ROADMAP.md](ROADMAP.md).

## Usage

Open `index.html` in a modern browser.

The top bar is a ribbon. **Home** has the everyday tools. **Draw**, **Insert**, **View**, **Page**, **Export**, and **Help** group related actions. Scroll the tool strip sideways (or use the bar under it) to reach every group. Color, size, undo, redo, and delete stay on the right of every tab. Items marked coming soon are visible for later stages and do not do anything yet.

**Insert** places a default object at the center of the view (text, sticky, shapes, image, diagram, page, link, table, or file), then selects it. **Home** and **Draw** still draw by dragging. Double-click a link to edit it; Ctrl+click or **Open** visits http, https, and mailto addresses. **Insert → Diagram** adds a grouped Start → Process → End flow.

**Insert → File** (or drop a file on the board) imports what the browser can turn into objects: images as pictures, text as a text box, CSV as a table. A first Excel sheet is placed as a table when the file can be read. Word `.docx` text is extracted when possible. PDF and other files become a labeled placeholder — Drawora does not render Word or Excel as in those apps.

**Insert → Table** places a 3×3 table. Double-click a cell to type; Tab moves to the next cell, Enter moves down, and arrow keys move the selected cell. Shift-click a second cell, then **Merge**. **+ Row / − Row / + Col / − Col** change the grid. Drag a grid line to resize a column or row. Stroke color and size are the borders; fill and text format apply to the selected cells. Copy/paste copies cell text when a cell is selected. There are no formulas.

**View** has an overlay grid (shapes snap to it), rulers (drag from a ruler to place a guide), guides, and full screen. **Present** tools: laser pointer (`R`, not saved on the page), spotlight, freeze, and clear page (asks first). Measure (`M`) and protractor show length or angle while you drag; compass draws a circle. **Insert → Math** places π, √, and other common symbols as text.

Scroll the canvas to zoom around the cursor. Hold **Space** or use the **Pan** tool (`H`) to move the view. Middle-mouse drag also pans. `Ctrl`+`+` / `Ctrl`+`-` zoom; `Ctrl`+`0` resets to 100%. **View** also has fit-page and fit-selection.

**Page** adds, duplicates, deletes, and renames pages. Choose A4, A3, A5, A2, Letter, Legal, or a custom size, in portrait or landscape. The status bar shows page thumbnails; click to switch, drag to reorder, or press `Ctrl`+`PageDown` / `Ctrl`+`PageUp`. Insert → Page also adds a page.

On the **Page** tab, pick **Teacher**, **Student**, or **Custom** and a template (white, presentation, dark board, grid, ruled, graph, dotted, and the rest). Paper color, line color, spacing, grid size, and margin change the look only — drawings stay. New pages keep the current template.

### Tools

| Tool   | Shortcut |
| ------ | -------- |
| Select | `V`      |
| Pan    | `H` (or hold Space) |
| Pen    | `P`      |
| Brush  | `B`      |
| Eraser | `E`      |
| Fill   | `F`      |
| Eyedropper | `I`  |
| Lasso  | `L`      |
| Laser  | `R`      |
| Measure | `M`     |

Shape tools: line, rectangle, rounded rectangle, ellipse, triangle, arrow, diamond, pentagon, hexagon, and star.

Text tools: **Text** (`T`) and **Sticky note** (`N`). Click to place, or drag to set the size. Double-click empty board to start a text box; double-click a text object or sticky note to edit it. Text wraps to the box width and the box grows as you type. Side handles change width only (font size stays). Press `Esc`, `Ctrl+Enter`, or click the canvas to finish editing. An empty new text box is discarded; an empty sticky note is kept.

**Draw** has pencil, brush (`B`), marker, highlighter, and spray, plus fill (`F`), eyedropper (`I`), and lasso select (`L`). Fill applies color to the object you click. The eyedropper samples the board. **Draw → Image** flips the selection; crop is for a selected picture. Object handles still resize.

Formatting (font, size, bold, italic, underline, strikethrough, alignment, line height, letter spacing, paragraph spacing, lists, indent, and text background) applies to the selected text or sticky note, and to the next one you create. `Ctrl+B` / `Ctrl+I` / `Ctrl+U`; `Tab` / `Shift+Tab` indent while editing.

**Insert → Image** opens a file picker. You can also drop a picture on the board or paste one with `Ctrl+V`. Select an image to crop, flip, add a shadow, round the corners, or change opacity, brightness, contrast, saturation, and blur. Stroke color and size become the border. Corner resize keeps the aspect ratio; hold Shift to stretch.

### Editing

| Action        | Shortcut              |
| ------------- | --------------------- |
| Undo          | `Ctrl+Z`              |
| Redo          | `Ctrl+Y` or `Ctrl+Shift+Z` |
| Select all    | `Ctrl+A`              |
| Cut           | `Ctrl+X`              |
| Copy / Paste  | `Ctrl+C` / `Ctrl+V`   |
| Duplicate     | `Ctrl+D`              |
| Group         | `Ctrl+G`              |
| Ungroup       | `Ctrl+Shift+G`        |
| Lock / Unlock | `Ctrl+L`              |
| Bring forward | `Ctrl+]`              |
| Send backward | `Ctrl+[`              |
| Bring to front| `Ctrl+Shift+]`        |
| Send to back  | `Ctrl+Shift+[`        |
| Open boards   | `Ctrl+O`              |
| New board     | `Ctrl+Alt+N`          |
| Export board  | `Ctrl+E`              |
| Present mode  | `F5`                  |
| Black screen  | `B` (in presentation) |
| White screen  | `W` (in presentation) |
| Quick save    | `Ctrl+S`              |
| Delete        | `Delete` / `Backspace` |
| Deselect      | `Esc`                 |

Select an object to move, resize, or rotate it. Click empty canvas and drag to select several objects. Shift-click or Shift-drag adds to the selection. **Group** keeps selected objects moving together. Align buttons line up two or more selected objects (or groups). **Lock** (`Ctrl+L`) prevents moving or editing an object while still allowing selection from the Objects panel.

**View → Objects** (or the Objects button on the Home ribbon) opens the **Objects panel**. Reorder objects in the z-stack by dragging rows or using Front/Up/Down/Back, toggle visibility (hide/show), lock/unlock, or double-click a layer name to rename it.

**Boards & Projects** (`Ctrl+O` or the top bar **Boards** button) opens the local project manager. Boards are stored offline in browser IndexedDB with automatic background saving, rendered preview thumbnails, search filtering, and actions to create, open, duplicate, rename, or delete boards.

**Presentation Mode** (`F5` or the **Present** button in View ribbon) turns Drawora into a full-screen teaching presentation:
- Hides editing chrome, headers, and panels with automatic page-fit.
- Floating Presenter Bar with page navigation, laser pointer (`R`), pen annotation (`P`), and eraser (`E`).
- Instant **Black Screen** (`B` / `.`) or **White Screen** (`W` / `,`) curtains to focus attention during lectures.
- Navigate pages effortlessly with arrow keys, `Space`, `PageUp`, or `PageDown`, and exit with `Esc`.

**Progressive Web App (PWA) & Offline**:
- Installable standalone app on Windows, macOS, Linux, Android, and iOS.
- Complete offline capability via Service Worker caching (`sw.js`) and IndexedDB persistence.
- Install button in top-right navbar appears when installation is supported.

**Deployment (Cloudflare Pages)**:
- Ready for immediate Cloudflare Pages deployment via `npx wrangler pages deploy .` or Git integration.
- Includes `_headers` for asset caching & security headers, plus edge functions (`/api/health`).
- Zero build step required — works as a pure static web app or edge-hosted service.

**Real-Time Collaboration & Sharing Rooms**:
- Live multi-user drawing, transforms, deletions, and page operations synchronized instantly.
- Live remote cursors with user name badges, custom avatar color palette, and synchronized laser pointer trails (`R`).
- Dual-mode synchronization: Cloudflare Pages Function WebSockets (`functions/api/room.js`) for edge deployment, with automatic zero-configuration fallback to browser `BroadcastChannel` for local multi-tab / offline collaboration.
- **Sharing & Role Permissions (Owner / Editor / Viewer)**:
  - Top menubar **Share** button with instant **Editor Invite Link** (`?room=XYZ&role=editor`) and **Viewer Invite Link** (`?room=XYZ&role=viewer`).
  - Owner moderation controls: promote/demote participants between Editor and Viewer roles or kick users in real time.
  - Read-only Viewer mode with banner indicator, allowing observation, pan/zoom, and laser pointer without board alteration.

**Export** (`Ctrl+E` or the **Export** ribbon tab) offers high-resolution output formats:
- **PNG / JPG**: Scalable resolution from 1× to 4×, custom background transparency, and JPEG quality compression.
- **SVG**: Clean vector graphic output preserving text, paths, strokes, and shapes.
- **PDF**: Multi-page or single-page PDF generation matching page dimensions and orientation.
- **Project (.drawora / .json)**: Fully editable project format exporting all pages, layers, positions, and styles, with project re-import support.

**Performance, Accessibility & Security**:
- **Viewport Culling**: Renders only objects within the visible screen area (+ padding), keeping canvas rendering fast even on boards with thousands of elements.
- **Memory Optimization**: Automated image asset garbage collection during edits and undo history management.
- **Accessibility (a11y)**: Focus trapping in dialogs with Tab cycling and focus restoration, live region announcements (`aria-live="polite"`), high-contrast `:focus-visible` rings, and `prefers-reduced-motion` compliance.
- **Security**: Content Security Policy (CSP), strict URL scheme sanitization (`http:`, `https:`, `mailto:`), zero `eval()` usage, and `X-Content-Type-Options: nosniff` headers.

**Help & Shortcuts Guide (`F1` / `Ctrl+/`)**:
- Interactive dialog with tabbed reference for all keyboard shortcuts, presenter tools, and teaching workflows.
- Responsive design tailored for desktops, touch laptops, tablets, and mobile devices.

Use **Stroke** and **Fill** to set outline and fill colors. With an object selected, color and size changes apply to that object.
