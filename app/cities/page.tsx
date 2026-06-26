const cityGroups = [
  { title: "Origin", cities: ["Grand Rapids"] },
  { title: "Michigan", cities: ["Lansing", "Detroit", "Ann Arbor", "Kalamazoo", "Muskegon", "Holland", "Traverse City"] },
  { title: "Midwest", cities: ["Chicago", "Milwaukee", "Indianapolis", "Cleveland", "Toledo", "Columbus", "Minneapolis", "St. Louis"] },
  { title: "National Model", cities: ["Copy the Grand Rapids free-core public-route model city by city"] },
];

export default function CitiesPage() {
  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
        <a className="text-sm text-cyan-200" href="/">Back to entrance</a>
        <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-7xl">Regional Cities</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/72">Grand Rapids is the origin model. Each city keeps the same free-core rules: no purchase, no tip, no private-location tracking, and public routes only.</p>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {cityGroups.map((group) => (
            <section key={group.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-2xl font-black text-cyan-100">{group.title}</h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {group.cities.map((city) => (
                  <span key={city} className="rounded-full border border-white/15 px-4 py-2 text-white/70">{city}</span>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
