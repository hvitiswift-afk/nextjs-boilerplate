import { createObserverParallaxMap } from "@/lib/llm/observer-parallax";

const routeLabels: Record<string, string> = {
  earth_gate: "Earth Gate",
  bz_shield: "Bz Shield",
  solar_system: "Solar System",
  arcturus_gate: "Arcturus Gate",
  orion_arc: "Orion Arc",
  milky_way_graph: "Milky Way Graph",
};

export default function GoblinParallaxPage() {
  const map = createObserverParallaxMap();

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-orange-300">
            Goblin LLM / Earth ↔ Mars
          </p>
          <h1 className="text-4xl font-semibold md:text-6xl">
            Observer Parallax Gates
          </h1>
          <p className="max-w-3xl text-lg text-zinc-300">{map.rule}</p>
        </header>

        <section className="grid gap-4">
          {map.pairs.map((pair) => (
            <article
              key={`${pair.earthId}-${pair.marsId}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
                    Earth ↔ Mars Pair
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {pair.earthId} ↔ {pair.marsId}
                  </h2>
                </div>
                <span className="w-fit rounded-full border border-orange-300/30 px-3 py-1 text-xs text-orange-200">
                  {routeLabels[pair.sharedRoute] ?? pair.sharedRoute}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <section className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <h3 className="font-semibold text-zinc-100">Foreground Shift</h3>
                  <p className="mt-2 text-sm text-zinc-300">{pair.localForegroundShift}</p>
                </section>
                <section className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <h3 className="font-semibold text-zinc-100">Goblin Meaning</h3>
                  <p className="mt-2 text-sm text-zinc-300">{pair.goblinMeaning}</p>
                </section>
              </div>

              <p className="mt-4 text-xs text-cyan-200">
                deepSkyStable: {String(pair.deepSkyStable)}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-orange-300/20 bg-orange-300/10 p-6">
          <h2 className="text-2xl font-semibold">Receipt</h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-black p-4 text-xs text-orange-200">
{JSON.stringify(map.receipt, null, 2)}
          </pre>
        </section>
      </section>
    </main>
  );
}
