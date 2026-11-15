import * as THREE from 'three';
import { SolarView } from './solar.js';
import { SurfaceView } from './surface.js';
import { RELICS, WORLDS, byId, forWorld, formatCoord } from './data.js';
import { Shards } from './shards.js';
import { SHAPE_FOR } from './shapes.js';

const $ = (id) => document.getElementById(id);

/* ---------------- Shards ---------------- */
const introArt = new Shards($('intro-art'));
const cardArt = new Shards($('card-art'));
const curtainArt = new Shards($('curtain-art'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Shatter-in a planet portrait over the scene, run `swap` while covered, then blow it apart.
async function shardTransition(shape, caption, color, swap) {
  const c = $('curtain');
  c.style.setProperty('--curtain', color);
  $('curtain-caption').textContent = caption;
  c.classList.add('on');
  await curtainArt.gather(shape, { duration: 900, stagger: 450 });
  c.classList.add('captioned');
  await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 20)));
  await swap();
  await sleep(250);
  c.classList.remove('captioned');
  c.classList.add('reveal');
  await curtainArt.explode({ power: 1.4, duration: 1100 });
  c.classList.remove('on', 'reveal');
}

/* ---------------- Renderer ---------------- */
const stage = $('stage');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  $('loading').textContent = 'Sorry: this experience needs WebGL, which your browser could not start.';
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
stage.appendChild(renderer.domElement);

/* ---------------- Progress ---------------- */
const STORE = 'anf-found-v1';
const found = new Set((() => { try { return JSON.parse(localStorage.getItem(STORE)) || []; } catch { return []; } })());
const saveFound = () => { try { localStorage.setItem(STORE, JSON.stringify([...found])); } catch { /* private mode */ } };
$('total-count').textContent = RELICS.length;
function updateProgress() {
  $('found-count').textContent = found.size;
  for (const s of Object.values(surfaces)) s.markDiscovered(found);
}
function discover(id) {
  if (found.has(id)) return;
  found.add(id);
  saveFound();
  updateProgress();
  const r = byId(id);
  if (found.size === RELICS.length) toast(`All ${RELICS.length} relics found! You are an official space archaeologist. 🏅`, 6000);
  else toast(`Relic discovered: <b>${r.name}</b> · ${found.size}/${RELICS.length}`);
  $('progress-btn').classList.remove('pulse'); void $('progress-btn').offsetWidth; $('progress-btn').classList.add('pulse');
  renderInventory();
  updateTimeline();
}

