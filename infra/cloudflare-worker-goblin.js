export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    const risk = method === "GET" || method === "HEAD" ? "read-only" : "needs-human-approval";
    const algorithm = {
      name: "Goblin",
      law: ["listen", "classify", "route", "draft", "verify", "approve", "deploy"],
      openLoop: true,
      risk,
      path: url.pathname,
      timestamp: new Date().toISOString()
    };

    if (url.pathname.startsWith("/api/goblin")) {
      return Response.json({ ok: true, algorithm });
    }

    return fetch(request);
  }
};
