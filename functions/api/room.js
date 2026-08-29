// Cloudflare Pages Function WebSocket Room Handler for Drawora Real-Time Collaboration

const rooms = new Map();

function getRoomSockets(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  return rooms.get(roomId);
}

function broadcastToRoom(roomId, message, senderWs) {
  const roomSockets = getRoomSockets(roomId);
  for (const ws of roomSockets) {
    if (ws !== senderWs && ws.readyState === WebSocket.READY_STATE_OPEN) {
      try {
        ws.send(message);
      } catch (err) {
        console.warn("Drawora Room broadcast error:", err);
      }
    }
  }
}

export async function onRequest(context) {
  const { request } = context;
  const upgradeHeader = request.headers.get("Upgrade");

  if (!upgradeHeader || upgradeHeader.toLowerCase() !== "websocket") {
    return new Response(
      JSON.stringify({
        error: "Expected Upgrade: websocket",
        status: "websocket_endpoint",
        roomsActive: rooms.size,
      }),
      {
        status: 426,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const url = new URL(request.url);
  const roomId = url.searchParams.get("room") || "default";

  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  server.accept();

  const roomSockets = getRoomSockets(roomId);
  roomSockets.add(server);

  server.addEventListener("message", (event) => {
    try {
      const data = event.data;
      broadcastToRoom(roomId, data, server);
    } catch (err) {
      console.warn("Drawora Room message handling error:", err);
    }
  });

  const cleanup = () => {
    roomSockets.delete(server);
    if (roomSockets.size === 0) {
      rooms.delete(roomId);
    }
  };

  server.addEventListener("close", cleanup);
  server.addEventListener("error", cleanup);

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}
