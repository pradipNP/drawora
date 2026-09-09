// js/modules/tools.js
// Drawora tools, transformations, strokes, shapes, measuring, laser, and teaching modes
(function (D) {
  "use strict";

  function replaceObjectFromClone(target, source) {
    const id = target.id;
    Object.keys(target).forEach((key) => {
      delete target[key];
    });
    Object.assign(target, cloneData(source), { id });
  }

  function applyMove(point) {
    const drag = D.state.active;
    const step = typeof gridStep === "function" ? gridStep() : 24;
    const dx = D.state.showGrid
      ? Math.round((point.x - drag.startPoint.x) / step) * step
      : point.x - drag.startPoint.x;
    const dy = D.state.showGrid
      ? Math.round((point.y - drag.startPoint.y) / step) * step
      : point.y - drag.startPoint.y;
    drag.targets.forEach((object, index) => {
      replaceObjectFromClone(object, drag.startObjects[index]);
      translateObject(object, dx, dy);
    });
  }

  function applyRotate(point) {
    const drag = D.state.active;
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
    const drag = D.state.active;
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

    if (right - left < D.MIN_FRAME) {
      if (drag.handle.includes("w")) {
        left = right - D.MIN_FRAME;
      } else {
        right = left + D.MIN_FRAME;
      }
    }
    if (isTextLike(object) && right - left < D.MIN_TEXT_WIDTH) {
      if (drag.handle.includes("w")) {
        left = right - D.MIN_TEXT_WIDTH;
      } else {
        right = left + D.MIN_TEXT_WIDTH;
      }
    }
    if (isTable(object)) {
      const minW = tableColCount(object) * D.TABLE_CELL_MIN;
      const minH = tableRowCount(object) * D.TABLE_CELL_MIN;
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
    if (bottom - top < D.MIN_FRAME) {
      if (drag.handle.includes("n")) {
        top = bottom - D.MIN_FRAME;
      } else {
        bottom = top + D.MIN_FRAME;
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
    const drag = D.state.active;
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

    if (right - left < D.MIN_IMAGE) {
      if (drag.handle.includes("w")) {
        left = right - D.MIN_IMAGE;
      } else {
        right = left + D.MIN_IMAGE;
      }
    }
    if (bottom - top < D.MIN_IMAGE) {
      if (drag.handle.includes("n")) {
        top = bottom - D.MIN_IMAGE;
      } else {
        bottom = top + D.MIN_IMAGE;
      }
    }

    const visualLeft = (left - start.x) / scaleX;
    const visualRight = (right - start.x) / scaleX;
    const visualTop = (top - start.y) / scaleY;
    const visualBottom = (bottom - start.y) / scaleY;
    let srcLeft = start.flipX ? crop.sx + crop.sw - visualRight : crop.sx + visualLeft;
    let srcRight = start.flipX ? crop.sx + crop.sw - visualLeft : crop.sx + visualRight;
    let srcTop = start.flipY ? crop.sy + crop.sh - visualBottom : crop.sy + visualTop;
    let srcBottom = start.flipY ? crop.sy + crop.sh - visualBottom : crop.sy + visualBottom;

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
    if (!D.state.active || D.state.active.kind !== "transform") {
      return;
    }

    if (D.state.active.mode === "move") {
      applyMove(point);
      return;
    }

    if (D.state.active.mode === "rotate") {
      applyRotate(point);
      return;
    }

    if (D.state.active.mode === "crop") {
      applyCrop(point);
      return;
    }

    if (D.state.active.mode === "table-split") {
      applyTableSplit(point);
      return;
    }

    applyResize(point);
  }

  function applyTableSplit(point) {
    const drag = D.state.active;
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
      const min = D.TABLE_CELL_MIN;
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
    const min = D.TABLE_CELL_MIN;
    const y = Math.min(top.y + pair - min, Math.max(top.y + min, local.y - object.y));
    const topH = y - top.y;
    object.rowH = start.rowH.slice();
    object.rowH[split.index - 1] = topH / start.height;
    object.rowH[split.index] = (pair - topH) / start.height;
    object.rowH = normalizeFractions(object.rowH);
  }

  function flushSelectDrag() {
    D.state.raf = 0;
    if (!D.state.active || D.state.active.kind !== "transform" || !D.state.active.point) {
      return;
    }

    applyTransform(D.state.active.point);
    redraw();
  }

  function queueSelectDrag(point, shift) {
    if (!D.state.active || D.state.active.kind !== "transform") {
      return;
    }

    D.state.active.point = point;
    if (shift != null) {
      D.state.active.shift = shift;
    }
    if (!D.state.raf) {
      D.state.raf = requestAnimationFrame(flushSelectDrag);
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

    D.state.active = {
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
    D.canvas.style.cursor = mode === "move" ? "grabbing" : D.canvas.style.cursor;
  }

  function finishTransform(pointerId) {
    if (!D.state.active || D.state.active.kind !== "transform" || D.state.active.pointerId !== pointerId) {
      return;
    }

    if (D.state.raf) {
      cancelAnimationFrame(D.state.raf);
      flushSelectDrag();
    }

    D.state.active = null;
    releasePointer(pointerId);
    commitIfChanged();
    redraw();
  }

  function cancelActive() {
    if (!D.state.active) {
      if (D.state.editingId) {
        finishEditing();
      } else {
        clearSelection();
        redraw();
      }
      return;
    }

    if (D.state.historyBefore) {
      restoreBoard(D.state.historyBefore);
      discardHistoryCapture();
    }

    const pointerId = D.state.active.pointerId;
    if (D.state.raf) {
      cancelAnimationFrame(D.state.raf);
      D.state.raf = 0;
    }
    D.state.preview = null;
    D.state.queuedPoints = [];
    D.state.active = null;
    D.canvas.classList.remove("is-panning");
    if (pointerId != null) {
      releasePointer(pointerId);
    }
    redraw();
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
    if (D.state.spacePan || D.state.tool === "pan") {
      D.canvas.style.cursor = D.state.active && D.state.active.kind === "pan" ? "grabbing" : "grab";
      return;
    }

    if (D.state.tool !== "select" || D.state.active) {
      return;
    }

    const handle = hitHandle(point);
    if (handle) {
      D.canvas.style.cursor = cursorForHandle(handle);
      return;
    }

    const split = hitTableSplit(point);
    if (split) {
      D.canvas.style.cursor = split.kind === "col" ? "col-resize" : "row-resize";
      return;
    }

    const object = hitObject(point);
    D.canvas.style.cursor = isLink(object) ? "pointer" : object ? "move" : "default";
  }

  function onSelectPointerDown(event, point) {
    const handle = hitHandle(point);
    if (handle) {
      captureBefore();
      const mode = handle === "rotate" ? "rotate" : D.state.cropping && isImage(findObject(D.state.selectedIds[0])) ? "crop" : "resize";
      D.canvas.style.cursor = handle === "rotate" ? "grabbing" : cursorForHandle(handle);
      startTransform(mode, handle, point, event.pointerId);
      D.state.active.shift = event.shiftKey;
      return;
    }

    const split = hitTableSplit(point);
    if (split) {
      captureBefore();
      startTransform("table-split", null, point, event.pointerId);
      D.state.active.split = split;
      D.canvas.style.cursor = split.kind === "col" ? "col-resize" : "row-resize";
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
      if (isTable(object) && event.shiftKey && D.state.selectedIds.length === 1 && D.state.selectedIds[0] === object.id) {
        const cell = hitTableCell(object, objectLocalPoint(object, point));
        if (cell) {
          const from = D.state.tableCell && D.state.tableCell.id === object.id ? D.state.tableCell : cell;
          D.state.tableRange = { r1: from.r, c1: from.c, r2: cell.r, c2: cell.c };
          D.state.tableCell = { id: object.id, r: from.r, c: from.c };
          syncFormatFromSelection();
          syncTableUI();
          redraw();
          return;
        }
      }
      if (event.shiftKey) {
        const allSelected = groupIds.every((id) => D.state.selectedIds.includes(id));
        if (allSelected) {
          setSelection(D.state.selectedIds.filter((id) => !groupIds.includes(id)));
        } else {
          setSelection([...new Set([...D.state.selectedIds, ...groupIds])]);
        }
        redraw();
        return;
      }

      if (!D.state.selectedIds.includes(object.id)) {
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

    D.state.active = {
      kind: "marquee",
      pointerId: event.pointerId,
      start: point,
      point,
      shift: event.shiftKey,
    };
    D.canvas.style.cursor = "crosshair";
    redraw();
  }

  function flushPoints() {
    D.state.raf = 0;
    const stroke = D.state.active && D.state.active.kind === "stroke" && D.state.active.stroke;
    const points = D.state.queuedPoints;
    D.state.queuedPoints = [];

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

    D.ctx.save();
    configureStroke(stroke);
    D.ctx.beginPath();
    D.ctx.moveTo(from.x, from.y);
    for (const point of added) {
      D.ctx.lineTo(point.x, point.y);
    }
    D.ctx.stroke();
    D.ctx.restore();
  }

  function flushShapePreview() {
    D.state.raf = 0;
    if (!D.state.active || D.state.active.kind !== "shape" || !D.state.active.point) {
      return;
    }

    D.state.preview = makeShape(
      D.state.active.shapeType,
      D.state.active.start,
      D.state.active.point,
      D.state.active.shift
    );
    redraw();
  }

  function queuePoint(point) {
    if (!D.state.active || D.state.active.kind !== "stroke") {
      return;
    }

    D.state.queuedPoints.push(point);
    if (!D.state.raf) {
      D.state.raf = requestAnimationFrame(flushPoints);
    }
  }

  function queueShapePreview(point, shift) {
    if (!D.state.active || D.state.active.kind !== "shape") {
      return;
    }

    D.state.active.point = snapPoint(point);
    D.state.active.shift = D.state.tool === "compass" ? true : shift;
    if (!D.state.raf) {
      D.state.raf = requestAnimationFrame(flushShapePreview);
    }
  }

  function releasePointer(pointerId) {
    try {
      if (D.canvas.hasPointerCapture(pointerId)) {
        D.canvas.releasePointerCapture(pointerId);
      }
    } catch (error) {
      console.error("Drawora: pointer release failed.", error);
    }
  }

  function capturePointer(pointerId) {
    try {
      D.canvas.setPointerCapture(pointerId);
    } catch (error) {
      console.error("Drawora: pointer capture failed.", error);
    }
  }

  function endStroke(pointerId) {
    if (!D.state.active || D.state.active.kind !== "stroke" || D.state.active.pointerId !== pointerId) {
      return;
    }

    if (D.state.raf) {
      cancelAnimationFrame(D.state.raf);
      flushPoints();
    }

    D.state.active = null;
    releasePointer(pointerId);
    commitIfChanged();
  }

  function finishShape(pointerId) {
    if (!D.state.active || D.state.active.kind !== "shape" || D.state.active.pointerId !== pointerId) {
      return;
    }

    if (D.state.raf) {
      cancelAnimationFrame(D.state.raf);
      flushShapePreview();
    }

    const shape = D.state.preview;
    D.state.preview = null;
    D.state.active = null;
    releasePointer(pointerId);

    if (shape && isShapeMeaningful(shape)) {
      captureBefore();
      D.state.objects.push({ id: createId(), ...shape });
      commitIfChanged();
    }

    redraw();
  }

  function endActive(pointerId) {
    if (!D.state.active || D.state.active.pointerId !== pointerId) {
      return;
    }

    if (D.state.active.kind === "shape") {
      finishShape(pointerId);
      return;
    }

    if (D.state.active.kind === "transform") {
      finishTransform(pointerId);
      return;
    }

    if (D.state.active.kind === "textbox") {
      finishTextBox(pointerId);
      return;
    }

    if (D.state.active.kind === "marquee") {
      finishMarquee(pointerId);
      return;
    }

    if (D.state.active.kind === "lasso") {
      finishLasso(pointerId);
      return;
    }

    if (D.state.active.kind === "guide") {
      finishGuide(pointerId);
      return;
    }

    if (D.state.active.kind === "measure" || D.state.active.kind === "protractor") {
      finishMeasure(pointerId);
      return;
    }

    if (D.state.active.kind === "pan") {
      finishPan(pointerId);
      return;
    }

    endStroke(pointerId);
  }

  function startPan(pointerId, screen) {
    D.canvas.classList.add("is-panning");
    D.state.active = {
      kind: "pan",
      pointerId,
      startScreen: screen,
      startPanX: D.state.panX,
      startPanY: D.state.panY,
    };
  }

  function movePan(screen) {
    if (!D.state.active || D.state.active.kind !== "pan") {
      return;
    }

    D.state.panX = D.state.active.startPanX + (screen.x - D.state.active.startScreen.x);
    D.state.panY = D.state.active.startPanY + (screen.y - D.state.active.startScreen.y);
    refreshCameraOverlays();
    redraw();
  }

  function finishPan(pointerId) {
    if (!D.state.active || D.state.active.kind !== "pan" || D.state.active.pointerId !== pointerId) {
      return;
    }

    D.state.active = null;
    D.canvas.classList.remove("is-panning");
    releasePointer(pointerId);
    D.canvas.style.cursor = D.state.spacePan || D.state.tool === "pan" ? "grab" : "";
    redraw();
  }

  function queueMarquee(point) {
    if (!D.state.active || D.state.active.kind !== "marquee") {
      return;
    }

    D.state.active.point = point;
    if (!D.state.raf) {
      D.state.raf = requestAnimationFrame(flushMarquee);
    }
  }

  function flushMarquee() {
    D.state.raf = 0;
    if (!D.state.active || D.state.active.kind !== "marquee") {
      return;
    }
    redraw();
  }

  function finishMarquee(pointerId) {
    if (!D.state.active || D.state.active.kind !== "marquee" || D.state.active.pointerId !== pointerId) {
      return;
    }

    if (D.state.raf) {
      cancelAnimationFrame(D.state.raf);
      D.state.raf = 0;
    }

    const bounds = normalizedBounds(D.state.active.start, D.state.active.point);
    const additive = D.state.active.shift;
    D.state.active = null;
    releasePointer(pointerId);

    if (bounds.width >= viewLen(4) || bounds.height >= viewLen(4)) {
      const hits = D.state.objects
        .filter((object) => isSelectable(object) && boundsIntersect(objectWorldBounds(object), bounds))
        .map((object) => object.id);
      const ids = expandGroupIds(hits);
      if (additive) {
        setSelection([...new Set([...D.state.selectedIds, ...ids])]);
      } else {
        setSelection(ids);
      }
    }

    D.canvas.style.cursor = "";
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
      tool: D.state.tool,
      color: D.state.stroke,
      size: D.state.size,
      rotation: 0,
      points: [],
    };

    if (D.state.tool === "spray") {
      scatterSpray(stroke, point);
    } else {
      stroke.points.push(point);
    }

    D.state.objects.push(stroke);
    D.state.active = { kind: "stroke", pointerId, stroke };
    if (stroke.tool === "spray" || strokeNeedsRedraw(stroke)) {
      redraw();
    } else {
      drawDot(stroke, point);
    }
  }

  function startShape(pointerId, point, shift) {
    clearSelection();
    const start = snapPoint(point);
    D.state.active = {
      kind: "shape",
      pointerId,
      shapeType: D.state.tool === "compass" ? "ellipse" : D.state.tool,
      start,
      point: start,
      shift: D.state.tool === "compass" ? true : shift,
    };
    queueShapePreview(start, D.state.active.shift);
  }

  function setTool(tool) {
    if (!D.TOOLS.includes(tool) || tool === D.state.tool) {
      return;
    }

    if (D.state.frozen && isFrozenBlockedTool(tool)) {
      return;
    }

    if (tool === "eyedropper") {
      D.state.eyedropperReturn = D.state.tool;
    }

    if (D.state.active) {
      endActive(D.state.active.pointerId);
    }

    if (D.state.editingId) {
      finishEditing();
    }

    if (tool !== "select") {
      D.state.cropping = false;
    }

    if (D.state.tool === "laser" && tool !== "laser") {
      D.state.laserTrail = [];
      if (!D.state.spotlight) {
        D.state.pointerWorld = null;
      }
    }

    D.state.tool = tool;
    D.canvas.dataset.cursor = tool;
    D.canvas.style.cursor = "";

    if (tool !== "select" && tool !== "pan" && tool !== "lasso" && !isOverlayTool(tool)) {
      clearSelection();
      redraw();
    }

    if (D.toolbar) {
      for (const button of D.toolbar.querySelectorAll("[data-tool]")) {
        button.setAttribute("aria-pressed", String(button.dataset.tool === tool));
      }
    }
    syncImageUI();
    syncTeachUI();
    announceA11y(`Tool selected: ${tool}`);
  }

  function syncColorUI() {
    const activeColor = D.state.colorTarget === "fill" ? D.state.fill : D.state.stroke;

    if (D.toolbar) {
      for (const button of D.toolbar.querySelectorAll("[data-color-target]")) {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.colorTarget === D.state.colorTarget)
        );
      }
    }

    if (D.fillTargetButton) D.fillTargetButton.classList.toggle("is-none", !D.state.fill);
    if (D.strokePreview) {
      D.strokePreview.style.background = "#fff";
      D.strokePreview.style.borderColor = D.state.stroke;
    }
    if (D.fillPreview) {
      D.fillPreview.style.background = D.state.fill || "#fff";
      D.fillPreview.style.borderColor = D.state.fill || "rgb(28 25 23 / 0.28)";
    }

    let matchedPreset = false;
    if (D.toolbar) {
      for (const swatch of D.toolbar.querySelectorAll(".swatch[data-color]")) {
        const value = swatch.dataset.color;
        const selected =
          value === "none"
            ? D.state.colorTarget === "fill" && D.state.fill === null
            : Boolean(activeColor) && normalizeHex(value) === normalizeHex(activeColor);
        swatch.setAttribute("aria-pressed", String(selected));
        if (selected && value !== "none") {
          matchedPreset = true;
        }
      }
    }

    if (D.customSwatch) {
      D.customSwatch.classList.toggle(
        "is-selected",
        Boolean(activeColor) && !matchedPreset
      );
    }
    if (activeColor && D.colorInput && D.colorInput.value.toLowerCase() !== normalizeHex(activeColor)) {
      D.colorInput.value = activeColor;
    }
  }

  function setColorTarget(target) {
    if (target !== "stroke" && target !== "fill") {
      return;
    }

    D.state.colorTarget = target;
    syncColorUI();
  }

  function setColor(color) {
    if (color === "none") {
      D.state.fill = null;
      D.state.colorTarget = "fill";
    } else {
      const hex = normalizeHex(color);
      if (D.state.colorTarget === "fill") {
        D.state.fill = hex;
      } else {
        D.state.stroke = hex;
      }
    }

    syncColorUI();
    applyFormatChange();
  }

  function setSizeByIndex(index, commit) {
    const nextIndex = Math.min(D.SIZE_STOPS.length - 1, Math.max(0, index));
    D.state.size = D.SIZE_STOPS[nextIndex];
    if (D.sizeInput) {
      D.sizeInput.value = String(nextIndex);
      D.sizeInput.setAttribute("aria-valuetext", `${D.state.size} pixels`);
    }
    if (D.sizeValue) {
      D.sizeValue.textContent = `${D.state.size}px`;
    }

    if (D.state.selectedIds.length > 0 && !D.state.active) {
      applyStyleToSelected(true);
      redraw();
      if (commit) {
        commitIfChanged();
      }
    }
  }

  function toggleImageCrop() {
    const image = selectedImage();
    if (!image) {
      return;
    }
    D.state.cropping = !D.state.cropping;
    if (D.state.cropping && D.state.tool !== "select") {
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
    return D.state.fill || D.state.stroke;
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
    const x = Math.max(0, Math.min(D.canvas.width - 1, Math.round(screen.x * D.state.dpr)));
    const y = Math.max(0, Math.min(D.canvas.height - 1, Math.round(screen.y * D.state.dpr)));
    const data = D.ctx.getImageData(x, y, 1, 1).data;
    if (data[3] < 12) {
      return null;
    }
    return rgbToHex(data[0], data[1], data[2]);
  }

  function pickColorAt(event) {
    const hex = sampleCanvasColor(event);
    if (hex) {
      if (D.state.colorTarget === "fill") {
        D.state.fill = hex;
      } else {
        D.state.stroke = hex;
      }
      syncColorUI();
    }
    const next =
      D.state.eyedropperReturn && D.state.eyedropperReturn !== "eyedropper" ? D.state.eyedropperReturn : "pen";
    setTool(next);
  }

  function startLasso(pointerId, point, shift) {
    D.state.active = {
      kind: "lasso",
      pointerId,
      points: [point],
      shift,
    };
    D.canvas.style.cursor = "crosshair";
    redraw();
  }

  function queueLasso(point, shift) {
    if (!D.state.active || D.state.active.kind !== "lasso") {
      return;
    }
    D.state.active.shift = shift;
    const last = D.state.active.points[D.state.active.points.length - 1];
    if (last && distance(last, point) < viewLen(2)) {
      return;
    }
    D.state.active.points.push(point);
    if (!D.state.raf) {
      D.state.raf = requestAnimationFrame(flushLasso);
    }
  }

  function flushLasso() {
    D.state.raf = 0;
    if (!D.state.active || D.state.active.kind !== "lasso") {
      return;
    }
    redraw();
  }

  function finishLasso(pointerId) {
    if (!D.state.active || D.state.active.kind !== "lasso" || D.state.active.pointerId !== pointerId) {
      return;
    }
    if (D.state.raf) {
      cancelAnimationFrame(D.state.raf);
      D.state.raf = 0;
    }
    const points = D.state.active.points;
    const additive = D.state.active.shift;
    D.state.active = null;
    releasePointer(pointerId);

    let hits;
    if (points.length < 3) {
      const object = hitObject(points[0]);
      hits = object ? [object.id] : [];
    } else {
      hits = D.state.objects
        .filter((object) => isSelectable(object) && pointInPolygon(getCenter(object), points))
        .map((object) => object.id);
    }
    const ids = expandGroupIds(hits);
    if (additive) {
      setSelection([...new Set([...D.state.selectedIds, ...ids])]);
    } else {
      setSelection(ids);
    }
    D.canvas.style.cursor = "";
    redraw();
  }

  function syncPresenterUI() {
    if (!D.presenterBar) return;
    const curIdx = currentPageIndex() + 1;
    const total = D.state.pages.length;
    if (D.presenterPageStatus) {
      D.presenterPageStatus.textContent = `${curIdx} / ${total}`;
    }

    if (D.presenterLaserBtn) D.presenterLaserBtn.setAttribute("aria-pressed", String(D.state.tool === "laser"));
    if (D.presenterPenBtn) {
      D.presenterPenBtn.setAttribute(
        "aria-pressed",
        String(D.state.tool === "pen" || D.state.tool === "brush" || D.state.tool === "pencil" || D.state.tool === "highlighter" || D.state.tool === "marker")
      );
    }
    if (D.presenterEraserBtn) D.presenterEraserBtn.setAttribute("aria-pressed", String(D.state.tool === "eraser"));

    if (D.presenterBlackBtn) D.presenterBlackBtn.classList.toggle("is-active-screen", D.state.presentationScreen === "black");
    if (D.presenterWhiteBtn) D.presenterWhiteBtn.classList.toggle("is-active-screen", D.state.presentationScreen === "white");

    if (D.presentationCurtain) {
      if (D.state.presentationScreen === "black") {
        D.presentationCurtain.hidden = false;
        D.presentationCurtain.className = "presentation-curtain is-black";
      } else if (D.state.presentationScreen === "white") {
        D.presentationCurtain.hidden = false;
        D.presentationCurtain.className = "presentation-curtain is-white";
      } else {
        D.presentationCurtain.hidden = true;
      }
    }
  }

  function resetPresenterIdleTimer() {
    if (!D.state.presenting || !D.presenterBar) return;
    D.presenterBar.classList.remove("is-idle");
    if (D.state.presenterIdleTimer) {
      clearTimeout(D.state.presenterIdleTimer);
    }
    D.state.presenterIdleTimer = setTimeout(() => {
      if (D.state.presenting && D.presenterBar) {
        D.presenterBar.classList.add("is-idle");
      }
    }, 3500);
  }

  function startPresentation() {
    if (D.state.presenting) return;
    if (typeof finishOpenWork === "function") {
      finishOpenWork();
    }
    clearSelection();
    D.state.presenting = true;
    D.state.presentationScreen = null;
    if (D.appEl) D.appEl.classList.add("is-presenting");

    if (!document.fullscreenElement && D.appEl && D.appEl.requestFullscreen) {
      D.appEl.requestFullscreen().catch(() => {});
    }

    setTool("laser");
    resetPresenterIdleTimer();
    setTimeout(() => {
      resizeCanvas();
      fitCanvas();
    }, 50);
    syncPresenterUI();
    syncTeachUI();
  }

  function stopPresentation() {
    if (!D.state.presenting) return;
    D.state.presenting = false;
    D.state.presentationScreen = null;
    if (D.appEl) D.appEl.classList.remove("is-presenting");

    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }

    if (D.state.presenterIdleTimer) {
      clearTimeout(D.state.presenterIdleTimer);
      D.state.presenterIdleTimer = null;
    }
    if (D.presenterBar) {
      D.presenterBar.classList.remove("is-idle");
    }

    setTool("select");
    setTimeout(() => {
      resizeCanvas();
      fitCanvas();
    }, 50);
    syncPresenterUI();
    syncTeachUI();
  }

  function togglePresentation() {
    if (D.state.presenting) {
      stopPresentation();
    } else {
      startPresentation();
    }
  }

  function setPresentationScreen(screen) {
    if (!D.state.presenting) return;
    D.state.presentationScreen = screen;
    syncPresenterUI();
  }

  function syncTeachUI() {
    const pressed = (selector, on) => {
      if (D.toolbar) {
        for (const button of D.toolbar.querySelectorAll(selector)) {
          button.setAttribute("aria-pressed", String(Boolean(on)));
        }
      }
    };
    pressed('[data-action="toggle-grid"]', D.state.showGrid);
    pressed('[data-action="toggle-rulers"]', D.state.showRulers);
    pressed('[data-action="toggle-guides"]', D.state.showGuides);
    pressed('[data-action="toggle-spotlight"]', D.state.spotlight);
    pressed('[data-action="toggle-freeze"]', D.state.frozen);
    pressed('[data-action="fullscreen"]', Boolean(document.fullscreenElement));
    pressed('[data-action="presentation-start"]', D.state.presenting);
    if (D.appEl) D.appEl.classList.toggle("is-frozen", D.state.frozen);
    const parts = [];
    if (D.state.frozen) {
      parts.push("Frozen");
    }
    if (D.state.spotlight) {
      parts.push("Spotlight");
    }
    if (D.state.active && D.state.active.kind === "measure") {
      parts.push(formatLength(distance(D.state.active.start, D.state.active.point)));
    } else if (D.state.active && D.state.active.kind === "protractor") {
      parts.push(formatAngle(D.state.active.start, D.state.active.point));
    }
    if (D.teachStatus) {
      if (parts.length) {
        D.teachStatus.hidden = false;
        D.teachStatus.textContent = parts.join(" · ");
      } else {
        D.teachStatus.hidden = true;
        D.teachStatus.textContent = "";
      }
    }
    syncPresenterUI();
  }

  function toggleFlag(name) {
    D.state[name] = !D.state[name];
    if (name === "showRulers" && D.state.showRulers) {
      D.state.showGuides = true;
    }
    if (name === "spotlight" && D.state.spotlight && !D.state.pointerWorld) {
      D.state.pointerWorld = screenToWorld(viewportCenter());
    }
    if (name === "frozen" && D.state.frozen) {
      if (typeof finishOpenWork === "function") {
        finishOpenWork();
      }
      if (D.state.tool !== "pan" && D.state.tool !== "laser") {
        setTool("laser");
      }
    }
    syncTeachUI();
    redraw();
  }

  function pushLaserTrail(point) {
    D.state.pointerWorld = point;
    const last = D.state.laserTrail[D.state.laserTrail.length - 1];
    if (last && distance(last, point) < viewLen(2)) {
      return;
    }
    D.state.laserTrail.push(point);
    if (D.state.laserTrail.length > 18) {
      D.state.laserTrail.shift();
    }
  }

  function hitRulerEdge(screen) {
    if (!D.state.showRulers) {
      return null;
    }
    if (screen.x <= D.RULER_SIZE && screen.y <= D.RULER_SIZE) {
      return null;
    }
    if (screen.x <= D.RULER_SIZE) {
      return "x";
    }
    if (screen.y <= D.RULER_SIZE) {
      return "y";
    }
    return null;
  }

  function hitGuide(point) {
    if (!D.state.showGuides) {
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
    D.state.active = {
      kind: "guide",
      pointerId,
      axis,
      index,
      pos,
    };
    if (index < 0) {
      pageGuides().push({ axis, pos });
      D.state.active.index = pageGuides().length - 1;
      D.state.showGuides = true;
    }
    D.canvas.style.cursor = axis === "x" ? "ew-resize" : "ns-resize";
    syncTeachUI();
    redraw();
  }

  function moveGuide(point) {
    const drag = D.state.active;
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
    if (!D.state.raf) {
      D.state.raf = requestAnimationFrame(() => {
        D.state.raf = 0;
        redraw();
      });
    }
  }

  function finishGuide(pointerId) {
    if (!D.state.active || D.state.active.kind !== "guide" || D.state.active.pointerId !== pointerId) {
      return;
    }
    const page = currentPage();
    const guides = pageGuides();
    const guide = guides[D.state.active.index];
    if (guide && page) {
      const off =
        guide.axis === "x"
          ? guide.pos <= 0 || guide.pos >= page.width
          : guide.pos <= 0 || guide.pos >= page.height;
      if (off) {
        guides.splice(D.state.active.index, 1);
      }
    }
    D.state.active = null;
    releasePointer(pointerId);
    D.canvas.style.cursor = "";
    redraw();
  }

  function startMeasure(kind, pointerId, point) {
    const start = snapPoint(point);
    D.state.active = { kind, pointerId, start, point: start };
    D.canvas.style.cursor = "crosshair";
    syncTeachUI();
    redraw();
  }

  function moveMeasure(point) {
    if (!D.state.active || (D.state.active.kind !== "measure" && D.state.active.kind !== "protractor")) {
      return;
    }
    D.state.active.point = snapPoint(point);
    if (!D.state.raf) {
      D.state.raf = requestAnimationFrame(() => {
        D.state.raf = 0;
        syncTeachUI();
        redraw();
      });
    }
  }

  function finishMeasure(pointerId) {
    if (
      !D.state.active ||
      (D.state.active.kind !== "measure" && D.state.active.kind !== "protractor") ||
      D.state.active.pointerId !== pointerId
    ) {
      return;
    }
    D.state.active = null;
    releasePointer(pointerId);
    syncTeachUI();
    redraw();
  }

  const exports = {
    replaceObjectFromClone,
    applyMove,
    applyRotate,
    applyResize,
    applyCrop,
    applyTransform,
    applyTableSplit,
    flushSelectDrag,
    queueSelectDrag,
    startTransform,
    finishTransform,
    cancelActive,
    cursorForHandle,
    updateSelectCursor,
    onSelectPointerDown,
    flushPoints,
    flushShapePreview,
    queuePoint,
    queueShapePreview,
    releasePointer,
    capturePointer,
    endStroke,
    finishShape,
    endActive,
    startPan,
    movePan,
    finishPan,
    queueMarquee,
    flushMarquee,
    finishMarquee,
    scatterSpray,
    startStroke,
    startShape,
    setTool,
    syncColorUI,
    setColorTarget,
    setColor,
    setSizeByIndex,
    toggleImageCrop,
    toggleImageFlag,
    fillColor,
    applyFillAt,
    sampleCanvasColor,
    pickColorAt,
    startLasso,
    queueLasso,
    flushLasso,
    finishLasso,
    syncPresenterUI,
    resetPresenterIdleTimer,
    startPresentation,
    stopPresentation,
    togglePresentation,
    setPresentationScreen,
    syncTeachUI,
    toggleFlag,
    pushLaserTrail,
    hitRulerEdge,
    hitGuide,
    startGuideDrag,
    moveGuide,
    finishGuide,
    startMeasure,
    moveMeasure,
    finishMeasure,
  };

  Object.assign(D, exports);
  Object.assign(window, exports);
})(window.Drawora = window.Drawora || {});
