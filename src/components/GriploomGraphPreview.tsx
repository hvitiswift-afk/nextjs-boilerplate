type GraphBeam = {
  id: string;
  people: [string, string];
  repeatCount: number;
  confidence: number;
  layer: string;
};

export function GriploomGraphPreview({ beams }: { beams: GraphBeam[] }) {
  const primaryBeam = beams[0];

  if (!primaryBeam) {
    return null;
  }

  const width = 760;
  const height = 220;
  const score = primaryBeam.repeatCount * primaryBeam.confidence;
  const edgeWidth = Math.max(2, Math.min(18, score * 2));
  const glowOpacity = Math.max(0.2, Math.min(0.95, primaryBeam.confidence));

  return (
    <section style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, background: "rgba(255,255,255,0.04)", padding: 18 }}>
      <h2 style={{ marginTop: 0 }}>🕸️ Graph Preview</h2>
      <p style={{ color: "rgba(245,239,226,0.68)" }}>
        Nodes are people. Edge thickness follows repeat score. Glow follows confidence.
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
        </defs>

        <line
          x1="160"
          y1="110"
          x2="600"
          y2="110"
          stroke="#D84AD8"
          strokeWidth={edgeWidth}
          strokeLinecap="round"
          opacity={glowOpacity}
          filter="url(#beamGlow)"
        />

        <circle cx="160" cy="110" r="48" fill="#111111" stroke="#F4F0E8" strokeWidth="3" />
        <circle cx="600" cy="110" r="48" fill="#111111" stroke="#F4F0E8" strokeWidth="3" />

        <text x="160" y="116" textAnchor="middle" fill="#F4F0E8" fontSize="28">🛠️</text>
        <text x="600" y="116" textAnchor="middle" fill="#F4F0E8" fontSize="28">🛠️</text>

        <text x="160" y="185" textAnchor="middle" fill="#F4F0E8" fontSize="16">{primaryBeam.people[0]}</text>
        <text x="600" y="185" textAnchor="middle" fill="#F4F0E8" fontSize="16">{primaryBeam.people[1]}</text>

        <text x="380" y="82" textAnchor="middle" fill="#D84AD8" fontSize="18">repeat beam</text>
        <text x="380" y="146" textAnchor="middle" fill="#F4F0E8" fontSize="16">
          repeats {primaryBeam.repeatCount} · confidence {primaryBeam.confidence}
        </text>
      </svg>
    </section>
  );
}
