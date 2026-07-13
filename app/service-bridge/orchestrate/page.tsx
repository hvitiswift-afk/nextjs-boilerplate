"use client";

import { useEffect, useMemo, useState } from "react";

type Mission = { id: string; title: string; service: string } & Record<string, unknown>;
type OrchestrationResult = {
  orchestratedAt: string;
  missionId: string | null;
  readiness: number;
  validation: Record<string, unknown>;
  policy: {
    decision: "ALLOW_PREPARE" | "HOLD_FOR_APPROVAL" | "BLOCK";
    reasons: string[];
    requiredApprovals: string[];
    safeguards: string[];
    nextAction: string;
    externalActionCompleted: false;
  };
  route: {
    url: string;
    planningAllowed: boolean;
    openingAllowed: boolean;
    externalActionCompleted: false;
  };
  receipt: {
    integrity?: { digest?: string; algorithm?: string };
  };
  nextAction: string;
  externalActionCompleted: false;
};

const STORAGE_KEY = "jp-hviti-service-bridge-v2";

export default function OrchestrationConsolePage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [result, setResult] = useState<OrchestrationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Mission[];
      setMissions(parsed);
      if (parsed[0]) setSelectedId(parsed[0].id);
    } catch {
      setError("Could not read the local mission queue.");
    }
  }, []);

  const mission = useMemo(
    () => missions.find((item) => item.id === selectedId) ?? null,
    [missions, selectedId],
  );

  async function orchestrate() {
    if (!mission) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/service-bridge/orchestrate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(mission),
      });
      const data = await response.json();
      if (!response.ok && response.status !== 422) throw new Error(data.error || "Orchestration failed.");
      setResult(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Orchestration failed.");
    } finally {
      setLoading(false);
    }
  }

  const decisionTone = result?.policy.decision === "ALLOW_PREPARE"
    ? "border-emerald-300/30 bg-emerald-300/[0.08]"
    : result?.policy.decision === "HOLD_FOR_APPROVAL"
      ? "border-amber-300/30 bg-amber-300/[0.08]"
      : result?.policy.decision === "BLOCK"
        ? "border-red-300/30 bg-red-300/[0.08]"
        : "border-white/10 bg-white/[0.04]";

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.3em] text-cyan-200" href="/service-bridge">Service Bridge</a>
          <div className="flex flex-wrap gap-3"><a href="/service-bridge/policy">Policy</a><a href="/service-bridge/control">Control</a><a href="/service-bridge/status">Status</a></div>
        </nav>

        <header className="grid gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-sm text-fuchsia-100">Validate → policy → route → receipt → next action</p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Orchestration Console</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">Run the complete mission decision pipeline in one step and inspect readiness, policy, route permissions, integrity receipt, and the next permitted action.</p>
          </div>
          <div className="rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.06] p-6">
            <p className="font-semibold text-cyan-100">Execution boundary</p>
            <p className="mt-3 text-sm leading-6 text-white/60">The orchestrator evaluates and prepares. It does not submit, send, pay, order, book, apply, or complete any external action.</p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">Mission input</h2>
            <select className="mt-5 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
              <option value="">Select a mission</option>
              {missions.map((item) => <option key={item.id} value={item.id}>{item.title} — {item.service}</option>)}
            </select>
            {mission ? <pre className="mt-5 overflow-x-auto rounded-2xl bg-black/30 p-4 text-xs leading-5 text-cyan-100">{JSON.stringify(mission, null, 2)}</pre> : <p className="mt-5 text-white/45">No mission selected.</p>}
            <button onClick={orchestrate} disabled={!mission || loading} className="mt-5 rounded-full bg-cyan-200 px-5 py-3 font-bold text-black disabled:opacity-40">{loading ? "Running…" : "Run orchestration"}</button>
          </aside>

          <section className={`rounded-[2rem] border p-6 ${decisionTone}`}>
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-black">Pipeline result</h2><span className="rounded-full bg-black/20 px-3 py-1 text-xs text-white/60">external action: NO</span></div>
            {!result ? <p className="mt-5 text-white/45">No orchestration result yet.</p> : <div className="mt-5 space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-black/20 p-4"><p className="text-xs uppercase text-white/40">Readiness</p><p className="mt-2 text-2xl font-black text-cyan-100">{result.readiness}%</p></div>
                <div className="rounded-2xl bg-black/20 p-4"><p className="text-xs uppercase text-white/40">Decision</p><p className="mt-2 font-black">{result.policy.decision}</p></div>
                <div className="rounded-2xl bg-black/20 p-4"><p className="text-xs uppercase text-white/40">Planning allowed</p><p className="mt-2 font-black">{result.route.planningAllowed ? "YES" : "NO"}</p></div>
                <div className="rounded-2xl bg-black/20 p-4"><p className="text-xs uppercase text-white/40">Route opening allowed</p><p className="mt-2 font-black">{result.route.openingAllowed ? "YES" : "NO"}</p></div>
              </div>

              <div><h3 className="font-bold text-cyan-100">Policy reasons</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-white/70">{result.policy.reasons.map((item) => <li key={item} className="rounded-2xl bg-black/20 p-3">{item}</li>)}</ul></div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-4"><p className="text-xs uppercase tracking-wider text-white/40">Next permitted action</p><p className="mt-2 leading-7 text-white/80">{result.nextAction}</p></div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-wider text-white/40">Integrity receipt</p>
                <p className="mt-2 text-sm text-white/60">{result.receipt.integrity?.algorithm || "SHA-256"}</p>
                <p className="mt-2 break-all font-mono text-xs text-cyan-100">{result.receipt.integrity?.digest || "No digest"}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {result.route.openingAllowed ? <a href={result.route.url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-cyan-200/30 px-5 py-3 font-bold text-cyan-100">Open official route</a> : null}
                <a href="/service-bridge/receipts" className="rounded-full border border-fuchsia-200/30 px-5 py-3 font-bold text-fuchsia-100">Inspect receipts</a>
                <a href="/service-bridge/events" className="rounded-full border border-white/15 px-5 py-3 font-bold">Record event</a>
              </div>
            </div>}
          </section>
        </section>

        {error ? <div className="mt-6 rounded-2xl border border-red-300/30 bg-red-300/10 p-4 text-red-100">{error}</div> : null}
      </section>
    </main>
  );
}
