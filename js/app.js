(() => {
  const DRAW_TOOLS = ["pen", "eraser"];
  const SHAPE_TOOLS = ["line", "rect", "roundrect", "ellipse", "triangle", "arrow"];
  const TEXT_TOOLS = ["text", "sticky"];
  const TOOLS = ["select", "pan", ...DRAW_TOOLS, ...SHAPE_TOOLS, ...TEXT_TOOLS];
  const SHORTCUTS = {
    v: "select",
    h: "pan",
    p: "pen",
    e: "eraser",
    t: "text",
    n: "sticky",
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
    !pageMarginInput
  ) {
    console.error("Drawora: missing canvas or toolbar controls.");
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Drawora: 2D canvas is not available.");
    return;
  }

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

  function isTextTool(tool) {
    return TEXT_TOOLS.includes(tool);
  }

  function isTextLike(object) {
    return object && (object.type === "text" || object.type === "sticky");
  }

  function isSelectable(object) {
    return !(object.type === "stroke" && object.tool === "eraser");
  }

  function normalizeHex(color) {
    return color.trim().toLowerCase();
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

  function getPoint(event) {
    return screenToWorld(getScreenPoint(event));
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
      ...normalizedBounds(start, end, shift && type === "ellipse"),
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
    if (object && isTextLike(object)) {
      handles.e = { x: frame.x + frame.width, y: center.y };
      handles.w = { x: frame.x, y: center.y };
    }
    return handles;
  }

  function configureStroke(stroke) {
    if (stroke.tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "#000000";
      ctx.fillStyle = "#000000";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = stroke.color;
      ctx.fillStyle = stroke.color;
    }

    ctx.lineWidth = stroke.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  function configureShape(shape) {
    ctx.globalCompositeOperation = "source-over";
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
    ctx.arc(point.x, point.y, stroke.size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawStroke(stroke) {
    const points = stroke.points;
    if (points.length === 0) {
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

  function textMaxWidth(object) {
    return Math.max(12, object.width - TEXT_PAD * 2 - textIndentWidth(object));
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
    let height = TEXT_PAD * 2;
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
    const left = object.x + TEXT_PAD + textIndentWidth(object);
    if (object.align === "center") {
      return object.x + (object.width + textIndentWidth(object)) / 2;
    }
    if (object.align === "right") {
      return object.x + object.width - TEXT_PAD;
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

    const markerX = object.x + TEXT_PAD + (object.indent || 0) * INDENT_STEP;
    let y = object.y + TEXT_PAD;
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
      case "arrow":
        drawArrow(shape);
        break;
      default:
        break;
    }
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

    drawShape(object);
  }

  function drawObject(object) {
    const rotation = object.rotation || 0;
    if (!rotation) {
      drawObjectUnrotated(object);
      return;
    }

    const center = getCenter(object);
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);
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

    ctx.beginPath();
    ctx.moveTo(handles.rotate.x, frame.y);
    ctx.lineTo(handles.rotate.x, handles.rotate.y);
    ctx.stroke();

    drawHandleCircle(handles.rotate.x, handles.rotate.y);
    drawHandleBox(handles.nw.x, handles.nw.y);
    drawHandleBox(handles.ne.x, handles.ne.y);
    drawHandleBox(handles.sw.x, handles.sw.y);
    drawHandleBox(handles.se.x, handles.se.y);
    if (handles.e) {
      drawHandleBox(handles.e.x, handles.e.y);
      drawHandleBox(handles.w.x, handles.w.y);
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

    for (const object of state.objects) {
      drawObject(object);
    }

    if (state.preview) {
      drawShape(state.preview);
    }

    if (state.active && state.active.kind === "marquee") {
      drawMarquee(normalizedBounds(state.active.start, state.active.point));
    }

    drawSelectionOverlay();
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

    if (object.type === "triangle") {
      const [a, b, c] = trianglePoints(object);
      return pointInTriangle(point, a, b, c);
    }

    return pointInBounds(point, object.x, object.y, object.width, object.height);
  }

  function hitObject(point) {
    for (let i = state.objects.length - 1; i >= 0; i -= 1) {
      const object = state.objects[i];
      if (!isSelectable(object)) {
        continue;
      }

      const local = worldToLocal(point, getCenter(object), object.rotation || 0);
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
    const order = isTextLike(object)
      ? ["rotate", "nw", "ne", "sw", "se", "e", "w"]
      : ["rotate", "nw", "ne", "sw", "se"];

    for (const name of order) {
      if (distance(local, handles[name]) <= viewLen(HANDLE_HIT)) {
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

    state.pages = snapshot.pages.map((page) => {
      const camera = cameras.get(page.id) || { zoom: 1, panX: 0, panY: 0 };
      return {
        ...cloneData(page),
        zoom: camera.zoom,
        panX: camera.panX,
        panY: camera.panY,
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
  }

  function setSelection(ids) {
    state.selectedIds = ids;
    syncEditUI();
    syncFormatFromSelection();
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

    state.clipboard = cloneData(selected);
    syncEditUI();
  }

  function pasteClipboard() {
    if (state.clipboard.length === 0 || state.active) {
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

  function applyStyleToSelected() {
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
    const dx = point.x - drag.startPoint.x;
    const dy = point.y - drag.startPoint.y;
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
    if (bottom - top < MIN_FRAME) {
      if (drag.handle.includes("n")) {
        top = bottom - MIN_FRAME;
      } else {
        bottom = top + MIN_FRAME;
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

    applyResize(point);
  }

  function flushSelectDrag() {
    state.raf = 0;
    if (!state.active || state.active.kind !== "transform" || !state.active.point) {
      return;
    }

    applyTransform(state.active.point);
    redraw();
  }

  function queueSelectDrag(point) {
    if (!state.active || state.active.kind !== "transform") {
      return;
    }

    state.active.point = point;
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
    }

    syncFormatUI();
  }

  function styleEditor(object) {
    const italic = object.italic ? "italic " : "";
    const weight = object.bold ? "700 " : "400 ";
    const size = (object.fontSize || 24) * state.zoom;
    const padX = (TEXT_PAD + textIndentWidth(object)) * state.zoom;
    const padY = TEXT_PAD * state.zoom;
    editor.style.font = `${italic}${weight}${size}px ${objectFontFamily(object)}`;
    editor.style.color = object.color || "#1c1917";
    editor.style.textAlign = object.align || "left";
    editor.style.padding = `${padY}px ${TEXT_PAD * state.zoom}px ${padY}px ${padX}px`;
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
  }

  function positionEditor(object) {
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
    const text = editor.value;
    hideEditor();

    if (!object) {
      discardHistoryCapture();
      state.editingIsNew = false;
      redraw();
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

    canvas.style.cursor = hitObject(point) ? "move" : "default";
  }

  function onSelectPointerDown(event, point) {
    const handle = hitHandle(point);
    if (handle) {
      captureBefore();
      const mode = handle === "rotate" ? "rotate" : "resize";
      canvas.style.cursor = handle === "rotate" ? "grabbing" : cursorForHandle(handle);
      startTransform(mode, handle, point, event.pointerId);
      return;
    }

    const object = hitObject(point);
    if (object) {
      const groupIds = expandGroupIds([object.id]);
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

    const from = stroke.points[stroke.points.length - 1];
    for (const point of added) {
      stroke.points.push(point);
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

    state.active.point = point;
    state.active.shift = shift;
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
      points: [point],
    };

    state.objects.push(stroke);
    state.active = { kind: "stroke", pointerId, stroke };
    drawDot(stroke, point);
  }

  function startShape(pointerId, point, shift) {
    clearSelection();
    state.active = {
      kind: "shape",
      pointerId,
      shapeType: state.tool,
      start: point,
      point,
      shift,
    };
    queueShapePreview(point, shift);
  }

  function setTool(tool) {
    if (!TOOLS.includes(tool) || tool === state.tool) {
      return;
    }

    if (state.active) {
      endActive(state.active.pointerId);
    }

    if (state.editingId) {
      finishEditing();
    }

    state.tool = tool;
    canvas.dataset.cursor = tool;
    canvas.style.cursor = "";

    if (tool !== "select" && tool !== "pan") {
      clearSelection();
      redraw();
    }

    for (const button of toolbar.querySelectorAll("[data-tool]")) {
      button.setAttribute("aria-pressed", String(button.dataset.tool === tool));
    }
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
      applyStyleToSelected();
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
    const point = getPoint(event);

    if (state.tool === "select") {
      onSelectPointerDown(event, point);
      if (state.active) {
        capturePointer(event.pointerId);
      }
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

    if (isShapeTool(state.tool)) {
      startShape(event.pointerId, point, event.shiftKey);
      return;
    }

    if (state.tool === "pen" || state.tool === "eraser") {
      startStroke(event.pointerId, point);
    }
  }

  function onPointerMove(event) {
    const point = getPoint(event);

    if (!state.active) {
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

    if (state.active.kind === "transform") {
      queueSelectDrag(point);
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
      layoutRibbonStrip(panel);
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
      applyFormatCommand(formatButton.dataset.format);
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
      if (action === "copy") {
        copySelected();
      } else if (action === "paste") {
        pasteClipboard();
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
      event.preventDefault();
      changeIndent(event.shiftKey ? -1 : 1);
      return true;
    }

    return false;
  }

  function onKeyDown(event) {
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
      cancelActive();
      return;
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

    if (ctrl && event.key.toLowerCase() === "v") {
      event.preventDefault();
      pasteClipboard();
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

    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
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
  undoBtn.addEventListener("click", () => undo());
  redoBtn.addEventListener("click", () => redo());
  deleteBtn.addEventListener("click", () => {
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
    if (event.button !== 0 || state.spacePan || state.tool === "pan") {
      return;
    }

    const point = getPoint(event);
    const object = hitObject(point);
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
})();
