import { createObserverConstellationMap, type ObserverWorld } from "./observer-constellations";

export type ObserverConstellationRouteInput = {
  observer: ObserverWorld;
  constellationId?: string;
  query?: string;
};

export type ObserverConstellationRoute = {
  ok: boolean;
  product: "Goblin LLM Observer Constellation Router";
  observer: ObserverWorld;
  selected: {
    id: string;
    name: string;
    route: string;
    anchor: string;
    mythicRole: string;
    notes: string;
  } | null;
  alternatives: string[];
  law: string;
  receipt: {
    id: "receipt-observer-constellation-router-009";
    kind: "llm-observer-constellation-router";
    status: "active" | "not-found";
  };
};

export function routeObserverConstellation(
  input: ObserverConstellationRouteInput,
): ObserverConstellationRoute {
  const map = createObserverConstellationMap();
  const sky = input.observer === "mars" ? map.mars : map.earth;
  const normalizedQuery = input.query?.toLowerCase().trim();

  const selected =
    sky.find((item) => item.id === input.constellationId) ??
    sky.find((item) => normalizedQuery && item.name.toLowerCase().includes(normalizedQuery)) ??
    sky.find((item) => normalizedQuery && item.anchor.toLowerCase().includes(normalizedQuery)) ??
    null;

  return {
    ok: Boolean(selected),
    product: "Goblin LLM Observer Constellation Router",
    observer: input.observer,
    selected: selected
      ? {
          id: selected.id,
          name: selected.name,
          route: selected.goblinRoute,
          anchor: selected.anchor,
          mythicRole: selected.mythicRole,
          notes: selected.notes,
        }
      : null,
    alternatives: sky.map((item) => item.id),
    law: "Observer first, constellation second, Goblin route third, Bz consequence gate always last.",
    receipt: {
      id: "receipt-observer-constellation-router-009",
      kind: "llm-observer-constellation-router",
      status: selected ? "active" : "not-found",
    },
  };
}
