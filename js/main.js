import * as THREE from 'three';
import { SolarView } from './solar.js';
import { SurfaceView } from './surface.js';
import { RELICS, WORLDS, PROLOGUE, EPILOGUE, DOCUMENTARY, byId, forWorld, formatCoord, plainPlace } from './data.js';
import { Shards } from './shards.js';
import { SHAPE_FOR, buildShapes } from './shapes.js';
import { PROMPTS, QUESTS, questById } from './learn.js';
import { EXTRAS, MESSAGES, BEATS, RANKS } from './extras.js';
import { startGame, sfx } from './games.js';

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

/* ---------------- Routes: #system, #moon, #mars-ingenuity, #system-dawn ---------------- */
const go = (view, id) => { location.hash = view + (id ? '-' + id : ''); };
const goRelic = (r) => go(r.world === 'deep' ? 'system' : r.world, r.id);
function parseHash() {
  const h = decodeURIComponent(location.hash.slice(1)).replace(/^\//, '').replace(/\//g, '-');
  const i = h.indexOf('-');
  return i < 0 ? [h, ''] : [h.slice(0, i), h.slice(i + 1)];
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
  if (found.size === RELICS.length) toast(`All ${RELICS.length} relics found. You are an official space archaeologist. <a href="#epilogue">Read the epilogue →</a>`, 9000);
  else toast(`Relic discovered: <b>${r.name}</b> · ${found.size}/${RELICS.length}`);
  $('progress-btn').classList.remove('pulse'); void $('progress-btn').offsetWidth; $('progress-btn').classList.add('pulse');
  renderInventory();
  updateTimeline();
  setTimeout(checkProgress, 1800); // after the discovery toast
}

let toastTimer;
function toast(html, ms = 3200) {
  const t = $('toast');
  t.innerHTML = html;
  t.classList.toggle('action', /<a /.test(html));
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

/* ---------------- Views ---------------- */
const solar = new SolarView(renderer, $('labels'), {
  onSelect: (key, body) => {
    if (body.world) go(body.world);
    else if (body.relic) go('system', body.relic);
  },
});
const surfaces = {};
function getSurface(world) {
  if (!surfaces[world]) {
    const s = new SurfaceView(world, renderer, $('pins'), { onSelect: (id) => go(world, id) });
    s.onControlsChange = () => syncHud();
    s.resize(window.innerWidth, window.innerHeight);
    s.markDiscovered(found);
    surfaces[world] = s;
  }
  return surfaces[world];
}

let view = 'intro';       // intro | system | moon | mars
document.body.dataset.view = 'intro';
let active = solar;       // the view being rendered

function setBodyView(v) { view = v; document.body.dataset.view = v; renderTracker(); }

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
  $('world-kicker').textContent = `Chapter ${w.chapter} · ${w.title} · ${forWorld(world).length} relics · simplified map`;
  $('world-name').textContent = w.name;
  $('world-blurb').textContent = w.blurb;
  const el = $('world-title');
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
}

function syncHud() {
  if (!(active instanceof SurfaceView)) return;
  $('alt-range').value = Math.round(active.altitude * 1000);
  const [lon, lat] = active.centerLonLat();
  const near = active.nearestPlace();
  const plain = plainPlace(lat, lon, active.world).split(',')[0];
  $('readout-center').textContent = `Map centre: ${near ? `near ${near}` : plain[0].toLowerCase() + plain.slice(1)}`;
  $('readout-coord').textContent = formatCoord(lat, lon);
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
  if (!tour.on && !seenChapters.has(world)) {
    await showChapter(world, { wait: true });
    if (pending !== null) return null; // user went somewhere else meanwhile
  }
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
    s.placeForEntry();
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
    const [a, b] = parseHash();
    closeInventory();
    closeQuests();
    const h = decodeURIComponent(location.hash.slice(1));
    if (tour.on && h !== tour.expect) pauseTour(true);
    if (a !== 'epilogue') hideEpilogue();
    if (a === 'epilogue') {
      if (tour.on) endTour();
      if (view === 'intro') await goSystem();
      closeCard();
      showEpilogue();
    } else if (!a) {
      if (view !== 'intro') { setBodyView('intro'); closeCard(); activate(solar); solar.setActive(false); showIntro(); solar.flyHome(1200); }
    } else if (a === 'system') {
      await goSystem(b);
      if (b && byId(b)?.world === 'deep') {
        const r = byId(b);
        if (!tour.on && !seenChapters.has('deep')) {
          await showChapter('deep', { wait: true });
          if (pending !== null) return;
        }
        await solar.flyTo(r.body, 1.2, 1500);
        openCard(r);
      }
    } else if (a === 'moon' || a === 'mars') {
      const s = await goWorld(a);
      if (!s) return;
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
      location.replace('#system');
    }
  } finally {
    busy = false;
    if (pending !== null) { const p = pending; pending = null; if (p !== undefined) route(); }
  }
}
// Navigating elsewhere while a chapter card waits for "Continue" dismisses it, so the route isn't stuck.
window.addEventListener('hashchange', () => { if (busy && chapterResolve) hideChapter(); route(); });

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
$('begin').addEventListener('click', () => { go('system'); });
$('watch').addEventListener('click', () => startTour(0));

