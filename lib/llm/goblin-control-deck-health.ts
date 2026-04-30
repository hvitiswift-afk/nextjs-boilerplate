import { createGoblinControlDeckManifest } from "./goblin-control-deck-manifest";

export type GoblinControlDeckHealthItem = {
  id: string;
  path: string;
  kind: "dashboard" | "api";
  hasReceipt: boolean;
  hasLaw: boolean;
  status: "healthy" | "missing_receipt" | "missing_law";
};

export type GoblinControlDeckHealth = {
  product: "Goblin LLM Control Deck Health";
  status: "healthy" | "attention";
  dashboardCount: number;
  apiCount: number;
  receiptCount: number;
  items: GoblinControlDeckHealthItem[];
  receipt: {
    id: "receipt-goblin-control-deck-health-016";
    kind: "llm-goblin-control-deck-health";
    status: "active";
  };
};

export function createGoblinControlDeckHealth(): GoblinControlDeckHealth {
  const manifest = createGoblinControlDeckManifest();

  const items = manifest.routes.map((route): GoblinControlDeckHealthItem => {
    const hasReceipt = route.receiptId.trim().length > 0;
    const hasLaw = route.law.trim().length > 0;

    return {
      id: route.id,
      path: route.path,
      kind: route.kind,
      hasReceipt,
      hasLaw,
      status: !hasReceipt ? "missing_receipt" : !hasLaw ? "missing_law" : "healthy",
    };
  });

  const dashboardCount = manifest.routes.filter((route) => route.kind === "dashboard").length;
  const apiCount = manifest.routes.filter((route) => route.kind === "api").length;
  const receiptCount = new Set(manifest.routes.map((route) => route.receiptId)).size;
  const status = items.every((item) => item.status === "healthy") ? "healthy" : "attention";

  return {
    product: "Goblin LLM Control Deck Health",
    status,
    dashboardCount,
    apiCount,
    receiptCount,
    items,
    receipt: {
      id: "receipt-goblin-control-deck-health-016",
      kind: "llm-goblin-control-deck-health",
      status: "active",
    },
  };
}
