import { createGoblinReceiptLedger } from "@/lib/llm/goblin-receipt-ledger";

export default function GoblinReceiptsPage() {
  const ledger = createGoblinReceiptLedger();

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-300">
            Goblin LLM / Receipt Ledger
          </p>
          <h1 className="text-4xl font-semibold md:text-6xl">Receipt Ledger</h1>
          <p className="max-w-3xl text-lg text-zinc-300">
            A receipt-centered audit view for routes, paths, layers, route kinds,
            duplicate receipt IDs, law counts, and coverage totals.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-6">
          <MetricCard label="Status" value={ledger.status} />
          <MetricCard label="Routes" value={String(ledger.routeTotal)} />
          <MetricCard label="Receipts" value={String(ledger.receiptTotal)} />
          <MetricCard label="Laws" value={String(ledger.lawTotal)} />
          <MetricCard label="Coverage" value={`${ledger.lawCoveragePercent}%`} />
          <MetricCard label="Duplicates" value={String(ledger.duplicateReceiptIds.length)} />
        </section>

        <section className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-6">
          <h2 className="text-2xl font-semibold">Layer Totals</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {ledger.layerTotals.map((layer) => (
              <article
                key={layer.layer}
                className="rounded-xl border border-white/10 bg-black/30 p-4"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                  layer
                </p>
                <h3 className="mt-1 text-lg font-semibold">{layer.layer}</h3>
                <p className="mt-3 text-sm text-zinc-300">
                  routes: {layer.routeCount} / receipts: {layer.receiptCount} / duplicate receipts: {layer.duplicateReceiptCount}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-6">
          <h2 className="text-2xl font-semibold">Duplicate Receipt IDs</h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-black p-4 text-xs text-amber-200">
{JSON.stringify(ledger.duplicateReceiptIds, null, 2)}
          </pre>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold">Ledger Entries</h2>
          <div className="mt-5 grid gap-3">
            {ledger.entries.map((entry) => (
              <article
                key={entry.receiptId}
                className="rounded-xl border border-white/10 bg-black/30 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                      receipt / {entry.routeCount} route{entry.routeCount === 1 ? "" : "s"}
                    </p>
                    <h3 className="mt-1 break-all text-lg font-semibold">
                      {entry.receiptId}
                    </h3>
                  </div>
                  <span className="w-fit rounded-full border border-amber-300/30 px-3 py-1 text-xs text-amber-200">
                    duplicate: {String(entry.duplicate)}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-zinc-300 md:grid-cols-2">
                  <LedgerField label="routes" value={entry.routeIds.join(", ")} />
                  <LedgerField label="paths" value={entry.paths.join(", ")} />
                  <LedgerField label="layers" value={entry.layers.join(", ")} />
                  <LedgerField label="kinds" value={entry.kinds.join(", ")} />
                  <LedgerField label="laws" value={`${entry.lawCount}/${entry.routeCount}`} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-6">
          <h2 className="text-2xl font-semibold">Receipt</h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-black p-4 text-xs text-amber-200">
{JSON.stringify(ledger.receipt, null, 2)}
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
      <p className="mt-3 text-3xl font-semibold text-amber-200">{value}</p>
    </article>
  );
}

function LedgerField({ label, value }: { label: string; value: string }) {
  return (
    <p className="break-words rounded-xl border border-white/10 bg-black/40 p-3">
      <span className="mr-2 text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</span>
      {value || "none"}
    </p>
  );
}