const COLD_KEY = 'anf-coldopen-v1';
let coldToken = 0;
async function playColdOpen() {
  const tok = ++coldToken;
  const intro = $('intro'), co = $('coldopen'), line = $('co-line');
  intro.classList.add('cold');
  co.hidden = false; co.classList.remove('done');
  const alive = () => tok === coldToken;
  await sleep(700);
  for (const text of PROLOGUE) {
    if (!alive()) return;
    line.innerHTML = text.replace('not forgotten', '<em>not forgotten</em>');
    line.classList.add('on');
    await sleep(1300 + text.split(' ').length * 230);
    if (!alive()) return;
    line.classList.remove('on');
    await sleep(1000);
  }
  if (alive()) endColdOpen();
}
function endColdOpen() {
  coldToken++;
  const co = $('coldopen');
  if (co.classList.contains('done')) return;
  co.classList.add('done');
  $('co-line').classList.remove('on');
  $('intro').classList.remove('cold');
  try { localStorage.setItem(COLD_KEY, '1'); } catch { /* private mode */ }
  introArt.gather('lander', { duration: 1400, stagger: 1100 });
  setTimeout(() => $('watch').focus({ preventScroll: true }), 900);
}
$('co-skip').addEventListener('click', endColdOpen);
$('co-replay').addEventListener('click', playColdOpen);

/* ---------------- Chapter title cards ---------------- */
const CH_KEY = 'anf-chapters-v1';
const seenChapters = new Set((() => { try { return JSON.parse(localStorage.getItem(CH_KEY)) || []; } catch { return []; } })());
let chapterResolve = null;
function showChapter(world, { wait = false } = {}) {
  const w = WORLDS[world], el = $('chapter');
  seenChapters.add(world);
  try { localStorage.setItem(CH_KEY, JSON.stringify([...seenChapters])); } catch { /* private mode */ }
  $('ch-num').textContent = `Chapter ${w.chapter}`;
  $('ch-title').textContent = w.title;
  $('ch-span').textContent = `${w.name} · ${w.span}`;
  $('ch-text').innerHTML = w.narration.map((p, i) => `<p style="transition-delay:${0.5 + i * 0.9}s">${p}</p>`).join('');
  el.className = `chapter ${world}`;
  el.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('open')));
  if (!tour.on) setTimeout(() => $('ch-continue').focus({ preventScroll: true }), 400);
  return wait ? new Promise((r) => { chapterResolve = r; }) : Promise.resolve();
}
function hideChapter() {
  const el = $('chapter');
  if (el.hidden) return;
  el.classList.remove('open');
  setTimeout(() => { if (!el.classList.contains('open')) el.hidden = true; }, 900);
  if (chapterResolve) { const r = chapterResolve; chapterResolve = null; r(); }
}
$('ch-continue').addEventListener('click', hideChapter);

/* ---------------- Epilogue ---------------- */
function showEpilogue() {
  const el = $('epilogue');
  $('ep-title').textContent = EPILOGUE.title;
  $('ep-text').innerHTML = EPILOGUE.paragraphs.map((p, i) => `<p style="transition-delay:${0.3 + i * 0.5}s">${p}</p>`).join('');
  const yrs = new Date().getFullYear() - Math.min(...RELICS.map((r) => r.year));
  const stats = [
    [RELICS.length, 'relics on this map, and hundreds more objects'],
    [yrs, 'years since the first one arrived'],
    [12, 'people have walked on the Moon'],
    [0, 'people have walked on Mars. Yet.'],
  ];
  $('ep-stats').innerHTML = stats.map(([n, t]) => `<div><dt>${n}</dt><dd>${t}</dd></div>`).join('');
  $('ep-closing').innerHTML = `${EPILOGUE.closing[0]}<br><em>${EPILOGUE.closing[1]}</em>`;
  el.hidden = false;
  el.scrollTop = 0;
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('open')));
}
function hideEpilogue() {
  const el = $('epilogue');
  if (el.hidden) return;
  if (!tour.on) stopNarration();
  el.classList.remove('open');
  setTimeout(() => { if (!el.classList.contains('open')) el.hidden = true; }, 900);
}
$('ep-explore').addEventListener('click', () => go('system'));
$('ep-again').addEventListener('click', () => { hideEpilogue(); startTour(0); });

/* ---------------- Documentary mode ---------------- */
// A ~3 minute cut (DOCUMENTARY in data.js). Each scene plays audio/<id>.mp3 if it exists;
// otherwise it runs on a reading timer. The audio clock drives scene length when present.
const TOUR = DOCUMENTARY;
const tour = { on: false, i: 0, token: 0, playing: false, manual: false, expect: null, elapsed: 0, dur: Infinity, ready: false, audio: false, voice: true };
const hashFor = (r) => (r.world === 'deep' ? 'system' : r.world) + '-' + r.id;
const words = (t) => t.split(/\s+/).length;

const narr = new Audio();
narr.preload = 'auto';
narr.addEventListener('loadedmetadata', () => {
  if (narr.dataset.token !== String(tour.token) || !isFinite(narr.duration)) return;
  tour.audio = true;
  tour.dur = narr.duration * 1000 + 1500;
});
function playNarration(id) {
  narr.dataset.token = String(tour.token);
  narr.src = `audio/${id}.mp3`;
  narr.muted = !tour.voice;
  narr.play().catch(() => { /* missing file or blocked autoplay: timer mode */ });
}
function stopNarration() { narr.pause(); narr.removeAttribute('src'); narr.load(); }

async function navigate(h) {
  tour.expect = h;
  if (decodeURIComponent(location.hash.slice(1)) !== h) location.hash = h;
  await sleep(60);
  while (busy || pending !== null) await sleep(80);
}

function tourUI() {
  const el = $('tour'), st = TOUR[tour.i];
  el.classList.toggle('paused', !tour.playing);
  el.classList.toggle('manual', tour.manual);
  $('tour-play').setAttribute('aria-label', tour.playing ? 'Pause' : 'Play');
  const w = st.world ? WORLDS[st.world] : null;
  $('tour-chapter').textContent = w ? `Chapter ${w.chapter} · ${w.title}` : 'Epilogue';
  $('tour-count').textContent = `${tour.i + 1} / ${TOUR.length}`;
}

