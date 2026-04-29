const signals = [
  { label: "Fabian", value: 88, note: "Architect LLM: decomposes intent and writes hyperscripts" },
  { label: "Goblin", value: 82, note: "Router LLM: verifies, tracks, and keeps approval visible" },
  { label: "GRIPLOOM", value: 76, note: "Production geometry: ML scoring, GOBLIN checks, BLACKLETTER gate" },
  { label: "Enclave", value: 74, note: "Local-first control plane with memory vault and local LLMs" },
  { label: "Outpost", value: 61, note: "2099-2100 continuity layer for receipts and audit trails" },
];

const stack = [
  "Fabian LLM: architect, planner, hyperscript writer",
  "Goblin LLM: router, verifier, progress lantern, edge operator",
  "GRIPLOOM AI: production geometry from verified credits",
  "LLM mesh: ChatGPT, Claude, Grok-compatible, Fabian, Goblin, local models",
  "Hyperscripts: fetch, clean, route, check, deploy, notify",
  "AWS server tower: Amplify first, larger worker services later",
  "Cloudflare edge: DNS, cache, firewall, Goblin Worker algorithm",
  "Memory vault: Postgres records tasks, approvals, receipts, logs",
  "Open Loop: human approval before consequence",
];

const scale = ["0 Local enclave", "1 Edge bridge", "2 Server tower", "3 Worker swarm", "4 LLM mesh", "5 Outpost 2099-2100"];

const vaultDoors = [
  { label: "GRIPLOOM AI", href: "/griploom", note: "Run ML beam scoring, mesh density, vitality, GOBLIN checks, and BLACKLETTER status." },
  { label: "Operator Dashboard", href: "/vault", note: "Inspect manifest, health, ledger, and approval audit filters." },
  { label: "Manifest API", href: "/api/vault/manifest", note: "Discover durable route authority and evidence law." },
  { label: "Health API", href: "/api/vault/health", note: "Diagnose vault table connectivity and audit storage." },
  { label: "Ledger API", href: "/api/vault/ledger?limit=25", note: "Read time-ordered evidence across the Stone Vault." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <span className="font-mono uppercase tracking-[0.35em] text-cyan-200">Goblin + Fabian + GRIPLOOM</span>
          <div className="flex flex-wrap items-center gap-3">
            <a className="transition hover:text-cyan-100" href="/griploom">GRIPLOOM AI</a>
            <a className="transition hover:text-cyan-100" href="/vault">Vault Dashboard</a>
            <span>Lichburn Enclave / 2099-2100 Outpost</span>
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <section>
            <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-sm text-fuchsia-100">
              Fabian LLM • Goblin router • GRIPLOOM production geometry • AWS + Cloudflare bridge
            </p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Build the hyper-enclave brain.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
              Fabian plans, Goblin routes, GRIPLOOM maps production geometry, hyperscripts coordinate, servers execute only after approval, and the 2099-2100 Outpost preserves continuity.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="rounded-full bg-cyan-200 px-5 py-3 font-bold text-black" href="/griploom">Open GRIPLOOM AI</a>
              <a className="rounded-full border border-white/15 px-5 py-3 font-bold text-white" href="/vault">Open Vault Dashboard</a>
              <a className="rounded-full border border-white/15 px-5 py-3 font-bold text-white" href="#algorithm">Open Algorithm</a>
              <a className="rounded-full border border-white/15 px-5 py-3 font-bold text-white" href="#scale">Hyperscale Path</a>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-cyan-950/40 backdrop-blur">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">Progress Lantern</h2>
              <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-sm text-emerald-200">Open Loop</span>
            </div>
            <div className="space-y-5">
              {signals.map((signal) => (
                <div key={signal.label}>
                  <div className="mb-2 flex justify-between text-sm"><span className="font-semibold">{signal.label}</span><span className="text-white/55">{signal.value}%</span></div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300" style={{ width: `${signal.value}%` }} /></div>
                  <p className="mt-1 text-sm text-white/50">{signal.note}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section id="vault" className="grid gap-6 border-t border-white/10 py-12 lg:grid-cols-3">
          <div>
            <h2 className="text-3xl font-black">Stone Vault + GRIPLOOM</h2>
            <p className="mt-3 text-white/65">Operator visibility for manifest, health, ledger, Violet Gate decisions, GRIPLOOM ML scoring, and approval audit evidence.</p>
          </div>
          <div className="grid gap-4 lg:col-span-2 sm:grid-cols-2">
            {vaultDoors.map((door) => (
              <a key={door.href} href={door.href} className="rounded-3xl border border-cyan-200/15 bg-cyan-200/[0.045] p-5 text-white/75 transition hover:border-cyan-200/40 hover:bg-cyan-200/[0.08]">
                <span className="block font-bold text-cyan-100">{door.label}</span>
                <span className="mt-2 block text-sm text-white/55">{door.note}</span>
                <span className="mt-3 block break-all font-mono text-xs text-cyan-100/70">{door.href}</span>
              </a>
            ))}
          </div>
        </section>

        <section id="algorithm" className="grid gap-6 border-t border-white/10 py-12 lg:grid-cols-3">
          <div>
            <h2 className="text-3xl font-black">Algorithm</h2>
            <p className="mt-3 text-white/65">HyperIntent → Fabian plan → Goblin route → GRIPLOOM score → verify → approve → deploy.</p>
          </div>
          <div className="grid gap-4 lg:col-span-2 sm:grid-cols-2">
            {stack.map((item) => <article key={item} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 text-white/75">{item}</article>)}
          </div>
        </section>

        <section id="scale" className="rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.06] p-7 mb-10">
          <h2 className="text-2xl font-black">Hyperscale path</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {scale.map((item) => <div key={item} className="rounded-2xl bg-black/30 p-4 text-cyan-100">{item}</div>)}
          </div>
          <pre className="mt-5 overflow-x-auto rounded-2xl bg-black/40 p-4 text-sm text-cyan-100">{`FABIAN(intent) = listen → decompose → hyperscript → verify → hand-back
GOBLIN(task) = classify → route → track → approve → deploy
GRIPLOOM(signal) = score → challenge → blackletter → publish
OUTPOST = receipts + logs + approval + continuity
STONE_VAULT = manifest + health + ledger + audit evidence`}</pre>
        </section>
      </section>
    </main>
  );
}
