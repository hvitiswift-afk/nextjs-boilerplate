"use client";

import { useMemo, useState } from "react";

type Mission = { id: string; title?: string } & Record<string, unknown>;
type LocalPersistenceReceipt = {
  schema: "jp-hviti-service-bridge-local-persistence-receipt/v1";
  missionId: string;
  storageKey: string;
  previousMission: Mission;
  nextMission: Mission;
  localMutationApplied: true;
  externalPersistenceApplied: false;
  externalActionCompleted: false;
};
type RollbackPlan = {
  schema: string;
  plannedAt: string;
  missionId: string;
  expectedConfirmation: string;
  currentMission: Mission;
  rollbackMission: Mission;
  rollbackMissions: Mission[];
  storageKey: string;
  rollbackApplied: false;
  localRollbackAllowed: true;
  externalRollbackAllowed: false;
  externalActionCompleted: false;
};

const STORAGE_KEY = "jp-hviti-service-bridge-v2";

export default function RollbackConsolePage() {
  const [receiptJson, setReceiptJson] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [finalConfirmation, setFinalConfirmation] = useState("");
  const [plan, setPlan] = useState<RollbackPlan | null>(null);
  const [receipt, setReceipt] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const parsedReceipt = useMemo(() => {
    try { return receiptJson ? JSON.parse(receiptJson) as LocalPersistenceReceipt : null; }
    catch { return null; }
  }, [receiptJson]);

  async function prepareRollback() {
    setError("");
    setReceipt(null);
    if (!parsedReceipt) return setError("Paste a valid local persistence receipt JSON.");
    setLoading(true);
    try {
      const currentMissions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const response = await fetch("/api/service-bridge/events/rollback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ receipt: parsedReceipt, currentMissions, confirmation }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Rollback planning failed.");
      setPlan(data);
      setFinalConfirmation("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Rollback planning failed.");
    } finally {
      setLoading(false);
    }
  }

  function applyRollback() {
    setError("");
    if (!plan) return setError("Create a rollback plan first.");
    const expected = `APPLY ROLLBACK ${plan.missionId}`;
    if (finalConfirmation.trim() !== expected) return setError(`Final confirmation must exactly equal: ${expected}`);

    localStorage.setItem(plan.storageKey, JSON.stringify(plan.rollbackMissions));
    setReceipt({
      schema: "jp-hviti-service-bridge-local-rollback-receipt/v1",
      appliedAt: new Date().toISOString(),
      missionId: plan.missionId,
      storageKey: plan.storageKey,
      previousCurrentMission: plan.currentMission,
      restoredMission: plan.rollbackMission,
      localRollbackApplied: true,
      externalRollbackApplied: false,
      externalActionCompleted: false,
    });
  }

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.3em] text-cyan-200" href="/service-bridge/nexus">Service Bridge Nexus</a>
          <div className="flex flex-wrap gap-3"><a href="/service-bridge/persist">Persist</a><a href="/service-bridge/resolve">Resolve</a><a href="/service-bridge">Missions</a></div>
        </nav>

        <header className="grid gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-sm text-fuchsia-100">Two-step local restore gate</p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Rollback Console</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">Turn a local persistence receipt into a reviewed rollback plan, then require a second exact confirmation before restoring the previous mission snapshot.</p>
          </div>
          <div className="rounded-[2rem] border border-amber-300/25 bg-amber-300/[0.08] p-6">
            <p className="font-semibold text-amber-100">Rollback boundary</p>
            <p className="mt-3 text-sm leading-6 text-white/60">Rollback affects browser-local mission storage only. It does not reverse any third-party action or external system change.</p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">1. Prepare rollback plan</h2>
            <label className="mt-5 block text-sm text-white/60">Local persistence receipt JSON</label>
            <textarea value={receiptJson} onChange={(event) => { setReceiptJson(event.target.value); setPlan(null); setReceipt(null); }} rows={16} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm" placeholder="Paste the local persistence receipt from the Persistence Console." />
            <label className="mt-5 block text-sm text-white/60">Exact rollback planning confirmation</label>
            <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3" placeholder={parsedReceipt ? `ROLLBACK LOCAL ${parsedReceipt.missionId}` : "ROLLBACK LOCAL <mission-id>"} />
            <button onClick={prepareRollback} disabled={loading || !parsedReceipt} className="mt-5 rounded-full bg-cyan-200 px-5 py-3 font-bold text-black disabled:opacity-40">{loading ? "Planning…" : "Create rollback plan"}</button>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">2. Apply local restore</h2>
            {!plan ? <p className="mt-5 text-white/45">No rollback plan created yet.</p> : <div className="mt-5 space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">Mission</p><p className="mt-2 font-black">{plan.missionId}</p></div>
                <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">Local rollback</p><p className="mt-2 font-black">ALLOWED</p></div>
                <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">External rollback</p><p className="mt-2 font-black">DENIED</p></div>
              </div>
              <pre className="max-h-80 overflow-auto rounded-2xl bg-black/30 p-4 text-xs leading-6 text-cyan-100">{JSON.stringify({ currentMission: plan.currentMission, rollbackMission: plan.rollbackMission }, null, 2)}</pre>
              <label className="block text-sm text-white/60">Final exact confirmation</label>
              <input value={finalConfirmation} onChange={(event) => setFinalConfirmation(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3" placeholder={`APPLY ROLLBACK ${plan.missionId}`} />
              <button onClick={applyRollback} className="rounded-full border border-amber-300/40 bg-amber-300/10 px-5 py-3 font-bold text-amber-100">Apply local rollback</button>
            </div>}
          </article>
        </section>

        {receipt ? <section className="mt-8 rounded-[2rem] border border-emerald-300/30 bg-emerald-300/[0.08] p-6"><h2 className="text-2xl font-black">Local rollback receipt</h2><pre className="mt-5 overflow-auto rounded-2xl bg-black/30 p-4 text-xs leading-6 text-emerald-100">{JSON.stringify(receipt, null, 2)}</pre></section> : null}
        {error ? <div className="mt-6 rounded-2xl border border-red-300/30 bg-red-300/10 p-4 text-red-100">{error}</div> : null}
      </section>
    </main>
  );
}
