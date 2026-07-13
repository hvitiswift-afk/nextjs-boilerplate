import { NextResponse } from "next/server";

import { missionStates, serviceRegistry } from "@/lib/service-bridge";

export function GET() {
  return NextResponse.json({
    system: "JP / Hviti Service Bridge",
    version: 4,
    mode: "local-first-with-server-validation-and-route-planning",
    missionStates,
    services: serviceRegistry,
    limits: {
      batchValidationMaximum: 100,
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
      validate: "/api/service-bridge/validate",
      validateBatch: "/api/service-bridge/validate-batch",
      plan: "/api/service-bridge/plan",
      application: "/service-bridge",
    },
  });
}
