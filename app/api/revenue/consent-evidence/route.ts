import { NextResponse } from "next/server";

import { getCanonicalConsentEvidence } from "@/lib/revenue/canonical-consent-evidence";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = getCanonicalConsentEvidence();

  return NextResponse.json({
    schemaVersion: "1.0.0",
    controllerVersion: "6.7.0",
    controlId: data.manifest.controlId,
    controllingIssue: data.manifest.controllingIssue,
    manifestDigest: data.manifest.manifestDigest,
    attestationId: data.attestation.attestationId,
    publicSafeAttestationDigest:
      data.attestation.publicSafeAttestation.attestationDigest,
    attestationReceiptDigest: data.attestation.attestationReceiptDigest,
    lifecycle: data.manifest.lifecycle,
    requiredEvidence: data.manifest.requiredEvidence,
    package: data.attestation.package,
    review: data.attestation.review,
    canonical: data.canonical,
    nextCandidate: data.attestation.nextCandidate,
    derived: data.derived,
    evidenceBoundaries: data.manifest.evidenceBoundaries,
    privacy: data.manifest.privacy,
    actualEffects: data.attestation.actualEffects,
    googleDriveContinuity: {
      state: data.manifest.googleDriveContinuity.state,
      documentTitles: data.manifest.googleDriveContinuity.documentTitles,
      publicReferencesExposed: false,
    },
  });
}
