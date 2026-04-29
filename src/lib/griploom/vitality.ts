export type VitalityInput = {
  qCoulombs: number;
  cFarads: number;
  iCurrent: number;
  resistance: number;
  crewSignal?: number;
  directorSignal?: number;
  houseSignal?: number;
  audienceSignal?: number;
};

export function pythagoreanPower({
  crewSignal = 0,
  directorSignal = 0,
  houseSignal = 0,
  audienceSignal = 0
}: Pick<
  VitalityInput,
  "crewSignal" | "directorSignal" | "houseSignal" | "audienceSignal"
>) {
  return Math.sqrt(
    crewSignal ** 2 +
      directorSignal ** 2 +
      houseSignal ** 2 +
      audienceSignal ** 2
  );
}

export function vitality(input: VitalityInput) {
  const power = pythagoreanPower(input);
  const denominator = 1 + Math.max(0, input.resistance);
  const value =
    (input.qCoulombs * input.cFarads * input.iCurrent * power) / denominator;

  return {
    qCoulombs: input.qCoulombs,
    cFarads: input.cFarads,
    iCurrent: input.iCurrent,
    resistance: input.resistance,
    power,
    hVitality: Number(value.toFixed(4))
  };
}
