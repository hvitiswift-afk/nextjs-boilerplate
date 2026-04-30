import { createGoblinControlDeckHealth } from "@/lib/llm/goblin-control-deck-health";

export default function GoblinHealthPage() {
  const health = createGoblinControlDeckHealth();

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-lime-300">
            Goblin LLM / Diagnostics
          </p>
          <h1 className="text-4xl font-semibold md:text-6xl">
            Control Deck Health
          </h1>
          <p className="max-w-3xl text-lg text-zinc-300">
            Machine-readable diagnostics for dashboards, APIs, receipts, and route laws.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Status" value={health.status} />
          <MetricCard label="Dashboards" value={String(health.dashboardCount)} />
          <MetricCard label="APIs" value={String(health.apiCount)} />
          <MetricCard label="Receipts" value={String(health.receiptCount)} />
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold">Route Checks</h2>
          <div className="mt-5 grid gap-3">
            {health.items.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-white/10 bg-black/30 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                      {item.kind}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">{item.path}</h3>
                  </div>
                  <span className="w-fit rounded-full border border-lime-300/30 px-3 py-1 text-xs text-lime-200">
                    {item.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-zinc-400">
                  receipt: {String(item.hasReceipt)} / law: {String(item.hasLaw)}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-lime-300/20 bg-lime-300/10 p-6">
          <h2 className="text-2xl font-semibold">Receipt</h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-black p-4 text-xs text-lime-200">
{JSON.stringify(health.receipt, null, 2)}
          </pre>
        </section>
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl">
      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-lime-200">{value}</p>
    </article>
  );
}
