import { NextResponse } from "next/server";
import { getVaultManifest } from "../../../../lib/vault-manifest";

export async function GET() {
  return NextResponse.json({
    ok: true,
    manifest: getVaultManifest(),
    message: "The manifest is a discoverability map. Violet Gate remains the approval authority."
  });
}
