"use client";

import { useMemo, useState } from "react";

type LifecycleEntryType =
  | "RESOLUTION_CREATED"
  | "PERSISTENCE_PLANNED"
  | "LOCAL_PERSISTENCE_APPLIED"
  | "ROLLBACK_PLANNED"
  | "LOCAL_ROLLBACK_APPLIED";

type LifecycleEntry = {
  schema: "jp-hviti-service-bridge-lifecycle-entry/v1";
  id: string;
  missionId: string;
  type: LifecycleEntryType;
  recordedAt: string;
  actor: string;
  data: Record<string, unknown>;
  previousDigest: string | null;
  digest: string;
  externalActionCompleted: false;
};

const JOURNAL_KEY = "jp-hviti-service-bridge-lifecycle-v1";
const types: LifecycleEntryType[] = [
  "RESOLUTION_CREATED",
  "PERSISTENCE_PLANNED",
  "LOCAL_PERSISTENCE_APPLIED",
  "ROLLBACK_PLANNED",
  "LOCAL_ROLLBACK_APPLIED",
];

export default function LifecycleJournalPage() {
  const [missionId, setMissionId] = useState("");
  const [actor, setActor] = useState("JP");
  const [type, setType] = useState<LifecycleEntryType>("RESOLUTION_CREATED");
  const [dataJson, setDataJson] = useState("{}");
  const [journal, setJournal] = useState<LifecycleEntry[]>([]);
  const [verification, setVerification] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  const parsedData = useMemo(() => {
    try { return JSON.parse(dataJson) as Record<string, unknown>; }
    catch { return null; }
  }, [dataJson]);

  function loadJournal() {
    setError("");
    try {
      const parsed = JSON.parse(localStorage.getItem(JOURNAL_KEY) || "[]");
      if (!Array.isArray(parsed)) throw new Error("Stored lifecycle journal is invalid.");
      setJournal(parsed);
      if (parsed[0]?.missionId) setMissionId(parsed[0].missionId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load journal.");
    }
  }

  async function appendEntry() {
    setError("");
    setVerification(null);
    if (!parsedData) return setError("Data must be valid JSON.");
    try {
      const response = await fetch("/api/service-bridge/lifecycle", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          operation: "append",
          missionId,
          type,
          actor,
          data: parsedData,
          previousEntry: journal.at(-1) ?? null,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Lifecycle append failed.");
      const next = [...journal, payload.entry];
      localStorage.setItem(JOURNAL_KEY, JSON.stringify(next));
      setJournal(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Lifecycle append failed.");
    }
  }

  async function verifyJournal() {
    setError("");
    try {
      const response = await fetch("/api/service-bridge/lifecycle", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ operation: "verify", entries: journal }),
      });
      const payload = await response.json();
      setVerification(payload);
      if (!response.ok) setError("Lifecycle journal verification failed.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Lifecycle verification failed.");
    }
  }

  function clearJournal() {
    localStorage.removeItem(JOURNAL_KEY);
    setJournal([]);
    setVerification(null);
  }

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.3em] text-cyan-200" href="/service-bridge/nexus">Service Bridge Nexus</a>
          <div className="flex flex-wrap gap-3"><a href="/service-bridge/persist">Persist</a><a href="/service-bridge/rollback">Rollback</a><a href="/service-bridge/events">Events</a></div>
        </nav>

        <header className="grid gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-sm text-fuchsia-100">Chained local history</p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Lifecycle Journal</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">Record resolution, persistence, and rollback milestones in a mission-scoped SHA-256 digest chain, then verify ordering and local content integrity.</p>
          </div>
          <div className="rounded-[2rem] border border-amber-300/25 bg-amber-300/[0.08] p-6">
            <p className="font-semibold text-amber-100">Integrity boundary</p>
            <p className="mt-3 text-sm leading-6 text-white/60">This journal is a browser-local deterministic history. It is not a signature, trusted timestamp, notarization, blockchain record, or proof of external execution.</p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">Append lifecycle entry</h2>
            <label className="mt-5 block text-sm text-white/60">Mission ID</label>
            <input value={missionId} onChange={(event) => setMissionId(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3" />
            <label className="mt-5 block text-sm text-white/60">Actor</label>
            <input value={actor} onChange={(event) => setActor(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3" />
            <label className="mt-5 block text-sm text-white/60">Lifecycle type</label>
            <select value={type} onChange={(event) => setType(event.target.value as LifecycleEntryType)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
              {types.map((item) => <option key={item}>{item}</option>)}
            </select>
            <label className="mt-5 block text-sm text-white/60">Data JSON</label>
            <textarea value={dataJson} onChange={(event) => setDataJson(event.target.value)} rows={10} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm" />
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={appendEntry} disabled={!missionId.trim() || !actor.trim() || !parsedData} className="rounded-full bg-cyan-200 px-5 py-3 font-bold text-black disabled:opacity-40">Append entry</button>
              <button onClick={loadJournal} className="rounded-full border border-white/15 px-5 py-3 font-bold">Load local journal</button>
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="text-2xl font-black">Mission lifecycle chain</h2><p className="mt-2 text-sm text-white/45">{journal.length} entries</p></div>
              <div className="flex gap-3"><button onClick={verifyJournal} className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-4 py-2 font-bold text-emerald-100">Verify chain</button><button onClick={clearJournal} className="rounded-full border border-red-300/30 px-4 py-2 text-red-100">Clear local</button></div>
            </div>
            <div className="mt-6 space-y-3">
              {journal.length === 0 ? <p className="text-white/45">No lifecycle entries recorded.</p> : journal.map((entry, index) => (
                <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-black">{index + 1}. {entry.type}</p><p className="text-xs text-white/40">{entry.recordedAt}</p></div>
                  <p className="mt-2 text-sm text-white/55">Actor: {entry.actor}</p>
                  <p className="mt-3 break-all font-mono text-xs text-cyan-100">{entry.digest}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        {verification ? <section className="mt-8 rounded-[2rem] border border-emerald-300/30 bg-emerald-300/[0.08] p-6"><h2 className="text-2xl font-black">Verification receipt</h2><pre className="mt-5 overflow-auto rounded-2xl bg-black/30 p-4 text-xs leading-6 text-emerald-100">{JSON.stringify(verification, null, 2)}</pre></section> : null}
        {error ? <div className="mt-6 rounded-2xl border border-red-300/30 bg-red-300/10 p-4 text-red-100">{error}</div> : null}
      </section>
    </main>
  );
}
