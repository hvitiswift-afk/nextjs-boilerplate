export type GoblinControlDeckRoute = {
  id: string;
  title: string;
  path: string;
  kind: "dashboard" | "api";
  layer:
    | "galaxy"
    | "observer_constellations"
    | "observer_parallax"
    | "observer_route"
    | "control_deck";
  receiptId: string;
  law: string;
};

export type GoblinControlDeckManifest = {
  product: "Goblin LLM Control Deck Manifest";
  status: "active";
  routes: GoblinControlDeckRoute[];
  receipt: {
    id: "receipt-goblin-control-deck-manifest-014";
    kind: "llm-goblin-control-deck-manifest";
    status: "active";
  };
};

export function createGoblinControlDeckManifest(): GoblinControlDeckManifest {
  return {
    product: "Goblin LLM Control Deck Manifest",
    status: "active",
    routes: [
      {
        id: "dashboard-control-deck",
        title: "Goblin Control Deck",
        path: "/goblin",
        kind: "dashboard",
        layer: "control_deck",
        receiptId: "receipt-goblin-control-deck-013",
        law: "A router becomes usable when every gate has a visible control deck.",
      },
      {
        id: "dashboard-galaxy",
        title: "Galaxy Dashboard",
        path: "/goblin/galaxy",
        kind: "dashboard",
        layer: "galaxy",
        receiptId: "receipt-goblin-star-map-dashboard-006",
        law: "Galaxy routes are governable when the gates are visible.",
      },
      {
        id: "dashboard-constellations",
        title: "Observer Constellations",
        path: "/goblin/constellations",
        kind: "dashboard",
        layer: "observer_constellations",
        receiptId: "receipt-observer-constellation-dashboard-008",
        law: "Mark the observing world before interpreting the sky.",
      },
      {
        id: "dashboard-parallax",
        title: "Observer Parallax",
        path: "/goblin/parallax",
        kind: "dashboard",
        layer: "observer_parallax",
        receiptId: "receipt-observer-parallax-earth-mars-009",
        law: "Earth and Mars share deep-star gates; foreground changes routing mood.",
      },
      {
        id: "dashboard-observer-route",
        title: "Observer Route Resolver",
        path: "/goblin/observer-route",
        kind: "dashboard",
        layer: "observer_route",
        receiptId: "receipt-observer-route-dashboard-012",
        law: "Observer first, constellation second, Goblin route third, receipt always.",
      },
      {
        id: "api-observer-constellations",
        title: "Observer Constellations API",
        path: "/api/llm/observer-constellations",
        kind: "api",
        layer: "observer_constellations",
        receiptId: "receipt-observer-constellations-earth-mars-007",
        law: "Earth gives home orientation; Mars gives expedition orientation.",
      },
      {
        id: "api-observer-parallax",
        title: "Observer Parallax API",
        path: "/api/llm/observer-parallax",
        kind: "api",
        layer: "observer_parallax",
        receiptId: "receipt-observer-parallax-earth-mars-009",
        law: "Pair observer skies across a stable deep-sky bridge.",
      },
      {
        id: "api-observer-route",
        title: "Observer Route API",
        path: "/api/llm/observer-route",
        kind: "api",
        layer: "observer_route",
        receiptId: "receipt-observer-route-resolver-011",
        law: "Resolve prompt, observer, constellation, route, and parallax pair.",
      },
    ],
    receipt: {
      id: "receipt-goblin-control-deck-manifest-014",
      kind: "llm-goblin-control-deck-manifest",
      status: "active",
    },
  };
}
