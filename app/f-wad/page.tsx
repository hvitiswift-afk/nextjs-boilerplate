import { buildSwirls } from "../../lib/f-wad/swirl";
import { fWadWorlds } from "../../lib/f-wad/worlds";

const cubes = [
  { id: "C1", label: "Intake", role: "weather/radio seed", color: "border-red-300/50 bg-red-300/10", position: "left-[16%] top-[18%]" },
  { id: "C2", label: "Classify", role: "divergence + curl", color: "border-yellow-200/50 bg-yellow-200/10", position: "right-[16%] top-[18%]" },
  { id: "C3", label: "Verify", role: "Stokes gate", color: "border-blue-300/50 bg-blue-300/10", position: "right-[16%] bottom-[18%]" },
  { id: "C4", label: "Output", role: "green pulse", color: "border-emerald-300/50 bg-emerald-300/10", position: "left-[16%] bottom-[18%]" },
];

const hudRows = [
  ["D", "divergence", "names the realm"],
  ["C", "curl", "animates the swirl"],
  ["P", "polarity", "chooses control"],
  ["Γ", "loop charge", "captures through a path"],
  ["S", "Stokes", "verifies the surface"],
];

export default function FWadPage() {
  const swirls = buildSwirls();

  return (
    <main className="min-h-screen bg-[#050509] text-[#f8f0df]">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-8 sm:px-10">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.32em] text-cyan-200" href="/">F-WAD / Quadflare Hollow</a>
          <div className="flex flex-wrap gap-3">
            <a className="hover:text-cyan-100" href="#campaign">Campaign Worlds</a>
            <a className="hover:text-cyan-100" href="/griploom">GRIPLOOM AI</a>
            <a className="hover:text-cyan-100" href="/vault">Vault</a>
          </div>
        </nav>

        <header className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
              MAP01 • four cubes • sixteen flares • weather antenna • Goblin route • Griploom receipt
            </p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Quadflare Hollow</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/70">
              Divergence names the room. Curl animates the swirl. Stokes verifies the capture. Goblin routes the flow. Griploom logs the proof.
            </p>
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-xl font-bold">HUD rail</h2>
            <div className="mt-4 grid gap-3">
              {hudRows.map(([symbol, label, note]) => (
                <div key={symbol} className="grid grid-cols-[3rem_1fr] gap-3 rounded-2xl bg-black/30 p-3">
                  <span className="font-mono text-2xl text-cyan-100">{symbol}</span>
                  <span><strong>{label}</strong><br /><span className="text-sm text-white/55">{note}</span></span>
                </div>
              ))}
            </div>
          </aside>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_24rem]">
          <div className="relative min-h-[620px] overflow-hidden rounded-[2.5rem] border border-cyan-200/20 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.18),rgba(7,7,11,0.96)_58%)] p-6 shadow-2xl shadow-cyan-950/50">
            <div className="absolute inset-x-10 top-8 rounded-full border border-white/10 bg-white/[0.025] px-4 py-2 text-center text-xs uppercase tracking-[0.35em] text-white/40">Elysium Dome</div>
            <div className="absolute inset-x-10 bottom-8 rounded-full border border-red-300/20 bg-red-900/10 px-4 py-2 text-center text-xs uppercase tracking-[0.35em] text-red-100/50">Gehenna Basin</div>

            <div className="absolute left-1/2 top-1/2 z-10 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/60 text-center shadow-xl shadow-white/10">
              <div>
                <div className="font-mono text-lg text-white">H</div>
                <div className="text-xs text-white/55">Pluto Hub</div>
                <div className="mt-1 text-[10px] text-cyan-100/70">|div T|≈0<br />|curl T|&gt;ω</div>
              </div>
            </div>

            <div className="absolute left-[22%] right-[22%] top-[29%] h-px bg-cyan-100/20" />
            <div className="absolute bottom-[29%] left-[22%] right-[22%] h-px bg-cyan-100/20" />
            <div className="absolute bottom-[29%] left-[22%] top-[29%] w-px bg-cyan-100/20" />
            <div className="absolute bottom-[29%] right-[22%] top-[29%] w-px bg-cyan-100/20" />
            <div className="absolute left-[23%] top-[30%] h-px w-[54%] rotate-45 bg-fuchsia-100/15" />
            <div className="absolute left-[23%] top-[70%] h-px w-[54%] -rotate-45 bg-fuchsia-100/15" />

            {cubes.map((cube) => (
              <article key={cube.id} className={`absolute z-20 grid h-36 w-36 place-items-center rounded-3xl border ${cube.color} p-4 text-center shadow-xl backdrop-blur ${cube.position}`}>
                <div>
                  <div className="font-mono text-2xl font-black">{cube.id}</div>
                  <div className="text-lg font-bold">{cube.label}</div>
                  <div className="mt-1 text-xs text-white/55">{cube.role}</div>
                </div>
              </article>
            ))}

            {swirls.map((swirl) => {
              const left = `${50 + swirl.position[0] * 32}%`;
              const top = `${50 - swirl.position[1] * 32}%`;
              return (
                <div key={swirl.id} className="absolute z-30 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-white/10 p-2 text-center shadow-lg shadow-cyan-900/40" style={{ left, top }}>
                  <div className="mx-auto h-8 w-8 rounded-full border-2 border-dashed border-cyan-100/70" />
                  <div className="mt-1 text-[10px] font-bold text-white/80">{swirl.realm}</div>
                  <div className="text-[9px] text-white/50">{swirl.motion}</div>
                </div>
              );
            })}
          </div>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-xl font-bold">Field classifier</h2>
              <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/40 p-4 text-sm text-cyan-100">{`D(x)>ε      → Elysium
|D(x)|≤ε    → Asphodel
D(x)<-ε     → Gehenna
|div T|≤ε && |curl T|>ω → Pluto`}</pre>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-xl font-bold">Swirl routes</h2>
              <div className="mt-4 space-y-3">
                {swirls.map((swirl) => (
                  <div key={swirl.id} className="rounded-2xl bg-black/30 p-3 text-sm">
                    <div className="font-bold text-cyan-100">{swirl.label}</div>
                    <div className="mt-1 text-white/60">D {swirl.divergence.toFixed(2)} • C {swirl.curl.toFixed(2)} • P {swirl.polarity}</div>
                    <div className="mt-1 text-white/45">Goblin: {swirl.route.route} → {swirl.route.targetCube}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section id="campaign" className="border-t border-white/10 py-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-sm uppercase tracking-[0.32em] text-fuchsia-200/70">Campaign rail</p>
              <h2 className="mt-2 text-4xl font-black">World-select structure</h2>
              <p className="mt-3 max-w-3xl text-white/65">Quadflare Hollow now expands into a planetary campaign: Gladiator Arena, Hyperboreum, an Imperial Gate hub, Alpha Mars, Omega Mars, and Venus.</p>
            </div>
            <code className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-cyan-100">Z = FieldRealm × WorldTag</code>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {fWadWorlds.map((world) => (
              <article key={world.id} className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/20">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-xs uppercase tracking-[0.24em] text-cyan-100/70">{world.map}</div>
                    <h3 className="mt-2 text-2xl font-black">{world.name}</h3>
                    <p className="mt-1 text-sm text-white/55">{world.subtitle}</p>
                  </div>
                  <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs text-cyan-100">{world.fieldBias}</span>
                </div>

                <p className="mt-4 text-sm leading-6 text-white/68">{world.coreMechanic}</p>
                <p className="mt-3 text-xs text-white/45">Palette: {world.palette}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {world.sectors.map((sector) => (
                    <span key={sector} className="rounded-full bg-black/35 px-3 py-1 text-[11px] text-white/55">{sector}</span>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl bg-black/30 p-3 text-sm text-white/65">
                  <strong className="text-fuchsia-100">Rule:</strong> {world.rule}
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
