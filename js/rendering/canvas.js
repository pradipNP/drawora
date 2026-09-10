/**
 * Drawora — On-Screen Canvas Rendering
 * Handles viewport transformations, drawing board objects (strokes, shapes, text,
 * images, tables, file cards), grids, rulers, guides, overlays, and thumbnails.
 */
(function (D) {
  "use strict";

  const ctx = D.ctx;
  const canvas = D.canvas;

  function objectFontFamily(object) {
    return D.FONT_STACKS[object && object.fontKey] || D.FONT_FAMILY;
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
    const indent = Math.max(0, object.indent || 0) * D.INDENT_STEP;
    const list = object.list && object.list !== "none" ? D.LIST_GUTTER : 0;
    return indent + list;
  }

  function textPad(object) {
    return object && object.pad != null ? object.pad : D.TEXT_PAD;
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
    const minHeight = object.type === "sticky" ? D.STICKY_DEFAULT.height : 40;
    return Math.max(minHeight, height);
  }

  function reflowTextHeight(object) {
    if (!D.isTextLike(object)) {
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

    const markerX = object.x + textPad(object) + (object.indent || 0) * D.INDENT_STEP;
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

  function drawSticky(object) {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = object.fill || D.STICKY_FILL;
    ctx.strokeStyle = "rgb(28 25 23 / 0.08)";
    ctx.lineWidth = 1;
    pathRoundRect(object.x, object.y, object.width, object.height, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    if (D.state.editingId !== object.id) {
      drawWrappedText(object);
    }
  }

  function drawTextBox(object) {
    if (D.state.editingId === object.id) {
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
    const points = D.trianglePoints(shape);
    drawPolygon(shape, points);
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

  function drawArrow(shape) {
    const head = D.arrowHeadPoints(shape);
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
        drawPolygon(shape, D.polygonPoints(shape));
        break;
      case "arrow":
        drawArrow(shape);
        break;
      default:
        break;
    }
  }

  function drawPicture(object) {
    const asset = D.getImageAsset(object.imageId);
    if (!asset) {
      ctx.save();
      ctx.fillStyle = "rgb(28 25 23 / 0.08)";
      ctx.fillRect(object.x, object.y, object.width, object.height);
      ctx.restore();
      return;
    }

    const source = D.imageSourceRect(object, asset);
    const filter = D.imageFilter(object);
    const radius = Math.max(0, object.radius || 0);
    const opacity = Math.min(1, Math.max(0, object.opacity == null ? 1 : object.opacity));
    const cropping = D.state.cropping && D.state.selectedIds.length === 1 && D.state.selectedIds[0] === object.id;
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
      ctx.strokeStyle = D.SELECT_COLOR;
      ctx.lineWidth = D.viewLen(1);
      ctx.setLineDash([D.viewLen(4), D.viewLen(3)]);
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
    ctx.strokeStyle = object.color || D.SELECT_COLOR;
    ctx.lineWidth = Math.max(1, object.size || 2);
    pathRoundRect(object.x, object.y, object.width, object.height, radius);
    ctx.fill();
    ctx.stroke();

    applyTextMeasure({ ...object, fontSize: object.fontSize || 16 });
    ctx.fillStyle = object.color || D.SELECT_COLOR;
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
    ctx.strokeStyle = object.color || D.SELECT_COLOR;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    if ("letterSpacing" in ctx) {
      ctx.letterSpacing = "0px";
    }
  }

  function drawTable(object) {
    const layout = D.tableLayout(object);
    const editing =
      D.state.editingId === object.id && D.state.editingCell
        ? D.state.editingCell
        : null;
    const sel = D.selectedTable() === object && !editing ? D.getTableSelection() : null;

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
        const rect = D.tableCellRect(object, r, c);
        if (!rect) {
          continue;
        }
        if (cell.fill) {
          ctx.fillStyle = cell.fill;
          ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        }
        if (
          sel &&
          r <= sel.r2 &&
          r + Math.max(1, cell.rowspan || 1) - 1 >= sel.r1 &&
          c <= sel.c2 &&
          c + Math.max(1, cell.colspan || 1) - 1 >= sel.c1
        ) {
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
        const origin = D.tableOrigin(object, r, i);
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
        const origin = D.tableOrigin(object, i, c);
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
        const rect = D.tableCellRect(object, r, c);
        if (!rect || !(cell.text || "").length) {
          continue;
        }
        drawWrappedText(D.tableGhost(cell, rect));
      }
    }
    ctx.restore();
  }

  function truncateCanvasText(text, maxWidth) {
    const value = String(text || "");
    if (ctx.measureText(value).width <= maxWidth) {
      return value;
    }
    let cut = value;
    while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxWidth) {
      cut = cut.slice(0, -1);
    }
    return `${cut}…`;
  }

  function drawFileCard(object) {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = object.fill || "#f8fafc";
    ctx.strokeStyle = object.stroke || "#1c1917";
    ctx.lineWidth = Math.max(1, object.size || 1);
    pathRoundRect(object.x, object.y, object.width, object.height, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgb(15 118 110 / 0.14)";
    ctx.fillRect(object.x, object.y, Math.min(44, object.width * 0.18), object.height);
    ctx.beginPath();
    ctx.rect(object.x, object.y, object.width, object.height);
    ctx.clip();
    ctx.fillStyle = object.color || "#0f172a";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = `600 13px ${D.FONT_FAMILY}`;
    const textX = object.x + 52;
    const maxW = Math.max(40, object.width - 64);
    ctx.fillText(truncateCanvasText(object.fileName || "File", maxW), textX, object.y + 14);
    ctx.font = `400 11px ${D.FONT_FAMILY}`;
    ctx.fillStyle = "#57534e";
    ctx.fillText(truncateCanvasText(object.label || D.fileKindLabel(object.kind), maxW), textX, object.y + 34);
    if (object.note) {
      ctx.fillText(truncateCanvasText(object.note, maxW), textX, object.y + 52);
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

    if (object.type === "file") {
      drawFileCard(object);
      return;
    }

    drawShape(object);
  }

  function drawObject(object) {
    const rotation = object.rotation || 0;
    const flipX = !D.isImage(object) && object.flipX;
    const flipY = !D.isImage(object) && object.flipY;
    if (!rotation && !flipX && !flipY) {
      drawObjectUnrotated(object);
      return;
    }

    const center = D.getCenter(object);
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    ctx.translate(-center.x, -center.y);
    drawObjectUnrotated(object);
    ctx.restore();
  }

  function drawHandleBox(x, y) {
    const half = D.viewLen(D.HANDLE_SIZE) / 2;
    ctx.beginPath();
    ctx.rect(x - half, y - half, half * 2, half * 2);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = D.SELECT_COLOR;
    ctx.lineWidth = D.viewLen(1.25);
    ctx.fill();
    ctx.stroke();
  }

  function drawHandleCircle(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, D.viewLen(D.HANDLE_SIZE) / 2 + D.viewLen(1), 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = D.SELECT_COLOR;
    ctx.lineWidth = D.viewLen(1.25);
    ctx.fill();
    ctx.stroke();
  }

  function drawSingleSelection(object) {
    const frame = D.getFrame(object);
    const bounds = D.getLocalBounds(object);
    const center = D.getCenterFromBounds(bounds);
    const rotation = object.rotation || 0;
    const handles = D.handlePositions(frame, center, object);

    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);
    ctx.translate(-center.x, -center.y);

    if (object.locked) {
      ctx.strokeStyle = "#e11d48";
      ctx.lineWidth = D.viewLen(1.5);
      ctx.setLineDash([D.viewLen(3), D.viewLen(3)]);
      ctx.strokeRect(frame.x, frame.y, frame.width, frame.height);
      ctx.setLineDash([]);
      ctx.restore();
      return;
    }

    ctx.strokeStyle = D.SELECT_COLOR;
    ctx.lineWidth = D.viewLen(1);
    ctx.setLineDash([D.viewLen(5), D.viewLen(4)]);
    ctx.strokeRect(frame.x, frame.y, frame.width, frame.height);
    ctx.setLineDash([]);

    if (!(D.isImage(object) && D.state.cropping)) {
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

  function drawGroupSelection(objects) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const object of objects) {
      for (const corner of D.worldCorners(object)) {
        minX = Math.min(minX, corner.x);
        minY = Math.min(minY, corner.y);
        maxX = Math.max(maxX, corner.x);
        maxY = Math.max(maxY, corner.y);
      }
    }

    if (!Number.isFinite(minX)) {
      return;
    }

    const allLocked = objects.every((o) => o.locked);
    ctx.save();
    ctx.strokeStyle = allLocked ? "#e11d48" : D.SELECT_COLOR;
    ctx.lineWidth = D.viewLen(allLocked ? 1.5 : 1);
    ctx.setLineDash(allLocked ? [D.viewLen(3), D.viewLen(3)] : [D.viewLen(5), D.viewLen(4)]);
    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
    ctx.restore();
  }

  function drawSelectionOverlay() {
    if (D.state.editingId) {
      return;
    }

    const selected = D.selectedObjects();
    if (selected.length === 1) {
      drawSingleSelection(selected[0]);
      return;
    }

    if (selected.length > 1) {
      drawGroupSelection(selected);
    }
  }

  function drawMarquee(bounds) {
    if (bounds.width < 1 && bounds.height < 1) {
      return;
    }

    ctx.save();
    ctx.fillStyle = "rgb(15 118 110 / 0.08)";
    ctx.strokeStyle = D.SELECT_COLOR;
    ctx.lineWidth = D.viewLen(1);
    ctx.setLineDash([D.viewLen(4), D.viewLen(3)]);
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
    ctx.strokeStyle = D.SELECT_COLOR;
    ctx.lineWidth = D.viewLen(1);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.setLineDash([D.viewLen(4), D.viewLen(3)]);
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
      target.strokeStyle = D.hexLuminance(color) < 0.4 ? "rgb(252 165 165 / 0.7)" : "#e11d48";
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
    const page = typeof D.currentPage === "function" ? D.currentPage() : null;
    if (!page) {
      return;
    }

    const surface = typeof D.pageSurface === "function" ? D.pageSurface(page) : page.surface;

    ctx.save();
    ctx.shadowColor = "rgb(28 25 23 / 0.16)";
    ctx.shadowBlur = D.viewLen(18);
    ctx.shadowOffsetY = D.viewLen(4);
    ctx.fillStyle = surface.paperColor;
    ctx.fillRect(0, 0, page.width, page.height);
    ctx.shadowColor = "transparent";
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, page.width, page.height);
    ctx.clip();
    drawPagePattern(ctx, page.width, page.height, surface, D.viewLen);
    ctx.restore();
    ctx.strokeStyle = D.hexLuminance(surface.paperColor) < 0.35 ? "rgb(255 255 255 / 0.14)" : "rgb(28 25 23 / 0.1)";
    ctx.lineWidth = D.viewLen(1);
    ctx.strokeRect(0, 0, page.width, page.height);
    ctx.restore();
  }

  function drawGridOverlay() {
    if (!D.state.showGrid) {
      return;
    }
    const page = typeof D.currentPage === "function" ? D.currentPage() : null;
    if (!page) {
      return;
    }
    const step = typeof D.gridStep === "function" ? D.gridStep() : 24;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, page.width, page.height);
    ctx.clip();
    ctx.strokeStyle = "rgb(15 118 110 / 0.28)";
    ctx.lineWidth = D.viewLen(1);
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
    if (!D.state.showGuides) {
      return;
    }
    const page = typeof D.currentPage === "function" ? D.currentPage() : null;
    const guides = typeof D.pageGuides === "function" ? D.pageGuides() : [];
    if (!page || !guides.length) {
      return;
    }
    ctx.save();
    ctx.strokeStyle = "rgb(220 38 38 / 0.7)";
    ctx.lineWidth = D.viewLen(1);
    ctx.setLineDash([D.viewLen(6), D.viewLen(4)]);
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
    const drag = D.state.active;
    if (!drag || (drag.kind !== "measure" && drag.kind !== "protractor")) {
      return;
    }
    const start = drag.start;
    const end = drag.point;
    ctx.save();
    ctx.strokeStyle = D.SELECT_COLOR;
    ctx.fillStyle = D.SELECT_COLOR;
    ctx.lineWidth = D.viewLen(1.5);
    ctx.setLineDash([D.viewLen(4), D.viewLen(3)]);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(start.x, start.y, D.viewLen(3), 0, Math.PI * 2);
    ctx.arc(end.x, end.y, D.viewLen(3), 0, Math.PI * 2);
    ctx.fill();

    if (drag.kind === "protractor") {
      const radius = Math.max(D.distance(start, end), D.viewLen(24));
      ctx.beginPath();
      ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgb(15 118 110 / 0.45)";
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(start.x + radius, start.y);
      ctx.lineTo(start.x, start.y);
      ctx.stroke();
    }

    const label = drag.kind === "measure" ? D.formatLength(D.distance(start, end)) : D.formatAngle(start, end);
    ctx.font = `${D.viewLen(13)}px ${D.FONT_FAMILY}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#0f766e";
    ctx.fillText(label, (start.x + end.x) / 2, (start.y + end.y) / 2 - D.viewLen(8));
    ctx.restore();
  }

  function drawRulers(width, height) {
    ctx.fillStyle = "rgb(250 248 245 / 0.94)";
    ctx.fillRect(0, 0, width, D.RULER_SIZE);
    ctx.fillRect(0, 0, D.RULER_SIZE, height);
    ctx.strokeStyle = "rgb(28 25 23 / 0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, D.RULER_SIZE);
    ctx.lineTo(width, D.RULER_SIZE);
    ctx.moveTo(D.RULER_SIZE, 0);
    ctx.lineTo(D.RULER_SIZE, height);
    ctx.stroke();
    ctx.fillStyle = "rgb(120 113 108)";
    ctx.font = "10px " + D.FONT_FAMILY;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const step = Math.max(typeof D.gridStep === "function" ? D.gridStep() : 24, 20);
    const page = typeof D.currentPage === "function" ? D.currentPage() : null;
    if (!page) {
      return;
    }
    for (let x = 0; x <= page.width; x += step) {
      const screen = D.worldToScreen({ x, y: 0 });
      if (screen.x < D.RULER_SIZE || screen.x > width) {
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(screen.x, D.RULER_SIZE);
      ctx.lineTo(screen.x, D.RULER_SIZE - (x % (step * 5) === 0 ? 10 : 6));
      ctx.stroke();
      if (x % (step * 5) === 0) {
        ctx.fillText(String(Math.round(x)), screen.x, 3);
      }
    }
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let y = 0; y <= page.height; y += step) {
      const screen = D.worldToScreen({ x: 0, y });
      if (screen.y < D.RULER_SIZE || screen.y > height) {
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(D.RULER_SIZE, screen.y);
      ctx.lineTo(D.RULER_SIZE - (y % (step * 5) === 0 ? 10 : 6), screen.y);
      ctx.stroke();
      if (y % (step * 5) === 0) {
        ctx.fillText(String(Math.round(y)), D.RULER_SIZE - 4, screen.y);
      }
    }
    ctx.fillStyle = "rgb(250 248 245 / 0.94)";
    ctx.fillRect(0, 0, D.RULER_SIZE, D.RULER_SIZE);
  }

  function drawScreenTeaching() {
    ctx.save();
    ctx.setTransform(D.state.dpr, 0, 0, D.state.dpr, 0, 0);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (D.state.spotlight && D.state.pointerWorld) {
      const hole = D.worldToScreen(D.state.pointerWorld);
      ctx.fillStyle = "rgb(15 18 22 / 0.58)";
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      ctx.arc(hole.x, hole.y, D.SPOTLIGHT_RADIUS, 0, Math.PI * 2);
      ctx.fill("evenodd");
    }

    if (D.state.tool === "laser" && D.state.pointerWorld) {
      for (let i = 0; i < D.state.laserTrail.length; i += 1) {
        const item = D.worldToScreen(D.state.laserTrail[i]);
        const t = (i + 1) / D.state.laserTrail.length;
        ctx.beginPath();
        ctx.fillStyle = `rgb(220 38 38 / ${0.12 + t * 0.35})`;
        ctx.arc(item.x, item.y, 5 + t * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      const tip = D.worldToScreen(D.state.pointerWorld);
      ctx.beginPath();
      ctx.fillStyle = "rgb(220 38 38 / 0.95)";
      ctx.arc(tip.x, tip.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgb(255 255 255 / 0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    if (D.state.showRulers) {
      drawRulers(width, height);
    }

    ctx.restore();
  }

  function drawRemoteCursors() {
    if (!D.state.collabPeers || D.state.collabPeers.size === 0) return;
    const now = Date.now();
    ctx.save();
    ctx.setTransform(D.state.dpr, 0, 0, D.state.dpr, 0, 0);

    for (const [peerId, peer] of D.state.collabPeers) {
      if (!peer || !peer.cursor) continue;
      if (now - (peer.cursor.lastSeen || 0) > 30000) continue;
      if (peer.cursor.pageId && peer.cursor.pageId !== D.state.currentPageId) continue;

      const pt = D.worldToScreen({ x: peer.cursor.x, y: peer.cursor.y });
      const color = peer.color || "#0f766e";
      const name = peer.name || "Collaborator";

      // If remote peer is using laser pointer, draw laser trail
      if (peer.cursor.tool === "laser" && Array.isArray(peer.cursor.laserTrail) && peer.cursor.laserTrail.length > 0) {
        for (let i = 0; i < peer.cursor.laserTrail.length; i++) {
          const lItem = D.worldToScreen(peer.cursor.laserTrail[i]);
          const t = (i + 1) / peer.cursor.laserTrail.length;
          ctx.beginPath();
          ctx.fillStyle = `rgb(220 38 38 / ${0.12 + t * 0.35})`;
          ctx.arc(lItem.x, lItem.y, 4 + t * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.save();
      ctx.translate(pt.x, pt.y);

      // Draw Cursor pointer arrow
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 15);
      ctx.lineTo(4.5, 11);
      ctx.lineTo(8.5, 19);
      ctx.lineTo(11.5, 17.5);
      ctx.lineTo(7.5, 9.5);
      ctx.lineTo(13, 9.5);
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.25;
      ctx.stroke();

      // Name tag badge
      ctx.font = "bold 11px " + D.FONT_FAMILY;
      const textWidth = ctx.measureText(name).width;
      const badgeW = textWidth + 10;
      const badgeH = 18;
      const badgeX = 12;
      const badgeY = 14;

      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
      } else {
        ctx.rect(badgeX, badgeY, badgeW, badgeH);
      }
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(name, badgeX + 5, badgeY + badgeH / 2 + 0.5);

      ctx.restore();
    }

    ctx.restore();
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
    const surface = typeof D.pageSurface === "function" ? D.pageSurface(page) : page.surface;
    thumb.fillStyle = surface.paperColor;
    thumb.strokeStyle = D.hexLuminance(surface.paperColor) < 0.35 ? "rgb(255 255 255 / 0.18)" : "rgb(28 25 23 / 0.12)";
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

    const objects = page.id === D.state.currentPageId ? D.state.objects : page.objects;
    thumb.save();
    thumb.beginPath();
    thumb.rect(ox, oy, pw, ph);
    thumb.clip();
    thumb.translate(ox, oy);
    thumb.scale(scale, scale);
    for (const object of objects) {
      if (!D.isSelectable(object)) {
        continue;
      }
      const bounds = D.objectWorldBounds(object);
      thumb.fillStyle = D.hexLuminance(surface.paperColor) < 0.35 ? "rgb(255 255 255 / 0.45)" : "rgb(28 25 23 / 0.22)";
      thumb.fillRect(bounds.x, bounds.y, Math.max(bounds.width, 6), Math.max(bounds.height, 6));
    }
    thumb.restore();
  }

  function paintCurrentPageThumb() {
    if (!D.pageThumbs) {
      return;
    }
    const button = D.pageThumbs.querySelector(`[data-page-id="${D.state.currentPageId}"]`);
    const page = typeof D.currentPage === "function" ? D.currentPage() : null;
    if (!button || !page) {
      return;
    }
    paintThumb(button.querySelector("canvas"), page);
  }

  function renderPageThumbs() {
    const key = D.state.pages.map((page) => page.id).join(",");
    if (key !== D.state.pageThumbKey) {
      D.state.pageThumbKey = key;
      D.pageThumbs.replaceChildren();
      for (const page of D.state.pages) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "page-thumb";
        button.dataset.pageId = page.id;
        button.draggable = true;
        const thumbCanvas = document.createElement("canvas");
        thumbCanvas.width = 64;
        thumbCanvas.height = 80;
        button.appendChild(thumbCanvas);
        D.pageThumbs.appendChild(button);
      }
    }

    for (const button of D.pageThumbs.querySelectorAll(".page-thumb")) {
      const page = D.state.pages.find((item) => item.id === button.dataset.pageId);
      if (!page) {
        continue;
      }
      button.title = page.name;
      button.setAttribute("aria-label", page.name);
      button.setAttribute("aria-current", page.id === D.state.currentPageId ? "true" : "false");
      paintThumb(button.querySelector("canvas"), page);
    }
  }

  function redraw() {
    ctx.setTransform(D.state.dpr, 0, 0, D.state.dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#e4dfd6";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.setTransform(
      D.state.dpr * D.state.zoom,
      0,
      0,
      D.state.dpr * D.state.zoom,
      D.state.panX * D.state.dpr,
      D.state.panY * D.state.dpr
    );

    drawPageSheet();
    drawGridOverlay();

    const viewportBounds = D.getViewportWorldBounds(64);
    const hasManyObjects = D.state.objects.length > 20;

    for (const object of D.state.objects) {
      if (!object.hidden) {
        if (hasManyObjects && !D.state.selectedIds.includes(object.id)) {
          const objBounds = D.objectWorldBounds(object);
          if (!D.boundsIntersect(objBounds, viewportBounds)) {
            continue;
          }
        }
        drawObject(object);
      }
    }

    if (D.state.preview) {
      drawShape(D.state.preview);
    }

    if (D.state.active && D.state.active.kind === "marquee") {
      drawMarquee(D.normalizedBounds(D.state.active.start, D.state.active.point));
    }

    if (D.state.active && D.state.active.kind === "lasso") {
      drawLasso(D.state.active.points);
    }

    drawGuides();
    drawMeasureOverlay();
    drawSelectionOverlay();
    drawScreenTeaching();
    drawRemoteCursors();
    paintCurrentPageThumb();
  }

  function resizeCanvas() {
    const wrap = canvas.parentElement;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const nextDpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const nextWidth = Math.round(width * nextDpr);
    const nextHeight = Math.round(height * nextDpr);

    if (
      canvas.width === nextWidth &&
      canvas.height === nextHeight &&
      D.state.dpr === nextDpr
    ) {
      return;
    }

    D.state.dpr = nextDpr;
    canvas.width = nextWidth;
    canvas.height = nextHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    redraw();
  }

  function pageBounds() {
    const page = typeof D.currentPage === "function" ? D.currentPage() : null;
    if (!page) {
      return { x: 0, y: 0, width: 794, height: 1123 };
    }
    return { x: 0, y: 0, width: page.width, height: page.height };
  }

  function syncViewUI() {
    const label = D.formatZoom();
    if (D.zoomLabel) D.zoomLabel.textContent = label;
    if (D.zoomValue) D.zoomValue.textContent = label;
  }

  function refreshCameraOverlays() {
    if (D.state.editingId && typeof D.positionEditor === "function") {
      const object = D.findObject(D.state.editingId);
      if (D.isTextLike(object) || D.isTable(object)) {
        D.positionEditor(object);
      }
    }
    syncViewUI();
  }

  function setZoomAt(nextZoom, screenPoint) {
    const screen = screenPoint || D.viewportCenter();
    const world = D.screenToWorld(screen);
    D.state.zoom = Math.min(D.MAX_ZOOM, Math.max(D.MIN_ZOOM, nextZoom));
    D.state.panX = screen.x - world.x * D.state.zoom;
    D.state.panY = screen.y - world.y * D.state.zoom;
    refreshCameraOverlays();
    redraw();
  }

  function zoomBy(factor, screenPoint) {
    setZoomAt(D.state.zoom * factor, screenPoint);
  }

  function resetView() {
    D.state.zoom = 1;
    D.state.panX = 0;
    D.state.panY = 0;
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
    D.state.zoom = Math.min(D.MAX_ZOOM, Math.max(D.MIN_ZOOM, Math.min((vw - pad * 2) / width, (vh - pad * 2) / height)));
    D.state.panX = (vw - width * D.state.zoom) / 2 - bounds.x * D.state.zoom;
    D.state.panY = (vh - height * D.state.zoom) / 2 - bounds.y * D.state.zoom;
    refreshCameraOverlays();
    redraw();
  }

  function fitCanvas() {
    fitToBounds(pageBounds());
  }

  function fitSelection() {
    const selected = D.selectedObjects();
    if (selected.length === 0) {
      fitCanvas();
      return;
    }
    fitToBounds(D.unionBounds(selected.map((object) => D.objectWorldBounds(object))));
  }

  const exports = {
    objectFontFamily,
    objectFont,
    applyTextMeasure,
    textIndentWidth,
    textPad,
    textMaxWidth,
    wrapTextLayout,
    textLineHeight,
    textContentHeight,
    reflowTextHeight,
    textLineX,
    drawTextDecorations,
    drawWrappedText,
    pathRoundRect,
    drawSticky,
    drawTextBox,
    configureStroke,
    strokeNeedsRedraw,
    configureShape,
    paintClosedPath,
    drawDot,
    drawStroke,
    drawLine,
    drawRect,
    drawRoundRect,
    drawEllipse,
    drawTriangle,
    drawPolygon,
    drawArrow,
    drawShape,
    drawPicture,
    drawLink,
    drawTable,
    truncateCanvasText,
    drawFileCard,
    drawObjectUnrotated,
    drawObject,
    drawHandleBox,
    drawHandleCircle,
    drawSingleSelection,
    drawGroupSelection,
    drawSelectionOverlay,
    drawMarquee,
    drawLasso,
    strokePatternLine,
    drawGridLines,
    drawRuledLines,
    drawDotGrid,
    drawPagePattern,
    drawPageSheet,
    drawGridOverlay,
    drawGuides,
    drawMeasureOverlay,
    drawRulers,
    drawScreenTeaching,
    drawRemoteCursors,
    paintThumb,
    paintCurrentPageThumb,
    renderPageThumbs,
    redraw,
    resizeCanvas,
    pageBounds,
    syncViewUI,
    refreshCameraOverlays,
    setZoomAt,
    zoomBy,
    resetView,
    fitToBounds,
    fitCanvas,
    fitSelection,
  };

  Object.assign(D, exports);
  Object.assign(window, exports);
})(window.Drawora = window.Drawora || {});
