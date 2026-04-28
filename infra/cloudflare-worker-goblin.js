export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    const algorithm = {
      name: "Goblin",
      mode: "edge-enclave-bridge",
      law: ["listen", "classify", "route", "draft", "verify", "approve", "deploy"],
      risk: method === "GET" || method === "HEAD" ? "read-only" : "needs-human-approval",
      openLoop: true,
      enclave: "local-first / private-control-plane",
      outpost: "2099-2100",
      path: url.pathname,
      timestamp: new Date().toISOString()
    };

    if (url.pathname.startsWith("/api/goblin")) {
      return Response.json({ ok: true, algorithm });
    }

    return fetch(request);
  }
};
