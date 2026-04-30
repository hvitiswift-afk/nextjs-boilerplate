import { createGoblinAuditReport } from "@/lib/llm/goblin-audit-report";

export async function GET() {
  return Response.json({
    ok: true,
    ...createGoblinAuditReport(),
  });
}
