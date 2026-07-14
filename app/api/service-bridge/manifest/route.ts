import { NextResponse } from "next/server";

import { missionStates, serviceRegistry } from "@/lib/service-bridge";
import {
  SERVICE_BRIDGE_CONTRACT_VERSION,
  serviceBridgeContracts,
  summarizeContractCatalog,
} from "@/lib/service-bridge-contract-catalog";

export function GET() {
  return NextResponse.json({
    system: "JP / Hviti Service Bridge",
    version: SERVICE_BRIDGE_CONTRACT_VERSION,
    mode: "local-first-contract-driven-polyglot-signal-polystructure-integrity-release",
    missionStates,
    services: serviceRegistry,
    contractCatalog: summarizeContractCatalog(),
    approvalLaw: {
      externalActionsRequireExplicitApproval: true,
      controlledEndpoints: serviceBridgeContracts
        .filter((contract) => contract.controlled)
        .map((contract) => contract.path),
      externalActionCompletedByManifest: false,
    },
    lifecycleProjectionApply: {
      explicitProjectionMutationAllowed: true,
      automaticProjectionMutationAllowed: false,
      planningConfirmationPattern: "APPLY PROJECTION <mission-id>",
      commitConfirmationPattern: "COMMIT PROJECTION <mission-id>",
      externalPersistenceAllowed: false,
    },
    deploymentBridge: {
      deploymentRepairConfirmationPattern: "PLAN DEPLOYMENT REPAIR <commit-sha>",
      automaticDeploymentAllowed: false,
      providerAuthorizationRequired: true,
      independentPublicUrlVerificationRequired: true,
      publicDeploymentVerifiedByManifest: false,
      externalActionCompleted: false,
    },
    polystructure: {
      bankConfirmationPattern: "BUILD POLYSTRUCTURE BANK <bank-id>",
      bundleConfirmationPattern: "BUILD POLYSTRUCTURE BUNDLE <bank-id-or-AUTO>",
      concatenateConfirmationPattern: "CONCATENATE POLYSTRUCTURE <concatenation-id>",
      releaseConfirmationPattern: "PREPARE POLYSTRUCTURE RELEASE <release-id>",
      identityRegistrationPattern: "REGISTER POLYSTRUCTURE ID <compact-id>",
      barcodeFormats: ["qr", "code128", "data-matrix", "pdf417"],
      merkleAlgorithm: "SHA-256",
      barcodeImageRenderedByManifest: false,
      registryWrittenByManifest: false,
      externalActionCompleted: false,
    },
    endpoints: Object.fromEntries(
      serviceBridgeContracts.map((contract) => [contract.id, contract.path]),
    ),
    externalActionCompleted: false,
  });
}
