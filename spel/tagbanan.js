/* Tågbanan – rälsen från stationen till målet har luckor. Tryck i en lucka så läggs en rälsbit, tryck igen så
   vrids den (rak, rak upp och ned, fyra kurvor). Rälsen som hänger ihop från stationen lyser. När hela vägen
   hänger ihop kör tåget med vagnar till målet. Liten nivå: 5 × 3 rutor och 2–3 luckor. Stor nivå: 7 × 5 rutor
   och 4–6 luckor. Banorna slumpas med fast frö per nummer. Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.tb{height:100%;display:flex;flex-direction:column;gap:10px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.tb-top{display:flex;align-items:center;gap:12px;min-height:44px;flex-wrap:wrap}
.tb-title{font-size:1.7rem;font-weight:800;line-height:1;margin-right:auto}
.tb-num{font-weight:800;font-size:1.1rem;background:var(--card,#fff);border-radius:999px;padding:4px 14px;box-shadow:inset 0 0 0 2px var(--line,#C6D1DF)}
.tb-btn{border:0;border-radius:999px;background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;padding:5px 14px;cursor:pointer;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF)}
.tb-area{flex:1;min-height:0;display:grid;place-items:center}
.tb-area svg{display:block;touch-action:manipulation;border-radius:20px}
.tb-gap{cursor:pointer}
.tb-gap:hover .tb-slot{fill:#fff7d6}
.tb-wig{animation:tb-wig .35s ease}
.tb-end{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:color-mix(in srgb,var(--sky,#DCEAF6) 70%,transparent);z-index:5}
.tb-end.on{display:flex}
.tb-end .tb-big{font-size:clamp(2rem,7vmin,3.4rem);font-weight:800;text-align:center}
.tb-end button{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.2rem;font-weight:800;border-radius:18px;padding:10px 24px;cursor:pointer}
.tb button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
@keyframes tb-wig{0%,100%{transform:translateX(0)}30%{transform:translateX(-3px)}70%{transform:translateX(3px)}}`;

  const OPP = {L: 'R', R: 'L', U: 'D', D: 'U'}, STEP = {L: [-1, 0], R: [1, 0], U: [0, -1], D: [0, 1]};
  // Bitarna i den ordning ett tryck vrider dem.
  const PIECES = [['L', 'R'], ['U', 'D'], ['L', 'U'], ['U', 'R'], ['R', 'D'], ['D', 'L']];
  const pieceKey = p => p.slice().sort().join('');
  const DECOR = ['🌲', '🌳', '🏡', '🐄', '🌷', '🐑', '🌻', '🪨'];
  function rng(seed){ let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // En väg från vänster kant till höger kant som aldrig korsar sig själv: åt höger, eller upp/ned en bit.
  function makeLevel(W, H, gaps, seed, minLen){
    const r = rng(seed);
    for(let tries = 0; tries < 2000; tries++){
      let x = 0, y = Math.floor(r() * H), entry = 'L', last = 'R';
      const cells = [], seen = new Set([x + ',' + y]);
      let ok = true;
      while(true){
        let dir;
        if(x === W - 1 && r() < 0.6) dir = 'R';
        else {
          const opts = ['R', 'R'];
          if(last !== 'D' && y > 0 && !seen.has(x + ',' + (y - 1))) opts.push('U', 'U');
          if(last !== 'U' && y < H - 1 && !seen.has(x + ',' + (y + 1))) opts.push('D', 'D');
          dir = opts[Math.floor(r() * opts.length)];
          if(dir === 'R' && x === W - 1) dir = 'R';
        }
        cells.push({x, y, conn: [entry, dir]});
        if(dir === 'R' && x === W - 1) break;
        const [dx, dy] = STEP[dir]; x += dx; y += dy;
        if(seen.has(x + ',' + y)){ ok = false; break; }
        seen.add(x + ',' + y); entry = OPP[dir]; last = dir;
        if(cells.length > W * H){ ok = false; break; }
      }
      if(!ok || cells.length < minLen) continue;
      // Luckor: aldrig den första rutan (där tåget står) och helst utspridda.
      const idx = cells.map((_, i) => i).slice(1);
      for(let i = idx.length - 1; i > 0; i--){ const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
      const gapSet = new Set(idx.slice(0, gaps));
      cells.forEach((c, i) => { c.gap = gapSet.has(i); });
      const decor = [];
      for(let yy = 0; yy < H; yy++) for(let xx = 0; xx < W; xx++) if(!seen.has(xx + ',' + yy) && r() < 0.55) decor.push({x: xx, y: yy, e: DECOR[Math.floor(r() * DECOR.length)]});
      return {cells, decor, startY: cells[0].y, goalY: cells[cells.length - 1].y};
    }
    return null;
  }

  function start(root, opts){
    opts = opts || {};
    const big = opts.level === 'big';
    const W = big ? 7 : 5, H = big ? 5 : 3;
    const store = opts.storage || {get(){ return null; }, set(){}};
    let num = parseInt(store.get('nr-' + (big ? 'big' : 'small')) || '1', 10) || 1;
    const saveNum = () => { try{ store.set('nr-' + (big ? 'big' : 'small'), String(num)); }catch(e){} };

    if(!document.getElementById('tb-css')){ const s = document.createElement('style'); s.id = 'tb-css'; s.textContent = CSS; document.head.append(s); }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'tb';
    el.innerHTML = `<div class="tb-top"><div class="tb-title">Tågbanan</div><div class="tb-num" aria-live="polite"></div><button type="button" class="tb-btn" data-a="new">Ny bana</button></div>
      <div class="tb-area"></div>
      <div class="tb-end" role="dialog" aria-live="polite"><div class="tb-big">Tuut tuut! Framme! 🚂</div><button type="button">Nästa bana</button></div>`;
    root.append(el);
    const area = el.querySelector('.tb-area'), endEl = el.querySelector('.tb-end'), numEl = el.querySelector('.tb-num');

    let ac = null;
    function tone(freqs, vol, type, gap, dur){
      if(!opts.sound) return;
      try{ ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        freqs.forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * (gap || 0.08);
          o.type = type || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.1, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.2));
          o.connect(g).connect(ac.destination); o.start(t); o.stop(t + (dur || 0.2) + 0.02); }); }catch(e){}
    }
    function say(text){
      if(!opts.sound || !window.speechSynthesis) return;
      try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'sv-SE';
        const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.replace('_', '-').startsWith('sv')); if(v) u.voice = v; speechSynthesis.speak(u); }catch(e){}
    }
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };

    const C = 100, PADX = 110;   // rutstorlek och plats för station och mål på sidorna (i SVG-enheter)
    let L = null, grid = null, placed = null, svg = null, running = false, raf = 0;
    function load(){
      timers.forEach(clearTimeout); timers.clear(); cancelAnimationFrame(raf); running = false;
      const gaps = big ? 4 + (num % 3) : 2 + (num % 2);
      L = makeLevel(W, H, gaps, (big ? 9000 : 4000) + num * 131, W + (big ? 4 : 2));
      grid = new Map(); L.cells.forEach(c => grid.set(c.x + ',' + c.y, c));
      placed = new Map();   // lucka -> index i PIECES, eller saknas
      numEl.textContent = `Bana ${num}`; endEl.classList.remove('on');
      draw(); layout();
    }
    const cx = x => PADX + x * C + C / 2, cy = y => 40 + y * C + C / 2;
    function railPath(conn, x, y){
      const pt = d => ({L: [cx(x) - C / 2, cy(y)], R: [cx(x) + C / 2, cy(y)], U: [cx(x), cy(y) - C / 2], D: [cx(x), cy(y) + C / 2]})[d];
      const [a, b] = conn.map(pt);
      return (conn.includes('L') && conn.includes('R')) || (conn.includes('U') && conn.includes('D'))
        ? `M${a[0]} ${a[1]} L${b[0]} ${b[1]}` : `M${a[0]} ${a[1]} Q${cx(x)} ${cy(y)} ${b[0]} ${b[1]}`;
    }
    function rail(conn, x, y, lit){
      const d = railPath(conn, x, y);
      return `<path d="${d}" stroke="${lit ? '#c58b4a' : '#8a6a4a'}" stroke-width="30" fill="none" stroke-linecap="butt" stroke-dasharray="6 9"/>
        <path d="${d}" stroke="${lit ? '#2e7d3a' : '#5b6470'}" stroke-width="20" fill="none" stroke-linecap="butt"/>
        <path d="${d}" stroke="${lit ? '#9be33a' : '#c6ccd4'}" stroke-width="12" fill="none" stroke-linecap="butt"/>`;
    }
    // Följ rälsen från stationen: vilka rutor hänger ihop, och kommer man ända fram?
    function trace(){
      const lit = new Set(); let x = 0, y = L.startY, entry = 'L';
      for(let n = 0; n < W * H + 2; n++){
        const c = grid.get(x + ',' + y); if(!c) return {lit, ok: false};
        const conn = c.gap ? (placed.has(x + ',' + y) ? PIECES[placed.get(x + ',' + y)] : null) : c.conn;
        if(!conn || !conn.includes(entry)) return {lit, ok: false};
        lit.add(x + ',' + y);
        const exit = conn.find(d => d !== entry);
        if(exit === 'R' && x === W - 1) return {lit, ok: y === L.goalY};
        const [dx, dy] = STEP[exit]; x += dx; y += dy; entry = OPP[exit];
        if(x < 0 || y < 0 || x >= W || y >= H) return {lit, ok: false};
      }
      return {lit, ok: false};
    }
    function draw(){
      const VW = W * C + PADX * 2, VH = H * C + 80, t = trace();
      let s = `<rect width="${VW}" height="${VH}" fill="#a8dc8a"/>`;
      for(let y = 0; y < H; y++) for(let x = 0; x < W; x++) s += `<rect x="${PADX + x * C + 2}" y="${42 + y * C}" width="${C - 4}" height="${C - 4}" rx="10" fill="#b8e49a"/>`;
      L.decor.forEach(d => { s += `<text x="${cx(d.x)}" y="${cy(d.y) + 4}" font-size="48" text-anchor="middle" dominant-baseline="middle">${d.e}</text>`; });
      // Stationen till vänster och målet till höger.
      s += `<g><rect x="12" y="${cy(L.startY) - 46}" width="84" height="60" rx="6" fill="#e8473c"/><path d="M4 ${cy(L.startY) - 44} L54 ${cy(L.startY) - 78} L104 ${cy(L.startY) - 44}Z" fill="#7a3f1a"/><rect x="40" y="${cy(L.startY) - 28}" width="28" height="42" fill="#5b3a1a"/></g>`;
      s += rail(['L', 'R'], -1, L.startY, true);
      const gx = PADX + W * C;
      s += `<path d="M${gx} ${cy(L.goalY)} L${gx + 60} ${cy(L.goalY)}" stroke="#5b6470" stroke-width="20"/><path d="M${gx} ${cy(L.goalY)} L${gx + 60} ${cy(L.goalY)}" stroke="#c6ccd4" stroke-width="12"/>
        <line x1="${gx + 70}" y1="${cy(L.goalY) - 60}" x2="${gx + 70}" y2="${cy(L.goalY) + 20}" stroke="#555" stroke-width="5"/><path d="M${gx + 72} ${cy(L.goalY) - 60} L${gx + 104} ${cy(L.goalY) - 48} L${gx + 72} ${cy(L.goalY) - 36}Z" fill="#e8302a"/>`;
      // Rälsen och luckorna.
      L.cells.forEach(c => {
        const k = c.x + ',' + c.y, lit = t.lit.has(k);
        if(c.gap){
          s += `<g class="tb-gap" data-k="${k}" role="button" tabindex="0" aria-label="Lucka"><rect class="tb-slot" x="${PADX + c.x * C + 8}" y="${48 + c.y * C}" width="${C - 16}" height="${C - 16}" rx="14" fill="#fff3c4" stroke="#f5c02e" stroke-width="4" stroke-dasharray="10 7"/>`;
          if(placed.has(k)) s += rail(PIECES[placed.get(k)], c.x, c.y, lit);
          else s += `<text x="${cx(c.x)}" y="${cy(c.y) + 2}" font-size="34" text-anchor="middle" dominant-baseline="middle" fill="#c9930a">+</text>`;
          s += `</g>`;
        }else s += `<g data-k="${k}" class="tb-fixed">${rail(c.conn, c.x, c.y, lit)}</g>`;
      });
      s += `<g class="tb-train"></g>`;
      area.innerHTML = `<svg viewBox="0 0 ${VW} ${VH}" role="img" aria-label="Tågbana">${s}</svg>`;
      svg = area.querySelector('svg');
      svg.querySelectorAll('.tb-gap').forEach(g => { g.addEventListener('pointerdown', e => { e.preventDefault(); tapGap(g.dataset.k); }); g.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); tapGap(g.dataset.k); } }); });
      svg.querySelectorAll('.tb-fixed').forEach(g => g.addEventListener('pointerdown', () => { g.classList.remove('tb-wig'); void g.getBoundingClientRect(); g.classList.add('tb-wig'); tone([200], 0.04, 'triangle'); }));
      drawTrain(0);
      if(t.ok && !running) go();
    }
    function tapGap(k){
      if(running) return;
      const i = placed.has(k) ? (placed.get(k) + 1) % PIECES.length : 0;
      placed.set(k, i); tone([440 + i * 50], 0.07, 'triangle');
      draw(); layout();
    }
    // Tåget: lok och två vagnar som följer rälsens mittlinje.
    let route = [];
    function buildRoute(){
      const pts = [[30, cy(L.startY)], [PADX, cy(L.startY)]];
      let x = 0, y = L.startY, entry = 'L';
      for(let n = 0; n < W * H + 2; n++){
        const c = grid.get(x + ',' + y), conn = c.gap ? PIECES[placed.get(x + ',' + y)] : c.conn, exit = conn.find(d => d !== entry);
        const pt = d => ({L: [cx(x) - C / 2, cy(y)], R: [cx(x) + C / 2, cy(y)], U: [cx(x), cy(y) - C / 2], D: [cx(x), cy(y) + C / 2]})[d];
        const a = pt(entry), b = pt(exit), straight = OPP[entry] === exit;
        for(let k = 1; k <= 10; k++){ const t = k / 10;
          if(straight) pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
          else { const m = [cx(x), cy(y)]; pts.push([(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * m[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * m[1] + t * t * b[1]]); } }
        if(exit === 'R' && x === W - 1) break;
        const [dx, dy] = STEP[exit]; x += dx; y += dy; entry = OPP[exit];
      }
      pts.push([PADX + W * C + 50, cy(L.goalY)]);
      // Längd längs vägen för jämn fart.
      route = [{p: pts[0], s: 0}];
      for(let i = 1; i < pts.length; i++) route.push({p: pts[i], s: route[i - 1].s + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])});
    }
    function at(s){
      s = Math.max(0, Math.min(route[route.length - 1].s, s));
      let i = 1; while(i < route.length - 1 && route[i].s < s) i++;
      const a = route[i - 1], b = route[i], t = (s - a.s) / ((b.s - a.s) || 1);
      return [a.p[0] + (b.p[0] - a.p[0]) * t, a.p[1] + (b.p[1] - a.p[1]) * t, Math.atan2(b.p[1] - a.p[1], b.p[0] - a.p[0])];
    }
    function car(x, y, ang, body){
      return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(ang * 180 / Math.PI).toFixed(1)})">${body}</g>`;
    }
    const LOCO = `<rect x="-26" y="-16" width="48" height="32" rx="6" fill="#2f6fd6"/><rect x="-24" y="-20" width="20" height="40" rx="4" fill="#1d4ea0"/><circle cx="18" cy="0" r="8" fill="#555"/><circle cx="18" cy="0" r="4" fill="#f5c02e"/><rect x="0" y="-6" width="12" height="12" rx="2" fill="#9fd6ff"/>`;
    const WAGON = c => `<rect x="-22" y="-15" width="44" height="30" rx="6" fill="${c}"/><rect x="-14" y="-9" width="28" height="18" rx="3" fill="#fff" opacity=".55"/>`;
    function drawTrain(s){
      const g = svg && svg.querySelector('.tb-train'); if(!g) return;
      if(!running && s === 0){ const y = cy(L.startY); g.innerHTML = car(70, y, 0, LOCO); return; }
      const [x1, y1, a1] = at(s), [x2, y2, a2] = at(s - 52), [x3, y3, a3] = at(s - 104);
      g.innerHTML = car(x3, y3, a3, WAGON('#f28a2e')) + car(x2, y2, a2, WAGON('#43b55a')) + car(x1, y1, a1, LOCO)
        + (Math.floor(s / 40) % 2 ? `<circle cx="${(x1 - 14).toFixed(0)}" cy="${(y1 - 30).toFixed(0)}" r="9" fill="#fff" opacity=".8"/>` : '');
    }
    function go(){
      running = true; buildRoute();
      tone([523, 659], 0.12, 'square', 0.25, 0.3); later(() => say('Tuut tuut!'), 200);
      let s = 0, last = 0; const total = route[route.length - 1].s + 110;
      const step = t => {
        const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t; s += dt * 220;
        drawTrain(s);
        if(Math.floor(s / 60) !== Math.floor((s - dt * 220) / 60)) tone([110], 0.04, 'square', 0, 0.06);
        if(s < total) raf = requestAnimationFrame(step); else win();
      };
      raf = requestAnimationFrame(step);
    }
    function win(){
      [523, 659, 784, 1047].forEach((f, i) => later(() => tone([f], 0.1), i * 110));
      num++; saveNum();
      later(() => endEl.classList.add('on'), 400);
      if(typeof opts.onFinish === 'function') opts.onFinish();
    }
    function layout(){
      if(!svg) return;
      const VW = W * C + PADX * 2, VH = H * C + 80, k = Math.min((area.clientWidth - 8) / VW, (area.clientHeight - 8) / VH);
      svg.style.width = VW * k + 'px'; svg.style.height = VH * k + 'px';
    }
    el.querySelector('[data-a="new"]').addEventListener('click', () => { num++; saveNum(); load(); });
    endEl.querySelector('button').addEventListener('click', load);
    const ro = window.ResizeObserver ? new ResizeObserver(layout) : null; if(ro) ro.observe(area);
    load();

    return {
      stop(){ timers.forEach(clearTimeout); cancelAnimationFrame(raf); if(ro) ro.disconnect(); try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){} try{ if(ac) ac.close(); }catch(e){} root.innerHTML = ''; },
      _test: {level: () => L, placed: () => placed, tapGap, trace: () => { const t = trace(); return {lit: t.lit.size, ok: t.ok}; }, running: () => running, num: () => num, load,
        // Lös banan: rätt bit i varje lucka.
        solve: () => L.cells.filter(c => c.gap).forEach(c => { const want = pieceKey(c.conn), i = PIECES.findIndex(p => pieceKey(p) === want); for(let n = 0; n <= i; n++) tapGap(c.x + ',' + c.y); })}
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'tagbanan', title: 'Tågbanan', icon: '🚂',
    about: 'Lägg rälsbitar i luckorna så att tåget kommer från stationen till flaggan. Tryck i en lucka för att lägga en bit, tryck igen för att vrida den. Liten: 2–3 luckor. Stor: större bana och fler luckor.',
    start
  });
})();
