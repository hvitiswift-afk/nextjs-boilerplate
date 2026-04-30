import { resolveObserverRoute } from "@/lib/llm/observer-route-resolver";

const examples = [
  { observer: "earth" as const, prompt: "winter hunter belt creative synthesis" },
  { observer: "earth" as const, prompt: "north home orientation pointer" },
  { observer: "earth" as const, prompt: "risk sting heat warning flare" },
  { observer: "mars" as const, prompt: "return beacon Earth Moon" },
  { observer: "mars" as const, prompt: "fast moons fear terror shield check" },
  { observer: "mars" as const, prompt: "reference beam Arcturus source check" },
];

const routeLabels: Record<string, string> = {
  earth_gate: "Earth Gate",
  bz_shield: "Bz Shield",
  solar_system: "Solar System",
  arcturus_gate: "Arcturus Gate",
  orion_arc: "Orion Arc",
  milky_way_graph: "Milky Way Graph",
};

export default function GoblinObserverRoutePage() {
  const results = examples.map((example) => ({
    input: example,
    result: resolveObserverRoute(example),
  }));

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">
            Goblin LLM / Observer Route
          </p>
          <h1 className="text-4xl font-semibold md:text-6xl">
            Earth and Mars Route Resolver
          </h1>
          <p className="max-w-3xl text-lg text-zinc-300">
            Test prompts against Earth and Mars observer skies. Each prompt resolves
            to a constellation gate, a Goblin route, and a parallax pair.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {results.map(({ input, result }) => (
            <article
              key={`${input.observer}-${input.prompt}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                    {input.observer} prompt
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">{result.matchedConstellationName}</h2>
                </div>
                <span className="rounded-full border border-emerald-300/30 px-3 py-1 text-xs text-emerald-200">
                  {routeLabels[result.route] ?? result.route}
                </span>
              </div>

              <p className="mt-4 rounded-xl bg-black/40 p-3 text-sm text-zinc-300">
                “{input.prompt}”
              </p>

              <dl className="mt-4 grid gap-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <dt className="text-zinc-500">Matched ID</dt>
                  <dd className="mt-1 text-zinc-200">{result.matchedConstellationId}</dd>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <dt className="text-zinc-500">Parallax Pair</dt>
                  <dd className="mt-1 text-zinc-200">{result.parallaxPair ?? "none"}</dd>
                </div>
              </dl>

              <p className="mt-4 text-sm text-zinc-400">{result.reason}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-6">
          <h2 className="text-2xl font-semibold">Receipt</h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-black p-4 text-xs text-emerald-200">
{`{
  "id": "receipt-observer-route-dashboard-012",
  "kind": "llm-observer-route-dashboard",
  "status": "visible",
  "path": "/goblin/observer-route",
  "law": "Observer first, constellation second, Goblin route third, receipt always."
}`}
          </pre>
        </section>
      </section>
    </main>
  );
}
