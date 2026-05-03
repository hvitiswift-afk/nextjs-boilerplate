export type Realm = "Elysium" | "Asphodel" | "Gehenna" | "Pluto";
export type Motion = "quiet" | "swirl";
export type Polarity = "positive" | "neutral" | "negative" | "alternating";

export type FieldSample = {
  id: string;
  label: string;
  divergence: number;
  curl: number;
  timeDivergence?: number;
  timeCurl?: number;
};

export type ClassifiedField = FieldSample & {
  realm: Realm;
  motion: Motion;
  polarity: Polarity;
};

export const EPSILON = 0.12;
export const OMEGA = 0.5;

export function classifyRealm(sample: FieldSample): Realm {
  const timeDivergence = Math.abs(sample.timeDivergence ?? 999);
  const timeCurl = Math.abs(sample.timeCurl ?? 0);

  if (timeDivergence <= EPSILON && timeCurl > OMEGA) {
    return "Pluto";
  }

  if (sample.divergence > EPSILON) {
    return "Elysium";
  }

  if (sample.divergence < -EPSILON) {
    return "Gehenna";
  }

  return "Asphodel";
}

export function classifyMotion(sample: FieldSample): Motion {
  return Math.abs(sample.curl) > OMEGA ? "swirl" : "quiet";
}

export function polarityForRealm(realm: Realm, motion: Motion): Polarity {
  if (realm === "Pluto") return "alternating";
  if (realm === "Elysium") return "positive";
  if (realm === "Gehenna") return "negative";
  return motion === "swirl" ? "alternating" : "neutral";
}

export function classifyField(sample: FieldSample): ClassifiedField {
  const realm = classifyRealm(sample);
  const motion = classifyMotion(sample);

  return {
    ...sample,
    realm,
    motion,
    polarity: polarityForRealm(realm, motion),
  };
}

export function loopCaptureScore(loopCharge: number, polarityMatch: number, weatherLock: boolean, radioLock: boolean): number {
  const weatherMultiplier = weatherLock ? 1.15 : 1;
  const radioMultiplier = radioLock ? 1.25 : 1;
  return loopCharge * polarityMatch * weatherMultiplier * radioMultiplier;
}

export function stokesVerified(boundaryCirculation: number, surfaceCurlFlux: number, tolerance = 0.08): boolean {
  return Math.abs(boundaryCirculation - surfaceCurlFlux) < tolerance;
}
