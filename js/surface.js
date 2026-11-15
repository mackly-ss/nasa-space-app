// Free-roam 3D surface map of the Moon or Mars with relic pins.
import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { createNoise2D, fbm, ridged, smoothstep, mulberry32 } from './noise.js';
import { radialTexture, starField, planetTexture, tween } from './util.js';
import { forWorld, formatCoord } from './data.js';

const SIZE = 1500;          // terrain width in world units
const SEG = 340;            // terrain resolution
const MAP_W = 780, MAP_H = 560; // area the relic pins are spread over

const CONFIG = {
  moon: {
    seed: 42,
    bounds: { lonMin: -52, lonMax: 40, latMin: -16, latMax: 32 },
    fog: { color: 0x000000, near: 650, far: 1350 },
    light: { color: 0xfff6ea, intensity: 2.1, dir: [-0.9, 0.5, 0.35] },
    hemi: [0x8a96b0, 0x1a1a1e, 0.55],
    pin: '#ffd18a',
    palette: [[0.22, 0.22, 0.23], [0.36, 0.36, 0.37], [0.52, 0.51, 0.50], [0.68, 0.67, 0.65], [0.82, 0.81, 0.79]],
    // Natural features, as [lon, lat, radiusUnits, depth]
    craters: [[-20.1, 9.6, 70, 26], [-44.4, -4.5, 48, 10], [17.4, 3.6, 30, 12], [-1.5, -9.3, 40, 16], [-27, 26, 32, 12], [24, 18, 26, 10], [5, 14, 22, 9]],
    landmarks: [[-20.1, 9.6, 'Copernicus crater'], [-44.4, -4.5, 'Flamsteed'], [3.6, 26.1, 'Apennine Mountains'], [-17, 20, 'Sea of Islands'], [24, 6, 'Sea of Tranquility']],
  },
  mars: {
    seed: 77,
    bounds: { lonMin: -150, lonMax: 190, latMin: -26, latMax: 76 },
    fog: { color: 0xd7a987, density: 0.00135 },
    light: { color: 0xffe2c2, intensity: 2.1, dir: [0.6, 0.55, -0.4] },
    hemi: [0xe8c3a0, 0x5a3424, 0.75],
    pin: '#ffc27a',
    palette: [[0.33, 0.19, 0.13], [0.52, 0.28, 0.17], [0.70, 0.40, 0.24], [0.80, 0.55, 0.36], [0.88, 0.72, 0.56]],
    craters: [[175.4, -14.5, 46, 16], [77.6, 18.4, 30, 12], [137.8, -5.4, 52, 18], [-5.5, -2.2, 18, 7], [60, 40, 40, 14], [-75, 50, 34, 12], [100, 0, 26, 9]],
    landmarks: [[-133.8, 18.6, 'Olympus Mons'], [-70, -10, 'Valles Marineris'], [175.4, -14.5, 'Gusev crater'], [77.6, 18.4, 'Jezero crater'], [-100, 72, 'North polar ice']],
  },
};

