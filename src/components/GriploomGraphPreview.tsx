type BlackletterStatus = "APPROVED" | "CAUTION" | "BLOCKED" | string;

type GraphBeam = {
  id: string;
  people: [string, string];
  repeatCount: number;
  confidence: number;
  layer: string;
  blackletterStatus?: BlackletterStatus;
};

const blackletterLegend = [
  { label: "APPROVED", color: "#34D399", dash: undefined, meaning: "green publish beam" },
  { label: "CAUTION", color: "#FACC15", dash: "10 8", meaning: "yellow review beam" },
  { label: "BLOCKED", color: "#F87171", dash: "3 9", meaning: "red stop beam" },
  { label: "UNGATED", color: "#C0C0C0", dash: "2 6", meaning: "fallback to polarity" }
];

function polarityForBeam(beam: GraphBeam) {
  const score = beam.repeatCount * beam.confidence;

  if (score >= 5) {
    return {
      name: "Positive Ray",
      color: "#FFEA4A",
      shape: "▲",
      dash: undefined,
      meaning: "outward drive / strong verified emission"
    };
  }

  if (beam.confidence < 0.8) {
    return {
      name: "Alternating Wave",
      color: "#D84AD8",
      shape: "◆",
      dash: "14 10",
      meaning: "candidate / oscillating until verified"
    };
  }

  if (score < 2) {
    return {
      name: "Negative Ground",
      color: "#2B6CFF",
      shape: "■",
      dash: "4 8",
      meaning: "weak return path / low signal"
    };
  }

  return {
    name: "Neutral Axis",
    color: "#C0C0C0",
    shape: "●",
    dash: undefined,
    meaning: "stable reference beam"
  };
}

function statusStyle(status?: BlackletterStatus) {
  if (status === "APPROVED") {
    return { label: "APPROVED", color: "#34D399", dash: undefined, meaning: "publishable beam" };
  }

  if (status === "CAUTION") {
    return { label: "CAUTION", color: "#FACC15", dash: "10 8", meaning: "review beam / needs operator attention" };
  }

  if (status === "BLOCKED") {
    return { label: "BLOCKED", color: "#F87171", dash: "3 9", meaning: "stopped by BLACKLETTER gate" };
  }

  return { label: status ?? "UNGATED", color: undefined, dash: undefined, meaning: "status not supplied" };
}

export function GriploomGraphPreview({ beams }: { beams: GraphBeam[] }) {
  const primaryBeam = beams[0];

  if (!primaryBeam) {
    return null;
  }

  const width = 760;
  const height = 250;
  const score = primaryBeam.repeatCount * primaryBeam.confidence;
  const edgeWidth = Math.max(2, Math.min(18, score * 2));
  const glowOpacity = Math.max(0.2, Math.min(0.95, primaryBeam.confidence));
  const polarity = polarityForBeam(primaryBeam);
  const blackletter = statusStyle(primaryBeam.blackletterStatus);
  const edgeColor = blackletter.color ?? polarity.color;
  const edgeDash = blackletter.dash ?? polarity.dash;

  return (
    <section style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, background: "rgba(255,255,255,0.04)", padding: 18 }}>
      <h2 style={{ marginTop: 0 }}>🕸️ Graph Preview</h2>
      <p style={{ color: "rgba(245,239,226,0.68)" }}>
        Nodes are people. Edge thickness follows repeat score. Glow follows confidence. Color follows BLACKLETTER status when available.
      </p>

      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", overflow: "visible" }} role="img" aria-label="GRIPLOOM graph preview">
        <defs>
          <filter id="beamGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <marker id="positiveRay" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="strokeWidth">
            <path d="M2,2 L10,6 L2,10 Z" fill={edgeColor} />
          </marker>
        </defs>

        <line
          x1="160"
          y1="110"
          x2="600"
          y2="110"
          stroke={edgeColor}
          strokeWidth={edgeWidth}
          strokeLinecap="round"
          strokeDasharray={edgeDash}
          opacity={glowOpacity}
          filter="url(#beamGlow)"
          markerEnd={polarity.name === "Positive Ray" && primaryBeam.blackletterStatus !== "BLOCKED" ? "url(#positiveRay)" : undefined}
        />

        {polarity.name === "Alternating Wave" && (
          <path
            d="M 160 110 C 250 55, 330 165, 420 110 S 520 55, 600 110"
            fill="none"
            stroke={edgeColor}
            strokeWidth="4"
            opacity="0.65"
          />
        )}

        {polarity.name === "Negative Ground" && (
          <g stroke={edgeColor} strokeWidth="3" opacity="0.9">
            <line x1="380" y1="124" x2="380" y2="154" />
            <line x1="356" y1="154" x2="404" y2="154" />
            <line x1="364" y1="164" x2="396" y2="164" />
            <line x1="372" y1="174" x2="388" y2="174" />
          </g>
        )}

        {polarity.name === "Neutral Axis" && (
          <line x1="380" y1="50" x2="380" y2="172" stroke={edgeColor} strokeWidth="2" opacity="0.45" />
        )}

        <circle cx="160" cy="110" r="48" fill="#111111" stroke="#F4F0E8" strokeWidth="3" />
        <circle cx="600" cy="110" r="48" fill="#111111" stroke="#F4F0E8" strokeWidth="3" />

        <text x="160" y="116" textAnchor="middle" fill="#F4F0E8" fontSize="28">🛠️</text>
        <text x="600" y="116" textAnchor="middle" fill="#F4F0E8" fontSize="28">🛠️</text>

        <text x="160" y="185" textAnchor="middle" fill="#F4F0E8" fontSize="16">{primaryBeam.people[0]}</text>
        <text x="600" y="185" textAnchor="middle" fill="#F4F0E8" fontSize="16">{primaryBeam.people[1]}</text>

        <text x="380" y="62" textAnchor="middle" fill={edgeColor} fontSize="18">{polarity.shape} {polarity.name}</text>
        <text x="380" y="86" textAnchor="middle" fill={edgeColor} fontSize="15">⚖️ {blackletter.label}</text>
        <text x="380" y="146" textAnchor="middle" fill="#F4F0E8" fontSize="16">
          repeats {primaryBeam.repeatCount} · confidence {primaryBeam.confidence}
        </text>
        <text x="380" y="220" textAnchor="middle" fill="rgba(245,239,226,0.72)" fontSize="14">
          {blackletter.color ? blackletter.meaning : polarity.meaning}
        </text>
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginTop: 14 }}>
        {blackletterLegend.map((item) => (
          <div key={item.label} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: 10, background: "rgba(0,0,0,0.18)" }}>
            <svg viewBox="0 0 120 18" style={{ width: "100%", height: 18 }} aria-hidden="true">
              <line x1="6" y1="9" x2="114" y2="9" stroke={item.color} strokeWidth="5" strokeLinecap="round" strokeDasharray={item.dash} />
            </svg>
            <div style={{ color: item.color, fontWeight: 900, fontSize: 13 }}>{item.label}</div>
            <div style={{ color: "rgba(245,239,226,0.68)", fontSize: 12 }}>{item.meaning}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
