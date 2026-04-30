import { createGoblinControlDeckManifest } from "./goblin-control-deck-manifest";

export function createGoblinControlDeckHealth() {
  const manifest = createGoblinControlDeckManifest();
  const dashboardCount = manifest.items.filter((item) => item.kind === "dashboard").length;
  const apiCount = manifest.items.filter((item) => item.kind === "api").length;
  const receiptIds = manifest.items.map((item) => `receipt-${item.id}`);
  const duplicateReceiptIds = receiptIds.filter((id, index) => receiptIds.indexOf(id) !== index);
  const layers = Array.from(new Set(manifest.items.map((item) => item.layer)));

  const layerHealth = layers.map((layer) => {
    const layerItems = manifest.items.filter((item) => item.layer === layer);
    return {
      layer,
      routeCount: layerItems.length,
      dashboardCount: layerItems.filter((item) => item.kind === "dashboard").length,
      apiCount: layerItems.filter((item) => item.kind === "api").length,
      healthyCount: layerItems.filter((item) => item.hasReceipt && item.hasLaw).length,
    };
  });

  const healthy = manifest.items.every((item) => item.hasReceipt && item.hasLaw) && duplicateReceiptIds.length === 0;

  return {
    status: healthy ? "healthy" : "needs-attention",
    dashboardCount,
    apiCount,
    receiptCount: receiptIds.length,
    duplicateReceiptIds,
    layerHealth,
    items: manifest.items,
    receipt: {
      id: "receipt-goblin-control-deck-health-013",
      kind: "llm-goblin-control-deck-health",
      status: healthy ? "clear" : "attention",
      law: "Health is computed from explicit receipts, laws, and route inventory. Spreadsheet wand not accepted as proof.",
    },
  };
}
