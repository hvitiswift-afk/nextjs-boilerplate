import { NextResponse } from "next/server";

import { missionStates, serviceRegistry } from "@/lib/service-bridge";

export function GET() {
  return NextResponse.json({
    system: "JP / Hviti Service Bridge",
    version: 3,
    mode: "local-first-with-server-validation",
    missionStates,
    services: serviceRegistry,
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
      application: "/service-bridge",
    },
  });
}
