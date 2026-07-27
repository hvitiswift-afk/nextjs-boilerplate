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
    title: "Transactional exactly-once state",
    text: "Serializable persistence selects one submission winner, replays the stored record, and preserves unknown outcomes without a blind retry.",
  },
  {
    title: "Reference-matched confirmation",
    text: "The confirmation page, email, and durable receipt must carry the same reference ID and evidence digest.",
  },
];

const blockerExamples = [
  {
    code: "FIELD_INVALID",
    severity: "Error",
    audience: "Applicant",
    action: "Show the field message and require correction before acknowledgment.",
  },
  {
    code: "HUMAN_VERIFICATION_REQUIRED",
    severity: "Warning",
    audience: "Applicant",
    action: "Return control to the person; automation does not solve or bypass the challenge.",
  },
  {
    code: "UNTRUSTED_ORIGIN",
    severity: "Critical",
    audience: "Operator",
    action: "Stop immediately and preserve the origin receipt.",
  },
  {
    code: "SUBMISSION_STATUS_UNKNOWN_NO_RETRY",
    severity: "Critical",
    audience: "Operator",
    action: "Reconcile the destination record; never create a second submission action.",
  },
];

const transactionRail = [
  "Verify origin, fields, human step, and current acknowledgment",
  "Create or replay the idempotency record inside a serializable transaction",
  "Permit one consequential submission action",
  "Confirm with a reference ID or enter terminal unknown-outcome state",
  "Append a SHA-256-linked receipt event",
];

const confirmationSurfaces = [
  { label: "Page", detail: "SUBMITTED status, reference ID, confirmation digest, and receipt URL" },
  { label: "Email", detail: "The same reference in the subject, body, and X-MATADATA-Reference header" },
  { label: "Receipt", detail: "Idempotency key, payload digest, reference ID, evidence digest, and one action" },
];

export default function MatadataIntakePage() {
  return (
    <main className="min-h-screen bg-[#07070b] px-6 py-12 text-[#f5efe2] sm:px-10">
      <div className="mx-auto max-w-6xl">
        <a className="text-sm text-cyan-200 hover:text-cyan-100" href="/">
          ← JP Systems Hub
        </a>

        <section className="mt-10 rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.06] p-8 sm:p-12">
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-cyan-200">MATADATA • Resilient Intake P1</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
            Explain every blocker. Persist one action. Match every confirmation.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
            JP&apos;s successful grant-intake debugging is now a reusable architecture for dynamic form recovery, personal acknowledgment, transactional idempotency, structured operator guidance, and confirmation references that agree across page, email, and receipt.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-emerald-300/10 px-4 py-2 text-emerald-200">P1 implemented for review</span>
            <span className="rounded-full bg-white/10 px-4 py-2 text-white/70">13 stable fields</span>
            <span className="rounded-full bg-white/10 px-4 py-2 text-white/70">Serializable transaction contract</span>
            <span className="rounded-full bg-white/10 px-4 py-2 text-white/70">One action enforced in database</span>
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

        <section className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/[0.025] p-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-fuchsia-200">Blocker UX</p>
            <h2 className="mt-3 text-3xl font-black">A disabled Submit control must explain itself.</h2>
            <p className="mt-3 leading-7 text-white/65">
              Each reason includes severity, audience, a concrete next action, and a retry policy: after-fix, human-only, replay-only, or never.
            </p>
          </div>
          <div className="grid gap-4">
            {blockerExamples.map((blocker) => (
              <article key={blocker.code} className="rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/[0.05] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <code className="text-sm font-bold text-fuchsia-100">{blocker.code}</code>
                  <span className="rounded-full bg-black/30 px-3 py-1 text-xs text-white/65">
                    {blocker.severity} • {blocker.audience}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/65">{blocker.action}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-8 rounded-[2rem] border border-cyan-200/15 bg-cyan-200/[0.035] p-8 lg:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-200">Transactional rail</p>
            <h2 className="mt-3 text-3xl font-black">One idempotency key, one reviewed payload, one action.</h2>
            <ol className="mt-6 space-y-3">
              {transactionRail.map((step, index) => (
                <li key={step} className="flex gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-white/70">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-200/15 font-mono text-sm text-cyan-100">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-emerald-200">Confirmation parity</p>
            <h2 className="mt-3 text-3xl font-black">The same reference follows the submission everywhere.</h2>
            <div className="mt-6 space-y-3">
              {confirmationSurfaces.map((surface) => (
                <article key={surface.label} className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.045] p-5">
                  <h3 className="font-bold text-emerald-100">{surface.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">{surface.detail}</p>
                </article>
              ))}
            </div>
            <p className="mt-4 rounded-2xl border border-amber-200/15 bg-amber-200/[0.045] p-4 text-sm leading-6 text-amber-100/85">
              A mismatch is a reconciliation blocker, not permission to submit again.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] border border-amber-200/20 bg-amber-200/[0.05] p-8">
          <h2 className="text-2xl font-black text-amber-100">Provenance and boundary</h2>
          <p className="mt-3 max-w-4xl leading-7 text-white/68">
            Justin Lee Rackham (JP) is the source of the non-confidential process findings and implementation direction. JP remains the human authority for CAPTCHA, identity, signature, acknowledgment, approval, and consequential submission. This work does not claim OpenAI affiliation, endorsement, employment, grant approval, partnership, compensation, or adoption.
          </p>
        </section>
      </div>
    </main>
  );
}
