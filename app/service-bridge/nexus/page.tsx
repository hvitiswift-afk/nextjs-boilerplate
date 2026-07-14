"use client";

import { useEffect, useState } from "react";

type Manifest = {
  version: number;
  mode: string;
  limits: Record<string, number>;
  orchestration: { stages: string[]; modes: string[]; externalActionCompleted: false };
  recovery: {
    stages: string[];
    explicitProjectionMutationAllowed: boolean;
    automaticProjectionMutationAllowed: boolean;
    externalActionCompleted: false;
  };
  lifecycleProjection?: {
    readOnlyProjection: boolean;
    derivesPersistedState: boolean;
    derivesRollbackState: boolean;
    detectsUnresolvedPlans: boolean;
    externalActionCompleted: false;
  };
  lifecycleProjectionApply?: {
    localMutationAllowed: boolean;
    automaticMutationAllowed: boolean;
    planningConfirmationPattern: string;
    commitConfirmationPattern: string;
    externalPersistenceAllowed: boolean;
    externalActionCompleted: false;
  };
  endpoints: Record<string, string>;
};

type Health = {
  status: string;
  checkedAt: string;
  checks: Record<string, string | number | boolean>;
  externalActionCompleted: false;
};

const surfaces = [
  ["Mission Editor", "/service-bridge", "Create, edit, import, export, filter, and launch controlled service routes."],
  ["Policy Console", "/service-bridge/policy", "Classify missions as prepare, approval hold, or block."],
  ["Orchestration", "/service-bridge/orchestrate", "Run the complete single-mission decision pipeline."],
  ["Batch Orchestration", "/service-bridge/orchestrate-batch", "Evaluate the entire local mission queue in one operation."],
  ["Control Console", "/service-bridge/control", "Rank the queue and generate controlled route plans."],
  ["Receipt Console", "/service-bridge/receipts", "Create and verify deterministic mission integrity receipts."],
  ["Event Chain", "/service-bridge/events", "Record and verify ordered mission-history events."],
  ["Event Projection", "/service-bridge/projection", "Project mission state from verified event history."],
  ["Reconciliation", "/service-bridge/reconcile", "Compare current snapshots with projected event state."],
  ["Authority Resolution", "/service-bridge/resolve", "Explicitly choose snapshot, projection, or manual authority."],
  ["Persistence", "/service-bridge/persist", "Plan and explicitly apply browser-local mission persistence."],
  ["Rollback", "/service-bridge/rollback", "Plan and explicitly restore a prior browser-local mission snapshot."],
  ["Lifecycle Journal", "/service-bridge/lifecycle", "Append, inspect, and verify mission-scoped lifecycle entries."],
  ["Lifecycle Projection", "/service-bridge/lifecycle-project", "Derive persisted, rolled-back, and unresolved-plan state from a journal."],
  ["Projection Apply", "/service-bridge/lifecycle-apply", "Create and explicitly commit a reviewed local projection application."],
  ["System Status", "/service-bridge/status", "Inspect health, services, capabilities, endpoints, and receipts."],
] as const;

