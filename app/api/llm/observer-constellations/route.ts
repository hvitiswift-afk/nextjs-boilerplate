import { createObserverConstellationMap } from "@/lib/llm/observer-constellations";

export async function GET() {
  const map = createObserverConstellationMap();

  return Response.json({
    ok: true,
    ...map,
    receipt: {
      id: "receipt-observer-constellations-earth-mars-007",
      kind: "llm-observer-constellation-map",
      status: "active",
      observers: ["earth", "mars"],
      law: "Mark the observing world before interpreting the sky. Earth gives home orientation; Mars gives expedition orientation.",
    },
  });
}
