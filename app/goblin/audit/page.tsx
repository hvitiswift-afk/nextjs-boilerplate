import { createGoblinAuditReport } from "@/lib/llm/goblin-audit-report";

export default function GoblinAuditPage() {
  const report = createGoblinAuditReport();

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">
            Goblin LLM / Audit Report
          </p>
          <h1 className="text-4xl font-semibold md:text-6xl">Audit Report</h1>
          <p className="max-w-3xl text-lg text-zinc-300">
            A single verdict over the manifest, health diagnostics, receipt ledger,
            duplicate receipts, layer counts, law coverage, check counters, and failing checks.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-6">
          <MetricCard label="Status" value={report.status} />
          <MetricCard label="Routes" value={String(report.routeTotal)} />
          <MetricCard label="Receipts" value={String(report.receiptTotal)} />
          <MetricCard label="Coverage" value={`${report.lawCoveragePercent}%`} />
          <MetricCard label="Passed" value={`${report.passedCheckCount}/${report.checkCount}`} />
          <MetricCard label="Failing" value={String(report.failingChecks.length)} />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Layers" value={String(report.layerCount)} />
          <MetricCard label="Dashboards" value={String(report.dashboardCount)} />
          <MetricCard label="APIs" value={String(report.apiCount)} />
        </section>

        <section className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-6">
          <h2 className="text-2xl font-semibold">Checks</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {Object.entries(report.checks).map(([name, passed]) => (
              <article key={name} className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">check</p>
                <h3 className="mt-1 text-lg font-semibold">{name}</h3>
                <p className="mt-3 text-sm text-zinc-300">passed: {String(passed)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-6">
          <h2 className="text-2xl font-semibold">Failing Checks</h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-black p-4 text-xs text-emerald-200">
{JSON.stringify(report.failingChecks, null, 2)}
          </pre>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <ReceiptCard label="Manifest" receiptId={report.manifestReceiptId} />
          <ReceiptCard label="Health" receiptId={report.healthReceiptId} />
          <ReceiptCard label="Ledger" receiptId={report.ledgerReceiptId} />
        </section>

        <section className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-6">
          <h2 className="text-2xl font-semibold">Duplicate Receipt IDs</h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-black p-4 text-xs text-emerald-200">
{JSON.stringify(report.duplicateReceiptIds, null, 2)}
          </pre>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold">Receipt</h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-black p-4 text-xs text-emerald-200">
{JSON.stringify(report.receipt, null, 2)}
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
      <p className="mt-3 text-3xl font-semibold text-emerald-200">{value}</p>
    </article>
  );
}

function ReceiptCard({ label, receiptId }: { label: string; receiptId: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl">
      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      <p className="mt-3 break-all text-sm font-semibold text-emerald-200">{receiptId}</p>
    </article>
  );
}
