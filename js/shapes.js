// Low-poly triangle "portraits" in a 100×100 box, used by the shard morph engine.
// Each shape is a list of convex parts; parts are fan-triangulated, then subdivided
// so every shape has exactly the same number of triangles and can morph into any other.

import { mulberry32 } from './noise.js';

const GOLD = '#c99a3c', GOLD2 = '#a97a26', FOIL = '#d8b25a';
const SILVER = '#c9cdd4', STEEL = '#8d939e', DARK = '#2b2e36', TIRE = '#3a3d46';
const PANEL = '#24365e', PANEL2 = '#30477a', WHITE = '#e9e9ec', DUST = '#d9cbb5';

const poly = (c, ...pts) => ({ c, pts });
const circ = (c, cx, cy, r, n = 8, rot = 0, ry = r) =>
  poly(c, ...Array.from({ length: n }, (_, i) => {
    const a = rot + (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * ry];
  }));
const bar = (c, x1, y1, x2, y2, w = 1.4) => {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
  const nx = (-dy / L) * w / 2, ny = (dx / L) * w / 2;
  return poly(c, [x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]);
};

// Faceted sphere: rings of jittered points, lit from the top-left.
function planet(base, seed, spots = []) {
  const r = mulberry32(seed), parts = [];
  const cx = 50, cy = 50, R = 40;
  const rings = [0, 0.38, 0.72, 1];
  const counts = [1, 6, 11, 16];
  const pts = rings.map((rr, k) => Array.from({ length: counts[k] }, (_, i) => {
    const a = (i / counts[k]) * Math.PI * 2 + k * 0.3 + (k && k < 3 ? (r() - 0.5) * 0.25 : 0);
    const j = k && k < 3 ? (r() - 0.5) * 0.08 : 0;
    return [cx + Math.cos(a) * R * (rr + j), cy + Math.sin(a) * R * (rr + j)];
  }));
  const nearest = (arr, p) => arr.reduce((b, q, i) => (Math.hypot(q[0] - p[0], q[1] - p[1]) < Math.hypot(arr[b][0] - p[0], arr[b][1] - p[1]) ? i : b), 0);
  for (let k = 1; k < rings.length; k++) {
    const inner = pts[k - 1], outer = pts[k];
    for (let i = 0; i < outer.length; i++) {
      const a = outer[i], b = outer[(i + 1) % outer.length];
      const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const ii = nearest(inner, m);
      parts.push(poly(base, a, b, inner[ii]));
      const ia = nearest(inner, a);
      if (ia !== ii) parts.push(poly(base, a, inner[ii], inner[ia]));
    }
  }
  // tint facets near "spots" (maria, ice caps, …)
  for (const p of parts) {
    const c = centroid(p.pts);
    for (const [sx, sy, sr, col] of spots) if (Math.hypot(c[0] - sx, c[1] - sy) < sr) p.c = col;
  }
  return parts;
}

