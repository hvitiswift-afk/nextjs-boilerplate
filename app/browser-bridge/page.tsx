import mission from "@/examples/browser-bridge/github-enterprise-signup.mission.json";
import digitalHuman from "@/examples/browser-bridge/digital-human.profile.json";
import { browserBridgeStates } from "@/lib/browser-bridge/protocol";

const actorLanes = [
  {
    actor: "Digital Mind",
    responsibility: "Mission intent, policy, ordinary field mappings, calendar context, truth states, receipts, and encrypted backward-looking notes."
  },
  {
    actor: "Digital Body",
    responsibility: "Loopback browser control, fresh control discovery, ordinary entry, pressure intents, visible state, and local-only action receipts."
  },
  {
    actor: "JP",
    responsibility: "Password/passkey, MFA, CAPTCHA, identity, legal acceptance, signature, payment, final protected Create action, and final approval."
  },
  {
    actor: "GitHub",
    responsibility: "Authoritative controls, validation, enterprise creation, trial state, ownership readback, and provider confirmation."
  }
];

const pressureStages = [
  ["1/128", "touch detect"],
  ["1/64", "hover"],
  ["1/32", "focus"],
  ["1/16", "select"],
  ["1/8", "type mode"],
  ["1/4", "activate after release"],
  ["1/2", "ordinary confirmation"],
  ["full", "ordinary confirmation or protected handoff"]
];

