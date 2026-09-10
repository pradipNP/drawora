// js/modules/editor.js
// Drawora inline text and table editor, formatting commands, and insert actions
(function (D) {
  "use strict";

  function styleEditor(object) {
    const italic = object.italic ? "italic " : "";
    const weight = object.bold ? "700 " : "400 ";
    const size = (object.fontSize || 24) * D.state.zoom;
    const pad = textPad(object);
    const padX = (pad + textIndentWidth(object)) * D.state.zoom;
    const padY = pad * D.state.zoom;
    D.editor.style.font = `${italic}${weight}${size}px ${objectFontFamily(object)}`;
    D.editor.style.color = object.color || "#1c1917";
    D.editor.style.textAlign = object.align || "left";
    D.editor.style.padding = `${padY}px ${pad * D.state.zoom}px ${padY}px ${padX}px`;
    D.editor.style.lineHeight = String(object.lineHeight || 1.35);
    D.editor.style.letterSpacing = `${(object.letterSpacing || 0) * D.state.zoom}px`;
    D.editor.style.textDecoration = [object.underline ? "underline" : "", object.strike ? "line-through" : ""]
      .filter(Boolean)
      .join(" ") || "none";
    if (object.type === "sticky") {
      D.editor.style.background = "transparent";
    } else {
      D.editor.style.background = object.textBack || "rgb(255 255 255 / 0.94)";
    }
    D.editor.classList.toggle("is-sticky", object.type === "sticky");
    D.editor.classList.toggle("is-table-cell", Boolean(object.pad === D.TABLE_PAD));
  }

  function positionEditor(object) {
    if (isTable(object) && D.state.editingCell) {
      const rect = tableCellRect(object, D.state.editingCell.r, D.state.editingCell.c);
      const cell = tableCellAt(object, D.state.editingCell.r, D.state.editingCell.c);
      if (!rect || !cell) {
        return;
      }
      D.editor.style.left = `${rect.x * D.state.zoom + D.state.panX}px`;
      D.editor.style.top = `${rect.y * D.state.zoom + D.state.panY}px`;
      D.editor.style.width = `${rect.width * D.state.zoom}px`;
      D.editor.style.height = `${rect.height * D.state.zoom}px`;
      D.editor.style.transform = object.rotation ? `rotate(${object.rotation}rad)` : "none";
      D.editor.style.transformOrigin = "center center";
      styleEditor(tableGhost(cell, rect));
      return;
    }
    D.editor.style.left = `${object.x * D.state.zoom + D.state.panX}px`;
    D.editor.style.top = `${object.y * D.state.zoom + D.state.panY}px`;
    D.editor.style.width = `${object.width * D.state.zoom}px`;
    D.editor.style.height = `${object.height * D.state.zoom}px`;
    D.editor.style.transform = object.rotation
      ? `rotate(${object.rotation}rad)`
      : "none";
    D.editor.style.transformOrigin = "center center";
    styleEditor(object);
  }

  function hideEditor() {
    D.editor.hidden = true;
    D.editor.value = "";
    D.state.editingId = null;
    D.state.editingCell = null;
    D.editor.classList.remove("is-table-cell");
  }

  function startTableCellEdit(object, r, c) {
    if (!isTable(object) || D.state.frozen) {
      return;
    }
    const origin = tableOrigin(object, r, c);
    const cell = origin ? tableCellAt(object, origin.r, origin.c) : null;
    if (!cell || cell.covered) {
      return;
    }
    if (D.state.editingId && D.state.editingId !== object.id) {
      finishEditing();
    }
    if (!D.state.editingId) {
      captureBefore();
    }
    D.state.editingId = object.id;
    D.state.editingIsNew = false;
    D.state.editingCell = { r: origin.r, c: origin.c };
    tableSelectCell(object, origin.r, origin.c);
    loadStyleFromTableCell(cell);
    syncFormatUI();
    if (typeof syncColorUI === "function") {
      syncColorUI();
    }
    D.editor.hidden = false;
    D.editor.value = cell.text || "";
    positionEditor(object);
    redraw();
    D.editor.focus();
    D.editor.setSelectionRange(D.editor.value.length, D.editor.value.length);
  }

  function moveTableEdit(dc, dr) {
    const object = findObject(D.state.editingId);
    const cellRef = D.state.editingCell;
    if (!isTable(object) || !cellRef) {
      return;
    }
    const next = stepTableCell(object, cellRef.r, cellRef.c, dc, dr);
    finishEditing();
    tableSelectCell(object, next.r, next.c);
    startTableCellEdit(object, next.r, next.c);
  }

  function startEditing(object, isNew) {
    if (!isTextLike(object)) {
      return;
    }

    if (!isNew) {
      captureBefore();
    }

    D.state.editingId = object.id;
    D.state.editingIsNew = Boolean(isNew);
    D.editor.hidden = false;
    D.editor.value = object.text || "";
    positionEditor(object);
    redraw();
    D.editor.focus();
    D.editor.setSelectionRange(D.editor.value.length, D.editor.value.length);
  }

  function cancelEditing() {
    if (!D.state.editingId) {
      return;
    }

    hideEditor();
    D.state.editingIsNew = false;
    if (D.state.historyBefore) {
      restoreBoard(D.state.historyBefore);
      discardHistoryCapture();
    } else {
      redraw();
    }
  }

  function finishEditing() {
    if (!D.state.editingId) {
      return;
    }

    const object = findObject(D.state.editingId);
    const cellRef = D.state.editingCell;
    const text = D.editor.value;
    hideEditor();

    if (!object) {
      discardHistoryCapture();
      D.state.editingIsNew = false;
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
      D.state.editingIsNew = false;
      return;
    }

    object.text = text;
    if (isTextLike(object)) {
      reflowTextHeight(object);
    }
    if (object.type === "text" && !text.trim()) {
      if (D.state.editingIsNew && D.state.historyBefore) {
        restoreBoard(D.state.historyBefore);
        discardHistoryCapture();
        D.state.editingIsNew = false;
        return;
      }

      D.state.objects = D.state.objects.filter((item) => item.id !== object.id);
      setSelection(D.state.selectedIds.filter((id) => id !== object.id));
    }

    commitIfChanged();
    redraw();
    D.state.editingIsNew = false;
  }

  function createTextLike(type, bounds) {
    const base = {
      id: createId(),
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      text: "",
      color: D.state.stroke,
      fontSize: D.state.fontSize,
      fontKey: D.state.fontKey,
      bold: D.state.bold,
      italic: D.state.italic,
      underline: D.state.underline,
      strike: D.state.strike,
      align: D.state.align,
      lineHeight: D.state.lineHeight,
      letterSpacing: D.state.letterSpacing,
      paragraphSpacing: D.state.paragraphSpacing,
      textBack: D.state.textBack,
      list: D.state.list,
      indent: D.state.indent,
      rotation: 0,
    };

    if (type === "sticky") {
      return {
        ...base,
        type: "sticky",
        fill: D.state.fill || D.STICKY_FILL,
      };
    }

    return {
      ...base,
      type: "text",
    };
  }

  function defaultTextBounds(type, point) {
    const size = type === "sticky" ? D.STICKY_DEFAULT : D.TEXT_DEFAULT;
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
    D.state.active = {
      kind: "textbox",
      pointerId,
      textType: type,
      start: point,
      point,
    };
    queueTextboxPreview(point);
  }

  function queueTextboxPreview(point) {
    if (!D.state.active || D.state.active.kind !== "textbox") {
      return;
    }

    D.state.active.point = point;
    if (!D.state.raf) {
      D.state.raf = requestAnimationFrame(flushTextboxPreview);
    }
  }

  function flushTextboxPreview() {
    D.state.raf = 0;
    if (!D.state.active || D.state.active.kind !== "textbox") {
      return;
    }

    const bounds = normalizedBounds(D.state.active.start, D.state.active.point);
    D.state.preview = {
      type: D.state.active.textType === "sticky" ? "roundrect" : "rect",
      ...bounds,
      radius: 8,
      stroke: D.SELECT_COLOR,
      fill: D.state.active.textType === "sticky" ? D.state.fill || D.STICKY_FILL : null,
      size: 1,
      rotation: 0,
    };
    redraw();
  }

  function finishTextBox(pointerId) {
    if (!D.state.active || D.state.active.kind !== "textbox" || D.state.active.pointerId !== pointerId) {
      return;
    }

    if (D.state.raf) {
      cancelAnimationFrame(D.state.raf);
      flushTextboxPreview();
    }

    const type = D.state.active.textType;
    const start = D.state.active.start;
    const point = D.state.active.point;
    const dragged = normalizedBounds(start, point);
    D.state.preview = null;
    D.state.active = null;
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
    D.state.objects.push(object);
    setSelection([object.id]);
    startEditing(object, true);
  }

  function beginBoardText(point) {
    if (typeof finishOpenWork === "function") {
      finishOpenWork();
    }
    const page = currentPage();
    const maxWidth = page ? Math.max(D.MIN_TEXT_WIDTH, page.width - point.x - 32) : D.TEXT_DEFAULT.width;
    captureBefore();
    const object = createTextLike("text", {
      x: point.x,
      y: point.y,
      width: Math.max(D.MIN_TEXT_WIDTH, Math.min(D.TEXT_DEFAULT.width, maxWidth)),
      height: D.TEXT_DEFAULT.height,
    });
    D.state.objects.push(object);
    setSelection([object.id]);
    startEditing(object, true);
  }

  function changeIndent(delta) {
    D.state.indent = Math.min(D.MAX_INDENT, Math.max(0, (D.state.indent || 0) + delta));
    applyFormatChange();
  }

  function applyFormatCommand(format) {
    if (format === "bold") {
      D.state.bold = !D.state.bold;
    } else if (format === "italic") {
      D.state.italic = !D.state.italic;
    } else if (format === "underline") {
      D.state.underline = !D.state.underline;
    } else if (format === "strike") {
      D.state.strike = !D.state.strike;
    } else if (format.startsWith("align-")) {
      D.state.align = format.slice("align-".length);
    } else if (format === "list-bullet") {
      D.state.list = D.state.list === "bullet" ? "none" : "bullet";
    } else if (format === "list-number") {
      D.state.list = D.state.list === "number" ? "none" : "number";
    } else if (format === "indent") {
      changeIndent(1);
      return;
    } else if (format === "outdent") {
      changeIndent(-1);
      return;
    } else if (format === "text-back-none") {
      D.state.textBack = null;
    } else {
      return;
    }
    applyFormatChange();
  }

  function applyTextMetrics(commit) {
    const lineHeight = Math.min(3, Math.max(1, Number(D.lineHeightInput.value) || 1.35));
    const letterSpacing = Math.min(16, Math.max(-4, Number(D.letterSpacingInput.value) || 0));
    const paragraphSpacing = Math.min(48, Math.max(0, Number(D.paraSpacingInput.value) || 0));
    const same =
      lineHeight === D.state.lineHeight &&
      letterSpacing === D.state.letterSpacing &&
      paragraphSpacing === D.state.paragraphSpacing;
    if (same && !D.state.historyBefore) {
      return;
    }
    D.state.lineHeight = lineHeight;
    D.state.letterSpacing = letterSpacing;
    D.state.paragraphSpacing = paragraphSpacing;
    applyFormatChange(commit);
  }

  function syncFormatUI() {
    for (const button of D.toolbar.querySelectorAll("[data-format]")) {
      const format = button.dataset.format;
      let pressed = false;
      if (format === "bold") {
        pressed = D.state.bold;
      } else if (format === "italic") {
        pressed = D.state.italic;
      } else if (format === "underline") {
        pressed = D.state.underline;
      } else if (format === "strike") {
        pressed = D.state.strike;
      } else if (format === `align-${D.state.align}`) {
        pressed = true;
      } else if (format === "list-bullet") {
        pressed = D.state.list === "bullet";
      } else if (format === "list-number") {
        pressed = D.state.list === "number";
      } else if (format === "text-back-none") {
        pressed = !D.state.textBack;
      }
      if (
        format === "indent" ||
        format === "outdent"
      ) {
        continue;
      }
      button.setAttribute("aria-pressed", String(Boolean(pressed)));
    }

    if (D.fontSizeSelect && Number(D.fontSizeSelect.value) !== D.state.fontSize) {
      D.fontSizeSelect.value = D.FONT_SIZES.includes(D.state.fontSize) ? String(D.state.fontSize) : "24";
    }
    if (D.fontFamilySelect && D.fontFamilySelect.value !== D.state.fontKey) {
      D.fontFamilySelect.value = D.FONT_STACKS[D.state.fontKey] ? D.state.fontKey : "sans";
    }
    if (D.lineHeightInput && document.activeElement !== D.lineHeightInput) {
      D.lineHeightInput.value = String(D.state.lineHeight);
    }
    if (D.letterSpacingInput && document.activeElement !== D.letterSpacingInput) {
      D.letterSpacingInput.value = String(D.state.letterSpacing);
    }
    if (D.paraSpacingInput && document.activeElement !== D.paraSpacingInput) {
      D.paraSpacingInput.value = String(D.state.paragraphSpacing);
    }
    if (D.state.textBack && D.textBackInput && document.activeElement !== D.textBackInput) {
      D.textBackInput.value = D.state.textBack;
    }
  }

  function syncFormatFromSelection() {
    const selected = selectedObjects();
    if (selected.length === 1 && isTextLike(selected[0])) {
      const object = selected[0];
      D.state.fontSize = object.fontSize || 24;
      D.state.fontKey = object.fontKey || "sans";
      D.state.bold = Boolean(object.bold);
      D.state.italic = Boolean(object.italic);
      D.state.underline = Boolean(object.underline);
      D.state.strike = Boolean(object.strike);
      D.state.align = object.align || "left";
      D.state.lineHeight = object.lineHeight || 1.35;
      D.state.letterSpacing = object.letterSpacing || 0;
      D.state.paragraphSpacing = object.paragraphSpacing || 0;
      D.state.textBack = object.textBack || null;
      D.state.list = object.list || "none";
      D.state.indent = object.indent || 0;
      if (object.color) {
        D.state.stroke = object.color;
      }
      if (object.type === "sticky" && object.fill) {
        D.state.fill = object.fill;
      }
      if (typeof syncColorUI === "function") {
        syncColorUI();
      }
    } else if (selected.length === 1 && isTable(selected[0]) && D.state.tableCell) {
      const origin = tableOrigin(selected[0], D.state.tableCell.r, D.state.tableCell.c);
      const cell = origin ? tableCellAt(selected[0], origin.r, origin.c) : null;
      if (cell) {
        loadStyleFromTableCell(cell);
        if (selected[0].stroke) {
          D.state.stroke = cell.color || selected[0].stroke;
        }
        if (typeof syncColorUI === "function") {
          syncColorUI();
        }
      }
    }

    syncFormatUI();
  }

  function applyFormatChange(commit) {
    const shouldCommit = commit !== false;
    syncFormatUI();
    if (D.state.editingId) {
      const object = findObject(D.state.editingId);
      if (isTable(object) && D.state.editingCell) {
        const cell = tableCellAt(object, D.state.editingCell.r, D.state.editingCell.c);
        if (cell) {
          applyStyleToTableCell(cell);
        }
        positionEditor(object);
        redraw();
        return;
      }
      if (isTextLike(object)) {
        object.color = D.state.stroke;
        object.fontSize = D.state.fontSize;
        object.fontKey = D.state.fontKey;
        object.bold = D.state.bold;
        object.italic = D.state.italic;
        object.underline = D.state.underline;
        object.strike = D.state.strike;
        object.align = D.state.align;
        object.lineHeight = D.state.lineHeight;
        object.letterSpacing = D.state.letterSpacing;
        object.paragraphSpacing = D.state.paragraphSpacing;
        object.textBack = D.state.textBack;
        object.list = D.state.list;
        object.indent = D.state.indent;
        if (object.type === "sticky") {
          object.fill = D.state.fill || object.fill || D.STICKY_FILL;
        }
        reflowTextHeight(object);
        positionEditor(object);
        redraw();
      }
      return;
    }

    if (D.state.selectedIds.length > 0 && !D.state.active) {
      if (!D.state.historyBefore) {
        captureBefore();
      }
      applyStyleToSelected();
      redraw();
      if (shouldCommit) {
        commitIfChanged();
      }
    }
  }

  function tableSelectCell(object, r, c, range) {
    const origin = tableOrigin(object, r, c) || { r, c };
    D.state.tableCell = { id: object.id, r: origin.r, c: origin.c };
    D.state.tableRange = range || null;
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
    object.height += Math.max(D.TABLE_CELL_MIN, object.height / Math.max(1, object.cells.length - 1));
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
    object.width += Math.max(D.TABLE_CELL_MIN, object.width / Math.max(1, object.colW.length - 1));
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
    object.height = Math.max(D.TABLE_CELL_MIN * object.cells.length, object.height - D.TABLE_CELL_MIN);
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
    object.width = Math.max(D.TABLE_CELL_MIN * object.colW.length, object.width - D.TABLE_CELL_MIN);
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

  function runInsert(name) {
    if (name === "text" || name === "sticky") {
      insertTextLikeAtCenter(name);
      return;
    }
    if (D.SHAPE_TOOLS.includes(name)) {
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
      return;
    }
    if (name === "file") {
      openFilePicker();
    }
  }

  function insertTextLikeAtCenter(type) {
    const size = type === "sticky" ? D.STICKY_DEFAULT : D.TEXT_DEFAULT;
    const center = viewportWorldCenter();
    beginInsert();
    const object = createTextLike(type, {
      x: center.x - size.width / 2,
      y: center.y - size.height / 2,
      width: size.width,
      height: size.height,
    });
    D.state.objects.push(object);
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
    D.state.objects.push(object);
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
      stroke: D.state.stroke,
      fill: D.state.fill || "#ccfbf1",
      size: D.state.size,
      radius: D.ROUND_RECT_RADIUS,
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
      stroke: D.state.stroke,
      size: D.state.size,
      rotation: 0,
      groupId,
    }));
    const objects = [...boxes, ...notes, ...arrows];
    for (const item of objects) {
      D.state.objects.push(item);
    }
    finishInsert(objects.map((item) => item.id));
  }

  function insertTable() {
    const center = viewportWorldCenter();
    const width = D.TABLE_DEFAULT_COLS * 110;
    const height = D.TABLE_DEFAULT_ROWS * 36;
    beginInsert();
    const object = createTableObject(center.x - width / 2, center.y - height / 2);
    D.state.objects.push(object);
    D.state.tableCell = { id: object.id, r: 0, c: 0 };
    D.state.tableRange = null;
    finishInsert([object.id]);
  }

  function insertMathSymbol(symbol) {
    if (!symbol || D.state.frozen) {
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
    D.state.objects.push(object);
    finishInsert([object.id]);
  }

  const exports = {
    styleEditor,
    positionEditor,
    hideEditor,
    startTableCellEdit,
    moveTableEdit,
    startEditing,
    cancelEditing,
    finishEditing,
    createTextLike,
    defaultTextBounds,
    startTextBox,
    queueTextboxPreview,
    flushTextboxPreview,
    finishTextBox,
    beginBoardText,
    changeIndent,
    applyFormatCommand,
    applyTextMetrics,
    syncFormatUI,
    syncFormatFromSelection,
    applyFormatChange,
    tableSelectCell,
    runTableAction,
    tableInsertRow,
    tableInsertCol,
    tableDeleteRow,
    tableDeleteCol,
    tableMerge,
    tableSplitMerge,
    stepTableCell,
    runInsert,
    insertTextLikeAtCenter,
    insertDefaultShape,
    insertDiagram,
    insertTable,
    insertMathSymbol,
  };

  Object.assign(D, exports);
  Object.assign(window, exports);
})(window.Drawora = window.Drawora || {});
