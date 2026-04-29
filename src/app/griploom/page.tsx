"use client";

import { useState } from "react";

const samplePayload = {
  nodeCount: 8,
  vitality: {
    qCoulombs: 6,
    cFarads: 1.6,
    iCurrent: 0.8,
    resistance: 0.5,
    crewSignal: 6,
    directorSignal: 1,
    houseSignal: 2,
    audienceSignal: 1
  },
  beams: [
    {
      id: "GL-BEAM-SHAWN-JOSEPH",
      people: ["Shawn Ensign", "Joseph Dianda"],
      sharedProductions: [
        "The Usual Suspects",
        "Boogie Nights",
        "Gun Shy",
        "The Truth About Cats & Dogs",
        "The Trigger Effect",
        "Wag the Dog"
      ],
      repeatCount: 6,
      layer: "crew",
      confidence: 0.95,
      status: "CORE"
    },
    {
      id: "GL-BEAM-CANDIDATE-WEAK",
      people: ["Candidate Person A", "Candidate Person B"],
      sharedProductions: ["One Production"],
      repeatCount: 1,
      layer: "crew",
      confidence: 0.62,
      status: "CANDIDATE"
    }
  ]
};

const tickPayload = {
  idempotency_key: "GL-20260429-CAM-BATT-001-SCANOUT",
  timestamp: "2026-04-29T12:00:00Z",
  production_id: "GL-FACE-BOOGIE-NIGHTS",
  event_type: "scan_out",
  layer: ["🛠️", "🧾"],
  actor: {
    type: "crew",
    id: "GL-CREW-0001",
    role: "camera assistant"
  },
  object: {
    type: "equipment",
    id: "CAM-BATT-001",
    barcode: "GL-BARCODE-CAM-BATT-001"
  },
  location: {
    type: "cad_zone",
    id: "GL-CAD-CAMERA-CART"
  },
  source: {
    type: "scanner",
    id: "SCANNER-001"
  }
};

const polarityLegend = [
  { name: "Positive", color: "#FFEA4A", shape: "▲", line: "ray", meaning: "outward drive / emission / activation" },
  { name: "Negative", color: "#2B6CFF", shape: "■", line: "ground", meaning: "return path / containment / sink" },
  { name: "Neutral", color: "#C0C0C0", shape: "●", line: "axis", meaning: "balance / reference / stable node" },
  { name: "Alternating", color: "#D84AD8", shape: "◆", line: "wave", meaning: "oscillation / exchange / same-tick switching" }
];

type ScoreResult = {
  product: string;
  rule: string;
  mesh?: {
    density: number;
    beamCount: number;
    possibleBeamCount: number;
    centralLayer: string;
    balance: string;
  };
  field?: {
    qCoulombs: number;
    cFarads: number;
    iCurrent: number;
    resistance: number;
    power: number;
    hVitality: number;
  } | null;
  results?: Array<{
    beam: {
      id: string;
      people: [string, string];
      sharedProductions: string[];
      repeatCount: number;
      layer: string;
      confidence: number;
      status?: string;
    };
    griploom: {
      score: number;
      label: string;
    };
    goblin: {
      flags: Array<{ type: string; severity: string; message: string }>;
    };
    blackletter: {
      status: string;
      reason?: string;
      note?: string;
    };
  }>;
};

type TickResult = {
  ok: boolean;
  tick_id?: string;
  status: string;
  metrics_updated?: boolean;
  reason?: string;
  missing?: string[];
  event?: Record<string, unknown>;
  rule?: string;
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, background: "rgba(255,255,255,0.04)", padding: 18 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {children}
    </section>
  );
}

