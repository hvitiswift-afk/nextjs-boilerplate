"use client";

import { useEffect, useState } from "react";

type Mission = Record<string, unknown> & { id: string; title: string; service: string };

const STORAGE_KEY = "jp-hviti-service-bridge-v2";

export default function ReceiptConsolePage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [receiptText, setReceiptText] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMissions(JSON.parse(raw));
    } catch {
      setError("Could not read local missions.");
    }
  }, []);

  async function forge() {
    const mission = missions.find((item) => item.id === selectedId);
    if (!mission) return;
    setError("");
    const response = await fetch("/api/service-bridge/receipt/mission", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(mission),
    });
    const data = await response.json();
    if (!response.ok && response.status !== 422) {
      setError(data.error || "Receipt generation failed.");
      return;
    }
    setReceiptText(JSON.stringify(data, null, 2));
    setResult(null);
  }

  async function verify() {
    setError("");
    try {
      const response = await fetch("/api/service-bridge/receipt/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: receiptText,
      });
      const data = await response.json();
      setResult(data);
      if (!response.ok && response.status !== 422) setError(data.error || "Verification failed.");
    } catch {
      setError("Receipt JSON is invalid.");
      setResult(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.3em] text-cyan-200" href="/service-bridge">Service Bridge</a>
          <div className="flex gap-3"><a href="/service-bridge/control">Control</a><a href="/service-bridge/status">Status</a></div>
        </nav>

        <header className="py-14">
          <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-sm text-fuchsia-100">Content-integrity receipt tools</p>
          <h1 className="text-5xl font-black sm:text-7xl">Receipt Console</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">Forge a mission receipt, inspect its deterministic digest, change the JSON to test detection, and verify the content again.</p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">Mission</h2>
            <select className="mt-5 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
              <option value="">Select a mission</option>
              {missions.map((mission) => <option key={mission.id} value={mission.id}>{mission.title} — {mission.service}</option>)}
            </select>
            <button onClick={forge} disabled={!selectedId} className="mt-5 rounded-full bg-cyan-200 px-5 py-3 font-bold text-black disabled:opacity-40">Forge receipt</button>
            <div className="mt-6 rounded-2xl border border-amber-300/25 bg-amber-300/[0.08] p-4 text-sm leading-6 text-white/65">Integrity checking detects changed content. It is not a digital signature, notarization, identity proof, authoritative timestamp, or proof that an external action occurred.</div>
          </aside>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">Receipt JSON</h2>
            <textarea className="mt-5 min-h-[34rem] w-full rounded-2xl border border-white/10 bg-black/35 p-4 font-mono text-xs leading-5 text-cyan-100" value={receiptText} onChange={(event) => setReceiptText(event.target.value)} placeholder="Forge or paste a receipt here." />
            <button onClick={verify} disabled={!receiptText} className="mt-5 rounded-full border border-cyan-200/30 px-5 py-3 font-bold text-cyan-100 disabled:opacity-40">Verify receipt</button>
          </section>
        </section>

        {error ? <div className="mt-6 rounded-2xl border border-red-300/30 bg-red-300/10 p-4 text-red-100">{error}</div> : null}

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-black">Verification result</h2>
          <pre className="mt-5 overflow-x-auto rounded-2xl bg-black/30 p-4 text-sm leading-6 text-cyan-100">{result ? JSON.stringify(result, null, 2) : "No verification run yet."}</pre>
        </section>
      </section>
    </main>
  );
}
