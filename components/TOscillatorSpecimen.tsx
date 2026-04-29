import { glyphs, type TOscillatorGlyph } from "@/data/glyphs";
import axes from "@/data/axes.json";

function GlyphTile({ glyph }: { glyph: TOscillatorGlyph }) {
  const isT = glyph.letter === "T";
  const opacity = 0.45 + 0.55 * glyph.tCoupling;

  return (
    <div className={`rounded-[1.4rem] border bg-white p-4 ${isT ? "border-cyan-200 shadow-[0_0_0_6px_rgba(103,232,249,0.12)]" : "border-white/10"}`}>
      <svg viewBox="0 0 1000 1000" className="h-28 w-full fill-[#f5efe2]" aria-label={`Glyph ${glyph.letter}`}>
        <path d={glyph.path} opacity={opacity} />
      </svg>
      <div className="mt-3 font-mono text-xs text-white/55">
        {glyph.letter} · M={glyph.mirror} · ΔT={glyph.distanceFromT}
      </div>
    </div>
  );
}

export default function TOscillatorSpecimen() {
  const anchorT = glyphs.find((glyph) => glyph.letter === "T");

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.35em] text-cyan-200" href="/">T-Oscillator</a>
          <div className="flex flex-wrap items-center gap-3">
            <a className="transition hover:text-cyan-100" href="/">Home</a>
            <a className="transition hover:text-cyan-100" href="#glyphs">Glyph Rail</a>
            <span>Anchor T / rail math / mirror pairs</span>
          </div>
        </nav>

        <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.06] p-8 shadow-2xl shadow-cyan-950/40">
            <div className="origin-center animate-[pulse_4s_ease-in-out_infinite]">
              <svg viewBox="0 0 1000 1000" className="h-72 w-full fill-[#f5efe2] drop-shadow-[20px_20px_0_rgba(217,70,239,0.18)]" aria-label="Anchor T">
                <path d={anchorT?.path ?? ""} />
              </svg>
            </div>
          </div>

          <div>
            <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-sm text-fuchsia-100">
              Variable axes • SVG paths • T stays anchored
            </p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">T-Oscillator Font Specimen</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
              This renders the custom glyph system directly with SVG paths, so the specimen works before the installable font exists. T is the origin, mirror pairs fold around it, and rail coupling controls glyph strength.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {axes.axes.map((axis) => (
                <span key={axis.tag} className="rounded-full border border-cyan-200/20 bg-cyan-200/[0.08] px-3 py-1 font-mono text-xs text-cyan-100">
                  {axis.tag}: {axis.default}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 mb-10">
          <h2 className="text-2xl font-black">Result words</h2>
          <p className="mt-5 font-serif text-5xl font-black text-amber-200 sm:text-7xl">Token · Track · Commit · Stokes</p>
          <p className="mt-4 text-white/55">Readability first, shimmer second. Otherwise the noodle alphabet goblin steals the steering wheel.</p>
        </section>

        <section id="glyphs" className="grid gap-4 pb-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {glyphs.map((glyph) => <GlyphTile glyph={glyph} key={glyph.letter} />)}
        </section>
      </section>
    </main>
  );
}
