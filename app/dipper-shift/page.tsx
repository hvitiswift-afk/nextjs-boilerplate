const stars = [
  { name: "Dubhe", x: 18, y: 42, dx: 5, dy: -3, note: "Pointer star at the bowl rim." },
  { name: "Merak", x: 30, y: 60, dx: 4, dy: -2, note: "Second pointer star; points toward Polaris with Dubhe." },
  { name: "Phecda", x: 48, y: 58, dx: 1, dy: 2, note: "Lower bowl corner." },
  { name: "Megrez", x: 45, y: 38, dx: 0, dy: 1, note: "Bowl-handle hinge." },
  { name: "Alioth", x: 61, y: 34, dx: -2, dy: 1, note: "Bright handle star." },
  { name: "Mizar", x: 75, y: 38, dx: -4, dy: 2, note: "Famous visual double with Alcor nearby." },
  { name: "Alkaid", x: 88, y: 48, dx: -7, dy: 4, note: "Outer handle star, not co-moving with the central stream." },
];

const lineSegments = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [3, 4],
  [4, 5],
  [5, 6],
];

const frames = [
  {
    label: "Daily rotation",
    formula: "θ(t)=θ₀+ωt",
    note: "Earth spins, so the Dipper appears to rotate around the north celestial pole overnight."
  },
  {
    label: "Seasonal shift",
    formula: "local sidereal time drifts ≈ 4 min/day",
    note: "The same sky returns about four minutes earlier each night as Earth orbits the Sun."
  },
  {
    label: "Axial precession",
    formula: "axis cycle ≈ 26,000 years",
    note: "Earth's spin axis slowly wobbles, changing the pole-star neighborhood over deep time."
  },
  {
    label: "Stellar proper motion",
    formula: "pᵢ(t)=pᵢ(0)+μᵢt",
    note: "Stars move through space, so the asterism itself slowly changes shape."
  },
];

function shifted(star: (typeof stars)[number]) {
  return { x: star.x + star.dx, y: star.y + star.dy };
}

function pointsFor(shift = false) {
  return lineSegments
    .map(([a, b]) => {
      const first = shift ? shifted(stars[a]) : stars[a];
      const second = shift ? shifted(stars[b]) : stars[b];
      return `${first.x},${first.y} ${second.x},${second.y}`;
    });
}

export default function DipperShiftPage() {
  const baselineLines = pointsFor(false);
  const shiftedLines = pointsFor(true);

  return (
    <main className="min-h-screen bg-[#050711] text-[#f7f0dd]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.35em] text-cyan-200" href="/">Hviti Labs</a>
          <div className="flex flex-wrap gap-3">
            <a className="transition hover:text-cyan-100" href="/t-oscillator">T-Oscillator</a>
            <a className="transition hover:text-cyan-100" href="/orbital-mechanics">Orbital Mechanics</a>
            <a className="transition hover:text-cyan-100" href="/orbital-rail">Orbital Rail</a>
          </div>
        </nav>

        <section className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
              Dipper Shift • asterism drift • frame goblin audit
            </p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">The Big Dipper is not nailed to the sky.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
              This module treats the Big Dipper as a moving reference pattern. It is an asterism inside Ursa Major, not a physical star cluster, so the familiar ladle shape is partly a line-of-sight coincidence and partly a temporary cosmic doodle. Beautiful, useful, and absolutely not a ceiling sticker.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <span className="block text-sm text-white/50">Stars</span>
                <strong className="text-3xl text-cyan-100">7</strong>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <span className="block text-sm text-white/50">Lines</span>
                <strong className="text-3xl text-fuchsia-100">7</strong>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <span className="block text-sm text-white/50">Model</span>
                <strong className="text-3xl text-amber-100">2D</strong>
              </div>
            </div>
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-cyan-950/50">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Projected asterism shift</h2>
              <span className="rounded-full bg-fuchsia-300/10 px-3 py-1 text-xs text-fuchsia-100">baseline + shifted</span>
            </div>
            <svg viewBox="0 0 100 75" role="img" aria-label="Big Dipper baseline and shifted projected outlines" className="aspect-[4/3] w-full rounded-3xl bg-black/40">
              <defs>
                <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="55%" stopColor="#67e8f9" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#67e8f9" stopOpacity="0" />
                </radialGradient>
              </defs>
              {baselineLines.map((points) => (
                <polyline key={`base-${points}`} points={points} fill="none" stroke="#67e8f9" strokeOpacity="0.88" strokeWidth="0.8" />
              ))}
              {shiftedLines.map((points) => (
                <polyline key={`shift-${points}`} points={points} fill="none" stroke="#f0abfc" strokeOpacity="0.72" strokeWidth="0.8" strokeDasharray="2 2" />
              ))}
              {stars.map((star) => {
                const moved = shifted(star);
                return (
                  <g key={star.name}>
                    <line x1={star.x} y1={star.y} x2={moved.x} y2={moved.y} stroke="#fef3c7" strokeOpacity="0.38" strokeWidth="0.4" />
                    <circle cx={moved.x} cy={moved.y} r="2.2" fill="#f0abfc" opacity="0.45" />
                    <circle cx={star.x} cy={star.y} r="3" fill="url(#starGlow)" />
                    <circle cx={star.x} cy={star.y} r="0.8" fill="#ffffff" />
                    <text x={star.x + 1.8} y={star.y - 1.8} fontSize="2.6" fill="#f7f0dd" opacity="0.86">{star.name}</text>
                  </g>
                );
              })}
            </svg>
            <p className="mt-4 text-sm leading-6 text-white/60">
              Cyan is the baseline projection. Fuchsia is an exaggerated shifted outline, useful for intuition rather than pretending these tiny screen offsets are a precise catalog. The universe is allowed to be subtle; the UI is allowed to use a magnifying goblin.
            </p>
          </section>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {frames.map((frame) => (
            <article key={frame.label} className="rounded-3xl border border-cyan-200/15 bg-cyan-200/[0.045] p-5">
              <h3 className="font-bold text-cyan-100">{frame.label}</h3>
              <code className="mt-3 block rounded-2xl bg-black/35 p-3 text-sm text-fuchsia-100">{frame.formula}</code>
              <p className="mt-3 text-sm leading-6 text-white/62">{frame.note}</p>
            </article>
          ))}
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-7">
          <h2 className="text-2xl font-black">Dipper Shift equations</h2>
          <pre className="mt-5 overflow-x-auto rounded-2xl bg-black/45 p-4 text-sm leading-7 text-cyan-100">{`Angular drift:   θ(t)=θ₀+ωt
Projected shift: pᵢ(t)=pᵢ(0)+μᵢt
Frame delta:     Δpᵢ=pᵢ(t₂)-pᵢ(t₁)
Centroid:        C(t)=Σpᵢ(t)/N`}</pre>
          <p className="mt-5 text-white/65">
            Working theory for the lab: use a 2D sky projection to separate frame motion from real stellar motion. The Big Dipper looks stable to human eyes, but over enough time the ladle deforms. Ancient sky, future sky, same physics goblin moving furniture very slowly.
          </p>
        </section>
      </section>
    </main>
  );
}
