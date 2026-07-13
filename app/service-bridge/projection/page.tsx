"use client";

import { useEffect, useState } from "react";

type ChainEvent = Record<string, unknown> & { id: string; missionId: string; type: string; digest: string };
type Projection = {
  projectedAt: string;
  missionId: string | null;
  state: Record<string, unknown>;
  appliedEvents: number;
  ignoredEvents: Array<{ id: string; reason: string }>;
  chainValid: boolean;
  headDigest: string | null;
  closed: boolean;
  externalActionCompleted: false;
};

const EVENT_KEY = "jp-hviti-service-bridge-events-v1";

export default function ProjectionConsolePage() {
  const [events, setEvents] = useState<ChainEvent[]>([]);
  const [projection, setProjection] = useState<Projection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(EVENT_KEY);
      if (raw) setEvents(JSON.parse(raw));
    } catch {
      setError("Could not read the local event chain.");
    }
  }, []);

  async function project() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/service-bridge/events/project", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ events }),
      });
      const data = await response.json();
      if (!response.ok && response.status !== 422) throw new Error(data.error || "Projection failed.");
      setProjection(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Projection failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.3em] text-cyan-200" href="/service-bridge/nexus">Service Bridge Nexus</a>
          <div className="flex flex-wrap gap-3"><a href="/service-bridge/events">Events</a><a href="/service-bridge/receipts">Receipts</a><a href="/service-bridge/status">Status</a></div>
        </nav>

        <header className="grid gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-sm text-fuchsia-100">Verified history → current mission state</p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Projection Console</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">Reconstruct the current mission state from the ordered local event chain, verify chain integrity, and inspect ignored or mismatched events.</p>
          </div>
          <div className="rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.06] p-6">
            <p className="font-semibold text-cyan-100">Projection boundary</p>
            <p className="mt-3 text-sm leading-6 text-white/60">Projection rebuilds local state from history. It does not prove identity, external execution, legal authority, or third-party acceptance.</p>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Events", events.length],
            ["Applied", projection?.appliedEvents ?? 0],
            ["Ignored", projection?.ignoredEvents.length ?? 0],
            ["Chain valid", projection ? (projection.chainValid ? "YES" : "NO") : "—"],
          ].map(([label, value]) => <article key={String(label)} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"><p className="text-xs uppercase tracking-wider text-white/45">{label}</p><p className="mt-3 text-3xl font-black text-cyan-100">{value}</p></article>)}
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={project} disabled={loading || events.length === 0} className="rounded-full bg-cyan-200 px-5 py-3 font-bold text-black disabled:opacity-40">{loading ? "Projecting…" : "Project current state"}</button>
          <button onClick={() => { try { const raw = localStorage.getItem(EVENT_KEY); setEvents(raw ? JSON.parse(raw) : []); setProjection(null); } catch { setError("Could not refresh local events."); } }} className="rounded-full border border-white/15 px-5 py-3 font-bold">Refresh local events</button>
        </div>

        {error ? <div className="mt-6 rounded-2xl border border-red-300/30 bg-red-300/10 p-4 text-red-100">{error}</div> : null}

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">Projected mission</h2>
            <pre className="mt-5 overflow-x-auto rounded-2xl bg-black/30 p-4 text-sm leading-6 text-cyan-100">{projection ? JSON.stringify(projection.state, null, 2) : "No projection run yet."}</pre>
          </article>
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">Projection receipt</h2>
            <pre className="mt-5 overflow-x-auto rounded-2xl bg-black/30 p-4 text-sm leading-6 text-cyan-100">{projection ? JSON.stringify({ missionId: projection.missionId, appliedEvents: projection.appliedEvents, ignoredEvents: projection.ignoredEvents, chainValid: projection.chainValid, headDigest: projection.headDigest, closed: projection.closed, externalActionCompleted: false }, null, 2) : "No projection run yet."}</pre>
          </article>
        </section>
      </section>
    </main>
  );
}
