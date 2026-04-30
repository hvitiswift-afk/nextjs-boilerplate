import { createObserverParallaxMap } from "@/lib/llm/observer-parallax";

export async function GET() {
  return Response.json({
    ok: true,
    ...createObserverParallaxMap(),
  });
}
