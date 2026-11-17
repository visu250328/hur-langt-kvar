/* Godisbyte – byt plats på två godisbitar så att tre eller fler i rad försvinner och fyll godisburken.
   Inga begränsade drag och inget sätt att förlora; ledtråd när barnet kör fast och automatisk omblandning.
   Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.gd{height:100%;display:flex;flex-direction:column;gap:12px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.gd-top{display:flex;align-items:center;gap:14px;min-height:48px}
.gd-title{font-size:1.7rem;font-weight:800;line-height:1}
.gd-jar{flex:1;display:flex;align-items:center;gap:10px;min-width:120px}
.gd-bar{flex:1;height:22px;border-radius:999px;background:var(--card,#fff);box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);overflow:hidden}
.gd-fill{height:100%;width:0;border-radius:999px;background:linear-gradient(90deg,#ff7aa8,#f5c02e,#43b55a,#3b7fe0);transition:width .4s ease}
.gd-count{font-weight:800;font-size:1.2rem;white-space:nowrap}
.gd-new{border:2px solid var(--line,#C6D1DF);background:var(--card,#fff);color:inherit;font:inherit;font-weight:700;border-radius:999px;padding:5px 14px;cursor:pointer;flex:none}
.gd-new.sure{background:var(--done,#F2B33D);border-color:var(--done,#F2B33D);color:#2B1E00}
.gd-area{flex:1;min-height:0;position:relative;touch-action:none}
.gd-board{position:absolute;border-radius:22px;background:#f7e6ff;box-shadow:inset 0 0 0 4px #e3c6f5}
.gd-c{position:absolute;left:0;top:0;cursor:pointer;touch-action:none;transition:transform .28s ease-in}
.gd-c svg{width:100%;height:100%;display:block;pointer-events:none;transition:transform .18s ease,opacity .18s ease}
.gd-c.sel svg{transform:scale(1.14);filter:drop-shadow(0 0 6px #fff)}
.gd-c.pop svg{transform:scale(0);opacity:0}
.gd-c.hint svg{animation:gd-wiggle .9s ease-in-out infinite}
.gd-c.fast{transition:transform .18s ease}
.gd-note{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);font-size:clamp(1.8rem,6vmin,3.2rem);font-weight:800;color:#fff;
  text-shadow:0 2px 0 #9a5bd6,0 0 12px #9a5bd6;pointer-events:none;opacity:0;transition:opacity .2s;z-index:4;white-space:nowrap}
.gd-note.on{opacity:1}
.gd-end{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;
  background:color-mix(in srgb,var(--sky,#DCEAF6) 80%,transparent);border-radius:inherit;z-index:10}
.gd-end.on{display:flex}
.gd-end .big{font-size:clamp(2.4rem,8vmin,4.5rem);font-weight:800;line-height:1}
.gd-end .stars{font-size:clamp(2.4rem,8vmin,4.5rem);line-height:1}
.gd-end.on .stars{animation:gd-hop .8s ease-out 2}
.gd-end button{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.3rem;font-weight:800;border-radius:18px;padding:12px 26px;cursor:pointer;margin-top:8px}
.gd button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
@keyframes gd-wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-12deg) scale(1.06)}75%{transform:rotate(12deg) scale(1.06)}}
@keyframes gd-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-18px)}}
@media (prefers-reduced-motion: reduce){ .gd-c,.gd-c svg{transition:none} .gd-c.hint svg,.gd-end.on .stars{animation:none} }`;

  // Godisbitarna skiljer sig både i färg och form.
  const gloss = '<ellipse cx="38" cy="32" rx="12" ry="8" fill="#fff" opacity=".45" transform="rotate(-25 38 32)"/>';
  const CANDY = [
    {name: 'röd', svg: `<circle cx="50" cy="50" r="38" fill="#e8473c" stroke="#b5291f" stroke-width="5"/><circle cx="50" cy="50" r="18" fill="none" stroke="#fff" stroke-width="5" opacity=".5"/>${gloss}`},
    {name: 'blå', svg: `<rect x="14" y="14" width="72" height="72" rx="18" fill="#3b7fe0" stroke="#1f56a8" stroke-width="5"/>${gloss}`},
    {name: 'gul', svg: `<path d="M50 8 L61 36 L91 37 L67 56 L76 86 L50 68 L24 86 L33 56 L9 37 L39 36 Z" fill="#f5c02e" stroke="#c9930a" stroke-width="5" stroke-linejoin="round"/>${gloss}`},
    {name: 'grön', svg: `<path d="M50 10 L90 82 Q92 88 86 88 L14 88 Q8 88 10 82 Z" fill="#43b55a" stroke="#257a37" stroke-width="5" stroke-linejoin="round"/>${gloss}`},
    {name: 'lila', svg: `<path d="M50 6 L90 50 L50 94 L10 50 Z" fill="#9a5bd6" stroke="#6a35a3" stroke-width="5" stroke-linejoin="round"/>${gloss}`},
    {name: 'rosa', svg: `<path d="M50 86 C10 60 8 30 30 20 C42 15 50 26 50 30 C50 26 58 15 70 20 C92 30 90 60 50 86 Z" fill="#ff7aa8" stroke="#d2457a" stroke-width="5" stroke-linejoin="round"/>${gloss}`}
  ];
  const LEVELS = {small: {n: 6, kinds: 4, goal: 40}, big: {n: 8, kinds: 5, goal: 80}};
  const HINT_MS = 6000;

  function start(root, opts){
    opts = opts || {};
    const level = opts.level === 'big' ? 'big' : 'small';
    const L = LEVELS[level], N = L.n;
    const store = opts.storage || {get(){ return null; }, set(){}};
    const key = 'bricka-' + level;

    if(!document.getElementById('gd-css')){
      const s = document.createElement('style'); s.id = 'gd-css'; s.textContent = CSS; document.head.append(s);
    }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'gd';
    el.innerHTML = `
      <div class="gd-top"><div class="gd-title">Godisbyte</div>
        <div class="gd-jar"><div class="gd-bar"><div class="gd-fill"></div></div><div class="gd-count" aria-live="polite"></div></div>
        <button type="button" class="gd-new">Nytt bräde</button></div>
      <div class="gd-area"><div class="gd-board"></div><div class="gd-note"></div></div>
      <div class="gd-end" role="dialog" aria-live="polite"><div class="stars">🍬🍭🍬</div><div class="big">Burken är full!</div><button type="button">Spela igen</button></div>`;
    root.append(el);
    const area = el.querySelector('.gd-area'), boardEl = el.querySelector('.gd-board'), noteEl = el.querySelector('.gd-note');
    const fillEl = el.querySelector('.gd-fill'), countEl = el.querySelector('.gd-count'), endEl = el.querySelector('.gd-end'), newBtn = el.querySelector('.gd-new');

    // ---------- Ljud ----------
    let ac = null;
    function tone(freqs, vol, type){
      if(!opts.sound) return;
      try{
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        freqs.forEach((f, i) => {
          const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * 0.08;
          o.type = type || 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.13, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
          o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.25);
        });
      }catch(e){}
    }

    // ---------- Brädet ----------
    // board[r][c] = {k: godissort, el: element}
    let board = [], collected = 0, busy = false, done = false, cell = 50, ox = 0, oy = 0, nextId = 0;
    const rand = () => Math.floor(Math.random() * L.kinds);

    function makeEl(k){
      const d = document.createElement('div');
      d.className = 'gd-c'; d.dataset.id = nextId++; d.dataset.k = k;
      d.setAttribute('role', 'button'); d.setAttribute('aria-label', CANDY[k].name + ' godis');
      d.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true">${CANDY[k].svg}</svg>`;
      d.addEventListener('pointerdown', e => down(e, d));
      boardEl.append(d);
      return d;
    }
    function setPos(d, r, c){ d.style.transform = `translate(${c * cell}px, ${r * cell}px)`; }
    const find = d => { for(let r = 0; r < N; r++) for(let c = 0; c < N; c++) if(board[r][c] && board[r][c].el === d) return [r, c]; return null; };

    // Fyll utan färdiga rader.
    function fresh(kinds){
      boardEl.innerHTML = ''; board = [];
      for(let r = 0; r < N; r++){
        board.push([]);
        for(let c = 0; c < N; c++){
          let k = kinds ? kinds[r][c] : rand(), guard = 0;
          while(!kinds && guard++ < 20 && ((c >= 2 && board[r][c - 1].k === k && board[r][c - 2].k === k) || (r >= 2 && board[r - 1][c].k === k && board[r - 2][c].k === k))) k = rand();
          const d = makeEl(k); board[r].push({k, el: d});
        }
      }
      layout();
      if(!kinds && !hasMove()) fresh();
    }

    function layout(){
      const W = area.clientWidth, H = area.clientHeight;
      if(!W || !H) return;
      cell = Math.floor(Math.min(W, H) / N);
      const S = cell * N; ox = (W - S) / 2; oy = (H - S) / 2;
      Object.assign(boardEl.style, {left: ox + 'px', top: oy + 'px', width: S + 'px', height: S + 'px'});
      for(let r = 0; r < N; r++) for(let c = 0; c < N; c++){
        const b = board[r] && board[r][c]; if(!b) continue;
        b.el.style.width = b.el.style.height = cell + 'px';
        b.el.classList.add('fast'); setPos(b.el, r, c);
      }
      requestAnimationFrame(() => boardEl.querySelectorAll('.gd-c.fast').forEach(d => d.classList.remove('fast')));
    }

    function matches(){
      const hit = new Set();
      for(let r = 0; r < N; r++){
        let run = 1;
        for(let c = 1; c <= N; c++){
          if(c < N && board[r][c].k === board[r][c - 1].k) run++;
          else { if(run >= 3) for(let k = 1; k <= run; k++) hit.add(r * N + c - k); run = 1; }
        }
      }
      for(let c = 0; c < N; c++){
        let run = 1;
        for(let r = 1; r <= N; r++){
          if(r < N && board[r][c].k === board[r - 1][c].k) run++;
          else { if(run >= 3) for(let k = 1; k <= run; k++) hit.add((r - k) * N + c); run = 1; }
        }
      }
      return hit;
    }
    function swapCells(a, b){ const t = board[a[0]][a[1]]; board[a[0]][a[1]] = board[b[0]][b[1]]; board[b[0]][b[1]] = t; }
    function moveFor(){
      for(let r = 0; r < N; r++) for(let c = 0; c < N; c++) for(const [dr, dc] of [[0, 1], [1, 0]]){
        const r2 = r + dr, c2 = c + dc; if(r2 >= N || c2 >= N) continue;
        swapCells([r, c], [r2, c2]); const ok = matches().size > 0; swapCells([r, c], [r2, c2]);
        if(ok) return [[r, c], [r2, c2]];
      }
      return null;
    }
    const hasMove = () => !!moveFor();
    const wait = ms => new Promise(res => setTimeout(res, ms));

    // ---------- Byta ----------
    let selected = null, hintTimer = null;
    function select(d){ if(selected) selected.classList.remove('sel'); selected = d; if(d) d.classList.add('sel'); }
    function idle(){
      clearTimeout(hintTimer);
      boardEl.querySelectorAll('.hint').forEach(d => d.classList.remove('hint'));
      hintTimer = setTimeout(() => {
        if(busy || done) return;
        const m = moveFor(); if(!m) return;
        m.forEach(([r, c]) => board[r][c].el.classList.add('hint'));
      }, HINT_MS);
    }

    function down(e, d){
      if(busy || done) return;
      e.preventDefault();
      d.setPointerCapture && d.setPointerCapture(e.pointerId);
      const x0 = e.clientX, y0 = e.clientY, k = (area.getBoundingClientRect().width / (area.clientWidth || 1)) || 1;
      let swiped = false;
      const move = ev => {
        if(swiped) return;
        const dx = (ev.clientX - x0) / k, dy = (ev.clientY - y0) / k;
        if(Math.hypot(dx, dy) < cell * 0.35) return;
        swiped = true;
        const a = find(d); if(!a) return;
        const b = Math.abs(dx) > Math.abs(dy) ? [a[0], a[1] + Math.sign(dx)] : [a[0] + Math.sign(dy), a[1]];
        select(null); trySwap(a, b);
      };
      const up = () => {
        d.removeEventListener('pointermove', move); d.removeEventListener('pointerup', up); d.removeEventListener('pointercancel', up);
        if(swiped) return;
        // Tryck på en bit och sedan på en bredvid fungerar också.
        const a = selected && find(selected), b = find(d);
        if(a && b && Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1){ select(null); trySwap(a, b); }
        else if(selected === d) select(null);
        else { select(d); tone([500], 0.05); }
      };
      d.addEventListener('pointermove', move); d.addEventListener('pointerup', up); d.addEventListener('pointercancel', up);
    }

    async function trySwap(a, b){
      if(b[0] < 0 || b[1] < 0 || b[0] >= N || b[1] >= N || busy) return;
      busy = true; idle();
      const A = board[a[0]][a[1]], B = board[b[0]][b[1]];
      swapCells(a, b); setPos(A.el, b[0], b[1]); setPos(B.el, a[0], a[1]);
      await wait(260);
      if(matches().size === 0){
        // Inga tre i rad: bitarna glider tillbaka. Inget straff.
        tone([260], 0.05);
        swapCells(a, b); setPos(A.el, a[0], a[1]); setPos(B.el, b[0], b[1]);
        await wait(260);
        busy = false; idle();
        return;
      }
      await resolve();
      busy = false;
      if(!done) idle();
    }

    // Ta bort rader, låt bitarna falla och fyll på, om och om igen så länge nya rader uppstår.
    async function resolve(){
      let combo = 0;
      while(true){
        const hit = matches();
        if(!hit.size) break;
        combo++;
        hit.forEach(i => { const b = board[Math.floor(i / N)][i % N]; b.el.classList.add('pop'); });
        tone([523 + combo * 70, 659 + combo * 70], 0.11);
        if(combo >= 2) note(combo >= 4 ? 'Fantastiskt!' : combo === 3 ? 'Superbra!' : 'Snyggt!');
        collected += hit.size; updateJar();
        await wait(200);
        hit.forEach(i => { const r = Math.floor(i / N), c = i % N; board[r][c].el.remove(); board[r][c] = null; });
        for(let c = 0; c < N; c++){
          let write = N - 1;
          for(let r = N - 1; r >= 0; r--){
            if(board[r][c]){ if(write !== r){ board[write][c] = board[r][c]; board[r][c] = null; setPos(board[write][c].el, write, c); } write--; }
          }
          for(let r = write, k = 1; r >= 0; r--, k++){
            const kk = rand(), d = makeEl(kk);
            d.style.width = d.style.height = cell + 'px';
            d.classList.add('fast'); setPos(d, -k, c);
            board[r][c] = {k: kk, el: d};
            requestAnimationFrame(() => requestAnimationFrame(() => { d.classList.remove('fast'); setPos(d, r, c); }));
          }
        }
        await wait(330);
      }
      save();
      if(collected >= L.goal){ finish(); return; }
      if(!hasMove()){
        note('Vi blandar om!'); await wait(800);
        reshuffle();
      }
    }

    function reshuffle(){
      const kinds = board.flat().map(b => b.k).sort(() => Math.random() - 0.5);
      let tries = 0;
      do{
        for(let i = kinds.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [kinds[i], kinds[j]] = [kinds[j], kinds[i]]; }
        board.forEach((row, r) => row.forEach((b, c) => b.k = kinds[r * N + c]));
      }while(++tries < 50 && (matches().size || !hasMove()));
      if(matches().size || !hasMove()){ fresh(); return; }
      board.forEach(row => row.forEach(b => { b.el.querySelector('svg').innerHTML = CANDY[b.k].svg; b.el.dataset.k = b.k; b.el.setAttribute('aria-label', CANDY[b.k].name + ' godis'); }));
      save();
    }

    let noteTimer = null;
    function note(t){ noteEl.textContent = t; noteEl.classList.add('on'); clearTimeout(noteTimer); noteTimer = setTimeout(() => noteEl.classList.remove('on'), 900); }
    function updateJar(){
      const k = Math.min(1, collected / L.goal);
      fillEl.style.width = (k * 100) + '%';
      countEl.textContent = `🍬 ${Math.min(collected, L.goal)} av ${L.goal}`;
    }

    function finish(){
      done = true; clearTimeout(hintTimer); save();
      tone([523, 659, 784, 1047]);
      setTimeout(() => endEl.classList.add('on'), 400);
      if(typeof opts.onFinish === 'function') opts.onFinish();
    }

    function save(){ try{ store.set(key, JSON.stringify({kinds: board.map(row => row.map(b => b.k)), collected, done})); }catch(e){} }
    function restart(){ done = false; collected = 0; endEl.classList.remove('on'); select(null); fresh(); updateJar(); save(); idle(); }

    endEl.querySelector('button').addEventListener('click', restart);
    let sureTimer = null;
    function resetBtn(){ clearTimeout(sureTimer); newBtn.classList.remove('sure'); newBtn.textContent = 'Nytt bräde'; }
    newBtn.addEventListener('click', () => {
      if(busy) return;
      if(done){ resetBtn(); restart(); return; }
      if(!newBtn.classList.contains('sure')){
        newBtn.classList.add('sure'); newBtn.textContent = 'Tryck igen för nytt bräde';
        sureTimer = setTimeout(resetBtn, 3000);
        return;
      }
      resetBtn(); restart();
    });

    const ro = window.ResizeObserver ? new ResizeObserver(layout) : null;
    if(ro) ro.observe(area); else window.addEventListener('resize', layout);

    // Fortsätt ett sparat bräde.
    let saved = null;
    try{ saved = JSON.parse(store.get(key) || 'null'); }catch(e){}
    if(saved && Array.isArray(saved.kinds) && saved.kinds.length === N && !saved.done){ collected = saved.collected || 0; fresh(saved.kinds); if(!hasMove()) reshuffle(); }
    else fresh();
    updateJar(); idle();

    return {
      stop(){
        clearTimeout(hintTimer); clearTimeout(noteTimer); clearTimeout(sureTimer);
        if(ro) ro.disconnect(); else window.removeEventListener('resize', layout);
        try{ if(ac) ac.close(); }catch(e){}
        root.innerHTML = '';
      }
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'godis', title: 'Godisbyte', icon: '🍬',
    about: 'Byt plats på två godisbitar så att tre eller fler likadana hamnar i rad. Fyll godisburken. Inga begränsade drag, ledtråd om man kör fast. Liten: 6 × 6 och 4 sorter, 40 godis. Stor: 8 × 8 och 5 sorter, 80 godis.',
    start
  });
})();
