/**
 * Drawora — DOM Element Cache
 * All getElementById / querySelector lookups, performed once at startup.
 */
(function (D) {
  "use strict";

  D.canvas = document.getElementById("board");
  D.toolbar = document.querySelector(".ribbon");
  D.ribbonTabs = document.querySelector(".ribbon-tabs");
  D.colorInput = document.getElementById("custom-color");
  D.customSwatch = D.toolbar && D.toolbar.querySelector(".swatch-custom");
  D.strokePreview = document.getElementById("stroke-preview");
  D.fillPreview = document.getElementById("fill-preview");
  D.fillTargetButton = D.toolbar && D.toolbar.querySelector('[data-color-target="fill"]');
  D.sizeInput = document.getElementById("stroke-size");
  D.sizeValue = document.getElementById("size-value");
  D.undoBtn = document.getElementById("undo-btn");
  D.redoBtn = document.getElementById("redo-btn");
  D.deleteBtn = document.getElementById("delete-btn");
  D.copyBtn = document.getElementById("copy-btn");
  D.pasteBtn = document.getElementById("paste-btn");
  D.duplicateBtn = document.getElementById("duplicate-btn");
  D.cutBtn = document.getElementById("cut-btn");
  D.selectAllBtn = document.getElementById("select-all-btn");
  D.groupBtn = document.getElementById("group-btn");
  D.ungroupBtn = document.getElementById("ungroup-btn");
  D.editor = document.getElementById("text-editor");
  D.fontSizeSelect = document.getElementById("font-size");
  D.fontFamilySelect = document.getElementById("font-family");
  D.lineHeightInput = document.getElementById("line-height");
  D.letterSpacingInput = document.getElementById("letter-spacing");
  D.paraSpacingInput = document.getElementById("para-spacing");
  D.textBackInput = document.getElementById("text-back");
  D.zoomLabel = document.getElementById("zoom-label");
  D.zoomValue = document.getElementById("zoom-value");
  D.pageNameInput = document.getElementById("page-name");
  D.pageWidthInput = document.getElementById("page-width");
  D.pageHeightInput = document.getElementById("page-height");
  D.pageThumbs = document.getElementById("page-thumbs");
  D.pageStatus = document.getElementById("page-status");
  D.pageDeleteBtn = document.getElementById("page-delete-btn");
  D.statusbar = document.querySelector(".statusbar");
  D.paperColorInput = document.getElementById("paper-color");
  D.lineColorInput = document.getElementById("line-color");
  D.lineSpacingInput = document.getElementById("line-spacing");
  D.gridSizeInput = document.getElementById("grid-size");
  D.pageMarginInput = document.getElementById("page-margin");
  D.imageFileInput = document.getElementById("image-file");
  D.documentFileInput = document.getElementById("document-file");
  D.imageCropBtn = document.getElementById("image-crop-btn");
  D.imageFlipHBtn = document.getElementById("image-flip-h-btn");
  D.imageFlipVBtn = document.getElementById("image-flip-v-btn");
  D.imageShadowBtn = document.getElementById("image-shadow-btn");
  D.imageGrayBtn = document.getElementById("image-gray-btn");
  D.imageOpacityInput = document.getElementById("image-opacity");
  D.imageRadiusInput = document.getElementById("image-radius");
  D.imageBrightnessInput = document.getElementById("image-brightness");
  D.imageContrastInput = document.getElementById("image-contrast");
  D.imageSaturationInput = document.getElementById("image-saturation");
  D.imageBlurInput = document.getElementById("image-blur");
  D.canvasWrap = document.querySelector(".canvas-wrap");
  D.linkDialog = document.getElementById("link-dialog");
  D.linkForm = document.getElementById("link-form");
  D.linkTitle = document.getElementById("link-dialog-title");
  D.linkTextInput = document.getElementById("link-text");
  D.linkHrefInput = document.getElementById("link-href");
  D.linkError = document.getElementById("link-error");
  D.linkCancel = document.getElementById("link-cancel");
  D.linkOpenBtn = document.getElementById("link-open-btn");
  D.confirmDialog = document.getElementById("confirm-dialog");
  D.confirmForm = document.getElementById("confirm-form");
  D.confirmTitle = document.getElementById("confirm-title");
  D.confirmMessage = document.getElementById("confirm-message");
  D.confirmCancel = document.getElementById("confirm-cancel");
  D.confirmOk = document.getElementById("confirm-ok");
  D.teachStatus = document.getElementById("teach-status");
  D.appEl = document.querySelector(".app");
  D.layersPanel = document.getElementById("layers-panel");
  D.layersList = document.getElementById("layers-list");
  D.layersEmpty = document.getElementById("layers-empty");
  D.boardTitleInput = document.getElementById("board-title-input");
  D.boardsBtn = document.getElementById("boards-btn");
  D.saveStatusEl = document.getElementById("save-status");
  D.projectsDialog = document.getElementById("projects-dialog");
  D.projectsSearch = document.getElementById("projects-search");
  D.projectsGrid = document.getElementById("projects-grid");
  D.projectsEmpty = document.getElementById("projects-empty");
  D.projectsCount = document.getElementById("projects-count");
  D.exportDialog = document.getElementById("export-dialog");
  D.exportPreviewImg = document.getElementById("export-preview-img");
  D.exportPreviewPlaceholder = document.getElementById("export-preview-placeholder");
  D.exportPreviewBadge = document.getElementById("export-preview-badge");
  D.exportFormatSelect = document.getElementById("export-format");
  D.exportScopeSelect = document.getElementById("export-scope");
  D.exportScaleSelect = document.getElementById("export-scale");
  D.exportTransparentBg = document.getElementById("export-transparent-bg");
  D.exportQualityRange = document.getElementById("export-quality");
  D.exportQualityVal = document.getElementById("export-quality-val");
  D.exportQualityWrap = document.getElementById("export-quality-wrap");
  D.exportScaleWrap = document.getElementById("export-scale-wrap");
  D.exportBgWrap = document.getElementById("export-bg-wrap");
  D.exportScopeWrap = document.getElementById("export-scope-wrap");
  D.exportFilenameInput = document.getElementById("export-filename");
  D.exportDownloadBtn = document.getElementById("export-download-btn");
  D.exportInfo = document.getElementById("export-info");
  D.projectFileInput = document.getElementById("project-file");
  D.importProjectBtn = document.getElementById("import-project-btn");
  D.presenterBar = document.getElementById("presenter-bar");
  D.presenterPageStatus = document.getElementById("presenter-page-status");
  D.presenterLaserBtn = document.getElementById("presenter-laser-btn");
  D.presenterPenBtn = document.getElementById("presenter-pen-btn");
  D.presenterEraserBtn = document.getElementById("presenter-eraser-btn");
  D.presenterBlackBtn = document.getElementById("presenter-black-btn");
  D.presenterWhiteBtn = document.getElementById("presenter-white-btn");
  D.presentationCurtain = document.getElementById("presentation-curtain");
  D.presentStartBtn = document.getElementById("present-start-btn");
  D.installAppBtn = document.getElementById("install-app-btn");
  D.collabPresenceBtn = document.getElementById("collab-presence-btn");
  D.collabStatusDot = document.getElementById("collab-status-dot");
  D.collabLabel = document.getElementById("collab-label");
  D.collabAvatars = document.getElementById("collab-avatars");
  D.collabDialog = document.getElementById("collab-dialog");
  D.collabRoomInput = document.getElementById("collab-room-input");
  D.collabUserName = document.getElementById("collab-user-name");
  D.collabColorSwatches = document.getElementById("collab-color-swatches");
  D.collabRandomBtn = document.getElementById("collab-random-btn");
  D.collabConnectBtn = document.getElementById("collab-connect-btn");
  D.collabDisconnectBtn = document.getElementById("collab-disconnect-btn");
  D.collabParticipantsList = document.getElementById("collab-participants-list");
  D.collabParticipantsCount = document.getElementById("collab-participants-count");
  D.collabDialogStatusDot = document.getElementById("collab-dialog-status-dot");
  D.collabDialogStatusText = document.getElementById("collab-dialog-status-text");
  D.collabStatusBanner = document.getElementById("collab-status-banner");
  D.shareBtn = document.getElementById("share-btn");
  D.viewerModeBanner = document.getElementById("viewer-mode-banner");
  D.collabLinkEditor = document.getElementById("collab-link-editor");
  D.collabLinkViewer = document.getElementById("collab-link-viewer");
  D.collabCopyEditorBtn = document.getElementById("collab-copy-editor-btn");
  D.collabCopyViewerBtn = document.getElementById("collab-copy-viewer-btn");
  D.collabSelfRole = document.getElementById("collab-self-role");
  D.shortcutsDialog = document.getElementById("shortcuts-dialog");
  D.helpShortcutsBtn = document.getElementById("help-shortcuts-btn");
  D.helpAboutBtn = document.getElementById("help-about-btn");
  D.helpPersistentBtn = document.getElementById("help-persistent-btn");
  D.shortcutsHintBanner = document.getElementById("shortcuts-hint-banner");
  D.shortcutsHintDismiss = document.getElementById("shortcuts-hint-dismiss");

  // Validate critical elements
  if (
    !D.canvas ||
    !D.toolbar ||
    !D.colorInput ||
    !D.customSwatch ||
    !D.strokePreview ||
    !D.fillPreview ||
    !D.fillTargetButton ||
    !D.sizeInput ||
    !D.sizeValue ||
    !D.undoBtn ||
    !D.redoBtn ||
    !D.deleteBtn ||
    !D.copyBtn ||
    !D.pasteBtn ||
    !D.duplicateBtn ||
    !D.cutBtn ||
    !D.selectAllBtn ||
    !D.groupBtn ||
    !D.ungroupBtn ||
    !D.ribbonTabs ||
    !D.editor ||
    !D.fontSizeSelect ||
    !D.fontFamilySelect ||
    !D.lineHeightInput ||
    !D.letterSpacingInput ||
    !D.paraSpacingInput ||
    !D.textBackInput ||
    !D.zoomLabel ||
    !D.zoomValue ||
    !D.canvasWrap
  ) {
    console.error("Drawora: missing canvas or toolbar controls.");
    D._initFailed = true;
    return;
  }

  D.ctx = D.canvas.getContext("2d");
  if (!D.ctx) {
    console.error("Drawora: 2D canvas is not available.");
    D._initFailed = true;
    return;
  }

  Object.assign(window, D);
})(window.Drawora);
