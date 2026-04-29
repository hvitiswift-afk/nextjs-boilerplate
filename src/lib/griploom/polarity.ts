export type Polarity = "positive" | "negative" | "neutral" | "alternating";

export type PolarityStyle = {
  polarity: Polarity;
  color: string;
  line: "ray" | "ground" | "axis" | "wave";
  shape: "circle" | "square" | "diamond" | "triangle";
  meaning: string;
};

export const polarityStyles: Record<Polarity, PolarityStyle> = {
  positive: {
    polarity: "positive",
    color: "#FFEA4A",
    line: "ray",
    shape: "triangle",
    meaning: "outward drive, charge, emission, go-signal"
  },
  negative: {
    polarity: "negative",
    color: "#2B6CFF",
    line: "ground",
    shape: "square",
    meaning: "grounding, return path, sink, containment"
  },
  neutral: {
    polarity: "neutral",
    color: "#C0C0C0",
    line: "axis",
    shape: "circle",
    meaning: "balance, reference, stable node"
  },
  alternating: {
    polarity: "alternating",
    color: "#D84AD8",
    line: "wave",
    shape: "diamond",
    meaning: "oscillation, exchange, pulse, same-tick switching"
  }
};

export function polarityForSignal(signal: number): Polarity {
  if (signal > 0) return "positive";
  if (signal < 0) return "negative";
  return "neutral";
}

export function alternatingPolarity(tickIndex: number): Polarity {
  return tickIndex % 2 === 0 ? "positive" : "negative";
}
