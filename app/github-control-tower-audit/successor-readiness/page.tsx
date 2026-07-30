import type { Metadata } from "next";

import control from "@/receipts/revenue/FARDARTER-DRIVE-SUCCESSOR-CONTROL-V6-6.json";
import bundle from "@/receipts/revenue/FARDARTER-DRIVE-SUCCESSOR-REVIEW-BUNDLE-V6-6.sample.json";
import { getCanonicalSuccessorState } from "@/lib/revenue/canonical-successor";

export const metadata: Metadata = {
  title: "Fardarter Drive v6.6 Successor Readiness",
  description: "Dynamic-head event-2 readiness, evidence gates, blocked consequential transitions, and append-only boundaries.",
};

export default function SuccessorReadinessPage() {
  const runtime = getCanonicalSuccessorState();
  const candidate = bundle.candidateEvent;
  const projection = bundle.candidateReconciliation.projectionIfApplied;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-14">
      <header className="space-y-5 border-b border-neutral-800 pb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-400">
          Fardarter Drive™ v6.6
        </p>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Dynamic-head successor control
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-neutral-300">
          The next sequence and previous digests are derived from canonical source at runtime.
          The prepared SCOPE_DRAFTED → HUMAN_ACCEPTED review is blocked because buyer consent
          and exact application evidence are missing.
        </p>
        <div className="flex flex-wrap gap-3">
          <a className="rounded-full border border-neutral-600 px-5 py-2 text-sm font-medium" href="/api/revenue/successor-readiness">
            Read successor API
          </a>
          <a className="rounded-full border border-neutral-600 px-5 py-2 text-sm font-medium" href="https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/173">
            Control issue #173
          </a>
        </div>
      </header>

      <section className="grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Current event head" value={String(runtime.current.eventSequence)} />
        <Metric label="Next candidate" value={String(runtime.next.eventSequence)} />
        <Metric label="Current reconciliation" value={String(runtime.current.reconciliationSequence)} />
        <Metric label="Next reconciliation" value={String(runtime.next.reconciliationSequence)} />
        <Metric label="SCOPE_DRAFTED" value={String(runtime.current.stateCounts.SCOPE_DRAFTED)} />
        <Metric label="ACTIVE / headroom" value={`${runtime.current.activeDeliveries} / ${runtime.current.activeHeadroom}`} />
        <Metric label="Orders now" value={String(runtime.current.orders)} />
        <Metric label="Decision" value={bundle.decision} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-neutral-800 p-7">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">Dynamic successor</p>
          <h2 className="mt-3 text-2xl font-semibold">{candidate.fromState} → {candidate.toState}</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <Row label="Candidate sequence" value={String(candidate.sequence)} />
            <Row label="Previous event digest" value={candidate.previousEventDigest} mono />
            <Row label="Candidate digest" value={candidate.candidateDigest} mono />
            <Row label="Gate" value={candidate.authorityGate} />
            <Row label="Canonical / applied" value="NO / NO" />
          </dl>
        </article>

        <article className="rounded-3xl border border-rose-400/25 bg-rose-400/[0.04] p-7">
          <p className="text-sm uppercase tracking-[0.2em] text-rose-200">Gate result</p>
          <h2 className="mt-3 text-2xl font-semibold">{bundle.decision}</h2>
          <ul className="mt-6 space-y-3 text-sm text-neutral-300">
            {bundle.review.unresolvedBlockers.map((blocker) => <li key={blocker}>{blocker}</li>)}
          </ul>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-neutral-800 p-7">
        <h2 className="text-2xl font-semibold">Projection is not current truth</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Orders if validly applied" value={String(projection.orders)} />
          <Metric label="ACTIVE if applied" value={String(projection.activeDeliveries)} />
          <Metric label="Gross if applied" value={`$${projection.verifiedGrossRevenueUsd}`} />
          <Metric label="Settled if applied" value={`$${projection.verifiedSettledCashUsd}`} />
        </div>
        <p className="mt-6 leading-7 text-neutral-400">
          Current actual orders, gross revenue, settled cash, paid work, and ACTIVE use remain zero.
          Broad system-development authorization is not buyer consent and cannot create a contract.
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <DigestCard label="Successor control" digest={control.controlDigest} />
        <DigestCard label="Blocked review bundle" digest={bundle.bundleDigest} />
        <DigestCard label="Candidate event" digest={candidate.candidateDigest} />
        <DigestCard label="Candidate reconciliation" digest={bundle.candidateReconciliation.snapshotDigest} />
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-neutral-800 p-5"><p className="text-sm text-neutral-400">{label}</p><p className="mt-2 break-words text-xl font-semibold">{value}</p></div>;
}
function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="grid gap-1 border-t border-neutral-800 pt-3 sm:grid-cols-[160px_1fr]"><dt className="text-neutral-400">{label}</dt><dd className={mono ? "break-all font-mono text-xs" : ""}>{value}</dd></div>;
}
function DigestCard({ label, digest }: { label: string; digest: string }) {
  return <article className="rounded-2xl border border-neutral-800 p-5"><p className="text-sm text-neutral-400">{label}</p><code className="mt-2 block break-all text-xs">{digest}</code></article>;
}
