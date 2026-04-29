import { BlackletterDecision, GoblinFlag } from "../griploom/types";

export function blackletterGate({
  sourceCount,
  highConfidenceSource,
  goblinFlags,
  claimLevel
}: {
  sourceCount: number;
  highConfidenceSource?: boolean;
  goblinFlags: GoblinFlag[];
  claimLevel: number;
}): BlackletterDecision {
  const hasHighSeverityFlag = goblinFlags.some((flag) => flag.severity === "HIGH");

  if (hasHighSeverityFlag) {
    return { status: "BLOCKED", reason: "High-severity GOBLIN flag." };
  }

  if (claimLevel >= 2 && sourceCount < 2 && !highConfidenceSource) {
    return { status: "BLOCKED", reason: "Insufficient source support for repeat-pattern claim." };
  }

  if (goblinFlags.some((flag) => flag.severity === "MEDIUM")) {
    return {
      status: "CAUTION",
      note: "Credit-based collaboration signal only. Resolve medium-severity GOBLIN flags before final publication."
    };
  }

  return {
    status: "APPROVED",
    note: "Credit-based collaboration signal only. No hiring, legal, union, performance, or causation claim."
  };
}
