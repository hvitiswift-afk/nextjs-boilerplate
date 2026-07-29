import { ImageResponse } from "next/og";

import experiment from "@/examples/revenue-experiment.sample.json";

export const alt = "GitHub Control Tower Audit — fixed-scope repository operations pilot";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(circle at top right, #164e63 0%, #07070b 42%, #07070b 100%)",
          color: "#f5efe2",
          padding: "70px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              border: "1px solid rgba(103,232,249,0.45)",
              borderRadius: "999px",
              padding: "12px 20px",
              color: "#a5f3fc",
              fontSize: "24px",
            }}
          >
            {`JP Systems • ${experiment.status}`}
          </div>
          <div style={{ display: "flex", color: "#d8b4fe", fontSize: "24px" }}>
            {`${experiment.offer.capacity} pilot slots`}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", fontSize: "72px", fontWeight: 900, lineHeight: 1.02 }}>
            GitHub Control Tower Audit
          </div>
          <div style={{ display: "flex", maxWidth: "950px", color: "#cbd5e1", fontSize: "32px" }}>
            Turn stale pull requests, duplicate issues, unclear checks, and deployment boundaries into an exact operating sequence.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.15)",
            paddingTop: "28px",
            fontSize: "28px",
          }}
        >
          <div style={{ display: "flex" }}>{`$${experiment.offer.priceUsd} fixed-scope pilot`}</div>
          <div style={{ display: "flex", color: "#a5f3fc" }}>Public-safe fit check first</div>
        </div>
      </div>
    ),
    size,
  );
}
