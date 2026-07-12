export type ZFNodeKind = "axiom" | "operator" | "relation" | "extension";

export type BayesianCoordinate = {
  prior: number;
  likelihood: number;
  evidence: number;
  posterior: number;
  confidence: number;
  note: string;
};

export type ZFNode = {
  id: string;
  label: string;
  kind: ZFNodeKind;
  symbol: string;
  shortName: string;
  description: string;
  x: number;
  y: number;
  weight: number;
  bayes: BayesianCoordinate;
};

export type ZFEdgeKind = "defines" | "requires" | "constructs" | "guards" | "extends";

export type ZFEdge = {
  id: string;
  from: string;
  to: string;
  kind: ZFEdgeKind;
  label: string;
};

function posterior(prior: number, likelihood: number, evidence: number) {
  return Number(((likelihood * prior) / evidence).toFixed(3));
}

export const zfNodes: ZFNode[] = [
  {
    id: "extensionality",
    label: "Extensionality",
    kind: "axiom",
    symbol: "A = B ⇔ ∀x(x ∈ A ↔ x ∈ B)",
    shortName: "same members, same set",
    description:
      "Two sets are equal exactly when they have the same elements. This is the identity lock on the whole network.",
    x: 280,
    y: 70,
    weight: 0.98,
    bayes: { prior: 0.96, likelihood: 0.98, evidence: 0.97, posterior: posterior(0.96, 0.98, 0.97), confidence: 0.97, note: "identity anchor" },
  },
  {
    id: "empty-set",
    label: "Empty Set",
    kind: "axiom",
    symbol: "∃A∀x(x ∉ A)",
    shortName: "nothing, formally",
    description:
      "There exists a set with no elements. The smallest clean room in the mathematical castle.",
    x: 90,
    y: 170,
    weight: 0.82,
    bayes: { prior: 0.88, likelihood: 0.91, evidence: 0.93, posterior: posterior(0.88, 0.91, 0.93), confidence: 0.9, note: "base construction" },
  },
  {
    id: "pairing",
    label: "Pairing",
    kind: "axiom",
    symbol: "∀a∀b∃c∀x(x ∈ c ↔ x=a ∨ x=b)",
    shortName: "make {a,b}",
    description:
      "Any two objects can be gathered into a set. This is the first tiny basket-goblin, but it behaves.",
    x: 200,
    y: 210,
    weight: 0.84,
    bayes: { prior: 0.86, likelihood: 0.89, evidence: 0.92, posterior: posterior(0.86, 0.89, 0.92), confidence: 0.88, note: "finite grouping" },
  },
  {
    id: "union",
    label: "Union",
    kind: "axiom",
    symbol: "⋃A = {x | ∃y(y ∈ A ∧ x ∈ y)}",
    shortName: "flatten one layer",
    description:
      "A set of sets can be flattened by one membership layer. Not all layers, just one. Precision matters; soup is not a theorem.",
    x: 380,
    y: 210,
    weight: 0.88,
    bayes: { prior: 0.89, likelihood: 0.9, evidence: 0.91, posterior: posterior(0.89, 0.9, 0.91), confidence: 0.9, note: "layer flattening" },
  },
  {
    id: "power-set",
    label: "Power Set",
    kind: "axiom",
    symbol: "P(A) = {x | x ⊆ A}",
    shortName: "all subsets",
    description:
      "Every set has a set of all its subsets. This is where combinatorial goblins start multiplying.",
    x: 510,
    y: 170,
    weight: 0.92,
    bayes: { prior: 0.9, likelihood: 0.94, evidence: 0.95, posterior: posterior(0.9, 0.94, 0.95), confidence: 0.92, note: "subset expansion" },
  },
  {
    id: "separation",
    label: "Separation Schema",
    kind: "axiom",
    symbol: "{x ∈ A | φ(x)}",
    shortName: "filter an existing set",
    description:
      "Predicates can carve subsets from an existing set. It does not create arbitrary universal mega-sets.",
    x: 130,
    y: 350,
    weight: 0.9,
    bayes: { prior: 0.91, likelihood: 0.92, evidence: 0.94, posterior: posterior(0.91, 0.92, 0.94), confidence: 0.91, note: "bounded filtering" },
  },
  {
    id: "replacement",
    label: "Replacement Schema",
    kind: "axiom",
    symbol: "∀a∃b∀y(y ∈ b ↔ ∃x∈a φ(x,y))",
    shortName: "image of a set",
    description:
      "A definable function sends a set-sized domain to a set-sized image. Very powerful; keep the logic leash clipped.",
    x: 280,
    y: 390,
    weight: 0.94,
    bayes: { prior: 0.9, likelihood: 0.95, evidence: 0.96, posterior: posterior(0.9, 0.95, 0.96), confidence: 0.93, note: "definable image" },
  },
  {
    id: "infinity",
    label: "Infinity",
    kind: "axiom",
    symbol: "∃I(∅ ∈ I ∧ ∀x∈I(x∪{x} ∈ I))",
    shortName: "natural-number seed",
    description:
      "There exists an inductive set, giving the foundation for natural numbers. The counting goblin receives a legal badge.",
    x: 440,
    y: 390,
    weight: 0.89,
    bayes: { prior: 0.87, likelihood: 0.91, evidence: 0.94, posterior: posterior(0.87, 0.91, 0.94), confidence: 0.89, note: "inductive seed" },
  },
  {
    id: "foundation",
    label: "Foundation",
    kind: "axiom",
    symbol: "A≠∅ → ∃x∈A(x∩A=∅)",
    shortName: "no infinite ∈-descent",
    description:
      "Every nonempty set has an element disjoint from it. This blocks circular membership weirdness in standard ZF.",
    x: 560,
    y: 315,
    weight: 0.86,
    bayes: { prior: 0.83, likelihood: 0.87, evidence: 0.92, posterior: posterior(0.83, 0.87, 0.92), confidence: 0.85, note: "well-founded guard" },
  },
  {
    id: "membership",
    label: "Membership",
    kind: "relation",
    symbol: "x ∈ A",
    shortName: "element relation",
    description:
      "The primitive relation of the network: one object is an element of a set.",
    x: 280,
    y: 250,
    weight: 1,
    bayes: { prior: 0.99, likelihood: 0.99, evidence: 0.99, posterior: posterior(0.99, 0.99, 0.99), confidence: 0.99, note: "primitive relation" },
  },
  {
    id: "subset",
    label: "Subset",
    kind: "relation",
    symbol: "A ⊆ B ⇔ ∀x(x ∈ A → x ∈ B)",
    shortName: "membership containment",
    description:
      "Subset is defined through membership implication. It is not vibes; it is element-by-element containment.",
    x: 430,
    y: 300,
    weight: 0.87,
    bayes: { prior: 0.91, likelihood: 0.92, evidence: 0.94, posterior: posterior(0.91, 0.92, 0.94), confidence: 0.91, note: "derived relation" },
  },
  {
    id: "choice",
    label: "Choice Extension",
    kind: "extension",
    symbol: "ZF + AC = ZFC",
    shortName: "optional selector",
    description:
      "The axiom of choice is tracked as an extension point, not silently smuggled into ZF wearing a trench coat.",
    x: 650,
    y: 170,
    weight: 0.72,
    bayes: { prior: 0.68, likelihood: 0.76, evidence: 0.88, posterior: posterior(0.68, 0.76, 0.88), confidence: 0.72, note: "explicit extension" },
  },
];

