import { createGoblinControlDeckManifest } from "@/lib/llm/goblin-control-deck-manifest";

export async function GET() {
  return Response.json({
    ok: true,
    ...createGoblinControlDeckManifest(),
  });
}
