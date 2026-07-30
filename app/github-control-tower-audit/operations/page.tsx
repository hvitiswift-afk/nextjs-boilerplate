import type { Metadata } from "next";

import application from "@/receipts/revenue/FARDARTER-DRIVE-CANONICALIZATION-APPLICATION-V6-5.json";
import capacityLedger from "@/receipts/revenue/FARDARTER-DRIVE-CAPACITY-LEDGER-V6-1.json";
import eventChain from "@/receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json";
import stateMachine from "@/receipts/revenue/FARDARTER-DRIVE-STATE-MACHINE-V6-2.json";
import { getPublicStateLedger, type FardarterStateId } from "@/lib/revenue/public-state-ledger";

export const metadata: Metadata = {
  title: "Fardarter Drive v6.5 Operations",
  description: "Current append-only chain, canonical state counts, capacity, signals, and evidence boundaries.",
};

export const dynamic = "force-static";
export const revalidate = 900;

export default async function OperationsPage() {
  const publicSignals = await getPublicStateLedger();
  const capacity = capacityLedger.canonicalCapacity;
  const head = eventChain.events.at(-1);

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <nav className="flex flex-wrap gap-4 border-b border-white/10 pb-5 text-sm text-white/60">
          <a href="/github-control-tower-audit">Audit offer</a>
          <a href="/github-control-tower-audit/canonicalization-application">Applied event</a>
          <a href="/api/revenue/operations">Operations JSON</a>
          <a href="/api/revenue/capacity">Capacity JSON</a>
        </nav>

        <header className="py-14">
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-cyan-200">Fardarter Drive™ v6.5</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-7xl">Append-only operations control tower</h1>
          <p className="mt-6 max-w-4xl text-lg leading-8 text-white/65">
            The chain contains immutable genesis plus one reviewed, noncommercial
            <code> SCOPE_DRAFTED </code> event. Public labels remain signals; every later
            canonical change requires a new reviewed event.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Planning slots" value={String(capacity.totalPlanningSlots)} />
          <Metric label="Effective ACTIVE" value={`${capacity.activeDeliveries}/${capacity.effectiveActiveCeiling}`} />
          <Metric label="Canonical head" value={`#${eventChain.headSequence}`} />
          <Metric label="Business events" value={String(eventChain.canonicalBusinessEventCount)} />
          <Metric label="SCOPE_DRAFTED" value={String(eventChain.currentCanonicalCounts.SCOPE_DRAFTED)} />
          <Metric label="Orders" value={String(capacity.orders)} />
          <Metric label="Settled cash" value="$0" />
          <Metric label="Public signals" value={publicSignals.sourceState} />
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <Panel title="Current chain">
            <Row label="Algorithm" value={eventChain.digestAlgorithm} />
            <Row label="Events" value={String(eventChain.eventCount)} />
            <Row label="Head event" value={head?.eventId ?? "UNKNOWN"} />
            <Row label="Head digest" value={eventChain.headDigest} mono />
            <Row label="Application digest" value={application.applicationDigest} mono />
          </Panel>
          <Panel title="Evidence boundary">
            <Boundary text="Signal creates canonical event: FALSE" />
            <Boundary text="Reviewed event creates order: FALSE" />
            <Boundary text="Reviewed event proves payment: FALSE" />
            <Boundary text="Reviewed event starts paid work: FALSE" />
            <Boundary text="Received cash requires: PAID_SETTLED" />
            <Boundary text="Later changes require a new event: TRUE" />
          </Panel>
        </section>

        <section className="mt-12 overflow-x-auto rounded-3xl border border-white/10">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead className="bg-white/[0.055] text-white/55"><tr><th className="px-4 py-3">State</th><th className="px-4 py-3">Canonical</th><th className="px-4 py-3">Public signal</th><th className="px-4 py-3">Order?</th><th className="px-4 py-3">Uses ACTIVE?</th></tr></thead>
            <tbody>
              {stateMachine.states.map((state) => (
                <tr key={state.stateId} className="border-t border-white/10">
                  <td className="px-4 py-3 font-mono text-cyan-100">{state.stateId}</td>
                  <td className="px-4 py-3">{eventChain.currentCanonicalCounts[state.stateId as keyof typeof eventChain.currentCanonicalCounts]}</td>
                  <td className="px-4 py-3">{publicSignals.counts[state.stateId as FardarterStateId] ?? "Unavailable"}</td>
                  <td className="px-4 py-3">{state.countsAsOrder ? "YES" : "NO"}</td>
                  <td className="px-4 py-3">{state.usesActiveCapacity ? "YES" : "NO"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-5"><p className="text-xs uppercase tracking-[0.18em] text-white/40">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></article>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-7"><h2 className="text-2xl font-black">{title}</h2><div className="mt-6 space-y-3">{children}</div></article>; }
function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) { return <div className="grid gap-1 border-t border-white/10 pt-4 sm:grid-cols-[150px_1fr]"><span className="text-white/40">{label}</span><span className={mono ? "break-all font-mono text-xs text-cyan-100" : "text-white/75"}>{value}</span></div>; }
function Boundary({ text }: { text: string }) { return <p className="rounded-2xl border border-white/10 p-4 text-sm text-white/65">{text}</p>; }
