import { createHash, randomUUID } from "node:crypto";

export type ScannerSessionScope = {
  scannerId: string;
  modes: string[];
  targetDescription: string;
  allowedDataTypes: string[];
  prohibitedDataTypes: string[];
  localProcessingOnly: boolean;
  retainResults: boolean;
  externalStreamingAllowed: boolean;
};

function digest(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function authorizeScannerSession(input: {
  scope: ScannerSessionScope;
  durationSeconds: number;
  confirmation: string;
  permissionEvidence: {
    explicitUserConsent: boolean;
    devicePermissionGranted: boolean;
    scopeConfirmed: boolean;
    durationConfirmed: boolean;
    storagePolicyConfirmed: boolean;
    externalStreamingApproved?: boolean;
  };
}) {
  const scannerId = input.scope.scannerId.trim();
  if (!scannerId) throw new Error("scannerId is required.");
  if (!Number.isFinite(input.durationSeconds) || input.durationSeconds < 1 || input.durationSeconds > 3600) {
    throw new Error("durationSeconds must be between 1 and 3600.");
  }

  const expectedConfirmation = `AUTHORIZE SCANNER SESSION ${scannerId}`;
  if (input.confirmation.trim() !== expectedConfirmation) {
    throw new Error(`Exact confirmation required: ${expectedConfirmation}`);
  }

  const evidence = input.permissionEvidence;
  const externalStreamingCondition =
    !input.scope.externalStreamingAllowed || evidence.externalStreamingApproved === true;
  const ready =
    evidence.explicitUserConsent &&
    evidence.devicePermissionGranted &&
    evidence.scopeConfirmed &&
    evidence.durationConfirmed &&
    evidence.storagePolicyConfirmed &&
    externalStreamingCondition;

  if (!ready) throw new Error("Scanner session permission evidence is incomplete.");

  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + input.durationSeconds * 1000);
  const sessionId = randomUUID();
  const scopeDigest = digest(input.scope);

  return {
    schema: "jp-hviti-service-bridge-scanner-session-authorization/v1",
    sessionId,
    scannerId,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    durationSeconds: input.durationSeconds,
    scope: input.scope,
    scopeDigest,
    permissionEvidenceDigest: digest(evidence),
    authorization: {
      status: "AUTHORIZED_FOR_RUNTIME_ADAPTER",
      oneSessionOnly: true,
      renewableAutomatically: false,
      transferable: false,
      revocable: true,
      runtimeAdapterRequired: true,
    },
    constraints: {
      silentRecordingAllowed: false,
      backgroundScanningAllowed: false,
      unrestrictedNetworkScanningAllowed: false,
      biometricIdentificationAllowed: false,
      credentialCollectionAllowed: false,
      automaticExportAllowed: false,
    },
    truthBoundary: {
      permissionReceiptCreated: true,
      runtimeAccessGrantedByOperatingSystem: false,
      scannerActivated: false,
      cameraAccessed: false,
      environmentScanned: false,
      externalActionCompleted: false,
    },
  };
}

export function revokeScannerSession(input: {
  sessionId: string;
  scannerId: string;
  reason: string;
  confirmation: string;
}) {
  const expectedConfirmation = `REVOKE SCANNER SESSION ${input.sessionId}`;
  if (input.confirmation.trim() !== expectedConfirmation) {
    throw new Error(`Exact confirmation required: ${expectedConfirmation}`);
  }
  if (!input.reason.trim()) throw new Error("A revocation reason is required.");

  return {
    schema: "jp-hviti-service-bridge-scanner-session-revocation/v1",
    sessionId: input.sessionId,
    scannerId: input.scannerId,
    revokedAt: new Date().toISOString(),
    reason: input.reason.trim(),
    runtimeAdapterNotified: false,
    scannerDeactivatedByApi: false,
    externalActionCompleted: false,
  };
}