function setTourText(text, compact = false) {
  const t = $('tour-text');
  $('tour').classList.toggle('compact', compact);
  t.classList.add('fade');
  setTimeout(() => { t.textContent = text; t.classList.remove('fade'); }, 250);
}

async function runStep(i) {
  const tok = ++tour.token;
  tour.i = Math.max(0, Math.min(TOUR.length - 1, i));
  Object.assign(tour, { manual: false, playing: true, elapsed: 0, ready: false, audio: false });
  // Reading pace (~150 wpm) until the recording's real length is known.
  const st = TOUR[tour.i];
  tour.dur = 2500 + words(st.text) * 400;
  tourUI();
  $('tour-bar').style.width = '0%';
  if (st.kind === 'epilogue') {
    endTour();
    location.hash = 'epilogue';
    playNarration(st.id);
    return;
  }
  playNarration(st.id);
  if (st.kind === 'chapter') {
    setTourText(st.text, true);
    showChapter(st.world);
  } else {
    hideChapter();
    setTourText(st.text);
    await navigate(hashFor(byId(st.relic)));
    if (tok !== tour.token) return;
  }
  tour.ready = true;
}

function startTour(i = 0) {
  tour.on = true;
  document.body.classList.add('touring');
  $('tour').hidden = false;
  if (view === 'intro') { endColdOpen(); tour.expect = 'system'; location.hash = 'system'; }
  runStep(i);
}
function endTour() {
  tour.on = false; tour.playing = false; tour.token++;
  stopNarration();
  document.body.classList.remove('touring');
  $('tour').hidden = true;
  hideChapter();
}
function pauseTour(manual = false) {
  tour.playing = false;
  tour.manual = manual;
  narr.pause();
  tourUI();
}
function resumeTour() {
  if (tour.manual) { runStep(tour.i); return; }
  tour.playing = true;
  if (tour.audio && !narr.ended) narr.play().catch(() => {});
  tourUI();
}

// Scene clock: follows the recording while it plays, then real elapsed time for the gap after it.
let lastTick = performance.now();
setInterval(() => {
  const now = performance.now(), dt = now - lastTick;
  lastTick = now;
  if (!tour.on || !tour.playing || !tour.ready) return;
  tour.elapsed = tour.audio && !narr.ended ? narr.currentTime * 1000 : tour.elapsed + dt;
  $('tour-bar').style.width = Math.min(1, tour.elapsed / tour.dur) * 100 + '%';
  if (tour.elapsed >= tour.dur) runStep(tour.i + 1);
}, 100);

$('tour-play').addEventListener('click', () => (tour.playing ? pauseTour() : resumeTour()));
$('tour-next').addEventListener('click', () => runStep(tour.i + 1));
$('tour-prev').addEventListener('click', () => runStep(tour.elapsed > 4000 && !tour.manual ? tour.i : tour.i - 1));
$('tour-exit').addEventListener('click', endTour);
function syncVoiceBtn() {
  const b = $('tour-voice');
  b.setAttribute('aria-pressed', String(tour.voice));
  b.setAttribute('aria-label', tour.voice ? 'Mute narrator' : 'Unmute narrator');
}
syncVoiceBtn();
$('tour-voice').addEventListener('click', () => { tour.voice = !tour.voice; narr.muted = !tour.voice; syncVoiceBtn(); });
$('story-btn').addEventListener('click', () => {
  const w = cardRelic ? cardRelic.world : (view === 'moon' || view === 'mars') ? view : null;
  startTour(w ? Math.max(0, TOUR.findIndex((st) => st.kind === 'chapter' && st.world === w)) : 0);
});

/* ---------------- Story card ---------------- */
let cardRelic = null;
function openCard(r) {
  cardRelic = r;
  const worldName = WORLDS[r.world].name;
  $('card-kicker').textContent = `${worldName} · ${r.mission} · ${r.year}`;
  $('card-title').textContent = r.name;
  $('card-place').textContent = r.place;
  $('card-status').textContent = r.status;
  const onWorld = r.lat !== undefined;
  $('card-where-wrap').hidden = !onWorld;
  $('card-where').textContent = onWorld ? plainPlace(r.lat, r.lon, r.world) : '';
  $('card-coord').textContent = onWorld ? formatCoord(r.lat, r.lon) : '';
  $('card-did').textContent = r.did || '';
  $('card-narration').textContent = r.narration || '';
  const yrs = new Date().getFullYear() - r.year;
  $('card-waiting').textContent = r.world === 'deep' ? `${yrs} years out there` : `Waiting ${yrs} years`;
  $('card-story').textContent = r.story;
  $('card-left').innerHTML = r.left.map((x) => `<li>${x}</li>`).join('');
  $('card-fact').textContent = r.fact;
  $('card-source').href = r.source;
  const card = $('card');
  const wasOpen = card.classList.contains('open');
  card.hidden = false;
  card.querySelector('.card-scroll').scrollTop = 0;
  requestAnimationFrame(() => card.classList.add('open'));
  document.body.classList.add('card-open');
  const shape = SHAPE_FOR[r.id];
  if (wasOpen && cardArt.shape) cardArt.morphTo(shape, { duration: 1000, stagger: 600 });
  else cardArt.gather(shape, { duration: 1000, stagger: 600 });
  discover(r.id);
  $('card-prompt').textContent = PROMPTS[r.id] || '';
  $('card-answer').value = learn.log[r.id] || '';
  $('log-saved').textContent = 'Saved automatically in this browser';
  checkQuest(r);
  fillExtras(r);
  updateTimeline();
}
function closeCard() {
  cardRelic = null;
  const card = $('card');
  card.classList.remove('open');
  document.body.classList.remove('card-open');
  setTimeout(() => { if (!card.classList.contains('open')) card.hidden = true; }, 350);
  if (active instanceof SurfaceView) active.selected = null;
  updateTimeline();
}
function stepCard(dir) {
  if (!cardRelic) return;
  const list = forWorld(cardRelic.world);
  const i = list.findIndex((x) => x.id === cardRelic.id);
  const next = list[(i + dir + list.length) % list.length];
  goRelic(next);
}
$('card-close').addEventListener('click', () => {
  const [a] = parseHash();
  go(a === 'moon' || a === 'mars' ? a : 'system');
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
  setTimeout(() => {
    if (!$('inventory').classList.contains('open')) $('inventory').hidden = true;
    if (!$('inventory').classList.contains('open') && !$('quests').classList.contains('open')) $('scrim').hidden = true;
  }, 300);
}
$('inventory-btn').addEventListener('click', openInventory);
$('progress-btn').addEventListener('click', openInventory);
$('inv-close').addEventListener('click', closeInventory);
$('scrim').addEventListener('click', () => { closeInventory(); closeQuests(); });
$('inv-search').addEventListener('input', renderInventory);
$('inv-list').addEventListener('click', (e) => {
  const b = e.target.closest('.inv-item');
  if (!b) return;
  const r = byId(b.dataset.id);
  closeInventory();
  goRelic(r);
});
$('map-btn').addEventListener('click', () => { go('system'); });

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!$('game-ov').hidden) { closeGame(); return; }
    if (!$('sort-ov').hidden) { closeSort(); return; }
    if (!$('coldopen').classList.contains('done') && view === 'intro') endColdOpen();
    else if (chapterResolve) hideChapter();
    else if (!$('quest-end').hidden) hideQuestEnd();
    else if (!$('quests').hidden) closeQuests();
    else if (!$('inventory').hidden) closeInventory();
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
  goRelic(r);
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

