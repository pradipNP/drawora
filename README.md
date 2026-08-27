# Drawora

A free, open-source, browser-based collaborative whiteboard.

License: [MIT](LICENSE). Development plan: see [ROADMAP.md](ROADMAP.md).

## Usage

Open `index.html` in a modern browser.

The top bar is a ribbon. **Home** has the everyday tools. **Draw**, **Insert**, **View**, **Page**, **Export**, and **Help** group related actions. Color, size, undo, redo, and delete stay on the right of every tab. Items marked coming soon are visible for later stages and do not do anything yet.

Scroll the canvas to zoom around the cursor. Hold **Space** or use the **Pan** tool (`H`) to move the view. Middle-mouse drag also pans. `Ctrl`+`+` / `Ctrl`+`-` zoom; `Ctrl`+`0` resets to 100%. **View** has fit-page and fit-selection.

**Page** adds, duplicates, deletes, and renames pages. Choose A4, A3, A5, A2, Letter, Legal, or a custom size, in portrait or landscape. The status bar shows page thumbnails; click to switch, drag to reorder, or press `Ctrl`+`PageDown` / `Ctrl`+`PageUp`. Insert → Page also adds a page. Backgrounds and templates are not available yet.

### Tools

| Tool   | Shortcut |
| ------ | -------- |
| Select | `V`      |
| Pan    | `H` (or hold Space) |
| Pen    | `P`      |
| Eraser | `E`      |

Shape tools: line, rectangle, rounded rectangle, ellipse, triangle, and arrow.

Text tools: **Text** (`T`) and **Sticky note** (`N`). Click to place, or drag to set the size. Double-click a text object or sticky note to edit it. Press `Esc`, `Ctrl+Enter`, or click the canvas to finish editing. An empty new text box is discarded; an empty sticky note is kept.

Formatting (bold, italic, alignment, and font size) applies to the selected text or sticky note, and to the next one you create.

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