export const SHAPES = {
  lander: [ // Apollo Lunar Module
    poly(GOLD, [28, 52], [36, 46], [64, 46], [72, 52], [72, 64], [64, 70], [36, 70], [28, 64]),
    poly(GOLD2, [36, 52], [50, 50], [64, 52], [64, 64], [50, 66], [36, 64]),
    poly(SILVER, [36, 46], [33, 32], [41, 21], [59, 21], [67, 30], [64, 46]),
    poly(STEEL, [50, 21], [59, 21], [67, 30], [64, 46], [52, 46]),
    poly(DARK, [41, 29], [47, 25], [47, 33]),
    poly(WHITE, [60, 12], [71, 9], [68, 18]),
    bar(STEEL, 63, 21, 67, 14, 1.2),
    bar(SILVER, 30, 60, 15, 84, 1.8), bar(SILVER, 70, 60, 85, 84, 1.8),
    bar(SILVER, 40, 69, 34, 86, 1.6), bar(SILVER, 60, 69, 66, 86, 1.6),
    poly(SILVER, [10, 84], [20, 84], [19, 87], [11, 87]), poly(SILVER, [80, 84], [90, 84], [89, 87], [81, 87]),
    poly(STEEL, [30, 86], [38, 86], [37, 88], [31, 88]), poly(STEEL, [62, 86], [70, 86], [69, 88], [63, 88]),
    poly(FOIL, [44, 70], [56, 70], [53, 76], [47, 76]),
  ],
  surveyor: [ // Surveyor: tripod lander with high-gain antenna & solar panel
    poly(STEEL, [44, 26], [56, 26], [53, 66], [47, 66]),
    poly(PANEL, [56, 14], [80, 8], [82, 22], [58, 28]),
    poly(PANEL2, [68, 11], [80, 8], [82, 22], [70, 25]),
    poly(WHITE, [22, 16], [40, 12], [40, 30], [22, 30]),
    poly(GOLD, [36, 50], [64, 50], [60, 62], [40, 62]),
    poly(WHITE, [42, 44], [58, 44], [58, 50], [42, 50]),
    bar(SILVER, 40, 60, 14, 82, 1.8), bar(SILVER, 60, 60, 86, 82, 1.8), bar(SILVER, 50, 62, 50, 88, 1.8),
    circ(SILVER, 13, 83, 5, 6, 0, 2), circ(SILVER, 87, 83, 5, 6, 0, 2), circ(SILVER, 50, 89, 5, 6, 0, 2),
    bar(STEEL, 50, 30, 30, 22, 1.2), bar(STEEL, 50, 30, 69, 18, 1.2),
  ],
  lrv: [ // Lunar Roving Vehicle, side view
    poly(SILVER, [12, 58], [88, 58], [85, 64], [15, 64]),
    poly(STEEL, [12, 56], [21, 49], [35, 49], [37, 58]), poly(STEEL, [63, 58], [65, 49], [79, 49], [88, 56]),
    poly(DARK, [40, 44], [47, 44], [49, 58], [40, 58]), poly(DARK, [52, 44], [59, 44], [61, 58], [52, 58]),
    poly(STEEL, [30, 48], [36, 42], [38, 58], [30, 58]),
    circ(TIRE, 25, 68, 10, 8, Math.PI / 8), circ(STEEL, 25, 68, 3.6, 6),
    circ(TIRE, 75, 68, 10, 8, Math.PI / 8), circ(STEEL, 75, 68, 3.6, 6),
    bar(SILVER, 70.5, 50, 70.5, 26, 1.4),
    poly(WHITE, [58, 26], [70.5, 16], [83, 26], [70.5, 28.5]),
    poly(GOLD, [22, 42], [29, 42], [29, 49], [22, 49]),
    poly('#e3e0d8', [45, 64], [55, 64], [53, 70], [47, 70]),
  ],
  marsrover: [ // Spirit / Opportunity
    poly(PANEL, [8, 42], [92, 42], [85, 50], [15, 50]),
    poly(PANEL2, [50, 42], [92, 42], [85, 50], [50, 50]),
    poly(DUST, [28, 50], [72, 50], [70, 62], [30, 62]),
    bar(SILVER, 66, 42, 66, 20, 2.4),
    poly(DUST, [57, 13], [76, 13], [76, 21], [57, 21]),
    circ(DARK, 61, 17, 2, 6), circ(DARK, 71, 17, 2, 6),
    bar(STEEL, 32, 62, 18, 72, 1.8), bar(STEEL, 32, 62, 50, 72, 1.8), bar(STEEL, 68, 62, 82, 72, 1.8),
    circ(TIRE, 18, 76, 6.5, 8, Math.PI / 8), circ(TIRE, 50, 76, 6.5, 8, Math.PI / 8), circ(TIRE, 82, 76, 6.5, 8, Math.PI / 8),
    bar(SILVER, 28, 42, 24, 30, 1),
    poly(WHITE, [72, 46], [80, 34], [84, 36], [76, 48]),
  ],
  heli: [ // Ingenuity
    poly(SILVER, [40, 52], [60, 52], [60, 66], [40, 66]),
    poly(STEEL, [50, 52], [60, 52], [60, 66], [50, 66]),
    poly(PANEL, [34, 16], [66, 16], [61, 21], [39, 21]),
    bar(SILVER, 50, 21, 50, 52, 2),
    poly(DARK, [8, 28], [92, 25], [92, 28.5], [8, 31.5]),
    poly(DARK, [10, 39], [90, 36], [90, 39.5], [10, 42.5]),
    circ(STEEL, 50, 30, 3, 6), circ(STEEL, 50, 40, 3, 6),
    bar(SILVER, 42, 66, 28, 86, 1.4), bar(SILVER, 58, 66, 72, 86, 1.4),
    bar(SILVER, 46, 66, 41, 88, 1.2), bar(SILVER, 54, 66, 59, 88, 1.2),
    poly(GOLD, [44, 58], [56, 58], [56, 62], [44, 62]),
  ],
  marslander: [ // Viking / Phoenix / InSight style
    circ(PANEL, 17, 52, 15, 10), circ(PANEL2, 17, 52, 7, 6),
    circ(PANEL, 83, 52, 15, 10), circ(PANEL2, 83, 52, 7, 6),
    poly(GOLD, [32, 48], [68, 48], [73, 58], [67, 66], [33, 66], [27, 58]),
    poly(DUST, [32, 43], [68, 43], [68, 48], [32, 48]),
    bar(SILVER, 64, 44, 80, 26, 1.6), bar(SILVER, 80, 26, 88, 32, 1.4),
    poly(STEEL, [86, 30], [92, 32], [89, 38]),
    circ(WHITE, 40, 36, 6, 8),
    bar(SILVER, 36, 64, 26, 84, 1.8), bar(SILVER, 64, 64, 74, 84, 1.8), bar(SILVER, 50, 66, 50, 86, 1.8),
    circ(STEEL, 25, 85, 4, 6, 0, 1.8), circ(STEEL, 75, 85, 4, 6, 0, 1.8), circ(STEEL, 50, 87, 4, 6, 0, 1.8),
  ],
  pioneer: [ // Pioneer 10/11: big dish, hex body, RTG booms
    circ(WHITE, 50, 40, 30, 14, 0, 30),
    circ('#cfd2d9', 50, 40, 18, 10),
    circ(SILVER, 50, 40, 6, 6),
    bar(STEEL, 50, 40, 50, 12, 1.2), bar(STEEL, 38, 22, 50, 12, 1), bar(STEEL, 62, 22, 50, 12, 1),
    poly(GOLD, [40, 66], [60, 66], [64, 73], [56, 80], [44, 80], [36, 73]),
    bar(STEEL, 38, 72, 10, 88, 1.4), bar(STEEL, 62, 72, 90, 88, 1.4),
    poly(DARK, [6, 86], [14, 86], [14, 92], [6, 92]), poly(DARK, [86, 86], [94, 86], [94, 92], [86, 92]),
    bar(SILVER, 50, 80, 50, 94, 1),
  ],
  kepler: [ // Kepler: telescope tube with sunshade & panel
    poly(SILVER, [30, 30], [62, 18], [76, 54], [44, 66]),
    poly(STEEL, [46, 24], [62, 18], [76, 54], [60, 60]),
    poly(DARK, [26, 26], [36, 22], [40, 32], [30, 36]),
    poly(PANEL, [44, 66], [76, 54], [82, 68], [50, 80]),
    poly(PANEL2, [60, 60], [76, 54], [82, 68], [66, 74]),
    poly(GOLD, [50, 80], [82, 68], [84, 74], [54, 86]),
    bar(WHITE, 30, 30, 18, 18, 2.4),
    poly(WHITE, [14, 14], [24, 10], [26, 20], [16, 24]),
  ],
  dawn: [ // Dawn: box body with very long solar wings
    poly(GOLD, [40, 40], [60, 40], [60, 60], [40, 60]),
    poly(GOLD2, [50, 40], [60, 40], [60, 60], [50, 60]),
    poly(PANEL, [2, 45], [36, 45], [36, 55], [2, 55]), poly(PANEL2, [19, 45], [36, 45], [36, 55], [19, 55]),
    poly(PANEL, [64, 45], [98, 45], [98, 55], [64, 55]), poly(PANEL2, [81, 45], [98, 45], [98, 55], [81, 55]),
    bar(STEEL, 36, 50, 40, 50, 2), bar(STEEL, 60, 50, 64, 50, 2),
    circ(WHITE, 50, 32, 10, 10, 0, 4),
    poly(STEEL, [44, 60], [56, 60], [54, 67], [46, 67]),
    poly('#7fb4ff', [46, 67], [54, 67], [50, 78]),
  ],
  near: [ // NEAR Shoemaker: octagonal body, 4 panels in a cross
    poly(GOLD, [40, 42], [46, 36], [54, 36], [60, 42], [60, 58], [54, 64], [46, 64], [40, 58]),
    poly(PANEL, [14, 40], [40, 42], [40, 58], [14, 60]), poly(PANEL, [60, 42], [86, 40], [86, 60], [60, 58]),
    poly(PANEL2, [42, 10], [58, 10], [56, 36], [44, 36]), poly(PANEL2, [44, 64], [56, 64], [58, 90], [42, 90]),
    circ(WHITE, 50, 50, 7, 8),
    poly(DUST, [4, 90], [30, 80], [60, 84], [96, 92], [96, 98], [4, 98]),
  ],
  moon: planet('#9a9a9c', 3, [[40, 36, 12, '#6f6f73'], [60, 44, 9, '#77777b'], [34, 58, 8, '#727276'], [66, 68, 6, '#b3b3b4']]),
  mars: planet('#c0623a', 11, [[50, 14, 9, '#efe6e0'], [36, 52, 10, '#93432a'], [64, 58, 8, '#a44d2d'], [56, 36, 6, '#d98a5e']]),
  sun: planet('#ffb347', 23, [[50, 50, 14, '#ffd27a'], [40, 40, 10, '#ffe2a0']]),
  earth: planet('#2f6fb5', 5, [[38, 40, 12, '#4d8a4a'], [62, 60, 10, '#5b8f4f'], [50, 14, 7, '#f2f4f7'], [56, 34, 6, '#e8edf3']]),
};

