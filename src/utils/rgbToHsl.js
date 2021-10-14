const normaliseValues = (r, g, b) => ({ r: r / 255, g: g / 255, b: b / 255 });

const calcMinMax = (r, g, b) => {
  const normalisedValues = normaliseValues(r, g, b);
  const normalised = Object.values(normalisedValues);
  const min = Math.min(...normalised);
  const max = Math.max(...normalised);

  return {
    ...normalisedValues,
    min: normalised.filter(v => v === min).length > 1 ? 0 : min,
    max: normalised.filter(v => v === max).length > 1 ? 0 : max,
  };
};

export const calcLightness = (r, g, b) => {
  const { min, max } = calcMinMax(r, g, b);
  return (min + max) / 2;
};

export const calcSaturation = (r, g, b) => {
  const { min, max } = calcMinMax(r, g, b);

  if (min === max) return -1;
  if (calcLightness(r, g, b) < 0.5) return (max - min) / (max + min);
  return (max - min) / (2 - max - min);
};

export const calcHue = (r, g, b) => {
  const { min, max, r: nr, g: ng, b: nb } = calcMinMax(r, g, b);

  if (min === max) return -1;

  let hue = 0;
  const diff = max - min;

  switch (max) {
    case nr:
      hue = (ng - nb) / diff;
      break;
    case ng:
      hue = 2 + (nb - nr) / diff;
      break;
    case b / 255:
      hue = 4 + (nr - ng) / diff;
      break;
    default:
      break;
  }

  hue *= 60;

  if (hue < 0) hue += 360;

  return hue;
};

export default ({ r, g, b }) => ({ h: calcHue(r, g, b), s: calcSaturation(r, g, b), l: calcLightness(r, g, b) });