export default function GriploomPage() {
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [tickResult, setTickResult] = useState<TickResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [tickLoading, setTickLoading] = useState(false);

  async function runSample() {
    setLoading(true);
    try {
      const response = await fetch("/api/ml/score", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(samplePayload)
      });

      const json = await response.json();
      setResult(json);
    } finally {
      setLoading(false);
    }
  }

  async function runTick() {
    setTickLoading(true);
    try {
      const response = await fetch("/api/tick", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(tickPayload)
      });

      const json = await response.json();
      setTickResult(json);
    } finally {
      setTickLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: 32, color: "#f5efe2" }}>
      <p><a href="/" style={{ color: "#a5f3fc" }}>← Back home</a></p>
      <h1>🎬🕸️ GRIPLOOM AI</h1>
      <p>Production Geometry from Verified Credits.</p>

      <section style={{ margin: "24px 0", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={runSample} disabled={loading} style={{ borderRadius: 999, padding: "12px 18px", fontWeight: 800 }}>
          {loading ? "Running…" : "Run ML Sample"}
        </button>
        <button onClick={runTick} disabled={tickLoading} style={{ borderRadius: 999, padding: "12px 18px", fontWeight: 800 }}>
          {tickLoading ? "Sending…" : "Send SAME-TICK"}
        </button>
        <span style={{ color: "rgba(245,239,226,0.68)" }}>
          GRIPLOOM ML ranks. GOBLIN ML challenges. BLACKLETTER permits. SAME-TICK records the pulse.
        </span>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, margin: "24px 0" }}>
        <Card title="🎨 Electronic Color">
          <p><strong>Color identifies the shirt layer.</strong></p>
          <p>Examples: 🛠️ crew, 🎭 cast, 🎯 director, 🏛️ house, 👥 audience.</p>
          <p style={{ color: "rgba(245,239,226,0.68)" }}>Electronic color answers: what is this node?</p>
        </Card>

        <Card title="⚡ Electronic Polarity">
          <p><strong>Polarity identifies movement and charge behavior.</strong></p>
          <div style={{ display: "grid", gap: 10 }}>
            {polarityLegend.map((item) => (
              <div key={item.name} style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 10, alignItems: "center" }}>
                <span style={{ color: item.color, fontSize: 26 }}>{item.shape}</span>
                <span><strong>{item.name}</strong> / {item.line}: {item.meaning}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="🔦 Shape + Line Rule">
          <p><strong>Color tells identity.</strong></p>
          <p><strong>Polarity tells direction.</strong></p>
          <p><strong>Shape gives body.</strong></p>
          <p><strong>Ray / line / wave shows how energy moves.</strong></p>
        </Card>
      </div>

      {result && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, margin: "24px 0" }}>
          <Card title="🕸️ Mesh Scorecard">
            <p><strong>Density:</strong> {result.mesh?.density}</p>
            <p><strong>Beams:</strong> {result.mesh?.beamCount} / {result.mesh?.possibleBeamCount}</p>
            <p><strong>Central Layer:</strong> {result.mesh?.centralLayer}</p>
            <p><strong>Balance:</strong> {result.mesh?.balance}</p>
          </Card>

          <Card title="⚡ Vitality Field">
            <p><strong>Q Coulombs:</strong> {result.field?.qCoulombs}</p>
            <p><strong>C Farads:</strong> {result.field?.cFarads}</p>
            <p><strong>I Current:</strong> {result.field?.iCurrent}</p>
            <p><strong>R Resistance:</strong> {result.field?.resistance}</p>
            <p><strong>P Power:</strong> {result.field?.power?.toFixed?.(3) ?? result.field?.power}</p>
            <p><strong>H(t) Vitality:</strong> {result.field?.hVitality}</p>
          </Card>
        </div>
      )}

      {tickResult && (
        <div style={{ margin: "24px 0" }}>
          <Card title="⏱️ SAME-TICK Result">
            <p><strong>Status:</strong> {tickResult.status}</p>
            <p><strong>Tick ID:</strong> {tickResult.tick_id ?? "-"}</p>
            <p><strong>Metrics Updated:</strong> {String(tickResult.metrics_updated ?? false)}</p>
            <p><strong>Rule:</strong> {tickResult.rule ?? tickResult.reason}</p>
            {tickResult.missing?.length ? <p><strong>Missing:</strong> {tickResult.missing.join(", ")}</p> : null}
          </Card>
        </div>
      )}

      {result?.results && (
        <section style={{ display: "grid", gap: 16, margin: "24px 0" }}>
          <h2>Repeat Beams</h2>
          {result.results.map((item) => (
            <article key={item.beam.id} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, background: "rgba(255,255,255,0.035)", padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>🔗 {item.beam.people.join(" ↔ ")}</h3>
              <p><strong>Layer:</strong> {item.beam.layer} · <strong>Repeats:</strong> {item.beam.repeatCount} · <strong>Confidence:</strong> {item.beam.confidence}</p>
              <p><strong>GRIPLOOM:</strong> {item.griploom.label} / score {item.griploom.score}</p>
              <p><strong>BLACKLETTER:</strong> {item.blackletter.status} {item.blackletter.reason ? `— ${item.blackletter.reason}` : ""}</p>
              {item.goblin.flags.length > 0 ? (
                <ul>
                  {item.goblin.flags.map((flag) => (
                    <li key={`${item.beam.id}-${flag.type}`}>👺 {flag.severity}: {flag.message}</li>
                  ))}
                </ul>
              ) : (
                <p>👺 No GOBLIN flags.</p>
              )}
            </article>
          ))}
        </section>
      )}

      <details style={{ marginTop: 28 }}>
        <summary>ML Sample Payload</summary>
        <pre style={{ overflowX: "auto", background: "#111", color: "#eee", padding: 16, borderRadius: 14 }}>
          {JSON.stringify(samplePayload, null, 2)}
        </pre>
      </details>

      <details style={{ marginTop: 16 }}>
        <summary>SAME-TICK Payload</summary>
        <pre style={{ overflowX: "auto", background: "#111", color: "#eee", padding: 16, borderRadius: 14 }}>
          {JSON.stringify(tickPayload, null, 2)}
        </pre>
      </details>

      <details style={{ marginTop: 16 }} open={!result && !tickResult}>
        <summary>Raw Results</summary>
        <pre style={{ overflowX: "auto", background: "#111", color: "#eee", padding: 16, borderRadius: 14 }}>
          {result || tickResult
            ? JSON.stringify({ ml: result, tick: tickResult }, null, 2)
            : "Run the samples to see mesh, vitality, beam scores, GOBLIN flags, BLACKLETTER status, and SAME-TICK ingestion."}
        </pre>
      </details>
    </main>
  );
}
