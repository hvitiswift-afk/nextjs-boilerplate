import type { ServiceMission } from "@/lib/service-bridge";
import { getLaunchUrl, validateMission } from "@/lib/service-bridge";
import { evaluateMissionPolicy } from "@/lib/service-bridge-policy";
import { createMissionReceipt } from "@/lib/service-bridge-receipts";

export const orchestrationStages = [
  "validate",
  "policy",
  "route",
  "receipt",
  "next-action",
] as const;

export const orchestrationModes = ["single", "batch"] as const;

export function orchestrateMission(mission: ServiceMission) {
  const orchestratedAt = new Date().toISOString();
  const validation = validateMission(mission);
  const policy = evaluateMissionPolicy(mission);
  const routeUrl = getLaunchUrl(mission);
  const planningAllowed = validation.valid && policy.decision !== "BLOCK";
  const openingAllowed = validation.valid && policy.decision === "ALLOW_PREPARE";

  const receipt = createMissionReceipt({
    schema: "jp-hviti-service-bridge-receipt/v1",
    issuedAt: orchestratedAt,
    mission,
    validation: {
      readiness: validation.readiness,
      verdict: validation.verdict,
      missing: validation.missing,
      warnings: validation.warnings,
      launchUrl: validation.launchUrl,
      externalActionCompleted: false,
    },
    approvalBoundary: {
      explicitApprovalRequired: true,
      externalActionCompleted: false,
    },
  });

  const nextAction = policy.decision === "BLOCK"
    ? policy.nextAction
    : !validation.valid
      ? "Complete the missing mission fields before planning or opening a route."
      : policy.decision === "HOLD_FOR_APPROVAL"
        ? "Prepare the exact action preview and wait for final user approval."
        : "Continue preparation and evidence collection. Opening the official route remains user-controlled.";

  return {
    orchestratedAt,
    missionId: mission?.id ?? null,
    readiness: validation.readiness,
    validation,
    policy,
    route: {
      url: routeUrl,
      planningAllowed,
      openingAllowed,
      externalActionCompleted: false as const,
    },
    receipt,
    receiptDigest: receipt.integrity.digest,
    nextAction,
    externalActionCompleted: false as const,
  };
}

export function summarizeOrchestrations(
  results: ReturnType<typeof orchestrateMission>[],
) {
  return {
    total: results.length,
    valid: results.filter((item) => item.validation.valid).length,
    prepare: results.filter((item) => item.policy.decision === "ALLOW_PREPARE").length,
    hold: results.filter((item) => item.policy.decision === "HOLD_FOR_APPROVAL").length,
    blocked: results.filter((item) => item.policy.decision === "BLOCK").length,
    planningAllowed: results.filter((item) => item.route.planningAllowed).length,
    routeOpeningAllowed: results.filter((item) => item.route.openingAllowed).length,
    averageReadiness: results.length
      ? Math.round(
          results.reduce((total, item) => total + item.readiness, 0) /
            results.length,
        )
      : 0,
    externalActionCompleted: false as const,
  };
}
