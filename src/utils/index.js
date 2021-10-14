export const hslArraySort = arr => arr.sort((a, b) => a.h - b.h || a.s - b.s || a.l - b.l);
export const rgbArraySort = arr => arr.sort((a, b) => a.r - b.r || a.g - b.g || a.b - b.b);