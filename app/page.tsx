const signals = [
  { label: "Listen", value: 100, note: "Reed-breath before command" },
  { label: "Draw", value: 82, note: "Aural cartograph from live tools" },
  { label: "Verify", value: 74, note: "Sources, logs, receipts, human approval" },
  { label: "Deploy", value: 61, note: "AWS-ready, Cloudflare-routed" },
];

const stack = [
  "Commercial LLM router: ChatGPT, Claude, Grok, local models",
  "Goblin algorithm: rank intent, choose model, verify output, keep open loop",
  "ML pattern engines: classify, score, forecast, detect anomalies",
  "Script goblins: fetch, clean, route, check, deploy, notify",
  "Server tower: Next.js app, API routes, logs, receipt spine",
  "AWS path: Amplify or S3 + CloudFront + Route 53",
  "Cloudflare edge: DNS, cache, firewall, Workers algorithm layer",
  "PayPal-ready commerce: checkout links, webhooks, receipts",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex items-center justify-between border-b border-white/10 pb-5 text-sm text-white/60">
          <span className="font-mono uppercase tracking-[0.45em] text-cyan-200">Goblin</span>
          <span>Lichburn Commercial GeneralAI Console</span>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <section>
            <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-sm text-fuchsia-100">
              AWS-ready • Cloudflare algorithm • LLM router • Progress lantern
            </p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">
              Build the Goblin cloud brain.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
              A deployable Lichburn website for commercially available cybernetic intelligence: LLMs, ML engines, scripts, hosted servers, PayPal-ready receipts, and a visible progress system that keeps the Open Loop intact.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="rounded-full bg-cyan-200 px-5 py-3 font-bold text-black" href="#goblin-algorithm">Open Goblin Algorithm</a>
              <a className="rounded-full border border-white/15 px-5 py-3 font-bold text-white" href="#deploy">Deploy Path</a>
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
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-semibold">{signal.label}</span>
                    <span className="text-white/55">{signal.value}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300" style={{ width: `${signal.value}%` }} />
                  </div>
                  <p className="mt-1 text-sm text-white/50">{signal.note}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section id="goblin-algorithm" className="grid gap-6 border-t border-white/10 py-12 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-black">Cloudflare Algorithm: Goblin</h2>
            <p className="mt-3 text-white/65">The edge brain ranks the request, routes the model, checks cost and risk, then requires human approval before consequence.</p>
          </div>
          <div className="grid gap-4 lg:col-span-2 sm:grid-cols-2">
            {stack.map((item) => (
              <article key={item} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 text-white/75">
                {item}
              </article>
            ))}
          </div>
        </section>

        <section id="deploy" className="rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.06] p-7 mb-10">
          <h2 className="text-2xl font-black">Deploy contract</h2>
          <p className="mt-3 text-white/70">
            GitHub holds the source. AWS hosts the app. Cloudflare guards the edge. PayPal records payment as receipts, not hidden debt. Human approval remains the final gate.
          </p>
          <pre className="mt-5 overflow-x-auto rounded-2xl bg-black/40 p-4 text-sm text-cyan-100">{`GOBLIN(request) = listen → classify → route → draft → verify → approve → deploy
Cloudflare Worker = edge gate
AWS Amplify/S3+CloudFront = server tower
PayPal = receipt spine
Progress Lantern = visible task state`}</pre>
        </section>
      </section>
    </main>
  );
}
