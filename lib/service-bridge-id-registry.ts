import { createHash } from "node:crypto";

export type PolystructureIdentityPayload = {
  schema: string;
  namespace: string;
  bankId: string;
  label: string | null;
  version: number;
  metadata: Record<string, unknown>;
  digest: string;
  compactId: string;
};

function canonicalPayload(payload: PolystructureIdentityPayload) {
  return {
    namespace: payload.namespace,
    bankId: payload.bankId,
    label: payload.label,
    version: payload.version,
    metadata: payload.metadata,
  };
}

function digestCanonical(payload: PolystructureIdentityPayload) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalPayload(payload)))
    .digest("hex");
}

export function verifyPolystructureIdentity(payload: PolystructureIdentityPayload) {
  const expectedDigest = digestCanonical(payload);
  const expectedCompactId = `${payload.namespace}:v${payload.version}:${payload.bankId}:${expectedDigest.slice(0, 16)}`;
  const digestValid = payload.digest === expectedDigest;
  const compactIdValid = payload.compactId === expectedCompactId;
  const schemaValid = payload.schema === "jp-hviti-polystructure-id/v1";

  return {
    schema: "jp-hviti-service-bridge-polystructure-id-verification/v1",
    checkedAt: new Date().toISOString(),
    identity: {
      namespace: payload.namespace,
      bankId: payload.bankId,
      compactId: payload.compactId,
      version: payload.version,
    },
    checks: {
      schemaValid,
      digestValid,
      compactIdValid,
      valid: schemaValid && digestValid && compactIdValid,
    },
    expected: {
      digest: expectedDigest,
      compactId: expectedCompactId,
    },
    trustBoundary: {
      payloadIntegrityChecked: true,
      issuerIdentityVerified: false,
      legalIdentityVerified: false,
      trustedTimestampVerified: false,
      externalRegistryChecked: false,
    },
    externalActionCompleted: false as const,
  };
}

export function createLocalRegistryPlan(input: {
  registryId: string;
  identity: PolystructureIdentityPayload;
  existingCompactIds?: string[];
  confirmation: string;
}) {
  const registryId = input.registryId.trim();
  if (!registryId) throw new Error("registryId is required.");
  const expectedConfirmation = `REGISTER POLYSTRUCTURE ID ${input.identity.compactId}`;
  if (input.confirmation.trim() !== expectedConfirmation) {
    throw new Error(`Exact confirmation required: ${expectedConfirmation}`);
  }

  const verification = verifyPolystructureIdentity(input.identity);
  if (!verification.checks.valid) {
    throw new Error("Identity payload failed integrity verification.");
  }

  const duplicate = (input.existingCompactIds ?? []).includes(input.identity.compactId);

  return {
    schema: "jp-hviti-service-bridge-polystructure-local-registry-plan/v1",
    createdAt: new Date().toISOString(),
    registryId,
    identity: input.identity,
    verification,
    duplicate,
    operation: duplicate ? "NOOP_DUPLICATE" : "PLAN_LOCAL_INSERT",
    storage: {
      localOnly: true,
      automaticWriteAllowed: false,
      externalRegistryWriteAllowed: false,
      suggestedKey: `polystructure:${input.identity.compactId}`,
    },
    truthBoundary: {
      registryPlanCreated: true,
      registryWritten: false,
      externalRegistryWritten: false,
      externalActionCompleted: false,
    },
  };
}
