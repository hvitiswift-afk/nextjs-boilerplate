"use client";

import { useEffect, useMemo, useState } from "react";

type Mission = { id: string; title: string; service: string } & Record<string, unknown>;
type ChainEvent = Record<string, unknown> & { id: string; missionId: string };
type Authority = "snapshot" | "projection" | "manual";
type Resolution = {
  schema: string;
  resolvedAt: string;
  missionId: string;
  authority: Authority;
  actor: string;
  reason: string;
  chainValid: boolean;
  differencesReviewed: Array<{ field: string; snapshotValue: unknown; projectedValue: unknown }>;
  previousSnapshot: Mission;
  projectedState: Record<string, unknown>;
  resolvedState: Record<string, unknown>;
  mutationApplied: false;
  requiresExplicitPersistence: true;
  externalActionCompleted: false;
};

const MISSION_KEY = "jp-hviti-service-bridge-v2";
const EVENT_KEY = "jp-hviti-service-bridge-events-v1";

export default function ResolutionConsolePage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [events, setEvents] = useState<ChainEvent[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [authority, setAuthority] = useState<Authority>("projection");
  const [actor, setActor] = useState("JP");
  const [reason, setReason] = useState("");
  const [manualState, setManualState] = useState("{}");
  const [result, setResult] = useState<Resolution | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const loadedMissions = JSON.parse(localStorage.getItem(MISSION_KEY) || "[]");
      const loadedEvents = JSON.parse(localStorage.getItem(EVENT_KEY) || "[]");
      setMissions(loadedMissions);
      setEvents(loadedEvents);
      if (loadedMissions[0]) setSelectedId(loadedMissions[0].id);
    } catch {
      setError("Could not load local missions or events.");
    }
  }, []);

  const snapshot = useMemo(() => missions.find((mission) => mission.id === selectedId) ?? null, [missions, selectedId]);
  const missionEvents = useMemo(() => events.filter((event) => event.missionId === selectedId), [events, selectedId]);

  async function resolve() {
    if (!snapshot) return;
    setLoading(true);
    setError("");
    try {
      const parsedManualState = authority === "manual" ? JSON.parse(manualState) : undefined;
      const response = await fetch("/api/service-bridge/events/resolve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ snapshot, events: missionEvents, authority, actor, reason, manualState: parsedManualState }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Resolution failed.");
      setResult(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Resolution failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.3em] text-cyan-200" href="/service-bridge/nexus">Service Bridge Nexus</a>
          <div className="flex flex-wrap gap-3"><a href="/service-bridge/reconcile">Reconcile</a><a href="/service-bridge/projection">Projection</a><a href="/service-bridge/events">Events</a></div>
        </nav>

        <header className="grid gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-sm text-fuchsia-100">Explicit authority decision</p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Resolution Console</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">Choose snapshot, projection, or manual authority and generate a formal resolution packet without automatically mutating the stored mission.</p>
          </div>
          <div className="rounded-[2rem] border border-amber-300/25 bg-amber-300/[0.08] p-6">
            <p className="font-semibold text-amber-100">Persistence boundary</p>
            <p className="mt-3 text-sm leading-6 text-white/60">This console prepares a resolution packet only. Applying the resolved state requires a separate explicit persistence action.</p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">Authority input</h2>
            <label className="mt-5 block text-sm text-white/60">Mission</label>
            <select value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setResult(null); }} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
              <option value="">Select a mission</option>
              {missions.map((mission) => <option key={mission.id} value={mission.id}>{mission.title} — {mission.service}</option>)}
            </select>

            <label className="mt-5 block text-sm text-white/60">Authority</label>
            <select value={authority} onChange={(event) => setAuthority(event.target.value as Authority)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
              <option value="snapshot">Snapshot</option>
              <option value="projection">Projection</option>
              <option value="manual">Manual</option>
            </select>

            <label className="mt-5 block text-sm text-white/60">Actor</label>
            <input value={actor} onChange={(event) => setActor(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3" />

            <label className="mt-5 block text-sm text-white/60">Reason</label>
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3" placeholder="Explain why this authority source should govern." />

            {authority === "manual" ? <><label className="mt-5 block text-sm text-white/60">Manual state JSON</label><textarea value={manualState} onChange={(event) => setManualState(event.target.value)} rows={8} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm" /></> : null}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">Snapshot</p><p className="mt-2 font-bold">{snapshot ? "FOUND" : "MISSING"}</p></div>
              <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">Events</p><p className="mt-2 font-bold">{missionEvents.length}</p></div>
            </div>

            <button onClick={resolve} disabled={!snapshot || !reason.trim() || !actor.trim() || loading} className="mt-5 rounded-full bg-cyan-200 px-5 py-3 font-bold text-black disabled:opacity-40">{loading ? "Resolving…" : "Create resolution packet"}</button>
          </aside>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-black">Resolution packet</h2><span className="rounded-full bg-black/20 px-3 py-1 text-xs text-white/60">mutation applied: NO</span></div>
            {!result ? <p className="mt-5 text-white/45">No resolution packet created yet.</p> : <div className="mt-5 space-y-5">
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">Authority</p><p className="mt-2 font-black">{result.authority.toUpperCase()}</p></div>
                <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">Chain valid</p><p className="mt-2 font-black">{result.chainValid ? "YES" : "NO"}</p></div>
                <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">Differences</p><p className="mt-2 font-black">{result.differencesReviewed.length}</p></div>
                <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">Persistence</p><p className="mt-2 font-black">REQUIRED</p></div>
              </div>
              <pre className="overflow-x-auto rounded-2xl bg-black/30 p-4 text-sm leading-6 text-cyan-100">{JSON.stringify(result, null, 2)}</pre>
            </div>}
          </section>
        </section>

        {error ? <div className="mt-6 rounded-2xl border border-red-300/30 bg-red-300/10 p-4 text-red-100">{error}</div> : null}
      </section>
    </main>
  );
}
