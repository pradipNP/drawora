/**
 * Drawora — Object Model & Hit Testing
 * Defines object predicates, hit tests, bounding frames, shape geometry,
 * table cell structures, and image asset models.
 */
(function (D) {
  "use strict";

  function isShapeTool(tool) {
    return D.SHAPE_TOOLS.includes(tool);
  }

  function isInkTool(tool) {
    return D.DRAW_TOOLS.includes(tool);
  }

  function isPolygonShape(object) {
    return object && D.POLYGON_SHAPES.includes(object.type);
  }

  function isTextTool(tool) {
    return D.TEXT_TOOLS.includes(tool);
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

  function isFileCard(object) {
    return object && object.type === "file";
  }

  function isSelectable(object) {
    return !(object.type === "stroke" && object.tool === "eraser") && !object.hidden;
  }

  function isLayerItem(object) {
    return !(object.type === "stroke" && object.tool === "eraser");
  }

  function isLocked(object) {
    return Boolean(object && object.locked);
  }

  function isOverlayTool(tool) {
    return tool === "laser" || tool === "measure" || tool === "protractor";
  }

  function isFrozenBlockedTool(tool) {
    return D.state.frozen && tool !== "pan" && tool !== "laser" && tool !== "select";
  }

  function actionAllowedWhenFrozen(action) {
    return (
      String(action).startsWith("zoom-") ||
      action === "toggle-grid" ||
      action === "toggle-rulers" ||
      action === "toggle-guides" ||
      action === "toggle-spotlight" ||
      action === "toggle-freeze" ||
      action === "toggle-layers" ||
      action === "open-projects" ||
      action === "close-projects" ||
      action === "fullscreen" ||
      action === "presentation-start" ||
      action === "presentation-stop"
    );
  }

  function selectedObjects() {
    return D.state.objects.filter((object) => D.state.selectedIds.includes(object.id));
  }

  function findObject(id) {
    return D.state.objects.find((object) => object.id === id);
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

  // --- Table Data Model ---

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
    if (!object || D.state.editingId) {
      return null;
    }
    const local = objectLocalPoint(object, point);
    const layout = tableLayout(object);
    const lx = local.x - object.x;
    const ly = local.y - object.y;
    const tol = D.viewLen(D.TABLE_SPLIT_HIT);
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
    if (D.state.tableRange && D.state.tableCell && D.state.tableCell.id === object.id) {
      r1 = Math.min(D.state.tableRange.r1, D.state.tableRange.r2);
      c1 = Math.min(D.state.tableRange.c1, D.state.tableRange.c2);
      r2 = Math.max(D.state.tableRange.r1, D.state.tableRange.r2);
      c2 = Math.max(D.state.tableRange.c1, D.state.tableRange.c2);
    } else if (D.state.tableCell && D.state.tableCell.id === object.id) {
      const origin = tableOrigin(object, D.state.tableCell.r, D.state.tableCell.c) || { r: 0, c: 0 };
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
      pad: D.TABLE_PAD,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
  }

  function applyStyleToTableCell(cell) {
    cell.color = D.state.stroke;
    cell.fontSize = D.state.fontSize;
    cell.fontKey = D.state.fontKey;
    cell.bold = D.state.bold;
    cell.italic = D.state.italic;
    cell.underline = D.state.underline;
    cell.strike = D.state.strike;
    cell.align = D.state.align;
    if (D.state.fill) {
      cell.fill = D.state.fill;
    }
  }

  function loadStyleFromTableCell(cell) {
    D.state.fontSize = cell.fontSize || 14;
    D.state.fontKey = cell.fontKey || "sans";
    D.state.bold = Boolean(cell.bold);
    D.state.italic = Boolean(cell.italic);
    D.state.underline = Boolean(cell.underline);
    D.state.strike = Boolean(cell.strike);
    D.state.align = cell.align || "left";
    if (cell.color) {
      D.state.stroke = cell.color;
    }
    if (cell.fill) {
      D.state.fill = cell.fill;
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

  function createTableObject(x, y, cols, rows) {
    const columnCount = Math.max(1, cols || D.TABLE_DEFAULT_COLS);
    const rowCount = Math.max(1, rows || D.TABLE_DEFAULT_ROWS);
    const width = columnCount * 110;
    const height = rowCount * 36;
    return {
      id: D.createId(),
      type: "table",
      x,
      y,
      width,
      height,
      colW: Array.from({ length: columnCount }, () => 1 / columnCount),
      rowH: Array.from({ length: rowCount }, () => 1 / rowCount),
      cells: Array.from({ length: rowCount }, () => Array.from({ length: columnCount }, createTableCell)),
      stroke: D.state.stroke,
      size: Math.max(1, Math.min(D.state.size, 4)),
      rotation: 0,
    };
  }

  // --- Image Asset Model ---

  let nextImageAssetId = 1;

  function assetSize(source) {
    return {
      width: source.naturalWidth || source.width || 1,
      height: source.naturalHeight || source.height || 1,
    };
  }

  function getImageAsset(imageId) {
    return D.imageAssets.get(imageId) || null;
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
        if (pixels > D.MAX_IMAGE_PIXELS) {
          const scale = Math.sqrt(D.MAX_IMAGE_PIXELS / pixels);
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
    D.imageAssets.set(id, { source, width: size.width, height: size.height });
    return id;
  }

  function fitImageBox(naturalWidth, naturalHeight, at) {
    const page = typeof D.currentPage === "function" ? D.currentPage() : null;
    const maxW = page ? page.width * 0.62 : 480;
    const maxH = page ? page.height * 0.62 : 480;
    const scale = Math.min(maxW / Math.max(naturalWidth, 1), maxH / Math.max(naturalHeight, 1), 1);
    const width = Math.max(D.MIN_IMAGE, naturalWidth * scale);
    const height = Math.max(D.MIN_IMAGE, naturalHeight * scale);
    const center = at || D.screenToWorld(D.viewportCenter());
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
      id: D.createId(),
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
      stroke: D.state.stroke,
      size: 0,
    };
  }

  function isImageFile(file) {
    if (!file) {
      return false;
    }
    if (file.type && D.IMAGE_TYPES.test(file.type)) {
      return true;
    }
    return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name || "");
  }

  function detectFileKind(file) {
    if (!file) {
      return "other";
    }
    if (isImageFile(file)) {
      return "image";
    }
    const name = file.name || "";
    const type = (file.type || "").toLowerCase();
    if (type === "text/csv" || type === "application/vnd.ms-excel" || /\.csv$/i.test(name)) {
      return "csv";
    }
    if (type === "application/pdf" || /\.pdf$/i.test(name)) {
      return "pdf";
    }
    if (type.includes("wordprocessingml") || /\.docx$/i.test(name)) {
      return "docx";
    }
    if (type.includes("spreadsheetml") || /\.xlsx$/i.test(name)) {
      return "xlsx";
    }
    if (type.startsWith("text/") || /\.(txt|md|markdown)$/i.test(name)) {
      return "text";
    }
    return "other";
  }

  function blobFromFile(file) {
    return isImageFile(file) ? file : null;
  }

  function fileKindLabel(kind) {
    if (kind === "pdf") {
      return "PDF document";
    }
    if (kind === "docx") {
      return "Word document";
    }
    if (kind === "xlsx") {
      return "Excel workbook";
    }
    if (kind === "csv") {
      return "CSV table";
    }
    if (kind === "text") {
      return "Text file";
    }
    return "File";
  }

  // --- Shapes, Polygons, and Geometry ---

  function makeShape(type, start, end, shift) {
    if (type === "line" || type === "arrow") {
      return {
        type,
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
        stroke: D.state.stroke,
        size: D.state.size,
        rotation: 0,
      };
    }

    const shape = {
      type,
      ...D.normalizedBounds(
        start,
        end,
        shift && (type === "ellipse" || D.POLYGON_SHAPES.includes(type))
      ),
      stroke: D.state.stroke,
      fill: D.state.fill,
      size: D.state.size,
      rotation: 0,
    };

    if (type === "roundrect") {
      shape.radius = D.ROUND_RECT_RADIUS;
    }

    return shape;
  }

  function isShapeMeaningful(shape) {
    if (shape.type === "line" || shape.type === "arrow") {
      return D.distance({ x: shape.x1, y: shape.y1 }, { x: shape.x2, y: shape.y2 }) >= D.MIN_SHAPE_SIZE;
    }

    return shape.width >= D.MIN_SHAPE_SIZE || shape.height >= D.MIN_SHAPE_SIZE;
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
        width: Math.max(maxX - minX, D.MIN_SHAPE_SIZE),
        height: Math.max(maxY - minY, D.MIN_SHAPE_SIZE),
      };
    }

    if (object.type === "line" || object.type === "arrow") {
      return {
        x: Math.min(object.x1, object.x2),
        y: Math.min(object.y1, object.y2),
        width: Math.max(Math.abs(object.x2 - object.x1), D.MIN_SHAPE_SIZE),
        height: Math.max(Math.abs(object.y2 - object.y1), D.MIN_SHAPE_SIZE),
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
      width: Math.max(bounds.width + pad * 2, D.MIN_FRAME),
      height: Math.max(bounds.height + pad * 2, D.MIN_FRAME),
    };
  }

  function getCenter(object) {
    return D.getCenterFromBounds(getLocalBounds(object));
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

  function trianglePoints(shape) {
    return [
      { x: shape.x + shape.width / 2, y: shape.y },
      { x: shape.x, y: shape.y + shape.height },
      { x: shape.x + shape.width, y: shape.y + shape.height },
    ];
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

  function handlePositions(frame, center, object) {
    const handles = {
      nw: { x: frame.x, y: frame.y },
      ne: { x: frame.x + frame.width, y: frame.y },
      sw: { x: frame.x, y: frame.y + frame.height },
      se: { x: frame.x + frame.width, y: frame.y + frame.height },
      rotate: { x: center.x, y: frame.y - D.viewLen(D.ROTATE_OFFSET) },
    };
    if (object && (isTextLike(object) || isTable(object))) {
      handles.e = { x: frame.x + frame.width, y: center.y };
      handles.w = { x: frame.x, y: center.y };
    }
    if (object && isTable(object)) {
      handles.n = { x: center.x, y: frame.y };
      handles.s = { x: center.x, y: frame.y + frame.height };
    }
    if (object && isImage(object) && D.state.cropping) {
      handles.n = { x: center.x, y: frame.y };
      handles.s = { x: center.x, y: frame.y + frame.height };
      handles.e = { x: frame.x + frame.width, y: center.y };
      handles.w = { x: frame.x, y: center.y };
    }
    return handles;
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
    ].map((point) => D.localToWorld(point, center, rotation));
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

  function objectLocalPoint(object, point) {
    const center = getCenter(object);
    const local = D.worldToLocal(point, center, object.rotation || 0);
    if (isImage(object) || (!object.flipX && !object.flipY)) {
      return local;
    }
    return {
      x: center.x + (local.x - center.x) * (object.flipX ? -1 : 1),
      y: center.y + (local.y - center.y) * (object.flipY ? -1 : 1),
    };
  }

  // --- Hit Testing ---

  function hitObjectAtLocal(object, point) {
    const tolerance = Math.max(D.viewLen(D.HIT_PADDING), (object.size || 4) / 2 + D.viewLen(3));

    if (object.type === "stroke") {
      const points = object.points;
      if (points.length === 1) {
        return D.distance(point, points[0]) <= tolerance;
      }
      for (let i = 1; i < points.length; i += 1) {
        if (D.distToSegment(point, points[i - 1], points[i]) <= tolerance) {
          return true;
        }
      }
      return false;
    }

    if (object.type === "line") {
      return D.distToSegment(point, { x: object.x1, y: object.y1 }, { x: object.x2, y: object.y2 }) <= tolerance;
    }

    if (object.type === "arrow") {
      const head = arrowHeadPoints(object);
      if (
        D.distToSegment(point, { x: object.x1, y: object.y1 }, { x: object.x2, y: object.y2 }) <=
        tolerance
      ) {
        return true;
      }
      return Boolean(head && D.pointInTriangle(point, head.tip, head.left, head.right));
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
      return Boolean(polygon && D.pointInPolygon(point, polygon));
    }

    return D.pointInBounds(point, object.x, object.y, object.width, object.height);
  }

  function hitObject(point) {
    for (let i = D.state.objects.length - 1; i >= 0; i -= 1) {
      const object = D.state.objects[i];
      if (!isSelectable(object) || object.locked) {
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
    if (D.state.selectedIds.length !== 1) {
      return null;
    }

    const object = findObject(D.state.selectedIds[0]);
    if (!object || object.locked) {
      return null;
    }

    const frame = getFrame(object);
    const bounds = getLocalBounds(object);
    const center = D.getCenterFromBounds(bounds);
    const local = D.worldToLocal(point, center, object.rotation || 0);
    const handles = handlePositions(frame, center, object);
    const order =
      isImage(object) && D.state.cropping
        ? ["nw", "ne", "sw", "se", "n", "s", "e", "w"]
        : isTable(object)
          ? ["rotate", "nw", "ne", "sw", "se", "n", "s", "e", "w"]
          : isTextLike(object)
            ? ["rotate", "nw", "ne", "sw", "se", "e", "w"]
            : ["rotate", "nw", "ne", "sw", "se"];

    for (const name of order) {
      if (handles[name] && D.distance(local, handles[name]) <= D.viewLen(D.HANDLE_HIT)) {
        return name;
      }
    }

    return null;
  }

  const exports = {
    isShapeTool,
    isInkTool,
    isPolygonShape,
    isTextTool,
    isTextLike,
    isImage,
    isLink,
    isTable,
    isFileCard,
    isSelectable,
    isLayerItem,
    isLocked,
    isOverlayTool,
    isFrozenBlockedTool,
    actionAllowedWhenFrozen,
    selectedObjects,
    findObject,
    selectedTable,
    selectedLink,
    selectedImage,
    createTableCell,
    normalizeFractions,
    tableColCount,
    tableRowCount,
    tableLayout,
    tableCellAt,
    tableOrigin,
    tableCellRect,
    hitTableCell,
    hitTableSplit,
    getTableSelection,
    tableGhost,
    applyStyleToTableCell,
    loadStyleFromTableCell,
    unmergeTableCell,
    unmergeTableIntersects,
    tableRangeToTsv,
    pasteTsvIntoTable,
    createTableObject,
    assetSize,
    getImageAsset,
    imageSourceRect,
    imageFilter,
    decodeImageBlob,
    storeImageBlob,
    fitImageBox,
    makeImageObject,
    isImageFile,
    detectFileKind,
    blobFromFile,
    fileKindLabel,
    makeShape,
    isShapeMeaningful,
    getLocalBounds,
    getFrame,
    getCenter,
    regularPolygonPoints,
    diamondPoints,
    starPoints,
    trianglePoints,
    polygonPoints,
    arrowHeadPoints,
    handlePositions,
    worldCorners,
    objectWorldBounds,
    objectLocalPoint,
    hitObjectAtLocal,
    hitObject,
    hitHandle,
  };

  Object.assign(D, exports);
  Object.assign(window, exports);
})(window.Drawora = window.Drawora || {});
