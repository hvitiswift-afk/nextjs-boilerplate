import { orbitalRailConstants, orbitalRailEquations, orbitalRailLetters } from "@/data/orbitalRail";

function fmt(value: number, digits = 3) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
}

export default function OrbitalRailBridge() {
  const viewBoxSize = 520;
  const center = viewBoxSize / 2;
  const scale = 1.45;
  const tLetter = orbitalRailLetters.find((item) => item.letter === "T");

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.35em] text-cyan-200" href="/orbital-mechanics">Orbital Rail</a>
          <div className="flex flex-wrap items-center gap-3">
            <a className="transition hover:text-cyan-100" href="/">Home</a>
            <a className="transition hover:text-cyan-100" href="/orbital-mechanics">Orbital Mechanics</a>
            <a className="transition hover:text-cyan-100" href="#ensemble">Ensemble</a>
          </div>
        </nav>

        <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-sm text-fuchsia-100">
              T as attractor • letters as satellites • mirror chords
            </p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Make the alphabet orbit T.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
              This bridge maps the T-Oscillator glyph rail into orbital mechanics. Letters become bodies, T is the central attractor, mirror pairs become chords, and the ensemble gets a Boltzmann weight. Tiny alphabet planets, very serious goblin physics.
            </p>
            <div className="mt-7 grid max-w-xl grid-cols-2 gap-3 text-sm text-white/70">
              <div className="rounded-2xl bg-white/[0.05] p-4"><span className="block text-white/40">Z</span>{fmt(orbitalRailConstants.partitionZ)}</div>
              <div className="rounded-2xl bg-white/[0.05] p-4"><span className="block text-white/40">Entropy</span>{fmt(orbitalRailConstants.entropy)}</div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.06] p-5 shadow-2xl shadow-cyan-950/40">
            <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="h-[520px] w-full" role="img" aria-label="Letters orbiting T">
              <circle cx={center} cy={center} r="34" className="fill-cyan-200 drop-shadow-[0_0_24px_rgba(103,232,249,0.85)]" />
              <text x={center} y={center + 11} textAnchor="middle" className="fill-black text-3xl font-black">T</text>
              {[72, 108, 144, 180, 216].map((radius) => (
                <circle key={radius} cx={center} cy={center} r={radius} className="fill-none stroke-white/10" />
              ))}
              {orbitalRailLetters.filter((item) => item.index < 27 - item.index).map((item) => {
                const mirror = orbitalRailLetters.find((candidate) => candidate.letter === item.mirror);
                if (!mirror) return null;
                return (
                  <line
                    key={`${item.letter}-${mirror.letter}`}
                    x1={center + item.x * scale}
                    y1={center + item.y * scale}
                    x2={center + mirror.x * scale}
                    y2={center + mirror.y * scale}
                    className="stroke-fuchsia-200/15"
                  />
                );
              })}
              {orbitalRailLetters.map((item) => {
                const isT = item.letter === "T";
                const x = center + item.x * scale;
                const y = center + item.y * scale;
                const size = isT ? 30 : 18;
                return (
                  <g key={item.letter}>
                    <circle cx={x} cy={y} r={isT ? 18 : 11} className={isT ? "fill-cyan-100" : "fill-fuchsia-200/80"} />
                    <text x={x} y={y + size / 3} textAnchor="middle" className={isT ? "fill-black text-2xl font-black" : "fill-black text-sm font-black"}>{item.letter}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </section>

        <section className="grid gap-5 border-t border-white/10 py-12 md:grid-cols-2">
          {orbitalRailEquations.map((equation) => (
            <article key={equation.name} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-bold text-cyan-100">{equation.name}</h2>
              <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/40 p-4 text-lg text-fuchsia-100">{equation.formula}</pre>
              <p className="mt-3 text-white/60">{equation.note}</p>
            </article>
          ))}
        </section>

        <section id="ensemble" className="border-t border-white/10 py-12">
          <h2 className="text-3xl font-black">Letter ensemble</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {orbitalRailLetters.map((item) => (
              <article key={item.letter} className={`rounded-3xl border p-4 ${item.letter === "T" ? "border-cyan-200/50 bg-cyan-200/[0.12]" : "border-white/10 bg-white/[0.035]"}`}>
                <h3 className="text-xl font-black text-cyan-100">{item.letter} <span className="text-sm text-white/35">↔ {item.mirror}</span></h3>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/60">
                  <div><dt className="text-white/35">r</dt><dd>{fmt(item.radius, 1)}</dd></div>
                  <div><dt className="text-white/35">θ</dt><dd>{fmt(item.phaseDeg, 1)}°</dd></div>
                  <div><dt className="text-white/35">n</dt><dd>{fmt(item.meanMotion, 6)}</dd></div>
                  <div><dt className="text-white/35">p</dt><dd>{fmt(item.probability, 4)}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
