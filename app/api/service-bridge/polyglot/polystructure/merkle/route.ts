import { NextRequest, NextResponse } from "next/server";

import {
  createMerkleTree,
  verifyMerkleProof,
  type MerkleLeaf,
  type MerkleProofStep,
} from "@/lib/service-bridge-merkle";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-merkle-capabilities/v1",
    operations: ["create-tree", "verify-proof"],
    algorithm: "SHA-256",
    uses: [
      "bundle-part-integrity",
      "selective-disclosure-proof",
      "barcode-payload-linking",
      "identity-chain-linking",
      "polystructure-bank-verification",
    ],
    signed: false,
    notarized: false,
    trustedTimestamp: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const operation = String(payload?.operation ?? "create-tree");

    if (operation === "create-tree") {
      return NextResponse.json(
        createMerkleTree(
          Array.isArray(payload?.leaves)
            ? (payload.leaves as MerkleLeaf[])
            : [],
        ),
      );
    }

    if (operation === "verify-proof") {
      return NextResponse.json(
        verifyMerkleProof({
          leafDigest: String(payload?.leafDigest ?? ""),
          rootDigest: String(payload?.rootDigest ?? ""),
          path: Array.isArray(payload?.path)
            ? (payload.path as MerkleProofStep[])
            : [],
        }),
      );
    }

    throw new Error("operation must be create-tree or verify-proof.");
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid Merkle request.",
        valid: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
