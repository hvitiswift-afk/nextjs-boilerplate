"use client";

import { useMemo, useState } from "react";

type Mission = { id: string; title?: string } & Record<string, unknown>;
type ResolutionPacket = {
  schema: "jp-hviti-service-bridge-resolution/v1";
  missionId: string;
  authority: "snapshot" | "projection" | "manual";
  actor: string;
  reason: string;
  resolvedState: Partial<Mission>;
  mutationApplied: false;
  requiresExplicitPersistence: true;
  externalActionCompleted: false;
};
type PersistencePlan = {
  schema: string;
  plannedAt: string;
  missionId: string;
  expectedConfirmation: string;
  previousMission: Mission;
  nextMission: Mission;
  nextMissions: Mission[];
  storageKey: string;
  mutationApplied: false;
  localPersistenceAllowed: true;
  externalPersistenceAllowed: false;
  externalActionCompleted: false;
};
type LifecycleEntry = Record<string, unknown> & { digest: string; missionId: string };

const STORAGE_KEY = "jp-hviti-service-bridge-v2";
const JOURNAL_KEY = "jp-hviti-service-bridge-lifecycle-v1";

export default function PersistenceConsolePage() {
  const [resolutionJson, setResolutionJson] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [finalConfirmation, setFinalConfirmation] = useState("");
  const [plan, setPlan] = useState<PersistencePlan | null>(null);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [journalStatus, setJournalStatus] = useState("");

  const parsedResolution = useMemo(() => {
    try { return resolutionJson ? JSON.parse(resolutionJson) as ResolutionPacket : null; }
    catch { return null; }
  }, [resolutionJson]);

  async function appendLifecycle(type: "PERSISTENCE_PLANNED" | "LOCAL_PERSISTENCE_APPLIED", missionId: string, actor: string, data: Record<string, unknown>) {
    const journal = JSON.parse(localStorage.getItem(JOURNAL_KEY) || "[]") as LifecycleEntry[];
    const sameMission = journal.filter((entry) => entry.missionId === missionId);
    const previousEntry = sameMission.at(-1) ?? null;
    const response = await fetch("/api/service-bridge/lifecycle", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ operation: "append", missionId, type, actor, data, previousEntry }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Lifecycle journal append failed.");
    const nextJournal = [...journal, payload.entry];
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(nextJournal));
    return payload.entry as LifecycleEntry;
  }

  async function preparePlan() {
    setError("");
    setReceipt(null);
    setJournalStatus("");
    if (!parsedResolution) return setError("Paste a valid resolution packet JSON.");
    setLoading(true);
    try {
      const currentMissions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const response = await fetch("/api/service-bridge/events/persist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ resolution: parsedResolution, currentMissions, confirmation }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Persistence planning failed.");
      setPlan(data);
      setFinalConfirmation("");
      await appendLifecycle("PERSISTENCE_PLANNED", data.missionId, parsedResolution.actor || "JP", {
        persistencePlanSchema: data.schema,
        plannedAt: data.plannedAt,
        storageKey: data.storageKey,
        mutationApplied: false,
        externalActionCompleted: false,
      });
      setJournalStatus("Persistence plan appended to the local lifecycle journal.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Persistence planning failed.");
    } finally {
      setLoading(false);
    }
  }

  async function applyLocalWrite() {
    setError("");
    setJournalStatus("");
    if (!plan) return setError("Create a persistence plan first.");
    const expected = `APPLY LOCAL ${plan.missionId}`;
    if (finalConfirmation.trim() !== expected) return setError(`Final confirmation must exactly equal: ${expected}`);

    try {
      localStorage.setItem(plan.storageKey, JSON.stringify(plan.nextMissions));
      const appliedAt = new Date().toISOString();
      const localReceipt = {
        schema: "jp-hviti-service-bridge-local-persistence-receipt/v1",
        appliedAt,
        missionId: plan.missionId,
        storageKey: plan.storageKey,
        previousMission: plan.previousMission,
        nextMission: plan.nextMission,
        localMutationApplied: true,
        externalPersistenceApplied: false,
        externalActionCompleted: false,
      };
      setReceipt(localReceipt);
      await appendLifecycle("LOCAL_PERSISTENCE_APPLIED", plan.missionId, parsedResolution?.actor || "JP", {
        appliedAt,
        storageKey: plan.storageKey,
        receiptSchema: localReceipt.schema,
        localMutationApplied: true,
        externalPersistenceApplied: false,
        externalActionCompleted: false,
      });
      setJournalStatus("Local persistence application appended to the lifecycle journal.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Local persistence or lifecycle journaling failed.");
    }
  }

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.3em] text-cyan-200" href="/service-bridge/nexus">Service Bridge Nexus</a>
          <div className="flex flex-wrap gap-3"><a href="/service-bridge/resolve">Resolve</a><a href="/service-bridge/lifecycle">Lifecycle</a><a href="/service-bridge">Missions</a></div>
        </nav>

        <header className="grid gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-sm text-fuchsia-100">Two-step local mutation gate</p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Persistence Console</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">Turn an approved resolution packet into a reviewed local persistence plan, require a second exact confirmation, and journal both planning and application.</p>
          </div>
          <div className="rounded-[2rem] border border-amber-300/25 bg-amber-300/[0.08] p-6">
            <p className="font-semibold text-amber-100">Local-only boundary</p>
            <p className="mt-3 text-sm leading-6 text-white/60">This page updates browser storage and its local lifecycle journal only. It cannot write to third-party services or claim external completion.</p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">1. Prepare persistence plan</h2>
            <label className="mt-5 block text-sm text-white/60">Resolution packet JSON</label>
            <textarea value={resolutionJson} onChange={(event) => { setResolutionJson(event.target.value); setPlan(null); setReceipt(null); }} rows={16} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm" placeholder="Paste the resolution packet from the Resolution Console." />
            <label className="mt-5 block text-sm text-white/60">Exact planning confirmation</label>
            <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3" placeholder={parsedResolution ? `PERSIST ${parsedResolution.missionId}` : "PERSIST <mission-id>"} />
            <button onClick={preparePlan} disabled={loading || !parsedResolution} className="mt-5 rounded-full bg-cyan-200 px-5 py-3 font-bold text-black disabled:opacity-40">{loading ? "Planning…" : "Create persistence plan"}</button>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">2. Apply local write</h2>
            {!plan ? <p className="mt-5 text-white/45">No persistence plan created yet.</p> : <div className="mt-5 space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">Mission</p><p className="mt-2 font-black">{plan.missionId}</p></div>
                <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">Local allowed</p><p className="mt-2 font-black">YES</p></div>
                <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">External allowed</p><p className="mt-2 font-black">NO</p></div>
              </div>
              <pre className="max-h-80 overflow-auto rounded-2xl bg-black/30 p-4 text-xs leading-6 text-cyan-100">{JSON.stringify({ previousMission: plan.previousMission, nextMission: plan.nextMission }, null, 2)}</pre>
              <label className="block text-sm text-white/60">Final exact confirmation</label>
              <input value={finalConfirmation} onChange={(event) => setFinalConfirmation(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3" placeholder={`APPLY LOCAL ${plan.missionId}`} />
              <button onClick={applyLocalWrite} className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-5 py-3 font-bold text-emerald-100">Apply local mutation</button>
            </div>}
          </article>
        </section>

        {journalStatus ? <div className="mt-6 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-4 text-cyan-100">{journalStatus}</div> : null}
        {receipt ? <section className="mt-8 rounded-[2rem] border border-emerald-300/30 bg-emerald-300/[0.08] p-6"><h2 className="text-2xl font-black">Local persistence receipt</h2><pre className="mt-5 overflow-auto rounded-2xl bg-black/30 p-4 text-xs leading-6 text-emerald-100">{JSON.stringify(receipt, null, 2)}</pre></section> : null}
        {error ? <div className="mt-6 rounded-2xl border border-red-300/30 bg-red-300/10 p-4 text-red-100">{error}</div> : null}
      </section>
    </main>
  );
}
