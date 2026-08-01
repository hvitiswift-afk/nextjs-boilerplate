export type OrbitPreset = {
  name: string;
  body: string;
  muKm3S2: number;
  radiusKm: number;
  altitudeKm: number;
  eccentricity: number;
};

export type OrbitComputed = OrbitPreset & {
  rKm: number;
  semiMajorAxisKm: number;
  periapsisKm: number;
  apoapsisKm: number;
  circularVelocityKmS: number;
  periodMinutes: number;
  specificEnergyKm2S2: number;
  specificAngularMomentumKm2S: number;
};

export const orbitPresets: OrbitPreset[] = [
  { name: "Low Earth reference", body: "Earth", muKm3S2: 398600.4418, radiusKm: 6378.137, altitudeKm: 400, eccentricity: 0 },
  { name: "GPS-like MEO", body: "Earth", muKm3S2: 398600.4418, radiusKm: 6378.137, altitudeKm: 20200, eccentricity: 0.01 },
  { name: "Geostationary belt", body: "Earth", muKm3S2: 398600.4418, radiusKm: 6378.137, altitudeKm: 35786, eccentricity: 0 },
  { name: "Lunar low orbit", body: "Moon", muKm3S2: 4902.8001, radiusKm: 1737.4, altitudeKm: 100, eccentricity: 0 }
];

export function computeOrbit(preset: OrbitPreset): OrbitComputed {
  const rKm = preset.radiusKm + preset.altitudeKm;
  const semiMajorAxisKm = rKm / (1 - preset.eccentricity);
  const periapsisKm = semiMajorAxisKm * (1 - preset.eccentricity);
  const apoapsisKm = semiMajorAxisKm * (1 + preset.eccentricity);
  const circularVelocityKmS = Math.sqrt(preset.muKm3S2 / rKm);
  const periodMinutes = (2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxisKm, 3) / preset.muKm3S2)) / 60;
  const specificEnergyKm2S2 = -preset.muKm3S2 / (2 * semiMajorAxisKm);
  const specificAngularMomentumKm2S = Math.sqrt(preset.muKm3S2 * semiMajorAxisKm * (1 - preset.eccentricity ** 2));

  return {
    ...preset,
    rKm,
    semiMajorAxisKm,
    periapsisKm,
    apoapsisKm,
    circularVelocityKmS,
    periodMinutes,
    specificEnergyKm2S2,
    specificAngularMomentumKm2S
  };
}

export function hohmannTransfer(muKm3S2: number, r1Km: number, r2Km: number) {
  const aTransferKm = (r1Km + r2Km) / 2;
  const v1 = Math.sqrt(muKm3S2 / r1Km);
  const v2 = Math.sqrt(muKm3S2 / r2Km);
  const vTransferPeriapsis = Math.sqrt(muKm3S2 * (2 / r1Km - 1 / aTransferKm));
  const vTransferApoapsis = Math.sqrt(muKm3S2 * (2 / r2Km - 1 / aTransferKm));
  const deltaV1 = Math.abs(vTransferPeriapsis - v1);
  const deltaV2 = Math.abs(v2 - vTransferApoapsis);
  const transferTimeMinutes = Math.PI * Math.sqrt(Math.pow(aTransferKm, 3) / muKm3S2) / 60;

  return {
    aTransferKm,
    deltaV1,
    deltaV2,
    totalDeltaV: deltaV1 + deltaV2,
    transferTimeMinutes
  };
}

export const equations = [
  { name: "Vis-viva", formula: "v² = μ(2/r - 1/a)", note: "Velocity anywhere on a Keplerian orbit." },
  { name: "Kepler period", formula: "T = 2π√(a³/μ)", note: "Orbital period from semi-major axis." },
  { name: "Specific energy", formula: "ε = v²/2 - μ/r = -μ/(2a)", note: "Bound ellipses have negative energy." },
  { name: "Conic radius", formula: "r(ν)=a(1-e²)/(1+e cosν)", note: "Radius by true anomaly ν." },
  { name: "Angular momentum", formula: "h = |r × v| = √(μa(1-e²))", note: "Constant for two-body motion." }
];
