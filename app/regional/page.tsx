const regions = [
  { title: "Grand Rapids Origin", items: ["Downtown Core", "Grand River Route", "Museum Lore", "Eastown and Wealthy", "Heritage Hill", "Fulton Market", "Medical Mile", "John Ball"] },
  { title: "Michigan Ring", items: ["Lansing", "Detroit", "Ann Arbor", "Kalamazoo", "Muskegon", "Holland", "Traverse City", "Flint", "Saginaw", "Bay City"] },
  { title: "Great Lakes Ring", items: ["Chicago", "Milwaukee", "Cleveland", "Toledo", "Gary", "South Bend", "Fort Wayne", "Madison"] },
  { title: "Midwest Ring", items: ["Indianapolis", "Columbus", "Minneapolis", "St. Louis", "Cincinnati", "Kansas City", "Des Moines", "Omaha"] },
];

export default function RegionalPage() {
  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
        <a className="text-sm text-cyan-200" href="/">Back to entrance</a>
        <p className="mt-8 font-mono text-sm uppercase tracking-[0.35em] text-cyan-200">V3706 Regional Computer</p>
        <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-7xl">Regional AR Map</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/72">Grand Rapids is the origin city. The map expands through Michigan, the Great Lakes, and the Midwest while keeping free-core public-route rules.</p>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {regions.map((region) => (
            <section key={region.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-2xl font-black text-cyan-100">{region.title}</h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {region.items.map((item) => (
                  <span key={item} className="rounded-full border border-white/15 px-4 py-2 text-white/70">{item}</span>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
