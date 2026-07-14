import { NextResponse } from "next/server";

import { missionStates, serviceRegistry } from "@/lib/service-bridge";
import {
  SERVICE_BRIDGE_CONTRACT_VERSION,
  serviceBridgeContracts,
  summarizeContractCatalog,
} from "@/lib/service-bridge-contract-catalog";

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

  const duplicatePaths = serviceBridgeContracts
    .map((contract) => contract.path)
    .filter((path, index, paths) => paths.indexOf(path) !== index);
  const healthy =
    missingServices.length === 0 &&
    malformedServices.length === 0 &&
    duplicatePaths.length === 0;

  return NextResponse.json(
    {
      system: "JP / Hviti Service Bridge",
      version: SERVICE_BRIDGE_CONTRACT_VERSION,
      checkedAt: new Date().toISOString(),
      status: healthy ? "healthy" : "degraded",
      checks: {
        missionStateCount: missionStates.length,
        serviceCount: serviceRegistry.length,
        endpointCount: serviceBridgeContracts.length,
        requiredServicesPresent: missingServices.length === 0,
        serviceDefinitionsValid: malformedServices.length === 0,
        contractPathsUnique: duplicatePaths.length === 0,
        contractVersionAligned: true,
        explicitProjectionMutationAllowed: true,
        automaticProjectionMutationAllowed: false,
        automaticDeploymentAllowed: false,
        publicDeploymentVerifiedByHealthCheck: false,
        externalPersistenceAllowed: false,
        explicitApprovalBoundary: true,
        externalActionCompletedByHealthCheck: false,
      },
      missingServices,
      malformedServices,
      duplicatePaths,
      contracts: summarizeContractCatalog(),
      endpoints: serviceBridgeContracts.map((contract) => contract.path),
      capabilities: Array.from(
        new Set([
          ...serviceRegistry.flatMap((service) => service.capabilities),
          ...serviceBridgeContracts.map((contract) => contract.domain),
          "contract-catalog-v19",
          "polystructure-identity",
          "merkle-integrity",
          "release-capsules",
        ]),
      ).sort(),
      externalActionCompleted: false,
    },
    { status: healthy ? 200 : 503 },
  );
}