let toastTimer;
function toast(html, ms = 3200) {
  const t = $('toast');
  t.innerHTML = html;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

/* ---------------- Views ---------------- */
const solar = new SolarView(renderer, $('labels'), {
  onSelect: (key, body) => {
    if (body.world) location.hash = `#/${body.world}`;
    else if (body.relic) location.hash = `#/system/${body.relic}`;
  },
});
const surfaces = {};
function getSurface(world) {
  if (!surfaces[world]) {
    const s = new SurfaceView(world, renderer, $('pins'), { onSelect: (id) => { location.hash = `#/${world}/${id}`; } });
    s.onControlsChange = () => syncHud();
    s.resize(window.innerWidth, window.innerHeight);
    s.markDiscovered(found);
    surfaces[world] = s;
  }
  return surfaces[world];
}

let view = 'intro';       // intro | system | moon | mars
let active = solar;       // the view being rendered

function setBodyView(v) { view = v; document.body.dataset.view = v; }

function activate(v) {
  solar.setActive(false);
  for (const s of Object.values(surfaces)) s.setActive(false);
  active = v;
  if (v === solar) solar.setActive(true);
  else {
    // pins container is shared: rebuild for this world
    v.buildPins(); v.markDiscovered(found);
    v.setActive(true);
  }
}

function showWorldTitle(world) {
  const w = WORLDS[world];
  $('world-kicker').textContent = `${forWorld(world).length} relics on this map · not to scale`;
  $('world-name').textContent = w.name;
  $('world-blurb').textContent = w.blurb;
  const el = $('world-title');
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
}

function syncHud() {
  if (!(active instanceof SurfaceView)) return;
  $('alt-range').value = Math.round(active.altitude * 1000);
  const [lon, lat] = active.centerLonLat();
  $('readout-center').textContent = `MAP CENTER  ${formatCoord(lat, lon)}`;
}
$('alt-range').addEventListener('input', (e) => {
  if (active instanceof SurfaceView) { active.altitude = e.target.value / 1000; syncHud(); }
});

/* ---------------- Transitions ---------------- */
async function goSystem(from) {
  closeCard();
  if (view === 'intro') {
    await hideIntro();
    setBodyView('system');
    activate(solar);
    solar.controls.autoRotate = false;
    await solar.flyHome(2000);
    return;
  }
  if (view === 'moon' || view === 'mars') {
    const world = view;
    await shardTransition(world, 'Back to the solar system', world === 'mars' ? '#1d0f0a' : '#05060c', async () => {
      setBodyView('system');
      activate(solar);
      solar.snapNear(world);
    });
    await solar.flyTo(world, 3.2, 1300);
    return;
  }
  if (view === 'system' && solar.focus && !from) await solar.flyHome(1200);
}

async function goWorld(world) {
  if (view === world) return getSurface(world);
  if (view === 'intro') { await hideIntro(); setBodyView('system'); activate(solar); solar.controls.autoRotate = false; }
  closeCard();
  if (view === 'system') {
    solar.paused = true;
    await solar.flyTo(world, 0.6, 1400);
    solar.paused = false;
  }
  let s;
  await shardTransition(world, `Landing on ${WORLDS[world].name}`, world === 'mars' ? '#2a140c' : '#05060c', async () => {
    s = getSurface(world);           // builds terrain on first visit (covered by the curtain)
    setBodyView(world);
    activate(s);
    s.setOrbit(s.home.target, 2600, 0.12, 0.6);
  });
  showWorldTitle(world);
  await s.enter();
  syncHud();
  return s;
}

/* ---------------- Router ---------------- */
let busy = false, pending = null;
async function route() {
  if (busy) { pending = location.hash; return; }
  busy = true;
  try {
    const [, a, b] = (location.hash || '#/').replace(/^#\/?/, '#/').split('/');
    closeInventory();
    if (!a) {
      if (view !== 'intro') { setBodyView('intro'); closeCard(); activate(solar); solar.setActive(false); showIntro(); solar.flyHome(1200); }
    } else if (a === 'system') {
      await goSystem(b);
      if (b && byId(b)?.world === 'deep') {
        const r = byId(b);
        await solar.flyTo(r.body, 1.2, 1500);
        openCard(r);
      }
    } else if (a === 'moon' || a === 'mars') {
      const s = await goWorld(a);
      if (b && byId(b)?.world === a) {
        openCard(byId(b));
        await s.flyToRelic(b);
        syncHud();
      } else if (!b && s.selected) {
        closeCard();
        await s.overview();
        syncHud();
      }
    } else {
      location.replace('#/system');
    }
  } finally {
    busy = false;
    if (pending !== null) { const p = pending; pending = null; if (p !== undefined) route(); }
  }
}
window.addEventListener('hashchange', route);

/* ---------------- Intro ---------------- */
function showIntro() {
  const el = $('intro');
  el.hidden = false;
  requestAnimationFrame(() => el.classList.remove('gone'));
  introArt.gather('lander', { duration: 1200, stagger: 900 });
}
async function hideIntro() {
  const el = $('intro');
  if (el.hidden) return;
  el.classList.add('gone');
  await introArt.explode({ power: 1.8, duration: 1000 });
  el.hidden = true;
}
$('begin').addEventListener('click', () => { location.hash = '#/system'; });

/* ---------------- Story card ---------------- */
let cardRelic = null;
function openCard(r) {
  cardRelic = r;
  const worldName = WORLDS[r.world].name;
  $('card-kicker').textContent = `${worldName} · ${r.mission} · ${r.year}`;
  $('card-title').textContent = r.name;
  $('card-place').textContent = r.place;
  $('card-status').textContent = r.status;
  $('card-coord').textContent = r.lat !== undefined ? formatCoord(r.lat, r.lon) : 'Deep space';
  $('card-coord').hidden = false;
  $('card-story').textContent = r.story;
  $('card-left').innerHTML = r.left.map((x) => `<li>${x}</li>`).join('');
  $('card-fact').textContent = r.fact;
  $('card-source').href = r.source;
  const card = $('card');
  const wasOpen = card.classList.contains('open');
  card.hidden = false;
  card.querySelector('.card-scroll').scrollTop = 0;
  requestAnimationFrame(() => card.classList.add('open'));
  const shape = SHAPE_FOR[r.id];
  if (wasOpen && cardArt.shape) cardArt.morphTo(shape, { duration: 1000, stagger: 600 });
  else cardArt.gather(shape, { duration: 1000, stagger: 600 });
  discover(r.id);
  updateTimeline();
}
function closeCard() {
  cardRelic = null;
  const card = $('card');
  card.classList.remove('open');
  setTimeout(() => { if (!card.classList.contains('open')) card.hidden = true; }, 350);
  if (active instanceof SurfaceView) active.selected = null;
  updateTimeline();
}
function stepCard(dir) {
  if (!cardRelic) return;
  const list = forWorld(cardRelic.world);
  const i = list.findIndex((x) => x.id === cardRelic.id);
  const next = list[(i + dir + list.length) % list.length];
  location.hash = next.world === 'deep' ? `#/system/${next.id}` : `#/${next.world}/${next.id}`;
}
$('card-close').addEventListener('click', () => {
  const [, a] = location.hash.replace(/^#\/?/, '#/').split('/');
  location.hash = a === 'moon' || a === 'mars' ? `#/${a}` : '#/system';
});
$('card-prev').addEventListener('click', () => stepCard(-1));
$('card-next').addEventListener('click', () => stepCard(1));

/* ---------------- Inventory ---------------- */
function renderInventory() {
  const q = $('inv-search').value.trim().toLowerCase();
  const html = ['moon', 'mars', 'deep'].map((w) => {
    const items = forWorld(w).filter((r) => !q || [r.name, r.place, r.mission, r.year, ...r.left].join(' ').toLowerCase().includes(q));
    if (!items.length) return '';
    const n = forWorld(w).filter((r) => found.has(r.id)).length;
    return `<section class="inv-group">
      <h4>${WORLDS[w].name} <span>${n}/${forWorld(w).length} found</span></h4>
      ${items.map((r) => `
        <button class="inv-item ${found.has(r.id) ? 'found' : ''}" data-id="${r.id}">
          <span class="inv-check" aria-hidden="true">${found.has(r.id) ? '✓' : ''}</span>
          <span class="inv-text">
            <span class="inv-name">${r.name} <small>${r.year}</small></span>
            <span class="inv-left">${r.left.slice(0, 4).join(' · ')}${r.left.length > 4 ? ' · …' : ''}</span>
          </span>
        </button>`).join('')}
    </section>`;
  }).join('');
  $('inv-list').innerHTML = html || '<p class="inv-empty">Nothing matches that search. Try "rover" or "flag".</p>';
}
function openInventory() {
  renderInventory();
  $('inventory').hidden = false; $('scrim').hidden = false;
  requestAnimationFrame(() => { $('inventory').classList.add('open'); $('scrim').classList.add('on'); });
  setTimeout(() => $('inv-search').focus({ preventScroll: true }), 50);
}
function closeInventory() {
  $('inventory').classList.remove('open'); $('scrim').classList.remove('on');
  setTimeout(() => { if (!$('inventory').classList.contains('open')) { $('inventory').hidden = true; $('scrim').hidden = true; } }, 300);
}
$('inventory-btn').addEventListener('click', openInventory);
$('progress-btn').addEventListener('click', openInventory);
$('inv-close').addEventListener('click', closeInventory);
$('scrim').addEventListener('click', closeInventory);
$('inv-search').addEventListener('input', renderInventory);
$('inv-list').addEventListener('click', (e) => {
  const b = e.target.closest('.inv-item');
  if (!b) return;
  const r = byId(b.dataset.id);
  closeInventory();
  location.hash = r.world === 'deep' ? `#/system/${r.id}` : `#/${r.world}/${r.id}`;
});
$('map-btn').addEventListener('click', () => { location.hash = '#/system'; });

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!$('inventory').hidden) closeInventory();
    else if (cardRelic) $('card-close').click();
  }
});

