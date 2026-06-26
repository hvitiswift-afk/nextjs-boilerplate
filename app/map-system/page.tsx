const layers = [
  "Grand Rapids origin city",
  "Michigan route layer",
  "Midwest regional layer",
  "National city model",
  "Shipboard computer bridge",
  "Silver Points story inventory",
  "Free-core public-route rules",
  "V number continuity"
];

export default function MapSystemPage() {
  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
        <a className="text-sm text-cyan-200" href="/">Back to entrance</a>
        <p className="mt-8 font-mono text-sm uppercase tracking-[0.35em] text-fuchsia-200">V3694 Map System Entrance</p>
        <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-7xl">Norstein Bekkler Map System</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/72">A creative map layer that starts in Grand Rapids and expands outward through cities, regions, shipboard computer views, and free-core story inventory.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {layers.map((layer) => (
            <article key={layer} className="rounded-3xl border border-fuchsia-200/15 bg-fuchsia-200/[0.045] p-5 text-white/75">{layer}</article>
          ))}
        </div>
        <p className="mt-8 text-sm text-white/55">This is a creative story and route structure only. It does not create payment rights, tracking, or endorsement.</p>
      </section>
    </main>
  );
}
