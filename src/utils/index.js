export const capitalise = val => val.split('')[0].toUpperCase() + val.slice(1);
export const hslArraySort = arr => arr.sort((a, b) => a.h - b.h || a.l - b.l || a.s - b.s);
export const rgbArraySort = arr => arr.sort((a, b) => a.r - b.r || a.g - b.g || a.b - b.b);

export const formatRgba = val => {
  const padVal = a => val[a].toString().padStart(3, ' ');
  return `R: ${padVal('r')}, G: ${padVal('g')}, B: ${padVal('b')}, A: ${padVal('a')}`;
};