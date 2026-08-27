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
  const FONT_SIZES = [16, 20, 24, 32, 40];
  const TEXT_PAD = 12;
  const TEXT_DEFAULT = { width: 240, height: 64 };
  const STICKY_DEFAULT = { width: 176, height: 176 };
  const STICKY_FILL = "#fde68a";
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 8;
  const ZOOM_STEP = 1.2;

  const state = {
    tool: "pen",
    stroke: PRESET_COLORS[0],
    fill: null,
    colorTarget: "stroke",
    size: 4,
    fontSize: 24,
    bold: false,
    italic: false,
    align: "left",
    dpr: 1,
    nextId: 1,
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
  const zoomLabel = document.getElementById("zoom-label");
  const zoomValue = document.getElementById("zoom-value");

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
    !zoomLabel ||
    !zoomValue
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
    const objects = state.objects.filter(isSelectable);
    if (objects.length === 0) {
      resetView();
      return;
    }
    fitToBounds(unionBounds(objects.map((object) => objectWorldBounds(object))));
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

  function handlePositions(frame, center) {
    return {
      nw: { x: frame.x, y: frame.y },
      ne: { x: frame.x + frame.width, y: frame.y },
      sw: { x: frame.x, y: frame.y + frame.height },
      se: { x: frame.x + frame.width, y: frame.y + frame.height },
      rotate: { x: center.x, y: frame.y - viewLen(ROTATE_OFFSET) },
    };
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

  function objectFont(object) {
    const italic = object.italic ? "italic " : "";
    const weight = object.bold ? "700 " : "400 ";
    return `${italic}${weight}${object.fontSize}px ${FONT_FAMILY}`;
  }

  function wrapCanvasText(text, maxWidth, font) {
    ctx.font = font;
    const lines = [];
    const paragraphs = String(text || "").split("\n");

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

    for (const paragraph of paragraphs) {
      if (paragraph === "") {
        lines.push("");
        continue;
      }

      const words = paragraph.split(" ");
      let line = "";
      for (const word of words) {
        const pieces = breakLongWord(word);
        for (let i = 0; i < pieces.length; i += 1) {
          const piece = pieces[i];
          const glued = i > 0;
          const next = line && !glued ? `${line} ${piece}` : line + piece;
          if (line && ctx.measureText(next).width > maxWidth) {
            lines.push(line);
            line = piece;
          } else {
            line = next;
          }
        }
      }
      lines.push(line);
    }

    return lines;
  }

  function textLineX(object) {
    if (object.align === "center") {
      return object.x + object.width / 2;
    }
    if (object.align === "right") {
      return object.x + object.width - TEXT_PAD;
    }
    return object.x + TEXT_PAD;
  }

  function drawWrappedText(object) {
    const font = objectFont(object);
    const maxWidth = Math.max(12, object.width - TEXT_PAD * 2);
    const lines = wrapCanvasText(object.text, maxWidth, font);
    const lineHeight = object.fontSize * 1.3;

    ctx.save();
    ctx.beginPath();
    ctx.rect(object.x, object.y, object.width, object.height);
    ctx.clip();
    ctx.font = font;
    ctx.fillStyle = object.color || "#1c1917";
    ctx.textAlign = object.align || "left";
    ctx.textBaseline = "top";

    let y = object.y + TEXT_PAD;
    for (const line of lines) {
      ctx.fillText(line, textLineX(object), y);
      y += lineHeight;
      if (y > object.y + object.height) {
        break;
      }
    }
    ctx.restore();
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
    const handles = handlePositions(frame, center);

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

  function redraw() {
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.setTransform(
      state.dpr * state.zoom,
      0,
      0,
      state.dpr * state.zoom,
      state.panX * state.dpr,
      state.panY * state.dpr
    );

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
    const handles = handlePositions(frame, center);
    const order = ["rotate", "nw", "ne", "sw", "se"];

    for (const name of order) {
      if (distance(local, handles[name]) <= viewLen(HANDLE_HIT)) {
        return name;
      }
    }

    return null;
  }

  function cloneBoard() {
    return {
      objects: cloneData(state.objects),
      nextId: state.nextId,
      selectedIds: [...state.selectedIds],
    };
  }

  function restoreBoard(snapshot) {
    state.objects = cloneData(snapshot.objects);
    state.nextId = snapshot.nextId;
    state.selectedIds = snapshot.selectedIds.filter((id) =>
      state.objects.some((object) => object.id === id)
    );
    redraw();
    syncEditUI();
  }

  function captureBefore() {
    state.historyBefore = cloneBoard();
  }

  function boardsEqual(a, b) {
    return JSON.stringify(a.objects) === JSON.stringify(b.objects);
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
    if (isTextLike(object) && startObject.fontSize) {
      object.fontSize = Math.max(12, Math.round(startObject.fontSize * sy));
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
        object.bold = state.bold;
        object.italic = state.italic;
        object.align = state.align;
        if (object.type === "sticky") {
          object.fill = state.fill || object.fill || STICKY_FILL;
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
      const pressed =
        format === "bold"
          ? state.bold
          : format === "italic"
            ? state.italic
            : format === `align-${state.align}`;
      button.setAttribute("aria-pressed", String(Boolean(pressed)));
    }

    if (Number(fontSizeSelect.value) !== state.fontSize) {
      fontSizeSelect.value = String(state.fontSize);
    }
  }

  function syncFormatFromSelection() {
    const selected = selectedObjects();
    if (selected.length === 1 && isTextLike(selected[0])) {
      const object = selected[0];
      state.fontSize = object.fontSize || 24;
      state.bold = Boolean(object.bold);
      state.italic = Boolean(object.italic);
      state.align = object.align || "left";
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
    editor.style.font = `${italic}${weight}${object.fontSize * state.zoom}px ${FONT_FAMILY}`;
    editor.style.color = object.color || "#1c1917";
    editor.style.textAlign = object.align || "left";
    editor.style.padding = `${10 * state.zoom}px ${TEXT_PAD * state.zoom}px`;
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
      bold: state.bold,
      italic: state.italic,
      align: state.align,
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

  function applyFormatChange() {
    syncFormatUI();
    if (state.editingId) {
      const object = findObject(state.editingId);
      if (isTextLike(object)) {
        object.color = state.stroke;
        object.fontSize = state.fontSize;
        object.bold = state.bold;
        object.italic = state.italic;
        object.align = state.align;
        if (object.type === "sticky") {
          object.fill = state.fill || object.fill || STICKY_FILL;
        }
        positionEditor(object);
        redraw();
      }
      return;
    }

    if (state.selectedIds.length > 0 && !state.active) {
      captureBefore();
      applyStyleToSelected();
      commitIfChanged();
      redraw();
    }
  }

  function cursorForHandle(handle) {
    if (handle === "rotate") {
      return "grab";
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

    for (const tab of ribbonTabs.querySelectorAll("[data-ribbon-tab]")) {
      const selected = tab.dataset.ribbonTab === name;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    }

    for (const panel of toolbar.querySelectorAll(".ribbon-panel")) {
      panel.hidden = panel.dataset.ribbon !== name;
    }
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

  function onToolbarClick(event) {
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
      }
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
  document.querySelector(".format-actions").addEventListener("click", (event) => {
    const button = event.target.closest("[data-format]");
    if (!button) {
      return;
    }

    const format = button.dataset.format;
    if (format === "bold") {
      state.bold = !state.bold;
    } else if (format === "italic") {
      state.italic = !state.italic;
    } else if (format.startsWith("align-")) {
      state.align = format.slice("align-".length);
    }

    applyFormatChange();
  });
  fontSizeSelect.addEventListener("change", () => {
    state.fontSize = Number(fontSizeSelect.value);
    applyFormatChange();
  });
  editor.addEventListener("input", () => {
    const object = findObject(state.editingId);
    if (!isTextLike(object)) {
      return;
    }

    object.text = editor.value;
    const minHeight = object.type === "sticky" ? STICKY_DEFAULT.height : TEXT_DEFAULT.height;
    const nextHeight = Math.max(minHeight, editor.scrollHeight / state.zoom);
    if (nextHeight > object.height + 1) {
      object.height = nextHeight;
      positionEditor(object);
      redraw();
    }
  });
  canvas.addEventListener("dblclick", (event) => {
    if (state.tool !== "select") {
      return;
    }

    const object = hitObject(getPoint(event));
    if (isTextLike(object)) {
      startEditing(object, false);
    }
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

  const observer = new ResizeObserver(resizeCanvas);
  observer.observe(canvas.parentElement);
  resizeCanvas();
  canvas.dataset.cursor = state.tool;
  setRibbonTab("home");
  syncColorUI();
  syncEditUI();
  syncFormatUI();
  syncViewUI();
})();