export class SurfaceView {
  constructor(world, renderer, pinsEl, { onSelect }) {
    this.world = world;
    this.cfg = CONFIG[world];
    this.renderer = renderer;
    this.pinsEl = pinsEl;
    this.onSelect = onSelect;
    this.relics = forWorld(world);
    this.active = false;
    this.selected = null;
    this.time = 0;

    const noise = (this.noise = createNoise2D(this.cfg.seed));
    this.noise2 = createNoise2D(this.cfg.seed + 1);
    this.rand = mulberry32(this.cfg.seed);

    const scene = (this.scene = new THREE.Scene());
    this.camera = new THREE.PerspectiveCamera(50, 1, 1, 6000);

    // Pin positions in world space
    const b = this.cfg.bounds;
    this.toXZ = (lon, lat) => [
      ((lon - b.lonMin) / (b.lonMax - b.lonMin) - 0.5) * MAP_W,
      -((lat - b.latMin) / (b.latMax - b.latMin) - 0.5) * MAP_H,
    ];
    this.toLonLat = (x, z) => [
      (x / MAP_W + 0.5) * (b.lonMax - b.lonMin) + b.lonMin,
      (-z / MAP_H + 0.5) * (b.latMax - b.latMin) + b.latMin,
    ];
    this.sites = this.relics.map((r) => { const [x, z] = this.toXZ(r.lon, r.lat); return { x, z, r }; });

    this.buildFeatures();
    this.buildTerrain();
    this.buildSky();
    this.buildAtmosphere();
    this.buildRelics();
    this.buildPins();

    /* Lights */
    const L = this.cfg.light;
    const sun = new THREE.DirectionalLight(L.color, L.intensity);
    sun.position.set(...L.dir).multiplyScalar(1000);
    scene.add(sun);
    scene.add(new THREE.HemisphereLight(...this.cfg.hemi));

    /* Controls */
    const c = (this.controls = new OrbitControls(this.camera, renderer.domElement));
    c.enableDamping = true;
    c.dampingFactor = 0.07;
    c.screenSpacePanning = false;
    c.minDistance = 18;
    c.maxDistance = 820;
    c.maxPolarAngle = 1.42;
    c.zoomSpeed = 0.9;
    c.panSpeed = 1.2;
    c.enabled = false;
    c.addEventListener('change', () => this.onControlsChange && this.onControlsChange());
    // Keys move across the map too
    c.listenToKeyEvents(window);
    c.keyPanSpeed = 22;

    this.home = { target: new THREE.Vector3(0, 0, 40), dist: 560, polar: 1.0, azim: 0 };
  }

  /* ---------------- Terrain ---------------- */
  buildFeatures() {
    const cfg = this.cfg, r = this.rand;
    this.craters = [];
    for (const [lon, lat, rad, depth] of cfg.craters) {
      const [x, z] = this.toXZ(lon, lat);
      this.craters.push({ x, z, r: rad, d: depth });
    }
    const n = this.world === 'moon' ? 340 : 120;
    for (let i = 0; i < n; i++) {
      const rad = 3 + Math.pow(r(), 3.2) * (this.world === 'moon' ? 34 : 26);
      this.craters.push({ x: (r() - 0.5) * SIZE, z: (r() - 0.5) * SIZE, r: rad, d: rad * (0.28 + r() * 0.12) });
    }
    // Pins sit on flat ground — remove random craters right under them.
    this.craters = this.craters.filter((c, i) => i < cfg.craters.length || !this.sites.some((s) => Math.hypot(s.x - c.x, s.z - c.z) < c.r + 14));

    if (this.world === 'mars') {
      const [ox, oz] = this.toXZ(-133.8, 18.6);
      this.olympus = { x: ox, z: oz };
      this.valles = [this.toXZ(-110, -6), this.toXZ(-38, -13)];
    } else {
      // Hadley Rille: a winding channel near Apollo 15, plus the Apennine arc.
      this.rille = this.toXZ(3.6, 26.1);
      this.apennine = this.toXZ(-2, 20);
    }
  }

  craterH(x, z) {
    let h = 0;
    for (const c of this.craters) {
      const dx = x - c.x, dz = z - c.z;
      const R = c.r * 1.8;
      if (dx > R || dx < -R || dz > R || dz < -R) continue;
      const d = Math.sqrt(dx * dx + dz * dz) / c.r;
      if (d < 1) h += -c.d * (1 - d * d) + c.d * 0.25;
      h += c.d * 0.32 * Math.exp(-((d - 1) * (d - 1)) / 0.045);
      if (d < 0.22 && c.r > 40) h += c.d * 0.5 * (1 - d / 0.22); // central peak
    }
    return h;
  }

