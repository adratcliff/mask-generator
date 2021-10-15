export const hslArraySort = arr => arr.sort((a, b) => a.h - b.h || a.l - b.l || a.s - b.s);
export const rgbArraySort = arr => arr.sort((a, b) => a.r - b.r || a.g - b.g || a.b - b.b);