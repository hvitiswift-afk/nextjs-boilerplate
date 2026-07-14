import { createHash } from "node:crypto";

export type ConcatenationPart = {
  id: string;
  type: string;
  value: string | Record<string, unknown> | unknown[];
};

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonicalize(nested)]),
    );
  }
  return value;
}

export function concatenatePolystructure(input: {
  concatenationId: string;
  parts: ConcatenationPart[];
  separator?: string;
  includeIndex?: boolean;
  confirmation: string;
}) {
  const concatenationId = input.concatenationId.trim();
  if (!concatenationId) throw new Error("concatenationId is required.");
  if (!Array.isArray(input.parts) || input.parts.length === 0) {
    throw new Error("At least one concatenation part is required.");
  }

  const expectedConfirmation = `CONCATENATE POLYSTRUCTURE ${concatenationId}`;
  if (input.confirmation.trim() !== expectedConfirmation) {
    throw new Error(`Exact confirmation required: ${expectedConfirmation}`);
  }

  const seen = new Set<string>();
  const normalizedParts = input.parts.map((part, index) => {
    const id = part.id.trim();
    const type = part.type.trim();
    if (!id || !type) throw new Error(`Part ${index} requires id and type.`);
    if (seen.has(id)) throw new Error(`Duplicate part id: ${id}`);
    seen.add(id);

    const canonicalValue = canonicalize(part.value);
    const serialized =
      typeof canonicalValue === "string"
        ? canonicalValue
        : JSON.stringify(canonicalValue);

    return {
      index,
      id,
      type,
      canonicalValue,
      serialized,
      digest: createHash("sha256").update(serialized).digest("hex"),
    };
  });

  const separator = input.separator ?? "|JP-HVITI|";
  const concatenated = normalizedParts
    .map((part) =>
      input.includeIndex === false
        ? `${part.id}:${part.type}:${part.serialized}`
        : `${part.index}:${part.id}:${part.type}:${part.serialized}`,
    )
    .join(separator);

  const digest = createHash("sha256").update(concatenated).digest("hex");

  return {
    schema: "jp-hviti-service-bridge-polystructure-concatenation/v1",
    createdAt: new Date().toISOString(),
    concatenationId,
    separator,
    partCount: normalizedParts.length,
    parts: normalizedParts,
    concatenated,
    digestAlgorithm: "SHA-256",
    digest,
    compactReference: `CONCAT:${concatenationId}:${digest.slice(0, 20)}`,
    compatibility: {
      barcodePayloadCompatible: true,
      identityChainCompatible: true,
      polystructureBankCompatible: true,
      hyperLanguageCubeCompatible: true,
      signalFabricCompatible: true,
    },
    truthBoundary: {
      concatenationCreated: true,
      payloadStored: false,
      barcodeRendered: false,
      externalRegistryWritten: false,
      externalActionCompleted: false,
    },
  };
}
