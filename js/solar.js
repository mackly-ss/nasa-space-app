// The solar-system overview: Sun, Earth + Moon, Mars, Eros, Ceres, Kepler and the Pioneers.
import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { createNoise2D } from './noise.js';
import { planetTexture, radialTexture, starField, tween } from './util.js';
import { forWorld } from './data.js';

export class SolarView {
  constructor(renderer, labelsEl, { onSelect }) {
    this.renderer = renderer;
    this.labelsEl = labelsEl;
    this.onSelect = onSelect;
    this.active = false;
    this.paused = false;
    this.time = 0;
    this.focus = null;     // body key the camera is tracking
    this.hovered = null;

    const scene = (this.scene = new THREE.Scene());
    scene.background = new THREE.Color('#02030a');
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 3000);
    this.homePos = new THREE.Vector3(0, 66, 112);
    this.camera.position.copy(this.homePos);

    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 320;
    this.controls.enablePan = false;
    this.controls.enabled = false;

    scene.add(starField(5000, 900));
    scene.add(new THREE.AmbientLight(0x404a66, 0.6));
    const sunLight = new THREE.PointLight(0xfff1d6, 3.2, 0, 0);
    scene.add(sunLight);

    const noise = createNoise2D(7);
    this.bodies = {};
    this.hit = [];

