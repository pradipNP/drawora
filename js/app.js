(() => {
  const DRAW_TOOLS = ["pen", "pencil", "brush", "marker", "highlighter", "spray", "eraser"];
  const SHAPE_TOOLS = [
    "line",
    "rect",
    "roundrect",
    "ellipse",
    "triangle",
    "arrow",
    "diamond",
    "pentagon",
    "hexagon",
    "star",
  ];
  const POLYGON_SHAPES = ["triangle", "diamond", "pentagon", "hexagon", "star"];
  const TEXT_TOOLS = ["text", "sticky"];
  const EXTRA_TOOLS = ["fill", "eyedropper", "lasso", "laser", "measure", "protractor", "compass"];
  const TOOLS = ["select", "pan", ...DRAW_TOOLS, ...SHAPE_TOOLS, ...TEXT_TOOLS, ...EXTRA_TOOLS];
  const SHORTCUTS = {
    v: "select",
    h: "pan",
    p: "pen",
    b: "brush",
    e: "eraser",
    t: "text",
    n: "sticky",
    f: "fill",
    i: "eyedropper",
    l: "lasso",
    r: "laser",
    m: "measure",
  };
  const SIZE_STOPS = [2, 4, 8, 12, 20];
  const PRESET_COLORS = [
    "#1c1917",
    "#dc2626",
    "#2563eb",
    "#16a34a",
    "#ca8a04",
    "#7c3aed",
  ];
  const ROUND_RECT_RADIUS = 12;
  const MIN_SHAPE_SIZE = 2;
  const MIN_FRAME = 8;
  const HANDLE_SIZE = 7;
  const HANDLE_HIT = 10;
  const ROTATE_OFFSET = 26;
  const HIT_PADDING = 8;
  const RULER_SIZE = 22;
  const SPOTLIGHT_RADIUS = 92;
  const DUPLICATE_OFFSET = 16;
  const MAX_HISTORY = 50;
  const SELECT_COLOR = "#0f766e";
  const FONT_FAMILY = '"Segoe UI", system-ui, sans-serif';
  const FONT_STACKS = {
    sans: '"Segoe UI", system-ui, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
    mono: 'Consolas, "Courier New", monospace',
  };
  const FONT_SIZES = [12, 14, 16, 20, 24, 32, 40, 48, 72];
  const TEXT_PAD = 12;
  const TEXT_DEFAULT = { width: 280, height: 48 };
  const STICKY_DEFAULT = { width: 176, height: 176 };
  const STICKY_FILL = "#fde68a";
  const INDENT_STEP = 24;
  const MAX_INDENT = 6;
  const LIST_GUTTER = 22;
  const MIN_TEXT_WIDTH = 80;
  const MIN_IMAGE = 16;
  const MAX_IMAGE_PIXELS = 16_000_000;
  const IMAGE_TYPES = /^image\/(png|jpe?g|gif|webp|bmp|svg\+xml)$/i;
  const TABLE_DEFAULT_COLS = 3;
  const TABLE_DEFAULT_ROWS = 3;
  const TABLE_CELL_MIN = 28;
  const TABLE_PAD = 6;
  const TABLE_SPLIT_HIT = 5;
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 8;
  const ZOOM_STEP = 1.2;
  const MIN_PAGE_SIZE = 100;
  const MAX_PAGE_SIZE = 8000;
  const PAGE_PRESETS = {
    a4: { width: 794, height: 1123, label: "A4" },
    a3: { width: 1123, height: 1587, label: "A3" },
    a5: { width: 559, height: 794, label: "A5" },
    a2: { width: 1587, height: 2245, label: "A2" },
    letter: { width: 816, height: 1056, label: "Letter" },
    legal: { width: 816, height: 1344, label: "Legal" },
  };
  const TEACHER_TEMPLATES = ["white", "presentation", "dark", "grid", "solid"];
  const STUDENT_TEMPLATES = ["ruled", "narrow-ruled", "wide-ruled", "graph", "dotted", "math", "handwriting"];
  const PAGE_TEMPLATES = {
    white: { mode: "teacher", template: "white", paperColor: "#ffffff", lineColor: "#d6d3d1", lineSpacing: 32, margin: 56, gridSize: 24 },
    presentation: { mode: "teacher", template: "presentation", paperColor: "#f1f5f9", lineColor: "#0f766e", lineSpacing: 32, margin: 0, gridSize: 24 },
    dark: { mode: "teacher", template: "dark", paperColor: "#24362b", lineColor: "#4d7c5a", lineSpacing: 32, margin: 0, gridSize: 32 },
    grid: { mode: "teacher", template: "grid", paperColor: "#ffffff", lineColor: "#e7e5e4", lineSpacing: 24, margin: 0, gridSize: 24 },
    solid: { mode: "teacher", template: "solid", paperColor: "#ffffff", lineColor: "#d6d3d1", lineSpacing: 32, margin: 56, gridSize: 24 },
    ruled: { mode: "student", template: "ruled", paperColor: "#fffef7", lineColor: "#93c5fd", lineSpacing: 32, margin: 64, gridSize: 24 },
    "narrow-ruled": { mode: "student", template: "narrow-ruled", paperColor: "#fffef7", lineColor: "#93c5fd", lineSpacing: 22, margin: 64, gridSize: 24 },
    "wide-ruled": { mode: "student", template: "wide-ruled", paperColor: "#fffef7", lineColor: "#7dd3fc", lineSpacing: 40, margin: 64, gridSize: 24 },
    graph: { mode: "student", template: "graph", paperColor: "#ffffff", lineColor: "#d6d3d1", lineSpacing: 20, margin: 0, gridSize: 20 },
    dotted: { mode: "student", template: "dotted", paperColor: "#ffffff", lineColor: "#a8a29e", lineSpacing: 24, margin: 0, gridSize: 24 },
    math: { mode: "student", template: "math", paperColor: "#f8fafc", lineColor: "#cbd5e1", lineSpacing: 16, margin: 0, gridSize: 16 },
    handwriting: { mode: "student", template: "handwriting", paperColor: "#fffef7", lineColor: "#7dd3fc", lineSpacing: 56, margin: 48, gridSize: 24 },
  };

  const state = {
    tool: "pen",
    stroke: PRESET_COLORS[0],
    fill: null,
    colorTarget: "stroke",
    size: 4,
    fontSize: 24,
    fontKey: "sans",
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    align: "left",
    lineHeight: 1.35,
    letterSpacing: 0,
    paragraphSpacing: 0,
    textBack: null,
    list: "none",
    indent: 0,
    dpr: 1,
    nextId: 1,
    nextPageId: 1,
    pages: [],
    currentPageId: null,
    objects: [],
    selectedIds: [],
    clipboard: [],
    past: [],
    future: [],
    historyBefore: null,
    preview: null,
    active: null,
    editingId: null,
    editingIsNew: false,
    skipCanvasClick: false,
    ribbonTab: "home",
    zoom: 1,
    panX: 0,
    panY: 0,
    spacePan: false,
    queuedPoints: [],
    raf: 0,
    pageDragId: null,
    pageDragMoved: false,
    pageThumbKey: "",
    cropping: false,
    eyedropperReturn: "pen",
    tableCell: null,
    tableRange: null,
    editingCell: null,
    cellClipboard: "",
    clipboardKind: "objects",
    showGrid: false,
    showRulers: false,
    showGuides: true,
    spotlight: false,
    frozen: false,
    pointerWorld: null,
    laserTrail: [],
  };

  const RIBBON_TABS = ["home", "draw", "insert", "view", "page", "export", "help"];

  const canvas = document.getElementById("board");
  const toolbar = document.querySelector(".ribbon");
  const ribbonTabs = document.querySelector(".ribbon-tabs");
  const colorInput = document.getElementById("custom-color");
  const customSwatch = toolbar && toolbar.querySelector(".swatch-custom");
  const strokePreview = document.getElementById("stroke-preview");
  const fillPreview = document.getElementById("fill-preview");
  const fillTargetButton = toolbar && toolbar.querySelector('[data-color-target="fill"]');
  const sizeInput = document.getElementById("stroke-size");
  const sizeValue = document.getElementById("size-value");
  const undoBtn = document.getElementById("undo-btn");
  const redoBtn = document.getElementById("redo-btn");
  const deleteBtn = document.getElementById("delete-btn");
  const copyBtn = document.getElementById("copy-btn");
  const pasteBtn = document.getElementById("paste-btn");
  const duplicateBtn = document.getElementById("duplicate-btn");
  const cutBtn = document.getElementById("cut-btn");
  const selectAllBtn = document.getElementById("select-all-btn");
  const groupBtn = document.getElementById("group-btn");
  const ungroupBtn = document.getElementById("ungroup-btn");
  const editor = document.getElementById("text-editor");
  const fontSizeSelect = document.getElementById("font-size");
  const fontFamilySelect = document.getElementById("font-family");
  const lineHeightInput = document.getElementById("line-height");
  const letterSpacingInput = document.getElementById("letter-spacing");
  const paraSpacingInput = document.getElementById("para-spacing");
  const textBackInput = document.getElementById("text-back");
  const zoomLabel = document.getElementById("zoom-label");
  const zoomValue = document.getElementById("zoom-value");
  const pageNameInput = document.getElementById("page-name");
  const pageWidthInput = document.getElementById("page-width");
  const pageHeightInput = document.getElementById("page-height");
  const pageThumbs = document.getElementById("page-thumbs");
  const pageStatus = document.getElementById("page-status");
  const pageDeleteBtn = document.getElementById("page-delete-btn");
  const statusbar = document.querySelector(".statusbar");
  const paperColorInput = document.getElementById("paper-color");
  const lineColorInput = document.getElementById("line-color");
  const lineSpacingInput = document.getElementById("line-spacing");
  const gridSizeInput = document.getElementById("grid-size");
  const pageMarginInput = document.getElementById("page-margin");
  const imageFileInput = document.getElementById("image-file");
  const imageCropBtn = document.getElementById("image-crop-btn");
  const imageFlipHBtn = document.getElementById("image-flip-h-btn");
  const imageFlipVBtn = document.getElementById("image-flip-v-btn");
  const imageShadowBtn = document.getElementById("image-shadow-btn");
  const imageGrayBtn = document.getElementById("image-gray-btn");
  const imageOpacityInput = document.getElementById("image-opacity");
  const imageRadiusInput = document.getElementById("image-radius");
  const imageBrightnessInput = document.getElementById("image-brightness");
  const imageContrastInput = document.getElementById("image-contrast");
  const imageSaturationInput = document.getElementById("image-saturation");
  const imageBlurInput = document.getElementById("image-blur");
  const canvasWrap = document.querySelector(".canvas-wrap");
  const linkDialog = document.getElementById("link-dialog");
  const linkForm = document.getElementById("link-form");
  const linkTitle = document.getElementById("link-dialog-title");
  const linkTextInput = document.getElementById("link-text");
  const linkHrefInput = document.getElementById("link-href");
  const linkError = document.getElementById("link-error");
  const linkCancel = document.getElementById("link-cancel");
  const linkOpenBtn = document.getElementById("link-open-btn");
  const confirmDialog = document.getElementById("confirm-dialog");
  const confirmForm = document.getElementById("confirm-form");
  const confirmTitle = document.getElementById("confirm-title");
  const confirmMessage = document.getElementById("confirm-message");
  const confirmCancel = document.getElementById("confirm-cancel");
  const confirmOk = document.getElementById("confirm-ok");
  const teachStatus = document.getElementById("teach-status");
  const appEl = document.querySelector(".app");

  if (
    !canvas ||
    !toolbar ||
    !colorInput ||
    !customSwatch ||
    !strokePreview ||
    !fillPreview ||
    !fillTargetButton ||
    !sizeInput ||
    !sizeValue ||
    !undoBtn ||
    !redoBtn ||
    !deleteBtn ||
    !copyBtn ||
    !pasteBtn ||
    !duplicateBtn ||
    !cutBtn ||
    !selectAllBtn ||
    !groupBtn ||
    !ungroupBtn ||
    !ribbonTabs ||
    !editor ||
    !fontSizeSelect ||
    !fontFamilySelect ||
    !lineHeightInput ||
    !letterSpacingInput ||
    !paraSpacingInput ||
    !textBackInput ||
    !zoomLabel ||
    !zoomValue ||
    !pageNameInput ||
    !pageWidthInput ||
    !pageHeightInput ||
    !pageThumbs ||
    !pageStatus ||
    !pageDeleteBtn ||
    !statusbar ||
    !paperColorInput ||
    !lineColorInput ||
    !lineSpacingInput ||
    !gridSizeInput ||
    !pageMarginInput ||
    !imageFileInput ||
    !imageCropBtn ||
    !imageFlipHBtn ||
    !imageFlipVBtn ||
    !imageShadowBtn ||
    !imageGrayBtn ||
    !imageOpacityInput ||
    !imageRadiusInput ||
    !imageBrightnessInput ||
    !imageContrastInput ||
    !imageSaturationInput ||
    !imageBlurInput ||
    !canvasWrap ||
    !linkDialog ||
    !linkForm ||
    !linkTitle ||
    !linkTextInput ||
    !linkHrefInput ||
    !linkError ||
    !linkCancel ||
    !linkOpenBtn ||
    !confirmDialog ||
    !confirmForm ||
    !confirmTitle ||
    !confirmMessage ||
    !confirmCancel ||
    !confirmOk ||
    !teachStatus ||
    !appEl
  ) {
    console.error("Drawora: missing canvas or toolbar controls.");
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Drawora: 2D canvas is not available.");
    return;
  }

  const imageAssets = new Map();
  let nextImageAssetId = 1;
  let linkDialogTargetId = null;
  let confirmCallback = null;

  function isTypingTarget(element) {
    if (!element || !(element instanceof HTMLElement)) {
      return false;
    }

    return (
      element.tagName === "INPUT" ||
      element.tagName === "TEXTAREA" ||
      element.tagName === "SELECT" ||
      element.isContentEditable
    );
  }

  function isShapeTool(tool) {
    return SHAPE_TOOLS.includes(tool);
  }

  function isInkTool(tool) {
    return DRAW_TOOLS.includes(tool);
  }

  function isPolygonShape(object) {
    return object && POLYGON_SHAPES.includes(object.type);
  }

  function isTextTool(tool) {
    return TEXT_TOOLS.includes(tool);
  }

  function isTextLike(object) {
    return object && (object.type === "text" || object.type === "sticky");
  }

  function isImage(object) {
    return object && object.type === "image";
  }

  function isLink(object) {
    return object && object.type === "link";
  }

  function isTable(object) {
    return object && object.type === "table";
  }

  function selectedTable() {
    const selected = selectedObjects();
    return selected.length === 1 && isTable(selected[0]) ? selected[0] : null;
  }

  function selectedLink() {
    const selected = selectedObjects();
    return selected.length === 1 && isLink(selected[0]) ? selected[0] : null;
  }

  function selectedImage() {
    const selected = selectedObjects();
    return selected.length === 1 && isImage(selected[0]) ? selected[0] : null;
  }

  function isSelectable(object) {
    return !(object.type === "stroke" && object.tool === "eraser");
  }

  function createTableCell() {
    return {
      text: "",
      align: "left",
      bold: false,
      italic: false,
      underline: false,
      strike: false,
      color: "#0f172a",
      fontSize: 14,
      fontKey: "sans",
      fill: null,
      colspan: 1,
      rowspan: 1,
      covered: false,
      origin: null,
    };
  }

  function normalizeFractions(values) {
    const next = values.map((value) => Math.max(0.0001, Number(value) || 0));
    const sum = next.reduce((total, value) => total + value, 0) || 1;
    return next.map((value) => value / sum);
  }

  function tableColCount(object) {
    return object.colW && object.colW.length ? object.colW.length : object.cells[0] ? object.cells[0].length : 0;
  }

  function tableRowCount(object) {
    return object.rowH && object.rowH.length ? object.rowH.length : object.cells ? object.cells.length : 0;
  }

  function tableLayout(object) {
    const colW = normalizeFractions(object.colW || []);
    const rowH = normalizeFractions(object.rowH || []);
    const cols = [];
    const rows = [];
    let x = 0;
    for (let i = 0; i < colW.length; i += 1) {
      const w = colW[i] * object.width;
      cols.push({ x, w });
      x += w;
    }
    let y = 0;
    for (let i = 0; i < rowH.length; i += 1) {
      const h = rowH[i] * object.height;
      rows.push({ y, h });
      y += h;
    }
    return { cols, rows, colW, rowH };
  }

  function tableCellAt(object, r, c) {
    return object.cells && object.cells[r] ? object.cells[r][c] || null : null;
  }

  function tableOrigin(object, r, c) {
    const cell = tableCellAt(object, r, c);
    if (!cell) {
      return null;
    }
    if (cell.covered && cell.origin) {
      return { r: cell.origin.r, c: cell.origin.c };
    }
    return { r, c };
  }

  function tableCellRect(object, r, c) {
    const origin = tableOrigin(object, r, c);
    if (!origin) {
      return null;
    }
    const cell = tableCellAt(object, origin.r, origin.c);
    const layout = tableLayout(object);
    if (!layout.cols[origin.c] || !layout.rows[origin.r]) {
      return null;
    }
    const colspan = Math.max(1, cell.colspan || 1);
    const rowspan = Math.max(1, cell.rowspan || 1);
    let width = 0;
    let height = 0;
    for (let i = 0; i < colspan && origin.c + i < layout.cols.length; i += 1) {
      width += layout.cols[origin.c + i].w;
    }
    for (let i = 0; i < rowspan && origin.r + i < layout.rows.length; i += 1) {
      height += layout.rows[origin.r + i].h;
    }
    return {
      x: object.x + layout.cols[origin.c].x,
      y: object.y + layout.rows[origin.r].y,
      width,
      height,
      r: origin.r,
      c: origin.c,
    };
  }

  function hitTableCell(object, localPoint) {
    const layout = tableLayout(object);
    const lx = localPoint.x - object.x;
    const ly = localPoint.y - object.y;
    if (lx < -0.5 || ly < -0.5 || lx > object.width + 0.5 || ly > object.height + 0.5) {
      return null;
    }
    let col = layout.cols.length - 1;
    let row = layout.rows.length - 1;
    let x = 0;
    for (let i = 0; i < layout.cols.length; i += 1) {
      if (lx < x + layout.cols[i].w) {
        col = i;
        break;
      }
      x += layout.cols[i].w;
    }
    let y = 0;
    for (let i = 0; i < layout.rows.length; i += 1) {
      if (ly < y + layout.rows[i].h) {
        row = i;
        break;
      }
      y += layout.rows[i].h;
    }
    return tableOrigin(object, row, col);
  }

  function hitTableSplit(point) {
    const object = selectedTable();
    if (!object || state.editingId) {
      return null;
    }
    const local = objectLocalPoint(object, point);
    const layout = tableLayout(object);
    const lx = local.x - object.x;
    const ly = local.y - object.y;
    const tol = viewLen(TABLE_SPLIT_HIT);
    if (ly >= -tol && ly <= object.height + tol) {
      for (let i = 1; i < layout.cols.length; i += 1) {
        if (Math.abs(lx - layout.cols[i].x) <= tol) {
          return { kind: "col", index: i };
        }
      }
    }
    if (lx >= -tol && lx <= object.width + tol) {
      for (let i = 1; i < layout.rows.length; i += 1) {
        if (Math.abs(ly - layout.rows[i].y) <= tol) {
          return { kind: "row", index: i };
        }
      }
    }
    return null;
  }

  function getTableSelection() {
    const object = selectedTable();
    if (!object) {
      return null;
    }
    const rows = tableRowCount(object);
    const cols = tableColCount(object);
    let r1 = 0;
    let c1 = 0;
    let r2 = 0;
    let c2 = 0;
    if (state.tableRange && state.tableCell && state.tableCell.id === object.id) {
      r1 = Math.min(state.tableRange.r1, state.tableRange.r2);
      c1 = Math.min(state.tableRange.c1, state.tableRange.c2);
      r2 = Math.max(state.tableRange.r1, state.tableRange.r2);
      c2 = Math.max(state.tableRange.c1, state.tableRange.c2);
    } else if (state.tableCell && state.tableCell.id === object.id) {
      const origin = tableOrigin(object, state.tableCell.r, state.tableCell.c) || { r: 0, c: 0 };
      const cell = tableCellAt(object, origin.r, origin.c);
      r1 = origin.r;
      c1 = origin.c;
      r2 = origin.r + Math.max(1, (cell && cell.rowspan) || 1) - 1;
      c2 = origin.c + Math.max(1, (cell && cell.colspan) || 1) - 1;
    }
    return {
      object,
      r1: Math.max(0, Math.min(r1, rows - 1)),
      c1: Math.max(0, Math.min(c1, cols - 1)),
      r2: Math.max(0, Math.min(r2, rows - 1)),
      c2: Math.max(0, Math.min(c2, cols - 1)),
    };
  }

  function tableGhost(cell, rect) {
    return {
      type: "text",
      text: cell.text || "",
      color: cell.color,
      fontSize: cell.fontSize || 14,
      fontKey: cell.fontKey || "sans",
      bold: cell.bold,
      italic: cell.italic,
      underline: cell.underline,
      strike: cell.strike,
      align: cell.align || "left",
      lineHeight: 1.3,
      letterSpacing: 0,
      paragraphSpacing: 0,
      list: "none",
      indent: 0,
      pad: TABLE_PAD,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
  }

  function applyStyleToTableCell(cell) {
    cell.color = state.stroke;
    cell.fontSize = state.fontSize;
    cell.fontKey = state.fontKey;
    cell.bold = state.bold;
    cell.italic = state.italic;
    cell.underline = state.underline;
    cell.strike = state.strike;
    cell.align = state.align;
    if (state.fill) {
      cell.fill = state.fill;
    }
  }

  function loadStyleFromTableCell(cell) {
    state.fontSize = cell.fontSize || 14;
    state.fontKey = cell.fontKey || "sans";
    state.bold = Boolean(cell.bold);
    state.italic = Boolean(cell.italic);
    state.underline = Boolean(cell.underline);
    state.strike = Boolean(cell.strike);
    state.align = cell.align || "left";
    if (cell.color) {
      state.stroke = cell.color;
    }
    if (cell.fill) {
      state.fill = cell.fill;
    }
  }

  function unmergeTableCell(object, r, c) {
    const origin = tableOrigin(object, r, c);
    if (!origin) {
      return false;
    }
    const cell = tableCellAt(object, origin.r, origin.c);
    if (!cell) {
      return false;
    }
    const colspan = Math.max(1, cell.colspan || 1);
    const rowspan = Math.max(1, cell.rowspan || 1);
    if (colspan === 1 && rowspan === 1) {
      return false;
    }
    cell.colspan = 1;
    cell.rowspan = 1;
    for (let row = origin.r; row < origin.r + rowspan; row += 1) {
      for (let col = origin.c; col < origin.c + colspan; col += 1) {
        if (row === origin.r && col === origin.c) {
          continue;
        }
        object.cells[row][col] = createTableCell();
      }
    }
    return true;
  }

  function unmergeTableIntersects(object, r1, c1, r2, c2) {
    const seen = new Set();
    for (let r = r1; r <= r2; r += 1) {
      for (let c = c1; c <= c2; c += 1) {
        const origin = tableOrigin(object, r, c);
        if (!origin) {
          continue;
        }
        const key = `${origin.r},${origin.c}`;
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        unmergeTableCell(object, origin.r, origin.c);
      }
    }
  }

  function tableRangeToTsv(sel) {
    const lines = [];
    for (let r = sel.r1; r <= sel.r2; r += 1) {
      const row = [];
      for (let c = sel.c1; c <= sel.c2; c += 1) {
        const origin = tableOrigin(sel.object, r, c);
        const cell = origin ? tableCellAt(sel.object, origin.r, origin.c) : null;
        row.push(origin && origin.r === r && origin.c === c ? String(cell && cell.text ? cell.text : "") : "");
      }
      lines.push(row.join("\t"));
    }
    return lines.join("\n");
  }

  function pasteTsvIntoTable(object, startR, startC, tsv) {
    const rows = String(tsv).replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
    const maxR = tableRowCount(object);
    const maxC = tableColCount(object);
    for (let i = 0; i < rows.length; i += 1) {
      const parts = rows[i].split("\t");
      for (let j = 0; j < parts.length; j += 1) {
        const r = startR + i;
        const c = startC + j;
        if (r >= maxR || c >= maxC) {
          continue;
        }
        const origin = tableOrigin(object, r, c);
        const cell = origin ? tableCellAt(object, origin.r, origin.c) : null;
        if (cell && !cell.covered) {
          cell.text = parts[j];
        }
      }
    }
  }

  function createTableObject(x, y) {
    const cols = TABLE_DEFAULT_COLS;
    const rows = TABLE_DEFAULT_ROWS;
    const width = cols * 110;
    const height = rows * 36;
    return {
      id: createId(),
      type: "table",
      x,
      y,
      width,
      height,
      colW: Array.from({ length: cols }, () => 1 / cols),
      rowH: Array.from({ length: rows }, () => 1 / rows),
      cells: Array.from({ length: rows }, () => Array.from({ length: cols }, createTableCell)),
      stroke: state.stroke,
      size: Math.max(1, Math.min(state.size, 4)),
      rotation: 0,
    };
  }

  function assetSize(source) {
    return {
      width: source.naturalWidth || source.width || 1,
      height: source.naturalHeight || source.height || 1,
    };
  }

  function getImageAsset(imageId) {
    return imageAssets.get(imageId) || null;
  }

  function imageSourceRect(object, asset) {
    const size = assetSize(asset.source);
    const crop = object.crop;
    if (!crop) {
      return { sx: 0, sy: 0, sw: size.width, sh: size.height };
    }
    const sx = Math.min(size.width - 1, Math.max(0, crop.sx));
    const sy = Math.min(size.height - 1, Math.max(0, crop.sy));
    return {
      sx,
      sy,
      sw: Math.min(size.width - sx, Math.max(1, crop.sw)),
      sh: Math.min(size.height - sy, Math.max(1, crop.sh)),
    };
  }

  function imageFilter(object) {
    const parts = [];
    const brightness = (object.brightness || 0) / 100;
    const contrast = (object.contrast || 0) / 100;
    const saturation = (object.saturation || 0) / 100;
    if (brightness) {
      parts.push(`brightness(${1 + brightness})`);
    }
    if (contrast) {
      parts.push(`contrast(${1 + contrast})`);
    }
    if (saturation) {
      parts.push(`saturate(${Math.max(0, 1 + saturation)})`);
    }
    if (object.grayscale) {
      parts.push("grayscale(1)");
    }
    if (object.blur) {
      parts.push(`blur(${object.blur}px)`);
    }
    return parts.join(" ");
  }

  async function decodeImageBlob(blob) {
    if (typeof createImageBitmap === "function") {
      try {
        let bitmap = await createImageBitmap(blob);
        const pixels = bitmap.width * bitmap.height;
        if (pixels > MAX_IMAGE_PIXELS) {
          const scale = Math.sqrt(MAX_IMAGE_PIXELS / pixels);
          const resized = await createImageBitmap(bitmap, {
            resizeWidth: Math.max(1, Math.round(bitmap.width * scale)),
            resizeHeight: Math.max(1, Math.round(bitmap.height * scale)),
          });
          bitmap.close();
          bitmap = resized;
        }
        return bitmap;
      } catch (error) {
        console.error("Drawora: image bitmap decode failed.", error);
      }
    }

    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.decoding = "async";
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = url;
    });
    return image;
  }

  async function storeImageBlob(blob) {
    const source = await decodeImageBlob(blob);
    const size = assetSize(source);
    const id = `img${nextImageAssetId}`;
    nextImageAssetId += 1;
    imageAssets.set(id, { source, width: size.width, height: size.height });
    return id;
  }

  function fitImageBox(naturalWidth, naturalHeight, at) {
    const page = currentPage();
    const maxW = page ? page.width * 0.62 : 480;
    const maxH = page ? page.height * 0.62 : 480;
    const scale = Math.min(maxW / Math.max(naturalWidth, 1), maxH / Math.max(naturalHeight, 1), 1);
    const width = Math.max(MIN_IMAGE, naturalWidth * scale);
    const height = Math.max(MIN_IMAGE, naturalHeight * scale);
    const center = at || screenToWorld(viewportCenter());
    return {
      x: center.x - width / 2,
      y: center.y - height / 2,
      width,
      height,
    };
  }

  function makeImageObject(imageId, box) {
    const asset = getImageAsset(imageId);
    const size = asset ? { width: asset.width, height: asset.height } : { width: box.width, height: box.height };
    return {
      id: createId(),
      type: "image",
      imageId,
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      rotation: 0,
      crop: { sx: 0, sy: 0, sw: size.width, sh: size.height },
      flipX: false,
      flipY: false,
      opacity: 1,
      radius: 0,
      shadow: false,
      grayscale: false,
      brightness: 0,
      contrast: 0,
      saturation: 0,
      blur: 0,
      stroke: state.stroke,
      size: 0,
    };
  }

  async function insertImageFromBlob(blob, at) {
    if (!blob || (blob.type && !IMAGE_TYPES.test(blob.type) && !isImageFile(blob))) {
      return null;
    }

    finishOpenWork();
    try {
      const imageId = await storeImageBlob(blob);
      const asset = getImageAsset(imageId);
      const box = fitImageBox(asset.width, asset.height, at);
      captureBefore();
      const object = makeImageObject(imageId, box);
      state.objects.push(object);
      setTool("select");
      setSelection([object.id]);
      commitIfChanged();
      redraw();
      return object;
    } catch (error) {
      console.error("Drawora: could not insert image.", error);
      return null;
    }
  }

  function isImageFile(file) {
    if (!file) {
      return false;
    }
    if (file.type && IMAGE_TYPES.test(file.type)) {
      return true;
    }
    return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name || "");
  }

  function blobFromFile(file) {
    return isImageFile(file) ? file : null;
  }

  function filesFromDataTransfer(data) {
    if (!data) {
      return [];
    }
    return [...(data.files || [])].filter(isImageFile);
  }

  function clipboardImageBlob(event) {
    const items = event.clipboardData && event.clipboardData.items;
    if (!items) {
      return null;
    }
    for (const item of items) {
      if (item.type && IMAGE_TYPES.test(item.type)) {
        return item.getAsFile();
      }
    }
    const files = event.clipboardData && event.clipboardData.files;
    if (files) {
      for (const file of files) {
        const blob = blobFromFile(file);
        if (blob) {
          return blob;
        }
      }
    }
    return null;
  }

  function normalizeHex(color) {
    return color.trim().toLowerCase();
  }

  function rgbToHex(r, g, b) {
    return `#${[r, g, b]
      .map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0"))
      .join("")}`;
  }

  function createId() {
    const id = `o${state.nextId}`;
    state.nextId += 1;
    return id;
  }

  function createPageId() {
    const id = `p${state.nextPageId}`;
    state.nextPageId += 1;
    return id;
  }

  function clampPageSize(value, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return fallback;
    }
    return Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, Math.round(number)));
  }

  function pageDimensions(preset, orientation, customWidth, customHeight) {
    if (preset === "custom") {
      return {
        width: clampPageSize(customWidth, 794),
        height: clampPageSize(customHeight, 1123),
      };
    }

    const base = PAGE_PRESETS[preset] || PAGE_PRESETS.a4;
    if (orientation === "landscape") {
      return { width: base.height, height: base.width };
    }
    return { width: base.width, height: base.height };
  }

  function nextPageName() {
    let max = 0;
    for (const page of state.pages) {
      const match = /^Page (\d+)$/.exec(page.name);
      if (match) {
        max = Math.max(max, Number(match[1]));
      }
    }
    return `Page ${max + 1}`;
  }

  function uniqueCopyName(name) {
    const base = `${name} copy`;
    const names = new Set(state.pages.map((page) => page.name));
    if (!names.has(base)) {
      return base;
    }
    let index = 2;
    while (names.has(`${base} ${index}`)) {
      index += 1;
    }
    return `${base} ${index}`;
  }

  function defaultSurface(template) {
    const spec = PAGE_TEMPLATES[template] || PAGE_TEMPLATES.white;
    return { ...spec };
  }

  function normalizeSurface(surface) {
    const base = defaultSurface(surface && surface.template);
    if (!surface) {
      return base;
    }
    return {
      mode: surface.mode || base.mode,
      template: PAGE_TEMPLATES[surface.template] ? surface.template : base.template,
      paperColor: surface.paperColor || base.paperColor,
      lineColor: surface.lineColor || base.lineColor,
      lineSpacing: Math.min(160, Math.max(8, Number(surface.lineSpacing) || base.lineSpacing)),
      margin: Math.min(240, Math.max(0, Number(surface.margin ?? base.margin))),
      gridSize: Math.min(160, Math.max(8, Number(surface.gridSize) || base.gridSize)),
    };
  }

  function pageSurface(page) {
    return normalizeSurface(page && page.surface);
  }

  function hexLuminance(color) {
    const hex = normalizeHex(String(color || "#ffffff")).replace("#", "");
    if (hex.length !== 6) {
      return 1;
    }
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function makePage(options = {}) {
    const source = options.source || currentPage();
    const preset = options.preset || (source && source.preset) || "a4";
    const orientation = options.orientation || (source && source.orientation) || "portrait";
    const size = pageDimensions(
      preset,
      orientation,
      options.width || (source && source.width) || 794,
      options.height || (source && source.height) || 1123
    );
    return {
      id: options.id || createPageId(),
      name: options.name || nextPageName(),
      preset,
      orientation:
        preset === "custom"
          ? size.width >= size.height
            ? "landscape"
            : "portrait"
          : orientation,
      width: size.width,
      height: size.height,
      surface: normalizeSurface(options.surface || (source && source.surface) || defaultSurface("white")),
      objects: options.objects || [],
      guides: options.guides || (source && source.guides ? cloneData(source.guides) : []),
      zoom: options.zoom ?? 1,
      panX: options.panX ?? 0,
      panY: options.panY ?? 0,
    };
  }

  function currentPage() {
    return state.pages.find((page) => page.id === state.currentPageId) || state.pages[0] || null;
  }

  function currentPageIndex() {
    return state.pages.findIndex((page) => page.id === state.currentPageId);
  }

  function pageBounds() {
    const page = currentPage();
    if (!page) {
      return { x: 0, y: 0, width: 794, height: 1123 };
    }
    return { x: 0, y: 0, width: page.width, height: page.height };
  }

  function rememberCamera() {
    const page = currentPage();
    if (!page) {
      return;
    }
    page.zoom = state.zoom;
    page.panX = state.panX;
    page.panY = state.panY;
  }

  function applyPageCamera(page) {
    state.zoom = page.zoom;
    state.panX = page.panX;
    state.panY = page.panY;
  }

  function attachPage(page) {
    state.currentPageId = page.id;
    state.objects = page.objects;
    applyPageCamera(page);
  }

  function finishOpenWork() {
    if (state.editingId) {
      finishEditing();
    }
    if (state.active) {
      cancelActive();
    }
  }

  function cloneData(value) {
    return structuredClone(value);
  }

  function getScreenPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function screenToWorld(screen) {
    return {
      x: (screen.x - state.panX) / state.zoom,
      y: (screen.y - state.panY) / state.zoom,
    };
  }

  function worldToScreen(point) {
    return {
      x: point.x * state.zoom + state.panX,
      y: point.y * state.zoom + state.panY,
    };
  }

  function getPoint(event) {
    return screenToWorld(getScreenPoint(event));
  }

  function gridStep() {
    const page = currentPage();
    return pageSurface(page).gridSize;
  }

  function snapPoint(point) {
    if (!state.showGrid || !point) {
      return point;
    }
    const step = gridStep();
    return {
      x: Math.round(point.x / step) * step,
      y: Math.round(point.y / step) * step,
    };
  }

  function pageGuides() {
    const page = currentPage();
    if (!page) {
      return [];
    }
    if (!page.guides) {
      page.guides = [];
    }
    return page.guides;
  }

  function isOverlayTool(tool) {
    return tool === "laser" || tool === "measure" || tool === "protractor";
  }

  function isFrozenBlockedTool(tool) {
    return state.frozen && tool !== "pan" && tool !== "laser" && tool !== "select";
  }

  function actionAllowedWhenFrozen(action) {
    return (
      String(action).startsWith("zoom-") ||
      action === "toggle-grid" ||
      action === "toggle-rulers" ||
      action === "toggle-guides" ||
      action === "toggle-spotlight" ||
      action === "toggle-freeze" ||
      action === "fullscreen"
    );
  }

  function viewLen(pixels) {
    return pixels / state.zoom;
  }

  function viewportCenter() {
    return { x: canvas.clientWidth / 2, y: canvas.clientHeight / 2 };
  }

  function formatZoom() {
    const percent = state.zoom * 100;
    const rounded = percent >= 20 ? Math.round(percent) : Math.round(percent * 10) / 10;
    return `${rounded}%`;
  }

  function formatLength(px) {
    const cm = (px / 96) * 2.54;
    return `${cm.toFixed(1)} cm · ${Math.round(px)} px`;
  }

  function formatAngle(start, end) {
    let deg = (Math.atan2(start.y - end.y, end.x - start.x) * 180) / Math.PI;
    if (deg < 0) {
      deg += 360;
    }
    return `${Math.round(deg)}°`;
  }

  function syncViewUI() {
    const label = formatZoom();
    zoomLabel.textContent = label;
    zoomValue.textContent = label;
  }

  function refreshCameraOverlays() {
    if (state.editingId) {
      const object = findObject(state.editingId);
      if (isTextLike(object)) {
        positionEditor(object);
      } else if (isTable(object)) {
        positionEditor(object);
      }
    }
    syncViewUI();
  }

  function setZoomAt(nextZoom, screenPoint) {
    const screen = screenPoint || viewportCenter();
    const world = screenToWorld(screen);
    state.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
    state.panX = screen.x - world.x * state.zoom;
    state.panY = screen.y - world.y * state.zoom;
    refreshCameraOverlays();
    redraw();
  }

  function zoomBy(factor, screenPoint) {
    setZoomAt(state.zoom * factor, screenPoint);
  }

  function resetView() {
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    refreshCameraOverlays();
    redraw();
  }

  function fitToBounds(bounds) {
    const pad = 56;
    const vw = canvas.clientWidth;
    const vh = canvas.clientHeight;
    if (!bounds || (bounds.width < 1 && bounds.height < 1)) {
      resetView();
      return;
    }

    const width = Math.max(bounds.width, 1);
    const height = Math.max(bounds.height, 1);
    state.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min((vw - pad * 2) / width, (vh - pad * 2) / height)));
    state.panX = (vw - width * state.zoom) / 2 - bounds.x * state.zoom;
    state.panY = (vh - height * state.zoom) / 2 - bounds.y * state.zoom;
    refreshCameraOverlays();
    redraw();
  }

  function fitCanvas() {
    fitToBounds(pageBounds());
  }

  function fitSelection() {
    const selected = selectedObjects();
    if (selected.length === 0) {
      fitCanvas();
      return;
    }
    fitToBounds(unionBounds(selected.map((object) => objectWorldBounds(object))));
  }

  function distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
  }

  function selectedObjects() {
    return state.objects.filter((object) => state.selectedIds.includes(object.id));
  }

  function findObject(id) {
    return state.objects.find((object) => object.id === id);
  }

  function normalizedBounds(start, end, square) {
    let x2 = end.x;
    let y2 = end.y;

    if (square) {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const side = Math.max(Math.abs(dx), Math.abs(dy));
      x2 = start.x + Math.sign(dx || 1) * side;
      y2 = start.y + Math.sign(dy || 1) * side;
    }

    return {
      x: Math.min(start.x, x2),
      y: Math.min(start.y, y2),
      width: Math.abs(x2 - start.x),
      height: Math.abs(y2 - start.y),
    };
  }

  function makeShape(type, start, end, shift) {
    if (type === "line" || type === "arrow") {
      return {
        type,
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
        stroke: state.stroke,
        size: state.size,
        rotation: 0,
      };
    }

    const shape = {
      type,
      ...normalizedBounds(
        start,
        end,
        shift && (type === "ellipse" || POLYGON_SHAPES.includes(type))
      ),
      stroke: state.stroke,
      fill: state.fill,
      size: state.size,
      rotation: 0,
    };

    if (type === "roundrect") {
      shape.radius = ROUND_RECT_RADIUS;
    }

    return shape;
  }

  function isShapeMeaningful(shape) {
    if (shape.type === "line" || shape.type === "arrow") {
      return distance({ x: shape.x1, y: shape.y1 }, { x: shape.x2, y: shape.y2 }) >= MIN_SHAPE_SIZE;
    }

    return shape.width >= MIN_SHAPE_SIZE || shape.height >= MIN_SHAPE_SIZE;
  }

  function getLocalBounds(object) {
    if (object.type === "stroke") {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const point of object.points) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      }
      if (!object.points.length) {
        return { x: 0, y: 0, width: 0, height: 0 };
      }
      return {
        x: minX,
        y: minY,
        width: Math.max(maxX - minX, MIN_SHAPE_SIZE),
        height: Math.max(maxY - minY, MIN_SHAPE_SIZE),
      };
    }

    if (object.type === "line" || object.type === "arrow") {
      return {
        x: Math.min(object.x1, object.x2),
        y: Math.min(object.y1, object.y2),
        width: Math.max(Math.abs(object.x2 - object.x1), MIN_SHAPE_SIZE),
        height: Math.max(Math.abs(object.y2 - object.y1), MIN_SHAPE_SIZE),
      };
    }

    return {
      x: object.x,
      y: object.y,
      width: object.width,
      height: object.height,
    };
  }

  function getFrame(object) {
    const bounds = getLocalBounds(object);
    const pad = Math.max(6, (object.size || 4) / 2 + 2);
    return {
      x: bounds.x - pad,
      y: bounds.y - pad,
      width: Math.max(bounds.width + pad * 2, MIN_FRAME),
      height: Math.max(bounds.height + pad * 2, MIN_FRAME),
    };
  }

  function getCenterFromBounds(bounds) {
    return {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };
  }

  function getCenter(object) {
    return getCenterFromBounds(getLocalBounds(object));
  }

  function rotateAround(point, center, angle) {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos,
    };
  }

  function worldToLocal(point, center, rotation) {
    return rotateAround(point, center, -(rotation || 0));
  }

  function localToWorld(point, center, rotation) {
    return rotateAround(point, center, rotation || 0);
  }

  function handlePositions(frame, center, object) {
    const handles = {
      nw: { x: frame.x, y: frame.y },
      ne: { x: frame.x + frame.width, y: frame.y },
      sw: { x: frame.x, y: frame.y + frame.height },
      se: { x: frame.x + frame.width, y: frame.y + frame.height },
      rotate: { x: center.x, y: frame.y - viewLen(ROTATE_OFFSET) },
    };
    if (object && (isTextLike(object) || isTable(object))) {
      handles.e = { x: frame.x + frame.width, y: center.y };
      handles.w = { x: frame.x, y: center.y };
    }
    if (object && isTable(object)) {
      handles.n = { x: center.x, y: frame.y };
      handles.s = { x: center.x, y: frame.y + frame.height };
    }
    if (object && isImage(object) && state.cropping) {
      handles.n = { x: center.x, y: frame.y };
      handles.s = { x: center.x, y: frame.y + frame.height };
      handles.e = { x: frame.x + frame.width, y: center.y };
      handles.w = { x: frame.x, y: center.y };
    }
    return handles;
  }

  function configureStroke(stroke) {
    const tool = stroke.tool || "pen";
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "#000000";
      ctx.fillStyle = "#000000";
      ctx.globalAlpha = 1;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      return;
    }

    ctx.globalCompositeOperation = tool === "highlighter" ? "multiply" : "source-over";
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    if (tool === "pencil") {
      ctx.globalAlpha = 0.92;
      ctx.lineWidth = Math.max(1, stroke.size * 0.65);
      ctx.lineCap = "round";
    } else if (tool === "brush") {
      ctx.globalAlpha = 0.42;
      ctx.lineWidth = stroke.size * 2.2;
      ctx.lineCap = "round";
    } else if (tool === "marker") {
      ctx.globalAlpha = 0.92;
      ctx.lineWidth = stroke.size * 1.45;
      ctx.lineCap = "square";
    } else if (tool === "highlighter") {
      ctx.globalAlpha = 0.38;
      ctx.lineWidth = stroke.size * 3.4;
      ctx.lineCap = "butt";
    } else if (tool === "spray") {
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = Math.max(1.5, stroke.size * 0.35);
      ctx.lineCap = "round";
    } else {
      ctx.globalAlpha = 1;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = "round";
    }
    ctx.lineJoin = "round";
  }

  function strokeNeedsRedraw(stroke) {
    const tool = stroke && stroke.tool;
    return tool === "brush" || tool === "highlighter" || tool === "spray";
  }

  function configureShape(shape) {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.strokeStyle = shape.stroke;
    ctx.fillStyle = shape.fill || "transparent";
    ctx.lineWidth = shape.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  function paintClosedPath(shape) {
    if (shape.fill) {
      ctx.fill();
    }
    ctx.stroke();
  }

  function drawDot(stroke, point) {
    ctx.save();
    configureStroke(stroke);
    ctx.beginPath();
    const radius = (stroke.tool === "spray" ? Math.max(1.2, stroke.size * 0.22) : ctx.lineWidth) / 2;
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawStroke(stroke) {
    const points = stroke.points;
    if (points.length === 0) {
      return;
    }

    if (stroke.tool === "spray") {
      for (const point of points) {
        drawDot(stroke, point);
      }
      return;
    }

    if (points.length === 1) {
      drawDot(stroke, points[0]);
      return;
    }

    ctx.save();
    configureStroke(stroke);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function pathRoundRect(x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(x, y, width, height, r);
      return;
    }

    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function drawLine(shape) {
    ctx.save();
    configureShape(shape);
    ctx.beginPath();
    ctx.moveTo(shape.x1, shape.y1);
    ctx.lineTo(shape.x2, shape.y2);
    ctx.stroke();
    ctx.restore();
  }

  function drawRect(shape) {
    ctx.save();
    configureShape(shape);
    ctx.beginPath();
    ctx.rect(shape.x, shape.y, shape.width, shape.height);
    paintClosedPath(shape);
    ctx.restore();
  }

  function drawRoundRect(shape) {
    ctx.save();
    configureShape(shape);
    pathRoundRect(shape.x, shape.y, shape.width, shape.height, shape.radius);
    paintClosedPath(shape);
    ctx.restore();
  }

  function drawEllipse(shape) {
    if (shape.width < 0.5 || shape.height < 0.5) {
      return;
    }

    ctx.save();
    configureShape(shape);
    ctx.beginPath();
    ctx.ellipse(
      shape.x + shape.width / 2,
      shape.y + shape.height / 2,
      shape.width / 2,
      shape.height / 2,
      0,
      0,
      Math.PI * 2
    );
    paintClosedPath(shape);
    ctx.restore();
  }

  function regularPolygonPoints(shape, sides) {
    const cx = shape.x + shape.width / 2;
    const cy = shape.y + shape.height / 2;
    const rx = shape.width / 2;
    const ry = shape.height / 2;
    const points = [];
    for (let i = 0; i < sides; i += 1) {
      const angle = -Math.PI / 2 + (i * Math.PI * 2) / sides;
      points.push({
        x: cx + rx * Math.cos(angle),
        y: cy + ry * Math.sin(angle),
      });
    }
    return points;
  }

  function diamondPoints(shape) {
    const cx = shape.x + shape.width / 2;
    const cy = shape.y + shape.height / 2;
    return [
      { x: cx, y: shape.y },
      { x: shape.x + shape.width, y: cy },
      { x: cx, y: shape.y + shape.height },
      { x: shape.x, y: cy },
    ];
  }

  function starPoints(shape) {
    const cx = shape.x + shape.width / 2;
    const cy = shape.y + shape.height / 2;
    const rx = shape.width / 2;
    const ry = shape.height / 2;
    const points = [];
    for (let i = 0; i < 10; i += 1) {
      const r = i % 2 === 0 ? 1 : 0.4;
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      points.push({
        x: cx + rx * r * Math.cos(angle),
        y: cy + ry * r * Math.sin(angle),
      });
    }
    return points;
  }

  function polygonPoints(shape) {
    if (shape.type === "triangle") {
      return trianglePoints(shape);
    }
    if (shape.type === "diamond") {
      return diamondPoints(shape);
    }
    if (shape.type === "pentagon") {
      return regularPolygonPoints(shape, 5);
    }
    if (shape.type === "hexagon") {
      return regularPolygonPoints(shape, 6);
    }
    if (shape.type === "star") {
      return starPoints(shape);
    }
    return null;
  }

  function pointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
      const a = polygon[i];
      const b = polygon[j];
      const intersect =
        a.y > point.y !== b.y > point.y &&
        point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y || Number.EPSILON) + a.x;
      if (intersect) {
        inside = !inside;
      }
    }
    return inside;
  }

  function drawPolygon(shape, points) {
    if (!points || points.length < 2) {
      return;
    }
    ctx.save();
    configureShape(shape);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    paintClosedPath(shape);
    ctx.restore();
  }

  function trianglePoints(shape) {
    return [
      { x: shape.x + shape.width / 2, y: shape.y },
      { x: shape.x, y: shape.y + shape.height },
      { x: shape.x + shape.width, y: shape.y + shape.height },
    ];
  }

  function drawTriangle(shape) {
    const [a, b, c] = trianglePoints(shape);
    ctx.save();
    configureShape(shape);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.closePath();
    paintClosedPath(shape);
    ctx.restore();
  }

  function arrowHeadPoints(shape) {
    const dx = shape.x2 - shape.x1;
    const dy = shape.y2 - shape.y1;
    const length = Math.hypot(dx, dy);
    if (length === 0) {
      return null;
    }

    const angle = Math.atan2(dy, dx);
    const headLength = Math.min(Math.max(12, shape.size * 4), length * 0.45);
    const headWidth = headLength * 0.55;
    return {
      angle,
      headLength,
      shaft: {
        x: shape.x2 - Math.cos(angle) * headLength,
        y: shape.y2 - Math.sin(angle) * headLength,
      },
      tip: { x: shape.x2, y: shape.y2 },
      left: {
        x: shape.x2 - Math.cos(angle) * headLength + Math.sin(angle) * headWidth,
        y: shape.y2 - Math.sin(angle) * headLength - Math.cos(angle) * headWidth,
      },
      right: {
        x: shape.x2 - Math.cos(angle) * headLength - Math.sin(angle) * headWidth,
        y: shape.y2 - Math.sin(angle) * headLength + Math.cos(angle) * headWidth,
      },
    };
  }

  function drawArrow(shape) {
    const head = arrowHeadPoints(shape);
    if (!head) {
      return;
    }

    ctx.save();
    configureShape(shape);
    ctx.beginPath();
    ctx.moveTo(shape.x1, shape.y1);
    ctx.lineTo(head.shaft.x, head.shaft.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(head.tip.x, head.tip.y);
    ctx.lineTo(head.left.x, head.left.y);
    ctx.lineTo(head.right.x, head.right.y);
    ctx.closePath();
    ctx.fillStyle = shape.stroke;
    ctx.fill();
    ctx.restore();
  }

  function objectFontFamily(object) {
    return FONT_STACKS[object && object.fontKey] || FONT_FAMILY;
  }

  function objectFont(object) {
    const italic = object.italic ? "italic " : "";
    const weight = object.bold ? "700 " : "400 ";
    const size = object.fontSize || 24;
    return `${italic}${weight}${size}px ${objectFontFamily(object)}`;
  }

  function applyTextMeasure(object) {
    ctx.font = objectFont(object);
    if ("letterSpacing" in ctx) {
      ctx.letterSpacing = `${object.letterSpacing || 0}px`;
    }
  }

  function textIndentWidth(object) {
    const indent = Math.max(0, object.indent || 0) * INDENT_STEP;
    const list = object.list && object.list !== "none" ? LIST_GUTTER : 0;
    return indent + list;
  }

  function textPad(object) {
    return object && object.pad != null ? object.pad : TEXT_PAD;
  }

  function textMaxWidth(object) {
    return Math.max(12, object.width - textPad(object) * 2 - textIndentWidth(object));
  }

  function wrapTextLayout(object) {
    applyTextMeasure(object);
    const maxWidth = textMaxWidth(object);
    const lines = [];
    const paragraphs = String(object.text || "").split("\n");
    let number = 0;

    function breakLongWord(word) {
      if (ctx.measureText(word).width <= maxWidth) {
        return [word];
      }
      const chunks = [];
      let chunk = "";
      for (const char of word) {
        const next = chunk + char;
        if (chunk && ctx.measureText(next).width > maxWidth) {
          chunks.push(chunk);
          chunk = char;
        } else {
          chunk = next;
        }
      }
      if (chunk) {
        chunks.push(chunk);
      }
      return chunks.length ? chunks : [word];
    }

    for (let paraIndex = 0; paraIndex < paragraphs.length; paraIndex += 1) {
      const paragraph = paragraphs[paraIndex];
      let marker = "";
      if (object.list === "bullet") {
        marker = "•";
      } else if (object.list === "number" && paragraph !== "") {
        number += 1;
        marker = `${number}.`;
      }

      if (paragraph === "") {
        lines.push({ text: "", paraIndex, first: true, marker });
        continue;
      }

      const words = paragraph.split(" ");
      let line = "";
      let first = true;
      for (const word of words) {
        const pieces = breakLongWord(word);
        for (let i = 0; i < pieces.length; i += 1) {
          const piece = pieces[i];
          const glued = i > 0;
          const next = line && !glued ? `${line} ${piece}` : line + piece;
          if (line && ctx.measureText(next).width > maxWidth) {
            lines.push({ text: line, paraIndex, first, marker: first ? marker : "" });
            line = piece;
            first = false;
          } else {
            line = next;
          }
        }
      }
      lines.push({ text: line, paraIndex, first, marker: first ? marker : "" });
    }

    if ("letterSpacing" in ctx) {
      ctx.letterSpacing = "0px";
    }
    return lines;
  }

  function textLineHeight(object) {
    return (object.fontSize || 24) * (object.lineHeight || 1.35);
  }

  function textContentHeight(object) {
    const lines = wrapTextLayout(object);
    const lineHeight = textLineHeight(object);
    const paraGap = object.paragraphSpacing || 0;
    let height = textPad(object) * 2;
    let lastPara = -1;
    for (const line of lines) {
      if (lastPara !== -1 && line.paraIndex !== lastPara) {
        height += paraGap;
      }
      height += lineHeight;
      lastPara = line.paraIndex;
    }
    const minHeight = object.type === "sticky" ? STICKY_DEFAULT.height : 40;
    return Math.max(minHeight, height);
  }

  function reflowTextHeight(object) {
    if (!isTextLike(object)) {
      return;
    }
    object.height = textContentHeight(object);
  }

  function textLineX(object) {
    const pad = textPad(object);
    const left = object.x + pad + textIndentWidth(object);
    if (object.align === "center") {
      return object.x + (object.width + textIndentWidth(object)) / 2;
    }
    if (object.align === "right") {
      return object.x + object.width - pad;
    }
    return left;
  }

  function drawTextDecorations(object, text, x, y, align) {
    if (!object.underline && !object.strike) {
      return;
    }
    applyTextMeasure(object);
    const width = ctx.measureText(text).width;
    let left = x;
    if (align === "center") {
      left = x - width / 2;
    } else if (align === "right") {
      left = x - width;
    }
    const size = object.fontSize || 24;
    ctx.strokeStyle = object.color || "#1c1917";
    ctx.lineWidth = Math.max(1, size / 16);
    ctx.beginPath();
    if (object.underline) {
      const uy = y + size * 0.92;
      ctx.moveTo(left, uy);
      ctx.lineTo(left + width, uy);
    }
    if (object.strike) {
      const sy = y + size * 0.52;
      ctx.moveTo(left, sy);
      ctx.lineTo(left + width, sy);
    }
    ctx.stroke();
  }

  function drawWrappedText(object) {
    const lines = wrapTextLayout(object);
    const lineHeight = textLineHeight(object);
    const paraGap = object.paragraphSpacing || 0;
    const align = object.align || "left";

    ctx.save();
    ctx.beginPath();
    ctx.rect(object.x, object.y, object.width, object.height);
    ctx.clip();
    applyTextMeasure(object);
    ctx.fillStyle = object.color || "#1c1917";
    ctx.textAlign = align;
    ctx.textBaseline = "top";

    const markerX = object.x + textPad(object) + (object.indent || 0) * INDENT_STEP;
    let y = object.y + textPad(object);
    let lastPara = -1;
    for (const line of lines) {
      if (lastPara !== -1 && line.paraIndex !== lastPara) {
        y += paraGap;
      }
      if (line.marker) {
        ctx.textAlign = "left";
        ctx.fillText(line.marker, markerX, y);
        ctx.textAlign = align;
      }
      ctx.fillText(line.text, textLineX(object), y);
      drawTextDecorations(object, line.text, textLineX(object), y, align);
      y += lineHeight;
      lastPara = line.paraIndex;
      if (y > object.y + object.height) {
        break;
      }
    }
    ctx.restore();
    if ("letterSpacing" in ctx) {
      ctx.letterSpacing = "0px";
    }
  }

  function drawSticky(object) {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = object.fill || STICKY_FILL;
    ctx.strokeStyle = "rgb(28 25 23 / 0.08)";
    ctx.lineWidth = 1;
    pathRoundRect(object.x, object.y, object.width, object.height, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    if (state.editingId !== object.id) {
      drawWrappedText(object);
    }
  }

  function drawTextBox(object) {
    if (state.editingId === object.id) {
      return;
    }

    if (object.textBack) {
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = object.textBack;
      ctx.fillRect(object.x, object.y, object.width, object.height);
      ctx.restore();
    }

    drawWrappedText(object);
  }

  function drawShape(shape) {
    switch (shape.type) {
      case "line":
        drawLine(shape);
        break;
      case "rect":
        drawRect(shape);
        break;
      case "roundrect":
        drawRoundRect(shape);
        break;
      case "ellipse":
        drawEllipse(shape);
        break;
      case "triangle":
        drawTriangle(shape);
        break;
      case "diamond":
      case "pentagon":
      case "hexagon":
      case "star":
        drawPolygon(shape, polygonPoints(shape));
        break;
      case "arrow":
        drawArrow(shape);
        break;
      default:
        break;
    }
  }

  function drawPicture(object) {
    const asset = getImageAsset(object.imageId);
    if (!asset) {
      ctx.save();
      ctx.fillStyle = "rgb(28 25 23 / 0.08)";
      ctx.fillRect(object.x, object.y, object.width, object.height);
      ctx.restore();
      return;
    }

    const source = imageSourceRect(object, asset);
    const filter = imageFilter(object);
    const radius = Math.max(0, object.radius || 0);
    const opacity = Math.min(1, Math.max(0, object.opacity == null ? 1 : object.opacity));
    const cropping = state.cropping && state.selectedIds.length === 1 && state.selectedIds[0] === object.id;
    const scaleX = object.width / source.sw;
    const scaleY = object.height / source.sh;
    const full = {
      x: object.x - source.sx * scaleX,
      y: object.y - source.sy * scaleY,
      width: asset.width * scaleX,
      height: asset.height * scaleY,
    };

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = opacity;

    if (cropping) {
      ctx.save();
      ctx.globalAlpha = opacity * 0.35;
      if (filter) {
        ctx.filter = filter;
      }
      ctx.drawImage(asset.source, 0, 0, asset.width, asset.height, full.x, full.y, full.width, full.height);
      ctx.restore();
    }

    if (object.shadow) {
      ctx.save();
      ctx.shadowColor = "rgb(28 25 23 / 0.35)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = "rgb(28 25 23 / 0.2)";
      if (radius > 0) {
        pathRoundRect(object.x, object.y, object.width, object.height, radius);
      } else {
        ctx.beginPath();
        ctx.rect(object.x, object.y, object.width, object.height);
      }
      ctx.fill();
      ctx.restore();
    }
    if (filter) {
      ctx.filter = filter;
    }

    ctx.beginPath();
    if (radius > 0) {
      pathRoundRect(object.x, object.y, object.width, object.height, radius);
    } else {
      ctx.rect(object.x, object.y, object.width, object.height);
    }
    ctx.clip();

    const cx = object.x + object.width / 2;
    const cy = object.y + object.height / 2;
    ctx.translate(cx, cy);
    ctx.scale(object.flipX ? -1 : 1, object.flipY ? -1 : 1);
    ctx.translate(-cx, -cy);
    ctx.drawImage(
      asset.source,
      source.sx,
      source.sy,
      source.sw,
      source.sh,
      object.x,
      object.y,
      object.width,
      object.height
    );
    ctx.restore();

    if (object.size > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = object.stroke || "#1c1917";
      ctx.lineWidth = object.size;
      if (radius > 0) {
        pathRoundRect(object.x, object.y, object.width, object.height, radius);
      } else {
        ctx.beginPath();
        ctx.rect(object.x, object.y, object.width, object.height);
      }
      ctx.stroke();
      ctx.restore();
    }

    if (cropping) {
      ctx.save();
      ctx.strokeStyle = SELECT_COLOR;
      ctx.lineWidth = viewLen(1);
      ctx.setLineDash([viewLen(4), viewLen(3)]);
      ctx.strokeRect(full.x, full.y, full.width, full.height);
      ctx.restore();
    }
  }

  function drawLink(object) {
    const pad = 10;
    const radius = Math.min(12, object.height / 2);
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = object.textBack || "rgb(204 251 241 / 0.85)";
    ctx.strokeStyle = object.color || SELECT_COLOR;
    ctx.lineWidth = Math.max(1, object.size || 2);
    pathRoundRect(object.x, object.y, object.width, object.height, radius);
    ctx.fill();
    ctx.stroke();

    applyTextMeasure({ ...object, fontSize: object.fontSize || 16 });
    ctx.fillStyle = object.color || SELECT_COLOR;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.beginPath();
    ctx.rect(object.x + pad, object.y, object.width - pad * 2, object.height);
    ctx.clip();
    const label = object.text || object.href || "Link";
    ctx.fillText(label, object.x + pad, object.y + object.height / 2);
    const textWidth = Math.min(ctx.measureText(label).width, object.width - pad * 2);
    ctx.beginPath();
    ctx.moveTo(object.x + pad, object.y + object.height / 2 + (object.fontSize || 16) * 0.45);
    ctx.lineTo(object.x + pad + textWidth, object.y + object.height / 2 + (object.fontSize || 16) * 0.45);
    ctx.strokeStyle = object.color || SELECT_COLOR;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    if ("letterSpacing" in ctx) {
      ctx.letterSpacing = "0px";
    }
  }

  function drawTable(object) {
    const layout = tableLayout(object);
    const editing =
      state.editingId === object.id && state.editingCell
        ? state.editingCell
        : null;
    const sel = selectedTable() === object && !editing ? getTableSelection() : null;

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(object.x, object.y, object.width, object.height);

    for (let r = 0; r < object.cells.length; r += 1) {
      for (let c = 0; c < object.cells[r].length; c += 1) {
        const cell = object.cells[r][c];
        if (!cell || cell.covered) {
          continue;
        }
        const rect = tableCellRect(object, r, c);
        if (!rect) {
          continue;
        }
        if (cell.fill) {
          ctx.fillStyle = cell.fill;
          ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        }
        if (sel && r <= sel.r2 && r + Math.max(1, cell.rowspan || 1) - 1 >= sel.r1 && c <= sel.c2 && c + Math.max(1, cell.colspan || 1) - 1 >= sel.c1) {
          ctx.fillStyle = "rgb(15 118 110 / 0.14)";
          ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        }
      }
    }

    ctx.strokeStyle = object.stroke || "#1c1917";
    ctx.lineWidth = Math.max(0.75, object.size || 1);
    ctx.beginPath();
    ctx.rect(object.x, object.y, object.width, object.height);
    for (let i = 1; i < layout.cols.length; i += 1) {
      const x = object.x + layout.cols[i].x;
      let y = object.y;
      for (let r = 0; r < layout.rows.length; r += 1) {
        const origin = tableOrigin(object, r, i);
        const skip = origin && origin.c < i;
        const nextY = object.y + layout.rows[r].y + layout.rows[r].h;
        if (!skip) {
          ctx.moveTo(x, y);
          ctx.lineTo(x, nextY);
        }
        y = nextY;
      }
    }
    for (let i = 1; i < layout.rows.length; i += 1) {
      const y = object.y + layout.rows[i].y;
      let x = object.x;
      for (let c = 0; c < layout.cols.length; c += 1) {
        const origin = tableOrigin(object, i, c);
        const skip = origin && origin.r < i;
        const nextX = object.x + layout.cols[c].x + layout.cols[c].w;
        if (!skip) {
          ctx.moveTo(x, y);
          ctx.lineTo(nextX, y);
        }
        x = nextX;
      }
    }
    ctx.stroke();

    for (let r = 0; r < object.cells.length; r += 1) {
      for (let c = 0; c < object.cells[r].length; c += 1) {
        const cell = object.cells[r][c];
        if (!cell || cell.covered) {
          continue;
        }
        if (editing && editing.r === r && editing.c === c) {
          continue;
        }
        const rect = tableCellRect(object, r, c);
        if (!rect || !(cell.text || "").length) {
          continue;
        }
        drawWrappedText(tableGhost(cell, rect));
      }
    }
    ctx.restore();
  }

  function drawObjectUnrotated(object) {
    if (object.type === "stroke") {
      drawStroke(object);
      return;
    }

    if (object.type === "sticky") {
      drawSticky(object);
      return;
    }

    if (object.type === "text") {
      drawTextBox(object);
      return;
    }

    if (object.type === "image") {
      drawPicture(object);
      return;
    }

    if (object.type === "link") {
      drawLink(object);
      return;
    }

    if (object.type === "table") {
      drawTable(object);
      return;
    }

    drawShape(object);
  }

  function drawObject(object) {
    const rotation = object.rotation || 0;
    const flipX = !isImage(object) && object.flipX;
    const flipY = !isImage(object) && object.flipY;
    if (!rotation && !flipX && !flipY) {
      drawObjectUnrotated(object);
      return;
    }

    const center = getCenter(object);
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    ctx.translate(-center.x, -center.y);
    drawObjectUnrotated(object);
    ctx.restore();
  }

  function drawHandleBox(x, y) {
    const half = viewLen(HANDLE_SIZE) / 2;
    ctx.beginPath();
    ctx.rect(x - half, y - half, half * 2, half * 2);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = SELECT_COLOR;
    ctx.lineWidth = viewLen(1.25);
    ctx.fill();
    ctx.stroke();
  }

  function drawHandleCircle(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, viewLen(HANDLE_SIZE) / 2 + viewLen(1), 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = SELECT_COLOR;
    ctx.lineWidth = viewLen(1.25);
    ctx.fill();
    ctx.stroke();
  }

  function drawSingleSelection(object) {
    const frame = getFrame(object);
    const bounds = getLocalBounds(object);
    const center = getCenterFromBounds(bounds);
    const rotation = object.rotation || 0;
    const handles = handlePositions(frame, center, object);

    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);
    ctx.translate(-center.x, -center.y);

    ctx.strokeStyle = SELECT_COLOR;
    ctx.lineWidth = viewLen(1);
    ctx.setLineDash([viewLen(5), viewLen(4)]);
    ctx.strokeRect(frame.x, frame.y, frame.width, frame.height);
    ctx.setLineDash([]);

    if (!(isImage(object) && state.cropping)) {
      ctx.beginPath();
      ctx.moveTo(handles.rotate.x, frame.y);
      ctx.lineTo(handles.rotate.x, handles.rotate.y);
      ctx.stroke();
      drawHandleCircle(handles.rotate.x, handles.rotate.y);
    }

    drawHandleBox(handles.nw.x, handles.nw.y);
    drawHandleBox(handles.ne.x, handles.ne.y);
    drawHandleBox(handles.sw.x, handles.sw.y);
    drawHandleBox(handles.se.x, handles.se.y);
    if (handles.e) {
      drawHandleBox(handles.e.x, handles.e.y);
      drawHandleBox(handles.w.x, handles.w.y);
    }
    if (handles.n) {
      drawHandleBox(handles.n.x, handles.n.y);
      drawHandleBox(handles.s.x, handles.s.y);
    }
    ctx.restore();
  }

  function worldCorners(object) {
    const frame = getFrame(object);
    const center = getCenter(object);
    const rotation = object.rotation || 0;
    return [
      { x: frame.x, y: frame.y },
      { x: frame.x + frame.width, y: frame.y },
      { x: frame.x + frame.width, y: frame.y + frame.height },
      { x: frame.x, y: frame.y + frame.height },
    ].map((point) => localToWorld(point, center, rotation));
  }

  function objectWorldBounds(object) {
    const corners = worldCorners(object);
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const corner of corners) {
      minX = Math.min(minX, corner.x);
      minY = Math.min(minY, corner.y);
      maxX = Math.max(maxX, corner.x);
      maxY = Math.max(maxY, corner.y);
    }
    return {
      x: minX,
      y: minY,
      width: Math.max(maxX - minX, 0),
      height: Math.max(maxY - minY, 0),
    };
  }

  function boundsIntersect(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  function unionBounds(list) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const bounds of list) {
      minX = Math.min(minX, bounds.x);
      minY = Math.min(minY, bounds.y);
      maxX = Math.max(maxX, bounds.x + bounds.width);
      maxY = Math.max(maxY, bounds.y + bounds.height);
    }
    return {
      x: minX,
      y: minY,
      width: Math.max(maxX - minX, 0),
      height: Math.max(maxY - minY, 0),
    };
  }

  function drawGroupSelection(objects) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const object of objects) {
      for (const corner of worldCorners(object)) {
        minX = Math.min(minX, corner.x);
        minY = Math.min(minY, corner.y);
        maxX = Math.max(maxX, corner.x);
        maxY = Math.max(maxY, corner.y);
      }
    }

    if (!Number.isFinite(minX)) {
      return;
    }

    ctx.save();
    ctx.strokeStyle = SELECT_COLOR;
    ctx.lineWidth = viewLen(1);
    ctx.setLineDash([viewLen(5), viewLen(4)]);
    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
    ctx.restore();
  }

  function drawSelectionOverlay() {
    if (state.editingId) {
      return;
    }

    const selected = selectedObjects();
    if (selected.length === 1) {
      drawSingleSelection(selected[0]);
      return;
    }

    if (selected.length > 1) {
      drawGroupSelection(selected);
    }
  }

  function strokePatternLine(target, x1, y1, x2, y2) {
    target.beginPath();
    target.moveTo(x1, y1);
    target.lineTo(x2, y2);
    target.stroke();
  }

  function drawGridLines(target, width, height, size, color, lineWidth, emphasis) {
    target.save();
    target.strokeStyle = color;
    target.lineWidth = lineWidth;
    for (let x = size; x < width; x += size) {
      if (emphasis && Math.round(x / size) % 5 === 0) {
        continue;
      }
      strokePatternLine(target, x, 0, x, height);
    }
    for (let y = size; y < height; y += size) {
      if (emphasis && Math.round(y / size) % 5 === 0) {
        continue;
      }
      strokePatternLine(target, 0, y, width, y);
    }
    if (emphasis) {
      target.lineWidth = lineWidth * 1.8;
      target.strokeStyle = color;
      for (let x = size * 5; x < width; x += size * 5) {
        strokePatternLine(target, x, 0, x, height);
      }
      for (let y = size * 5; y < height; y += size * 5) {
        strokePatternLine(target, 0, y, width, y);
      }
    }
    target.restore();
  }

  function drawRuledLines(target, width, height, spacing, margin, color, lineWidth, dashedMid) {
    target.save();
    target.strokeStyle = color;
    target.lineWidth = lineWidth;
    const top = spacing * 0.6;
    for (let y = top; y < height - 8; y += spacing) {
      if (dashedMid) {
        target.setLineDash([]);
        strokePatternLine(target, 0, y, width, y);
        target.setLineDash([Math.max(lineWidth * 4, 6), Math.max(lineWidth * 3, 5)]);
        strokePatternLine(target, 0, y + spacing / 2, width, y + spacing / 2);
        target.setLineDash([]);
        strokePatternLine(target, 0, y + spacing, width, y + spacing);
        y += spacing * 0.45;
      } else {
        strokePatternLine(target, 0, y, width, y);
      }
    }
    if (margin > 0) {
      target.setLineDash([]);
      target.strokeStyle = hexLuminance(color) < 0.4 ? "rgb(252 165 165 / 0.7)" : "#e11d48";
      strokePatternLine(target, margin, 0, margin, height);
    }
    target.restore();
  }

  function drawDotGrid(target, width, height, size, color, radius) {
    target.save();
    target.fillStyle = color;
    const r = Math.max(radius, 0.8);
    for (let x = size; x < width; x += size) {
      for (let y = size; y < height; y += size) {
        target.fillRect(x - r, y - r, r * 2, r * 2);
      }
    }
    target.restore();
  }

  function drawPagePattern(target, width, height, surface, unit) {
    const lineWidth = unit(1);
    const spacing = surface.lineSpacing;
    const grid = surface.gridSize;
    const margin = surface.margin;
    const color = surface.lineColor;

    if (surface.template === "presentation") {
      target.fillStyle = color;
      target.fillRect(0, 0, width, 40);
      return;
    }

    if (surface.template === "dark" || surface.template === "grid" || surface.template === "graph") {
      drawGridLines(target, width, height, grid, color, lineWidth, false);
      return;
    }

    if (surface.template === "math") {
      drawGridLines(target, width, height, grid, color, lineWidth, true);
      return;
    }

    if (surface.template === "dotted") {
      drawDotGrid(target, width, height, grid, color, unit(1.2));
      return;
    }

    if (surface.template === "ruled" || surface.template === "narrow-ruled" || surface.template === "wide-ruled") {
      drawRuledLines(target, width, height, spacing, margin, color, lineWidth, false);
      return;
    }

    if (surface.template === "handwriting") {
      drawRuledLines(target, width, height, spacing, margin, color, lineWidth, true);
    }
  }

  function drawPageSheet() {
    const page = currentPage();
    if (!page) {
      return;
    }

    const surface = pageSurface(page);

    ctx.save();
    ctx.shadowColor = "rgb(28 25 23 / 0.16)";
    ctx.shadowBlur = viewLen(18);
    ctx.shadowOffsetY = viewLen(4);
    ctx.fillStyle = surface.paperColor;
    ctx.fillRect(0, 0, page.width, page.height);
    ctx.shadowColor = "transparent";
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, page.width, page.height);
    ctx.clip();
    drawPagePattern(ctx, page.width, page.height, surface, viewLen);
    ctx.restore();
    ctx.strokeStyle = hexLuminance(surface.paperColor) < 0.35 ? "rgb(255 255 255 / 0.14)" : "rgb(28 25 23 / 0.1)";
    ctx.lineWidth = viewLen(1);
    ctx.strokeRect(0, 0, page.width, page.height);
    ctx.restore();
  }

  function redraw() {
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#e4dfd6";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.setTransform(
      state.dpr * state.zoom,
      0,
      0,
      state.dpr * state.zoom,
      state.panX * state.dpr,
      state.panY * state.dpr
    );

    drawPageSheet();
    drawGridOverlay();

    for (const object of state.objects) {
      drawObject(object);
    }

    if (state.preview) {
      drawShape(state.preview);
    }

    if (state.active && state.active.kind === "marquee") {
      drawMarquee(normalizedBounds(state.active.start, state.active.point));
    }

    if (state.active && state.active.kind === "lasso") {
      drawLasso(state.active.points);
    }

    drawGuides();
    drawMeasureOverlay();
    drawSelectionOverlay();
    drawScreenTeaching();
    paintCurrentPageThumb();
  }

  function drawMarquee(bounds) {
    if (bounds.width < 1 && bounds.height < 1) {
      return;
    }

    ctx.save();
    ctx.fillStyle = "rgb(15 118 110 / 0.08)";
    ctx.strokeStyle = SELECT_COLOR;
    ctx.lineWidth = viewLen(1);
    ctx.setLineDash([viewLen(4), viewLen(3)]);
    ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.restore();
  }

  function drawLasso(points) {
    if (!points || points.length < 2) {
      return;
    }

    ctx.save();
    ctx.fillStyle = "rgb(15 118 110 / 0.08)";
    ctx.strokeStyle = SELECT_COLOR;
    ctx.lineWidth = viewLen(1);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.setLineDash([viewLen(4), viewLen(3)]);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawGridOverlay() {
    if (!state.showGrid) {
      return;
    }
    const page = currentPage();
    if (!page) {
      return;
    }
    const step = gridStep();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, page.width, page.height);
    ctx.clip();
    ctx.strokeStyle = "rgb(15 118 110 / 0.28)";
    ctx.lineWidth = viewLen(1);
    ctx.beginPath();
    for (let x = 0; x <= page.width + 0.5; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, page.height);
    }
    for (let y = 0; y <= page.height + 0.5; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(page.width, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawGuides() {
    if (!state.showGuides) {
      return;
    }
    const page = currentPage();
    const guides = pageGuides();
    if (!page || !guides.length) {
      return;
    }
    ctx.save();
    ctx.strokeStyle = "rgb(220 38 38 / 0.7)";
    ctx.lineWidth = viewLen(1);
    ctx.setLineDash([viewLen(6), viewLen(4)]);
    ctx.beginPath();
    for (const guide of guides) {
      if (guide.axis === "x") {
        ctx.moveTo(guide.pos, 0);
        ctx.lineTo(guide.pos, page.height);
      } else {
        ctx.moveTo(0, guide.pos);
        ctx.lineTo(page.width, guide.pos);
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawMeasureOverlay() {
    const drag = state.active;
    if (!drag || (drag.kind !== "measure" && drag.kind !== "protractor")) {
      return;
    }
    const start = drag.start;
    const end = drag.point;
    ctx.save();
    ctx.strokeStyle = SELECT_COLOR;
    ctx.fillStyle = SELECT_COLOR;
    ctx.lineWidth = viewLen(1.5);
    ctx.setLineDash([viewLen(4), viewLen(3)]);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(start.x, start.y, viewLen(3), 0, Math.PI * 2);
    ctx.arc(end.x, end.y, viewLen(3), 0, Math.PI * 2);
    ctx.fill();

    if (drag.kind === "protractor") {
      const radius = Math.max(distance(start, end), viewLen(24));
      ctx.beginPath();
      ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgb(15 118 110 / 0.45)";
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(start.x + radius, start.y);
      ctx.lineTo(start.x, start.y);
      ctx.stroke();
    }

    const label = drag.kind === "measure" ? formatLength(distance(start, end)) : formatAngle(start, end);
    ctx.font = `${viewLen(13)}px ${FONT_FAMILY}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#0f766e";
    ctx.fillText(label, (start.x + end.x) / 2, (start.y + end.y) / 2 - viewLen(8));
    ctx.restore();
  }

  function drawScreenTeaching() {
    ctx.save();
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (state.spotlight && state.pointerWorld) {
      const hole = worldToScreen(state.pointerWorld);
      ctx.fillStyle = "rgb(15 18 22 / 0.58)";
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      ctx.arc(hole.x, hole.y, SPOTLIGHT_RADIUS, 0, Math.PI * 2);
      ctx.fill("evenodd");
    }

    if (state.tool === "laser" && state.pointerWorld) {
      for (let i = 0; i < state.laserTrail.length; i += 1) {
        const item = worldToScreen(state.laserTrail[i]);
        const t = (i + 1) / state.laserTrail.length;
        ctx.beginPath();
        ctx.fillStyle = `rgb(220 38 38 / ${0.12 + t * 0.35})`;
        ctx.arc(item.x, item.y, 5 + t * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      const tip = worldToScreen(state.pointerWorld);
      ctx.beginPath();
      ctx.fillStyle = "rgb(220 38 38 / 0.95)";
      ctx.arc(tip.x, tip.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgb(255 255 255 / 0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    if (state.showRulers) {
      drawRulers(width, height);
    }

    ctx.restore();
  }

  function drawRulers(width, height) {
    ctx.fillStyle = "rgb(250 248 245 / 0.94)";
    ctx.fillRect(0, 0, width, RULER_SIZE);
    ctx.fillRect(0, 0, RULER_SIZE, height);
    ctx.strokeStyle = "rgb(28 25 23 / 0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, RULER_SIZE);
    ctx.lineTo(width, RULER_SIZE);
    ctx.moveTo(RULER_SIZE, 0);
    ctx.lineTo(RULER_SIZE, height);
    ctx.stroke();
    ctx.fillStyle = "rgb(120 113 108)";
    ctx.font = "10px " + FONT_FAMILY;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const step = Math.max(gridStep(), 20);
    const page = currentPage();
    if (!page) {
      return;
    }
    for (let x = 0; x <= page.width; x += step) {
      const screen = worldToScreen({ x, y: 0 });
      if (screen.x < RULER_SIZE || screen.x > width) {
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(screen.x, RULER_SIZE);
      ctx.lineTo(screen.x, RULER_SIZE - (x % (step * 5) === 0 ? 10 : 6));
      ctx.stroke();
      if (x % (step * 5) === 0) {
        ctx.fillText(String(Math.round(x)), screen.x, 3);
      }
    }
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let y = 0; y <= page.height; y += step) {
      const screen = worldToScreen({ x: 0, y });
      if (screen.y < RULER_SIZE || screen.y > height) {
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(RULER_SIZE, screen.y);
      ctx.lineTo(RULER_SIZE - (y % (step * 5) === 0 ? 10 : 6), screen.y);
      ctx.stroke();
      if (y % (step * 5) === 0) {
        ctx.fillText(String(Math.round(y)), RULER_SIZE - 4, screen.y);
      }
    }
    ctx.fillStyle = "rgb(250 248 245 / 0.94)";
    ctx.fillRect(0, 0, RULER_SIZE, RULER_SIZE);
  }

  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const rect = wrap.getBoundingClientRect();
    const nextDpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const nextWidth = Math.round(width * nextDpr);
    const nextHeight = Math.round(height * nextDpr);

    if (
      canvas.width === nextWidth &&
      canvas.height === nextHeight &&
      state.dpr === nextDpr
    ) {
      return;
    }

    state.dpr = nextDpr;
    canvas.width = nextWidth;
    canvas.height = nextHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    redraw();
  }

  function distToSegment(point, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length2 = dx * dx + dy * dy;
    if (length2 === 0) {
      return distance(point, a);
    }

    const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / length2));
    return distance(point, { x: a.x + t * dx, y: a.y + t * dy });
  }

  function pointInTriangle(point, a, b, c) {
    const sign = (p1, p2, p3) => (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    const d1 = sign(point, a, b);
    const d2 = sign(point, b, c);
    const d3 = sign(point, c, a);
    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNeg && hasPos);
  }

  function pointInBounds(point, x, y, width, height) {
    return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
  }

  function hitObjectAtLocal(object, point) {
    const tolerance = Math.max(viewLen(HIT_PADDING), (object.size || 4) / 2 + viewLen(3));

    if (object.type === "stroke") {
      const points = object.points;
      if (points.length === 1) {
        return distance(point, points[0]) <= tolerance;
      }
      for (let i = 1; i < points.length; i += 1) {
        if (distToSegment(point, points[i - 1], points[i]) <= tolerance) {
          return true;
        }
      }
      return false;
    }

    if (object.type === "line") {
      return distToSegment(point, { x: object.x1, y: object.y1 }, { x: object.x2, y: object.y2 }) <= tolerance;
    }

    if (object.type === "arrow") {
      const head = arrowHeadPoints(object);
      if (
        distToSegment(point, { x: object.x1, y: object.y1 }, { x: object.x2, y: object.y2 }) <=
        tolerance
      ) {
        return true;
      }
      return Boolean(head && pointInTriangle(point, head.tip, head.left, head.right));
    }

    if (object.type === "ellipse") {
      const rx = object.width / 2;
      const ry = object.height / 2;
      if (rx < 0.5 || ry < 0.5) {
        return false;
      }
      const nx = (point.x - (object.x + rx)) / rx;
      const ny = (point.y - (object.y + ry)) / ry;
      return nx * nx + ny * ny <= 1;
    }

    if (object.type === "triangle" || isPolygonShape(object)) {
      const polygon = polygonPoints(object);
      return Boolean(polygon && pointInPolygon(point, polygon));
    }

    return pointInBounds(point, object.x, object.y, object.width, object.height);
  }

  function objectLocalPoint(object, point) {
    const center = getCenter(object);
    const local = worldToLocal(point, center, object.rotation || 0);
    if (isImage(object) || (!object.flipX && !object.flipY)) {
      return local;
    }
    return {
      x: center.x + (local.x - center.x) * (object.flipX ? -1 : 1),
      y: center.y + (local.y - center.y) * (object.flipY ? -1 : 1),
    };
  }

  function hitObject(point) {
    for (let i = state.objects.length - 1; i >= 0; i -= 1) {
      const object = state.objects[i];
      if (!isSelectable(object)) {
        continue;
      }

      const local = objectLocalPoint(object, point);
      if (hitObjectAtLocal(object, local)) {
        return object;
      }
    }

    return null;
  }

  function hitHandle(point) {
    if (state.selectedIds.length !== 1) {
      return null;
    }

    const object = findObject(state.selectedIds[0]);
    if (!object) {
      return null;
    }

    const frame = getFrame(object);
    const bounds = getLocalBounds(object);
    const center = getCenterFromBounds(bounds);
    const local = worldToLocal(point, center, object.rotation || 0);
    const handles = handlePositions(frame, center, object);
    const order =
      isImage(object) && state.cropping
        ? ["nw", "ne", "sw", "se", "n", "s", "e", "w"]
        : isTable(object)
          ? ["rotate", "nw", "ne", "sw", "se", "n", "s", "e", "w"]
          : isTextLike(object)
            ? ["rotate", "nw", "ne", "sw", "se", "e", "w"]
            : ["rotate", "nw", "ne", "sw", "se"];

    for (const name of order) {
      if (handles[name] && distance(local, handles[name]) <= viewLen(HANDLE_HIT)) {
        return name;
      }
    }

    return null;
  }

  function snapshotPages() {
    return state.pages.map((page) => ({
      id: page.id,
      name: page.name,
      preset: page.preset,
      orientation: page.orientation,
      width: page.width,
      height: page.height,
      surface: pageSurface(page),
      objects: cloneData(page.id === state.currentPageId ? state.objects : page.objects),
    }));
  }

  function cloneBoard() {
    return {
      pages: snapshotPages(),
      currentPageId: state.currentPageId,
      nextId: state.nextId,
      nextPageId: state.nextPageId,
      selectedIds: [...state.selectedIds],
    };
  }

  function restoreBoard(snapshot) {
    rememberCamera();
    const cameras = new Map(
      state.pages.map((page) => [page.id, { zoom: page.zoom, panX: page.panX, panY: page.panY }])
    );
    cameras.set(state.currentPageId, { zoom: state.zoom, panX: state.panX, panY: state.panY });
    const guidesByPage = new Map(state.pages.map((page) => [page.id, cloneData(page.guides || [])]));

    state.pages = snapshot.pages.map((page) => {
      const camera = cameras.get(page.id) || { zoom: 1, panX: 0, panY: 0 };
      return {
        ...cloneData(page),
        zoom: camera.zoom,
        panX: camera.panX,
        panY: camera.panY,
        guides: guidesByPage.get(page.id) || cloneData(page.guides) || [],
      };
    });
    state.nextId = snapshot.nextId;
    state.nextPageId = snapshot.nextPageId;
    const page = state.pages.find((item) => item.id === snapshot.currentPageId) || state.pages[0];
    attachPage(page);
    state.selectedIds = snapshot.selectedIds.filter((id) =>
      state.objects.some((object) => object.id === id)
    );
    redraw();
    syncEditUI();
    syncPageUI();
    syncImageUI();
    syncLinkUI();
  }

  function captureBefore() {
    state.historyBefore = cloneBoard();
  }

  function boardsEqual(a, b) {
    return a.currentPageId === b.currentPageId && JSON.stringify(a.pages) === JSON.stringify(b.pages);
  }

  function commitIfChanged() {
    if (!state.historyBefore) {
      return;
    }

    const current = cloneBoard();
    if (boardsEqual(state.historyBefore, current)) {
      state.historyBefore = null;
      return;
    }

    state.past.push(state.historyBefore);
    if (state.past.length > MAX_HISTORY) {
      state.past.shift();
    }
    state.future = [];
    state.historyBefore = null;
    syncEditUI();
  }

  function discardHistoryCapture() {
    state.historyBefore = null;
  }

  function paintThumb(canvasEl, page) {
    if (!canvasEl || !page) {
      return;
    }

    const cssW = 32;
    const cssH = 40;
    const ratio = 2;
    if (canvasEl.width !== cssW * ratio || canvasEl.height !== cssH * ratio) {
      canvasEl.width = cssW * ratio;
      canvasEl.height = cssH * ratio;
    }

    const thumb = canvasEl.getContext("2d");
    if (!thumb) {
      return;
    }

    thumb.setTransform(ratio, 0, 0, ratio, 0, 0);
    thumb.clearRect(0, 0, cssW, cssH);
    thumb.fillStyle = "#ddd8cf";
    thumb.fillRect(0, 0, cssW, cssH);

    const pad = 3;
    const scale = Math.min((cssW - pad * 2) / page.width, (cssH - pad * 2) / page.height);
    const pw = page.width * scale;
    const ph = page.height * scale;
    const ox = (cssW - pw) / 2;
    const oy = (cssH - ph) / 2;
    const surface = pageSurface(page);
    thumb.fillStyle = surface.paperColor;
    thumb.strokeStyle = hexLuminance(surface.paperColor) < 0.35 ? "rgb(255 255 255 / 0.18)" : "rgb(28 25 23 / 0.12)";
    thumb.lineWidth = 1;
    thumb.fillRect(ox, oy, pw, ph);
    thumb.save();
    thumb.beginPath();
    thumb.rect(ox, oy, pw, ph);
    thumb.clip();
    thumb.translate(ox, oy);
    thumb.scale(scale, scale);
    drawPagePattern(thumb, page.width, page.height, surface, (pixels) => pixels / scale);
    thumb.restore();
    thumb.strokeRect(ox, oy, pw, ph);

    const objects = page.id === state.currentPageId ? state.objects : page.objects;
    thumb.save();
    thumb.beginPath();
    thumb.rect(ox, oy, pw, ph);
    thumb.clip();
    thumb.translate(ox, oy);
    thumb.scale(scale, scale);
    for (const object of objects) {
      if (!isSelectable(object)) {
        continue;
      }
      const bounds = objectWorldBounds(object);
      thumb.fillStyle = hexLuminance(surface.paperColor) < 0.35 ? "rgb(255 255 255 / 0.45)" : "rgb(28 25 23 / 0.22)";
      thumb.fillRect(bounds.x, bounds.y, Math.max(bounds.width, 6), Math.max(bounds.height, 6));
    }
    thumb.restore();
  }

  function paintCurrentPageThumb() {
    if (!pageThumbs) {
      return;
    }
    const button = pageThumbs.querySelector(`[data-page-id="${state.currentPageId}"]`);
    const page = currentPage();
    if (!button || !page) {
      return;
    }
    paintThumb(button.querySelector("canvas"), page);
  }

  function renderPageThumbs() {
    const key = state.pages.map((page) => page.id).join(",");
    if (key !== state.pageThumbKey) {
      state.pageThumbKey = key;
      pageThumbs.replaceChildren();
      for (const page of state.pages) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "page-thumb";
        button.dataset.pageId = page.id;
        button.draggable = true;
        button.setAttribute("role", "tab");
        const canvasEl = document.createElement("canvas");
        canvasEl.setAttribute("aria-hidden", "true");
        button.appendChild(canvasEl);
        pageThumbs.appendChild(button);
      }
    }

    for (const button of pageThumbs.querySelectorAll(".page-thumb")) {
      const page = state.pages.find((item) => item.id === button.dataset.pageId);
      if (!page) {
        continue;
      }
      button.title = page.name;
      button.setAttribute("aria-label", page.name);
      button.setAttribute("aria-current", page.id === state.currentPageId ? "true" : "false");
      paintThumb(button.querySelector("canvas"), page);
    }
  }

  function syncPageUI() {
    const page = currentPage();
    if (!page) {
      return;
    }

    const index = currentPageIndex();
    pageStatus.textContent = `${page.name} (${index + 1} of ${state.pages.length})`;
    pageDeleteBtn.disabled = state.pages.length <= 1;

    if (document.activeElement !== pageNameInput) {
      pageNameInput.value = page.name;
    }
    if (document.activeElement !== pageWidthInput) {
      pageWidthInput.value = String(page.width);
    }
    if (document.activeElement !== pageHeightInput) {
      pageHeightInput.value = String(page.height);
    }

    for (const button of toolbar.querySelectorAll("[data-page-preset]")) {
      button.setAttribute("aria-pressed", String(button.dataset.pagePreset === page.preset));
    }
    for (const button of toolbar.querySelectorAll("[data-page-orientation]")) {
      button.setAttribute("aria-pressed", String(button.dataset.pageOrientation === page.orientation));
    }

    const surface = pageSurface(page);
    page.surface = surface;
    for (const button of toolbar.querySelectorAll("[data-page-mode]")) {
      button.setAttribute("aria-pressed", String(button.dataset.pageMode === surface.mode));
    }
    for (const button of toolbar.querySelectorAll("[data-page-template]")) {
      const group = button.dataset.templateMode;
      button.hidden = surface.mode !== "custom" && group !== surface.mode;
      button.setAttribute("aria-pressed", String(button.dataset.pageTemplate === surface.template));
    }
    if (document.activeElement !== paperColorInput) {
      paperColorInput.value = surface.paperColor;
    }
    if (document.activeElement !== lineColorInput) {
      lineColorInput.value = surface.lineColor;
    }
    if (document.activeElement !== lineSpacingInput) {
      lineSpacingInput.value = String(surface.lineSpacing);
    }
    if (document.activeElement !== gridSizeInput) {
      gridSizeInput.value = String(surface.gridSize);
    }
    if (document.activeElement !== pageMarginInput) {
      pageMarginInput.value = String(surface.margin);
    }

    renderPageThumbs();
    layoutRibbonOverflow();
  }

  function switchPage(id) {
    if (!id || id === state.currentPageId) {
      return;
    }

    const page = state.pages.find((item) => item.id === id);
    if (!page) {
      return;
    }

    finishOpenWork();
    rememberCamera();
    clearSelection();
    attachPage(page);
    redraw();
    syncEditUI();
    syncPageUI();
    syncViewUI();
  }

  function addPage() {
    finishOpenWork();
    captureBefore();
    rememberCamera();
    const page = makePage();
    const index = Math.max(currentPageIndex(), 0);
    state.pages.splice(index + 1, 0, page);
    clearSelection();
    attachPage(page);
    commitIfChanged();
    fitCanvas();
    syncPageUI();
    syncViewUI();
  }

  function duplicatePage() {
    const source = currentPage();
    if (!source) {
      return;
    }

    finishOpenWork();
    captureBefore();
    rememberCamera();
    const page = makePage({
      name: uniqueCopyName(source.name),
      preset: source.preset,
      orientation: source.orientation,
      width: source.width,
      height: source.height,
      objects: remapClones(source.objects, 0),
      zoom: source.zoom,
      panX: source.panX,
      panY: source.panY,
    });
    const index = currentPageIndex();
    state.pages.splice(index + 1, 0, page);
    clearSelection();
    attachPage(page);
    commitIfChanged();
    redraw();
    syncPageUI();
    syncViewUI();
  }

  function deletePage() {
    if (state.pages.length <= 1) {
      return;
    }

    if (!window.confirm("Delete this page? Drawings on it will be removed.")) {
      return;
    }

    finishOpenWork();
    captureBefore();
    const index = currentPageIndex();
    state.pages.splice(index, 1);
    const next = state.pages[Math.min(index, state.pages.length - 1)];
    clearSelection();
    attachPage(next);
    commitIfChanged();
    redraw();
    syncPageUI();
    syncViewUI();
  }

  function renamePage(nextName) {
    const page = currentPage();
    if (!page) {
      return;
    }

    const name = nextName.trim() || page.name;
    if (name === page.name) {
      pageNameInput.value = page.name;
      return;
    }

    captureBefore();
    page.name = name.slice(0, 80);
    commitIfChanged();
    syncPageUI();
  }

  function reorderPage(fromId, toId) {
    if (!fromId || !toId || fromId === toId) {
      return;
    }

    const fromIndex = state.pages.findIndex((page) => page.id === fromId);
    const toIndex = state.pages.findIndex((page) => page.id === toId);
    if (fromIndex < 0 || toIndex < 0) {
      return;
    }

    captureBefore();
    const [page] = state.pages.splice(fromIndex, 1);
    state.pages.splice(toIndex, 0, page);
    commitIfChanged();
    syncPageUI();
  }

  function setPagePreset(preset) {
    const page = currentPage();
    if (!page || !preset) {
      return;
    }

    captureBefore();
    if (preset === "custom") {
      page.preset = "custom";
    } else {
      page.preset = preset;
      const size = pageDimensions(preset, page.orientation);
      page.width = size.width;
      page.height = size.height;
    }
    commitIfChanged();
    redraw();
    syncPageUI();
  }

  function setPageOrientation(orientation) {
    const page = currentPage();
    if (!page || (orientation !== "portrait" && orientation !== "landscape")) {
      return;
    }

    captureBefore();
    if (page.preset === "custom") {
      if (orientation !== page.orientation) {
        const width = page.width;
        page.width = page.height;
        page.height = width;
      }
      page.orientation = orientation;
    } else {
      page.orientation = orientation;
      const size = pageDimensions(page.preset, orientation);
      page.width = size.width;
      page.height = size.height;
    }
    commitIfChanged();
    redraw();
    syncPageUI();
  }

  function setPageMode(mode) {
    const page = currentPage();
    if (!page || (mode !== "teacher" && mode !== "student" && mode !== "custom")) {
      return;
    }

    const surface = pageSurface(page);
    captureBefore();
    if (mode === "teacher" && !TEACHER_TEMPLATES.includes(surface.template)) {
      page.surface = defaultSurface("white");
    } else if (mode === "student" && !STUDENT_TEMPLATES.includes(surface.template)) {
      page.surface = defaultSurface("ruled");
    } else {
      page.surface = { ...surface, mode };
    }
    commitIfChanged();
    redraw();
    syncPageUI();
  }

  function setPageTemplate(template) {
    const page = currentPage();
    if (!page || !PAGE_TEMPLATES[template]) {
      return;
    }

    captureBefore();
    const next = defaultSurface(template);
    if (pageSurface(page).mode === "custom") {
      next.mode = "custom";
    }
    page.surface = next;
    commitIfChanged();
    redraw();
    syncPageUI();
  }

  function applySurfaceLook(commit) {
    const page = currentPage();
    if (!page) {
      return;
    }

    const surface = pageSurface(page);
    const next = normalizeSurface({
      ...surface,
      paperColor: paperColorInput.value || surface.paperColor,
      lineColor: lineColorInput.value || surface.lineColor,
      lineSpacing: lineSpacingInput.value,
      gridSize: gridSizeInput.value,
      margin: pageMarginInput.value,
    });
    const same =
      next.paperColor === surface.paperColor &&
      next.lineColor === surface.lineColor &&
      next.lineSpacing === surface.lineSpacing &&
      next.gridSize === surface.gridSize &&
      next.margin === surface.margin;
    if (same && !state.historyBefore) {
      if (commit) {
        syncPageUI();
      }
      return;
    }

    if (!state.historyBefore) {
      captureBefore();
    }
    page.surface = next;
    redraw();
    if (commit) {
      commitIfChanged();
      syncPageUI();
    }
  }

  function applyCustomPageSize(commit) {
    const page = currentPage();
    if (!page) {
      return;
    }

    const width = clampPageSize(pageWidthInput.value, page.width);
    const height = clampPageSize(pageHeightInput.value, page.height);
    const sameSize = width === page.width && height === page.height;
    if (sameSize && !state.historyBefore) {
      if (commit) {
        syncPageUI();
      }
      return;
    }

    if (!state.historyBefore) {
      captureBefore();
    }

    page.preset = "custom";
    page.width = width;
    page.height = height;
    page.orientation = page.width >= page.height ? "landscape" : "portrait";
    redraw();
    if (commit) {
      commitIfChanged();
      syncPageUI();
    } else {
      for (const button of toolbar.querySelectorAll("[data-page-preset]")) {
        button.setAttribute("aria-pressed", String(button.dataset.pagePreset === "custom"));
      }
      for (const button of toolbar.querySelectorAll("[data-page-orientation]")) {
        button.setAttribute("aria-pressed", String(button.dataset.pageOrientation === page.orientation));
      }
    }
  }

  function stepPage(delta) {
    const index = currentPageIndex();
    const next = state.pages[index + delta];
    if (next) {
      switchPage(next.id);
    }
  }

  function undo() {
    if (state.editingId) {
      cancelEditing();
      return;
    }

    if (state.active || state.past.length === 0) {
      return;
    }

    state.future.push(cloneBoard());
    restoreBoard(state.past.pop());
  }

  function redo() {
    if (state.editingId) {
      finishEditing();
    }

    if (state.active || state.future.length === 0) {
      return;
    }

    state.past.push(cloneBoard());
    restoreBoard(state.future.pop());
  }

  function syncEditUI() {
    const selectableCount = state.objects.filter(isSelectable).length;
    const hasSelection = state.selectedIds.length > 0;
    const units = selectionUnits();
    const info = selectionGroupInfo();

    undoBtn.disabled = state.past.length === 0;
    redoBtn.disabled = state.future.length === 0;
    deleteBtn.disabled = !hasSelection;
    copyBtn.disabled = !hasSelection;
    cutBtn.disabled = !hasSelection;
    duplicateBtn.disabled = !hasSelection;
    pasteBtn.disabled = state.clipboard.length === 0;
    selectAllBtn.disabled = selectableCount === 0;
    groupBtn.disabled = !info.canGroup;
    ungroupBtn.disabled = !info.canUngroup;
    for (const button of toolbar.querySelectorAll('[data-action="align"]')) {
      button.disabled = units.length < 2;
    }
    for (const button of toolbar.querySelectorAll('[data-action="flip-h"], [data-action="flip-v"]')) {
      button.disabled = !hasSelection;
    }
  }

  function setSelection(ids) {
    state.selectedIds = ids;
    if (state.cropping && !selectedImage()) {
      state.cropping = false;
    }
    const table = ids.length === 1 ? findObject(ids[0]) : null;
    if (!isTable(table)) {
      state.tableCell = null;
      state.tableRange = null;
    } else if (!state.tableCell || state.tableCell.id !== table.id) {
      state.tableCell = { id: table.id, r: 0, c: 0 };
      state.tableRange = null;
    }
    syncEditUI();
    syncFormatFromSelection();
    syncImageUI();
    syncLinkUI();
    syncTableUI();
  }

  function clearSelection() {
    if (state.selectedIds.length === 0) {
      return;
    }

    setSelection([]);
  }

  function translateObject(object, dx, dy) {
    if (object.type === "line" || object.type === "arrow") {
      object.x1 += dx;
      object.y1 += dy;
      object.x2 += dx;
      object.y2 += dy;
      return;
    }

    if (object.type === "stroke") {
      for (const point of object.points) {
        point.x += dx;
        point.y += dy;
      }
      return;
    }

    object.x += dx;
    object.y += dy;
  }

  function applyScaledBounds(object, startObject, startBounds, newBounds) {
    const sx = startBounds.width < 1 ? 1 : newBounds.width / startBounds.width;
    const sy = startBounds.height < 1 ? 1 : newBounds.height / startBounds.height;

    if (object.type === "line" || object.type === "arrow") {
      object.x1 = newBounds.x + (startObject.x1 - startBounds.x) * sx;
      object.y1 = newBounds.y + (startObject.y1 - startBounds.y) * sy;
      object.x2 = newBounds.x + (startObject.x2 - startBounds.x) * sx;
      object.y2 = newBounds.y + (startObject.y2 - startBounds.y) * sy;
      return;
    }

    if (object.type === "stroke") {
      object.points = startObject.points.map((point) => ({
        x: newBounds.x + (point.x - startBounds.x) * sx,
        y: newBounds.y + (point.y - startBounds.y) * sy,
      }));
      return;
    }

    object.x = newBounds.x;
    object.y = newBounds.y;
    object.width = newBounds.width;
    object.height = newBounds.height;
    if (isTextLike(object)) {
      reflowTextHeight(object);
    }
    if (isTable(object)) {
      object.width = Math.max(object.width, tableColCount(object) * TABLE_CELL_MIN);
      object.height = Math.max(object.height, tableRowCount(object) * TABLE_CELL_MIN);
    }
  }

  function remapClones(objects, offset) {
    const groupMap = new Map();
    return objects.map((object) => {
      const copy = cloneData(object);
      copy.id = createId();
      if (copy.groupId) {
        if (!groupMap.has(copy.groupId)) {
          groupMap.set(copy.groupId, createId());
        }
        copy.groupId = groupMap.get(copy.groupId);
      }
      if (offset) {
        translateObject(copy, offset, offset);
      }
      return copy;
    });
  }

  function expandGroupIds(ids) {
    const selected = new Set(ids);
    const groupIds = new Set();
    for (const id of ids) {
      const object = findObject(id);
      if (object && object.groupId) {
        groupIds.add(object.groupId);
      }
    }
    if (groupIds.size === 0) {
      return [...selected];
    }
    for (const object of state.objects) {
      if (object.groupId && groupIds.has(object.groupId)) {
        selected.add(object.id);
      }
    }
    return state.objects.filter((object) => selected.has(object.id)).map((object) => object.id);
  }

  function selectionUnits() {
    const units = [];
    const seenGroups = new Set();
    for (const object of selectedObjects()) {
      if (object.groupId) {
        if (seenGroups.has(object.groupId)) {
          continue;
        }
        seenGroups.add(object.groupId);
        units.push(state.objects.filter((item) => item.groupId === object.groupId));
      } else {
        units.push([object]);
      }
    }
    return units;
  }

  function selectionGroupInfo() {
    const selected = selectedObjects();
    const grouped = selected.filter((object) => object.groupId);
    if (selected.length < 2) {
      return { canGroup: false, canUngroup: grouped.length > 0 };
    }

    const firstGroup = selected[0].groupId;
    const allSameGroup = Boolean(firstGroup) && selected.every((object) => object.groupId === firstGroup);
    const complete =
      allSameGroup &&
      state.objects.filter((object) => object.groupId === firstGroup).length === selected.length;
    return {
      canGroup: !complete,
      canUngroup: grouped.length > 0,
    };
  }

  function pruneOrphanGroups() {
    const counts = new Map();
    for (const object of state.objects) {
      if (!object.groupId) {
        continue;
      }
      counts.set(object.groupId, (counts.get(object.groupId) || 0) + 1);
    }
    for (const object of state.objects) {
      if (object.groupId && counts.get(object.groupId) < 2) {
        delete object.groupId;
      }
    }
  }

  function deleteSelected() {
    if (state.selectedIds.length === 0 || state.active) {
      return;
    }

    captureBefore();
    const ids = new Set(state.selectedIds);
    state.objects = state.objects.filter((object) => !ids.has(object.id));
    pruneOrphanGroups();
    setSelection([]);
    commitIfChanged();
    redraw();
  }

  function duplicateSelected() {
    if (state.selectedIds.length === 0 || state.active) {
      return;
    }

    captureBefore();
    const copies = remapClones(selectedObjects(), DUPLICATE_OFFSET);
    for (const copy of copies) {
      state.objects.push(copy);
    }
    setSelection(copies.map((copy) => copy.id));
    commitIfChanged();
    redraw();
  }

  function copySelected() {
    const selected = selectedObjects();
    if (selected.length === 0) {
      return;
    }

    const sel = getTableSelection();
    if (sel && selected.length === 1 && state.tableCell) {
      state.cellClipboard = tableRangeToTsv(sel);
      state.clipboardKind = "cells";
      state.clipboard = cloneData(selected);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(state.cellClipboard).catch(() => {});
      }
      syncEditUI();
      return;
    }

    state.clipboardKind = "objects";
    state.clipboard = cloneData(selected);
    syncEditUI();
  }

  function pasteClipboard() {
    if (state.active) {
      return;
    }

    const table = selectedTable();
    if (table && state.tableCell && state.clipboardKind === "cells" && state.cellClipboard) {
      captureBefore();
      pasteTsvIntoTable(table, state.tableCell.r, state.tableCell.c, state.cellClipboard);
      commitIfChanged();
      redraw();
      return;
    }

    if (state.clipboard.length === 0) {
      return;
    }

    captureBefore();
    const copies = remapClones(state.clipboard, DUPLICATE_OFFSET);
    for (const copy of copies) {
      state.objects.push(copy);
    }
    setSelection(copies.map((copy) => copy.id));
    commitIfChanged();
    redraw();
  }

  async function pasteAction() {
    if (state.active) {
      return;
    }
    if (navigator.clipboard && navigator.clipboard.read) {
      try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const type = item.types.find((name) => IMAGE_TYPES.test(name));
          if (type) {
            const blob = await item.getType(type);
            await insertImageFromBlob(blob);
            return;
          }
        }
      } catch (error) {
        // Permission denied or empty clipboard — fall through to object paste.
      }
    }
    pasteClipboard();
  }

  function onPaste(event) {
    if (isTypingTarget(event.target) || state.editingId || state.frozen) {
      return;
    }
    const blob = clipboardImageBlob(event);
    if (blob) {
      event.preventDefault();
      insertImageFromBlob(blob);
      return;
    }
    if (state.clipboard.length) {
      event.preventDefault();
      pasteClipboard();
    }
  }

  function setDropTarget(on) {
    canvasWrap.classList.toggle("is-drop-target", on);
  }

  function onWindowDragOver(event) {
    const types = (event.dataTransfer && event.dataTransfer.types) || [];
    if ([...types].includes("Files")) {
      event.preventDefault();
    }
  }

  function onCanvasDragOver(event) {
    const types = (event.dataTransfer && event.dataTransfer.types) || [];
    if (![...types].includes("Files")) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setDropTarget(true);
  }

  function onDrop(event) {
    const files = filesFromDataTransfer(event.dataTransfer);
    setDropTarget(false);
    if (!files.length || isTypingTarget(event.target)) {
      if (files.length) {
        event.preventDefault();
      }
      return;
    }
    event.preventDefault();
    if (state.frozen) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    const at = inside
      ? screenToWorld({ x: event.clientX - rect.left, y: event.clientY - rect.top })
      : undefined;
    insertImageFromBlob(files[0], at);
  }

  function cutSelected() {
    if (state.selectedIds.length === 0 || state.active) {
      return;
    }

    copySelected();
    deleteSelected();
  }

  function selectAll() {
    if (state.active) {
      return;
    }

    const ids = state.objects.filter(isSelectable).map((object) => object.id);
    if (ids.length === 0) {
      return;
    }

    if (state.tool !== "select") {
      setTool("select");
    }
    setSelection(ids);
    redraw();
  }

  function groupSelected() {
    if (state.active || !selectionGroupInfo().canGroup) {
      return;
    }

    captureBefore();
    const groupId = createId();
    for (const object of selectedObjects()) {
      object.groupId = groupId;
    }
    setSelection(expandGroupIds(state.selectedIds));
    commitIfChanged();
    redraw();
  }

  function ungroupSelected() {
    if (state.active || !selectionGroupInfo().canUngroup) {
      return;
    }

    captureBefore();
    for (const object of selectedObjects()) {
      if (object.groupId) {
        delete object.groupId;
      }
    }
    commitIfChanged();
    redraw();
  }

  function alignSelected(edge) {
    const units = selectionUnits();
    if (state.active || units.length < 2) {
      return;
    }

    const unitBoxes = units.map((members) =>
      unionBounds(members.map((object) => objectWorldBounds(object)))
    );
    const frame = unionBounds(unitBoxes);

    captureBefore();
    units.forEach((members, index) => {
      const box = unitBoxes[index];
      let dx = 0;
      let dy = 0;
      if (edge === "left") {
        dx = frame.x - box.x;
      } else if (edge === "center") {
        dx = frame.x + frame.width / 2 - (box.x + box.width / 2);
      } else if (edge === "right") {
        dx = frame.x + frame.width - (box.x + box.width);
      } else if (edge === "top") {
        dy = frame.y - box.y;
      } else if (edge === "middle") {
        dy = frame.y + frame.height / 2 - (box.y + box.height / 2);
      } else if (edge === "bottom") {
        dy = frame.y + frame.height - (box.y + box.height);
      }
      if (dx || dy) {
        for (const object of members) {
          translateObject(object, dx, dy);
        }
      }
    });
    commitIfChanged();
    redraw();
  }

  function applyStyleToSelected(fromSize) {
    for (const object of selectedObjects()) {
      if (object.type === "stroke") {
        if (object.tool === "eraser") {
          continue;
        }
        object.color = state.stroke;
        object.size = state.size;
        continue;
      }

      if (isTextLike(object)) {
        object.color = state.stroke;
        object.fontSize = state.fontSize;
        object.fontKey = state.fontKey;
        object.bold = state.bold;
        object.italic = state.italic;
        object.underline = state.underline;
        object.strike = state.strike;
        object.align = state.align;
        object.lineHeight = state.lineHeight;
        object.letterSpacing = state.letterSpacing;
        object.paragraphSpacing = state.paragraphSpacing;
        object.textBack = state.textBack;
        object.list = state.list;
        object.indent = state.indent;
        if (object.type === "sticky") {
          object.fill = state.fill || object.fill || STICKY_FILL;
        }
        reflowTextHeight(object);
        continue;
      }

      if (isImage(object)) {
        object.stroke = state.stroke;
        if (fromSize) {
          object.size = state.size;
        }
        continue;
      }

      if (isLink(object)) {
        object.color = state.stroke;
        object.fontSize = state.fontSize;
        object.fontKey = state.fontKey;
        object.bold = state.bold;
        object.italic = state.italic;
        object.textBack = state.textBack;
        const size = measureLinkBox(object);
        object.width = Math.max(object.width, size.width);
        object.height = Math.max(object.height, size.height);
        continue;
      }

      if (isTable(object)) {
        object.stroke = state.stroke;
        object.size = state.size;
        const sel = getTableSelection();
        if (sel && sel.object === object) {
          for (let r = sel.r1; r <= sel.r2; r += 1) {
            for (let c = sel.c1; c <= sel.c2; c += 1) {
              const origin = tableOrigin(object, r, c);
              const cell = origin ? tableCellAt(object, origin.r, origin.c) : null;
              if (cell && !cell.covered && origin.r === r && origin.c === c) {
                applyStyleToTableCell(cell);
              }
            }
          }
        }
        continue;
      }

      object.stroke = state.stroke;
      object.size = state.size;
      if (object.type !== "line" && object.type !== "arrow") {
        object.fill = state.fill;
      }
    }
  }

  function replaceObjectFromClone(target, source) {
    const id = target.id;
    Object.keys(target).forEach((key) => {
      delete target[key];
    });
    Object.assign(target, cloneData(source), { id });
  }

  function applyMove(point) {
    const drag = state.active;
    const dx = state.showGrid
      ? Math.round((point.x - drag.startPoint.x) / gridStep()) * gridStep()
      : point.x - drag.startPoint.x;
    const dy = state.showGrid
      ? Math.round((point.y - drag.startPoint.y) / gridStep()) * gridStep()
      : point.y - drag.startPoint.y;
    drag.targets.forEach((object, index) => {
      replaceObjectFromClone(object, drag.startObjects[index]);
      translateObject(object, dx, dy);
    });
  }

  function applyRotate(point) {
    const drag = state.active;
    const object = drag.targets[0];
    const start = drag.startObjects[0];
    replaceObjectFromClone(object, start);
    const angle = Math.atan2(point.y - drag.center.y, point.x - drag.center.x);
    const origin = Math.atan2(
      drag.startPoint.y - drag.center.y,
      drag.startPoint.x - drag.center.x
    );
    object.rotation = (start.rotation || 0) + (angle - origin);
  }

  function applyResize(point) {
    const drag = state.active;
    const object = drag.targets[0];
    const start = drag.startObjects[0];
    replaceObjectFromClone(object, start);

    const local = worldToLocal(point, drag.center, drag.rotation);
    const startBounds = drag.startBounds;
    let left = startBounds.x;
    let top = startBounds.y;
    let right = startBounds.x + startBounds.width;
    let bottom = startBounds.y + startBounds.height;

    if (drag.handle.includes("w")) {
      left = local.x;
    }
    if (drag.handle.includes("e")) {
      right = local.x;
    }
    if (drag.handle.includes("n")) {
      top = local.y;
    }
    if (drag.handle.includes("s")) {
      bottom = local.y;
    }

    if (right - left < MIN_FRAME) {
      if (drag.handle.includes("w")) {
        left = right - MIN_FRAME;
      } else {
        right = left + MIN_FRAME;
      }
    }
    if (isTextLike(object) && right - left < MIN_TEXT_WIDTH) {
      if (drag.handle.includes("w")) {
        left = right - MIN_TEXT_WIDTH;
      } else {
        right = left + MIN_TEXT_WIDTH;
      }
    }
    if (isTable(object)) {
      const minW = tableColCount(object) * TABLE_CELL_MIN;
      const minH = tableRowCount(object) * TABLE_CELL_MIN;
      if (right - left < minW) {
        if (drag.handle.includes("w")) {
          left = right - minW;
        } else {
          right = left + minW;
        }
      }
      if (bottom - top < minH) {
        if (drag.handle.includes("n")) {
          top = bottom - minH;
        } else {
          bottom = top + minH;
        }
      }
    }
    if (bottom - top < MIN_FRAME) {
      if (drag.handle.includes("n")) {
        top = bottom - MIN_FRAME;
      } else {
        bottom = top + MIN_FRAME;
      }
    }

    if (isImage(object) && !drag.shift && drag.handle.length === 2) {
      const aspect = startBounds.width / Math.max(startBounds.height, 1);
      const nextW = right - left;
      const nextH = bottom - top;
      if (Math.abs(nextW / Math.max(nextH, 1) - aspect) > 0.001) {
        if (Math.abs(nextW - startBounds.width) >= Math.abs(nextH - startBounds.height)) {
          const height = nextW / aspect;
          if (drag.handle.includes("n")) {
            top = bottom - height;
          } else {
            bottom = top + height;
          }
        } else {
          const width = nextH * aspect;
          if (drag.handle.includes("w")) {
            left = right - width;
          } else {
            right = left + width;
          }
        }
      }
    }

    const nextBounds = {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    };

    const fixedLocal = {
      x: drag.handle.includes("w") ? right : left,
      y: drag.handle.includes("n") ? bottom : top,
    };
    const worldBefore = localToWorld(fixedLocal, drag.center, drag.rotation);

    applyScaledBounds(object, start, startBounds, nextBounds);

    const worldAfter = localToWorld(fixedLocal, getCenter(object), object.rotation || 0);
    translateObject(object, worldBefore.x - worldAfter.x, worldBefore.y - worldAfter.y);
  }

  function applyCrop(point) {
    const drag = state.active;
    const object = drag.targets[0];
    const start = drag.startObjects[0];
    const asset = getImageAsset(start.imageId);
    if (!isImage(object) || !asset) {
      return;
    }

    replaceObjectFromClone(object, start);
    const crop = imageSourceRect(start, asset);
    const scaleX = start.width / crop.sw;
    const scaleY = start.height / crop.sh;
    const local = worldToLocal(point, drag.center, drag.rotation);
    let left = start.x;
    let top = start.y;
    let right = start.x + start.width;
    let bottom = start.y + start.height;

    if (drag.handle.includes("w")) {
      left = local.x;
    }
    if (drag.handle.includes("e")) {
      right = local.x;
    }
    if (drag.handle.includes("n")) {
      top = local.y;
    }
    if (drag.handle.includes("s")) {
      bottom = local.y;
    }

    if (right - left < MIN_IMAGE) {
      if (drag.handle.includes("w")) {
        left = right - MIN_IMAGE;
      } else {
        right = left + MIN_IMAGE;
      }
    }
    if (bottom - top < MIN_IMAGE) {
      if (drag.handle.includes("n")) {
        top = bottom - MIN_IMAGE;
      } else {
        bottom = top + MIN_IMAGE;
      }
    }

    const visualLeft = (left - start.x) / scaleX;
    const visualRight = (right - start.x) / scaleX;
    const visualTop = (top - start.y) / scaleY;
    const visualBottom = (bottom - start.y) / scaleY;
    let srcLeft = start.flipX ? crop.sx + crop.sw - visualRight : crop.sx + visualLeft;
    let srcRight = start.flipX ? crop.sx + crop.sw - visualLeft : crop.sx + visualRight;
    let srcTop = start.flipY ? crop.sy + crop.sh - visualBottom : crop.sy + visualTop;
    let srcBottom = start.flipY ? crop.sy + crop.sh - visualTop : crop.sy + visualBottom;

    srcLeft = Math.min(asset.width - 1, Math.max(0, srcLeft));
    srcTop = Math.min(asset.height - 1, Math.max(0, srcTop));
    srcRight = Math.min(asset.width, Math.max(srcLeft + 1, srcRight));
    srcBottom = Math.min(asset.height, Math.max(srcTop + 1, srcBottom));

    object.crop = {
      sx: srcLeft,
      sy: srcTop,
      sw: srcRight - srcLeft,
      sh: srcBottom - srcTop,
    };
    object.width = object.crop.sw * scaleX;
    object.height = object.crop.sh * scaleY;
    object.x = start.flipX
      ? start.x + (crop.sx + crop.sw - srcRight) * scaleX
      : start.x + (srcLeft - crop.sx) * scaleX;
    object.y = start.flipY
      ? start.y + (crop.sy + crop.sh - srcBottom) * scaleY
      : start.y + (srcTop - crop.sy) * scaleY;

    const fixedLocal = {
      x: drag.handle.includes("w") ? start.x + start.width : start.x,
      y: drag.handle.includes("n") ? start.y + start.height : start.y,
    };
    const worldBefore = localToWorld(fixedLocal, drag.center, drag.rotation);
    const worldAfter = localToWorld(
      {
        x: drag.handle.includes("w") ? object.x + object.width : object.x,
        y: drag.handle.includes("n") ? object.y + object.height : object.y,
      },
      getCenter(object),
      object.rotation || 0
    );
    translateObject(object, worldBefore.x - worldAfter.x, worldBefore.y - worldAfter.y);
  }

  function applyTransform(point) {
    if (!state.active || state.active.kind !== "transform") {
      return;
    }

    if (state.active.mode === "move") {
      applyMove(point);
      return;
    }

    if (state.active.mode === "rotate") {
      applyRotate(point);
      return;
    }

    if (state.active.mode === "crop") {
      applyCrop(point);
      return;
    }

    if (state.active.mode === "table-split") {
      applyTableSplit(point);
      return;
    }

    applyResize(point);
  }

  function applyTableSplit(point) {
    const drag = state.active;
    const object = drag.targets[0];
    const start = drag.startObjects[0];
    const split = drag.split;
    if (!isTable(object) || !split) {
      return;
    }
    replaceObjectFromClone(object, start);
    const local = objectLocalPoint(object, point);
    const layout = tableLayout(start);
    if (split.kind === "col") {
      const left = layout.cols[split.index - 1];
      const right = layout.cols[split.index];
      const pair = left.w + right.w;
      const min = TABLE_CELL_MIN;
      const x = Math.min(left.x + pair - min, Math.max(left.x + min, local.x - object.x));
      const leftW = x - left.x;
      object.colW = start.colW.slice();
      object.colW[split.index - 1] = leftW / start.width;
      object.colW[split.index] = (pair - leftW) / start.width;
      object.colW = normalizeFractions(object.colW);
      return;
    }
    const top = layout.rows[split.index - 1];
    const bottom = layout.rows[split.index];
    const pair = top.h + bottom.h;
    const min = TABLE_CELL_MIN;
    const y = Math.min(top.y + pair - min, Math.max(top.y + min, local.y - object.y));
    const topH = y - top.y;
    object.rowH = start.rowH.slice();
    object.rowH[split.index - 1] = topH / start.height;
    object.rowH[split.index] = (pair - topH) / start.height;
    object.rowH = normalizeFractions(object.rowH);
  }

  function flushSelectDrag() {
    state.raf = 0;
    if (!state.active || state.active.kind !== "transform" || !state.active.point) {
      return;
    }

    applyTransform(state.active.point);
    redraw();
  }

  function queueSelectDrag(point, shift) {
    if (!state.active || state.active.kind !== "transform") {
      return;
    }

    state.active.point = point;
    if (shift != null) {
      state.active.shift = shift;
    }
    if (!state.raf) {
      state.raf = requestAnimationFrame(flushSelectDrag);
    }
  }

  function startTransform(mode, handle, point, pointerId) {
    const targets = selectedObjects();
    const startObjects = targets.map((object) => cloneData(object));
    const primary = targets[0];
    const startBounds = primary
      ? mode === "resize"
        ? getFrame(primary)
        : getLocalBounds(primary)
      : null;
    const center = primary ? getCenter(primary) : { x: 0, y: 0 };

    state.active = {
      kind: "transform",
      mode,
      handle,
      pointerId,
      point,
      startPoint: point,
      targets,
      startObjects,
      startBounds,
      center,
      rotation: primary ? primary.rotation || 0 : 0,
    };
    canvas.style.cursor = mode === "move" ? "grabbing" : canvas.style.cursor;
  }

  function finishTransform(pointerId) {
    if (!state.active || state.active.kind !== "transform" || state.active.pointerId !== pointerId) {
      return;
    }

    if (state.raf) {
      cancelAnimationFrame(state.raf);
      flushSelectDrag();
    }

    state.active = null;
    releasePointer(pointerId);
    commitIfChanged();
    redraw();
  }

  function cancelActive() {
    if (!state.active) {
      if (state.editingId) {
        finishEditing();
      } else {
        clearSelection();
        redraw();
      }
      return;
    }

    if (state.historyBefore) {
      restoreBoard(state.historyBefore);
      discardHistoryCapture();
    }

    const pointerId = state.active.pointerId;
    if (state.raf) {
      cancelAnimationFrame(state.raf);
      state.raf = 0;
    }
    state.preview = null;
    state.queuedPoints = [];
    state.active = null;
    canvas.classList.remove("is-panning");
    if (pointerId != null) {
      releasePointer(pointerId);
    }
    redraw();
  }

  function syncFormatUI() {
    for (const button of document.querySelectorAll("[data-format]")) {
      const format = button.dataset.format;
      let pressed = false;
      if (format === "bold") {
        pressed = state.bold;
      } else if (format === "italic") {
        pressed = state.italic;
      } else if (format === "underline") {
        pressed = state.underline;
      } else if (format === "strike") {
        pressed = state.strike;
      } else if (format === `align-${state.align}`) {
        pressed = true;
      } else if (format === "list-bullet") {
        pressed = state.list === "bullet";
      } else if (format === "list-number") {
        pressed = state.list === "number";
      } else if (format === "text-back-none") {
        pressed = !state.textBack;
      }
      if (
        format === "indent" ||
        format === "outdent"
      ) {
        continue;
      }
      button.setAttribute("aria-pressed", String(Boolean(pressed)));
    }

    if (Number(fontSizeSelect.value) !== state.fontSize) {
      fontSizeSelect.value = FONT_SIZES.includes(state.fontSize) ? String(state.fontSize) : "24";
    }
    if (fontFamilySelect.value !== state.fontKey) {
      fontFamilySelect.value = FONT_STACKS[state.fontKey] ? state.fontKey : "sans";
    }
    if (document.activeElement !== lineHeightInput) {
      lineHeightInput.value = String(state.lineHeight);
    }
    if (document.activeElement !== letterSpacingInput) {
      letterSpacingInput.value = String(state.letterSpacing);
    }
    if (document.activeElement !== paraSpacingInput) {
      paraSpacingInput.value = String(state.paragraphSpacing);
    }
    if (state.textBack && document.activeElement !== textBackInput) {
      textBackInput.value = state.textBack;
    }
  }

  function syncFormatFromSelection() {
    const selected = selectedObjects();
    if (selected.length === 1 && isTextLike(selected[0])) {
      const object = selected[0];
      state.fontSize = object.fontSize || 24;
      state.fontKey = object.fontKey || "sans";
      state.bold = Boolean(object.bold);
      state.italic = Boolean(object.italic);
      state.underline = Boolean(object.underline);
      state.strike = Boolean(object.strike);
      state.align = object.align || "left";
      state.lineHeight = object.lineHeight || 1.35;
      state.letterSpacing = object.letterSpacing || 0;
      state.paragraphSpacing = object.paragraphSpacing || 0;
      state.textBack = object.textBack || null;
      state.list = object.list || "none";
      state.indent = object.indent || 0;
      if (object.color) {
        state.stroke = object.color;
      }
      if (object.type === "sticky" && object.fill) {
        state.fill = object.fill;
      }
      syncColorUI();
    } else if (selected.length === 1 && isTable(selected[0]) && state.tableCell) {
      const origin = tableOrigin(selected[0], state.tableCell.r, state.tableCell.c);
      const cell = origin ? tableCellAt(selected[0], origin.r, origin.c) : null;
      if (cell) {
        loadStyleFromTableCell(cell);
        if (selected[0].stroke) {
          state.stroke = cell.color || selected[0].stroke;
        }
        syncColorUI();
      }
    }

    syncFormatUI();
  }

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return fallback;
    }
    return Math.min(max, Math.max(min, number));
  }

  function syncImageUI() {
    const image = selectedImage();
    const enabled = Boolean(image);
    for (const button of toolbar.querySelectorAll('[data-action="image-crop"]')) {
      button.disabled = !enabled;
      button.setAttribute("aria-pressed", String(Boolean(enabled && state.cropping)));
    }
    imageFlipHBtn.disabled = !enabled;
    imageFlipVBtn.disabled = !enabled;
    imageShadowBtn.disabled = !enabled;
    imageGrayBtn.disabled = !enabled;
    imageOpacityInput.disabled = !enabled;
    imageRadiusInput.disabled = !enabled;
    imageBrightnessInput.disabled = !enabled;
    imageContrastInput.disabled = !enabled;
    imageSaturationInput.disabled = !enabled;
    imageBlurInput.disabled = !enabled;
    imageShadowBtn.setAttribute("aria-pressed", String(Boolean(image && image.shadow)));
    imageGrayBtn.setAttribute("aria-pressed", String(Boolean(image && image.grayscale)));
    if (!image) {
      return;
    }
    if (document.activeElement !== imageOpacityInput) {
      imageOpacityInput.value = String(Math.round((image.opacity == null ? 1 : image.opacity) * 100));
    }
    if (document.activeElement !== imageRadiusInput) {
      imageRadiusInput.value = String(image.radius || 0);
    }
    if (document.activeElement !== imageBrightnessInput) {
      imageBrightnessInput.value = String(image.brightness || 0);
    }
    if (document.activeElement !== imageContrastInput) {
      imageContrastInput.value = String(image.contrast || 0);
    }
    if (document.activeElement !== imageSaturationInput) {
      imageSaturationInput.value = String(image.saturation || 0);
    }
    if (document.activeElement !== imageBlurInput) {
      imageBlurInput.value = String(image.blur || 0);
    }
  }

  function applyImageFields(commit) {
    const image = selectedImage();
    if (!image) {
      return;
    }
    if (!state.historyBefore) {
      captureBefore();
    }
    image.opacity = clampNumber(imageOpacityInput.value, 0, 100, 100) / 100;
    image.radius = clampNumber(imageRadiusInput.value, 0, 240, 0);
    image.brightness = clampNumber(imageBrightnessInput.value, -100, 100, 0);
    image.contrast = clampNumber(imageContrastInput.value, -100, 100, 0);
    image.saturation = clampNumber(imageSaturationInput.value, -100, 100, 0);
    image.blur = clampNumber(imageBlurInput.value, 0, 40, 0);
    redraw();
    if (commit) {
      commitIfChanged();
    }
  }

  function syncTableUI() {
    const table = selectedTable();
    const on = Boolean(table);
    const sel = on ? getTableSelection() : null;
    const rows = on ? tableRowCount(table) : 0;
    const cols = on ? tableColCount(table) : 0;
    const mergeable = Boolean(sel && (sel.r2 > sel.r1 || sel.c2 > sel.c1));
    let canUnmerge = false;
    if (on && state.tableCell) {
      const origin = tableOrigin(table, state.tableCell.r, state.tableCell.c);
      const cell = origin ? tableCellAt(table, origin.r, origin.c) : null;
      canUnmerge = Boolean(cell && ((cell.colspan || 1) > 1 || (cell.rowspan || 1) > 1));
    }
    for (const button of toolbar.querySelectorAll("[data-action^='table-']")) {
      const action = button.dataset.action;
      if (action === "table-row-del") {
        button.disabled = !on || rows < 2;
      } else if (action === "table-col-del") {
        button.disabled = !on || cols < 2;
      } else if (action === "table-merge") {
        button.disabled = !mergeable;
      } else if (action === "table-unmerge") {
        button.disabled = !canUnmerge;
      } else {
        button.disabled = !on;
      }
    }
  }

  function toggleImageCrop() {
    const image = selectedImage();
    if (!image) {
      return;
    }
    state.cropping = !state.cropping;
    if (state.cropping && state.tool !== "select") {
      setTool("select");
    }
    syncImageUI();
    redraw();
  }

  function toggleImageFlag(name) {
    const image = selectedImage();
    if (!image) {
      return;
    }
    captureBefore();
    image[name] = !image[name];
    commitIfChanged();
    syncImageUI();
    redraw();
  }

  function fillColor() {
    return state.fill || state.stroke;
  }

  function applyFillAt(point) {
    const object = hitObject(point);
    if (!object) {
      return;
    }
    const color = fillColor();
    captureBefore();
    if (object.type === "stroke") {
      if (object.tool !== "eraser") {
        object.color = color;
      }
    } else if (object.type === "line" || object.type === "arrow") {
      object.stroke = color;
    } else if (isLink(object)) {
      object.color = color;
    } else if (isImage(object)) {
      object.stroke = color;
    } else if (isTextLike(object)) {
      if (object.type === "sticky") {
        object.fill = color;
      } else {
        object.textBack = color;
      }
    } else if (isTable(object)) {
      const local = objectLocalPoint(object, point);
      const cellHit = hitTableCell(object, local);
      const cell = cellHit ? tableCellAt(object, cellHit.r, cellHit.c) : null;
      if (cell && !cell.covered) {
        cell.fill = color;
      }
    } else {
      object.fill = color;
    }
    commitIfChanged();
    redraw();
  }

  function sampleCanvasColor(event) {
    const screen = getScreenPoint(event);
    const x = Math.max(0, Math.min(canvas.width - 1, Math.round(screen.x * state.dpr)));
    const y = Math.max(0, Math.min(canvas.height - 1, Math.round(screen.y * state.dpr)));
    const data = ctx.getImageData(x, y, 1, 1).data;
    if (data[3] < 12) {
      return null;
    }
    return rgbToHex(data[0], data[1], data[2]);
  }

  function pickColorAt(event) {
    const hex = sampleCanvasColor(event);
    if (hex) {
      if (state.colorTarget === "fill") {
        state.fill = hex;
      } else {
        state.stroke = hex;
      }
      syncColorUI();
    }
    const next =
      state.eyedropperReturn && state.eyedropperReturn !== "eyedropper" ? state.eyedropperReturn : "pen";
    setTool(next);
  }

  function startLasso(pointerId, point, shift) {
    state.active = {
      kind: "lasso",
      pointerId,
      points: [point],
      shift,
    };
    canvas.style.cursor = "crosshair";
    redraw();
  }

  function queueLasso(point, shift) {
    if (!state.active || state.active.kind !== "lasso") {
      return;
    }
    state.active.shift = shift;
    const last = state.active.points[state.active.points.length - 1];
    if (last && distance(last, point) < viewLen(2)) {
      return;
    }
    state.active.points.push(point);
    if (!state.raf) {
      state.raf = requestAnimationFrame(flushLasso);
    }
  }

  function flushLasso() {
    state.raf = 0;
    if (!state.active || state.active.kind !== "lasso") {
      return;
    }
    redraw();
  }

  function finishLasso(pointerId) {
    if (!state.active || state.active.kind !== "lasso" || state.active.pointerId !== pointerId) {
      return;
    }
    if (state.raf) {
      cancelAnimationFrame(state.raf);
      state.raf = 0;
    }
    const points = state.active.points;
    const additive = state.active.shift;
    state.active = null;
    releasePointer(pointerId);

    let hits;
    if (points.length < 3) {
      const object = hitObject(points[0]);
      hits = object ? [object.id] : [];
    } else {
      hits = state.objects
        .filter((object) => isSelectable(object) && pointInPolygon(getCenter(object), points))
        .map((object) => object.id);
    }
    const ids = expandGroupIds(hits);
    if (additive) {
      setSelection([...new Set([...state.selectedIds, ...ids])]);
    } else {
      setSelection(ids);
    }
    canvas.style.cursor = "";
    redraw();
  }

  function flipSelected(axis) {
    const objects = selectedObjects();
    if (!objects.length) {
      return;
    }
    captureBefore();
    const bounds = unionBounds(objects.map(objectWorldBounds));
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    for (const object of objects) {
      const center = getCenter(object);
      if (axis === "h") {
        translateObject(object, 2 * (cx - center.x), 0);
        object.flipX = !object.flipX;
        object.rotation = -(object.rotation || 0);
      } else {
        translateObject(object, 0, 2 * (cy - center.y));
        object.flipY = !object.flipY;
        object.rotation = -(object.rotation || 0);
      }
    }
    commitIfChanged();
    syncImageUI();
    redraw();
  }

  function openImagePicker() {
    imageFileInput.value = "";
    imageFileInput.click();
  }

  function syncTeachUI() {
    const pressed = (selector, on) => {
      for (const button of toolbar.querySelectorAll(selector)) {
        button.setAttribute("aria-pressed", String(Boolean(on)));
      }
    };
    pressed('[data-action="toggle-grid"]', state.showGrid);
    pressed('[data-action="toggle-rulers"]', state.showRulers);
    pressed('[data-action="toggle-guides"]', state.showGuides);
    pressed('[data-action="toggle-spotlight"]', state.spotlight);
    pressed('[data-action="toggle-freeze"]', state.frozen);
    pressed('[data-action="fullscreen"]', Boolean(document.fullscreenElement));
    appEl.classList.toggle("is-frozen", state.frozen);
    const parts = [];
    if (state.frozen) {
      parts.push("Frozen");
    }
    if (state.spotlight) {
      parts.push("Spotlight");
    }
    if (state.active && state.active.kind === "measure") {
      parts.push(formatLength(distance(state.active.start, state.active.point)));
    } else if (state.active && state.active.kind === "protractor") {
      parts.push(formatAngle(state.active.start, state.active.point));
    }
    if (parts.length) {
      teachStatus.hidden = false;
      teachStatus.textContent = parts.join(" · ");
    } else {
      teachStatus.hidden = true;
      teachStatus.textContent = "";
    }
  }

  function toggleFlag(name) {
    state[name] = !state[name];
    if (name === "showRulers" && state.showRulers) {
      state.showGuides = true;
    }
    if (name === "spotlight" && state.spotlight && !state.pointerWorld) {
      state.pointerWorld = screenToWorld(viewportCenter());
    }
    if (name === "frozen" && state.frozen) {
      finishOpenWork();
      if (state.tool !== "pan" && state.tool !== "laser") {
        setTool("laser");
      }
    }
    syncTeachUI();
    redraw();
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }
    appEl.requestFullscreen().catch(() => {});
  }

  function closeConfirmDialog() {
    confirmDialog.hidden = true;
    confirmCallback = null;
  }

  function openConfirmDialog(title, message, okLabel, onConfirm) {
    finishOpenWork();
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmOk.textContent = okLabel;
    confirmCallback = onConfirm;
    confirmDialog.hidden = false;
    confirmOk.focus();
  }

  function requestClearBoard() {
    if (state.frozen) {
      return;
    }
    openConfirmDialog(
      "Clear this page?",
      "Drawings on this page will be removed. The page template stays.",
      "Clear",
      () => {
        if (!state.objects.length) {
          return;
        }
        captureBefore();
        state.objects.splice(0, state.objects.length);
        clearSelection();
        commitIfChanged();
        redraw();
      }
    );
  }

  function insertMathSymbol(symbol) {
    if (!symbol || state.frozen) {
      return;
    }
    const center = snapPoint(viewportWorldCenter());
    beginInsert();
    const object = createTextLike("text", {
      x: center.x - 28,
      y: center.y - 28,
      width: 56,
      height: 56,
    });
    object.text = symbol;
    object.align = "center";
    object.fontSize = 32;
    object.textBack = null;
    reflowTextHeight(object);
    state.objects.push(object);
    finishInsert([object.id]);
  }

  function pushLaserTrail(point) {
    state.pointerWorld = point;
    const last = state.laserTrail[state.laserTrail.length - 1];
    if (last && distance(last, point) < viewLen(2)) {
      return;
    }
    state.laserTrail.push(point);
    if (state.laserTrail.length > 18) {
      state.laserTrail.shift();
    }
  }

  function hitRulerEdge(screen) {
    if (!state.showRulers) {
      return null;
    }
    if (screen.x <= RULER_SIZE && screen.y <= RULER_SIZE) {
      return null;
    }
    if (screen.x <= RULER_SIZE) {
      return "x";
    }
    if (screen.y <= RULER_SIZE) {
      return "y";
    }
    return null;
  }

  function hitGuide(point) {
    if (!state.showGuides) {
      return -1;
    }
    const threshold = viewLen(5);
    const guides = pageGuides();
    for (let i = guides.length - 1; i >= 0; i -= 1) {
      const guide = guides[i];
      if (guide.axis === "x" && Math.abs(point.x - guide.pos) <= threshold) {
        return i;
      }
      if (guide.axis === "y" && Math.abs(point.y - guide.pos) <= threshold) {
        return i;
      }
    }
    return -1;
  }

  function startGuideDrag(pointerId, axis, pos, index) {
    state.active = {
      kind: "guide",
      pointerId,
      axis,
      index,
      pos,
    };
    if (index < 0) {
      pageGuides().push({ axis, pos });
      state.active.index = pageGuides().length - 1;
      state.showGuides = true;
    }
    canvas.style.cursor = axis === "x" ? "ew-resize" : "ns-resize";
    syncTeachUI();
    redraw();
  }

  function moveGuide(point) {
    const drag = state.active;
    if (!drag || drag.kind !== "guide") {
      return;
    }
    const page = currentPage();
    const guides = pageGuides();
    const guide = guides[drag.index];
    if (!guide || !page) {
      return;
    }
    if (guide.axis === "x") {
      guide.pos = Math.max(0, Math.min(page.width, snapPoint(point).x));
    } else {
      guide.pos = Math.max(0, Math.min(page.height, snapPoint(point).y));
    }
    if (!state.raf) {
      state.raf = requestAnimationFrame(() => {
        state.raf = 0;
        redraw();
      });
    }
  }

  function finishGuide(pointerId) {
    if (!state.active || state.active.kind !== "guide" || state.active.pointerId !== pointerId) {
      return;
    }
    const page = currentPage();
    const guides = pageGuides();
    const guide = guides[state.active.index];
    if (guide && page) {
      const off =
        guide.axis === "x"
          ? guide.pos <= 0 || guide.pos >= page.width
          : guide.pos <= 0 || guide.pos >= page.height;
      if (off) {
        guides.splice(state.active.index, 1);
      }
    }
    state.active = null;
    releasePointer(pointerId);
    canvas.style.cursor = "";
    redraw();
  }

  function startMeasure(kind, pointerId, point) {
    const start = snapPoint(point);
    state.active = { kind, pointerId, start, point: start };
    canvas.style.cursor = "crosshair";
    syncTeachUI();
    redraw();
  }

  function moveMeasure(point) {
    if (!state.active || (state.active.kind !== "measure" && state.active.kind !== "protractor")) {
      return;
    }
    state.active.point = snapPoint(point);
    if (!state.raf) {
      state.raf = requestAnimationFrame(() => {
        state.raf = 0;
        syncTeachUI();
        redraw();
      });
    }
  }

  function finishMeasure(pointerId) {
    if (
      !state.active ||
      (state.active.kind !== "measure" && state.active.kind !== "protractor") ||
      state.active.pointerId !== pointerId
    ) {
      return;
    }
    state.active = null;
    releasePointer(pointerId);
    syncTeachUI();
    redraw();
  }

  function viewportWorldCenter() {
    return screenToWorld(viewportCenter());
  }

  function syncLinkUI() {
    linkOpenBtn.disabled = !selectedLink();
  }

  function sanitizeHref(value) {
    const trimmed = String(value || "").trim();
    if (!trimmed) {
      return "";
    }
    const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      const url = new URL(withProtocol);
      if (url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:") {
        return url.href;
      }
    } catch (error) {
      return "";
    }
    return "";
  }

  function linkLabelFromHref(href) {
    try {
      const url = new URL(href);
      if (url.protocol === "mailto:") {
        return url.pathname || href;
      }
      return url.hostname.replace(/^www\./, "") || href;
    } catch (error) {
      return href;
    }
  }

  function measureLinkBox(object) {
    applyTextMeasure({ ...object, fontSize: object.fontSize || 16 });
    const label = object.text || object.href || "Link";
    const width = Math.ceil(ctx.measureText(label).width) + 24;
    const height = Math.max(32, Math.round((object.fontSize || 16) * 1.8));
    if ("letterSpacing" in ctx) {
      ctx.letterSpacing = "0px";
    }
    return { width: Math.max(96, width), height };
  }

  function closeLinkDialog() {
    linkDialog.hidden = true;
    linkError.hidden = true;
    linkDialogTargetId = null;
  }

  function openLinkDialog(object) {
    finishOpenWork();
    linkDialogTargetId = object ? object.id : null;
    linkTitle.textContent = object ? "Edit link" : "Insert link";
    linkForm.querySelector("[type='submit']").textContent = object ? "Save" : "Insert";
    linkTextInput.value = object ? object.text || "" : "";
    linkHrefInput.value = object ? object.href || "" : "";
    linkError.hidden = true;
    linkDialog.hidden = false;
    linkHrefInput.focus();
    linkHrefInput.select();
  }

  function commitLinkDialog() {
    const href = sanitizeHref(linkHrefInput.value);
    if (!href) {
      linkError.hidden = false;
      linkHrefInput.focus();
      return false;
    }
    const text = (linkTextInput.value || "").trim() || linkLabelFromHref(href);
    const existing = linkDialogTargetId ? findObject(linkDialogTargetId) : null;
    if (existing && isLink(existing)) {
      captureBefore();
      existing.href = href;
      existing.text = text;
      const size = measureLinkBox(existing);
      existing.width = Math.max(existing.width, size.width);
      existing.height = Math.max(32, size.height);
      commitIfChanged();
      closeLinkDialog();
      redraw();
      return true;
    }

    const size = measureLinkBox({ text, href, fontSize: 16, fontKey: state.fontKey });
    const center = viewportWorldCenter();
    captureBefore();
    const object = {
      id: createId(),
      type: "link",
      x: center.x - size.width / 2,
      y: center.y - size.height / 2,
      width: size.width,
      height: size.height,
      text,
      href,
      color: SELECT_COLOR,
      fontSize: 16,
      fontKey: state.fontKey,
      bold: false,
      italic: false,
      textBack: "rgb(204 251 241 / 0.85)",
      rotation: 0,
    };
    state.objects.push(object);
    setTool("select");
    setSelection([object.id]);
    commitIfChanged();
    closeLinkDialog();
    redraw();
    return true;
  }

  function openExternalLink(href) {
    const safe = sanitizeHref(href);
    if (!safe) {
      return;
    }
    window.open(safe, "_blank", "noopener,noreferrer");
  }

  function openSelectedLink() {
    const link = selectedLink();
    if (link) {
      openExternalLink(link.href);
    }
  }

  function beginInsert() {
    finishOpenWork();
    captureBefore();
  }

  function finishInsert(ids) {
    setTool("select");
    setSelection(ids);
    commitIfChanged();
    redraw();
  }

  function insertTextLikeAtCenter(type) {
    const size = type === "sticky" ? STICKY_DEFAULT : TEXT_DEFAULT;
    const center = viewportWorldCenter();
    beginInsert();
    const object = createTextLike(type, {
      x: center.x - size.width / 2,
      y: center.y - size.height / 2,
      width: size.width,
      height: size.height,
    });
    state.objects.push(object);
    setTool("select");
    setSelection([object.id]);
    startEditing(object, true);
  }

  function insertDefaultShape(type) {
    const center = snapPoint(viewportWorldCenter());
    let start;
    let end;
    if (type === "line" || type === "arrow") {
      start = { x: center.x - 90, y: center.y };
      end = { x: center.x + 90, y: center.y };
    } else {
      start = { x: center.x - 80, y: center.y - 50 };
      end = { x: center.x + 80, y: center.y + 50 };
    }
    beginInsert();
    const object = { id: createId(), ...makeShape(type, start, end, false) };
    state.objects.push(object);
    finishInsert([object.id]);
  }

  function insertDiagram() {
    const center = viewportWorldCenter();
    const boxW = 120;
    const boxH = 56;
    const gap = 44;
    const total = boxW * 3 + gap * 2;
    const x0 = center.x - total / 2;
    const y = center.y - boxH / 2;
    const labels = ["Start", "Process", "End"];
    beginInsert();
    const groupId = createId();
    const boxes = labels.map((label, index) => ({
      id: createId(),
      type: "roundrect",
      x: x0 + index * (boxW + gap),
      y,
      width: boxW,
      height: boxH,
      stroke: state.stroke,
      fill: state.fill || "#ccfbf1",
      size: state.size,
      radius: ROUND_RECT_RADIUS,
      rotation: 0,
      groupId,
    }));
    const notes = labels.map((label, index) => {
      const object = createTextLike("text", {
        x: boxes[index].x + 8,
        y: boxes[index].y + 10,
        width: boxW - 16,
        height: boxH - 16,
      });
      object.text = label;
      object.align = "center";
      object.fontSize = 16;
      object.groupId = groupId;
      object.textBack = null;
      reflowTextHeight(object);
      return object;
    });
    const arrows = [0, 1].map((index) => ({
      id: createId(),
      type: "arrow",
      x1: boxes[index].x + boxes[index].width,
      y1: boxes[index].y + boxes[index].height / 2,
      x2: boxes[index + 1].x,
      y2: boxes[index + 1].y + boxes[index + 1].height / 2,
      stroke: state.stroke,
      size: state.size,
      rotation: 0,
      groupId,
    }));
    const objects = [...boxes, ...notes, ...arrows];
    for (const item of objects) {
      state.objects.push(item);
    }
    finishInsert(objects.map((item) => item.id));
  }

  function insertTable() {
    const center = viewportWorldCenter();
    const width = TABLE_DEFAULT_COLS * 110;
    const height = TABLE_DEFAULT_ROWS * 36;
    beginInsert();
    const object = createTableObject(center.x - width / 2, center.y - height / 2);
    state.objects.push(object);
    state.tableCell = { id: object.id, r: 0, c: 0 };
    state.tableRange = null;
    finishInsert([object.id]);
  }

  function tableSelectCell(object, r, c, range) {
    const origin = tableOrigin(object, r, c) || { r, c };
    state.tableCell = { id: object.id, r: origin.r, c: origin.c };
    state.tableRange = range || null;
    syncFormatFromSelection();
    syncTableUI();
  }

  function runTableAction(action) {
    const sel = getTableSelection();
    if (!sel) {
      return;
    }
    if (action === "table-row-add") {
      tableInsertRow(sel);
    } else if (action === "table-row-del") {
      tableDeleteRow(sel);
    } else if (action === "table-col-add") {
      tableInsertCol(sel);
    } else if (action === "table-col-del") {
      tableDeleteCol(sel);
    } else if (action === "table-merge") {
      tableMerge(sel);
    } else if (action === "table-unmerge") {
      tableSplitMerge(sel);
    }
  }

  function tableInsertRow(sel) {
    const object = sel.object;
    const at = sel.r2 + 1;
    const cols = tableColCount(object);
    captureBefore();
    for (let r = 0; r < object.cells.length; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const cell = object.cells[r][c];
        if (cell && !cell.covered && (cell.rowspan || 1) > 1 && r < at && r + cell.rowspan > at) {
          cell.rowspan += 1;
        }
      }
    }
    const newRow = [];
    for (let c = 0; c < cols; c += 1) {
      let covered = false;
      let origin = null;
      for (let r = 0; r < at; r += 1) {
        const cell = object.cells[r][c];
        if (cell && !cell.covered && (cell.rowspan || 1) > 1 && r + cell.rowspan > at) {
          covered = true;
          origin = tableOrigin(object, r, c);
          break;
        }
      }
      newRow.push(covered && origin ? { covered: true, origin: { r: origin.r, c: origin.c } } : createTableCell());
    }
    object.cells.splice(at, 0, newRow);
    for (let r = at + 1; r < object.cells.length; r += 1) {
      for (const cell of object.cells[r]) {
        if (cell && cell.covered && cell.origin && cell.origin.r >= at) {
          cell.origin.r += 1;
        }
      }
    }
    object.rowH.splice(at, 0, 1 / (object.rowH.length + 1));
    object.rowH = normalizeFractions(object.rowH);
    object.height += Math.max(TABLE_CELL_MIN, object.height / Math.max(1, object.cells.length - 1));
    tableSelectCell(object, at, sel.c1);
    commitIfChanged();
    redraw();
  }

  function tableInsertCol(sel) {
    const object = sel.object;
    const at = sel.c2 + 1;
    captureBefore();
    for (let r = 0; r < object.cells.length; r += 1) {
      for (let c = 0; c < object.cells[r].length; c += 1) {
        const cell = object.cells[r][c];
        if (cell && !cell.covered && (cell.colspan || 1) > 1 && c < at && c + cell.colspan > at) {
          cell.colspan += 1;
        }
      }
    }
    for (let r = 0; r < object.cells.length; r += 1) {
      let covered = false;
      let origin = null;
      for (let c = 0; c < at; c += 1) {
        const cell = object.cells[r][c];
        if (cell && !cell.covered && (cell.colspan || 1) > 1 && c + cell.colspan > at) {
          covered = true;
          origin = tableOrigin(object, r, c);
          break;
        }
      }
      object.cells[r].splice(
        at,
        0,
        covered && origin ? { covered: true, origin: { r: origin.r, c: origin.c } } : createTableCell()
      );
      for (let c = at + 1; c < object.cells[r].length; c += 1) {
        const cell = object.cells[r][c];
        if (cell && cell.covered && cell.origin && cell.origin.c >= at) {
          cell.origin.c += 1;
        }
      }
    }
    object.colW.splice(at, 0, 1 / (object.colW.length + 1));
    object.colW = normalizeFractions(object.colW);
    object.width += Math.max(TABLE_CELL_MIN, object.width / Math.max(1, object.colW.length - 1));
    tableSelectCell(object, sel.r1, at);
    commitIfChanged();
    redraw();
  }

  function tableDeleteRow(sel) {
    const object = sel.object;
    if (tableRowCount(object) < 2) {
      return;
    }
    const at = sel.r1;
    captureBefore();
    unmergeTableIntersects(object, at, 0, at, tableColCount(object) - 1);
    object.cells.splice(at, 1);
    for (const row of object.cells) {
      for (const cell of row) {
        if (cell && cell.covered && cell.origin && cell.origin.r > at) {
          cell.origin.r -= 1;
        }
      }
    }
    object.rowH.splice(at, 1);
    object.rowH = normalizeFractions(object.rowH);
    object.height = Math.max(TABLE_CELL_MIN * object.cells.length, object.height - TABLE_CELL_MIN);
    const r = Math.min(at, object.cells.length - 1);
    tableSelectCell(object, r, sel.c1);
    commitIfChanged();
    redraw();
  }

  function tableDeleteCol(sel) {
    const object = sel.object;
    if (tableColCount(object) < 2) {
      return;
    }
    const at = sel.c1;
    captureBefore();
    unmergeTableIntersects(object, 0, at, tableRowCount(object) - 1, at);
    for (const row of object.cells) {
      row.splice(at, 1);
      for (const cell of row) {
        if (cell && cell.covered && cell.origin && cell.origin.c > at) {
          cell.origin.c -= 1;
        }
      }
    }
    object.colW.splice(at, 1);
    object.colW = normalizeFractions(object.colW);
    object.width = Math.max(TABLE_CELL_MIN * object.colW.length, object.width - TABLE_CELL_MIN);
    const c = Math.min(at, object.colW.length - 1);
    tableSelectCell(object, sel.r1, c);
    commitIfChanged();
    redraw();
  }

  function tableMerge(sel) {
    if (sel.r1 === sel.r2 && sel.c1 === sel.c2) {
      return;
    }
    const object = sel.object;
    for (let r = sel.r1; r <= sel.r2; r += 1) {
      for (let c = sel.c1; c <= sel.c2; c += 1) {
        const origin = tableOrigin(object, r, c);
        if (!origin || origin.r < sel.r1 || origin.r > sel.r2 || origin.c < sel.c1 || origin.c > sel.c2) {
          return;
        }
      }
    }
    captureBefore();
    const texts = [];
    for (let r = sel.r1; r <= sel.r2; r += 1) {
      for (let c = sel.c1; c <= sel.c2; c += 1) {
        const origin = tableOrigin(object, r, c);
        const cell = origin ? tableCellAt(object, origin.r, origin.c) : null;
        if (cell && !cell.covered && cell.text) {
          texts.push(cell.text);
        }
      }
    }
    unmergeTableIntersects(object, sel.r1, sel.c1, sel.r2, sel.c2);
    const origin = object.cells[sel.r1][sel.c1];
    origin.colspan = sel.c2 - sel.c1 + 1;
    origin.rowspan = sel.r2 - sel.r1 + 1;
    origin.covered = false;
    origin.origin = null;
    origin.text = texts.join("\n");
    for (let r = sel.r1; r <= sel.r2; r += 1) {
      for (let c = sel.c1; c <= sel.c2; c += 1) {
        if (r === sel.r1 && c === sel.c1) {
          continue;
        }
        object.cells[r][c] = { covered: true, origin: { r: sel.r1, c: sel.c1 } };
      }
    }
    tableSelectCell(object, sel.r1, sel.c1);
    commitIfChanged();
    redraw();
  }

  function tableSplitMerge(sel) {
    const object = sel.object;
    captureBefore();
    if (!unmergeTableCell(object, sel.r1, sel.c1)) {
      discardHistoryCapture();
      return;
    }
    tableSelectCell(object, sel.r1, sel.c1);
    commitIfChanged();
    redraw();
  }

  function stepTableCell(object, r, c, dc, dr) {
    const rows = tableRowCount(object);
    const cols = tableColCount(object);
    if (!rows || !cols) {
      return { r, c };
    }
    if (dc !== 0) {
      let index = r * cols + c + dc;
      const total = rows * cols;
      index = ((index % total) + total) % total;
      const next = tableOrigin(object, Math.floor(index / cols), index % cols);
      return next || { r, c };
    }
    const row = ((r + dr) % rows + rows) % rows;
    const next = tableOrigin(object, row, c);
    return next || { r, c };
  }

  function moveTableEdit(dc, dr) {
    const object = findObject(state.editingId);
    const cellRef = state.editingCell;
    if (!isTable(object) || !cellRef) {
      return;
    }
    const next = stepTableCell(object, cellRef.r, cellRef.c, dc, dr);
    finishEditing();
    tableSelectCell(object, next.r, next.c);
    startTableCellEdit(object, next.r, next.c);
  }

  // Add a data-insert button and a case here to extend the Insert tab.
  function runInsert(name) {
    if (name === "text" || name === "sticky") {
      insertTextLikeAtCenter(name);
      return;
    }
    if (SHAPE_TOOLS.includes(name)) {
      insertDefaultShape(name);
      return;
    }
    if (name === "image") {
      openImagePicker();
      return;
    }
    if (name === "page") {
      addPage();
      return;
    }
    if (name === "link") {
      openLinkDialog();
      return;
    }
    if (name === "diagram") {
      insertDiagram();
      return;
    }
    if (name === "table") {
      insertTable();
    }
  }

  function styleEditor(object) {
    const italic = object.italic ? "italic " : "";
    const weight = object.bold ? "700 " : "400 ";
    const size = (object.fontSize || 24) * state.zoom;
    const pad = textPad(object);
    const padX = (pad + textIndentWidth(object)) * state.zoom;
    const padY = pad * state.zoom;
    editor.style.font = `${italic}${weight}${size}px ${objectFontFamily(object)}`;
    editor.style.color = object.color || "#1c1917";
    editor.style.textAlign = object.align || "left";
    editor.style.padding = `${padY}px ${pad * state.zoom}px ${padY}px ${padX}px`;
    editor.style.lineHeight = String(object.lineHeight || 1.35);
    editor.style.letterSpacing = `${(object.letterSpacing || 0) * state.zoom}px`;
    editor.style.textDecoration = [object.underline ? "underline" : "", object.strike ? "line-through" : ""]
      .filter(Boolean)
      .join(" ") || "none";
    if (object.type === "sticky") {
      editor.style.background = "transparent";
    } else {
      editor.style.background = object.textBack || "rgb(255 255 255 / 0.94)";
    }
    editor.classList.toggle("is-sticky", object.type === "sticky");
    editor.classList.toggle("is-table-cell", Boolean(object.pad === TABLE_PAD));
  }

  function positionEditor(object) {
    if (isTable(object) && state.editingCell) {
      const rect = tableCellRect(object, state.editingCell.r, state.editingCell.c);
      const cell = tableCellAt(object, state.editingCell.r, state.editingCell.c);
      if (!rect || !cell) {
        return;
      }
      editor.style.left = `${rect.x * state.zoom + state.panX}px`;
      editor.style.top = `${rect.y * state.zoom + state.panY}px`;
      editor.style.width = `${rect.width * state.zoom}px`;
      editor.style.height = `${rect.height * state.zoom}px`;
      editor.style.transform = object.rotation ? `rotate(${object.rotation}rad)` : "none";
      editor.style.transformOrigin = "center center";
      styleEditor(tableGhost(cell, rect));
      return;
    }
    editor.style.left = `${object.x * state.zoom + state.panX}px`;
    editor.style.top = `${object.y * state.zoom + state.panY}px`;
    editor.style.width = `${object.width * state.zoom}px`;
    editor.style.height = `${object.height * state.zoom}px`;
    editor.style.transform = object.rotation
      ? `rotate(${object.rotation}rad)`
      : "none";
    editor.style.transformOrigin = "center center";
    styleEditor(object);
  }

  function hideEditor() {
    editor.hidden = true;
    editor.value = "";
    state.editingId = null;
    state.editingCell = null;
    editor.classList.remove("is-table-cell");
  }

  function startTableCellEdit(object, r, c) {
    if (!isTable(object) || state.frozen) {
      return;
    }
    const origin = tableOrigin(object, r, c);
    const cell = origin ? tableCellAt(object, origin.r, origin.c) : null;
    if (!cell || cell.covered) {
      return;
    }
    if (state.editingId && state.editingId !== object.id) {
      finishEditing();
    }
    if (!state.editingId) {
      captureBefore();
    }
    state.editingId = object.id;
    state.editingIsNew = false;
    state.editingCell = { r: origin.r, c: origin.c };
    tableSelectCell(object, origin.r, origin.c);
    loadStyleFromTableCell(cell);
    syncFormatUI();
    syncColorUI();
    editor.hidden = false;
    editor.value = cell.text || "";
    positionEditor(object);
    redraw();
    editor.focus();
    editor.setSelectionRange(editor.value.length, editor.value.length);
  }

  function startEditing(object, isNew) {
    if (!isTextLike(object)) {
      return;
    }

    if (!isNew) {
      captureBefore();
    }

    state.editingId = object.id;
    state.editingIsNew = Boolean(isNew);
    editor.hidden = false;
    editor.value = object.text || "";
    positionEditor(object);
    redraw();
    editor.focus();
    editor.setSelectionRange(editor.value.length, editor.value.length);
  }

  function cancelEditing() {
    if (!state.editingId) {
      return;
    }

    hideEditor();
    state.editingIsNew = false;
    if (state.historyBefore) {
      restoreBoard(state.historyBefore);
      discardHistoryCapture();
    } else {
      redraw();
    }
  }

  function finishEditing() {
    if (!state.editingId) {
      return;
    }

    const object = findObject(state.editingId);
    const cellRef = state.editingCell;
    const text = editor.value;
    hideEditor();

    if (!object) {
      discardHistoryCapture();
      state.editingIsNew = false;
      redraw();
      return;
    }

    if (isTable(object) && cellRef) {
      const cell = tableCellAt(object, cellRef.r, cellRef.c);
      if (cell) {
        cell.text = text;
      }
      commitIfChanged();
      redraw();
      state.editingIsNew = false;
      return;
    }

    object.text = text;
    if (isTextLike(object)) {
      reflowTextHeight(object);
    }
    if (object.type === "text" && !text.trim()) {
      if (state.editingIsNew && state.historyBefore) {
        restoreBoard(state.historyBefore);
        discardHistoryCapture();
        state.editingIsNew = false;
        return;
      }

      state.objects = state.objects.filter((item) => item.id !== object.id);
      setSelection(state.selectedIds.filter((id) => id !== object.id));
    }

    commitIfChanged();
    redraw();
    state.editingIsNew = false;
  }

  function createTextLike(type, bounds) {
    const base = {
      id: createId(),
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      text: "",
      color: state.stroke,
      fontSize: state.fontSize,
      fontKey: state.fontKey,
      bold: state.bold,
      italic: state.italic,
      underline: state.underline,
      strike: state.strike,
      align: state.align,
      lineHeight: state.lineHeight,
      letterSpacing: state.letterSpacing,
      paragraphSpacing: state.paragraphSpacing,
      textBack: state.textBack,
      list: state.list,
      indent: state.indent,
      rotation: 0,
    };

    if (type === "sticky") {
      return {
        ...base,
        type: "sticky",
        fill: state.fill || STICKY_FILL,
      };
    }

    return {
      ...base,
      type: "text",
    };
  }

  function defaultTextBounds(type, point) {
    const size = type === "sticky" ? STICKY_DEFAULT : TEXT_DEFAULT;
    return {
      x: point.x,
      y: point.y,
      width: size.width,
      height: size.height,
    };
  }

  function startTextBox(pointerId, point, type) {
    const existing = hitObject(point);
    if (existing && existing.type === type) {
      setSelection([existing.id]);
      startEditing(existing, false);
      return;
    }

    clearSelection();
    state.active = {
      kind: "textbox",
      pointerId,
      textType: type,
      start: point,
      point,
    };
    queueTextboxPreview(point);
  }

  function queueTextboxPreview(point) {
    if (!state.active || state.active.kind !== "textbox") {
      return;
    }

    state.active.point = point;
    if (!state.raf) {
      state.raf = requestAnimationFrame(flushTextboxPreview);
    }
  }

  function flushTextboxPreview() {
    state.raf = 0;
    if (!state.active || state.active.kind !== "textbox") {
      return;
    }

    const bounds = normalizedBounds(state.active.start, state.active.point);
    state.preview = {
      type: state.active.textType === "sticky" ? "roundrect" : "rect",
      ...bounds,
      radius: 8,
      stroke: SELECT_COLOR,
      fill: state.active.textType === "sticky" ? state.fill || STICKY_FILL : null,
      size: 1,
      rotation: 0,
    };
    redraw();
  }

  function finishTextBox(pointerId) {
    if (!state.active || state.active.kind !== "textbox" || state.active.pointerId !== pointerId) {
      return;
    }

    if (state.raf) {
      cancelAnimationFrame(state.raf);
      flushTextboxPreview();
    }

    const type = state.active.textType;
    const start = state.active.start;
    const point = state.active.point;
    const dragged = normalizedBounds(start, point);
    state.preview = null;
    state.active = null;
    releasePointer(pointerId);

    const isClick = dragged.width < 8 && dragged.height < 8;
    const bounds = isClick
      ? defaultTextBounds(type, start)
      : {
          x: dragged.x,
          y: dragged.y,
          width: Math.max(dragged.width, type === "sticky" ? 120 : 160),
          height: Math.max(dragged.height, type === "sticky" ? 120 : 48),
        };

    captureBefore();
    const object = createTextLike(type, bounds);
    state.objects.push(object);
    setSelection([object.id]);
    startEditing(object, true);
  }

  function applyFormatChange(commit) {
    const shouldCommit = commit !== false;
    syncFormatUI();
    if (state.editingId) {
      const object = findObject(state.editingId);
      if (isTable(object) && state.editingCell) {
        const cell = tableCellAt(object, state.editingCell.r, state.editingCell.c);
        if (cell) {
          applyStyleToTableCell(cell);
        }
        positionEditor(object);
        redraw();
        return;
      }
      if (isTextLike(object)) {
        object.color = state.stroke;
        object.fontSize = state.fontSize;
        object.fontKey = state.fontKey;
        object.bold = state.bold;
        object.italic = state.italic;
        object.underline = state.underline;
        object.strike = state.strike;
        object.align = state.align;
        object.lineHeight = state.lineHeight;
        object.letterSpacing = state.letterSpacing;
        object.paragraphSpacing = state.paragraphSpacing;
        object.textBack = state.textBack;
        object.list = state.list;
        object.indent = state.indent;
        if (object.type === "sticky") {
          object.fill = state.fill || object.fill || STICKY_FILL;
        }
        reflowTextHeight(object);
        positionEditor(object);
        redraw();
      }
      return;
    }

    if (state.selectedIds.length > 0 && !state.active) {
      if (!state.historyBefore) {
        captureBefore();
      }
      applyStyleToSelected();
      redraw();
      if (shouldCommit) {
        commitIfChanged();
      }
    }
  }

  function cursorForHandle(handle) {
    if (handle === "rotate") {
      return "grab";
    }
    if (handle === "e" || handle === "w") {
      return "ew-resize";
    }
    if (handle === "n" || handle === "s") {
      return "ns-resize";
    }
    if (handle === "nw" || handle === "se") {
      return "nwse-resize";
    }
    if (handle === "ne" || handle === "sw") {
      return "nesw-resize";
    }
    return "default";
  }

  function updateSelectCursor(point) {
    if (state.spacePan || state.tool === "pan") {
      canvas.style.cursor = state.active && state.active.kind === "pan" ? "grabbing" : "grab";
      return;
    }

    if (state.tool !== "select" || state.active) {
      return;
    }

    const handle = hitHandle(point);
    if (handle) {
      canvas.style.cursor = cursorForHandle(handle);
      return;
    }

    const split = hitTableSplit(point);
    if (split) {
      canvas.style.cursor = split.kind === "col" ? "col-resize" : "row-resize";
      return;
    }

    const object = hitObject(point);
    canvas.style.cursor = isLink(object) ? "pointer" : object ? "move" : "default";
  }

  function onSelectPointerDown(event, point) {
    const handle = hitHandle(point);
    if (handle) {
      captureBefore();
      const mode = handle === "rotate" ? "rotate" : state.cropping && isImage(findObject(state.selectedIds[0])) ? "crop" : "resize";
      canvas.style.cursor = handle === "rotate" ? "grabbing" : cursorForHandle(handle);
      startTransform(mode, handle, point, event.pointerId);
      state.active.shift = event.shiftKey;
      return;
    }

    const split = hitTableSplit(point);
    if (split) {
      captureBefore();
      startTransform("table-split", null, point, event.pointerId);
      state.active.split = split;
      canvas.style.cursor = split.kind === "col" ? "col-resize" : "row-resize";
      return;
    }

    const object = hitObject(point);
    if (object) {
      if (isLink(object) && (event.ctrlKey || event.metaKey) && !event.shiftKey) {
        setSelection([object.id]);
        openExternalLink(object.href);
        redraw();
        return;
      }

      const groupIds = expandGroupIds([object.id]);
      if (isTable(object) && event.shiftKey && state.selectedIds.length === 1 && state.selectedIds[0] === object.id) {
        const cell = hitTableCell(object, objectLocalPoint(object, point));
        if (cell) {
          const from = state.tableCell && state.tableCell.id === object.id ? state.tableCell : cell;
          state.tableRange = { r1: from.r, c1: from.c, r2: cell.r, c2: cell.c };
          state.tableCell = { id: object.id, r: from.r, c: from.c };
          syncFormatFromSelection();
          syncTableUI();
          redraw();
          return;
        }
      }
      if (event.shiftKey) {
        const allSelected = groupIds.every((id) => state.selectedIds.includes(id));
        if (allSelected) {
          setSelection(state.selectedIds.filter((id) => !groupIds.includes(id)));
        } else {
          setSelection([...new Set([...state.selectedIds, ...groupIds])]);
        }
        redraw();
        return;
      }

      if (!state.selectedIds.includes(object.id)) {
        setSelection(groupIds);
      }

      if (isTable(object)) {
        const cell = hitTableCell(object, objectLocalPoint(object, point));
        if (cell) {
          tableSelectCell(object, cell.r, cell.c);
        }
      }

      captureBefore();
      startTransform("move", null, point, event.pointerId);
      redraw();
      return;
    }

    if (!event.shiftKey) {
      clearSelection();
    }

    state.active = {
      kind: "marquee",
      pointerId: event.pointerId,
      start: point,
      point,
      shift: event.shiftKey,
    };
    canvas.style.cursor = "crosshair";
    redraw();
  }

  function flushPoints() {
    state.raf = 0;
    const stroke = state.active && state.active.kind === "stroke" && state.active.stroke;
    const points = state.queuedPoints;
    state.queuedPoints = [];

    if (!stroke || points.length === 0) {
      return;
    }

    let prev = stroke.points[stroke.points.length - 1];
    const added = [];
    for (const point of points) {
      if (prev && point.x === prev.x && point.y === prev.y) {
        continue;
      }

      added.push(point);
      prev = point;
    }

    if (added.length === 0) {
      return;
    }

    if (stroke.tool === "spray") {
      for (const point of added) {
        scatterSpray(stroke, point);
      }
      redraw();
      return;
    }

    const from = stroke.points[stroke.points.length - 1];
    for (const point of added) {
      stroke.points.push(point);
    }

    if (strokeNeedsRedraw(stroke)) {
      redraw();
      return;
    }

    ctx.save();
    configureStroke(stroke);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    for (const point of added) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function flushShapePreview() {
    state.raf = 0;
    if (!state.active || state.active.kind !== "shape" || !state.active.point) {
      return;
    }

    state.preview = makeShape(
      state.active.shapeType,
      state.active.start,
      state.active.point,
      state.active.shift
    );
    redraw();
  }

  function queuePoint(point) {
    if (!state.active || state.active.kind !== "stroke") {
      return;
    }

    state.queuedPoints.push(point);
    if (!state.raf) {
      state.raf = requestAnimationFrame(flushPoints);
    }
  }

  function queueShapePreview(point, shift) {
    if (!state.active || state.active.kind !== "shape") {
      return;
    }

    state.active.point = snapPoint(point);
    state.active.shift = state.tool === "compass" ? true : shift;
    if (!state.raf) {
      state.raf = requestAnimationFrame(flushShapePreview);
    }
  }

  function releasePointer(pointerId) {
    try {
      if (canvas.hasPointerCapture(pointerId)) {
        canvas.releasePointerCapture(pointerId);
      }
    } catch (error) {
      console.error("Drawora: pointer release failed.", error);
    }
  }

  function endStroke(pointerId) {
    if (!state.active || state.active.kind !== "stroke" || state.active.pointerId !== pointerId) {
      return;
    }

    if (state.raf) {
      cancelAnimationFrame(state.raf);
      flushPoints();
    }

    state.active = null;
    releasePointer(pointerId);
    commitIfChanged();
  }

  function finishShape(pointerId) {
    if (!state.active || state.active.kind !== "shape" || state.active.pointerId !== pointerId) {
      return;
    }

    if (state.raf) {
      cancelAnimationFrame(state.raf);
      flushShapePreview();
    }

    const shape = state.preview;
    state.preview = null;
    state.active = null;
    releasePointer(pointerId);

    if (shape && isShapeMeaningful(shape)) {
      captureBefore();
      state.objects.push({ id: createId(), ...shape });
      commitIfChanged();
    }

    redraw();
  }

  function endActive(pointerId) {
    if (!state.active || state.active.pointerId !== pointerId) {
      return;
    }

    if (state.active.kind === "shape") {
      finishShape(pointerId);
      return;
    }

    if (state.active.kind === "transform") {
      finishTransform(pointerId);
      return;
    }

    if (state.active.kind === "textbox") {
      finishTextBox(pointerId);
      return;
    }

    if (state.active.kind === "marquee") {
      finishMarquee(pointerId);
      return;
    }

    if (state.active.kind === "lasso") {
      finishLasso(pointerId);
      return;
    }

    if (state.active.kind === "guide") {
      finishGuide(pointerId);
      return;
    }

    if (state.active.kind === "measure" || state.active.kind === "protractor") {
      finishMeasure(pointerId);
      return;
    }

    if (state.active.kind === "pan") {
      finishPan(pointerId);
      return;
    }

    endStroke(pointerId);
  }

  function startPan(pointerId, screen) {
    canvas.classList.add("is-panning");
    state.active = {
      kind: "pan",
      pointerId,
      startScreen: screen,
      startPanX: state.panX,
      startPanY: state.panY,
    };
  }

  function movePan(screen) {
    if (!state.active || state.active.kind !== "pan") {
      return;
    }

    state.panX = state.active.startPanX + (screen.x - state.active.startScreen.x);
    state.panY = state.active.startPanY + (screen.y - state.active.startScreen.y);
    refreshCameraOverlays();
    redraw();
  }

  function finishPan(pointerId) {
    if (!state.active || state.active.kind !== "pan" || state.active.pointerId !== pointerId) {
      return;
    }

    state.active = null;
    canvas.classList.remove("is-panning");
    releasePointer(pointerId);
    canvas.style.cursor = state.spacePan || state.tool === "pan" ? "grab" : "";
    redraw();
  }

  function queueMarquee(point) {
    if (!state.active || state.active.kind !== "marquee") {
      return;
    }

    state.active.point = point;
    if (!state.raf) {
      state.raf = requestAnimationFrame(flushMarquee);
    }
  }

  function flushMarquee() {
    state.raf = 0;
    if (!state.active || state.active.kind !== "marquee") {
      return;
    }
    redraw();
  }

  function finishMarquee(pointerId) {
    if (!state.active || state.active.kind !== "marquee" || state.active.pointerId !== pointerId) {
      return;
    }

    if (state.raf) {
      cancelAnimationFrame(state.raf);
      state.raf = 0;
    }

    const bounds = normalizedBounds(state.active.start, state.active.point);
    const additive = state.active.shift;
    state.active = null;
    releasePointer(pointerId);

    if (bounds.width >= viewLen(4) || bounds.height >= viewLen(4)) {
      const hits = state.objects
        .filter((object) => isSelectable(object) && boundsIntersect(objectWorldBounds(object), bounds))
        .map((object) => object.id);
      const ids = expandGroupIds(hits);
      if (additive) {
        setSelection([...new Set([...state.selectedIds, ...ids])]);
      } else {
        setSelection(ids);
      }
    }

    canvas.style.cursor = "";
    redraw();
  }

  function scatterSpray(stroke, origin) {
    const count = 8;
    const radius = Math.max(6, stroke.size * 1.8);
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * radius;
      stroke.points.push({
        x: origin.x + Math.cos(angle) * dist,
        y: origin.y + Math.sin(angle) * dist,
      });
    }
  }

  function startStroke(pointerId, point) {
    clearSelection();
    captureBefore();
    const stroke = {
      id: createId(),
      type: "stroke",
      tool: state.tool,
      color: state.stroke,
      size: state.size,
      rotation: 0,
      points: [],
    };

    if (state.tool === "spray") {
      scatterSpray(stroke, point);
    } else {
      stroke.points.push(point);
    }

    state.objects.push(stroke);
    state.active = { kind: "stroke", pointerId, stroke };
    if (stroke.tool === "spray" || strokeNeedsRedraw(stroke)) {
      redraw();
    } else {
      drawDot(stroke, point);
    }
  }

  function startShape(pointerId, point, shift) {
    clearSelection();
    const start = snapPoint(point);
    state.active = {
      kind: "shape",
      pointerId,
      shapeType: state.tool === "compass" ? "ellipse" : state.tool,
      start,
      point: start,
      shift: state.tool === "compass" ? true : shift,
    };
    queueShapePreview(start, state.active.shift);
  }

  function setTool(tool) {
    if (!TOOLS.includes(tool) || tool === state.tool) {
      return;
    }

    if (state.frozen && isFrozenBlockedTool(tool)) {
      return;
    }

    if (tool === "eyedropper") {
      state.eyedropperReturn = state.tool;
    }

    if (state.active) {
      endActive(state.active.pointerId);
    }

    if (state.editingId) {
      finishEditing();
    }

    if (tool !== "select") {
      state.cropping = false;
    }

    if (state.tool === "laser" && tool !== "laser") {
      state.laserTrail = [];
      if (!state.spotlight) {
        state.pointerWorld = null;
      }
    }

    state.tool = tool;
    canvas.dataset.cursor = tool;
    canvas.style.cursor = "";

    if (tool !== "select" && tool !== "pan" && tool !== "lasso" && !isOverlayTool(tool)) {
      clearSelection();
      redraw();
    }

    for (const button of toolbar.querySelectorAll("[data-tool]")) {
      button.setAttribute("aria-pressed", String(button.dataset.tool === tool));
    }
    syncImageUI();
    syncTeachUI();
  }

  function syncColorUI() {
    const activeColor = state.colorTarget === "fill" ? state.fill : state.stroke;

    for (const button of toolbar.querySelectorAll("[data-color-target]")) {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.colorTarget === state.colorTarget)
      );
    }

    fillTargetButton.classList.toggle("is-none", !state.fill);
    strokePreview.style.background = "#fff";
    strokePreview.style.borderColor = state.stroke;
    fillPreview.style.background = state.fill || "#fff";
    fillPreview.style.borderColor = state.fill || "rgb(28 25 23 / 0.28)";

    let matchedPreset = false;
    for (const swatch of toolbar.querySelectorAll(".swatch[data-color]")) {
      const value = swatch.dataset.color;
      const selected =
        value === "none"
          ? state.colorTarget === "fill" && state.fill === null
          : Boolean(activeColor) && normalizeHex(value) === normalizeHex(activeColor);
      swatch.setAttribute("aria-pressed", String(selected));
      if (selected && value !== "none") {
        matchedPreset = true;
      }
    }

    customSwatch.classList.toggle(
      "is-selected",
      Boolean(activeColor) && !matchedPreset
    );
    if (activeColor && colorInput.value.toLowerCase() !== normalizeHex(activeColor)) {
      colorInput.value = activeColor;
    }
  }

  function setColorTarget(target) {
    if (target !== "stroke" && target !== "fill") {
      return;
    }

    state.colorTarget = target;
    syncColorUI();
  }

  function setColor(color) {
    if (color === "none") {
      state.fill = null;
      state.colorTarget = "fill";
    } else {
      const hex = normalizeHex(color);
      if (state.colorTarget === "fill") {
        state.fill = hex;
      } else {
        state.stroke = hex;
      }
    }

    syncColorUI();
    applyFormatChange();
  }

  function setSizeByIndex(index, commit) {
    const nextIndex = Math.min(SIZE_STOPS.length - 1, Math.max(0, index));
    state.size = SIZE_STOPS[nextIndex];
    sizeInput.value = String(nextIndex);
    sizeValue.textContent = `${state.size}px`;
    sizeInput.setAttribute("aria-valuetext", `${state.size} pixels`);

    if (state.selectedIds.length > 0 && !state.active) {
      applyStyleToSelected(true);
      redraw();
      if (commit) {
        commitIfChanged();
      }
    }
  }

  function capturePointer(pointerId) {
    try {
      canvas.setPointerCapture(pointerId);
    } catch (error) {
      console.error("Drawora: pointer capture failed.", error);
    }
  }

  function onPointerDown(event) {
    const wantsPan =
      event.button === 1 || (event.button === 0 && (state.spacePan || state.tool === "pan"));

    if (wantsPan && event.button !== 2) {
      if (state.active) {
        return;
      }

      event.preventDefault();
      startPan(event.pointerId, getScreenPoint(event));
      capturePointer(event.pointerId);
      return;
    }

    if (event.button !== 0) {
      return;
    }

    if (state.active) {
      return;
    }

    if (state.skipCanvasClick) {
      state.skipCanvasClick = false;
      return;
    }

    event.preventDefault();
    const screen = getScreenPoint(event);
    const point = getPoint(event);
    state.pointerWorld = point;

    if (state.frozen && state.tool !== "laser") {
      return;
    }

    const rulerAxis = hitRulerEdge(screen);
    if (rulerAxis) {
      startGuideDrag(event.pointerId, rulerAxis, rulerAxis === "x" ? point.x : point.y, -1);
      capturePointer(event.pointerId);
      return;
    }

    const guideIndex = hitGuide(point);
    if (guideIndex >= 0 && (state.tool === "select" || isOverlayTool(state.tool))) {
      const guide = pageGuides()[guideIndex];
      startGuideDrag(event.pointerId, guide.axis, guide.pos, guideIndex);
      capturePointer(event.pointerId);
      return;
    }

    if (state.tool === "laser") {
      pushLaserTrail(point);
      redraw();
      return;
    }

    if (state.tool === "measure" || state.tool === "protractor") {
      startMeasure(state.tool, event.pointerId, point);
      capturePointer(event.pointerId);
      return;
    }

    if (state.tool === "select") {
      onSelectPointerDown(event, point);
      if (state.active) {
        capturePointer(event.pointerId);
      }
      return;
    }

    if (state.tool === "fill") {
      applyFillAt(point);
      return;
    }

    if (state.tool === "eyedropper") {
      pickColorAt(event);
      return;
    }

    if (state.tool === "lasso") {
      startLasso(event.pointerId, point, event.shiftKey);
      capturePointer(event.pointerId);
      return;
    }

    if (isTextTool(state.tool)) {
      startTextBox(event.pointerId, point, state.tool);
      if (state.active) {
        capturePointer(event.pointerId);
      }
      return;
    }

    capturePointer(event.pointerId);

    if (isShapeTool(state.tool) || state.tool === "compass") {
      startShape(event.pointerId, point, event.shiftKey);
      return;
    }

    if (isInkTool(state.tool)) {
      startStroke(event.pointerId, point);
    }
  }

  function onPointerMove(event) {
    const point = getPoint(event);
    state.pointerWorld = point;

    if (!state.active) {
      if (state.tool === "laser") {
        pushLaserTrail(point);
        redraw();
        return;
      }
      if (state.spotlight) {
        redraw();
      }
      updateSelectCursor(point);
      return;
    }

    if (event.pointerId !== state.active.pointerId) {
      return;
    }

    event.preventDefault();

    if (state.active.kind === "pan") {
      movePan(getScreenPoint(event));
      return;
    }

    if (state.active.kind === "guide") {
      moveGuide(point);
      return;
    }

    if (state.active.kind === "measure" || state.active.kind === "protractor") {
      moveMeasure(point);
      return;
    }

    if (state.active.kind === "transform") {
      queueSelectDrag(point, event.shiftKey);
      return;
    }

    if (state.active.kind === "textbox") {
      queueTextboxPreview(point);
      return;
    }

    if (state.active.kind === "shape") {
      queueShapePreview(point, event.shiftKey);
      return;
    }

    if (state.active.kind === "marquee") {
      queueMarquee(point);
      return;
    }

    if (state.active.kind === "lasso") {
      queueLasso(point, event.shiftKey);
      return;
    }

    const coalesced =
      typeof event.getCoalescedEvents === "function"
        ? event.getCoalescedEvents()
        : [];

    if (coalesced.length === 0) {
      queuePoint(point);
      return;
    }

    for (const pointerEvent of coalesced) {
      queuePoint(getPoint(pointerEvent));
    }
  }

  function onPointerUp(event) {
    if (state.active && event.pointerId === state.active.pointerId) {
      endActive(event.pointerId);
      return;
    }

    releasePointer(event.pointerId);
  }

  function onPointerLeave(event) {
    if (!state.active || event.pointerId !== state.active.pointerId) {
      return;
    }

    if (canvas.hasPointerCapture(event.pointerId)) {
      return;
    }

    endActive(event.pointerId);
  }

  function setRibbonTab(name) {
    if (!RIBBON_TABS.includes(name)) {
      return;
    }

    state.ribbonTab = name;
    closeRibbonMenus();

    for (const tab of ribbonTabs.querySelectorAll("[data-ribbon-tab]")) {
      const selected = tab.dataset.ribbonTab === name;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    }

    for (const panel of toolbar.querySelectorAll(".ribbon-panel")) {
      panel.hidden = panel.dataset.ribbon !== name;
    }

    const panels = toolbar.querySelector(".ribbon-panels");
    if (panels) {
      panels.scrollLeft = 0;
    }
    layoutRibbonOverflow();
    requestAnimationFrame(layoutRibbonOverflow);
  }

  function isRibbonToolItem(element) {
    return (
      element instanceof HTMLElement &&
      !element.classList.contains("ribbon-more") &&
      !element.classList.contains("ribbon-menu")
    );
  }

  function prepareRibbonOverflow() {
    for (const group of toolbar.querySelectorAll(".ribbon-group")) {
      const tools = group.querySelector(":scope > .ribbon-group-tools");
      if (!tools || group.querySelector(":scope > .ribbon-group-main")) {
        continue;
      }

      [...tools.children].forEach((item, index) => {
        if (isRibbonToolItem(item)) {
          item.dataset.ribbonIndex = String(index);
        }
      });

      const main = document.createElement("div");
      main.className = "ribbon-group-main";
      const more = document.createElement("button");
      more.type = "button";
      more.className = "ribbon-more";
      more.hidden = true;
      more.setAttribute("aria-expanded", "false");
      const label = group.querySelector(".ribbon-group-label");
      more.title = label ? `More ${label.textContent.trim()} options` : "More options";
      more.setAttribute("aria-label", more.title);
      more.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9.5 12 14.5 17 9.5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      const menu = document.createElement("div");
      menu.className = "ribbon-menu";
      menu.hidden = true;
      menu.setAttribute("role", "menu");
      tools.replaceWith(main);
      main.append(tools, more);
      group.insertBefore(menu, label || null);
    }
  }

  function restoreRibbonItems(group) {
    const tools = group.querySelector(".ribbon-group-tools");
    const menu = group.querySelector(".ribbon-menu");
    if (!tools || !menu) {
      return;
    }
    while (menu.firstChild) {
      tools.appendChild(menu.firstChild);
    }
    [...tools.children]
      .filter(isRibbonToolItem)
      .sort((a, b) => Number(a.dataset.ribbonIndex) - Number(b.dataset.ribbonIndex))
      .forEach((item) => tools.appendChild(item));
  }

  function closeRibbonMenus() {
    for (const menu of toolbar.querySelectorAll(".ribbon-menu")) {
      menu.hidden = true;
    }
    for (const more of toolbar.querySelectorAll(".ribbon-more")) {
      more.setAttribute("aria-expanded", "false");
    }
  }

  function positionRibbonMenu(more, menu) {
    const rect = more.getBoundingClientRect();
    menu.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - 220))}px`;
    menu.style.top = `${rect.bottom + 4}px`;
  }

  function hideRibbonMore(group) {
    const more = group.querySelector(".ribbon-more");
    const menu = group.querySelector(".ribbon-menu");
    group.classList.remove("is-collapsed");
    if (more) {
      more.hidden = true;
      more.setAttribute("aria-expanded", "false");
    }
    if (menu) {
      menu.hidden = true;
    }
  }

  function sortRibbonMenu(menu) {
    [...menu.children]
      .filter(isRibbonToolItem)
      .sort((a, b) => Number(a.dataset.ribbonIndex) - Number(b.dataset.ribbonIndex))
      .forEach((item) => menu.appendChild(item));
  }

  function syncRibbonCollapsed(group) {
    const tools = group.querySelector(".ribbon-group-tools");
    const more = group.querySelector(".ribbon-more");
    const visible = Boolean(
      tools && [...tools.children].some((item) => isRibbonToolItem(item) && !item.hidden)
    );
    group.classList.toggle("is-collapsed", Boolean(more && !more.hidden && !visible));
  }

  function stripOverflows(strip, groups) {
    const right = strip.getBoundingClientRect().right;
    return groups.some((group) => group.getBoundingClientRect().right > right + 1);
  }

  function parkGroupUntilStripFits(group, strip) {
    const tools = group.querySelector(".ribbon-group-tools");
    const more = group.querySelector(".ribbon-more");
    const menu = group.querySelector(".ribbon-menu");
    if (!tools || !more || !menu) {
      return;
    }

    let guard = 40;
    while (guard > 0 && group.getBoundingClientRect().right > strip.getBoundingClientRect().right + 1) {
      guard -= 1;
      const items = [...tools.children].filter((item) => isRibbonToolItem(item) && !item.hidden);
      if (items.length === 0) {
        break;
      }
      more.hidden = false;
      menu.appendChild(items[items.length - 1]);
      syncRibbonCollapsed(group);
    }
    sortRibbonMenu(menu);
    if (!menu.childElementCount) {
      more.hidden = true;
    }
    syncRibbonCollapsed(group);
  }

  function layoutRibbonStrip(strip) {
    if (!strip) {
      return;
    }

    const groups = [...strip.querySelectorAll(":scope > .ribbon-group")];
    for (const group of groups) {
      restoreRibbonItems(group);
      hideRibbonMore(group);
    }

    if (strip.hidden) {
      return;
    }

    for (let index = groups.length - 1; index >= 0 && stripOverflows(strip, groups); index -= 1) {
      parkGroupUntilStripFits(groups[index], strip);
    }
  }

  function layoutRibbonOverflow() {
    closeRibbonMenus();
    for (const panel of toolbar.querySelectorAll(".ribbon-panel")) {
      const groups = [...panel.querySelectorAll(":scope > .ribbon-group")];
      for (const group of groups) {
        restoreRibbonItems(group);
        hideRibbonMore(group);
      }
    }
    layoutRibbonStrip(toolbar.querySelector(".ribbon-persistent"));
  }

  function toggleRibbonMenu(more) {
    const group = more.closest(".ribbon-group");
    const menu = group && group.querySelector(".ribbon-menu");
    if (!menu) {
      return;
    }

    const open = menu.hidden;
    closeRibbonMenus();
    if (!open) {
      return;
    }

    menu.hidden = false;
    more.setAttribute("aria-expanded", "true");
    positionRibbonMenu(more, menu);
  }

  function onRibbonTabKey(event) {
    const tabs = [...ribbonTabs.querySelectorAll("[data-ribbon-tab]")];
    const current = tabs.findIndex((tab) => tab.dataset.ribbonTab === state.ribbonTab);
    if (current < 0) {
      return;
    }

    let next = current;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (current + 1) % tabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (current - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    setRibbonTab(tabs[next].dataset.ribbonTab);
    tabs[next].focus();
  }

  function changeIndent(delta) {
    state.indent = Math.min(MAX_INDENT, Math.max(0, (state.indent || 0) + delta));
    applyFormatChange();
  }

  function applyFormatCommand(format) {
    if (format === "bold") {
      state.bold = !state.bold;
    } else if (format === "italic") {
      state.italic = !state.italic;
    } else if (format === "underline") {
      state.underline = !state.underline;
    } else if (format === "strike") {
      state.strike = !state.strike;
    } else if (format.startsWith("align-")) {
      state.align = format.slice("align-".length);
    } else if (format === "list-bullet") {
      state.list = state.list === "bullet" ? "none" : "bullet";
    } else if (format === "list-number") {
      state.list = state.list === "number" ? "none" : "number";
    } else if (format === "indent") {
      changeIndent(1);
      return;
    } else if (format === "outdent") {
      changeIndent(-1);
      return;
    } else if (format === "text-back-none") {
      state.textBack = null;
    } else {
      return;
    }
    applyFormatChange();
  }

  function applyTextMetrics(commit) {
    const lineHeight = Math.min(3, Math.max(1, Number(lineHeightInput.value) || 1.35));
    const letterSpacing = Math.min(16, Math.max(-4, Number(letterSpacingInput.value) || 0));
    const paragraphSpacing = Math.min(48, Math.max(0, Number(paraSpacingInput.value) || 0));
    const same =
      lineHeight === state.lineHeight &&
      letterSpacing === state.letterSpacing &&
      paragraphSpacing === state.paragraphSpacing;
    if (same && !state.historyBefore) {
      return;
    }
    state.lineHeight = lineHeight;
    state.letterSpacing = letterSpacing;
    state.paragraphSpacing = paragraphSpacing;
    applyFormatChange(commit);
  }

  function beginBoardText(point) {
    finishOpenWork();
    const page = currentPage();
    const maxWidth = page ? Math.max(MIN_TEXT_WIDTH, page.width - point.x - 32) : TEXT_DEFAULT.width;
    captureBefore();
    const object = createTextLike("text", {
      x: point.x,
      y: point.y,
      width: Math.max(MIN_TEXT_WIDTH, Math.min(TEXT_DEFAULT.width, maxWidth)),
      height: TEXT_DEFAULT.height,
    });
    state.objects.push(object);
    setSelection([object.id]);
    startEditing(object, true);
  }

  function onToolbarClick(event) {
    const more = event.target.closest(".ribbon-more");
    if (more && toolbar.contains(more)) {
      toggleRibbonMenu(more);
      return;
    }

    const formatButton = event.target.closest("[data-format]");
    if (formatButton && toolbar.contains(formatButton) && !formatButton.disabled) {
      if (state.frozen) {
        return;
      }
      applyFormatCommand(formatButton.dataset.format);
      return;
    }

    const insertButton = event.target.closest("[data-insert]");
    if (insertButton && toolbar.contains(insertButton) && !insertButton.disabled) {
      if (state.frozen) {
        return;
      }
      if (insertButton.dataset.insert === "math") {
        insertMathSymbol(insertButton.dataset.math);
        return;
      }
      runInsert(insertButton.dataset.insert);
      return;
    }

    const toolButton = event.target.closest("[data-tool]");
    if (toolButton && toolbar.contains(toolButton) && !toolButton.disabled) {
      setTool(toolButton.dataset.tool);
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (actionButton && toolbar.contains(actionButton) && !actionButton.disabled) {
      const action = actionButton.dataset.action;
      if (state.frozen && !actionAllowedWhenFrozen(action)) {
        return;
      }
      if (action === "copy") {
        copySelected();
      } else if (action === "paste") {
        pasteAction();
      } else if (action === "duplicate") {
        duplicateSelected();
      } else if (action === "cut") {
        cutSelected();
      } else if (action === "select-all") {
        selectAll();
      } else if (action === "group") {
        groupSelected();
      } else if (action === "ungroup") {
        ungroupSelected();
      } else if (action === "align") {
        alignSelected(actionButton.dataset.edge);
      } else if (action === "zoom-in") {
        zoomBy(ZOOM_STEP);
      } else if (action === "zoom-out") {
        zoomBy(1 / ZOOM_STEP);
      } else if (action === "zoom-reset") {
        resetView();
      } else if (action === "zoom-fit") {
        fitCanvas();
      } else if (action === "zoom-selection") {
        fitSelection();
      } else if (action === "page-add") {
        addPage();
      } else if (action === "page-duplicate") {
        duplicatePage();
      } else if (action === "page-delete") {
        deletePage();
      } else if (action === "image-insert") {
        openImagePicker();
      } else if (action === "link-open") {
        openSelectedLink();
      } else if (action === "image-crop") {
        toggleImageCrop();
      } else if (action === "image-flip-h") {
        toggleImageFlag("flipX");
      } else if (action === "image-flip-v") {
        toggleImageFlag("flipY");
      } else if (action === "image-shadow") {
        toggleImageFlag("shadow");
      } else if (action === "image-grayscale") {
        toggleImageFlag("grayscale");
      } else if (action === "flip-h") {
        flipSelected("h");
      } else if (action === "flip-v") {
        flipSelected("v");
      } else if (action === "toggle-grid") {
        toggleFlag("showGrid");
      } else if (action === "toggle-rulers") {
        toggleFlag("showRulers");
      } else if (action === "toggle-guides") {
        toggleFlag("showGuides");
      } else if (action === "toggle-spotlight") {
        toggleFlag("spotlight");
      } else if (action === "toggle-freeze") {
        toggleFlag("frozen");
      } else if (action === "fullscreen") {
        toggleFullscreen();
      } else if (action === "clear-board") {
        requestClearBoard();
      } else if (action.startsWith("table-")) {
        runTableAction(action);
      }
      return;
    }

    const presetButton = event.target.closest("[data-page-preset]");
    if (presetButton && toolbar.contains(presetButton) && !presetButton.disabled) {
      setPagePreset(presetButton.dataset.pagePreset);
      return;
    }

    const orientationButton = event.target.closest("[data-page-orientation]");
    if (orientationButton && toolbar.contains(orientationButton) && !orientationButton.disabled) {
      setPageOrientation(orientationButton.dataset.pageOrientation);
      return;
    }

    const modeButton = event.target.closest("[data-page-mode]");
    if (modeButton && toolbar.contains(modeButton) && !modeButton.disabled) {
      setPageMode(modeButton.dataset.pageMode);
      return;
    }

    const templateButton = event.target.closest("[data-page-template]");
    if (templateButton && toolbar.contains(templateButton) && !templateButton.disabled) {
      setPageTemplate(templateButton.dataset.pageTemplate);
      return;
    }

    const targetButton = event.target.closest("[data-color-target]");
    if (targetButton && toolbar.contains(targetButton)) {
      setColorTarget(targetButton.dataset.colorTarget);
      return;
    }

    const swatch = event.target.closest(".swatch[data-color]");
    if (swatch && toolbar.contains(swatch)) {
      setColor(swatch.dataset.color);
    }
  }

  function refreshShapeShift(shift) {
    if (!state.active || state.active.kind !== "shape" || !state.active.point) {
      return;
    }

    queueShapePreview(state.active.point, shift);
  }

  function handleEditorKeys(event) {
    const ctrl = event.ctrlKey || event.metaKey;

    if (event.key === "Escape") {
      event.preventDefault();
      cancelActive();
      return true;
    }

    if (ctrl && event.key === "Enter") {
      event.preventDefault();
      finishEditing();
      return true;
    }

    if (ctrl && event.key.toLowerCase() === "b") {
      event.preventDefault();
      state.bold = !state.bold;
      applyFormatChange();
      return true;
    }

    if (ctrl && event.key.toLowerCase() === "i") {
      event.preventDefault();
      state.italic = !state.italic;
      applyFormatChange();
      return true;
    }

    if (ctrl && event.key.toLowerCase() === "u") {
      event.preventDefault();
      state.underline = !state.underline;
      applyFormatChange();
      return true;
    }

    if (event.key === "Tab") {
      const object = findObject(state.editingId);
      if (isTable(object) && state.editingCell) {
        event.preventDefault();
        moveTableEdit(event.shiftKey ? -1 : 1, 0);
        return true;
      }
      event.preventDefault();
      changeIndent(event.shiftKey ? -1 : 1);
      return true;
    }

    if (event.key === "Enter" && !ctrl && !event.shiftKey) {
      const object = findObject(state.editingId);
      if (isTable(object) && state.editingCell) {
        event.preventDefault();
        moveTableEdit(0, 1);
        return true;
      }
    }

    return false;
  }

  function onKeyDown(event) {
    if (!confirmDialog.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeConfirmDialog();
      }
      return;
    }

    if (!linkDialog.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLinkDialog();
      }
      return;
    }

    if (isTypingTarget(event.target)) {
      if (event.target === editor) {
        handleEditorKeys(event);
      }
      return;
    }

    if (event.key === "Shift") {
      refreshShapeShift(true);
    }

    const ctrl = event.ctrlKey || event.metaKey;

    if (event.key === "Escape") {
      event.preventDefault();
      if ([...toolbar.querySelectorAll(".ribbon-menu")].some((menu) => !menu.hidden)) {
        closeRibbonMenus();
        return;
      }
      if (state.cropping) {
        state.cropping = false;
        syncImageUI();
        redraw();
        return;
      }
      if (state.tool === "laser") {
        setTool("select");
        return;
      }
      cancelActive();
      return;
    }

    if (state.frozen && ctrl) {
      const zoomKey =
        event.key === "=" ||
        event.key === "+" ||
        event.key === "-" ||
        event.key === "0" ||
        event.code === "NumpadAdd" ||
        event.code === "NumpadSubtract" ||
        event.code === "Numpad0" ||
        event.key === "PageDown" ||
        event.key === "PageUp";
      if (!zoomKey) {
        event.preventDefault();
        return;
      }
    }

    if (ctrl && event.key.toLowerCase() === "b") {
      event.preventDefault();
      state.bold = !state.bold;
      applyFormatChange();
      return;
    }

    if (ctrl && event.key.toLowerCase() === "i") {
      event.preventDefault();
      state.italic = !state.italic;
      applyFormatChange();
      return;
    }

    if (ctrl && event.key.toLowerCase() === "u") {
      event.preventDefault();
      state.underline = !state.underline;
      applyFormatChange();
      return;
    }

    if (ctrl && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (state.frozen) {
        return;
      }
      if (event.shiftKey) {
        redo();
      } else {
        undo();
      }
      return;
    }

    if (ctrl && event.key.toLowerCase() === "y") {
      event.preventDefault();
      redo();
      return;
    }

    if (ctrl && event.key.toLowerCase() === "a") {
      event.preventDefault();
      selectAll();
      return;
    }

    if (ctrl && event.key.toLowerCase() === "x") {
      event.preventDefault();
      cutSelected();
      return;
    }

    if (ctrl && event.key.toLowerCase() === "c") {
      event.preventDefault();
      copySelected();
      return;
    }

    if (ctrl && event.key.toLowerCase() === "d") {
      event.preventDefault();
      duplicateSelected();
      return;
    }

    if (ctrl && event.key.toLowerCase() === "g") {
      event.preventDefault();
      if (event.shiftKey) {
        ungroupSelected();
      } else {
        groupSelected();
      }
      return;
    }

    if (
      !ctrl &&
      selectedTable() &&
      state.tableCell &&
      !state.active &&
      !state.frozen &&
      !(event.target instanceof Node && toolbar.contains(event.target))
    ) {
      const table = selectedTable();
      if (event.key === "Enter") {
        event.preventDefault();
        startTableCellEdit(table, state.tableCell.r, state.tableCell.c);
        return;
      }
      if (event.key === "Tab") {
        event.preventDefault();
        const next = stepTableCell(table, state.tableCell.r, state.tableCell.c, event.shiftKey ? -1 : 1, 0);
        tableSelectCell(table, next.r, next.c);
        redraw();
        return;
      }
      const step = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
      if (step) {
        event.preventDefault();
        const next = stepTableCell(table, state.tableCell.r, state.tableCell.c, step[0], step[1]);
        tableSelectCell(table, next.r, next.c);
        redraw();
        return;
      }
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      if (state.frozen) {
        return;
      }
      deleteSelected();
      return;
    }

    if (event.key === " " || event.code === "Space") {
      if (
        event.target instanceof HTMLElement &&
        event.target.closest("button, a, [role='tab']")
      ) {
        return;
      }
      event.preventDefault();
      state.spacePan = true;
      canvas.style.cursor = "grab";
      return;
    }

    if (ctrl && (event.key === "=" || event.key === "+" || event.code === "NumpadAdd")) {
      event.preventDefault();
      zoomBy(ZOOM_STEP);
      return;
    }

    if (ctrl && (event.key === "-" || event.code === "NumpadSubtract")) {
      event.preventDefault();
      zoomBy(1 / ZOOM_STEP);
      return;
    }

    if (ctrl && (event.key === "0" || event.code === "Numpad0")) {
      event.preventDefault();
      resetView();
      return;
    }

    if (ctrl && event.key === "PageDown") {
      event.preventDefault();
      stepPage(1);
      return;
    }

    if (ctrl && event.key === "PageUp") {
      event.preventDefault();
      stepPage(-1);
      return;
    }

    if (state.frozen && ctrl) {
      event.preventDefault();
      return;
    }

    if (ctrl || event.altKey) {
      return;
    }

    const tool = SHORTCUTS[event.key.toLowerCase()];
    if (!tool) {
      return;
    }

    event.preventDefault();
    setTool(tool);
  }

  function onKeyUp(event) {
    if (event.key === "Shift") {
      refreshShapeShift(false);
    }

    if (event.key === " " || event.code === "Space") {
      state.spacePan = false;
      if (!state.active || state.active.kind !== "pan") {
        canvas.style.cursor = "";
      }
    }
  }

  toolbar.addEventListener("click", onToolbarClick);
  ribbonTabs.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-ribbon-tab]");
    if (tab) {
      setRibbonTab(tab.dataset.ribbonTab);
    }
  });
  ribbonTabs.addEventListener("keydown", onRibbonTabKey);
  undoBtn.addEventListener("click", () => {
    if (!state.frozen) {
      undo();
    }
  });
  redoBtn.addEventListener("click", () => {
    if (!state.frozen) {
      redo();
    }
  });
  deleteBtn.addEventListener("click", () => {
    if (state.frozen) {
      return;
    }
    if (state.editingId) {
      finishEditing();
    }
    deleteSelected();
  });
  fontSizeSelect.addEventListener("change", () => {
    state.fontSize = Number(fontSizeSelect.value);
    applyFormatChange();
  });
  fontFamilySelect.addEventListener("change", () => {
    state.fontKey = fontFamilySelect.value;
    applyFormatChange();
  });
  lineHeightInput.addEventListener("input", () => applyTextMetrics(false));
  letterSpacingInput.addEventListener("input", () => applyTextMetrics(false));
  paraSpacingInput.addEventListener("input", () => applyTextMetrics(false));
  lineHeightInput.addEventListener("change", () => applyTextMetrics(true));
  letterSpacingInput.addEventListener("change", () => applyTextMetrics(true));
  paraSpacingInput.addEventListener("change", () => applyTextMetrics(true));
  textBackInput.addEventListener("input", () => {
    state.textBack = textBackInput.value;
    applyFormatChange(false);
  });
  textBackInput.addEventListener("change", () => {
    state.textBack = textBackInput.value;
    applyFormatChange(true);
  });
  editor.addEventListener("input", () => {
    const object = findObject(state.editingId);
    if (isTable(object) && state.editingCell) {
      const cell = tableCellAt(object, state.editingCell.r, state.editingCell.c);
      if (cell) {
        cell.text = editor.value;
      }
      return;
    }
    if (!isTextLike(object)) {
      return;
    }

    object.text = editor.value;
    reflowTextHeight(object);
    const nextHeight = Math.max(object.height, editor.scrollHeight / state.zoom);
    object.height = nextHeight;
    positionEditor(object);
    redraw();
  });
  canvas.addEventListener("dblclick", (event) => {
    if (event.button !== 0 || state.spacePan || state.tool === "pan" || state.frozen) {
      return;
    }

    const point = getPoint(event);
    const object = hitObject(point);
    if (isLink(object)) {
      openLinkDialog(object);
      return;
    }
    if (isTable(object)) {
      const cell = hitTableCell(object, objectLocalPoint(object, point));
      if (cell) {
        setSelection([object.id]);
        tableSelectCell(object, cell.r, cell.c);
        startTableCellEdit(object, cell.r, cell.c);
      }
      return;
    }
    if (isTextLike(object)) {
      startEditing(object, false);
      return;
    }
    if (object) {
      return;
    }

    beginBoardText(point);
  });
  document.addEventListener(
    "pointerdown",
    (event) => {
      if (!state.editingId) {
        return;
      }

      const target = event.target;
      if (
        !(target instanceof Node) ||
        editor.contains(target) ||
        (target instanceof Element &&
          (target.closest(".chrome") || target.closest(".statusbar")))
      ) {
        return;
      }

      finishEditing();
      if (
        isTextTool(state.tool) &&
        (event.target === canvas || event.target === canvas.parentElement)
      ) {
        state.skipCanvasClick = true;
      }
    },
    true
  );
  colorInput.addEventListener("input", () => {
    setColor(colorInput.value);
  });
  sizeInput.addEventListener("pointerdown", () => {
    if (state.selectedIds.length > 0 && !state.active) {
      captureBefore();
    }
  });
  sizeInput.addEventListener("input", () => {
    setSizeByIndex(Number(sizeInput.value), false);
  });
  sizeInput.addEventListener("change", () => {
    if (state.selectedIds.length > 0) {
      commitIfChanged();
    }
  });
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  document.addEventListener("paste", onPaste);
  document.addEventListener("dragover", onWindowDragOver);
  document.addEventListener("drop", onDrop);
  canvasWrap.addEventListener("dragenter", onCanvasDragOver);
  canvasWrap.addEventListener("dragover", onCanvasDragOver);
  canvasWrap.addEventListener("dragleave", (event) => {
    if (!canvasWrap.contains(event.relatedTarget)) {
      setDropTarget(false);
    }
  });
  imageFileInput.addEventListener("change", () => {
    const file = imageFileInput.files && imageFileInput.files[0];
    imageFileInput.value = "";
    if (file) {
      insertImageFromBlob(file);
    }
  });
  linkForm.addEventListener("submit", (event) => {
    event.preventDefault();
    commitLinkDialog();
  });
  linkCancel.addEventListener("click", () => {
    closeLinkDialog();
  });
  linkDialog.addEventListener("pointerdown", (event) => {
    if (event.target === linkDialog) {
      closeLinkDialog();
    }
  });
  confirmForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const action = confirmCallback;
    closeConfirmDialog();
    if (action) {
      action();
    }
  });
  confirmCancel.addEventListener("click", () => {
    closeConfirmDialog();
  });
  confirmDialog.addEventListener("pointerdown", (event) => {
    if (event.target === confirmDialog) {
      closeConfirmDialog();
    }
  });
  document.addEventListener("fullscreenchange", () => {
    syncTeachUI();
  });
  const imageFieldInputs = [
    imageOpacityInput,
    imageRadiusInput,
    imageBrightnessInput,
    imageContrastInput,
    imageSaturationInput,
    imageBlurInput,
  ];
  for (const input of imageFieldInputs) {
    input.addEventListener("pointerdown", () => {
      if (selectedImage() && !state.historyBefore) {
        captureBefore();
      }
    });
    input.addEventListener("input", () => applyImageFields(false));
    input.addEventListener("change", () => applyImageFields(true));
  }

  canvas.addEventListener("pointerdown", onPointerDown, { passive: false });
  canvas.addEventListener("pointermove", onPointerMove, { passive: false });
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("lostpointercapture", onPointerUp);
  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
  canvas.addEventListener("auxclick", (event) => {
    if (event.button === 1) {
      event.preventDefault();
    }
  });
  canvas.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      if (state.active && state.active.kind !== "pan") {
        return;
      }
      const factor = event.deltaY > 0 ? 1 / 1.08 : 1.08;
      zoomBy(factor, getScreenPoint(event));
    },
    { passive: false }
  );
  zoomLabel.addEventListener("click", () => resetView());

  pageNameInput.addEventListener("change", () => {
    renamePage(pageNameInput.value);
  });
  pageNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      pageNameInput.blur();
    }
  });
  pageWidthInput.addEventListener("input", () => applyCustomPageSize(false));
  pageHeightInput.addEventListener("input", () => applyCustomPageSize(false));
  pageWidthInput.addEventListener("change", () => applyCustomPageSize(true));
  pageHeightInput.addEventListener("change", () => applyCustomPageSize(true));
  pageWidthInput.addEventListener("blur", () => applyCustomPageSize(true));
  pageHeightInput.addEventListener("blur", () => applyCustomPageSize(true));
  paperColorInput.addEventListener("input", () => applySurfaceLook(false));
  lineColorInput.addEventListener("input", () => applySurfaceLook(false));
  paperColorInput.addEventListener("change", () => applySurfaceLook(true));
  lineColorInput.addEventListener("change", () => applySurfaceLook(true));
  lineSpacingInput.addEventListener("input", () => applySurfaceLook(false));
  gridSizeInput.addEventListener("input", () => applySurfaceLook(false));
  pageMarginInput.addEventListener("input", () => applySurfaceLook(false));
  lineSpacingInput.addEventListener("change", () => applySurfaceLook(true));
  gridSizeInput.addEventListener("change", () => applySurfaceLook(true));
  pageMarginInput.addEventListener("change", () => applySurfaceLook(true));
  lineSpacingInput.addEventListener("blur", () => applySurfaceLook(true));
  gridSizeInput.addEventListener("blur", () => applySurfaceLook(true));
  pageMarginInput.addEventListener("blur", () => applySurfaceLook(true));

  statusbar.addEventListener("click", (event) => {
    if (event.target.closest('[data-action="page-add"]')) {
      addPage();
    }
  });
  pageThumbs.addEventListener("click", (event) => {
    if (state.pageDragMoved) {
      state.pageDragMoved = false;
      return;
    }
    const thumb = event.target.closest("[data-page-id]");
    if (thumb) {
      switchPage(thumb.dataset.pageId);
    }
  });
  pageThumbs.addEventListener("dblclick", (event) => {
    const thumb = event.target.closest("[data-page-id]");
    if (!thumb) {
      return;
    }
    switchPage(thumb.dataset.pageId);
    setRibbonTab("page");
    pageNameInput.focus();
    pageNameInput.select();
  });
  pageThumbs.addEventListener("dragstart", (event) => {
    const thumb = event.target.closest("[data-page-id]");
    if (!thumb) {
      return;
    }
    state.pageDragId = thumb.dataset.pageId;
    state.pageDragMoved = false;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", thumb.dataset.pageId);
  });
  pageThumbs.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  });
  pageThumbs.addEventListener("drop", (event) => {
    event.preventDefault();
    const thumb = event.target.closest("[data-page-id]");
    const fromId = state.pageDragId || event.dataTransfer.getData("text/plain");
    if (thumb && fromId && fromId !== thumb.dataset.pageId) {
      state.pageDragMoved = true;
      reorderPage(fromId, thumb.dataset.pageId);
    }
    state.pageDragId = null;
  });
  pageThumbs.addEventListener("dragend", () => {
    state.pageDragId = null;
  });

  const firstPage = makePage({ name: "Page 1", preset: "a4", orientation: "portrait" });
  state.pages = [firstPage];
  attachPage(firstPage);

  prepareRibbonOverflow();
  window.addEventListener("resize", layoutRibbonOverflow);
  const ribbonPanels = toolbar.querySelector(".ribbon-panels");
  if (ribbonPanels) {
    ribbonPanels.addEventListener("scroll", closeRibbonMenus, { passive: true });
    ribbonPanels.addEventListener(
      "wheel",
      (event) => {
        if (event.deltaY && !event.shiftKey && Math.abs(event.deltaY) >= Math.abs(event.deltaX)) {
          ribbonPanels.scrollLeft += event.deltaY;
          event.preventDefault();
        }
      },
      { passive: false }
    );
  }
  document.addEventListener("pointerdown", (event) => {
    const target = event.target;
    if (
      target instanceof Element &&
      (target.closest(".ribbon-menu") || target.closest(".ribbon-more"))
    ) {
      return;
    }
    closeRibbonMenus();
  });
  toolbar.addEventListener("click", (event) => {
    if (event.target.closest(".ribbon-menu") && event.target.closest("button.ribbon-btn, button.ribbon-btn-wide")) {
      closeRibbonMenus();
    }
  });

  const observer = new ResizeObserver(resizeCanvas);
  new ResizeObserver(layoutRibbonOverflow).observe(toolbar);
  observer.observe(canvas.parentElement);
  resizeCanvas();
  fitCanvas();
  canvas.dataset.cursor = state.tool;
  setRibbonTab("home");
  syncColorUI();
  syncEditUI();
  syncFormatUI();
  syncViewUI();
  syncPageUI();
  syncImageUI();
  syncLinkUI();
  syncTeachUI();
})();
