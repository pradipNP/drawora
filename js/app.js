// js/app.js
// Drawora application bootstrapper and lifecycle entry point
(function (D) {
  "use strict";

  // Initialize first page if none exist
  if (!D.state.pages || D.state.pages.length === 0) {
    const firstPage = makePage({ name: "Page 1", preset: "a4", orientation: "portrait" });
    D.state.pages = [firstPage];
    attachPage(firstPage);
  }

  // Prepare toolbar ribbon overflow layout
  prepareRibbonOverflow();

  // Resize observers for responsive canvas and toolbar overflow
  const observer = new ResizeObserver(resizeCanvas);
  if (D.toolbar) {
    new ResizeObserver(layoutRibbonOverflow).observe(D.toolbar);
  }
  if (D.canvas && D.canvas.parentElement) {
    observer.observe(D.canvas.parentElement);
  }

  // Initial canvas sizing and camera fit
  resizeCanvas();
  fitCanvas();

  // Initial tool and ribbon tab
  if (D.canvas) {
    D.canvas.dataset.cursor = D.state.tool;
  }
  setRibbonTab("home");

  // Synchronize all UI components
  syncColorUI();
  syncEditUI();
  syncFormatUI();
  syncViewUI();
  syncPageUI();
  syncImageUI();
  syncLinkUI();
  syncTeachUI();

  // Initialize collaboration profile & UI
  initCollabProfile();
  syncCollabUI();

  // Initialize persistence, PWA, and room URL param check
  initProjectManager();
  setupPwa();
  checkUrlRoomParam();
})(window.Drawora = window.Drawora || {});