/* ---------------- Quests & mission log ---------------- */
// Free exploration only: hidden and inactive while the documentary plays.
// Progress and answers are kept in this browser (localStorage), nothing is sent anywhere.
const LEARN = 'anf-learn-v1';
const learn = (() => { try { return JSON.parse(localStorage.getItem(LEARN)) || {}; } catch { return {}; } })();
learn.log ||= {};
learn.quests ||= {};
if (learn.active && !questById(learn.active)) learn.active = null;
const saveLearn = () => { try { localStorage.setItem(LEARN, JSON.stringify(learn)); } catch { /* private mode */ } };
const progressOf = (q) => learn.quests[q.id] || { step: 0, done: false };
const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const WORLD_ORDER = ['moon', 'mars', 'deep'];
const chapterHead = (w) => `<h4>Chapter ${WORLDS[w].chapter} · ${WORLDS[w].name}</h4>`;

function renderTracker() {
  const q = learn.active && questById(learn.active);
  document.body.classList.toggle('questing', !!q);
  const el = $('quest-track');
  if (!q) { el.hidden = true; return; }
  const st = progressOf(q), w = WORLDS[q.world], n = q.clues.length;
  el.hidden = false;
  $('qt-label').textContent = `${q.main ? 'Main quest' : 'Side quest'} · ${w.name}`;
  $('qt-title').textContent = q.title;
  $('qt-clue').innerHTML = `<b>Clue ${st.step + 1} of ${n}</b>${q.clues[st.step][0]}`;
  $('qt-dots').innerHTML = q.clues.map((_, i) => `<i class="${i < st.step ? 'on' : i === st.step ? 'now' : ''}"></i>`).join('');
  const here = q.world === 'deep' ? view === 'system' : view === q.world;
  $('qt-go').textContent = here ? 'All quests' : `Go to ${w.name} →`;
  $('qt-go').dataset.go = here ? '' : q.world;
}

function startQuest(id) {
  const q = questById(id);
  if (learn.active === id) { closeQuests(); return; }
  const st = (learn.quests[id] = progressOf(q));
  if (st.done) Object.assign(st, { step: 0, done: false });
  learn.active = id;
  saveLearn();
  closeQuests();
  renderTracker();
  toast(`Quest started: <b>${q.title}</b>`);
  if (cardRelic) checkQuest(cardRelic); // the first answer may already be open
}

function stopQuest() {
  learn.active = null;
  saveLearn();
  renderTracker();
  toast('Quest paused. Pick it up again any time from <b>Quests</b>.');
}

// Called whenever a story card opens: solves the current clue if this is the right relic.
function checkQuest(r) {
  const banner = $('card-quest');
  banner.hidden = true;
  const q = learn.active && questById(learn.active);
  if (!q || tour.on) return;
  const st = (learn.quests[q.id] = progressOf(q));
  if (q.clues[st.step][1] !== r.id) return;
  st.step++;
  banner.innerHTML = `<b>✓ Clue solved</b> · ${q.title} · ${st.step}/${q.clues.length}`;
  banner.hidden = false;
  if (st.step >= q.clues.length) {
    st.done = true;
    setTimeout(checkProgress, 5000);
    learn.active = null;
    saveLearn();
    renderTracker();
    setTimeout(() => showQuestEnd(q), 1600);
  } else {
    saveLearn();
    renderTracker();
    toast('<b>Clue solved ✓</b> Your next clue is ready.');
    const el = $('quest-track');
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  }
}

function showQuestEnd(q) {
  if (tour.on) return;
  $('qe-kicker').textContent = `Quest complete · ${WORLDS[q.world].name}`;
  $('qe-title').textContent = q.title;
  $('qe-text').textContent = q.ending;
  const el = $('quest-end');
  el.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('open')));
  setTimeout(() => $('qe-more').focus({ preventScroll: true }), 400);
}
function hideQuestEnd() {
  const el = $('quest-end');
  el.classList.remove('open');
  setTimeout(() => { if (!el.classList.contains('open')) el.hidden = true; }, 600);
}

