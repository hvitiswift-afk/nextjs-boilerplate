export type HyruleNode = {
  id: string;
  name: "Din" | "Nayru" | "Farore" | "Hyrule Core";
  domain: "power" | "wisdom" | "courage" | "core";
  color: "amber" | "cyan" | "emerald" | "white";
  x: number;
  y: number;
  strength: number;
  order: number;
  growth: number;
  risk: number;
  description: string;
};

export const hyruleNodes: HyruleNode[] = [
  {
    id: "din",
    name: "Din",
    domain: "power",
    color: "amber",
    x: 160,
    y: 310,
    strength: 0.91,
    order: 0.64,
    growth: 0.68,
    risk: 0.24,
    description: "Power, force, heat, and constructive pressure."
  },
  {
    id: "nayru",
    name: "Nayru",
    domain: "wisdom",
    color: "cyan",
    x: 280,
    y: 110,
    strength: 0.86,
    order: 0.94,
    growth: 0.62,
    risk: 0.11,
    description: "Wisdom, law, pattern, memory, and coherent order."
  },
  {
    id: "farore",
    name: "Farore",
    domain: "courage",
    color: "emerald",
    x: 400,
    y: 310,
    strength: 0.84,
    order: 0.71,
    growth: 0.95,
    risk: 0.16,
    description: "Courage, life, growth, motion, and branching possibility."
  },
  {
    id: "hyrule-core",
    name: "Hyrule Core",
    domain: "core",
    color: "white",
    x: 280,
    y: 245,
    strength: 0.88,
    order: 0.83,
    growth: 0.81,
    risk: 0.12,
    description: "The balanced composite state formed from Din, Nayru, and Farore."
  }
];

export const hyruleEquations = [
  { name: "State vector", formula: "x = [D, N, F]^T", note: "Din, Nayru, and Farore form the state basis." },
  { name: "Hyrule synthesis", formula: "H = alpha*D + beta*N + gamma*F", note: "Hyrule emerges as a weighted blend of power, wisdom, and courage." },
  { name: "Balance condition", formula: "B = 1 - Var([D, N, F])", note: "Balance is highest when the three pillars are close in magnitude." },
  { name: "Stability", formula: "S = (N + 0.5*(D + F))*(1 - R)", note: "Wisdom stabilizes power and courage while risk reduces coherence." },
  { name: "Growth flow", formula: "G = F*(1 + N - R)", note: "Courage grows best when guided by wisdom and constrained risk." },
  { name: "Civic output", formula: "C = D * N * F", note: "The kingdom is strongest when all three domains are simultaneously active." }
];

export function variance(values: number[]) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
}

export function balanceScore() {
  const values = hyruleNodes.filter((node) => node.domain !== "core").map((node) => node.strength);
  return 1 - variance(values);
}

export function meanRisk() {
  const values = hyruleNodes.filter((node) => node.domain !== "core").map((node) => node.risk);
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function stabilityScore() {
  const din = hyruleNodes.find((node) => node.id === "din")!;
  const nayru = hyruleNodes.find((node) => node.id === "nayru")!;
  const farore = hyruleNodes.find((node) => node.id === "farore")!;
  const risk = meanRisk();
  return (nayru.strength + 0.5 * (din.strength + farore.strength)) * (1 - risk);
}

export function growthScore() {
  const farore = hyruleNodes.find((node) => node.id === "farore")!;
  const nayru = hyruleNodes.find((node) => node.id === "nayru")!;
  const risk = meanRisk();
  return farore.growth * (1 + nayru.order - risk);
}

export function civicOutput() {
  const din = hyruleNodes.find((node) => node.id === "din")!;
  const nayru = hyruleNodes.find((node) => node.id === "nayru")!;
  const farore = hyruleNodes.find((node) => node.id === "farore")!;
  return din.strength * nayru.strength * farore.strength;
}