export const SHAPE_FOR = {
  'surveyor-1': 'surveyor', 'apollo-11': 'lander', 'apollo-12': 'surveyor', 'apollo-14': 'lander',
  'apollo-15': 'lrv', 'apollo-16': 'lrv', 'apollo-17': 'lrv',
  'viking-1': 'marslander', 'viking-2': 'marslander', phoenix: 'marslander', insight: 'marslander',
  sojourner: 'marsrover', spirit: 'marsrover', opportunity: 'marsrover', ingenuity: 'heli',
  kepler: 'kepler', dawn: 'dawn', near: 'near', 'pioneer-10': 'pioneer', 'pioneer-11': 'pioneer',
};

/* ---------------- triangulation ---------------- */
function centroid(pts) {
  let x = 0, y = 0;
  for (const p of pts) { x += p[0]; y += p[1]; }
  return [x / pts.length, y / pts.length];
}

const hexToRgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

function triangulate(parts) {
  const tris = [];
  for (const p of parts) {
    const rgb = hexToRgb(p.c);
    for (let i = 1; i < p.pts.length - 1; i++) tris.push({ p: [p.pts[0], p.pts[i], p.pts[i + 1]], rgb });
  }
  return tris;
}

const area = (t) => Math.abs((t.p[1][0] - t.p[0][0]) * (t.p[2][1] - t.p[0][1]) - (t.p[2][0] - t.p[0][0]) * (t.p[1][1] - t.p[0][1])) / 2;

