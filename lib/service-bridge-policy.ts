import type { ServiceMission } from "@/lib/service-bridge";

export type PolicyDecision = "ALLOW_PREPARE" | "HOLD_FOR_APPROVAL" | "BLOCK";

export type PolicyEvaluation = {
  decision: PolicyDecision;
  reasons: string[];
  requiredApprovals: string[];
  safeguards: string[];
  nextAction: string;
  externalActionCompleted: false;
};

const irreversibleTerms = [
  "buy",
  "purchase",
  "book",
  "order",
  "apply",
  "submit",
  "send",
  "pay",
  "transfer",
  "delete",
  "cancel",
  "sign",
];

const highRiskTerms = [
  "password",
  "secret",
  "api key",
  "social security",
  "bank account",
  "credit card",
  "medical record",
  "legal filing",
];

function containsTerm(value: string, terms: string[]) {
  const normalized = value.toLowerCase();
  return terms.filter((term) => normalized.includes(term));
}

export function evaluateMissionPolicy(mission: ServiceMission): PolicyEvaluation {
  const text = [
    mission.title,
    mission.target,
    mission.action,
    mission.permission,
    mission.evidence,
    mission.fallback,
    mission.next,
  ]
    .filter(Boolean)
    .join(" ");

  const irreversibleMatches = containsTerm(text, irreversibleTerms);
  const highRiskMatches = containsTerm(text, highRiskTerms);
  const reasons: string[] = [];
  const requiredApprovals: string[] = [];
  const safeguards = [
    "Exact target must be identified.",
    "Exact action must be previewed.",
    "The user must retain final control.",
    "A receipt or rollback path must be defined.",
  ];

  if (!mission.target?.trim()) reasons.push("Mission target is missing.");
  if (!mission.action?.trim()) reasons.push("Mission action is missing.");
  if (!mission.permission?.trim()) reasons.push("Permission boundary is missing.");
  if (!mission.evidence?.trim()) reasons.push("Evidence requirement is missing.");
  if (!mission.fallback?.trim()) reasons.push("Fallback path is missing.");

  if (highRiskMatches.length) {
    reasons.push(`High-risk terms detected: ${highRiskMatches.join(", ")}.`);
    requiredApprovals.push("Explicit user approval after privacy and authority review.");
    return {
      decision: "BLOCK",
      reasons,
      requiredApprovals,
      safeguards,
      nextAction: "Remove sensitive material or obtain a narrowly scoped, explicit authorization before proceeding.",
      externalActionCompleted: false,
    };
  }

  if (irreversibleMatches.length || mission.state === "awaiting-approval" || mission.state === "ready") {
    reasons.push(
      irreversibleMatches.length
        ? `Potential external-action terms detected: ${irreversibleMatches.join(", ")}.`
        : "Mission state requires an approval boundary.",
    );
    requiredApprovals.push("Final user approval for the exact external action.");
    return {
      decision: "HOLD_FOR_APPROVAL",
      reasons,
      requiredApprovals,
      safeguards,
      nextAction: "Prepare the exact action preview and wait for final approval.",
      externalActionCompleted: false,
    };
  }

  return {
    decision: "ALLOW_PREPARE",
    reasons: reasons.length ? reasons : ["No high-risk or irreversible action terms detected."],
    requiredApprovals,
    safeguards,
    nextAction: "Continue preparation, validation, and evidence collection without executing an external action.",
    externalActionCompleted: false,
  };
}
