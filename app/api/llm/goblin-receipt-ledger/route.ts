import { createGoblinReceiptLedger } from "@/lib/llm/goblin-receipt-ledger";

export async function GET() {
  return Response.json({
    ok: true,
    ...createGoblinReceiptLedger(),
  });
}
