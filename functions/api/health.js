export async function onRequestGet(context) {
  const info = {
    status: "ok",
    app: "Drawora",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: context.env.ENVIRONMENT || "production",
    edgeLocation: context.request.cf ? context.request.cf.colo : "local",
  };

  return new Response(JSON.stringify(info, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
