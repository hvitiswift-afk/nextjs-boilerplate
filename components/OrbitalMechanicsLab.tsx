import { computeOrbit, equations, hohmannTransfer, orbitPresets } from "@/data/orbitalMechanics";

function format(value: number, digits = 2) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
}

export default function OrbitalMechanicsLab() {
  const computed = orbitPresets.map(computeOrbit);
  const leo = computed[0];
  const geo = computed[2];
  const transfer = hohmannTransfer(leo.muKm3S2, leo.rKm, geo.rKm);

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.35em] text-cyan-200" href="/">Orbital Mechanics</a>
          <div className="flex flex-wrap items-center gap-3">
            <a className="transition hover:text-cyan-100" href="/">Home</a>
            <a className="transition hover:text-cyan-100" href="#equations">Equations</a>
            <a className="transition hover:text-cyan-100" href="#transfer">Transfer</a>
          </div>
        </nav>

        <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1fr_0.95fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
              Two-body lab • vis-viva • Hohmann transfer • delta-v budget
            </p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Put the math in orbit.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
              A compact orbital mechanics lab for circular and elliptical orbits. The central body supplies μ, the orbit supplies r and a, and the spacecraft pays the delta-v bill. No rocket goblin gets to launch without a budget.
            </p>
          </div>

          <div className="relative rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.06] p-8 shadow-2xl shadow-cyan-950/40">
            <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200 shadow-[0_0_60px_rgba(103,232,249,0.65)]" />
            <div className="mx-auto h-72 w-72 rounded-full border border-dashed border-cyan-100/45" />
            <div className="absolute left-1/2 top-1/2 h-96 w-56 -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-full border border-fuchsia-200/45" />
            <div className="absolute left-[61%] top-[27%] h-5 w-5 rounded-full bg-fuchsia-200 shadow-[0_0_30px_rgba(244,114,182,0.75)]" />
            <div className="mt-7 grid grid-cols-2 gap-3 text-sm text-white/70">
              <div className="rounded-2xl bg-black/30 p-4"><span className="block text-white/45">LEO speed</span>{format(leo.circularVelocityKmS, 3)} km/s</div>
              <div className="rounded-2xl bg-black/30 p-4"><span className="block text-white/45">LEO period</span>{format(leo.periodMinutes, 1)} min</div>
            </div>
          </div>
        </section>

        <section id="equations" className="grid gap-5 border-t border-white/10 py-12 md:grid-cols-2">
          {equations.map((equation) => (
            <article key={equation.name} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-bold text-cyan-100">{equation.name}</h2>
              <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/40 p-4 text-lg text-fuchsia-100">{equation.formula}</pre>
              <p className="mt-3 text-white/60">{equation.note}</p>
            </article>
          ))}
        </section>

        <section className="border-t border-white/10 py-12">
          <h2 className="text-3xl font-black">Orbit presets</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {computed.map((orbit) => (
              <article key={orbit.name} className="rounded-3xl border border-cyan-200/15 bg-cyan-200/[0.045] p-5">
                <h3 className="font-bold text-cyan-100">{orbit.name}</h3>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-white/65">
                  <div><dt className="text-white/40">radius r</dt><dd>{format(orbit.rKm)} km</dd></div>
                  <div><dt className="text-white/40">semi-major a</dt><dd>{format(orbit.semiMajorAxisKm)} km</dd></div>
                  <div><dt className="text-white/40">velocity</dt><dd>{format(orbit.circularVelocityKmS, 3)} km/s</dd></div>
                  <div><dt className="text-white/40">period</dt><dd>{format(orbit.periodMinutes, 1)} min</dd></div>
                  <div><dt className="text-white/40">energy ε</dt><dd>{format(orbit.specificEnergyKm2S2, 3)} km²/s²</dd></div>
                  <div><dt className="text-white/40">h</dt><dd>{format(orbit.specificAngularMomentumKm2S, 1)} km²/s</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section id="transfer" className="rounded-[2rem] border border-fuchsia-200/20 bg-fuchsia-200/[0.06] p-7 mb-10">
          <h2 className="text-3xl font-black">Hohmann transfer: LEO → GEO</h2>
          <p className="mt-3 max-w-3xl text-white/65">
            A Hohmann transfer uses an elliptical transfer orbit tangent to both circular orbits. It is slow, elegant, and cheap-ish: the station wagon of orbital transfers, but with scarier math and fewer cupholders.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-black/30 p-4"><span className="block text-white/45">Δv₁</span>{format(transfer.deltaV1, 3)} km/s</div>
            <div className="rounded-2xl bg-black/30 p-4"><span className="block text-white/45">Δv₂</span>{format(transfer.deltaV2, 3)} km/s</div>
            <div className="rounded-2xl bg-black/30 p-4"><span className="block text-white/45">Total Δv</span>{format(transfer.totalDeltaV, 3)} km/s</div>
            <div className="rounded-2xl bg-black/30 p-4"><span className="block text-white/45">Transfer time</span>{format(transfer.transferTimeMinutes, 1)} min</div>
          </div>
        </section>
      </section>
    </main>
  );
}
