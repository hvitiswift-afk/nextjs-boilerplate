import mission from "@/examples/browser-bridge/github-enterprise-signup.mission.json";
import { browserBridgeStates } from "@/lib/browser-bridge/protocol";

const actorLanes = [
  {
    actor: "Agent",
    responsibility: "Prepare reviewed values, resolve fresh controls, fill non-sensitive fields, verify live values, and preserve exactly-once execution."
  },
  {
    actor: "Human",
    responsibility: "Complete password, passkey, 2FA, CAPTCHA, identity, legal acknowledgment, signature, and payment steps."
  },
  {
    actor: "Provider",
    responsibility: "Render authoritative controls, validate the request, create the account, and return positive confirmation evidence."
  }
];

const phaseLabels: Record<string, string> = {
  DRAFT: "Mission being defined",
  PREPARED: "Values and gates reviewed",
  BROWSER_OPENING: "Allowlisted provider page opening",
  HANDOFF_REQUIRED: "Human authentication or verification needed",
  AUTHENTICATED: "Provider session authenticated",
  FILLING: "Agent filling approved fields",
  FILLED_VERIFIED: "Live values re-read and matched",
  HUMAN_APPROVAL_REQUIRED: "Final consequence shown to human",
  SUBMIT_AUTHORIZED: "One exact action authorized",
  SUBMITTING: "One create action in flight",
  CONFIRMED: "Positive provider evidence received",
  BLOCKED: "Stopped with a named blocker",
  OUTCOME_UNKNOWN: "No retry until reconciled",
  CANCELLED: "Mission ended without submission"
};

export default function BrowserBridgePage() {
  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.35em] text-cyan-200" href="/">
            JP Systems Hub
          </a>
          <span>Human ↔ Agent Browser Bridge</span>
        </nav>

        <section className="py-12">
          <p className="mb-4 inline-flex rounded-full border border-amber-200/30 bg-amber-200/10 px-4 py-2 text-sm text-amber-100">
            P0 • prepared • shared authenticated browser required
          </p>
          <h1 className="max-w-5xl text-5xl font-black tracking-tight sm:text-7xl">
            One browser mission, with the agent and human each holding the right part.
          </h1>
          <p className="mt-6 max-w-4xl text-lg leading-8 text-white/72">
            The bridge prepares and verifies ordinary form fields while preserving human control over credentials,
            identity, verification, legal acknowledgment, payment, and the final consequence.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.05] p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-200">Current mission</p>
                <h2 className="mt-3 text-3xl font-black">{mission.title}</h2>
                <p className="mt-3 max-w-3xl leading-7 text-white/68">{mission.purpose}</p>
              </div>
              <span className="rounded-full border border-amber-200/25 bg-amber-200/10 px-4 py-2 text-sm text-amber-100">
                {mission.truthState}
              </span>
            </div>

            <dl className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-white/45">Account</dt>
                <dd className="mt-2 font-mono text-cyan-100">{mission.accountLogin}</dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-white/45">Allowed origin</dt>
                <dd className="mt-2 font-mono text-cyan-100">{mission.allowedOrigins[0]}</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={mission.targetUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-cyan-200 px-5 py-3 font-black text-black"
              >
                Open GitHub signup
              </a>
              <a
                href="https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/258"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 bg-white/[0.05] px-5 py-3 font-black text-white"
              >
                View mission issue
              </a>
            </div>
          </article>

          <article className="rounded-[2rem] border border-violet-200/20 bg-violet-200/[0.05] p-7">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-violet-200">Current blocker</p>
            <h2 className="mt-3 text-3xl font-black">Authenticated browser continuity</h2>
            <p className="mt-4 leading-7 text-white/68">
              The repository connector can write code and GitHub objects, but it cannot create the enterprise account.
              The current isolated Chromium session is also blocked from the signup URL.
            </p>
            <div className="mt-6 rounded-2xl border border-amber-200/20 bg-amber-200/[0.06] p-4 text-sm leading-6 text-amber-50">
              Required repair: resume this mission in a browser surface shared by JP and the agent, keeping JP in control of login and human-only gates.
            </div>
          </article>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          {actorLanes.map((lane) => (
            <article key={lane.actor} className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/45">{lane.actor} lane</p>
              <p className="mt-4 leading-7 text-white/72">{lane.responsibility}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.035] p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-200">Mission fields</p>
              <h2 className="mt-3 text-3xl font-black">Agent-fillable, but re-read from the live page</h2>
            </div>
            <span className="text-sm text-white/50">No passwords or payment data are committed.</span>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.2em] text-white/45">
                <tr>
                  <th className="px-4 py-2">Field</th>
                  <th className="px-4 py-2">Reviewed source</th>
                  <th className="px-4 py-2">Agent</th>
                  <th className="px-4 py-2">Verification</th>
                </tr>
              </thead>
              <tbody>
                {mission.fields.map((field) => {
                  const reviewedSource =
                    "publicValue" in field
                      ? String(field.publicValue)
                      : "privateRuntimeSource" in field
                        ? `runtime: ${field.privateRuntimeSource}`
                        : "candidateValues" in field
                          ? field.candidateValues.join(" → ")
                          : "review required";

                  return (
                    <tr key={field.key} className="bg-black/25 text-white/72">
                      <td className="rounded-l-2xl px-4 py-4 font-semibold text-white">{field.label}</td>
                      <td className="px-4 py-4 font-mono text-xs text-cyan-100">{reviewedSource}</td>
                      <td className="px-4 py-4">{field.agentFillAllowed ? "fill + verify" : "human only"}</td>
                      <td className="rounded-r-2xl px-4 py-4">{field.verification}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-rose-200/20 bg-rose-200/[0.045] p-7">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-rose-200">Human-only gates</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {mission.humanOnlyGates.map((gate) => (
              <span key={gate} className="rounded-full border border-rose-200/20 bg-black/25 px-3 py-2 text-sm text-rose-50">
                {gate.replaceAll("_", " ")}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.045] p-7">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-200">Resumable state rail</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {browserBridgeStates.map((state, index) => (
              <div key={state} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="font-mono text-xs text-white/40">{String(index + 1).padStart(2, "0")}</p>
                <p className="mt-2 font-black text-white">{state}</p>
                <p className="mt-2 text-sm leading-6 text-white/58">{phaseLabels[state]}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-emerald-200/20 bg-emerald-200/[0.045] p-7">
          <h2 className="text-3xl font-black">Completion law</h2>
          <pre className="mt-5 overflow-x-auto rounded-2xl bg-black/40 p-5 text-sm leading-7 text-emerald-100">{`PREPARED ≠ SIGNED UP
AUTHENTICATED ≠ AUTHORIZED TO ACCEPT TERMS
FILLED_VERIFIED ≠ SUBMITTED
SUBMITTING ≠ CONFIRMED
OUTCOME_UNKNOWN = NO BLIND RETRY
CONFIRMED = POSITIVE GITHUB READBACK + EXACTLY ONE CREATE ACTION`}</pre>
        </section>
      </section>
    </main>
  );
}
