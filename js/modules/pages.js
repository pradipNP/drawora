/**
 * Drawora — Page Management & Surface Templates
 * Handles page lifecycle (add, duplicate, delete, switch, reorder),
 * surface templates (grid, ruled, dark, math, presentation), and page UI syncing.
 */
(function (D) {
  "use strict";

  function nextPageName() {
    let max = 0;
    for (const page of D.state.pages) {
      const match = /^Page (\d+)$/.exec(page.name);
      if (match) {
        max = Math.max(max, Number(match[1]));
      }
    }
    return `Page ${max + 1}`;
  }

  function uniqueCopyName(name) {
    const base = `${name} copy`;
    const names = new Set(D.state.pages.map((page) => page.name));
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
    const spec = D.PAGE_TEMPLATES[template] || D.PAGE_TEMPLATES.white;
    return { ...spec };
  }

  function normalizeSurface(surface) {
    const base = defaultSurface(surface && surface.template);
    if (!surface) {
      return base;
    }
    return {
      mode: surface.mode || base.mode,
      template: D.PAGE_TEMPLATES[surface.template] ? surface.template : base.template,
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

  function makePage(options = {}) {
    const source = options.source || currentPage();
    const preset = options.preset || (source && source.preset) || "a4";
    const orientation = options.orientation || (source && source.orientation) || "portrait";
    const size = D.pageDimensions(
      preset,
      orientation,
      options.width || (source && source.width) || 794,
      options.height || (source && source.height) || 1123
    );
    return {
      id: options.id || D.createPageId(),
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
      guides: options.guides || (source && source.guides ? D.cloneData(source.guides) : []),
      zoom: options.zoom ?? 1,
      panX: options.panX ?? 0,
      panY: options.panY ?? 0,
    };
  }

  function currentPage() {
    return D.state.pages.find((page) => page.id === D.state.currentPageId) || D.state.pages[0] || null;
  }

  function currentPageIndex() {
    return D.state.pages.findIndex((page) => page.id === D.state.currentPageId);
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

  function gridStep() {
    const page = currentPage();
    return pageSurface(page).gridSize;
  }

  function snapPoint(point) {
    if (!D.state.showGrid || !point) {
      return point;
    }
    const step = gridStep();
    return {
      x: Math.round(point.x / step) * step,
      y: Math.round(point.y / step) * step,
    };
  }

  function rememberCamera() {
    const page = currentPage();
    if (!page) {
      return;
    }
    page.zoom = D.state.zoom;
    page.panX = D.state.panX;
    page.panY = D.state.panY;
  }

  function applyPageCamera(page) {
    D.state.zoom = page.zoom;
    D.state.panX = page.panX;
    D.state.panY = page.panY;
  }

  function attachPage(page) {
    D.state.currentPageId = page.id;
    D.state.objects = page.objects;
    applyPageCamera(page);
    const pageIndex = D.state.pages.indexOf(page);
    if (pageIndex >= 0) {
      D.announceA11y(`Page ${pageIndex + 1} of ${D.state.pages.length}: ${page.name}`);
    }
  }

  function finishOpenWork() {
    if (D.state.editingId && typeof D.finishEditing === "function") {
      D.finishEditing();
    }
    if (D.state.active && typeof D.cancelActive === "function") {
      D.cancelActive();
    }
  }

  function remapClones(objects, offset) {
    const groupMap = new Map();
    return objects.map((object) => {
      const copy = D.cloneData(object);
      copy.id = D.createId();
      if (copy.groupId) {
        if (!groupMap.has(copy.groupId)) {
          groupMap.set(copy.groupId, D.createId());
        }
        copy.groupId = groupMap.get(copy.groupId);
      }
      if (offset && typeof D.translateObject === "function") {
        D.translateObject(copy, offset, offset);
      }
      return copy;
    });
  }

  function syncPageUI() {
    const page = currentPage();
    if (!page) {
      return;
    }

    const index = currentPageIndex();
    if (D.pageStatus) D.pageStatus.textContent = `${page.name} (${index + 1} of ${D.state.pages.length})`;
    if (D.pageDeleteBtn) D.pageDeleteBtn.disabled = D.state.pages.length <= 1;

    if (D.pageNameInput && document.activeElement !== D.pageNameInput) {
      D.pageNameInput.value = page.name;
    }
    if (D.pageWidthInput && document.activeElement !== D.pageWidthInput) {
      D.pageWidthInput.value = String(page.width);
    }
    if (D.pageHeightInput && document.activeElement !== D.pageHeightInput) {
      D.pageHeightInput.value = String(page.height);
    }

    if (D.toolbar) {
      for (const button of D.toolbar.querySelectorAll("[data-page-preset]")) {
        button.setAttribute("aria-pressed", String(button.dataset.pagePreset === page.preset));
      }
      for (const button of D.toolbar.querySelectorAll("[data-page-orientation]")) {
        button.setAttribute("aria-pressed", String(button.dataset.pageOrientation === page.orientation));
      }

      const surface = pageSurface(page);
      page.surface = surface;
      for (const button of D.toolbar.querySelectorAll("[data-page-mode]")) {
        button.setAttribute("aria-pressed", String(button.dataset.pageMode === surface.mode));
      }
      for (const button of D.toolbar.querySelectorAll("[data-page-template]")) {
        const group = button.dataset.templateMode;
        button.hidden = surface.mode !== "custom" && group !== surface.mode;
        button.setAttribute("aria-pressed", String(button.dataset.pageTemplate === surface.template));
      }
    }

    const surface = pageSurface(page);
    if (D.paperColorInput && document.activeElement !== D.paperColorInput) {
      D.paperColorInput.value = surface.paperColor;
    }
    if (D.lineColorInput && document.activeElement !== D.lineColorInput) {
      D.lineColorInput.value = surface.lineColor;
    }
    if (D.lineSpacingInput && document.activeElement !== D.lineSpacingInput) {
      D.lineSpacingInput.value = String(surface.lineSpacing);
    }
    if (D.gridSizeInput && document.activeElement !== D.gridSizeInput) {
      D.gridSizeInput.value = String(surface.gridSize);
    }
    if (D.pageMarginInput && document.activeElement !== D.pageMarginInput) {
      D.pageMarginInput.value = String(surface.margin);
    }

    if (typeof D.renderPageThumbs === "function") D.renderPageThumbs();
    if (typeof D.layoutRibbonOverflow === "function") D.layoutRibbonOverflow();
  }

  function switchPage(id) {
    if (!id || id === D.state.currentPageId) {
      return;
    }

    const page = D.state.pages.find((item) => item.id === id);
    if (!page) {
      return;
    }

    finishOpenWork();
    rememberCamera();
    if (typeof D.clearSelection === "function") D.clearSelection();
    attachPage(page);
    if (typeof D.redraw === "function") D.redraw();
    if (typeof D.syncEditUI === "function") D.syncEditUI();
    syncPageUI();
    if (typeof D.syncViewUI === "function") D.syncViewUI();
    if (typeof D.scheduleAutosave === "function") D.scheduleAutosave();
  }

  function addPage() {
    finishOpenWork();
    D.captureBefore();
    rememberCamera();
    const page = makePage();
    const index = Math.max(currentPageIndex(), 0);
    D.state.pages.splice(index + 1, 0, page);
    if (typeof D.clearSelection === "function") D.clearSelection();
    attachPage(page);
    D.commitIfChanged();
    if (typeof D.fitCanvas === "function") D.fitCanvas();
    syncPageUI();
    if (typeof D.syncViewUI === "function") D.syncViewUI();
  }

  function duplicatePage() {
    const source = currentPage();
    if (!source) {
      return;
    }

    finishOpenWork();
    D.captureBefore();
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
    D.state.pages.splice(index + 1, 0, page);
    if (typeof D.clearSelection === "function") D.clearSelection();
    attachPage(page);
    D.commitIfChanged();
    if (typeof D.redraw === "function") D.redraw();
    syncPageUI();
    if (typeof D.syncViewUI === "function") D.syncViewUI();
  }

  function deletePage() {
    if (D.state.pages.length <= 1) {
      return;
    }

    if (!window.confirm("Delete this page? Drawings on it will be removed.")) {
      return;
    }

    finishOpenWork();
    D.captureBefore();
    const index = currentPageIndex();
    D.state.pages.splice(index, 1);
    const next = D.state.pages[Math.min(index, D.state.pages.length - 1)];
    if (typeof D.clearSelection === "function") D.clearSelection();
    attachPage(next);
    D.commitIfChanged();
    if (typeof D.redraw === "function") D.redraw();
    syncPageUI();
    if (typeof D.syncViewUI === "function") D.syncViewUI();
  }

  function renamePage(nextName) {
    const page = currentPage();
    if (!page) {
      return;
    }

    const name = nextName.trim() || page.name;
    if (name === page.name) {
      if (D.pageNameInput) D.pageNameInput.value = page.name;
      return;
    }

    D.captureBefore();
    page.name = name.slice(0, 80);
    D.commitIfChanged();
    syncPageUI();
  }

  function reorderPage(fromId, toId) {
    if (!fromId || !toId || fromId === toId) {
      return;
    }

    const fromIndex = D.state.pages.findIndex((page) => page.id === fromId);
    const toIndex = D.state.pages.findIndex((page) => page.id === toId);
    if (fromIndex < 0 || toIndex < 0) {
      return;
    }

    D.captureBefore();
    const [page] = D.state.pages.splice(fromIndex, 1);
    D.state.pages.splice(toIndex, 0, page);
    D.commitIfChanged();
    syncPageUI();
  }

  function setPagePreset(preset) {
    const page = currentPage();
    if (!page || !preset) {
      return;
    }

    D.captureBefore();
    if (preset === "custom") {
      page.preset = "custom";
    } else {
      page.preset = preset;
      const size = D.pageDimensions(preset, page.orientation);
      page.width = size.width;
      page.height = size.height;
    }
    D.commitIfChanged();
    if (typeof D.redraw === "function") D.redraw();
    syncPageUI();
  }

  function setPageOrientation(orientation) {
    const page = currentPage();
    if (!page || (orientation !== "portrait" && orientation !== "landscape")) {
      return;
    }

    D.captureBefore();
    if (page.preset === "custom") {
      if (orientation !== page.orientation) {
        const width = page.width;
        page.width = page.height;
        page.height = width;
      }
      page.orientation = orientation;
    } else {
      page.orientation = orientation;
      const size = D.pageDimensions(page.preset, orientation);
      page.width = size.width;
      page.height = size.height;
    }
    D.commitIfChanged();
    if (typeof D.redraw === "function") D.redraw();
    syncPageUI();
  }

  function setPageMode(mode) {
    const page = currentPage();
    if (!page || (mode !== "teacher" && mode !== "student" && mode !== "custom")) {
      return;
    }

    const surface = pageSurface(page);
    D.captureBefore();
    if (mode === "teacher" && !D.TEACHER_TEMPLATES.includes(surface.template)) {
      page.surface = defaultSurface("white");
    } else if (mode === "student" && !D.STUDENT_TEMPLATES.includes(surface.template)) {
      page.surface = defaultSurface("ruled");
    } else {
      page.surface = { ...surface, mode };
    }
    D.commitIfChanged();
    if (typeof D.redraw === "function") D.redraw();
    syncPageUI();
  }

  function setPageTemplate(template) {
    const page = currentPage();
    if (!page || !D.PAGE_TEMPLATES[template]) {
      return;
    }

    D.captureBefore();
    const next = defaultSurface(template);
    if (pageSurface(page).mode === "custom") {
      next.mode = "custom";
    }
    page.surface = next;
    D.commitIfChanged();
    if (typeof D.redraw === "function") D.redraw();
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
      paperColor: (D.paperColorInput && D.paperColorInput.value) || surface.paperColor,
      lineColor: (D.lineColorInput && D.lineColorInput.value) || surface.lineColor,
      lineSpacing: D.lineSpacingInput ? D.lineSpacingInput.value : surface.lineSpacing,
      gridSize: D.gridSizeInput ? D.gridSizeInput.value : surface.gridSize,
      margin: D.pageMarginInput ? D.pageMarginInput.value : surface.margin,
    });
    const same =
      next.paperColor === surface.paperColor &&
      next.lineColor === surface.lineColor &&
      next.lineSpacing === surface.lineSpacing &&
      next.gridSize === surface.gridSize &&
      next.margin === surface.margin;
    if (same && !D.state.historyBefore) {
      if (commit) {
        syncPageUI();
      }
      return;
    }

    if (!D.state.historyBefore) {
      D.captureBefore();
    }
    page.surface = next;
    if (typeof D.redraw === "function") D.redraw();
    if (commit) {
      D.commitIfChanged();
      syncPageUI();
    }
  }

  function applyCustomPageSize(commit) {
    const page = currentPage();
    if (!page) {
      return;
    }

    const width = D.clampPageSize(D.pageWidthInput ? D.pageWidthInput.value : page.width, page.width);
    const height = D.clampPageSize(D.pageHeightInput ? D.pageHeightInput.value : page.height, page.height);
    const sameSize = width === page.width && height === page.height;
    if (sameSize && !D.state.historyBefore) {
      if (commit) {
        syncPageUI();
      }
      return;
    }

    if (!D.state.historyBefore) {
      D.captureBefore();
    }

    page.preset = "custom";
    page.width = width;
    page.height = height;
    page.orientation = page.width >= page.height ? "landscape" : "portrait";
    if (typeof D.redraw === "function") D.redraw();
    if (commit) {
      D.commitIfChanged();
      syncPageUI();
    } else if (D.toolbar) {
      for (const button of D.toolbar.querySelectorAll("[data-page-preset]")) {
        button.setAttribute("aria-pressed", String(button.dataset.pagePreset === "custom"));
      }
      for (const button of D.toolbar.querySelectorAll("[data-page-orientation]")) {
        button.setAttribute("aria-pressed", String(button.dataset.pageOrientation === page.orientation));
      }
    }
  }

  function stepPage(delta) {
    const index = currentPageIndex();
    const next = D.state.pages[index + delta];
    if (next) {
      switchPage(next.id);
    }
  }

  const exports = {
    nextPageName,
    uniqueCopyName,
    defaultSurface,
    normalizeSurface,
    pageSurface,
    makePage,
    currentPage,
    currentPageIndex,
    pageGuides,
    gridStep,
    snapPoint,
    rememberCamera,
    applyPageCamera,
    attachPage,
    finishOpenWork,
    remapClones,
    syncPageUI,
    switchPage,
    addPage,
    duplicatePage,
    deletePage,
    renamePage,
    reorderPage,
    setPagePreset,
    setPageOrientation,
    setPageMode,
    setPageTemplate,
    applySurfaceLook,
    applyCustomPageSize,
    stepPage,
  };

  Object.assign(D, exports);
  Object.assign(window, exports);
})(window.Drawora = window.Drawora || {});
