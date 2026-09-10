// js/modules/file-import.js
// Drawora file import module (CSV, DOCX, XLSX, images, placeholders)
(function (D) {
  "use strict";

  function blobFromFile(file) {
    return isImageFile(file) ? file : null;
  }

  function filesFromDataTransfer(data) {
    if (!data) {
      return [];
    }
    return [...(data.files || [])].filter((file) => file && file.size > 0);
  }

  function clipboardImageBlob(event) {
    const items = event.clipboardData && event.clipboardData.items;
    if (!items) {
      return null;
    }
    for (const item of items) {
      if (item.type && D.IMAGE_TYPES.test(item.type)) {
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

  function decodeXml(text) {
    return String(text)
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number(num)))
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
  }

  function clipImportText(text) {
    const value = String(text || "").replace(/\u0000/g, "");
    if (value.length <= D.MAX_IMPORT_TEXT) {
      return value;
    }
    return `${value.slice(0, D.MAX_IMPORT_TEXT)}\n…`;
  }

  function parseCsvText(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
    const source = String(text || "").replace(/^\uFEFF/, "");
    for (let i = 0; i < source.length; i += 1) {
      const ch = source[i];
      if (quoted) {
        if (ch === '"') {
          if (source[i + 1] === '"') {
            cell += '"';
            i += 1;
          } else {
            quoted = false;
          }
        } else {
          cell += ch;
        }
      } else if (ch === '"') {
        quoted = true;
      } else if (ch === "," || ch === "\t") {
        row.push(cell);
        cell = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && source[i + 1] === "\n") {
          i += 1;
        }
        row.push(cell);
        cell = "";
        if (row.some((part) => part.length) || rows.length) {
          rows.push(row);
        }
        row = [];
      } else {
        cell += ch;
      }
    }
    if (cell.length || row.length) {
      row.push(cell);
      rows.push(row);
    }
    return rows.filter((line) => line.some((part) => String(part).trim().length));
  }

  async function inflateRaw(bytes) {
    if (typeof DecompressionStream !== "function") {
      throw new Error("deflate unsupported");
    }
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  function zipEocdOffset(bytes) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const start = Math.max(0, bytes.length - 65557);
    for (let i = bytes.length - 22; i >= start; i -= 1) {
      if (view.getUint32(i, true) === 0x06054b50) {
        return i;
      }
    }
    return -1;
  }

  async function zipReadTexts(buffer, names) {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const eocd = zipEocdOffset(bytes);
    if (eocd < 0) {
      throw new Error("not a zip");
    }
    const count = view.getUint16(eocd + 10, true);
    let offset = view.getUint32(eocd + 16, true);
    const wanted = new Set(names);
    const out = {};
    const decoder = new TextDecoder("utf-8");
    for (let i = 0; i < count && Object.keys(out).length < wanted.size; i += 1) {
      if (view.getUint32(offset, true) !== 0x02014b50) {
        break;
      }
      const method = view.getUint16(offset + 10, true);
      const compSize = view.getUint32(offset + 20, true);
      const nameLen = view.getUint16(offset + 28, true);
      const extraLen = view.getUint16(offset + 30, true);
      const commentLen = view.getUint16(offset + 32, true);
      const localOff = view.getUint32(offset + 42, true);
      const name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLen)).replace(/\\/g, "/");
      offset += 46 + nameLen + extraLen + commentLen;
      if (!wanted.has(name)) {
        continue;
      }
      if (view.getUint32(localOff, true) !== 0x04034b50) {
        continue;
      }
      const localNameLen = view.getUint16(localOff + 26, true);
      const localExtra = view.getUint16(localOff + 28, true);
      const dataStart = localOff + 30 + localNameLen + localExtra;
      const compressed = bytes.subarray(dataStart, dataStart + compSize);
      let raw = compressed;
      if (method === 8) {
        raw = await inflateRaw(compressed);
      } else if (method !== 0) {
        continue;
      }
      out[name] = decoder.decode(raw);
    }
    return out;
  }

  function parseDocxText(xml) {
    return String(xml || "")
      .split(/<\/w:p>/i)
      .map((block) =>
        [...block.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/gi)].map((match) => decodeXml(match[1])).join("")
      )
      .join("\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function parseSharedStrings(xml) {
    return [...String(xml || "").matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/gi)].map((match) =>
      [...match[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/gi)].map((part) => decodeXml(part[1])).join("")
    );
  }

  function xlsxCellRef(ref) {
    const match = /^([A-Z]+)(\d+)$/i.exec(ref || "");
    if (!match) {
      return null;
    }
    let col = 0;
    for (const ch of match[1].toUpperCase()) {
      col = col * 26 + (ch.charCodeAt(0) - 64);
    }
    return { r: Number(match[2]) - 1, c: col - 1 };
  }

  function parseXlsxSheet(sheetXml, shared) {
    const grid = [];
    const cells = String(sheetXml || "").matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/gi);
    for (const match of cells) {
      const attrs = match[1];
      const body = match[2];
      const ref = /r="([^"]+)"/.exec(attrs);
      const pos = xlsxCellRef(ref && ref[1]);
      if (!pos || pos.r >= D.MAX_IMPORT_ROWS || pos.c >= D.MAX_IMPORT_COLS) {
        continue;
      }
      const type = (/t="([^"]+)"/.exec(attrs) || [])[1];
      const value = (/<v\b[^>]*>([\s\S]*?)<\/v>/i.exec(body) || [])[1];
      const inline = [...body.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/gi)].map((part) => decodeXml(part[1])).join("");
      let text = "";
      if (type === "s" && value != null) {
        text = shared[Number(value)] || "";
      } else if (type === "inlineStr" || inline) {
        text = inline;
      } else if (value != null) {
        text = decodeXml(value);
      }
      if (!grid[pos.r]) {
        grid[pos.r] = [];
      }
      grid[pos.r][pos.c] = text;
    }
    const rows = [];
    for (let r = 0; r < grid.length; r += 1) {
      rows.push(grid[r] ? [...grid[r]] : []);
    }
    return rows.filter((row) => row.some((cell) => String(cell || "").length));
  }

  function importAnchor(at, width, height) {
    const center = at || viewportWorldCenter();
    return {
      x: center.x - width / 2,
      y: center.y - height / 2,
      width,
      height,
    };
  }

  function createTableFromGrid(grid, x, y) {
    const rows = Math.min(D.MAX_IMPORT_ROWS, Math.max(1, grid.length));
    const cols = Math.min(
      D.MAX_IMPORT_COLS,
      Math.max(1, ...grid.map((row) => (row ? row.length : 0)), 1)
    );
    const object = createTableObject(x, y, cols, rows);
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        object.cells[r][c].text = String(grid[r] && grid[r][c] != null ? grid[r][c] : "");
        object.cells[r][c].fontSize = 12;
      }
    }
    object.width = Math.min(720, Math.max(240, cols * 88));
    object.height = Math.min(520, Math.max(72, rows * 30));
    return object;
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

  function createFileCard(file, kind, note, at) {
    const box = importAnchor(at, 300, 88);
    return {
      id: createId(),
      type: "file",
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      fileName: file && file.name ? file.name : "File",
      kind,
      label: fileKindLabel(kind),
      note: note || "",
      fill: "#f8fafc",
      stroke: D.state.stroke,
      size: 1,
      color: "#0f172a",
      rotation: 0,
    };
  }

  function placeImportedObject(object) {
    D.state.objects.push(object);
    if (isTable(object)) {
      D.state.tableCell = { id: object.id, r: 0, c: 0 };
      D.state.tableRange = null;
    }
    finishInsert([object.id]);
  }

  function beginInsert() {
    if (typeof finishOpenWork === "function") {
      finishOpenWork();
    }
    captureBefore();
  }

  function finishInsert(ids) {
    setTool("select");
    setSelection(ids);
    commitIfChanged();
    redraw();
  }

  async function insertImageFromBlob(blob, at) {
    if (!blob || (blob.type && !D.IMAGE_TYPES.test(blob.type) && !isImageFile(blob))) {
      return null;
    }

    if (typeof finishOpenWork === "function") {
      finishOpenWork();
    }
    try {
      const imageId = await storeImageBlob(blob);
      const asset = getImageAsset(imageId);
      const box = fitImageBox(asset.width, asset.height, at);
      captureBefore();
      const object = makeImageObject(imageId, box);
      D.state.objects.push(object);
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

  async function insertImportedFile(file, at) {
    if (!file || D.state.frozen) {
      return null;
    }
    if (file.size > D.MAX_IMPORT_BYTES) {
      beginInsert();
      placeImportedObject(createFileCard(file, detectFileKind(file), "File is too large to import.", at));
      return null;
    }
    const kind = detectFileKind(file);
    if (kind === "image") {
      return insertImageFromBlob(file, at);
    }
    if (kind === "text") {
      const text = clipImportText(await file.text());
      const box = importAnchor(at, 440, 48);
      beginInsert();
      const object = createTextLike("text", box);
      object.text = text || file.name || "";
      object.fontSize = 16;
      reflowTextHeight(object);
      object.height = Math.min(720, object.height);
      placeImportedObject(object);
      return object;
    }
    if (kind === "csv") {
      const grid = parseCsvText(await file.text());
      if (!grid.length) {
        beginInsert();
        placeImportedObject(createFileCard(file, "csv", "CSV had no cells to place.", at));
        return null;
      }
      const totalRows = Math.max(1, grid.length);
      const totalCols = Math.max(1, ...grid.map((row) => (row ? row.length : 0)), 1);
      const truncatedRows = totalRows > D.MAX_IMPORT_ROWS ? totalRows - D.MAX_IMPORT_ROWS : 0;
      const truncatedCols = totalCols > D.MAX_IMPORT_COLS ? totalCols - D.MAX_IMPORT_COLS : 0;
      const box = importAnchor(at, 360, 120);
      beginInsert();
      const object = createTableFromGrid(grid, box.x, box.y);
      placeImportedObject(object);
      if (truncatedRows || truncatedCols) {
        const parts = [];
        if (truncatedRows) parts.push(`${truncatedRows} row${truncatedRows === 1 ? "" : "s"}`);
        if (truncatedCols) parts.push(`${truncatedCols} column${truncatedCols === 1 ? "" : "s"}`);
        const warnBox = importAnchor(at, 300, 88);
        warnBox.y = box.y + object.height + 24;
        D.state.objects.push(
          createFileCard(file, "csv", `CSV truncated: imported first ${D.MAX_IMPORT_ROWS}x${D.MAX_IMPORT_COLS}, dropped ${parts.join(" and ")}.`, warnBox)
        );
      }
      finishInsert([object.id]);
      redraw();
      return object;
    }
    if (kind === "docx") {
      try {
        const files = await zipReadTexts(await file.arrayBuffer(), ["word/document.xml"]);
        const text = clipImportText(parseDocxText(files["word/document.xml"]));
        if (!text) {
          throw new Error("empty");
        }
        const box = importAnchor(at, 440, 48);
        beginInsert();
        const object = createTextLike("text", box);
        object.text = text;
        object.fontSize = 16;
        reflowTextHeight(object);
        object.height = Math.min(720, object.height);
        placeImportedObject(object);
        return object;
      } catch (error) {
        beginInsert();
        placeImportedObject(
          createFileCard(file, "docx", "Word preview is not available. Inserted as a placeholder.", at)
        );
        return null;
      }
    }
    if (kind === "xlsx") {
      try {
        const files = await zipReadTexts(await file.arrayBuffer(), [
          "xl/sharedStrings.xml",
          "xl/worksheets/sheet1.xml",
        ]);
        const grid = parseXlsxSheet(files["xl/worksheets/sheet1.xml"], parseSharedStrings(files["xl/sharedStrings.xml"]));
        if (!grid.length) {
          throw new Error("empty");
        }
        const box = importAnchor(at, 360, 120);
        beginInsert();
        const object = createTableFromGrid(grid, box.x, box.y);
        placeImportedObject(object);
        return object;
      } catch (error) {
        beginInsert();
        placeImportedObject(
          createFileCard(file, "xlsx", "Excel preview is not available. Inserted as a placeholder.", at)
        );
        return null;
      }
    }
    const note =
      kind === "pdf"
        ? "PDF pages are not rendered. Inserted as a placeholder."
        : "This file type is inserted as a placeholder.";
    beginInsert();
    const object = createFileCard(file, kind, note, at);
    placeImportedObject(object);
    return object;
  }

  async function insertImportedFiles(files, at) {
    const list = [...files].slice(0, 8);
    for (let i = 0; i < list.length; i += 1) {
      const offset = i
        ? { x: (at ? at.x : viewportWorldCenter().x) + i * D.DUPLICATE_OFFSET, y: (at ? at.y : viewportWorldCenter().y) + i * D.DUPLICATE_OFFSET }
        : at;
      await insertImportedFile(list[i], offset);
    }
  }

  function openFilePicker() {
    D.documentFileInput.value = "";
    D.documentFileInput.click();
  }

  const exports = {
    blobFromFile,
    filesFromDataTransfer,
    clipboardImageBlob,
    decodeXml,
    clipImportText,
    parseCsvText,
    inflateRaw,
    zipEocdOffset,
    zipReadTexts,
    parseDocxText,
    parseSharedStrings,
    xlsxCellRef,
    parseXlsxSheet,
    importAnchor,
    createTableFromGrid,
    fileKindLabel,
    createFileCard,
    placeImportedObject,
    beginInsert,
    finishInsert,
    insertImageFromBlob,
    insertImportedFile,
    insertImportedFiles,
    openFilePicker,
  };

  Object.assign(D, exports);
  Object.assign(window, exports);
})(window.Drawora = window.Drawora || {});
