import type { Metadata } from "next";

import capacityLedger from "@/receipts/revenue/FARDARTER-DRIVE-CAPACITY-LEDGER-V6-1.json";
import proposalLedger from "@/receipts/revenue/FARDARTER-DRIVE-EVENT-PROPOSALS-V6-3.json";
import reconciliation from "@/receipts/revenue/FARDARTER-DRIVE-RECONCILIATION-V6-3.json";
import eventChain from "@/receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json";
import { getPublicReconciliationSignals } from "@/lib/revenue/public-reconciliation-ledger";
import { getPublicStateLedger } from "@/lib/revenue/public-state-ledger";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";
export const revalidate = 900;

const canonicalUrl = `${getSiteUrl()}/github-control-tower-audit/reconciliation`;
const proposalUrl =
  "https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/new?template=fardarter-event-proposal.yml";
const controlIssueUrl =
  "https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/160";

export const metadata: Metadata = {
  title: "Fardarter Drive™ v6.3 Reconciliation | JP Systems",
  description:
    "Event proposals, reconciliation snapshots, drift detection, and reversible quarantine for the Fardarter Drive append-only receipt mesh.",
  alternates: { canonical: canonicalUrl },
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function ReconciliationPage() {
  const [publicStates, publicProposals] = await Promise.all([
    getPublicStateLedger(),
    getPublicReconciliationSignals(),
  ]);
  const stateSignalTotal = Object.values(publicStates.counts).reduce<number>(
    (sum, value) => sum + (value ?? 0),
    0,
  );

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.3em] text-cyan-200" href="/">
            JP Systems
          </a>
          <div className="flex flex-wrap gap-4">
            <a href="/github-control-tower-audit">Audit offer</a>
            <a href="/github-control-tower-audit/operations">Operations</a>
            <a href="/api/revenue/reconciliation">JSON reconciliation</a>
          </div>
        </nav>

        <section className="py-16">
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-fuchsia-200">
            Fardarter Drive™ v6.3
          </p>
          <h1 className="mt-4 max-w-5xl text-5xl font-black tracking-tight sm:text-7xl">
            Propose, reconcile, quarantine—then canonicalize only by reviewed merge.
          </h1>
          <p className="mt-6 max-w-4xl text-lg leading-8 text-white/65">
            Public signals and proposals are operational evidence, not canonical events. This control layer compares them with the SHA-256 chain, freezes contradictions, and preserves the zero-order, zero-cash baseline until independently supported evidence is merged.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="rounded-full bg-fuchsia-200 px-6 py-3 font-bold text-black" href={proposalUrl}>
              Create event proposal
            </a>
            <a className="rounded-full border border-white/20 px-6 py-3 font-bold" href={controlIssueUrl}>
              Review control issue #160
            </a>
          </div>
        </section>

        <section className="grid gap-4 border-t border-white/10 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Snapshot" value="0 / genesis" />
          <Metric label="Snapshot digest" value={`${reconciliation.snapshotDigest.slice(0, 12)}…`} />
          <Metric label="Proposal ledger" value={`${proposalLedger.proposalCount} canonical`} />
          <Metric label="Canonical events" value={String(eventChain.canonicalBusinessEventCount)} />
          <Metric label="Public state signals" value={publicStates.sourceState === "AVAILABLE" ? String(stateSignalTotal) : "Unavailable"} />
          <Metric label="Open proposals" value={publicProposals.openProposalRequests === null ? "Unavailable" : String(publicProposals.openProposalRequests)} />
          <Metric label="Ready for review" value={publicProposals.readyForReview === null ? "Unavailable" : String(publicProposals.readyForReview)} />
          <Metric label="Quarantined" value={publicProposals.quarantined === null ? "Unavailable" : String(publicProposals.quarantined)} />
          <Metric label="ACTIVE" value={`${capacityLedger.canonicalCapacity.activeDeliveries}/${capacityLedger.canonicalCapacity.effectiveActiveCeiling}`} />
          <Metric label="Active headroom" value={String(capacityLedger.arithmetic.effectiveActiveHeadroom)} />
          <Metric label="Orders" value={String(capacityLedger.canonicalCapacity.orders)} />
          <Metric label="Settled cash" value={usd.format(capacityLedger.financialEvidence.verifiedSettledCashUsd)} />
        </section>

        <section className="grid gap-6 border-t border-white/10 py-12 lg:grid-cols-3">
          <StateCard
            title="READY_FOR_REVIEW"
            text="The proposal is structurally consistent with the public signal and canonical transition map. It remains noncanonical and creates no commercial effect."
          />
          <StateCard
            title="QUARANTINED"
            text="A conflict, stale gate, duplicate key, sensitive condition, capacity overflow, or public/canonical mismatch froze canonical mutation."
          />
          <StateCard
            title="CANONICALIZED_BY_REVIEWED_MERGE"
            text="A separate reviewed source change appended the supported event, recomputed digests, reconciled effects, and produced a new snapshot."
          />
        </section>

        <section className="border-t border-white/10 py-12">
          <h2 className="text-3xl font-black">Reconciliation invariants</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Boundary label="Canonical chain" value="GENESIS_ONLY" />
            <Boundary label="Canonical head" value={`0 / ${eventChain.headDigest.slice(0, 12)}…`} />
            <Boundary label="Proposal auto-canonicalization" value="FALSE" />
            <Boundary label="Quarantine freezes mutation" value="TRUE" />
            <Boundary label="Received cash gate" value="PAID_SETTLED" />
            <Boundary label="Deployment" value="UNVERIFIED" />
          </div>
        </section>

        <section className="border-t border-white/10 py-12">
          <h2 className="text-3xl font-black">What this layer refuses to infer</h2>
          <p className="mt-4 max-w-4xl leading-7 text-white/60">
            A proposal, label, comment, invoice, pending transfer, screenshot, capacity target, or Google Drive file is not an order, contract, settled payment, active delivery, accepted outcome, valuation, or guarantee. Consequential states retain their exact buyer, JP, provider, capacity, delivery, acceptance, refund, dispute, or counsel gates.
          </p>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-2 break-words font-mono text-lg font-bold text-cyan-100">{value}</p>
    </div>
  );
}

function StateCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-3xl border border-fuchsia-200/15 bg-fuchsia-200/[0.045] p-6">
      <p className="font-mono text-sm text-fuchsia-100">{title}</p>
      <p className="mt-4 leading-7 text-white/60">{text}</p>
    </article>
  );
}

function Boundary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <p className="text-sm text-white/45">{label}</p>
      <p className="mt-2 font-mono font-bold text-white">{value}</p>
    </div>
  );
}