/* Quests & log panel */
let qTab = 'quests';
function questsHTML() {
  return `<p class="inv-sub">Solve each clue by finding the right relic and opening its story. Start any quest, any time.</p>` +
    WORLD_ORDER.map((w) => `<section class="inv-group">${chapterHead(w)}${QUESTS.filter((q) => q.world === w).map((q) => {
      const st = progressOf(q), n = q.clues.length, active = learn.active === q.id;
      const status = st.done ? '<span class="q-done">✓ Complete</span>'
        : active ? `<span class="q-prog">In progress · ${st.step}/${n}</span>`
        : `<span class="q-prog">${st.step ? `${st.step}/${n} clues` : `${n} clues`}</span>`;
      const label = active || (st.step && !st.done) ? 'Continue' : st.done ? 'Play again' : 'Start';
      return `<article class="q-item${st.done ? ' done' : ''}${active ? ' active' : ''}">
        <div class="q-top"><span class="q-kind">${q.main ? 'Main quest' : 'Side quest'}</span>${status}</div>
        <h5>${q.title}</h5>
        <p>${q.intro}</p>
        <button class="btn ghost q-start" data-q="${q.id}">${label} <span aria-hidden="true">→</span></button>
      </article>`;
    }).join('')}</section>`).join('');
}
function logHTML() {
  const done = QUESTS.filter((q) => progressOf(q).done).length;
  const stamps = QUESTS.map((q) => {
    const d = progressOf(q).done;
    return `<li class="${d ? 'on' : ''}"><span aria-hidden="true">${d ? '✓' : ''}</span>${q.title}<small>${d ? 'Complete' : 'Not yet'}</small></li>`;
  }).join('');
  return `<p class="inv-sub">Your answers are saved in this browser only. Open a relic's story to write or edit an entry.</p>
    <h4 class="log-h">Quest stamps <span>${done}/${QUESTS.length}</span></h4>
    <ul class="q-stamps">${stamps}</ul>` +
    WORLD_ORDER.map((w) => `<section class="inv-group">${chapterHead(w)}${forWorld(w).map((r) => {
      const a = (learn.log[r.id] || '').trim();
      return `<button class="log-item${a ? ' written' : ''}" data-id="${r.id}">
        <span class="log-name">${r.name}</span>
        <span class="log-q">${PROMPTS[r.id]}</span>
        ${a ? `<span class="log-a">${esc(a)}</span>` : '<span class="log-empty">Not written yet. Open the story to write.</span>'}
      </button>`;
    }).join('')}</section>`).join('');
}
function renderQuests() {
  $('tab-quests').setAttribute('aria-selected', String(qTab === 'quests'));
  $('tab-log').setAttribute('aria-selected', String(qTab === 'log'));
  $('tab-badges').setAttribute('aria-selected', String(qTab === 'badges'));
  $('q-title').textContent = { quests: 'Quests', log: 'Mission Log', badges: 'Badges' }[qTab];
  $('log-count').textContent = `${Object.values(learn.log).filter((t) => t.trim()).length}/${RELICS.length}`;
  $('q-list').innerHTML = qTab === 'quests' ? questsHTML() : qTab === 'log' ? logHTML() : badgesHTML();
  $('q-list').scrollTop = 0;
}
function openQuests(tab = qTab) {
  qTab = tab;
  renderQuests();
  $('quests').hidden = false; $('scrim').hidden = false;
  requestAnimationFrame(() => { $('quests').classList.add('open'); $('scrim').classList.add('on'); });
  setTimeout(() => $('tab-' + qTab).focus({ preventScroll: true }), 50);
}
function closeQuests() {
  const el = $('quests');
  if (el.hidden) return;
  el.classList.remove('open');
  if (!$('inventory').classList.contains('open')) $('scrim').classList.remove('on');
  setTimeout(() => {
    if (!el.classList.contains('open')) el.hidden = true;
    if (!el.classList.contains('open') && !$('inventory').classList.contains('open')) $('scrim').hidden = true;
  }, 300);
}
$('quest-btn').addEventListener('click', () => openQuests());
$('q-close').addEventListener('click', closeQuests);
$('tab-quests').addEventListener('click', () => { qTab = 'quests'; renderQuests(); });
$('tab-log').addEventListener('click', () => { qTab = 'log'; renderQuests(); });
$('tab-badges').addEventListener('click', () => { qTab = 'badges'; renderQuests(); });
$('q-list').addEventListener('click', (e) => {
  const s = e.target.closest('.q-start');
  if (s) { startQuest(s.dataset.q); return; }
  const l = e.target.closest('.log-item');
  if (l) { closeQuests(); goRelic(byId(l.dataset.id)); }
});
$('qt-stop').addEventListener('click', stopQuest);
$('qt-go').addEventListener('click', (e) => {
  const w = e.currentTarget.dataset.go;
  if (w) go(w === 'deep' ? 'system' : w);
  else openQuests('quests');
});
$('qe-more').addEventListener('click', () => { hideQuestEnd(); openQuests('quests'); });
$('qe-close').addEventListener('click', hideQuestEnd);

/* Mission log box on the story card */
let logTimer;
$('card-answer').addEventListener('input', (e) => {
  if (!cardRelic) return;
  learn.log[cardRelic.id] = e.target.value;
  $('log-saved').textContent = 'Saving…';
  clearTimeout(logTimer);
  logTimer = setTimeout(() => { saveLearn(); $('log-saved').textContent = 'Saved ✓'; checkProgress(); }, 400);
});
// Keep typing (arrow keys, etc.) from moving the 3D map.
$('card-answer').addEventListener('keydown', (e) => { if (e.key !== 'Escape') e.stopPropagation(); });
renderTracker();

