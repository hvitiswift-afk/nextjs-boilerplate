import type { Metadata } from "next";

import capacityLedger from "@/receipts/revenue/FARDARTER-DRIVE-CAPACITY-LEDGER-V6-1.json";
import eventChain from "@/receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json";
import stateMachine from "@/receipts/revenue/FARDARTER-DRIVE-STATE-MACHINE-V6-2.json";
import {
  getPublicStateLedger,
  type FardarterStateId,
} from "@/lib/revenue/public-state-ledger";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";
export const revalidate = 900;

const canonicalUrl = `${getSiteUrl()}/github-control-tower-audit/operations`;

export const metadata: Metadata = {
  title: "Fardarter Drive™ v6.2 Operations | JP Systems",
  description:
    "Canonical receipt-chain health, state transitions, capacity, public operational signals, conflicts, and evidence boundaries.",
  alternates: { canonical: canonicalUrl },
};

export default async function FardarterOperationsPage() {
  const publicSignals = await getPublicStateLedger();
  const capacity = capacityLedger.canonicalCapacity;
  const head = eventChain.events.at(-1);

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <div className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.28em] text-cyan-200" href="/">
            JP Systems
          </a>
          <div className="flex flex-wrap gap-4">
            <a href="/github-control-tower-audit">Audit offer</a>
            <a href="/api/revenue/operations">Operations JSON</a>
            <a href="/api/revenue/capacity">Capacity JSON</a>
            <a href="https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/156">
              Control issue #156
            </a>
          </div>
        </nav>

        <header className="py-14">
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-cyan-200">
            Fardarter Drive™ v6.2
          </p>
          <h1 className="mt-4 max-w-5xl text-5xl font-black tracking-tight sm:text-7xl">
            Receipt mesh and state-transition control tower
          </h1>
          <p className="mt-6 max-w-4xl text-lg leading-8 text-white/65">
            Public labels are operational signals. Canonical business events exist only in
            the append-only SHA-256 chain after a reviewed merge. The current chain is
            genesis-only, with no orders, active deliveries, or verified cash.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Planning slots" value={String(capacity.totalPlanningSlots)} />
          <Metric label="Effective ACTIVE" value={`${capacity.activeDeliveries}/${capacity.effectiveActiveCeiling}`} />
          <Metric label="Canonical events" value={String(eventChain.canonicalBusinessEventCount)} />
          <Metric label="Settled cash" value="$0" />
          <Metric label="Event-chain head" value={`#${eventChain.headSequence}`} />
          <Metric label="Override" value={capacity.overrideState} />
          <Metric label="Public source" value={publicSignals.sourceState} />
          <Metric label="Deployment" value={stateMachine.baseline.deploymentState} />
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-fuchsia-200">
              Canonical chain
            </p>
            <h2 className="mt-3 text-2xl font-black">Genesis-only baseline</h2>
            <dl className="mt-6 space-y-4 text-sm">
              <Row label="Algorithm" value={eventChain.digestAlgorithm} />
              <Row label="Canonicalization" value={eventChain.canonicalization} />
              <Row label="Events" value={String(eventChain.eventCount)} />
              <Row label="Business events" value={String(eventChain.canonicalBusinessEventCount)} />
              <Row label="Genesis ID" value={head?.eventId ?? "UNKNOWN"} />
              <Row label="Head digest" value={eventChain.headDigest} mono />
            </dl>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-cyan-200">
              Evidence boundary
            </p>
            <h2 className="mt-3 text-2xl font-black">Signals do not become facts by repetition</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Boundary text="Public signal creates canonical event: FALSE" />
              <Boundary text="Public label creates order: FALSE" />
              <Boundary text="Workflow proves payment: FALSE" />
              <Boundary text="Drive file creates contract: FALSE" />
              <Boundary text="Received cash requires: PAID_SETTLED" />
              <Boundary text="Canonical event requires reviewed merge: TRUE" />
              <Boundary text="ACTIVE requires capacity headroom: TRUE" />
              <Boundary text="Indemnity-proof claim: FALSE" />
            </div>
          </article>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-cyan-200">
                State ledger
              </p>
              <h2 className="mt-3 text-3xl font-black">Canonical counts and public signals</h2>
            </div>
            <p className="text-sm text-white/45">
              Public counts: {publicSignals.sourceState}; canonical counts remain source-controlled.
            </p>
          </div>
          <div className="mt-6 overflow-x-auto rounded-3xl border border-white/10">
            <table className="w-full min-w-[850px] border-collapse text-left text-sm">
              <thead className="bg-white/[0.055] text-white/55">
                <tr>
                  <th className="px-4 py-3">State</th>
                  <th className="px-4 py-3">Canonical</th>
                  <th className="px-4 py-3">Public open signal</th>
                  <th className="px-4 py-3">Order?</th>
                  <th className="px-4 py-3">Uses ACTIVE?</th>
                  <th className="px-4 py-3">Gate</th>
                </tr>
              </thead>
              <tbody>
                {stateMachine.states.map((state) => (
                  <tr key={state.stateId} className="border-t border-white/10">
                    <td className="px-4 py-3 font-mono text-cyan-100">{state.stateId}</td>
                    <td className="px-4 py-3">
                      {eventChain.currentCanonicalCounts[
                        state.stateId as keyof typeof eventChain.currentCanonicalCounts
                      ]}
                    </td>
                    <td className="px-4 py-3">
                      {publicSignals.counts[state.stateId as FardarterStateId] ?? "Unavailable"}
                    </td>
                    <td className="px-4 py-3">{state.countsAsOrder ? "YES" : "NO"}</td>
                    <td className="px-4 py-3">{state.usesActiveCapacity ? "YES" : "NO"}</td>
                    <td className="px-4 py-3 text-white/55">{state.authorityGate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-emerald-200">
              Automated scope
            </p>
            <h2 className="mt-3 text-2xl font-black">Two nonbinding transitions</h2>
            <div className="mt-5 space-y-3">
              {stateMachine.automatedPublicTransitions.map((transition) => (
                <p key={`${transition.fromState}-${transition.toState}`} className="rounded-2xl border border-white/10 p-4 font-mono text-sm">
                  {transition.fromState} → {transition.toState}
                </p>
              ))}
            </div>
          </article>
          <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-rose-200">
              Conflict freeze
            </p>
            <h2 className="mt-3 text-2xl font-black">Canonical mutation stops on contradiction</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {stateMachine.conflictPolicy.types.map((conflict) => (
                <span key={conflict} className="rounded-full border border-rose-200/20 bg-rose-200/[0.055] px-3 py-2 font-mono text-xs text-rose-100">
                  {conflict}
                </span>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-2 break-words text-2xl font-black">{value}</p>
    </article>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid gap-1 border-t border-white/10 pt-4 sm:grid-cols-[150px_1fr]">
      <dt className="text-white/40">{label}</dt>
      <dd className={mono ? "break-all font-mono text-xs text-cyan-100" : "text-white/75"}>{value}</dd>
    </div>
  );
}

function Boundary({ text }: { text: string }) {
  return <p className="rounded-2xl border border-white/10 p-4 text-sm text-white/65">{text}</p>;
}
