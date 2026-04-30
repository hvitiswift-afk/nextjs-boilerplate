import { zfEdges, zfNetworkHealth, zfNodes, zfPredicates } from "@/data/zfSetTheory";

const kindClasses = {
  axiom: "border-cyan-300/40 bg-cyan-950/40 text-cyan-100",
  operator: "border-violet-300/40 bg-violet-950/40 text-violet-100",
  relation: "border-emerald-300/40 bg-emerald-950/40 text-emerald-100",
  extension: "border-amber-300/40 bg-amber-950/40 text-amber-100",
};

const edgeClasses = {
  defines: "text-cyan-200",
  requires: "text-fuchsia-200",
  constructs: "text-emerald-200",
  guards: "text-rose-200",
  extends: "text-amber-200",
};

export function ZFSetTheoryConnector() {
  const health = zfNetworkHealth();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
            Math Network Connector
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Zermelo-Fraenkel Set Theory
          </h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            A symbolic network model of ZF set theory. Nodes represent axioms,
            relations, and extension points; edges represent logical dependency,
            construction flow, and guard constraints. The network is formal
            scaffolding, not metaphysical fog juice.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="axioms" value={health.axiomCount} />
          <Metric label="relations" value={health.relationCount} />
          <Metric label="edges" value={health.edgeCount} />
          <Metric label="mean axiom weight" value={health.meanAxiomWeight} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-4">
            <h2 className="mb-4 text-xl font-semibold">Network map</h2>
            <svg viewBox="0 0 740 470" className="h-[470px] w-full rounded-2xl bg-slate-950">
              <defs>
                <marker id="arrow" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
                  <path d="M0,0 L8,4 L0,8 Z" fill="rgb(148 163 184)" />
                </marker>
              </defs>
              {zfEdges.map((edge) => {
                const from = zfNodes.find((node) => node.id === edge.from);
                const to = zfNodes.find((node) => node.id === edge.to);
                if (!from || !to) return null;
                return (
                  <g key={edge.id}>
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke="rgb(71 85 105)"
                      strokeWidth="2"
                      markerEnd="url(#arrow)"
                      opacity="0.75"
                    />
                    <text
                      x={(from.x + to.x) / 2}
                      y={(from.y + to.y) / 2 - 6}
                      textAnchor="middle"
                      className="fill-slate-300 text-[10px]"
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}
              {zfNodes.map((node) => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.kind === "axiom" ? 31 : 25}
                    className={node.kind === "axiom" ? "fill-cyan-950 stroke-cyan-300" : node.kind === "relation" ? "fill-emerald-950 stroke-emerald-300" : "fill-amber-950 stroke-amber-300"}
                    strokeWidth="2"
                  />
                  <text x={node.x} y={node.y - 4} textAnchor="middle" className="fill-white text-[10px] font-bold">
                    {node.label.split(" ")[0]}
                  </text>
                  <text x={node.x} y={node.y + 10} textAnchor="middle" className="fill-slate-300 text-[9px]">
                    {node.kind}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <aside className="rounded-3xl border border-slate-700 bg-slate-900/70 p-5">
            <h2 className="text-xl font-semibold">Core predicates</h2>
            <div className="mt-4 flex flex-col gap-3">
              {zfPredicates.map((predicate) => (
                <code key={predicate} className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-cyan-100">
                  {predicate}
                </code>
              ))}
            </div>
          </aside>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {zfNodes.map((node) => (
            <article key={node.id} className={`rounded-2xl border p-4 ${kindClasses[node.kind]}`}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{node.label}</h3>
                <span className="rounded-full bg-black/25 px-2 py-1 text-xs uppercase tracking-wide">
                  {node.kind}
                </span>
              </div>
              <p className="mt-2 text-sm opacity-85">{node.shortName}</p>
              <code className="mt-3 block rounded-xl bg-black/30 p-3 text-xs">{node.symbol}</code>
              <p className="mt-3 text-sm leading-6 opacity-90">{node.description}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-700 bg-slate-900/70 p-5">
          <h2 className="text-xl font-semibold">Connector edges</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {zfEdges.map((edge) => (
              <div key={edge.id} className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                <p className={`text-sm font-semibold uppercase tracking-wide ${edgeClasses[edge.kind]}`}>{edge.kind}</p>
                <p className="mt-2 text-slate-200">
                  <span className="font-mono">{edge.from}</span> → <span className="font-mono">{edge.to}</span>
                </p>
                <p className="mt-1 text-sm text-slate-400">{edge.label}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
      <p className="text-sm uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-cyan-200">{value}</p>
    </div>
  );
}