/* ---------------- Comics, quizzes, mini games, messages, badges ---------------- */
// Free exploration only, like the quests. Saved in this browser.
const XKEY = 'anf-extras-v1';
const xs = (() => { try { return JSON.parse(localStorage.getItem(XKEY)) || {}; } catch { return {}; } })();
for (const k of ['quiz', 'won', 'carry', 'delivered', 'badges']) xs[k] ||= {};
const saveX = () => { try { localStorage.setItem(XKEY, JSON.stringify(xs)); } catch { /* private mode */ } };

/* Static low-poly portrait (same art as the card), used for comic panels */
let shapeCache = null;
function portraitSVG(id, cls = '') {
  shapeCache ||= buildShapes().shapes;
  const tris = shapeCache[SHAPE_FOR[id]] || [];
  return `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true">${tris.map((t) => {
    const c = `rgb(${t.rgb.map((v) => v | 0).join(',')})`;
    return `<polygon points="${t.p.map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' ')}" fill="${c}" stroke="${c}" opacity="${t.o ?? 1}"/>`;
  }).join('')}</svg>`;
}

/* Card tabs */
function selectTab(tab) {
  for (const b of document.querySelectorAll('#card-tabs .ct')) b.setAttribute('aria-selected', String(b.dataset.tab === tab));
  for (const p of document.querySelectorAll('#card .pane')) p.hidden = p.dataset.pane !== tab;
  $('card').querySelector('.card-scroll').scrollTop = Math.min($('card').querySelector('.card-scroll').scrollTop, $('card-tabs').offsetTop - 20);
}
$('card-tabs').addEventListener('click', (e) => { const b = e.target.closest('.ct'); if (b) selectTab(b.dataset.tab); });

function fillExtras(r) {
  const x = EXTRAS[r.id];
  selectTab('story');
  $('ct-game').hidden = !x.game;
  // Comic: four beats, each with a differently lit portrait
  $('card-comic').innerHTML = `<p class="pane-sub">${r.name} in four panels.</p>` + x.panels.map(([narr, voice], i) => `
    <figure class="panel p${i + 1}">
      <div class="panel-art">${portraitSVG(r.id)}<span class="panel-n">${i + 1}</span></div>
      <figcaption><span class="beat">${BEATS[i]}</span><p>${narr}</p><q>${voice}</q></figcaption>
    </figure>`).join('');
  renderQuiz(r);
  renderGamePane(r);
  renderMessage(r);
}

/* Quiz: the first answer counts towards the Quiz Whiz badge */
function renderQuiz(r, picked = null) {
  const q = EXTRAS[r.id].quiz, first = xs.quiz[r.id];
  const answered = picked !== null || first;
  $('card-quiz').innerHTML = `<p class="quiz-q">${q.q}</p>
    <div class="quiz-o">${q.o.map((o, i) => {
      let cls = '';
      if (answered && i === q.a) cls = 'right';
      else if (picked === i) cls = 'wrong';
      return `<button class="qo ${cls}" data-i="${i}" ${answered ? 'disabled' : ''}>${o}</button>`;
    }).join('')}</div>
    ${answered ? `<p class="quiz-why"><b>${picked === null ? (first === 'right' ? '✓ You got this one right.' : 'You\'ve answered this one.') : picked === q.a ? '✓ Correct!' : 'Not quite.'}</b> ${q.why}</p>
      ${picked === null ? '<button class="btn ghost quiz-again">Try it again</button>' : ''}` : ''}`;
}
$('card-quiz').addEventListener('click', (e) => {
  if (!cardRelic) return;
  if (e.target.closest('.quiz-again')) { $('card-quiz').innerHTML = ''; renderQuizFresh(cardRelic); return; }
  const b = e.target.closest('.qo');
  if (!b || b.disabled) return;
  const i = +b.dataset.i, q = EXTRAS[cardRelic.id].quiz;
  if (!xs.quiz[cardRelic.id]) { xs.quiz[cardRelic.id] = i === q.a ? 'right' : 'wrong'; saveX(); checkProgress(); }
  (i === q.a ? sfx.right : sfx.wrong)();
  renderQuiz(cardRelic, i);
});
function renderQuizFresh(r) { const keep = xs.quiz[r.id]; delete xs.quiz[r.id]; renderQuiz(r); xs.quiz[r.id] = keep; }

