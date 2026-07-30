import type { Metadata } from "next";

import application from "@/receipts/revenue/FARDARTER-DRIVE-CANONICALIZATION-APPLICATION-V6-5.json";
import capacity from "@/receipts/revenue/FARDARTER-DRIVE-CAPACITY-LEDGER-V6-1.json";
import events from "@/receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json";
import reconciliation from "@/receipts/revenue/FARDARTER-DRIVE-RECONCILIATION-V6-5.json";

export const metadata: Metadata = {
  title: "Fardarter Drive v6.5 Canonical Application",
  description:
    "Reviewed sequence-1 canonical event, reconciliation, zero-effect boundaries, and append-only recovery controls.",
};

export default function CanonicalizationApplicationPage() {
  const event = events.events.at(-1);

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <nav className="flex flex-wrap gap-4 border-b border-white/10 pb-5 text-sm text-white/60">
          <a href="/github-control-tower-audit">Audit offer</a>
          <a href="/github-control-tower-audit/operations">Operations</a>
          <a href="/github-control-tower-audit/reconciliation">Reconciliation</a>
          <a href="/github-control-tower-audit/canonicalization-preview">Preview history</a>
          <a href="/api/revenue/canonicalization-application">Application JSON</a>
        </nav>

        <header className="py-14">
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-emerald-200">
            Fardarter Drive™ v6.5
          </p>
          <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-7xl">
            Reviewed canonicalization application
          </h1>
          <p className="mt-6 max-w-4xl text-lg leading-8 text-white/65">
            The controlled self-test entity advanced to <code>SCOPE_DRAFTED</code> through a
            reviewed append-only merge. The event creates no customer, order, contract,
            payment, revenue, paid work start, or ACTIVE-capacity use.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Canonical head" value={`#${events.headSequence}`} />
          <Metric label="Business events" value={String(events.canonicalBusinessEventCount)} />
          <Metric label="SCOPE_DRAFTED" value={String(events.currentCanonicalCounts.SCOPE_DRAFTED)} />
          <Metric label="ACTIVE / headroom" value={`${capacity.canonicalCapacity.activeDeliveries} / ${capacity.arithmetic.effectiveActiveHeadroom}`} />
          <Metric label="Orders" value={String(capacity.canonicalCapacity.orders)} />
          <Metric label="Gross revenue" value="$0" />
          <Metric label="Settled cash" value="$0" />
          <Metric label="Deployment" value={reconciliation.deployment.state} />
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <Panel title="Applied event">
            <Row label="Entity" value={`GitHub Issue #${application.source.entityIssue}`} />
            <Row label="Transition" value={`${application.source.fromState} → ${application.source.toState}`} />
            <Row label="Sequence" value={String(application.canonicalEvent.sequence)} />
            <Row label="Previous digest" value={application.canonicalEvent.previousEventDigest} mono />
            <Row label="Event digest" value={application.canonicalEvent.eventDigest} mono />
            <Row label="Chain head" value={events.headDigest} mono />
          </Panel>

          <Panel title="Reconciliation">
            <Row label="Snapshot" value={reconciliation.snapshotId} />
            <Row label="Sequence" value={String(reconciliation.sequence)} />
            <Row label="Previous digest" value={reconciliation.previousSnapshotDigest} mono />
            <Row label="Snapshot digest" value={reconciliation.snapshotDigest} mono />
            <Row label="Application digest" value={application.applicationDigest} mono />
          </Panel>
        </section>

        <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.035] p-7">
          <h2 className="text-2xl font-black">Zero-effect boundary</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Boundary text="Creates customer: FALSE" />
            <Boundary text="Creates order: FALSE" />
            <Boundary text="Creates contract: FALSE" />
            <Boundary text="Proves payment: FALSE" />
            <Boundary text="Starts paid work: FALSE" />
            <Boundary text="Uses ACTIVE capacity: FALSE" />
            <Boundary text="Changes capacity ceiling: FALSE" />
            <Boundary text="Received cash requires: PAID_SETTLED" />
            <Boundary text="Indemnity-proof result: FALSE" />
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-amber-200/20 bg-amber-200/[0.04] p-7">
          <h2 className="text-2xl font-black">Append-only recovery</h2>
          <p className="mt-4 text-white/65">
            Genesis and event 1 are immutable. A correction, cancellation, recovery, or
            reversal must be a later event linked to the current head. Public deployment is
            still unverified until Netlify supplies a deploy ID and immutable route readback.
          </p>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-5"><p className="text-xs uppercase tracking-[0.18em] text-white/40">{label}</p><p className="mt-2 break-words text-2xl font-black">{value}</p></article>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-7"><h2 className="text-2xl font-black">{title}</h2><dl className="mt-6 space-y-4">{children}</dl></article>;
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="grid gap-1 border-t border-white/10 pt-4 sm:grid-cols-[150px_1fr]"><dt className="text-white/40">{label}</dt><dd className={mono ? "break-all font-mono text-xs text-emerald-100" : "text-white/75"}>{value}</dd></div>;
}

function Boundary({ text }: { text: string }) {
  return <p className="rounded-2xl border border-white/10 p-4 text-sm text-white/65">{text}</p>;
}
