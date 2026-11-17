/* Pip – ett enkelt plattformsspel i stil med de tidiga plattformsspelen. Figuren Pip springer och hoppar
   till flaggan, samlar mynt och stöter i stjärnblock. Inga liv och ingen tid: ramlar Pip ned i ett hål kommer
   han tillbaka på senaste säkra marken, och sniglar puttar bara undan honom. 4 banor. Liten nivå: lugnare fart,
   smalare hål och inga sniglar. Stor nivå: sniglar, högre plattformar och bredare hål.
   Spelet rullar i sidled och kan ge åksjuka för den som blir lätt åksjuk.
   Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.pip{height:100%;display:flex;flex-direction:column;gap:8px;padding:12px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.pip-top{display:flex;align-items:center;gap:10px;min-height:40px;flex-wrap:wrap}
.pip-title{font-size:1.7rem;font-weight:800;line-height:1;margin-right:auto}
.pip-coins{font-weight:800;font-size:1.15rem;background:var(--card,#fff);border-radius:999px;padding:3px 12px;box-shadow:inset 0 0 0 2px var(--line,#C6D1DF)}
.pip-banor{display:flex;gap:6px}
.pip-bana{border:0;border-radius:999px;background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;padding:4px 11px;cursor:pointer;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF)}
.pip-bana.done{background:var(--done,#F2B33D);color:#2B1E00;box-shadow:none}
.pip-bana.cur{box-shadow:0 0 0 3px var(--sky,#DCEAF6),0 0 0 6px var(--accent,#2F6FD6)}
.pip-area{flex:1;min-height:0;position:relative;border-radius:20px;overflow:hidden;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);touch-action:none}
.pip-area canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.pip-pad{position:absolute;bottom:12px;display:flex;gap:12px;z-index:3}
.pip-pad.l{left:12px}.pip-pad.r{right:12px}
.pip-pad button{width:84px;height:84px;border-radius:50%;border:0;background:rgba(255,255,255,.5);font-size:2.2rem;font-weight:900;color:#1D2842;box-shadow:0 4px 0 rgba(0,0,0,.2);touch-action:none;cursor:pointer}
.pip-pad button.jump{width:104px;height:104px;background:rgba(255,214,90,.6);font-size:1.15rem}
.pip-pad button.on{transform:translateY(3px);box-shadow:0 1px 0 rgba(0,0,0,.2);background:#fff;color:#1D2842}
.pip-note{position:absolute;left:50%;top:18%;transform:translateX(-50%);background:rgba(255,255,255,.92);color:#1D2842;border-radius:16px;padding:8px 18px;font-weight:800;font-size:1.2rem;pointer-events:none;opacity:0;transition:opacity .3s;z-index:3;text-align:center}
.pip-note.on{opacity:1}
.pip-end{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:color-mix(in srgb,var(--sky,#DCEAF6) 70%,transparent);z-index:5}
.pip-end.on{display:flex}
.pip-end .big{font-size:clamp(2rem,7vmin,3.4rem);font-weight:800;text-align:center}
.pip-end .sub{font-size:1.3rem;font-weight:800}
.pip-end button{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.2rem;font-weight:800;border-radius:18px;padding:10px 24px;cursor:pointer}
.pip button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}`;

  const T = 40, ROWS = 12, GROUND = 10, CROP = 1.5;   // rutstorlek, rader, översta markraden, rader himmel som inte visas

  // Banorna byggs av korta beskrivningar. big: bara på stor nivå; small: bara på liten nivå.
  // g = mark (x0..x1), w = tegelvägg/trappa, b = block (# tegel, B stjärnblock), c = mynt, s = stubbe, e = snigel.
  const BANOR = [
    {name: 'Ängen', len: 110, sky: ['#8fd3ff', '#dff3ff'], ops: [
      ['g', 0, 30], ['c', 6, 10, 8], ['b', 12, 6, 'B'], ['b', 14, 6, '#'], ['b', 15, 6, 'B'], ['b', 16, 6, '#'],
      ['g', 32, 60, 'small'], ['g', 33, 60, 'big'], ['s', 40, 2], ['c', 44, 48, 7], ['e', 50, 'big'], ['b', 52, 6, 'B'],
      ['g', 62, 110, 'small'], ['g', 63, 110, 'big'], ['w', 70, 72, 1], ['w', 71, 72, 2], ['c', 74, 79, 8], ['e', 82, 'big'], ['b', 86, 6, '#'], ['b', 87, 6, 'B'], ['b', 88, 6, '#']]},
    {name: 'Trappan', len: 120, sky: ['#9ad0ff', '#fff2d6'], ops: [
      ['g', 0, 25], ['w', 10, 13, 1], ['w', 11, 13, 2], ['w', 12, 13, 3], ['c', 11, 13, 5],
      ['g', 27, 50], ['w', 27, 30, 3], ['w', 28, 30, 2], ['w', 29, 30, 1], ['b', 36, 6, 'B'], ['e', 42, 'big'],
      ['g', 52, 120, 'small'], ['g', 53, 120, 'big'], ['w', 60, 64, 1], ['w', 61, 64, 2], ['w', 62, 64, 3], ['w', 63, 64, 4, 'big'],
      ['w', 68, 71, 3], ['w', 68, 70, 2], ['w', 68, 69, 1], ['c', 60, 64, 4], ['e', 78, 'big'], ['e', 86, 'big'], ['b', 82, 6, 'B'], ['b', 83, 6, '#'], ['c', 90, 96, 8]]},
    {name: 'Skogen', len: 120, sky: ['#7cc8ff', '#d8f5d0'], ops: [
      ['g', 0, 120], ['s', 12, 2], ['s', 22, 3], ['c', 22, 23, 6], ['e', 28, 'big'], ['s', 34, 2], ['b', 40, 6, 'B'], ['b', 41, 6, '#'], ['b', 42, 6, 'B'],
      ['s', 50, 3], ['e', 56, 'big'], ['s', 62, 3], ['c', 66, 72, 8], ['e', 74, 'big'], ['s', 80, 2], ['s', 86, 3],
      ['b', 92, 6, '#'], ['b', 93, 6, 'B'], ['b', 94, 6, '#'], ['e', 98, 'big'], ['s', 104, 2]]},
    {name: 'Molnen', len: 115, sky: ['#b6a6ff', '#ffe0f0'], ops: [
      ['g', 0, 14], ['p', 16, 21, 8], ['c', 16, 20, 6], ['p', 23, 28, 7], ['p', 30, 35, 8], ['b', 32, 5, 'B'],
      ['g', 37, 52], ['e', 46, 'big'], ['p', 54, 58, 8], ['p', 60, 64, 7], ['c', 60, 64, 5], ['p', 66, 70, 8],
      ['g', 72, 115], ['w', 82, 84, 1], ['w', 83, 84, 2], ['e', 90, 'big'], ['c', 92, 98, 8], ['b', 96, 6, 'B']]}
  ];

  function build(def, level){
    const W = def.len + 8, grid = Array.from({length: ROWS}, () => new Array(W).fill('.'));
    const coins = [], snails = [];
    const on = o => !o.includes('big') && !o.includes('small') || o.includes(level);
    const set = (x, y, ch) => { if(x >= 0 && x < W && y >= 0 && y < ROWS) grid[y][x] = ch; };
    def.ops.forEach(o => {
      if(!on(o)) return;
      const k = o[0];
      if(k === 'g') for(let x = o[1]; x < o[2]; x++){ set(x, GROUND, '='); set(x, GROUND + 1, '#d'); }
      if(k === 'w') for(let x = o[1]; x < o[2]; x++) for(let h = 1; h <= o[3]; h++) set(x, GROUND - h, 'w');
      if(k === 'b') set(o[1], o[2], o[3]);
      if(k === 'p') for(let x = o[1]; x < o[2]; x++) set(x, o[3], 'm');
      if(k === 's') for(let h = 1; h <= o[2]; h++){ set(o[1], GROUND - h, h === o[2] ? 'S' : 's'); set(o[1] + 1, GROUND - h, h === o[2] ? 'S' : 's'); }
      if(k === 'c'){ const n = o[2] - o[1] + 1; for(let i = 0; i < n; i++) coins.push({x: (o[1] + i) * T + T / 2, y: o[3] * T + T / 2, got: false}); }
      if(k === 'e') snails.push({x: o[1] * T, y: (GROUND - 1) * T + 10, vx: -40, dead: 0});
    });
    const flagX = def.len - 4;
    return {grid, W, coins, snails, flagX};
  }
  const solid = ch => ch === '=' || ch === '#d' || ch === 'w' || ch === '#' || ch === 'B' || ch === 'U' || ch === 's' || ch === 'S' || ch === 'm';

  function start(root, opts){
    opts = opts || {};
    const level = opts.level === 'big' ? 'big' : 'small';
    const SPEED = level === 'big' ? 260 : 210, JUMP = 830, GRAV = 2300;
    const store = opts.storage || {get(){ return null; }, set(){}};
    let prog = null;
    try{ prog = JSON.parse(store.get('banor-' + level) || 'null'); }catch(e){}
    if(!prog || !Array.isArray(prog.done)) prog = {cur: 0, done: []};
    const save = () => { try{ store.set('banor-' + level, JSON.stringify(prog)); }catch(e){} };

    if(!document.getElementById('pip-css')){ const s = document.createElement('style'); s.id = 'pip-css'; s.textContent = CSS; document.head.append(s); }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'pip';
    el.innerHTML = `<div class="pip-top"><div class="pip-title">Pip</div><div class="pip-coins" aria-live="polite"></div><div class="pip-banor" role="group" aria-label="Banor"></div></div>
      <div class="pip-area"><canvas aria-label="Spelplan"></canvas>
        <div class="pip-pad l"><button type="button" data-k="left" aria-label="Vänster">◀</button><button type="button" data-k="right" aria-label="Höger">▶</button></div>
        <div class="pip-pad r"><button type="button" class="jump" data-k="jump" aria-label="Hoppa">Hoppa</button></div>
        <div class="pip-note"></div></div>
      <div class="pip-end" role="dialog" aria-live="polite"><div class="big">Bana klar! 🏁</div><div class="sub"></div><button type="button"></button></div>`;
    root.append(el);
    const cv = el.querySelector('canvas'), g = cv.getContext('2d'), area = el.querySelector('.pip-area'), noteEl = el.querySelector('.pip-note');
    const coinsEl = el.querySelector('.pip-coins'), banorEl = el.querySelector('.pip-banor'), endEl = el.querySelector('.pip-end');

    let ac = null;
    function tone(freqs, vol, type, gap, dur){
      if(!opts.sound) return;
      try{ ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        freqs.forEach((f, i) => { const o = ac.createOscillator(), gg = ac.createGain(), t = ac.currentTime + i * (gap || 0.07);
          o.type = type || 'square'; o.frequency.value = f; gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(vol || 0.05, t + 0.01); gg.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.12));
          o.connect(gg).connect(ac.destination); o.start(t); o.stop(t + (dur || 0.12) + 0.02); }); }catch(e){}
    }
    let noteTimer = null;
    const note = (t, ms) => { noteEl.textContent = t; noteEl.classList.add('on'); clearTimeout(noteTimer); noteTimer = setTimeout(() => noteEl.classList.remove('on'), ms || 1400); };

    let L = null, P = null, cam = 0, coins = 0, finished = false, pops = [], scale = 1, viewW = 800, safe = null, clock = 0;
    const keys = {left: false, right: false, jump: false};
    let jumpBuf = 0, coyote = 0;

    function renderBanor(){
      banorEl.innerHTML = '';
      BANOR.forEach((b, i) => { const btn = document.createElement('button'); btn.type = 'button';
        btn.className = 'pip-bana' + (prog.done[i] ? ' done' : '') + (i === prog.cur ? ' cur' : ''); btn.textContent = i + 1;
        btn.setAttribute('aria-label', `Bana ${i + 1}: ${b.name}` + (prog.done[i] ? ', klar' : '')); btn.addEventListener('click', () => load(i)); banorEl.append(btn); });
    }
    function load(i){
      prog.cur = i; save(); renderBanor(); endEl.classList.remove('on'); finished = false;
      L = build(BANOR[i], level); coins = 0; pops = [];
      P = {x: 2 * T, y: (GROUND - 1) * T, w: 26, h: 34, vx: 0, vy: 0, ground: false, face: 1, hurt: 0, walk: 0};
      safe = {x: P.x, y: P.y}; cam = 0; paintCoins();
      note(BANOR[i].name, 1600);
    }
    const paintCoins = () => { coinsEl.textContent = `🪙 ${coins}`; };
    const tileAt = (px, py) => { const x = Math.floor(px / T), y = Math.floor(py / T); if(y < 0 || x < 0 || x >= L.W) return '.'; if(y >= ROWS) return '.'; return L.grid[y][x]; };
    // Kollision mot rutorna: först i sidled, sedan i höjdled.
    function moveBody(b, dx, dy, onHead){
      b.x += dx;
      for(const yy of [b.y + 2, b.y + b.h / 2, b.y + b.h - 2]){
        if(dx > 0 && solid(tileAt(b.x + b.w, yy))){ b.x = Math.floor((b.x + b.w) / T) * T - b.w - 0.01; b.vx = 0; return moveY(); }
        if(dx < 0 && solid(tileAt(b.x, yy))){ b.x = Math.floor(b.x / T) * T + T + 0.01; b.vx = 0; return moveY(); }
      }
      return moveY();
      function moveY(){
        b.y += dy; b.ground = false;
        for(const xx of [b.x + 3, b.x + b.w - 3]){
          if(dy > 0 && solid(tileAt(xx, b.y + b.h))){ b.y = Math.floor((b.y + b.h) / T) * T - b.h; b.vy = 0; b.ground = true; return; }
          if(dy < 0 && solid(tileAt(xx, b.y))){ const ty = Math.floor(b.y / T); b.y = ty * T + T; b.vy = 0; if(onHead) onHead(Math.floor(xx / T), ty); return; }
        }
      }
    }
    function bump(tx, ty){
      const ch = L.grid[ty][tx];
      if(ch === 'B'){ L.grid[ty][tx] = 'U'; coins++; paintCoins(); pops.push({x: tx * T + T / 2, y: ty * T, t: 0, kind: 'coin'}); tone([988, 1319], 0.06, 'square', 0.06); }
      else if(ch === '#' || ch === 'U'){ tone([160], 0.05, 'square'); pops.push({x: tx * T + T / 2, y: ty * T, t: 0, kind: 'bonk'}); }
      // Snigel på blocket ramlar av.
      L.snails.forEach(s => { if(!s.dead && Math.abs(s.x + 15 - (tx * T + T / 2)) < T && Math.abs(s.y + 20 - ty * T) < 12) squash(s); });
    }
    function squash(s){ s.dead = 0.01; coins++; paintCoins(); pops.push({x: s.x + 15, y: s.y, t: 0, kind: 'coin'}); tone([660, 880], 0.06, 'square', 0.05); }
    function step(dt){
      clock += dt;
      pops.forEach(p => p.t += dt); pops = pops.filter(p => p.t < 0.7);
      if(finished || !L) return;
      // Styrning med lite tröghet, så att det är lätt att träffa.
      const want = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      if(P.hurt > 0) P.hurt -= dt;
      const acc = P.ground ? 2200 : 1400;
      if(want){ P.vx += want * acc * dt; P.face = want; } else { const f = (P.ground ? 2400 : 600) * dt; P.vx = Math.abs(P.vx) <= f ? 0 : P.vx - Math.sign(P.vx) * f; }
      P.vx = Math.max(-SPEED, Math.min(SPEED, P.vx));
      // Hopp: hoppbuffert och lite extra tid efter en kant gör det förlåtande. Kort tryck ger lägre hopp.
      jumpBuf = Math.max(0, jumpBuf - dt); coyote = P.ground ? 0.1 : Math.max(0, coyote - dt);
      if(jumpBuf > 0 && coyote > 0){ P.vy = -JUMP; jumpBuf = 0; coyote = 0; tone([392, 523], 0.04, 'square', 0.04); }
      if(!keys.jump && P.vy < -300) P.vy = -300;
      P.vy = Math.min(900, P.vy + GRAV * dt);
      moveBody(P, P.vx * dt, P.vy * dt, bump);
      if(P.ground && Math.abs(P.vx) > 10) P.walk += dt * Math.abs(P.vx) / 30;
      // Senaste säkra mark: där Pip stod stadigt med mark under båda fötterna.
      if(P.ground && solid(tileAt(P.x + 2, P.y + P.h + 4)) && solid(tileAt(P.x + P.w - 2, P.y + P.h + 4))) safe = {x: P.x, y: P.y};
      if(P.x < 0) P.x = 0;
      // Ramlar ned: tillbaka till säker mark.
      if(P.y > ROWS * T + 40){ P.x = safe.x; P.y = safe.y - 4; P.vx = 0; P.vy = 0; P.hurt = 1; note('Hoppsan!', 1100); tone([523, 392, 262], 0.05, 'triangle', 0.09); }
      // Mynt.
      L.coins.forEach(c => { if(!c.got && Math.abs(c.x - (P.x + P.w / 2)) < 24 && Math.abs(c.y - (P.y + P.h / 2)) < 28){ c.got = true; coins++; paintCoins(); tone([988, 1319], 0.05, 'square', 0.05); } });
      // Sniglar: kryper sakta och vänder vid väggar och kanter. Hopp ovanifrån plattar till dem, annars puttas Pip undan.
      L.snails.forEach(s => {
        if(s.dead){ s.dead += dt; return; }
        const nx = s.x + s.vx * dt, ahead = s.vx < 0 ? nx : nx + 30;
        if(solid(tileAt(ahead, s.y + 10)) || !solid(tileAt(ahead, s.y + 34))) s.vx = -s.vx; else s.x = nx;
        if(P.x + P.w > s.x + 2 && P.x < s.x + 28 && P.y + P.h > s.y + 4 && P.y < s.y + 28){
          if(P.vy > 0 && P.y + P.h - s.y < 18){ squash(s); P.vy = -520; }
          else if(P.hurt <= 0){ P.hurt = 1; P.vx = (P.x < s.x ? -1 : 1) * 320; P.vy = -380; tone([300, 200], 0.05, 'triangle', 0.08); }
        }
      });
      // Flaggan.
      if(P.x + P.w > L.flagX * T + 14){ win(); }
      // Kameran följer mjukt i sidled.
      const targetCam = Math.max(0, Math.min(L.W * T - viewW, P.x - viewW * 0.38));
      cam += (targetCam - cam) * Math.min(1, dt * 5);
    }
    function win(){
      finished = true; prog.done[prog.cur] = true; save(); renderBanor();
      [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => tone([f], 0.06, 'square', 0, 0.2), i * 110));
      const total = L.coins.length + L.grid.flat().filter(c => c === 'B' || c === 'U').length + L.snails.length;
      endEl.querySelector('.sub').textContent = `🪙 ${coins} mynt`;
      const last = prog.cur === BANOR.length - 1;
      const btn = endEl.querySelector('button'); btn.textContent = last ? 'Börja om från bana 1' : 'Nästa bana';
      btn.onclick = () => load((prog.cur + 1) % BANOR.length);
      setTimeout(() => endEl.classList.add('on'), 700);
      if(typeof opts.onFinish === 'function') opts.onFinish();
      return total;
    }

    // ---------- Ritning ----------
    function rr(x, y, w, h, r){ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
    function draw(){
      if(!L) return;
      const H = ROWS * T, def = BANOR[prog.cur];
      const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, def.sky[0]); sky.addColorStop(1, def.sky[1]);
      g.fillStyle = sky; g.fillRect(0, CROP * T - 2, viewW, H);
      // Kullar och moln längre bort rör sig långsammare.
      g.fillStyle = 'rgba(120,200,120,.45)';
      for(let i = -1; i < viewW / 300 + 2; i++){ const x = i * 300 - (cam * 0.3) % 300; g.beginPath(); g.ellipse(x + 150, H - 2 * T, 190, 110, 0, Math.PI, 0); g.fill(); }
      g.fillStyle = 'rgba(255,255,255,.85)';
      for(let i = -1; i < viewW / 420 + 2; i++){ const x = i * 420 - (cam * 0.15) % 420 + 80; [[0, 0, 34], [30, -10, 40], [64, 0, 30]].forEach(([dx, dy, r]) => { g.beginPath(); g.arc(x + dx, 90 + dy + (i % 2) * 30, r, 0, Math.PI * 2); g.fill(); }); }
      g.save(); g.translate(-Math.round(cam), 0);
      const x0 = Math.max(0, Math.floor(cam / T) - 1), x1 = Math.min(L.W, Math.ceil((cam + viewW) / T) + 1);
      for(let y = 0; y < ROWS; y++) for(let x = x0; x < x1; x++){
        const ch = L.grid[y][x], X = x * T, Y = y * T;
        if(ch === '='){ g.fillStyle = '#9a6234'; g.fillRect(X, Y, T, T); g.fillStyle = '#4caf50'; g.fillRect(X, Y, T, 12); g.fillStyle = '#6fd36f'; g.fillRect(X, Y, T, 4); }
        else if(ch === '#d'){ g.fillStyle = '#8a5a2b'; g.fillRect(X, Y, T, T); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(X + 8, Y + 10, 6, 6); g.fillRect(X + 26, Y + 24, 5, 5); }
        else if(ch === 'w'){ g.fillStyle = '#b5743c'; g.fillRect(X, Y, T, T); g.strokeStyle = '#7a4a1f'; g.lineWidth = 2; g.strokeRect(X + 1, Y + 1, T - 2, T - 2); g.beginPath(); g.moveTo(X, Y + T / 2); g.lineTo(X + T, Y + T / 2); g.stroke(); }
        else if(ch === '#'){ g.fillStyle = '#c8763c'; rr(X + 1, Y + 1, T - 2, T - 2, 4); g.fill(); g.strokeStyle = '#7a3f1a'; g.lineWidth = 2; g.beginPath(); g.moveTo(X, Y + T / 2); g.lineTo(X + T, Y + T / 2); g.moveTo(X + T / 2, Y); g.lineTo(X + T / 2, Y + T / 2); g.stroke(); }
        else if(ch === 'B'){ const k = 1 + Math.sin(clock * 4) * 0.05; g.fillStyle = '#f5c02e'; rr(X + 1, Y + 1, T - 2, T - 2, 6); g.fill(); g.strokeStyle = '#b8860b'; g.lineWidth = 3; g.stroke();
          g.font = `${Math.round(22 * k)}px system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('⭐', X + T / 2, Y + T / 2 + 1); }
        else if(ch === 'U'){ g.fillStyle = '#a07a4a'; rr(X + 1, Y + 1, T - 2, T - 2, 6); g.fill(); g.strokeStyle = '#6b4f2a'; g.lineWidth = 3; g.stroke(); }
        else if(ch === 'm'){ g.fillStyle = '#fff'; rr(X - 2, Y + 4, T + 4, T - 12, 14); g.fill(); g.fillStyle = 'rgba(180,190,230,.5)'; g.fillRect(X, Y + T - 14, T, 4); }
        else if(ch === 's' || ch === 'S'){ g.fillStyle = '#8b5a2b'; g.fillRect(X + (L.grid[y][x - 1] === ch ? -1 : 4), Y, T - 3, T); if(ch === 'S'){ g.fillStyle = '#d9a066'; g.fillRect(X + (L.grid[y][x - 1] === 'S' ? -1 : 4), Y, T - 3, 8); } }
      }
      // Flaggan.
      const fx = L.flagX * T + 18;
      g.fillStyle = '#ddd'; g.fillRect(fx, 2 * T, 5, (GROUND - 2) * T); g.fillStyle = '#f5c02e'; g.beginPath(); g.arc(fx + 2.5, 2 * T, 8, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#e8473c'; g.beginPath(); g.moveTo(fx + 5, 2 * T + 8); g.lineTo(fx + 62, 2 * T + 30); g.lineTo(fx + 5, 2 * T + 52); g.fill();
      // Mynt som snurrar.
      L.coins.forEach(c => { if(c.got) return; const w = Math.abs(Math.cos(clock * 3 + c.x * 0.02)) * 11 + 2; g.fillStyle = '#f5c02e'; g.beginPath(); g.ellipse(c.x, c.y, w, 13, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#b8860b'; g.lineWidth = 2; g.stroke(); });
      // Sniglar.
      L.snails.forEach(s => {
        if(s.dead > 0.6) return;
        const sq = s.dead ? 0.4 : 1, dir = s.vx < 0 ? -1 : 1, bx = s.x + 15, by = s.y + 30;
        g.globalAlpha = s.dead ? Math.max(0, 1 - s.dead / 0.6) : 1;
        g.fillStyle = '#9fd36f'; rr(bx - 18, by - 8 * sq, 36, 8 * sq, 4); g.fill();
        g.fillStyle = '#e88a3c'; g.beginPath(); g.ellipse(bx - dir * 3, by - 14 * sq, 14, 14 * sq, 0, 0, Math.PI * 2); g.fill();
        g.strokeStyle = '#a5531c'; g.lineWidth = 2.5; g.beginPath(); g.arc(bx - dir * 3, by - 14 * sq, 7 * sq, 0, Math.PI * 1.6); g.stroke();
        if(!s.dead){ g.strokeStyle = '#6aa84f'; g.lineWidth = 2; g.beginPath(); g.moveTo(bx + dir * 14, by - 6); g.lineTo(bx + dir * 20, by - 18); g.stroke(); g.fillStyle = '#222'; g.beginPath(); g.arc(bx + dir * 20, by - 19, 2.5, 0, Math.PI * 2); g.fill(); }
        g.globalAlpha = 1;
      });
      // Pip: rund orange figur med vit mage, öron och fötter som springer.
      if(!(P.hurt > 0 && Math.floor(clock * 12) % 2)){
        const cx = P.x + P.w / 2, cy = P.y + P.h / 2 + 2, f = P.face, legs = P.ground ? Math.sin(P.walk) * 5 : 4;
        g.fillStyle = '#5b3a1a'; g.beginPath(); g.ellipse(cx - 6 + legs, P.y + P.h - 2, 7, 4, 0, 0, Math.PI * 2); g.ellipse(cx + 6 - legs, P.y + P.h - 2, 7, 4, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#ff9a3c'; g.beginPath(); g.ellipse(cx - 8, cy - 16, 5, 8, -0.3, 0, Math.PI * 2); g.ellipse(cx + 8, cy - 16, 5, 8, 0.3, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.ellipse(cx, cy, 16, 17, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#fff1dc'; g.beginPath(); g.ellipse(cx + f * 3, cy + 5, 9, 9, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.arc(cx + f * 6, cy - 5, 5, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#1D2842'; g.beginPath(); g.arc(cx + f * 7.5, cy - 5, 2.6, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#ff6f6f'; g.beginPath(); g.arc(cx + f * 12, cy + 1, 2.5, 0, Math.PI * 2); g.fill();
      }
      // Små effekter: mynt som hoppar upp ur block och sniglar.
      pops.forEach(p => {
        if(p.kind === 'coin'){ const y = p.y - 10 - p.t * 120 + p.t * p.t * 160; g.globalAlpha = 1 - p.t / 0.7; g.fillStyle = '#f5c02e'; g.beginPath(); g.ellipse(p.x, y, 10, 12, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
        if(p.kind === 'bonk'){ g.globalAlpha = 1 - p.t / 0.7; g.strokeStyle = '#fff'; g.lineWidth = 3; for(let i = 0; i < 3; i++){ g.beginPath(); g.moveTo(p.x - 12 + i * 12, p.y - 4); g.lineTo(p.x - 16 + i * 16, p.y - 14 - p.t * 20); g.stroke(); } g.globalAlpha = 1; }
      });
      g.restore();
    }
    function layout(){
      const w = area.clientWidth, h = area.clientHeight; if(!w || !h) return;
      const dpr = window.devicePixelRatio || 1;
      cv.width = w * dpr; cv.height = h * dpr;
      scale = h / ((ROWS - CROP) * T); viewW = w / scale;
      g.setTransform(scale * dpr, 0, 0, scale * dpr, 0, -CROP * T * scale * dpr);
    }

    // ---------- Styrning ----------
    el.querySelectorAll('.pip-pad button').forEach(b => {
      const k = b.dataset.k;
      const down = e => { e.preventDefault(); try{ b.setPointerCapture(e.pointerId); }catch(x){} keys[k] = true; b.classList.add('on'); if(k === 'jump') jumpBuf = 0.15; };
      const up = () => { keys[k] = false; b.classList.remove('on'); };
      b.addEventListener('pointerdown', down); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
    });
    const KEYMAP = {ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'jump', ' ': 'jump'};
    const onKey = e => { const k = KEYMAP[e.key]; if(!k) return; e.preventDefault(); const d = e.type === 'keydown'; if(d && k === 'jump' && !keys.jump) jumpBuf = 0.15; keys[k] = d; };
    window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey);

    let raf = 0, last = 0;
    function frame(t){
      raf = requestAnimationFrame(frame);
      let dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
      while(dt > 0){ const h = Math.min(dt, 1 / 120); step(h); dt -= h; }
      draw();
    }
    const ro = window.ResizeObserver ? new ResizeObserver(layout) : null; if(ro) ro.observe(area);
    layout(); load(Math.min(prog.cur || 0, BANOR.length - 1)); raf = requestAnimationFrame(frame);

    return {
      stop(){ cancelAnimationFrame(raf); clearTimeout(noteTimer); if(ro) ro.disconnect(); window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); try{ if(ac) ac.close(); }catch(e){} root.innerHTML = ''; },
      _test: {keys, step: dt => step(dt), P: () => P, L: () => L, finished: () => finished, coins: () => coins, load, jump: () => { jumpBuf = 0.15; }, tileAt: (x, y) => tileAt(x, y)}
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'pip', title: 'Pip', icon: '🦊',
    about: 'Spring och hoppa till flaggan med Pip, samla mynt och stöt i stjärnblocken. Inga liv: ramlar man ned kommer man tillbaka. 4 banor. Stor nivå: sniglar och bredare hål. Spelet rullar i sidled – den som lätt blir åksjuk bör spela en kort stund i taget.',
    start
  });
})();
