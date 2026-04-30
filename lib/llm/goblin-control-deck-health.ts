import { createGoblinControlDeckManifest } from "./goblin-control-deck-manifest";

export type GoblinControlDeckHealthItem = {
  id: string;
  path: string;
  kind: "dashboard" | "api";
  layer: string;
  hasReceipt: boolean;
  hasLaw: boolean;
  status: "healthy" | "missing_receipt" | "missing_law";
};

export type GoblinControlDeckLayerHealth = {
  layer: string;
  routeCount: number;
  dashboardCount: number;
  apiCount: number;
  healthyCount: number;
};

export type GoblinControlDeckHealth = {
  product: "Goblin LLM Control Deck Health";
  status: "healthy" | "attention";
  dashboardCount: number;
  apiCount: number;
  receiptCount: number;
  duplicateReceiptIds: string[];
  layerHealth: GoblinControlDeckLayerHealth[];
  items: GoblinControlDeckHealthItem[];
  receipt: {
    id: "receipt-goblin-control-deck-health-021";
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
      layer: route.layer,
      hasReceipt,
      hasLaw,
      status: !hasReceipt ? "missing_receipt" : !hasLaw ? "missing_law" : "healthy",
    };
  });

  const dashboardCount = manifest.routes.filter((route) => route.kind === "dashboard").length;
  const apiCount = manifest.routes.filter((route) => route.kind === "api").length;
  const receiptIds = manifest.routes.map((route) => route.receiptId);
  const receiptCount = new Set(receiptIds).size;
  const duplicateReceiptIds = [...new Set(receiptIds.filter((id, index) => receiptIds.indexOf(id) !== index))];

  const layers = [...new Set(manifest.routes.map((route) => route.layer))];
  const layerHealth = layers.map((layer): GoblinControlDeckLayerHealth => {
    const layerItems = items.filter((item) => item.layer === layer);

    return {
      layer,
      routeCount: layerItems.length,
      dashboardCount: layerItems.filter((item) => item.kind === "dashboard").length,
      apiCount: layerItems.filter((item) => item.kind === "api").length,
      healthyCount: layerItems.filter((item) => item.status === "healthy").length,
    };
  });

  const status = items.every((item) => item.status === "healthy") && duplicateReceiptIds.length === 0
    ? "healthy"
    : "attention";

  return {
    product: "Goblin LLM Control Deck Health",
    status,
    dashboardCount,
    apiCount,
    receiptCount,
    duplicateReceiptIds,
    layerHealth,
    items,
    receipt: {
      id: "receipt-goblin-control-deck-health-021",
      kind: "llm-goblin-control-deck-health",
      status: "active",
    },
  };
}
