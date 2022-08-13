const rgbToLab = rgb => {
  let r = rgb.r / 255,
      g = rgb.g / 255,
      b = rgb.b / 255,
      x, y, z;

  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

  return {
    l: (116 * y) - 16,
    a: 500 * (x - y),
    b: 200 * (y - z),
  };
};

const labToRgb = lab => {
  let y = (lab.l + 16) / 116,
      x = lab.a / 500 + y,
      z = y - lab.b / 200,
      r, g, b;

  x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16/116) / 7.787);
  y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16/116) / 7.787);
  z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16/116) / 7.787);

  r = x *  3.2406 + y * -1.5372 + z * -0.4986;
  g = x * -0.9689 + y *  1.8758 + z *  0.0415;
  b = x *  0.0557 + y * -0.2040 + z *  1.0570;

  r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1/2.4) - 0.055) : 12.92 * r;
  g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1/2.4) - 0.055) : 12.92 * g;
  b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1/2.4) - 0.055) : 12.92 * b;

  return {
    r: Math.max(0, Math.min(1, r)) * 255,
    g: Math.max(0, Math.min(1, g)) * 255,
    b: Math.max(0, Math.min(1, b)) * 255,
  };
};

const getTarget = (lab, targets) => {
  return targets.reduce((acc, cur, idx) => {
    const dist = Math.sqrt(Math.pow(cur.l - lab.l, 2) + Math.pow(cur.a - lab.a, 2) + Math.pow(cur.b - lab.b, 2));
    return (!acc || dist < acc.dist) ? { dist, idx } : acc;
  }, null);
};

self.onmessage = ({ data: body }) => {
  const labTargets = body.targets.map(colour => rgbToLab(colour));

  const { dist, type } = body.blur;

  self.postMessage(body.img.data.reduce((acc, cur, idx) => {
    const curIdx = acc.length > 1 ? acc.length - 1 : 0;
    switch (idx % 4) {
      case 0:
        acc.push({ r: cur });
        break;
      case 1:
        acc[curIdx].g = cur;
        break;
      case 2:
        acc[curIdx].b = cur;
        break;
      case 3:
        acc[curIdx].a = cur;
        break;
    }
    return acc;
  }, []).reduce((acc, cur, idx, self) => {
    let rgb = cur;
    if (dist) {
      const posX = idx % body.img.width;
      const posY = Math.floor(idx / body.img.width);
      const xMin = Math.max(0, posX - dist);
      const xMax = Math.min(body.img.width, posX + dist);
      const yMin = Math.max(0, posY - dist);
      const yMax = Math.min(body.img.height, posY + dist);

      const blurredElements = [ ...new Array(yMax - yMin).keys() ].map(y => ([ ...new Array(xMax - xMin).keys() ].map(x => self[(y + yMin) * body.img.width + x + xMin]))).flat();
      const blurLength = blurredElements.length;
      const blurredSum = blurredElements.reduce((acc, cur) => ({ r: acc.r + cur.r, g: acc.g + cur.g, b: acc.b + cur.b, a: acc.a + cur.b }), { r: 0, g: 0, b: 0, a: 0 });

      rgb = { r: blurredSum.r / blurLength, g: blurredSum.g / blurLength, b: blurredSum.b / blurLength, a: blurredSum.a / blurLength };
    }

    acc.push(...Object.values(body.targets[getTarget(rgbToLab(rgb), labTargets).idx]));
    return acc;
  }, []));
};