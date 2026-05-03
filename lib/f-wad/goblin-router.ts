import type { ClassifiedField, Polarity, Realm } from "./field";

export type GoblinRoute = {
  route: string;
  targetCube: "C1" | "C2" | "C3" | "C4" | "H";
  requiredPolarity: Polarity;
  receiptRequired: boolean;
  note: string;
};

const routeByRealm: Record<Realm, Omit<GoblinRoute, "requiredPolarity">> = {
  Elysium: {
    route: "positive_swirl_charge",
    targetCube: "C4",
    receiptRequired: true,
    note: "Route source energy to the output cube for a green pulse.",
  },
  Asphodel: {
    route: "asphodel_hold_or_classify",
    targetCube: "C2",
    receiptRequired: true,
    note: "Hold quiet signals and classify neutral swirls before release.",
  },
  Gehenna: {
    route: "sink_swirl_verify",
    targetCube: "C3",
    receiptRequired: true,
    note: "Send sink pressure through the Stokes verification gate.",
  },
  Pluto: {
    route: "pluto_balance",
    targetCube: "H",
    receiptRequired: true,
    note: "Balance +time and -time at the hub; do not destroy the swirl.",
  },
};

export function routeGoblin(field: ClassifiedField): GoblinRoute {
  const base = routeByRealm[field.realm];

  if (field.realm === "Asphodel" && field.motion === "quiet") {
    return {
      ...base,
      route: "asphodel_hold",
      requiredPolarity: "neutral",
      note: "Quiet Asphodel field: hold, read, and avoid over-routing.",
    };
  }

  return {
    ...base,
    requiredPolarity: field.polarity,
  };
}
