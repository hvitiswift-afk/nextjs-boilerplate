"use client";

import { useMemo, useState } from "react";

type Projection = {
  schema: string;
  missionId: string | null;
  journalValid: boolean;
  entries: number;
  headDigest: string | null;
  latestType: string | null;
  counts: Record<string, number>;
  state: {
    persisted: boolean;
    rolledBack: boolean;
    unresolvedPlan: boolean;
  };
  warnings: string[];
  verificationErrors: Array<{ index: number; code: string }>;
  limitation: string;
  externalActionCompleted: false;
};

const JOURNAL_KEY = "jp-hviti-service-bridge-lifecycle-v1";

export default function LifecycleProjectionPage() {
  const [journalJson, setJournalJson] = useState("[]");
  const [projection, setProjection] = useState<Projection | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const entries = useMemo(() => {
    try {
      const parsed = JSON.parse(journalJson);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }, [journalJson]);

  function loadLocalJournal() {
    setError("");
    setProjection(null);
    setJournalJson(localStorage.getItem(JOURNAL_KEY) || "[]");
  }

  async function projectJournal() {
    setError("");
    setProjection(null);
    if (!entries) return setError("Journal JSON must be an array.");
    setLoading(true);
    try {
      const response = await fetch("/api/service-bridge/lifecycle/project", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      const payload = await response.json();
      setProjection(payload);
      if (!response.ok && response.status !== 422) {
        throw new Error(payload.error || "Lifecycle projection failed.");
      }
      if (response.status === 422) {
        setError("The lifecycle chain is invalid; projection is shown for diagnosis only.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Lifecycle projection failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.3em] text-cyan-200" href="/service-bridge/nexus">Service Bridge Nexus</a>
          <div className="flex flex-wrap gap-3"><a href="/service-bridge/lifecycle">Lifecycle</a><a href="/service-bridge/persist">Persist</a><a href="/service-bridge/rollback">Rollback</a></div>
        </nav>

        <header className="grid gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-sm text-fuchsia-100">Derived lifecycle state</p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Lifecycle Projection</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">Project the current local mission lifecycle from its chained journal and surface unresolved plans, rollback state, integrity failures, and structural warnings.</p>
          </div>
          <div className="rounded-[2rem] border border-amber-300/25 bg-amber-300/[0.08] p-6">
            <p className="font-semibold text-amber-100">Derived view only</p>
            <p className="mt-3 text-sm leading-6 text-white/60">Projection does not mutate mission storage and does not prove identity, trusted time, legal authority, or third-party execution.</p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">Lifecycle journal input</h2>
            <textarea value={journalJson} onChange={(event) => setJournalJson(event.target.value)} rows={24} className="mt-5 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm" />
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={loadLocalJournal} className="rounded-full border border-white/15 px-5 py-3 font-bold">Load local journal</button>
              <button onClick={projectJournal} disabled={loading || !entries} className="rounded-full bg-cyan-200 px-5 py-3 font-bold text-black disabled:opacity-40">{loading ? "Projecting…" : "Project lifecycle"}</button>
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">Projected state</h2>
            {!projection ? <p className="mt-5 text-white/45">No lifecycle projection created yet.</p> : <div className="mt-5 space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">Valid</p><p className="mt-2 font-black">{projection.journalValid ? "YES" : "NO"}</p></div>
                <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">Persisted</p><p className="mt-2 font-black">{projection.state.persisted ? "YES" : "NO"}</p></div>
                <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">Rolled back</p><p className="mt-2 font-black">{projection.state.rolledBack ? "YES" : "NO"}</p></div>
                <div className="rounded-2xl bg-black/25 p-4"><p className="text-xs uppercase text-white/40">Open plan</p><p className="mt-2 font-black">{projection.state.unresolvedPlan ? "YES" : "NO"}</p></div>
              </div>

              <div className="rounded-2xl bg-black/25 p-4">
                <p className="text-sm text-white/50">Mission</p>
                <p className="mt-2 text-xl font-black">{projection.missionId || "None"}</p>
                <p className="mt-3 text-sm text-white/50">Latest: {projection.latestType || "None"} · Entries: {projection.entries}</p>
              </div>

              {projection.warnings.length ? <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4"><p className="font-bold text-amber-100">Warnings</p>{projection.warnings.map((warning) => <p key={warning} className="mt-2 text-sm text-amber-50/80">{warning}</p>)}</div> : null}
              <pre className="max-h-96 overflow-auto rounded-2xl bg-black/30 p-4 text-xs leading-6 text-cyan-100">{JSON.stringify(projection, null, 2)}</pre>
            </div>}
          </article>
        </section>

        {error ? <div className="mt-6 rounded-2xl border border-red-300/30 bg-red-300/10 p-4 text-red-100">{error}</div> : null}
      </section>
    </main>
  );
}
