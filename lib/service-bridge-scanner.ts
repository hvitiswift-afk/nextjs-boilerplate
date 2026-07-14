export type ScannerMode =
  | "camera"
  | "document"
  | "barcode"
  | "qr"
  | "object"
  | "circuit"
  | "network"
  | "spectrum"
  | "environment"
  | "semantic";

export type ScannerPermission = {
  explicitUserConsent: boolean;
  devicePermissionGranted: boolean;
  scopeConfirmed: boolean;
  durationConfirmed: boolean;
  storagePolicyConfirmed: boolean;
  externalStreamingApproved: boolean;
};

export function createScannerPlan(input: {
  scannerId: string;
  mode: ScannerMode;
  targetDescription: string;
  permissions: ScannerPermission;
  allowedDataTypes?: string[];
  prohibitedDataTypes?: string[];
  durationSeconds?: number;
  localProcessingOnly?: boolean;
  retainResults?: boolean;
  confirmation: string;
}) {
  const scannerId = input.scannerId.trim();
  const targetDescription = input.targetDescription.trim();
  if (!scannerId || !targetDescription) {
    throw new Error("scannerId and targetDescription are required.");
  }

  const expectedConfirmation = `ENABLE SCANNER ${scannerId}`;
  const confirmationValid = input.confirmation.trim() === expectedConfirmation;
  const durationSeconds = input.durationSeconds ?? 60;
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds > 3600) {
    throw new Error("durationSeconds must be between 1 and 3600.");
  }

  const permissionChecks = {
    explicitUserConsent: input.permissions.explicitUserConsent,
    devicePermissionGranted: input.permissions.devicePermissionGranted,
    scopeConfirmed: input.permissions.scopeConfirmed,
    durationConfirmed: input.permissions.durationConfirmed,
    storagePolicyConfirmed: input.permissions.storagePolicyConfirmed,
    externalStreamingApproved: input.permissions.externalStreamingApproved,
    exactConfirmationValid: confirmationValid,
  };

  const localProcessingOnly = input.localProcessingOnly !== false;
  const externalStreamingRequested = !localProcessingOnly;
  const requiredChecksPassed =
    permissionChecks.explicitUserConsent &&
    permissionChecks.devicePermissionGranted &&
    permissionChecks.scopeConfirmed &&
    permissionChecks.durationConfirmed &&
    permissionChecks.storagePolicyConfirmed &&
    permissionChecks.exactConfirmationValid &&
    (!externalStreamingRequested || permissionChecks.externalStreamingApproved);

  return {
    schema: "jp-hviti-service-bridge-scanner-plan/v1",
    createdAt: new Date().toISOString(),
    scanner: {
      id: scannerId,
      mode: input.mode,
      targetDescription,
      durationSeconds,
      localProcessingOnly,
      retainResults: input.retainResults === true,
      allowedDataTypes: input.allowedDataTypes ?? [],
      prohibitedDataTypes: input.prohibitedDataTypes ?? [
        "biometric-identification",
        "private-communications",
        "credentials",
        "payment-card-data",
        "health-records",
      ],
    },
    permissionGate: {
      expectedConfirmation,
      checks: permissionChecks,
      readyForRuntimeAccess: requiredChecksPassed,
      automaticActivationAllowed: false,
      runtimeAdapterRequired: true,
    },
    processingRail: [
      "device-permission-check",
      "explicit-scope-check",
      "bounded-capture",
      "local-redaction",
      "L4-semantic-decode",
      "polyglot-translation",
      "circuit-network-modem-analysis",
      "V#-AR-overlay-plan",
      "user-review",
      "optional-approved-export",
    ],
    safety: {
      silentRecordingAllowed: false,
      backgroundScanningAllowed: false,
      facialIdentificationAllowed: false,
      credentialHarvestingAllowed: false,
      unrestrictedNetworkScanningAllowed: false,
      spectrumTransmissionAllowed: false,
      retentionWithoutApprovalAllowed: false,
    },
    truthBoundary: {
      accessConditionallyAllowed: requiredChecksPassed,
      cameraAccessed: false,
      scannerActivated: false,
      environmentScanned: false,
      networkProbed: false,
      spectrumSampled: false,
      resultsStored: false,
      externalActionCompleted: false,
    },
  };
}
