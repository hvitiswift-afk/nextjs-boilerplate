const zoomRows = [
  ['Macro', 'Project, mission, outcome, major unresolved issue'],
  ['Meso', 'Stage, decision, actor, dependency, risk, handoff'],
  ['Micro', 'Page, control, ordinary action, pressure state, validation'],
  ['Nano', 'Event pointer, timing, digest, redacted evidence, correction link'],
];

const systemRows = [
  ['Armitron', 'Time, watchdogs, deadlines, receipts, authentication state, recall'],
  ['MATADATA', 'Pressure intent, ordinary form help, protected-step handoff'],
  ['Mind System', 'Mission framing, reasoning support, risk and truth-state separation'],
  ['Body System', 'Browser surface, controls, ordinary entry, visible handoff'],
  ['Digital Self', 'Plan, summarize, route, record, recall, prepare artifacts'],
  ['Agent Bridge', 'Continuity across browser, email, GitHub, Calendar, and notes'],
];

export default function ArmitronBrowserPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-400">
            VSHARP-COMP-ARMITRON-001 · MATADATA
          </p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
            Armitron Digital Human Browser
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-zinc-300">
            A consent-gated operator surface joining time, pressure, browser action,
            authentication state, provider readback, and encrypted microscope recall
            under JP&apos;s human final authority.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {systemRows.map(([name, description]) => (
            <article key={name} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h2 className="text-lg font-semibold">{name}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 md:p-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Microscope Recall
              </p>
              <h2 className="mt-2 text-3xl font-semibold">Micro ↔ Macro continuity</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-zinc-400">
              Notes are encrypted and append-only. Public receipts contain hashes and
              pointers, never note text, credentials, or protected identity material.
            </p>
          </div>
          <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800">
            {zoomRows.map(([zoom, description], index) => (
              <div
                key={zoom}
                className={`grid gap-2 px-5 py-4 md:grid-cols-[140px_1fr] ${
                  index === 0 ? '' : 'border-t border-zinc-800'
                }`}
              >
                <strong>{zoom}</strong>
                <span className="text-zinc-400">{description}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-2xl font-semibold">Authentication law</h2>
            <p className="mt-4 leading-7 text-zinc-400">
              Armitron records authentication and authorization state, but passwords,
              passkeys, MFA, CAPTCHA, liveness, identity attestation, recovery, legal
              acceptance, payment, and final consequential actions remain human-only.
            </p>
            <div className="mt-6 rounded-xl bg-zinc-950 p-4 font-mono text-sm text-zinc-300">
              human protected step → provider readback pending → provider confirmed
            </div>
          </article>

          <article className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-2xl font-semibold">Current native-app truth</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-zinc-800 pb-3">
                <dt className="text-zinc-400">Remote MCP code</dt>
                <dd>Prepared</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-zinc-800 pb-3">
                <dt className="text-zinc-400">Remote deployment</dt>
                <dd>Not connected</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-zinc-800 pb-3">
                <dt className="text-zinc-400">OAuth issuer</dt>
                <dd>Not configured</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-400">Google delegated accounts</dt>
                <dd>Not granted</dd>
              </div>
            </dl>
          </article>
        </section>

        <footer className="rounded-2xl border border-amber-900/60 bg-amber-950/30 p-5 text-sm leading-6 text-amber-100">
          Digital Human is a symbolic, user-controlled software and accessibility
          layer. It is not mind reading, neural capture, biological body capture,
          consciousness transfer, legal identity transfer, automatic consent, or
          independent personhood.
        </footer>
      </div>
    </main>
  );
}
