const foundations = [
  {
    title: "Stable field contract",
    text: "Versioned names, duplicate detection, fresh resolution after rerenders, and complete-value verification.",
  },
  {
    title: "Human-only acknowledgment",
    text: "Interactive-control and terms-on-submit modes keep CAPTCHA, identity, signature, and acknowledgment personal.",
  },
  {
    title: "Exactly-once submission",
    text: "A server-style idempotency ledger permits one action, replays the original result, and never retries an unknown outcome blindly.",
  },
  {
    title: "Tamper-evident receipts",
    text: "Each event links to the previous SHA-256 hash while normal receipts store lengths and digests instead of proposal bodies.",
  },
];

const blockers = [
  "FIELD_MISSING",
  "FIELD_DUPLICATE",
  "FIELD_MISMATCH",
  "FIELD_INVALID",
  "HUMAN_VERIFICATION_REQUIRED",
  "ACKNOWLEDGMENT_TEXT_CHANGED",
  "UNTRUSTED_ORIGIN",
  "SUBMISSION_STATUS_UNKNOWN_NO_RETRY",
];

export default function MatadataIntakePage() {
  return (
    <main className="min-h-screen bg-[#07070b] px-6 py-12 text-[#f5efe2] sm:px-10">
      <div className="mx-auto max-w-6xl">
        <a className="text-sm text-cyan-200 hover:text-cyan-100" href="/">
          ← JP Systems Hub
        </a>

        <section className="mt-10 rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.06] p-8 sm:p-12">
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-cyan-200">MATADATA • Resilient Intake</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
            Public forms should explain, recover, and submit exactly once.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
            This baseline turns JP&apos;s successful grant-intake debugging work into reusable safeguards for dynamic forms, personal acknowledgment, low-bandwidth recovery, idempotent submission, and durable confirmation receipts.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-emerald-300/10 px-4 py-2 text-emerald-200">P0 foundation implemented</span>
            <span className="rounded-full bg-white/10 px-4 py-2 text-white/70">13 stable fields tested</span>
            <span className="rounded-full bg-white/10 px-4 py-2 text-white/70">Full rerender recovery tested</span>
            <span className="rounded-full bg-white/10 px-4 py-2 text-white/70">Unknown outcome never retried</span>
          </div>
        </section>

        <section className="grid gap-5 py-10 md:grid-cols-2">
          {foundations.map((foundation) => (
            <article key={foundation.title} className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
              <h2 className="text-xl font-bold text-cyan-100">{foundation.title}</h2>
              <p className="mt-3 leading-7 text-white/65">{foundation.text}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/[0.025] p-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-black">Structured blockers</h2>
            <p className="mt-3 leading-7 text-white/65">
              A disabled Submit control should never be a mystery. The baseline returns explicit reason codes that a UI can announce and an operator can diagnose.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {blockers.map((blocker) => (
              <code key={blocker} className="rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/[0.05] p-4 text-sm text-fuchsia-100">
                {blocker}
              </code>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] border border-amber-200/20 bg-amber-200/[0.05] p-8">
          <h2 className="text-2xl font-black text-amber-100">Provenance and boundary</h2>
          <p className="mt-3 max-w-4xl leading-7 text-white/68">
            Justin Lee Rackham (JP) is the source of the non-confidential process findings and implementation direction. This attribution does not claim OpenAI affiliation, endorsement, employment, grant approval, partnership, compensation, or adoption.
          </p>
        </section>
      </div>
    </main>
  );
}
