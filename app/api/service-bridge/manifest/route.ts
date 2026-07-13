import { NextResponse } from "next/server";

import { missionStates, serviceRegistry } from "@/lib/service-bridge";

export function GET() {
  return NextResponse.json({
    system: "JP / Hviti Service Bridge",
    version: 8,
    mode: "local-first-with-validation-planning-prioritization-health-receipts-event-chains-and-openapi",
    missionStates,
    services: serviceRegistry,
    limits: {
      batchValidationMaximum: 100,
      queueAnalysisMaximum: 250,
    },
    approvalLaw: {
      externalActionsRequireExplicitApproval: true,
      externalActionCompletedByManifest: false,
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
    endpoints: {
      manifest: "/api/service-bridge/manifest",
      health: "/api/service-bridge/health",
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
      statusConsole: "/service-bridge/status",
      receiptConsole: "/service-bridge/receipts",
    },
    examples: {
      sampleMissionQueue: "/examples/service-bridge/sample-missions.json",
    },
  });
}
