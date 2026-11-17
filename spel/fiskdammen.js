/* Fiskdammen – dra kroken dit du vill i vattnet och tryck Dra upp när en fisk är vid kroken. Fångsten hamnar
   i hinken och rösten säger vad det blev; ibland nappar en stövel. Blir det ingen fisk åker kroken bara ned
   igen. Fiskboken sparar vilka sorter som har fångats. Liten nivå: långsamma, nyfikna fiskar och stor krok.
   Stor nivå: snabbare fiskar, mindre krok, fler sorter och en sällsynt guldfisk.
   Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.fd{height:100%;display:flex;flex-direction:column;gap:10px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.fd-top{display:flex;align-items:center;gap:12px;min-height:44px;flex-wrap:wrap}
.fd-title{font-size:1.7rem;font-weight:800;line-height:1;margin-right:auto}
.fd-btn{border:0;border-radius:999px;background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;padding:5px 14px;cursor:pointer;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF)}
.fd-area{flex:1;min-height:0;position:relative;border-radius:22px;overflow:hidden;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);touch-action:none}
.fd-area canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
.fd-pull{position:absolute;right:16px;bottom:16px;z-index:3;border:0;border-radius:999px;background:#f5c02e;color:#2B1E00;font:inherit;font-weight:900;font-size:1.4rem;padding:16px 26px;box-shadow:0 5px 0 #b8860b;cursor:pointer;touch-action:manipulation}
.fd-pull:active{transform:translateY(3px);box-shadow:0 2px 0 #b8860b}
.fd-pull:disabled{opacity:.5}
.fd-say{position:absolute;left:50%;top:14%;transform:translateX(-50%);background:rgba(255,255,255,.94);border-radius:16px;padding:8px 18px;font-weight:800;font-size:1.3rem;pointer-events:none;opacity:0;transition:opacity .3s;z-index:3;white-space:nowrap;color:#1D2842}
.fd-say.on{opacity:1}
.fd-book{position:absolute;inset:0;z-index:6;display:none;align-items:center;justify-content:center;background:rgba(10,18,40,.45)}
.fd-book.on{display:flex}
.fd-bookcard{background:var(--card,#fff);border-radius:24px;padding:16px 20px 20px;width:min(560px,92%);text-align:center}
.fd-bookcard h3{margin:0 0 10px;font-size:1.4rem}
.fd-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.fd-sp{background:var(--sky,#DCEAF6);border-radius:16px;padding:8px 4px;font-weight:800;font-size:.9rem}
.fd-sp .e{font-size:2.2rem;line-height:1.2}
.fd-sp.no .e{filter:grayscale(1) brightness(.2);opacity:.35}
.fd-end{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:color-mix(in srgb,var(--sky,#DCEAF6) 70%,transparent);z-index:5}
.fd-end.on{display:flex}
.fd-end .fd-big{font-size:clamp(2rem,7vmin,3.4rem);font-weight:800;text-align:center}
.fd-end .fd-catch{font-size:2.4rem;max-width:80%;text-align:center}
.fd-end button,.fd-bookcard button{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.2rem;font-weight:800;border-radius:18px;padding:10px 24px;cursor:pointer;margin-top:12px}
.fd button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}`;

  // Sorterna: emoji, namn, hur ofta, var de simmar (bottom = på botten), och om de finns på liten nivå.
  const KINDS = [
    {k: 'fisk', e: '🐟', name: 'En blå fisk!', book: 'Blå fisk', w: 34, small: true},
    {k: 'rand', e: '🐠', name: 'En randig fisk!', book: 'Randig fisk', w: 24, small: true},
    {k: 'blas', e: '🐡', name: 'En blåsfisk!', book: 'Blåsfisk', w: 14, small: true},
    {k: 'blck', e: '🐙', name: 'En bläckfisk!', book: 'Bläckfisk', w: 8, small: true},
    {k: 'krab', e: '🦀', name: 'En krabba!', book: 'Krabba', w: 9, small: true, bottom: true},
    {k: 'rak', e: '🦐', name: 'En räka!', book: 'Räka', w: 8, small: false},
    {k: 'stov', e: '👢', name: 'En stövel! Hihi!', book: 'Stövel', w: 4, small: true, bottom: true, junk: true},
    {k: 'guld', e: '🐠', name: 'En guldfisk! Wow!', book: 'Guldfisk', w: 3, small: false, gold: true}
  ];
  const VW = 1000, VH = 620, WATER = 170;

  function start(root, opts){
    opts = opts || {};
    const big = opts.level === 'big';
    const kinds = KINDS.filter(k => big || k.small);
    const GOAL = big ? 10 : 6, REACH = big ? 46 : 74, SPEED = big ? 1.6 : 1;
    const store = opts.storage || {get(){ return null; }, set(){}};
    let book = {};
    try{ book = JSON.parse(store.get('fiskbok') || '{}') || {}; }catch(e){}
    const saveBook = () => { try{ store.set('fiskbok', JSON.stringify(book)); }catch(e){} };

    if(!document.getElementById('fd-css')){ const s = document.createElement('style'); s.id = 'fd-css'; s.textContent = CSS; document.head.append(s); }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'fd';
    el.innerHTML = `<div class="fd-top"><div class="fd-title">Fiskdammen</div><button type="button" class="fd-btn" data-a="book">📖 Fiskboken</button></div>
      <div class="fd-area"><canvas aria-label="Damm med fiskar: dra kroken och tryck Dra upp"></canvas><div class="fd-say" aria-live="polite"></div>
        <button type="button" class="fd-pull">🎣 Dra upp!</button>
        <div class="fd-book" role="dialog" aria-label="Fiskboken"><div class="fd-bookcard"><h3>📖 Fiskboken</h3><div class="fd-grid"></div><button type="button">Stäng</button></div></div></div>
      <div class="fd-end" role="dialog" aria-live="polite"><div class="fd-big">Hinken är full! 🪣</div><div class="fd-catch"></div><button type="button">Töm hinken och fiska mer</button></div>`;
    root.append(el);
    const cv = el.querySelector('canvas'), g = cv.getContext('2d'), area = el.querySelector('.fd-area'), sayEl = el.querySelector('.fd-say');
    const pullBtn = el.querySelector('.fd-pull'), bookEl = el.querySelector('.fd-book'), endEl = el.querySelector('.fd-end');

    let ac = null;
    function tone(freqs, vol, type, gap, dur){
      if(!opts.sound) return;
      try{ ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        freqs.forEach((f, i) => { const o = ac.createOscillator(), gg = ac.createGain(), t = ac.currentTime + i * (gap || 0.08);
          o.type = type || 'sine'; o.frequency.value = f; gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(vol || 0.1, t + 0.02); gg.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.2));
          o.connect(gg).connect(ac.destination); o.start(t); o.stop(t + (dur || 0.2) + 0.02); }); }catch(e){}
    }
    function speak(text){
      if(!opts.sound || !window.speechSynthesis) return;
      try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'sv-SE';
        const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.replace('_', '-').startsWith('sv')); if(v) u.voice = v; speechSynthesis.speak(u); }catch(e){}
    }
    let sayTimer = null;
    const say = (t, ms) => { sayEl.textContent = t; sayEl.classList.add('on'); clearTimeout(sayTimer); sayTimer = setTimeout(() => sayEl.classList.remove('on'), ms || 1600); };

    // ---------- Fiskar ----------
    let fish = [], bucket = [], hook = {x: 500, y: 400, tx: 500, ty: 400}, state = 'fish', anim = null, clock = 0, splash = [];
    function pickKind(){ const tot = kinds.reduce((s, k) => s + k.w, 0); let r = Math.random() * tot; for(const k of kinds){ r -= k.w; if(r <= 0) return k; } return kinds[0]; }
    function spawn(fromSide){
      const kind = pickKind(), dir = Math.random() < 0.5 ? 1 : -1, sz = kind.bottom ? 44 : 38 + Math.random() * 22;
      const y = kind.bottom ? VH - 34 : WATER + 60 + Math.random() * (VH - WATER - 140);
      fish.push({kind, x: fromSide ? (dir > 0 ? -60 : VW + 60) : 80 + Math.random() * (VW - 160), y, dir, sz,
        v: (kind.bottom ? 22 : 40 + Math.random() * 40) * SPEED, ph: Math.random() * 6});
    }
    function reset(){ fish = []; const n = big ? 7 : 6; for(let i = 0; i < n; i++) spawn(false); bucket = []; endEl.classList.remove('on'); state = 'fish'; pullBtn.disabled = false; }
    function step(dt){
      clock += dt;
      hook.x += (hook.tx - hook.x) * Math.min(1, dt * 8); if(state === 'fish') hook.y += (hook.ty - hook.y) * Math.min(1, dt * 8);
      fish.forEach(f => {
        if(f.caught) return;
        // Liten nivå: fiskar nära kroken blir nyfikna och simmar sakta dit.
        const dx = hook.x - f.x, dy = hook.y - f.y, d = Math.hypot(dx, dy);
        if(!big && state === 'fish' && d < 170 && !f.kind.bottom){ f.x += dx * dt * 0.5; f.y += dy * dt * 0.5; f.dir = dx > 0 ? 1 : -1; }
        else { f.x += f.dir * f.v * dt; if(!f.kind.bottom) f.y += Math.sin(clock * 1.5 + f.ph) * 10 * dt; }
        if(f.x < -80 || f.x > VW + 80) f.gone = true;
      });
      const before = fish.length; fish = fish.filter(f => !f.gone); for(let i = fish.length; i < before; i++) spawn(true);
      splash.forEach(s => s.t += dt); splash = splash.filter(s => s.t < 0.8);
      if(anim) anim(dt);
    }
    // Dra upp: fångar den fisk som är närmast kroken, om den är tillräckligt nära.
    function pull(){
      if(state !== 'fish') return;
      state = 'up'; pullBtn.disabled = true; tone([392, 523], 0.07, 'triangle', 0.06);
      const near = fish.filter(f => !f.caught).map(f => [f, Math.hypot(f.x - hook.x, f.y - hook.y)]).sort((a, b) => a[1] - b[1])[0];
      const got = near && near[1] < REACH + near[0].sz * 0.4 ? near[0] : null;
      if(got) got.caught = true;
      splash.push({x: hook.x, y: WATER, t: 0});
      const startY = hook.y; let t = 0;
      anim = dt => {
        t += dt; const k = Math.min(1, t / 0.7);
        hook.y = startY + (60 - startY) * k;
        if(got){ got.x = hook.x; got.y = hook.y + 22; }
        if(k >= 1){ anim = null; got ? landed(got) : missed(); }
      };
    }
    function landed(f){
      const kind = f.kind; let t = 0; const sx = f.x, sy = f.y, bx = 900, by = 95;
      say(kind.name, 2000); speak(kind.name);
      tone(kind.junk ? [330, 262] : kind.gold ? [784, 988, 1175, 1568] : [659, 880], 0.1, 'sine', 0.09);
      anim = dt => {
        t += dt; const k = Math.min(1, t / 0.6);
        f.x = sx + (bx - sx) * k; f.y = sy + (by - sy) * k - Math.sin(k * Math.PI) * 120;
        if(k >= 1){
          anim = null; fish = fish.filter(x => x !== f); spawn(true);
          bucket.push(kind.k); book[kind.k] = (book[kind.k] || 0) + 1; saveBook();
          if(bucket.length >= GOAL) full(); else down();
        }
      };
    }
    function missed(){ say('Ingen fisk den här gången', 1300); tone([300], 0.05, 'triangle'); down(); }
    function down(){
      let t = 0; const ty = hook.ty;
      anim = dt => { t += dt; const k = Math.min(1, t / 0.5); hook.y = 60 + (ty - 60) * k; if(k >= 1){ anim = null; state = 'fish'; pullBtn.disabled = false; } };
    }
    function full(){
      state = 'full';
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone([f], 0.1), i * 110));
      speak('Hinken är full!');
      endEl.querySelector('.fd-catch').textContent = bucket.map(k => KINDS.find(x => x.k === k).e).join(' ');
      setTimeout(() => endEl.classList.add('on'), 700);
      if(typeof opts.onFinish === 'function') opts.onFinish();
    }

    // ---------- Ritning ----------
    function emoji(e, x, y, size, flip, gold){
      g.save(); g.translate(x, y); if(flip) g.scale(-1, 1);
      if(gold){ g.shadowColor = '#ffd23a'; g.shadowBlur = 24; g.filter = 'sepia(1) saturate(4) hue-rotate(-12deg) brightness(1.15)'; }
      g.font = `${Math.round(size)}px system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(e, 0, 0); g.restore();
    }
    function draw(){
      const sky = g.createLinearGradient(0, 0, 0, WATER); sky.addColorStop(0, '#9fd6ff'); sky.addColorStop(1, '#e6f6ff');
      g.fillStyle = sky; g.fillRect(0, 0, VW, WATER);
      const water = g.createLinearGradient(0, WATER, 0, VH); water.addColorStop(0, '#4aa8e8'); water.addColorStop(1, '#1d5f9c');
      g.fillStyle = water; g.fillRect(0, WATER, VW, VH - WATER);
      g.fillStyle = '#d8c27a'; g.fillRect(0, VH - 18, VW, 18);
      // Vass och stenar på botten.
      g.strokeStyle = '#3c9a3c'; g.lineWidth = 5; [70, 90, 830, 960].forEach((x, i) => { g.beginPath(); g.moveTo(x, VH - 16); g.quadraticCurveTo(x + 14, VH - 90 - i * 10, x + 4 + Math.sin(clock + i) * 6, VH - 150 - i * 10); g.stroke(); });
      // Vågor i ytan.
      g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 3; g.beginPath();
      for(let x = 0; x <= VW; x += 10){ const y = WATER + Math.sin(x / 40 + clock * 2) * 4; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      // Bryggan och spöet.
      g.fillStyle = '#8a5a2b'; g.fillRect(0, WATER - 40, 190, 18); g.fillRect(30, WATER - 22, 14, 60); g.fillRect(150, WATER - 22, 14, 60);
      const tipX = Math.max(260, Math.min(hook.x, 760)), tipY = 40;
      g.strokeStyle = '#5b3a1a'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(110, WATER - 46); g.lineTo(tipX, tipY); g.stroke();
      g.strokeStyle = 'rgba(30,30,30,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(tipX, tipY); g.lineTo(hook.x, hook.y - 14); g.stroke();
      // Flötet och kroken.
      g.fillStyle = '#e8302a'; g.beginPath(); g.arc(hook.x, Math.min(hook.y - 30, WATER + Math.sin(clock * 3) * 3), 8, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#555'; g.lineWidth = 4; g.beginPath(); g.arc(hook.x, hook.y, 10, 0, Math.PI * 1.2); g.stroke();
      if(state === 'fish'){ g.strokeStyle = 'rgba(255,255,255,.35)'; g.setLineDash([6, 8]); g.lineWidth = 2; g.beginPath(); g.arc(hook.x, hook.y, REACH, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); }
      // Fiskar (emojin pekar åt vänster; vänd när fisken simmar åt höger).
      fish.forEach(f => emoji(f.kind.e, f.x, f.y, f.sz, f.dir > 0 && !f.caught, f.kind.gold));
      splash.forEach(s => { g.globalAlpha = 1 - s.t / 0.8; g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.ellipse(s.x, s.y, 20 + s.t * 60, 6 + s.t * 10, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; });
      // Hinken uppe till höger, med det som fångats.
      g.fillStyle = '#9aa4b0'; g.beginPath(); g.moveTo(850, 60); g.lineTo(950, 60); g.lineTo(938, 140); g.lineTo(862, 140); g.closePath(); g.fill();
      g.strokeStyle = '#6b7584'; g.lineWidth = 4; g.beginPath(); g.arc(900, 60, 50, Math.PI, 0); g.stroke();
      bucket.slice(-4).forEach((k, i) => emoji(KINDS.find(x => x.k === k).e, 870 + i * 20, 52 - (i % 2) * 8, 28, false, k === 'guld'));
      g.fillStyle = '#1D2842'; g.font = 'bold 26px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText(`${bucket.length}/${GOAL}`, 900, 112);
    }
    let scale = 1, ox = 0, oy = 0;
    function layout(){
      const w = area.clientWidth, h = area.clientHeight; if(!w || !h) return;
      const dpr = window.devicePixelRatio || 1; cv.width = w * dpr; cv.height = h * dpr;
      scale = Math.max(w / VW, h / VH); ox = (w - VW * scale) / 2; oy = (h - VH * scale) / 2;   // fyll ytan, beskär kanterna
      g.setTransform(scale * dpr, 0, 0, scale * dpr, ox * dpr, oy * dpr);
    }
    // Kroken följer fingret i vattnet.
    const toWorld = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left - ox) / scale, (e.clientY - r.top - oy) / scale]; };
    let dragging = false;
    cv.addEventListener('pointerdown', e => { e.preventDefault(); try{ cv.setPointerCapture(e.pointerId); }catch(x){} dragging = true; moveHook(e); });
    cv.addEventListener('pointermove', e => { if(dragging) moveHook(e); });
    const up = () => { dragging = false; }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    function moveHook(e){ const [x, y] = toWorld(e); hook.tx = Math.max(40, Math.min(VW - 40, x)); hook.ty = Math.max(WATER + 40, Math.min(VH - 40, y)); }
    pullBtn.addEventListener('click', pull);
    const onKey = e => { if(e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); pull(); } };
    window.addEventListener('keydown', onKey);
    el.querySelector('[data-a="book"]').addEventListener('click', () => {
      el.querySelector('.fd-grid').innerHTML = KINDS.map(k => `<div class="fd-sp ${book[k.k] ? '' : 'no'}"><div class="e" style="${k.gold && book[k.k] ? 'filter:sepia(1) saturate(4) hue-rotate(-12deg) brightness(1.15)' : ''}">${k.e}</div>${book[k.k] ? k.book + ' × ' + book[k.k] : '?'}</div>`).join('');
      bookEl.classList.add('on');
    });
    bookEl.querySelector('button').addEventListener('click', () => bookEl.classList.remove('on'));
    endEl.querySelector('button').addEventListener('click', reset);

    let raf = 0, last = 0;
    function frame(t){ raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t; step(dt); draw(); }
    const ro = window.ResizeObserver ? new ResizeObserver(layout) : null; if(ro) ro.observe(area);
    layout(); reset(); raf = requestAnimationFrame(frame);

    return {
      stop(){ cancelAnimationFrame(raf); clearTimeout(sayTimer); if(ro) ro.disconnect(); window.removeEventListener('keydown', onKey); try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){} try{ if(ac) ac.close(); }catch(e){} root.innerHTML = ''; },
      _test: {fish: () => fish.map(f => ({k: f.kind.k, x: f.x, y: f.y})), hook: () => hook, setHook: (x, y) => { hook.tx = hook.x = x; hook.ty = hook.y = y; }, pull, state: () => state, bucket: () => bucket.slice(), book: () => book, step}
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'fiskdammen', title: 'Fiskdammen', icon: '🎣',
    about: 'Dra kroken dit du vill och tryck Dra upp när en fisk är vid kroken. Fyll hinken och samla sorter i fiskboken – ibland nappar en stövel! Liten: lugna, nyfikna fiskar. Stor: snabbare fiskar och en sällsynt guldfisk.',
    start
  });
})();
