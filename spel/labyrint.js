/* Labyrinten – dra musen med fingret genom labyrinten till osten. Musen kan inte gå genom väggarna.
   Ett spår ritas efter musen och suddas när den går tillbaka. Labyrinterna växer för varje klarad. Liten nivå:
   4 × 3 till 7 × 6 rutor, en enda väg. Stor nivå: 7 × 5 till 13 × 9 rutor och flera vägar. Labyrinterna skapas
   av en slumpgenerator med fast frö, så labyrint nummer 3 ser alltid likadan ut. Ledtråd efter en stund.
   Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.laby{height:100%;display:flex;flex-direction:column;gap:10px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.laby-top{display:flex;align-items:center;gap:12px;min-height:44px;flex-wrap:wrap}
.laby-title{font-size:1.7rem;font-weight:800;line-height:1;margin-right:auto}
.laby-num{font-weight:800;font-size:1.15rem;background:var(--card,#fff);border-radius:999px;padding:4px 14px;box-shadow:inset 0 0 0 2px var(--line,#C6D1DF)}
.laby-btn{border:0;border-radius:999px;background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;padding:5px 14px;cursor:pointer;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF)}
.laby-area{flex:1;min-height:0;display:grid;place-items:center;touch-action:none}
.laby-area canvas{touch-action:none;border-radius:18px}
.laby-end{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:color-mix(in srgb,var(--sky,#DCEAF6) 70%,transparent);z-index:5}
.laby-end.on{display:flex}
.laby-end .big{font-size:clamp(2rem,7vmin,3.4rem);font-weight:800;text-align:center}
.laby-end .em{font-size:3.4rem;animation:laby-hop .7s ease 3}
.laby-end button{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.2rem;font-weight:800;border-radius:18px;padding:10px 24px;cursor:pointer}
.laby button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
@keyframes laby-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-16px)}}`;

  const SIZES = {small: [[4, 3], [5, 4], [5, 5], [6, 5], [7, 5], [7, 6]], big: [[7, 5], [8, 6], [9, 7], [10, 7], [11, 8], [12, 8], [13, 9]]};
  const DIRS = [[0, -1, 0], [1, 0, 1], [0, 1, 2], [-1, 0, 3]];   // dx, dy, vägg: 0 upp, 1 höger, 2 ned, 3 vänster

  function rng(seed){ let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  // Labyrint med "recursive backtracker": en enda väg mellan två rutor. braid > 0 tar bort en del
  // återvändsgränder så att det blir flera vägar.
  function makeMaze(w, h, seed, braid){
    const r = rng(seed), walls = Array.from({length: h}, () => Array.from({length: w}, () => [true, true, true, true]));
    const seen = Array.from({length: h}, () => new Array(w).fill(false)), stack = [[0, 0]]; seen[0][0] = true;
    while(stack.length){
      const [x, y] = stack[stack.length - 1];
      const opts = DIRS.filter(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < w && ny < h && !seen[ny][nx]; });
      if(!opts.length){ stack.pop(); continue; }
      const [dx, dy, wi] = opts[Math.floor(r() * opts.length)], nx = x + dx, ny = y + dy;
      walls[y][x][wi] = false; walls[ny][nx][(wi + 2) % 4] = false; seen[ny][nx] = true; stack.push([nx, ny]);
    }
    // Flera vägar: öppna en del återvändsgränder, minst en per 20 rutor.
    let opened = 0;
    const want = braid ? Math.max(2, Math.floor(w * h / 20)) : 0;
    for(let pass = 0; braid && pass < 6 && opened < want; pass++){
      for(let y = 0; y < h; y++) for(let x = 0; x < w; x++){
        if(walls[y][x].filter(Boolean).length !== 3 || r() > braid) continue;
        const opts = DIRS.filter(([dx, dy, wi]) => { const nx = x + dx, ny = y + dy; return walls[y][x][wi] && nx >= 0 && ny >= 0 && nx < w && ny < h; });
        if(!opts.length) continue;
        const [dx, dy, wi] = opts[Math.floor(r() * opts.length)];
        walls[y][x][wi] = false; walls[y + dy][x + dx][(wi + 2) % 4] = false; opened++;
      }
    }
    return walls;
  }

  function start(root, opts){
    opts = opts || {};
    const level = opts.level === 'big' ? 'big' : 'small';
    const store = opts.storage || {get(){ return null; }, set(){}};
    let num = parseInt(store.get('nr-' + level) || '1', 10) || 1;
    const saveNum = () => { try{ store.set('nr-' + level, String(num)); }catch(e){} };

    if(!document.getElementById('laby-css')){ const s = document.createElement('style'); s.id = 'laby-css'; s.textContent = CSS; document.head.append(s); }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'laby';
    el.innerHTML = `<div class="laby-top"><div class="laby-title">Labyrinten</div><div class="laby-num" aria-live="polite"></div><button type="button" class="laby-btn" data-a="new">Ny labyrint</button></div>
      <div class="laby-area"><canvas aria-label="Labyrint: dra musen till osten"></canvas></div>
      <div class="laby-end" role="dialog" aria-live="polite"><div class="em">🐭🧀</div><div class="big">Musen hittade osten!</div><button type="button">Nästa labyrint</button></div>`;
    root.append(el);
    const cv = el.querySelector('canvas'), g = cv.getContext('2d'), area = el.querySelector('.laby-area'), endEl = el.querySelector('.laby-end'), numEl = el.querySelector('.laby-num');

    let ac = null;
    function tone(freqs, vol, type, gap){
      if(!opts.sound) return;
      try{ ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        freqs.forEach((f, i) => { const o = ac.createOscillator(), gg = ac.createGain(), t = ac.currentTime + i * (gap || 0.08);
          o.type = type || 'sine'; o.frequency.value = f; gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(vol || 0.08, t + 0.01); gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
          o.connect(gg).connect(ac.destination); o.start(t); o.stop(t + 0.18); }); }catch(e){}
    }
    function say(text){
      if(!opts.sound || !window.speechSynthesis) return;
      try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'sv-SE';
        const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.replace('_', '-').startsWith('sv')); if(v) u.voice = v; speechSynthesis.speak(u); }catch(e){}
    }

    let W = 4, H = 3, walls = null, path = [], done = false, cell = 40, ox = 0, oy = 0, hint = [], idleTimer = null, mouse = {x: 0, y: 0};
    const goal = () => [W - 1, H - 1];
    function load(){
      const list = SIZES[level], sz = list[Math.min(num - 1, list.length - 1)];
      [W, H] = sz; done = false; hint = [];
      // Fast frö per nummer och nivå; efter den sista storleken blir varje labyrint ny men lika stor.
      walls = makeMaze(W, H, (level === 'big' ? 7000 : 3000) + num * 97, level === 'big' ? 0.45 : 0);
      path = [[0, 0]]; mouse = {x: 0, y: 0};
      numEl.textContent = `Labyrint ${num}`; endEl.classList.remove('on');
      layout(); idle();
    }
    const open = (x, y, wi) => !walls[y][x][wi];
    function neighbors(x, y){ return DIRS.filter(([dx, dy, wi]) => open(x, y, wi)).map(([dx, dy]) => [x + dx, y + dy]); }
    // Kortaste vägen (bredden först) mellan två rutor, eller null.
    function route(from, to, maxLen){
      const key = (x, y) => y * W + x, prev = new Map([[key(...from), null]]), q = [from];
      while(q.length){
        const c = q.shift();
        if(c[0] === to[0] && c[1] === to[1]){ const out = []; let k = key(...c), cur = c; while(cur){ out.unshift(cur); const p = prev.get(key(...cur)); cur = p; } return maxLen && out.length - 1 > maxLen ? null : out; }
        for(const n of neighbors(...c)){ const k = key(...n); if(!prev.has(k)){ prev.set(k, c); q.push(n); } }
      }
      return null;
    }
    function stepTo(n){
      const last = path[path.length - 1];
      if(path.length > 1){ const prev = path[path.length - 2]; if(prev[0] === n[0] && prev[1] === n[1]){ path.pop(); tone([330], 0.04); return; } }   // tillbaka: sudda spåret
      if(last[0] === n[0] && last[1] === n[1]) return;
      // Har musen redan varit där tidigare på spåret klipps spåret dit.
      const i = path.findIndex(p => p[0] === n[0] && p[1] === n[1]);
      if(i >= 0){ path = path.slice(0, i + 1); tone([330], 0.04); return; }
      path.push(n); tone([520 + (path.length % 6) * 40], 0.05);
    }
    // Flytta mot rutan under fingret, om den går att nå på högst fyra steg.
    function moveTowards(tx, ty){
      if(done) return;
      const last = path[path.length - 1];
      if(last[0] === tx && last[1] === ty) return;
      const r = route(last, [tx, ty], 4); if(!r) return;
      r.slice(1).forEach(stepTo);
      hint = []; idle();
      const now = path[path.length - 1], gl = goal();
      if(now[0] === gl[0] && now[1] === gl[1]) win();
    }
    function win(){
      done = true; clearTimeout(idleTimer); hint = [];
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone([f], 0.1), i * 110));
      say('Mums! Musen hittade osten!');
      num++; saveNum();
      setTimeout(() => endEl.classList.add('on'), 700);
      if(typeof opts.onFinish === 'function') opts.onFinish();
    }
    function idle(){
      clearTimeout(idleTimer);
      if(done) return;
      idleTimer = setTimeout(() => { const r = route(path[path.length - 1], goal()); hint = r ? r.slice(1, 5) : []; }, level === 'big' ? 15000 : 9000);
    }
    function layout(){
      const aw = area.clientWidth - 8, ah = area.clientHeight - 8; if(aw <= 0 || ah <= 0 || !walls) return;
      cell = Math.floor(Math.min(aw / W, ah / H)); const dpr = window.devicePixelRatio || 1;
      cv.style.width = cell * W + 'px'; cv.style.height = cell * H + 'px'; cv.width = cell * W * dpr; cv.height = cell * H * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); dirty = true;
    }
    let clock = 0;
    function draw(){
      if(!walls) return;
      const c = cell, w = W * c, h = H * c;
      g.fillStyle = '#fff6e0'; g.fillRect(0, 0, w, h);
      // Ledtråd: prickar på de närmaste stegen.
      hint.forEach(([x, y], i) => { g.fillStyle = `rgba(245,192,46,${0.75 - i * 0.15 + Math.sin(clock * 5) * 0.1})`; g.beginPath(); g.arc(x * c + c / 2, y * c + c / 2, c * 0.16, 0, Math.PI * 2); g.fill(); });
      // Spåret.
      if(path.length > 1){ g.strokeStyle = 'rgba(47,111,214,.45)'; g.lineWidth = c * 0.28; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); path.forEach(([x, y], i) => { const px = x * c + c / 2, py = y * c + c / 2; if(i) g.lineTo(px, py); else g.moveTo(px, py); }); g.stroke(); }
      // Väggar.
      g.strokeStyle = '#6b4f2a'; g.lineWidth = Math.max(4, c * 0.12); g.lineCap = 'round'; g.beginPath();
      for(let y = 0; y < H; y++) for(let x = 0; x < W; x++){
        const X = x * c, Y = y * c, wl = walls[y][x];
        if(wl[0]){ g.moveTo(X, Y); g.lineTo(X + c, Y); }
        if(wl[3]){ g.moveTo(X, Y); g.lineTo(X, Y + c); }
        if(x === W - 1 && wl[1]){ g.moveTo(X + c, Y); g.lineTo(X + c, Y + c); }
        if(y === H - 1 && wl[2]){ g.moveTo(X, Y + c); g.lineTo(X + c, Y + c); }
      }
      g.stroke();
      // Osten och musen (musen glider mjukt mellan rutorna).
      g.fillStyle = '#000'; g.globalAlpha = 1;
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `${Math.floor(c * 0.62)}px system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif`;
      const gl = goal(); if(!done) g.fillText('🧀', gl[0] * c + c / 2, gl[1] * c + c / 2 + 2);
      const t = path[path.length - 1]; mouse.x += (t[0] - mouse.x) * 0.35; mouse.y += (t[1] - mouse.y) * 0.35;
      g.fillText('🐭', mouse.x * c + c / 2, mouse.y * c + c / 2 + 2);
    }
    // Dra med fingret: musen följer rutan under fingret. Ett tryck på en ruta nära musen fungerar också.
    const cellAt = e => { const r = cv.getBoundingClientRect(); return [Math.floor((e.clientX - r.left) / cell), Math.floor((e.clientY - r.top) / cell)]; };
    let drag = false;
    cv.addEventListener('pointerdown', e => { e.preventDefault(); try{ cv.setPointerCapture(e.pointerId); }catch(x){} drag = true; const [x, y] = cellAt(e); if(x >= 0 && y >= 0 && x < W && y < H) moveTowards(x, y); });
    cv.addEventListener('pointermove', e => { if(!drag) return; const [x, y] = cellAt(e); if(x >= 0 && y >= 0 && x < W && y < H) moveTowards(x, y); });
    const up = () => { drag = false; }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    const onKey = e => { const d = {ArrowUp: [0, -1], ArrowRight: [1, 0], ArrowDown: [0, 1], ArrowLeft: [-1, 0]}[e.key]; if(!d || done) return; e.preventDefault(); const l = path[path.length - 1]; moveTowards(l[0] + d[0], l[1] + d[1]); };
    window.addEventListener('keydown', onKey);
    el.querySelector('[data-a="new"]').addEventListener('click', () => { num++; saveNum(); load(); });
    endEl.querySelector('button').addEventListener('click', load);

    let raf = 0, last = 0;
    // Rita bara när något ändras eller rör sig (musen glider, ledtråden pulserar) – sparar batteri.
    let lastSig = '', dirty = true;
    function frame(t){
      raf = requestAnimationFrame(frame); clock += Math.min(0.05, (t - (last || t)) / 1000); last = t;
      if(!walls) return;
      const p = path[path.length - 1], moving = Math.abs(p[0] - mouse.x) + Math.abs(p[1] - mouse.y) > 0.002;
      const sig = `${W}x${H}:${cell}:${path.length}:${p}:${done}`;
      if(moving || hint.length || dirty || sig !== lastSig){ draw(); lastSig = sig; dirty = false; }
    }
    const ro = window.ResizeObserver ? new ResizeObserver(layout) : null; if(ro) ro.observe(area);
    load(); raf = requestAnimationFrame(frame);

    return {
      stop(){ cancelAnimationFrame(raf); clearTimeout(idleTimer); if(ro) ro.disconnect(); window.removeEventListener('keydown', onKey); try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){} try{ if(ac) ac.close(); }catch(e){} root.innerHTML = ''; },
      _test: {size: () => [W, H], path: () => path.map(p => p.slice()), done: () => done, num: () => num, route: (a, b) => route(a, b), moveTowards, walls: () => walls, load, hint: () => hint}
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'labyrint', title: 'Labyrinten', icon: '🐭',
    about: 'Dra musen med fingret genom labyrinten till osten. Labyrinterna växer för varje klarad. Liten: en väg. Stor: större labyrinter med flera vägar.',
    start
  });
})();
