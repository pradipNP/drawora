/**
 * Drawora — Real-Time Collaboration
 * BroadcastChannel and WebSocket multi-user sync, presence tracking,
 * remote cursor sharing, and role management.
 */
(function (D) {
  "use strict";

  const COLLAB_LS_NAME_KEY = "drawora_collab_username";
  const COLLAB_LS_COLOR_KEY = "drawora_collab_usercolor";
  const COLLAB_LS_ROLE_KEY = "drawora_collab_userrole";
  const COLLAB_COLORS = ["#0f766e", "#2563eb", "#7c3aed", "#dc2626", "#d97706", "#059669", "#db2777"];

  function isViewer() {
    return D.state.collabStatus === "connected" && D.state.collabRole === "viewer";
  }

  function isCollabOwner() {
    return D.state.collabRole === "owner";
  }

  function setCollabRole(role, notify = true) {
    const valid = ["owner", "editor", "viewer"].includes(role) ? role : "editor";
    D.state.collabRole = valid;
    try {
      localStorage.setItem(COLLAB_LS_ROLE_KEY, valid);
    } catch {}

    if (D.collabSelfRole) {
      D.collabSelfRole.value = valid;
    }

    const appEl = document.querySelector(".app");
    if (valid === "viewer") {
      if (appEl) appEl.classList.add("is-viewer-mode");
      if (D.viewerModeBanner) D.viewerModeBanner.hidden = false;
      if (typeof D.deselectAll === "function") D.deselectAll();
      if (typeof D.clearSelection === "function") D.clearSelection();
      if (typeof D.cancelActive === "function") D.cancelActive();
      if (D.state.tool !== "pan" && D.state.tool !== "laser") {
        if (typeof D.setTool === "function") D.setTool("pan");
      }
    } else {
      if (appEl) appEl.classList.remove("is-viewer-mode");
      if (D.viewerModeBanner) D.viewerModeBanner.hidden = true;
    }

    syncCollabUI();

    if (notify && D.state.collabRoomId) {
      collabSend({ type: "role-announce", role: valid });
    }
  }

  function getCollabShareUrls(roomId) {
    const clean = (roomId || D.state.collabRoomId || "default").trim();
    const loc = window.location;
    const base = `${loc.protocol}//${loc.host}${loc.pathname}`;
    return {
      editor: `${base}?room=${encodeURIComponent(clean)}&role=editor`,
      viewer: `${base}?room=${encodeURIComponent(clean)}&role=viewer`,
    };
  }

  function initCollabProfile() {
    if (!D.state.collabClientId) {
      D.state.collabClientId = "user_" + Math.random().toString(36).substring(2, 9);
    }
    try {
      const savedName = localStorage.getItem(COLLAB_LS_NAME_KEY);
      if (savedName) D.state.collabUserName = savedName;
      const savedColor = localStorage.getItem(COLLAB_LS_COLOR_KEY);
      if (savedColor && COLLAB_COLORS.includes(savedColor)) D.state.collabUserColor = savedColor;
      const savedRole = localStorage.getItem(COLLAB_LS_ROLE_KEY);
      if (savedRole && ["owner", "editor", "viewer"].includes(savedRole)) D.state.collabRole = savedRole;
    } catch {}
    if (D.collabUserName) D.collabUserName.value = D.state.collabUserName;
    if (D.collabSelfRole) D.collabSelfRole.value = D.state.collabRole;
    syncCollabColorUI();
  }

  function syncCollabColorUI() {
    if (!D.collabColorSwatches) return;
    for (const swatch of D.collabColorSwatches.querySelectorAll(".collab-swatch")) {
      const isSelected = swatch.dataset.color === D.state.collabUserColor;
      swatch.setAttribute("aria-checked", String(isSelected));
    }
  }

  function syncCollabUI() {
    const isConnected = D.state.collabStatus === "connected";
    const isConnecting = D.state.collabStatus === "connecting";

    if (D.collabStatusDot) D.collabStatusDot.dataset.status = D.state.collabStatus;
    if (D.collabDialogStatusDot) D.collabDialogStatusDot.dataset.status = D.state.collabStatus;

    const currentRoom = D.state.collabRoomId || (D.collabRoomInput ? D.collabRoomInput.value : "") || "room-1";
    const shareUrls = getCollabShareUrls(currentRoom);
    if (D.collabLinkEditor) D.collabLinkEditor.value = shareUrls.editor;
    if (D.collabLinkViewer) D.collabLinkViewer.value = shareUrls.viewer;
    if (D.collabSelfRole) D.collabSelfRole.value = D.state.collabRole;

    if (isConnected) {
      const roleLabel = D.state.collabRole === "owner" ? "Host" : D.state.collabRole === "viewer" ? "Viewer" : "Editor";
      if (D.collabLabel) D.collabLabel.textContent = `${D.state.collabRoomId} (${roleLabel})`;
      if (D.collabDialogStatusText) D.collabDialogStatusText.textContent = `Connected to "${D.state.collabRoomId}" as ${roleLabel}`;
      if (D.collabStatusBanner) D.collabStatusBanner.className = "collab-status-banner is-connected";
      if (D.collabConnectBtn) D.collabConnectBtn.hidden = true;
      if (D.collabDisconnectBtn) D.collabDisconnectBtn.hidden = false;
      if (D.collabPresenceBtn) {
        D.collabPresenceBtn.title = `Connected to room "${D.state.collabRoomId}" (${roleLabel}) · Click to manage`;
      }
    } else if (isConnecting) {
      if (D.collabLabel) D.collabLabel.textContent = "Connecting...";
      if (D.collabDialogStatusText) D.collabDialogStatusText.textContent = `Connecting to room "${D.state.collabRoomId || ""}"...`;
      if (D.collabStatusBanner) D.collabStatusBanner.className = "collab-status-banner";
      if (D.collabConnectBtn) {
        D.collabConnectBtn.hidden = false;
        D.collabConnectBtn.disabled = true;
      }
      if (D.collabDisconnectBtn) D.collabDisconnectBtn.hidden = true;
      if (D.collabPresenceBtn) D.collabPresenceBtn.title = "Connecting to collaboration room...";
    } else {
      if (D.collabLabel) D.collabLabel.textContent = "Live Sync";
      if (D.collabDialogStatusText) D.collabDialogStatusText.textContent = "Not connected to a room (Offline)";
      if (D.collabStatusBanner) D.collabStatusBanner.className = "collab-status-banner";
      if (D.collabConnectBtn) {
        D.collabConnectBtn.hidden = false;
        D.collabConnectBtn.disabled = false;
      }
      if (D.collabDisconnectBtn) D.collabDisconnectBtn.hidden = true;
      if (D.collabPresenceBtn) {
        D.collabPresenceBtn.title = "Real-time collaboration & share (Offline) · Click to join room";
      }
    }

    if (!D.collabAvatars || !D.collabParticipantsList) return;
    D.collabAvatars.replaceChildren();
    D.collabParticipantsList.replaceChildren();

    const activeList = [
      {
        id: D.state.collabClientId,
        name: D.state.collabUserName || "You",
        color: D.state.collabUserColor || "#0f766e",
        role: D.state.collabRole || "editor",
        isSelf: true,
      },
    ];

    if (isConnected) {
      for (const [peerId, peer] of D.state.collabPeers) {
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

    if (D.collabParticipantsCount) {
      D.collabParticipantsCount.textContent = `${activeList.length} active`;
    }

    for (const p of activeList) {
      const chip = document.createElement("span");
      chip.className = "collab-avatar-chip";
      chip.style.backgroundColor = p.color;
      chip.textContent = (p.name || "U").charAt(0).toUpperCase();
      const pRoleStr = p.role === "owner" ? "Host" : p.role === "viewer" ? "Viewer" : "Editor";
      chip.title = `${p.name}${p.isSelf ? " (You)" : ""} · ${pRoleStr}`;
      D.collabAvatars.append(chip);

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
        selfBadge.className = `collab-role-badge is-${D.state.collabRole}`;
        selfBadge.textContent = D.state.collabRole.charAt(0).toUpperCase() + D.state.collabRole.slice(1);
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
            D.state.collabPeers.delete(p.id);
            syncCollabUI();
            requestAnimationFrame(D.redraw);
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
      D.collabParticipantsList.append(row);
    }
  }

  function openCollabDialog() {
    initCollabProfile();
    if (D.collabDialog) D.collabDialog.hidden = false;
    if (D.collabRoomInput) {
      if (D.state.collabRoomId) {
        D.collabRoomInput.value = D.state.collabRoomId;
      } else {
        D.collabRoomInput.value = D.collabRoomInput.value || "room-" + Math.random().toString(36).substring(2, 7);
      }
    }
    syncCollabUI();
    if (D.collabDialog) D.trapModalFocus(D.collabDialog);
  }

  function closeCollabDialog() {
    if (D.collabDialog) D.collabDialog.hidden = true;
    D.releaseModalFocus();
  }

  function collabSend(payload) {
    if (!D.state.collabRoomId) return;
    const msg = {
      ...payload,
      roomId: D.state.collabRoomId,
      senderId: D.state.collabClientId,
      senderName: D.state.collabUserName,
      senderColor: D.state.collabUserColor,
      senderRole: D.state.collabRole,
      timestamp: Date.now(),
    };
    const json = JSON.stringify(msg);

    if (D.state.collabSocket && D.state.collabSocket.readyState === WebSocket.OPEN) {
      try {
        D.state.collabSocket.send(json);
      } catch (err) {
        console.warn("Drawora Collab WS send failed:", err);
      }
    }

    if (D.state.collabChannel) {
      try {
        D.state.collabChannel.postMessage(msg);
      } catch (err) {
        console.warn("Drawora Collab BroadcastChannel send failed:", err);
      }
    }
  }

  function collabSendCursor(point) {
    if (!D.state.collabRoomId) return;
    const now = Date.now();
    if (now - D.state.collabLastCursorSent < 35) return;
    D.state.collabLastCursorSent = now;

    collabSend({
      type: "cursor",
      x: point.x,
      y: point.y,
      pageId: D.state.currentPageId,
      tool: D.state.tool,
      laserTrail: D.state.tool === "laser" ? [...D.state.laserTrail] : [],
    });
  }

  function collabBroadcastCurrentPageObjects() {
    if (!D.state.collabRoomId || D.state.collabSyncInProgress || isViewer()) return;
    collabSend({
      type: "object-upsert",
      pageId: D.state.currentPageId,
      objects: D.cloneData(D.state.objects),
    });
  }

  function collabBroadcastDelete(deletedIds) {
    if (!D.state.collabRoomId || D.state.collabSyncInProgress || isViewer() || !deletedIds.length) return;
    collabSend({
      type: "object-delete",
      pageId: D.state.currentPageId,
      ids: deletedIds,
    });
  }

  function collabBroadcastPages() {
    if (!D.state.collabRoomId || D.state.collabSyncInProgress || isViewer()) return;
    collabSend({
      type: "page-sync",
      pages: typeof D.snapshotPages === "function" ? D.snapshotPages() : D.state.pages,
      currentPageId: D.state.currentPageId,
    });
  }

  function handleCollabMessage(msg) {
    if (!msg || msg.senderId === D.state.collabClientId) return;

    if (msg.type === "cursor") {
      const existing = D.state.collabPeers.get(msg.senderId) || {};
      D.state.collabPeers.set(msg.senderId, {
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
      requestAnimationFrame(D.redraw);
      return;
    }

    if (msg.type === "presence-join") {
      D.state.collabPeers.set(msg.senderId, {
        id: msg.senderId,
        name: msg.senderName || "Collaborator",
        color: msg.senderColor || "#2563eb",
        role: msg.role || msg.senderRole || "editor",
        cursor: null,
      });
      syncCollabUI();

      collabSend({
        type: "presence-ack",
        recipientId: msg.senderId,
        role: D.state.collabRole,
      });

      if (D.state.objects.length > 0 || D.state.pages.length > 1) {
        collabSend({
          type: "board-sync-response",
          recipientId: msg.senderId,
          board: typeof D.cloneBoard === "function" ? D.cloneBoard() : null,
        });
      }
      return;
    }

    if (msg.type === "presence-ack") {
      D.state.collabPeers.set(msg.senderId, {
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
      D.state.collabPeers.delete(msg.senderId);
      syncCollabUI();
      requestAnimationFrame(D.redraw);
      return;
    }

    if (msg.type === "role-announce") {
      const peer = D.state.collabPeers.get(msg.senderId);
      if (peer) {
        peer.role = msg.role;
        syncCollabUI();
      }
      return;
    }

    if (msg.type === "role-update") {
      if (msg.targetId === D.state.collabClientId) {
        setCollabRole(msg.role, false);
      } else {
        const peer = D.state.collabPeers.get(msg.targetId);
        if (peer) {
          peer.role = msg.role;
          syncCollabUI();
        }
      }
      return;
    }

    if (msg.type === "kick-user") {
      if (msg.targetId === D.state.collabClientId) {
        collabDisconnect();
        window.alert("You have been removed from the collaboration room by the host.");
      } else {
        D.state.collabPeers.delete(msg.targetId);
        syncCollabUI();
        requestAnimationFrame(D.redraw);
      }
      return;
    }

    if (msg.type === "board-sync-request") {
      collabSend({
        type: "board-sync-response",
        recipientId: msg.senderId,
        board: typeof D.cloneBoard === "function" ? D.cloneBoard() : null,
      });
      return;
    }

    if (msg.type === "board-sync-response") {
      if (msg.recipientId && msg.recipientId !== D.state.collabClientId) return;
      if (msg.board && D.state.objects.length === 0 && D.state.pages.length <= 1) {
        D.state.collabSyncInProgress = true;
        try {
          if (typeof D.restoreBoard === "function") D.restoreBoard(msg.board);
        } finally {
          D.state.collabSyncInProgress = false;
        }
      }
      return;
    }

    if (msg.type === "object-upsert") {
      if (!msg.pageId || !Array.isArray(msg.objects)) return;
      D.state.collabSyncInProgress = true;
      try {
        if (msg.pageId === D.state.currentPageId) {
          D.state.objects = D.cloneData(msg.objects);
          if (typeof D.syncLayersUI === "function") D.syncLayersUI();
          if (typeof D.redraw === "function") D.redraw();
          if (typeof D.scheduleAutosave === "function") D.scheduleAutosave();
        } else {
          const targetPage = D.state.pages.find((p) => p.id === msg.pageId);
          if (targetPage) {
            targetPage.objects = D.cloneData(msg.objects);
            if (typeof D.scheduleAutosave === "function") D.scheduleAutosave();
          }
        }
      } finally {
        D.state.collabSyncInProgress = false;
      }
      return;
    }

    if (msg.type === "object-delete") {
      if (!msg.pageId || !Array.isArray(msg.ids)) return;
      D.state.collabSyncInProgress = true;
      try {
        if (msg.pageId === D.state.currentPageId) {
          D.state.objects = D.state.objects.filter((obj) => !msg.ids.includes(obj.id));
          D.state.selectedIds = D.state.selectedIds.filter((id) => !msg.ids.includes(id));
          if (typeof D.syncLayersUI === "function") D.syncLayersUI();
          if (typeof D.redraw === "function") D.redraw();
          if (typeof D.scheduleAutosave === "function") D.scheduleAutosave();
        } else {
          const targetPage = D.state.pages.find((p) => p.id === msg.pageId);
          if (targetPage && Array.isArray(targetPage.objects)) {
            targetPage.objects = targetPage.objects.filter((obj) => !msg.ids.includes(obj.id));
            if (typeof D.scheduleAutosave === "function") D.scheduleAutosave();
          }
        }
      } finally {
        D.state.collabSyncInProgress = false;
      }
      return;
    }

    if (msg.type === "page-sync") {
      if (!Array.isArray(msg.pages)) return;
      D.state.collabSyncInProgress = true;
      try {
        const currentActivePage = typeof D.currentPage === "function" ? D.currentPage() : null;
        D.state.pages = msg.pages.map((page) => {
          if (currentActivePage && page.id === currentActivePage.id) {
            return { ...page, objects: D.state.objects };
          }
          return page;
        });
        if (typeof D.syncPageUI === "function") D.syncPageUI();
        if (typeof D.redraw === "function") D.redraw();
        if (typeof D.scheduleAutosave === "function") D.scheduleAutosave();
      } finally {
        D.state.collabSyncInProgress = false;
      }
      return;
    }
  }

  function collabConnect(roomId, forcedRole) {
    const cleanRoom = (roomId || "").trim().toLowerCase().replace(/[^\w-]/g, "") || "room-default";
    if (forcedRole && ["owner", "editor", "viewer"].includes(forcedRole)) {
      setCollabRole(forcedRole, false);
    }

    if (D.state.collabRoomId === cleanRoom && D.state.collabStatus === "connected") {
      closeCollabDialog();
      return;
    }

    collabDisconnect();

    D.state.collabRoomId = cleanRoom;
    D.state.collabStatus = "connecting";
    syncCollabUI();

    // 1. Setup local / cross-tab BroadcastChannel
    if ("BroadcastChannel" in window) {
      try {
        D.state.collabChannel = new BroadcastChannel("drawora_collab_" + cleanRoom);
        D.state.collabChannel.onmessage = (event) => {
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
          D.state.collabStatus = "connected";
          syncCollabUI();
          collabSend({ type: "presence-join", role: D.state.collabRole });
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
          D.state.collabStatus = D.state.collabChannel ? "connected" : "offline";
          syncCollabUI();
        };

        ws.onclose = () => {
          if (D.state.collabRoomId) {
            D.state.collabStatus = D.state.collabChannel ? "connected" : "offline";
            syncCollabUI();
          }
        };

        D.state.collabSocket = ws;
      } else {
        D.state.collabStatus = "connected";
        syncCollabUI();
        collabSend({ type: "presence-join", role: D.state.collabRole });
      }
    } catch (err) {
      console.warn("Drawora Collab WS initiation note:", err);
      D.state.collabStatus = D.state.collabChannel ? "connected" : "offline";
      syncCollabUI();
    }

    closeCollabDialog();
  }

  function collabDisconnect() {
    if (D.state.collabRoomId) {
      collabSend({ type: "presence-leave" });
    }
    if (D.state.collabSocket) {
      try {
        D.state.collabSocket.close();
      } catch {}
      D.state.collabSocket = null;
    }
    if (D.state.collabChannel) {
      try {
        D.state.collabChannel.close();
      } catch {}
      D.state.collabChannel = null;
    }
    D.state.collabRoomId = null;
    D.state.collabStatus = "offline";
    D.state.collabPeers.clear();
    setCollabRole("owner", false);
    syncCollabUI();
    if (typeof D.redraw === "function") requestAnimationFrame(D.redraw);
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
        collabConnect(urlRoom, urlRole || D.state.collabRole);
      }
    } catch {}
  }

  const exports = {
    isViewer,
    isCollabOwner,
    setCollabRole,
    getCollabShareUrls,
    initCollabProfile,
    syncCollabColorUI,
    syncCollabUI,
    openCollabDialog,
    closeCollabDialog,
    collabSend,
    collabSendCursor,
    collabBroadcastCurrentPageObjects,
    collabBroadcastDelete,
    collabBroadcastPages,
    handleCollabMessage,
    collabConnect,
    collabDisconnect,
    checkUrlRoomParam,
  };

  Object.assign(D, exports);
  Object.assign(window, exports);
})(window.Drawora = window.Drawora || {});
