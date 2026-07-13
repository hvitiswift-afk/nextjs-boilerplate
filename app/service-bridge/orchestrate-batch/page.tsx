"use client";

import { useEffect, useState } from "react";

type Mission = { id: string; title: string; service: string } & Record<string, unknown>;
type BatchResult = {
  orchestratedAt: string;
  summary: {
    total: number;
    valid: number;
    prepare: number;
    hold: number;
    blocked: number;
    planningAllowed: number;
    routeOpeningAllowed: number;
  };
  results: Array<{
    missionId: string;
    readiness: number;
    policy: { decision: "ALLOW_PREPARE" | "HOLD_FOR_APPROVAL" | "BLOCK" };
    route: { planningAllowed: boolean; openingAllowed: boolean; url: string };
    receiptDigest: string;
    nextAction: string;
  }>;
  externalActionCompleted: false;
};

const STORAGE_KEY = "jp-hviti-service-bridge-v2";

export default function BatchOrchestrationPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [result, setResult] = useState<BatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMissions(JSON.parse(raw));
    } catch {
      setError("Could not read the local mission queue.");
    }
  }, []);

  async function runBatch() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/service-bridge/orchestrate-batch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ missions }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Batch orchestration failed.");
      setResult(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Batch orchestration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.3em] text-cyan-200" href="/service-bridge">Service Bridge</a>
          <div className="flex flex-wrap gap-3"><a href="/service-bridge/orchestrate">Orchestrate</a><a href="/service-bridge/control">Control</a><a href="/service-bridge/status">Status</a></div>
        </nav>

        <header className="grid gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-sm text-fuchsia-100">Up to 100 missions per run</p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Batch Orchestration</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">Run validation, policy, route control, receipt hashing, and next-action selection across the entire local mission queue in one operation.</p>
          </div>
          <div className="rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.06] p-6">
            <p className="font-semibold text-cyan-100">Queue boundary</p>
            <p className="mt-3 text-sm leading-6 text-white/60">The batch engine evaluates and prepares. It does not complete any external action.</p>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Local missions", missions.length],
            ["Prepare", result?.summary.prepare ?? 0],
            ["Hold", result?.summary.hold ?? 0],
            ["Blocked", result?.summary.blocked ?? 0],
          ].map(([label, value]) => <article key={String(label)} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"><p className="text-xs uppercase tracking-wider text-white/45">{label}</p><p className="mt-3 text-3xl font-black text-cyan-100">{value}</p></article>)}
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={runBatch} disabled={loading || missions.length === 0} className="rounded-full bg-cyan-200 px-5 py-3 font-bold text-black disabled:opacity-40">{loading ? "Running…" : "Run full queue"}</button>
          <a href="/service-bridge" className="rounded-full border border-white/15 px-5 py-3 font-bold">Edit missions</a>
        </div>

        {error ? <div className="mt-6 rounded-2xl border border-red-300/30 bg-red-300/10 p-4 text-red-100">{error}</div> : null}

        <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-black">Batch results</h2><span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">external action: NO</span></div>
          {!result ? <p className="mt-5 text-white/45">No batch orchestration run yet.</p> : <div className="mt-5 space-y-4">
            {result.results.map((item) => {
              const tone = item.policy.decision === "ALLOW_PREPARE" ? "border-emerald-300/30" : item.policy.decision === "HOLD_FOR_APPROVAL" ? "border-amber-300/30" : "border-red-300/30";
              return <article key={item.missionId} className={`rounded-3xl border bg-black/20 p-5 ${tone}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><h3 className="text-lg font-bold">{item.missionId}</h3><p className="mt-1 text-sm text-white/50">{item.policy.decision}</p></div>
                  <span className="rounded-full bg-cyan-200/10 px-3 py-1 text-sm text-cyan-100">{item.readiness}%</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-black/30 p-3"><p className="text-xs uppercase text-white/40">Planning</p><p className="mt-1 font-bold">{item.route.planningAllowed ? "YES" : "NO"}</p></div>
                  <div className="rounded-2xl bg-black/30 p-3"><p className="text-xs uppercase text-white/40">Route opening</p><p className="mt-1 font-bold">{item.route.openingAllowed ? "YES" : "NO"}</p></div>
                  <div className="rounded-2xl bg-black/30 p-3"><p className="text-xs uppercase text-white/40">Receipt</p><p className="mt-1 truncate font-mono text-xs text-cyan-100">{item.receiptDigest}</p></div>
                </div>
                <p className="mt-4 text-sm leading-6 text-white/70">{item.nextAction}</p>
              </article>;
            })}
          </div>}
        </section>
      </section>
    </main>
  );
}
