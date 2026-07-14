export const HYPER_LANGUAGE_EDGE = 7;
export const HYPER_LANGUAGE_POINTS = HYPER_LANGUAGE_EDGE ** 3;

export type LanguageExpressionLayer =
  | "sub-language"
  | "language"
  | "polyglot"
  | "super-language"
  | "hyper-language";

export type HyperLanguageEntry = {
  id: string;
  label?: string;
  family?: string;
  script?: string;
  modality?: "spoken" | "signed" | "written" | "symbolic" | "code" | "signal" | "mixed";
  layer?: LanguageExpressionLayer;
  variants?: string[];
  related?: string[];
  weight?: number;
};

export type HyperCubePoint = {
  index: number;
  x: number;
  y: number;
  z: number;
  languages: HyperLanguageEntry[];
  expressionProfile: {
    semantic: number;
    syntactic: number;
    phonetic: number;
    visual: number;
    executable: number;
    symbolic: number;
    relational: number;
  };
};

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function normalizeScore(value: number) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function coordinateFromIndex(index: number) {
  return {
    x: index % HYPER_LANGUAGE_EDGE,
    y: Math.floor(index / HYPER_LANGUAGE_EDGE) % HYPER_LANGUAGE_EDGE,
    z: Math.floor(index / (HYPER_LANGUAGE_EDGE ** 2)) % HYPER_LANGUAGE_EDGE,
  };
}

function profileForPoint(index: number) {
  const { x, y, z } = coordinateFromIndex(index);
  return {
    semantic: normalizeScore((x + 1) / HYPER_LANGUAGE_EDGE),
    syntactic: normalizeScore((y + 1) / HYPER_LANGUAGE_EDGE),
    phonetic: normalizeScore((z + 1) / HYPER_LANGUAGE_EDGE),
    visual: normalizeScore((x + z + 2) / (HYPER_LANGUAGE_EDGE * 2)),
    executable: normalizeScore((y + z + 2) / (HYPER_LANGUAGE_EDGE * 2)),
    symbolic: normalizeScore((x + y + 2) / (HYPER_LANGUAGE_EDGE * 2)),
    relational: normalizeScore((x + y + z + 3) / (HYPER_LANGUAGE_EDGE * 3)),
  };
}

export function createEmptyHyperLanguageCube(): HyperCubePoint[] {
  return Array.from({ length: HYPER_LANGUAGE_POINTS }, (_, index) => ({
    index,
    ...coordinateFromIndex(index),
    languages: [],
    expressionProfile: profileForPoint(index),
  }));
}

export function assignLanguageToCube(
  cube: HyperCubePoint[],
  language: HyperLanguageEntry,
  repetitions = 3,
) {
  const normalized = language.id.trim();
  if (!normalized) throw new Error("Every language requires an id.");
  const copies = Math.max(1, Math.min(HYPER_LANGUAGE_POINTS, Math.floor(repetitions)));

  for (let occurrence = 0; occurrence < copies; occurrence += 1) {
    const hash = stableHash(`${normalized}:${language.layer ?? "language"}:${occurrence}`);
    const point = cube[hash % HYPER_LANGUAGE_POINTS];
    point.languages.push({
      ...language,
      id: normalized,
      weight: language.weight ?? 1,
    });
  }
}

export function buildHyperLanguageCube(input: {
  languages: HyperLanguageEntry[];
  repetitionsPerLanguage?: number;
  fillEveryPoint?: boolean;
}) {
  const cube = createEmptyHyperLanguageCube();
  const repetitionsPerLanguage = Math.max(
    1,
    Math.min(HYPER_LANGUAGE_POINTS, Math.floor(input.repetitionsPerLanguage ?? 3)),
  );

  for (const language of input.languages) {
    assignLanguageToCube(cube, language, repetitionsPerLanguage);
  }

  if (input.fillEveryPoint !== false && input.languages.length > 0) {
    for (const point of cube) {
      if (point.languages.length === 0) {
        const fallback = input.languages[point.index % input.languages.length];
        point.languages.push({
          ...fallback,
          weight: (fallback.weight ?? 1) * 0.5,
        });
      }
    }
  }

  return {
    schema: "jp-hviti-service-bridge-hyper-language-cube/v1",
    createdAt: new Date().toISOString(),
    edge: HYPER_LANGUAGE_EDGE,
    pointCount: HYPER_LANGUAGE_POINTS,
    cube,
    layers: [
      "sub-language",
      "language",
      "polyglot",
      "super-language",
      "hyper-language",
    ],
    expressionAxes: {
      x: "semantic-intent-density",
      y: "syntactic-structural-density",
      z: "phonetic-signal-density",
      derived: ["visual", "executable", "symbolic", "relational"],
    },
    multiplicity: {
      multipleLanguagesPerPointAllowed: true,
      sameLanguageAcrossMultiplePointsAllowed: true,
      repeatedMappingAllowed: true,
      everyPointCanCarryOneOrMoreLanguages: true,
    },
    jumpModes: {
      hyperLeap: "move by semantic similarity across non-adjacent points",
      hyperJump: "move by exact target coordinate or language identity",
      polyglotBridge: "combine languages at one or more shared points",
      subLanguageDescent: "resolve into dialect, register, script, modality, or code subset",
      superLanguageAscent: "merge related language structures into a higher abstraction",
      hyperLanguageAscent: "merge semantic, symbolic, executable, visual, and signal representations",
    },
    truthBoundary: {
      mappingGenerated: true,
      universalMeaningGuaranteed: false,
      allLanguagesEnumerated: false,
      externalActionCompleted: false,
    },
  };
}
