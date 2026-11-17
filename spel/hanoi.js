/* Tornet – flytta hela tornet av ringar till pinnen med flaggan (Tornet i Hanoi). En ring i taget, och en
   större ring får inte ligga på en mindre: försöker man skakar ringen och glider tillbaka, utan straff.
   Tryck på en pinne för att lyfta översta ringen och på en annan pinne för att lägga den, eller dra.
   Ledtråd efter en stund utan drag. Liten: 2 och 3 ringar. Stor: 3, 4 och 5 ringar. Nästa storlek låses
   upp när den förra är klar. Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.th{height:100%;display:flex;flex-direction:column;gap:10px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.th-top{display:flex;align-items:center;gap:10px;min-height:44px;flex-wrap:wrap}
.th-title{font-size:1.7rem;font-weight:800;line-height:1;margin-right:auto}
.th-lvls{display:flex;gap:6px}
.th-lvl{border:0;border-radius:999px;background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;padding:5px 12px;cursor:pointer;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF)}
.th-lvl.done{background:var(--done,#F2B33D);color:#2B1E00;box-shadow:none}
.th-lvl.cur{box-shadow:0 0 0 3px var(--sky,#DCEAF6),0 0 0 6px var(--accent,#2F6FD6)}
.th-lvl:disabled{opacity:.45;cursor:default}
.th-board{flex:1;min-height:0;position:relative;border-radius:24px;background:linear-gradient(#cfe8ff,#eaf5ff);box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);overflow:hidden;touch-action:none;cursor:pointer}
.th-base{position:absolute;left:4%;right:4%;height:5%;bottom:8%;border-radius:10px;background:linear-gradient(#b07a45,#8a5a2b);box-shadow:0 4px 0 #5b3a1a}
.th-peg{position:absolute;width:2.6%;border-radius:8px 8px 0 0;background:linear-gradient(90deg,#a06a38,#d19a62,#a06a38);transform:translateX(-50%);transition:box-shadow .3s}
.th-peg.hint{box-shadow:0 0 0 6px rgba(245,192,46,.55),0 0 22px 8px rgba(245,192,46,.6)}
.th-flag{position:absolute;font-size:2rem;transform:translateX(-50%);pointer-events:none}
.th-frog{position:absolute;font-size:3rem;transform:translateX(-50%);pointer-events:none;transition:bottom .4s}
.th-frog.cheer{animation:th-hop .5s ease 4}
.th-ring{position:absolute;border-radius:999px;box-shadow:inset 0 -6px 0 rgba(0,0,0,.18),inset 0 5px 0 rgba(255,255,255,.35),0 2px 0 rgba(0,0,0,.2);transition:left .28s ease,top .28s ease;pointer-events:none}
.th-ring.drag{transition:none}
.th-ring.lift{box-shadow:inset 0 -6px 0 rgba(0,0,0,.18),inset 0 5px 0 rgba(255,255,255,.35),0 10px 16px rgba(0,0,0,.25)}
.th-ring.hint{animation:th-pulse 1s ease-in-out infinite}
.th-ring.bad{animation:th-shake .4s ease}
.th-end{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:color-mix(in srgb,var(--sky,#DCEAF6) 70%,transparent);z-index:5}
.th-end.on{display:flex}
.th-end .big{font-size:clamp(2rem,7vmin,3.4rem);font-weight:800;text-align:center}
.th-end .stars{font-size:3rem}
.th-end .sub{font-size:1.2rem;font-weight:700;color:var(--muted,#56617A)}
.th-end button{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.2rem;font-weight:800;border-radius:18px;padding:10px 24px;cursor:pointer}
.th button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
@keyframes th-pulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.35) drop-shadow(0 0 8px #fff)}}
@keyframes th-shake{0%,100%{margin-left:0}25%{margin-left:-10px}75%{margin-left:10px}}
@keyframes th-hop{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-30px)}}
@media (prefers-reduced-motion: reduce){ .th-ring{transition:none} .th-ring.hint,.th-frog.cheer{animation:none} }`;

  const COLORS = ['#e8473c', '#f28a2e', '#f5c02e', '#43b55a', '#2f6fd6'];   // minsta ringen först
  const SIZES = {small: [2, 3], big: [3, 4, 5]};
  const TARGET = 2;

  // Nästa bästa drag från vilket läge som helst: flytta den största ringen som inte står på målet,
  // genom att först flytta alla mindre till den tredje pinnen. pos[i] = pinnen där ring i ligger (0 = minst).
  function nextMove(pos, k, target){
    if(k === 0) return null;
    const big = k - 1;
    if(pos[big] === target) return nextMove(pos, k - 1, target);
    const other = 3 - pos[big] - target;
    return nextMove(pos, k - 1, other) || [pos[big], target];
  }

  function start(root, opts){
    opts = opts || {};
    const level = opts.level === 'big' ? 'big' : 'small', sizes = SIZES[level];
    const store = opts.storage || {get(){ return null; }, set(){}};
    let prog = null;
    try{ prog = JSON.parse(store.get('torn-' + level) || 'null'); }catch(e){}
    if(!prog || !Array.isArray(prog.done)) prog = {cur: 0, done: [], pos: null, moves: 0};
    const save = () => { try{ store.set('torn-' + level, JSON.stringify(prog)); }catch(e){} };

    if(!document.getElementById('th-css')){ const s = document.createElement('style'); s.id = 'th-css'; s.textContent = CSS; document.head.append(s); }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'th';
    el.innerHTML = `<div class="th-top"><div class="th-title">Tornet</div><div class="th-lvls" role="group" aria-label="Antal ringar"></div></div>
      <div class="th-board" role="application" aria-label="Tre pinnar med ringar. Flytta tornet till pinnen med flaggan."><div class="th-base"></div></div>
      <div class="th-end" role="dialog" aria-live="polite"><div class="stars"></div><div class="big">Tornet är flyttat!</div><div class="sub"></div><button type="button"></button></div>`;
    root.append(el);
    const board = el.querySelector('.th-board'), lvlsEl = el.querySelector('.th-lvls'), endEl = el.querySelector('.th-end');

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
      try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'sv-SE';
        const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.replace('_', '-').startsWith('sv')); if(v) u.voice = v; speechSynthesis.speak(u); }catch(e){}
    }

    let n = 0, pos = [], rings = [], pegs = [], flag = null, frog = null, sel = -1, done = false, hintTimer = null, endTimer = null;
    const top = p => { let best = -1; pos.forEach((q, i) => { if(q === p && (best < 0 || i < best)) best = i; }); return best; };   // minsta ringen på pinnen
    const stack = p => pos.map((q, i) => q === p ? i : -1).filter(i => i >= 0).sort((a, b) => b - a);   // underst först

    function renderLvls(){
      lvlsEl.innerHTML = '';
      sizes.forEach((k, i) => {
        const b = document.createElement('button'); b.type = 'button';
        const open = i === 0 || prog.done[i - 1] || prog.done[i];
        b.className = 'th-lvl' + (prog.done[i] ? ' done' : '') + (i === prog.cur ? ' cur' : '');
        b.textContent = open ? `${k} ringar` : `🔒 ${k}`; b.disabled = !open;
        b.setAttribute('aria-label', `${k} ringar` + (prog.done[i] ? ', klar' : open ? '' : ', låst'));
        b.addEventListener('click', () => load(i, true)); lvlsEl.append(b);
      });
    }
    function load(i, fresh){
      prog.cur = i; n = sizes[i]; done = false; sel = -1;
      if(fresh || !Array.isArray(prog.pos) || prog.pos.length !== n){ prog.pos = new Array(n).fill(0); prog.moves = 0; }
      pos = prog.pos.slice(); save(); renderLvls();
      endEl.classList.remove('on');
      board.querySelectorAll('.th-ring,.th-peg,.th-flag,.th-frog').forEach(x => x.remove());
      pegs = [0, 1, 2].map(() => { const d = document.createElement('div'); d.className = 'th-peg'; board.append(d); return d; });
      flag = document.createElement('div'); flag.className = 'th-flag'; flag.textContent = '🏁'; board.append(flag);
      frog = document.createElement('div'); frog.className = 'th-frog'; frog.textContent = '🐸'; board.append(frog);
      rings = Array.from({length: n}, (_, r) => { const d = document.createElement('div'); d.className = 'th-ring'; d.style.background = COLORS[r]; board.append(d); return d; });
      layout(); idle();
    }
    // Mått i bildpunkter efter tavlans storlek.
    let G = null;
    function layout(){
      const W = board.clientWidth, H = board.clientHeight; if(!W || !H) return;
      const col = W * 0.92 / 3, baseTop = H * 0.87, rh = Math.min(H * 0.62 / (n + 1.6), 72), pegH = rh * (n + 1.4);
      G = {W, H, col, baseTop, rh, pegTop: baseTop - pegH, x: p => W * 0.04 + col * (p + 0.5)};
      pegs.forEach((d, p) => { d.style.left = G.x(p) + 'px'; d.style.top = G.pegTop + 'px'; d.style.height = pegH + 'px'; });
      flag.style.left = G.x(TARGET) + 'px'; flag.style.top = (baseTop + H * 0.06) + 'px';
      place();
    }
    const ringW = r => G.col * (0.34 + 0.56 * (n === 1 ? 1 : r / (n - 1)));
    function place(){
      if(!G) return;
      for(let p = 0; p < 3; p++) stack(p).forEach((r, j) => {
        const d = rings[r]; if(d.classList.contains('drag')) return;
        const w = ringW(r), lifted = r === sel;
        d.style.width = w + 'px'; d.style.height = (G.rh - 4) + 'px';
        d.style.left = (G.x(p) - w / 2) + 'px';
        d.style.top = (lifted ? G.pegTop - G.rh - 12 : G.baseTop - (j + 1) * G.rh) + 'px';
        d.classList.toggle('lift', lifted);
      });
      // Grodan sitter vid foten av målpinnen och hoppar upp på tornet när det är klart.
      frog.style.left = (G.x(TARGET) + G.col * 0.36) + 'px';
      frog.style.top = (done ? G.baseTop - n * G.rh - G.rh * 1.6 : G.baseTop - G.rh * 1.5) + 'px';
      if(done) frog.style.left = G.x(TARGET) + 'px';
    }
    function clearHint(){ board.querySelectorAll('.hint').forEach(x => x.classList.remove('hint')); }
    function idle(){
      clearTimeout(hintTimer); clearHint();
      if(done) return;
      hintTimer = setTimeout(() => {
        const m = nextMove(pos, n, TARGET); if(!m) return;
        if(sel >= 0 && pos[sel] !== m[0]){ pegs[pos[sel]].classList.add('hint'); return; }   // lägg först tillbaka
        rings[top(m[0])].classList.add('hint'); pegs[m[1]].classList.add('hint');
      }, level === 'big' ? 8000 : 5000);
    }
    function pick(p){
      const r = top(p); if(r < 0) return false;
      sel = r; tone([392 + (n - r) * 60], 0.08, 'triangle'); place(); return true;
    }
    function drop(p){
      const r = sel; if(r < 0) return;
      const t = top(p);
      if(pos[r] === p){ sel = -1; tone([300], 0.05); place(); idle(); return; }   // samma pinne: lägg ned igen
      if(t >= 0 && t < r){
        // En större ring får inte ligga på en mindre: skaka och glid tillbaka.
        sel = -1; const d = rings[r]; d.classList.remove('bad'); void d.offsetWidth; d.classList.add('bad');
        tone([180, 140], 0.08, 'triangle', 0.12); place(); idle(); return;
      }
      pos[r] = p; sel = -1; prog.pos = pos.slice(); prog.moves++; save();
      tone([523 + (n - r) * 70], 0.1); place();
      if(pos.every(q => q === TARGET)) win(); else idle();
    }
    function win(){
      done = true; clearHint(); place();
      const best = Math.pow(2, n) - 1, perfect = prog.moves <= best;
      prog.done[prog.cur] = true; save(); renderLvls();
      frog.classList.add('cheer');
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone([f], 0.12), i * 110));
      say(perfect ? 'Toppen! Tornet är flyttat på så få drag som möjligt!' : 'Bra jobbat! Tornet är flyttat!');
      endEl.querySelector('.stars').textContent = perfect ? '⭐⭐' : '⭐';
      endEl.querySelector('.sub').textContent = perfect ? `${prog.moves} drag – så få som det går!` : `${prog.moves} drag. Det går på ${best}.`;
      const nextI = prog.cur + 1 < sizes.length ? prog.cur + 1 : -1;
      const btn = endEl.querySelector('button'); btn.textContent = nextI >= 0 ? `Nästa: ${sizes[nextI]} ringar` : 'Spela igen';
      btn.onclick = () => load(nextI >= 0 ? nextI : prog.cur, true);
      clearTimeout(endTimer); endTimer = setTimeout(() => endEl.classList.add('on'), 1400);
      if(typeof opts.onFinish === 'function') opts.onFinish();
    }
    // Tryck: lyft översta ringen på pinnen, tryck sedan på en annan pinne. Dra: ringen följer fingret.
    const pegAt = x => Math.max(0, Math.min(2, Math.floor((x - G.W * 0.04) / G.col)));
    let down = null;
    board.addEventListener('pointerdown', e => {
      if(done || !G) return; e.preventDefault();
      const r = board.getBoundingClientRect(), x = e.clientX - r.left, p = pegAt(x);
      board.setPointerCapture && board.setPointerCapture(e.pointerId);
      if(sel >= 0){ down = {p, had: true, x0: e.clientX, y0: e.clientY, moved: false}; return; }
      if(pick(p)) down = {p, had: false, x0: e.clientX, y0: e.clientY, moved: false};
    });
    board.addEventListener('pointermove', e => {
      if(!down || sel < 0) return;
      if(!down.moved && Math.hypot(e.clientX - down.x0, e.clientY - down.y0) < 10) return;
      down.moved = true;
      const r = board.getBoundingClientRect(), d = rings[sel], w = parseFloat(d.style.width);
      d.classList.add('drag'); d.style.left = (e.clientX - r.left - w / 2) + 'px'; d.style.top = (e.clientY - r.top - G.rh / 2) + 'px';
    });
    const up = e => {
      if(!down) return;
      const r = board.getBoundingClientRect(), p = pegAt(e.clientX - r.left), was = down; down = null;
      if(sel >= 0) rings[sel].classList.remove('drag');
      if(was.moved) drop(p);            // dragits: släpp där fingret är
      else if(was.had) drop(was.p);     // ring var redan lyft: lägg på pinnen man tryckte på
      else place();                     // nyss lyft med ett tryck: håll den uppe
    };
    board.addEventListener('pointerup', up); board.addEventListener('pointercancel', up);
    const ro = window.ResizeObserver ? new ResizeObserver(layout) : null; if(ro) ro.observe(board);

    load(Math.min(prog.cur || 0, sizes.length - 1), false);

    return {
      stop(){ clearTimeout(hintTimer); clearTimeout(endTimer); if(ro) ro.disconnect(); try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){} try{ if(ac) ac.close(); }catch(e){} root.innerHTML = ''; },
      _test: {pos: () => pos.slice(), sel: () => sel, done: () => done, moves: () => prog.moves, n: () => n, nextMove: () => nextMove(pos, n, TARGET), pick, drop, load}
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'hanoi', title: 'Tornet', icon: '🗼',
    about: 'Flytta hela tornet av ringar till pinnen med flaggan, en ring i taget. En stor ring får inte ligga på en liten. Liten: 2 och 3 ringar. Stor: 3, 4 och 5 ringar.',
    start
  });
})();