// Split the largest triangle along its longest edge until we have n triangles.
function subdivide(tris, n) {
  tris = tris.slice();
  while (tris.length < n) {
    let bi = 0, ba = -1;
    for (let i = 0; i < tris.length; i++) { const a = area(tris[i]); if (a > ba) { ba = a; bi = i; } }
    const t = tris[bi];
    const [a, b, c] = t.p;
    const e = [[a, b, c], [b, c, a], [c, a, b]].sort((x, y) => Math.hypot(y[1][0] - y[0][0], y[1][1] - y[0][1]) - Math.hypot(x[1][0] - x[0][0], x[1][1] - x[0][1]))[0];
    const m = [(e[0][0] + e[1][0]) / 2, (e[0][1] + e[1][1]) / 2];
    tris.splice(bi, 1, { p: [e[0], m, e[2]], rgb: t.rgb }, { p: [m, e[1], e[2]], rgb: t.rgb });
  }
  return tris;
}

// Facet shading: light from the top-left plus a little per-triangle jitter.
function shade(tris, seed) {
  const r = mulberry32(seed);
  for (const t of tris) {
    const [cx, cy] = centroid(t.p);
    const light = 1 + ((50 - cx) + (50 - cy)) * 0.0028 + (r() - 0.5) * 0.16;
    t.rgb = t.rgb.map((v) => Math.max(0, Math.min(255, v * light)));
  }
  return tris;
}

let cache = null;
export function buildShapes() {
  if (cache) return cache;
  const raw = Object.fromEntries(Object.entries(SHAPES).map(([k, parts]) => [k, triangulate(parts)]));
  const N = Math.max(...Object.values(raw).map((t) => t.length)) + 24;
  cache = { N, shapes: {} };
  let seed = 1;
  for (const [k, tris] of Object.entries(raw)) {
    const full = shade(subdivide(tris, N), seed++);
    // order by a diagonal sweep so triangle i lands in a similar region in every shape
    full.sort((a, b) => { const ca = centroid(a.p), cb = centroid(b.p); return (ca[0] + ca[1] * 0.6) - (cb[0] + cb[1] * 0.6); });
    cache.shapes[k] = full;
  }
  return cache;
}
