// Species-in-Pieces style shard engine: N SVG triangles that morph between low-poly shapes.
import { buildShapes } from './shapes.js';
import { reduceMotion } from './util.js';

const NS = 'http://www.w3.org/2000/svg';
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class Shards {
  constructor(svg) {
    const { N, shapes } = buildShapes();
    this.N = N;
    this.shapes = shapes;
    this.svg = svg;
    svg.setAttribute('viewBox', '0 0 100 100');
    this.polys = Array.from({ length: N }, () => {
      const p = document.createElementNS(NS, 'polygon');
      svg.appendChild(p);
      return p;
    });
    this.state = this.scatterState(true);
    this.shape = null;
    this.anim = 0;
    this.draw();
  }

  clone(tris) { return tris.map((t) => ({ p: t.p.map((q) => [q[0], q[1]]), rgb: t.rgb.slice(), o: t.o ?? 1 })); }

  // Tiny invisible triangles strewn around (and beyond) the frame.
  scatterState(hidden = true) {
    return Array.from({ length: this.N }, () => {
      const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 70;
      const cx = 50 + Math.cos(a) * d, cy = 50 + Math.sin(a) * d, s = 1 + Math.random() * 2;
      return { p: [[cx, cy - s], [cx + s, cy + s], [cx - s, cy + s]], rgb: [200, 200, 210], o: hidden ? 0 : 0.6 };
    });
  }

  // Explode the current picture outward from the centre.
  explodeState(power = 1) {
    return this.state.map((t) => {
      const c = [(t.p[0][0] + t.p[1][0] + t.p[2][0]) / 3, (t.p[0][1] + t.p[1][1] + t.p[2][1]) / 3];
      let dx = c[0] - 50, dy = c[1] - 50;
      const L = Math.hypot(dx, dy) || 1;
      dx /= L; dy /= L;
      const dist = (55 + Math.random() * 90) * power;
      const rot = (Math.random() - 0.5) * 3, sc = 0.35 + Math.random() * 0.5;
      const nc = [c[0] + dx * dist, c[1] + dy * dist];
      return {
        p: t.p.map(([x, y]) => {
          const rx = (x - c[0]) * sc, ry = (y - c[1]) * sc;
          return [nc[0] + rx * Math.cos(rot) - ry * Math.sin(rot), nc[1] + rx * Math.sin(rot) + ry * Math.cos(rot)];
        }),
        rgb: t.rgb.slice(), o: 0,
      };
    });
  }

  draw() {
    for (let i = 0; i < this.N; i++) {
      const t = this.state[i], el = this.polys[i];
      el.setAttribute('points', `${t.p[0][0].toFixed(2)},${t.p[0][1].toFixed(2)} ${t.p[1][0].toFixed(2)},${t.p[1][1].toFixed(2)} ${t.p[2][0].toFixed(2)},${t.p[2][1].toFixed(2)}`);
      el.setAttribute('fill', `rgb(${t.rgb[0] | 0},${t.rgb[1] | 0},${t.rgb[2] | 0})`);
      el.setAttribute('stroke', `rgb(${t.rgb[0] | 0},${t.rgb[1] | 0},${t.rgb[2] | 0})`);
      el.setAttribute('opacity', t.o.toFixed(3));
    }
  }

  set(key) { this.shape = key; this.state = this.clone(this.shapes[key]); this.draw(); }

  /**
   * Animate every triangle from where it is now to `target`.
   * order: 'sweep' (by index), 'center' (outward from middle), 'random'
   */
  animate(target, { duration = 1100, stagger = 550, order = 'sweep', swirl = 8 } = {}) {
    cancelAnimationFrame(this.anim);
    if (reduceMotion) { duration = 200; stagger = 0; swirl = 0; }
    const from = this.clone(this.state);
    const to = this.clone(target);
    const N = this.N;
    const delays = from.map((t, i) => {
      if (order === 'random') return Math.random() * stagger;
      if (order === 'center') {
        const c = to[i].p[0];
        return (Math.hypot(c[0] - 50, c[1] - 50) / 70) * stagger + Math.random() * 60;
      }
      return (i / N) * stagger + Math.random() * 80;
    });
    const bend = from.map(() => (Math.random() - 0.5) * swirl);
    return new Promise((resolve) => {
      const start = performance.now();
      const frame = (now) => {
        let done = true;
        for (let i = 0; i < N; i++) {
          let k = (now - start - delays[i]) / duration;
          if (k < 1) done = false;
          k = ease(Math.max(0, Math.min(1, k)));
          const f = from[i], t = to[i], s = this.state[i];
          // a gentle curved flight path (perpendicular offset that peaks mid-way)
          const arc = Math.sin(Math.PI * k) * bend[i];
          for (let v = 0; v < 3; v++) {
            s.p[v][0] = f.p[v][0] + (t.p[v][0] - f.p[v][0]) * k + arc;
            s.p[v][1] = f.p[v][1] + (t.p[v][1] - f.p[v][1]) * k - arc * 0.6;
          }
          for (let c = 0; c < 3; c++) s.rgb[c] = f.rgb[c] + (t.rgb[c] - f.rgb[c]) * k;
          s.o = f.o + (t.o - f.o) * k;
        }
        this.draw();
        if (done) resolve(); else this.anim = requestAnimationFrame(frame);
      };
      this.anim = requestAnimationFrame(frame);
    });
  }

  morphTo(key, opts) {
    this.shape = key;
    return this.animate(this.shapes[key].map((t) => ({ ...t, o: 1 })), opts);
  }

  // Fly in from scattered fragments.
  gather(key, opts = {}) {
    this.state = this.scatterState(true);
    this.draw();
    return this.morphTo(key, { order: 'random', stagger: 500, duration: 1000, swirl: 14, ...opts });
  }

  explode(opts = {}) {
    this.shape = null;
    return this.animate(this.explodeState(opts.power ?? 1), { order: 'center', stagger: 350, duration: 1000, swirl: 10, ...opts });
  }
}
