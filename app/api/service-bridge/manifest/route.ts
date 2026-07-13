import { NextResponse } from "next/server";

import { missionStates, serviceRegistry } from "@/lib/service-bridge";

export function GET() {
  return NextResponse.json({
    system: "JP / Hviti Service Bridge",
    version: 12,
    mode: "local-first-with-orchestration-policy-integrity-projection-reconciliation-and-recovery",
    missionStates,
    services: serviceRegistry,
    limits: {
      batchValidationMaximum: 100,
      batchOrchestrationMaximum: 100,
      queueAnalysisMaximum: 250,
    },
    approvalLaw: {
      externalActionsRequireExplicitApproval: true,
      externalActionCompletedByManifest: false,
      policyDecisions: ["ALLOW_PREPARE", "HOLD_FOR_APPROVAL", "BLOCK"],
      controlledActions: [
        "purchases",
        "bookings",
        "orders",
        "applications",
        "payments",
        "submissions",
        "messages",
        "calendar changes",
      ],
    },
    orchestration: {
      stages: ["validate", "policy", "route", "receipt", "next-action"],
      modes: ["single", "batch"],
      externalActionCompleted: false,
    },
    recovery: {
      stages: ["event-chain", "verify", "project", "reconcile", "explicit-authority-decision"],
      silentOverwriteAllowed: false,
      externalActionCompleted: false,
    },
    endpoints: {
      manifest: "/api/service-bridge/manifest",
      health: "/api/service-bridge/health",
      orchestrate: "/api/service-bridge/orchestrate",
      orchestrateBatch: "/api/service-bridge/orchestrate-batch",
      policyEvaluate: "/api/service-bridge/policy/evaluate",
      receipt: "/api/service-bridge/receipt",
      missionReceipt: "/api/service-bridge/receipt/mission",
      verifyReceipt: "/api/service-bridge/receipt/verify",
      appendEvent: "/api/service-bridge/events/append",
      verifyEventChain: "/api/service-bridge/events/verify",
      projectEventChain: "/api/service-bridge/events/project",
      reconcileSnapshot: "/api/service-bridge/events/reconcile",
      openapi: "/api/service-bridge/openapi",
      validate: "/api/service-bridge/validate",
      validateBatch: "/api/service-bridge/validate-batch",
      plan: "/api/service-bridge/plan",
      queue: "/api/service-bridge/queue",
      application: "/service-bridge",
      nexus: "/service-bridge/nexus",
      operatorConsole: "/service-bridge/control",
      policyConsole: "/service-bridge/policy",
      orchestrationConsole: "/service-bridge/orchestrate",
      batchOrchestrationConsole: "/service-bridge/orchestrate-batch",
      projectionConsole: "/service-bridge/projection",
      reconciliationConsole: "/service-bridge/reconcile",
      statusConsole: "/service-bridge/status",
      receiptConsole: "/service-bridge/receipts",
      eventConsole: "/service-bridge/events",
    },
    examples: {
      sampleMissionQueue: "/examples/service-bridge/sample-missions.json",
    },
  });
}
