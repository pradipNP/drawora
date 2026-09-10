// js/modules/dialogs.js
// Drawora modal dialogs controller (Shortcuts, Confirm, Links, Image Picker, Fullscreen)
(function (D) {
  "use strict";

  let confirmCallback = null;
  let linkDialogTargetId = null;

  function openShortcutsDialog(activeTab = "keys") {
    if (!D.shortcutsDialog) return;
    D.shortcutsDialog.hidden = false;
    setShortcutsTab(activeTab);
    trapModalFocus(D.shortcutsDialog);
  }

  function closeShortcutsDialog() {
    if (!D.shortcutsDialog) return;
    D.shortcutsDialog.hidden = true;
    releaseModalFocus();
  }

  function setShortcutsTab(tabName) {
    if (!D.shortcutsDialog) return;
    const tabButtons = D.shortcutsDialog.querySelectorAll(".shortcuts-tab-btn");
    const panels = D.shortcutsDialog.querySelectorAll(".shortcuts-tab-panel");

    tabButtons.forEach((btn) => {
      const isActive = btn.dataset.tab === tabName;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    panels.forEach((p) => {
      p.hidden = p.id !== `shortcuts-panel-${tabName}`;
    });
  }

  function closeConfirmDialog() {
    if (D.confirmDialog) {
      D.confirmDialog.hidden = true;
    }
    confirmCallback = null;
    D.confirmCallback = null;
    releaseModalFocus();
  }

  function openConfirmDialog(title, message, okLabel, onConfirm) {
    if (typeof finishOpenWork === "function") {
      finishOpenWork();
    }
    if (D.confirmTitle) D.confirmTitle.textContent = title;
    if (D.confirmMessage) D.confirmMessage.textContent = message;
    if (D.confirmOk) D.confirmOk.textContent = okLabel;
    confirmCallback = onConfirm;
    D.confirmCallback = onConfirm;
    if (D.confirmDialog) {
      D.confirmDialog.hidden = false;
      trapModalFocus(D.confirmDialog);
    }
  }

  function requestClearBoard() {
    if (D.state.frozen) {
      return;
    }
    openConfirmDialog(
      "Clear this page?",
      "Drawings on this page will be removed. The page template stays.",
      "Clear",
      () => {
        if (!D.state.objects.length) {
          return;
        }
        captureBefore();
        D.state.objects.splice(0, D.state.objects.length);
        clearSelection();
        commitIfChanged();
        redraw();
      }
    );
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }
    if (D.appEl) {
      D.appEl.requestFullscreen().catch(() => {});
    }
  }

  function measureLinkBox(object) {
    applyTextMeasure({ ...object, fontSize: object.fontSize || 16 });
    const label = object.text || object.href || "Link";
    const width = Math.ceil(D.ctx.measureText(label).width) + 24;
    const height = Math.max(32, Math.round((object.fontSize || 16) * 1.8));
    if ("letterSpacing" in D.ctx) {
      D.ctx.letterSpacing = "0px";
    }
    return { width: Math.max(96, width), height };
  }

  function closeLinkDialog() {
    if (D.linkDialog) {
      D.linkDialog.hidden = true;
    }
    if (D.linkError) {
      D.linkError.hidden = true;
    }
    linkDialogTargetId = null;
    releaseModalFocus();
  }

  function openLinkDialog(object) {
    if (typeof finishOpenWork === "function") {
      finishOpenWork();
    }
    linkDialogTargetId = object ? object.id : null;
    if (D.linkTitle) D.linkTitle.textContent = object ? "Edit link" : "Insert link";
    if (D.linkForm) {
      const submitBtn = D.linkForm.querySelector("[type='submit']");
      if (submitBtn) submitBtn.textContent = object ? "Save" : "Insert";
    }
    if (D.linkTextInput) D.linkTextInput.value = object ? object.text || "" : "";
    if (D.linkHrefInput) D.linkHrefInput.value = object ? object.href || "" : "";
    if (D.linkError) D.linkError.hidden = true;
    if (D.linkDialog) {
      D.linkDialog.hidden = false;
      trapModalFocus(D.linkDialog);
    }
  }

  function commitLinkDialog() {
    const href = sanitizeHref(D.linkHrefInput.value);
    if (!href) {
      if (D.linkError) D.linkError.hidden = false;
      if (D.linkHrefInput) D.linkHrefInput.focus();
      return false;
    }
    const text = (D.linkTextInput.value || "").trim() || linkLabelFromHref(href);
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

    const size = measureLinkBox({ text, href, fontSize: 16, fontKey: D.state.fontKey });
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
      color: D.SELECT_COLOR,
      fontSize: 16,
      fontKey: D.state.fontKey,
      bold: false,
      italic: false,
      textBack: "rgb(204 251 241 / 0.85)",
      rotation: 0,
    };
    D.state.objects.push(object);
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

  function openImagePicker() {
    if (D.imageFileInput) {
      D.imageFileInput.value = "";
      D.imageFileInput.click();
    }
  }

  const exports = {
    openShortcutsDialog,
    closeShortcutsDialog,
    setShortcutsTab,
    closeConfirmDialog,
    openConfirmDialog,
    requestClearBoard,
    toggleFullscreen,
    measureLinkBox,
    closeLinkDialog,
    openLinkDialog,
    commitLinkDialog,
    openExternalLink,
    openSelectedLink,
    openImagePicker,
  };

  Object.assign(D, exports);
  Object.assign(window, exports);
})(window.Drawora = window.Drawora || {});