const phaseLabels: Record<string, string> = {
  DRAFT: "Mission being defined",
  PREPARED: "Values and gates reviewed",
  BROWSER_OPENING: "Allowlisted provider page opening",
  HANDOFF_REQUIRED: "JP authentication or verification needed",
  AUTHENTICATED: "Provider session authenticated",
  FILLING: "Companion filling approved ordinary fields",
  FILLED_VERIFIED: "Live values re-read and matched",
  HUMAN_APPROVAL_REQUIRED: "Final consequence shown to JP",
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
          <span>MATADATA • Human ↔ Agent Browser Bridge</span>
        </nav>

        <section className="py-12">
          <p className="mb-4 inline-flex rounded-full border border-cyan-200/30 bg-cyan-200/10 px-4 py-2 text-sm text-cyan-100">
            P1 • local companion implemented • authenticated run required
          </p>
          <h1 className="max-w-5xl text-5xl font-black tracking-tight sm:text-7xl">
            Digital Mind plus Digital Body, composed into a JP-controlled Digital Human browser rail.
          </h1>
          <p className="mt-6 max-w-4xl text-lg leading-8 text-white/72">
            The local companion can prepare and fill ordinary account fields while JP retains credentials, identity,
            legal consent, payment, and the final protected action. No public remote desktop or external tunnel is required.
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
              <span className="max-w-sm rounded-full border border-amber-200/25 bg-amber-200/10 px-4 py-2 text-center text-xs text-amber-100">
                {mission.truthState}
              </span>
            </div>

            <dl className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-white/45">Account</dt>
                <dd className="mt-2 font-mono text-cyan-100">{mission.accountLogin}</dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-white/45">Local endpoint</dt>
                <dd className="mt-2 font-mono text-cyan-100">{mission.localCompanion.endpoint}</dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-white/45">Allowed origin</dt>
                <dd className="mt-2 font-mono text-cyan-100">{mission.allowedOrigins[0]}</dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-white/45">External tunnel</dt>
                <dd className="mt-2 font-mono text-emerald-100">{String(mission.localCompanion.externalTunnel)}</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href={mission.targetUrl} target="_blank" rel="noreferrer" className="rounded-full bg-cyan-200 px-5 py-3 font-black text-black">
                Open GitHub signup
              </a>
              <a href="https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/260" target="_blank" rel="noreferrer" className="rounded-full border border-white/15 bg-white/[0.05] px-5 py-3 font-black text-white">
                View P1 issue
              </a>
            </div>
          </article>

          <article className="rounded-[2rem] border border-violet-200/20 bg-violet-200/[0.05] p-7">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-violet-200">Scheduled handoff</p>
            <h2 className="mt-3 text-3xl font-black">Tuesday, August 4</h2>
            <p className="mt-3 text-xl text-white">2:00–4:00 PM America/Detroit</p>
            <p className="mt-4 leading-7 text-white/68">
              The existing JavaScript, Browser Automation &amp; Forms Upgrade block is the live companion and GitHub Enterprise trial setup window.
            </p>
            <div className="mt-6 rounded-2xl border border-amber-200/20 bg-amber-200/[0.06] p-4 text-sm leading-6 text-amber-50">
              Calendar presence is a preparation receipt. It is not proof that the trial was created.
            </div>
          </article>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {actorLanes.map((lane) => (
            <article key={lane.actor} className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/45">{lane.actor}</p>
              <p className="mt-4 leading-7 text-white/72">{lane.responsibility}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-emerald-200/20 bg-emerald-200/[0.045] p-7">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-200">Digital Human boundary</p>
            <h2 className="mt-3 text-3xl font-black">{digitalHuman.digitalHuman.identityState}</h2>
            <p className="mt-4 leading-7 text-white/68">{digitalHuman.digitalHuman.definition}</p>
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white/65">
              It is not mind-reading, biological capture, legal identity transfer, automatic consent, provider ownership, or independent authority.
            </div>
          </article>

          <article className="rounded-[2rem] border border-amber-200/20 bg-amber-200/[0.045] p-7">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-amber-200">Recovered MATADATA source</p>
            <h2 className="mt-3 text-3xl font-black">{mission.sourceRecovery.latestPreservedArtifact}</h2>
            <p className="mt-4 leading-7 text-white/68">
              Created {mission.sourceRecovery.createdAtUtc}. The original chat title was not exposed by retained metadata,
              so P1 cites the preserved artifact rather than inventing a title.
            </p>
          </article>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.035] p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-200">Mission fields</p>
              <h2 className="mt-3 text-3xl font-black">Ordinary values fill locally and are re-read live</h2>
            </div>
            <span className="text-sm text-white/50">Private email resolves from the local environment.</span>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.2em] text-white/45">
                <tr>
                  <th className="px-4 py-2">Field</th>
                  <th className="px-4 py-2">Reviewed source</th>
                  <th className="px-4 py-2">Agent/body</th>
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

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.045] p-7">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-200">MATADATA pressure rail</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {pressureStages.map(([pressure, meaning]) => (
                <div key={pressure} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-mono text-cyan-100">{pressure}</p>
                  <p className="mt-2 text-sm text-white/62">{meaning}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-rose-200/20 bg-rose-200/[0.045] p-7">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-rose-200">JP-only gates</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {mission.humanOnlyGates.map((gate) => (
                <span key={gate} className="rounded-full border border-rose-200/20 bg-black/25 px-3 py-2 text-sm text-rose-50">
                  {gate.replaceAll("_", " ")}
                </span>
              ))}
            </div>
          </article>
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
          <h2 className="text-3xl font-black">P1 truth law</h2>
          <pre className="mt-5 overflow-x-auto rounded-2xl bg-black/40 p-5 text-sm leading-7 text-emerald-100">{`DIGITAL HUMAN = DIGITAL MIND + DIGITAL BODY UNDER JP CONTROL
LOCAL COMPANION READY ≠ SIGNED UP
SIGNED IN ≠ TERMS ACCEPTED
FIELDS FILLED ≠ SUBMITTED
CREATE CLICKED ≠ CONFIRMED
CALENDAR EVENT ≠ COMPLETION
OUTCOME UNKNOWN = NO BLIND RETRY
CONFIRMED = POSITIVE AUTHENTICATED GITHUB READBACK`}</pre>
        </section>
      </section>
    </main>
  );
}