export const zfEdges: ZFEdge[] = [
  { id: "e1", from: "membership", to: "extensionality", kind: "defines", label: "equality by ∈" },
  { id: "e2", from: "membership", to: "subset", kind: "defines", label: "⊆ via ∈" },
  { id: "e3", from: "empty-set", to: "infinity", kind: "requires", label: "∅ seed" },
  { id: "e4", from: "pairing", to: "infinity", kind: "constructs", label: "successor" },
  { id: "e5", from: "union", to: "infinity", kind: "constructs", label: "x ∪ {x}" },
  { id: "e6", from: "subset", to: "power-set", kind: "defines", label: "all subsets" },
  { id: "e7", from: "separation", to: "subset", kind: "constructs", label: "filtered subset" },
  { id: "e8", from: "replacement", to: "union", kind: "constructs", label: "images collect" },
  { id: "e9", from: "foundation", to: "membership", kind: "guards", label: "no ∈ loop" },
  { id: "e10", from: "choice", to: "power-set", kind: "extends", label: "selectors" },
];

export const zfPredicates = [
  "x ∈ A",
  "A ⊆ B ⇔ ∀x(x ∈ A → x ∈ B)",
  "A = B ⇔ ∀x(x ∈ A ↔ x ∈ B)",
  "⋃A = {x | ∃y(y ∈ A ∧ x ∈ y)}",
  "P(A) = {x | x ⊆ A}",
  "P(H|E) = P(E|H)P(H)/P(E)",
  "ZF + AC = ZFC",
];

export const bayesianCoordinateFormula = "P(H|E) = P(E|H)P(H)/P(E)";

export function bayesianUpdate(prior: number, likelihood: number, evidence: number) {
  return posterior(prior, likelihood, evidence);
}

export function zfBayesianCoordinateSummary() {
  const totals = zfNodes.reduce(
    (acc, node) => {
      acc.prior += node.bayes.prior;
      acc.likelihood += node.bayes.likelihood;
      acc.evidence += node.bayes.evidence;
      acc.posterior += node.bayes.posterior;
      acc.confidence += node.bayes.confidence;
      return acc;
    },
    { prior: 0, likelihood: 0, evidence: 0, posterior: 0, confidence: 0 },
  );

  const count = zfNodes.length;

  return {
    meanPrior: Number((totals.prior / count).toFixed(3)),
    meanLikelihood: Number((totals.likelihood / count).toFixed(3)),
    meanEvidence: Number((totals.evidence / count).toFixed(3)),
    meanPosterior: Number((totals.posterior / count).toFixed(3)),
    meanConfidence: Number((totals.confidence / count).toFixed(3)),
  };
}

export function zfNetworkHealth() {
  const axiomWeight = zfNodes
    .filter((node) => node.kind === "axiom")
    .reduce((sum, node) => sum + node.weight, 0);
  const axiomCount = zfNodes.filter((node) => node.kind === "axiom").length;
  const guardEdges = zfEdges.filter((edge) => edge.kind === "guards").length;
  const extensionEdges = zfEdges.filter((edge) => edge.kind === "extends").length;
  const bayes = zfBayesianCoordinateSummary();

  return {
    axiomCount,
    relationCount: zfNodes.filter((node) => node.kind === "relation").length,
    extensionCount: zfNodes.filter((node) => node.kind === "extension").length,
    edgeCount: zfEdges.length,
    meanAxiomWeight: Number((axiomWeight / axiomCount).toFixed(3)),
    guardEdges,
    extensionEdges,
    meanPosterior: bayes.meanPosterior,
    meanBayesConfidence: bayes.meanConfidence,
  };
}
