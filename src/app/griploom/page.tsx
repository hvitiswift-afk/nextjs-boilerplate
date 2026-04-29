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

export default function GriploomPage() {
  const [result, setResult] = useState<unknown>(null);
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
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 32 }}>
      <h1>🎬🕸️ GRIPLOOM AI</h1>
      <p>Production Geometry from Verified Credits.</p>

      <section style={{ margin: "24px 0" }}>
        <button onClick={runSample} disabled={loading}>
          {loading ? "Running…" : "Run Sample"}
        </button>
      </section>

      <section>
        <h2>Pipeline</h2>
        <p>
          GRIPLOOM ML ranks. GOBLIN ML challenges. BLACKLETTER permits.
        </p>
      </section>

      <section>
        <h2>Sample Payload</h2>
        <pre style={{ overflowX: "auto", background: "#111", color: "#eee", padding: 16 }}>
          {JSON.stringify(samplePayload, null, 2)}
        </pre>
      </section>

      <section>
        <h2>Result</h2>
        <pre style={{ overflowX: "auto", background: "#111", color: "#eee", padding: 16 }}>
          {result ? JSON.stringify(result, null, 2) : "Run the sample to see mesh, vitality, beam scores, GOBLIN flags, and BLACKLETTER status."}
        </pre>
      </section>
    </main>
  );
}
