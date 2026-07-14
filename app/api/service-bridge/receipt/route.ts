import { NextResponse } from "next/server";

import { missionStates, serviceRegistry } from "@/lib/service-bridge";
import {
  SERVICE_BRIDGE_CONTRACT_VERSION,
  serviceBridgeContracts,
  summarizeContractCatalog,
} from "@/lib/service-bridge-contract-catalog";

export function GET() {
  const services = serviceRegistry.map((service) => ({
    id: service.id,
    name: service.name,
    kind: service.kind,
    capabilityCount: service.capabilities.length,
    externalAction: service.externalAction,
  }));

  return NextResponse.json({
    receiptType: "JP / Hviti Service Bridge System Receipt",
    version: SERVICE_BRIDGE_CONTRACT_VERSION,
    generatedAt: new Date().toISOString(),
    system: {
      application: "/service-bridge",
      nexus: "/service-bridge/nexus",
      missionStateCount: missionStates.length,
      serviceCount: serviceRegistry.length,
      contractCount: serviceBridgeContracts.length,
      services,
    },
    contractCatalog: summarizeContractCatalog(),
    boundaries: {
      explicitApprovalRequired: true,
      automaticMutationAllowed: false,
      automaticRollbackAllowed: false,
      explicitProjectionMutationAllowed: true,
      automaticProjectionMutationAllowed: false,
      automaticDeploymentAllowed: false,
      localPersistenceAllowed: true,
      localRollbackAllowed: true,
      externalPersistenceAllowed: false,
      externalRollbackAllowed: false,
      providerAuthorizationRequired: true,
      independentPublicUrlVerificationRequired: true,
      publicDeploymentVerifiedByReceipt: false,
      externalActionCompletedByReceipt: false,
    },
    confirmations: {
      projectionPlanningConfirmationPattern: "APPLY PROJECTION <mission-id>",
      projectionCommitConfirmationPattern: "COMMIT PROJECTION <mission-id>",
      repairConfirmationPattern: "PLAN DEPLOYMENT REPAIR <commit-sha>",
      bankConfirmationPattern: "BUILD POLYSTRUCTURE BANK <bank-id>",
      bundleConfirmationPattern: "BUILD POLYSTRUCTURE BUNDLE <bank-id-or-AUTO>",
      concatenationConfirmationPattern: "CONCATENATE POLYSTRUCTURE <concatenation-id>",
      registrationConfirmationPattern: "REGISTER POLYSTRUCTURE ID <compact-id>",
      releaseConfirmationPattern: "PREPARE POLYSTRUCTURE RELEASE <release-id>",
    },
    integrity: {
      digestAlgorithm: "SHA-256",
      canonicalization: "sorted-json-v1",
      identityChainAvailable: true,
      bundleVerificationAvailable: true,
      merkleProofsAvailable: true,
      releaseVerificationAvailable: true,
      signed: false,
      notarized: false,
      trustedTimestamp: false,
      externalRegistryChecked: false,
    },
    endpoints: Object.fromEntries(
      serviceBridgeContracts.map((contract) => [contract.id, contract.path]),
    ),
    verification: {
      architectureContractCommand: "npm run service-bridge:check",
      runtimeContractCommand: "npm run service-bridge:check:runtime",
      ciContractCommand: "npm run service-bridge:check:ci",
      combinedContractCommand: "npm run service-bridge:check:all",
      releaseCommand: "npm run service-bridge:verify",
      unifiedSmokeCommand: "npm run service-bridge:smoke:all",
      contractExpected: "PASS",
      productionBuildExpected: "PASS",
      buildVerifiedByReceipt: false,
    },
    externalActionCompleted: false,
  });
}
