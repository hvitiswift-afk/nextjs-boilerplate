import { resolveObserverRoute } from "@/lib/llm/observer-route-resolver";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.observer || !body?.prompt) {
    return Response.json(
      { ok: false, error: "Missing observer or prompt." },
      { status: 400 },
    );
  }

  if (!["earth", "mars"].includes(body.observer)) {
    return Response.json(
      { ok: false, error: "Observer must be earth or mars." },
      { status: 400 },
    );
  }

  const result = resolveObserverRoute({
    observer: body.observer,
    prompt: body.prompt,
  });

  return Response.json({
    ok: true,
    result,
  });
}
