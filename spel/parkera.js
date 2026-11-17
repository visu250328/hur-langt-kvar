/* Parkera – liten nivå: dra varje bil till parkeringsrutan med samma färg.
   Stor nivå: Ut ur garaget, ett skjutpussel där den röda bilen ska ut; 10 banor, alla lösta i förväg.
   Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.pk{height:100%;display:flex;flex-direction:column;gap:12px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.pk-top{display:flex;align-items:center;gap:12px;min-height:48px;flex-wrap:wrap}
.pk-title{font-size:1.7rem;font-weight:800;line-height:1;margin-right:auto}
.pk-banor{display:flex;gap:6px;flex-wrap:wrap}
.pk-bana{width:36px;height:36px;border-radius:50%;border:0;background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;font-size:1rem;cursor:pointer;
  box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);display:grid;place-items:center;padding:0}
.pk-bana.done{background:var(--done,#F2B33D);color:#2B1E00;box-shadow:none}
.pk-bana.cur{box-shadow:0 0 0 3px var(--sky,#DCEAF6),0 0 0 6px var(--accent,#2F6FD6)}
.pk-new{border:2px solid var(--line,#C6D1DF);background:var(--card,#fff);color:inherit;font:inherit;font-weight:700;border-radius:999px;padding:5px 14px;cursor:pointer;flex:none}
.pk-new.sure{background:var(--done,#F2B33D);border-color:var(--done,#F2B33D);color:#2B1E00}
.pk-area{flex:1;min-height:0;position:relative;touch-action:none}
.pk-lot{position:absolute;inset:0;border-radius:24px;background:#8e959e}
.pk-road{position:absolute;left:0;right:0;border-top:4px dashed rgba(255,255,255,.6)}
.pk-spot{position:absolute;box-sizing:border-box;border:5px solid #fff;border-bottom:0;border-radius:6px 6px 0 0;display:grid;place-items:center}
.pk-spot .mark{width:46%;aspect-ratio:1;border-radius:50%;opacity:.9}
.pk-car{position:absolute;cursor:grab;touch-action:none;transition:left .3s ease,top .3s ease;filter:drop-shadow(0 3px 2px rgba(0,0,0,.25))}
.pk-car svg{width:100%;height:100%;display:block;pointer-events:none}
.pk-car.drag{transition:none;z-index:5;cursor:grabbing;filter:drop-shadow(0 10px 8px rgba(0,0,0,.3))}
.pk-car.parked{cursor:default}
.pk-board{position:absolute;background:#7d848d;border-radius:14px;box-shadow:0 0 0 10px #5b6470}
.pk-cell{position:absolute;box-sizing:border-box;border:1px solid rgba(255,255,255,.12)}
.pk-exit{position:absolute;display:grid;place-items:center;font-weight:800;color:#fff;background:#5fa851;border-radius:0 12px 12px 0}
.pk-veh{position:absolute;cursor:grab;touch-action:none;transition:left .25s ease,top .25s ease;filter:drop-shadow(0 3px 2px rgba(0,0,0,.3))}
.pk-veh svg{width:100%;height:100%;display:block;pointer-events:none}
.pk-veh.drag{transition:none;z-index:5;cursor:grabbing}
.pk-veh.out{transition:left .9s ease-in}
.pk-car:focus-visible,.pk-veh:focus-visible,.pk button:focus-visible{outline:3px solid #fff;outline-offset:2px}
.pk-end{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;
  background:color-mix(in srgb,var(--sky,#DCEAF6) 70%,transparent);border-radius:inherit;z-index:10}
.pk-end.on{display:flex}
.pk-end .big{font-size:clamp(2.4rem,8vmin,4.5rem);font-weight:800;line-height:1;text-shadow:0 0 12px var(--sky,#DCEAF6)}
.pk-end .stars{font-size:clamp(2.4rem,8vmin,4.5rem);line-height:1}
.pk-end.on .stars{animation:pk-hop .8s ease-out 2}
.pk-end button{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.3rem;font-weight:800;border-radius:18px;padding:12px 26px;cursor:pointer;margin-top:8px}
@keyframes pk-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-18px)}}
@media (prefers-reduced-motion: reduce){ .pk-car,.pk-veh{transition:none} .pk-end.on .stars{animation:none} }`;

  const COLORS = [
    {name: 'Röd', fill: '#e8473c'}, {name: 'Blå', fill: '#3b7fe0'}, {name: 'Gul', fill: '#f5c02e'},
    {name: 'Grön', fill: '#43b55a'}, {name: 'Lila', fill: '#9a5bd6'}, {name: 'Orange', fill: '#f28a2e'}
  ];
  // Övriga fordon i garaget: olika färger, ingen röd, så att den röda bilen syns tydligt.
  const OTHER = ['#3b7fe0', '#43b55a', '#f5c02e', '#9a5bd6', '#f28a2e', '#2bb3b1', '#8a5a2b', '#e86fa6', '#6f7882', '#1f4e8c', '#a3c94a'];

  // Ut ur garaget: 6 × 6 rutor, utgång till höger på rad 3. Varje fordon är [rad, kolumn, längd, riktning];
  // det första är den röda bilen. moves är det minsta antalet drag, uträknat i förväg.
  const BANOR = [
    {moves: 2, v: [[2, 2, 2, 'h'], [1, 0, 3, 'h'], [5, 4, 2, 'h'], [1, 5, 2, 'v'], [0, 4, 2, 'v'], [4, 4, 2, 'h'], [4, 1, 2, 'h'], [5, 0, 3, 'h']]},
    {moves: 3, v: [[2, 2, 2, 'h'], [5, 2, 2, 'h'], [0, 1, 2, 'h'], [0, 0, 2, 'v'], [1, 5, 2, 'v'], [3, 2, 2, 'v'], [0, 3, 2, 'v'], [2, 1, 3, 'v'], [2, 4, 2, 'v']]},
    {moves: 4, v: [[2, 0, 2, 'h'], [4, 3, 2, 'v'], [3, 4, 2, 'v'], [2, 2, 2, 'v'], [4, 5, 2, 'v'], [1, 0, 3, 'h'], [1, 3, 2, 'v'], [0, 3, 2, 'h'], [5, 0, 2, 'h']]},
    {moves: 5, v: [[2, 0, 2, 'h'], [3, 4, 2, 'h'], [1, 3, 2, 'v'], [5, 1, 2, 'h'], [0, 3, 2, 'h'], [1, 1, 2, 'h'], [0, 0, 2, 'h'], [3, 2, 2, 'h'], [4, 3, 2, 'h'], [4, 0, 2, 'v'], [1, 5, 2, 'v']]},
    {moves: 6, v: [[2, 1, 2, 'h'], [4, 3, 3, 'h'], [0, 0, 2, 'v'], [0, 1, 2, 'h'], [2, 4, 2, 'v'], [1, 2, 3, 'h'], [0, 4, 2, 'h'], [4, 2, 2, 'v'], [3, 1, 2, 'v']]},
    {moves: 7, v: [[2, 0, 2, 'h'], [3, 3, 3, 'v'], [1, 2, 2, 'v'], [4, 2, 2, 'v'], [2, 5, 2, 'v'], [0, 1, 2, 'h'], [2, 4, 2, 'v'], [0, 4, 2, 'h'], [1, 0, 2, 'h'], [1, 4, 2, 'h'], [4, 5, 2, 'v']]},
    {moves: 8, v: [[2, 0, 2, 'h'], [3, 1, 2, 'h'], [0, 4, 3, 'v'], [3, 5, 2, 'v'], [3, 0, 3, 'v'], [1, 5, 2, 'v'], [1, 2, 2, 'v'], [3, 3, 3, 'v'], [0, 0, 3, 'h']]},
    {moves: 10, v: [[2, 2, 2, 'h'], [4, 4, 2, 'v'], [0, 2, 2, 'v'], [1, 5, 2, 'v'], [4, 5, 2, 'v'], [3, 1, 2, 'h'], [0, 3, 2, 'v'], [4, 1, 2, 'h'], [1, 4, 2, 'v'], [0, 4, 2, 'h'], [5, 2, 2, 'h'], [1, 1, 2, 'v']]},
    {moves: 12, v: [[2, 0, 2, 'h'], [3, 3, 2, 'h'], [5, 2, 2, 'h'], [4, 1, 3, 'h'], [0, 3, 3, 'h'], [1, 4, 2, 'v'], [1, 2, 2, 'h'], [0, 0, 2, 'h'], [4, 5, 2, 'v'], [1, 0, 2, 'h'], [4, 0, 2, 'v'], [2, 2, 2, 'v']]},
    {moves: 14, v: [[2, 1, 2, 'h'], [2, 3, 2, 'v'], [0, 1, 3, 'h'], [4, 3, 2, 'h'], [4, 5, 2, 'v'], [1, 4, 2, 'h'], [3, 0, 3, 'v'], [1, 0, 2, 'h'], [2, 5, 2, 'v'], [3, 2, 2, 'v'], [0, 4, 2, 'h'], [5, 1, 2, 'h']]}
  ];
  const N = 6, EXIT_ROW = 2;

  // Bilar och lastbilar sedda uppifrån, ritade åt höger. len är antal rutor.
  function vehicleSvg(fill, len, dir){
    const L = 100 * len, truck = len >= 3;
    const inner = truck ? `
      <rect x="6" y="10" width="${L - 92}" height="80" rx="8" fill="#eef1f5" stroke="${fill}" stroke-width="6"/>
      <rect x="${L - 84}" y="12" width="78" height="76" rx="16" fill="${fill}"/>
      <rect x="${L - 40}" y="22" width="16" height="56" rx="5" fill="#2b3a52"/>
      <rect x="20" y="40" width="${L - 130}" height="20" rx="6" fill="${fill}" opacity=".35"/>
      <circle cx="${L - 10}" cy="24" r="5" fill="#fff6b0"/><circle cx="${L - 10}" cy="76" r="5" fill="#fff6b0"/>` : `
      <rect x="4" y="12" width="${L - 8}" height="76" rx="22" fill="${fill}"/>
      <rect x="${L - 70}" y="22" width="16" height="56" rx="6" fill="#2b3a52"/>
      <rect x="44" y="24" width="${L - 118}" height="52" rx="10" fill="#fff" opacity=".28"/>
      <rect x="26" y="24" width="12" height="52" rx="5" fill="#2b3a52"/>
      <circle cx="${L - 12}" cy="26" r="6" fill="#fff6b0"/><circle cx="${L - 12}" cy="74" r="6" fill="#fff6b0"/>`;
    const wheels = `<g fill="#1d1d1d"><rect x="22" y="2" width="26" height="12" rx="4"/><rect x="22" y="86" width="26" height="12" rx="4"/>
      <rect x="${L - 50}" y="2" width="26" height="12" rx="4"/><rect x="${L - 50}" y="86" width="26" height="12" rx="4"/></g>`;
    if(dir === 'v') return `<svg viewBox="0 0 100 ${L}" aria-hidden="true"><g transform="translate(100 0) rotate(90)">${wheels}${inner}</g></svg>`;
    if(dir === 'up') return `<svg viewBox="0 0 100 ${L}" aria-hidden="true"><g transform="translate(0 ${L}) rotate(-90)">${wheels}${inner}</g></svg>`;
    return `<svg viewBox="0 0 ${L} 100" aria-hidden="true">${wheels}${inner}</svg>`;
  }

  function start(root, opts){
    opts = opts || {};
    const level = opts.level === 'big' ? 'big' : 'small';
    const store = opts.storage || {get(){ return null; }, set(){}};

    if(!document.getElementById('pk-css')){
      const s = document.createElement('style'); s.id = 'pk-css'; s.textContent = CSS; document.head.append(s);
    }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'pk';
    el.innerHTML = `
      <div class="pk-top"><div class="pk-title">${level === 'big' ? 'Ut ur garaget' : 'Parkera bilarna'}</div><div class="pk-banor" role="group" aria-label="Banor"></div><button type="button" class="pk-new">Börja om</button></div>
      <div class="pk-area"></div>
      <div class="pk-end" role="dialog" aria-live="polite"><div class="stars">🚗💨</div><div class="big"></div><button type="button"></button></div>`;
    root.append(el);
    const area = el.querySelector('.pk-area'), endEl = el.querySelector('.pk-end'), newBtn = el.querySelector('.pk-new'), banorEl = el.querySelector('.pk-banor');

    // ---------- Ljud ----------
    let ac = null;
    function tone(freqs, vol, type, len){
      if(!opts.sound) return;
      try{
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        freqs.forEach((f, i) => {
          const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * ((len || 0.25) + 0.05);
          o.type = type || 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.14, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + (len || 0.25));
          o.connect(g).connect(ac.destination); o.start(t); o.stop(t + (len || 0.25) + 0.02);
        });
      }catch(e){}
    }
    const honk = () => tone([440, 440], 0.07, 'square', 0.12);
    function say(text){
      if(!opts.sound || !window.speechSynthesis) return;
      try{
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'sv-SE'; u.rate = 0.95;
        const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.replace('_', '-').startsWith('sv'));
        if(v) u.voice = v;
        speechSynthesis.speak(u);
      }catch(e){}
    }
    // Fingrets läge i spelytans egna mått (spellabbet kan skala ned spelet).
    function local(e){
      const r = area.getBoundingClientRect(), k = r.width / (area.clientWidth || 1) || 1;
      return {x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k};
    }

    let sureTimer = null;
    function resetBtn(){ clearTimeout(sureTimer); newBtn.classList.remove('sure'); newBtn.textContent = 'Börja om'; }
    function twoTap(action){
      if(!newBtn.classList.contains('sure')){
        newBtn.classList.add('sure'); newBtn.textContent = 'Tryck igen för att börja om';
        sureTimer = setTimeout(resetBtn, 3000);
        return;
      }
      resetBtn(); action();
    }

    const game = level === 'big' ? garage() : parking();

    // =====================================================================
    // Liten nivå: Parkera bilarna
    // =====================================================================
    function parking(){
      banorEl.hidden = true;
      let st = null;
      try{ st = JSON.parse(store.get('parkering') || 'null'); }catch(e){}
      const fresh = () => {
        const colors = COLORS.slice().sort(() => Math.random() - 0.5).slice(0, 5).map(c => c.name);
        return {spots: colors.slice().sort(() => Math.random() - 0.5), cars: colors.slice().sort(() => Math.random() - 0.5), parked: {}};
      };
      if(!st || !Array.isArray(st.spots)) st = fresh();
      const save = () => { try{ store.set('parkering', JSON.stringify(st)); }catch(e){} };
      const col = name => COLORS.find(c => c.name === name);
      let geo = null, carEls = [], spotEls = [];

      function build(){
        area.innerHTML = '<div class="pk-lot"></div><div class="pk-road"></div>';
        spotEls = st.spots.map(name => {
          const d = document.createElement('div'); d.className = 'pk-spot';
          d.innerHTML = '<div class="mark"></div>'; d.querySelector('.mark').style.background = col(name).fill;
          d.style.background = col(name).fill + '33';
          area.append(d); return d;
        });
        carEls = st.cars.map(name => {
          const d = document.createElement('div'); d.className = 'pk-car'; d.tabIndex = 0;
          d.setAttribute('role', 'button'); d.setAttribute('aria-label', `${col(name).name} bil`);
          d.innerHTML = vehicleSvg(col(name).fill, 2, 'up');
          d.addEventListener('pointerdown', e => down(e, name, d));
          d.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); park(name, d, st.spots.indexOf(name)); } });
          area.append(d); return d;
        });
        layout();
      }

      function layout(){
        const W = area.clientWidth, H = area.clientHeight;
        if(!W || !H) return;
        const sw = Math.floor(Math.min(W / 6.2, H * 0.4 / 1.6)), sh = Math.round(sw * 1.6), gap = (W - sw * 5) / 6;
        const carW = Math.round(sw * 0.72), carH = carW * 2;
        geo = {sw, sh, gap, carW, carH, spotY: H * 0.06, carY: H - carH - H * 0.06};
        area.querySelector('.pk-road').style.top = (H * 0.06 + sh + (H * 0.94 - carH - H * 0.06 - sh) / 2) + 'px';
        spotEls.forEach((d, i) => Object.assign(d.style, {left: gap + i * (sw + gap) + 'px', top: geo.spotY + 'px', width: sw + 'px', height: sh + 'px'}));
        carEls.forEach((d, i) => {
          const name = st.cars[i];
          d.style.width = carW + 'px'; d.style.height = carH + 'px';
          if(d.classList.contains('drag')) return;
          if(st.parked[name]){ const j = st.spots.indexOf(name); d.classList.add('parked'); place(d, gap + j * (sw + gap) + (sw - carW) / 2, geo.spotY + (sh - carH) / 2 + sh * 0.08); }
          else place(d, gap + i * (sw + gap) + (sw - carW) / 2, geo.carY);
        });
      }
      const place = (d, x, y) => { d.style.left = x + 'px'; d.style.top = y + 'px'; };

      function down(e, name, d){
        if(st.parked[name]) return;
        e.preventDefault();
        d.setPointerCapture && d.setPointerCapture(e.pointerId);
        const p0 = local(e), x0 = parseFloat(d.style.left), y0 = parseFloat(d.style.top);
        d.classList.add('drag');
        const move = ev => { const p = local(ev); place(d, x0 + p.x - p0.x, y0 + p.y - p0.y); };
        const up = () => {
          d.removeEventListener('pointermove', move); d.removeEventListener('pointerup', up); d.removeEventListener('pointercancel', up);
          d.classList.remove('drag');
          // Närmaste ruta som bilens mitt ligger över.
          const cx = parseFloat(d.style.left) + geo.carW / 2, cy = parseFloat(d.style.top) + geo.carH / 2;
          const j = spotEls.findIndex((s, i) => {
            const sx = geo.gap + i * (geo.sw + geo.gap);
            return cx > sx - geo.gap / 2 && cx < sx + geo.sw + geo.gap / 2 && cy < geo.spotY + geo.sh * 1.15;
          });
          if(j >= 0 && st.spots[j] === name) park(name, d, j);
          else { if(j >= 0) tone([300], 0.05); layout(); }
        };
        d.addEventListener('pointermove', move); d.addEventListener('pointerup', up); d.addEventListener('pointercancel', up);
      }

      function park(name, d, j){
        if(st.parked[name]) return;
        st.parked[name] = true; save();
        honk(); say(`${col(name).name} bil!`);
        layout();
        if(Object.keys(st.parked).length === st.cars.length){
          setTimeout(() => {
            tone([523, 659, 784, 1047]);
            endEl.querySelector('.big').textContent = 'Alla parkerade!';
            endEl.querySelector('button').textContent = 'Parkera igen';
            endEl.classList.add('on');
          }, 700);
          if(typeof opts.onFinish === 'function') opts.onFinish();
        }
      }

      endEl.querySelector('button').addEventListener('click', () => { endEl.classList.remove('on'); st = fresh(); save(); build(); });
      newBtn.addEventListener('click', () => twoTap(() => { endEl.classList.remove('on'); st = fresh(); save(); build(); }));
      build();
      if(Object.keys(st.parked).length === st.cars.length){ endEl.querySelector('.big').textContent = 'Alla parkerade!'; endEl.querySelector('button').textContent = 'Parkera igen'; endEl.classList.add('on'); }
      return {layout};
    }

    // =====================================================================
    // Stor nivå: Ut ur garaget
    // =====================================================================
    function garage(){
      let prog = null;
      try{ prog = JSON.parse(store.get('garage') || 'null'); }catch(e){}
      if(!prog || !Array.isArray(prog.done)) prog = {current: 0, done: [], pos: null};
      prog.done = BANOR.map((_, i) => !!prog.done[i]);
      const saveProg = () => { try{ store.set('garage', JSON.stringify(prog)); }catch(e){} };

      let vs = [], pos = [], els = [], geo = null, won = false;

      function load(i, keep){
        prog.current = i;
        vs = BANOR[i].v.map(([r, c, len, d]) => ({r, c, len, d}));
        pos = keep && Array.isArray(prog.pos) && prog.pos.length === vs.length ? prog.pos.slice() : vs.map(v => v.d === 'h' ? v.c : v.r);
        prog.pos = pos.slice(); saveProg();
        won = false;
        endEl.classList.remove('on');
        build(); renderBanor();
      }

      function renderBanor(){
        banorEl.innerHTML = '';
        BANOR.forEach((b, i) => {
          const btn = document.createElement('button');
          btn.type = 'button'; btn.className = 'pk-bana' + (prog.done[i] ? ' done' : '') + (i === prog.current ? ' cur' : '');
          btn.textContent = i + 1;
          btn.setAttribute('aria-label', `Bana ${i + 1}` + (prog.done[i] ? ', klar' : '') + (i === prog.current ? ', vald' : ''));
          btn.addEventListener('click', () => { resetBtn(); load(i, false); });
          banorEl.append(btn);
        });
      }

      function build(){
        area.innerHTML = '<div class="pk-board"></div><div class="pk-exit" aria-label="Utgång">➜</div>';
        const board = area.querySelector('.pk-board');
        for(let i = 0; i < 36; i++){ const c = document.createElement('div'); c.className = 'pk-cell'; board.append(c); }
        els = vs.map((v, i) => {
          const d = document.createElement('div'); d.className = 'pk-veh'; d.tabIndex = 0;
          d.setAttribute('role', 'button');
          d.setAttribute('aria-label', (i === 0 ? 'Röda bilen' : v.len === 3 ? 'Lastbil' : 'Bil') + (v.d === 'h' ? ', åker åt sidan' : ', åker upp och ned'));
          d.innerHTML = vehicleSvg(i === 0 ? '#e8473c' : OTHER[(i - 1) % OTHER.length], v.len, v.d);
          d.addEventListener('pointerdown', e => down(e, i, d));
          d.addEventListener('keydown', e => {
            const k = {ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1}[e.key];
            if(k == null) return;
            e.preventDefault();
            const [lo, hi] = range(i);
            const np = Math.max(lo, Math.min(hi, pos[i] + k));
            if(np !== pos[i]){ pos[i] = np; moved(i); }
          });
          board.append(d); return d;
        });
        layout();
      }

      function layout(){
        const W = area.clientWidth, H = area.clientHeight;
        if(!W || !H) return;
        const cell = Math.floor(Math.min((W - 90) / N, (H - 24) / N)), S = cell * N;
        const bx = (W - S) / 2 - 20, by = (H - S) / 2;
        geo = {cell, S, bx, by};
        const board = area.querySelector('.pk-board');
        Object.assign(board.style, {left: bx + 'px', top: by + 'px', width: S + 'px', height: S + 'px'});
        board.querySelectorAll('.pk-cell').forEach((c, i) => Object.assign(c.style, {left: (i % 6) * cell + 'px', top: Math.floor(i / 6) * cell + 'px', width: cell + 'px', height: cell + 'px'}));
        Object.assign(area.querySelector('.pk-exit').style, {left: bx + S + 10 + 'px', top: by + EXIT_ROW * cell + 'px', width: Math.round(cell * 0.7) + 'px', height: cell + 'px', fontSize: Math.round(cell * 0.4) + 'px'});
        els.forEach((d, i) => { if(!d.classList.contains('drag')) placeVeh(i, pos[i]); });
      }
      function placeVeh(i, p){
        const v = vs[i], c = geo.cell, pad = c * 0.06, d = els[i];
        const r = v.d === 'h' ? v.r : p, cc = v.d === 'h' ? p : v.c;
        Object.assign(d.style, {
          left: cc * c + pad + 'px', top: r * c + pad + 'px',
          width: (v.d === 'h' ? v.len * c : c) - pad * 2 + 'px', height: (v.d === 'v' ? v.len * c : c) - pad * 2 + 'px'
        });
      }

      // Hur långt ett fordon kan glida åt varje håll innan det stöter i något.
      function range(i){
        const v = vs[i], g = Array(36).fill(false);
        vs.forEach((w, j) => { if(j === i) return; for(let k = 0; k < w.len; k++){ const r = w.d === 'h' ? w.r : pos[j] + k, c = w.d === 'h' ? pos[j] + k : w.c; g[r * 6 + c] = true; } });
        const free = p => { const r = v.d === 'h' ? v.r : p, c = v.d === 'h' ? p : v.c; return !g[r * 6 + c]; };
        let lo = pos[i], hi = pos[i];
        while(lo - 1 >= 0 && free(lo - 1)) lo--;
        while(hi + v.len <= N - 1 && free(hi + v.len)) hi++;
        return [lo, hi];
      }

      function down(e, i, d){
        if(won) return;
        e.preventDefault();
        d.setPointerCapture && d.setPointerCapture(e.pointerId);
        const p0 = local(e), start = pos[i], [lo, hi] = range(i), v = vs[i];
        d.classList.add('drag');
        let cur = start;
        const move = ev => {
          const p = local(ev), delta = (v.d === 'h' ? p.x - p0.x : p.y - p0.y) / geo.cell;
          cur = Math.max(lo, Math.min(hi, start + delta));
          placeVeh(i, cur);
        };
        const up = () => {
          d.removeEventListener('pointermove', move); d.removeEventListener('pointerup', up); d.removeEventListener('pointercancel', up);
          d.classList.remove('drag');
          pos[i] = Math.round(cur);
          placeVeh(i, pos[i]);
          if(pos[i] !== start) moved(i);
        };
        d.addEventListener('pointermove', move); d.addEventListener('pointerup', up); d.addEventListener('pointercancel', up);
      }

      function moved(i){
        tone([360 + i * 15], 0.05);
        placeVeh(i, pos[i]);
        prog.pos = pos.slice(); saveProg();
        if(pos[0] + vs[0].len === N) win();
      }

      function win(){
        won = true;
        prog.done[prog.current] = true; prog.pos = null; saveProg();
        honk();
        const car = els[0];
        car.classList.add('out');
        car.style.left = (geo.S + geo.cell * 2.5) + 'px';
        renderBanor();
        const last = prog.current === BANOR.length - 1;
        setTimeout(() => {
          tone([523, 659, 784, 1047]);
          endEl.querySelector('.big').textContent = last && prog.done.every(Boolean) ? 'Alla banor klara!' : 'Ut ur garaget!';
          endEl.querySelector('button').textContent = last ? 'Börja om från bana 1' : 'Nästa bana';
          endEl.classList.add('on');
        }, 1000);
        if(typeof opts.onFinish === 'function') opts.onFinish();
      }

      endEl.querySelector('button').addEventListener('click', () => load((prog.current + 1) % BANOR.length, false));
      newBtn.addEventListener('click', () => twoTap(() => load(prog.current, false)));
      load(Math.min(prog.current || 0, BANOR.length - 1), true);
      return {layout};
    }

    const ro = window.ResizeObserver ? new ResizeObserver(() => game.layout()) : null;
    if(ro) ro.observe(area); else window.addEventListener('resize', game.layout);

    return {
      stop(){
        clearTimeout(sureTimer);
        if(ro) ro.disconnect(); else window.removeEventListener('resize', game.layout);
        try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
        try{ if(ac) ac.close(); }catch(e){}
        root.innerHTML = '';
      }
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'parkera', title: 'Parkera', icon: '🅿️',
    about: 'Liten: dra varje bil till parkeringsrutan med samma färg. Stor: Ut ur garaget – skjut bilar och lastbilar fram och tillbaka så att den röda bilen kommer ut. 10 banor från 2 till 14 drag.',
    start,
    _test: {BANOR, N, EXIT_ROW}
  });
})();