/* Mini game pane + full-screen overlay */
function renderGamePane(r) {
  const g = EXTRAS[r.id].game;
  if (!g) { $('card-game').innerHTML = ''; return; }
  $('card-game').innerHTML = `<p class="pane-sub">${xs.won[r.id] ? '✓ Completed' : 'Mini game'}</p>
    <h4 class="game-title">${g.title}</h4><p class="game-how">${g.how}</p>
    <button class="btn primary" id="play-btn">${xs.won[r.id] ? 'Play again' : 'Play'} <span aria-hidden="true">→</span></button>`;
}
let gameRelic = null;
function openGame(r) {
  gameRelic = r;
  const g = EXTRAS[r.id].game;
  $('go-kicker').textContent = `Mini game · ${r.name}`;
  $('go-title').textContent = g.title;
  $('go-how').textContent = g.how;
  if (active.controls) active.controls.enabled = false; // keep Space/arrows for the game
  const el = $('game-ov');
  el.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('open')));
  runGame();
}
function runGame() {
  const r = gameRelic, g = EXTRAS[r.id].game;
  // A fresh stage each time, so the old game's loops (which watch stage.isConnected) stop.
  const old = $('go-stage'), stage = old.cloneNode(false);
  stage.className = 'stage';
  old.replaceWith(stage);
  $('go-done').hidden = true;
  const setStatus = (t, ok) => { $('go-status').textContent = t; $('go-status').classList.toggle('ok', !!ok); };
  let finished = false;
  const won = () => {
    if (finished || !stage.isConnected) return;
    finished = true;
    sfx.win();
    setStatus('Complete! Well done.', true);
    $('go-done').hidden = false;
    $('go-done').focus({ preventScroll: true });
    if (!xs.won[r.id]) { xs.won[r.id] = Date.now(); saveX(); checkProgress(); }
    if (cardRelic?.id === r.id) renderGamePane(r);
  };
  setStatus('');
  startGame(stage, r, g, EXTRAS[r.id].parts, won, setStatus);
}
function closeGame() {
  const el = $('game-ov');
  el.classList.remove('open');
  const stage = $('go-stage'), blank = stage.cloneNode(false);
  stage.replaceWith(blank);
  if (active.controls) active.controls.enabled = true;
  setTimeout(() => { if (!el.classList.contains('open')) el.hidden = true; }, 400);
}
$('card-game').addEventListener('click', (e) => { if (e.target.closest('#play-btn') && cardRelic) openGame(cardRelic); });
$('go-reset').addEventListener('click', runGame);
$('go-close').addEventListener('click', closeGame);
$('go-done').addEventListener('click', closeGame);

/* Messages between machines: pick one up at `from`, deliver it by opening `to` */
function renderMessage(r) {
  const box = $('card-msg');
  box.hidden = true;
  if (tour.on) return;
  const name = (id) => byId(id).name;
  const incoming = MESSAGES.find((m) => m.to === r.id && xs.carry[m.from] && !xs.delivered[m.from]);
  if (incoming) {
    xs.delivered[incoming.from] = Date.now();
    delete xs.carry[incoming.from];
    saveX();
    sfx.win();
    box.innerHTML = `<span class="msg-label">✓ Message delivered</span>
      <blockquote><b>${name(incoming.from)} wrote</b>“${incoming.msg}”</blockquote>
      <blockquote><b>${name(incoming.to)} replies</b>“${incoming.reply}”</blockquote>`;
    box.hidden = false;
    setTimeout(() => toast(`<b>Message delivered</b> to ${name(incoming.to)}`), 1200);
    setTimeout(checkProgress, 2400);
    return;
  }
  const out = MESSAGES.find((m) => m.from === r.id);
  const done = MESSAGES.find((m) => (m.from === r.id || m.to === r.id) && xs.delivered[m.from]);
  if (out && !xs.delivered[out.from]) {
    box.innerHTML = xs.carry[out.from]
      ? `<span class="msg-label">Message in your bag</span><p>You're carrying ${name(out.from)}'s message. Open <b>${name(out.to)}</b>'s story to deliver it.</p>`
      : `<span class="msg-label">A message to deliver</span><p>${name(out.from)} has a message for <b>${name(out.to)}</b>.</p><button class="btn ghost" id="msg-take">Carry the message</button>`;
    box.hidden = false;
  } else if (done) {
    box.innerHTML = `<span class="msg-label">Messages</span>
      <blockquote><b>${name(done.from)} wrote</b>“${done.msg}”</blockquote>
      <blockquote><b>${name(done.to)} replied</b>“${done.reply}”</blockquote>`;
    box.hidden = false;
  }
}
$('card-msg').addEventListener('click', (e) => {
  if (!e.target.closest('#msg-take') || !cardRelic) return;
  const m = MESSAGES.find((x) => x.from === cardRelic.id);
  xs.carry[m.from] = Date.now();
  saveX();
  sfx.right();
  toast(`Message picked up. Deliver it to <b>${byId(m.to).name}</b>.`);
  renderMessage(cardRelic);
});

/* Timeline sorting */
let sortSet = [];
function newSortSet() {
  const pool = [...RELICS].sort(() => Math.random() - 0.5), years = new Set();
  sortSet = [];
  for (const r of pool) { if (!years.has(r.year)) { years.add(r.year); sortSet.push(r); } if (sortSet.length === 6) break; }
  if (sortSet.every((r, i) => !i || sortSet[i - 1].year < r.year)) sortSet.reverse();
  renderSort();
  $('sort-status').textContent = '';
  $('sort-status').classList.remove('ok');
}
function renderSort(checked = false) {
  $('sort-row').innerHTML = sortSet.map((r, i) => {
    const ok = checked && (!i || sortSet[i - 1].year <= r.year) && (i === sortSet.length - 1 || r.year <= sortSet[i + 1].year);
    return `<li class="sort-item w-${r.world} ${checked ? (ok ? 'ok' : 'bad') : ''}">
      ${portraitSVG(r.id, 'sort-art')}
      <b>${r.name}</b><small>${WORLDS[r.world].name}${checked ? ` · ${r.year}` : ''}</small>
      <span class="sort-move"><button data-i="${i}" data-d="-1" aria-label="Move ${r.name} earlier" ${i ? '' : 'disabled'}>←</button><button data-i="${i}" data-d="1" aria-label="Move ${r.name} later" ${i < sortSet.length - 1 ? '' : 'disabled'}>→</button></span>
    </li>`;
  }).join('');
}
function openSort() {
  newSortSet();
  const el = $('sort-ov');
  el.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('open')));
}
function closeSort() {
  const el = $('sort-ov');
  el.classList.remove('open');
  setTimeout(() => { if (!el.classList.contains('open')) el.hidden = true; }, 400);
}
$('sort-row').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-d]');
  if (!b) return;
  const i = +b.dataset.i, j = i + +b.dataset.d;
  [sortSet[i], sortSet[j]] = [sortSet[j], sortSet[i]];
  sfx.click();
  renderSort();
  $('sort-row').querySelector(`button[data-i="${j}"][data-d="${b.dataset.d}"]`)?.focus();
});
$('sort-check').addEventListener('click', () => {
  const right = sortSet.every((r, i) => !i || sortSet[i - 1].year <= r.year);
  renderSort(true);
  $('sort-status').textContent = right ? '✓ Perfect order. You\'re a real historian.' : 'Not quite. The years are shown now. Fix the red ones and check again.';
  $('sort-status').classList.toggle('ok', right);
  (right ? sfx.win : sfx.wrong)();
  if (right && !xs.sorted) { xs.sorted = Date.now(); saveX(); checkProgress(); }
});
$('sort-new').addEventListener('click', newSortSet);
$('so-close').addEventListener('click', closeSort);
$('tl-sort').addEventListener('click', openSort);

