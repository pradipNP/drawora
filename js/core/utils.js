/**
 * Drawora — Core Utilities
 * Pure math, geometry, color, coordinate transform, formatting, and a11y helpers.
 */
(function (D) {
  "use strict";

  let a11yTimer = null;
  let modalFocusRestoreEl = null;

  function announceA11y(message) {
    const a11yLiveRegion = D.a11yLiveRegion || document.getElementById("a11y-live-region");
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
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
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
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
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

  function normalizeHex(color) {
    return color.trim().toLowerCase();
  }

  function rgbToHex(r, g, b) {
    return `#${[r, g, b]
      .map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0"))
      .join("")}`;
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

  function createId() {
    const id = `o${D.state.nextId}`;
    D.state.nextId += 1;
    return id;
  }

  function createPageId() {
    const id = `p${D.state.nextPageId}`;
    D.state.nextPageId += 1;
    return id;
  }

  function clampPageSize(value, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return fallback;
    }
    return Math.min(D.MAX_PAGE_SIZE, Math.max(D.MIN_PAGE_SIZE, Math.round(number)));
  }

  function pageDimensions(preset, orientation, customWidth, customHeight) {
    if (preset === "custom") {
      return {
        width: clampPageSize(customWidth, 794),
        height: clampPageSize(customHeight, 1123),
      };
    }

    const base = D.PAGE_PRESETS[preset] || D.PAGE_PRESETS.a4;
    if (orientation === "landscape") {
      return { width: base.height, height: base.width };
    }
    return { width: base.width, height: base.height };
  }

  function cloneData(value) {
    return structuredClone(value);
  }

  function getScreenPoint(event) {
    const rect = D.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function screenToWorld(screen) {
    return {
      x: (screen.x - D.state.panX) / D.state.zoom,
      y: (screen.y - D.state.panY) / D.state.zoom,
    };
  }

  function worldToScreen(point) {
    return {
      x: point.x * D.state.zoom + D.state.panX,
      y: point.y * D.state.zoom + D.state.panY,
    };
  }

  function getPoint(event) {
    return screenToWorld(getScreenPoint(event));
  }

  function viewLen(pixels) {
    return pixels / D.state.zoom;
  }

  function viewportCenter() {
    return { x: D.canvas.clientWidth / 2, y: D.canvas.clientHeight / 2 };
  }

  function viewportWorldCenter() {
    return screenToWorld(viewportCenter());
  }

  function formatZoom() {
    const percent = D.state.zoom * 100;
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

  function distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
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

  function getCenterFromBounds(bounds) {
    return {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };
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

  function boundsIntersect(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  function getViewportWorldBounds(padding = 64) {
    const p1 = screenToWorld({ x: 0, y: 0 });
    const p2 = screenToWorld({ x: D.canvas.clientWidth, y: D.canvas.clientHeight });
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

  function decodeXml(text) {
    return String(text || "")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&apos;/g, "'");
  }

  function escapeXml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function clipImportText(text) {
    const value = String(text || "").replace(/\u0000/g, "");
    if (value.length <= D.MAX_IMPORT_TEXT) {
      return value;
    }
    return `${value.slice(0, D.MAX_IMPORT_TEXT)}\n…`;
  }

  function sanitizeHref(value) {
    const trimmed = String(value || "").trim();
    if (!trimmed) {
      return "";
    }
    return /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
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

  const exports = {
    announceA11y,
    trapModalFocus,
    releaseModalFocus,
    handleModalTabKey,
    isTypingTarget,
    normalizeHex,
    rgbToHex,
    hexLuminance,
    createId,
    createPageId,
    clampPageSize,
    pageDimensions,
    cloneData,
    getScreenPoint,
    screenToWorld,
    worldToScreen,
    getPoint,
    viewLen,
    viewportCenter,
    viewportWorldCenter,
    formatZoom,
    formatLength,
    formatAngle,
    formatRelativeTime,
    distance,
    distToSegment,
    pointInTriangle,
    pointInBounds,
    pointInPolygon,
    normalizedBounds,
    getCenterFromBounds,
    rotateAround,
    worldToLocal,
    localToWorld,
    boundsIntersect,
    getViewportWorldBounds,
    unionBounds,
    decodeXml,
    escapeXml,
    clipImportText,
    sanitizeHref,
    downloadFile,
  };

  Object.assign(D, exports);
  Object.assign(window, exports);
})(window.Drawora = window.Drawora || {});
