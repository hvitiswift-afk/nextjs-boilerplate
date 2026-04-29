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
  const [loading, setLoading] = useState(false);

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

  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: 32, color: "#f5efe2" }}>
      <p><a href="/" style={{ color: "#a5f3fc" }}>← Back home</a></p>
      <h1>🎬🕸️ GRIPLOOM AI</h1>
      <p>Production Geometry from Verified Credits.</p>

      <section style={{ margin: "24px 0", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={runSample} disabled={loading} style={{ borderRadius: 999, padding: "12px 18px", fontWeight: 800 }}>
          {loading ? "Running…" : "Run Sample"}
        </button>
        <span style={{ color: "rgba(245,239,226,0.68)" }}>
          GRIPLOOM ML ranks. GOBLIN ML challenges. BLACKLETTER permits.
        </span>
      </section>

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
        <summary>Sample Payload</summary>
        <pre style={{ overflowX: "auto", background: "#111", color: "#eee", padding: 16, borderRadius: 14 }}>
          {JSON.stringify(samplePayload, null, 2)}
        </pre>
      </details>

      <details style={{ marginTop: 16 }} open={!result}>
        <summary>Raw Result</summary>
        <pre style={{ overflowX: "auto", background: "#111", color: "#eee", padding: 16, borderRadius: 14 }}>
          {result ? JSON.stringify(result, null, 2) : "Run the sample to see mesh, vitality, beam scores, GOBLIN flags, and BLACKLETTER status."}
        </pre>
      </details>
    </main>
  );
}
