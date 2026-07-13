import { NextResponse } from "next/server";

import { missionStates, serviceRegistry } from "@/lib/service-bridge";

export function GET() {
  return NextResponse.json({
    system: "JP / Hviti Service Bridge",
    version: 11,
    mode: "local-first-with-single-and-batch-orchestration-validation-planning-prioritization-policy-health-receipts-event-chains-and-openapi",
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
      openapi: "/api/service-bridge/openapi",
      validate: "/api/service-bridge/validate",
      validateBatch: "/api/service-bridge/validate-batch",
      plan: "/api/service-bridge/plan",
      queue: "/api/service-bridge/queue",
      application: "/service-bridge",
      operatorConsole: "/service-bridge/control",
      policyConsole: "/service-bridge/policy",
      orchestrationConsole: "/service-bridge/orchestrate",
      batchOrchestrationConsole: "/service-bridge/orchestrate-batch",
      statusConsole: "/service-bridge/status",
      receiptConsole: "/service-bridge/receipts",
      eventConsole: "/service-bridge/events",
    },
    examples: {
      sampleMissionQueue: "/examples/service-bridge/sample-missions.json",
    },
  });
}
