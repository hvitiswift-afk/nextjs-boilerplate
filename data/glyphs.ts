export type TOscillatorGlyph = {
  letter: string;
  index: number;
  distanceFromT: number;
  mirror: string;
  path: string;
  tCoupling: number;
};

const paths: Record<string, string> = {
  T: "M 100 120 L 900 120 L 900 240 L 580 240 L 580 900 L 420 900 L 420 240 L 100 240 Z",
  straight: "M 160 120 L 300 120 L 300 880 L 160 880 Z M 300 120 L 820 120 L 820 240 L 300 240 Z M 300 455 L 700 455 L 700 570 L 300 570 Z",
  loop: "M 500 120 C 760 120 880 300 880 500 C 880 720 730 880 500 880 C 250 880 120 700 120 500 C 120 280 260 120 500 120 Z M 500 280 C 340 280 285 390 285 500 C 285 625 360 720 500 720 C 640 720 715 625 715 500 C 715 390 660 280 500 280 Z",
  peak: "M 120 880 L 500 120 L 880 880 L 710 880 L 500 430 L 290 880 Z",
  bowl: "M 160 120 L 480 120 C 760 120 850 255 850 405 C 850 565 735 680 505 680 L 320 680 L 320 880 L 160 880 Z M 320 265 L 320 535 L 500 535 C 625 535 690 485 690 405 C 690 320 625 265 500 265 Z",
  block: "M 160 120 L 310 120 L 310 760 L 790 760 L 790 880 L 160 880 Z"
};

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function pathFor(letter: string) {
  if (letter === "T") return paths.T;
  if ("EFLHIK".includes(letter)) return paths.straight;
  if ("OSCGQ".includes(letter)) return paths.loop;
  if ("AMNVWXYZ".includes(letter)) return paths.peak;
  if ("BDPR".includes(letter)) return paths.bowl;
  return paths.block;
}

export const glyphs: TOscillatorGlyph[] = alphabet.map((letter, idx) => {
  const index = idx + 1;
  const distanceFromT = index - 20;
  return {
    letter,
    index,
    distanceFromT,
    mirror: alphabet[26 - index],
    path: pathFor(letter),
    tCoupling: Number(Math.exp(-Math.abs(distanceFromT) / 8).toFixed(4))
  };
});
