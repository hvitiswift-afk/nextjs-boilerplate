import { createGoblinControlDeckManifest } from "./goblin-control-deck-manifest";

export type GoblinReceiptLedgerEntry = {
  receiptId: string;
  routeIds: string[];
  paths: string[];
  layers: string[];
  kinds: Array<"dashboard" | "api">;
  lawCount: number;
  routeCount: number;
  duplicate: boolean;
};

export type GoblinReceiptLayerTotal = {
  layer: string;
  receiptCount: number;
  routeCount: number;
  duplicateReceiptCount: number;
};

export type GoblinReceiptLedger = {
  product: "Goblin LLM Receipt Ledger";
  status: "active" | "attention";
  routeTotal: number;
  receiptTotal: number;
  lawTotal: number;
  lawCoveragePercent: number;
  duplicateReceiptIds: string[];
  layerTotals: GoblinReceiptLayerTotal[];
  entries: GoblinReceiptLedgerEntry[];
  receipt: {
    id: "receipt-goblin-receipt-ledger-028";
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
      routeCount: routes.length,
      duplicate: routes.length > 1,
    };
  });

  const routeTotal = manifest.routes.length;
  const receiptTotal = entries.length;
  const lawTotal = manifest.routes.filter((route) => route.law.trim().length > 0).length;
  const lawCoveragePercent = routeTotal === 0 ? 0 : Math.round((lawTotal / routeTotal) * 100);
  const duplicateReceiptIds = entries.filter((entry) => entry.duplicate).map((entry) => entry.receiptId);
  const layers = [...new Set(manifest.routes.map((route) => route.layer))];

  const layerTotals = layers.map((layer): GoblinReceiptLayerTotal => {
    const layerRoutes = manifest.routes.filter((route) => route.layer === layer);
    const layerReceiptIds = [...new Set(layerRoutes.map((route) => route.receiptId))];

    return {
      layer,
      receiptCount: layerReceiptIds.length,
      routeCount: layerRoutes.length,
      duplicateReceiptCount: layerReceiptIds.filter((receiptId) =>
        duplicateReceiptIds.includes(receiptId),
      ).length,
    };
  });

  return {
    product: "Goblin LLM Receipt Ledger",
    status: duplicateReceiptIds.length === 0 && lawCoveragePercent === 100 ? "active" : "attention",
    routeTotal,
    receiptTotal,
    lawTotal,
    lawCoveragePercent,
    duplicateReceiptIds,
    layerTotals,
    entries,
    receipt: {
      id: "receipt-goblin-receipt-ledger-028",
      kind: "llm-goblin-receipt-ledger",
      status: "active",
    },
  };
}
