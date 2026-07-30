import type { Metadata } from "next";

import application from "@/receipts/revenue/FARDARTER-DRIVE-CANONICALIZATION-APPLICATION-V6-5.json";
import previewLedger from "@/receipts/revenue/FARDARTER-DRIVE-CANONICALIZATION-PREVIEWS-V6-4.json";
import reviewBundle from "@/receipts/revenue/FARDARTER-DRIVE-CANONICALIZATION-REVIEW-BUNDLE-V6-4.sample.json";
import capacity from "@/receipts/revenue/FARDARTER-DRIVE-CAPACITY-LEDGER-V6-1.json";
import events from "@/receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json";
import { getPublicCanonicalizationPreviewCounts } from "@/lib/revenue/public-canonicalization-preview";

export const metadata: Metadata = {
  title: "Fardarter Drive v6.4 Preview History",
  description: "Historical prepared preview and the reviewed v6.5 application that followed it.",
};

export default async function CanonicalizationPreviewPage() {
  const counts = await getPublicCanonicalizationPreviewCounts();
  const event = reviewBundle.candidateEvent;
  const snapshot = reviewBundle.candidateReconciliation;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-14">
      <nav className="flex flex-wrap gap-4 border-b border-neutral-800 pb-5 text-sm text-neutral-400">
        <a href="/github-control-tower-audit">Audit offer</a>
        <a href="/github-control-tower-audit/canonicalization-application">Applied event</a>
        <a href="/api/revenue/canonicalization-preview">Preview JSON</a>
      </nav>

      <header className="space-y-5 border-b border-neutral-800 py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-400">Fardarter Drive™ v6.4 → v6.5</p>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">Historical preview, reviewed application</h1>
        <p className="max-w-3xl text-lg leading-8 text-neutral-300">
          The v6.4 bundle remains an immutable noncanonical dry-run. v6.5 recomputed a new
          canonical event and snapshot through a reviewed merge; it did not reuse the preview digest.
        </p>
      </header>

      <section className="grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Prepared preview" value={reviewBundle.state} />
        <Metric label="Expected decision" value={reviewBundle.expectedDecision} />
        <Metric label="Current head" value={`#${events.headSequence}`} />
        <Metric label="Canonical events" value={String(events.canonicalBusinessEventCount)} />
        <Metric label="SCOPE_DRAFTED" value={String(events.currentCanonicalCounts.SCOPE_DRAFTED)} />
        <Metric label="ACTIVE / headroom" value={`${capacity.canonicalCapacity.activeDeliveries}/${capacity.arithmetic.effectiveActiveHeadroom}`} />
        <Metric label="Orders" value={String(capacity.canonicalCapacity.orders)} />
        <Metric label="Settled cash" value="$0" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Historical prepared preview">
          <Row label="Transition" value={`${event.fromState} → ${event.toState}`} />
          <Row label="Candidate sequence" value={String(event.sequence)} />
          <Row label="Candidate event" value={event.eventDigest} mono />
          <Row label="Candidate snapshot" value={snapshot.snapshotDigest} mono />
          <Row label="Review bundle" value={reviewBundle.bundleDigest} mono />
          <Row label="Preview ledger" value={previewLedger.ledgerDigest} mono />
          <Row label="Canonical / applied" value="NO / NO" />
        </Panel>

        <Panel title="Reviewed v6.5 application">
          <Row label="Decision" value={application.review.decision} />
          <Row label="Applied sequence" value={String(application.canonicalEvent.sequence)} />
          <Row label="Canonical event" value={application.canonicalEvent.eventDigest} mono />
          <Row label="Reconciliation" value={application.reconciliation.snapshotDigest} mono />
          <Row label="Application" value={application.applicationDigest} mono />
          <Row label="Orders / gross / settled" value="0 / $0 / $0" />
        </Panel>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Live public preview signals">
          <Row label="Source" value={counts.sourceState} />
          <Row label="Open" value={String(counts.openPreviewRequests ?? "unavailable")} />
          <Row label="Preview ready" value={String(counts.previewReady ?? "unavailable")} />
          <Row label="Blocked" value={String(counts.blocked ?? "unavailable")} />
        </Panel>
        <Panel title="Application boundary">
          <Boundary text="Preview digest reused as canonical digest: FALSE" />
          <Boundary text="Reviewed application creates order: FALSE" />
          <Boundary text="Reviewed application proves payment: FALSE" />
          <Boundary text="Reviewed application starts paid work: FALSE" />
          <Boundary text="Later changes require new event: TRUE" />
          <Boundary text="Public deployment verified: FALSE" />
        </Panel>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <article className="rounded-2xl border border-neutral-800 p-5"><p className="text-sm text-neutral-400">{label}</p><p className="mt-2 break-words text-2xl font-semibold">{value}</p></article>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <article className="rounded-3xl border border-neutral-800 p-7"><h2 className="text-2xl font-semibold">{title}</h2><dl className="mt-6 space-y-4">{children}</dl></article>; }
function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) { return <div className="grid gap-1 border-t border-neutral-800 pt-4 sm:grid-cols-[155px_1fr]"><dt className="text-neutral-400">{label}</dt><dd className={mono ? "break-all font-mono text-xs" : "text-neutral-200"}>{value}</dd></div>; }
function Boundary({ text }: { text: string }) { return <p className="rounded-2xl border border-neutral-800 p-4 text-sm text-neutral-300">{text}</p>; }