/* Ranks and badges */
const rankOf = (n) => RANKS.filter((r) => n >= r[0]).pop()[1];
const nextRank = (n) => RANKS.find((r) => r[0] > n);
const allFound = (w) => forWorld(w).every((r) => found.has(r.id));
const BADGES = [
  { id: 'first', name: 'First Find', desc: 'Open your first relic story', test: () => found.size >= 1 },
  { id: 'shore', name: 'The Shore', desc: 'Find all 7 Moon relics', test: () => allFound('moon') },
  { id: 'shift', name: 'The Long Shift', desc: 'Find all 8 Mars relics', test: () => allFound('mars') },
  { id: 'drift', name: 'The Drift', desc: 'Find all 5 deep-space relics', test: () => allFound('deep') },
  { id: 'quiz', name: 'Quiz Whiz', desc: 'Answer 10 quizzes right the first time', test: () => Object.values(xs.quiz).filter((v) => v === 'right').length >= 10 },
  { id: 'pilot', name: 'Ace Pilot', desc: 'Complete 10 mini games', test: () => Object.keys(xs.won).length >= 10 },
  { id: 'historian', name: 'Historian', desc: 'Put the timeline in the right order', test: () => !!xs.sorted },
  { id: 'messenger', name: 'Messenger', desc: 'Deliver all 6 messages between machines', test: () => MESSAGES.every((m) => xs.delivered[m.from]) },
  { id: 'quests', name: 'Quest Master', desc: 'Complete all 9 quests', test: () => QUESTS.every((q) => progressOf(q).done) },
  { id: 'writer', name: 'Field Writer', desc: 'Write 5 mission log entries', test: () => Object.values(learn.log).filter((t) => t.trim()).length >= 5 },
];
function checkProgress() {
  const fresh = BADGES.filter((b) => !xs.badges[b.id] && b.test());
  fresh.forEach((b) => { xs.badges[b.id] = Date.now(); });
  const rank = rankOf(found.size), rankUp = xs.rank && rank !== xs.rank;
  xs.rank = rank;
  if (fresh.length || rankUp) saveX();
  if (tour.on) return;
  const msgs = [...fresh.map((b) => `Badge earned: <b>${b.name}</b>`), ...(rankUp ? [`New rank: <b>${rank}</b>`] : [])];
  msgs.forEach((m, i) => setTimeout(() => toast(m), i * 3400));
  if (fresh.length) sfx.win();
}
function badgesHTML() {
  const n = found.size, nr = nextRank(n), earned = BADGES.filter((b) => xs.badges[b.id]).length;
  return `<div class="rank-card"><span class="rank-label">Your rank</span><b>${rankOf(n)}</b>
      <small>${nr ? `Find ${nr[0] - n} more relic${nr[0] - n === 1 ? '' : 's'} to become ${nr[1]}.` : 'The highest rank. Every relic found.'}</small>
      <div class="rank-bar"><i style="width:${n / RELICS.length * 100}%"></i></div></div>
    <h4 class="log-h">Badges <span>${earned}/${BADGES.length}</span></h4>
    <ul class="badge-grid">${BADGES.map((b) => `<li class="${xs.badges[b.id] ? 'on' : ''}"><span aria-hidden="true">${xs.badges[b.id] ? '✓' : ''}</span><b>${b.name}</b><small>${b.desc}</small></li>`).join('')}</ul>
    <h4 class="log-h">Activities</h4>
    <p class="inv-sub">Quizzes answered: ${Object.keys(xs.quiz).length}/${RELICS.length} · Mini games completed: ${Object.keys(xs.won).length}/${Object.values(EXTRAS).filter((x) => x.game).length} · Messages delivered: ${Object.keys(xs.delivered).length}/${MESSAGES.length}</p>
    <button class="btn ghost" id="badges-sort">Play the timeline challenge</button>`;
}
$('q-list').addEventListener('click', (e) => { if (e.target.closest('#badges-sort')) { closeQuests(); openSort(); } });
xs.rank ||= rankOf(found.size);

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
  // On phones, centre the subject in the space left between the top panels and the card.
  let wantY = 0;
  if (!wide && (cardRelic || tour.on)) {
    const top = tour.on && !$('tour').hidden ? $('tour').getBoundingClientRect().bottom : 60;
    const bottom = cardRelic ? window.innerHeight - ch : window.innerHeight;
    wantY = window.innerHeight / 2 - (top + bottom) / 2;
  }
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
if (!parseHash()[0]) {
  let seen = false;
  try { seen = !!localStorage.getItem(COLD_KEY); } catch { /* private mode */ }
  if (seen) endColdOpen(); else playColdOpen();
} else {
  $('coldopen').classList.add('done');
}
$('loading').textContent = '';
$('begin').disabled = false;
if (parseHash()[0]) route();
