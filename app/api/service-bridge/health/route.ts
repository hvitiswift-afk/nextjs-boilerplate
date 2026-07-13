import { NextResponse } from "next/server";

import {
  missionStates,
  serviceRegistry,
} from "@/lib/service-bridge";

const requiredServices = [
  "Indeed",
  "Uber",
  "Grubhub",
  "Gmail",
  "Google Calendar",
  "GitHub",
  "Norstein",
  "V# MAIN",
];

export function GET() {
  const registeredNames = new Set(serviceRegistry.map((service) => service.name));
  const missingServices = requiredServices.filter((name) => !registeredNames.has(name));
  const malformedServices = serviceRegistry
    .filter(
      (service) =>
        !service.id ||
        !service.name ||
        !service.baseUrl ||
        service.capabilities.length === 0,
    )
    .map((service) => service.name || service.id || "unknown");

  const healthy = missingServices.length === 0 && malformedServices.length === 0;

  return NextResponse.json(
    {
      system: "JP / Hviti Service Bridge",
      version: 6,
      checkedAt: new Date().toISOString(),
      status: healthy ? "healthy" : "degraded",
      checks: {
        missionStateCount: missionStates.length,
        serviceCount: serviceRegistry.length,
        requiredServicesPresent: missingServices.length === 0,
        serviceDefinitionsValid: malformedServices.length === 0,
        explicitApprovalBoundary: true,
        externalActionCompletedByHealthCheck: false,
      },
      missingServices,
      malformedServices,
      capabilities: Array.from(
        new Set(serviceRegistry.flatMap((service) => service.capabilities)),
      ).sort(),
      endpoints: [
        "/api/service-bridge/manifest",
        "/api/service-bridge/health",
        "/api/service-bridge/openapi",
        "/api/service-bridge/validate",
        "/api/service-bridge/validate-batch",
        "/api/service-bridge/plan",
        "/api/service-bridge/queue",
      ],
      externalActionCompleted: false,
    },
    { status: healthy ? 200 : 503 },
  );
}
