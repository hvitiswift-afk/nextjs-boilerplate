"use client";

import { useEffect, useState } from "react";

type Health = {
  status: string;
  checkedAt: string;
  checks: Record<string, string | number | boolean>;
  missingServices: string[];
  malformedServices: string[];
  capabilities: string[];
  endpoints: string[];
  externalActionCompleted: false;
};

type Manifest = {
  version: number;
  mode: string;
  limits: Record<string, number>;
  endpoints: Record<string, string>;
  approvalLaw: { externalActionsRequireExplicitApproval: boolean; externalActionCompletedByManifest: false };
  recovery: {
    stages: string[];
    automaticMutationAllowed: boolean;
    automaticRollbackAllowed: boolean;
    automaticProjectionMutationAllowed: boolean;
    explicitProjectionMutationAllowed: boolean;
    localPersistenceOnly: boolean;
    localRollbackOnly: boolean;
    externalActionCompleted: false;
  };
  lifecycleProjection?: {
    readOnlyProjection: boolean;
    derivesPersistedState: boolean;
    derivesRollbackState: boolean;
    detectsUnresolvedPlans: boolean;
    invalidJournalStatus: number;
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
};

type Receipt = {
  version: number;
  generatedAt: string;
  system: { missionStateCount: number; serviceCount: number; services: Array<{ name: string; kind: string; capabilityCount: number; externalAction: boolean }> };
  verification: Record<string, string>;
  externalActionCompleted: false;
};

export default function ServiceBridgeStatusPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const [healthResponse, manifestResponse, receiptResponse] = await Promise.all([
        fetch("/api/service-bridge/health", { cache: "no-store" }),
        fetch("/api/service-bridge/manifest", { cache: "no-store" }),
        fetch("/api/service-bridge/receipt", { cache: "no-store" }),
      ]);
      const [healthData, manifestData, receiptData] = await Promise.all([
        healthResponse.json(),
        manifestResponse.json(),
        receiptResponse.json(),
      ]);
      if (!manifestResponse.ok || !receiptResponse.ok) throw new Error("Status endpoints did not respond successfully.");
      setHealth(healthData);
      setManifest(manifestData);
      setReceipt(receiptData);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load Service Bridge status.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  const healthy = health?.status === "healthy";
  const endpointCount = manifest ? Object.keys(manifest.endpoints).length : "—";

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.3em] text-cyan-200" href="/service-bridge/nexus">Service Bridge Nexus</a>
          <div className="flex flex-wrap gap-3"><a href="/service-bridge/lifecycle-project">Lifecycle Projection</a><a href="/service-bridge/lifecycle-apply">Projection Apply</a><a href="/api/service-bridge/openapi">OpenAPI</a></div>
        </nav>

        <header className="grid gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-sm text-fuchsia-100">Manifest • health • receipt • recovery state</p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">System Status</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">Inspect runtime health, versioned API scope, lifecycle projection capabilities, mutation permissions, recovery stages, and external-action boundaries.</p>
          </div>
          <div className={`rounded-[2rem] border p-6 ${healthy ? "border-emerald-300/30 bg-emerald-300/10" : "border-amber-300/30 bg-amber-300/10"}`}>
            <p className="text-sm uppercase tracking-wider text-white/55">Current state</p>
            <p className="mt-3 text-3xl font-black">{loading ? "CHECKING" : health?.status?.toUpperCase() || "UNKNOWN"}</p>
            <p className="mt-2 text-sm text-white/60">Manifest v{manifest?.version ?? "—"} • External action completed: NO</p>
          </div>
        </header>

        <div className="flex flex-wrap gap-3"><button onClick={refresh} disabled={loading} className="rounded-full bg-cyan-200 px-5 py-3 font-bold text-black disabled:opacity-40">{loading ? "Refreshing…" : "Refresh status"}</button><a href="/api/service-bridge/receipt" className="rounded-full border border-white/15 px-5 py-3 font-bold">Open raw receipt</a><a href="/api/service-bridge/manifest" className="rounded-full border border-white/15 px-5 py-3 font-bold">Open manifest</a></div>
        {error ? <div className="mt-6 rounded-2xl border border-red-300/30 bg-red-300/10 p-4 text-red-100">{error}</div> : null}

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Manifest version", manifest?.version ?? "—"],
            ["Services", receipt?.system.serviceCount ?? "—"],
            ["Mission states", receipt?.system.missionStateCount ?? "—"],
            ["Recovery stages", manifest?.recovery?.stages?.length ?? "—"],
            ["Published endpoints", endpointCount],
          ].map(([label, value]) => <article key={String(label)} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"><p className="text-xs uppercase tracking-wider text-white/45">{label}</p><p className="mt-3 break-words text-xl font-black text-cyan-100">{value}</p></article>)}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"><h2 className="text-2xl font-black">Mutation policy</h2><div className="mt-5 space-y-3 text-sm"><p>Automatic mutation: <strong>{manifest?.recovery?.automaticMutationAllowed ? "ALLOWED" : "DISALLOWED"}</strong></p><p>Automatic rollback: <strong>{manifest?.recovery?.automaticRollbackAllowed ? "ALLOWED" : "DISALLOWED"}</strong></p><p>Explicit projection mutation: <strong>{manifest?.recovery?.explicitProjectionMutationAllowed ? "ALLOWED" : "DISALLOWED"}</strong></p><p>Automatic projection mutation: <strong>{manifest?.recovery?.automaticProjectionMutationAllowed ? "ALLOWED" : "DISALLOWED"}</strong></p></div></article>
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"><h2 className="text-2xl font-black">Projection capability</h2><div className="mt-5 space-y-3 text-sm"><p>Read-only projection: <strong>{manifest?.lifecycleProjection?.readOnlyProjection ? "YES" : "NO"}</strong></p><p>Persisted-state derivation: <strong>{manifest?.lifecycleProjection?.derivesPersistedState ? "YES" : "NO"}</strong></p><p>Rollback-state derivation: <strong>{manifest?.lifecycleProjection?.derivesRollbackState ? "YES" : "NO"}</strong></p><p>Unresolved-plan detection: <strong>{manifest?.lifecycleProjection?.detectsUnresolvedPlans ? "YES" : "NO"}</strong></p></div></article>
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"><h2 className="text-2xl font-black">Projection apply gates</h2><p className="mt-5 text-sm text-white/60">Planning confirmation</p><p className="mt-2 break-all font-mono text-cyan-100">{manifest?.lifecycleProjectionApply?.planningConfirmationPattern ?? "—"}</p><p className="mt-5 text-sm text-white/60">Commit confirmation</p><p className="mt-2 break-all font-mono text-cyan-100">{manifest?.lifecycleProjectionApply?.commitConfirmationPattern ?? "—"}</p><p className="mt-5 text-sm">External persistence: <strong>{manifest?.lifecycleProjectionApply?.externalPersistenceAllowed ? "ALLOWED" : "DISALLOWED"}</strong></p></article>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"><h2 className="text-2xl font-black">Health checks</h2><div className="mt-5 space-y-3">{health ? Object.entries(health.checks).map(([key, value]) => <div key={key} className="flex items-center justify-between gap-4 rounded-2xl bg-black/25 p-4"><span className="text-sm text-white/60">{key}</span><strong className="text-cyan-100">{String(value)}</strong></div>) : <p className="text-white/45">No health data.</p>}</div></article>
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"><h2 className="text-2xl font-black">Verification contract</h2><pre className="mt-5 overflow-x-auto rounded-2xl bg-black/30 p-4 text-sm leading-6 text-cyan-100">{receipt ? JSON.stringify(receipt.verification, null, 2) : "No receipt data."}</pre></article>
        </section>

        <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"><h2 className="text-2xl font-black">Recovery rail</h2><div className="mt-5 flex flex-wrap gap-2">{manifest?.recovery?.stages?.map((stage, index) => <span key={stage} className="rounded-full border border-fuchsia-200/20 bg-fuchsia-200/[0.06] px-3 py-2 text-sm text-fuchsia-100">{index + 1}. {stage}</span>)}</div></section>

        <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"><h2 className="text-2xl font-black">Service inventory</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{receipt?.system.services.map(service => <article key={service.name} className="rounded-3xl border border-white/10 bg-black/20 p-5"><h3 className="font-bold text-cyan-100">{service.name}</h3><p className="mt-2 text-xs uppercase tracking-wider text-fuchsia-200/70">{service.kind}</p><p className="mt-3 text-sm text-white/55">Capabilities: {service.capabilityCount}</p><p className="mt-1 text-sm text-white/55">External action: {service.externalAction ? "YES" : "NO"}</p></article>)}</div></section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2"><article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"><h2 className="text-2xl font-black">Capabilities</h2><div className="mt-5 flex flex-wrap gap-2">{health?.capabilities.map(capability => <span key={capability} className="rounded-full border border-cyan-200/20 bg-cyan-200/[0.06] px-3 py-2 text-sm text-cyan-100">{capability}</span>)}</div></article><article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"><h2 className="text-2xl font-black">Published API endpoints</h2><div className="mt-5 space-y-2">{manifest ? Object.entries(manifest.endpoints).filter(([, endpoint]) => endpoint.startsWith("/api/")).map(([name, endpoint]) => <a key={name} href={endpoint} className="block break-all rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-cyan-100"><span className="text-white/45">{name}: </span>{endpoint}</a>) : null}</div></article></section>
      </section>
    </main>
  );
}
