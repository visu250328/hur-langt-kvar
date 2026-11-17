/* Koppla ihop – dra streck mellan prickar med samma färg.
   Liten nivå: prickar utspridda, strecken får korsa varandra. Stor nivå: rutnät där strecken inte får
   korsa varandra; 12 banor som alla går att lösa. Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const COLORS = [
    {name: 'Röd', c: '#e8473c'}, {name: 'Blå', c: '#2f6fd6'}, {name: 'Gul', c: '#f5c02e'}, {name: 'Grön', c: '#2fa84a'},
    {name: 'Orange', c: '#f28a2e'}, {name: 'Lila', c: '#9a5bd6'}, {name: 'Rosa', c: '#ff7ab0'}
  ];
  // Stor nivå: rutnät n × n, par av rutor (radvis numrerade) och en lösning (används bara vid test).
  // Banorna togs fram genom en slumpad väg genom alla rutor som delades i bitar om minst 3 rutor.
  const BANOR = [
    {n: 5, p: [[14, 15], [16, 5], [0, 8]], s: [[14, 19, 24, 23, 18, 13, 12, 17, 22, 21, 20, 15], [16, 11, 10, 5], [0, 1, 6, 7, 2, 3, 4, 9, 8]]},
    {n: 5, p: [[14, 22], [21, 0], [1, 16]], s: [[14, 9, 4, 3, 8, 13, 18, 19, 24, 23, 22], [21, 20, 15, 10, 5, 0], [1, 2, 7, 6, 11, 12, 17, 16]]},
    {n: 5, p: [[22, 0], [1, 17], [12, 3], [4, 24]], s: [[22, 21, 20, 15, 10, 5, 0], [1, 6, 11, 16, 17], [12, 7, 2, 3], [4, 9, 8, 13, 14, 19, 18, 23, 24]]},
    {n: 5, p: [[2, 20], [21, 11], [6, 22], [23, 8]], s: [[2, 1, 0, 5, 10, 15, 20], [21, 16, 11], [6, 7, 12, 17, 22], [23, 24, 19, 18, 13, 14, 9, 4, 3, 8]]},
    {n: 6, p: [[9, 24], [30, 11], [5, 10], [16, 27]], s: [[9, 3, 2, 1, 0, 6, 12, 18, 24], [30, 31, 25, 19, 13, 7, 8, 14, 20, 26, 32, 33, 34, 35, 29, 23, 17, 11], [5, 4, 10], [16, 15, 21, 22, 28, 27]]},
    {n: 6, p: [[1, 6], [12, 5], [11, 21], [22, 34], [28, 26]], s: [[1, 0, 6], [12, 18, 24, 30, 31, 25, 19, 13, 7, 8, 2, 3, 9, 10, 4, 5], [11, 17, 16, 15, 14, 20, 21], [22, 23, 29, 35, 34], [28, 27, 33, 32, 26]]},
    {n: 6, p: [[32, 17], [11, 18], [24, 13], [7, 15], [9, 16]], s: [[32, 33, 34, 35, 29, 23, 17], [11, 5, 4, 3, 2, 1, 0, 6, 12, 18], [24, 30, 31, 25, 19, 13], [7, 8, 14, 20, 26, 27, 28, 22, 21, 15], [9, 10, 16]]},
    {n: 6, p: [[24, 31], [25, 27], [21, 23], [17, 2], [1, 13]], s: [[24, 30, 31], [25, 26, 32, 33, 34, 35, 29, 28, 27], [21, 22, 23], [17, 11, 5, 4, 3, 2], [1, 0, 6, 7, 8, 9, 10, 16, 15, 14, 20, 19, 18, 12, 13]]},
    {n: 7, p: [[16, 21], [14, 8], [7, 1], [2, 37], [44, 26]], s: [[16, 17, 24, 23, 22, 21], [14, 15, 8], [7, 0, 1], [2, 9, 10, 3, 4, 5, 6, 13, 12, 11, 18, 25, 32, 31, 30, 29, 28, 35, 42, 43, 36, 37], [44, 45, 38, 39, 46, 47, 48, 41, 40, 33, 34, 27, 20, 19, 26]]},
    {n: 7, p: [[2, 29], [22, 37], [44, 41], [34, 13], [6, 39], [38, 10]], s: [[2, 1, 0, 7, 14, 21, 28, 35, 42, 43, 36, 29], [22, 15, 8, 9, 16, 23, 30, 37], [44, 45, 46, 47, 48, 41], [34, 27, 20, 13], [6, 5, 12, 19, 26, 33, 40, 39], [38, 31, 32, 25, 24, 17, 18, 11, 4, 3, 10]]},
    {n: 7, p: [[12, 41], [48, 45], [44, 28], [21, 1], [2, 10], [9, 24]], s: [[12, 13, 6, 5, 4, 11, 18, 19, 20, 27, 34, 41], [48, 47, 40, 33, 26, 25, 32, 39, 46, 45], [44, 43, 42, 35, 36, 37, 38, 31, 30, 29, 28], [21, 14, 7, 0, 1], [2, 3, 10], [9, 8, 15, 22, 23, 16, 17, 24]]},
    {n: 7, p: [[18, 0], [7, 43], [44, 40], [39, 31], [24, 19], [20, 12]], s: [[18, 17, 10, 11, 4, 3, 2, 9, 16, 15, 8, 1, 0], [7, 14, 21, 28, 35, 42, 43], [44, 45, 46, 47, 48, 41, 40], [39, 38, 37, 36, 29, 22, 23, 30, 31], [24, 25, 32, 33, 34, 27, 26, 19], [20, 13, 6, 5, 12]]}
  ];
  // Liten nivå: antal par i omgångarna, i ordning.
  const ROUNDS = [2, 3, 3, 4, 4, 5];

  const CSS = `
.kp{height:100%;display:flex;flex-direction:column;gap:12px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.kp-top{display:flex;align-items:center;gap:10px;min-height:48px;flex-wrap:wrap}
.kp-title{font-size:1.7rem;font-weight:800;line-height:1;margin-right:auto}
.kp-banor{display:flex;gap:6px;flex-wrap:wrap}
.kp-bana{width:34px;height:34px;border-radius:50%;border:0;background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;cursor:pointer;
  box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);display:grid;place-items:center;padding:0;font-size:.95rem}
.kp-bana.done{background:var(--done,#F2B33D);color:#2B1E00;box-shadow:none}
.kp-bana.cur{box-shadow:0 0 0 3px var(--sky,#DCEAF6),0 0 0 6px var(--accent,#2F6FD6)}
.kp-btn{border:2px solid var(--line,#C6D1DF);background:var(--card,#fff);color:inherit;font:inherit;font-weight:700;border-radius:999px;padding:5px 14px;cursor:pointer}
.kp-area{flex:1;min-height:0;display:grid;place-items:center;background:var(--card,#fff);border-radius:24px;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);position:relative;overflow:hidden;touch-action:none}
.kp-area svg{width:96%;height:96%;touch-action:none}
.kp-end{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:none;flex-direction:column;align-items:center;gap:12px;z-index:5;
  background:rgba(255,255,255,.95);border-radius:24px;padding:20px 28px;box-shadow:0 8px 24px rgba(0,0,0,.18);max-width:86%;color:#1D2842}
.kp-end.on{display:flex}
.kp-end .big{font-size:clamp(1.6rem,5vmin,2.8rem);font-weight:800;line-height:1.15;text-align:center;color:#1D2842;white-space:pre-line}
.kp-end button{pointer-events:auto;border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.2rem;font-weight:800;border-radius:18px;padding:10px 24px;cursor:pointer}
.kp button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
.kp-dot.done{animation:kp-pop .5s ease-out}
@keyframes kp-pop{0%{transform:scale(1)}50%{transform:scale(1.35)}100%{transform:scale(1)}}
@media (prefers-reduced-motion: reduce){ .kp-dot.done{animation:none} }`;

  const NS = 'http://www.w3.org/2000/svg';

  function start(root, opts){
    opts = opts || {};
    const level = opts.level === 'big' ? 'big' : 'small';
    const store = opts.storage || {get(){ return null; }, set(){}};
    if(!document.getElementById('kp-css')){ const s = document.createElement('style'); s.id = 'kp-css'; s.textContent = CSS; document.head.append(s); }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'kp';
    el.innerHTML = `
      <div class="kp-top"><div class="kp-title">Koppla ihop</div><div class="kp-banor" role="group" aria-label="Banor"></div><button type="button" class="kp-btn" data-a="reset">Börja om</button></div>
      <div class="kp-area"><div class="kp-end" aria-live="polite"><div class="big"></div><button type="button"></button></div></div>`;
    root.append(el);
    const area = el.querySelector('.kp-area'), endEl = el.querySelector('.kp-end'), banorEl = el.querySelector('.kp-banor');

    // ---------- Ljud ----------
    let ac = null;
    function tone(freqs, vol){
      if(!opts.sound) return;
      try{
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        freqs.forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * 0.09;
          o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
          o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.25); });
      }catch(e){}
    }
    function say(text){
      if(!opts.sound || !window.speechSynthesis) return;
      try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'sv-SE'; u.rate = 0.95;
        const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.replace('_', '-').startsWith('sv')); if(v) u.voice = v; speechSynthesis.speak(u); }catch(e){}
    }
    let svg = null;
    const toSvg = e => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
    function showEnd(text, btn, cb){
      endEl.querySelector('.big').textContent = text;
      const b = endEl.querySelector('button'); b.textContent = btn; b.onclick = () => { endEl.classList.remove('on'); cb(); };
      setTimeout(() => endEl.classList.add('on'), 500);
    }

    const game = level === 'big' ? grid() : free();

    // =====================================================================
    // Liten nivå: fritt dragna streck som får korsa varandra
    // =====================================================================
    function free(){
      banorEl.hidden = true;
      let round = 0, dots = [], lines = {}, done = new Set();
      function newRound(){
        const k = ROUNDS[round % ROUNDS.length];
        done = new Set(); lines = {}; dots = [];
        // Prickarna slumpas med minst 80 enheters avstånd till varandra och kanten.
        const pts = [];
        for(let t = 0; pts.length < k * 2 && t < 5000; t++){
          const x = 40 + Math.random() * 320, y = 40 + Math.random() * 220;
          if(pts.every(q => Math.hypot(q[0] - x, q[1] - y) > 80)) pts.push([x, y]);
        }
        const order = COLORS.map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, k);
        order.forEach((ci, j) => { dots.push({ci, x: pts[j * 2][0], y: pts[j * 2][1]}, {ci, x: pts[j * 2 + 1][0], y: pts[j * 2 + 1][1]}); });
        render();
      }
      function render(){
        if(svg) svg.remove();
        area.insertAdjacentHTML('afterbegin', `<svg viewBox="0 0 400 300"><g class="kp-lines"></g><g class="kp-dots">${dots.map((d, i) =>
          `<circle class="kp-dot" data-i="${i}" cx="${d.x.toFixed(1)}" cy="${d.y.toFixed(1)}" r="17" fill="${COLORS[d.ci].c}" stroke="#222" stroke-width="3" style="transform-box:fill-box;transform-origin:center"/>`).join('')}</g></svg>`);
        svg = area.querySelector('svg');
        Object.entries(lines).forEach(([ci, d]) => addLine(+ci, d));
        svg.addEventListener('pointerdown', down);
      }
      function addLine(ci, d){
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('d', d); p.setAttribute('stroke', COLORS[ci].c); p.setAttribute('stroke-width', 12); p.setAttribute('fill', 'none');
        p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round'); p.dataset.ci = ci;
        svg.querySelector('.kp-lines').append(p); return p;
      }
      const dotAt = (x, y) => dots.findIndex(d => Math.hypot(d.x - x, d.y - y) < 30);
      function down(e){
        const q = toSvg(e), i = dotAt(q.x, q.y); if(i < 0) return;
        e.preventDefault();
        const d0 = dots[i], ci = d0.ci;
        svg.querySelectorAll(`.kp-lines path[data-ci="${ci}"]`).forEach(p => p.remove());
        delete lines[ci]; done.delete(ci);
        let dpath = `M${d0.x.toFixed(1)} ${d0.y.toFixed(1)}`, lx = d0.x, ly = d0.y;
        const line = addLine(ci, dpath);
        svg.setPointerCapture && svg.setPointerCapture(e.pointerId);
        tone([440], 0.06); say(COLORS[ci].name);
        const move = ev => { const r = toSvg(ev); if(Math.hypot(r.x - lx, r.y - ly) < 3) return; lx = r.x; ly = r.y; dpath += ` L${r.x.toFixed(1)} ${r.y.toFixed(1)}`; line.setAttribute('d', dpath); };
        const up = ev => {
          svg.removeEventListener('pointermove', move); svg.removeEventListener('pointerup', up); svg.removeEventListener('pointercancel', up);
          const r = toSvg(ev), j = dotAt(r.x, r.y);
          if(j >= 0 && j !== i && dots[j].ci === ci){
            dpath += ` L${dots[j].x.toFixed(1)} ${dots[j].y.toFixed(1)}`; line.setAttribute('d', dpath);
            lines[ci] = dpath; done.add(ci);
            [i, j].forEach(k => { const c = svg.querySelector(`.kp-dot[data-i="${k}"]`); c.classList.remove('done'); void c.getBoundingClientRect(); c.classList.add('done'); });
            tone([523, 784], 0.1);
            if(done.size === dots.length / 2){
              tone([523, 659, 784, 1047]); say('Bra jobbat!');
              if(typeof opts.onFinish === 'function') opts.onFinish();
              showEnd('Bra jobbat!', 'Nästa', () => { round++; newRound(); });
            }
          }else{ line.remove(); tone([300], 0.05); }
        };
        svg.addEventListener('pointermove', move); svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
      }
      el.querySelector('[data-a="reset"]').addEventListener('click', () => { endEl.classList.remove('on'); lines = {}; done = new Set(); render(); });
      newRound();
    }

    // =====================================================================
    // Stor nivå: rutnät, strecken får inte korsa varandra
    // =====================================================================
    function grid(){
      let prog = null;
      try{ prog = JSON.parse(store.get('banor') || 'null'); }catch(e){}
      if(!prog || !Array.isArray(prog.done)) prog = {current: 0, done: []};
      prog.done = BANOR.map((_, i) => !!prog.done[i]);
      const save = () => { try{ store.set('banor', JSON.stringify(prog)); }catch(e){} };
      let B = null, n = 5, cell = 60, paths = [], owner = [], dotOf = [], finished = false;

      function renderBanor(){
        banorEl.innerHTML = '';
        BANOR.forEach((_, i) => {
          const b = document.createElement('button'); b.type = 'button';
          b.className = 'kp-bana' + (prog.done[i] ? ' done' : '') + (i === prog.current ? ' cur' : '');
          b.textContent = i + 1; b.setAttribute('aria-label', `Bana ${i + 1}` + (prog.done[i] ? ', klar' : ''));
          b.addEventListener('click', () => load(i)); banorEl.append(b);
        });
      }
      function load(i){
        prog.current = i; save(); renderBanor(); endEl.classList.remove('on');
        B = BANOR[i]; n = B.n; cell = 300 / n; finished = false;
        paths = B.p.map(() => []);
        dotOf = new Array(n * n).fill(-1); B.p.forEach(([a, b], ci) => { dotOf[a] = ci; dotOf[b] = ci; });
        recompute(); build();
      }
      // Vilken färg som upptar varje ruta.
      function recompute(){ owner = new Array(n * n).fill(-1); paths.forEach((p, ci) => p.forEach(c => owner[c] = ci)); }
      const cx = c => 50 + (c % n + 0.5) * cell, cy = c => (Math.floor(c / n) + 0.5) * cell;
      const adj = (a, b) => Math.abs(Math.floor(a / n) - Math.floor(b / n)) + Math.abs(a % n - b % n) === 1;
      const complete = ci => { const p = paths[ci]; return p.length > 1 && dotOf[p[0]] === ci && dotOf[p[p.length - 1]] === ci && p[0] !== p[p.length - 1]; };
      // Rutnätet skapas en gång per bana; under ett drag uppdateras bara lagren, så att fingret inte tappas.
      function build(){
        if(svg) svg.remove();
        area.insertAdjacentHTML('afterbegin', `<svg viewBox="0 0 400 300" role="img" aria-label="Rutnät ${n} gånger ${n}"><g class="g-cells"></g><g class="g-lines"></g><g class="g-dots"></g></svg>`);
        svg = area.querySelector('svg');
        svg.addEventListener('pointerdown', down);
        render();
      }
      function render(){
        let g = '';
        for(let c = 0; c < n * n; c++) g += `<rect x="${(50 + (c % n) * cell).toFixed(1)}" y="${(Math.floor(c / n) * cell).toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}" fill="${owner[c] >= 0 ? COLORS[owner[c]].c + '33' : '#f4f6f9'}" stroke="#c6d1df" stroke-width="1.5"/>`;
        const lines = paths.map((p, ci) => p.length < 2 ? '' : `<polyline points="${p.map(c => cx(c).toFixed(1) + ',' + cy(c).toFixed(1)).join(' ')}" fill="none" stroke="${COLORS[ci].c}" stroke-width="${(cell * (complete(ci) ? 0.36 : 0.3)).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
        const dots = B.p.map(([a, b], ci) => [a, b].map(c => `<circle class="kp-dot${complete(ci) ? ' ok' : ''}" data-c="${c}" cx="${cx(c).toFixed(1)}" cy="${cy(c).toFixed(1)}" r="${(cell * 0.32).toFixed(1)}" fill="${COLORS[ci].c}" stroke="#222" stroke-width="${complete(ci) ? 4 : 2.5}" style="transform-box:fill-box;transform-origin:center"/>`).join('')).join('');
        svg.querySelector('.g-cells').innerHTML = g;
        svg.querySelector('.g-lines').innerHTML = lines;
        svg.querySelector('.g-dots').innerHTML = dots;
      }
      const cellAt = q => { const c = Math.floor((q.x - 50) / cell), r = Math.floor(q.y / cell); return c < 0 || r < 0 || c >= n || r >= n ? -1 : r * n + c; };
      let active = -1;
      function down(e){
        if(finished) return;
        const c = cellAt(toSvg(e)); if(c < 0) return;
        e.preventDefault();
        if(dotOf[c] >= 0){ active = dotOf[c]; paths[active] = [c]; say(COLORS[active].name); }
        else if(owner[c] >= 0){ active = owner[c]; const p = paths[active]; paths[active] = p.slice(0, p.indexOf(c) + 1); }
        else return;
        tone([440], 0.05); recompute(); render();
        svg.setPointerCapture && svg.setPointerCapture(e.pointerId);
        const move = ev => step(cellAt(toSvg(ev)));
        const up = () => {
          svg.removeEventListener('pointermove', move); svg.removeEventListener('pointerup', up); svg.removeEventListener('pointercancel', up);
          active = -1; check();
        };
        svg.addEventListener('pointermove', move); svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
      }
      // Ett steg till en ny ruta. Snabba drag som hoppar över rutor fylls i rad för rad.
      function step(c){
        if(active < 0 || c < 0) return;
        const p = paths[active]; let last = p[p.length - 1];
        if(c === last) return;
        let guard = 0;
        while(last !== c && guard++ < 20){
          const lr = Math.floor(last / n), lc = last % n, tr = Math.floor(c / n), tc = c % n;
          const nxt = lc !== tc ? last + Math.sign(tc - lc) : last + Math.sign(tr - lr) * n;
          if(!tryCell(nxt)) break;
          last = paths[active][paths[active].length - 1];
          if(last !== nxt) break;
        }
      }
      function tryCell(c){
        const ci = active, p = paths[ci], last = p[p.length - 1];
        if(!adj(last, c)) return false;
        const back = p.indexOf(c);
        if(back >= 0){ paths[ci] = p.slice(0, back + 1); recompute(); render(); return true; }   // backa i sitt eget streck
        if(complete(ci)) return false;                                                       // redan framme
        if(dotOf[c] >= 0 && dotOf[c] !== ci) return false;                                    // annan färgs prick
        if(owner[c] >= 0 && owner[c] !== ci){ tone([260], 0.04); return false; }             // får inte korsa
        p.push(c); recompute();
        if(complete(ci)){ tone([523, 784], 0.1); render(); const d = svg.querySelectorAll('.kp-dot.ok'); d.forEach(x => { if(+x.dataset.c === c || +x.dataset.c === p[0]) x.classList.add('done'); }); }
        else { tone([360 + p.length * 12], 0.03); render(); }
        return true;
      }
      function check(){
        if(!paths.every((_, ci) => complete(ci))) return;
        finished = true;
        const full = owner.every(o => o >= 0);
        prog.done[prog.current] = true; save(); renderBanor();
        tone([523, 659, 784, 1047]); say(full ? 'Alla ihopkopplade, och hela rutnätet är fyllt!' : 'Alla ihopkopplade!');
        if(typeof opts.onFinish === 'function') opts.onFinish();
        const last = prog.current === BANOR.length - 1;
        showEnd('Alla ihopkopplade!' + (full ? '\n⭐ Hela rutnätet är fyllt! ⭐' : ''), last ? 'Börja om från bana 1' : 'Nästa bana', () => load((prog.current + 1) % BANOR.length));
      }
      el.querySelector('[data-a="reset"]').addEventListener('click', () => load(prog.current));
      load(Math.min(prog.current, BANOR.length - 1));
    }

    return {
      stop(){
        try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
        try{ if(ac) ac.close(); }catch(e){}
        root.innerHTML = '';
      }
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'koppla', title: 'Koppla ihop', icon: '🔗',
    about: 'Dra streck mellan prickar med samma färg. Liten: prickar utspridda, strecken får korsa varandra, 2–5 par. Stor: rutnät där strecken inte får korsa varandra, 12 banor från 5 × 5 till 7 × 7.',
    start,
    _test: {BANOR}
  });
})();
