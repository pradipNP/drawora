/**
 * Drawora — Custom Text Style Manager
 * Issue #35: Save and reuse custom styles (colors, fonts, sizes)
 *
 * Styles are stored globally in localStorage so they can be reused across
 * boards. The module intentionally delegates actual formatting to Drawora's
 * existing editor APIs (applyFormatChange/syncFormatUI/syncColorUI).
 */
(function (D) {
  "use strict";

  const STORAGE_KEY = "drawora_custom_styles_v1";
  const EXPORT_VERSION = 1;
  const MAX_STYLES = 100;
  const STYLE_FIELDS = [
    "fontSize",
    "fontKey",
    "bold",
    "italic",
    "underline",
    "strike",
    "align",
    "lineHeight",
    "letterSpacing",
    "paragraphSpacing",
    "textBack",
    "list",
    "indent",
    "stroke",
    "fill",
  ];

  let styles = [];
  let panel = null;
  let backdrop = null;
  let listEl = null;
  let emptyEl = null;
  let countEl = null;
  let importInput = null;
  let dragStyleId = null;

  function createStyleId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `style-${window.crypto.randomUUID()}`;
    }
    return `style-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function normalizeHex(value, fallback) {
    return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
  }

  function sanitizeStyle(raw) {
    if (!raw || typeof raw !== "object") return null;

    const fontSize = Math.min(200, Math.max(6, Number(raw.fontSize) || 24));
    const lineHeight = Math.min(3, Math.max(1, Number(raw.lineHeight) || 1.35));
    const letterSpacing = Math.min(16, Math.max(-4, Number(raw.letterSpacing) || 0));
    const paragraphSpacing = Math.min(48, Math.max(0, Number(raw.paragraphSpacing) || 0));
    const indent = Math.min(Number(D.MAX_INDENT) || 8, Math.max(0, Number(raw.indent) || 0));
    const validFontKey = D.FONT_STACKS && D.FONT_STACKS[raw.fontKey] ? raw.fontKey : "sans";
    const validAlign = ["left", "center", "right", "justify"].includes(raw.align) ? raw.align : "left";
    const validList = ["none", "bullet", "number"].includes(raw.list) ? raw.list : "none";
    const stroke = normalizeHex(raw.stroke, "#1c1917");
    const fill = raw.fill == null ? null : normalizeHex(raw.fill, null);
    const textBack = raw.textBack == null ? null : normalizeHex(raw.textBack, null);

    return {
      id: typeof raw.id === "string" && raw.id ? raw.id.slice(0, 120) : createStyleId(),
      name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim().slice(0, 60) : "Untitled style",
      fontSize,
      fontKey: validFontKey,
      bold: Boolean(raw.bold),
      italic: Boolean(raw.italic),
      underline: Boolean(raw.underline),
      strike: Boolean(raw.strike),
      align: validAlign,
      lineHeight,
      letterSpacing,
      paragraphSpacing,
      textBack,
      list: validList,
      indent,
      stroke,
      fill,
      createdAt: Number(raw.createdAt) || Date.now(),
      updatedAt: Number(raw.updatedAt) || Date.now(),
    };
  }

  function loadStyles() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(raw)) return [];
      return raw.map(sanitizeStyle).filter(Boolean).slice(0, MAX_STYLES);
    } catch (error) {
      console.warn("Drawora: custom style library could not be loaded", error);
      return [];
    }
  }

  function persistStyles() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(styles));
      return true;
    } catch (error) {
      console.warn("Drawora: custom style library could not be saved", error);
      showToast("Could not save styles in this browser.", "error");
      return false;
    }
  }

  function captureCurrentStyle(name) {
    const state = D.state || {};
    return sanitizeStyle({
      id: createStyleId(),
      name: name || suggestStyleName(),
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
      stroke: state.stroke,
      fill: state.fill,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  function suggestStyleName() {
    const state = D.state || {};
    const size = Number(state.fontSize) || 24;
    if (size >= 40) return "Display";
    if (size >= 30) return "Heading";
    if (state.bold && size >= 22) return "Subheading";
    if (state.bold) return "Emphasis";
    return "Body";
  }

  function styleSummary(style) {
    const parts = [];
    const stack = D.FONT_STACKS && D.FONT_STACKS[style.fontKey];
    const readableFont = style.fontKey === "sans" ? "Sans" : style.fontKey === "serif" ? "Serif" : style.fontKey === "mono" ? "Mono" : style.fontKey;
    parts.push(stack ? readableFont : "Sans");
    parts.push(`${style.fontSize}px`);
    if (style.bold) parts.push("Bold");
    if (style.italic) parts.push("Italic");
    return parts.join(" · ");
  }

  function applyStyle(style) {
    if (!style || !D.state) return;

    for (const field of STYLE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(style, field)) {
        D.state[field] = style[field];
      }
    }

    if (typeof D.syncColorUI === "function") D.syncColorUI();
    if (typeof D.syncFormatUI === "function") D.syncFormatUI();
    if (typeof D.applyFormatChange === "function") {
      D.applyFormatChange();
    } else if (typeof D.redraw === "function") {
      D.redraw();
    }

    showToast(`Applied “${style.name}”.`);
  }

  function saveCurrentStyle() {
    if (styles.length >= MAX_STYLES) {
      showToast(`Style library is limited to ${MAX_STYLES} styles.`, "error");
      return;
    }

    const proposed = suggestStyleName();
    const name = window.prompt("Name this style", proposed);
    if (name === null) return;

    const trimmed = name.trim();
    if (!trimmed) {
      showToast("Style name cannot be empty.", "error");
      return;
    }

    const style = captureCurrentStyle(trimmed);
    styles.push(style);
    persistStyles();
    renderStyles();
    showToast(`Saved “${style.name}”.`);
  }

  function updateStyleFromCurrent(id) {
    const index = styles.findIndex((style) => style.id === id);
    if (index < 0) return;

    const current = captureCurrentStyle(styles[index].name);
    current.id = styles[index].id;
    current.createdAt = styles[index].createdAt;
    current.updatedAt = Date.now();
    styles[index] = current;
    persistStyles();
    renderStyles();
    showToast(`Updated “${current.name}” from the current formatting.`);
  }

  function renameStyle(id) {
    const style = styles.find((item) => item.id === id);
    if (!style) return;

    const next = window.prompt("Rename style", style.name);
    if (next === null) return;
    const trimmed = next.trim();
    if (!trimmed) {
      showToast("Style name cannot be empty.", "error");
      return;
    }

    style.name = trimmed.slice(0, 60);
    style.updatedAt = Date.now();
    persistStyles();
    renderStyles();
  }

  function deleteStyle(id) {
    const style = styles.find((item) => item.id === id);
    if (!style) return;
    if (!window.confirm(`Delete “${style.name}”?`)) return;

    styles = styles.filter((item) => item.id !== id);
    persistStyles();
    renderStyles();
    showToast(`Deleted “${style.name}”.`);
  }

  function moveStyle(id, delta) {
    const index = styles.findIndex((style) => style.id === id);
    if (index < 0) return;
    const nextIndex = Math.min(styles.length - 1, Math.max(0, index + delta));
    if (nextIndex === index) return;

    const [item] = styles.splice(index, 1);
    styles.splice(nextIndex, 0, item);
    persistStyles();
    renderStyles();
  }

  function reorderStyle(sourceId, targetId) {
    if (!sourceId || !targetId || sourceId === targetId) return;
    const sourceIndex = styles.findIndex((style) => style.id === sourceId);
    const targetIndex = styles.findIndex((style) => style.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const [item] = styles.splice(sourceIndex, 1);
    const adjustedTarget = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
    styles.splice(adjustedTarget, 0, item);
    persistStyles();
    renderStyles();
  }

  function exportStyles() {
    const payload = {
      app: "Drawora",
      kind: "custom-style-library",
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      styles,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `drawora-styles-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    showToast(`Exported ${styles.length} style${styles.length === 1 ? "" : "s"}.`);
  }

  function importStylesFromFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        const source = Array.isArray(parsed) ? parsed : parsed.styles;
        if (!Array.isArray(source)) throw new Error("Missing styles array");

        const incoming = source.map(sanitizeStyle).filter(Boolean);
        if (!incoming.length) throw new Error("No valid styles found");

        const existingIds = new Set(styles.map((style) => style.id));
        const existingNames = new Set(styles.map((style) => style.name.toLowerCase()));
        const merged = [...styles];

        for (const raw of incoming) {
          if (merged.length >= MAX_STYLES) break;
          const style = { ...raw };
          if (existingIds.has(style.id)) style.id = createStyleId();
          let name = style.name;
          let suffix = 2;
          while (existingNames.has(name.toLowerCase())) {
            name = `${style.name} ${suffix}`.slice(0, 60);
            suffix += 1;
          }
          style.name = name;
          existingIds.add(style.id);
          existingNames.add(style.name.toLowerCase());
          merged.push(style);
        }

        const added = merged.length - styles.length;
        styles = merged;
        persistStyles();
        renderStyles();
        showToast(`Imported ${added} style${added === 1 ? "" : "s"}.`);
      } catch (error) {
        console.warn("Drawora: invalid style library import", error);
        showToast("That file is not a valid Drawora style library.", "error");
      } finally {
        importInput.value = "";
      }
    };
    reader.onerror = () => {
      showToast("Could not read that style file.", "error");
      importInput.value = "";
    };
    reader.readAsText(file);
  }

  function makeIconButton(label, title, path, action, id) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "drawora-style-icon-btn";
    button.title = title;
    button.setAttribute("aria-label", label);
    button.dataset.styleAction = action;
    if (id) button.dataset.styleId = id;
    button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    return button;
  }

  function renderStyles() {
    if (!listEl) return;
    listEl.textContent = "";
    emptyEl.hidden = styles.length > 0;
    countEl.textContent = `${styles.length}/${MAX_STYLES}`;

    styles.forEach((style, index) => {
      const card = document.createElement("article");
      card.className = "drawora-style-card";
      card.draggable = true;
      card.dataset.styleId = style.id;
      card.tabIndex = 0;
      card.setAttribute("aria-label", `${style.name}, ${styleSummary(style)}`);

      const preview = document.createElement("button");
      preview.type = "button";
      preview.className = "drawora-style-preview";
      preview.dataset.styleAction = "apply";
      preview.dataset.styleId = style.id;
      preview.title = `Apply ${style.name}`;
      preview.style.color = style.stroke || "#1c1917";
      preview.style.fontFamily = D.FONT_STACKS && D.FONT_STACKS[style.fontKey] ? D.FONT_STACKS[style.fontKey] : "sans-serif";
      preview.style.fontWeight = style.bold ? "700" : "400";
      preview.style.fontStyle = style.italic ? "italic" : "normal";
      preview.style.textDecoration = [style.underline ? "underline" : "", style.strike ? "line-through" : ""].filter(Boolean).join(" ") || "none";
      preview.innerHTML = `<span class="drawora-style-sample">Aa</span><span class="drawora-style-card-copy"><strong></strong><small></small></span>`;
      preview.querySelector("strong").textContent = style.name;
      preview.querySelector("small").textContent = styleSummary(style);

      const actions = document.createElement("div");
      actions.className = "drawora-style-card-actions";
      actions.append(
        makeIconButton("Move style up", "Move up", "M12 19V5m-5 5 5-5 5 5", "up", style.id),
        makeIconButton("Move style down", "Move down", "M12 5v14m5-5-5 5-5-5", "down", style.id),
        makeIconButton("Rename style", "Rename", "M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4Zm9-13 4 4", "rename", style.id),
        makeIconButton("Update style from current formatting", "Update from current", "M20 11a8 8 0 1 1-2.3-5.7M20 4v7h-7", "update", style.id),
        makeIconButton("Delete style", "Delete", "M5 7h14M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5", "delete", style.id)
      );

      if (index === 0) actions.children[0].disabled = true;
      if (index === styles.length - 1) actions.children[1].disabled = true;

      card.append(preview, actions);
      listEl.appendChild(card);
    });
  }

  function handlePanelClick(event) {
    const button = event.target.closest("[data-style-action]");
    if (!button) return;
    const action = button.dataset.styleAction;
    const id = button.dataset.styleId;
    const style = styles.find((item) => item.id === id);

    if (action === "save") saveCurrentStyle();
    else if (action === "export") exportStyles();
    else if (action === "import") importInput.click();
    else if (action === "close") closePanel();
    else if (action === "apply" && style) applyStyle(style);
    else if (action === "rename") renameStyle(id);
    else if (action === "update") updateStyleFromCurrent(id);
    else if (action === "delete") deleteStyle(id);
    else if (action === "up") moveStyle(id, -1);
    else if (action === "down") moveStyle(id, 1);
  }

  function handleDragStart(event) {
    const card = event.target.closest(".drawora-style-card");
    if (!card) return;
    dragStyleId = card.dataset.styleId;
    card.classList.add("is-dragging");
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", dragStyleId);
    }
  }

  function handleDragOver(event) {
    const card = event.target.closest(".drawora-style-card");
    if (!card || !dragStyleId) return;
    event.preventDefault();
    card.classList.add("is-drop-target");
  }

  function handleDragLeave(event) {
    const card = event.target.closest(".drawora-style-card");
    if (card) card.classList.remove("is-drop-target");
  }

  function handleDrop(event) {
    const card = event.target.closest(".drawora-style-card");
    if (!card || !dragStyleId) return;
    event.preventDefault();
    const targetId = card.dataset.styleId;
    reorderStyle(dragStyleId, targetId);
    dragStyleId = null;
  }

  function handleDragEnd() {
    dragStyleId = null;
    for (const card of listEl.querySelectorAll(".drawora-style-card")) {
      card.classList.remove("is-dragging", "is-drop-target");
    }
  }

  function openPanel() {
    if (!panel) return;
    if (backdrop) backdrop.hidden = false;
    panel.hidden = false;
    document.body.classList.add("drawora-style-panel-open");
    renderStyles();
    const firstFocus = panel.querySelector("[data-style-action='save']");
    if (firstFocus) firstFocus.focus({ preventScroll: true });
  }

  function closePanel() {
    if (!panel) return;
    panel.hidden = true;
    if (backdrop) backdrop.hidden = true;
    document.body.classList.remove("drawora-style-panel-open");
    const launcher = document.getElementById("drawora-styles-launcher");
    if (launcher) launcher.focus({ preventScroll: true });
  }

  function showToast(message, kind) {
    let toast = document.getElementById("drawora-style-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "drawora-style-toast";
      toast.className = "drawora-style-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.dataset.kind = kind || "success";
    toast.classList.add("is-visible");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  function ensureStylesheet() {
    if (document.querySelector('link[data-drawora-style-manager="true"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "css/style-manager.css";
    link.dataset.draworaStyleManager = "true";
    document.head.appendChild(link);
  }

  function buildLauncher() {
    if (document.getElementById("drawora-styles-launcher")) return;
    const homePanel = document.getElementById("panel-home");
    if (!homePanel) return;

    const group = document.createElement("div");
    group.className = "ribbon-group drawora-style-launcher-group";
    group.innerHTML = `
      <div class="ribbon-group-tools">
        <button type="button" class="ribbon-btn drawora-style-launcher" id="drawora-styles-launcher" title="Saved text styles">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 6.5h14M8 6.5v11M5.5 17.5h5M14 11h5M16.5 8.5v5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
          </svg>
          <span class="visually-hidden">Saved styles</span>
        </button>
      </div>
      <span class="ribbon-group-label">Styles</span>
    `;
    homePanel.appendChild(group);
    group.querySelector("button").addEventListener("click", openPanel);

    if (typeof D.prepareRibbonOverflow === "function") D.prepareRibbonOverflow();
    if (typeof D.layoutRibbonOverflow === "function") D.layoutRibbonOverflow();
  }

  function buildPanel() {
    if (document.getElementById("drawora-style-panel")) return;

    backdrop = document.createElement("div");
    backdrop.className = "drawora-style-backdrop";
    backdrop.id = "drawora-style-backdrop";
    backdrop.hidden = true;

    panel = document.createElement("section");
    panel.id = "drawora-style-panel";
    panel.className = "drawora-style-panel";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "drawora-style-panel-title");
    panel.innerHTML = `
      <div class="drawora-style-head">
        <div>
          <h2 class="drawora-style-title" id="drawora-style-panel-title">Saved Styles</h2>
          <p class="drawora-style-subtitle">Save the current text formatting once, then reuse it across text boxes and boards.</p>
        </div>
        <button type="button" class="drawora-style-close" data-style-action="close" aria-label="Close styles">×</button>
      </div>
      <div class="drawora-style-toolbar">
        <button type="button" class="drawora-style-action is-primary" data-style-action="save">Save current style</button>
        <button type="button" class="drawora-style-action" data-style-action="import">Import</button>
        <button type="button" class="drawora-style-action" data-style-action="export">Export</button>
        <span class="drawora-style-count" id="drawora-style-count">0/${MAX_STYLES}</span>
      </div>
      <div class="drawora-style-list" id="drawora-style-list"></div>
      <p class="drawora-style-empty" id="drawora-style-empty">No saved styles yet.<br />Set your font, size, color and formatting, then choose <strong>Save current style</strong>.</p>
    `;

    importInput = document.createElement("input");
    importInput.type = "file";
    importInput.accept = ".json,application/json";
    importInput.hidden = true;
    importInput.addEventListener("change", () => importStylesFromFile(importInput.files && importInput.files[0]));

    document.body.append(backdrop, panel, importInput);
    listEl = panel.querySelector("#drawora-style-list");
    emptyEl = panel.querySelector("#drawora-style-empty");
    countEl = panel.querySelector("#drawora-style-count");

    panel.addEventListener("click", handlePanelClick);
    listEl.addEventListener("dragstart", handleDragStart);
    listEl.addEventListener("dragover", handleDragOver);
    listEl.addEventListener("dragleave", handleDragLeave);
    listEl.addEventListener("drop", handleDrop);
    listEl.addEventListener("dragend", handleDragEnd);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && panel && !panel.hidden) {
        event.preventDefault();
        closePanel();
      }
    });

    backdrop.addEventListener("click", closePanel);
  }

  function initStyleManager() {
    if (!D.state || document.getElementById("drawora-style-panel")) return;
    styles = loadStyles();
    ensureStylesheet();
    buildLauncher();
    buildPanel();
    renderStyles();
  }

  const exports = {
    initStyleManager,
    getCustomStyles: () => styles.map((style) => ({ ...style })),
    applyCustomStyle: (id) => applyStyle(styles.find((style) => style.id === id)),
    saveCurrentCustomStyle: saveCurrentStyle,
    exportCustomStyles: exportStyles,
  };

  Object.assign(D, exports);
  Object.assign(window, exports);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initStyleManager, { once: true });
  } else {
    initStyleManager();
  }
})(window.Drawora = window.Drawora || {});
