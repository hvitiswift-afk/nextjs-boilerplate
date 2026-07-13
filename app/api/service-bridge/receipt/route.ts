import { NextResponse } from "next/server";

import { missionStates, serviceRegistry } from "@/lib/service-bridge";

export function GET() {
  const generatedAt = new Date().toISOString();
  const services = serviceRegistry.map((service) => ({
    id: service.id,
    name: service.name,
    kind: service.kind,
    capabilityCount: service.capabilities.length,
    externalAction: service.externalAction,
  }));

  return NextResponse.json({
    receiptType: "JP / Hviti Service Bridge System Receipt",
    version: 7,
    generatedAt,
    system: {
      application: "/service-bridge",
      operatorConsole: "/service-bridge/control",
      statusConsole: "/service-bridge/status",
      missionStateCount: missionStates.length,
      serviceCount: serviceRegistry.length,
      services,
    },
    boundaries: {
      explicitApprovalRequired: true,
      externalActionCompletedByReceipt: false,
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
      openapi: "/api/service-bridge/openapi",
      validate: "/api/service-bridge/validate",
      validateBatch: "/api/service-bridge/validate-batch",
      plan: "/api/service-bridge/plan",
      queue: "/api/service-bridge/queue",
      receipt: "/api/service-bridge/receipt",
    },
    verification: {
      contractCommand: "npm run service-bridge:check",
      releaseCommand: "npm run service-bridge:verify",
      workflow: ".github/workflows/service-bridge-verify.yml",
      contractExpected: "PASS",
      productionBuildExpected: "PASS",
    },
    externalActionCompleted: false,
  });
}
