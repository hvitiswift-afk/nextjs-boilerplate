import { createHash } from "node:crypto";

import { concatenatePolystructure, type ConcatenationPart } from "@/lib/service-bridge-concatenate";
import { appendPolystructureIdChainEntry } from "@/lib/service-bridge-id-chain";
import { createPolystructureId, type BarcodeFormat } from "@/lib/service-bridge-id-barcode";

export function createPolystructureBundle(input: {
  bankId?: string;
  namespace?: string;
  label?: string;
  metadata?: Record<string, unknown>;
  barcodeFormat?: BarcodeFormat;
  parts: ConcatenationPart[];
  actor: string;
  confirmation: string;
}) {
  const actor = input.actor.trim();
  if (!actor) throw new Error("actor is required.");

  const provisionalId = input.bankId?.trim() || "AUTO";
  const expectedConfirmation = `BUILD POLYSTRUCTURE BUNDLE ${provisionalId}`;
  if (input.confirmation.trim() !== expectedConfirmation) {
    throw new Error(`Exact confirmation required: ${expectedConfirmation}`);
  }

  const identity = createPolystructureId({
    bankId: input.bankId,
    namespace: input.namespace,
    label: input.label,
    version: 1,
    metadata: input.metadata,
    barcodeFormat: input.barcodeFormat,
  });

  const concatenation = concatenatePolystructure({
    concatenationId: identity.identity.bankId,
    parts: input.parts,
    includeIndex: true,
    confirmation: `CONCATENATE POLYSTRUCTURE ${identity.identity.bankId}`,
  });

  const issued = appendPolystructureIdChainEntry({
    compactId: identity.identity.compactId,
    operation: "ISSUED",
    actor,
    reason: "Polystructure bundle identity issued.",
  });

  const verified = appendPolystructureIdChainEntry({
    compactId: identity.identity.compactId,
    operation: "VERIFIED",
    actor,
    reason: "Bundle concatenation digest attached and verified locally.",
    previousEntry: issued,
  });

  const manifest = {
    schema: "jp-hviti-service-bridge-polystructure-bundle-manifest/v1",
    identity: identity.identity,
    barcode: identity.barcode,
    concatenation: {
      id: concatenation.concatenationId,
      digest: concatenation.digest,
      compactReference: concatenation.compactReference,
      partCount: concatenation.partCount,
    },
    identityChain: [issued, verified],
  };

  const bundleDigest = createHash("sha256")
    .update(JSON.stringify(manifest))
    .digest("hex");

  return {
    schema: "jp-hviti-service-bridge-polystructure-bundle/v1",
    createdAt: new Date().toISOString(),
    bundleId: `BUNDLE:${identity.identity.bankId}:${bundleDigest.slice(0, 20)}`,
    bundleDigest,
    manifest,
    capabilities: {
      identityCreated: true,
      barcodePayloadCreated: true,
      concatenationCreated: true,
      identityChainCreated: true,
      localVerificationReady: true,
    },
    truthBoundary: {
      bundleCreatedInMemory: true,
      barcodeImageRendered: false,
      registryWritten: false,
      chainPersisted: false,
      externalActionCompleted: false,
    },
  };
}
