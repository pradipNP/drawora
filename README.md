# Drawora

A free, open-source, browser-based collaborative whiteboard.

License: [MIT](LICENSE). Development plan: see [ROADMAP.md](ROADMAP.md).

## Usage

Open `index.html` in a modern browser.

The top bar is a ribbon. **Home** has the everyday tools. **Draw**, **Insert**, **View**, **Page**, **Export**, and **Help** group related actions. Color, size, undo, redo, and delete stay on the right of every tab. Items marked coming soon are visible for later stages and do not do anything yet.

**Insert** places a default object at the center of the view (text, sticky, shapes, image, diagram, page, or link), then selects it. **Home** and **Draw** still draw by dragging. Table and file stay disabled until later stages. Double-click a link to edit it; Ctrl+click or **Open** visits http, https, and mailto addresses. **Insert → Diagram** adds a grouped Start → Process → End flow.

Scroll the canvas to zoom around the cursor. Hold **Space** or use the **Pan** tool (`H`) to move the view. Middle-mouse drag also pans. `Ctrl`+`+` / `Ctrl`+`-` zoom; `Ctrl`+`0` resets to 100%. **View** has fit-page and fit-selection.

**Page** adds, duplicates, deletes, and renames pages. Choose A4, A3, A5, A2, Letter, Legal, or a custom size, in portrait or landscape. The status bar shows page thumbnails; click to switch, drag to reorder, or press `Ctrl`+`PageDown` / `Ctrl`+`PageUp`. Insert → Page also adds a page.

On the **Page** tab, pick **Teacher**, **Student**, or **Custom** and a template (white, presentation, dark board, grid, ruled, graph, dotted, and the rest). Paper color, line color, spacing, grid size, and margin change the look only — drawings stay. New pages keep the current template.

### Tools

| Tool   | Shortcut |
| ------ | -------- |
| Select | `V`      |
| Pan    | `H` (or hold Space) |
| Pen    | `P`      |
| Eraser | `E`      |

Shape tools: line, rectangle, rounded rectangle, ellipse, triangle, and arrow.

Text tools: **Text** (`T`) and **Sticky note** (`N`). Click to place, or drag to set the size. Double-click empty board to start a text box; double-click a text object or sticky note to edit it. Text wraps to the box width and the box grows as you type. Side handles change width only (font size stays). Press `Esc`, `Ctrl+Enter`, or click the canvas to finish editing. An empty new text box is discarded; an empty sticky note is kept.

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
| Delete        | `Delete` / `Backspace` |
| Deselect      | `Esc`                 |

Select an object to move, resize, or rotate it. Click empty canvas and drag to select several objects. Shift-click or Shift-drag adds to the selection. **Group** keeps selected objects moving together. Align buttons line up two or more selected objects (or groups). Resize and rotation handles appear when a single object is selected.

Use **Stroke** and **Fill** to set outline and fill colors. With an object selected, color and size changes apply to that object.
