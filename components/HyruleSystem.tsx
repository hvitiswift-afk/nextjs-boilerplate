import { balanceScore, civicOutput, growthScore, hyruleEquations, hyruleNodes, stabilityScore } from "@/data/hyruleSystem";

function fmt(value: number, digits = 3) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
}

function fillClass(color: string) {
  if (color === "amber") return "fill-amber-200";
  if (color === "cyan") return "fill-cyan-200";
  if (color === "emerald") return "fill-emerald-200";
  return "fill-white";
}

export default function HyruleSystem() {
  const balance = balanceScore();
  const stability = stabilityScore();
  const growth = growthScore();
  const civic = civicOutput();

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.35em] text-cyan-200" href="/">Hyrule</a>
          <div className="flex flex-wrap items-center gap-3">
            <a className="transition hover:text-cyan-100" href="/">Home</a>
            <a className="transition hover:text-cyan-100" href="/ai-brains">AI Brains</a>
            <a className="transition hover:text-cyan-100" href="#equations">Equations</a>
          </div>
        </nav>

        <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-sm text-fuchsia-100">
              Din • Nayru • Farore • Build Hyrule
            </p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Build Hyrule from three pillars.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
              Din provides force, Nayru provides order, and Farore provides living growth. Hyrule appears as the balanced state produced when power, wisdom, and courage remain coupled instead of drifting apart.
            </p>
            <div className="mt-7 grid max-w-xl grid-cols-2 gap-3 text-sm text-white/70">
              <div className="rounded-2xl bg-white/[0.05] p-4"><span className="block text-white/40">Balance</span>{fmt(balance)}</div>
              <div className="rounded-2xl bg-white/[0.05] p-4"><span className="block text-white/40">Stability</span>{fmt(stability)}</div>
              <div className="rounded-2xl bg-white/[0.05] p-4"><span className="block text-white/40">Growth</span>{fmt(growth)}</div>
              <div className="rounded-2xl bg-white/[0.05] p-4"><span className="block text-white/40">Civic output</span>{fmt(civic)}</div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.06] p-5 shadow-2xl shadow-cyan-950/40">
            <svg viewBox="0 0 560 420" className="h-[420px] w-full" role="img" aria-label="Din Nayru Farore build Hyrule">
              <polygon points="280,80 120,340 440,340" className="fill-none stroke-white/15 stroke-[3]" />
              <line x1="160" y1="310" x2="280" y2="245" className="stroke-white/15" />
              <line x1="280" y1="110" x2="280" y2="245" className="stroke-white/15" />
              <line x1="400" y1="310" x2="280" y2="245" className="stroke-white/15" />
              {hyruleNodes.map((node) => (
                <g key={node.id}>
                  <circle cx={node.x} cy={node.y} r={node.domain === "core" ? 34 : 42} className={`${fillClass(node.color)} drop-shadow-[0_0_24px_rgba(255,255,255,0.35)]`} />
                  <text x={node.x} y={node.y + 5} textAnchor="middle" className="fill-black text-xs font-black">{node.name}</text>
                </g>
              ))}
              <text x="280" y="390" textAnchor="middle" className="fill-white/55 text-sm">Hyrule = balanced triforce-state</text>
            </svg>
          </div>
        </section>

        <section className="grid gap-5 border-t border-white/10 py-12 md:grid-cols-2">
          {hyruleNodes.map((node) => (
            <article key={node.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-2xl font-black text-cyan-100">{node.name}</h2>
              <p className="mt-2 text-white/60">{node.description}</p>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm text-white/65">
                <div><dt className="text-white/35">Domain</dt><dd>{node.domain}</dd></div>
                <div><dt className="text-white/35">Strength</dt><dd>{fmt(node.strength)}</dd></div>
                <div><dt className="text-white/35">Order</dt><dd>{fmt(node.order)}</dd></div>
                <div><dt className="text-white/35">Growth</dt><dd>{fmt(node.growth)}</dd></div>
                <div><dt className="text-white/35">Risk</dt><dd>{fmt(node.risk)}</dd></div>
              </dl>
            </article>
          ))}
        </section>

        <section id="equations" className="grid gap-5 border-t border-white/10 py-12 md:grid-cols-2">
          {hyruleEquations.map((equation) => (
            <article key={equation.name} className="rounded-3xl border border-white/10 bg-black/25 p-5">
              <h3 className="font-bold text-cyan-100">{equation.name}</h3>
              <pre className="mt-3 overflow-x-auto rounded-2xl bg-black/40 p-3 text-sm text-fuchsia-100">{equation.formula}</pre>
              <p className="mt-3 text-sm text-white/55">{equation.note}</p>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
