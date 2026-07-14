export type CognitionSourceKind =
  | "language"
  | "code"
  | "sensor"
  | "camera"
  | "document"
  | "network"
  | "circuit"
  | "modem"
  | "location"
  | "memory"
  | "user-input"
  | "unknown";

export type CognitionSource = {
  id: string;
  kind: CognitionSourceKind;
  description: string;
  owner?: string;
  consentRequired: boolean;
  consentGranted: boolean;
  retentionClass?: "ephemeral" | "session" | "bounded" | "persistent";
  sensitivity?: "public" | "internal" | "private" | "restricted";
};

export function createSyntheticCognitionMesh(input: {
  meshId: string;
  sources: CognitionSource[];
  purpose: string;
  confirmation: string;
  allowCrossSourceFusion?: boolean;
  allowPersistentMemory?: boolean;
  allowExternalStreaming?: boolean;
}) {
  const meshId = input.meshId.trim();
  const purpose = input.purpose.trim();
  if (!meshId || !purpose) throw new Error("meshId and purpose are required.");

  const expectedConfirmation = `AUTHORIZE COGNITION MESH ${meshId}`;
  if (input.confirmation.trim() !== expectedConfirmation) {
    throw new Error(`Exact confirmation required: ${expectedConfirmation}`);
  }

  const ids = new Set<string>();
  for (const source of input.sources) {
    const id = source.id.trim();
    if (!id) throw new Error("Every cognition source requires an id.");
    if (ids.has(id)) throw new Error(`Duplicate cognition source id: ${id}`);
    ids.add(id);
    if (source.consentRequired && !source.consentGranted) {
      throw new Error(`Consent missing for source: ${id}`);
    }
  }

  const persistentSources = input.sources.filter(
    (source) => source.retentionClass === "persistent",
  );
  if (persistentSources.length > 0 && input.allowPersistentMemory !== true) {
    throw new Error("Persistent-memory sources require allowPersistentMemory=true.");
  }

  return {
    schema: "jp-hviti-service-bridge-synthetic-cognition-mesh/v1",
    createdAt: new Date().toISOString(),
    meshId,
    purpose,
    architecture: {
      inspirationClass: "fiction-inspired synthetic cognition",
      fictionalCharactersReplicated: false,
      consciousnessClaimed: false,
      sentienceClaimed: false,
      autonomousPersonhoodClaimed: false,
    },
    sourceGraph: {
      sourceCount: input.sources.length,
      sources: input.sources,
      crossSourceFusionAllowed: input.allowCrossSourceFusion === true,
      universalDataAccessAllowed: false,
      unauthorizedCollectionAllowed: false,
    },
    cognitionRail: [
      "authorized-source-intake",
      "provenance-attach",
      "L4-semantic-normalization",
      "polyglot-language-code-signal-unification",
      "confidence-and-conflict-analysis",
      "bounded-memory-linking",
      "V#-AR-contextual-rendering",
      "human-review",
    ],
    memory: {
      ephemeralAllowed: true,
      sessionAllowed: true,
      boundedAllowed: true,
      persistentAllowed: input.allowPersistentMemory === true,
      automaticPermanentMemoryAllowed: false,
      deletionAndRevocationRequired: true,
    },
    network: {
      localProcessingPreferred: true,
      externalStreamingAllowed: input.allowExternalStreaming === true,
      automaticExfiltrationAllowed: false,
      unrestrictedNetworkCollectionAllowed: false,
    },
    safety: {
      biometricIdentificationAllowed: false,
      privateCommunicationInterceptionAllowed: false,
      credentialCollectionAllowed: false,
      massSurveillanceAllowed: false,
      covertCollectionAllowed: false,
      autonomousPhysicalControlAllowed: false,
    },
    truthBoundary: {
      authorizationReceiptCreated: true,
      dataIngested: false,
      sourcesAccessed: false,
      cognitionExecuted: false,
      memoryWritten: false,
      networkTransmitted: false,
      deviceControlled: false,
      externalActionCompleted: false,
    },
  };
}
