import { createHash, randomUUID } from "node:crypto";

export type BarcodeFormat = "code128" | "qr" | "data-matrix" | "pdf417";

export function createPolystructureId(input: {
  bankId?: string;
  namespace?: string;
  label?: string;
  version?: number;
  metadata?: Record<string, unknown>;
  barcodeFormat?: BarcodeFormat;
}) {
  const namespace = (input.namespace ?? "JP-HVITI-POLYSTRUCTURE").trim();
  const version = Number.isInteger(input.version) && (input.version ?? 0) > 0 ? input.version! : 1;
  const bankId = (input.bankId ?? `PSB-${randomUUID()}`).trim();
  if (!namespace || !bankId) throw new Error("namespace and bankId are required.");

  const canonical = {
    namespace,
    bankId,
    label: input.label?.trim() || null,
    version,
    metadata: input.metadata ?? {},
  };
  const digest = createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
  const compactId = `${namespace}:v${version}:${bankId}:${digest.slice(0, 16)}`;
  const payload = JSON.stringify({
    schema: "jp-hviti-polystructure-id/v1",
    ...canonical,
    digest,
    compactId,
  });

  return {
    schema: "jp-hviti-service-bridge-polystructure-id/v1",
    createdAt: new Date().toISOString(),
    identity: {
      namespace,
      bankId,
      compactId,
      digestAlgorithm: "SHA-256",
      digest,
      version,
      label: canonical.label,
    },
    barcode: {
      format: input.barcodeFormat ?? "qr",
      payload,
      humanReadableText: compactId,
      embeddedFields: ["schema", "namespace", "bankId", "version", "label", "metadata", "digest", "compactId"],
      imageRendered: false,
      scannerCompatible: true,
    },
    verification: {
      recomputeDigestFromCanonicalPayload: true,
      trustedIdentityProof: false,
      legalIdentityProof: false,
      externalRegistryWritten: false,
    },
    externalActionCompleted: false as const,
  };
}