export default function ServiceBridgeNexusPage() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState("");

  async function refresh() {
    setError("");
    try {
      const [manifestResponse, healthResponse] = await Promise.all([
        fetch("/api/service-bridge/manifest", { cache: "no-store" }),
        fetch("/api/service-bridge/health", { cache: "no-store" }),
      ]);
      const [manifestData, healthData] = await Promise.all([
        manifestResponse.json(),
        healthResponse.json(),
      ]);
      if (!manifestResponse.ok) throw new Error("Manifest unavailable.");
      setManifest(manifestData);
      setHealth(healthData);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nexus refresh failed.");
    }
  }

  useEffect(() => { void refresh(); }, []);

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.3em] text-cyan-200" href="/service-bridge">Service Bridge</a>
          <div className="flex flex-wrap gap-3"><a href="/api/service-bridge/manifest">Manifest</a><a href="/api/service-bridge/openapi">OpenAPI</a><a href="/">Home</a></div>
        </nav>

        <header className="grid gap-8 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-sm text-fuchsia-100">Permanent operational entry point</p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Service Bridge Nexus</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">One command map for mission control, orchestration, integrity, recovery, lifecycle projection, and explicitly confirmed local application.</p>
          </div>
          <div className={`rounded-[2rem] border p-6 ${health?.status === "healthy" ? "border-emerald-300/30 bg-emerald-300/[0.08]" : "border-amber-300/30 bg-amber-300/[0.08]"}`}>
            <p className="text-xs uppercase tracking-wider text-white/45">Runtime state</p>
            <p className="mt-3 text-3xl font-black">{health?.status?.toUpperCase() || "CHECKING"}</p>
            <p className="mt-2 text-sm text-white/60">Manifest v{manifest?.version ?? "—"} • External action completed: NO</p>
            <button onClick={refresh} className="mt-4 rounded-full border border-white/15 px-4 py-2 text-sm font-bold">Refresh</button>
          </div>
        </header>

        {error ? <div className="mb-8 rounded-2xl border border-red-300/30 bg-red-300/10 p-4 text-red-100">{error}</div> : null}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Manifest", manifest?.version ?? "—"],
            ["Modes", manifest?.orchestration?.modes?.join(" + ") ?? "—"],
            ["Orchestration", manifest?.orchestration?.stages?.length ?? "—"],
            ["Recovery", manifest?.recovery?.stages?.length ?? "—"],
            ["Endpoints", manifest ? Object.keys(manifest.endpoints).length : "—"],
          ].map(([label, value]) => <article key={String(label)} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"><p className="text-xs uppercase tracking-wider text-white/45">{label}</p><p className="mt-3 break-words text-2xl font-black text-cyan-100">{value}</p></article>)}
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {surfaces.map(([title, href, description], index) => <a key={href} href={href} className="group rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 transition hover:border-cyan-200/40 hover:bg-cyan-200/[0.06]"><p className="text-xs uppercase tracking-[0.2em] text-fuchsia-200/70">Rail {String(index + 1).padStart(2, "0")}</p><h2 className="mt-3 text-2xl font-black group-hover:text-cyan-100">{title}</h2><p className="mt-4 leading-7 text-white/60">{description}</p><p className="mt-6 text-sm font-bold text-cyan-100">Open rail →</p></a>)}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"><h2 className="text-2xl font-black">Orchestration law</h2><div className="mt-5 flex flex-wrap gap-2">{manifest?.orchestration?.stages?.map((stage, index) => <span key={stage} className="rounded-full border border-cyan-200/20 bg-cyan-200/[0.06] px-4 py-2 text-sm text-cyan-100">{index + 1}. {stage}</span>)}</div><p className="mt-5 text-sm leading-6 text-white/60">Single and batch modes share validation, policy, route-control, receipt, and next-action boundaries.</p></article>
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"><h2 className="text-2xl font-black">Projection permission</h2><p className="mt-5 leading-7 text-white/65">Local projection mutation: <strong>{manifest?.recovery?.explicitProjectionMutationAllowed ? "EXPLICITLY ALLOWED" : "NOT ALLOWED"}</strong></p><p className="mt-3 text-sm text-white/55">Automatic projection mutation: {manifest?.recovery?.automaticProjectionMutationAllowed ? "ALLOWED" : "DISALLOWED"}</p><p className="mt-3 text-sm text-white/55">Required gates: {manifest?.lifecycleProjectionApply?.planningConfirmationPattern ?? "—"} → {manifest?.lifecycleProjectionApply?.commitConfirmationPattern ?? "—"}</p></article>
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"><h2 className="text-2xl font-black">Hard boundary</h2><p className="mt-5 leading-7 text-white/65">Local mission mutation can be explicitly approved. It still does not equal submission, purchase, booking, payment, message delivery, application completion, external persistence, or any other third-party action.</p></article>
        </section>
      </section>
    </main>
  );
}
