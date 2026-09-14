// js/app.js
// Drawora application bootstrapper and lifecycle entry point
(function (D) {
  "use strict";

  function loadStyleManager() {
    if (typeof D.initStyleManager === "function") {
      D.initStyleManager();
      return;
    }
    if (document.querySelector('script[data-drawora-style-manager="true"]')) {
      return;
    }

    const script = document.createElement("script");
    script.src = "js/modules/styles.js";
    script.defer = true;
    script.dataset.draworaStyleManager = "true";
    script.onerror = () => {
      console.warn("Drawora: custom style manager failed to load.");
    };
    document.body.appendChild(script);
  }

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

  // Issue #35: load the reusable custom text-style library.
  loadStyleManager();
})(window.Drawora = window.Drawora || {});