/* ---------------- Timeline ---------------- */
const timeline = [...RELICS].sort((a, b) => a.year - b.year || a.name.localeCompare(b.name));
function buildTimeline() {
  let lastYear = null;
  $('tl-track').innerHTML = timeline.map((r) => {
    const yr = r.year !== lastYear ? `<span class="tl-year">${r.year}</span>` : '';
    lastYear = r.year;
    return `<button class="tl-item w-${r.world}" data-id="${r.id}" aria-label="${r.name}, ${r.year}">
      ${yr}<span class="tl-dot"></span><span class="tl-tip">${r.name}<small>${WORLDS[r.world].name} · ${r.year}</small></span>
    </button>`;
  }).join('');
}
function updateTimeline() {
  for (const b of $('tl-track').children) {
    b.classList.toggle('found', found.has(b.dataset.id));
    b.classList.toggle('current', cardRelic?.id === b.dataset.id);
  }
}
$('tl-track').addEventListener('click', (e) => {
  const b = e.target.closest('.tl-item');
  if (!b) return;
  const r = byId(b.dataset.id);
  location.hash = r.world === 'deep' ? `#/system/${r.id}` : `#/${r.world}/${r.id}`;
});
buildTimeline();
const tlFloat = Object.assign(document.createElement('div'), { className: 'tl-float' });
document.body.appendChild(tlFloat);
$('tl-track').addEventListener('pointerover', (e) => {
  const b = e.target.closest('.tl-item');
  if (!b) return;
  const r = byId(b.dataset.id), rect = b.getBoundingClientRect();
  tlFloat.innerHTML = `${r.name}<small>${WORLDS[r.world].name} · ${r.year}${found.has(r.id) ? ' · found ✓' : ''}</small>`;
  tlFloat.style.left = rect.left + rect.width / 2 + 'px';
  tlFloat.style.top = rect.top + 'px';
  tlFloat.classList.add('show');
});
$('tl-track').addEventListener('pointerout', () => tlFloat.classList.remove('show'));

