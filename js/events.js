// js/events.js
// Drawora event handlers and listener registrations
(function (D) {
  "use strict";

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

  function onToolbarClick(event) {
    if (isViewer()) {
      const allowedViewerActions = [
        "zoom-in", "zoom-out", "zoom-reset", "zoom-fit", "zoom-selection",
        "fullscreen", "presentation-start", "presentation-stop", "link-open",
        "open-projects", "open-collab", "export-dialog"
      ];
      const toolButton = event.target.closest("[data-tool]");
      if (toolButton && D.toolbar.contains(toolButton)) {
        const t = toolButton.dataset.tool;
        if (t === "pan" || t === "laser" || t === "measure" || t === "protractor") {
          setTool(t);
        }
        return;
      }
      const actionBtn = event.target.closest("[data-action]");
      if (actionBtn && D.toolbar.contains(actionBtn)) {
        const act = actionBtn.dataset.action;
        if (!allowedViewerActions.includes(act) && !act.startsWith("help-")) {
          return;
        }
      } else {
        const more = event.target.closest(".ribbon-more");
        if (more && D.toolbar.contains(more)) {
          toggleRibbonMenu(more);
        }
        return;
      }
    }

    const more = event.target.closest(".ribbon-more");
    if (more && D.toolbar.contains(more)) {
      toggleRibbonMenu(more);
      return;
    }

    const formatButton = event.target.closest("[data-format]");
    if (formatButton && D.toolbar.contains(formatButton) && !formatButton.disabled) {
      if (D.state.frozen) {
        return;
      }
      applyFormatCommand(formatButton.dataset.format);
      return;
    }

    const insertButton = event.target.closest("[data-insert]");
    if (insertButton && D.toolbar.contains(insertButton) && !insertButton.disabled) {
      if (D.state.frozen) {
        return;
      }
      if (insertButton.dataset.insert === "math") {
        insertMathSymbol(insertButton.dataset.math);
        return;
      }
      runInsert(insertButton.dataset.insert);
      return;
    }

    const toolButton = event.target.closest("[data-tool]");
    if (toolButton && D.toolbar.contains(toolButton) && !toolButton.disabled) {
      setTool(toolButton.dataset.tool);
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (actionButton && D.toolbar.contains(actionButton) && !actionButton.disabled) {
      const action = actionButton.dataset.action;
      if (D.state.frozen && !actionAllowedWhenFrozen(action)) {
        return;
      }
      if (action === "copy") {
        copySelected();
      } else if (action === "paste") {
        pasteAction();
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
        zoomBy(D.ZOOM_STEP);
      } else if (action === "zoom-out") {
        zoomBy(1 / D.ZOOM_STEP);
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
      } else if (action === "image-insert") {
        openImagePicker();
      } else if (action === "link-open") {
        openSelectedLink();
      } else if (action === "image-crop") {
        toggleImageCrop();
      } else if (action === "image-flip-h") {
        toggleImageFlag("flipX");
      } else if (action === "image-flip-v") {
        toggleImageFlag("flipY");
      } else if (action === "image-shadow") {
        toggleImageFlag("shadow");
      } else if (action === "image-grayscale") {
        toggleImageFlag("grayscale");
      } else if (action === "flip-h") {
        flipSelected("h");
      } else if (action === "flip-v") {
        flipSelected("v");
      } else if (action === "toggle-grid") {
        toggleFlag("showGrid");
      } else if (action === "toggle-rulers") {
        toggleFlag("showRulers");
      } else if (action === "toggle-guides") {
        toggleFlag("showGuides");
      } else if (action === "toggle-spotlight") {
        toggleFlag("spotlight");
      } else if (action === "toggle-freeze") {
        toggleFlag("frozen");
      } else if (action === "fullscreen") {
        toggleFullscreen();
      } else if (action === "clear-board") {
        requestClearBoard();
      } else if (action === "toggle-layers") {
        toggleLayers();
      } else if (action === "toggle-lock") {
        toggleLockSelected();
      } else if (action === "order-front") {
        reorderSelection("front");
      } else if (action === "order-back") {
        reorderSelection("back");
      } else if (action === "order-forward") {
        reorderSelection("forward");
      } else if (action === "order-backward") {
        reorderSelection("backward");
      } else if (action === "board-new") {
        createNewBoard();
      } else if (action === "open-projects") {
        openProjectsDialog();
      } else if (action === "close-projects") {
        closeProjectsDialog();
      } else if (action === "board-duplicate") {
        duplicateBoard();
      } else if (action === "presentation-start") {
        startPresentation();
      } else if (action === "presentation-stop") {
        stopPresentation();
      } else if (action === "export-dialog") {
        openExportDialog(actionButton.dataset.exportType || "png");
      } else if (action === "open-shortcuts") {
        openShortcutsDialog("keys");
      } else if (action === "open-about") {
        openShortcutsDialog("about");
      } else if (action === "import-project") {
        if (D.projectFileInput) D.projectFileInput.click();
      } else if (action.startsWith("table-")) {
        runTableAction(action);
      }
      return;
    }

    const presetButton = event.target.closest("[data-page-preset]");
    if (presetButton && D.toolbar.contains(presetButton) && !presetButton.disabled) {
      setPagePreset(presetButton.dataset.pagePreset);
      return;
    }

    const orientationButton = event.target.closest("[data-page-orientation]");
    if (orientationButton && D.toolbar.contains(orientationButton) && !orientationButton.disabled) {
      setPageOrientation(orientationButton.dataset.pageOrientation);
      return;
    }

    const modeButton = event.target.closest("[data-page-mode]");
    if (modeButton && D.toolbar.contains(modeButton) && !modeButton.disabled) {
      setPageMode(modeButton.dataset.pageMode);
      return;
    }

    const templateButton = event.target.closest("[data-page-template]");
    if (templateButton && D.toolbar.contains(templateButton) && !templateButton.disabled) {
      setPageTemplate(templateButton.dataset.pageTemplate);
      return;
    }

    const targetButton = event.target.closest("[data-color-target]");
    if (targetButton && D.toolbar.contains(targetButton)) {
      setColorTarget(targetButton.dataset.colorTarget);
      return;
    }

    const swatch = event.target.closest(".swatch[data-color]");
    if (swatch && D.toolbar.contains(swatch)) {
      setColor(swatch.dataset.color);
    }
  }

  function refreshShapeShift(shift) {
    if (!D.state.active || D.state.active.kind !== "shape" || !D.state.active.point) {
      return;
    }
    queueShapePreview(D.state.active.point, shift);
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
      D.state.bold = !D.state.bold;
      applyFormatChange();
      return true;
    }

    if (ctrl && event.key.toLowerCase() === "i") {
      event.preventDefault();
      D.state.italic = !D.state.italic;
      applyFormatChange();
      return true;
    }

    if (ctrl && event.key.toLowerCase() === "u") {
      event.preventDefault();
      D.state.underline = !D.state.underline;
      applyFormatChange();
      return true;
    }

    if (event.key === "Tab") {
      const object = findObject(D.state.editingId);
      if (isTable(object) && D.state.editingCell) {
        event.preventDefault();
        moveTableEdit(event.shiftKey ? -1 : 1, 0);
        return true;
      }
      event.preventDefault();
      changeIndent(event.shiftKey ? -1 : 1);
      return true;
    }

    if (event.key === "Enter" && !ctrl && !event.shiftKey) {
      const object = findObject(D.state.editingId);
      if (isTable(object) && D.state.editingCell) {
        event.preventDefault();
        moveTableEdit(0, 1);
        return true;
      }
    }

    return false;
  }

  function onKeyDown(event) {
    if (D.state.presentationScreen) {
      if (
        event.key === "Escape" ||
        event.key.toLowerCase() === "b" ||
        event.key.toLowerCase() === "w" ||
        event.key === " " ||
        event.key === "Enter" ||
        event.key === "." ||
        event.key === ","
      ) {
        event.preventDefault();
        setPresentationScreen(null);
        return;
      }
    }

    if (D.collabDialog && !D.collabDialog.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCollabDialog();
      } else if (event.key === "Tab") {
        handleModalTabKey(event, D.collabDialog);
      }
      return;
    }

    if (D.exportDialog && !D.exportDialog.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeExportDialog();
      } else if (event.key === "Tab") {
        handleModalTabKey(event, D.exportDialog);
      }
      return;
    }

    if (D.projectsDialog && !D.projectsDialog.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeProjectsDialog();
      } else if (event.key === "Tab") {
        handleModalTabKey(event, D.projectsDialog);
      }
      return;
    }

    if (D.confirmDialog && !D.confirmDialog.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeConfirmDialog();
      } else if (event.key === "Tab") {
        handleModalTabKey(event, D.confirmDialog);
      }
      return;
    }

    if (D.linkDialog && !D.linkDialog.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLinkDialog();
      } else if (event.key === "Tab") {
        handleModalTabKey(event, D.linkDialog);
      }
      return;
    }

    if (D.shortcutsDialog && !D.shortcutsDialog.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeShortcutsDialog();
      } else if (event.key === "Tab") {
        handleModalTabKey(event, D.shortcutsDialog);
      }
      return;
    }

    if (isTypingTarget(event.target)) {
      if (event.target === D.editor) {
        handleEditorKeys(event);
      }
      return;
    }

    if (event.key === "F1" || ((event.ctrlKey || event.metaKey) && event.key === "/")) {
      event.preventDefault();
      openShortcutsDialog("keys");
      return;
    }

    if (event.key === "F5") {
      event.preventDefault();
      togglePresentation();
      return;
    }

    if (D.state.presenting) {
      if (event.key === "Escape") {
        event.preventDefault();
        stopPresentation();
        return;
      }
      const keyLower = event.key.toLowerCase();
      if (keyLower === "b" || event.key === ".") {
        event.preventDefault();
        setPresentationScreen(D.state.presentationScreen === "black" ? null : "black");
        return;
      }
      if (keyLower === "w" || event.key === ",") {
        event.preventDefault();
        setPresentationScreen(D.state.presentationScreen === "white" ? null : "white");
        return;
      }
      if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        stepPage(1);
        fitCanvas();
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        stepPage(-1);
        fitCanvas();
        return;
      }
      if (keyLower === "r") {
        event.preventDefault();
        setTool("laser");
        return;
      }
      if (keyLower === "p") {
        event.preventDefault();
        setTool("pen");
        return;
      }
      if (keyLower === "e") {
        event.preventDefault();
        setTool("eraser");
        return;
      }
    }

    if (event.key === "Shift") {
      refreshShapeShift(true);
    }

    const ctrl = event.ctrlKey || event.metaKey;

    if (isViewer()) {
      if (ctrl) {
        const allowedCtrl =
          event.key === "=" ||
          event.key === "+" ||
          event.key === "-" ||
          event.key === "0" ||
          event.key.toLowerCase() === "o" ||
          event.key.toLowerCase() === "e";
        if (!allowedCtrl) {
          event.preventDefault();
          return;
        }
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        return;
      }
      const keyLower = event.key.toLowerCase();
      if (keyLower === "h") {
        setTool("pan");
        return;
      }
      if (keyLower === "r") {
        setTool("laser");
        return;
      }
      if (keyLower === "m") {
        setTool("measure");
        return;
      }
      if (
        keyLower === "v" ||
        keyLower === "p" ||
        keyLower === "b" ||
        keyLower === "e" ||
        keyLower === "t" ||
        keyLower === "n" ||
        keyLower === "l" ||
        keyLower === "f" ||
        keyLower === "i"
      ) {
        event.preventDefault();
        return;
      }
    }

    if (event.key === "Escape") {
      event.preventDefault();
      if (D.toolbar && [...D.toolbar.querySelectorAll(".ribbon-menu")].some((menu) => !menu.hidden)) {
        closeRibbonMenus();
        return;
      }
      if (D.state.cropping) {
        D.state.cropping = false;
        syncImageUI();
        redraw();
        return;
      }
      if (D.state.tool === "laser") {
        setTool("select");
        return;
      }
      cancelActive();
      return;
    }

    if (D.state.frozen && ctrl) {
      const zoomKey =
        event.key === "=" ||
        event.key === "+" ||
        event.key === "-" ||
        event.key === "0" ||
        event.code === "NumpadAdd" ||
        event.code === "NumpadSubtract" ||
        event.code === "Numpad0" ||
        event.key === "PageDown" ||
        event.key === "PageUp";
      if (!zoomKey) {
        event.preventDefault();
        return;
      }
    }

    if (ctrl && event.key.toLowerCase() === "b") {
      event.preventDefault();
      D.state.bold = !D.state.bold;
      applyFormatChange();
      return;
    }

    if (ctrl && event.key.toLowerCase() === "i") {
      event.preventDefault();
      D.state.italic = !D.state.italic;
      applyFormatChange();
      return;
    }

    if (ctrl && event.key.toLowerCase() === "u") {
      event.preventDefault();
      D.state.underline = !D.state.underline;
      applyFormatChange();
      return;
    }

    if (ctrl && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (D.state.frozen) {
        return;
      }
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

    if (ctrl && event.key.toLowerCase() === "o") {
      event.preventDefault();
      openProjectsDialog();
      return;
    }

    if (ctrl && event.altKey && event.key.toLowerCase() === "n") {
      event.preventDefault();
      createNewBoard();
      return;
    }

    if (ctrl && event.key.toLowerCase() === "s") {
      event.preventDefault();
      scheduleAutosave(true);
      return;
    }

    if (ctrl && event.key.toLowerCase() === "e") {
      event.preventDefault();
      openExportDialog("png");
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

    if (ctrl && event.key.toLowerCase() === "l") {
      event.preventDefault();
      toggleLockSelected();
      return;
    }

    if (ctrl && (event.key === "]" || event.key === "}")) {
      event.preventDefault();
      if (event.shiftKey) {
        reorderSelection("front");
      } else {
        reorderSelection("forward");
      }
      return;
    }

    if (ctrl && (event.key === "[" || event.key === "{")) {
      event.preventDefault();
      if (event.shiftKey) {
        reorderSelection("back");
      } else {
        reorderSelection("backward");
      }
      return;
    }

    if (
      !ctrl &&
      selectedTable() &&
      D.state.tableCell &&
      !D.state.active &&
      !D.state.frozen &&
      !(event.target instanceof Node && D.toolbar && D.toolbar.contains(event.target))
    ) {
      const table = selectedTable();
      if (event.key === "Enter") {
        event.preventDefault();
        startTableCellEdit(table, D.state.tableCell.r, D.state.tableCell.c);
        return;
      }
      if (event.key === "Tab") {
        event.preventDefault();
        const next = stepTableCell(table, D.state.tableCell.r, D.state.tableCell.c, event.shiftKey ? -1 : 1, 0);
        tableSelectCell(table, next.r, next.c);
        redraw();
        return;
      }
      const step = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
      if (step) {
        event.preventDefault();
        const next = stepTableCell(table, D.state.tableCell.r, D.state.tableCell.c, step[0], step[1]);
        tableSelectCell(table, next.r, next.c);
        redraw();
        return;
      }
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      if (D.state.frozen) {
        return;
      }
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
      D.state.spacePan = true;
      D.canvas.style.cursor = "grab";
      return;
    }

    if (ctrl && (event.key === "=" || event.key === "+" || event.code === "NumpadAdd")) {
      event.preventDefault();
      zoomBy(D.ZOOM_STEP);
      return;
    }

    if (ctrl && (event.key === "-" || event.code === "NumpadSubtract")) {
      event.preventDefault();
      zoomBy(1 / D.ZOOM_STEP);
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

    if (D.state.frozen && ctrl) {
      event.preventDefault();
      return;
    }

    if (ctrl || event.altKey) {
      return;
    }

    const tool = D.SHORTCUTS[event.key.toLowerCase()];
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
      D.state.spacePan = false;
      if (!D.state.active || D.state.active.kind !== "pan") {
        D.canvas.style.cursor = "";
      }
    }
  }

  function onPaste(event) {
    if (isTypingTarget(event.target) || D.state.editingId || D.state.frozen) {
      return;
    }
    const blob = clipboardImageBlob(event);
    if (blob) {
      event.preventDefault();
      insertImageFromBlob(blob);
      return;
    }
    const pasted = event.clipboardData && event.clipboardData.files;
    if (pasted && pasted.length) {
      event.preventDefault();
      insertImportedFiles(pasted);
      return;
    }
    if (D.state.clipboard.length) {
      event.preventDefault();
      pasteClipboard();
    }
  }

  function setDropTarget(on) {
    if (D.canvasWrap) D.canvasWrap.classList.toggle("is-drop-target", on);
  }

  function onWindowDragOver(event) {
    const types = (event.dataTransfer && event.dataTransfer.types) || [];
    if ([...types].includes("Files")) {
      event.preventDefault();
    }
  }

  function onCanvasDragOver(event) {
    const types = (event.dataTransfer && event.dataTransfer.types) || [];
    if (![...types].includes("Files")) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setDropTarget(true);
  }

  function onDrop(event) {
    const files = filesFromDataTransfer(event.dataTransfer);
    setDropTarget(false);
    if (!files.length || isTypingTarget(event.target)) {
      if (files.length) {
        event.preventDefault();
      }
      return;
    }
    event.preventDefault();
    if (D.state.frozen) {
      return;
    }
    const rect = D.canvas.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    const at = inside
      ? screenToWorld({ x: event.clientX - rect.left, y: event.clientY - rect.top })
      : undefined;
    insertImportedFiles(files, at);
  }

  function onPointerDown(event) {
    const wantsPan =
      event.button === 1 || (event.button === 0 && (D.state.spacePan || D.state.tool === "pan"));

    if (wantsPan && event.button !== 2) {
      if (D.state.active) {
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

    if (D.state.active) {
      return;
    }

    if (D.state.skipCanvasClick) {
      D.state.skipCanvasClick = false;
      return;
    }

    event.preventDefault();
    const screen = getScreenPoint(event);
    const point = getPoint(event);
    D.state.pointerWorld = point;

    if (D.state.frozen && D.state.tool !== "laser") {
      return;
    }

    if (isViewer() && D.state.tool !== "laser" && D.state.tool !== "measure" && D.state.tool !== "protractor") {
      return;
    }

    const rulerAxis = hitRulerEdge(screen);
    if (rulerAxis) {
      startGuideDrag(event.pointerId, rulerAxis, rulerAxis === "x" ? point.x : point.y, -1);
      capturePointer(event.pointerId);
      return;
    }

    const guideIndex = hitGuide(point);
    if (guideIndex >= 0 && (D.state.tool === "select" || isOverlayTool(D.state.tool))) {
      const guide = pageGuides()[guideIndex];
      startGuideDrag(event.pointerId, guide.axis, guide.pos, guideIndex);
      capturePointer(event.pointerId);
      return;
    }

    if (D.state.tool === "laser") {
      pushLaserTrail(point);
      redraw();
      return;
    }

    if (D.state.tool === "measure" || D.state.tool === "protractor") {
      startMeasure(D.state.tool, event.pointerId, point);
      capturePointer(event.pointerId);
      return;
    }

    if (D.state.tool === "select") {
      onSelectPointerDown(event, point);
      if (D.state.active) {
        capturePointer(event.pointerId);
      }
      return;
    }

    if (D.state.tool === "fill") {
      applyFillAt(point);
      return;
    }

    if (D.state.tool === "eyedropper") {
      pickColorAt(event);
      return;
    }

    if (D.state.tool === "lasso") {
      startLasso(event.pointerId, point, event.shiftKey);
      capturePointer(event.pointerId);
      return;
    }

    if (isTextTool(D.state.tool)) {
      startTextBox(event.pointerId, point, D.state.tool);
      if (D.state.active) {
        capturePointer(event.pointerId);
      }
      return;
    }

    capturePointer(event.pointerId);

    if (isShapeTool(D.state.tool) || D.state.tool === "compass") {
      startShape(event.pointerId, point, event.shiftKey);
      return;
    }

    if (isInkTool(D.state.tool)) {
      startStroke(event.pointerId, point);
    }
  }

  function onPointerMove(event) {
    const point = getPoint(event);
    D.state.pointerWorld = point;
    collabSendCursor(point);

    if (!D.state.active) {
      if (D.state.tool === "laser") {
        pushLaserTrail(point);
        redraw();
        return;
      }
      if (D.state.spotlight) {
        redraw();
      }
      updateSelectCursor(point);
      return;
    }

    if (event.pointerId !== D.state.active.pointerId) {
      return;
    }

    event.preventDefault();

    if (D.state.active.kind === "pan") {
      movePan(getScreenPoint(event));
      return;
    }

    if (D.state.active.kind === "guide") {
      moveGuide(point);
      return;
    }

    if (D.state.active.kind === "measure" || D.state.active.kind === "protractor") {
      moveMeasure(point);
      return;
    }

    if (D.state.active.kind === "transform") {
      queueSelectDrag(point, event.shiftKey);
      return;
    }

    if (D.state.active.kind === "textbox") {
      queueTextboxPreview(point);
      return;
    }

    if (D.state.active.kind === "shape") {
      queueShapePreview(point, event.shiftKey);
      return;
    }

    if (D.state.active.kind === "marquee") {
      queueMarquee(point);
      return;
    }

    if (D.state.active.kind === "lasso") {
      queueLasso(point, event.shiftKey);
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
    if (D.state.active && event.pointerId === D.state.active.pointerId) {
      endActive(event.pointerId);
      return;
    }

    releasePointer(event.pointerId);
  }

  function onPointerLeave(event) {
    if (!D.state.active || event.pointerId !== D.state.active.pointerId) {
      return;
    }

    if (D.canvas.hasPointerCapture(event.pointerId)) {
      return;
    }

    endActive(event.pointerId);
  }

  // --- Attach all event listeners ---
  if (D.toolbar) {
    D.toolbar.addEventListener("click", onToolbarClick);
    D.toolbar.addEventListener("click", (event) => {
      if (event.target.closest(".ribbon-menu") && event.target.closest("button.ribbon-btn, button.ribbon-btn-wide")) {
        closeRibbonMenus();
      }
    });
  }

  if (D.ribbonTabs) {
    D.ribbonTabs.addEventListener("click", (event) => {
      const tab = event.target.closest("[data-ribbon-tab]");
      if (tab) {
        setRibbonTab(tab.dataset.ribbonTab);
      }
    });
    D.ribbonTabs.addEventListener("keydown", onRibbonTabKey);
  }

  if (D.undoBtn) {
    D.undoBtn.addEventListener("click", () => {
      if (!D.state.frozen) undo();
    });
  }
  if (D.redoBtn) {
    D.redoBtn.addEventListener("click", () => {
      if (!D.state.frozen) redo();
    });
  }
  if (D.deleteBtn) {
    D.deleteBtn.addEventListener("click", () => {
      if (D.state.frozen) return;
      if (D.state.editingId) finishEditing();
      deleteSelected();
    });
  }

  if (D.fontSizeSelect) {
    D.fontSizeSelect.addEventListener("change", () => {
      D.state.fontSize = Number(D.fontSizeSelect.value);
      applyFormatChange();
    });
  }
  if (D.fontFamilySelect) {
    D.fontFamilySelect.addEventListener("change", () => {
      D.state.fontKey = D.fontFamilySelect.value;
      applyFormatChange();
    });
  }
  if (D.lineHeightInput) {
    D.lineHeightInput.addEventListener("input", () => applyTextMetrics(false));
    D.lineHeightInput.addEventListener("change", () => applyTextMetrics(true));
  }
  if (D.letterSpacingInput) {
    D.letterSpacingInput.addEventListener("input", () => applyTextMetrics(false));
    D.letterSpacingInput.addEventListener("change", () => applyTextMetrics(true));
  }
  if (D.paraSpacingInput) {
    D.paraSpacingInput.addEventListener("input", () => applyTextMetrics(false));
    D.paraSpacingInput.addEventListener("change", () => applyTextMetrics(true));
  }
  if (D.textBackInput) {
    D.textBackInput.addEventListener("input", () => {
      D.state.textBack = D.textBackInput.value;
      applyFormatChange(false);
    });
    D.textBackInput.addEventListener("change", () => {
      D.state.textBack = D.textBackInput.value;
      applyFormatChange(true);
    });
  }

  if (D.editor) {
    D.editor.addEventListener("input", () => {
      const object = findObject(D.state.editingId);
      if (isTable(object) && D.state.editingCell) {
        const cell = tableCellAt(object, D.state.editingCell.r, D.state.editingCell.c);
        if (cell) {
          cell.text = D.editor.value;
        }
        return;
      }
      if (!isTextLike(object)) {
        return;
      }

      object.text = D.editor.value;
      reflowTextHeight(object);
      const nextHeight = Math.max(object.height, D.editor.scrollHeight / D.state.zoom);
      object.height = nextHeight;
      positionEditor(object);
      redraw();
    });
  }

  if (D.canvas) {
    D.canvas.addEventListener("dblclick", (event) => {
      if (event.button !== 0 || D.state.spacePan || D.state.tool === "pan" || D.state.frozen) {
        return;
      }

      const point = getPoint(event);
      const object = hitObject(point);
      if (isLink(object)) {
        openLinkDialog(object);
        return;
      }
      if (isTable(object)) {
        const cell = hitTableCell(object, objectLocalPoint(object, point));
        if (cell) {
          setSelection([object.id]);
          tableSelectCell(object, cell.r, cell.c);
          startTableCellEdit(object, cell.r, cell.c);
        }
        return;
      }
      if (isTextLike(object)) {
        startEditing(object, false);
        return;
      }
      if (object) {
        return;
      }

      beginBoardText(point);
    });

    D.canvas.addEventListener("pointerdown", onPointerDown, { passive: false });
    D.canvas.addEventListener("pointermove", onPointerMove, { passive: false });
    D.canvas.addEventListener("pointerup", onPointerUp);
    D.canvas.addEventListener("pointercancel", onPointerUp);
    D.canvas.addEventListener("pointerleave", onPointerLeave);
    D.canvas.addEventListener("lostpointercapture", onPointerUp);
    D.canvas.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
    D.canvas.addEventListener("auxclick", (event) => {
      if (event.button === 1) {
        event.preventDefault();
      }
    });
    D.canvas.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        if (D.state.active && D.state.active.kind !== "pan") {
          return;
        }
        const factor = event.deltaY > 0 ? 1 / 1.08 : 1.08;
        zoomBy(factor, getScreenPoint(event));
      },
      { passive: false }
    );
  }

  document.addEventListener(
    "pointerdown",
    (event) => {
      if (!D.state.editingId) {
        return;
      }

      const target = event.target;
      if (
        !(target instanceof Node) ||
        (D.editor && D.editor.contains(target)) ||
        (target instanceof Element &&
          (target.closest(".chrome") || target.closest(".statusbar")))
      ) {
        return;
      }

      finishEditing();
      if (
        isTextTool(D.state.tool) &&
        (event.target === D.canvas || event.target === D.canvas.parentElement)
      ) {
        D.state.skipCanvasClick = true;
      }
    },
    true
  );

  if (D.colorInput) {
    D.colorInput.addEventListener("input", () => {
      setColor(D.colorInput.value);
    });
  }
  if (D.sizeInput) {
    D.sizeInput.addEventListener("pointerdown", () => {
      if (D.state.selectedIds.length > 0 && !D.state.active) {
        captureBefore();
      }
    });
    D.sizeInput.addEventListener("input", () => {
      setSizeByIndex(Number(D.sizeInput.value), false);
    });
    D.sizeInput.addEventListener("change", () => {
      if (D.state.selectedIds.length > 0) {
        commitIfChanged();
      }
    });
  }

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  document.addEventListener("paste", onPaste);
  document.addEventListener("dragover", onWindowDragOver);
  document.addEventListener("drop", onDrop);

  if (D.canvasWrap) {
    D.canvasWrap.addEventListener("dragenter", onCanvasDragOver);
    D.canvasWrap.addEventListener("dragover", onCanvasDragOver);
    D.canvasWrap.addEventListener("dragleave", (event) => {
      if (!D.canvasWrap.contains(event.relatedTarget)) {
        setDropTarget(false);
      }
    });
  }

  if (D.imageFileInput) {
    D.imageFileInput.addEventListener("change", () => {
      const file = D.imageFileInput.files && D.imageFileInput.files[0];
      D.imageFileInput.value = "";
      if (file) {
        insertImageFromBlob(file);
      }
    });
  }
  if (D.documentFileInput) {
    D.documentFileInput.addEventListener("change", () => {
      const file = D.documentFileInput.files && D.documentFileInput.files[0];
      D.documentFileInput.value = "";
      if (file) {
        insertImportedFile(file);
      }
    });
  }

  if (D.linkForm) {
    D.linkForm.addEventListener("submit", (event) => {
      event.preventDefault();
      commitLinkDialog();
    });
  }
  if (D.linkCancel) {
    D.linkCancel.addEventListener("click", () => {
      closeLinkDialog();
    });
  }
  if (D.linkDialog) {
    D.linkDialog.addEventListener("pointerdown", (event) => {
      if (event.target === D.linkDialog) {
        closeLinkDialog();
      }
    });
  }

  if (D.confirmForm) {
    D.confirmForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const action = D.confirmCallback;
      closeConfirmDialog();
      if (action) {
        action();
      }
    });
  }
  if (D.confirmCancel) {
    D.confirmCancel.addEventListener("click", () => {
      closeConfirmDialog();
    });
  }
  if (D.confirmDialog) {
    D.confirmDialog.addEventListener("pointerdown", (event) => {
      if (event.target === D.confirmDialog) {
        closeConfirmDialog();
      }
    });
  }

  document.addEventListener("fullscreenchange", () => {
    syncTeachUI();
  });

  const imageFieldInputs = [
    D.imageOpacityInput,
    D.imageRadiusInput,
    D.imageBrightnessInput,
    D.imageContrastInput,
    D.imageSaturationInput,
    D.imageBlurInput,
  ].filter(Boolean);

  for (const input of imageFieldInputs) {
    input.addEventListener("pointerdown", () => {
      if (selectedImage() && !D.state.historyBefore) {
        captureBefore();
      }
    });
    input.addEventListener("input", () => applyImageFields(false));
    input.addEventListener("change", () => applyImageFields(true));
  }

  if (D.zoomLabel) {
    D.zoomLabel.addEventListener("click", () => resetView());
  }

  if (D.pageNameInput) {
    D.pageNameInput.addEventListener("change", () => {
      renamePage(D.pageNameInput.value);
    });
    D.pageNameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        D.pageNameInput.blur();
      }
    });
  }
  if (D.pageWidthInput) {
    D.pageWidthInput.addEventListener("input", () => applyCustomPageSize(false));
    D.pageWidthInput.addEventListener("change", () => applyCustomPageSize(true));
    D.pageWidthInput.addEventListener("blur", () => applyCustomPageSize(true));
  }
  if (D.pageHeightInput) {
    D.pageHeightInput.addEventListener("input", () => applyCustomPageSize(false));
    D.pageHeightInput.addEventListener("change", () => applyCustomPageSize(true));
    D.pageHeightInput.addEventListener("blur", () => applyCustomPageSize(true));
  }
  if (D.paperColorInput) {
    D.paperColorInput.addEventListener("input", () => applySurfaceLook(false));
    D.paperColorInput.addEventListener("change", () => applySurfaceLook(true));
  }
  if (D.lineColorInput) {
    D.lineColorInput.addEventListener("input", () => applySurfaceLook(false));
    D.lineColorInput.addEventListener("change", () => applySurfaceLook(true));
  }
  if (D.lineSpacingInput) {
    D.lineSpacingInput.addEventListener("input", () => applySurfaceLook(false));
    D.lineSpacingInput.addEventListener("change", () => applySurfaceLook(true));
    D.lineSpacingInput.addEventListener("blur", () => applySurfaceLook(true));
  }
  if (D.gridSizeInput) {
    D.gridSizeInput.addEventListener("input", () => applySurfaceLook(false));
    D.gridSizeInput.addEventListener("change", () => applySurfaceLook(true));
    D.gridSizeInput.addEventListener("blur", () => applySurfaceLook(true));
  }
  if (D.pageMarginInput) {
    D.pageMarginInput.addEventListener("input", () => applySurfaceLook(false));
    D.pageMarginInput.addEventListener("change", () => applySurfaceLook(true));
    D.pageMarginInput.addEventListener("blur", () => applySurfaceLook(true));
  }

  if (D.statusbar) {
    D.statusbar.addEventListener("click", (event) => {
      if (event.target.closest('[data-action="page-add"]')) {
        addPage();
      }
    });
  }

  if (D.pageThumbs) {
    D.pageThumbs.addEventListener("click", (event) => {
      if (D.state.pageDragMoved) {
        D.state.pageDragMoved = false;
        return;
      }
      const thumb = event.target.closest("[data-page-id]");
      if (thumb) {
        switchPage(thumb.dataset.pageId);
      }
    });
    D.pageThumbs.addEventListener("dblclick", (event) => {
      const thumb = event.target.closest("[data-page-id]");
      if (!thumb) {
        return;
      }
      switchPage(thumb.dataset.pageId);
      setRibbonTab("page");
      if (D.pageNameInput) {
        D.pageNameInput.focus();
        D.pageNameInput.select();
      }
    });
    D.pageThumbs.addEventListener("dragstart", (event) => {
      const thumb = event.target.closest("[data-page-id]");
      if (!thumb) {
        return;
      }
      D.state.pageDragId = thumb.dataset.pageId;
      D.state.pageDragMoved = false;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", thumb.dataset.pageId);
    });
    D.pageThumbs.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    });
    D.pageThumbs.addEventListener("drop", (event) => {
      event.preventDefault();
      const thumb = event.target.closest("[data-page-id]");
      const fromId = D.state.pageDragId || event.dataTransfer.getData("text/plain");
      if (thumb && fromId && fromId !== thumb.dataset.pageId) {
        D.state.pageDragMoved = true;
        reorderPage(fromId, thumb.dataset.pageId);
      }
      D.state.pageDragId = null;
    });
    D.pageThumbs.addEventListener("dragend", () => {
      D.state.pageDragId = null;
    });
  }

  if (D.layersPanel) {
    D.layersPanel.addEventListener("click", (event) => {
      const actionBtn = event.target.closest("[data-action]");
      if (actionBtn && D.layersPanel.contains(actionBtn) && !actionBtn.disabled) {
        const action = actionBtn.dataset.action;
        if (D.state.frozen && !actionAllowedWhenFrozen(action)) {
          return;
        }
        if (action === "toggle-layers") {
          toggleLayers();
        } else if (action === "toggle-lock") {
          toggleLockSelected();
        } else if (action === "order-front") {
          reorderSelection("front");
        } else if (action === "order-back") {
          reorderSelection("back");
        } else if (action === "order-forward") {
          reorderSelection("forward");
        } else if (action === "order-backward") {
          reorderSelection("backward");
        }
        return;
      }

      const visBtn = event.target.closest("[data-layer-vis]");
      if (visBtn) {
        const object = findObject(visBtn.dataset.layerVis);
        if (object) {
          toggleObjectFlag(object, "hidden");
        }
        return;
      }

      const lockBtn = event.target.closest("[data-layer-lock]");
      if (lockBtn) {
        const object = findObject(lockBtn.dataset.layerLock);
        if (object) {
          toggleObjectFlag(object, "locked");
        }
        return;
      }

      const row = event.target.closest(".layer-row");
      if (row && !event.target.closest(".layer-label-input")) {
        const id = row.dataset.id;
        const object = findObject(id);
        if (object) {
          const groupIds = expandGroupIds([object.id]);
          if (event.shiftKey || event.ctrlKey || event.metaKey) {
            const allSelected = groupIds.every((gid) => D.state.selectedIds.includes(gid));
            if (allSelected) {
              setSelection(D.state.selectedIds.filter((gid) => !groupIds.includes(gid)));
            } else {
              setSelection([...new Set([...D.state.selectedIds, ...groupIds])]);
            }
          } else {
            setSelection(groupIds);
          }
          redraw();
        }
      }
    });
  }

  if (D.layersList) {
    D.layersList.addEventListener("dblclick", (event) => {
      const label = event.target.closest(".layer-label");
      if (!label) {
        return;
      }
      const row = label.closest(".layer-row");
      if (!row) {
        return;
      }
      const object = findObject(row.dataset.id);
      if (object && !D.state.frozen) {
        beginLayerRename(object, label);
      }
    });

    D.layersList.addEventListener("dragstart", (event) => {
      const row = event.target.closest(".layer-row");
      if (!row || D.state.frozen) {
        return;
      }
      D.state.layerDragId = row.dataset.id;
      row.classList.add("is-dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", row.dataset.id);
    });

    D.layersList.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      const row = event.target.closest(".layer-row");
      if (!row || row.dataset.id === D.state.layerDragId) {
        return;
      }
      const rect = row.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (event.clientY < midY) {
        row.classList.add("drop-above");
        row.classList.remove("drop-below");
      } else {
        row.classList.add("drop-below");
        row.classList.remove("drop-above");
      }
    });

    D.layersList.addEventListener("dragleave", (event) => {
      const row = event.target.closest(".layer-row");
      if (row && (!event.relatedTarget || !row.contains(event.relatedTarget))) {
        row.classList.remove("drop-above", "drop-below");
      }
    });

    D.layersList.addEventListener("drop", (event) => {
      event.preventDefault();
      const row = event.target.closest(".layer-row");
      for (const el of D.layersList.querySelectorAll(".drop-above, .drop-below, .is-dragging")) {
        el.classList.remove("drop-above", "drop-below", "is-dragging");
      }
      const targetId = row ? row.dataset.id : null;
      const sourceId = D.state.layerDragId || event.dataTransfer.getData("text/plain");
      if (row && targetId && sourceId && targetId !== sourceId) {
        const rect = row.getBoundingClientRect();
        const placeAbove = event.clientY < rect.top + rect.height / 2;
        reorderLayerItem(sourceId, targetId, placeAbove);
      }
      D.state.layerDragId = null;
    });

    D.layersList.addEventListener("dragend", () => {
      for (const el of D.layersList.querySelectorAll(".drop-above, .drop-below, .is-dragging")) {
        el.classList.remove("drop-above", "drop-below", "is-dragging");
      }
      D.state.layerDragId = null;
    });
  }

  window.addEventListener("resize", layoutRibbonOverflow);
  if (D.toolbar) {
    const ribbonPanels = D.toolbar.querySelector(".ribbon-panels");
    if (ribbonPanels) {
      ribbonPanels.addEventListener("scroll", closeRibbonMenus, { passive: true });
      ribbonPanels.addEventListener(
        "wheel",
        (event) => {
          if (event.deltaY && !event.shiftKey && Math.abs(event.deltaY) >= Math.abs(event.deltaX)) {
            ribbonPanels.scrollLeft += event.deltaY;
            event.preventDefault();
          }
        },
        { passive: false }
      );
    }
  }

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

  if (D.boardTitleInput) {
    D.boardTitleInput.addEventListener("change", () => {
      renameBoard(D.boardTitleInput.value);
    });
    D.boardTitleInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        D.boardTitleInput.blur();
      }
    });
  }

  if (D.boardsBtn) {
    D.boardsBtn.addEventListener("click", () => {
      openProjectsDialog();
    });
  }

  if (D.projectsDialog) {
    D.projectsDialog.addEventListener("click", (event) => {
      const actionBtn = event.target.closest("[data-action]");
      if (actionBtn) {
        const action = actionBtn.dataset.action;
        if (action === "close-projects") {
          closeProjectsDialog();
          return;
        }
        if (action === "board-new") {
          createNewBoard();
          return;
        }
      }

      const projectActionBtn = event.target.closest("[data-project-action]");
      if (projectActionBtn) {
        const card = projectActionBtn.closest(".project-card");
        if (!card) return;
        const boardId = card.dataset.boardId;
        const pAction = projectActionBtn.dataset.projectAction;
        if (pAction === "open") {
          openBoard(boardId);
        } else if (pAction === "duplicate") {
          duplicateBoard(boardId);
        } else if (pAction === "delete") {
          deleteBoard(boardId);
        }
        return;
      }

      const card = event.target.closest(".project-card");
      if (card && !event.target.closest(".project-action-btn")) {
        openBoard(card.dataset.boardId);
        return;
      }

      if (event.target === D.projectsDialog) {
        closeProjectsDialog();
      }
    });
  }

  if (D.projectsSearch) {
    D.projectsSearch.addEventListener("input", () => {
      renderProjectsList();
    });
  }

  if (D.exportFormatSelect) D.exportFormatSelect.addEventListener("change", syncExportOptionsUI);
  if (D.exportScopeSelect) D.exportScopeSelect.addEventListener("change", syncExportOptionsUI);
  if (D.exportScaleSelect) D.exportScaleSelect.addEventListener("change", syncExportOptionsUI);
  if (D.exportTransparentBg) D.exportTransparentBg.addEventListener("change", syncExportOptionsUI);
  if (D.exportQualityRange) {
    D.exportQualityRange.addEventListener("input", () => {
      if (D.exportQualityVal) D.exportQualityVal.textContent = `${D.exportQualityRange.value}%`;
    });
  }

  if (D.exportDialog) {
    D.exportDialog.addEventListener("click", (event) => {
      const actionBtn = event.target.closest("[data-action]");
      if (actionBtn && actionBtn.dataset.action === "close-export") {
        closeExportDialog();
        return;
      }
      if (event.target === D.exportDialog) {
        closeExportDialog();
      }
    });
  }

  if (D.exportDownloadBtn) D.exportDownloadBtn.addEventListener("click", executeExportDownload);

  if (D.projectFileInput) {
    D.projectFileInput.addEventListener("change", (event) => {
      const file = event.target.files && event.target.files[0];
      if (file) {
        handleImportProjectFile(file);
      }
      D.projectFileInput.value = "";
    });
  }

  if (D.importProjectBtn) {
    D.importProjectBtn.addEventListener("click", () => {
      if (D.projectFileInput) D.projectFileInput.click();
    });
  }

  if (D.presenterBar) {
    D.presenterBar.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-action]");
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === "presenter-prev") {
        stepPage(-1);
        fitCanvas();
      } else if (action === "presenter-next") {
        stepPage(1);
        fitCanvas();
      } else if (action === "presenter-laser") {
        setTool("laser");
      } else if (action === "presenter-pen") {
        setTool("pen");
      } else if (action === "presenter-eraser") {
        setTool("eraser");
      } else if (action === "presenter-black") {
        setPresentationScreen(D.state.presentationScreen === "black" ? null : "black");
      } else if (action === "presenter-white") {
        setPresentationScreen(D.state.presentationScreen === "white" ? null : "white");
      } else if (action === "presenter-fit") {
        fitCanvas();
      } else if (action === "presentation-stop") {
        stopPresentation();
      }
    });
  }

  if (D.presentationCurtain) {
    D.presentationCurtain.addEventListener("click", () => {
      setPresentationScreen(null);
    });
  }

  window.addEventListener("pointermove", () => {
    if (D.state.presenting) {
      resetPresenterIdleTimer();
    }
  });

  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && D.state.presenting) {
      stopPresentation();
    }
    syncTeachUI();
  });

  if (D.collabPresenceBtn) D.collabPresenceBtn.addEventListener("click", openCollabDialog);
  if (D.shareBtn) D.shareBtn.addEventListener("click", openCollabDialog);

  if (D.helpShortcutsBtn) {
    D.helpShortcutsBtn.addEventListener("click", () => openShortcutsDialog("keys"));
  }
  if (D.helpAboutBtn) {
    D.helpAboutBtn.addEventListener("click", () => openShortcutsDialog("about"));
  }
  if (D.helpPersistentBtn) {
    D.helpPersistentBtn.addEventListener("click", () => openShortcutsDialog("keys"));
  }

  const SHORTCUTS_HINT_DISMISSED_KEY = "drawora-shortcuts-hint-dismissed";
  if (D.shortcutsHintBanner) {
    let hintDismissed = true;
    try {
      hintDismissed = localStorage.getItem(SHORTCUTS_HINT_DISMISSED_KEY) === "1";
    } catch (error) {
      console.error("Error in localStorage.getItem(SHORTCUTS_HINT_DISMISSED_KEY):", error);
    }
    if (!hintDismissed) {
      D.shortcutsHintBanner.hidden = false;
    }
    if (D.shortcutsHintDismiss) {
      D.shortcutsHintDismiss.addEventListener("click", () => {
        D.shortcutsHintBanner.hidden = true;
        try {
          localStorage.setItem(SHORTCUTS_HINT_DISMISSED_KEY, "1");
        } catch (error) {
          console.error("Error in localStorage.setItem(SHORTCUTS_HINT_DISMISSED_KEY):", error);
        }
      });
    }
  }

  if (D.shortcutsDialog) {
    D.shortcutsDialog.addEventListener("click", (event) => {
      if (event.target === D.shortcutsDialog || event.target.closest('[data-action="close-shortcuts"]')) {
        closeShortcutsDialog();
        return;
      }
      const tabBtn = event.target.closest(".shortcuts-tab-btn");
      if (tabBtn && tabBtn.dataset.tab) {
        setShortcutsTab(tabBtn.dataset.tab);
      }
    });
  }

  if (D.collabDialog) {
    D.collabDialog.addEventListener("click", (event) => {
      if (event.target === D.collabDialog || event.target.closest('[data-action="close-collab"]')) {
        closeCollabDialog();
      }
    });
  }

  if (D.collabRandomBtn) {
    D.collabRandomBtn.addEventListener("click", () => {
      if (D.collabRoomInput) {
        D.collabRoomInput.value = "room-" + Math.random().toString(36).substring(2, 7);
      }
      syncCollabUI();
    });
  }

  if (D.collabRoomInput) {
    D.collabRoomInput.addEventListener("input", syncCollabUI);
  }

  if (D.collabCopyEditorBtn) {
    D.collabCopyEditorBtn.addEventListener("click", async () => {
      const urls = getCollabShareUrls(D.collabRoomInput ? D.collabRoomInput.value || D.state.collabRoomId : D.state.collabRoomId);
      try {
        await navigator.clipboard.writeText(urls.editor);
        D.collabCopyEditorBtn.textContent = "Copied!";
        setTimeout(() => {
          D.collabCopyEditorBtn.textContent = "Copy";
        }, 2000);
      } catch {
        window.prompt("Editor Invite Link:", urls.editor);
      }
    });
  }

  if (D.collabCopyViewerBtn) {
    D.collabCopyViewerBtn.addEventListener("click", async () => {
      const urls = getCollabShareUrls(D.collabRoomInput ? D.collabRoomInput.value || D.state.collabRoomId : D.state.collabRoomId);
      try {
        await navigator.clipboard.writeText(urls.viewer);
        D.collabCopyViewerBtn.textContent = "Copied!";
        setTimeout(() => {
          D.collabCopyViewerBtn.textContent = "Copy";
        }, 2000);
      } catch {
        window.prompt("Viewer Invite Link:", urls.viewer);
      }
    });
  }

  if (D.collabSelfRole) {
    D.collabSelfRole.addEventListener("change", (event) => {
      setCollabRole(event.target.value, true);
    });
  }

  if (D.collabConnectBtn) {
    D.collabConnectBtn.addEventListener("click", () => {
      collabConnect(D.collabRoomInput ? D.collabRoomInput.value : "", D.collabSelfRole ? D.collabSelfRole.value : "editor");
    });
  }

  if (D.collabDisconnectBtn) {
    D.collabDisconnectBtn.addEventListener("click", () => {
      collabDisconnect();
    });
  }

  if (D.collabUserName) {
    D.collabUserName.addEventListener("input", () => {
      const val = D.collabUserName.value.trim() || "Presenter";
      D.state.collabUserName = val;
      try {
        localStorage.setItem(D.COLLAB_LS_NAME_KEY, val);
      } catch {}
      syncCollabUI();
      collabSend({ type: "presence-join", role: D.state.collabRole });
    });
  }

  if (D.collabColorSwatches) {
    D.collabColorSwatches.addEventListener("click", (event) => {
      const swatch = event.target.closest(".collab-swatch");
      if (swatch && swatch.dataset.color) {
        D.state.collabUserColor = swatch.dataset.color;
        try {
          localStorage.setItem(D.COLLAB_LS_COLOR_KEY, D.state.collabUserColor);
        } catch {}
        syncCollabColorUI();
        syncCollabUI();
        collabSend({ type: "presence-join", role: D.state.collabRole });
      }
    });
  }

  const exports = {
    actionAllowedWhenFrozen,
    onToolbarClick,
    refreshShapeShift,
    handleEditorKeys,
    onKeyDown,
    onKeyUp,
    onPaste,
    setDropTarget,
    onWindowDragOver,
    onCanvasDragOver,
    onDrop,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave,
  };

  Object.assign(D, exports);
  Object.assign(window, exports);
})(window.Drawora = window.Drawora || {});