  rawHeight(x, z) {
    const n = this.noise, n2 = this.noise2;
    let h;
    if (this.world === 'moon') {
      // Highlands vs maria (smooth dark plains)
      const mare = smoothstep(0.05, 0.35, fbm(n2, x * 0.0016 + 3, z * 0.0016 - 2, 3));
      const hills = fbm(n, x * 0.005, z * 0.005, 5) * 12 + ridged(n, x * 0.0025, z * 0.0025, 3) * 16;
      h = hills * (1 - mare * 0.75) - mare * 8;
      // Apennine mountains: a ridge arc
      const [ax, az] = this.apennine;
      const ad = Math.abs(Math.hypot(x - ax + 120, z - az - 140) - 190);
      h += Math.exp(-(ad * ad) / 1400) * (22 + fbm(n, x * 0.012, z * 0.012, 3) * 10);
      // Hadley Rille
      const [rx, rz] = this.rille;
      const wig = rx + 30 + Math.sin((z - rz) * 0.05) * 14;
      if (z > rz - 120 && z < rz + 80) h -= Math.exp(-((x - wig) ** 2) / 30) * 9;
      h += this.craterH(x, z);
    } else {
      h = fbm(n, x * 0.0035, z * 0.0035, 5) * 26 + ridged(n, x * 0.006 + 10, z * 0.006, 4) * 22;
      // Northern lowlands are smoother and lower
      h -= smoothstep(-80, -260, z) * 10;
      // Olympus Mons
      const od = Math.hypot(x - this.olympus.x, z - this.olympus.z);
      if (od < 170) {
        const cone = Math.pow(1 - od / 170, 1.6) * 150;
        const caldera = od < 20 ? -(1 - (od / 20) ** 2) * 22 : 0;
        h += cone + caldera + (od > 150 ? 0 : 0);
      }
      // Valles Marineris trench
      const [[ax, az], [bx, bz]] = this.valles;
      const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (z - az) * (bz - az)) / ((bx - ax) ** 2 + (bz - az) ** 2)));
      const px = ax + (bx - ax) * t, pz = az + (bz - az) * t;
      const vd = Math.hypot(x - px, z - pz + Math.sin(x * 0.04) * 6);
      const vw = 22 * Math.sin(Math.PI * t) + 6;
      h -= smoothstep(vw + 10, vw * 0.4, vd) * 46 * Math.min(1, Math.sin(Math.PI * t) * 2);
      h += this.craterH(x, z);
    }
    return h;
  }

  height(x, z) {
    let h = this.rawHeight(x, z);
    for (const s of this.sites) {
      const d = Math.hypot(x - s.x, z - s.z);
      if (d < 16) {
        if (s.h0 === undefined) s.h0 = this.rawHeight(s.x, s.z);
        h = THREE.MathUtils.lerp(s.h0, h, smoothstep(5, 16, d));
      }
    }
    return h;
  }

  buildTerrain() {
    const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, this.height(pos.getX(i), pos.getZ(i)));
    geo.computeVertexNormals();

    // Painterly vertex colours: blotchy, quantised palette bands + slope + brush strokes.
    const cols = new Float32Array(pos.count * 3);
    const nrm = geo.attributes.normal;
    const pal = this.cfg.palette.map((c) => new THREE.Color(...c));
    const n = this.noise, n2 = this.noise2;
    const c = new THREE.Color(), tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const slope = 1 - nrm.getY(i);
      const stroke = n(x * 0.004 + z * 0.012, z * 0.002) * 0.5 + n2(x * 0.03, z * 0.009) * 0.25;
      let v;
      if (this.world === 'moon') {
        const mare = smoothstep(0.05, 0.35, fbm(n2, x * 0.0016 + 3, z * 0.0016 - 2, 3));
        v = 0.6 - mare * 0.42 + y * 0.004 + stroke * 0.24 - slope * 0.2;
      } else {
        v = 0.5 + fbm(n2, x * 0.003 + 9, z * 0.003, 3) * 0.55 + y * 0.003 + stroke * 0.25 - slope * 0.45;
      }
      // posterise into palette bands with soft edges (the "painted" look)
      const f = Math.max(0, Math.min(0.999, v)) * (pal.length - 1);
      const k = Math.floor(f), t = smoothstep(0.35, 0.65, f - k);
      c.copy(pal[k]).lerp(pal[Math.min(k + 1, pal.length - 1)], t);
      if (this.world === 'mars') {
        // polar frost toward the north edge, bright dust on peaks
        const frost = smoothstep(-170, -300, z) * (0.6 + n(x * 0.02, z * 0.02) * 0.4);
        c.lerp(tmp.setRGB(0.93, 0.9, 0.88), Math.max(0, frost));
        c.lerp(tmp.setRGB(0.9, 0.78, 0.66), smoothstep(80, 140, y) * 0.6);
      } else {
        // fresh crater ejecta is brighter
        c.lerp(tmp.setRGB(0.86, 0.86, 0.85), smoothstep(0.55, 0.75, n(x * 0.05, z * 0.05)) * 0.15);
      }
      cols.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 });
    this.terrain = new THREE.Mesh(geo, mat);
    this.scene.add(this.terrain);
  }

  /* ---------------- Sky & atmosphere ---------------- */
  buildSky() {
    const scene = this.scene;
    if (this.world === 'moon') {
      scene.background = new THREE.Color(0x000000);
      scene.fog = new THREE.Fog(this.cfg.fog.color, this.cfg.fog.near, this.cfg.fog.far);
      const stars = starField(4000, 3000, 1.1);
      stars.material.fog = false;
      scene.add(stars);
      // Earth hanging in the black sky
      const earth = new THREE.Mesh(
        new THREE.SphereGeometry(90, 48, 24),
        new THREE.MeshStandardMaterial({ map: planetTexture('earth', createNoise2D(5)), roughness: 1, fog: false })
      );
      earth.position.set(-900, 700, -2200);
      scene.add(earth);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture('rgba(120,170,255,0.35)', 'rgba(80,140,255,0)'), fog: false, depthWrite: false, blending: THREE.AdditiveBlending }));
      halo.scale.set(320, 320, 1);
      halo.position.copy(earth.position);
      scene.add(halo);
      this.skyEarth = earth;
    } else {
      scene.fog = new THREE.FogExp2(this.cfg.fog.color, this.cfg.fog.density);
      const sky = new THREE.Mesh(
        new THREE.SphereGeometry(3000, 32, 16),
        new THREE.ShaderMaterial({
          side: THREE.BackSide, depthWrite: false, fog: false,
          uniforms: { top: { value: new THREE.Color(0x9c7a68) }, mid: { value: new THREE.Color(0xd9b391) }, bottom: { value: new THREE.Color(0xe6c3a2) } },
          vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
          fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, smoothstep(0.0, 0.6, h)) : mix(mid, bottom, smoothstep(0.0, -0.2, h)); gl_FragColor = vec4(c, 1.0); }',
        })
      );
      scene.add(sky);
      scene.background = new THREE.Color(0xd9b391);
      // A small, pale Sun
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture('rgba(255,250,235,1)', 'rgba(255,230,200,0)'), fog: false, depthWrite: false }));
      s.position.set(0.6, 0.55, -0.4).multiplyScalar(2600);
      s.scale.set(260, 260, 1);
      scene.add(s);
    }
  }

  buildAtmosphere() {
    // Low drifting haze puffs (dust on Mars; faint grey "earthshine" glow pockets on the Moon are skipped — no air!)
    this.puffs = [];
    if (this.world !== 'mars') return;
    const tex = radialTexture('rgba(255,236,215,0.55)', 'rgba(255,236,215,0)', 128);
    for (let i = 0; i < 70; i++) {
      const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.45 + this.rand() * 0.35 }));
      const x = (this.rand() - 0.5) * SIZE * 0.85, z = (this.rand() - 0.5) * SIZE * 0.85;
      const s = 120 + this.rand() * 220;
      m.scale.set(s, s * 0.35, 1);
      m.position.set(x, this.rawHeight(x, z) + 10 + this.rand() * 20, z);
      m.userData.v = (this.rand() - 0.3) * 4;
      this.scene.add(m);
      this.puffs.push(m);
    }
    // Fine wind-blown dust particles
    const N = 1600, p = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) p.set([(this.rand() - 0.5) * 900, this.rand() * 120, (this.rand() - 0.5) * 900], i * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    this.dust = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xf2d2b2, size: 1.4, transparent: true, opacity: 0.5, depthWrite: false }));
    this.scene.add(this.dust);
  }

  /* ---------------- Relics ---------------- */
  buildRelics() {
    this.beacons = [];
    for (const s of this.sites) {
      const y = this.height(s.x, s.z);
      s.y = y;
      const model = makeModel(s.r.type, this.world);
      model.position.set(s.x, y, s.z);
      model.rotation.y = this.rand() * Math.PI * 2;
      model.scale.setScalar(1.6);
      this.scene.add(model);
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.9, 70, 10, 1, true),
        new THREE.MeshBasicMaterial({ color: this.cfg.pin, transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false })
      );
      beam.position.set(s.x, y + 35, s.z);
      this.scene.add(beam);
      s.beam = beam;
      const ring = new THREE.Mesh(new THREE.RingGeometry(6, 7.2, 40), new THREE.MeshBasicMaterial({ color: this.cfg.pin, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(s.x, y + 0.6, s.z);
      this.scene.add(ring);
      s.ring = ring;
    }
  }

  buildPins() {
    this.pinsEl.innerHTML = '';
    for (const s of this.sites) {
      const el = document.createElement('button');
      el.className = 'pin';
      el.setAttribute('aria-label', `${s.r.name}, ${s.r.place}`);
      el.innerHTML = `
        <span class="pin-meta">
          <span class="pin-coord">${formatCoord(s.r.lat, s.r.lon).replace('  ', '<br>')}</span>
          <span class="pin-name">${s.r.name}</span>
        </span>
        <span class="pin-mark"><svg viewBox="0 0 24 32" aria-hidden="true"><path d="M12 31s10-11.6 10-19A10 10 0 0 0 2 12c0 7.4 10 19 10 19z"/><circle cx="12" cy="12" r="3.6"/></svg></span>`;
      el.addEventListener('click', (e) => { e.stopPropagation(); this.onSelect(s.r.id); });
      this.pinsEl.appendChild(el);
      s.el = el;
    }
    this.labelEls = this.cfg.landmarks.map(([lon, lat, name]) => {
      const el = document.createElement('div');
      el.className = 'landmark';
      el.textContent = name;
      this.pinsEl.appendChild(el);
      const [x, z] = this.toXZ(lon, lat);
      return { el, x, z, y: this.rawHeight(x, z) + 8 };
    });
  }

  markDiscovered(found) {
    for (const s of this.sites) s.el.classList.toggle('found', found.has(s.r.id));
  }

  /* ---------------- Camera ---------------- */
  setOrbit(target, dist, polar, azim) {
    const sph = new THREE.Spherical(dist, polar, azim);
    this.camera.position.copy(target).add(new THREE.Vector3().setFromSpherical(sph));
    this.controls.target.copy(target);
    this.camera.lookAt(target);
  }

  currentOrbit() {
    const off = this.camera.position.clone().sub(this.controls.target);
    const s = new THREE.Spherical().setFromVector3(off);
    return { target: this.controls.target.clone(), dist: s.radius, polar: s.phi, azim: s.theta };
  }

  async animateOrbit(to, duration = 1600) {
    const from = this.currentOrbit();
    this.controls.enabled = false;
    let dAz = to.azim - from.azim;
    dAz = Math.atan2(Math.sin(dAz), Math.cos(dAz));
    await tween(duration, (k) => {
      const t = from.target.clone().lerp(to.target, k);
      // arc up a little mid-flight for a cinematic hop
      const lift = Math.sin(Math.PI * k) * Math.min(220, from.target.distanceTo(to.target) * 0.35);
      this.setOrbit(t, THREE.MathUtils.lerp(from.dist, to.dist, k) + lift, THREE.MathUtils.lerp(from.polar, to.polar, k), from.azim + dAz * k);
      this.onControlsChange && this.onControlsChange();
    });
    this.controls.enabled = true;
  }

  // Arrival animation: drop from orbit to the overview.
  async enter() {
    const h = this.home;
    this.setOrbit(h.target, 2600, 0.12, h.azim + 0.6);
    await this.animateOrbit(h, 2600);
  }

  flyToRelic(id, duration = 1700) {
    const s = this.sites.find((x) => x.r.id === id);
    if (!s) return Promise.resolve();
    this.selected = id;
    const cur = this.currentOrbit();
    return this.animateOrbit({ target: new THREE.Vector3(s.x, s.y + 4, s.z), dist: 70, polar: 1.12, azim: cur.azim }, duration);
  }

  overview() {
    this.selected = null;
    return this.animateOrbit({ ...this.home, azim: this.currentOrbit().azim });
  }

  // 0 = ground, 1 = high above (drives the altitude slider)
  get altitude() {
    const d = this.camera.position.distanceTo(this.controls.target);
    return Math.log(d / this.controls.minDistance) / Math.log(this.controls.maxDistance / this.controls.minDistance);
  }
  set altitude(a) {
    const o = this.currentOrbit();
    const d = this.controls.minDistance * Math.pow(this.controls.maxDistance / this.controls.minDistance, a);
    this.setOrbit(o.target, d, o.polar, o.azim);
  }

  centerLonLat() {
    const t = this.controls.target;
    return this.toLonLat(t.x, t.z);
  }

  setActive(on) {
    this.active = on;
    this.controls.enabled = on;
    this.pinsEl.hidden = !on;
  }

  resize(w, h) {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  update(dt) {
    this.time += dt;
    if (this.controls.enabled) {
      this.controls.update();
      // keep the map in bounds and the camera above ground
      const t = this.controls.target, lim = SIZE * 0.36;
      const cx = THREE.MathUtils.clamp(t.x, -lim, lim), cz = THREE.MathUtils.clamp(t.z, -lim, lim);
      if (cx !== t.x || cz !== t.z) { const dx = cx - t.x, dz = cz - t.z; t.x = cx; t.z = cz; this.camera.position.x += dx; this.camera.position.z += dz; }
      t.y = THREE.MathUtils.lerp(t.y, this.height(t.x, t.z), 0.1);
    }
    const p = this.camera.position;
    const g = this.height(p.x, p.z) + 6;
    if (p.y < g) p.y = g;

    // animate beacons / haze
    for (const s of this.sites) {
      const sel = s.r.id === this.selected;
      const near = Math.min(1, Math.max(0, (this.camera.position.distanceTo(s.beam.position) - 40) / 260));
      s.beam.material.opacity = ((sel ? 0.35 : 0.18) + Math.sin(this.time * 2 + s.x) * 0.05) * near;
      s.ring.scale.setScalar(1 + ((this.time * 0.6 + s.z * 0.01) % 1) * 0.8);
      s.ring.material.opacity = 0.6 * (1 - ((this.time * 0.6 + s.z * 0.01) % 1));
    }
    for (const m of this.puffs) {
      m.position.x += m.userData.v * dt;
      if (m.position.x > SIZE * 0.45) m.position.x = -SIZE * 0.45;
    }
    if (this.dust) {
      this.dust.position.copy(this.controls.target).setY(this.controls.target.y);
      this.dust.rotation.y += dt * 0.02;
    }
    this.updatePins();
  }

  updatePins() {
    const w = this.renderer.domElement.clientWidth, h = this.renderer.domElement.clientHeight;
    const v = new THREE.Vector3();
    const camPos = this.camera.position;
    for (const s of this.sites) {
      v.set(s.x, s.y + 13, s.z).project(this.camera);
      const on = v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05;
      s.el.style.display = on ? '' : 'none';
      if (!on) continue;
      const dist = camPos.distanceTo(new THREE.Vector3(s.x, s.y, s.z));
      s.el.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px, ${(-v.y * 0.5 + 0.5) * h}px)`;
      s.el.style.zIndex = String(10000 - Math.round(dist));
      s.el.classList.toggle('far', dist > 900);
      s.el.classList.toggle('selected', s.r.id === this.selected);
    }
    for (const l of this.labelEls) {
      v.set(l.x, l.y, l.z).project(this.camera);
      const on = v.z < 1 && Math.abs(v.x) < 1 && Math.abs(v.y) < 1;
      l.el.style.display = on ? '' : 'none';
      if (on) l.el.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px, ${(-v.y * 0.5 + 0.5) * h}px)`;
    }
  }
}

