"use client";

import { useMemo, useState } from "react";

type MissionState = "draft" | "preflight" | "awaiting-approval" | "ready" | "verified" | "closed";

type Mission = {
  id: string;
  title: string;
  service: string;
  target: string;
  action: string;
  owner: string;
  state: MissionState;
  priority: number;
  budget: string;
  permission: string;
  evidence: string;
  fallback: string;
  next: string;
};

const services = [
  { name: "Indeed", kind: "Public launcher", capability: "Job search and application preparation", href: "https://www.indeed.com/" },
  { name: "Uber", kind: "Public launcher", capability: "Ride planning and mobility", href: "https://www.uber.com/" },
  { name: "Grubhub", kind: "Public launcher", capability: "Food search and delivery planning", href: "https://www.grubhub.com/" },
  { name: "Gmail", kind: "Connected tool", capability: "Drafting, review, and explicit send", href: "https://mail.google.com/" },
  { name: "Google Calendar", kind: "Connected tool", capability: "Scheduling and event control", href: "https://calendar.google.com/" },
  { name: "GitHub", kind: "Connected tool", capability: "Code, versions, issues, and receipts", href: "https://github.com/hvitiswift-afk/nextjs-boilerplate" },
  { name: "Norstein", kind: "JP / Hviti route", capability: "Preview, testing, and supporter workflow", href: "/norstein-preview/index.html" },
  { name: "V# MAIN", kind: "JP / Hviti route", capability: "Direct visual-work preparation", href: "/jp-hviti-work-nexus/index.html" },
];

const blankMission: Mission = {
  id: "",
  title: "",
  service: "Indeed",
  target: "",
  action: "",
  owner: "JP",
  state: "draft",
  priority: 5,
  budget: "",
  permission: "",
  evidence: "",
  fallback: "Manual copy / alternate service",
  next: "",
};

function readiness(mission: Mission) {
  const checks = [mission.title, mission.target, mission.action, mission.owner, mission.permission, mission.evidence, mission.fallback];
  return Math.round((checks.filter((value) => value.trim()).length / checks.length) * 100);
}

