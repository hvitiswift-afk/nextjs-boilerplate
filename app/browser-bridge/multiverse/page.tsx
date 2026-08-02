const worlds = [
  {
    code: 'V#',
    name: 'Values and Continuity World',
    universe: 'UNI-V-000001-VALUES-CONTINUITY-ROOT-V1',
    carries: 'Values, authority, identity labels, commitments, evidence, continuity',
  },
  {
    code: 'T#',
    name: 'Temporal and Phase World',
    universe: 'UNI-T-000001-TEMPORAL-BRANCH-ROOT-V1',
    carries: 'Timelines, branches, triggers, forecasts, expiry, backcasts',
  },
  {
    code: 'C#',
    name: 'Control and Closure World',
    universe: 'UNI-C-000001-CONTROL-CLOSURE-ROOT-V1',
    carries: 'Truth, target, privacy, capability, reversibility, consequence, human gate, duplicate, readback, closure',
  },
];

const fences = [
  'Truth & provenance',
  'Identity & exact target',
  'Privacy minimization',
  'Capability',
  'Reversibility',
  'Consequence',
  'Human gate',
  'Duplicate & idempotency',
  'Readback',
  'Closure',
];

const activities = [
  'Messages and replies',
  'Sourced current events',
  'Forecasts and backcasts',
  'Code patches and commits',
  'Tests and artifacts',
  'Commitments and proposals',
  'Generic exchanges',
  'Market observations',
  'Simulation-first trade proposals',
  'Provider-confirmed execution receipts',
];

export default function MultiversePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Armitron v25 · MATADATA · V-10 Transverse
          </p>
          <h1 className="max-w-5xl text-4xl font-semibold tracking-tight md:text-6xl">
            V# T# C# Multiverse Exchange
          </h1>
          <p className="max-w-4xl text-lg leading-8 text-slate-300">
            Separate software worlds with named and numbered universes, scoped
            transfer-and-transform routes, digest-chained activity envelopes,
            destination acceptance, return paths, and explicit closure.
          </p>
        </header>

        <section className="grid gap-5 lg:grid-cols-3">
          {worlds.map((world) => (
            <article key={world.code} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-3xl font-bold text-cyan-200">{world.code}</p>
                  <h2 className="mt-2 text-xl font-semibold">{world.name}</h2>
                </div>
                <span className="rounded-full border border-emerald-800 bg-emerald-950 px-3 py-1 text-xs text-emerald-200">
                  ACTIVE INTERNAL
                </span>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-400">{world.carries}</p>
              <p className="mt-6 break-all rounded-xl bg-slate-950 p-3 font-mono text-xs text-slate-300">
                {world.universe}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              C# ten-fence controller
            </p>
            <h2 className="mt-2 text-3xl font-semibold">No transfer closes early</h2>
            <ol className="mt-7 grid gap-3 sm:grid-cols-2">
              {fences.map((fence, index) => (
                <li key={fence} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-950 font-mono text-sm text-cyan-200">
                    {index + 1}
                  </span>
                  <span className="text-sm text-slate-300">{fence}</span>
                </li>
              ))}
            </ol>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              V-10 route
            </p>
            <h2 className="mt-2 text-3xl font-semibold">Transfer without merger</h2>
            <div className="mt-7 space-y-4 font-mono text-sm">
              <div className="rounded-xl bg-slate-950 p-4">source universe + digest</div>
              <div className="text-center text-cyan-300">↓ explicit transform plan</div>
              <div className="rounded-xl bg-slate-950 p-4">V-10_TRANSVERSE_TRANSFER_TRANSFORM</div>
              <div className="text-center text-cyan-300">↓ ten C# fences</div>
              <div className="rounded-xl bg-slate-950 p-4">arrival + destination acceptance</div>
              <div className="text-center text-cyan-300">↓ return route</div>
              <div className="rounded-xl bg-slate-950 p-4">readback + closure receipt</div>
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Activity exchange
              </p>
              <h2 className="mt-2 text-3xl font-semibold">Messages, events, code, and market objects</h2>
            </div>
            <span className="rounded-full border border-amber-800 bg-amber-950 px-4 py-2 text-xs text-amber-200">
              Live financial execution remains JP + broker protected
            </span>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {activities.map((activity) => (
              <div key={activity} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-sm leading-6 text-slate-300">
                {activity}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-blue-900 bg-blue-950/30 p-5">
            <h2 className="font-semibold text-blue-100">Google Cloud lane</h2>
            <p className="mt-2 text-sm leading-6 text-blue-200/80">
              A2A Agent Card, JSON-RPC endpoint, non-root Cloud Run container,
              GitHub OIDC to Workload Identity Federation, and a protected
              manual deployment workflow are prepared. No deployment or listing
              is claimed without Google readback.
            </p>
          </article>
          <article className="rounded-2xl border border-violet-900 bg-violet-950/30 p-5">
            <h2 className="font-semibold text-violet-100">GitHub enterprise lane</h2>
            <p className="mt-2 text-sm leading-6 text-violet-200/80">
              Enterprise environments, OIDC subject restrictions, review rules,
              and release receipts are designed. The connector still sees only
              the personal installation, so organization transfer remains pending.
            </p>
          </article>
        </section>

        <footer className="rounded-2xl border border-rose-900/70 bg-rose-950/30 p-5 text-sm leading-6 text-rose-100">
          These worlds and universes are software namespaces and internal models.
          They do not merge physical time, observe the future, transmit information
          backward, transfer consciousness or legal identity, or create automatic consent.
        </footer>
      </div>
    </main>
  );
}
