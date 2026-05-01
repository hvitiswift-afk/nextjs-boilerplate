import { createGoblinAuditReport } from "@/lib/llm/goblin-audit-report";

export async function GET() {
  return Response.json({
    ok: true,
    route: {
      id: "api-goblin-audit-report",
      path: "/api/llm/goblin-audit-report",
      kind: "api",
      layer: "audit",
      receiptId: "receipt-goblin-audit-report-api-042",
      law: "An audit API becomes legible when it returns route identity, verdict, pass rate, attention reason, and module receipt.",
    },
    ...createGoblinAuditReport(),
  });
}
