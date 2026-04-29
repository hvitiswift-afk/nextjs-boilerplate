const readDoors = [
  {
    name: "Manifest",
    href: "/api/vault/manifest",
    method: "GET",
    note: "Discover every durable route and approval-authority marker."
  },
  {
    name: "Health",
    href: "/api/vault/health",
    method: "GET",
    note: "Check durable table counts, including approval decision audit storage."
  },
  {
    name: "Ledger",
    href: "/api/vault/ledger?limit=25",
    method: "GET",
    note: "Inspect time-ordered memory, approval, audit, progress, outpost, and receipt evidence."
  }
];

const ledgerFilters = [
  { label: "Approvals", href: "/api/vault/ledger?kind=approval&limit=25" },
  { label: "Approval audit", href: "/api/vault/ledger?kind=approval-audit&limit=25" },
  { label: "Pending", href: "/api/vault/ledger?status=pending&limit=25" },
  { label: "Approved", href: "/api/vault/ledger?status=approved&limit=25" },
  { label: "Rejected", href: "/api/vault/ledger?status=rejected&limit=25" },
  { label: "Progress", href: "/api/vault/ledger?kind=progress&limit=25" },
  { label: "ML memory", href: "/api/vault/ledger?kind=memory&limit=25" },
  { label: "Outpost", href: "/api/vault/ledger?kind=outpost&limit=25" },
  { label: "Receipts", href: "/api/vault/ledger?kind=receipt&limit=25" }
];

const operatorActionCards = [
  {
    title: "Operator forms",
    href: "/vault/operator-forms",
    status: "live POST forms",
    body: "Create approval evidence and submit Violet Gate decisions from visible forms."
  },
  {
    title: "Pending approval review",
    href: "/api/vault/ledger?kind=approval&status=pending&limit=25",
    status: "review queue",
    body: "Inspect pending approval records before creating a decision."
  },
  {
    title: "Decision audit",
    href: "/api/vault/ledger?kind=approval-audit&limit=25",
    status: "transition evidence",
    body: "Verify approval transitions after a decision form is submitted."
  }
];

const approvalReviewCards = [
  {
    title: "Create approval evidence",
    method: "POST",
    endpoint: "/api/approval",
    status: "visible request",
    body: "Create a pending approval record for a gated task before any consequence-bearing execution."
  },
  {
    title: "Review pending approvals",
    method: "GET",
    endpoint: "/api/vault/ledger?kind=approval&status=pending&limit=25",
    status: "operator review",
    body: "Inspect pending approval rows in the ledger before deciding."
  },
  {
    title: "Decide with Violet Gate",
    method: "POST",
    endpoint: "/api/approval/decision",
    status: "explicit decision",
    body: "Approve or reject a pending approval with decidedBy and note evidence."
  }
];

const approvalCommandBlocks = [
  {
    title: "Create",
    code: `curl -X POST http://localhost:3000/api/approval \\
  -H "content-type: application/json" \\
  -d '{
    "id": "approval-demo-gated",
    "taskId": "execute-demo-gated",
    "risk": "needs-approval",
    "requestedAction": "Approve the gated demo execution."
  }'`
  },
  {
    title: "Approve",
    code: `curl -X POST http://localhost:3000/api/approval/decision \\
  -H "content-type: application/json" \\
  -d '{
    "id": "approval-demo-gated",
    "status": "approved",
    "decidedBy": "manual-operator",
    "note": "Approved after reviewing the gated demo execution."
  }'`
  },
  {
    title: "Reject",
    code: `curl -X POST http://localhost:3000/api/approval/decision \\
  -H "content-type: application/json" \\
  -d '{
    "id": "approval-demo-gated",
    "status": "rejected",
    "decidedBy": "manual-operator",
    "note": "Rejected because the request was not ready."
  }'`
  }
];

const progressTimelineCards = [
  {
    title: "Task trail",
    href: "/api/vault/ledger?kind=progress&taskId=execute-demo-gated&limit=25",
    status: "task-specific",
    body: "Follow progress rows for a single gated task without changing approval state."
  },
  {
    title: "All progress",
    href: "/api/vault/ledger?kind=progress&limit=25",
    status: "timeline",
    body: "Inspect recent progress events across tasks from the unified ledger."
  },
  {
    title: "Complete steps",
    href: "/api/vault/ledger?kind=progress&status=complete&limit=25",
    status: "completion evidence",
    body: "See completion evidence while keeping completion separate from authorization."
  }
];