/* ---------------- Simple low-poly relic models ---------------- */
function makeModel(type, world) {
  const g = new THREE.Group();
  const gold = new THREE.MeshStandardMaterial({ color: 0xc9a043, roughness: 0.45, metalness: 0.6 });
  const silver = new THREE.MeshStandardMaterial({ color: 0xcfd3d8, roughness: 0.4, metalness: 0.7 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2b2d33, roughness: 0.8 });
  const panel = new THREE.MeshStandardMaterial({ color: 0x1d2a4a, roughness: 0.3, metalness: 0.5 });
  const dusty = world === 'mars' ? new THREE.MeshStandardMaterial({ color: 0xb98a68, roughness: 0.9 }) : silver;

  if (type === 'lander') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 1.6, 8), gold);
    body.position.y = 2.6; g.add(body);
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 2.2), dusty);
    top.position.y = 3.8; g.add(top);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.4), silver);
      leg.position.set(Math.cos(a) * 2.6, 1.4, Math.sin(a) * 2.6);
      leg.lookAt(Math.cos(a) * 1.4, 3, Math.sin(a) * 1.4); leg.rotateX(Math.PI / 2);
      g.add(leg);
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.15, 10), silver);
      pad.position.set(Math.cos(a) * 3.2, 0.08, Math.sin(a) * 3.2); g.add(pad);
    }
    if (world === 'mars') {
      for (const s of [-1, 1]) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.08, 10), panel);
        p.position.set(s * 4.4, 3.4, 0); g.add(p);
      }
    } else {
      const flag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 4, 0.06), silver);
      flag.position.set(5, 2, 1); g.add(flag);
      const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.1), new THREE.MeshStandardMaterial({ color: 0xe8e3dc, side: THREE.DoubleSide }));
      cloth.position.set(5.9, 3.4, 1); g.add(cloth);
    }
  } else if (type === 'rover') {
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.5, 2.6), world === 'mars' ? panel : silver);
    chassis.position.y = 1.4; g.add(chassis);
    for (const sx of [-1.7, 1.7]) for (const sz of [-1.4, 1.4]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.45, 14), dark);
      w.rotation.x = Math.PI / 2; w.position.set(sx, 0.62, sz); g.add(w);
    }
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2), silver);
    mast.position.set(1.4, 2.6, 0); g.add(mast);
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.1, 0.25, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0xe5e5e5, side: THREE.DoubleSide, metalness: 0.4 }));
    dish.position.set(1.4, 3.8, 0); dish.rotation.z = 0.5; g.add(dish);
    if (world === 'moon') {
      for (const sz of [-0.6, 0.6]) {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.7), dark);
        seat.position.set(-0.3, 2, sz); g.add(seat);
      }
    }
  } else if (type === 'heli') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 1.1), silver);
    body.position.y = 1.4; g.add(body);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8), silver);
    shaft.position.y = 2.6; g.add(shaft);
    for (const y of [2.4, 3.0]) {
      const rotor = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.05, 0.38), dark);
      rotor.position.y = y; rotor.rotation.y = y * 1.3; g.add(rotor);
    }
    const sp = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.8), panel);
    sp.position.y = 3.6; g.add(sp);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6), silver);
      leg.position.set(Math.cos(a) * 0.9, 0.6, Math.sin(a) * 0.9);
      leg.rotation.z = Math.cos(a) * 0.5; leg.rotation.x = -Math.sin(a) * 0.5;
      g.add(leg);
    }
  }
  return g;
}
