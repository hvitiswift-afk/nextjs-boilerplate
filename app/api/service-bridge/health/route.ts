import { NextResponse } from "next/server";

import { missionStates, serviceRegistry } from "@/lib/service-bridge";

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

const endpoints = [
  "/api/service-bridge/manifest",
  "/api/service-bridge/health",
  "/api/service-bridge/openapi",
  "/api/service-bridge/validate",
  "/api/service-bridge/validate-batch",
  "/api/service-bridge/policy/evaluate",
  "/api/service-bridge/orchestrate",
  "/api/service-bridge/orchestrate-batch",
  "/api/service-bridge/plan",
  "/api/service-bridge/queue",
  "/api/service-bridge/receipt",
  "/api/service-bridge/receipt/mission",
  "/api/service-bridge/receipt/verify",
  "/api/service-bridge/events/append",
  "/api/service-bridge/events/verify",
  "/api/service-bridge/events/project",
  "/api/service-bridge/events/reconcile",
  "/api/service-bridge/events/resolve",
  "/api/service-bridge/events/persist",
  "/api/service-bridge/events/rollback",
  "/api/service-bridge/lifecycle",
  "/api/service-bridge/lifecycle/project",
  "/api/service-bridge/lifecycle/apply",
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
      version: 16,
      checkedAt: new Date().toISOString(),
      status: healthy ? "healthy" : "degraded",
      checks: {
        missionStateCount: missionStates.length,
        serviceCount: serviceRegistry.length,
        endpointCount: endpoints.length,
        requiredServicesPresent: missingServices.length === 0,
        serviceDefinitionsValid: malformedServices.length === 0,
        lifecycleJournalAvailable: true,
        lifecycleProjectionAvailable: true,
        lifecycleProjectionApplyAvailable: true,
        explicitProjectionMutationAllowed: true,
        automaticProjectionMutationAllowed: false,
        externalPersistenceAllowed: false,
        explicitApprovalBoundary: true,
        externalActionCompletedByHealthCheck: false,
      },
      missingServices,
      malformedServices,
      capabilities: Array.from(
        new Set([
          ...serviceRegistry.flatMap((service) => service.capabilities),
          "lifecycle-journal",
          "lifecycle-projection",
          "explicit-local-projection-apply",
          "reversible-local-persistence",
          "local-rollback",
        ]),
      ).sort(),
      endpoints,
      externalActionCompleted: false,
    },
    { status: healthy ? 200 : 503 },
  );
}
