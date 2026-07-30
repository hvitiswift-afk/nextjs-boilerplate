import successorControl from "@/receipts/revenue/FARDARTER-DRIVE-SUCCESSOR-CONTROL-V6-6.json";
import successorBundle from "@/receipts/revenue/FARDARTER-DRIVE-SUCCESSOR-REVIEW-BUNDLE-V6-6.sample.json";
import googleDriveReceipt from "@/receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6.json";
import { getCanonicalSuccessorState } from "@/lib/revenue/canonical-successor";

export const dynamic = "force-static";
export const revalidate = 900;

export async function GET() {
  const runtime = getCanonicalSuccessorState();
  const derivedMatches =
    runtime.current.eventSequence === successorControl.currentCanonical.headSequence &&
    runtime.current.eventDigest === successorControl.currentCanonical.headDigest &&
    runtime.current.reconciliationDigest === successorControl.currentCanonical.reconciliationDigest &&
    runtime.next.eventSequence === successorControl.nextCandidate.eventSequence &&
    runtime.next.previousEventDigest === successorControl.nextCandidate.previousEventDigest &&
    runtime.next.reconciliationSequence === successorControl.nextCandidate.reconciliationSequence &&
    runtime.next.previousSnapshotDigest === successorControl.nextCandidate.previousSnapshotDigest;

  return Response.json({
    schemaVersion: "1.0.0",
    controllerVersion: successorControl.controllerVersion,
    controllingIssue: successorControl.controllingIssue,
    control: {
      id: successorControl.controlId,
      digest: successorControl.controlDigest,
      currentCanonical: successorControl.currentCanonical,
      nextCandidate: successorControl.nextCandidate,
      conflictPolicy: successorControl.conflictPolicy,
      evidenceBoundary: successorControl.evidenceBoundary,
      deployment: successorControl.deployment,
    },
    runtimeDerived: {
      ...runtime,
      matchesCanonicalControl: derivedMatches,
      hardcodedHeadAllowed: false,
    },
    blockedReview: {
      id: successorBundle.bundleId,
      digest: successorBundle.bundleDigest,
      state: successorBundle.state,
      decision: successorBundle.decision,
      source: successorBundle.source,
      candidateEvent: successorBundle.candidateEvent,
      candidateReconciliation: successorBundle.candidateReconciliation,
      evidenceMatrix: successorBundle.evidenceMatrix,
      authorityMatrix: successorBundle.authorityMatrix,
      unresolvedBlockers: successorBundle.review.unresolvedBlockers,
      actualEffects: successorBundle.actualEffects,
    },
    googleDriveContinuity: {
      state: googleDriveReceipt.state,
      documentTitles: successorBundle.googleDriveContinuity.documentTitles,
      publicReferencesExposed: successorBundle.googleDriveContinuity.publicReferencesExposed,
      dynamicHeadControlMaintained: googleDriveReceipt.automation.maintainDynamicHeadSuccessorControl,
      successorGateRegisterMaintained: googleDriveReceipt.automation.maintainSuccessorGateRegister,
    },
    nextControlledAction: successorControl.nextControlledAction,
  }, {
    headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" },
  });
}
