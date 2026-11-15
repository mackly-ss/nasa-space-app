// Small seeded 2D simplex noise + helpers for procedural terrain.

export function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createNoise2D(seed = 1) {
  const rand = mulberry32(seed);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const grad = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
  const F2 = 0.5 * (Math.sqrt(3) - 1), G2 = (3 - Math.sqrt(3)) / 6;

  return function (xin, yin) {
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s), j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const x0 = xin - (i - t), y0 = yin - (j - t);
    const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255;
    let n = 0;
    const c = (x, y, gi) => {
      let tt = 0.5 - x * x - y * y;
      if (tt < 0) return 0;
      tt *= tt; const g = grad[gi & 7];
      return tt * tt * (g[0] * x + g[1] * y);
    };
    n += c(x0, y0, perm[ii + perm[jj]]);
    n += c(x1, y1, perm[ii + i1 + perm[jj + j1]]);
    n += c(x2, y2, perm[ii + 1 + perm[jj + 1]]);
    return 70 * n; // ~[-1, 1]
  };
}

export function fbm(noise, x, y, octaves = 5, lac = 2, gain = 0.5) {
  let amp = 1, freq = 1, sum = 0, norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * noise(x * freq, y * freq);
    norm += amp; amp *= gain; freq *= lac;
  }
  return sum / norm;
}

export function ridged(noise, x, y, octaves = 4) {
  let amp = 0.5, freq = 1, sum = 0;
  for (let o = 0; o < octaves; o++) {
    const n = 1 - Math.abs(noise(x * freq, y * freq));
    sum += n * n * amp; amp *= 0.5; freq *= 2;
  }
  return sum;
}

export const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
