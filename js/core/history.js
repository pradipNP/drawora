/**
 * Drawora — History & Undo/Redo System
 * Manages board snapshots, undo/redo stacks, and mutation transactions.
 */
(function (D) {
  "use strict";

  function snapshotPages() {
    return D.state.pages.map((page) => ({
      id: page.id,
      name: page.name,
      preset: page.preset,
      orientation: page.orientation,
      width: page.width,
      height: page.height,
      surface: typeof D.pageSurface === "function" ? D.pageSurface(page) : page.surface,
      objects: D.cloneData(page.id === D.state.currentPageId ? D.state.objects : page.objects),
    }));
  }

  function cloneBoard() {
    return {
      pages: snapshotPages(),
      currentPageId: D.state.currentPageId,
      nextId: D.state.nextId,
      nextPageId: D.state.nextPageId,
      selectedIds: [...D.state.selectedIds],
    };
  }

  function restoreBoard(snapshot) {
    if (typeof D.rememberCamera === "function") {
      D.rememberCamera();
    }
    const cameras = new Map(
      D.state.pages.map((page) => [page.id, { zoom: page.zoom, panX: page.panX, panY: page.panY }])
    );
    cameras.set(D.state.currentPageId, { zoom: D.state.zoom, panX: D.state.panX, panY: D.state.panY });
    const guidesByPage = new Map(D.state.pages.map((page) => [page.id, D.cloneData(page.guides || [])]));

    D.state.pages = snapshot.pages.map((page) => {
      const camera = cameras.get(page.id) || { zoom: 1, panX: 0, panY: 0 };
      return {
        ...D.cloneData(page),
        zoom: camera.zoom,
        panX: camera.panX,
        panY: camera.panY,
        guides: guidesByPage.get(page.id) || D.cloneData(page.guides) || [],
      };
    });
    D.state.nextId = snapshot.nextId;
    D.state.nextPageId = snapshot.nextPageId;
    const page = D.state.pages.find((item) => item.id === snapshot.currentPageId) || D.state.pages[0];
    if (typeof D.attachPage === "function") {
      D.attachPage(page);
    }
    D.state.selectedIds = snapshot.selectedIds.filter((id) =>
      D.state.objects.some((object) => object.id === id)
    );
    if (typeof D.redraw === "function") D.redraw();
    if (typeof D.syncEditUI === "function") D.syncEditUI();
    if (typeof D.syncPageUI === "function") D.syncPageUI();
    if (typeof D.syncImageUI === "function") D.syncImageUI();
    if (typeof D.syncLinkUI === "function") D.syncLinkUI();
    if (typeof D.syncLayersUI === "function") D.syncLayersUI();
  }

  function captureBefore() {
    D.state.historyBefore = cloneBoard();
  }

  function boardsEqual(a, b) {
    return a.currentPageId === b.currentPageId && JSON.stringify(a.pages) === JSON.stringify(b.pages);
  }

  function pruneUnusedImageAssets() {
    if (D.imageAssets.size === 0) return;
    const activeAssetIds = new Set();
    for (const page of D.state.pages) {
      const list = page.id === D.state.currentPageId ? D.state.objects : page.objects || [];
      for (const obj of list) {
        if (obj && obj.assetId) activeAssetIds.add(obj.assetId);
      }
    }
    for (const snap of D.state.past) {
      if (snap && Array.isArray(snap.pages)) {
        for (const page of snap.pages) {
          for (const obj of page.objects || []) {
            if (obj && obj.assetId) activeAssetIds.add(obj.assetId);
          }
        }
      }
    }
    for (const key of D.imageAssets.keys()) {
      if (!activeAssetIds.has(key)) {
        D.imageAssets.delete(key);
      }
    }
  }

  function commitIfChanged() {
    if (!D.state.historyBefore) {
      return;
    }

    const current = cloneBoard();
    if (boardsEqual(D.state.historyBefore, current)) {
      D.state.historyBefore = null;
      return;
    }

    D.state.past.push(D.state.historyBefore);
    if (D.state.past.length > D.MAX_HISTORY) {
      D.state.past.shift();
    }
    pruneUnusedImageAssets();
    D.state.future = [];
    D.state.historyBefore = null;
    if (typeof D.syncEditUI === "function") D.syncEditUI();
    if (typeof D.syncLayersUI === "function") D.syncLayersUI();
    if (typeof D.scheduleAutosave === "function") D.scheduleAutosave();
    if (typeof D.collabBroadcastCurrentPageObjects === "function") {
      D.collabBroadcastCurrentPageObjects();
    }
  }

  function discardHistoryCapture() {
    D.state.historyBefore = null;
  }

  function undo() {
    if (D.state.editingId && typeof D.finishEditing === "function") {
      D.finishEditing();
    }

    if (D.state.active || D.state.past.length === 0) {
      return;
    }

    D.state.future.push(cloneBoard());
    restoreBoard(D.state.past.pop());
  }

  function redo() {
    if (D.state.editingId && typeof D.finishEditing === "function") {
      D.finishEditing();
    }

    if (D.state.active || D.state.future.length === 0) {
      return;
    }

    D.state.past.push(cloneBoard());
    restoreBoard(D.state.future.pop());
  }

  const exports = {
    snapshotPages,
    cloneBoard,
    restoreBoard,
    captureBefore,
    discardHistoryCapture,
    boardsEqual,
    pruneUnusedImageAssets,
    commitIfChanged,
    undo,
    redo,
  };

  Object.assign(D, exports);
  Object.assign(window, exports);
})(window.Drawora = window.Drawora || {});
