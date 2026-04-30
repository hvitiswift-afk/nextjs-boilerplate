import { createObserverConstellationMap, type ObserverWorld } from "./observer-constellations";
import { createObserverParallaxMap } from "./observer-parallax";

export type ObserverRouteInput = {
  observer: ObserverWorld;
  prompt: string;
};

export type ObserverRouteResult = {
  product: "Goblin LLM Observer Route Resolver";
  observer: ObserverWorld;
  matchedConstellationId: string;
  matchedConstellationName: string;
  route: string;
  parallaxPair?: string;
  reason: string;
  receipt: {
    id: "receipt-observer-route-resolver-011";
    kind: "llm-observer-route-resolver";
    status: "active";
  };
};

function scorePrompt(prompt: string, words: string[]) {
  const p = prompt.toLowerCase();
  return words.reduce((score, word) => score + (p.includes(word) ? 1 : 0), 0);
}

export function resolveObserverRoute(input: ObserverRouteInput): ObserverRouteResult {
  const constellationMap = createObserverConstellationMap();
  const parallaxMap = createObserverParallaxMap();
  const sky = input.observer === "mars" ? constellationMap.mars : constellationMap.earth;

  const scored = sky.map((item) => {
    const words = [
      item.name.toLowerCase(),
      item.goblinRoute.replaceAll("_", " "),
      ...item.anchor.toLowerCase().split(/\W+/),
      ...item.mythicRole.toLowerCase().split(/\W+/),
      ...item.notes.toLowerCase().split(/\W+/),
    ].filter(Boolean);

    return { item, score: scorePrompt(input.prompt, words) };
  });

  const best = scored.sort((a, b) => b.score - a.score)[0]?.item ?? sky[0];
  const pair = parallaxMap.pairs.find((candidate) =>
    input.observer === "earth"
      ? candidate.earthId === best.id
      : candidate.marsId === best.id,
  );

  return {
    product: "Goblin LLM Observer Route Resolver",
    observer: input.observer,
    matchedConstellationId: best.id,
    matchedConstellationName: best.name,
    route: best.goblinRoute,
    parallaxPair: pair ? `${pair.earthId}<->${pair.marsId}` : undefined,
    reason: `Matched ${best.name} for ${input.observer} observer routing into ${best.goblinRoute}.`,
    receipt: {
      id: "receipt-observer-route-resolver-011",
      kind: "llm-observer-route-resolver",
      status: "active",
    },
  };
}
