import { createObserverConstellationMap } from "@/lib/llm/observer-constellations";

const routeLabels: Record<string, string> = {
  earth_gate: "Earth Gate",
  bz_shield: "Bz Shield",
  solar_system: "Solar System",
  arcturus_gate: "Arcturus Gate",
  orion_arc: "Orion Arc",
  milky_way_graph: "Milky Way Graph",
};

export default function GoblinConstellationsPage() {
  const map = createObserverConstellationMap();

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
            Goblin LLM / Observer Sky
          </p>
          <h1 className="text-4xl font-semibold md:text-6xl">
            Earth and Mars Constellation Gates
          </h1>
          <p className="max-w-3xl text-lg text-zinc-300">{map.rule}</p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <ObserverColumn title="Earth View" subtitle="home orientation" constellations={map.earth} />
          <ObserverColumn title="Mars View" subtitle="expedition orientation" constellations={map.mars} />
        </section>

        <section className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-6">
          <h2 className="text-2xl font-semibold">Observer Bridge Law</h2>
          <p className="mt-3 text-zinc-200">{map.bridge.law}</p>
          <p className="mt-3 text-sm text-zinc-300">{map.bridge.parallaxNote}</p>
          <p className="mt-3 text-sm text-zinc-300">{map.bridge.goblinUse}</p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold">Receipt</h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-black p-4 text-xs text-cyan-200">
{`{
  "id": "receipt-observer-constellation-dashboard-008",
  "kind": "llm-observer-constellation-dashboard",
  "status": "visible",
  "path": "/goblin/constellations",
  "observers": ["earth", "mars"],
  "law": "Mark the observing world before interpreting the sky."
}`}
          </pre>
        </section>
      </section>
    </main>
  );
}

function ObserverColumn({
  title,
  subtitle,
  constellations,
}: {
  title: string;
  subtitle: string;
  constellations: ReturnType<typeof createObserverConstellationMap>["earth"];
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">{subtitle}</p>
      <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
      <div className="mt-5 grid gap-4">
        {constellations.map((item) => (
          <section key={item.id} className="rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="mt-1 text-sm text-zinc-400">{item.anchor}</p>
              </div>
              <span className="rounded-full border border-cyan-300/30 px-3 py-1 text-xs text-cyan-200">
                {routeLabels[item.goblinRoute] ?? item.goblinRoute}
              </span>
            </div>
            <p className="mt-3 text-sm text-zinc-300">{item.mythicRole}</p>
            <p className="mt-2 text-xs text-zinc-500">{item.notes}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
