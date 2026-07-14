import { createHash } from "node:crypto";

import { verifyPolystructureIdChain } from "@/lib/service-bridge-id-chain";
import { verifyPolystructureIdentity } from "@/lib/service-bridge-id-registry";
import type { PolystructureIdChainEntry } from "@/lib/service-bridge-id-chain";
import type { PolystructureIdentityPayload } from "@/lib/service-bridge-id-registry";

export type PolystructureBundleManifest = {
  schema: "jp-hviti-service-bridge-polystructure-bundle-manifest/v1";
  identity: {
    namespace: string;
    bankId: string;
    compactId: string;
    digestAlgorithm: string;
    digest: string;
    version: number;
    label: string | null;
  };
  barcode: {
    format: string;
    payload: string;
    humanReadableText: string;
  };
  concatenation: {
    id: string;
    digest: string;
    compactReference: string;
    partCount: number;
  };
  identityChain: PolystructureIdChainEntry[];
};

export function verifyPolystructureBundle(input: {
  bundleId: string;
  bundleDigest: string;
  manifest: PolystructureBundleManifest;
}) {
  const expectedDigest = createHash("sha256")
    .update(JSON.stringify(input.manifest))
    .digest("hex");
  const expectedBundleId = `BUNDLE:${input.manifest.identity.bankId}:${expectedDigest.slice(0, 20)}`;

  let barcodePayload: PolystructureIdentityPayload | null = null;
  let barcodePayloadParsed = false;
  try {
    barcodePayload = JSON.parse(input.manifest.barcode.payload) as PolystructureIdentityPayload;
    barcodePayloadParsed = true;
  } catch {
    barcodePayload = null;
  }

  const identityVerification = barcodePayload
    ? verifyPolystructureIdentity(barcodePayload)
    : null;
  const chainVerification = verifyPolystructureIdChain(
    input.manifest.identityChain,
  );

  const checks = {
    bundleDigestValid: input.bundleDigest === expectedDigest,
    bundleIdValid: input.bundleId === expectedBundleId,
    manifestSchemaValid:
      input.manifest.schema ===
      "jp-hviti-service-bridge-polystructure-bundle-manifest/v1",
    barcodePayloadParsed,
    identityValid: identityVerification?.checks.valid === true,
    compactIdMatchesBarcode:
      barcodePayload?.compactId === input.manifest.identity.compactId,
    humanReadableIdMatches:
      input.manifest.barcode.humanReadableText ===
      input.manifest.identity.compactId,
    chainValid: chainVerification.valid,
    chainCompactIdsMatch: input.manifest.identityChain.every(
      (entry) => entry.compactId === input.manifest.identity.compactId,
    ),
  };

  const valid = Object.values(checks).every(Boolean);

  return {
    schema: "jp-hviti-service-bridge-polystructure-bundle-verification/v1",
    checkedAt: new Date().toISOString(),
    bundleId: input.bundleId,
    valid,
    checks,
    expected: {
      bundleDigest: expectedDigest,
      bundleId: expectedBundleId,
    },
    identityVerification,
    chainVerification,
    trustBoundary: {
      localIntegrityVerified: valid,
      issuerIdentityVerified: false,
      legalIdentityVerified: false,
      trustedTimestampVerified: false,
      externalRegistryChecked: false,
      barcodeImageAuthenticityVerified: false,
    },
    externalActionCompleted: false as const,
  };
}
