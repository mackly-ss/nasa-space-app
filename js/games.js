// Mini games, adapted from the author's own ECHO's Lost Memories and restyled for the documentary.
// Each game draws into `stage`, reports progress with setStatus(text, ok) and calls won() once.
const INK = '#0c0e1a';
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const inner = (svg) => svg.replace(/^<svg[^>]*>|<\/svg>$/g, '');
function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* Soft sound cues (Web Audio, no files) */
let actx = null;
function ac() { if (!actx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; actx = new C(); } if (actx.state === 'suspended') actx.resume(); return actx; }
function tone(freqs, dur = .12, type = 'sine', vol = .08) {
  const c = ac(); if (!c) return; let t = c.currentTime;
  freqs.forEach((f) => { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + .02); t += dur * .8; });
}
export const sfx = {
  miss: () => tone([220, 180], .1, 'triangle', .05),
  click: () => tone([700], .05, 'sine', .04),
  right: () => tone([660, 880], .12, 'sine', .07),
  wrong: () => tone([300, 240], .14, 'triangle', .05),
  crash: () => tone([180, 120, 80], .14, 'triangle', .06),
  win: () => tone([523, 659, 784, 1047], .16, 'sine', .08),
};

function art(kind){
  const S1=`stroke="${INK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"`;
  const W='#d8dbe3', G='#c9a043', T='#8fc9a3', P='#d9774a', L='#8f9cc4';
  const k = {
    near:`<rect x="64" y="84" width="72" height="56" rx="6" fill="${G}" ${S1}/>
      <rect x="18" y="92" width="44" height="40" fill="${L}" ${S1}/><rect x="138" y="92" width="44" height="40" fill="${L}" ${S1}/>
      <path d="M28 92v40M40 92v40M52 92v40M148 92v40M160 92v40M172 92v40" stroke="${INK}" stroke-width="1.5" opacity=".5"/>
      <path d="M72 84a28 14 0 0 1 56 0z" fill="${W}" ${S1}/><path d="M100 70v-8" ${S1}/>
      <path d="M78 140l-10 24M122 140l10 24" ${S1}/>`,
    surveyor:`<path d="M64 118L42 166M136 118l22 48" ${S1} fill="none"/><path d="M32 166h20M148 166h20" ${S1}/><path d="M100 124v44M92 170h16" ${S1}/><path d="M70 92h60v34H70z" fill="${W}" ${S1}/><circle cx="100" cy="109" r="8" fill="${INK}"/>
      <path d="M100 92V44" ${S1}/><path d="M100 48l40-14v28z" fill="${T}" ${S1}/><path d="M76 92l-20-24" ${S1}/><rect x="40" y="52" width="26" height="18" rx="4" fill="${L}" ${S1} transform="rotate(-28 53 61)"/>`,
    eagle:`<path d="M58 132L34 168M142 132l24 36M78 138l-8 30M122 138l8 30" ${S1}/><path d="M24 170h22M154 170h22" ${S1}/>
      <path d="M54 92h92l10 24-10 24H54l-10-24z" fill="${G}" ${S1}/><path d="M60 104h80M60 128h80" stroke="${INK}" stroke-width="1.5" opacity=".5"/>
      <rect x="84" y="102" width="32" height="24" rx="3" fill="${W}" ${S1}/><path d="M92 140v28M108 140v28M92 150h16M92 160h16" ${S1}/><path d="M80 92l-6-18h52l-6 18" fill="${W}" ${S1}/>`,
    reflector:`<path d="M100 132v36M80 170h40" ${S1}/><path d="M74 170l26-34 26 34" ${S1} fill="none"/>
      <g transform="rotate(-16 100 96)"><rect x="46" y="60" width="108" height="72" rx="8" fill="${W}" ${S1}/>
      ${Array.from({length:15},(_,i)=>`<circle cx="${60+(i%5)*20}" cy="${76+Math.floor(i/5)*20}" r="7" fill="${L}" stroke="${INK}" stroke-width="1.5"/>`).join('')}</g>`,
    rover:`<circle cx="56" cy="148" r="20" fill="${W}" ${S1}/><circle cx="144" cy="148" r="20" fill="${W}" ${S1}/><circle cx="56" cy="148" r="7" fill="${INK}"/><circle cx="144" cy="148" r="7" fill="${INK}"/>
      <path d="M30 126h140" ${S1}/><path d="M72 126V102h26v24M104 126V102h26v24" ${S1} fill="${T}"/><rect x="34" y="112" width="30" height="14" rx="4" fill="${G}" ${S1}/>
      <path d="M152 126V72" ${S1}/><path d="M128 60a24 11 0 0 0 48 0z" fill="${W}" ${S1}/><path d="M152 60V48" ${S1}/><rect x="22" y="92" width="16" height="14" rx="3" fill="${P}" ${S1}/>`,
    seismo:`<ellipse cx="100" cy="164" rx="46" ry="10" fill="${G}" ${S1}/><path d="M64 164c4-40 10-64 36-64s32 24 36 64" fill="${G}" ${S1}/>
      <path d="M74 132q26 8 52 0M70 150q30 8 60 0" stroke="${INK}" stroke-width="1.5" fill="none" opacity=".5"/><rect x="88" y="78" width="24" height="24" rx="5" fill="${W}" ${S1}/>
      <path d="M100 78V56" ${S1}/><path d="M30 60q8-14 16 0t16 0M138 60q8-14 16 0t16 0" stroke="${P}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    viking:`<path d="M64 120L42 162M136 120l22 42M100 126v40" ${S1}/><path d="M32 164h20M148 164h20M90 168h20" ${S1}/>
      <path d="M58 96h84l-9 30H67z" fill="${W}" ${S1}/><rect x="78" y="74" width="44" height="22" rx="5" fill="${L}" ${S1}/>
      <path d="M122 80l20-32" ${S1}/><path d="M124 44a22 10 -30 0 0 38 -22z" fill="${W}" ${S1}/><path d="M68 96l-14-36" ${S1}/><circle cx="52" cy="54" r="8" fill="${T}" ${S1}/><path d="M62 124l-22 18h24" ${S1} fill="none"/>`,
    minirover:`${[52,100,148].map(x=>`<circle cx="${x}" cy="150" r="14" fill="${W}" ${S1}/><circle cx="${x}" cy="150" r="4" fill="${INK}"/>`).join('')}
      <path d="M52 150l24-24h48l24 24" ${S1} fill="none"/><rect x="56" y="104" width="88" height="26" rx="5" fill="${W}" ${S1}/>
      <rect x="50" y="90" width="100" height="14" rx="3" fill="${T}" ${S1}/><path d="M138 90V64" ${S1}/><circle cx="138" cy="60" r="5" fill="${P}" ${S1}/>`,
    bigrover:`${[48,100,152].map(x=>`<circle cx="${x}" cy="152" r="15" fill="${W}" ${S1}/><circle cx="${x}" cy="152" r="5" fill="${INK}"/>`).join('')}
      <path d="M48 152l18-28M100 152v-28M152 152l-18-28" ${S1}/><rect x="54" y="104" width="92" height="22" rx="5" fill="${W}" ${S1}/>
      <path d="M26 98l22-7h104l22 7-22 9H48z" fill="${T}" ${S1}/><path d="M72 96V44" ${S1}/><rect x="56" y="30" width="34" height="18" rx="5" fill="${W}" ${S1}/><circle cx="66" cy="39" r="3.5" fill="${INK}"/><circle cx="80" cy="39" r="3.5" fill="${INK}"/><path d="M130 96V68" ${S1}/><circle cx="130" cy="64" r="6" fill="${G}" ${S1}/>`,
    phoenix:`<path d="M80 122l-14 40M120 122l14 40" ${S1}/><path d="M56 164h20M124 164h20" ${S1}/>
      ${[40,160].map(x=>`<path d="M${x-28} 98l28-26 28 26-28 26z" fill="${T}" ${S1}/><path d="M${x-28} 98h56M${x} 72v52" stroke="${INK}" stroke-width="2"/>`).join('')}
      <rect x="74" y="94" width="52" height="30" rx="6" fill="${W}" ${S1}/><path d="M118 94l14-34 26 24-10 18" ${S1} fill="none"/><path d="M86 94V70" ${S1}/><rect x="78" y="58" width="18" height="12" rx="3" fill="${G}" ${S1}/>`,
    insight:`<path d="M80 120l-14 42M120 120l14 42" ${S1}/><circle cx="44" cy="102" r="30" fill="${T}" ${S1}/><circle cx="156" cy="102" r="30" fill="${T}" ${S1}/>
      ${[0,30,60,90,120,150].map(a=>{const c=Math.cos(a*Math.PI/180)*28,s=Math.sin(a*Math.PI/180)*28;return `<path d="M${(44-c).toFixed(1)} ${(102-s).toFixed(1)}L${(44+c).toFixed(1)} ${(102+s).toFixed(1)}M${(156-c).toFixed(1)} ${(102-s).toFixed(1)}L${(156+c).toFixed(1)} ${(102+s).toFixed(1)}" stroke="${INK}" stroke-width="2"/>`}).join('')}
      <rect x="70" y="90" width="60" height="30" rx="7" fill="${W}" ${S1}/><path d="M114 90l22-38 22 32" ${S1} fill="none"/><path d="M140 160a14 9 0 0 1 28 0z" fill="${G}" ${S1}/>`,
    heli:`<path d="M30 52h140M44 74h112" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M100 46v62" ${S1}/>
      <rect x="84" y="20" width="32" height="20" rx="3" fill="${T}" ${S1}/><path d="M100 40v6" ${S1}/>
      <rect x="78" y="106" width="44" height="34" rx="8" fill="${W}" ${S1}/><circle cx="92" cy="122" r="4" fill="${INK}"/>
      <path d="M80 138l-24 30M120 138l24 30M90 140l-8 30M110 140l8 30" ${S1}/>`
  };
  return `<svg viewBox="0 0 200 200" aria-hidden="true">${k[kind]||k.surveyor}</svg>`;
}
/* small part icons for the assemble game */
function partIcon(kind){
  const S1=`stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
  const k={
    wheel:`<circle cx="30" cy="30" r="20" fill="#fff" ${S1}/><circle cx="30" cy="30" r="7" fill="${INK}"/><path d="M30 10v40M10 30h40M16 16l28 28M44 16L16 44" stroke="${INK}" stroke-width="1.5" opacity=".5"/>`,
    seat:`<path d="M14 40h32M18 40V22h12v18M32 40V22h12v18" fill="#9be3b6" ${S1}/>`,
    dish:`<path d="M8 22a22 12 0 0 0 44 0z" fill="#fff" ${S1}/><path d="M30 34v18M22 52h16" ${S1}/>`,
    battery:`<rect x="12" y="18" width="36" height="24" rx="4" fill="#ffc27a" ${S1}/><path d="M48 26v8M22 30h8M26 26v8" ${S1}/>`,
    lab:`<rect x="12" y="16" width="36" height="28" rx="5" fill="#9fb4ff" ${S1}/><path d="M22 24v10l-4 6h16l-4-6V24" fill="#fff" stroke="${INK}" stroke-width="2.5"/>`,
    arm:`<path d="M10 48l16-18 18 8 6-18" fill="none" ${S1}/><path d="M44 18l10 4-4 8" fill="#ffc27a" ${S1}/>`,
    boom:`<path d="M30 52V18" ${S1}/><circle cx="30" cy="14" r="8" fill="#9be3b6" ${S1}/><path d="M38 24h12M38 30h8" ${S1}/>`,
    solar:`<circle cx="30" cy="30" r="22" fill="#9be3b6" ${S1}/><path d="M8 30h44M30 8v44M14 14l32 32M46 14L14 46" stroke="${INK}" stroke-width="1.5"/>`,
    dome:`<path d="M10 46a20 20 0 0 1 40 0z" fill="#ffc27a" ${S1}/><path d="M6 46h48" ${S1}/>`
  };
  return `<svg viewBox="0 0 60 60" aria-hidden="true">${k[kind]||''}</svg>`;
}


/* ---- 1. LAND: vertical, steer (Eagle), airbag (Pathfinder), fly (Ingenuity) ---- */
function gameLand(stage, m, cfg, won, setStatus){
  const moon=m.world==='moon', GY=400, mode=cfg.mode;
  const g = cfg.g ?? (moon?30:48);
  const sky = cfg.sky || (moon?'#05060c':'#b98a6a'), ground = cfg.ground || (moon?'#9a9ca3':'#a8673f');
  const zone = mode==='steer' ? [520,660] : null;
  const boulders = mode==='steer' ? Array.from({length:16},(_,i)=>{ const x=40+i*48; return (x>zone[0]-10&&x<zone[1]+10)?'':`<ellipse cx="${x}" cy="${GY+2}" rx="${14+(i%3)*6}" ry="${10+(i%2)*5}" fill="#6c6e76" stroke="${INK}" stroke-width="1.5"/>`; }).join('') : '';
  const flags = zone ? `<path d="M${zone[0]} ${GY}v-46M${zone[1]} ${GY}v-46" stroke="${INK}" stroke-width="2"/><path d="M${zone[0]} ${GY-46}l26 8-26 8zM${zone[1]} ${GY-46}l-26 8 26 8z" fill="#9be3b6" stroke="${INK}" stroke-width="1.5"/><text x="${(zone[0]+zone[1])/2}" y="${GY+34}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700" fill="${INK}">SAFE FLAT ZONE</text>` : '';
  const band = mode==='fly' ? `<rect x="0" y="${GY-105}" width="800" height="30" fill="#9be3b6" opacity=".3"/><text x="790" y="${GY-84}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="13" font-weight="700" fill="${INK}">HOVER ZONE 2.5–3.5 m</text>` : '';
  const meter = mode==='airbag' ? `<rect x="740" y="70" width="26" height="${GY-70}" rx="8" fill="#fff" stroke="${INK}" stroke-width="1.5"/><rect x="742" y="${GY-130}" width="22" height="70" fill="#9be3b6"/><circle id="mk" cx="753" cy="80" r="9" fill="#ff9a5a" stroke="${INK}" stroke-width="1.5"/><text x="753" y="58" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700" fill="${INK}">ALT</text>` : '';
  const craftArt = mode==='airbag'
    ? `<g id="bags" opacity="0">${[[-30,-34],[30,-34],[0,-64],[0,-14]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="30" fill="#fff" stroke="${INK}" stroke-width="1.5"/>`).join('')}</g><path d="M-26 -12l26-44 26 44z" fill="#ffc27a" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><g id="chute"><path d="M-40 -130q40-40 80 0z" fill="#ff9a5a" stroke="${INK}" stroke-width="1.5"/><path d="M-40 -130L-10 -56M40 -130L10 -56" stroke="${INK}" stroke-width="2"/></g>`
    : `<svg x="-45" y="-77" width="90" height="90" viewBox="0 0 200 200">${inner(art(m.art))}</svg>`;
  stage.innerHTML=`<svg class="g" viewBox="0 0 800 450">
    <rect width="800" height="450" fill="${sky}"/>${Array.from({length:30},(_,i)=>`<circle cx="${(i*131)%800}" cy="${(i*53)%300}" r="1.6" fill="#fff" opacity="${moon?.8:.35}"/>`).join('')}
    ${band}<rect x="0" y="${GY}" width="800" height="50" fill="${ground}" stroke="${INK}" stroke-width="2"/>${boulders}${flags}${meter}
    <g id="craft"><g id="flame" opacity="0"><path d="M-12 0l12 34 12-34z" fill="#ffc27a" stroke="#ff9a5a" stroke-width="3"/></g>${craftArt}</g>
  </svg>
  <div class="hud" id="hud"></div>
  ${mode==='airbag'?'<button class="btn primary hold" id="act">Inflate airbags!</button>':'<button class="btn primary hold" id="act">Hold to fire</button>'}`;
  const craft=$('#craft',stage), flame=$('#flame',stage), hud=$('#hud',stage), act=$('#act',stage);
  let x = mode==='steer'?160:400, y = mode==='fly'?GY:70, vy = mode==='fly'?0:(mode==='airbag'?62:28), tx=x, fuel=100, thrust=false, over=false, bags=false, hover=0, hoverDone=false, airborne=false, last=performance.now();
  const svg=stage.querySelector('svg');
  const toX = e => { const r=svg.getBoundingClientRect(); return (e.clientX-r.left)/r.width*800; };
  const on = e => { if(mode==='airbag'||over) return; thrust=true; if(e&&e.clientX!==undefined&&mode==='steer') tx=toX(e); };
  const off = () => { thrust=false; };
  if(mode!=='airbag'){
    stage.addEventListener('pointerdown', e=>{ if(e.target.closest('.hud')) return; on(e); });
    stage.addEventListener('pointermove', e=>{ if(mode==='steer') tx=toX(e); });
    addEventListener('pointerup', off); stage.addEventListener('pointerleave', ()=>{ if(mode!=='steer') off(); });
    const kd=e=>{ if(!stage.isConnected){ removeEventListener('keydown',kd); removeEventListener('keyup',ku); return; } if(e.code==='Space'){ e.preventDefault(); on(); } if(mode==='steer'){ if(e.key==='ArrowLeft') tx=x-80; if(e.key==='ArrowRight') tx=x+80; } };
    const ku=e=>{ if(e.code==='Space') off(); };
    addEventListener('keydown',kd); addEventListener('keyup',ku);
  } else {
    act.onclick=()=>{ if(over||bags) return; const alt=GY-y; if(alt>130){ sfx.miss(); setStatus('Too early! Wait until the marker reaches the green zone.'); return; } bags=true; $('#bags',stage).setAttribute('opacity','1'); sfx.right(); setStatus('Airbags inflated! Brace for bounces…', true); };
  }
  const fail = t => { over=true; thrust=false; sfx.crash(); setStatus(t+' Press Restart to try again.'); flame.setAttribute('opacity','0'); };
  const loop = now => {
    if(!stage.isConnected || over) return;
    const dt=Math.min(.05,(now-last)/1000); last=now;
    if(mode==='airbag'){ y+=vy*dt; }
    else {
      const burning = thrust && fuel>0;
      const up = mode==='fly' ? 82 : g*2.3;
      vy += (g - (burning?up:0))*dt;
      if(mode==='fly') vy=Math.max(-95,Math.min(140,vy));
      y += vy*dt;
      if(burning && mode!=='fly') fuel=Math.max(0,fuel-15*dt);
      flame.setAttribute('opacity', burning&&mode!=='fly'?'1':'0');
      if(mode==='steer'){ const d=tx-x; x+=Math.max(-130*dt,Math.min(130*dt,d)); x=Math.max(40,Math.min(760,x)); }
    }
    if(mode==='fly'){
      if(y<GY-2) airborne=true;
      const alt=(GY-y)/30;
      if(!hoverDone && alt>=2.5 && alt<=3.5){ hover+=dt; if(hover>=3){ hoverDone=true; sfx.right(); setStatus('Hover complete! Now let go and land gently.', true); } }
      if(y>=GY){ y=GY; if(airborne && hoverDone){ if(vy>40) return fail(`Hard landing (${(vy/30).toFixed(1)} m/s)! Rotor damage is exactly what ended Ingenuity’s last flight.`); over=true; craft.setAttribute('transform',`translate(${x} ${y})`); return won(); } vy=Math.min(vy,0); }
      if(y<40){ y=40; vy=0; }
      hud.innerHTML=`ALTITUDE ${alt.toFixed(1)} m<br>SPEED ${(Math.abs(vy)/30).toFixed(1)} m/s<br>HOVER ${Math.min(3,hover).toFixed(1)} / 3.0 s<div class="fuel"><i style="width:${Math.min(100,hover/3*100)}%;background:var(--mint)"></i></div>`;
    } else if(mode==='airbag'){
      $('#mk',stage).setAttribute('cy', Math.max(80, Math.min(GY-8, 80 + (y-70)/(GY-70)*(GY-88))));
      hud.innerHTML=`ALTITUDE ${Math.max(0,(GY-y)/3).toFixed(0)} m<br>PARACHUTE OPEN<br>${bags?'AIRBAGS: INFLATED':'AIRBAGS: WAITING'}`;
      if(y>=GY-14){ if(!bags) return fail('No airbags! Pathfinder hit the ground too hard.');
        over=true; $('#chute',stage).setAttribute('opacity','0'); let t=0; const b0=performance.now();
        const bounce=nw=>{ if(!stage.isConnected) return; t=(nw-b0)/1000; const h=Math.abs(Math.sin(t*6))*90*Math.exp(-t*1.4); craft.setAttribute('transform',`translate(${400+t*90} ${GY-14-h})`); if(t<2.4) requestAnimationFrame(bounce); else won(); };
        sfx.right(); setStatus('Boing! Boing! Boing!', true); requestAnimationFrame(bounce); return; }
    } else {
      const v=vy/12;
      hud.innerHTML=`ALTITUDE ${Math.max(0,(GY-y)/3).toFixed(0)} m<br>SPEED <span style="color:${v<=3?'var(--good)':'var(--bad)'}">${v.toFixed(1)} m/s</span> (safe ≤ 3)<div class="fuel"><i style="width:${fuel}%"></i></div>`;
      if(y>=GY){ y=GY; craft.setAttribute('transform',`translate(${x} ${y})`);
        if(v>3) return fail(`Crash! You touched down at ${v.toFixed(1)} m/s.`);
        if(zone && (x<zone[0]+15 || x>zone[1]-15)) return fail('You landed on the boulders! Steer between the flags.');
        over=true; flame.setAttribute('opacity','0'); return won(); }
    }
    craft.setAttribute('transform',`translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    requestAnimationFrame(loop);
  };
  setStatus(mode==='airbag'?'Falling under the parachute…':mode==='fly'?'Rotors ready. Hold to climb!':'Falling toward the surface… fire the engine!');
  requestAnimationFrame(t=>{ last=t; loop(t); });
}

