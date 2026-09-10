/**
 * Drawora — Global Application State
 * Central state object and shared mutable data structures.
 */
(function (D) {
  "use strict";

  D.state = {
    tool: "pen",
    stroke: D.PRESET_COLORS[0],
    fill: null,
    colorTarget: "stroke",
    size: 4,
    fontSize: 24,
    fontKey: "sans",
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    align: "left",
    lineHeight: 1.35,
    letterSpacing: 0,
    paragraphSpacing: 0,
    textBack: null,
    list: "none",
    indent: 0,
    dpr: 1,
    nextId: 1,
    nextPageId: 1,
    pages: [],
    currentPageId: null,
    objects: [],
    selectedIds: [],
    clipboard: [],
    past: [],
    future: [],
    historyBefore: null,
    preview: null,
    active: null,
    editingId: null,
    editingIsNew: false,
    skipCanvasClick: false,
    ribbonTab: "home",
    zoom: 1,
    panX: 0,
    panY: 0,
    spacePan: false,
    queuedPoints: [],
    raf: 0,
    pageDragId: null,
    pageDragMoved: false,
    pageThumbKey: "",
    cropping: false,
    eyedropperReturn: "pen",
    tableCell: null,
    tableRange: null,
    editingCell: null,
    cellClipboard: "",
    clipboardKind: "objects",
    showGrid: false,
    showRulers: false,
    showGuides: true,
    spotlight: false,
    frozen: false,
    showLayers: false,
    layerDragId: null,
    boardId: null,
    boardName: "Untitled Board",
    boardCreatedAt: null,
    saveStatus: "saved",
    autosaveTimer: null,
    pointerWorld: null,
    laserTrail: [],
    presenting: false,
    presentationScreen: null,
    presenterIdleTimer: null,
    collabRoomId: null,
    collabStatus: "offline",
    collabRole: "owner",
    collabClientId: null,
    collabUserName: "Presenter",
    collabUserColor: "#0f766e",
    collabPeers: new Map(),
    collabSocket: null,
    collabChannel: null,
    collabLastCursorSent: 0,
    collabSyncInProgress: false,
  };

  D.imageAssets = new Map();

  // Mutable variable used by confirm dialog
  D.confirmCallback = null;

  // Mutable variable used by link dialog
  D.linkDialogTargetId = null;

  // Deferred PWA install prompt
  D.deferredInstallPrompt = null;

  Object.assign(window, D);
})(window.Drawora);
