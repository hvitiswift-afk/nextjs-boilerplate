"use client";

import { useEffect, useMemo, useState } from "react";

type Mission = { id: string; title: string; service: string } & Record<string, unknown>;
type ChainEvent = Record<string, unknown> & { id: string; missionId: string };
type Reconciliation = {
  reconciledAt: string;
  missionId: string | null;
  consistent: boolean;
  chainValid: boolean;
  differences: Array<{ field: string; snapshotValue: unknown; projectedValue: unknown }>;
  projectedState: Record<string, unknown>;
  snapshot: Mission;
  appliedEvents: number;
  ignoredEvents: Array<{ id: string; reason: string }>;
  headDigest: string | null;
  recommendedAction: string;
  externalActionCompleted: false;
};

const MISSION_KEY = "jp-hviti-service-bridge-v2";
const EVENT_KEY = "jp-hviti-service-bridge-events-v1";

export default function ReconciliationConsolePage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [events, setEvents] = useState<ChainEvent[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [result, setResult] = useState<Reconciliation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const missionRaw = localStorage.getItem(MISSION_KEY);
      const eventRaw = localStorage.getItem(EVENT_KEY);
      const parsedMissions = missionRaw ? JSON.parse(missionRaw) : [];
      const parsedEvents = eventRaw ? JSON.parse(eventRaw) : [];
      setMissions(parsedMissions);
      setEvents(parsedEvents);
      if (parsedMissions[0]) setSelectedId(parsedMissions[0].id);
    } catch {
      setError("Could not load local mission or event data.");
    }
  }, []);

  const snapshot = useMemo(
    () => missions.find((mission) => mission.id === selectedId) ?? null,
    [missions, selectedId],
  );

  const missionEvents = useMemo(
    () => events.filter((event) => event.missionId === selectedId),
    [events, selectedId],
  );

  async function reconcile() {
    if (!snapshot) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/service-bridge/events/reconcile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ snapshot, events: missionEvents }),
      });
      const data = await response.json();
      if (!response.ok && response.status !== 409) throw new Error(data.error || "Reconciliation failed.");
      setResult(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Reconciliation failed.");
    } finally {
      setLoading(false);
    }
  }

  const tone = result?.consistent
    ? "border-emerald-300/30 bg-emerald-300/[0.08]"
    : result
      ? "border-amber-300/30 bg-amber-300/[0.08]"
      : "border-white/10 bg-white/[0.04]";

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.3em] text-cyan-200" href="/service-bridge/nexus">Service Bridge Nexus</a>
          <div className="flex flex-wrap gap-3"><a href="/service-bridge/projection">Projection</a><a href="/service-bridge/events">Events</a><a href="/service-bridge/status">Status</a></div>
        </nav>

        <header className="grid gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-sm text-fuchsia-100">Snapshot ↔ verified history</p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Reconciliation Console</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">Compare the current saved mission snapshot against the state reconstructed from its verified event chain and surface every field-level conflict.</p>
          </div>
          <div className="rounded-[2rem] border border-amber-300/25 bg-amber-300/[0.08] p-6">
            <p className="font-semibold text-amber-100">Authority boundary</p>
            <p className="mt-3 text-sm leading-6 text-white/60">The console never silently overwrites either record. Conflicts remain visible until an explicit authority decision is made.</p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">Mission selection</h2>
            <select className="mt-5 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3" value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setResult(null); }}>
              <option value="">Select a mission</option>
              {missions.map((mission) => <option key={mission.id} value={mission.id}>{mission.title} — {mission.service}</option>)}
            </select>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">Snapshot</p><p className="mt-2 font-bold">{snapshot ? "FOUND" : "MISSING"}</p></div>
              <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">Events</p><p className="mt-2 font-bold">{missionEvents.length}</p></div>
            </div>
            <button onClick={reconcile} disabled={!snapshot || loading} className="mt-5 rounded-full bg-cyan-200 px-5 py-3 font-bold text-black disabled:opacity-40">{loading ? "Reconciling…" : "Reconcile records"}</button>
          </aside>

          <section className={`rounded-[2rem] border p-6 ${tone}`}>
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-black">Reconciliation result</h2><span className="rounded-full bg-black/20 px-3 py-1 text-xs text-white/60">external action: NO</span></div>
            {!result ? <p className="mt-5 text-white/45">No reconciliation run yet.</p> : <div className="mt-5 space-y-6">
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-black/20 p-4"><p className="text-xs uppercase text-white/40">Consistent</p><p className="mt-2 text-2xl font-black">{result.consistent ? "YES" : "NO"}</p></div>
                <div className="rounded-2xl bg-black/20 p-4"><p className="text-xs uppercase text-white/40">Chain valid</p><p className="mt-2 text-2xl font-black">{result.chainValid ? "YES" : "NO"}</p></div>
                <div className="rounded-2xl bg-black/20 p-4"><p className="text-xs uppercase text-white/40">Differences</p><p className="mt-2 text-2xl font-black">{result.differences.length}</p></div>
                <div className="rounded-2xl bg-black/20 p-4"><p className="text-xs uppercase text-white/40">Applied events</p><p className="mt-2 text-2xl font-black">{result.appliedEvents}</p></div>
              </div>

              <div><h3 className="font-bold text-cyan-100">Recommended action</h3><p className="mt-3 rounded-2xl bg-black/20 p-4 leading-7 text-white/75">{result.recommendedAction}</p></div>

              <div><h3 className="font-bold text-cyan-100">Field differences</h3><div className="mt-3 space-y-3">{result.differences.length ? result.differences.map((difference) => <article key={difference.field} className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="font-bold text-fuchsia-100">{difference.field}</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><pre className="overflow-x-auto rounded-xl bg-black/30 p-3 text-xs text-white/65">Snapshot: {JSON.stringify(difference.snapshotValue, null, 2)}</pre><pre className="overflow-x-auto rounded-xl bg-black/30 p-3 text-xs text-cyan-100">Projected: {JSON.stringify(difference.projectedValue, null, 2)}</pre></div></article>) : <p className="rounded-2xl bg-black/20 p-4 text-white/60">No field differences.</p>}</div></div>
            </div>}
          </section>
        </section>

        {error ? <div className="mt-6 rounded-2xl border border-red-300/30 bg-red-300/10 p-4 text-red-100">{error}</div> : null}
      </section>
    </main>
  );
}
