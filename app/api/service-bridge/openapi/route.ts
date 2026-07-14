import { NextResponse } from "next/server";

import {
  SERVICE_BRIDGE_CONTRACT_VERSION,
  serviceBridgeContracts,
} from "@/lib/service-bridge-contract-catalog";

function operation(summary: string, controlled: boolean) {
  return {
    summary,
    responses: {
      "200": { description: "Successful response" },
      "400": { description: "Invalid request or confirmation" },
    },
    "x-controlled-action": controlled,
    "x-external-action-completed": false,
  };
}

export function GET() {
  const paths = Object.fromEntries(
    serviceBridgeContracts.map((contract) => [
      contract.path,
      Object.fromEntries(
        contract.methods.map((method) => [
          method.toLowerCase(),
          operation(`${contract.id} (${contract.schema})`, contract.controlled),
        ]),
      ),
    ]),
  );

  return NextResponse.json({
    openapi: "3.1.0",
    info: {
      title: "JP / Hviti Service Bridge API",
      version: `${SERVICE_BRIDGE_CONTRACT_VERSION}.0.0`,
      description:
        "Contract-driven local-first orchestration, recovery, deployment planning, polyglot routing, signal planning, polystructure identity, integrity proofs, and release preparation.",
    },
    servers: [{ url: "/" }],
    paths,
    components: {
      schemas: {
        ExternalActionBoundary: {
          type: "object",
          properties: {
            externalActionCompleted: { const: false },
          },
          required: ["externalActionCompleted"],
        },
      },
    },
    "x-contract-version": SERVICE_BRIDGE_CONTRACT_VERSION,
    "x-contract-count": serviceBridgeContracts.length,
    "x-lifecycle-projection-apply": {
      explicitLocalMutationAllowed: true,
      automaticMutationAllowed: false,
      planningConfirmationPattern: "APPLY PROJECTION <mission-id>",
      commitConfirmationPattern: "COMMIT PROJECTION <mission-id>",
      externalPersistenceAllowed: false,
    },
    "x-deployment-bridge": {
      automaticDeploymentAllowed: false,
      providerAuthorizationRequired: true,
      independentPublicUrlVerificationRequired: true,
    },
    "x-automatic-deployment-allowed": false,
    "x-public-deployment-verified": false,
    "x-external-action-completed": false,
  });
}
