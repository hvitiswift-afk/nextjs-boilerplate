"use client";

import { useEffect, useMemo, useState } from "react";

type Mission = {
  id: string;
  title: string;
  service: string;
  target: string;
  action: string;
  owner: string;
  state: "draft" | "preflight" | "awaiting-approval" | "ready" | "verified" | "closed";
  priority: number;
  budget: string;
  permission: string;
  evidence: string;
  fallback: string;
  next: string;
  query: string;
  location: string;
  updatedAt: string;
};

type QueueItem = {
  mission: Mission;
  score: number;
  nextAction: string;
  validation: {
    valid: boolean;
    readiness: number;
    verdict: string;
    missing: string[];
    warnings: string[];
    launchUrl: string;
    externalActionCompleted: false;
  };
};

type QueueResponse = {
  analyzedAt: string;
  total: number;
  nextMissionId: string | null;
  byState: Record<string, number>;
  queue: QueueItem[];
  externalActionCompleted: false;
};

type PlanResponse = {
  missionId: string | null;
  generatedAt: string;
  route: string;
  verdict: string;
  readiness: number;
  missing: string[];
  warnings: string[];
  steps: string[];
  approvalGate: { required: boolean; satisfied: boolean };
  externalActionCompleted: false;
};

const STORAGE_KEY = "jp-hviti-service-bridge-v2";

export default function ServiceBridgeControlPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [analysis, setAnalysis] = useState<QueueResponse | null>(null);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
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

  const selected = useMemo(
    () => missions.find((mission) => mission.id === selectedId) ?? null,
    [missions, selectedId],
  );

  async function analyzeQueue() {
    setLoading(true);
    setError("");
    setPlan(null);
    try {
      const response = await fetch("/api/service-bridge/queue", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ missions }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Queue analysis failed.");
      setAnalysis(data);
      if (data.nextMissionId) setSelectedId(data.nextMissionId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Queue analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  async function buildPlan(mission: Mission) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/service-bridge/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(mission),
      });
      const data = await response.json();
      if (!response.ok && response.status !== 422) throw new Error(data.error || "Plan generation failed.");
      setPlan(data);
      setSelectedId(mission.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Plan generation failed.");
    } finally {
      setLoading(false);
    }
  }

  function refreshLocalQueue() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setMissions(raw ? JSON.parse(raw) : []);
      setAnalysis(null);
      setPlan(null);
      setError("");
    } catch {
      setError("Could not refresh the local mission queue.");
    }
  }

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.3em] text-cyan-200" href="/service-bridge">Service Bridge</a>
          <div className="flex flex-wrap gap-3">
            <a href="/api/service-bridge/manifest">Manifest</a>
            <a href="/api/service-bridge/openapi">OpenAPI</a>
            <a href="/">Home</a>
          </div>
        </nav>

        <header className="grid gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-sm text-fuchsia-100">
              Live API-backed operator console
            </p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">XYZ Control</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
              Analyze the local mission queue, rank the next move, generate a controlled plan, and inspect every hold, warning, approval gate, route, and receipt state.
            </p>
          </div>
          <div className="rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.06] p-6">
            <p className="font-semibold text-cyan-100">Control invariant</p>
            <p className="mt-3 text-sm leading-6 text-white/60">
              The console prepares and ranks work. It does not complete purchases, bookings, orders, applications, payments, submissions, messages, or calendar changes.
            </p>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-4">
          {[
            ["Local missions", missions.length],
            ["Analyzed", analysis?.total ?? 0],
            ["Next mission", analysis?.nextMissionId ?? "—"],
            ["External completed", "NO"],
          ].map(([label, value]) => (
            <article key={String(label)} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm uppercase tracking-wider text-white/45">{label}</p>
              <p className="mt-3 break-words text-2xl font-black text-cyan-100">{value}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 flex flex-wrap gap-3">
          <button onClick={analyzeQueue} disabled={loading || missions.length === 0} className="rounded-full bg-cyan-200 px-5 py-3 font-bold text-black disabled:opacity-40">
            {loading ? "Running…" : "Analyze full queue"}
          </button>
          <button onClick={refreshLocalQueue} className="rounded-full border border-white/15 px-5 py-3 font-bold">Refresh local queue</button>
          <a href="/service-bridge" className="rounded-full border border-fuchsia-200/30 px-5 py-3 font-bold text-fuchsia-100">Edit missions</a>
        </section>

        {error ? <div className="mt-6 rounded-2xl border border-red-300/30 bg-red-300/10 p-4 text-red-100">{error}</div> : null}

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-black">Ranked queue</h2>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">server analyzed</span>
            </div>
            <div className="space-y-4">
              {!analysis ? (
                <div className="rounded-3xl border border-dashed border-white/15 p-8 text-center text-white/45">Run queue analysis to populate the control rail.</div>
              ) : analysis.queue.map((item, index) => (
                <article key={item.mission.id} className={`rounded-3xl border p-5 ${selectedId === item.mission.id ? "border-cyan-200/50 bg-cyan-200/[0.06]" : "border-white/10 bg-black/20"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-fuchsia-200/70">Rank {index + 1}</p>
                      <h3 className="mt-1 text-lg font-bold">{item.mission.title}</h3>
                      <p className="mt-1 text-sm text-white/50">{item.mission.service} • {item.validation.verdict} • score {item.score}</p>
                    </div>
                    <span className="rounded-full bg-cyan-200/10 px-3 py-1 text-sm text-cyan-100">{item.validation.readiness}%</span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-white/65">{item.nextAction}</p>
                  {item.validation.missing.length ? <p className="mt-2 text-sm text-amber-200">Missing: {item.validation.missing.join(", ")}</p> : null}
                  {item.validation.warnings.length ? <p className="mt-2 text-sm text-red-200">Warnings: {item.validation.warnings.join(", ")}</p> : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => buildPlan(item.mission)} className="rounded-full border border-cyan-200/30 px-4 py-2 text-sm font-semibold text-cyan-100">Build plan</button>
                    <a href={item.validation.launchUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-fuchsia-200/30 px-4 py-2 text-sm font-semibold text-fuchsia-100">Open official route</a>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">Execution plan</h2>
            {!plan ? (
              <p className="mt-5 text-white/50">Select a ranked mission and build its plan.</p>
            ) : (
              <div className="mt-5 space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">Verdict</p><p className="mt-2 font-bold text-cyan-100">{plan.verdict}</p></div>
                  <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">Readiness</p><p className="mt-2 font-bold text-cyan-100">{plan.readiness}%</p></div>
                  <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">Approval required</p><p className="mt-2 font-bold">{plan.approvalGate.required ? "YES" : "NO"}</p></div>
                  <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">Approval satisfied</p><p className="mt-2 font-bold">{plan.approvalGate.satisfied ? "YES" : "NO"}</p></div>
                </div>
                <ol className="space-y-3">
                  {plan.steps.map((step, index) => <li key={step} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6"><span className="mr-2 font-bold text-fuchsia-200">{index + 1}.</span>{step}</li>)}
                </ol>
                <pre className="overflow-x-auto rounded-2xl bg-black/35 p-4 text-xs leading-5 text-cyan-100">{JSON.stringify({ selectedMission: selected, plan }, null, 2)}</pre>
              </div>
            )}
          </aside>
        </section>
      </section>
    </main>
  );
}
