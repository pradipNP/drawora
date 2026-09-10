// js/modules/selection.js
// Drawora selection, grouping, clipboard, layers panel, and alignment operations
(function (D) {
  "use strict";

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return fallback;
    }
    return Math.min(max, Math.max(min, number));
  }

  function syncEditUI() {
    const selectableCount = D.state.objects.filter(isSelectable).length;
    const hasSelection = D.state.selectedIds.length > 0;
    const canMutate = selectedObjects().some((object) => !object.locked);
    const units = selectionUnits();
    const info = selectionGroupInfo();

    if (D.undoBtn) D.undoBtn.disabled = D.state.past.length === 0;
    if (D.redoBtn) D.redoBtn.disabled = D.state.future.length === 0;
    if (D.deleteBtn) D.deleteBtn.disabled = !canMutate;
    if (D.copyBtn) D.copyBtn.disabled = !hasSelection;
    if (D.cutBtn) D.cutBtn.disabled = !canMutate;
    if (D.duplicateBtn) D.duplicateBtn.disabled = !hasSelection;
    if (D.pasteBtn) D.pasteBtn.disabled = D.state.clipboard.length === 0;
    if (D.selectAllBtn) D.selectAllBtn.disabled = selectableCount === 0;
    if (D.groupBtn) D.groupBtn.disabled = !info.canGroup;
    if (D.ungroupBtn) D.ungroupBtn.disabled = !info.canUngroup;

    if (D.toolbar) {
      for (const button of D.toolbar.querySelectorAll('[data-action="align"]')) {
        button.disabled = units.length < 2 || !canMutate;
      }
      for (const button of D.toolbar.querySelectorAll('[data-action="flip-h"], [data-action="flip-v"]')) {
        button.disabled = !canMutate;
      }
    }
    for (const button of document.querySelectorAll('[data-action^="order-"]')) {
      button.disabled = !hasSelection;
    }
    for (const button of document.querySelectorAll('[data-action="toggle-lock"]')) {
      button.disabled = !hasSelection;
      const allLocked = hasSelection && selectedObjects().every((o) => o.locked);
      button.setAttribute("aria-pressed", String(allLocked));
      button.title = allLocked ? "Unlock selected (Ctrl+L)" : "Lock selected (Ctrl+L)";
    }
  }

  function setSelection(ids) {
    D.state.selectedIds = ids;
    if (D.state.cropping && !selectedImage()) {
      D.state.cropping = false;
    }
    const table = ids.length === 1 ? findObject(ids[0]) : null;
    if (!isTable(table)) {
      D.state.tableCell = null;
      D.state.tableRange = null;
    } else if (!D.state.tableCell || D.state.tableCell.id !== table.id) {
      D.state.tableCell = { id: table.id, r: 0, c: 0 };
      D.state.tableRange = null;
    }
    syncEditUI();
    if (typeof syncFormatFromSelection === "function") {
      syncFormatFromSelection();
    }
    syncImageUI();
    syncLinkUI();
    syncTableUI();
    syncLayersUI();
  }

  function clearSelection() {
    if (D.state.selectedIds.length === 0) {
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
      object.width = Math.max(object.width, tableColCount(object) * D.TABLE_CELL_MIN);
      object.height = Math.max(object.height, tableRowCount(object) * D.TABLE_CELL_MIN);
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
    for (const object of D.state.objects) {
      if (object.groupId && groupIds.has(object.groupId)) {
        selected.add(object.id);
      }
    }
    return D.state.objects.filter((object) => selected.has(object.id)).map((object) => object.id);
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
        units.push(D.state.objects.filter((item) => item.groupId === object.groupId));
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
      D.state.objects.filter((object) => object.groupId === firstGroup).length === selected.length;
    return {
      canGroup: !complete,
      canUngroup: grouped.length > 0,
    };
  }

  function pruneOrphanGroups() {
    const counts = new Map();
    for (const object of D.state.objects) {
      if (!object.groupId) {
        continue;
      }
      counts.set(object.groupId, (counts.get(object.groupId) || 0) + 1);
    }
    for (const object of D.state.objects) {
      if (object.groupId && counts.get(object.groupId) < 2) {
        delete object.groupId;
      }
    }
  }

  function deleteSelected() {
    if (D.state.selectedIds.length === 0 || D.state.active) {
      return;
    }

    captureBefore();
    const ids = new Set(D.state.selectedIds);
    D.state.objects = D.state.objects.filter((object) => !ids.has(object.id) || object.locked);
    pruneOrphanGroups();
    setSelection(D.state.objects.filter((object) => ids.has(object.id)).map((object) => object.id));
    commitIfChanged();
    redraw();
  }

  function duplicateSelected() {
    if (D.state.selectedIds.length === 0 || D.state.active) {
      return;
    }

    captureBefore();
    const copies = remapClones(selectedObjects(), D.DUPLICATE_OFFSET);
    for (const copy of copies) {
      D.state.objects.push(copy);
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
    if (sel && selected.length === 1 && D.state.tableCell) {
      D.state.cellClipboard = tableRangeToTsv(sel);
      D.state.clipboardKind = "cells";
      D.state.clipboard = cloneData(selected);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(D.state.cellClipboard).catch(() => {});
      }
      syncEditUI();
      return;
    }

    D.state.clipboardKind = "objects";
    D.state.clipboard = cloneData(selected);
    syncEditUI();
  }

  function pasteClipboard() {
    if (D.state.active) {
      return;
    }

    const table = selectedTable();
    if (table && D.state.tableCell && D.state.clipboardKind === "cells" && D.state.cellClipboard) {
      captureBefore();
      pasteTsvIntoTable(table, D.state.tableCell.r, D.state.tableCell.c, D.state.cellClipboard);
      commitIfChanged();
      redraw();
      return;
    }

    if (D.state.clipboard.length === 0) {
      return;
    }

    captureBefore();
    const copies = remapClones(D.state.clipboard, D.DUPLICATE_OFFSET);
    for (const copy of copies) {
      D.state.objects.push(copy);
    }
    setSelection(copies.map((copy) => copy.id));
    commitIfChanged();
    redraw();
  }

  async function pasteAction() {
    if (D.state.active) {
      return;
    }
    if (navigator.clipboard && navigator.clipboard.read) {
      try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const type = item.types.find((name) => D.IMAGE_TYPES.test(name));
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

  function cutSelected() {
    if (D.state.selectedIds.length === 0 || D.state.active) {
      return;
    }

    copySelected();
    deleteSelected();
  }

  function selectAll() {
    if (D.state.active) {
      return;
    }

    const ids = D.state.objects.filter(isSelectable).map((object) => object.id);
    if (ids.length === 0) {
      return;
    }

    if (D.state.tool !== "select") {
      setTool("select");
    }
    setSelection(ids);
    redraw();
  }

  function groupSelected() {
    if (D.state.active || !selectionGroupInfo().canGroup) {
      return;
    }

    captureBefore();
    const groupId = createId();
    for (const object of selectedObjects()) {
      object.groupId = groupId;
    }
    setSelection(expandGroupIds(D.state.selectedIds));
    commitIfChanged();
    redraw();
  }

  function ungroupSelected() {
    if (D.state.active || !selectionGroupInfo().canUngroup) {
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

  function objectLayerLabel(object) {
    if (object.name && String(object.name).trim()) {
      return String(object.name).trim();
    }
    if (object.type === "text" || object.type === "sticky") {
      const text = String(object.text || "").replace(/\s+/g, " ").trim();
      return text.slice(0, 28) || (object.type === "sticky" ? "Sticky note" : "Text");
    }
    if (object.type === "file") {
      return object.fileName || "File";
    }
    if (object.type === "link") {
      return object.text || object.href || "Link";
    }
    if (object.type === "image") {
      return "Image";
    }
    if (object.type === "table") {
      return "Table";
    }
    if (object.type === "stroke") {
      const tool = object.tool || "pen";
      return tool.charAt(0).toUpperCase() + tool.slice(1);
    }
    const names = {
      line: "Line",
      rect: "Rectangle",
      roundrect: "Round rect",
      ellipse: "Ellipse",
      triangle: "Triangle",
      arrow: "Arrow",
      diamond: "Diamond",
      pentagon: "Pentagon",
      hexagon: "Hexagon",
      star: "Star",
    };
    return names[object.type] || "Object";
  }

  function layerPeers(object) {
    if (!object.groupId) {
      return [object];
    }
    return D.state.objects.filter((item) => item.groupId === object.groupId);
  }

  function reorderSelection(mode) {
    if (D.state.active || D.state.selectedIds.length === 0) {
      return;
    }
    const ids = new Set(expandGroupIds(D.state.selectedIds));
    const moving = D.state.objects.filter((object) => ids.has(object.id));
    const staying = D.state.objects.filter((object) => !ids.has(object.id));
    if (!moving.length || (mode !== "front" && mode !== "back" && staying.length === 0)) {
      return;
    }
    captureBefore();
    if (mode === "front") {
      D.state.objects = [...staying, ...moving];
    } else if (mode === "back") {
      D.state.objects = [...moving, ...staying];
    } else if (mode === "forward") {
      let last = -1;
      D.state.objects.forEach((object, index) => {
        if (ids.has(object.id)) {
          last = index;
        }
      });
      const next = D.state.objects[last + 1];
      if (next) {
        const insertAt = staying.indexOf(next) + 1;
        staying.splice(insertAt, 0, ...moving);
        D.state.objects = staying;
      }
    } else if (mode === "backward") {
      const first = D.state.objects.findIndex((object) => ids.has(object.id));
      const prev = first > 0 ? D.state.objects[first - 1] : null;
      if (prev) {
        staying.splice(staying.indexOf(prev), 0, ...moving);
        D.state.objects = staying;
      }
    }
    commitIfChanged();
    redraw();
  }

  function toggleObjectFlag(object, flag) {
    if (!object || D.state.frozen) {
      return;
    }
    captureBefore();
    const next = !object[flag];
    const targets = flag === "locked" ? layerPeers(object) : [object];
    for (const item of targets) {
      item[flag] = next;
    }
    if (flag === "hidden" && next) {
      const hiddenIds = new Set(targets.map((item) => item.id));
      setSelection(D.state.selectedIds.filter((id) => !hiddenIds.has(id)));
    }
    commitIfChanged();
    redraw();
  }

  function renameLayerObject(object, name) {
    if (!object || D.state.frozen) {
      return;
    }
    const trimmed = String(name || "").trim().slice(0, 80);
    if ((object.name || "") === trimmed) {
      return;
    }
    captureBefore();
    if (trimmed) {
      object.name = trimmed;
    } else {
      delete object.name;
    }
    commitIfChanged();
    syncLayersUI();
  }

  function toggleLayers() {
    D.state.showLayers = !D.state.showLayers;
    syncLayersUI();
  }

  function toggleLockSelected() {
    if (D.state.active || D.state.selectedIds.length === 0 || D.state.frozen) {
      return;
    }
    captureBefore();
    const targets = expandGroupIds(D.state.selectedIds);
    const objects = D.state.objects.filter((o) => targets.includes(o.id));
    const allLocked = objects.every((o) => o.locked);
    const nextLocked = !allLocked;
    for (const object of objects) {
      object.locked = nextLocked;
    }
    commitIfChanged();
    redraw();
  }

  function reorderLayerItem(sourceId, targetId, placeAbove) {
    if (!sourceId || !targetId || sourceId === targetId || D.state.frozen) {
      return;
    }
    const sourceObj = findObject(sourceId);
    const targetObj = findObject(targetId);
    if (!sourceObj || !targetObj) {
      return;
    }
    const movingIds = new Set(expandGroupIds([sourceId]));
    const targetGroupIds = new Set(expandGroupIds([targetId]));
    if (movingIds.has(targetId)) {
      return;
    }
    captureBefore();
    const moving = D.state.objects.filter((o) => movingIds.has(o.id));
    const staying = D.state.objects.filter((o) => !movingIds.has(o.id));
    let targetIndex = -1;
    if (placeAbove) {
      for (let i = staying.length - 1; i >= 0; i--) {
        if (targetGroupIds.has(staying[i].id)) {
          targetIndex = i + 1;
          break;
        }
      }
    } else {
      for (let i = 0; i < staying.length; i++) {
        if (targetGroupIds.has(staying[i].id)) {
          targetIndex = i;
          break;
        }
      }
    }
    if (targetIndex < 0) {
      targetIndex = staying.length;
    }
    staying.splice(targetIndex, 0, ...moving);
    D.state.objects = staying;
    commitIfChanged();
    redraw();
  }

  function objectKindIcon(object) {
    if (object.type === "text" || object.type === "sticky") {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M12 6v12M9 18h6" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>';
    }
    if (object.type === "image") {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.75"/><circle cx="8.5" cy="9.5" r="1.5" fill="none" stroke="currentColor" stroke-width="1.75"/><path d="m20 15-4.5-4.5-8.5 8.5" fill="none" stroke="currentColor" stroke-width="1.75"/></svg>';
    }
    if (object.type === "table") {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.75"/><path d="M4 10h16M4 15h16M10 5v14M16 5v14" stroke="currentColor" stroke-width="1.75"/></svg>';
    }
    if (object.type === "file") {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5h7.2L19 9.3V19a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 6 19V6A1.5 1.5 0 0 1 7 4.5Z" fill="none" stroke="currentColor" stroke-width="1.75"/><path d="M14 4.5V9h4.8" fill="none" stroke="currentColor" stroke-width="1.75"/></svg>';
    }
    if (object.type === "link") {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>';
    }
    if (object.type === "stroke") {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17.5 14.5 6l3.5 3.5L6.5 21H3v-3.5Z" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.75"/></svg>';
  }

  function syncLayersUI() {
    if (D.layersPanel) {
      D.layersPanel.hidden = !D.state.showLayers;
    }
    for (const button of document.querySelectorAll('[data-action="toggle-layers"]')) {
      button.setAttribute("aria-pressed", String(D.state.showLayers));
    }
    const hasSelection = D.state.selectedIds.length > 0;
    for (const button of document.querySelectorAll('[data-action^="order-"]')) {
      button.disabled = !hasSelection;
    }
    for (const button of document.querySelectorAll('[data-action="toggle-lock"]')) {
      button.disabled = !hasSelection;
      const allLocked = hasSelection && selectedObjects().every((o) => o.locked);
      button.setAttribute("aria-pressed", String(allLocked));
      button.title = allLocked ? "Unlock selected (Ctrl+L)" : "Lock selected (Ctrl+L)";
    }
    if (!D.state.showLayers || !D.layersList) {
      return;
    }
    if (document.activeElement && document.activeElement.classList.contains("layer-label-input")) {
      return;
    }
    const items = D.state.objects.filter(isLayerItem).slice().reverse();
    if (D.layersEmpty) {
      D.layersEmpty.hidden = items.length > 0;
    }
    D.layersList.replaceChildren();
    const selected = new Set(D.state.selectedIds);
    for (const object of items) {
      const row = document.createElement("li");
      row.className = "layer-row";
      row.dataset.id = object.id;
      row.draggable = true;
      if (selected.has(object.id)) {
        row.classList.add("is-selected");
      }
      if (object.groupId) {
        row.classList.add("is-grouped");
      }
      if (object.hidden) {
        row.classList.add("is-hidden");
      }
      if (object.locked) {
        row.classList.add("is-locked");
      }

      const vis = document.createElement("button");
      vis.type = "button";
      vis.className = "layer-icon";
      vis.dataset.layerVis = object.id;
      vis.title = object.hidden ? "Show object" : "Hide object";
      vis.innerHTML = object.hidden
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12s3.5-6 8-6 8 6 8 6-3.5 6-8 6-8-6-8-6Z" fill="none" stroke="currentColor" stroke-width="1.75"/><path d="m5 5 14 14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12s3.6-6.5 8.5-6.5S20.5 12 20.5 12 16.9 18.5 12 18.5 3.5 12 3.5 12Z" fill="none" stroke="currentColor" stroke-width="1.75"/><circle cx="12" cy="12" r="2.4" fill="none" stroke="currentColor" stroke-width="1.75"/></svg>';

      const lock = document.createElement("button");
      lock.type = "button";
      lock.className = "layer-icon";
      if (object.locked) {
        lock.classList.add("is-locked");
      }
      lock.dataset.layerLock = object.id;
      lock.title = object.locked ? "Unlock object" : "Lock object";
      lock.innerHTML = object.locked
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 11V8.5A4 4 0 0 1 16 8.5V11M8.5 11h7v8h-7V11Z" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 11V8.2A4 4 0 0 1 16 8.8M8.5 11h7v8h-7V11Z" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/></svg>';

      const kindSpan = document.createElement("span");
      kindSpan.className = "layer-kind";
      kindSpan.innerHTML = objectKindIcon(object);
      kindSpan.title = object.type;

      const label = document.createElement("button");
      label.type = "button";
      label.className = "layer-label";
      label.textContent = objectLayerLabel(object);
      label.title = `${label.textContent} (Double-click to rename)`;

      row.append(vis, lock, kindSpan, label);
      D.layersList.append(row);
    }
  }

  function beginLayerRename(object, label) {
    const input = document.createElement("input");
    input.className = "layer-label-input";
    input.value = object.name || objectLayerLabel(object);
    input.setAttribute("aria-label", "Rename object");
    label.replaceWith(input);
    input.focus();
    input.select();
    const finish = (save) => {
      input.removeEventListener("blur", onBlur);
      if (save) {
        renameLayerObject(object, input.value);
      } else {
        syncLayersUI();
      }
    };
    const onBlur = () => finish(true);
    input.addEventListener("blur", onBlur);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        finish(true);
      } else if (event.key === "Escape") {
        event.preventDefault();
        finish(false);
      }
    });
  }

  function alignSelected(edge) {
    const units = selectionUnits();
    if (D.state.active || units.length < 2) {
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
        object.color = D.state.stroke;
        object.size = D.state.size;
        continue;
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
        continue;
      }

      if (isImage(object)) {
        object.stroke = D.state.stroke;
        if (fromSize) {
          object.size = D.state.size;
        }
        continue;
      }

      if (isLink(object)) {
        object.color = D.state.stroke;
        object.fontSize = D.state.fontSize;
        object.fontKey = D.state.fontKey;
        object.bold = D.state.bold;
        object.italic = D.state.italic;
        object.textBack = D.state.textBack;
        const size = measureLinkBox(object);
        object.width = Math.max(object.width, size.width);
        object.height = Math.max(object.height, size.height);
        continue;
      }

      if (isTable(object)) {
        object.stroke = D.state.stroke;
        object.size = D.state.size;
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

      object.stroke = D.state.stroke;
      object.size = D.state.size;
      if (object.type !== "line" && object.type !== "arrow") {
        object.fill = D.state.fill;
      }
    }
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

  function syncImageUI() {
    const image = selectedImage();
    const enabled = Boolean(image);
    if (D.toolbar) {
      for (const button of D.toolbar.querySelectorAll('[data-action="image-crop"]')) {
        button.disabled = !enabled;
        button.setAttribute("aria-pressed", String(Boolean(enabled && D.state.cropping)));
      }
    }
    if (D.imageFlipHBtn) D.imageFlipHBtn.disabled = !enabled;
    if (D.imageFlipVBtn) D.imageFlipVBtn.disabled = !enabled;
    if (D.imageShadowBtn) {
      D.imageShadowBtn.disabled = !enabled;
      D.imageShadowBtn.setAttribute("aria-pressed", String(Boolean(image && image.shadow)));
    }
    if (D.imageGrayBtn) {
      D.imageGrayBtn.disabled = !enabled;
      D.imageGrayBtn.setAttribute("aria-pressed", String(Boolean(image && image.grayscale)));
    }
    if (D.imageOpacityInput) D.imageOpacityInput.disabled = !enabled;
    if (D.imageRadiusInput) D.imageRadiusInput.disabled = !enabled;
    if (D.imageBrightnessInput) D.imageBrightnessInput.disabled = !enabled;
    if (D.imageContrastInput) D.imageContrastInput.disabled = !enabled;
    if (D.imageSaturationInput) D.imageSaturationInput.disabled = !enabled;
    if (D.imageBlurInput) D.imageBlurInput.disabled = !enabled;

    if (!image) {
      return;
    }
    if (D.imageOpacityInput && document.activeElement !== D.imageOpacityInput) {
      D.imageOpacityInput.value = String(Math.round((image.opacity == null ? 1 : image.opacity) * 100));
    }
    if (D.imageRadiusInput && document.activeElement !== D.imageRadiusInput) {
      D.imageRadiusInput.value = String(image.radius || 0);
    }
    if (D.imageBrightnessInput && document.activeElement !== D.imageBrightnessInput) {
      D.imageBrightnessInput.value = String(image.brightness || 0);
    }
    if (D.imageContrastInput && document.activeElement !== D.imageContrastInput) {
      D.imageContrastInput.value = String(image.contrast || 0);
    }
    if (D.imageSaturationInput && document.activeElement !== D.imageSaturationInput) {
      D.imageSaturationInput.value = String(image.saturation || 0);
    }
    if (D.imageBlurInput && document.activeElement !== D.imageBlurInput) {
      D.imageBlurInput.value = String(image.blur || 0);
    }
  }

  function applyImageFields(commit) {
    const image = selectedImage();
    if (!image) {
      return;
    }
    if (!D.state.historyBefore) {
      captureBefore();
    }
    if (D.imageOpacityInput) image.opacity = clampNumber(D.imageOpacityInput.value, 0, 100, 100) / 100;
    if (D.imageRadiusInput) image.radius = clampNumber(D.imageRadiusInput.value, 0, 240, 0);
    if (D.imageBrightnessInput) image.brightness = clampNumber(D.imageBrightnessInput.value, -100, 100, 0);
    if (D.imageContrastInput) image.contrast = clampNumber(D.imageContrastInput.value, -100, 100, 0);
    if (D.imageSaturationInput) image.saturation = clampNumber(D.imageSaturationInput.value, -100, 100, 0);
    if (D.imageBlurInput) image.blur = clampNumber(D.imageBlurInput.value, 0, 40, 0);
    redraw();
    if (commit) {
      commitIfChanged();
    }
  }

  function syncLinkUI() {
    if (D.linkOpenBtn) {
      D.linkOpenBtn.disabled = !selectedLink();
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
    if (on && D.state.tableCell) {
      const origin = tableOrigin(table, D.state.tableCell.r, D.state.tableCell.c);
      const cell = origin ? tableCellAt(table, origin.r, origin.c) : null;
      canUnmerge = Boolean(cell && ((cell.colspan || 1) > 1 || (cell.rowspan || 1) > 1));
    }
    if (D.toolbar) {
      for (const button of D.toolbar.querySelectorAll("[data-action^='table-']")) {
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
  }

  const exports = {
    clampNumber,
    syncEditUI,
    setSelection,
    clearSelection,
    translateObject,
    applyScaledBounds,
    remapClones,
    expandGroupIds,
    selectionUnits,
    selectionGroupInfo,
    pruneOrphanGroups,
    deleteSelected,
    duplicateSelected,
    copySelected,
    pasteClipboard,
    pasteAction,
    cutSelected,
    selectAll,
    groupSelected,
    ungroupSelected,
    objectLayerLabel,
    layerPeers,
    reorderSelection,
    toggleObjectFlag,
    renameLayerObject,
    toggleLayers,
    toggleLockSelected,
    reorderLayerItem,
    objectKindIcon,
    syncLayersUI,
    beginLayerRename,
    alignSelected,
    applyStyleToSelected,
    flipSelected,
    syncImageUI,
    applyImageFields,
    syncLinkUI,
    syncTableUI,
  };

  Object.assign(D, exports);
  Object.assign(window, exports);
})(window.Drawora = window.Drawora || {});
