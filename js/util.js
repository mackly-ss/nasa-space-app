import * as THREE from 'three';

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Promise-based tween driven by rAF. onUpdate receives eased progress 0..1.
export function tween(duration, onUpdate, ease = easeInOut) {
  const d = reduceMotion ? Math.min(duration, 250) : duration;
  return new Promise((resolve) => {
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / d);
      onUpdate(ease(t), t);
      if (t < 1) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  });
}

// Soft radial sprite texture (glows, mist puffs).
export function radialTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)', size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, inner);
  grd.addColorStop(1, outer);
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Background star field as a Points cloud on a sphere shell.
export function starField(count = 4000, radius = 800, sizeScale = 1) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2;
    const r = radius * (0.85 + Math.random() * 0.15);
    const s = Math.sqrt(1 - u * u);
    pos.set([r * s * Math.cos(th), r * u, r * s * Math.sin(th)], i * 3);
    const tint = Math.random();
    c.setHSL(tint < 0.15 ? 0.6 : tint < 0.25 ? 0.08 : 0, tint < 0.25 ? 0.6 : 0, 0.65 + Math.random() * 0.35);
    col.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size: 1.6 * sizeScale, sizeAttenuation: false, vertexColors: true,
    transparent: true, opacity: 0.9, depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}

// Paint a simple procedural planet texture on a canvas.
export function planetTexture(kind, noise) {
  const W = 512, H = 256;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const img = g.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // sample noise on a cylinder so the seam wraps
      const a = (x / W) * Math.PI * 2;
      const nx = Math.cos(a) * 1.6, nz = Math.sin(a) * 1.6, ny = (y / H) * 3.2;
      const n = (noise(nx + ny * 0.3, nz + ny) + 0.5 * noise(nx * 3 + 7, nz * 3 + ny * 3)) / 1.5;
      const lat = Math.abs(y / H - 0.5) * 2;
      let r, gg, b;
      if (kind === 'earth') {
        const land = n > 0.08;
        if (lat > 0.86) { r = 235; gg = 240; b = 245; }
        else if (land) { const k = n * 120; r = 70 + k; gg = 120 + k * 0.6; b = 60; if (lat < 0.35 && n > 0.3) { r = 190; gg = 160; b = 100; } }
        else { r = 20; gg = 70 + n * 60; b = 150 + n * 60; }
        const cl = noise(nx * 2.5 + 40, nz * 2.5 + ny * 2.2);
        if (cl > 0.35) { const k = Math.min(1, (cl - 0.35) * 3); r += (255 - r) * k; gg += (255 - gg) * k; b += (255 - b) * k; }
      } else if (kind === 'mars') {
        const k = n * 50;
        r = 190 + k; gg = 95 + k * 0.6; b = 60 + k * 0.3;
        if (lat > 0.9) { r = 240; gg = 230; b = 225; }
      } else if (kind === 'moon') {
        const k = n * 60;
        const mare = noise(nx * 0.8 + 3, nz * 0.8 + ny * 0.7) > 0.2;
        const base = mare ? 105 : 170;
        r = gg = b = base + k;
      } else { // rocky (ceres / eros)
        const k = n * 40;
        r = 120 + k; gg = 115 + k; b = 108 + k;
      }
      const i = (y * W + x) * 4;
      img.data[i] = r; img.data[i + 1] = gg; img.data[i + 2] = b; img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  if (kind === 'moon' || kind === 'rocky') {
    // craters
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * W, y = 20 + Math.random() * (H - 40), r = 2 + Math.pow(Math.random(), 3) * 18;
      g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 1; g.beginPath(); g.arc(x - 0.6, y - 0.6, r, 0, 7); g.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
