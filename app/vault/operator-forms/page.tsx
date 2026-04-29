"use client";

import { FormEvent, useMemo, useState } from "react";

type SubmitState = {
  ok: boolean;
  status: number;
  title: string;
  body: string;
};

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required = false
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm text-white/70">
      <span>{label}</span>
      <input
        className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-cyan-200/50"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  placeholder,
  required = false
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm text-white/70">
      <span>{label}</span>
      <textarea
        className="min-h-28 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-cyan-200/50"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
      />
    </label>
  );
}

function readForm(form: HTMLFormElement) {
  return Object.fromEntries(new FormData(form).entries());
}

async function postJson(endpoint: string, payload: Record<string, unknown>) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  let body = text;

  try {
    body = JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    // Keep text body when response is not JSON.
  }

  return {
    ok: response.ok,
    status: response.status,
    body
  };
}

export default function VaultOperatorFormsPage() {
  const [state, setState] = useState<SubmitState | null>(null);
  const [busy, setBusy] = useState(false);

  const statusLabel = useMemo(() => {
    if (!state) return "ready";
    return state.ok ? "accepted" : "needs review";
  }, [state]);

  async function handleApprovalCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);

    const form = event.currentTarget;
    const values = readForm(form);

    const payload = {
      id: String(values.id || ""),
      taskId: String(values.taskId || ""),
      risk: String(values.risk || "needs-approval"),
      requestedAction: String(values.requestedAction || "")
    };

    const result = await postJson("/api/approval", payload);
    setState({
      ok: result.ok,
      status: result.status,
      title: "Approval creation response",
      body: result.body
    });
    setBusy(false);
  }

  async function handleApprovalDecision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);

    const form = event.currentTarget;
    const values = readForm(form);

    const payload = {
      id: String(values.id || ""),
      status: String(values.status || "rejected"),
      decidedBy: String(values.decidedBy || ""),
      note: String(values.note || "")
    };

    const result = await postJson("/api/approval/decision", payload);
    setState({
      ok: result.ok,
      status: result.status,
      title: "Approval decision response",
      body: result.body
    });
    setBusy(false);
  }

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.35em] text-cyan-200" href="/vault">Stone Vault</a>
          <span>Operator Forms</span>
        </nav>

        <section className="py-12">
          <p className="mb-4 inline-flex rounded-full border border-violet-300/30 bg-violet-300/10 px-4 py-2 text-sm text-violet-100">
            Phase 3 • explicit approval creation • explicit approval decision
          </p>
          <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">Create and decide approvals without hiding the gate.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/72">
            These forms post JSON to the approval routes, show the raw response, and keep approval creation separate from approval decision.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleApprovalCreate} className="rounded-[2rem] border border-violet-200/20 bg-violet-200/[0.05] p-6">
            <div className="mb-6">
              <h2 className="text-3xl font-black">Create approval</h2>
              <p className="mt-2 text-white/65">Writes approval evidence. It does not execute work.</p>
            </div>
            <div className="grid gap-4">
              <Field label="Approval ID" name="id" defaultValue="approval-demo-gated" required />
              <Field label="Task ID" name="taskId" defaultValue="execute-demo-gated" required />
              <Field label="Risk" name="risk" defaultValue="needs-approval" required />
              <TextArea label="Requested action" name="requestedAction" defaultValue="Approve the gated demo execution." required />
              <button disabled={busy} className="rounded-full bg-violet-200 px-5 py-3 font-black text-black disabled:opacity-60">
                Create approval evidence
              </button>
            </div>
          </form>

          <form onSubmit={handleApprovalDecision} className="rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.05] p-6">
            <div className="mb-6">
              <h2 className="text-3xl font-black">Decide approval</h2>
              <p className="mt-2 text-white/65">Approves or rejects pending evidence and writes audit evidence.</p>
            </div>
            <div className="grid gap-4">
              <Field label="Approval ID" name="id" defaultValue="approval-demo-gated" required />
              <label className="grid gap-2 text-sm text-white/70">
                <span>Decision status</span>
                <select name="status" defaultValue="approved" className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-cyan-200/50">
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                </select>
              </label>
              <Field label="Decided by" name="decidedBy" defaultValue="manual-operator" required />
              <TextArea label="Decision note" name="note" defaultValue="Approved after reviewing the gated demo execution." />
              <button disabled={busy} className="rounded-full bg-cyan-200 px-5 py-3 font-black text-black disabled:opacity-60">
                Submit Violet Gate decision
              </button>
            </div>
          </form>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black">Response console</h2>
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-cyan-100">{statusLabel}</span>
          </div>
          <pre className="mt-5 max-h-[32rem] overflow-auto rounded-2xl bg-black/40 p-4 text-sm leading-6 text-cyan-100">
            {state ? `${state.title}\nHTTP ${state.status}\n\n${state.body}` : "No submission yet."}
          </pre>
        </section>

        <section className="mt-8 rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.06] p-7">
          <h2 className="text-2xl font-black">Form law</h2>
          <pre className="mt-5 overflow-x-auto rounded-2xl bg-black/40 p-4 text-sm text-cyan-100">{`FORM = operator input → JSON POST → response evidence
CREATE APPROVAL ≠ EXECUTION
DECIDE APPROVAL ≠ SILENT EXECUTION
AUDIT ROW = transition evidence
VIOLET_GATE = only approval line for consequence-bearing work`}</pre>
        </section>
      </section>
    </main>
  );
}
