import { createHash } from "node:crypto";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export type MerkleLeaf = {
  id: string;
  digest: string;
};

export type MerkleProofStep = {
  siblingDigest: string;
  siblingPosition: "left" | "right";
};

export function createMerkleTree(leaves: MerkleLeaf[]) {
  if (!Array.isArray(leaves) || leaves.length === 0) {
    throw new Error("At least one Merkle leaf is required.");
  }

  const normalized = leaves.map((leaf, index) => {
    const id = leaf.id.trim();
    const digest = leaf.digest.trim().toLowerCase();
    if (!id || !/^[a-f0-9]{64}$/.test(digest)) {
      throw new Error(`Leaf ${index} requires an id and a SHA-256 hex digest.`);
    }
    return { id, digest };
  });

  const levels: string[][] = [normalized.map((leaf) => leaf.digest)];
  while (levels.at(-1)!.length > 1) {
    const current = levels.at(-1)!;
    const next: string[] = [];
    for (let index = 0; index < current.length; index += 2) {
      const left = current[index];
      const right = current[index + 1] ?? left;
      next.push(sha256(`${left}${right}`));
    }
    levels.push(next);
  }

  const proofs = normalized.map((leaf, leafIndex) => {
    const path: MerkleProofStep[] = [];
    let index = leafIndex;
    for (let level = 0; level < levels.length - 1; level += 1) {
      const current = levels[level];
      const isRight = index % 2 === 1;
      const siblingIndex = isRight ? index - 1 : index + 1;
      path.push({
        siblingDigest: current[siblingIndex] ?? current[index],
        siblingPosition: isRight ? "left" : "right",
      });
      index = Math.floor(index / 2);
    }
    return { id: leaf.id, leafDigest: leaf.digest, leafIndex, path };
  });

  return {
    schema: "jp-hviti-service-bridge-merkle-tree/v1",
    createdAt: new Date().toISOString(),
    algorithm: "SHA-256",
    leafCount: normalized.length,
    levelCount: levels.length,
    rootDigest: levels.at(-1)![0],
    leaves: normalized,
    levels,
    proofs,
    truthBoundary: {
      localIntegrityStructureCreated: true,
      signed: false,
      notarized: false,
      trustedTimestamp: false,
      externalActionCompleted: false,
    },
  };
}

export function verifyMerkleProof(input: {
  leafDigest: string;
  rootDigest: string;
  path: MerkleProofStep[];
}) {
  let computed = input.leafDigest.trim().toLowerCase();
  for (const step of input.path) {
    computed =
      step.siblingPosition === "left"
        ? sha256(`${step.siblingDigest}${computed}`)
        : sha256(`${computed}${step.siblingDigest}`);
  }

  return {
    schema: "jp-hviti-service-bridge-merkle-proof-verification/v1",
    checkedAt: new Date().toISOString(),
    valid: computed === input.rootDigest.trim().toLowerCase(),
    computedRootDigest: computed,
    expectedRootDigest: input.rootDigest.trim().toLowerCase(),
    externalActionCompleted: false as const,
  };
}
