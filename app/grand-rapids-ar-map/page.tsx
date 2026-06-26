const routes = [
  "Downtown Core",
  "Grand River Route",
  "Museum Lore Route",
  "Eastown and Wealthy Route",
  "Heritage Hill Route",
  "Fulton Market Route",
  "Medical Mile Route",
  "John Ball Route",
];

export default function GrandRapidsArMapPage() {
  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-cyan-200">V3694 Shipboard Computer Online</p>
        <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-7xl">Grand Rapids AR Map</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/72">Norstein Bekkler Grand Rapids AR Map is a free-core city guide created by JP / Justin Rackham. It begins in Grand Rapids, Michigan and uses public city routes only.</p>
        <div className="mt-8 rounded-3xl border border-cyan-200/20 bg-cyan-200/[0.06] p-6">
          <h2 className="text-2xl font-black">Free-Core Rules</h2>
          <ul className="mt-4 grid gap-3 text-white/75 sm:grid-cols-2">
            <li>No purchase required.</li>
            <li>No tip required.</li>
            <li>No card or payment data.</li>
            <li>No private-location tracking.</li>
            <li>Public places and public routes only.</li>
            <li>Silver Points are story-only and do not expire.</li>
          </ul>
        </div>
        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {routes.map((route) => (
            <article key={route} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-white/75">
              <span className="block font-bold text-cyan-100">{route}</span>
              <span className="mt-2 block text-sm text-white/55">Public route node</span>
            </article>
          ))}
        </section>
        <section className="mt-10 rounded-3xl border border-fuchsia-200/20 bg-fuchsia-200/[0.05] p-6">
          <h2 className="text-2xl font-black">Starter Inventory</h2>
          <p className="mt-3 text-white/72">Each tryout gets the JP Creator Card, Fardarter Gaming arrival card, Grand Rapids AR Map sticker, and Silver Points starter marker as story inventory.</p>
        </section>
      </section>
    </main>
  );
}
