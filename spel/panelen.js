/* Kontrollpanelen – en "busy board" där reglagen (knappar, vred, brytare, spak, reglage, knappsats) och
   det de styr (lampor, fläkt, varningsljus, klocka, trafikljus, kugghjul, lysdioder, visare, display)
   ligger på två paneler: lampor och maskiner överst, knappar och reglage under. Kopplingen och placeringen
   är fasta, men reglagen ligger i en annan ordning än det de styr, så barnet får prova sig fram; brickan
   som påverkas blinkar kort. Liten nivå: 8 + 8 brickor. Stor: 14 + 14.
   Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.pn{height:100%;display:flex;flex-direction:column;gap:10px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.pn-top{display:flex;align-items:center;gap:10px;min-height:44px;flex-wrap:wrap}
.pn-title{font-size:1.7rem;font-weight:800;line-height:1;margin-right:auto}
.pn-btn{border:2px solid var(--line,#C6D1DF);background:var(--card,#fff);color:inherit;font:inherit;font-weight:700;border-radius:999px;padding:5px 14px;cursor:pointer}
.pn-board{flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:12px}
.pn-panel{border-radius:24px;padding:10px 12px 12px;background:linear-gradient(145deg,#5b6470,#3f4650);box-shadow:inset 0 0 0 4px #2e343c;display:flex;flex-direction:column;gap:8px}
.pn-panel.pn-ctlp{background:linear-gradient(145deg,#3a4250,#272d37)}
.pn-plabel{align-self:flex-start;font-weight:800;font-size:.85rem;letter-spacing:1px;color:#fff;background:#1D2842;border-radius:8px;padding:3px 12px}
.pn-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--t,112px),1fr));grid-auto-rows:var(--t,112px);grid-auto-flow:dense;gap:10px}
.pn-board{--t:96px}
.pn-board:not(.pn-small) .pn-tile > *{transform:scale(.86)}
.pn-board.pn-small{--t:120px;justify-content:center}
.pn-tile{position:relative;border-radius:16px;background:linear-gradient(160deg,#d9dde3,#b9bec6);box-shadow:inset 0 0 0 3px #8a929c,0 3px 0 #2e343c;
  display:flex;align-items:center;justify-content:center;gap:8px;touch-action:none;transition:box-shadow .2s}
.pn-tile.w2{grid-column:span 2}.pn-tile.h2{grid-row:span 2}
.pn-tile::before,.pn-tile::after{content:"";position:absolute;top:7px;width:7px;height:7px;border-radius:50%;background:#8a929c;box-shadow:inset 1px 1px 0 #5b6470}
.pn-tile::before{left:7px}.pn-tile::after{right:7px}
.pn-tile.hit{animation:pn-hit .8s ease-out}
.pn-board.pn-small .pn-tile > *{transform:scale(1.15)}
.pn-push{width:58px;height:58px;border-radius:14px;border:0;cursor:pointer;box-shadow:inset 0 -7px 0 rgba(0,0,0,.28),inset 0 3px 0 rgba(255,255,255,.35),0 0 0 4px #2e343c,0 4px 0 4px #1d2128;transition:transform .06s;font-size:1.5rem}
.pn-push:active{transform:translateY(3px);box-shadow:inset 0 -3px 0 rgba(0,0,0,.25)}
.pn-bulb{width:56px;height:56px;border-radius:50%;position:relative;background:radial-gradient(circle at 50% 55%,#8a929c,#5b6470);
  box-shadow:0 0 0 5px #e3e7ec,0 0 0 8px #8a929c,0 0 0 10px #4a525d;transition:background .15s,box-shadow .15s}
.pn-bulb::after{content:"";position:absolute;left:12px;top:9px;width:16px;height:10px;border-radius:50%;background:rgba(255,255,255,.55);transform:rotate(-25deg)}
.pn-bulb.on{background:radial-gradient(circle at 50% 55%,#fff,var(--c) 55%);box-shadow:0 0 0 5px #e3e7ec,0 0 0 8px #8a929c,0 0 0 10px #4a525d,0 0 26px 12px var(--c)}
.pn-sw{width:44px;height:80px;border-radius:10px;border:0;cursor:pointer;background:#4a525d;position:relative;box-shadow:inset 0 0 0 3px #2e343c}
.pn-sw i{position:absolute;left:8px;right:8px;height:30px;border-radius:7px;background:linear-gradient(#f4f6f8,#b9bec6);top:42px;transition:top .12s;box-shadow:0 2px 0 #2e343c}
.pn-sw.on i{top:8px}
.pn-big{width:88px;height:88px;border-radius:50%;border:0;cursor:pointer;background:radial-gradient(circle at 40% 35%,#ff7a6e,#c9342a 70%);box-shadow:inset 0 -8px 0 rgba(0,0,0,.25),0 0 0 6px #f5c02e,0 0 0 9px #222}
.pn-big:active{transform:scale(.95)}
.pn-knob{width:92px;height:92px;cursor:grab;touch-action:none}
.pn-led{width:20px;height:16px;border-radius:5px;background:#2a3a2a;box-shadow:0 0 0 2px #2e343c}
.pn-led.on{box-shadow:0 0 10px 3px var(--c),0 0 0 2px #2e343c;background:var(--c)}
.pn-key{width:44px;height:40px;border-radius:10px;border:0;cursor:pointer;background:linear-gradient(#f4f6f8,#cfd5dd);font:inherit;font-weight:900;font-size:1.2rem;color:#1D2842;box-shadow:0 3px 0 #6f7882}
.pn-key:active{transform:translateY(2px);box-shadow:0 1px 0 #6f7882}
.pn-disp{font-family:ui-monospace,Menlo,monospace;font-size:2.2rem;font-weight:800;color:#5dfc7a;background:#0e1a12;border-radius:8px;padding:6px 16px;letter-spacing:8px;text-align:center;box-shadow:inset 0 0 0 3px #2e343c}
.pn-slider{width:64px;height:190px;touch-action:none;cursor:pointer}
.pn-bell.ring{animation:pn-ring .7s ease}
.pn-secret{font-weight:800;background:#fff3c4;border-radius:999px;padding:4px 12px;box-shadow:inset 0 0 0 2px #f5c02e}
.pn-secret.pop{animation:pn-pop .6s ease}
@keyframes pn-pop{0%,100%{transform:scale(1)}40%{transform:scale(1.25)}}
.pn-power{display:flex;flex-direction:column;align-items:center;gap:2px}
.pn-power .w{font-family:ui-monospace,Menlo,monospace;font-weight:800;font-size:1.1rem;color:#1D2842}
.pn-fuse{width:70px;height:86px;border:0;border-radius:12px;cursor:pointer;background:#2e343c;color:#fff;font:inherit;font-weight:900;font-size:.8rem;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;box-shadow:inset 0 0 0 3px #1d2128}
.pn-fuse i{width:30px;height:30px;border-radius:6px;background:#3fe06a;box-shadow:0 0 10px 3px #3fe06a}
.pn-fuse.trip i{background:#ff4a3a;box-shadow:0 0 14px 5px #ff4a3a}
.pn-fuse.trip{animation:pn-glow 1s ease-in-out infinite}
@keyframes pn-glow{0%,100%{box-shadow:inset 0 0 0 3px #1d2128,0 0 0 0 rgba(255,74,58,0)}50%{box-shadow:inset 0 0 0 3px #1d2128,0 0 18px 6px rgba(255,74,58,.8)}}
.pn-board.dark .pn-panel.pn-outp{filter:brightness(.55)}
.pn-key2{width:84px;height:84px;cursor:pointer;border:0;background:none;padding:0}
.pn-key2 .kk{transition:transform .25s ease}
.pn-key2.on .kk{transform:rotate(90deg)}
.pn-keytile.hint{animation:pn-hint 1.6s ease-in-out infinite}
@keyframes pn-hint{0%,100%{box-shadow:inset 0 0 0 3px #8a929c,0 3px 0 #2e343c}50%{box-shadow:inset 0 0 0 3px #f5c02e,0 0 14px 4px rgba(245,192,46,.7)}}
.pn-done{position:absolute;left:50%;top:14%;transform:translateX(-50%);background:#fff;border-radius:16px;padding:10px 20px;font-weight:800;font-size:1.3rem;box-shadow:0 6px 20px rgba(0,0,0,.25);opacity:0;transition:opacity .3s;pointer-events:none;z-index:5;text-align:center}
.pn-done.on{opacity:1}
.pn button:focus-visible,.pn [tabindex]:focus-visible{outline:3px solid #fff;outline-offset:3px}
@keyframes pn-hit{0%{box-shadow:inset 0 0 0 3px #8a929c,0 0 0 0 #fff8b0}30%{box-shadow:inset 0 0 0 3px #f5c02e,0 0 0 8px #fff8b0}100%{box-shadow:inset 0 0 0 3px #8a929c,0 0 0 0 rgba(255,248,176,0)}}
@keyframes pn-ring{0%,100%{transform:rotate(0)}15%{transform:rotate(18deg)}35%{transform:rotate(-16deg)}55%{transform:rotate(12deg)}75%{transform:rotate(-8deg)}}
@media (prefers-reduced-motion: reduce){ .pn-bell.ring,.pn-tile.hit{animation:none} }`;

  const SVGNS = 'http://www.w3.org/2000/svg';
  // Placeringen är fast: samma "slumpade" ordning för reglagen varje gång (fast frö), så panelen ser
  // likadan ut och barnet kan lära sig den.
  function fixedOrder(a, seed){ let x = seed; const r = () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648;
    for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  // Färger för lamporna och för knapparna. Kopplingen är fast, men knappens färg är inte lampans färg,
  // så det syns inte förrän man provar.
  const LAMP = ['#ff4a3a', '#3b8bff', '#ffd23a', '#3fe06a', '#ffffff', '#ff9a2e'];
  const BTN = ['#e8473c', '#2f6fd6', '#f5c02e', '#2fa84a', '#9a5bd6', '#2bb3b1', '#f28a2e', '#ff7ab0'];

  function start(root, opts){
    opts = opts || {};
    const big = opts.level === 'big';
    if(!document.getElementById('pn-css2')){
      const old = document.getElementById('pn-css'); if(old) old.remove();
      const s = document.createElement('style'); s.id = 'pn-css2'; s.textContent = CSS; document.head.append(s);
    }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'pn';
    el.innerHTML = `<div class="pn-top"><div class="pn-title">Kontrollpanelen</div><div class="pn-secret" aria-live="polite"></div><button type="button" class="pn-btn" data-a="off">Stäng av allt</button></div>
      <div class="pn-board"><section class="pn-panel pn-outp" aria-label="Lampor och maskiner"><div class="pn-plabel">LAMPOR OCH MASKINER</div><div class="pn-grid"></div></section>
        <section class="pn-panel pn-ctlp" aria-label="Knappar och reglage"><div class="pn-plabel">KNAPPAR OCH REGLAGE</div><div class="pn-grid"></div></section></div><div class="pn-done" aria-live="polite">Du har provat allt! 🎉</div>`;
    root.append(el);
    const board = el.querySelector('.pn-board'), doneEl = el.querySelector('.pn-done');
    const outGrid = el.querySelector('.pn-panel.pn-outp .pn-grid'), ctlGrid = el.querySelector('.pn-panel.pn-ctlp .pn-grid');
    board.classList.toggle('pn-small', !big);   // eget klassnamn: 'small' används av spellabbet

    // ---------- Ljud ----------
    let ac = null, master = null;
    function ctx(){
      if(!opts.sound) return null;
      try{
        if(!ac){ ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createDynamicsCompressor(); master.connect(ac.destination); }
        if(ac.state === 'suspended') ac.resume();
        return ac;
      }catch(e){ return null; }
    }
    function tone(f, dur, type, vol, delay){
      const a = ctx(); if(!a) return;
      const t = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain();
      o.type = type || 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.2));
      o.connect(g).connect(master); o.start(t); o.stop(t + (dur || 0.2) + 0.02);
    }
    const click = () => { tone(1800, 0.03, 'square', 0.05); tone(900, 0.04, 'square', 0.04, 0.02); };
    function say(text){
      if(!opts.sound || !window.speechSynthesis) return;
      try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'sv-SE'; u.rate = 1;
        const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.replace('_', '-').startsWith('sv')); if(v) u.voice = v; speechSynthesis.speak(u); }catch(e){}
    }
    let noise = null;
    const noiseBuf = a => { if(noise) return noise; noise = a.createBuffer(1, a.sampleRate * 2, a.sampleRate); const d = noise.getChannelData(0); for(let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return noise; };
    // Ljud som låter så länge något är igång (fläkt, motor). set(0–1) ändrar styrkan.
    function loop(kind){
      let src = null, g = null, f = null;
      return {
        set(k){
          const a = ctx(); if(!a) return;
          if(!src && k > 0){
            g = a.createGain(); g.gain.value = 0.0001; g.connect(master); f = a.createBiquadFilter();
            if(kind === 'fan'){ src = a.createBufferSource(); src.buffer = noiseBuf(a); src.loop = true; f.type = 'bandpass'; f.Q.value = 0.8; }
            else { src = a.createOscillator(); src.type = 'sawtooth'; src.frequency.value = 55; f.type = 'lowpass'; f.frequency.value = 260; }
            src.connect(f).connect(g); src.start();
          }
          if(!src) return;
          const t = a.currentTime;
          if(kind === 'fan') f.frequency.setTargetAtTime(400 + k * 900, t, 0.1);
          g.gain.setTargetAtTime(k > 0 ? (kind === 'fan' ? 0.04 + k * 0.08 : 0.06) : 0.0001, t, 0.12);
          if(k <= 0){ const s = src; src = null; setTimeout(() => { try{ s.stop(); }catch(e){} }, 600); }
        }
      };
    }

    // ---------- Brickor ----------
    let outTiles = [], ctlTiles = [], tiles = [], spin = [], resets = [], controls = 0, used = new Set(), allDone = false, sounds = [];
    function tile(cls){ const t = document.createElement('div'); t.className = 'pn-tile' + (cls ? ' ' + cls : ''); tiles.push(t); outTiles.push(t); return t; }
    function ctile(cls){ const t = document.createElement('div'); t.className = 'pn-tile' + (cls ? ' ' + cls : ''); tiles.push(t); ctlTiles.push(t); return t; }
    // Brickan som påverkas blinkar kort, så att barnet ser vad som hände.
    const hit = t => { t.classList.remove('hit'); void t.offsetWidth; t.classList.add('hit'); };
    function use(id){
      used.add(id);
      if(!allDone && used.size === controls){
        allDone = true; doneEl.classList.add('on'); say('Du har provat allt!');
        [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'sine', 0.1, i * 0.1));
        setTimeout(() => doneEl.classList.remove('on'), 2600);
        if(typeof opts.onFinish === 'function') opts.onFinish();
      }
    }
    const svgEl = (w, h, inner, cls) => { const s = document.createElementNS(SVGNS, 'svg'); s.setAttribute('viewBox', `0 0 ${w} ${h}`); s.setAttribute('width', w); s.setAttribute('height', h); s.setAttribute('aria-hidden', 'true'); if(cls) s.setAttribute('class', cls); s.innerHTML = inner; return s; };

    // --- Det som styrs ---
    function outBulb(color){
      const t = tile(), b = document.createElement('div'); b.className = 'pn-bulb'; b.style.setProperty('--c', color); t.append(b);
      let cur = '';
      const o = {t, base: color, disco: false, on: false,
        // apply: tänd/släckt, färg och disco. Brickan blinkar bara när något faktiskt ändras.
        apply(on, c, disco){ const key = on + c + disco; o.on = on; o.disco = on && disco; if(!disco) b.style.setProperty('--c', c); b.classList.toggle('on', on); if(key !== cur){ if(cur) hit(t); cur = key; } },
        el: b, reset(){ cur = ''; o.on = false; o.disco = false; b.classList.remove('on'); b.style.setProperty('--c', color); }};
      return o;
    }
    function outFan(){
      const t = tile();
      const s = svgEl(96, 96, `<circle cx="48" cy="48" r="44" fill="#eef1f5" stroke="#4a525d" stroke-width="4"/><g class="b">${[0, 90, 180, 270].map(d => `<path transform="rotate(${d} 48 48)" d="M48 48 Q40 20 48 10 Q62 18 52 46 Z" fill="#2f6fd6" stroke="#1f4e8c" stroke-width="2"/>`).join('')}</g><circle cx="48" cy="48" r="7" fill="#4a525d"/>${Array.from({length: 8}, (_, i) => `<line x1="48" y1="4" x2="48" y2="92" transform="rotate(${i * 22.5} 48 48)" stroke="#4a525d" stroke-width="1.2" opacity=".35"/>`).join('')}`);
      t.append(s);
      const sp = {el: s.querySelector('.b'), speed: 0, target: 0, angle: 0, cx: 48, cy: 48}; spin.push(sp);
      const snd = loop('fan'); sounds.push(snd);
      let lv = 0, tint = '';
      const blades = s.querySelectorAll('.b path');
      return {t, level(v){ if(v === lv) return; lv = v; sp.target = [0, 220, 520, 900][v]; snd.set(v / 3); hit(t); },
        tint(c){ if(c === tint) return; tint = c; blades.forEach(p => { p.setAttribute('fill', c || '#2f6fd6'); p.setAttribute('stroke', c ? '#1f6b2f' : '#1f4e8c'); }); if(c) hit(t); },
        reset(){ lv = 0; sp.target = 0; snd.set(0); this.tint(''); }};
    }
    function outBeacon(){
      const t = tile();
      const s = svgEl(80, 90, `<rect x="10" y="70" width="60" height="14" rx="4" fill="#2e343c"/><path class="dome" d="M14 70 Q14 18 40 18 Q66 18 66 70 Z" fill="#8a2a24" stroke="#222" stroke-width="3"/><g class="rays" opacity="0"><path d="M40 44 L-10 20 L-10 68 Z M40 44 L90 20 L90 68 Z" fill="#ff5a4a" opacity=".55"/></g>`);
      s.style.overflow = 'visible'; t.append(s);
      const dome = s.querySelector('.dome'), rays = s.querySelector('.rays'), sp = {el: rays, speed: 0, target: 0, angle: 0, cx: 40, cy: 44}; spin.push(sp);
      let timer = null, firing = false, police = false;
      const ray = s.querySelector('.rays path');
      const look = () => {
        if(police){ dome.setAttribute('fill', '#3b8bff'); ray.setAttribute('fill', '#3b8bff'); rays.setAttribute('opacity', '1'); sp.target = 360; }
        else if(firing){ dome.setAttribute('fill', '#ff4a3a'); ray.setAttribute('fill', '#ff5a4a'); rays.setAttribute('opacity', '1'); sp.target = 540; }
        else { dome.setAttribute('fill', '#8a2a24'); rays.setAttribute('opacity', '0'); sp.target = 0; sp.speed = 0; }
      };
      const off = () => { firing = false; look(); };
      return {t, active: () => firing || police,
        police(on){ if(on === police) return; police = on; look(); hit(t); },
        fire(){
        clearTimeout(timer); hit(t); firing = true; look(); sp.speed = 540;
        const a = ctx(); if(a){ const tt = a.currentTime, o = a.createOscillator(), g = a.createGain(); o.type = 'triangle';
          for(let i = 0; i < 6; i++){ o.frequency.setValueAtTime(600, tt + i * 0.5); o.frequency.linearRampToValueAtTime(1000, tt + i * 0.5 + 0.25); o.frequency.linearRampToValueAtTime(600, tt + i * 0.5 + 0.5); }
          g.gain.setValueAtTime(0.0001, tt); g.gain.exponentialRampToValueAtTime(0.09, tt + 0.05); g.gain.setValueAtTime(0.09, tt + 2.8); g.gain.exponentialRampToValueAtTime(0.0001, tt + 3);
          o.connect(g).connect(master); o.start(tt); o.stop(tt + 3.05); }
        timer = setTimeout(() => { off(); update(); }, 3000);
      }, reset(){ clearTimeout(timer); police = false; off(); }};
    }
    function outBell(){
      const t = tile();
      const s = svgEl(80, 80, `<path d="M40 8 Q58 8 60 34 L64 56 L16 56 L20 34 Q22 8 40 8 Z" fill="#f5c02e" stroke="#8a6a10" stroke-width="3"/><circle cx="40" cy="64" r="7" fill="#c9930a"/><circle cx="40" cy="8" r="4" fill="#8a6a10"/>`, 'pn-bell');
      s.style.transformOrigin = '40px 10px'; t.append(s);
      return {t, ring(){ s.classList.remove('ring'); void s.getBoundingClientRect(); s.classList.add('ring'); hit(t); tone(880, 0.9, 'sine', 0.14); tone(698, 1.1, 'sine', 0.14, 0.45); }, reset(){}};
    }
    function outTraffic(){
      const t = tile('h2'), box = document.createElement('div');
      box.style.cssText = 'background:#222;border-radius:14px;padding:8px;display:flex;flex-direction:column;gap:8px';
      const cols = ['#ff4a3a', '#ffd23a', '#3fe06a'];
      cols.forEach(c => { const b = document.createElement('div'); b.className = 'pn-bulb'; b.style.setProperty('--c', c); box.append(b); });
      t.append(box);
      const bs = box.querySelectorAll('.pn-bulb'); let i = -1;
      const show = () => bs.forEach((b, j) => b.classList.toggle('on', j === i));
      return {t, get: () => i, next(){ i = (i + 1) % 3; show(); hit(t); tone([392, 523, 659][i], 0.2); say(['Stopp', 'Vänta', 'Kör'][i]); },
        dark(d){ bs.forEach((b, j) => b.classList.toggle('on', !d && j === i)); }, reset(){ i = -1; show(); }};
    }
    function outGears(){
      const t = tile();
      const gear = (cx, cy, r, n, col, cls) => `<g class="${cls}">${Array.from({length: n}, (_, i) => `<rect x="${cx - 4}" y="${cy - r - 6}" width="8" height="10" rx="2" fill="${col}" transform="rotate(${i * 360 / n} ${cx} ${cy})"/>`).join('')}<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.35}" fill="#2e343c"/></g>`;
      const s = svgEl(100, 84, gear(34, 44, 22, 10, '#f28a2e', 'g1') + gear(76, 38, 14, 7, '#2bb3b1', 'g2')); t.append(s);
      const a = {el: s.querySelector('.g1'), speed: 0, target: 0, angle: 0, cx: 34, cy: 44}, b = {el: s.querySelector('.g2'), speed: 0, target: 0, angle: 0, cx: 76, cy: 38};
      spin.push(a, b); const snd = loop('motor'); sounds.push(snd);
      let st = false;
      return {t, set(on){ if(on === st) return; st = on; a.target = on ? 160 : 0; b.target = on ? -230 : 0; snd.set(on ? 1 : 0); hit(t); }, reset(){ st = false; a.target = 0; b.target = 0; snd.set(0); }};
    }
    function outLeds(){
      const t = tile('h2'), col = document.createElement('div'); col.style.cssText = 'display:flex;flex-direction:column-reverse;gap:6px';
      const N = 8; for(let i = 0; i < N; i++){ const d = document.createElement('div'); d.className = 'pn-led'; d.style.setProperty('--c', i >= 6 ? '#ff5a4a' : i >= 4 ? '#ffd23a' : '#5dfc7a'); col.append(d); }
      t.append(col);
      const leds = col.querySelectorAll('.pn-led'); let lv = 0;
      // chase: ljusjakt, en lysdiod som springer upp och ned (körs från frame()).
      const o = {t, N, chase: false, set(v){ if(v === lv) return; lv = v; if(!o.chase) leds.forEach((d, i) => d.classList.toggle('on', i < v)); hit(t); },
        run(tt){ if(!o.chase) return; const p = Math.floor(tt / 90) % (2 * N - 2), k = p < N ? p : 2 * N - 2 - p; leds.forEach((d, i) => d.classList.toggle('on', Math.abs(i - k) <= 1)); },
        setChase(c){ if(c === o.chase) return; o.chase = c; hit(t); if(!c) leds.forEach((d, i) => d.classList.toggle('on', i < lv)); },
        level: () => lv, reset(){ lv = 0; o.chase = false; leds.forEach(d => d.classList.remove('on')); }};
      return o;
    }
    function outGauge(){
      const t = tile('w2');
      const s = svgEl(140, 90, `<path d="M10 80 A60 60 0 0 1 130 80 Z" fill="#fff" stroke="#4a525d" stroke-width="3"/><path d="M100 36 A60 60 0 0 1 125 72" stroke="#e8473c" stroke-width="7" fill="none"/>
        ${Array.from({length: 6}, (_, i) => { const a = Math.PI * (1 - i / 5); return `<line x1="${(70 + Math.cos(a) * 50).toFixed(1)}" y1="${(80 - Math.sin(a) * 50).toFixed(1)}" x2="${(70 + Math.cos(a) * 58).toFixed(1)}" y2="${(80 - Math.sin(a) * 58).toFixed(1)}" stroke="#1D2842" stroke-width="3"/>`; }).join('')}
        <line class="nd" x1="70" y1="80" x2="20" y2="80" stroke="#e8473c" stroke-width="4" stroke-linecap="round"/><circle cx="70" cy="80" r="7" fill="#222"/>`);
      t.append(s);
      const sp = {needle: s.querySelector('.nd'), value: 0, target: 0, shake: false, cx: 70, cy: 80, r: 50}; spin.push(sp);
      return {t, set(k){ if(k === sp.target) return; sp.target = k; hit(t); }, tremble(on){ sp.shake = on; }, reset(){ sp.target = 0; sp.shake = false; }};
    }
    function outDisplay(){
      const t = tile('w2'), d = document.createElement('div'); d.className = 'pn-disp'; d.textContent = '----'; t.append(d);
      let txt = '';
      const WORD = ['noll', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio'];
      return {t, key(k){
        hit(t);
        if(k === 'C'){ txt = ''; tone(300, 0.15, 'square', 0.05); }
        else if(k === '✓'){ if(txt === '123'){ secretCode(); d.textContent = 'HEJ!'; txt = ''; return; } if(txt){ say(String(+txt)); [659, 880].forEach((f, i) => tone(f, 0.18, 'sine', 0.1, i * 0.1)); } }
        else { txt = (txt + k).slice(-4); tone(700 + k * 40, 0.08, 'square', 0.05); say(WORD[k]); }
        d.textContent = txt.padStart(4, '-');
      }, used: () => txt.length > 0, dark(on){ d.style.opacity = on ? '.15' : ''; }, reset(){ txt = ''; d.textContent = '----'; d.style.opacity = ''; }};
    }
    // Kraftmätaren: visar hur många watt lamporna och maskinerna drar just nu.
    function outPower(max, limit){
      const t = tile('w2'), w = document.createElement('div'); w.className = 'pn-power';
      const s = svgEl(150, 86, `<path d="M12 78 A63 63 0 0 1 138 78 Z" fill="#fff" stroke="#4a525d" stroke-width="3"/>
        ${limit ? (() => { const a0 = Math.PI * (1 - limit / max); return `<path d="M${(75 + Math.cos(a0) * 57).toFixed(1)} ${(78 - Math.sin(a0) * 57).toFixed(1)} A57 57 0 0 1 132 78" stroke="#e8473c" stroke-width="7" fill="none"/>`; })() : ''}
        ${Array.from({length: 6}, (_, i) => { const a = Math.PI * (1 - i / 5); return `<line x1="${(75 + Math.cos(a) * 50).toFixed(1)}" y1="${(78 - Math.sin(a) * 50).toFixed(1)}" x2="${(75 + Math.cos(a) * 58).toFixed(1)}" y2="${(78 - Math.sin(a) * 58).toFixed(1)}" stroke="#1D2842" stroke-width="2.5"/>`; }).join('')}
        <text x="75" y="44" text-anchor="middle" font-size="16" font-weight="900" fill="#f5c02e" stroke="#8a6a10" stroke-width=".8" font-family="system-ui,sans-serif">⚡</text>
        <line class="nd" x1="75" y1="78" x2="25" y2="78" stroke="#1D2842" stroke-width="4" stroke-linecap="round"/><circle cx="75" cy="78" r="6" fill="#222"/>`);
      const lab = document.createElement('div'); lab.className = 'w'; lab.textContent = '0 W';
      w.append(s, lab); t.append(w);
      const sp = {needle: s.querySelector('.nd'), value: 0, target: 0, cx: 75, cy: 78, r: 50}; spin.push(sp);
      return {t, set(watt){ sp.target = Math.min(1, watt / max); lab.textContent = Math.round(watt) + ' W'; lab.style.color = limit && watt > limit * 0.85 ? '#c9342a' : ''; }, reset(){ sp.target = 0; lab.textContent = '0 W'; }};
    }

    // --- Reglagen ---
    function ctlPush(color, label, onPress){
      const t = ctile(), b = document.createElement('button'); b.type = 'button'; b.className = 'pn-push'; b.style.background = color; b.setAttribute('aria-label', label);
      b.addEventListener('click', () => { onPress(); use(label); }); t.append(b); controls++; return {t, reset(){}};
    }
    function ctlSwitch(label, onToggle){
      const t = ctile(), b = document.createElement('button'); b.type = 'button'; b.className = 'pn-sw'; b.innerHTML = '<i></i>'; b.setAttribute('aria-label', label); b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => { const on = !b.classList.contains('on'); b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); click(); onToggle(on); use(label); });
      t.append(b); controls++;
      return {t, reset(){ b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); }};
    }
    function ctlBig(label, onPress){
      const t = ctile(), b = document.createElement('button'); b.type = 'button'; b.className = 'pn-big'; b.setAttribute('aria-label', label);
      b.addEventListener('click', () => { onPress(); use(label); }); t.append(b); controls++; return {t, reset(){}};
    }
    // Vred: dra runt, eller tryck för ett steg i taget (efter sista läget börjar det om från noll).
    function ctlKnob(steps, label, onChange){
      const t = ctile(), s = document.createElementNS(SVGNS, 'svg');
      s.setAttribute('viewBox', '0 0 100 100'); s.setAttribute('class', 'pn-knob'); s.setAttribute('role', 'slider'); s.setAttribute('aria-label', label); s.setAttribute('tabindex', '0');
      const ang = i => -135 + i * 270 / (steps - 1);
      s.innerHTML = Array.from({length: steps}, (_, i) => { const a = (ang(i) - 90) * Math.PI / 180; return `<circle cx="${(50 + Math.cos(a) * 46).toFixed(1)}" cy="${(50 + Math.sin(a) * 46).toFixed(1)}" r="3.5" fill="#1D2842"/>`; }).join('')
        + `<circle cx="50" cy="50" r="36" fill="#2e343c"/><g class="k"><circle cx="50" cy="50" r="32" fill="#4a525d"/><rect x="46" y="20" width="8" height="26" rx="4" fill="#f5c02e"/></g>`;
      t.append(s); controls++;
      let v = 0;
      const show = () => { s.querySelector('.k').setAttribute('transform', `rotate(${ang(v)} 50 50)`); s.setAttribute('aria-valuenow', v); };
      const setV = (nv, quiet) => { nv = Math.max(0, Math.min(steps - 1, nv)); if(nv === v) return; v = nv; show(); if(!quiet){ click(); onChange(v); use(label); } };
      s.addEventListener('pointerdown', e => {
        e.preventDefault(); s.setPointerCapture && s.setPointerCapture(e.pointerId);
        const r = s.getBoundingClientRect(); let moved = false;
        const toStep = ev => { let a = Math.atan2(ev.clientX - (r.left + r.width / 2), -(ev.clientY - (r.top + r.height / 2))) * 180 / Math.PI;
          a = Math.max(-135, Math.min(135, a)); return Math.round((a + 135) / (270 / (steps - 1))); };
        const move = ev => { if(Math.hypot(ev.clientX - e.clientX, ev.clientY - e.clientY) > 8){ moved = true; setV(toStep(ev)); } };
        const up = () => { s.removeEventListener('pointermove', move); s.removeEventListener('pointerup', up); s.removeEventListener('pointercancel', up); if(!moved) setV(v >= steps - 1 ? 0 : v + 1); };
        s.addEventListener('pointermove', move); s.addEventListener('pointerup', up); s.addEventListener('pointercancel', up);
      });
      s.addEventListener('keydown', e => { if(e.key === 'ArrowRight' || e.key === 'ArrowUp') setV(v + 1); if(e.key === 'ArrowLeft' || e.key === 'ArrowDown') setV(v - 1); });
      show();
      return {t, reset(){ setV(0, true); }};
    }
    function ctlLever(label, onToggle){
      const t = ctile(), b = document.createElement('button'); b.type = 'button'; b.className = 'pn-sw'; b.style.height = '96px';
      b.innerHTML = '<i style="height:24px;border-radius:50%;background:radial-gradient(#ff7a6e,#c9342a)"></i>'; b.setAttribute('aria-label', label); b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => { const on = !b.classList.contains('on'); b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); tone(on ? 200 : 140, 0.12, 'square', 0.06); onToggle(on); use(label); });
      t.append(b); controls++;
      return {t, reset(){ b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); }};
    }
    function ctlSlider(steps, label, onChange){
      const t = ctile('h2'), s = document.createElementNS(SVGNS, 'svg');
      s.setAttribute('viewBox', '0 0 64 190'); s.setAttribute('class', 'pn-slider'); s.setAttribute('role', 'slider'); s.setAttribute('aria-label', label); s.setAttribute('tabindex', '0');
      s.innerHTML = `<rect x="26" y="12" width="12" height="166" rx="6" fill="#2e343c"/><g class="h"><rect x="6" y="0" width="52" height="24" rx="6" fill="#f4f6f8" stroke="#4a525d" stroke-width="3"/><line x1="14" y1="12" x2="50" y2="12" stroke="#4a525d" stroke-width="3"/></g>`;
      t.append(s); controls++;
      let v = 0, lastT = 0;
      const show = () => { s.querySelector('.h').setAttribute('transform', `translate(0 ${(166 - v * 166 / steps).toFixed(1)})`); s.setAttribute('aria-valuenow', v); };
      const setV = (nv, quiet) => { nv = Math.max(0, Math.min(steps, nv)); if(nv === v) return; v = nv; show(); if(quiet) return;
        const now = performance.now(); if(now - lastT > 60){ lastT = now; tone(260 + v * 70, 0.12, 'triangle', 0.08); } onChange(v); use(label); };
      s.addEventListener('pointerdown', e => {
        e.preventDefault(); s.setPointerCapture && s.setPointerCapture(e.pointerId);
        const at = ev => { const r = s.getBoundingClientRect(); return Math.round((1 - (ev.clientY - r.top - r.height * 0.06) / (r.height * 0.87)) * steps); };
        setV(at(e)); const move = ev => setV(at(ev));
        const up = () => { s.removeEventListener('pointermove', move); s.removeEventListener('pointerup', up); s.removeEventListener('pointercancel', up); };
        s.addEventListener('pointermove', move); s.addEventListener('pointerup', up); s.addEventListener('pointercancel', up);
      });
      s.addEventListener('keydown', e => { if(e.key === 'ArrowUp') setV(v + 1); if(e.key === 'ArrowDown') setV(v - 1); });
      show();
      return {t, reset(){ setV(0, true); }};
    }
    // Säkringen: slår ifrån när kraften blir för stor. Tryck för att slå på strömmen igen.
    // Den räknas inte bland reglagen man ska prova.
    function ctlFuse(onReset){
      const t = ctile(), b = document.createElement('button'); b.type = 'button'; b.className = 'pn-fuse'; b.innerHTML = '<i></i>SÄKRING'; b.setAttribute('aria-label', 'Säkring');
      b.addEventListener('click', () => { if(b.classList.contains('trip')) onReset(); else tone(300, 0.08, 'square', 0.05); });
      t.append(b);
      return {t, trip(on){ b.classList.toggle('trip', on); b.setAttribute('aria-label', on ? 'Säkringen har gått – tryck för att slå på' : 'Säkring'); }, reset(){ b.classList.remove('trip'); }};
    }
    // Nyckelbrytaren: slår på och av hela panelen. Av = ingenting fungerar. Räknas inte bland reglagen man
    // ska prova.
    function ctlKeySwitch(onTurn){
      const t = ctile('pn-keytile'), b = document.createElement('button'); b.type = 'button'; b.className = 'pn-key2'; b.setAttribute('aria-label', 'Nyckel: av'); b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<svg viewBox="0 0 84 84" width="84" height="84" aria-hidden="true">
        <text x="12" y="13" font-size="10" font-weight="900" fill="#1D2842" font-family="system-ui,sans-serif">AV</text>
        <text x="64" y="80" font-size="10" font-weight="900" fill="#1D2842" font-family="system-ui,sans-serif">PÅ</text>
        <circle class="led" cx="70" cy="12" r="6" fill="#2a3a2a" stroke="#2e343c" stroke-width="2"/>
        <circle cx="38" cy="44" r="27" fill="#c9a24a" stroke="#7a5f1c" stroke-width="3"/><circle cx="38" cy="44" r="19" fill="#e0bf6a" stroke="#9c7a2a" stroke-width="2"/>
        <g class="kk" style="transform-origin:38px 44px"><rect x="35" y="30" width="6" height="28" rx="2" fill="#2e343c"/>
          <path d="M33 18 L43 18 L43 30 L33 30 Z" fill="#d9dde3" stroke="#6f7882" stroke-width="1.5"/><circle cx="38" cy="12" r="9" fill="#d9dde3" stroke="#6f7882" stroke-width="2"/><circle cx="38" cy="10" r="3" fill="#6f7882"/></g></svg>`;
      const led = b.querySelector('.led');
      const show = on => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-label', on ? 'Nyckel: på' : 'Nyckel: av'); led.setAttribute('fill', on ? '#3fe06a' : '#2a3a2a'); t.classList.toggle('hint', !on); };
      b.addEventListener('click', () => { const on = !b.classList.contains('on'); show(on); onTurn(on); });
      t.append(b); show(false);
      return {t, set: show, hint(){ t.classList.remove('hint'); void t.offsetWidth; hit(t); t.classList.add('hint'); }, reset(){ show(false); }};
    }
    function ctlKeypad(label, onKey){
      const t = ctile('w2 h2'), g = document.createElement('div'); g.style.cssText = 'display:grid;grid-template-columns:repeat(3,44px);gap:6px';
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '✓'].forEach(k => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'pn-key'; b.textContent = k;
        b.setAttribute('aria-label', k === 'C' ? 'Sudda' : k === '✓' ? 'Klar' : String(k));
        b.addEventListener('click', () => { onKey(k); use(label); }); g.append(b);
      });
      t.append(g); controls++;
      return {t, reset(){}};
    }

    // ---------- Bygg panelen ----------
    // Reglagen ändrar ett tillstånd S, och update() räknar fram vad allt ska visa: vanliga kopplingar,
    // hemliga kombinationer, kraften i watt och säkringen.
    let S = null, O = null, found = new Set(), fuseCtl = null, keyCtl = null;
    const secretEl = el.querySelector('.pn-secret');
    const SECRETS = big ? ['gul', 'regnbage', 'polis', 'jakt', 'kod', 'sakring'] : ['disco', 'gron', 'polis'];
    const LIMIT = 750;
    function showSecrets(){ secretEl.textContent = `⭐ Hemligheter: ${found.size} av ${SECRETS.length}`; }
    function discover(key){
      if(found.has(key)) return;
      found.add(key); showSecrets();
      secretEl.classList.remove('pop'); void secretEl.offsetWidth; secretEl.classList.add('pop');
      [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.18, 'sine', 0.1, 0.15 + i * 0.08));
      setTimeout(() => say(found.size === SECRETS.length ? 'Du hittade alla hemligheter!' : 'Du hittade en hemlighet!'), 450);
    }
    function secretCode(){ S.codeUntil = performance.now() + 3500; [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.2, 'sine', 0.1, i * 0.09)); discover('kod'); update(); }

    function build(){
      tiles.forEach(t => t.remove()); tiles = []; outTiles = []; ctlTiles = []; spin = []; sounds.forEach(s => s.set(0)); sounds = []; resets = []; controls = 0; used = new Set(); allDone = false;
      const nBulbs = big ? 6 : 4, nPush = big ? 4 : 2;
      S = {key: false, push: new Array(nPush).fill(false), sw: [false, false], fan: 0, lever: false, slider: 0, gknob: 0, codeUntil: 0, tripped: false};
      O = {bulbs: LAMP.slice(0, nBulbs).map(c => outBulb(c))};
      O.fan = outFan(); O.beacon = outBeacon(); O.bell = outBell(); O.traffic = outTraffic();
      if(big){ O.gears = outGears(); O.leds = outLeds(); O.gauge = outGauge(); O.disp = outDisplay(); }
      O.power = outPower(big ? 1000 : 600, big ? LIMIT : 0);
      const btnCols = BTN.slice(2).concat(BTN.slice(0, 2));   // fast: knapp 1 är lila, 2 turkos och så vidare
      const ctls = [];
      const ok = () => S.key && !S.tripped;
      keyCtl = ctlKeySwitch(on => {
        S.key = on;
        const a = ctx(); if(a){ const t0 = a.currentTime, o = a.createOscillator(), g = a.createGain(); o.type = 'triangle';
          o.frequency.setValueAtTime(on ? 120 : 500, t0); o.frequency.exponentialRampToValueAtTime(on ? 520 : 90, t0 + 0.5);
          g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.1, t0 + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.55);
          o.connect(g).connect(master); o.start(t0); o.stop(t0 + 0.6); }
        click(); say(on ? 'Panelen är på!' : 'Panelen är av.');
        update();
      });
      for(let i = 0; i < nPush; i++){
        const f = 440 + i * 80;
        ctls.push(ctlPush(btnCols[i], 'Knapp ' + (i + 1), () => { if(!ok()) return dead(); S.push[i] = !S.push[i]; tone(S.push[i] ? f : f / 2, 0.25, 'triangle', 0.12); update(); }));
      }
      [0, 1].forEach(k => ctls.push(ctlSwitch('Brytare ' + (k + 1), on => { S.sw[k] = on; if(!ok()) return dead(); update(); })));
      ctls.push(ctlKnob(4, 'Vred', v => { S.fan = v; if(!ok()) return dead(); update(); }));
      ctls.push(ctlBig('Stora röda knappen', () => { if(!ok()) return dead(); O.beacon.fire(); update(); }));
      ctls.push(ctlPush(btnCols[nPush], 'Knapp ' + (nPush + 1), () => { if(!ok()) return dead(); O.bell.ring(); }));
      ctls.push(ctlPush(btnCols[nPush + 1], 'Knapp ' + (nPush + 2), () => { if(!ok()) return dead(); O.traffic.next(); update(); }));
      if(big){
        ctls.push(ctlLever('Spak', on => { S.lever = on; if(!ok()) return dead(); update(); }));
        ctls.push(ctlSlider(O.leds.N, 'Reglage', v => { S.slider = v; if(!ok()) return dead(); update(); }));
        ctls.push(ctlKnob(6, 'Vred med sex lägen', v => { S.gknob = v; if(!ok()) return dead(); update(); }));
        ctls.push(ctlKeypad('Knappsats', k => { if(!ok()) return dead(); O.disp.key(k); update(); }));
        fuseCtl = ctlFuse(() => { S.tripped = false; fuseCtl.trip(false); [392, 523, 659].forEach((f, i) => tone(f, 0.15, 'sine', 0.1, i * 0.08)); say('Strömmen är tillbaka!'); update(); });
        ctls.push(fuseCtl);
      }
      // Sakerna ligger i sin naturliga ordning på den övre panelen; reglagen på den undre i en fast
      // men annan ordning, så att det inte är självklart vilket reglage som styr vad.
      outTiles.forEach(t => outGrid.append(t));
      ctlGrid.append(keyCtl.t);
      fixedOrder(ctlTiles.filter(t => t !== keyCtl.t), big ? 5 : 4).forEach(t => ctlGrid.append(t));
      resets.push(...Object.values(O).flat().map(o => () => o.reset()), ...ctls.map(c => () => c.reset()), () => keyCtl.reset());
      showSecrets(); update();
    }
    // Ett reglage när säkringen har gått: ingenting händer, bara ett dovt klick.
    function dead(){ tone(120, 0.12, 'square', 0.05); if(!S.key && keyCtl) keyCtl.hint(); }

    function update(){
      if(!S) return;
      const now = performance.now(), B = O.bulbs, nPush = S.push.length;
      board.classList.toggle('dark', S.tripped || !S.key);
      if(S.tripped || !S.key){
        B.forEach(b => b.apply(false, b.base, false)); O.fan.level(0); O.fan.tint(''); O.beacon.police(false); O.traffic.dark(true);
        if(big){ O.gears.set(false); O.leds.setChase(false); O.leds.set(0); O.gauge.set(0); O.gauge.tremble(false); O.disp.dark(true); }
        O.power.set(0); return;
      }
      O.traffic.dark(false); if(big) O.disp.dark(false);
      const on = B.map((_, i) => i < nPush ? S.push[i] : S.sw[i - nPush]);
      const col = B.map(b => b.base), disco = B.map(() => false);
      const tr = O.traffic.get(), code = S.codeUntil > now;
      let police = false, green = false, chase = false;
      if(big){
        // Brytare 1 (vita lampan) och spaken samtidigt: lampan lyser gult.
        if(S.sw[0] && S.lever){ col[4] = '#ffd23a'; discover('gul'); }
        // Alla fyra knapplamporna tända: regnbåge.
        if(S.push.every(x => x)){ for(let i = 0; i < 4; i++) disco[i] = true; discover('regnbage'); }
        // Fläkten på högsta fart och rött trafikljus: polisljus.
        if(S.fan === 3 && tr === 0){ police = true; discover('polis'); }
        // Reglaget och visarvredet i botten: ljusjakt och darrande visare.
        if(S.slider === O.leds.N && S.gknob === 5){ chase = true; discover('jakt'); }
        // Hemliga koden 1 2 3 ✓: alla lampor blinkar i regnbågens färger en stund.
        if(code) B.forEach((_, i) => { on[i] = true; disco[i] = true; });
      }else{
        // Båda brytarna på: deras lampor blir disco.
        if(S.sw[0] && S.sw[1]){ disco[2] = disco[3] = true; discover('disco'); }
        // Grönt trafikljus och fläkten igång: fläkten blir grön.
        if(tr === 2 && S.fan > 0){ green = true; discover('gron'); }
        // Fläkten på högsta fart och knapplampa 2 tänd: polisljus.
        if(S.fan === 3 && S.push[1]){ police = true; discover('polis'); }
      }
      B.forEach((b, i) => b.apply(on[i], col[i], disco[i]));
      O.fan.level(S.fan); O.fan.tint(green ? '#3fe06a' : '');
      O.beacon.police(police);
      if(big){
        O.gears.set(S.lever); O.leds.set(S.slider); O.leds.setChase(chase); O.gauge.set(S.gknob / 5); O.gauge.tremble(chase);
      }
      // Kraften i watt: lampa 60, fläkt 40 per läge, varningsljus 100, trafikljus 30, kugghjul 150,
      // lysdiod 10 styck (ljusjakt 80), display 10.
      let w = on.filter(Boolean).length * 60 + S.fan * 40 + (O.beacon.active() ? 100 : 0) + (tr >= 0 ? 30 : 0);
      if(big) w += (S.lever ? 150 : 0) + (chase ? 80 : S.slider * 10) + (O.disp.used() ? 10 : 0);
      O.power.set(w);
      if(big && w > LIMIT) trip();
    }
    function trip(){
      S.tripped = true; fuseCtl.trip(true); O.beacon.reset();
      const a = ctx(); if(a){ const t = a.currentTime; tone(90, 0.25, 'square', 0.12);
        const o = a.createOscillator(), g = a.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(400, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.8);
        g.gain.setValueAtTime(0.1, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.85); o.connect(g).connect(master); o.start(t); o.stop(t + 0.9); }
      discover('sakring');
      setTimeout(() => say('Säkringen gick! Tryck på säkringen för att få tillbaka strömmen.'), 1300);
      update();
    }

    build();
    el.querySelector('[data-a="off"]').addEventListener('click', () => {
      resets.forEach(r => r());
      Object.assign(S, {key: false, push: S.push.map(() => false), sw: [false, false], fan: 0, lever: false, slider: 0, gknob: 0, codeUntil: 0, tripped: false});
      update(); tone(400, 0.12, 'square', 0.06); tone(200, 0.2, 'square', 0.06, 0.1);
    });

    // Allt som snurrar: fläkt, varningsljus, kugghjul och visare, med mjuk start och stopp.
    let raf = 0, last = 0;
    function frame(t){
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
      if(S && S.codeUntil && t > S.codeUntil){ S.codeUntil = 0; update(); }
      if(O){
        O.bulbs.forEach((b, i) => { if(b.disco) b.el.style.setProperty('--c', `hsl(${(t / 6 + i * 60) % 360} 95% 60%)`); });
        if(O.leds) O.leds.run(t);
      }
      spin.forEach(s => {
        if(s.needle){ s.value += (s.target - s.value) * Math.min(1, dt * 4);
          const a = Math.PI * (1 - Math.max(0, Math.min(1, s.value + (s.shake ? Math.sin(t / 30) * 0.03 : 0))));
          s.needle.setAttribute('x2', (s.cx + Math.cos(a) * s.r).toFixed(1)); s.needle.setAttribute('y2', (s.cy - Math.sin(a) * s.r).toFixed(1)); return; }
        s.speed += (s.target - s.speed) * Math.min(1, dt * 1.5);
        if(Math.abs(s.speed) < 0.5) return;
        s.angle = (s.angle + s.speed * dt) % 360;
        s.el.setAttribute('transform', `rotate(${s.angle.toFixed(1)} ${s.cx} ${s.cy})`);
      });
    }
    raf = requestAnimationFrame(frame);

    return {
      stop(){
        cancelAnimationFrame(raf);
        resets.forEach(r => { try{ r(); }catch(e){} });
        try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
        setTimeout(() => { try{ if(ac) ac.close(); }catch(e){} }, 700);
        root.innerHTML = '';
      }
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'panelen', title: 'Kontrollpanelen', icon: '🎛️',
    about: 'En panel med lampor, fläkt, klocka, kraftmätare och mer, och under den en panel med knappar, vred, brytare och spakar. Vrid om nyckeln, prova dig fram, lär dig vad som styr vad och hitta hemliga kombinationer! Liten: 8 reglage. Stor: 14 reglage.',
    start
  });
})();
