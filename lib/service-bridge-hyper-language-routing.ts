import type { HyperCubePoint } from "@/lib/service-bridge-hyper-language-cube";

export type HyperMoveMode =
  | "adjacent-step"
  | "polyglot-bridge"
  | "hyper-leap"
  | "hyper-jump"
  | "sub-language-descent"
  | "super-language-ascent"
  | "hyper-language-ascent";

export type HyperRouteRequest = {
  cube: HyperCubePoint[];
  sourcePoint: number;
  targetPoint?: number;
  sourceLanguageId?: string;
  targetLanguageId?: string;
  mode: HyperMoveMode;
  maxHops?: number;
};

function pointDistance(a: HyperCubePoint, b: HyperCubePoint) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z);
}

function languageIds(point: HyperCubePoint) {
  return new Set(point.languages.map((language) => language.id.toLowerCase()));
}

function semanticSimilarity(a: HyperCubePoint, b: HyperCubePoint) {
  const keys = Object.keys(a.expressionProfile) as Array<keyof typeof a.expressionProfile>;
  const distance = keys.reduce(
    (sum, key) => sum + Math.abs(a.expressionProfile[key] - b.expressionProfile[key]),
    0,
  );
  return Math.max(0, 1 - distance / keys.length);
}

function sharedLanguages(a: HyperCubePoint, b: HyperCubePoint) {
  const left = languageIds(a);
  return [...languageIds(b)].filter((id) => left.has(id));
}

function selectTarget(request: HyperRouteRequest) {
  if (request.targetPoint !== undefined) {
    const point = request.cube[request.targetPoint];
    if (!point) throw new Error("targetPoint is outside the cube.");
    return point;
  }

  if (request.targetLanguageId) {
    const targetId = request.targetLanguageId.toLowerCase();
    const candidates = request.cube.filter((point) =>
      point.languages.some((language) => language.id.toLowerCase() === targetId),
    );
    if (candidates.length === 0) throw new Error("targetLanguageId is not mapped on the cube.");
    const source = request.cube[request.sourcePoint];
    return candidates.sort((a, b) => pointDistance(source, a) - pointDistance(source, b))[0];
  }

  throw new Error("targetPoint or targetLanguageId is required.");
}

export function createHyperLanguageRoute(request: HyperRouteRequest) {
  if (request.cube.length !== 343) throw new Error("A complete 343-point cube is required.");
  const source = request.cube[request.sourcePoint];
  if (!source) throw new Error("sourcePoint is outside the cube.");
  const target = selectTarget(request);
  const maxHops = Math.max(1, Math.min(343, Math.floor(request.maxHops ?? 21)));

  const route: HyperCubePoint[] = [source];
  const visited = new Set<number>([source.index]);

  if (request.mode === "hyper-jump") {
    route.push(target);
  } else if (request.mode === "hyper-leap") {
    const bridge = request.cube
      .filter((point) => point.index !== source.index && point.index !== target.index)
      .sort(
        (a, b) =>
          semanticSimilarity(source, b) + semanticSimilarity(b, target) -
          (semanticSimilarity(source, a) + semanticSimilarity(a, target)),
      )[0];
    if (bridge) route.push(bridge);
    route.push(target);
  } else {
    let current = source;
    while (current.index !== target.index && route.length <= maxHops) {
      const candidates = request.cube
        .filter((point) => !visited.has(point.index))
        .filter((point) => {
          if (request.mode === "adjacent-step") return pointDistance(current, point) === 1;
          if (request.mode === "polyglot-bridge") return sharedLanguages(current, point).length > 0;
          if (request.mode === "sub-language-descent") {
            return point.languages.some((language) => language.layer === "sub-language");
          }
          if (request.mode === "super-language-ascent") {
            return point.languages.some((language) => language.layer === "super-language");
          }
          if (request.mode === "hyper-language-ascent") {
            return point.languages.some((language) => language.layer === "hyper-language");
          }
          return false;
        })
        .sort((a, b) => {
          const scoreA = pointDistance(a, target) - semanticSimilarity(a, target);
          const scoreB = pointDistance(b, target) - semanticSimilarity(b, target);
          return scoreA - scoreB;
        });

      const next = candidates[0] ?? target;
      route.push(next);
      visited.add(next.index);
      current = next;
    }

    if (route.at(-1)?.index !== target.index) route.push(target);
  }

  return {
    schema: "jp-hviti-service-bridge-hyper-language-route/v1",
    createdAt: new Date().toISOString(),
    mode: request.mode,
    sourcePoint: source.index,
    targetPoint: target.index,
    hops: route.map((point, position) => ({
      position,
      point: point.index,
      coordinate: { x: point.x, y: point.y, z: point.z },
      languages: point.languages.map((language) => language.id),
      sharedWithPrevious:
        position === 0 ? [] : sharedLanguages(route[position - 1], point),
      semanticSimilarityToTarget: semanticSimilarity(point, target),
    })),
    metrics: {
      hopCount: Math.max(0, route.length - 1),
      directCubeDistance: pointDistance(source, target),
      reachedTarget: route.at(-1)?.index === target.index,
      repeatedPointsAllowed: false,
    },
    execution: {
      routePlanned: true,
      translationGenerated: false,
      signalTransmitted: false,
      hyperJumpPhysicallyPerformed: false,
      externalActionCompleted: false,
    },
  };
}
