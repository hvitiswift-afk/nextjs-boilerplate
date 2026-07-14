"use client";

import { useMemo, useState } from "react";

type Mission = { id: string } & Record<string, unknown>;
type Projection = {
  schema: "jp-hviti-service-bridge-lifecycle-projection/v1";
  missionId: string | null;
  journalValid: boolean;
  state: { persisted: boolean; rolledBack: boolean; unresolvedPlan: boolean };
  externalActionCompleted: false;
};
type ApplyPlan = {
  schema: string;
  plannedAt: string;
  missionId: string;
  expectedConfirmation: string;
  previousMission: Mission;
  nextMission: Mission;
  nextMissions: Mission[];
  storageKey: string;
  projectionMutationAllowed: true;
  projectionMutationApplied: false;
  explicitConfirmationRequired: true;
  localPersistenceAllowed: true;
  externalPersistenceAllowed: false;
  externalActionCompleted: false;
};

const STORAGE_KEY = "jp-hviti-service-bridge-v2";

export default function LifecycleApplyPage() {
  const [projectionJson, setProjectionJson] = useState("");
  const [missionJson, setMissionJson] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [finalConfirmation, setFinalConfirmation] = useState("");
  const [plan, setPlan] = useState<ApplyPlan | null>(null);
  const [receipt, setReceipt] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const projection = useMemo(() => {
    try { return projectionJson ? JSON.parse(projectionJson) as Projection : null; }
    catch { return null; }
  }, [projectionJson]);

  const projectedMission = useMemo(() => {
    try { return missionJson ? JSON.parse(missionJson) as Mission : null; }
    catch { return null; }
  }, [missionJson]);

  async function createPlan() {
    setError("");
    setReceipt(null);
    if (!projection || !projectedMission) return setError("Provide valid projection and mission JSON.");
    setLoading(true);
    try {
      const currentMissions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const response = await fetch("/api/service-bridge/lifecycle/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projection, currentMissions, projectedMission, confirmation }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Projection apply planning failed.");
      setPlan(payload);
      setFinalConfirmation("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Projection apply planning failed.");
    } finally {
      setLoading(false);
    }
  }

  function applyLocalProjection() {
    setError("");
    if (!plan) return setError("Create an application plan first.");
    const expected = `COMMIT PROJECTION ${plan.missionId}`;
    if (finalConfirmation.trim() !== expected) return setError(`Final confirmation must exactly equal: ${expected}`);

    localStorage.setItem(plan.storageKey, JSON.stringify(plan.nextMissions));
    setReceipt({
      schema: "jp-hviti-service-bridge-lifecycle-projection-apply-receipt/v1",
      appliedAt: new Date().toISOString(),
      missionId: plan.missionId,
      previousMission: plan.previousMission,
      nextMission: plan.nextMission,
      projectionMutationApplied: true,
      localPersistenceApplied: true,
      externalPersistenceApplied: false,
      externalActionCompleted: false,
    });
  }

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.3em] text-cyan-200" href="/service-bridge/nexus">Service Bridge Nexus</a>
          <div className="flex flex-wrap gap-3"><a href="/service-bridge/lifecycle-project">Projection</a><a href="/service-bridge/lifecycle">Lifecycle</a><a href="/service-bridge">Missions</a></div>
        </nav>

        <header className="grid gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-sm text-fuchsia-100">Explicitly allowed local projection mutation</p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Projection Apply</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">Convert a valid lifecycle projection and reviewed mission snapshot into a local application plan, then require a second exact confirmation before changing browser storage.</p>
          </div>
          <div className="rounded-[2rem] border border-amber-300/25 bg-amber-300/[0.08] p-6">
            <p className="font-semibold text-amber-100">Permission boundary</p>
            <p className="mt-3 text-sm leading-6 text-white/60">Projection mutation is allowed only locally and only after both exact confirmations. No third-party or external persistence is performed.</p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">1. Create apply plan</h2>
            <label className="mt-5 block text-sm text-white/60">Lifecycle projection JSON</label>
            <textarea value={projectionJson} onChange={(event) => { setProjectionJson(event.target.value); setPlan(null); }} rows={12} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm" />
            <label className="mt-5 block text-sm text-white/60">Reviewed projected mission JSON</label>
            <textarea value={missionJson} onChange={(event) => { setMissionJson(event.target.value); setPlan(null); }} rows={12} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm" />
            <label className="mt-5 block text-sm text-white/60">Exact planning confirmation</label>
            <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3" placeholder={projection?.missionId ? `APPLY PROJECTION ${projection.missionId}` : "APPLY PROJECTION <mission-id>"} />
            <button onClick={createPlan} disabled={loading || !projection || !projectedMission} className="mt-5 rounded-full bg-cyan-200 px-5 py-3 font-bold text-black disabled:opacity-40">{loading ? "Planning…" : "Create application plan"}</button>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">2. Commit local projection</h2>
            {!plan ? <p className="mt-5 text-white/45">No application plan created yet.</p> : <div className="mt-5 space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">Mission</p><p className="mt-2 font-black">{plan.missionId}</p></div>
                <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">Local mutation</p><p className="mt-2 font-black">ALLOWED</p></div>
                <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">External mutation</p><p className="mt-2 font-black">DENIED</p></div>
              </div>
              <pre className="max-h-80 overflow-auto rounded-2xl bg-black/30 p-4 text-xs leading-6 text-cyan-100">{JSON.stringify({ previousMission: plan.previousMission, nextMission: plan.nextMission }, null, 2)}</pre>
              <label className="block text-sm text-white/60">Final exact confirmation</label>
              <input value={finalConfirmation} onChange={(event) => setFinalConfirmation(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3" placeholder={`COMMIT PROJECTION ${plan.missionId}`} />
              <button onClick={applyLocalProjection} className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-5 py-3 font-bold text-emerald-100">Commit local projection</button>
            </div>}
          </article>
        </section>

        {receipt ? <section className="mt-8 rounded-[2rem] border border-emerald-300/30 bg-emerald-300/[0.08] p-6"><h2 className="text-2xl font-black">Projection application receipt</h2><pre className="mt-5 overflow-auto rounded-2xl bg-black/30 p-4 text-xs leading-6 text-emerald-100">{JSON.stringify(receipt, null, 2)}</pre></section> : null}
        {error ? <div className="mt-6 rounded-2xl border border-red-300/30 bg-red-300/10 p-4 text-red-100">{error}</div> : null}
      </section>
    </main>
  );
}
