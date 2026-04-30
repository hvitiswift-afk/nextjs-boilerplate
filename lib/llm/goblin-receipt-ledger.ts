import { createGoblinControlDeckManifest } from "./goblin-control-deck-manifest";

export type GoblinReceiptLedgerEntry = {
  receiptId: string;
  routeIds: string[];
  paths: string[];
  layers: string[];
  kinds: Array<"dashboard" | "api">;
  lawCount: number;
  duplicate: boolean;
};

export type GoblinReceiptLedger = {
  product: "Goblin LLM Receipt Ledger";
  status: "active";
  receiptTotal: number;
  duplicateReceiptIds: string[];
  entries: GoblinReceiptLedgerEntry[];
  receipt: {
    id: "receipt-goblin-receipt-ledger-023";
    kind: "llm-goblin-receipt-ledger";
    status: "active";
  };
};

export function createGoblinReceiptLedger(): GoblinReceiptLedger {
  const manifest = createGoblinControlDeckManifest();
  const receiptIds = [...new Set(manifest.routes.map((route) => route.receiptId))];

  const entries = receiptIds.map((receiptId): GoblinReceiptLedgerEntry => {
    const routes = manifest.routes.filter((route) => route.receiptId === receiptId);

    return {
      receiptId,
      routeIds: routes.map((route) => route.id),
      paths: routes.map((route) => route.path),
      layers: [...new Set(routes.map((route) => route.layer))],
      kinds: [...new Set(routes.map((route) => route.kind))],
      lawCount: routes.filter((route) => route.law.trim().length > 0).length,
      duplicate: routes.length > 1,
    };
  });

  return {
    product: "Goblin LLM Receipt Ledger",
    status: "active",
    receiptTotal: entries.length,
    duplicateReceiptIds: entries.filter((entry) => entry.duplicate).map((entry) => entry.receiptId),
    entries,
    receipt: {
      id: "receipt-goblin-receipt-ledger-023",
      kind: "llm-goblin-receipt-ledger",
      status: "active",
    },
  };
}
