import { createObserverConstellationMap, type ObserverName } from "./observer-constellations";
import { createObserverParallaxMap } from "./observer-parallax";

export type ObserverRouteInput = {
  observer: ObserverName;
  prompt: string;
};

export type ObserverRouteResult = {
  observer: ObserverName;
  route: string;
  matchedConstellationId: string;
  matchedConstellationName: string;
  parallaxPair: string | null;
  reason: string;
};

function scorePrompt(prompt: string, keywords: string[]) {
  const haystack = prompt.toLowerCase();
  return keywords.reduce((score, keyword) => score + (haystack.includes(keyword) ? 1 : 0), 0);
}

export function resolveObserverRoute(input: ObserverRouteInput): ObserverRouteResult {
  const map = createObserverConstellationMap();
  const parallax = createObserverParallaxMap();
  const options = input.observer === "earth" ? map.earth : map.mars;

  const ranked = options
    .map((item) => ({ item, score: scorePrompt(input.prompt, item.keywords) }))
    .sort((a, b) => b.score - a.score);

  const match = ranked[0]?.score > 0 ? ranked[0].item : options[0];
  const pair = parallax.pairs.find((candidate) =>
    input.observer === "earth"
      ? candidate.earthId === match.id
      : candidate.marsId === match.id,
  );

  return {
    observer: input.observer,
    route: match.goblinRoute,
    matchedConstellationId: match.id,
    matchedConstellationName: match.name,
    parallaxPair: pair ? `${pair.earthId} ↔ ${pair.marsId}` : null,
    reason: `Matched ${match.name} because the ${input.observer} observer prompt overlapped with this route's keyword field. Observer first, route second, cosmic soup not allowed to pretend it is a spreadsheet.`,
  };
}
