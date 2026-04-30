const links = [
  {
    href: "/goblin/galaxy",
    title: "Galaxy Dashboard",
    description: "Earth Gate, Bz Shield, Solar System, Arcturus, Orion, and Milky Way routing map.",
  },
  {
    href: "/goblin/constellations",
    title: "Observer Constellations",
    description: "Earth and Mars constellation gates with home and expedition orientation.",
  },
  {
    href: "/goblin/parallax",
    title: "Observer Parallax",
    description: "Earth ↔ Mars pairings, foreground shifts, and shared deep-sky routes.",
  },
  {
    href: "/goblin/observer-route",
    title: "Observer Route Resolver",
    description: "Prompt examples resolved into constellation gates, Goblin routes, and parallax pairs.",
  },
  {
    href: "/goblin/health",
    title: "Control Deck Health",
    description: "Diagnostics for dashboards, APIs, receipts, and route laws.",
  },
  {
    href: "/goblin/receipts",
    title: "Receipt Ledger",
    description: "Receipt-centered audit view for routes, paths, layers, kinds, duplicates, and laws.",
  },
];

const apis = [
  "/api/llm/goblin-control-deck",
  "/api/llm/goblin-control-deck-health",
  "/api/llm/goblin-receipt-ledger",
  "/api/llm/observer-constellations",
  "/api/llm/observer-parallax",
  "/api/llm/observer-route",
];

export default function GoblinIndexPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-violet-300">
            Goblin LLM
          </p>
          <h1 className="text-4xl font-semibold md:text-6xl">Control Deck</h1>
          <p className="max-w-3xl text-lg text-zinc-300">
            A single launch page for galaxy routing, Earth/Mars observer skies,
            parallax pairings, route resolution, health diagnostics, and receipt audits.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl transition hover:border-violet-300/40 hover:bg-violet-300/10"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{link.href}</p>
              <h2 className="mt-3 text-2xl font-semibold">{link.title}</h2>
              <p className="mt-3 text-sm text-zinc-300">{link.description}</p>
            </a>
          ))}
        </section>

        <section className="rounded-2xl border border-violet-300/20 bg-violet-300/10 p-6">
          <h2 className="text-2xl font-semibold">API Rails</h2>
          <div className="mt-4 grid gap-3">
            {apis.map((api) => (
              <code key={api} className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-violet-200">
                {api}
              </code>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold">Receipt</h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-black p-4 text-xs text-violet-200">
{`{
  "id": "receipt-goblin-control-deck-026",
  "kind": "llm-goblin-control-deck-linked-receipts",
  "status": "visible",
  "path": "/goblin",
  "law": "A router becomes usable when every gate has a visible control deck, every deck has health, and every receipt has a ledger."
}`}
          </pre>
        </section>
      </section>
    </main>
  );
}