/* ---------------- Loop ---------------- */
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h);
  solar.resize(w, h);
  for (const s of Object.values(surfaces)) s.resize(w, h);
}
window.addEventListener('resize', resize);
resize();

// When the story card is open on wide screens, shift the 3D view left so the subject isn't hidden.
let shiftX = 0, shiftY = 0;
function applyViewShift(cam) {
  const wide = window.innerWidth > 820;
  const cw = $('card').offsetWidth, ch = $('card').offsetHeight;
  const wantX = cardRelic && wide ? Math.min(220, (cw + 18) / 2) : 0;
  const wantY = cardRelic && !wide ? ch * 0.42 : 0;
  shiftX += (wantX - shiftX) * 0.08;
  shiftY += (wantY - shiftY) * 0.08;
  const w = window.innerWidth, h = window.innerHeight;
  if (Math.abs(shiftX) < 0.5 && Math.abs(shiftY) < 0.5 && !wantX && !wantY) { if (cam.view?.enabled) cam.clearViewOffset(); return; }
  cam.setViewOffset(w, h, shiftX, shiftY, w, h);
}

const clock = new THREE.Clock();
function loop() {
  const dt = Math.min(clock.getDelta(), 0.05);
  applyViewShift(active.camera);
  if (active === solar) {
    if (view === 'intro') { solar.controls.autoRotate = true; solar.controls.autoRotateSpeed = 0.35; solar.controls.update(); }
    solar.update(dt);
    renderer.render(solar.scene, solar.camera);
  } else {
    active.update(dt);
    renderer.render(active.scene, active.camera);
  }
  requestAnimationFrame(loop);
}

// Start: camera far out, intro on top
solar.camera.position.set(0, 160, 320);
activate(solar);
solar.setActive(false);
updateProgress();
updateTimeline();
loop();
if (!location.hash || location.hash === '#/' || location.hash === '#') introArt.gather('lander', { duration: 1400, stagger: 1100 });
$('loading').textContent = '';
$('begin').disabled = false;
if (location.hash && location.hash !== '#/' && location.hash !== '#') route();
