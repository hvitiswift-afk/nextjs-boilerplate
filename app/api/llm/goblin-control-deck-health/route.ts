import { createGoblinControlDeckHealth } from "@/lib/llm/goblin-control-deck-health";

export async function GET() {
  return Response.json({
    ok: true,
    ...createGoblinControlDeckHealth(),
  });
}
