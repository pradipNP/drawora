(() => {
  const DRAW_TOOLS = ["pen", "eraser"];
  const SHAPE_TOOLS = ["line", "rect", "roundrect", "ellipse", "triangle", "arrow"];
  const TOOLS = ["select", ...DRAW_TOOLS, ...SHAPE_TOOLS];
  const SHORTCUTS = {
    v: "select",
    p: "pen",
    e: "eraser",
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

  const state = {
    tool: "pen",
    stroke: PRESET_COLORS[0],
    fill: null,
    colorTarget: "stroke",
    size: 4,
    dpr: 1,
    nextId: 1,
    objects: [],
    preview: null,
    active: null,
    queuedPoints: [],
    raf: 0,
  };

  const canvas = document.getElementById("board");
  const toolbar = document.querySelector(".toolbar");
  const colorInput = document.getElementById("custom-color");
  const customSwatch = toolbar && toolbar.querySelector(".swatch-custom");
  const strokePreview = document.getElementById("stroke-preview");
  const fillPreview = document.getElementById("fill-preview");
  const fillTargetButton = toolbar && toolbar.querySelector('[data-color-target="fill"]');
  const sizeInput = document.getElementById("stroke-size");
  const sizeValue = document.getElementById("size-value");

  if (
    !canvas ||
    !toolbar ||
    !colorInput ||
    !customSwatch ||
    !strokePreview ||
    !fillPreview ||
    !fillTargetButton ||
    !sizeInput ||
    !sizeValue
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

  function normalizeHex(color) {
    return color.trim().toLowerCase();
  }

  function createId() {
    const id = `o${state.nextId}`;
    state.nextId += 1;
    return id;
  }

  function getPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function distance(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.hypot(dx, dy);
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
      };
    }

    const shape = {
      type,
      ...normalizedBounds(start, end, shift && type === "ellipse"),
      stroke: state.stroke,
      fill: state.fill,
      size: state.size,
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

  function drawTriangle(shape) {
    ctx.save();
    configureShape(shape);
    ctx.beginPath();
    ctx.moveTo(shape.x + shape.width / 2, shape.y);
    ctx.lineTo(shape.x, shape.y + shape.height);
    ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
    ctx.closePath();
    paintClosedPath(shape);
    ctx.restore();
  }

  function drawArrow(shape) {
    const dx = shape.x2 - shape.x1;
    const dy = shape.y2 - shape.y1;
    const length = Math.hypot(dx, dy);
    if (length === 0) {
      return;
    }

    const angle = Math.atan2(dy, dx);
    const headLength = Math.min(Math.max(12, shape.size * 4), length * 0.45);
    const headWidth = headLength * 0.55;
    const shaftX = shape.x2 - Math.cos(angle) * headLength;
    const shaftY = shape.y2 - Math.sin(angle) * headLength;

    ctx.save();
    configureShape(shape);
    ctx.beginPath();
    ctx.moveTo(shape.x1, shape.y1);
    ctx.lineTo(shaftX, shaftY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(shape.x2, shape.y2);
    ctx.lineTo(
      shape.x2 - Math.cos(angle) * headLength + Math.sin(angle) * headWidth,
      shape.y2 - Math.sin(angle) * headLength - Math.cos(angle) * headWidth
    );
    ctx.lineTo(
      shape.x2 - Math.cos(angle) * headLength - Math.sin(angle) * headWidth,
      shape.y2 - Math.sin(angle) * headLength + Math.cos(angle) * headWidth
    );
    ctx.closePath();
    ctx.fillStyle = shape.stroke;
    ctx.fill();
    ctx.restore();
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

  function drawObject(object) {
    if (object.type === "stroke") {
      drawStroke(object);
      return;
    }

    drawShape(object);
  }

  function redraw() {
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    for (const object of state.objects) {
      drawObject(object);
    }

    if (state.preview) {
      drawShape(state.preview);
    }
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
      state.objects.push({ id: createId(), ...shape });
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

    endStroke(pointerId);
  }

  function startStroke(pointerId, point) {
    const stroke = {
      id: createId(),
      type: "stroke",
      tool: state.tool,
      color: state.stroke,
      size: state.size,
      points: [point],
    };

    state.objects.push(stroke);
    state.active = { kind: "stroke", pointerId, stroke };
    drawDot(stroke, point);
  }

  function startShape(pointerId, point, shift) {
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

    state.tool = tool;
    canvas.dataset.cursor = tool;

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
      syncColorUI();
      return;
    }

    const hex = normalizeHex(color);
    if (state.colorTarget === "fill") {
      state.fill = hex;
    } else {
      state.stroke = hex;
    }

    syncColorUI();
  }

  function setSizeByIndex(index) {
    const nextIndex = Math.min(SIZE_STOPS.length - 1, Math.max(0, index));
    state.size = SIZE_STOPS[nextIndex];
    sizeInput.value = String(nextIndex);
    sizeValue.textContent = `${state.size}px`;
    sizeInput.setAttribute("aria-valuetext", `${state.size} pixels`);
  }

  function capturePointer(pointerId) {
    try {
      canvas.setPointerCapture(pointerId);
    } catch (error) {
      console.error("Drawora: pointer capture failed.", error);
    }
  }

  function onPointerDown(event) {
    if (event.button !== 0) {
      return;
    }

    if (state.tool === "select") {
      return;
    }

    if (state.active) {
      return;
    }

    event.preventDefault();
    capturePointer(event.pointerId);
    const point = getPoint(event);

    if (isShapeTool(state.tool)) {
      startShape(event.pointerId, point, event.shiftKey);
      return;
    }

    if (state.tool === "pen" || state.tool === "eraser") {
      startStroke(event.pointerId, point);
    }
  }

  function onPointerMove(event) {
    if (!state.active || event.pointerId !== state.active.pointerId) {
      return;
    }

    event.preventDefault();

    if (state.active.kind === "shape") {
      queueShapePreview(getPoint(event), event.shiftKey);
      return;
    }

    const coalesced =
      typeof event.getCoalescedEvents === "function"
        ? event.getCoalescedEvents()
        : [];

    if (coalesced.length === 0) {
      queuePoint(getPoint(event));
      return;
    }

    for (const pointerEvent of coalesced) {
      queuePoint(getPoint(pointerEvent));
    }
  }

  function onPointerUp(event) {
    if (!state.active || event.pointerId !== state.active.pointerId) {
      return;
    }

    endActive(event.pointerId);
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

  function onToolbarClick(event) {
    const toolButton = event.target.closest("[data-tool]");
    if (toolButton && toolbar.contains(toolButton)) {
      setTool(toolButton.dataset.tool);
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

  function onKeyDown(event) {
    if (event.key === "Shift") {
      refreshShapeShift(true);
    }

    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    if (isTypingTarget(event.target)) {
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
  }

  toolbar.addEventListener("click", onToolbarClick);
  colorInput.addEventListener("input", () => {
    setColor(colorInput.value);
  });
  sizeInput.addEventListener("input", () => {
    setSizeByIndex(Number(sizeInput.value));
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

  const observer = new ResizeObserver(resizeCanvas);
  observer.observe(canvas.parentElement);
  resizeCanvas();
  canvas.dataset.cursor = state.tool;
  syncColorUI();
})();