const mlEvidenceCards = [
  {
    title: "ML memory lane",
    href: "/api/vault/ledger?kind=memory&limit=25",
    status: "model context",
    body: "Inspect durable memory rows where model plans, prompts, or adapter notes can be recorded."
  },
  {
    title: "ML provider receipts",
    href: "/api/vault/ledger?kind=receipt&limit=25",
    status: "provider evidence",
    body: "Review receipt evidence for future model calls, costs, and provider adapter outputs."
  },
  {
    title: "ML gated task",
    href: "/api/vault/ledger?taskId=ml-demo-inference&limit=25",
    status: "approval boundary",
    body: "Trace a sample ML task across approvals, progress, audit rows, and receipts without granting execution."
  }
];

const outpostRoundTripCards = [
  {
    title: "Outbound entries",
    href: "/api/vault/ledger?kind=outpost&status=outbound&limit=25",
    status: "send evidence",
    body: "Inspect records that left the Vault for Outpost routing."
  },
  {
    title: "Inbound returns",
    href: "/api/vault/ledger?kind=outpost&status=inbound&limit=25",
    status: "return evidence",
    body: "Inspect records that returned through the Outpost return path."
  },
  {
    title: "Round-trip ledger",
    href: "/api/vault/ledger?kind=outpost&limit=25",
    status: "continuity trace",
    body: "See recent Outpost entries as a continuity trail without treating return as approval."
  }
];

const receiptCards = [
  {
    title: "All receipts",
    href: "/api/vault/ledger?kind=receipt&limit=25",
    status: "receipt evidence",
    body: "Inspect recent receipts across providers, operations, and return paths."
  },
  {
    title: "Completed receipts",
    href: "/api/vault/ledger?kind=receipt&status=complete&limit=25",
    status: "completion evidence",
    body: "View completed receipt records without treating completion as approval."
  },
  {
    title: "Pending receipts",
    href: "/api/vault/ledger?kind=receipt&status=pending&limit=25",
    status: "pending evidence",
    body: "Find receipts that still need reconciliation, review, or return-path inspection."
  }
];

const operatorCards = [
  {
    title: "Violet Gate",
    status: "explicit approval only",
    body: "Approval creation, decision, and audit are separate visible acts."
  },
  {
    title: "Audit Vault",
    status: "transition evidence",
    body: "Every persisted decision writes an approval_decision_audit_records row."
  },
  {
    title: "Ledger View",
    status: "evidence only",
    body: "Filters narrow the visible timeline without granting authorization."
  }
];

const laws = [
  "Dashboard visibility does not authorize execution.",
  "Operator forms post visible evidence, not hidden execution.",
  "Health is diagnostic, not approval.",
  "Ledger rows are evidence, not approval.",
  "Progress timeline cards are evidence, not approval.",
  "ML evidence cards are receipts and memory, not approval.",
  "Outpost round-trip cards are continuity evidence, not approval.",
  "Receipt cards are reconciliation evidence, not approval.",
  "Approval decision audit rows are transition evidence, not execution.",
  "Only Violet Gate authorizes consequence-bearing work."
];

