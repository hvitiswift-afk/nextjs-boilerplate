import type { Metadata } from "next";

import application from "@/receipts/revenue/FARDARTER-DRIVE-CANONICALIZATION-APPLICATION-V6-5.json";
import capacity from "@/receipts/revenue/FARDARTER-DRIVE-CAPACITY-LEDGER-V6-1.json";
import historical from "@/receipts/revenue/FARDARTER-DRIVE-RECONCILIATION-V6-3.json";
import current from "@/receipts/revenue/FARDARTER-DRIVE-RECONCILIATION-V6-5.json";
import events from "@/receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json";
import { getPublicReconciliationSignals } from "@/lib/revenue/public-reconciliation-ledger";

export const metadata: Metadata = {
  title: "Fardarter Drive v6.5 Reconciliation",
  description: "Historical proposal snapshot, current sequence-1 reconciliation, conflicts, capacity, and money evidence.",
};

export const dynamic = "force-static";
export const revalidate = 900;

export default async function ReconciliationPage() {
  const publicProposals = await getPublicReconciliationSignals();

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <nav className="flex flex-wrap gap-4 border-b border-white/10 pb-5 text-sm text-white/60">
          <a href="/github-control-tower-audit">Audit offer</a>
          <a href="/github-control-tower-audit/operations">Operations</a>
          <a href="/github-control-tower-audit/canonicalization-application">Application</a>
          <a href="/api/revenue/reconciliation">Reconciliation JSON</a>
        </nav>

        <header className="py-14">
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-fuchsia-200">Fardarter Drive™ v6.5</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-7xl">Historical snapshot, current reconciliation</h1>
          <p className="mt-6 max-w-4xl text-lg leading-8 text-white/65">
            The v6.3 sequence-0 snapshot remains immutable. The current v6.5 snapshot links
            to it and reconciles the reviewed sequence-1 <code>SCOPE_DRAFTED</code> event
            without creating an order, payment, revenue, or ACTIVE delivery.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Historical snapshot" value={`#${historical.sequence}`} />
          <Metric label="Current snapshot" value={`#${current.sequence}`} />
          <Metric label="Canonical head" value={`#${events.headSequence}`} />
          <Metric label="Business events" value={String(events.canonicalBusinessEventCount)} />
          <Metric label="SCOPE_DRAFTED" value={String(events.currentCanonicalCounts.SCOPE_DRAFTED)} />
          <Metric label="Open proposals" value={publicProposals.openProposalRequests === null ? "Unavailable" : String(publicProposals.openProposalRequests)} />
          <Metric label="ACTIVE / headroom" value={`${capacity.canonicalCapacity.activeDeliveries}/${capacity.arithmetic.effectiveActiveHeadroom}`} />
          <Metric label="Orders / settled" value={`${capacity.canonicalCapacity.orders} / $0`} />
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <Panel title="Snapshot chain">
            <Row label="v6.3 digest" value={historical.snapshotDigest} mono />
            <Row label="v6.5 previous" value={current.previousSnapshotDigest} mono />
            <Row label="v6.5 digest" value={current.snapshotDigest} mono />
            <Row label="Application digest" value={application.applicationDigest} mono />
          </Panel>
          <Panel title="Canonical application">
            <Row label="Entity" value={`Issue #${application.source.entityIssue}`} />
            <Row label="Transition" value={`${application.source.fromState} → ${application.source.toState}`} />
            <Row label="Event digest" value={application.canonicalEvent.eventDigest} mono />
            <Row label="Decision" value={application.review.decision} />
          </Panel>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Boundary label="Proposal auto-canonicalization" value="FALSE" />
          <Boundary label="Reviewed merge applied" value="TRUE" />
          <Boundary label="Historical snapshots immutable" value="TRUE" />
          <Boundary label="Conflicts" value={String(current.conflicts.total)} />
          <Boundary label="Received cash gate" value="PAID_SETTLED" />
          <Boundary label="Deployment" value={current.deployment.state} />
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><p className="text-xs uppercase tracking-[0.18em] text-white/40">{label}</p><p className="mt-2 break-words font-mono text-lg font-bold text-cyan-100">{value}</p></article>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-7"><h2 className="text-2xl font-black">{title}</h2><dl className="mt-6 space-y-4">{children}</dl></article>; }
function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) { return <div className="grid gap-1 border-t border-white/10 pt-4 sm:grid-cols-[145px_1fr]"><dt className="text-white/40">{label}</dt><dd className={mono ? "break-all font-mono text-xs text-fuchsia-100" : "text-white/75"}>{value}</dd></div>; }
function Boundary({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-black/25 p-4"><p className="text-sm text-white/45">{label}</p><p className="mt-2 font-mono font-bold text-white">{value}</p></div>; }
