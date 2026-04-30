export type GoblinDeckItem = {
  id: string;
  kind: "dashboard" | "api" | "helper";
  layer: string;
  path: string;
  status: "active" | "visible" | "draft";
  hasReceipt: boolean;
  hasLaw: boolean;
};

const items: GoblinDeckItem[] = [
  { id: "goblin-health-api", kind: "api", layer: "diagnostics", path: "/api/llm/goblin-control-deck-health", status: "active", hasReceipt: true, hasLaw: true },
  { id: "goblin-health-page", kind: "dashboard", layer: "diagnostics", path: "/goblin/health", status: "visible", hasReceipt: true, hasLaw: true },
  { id: "goblin-manifest-api", kind: "api", layer: "manifest", path: "/api/llm/goblin-control-deck", status: "active", hasReceipt: true, hasLaw: true },
  { id: "observer-constellations-api", kind: "api", layer: "observer", path: "/api/llm/observer-constellations", status: "active", hasReceipt: true, hasLaw: true },
  { id: "observer-constellations-page", kind: "dashboard", layer: "observer", path: "/goblin/constellations", status: "visible", hasReceipt: true, hasLaw: true },
  { id: "observer-parallax-api", kind: "api", layer: "observer", path: "/api/llm/observer-parallax", status: "active", hasReceipt: true, hasLaw: true },
  { id: "observer-parallax-page", kind: "dashboard", layer: "observer", path: "/goblin/parallax", status: "visible", hasReceipt: true, hasLaw: true },
  { id: "observer-route-api", kind: "api", layer: "routing", path: "/api/llm/observer-route", status: "active", hasReceipt: true, hasLaw: true },
  { id: "observer-route-page", kind: "dashboard", layer: "routing", path: "/goblin/observer-route", status: "visible", hasReceipt: true, hasLaw: true },
];

export function createGoblinControlDeckManifest() {
  return {
    title: "Goblin Control Deck Manifest",
    law: "Every visible Goblin route needs a receipt, a layer, and a deterministic helper. No fog-machine APIs pretending to be architecture.",
    items,
    routes: items.map((item) => item.path),
    receipt: {
      id: "receipt-goblin-control-deck-manifest-009",
      kind: "llm-goblin-control-deck-manifest",
      status: "active",
      law: "Route authority is explicit, helper-backed, and build-testable.",
    },
  };
}