export default function VaultDashboardPage() {
  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.35em] text-cyan-200" href="/">Goblin + Fabian</a>
          <div className="flex flex-wrap items-center gap-3">
            <a className="transition hover:text-cyan-100" href="/vault/operator-forms">Operator Forms</a>
            <span>Stone Vault Operator Dashboard</span>
          </div>
        </nav>

        <section className="py-14">
          <p className="mb-4 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
            Phase 3 • health • manifest • ledger • operator forms • approval review • progress timeline • ML lane • Outpost • receipts
          </p>
          <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">Operate the Stone Vault without guessing.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/72">
            This dashboard gives an operator quick doors into the manifest, health checks, ledger filters, live approval forms, Violet Gate decisions, approval review, progress timelines, ML evidence, Outpost round trips, receipts, and approval audit evidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="rounded-full bg-violet-200 px-5 py-3 font-black text-black" href="/vault/operator-forms">Open Operator Forms</a>
            <a className="rounded-full border border-white/15 px-5 py-3 font-bold text-white" href="/api/vault/ledger?kind=approval&status=pending&limit=25">Review pending approvals</a>
            <a className="rounded-full border border-white/15 px-5 py-3 font-bold text-white" href="/api/vault/ledger?kind=approval-audit&limit=25">Verify audit</a>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {readDoors.map((door) => (
            <a key={door.name} href={door.href} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-cyan-950/30 transition hover:border-cyan-200/40 hover:bg-cyan-200/[0.06]">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black">{door.name}</h2>
                <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-xs text-cyan-100">{door.method}</span>
              </div>
              <p className="text-white/65">{door.note}</p>
              <p className="mt-5 font-mono text-sm text-cyan-100">{door.href}</p>
            </a>
          ))}
        </section>

        <section className="mt-8 rounded-[2rem] border border-violet-200/20 bg-violet-200/[0.05] p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">Operator actions</h2>
              <p className="mt-2 text-white/65">Use forms for explicit approval work, then verify pending and audit evidence in the ledger.</p>
            </div>
            <a className="rounded-full border border-white/15 px-4 py-2 font-bold text-white" href="/vault/operator-forms">Open forms</a>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {operatorActionCards.map((card) => (
              <a key={card.title} href={card.href} className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5 transition hover:border-violet-100/40 hover:bg-black/35">
                <h3 className="text-xl font-black">{card.title}</h3>
                <p className="mt-3 inline-flex rounded-full bg-violet-300/10 px-3 py-1 text-sm text-violet-100">{card.status}</p>
                <p className="mt-4 text-sm text-white/65">{card.body}</p>
                <p className="mt-4 break-all font-mono text-xs text-violet-100/70">{card.href}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-violet-200/20 bg-violet-200/[0.05] p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">Approval review</h2>
              <p className="mt-2 text-white/65">Create approval evidence, inspect pending rows, then decide explicitly through Violet Gate.</p>
            </div>
            <a className="rounded-full border border-white/15 px-4 py-2 font-bold text-white" href="/api/vault/ledger?kind=approval&status=pending&limit=25">Open pending approvals</a>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {approvalReviewCards.map((card) => (
              <a key={card.title} href={card.endpoint} className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5 transition hover:border-violet-100/40 hover:bg-black/35">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-black">{card.title}</h3>
                  <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-xs text-violet-100">{card.method}</span>
                </div>
                <p className="mt-3 inline-flex rounded-full bg-violet-300/10 px-3 py-1 text-sm text-violet-100">{card.status}</p>
                <p className="mt-4 text-sm text-white/65">{card.body}</p>
                <p className="mt-4 break-all font-mono text-xs text-violet-100/70">{card.endpoint}</p>
              </a>
            ))}
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {approvalCommandBlocks.map((block) => (
              <article key={block.title} className="rounded-[1.5rem] bg-black/35 p-5">
                <h3 className="text-lg font-black text-violet-100">{block.title}</h3>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-black/40 p-4 text-xs leading-6 text-cyan-100">{block.code}</pre>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-emerald-200/20 bg-emerald-200/[0.05] p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">Progress timeline</h2>
              <p className="mt-2 text-white/65">Follow task progress, recent progress events, and completion evidence without granting approval.</p>
            </div>
            <a className="rounded-full border border-white/15 px-4 py-2 font-bold text-white" href="/api/vault/ledger?kind=progress&limit=25">Open progress ledger</a>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {progressTimelineCards.map((card) => (
              <a key={card.title} href={card.href} className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5 transition hover:border-emerald-100/40 hover:bg-black/35">
                <h3 className="text-xl font-black">{card.title}</h3>
                <p className="mt-3 inline-flex rounded-full bg-emerald-300/10 px-3 py-1 text-sm text-emerald-100">{card.status}</p>
                <p className="mt-4 text-sm text-white/65">{card.body}</p>
                <p className="mt-4 break-all font-mono text-xs text-emerald-100/70">{card.href}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-sky-200/20 bg-sky-200/[0.05] p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">ML evidence lane</h2>
              <p className="mt-2 text-white/65">Inspect model memory, provider receipts, and ML task evidence while keeping model output gated by Violet Gate.</p>
            </div>
            <a className="rounded-full border border-white/15 px-4 py-2 font-bold text-white" href="/api/vault/ledger?kind=receipt&limit=25">Open ML receipts</a>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {mlEvidenceCards.map((card) => (
              <a key={card.title} href={card.href} className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5 transition hover:border-sky-100/40 hover:bg-black/35">
                <h3 className="text-xl font-black">{card.title}</h3>
                <p className="mt-3 inline-flex rounded-full bg-sky-300/10 px-3 py-1 text-sm text-sky-100">{card.status}</p>
                <p className="mt-4 text-sm text-white/65">{card.body}</p>
                <p className="mt-4 break-all font-mono text-xs text-sky-100/70">{card.href}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-amber-200/20 bg-amber-200/[0.05] p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">Outpost round trips</h2>
              <p className="mt-2 text-white/65">Inspect outbound entries, inbound returns, and continuity traces without treating return as approval.</p>
            </div>
            <a className="rounded-full border border-white/15 px-4 py-2 font-bold text-white" href="/api/vault/ledger?kind=outpost&limit=25">Open Outpost ledger</a>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {outpostRoundTripCards.map((card) => (
              <a key={card.title} href={card.href} className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5 transition hover:border-amber-100/40 hover:bg-black/35">
                <h3 className="text-xl font-black">{card.title}</h3>
                <p className="mt-3 inline-flex rounded-full bg-amber-300/10 px-3 py-1 text-sm text-amber-100">{card.status}</p>
                <p className="mt-4 text-sm text-white/65">{card.body}</p>
                <p className="mt-4 break-all font-mono text-xs text-amber-100/70">{card.href}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-rose-200/20 bg-rose-200/[0.05] p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">Receipt cards</h2>
              <p className="mt-2 text-white/65">Inspect receipt evidence for reconciliation, completion, pending review, and provider/accounting trails.</p>
            </div>
            <a className="rounded-full border border-white/15 px-4 py-2 font-bold text-white" href="/api/vault/ledger?kind=receipt&limit=25">Open receipt ledger</a>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {receiptCards.map((card) => (
              <a key={card.title} href={card.href} className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5 transition hover:border-rose-100/40 hover:bg-black/35">
                <h3 className="text-xl font-black">{card.title}</h3>
                <p className="mt-3 inline-flex rounded-full bg-rose-300/10 px-3 py-1 text-sm text-rose-100">{card.status}</p>
                <p className="mt-4 text-sm text-white/65">{card.body}</p>
                <p className="mt-4 break-all font-mono text-xs text-rose-100/70">{card.href}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-fuchsia-200/20 bg-fuchsia-200/[0.05] p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">Ledger filters</h2>
              <p className="mt-2 text-white/65">Jump directly to evidence slices for decisions, audit rows, progress, ML memory, outpost, receipts, and reconciliation trails.</p>
            </div>
            <a className="rounded-full border border-white/15 px-4 py-2 font-bold text-white" href="/api/vault/ledger?limit=100">Open full ledger</a>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ledgerFilters.map((filter) => (
              <a key={filter.href} href={filter.href} className="rounded-2xl bg-black/30 p-4 text-cyan-100 transition hover:bg-black/45">
                <span className="font-bold">{filter.label}</span>
                <span className="mt-2 block break-all font-mono text-xs text-white/45">{filter.href}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          {operatorCards.map((card) => (
            <article key={card.title} className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
              <h2 className="text-2xl font-black">{card.title}</h2>
              <p className="mt-3 inline-flex rounded-full bg-emerald-300/10 px-3 py-1 text-sm text-emerald-200">{card.status}</p>
              <p className="mt-4 text-white/65">{card.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.06] p-7">
          <h2 className="text-2xl font-black">Operator law</h2>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {laws.map((law) => (
              <div key={law} className="rounded-2xl bg-black/30 p-4 text-sm text-cyan-50">{law}</div>
            ))}
          </div>
          <pre className="mt-5 overflow-x-auto rounded-2xl bg-black/40 p-4 text-sm text-cyan-100">{`OPERATOR = inspect → use forms → create approval → decide explicitly → audit → track progress → inspect ML evidence → inspect Outpost round trips → reconcile receipts → verify ledger
DASHBOARD = visibility, not authorization
FORMS = explicit JSON posts, not hidden execution
VIOLET_GATE = only approval line for consequence-bearing work`}</pre>
        </section>
      </section>
    </main>
  );
}