/* ---- 2a. AIM: laser mirror ---- */
function gameAim(stage, m, cfg, won, setStatus){
  const O=[130,372];
  stage.innerHTML=`<svg class="g" viewBox="0 0 800 450">
    <rect width="800" height="450" fill="#05060c"/>${Array.from({length:40},(_,i)=>`<circle cx="${(i*131)%800}" cy="${(i*53)%330}" r="1.6" fill="#fff" opacity=".7"/>`).join('')}
    <circle cx="830" cy="-60" r="300" fill="#c9ccd6" stroke="${INK}" stroke-width="2.5"/><circle cx="700" cy="60" r="40" fill="#9a9ca3"/>
    <g id="mirror"><rect x="-16" y="-11" width="32" height="22" rx="3" fill="#fff" stroke="${INK}" stroke-width="1.5"/>${[-8,0,8].map(dx=>`<circle cx="${dx}" cy="0" r="3" fill="#9fb4ff"/>`).join('')}<circle r="26" fill="none" stroke="#ffc27a" stroke-width="2" stroke-dasharray="4 4"/></g>
    <circle cx="80" cy="640" r="300" fill="#3d6fb0" stroke="${INK}" stroke-width="2.5"/><path d="M-20 400q60-30 120-10" stroke="#9be3b6" stroke-width="16" fill="none" stroke-linecap="round"/>
    <path d="M110 380a20 20 0 0 1 40 0z" fill="#fff" stroke="${INK}" stroke-width="2"/>
    <line id="beam" x1="${O[0]}" y1="${O[1]}" x2="${O[0]}" y2="${O[1]}" stroke="#ff9a5a" stroke-width="4" stroke-linecap="round"/>
    <circle id="photon" r="7" fill="#ffc27a" stroke="${INK}" stroke-width="2" opacity="0"/>
    <text x="20" y="440" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700" fill="#fff">OBSERVATORY ON EARTH</text>
    <text id="clock" x="780" y="440" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="16" font-weight="700" fill="#ffc27a"></text>
  </svg><button class="btn primary hold" id="fire" disabled>Fire laser</button>`;
  const svg=stage.querySelector('svg'), beam=$('#beam',stage), mir=$('#mirror',stage), fire=$('#fire',stage), photon=$('#photon',stage), clock=$('#clock',stage);
  let ang=-0.5, M=[640,170], aligned=false, firing=false, dragging=false; const t0=performance.now();
  const toSvg=e=>{ const r=svg.getBoundingClientRect(); return [(e.clientX-r.left)/r.width*800,(e.clientY-r.top)/r.height*450]; };
  const setAng=e=>{ const [px,py]=toSvg(e); ang=Math.atan2(py-O[1],px-O[0]); };
  stage.addEventListener('pointerdown',e=>{ if(e.target===fire||firing) return; dragging=true; setAng(e); });
  stage.addEventListener('pointermove',e=>{ if(dragging&&!firing) setAng(e); });
  addEventListener('pointerup',()=>dragging=false);
  const loop=now=>{ if(!stage.isConnected) return;
    const t=(now-t0)/1000; M=[640+Math.sin(t*.7)*26, 170+Math.cos(t*.9)*16];
    mir.setAttribute('transform',`translate(${M[0].toFixed(1)} ${M[1].toFixed(1)})`);
    const target=Math.atan2(M[1]-O[1],M[0]-O[0]); const diff=Math.abs(((ang-target+Math.PI*3)%(Math.PI*2))-Math.PI);
    aligned = diff < 0.022;
    if(!firing){ const L=900; beam.setAttribute('x2',(O[0]+Math.cos(ang)*L).toFixed(1)); beam.setAttribute('y2',(O[1]+Math.sin(ang)*L).toFixed(1)); beam.setAttribute('stroke',aligned?'#9be3b6':'#ff9a5a'); fire.disabled=!aligned;
      setStatus(aligned?'Locked on the mirror! Fire now!':'Drag to aim the laser at the mirror.', aligned); }
    requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  fire.onclick=()=>{ if(!aligned||firing) return; firing=true; fire.disabled=true; sfx.right(); const P0=[...O], P1=[...M]; const s=performance.now();
    beam.setAttribute('x2',P1[0]); beam.setAttribute('y2',P1[1]); beam.setAttribute('stroke','#9be3b6'); photon.setAttribute('opacity','1');
    const anim=nw=>{ if(!stage.isConnected) return; const k=(nw-s)/2500; const kk=k<.5?k*2:2-k*2; photon.setAttribute('cx',(P0[0]+(P1[0]-P0[0])*kk).toFixed(1)); photon.setAttribute('cy',(P0[1]+(P1[1]-P0[1])*kk).toFixed(1)); clock.textContent=`ROUND TRIP: ${Math.min(2.5,k*2.5).toFixed(2)} s`;
      if(k<1) requestAnimationFrame(anim); else { setStatus('The light came back after about 2.5 seconds. Distance measured!', true); won(); } };
    requestAnimationFrame(anim); };
}

/* ---- 2b. TUNE: match the moonquake wave ---- */
function gameTune(stage, m, cfg, won, setStatus){
  stage.classList.add('free');
  const r=rng(hash(m.id)); const tA=30+r()*35, tF=2+r()*2.5;
  stage.innerHTML=`<div class="tune"><svg viewBox="0 0 800 260" id="wave"></svg>
    <label for="amp">Shake size <input type="range" id="amp" min="5" max="90" step="1" value="12"></label>
    <label for="frq">Shake speed <input type="range" id="frq" min="1" max="5" step="0.05" value="1"></label>
    <div style="font-weight:700">Match: <span id="pct">0</span>%</div></div>`;
  const wave=$('#wave',stage), amp=$('#amp',stage), frq=$('#frq',stage), pct=$('#pct',stage); let done=false;
  const path=(A,F,ph=0)=>{ let d=''; for(let x=0;x<=800;x+=8){ const y=130+A*Math.sin(x/800*F*Math.PI*2+ph)*Math.exp(-((x-400)**2)/90000); d+=(x?'L':'M')+x+' '+y.toFixed(1); } return d; };
  const draw=()=>{ const A=+amp.value, F=+frq.value;
    wave.innerHTML=`${Array.from({length:17},(_,i)=>`<path d="M${i*50} 0V260" stroke="rgba(255,255,255,.08)" stroke-width="1"/>`).join('')}${Array.from({length:6},(_,i)=>`<path d="M0 ${i*52}H800" stroke="rgba(255,255,255,.08)" stroke-width="1"/>`).join('')}
      <path d="${path(tA,tF)}" stroke="#ff9a5a" stroke-width="2.5" fill="none" stroke-dasharray="10 6"/><path d="${path(A,F)}" stroke="#9be3b6" stroke-width="4" fill="none"/>
      <text x="12" y="22" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700" fill="#ff9a5a">QUAKE SIGNAL</text><text x="12" y="44" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700" fill="#9be3b6">YOUR SEISMOMETER</text>`;
    const score=Math.max(0,100-Math.abs(A-tA)*1.6-Math.abs(F-tF)*30); pct.textContent=Math.round(score);
    if(!done && Math.abs(A-tA)<=5 && Math.abs(F-tF)<=0.18){ done=true; setStatus('Moonquake recorded! The waves tell us what’s inside.', true); won(); }
    else if(!done) setStatus(score>80?'So close! Fine-tune it…':'Drag the sliders to match the orange wave.'); };
  amp.oninput=frq.oninput=draw; draw();
}

/* ---- 3. ASSEMBLE: drag parts onto the machine ---- */
function gameAssemble(stage, m, cfg, won, setStatus){
  stage.classList.add('free');
  const parts=PARTS[m.id].map((p,i)=>({...p,i}));
  const order=[...parts].sort((a,b)=>((a.i*7+3)%5)-((b.i*7+3)%5));
  stage.innerHTML=`<div class="asm"><div class="ghost" id="ghost"><svg class="base" viewBox="0 0 200 200">${inner(art(m.art))}</svg>
      ${parts.map(p=>`<div class="slot" data-i="${p.i}" style="left:${(6+p.at[0]/200*88).toFixed(1)}%;top:${(6+p.at[1]/200*88).toFixed(1)}%"></div>`).join('')}</div>
    <div class="tray"><h4>Parts tray · drag onto the glowing spots</h4>${order.map(p=>`<div class="part" data-i="${p.i}" data-kind="${p.kind}">${partIcon(p.kind)}${esc(p.name)}</div>`).join('')}</div></div>`;
  const ghost=$('#ghost',stage); let placed=0;
  setStatus(`Placed 0/${parts.length} parts`);
  stage.querySelectorAll('.part').forEach(el=>{
    el.addEventListener('pointerdown',e=>{ if(el.classList.contains('used')) return; e.preventDefault(); el.setPointerCapture(e.pointerId);
      const clone=el.cloneNode(true); clone.classList.add('dragging'); document.body.appendChild(clone);
      const move=ev=>{ clone.style.left=(ev.clientX-55)+'px'; clone.style.top=(ev.clientY-40)+'px'; }; move(e); sfx.click();
      const upF=ev=>{ el.removeEventListener('pointermove',move); el.removeEventListener('pointerup',upF); el.removeEventListener('pointercancel',upF); clone.remove();
        let best=null, bd=1e9; ghost.querySelectorAll('.slot:not(.filled)').forEach(s=>{ const r=s.getBoundingClientRect(); const d=Math.hypot(r.left+r.width/2-ev.clientX, r.top+r.height/2-ev.clientY); if(d<bd){bd=d;best=s;} });
        if(!best || bd>70){ return; }
        const part=parts[+el.dataset.i], slotPart=parts[+best.dataset.i];
        if(slotPart.kind!==part.kind){ best.classList.remove('wrong'); void best.offsetWidth; best.classList.add('wrong'); sfx.wrong(); setStatus(`Hmm, the ${part.name.toLowerCase()} doesn’t go there. Try another glowing spot.`); return; }
        best.classList.add('filled'); best.innerHTML=partIcon(part.kind); el.classList.add('used'); placed++; sfx.right();
        setStatus(`✓ ${part.name}: ${part.role} (${placed}/${parts.length})`, true);
        if(placed===parts.length){ ghost.querySelector('svg.base').classList.add('done'); setTimeout(won, reduced?0:900); } };
      el.addEventListener('pointermove',move); el.addEventListener('pointerup',upF); el.addEventListener('pointercancel',upF); });
  });
}

/* ---- 4. DIG: scratch the soil away (Spirit's wheel, Phoenix's scoop) ---- */
function gameDig(stage, m, cfg, won, setStatus){
  stage.classList.add('dig');
  const ice=cfg.target==='ice';
  const zone={x:.3,y:.42,w:.4,h:.4};
  const hidden = ice
    ? `${[[330,250,40],[400,280,52],[470,248,36],[380,330,30],[450,330,34]].map(([x,y,r])=>`<path d="M${x-r} ${y}l${r*.6} ${-r*.8} ${r*.9} ${r*.1} ${r*.5} ${r*.7} ${-r*.7} ${r*.7}z" fill="#e8f6ff" stroke="#7fc8ff" stroke-width="4"/>`).join('')}<text x="400" y="390" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="18" font-weight="700" fill="${INK}">WATER ICE</text>`
    : `<path d="M250 260q80-30 150 0t150 10l-10 60q-70 20-140-5t-140 5z" fill="#ffffff" stroke="#d9d0c0" stroke-width="4"/><text x="400" y="390" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="18" font-weight="700" fill="${INK}">SILICA · ALMOST PURE</text>`;
  stage.innerHTML=`<svg class="g" viewBox="0 0 800 450"><rect width="800" height="450" fill="${ice?'#8a5a3a':'#9a5a32'}"/>${Array.from({length:30},(_,i)=>`<circle cx="${(i*131)%800}" cy="${(i*67)%450}" r="${3+(i%4)}" fill="#6e4126" opacity=".6"/>`).join('')}${hidden}</svg>
    <canvas id="soil"></canvas><div class="tool" id="tool">${ice?partIcon('arm'):partIcon('wheel')}</div>`;
  const cv=$('#soil',stage), tool=$('#tool',stage), ctx=cv.getContext('2d');
  const r=stage.getBoundingClientRect(); const dpr=Math.min(2,devicePixelRatio||1); cv.width=Math.max(10,r.width*dpr); cv.height=Math.max(10,r.height*dpr);
  const W=cv.width, H=cv.height, rnd=rng(hash(m.id));
  ctx.fillStyle=ice?'#a8764f':'#b0703f'; ctx.fillRect(0,0,W,H);
  for(let i=0;i<500;i++){ ctx.fillStyle=`rgba(${rnd()<.5?'90,50,30':'240,200,160'},${.15+rnd()*.25})`; ctx.beginPath(); ctx.arc(rnd()*W,rnd()*H,(1+rnd()*5)*dpr,0,7); ctx.fill(); }
  ctx.fillStyle='rgba(255,236,210,.35)'; ctx.beginPath(); ctx.ellipse((zone.x+zone.w/2)*W,(zone.y+zone.h/2)*H,zone.w/2*W,zone.h/2*H,0,0,7); ctx.fill();
  ctx.globalCompositeOperation='destination-out';
  let down=false, moves=0, done=false;
  const pos=e=>{ const b=cv.getBoundingClientRect(); return [(e.clientX-b.left)*dpr,(e.clientY-b.top)*dpr,e.clientX-b.left,e.clientY-b.top]; };
  const check=()=>{ const zx=zone.x*W|0, zy=zone.y*H|0, zw=zone.w*W|0, zh=zone.h*H|0; const d=ctx.getImageData(zx,zy,zw,zh).data; let clear=0,tot=0; for(let i=3;i<d.length;i+=4*24){ tot++; if(d[i]<60) clear++; } return clear/tot; };
  const dig=e=>{ const [x,y,cx,cy]=pos(e); tool.style.left=cx+'px'; tool.style.top=cy+'px'; if(!down||done) return; ctx.beginPath(); ctx.arc(x,y,28*dpr,0,7); ctx.fill(); moves++;
    if(moves%8===0){ const c=check(); setStatus(`Dug ${Math.min(100,Math.round(c/.55*100))}% of the target area…`); if(c>=.55){ done=true; sfx.right();
      setStatus(ice?'Bright white chunks! Water ice… and it slowly fades as it turns to gas.':'Bright white soil! Almost pure silica, a sign of ancient hot springs.', true);
      if(ice){ const sv=stage.querySelector('svg'); sv.style.transition='opacity 2.5s'; setTimeout(()=>{ if(sv.isConnected) sv.querySelectorAll('path').forEach(p=>p.style.opacity='.45'); },600); }
      setTimeout(won, reduced?0:1600); } } };
  cv.addEventListener('pointerdown',e=>{ down=true; cv.setPointerCapture(e.pointerId); dig(e); });
  cv.addEventListener('pointermove',dig);
  cv.addEventListener('pointerup',()=>down=false); cv.addEventListener('pointercancel',()=>down=false);
  tool.style.left='50%'; tool.style.top='30%';
  setStatus('Press and drag across the lighter patch of soil.');
}

/* ---- 5. FIND: hidden objects ---- */
function gameFind(stage, m, cfg, won, setStatus){
  const r=rng(hash(m.id)), t=cfg.target, n=cfg.count;
  const moon=m.world==='moon';
  const ground = moon?'#8d8f98':(t==='frost'?'#a8764f':'#a86a40');
  const pts=[]; const place=(rad)=>{ for(let k=0;k<200;k++){ const x=60+r()*680, y=60+r()*340; if(pts.every(p=>Math.hypot(p[0]-x,p[1]-y)>rad+p[2]+6)){ pts.push([x,y,rad]); return [x,y]; } } return [400,225]; };
  const targets=[]; for(let i=0;i<n;i++){ const [x,y]=place(t==='berry'?10:30); targets.push([x,y]); }
  const decoys=[]; for(let i=0;i<(t==='berry'?70:26);i++){ const rad=t==='berry'?5+r()*7:12+r()*22; const [x,y]=place(rad); decoys.push([x,y,rad]); }
  const decoyCol = moon?['#6c6e76','#7d7f88','#5d5f67']:['#8c4a2c','#a0603a','#d9a07a','#7a4228'];
  const tShape=([x,y],i)=> t==='orange' ? `<ellipse class="tgt" data-i="${i}" cx="${x}" cy="${y}" rx="26" ry="10" fill="#e0874a" opacity=".78"/>`
    : t==='frost' ? `<ellipse class="tgt" data-i="${i}" cx="${x}" cy="${y}" rx="28" ry="11" fill="#ffffff" opacity=".6"/>`
    : `<g class="tgt" data-i="${i}"><circle cx="${x}" cy="${y}" r="7" fill="#5a6290" stroke="#2b2f55" stroke-width="1.5"/><circle cx="${x-2}" cy="${y-2}" r="2" fill="#cfd6ff"/></g>`;
  stage.innerHTML=`<svg class="g" viewBox="0 0 800 450" style="cursor:crosshair"><rect width="800" height="450" fill="${ground}"/>
    ${Array.from({length:80},(_,i)=>`<circle cx="${(i*97)%800}" cy="${(i*61)%450}" r="1.5" fill="${INK}" opacity=".12"/>`).join('')}
    ${targets.map(tShape).join('')}
    ${decoys.map(([x,y,rad],i)=> t==='berry' ? `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${rad.toFixed(1)}" fill="${decoyCol[i%4]}" stroke="${INK}" stroke-width="1" opacity=".9"/>` : `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${rad.toFixed(1)}" ry="${(rad*.7).toFixed(1)}" fill="${decoyCol[i%decoyCol.length]}" stroke="${INK}" stroke-width="2.5"/>`).join('')}
    <g id="marks"></g></svg>`;
  const svg=stage.querySelector('svg'), marks=$('#marks',stage); let got=0; const hit=new Set();
  setStatus(`Found 0/${n}`);
  svg.addEventListener('click',e=>{
    const b=svg.getBoundingClientRect(), px=(e.clientX-b.left)/b.width*800, py=(e.clientY-b.top)/b.height*450;
    let idx=-1; targets.forEach(([x,y],i)=>{ if(!hit.has(i) && Math.hypot(x-px,(y-py)*(t==='berry'?1:2))< (t==='berry'?16:34)) idx=i; });
    if(idx<0){ sfx.miss(); setStatus(`Just a rock. Found ${got}/${n}.`); return; }
    hit.add(idx); got++; sfx.right(); const [x,y]=targets[idx];
    marks.insertAdjacentHTML('beforeend',`<circle cx="${x}" cy="${y}" r="${t==='berry'?16:34}" fill="none" stroke="#9be3b6" stroke-width="2.5"/><text x="${x}" y="${y-(t==='berry'?22:40)}" text-anchor="middle" font-family="Outfit, sans-serif" font-size="20" fill="${INK}">✓</text>`);
    setStatus(`Found ${got}/${n}!`, true);
    if(got===n) setTimeout(won, reduced?0:500);
  });
}


export { art };
export function startGame(stage, relic, cfg, parts, won, setStatus) {
  const m = { id: relic.id, world: relic.world, art: cfg.art };
  PARTS[relic.id] = parts;
  ({ land: gameLand, aim: gameAim, tune: gameTune, assemble: gameAssemble, dig: gameDig, find: gameFind })[cfg.type](stage, m, cfg, won, setStatus);
}
const PARTS = {};
