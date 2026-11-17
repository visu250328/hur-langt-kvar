/* Husdjuret – välj ett ägg, knacka tills det kläcks, ge djuret ett namn och ta hand om det: mata, leka,
   natta och (på stor nivå) bada. Behoven minskar sakta med tiden, men djuret dör aldrig och blir aldrig sjukt;
   det blir bara lite ledset och visar vad det vill ha. Djuret växer när man tar hand om det och sparas mellan
   resorna. Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.hd{height:100%;display:flex;flex-direction:column;gap:10px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.hd-top{display:flex;align-items:center;gap:14px;min-height:44px;flex-wrap:wrap}
.hd-title{font-size:1.7rem;font-weight:800;line-height:1;margin-right:auto}
.hd-needs{display:flex;gap:12px;flex-wrap:wrap}
.hd-need{display:flex;align-items:center;gap:6px;font-size:1.4rem}
.hd-bar{width:70px;height:14px;border-radius:999px;background:var(--line,#C6D1DF);overflow:hidden}
.hd-bar i{display:block;height:100%;border-radius:999px;transition:width .5s,background .5s}
.hd-room{flex:1;min-height:0;position:relative;border-radius:24px;overflow:hidden;background:linear-gradient(#ffe9c7 0 68%,#d9a066 68%);box-shadow:inset 0 0 0 3px var(--line,#C6D1DF)}
.hd-room .win{position:absolute;left:8%;top:10%;width:18%;aspect-ratio:1;border-radius:12px;background:#9fd6ff;box-shadow:inset 0 0 0 6px #fff}
.hd-room.night{background:linear-gradient(#2a3256 0 68%,#5b4630 68%)}
.hd-room.night .win{background:#101838}
.hd-pet{position:absolute;left:50%;bottom:6%;transform:translateX(-50%);width:min(58%,62vh);aspect-ratio:1;cursor:pointer;transition:width .8s}
.hd-pet.baby{width:min(44%,48vh)}
.hd-pet svg{width:100%;height:100%;display:block}
.hd-pet.jump{animation:hd-jump .6s ease}
.hd-pet.shake{animation:hd-shake .5s ease}
.hd-pet.idle svg{animation:hd-breathe 3s ease-in-out infinite;transform-origin:50% 100%}
.hd-bubble{position:absolute;left:64%;bottom:58%;background:#fff;border-radius:20px;padding:6px 12px;font-size:2rem;box-shadow:0 4px 10px rgba(0,0,0,.15);pointer-events:none;transition:opacity .4s;color:#1D2842}
.hd-bubble:empty{opacity:0}
.hd-fly{position:absolute;font-size:3rem;transition:left .7s ease-in,top .7s ease-in,transform .7s;pointer-events:none;z-index:3}
.hd-z{position:absolute;font-size:2rem;font-weight:900;color:#fff;animation:hd-z 2.5s linear forwards;pointer-events:none}
.hd-bub{position:absolute;width:26px;height:26px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff,rgba(160,210,255,.6));animation:hd-bub 1.6s ease-out forwards;pointer-events:none}
.hd-acts{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.hd-act{border:0;border-radius:20px;background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;padding:8px 16px;display:flex;align-items:center;gap:8px;font-size:1.1rem;cursor:pointer;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF)}
.hd-act span{font-size:2rem;line-height:1}
.hd-act[aria-pressed="true"]{box-shadow:inset 0 0 0 4px var(--accent,#2F6FD6);background:#e6f0ff;color:#1D2842}
.hd-tray{position:absolute;left:50%;top:6%;transform:translateX(-50%);display:flex;gap:10px;background:rgba(255,255,255,.9);border-radius:20px;padding:8px 12px;z-index:2;color:#1D2842}
.hd-tray button{border:0;background:none;font-size:2.6rem;cursor:pointer;padding:2px 6px}
.hd-ball{position:absolute;font-size:3rem;cursor:pointer;transition:left .6s ease,top .6s cubic-bezier(.3,1.6,.6,1);z-index:2}
.hd-pick{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center}
.hd-pick .big{font-size:clamp(1.6rem,5vmin,2.4rem);font-weight:800}
.hd-eggs{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
.hd-eggs button{border:0;background:var(--card,#fff);border-radius:24px;padding:10px;cursor:pointer;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF)}
.hd-eggs svg{width:84px;height:100px;display:block}
.hd-egg{width:min(40vh,240px);cursor:pointer}
.hd-egg.wobble{animation:hd-shake .4s ease}
.hd-names{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.hd-names button{border:0;background:var(--card,#fff);border-radius:18px;padding:12px 16px;font:inherit;font-weight:800;font-size:1.2rem;cursor:pointer;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);color:inherit}
.hd-msg{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);background:#fff;color:#1D2842;border-radius:18px;padding:10px 20px;font-weight:800;font-size:1.4rem;box-shadow:0 6px 18px rgba(0,0,0,.2);opacity:0;transition:opacity .3s;pointer-events:none;z-index:4;text-align:center}
.hd-msg.on{opacity:1}
.hd button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
@keyframes hd-jump{0%,100%{transform:translateX(-50%) translateY(0)}40%{transform:translateX(-50%) translateY(-28%)}}
@keyframes hd-shake{0%,100%{transform:translateX(-50%) rotate(0)}25%{transform:translateX(-50%) rotate(-8deg)}75%{transform:translateX(-50%) rotate(8deg)}}
@keyframes hd-breathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.03)}}
@keyframes hd-z{0%{opacity:0;transform:translate(0,0) scale(.6)}20%{opacity:1}100%{opacity:0;transform:translate(40px,-120px) scale(1.4)}}
@keyframes hd-bub{0%{opacity:1;transform:translate(0,0) scale(.4)}100%{opacity:0;transform:translate(var(--dx),-90px) scale(1.2)}}
.hd-egg.wobble{animation-name:hd-eggw}
@keyframes hd-eggw{0%,100%{transform:rotate(0)}25%{transform:rotate(-10deg)}75%{transform:rotate(10deg)}}
@media (prefers-reduced-motion: reduce){ .hd-pet.idle svg,.hd-pet.jump,.hd-pet.shake{animation:none} }`;

  const EGGS = ['#ff9ab5', '#8fd3ff', '#9be38a', '#ffd36b', '#c7a0ff', '#ffb27a'];
  const NAMES = ['Bubbel', 'Pippi', 'Knatte', 'Mysan', 'Pricken', 'Fluffe', 'Totte', 'Smulan'];
  const NEEDS = [{k: 'mat', icon: '🍎', name: 'Mat'}, {k: 'lek', icon: '⚽', name: 'Lek'}, {k: 'somn', icon: '💤', name: 'Sömn'}, {k: 'bad', icon: '🛁', name: 'Bad'}];
  // Hur mycket varje behov minskar per timme. Liten nivå minskar långsammare och har inget bad.
  const DECAY = {mat: 10, lek: 14, somn: 8, bad: 6};
  const GROW_AT = 20;   // antal omvårdnader innan djuret växer

  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = c => Math.max(0, Math.min(255, Math.round(c * k))); return '#' + [f(n >> 16), f(n >> 8 & 255), f(n & 255)].map(x => x.toString(16).padStart(2, '0')).join(''); };
  function eggSvg(c, cracks){
    const crack = ['M70 90 L82 100 L74 110', 'M110 82 L122 94 L114 104 L126 112', 'M88 120 L100 130 L94 142'].slice(0, cracks).map(d => `<path d="${d}" stroke="#5b3a1e" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('');
    return `<svg viewBox="0 0 200 240" aria-hidden="true"><ellipse cx="100" cy="225" rx="60" ry="10" fill="rgba(0,0,0,.15)"/>
      <path d="M100 20 C150 20 175 110 170 150 C165 200 135 225 100 225 C65 225 35 200 30 150 C25 110 50 20 100 20 Z" fill="${c}" stroke="${shade(c, .7)}" stroke-width="5"/>
      <circle cx="75" cy="80" r="10" fill="#fff" opacity=".6"/><circle cx="125" cy="150" r="14" fill="#fff" opacity=".45"/><circle cx="90" cy="180" r="8" fill="#fff" opacity=".5"/>${crack}</svg>`;
  }
  function petSvg(c, face, big){
    const dk = shade(c, .78), lt = shade(c, 1.25);
    const eyes = face.eyes === 'closed' ? '<path d="M70 106 Q80 114 90 106 M110 106 Q120 114 130 106" stroke="#2a2a2a" stroke-width="5" fill="none" stroke-linecap="round"/>'
      : face.eyes === 'happy' ? '<path d="M70 110 Q80 98 90 110 M110 110 Q120 98 130 110" stroke="#2a2a2a" stroke-width="5" fill="none" stroke-linecap="round"/>'
      : '<circle cx="80" cy="106" r="12" fill="#fff"/><circle cx="120" cy="106" r="12" fill="#fff"/><circle cx="82" cy="108" r="7" fill="#2a2a2a"/><circle cx="122" cy="108" r="7" fill="#2a2a2a"/><circle cx="85" cy="104" r="2.5" fill="#fff"/><circle cx="125" cy="104" r="2.5" fill="#fff"/>';
    const mouth = {smile: '<path d="M86 132 Q100 146 114 132" stroke="#2a2a2a" stroke-width="5" fill="none" stroke-linecap="round"/>',
      flat: '<path d="M88 136 L112 136" stroke="#2a2a2a" stroke-width="5" stroke-linecap="round"/>',
      sad: '<path d="M86 142 Q100 130 114 142" stroke="#2a2a2a" stroke-width="5" fill="none" stroke-linecap="round"/>',
      open: '<ellipse cx="100" cy="137" rx="12" ry="10" fill="#7a2a2a"/><ellipse cx="100" cy="141" rx="7" ry="4" fill="#ff8fa0"/>',
      chew: '<ellipse cx="100" cy="136" rx="10" ry="4" fill="#7a2a2a"/>'}[face.mouth];
    const tuft = big ? `<path d="M100 50 Q96 30 110 22" stroke="${dk}" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="111" cy="20" r="8" fill="#f5c02e" stroke="#c9930a" stroke-width="2"/>` : '';
    return `<svg viewBox="0 0 200 200" aria-hidden="true">${tuft}
      <ellipse cx="100" cy="190" rx="62" ry="8" fill="rgba(0,0,0,.15)"/>
      <ellipse cx="62" cy="64" rx="14" ry="22" fill="${c}" stroke="${dk}" stroke-width="4" transform="rotate(-20 62 64)"/><ellipse cx="138" cy="64" rx="14" ry="22" fill="${c}" stroke="${dk}" stroke-width="4" transform="rotate(20 138 64)"/>
      <ellipse cx="74" cy="180" rx="18" ry="10" fill="${dk}"/><ellipse cx="126" cy="180" rx="18" ry="10" fill="${dk}"/>
      <ellipse cx="100" cy="120" rx="64" ry="60" fill="${c}" stroke="${dk}" stroke-width="5"/>
      <ellipse cx="100" cy="140" rx="36" ry="30" fill="${lt}" opacity=".8"/>
      <ellipse cx="66" cy="128" rx="10" ry="6" fill="#ff8fa0" opacity=".7"/><ellipse cx="134" cy="128" rx="10" ry="6" fill="#ff8fa0" opacity=".7"/>
      ${eyes}${mouth}</svg>`;
  }

  function start(root, opts){
    opts = opts || {};
    const big = opts.level === 'big';
    const needsHere = NEEDS.filter(n => big || n.k !== 'bad');
    const store = opts.storage || {get(){ return null; }, set(){}};
    let P = null;
    try{ P = JSON.parse(store.get('djur') || 'null'); }catch(e){}
    if(!P || !P.stage) P = {stage: 'choose'};
    const save = () => { P.last = Date.now(); try{ store.set('djur', JSON.stringify(P)); }catch(e){} };

    if(!document.getElementById('hd-css')){ const s = document.createElement('style'); s.id = 'hd-css'; s.textContent = CSS; document.head.append(s); }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'hd';
    root.append(el);

    let ac = null;
    function tone(freqs, vol, type, gap){
      if(!opts.sound) return;
      try{ ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        freqs.forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * (gap || 0.09);
          o.type = type || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.1, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
          o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.28); }); }catch(e){}
    }
    function say(text){
      if(!opts.sound || !window.speechSynthesis) return;
      try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'sv-SE'; u.rate = 1;
        const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.replace('_', '-').startsWith('sv')); if(v) u.voice = v; speechSynthesis.speak(u); }catch(e){}
    }
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };

    // ---------- Välj ägg, kläck, namnge ----------
    function showChoose(){
      el.innerHTML = `<div class="hd-top"><div class="hd-title">Husdjuret</div></div>
        <div class="hd-pick"><div class="big">Välj ett ägg!</div><div class="hd-eggs" role="group" aria-label="Ägg"></div></div>`;
      const box = el.querySelector('.hd-eggs');
      EGGS.forEach((c, i) => { const b = document.createElement('button'); b.type = 'button'; b.innerHTML = eggSvg(c, 0); b.setAttribute('aria-label', 'Ägg ' + (i + 1));
        b.addEventListener('click', () => { P = {stage: 'egg', color: c, taps: 0}; save(); tone([523, 659]); showEgg(); }); box.append(b); });
      say('Välj ett ägg!');
    }
    function showEgg(){
      el.innerHTML = `<div class="hd-top"><div class="hd-title">Husdjuret</div></div>
        <div class="hd-pick"><div class="big">Knacka på ägget!</div><div class="hd-egg" role="button" tabindex="0" aria-label="Knacka på ägget">${eggSvg(P.color, P.taps || 0)}</div></div>`;
      const egg = el.querySelector('.hd-egg');
      const knock = () => {
        P.taps = (P.taps || 0) + 1; save();
        egg.classList.remove('wobble'); void egg.offsetWidth; egg.classList.add('wobble');
        tone([300 + P.taps * 80], 0.12, 'square');
        if(P.taps >= 4){ tone([523, 659, 784, 1047], 0.12); P.stage = 'name'; save(); later(showName, 500); return; }
        egg.innerHTML = eggSvg(P.color, Math.min(3, P.taps));
      };
      egg.addEventListener('click', knock);
      egg.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); knock(); } });
    }
    function showName(){
      el.innerHTML = `<div class="hd-top"><div class="hd-title">Husdjuret</div></div>
        <div class="hd-pick"><div class="hd-pet" style="position:relative;left:auto;bottom:auto;transform:none;width:min(30vh,200px)">${petSvg(P.color, {eyes: 'open', mouth: 'open'}, false)}</div>
        <div class="big">Vad ska djuret heta?</div><div class="hd-names" role="group" aria-label="Namn"></div></div>`;
      say('Hej! Vad ska jag heta?');
      const box = el.querySelector('.hd-names');
      NAMES.forEach(n => { const b = document.createElement('button'); b.type = 'button'; b.textContent = n;
        b.addEventListener('click', () => { P = {stage: 'baby', color: P.color, name: n, care: 0, needs: {mat: 60, lek: 70, somn: 80, bad: 80}}; save(); say(n + '!'); tone([659, 784, 1047]); showRoom(); });
        b.addEventListener('pointerenter', () => {}); box.append(b); });
    }

    // ---------- Rummet ----------
    let sleeping = false, mode = null, sleepTimer = null, decayTimer = null, faceOverride = null, happyCalled = false;
    function decay(){
      const now = Date.now(), hours = Math.min(24, Math.max(0, (now - (P.last || now)) / 3600000));
      const evening = new Date().getHours() >= 19, k = big ? 1 : 0.6;
      needsHere.forEach(n => { const r = DECAY[n.k] * k * (n.k === 'somn' && evening ? 1.8 : 1); P.needs[n.k] = Math.max(5, P.needs[n.k] - r * hours); });
      if(!sleeping) save(); else P.last = now;
    }
    function face(){
      if(faceOverride) return faceOverride;
      if(sleeping) return {eyes: 'closed', mouth: 'flat'};
      const v = needsHere.map(n => P.needs[n.k]), avg = v.reduce((a, b) => a + b, 0) / v.length;
      return avg >= 65 ? {eyes: 'open', mouth: 'smile'} : avg >= 40 ? {eyes: 'open', mouth: 'flat'} : {eyes: 'open', mouth: 'sad'};
    }
    function showRoom(){
      el.innerHTML = `<div class="hd-top"><div class="hd-title"></div><div class="hd-needs"></div></div>
        <div class="hd-room"><div class="win"></div><div class="hd-bubble"></div><div class="hd-pet idle" role="button" tabindex="0"></div><div class="hd-msg" aria-live="polite"></div></div>
        <div class="hd-acts" role="group" aria-label="Ta hand om djuret"></div>`;
      el.querySelector('.hd-title').textContent = P.name;
      const acts = el.querySelector('.hd-acts');
      [{k: 'mat', icon: '🍎', t: 'Mata'}, {k: 'lek', icon: '⚽', t: 'Leka'}, {k: 'somn', icon: '💤', t: 'Sova'}, {k: 'bad', icon: '🛁', t: 'Bada'}].filter(a => big || a.k !== 'bad').forEach(a => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'hd-act'; b.dataset.k = a.k; b.setAttribute('aria-pressed', 'false');
        b.innerHTML = `<span>${a.icon}</span>${a.t}`; b.addEventListener('click', () => setMode(a.k)); acts.append(b);
      });
      const pet = el.querySelector('.hd-pet');
      pet.addEventListener('pointerdown', e => petTouch(e));
      pet.addEventListener('pointermove', e => { if(mode === 'bad' && e.buttons) scrub(e); });
      pet.setAttribute('aria-label', 'Klappa ' + P.name);
      decay(); paint();
      clearInterval(decayTimer); decayTimer = setInterval(() => { decay(); paint(); }, 20000);
    }
    function paint(){
      const pet = el.querySelector('.hd-pet'); if(!pet) return;
      pet.classList.toggle('baby', P.stage === 'baby');
      pet.innerHTML = petSvg(P.color, face(), P.stage === 'big');
      el.querySelector('.hd-needs').innerHTML = needsHere.map(n => { const v = P.needs[n.k], col = v >= 60 ? '#43b55a' : v >= 35 ? '#f5c02e' : '#e8473c';
        return `<div class="hd-need" title="${n.name}" aria-label="${n.name}: ${Math.round(v)} procent">${n.icon}<div class="hd-bar"><i style="width:${v}%;background:${col}"></i></div></div>`; }).join('');
      // Pratbubblan visar det djuret helst vill ha, när något behov är lågt.
      const low = needsHere.filter(n => P.needs[n.k] < 40).sort((a, b) => P.needs[a.k] - P.needs[b.k])[0];
      el.querySelector('.hd-bubble').textContent = !sleeping && !mode && low ? low.icon : '';
      el.querySelector('.hd-room').classList.toggle('night', sleeping);
      if(!happyCalled && needsHere.every(n => P.needs[n.k] >= 80)){ happyCalled = true; msg(P.name + ' är jättenöjd!', 1800); if(typeof opts.onFinish === 'function') opts.onFinish(); }
    }
    let msgTimer = null;
    function msg(t, ms){ const m = el.querySelector('.hd-msg'); if(!m) return; m.textContent = t; m.classList.add('on'); clearTimeout(msgTimer); msgTimer = later(() => m.classList.remove('on'), ms || 1500); }
    function bump(k, v){ P.needs[k] = Math.max(5, Math.min(100, P.needs[k] + v)); }
    function cared(){
      P.care = (P.care || 0) + 1;
      if(P.stage === 'baby' && P.care >= GROW_AT){
        P.stage = 'big'; save(); paint(); tone([523, 659, 784, 1047, 1319], 0.12);
        later(() => { msg(P.name + ' har vuxit! 🎉', 2600); say(P.name + ' har vuxit!'); }, 300);
        if(typeof opts.onFinish === 'function') opts.onFinish();
      }else save();
    }
    function animate(cls){ const pet = el.querySelector('.hd-pet'); pet.classList.remove('jump', 'shake'); void pet.offsetWidth; pet.classList.add(cls); }
    function room(){ return el.querySelector('.hd-room'); }
    function clearMode(){
      room().querySelectorAll('.hd-tray,.hd-ball').forEach(x => x.remove());
      if(sleeping) wake();
      mode = null; el.querySelectorAll('.hd-act').forEach(b => b.setAttribute('aria-pressed', 'false'));
    }
    function setMode(k){
      const was = mode; clearMode(); if(was === k){ paint(); return; }
      mode = k; el.querySelector(`.hd-act[data-k="${k}"]`).setAttribute('aria-pressed', 'true');
      if(k === 'mat') showFood();
      if(k === 'lek') showBall();
      if(k === 'somn') sleep();
      if(k === 'bad'){ msg('Gnugga på ' + P.name + '!', 1500); }
      paint();
    }
    // Mata: välj mat, som flyger till munnen.
    function showFood(){
      const tray = document.createElement('div'); tray.className = 'hd-tray';
      [['🍎', 30, 0], ['🥕', 30, 0], ['🍌', 30, 0], ['🍪', 20, 6]].forEach(([e, mat, lek]) => {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = e; b.setAttribute('aria-label', 'Ge ' + e);
        b.addEventListener('click', () => feed(b, e, mat, lek)); tray.append(b);
      });
      room().append(tray);
    }
    function feed(btn, e, mat, lek){
      if(P.needs.mat >= 95){ animate('shake'); faceOverride = {eyes: 'open', mouth: 'flat'}; paint(); msg('Jag är mätt!'); say('Jag är mätt!'); later(() => { faceOverride = null; paint(); }, 900); return; }
      const r = room().getBoundingClientRect(), b = btn.getBoundingClientRect(), pet = el.querySelector('.hd-pet').getBoundingClientRect();
      const f = document.createElement('div'); f.className = 'hd-fly'; f.textContent = e;
      f.style.left = (b.left - r.left) + 'px'; f.style.top = (b.top - r.top) + 'px'; room().append(f);
      faceOverride = {eyes: 'open', mouth: 'open'}; paint();
      requestAnimationFrame(() => requestAnimationFrame(() => { f.style.left = (pet.left - r.left + pet.width * 0.42) + 'px'; f.style.top = (pet.top - r.top + pet.height * 0.55) + 'px'; f.style.transform = 'scale(.4)'; }));
      later(() => {
        f.remove(); let n = 0;
        const chew = () => { faceOverride = {eyes: 'happy', mouth: n % 2 ? 'open' : 'chew'}; paint(); tone([220 + n * 20], 0.06, 'triangle'); if(++n < 6) later(chew, 160); else { faceOverride = null; bump('mat', mat); bump('lek', lek); cared(); paint(); tone([659, 880]); } };
        chew();
      }, 720);
    }
    // Leka: tryck på bollen så studsar den och djuret hoppar efter.
    function showBall(){
      const ball = document.createElement('div'); ball.className = 'hd-ball'; ball.textContent = '⚽'; ball.setAttribute('role', 'button'); ball.setAttribute('aria-label', 'Kasta bollen');
      const place = () => { ball.style.left = (15 + Math.random() * 65) + '%'; ball.style.top = (20 + Math.random() * 25) + '%'; };
      place(); room().append(ball);
      ball.addEventListener('click', () => {
        ball.style.top = '2%'; animate('jump'); faceOverride = {eyes: 'happy', mouth: 'open'}; paint(); tone([523, 784], 0.1);
        bump('lek', 12); bump('somn', -2); cared(); later(() => { faceOverride = null; paint(); place(); }, 650);
      });
    }
    // Sova: rummet blir mörkt och sömnen fylls på.
    function sleep(){
      sleeping = true; paint(); say('God natt, ' + P.name); tone([392, 330, 262], 0.07, 'sine', 0.35);
      clearInterval(sleepTimer);
      sleepTimer = setInterval(() => {
        bump('somn', 5); paint();
        const z = document.createElement('div'); z.className = 'hd-z'; z.textContent = 'Z'; const pet = el.querySelector('.hd-pet');
        z.style.left = (pet.offsetLeft + pet.offsetWidth * 0.6) + 'px'; z.style.top = (pet.offsetTop + pet.offsetHeight * 0.1) + 'px'; room().append(z); later(() => z.remove(), 2500);
        if(P.needs.somn >= 100){ cared(); setMode('somn'); msg(P.name + ' är utvilad!'); }
      }, 1000);
    }
    function wake(){ sleeping = false; clearInterval(sleepTimer); paint(); }
    // Bada: gnugga på djuret så kommer bubblor.
    let lastScrub = 0;
    function scrub(e){
      const now = performance.now(); if(now - lastScrub < 90) return; lastScrub = now;
      const r = room().getBoundingClientRect(), b = document.createElement('div'); b.className = 'hd-bub';
      b.style.left = (e.clientX - r.left - 13) + 'px'; b.style.top = (e.clientY - r.top - 13) + 'px'; b.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
      room().append(b); later(() => b.remove(), 1600);
      const before = P.needs.bad; bump('bad', 3); tone([600 + Math.random() * 400], 0.04);
      if(before < 100 && P.needs.bad >= 100){ cared(); msg('Ren och fin!'); say('Ren och fin!'); faceOverride = {eyes: 'happy', mouth: 'smile'}; later(() => { faceOverride = null; paint(); }, 1200); }
      paint();
    }
    // Klappa: ett tryck på djuret när inget annat pågår.
    function petTouch(e){
      if(mode === 'bad'){ scrub(e); return; }
      if(sleeping) return;
      animate('jump'); faceOverride = {eyes: 'happy', mouth: 'open'}; paint(); tone([784, 988], 0.08); bump('lek', 3); save();
      later(() => { faceOverride = null; paint(); }, 600);
    }

    if(P.stage === 'choose') showChoose(); else if(P.stage === 'egg') showEgg(); else if(P.stage === 'name') showName(); else showRoom();

    return {
      stop(){ timers.forEach(clearTimeout); clearInterval(sleepTimer); clearInterval(decayTimer); if(P.needs){ P.last = Date.now(); try{ store.set('djur', JSON.stringify(P)); }catch(e){} }
        try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){} try{ if(ac) ac.close(); }catch(e){} root.innerHTML = ''; }
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'husdjuret', title: 'Husdjuret', icon: '🐣',
    about: 'Välj ett ägg, knacka tills det kläcks och ge djuret ett namn. Mata, lek, natta och (på stor nivå) bada det. Djuret dör aldrig och blir aldrig sjukt, växer när man tar hand om det och sparas mellan resorna.',
    start
  });
})();
