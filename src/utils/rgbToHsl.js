const normaliseValues = (r, g, b) => ({ r: r / 255, g: g / 255, b: b / 255 });

const calcMinMax = (r, g, b) => {
  const normalisedValues = normaliseValues(r, g, b);
  const normalised = Object.values(normalisedValues);
  const min = Math.min(...normalised);
  const max = Math.max(...normalised);

  return {
    ...normalisedValues,
    min,
    max,
    delta: max - min,
  };
};

export const calcLightness = (r, g, b) => {
  const { min, max } = calcMinMax(r, g, b);
  return (min + max) / 2;
};

export const calcSaturation = (r, g, b) => {
  const { delta } = calcMinMax(r, g, b);

  if (!delta) return 0;
  return delta / (1 - Math.abs((2 * calcLightness(r, g, b)) - 1));
};

export const calcHue = (r, g, b) => {
  const { delta, max, r: nr, g: ng, b: nb } = calcMinMax(r, g, b);
  if (!delta) return 0;

  let hue = 0;

  switch (max) {
    case nr:
      hue = ((ng - nb) / delta) % 6;
      break;
    case ng:
      hue = 2 + ((nb - nr) / delta);
      break;
    case b / 255:
      hue = 4 + ((nr - ng) / delta);
      break;
    default:
      break;
  }

  hue *= 60;

  if (hue < 0) hue += 360;

  return hue;
};

export default ({ r, g, b }) => ({ h: calcHue(r, g, b), s: calcSaturation(r, g, b), l: calcLightness(r, g, b) });