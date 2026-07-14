"use client";

import { useMemo, useState } from "react";

type Provider = {
  provider: "vercel" | "netlify" | "other";
  configured: boolean;
  deploymentVerified: boolean;
  blocked: boolean | null;
  detail: string;
};

type RepairPlan = {
  strategy: string;
  inferredStrategy: string;
  commitSha: string;
  steps: string[];
  execution: Record<string, boolean>;
  boundaries: Record<string, boolean>;
  externalActionCompleted: false;
};

export default function DeploymentBridgePage() {
  const [commitSha, setCommitSha] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [strategy, setStrategy] = useState("");
  const [plan, setPlan] = useState<RepairPlan | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const providers = useMemo<Provider[]>(
    () => [
      {
        provider: "vercel",
        configured: true,
        deploymentVerified: false,
        blocked: true,
        detail: "Current repository status indicates blocked Vercel deployments.",
      },
      {
        provider: "netlify",
        configured: false,
        deploymentVerified: false,
        blocked: null,
        detail: "Alternate bridge provider not yet configured.",
      },
    ],
    [],
  );

  async function createPlan() {
    setLoading(true);
    setError("");
    setPlan(null);
    try {
      const response = await fetch("/api/service-bridge/deployment/repair", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          commitSha,
          providers,
          preferredStrategy: strategy || undefined,
          confirmation,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Repair planning failed.");
      setPlan(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Repair planning failed.");
    } finally {
      setLoading(false);
    }
  }

  const expected = commitSha ? `PLAN DEPLOYMENT REPAIR ${commitSha}` : "PLAN DEPLOYMENT REPAIR <commit-sha>";

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.3em] text-cyan-200" href="/service-bridge/nexus">Service Bridge Nexus</a>
          <div className="flex gap-3"><a href="/api/service-bridge/deployment">Readiness API</a><a href="/service-bridge/status">Status</a></div>
        </nav>

        <header className="py-14">
          <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-sm text-fuchsia-100">Deployment bridge • repair planning • no silent deploy</p>
          <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Deployment Bridge Repair</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">Plan a truthful recovery path when one provider is blocked. This console creates a repair plan only; it does not deploy, mutate provider state, or claim a public URL is verified.</p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">Repair input</h2>
            <label className="mt-5 block text-sm text-white/60">Commit SHA</label>
            <input value={commitSha} onChange={(event) => setCommitSha(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-cyan-200/40" placeholder="Exact commit SHA" />

            <label className="mt-5 block text-sm text-white/60">Preferred strategy</label>
            <select value={strategy} onChange={(event) => setStrategy(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
              <option value="">Infer safest route</option>
              <option value="repair-vercel-account">Repair Vercel account</option>
              <option value="repair-vercel-project">Repair Vercel project</option>
              <option value="bridge-to-netlify">Bridge to Netlify</option>
              <option value="bridge-to-other-provider">Bridge to other provider</option>
              <option value="verify-existing-deployment">Verify existing deployment</option>
            </select>

            <label className="mt-5 block text-sm text-white/60">Exact confirmation</label>
            <p className="mt-2 break-all rounded-2xl bg-black/25 p-3 font-mono text-sm text-cyan-100">{expected}</p>
            <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-cyan-200/40" placeholder={expected} />

            <button onClick={createPlan} disabled={loading} className="mt-6 rounded-full bg-cyan-200 px-5 py-3 font-bold text-black disabled:opacity-40">{loading ? "Planning…" : "Create repair plan"}</button>
            {error ? <div className="mt-5 rounded-2xl border border-red-300/30 bg-red-300/10 p-4 text-red-100">{error}</div> : null}
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">Provider snapshot</h2>
            <div className="mt-5 space-y-4">{providers.map((provider) => <div key={provider.provider} className="rounded-3xl border border-white/10 bg-black/20 p-5"><div className="flex items-center justify-between gap-4"><h3 className="text-xl font-black capitalize text-cyan-100">{provider.provider}</h3><span className={`rounded-full px-3 py-1 text-xs font-bold ${provider.blocked ? "bg-red-300/15 text-red-100" : "bg-white/10 text-white/60"}`}>{provider.blocked ? "BLOCKED" : provider.deploymentVerified ? "VERIFIED" : "UNVERIFIED"}</span></div><p className="mt-3 text-sm leading-6 text-white/60">{provider.detail}</p></div>)}</div>
          </article>
        </section>

        {plan ? <section className="mt-8 rounded-[2rem] border border-emerald-300/25 bg-emerald-300/[0.06] p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-emerald-100/70">Repair plan created</p><h2 className="mt-2 text-3xl font-black">{plan.strategy}</h2></div><span className="rounded-full border border-emerald-200/20 px-4 py-2 text-sm text-emerald-100">External action completed: NO</span></div><ol className="mt-6 space-y-3">{plan.steps.map((step, index) => <li key={step} className="rounded-2xl bg-black/20 p-4"><strong className="mr-3 text-cyan-100">{index + 1}.</strong>{step}</li>)}</ol><div className="mt-6 grid gap-4 sm:grid-cols-2"><pre className="overflow-x-auto rounded-2xl bg-black/30 p-4 text-xs text-cyan-100">{JSON.stringify(plan.execution, null, 2)}</pre><pre className="overflow-x-auto rounded-2xl bg-black/30 p-4 text-xs text-fuchsia-100">{JSON.stringify(plan.boundaries, null, 2)}</pre></div></section> : null}
      </section>
    </main>
  );
}