    /* Sun */
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(7, 64, 32),
      new THREE.MeshBasicMaterial({ map: this.sunTexture(noise) })
    );
    scene.add(sun);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: radialTexture('rgba(255,200,120,0.9)', 'rgba(255,120,40,0)'),
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glow.scale.set(46, 46, 1);
    scene.add(glow);
    this.sun = sun;
    this.bodies.sun = { obj: sun, label: 'Sun', info: 'Our star' };

    /* Orbits */
    const orbitLine = (rx, rz = rx, color = 0x6c7aa8, opacity = 0.35, tilt = 0) => {
      const pts = [];
      for (let i = 0; i <= 256; i++) { const a = (i / 256) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * rx, 0, Math.sin(a) * rz)); }
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
      line.rotation.z = tilt;
      scene.add(line);
      return line;
    };

    /* Earth + Moon */
    this.orbits = {
      earth: { r: 34, speed: 0.05, phase: 0.6 },
      mars: { r: 54, speed: 0.027, phase: 2.4 },
      ceres: { r: 82, speed: 0.012, phase: 4.1 },
      eros: { rx: 48, rz: 40, cx: 4, speed: 0.04, phase: 5.2, tilt: 0.18 },
    };
    orbitLine(34);
    orbitLine(54, 54, 0xc0704a, 0.4);
    orbitLine(82, 82, 0x8a8a8a, 0.25);
    const erosOrbit = orbitLine(48, 40, 0xb09a7a, 0.3, 0.18);
    erosOrbit.position.x = 4;

    const earth = this.planet(2.1, planetTexture('earth', noise));
    earth.add(new THREE.Mesh(new THREE.SphereGeometry(2.25, 48, 24), new THREE.MeshBasicMaterial({ color: 0x66aaff, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending })));
    this.bodies.earth = { obj: earth, label: 'Earth', info: 'Home', hitR: 3 };

    const moon = this.planet(0.7, planetTexture('moon', createNoise2D(3)));
    this.bodies.moon = { obj: moon, label: 'Moon', info: `${forWorld('moon').length} relics · land`, hitR: 2.2, clickable: true, world: 'moon' };
    this.moonOrbit = new THREE.Group();
    scene.add(this.moonOrbit);

    /* Mars */
    const mars = this.planet(1.5, planetTexture('mars', createNoise2D(11)));
    this.bodies.mars = { obj: mars, label: 'Mars', info: `${forWorld('mars').length} relics · land`, hitR: 3, clickable: true, world: 'mars' };

    /* Ceres + Dawn */
    const ceres = this.planet(0.95, planetTexture('rocky', createNoise2D(21)));
    this.bodies.ceres = { obj: ceres, label: 'Ceres', info: 'Dawn is orbiting here', hitR: 2.4, clickable: true, relic: 'dawn' };
    this.dawn = this.probeMarker(0x9fd3ff, 0.9);
    scene.add(this.dawn);

    /* Eros (lumpy) + NEAR */
    const erosGeo = new THREE.IcosahedronGeometry(0.55, 3);
    const p = erosGeo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      v.x *= 2.1; v.multiplyScalar(1 + noise(v.x * 2, v.y * 2 + v.z) * 0.18);
      v.y -= Math.cos(v.x * 1.4) * 0.15;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    erosGeo.computeVertexNormals();
    const eros = new THREE.Mesh(erosGeo, new THREE.MeshStandardMaterial({ color: 0xa08e74, roughness: 1, flatShading: true }));
    scene.add(eros);
    this.bodies.eros = { obj: eros, label: 'Eros', info: 'NEAR Shoemaker rests here', hitR: 2.2, clickable: true, relic: 'near' };

    /* Asteroid belt */
    const belt = new Float32Array(2200 * 3);
    for (let i = 0; i < 2200; i++) {
      const a = Math.random() * Math.PI * 2, r = 72 + Math.random() * 20 + (Math.random() - 0.5) * 4;
      belt.set([Math.cos(a) * r, (Math.random() - 0.5) * 2.5, Math.sin(a) * r], i * 3);
    }
    const beltGeo = new THREE.BufferGeometry();
    beltGeo.setAttribute('position', new THREE.BufferAttribute(belt, 3));
    this.belt = new THREE.Points(beltGeo, new THREE.PointsMaterial({ color: 0x8c8478, size: 1.4, sizeAttenuation: false, transparent: true, opacity: 0.7, depthWrite: false }));
    scene.add(this.belt);

    /* Kepler: trails Earth on its orbit */
    this.kepler = this.probeMarker(0xffe08a, 1.3);
    scene.add(this.kepler);
    this.bodies.kepler = { obj: this.kepler, label: 'Kepler', info: 'Trailing Earth', hitR: 2.4, clickable: true, relic: 'kepler' };

    /* Pioneers: drifting outward along dashed paths */
    const pioneer = (key, dir, label, info) => {
      const d = dir.clone().normalize();
      const from = d.clone().multiplyScalar(20), to = d.clone().multiplyScalar(150);
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([from, to]),
        new THREE.LineDashedMaterial({ color: 0xffd38a, dashSize: 2, gapSize: 2.5, transparent: true, opacity: 0.45 }));
      line.computeLineDistances();
      scene.add(line);
      const m = this.probeMarker(0xffd38a, 1.6);
      m.position.copy(d.clone().multiplyScalar(140));
      scene.add(m);
      this.bodies[key] = { obj: m, label, info, hitR: 4, clickable: true, relic: key === 'pioneer10' ? 'pioneer-10' : 'pioneer-11', dir: d };
    };
    pioneer('pioneer10', new THREE.Vector3(-1, 0.12, -0.55), 'Pioneer 10', 'Drifting toward Aldebaran');
    pioneer('pioneer11', new THREE.Vector3(0.85, -0.08, 0.75), 'Pioneer 11', 'Drifting toward Aquila');

    /* Hit spheres + labels */
    for (const [key, b] of Object.entries(this.bodies)) {
      if (b.clickable) {
        const h = new THREE.Mesh(new THREE.SphereGeometry(b.hitR, 12, 8), new THREE.MeshBasicMaterial({ visible: false }));
        h.userData.key = key;
        b.obj.add(h);
        this.hit.push(h);
      }
      const el = document.createElement('button');
      el.className = 'body-label' + (b.clickable ? ' clickable' : '') + (b.world ? ' world' : '') + (key === 'moon' || key === 'kepler' ? ' below' : '');
      el.innerHTML = `<span class="dot"></span><span class="name">${b.label}</span><span class="info">${b.info}</span>`;
      el.tabIndex = b.clickable ? 0 : -1;
      if (b.clickable) el.addEventListener('click', () => this.onSelect(key, b));
      else el.setAttribute('aria-hidden', 'true');
      el.addEventListener('pointerenter', () => this.setHover(key));
      el.addEventListener('pointerleave', () => this.setHover(null));
      labelsEl.appendChild(el);
      b.el = el;
    }

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.downAt = null;
    const dom = renderer.domElement;
    dom.addEventListener('pointermove', (e) => this.onPointerMove(e));
    dom.addEventListener('pointerdown', (e) => { this.downAt = [e.clientX, e.clientY]; });
    dom.addEventListener('pointerup', (e) => this.onPointerUp(e));

    this.place(0);
  }

  planet(radius, map) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 24), new THREE.MeshStandardMaterial({ map, roughness: 1, metalness: 0 }));
    this.scene.add(m);
    return m;
  }

  probeMarker(color, scale) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: radialTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)'),
      color, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    s.scale.set(scale, scale, 1);
    return s;
  }

  sunTexture(noise) {
    const W = 256, H = 128, c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d'), img = g.createImageData(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const a = (x / W) * Math.PI * 2;
      const n = noise(Math.cos(a) * 4, Math.sin(a) * 4 + y / 12) * 0.5 + noise(Math.cos(a) * 9, y / 5) * 0.5;
      const i = (y * W + x) * 4;
      img.data[i] = 255; img.data[i + 1] = 170 + n * 60; img.data[i + 2] = 60 + n * 50; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  // Position every body for the given time.
  place(t) {
    const { earth, mars, ceres, eros } = this.orbits;
    const ea = earth.phase + t * earth.speed;
    this.bodies.earth.obj.position.set(Math.cos(ea) * earth.r, 0, Math.sin(ea) * earth.r);
    this.bodies.earth.obj.rotation.y = t * 0.8;
    const ma = ea * 0 + t * 0.35;
    this.bodies.moon.obj.position.copy(this.bodies.earth.obj.position).add(new THREE.Vector3(Math.cos(ma) * 4.6, Math.sin(ma) * 0.5, Math.sin(ma) * 4.6));
    const ka = ea - 0.32 - t * 0.002; // Kepler slowly falls behind Earth
    this.kepler.position.set(Math.cos(ka) * earth.r, 0, Math.sin(ka) * earth.r);
    const mra = mars.phase + t * mars.speed;
    this.bodies.mars.obj.position.set(Math.cos(mra) * mars.r, 0, Math.sin(mra) * mars.r);
    this.bodies.mars.obj.rotation.y = t * 0.7;
    const ca = ceres.phase + t * ceres.speed;
    this.bodies.ceres.obj.position.set(Math.cos(ca) * ceres.r, 0, Math.sin(ca) * ceres.r);
    const da = t * 1.4;
    this.dawn.position.copy(this.bodies.ceres.obj.position).add(new THREE.Vector3(Math.cos(da) * 1.8, Math.sin(da) * 0.6, Math.sin(da) * 1.8));
    const era = eros.phase + t * eros.speed;
    const ep = new THREE.Vector3(Math.cos(era) * eros.rx + eros.cx, 0, Math.sin(era) * eros.rz);
    ep.applyAxisAngle(new THREE.Vector3(0, 0, 1), eros.tilt);
    this.bodies.eros.obj.position.copy(ep);
    this.bodies.eros.obj.rotation.set(t * 0.4, t * 1.3, 0);
    this.sun.rotation.y = t * 0.05;
    this.belt.rotation.y = t * 0.004;
    for (const k of ['pioneer10', 'pioneer11']) {
      const b = this.bodies[k];
      const dist = 138 + ((t * 0.6) % 14);
      b.obj.position.copy(b.dir).multiplyScalar(dist);
    }
  }

  setHover(key) {
    if (this.hovered === key) return;
    if (this.hovered && this.bodies[this.hovered]) this.bodies[this.hovered].el.classList.remove('hover');
    this.hovered = key;
    if (key && this.bodies[key]) this.bodies[key].el.classList.add('hover');
    this.renderer.domElement.style.cursor = key && this.bodies[key]?.clickable ? 'pointer' : '';
  }

  pickAt(e) {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.hit, false);
    return hits.length ? hits[0].object.userData.key : null;
  }

  onPointerMove(e) {
    if (!this.active || !this.controls.enabled) return;
    this.setHover(this.pickAt(e));
  }

  onPointerUp(e) {
    if (!this.active || !this.controls.enabled || !this.downAt) return;
    const moved = Math.hypot(e.clientX - this.downAt[0], e.clientY - this.downAt[1]);
    this.downAt = null;
    if (moved > 6) return; // was a drag
    const key = this.pickAt(e);
    if (key) this.onSelect(key, this.bodies[key]);
  }

  // Fly the camera toward a body. `closeness` scales the final distance.
  async flyTo(key, closeness = 1, duration = 1600) {
    const b = this.bodies[key];
    this.controls.enabled = false;
    this.focus = null;
    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const dist = Math.max(3, b.hitR * 2.4) * closeness;
    await tween(duration, (k) => {
      const target = b.obj.position;
      // approach from the sunlit side, blended with where we came from
      const away = startPos.clone().sub(target).normalize().add(target.clone().normalize().negate().multiplyScalar(1.4)).normalize();
      away.y = Math.max(away.y, 0.25); away.normalize();
      const end = target.clone().add(away.multiplyScalar(dist));
      this.camera.position.lerpVectors(startPos, end, k);
      this.controls.target.lerpVectors(startTarget, target, k);
      this.camera.lookAt(this.controls.target);
    });
    this.focus = key;
    this.controls.enabled = true;
  }

  async flyHome(duration = 1400) {
    this.controls.enabled = false;
    this.focus = null;
    const sp = this.camera.position.clone(), st = this.controls.target.clone();
    await tween(duration, (k) => {
      this.camera.position.lerpVectors(sp, this.homePos, k);
      this.controls.target.lerpVectors(st, new THREE.Vector3(), k);
      this.camera.lookAt(this.controls.target);
    });
    this.controls.enabled = true;
  }

  // Place the camera right next to a body (used when returning from a surface).
  snapNear(key) {
    const b = this.bodies[key];
    // sit on the sunlit side so we see the day side of the world we just left
    const away = b.obj.position.clone().normalize().negate().add(new THREE.Vector3(0, 0.35, 0)).normalize();
    this.camera.position.copy(b.obj.position).add(away.multiplyScalar(4));
    this.controls.target.copy(b.obj.position);
    this.focus = key;
  }

  setActive(on) {
    this.active = on;
    this.controls.enabled = on;
    this.labelsEl.hidden = !on;
    if (!on) this.setHover(null);
  }

  resize(w, h) {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  update(dt) {
    if (!this.paused) this.time += dt;
    const prevFocus = this.focus ? this.bodies[this.focus].obj.position.clone() : null;
    this.place(this.time);
    if (this.focus && prevFocus) {
      // keep the camera riding along with the focused body
      const delta = this.bodies[this.focus].obj.position.clone().sub(prevFocus);
      this.camera.position.add(delta);
      this.controls.target.add(delta);
    }
    if (this.controls.enabled) this.controls.update();
    this.updateLabels();
  }

  updateLabels() {
    const w = this.renderer.domElement.clientWidth, h = this.renderer.domElement.clientHeight;
    const v = new THREE.Vector3();
    const camDist = this.camera.position.length();
    for (const [key, b] of Object.entries(this.bodies)) {
      v.copy(b.obj.position).project(this.camera);
      const visible = v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
      b.el.style.display = visible ? '' : 'none';
      if (!visible) continue;
      const x = (v.x * 0.5 + 0.5) * w, y = (-v.y * 0.5 + 0.5) * h;
      b.el.style.transform = `translate(${x}px, ${y}px)`;
      // Hide minor labels when zoomed far out and the body isn't a world
      const minor = !b.world && key !== 'sun' && key !== 'earth';
      b.el.classList.toggle('compact', minor && camDist > 260 && this.hovered !== key);
    }
  }
}
