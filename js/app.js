(() => {
  const DRAW_TOOLS = ["pen", "pencil", "brush", "marker", "highlighter", "spray", "eraser"];
  const SHAPE_TOOLS = [
    "line",
    "rect",
    "roundrect",
    "ellipse",
    "triangle",
    "arrow",
    "diamond",
    "pentagon",
    "hexagon",
    "star",
  ];
  const POLYGON_SHAPES = ["triangle", "diamond", "pentagon", "hexagon", "star"];
  const TEXT_TOOLS = ["text", "sticky"];
  const EXTRA_TOOLS = ["fill", "eyedropper", "lasso", "laser", "measure", "protractor", "compass"];
  const TOOLS = ["select", "pan", ...DRAW_TOOLS, ...SHAPE_TOOLS, ...TEXT_TOOLS, ...EXTRA_TOOLS];
  const SHORTCUTS = {
    v: "select",
    h: "pan",
    p: "pen",
    b: "brush",
    e: "eraser",
    t: "text",
    n: "sticky",
    f: "fill",
    i: "eyedropper",
    l: "lasso",
    r: "laser",
    m: "measure",
  };
  const SIZE_STOPS = [2, 4, 8, 12, 20];
  const PRESET_COLORS = [
    "#1c1917",
    "#dc2626",
    "#2563eb",
    "#16a34a",
    "#ca8a04",
    "#7c3aed",
  ];
  const ROUND_RECT_RADIUS = 12;
  const MIN_SHAPE_SIZE = 2;
  const MIN_FRAME = 8;
  const HANDLE_SIZE = 7;
  const HANDLE_HIT = 10;
  const ROTATE_OFFSET = 26;
  const HIT_PADDING = 8;
  const RULER_SIZE = 22;
  const SPOTLIGHT_RADIUS = 92;
  const DUPLICATE_OFFSET = 16;
  const MAX_HISTORY = 50;
  const SELECT_COLOR = "#0f766e";
  const FONT_FAMILY = '"Segoe UI", system-ui, sans-serif';
  const FONT_STACKS = {
    sans: '"Segoe UI", system-ui, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
    mono: 'Consolas, "Courier New", monospace',
  };
  const FONT_SIZES = [12, 14, 16, 20, 24, 32, 40, 48, 72];
  const TEXT_PAD = 12;
  const TEXT_DEFAULT = { width: 280, height: 48 };
  const STICKY_DEFAULT = { width: 176, height: 176 };
  const STICKY_FILL = "#fde68a";
  const INDENT_STEP = 24;
  const MAX_INDENT = 6;
  const LIST_GUTTER = 22;
  const MIN_TEXT_WIDTH = 80;
  const MIN_IMAGE = 16;
  const MAX_IMAGE_PIXELS = 16_000_000;
  const IMAGE_TYPES = /^image\/(png|jpe?g|gif|webp|bmp|svg\+xml)$/i;
  const MAX_IMPORT_BYTES = 20_000_000;
  const MAX_IMPORT_TEXT = 20_000;
  const MAX_IMPORT_ROWS = 40;
  const MAX_IMPORT_COLS = 20;
  const TABLE_DEFAULT_COLS = 3;
  const TABLE_DEFAULT_ROWS = 3;
  const TABLE_CELL_MIN = 28;
  const TABLE_PAD = 6;
  const TABLE_SPLIT_HIT = 5;
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 8;
  const ZOOM_STEP = 1.2;
  const MIN_PAGE_SIZE = 100;
  const MAX_PAGE_SIZE = 8000;
  const PAGE_PRESETS = {
    a4: { width: 794, height: 1123, label: "A4" },
    a3: { width: 1123, height: 1587, label: "A3" },
    a5: { width: 559, height: 794, label: "A5" },
    a2: { width: 1587, height: 2245, label: "A2" },
    letter: { width: 816, height: 1056, label: "Letter" },
    legal: { width: 816, height: 1344, label: "Legal" },
  };
  const TEACHER_TEMPLATES = ["white", "presentation", "dark", "grid", "solid"];
  const STUDENT_TEMPLATES = ["ruled", "narrow-ruled", "wide-ruled", "graph", "dotted", "math", "handwriting"];
  const PAGE_TEMPLATES = {
    white: { mode: "teacher", template: "white", paperColor: "#ffffff", lineColor: "#d6d3d1", lineSpacing: 32, margin: 56, gridSize: 24 },
    presentation: { mode: "teacher", template: "presentation", paperColor: "#f1f5f9", lineColor: "#0f766e", lineSpacing: 32, margin: 0, gridSize: 24 },
    dark: { mode: "teacher", template: "dark", paperColor: "#24362b", lineColor: "#4d7c5a", lineSpacing: 32, margin: 0, gridSize: 32 },
    grid: { mode: "teacher", template: "grid", paperColor: "#ffffff", lineColor: "#e7e5e4", lineSpacing: 24, margin: 0, gridSize: 24 },
    solid: { mode: "teacher", template: "solid", paperColor: "#ffffff", lineColor: "#d6d3d1", lineSpacing: 32, margin: 56, gridSize: 24 },
    ruled: { mode: "student", template: "ruled", paperColor: "#fffef7", lineColor: "#93c5fd", lineSpacing: 32, margin: 64, gridSize: 24 },
    "narrow-ruled": { mode: "student", template: "narrow-ruled", paperColor: "#fffef7", lineColor: "#93c5fd", lineSpacing: 22, margin: 64, gridSize: 24 },
    "wide-ruled": { mode: "student", template: "wide-ruled", paperColor: "#fffef7", lineColor: "#7dd3fc", lineSpacing: 40, margin: 64, gridSize: 24 },
    graph: { mode: "student", template: "graph", paperColor: "#ffffff", lineColor: "#d6d3d1", lineSpacing: 20, margin: 0, gridSize: 20 },
    dotted: { mode: "student", template: "dotted", paperColor: "#ffffff", lineColor: "#a8a29e", lineSpacing: 24, margin: 0, gridSize: 24 },
    math: { mode: "student", template: "math", paperColor: "#f8fafc", lineColor: "#cbd5e1", lineSpacing: 16, margin: 0, gridSize: 16 },
    handwriting: { mode: "student", template: "handwriting", paperColor: "#fffef7", lineColor: "#7dd3fc", lineSpacing: 56, margin: 48, gridSize: 24 },
  };

  const state = {
    tool: "pen",
    stroke: PRESET_COLORS[0],
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

  const RIBBON_TABS = ["home", "draw", "insert", "view", "page", "export", "help"];

  const canvas = document.getElementById("board");
  const toolbar = document.querySelector(".ribbon");
  const ribbonTabs = document.querySelector(".ribbon-tabs");
  const colorInput = document.getElementById("custom-color");
  const customSwatch = toolbar && toolbar.querySelector(".swatch-custom");
  const strokePreview = document.getElementById("stroke-preview");
  const fillPreview = document.getElementById("fill-preview");
  const fillTargetButton = toolbar && toolbar.querySelector('[data-color-target="fill"]');
  const sizeInput = document.getElementById("stroke-size");
  const sizeValue = document.getElementById("size-value");
  const undoBtn = document.getElementById("undo-btn");
  const redoBtn = document.getElementById("redo-btn");
  const deleteBtn = document.getElementById("delete-btn");
  const copyBtn = document.getElementById("copy-btn");
  const pasteBtn = document.getElementById("paste-btn");
  const duplicateBtn = document.getElementById("duplicate-btn");
  const cutBtn = document.getElementById("cut-btn");
  const selectAllBtn = document.getElementById("select-all-btn");
  const groupBtn = document.getElementById("group-btn");
  const ungroupBtn = document.getElementById("ungroup-btn");
  const editor = document.getElementById("text-editor");
  const fontSizeSelect = document.getElementById("font-size");
  const fontFamilySelect = document.getElementById("font-family");
  const lineHeightInput = document.getElementById("line-height");
  const letterSpacingInput = document.getElementById("letter-spacing");
  const paraSpacingInput = document.getElementById("para-spacing");
  const textBackInput = document.getElementById("text-back");
  const zoomLabel = document.getElementById("zoom-label");
  const zoomValue = document.getElementById("zoom-value");
  const pageNameInput = document.getElementById("page-name");
  const pageWidthInput = document.getElementById("page-width");
  const pageHeightInput = document.getElementById("page-height");
  const pageThumbs = document.getElementById("page-thumbs");
  const pageStatus = document.getElementById("page-status");
  const pageDeleteBtn = document.getElementById("page-delete-btn");
  const statusbar = document.querySelector(".statusbar");
  const paperColorInput = document.getElementById("paper-color");
  const lineColorInput = document.getElementById("line-color");
  const lineSpacingInput = document.getElementById("line-spacing");
  const gridSizeInput = document.getElementById("grid-size");
  const pageMarginInput = document.getElementById("page-margin");
  const imageFileInput = document.getElementById("image-file");
  const documentFileInput = document.getElementById("document-file");
  const imageCropBtn = document.getElementById("image-crop-btn");
  const imageFlipHBtn = document.getElementById("image-flip-h-btn");
  const imageFlipVBtn = document.getElementById("image-flip-v-btn");
  const imageShadowBtn = document.getElementById("image-shadow-btn");
  const imageGrayBtn = document.getElementById("image-gray-btn");
  const imageOpacityInput = document.getElementById("image-opacity");
  const imageRadiusInput = document.getElementById("image-radius");
  const imageBrightnessInput = document.getElementById("image-brightness");
  const imageContrastInput = document.getElementById("image-contrast");
  const imageSaturationInput = document.getElementById("image-saturation");
  const imageBlurInput = document.getElementById("image-blur");
  const canvasWrap = document.querySelector(".canvas-wrap");
  const linkDialog = document.getElementById("link-dialog");
  const linkForm = document.getElementById("link-form");
  const linkTitle = document.getElementById("link-dialog-title");
  const linkTextInput = document.getElementById("link-text");
  const linkHrefInput = document.getElementById("link-href");
  const linkError = document.getElementById("link-error");
  const linkCancel = document.getElementById("link-cancel");
  const linkOpenBtn = document.getElementById("link-open-btn");
  const confirmDialog = document.getElementById("confirm-dialog");
  const confirmForm = document.getElementById("confirm-form");
  const confirmTitle = document.getElementById("confirm-title");
  const confirmMessage = document.getElementById("confirm-message");
  const confirmCancel = document.getElementById("confirm-cancel");
  const confirmOk = document.getElementById("confirm-ok");
  const teachStatus = document.getElementById("teach-status");
  const appEl = document.querySelector(".app");
  const layersPanel = document.getElementById("layers-panel");
  const layersList = document.getElementById("layers-list");
  const layersEmpty = document.getElementById("layers-empty");
  const boardTitleInput = document.getElementById("board-title-input");
  const boardsBtn = document.getElementById("boards-btn");
  const saveStatus = document.getElementById("save-status");
  const projectsDialog = document.getElementById("projects-dialog");
  const projectsSearch = document.getElementById("projects-search");
  const projectsGrid = document.getElementById("projects-grid");
  const projectsEmpty = document.getElementById("projects-empty");
  const projectsCount = document.getElementById("projects-count");
  const exportDialog = document.getElementById("export-dialog");
  const exportPreviewImg = document.getElementById("export-preview-img");
  const exportPreviewPlaceholder = document.getElementById("export-preview-placeholder");
  const exportPreviewBadge = document.getElementById("export-preview-badge");
  const exportFormatSelect = document.getElementById("export-format");
  const exportScopeSelect = document.getElementById("export-scope");
  const exportScaleSelect = document.getElementById("export-scale");
  const exportTransparentBg = document.getElementById("export-transparent-bg");
  const exportQualityRange = document.getElementById("export-quality");
  const exportQualityVal = document.getElementById("export-quality-val");
  const exportQualityWrap = document.getElementById("export-quality-wrap");
  const exportScaleWrap = document.getElementById("export-scale-wrap");
  const exportBgWrap = document.getElementById("export-bg-wrap");
  const exportScopeWrap = document.getElementById("export-scope-wrap");
  const exportFilenameInput = document.getElementById("export-filename");
  const exportDownloadBtn = document.getElementById("export-download-btn");
  const exportInfo = document.getElementById("export-info");
  const projectFileInput = document.getElementById("project-file");
  const importProjectBtn = document.getElementById("import-project-btn");
  const presenterBar = document.getElementById("presenter-bar");
  const presenterPageStatus = document.getElementById("presenter-page-status");
  const presenterLaserBtn = document.getElementById("presenter-laser-btn");
  const presenterPenBtn = document.getElementById("presenter-pen-btn");
  const presenterEraserBtn = document.getElementById("presenter-eraser-btn");
  const presenterBlackBtn = document.getElementById("presenter-black-btn");
  const presenterWhiteBtn = document.getElementById("presenter-white-btn");
  const presentationCurtain = document.getElementById("presentation-curtain");
  const presentStartBtn = document.getElementById("present-start-btn");
  const installAppBtn = document.getElementById("install-app-btn");
  const collabPresenceBtn = document.getElementById("collab-presence-btn");
  const collabStatusDot = document.getElementById("collab-status-dot");
  const collabLabel = document.getElementById("collab-label");
  const collabAvatars = document.getElementById("collab-avatars");
  const collabDialog = document.getElementById("collab-dialog");
  const collabRoomInput = document.getElementById("collab-room-input");
  const collabUserName = document.getElementById("collab-user-name");
  const collabColorSwatches = document.getElementById("collab-color-swatches");
  const collabRandomBtn = document.getElementById("collab-random-btn");
  const collabConnectBtn = document.getElementById("collab-connect-btn");
  const collabDisconnectBtn = document.getElementById("collab-disconnect-btn");
  const collabParticipantsList = document.getElementById("collab-participants-list");
  const collabParticipantsCount = document.getElementById("collab-participants-count");
  const collabDialogStatusDot = document.getElementById("collab-dialog-status-dot");
  const collabDialogStatusText = document.getElementById("collab-dialog-status-text");
  const collabStatusBanner = document.getElementById("collab-status-banner");
  const shareBtn = document.getElementById("share-btn");
  const viewerModeBanner = document.getElementById("viewer-mode-banner");
  const collabLinkEditor = document.getElementById("collab-link-editor");
  const collabLinkViewer = document.getElementById("collab-link-viewer");
  const collabCopyEditorBtn = document.getElementById("collab-copy-editor-btn");
  const collabCopyViewerBtn = document.getElementById("collab-copy-viewer-btn");
  const collabSelfRole = document.getElementById("collab-self-role");
  const shortcutsDialog = document.getElementById("shortcuts-dialog");
  const helpShortcutsBtn = document.getElementById("help-shortcuts-btn");
  const helpAboutBtn = document.getElementById("help-about-btn");

  if (
    !canvas ||
    !toolbar ||
    !colorInput ||
    !customSwatch ||
    !strokePreview ||
    !fillPreview ||
    !fillTargetButton ||
    !sizeInput ||
    !sizeValue ||
    !undoBtn ||
    !redoBtn ||
    !deleteBtn ||
    !copyBtn ||
    !pasteBtn ||
    !duplicateBtn ||
    !cutBtn ||
    !selectAllBtn ||
    !groupBtn ||
    !ungroupBtn ||
    !ribbonTabs ||
    !editor ||
    !fontSizeSelect ||
    !fontFamilySelect ||
    !lineHeightInput ||
    !letterSpacingInput ||
    !paraSpacingInput ||
    !textBackInput ||
    !zoomLabel ||
    !zoomValue ||
    !pageNameInput ||
    !pageWidthInput ||
    !pageHeightInput ||
    !pageThumbs ||
    !pageStatus ||
    !pageDeleteBtn ||
    !statusbar ||
    !paperColorInput ||
    !lineColorInput ||
    !lineSpacingInput ||
    !gridSizeInput ||
    !pageMarginInput ||
    !imageFileInput ||
    !documentFileInput ||
    !imageCropBtn ||
    !imageFlipHBtn ||
    !imageFlipVBtn ||
    !imageShadowBtn ||
    !imageGrayBtn ||
    !imageOpacityInput ||
    !imageRadiusInput ||
    !imageBrightnessInput ||
    !imageContrastInput ||
    !imageSaturationInput ||
    !imageBlurInput ||
    !canvasWrap ||
    !linkDialog ||
    !linkForm ||
    !linkTitle ||
    !linkTextInput ||
    !linkHrefInput ||
    !linkError ||
    !linkCancel ||
    !linkOpenBtn ||
    !confirmDialog ||
    !confirmForm ||
    !confirmTitle ||
    !confirmMessage ||
    !confirmCancel ||
    !confirmOk ||
    !teachStatus ||
    !appEl ||
    !layersPanel ||
    !layersList ||
    !layersEmpty ||
    !boardTitleInput ||
    !boardsBtn ||
    !saveStatus ||
    !projectsDialog ||
    !projectsSearch ||
    !projectsGrid ||
    !projectsEmpty ||
    !projectsCount ||
    !exportDialog ||
    !exportPreviewImg ||
    !exportPreviewPlaceholder ||
    !exportPreviewBadge ||
    !exportFormatSelect ||
    !exportScopeSelect ||
    !exportScaleSelect ||
    !exportTransparentBg ||
    !exportQualityRange ||
    !exportQualityVal ||
    !exportQualityWrap ||
    !exportScaleWrap ||
    !exportBgWrap ||
    !exportScopeWrap ||
    !exportFilenameInput ||
    !exportDownloadBtn ||
    !exportInfo ||
    !projectFileInput ||
    !importProjectBtn ||
    !presenterBar ||
    !presenterPageStatus ||
    !presenterLaserBtn ||
    !presenterPenBtn ||
    !presenterEraserBtn ||
    !presenterBlackBtn ||
    !presenterWhiteBtn ||
    !presentationCurtain ||
    !presentStartBtn ||
    !installAppBtn ||
    !collabPresenceBtn ||
    !collabStatusDot ||
    !collabLabel ||
    !collabAvatars ||
    !collabDialog ||
    !collabRoomInput ||
    !collabUserName ||
    !collabColorSwatches ||
    !collabRandomBtn ||
    !collabConnectBtn ||
    !collabDisconnectBtn ||
    !collabParticipantsList ||
    !collabParticipantsCount ||
    !collabDialogStatusDot ||
    !collabDialogStatusText ||
    !collabStatusBanner ||
    !shareBtn ||
    !viewerModeBanner ||
    !collabLinkEditor ||
    !collabLinkViewer ||
    !collabCopyEditorBtn ||
    !collabCopyViewerBtn ||
    !collabSelfRole
  ) {
    console.error("Drawora: missing canvas or toolbar controls.");
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Drawora: 2D canvas is not available.");
    return;
  }

  const imageAssets = new Map();
  let nextImageAssetId = 1;
  let linkDialogTargetId = null;
  let confirmCallback = null;
  const a11yLiveRegion = document.getElementById("a11y-live-region");
  let a11yTimer = null;
  let modalFocusRestoreEl = null;

  function announceA11y(message) {
    if (!a11yLiveRegion || !message) return;
    clearTimeout(a11yTimer);
    a11yLiveRegion.textContent = "";
    a11yTimer = setTimeout(() => {
      a11yLiveRegion.textContent = message;
    }, 50);
  }

  function trapModalFocus(dialogEl) {
    if (!dialogEl) return;
    modalFocusRestoreEl = document.activeElement;
    const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(dialogEl.querySelectorAll(focusableSelector));
    if (focusables.length > 0) {
      setTimeout(() => {
        focusables[0].focus();
      }, 30);
    }
  }

  function releaseModalFocus() {
    if (modalFocusRestoreEl && typeof modalFocusRestoreEl.focus === "function") {
      try {
        modalFocusRestoreEl.focus();
      } catch {}
    }
    modalFocusRestoreEl = null;
  }

  function handleModalTabKey(event, dialogEl) {
    if (event.key !== "Tab" || dialogEl.hidden) return false;
    const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(dialogEl.querySelectorAll(focusableSelector));
    if (focusables.length === 0) return false;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first || !dialogEl.contains(document.activeElement)) {
        event.preventDefault();
        last.focus();
        return true;
      }
    } else {
      if (document.activeElement === last || !dialogEl.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
        return true;
      }
    }
    return false;
  }

  function isTypingTarget(element) {
    if (!element || !(element instanceof HTMLElement)) {
      return false;
    }

    return (
      element.tagName === "INPUT" ||
      element.tagName === "TEXTAREA" ||
      element.tagName === "SELECT" ||
      element.isContentEditable
    );
  }

  function isShapeTool(tool) {
    return SHAPE_TOOLS.includes(tool);
  }

  function isInkTool(tool) {
    return DRAW_TOOLS.includes(tool);
  }

  function isPolygonShape(object) {
    return object && POLYGON_SHAPES.includes(object.type);
  }

  function isTextTool(tool) {
    return TEXT_TOOLS.includes(tool);
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

  function isSelectable(object) {
    return !(object.type === "stroke" && object.tool === "eraser") && !object.hidden;
  }

  function isLayerItem(object) {
    return !(object.type === "stroke" && object.tool === "eraser");
  }

  function isLocked(object) {
    return Boolean(object && object.locked);
  }

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
    if (!object || state.editingId) {
      return null;
    }
    const local = objectLocalPoint(object, point);
    const layout = tableLayout(object);
    const lx = local.x - object.x;
    const ly = local.y - object.y;
    const tol = viewLen(TABLE_SPLIT_HIT);
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
    if (state.tableRange && state.tableCell && state.tableCell.id === object.id) {
      r1 = Math.min(state.tableRange.r1, state.tableRange.r2);
      c1 = Math.min(state.tableRange.c1, state.tableRange.c2);
      r2 = Math.max(state.tableRange.r1, state.tableRange.r2);
      c2 = Math.max(state.tableRange.c1, state.tableRange.c2);
    } else if (state.tableCell && state.tableCell.id === object.id) {
      const origin = tableOrigin(object, state.tableCell.r, state.tableCell.c) || { r: 0, c: 0 };
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
      pad: TABLE_PAD,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
  }

  function applyStyleToTableCell(cell) {
    cell.color = state.stroke;
    cell.fontSize = state.fontSize;
    cell.fontKey = state.fontKey;
    cell.bold = state.bold;
    cell.italic = state.italic;
    cell.underline = state.underline;
    cell.strike = state.strike;
    cell.align = state.align;
    if (state.fill) {
      cell.fill = state.fill;
    }
  }

  function loadStyleFromTableCell(cell) {
    state.fontSize = cell.fontSize || 14;
    state.fontKey = cell.fontKey || "sans";
    state.bold = Boolean(cell.bold);
    state.italic = Boolean(cell.italic);
    state.underline = Boolean(cell.underline);
    state.strike = Boolean(cell.strike);
    state.align = cell.align || "left";
    if (cell.color) {
      state.stroke = cell.color;
    }
    if (cell.fill) {
      state.fill = cell.fill;
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
    const columnCount = Math.max(1, cols || TABLE_DEFAULT_COLS);
    const rowCount = Math.max(1, rows || TABLE_DEFAULT_ROWS);
    const width = columnCount * 110;
    const height = rowCount * 36;
    return {
      id: createId(),
      type: "table",
      x,
      y,
      width,
      height,
      colW: Array.from({ length: columnCount }, () => 1 / columnCount),
      rowH: Array.from({ length: rowCount }, () => 1 / rowCount),
      cells: Array.from({ length: rowCount }, () => Array.from({ length: columnCount }, createTableCell)),
      stroke: state.stroke,
      size: Math.max(1, Math.min(state.size, 4)),
      rotation: 0,
    };
  }

  function assetSize(source) {
    return {
      width: source.naturalWidth || source.width || 1,
      height: source.naturalHeight || source.height || 1,
    };
  }

  function getImageAsset(imageId) {
    return imageAssets.get(imageId) || null;
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
        if (pixels > MAX_IMAGE_PIXELS) {
          const scale = Math.sqrt(MAX_IMAGE_PIXELS / pixels);
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
    imageAssets.set(id, { source, width: size.width, height: size.height });
    return id;
  }

  function fitImageBox(naturalWidth, naturalHeight, at) {
    const page = currentPage();
    const maxW = page ? page.width * 0.62 : 480;
    const maxH = page ? page.height * 0.62 : 480;
    const scale = Math.min(maxW / Math.max(naturalWidth, 1), maxH / Math.max(naturalHeight, 1), 1);
    const width = Math.max(MIN_IMAGE, naturalWidth * scale);
    const height = Math.max(MIN_IMAGE, naturalHeight * scale);
    const center = at || screenToWorld(viewportCenter());
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
      id: createId(),
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
      stroke: state.stroke,
      size: 0,
    };
  }

  async function insertImageFromBlob(blob, at) {
    if (!blob || (blob.type && !IMAGE_TYPES.test(blob.type) && !isImageFile(blob))) {
      return null;
    }

    finishOpenWork();
    try {
      const imageId = await storeImageBlob(blob);
      const asset = getImageAsset(imageId);
      const box = fitImageBox(asset.width, asset.height, at);
      captureBefore();
      const object = makeImageObject(imageId, box);
      state.objects.push(object);
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

  function isImageFile(file) {
    if (!file) {
      return false;
    }
    if (file.type && IMAGE_TYPES.test(file.type)) {
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
      if (item.type && IMAGE_TYPES.test(item.type)) {
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
    if (value.length <= MAX_IMPORT_TEXT) {
      return value;
    }
    return `${value.slice(0, MAX_IMPORT_TEXT)}\n…`;
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
      if (!pos || pos.r >= MAX_IMPORT_ROWS || pos.c >= MAX_IMPORT_COLS) {
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
    const rows = Math.min(MAX_IMPORT_ROWS, Math.max(1, grid.length));
    const cols = Math.min(
      MAX_IMPORT_COLS,
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
      stroke: state.stroke,
      size: 1,
      color: "#0f172a",
      rotation: 0,
    };
  }

  function placeImportedObject(object) {
    state.objects.push(object);
    if (isTable(object)) {
      state.tableCell = { id: object.id, r: 0, c: 0 };
      state.tableRange = null;
    }
    finishInsert([object.id]);
  }

  async function insertImportedFile(file, at) {
    if (!file || state.frozen) {
      return null;
    }
    if (file.size > MAX_IMPORT_BYTES) {
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
      const truncatedRows = totalRows > MAX_IMPORT_ROWS ? totalRows - MAX_IMPORT_ROWS : 0;
      const truncatedCols = totalCols > MAX_IMPORT_COLS ? totalCols - MAX_IMPORT_COLS : 0;
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
        state.objects.push(
          createFileCard(file, "csv", `CSV truncated: imported first ${MAX_IMPORT_ROWS}x${MAX_IMPORT_COLS}, dropped ${parts.join(" and ")}.`, warnBox)
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
        ? { x: (at ? at.x : viewportWorldCenter().x) + i * DUPLICATE_OFFSET, y: (at ? at.y : viewportWorldCenter().y) + i * DUPLICATE_OFFSET }
        : at;
      await insertImportedFile(list[i], offset);
    }
  }

  function openFilePicker() {
    documentFileInput.value = "";
    documentFileInput.click();
  }

  function normalizeHex(color) {
    return color.trim().toLowerCase();
  }

  function rgbToHex(r, g, b) {
    return `#${[r, g, b]
      .map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0"))
      .join("")}`;
  }

  function createId() {
    const id = `o${state.nextId}`;
    state.nextId += 1;
    return id;
  }

  function createPageId() {
    const id = `p${state.nextPageId}`;
    state.nextPageId += 1;
    return id;
  }

  function clampPageSize(value, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return fallback;
    }
    return Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, Math.round(number)));
  }

  function pageDimensions(preset, orientation, customWidth, customHeight) {
    if (preset === "custom") {
      return {
        width: clampPageSize(customWidth, 794),
        height: clampPageSize(customHeight, 1123),
      };
    }

    const base = PAGE_PRESETS[preset] || PAGE_PRESETS.a4;
    if (orientation === "landscape") {
      return { width: base.height, height: base.width };
    }
    return { width: base.width, height: base.height };
  }

  function nextPageName() {
    let max = 0;
    for (const page of state.pages) {
      const match = /^Page (\d+)$/.exec(page.name);
      if (match) {
        max = Math.max(max, Number(match[1]));
      }
    }
    return `Page ${max + 1}`;
  }

  function uniqueCopyName(name) {
    const base = `${name} copy`;
    const names = new Set(state.pages.map((page) => page.name));
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
    const spec = PAGE_TEMPLATES[template] || PAGE_TEMPLATES.white;
    return { ...spec };
  }

  function normalizeSurface(surface) {
    const base = defaultSurface(surface && surface.template);
    if (!surface) {
      return base;
    }
    return {
      mode: surface.mode || base.mode,
      template: PAGE_TEMPLATES[surface.template] ? surface.template : base.template,
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

  function hexLuminance(color) {
    const hex = normalizeHex(String(color || "#ffffff")).replace("#", "");
    if (hex.length !== 6) {
      return 1;
    }
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function makePage(options = {}) {
    const source = options.source || currentPage();
    const preset = options.preset || (source && source.preset) || "a4";
    const orientation = options.orientation || (source && source.orientation) || "portrait";
    const size = pageDimensions(
      preset,
      orientation,
      options.width || (source && source.width) || 794,
      options.height || (source && source.height) || 1123
    );
    return {
      id: options.id || createPageId(),
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
      guides: options.guides || (source && source.guides ? cloneData(source.guides) : []),
      zoom: options.zoom ?? 1,
      panX: options.panX ?? 0,
      panY: options.panY ?? 0,
    };
  }

  function currentPage() {
    return state.pages.find((page) => page.id === state.currentPageId) || state.pages[0] || null;
  }

  function currentPageIndex() {
    return state.pages.findIndex((page) => page.id === state.currentPageId);
  }

  function pageBounds() {
    const page = currentPage();
    if (!page) {
      return { x: 0, y: 0, width: 794, height: 1123 };
    }
    return { x: 0, y: 0, width: page.width, height: page.height };
  }

  function rememberCamera() {
    const page = currentPage();
    if (!page) {
      return;
    }
    page.zoom = state.zoom;
    page.panX = state.panX;
    page.panY = state.panY;
  }

  function applyPageCamera(page) {
    state.zoom = page.zoom;
    state.panX = page.panX;
    state.panY = page.panY;
  }

  function attachPage(page) {
    state.currentPageId = page.id;
    state.objects = page.objects;
    applyPageCamera(page);
    const pageIndex = state.pages.indexOf(page);
    if (pageIndex >= 0) {
      announceA11y(`Page ${pageIndex + 1} of ${state.pages.length}: ${page.name}`);
    }
  }

  function finishOpenWork() {
    if (state.editingId) {
      finishEditing();
    }
    if (state.active) {
      cancelActive();
    }
  }

  function cloneData(value) {
    return structuredClone(value);
  }

  function getScreenPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function screenToWorld(screen) {
    return {
      x: (screen.x - state.panX) / state.zoom,
      y: (screen.y - state.panY) / state.zoom,
    };
  }

  function worldToScreen(point) {
    return {
      x: point.x * state.zoom + state.panX,
      y: point.y * state.zoom + state.panY,
    };
  }

  function getPoint(event) {
    return screenToWorld(getScreenPoint(event));
  }

  function gridStep() {
    const page = currentPage();
    return pageSurface(page).gridSize;
  }

  function snapPoint(point) {
    if (!state.showGrid || !point) {
      return point;
    }
    const step = gridStep();
    return {
      x: Math.round(point.x / step) * step,
      y: Math.round(point.y / step) * step,
    };
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

  function isOverlayTool(tool) {
    return tool === "laser" || tool === "measure" || tool === "protractor";
  }

  function isFrozenBlockedTool(tool) {
    return state.frozen && tool !== "pan" && tool !== "laser" && tool !== "select";
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

  function viewLen(pixels) {
    return pixels / state.zoom;
  }

  function viewportCenter() {
    return { x: canvas.clientWidth / 2, y: canvas.clientHeight / 2 };
  }

  function formatZoom() {
    const percent = state.zoom * 100;
    const rounded = percent >= 20 ? Math.round(percent) : Math.round(percent * 10) / 10;
    return `${rounded}%`;
  }

  function formatLength(px) {
    const cm = (px / 96) * 2.54;
    return `${cm.toFixed(1)} cm · ${Math.round(px)} px`;
  }

  function formatAngle(start, end) {
    let deg = (Math.atan2(start.y - end.y, end.x - start.x) * 180) / Math.PI;
    if (deg < 0) {
      deg += 360;
    }
    return `${Math.round(deg)}°`;
  }

  function syncViewUI() {
    const label = formatZoom();
    zoomLabel.textContent = label;
    zoomValue.textContent = label;
  }

  function refreshCameraOverlays() {
    if (state.editingId) {
      const object = findObject(state.editingId);
      if (isTextLike(object)) {
        positionEditor(object);
      } else if (isTable(object)) {
        positionEditor(object);
      }
    }
    syncViewUI();
  }

  function setZoomAt(nextZoom, screenPoint) {
    const screen = screenPoint || viewportCenter();
    const world = screenToWorld(screen);
    state.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
    state.panX = screen.x - world.x * state.zoom;
    state.panY = screen.y - world.y * state.zoom;
    refreshCameraOverlays();
    redraw();
  }

  function zoomBy(factor, screenPoint) {
    setZoomAt(state.zoom * factor, screenPoint);
  }

  function resetView() {
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
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
    state.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min((vw - pad * 2) / width, (vh - pad * 2) / height)));
    state.panX = (vw - width * state.zoom) / 2 - bounds.x * state.zoom;
    state.panY = (vh - height * state.zoom) / 2 - bounds.y * state.zoom;
    refreshCameraOverlays();
    redraw();
  }

  function fitCanvas() {
    fitToBounds(pageBounds());
  }

  function fitSelection() {
    const selected = selectedObjects();
    if (selected.length === 0) {
      fitCanvas();
      return;
    }
    fitToBounds(unionBounds(selected.map((object) => objectWorldBounds(object))));
  }

  function distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
  }

  function selectedObjects() {
    return state.objects.filter((object) => state.selectedIds.includes(object.id));
  }

  function findObject(id) {
    return state.objects.find((object) => object.id === id);
  }

  function normalizedBounds(start, end, square) {
    let x2 = end.x;
    let y2 = end.y;

    if (square) {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const side = Math.max(Math.abs(dx), Math.abs(dy));
      x2 = start.x + Math.sign(dx || 1) * side;
      y2 = start.y + Math.sign(dy || 1) * side;
    }

    return {
      x: Math.min(start.x, x2),
      y: Math.min(start.y, y2),
      width: Math.abs(x2 - start.x),
      height: Math.abs(y2 - start.y),
    };
  }

  function makeShape(type, start, end, shift) {
    if (type === "line" || type === "arrow") {
      return {
        type,
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
        stroke: state.stroke,
        size: state.size,
        rotation: 0,
      };
    }

    const shape = {
      type,
      ...normalizedBounds(
        start,
        end,
        shift && (type === "ellipse" || POLYGON_SHAPES.includes(type))
      ),
      stroke: state.stroke,
      fill: state.fill,
      size: state.size,
      rotation: 0,
    };

    if (type === "roundrect") {
      shape.radius = ROUND_RECT_RADIUS;
    }

    return shape;
  }

  function isShapeMeaningful(shape) {
    if (shape.type === "line" || shape.type === "arrow") {
      return distance({ x: shape.x1, y: shape.y1 }, { x: shape.x2, y: shape.y2 }) >= MIN_SHAPE_SIZE;
    }

    return shape.width >= MIN_SHAPE_SIZE || shape.height >= MIN_SHAPE_SIZE;
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
        width: Math.max(maxX - minX, MIN_SHAPE_SIZE),
        height: Math.max(maxY - minY, MIN_SHAPE_SIZE),
      };
    }

    if (object.type === "line" || object.type === "arrow") {
      return {
        x: Math.min(object.x1, object.x2),
        y: Math.min(object.y1, object.y2),
        width: Math.max(Math.abs(object.x2 - object.x1), MIN_SHAPE_SIZE),
        height: Math.max(Math.abs(object.y2 - object.y1), MIN_SHAPE_SIZE),
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
      width: Math.max(bounds.width + pad * 2, MIN_FRAME),
      height: Math.max(bounds.height + pad * 2, MIN_FRAME),
    };
  }

  function getCenterFromBounds(bounds) {
    return {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };
  }

  function getCenter(object) {
    return getCenterFromBounds(getLocalBounds(object));
  }

  function rotateAround(point, center, angle) {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos,
    };
  }

  function worldToLocal(point, center, rotation) {
    return rotateAround(point, center, -(rotation || 0));
  }

  function localToWorld(point, center, rotation) {
    return rotateAround(point, center, rotation || 0);
  }

  function handlePositions(frame, center, object) {
    const handles = {
      nw: { x: frame.x, y: frame.y },
      ne: { x: frame.x + frame.width, y: frame.y },
      sw: { x: frame.x, y: frame.y + frame.height },
      se: { x: frame.x + frame.width, y: frame.y + frame.height },
      rotate: { x: center.x, y: frame.y - viewLen(ROTATE_OFFSET) },
    };
    if (object && (isTextLike(object) || isTable(object))) {
      handles.e = { x: frame.x + frame.width, y: center.y };
      handles.w = { x: frame.x, y: center.y };
    }
    if (object && isTable(object)) {
      handles.n = { x: center.x, y: frame.y };
      handles.s = { x: center.x, y: frame.y + frame.height };
    }
    if (object && isImage(object) && state.cropping) {
      handles.n = { x: center.x, y: frame.y };
      handles.s = { x: center.x, y: frame.y + frame.height };
      handles.e = { x: frame.x + frame.width, y: center.y };
      handles.w = { x: frame.x, y: center.y };
    }
    return handles;
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

  function pointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
      const a = polygon[i];
      const b = polygon[j];
      const intersect =
        a.y > point.y !== b.y > point.y &&
        point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y || Number.EPSILON) + a.x;
      if (intersect) {
        inside = !inside;
      }
    }
    return inside;
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

  function trianglePoints(shape) {
    return [
      { x: shape.x + shape.width / 2, y: shape.y },
      { x: shape.x, y: shape.y + shape.height },
      { x: shape.x + shape.width, y: shape.y + shape.height },
    ];
  }

  function drawTriangle(shape) {
    const [a, b, c] = trianglePoints(shape);
    ctx.save();
    configureShape(shape);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.closePath();
    paintClosedPath(shape);
    ctx.restore();
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

  function drawArrow(shape) {
    const head = arrowHeadPoints(shape);
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

  function objectFontFamily(object) {
    return FONT_STACKS[object && object.fontKey] || FONT_FAMILY;
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
    const indent = Math.max(0, object.indent || 0) * INDENT_STEP;
    const list = object.list && object.list !== "none" ? LIST_GUTTER : 0;
    return indent + list;
  }

  function textPad(object) {
    return object && object.pad != null ? object.pad : TEXT_PAD;
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
    const minHeight = object.type === "sticky" ? STICKY_DEFAULT.height : 40;
    return Math.max(minHeight, height);
  }

  function reflowTextHeight(object) {
    if (!isTextLike(object)) {
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

    const markerX = object.x + textPad(object) + (object.indent || 0) * INDENT_STEP;
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

  function drawSticky(object) {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = object.fill || STICKY_FILL;
    ctx.strokeStyle = "rgb(28 25 23 / 0.08)";
    ctx.lineWidth = 1;
    pathRoundRect(object.x, object.y, object.width, object.height, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    if (state.editingId !== object.id) {
      drawWrappedText(object);
    }
  }

  function drawTextBox(object) {
    if (state.editingId === object.id) {
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
        drawPolygon(shape, polygonPoints(shape));
        break;
      case "arrow":
        drawArrow(shape);
        break;
      default:
        break;
    }
  }

  function drawPicture(object) {
    const asset = getImageAsset(object.imageId);
    if (!asset) {
      ctx.save();
      ctx.fillStyle = "rgb(28 25 23 / 0.08)";
      ctx.fillRect(object.x, object.y, object.width, object.height);
      ctx.restore();
      return;
    }

    const source = imageSourceRect(object, asset);
    const filter = imageFilter(object);
    const radius = Math.max(0, object.radius || 0);
    const opacity = Math.min(1, Math.max(0, object.opacity == null ? 1 : object.opacity));
    const cropping = state.cropping && state.selectedIds.length === 1 && state.selectedIds[0] === object.id;
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
      ctx.strokeStyle = SELECT_COLOR;
      ctx.lineWidth = viewLen(1);
      ctx.setLineDash([viewLen(4), viewLen(3)]);
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
    ctx.strokeStyle = object.color || SELECT_COLOR;
    ctx.lineWidth = Math.max(1, object.size || 2);
    pathRoundRect(object.x, object.y, object.width, object.height, radius);
    ctx.fill();
    ctx.stroke();

    applyTextMeasure({ ...object, fontSize: object.fontSize || 16 });
    ctx.fillStyle = object.color || SELECT_COLOR;
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
    ctx.strokeStyle = object.color || SELECT_COLOR;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    if ("letterSpacing" in ctx) {
      ctx.letterSpacing = "0px";
    }
  }

  function drawTable(object) {
    const layout = tableLayout(object);
    const editing =
      state.editingId === object.id && state.editingCell
        ? state.editingCell
        : null;
    const sel = selectedTable() === object && !editing ? getTableSelection() : null;

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
        const rect = tableCellRect(object, r, c);
        if (!rect) {
          continue;
        }
        if (cell.fill) {
          ctx.fillStyle = cell.fill;
          ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        }
        if (sel && r <= sel.r2 && r + Math.max(1, cell.rowspan || 1) - 1 >= sel.r1 && c <= sel.c2 && c + Math.max(1, cell.colspan || 1) - 1 >= sel.c1) {
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
        const origin = tableOrigin(object, r, i);
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
        const origin = tableOrigin(object, i, c);
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
        const rect = tableCellRect(object, r, c);
        if (!rect || !(cell.text || "").length) {
          continue;
        }
        drawWrappedText(tableGhost(cell, rect));
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
    ctx.font = `600 13px ${FONT_FAMILY}`;
    const textX = object.x + 52;
    const maxW = Math.max(40, object.width - 64);
    ctx.fillText(truncateCanvasText(object.fileName || "File", maxW), textX, object.y + 14);
    ctx.font = `400 11px ${FONT_FAMILY}`;
    ctx.fillStyle = "#57534e";
    ctx.fillText(truncateCanvasText(object.label || fileKindLabel(object.kind), maxW), textX, object.y + 34);
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
    const flipX = !isImage(object) && object.flipX;
    const flipY = !isImage(object) && object.flipY;
    if (!rotation && !flipX && !flipY) {
      drawObjectUnrotated(object);
      return;
    }

    const center = getCenter(object);
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    ctx.translate(-center.x, -center.y);
    drawObjectUnrotated(object);
    ctx.restore();
  }

  function drawHandleBox(x, y) {
    const half = viewLen(HANDLE_SIZE) / 2;
    ctx.beginPath();
    ctx.rect(x - half, y - half, half * 2, half * 2);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = SELECT_COLOR;
    ctx.lineWidth = viewLen(1.25);
    ctx.fill();
    ctx.stroke();
  }

  function drawHandleCircle(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, viewLen(HANDLE_SIZE) / 2 + viewLen(1), 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = SELECT_COLOR;
    ctx.lineWidth = viewLen(1.25);
    ctx.fill();
    ctx.stroke();
  }

  function drawSingleSelection(object) {
    const frame = getFrame(object);
    const bounds = getLocalBounds(object);
    const center = getCenterFromBounds(bounds);
    const rotation = object.rotation || 0;
    const handles = handlePositions(frame, center, object);

    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);
    ctx.translate(-center.x, -center.y);

    if (object.locked) {
      ctx.strokeStyle = "#e11d48";
      ctx.lineWidth = viewLen(1.5);
      ctx.setLineDash([viewLen(3), viewLen(3)]);
      ctx.strokeRect(frame.x, frame.y, frame.width, frame.height);
      ctx.setLineDash([]);
      ctx.restore();
      return;
    }

    ctx.strokeStyle = SELECT_COLOR;
    ctx.lineWidth = viewLen(1);
    ctx.setLineDash([viewLen(5), viewLen(4)]);
    ctx.strokeRect(frame.x, frame.y, frame.width, frame.height);
    ctx.setLineDash([]);

    if (!(isImage(object) && state.cropping)) {
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

  function worldCorners(object) {
    const frame = getFrame(object);
    const center = getCenter(object);
    const rotation = object.rotation || 0;
    return [
      { x: frame.x, y: frame.y },
      { x: frame.x + frame.width, y: frame.y },
      { x: frame.x + frame.width, y: frame.y + frame.height },
      { x: frame.x, y: frame.y + frame.height },
    ].map((point) => localToWorld(point, center, rotation));
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

  function boundsIntersect(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  function getViewportWorldBounds(padding = 64) {
    const p1 = screenToWorld({ x: 0, y: 0 });
    const p2 = screenToWorld({ x: canvas.clientWidth, y: canvas.clientHeight });
    const minX = Math.min(p1.x, p2.x) - padding;
    const minY = Math.min(p1.y, p2.y) - padding;
    const maxX = Math.max(p1.x, p2.x) + padding;
    const maxY = Math.max(p1.y, p2.y) + padding;
    return {
      x: minX,
      y: minY,
      width: Math.max(maxX - minX, 0),
      height: Math.max(maxY - minY, 0),
    };
  }

  function unionBounds(list) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const bounds of list) {
      minX = Math.min(minX, bounds.x);
      minY = Math.min(minY, bounds.y);
      maxX = Math.max(maxX, bounds.x + bounds.width);
      maxY = Math.max(maxY, bounds.y + bounds.height);
    }
    return {
      x: minX,
      y: minY,
      width: Math.max(maxX - minX, 0),
      height: Math.max(maxY - minY, 0),
    };
  }

  function drawGroupSelection(objects) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const object of objects) {
      for (const corner of worldCorners(object)) {
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
    ctx.strokeStyle = allLocked ? "#e11d48" : SELECT_COLOR;
    ctx.lineWidth = viewLen(allLocked ? 1.5 : 1);
    ctx.setLineDash(allLocked ? [viewLen(3), viewLen(3)] : [viewLen(5), viewLen(4)]);
    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
    ctx.restore();
  }

  function drawSelectionOverlay() {
    if (state.editingId) {
      return;
    }

    const selected = selectedObjects();
    if (selected.length === 1) {
      drawSingleSelection(selected[0]);
      return;
    }

    if (selected.length > 1) {
      drawGroupSelection(selected);
    }
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
      target.strokeStyle = hexLuminance(color) < 0.4 ? "rgb(252 165 165 / 0.7)" : "#e11d48";
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
    const page = currentPage();
    if (!page) {
      return;
    }

    const surface = pageSurface(page);

    ctx.save();
    ctx.shadowColor = "rgb(28 25 23 / 0.16)";
    ctx.shadowBlur = viewLen(18);
    ctx.shadowOffsetY = viewLen(4);
    ctx.fillStyle = surface.paperColor;
    ctx.fillRect(0, 0, page.width, page.height);
    ctx.shadowColor = "transparent";
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, page.width, page.height);
    ctx.clip();
    drawPagePattern(ctx, page.width, page.height, surface, viewLen);
    ctx.restore();
    ctx.strokeStyle = hexLuminance(surface.paperColor) < 0.35 ? "rgb(255 255 255 / 0.14)" : "rgb(28 25 23 / 0.1)";
    ctx.lineWidth = viewLen(1);
    ctx.strokeRect(0, 0, page.width, page.height);
    ctx.restore();
  }

  function redraw() {
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#e4dfd6";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.setTransform(
      state.dpr * state.zoom,
      0,
      0,
      state.dpr * state.zoom,
      state.panX * state.dpr,
      state.panY * state.dpr
    );

    drawPageSheet();
    drawGridOverlay();

    const viewportBounds = getViewportWorldBounds(64);
    const hasManyObjects = state.objects.length > 20;

    for (const object of state.objects) {
      if (!object.hidden) {
        if (hasManyObjects && !state.selectedIds.includes(object.id)) {
          const objBounds = objectWorldBounds(object);
          if (!boundsIntersect(objBounds, viewportBounds)) {
            continue;
          }
        }
        drawObject(object);
      }
    }

    if (state.preview) {
      drawShape(state.preview);
    }

    if (state.active && state.active.kind === "marquee") {
      drawMarquee(normalizedBounds(state.active.start, state.active.point));
    }

    if (state.active && state.active.kind === "lasso") {
      drawLasso(state.active.points);
    }

    drawGuides();
    drawMeasureOverlay();
    drawSelectionOverlay();
    drawScreenTeaching();
    drawRemoteCursors();
    paintCurrentPageThumb();
  }

  function drawMarquee(bounds) {
    if (bounds.width < 1 && bounds.height < 1) {
      return;
    }

    ctx.save();
    ctx.fillStyle = "rgb(15 118 110 / 0.08)";
    ctx.strokeStyle = SELECT_COLOR;
    ctx.lineWidth = viewLen(1);
    ctx.setLineDash([viewLen(4), viewLen(3)]);
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
    ctx.strokeStyle = SELECT_COLOR;
    ctx.lineWidth = viewLen(1);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.setLineDash([viewLen(4), viewLen(3)]);
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

  function drawGridOverlay() {
    if (!state.showGrid) {
      return;
    }
    const page = currentPage();
    if (!page) {
      return;
    }
    const step = gridStep();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, page.width, page.height);
    ctx.clip();
    ctx.strokeStyle = "rgb(15 118 110 / 0.28)";
    ctx.lineWidth = viewLen(1);
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
    if (!state.showGuides) {
      return;
    }
    const page = currentPage();
    const guides = pageGuides();
    if (!page || !guides.length) {
      return;
    }
    ctx.save();
    ctx.strokeStyle = "rgb(220 38 38 / 0.7)";
    ctx.lineWidth = viewLen(1);
    ctx.setLineDash([viewLen(6), viewLen(4)]);
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
    const drag = state.active;
    if (!drag || (drag.kind !== "measure" && drag.kind !== "protractor")) {
      return;
    }
    const start = drag.start;
    const end = drag.point;
    ctx.save();
    ctx.strokeStyle = SELECT_COLOR;
    ctx.fillStyle = SELECT_COLOR;
    ctx.lineWidth = viewLen(1.5);
    ctx.setLineDash([viewLen(4), viewLen(3)]);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(start.x, start.y, viewLen(3), 0, Math.PI * 2);
    ctx.arc(end.x, end.y, viewLen(3), 0, Math.PI * 2);
    ctx.fill();

    if (drag.kind === "protractor") {
      const radius = Math.max(distance(start, end), viewLen(24));
      ctx.beginPath();
      ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgb(15 118 110 / 0.45)";
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(start.x + radius, start.y);
      ctx.lineTo(start.x, start.y);
      ctx.stroke();
    }

    const label = drag.kind === "measure" ? formatLength(distance(start, end)) : formatAngle(start, end);
    ctx.font = `${viewLen(13)}px ${FONT_FAMILY}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#0f766e";
    ctx.fillText(label, (start.x + end.x) / 2, (start.y + end.y) / 2 - viewLen(8));
    ctx.restore();
  }

  function drawScreenTeaching() {
    ctx.save();
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (state.spotlight && state.pointerWorld) {
      const hole = worldToScreen(state.pointerWorld);
      ctx.fillStyle = "rgb(15 18 22 / 0.58)";
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      ctx.arc(hole.x, hole.y, SPOTLIGHT_RADIUS, 0, Math.PI * 2);
      ctx.fill("evenodd");
    }

    if (state.tool === "laser" && state.pointerWorld) {
      for (let i = 0; i < state.laserTrail.length; i += 1) {
        const item = worldToScreen(state.laserTrail[i]);
        const t = (i + 1) / state.laserTrail.length;
        ctx.beginPath();
        ctx.fillStyle = `rgb(220 38 38 / ${0.12 + t * 0.35})`;
        ctx.arc(item.x, item.y, 5 + t * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      const tip = worldToScreen(state.pointerWorld);
      ctx.beginPath();
      ctx.fillStyle = "rgb(220 38 38 / 0.95)";
      ctx.arc(tip.x, tip.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgb(255 255 255 / 0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    if (state.showRulers) {
      drawRulers(width, height);
    }

    ctx.restore();
  }

  function drawRulers(width, height) {
    ctx.fillStyle = "rgb(250 248 245 / 0.94)";
    ctx.fillRect(0, 0, width, RULER_SIZE);
    ctx.fillRect(0, 0, RULER_SIZE, height);
    ctx.strokeStyle = "rgb(28 25 23 / 0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, RULER_SIZE);
    ctx.lineTo(width, RULER_SIZE);
    ctx.moveTo(RULER_SIZE, 0);
    ctx.lineTo(RULER_SIZE, height);
    ctx.stroke();
    ctx.fillStyle = "rgb(120 113 108)";
    ctx.font = "10px " + FONT_FAMILY;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const step = Math.max(gridStep(), 20);
    const page = currentPage();
    if (!page) {
      return;
    }
    for (let x = 0; x <= page.width; x += step) {
      const screen = worldToScreen({ x, y: 0 });
      if (screen.x < RULER_SIZE || screen.x > width) {
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(screen.x, RULER_SIZE);
      ctx.lineTo(screen.x, RULER_SIZE - (x % (step * 5) === 0 ? 10 : 6));
      ctx.stroke();
      if (x % (step * 5) === 0) {
        ctx.fillText(String(Math.round(x)), screen.x, 3);
      }
    }
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let y = 0; y <= page.height; y += step) {
      const screen = worldToScreen({ x: 0, y });
      if (screen.y < RULER_SIZE || screen.y > height) {
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(RULER_SIZE, screen.y);
      ctx.lineTo(RULER_SIZE - (y % (step * 5) === 0 ? 10 : 6), screen.y);
      ctx.stroke();
      if (y % (step * 5) === 0) {
        ctx.fillText(String(Math.round(y)), RULER_SIZE - 4, screen.y);
      }
    }
    ctx.fillStyle = "rgb(250 248 245 / 0.94)";
    ctx.fillRect(0, 0, RULER_SIZE, RULER_SIZE);
  }

  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const rect = wrap.getBoundingClientRect();
    const nextDpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const nextWidth = Math.round(width * nextDpr);
    const nextHeight = Math.round(height * nextDpr);

    if (
      canvas.width === nextWidth &&
      canvas.height === nextHeight &&
      state.dpr === nextDpr
    ) {
      return;
    }

    state.dpr = nextDpr;
    canvas.width = nextWidth;
    canvas.height = nextHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    redraw();
  }

  function distToSegment(point, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length2 = dx * dx + dy * dy;
    if (length2 === 0) {
      return distance(point, a);
    }

    const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / length2));
    return distance(point, { x: a.x + t * dx, y: a.y + t * dy });
  }

  function pointInTriangle(point, a, b, c) {
    const sign = (p1, p2, p3) => (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    const d1 = sign(point, a, b);
    const d2 = sign(point, b, c);
    const d3 = sign(point, c, a);
    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNeg && hasPos);
  }

  function pointInBounds(point, x, y, width, height) {
    return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
  }

  function hitObjectAtLocal(object, point) {
    const tolerance = Math.max(viewLen(HIT_PADDING), (object.size || 4) / 2 + viewLen(3));

    if (object.type === "stroke") {
      const points = object.points;
      if (points.length === 1) {
        return distance(point, points[0]) <= tolerance;
      }
      for (let i = 1; i < points.length; i += 1) {
        if (distToSegment(point, points[i - 1], points[i]) <= tolerance) {
          return true;
        }
      }
      return false;
    }

    if (object.type === "line") {
      return distToSegment(point, { x: object.x1, y: object.y1 }, { x: object.x2, y: object.y2 }) <= tolerance;
    }

    if (object.type === "arrow") {
      const head = arrowHeadPoints(object);
      if (
        distToSegment(point, { x: object.x1, y: object.y1 }, { x: object.x2, y: object.y2 }) <=
        tolerance
      ) {
        return true;
      }
      return Boolean(head && pointInTriangle(point, head.tip, head.left, head.right));
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
      return Boolean(polygon && pointInPolygon(point, polygon));
    }

    return pointInBounds(point, object.x, object.y, object.width, object.height);
  }

  function objectLocalPoint(object, point) {
    const center = getCenter(object);
    const local = worldToLocal(point, center, object.rotation || 0);
    if (isImage(object) || (!object.flipX && !object.flipY)) {
      return local;
    }
    return {
      x: center.x + (local.x - center.x) * (object.flipX ? -1 : 1),
      y: center.y + (local.y - center.y) * (object.flipY ? -1 : 1),
    };
  }

  function hitObject(point) {
    for (let i = state.objects.length - 1; i >= 0; i -= 1) {
      const object = state.objects[i];
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
    if (state.selectedIds.length !== 1) {
      return null;
    }

    const object = findObject(state.selectedIds[0]);
    if (!object || object.locked) {
      return null;
    }

    const frame = getFrame(object);
    const bounds = getLocalBounds(object);
    const center = getCenterFromBounds(bounds);
    const local = worldToLocal(point, center, object.rotation || 0);
    const handles = handlePositions(frame, center, object);
    const order =
      isImage(object) && state.cropping
        ? ["nw", "ne", "sw", "se", "n", "s", "e", "w"]
        : isTable(object)
          ? ["rotate", "nw", "ne", "sw", "se", "n", "s", "e", "w"]
          : isTextLike(object)
            ? ["rotate", "nw", "ne", "sw", "se", "e", "w"]
            : ["rotate", "nw", "ne", "sw", "se"];

    for (const name of order) {
      if (handles[name] && distance(local, handles[name]) <= viewLen(HANDLE_HIT)) {
        return name;
      }
    }

    return null;
  }

  function snapshotPages() {
    return state.pages.map((page) => ({
      id: page.id,
      name: page.name,
      preset: page.preset,
      orientation: page.orientation,
      width: page.width,
      height: page.height,
      surface: pageSurface(page),
      objects: cloneData(page.id === state.currentPageId ? state.objects : page.objects),
    }));
  }

  function cloneBoard() {
    return {
      pages: snapshotPages(),
      currentPageId: state.currentPageId,
      nextId: state.nextId,
      nextPageId: state.nextPageId,
      selectedIds: [...state.selectedIds],
    };
  }

  function restoreBoard(snapshot) {
    rememberCamera();
    const cameras = new Map(
      state.pages.map((page) => [page.id, { zoom: page.zoom, panX: page.panX, panY: page.panY }])
    );
    cameras.set(state.currentPageId, { zoom: state.zoom, panX: state.panX, panY: state.panY });
    const guidesByPage = new Map(state.pages.map((page) => [page.id, cloneData(page.guides || [])]));

    state.pages = snapshot.pages.map((page) => {
      const camera = cameras.get(page.id) || { zoom: 1, panX: 0, panY: 0 };
      return {
        ...cloneData(page),
        zoom: camera.zoom,
        panX: camera.panX,
        panY: camera.panY,
        guides: guidesByPage.get(page.id) || cloneData(page.guides) || [],
      };
    });
    state.nextId = snapshot.nextId;
    state.nextPageId = snapshot.nextPageId;
    const page = state.pages.find((item) => item.id === snapshot.currentPageId) || state.pages[0];
    attachPage(page);
    state.selectedIds = snapshot.selectedIds.filter((id) =>
      state.objects.some((object) => object.id === id)
    );
    redraw();
    syncEditUI();
    syncPageUI();
    syncImageUI();
    syncLinkUI();
    syncLayersUI();
  }

  function captureBefore() {
    state.historyBefore = cloneBoard();
  }

  function boardsEqual(a, b) {
    return a.currentPageId === b.currentPageId && JSON.stringify(a.pages) === JSON.stringify(b.pages);
  }

  function pruneUnusedImageAssets() {
    if (imageAssets.size === 0) return;
    const activeAssetIds = new Set();
    for (const page of state.pages) {
      const list = page.id === state.currentPageId ? state.objects : page.objects || [];
      for (const obj of list) {
        if (obj && obj.assetId) activeAssetIds.add(obj.assetId);
      }
    }
    for (const snap of state.past) {
      if (snap && Array.isArray(snap.pages)) {
        for (const page of snap.pages) {
          for (const obj of (page.objects || [])) {
            if (obj && obj.assetId) activeAssetIds.add(obj.assetId);
          }
        }
      }
    }
    for (const key of imageAssets.keys()) {
      if (!activeAssetIds.has(key)) {
        imageAssets.delete(key);
      }
    }
  }

  function commitIfChanged() {
    if (!state.historyBefore) {
      return;
    }

    const current = cloneBoard();
    if (boardsEqual(state.historyBefore, current)) {
      state.historyBefore = null;
      return;
    }

    state.past.push(state.historyBefore);
    if (state.past.length > MAX_HISTORY) {
      state.past.shift();
    }
    pruneUnusedImageAssets();
    state.future = [];
    state.historyBefore = null;
    syncEditUI();
    syncLayersUI();
    scheduleAutosave();
    collabBroadcastCurrentPageObjects();
  }

  function discardHistoryCapture() {
    state.historyBefore = null;
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
    const surface = pageSurface(page);
    thumb.fillStyle = surface.paperColor;
    thumb.strokeStyle = hexLuminance(surface.paperColor) < 0.35 ? "rgb(255 255 255 / 0.18)" : "rgb(28 25 23 / 0.12)";
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

    const objects = page.id === state.currentPageId ? state.objects : page.objects;
    thumb.save();
    thumb.beginPath();
    thumb.rect(ox, oy, pw, ph);
    thumb.clip();
    thumb.translate(ox, oy);
    thumb.scale(scale, scale);
    for (const object of objects) {
      if (!isSelectable(object)) {
        continue;
      }
      const bounds = objectWorldBounds(object);
      thumb.fillStyle = hexLuminance(surface.paperColor) < 0.35 ? "rgb(255 255 255 / 0.45)" : "rgb(28 25 23 / 0.22)";
      thumb.fillRect(bounds.x, bounds.y, Math.max(bounds.width, 6), Math.max(bounds.height, 6));
    }
    thumb.restore();
  }

  function paintCurrentPageThumb() {
    if (!pageThumbs) {
      return;
    }
    const button = pageThumbs.querySelector(`[data-page-id="${state.currentPageId}"]`);
    const page = currentPage();
    if (!button || !page) {
      return;
    }
    paintThumb(button.querySelector("canvas"), page);
  }

  function renderPageThumbs() {
    const key = state.pages.map((page) => page.id).join(",");
    if (key !== state.pageThumbKey) {
      state.pageThumbKey = key;
      pageThumbs.replaceChildren();
      for (const page of state.pages) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "page-thumb";
        button.dataset.pageId = page.id;
        button.draggable = true;
        button.setAttribute("role", "tab");
        const canvasEl = document.createElement("canvas");
        canvasEl.setAttribute("aria-hidden", "true");
        button.appendChild(canvasEl);
        pageThumbs.appendChild(button);
      }
    }

    for (const button of pageThumbs.querySelectorAll(".page-thumb")) {
      const page = state.pages.find((item) => item.id === button.dataset.pageId);
      if (!page) {
        continue;
      }
      button.title = page.name;
      button.setAttribute("aria-label", page.name);
      button.setAttribute("aria-current", page.id === state.currentPageId ? "true" : "false");
      paintThumb(button.querySelector("canvas"), page);
    }
  }

  function syncPageUI() {
    const page = currentPage();
    if (!page) {
      return;
    }

    const index = currentPageIndex();
    pageStatus.textContent = `${page.name} (${index + 1} of ${state.pages.length})`;
    pageDeleteBtn.disabled = state.pages.length <= 1;

    if (document.activeElement !== pageNameInput) {
      pageNameInput.value = page.name;
    }
    if (document.activeElement !== pageWidthInput) {
      pageWidthInput.value = String(page.width);
    }
    if (document.activeElement !== pageHeightInput) {
      pageHeightInput.value = String(page.height);
    }

    for (const button of toolbar.querySelectorAll("[data-page-preset]")) {
      button.setAttribute("aria-pressed", String(button.dataset.pagePreset === page.preset));
    }
    for (const button of toolbar.querySelectorAll("[data-page-orientation]")) {
      button.setAttribute("aria-pressed", String(button.dataset.pageOrientation === page.orientation));
    }

    const surface = pageSurface(page);
    page.surface = surface;
    for (const button of toolbar.querySelectorAll("[data-page-mode]")) {
      button.setAttribute("aria-pressed", String(button.dataset.pageMode === surface.mode));
    }
    for (const button of toolbar.querySelectorAll("[data-page-template]")) {
      const group = button.dataset.templateMode;
      button.hidden = surface.mode !== "custom" && group !== surface.mode;
      button.setAttribute("aria-pressed", String(button.dataset.pageTemplate === surface.template));
    }
    if (document.activeElement !== paperColorInput) {
      paperColorInput.value = surface.paperColor;
    }
    if (document.activeElement !== lineColorInput) {
      lineColorInput.value = surface.lineColor;
    }
    if (document.activeElement !== lineSpacingInput) {
      lineSpacingInput.value = String(surface.lineSpacing);
    }
    if (document.activeElement !== gridSizeInput) {
      gridSizeInput.value = String(surface.gridSize);
    }
    if (document.activeElement !== pageMarginInput) {
      pageMarginInput.value = String(surface.margin);
    }

    renderPageThumbs();
    layoutRibbonOverflow();
  }

  function switchPage(id) {
    if (!id || id === state.currentPageId) {
      return;
    }

    const page = state.pages.find((item) => item.id === id);
    if (!page) {
      return;
    }

    finishOpenWork();
    rememberCamera();
    clearSelection();
    attachPage(page);
    redraw();
    syncEditUI();
    syncPageUI();
    syncViewUI();
    scheduleAutosave();
  }

  function addPage() {
    finishOpenWork();
    captureBefore();
    rememberCamera();
    const page = makePage();
    const index = Math.max(currentPageIndex(), 0);
    state.pages.splice(index + 1, 0, page);
    clearSelection();
    attachPage(page);
    commitIfChanged();
    fitCanvas();
    syncPageUI();
    syncViewUI();
  }

  function duplicatePage() {
    const source = currentPage();
    if (!source) {
      return;
    }

    finishOpenWork();
    captureBefore();
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
    state.pages.splice(index + 1, 0, page);
    clearSelection();
    attachPage(page);
    commitIfChanged();
    redraw();
    syncPageUI();
    syncViewUI();
  }

  function deletePage() {
    if (state.pages.length <= 1) {
      return;
    }

    if (!window.confirm("Delete this page? Drawings on it will be removed.")) {
      return;
    }

    finishOpenWork();
    captureBefore();
    const index = currentPageIndex();
    state.pages.splice(index, 1);
    const next = state.pages[Math.min(index, state.pages.length - 1)];
    clearSelection();
    attachPage(next);
    commitIfChanged();
    redraw();
    syncPageUI();
    syncViewUI();
  }

  function renamePage(nextName) {
    const page = currentPage();
    if (!page) {
      return;
    }

    const name = nextName.trim() || page.name;
    if (name === page.name) {
      pageNameInput.value = page.name;
      return;
    }

    captureBefore();
    page.name = name.slice(0, 80);
    commitIfChanged();
    syncPageUI();
  }

  function reorderPage(fromId, toId) {
    if (!fromId || !toId || fromId === toId) {
      return;
    }

    const fromIndex = state.pages.findIndex((page) => page.id === fromId);
    const toIndex = state.pages.findIndex((page) => page.id === toId);
    if (fromIndex < 0 || toIndex < 0) {
      return;
    }

    captureBefore();
    const [page] = state.pages.splice(fromIndex, 1);
    state.pages.splice(toIndex, 0, page);
    commitIfChanged();
    syncPageUI();
  }

  function setPagePreset(preset) {
    const page = currentPage();
    if (!page || !preset) {
      return;
    }

    captureBefore();
    if (preset === "custom") {
      page.preset = "custom";
    } else {
      page.preset = preset;
      const size = pageDimensions(preset, page.orientation);
      page.width = size.width;
      page.height = size.height;
    }
    commitIfChanged();
    redraw();
    syncPageUI();
  }

  function setPageOrientation(orientation) {
    const page = currentPage();
    if (!page || (orientation !== "portrait" && orientation !== "landscape")) {
      return;
    }

    captureBefore();
    if (page.preset === "custom") {
      if (orientation !== page.orientation) {
        const width = page.width;
        page.width = page.height;
        page.height = width;
      }
      page.orientation = orientation;
    } else {
      page.orientation = orientation;
      const size = pageDimensions(page.preset, orientation);
      page.width = size.width;
      page.height = size.height;
    }
    commitIfChanged();
    redraw();
    syncPageUI();
  }

  function setPageMode(mode) {
    const page = currentPage();
    if (!page || (mode !== "teacher" && mode !== "student" && mode !== "custom")) {
      return;
    }

    const surface = pageSurface(page);
    captureBefore();
    if (mode === "teacher" && !TEACHER_TEMPLATES.includes(surface.template)) {
      page.surface = defaultSurface("white");
    } else if (mode === "student" && !STUDENT_TEMPLATES.includes(surface.template)) {
      page.surface = defaultSurface("ruled");
    } else {
      page.surface = { ...surface, mode };
    }
    commitIfChanged();
    redraw();
    syncPageUI();
  }

  function setPageTemplate(template) {
    const page = currentPage();
    if (!page || !PAGE_TEMPLATES[template]) {
      return;
    }

    captureBefore();
    const next = defaultSurface(template);
    if (pageSurface(page).mode === "custom") {
      next.mode = "custom";
    }
    page.surface = next;
    commitIfChanged();
    redraw();
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
      paperColor: paperColorInput.value || surface.paperColor,
      lineColor: lineColorInput.value || surface.lineColor,
      lineSpacing: lineSpacingInput.value,
      gridSize: gridSizeInput.value,
      margin: pageMarginInput.value,
    });
    const same =
      next.paperColor === surface.paperColor &&
      next.lineColor === surface.lineColor &&
      next.lineSpacing === surface.lineSpacing &&
      next.gridSize === surface.gridSize &&
      next.margin === surface.margin;
    if (same && !state.historyBefore) {
      if (commit) {
        syncPageUI();
      }
      return;
    }

    if (!state.historyBefore) {
      captureBefore();
    }
    page.surface = next;
    redraw();
    if (commit) {
      commitIfChanged();
      syncPageUI();
    }
  }

  function applyCustomPageSize(commit) {
    const page = currentPage();
    if (!page) {
      return;
    }

    const width = clampPageSize(pageWidthInput.value, page.width);
    const height = clampPageSize(pageHeightInput.value, page.height);
    const sameSize = width === page.width && height === page.height;
    if (sameSize && !state.historyBefore) {
      if (commit) {
        syncPageUI();
      }
      return;
    }

    if (!state.historyBefore) {
      captureBefore();
    }

    page.preset = "custom";
    page.width = width;
    page.height = height;
    page.orientation = page.width >= page.height ? "landscape" : "portrait";
    redraw();
    if (commit) {
      commitIfChanged();
      syncPageUI();
    } else {
      for (const button of toolbar.querySelectorAll("[data-page-preset]")) {
        button.setAttribute("aria-pressed", String(button.dataset.pagePreset === "custom"));
      }
      for (const button of toolbar.querySelectorAll("[data-page-orientation]")) {
        button.setAttribute("aria-pressed", String(button.dataset.pageOrientation === page.orientation));
      }
    }
  }

  function stepPage(delta) {
    const index = currentPageIndex();
    const next = state.pages[index + delta];
    if (next) {
      switchPage(next.id);
    }
  }

  const DB_NAME = "drawora_db";
  const DB_VERSION = 1;
  const STORE_NAME = "boards";
  const LS_FALLBACK_KEY = "drawora_boards_fallback";
  const LS_ACTIVE_BOARD_KEY = "drawora_active_board";
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
          if (idx >= 0) list[idx] = record; else list.push(record);
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

  function formatRelativeTime(timestamp) {
    if (!timestamp) return "Never";
    const diff = Date.now() - timestamp;
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return "Just now";
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function drawThumbObject(target, object) {
    target.save();
    if (object.rotation) {
      const center = getCenter(object);
      target.translate(center.x, center.y);
      target.rotate(object.rotation);
      target.translate(-center.x, -center.y);
    }
    if (object.type === "stroke") {
      target.strokeStyle = object.color || "#0f172a";
      target.lineWidth = Math.max(object.size || 2, 2);
      target.lineCap = "round";
      target.lineJoin = "round";
      if (object.points && object.points.length > 0) {
        target.beginPath();
        target.moveTo(object.points[0].x, object.points[0].y);
        for (let i = 1; i < object.points.length; i++) {
          target.lineTo(object.points[i].x, object.points[i].y);
        }
        target.stroke();
      }
    } else if (object.type === "rect" || object.type === "roundrect") {
      target.fillStyle = object.fill || "transparent";
      target.strokeStyle = object.stroke || "#0f172a";
      target.lineWidth = Math.max(object.strokeSize || 1, 1);
      if (object.fill) target.fillRect(object.x, object.y, object.width, object.height);
      target.strokeRect(object.x, object.y, object.width, object.height);
    } else if (object.type === "ellipse") {
      target.fillStyle = object.fill || "transparent";
      target.strokeStyle = object.stroke || "#0f172a";
      target.lineWidth = Math.max(object.strokeSize || 1, 1);
      target.beginPath();
      target.ellipse(
        object.x + object.width / 2,
        object.y + object.height / 2,
        Math.abs(object.width / 2),
        Math.abs(object.height / 2),
        0,
        0,
        Math.PI * 2
      );
      if (object.fill) target.fill();
      target.stroke();
    } else if (object.type === "text" || object.type === "sticky") {
      if (object.type === "sticky") {
        target.fillStyle = object.fill || "#fef08a";
        target.fillRect(object.x, object.y, object.width, object.height);
      }
      target.fillStyle = object.color || "#0f172a";
      target.font = `bold ${Math.max(object.fontSize || 16, 12)}px sans-serif`;
      const text = String(object.text || "").split("\n")[0] || "";
      target.fillText(text.slice(0, 24), object.x + 6, object.y + 18, object.width - 12);
    } else if (object.type === "table") {
      target.strokeStyle = object.stroke || "#0f172a";
      target.lineWidth = 1;
      target.strokeRect(object.x, object.y, object.width, object.height);
      const cols = (object.colW || []).length || 3;
      const rows = (object.rowH || []).length || 3;
      for (let c = 1; c < cols; c++) {
        const cx = object.x + (object.width / cols) * c;
        target.beginPath();
        target.moveTo(cx, object.y);
        target.lineTo(cx, object.y + object.height);
        target.stroke();
      }
      for (let r = 1; r < rows; r++) {
        const ry = object.y + (object.height / rows) * r;
        target.beginPath();
        target.moveTo(object.x, ry);
        target.lineTo(object.x + object.width, ry);
        target.stroke();
      }
    } else {
      const bounds = getLocalBounds(object);
      target.fillStyle = object.fill || "rgba(15, 118, 110, 0.25)";
      target.strokeStyle = object.stroke || "#0f766e";
      target.lineWidth = 1;
      target.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      target.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }
    target.restore();
  }

  function generateBoardThumbnail(pages, currentPageId, width = 240, height = 150) {
    try {
      const thumbCanvas = document.createElement("canvas");
      thumbCanvas.width = width;
      thumbCanvas.height = height;
      const tctx = thumbCanvas.getContext("2d");
      if (!tctx) return "";

      tctx.fillStyle = "#e7e5e4";
      tctx.fillRect(0, 0, width, height);

      const targetPage = (pages && pages.find((p) => p.id === currentPageId)) || (pages && pages[0]);
      if (!targetPage) return thumbCanvas.toDataURL("image/webp", 0.85);

      const pad = 12;
      const availW = width - pad * 2;
      const availH = height - pad * 2;
      const scale = Math.min(availW / targetPage.width, availH / targetPage.height);
      const pw = targetPage.width * scale;
      const ph = targetPage.height * scale;
      const ox = (width - pw) / 2;
      const oy = (height - ph) / 2;
      const surface = pageSurface(targetPage);

      tctx.shadowColor = "rgba(0, 0, 0, 0.12)";
      tctx.shadowBlur = 8;
      tctx.shadowOffsetY = 2;
      tctx.fillStyle = surface.paperColor || "#ffffff";
      tctx.fillRect(ox, oy, pw, ph);
      tctx.shadowColor = "transparent";

      tctx.save();
      tctx.beginPath();
      tctx.rect(ox, oy, pw, ph);
      tctx.clip();
      tctx.translate(ox, oy);
      tctx.scale(scale, scale);

      drawPagePattern(tctx, targetPage.width, targetPage.height, surface, (pixels) => pixels / scale);

      const pageObjects = targetPage.id === state.currentPageId ? state.objects : targetPage.objects || [];
      for (const object of pageObjects) {
        if (!object || object.hidden) continue;
        drawThumbObject(tctx, object);
      }

      tctx.restore();

      tctx.strokeStyle = "rgba(0,0,0,0.12)";
      tctx.lineWidth = 1;
      tctx.strokeRect(ox, oy, pw, ph);

      return thumbCanvas.toDataURL("image/webp", 0.85);
    } catch {
      return "";
    }
  }

  function updateSaveStatus(text, kind = "") {
    if (!saveStatus) return;
    saveStatus.textContent = text;
    saveStatus.className = "save-status" + (kind ? ` is-${kind}` : "");
  }

  function scheduleAutosave(immediate = false) {
    if (!state.boardId) return;
    updateSaveStatus("Saving...", "saving");
    if (state.autosaveTimer) {
      clearTimeout(state.autosaveTimer);
      state.autosaveTimer = null;
    }
    const execute = async () => {
      try {
        const snapshot = cloneBoard();
        const thumbnail = generateBoardThumbnail(state.pages, state.currentPageId);
        const record = {
          id: state.boardId,
          name: state.boardName || "Untitled Board",
          createdAt: state.boardCreatedAt || Date.now(),
          updatedAt: Date.now(),
          pageCount: state.pages.length,
          thumbnail,
          snapshot,
        };
        await dbSaveBoard(record);
        try {
          localStorage.setItem(LS_ACTIVE_BOARD_KEY, state.boardId);
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
      state.autosaveTimer = setTimeout(execute, 400);
    }
  }

  async function createNewBoard(customName = null) {
    if (state.boardId) {
      await scheduleAutosave(true);
    }
    finishOpenWork();
    clearSelection();
    state.past = [];
    state.future = [];
    state.historyBefore = null;

    const newId = createId();
    const newName = customName || "Untitled Board";
    const firstPage = makePage({ name: "Page 1", preset: "a4", orientation: "portrait" });

    state.boardId = newId;
    state.boardName = newName;
    state.boardCreatedAt = Date.now();
    state.pages = [firstPage];
    attachPage(firstPage);

    boardTitleInput.value = newName;
    resetView();
    fitCanvas();
    syncEditUI();
    syncPageUI();
    syncLayersUI();
    closeProjectsDialog();
    await scheduleAutosave(true);
  }

  async function openBoard(id) {
    if (!id || id === state.boardId) {
      closeProjectsDialog();
      return;
    }
    if (state.boardId) {
      await scheduleAutosave(true);
    }
    const record = await dbGetBoard(id);
    if (!record || !record.snapshot) {
      return;
    }
    finishOpenWork();
    clearSelection();
    state.past = [];
    state.future = [];
    state.historyBefore = null;

    state.boardId = record.id;
    state.boardName = record.name || "Untitled Board";
    state.boardCreatedAt = record.createdAt || Date.now();
    boardTitleInput.value = state.boardName;

    restoreBoard(record.snapshot);
    try {
      localStorage.setItem(LS_ACTIVE_BOARD_KEY, state.boardId);
    } catch {}

    fitCanvas();
    syncEditUI();
    syncPageUI();
    syncLayersUI();
    updateSaveStatus("Saved", "");
    closeProjectsDialog();
  }

  async function duplicateBoard(id = null) {
    const targetId = id || state.boardId;
    if (!targetId) return;
    if (targetId === state.boardId) {
      await scheduleAutosave(true);
      const snapshot = cloneBoard();
      const newId = createId();
      const newName = `Copy of ${state.boardName}`;
      const newRecord = {
        id: newId,
        name: newName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pageCount: state.pages.length,
        thumbnail: generateBoardThumbnail(state.pages, state.currentPageId),
        snapshot,
      };
      await dbSaveBoard(newRecord);
      await openBoard(newId);
    } else {
      const record = await dbGetBoard(targetId);
      if (!record) return;
      const newId = createId();
      const newName = `Copy of ${record.name || "Untitled Board"}`;
      const newRecord = {
        ...cloneData(record),
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
    openConfirmDialog(
      `Delete "${name}"?`,
      "This board and all its pages will be permanently deleted.",
      "Delete",
      async () => {
        await dbDeleteBoard(id);
        if (id === state.boardId) {
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
  }

  function renameBoard(nextName) {
    const trimmed = (nextName || "").trim().slice(0, 80) || "Untitled Board";
    if (state.boardName === trimmed) {
      boardTitleInput.value = state.boardName;
      return;
    }
    state.boardName = trimmed;
    boardTitleInput.value = trimmed;
    scheduleAutosave(true);
  }

  async function openProjectsDialog() {
    projectsDialog.hidden = false;
    projectsSearch.value = "";
    await renderProjectsList();
    trapModalFocus(projectsDialog);
  }

  function closeProjectsDialog() {
    projectsDialog.hidden = true;
    releaseModalFocus();
  }

  async function renderProjectsList() {
    const boards = await dbGetAllBoards();
    const query = (projectsSearch.value || "").trim().toLowerCase();
    const filtered = query ? boards.filter((b) => (b.name || "").toLowerCase().includes(query)) : boards;

    projectsCount.textContent = `${boards.length} board${boards.length === 1 ? "" : "s"}`;
    projectsEmpty.hidden = filtered.length > 0;
    projectsGrid.replaceChildren();

    for (const board of filtered) {
      const card = document.createElement("div");
      card.className = "project-card" + (board.id === state.boardId ? " is-active" : "");
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
      if (board.id === state.boardId) {
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
      timeSpan.textContent = formatRelativeTime(board.updatedAt);
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
      projectsGrid.append(card);
    }
  }

  // --- REAL-TIME COLLABORATION MODULE ---
  const COLLAB_LS_NAME_KEY = "drawora_collab_username";
  const COLLAB_LS_COLOR_KEY = "drawora_collab_usercolor";
  const COLLAB_LS_ROLE_KEY = "drawora_collab_userrole";
  const COLLAB_COLORS = ["#0f766e", "#2563eb", "#7c3aed", "#dc2626", "#d97706", "#059669", "#db2777"];

  function isViewer() {
    return state.collabStatus === "connected" && state.collabRole === "viewer";
  }

  function isCollabOwner() {
    return state.collabRole === "owner";
  }

  function setCollabRole(role, notify = true) {
    const valid = ["owner", "editor", "viewer"].includes(role) ? role : "editor";
    state.collabRole = valid;
    try {
      localStorage.setItem(COLLAB_LS_ROLE_KEY, valid);
    } catch {}

    if (collabSelfRole) {
      collabSelfRole.value = valid;
    }

    const appEl = document.querySelector(".app");
    if (valid === "viewer") {
      if (appEl) appEl.classList.add("is-viewer-mode");
      if (viewerModeBanner) viewerModeBanner.hidden = false;
      deselectAll();
      cancelActive();
      if (state.tool !== "pan" && state.tool !== "laser") {
        setTool("pan");
      }
    } else {
      if (appEl) appEl.classList.remove("is-viewer-mode");
      if (viewerModeBanner) viewerModeBanner.hidden = true;
    }

    syncCollabUI();

    if (notify && state.collabRoomId) {
      collabSend({ type: "role-announce", role: valid });
    }
  }

  function getCollabShareUrls(roomId) {
    const clean = (roomId || state.collabRoomId || "default").trim();
    const loc = window.location;
    const base = `${loc.protocol}//${loc.host}${loc.pathname}`;
    return {
      editor: `${base}?room=${encodeURIComponent(clean)}&role=editor`,
      viewer: `${base}?room=${encodeURIComponent(clean)}&role=viewer`,
    };
  }

  function initCollabProfile() {
    if (!state.collabClientId) {
      state.collabClientId = "user_" + Math.random().toString(36).substring(2, 9);
    }
    try {
      const savedName = localStorage.getItem(COLLAB_LS_NAME_KEY);
      if (savedName) state.collabUserName = savedName;
      const savedColor = localStorage.getItem(COLLAB_LS_COLOR_KEY);
      if (savedColor && COLLAB_COLORS.includes(savedColor)) state.collabUserColor = savedColor;
      const savedRole = localStorage.getItem(COLLAB_LS_ROLE_KEY);
      if (savedRole && ["owner", "editor", "viewer"].includes(savedRole)) state.collabRole = savedRole;
    } catch {}
    if (collabUserName) collabUserName.value = state.collabUserName;
    if (collabSelfRole) collabSelfRole.value = state.collabRole;
    syncCollabColorUI();
  }

  function syncCollabColorUI() {
    if (!collabColorSwatches) return;
    for (const swatch of collabColorSwatches.querySelectorAll(".collab-swatch")) {
      const isSelected = swatch.dataset.color === state.collabUserColor;
      swatch.setAttribute("aria-checked", String(isSelected));
    }
  }

  function syncCollabUI() {
    const isConnected = state.collabStatus === "connected";
    const isConnecting = state.collabStatus === "connecting";

    collabStatusDot.dataset.status = state.collabStatus;
    collabDialogStatusDot.dataset.status = state.collabStatus;

    const currentRoom = state.collabRoomId || (collabRoomInput ? collabRoomInput.value : "") || "room-1";
    const shareUrls = getCollabShareUrls(currentRoom);
    if (collabLinkEditor) collabLinkEditor.value = shareUrls.editor;
    if (collabLinkViewer) collabLinkViewer.value = shareUrls.viewer;
    if (collabSelfRole) collabSelfRole.value = state.collabRole;

    if (isConnected) {
      const roleLabel = state.collabRole === "owner" ? "Host" : state.collabRole === "viewer" ? "Viewer" : "Editor";
      collabLabel.textContent = `${state.collabRoomId} (${roleLabel})`;
      collabDialogStatusText.textContent = `Connected to "${state.collabRoomId}" as ${roleLabel}`;
      collabStatusBanner.className = "collab-status-banner is-connected";
      collabConnectBtn.hidden = true;
      collabDisconnectBtn.hidden = false;
      collabPresenceBtn.title = `Connected to room "${state.collabRoomId}" (${roleLabel}) · Click to manage`;
    } else if (isConnecting) {
      collabLabel.textContent = "Connecting...";
      collabDialogStatusText.textContent = `Connecting to room "${state.collabRoomId || ""}"...`;
      collabStatusBanner.className = "collab-status-banner";
      collabConnectBtn.hidden = false;
      collabConnectBtn.disabled = true;
      collabDisconnectBtn.hidden = true;
      collabPresenceBtn.title = "Connecting to collaboration room...";
    } else {
      collabLabel.textContent = "Live Sync";
      collabDialogStatusText.textContent = "Not connected to a room (Offline)";
      collabStatusBanner.className = "collab-status-banner";
      collabConnectBtn.hidden = false;
      collabConnectBtn.disabled = false;
      collabDisconnectBtn.hidden = true;
      collabPresenceBtn.title = "Real-time collaboration & share (Offline) · Click to join room";
    }

    // Render Avatars in Navbar & Participants in Dialog
    collabAvatars.replaceChildren();
    collabParticipantsList.replaceChildren();

    const activeList = [
      {
        id: state.collabClientId,
        name: state.collabUserName || "You",
        color: state.collabUserColor || "#0f766e",
        role: state.collabRole || "editor",
        isSelf: true,
      },
    ];

    if (isConnected) {
      for (const [peerId, peer] of state.collabPeers) {
        if (peer && peer.name) {
          activeList.push({
            id: peerId,
            name: peer.name,
            color: peer.color || "#2563eb",
            role: peer.role || "editor",
            isSelf: false,
          });
        }
      }
    }

    collabParticipantsCount.textContent = `${activeList.length} active`;

    for (const p of activeList) {
      // Navbar avatar chip
      const chip = document.createElement("span");
      chip.className = "collab-avatar-chip";
      chip.style.backgroundColor = p.color;
      chip.textContent = (p.name || "U").charAt(0).toUpperCase();
      const pRoleStr = p.role === "owner" ? "Host" : p.role === "viewer" ? "Viewer" : "Editor";
      chip.title = `${p.name}${p.isSelf ? " (You)" : ""} · ${pRoleStr}`;
      collabAvatars.append(chip);

      // Dialog participant row
      const row = document.createElement("li");
      row.className = "collab-participant-item";

      const dot = document.createElement("span");
      dot.className = "collab-participant-dot";
      dot.style.backgroundColor = p.color;

      const nameSpan = document.createElement("span");
      nameSpan.className = "collab-participant-name";
      nameSpan.textContent = p.name;

      row.append(dot, nameSpan);
      if (p.isSelf) {
        const youBadge = document.createElement("span");
        youBadge.className = "collab-participant-you";
        youBadge.textContent = "You";
        row.append(youBadge);

        const selfBadge = document.createElement("span");
        selfBadge.className = `collab-role-badge is-${state.collabRole}`;
        selfBadge.textContent = state.collabRole.charAt(0).toUpperCase() + state.collabRole.slice(1);
        row.append(selfBadge);
      } else {
        if (isCollabOwner()) {
          const roleSelect = document.createElement("select");
          roleSelect.className = "collab-role-select";
          roleSelect.dataset.peerId = p.id;
          roleSelect.innerHTML = `<option value="editor"${p.role === "editor" ? " selected" : ""}>Editor</option><option value="viewer"${p.role === "viewer" ? " selected" : ""}>Viewer</option>`;
          roleSelect.addEventListener("change", (e) => {
            const newRole = e.target.value;
            p.role = newRole;
            collabSend({
              type: "role-update",
              targetId: p.id,
              role: newRole,
            });
            syncCollabUI();
          });

          const kickBtn = document.createElement("button");
          kickBtn.type = "button";
          kickBtn.className = "collab-kick-btn";
          kickBtn.dataset.peerId = p.id;
          kickBtn.title = `Remove ${p.name} from room`;
          kickBtn.textContent = "×";
          kickBtn.addEventListener("click", () => {
            collabSend({
              type: "kick-user",
              targetId: p.id,
            });
            state.collabPeers.delete(p.id);
            syncCollabUI();
            requestAnimationFrame(redraw);
          });
          row.append(roleSelect, kickBtn);
        } else {
          const roleBadge = document.createElement("span");
          const pRole = p.role || "editor";
          roleBadge.className = `collab-role-badge is-${pRole}`;
          roleBadge.textContent = pRole.charAt(0).toUpperCase() + pRole.slice(1);
          row.append(roleBadge);
        }
      }
      collabParticipantsList.append(row);
    }
  }

  function openShortcutsDialog(activeTab = "keys") {
    if (!shortcutsDialog) return;
    shortcutsDialog.hidden = false;
    setShortcutsTab(activeTab);
    trapModalFocus(shortcutsDialog);
  }

  function closeShortcutsDialog() {
    if (!shortcutsDialog) return;
    shortcutsDialog.hidden = true;
    releaseModalFocus();
  }

  function setShortcutsTab(tabName) {
    if (!shortcutsDialog) return;
    const tabButtons = shortcutsDialog.querySelectorAll(".shortcuts-tab-btn");
    const panels = shortcutsDialog.querySelectorAll(".shortcuts-tab-panel");

    tabButtons.forEach((btn) => {
      const isActive = btn.dataset.tab === tabName;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    panels.forEach((p) => {
      p.hidden = p.id !== `shortcuts-panel-${tabName}`;
    });
  }

  function openCollabDialog() {
    initCollabProfile();
    collabDialog.hidden = false;
    if (state.collabRoomId) {
      collabRoomInput.value = state.collabRoomId;
    } else {
      collabRoomInput.value = collabRoomInput.value || "room-" + Math.random().toString(36).substring(2, 7);
    }
    syncCollabUI();
    trapModalFocus(collabDialog);
  }

  function closeCollabDialog() {
    collabDialog.hidden = true;
    releaseModalFocus();
  }

  function collabSend(payload) {
    if (!state.collabRoomId) return;
    const msg = {
      ...payload,
      roomId: state.collabRoomId,
      senderId: state.collabClientId,
      senderName: state.collabUserName,
      senderColor: state.collabUserColor,
      senderRole: state.collabRole,
      timestamp: Date.now(),
    };
    const json = JSON.stringify(msg);

    // 1. Send via WebSocket if connected
    if (state.collabSocket && state.collabSocket.readyState === WebSocket.OPEN) {
      try {
        state.collabSocket.send(json);
      } catch (err) {
        console.warn("Drawora Collab WS send failed:", err);
      }
    }

    // 2. Also send via BroadcastChannel for local / cross-tab sync
    if (state.collabChannel) {
      try {
        state.collabChannel.postMessage(msg);
      } catch (err) {
        console.warn("Drawora Collab BroadcastChannel send failed:", err);
      }
    }
  }

  function collabSendCursor(point) {
    if (!state.collabRoomId) return;
    const now = Date.now();
    if (now - state.collabLastCursorSent < 35) return;
    state.collabLastCursorSent = now;

    collabSend({
      type: "cursor",
      x: point.x,
      y: point.y,
      pageId: state.currentPageId,
      tool: state.tool,
      laserTrail: state.tool === "laser" ? [...state.laserTrail] : [],
    });
  }

  function collabBroadcastCurrentPageObjects() {
    if (!state.collabRoomId || state.collabSyncInProgress || isViewer()) return;
    collabSend({
      type: "object-upsert",
      pageId: state.currentPageId,
      objects: cloneData(state.objects),
    });
  }

  function collabBroadcastDelete(deletedIds) {
    if (!state.collabRoomId || state.collabSyncInProgress || isViewer() || !deletedIds.length) return;
    collabSend({
      type: "object-delete",
      pageId: state.currentPageId,
      ids: deletedIds,
    });
  }

  function collabBroadcastPages() {
    if (!state.collabRoomId || state.collabSyncInProgress || isViewer()) return;
    collabSend({
      type: "page-sync",
      pages: snapshotPages(),
      currentPageId: state.currentPageId,
    });
  }

  function handleCollabMessage(msg) {
    if (!msg || msg.senderId === state.collabClientId) return;

    if (msg.type === "cursor") {
      const existing = state.collabPeers.get(msg.senderId) || {};
      state.collabPeers.set(msg.senderId, {
        ...existing,
        id: msg.senderId,
        name: msg.senderName || "Collaborator",
        color: msg.senderColor || "#2563eb",
        role: existing.role || msg.senderRole || "editor",
        cursor: {
          x: msg.x,
          y: msg.y,
          pageId: msg.pageId,
          tool: msg.tool,
          laserTrail: msg.laserTrail || [],
          lastSeen: Date.now(),
        },
      });
      requestAnimationFrame(redraw);
      return;
    }

    if (msg.type === "presence-join") {
      state.collabPeers.set(msg.senderId, {
        id: msg.senderId,
        name: msg.senderName || "Collaborator",
        color: msg.senderColor || "#2563eb",
        role: msg.role || msg.senderRole || "editor",
        cursor: null,
      });
      syncCollabUI();

      // Respond with presence-ack so the newcomer knows about us
      collabSend({
        type: "presence-ack",
        recipientId: msg.senderId,
        role: state.collabRole,
      });

      // Also share current board snapshot if we have active content
      if (state.objects.length > 0 || state.pages.length > 1) {
        collabSend({
          type: "board-sync-response",
          recipientId: msg.senderId,
          board: cloneBoard(),
        });
      }
      return;
    }

    if (msg.type === "presence-ack") {
      state.collabPeers.set(msg.senderId, {
        id: msg.senderId,
        name: msg.senderName || "Collaborator",
        color: msg.senderColor || "#2563eb",
        role: msg.role || msg.senderRole || "editor",
        cursor: null,
      });
      syncCollabUI();
      return;
    }

    if (msg.type === "presence-leave") {
      state.collabPeers.delete(msg.senderId);
      syncCollabUI();
      requestAnimationFrame(redraw);
      return;
    }

    if (msg.type === "role-announce") {
      const peer = state.collabPeers.get(msg.senderId);
      if (peer) {
        peer.role = msg.role;
        syncCollabUI();
      }
      return;
    }

    if (msg.type === "role-update") {
      if (msg.targetId === state.collabClientId) {
        setCollabRole(msg.role, false);
      } else {
        const peer = state.collabPeers.get(msg.targetId);
        if (peer) {
          peer.role = msg.role;
          syncCollabUI();
        }
      }
      return;
    }

    if (msg.type === "kick-user") {
      if (msg.targetId === state.collabClientId) {
        collabDisconnect();
        window.alert("You have been removed from the collaboration room by the host.");
      } else {
        state.collabPeers.delete(msg.targetId);
        syncCollabUI();
        requestAnimationFrame(redraw);
      }
      return;
    }

    if (msg.type === "board-sync-request") {
      collabSend({
        type: "board-sync-response",
        recipientId: msg.senderId,
        board: cloneBoard(),
      });
      return;
    }

    if (msg.type === "board-sync-response") {
      if (msg.recipientId && msg.recipientId !== state.collabClientId) return;
      if (msg.board && state.objects.length === 0 && state.pages.length <= 1) {
        state.collabSyncInProgress = true;
        try {
          restoreBoard(msg.board);
        } finally {
          state.collabSyncInProgress = false;
        }
      }
      return;
    }

    if (msg.type === "object-upsert") {
      if (!msg.pageId || !Array.isArray(msg.objects)) return;
      state.collabSyncInProgress = true;
      try {
        if (msg.pageId === state.currentPageId) {
          state.objects = cloneData(msg.objects);
          syncLayersUI();
          redraw();
          scheduleAutosave();
        } else {
          const targetPage = state.pages.find((p) => p.id === msg.pageId);
          if (targetPage) {
            targetPage.objects = cloneData(msg.objects);
            scheduleAutosave();
          }
        }
      } finally {
        state.collabSyncInProgress = false;
      }
      return;
    }

    if (msg.type === "object-delete") {
      if (!msg.pageId || !Array.isArray(msg.ids)) return;
      state.collabSyncInProgress = true;
      try {
        if (msg.pageId === state.currentPageId) {
          state.objects = state.objects.filter((obj) => !msg.ids.includes(obj.id));
          state.selectedIds = state.selectedIds.filter((id) => !msg.ids.includes(id));
          syncLayersUI();
          redraw();
          scheduleAutosave();
        } else {
          const targetPage = state.pages.find((p) => p.id === msg.pageId);
          if (targetPage && Array.isArray(targetPage.objects)) {
            targetPage.objects = targetPage.objects.filter((obj) => !msg.ids.includes(obj.id));
            scheduleAutosave();
          }
        }
      } finally {
        state.collabSyncInProgress = false;
      }
      return;
    }

    if (msg.type === "page-sync") {
      if (!Array.isArray(msg.pages)) return;
      state.collabSyncInProgress = true;
      try {
        const currentActivePage = currentPage();
        state.pages = msg.pages.map((page) => {
          if (currentActivePage && page.id === currentActivePage.id) {
            return { ...page, objects: state.objects };
          }
          return page;
        });
        syncPageUI();
        redraw();
        scheduleAutosave();
      } finally {
        state.collabSyncInProgress = false;
      }
      return;
    }
  }

  function drawRemoteCursors() {
    if (!state.collabPeers || state.collabPeers.size === 0) return;
    const now = Date.now();
    ctx.save();
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

    for (const [peerId, peer] of state.collabPeers) {
      if (!peer || !peer.cursor) continue;
      if (now - (peer.cursor.lastSeen || 0) > 30000) continue;
      if (peer.cursor.pageId && peer.cursor.pageId !== state.currentPageId) continue;

      const pt = worldToScreen({ x: peer.cursor.x, y: peer.cursor.y });
      const color = peer.color || "#0f766e";
      const name = peer.name || "Collaborator";

      // If remote peer is using laser pointer, draw laser trail
      if (peer.cursor.tool === "laser" && Array.isArray(peer.cursor.laserTrail) && peer.cursor.laserTrail.length > 0) {
        for (let i = 0; i < peer.cursor.laserTrail.length; i++) {
          const lItem = worldToScreen(peer.cursor.laserTrail[i]);
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
      ctx.font = "bold 11px " + FONT_FAMILY;
      const textWidth = ctx.measureText(name).width;
      const badgeW = textWidth + 10;
      const badgeH = 18;
      const badgeX = 12;
      const badgeY = 14;

      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
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

  function collabConnect(roomId, forcedRole) {
    const cleanRoom = (roomId || "").trim().toLowerCase().replace(/[^\w-]/g, "") || "room-default";
    if (forcedRole && ["owner", "editor", "viewer"].includes(forcedRole)) {
      setCollabRole(forcedRole, false);
    }

    if (state.collabRoomId === cleanRoom && state.collabStatus === "connected") {
      closeCollabDialog();
      return;
    }

    collabDisconnect();

    state.collabRoomId = cleanRoom;
    state.collabStatus = "connecting";
    syncCollabUI();

    // 1. Setup local / cross-tab BroadcastChannel
    if ("BroadcastChannel" in window) {
      try {
        state.collabChannel = new BroadcastChannel("drawora_collab_" + cleanRoom);
        state.collabChannel.onmessage = (event) => {
          handleCollabMessage(event.data);
        };
      } catch (err) {
        console.warn("Drawora BroadcastChannel setup failed:", err);
      }
    }

    // 2. Setup WebSocket connection (Cloudflare Pages Functions / edge)
    try {
      const loc = window.location;
      if (loc.protocol === "http:" || loc.protocol === "https:") {
        const wsProto = loc.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${wsProto}//${loc.host}/api/room?room=${encodeURIComponent(cleanRoom)}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          state.collabStatus = "connected";
          syncCollabUI();
          collabSend({ type: "presence-join", role: state.collabRole });
          collabSend({ type: "board-sync-request" });
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleCollabMessage(data);
          } catch (err) {
            console.warn("Drawora WS parse error:", err);
          }
        };

        ws.onerror = (err) => {
          console.warn("Drawora WS connection note (using local channel):", err);
          // Still marked connected if BroadcastChannel is working!
          state.collabStatus = state.collabChannel ? "connected" : "offline";
          syncCollabUI();
        };

        ws.onclose = () => {
          if (state.collabRoomId) {
            state.collabStatus = state.collabChannel ? "connected" : "offline";
            syncCollabUI();
          }
        };

        state.collabSocket = ws;
      } else {
        // file:// or non-http environment
        state.collabStatus = "connected";
        syncCollabUI();
        collabSend({ type: "presence-join", role: state.collabRole });
      }
    } catch (err) {
      console.warn("Drawora Collab WS initiation note:", err);
      state.collabStatus = state.collabChannel ? "connected" : "offline";
      syncCollabUI();
    }

    closeCollabDialog();
  }

  function collabDisconnect() {
    if (state.collabRoomId) {
      collabSend({ type: "presence-leave" });
    }
    if (state.collabSocket) {
      try {
        state.collabSocket.close();
      } catch {}
      state.collabSocket = null;
    }
    if (state.collabChannel) {
      try {
        state.collabChannel.close();
      } catch {}
      state.collabChannel = null;
    }
    state.collabRoomId = null;
    state.collabStatus = "offline";
    state.collabPeers.clear();
    setCollabRole("owner", false);
    syncCollabUI();
    requestAnimationFrame(redraw);
  }

  function renderPageToCanvas(page, options = {}) {
    const scale = options.scale || 1;
    const transparent = Boolean(options.transparent);
    const objects = options.objects || (page.id === state.currentPageId ? state.objects : page.objects || []);

    let minX = 0;
    let minY = 0;
    let width = page.width;
    let height = page.height;

    if (options.scope === "selection" && options.bounds) {
      minX = options.bounds.x;
      minY = options.bounds.y;
      width = Math.max(options.bounds.width, 20);
      height = Math.max(options.bounds.height, 20);
    }

    const expCanvas = document.createElement("canvas");
    expCanvas.width = Math.max(1, Math.round(width * scale));
    expCanvas.height = Math.max(1, Math.round(height * scale));
    const ectx = expCanvas.getContext("2d");
    if (!ectx) return expCanvas;

    ectx.scale(scale, scale);
    ectx.translate(-minX, -minY);

    const surface = pageSurface(page);
    if (!transparent) {
      ectx.fillStyle = surface.paperColor || "#ffffff";
      ectx.fillRect(minX, minY, width, height);
      if (options.scope !== "selection") {
        drawPagePattern(ectx, page.width, page.height, surface, (p) => p);
      }
    }

    for (const object of objects) {
      if (!object || object.hidden) continue;
      drawObjectToContext(ectx, object);
    }

    return expCanvas;
  }

  function drawObjectToContext(targetCtx, object) {
    const rotation = object.rotation || 0;
    const flipX = !isImage(object) && object.flipX;
    const flipY = !isImage(object) && object.flipY;
    targetCtx.save();
    if (rotation || flipX || flipY) {
      const center = getCenter(object);
      targetCtx.translate(center.x, center.y);
      targetCtx.rotate(rotation);
      targetCtx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
      targetCtx.translate(-center.x, -center.y);
    }
    drawSingleObjectToContext(targetCtx, object);
    targetCtx.restore();
  }

  function drawSingleObjectToContext(targetCtx, object) {
    if (object.type === "stroke") {
      drawStrokeToContext(targetCtx, object);
    } else if (object.type === "sticky") {
      drawStickyToContext(targetCtx, object);
    } else if (object.type === "text") {
      drawTextBoxToContext(targetCtx, object);
    } else if (object.type === "image") {
      drawPictureToContext(targetCtx, object);
    } else if (object.type === "link") {
      drawLinkToContext(targetCtx, object);
    } else if (object.type === "table") {
      drawTableToContext(targetCtx, object);
    } else if (object.type === "file") {
      drawFileCardToContext(targetCtx, object);
    } else {
      drawShapeToContext(targetCtx, object);
    }
  }

  function drawStrokeToContext(targetCtx, stroke) {
    if (stroke.tool === "eraser") return;
    const points = stroke.points;
    if (!points || points.length === 0) return;
    targetCtx.save();
    targetCtx.strokeStyle = stroke.color || "#0f172a";
    targetCtx.fillStyle = stroke.color || "#0f172a";
    targetCtx.lineWidth = Math.max(stroke.size || 2, 1);
    targetCtx.lineCap = "round";
    targetCtx.lineJoin = "round";
    if (stroke.tool === "highlighter") {
      targetCtx.globalAlpha = 0.35;
      targetCtx.lineWidth = (stroke.size || 16) * 1.5;
    } else if (stroke.tool === "marker") {
      targetCtx.globalAlpha = 0.75;
    }
    if (points.length === 1) {
      targetCtx.beginPath();
      targetCtx.arc(points[0].x, points[0].y, targetCtx.lineWidth / 2, 0, Math.PI * 2);
      targetCtx.fill();
    } else {
      targetCtx.beginPath();
      targetCtx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        targetCtx.lineTo(points[i].x, points[i].y);
      }
      targetCtx.stroke();
    }
    targetCtx.restore();
  }

  function drawStickyToContext(targetCtx, object) {
    targetCtx.save();
    targetCtx.shadowColor = "rgba(0,0,0,0.12)";
    targetCtx.shadowBlur = 6;
    targetCtx.shadowOffsetY = 2;
    targetCtx.fillStyle = object.fill || "#fef08a";
    targetCtx.beginPath();
    targetCtx.roundRect(object.x, object.y, object.width, object.height, 8);
    targetCtx.fill();
    targetCtx.shadowColor = "transparent";
    if (object.stroke && object.strokeSize) {
      targetCtx.strokeStyle = object.stroke;
      targetCtx.lineWidth = object.strokeSize;
      targetCtx.stroke();
    }
    drawWrappedTextToContext(targetCtx, object);
    targetCtx.restore();
  }

  function drawTextBoxToContext(targetCtx, object) {
    targetCtx.save();
    if (object.fill) {
      targetCtx.fillStyle = object.fill;
      targetCtx.fillRect(object.x, object.y, object.width, object.height);
    }
    if (object.stroke && object.strokeSize) {
      targetCtx.strokeStyle = object.stroke;
      targetCtx.lineWidth = object.strokeSize;
      targetCtx.strokeRect(object.x, object.y, object.width, object.height);
    }
    drawWrappedTextToContext(targetCtx, object);
    targetCtx.restore();
  }

  function drawPictureToContext(targetCtx, object) {
    const asset = imageAssets.get(object.assetId);
    if (!asset || !asset.complete) return;
    targetCtx.save();
    if (object.opacity != null && object.opacity < 1) targetCtx.globalAlpha = object.opacity;
    if (object.shadow) {
      targetCtx.shadowColor = "rgba(0,0,0,0.25)";
      targetCtx.shadowBlur = 10;
      targetCtx.shadowOffsetY = 4;
    }
    const sx = object.cropX != null ? object.cropX * asset.naturalWidth : 0;
    const sy = object.cropY != null ? object.cropY * asset.naturalHeight : 0;
    const sw = object.cropW != null ? object.cropW * asset.naturalWidth : asset.naturalWidth;
    const sh = object.cropH != null ? object.cropH * asset.naturalHeight : asset.naturalHeight;
    const r = object.radius || 0;
    if (r > 0) {
      targetCtx.beginPath();
      targetCtx.roundRect(object.x, object.y, object.width, object.height, r);
      targetCtx.clip();
    }
    targetCtx.drawImage(asset, sx, sy, sw, sh, object.x, object.y, object.width, object.height);
    if (object.stroke && object.strokeSize) {
      targetCtx.strokeStyle = object.stroke;
      targetCtx.lineWidth = object.strokeSize;
      targetCtx.strokeRect(object.x, object.y, object.width, object.height);
    }
    targetCtx.restore();
  }

  function drawLinkToContext(targetCtx, object) {
    targetCtx.save();
    targetCtx.fillStyle = object.fill || "rgba(15, 118, 110, 0.08)";
    targetCtx.strokeStyle = object.stroke || "#0f766e";
    targetCtx.lineWidth = 1;
    targetCtx.beginPath();
    targetCtx.roundRect(object.x, object.y, object.width, object.height, 6);
    targetCtx.fill();
    targetCtx.stroke();
    targetCtx.fillStyle = "#0f766e";
    targetCtx.font = `600 ${object.fontSize || 14}px sans-serif`;
    const label = object.text || object.href || "Link";
    targetCtx.fillText(label, object.x + 10, object.y + (object.height / 2) + 5, object.width - 20);
    targetCtx.restore();
  }

  function drawTableToContext(targetCtx, object) {
    targetCtx.save();
    targetCtx.strokeStyle = object.stroke || "#0f172a";
    targetCtx.lineWidth = Math.max(object.strokeSize || 1, 1);
    targetCtx.fillStyle = object.fill || "#ffffff";
    targetCtx.fillRect(object.x, object.y, object.width, object.height);
    targetCtx.strokeRect(object.x, object.y, object.width, object.height);

    const layout = tableLayout(object);
    for (let r = 0; r < object.cells.length; r++) {
      for (let c = 0; c < (object.cells[r] || []).length; c++) {
        const cell = object.cells[r][c];
        if (!cell) continue;
        const rect = tableCellRect(object, r, c, layout);
        if (!rect) continue;
        if (cell.fill) {
          targetCtx.fillStyle = cell.fill;
          targetCtx.fillRect(rect.x, rect.y, rect.width, rect.height);
        }
        targetCtx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        if (cell.text) {
          targetCtx.save();
          targetCtx.beginPath();
          targetCtx.rect(rect.x, rect.y, rect.width, rect.height);
          targetCtx.clip();
          targetCtx.fillStyle = cell.color || "#0f172a";
          const weight = cell.bold ? "bold " : "";
          const style = cell.italic ? "italic " : "";
          targetCtx.font = `${style}${weight}${cell.fontSize || 14}px sans-serif`;
          targetCtx.fillText(cell.text, rect.x + TABLE_PAD, rect.y + 16, rect.width - TABLE_PAD * 2);
          targetCtx.restore();
        }
      }
    }
    targetCtx.restore();
  }

  function drawFileCardToContext(targetCtx, object) {
    targetCtx.save();
    targetCtx.fillStyle = object.fill || "#ffffff";
    targetCtx.strokeStyle = object.stroke || "#d6d3d1";
    targetCtx.lineWidth = 1;
    targetCtx.beginPath();
    targetCtx.roundRect(object.x, object.y, object.width, object.height, 8);
    targetCtx.fill();
    targetCtx.stroke();
    targetCtx.fillStyle = "#0f172a";
    targetCtx.font = `600 13px sans-serif`;
    targetCtx.fillText(object.fileName || "File", object.x + 40, object.y + 24, object.width - 50);
    targetCtx.restore();
  }

  function drawShapeToContext(targetCtx, object) {
    targetCtx.save();
    targetCtx.fillStyle = object.fill || "transparent";
    targetCtx.strokeStyle = object.stroke || "#0f172a";
    targetCtx.lineWidth = Math.max(object.strokeSize || 2, 1);
    if (object.type === "line" || object.type === "arrow") {
      targetCtx.beginPath();
      targetCtx.moveTo(object.x1, object.y1);
      targetCtx.lineTo(object.x2, object.y2);
      targetCtx.stroke();
      if (object.type === "arrow") {
        const headlen = 12;
        const dx = object.x2 - object.x1;
        const dy = object.y2 - object.y1;
        const angle = Math.atan2(dy, dx);
        targetCtx.fillStyle = object.stroke || "#0f172a";
        targetCtx.beginPath();
        targetCtx.moveTo(object.x2, object.y2);
        targetCtx.lineTo(object.x2 - headlen * Math.cos(angle - Math.PI / 6), object.y2 - headlen * Math.sin(angle - Math.PI / 6));
        targetCtx.lineTo(object.x2 - headlen * Math.cos(angle + Math.PI / 6), object.y2 - headlen * Math.sin(angle + Math.PI / 6));
        targetCtx.closePath();
        targetCtx.fill();
      }
      targetCtx.restore();
      return;
    }

    if (object.type === "rect") {
      if (object.fill) targetCtx.fillRect(object.x, object.y, object.width, object.height);
      targetCtx.strokeRect(object.x, object.y, object.width, object.height);
    } else if (object.type === "roundrect") {
      targetCtx.beginPath();
      targetCtx.roundRect(object.x, object.y, object.width, object.height, 12);
      if (object.fill) targetCtx.fill();
      targetCtx.stroke();
    } else if (object.type === "ellipse") {
      targetCtx.beginPath();
      targetCtx.ellipse(
        object.x + object.width / 2,
        object.y + object.height / 2,
        Math.abs(object.width / 2),
        Math.abs(object.height / 2),
        0,
        0,
        Math.PI * 2
      );
      if (object.fill) targetCtx.fill();
      targetCtx.stroke();
    } else if (object.type === "triangle") {
      targetCtx.beginPath();
      targetCtx.moveTo(object.x + object.width / 2, object.y);
      targetCtx.lineTo(object.x + object.width, object.y + object.height);
      targetCtx.lineTo(object.x, object.y + object.height);
      targetCtx.closePath();
      if (object.fill) targetCtx.fill();
      targetCtx.stroke();
    } else if (object.type === "diamond") {
      targetCtx.beginPath();
      targetCtx.moveTo(object.x + object.width / 2, object.y);
      targetCtx.lineTo(object.x + object.width, object.y + object.height / 2);
      targetCtx.lineTo(object.x + object.width / 2, object.y + object.height);
      targetCtx.lineTo(object.x, object.y + object.height / 2);
      targetCtx.closePath();
      if (object.fill) targetCtx.fill();
      targetCtx.stroke();
    } else if (object.type === "star") {
      const cx = object.x + object.width / 2;
      const cy = object.y + object.height / 2;
      const rx = Math.abs(object.width / 2);
      const ry = Math.abs(object.height / 2);
      targetCtx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 1 : 0.45;
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const px = cx + rx * r * Math.cos(angle);
        const py = cy + ry * r * Math.sin(angle);
        if (i === 0) targetCtx.moveTo(px, py); else targetCtx.lineTo(px, py);
      }
      targetCtx.closePath();
      if (object.fill) targetCtx.fill();
      targetCtx.stroke();
    } else {
      targetCtx.beginPath();
      targetCtx.rect(object.x, object.y, object.width, object.height);
      if (object.fill) targetCtx.fill();
      targetCtx.stroke();
    }
    targetCtx.restore();
  }

  function drawWrappedTextToContext(targetCtx, object) {
    if (!object.text) return;
    targetCtx.save();
    targetCtx.fillStyle = object.color || "#0f172a";
    const weight = object.bold ? "bold " : "";
    const style = object.italic ? "italic " : "";
    targetCtx.font = `${style}${weight}${object.fontSize || 16}px sans-serif`;
    const lines = String(object.text).split("\n");
    const pad = 10;
    const lineHeight = (object.fontSize || 16) * (object.lineHeight || 1.35);
    let currY = object.y + pad + (object.fontSize || 16) * 0.85;
    for (const line of lines) {
      let x = object.x + pad;
      if (object.align === "center") x = object.x + object.width / 2 - targetCtx.measureText(line).width / 2;
      else if (object.align === "right") x = object.x + object.width - pad - targetCtx.measureText(line).width;
      targetCtx.fillText(line, x, currY, object.width - pad * 2);
      currY += lineHeight;
    }
    targetCtx.restore();
  }

  function generateSvgForPage(page, options = {}) {
    const transparent = Boolean(options.transparent);
    const objects = options.objects || (page.id === state.currentPageId ? state.objects : page.objects || []);
    let minX = 0;
    let minY = 0;
    let width = page.width;
    let height = page.height;

    if (options.scope === "selection" && options.bounds) {
      minX = Math.round(options.bounds.x);
      minY = Math.round(options.bounds.y);
      width = Math.round(Math.max(options.bounds.width, 20));
      height = Math.round(Math.max(options.bounds.height, 20));
    }

    const surface = pageSurface(page);
    let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    svg += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">\n`;

    if (!transparent) {
      svg += `  <rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="${surface.paperColor || "#ffffff"}"/>\n`;
    }

    for (const object of objects) {
      if (!object || object.hidden) continue;
      svg += objectToSvg(object);
    }

    svg += `</svg>\n`;
    return svg;
  }

  function escapeXml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function objectToSvg(object) {
    const rot = object.rotation ? ` transform="rotate(${(object.rotation * 180 / Math.PI).toFixed(2)} ${getCenter(object).x} ${getCenter(object).y})"` : "";
    if (object.type === "stroke") {
      if (object.tool === "eraser" || !object.points || object.points.length === 0) return "";
      const color = object.color || "#0f172a";
      const size = object.size || 2;
      const opacity = object.tool === "highlighter" ? 0.35 : object.tool === "marker" ? 0.75 : 1;
      const d = object.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
      return `  <path d="${d}" fill="none" stroke="${color}" stroke-width="${size}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"${rot}/>\n`;
    }
    if (object.type === "rect") {
      const fill = object.fill || "none";
      const stroke = object.stroke || "#0f172a";
      const sw = object.strokeSize || 1;
      return `  <rect x="${object.x}" y="${object.y}" width="${object.width}" height="${object.height}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${rot}/>\n`;
    }
    if (object.type === "roundrect") {
      const fill = object.fill || "none";
      const stroke = object.stroke || "#0f172a";
      const sw = object.strokeSize || 1;
      return `  <rect x="${object.x}" y="${object.y}" width="${object.width}" height="${object.height}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${rot}/>\n`;
    }
    if (object.type === "ellipse") {
      const fill = object.fill || "none";
      const stroke = object.stroke || "#0f172a";
      const sw = object.strokeSize || 1;
      const cx = object.x + object.width / 2;
      const cy = object.y + object.height / 2;
      return `  <ellipse cx="${cx}" cy="${cy}" rx="${Math.abs(object.width / 2)}" ry="${Math.abs(object.height / 2)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${rot}/>\n`;
    }
    if (object.type === "text" || object.type === "sticky") {
      let out = `  <g${rot}>\n`;
      if (object.type === "sticky") {
        out += `    <rect x="${object.x}" y="${object.y}" width="${object.width}" height="${object.height}" rx="8" fill="${object.fill || "#fef08a"}"/>\n`;
      }
      const lines = String(object.text || "").split("\n");
      const pad = 10;
      const fontSize = object.fontSize || 16;
      const lineHeight = fontSize * (object.lineHeight || 1.35);
      let currY = object.y + pad + fontSize * 0.85;
      for (const line of lines) {
        let x = object.x + pad;
        let anchor = "start";
        if (object.align === "center") {
          x = object.x + object.width / 2;
          anchor = "middle";
        } else if (object.align === "right") {
          x = object.x + object.width - pad;
          anchor = "end";
        }
        out += `    <text x="${x}" y="${currY}" font-family="sans-serif" font-size="${fontSize}" font-weight="${object.bold ? "bold" : "normal"}" font-style="${object.italic ? "italic" : "normal"}" fill="${object.color || "#0f172a"}" text-anchor="${anchor}">${escapeXml(line)}</text>\n`;
        currY += lineHeight;
      }
      out += `  </g>\n`;
      return out;
    }
    if (object.type === "line" || object.type === "arrow") {
      const stroke = object.stroke || "#0f172a";
      const sw = object.strokeSize || 2;
      return `  <line x1="${object.x1}" y1="${object.y1}" x2="${object.x2}" y2="${object.y2}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"${rot}/>\n`;
    }
    return `  <rect x="${object.x}" y="${object.y}" width="${object.width}" height="${object.height}" fill="${object.fill || "none"}" stroke="${object.stroke || "#0f172a"}" stroke-width="1"${rot}/>\n`;
  }

  function downloadFile(blobOrUrl, filename) {
    const a = document.createElement("a");
    if (typeof blobOrUrl === "string") {
      a.href = blobOrUrl;
    } else {
      a.href = URL.createObjectURL(blobOrUrl);
    }
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      if (typeof blobOrUrl !== "string") URL.revokeObjectURL(a.href);
    }, 200);
  }

  function buildMinimalPdf(pagesDataUrls) {
    let pdf = "%PDF-1.4\n";
    const xrefs = [];
    let objCount = 0;

    function addObj(content) {
      objCount++;
      xrefs.push(pdf.length);
      pdf += `${objCount} 0 obj\n${content}\nendobj\n`;
      return objCount;
    }

    const pageObjIds = [];

    for (const pageData of pagesDataUrls) {
      const imgWidth = pageData.width;
      const imgHeight = pageData.height;
      const rawBase64 = pageData.dataUrl.split(",")[1];
      const binaryImg = atob(rawBase64);
      const imgStreamLen = binaryImg.length;

      const imgObjId = objCount + 1;
      addObj(`<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgStreamLen} >>\nstream\n${binaryImg}\nendstream`);

      const contentStream = `q\n${imgWidth} 0 0 ${imgHeight} 0 0 cm\n/Im1 Do\nQ\n`;
      const contentStreamId = addObj(`<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream`);

      const pageObjId = addObj(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${imgWidth} ${imgHeight}] /Resources << /XObject << /Im1 ${imgObjId} 0 R >> >> /Contents ${contentStreamId} 0 R >>`);
      pageObjIds.push(pageObjId);
    }

    const catalogObjId = addObj(`<< /Type /Catalog /Pages 2 0 R >>`);
    const pagesObjId = addObj(`<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjIds.length} >>`);

    const startxref = pdf.length;
    pdf += "xref\n";
    pdf += `0 ${objCount + 1}\n`;
    pdf += "0000000000 65535 f \n";
    for (const offset of xrefs) {
      pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objCount + 1} /Root ${catalogObjId} 0 R >>\nstartxref\n${startxref}\n%%EOF`;

    const bytes = new Uint8Array(pdf.length);
    for (let i = 0; i < pdf.length; i++) {
      bytes[i] = pdf.charCodeAt(i) & 0xff;
    }
    return new Blob([bytes], { type: "application/pdf" });
  }

  async function generateExportPreview() {
    const format = exportFormatSelect.value;
    const scope = exportScopeSelect.value;
    const scale = Number(exportScaleSelect.value) || 1;
    const transparent = exportTransparentBg.checked;

    exportPreviewBadge.textContent = `${format.toUpperCase()} · ${scope === "selection" ? "Selection" : scope === "all" ? `${state.pages.length} Pages` : "Current Page"}`;
    exportPreviewPlaceholder.hidden = false;
    exportPreviewImg.hidden = true;

    try {
      const page = currentPage();
      if (!page) return;

      let bounds = null;
      let objects = page.id === state.currentPageId ? state.objects : page.objects || [];
      if (scope === "selection") {
        const sel = selectedObjects();
        if (sel.length > 0) {
          objects = sel;
          bounds = unionBounds(sel.map((o) => objectWorldBounds(o)));
        } else {
          bounds = { x: 0, y: 0, width: page.width, height: page.height };
        }
      }

      if (format === "project" || format === "json") {
        exportPreviewPlaceholder.textContent = `${format === "project" ? "Drawora Project" : "Raw JSON"} (${state.pages.length} pages, ${state.objects.length} objects)`;
        exportPreviewImg.hidden = true;
        exportPreviewPlaceholder.hidden = false;
        exportInfo.textContent = `Ready to download ${state.boardName}.${format === "project" ? "drawora" : "json"}`;
        return;
      }

      const prevCanvas = renderPageToCanvas(page, {
        scale: Math.min(scale, 1.5),
        transparent: transparent && (format === "png" || format === "svg"),
        scope,
        bounds,
        objects,
      });

      exportPreviewImg.src = prevCanvas.toDataURL("image/png");
      exportPreviewImg.hidden = false;
      exportPreviewPlaceholder.hidden = true;

      const fullW = bounds ? Math.round(bounds.width * scale) : Math.round(page.width * scale);
      const fullH = bounds ? Math.round(bounds.height * scale) : Math.round(page.height * scale);
      exportInfo.textContent = `Export dimensions: ${fullW} × ${fullH} px (${scale}× scale)`;
    } catch (e) {
      exportPreviewPlaceholder.textContent = "Preview unavailable";
      exportPreviewPlaceholder.hidden = false;
    }
  }

  function syncExportOptionsUI() {
    const format = exportFormatSelect.value;
    exportQualityWrap.hidden = format !== "jpg";
    exportBgWrap.hidden = format !== "png" && format !== "svg";
    exportScaleWrap.hidden = format === "project" || format === "json";
    exportScopeWrap.hidden = format === "project" || format === "json";
    generateExportPreview();
  }

  function openExportDialog(defaultType = "png") {
    exportDialog.hidden = false;
    if (defaultType) {
      exportFormatSelect.value = defaultType;
    }
    const selCount = state.selectedIds.length;
    exportScopeSelect.querySelector('option[value="selection"]').disabled = selCount === 0;
    if (selCount === 0 && exportScopeSelect.value === "selection") {
      exportScopeSelect.value = "current";
    }
    const cleanName = (state.boardName || "Drawora-Board").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_") || "Drawora-Board";
    exportFilenameInput.value = cleanName;
    syncExportOptionsUI();
    trapModalFocus(exportDialog);
  }

  function closeExportDialog() {
    exportDialog.hidden = true;
    releaseModalFocus();
  }

  async function executeExportDownload() {
    const format = exportFormatSelect.value;
    const scope = exportScopeSelect.value;
    const scale = Number(exportScaleSelect.value) || 2;
    const transparent = exportTransparentBg.checked;
    const quality = (Number(exportQualityRange.value) || 90) / 100;
    const baseName = (exportFilenameInput.value || "Drawora-Export").trim() || "Drawora-Export";

    exportDownloadBtn.disabled = true;
    exportInfo.textContent = "Generating export...";

    try {
      if (format === "project" || format === "json") {
        const projectData = {
          app: "Drawora",
          version: 1,
          createdAt: state.boardCreatedAt || Date.now(),
          exportedAt: Date.now(),
          boardId: state.boardId,
          boardName: state.boardName,
          pages: snapshotPages(),
          currentPageId: state.currentPageId,
        };
        const jsonStr = JSON.stringify(projectData, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const ext = format === "project" ? "drawora" : "json";
        downloadFile(blob, `${baseName}.${ext}`);
        closeExportDialog();
        return;
      }

      if (format === "svg") {
        if (scope === "all" && state.pages.length > 1) {
          for (let i = 0; i < state.pages.length; i++) {
            const page = state.pages[i];
            const svgStr = generateSvgForPage(page, { transparent, scope: "current" });
            const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
            downloadFile(blob, `${baseName}_Page_${i + 1}_${page.name.replace(/\s+/g, "_")}.svg`);
          }
        } else {
          const page = currentPage();
          let bounds = null;
          let objects = page.id === state.currentPageId ? state.objects : page.objects || [];
          if (scope === "selection") {
            const sel = selectedObjects();
            if (sel.length > 0) {
              objects = sel;
              bounds = unionBounds(sel.map((o) => objectWorldBounds(o)));
            }
          }
          const svgStr = generateSvgForPage(page, { transparent, scope, bounds, objects });
          const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
          downloadFile(blob, `${baseName}.svg`);
        }
        closeExportDialog();
        return;
      }

      if (format === "pdf") {
        const targetPages = scope === "all" ? state.pages : [currentPage()];
        const pdfPages = [];
        for (const page of targetPages) {
          const pCanvas = renderPageToCanvas(page, { scale, transparent: false, scope: "current" });
          pdfPages.push({
            dataUrl: pCanvas.toDataURL("image/jpeg", quality),
            width: page.width,
            height: page.height,
          });
        }
        const pdfBlob = buildMinimalPdf(pdfPages);
        downloadFile(pdfBlob, `${baseName}.pdf`);
        closeExportDialog();
        return;
      }

      if (format === "png" || format === "jpg") {
        const mime = format === "png" ? "image/png" : "image/jpeg";
        const ext = format === "png" ? "png" : "jpg";

        if (scope === "all" && state.pages.length > 1) {
          for (let i = 0; i < state.pages.length; i++) {
            const page = state.pages[i];
            const pCanvas = renderPageToCanvas(page, {
              scale,
              transparent: transparent && format === "png",
              scope: "current",
            });
            const dataUrl = pCanvas.toDataURL(mime, quality);
            downloadFile(dataUrl, `${baseName}_Page_${i + 1}_${page.name.replace(/\s+/g, "_")}.${ext}`);
          }
        } else {
          const page = currentPage();
          let bounds = null;
          let objects = page.id === state.currentPageId ? state.objects : page.objects || [];
          if (scope === "selection") {
            const sel = selectedObjects();
            if (sel.length > 0) {
              objects = sel;
              bounds = unionBounds(sel.map((o) => objectWorldBounds(o)));
            }
          }
          const pCanvas = renderPageToCanvas(page, {
            scale,
            transparent: transparent && format === "png",
            scope,
            bounds,
            objects,
          });
          const dataUrl = pCanvas.toDataURL(mime, quality);
          downloadFile(dataUrl, `${baseName}.${ext}`);
        }
        announceA11y("Export downloaded successfully");
        closeExportDialog();
      }
    } catch (err) {
      console.error("Drawora: Export failed", err);
      exportInfo.textContent = "Export failed. Please try again.";
      announceA11y("Export failed. Please try again.");
    } finally {
      exportDownloadBtn.disabled = false;
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
      const newId = createId();
      const newName = data.boardName || file.name.replace(/\.(drawora|json)$/i, "") || "Imported Board";
      const record = {
        id: newId,
        name: newName,
        createdAt: data.createdAt || Date.now(),
        updatedAt: Date.now(),
        pageCount: data.pages.length,
        thumbnail: generateBoardThumbnail(data.pages, data.currentPageId),
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

  function undo() {
    if (state.editingId) {
      finishEditing();
    }

    if (state.active || state.past.length === 0) {
      return;
    }

    state.future.push(cloneBoard());
    restoreBoard(state.past.pop());
  }

  function redo() {
    if (state.editingId) {
      finishEditing();
    }

    if (state.active || state.future.length === 0) {
      return;
    }

    state.past.push(cloneBoard());
    restoreBoard(state.future.pop());
  }

  function syncEditUI() {
    const selectableCount = state.objects.filter(isSelectable).length;
    const hasSelection = state.selectedIds.length > 0;
    const canMutate = selectedObjects().some((object) => !object.locked);
    const units = selectionUnits();
    const info = selectionGroupInfo();

    undoBtn.disabled = state.past.length === 0;
    redoBtn.disabled = state.future.length === 0;
    deleteBtn.disabled = !canMutate;
    copyBtn.disabled = !hasSelection;
    cutBtn.disabled = !canMutate;
    duplicateBtn.disabled = !hasSelection;
    pasteBtn.disabled = state.clipboard.length === 0;
    selectAllBtn.disabled = selectableCount === 0;
    groupBtn.disabled = !info.canGroup;
    ungroupBtn.disabled = !info.canUngroup;
    for (const button of toolbar.querySelectorAll('[data-action="align"]')) {
      button.disabled = units.length < 2 || !canMutate;
    }
    for (const button of toolbar.querySelectorAll('[data-action="flip-h"], [data-action="flip-v"]')) {
      button.disabled = !canMutate;
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
    state.selectedIds = ids;
    if (state.cropping && !selectedImage()) {
      state.cropping = false;
    }
    const table = ids.length === 1 ? findObject(ids[0]) : null;
    if (!isTable(table)) {
      state.tableCell = null;
      state.tableRange = null;
    } else if (!state.tableCell || state.tableCell.id !== table.id) {
      state.tableCell = { id: table.id, r: 0, c: 0 };
      state.tableRange = null;
    }
    syncEditUI();
    syncFormatFromSelection();
    syncImageUI();
    syncLinkUI();
    syncTableUI();
    syncLayersUI();
  }

  function clearSelection() {
    if (state.selectedIds.length === 0) {
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
      object.width = Math.max(object.width, tableColCount(object) * TABLE_CELL_MIN);
      object.height = Math.max(object.height, tableRowCount(object) * TABLE_CELL_MIN);
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
    for (const object of state.objects) {
      if (object.groupId && groupIds.has(object.groupId)) {
        selected.add(object.id);
      }
    }
    return state.objects.filter((object) => selected.has(object.id)).map((object) => object.id);
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
        units.push(state.objects.filter((item) => item.groupId === object.groupId));
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
      state.objects.filter((object) => object.groupId === firstGroup).length === selected.length;
    return {
      canGroup: !complete,
      canUngroup: grouped.length > 0,
    };
  }

  function pruneOrphanGroups() {
    const counts = new Map();
    for (const object of state.objects) {
      if (!object.groupId) {
        continue;
      }
      counts.set(object.groupId, (counts.get(object.groupId) || 0) + 1);
    }
    for (const object of state.objects) {
      if (object.groupId && counts.get(object.groupId) < 2) {
        delete object.groupId;
      }
    }
  }

  function deleteSelected() {
    if (state.selectedIds.length === 0 || state.active) {
      return;
    }

    captureBefore();
    const ids = new Set(state.selectedIds);
    state.objects = state.objects.filter((object) => !ids.has(object.id) || object.locked);
    pruneOrphanGroups();
    setSelection(state.objects.filter((object) => ids.has(object.id)).map((object) => object.id));
    commitIfChanged();
    redraw();
  }

  function duplicateSelected() {
    if (state.selectedIds.length === 0 || state.active) {
      return;
    }

    captureBefore();
    const copies = remapClones(selectedObjects(), DUPLICATE_OFFSET);
    for (const copy of copies) {
      state.objects.push(copy);
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
    if (sel && selected.length === 1 && state.tableCell) {
      state.cellClipboard = tableRangeToTsv(sel);
      state.clipboardKind = "cells";
      state.clipboard = cloneData(selected);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(state.cellClipboard).catch(() => {});
      }
      syncEditUI();
      return;
    }

    state.clipboardKind = "objects";
    state.clipboard = cloneData(selected);
    syncEditUI();
  }

  function pasteClipboard() {
    if (state.active) {
      return;
    }

    const table = selectedTable();
    if (table && state.tableCell && state.clipboardKind === "cells" && state.cellClipboard) {
      captureBefore();
      pasteTsvIntoTable(table, state.tableCell.r, state.tableCell.c, state.cellClipboard);
      commitIfChanged();
      redraw();
      return;
    }

    if (state.clipboard.length === 0) {
      return;
    }

    captureBefore();
    const copies = remapClones(state.clipboard, DUPLICATE_OFFSET);
    for (const copy of copies) {
      state.objects.push(copy);
    }
    setSelection(copies.map((copy) => copy.id));
    commitIfChanged();
    redraw();
  }

  async function pasteAction() {
    if (state.active) {
      return;
    }
    if (navigator.clipboard && navigator.clipboard.read) {
      try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const type = item.types.find((name) => IMAGE_TYPES.test(name));
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

  function onPaste(event) {
    if (isTypingTarget(event.target) || state.editingId || state.frozen) {
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
    if (state.clipboard.length) {
      event.preventDefault();
      pasteClipboard();
    }
  }

  function setDropTarget(on) {
    canvasWrap.classList.toggle("is-drop-target", on);
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
    if (state.frozen) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
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

  function cutSelected() {
    if (state.selectedIds.length === 0 || state.active) {
      return;
    }

    copySelected();
    deleteSelected();
  }

  function selectAll() {
    if (state.active) {
      return;
    }

    const ids = state.objects.filter(isSelectable).map((object) => object.id);
    if (ids.length === 0) {
      return;
    }

    if (state.tool !== "select") {
      setTool("select");
    }
    setSelection(ids);
    redraw();
  }

  function groupSelected() {
    if (state.active || !selectionGroupInfo().canGroup) {
      return;
    }

    captureBefore();
    const groupId = createId();
    for (const object of selectedObjects()) {
      object.groupId = groupId;
    }
    setSelection(expandGroupIds(state.selectedIds));
    commitIfChanged();
    redraw();
  }

  function ungroupSelected() {
    if (state.active || !selectionGroupInfo().canUngroup) {
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
    return state.objects.filter((item) => item.groupId === object.groupId);
  }

  function reorderSelection(mode) {
    if (state.active || state.selectedIds.length === 0) {
      return;
    }
    const ids = new Set(expandGroupIds(state.selectedIds));
    const moving = state.objects.filter((object) => ids.has(object.id));
    const staying = state.objects.filter((object) => !ids.has(object.id));
    if (!moving.length || (mode !== "front" && mode !== "back" && staying.length === 0)) {
      return;
    }
    captureBefore();
    if (mode === "front") {
      state.objects = [...staying, ...moving];
    } else if (mode === "back") {
      state.objects = [...moving, ...staying];
    } else if (mode === "forward") {
      let last = -1;
      state.objects.forEach((object, index) => {
        if (ids.has(object.id)) {
          last = index;
        }
      });
      const next = state.objects[last + 1];
      if (next) {
        const insertAt = staying.indexOf(next) + 1;
        staying.splice(insertAt, 0, ...moving);
        state.objects = staying;
      }
    } else if (mode === "backward") {
      const first = state.objects.findIndex((object) => ids.has(object.id));
      const prev = first > 0 ? state.objects[first - 1] : null;
      if (prev) {
        staying.splice(staying.indexOf(prev), 0, ...moving);
        state.objects = staying;
      }
    }
    commitIfChanged();
    redraw();
  }

  function toggleObjectFlag(object, flag) {
    if (!object || state.frozen) {
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
      setSelection(state.selectedIds.filter((id) => !hiddenIds.has(id)));
    }
    commitIfChanged();
    redraw();
  }

  function renameLayerObject(object, name) {
    if (!object || state.frozen) {
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
    state.showLayers = !state.showLayers;
    syncLayersUI();
  }

  function toggleLockSelected() {
    if (state.active || state.selectedIds.length === 0 || state.frozen) {
      return;
    }
    captureBefore();
    const targets = expandGroupIds(state.selectedIds);
    const objects = state.objects.filter((o) => targets.includes(o.id));
    const allLocked = objects.every((o) => o.locked);
    const nextLocked = !allLocked;
    for (const object of objects) {
      object.locked = nextLocked;
    }
    commitIfChanged();
    redraw();
  }

  function reorderLayerItem(sourceId, targetId, placeAbove) {
    if (!sourceId || !targetId || sourceId === targetId || state.frozen) {
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
    const moving = state.objects.filter((o) => movingIds.has(o.id));
    const staying = state.objects.filter((o) => !movingIds.has(o.id));
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
    state.objects = staying;
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
    layersPanel.hidden = !state.showLayers;
    for (const button of document.querySelectorAll('[data-action="toggle-layers"]')) {
      button.setAttribute("aria-pressed", String(state.showLayers));
    }
    const hasSelection = state.selectedIds.length > 0;
    for (const button of document.querySelectorAll('[data-action^="order-"]')) {
      button.disabled = !hasSelection;
    }
    for (const button of document.querySelectorAll('[data-action="toggle-lock"]')) {
      button.disabled = !hasSelection;
      const allLocked = hasSelection && selectedObjects().every((o) => o.locked);
      button.setAttribute("aria-pressed", String(allLocked));
      button.title = allLocked ? "Unlock selected (Ctrl+L)" : "Lock selected (Ctrl+L)";
    }
    if (!state.showLayers) {
      return;
    }
    if (document.activeElement && document.activeElement.classList.contains("layer-label-input")) {
      return;
    }
    const items = state.objects.filter(isLayerItem).slice().reverse();
    layersEmpty.hidden = items.length > 0;
    layersList.replaceChildren();
    const selected = new Set(state.selectedIds);
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
      layersList.append(row);
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
    if (state.active || units.length < 2) {
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
        object.color = state.stroke;
        object.size = state.size;
        continue;
      }

      if (isTextLike(object)) {
        object.color = state.stroke;
        object.fontSize = state.fontSize;
        object.fontKey = state.fontKey;
        object.bold = state.bold;
        object.italic = state.italic;
        object.underline = state.underline;
        object.strike = state.strike;
        object.align = state.align;
        object.lineHeight = state.lineHeight;
        object.letterSpacing = state.letterSpacing;
        object.paragraphSpacing = state.paragraphSpacing;
        object.textBack = state.textBack;
        object.list = state.list;
        object.indent = state.indent;
        if (object.type === "sticky") {
          object.fill = state.fill || object.fill || STICKY_FILL;
        }
        reflowTextHeight(object);
        continue;
      }

      if (isImage(object)) {
        object.stroke = state.stroke;
        if (fromSize) {
          object.size = state.size;
        }
        continue;
      }

      if (isLink(object)) {
        object.color = state.stroke;
        object.fontSize = state.fontSize;
        object.fontKey = state.fontKey;
        object.bold = state.bold;
        object.italic = state.italic;
        object.textBack = state.textBack;
        const size = measureLinkBox(object);
        object.width = Math.max(object.width, size.width);
        object.height = Math.max(object.height, size.height);
        continue;
      }

      if (isTable(object)) {
        object.stroke = state.stroke;
        object.size = state.size;
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

      object.stroke = state.stroke;
      object.size = state.size;
      if (object.type !== "line" && object.type !== "arrow") {
        object.fill = state.fill;
      }
    }
  }

  function replaceObjectFromClone(target, source) {
    const id = target.id;
    Object.keys(target).forEach((key) => {
      delete target[key];
    });
    Object.assign(target, cloneData(source), { id });
  }

  function applyMove(point) {
    const drag = state.active;
    const dx = state.showGrid
      ? Math.round((point.x - drag.startPoint.x) / gridStep()) * gridStep()
      : point.x - drag.startPoint.x;
    const dy = state.showGrid
      ? Math.round((point.y - drag.startPoint.y) / gridStep()) * gridStep()
      : point.y - drag.startPoint.y;
    drag.targets.forEach((object, index) => {
      replaceObjectFromClone(object, drag.startObjects[index]);
      translateObject(object, dx, dy);
    });
  }

  function applyRotate(point) {
    const drag = state.active;
    const object = drag.targets[0];
    const start = drag.startObjects[0];
    replaceObjectFromClone(object, start);
    const angle = Math.atan2(point.y - drag.center.y, point.x - drag.center.x);
    const origin = Math.atan2(
      drag.startPoint.y - drag.center.y,
      drag.startPoint.x - drag.center.x
    );
    object.rotation = (start.rotation || 0) + (angle - origin);
  }

  function applyResize(point) {
    const drag = state.active;
    const object = drag.targets[0];
    const start = drag.startObjects[0];
    replaceObjectFromClone(object, start);

    const local = worldToLocal(point, drag.center, drag.rotation);
    const startBounds = drag.startBounds;
    let left = startBounds.x;
    let top = startBounds.y;
    let right = startBounds.x + startBounds.width;
    let bottom = startBounds.y + startBounds.height;

    if (drag.handle.includes("w")) {
      left = local.x;
    }
    if (drag.handle.includes("e")) {
      right = local.x;
    }
    if (drag.handle.includes("n")) {
      top = local.y;
    }
    if (drag.handle.includes("s")) {
      bottom = local.y;
    }

    if (right - left < MIN_FRAME) {
      if (drag.handle.includes("w")) {
        left = right - MIN_FRAME;
      } else {
        right = left + MIN_FRAME;
      }
    }
    if (isTextLike(object) && right - left < MIN_TEXT_WIDTH) {
      if (drag.handle.includes("w")) {
        left = right - MIN_TEXT_WIDTH;
      } else {
        right = left + MIN_TEXT_WIDTH;
      }
    }
    if (isTable(object)) {
      const minW = tableColCount(object) * TABLE_CELL_MIN;
      const minH = tableRowCount(object) * TABLE_CELL_MIN;
      if (right - left < minW) {
        if (drag.handle.includes("w")) {
          left = right - minW;
        } else {
          right = left + minW;
        }
      }
      if (bottom - top < minH) {
        if (drag.handle.includes("n")) {
          top = bottom - minH;
        } else {
          bottom = top + minH;
        }
      }
    }
    if (bottom - top < MIN_FRAME) {
      if (drag.handle.includes("n")) {
        top = bottom - MIN_FRAME;
      } else {
        bottom = top + MIN_FRAME;
      }
    }

    if (isImage(object) && !drag.shift && drag.handle.length === 2) {
      const aspect = startBounds.width / Math.max(startBounds.height, 1);
      const nextW = right - left;
      const nextH = bottom - top;
      if (Math.abs(nextW / Math.max(nextH, 1) - aspect) > 0.001) {
        if (Math.abs(nextW - startBounds.width) >= Math.abs(nextH - startBounds.height)) {
          const height = nextW / aspect;
          if (drag.handle.includes("n")) {
            top = bottom - height;
          } else {
            bottom = top + height;
          }
        } else {
          const width = nextH * aspect;
          if (drag.handle.includes("w")) {
            left = right - width;
          } else {
            right = left + width;
          }
        }
      }
    }

    const nextBounds = {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    };

    const fixedLocal = {
      x: drag.handle.includes("w") ? right : left,
      y: drag.handle.includes("n") ? bottom : top,
    };
    const worldBefore = localToWorld(fixedLocal, drag.center, drag.rotation);

    applyScaledBounds(object, start, startBounds, nextBounds);

    const worldAfter = localToWorld(fixedLocal, getCenter(object), object.rotation || 0);
    translateObject(object, worldBefore.x - worldAfter.x, worldBefore.y - worldAfter.y);
  }

  function applyCrop(point) {
    const drag = state.active;
    const object = drag.targets[0];
    const start = drag.startObjects[0];
    const asset = getImageAsset(start.imageId);
    if (!isImage(object) || !asset) {
      return;
    }

    replaceObjectFromClone(object, start);
    const crop = imageSourceRect(start, asset);
    const scaleX = start.width / crop.sw;
    const scaleY = start.height / crop.sh;
    const local = worldToLocal(point, drag.center, drag.rotation);
    let left = start.x;
    let top = start.y;
    let right = start.x + start.width;
    let bottom = start.y + start.height;

    if (drag.handle.includes("w")) {
      left = local.x;
    }
    if (drag.handle.includes("e")) {
      right = local.x;
    }
    if (drag.handle.includes("n")) {
      top = local.y;
    }
    if (drag.handle.includes("s")) {
      bottom = local.y;
    }

    if (right - left < MIN_IMAGE) {
      if (drag.handle.includes("w")) {
        left = right - MIN_IMAGE;
      } else {
        right = left + MIN_IMAGE;
      }
    }
    if (bottom - top < MIN_IMAGE) {
      if (drag.handle.includes("n")) {
        top = bottom - MIN_IMAGE;
      } else {
        bottom = top + MIN_IMAGE;
      }
    }

    const visualLeft = (left - start.x) / scaleX;
    const visualRight = (right - start.x) / scaleX;
    const visualTop = (top - start.y) / scaleY;
    const visualBottom = (bottom - start.y) / scaleY;
    let srcLeft = start.flipX ? crop.sx + crop.sw - visualRight : crop.sx + visualLeft;
    let srcRight = start.flipX ? crop.sx + crop.sw - visualLeft : crop.sx + visualRight;
    let srcTop = start.flipY ? crop.sy + crop.sh - visualBottom : crop.sy + visualTop;
    let srcBottom = start.flipY ? crop.sy + crop.sh - visualTop : crop.sy + visualBottom;

    srcLeft = Math.min(asset.width - 1, Math.max(0, srcLeft));
    srcTop = Math.min(asset.height - 1, Math.max(0, srcTop));
    srcRight = Math.min(asset.width, Math.max(srcLeft + 1, srcRight));
    srcBottom = Math.min(asset.height, Math.max(srcTop + 1, srcBottom));

    object.crop = {
      sx: srcLeft,
      sy: srcTop,
      sw: srcRight - srcLeft,
      sh: srcBottom - srcTop,
    };
    object.width = object.crop.sw * scaleX;
    object.height = object.crop.sh * scaleY;
    object.x = start.flipX
      ? start.x + (crop.sx + crop.sw - srcRight) * scaleX
      : start.x + (srcLeft - crop.sx) * scaleX;
    object.y = start.flipY
      ? start.y + (crop.sy + crop.sh - srcBottom) * scaleY
      : start.y + (srcTop - crop.sy) * scaleY;

    const fixedLocal = {
      x: drag.handle.includes("w") ? start.x + start.width : start.x,
      y: drag.handle.includes("n") ? start.y + start.height : start.y,
    };
    const worldBefore = localToWorld(fixedLocal, drag.center, drag.rotation);
    const worldAfter = localToWorld(
      {
        x: drag.handle.includes("w") ? object.x + object.width : object.x,
        y: drag.handle.includes("n") ? object.y + object.height : object.y,
      },
      getCenter(object),
      object.rotation || 0
    );
    translateObject(object, worldBefore.x - worldAfter.x, worldBefore.y - worldAfter.y);
  }

  function applyTransform(point) {
    if (!state.active || state.active.kind !== "transform") {
      return;
    }

    if (state.active.mode === "move") {
      applyMove(point);
      return;
    }

    if (state.active.mode === "rotate") {
      applyRotate(point);
      return;
    }

    if (state.active.mode === "crop") {
      applyCrop(point);
      return;
    }

    if (state.active.mode === "table-split") {
      applyTableSplit(point);
      return;
    }

    applyResize(point);
  }

  function applyTableSplit(point) {
    const drag = state.active;
    const object = drag.targets[0];
    const start = drag.startObjects[0];
    const split = drag.split;
    if (!isTable(object) || !split) {
      return;
    }
    replaceObjectFromClone(object, start);
    const local = objectLocalPoint(object, point);
    const layout = tableLayout(start);
    if (split.kind === "col") {
      const left = layout.cols[split.index - 1];
      const right = layout.cols[split.index];
      const pair = left.w + right.w;
      const min = TABLE_CELL_MIN;
      const x = Math.min(left.x + pair - min, Math.max(left.x + min, local.x - object.x));
      const leftW = x - left.x;
      object.colW = start.colW.slice();
      object.colW[split.index - 1] = leftW / start.width;
      object.colW[split.index] = (pair - leftW) / start.width;
      object.colW = normalizeFractions(object.colW);
      return;
    }
    const top = layout.rows[split.index - 1];
    const bottom = layout.rows[split.index];
    const pair = top.h + bottom.h;
    const min = TABLE_CELL_MIN;
    const y = Math.min(top.y + pair - min, Math.max(top.y + min, local.y - object.y));
    const topH = y - top.y;
    object.rowH = start.rowH.slice();
    object.rowH[split.index - 1] = topH / start.height;
    object.rowH[split.index] = (pair - topH) / start.height;
    object.rowH = normalizeFractions(object.rowH);
  }

  function flushSelectDrag() {
    state.raf = 0;
    if (!state.active || state.active.kind !== "transform" || !state.active.point) {
      return;
    }

    applyTransform(state.active.point);
    redraw();
  }

  function queueSelectDrag(point, shift) {
    if (!state.active || state.active.kind !== "transform") {
      return;
    }

    state.active.point = point;
    if (shift != null) {
      state.active.shift = shift;
    }
    if (!state.raf) {
      state.raf = requestAnimationFrame(flushSelectDrag);
    }
  }

  function startTransform(mode, handle, point, pointerId) {
    const targets = selectedObjects();
    const startObjects = targets.map((object) => cloneData(object));
    const primary = targets[0];
    const startBounds = primary
      ? mode === "resize"
        ? getFrame(primary)
        : getLocalBounds(primary)
      : null;
    const center = primary ? getCenter(primary) : { x: 0, y: 0 };

    state.active = {
      kind: "transform",
      mode,
      handle,
      pointerId,
      point,
      startPoint: point,
      targets,
      startObjects,
      startBounds,
      center,
      rotation: primary ? primary.rotation || 0 : 0,
    };
    canvas.style.cursor = mode === "move" ? "grabbing" : canvas.style.cursor;
  }

  function finishTransform(pointerId) {
    if (!state.active || state.active.kind !== "transform" || state.active.pointerId !== pointerId) {
      return;
    }

    if (state.raf) {
      cancelAnimationFrame(state.raf);
      flushSelectDrag();
    }

    state.active = null;
    releasePointer(pointerId);
    commitIfChanged();
    redraw();
  }

  function cancelActive() {
    if (!state.active) {
      if (state.editingId) {
        finishEditing();
      } else {
        clearSelection();
        redraw();
      }
      return;
    }

    if (state.historyBefore) {
      restoreBoard(state.historyBefore);
      discardHistoryCapture();
    }

    const pointerId = state.active.pointerId;
    if (state.raf) {
      cancelAnimationFrame(state.raf);
      state.raf = 0;
    }
    state.preview = null;
    state.queuedPoints = [];
    state.active = null;
    canvas.classList.remove("is-panning");
    if (pointerId != null) {
      releasePointer(pointerId);
    }
    redraw();
  }

  function syncFormatUI() {
    for (const button of document.querySelectorAll("[data-format]")) {
      const format = button.dataset.format;
      let pressed = false;
      if (format === "bold") {
        pressed = state.bold;
      } else if (format === "italic") {
        pressed = state.italic;
      } else if (format === "underline") {
        pressed = state.underline;
      } else if (format === "strike") {
        pressed = state.strike;
      } else if (format === `align-${state.align}`) {
        pressed = true;
      } else if (format === "list-bullet") {
        pressed = state.list === "bullet";
      } else if (format === "list-number") {
        pressed = state.list === "number";
      } else if (format === "text-back-none") {
        pressed = !state.textBack;
      }
      if (
        format === "indent" ||
        format === "outdent"
      ) {
        continue;
      }
      button.setAttribute("aria-pressed", String(Boolean(pressed)));
    }

    if (Number(fontSizeSelect.value) !== state.fontSize) {
      fontSizeSelect.value = FONT_SIZES.includes(state.fontSize) ? String(state.fontSize) : "24";
    }
    if (fontFamilySelect.value !== state.fontKey) {
      fontFamilySelect.value = FONT_STACKS[state.fontKey] ? state.fontKey : "sans";
    }
    if (document.activeElement !== lineHeightInput) {
      lineHeightInput.value = String(state.lineHeight);
    }
    if (document.activeElement !== letterSpacingInput) {
      letterSpacingInput.value = String(state.letterSpacing);
    }
    if (document.activeElement !== paraSpacingInput) {
      paraSpacingInput.value = String(state.paragraphSpacing);
    }
    if (state.textBack && document.activeElement !== textBackInput) {
      textBackInput.value = state.textBack;
    }
  }

  function syncFormatFromSelection() {
    const selected = selectedObjects();
    if (selected.length === 1 && isTextLike(selected[0])) {
      const object = selected[0];
      state.fontSize = object.fontSize || 24;
      state.fontKey = object.fontKey || "sans";
      state.bold = Boolean(object.bold);
      state.italic = Boolean(object.italic);
      state.underline = Boolean(object.underline);
      state.strike = Boolean(object.strike);
      state.align = object.align || "left";
      state.lineHeight = object.lineHeight || 1.35;
      state.letterSpacing = object.letterSpacing || 0;
      state.paragraphSpacing = object.paragraphSpacing || 0;
      state.textBack = object.textBack || null;
      state.list = object.list || "none";
      state.indent = object.indent || 0;
      if (object.color) {
        state.stroke = object.color;
      }
      if (object.type === "sticky" && object.fill) {
        state.fill = object.fill;
      }
      syncColorUI();
    } else if (selected.length === 1 && isTable(selected[0]) && state.tableCell) {
      const origin = tableOrigin(selected[0], state.tableCell.r, state.tableCell.c);
      const cell = origin ? tableCellAt(selected[0], origin.r, origin.c) : null;
      if (cell) {
        loadStyleFromTableCell(cell);
        if (selected[0].stroke) {
          state.stroke = cell.color || selected[0].stroke;
        }
        syncColorUI();
      }
    }

    syncFormatUI();
  }

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return fallback;
    }
    return Math.min(max, Math.max(min, number));
  }

  function syncImageUI() {
    const image = selectedImage();
    const enabled = Boolean(image);
    for (const button of toolbar.querySelectorAll('[data-action="image-crop"]')) {
      button.disabled = !enabled;
      button.setAttribute("aria-pressed", String(Boolean(enabled && state.cropping)));
    }
    imageFlipHBtn.disabled = !enabled;
    imageFlipVBtn.disabled = !enabled;
    imageShadowBtn.disabled = !enabled;
    imageGrayBtn.disabled = !enabled;
    imageOpacityInput.disabled = !enabled;
    imageRadiusInput.disabled = !enabled;
    imageBrightnessInput.disabled = !enabled;
    imageContrastInput.disabled = !enabled;
    imageSaturationInput.disabled = !enabled;
    imageBlurInput.disabled = !enabled;
    imageShadowBtn.setAttribute("aria-pressed", String(Boolean(image && image.shadow)));
    imageGrayBtn.setAttribute("aria-pressed", String(Boolean(image && image.grayscale)));
    if (!image) {
      return;
    }
    if (document.activeElement !== imageOpacityInput) {
      imageOpacityInput.value = String(Math.round((image.opacity == null ? 1 : image.opacity) * 100));
    }
    if (document.activeElement !== imageRadiusInput) {
      imageRadiusInput.value = String(image.radius || 0);
    }
    if (document.activeElement !== imageBrightnessInput) {
      imageBrightnessInput.value = String(image.brightness || 0);
    }
    if (document.activeElement !== imageContrastInput) {
      imageContrastInput.value = String(image.contrast || 0);
    }
    if (document.activeElement !== imageSaturationInput) {
      imageSaturationInput.value = String(image.saturation || 0);
    }
    if (document.activeElement !== imageBlurInput) {
      imageBlurInput.value = String(image.blur || 0);
    }
  }

  function applyImageFields(commit) {
    const image = selectedImage();
    if (!image) {
      return;
    }
    if (!state.historyBefore) {
      captureBefore();
    }
    image.opacity = clampNumber(imageOpacityInput.value, 0, 100, 100) / 100;
    image.radius = clampNumber(imageRadiusInput.value, 0, 240, 0);
    image.brightness = clampNumber(imageBrightnessInput.value, -100, 100, 0);
    image.contrast = clampNumber(imageContrastInput.value, -100, 100, 0);
    image.saturation = clampNumber(imageSaturationInput.value, -100, 100, 0);
    image.blur = clampNumber(imageBlurInput.value, 0, 40, 0);
    redraw();
    if (commit) {
      commitIfChanged();
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
    if (on && state.tableCell) {
      const origin = tableOrigin(table, state.tableCell.r, state.tableCell.c);
      const cell = origin ? tableCellAt(table, origin.r, origin.c) : null;
      canUnmerge = Boolean(cell && ((cell.colspan || 1) > 1 || (cell.rowspan || 1) > 1));
    }
    for (const button of toolbar.querySelectorAll("[data-action^='table-']")) {
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

  function toggleImageCrop() {
    const image = selectedImage();
    if (!image) {
      return;
    }
    state.cropping = !state.cropping;
    if (state.cropping && state.tool !== "select") {
      setTool("select");
    }
    syncImageUI();
    redraw();
  }

  function toggleImageFlag(name) {
    const image = selectedImage();
    if (!image) {
      return;
    }
    captureBefore();
    image[name] = !image[name];
    commitIfChanged();
    syncImageUI();
    redraw();
  }

  function fillColor() {
    return state.fill || state.stroke;
  }

  function applyFillAt(point) {
    const object = hitObject(point);
    if (!object) {
      return;
    }
    const color = fillColor();
    captureBefore();
    if (object.type === "stroke") {
      if (object.tool !== "eraser") {
        object.color = color;
      }
    } else if (object.type === "line" || object.type === "arrow") {
      object.stroke = color;
    } else if (isLink(object)) {
      object.color = color;
    } else if (isImage(object)) {
      object.stroke = color;
    } else if (isTextLike(object)) {
      if (object.type === "sticky") {
        object.fill = color;
      } else {
        object.textBack = color;
      }
    } else if (isTable(object)) {
      const local = objectLocalPoint(object, point);
      const cellHit = hitTableCell(object, local);
      const cell = cellHit ? tableCellAt(object, cellHit.r, cellHit.c) : null;
      if (cell && !cell.covered) {
        cell.fill = color;
      }
    } else {
      object.fill = color;
    }
    commitIfChanged();
    redraw();
  }

  function sampleCanvasColor(event) {
    const screen = getScreenPoint(event);
    const x = Math.max(0, Math.min(canvas.width - 1, Math.round(screen.x * state.dpr)));
    const y = Math.max(0, Math.min(canvas.height - 1, Math.round(screen.y * state.dpr)));
    const data = ctx.getImageData(x, y, 1, 1).data;
    if (data[3] < 12) {
      return null;
    }
    return rgbToHex(data[0], data[1], data[2]);
  }

  function pickColorAt(event) {
    const hex = sampleCanvasColor(event);
    if (hex) {
      if (state.colorTarget === "fill") {
        state.fill = hex;
      } else {
        state.stroke = hex;
      }
      syncColorUI();
    }
    const next =
      state.eyedropperReturn && state.eyedropperReturn !== "eyedropper" ? state.eyedropperReturn : "pen";
    setTool(next);
  }

  function startLasso(pointerId, point, shift) {
    state.active = {
      kind: "lasso",
      pointerId,
      points: [point],
      shift,
    };
    canvas.style.cursor = "crosshair";
    redraw();
  }

  function queueLasso(point, shift) {
    if (!state.active || state.active.kind !== "lasso") {
      return;
    }
    state.active.shift = shift;
    const last = state.active.points[state.active.points.length - 1];
    if (last && distance(last, point) < viewLen(2)) {
      return;
    }
    state.active.points.push(point);
    if (!state.raf) {
      state.raf = requestAnimationFrame(flushLasso);
    }
  }

  function flushLasso() {
    state.raf = 0;
    if (!state.active || state.active.kind !== "lasso") {
      return;
    }
    redraw();
  }

  function finishLasso(pointerId) {
    if (!state.active || state.active.kind !== "lasso" || state.active.pointerId !== pointerId) {
      return;
    }
    if (state.raf) {
      cancelAnimationFrame(state.raf);
      state.raf = 0;
    }
    const points = state.active.points;
    const additive = state.active.shift;
    state.active = null;
    releasePointer(pointerId);

    let hits;
    if (points.length < 3) {
      const object = hitObject(points[0]);
      hits = object ? [object.id] : [];
    } else {
      hits = state.objects
        .filter((object) => isSelectable(object) && pointInPolygon(getCenter(object), points))
        .map((object) => object.id);
    }
    const ids = expandGroupIds(hits);
    if (additive) {
      setSelection([...new Set([...state.selectedIds, ...ids])]);
    } else {
      setSelection(ids);
    }
    canvas.style.cursor = "";
    redraw();
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

  function openImagePicker() {
    imageFileInput.value = "";
    imageFileInput.click();
  }

  function syncPresenterUI() {
    if (!presenterBar) return;
    presenterBar.hidden = !state.presenting;
    if (!state.presenting) {
      if (presentationCurtain) presentationCurtain.hidden = true;
      return;
    }
    const curIdx = currentPageIndex() + 1;
    const total = state.pages.length;
    presenterPageStatus.textContent = `${curIdx} / ${total}`;

    presenterLaserBtn.setAttribute("aria-pressed", String(state.tool === "laser"));
    presenterPenBtn.setAttribute("aria-pressed", String(state.tool === "pen" || state.tool === "brush" || state.tool === "pencil" || state.tool === "highlighter" || state.tool === "marker"));
    presenterEraserBtn.setAttribute("aria-pressed", String(state.tool === "eraser"));

    presenterBlackBtn.classList.toggle("is-active-screen", state.presentationScreen === "black");
    presenterWhiteBtn.classList.toggle("is-active-screen", state.presentationScreen === "white");

    if (presentationCurtain) {
      if (state.presentationScreen === "black") {
        presentationCurtain.hidden = false;
        presentationCurtain.className = "presentation-curtain is-black";
      } else if (state.presentationScreen === "white") {
        presentationCurtain.hidden = false;
        presentationCurtain.className = "presentation-curtain is-white";
      } else {
        presentationCurtain.hidden = true;
      }
    }
  }

  function resetPresenterIdleTimer() {
    if (!state.presenting || !presenterBar) return;
    presenterBar.classList.remove("is-idle");
    if (state.presenterIdleTimer) {
      clearTimeout(state.presenterIdleTimer);
    }
    state.presenterIdleTimer = setTimeout(() => {
      if (state.presenting && presenterBar) {
        presenterBar.classList.add("is-idle");
      }
    }, 3500);
  }

  function startPresentation() {
    if (state.presenting) return;
    finishOpenWork();
    clearSelection();
    state.presenting = true;
    state.presentationScreen = null;
    appEl.classList.add("is-presenting");

    if (!document.fullscreenElement && appEl.requestFullscreen) {
      appEl.requestFullscreen().catch(() => {});
    }

    setTool("laser");
    resetPresenterIdleTimer();
    setTimeout(() => {
      resizeCanvas();
      fitCanvas();
    }, 50);
    syncPresenterUI();
    syncTeachUI();
  }

  function stopPresentation() {
    if (!state.presenting) return;
    state.presenting = false;
    state.presentationScreen = null;
    appEl.classList.remove("is-presenting");

    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }

    if (state.presenterIdleTimer) {
      clearTimeout(state.presenterIdleTimer);
      state.presenterIdleTimer = null;
    }
    if (presenterBar) {
      presenterBar.classList.remove("is-idle");
    }

    setTool("select");
    setTimeout(() => {
      resizeCanvas();
      fitCanvas();
    }, 50);
    syncPresenterUI();
    syncTeachUI();
  }

  function togglePresentation() {
    if (state.presenting) {
      stopPresentation();
    } else {
      startPresentation();
    }
  }

  function setPresentationScreen(screen) {
    if (!state.presenting) return;
    state.presentationScreen = screen;
    syncPresenterUI();
  }

  function syncTeachUI() {
    const pressed = (selector, on) => {
      for (const button of toolbar.querySelectorAll(selector)) {
        button.setAttribute("aria-pressed", String(Boolean(on)));
      }
    };
    pressed('[data-action="toggle-grid"]', state.showGrid);
    pressed('[data-action="toggle-rulers"]', state.showRulers);
    pressed('[data-action="toggle-guides"]', state.showGuides);
    pressed('[data-action="toggle-spotlight"]', state.spotlight);
    pressed('[data-action="toggle-freeze"]', state.frozen);
    pressed('[data-action="fullscreen"]', Boolean(document.fullscreenElement));
    pressed('[data-action="presentation-start"]', state.presenting);
    appEl.classList.toggle("is-frozen", state.frozen);
    const parts = [];
    if (state.frozen) {
      parts.push("Frozen");
    }
    if (state.spotlight) {
      parts.push("Spotlight");
    }
    if (state.active && state.active.kind === "measure") {
      parts.push(formatLength(distance(state.active.start, state.active.point)));
    } else if (state.active && state.active.kind === "protractor") {
      parts.push(formatAngle(state.active.start, state.active.point));
    }
    if (parts.length) {
      teachStatus.hidden = false;
      teachStatus.textContent = parts.join(" · ");
    } else {
      teachStatus.hidden = true;
      teachStatus.textContent = "";
    }
    syncPresenterUI();
  }

  function toggleFlag(name) {
    state[name] = !state[name];
    if (name === "showRulers" && state.showRulers) {
      state.showGuides = true;
    }
    if (name === "spotlight" && state.spotlight && !state.pointerWorld) {
      state.pointerWorld = screenToWorld(viewportCenter());
    }
    if (name === "frozen" && state.frozen) {
      finishOpenWork();
      if (state.tool !== "pan" && state.tool !== "laser") {
        setTool("laser");
      }
    }
    syncTeachUI();
    redraw();
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }
    appEl.requestFullscreen().catch(() => {});
  }

  function closeConfirmDialog() {
    confirmDialog.hidden = true;
    confirmCallback = null;
    releaseModalFocus();
  }

  function openConfirmDialog(title, message, okLabel, onConfirm) {
    finishOpenWork();
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmOk.textContent = okLabel;
    confirmCallback = onConfirm;
    confirmDialog.hidden = false;
    trapModalFocus(confirmDialog);
  }

  function requestClearBoard() {
    if (state.frozen) {
      return;
    }
    openConfirmDialog(
      "Clear this page?",
      "Drawings on this page will be removed. The page template stays.",
      "Clear",
      () => {
        if (!state.objects.length) {
          return;
        }
        captureBefore();
        state.objects.splice(0, state.objects.length);
        clearSelection();
        commitIfChanged();
        redraw();
      }
    );
  }

  function insertMathSymbol(symbol) {
    if (!symbol || state.frozen) {
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
    state.objects.push(object);
    finishInsert([object.id]);
  }

  function pushLaserTrail(point) {
    state.pointerWorld = point;
    const last = state.laserTrail[state.laserTrail.length - 1];
    if (last && distance(last, point) < viewLen(2)) {
      return;
    }
    state.laserTrail.push(point);
    if (state.laserTrail.length > 18) {
      state.laserTrail.shift();
    }
  }

  function hitRulerEdge(screen) {
    if (!state.showRulers) {
      return null;
    }
    if (screen.x <= RULER_SIZE && screen.y <= RULER_SIZE) {
      return null;
    }
    if (screen.x <= RULER_SIZE) {
      return "x";
    }
    if (screen.y <= RULER_SIZE) {
      return "y";
    }
    return null;
  }

  function hitGuide(point) {
    if (!state.showGuides) {
      return -1;
    }
    const threshold = viewLen(5);
    const guides = pageGuides();
    for (let i = guides.length - 1; i >= 0; i -= 1) {
      const guide = guides[i];
      if (guide.axis === "x" && Math.abs(point.x - guide.pos) <= threshold) {
        return i;
      }
      if (guide.axis === "y" && Math.abs(point.y - guide.pos) <= threshold) {
        return i;
      }
    }
    return -1;
  }

  function startGuideDrag(pointerId, axis, pos, index) {
    state.active = {
      kind: "guide",
      pointerId,
      axis,
      index,
      pos,
    };
    if (index < 0) {
      pageGuides().push({ axis, pos });
      state.active.index = pageGuides().length - 1;
      state.showGuides = true;
    }
    canvas.style.cursor = axis === "x" ? "ew-resize" : "ns-resize";
    syncTeachUI();
    redraw();
  }

  function moveGuide(point) {
    const drag = state.active;
    if (!drag || drag.kind !== "guide") {
      return;
    }
    const page = currentPage();
    const guides = pageGuides();
    const guide = guides[drag.index];
    if (!guide || !page) {
      return;
    }
    if (guide.axis === "x") {
      guide.pos = Math.max(0, Math.min(page.width, snapPoint(point).x));
    } else {
      guide.pos = Math.max(0, Math.min(page.height, snapPoint(point).y));
    }
    if (!state.raf) {
      state.raf = requestAnimationFrame(() => {
        state.raf = 0;
        redraw();
      });
    }
  }

  function finishGuide(pointerId) {
    if (!state.active || state.active.kind !== "guide" || state.active.pointerId !== pointerId) {
      return;
    }
    const page = currentPage();
    const guides = pageGuides();
    const guide = guides[state.active.index];
    if (guide && page) {
      const off =
        guide.axis === "x"
          ? guide.pos <= 0 || guide.pos >= page.width
          : guide.pos <= 0 || guide.pos >= page.height;
      if (off) {
        guides.splice(state.active.index, 1);
      }
    }
    state.active = null;
    releasePointer(pointerId);
    canvas.style.cursor = "";
    redraw();
  }

  function startMeasure(kind, pointerId, point) {
    const start = snapPoint(point);
    state.active = { kind, pointerId, start, point: start };
    canvas.style.cursor = "crosshair";
    syncTeachUI();
    redraw();
  }

  function moveMeasure(point) {
    if (!state.active || (state.active.kind !== "measure" && state.active.kind !== "protractor")) {
      return;
    }
    state.active.point = snapPoint(point);
    if (!state.raf) {
      state.raf = requestAnimationFrame(() => {
        state.raf = 0;
        syncTeachUI();
        redraw();
      });
    }
  }

  function finishMeasure(pointerId) {
    if (
      !state.active ||
      (state.active.kind !== "measure" && state.active.kind !== "protractor") ||
      state.active.pointerId !== pointerId
    ) {
      return;
    }
    state.active = null;
    releasePointer(pointerId);
    syncTeachUI();
    redraw();
  }

  function viewportWorldCenter() {
    return screenToWorld(viewportCenter());
  }

  function syncLinkUI() {
    linkOpenBtn.disabled = !selectedLink();
  }

  function sanitizeHref(value) {
    const trimmed = String(value || "").trim();
    if (!trimmed) {
      return "";
    }
    const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      const url = new URL(withProtocol);
      if (url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:") {
        return url.href;
      }
    } catch (error) {
      return "";
    }
    return "";
  }

  function linkLabelFromHref(href) {
    try {
      const url = new URL(href);
      if (url.protocol === "mailto:") {
        return url.pathname || href;
      }
      return url.hostname.replace(/^www\./, "") || href;
    } catch (error) {
      return href;
    }
  }

  function measureLinkBox(object) {
    applyTextMeasure({ ...object, fontSize: object.fontSize || 16 });
    const label = object.text || object.href || "Link";
    const width = Math.ceil(ctx.measureText(label).width) + 24;
    const height = Math.max(32, Math.round((object.fontSize || 16) * 1.8));
    if ("letterSpacing" in ctx) {
      ctx.letterSpacing = "0px";
    }
    return { width: Math.max(96, width), height };
  }

  function closeLinkDialog() {
    linkDialog.hidden = true;
    linkError.hidden = true;
    linkDialogTargetId = null;
    releaseModalFocus();
  }

  function openLinkDialog(object) {
    finishOpenWork();
    linkDialogTargetId = object ? object.id : null;
    linkTitle.textContent = object ? "Edit link" : "Insert link";
    linkForm.querySelector("[type='submit']").textContent = object ? "Save" : "Insert";
    linkTextInput.value = object ? object.text || "" : "";
    linkHrefInput.value = object ? object.href || "" : "";
    linkError.hidden = true;
    linkDialog.hidden = false;
    trapModalFocus(linkDialog);
  }

  function commitLinkDialog() {
    const href = sanitizeHref(linkHrefInput.value);
    if (!href) {
      linkError.hidden = false;
      linkHrefInput.focus();
      return false;
    }
    const text = (linkTextInput.value || "").trim() || linkLabelFromHref(href);
    const existing = linkDialogTargetId ? findObject(linkDialogTargetId) : null;
    if (existing && isLink(existing)) {
      captureBefore();
      existing.href = href;
      existing.text = text;
      const size = measureLinkBox(existing);
      existing.width = Math.max(existing.width, size.width);
      existing.height = Math.max(32, size.height);
      commitIfChanged();
      closeLinkDialog();
      redraw();
      return true;
    }

    const size = measureLinkBox({ text, href, fontSize: 16, fontKey: state.fontKey });
    const center = viewportWorldCenter();
    captureBefore();
    const object = {
      id: createId(),
      type: "link",
      x: center.x - size.width / 2,
      y: center.y - size.height / 2,
      width: size.width,
      height: size.height,
      text,
      href,
      color: SELECT_COLOR,
      fontSize: 16,
      fontKey: state.fontKey,
      bold: false,
      italic: false,
      textBack: "rgb(204 251 241 / 0.85)",
      rotation: 0,
    };
    state.objects.push(object);
    setTool("select");
    setSelection([object.id]);
    commitIfChanged();
    closeLinkDialog();
    redraw();
    return true;
  }

  function openExternalLink(href) {
    const safe = sanitizeHref(href);
    if (!safe) {
      return;
    }
    window.open(safe, "_blank", "noopener,noreferrer");
  }

  function openSelectedLink() {
    const link = selectedLink();
    if (link) {
      openExternalLink(link.href);
    }
  }

  function beginInsert() {
    finishOpenWork();
    captureBefore();
  }

  function finishInsert(ids) {
    setTool("select");
    setSelection(ids);
    commitIfChanged();
    redraw();
  }

  function insertTextLikeAtCenter(type) {
    const size = type === "sticky" ? STICKY_DEFAULT : TEXT_DEFAULT;
    const center = viewportWorldCenter();
    beginInsert();
    const object = createTextLike(type, {
      x: center.x - size.width / 2,
      y: center.y - size.height / 2,
      width: size.width,
      height: size.height,
    });
    state.objects.push(object);
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
    state.objects.push(object);
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
      stroke: state.stroke,
      fill: state.fill || "#ccfbf1",
      size: state.size,
      radius: ROUND_RECT_RADIUS,
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
      stroke: state.stroke,
      size: state.size,
      rotation: 0,
      groupId,
    }));
    const objects = [...boxes, ...notes, ...arrows];
    for (const item of objects) {
      state.objects.push(item);
    }
    finishInsert(objects.map((item) => item.id));
  }

  function insertTable() {
    const center = viewportWorldCenter();
    const width = TABLE_DEFAULT_COLS * 110;
    const height = TABLE_DEFAULT_ROWS * 36;
    beginInsert();
    const object = createTableObject(center.x - width / 2, center.y - height / 2);
    state.objects.push(object);
    state.tableCell = { id: object.id, r: 0, c: 0 };
    state.tableRange = null;
    finishInsert([object.id]);
  }

  function tableSelectCell(object, r, c, range) {
    const origin = tableOrigin(object, r, c) || { r, c };
    state.tableCell = { id: object.id, r: origin.r, c: origin.c };
    state.tableRange = range || null;
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
    object.height += Math.max(TABLE_CELL_MIN, object.height / Math.max(1, object.cells.length - 1));
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
    object.width += Math.max(TABLE_CELL_MIN, object.width / Math.max(1, object.colW.length - 1));
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
    object.height = Math.max(TABLE_CELL_MIN * object.cells.length, object.height - TABLE_CELL_MIN);
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
    object.width = Math.max(TABLE_CELL_MIN * object.colW.length, object.width - TABLE_CELL_MIN);
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

  function moveTableEdit(dc, dr) {
    const object = findObject(state.editingId);
    const cellRef = state.editingCell;
    if (!isTable(object) || !cellRef) {
      return;
    }
    const next = stepTableCell(object, cellRef.r, cellRef.c, dc, dr);
    finishEditing();
    tableSelectCell(object, next.r, next.c);
    startTableCellEdit(object, next.r, next.c);
  }

  // Add a data-insert button and a case here to extend the Insert tab.
  function runInsert(name) {
    if (name === "text" || name === "sticky") {
      insertTextLikeAtCenter(name);
      return;
    }
    if (SHAPE_TOOLS.includes(name)) {
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

  function styleEditor(object) {
    const italic = object.italic ? "italic " : "";
    const weight = object.bold ? "700 " : "400 ";
    const size = (object.fontSize || 24) * state.zoom;
    const pad = textPad(object);
    const padX = (pad + textIndentWidth(object)) * state.zoom;
    const padY = pad * state.zoom;
    editor.style.font = `${italic}${weight}${size}px ${objectFontFamily(object)}`;
    editor.style.color = object.color || "#1c1917";
    editor.style.textAlign = object.align || "left";
    editor.style.padding = `${padY}px ${pad * state.zoom}px ${padY}px ${padX}px`;
    editor.style.lineHeight = String(object.lineHeight || 1.35);
    editor.style.letterSpacing = `${(object.letterSpacing || 0) * state.zoom}px`;
    editor.style.textDecoration = [object.underline ? "underline" : "", object.strike ? "line-through" : ""]
      .filter(Boolean)
      .join(" ") || "none";
    if (object.type === "sticky") {
      editor.style.background = "transparent";
    } else {
      editor.style.background = object.textBack || "rgb(255 255 255 / 0.94)";
    }
    editor.classList.toggle("is-sticky", object.type === "sticky");
    editor.classList.toggle("is-table-cell", Boolean(object.pad === TABLE_PAD));
  }

  function positionEditor(object) {
    if (isTable(object) && state.editingCell) {
      const rect = tableCellRect(object, state.editingCell.r, state.editingCell.c);
      const cell = tableCellAt(object, state.editingCell.r, state.editingCell.c);
      if (!rect || !cell) {
        return;
      }
      editor.style.left = `${rect.x * state.zoom + state.panX}px`;
      editor.style.top = `${rect.y * state.zoom + state.panY}px`;
      editor.style.width = `${rect.width * state.zoom}px`;
      editor.style.height = `${rect.height * state.zoom}px`;
      editor.style.transform = object.rotation ? `rotate(${object.rotation}rad)` : "none";
      editor.style.transformOrigin = "center center";
      styleEditor(tableGhost(cell, rect));
      return;
    }
    editor.style.left = `${object.x * state.zoom + state.panX}px`;
    editor.style.top = `${object.y * state.zoom + state.panY}px`;
    editor.style.width = `${object.width * state.zoom}px`;
    editor.style.height = `${object.height * state.zoom}px`;
    editor.style.transform = object.rotation
      ? `rotate(${object.rotation}rad)`
      : "none";
    editor.style.transformOrigin = "center center";
    styleEditor(object);
  }

  function hideEditor() {
    editor.hidden = true;
    editor.value = "";
    state.editingId = null;
    state.editingCell = null;
    editor.classList.remove("is-table-cell");
  }

  function startTableCellEdit(object, r, c) {
    if (!isTable(object) || state.frozen) {
      return;
    }
    const origin = tableOrigin(object, r, c);
    const cell = origin ? tableCellAt(object, origin.r, origin.c) : null;
    if (!cell || cell.covered) {
      return;
    }
    if (state.editingId && state.editingId !== object.id) {
      finishEditing();
    }
    if (!state.editingId) {
      captureBefore();
    }
    state.editingId = object.id;
    state.editingIsNew = false;
    state.editingCell = { r: origin.r, c: origin.c };
    tableSelectCell(object, origin.r, origin.c);
    loadStyleFromTableCell(cell);
    syncFormatUI();
    syncColorUI();
    editor.hidden = false;
    editor.value = cell.text || "";
    positionEditor(object);
    redraw();
    editor.focus();
    editor.setSelectionRange(editor.value.length, editor.value.length);
  }

  function startEditing(object, isNew) {
    if (!isTextLike(object)) {
      return;
    }

    if (!isNew) {
      captureBefore();
    }

    state.editingId = object.id;
    state.editingIsNew = Boolean(isNew);
    editor.hidden = false;
    editor.value = object.text || "";
    positionEditor(object);
    redraw();
    editor.focus();
    editor.setSelectionRange(editor.value.length, editor.value.length);
  }

  function cancelEditing() {
    if (!state.editingId) {
      return;
    }

    hideEditor();
    state.editingIsNew = false;
    if (state.historyBefore) {
      restoreBoard(state.historyBefore);
      discardHistoryCapture();
    } else {
      redraw();
    }
  }

  function finishEditing() {
    if (!state.editingId) {
      return;
    }

    const object = findObject(state.editingId);
    const cellRef = state.editingCell;
    const text = editor.value;
    hideEditor();

    if (!object) {
      discardHistoryCapture();
      state.editingIsNew = false;
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
      state.editingIsNew = false;
      return;
    }

    object.text = text;
    if (isTextLike(object)) {
      reflowTextHeight(object);
    }
    if (object.type === "text" && !text.trim()) {
      if (state.editingIsNew && state.historyBefore) {
        restoreBoard(state.historyBefore);
        discardHistoryCapture();
        state.editingIsNew = false;
        return;
      }

      state.objects = state.objects.filter((item) => item.id !== object.id);
      setSelection(state.selectedIds.filter((id) => id !== object.id));
    }

    commitIfChanged();
    redraw();
    state.editingIsNew = false;
  }

  function createTextLike(type, bounds) {
    const base = {
      id: createId(),
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      text: "",
      color: state.stroke,
      fontSize: state.fontSize,
      fontKey: state.fontKey,
      bold: state.bold,
      italic: state.italic,
      underline: state.underline,
      strike: state.strike,
      align: state.align,
      lineHeight: state.lineHeight,
      letterSpacing: state.letterSpacing,
      paragraphSpacing: state.paragraphSpacing,
      textBack: state.textBack,
      list: state.list,
      indent: state.indent,
      rotation: 0,
    };

    if (type === "sticky") {
      return {
        ...base,
        type: "sticky",
        fill: state.fill || STICKY_FILL,
      };
    }

    return {
      ...base,
      type: "text",
    };
  }

  function defaultTextBounds(type, point) {
    const size = type === "sticky" ? STICKY_DEFAULT : TEXT_DEFAULT;
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
    state.active = {
      kind: "textbox",
      pointerId,
      textType: type,
      start: point,
      point,
    };
    queueTextboxPreview(point);
  }

  function queueTextboxPreview(point) {
    if (!state.active || state.active.kind !== "textbox") {
      return;
    }

    state.active.point = point;
    if (!state.raf) {
      state.raf = requestAnimationFrame(flushTextboxPreview);
    }
  }

  function flushTextboxPreview() {
    state.raf = 0;
    if (!state.active || state.active.kind !== "textbox") {
      return;
    }

    const bounds = normalizedBounds(state.active.start, state.active.point);
    state.preview = {
      type: state.active.textType === "sticky" ? "roundrect" : "rect",
      ...bounds,
      radius: 8,
      stroke: SELECT_COLOR,
      fill: state.active.textType === "sticky" ? state.fill || STICKY_FILL : null,
      size: 1,
      rotation: 0,
    };
    redraw();
  }

  function finishTextBox(pointerId) {
    if (!state.active || state.active.kind !== "textbox" || state.active.pointerId !== pointerId) {
      return;
    }

    if (state.raf) {
      cancelAnimationFrame(state.raf);
      flushTextboxPreview();
    }

    const type = state.active.textType;
    const start = state.active.start;
    const point = state.active.point;
    const dragged = normalizedBounds(start, point);
    state.preview = null;
    state.active = null;
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
    state.objects.push(object);
    setSelection([object.id]);
    startEditing(object, true);
  }

  function applyFormatChange(commit) {
    const shouldCommit = commit !== false;
    syncFormatUI();
    if (state.editingId) {
      const object = findObject(state.editingId);
      if (isTable(object) && state.editingCell) {
        const cell = tableCellAt(object, state.editingCell.r, state.editingCell.c);
        if (cell) {
          applyStyleToTableCell(cell);
        }
        positionEditor(object);
        redraw();
        return;
      }
      if (isTextLike(object)) {
        object.color = state.stroke;
        object.fontSize = state.fontSize;
        object.fontKey = state.fontKey;
        object.bold = state.bold;
        object.italic = state.italic;
        object.underline = state.underline;
        object.strike = state.strike;
        object.align = state.align;
        object.lineHeight = state.lineHeight;
        object.letterSpacing = state.letterSpacing;
        object.paragraphSpacing = state.paragraphSpacing;
        object.textBack = state.textBack;
        object.list = state.list;
        object.indent = state.indent;
        if (object.type === "sticky") {
          object.fill = state.fill || object.fill || STICKY_FILL;
        }
        reflowTextHeight(object);
        positionEditor(object);
        redraw();
      }
      return;
    }

    if (state.selectedIds.length > 0 && !state.active) {
      if (!state.historyBefore) {
        captureBefore();
      }
      applyStyleToSelected();
      redraw();
      if (shouldCommit) {
        commitIfChanged();
      }
    }
  }

  function cursorForHandle(handle) {
    if (handle === "rotate") {
      return "grab";
    }
    if (handle === "e" || handle === "w") {
      return "ew-resize";
    }
    if (handle === "n" || handle === "s") {
      return "ns-resize";
    }
    if (handle === "nw" || handle === "se") {
      return "nwse-resize";
    }
    if (handle === "ne" || handle === "sw") {
      return "nesw-resize";
    }
    return "default";
  }

  function updateSelectCursor(point) {
    if (state.spacePan || state.tool === "pan") {
      canvas.style.cursor = state.active && state.active.kind === "pan" ? "grabbing" : "grab";
      return;
    }

    if (state.tool !== "select" || state.active) {
      return;
    }

    const handle = hitHandle(point);
    if (handle) {
      canvas.style.cursor = cursorForHandle(handle);
      return;
    }

    const split = hitTableSplit(point);
    if (split) {
      canvas.style.cursor = split.kind === "col" ? "col-resize" : "row-resize";
      return;
    }

    const object = hitObject(point);
    canvas.style.cursor = isLink(object) ? "pointer" : object ? "move" : "default";
  }

  function onSelectPointerDown(event, point) {
    const handle = hitHandle(point);
    if (handle) {
      captureBefore();
      const mode = handle === "rotate" ? "rotate" : state.cropping && isImage(findObject(state.selectedIds[0])) ? "crop" : "resize";
      canvas.style.cursor = handle === "rotate" ? "grabbing" : cursorForHandle(handle);
      startTransform(mode, handle, point, event.pointerId);
      state.active.shift = event.shiftKey;
      return;
    }

    const split = hitTableSplit(point);
    if (split) {
      captureBefore();
      startTransform("table-split", null, point, event.pointerId);
      state.active.split = split;
      canvas.style.cursor = split.kind === "col" ? "col-resize" : "row-resize";
      return;
    }

    const object = hitObject(point);
    if (object) {
      if (isLink(object) && (event.ctrlKey || event.metaKey) && !event.shiftKey) {
        setSelection([object.id]);
        openExternalLink(object.href);
        redraw();
        return;
      }

      const groupIds = expandGroupIds([object.id]);
      if (isTable(object) && event.shiftKey && state.selectedIds.length === 1 && state.selectedIds[0] === object.id) {
        const cell = hitTableCell(object, objectLocalPoint(object, point));
        if (cell) {
          const from = state.tableCell && state.tableCell.id === object.id ? state.tableCell : cell;
          state.tableRange = { r1: from.r, c1: from.c, r2: cell.r, c2: cell.c };
          state.tableCell = { id: object.id, r: from.r, c: from.c };
          syncFormatFromSelection();
          syncTableUI();
          redraw();
          return;
        }
      }
      if (event.shiftKey) {
        const allSelected = groupIds.every((id) => state.selectedIds.includes(id));
        if (allSelected) {
          setSelection(state.selectedIds.filter((id) => !groupIds.includes(id)));
        } else {
          setSelection([...new Set([...state.selectedIds, ...groupIds])]);
        }
        redraw();
        return;
      }

      if (!state.selectedIds.includes(object.id)) {
        setSelection(groupIds);
      }

      if (isTable(object)) {
        const cell = hitTableCell(object, objectLocalPoint(object, point));
        if (cell) {
          tableSelectCell(object, cell.r, cell.c);
        }
      }

      captureBefore();
      startTransform("move", null, point, event.pointerId);
      redraw();
      return;
    }

    if (!event.shiftKey) {
      clearSelection();
    }

    state.active = {
      kind: "marquee",
      pointerId: event.pointerId,
      start: point,
      point,
      shift: event.shiftKey,
    };
    canvas.style.cursor = "crosshair";
    redraw();
  }

  function flushPoints() {
    state.raf = 0;
    const stroke = state.active && state.active.kind === "stroke" && state.active.stroke;
    const points = state.queuedPoints;
    state.queuedPoints = [];

    if (!stroke || points.length === 0) {
      return;
    }

    let prev = stroke.points[stroke.points.length - 1];
    const added = [];
    for (const point of points) {
      if (prev && point.x === prev.x && point.y === prev.y) {
        continue;
      }

      added.push(point);
      prev = point;
    }

    if (added.length === 0) {
      return;
    }

    if (stroke.tool === "spray") {
      for (const point of added) {
        scatterSpray(stroke, point);
      }
      redraw();
      return;
    }

    const from = stroke.points[stroke.points.length - 1];
    for (const point of added) {
      stroke.points.push(point);
    }

    if (strokeNeedsRedraw(stroke)) {
      redraw();
      return;
    }

    ctx.save();
    configureStroke(stroke);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    for (const point of added) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function flushShapePreview() {
    state.raf = 0;
    if (!state.active || state.active.kind !== "shape" || !state.active.point) {
      return;
    }

    state.preview = makeShape(
      state.active.shapeType,
      state.active.start,
      state.active.point,
      state.active.shift
    );
    redraw();
  }

  function queuePoint(point) {
    if (!state.active || state.active.kind !== "stroke") {
      return;
    }

    state.queuedPoints.push(point);
    if (!state.raf) {
      state.raf = requestAnimationFrame(flushPoints);
    }
  }

  function queueShapePreview(point, shift) {
    if (!state.active || state.active.kind !== "shape") {
      return;
    }

    state.active.point = snapPoint(point);
    state.active.shift = state.tool === "compass" ? true : shift;
    if (!state.raf) {
      state.raf = requestAnimationFrame(flushShapePreview);
    }
  }

  function releasePointer(pointerId) {
    try {
      if (canvas.hasPointerCapture(pointerId)) {
        canvas.releasePointerCapture(pointerId);
      }
    } catch (error) {
      console.error("Drawora: pointer release failed.", error);
    }
  }

  function endStroke(pointerId) {
    if (!state.active || state.active.kind !== "stroke" || state.active.pointerId !== pointerId) {
      return;
    }

    if (state.raf) {
      cancelAnimationFrame(state.raf);
      flushPoints();
    }

    state.active = null;
    releasePointer(pointerId);
    commitIfChanged();
  }

  function finishShape(pointerId) {
    if (!state.active || state.active.kind !== "shape" || state.active.pointerId !== pointerId) {
      return;
    }

    if (state.raf) {
      cancelAnimationFrame(state.raf);
      flushShapePreview();
    }

    const shape = state.preview;
    state.preview = null;
    state.active = null;
    releasePointer(pointerId);

    if (shape && isShapeMeaningful(shape)) {
      captureBefore();
      state.objects.push({ id: createId(), ...shape });
      commitIfChanged();
    }

    redraw();
  }

  function endActive(pointerId) {
    if (!state.active || state.active.pointerId !== pointerId) {
      return;
    }

    if (state.active.kind === "shape") {
      finishShape(pointerId);
      return;
    }

    if (state.active.kind === "transform") {
      finishTransform(pointerId);
      return;
    }

    if (state.active.kind === "textbox") {
      finishTextBox(pointerId);
      return;
    }

    if (state.active.kind === "marquee") {
      finishMarquee(pointerId);
      return;
    }

    if (state.active.kind === "lasso") {
      finishLasso(pointerId);
      return;
    }

    if (state.active.kind === "guide") {
      finishGuide(pointerId);
      return;
    }

    if (state.active.kind === "measure" || state.active.kind === "protractor") {
      finishMeasure(pointerId);
      return;
    }

    if (state.active.kind === "pan") {
      finishPan(pointerId);
      return;
    }

    endStroke(pointerId);
  }

  function startPan(pointerId, screen) {
    canvas.classList.add("is-panning");
    state.active = {
      kind: "pan",
      pointerId,
      startScreen: screen,
      startPanX: state.panX,
      startPanY: state.panY,
    };
  }

  function movePan(screen) {
    if (!state.active || state.active.kind !== "pan") {
      return;
    }

    state.panX = state.active.startPanX + (screen.x - state.active.startScreen.x);
    state.panY = state.active.startPanY + (screen.y - state.active.startScreen.y);
    refreshCameraOverlays();
    redraw();
  }

  function finishPan(pointerId) {
    if (!state.active || state.active.kind !== "pan" || state.active.pointerId !== pointerId) {
      return;
    }

    state.active = null;
    canvas.classList.remove("is-panning");
    releasePointer(pointerId);
    canvas.style.cursor = state.spacePan || state.tool === "pan" ? "grab" : "";
    redraw();
  }

  function queueMarquee(point) {
    if (!state.active || state.active.kind !== "marquee") {
      return;
    }

    state.active.point = point;
    if (!state.raf) {
      state.raf = requestAnimationFrame(flushMarquee);
    }
  }

  function flushMarquee() {
    state.raf = 0;
    if (!state.active || state.active.kind !== "marquee") {
      return;
    }
    redraw();
  }

  function finishMarquee(pointerId) {
    if (!state.active || state.active.kind !== "marquee" || state.active.pointerId !== pointerId) {
      return;
    }

    if (state.raf) {
      cancelAnimationFrame(state.raf);
      state.raf = 0;
    }

    const bounds = normalizedBounds(state.active.start, state.active.point);
    const additive = state.active.shift;
    state.active = null;
    releasePointer(pointerId);

    if (bounds.width >= viewLen(4) || bounds.height >= viewLen(4)) {
      const hits = state.objects
        .filter((object) => isSelectable(object) && boundsIntersect(objectWorldBounds(object), bounds))
        .map((object) => object.id);
      const ids = expandGroupIds(hits);
      if (additive) {
        setSelection([...new Set([...state.selectedIds, ...ids])]);
      } else {
        setSelection(ids);
      }
    }

    canvas.style.cursor = "";
    redraw();
  }

  function scatterSpray(stroke, origin) {
    const count = 8;
    const radius = Math.max(6, stroke.size * 1.8);
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * radius;
      stroke.points.push({
        x: origin.x + Math.cos(angle) * dist,
        y: origin.y + Math.sin(angle) * dist,
      });
    }
  }

  function startStroke(pointerId, point) {
    clearSelection();
    captureBefore();
    const stroke = {
      id: createId(),
      type: "stroke",
      tool: state.tool,
      color: state.stroke,
      size: state.size,
      rotation: 0,
      points: [],
    };

    if (state.tool === "spray") {
      scatterSpray(stroke, point);
    } else {
      stroke.points.push(point);
    }

    state.objects.push(stroke);
    state.active = { kind: "stroke", pointerId, stroke };
    if (stroke.tool === "spray" || strokeNeedsRedraw(stroke)) {
      redraw();
    } else {
      drawDot(stroke, point);
    }
  }

  function startShape(pointerId, point, shift) {
    clearSelection();
    const start = snapPoint(point);
    state.active = {
      kind: "shape",
      pointerId,
      shapeType: state.tool === "compass" ? "ellipse" : state.tool,
      start,
      point: start,
      shift: state.tool === "compass" ? true : shift,
    };
    queueShapePreview(start, state.active.shift);
  }

  function setTool(tool) {
    if (!TOOLS.includes(tool) || tool === state.tool) {
      return;
    }

    if (state.frozen && isFrozenBlockedTool(tool)) {
      return;
    }

    if (tool === "eyedropper") {
      state.eyedropperReturn = state.tool;
    }

    if (state.active) {
      endActive(state.active.pointerId);
    }

    if (state.editingId) {
      finishEditing();
    }

    if (tool !== "select") {
      state.cropping = false;
    }

    if (state.tool === "laser" && tool !== "laser") {
      state.laserTrail = [];
      if (!state.spotlight) {
        state.pointerWorld = null;
      }
    }

    state.tool = tool;
    canvas.dataset.cursor = tool;
    canvas.style.cursor = "";

    if (tool !== "select" && tool !== "pan" && tool !== "lasso" && !isOverlayTool(tool)) {
      clearSelection();
      redraw();
    }

    for (const button of toolbar.querySelectorAll("[data-tool]")) {
      button.setAttribute("aria-pressed", String(button.dataset.tool === tool));
    }
    syncImageUI();
    syncTeachUI();
    announceA11y(`Tool selected: ${tool}`);
  }

  function syncColorUI() {
    const activeColor = state.colorTarget === "fill" ? state.fill : state.stroke;

    for (const button of toolbar.querySelectorAll("[data-color-target]")) {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.colorTarget === state.colorTarget)
      );
    }

    fillTargetButton.classList.toggle("is-none", !state.fill);
    strokePreview.style.background = "#fff";
    strokePreview.style.borderColor = state.stroke;
    fillPreview.style.background = state.fill || "#fff";
    fillPreview.style.borderColor = state.fill || "rgb(28 25 23 / 0.28)";

    let matchedPreset = false;
    for (const swatch of toolbar.querySelectorAll(".swatch[data-color]")) {
      const value = swatch.dataset.color;
      const selected =
        value === "none"
          ? state.colorTarget === "fill" && state.fill === null
          : Boolean(activeColor) && normalizeHex(value) === normalizeHex(activeColor);
      swatch.setAttribute("aria-pressed", String(selected));
      if (selected && value !== "none") {
        matchedPreset = true;
      }
    }

    customSwatch.classList.toggle(
      "is-selected",
      Boolean(activeColor) && !matchedPreset
    );
    if (activeColor && colorInput.value.toLowerCase() !== normalizeHex(activeColor)) {
      colorInput.value = activeColor;
    }
  }

  function setColorTarget(target) {
    if (target !== "stroke" && target !== "fill") {
      return;
    }

    state.colorTarget = target;
    syncColorUI();
  }

  function setColor(color) {
    if (color === "none") {
      state.fill = null;
      state.colorTarget = "fill";
    } else {
      const hex = normalizeHex(color);
      if (state.colorTarget === "fill") {
        state.fill = hex;
      } else {
        state.stroke = hex;
      }
    }

    syncColorUI();
    applyFormatChange();
  }

  function setSizeByIndex(index, commit) {
    const nextIndex = Math.min(SIZE_STOPS.length - 1, Math.max(0, index));
    state.size = SIZE_STOPS[nextIndex];
    sizeInput.value = String(nextIndex);
    sizeValue.textContent = `${state.size}px`;
    sizeInput.setAttribute("aria-valuetext", `${state.size} pixels`);

    if (state.selectedIds.length > 0 && !state.active) {
      applyStyleToSelected(true);
      redraw();
      if (commit) {
        commitIfChanged();
      }
    }
  }

  function capturePointer(pointerId) {
    try {
      canvas.setPointerCapture(pointerId);
    } catch (error) {
      console.error("Drawora: pointer capture failed.", error);
    }
  }

  function onPointerDown(event) {
    const wantsPan =
      event.button === 1 || (event.button === 0 && (state.spacePan || state.tool === "pan"));

    if (wantsPan && event.button !== 2) {
      if (state.active) {
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

    if (state.active) {
      return;
    }

    if (state.skipCanvasClick) {
      state.skipCanvasClick = false;
      return;
    }

    event.preventDefault();
    const screen = getScreenPoint(event);
    const point = getPoint(event);
    state.pointerWorld = point;

    if (state.frozen && state.tool !== "laser") {
      return;
    }

    if (isViewer() && state.tool !== "laser" && state.tool !== "measure" && state.tool !== "protractor") {
      return;
    }

    const rulerAxis = hitRulerEdge(screen);
    if (rulerAxis) {
      startGuideDrag(event.pointerId, rulerAxis, rulerAxis === "x" ? point.x : point.y, -1);
      capturePointer(event.pointerId);
      return;
    }

    const guideIndex = hitGuide(point);
    if (guideIndex >= 0 && (state.tool === "select" || isOverlayTool(state.tool))) {
      const guide = pageGuides()[guideIndex];
      startGuideDrag(event.pointerId, guide.axis, guide.pos, guideIndex);
      capturePointer(event.pointerId);
      return;
    }

    if (state.tool === "laser") {
      pushLaserTrail(point);
      redraw();
      return;
    }

    if (state.tool === "measure" || state.tool === "protractor") {
      startMeasure(state.tool, event.pointerId, point);
      capturePointer(event.pointerId);
      return;
    }

    if (state.tool === "select") {
      onSelectPointerDown(event, point);
      if (state.active) {
        capturePointer(event.pointerId);
      }
      return;
    }

    if (state.tool === "fill") {
      applyFillAt(point);
      return;
    }

    if (state.tool === "eyedropper") {
      pickColorAt(event);
      return;
    }

    if (state.tool === "lasso") {
      startLasso(event.pointerId, point, event.shiftKey);
      capturePointer(event.pointerId);
      return;
    }

    if (isTextTool(state.tool)) {
      startTextBox(event.pointerId, point, state.tool);
      if (state.active) {
        capturePointer(event.pointerId);
      }
      return;
    }

    capturePointer(event.pointerId);

    if (isShapeTool(state.tool) || state.tool === "compass") {
      startShape(event.pointerId, point, event.shiftKey);
      return;
    }

    if (isInkTool(state.tool)) {
      startStroke(event.pointerId, point);
    }
  }

  function onPointerMove(event) {
    const point = getPoint(event);
    state.pointerWorld = point;
    collabSendCursor(point);

    if (!state.active) {
      if (state.tool === "laser") {
        pushLaserTrail(point);
        redraw();
        return;
      }
      if (state.spotlight) {
        redraw();
      }
      updateSelectCursor(point);
      return;
    }

    if (event.pointerId !== state.active.pointerId) {
      return;
    }

    event.preventDefault();

    if (state.active.kind === "pan") {
      movePan(getScreenPoint(event));
      return;
    }

    if (state.active.kind === "guide") {
      moveGuide(point);
      return;
    }

    if (state.active.kind === "measure" || state.active.kind === "protractor") {
      moveMeasure(point);
      return;
    }

    if (state.active.kind === "transform") {
      queueSelectDrag(point, event.shiftKey);
      return;
    }

    if (state.active.kind === "textbox") {
      queueTextboxPreview(point);
      return;
    }

    if (state.active.kind === "shape") {
      queueShapePreview(point, event.shiftKey);
      return;
    }

    if (state.active.kind === "marquee") {
      queueMarquee(point);
      return;
    }

    if (state.active.kind === "lasso") {
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
    if (state.active && event.pointerId === state.active.pointerId) {
      endActive(event.pointerId);
      return;
    }

    releasePointer(event.pointerId);
  }

  function onPointerLeave(event) {
    if (!state.active || event.pointerId !== state.active.pointerId) {
      return;
    }

    if (canvas.hasPointerCapture(event.pointerId)) {
      return;
    }

    endActive(event.pointerId);
  }

  function setRibbonTab(name) {
    if (!RIBBON_TABS.includes(name)) {
      return;
    }

    state.ribbonTab = name;
    closeRibbonMenus();

    for (const tab of ribbonTabs.querySelectorAll("[data-ribbon-tab]")) {
      const selected = tab.dataset.ribbonTab === name;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    }

    for (const panel of toolbar.querySelectorAll(".ribbon-panel")) {
      panel.hidden = panel.dataset.ribbon !== name;
    }

    const panels = toolbar.querySelector(".ribbon-panels");
    if (panels) {
      panels.scrollLeft = 0;
    }
    layoutRibbonOverflow();
    requestAnimationFrame(layoutRibbonOverflow);
  }

  function isRibbonToolItem(element) {
    return (
      element instanceof HTMLElement &&
      !element.classList.contains("ribbon-more") &&
      !element.classList.contains("ribbon-menu")
    );
  }

  function prepareRibbonOverflow() {
    for (const group of toolbar.querySelectorAll(".ribbon-group")) {
      const tools = group.querySelector(":scope > .ribbon-group-tools");
      if (!tools || group.querySelector(":scope > .ribbon-group-main")) {
        continue;
      }

      [...tools.children].forEach((item, index) => {
        if (isRibbonToolItem(item)) {
          item.dataset.ribbonIndex = String(index);
        }
      });

      const main = document.createElement("div");
      main.className = "ribbon-group-main";
      const more = document.createElement("button");
      more.type = "button";
      more.className = "ribbon-more";
      more.hidden = true;
      more.setAttribute("aria-expanded", "false");
      const label = group.querySelector(".ribbon-group-label");
      more.title = label ? `More ${label.textContent.trim()} options` : "More options";
      more.setAttribute("aria-label", more.title);
      more.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9.5 12 14.5 17 9.5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      const menu = document.createElement("div");
      menu.className = "ribbon-menu";
      menu.hidden = true;
      menu.setAttribute("role", "menu");
      tools.replaceWith(main);
      main.append(tools, more);
      group.insertBefore(menu, label || null);
    }
  }

  function restoreRibbonItems(group) {
    const tools = group.querySelector(".ribbon-group-tools");
    const menu = group.querySelector(".ribbon-menu");
    if (!tools || !menu) {
      return;
    }
    while (menu.firstChild) {
      tools.appendChild(menu.firstChild);
    }
    [...tools.children]
      .filter(isRibbonToolItem)
      .sort((a, b) => Number(a.dataset.ribbonIndex) - Number(b.dataset.ribbonIndex))
      .forEach((item) => tools.appendChild(item));
  }

  function closeRibbonMenus() {
    for (const menu of toolbar.querySelectorAll(".ribbon-menu")) {
      menu.hidden = true;
    }
    for (const more of toolbar.querySelectorAll(".ribbon-more")) {
      more.setAttribute("aria-expanded", "false");
    }
  }

  function positionRibbonMenu(more, menu) {
    const rect = more.getBoundingClientRect();
    menu.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - 220))}px`;
    menu.style.top = `${rect.bottom + 4}px`;
  }

  function hideRibbonMore(group) {
    const more = group.querySelector(".ribbon-more");
    const menu = group.querySelector(".ribbon-menu");
    group.classList.remove("is-collapsed");
    if (more) {
      more.hidden = true;
      more.setAttribute("aria-expanded", "false");
    }
    if (menu) {
      menu.hidden = true;
    }
  }

  function sortRibbonMenu(menu) {
    [...menu.children]
      .filter(isRibbonToolItem)
      .sort((a, b) => Number(a.dataset.ribbonIndex) - Number(b.dataset.ribbonIndex))
      .forEach((item) => menu.appendChild(item));
  }

  function syncRibbonCollapsed(group) {
    const tools = group.querySelector(".ribbon-group-tools");
    const more = group.querySelector(".ribbon-more");
    const visible = Boolean(
      tools && [...tools.children].some((item) => isRibbonToolItem(item) && !item.hidden)
    );
    group.classList.toggle("is-collapsed", Boolean(more && !more.hidden && !visible));
  }

  function stripOverflows(strip, groups) {
    const right = strip.getBoundingClientRect().right;
    return groups.some((group) => group.getBoundingClientRect().right > right + 1);
  }

  function parkGroupUntilStripFits(group, strip) {
    const tools = group.querySelector(".ribbon-group-tools");
    const more = group.querySelector(".ribbon-more");
    const menu = group.querySelector(".ribbon-menu");
    if (!tools || !more || !menu) {
      return;
    }

    let guard = 40;
    while (guard > 0 && group.getBoundingClientRect().right > strip.getBoundingClientRect().right + 1) {
      guard -= 1;
      const items = [...tools.children].filter((item) => isRibbonToolItem(item) && !item.hidden);
      if (items.length === 0) {
        break;
      }
      more.hidden = false;
      menu.appendChild(items[items.length - 1]);
      syncRibbonCollapsed(group);
    }
    sortRibbonMenu(menu);
    if (!menu.childElementCount) {
      more.hidden = true;
    }
    syncRibbonCollapsed(group);
  }

  function layoutRibbonStrip(strip) {
    if (!strip) {
      return;
    }

    const groups = [...strip.querySelectorAll(":scope > .ribbon-group")];
    for (const group of groups) {
      restoreRibbonItems(group);
      hideRibbonMore(group);
    }

    if (strip.hidden) {
      return;
    }

    for (let index = groups.length - 1; index >= 0 && stripOverflows(strip, groups); index -= 1) {
      parkGroupUntilStripFits(groups[index], strip);
    }
  }

  function layoutRibbonOverflow() {
    closeRibbonMenus();
    for (const panel of toolbar.querySelectorAll(".ribbon-panel")) {
      const groups = [...panel.querySelectorAll(":scope > .ribbon-group")];
      for (const group of groups) {
        restoreRibbonItems(group);
        hideRibbonMore(group);
      }
    }
    layoutRibbonStrip(toolbar.querySelector(".ribbon-persistent"));
  }

  function toggleRibbonMenu(more) {
    const group = more.closest(".ribbon-group");
    const menu = group && group.querySelector(".ribbon-menu");
    if (!menu) {
      return;
    }

    const open = menu.hidden;
    closeRibbonMenus();
    if (!open) {
      return;
    }

    menu.hidden = false;
    more.setAttribute("aria-expanded", "true");
    positionRibbonMenu(more, menu);
  }

  function onRibbonTabKey(event) {
    const tabs = [...ribbonTabs.querySelectorAll("[data-ribbon-tab]")];
    const current = tabs.findIndex((tab) => tab.dataset.ribbonTab === state.ribbonTab);
    if (current < 0) {
      return;
    }

    let next = current;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (current + 1) % tabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (current - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    setRibbonTab(tabs[next].dataset.ribbonTab);
    tabs[next].focus();
  }

  function changeIndent(delta) {
    state.indent = Math.min(MAX_INDENT, Math.max(0, (state.indent || 0) + delta));
    applyFormatChange();
  }

  function applyFormatCommand(format) {
    if (format === "bold") {
      state.bold = !state.bold;
    } else if (format === "italic") {
      state.italic = !state.italic;
    } else if (format === "underline") {
      state.underline = !state.underline;
    } else if (format === "strike") {
      state.strike = !state.strike;
    } else if (format.startsWith("align-")) {
      state.align = format.slice("align-".length);
    } else if (format === "list-bullet") {
      state.list = state.list === "bullet" ? "none" : "bullet";
    } else if (format === "list-number") {
      state.list = state.list === "number" ? "none" : "number";
    } else if (format === "indent") {
      changeIndent(1);
      return;
    } else if (format === "outdent") {
      changeIndent(-1);
      return;
    } else if (format === "text-back-none") {
      state.textBack = null;
    } else {
      return;
    }
    applyFormatChange();
  }

  function applyTextMetrics(commit) {
    const lineHeight = Math.min(3, Math.max(1, Number(lineHeightInput.value) || 1.35));
    const letterSpacing = Math.min(16, Math.max(-4, Number(letterSpacingInput.value) || 0));
    const paragraphSpacing = Math.min(48, Math.max(0, Number(paraSpacingInput.value) || 0));
    const same =
      lineHeight === state.lineHeight &&
      letterSpacing === state.letterSpacing &&
      paragraphSpacing === state.paragraphSpacing;
    if (same && !state.historyBefore) {
      return;
    }
    state.lineHeight = lineHeight;
    state.letterSpacing = letterSpacing;
    state.paragraphSpacing = paragraphSpacing;
    applyFormatChange(commit);
  }

  function beginBoardText(point) {
    finishOpenWork();
    const page = currentPage();
    const maxWidth = page ? Math.max(MIN_TEXT_WIDTH, page.width - point.x - 32) : TEXT_DEFAULT.width;
    captureBefore();
    const object = createTextLike("text", {
      x: point.x,
      y: point.y,
      width: Math.max(MIN_TEXT_WIDTH, Math.min(TEXT_DEFAULT.width, maxWidth)),
      height: TEXT_DEFAULT.height,
    });
    state.objects.push(object);
    setSelection([object.id]);
    startEditing(object, true);
  }

  function onToolbarClick(event) {
    if (isViewer()) {
      const allowedViewerActions = [
        "zoom-in", "zoom-out", "zoom-reset", "zoom-fit", "zoom-selection",
        "fullscreen", "presentation-start", "presentation-stop", "link-open",
        "open-projects", "open-collab", "export-dialog"
      ];
      const toolButton = event.target.closest("[data-tool]");
      if (toolButton && toolbar.contains(toolButton)) {
        const t = toolButton.dataset.tool;
        if (t === "pan" || t === "laser" || t === "measure" || t === "protractor") {
          setTool(t);
        }
        return;
      }
      const actionBtn = event.target.closest("[data-action]");
      if (actionBtn && toolbar.contains(actionBtn)) {
        const act = actionBtn.dataset.action;
        if (!allowedViewerActions.includes(act) && !act.startsWith("help-")) {
          return;
        }
      } else {
        const more = event.target.closest(".ribbon-more");
        if (more && toolbar.contains(more)) {
          toggleRibbonMenu(more);
        }
        return;
      }
    }

    const more = event.target.closest(".ribbon-more");
    if (more && toolbar.contains(more)) {
      toggleRibbonMenu(more);
      return;
    }

    const formatButton = event.target.closest("[data-format]");
    if (formatButton && toolbar.contains(formatButton) && !formatButton.disabled) {
      if (state.frozen) {
        return;
      }
      applyFormatCommand(formatButton.dataset.format);
      return;
    }

    const insertButton = event.target.closest("[data-insert]");
    if (insertButton && toolbar.contains(insertButton) && !insertButton.disabled) {
      if (state.frozen) {
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
    if (toolButton && toolbar.contains(toolButton) && !toolButton.disabled) {
      setTool(toolButton.dataset.tool);
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (actionButton && toolbar.contains(actionButton) && !actionButton.disabled) {
      const action = actionButton.dataset.action;
      if (state.frozen && !actionAllowedWhenFrozen(action)) {
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
        zoomBy(ZOOM_STEP);
      } else if (action === "zoom-out") {
        zoomBy(1 / ZOOM_STEP);
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
        projectFileInput.click();
      } else if (action.startsWith("table-")) {
        runTableAction(action);
      }
      return;
    }

    const presetButton = event.target.closest("[data-page-preset]");
    if (presetButton && toolbar.contains(presetButton) && !presetButton.disabled) {
      setPagePreset(presetButton.dataset.pagePreset);
      return;
    }

    const orientationButton = event.target.closest("[data-page-orientation]");
    if (orientationButton && toolbar.contains(orientationButton) && !orientationButton.disabled) {
      setPageOrientation(orientationButton.dataset.pageOrientation);
      return;
    }

    const modeButton = event.target.closest("[data-page-mode]");
    if (modeButton && toolbar.contains(modeButton) && !modeButton.disabled) {
      setPageMode(modeButton.dataset.pageMode);
      return;
    }

    const templateButton = event.target.closest("[data-page-template]");
    if (templateButton && toolbar.contains(templateButton) && !templateButton.disabled) {
      setPageTemplate(templateButton.dataset.pageTemplate);
      return;
    }

    const targetButton = event.target.closest("[data-color-target]");
    if (targetButton && toolbar.contains(targetButton)) {
      setColorTarget(targetButton.dataset.colorTarget);
      return;
    }

    const swatch = event.target.closest(".swatch[data-color]");
    if (swatch && toolbar.contains(swatch)) {
      setColor(swatch.dataset.color);
    }
  }

  function refreshShapeShift(shift) {
    if (!state.active || state.active.kind !== "shape" || !state.active.point) {
      return;
    }

    queueShapePreview(state.active.point, shift);
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
      state.bold = !state.bold;
      applyFormatChange();
      return true;
    }

    if (ctrl && event.key.toLowerCase() === "i") {
      event.preventDefault();
      state.italic = !state.italic;
      applyFormatChange();
      return true;
    }

    if (ctrl && event.key.toLowerCase() === "u") {
      event.preventDefault();
      state.underline = !state.underline;
      applyFormatChange();
      return true;
    }

    if (event.key === "Tab") {
      const object = findObject(state.editingId);
      if (isTable(object) && state.editingCell) {
        event.preventDefault();
        moveTableEdit(event.shiftKey ? -1 : 1, 0);
        return true;
      }
      event.preventDefault();
      changeIndent(event.shiftKey ? -1 : 1);
      return true;
    }

    if (event.key === "Enter" && !ctrl && !event.shiftKey) {
      const object = findObject(state.editingId);
      if (isTable(object) && state.editingCell) {
        event.preventDefault();
        moveTableEdit(0, 1);
        return true;
      }
    }

    return false;
  }

  function onKeyDown(event) {
    if (state.presentationScreen) {
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

    if (!collabDialog.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCollabDialog();
      } else if (event.key === "Tab") {
        handleModalTabKey(event, collabDialog);
      }
      return;
    }

    if (!exportDialog.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeExportDialog();
      } else if (event.key === "Tab") {
        handleModalTabKey(event, exportDialog);
      }
      return;
    }

    if (!projectsDialog.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeProjectsDialog();
      } else if (event.key === "Tab") {
        handleModalTabKey(event, projectsDialog);
      }
      return;
    }

    if (!confirmDialog.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeConfirmDialog();
      } else if (event.key === "Tab") {
        handleModalTabKey(event, confirmDialog);
      }
      return;
    }

    if (!linkDialog.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLinkDialog();
      } else if (event.key === "Tab") {
        handleModalTabKey(event, linkDialog);
      }
      return;
    }

    if (shortcutsDialog && !shortcutsDialog.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeShortcutsDialog();
      } else if (event.key === "Tab") {
        handleModalTabKey(event, shortcutsDialog);
      }
      return;
    }

    if (isTypingTarget(event.target)) {
      if (event.target === editor) {
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

    if (state.presenting) {
      if (event.key === "Escape") {
        event.preventDefault();
        stopPresentation();
        return;
      }
      const keyLower = event.key.toLowerCase();
      if (keyLower === "b" || event.key === ".") {
        event.preventDefault();
        setPresentationScreen(state.presentationScreen === "black" ? null : "black");
        return;
      }
      if (keyLower === "w" || event.key === ",") {
        event.preventDefault();
        setPresentationScreen(state.presentationScreen === "white" ? null : "white");
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
      if ([...toolbar.querySelectorAll(".ribbon-menu")].some((menu) => !menu.hidden)) {
        closeRibbonMenus();
        return;
      }
      if (state.cropping) {
        state.cropping = false;
        syncImageUI();
        redraw();
        return;
      }
      if (state.tool === "laser") {
        setTool("select");
        return;
      }
      cancelActive();
      return;
    }

    if (state.frozen && ctrl) {
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
      state.bold = !state.bold;
      applyFormatChange();
      return;
    }

    if (ctrl && event.key.toLowerCase() === "i") {
      event.preventDefault();
      state.italic = !state.italic;
      applyFormatChange();
      return;
    }

    if (ctrl && event.key.toLowerCase() === "u") {
      event.preventDefault();
      state.underline = !state.underline;
      applyFormatChange();
      return;
    }

    if (ctrl && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (state.frozen) {
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
      state.tableCell &&
      !state.active &&
      !state.frozen &&
      !(event.target instanceof Node && toolbar.contains(event.target))
    ) {
      const table = selectedTable();
      if (event.key === "Enter") {
        event.preventDefault();
        startTableCellEdit(table, state.tableCell.r, state.tableCell.c);
        return;
      }
      if (event.key === "Tab") {
        event.preventDefault();
        const next = stepTableCell(table, state.tableCell.r, state.tableCell.c, event.shiftKey ? -1 : 1, 0);
        tableSelectCell(table, next.r, next.c);
        redraw();
        return;
      }
      const step = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
      if (step) {
        event.preventDefault();
        const next = stepTableCell(table, state.tableCell.r, state.tableCell.c, step[0], step[1]);
        tableSelectCell(table, next.r, next.c);
        redraw();
        return;
      }
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      if (state.frozen) {
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
      state.spacePan = true;
      canvas.style.cursor = "grab";
      return;
    }

    if (ctrl && (event.key === "=" || event.key === "+" || event.code === "NumpadAdd")) {
      event.preventDefault();
      zoomBy(ZOOM_STEP);
      return;
    }

    if (ctrl && (event.key === "-" || event.code === "NumpadSubtract")) {
      event.preventDefault();
      zoomBy(1 / ZOOM_STEP);
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

    if (state.frozen && ctrl) {
      event.preventDefault();
      return;
    }

    if (ctrl || event.altKey) {
      return;
    }

    const tool = SHORTCUTS[event.key.toLowerCase()];
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
      state.spacePan = false;
      if (!state.active || state.active.kind !== "pan") {
        canvas.style.cursor = "";
      }
    }
  }

  toolbar.addEventListener("click", onToolbarClick);
  ribbonTabs.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-ribbon-tab]");
    if (tab) {
      setRibbonTab(tab.dataset.ribbonTab);
    }
  });
  ribbonTabs.addEventListener("keydown", onRibbonTabKey);
  undoBtn.addEventListener("click", () => {
    if (!state.frozen) {
      undo();
    }
  });
  redoBtn.addEventListener("click", () => {
    if (!state.frozen) {
      redo();
    }
  });
  deleteBtn.addEventListener("click", () => {
    if (state.frozen) {
      return;
    }
    if (state.editingId) {
      finishEditing();
    }
    deleteSelected();
  });
  fontSizeSelect.addEventListener("change", () => {
    state.fontSize = Number(fontSizeSelect.value);
    applyFormatChange();
  });
  fontFamilySelect.addEventListener("change", () => {
    state.fontKey = fontFamilySelect.value;
    applyFormatChange();
  });
  lineHeightInput.addEventListener("input", () => applyTextMetrics(false));
  letterSpacingInput.addEventListener("input", () => applyTextMetrics(false));
  paraSpacingInput.addEventListener("input", () => applyTextMetrics(false));
  lineHeightInput.addEventListener("change", () => applyTextMetrics(true));
  letterSpacingInput.addEventListener("change", () => applyTextMetrics(true));
  paraSpacingInput.addEventListener("change", () => applyTextMetrics(true));
  textBackInput.addEventListener("input", () => {
    state.textBack = textBackInput.value;
    applyFormatChange(false);
  });
  textBackInput.addEventListener("change", () => {
    state.textBack = textBackInput.value;
    applyFormatChange(true);
  });
  editor.addEventListener("input", () => {
    const object = findObject(state.editingId);
    if (isTable(object) && state.editingCell) {
      const cell = tableCellAt(object, state.editingCell.r, state.editingCell.c);
      if (cell) {
        cell.text = editor.value;
      }
      return;
    }
    if (!isTextLike(object)) {
      return;
    }

    object.text = editor.value;
    reflowTextHeight(object);
    const nextHeight = Math.max(object.height, editor.scrollHeight / state.zoom);
    object.height = nextHeight;
    positionEditor(object);
    redraw();
  });
  canvas.addEventListener("dblclick", (event) => {
    if (event.button !== 0 || state.spacePan || state.tool === "pan" || state.frozen) {
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
  document.addEventListener(
    "pointerdown",
    (event) => {
      if (!state.editingId) {
        return;
      }

      const target = event.target;
      if (
        !(target instanceof Node) ||
        editor.contains(target) ||
        (target instanceof Element &&
          (target.closest(".chrome") || target.closest(".statusbar")))
      ) {
        return;
      }

      finishEditing();
      if (
        isTextTool(state.tool) &&
        (event.target === canvas || event.target === canvas.parentElement)
      ) {
        state.skipCanvasClick = true;
      }
    },
    true
  );
  colorInput.addEventListener("input", () => {
    setColor(colorInput.value);
  });
  sizeInput.addEventListener("pointerdown", () => {
    if (state.selectedIds.length > 0 && !state.active) {
      captureBefore();
    }
  });
  sizeInput.addEventListener("input", () => {
    setSizeByIndex(Number(sizeInput.value), false);
  });
  sizeInput.addEventListener("change", () => {
    if (state.selectedIds.length > 0) {
      commitIfChanged();
    }
  });
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  document.addEventListener("paste", onPaste);
  document.addEventListener("dragover", onWindowDragOver);
  document.addEventListener("drop", onDrop);
  canvasWrap.addEventListener("dragenter", onCanvasDragOver);
  canvasWrap.addEventListener("dragover", onCanvasDragOver);
  canvasWrap.addEventListener("dragleave", (event) => {
    if (!canvasWrap.contains(event.relatedTarget)) {
      setDropTarget(false);
    }
  });
  imageFileInput.addEventListener("change", () => {
    const file = imageFileInput.files && imageFileInput.files[0];
    imageFileInput.value = "";
    if (file) {
      insertImageFromBlob(file);
    }
  });
  documentFileInput.addEventListener("change", () => {
    const file = documentFileInput.files && documentFileInput.files[0];
    documentFileInput.value = "";
    if (file) {
      insertImportedFile(file);
    }
  });
  linkForm.addEventListener("submit", (event) => {
    event.preventDefault();
    commitLinkDialog();
  });
  linkCancel.addEventListener("click", () => {
    closeLinkDialog();
  });
  linkDialog.addEventListener("pointerdown", (event) => {
    if (event.target === linkDialog) {
      closeLinkDialog();
    }
  });
  confirmForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const action = confirmCallback;
    closeConfirmDialog();
    if (action) {
      action();
    }
  });
  confirmCancel.addEventListener("click", () => {
    closeConfirmDialog();
  });
  confirmDialog.addEventListener("pointerdown", (event) => {
    if (event.target === confirmDialog) {
      closeConfirmDialog();
    }
  });
  document.addEventListener("fullscreenchange", () => {
    syncTeachUI();
  });
  const imageFieldInputs = [
    imageOpacityInput,
    imageRadiusInput,
    imageBrightnessInput,
    imageContrastInput,
    imageSaturationInput,
    imageBlurInput,
  ];
  for (const input of imageFieldInputs) {
    input.addEventListener("pointerdown", () => {
      if (selectedImage() && !state.historyBefore) {
        captureBefore();
      }
    });
    input.addEventListener("input", () => applyImageFields(false));
    input.addEventListener("change", () => applyImageFields(true));
  }

  canvas.addEventListener("pointerdown", onPointerDown, { passive: false });
  canvas.addEventListener("pointermove", onPointerMove, { passive: false });
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("lostpointercapture", onPointerUp);
  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
  canvas.addEventListener("auxclick", (event) => {
    if (event.button === 1) {
      event.preventDefault();
    }
  });
  canvas.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      if (state.active && state.active.kind !== "pan") {
        return;
      }
      const factor = event.deltaY > 0 ? 1 / 1.08 : 1.08;
      zoomBy(factor, getScreenPoint(event));
    },
    { passive: false }
  );
  zoomLabel.addEventListener("click", () => resetView());

  pageNameInput.addEventListener("change", () => {
    renamePage(pageNameInput.value);
  });
  pageNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      pageNameInput.blur();
    }
  });
  pageWidthInput.addEventListener("input", () => applyCustomPageSize(false));
  pageHeightInput.addEventListener("input", () => applyCustomPageSize(false));
  pageWidthInput.addEventListener("change", () => applyCustomPageSize(true));
  pageHeightInput.addEventListener("change", () => applyCustomPageSize(true));
  pageWidthInput.addEventListener("blur", () => applyCustomPageSize(true));
  pageHeightInput.addEventListener("blur", () => applyCustomPageSize(true));
  paperColorInput.addEventListener("input", () => applySurfaceLook(false));
  lineColorInput.addEventListener("input", () => applySurfaceLook(false));
  paperColorInput.addEventListener("change", () => applySurfaceLook(true));
  lineColorInput.addEventListener("change", () => applySurfaceLook(true));
  lineSpacingInput.addEventListener("input", () => applySurfaceLook(false));
  gridSizeInput.addEventListener("input", () => applySurfaceLook(false));
  pageMarginInput.addEventListener("input", () => applySurfaceLook(false));
  lineSpacingInput.addEventListener("change", () => applySurfaceLook(true));
  gridSizeInput.addEventListener("change", () => applySurfaceLook(true));
  pageMarginInput.addEventListener("change", () => applySurfaceLook(true));
  lineSpacingInput.addEventListener("blur", () => applySurfaceLook(true));
  gridSizeInput.addEventListener("blur", () => applySurfaceLook(true));
  pageMarginInput.addEventListener("blur", () => applySurfaceLook(true));

  statusbar.addEventListener("click", (event) => {
    if (event.target.closest('[data-action="page-add"]')) {
      addPage();
    }
  });
  pageThumbs.addEventListener("click", (event) => {
    if (state.pageDragMoved) {
      state.pageDragMoved = false;
      return;
    }
    const thumb = event.target.closest("[data-page-id]");
    if (thumb) {
      switchPage(thumb.dataset.pageId);
    }
  });
  pageThumbs.addEventListener("dblclick", (event) => {
    const thumb = event.target.closest("[data-page-id]");
    if (!thumb) {
      return;
    }
    switchPage(thumb.dataset.pageId);
    setRibbonTab("page");
    pageNameInput.focus();
    pageNameInput.select();
  });
  pageThumbs.addEventListener("dragstart", (event) => {
    const thumb = event.target.closest("[data-page-id]");
    if (!thumb) {
      return;
    }
    state.pageDragId = thumb.dataset.pageId;
    state.pageDragMoved = false;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", thumb.dataset.pageId);
  });
  pageThumbs.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  });
  pageThumbs.addEventListener("drop", (event) => {
    event.preventDefault();
    const thumb = event.target.closest("[data-page-id]");
    const fromId = state.pageDragId || event.dataTransfer.getData("text/plain");
    if (thumb && fromId && fromId !== thumb.dataset.pageId) {
      state.pageDragMoved = true;
      reorderPage(fromId, thumb.dataset.pageId);
    }
    state.pageDragId = null;
  });
  pageThumbs.addEventListener("dragend", () => {
    state.pageDragId = null;
  });

  layersPanel.addEventListener("click", (event) => {
    const actionBtn = event.target.closest("[data-action]");
    if (actionBtn && layersPanel.contains(actionBtn) && !actionBtn.disabled) {
      const action = actionBtn.dataset.action;
      if (state.frozen && !actionAllowedWhenFrozen(action)) {
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
          const allSelected = groupIds.every((gid) => state.selectedIds.includes(gid));
          if (allSelected) {
            setSelection(state.selectedIds.filter((gid) => !groupIds.includes(gid)));
          } else {
            setSelection([...new Set([...state.selectedIds, ...groupIds])]);
          }
        } else {
          setSelection(groupIds);
        }
        redraw();
      }
    }
  });

  layersList.addEventListener("dblclick", (event) => {
    const label = event.target.closest(".layer-label");
    if (!label) {
      return;
    }
    const row = label.closest(".layer-row");
    if (!row) {
      return;
    }
    const object = findObject(row.dataset.id);
    if (object && !state.frozen) {
      beginLayerRename(object, label);
    }
  });

  layersList.addEventListener("dragstart", (event) => {
    const row = event.target.closest(".layer-row");
    if (!row || state.frozen) {
      return;
    }
    state.layerDragId = row.dataset.id;
    row.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", row.dataset.id);
  });

  layersList.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const row = event.target.closest(".layer-row");
    if (!row || row.dataset.id === state.layerDragId) {
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

  layersList.addEventListener("dragleave", (event) => {
    const row = event.target.closest(".layer-row");
    if (row && (!event.relatedTarget || !row.contains(event.relatedTarget))) {
      row.classList.remove("drop-above", "drop-below");
    }
  });

  layersList.addEventListener("drop", (event) => {
    event.preventDefault();
    const row = event.target.closest(".layer-row");
    for (const el of layersList.querySelectorAll(".drop-above, .drop-below, .is-dragging")) {
      el.classList.remove("drop-above", "drop-below", "is-dragging");
    }
    const targetId = row ? row.dataset.id : null;
    const sourceId = state.layerDragId || event.dataTransfer.getData("text/plain");
    if (row && targetId && sourceId && targetId !== sourceId) {
      const rect = row.getBoundingClientRect();
      const placeAbove = event.clientY < rect.top + rect.height / 2;
      reorderLayerItem(sourceId, targetId, placeAbove);
    }
    state.layerDragId = null;
  });

  layersList.addEventListener("dragend", () => {
    for (const el of layersList.querySelectorAll(".drop-above, .drop-below, .is-dragging")) {
      el.classList.remove("drop-above", "drop-below", "is-dragging");
    }
    state.layerDragId = null;
  });

  const firstPage = makePage({ name: "Page 1", preset: "a4", orientation: "portrait" });
  state.pages = [firstPage];
  attachPage(firstPage);

  prepareRibbonOverflow();
  window.addEventListener("resize", layoutRibbonOverflow);
  const ribbonPanels = toolbar.querySelector(".ribbon-panels");
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
  toolbar.addEventListener("click", (event) => {
    if (event.target.closest(".ribbon-menu") && event.target.closest("button.ribbon-btn, button.ribbon-btn-wide")) {
      closeRibbonMenus();
    }
  });

  boardTitleInput.addEventListener("change", () => {
    renameBoard(boardTitleInput.value);
  });
  boardTitleInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      boardTitleInput.blur();
    }
  });

  boardsBtn.addEventListener("click", () => {
    openProjectsDialog();
  });

  projectsDialog.addEventListener("click", (event) => {
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

    if (event.target === projectsDialog) {
      closeProjectsDialog();
    }
  });

  projectsSearch.addEventListener("input", () => {
    renderProjectsList();
  });

  exportFormatSelect.addEventListener("change", syncExportOptionsUI);
  exportScopeSelect.addEventListener("change", syncExportOptionsUI);
  exportScaleSelect.addEventListener("change", syncExportOptionsUI);
  exportTransparentBg.addEventListener("change", syncExportOptionsUI);
  exportQualityRange.addEventListener("input", () => {
    exportQualityVal.textContent = `${exportQualityRange.value}%`;
  });

  exportDialog.addEventListener("click", (event) => {
    const actionBtn = event.target.closest("[data-action]");
    if (actionBtn && actionBtn.dataset.action === "close-export") {
      closeExportDialog();
      return;
    }
    if (event.target === exportDialog) {
      closeExportDialog();
    }
  });

  exportDownloadBtn.addEventListener("click", executeExportDownload);

  projectFileInput.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      handleImportProjectFile(file);
    }
    projectFileInput.value = "";
  });

  importProjectBtn.addEventListener("click", () => {
    projectFileInput.click();
  });

  presenterBar.addEventListener("click", (event) => {
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
      setPresentationScreen(state.presentationScreen === "black" ? null : "black");
    } else if (action === "presenter-white") {
      setPresentationScreen(state.presentationScreen === "white" ? null : "white");
    } else if (action === "presenter-fit") {
      fitCanvas();
    } else if (action === "presentation-stop") {
      stopPresentation();
    }
  });

  presentationCurtain.addEventListener("click", () => {
    setPresentationScreen(null);
  });

  window.addEventListener("pointermove", () => {
    if (state.presenting) {
      resetPresenterIdleTimer();
    }
  });

  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && state.presenting) {
      stopPresentation();
    }
    syncTeachUI();
  });

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

  let deferredInstallPrompt = null;

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
      deferredInstallPrompt = event;
      if (installAppBtn) {
        installAppBtn.hidden = false;
      }
    });

    if (installAppBtn) {
      installAppBtn.addEventListener("click", async () => {
        if (!deferredInstallPrompt) {
          return;
        }
        installAppBtn.hidden = true;
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        console.log("Drawora: User install choice outcome:", outcome);
        deferredInstallPrompt = null;
      });
    }

    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      if (installAppBtn) {
        installAppBtn.hidden = true;
      }
      console.log("Drawora: PWA installed successfully.");
    });
  }

  collabPresenceBtn.addEventListener("click", openCollabDialog);
  shareBtn.addEventListener("click", openCollabDialog);

  if (helpShortcutsBtn) {
    helpShortcutsBtn.addEventListener("click", () => openShortcutsDialog("keys"));
  }
  if (helpAboutBtn) {
    helpAboutBtn.addEventListener("click", () => openShortcutsDialog("about"));
  }

  if (shortcutsDialog) {
    shortcutsDialog.addEventListener("click", (event) => {
      if (event.target === shortcutsDialog || event.target.closest('[data-action="close-shortcuts"]')) {
        closeShortcutsDialog();
        return;
      }
      const tabBtn = event.target.closest(".shortcuts-tab-btn");
      if (tabBtn && tabBtn.dataset.tab) {
        setShortcutsTab(tabBtn.dataset.tab);
      }
    });
  }

  collabDialog.addEventListener("click", (event) => {
    if (event.target === collabDialog || event.target.closest('[data-action="close-collab"]')) {
      closeCollabDialog();
    }
  });

  collabRandomBtn.addEventListener("click", () => {
    collabRoomInput.value = "room-" + Math.random().toString(36).substring(2, 7);
    syncCollabUI();
  });

  collabRoomInput.addEventListener("input", syncCollabUI);

  collabCopyEditorBtn.addEventListener("click", async () => {
    const urls = getCollabShareUrls(collabRoomInput.value || state.collabRoomId);
    try {
      await navigator.clipboard.writeText(urls.editor);
      collabCopyEditorBtn.textContent = "Copied!";
      setTimeout(() => {
        collabCopyEditorBtn.textContent = "Copy";
      }, 2000);
    } catch {
      window.prompt("Editor Invite Link:", urls.editor);
    }
  });

  collabCopyViewerBtn.addEventListener("click", async () => {
    const urls = getCollabShareUrls(collabRoomInput.value || state.collabRoomId);
    try {
      await navigator.clipboard.writeText(urls.viewer);
      collabCopyViewerBtn.textContent = "Copied!";
      setTimeout(() => {
        collabCopyViewerBtn.textContent = "Copy";
      }, 2000);
    } catch {
      window.prompt("Viewer Invite Link:", urls.viewer);
    }
  });

  collabSelfRole.addEventListener("change", (event) => {
    setCollabRole(event.target.value, true);
  });

  collabConnectBtn.addEventListener("click", () => {
    collabConnect(collabRoomInput.value, collabSelfRole.value);
  });

  collabDisconnectBtn.addEventListener("click", () => {
    collabDisconnect();
  });

  collabUserName.addEventListener("input", () => {
    const val = collabUserName.value.trim() || "Presenter";
    state.collabUserName = val;
    try {
      localStorage.setItem(COLLAB_LS_NAME_KEY, val);
    } catch {}
    syncCollabUI();
    collabSend({ type: "presence-join", role: state.collabRole });
  });

  if (collabColorSwatches) {
    collabColorSwatches.addEventListener("click", (event) => {
      const swatch = event.target.closest(".collab-swatch");
      if (swatch && swatch.dataset.color) {
        state.collabUserColor = swatch.dataset.color;
        try {
          localStorage.setItem(COLLAB_LS_COLOR_KEY, state.collabUserColor);
        } catch {}
        syncCollabColorUI();
        syncCollabUI();
        collabSend({ type: "presence-join", role: state.collabRole });
      }
    });
  }

  function checkUrlRoomParam() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlRoom = urlParams.get("room");
      const urlRole = urlParams.get("role");
      if (urlRole && ["owner", "editor", "viewer"].includes(urlRole)) {
        setCollabRole(urlRole, false);
      }
      if (urlRoom) {
        collabConnect(urlRoom, urlRole || state.collabRole);
      }
    } catch {}
  }

  const observer = new ResizeObserver(resizeCanvas);
  new ResizeObserver(layoutRibbonOverflow).observe(toolbar);
  observer.observe(canvas.parentElement);
  resizeCanvas();
  fitCanvas();
  canvas.dataset.cursor = state.tool;
  setRibbonTab("home");
  syncColorUI();
  syncEditUI();
  syncFormatUI();
  syncViewUI();
  syncPageUI();
  syncImageUI();
  syncLinkUI();
  syncTeachUI();
  initCollabProfile();
  syncCollabUI();

  initProjectManager();
  setupPwa();
  checkUrlRoomParam();
})();