export default function ServiceBridgePage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [draft, setDraft] = useState<Mission>(blankMission);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const orderedMissions = useMemo(
    () => [...missions].sort((a, b) => b.priority - a.priority || readiness(b) - readiness(a)),
    [missions],
  );

  const selectedMission = missions.find((mission) => mission.id === selectedId) ?? null;

  function saveMission() {
    const mission: Mission = {
      ...draft,
      id: draft.id || `XYZ-${Date.now()}`,
      title: draft.title || "Untitled XYZ mission",
    };

    setMissions((current) => {
      const existing = current.findIndex((item) => item.id === mission.id);
      if (existing === -1) return [...current, mission];
      return current.map((item) => (item.id === mission.id ? mission : item));
    });
    setSelectedId(mission.id);
    setDraft(blankMission);
  }

  function loadMission(mission: Mission) {
    setDraft(mission);
    setSelectedId(mission.id);
  }

  function advanceMission(id: string) {
    const progression: MissionState[] = ["draft", "preflight", "awaiting-approval", "ready", "verified", "closed"];
    setMissions((current) =>
      current.map((mission) => {
        if (mission.id !== id) return mission;
        const index = progression.indexOf(mission.state);
        const nextState = progression[Math.min(index + 1, progression.length - 1)];
        return { ...mission, state: nextState };
      }),
    );
  }

  function removeMission(id: string) {
    setMissions((current) => current.filter((mission) => mission.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.3em] text-cyan-200" href="/">JP / Hviti</a>
          <div className="flex flex-wrap gap-3">
            <a className="hover:text-cyan-100" href="/vault">Vault</a>
            <a className="hover:text-cyan-100" href="/griploom">GRIPLOOM</a>
            <a className="hover:text-cyan-100" href="/f-wad">F-WAD</a>
          </div>
        </nav>

        <header className="grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-sm text-fuchsia-100">
              Consolidated application route • XYZ mission control
            </p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Service Bridge</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
              One real Next.js control surface for missions, services, readiness, approval gates, receipts, fallbacks, and carry-forward continuity.
            </p>
          </div>
          <div className="rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.06] p-6">
            <p className="font-semibold text-cyan-100">Execution law</p>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Prepare deeply and route quickly. Purchases, bookings, orders, applications, payments, submissions, and sends remain behind explicit user approval.
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <form
            className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"
            onSubmit={(event) => {
              event.preventDefault();
              saveMission();
            }}
          >
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-black">XYZ mission editor</h2>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">Review Door</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3" placeholder="Mission title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              <select className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3" value={draft.service} onChange={(e) => setDraft({ ...draft, service: e.target.value })}>
                {services.map((service) => <option key={service.name}>{service.name}</option>)}
              </select>
              <input className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3" placeholder="Exact target" value={draft.target} onChange={(e) => setDraft({ ...draft, target: e.target.value })} />
              <input className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3" placeholder="Exact action" value={draft.action} onChange={(e) => setDraft({ ...draft, action: e.target.value })} />
              <input className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3" placeholder="Owner" value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} />
              <input className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3" placeholder="Budget / pay / fare / limit" value={draft.budget} onChange={(e) => setDraft({ ...draft, budget: e.target.value })} />
              <input className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3" placeholder="Permission / approval" value={draft.permission} onChange={(e) => setDraft({ ...draft, permission: e.target.value })} />
              <input className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3" placeholder="Evidence / receipt" value={draft.evidence} onChange={(e) => setDraft({ ...draft, evidence: e.target.value })} />
              <input className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3" placeholder="Fallback" value={draft.fallback} onChange={(e) => setDraft({ ...draft, fallback: e.target.value })} />
              <input className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3" placeholder="Next state / follow-up" value={draft.next} onChange={(e) => setDraft({ ...draft, next: e.target.value })} />
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm text-white/60">Priority: {draft.priority}</span>
                <input className="w-full" type="range" min="1" max="10" value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: Number(e.target.value) })} />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-full bg-cyan-200 px-5 py-3 font-bold text-black" type="submit">Save mission</button>
              <button className="rounded-full border border-white/15 px-5 py-3 font-bold" type="button" onClick={() => setDraft(blankMission)}>Clear</button>
            </div>
          </form>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-black">Mission queue</h2>
              <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">{missions.length} active</span>
            </div>
            <div className="space-y-4">
              {orderedMissions.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/15 p-8 text-center text-white/45">No missions yet.</div>
              ) : orderedMissions.map((mission) => (
                <article key={mission.id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">{mission.title}</h3>
                      <p className="mt-1 text-sm text-white/50">{mission.service} • {mission.state} • priority {mission.priority}</p>
                    </div>
                    <span className="rounded-full bg-cyan-200/10 px-3 py-1 text-sm text-cyan-100">{readiness(mission)}%</span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300" style={{ width: `${readiness(mission)}%` }} /></div>
                  <p className="mt-4 text-sm leading-6 text-white/60"><strong className="text-white/80">Target:</strong> {mission.target || "Not set"}</p>
                  <p className="text-sm leading-6 text-white/60"><strong className="text-white/80">Action:</strong> {mission.action || "Not set"}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold" onClick={() => loadMission(mission)}>Open</button>
                    <button className="rounded-full border border-cyan-200/30 px-4 py-2 text-sm font-semibold text-cyan-100" onClick={() => advanceMission(mission.id)}>Advance</button>
                    <button className="rounded-full border border-red-300/20 px-4 py-2 text-sm font-semibold text-red-200" onClick={() => removeMission(mission.id)}>Remove</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>

        <section className="border-t border-white/10 py-12 mt-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">Service registry</h2>
              <p className="mt-2 text-white/60">Public launchers and connected tools are labeled separately.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <a key={service.name} href={service.href} target={service.href.startsWith("http") ? "_blank" : undefined} rel={service.href.startsWith("http") ? "noopener noreferrer" : undefined} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-cyan-200/40 hover:bg-cyan-200/[0.06]">
                <span className="text-lg font-bold text-cyan-100">{service.name}</span>
                <span className="mt-2 block text-xs uppercase tracking-wider text-fuchsia-200/70">{service.kind}</span>
                <span className="mt-3 block text-sm leading-6 text-white/55">{service.capability}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="grid gap-6 border-t border-white/10 py-12 lg:grid-cols-3">
          <div>
            <h2 className="text-3xl font-black">Selected mission receipt</h2>
            <p className="mt-3 text-white/60">A truthful current-state summary. No external action is implied.</p>
          </div>
          <pre className="overflow-x-auto rounded-[2rem] border border-white/10 bg-black/30 p-6 text-sm leading-6 text-cyan-100 lg:col-span-2">{selectedMission ? JSON.stringify({ ...selectedMission, readiness: readiness(selectedMission), externalActionCompleted: false }, null, 2) : "Select a mission to view its receipt."}</pre>
        </section>
      </section>
    </main>
  );
}
