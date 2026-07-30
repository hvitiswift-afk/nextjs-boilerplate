import type { Metadata } from "next";

import previewLedger from "@/receipts/revenue/FARDARTER-DRIVE-CANONICALIZATION-PREVIEWS-V6-4.json";
import reviewBundle from "@/receipts/revenue/FARDARTER-DRIVE-CANONICALIZATION-REVIEW-BUNDLE-V6-4.sample.json";
import capacityLedger from "@/receipts/revenue/FARDARTER-DRIVE-CAPACITY-LEDGER-V6-1.json";
import eventChain from "@/receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json";
import { getPublicCanonicalizationPreviewCounts } from "@/lib/revenue/public-canonicalization-preview";

export const metadata: Metadata = {
  title: "Fardarter Drive v6.4 Canonicalization Preview",
  description:
    "Inspect deterministic next-event and reconciliation previews without applying canonical, commercial, financial, or capacity effects.",
};

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export default async function CanonicalizationPreviewPage() {
  const counts = await getPublicCanonicalizationPreviewCounts();
  const event = reviewBundle.candidateEvent;
  const projection = reviewBundle.candidateProjection;
  const snapshot = reviewBundle.candidateReconciliation;
  const previewReadyState: "PREVIEW_READY" = reviewBundle.expectedDecision;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-14">
      <header className="space-y-5 border-b border-neutral-800 pb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-400">
          Fardarter Drive™ v6.4
        </p>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Canonicalization preview and review bundles
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-neutral-300">
          Compute the next event, projected state counts, capacity, money, and
          reconciliation digest before a reviewed merge. A preview never applies
          itself.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            className="rounded-full border border-neutral-600 px-5 py-2 text-sm font-medium hover:border-neutral-300"
            href="https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/new?template=fardarter-canonicalization-preview.yml"
          >
            Create preview request
          </a>
          <a
            className="rounded-full border border-neutral-600 px-5 py-2 text-sm font-medium hover:border-neutral-300"
            href="/api/revenue/canonicalization-preview"
          >
            Read preview API
          </a>
          <a
            className="rounded-full border border-neutral-600 px-5 py-2 text-sm font-medium hover:border-neutral-300"
            href="/github-control-tower-audit/reconciliation"
          >
            Reconciliation control
          </a>
        </div>
      </header>

      <section className="grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Planning slots", capacityLedger.canonicalCapacity.totalPlanningSlots],
          ["Effective ACTIVE", capacityLedger.canonicalCapacity.effectiveActiveCeiling],
          ["Active now", capacityLedger.canonicalCapacity.activeDeliveries],
          ["Canonical events", eventChain.canonicalBusinessEventCount],
        ].map(([label, value]) => (
          <article key={String(label)} className="rounded-2xl border border-neutral-800 p-5">
            <p className="text-sm text-neutral-400">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{String(value)}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-neutral-800 p-7">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
            Prepared review bundle
          </p>
          <h2 className="mt-3 text-2xl font-semibold">{previewReadyState}</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-neutral-400">Bundle state</dt><dd>{reviewBundle.state}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-neutral-400">Source proposal</dt><dd>Issue #{reviewBundle.source.proposalIssue}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-neutral-400">Source entity</dt><dd>Issue #{reviewBundle.source.entityIssue}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-neutral-400">Candidate sequence</dt><dd>{event.sequence}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-neutral-400">Canonical / applied</dt><dd>NO / NO</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-neutral-400">Evidence rows</dt><dd>{reviewBundle.evidenceMatrix.length}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-neutral-400">Authority rows</dt><dd>{reviewBundle.authorityMatrix.length}</dd></div>
          </dl>
        </article>

        <article className="rounded-3xl border border-neutral-800 p-7">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
            Candidate projection
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            {event.fromState} → {event.toState}
          </h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-neutral-400">ACTIVE delta</dt><dd>{event.capacityEffect.activeDelta}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-neutral-400">Headroom if applied</dt><dd>{projection.activeHeadroom}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-neutral-400">Order delta</dt><dd>{event.financialEffect.createsOrder ? 1 : 0}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-neutral-400">Gross delta</dt><dd>{money(event.financialEffect.grossRevenueDeltaUsd)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-neutral-400">Settled-cash delta</dt><dd>{money(event.financialEffect.settledCashDeltaUsd)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-neutral-400">Canonical source changed</dt><dd>NO</dd></div>
          </dl>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-neutral-800 p-7">
        <h2 className="text-2xl font-semibold">Digest chain</h2>
        <div className="mt-6 grid gap-5 text-sm lg:grid-cols-2">
          {[
            ["Current canonical head", event.previousEventDigest],
            ["Candidate event", event.eventDigest],
            ["Previous reconciliation", snapshot.previousSnapshotDigest],
            ["Candidate reconciliation", snapshot.snapshotDigest],
            ["Review bundle", reviewBundle.bundleDigest],
            ["Preview ledger", previewLedger.ledgerDigest],
          ].map(([label, digest]) => (
            <div key={label} className="min-w-0">
              <p className="text-neutral-400">{label}</p>
              <code className="mt-1 block break-all text-xs leading-5">{digest}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-neutral-800 p-7">
          <h2 className="text-2xl font-semibold">Live public preview signals</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Source: {counts.sourceState}. These counts are operational signals, not canonical or commercial evidence.
          </p>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between"><dt>Open requests</dt><dd>{counts.openPreviewRequests ?? "unavailable"}</dd></div>
            <div className="flex justify-between"><dt>Preview ready</dt><dd>{counts.previewReady ?? "unavailable"}</dd></div>
            <div className="flex justify-between"><dt>Blocked</dt><dd>{counts.blocked ?? "unavailable"}</dd></div>
            <div className="flex justify-between"><dt>Needs review</dt><dd>{counts.needsReview ?? "unavailable"}</dd></div>
          </dl>
        </article>

        <article className="rounded-3xl border border-neutral-800 p-7">
          <h2 className="text-2xl font-semibold">Application boundary</h2>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-neutral-300">
            <li>Preview receipts and Drive files are noncanonical.</li>
            <li>A reviewed merge must recompute event, bundle, and snapshot digests.</li>
            <li>Counts, capacity, orders, revenue, and settled cash must reconcile before application.</li>
            <li>Received cash still requires provider-confirmed PAID_SETTLED evidence.</li>
            <li>Deployment remains unverified without a real Netlify deploy ID and immutable readback.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
