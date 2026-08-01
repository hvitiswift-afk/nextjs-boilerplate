export type OrbitalRailLetter = {
  letter: string;
  index: number;
  distanceFromT: number;
  mirror: string;
  radius: number;
  phaseDeg: number;
  meanMotion: number;
  energy: number;
  boltzWeight: number;
  probability: number;
  x: number;
  y: number;
};

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const mu = 1;
const r0 = 72;
const deltaR = 9;
const beta = 1.35;

function rawLetter(letter: string, idx: number) {
  const index = idx + 1;
  const distanceFromT = index - 20;
  const radius = r0 + deltaR * Math.abs(distanceFromT);
  const phaseRad = (2 * Math.PI * (index - 20)) / 26;
  const phaseDeg = (phaseRad * 180) / Math.PI;
  const meanMotion = Math.sqrt(mu / Math.pow(radius, 3));
  const mirrorIndex = 27 - index;
  const mirrorPenalty = Math.abs(mirrorIndex - 20) / 100;
  const railPenalty = Math.abs(distanceFromT) / 90;
  const energy = -mu / (2 * radius) + railPenalty + mirrorPenalty;
  const boltzWeight = Math.exp(-beta * energy);
  return {
    letter,
    index,
    distanceFromT,
    mirror: alphabet[mirrorIndex - 1],
    radius,
    phaseDeg,
    meanMotion,
    energy,
    boltzWeight,
    x: radius * Math.cos(phaseRad),
    y: radius * Math.sin(phaseRad)
  };
}

const raw = alphabet.map(rawLetter);
const partitionZ = raw.reduce((sum, item) => sum + item.boltzWeight, 0);

export const orbitalRailLetters: OrbitalRailLetter[] = raw.map((item) => ({
  ...item,
  probability: item.boltzWeight / partitionZ
}));

export const orbitalRailConstants = {
  mu,
  r0,
  deltaR,
  beta,
  partitionZ,
  entropy: -orbitalRailLetters.reduce((sum, item) => sum + item.probability * Math.log(item.probability), 0),
  centralLetter: "T",
  centralIndex: 20
};

export const orbitalRailEquations = [
  { name: "Letter radius", formula: "r_i = r₀ + Δr |i - 20|", note: "T has index 20, so T is the central attractor." },
  { name: "Orbital phase", formula: "θ_i(t)=θ_i0+n_i t", note: "Letters advance by mean motion." },
  { name: "Mean motion", formula: "n_i = √(μ/r_i³)", note: "Outer letters drift slower." },
  { name: "Mirror pair", formula: "M(i)=27-i", note: "A↔Z, B↔Y, and the rail folds around the alphabet." },
  { name: "Stat weight", formula: "p_i ∝ exp(-βE_i)", note: "Lower-energy letters dominate the rail ensemble." }
];
