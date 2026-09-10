/**
 * Drawora — Persistence & Board Management
 * IndexedDB storage with localStorage fallback, board CRUD, autosave timer,
 * project manager dialog, and PWA setup.
 */
(function (D) {
  "use strict";

  const DB_NAME = D.DB_NAME || "drawora_boards";
  const DB_VERSION = D.DB_VERSION || 1;
  const STORE_NAME = D.DB_STORE || "boards";
  const LS_FALLBACK_KEY = "drawora_boards_fallback";
  const LS_ACTIVE_BOARD_KEY = D.LS_ACTIVE_BOARD_KEY || "drawora_active_board";
  let dbInstance = null;

  async function openDraworaDb() {
    if (dbInstance) {
      return dbInstance;
    }
    if (!window.indexedDB) {
      return null;
    }
    return new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: "id" });
          }
        };
        request.onsuccess = (event) => {
          dbInstance = event.target.result;
          resolve(dbInstance);
        };
        request.onerror = () => {
          resolve(null);
        };
      } catch {
        resolve(null);
      }
    });
  }

  function getFallbackBoards() {
    try {
      const raw = localStorage.getItem(LS_FALLBACK_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveFallbackBoards(boards) {
    try {
      localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(boards));
    } catch (e) {
      console.warn("Drawora: LocalStorage quota exceeded for fallback boards", e);
    }
  }

  async function dbGetAllBoards() {
    const db = await openDraworaDb();
    if (!db) {
      const list = getFallbackBoards();
      list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      return list;
    }
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = Array.isArray(req.result) ? req.result : [];
          list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          resolve(list);
        };
        req.onerror = () => {
          const list = getFallbackBoards();
          list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          resolve(list);
        };
      } catch {
        const list = getFallbackBoards();
        list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        resolve(list);
      }
    });
  }

  async function dbGetBoard(id) {
    if (!id) return null;
    const db = await openDraworaDb();
    if (!db) {
      const list = getFallbackBoards();
      return list.find((b) => b.id === id) || null;
    }
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  async function dbSaveBoard(record) {
    if (!record || !record.id) return;
    const db = await openDraworaDb();
    if (!db) {
      const list = getFallbackBoards();
      const idx = list.findIndex((b) => b.id === record.id);
      if (idx >= 0) {
        list[idx] = record;
      } else {
        list.push(record);
      }
      saveFallbackBoards(list);
      return;
    }
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => {
          const list = getFallbackBoards();
          const idx = list.findIndex((b) => b.id === record.id);
          if (idx >= 0) list[idx] = record;
          else list.push(record);
          saveFallbackBoards(list);
          resolve();
        };
      } catch {
        resolve();
      }
    });
  }

  async function dbDeleteBoard(id) {
    if (!id) return;
    const db = await openDraworaDb();
    if (!db) {
      const list = getFallbackBoards().filter((b) => b.id !== id);
      saveFallbackBoards(list);
      return;
    }
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  function updateSaveStatus(text, kind = "") {
    if (!D.saveStatus) return;
    D.saveStatus.textContent = text;
    D.saveStatus.className = "save-status" + (kind ? ` is-${kind}` : "");
  }

  function scheduleAutosave(immediate = false) {
    if (!D.state.boardId) return;
    updateSaveStatus("Saving...", "saving");
    if (D.state.autosaveTimer) {
      clearTimeout(D.state.autosaveTimer);
      D.state.autosaveTimer = null;
    }
    const execute = async () => {
      try {
        const snapshot = typeof D.cloneBoard === "function" ? D.cloneBoard() : null;
        const thumbnail = typeof D.generateBoardThumbnail === "function" ? D.generateBoardThumbnail(D.state.pages, D.state.currentPageId) : "";
        const record = {
          id: D.state.boardId,
          name: D.state.boardName || "Untitled Board",
          createdAt: D.state.boardCreatedAt || Date.now(),
          updatedAt: Date.now(),
          pageCount: D.state.pages.length,
          thumbnail,
          snapshot,
        };
        await dbSaveBoard(record);
        try {
          localStorage.setItem(LS_ACTIVE_BOARD_KEY, D.state.boardId);
        } catch {}
        updateSaveStatus("Saved", "");
      } catch (err) {
        console.error("Drawora: Autosave failed", err);
        updateSaveStatus("Save error", "error");
      }
    };
    if (immediate) {
      execute();
    } else {
      D.state.autosaveTimer = setTimeout(execute, 400);
    }
  }

  async function createNewBoard(customName = null) {
    if (D.state.boardId) {
      await scheduleAutosave(true);
    }
    if (typeof D.finishOpenWork === "function") D.finishOpenWork();
    if (typeof D.clearSelection === "function") D.clearSelection();
    D.state.past = [];
    D.state.future = [];
    D.state.historyBefore = null;

    const newId = D.createId();
    const newName = customName || "Untitled Board";
    const firstPage = typeof D.makePage === "function"
      ? D.makePage({ name: "Page 1", preset: "a4", orientation: "portrait" })
      : { id: "p1", name: "Page 1", width: 794, height: 1123, objects: [], surface: { template: "white" } };

    D.state.boardId = newId;
    D.state.boardName = newName;
    D.state.boardCreatedAt = Date.now();
    D.state.pages = [firstPage];
    if (typeof D.attachPage === "function") D.attachPage(firstPage);

    if (D.boardTitleInput) D.boardTitleInput.value = newName;
    if (typeof D.resetView === "function") D.resetView();
    if (typeof D.fitCanvas === "function") D.fitCanvas();
    if (typeof D.syncEditUI === "function") D.syncEditUI();
    if (typeof D.syncPageUI === "function") D.syncPageUI();
    if (typeof D.syncLayersUI === "function") D.syncLayersUI();
    closeProjectsDialog();
    await scheduleAutosave(true);
  }

  async function openBoard(id) {
    if (!id || id === D.state.boardId) {
      closeProjectsDialog();
      return;
    }
    if (D.state.boardId) {
      await scheduleAutosave(true);
    }
    const record = await dbGetBoard(id);
    if (!record || !record.snapshot) {
      return;
    }
    if (typeof D.finishOpenWork === "function") D.finishOpenWork();
    if (typeof D.clearSelection === "function") D.clearSelection();
    D.state.past = [];
    D.state.future = [];
    D.state.historyBefore = null;

    D.state.boardId = record.id;
    D.state.boardName = record.name || "Untitled Board";
    D.state.boardCreatedAt = record.createdAt || Date.now();
    if (D.boardTitleInput) D.boardTitleInput.value = D.state.boardName;

    if (typeof D.restoreBoard === "function") D.restoreBoard(record.snapshot);
    try {
      localStorage.setItem(LS_ACTIVE_BOARD_KEY, D.state.boardId);
    } catch {}

    if (typeof D.fitCanvas === "function") D.fitCanvas();
    if (typeof D.syncEditUI === "function") D.syncEditUI();
    if (typeof D.syncPageUI === "function") D.syncPageUI();
    if (typeof D.syncLayersUI === "function") D.syncLayersUI();
    updateSaveStatus("Saved", "");
    closeProjectsDialog();
  }

  async function duplicateBoard(id = null) {
    const targetId = id || D.state.boardId;
    if (!targetId) return;
    if (targetId === D.state.boardId) {
      await scheduleAutosave(true);
      const snapshot = typeof D.cloneBoard === "function" ? D.cloneBoard() : null;
      const newId = D.createId();
      const newName = `Copy of ${D.state.boardName}`;
      const newRecord = {
        id: newId,
        name: newName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pageCount: D.state.pages.length,
        thumbnail: typeof D.generateBoardThumbnail === "function" ? D.generateBoardThumbnail(D.state.pages, D.state.currentPageId) : "",
        snapshot,
      };
      await dbSaveBoard(newRecord);
      await openBoard(newId);
    } else {
      const record = await dbGetBoard(targetId);
      if (!record) return;
      const newId = D.createId();
      const newName = `Copy of ${record.name || "Untitled Board"}`;
      const newRecord = {
        ...D.cloneData(record),
        id: newId,
        name: newName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await dbSaveBoard(newRecord);
      await renderProjectsList();
    }
  }

  async function deleteBoard(id) {
    if (!id) return;
    const board = await dbGetBoard(id);
    const name = board ? board.name : "this board";
    if (typeof D.openConfirmDialog === "function") {
      D.openConfirmDialog(
        `Delete "${name}"?`,
        "This board and all its pages will be permanently deleted.",
        "Delete",
        async () => {
          await dbDeleteBoard(id);
          if (id === D.state.boardId) {
            const remaining = await dbGetAllBoards();
            if (remaining.length > 0) {
              await openBoard(remaining[0].id);
            } else {
              await createNewBoard();
            }
          }
          await renderProjectsList();
        }
      );
    } else {
      if (window.confirm(`Delete "${name}"?`)) {
        await dbDeleteBoard(id);
        if (id === D.state.boardId) {
          const remaining = await dbGetAllBoards();
          if (remaining.length > 0) {
            await openBoard(remaining[0].id);
          } else {
            await createNewBoard();
          }
        }
        await renderProjectsList();
      }
    }
  }

  function renameBoard(nextName) {
    const trimmed = (nextName || "").trim().slice(0, 80) || "Untitled Board";
    if (D.state.boardName === trimmed) {
      if (D.boardTitleInput) D.boardTitleInput.value = D.state.boardName;
      return;
    }
    D.state.boardName = trimmed;
    if (D.boardTitleInput) D.boardTitleInput.value = trimmed;
    scheduleAutosave(true);
  }

  async function openProjectsDialog() {
    if (D.projectsDialog) {
      D.projectsDialog.hidden = false;
      if (D.projectsSearch) D.projectsSearch.value = "";
      await renderProjectsList();
      D.trapModalFocus(D.projectsDialog);
    }
  }

  function closeProjectsDialog() {
    if (D.projectsDialog) {
      D.projectsDialog.hidden = true;
      D.releaseModalFocus();
    }
  }

  async function renderProjectsList() {
    if (!D.projectsGrid) return;
    const boards = await dbGetAllBoards();
    const query = (D.projectsSearch && D.projectsSearch.value ? D.projectsSearch.value : "").trim().toLowerCase();
    const filtered = query ? boards.filter((b) => (b.name || "").toLowerCase().includes(query)) : boards;

    if (D.projectsCount) {
      D.projectsCount.textContent = `${boards.length} board${boards.length === 1 ? "" : "s"}`;
    }
    if (D.projectsEmpty) {
      D.projectsEmpty.hidden = filtered.length > 0;
    }
    D.projectsGrid.replaceChildren();

    for (const board of filtered) {
      const card = document.createElement("div");
      card.className = "project-card" + (board.id === D.state.boardId ? " is-active" : "");
      card.dataset.boardId = board.id;

      const thumbBox = document.createElement("div");
      thumbBox.className = "project-thumb-box";
      if (board.thumbnail) {
        const img = document.createElement("img");
        img.className = "project-thumb-img";
        img.src = board.thumbnail;
        img.alt = board.name || "Board thumbnail";
        thumbBox.append(img);
      }
      if (board.id === D.state.boardId) {
        const badge = document.createElement("span");
        badge.className = "project-badge-active";
        badge.textContent = "Current";
        thumbBox.append(badge);
      }

      const cardBody = document.createElement("div");
      cardBody.className = "project-card-body";

      const title = document.createElement("h3");
      title.className = "project-card-title";
      title.textContent = board.name || "Untitled Board";
      title.title = title.textContent;

      const meta = document.createElement("div");
      meta.className = "project-card-meta";
      const pagesCount = board.pageCount || (board.snapshot && board.snapshot.pages ? board.snapshot.pages.length : 1);
      const pagesSpan = document.createElement("span");
      pagesSpan.textContent = `${pagesCount} page${pagesCount === 1 ? "" : "s"}`;
      const timeSpan = document.createElement("span");
      timeSpan.textContent = D.formatRelativeTime(board.updatedAt);
      meta.append(pagesSpan, timeSpan);

      const actions = document.createElement("div");
      actions.className = "project-card-actions";

      const openBtn = document.createElement("button");
      openBtn.type = "button";
      openBtn.className = "project-action-btn";
      openBtn.dataset.projectAction = "open";
      openBtn.textContent = "Open";

      const dupBtn = document.createElement("button");
      dupBtn.type = "button";
      dupBtn.className = "project-action-btn";
      dupBtn.dataset.projectAction = "duplicate";
      dupBtn.title = "Duplicate board";
      dupBtn.textContent = "Duplicate";

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "project-action-btn is-delete";
      delBtn.dataset.projectAction = "delete";
      delBtn.title = "Delete board";
      delBtn.textContent = "Delete";

      actions.append(openBtn, dupBtn, delBtn);
      cardBody.append(title, meta, actions);
      card.append(thumbBox, cardBody);
      D.projectsGrid.append(card);
    }
  }

  async function handleImportProjectFile(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data || !Array.isArray(data.pages)) {
        alert("Invalid Drawora project file format.");
        return;
      }
      const newId = D.createId();
      const newName = data.boardName || file.name.replace(/\.(drawora|json)$/i, "") || "Imported Board";
      const record = {
        id: newId,
        name: newName,
        createdAt: data.createdAt || Date.now(),
        updatedAt: Date.now(),
        pageCount: data.pages.length,
        thumbnail: typeof D.generateBoardThumbnail === "function" ? D.generateBoardThumbnail(data.pages, data.currentPageId) : "",
        snapshot: {
          pages: data.pages,
          currentPageId: data.currentPageId || (data.pages[0] && data.pages[0].id),
          nextId: 1000,
          nextPageId: 100,
          selectedIds: [],
        },
      };
      await dbSaveBoard(record);
      await openBoard(newId);
    } catch (err) {
      console.error("Drawora: Project import error", err);
      alert("Failed to read project file: " + err.message);
    }
  }

  async function initProjectManager() {
    await openDraworaDb();
    let initialBoardId = null;
    try {
      initialBoardId = localStorage.getItem(LS_ACTIVE_BOARD_KEY);
    } catch {}

    const allBoards = await dbGetAllBoards();
    if (initialBoardId && allBoards.some((b) => b.id === initialBoardId)) {
      await openBoard(initialBoardId);
    } else if (allBoards.length > 0) {
      await openBoard(allBoards[0].id);
    } else {
      await createNewBoard("My First Board");
    }
  }

  function setupPwa() {
    if (
      "serviceWorker" in navigator &&
      (window.location.protocol === "https:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("./sw.js")
          .then((reg) => {
            console.log("Drawora: Service Worker registered with scope:", reg.scope);
          })
          .catch((err) => {
            console.warn("Drawora: Service Worker registration failed:", err);
          });
      });
    }

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      D.deferredInstallPrompt = event;
      if (D.installAppBtn) {
        D.installAppBtn.hidden = false;
      }
    });

    if (D.installAppBtn) {
      D.installAppBtn.addEventListener("click", async () => {
        if (!D.deferredInstallPrompt) {
          return;
        }
        D.installAppBtn.hidden = true;
        D.deferredInstallPrompt.prompt();
        const { outcome } = await D.deferredInstallPrompt.userChoice;
        if (outcome === "accepted") {
          D.deferredInstallPrompt = null;
        }
      });
    }
  }

  const exports = {
    openDraworaDb,
    dbGetAllBoards,
    dbGetBoard,
    dbSaveBoard,
    dbDeleteBoard,
    updateSaveStatus,
    scheduleAutosave,
    createNewBoard,
    openBoard,
    duplicateBoard,
    deleteBoard,
    renameBoard,
    openProjectsDialog,
    closeProjectsDialog,
    renderProjectsList,
    handleImportProjectFile,
    initProjectManager,
    setupPwa,
  };

  Object.assign(D, exports);
  Object.assign(window, exports);
})(window.Drawora = window.Drawora || {});
