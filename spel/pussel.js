/* Pussel – dra bitarna till rätt plats. Bilderna ritas i spelet, inga bildfiler.
   Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.pz{height:100%;display:flex;flex-direction:column;gap:12px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.pz-top{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px}
.pz-title{font-size:1.7rem;font-weight:800;line-height:1}
.pz-new{border:2px solid var(--line,#C6D1DF);background:var(--card,#fff);color:inherit;font:inherit;font-weight:700;border-radius:999px;padding:5px 14px;cursor:pointer;flex:none}
.pz-new.sure{background:var(--done,#F2B33D);border-color:var(--done,#F2B33D);color:#2B1E00}
.pz-area{flex:1;min-height:0;position:relative;touch-action:none}
.pz-board{position:absolute;border-radius:16px;overflow:hidden;background:var(--card,#fff);box-shadow:0 0 0 4px var(--line,#C6D1DF)}
.pz-ghost{position:absolute;inset:0;background-size:100% 100%;filter:grayscale(.3)}
.pz-slot{position:absolute;box-sizing:border-box;border:2px dashed var(--line,#C6D1DF)}
.pz-piece{position:absolute;box-sizing:border-box;border-radius:10px;background-repeat:no-repeat;cursor:grab;touch-action:none;
  box-shadow:0 2px 0 rgba(0,0,0,.18),inset 0 0 0 2px rgba(255,255,255,.7);
  transition:left .3s ease,top .3s ease,width .3s ease,height .3s ease}
.pz-piece.placed{border-radius:0;box-shadow:none;cursor:default}
.pz-piece.drag{transition:none;z-index:5;cursor:grabbing;box-shadow:0 8px 18px rgba(0,0,0,.3)}
.pz-piece.sel{box-shadow:0 0 0 5px var(--done,#F2B33D)}
.pz-piece.no{animation:pz-wobble .4s ease}
.pz-piece:focus-visible,.pz-new:focus-visible,.pz-end button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
.pz-end{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;
  background:color-mix(in srgb,var(--sky,#DCEAF6) 30%,transparent);border-radius:inherit;z-index:10}
.pz-end .big{text-shadow:0 0 12px var(--sky,#DCEAF6),0 0 4px var(--sky,#DCEAF6)}
.pz-end.on{display:flex}
.pz-end .big{font-size:clamp(2.4rem,8vmin,4.5rem);font-weight:800;line-height:1}
.pz-end .stars{font-size:clamp(2.4rem,8vmin,4.5rem);line-height:1}
.pz-end.on .stars{animation:pz-hop .8s ease-out 2}
.pz-end button{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.3rem;font-weight:800;border-radius:18px;padding:12px 26px;cursor:pointer;margin-top:8px}
@keyframes pz-wobble{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
@keyframes pz-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-18px)}}
@media (prefers-reduced-motion: reduce){
  .pz-piece{transition:none}
  .pz-piece.no,.pz-end.on .stars{animation:none}
}`;

  // ---------- Bilderna, ritade på en duk 600 × 600 ----------
  const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  function painter(g){
    return {
      rect(col, x, y, w, h){ g.fillStyle = col; g.fillRect(x, y, w, h); },
      oval(col, x, y, rx, ry){ g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); },
      grad(top, bottom, y0, y1){ const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, top); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, y0, 600, y1 - y0); },
      e(emoji, x, y, size){ g.font = `${size}px ${EMOJI_FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(emoji, x, y); }
    };
  }
  const SCENES = [
    {name: 'Bilen', draw(p){
      p.grad('#8fd0f7', '#cdebfb', 0, 360); p.rect('#7cc36b', 0, 360, 600, 240);
      p.rect('#5f6570', 0, 420, 600, 120); for(let x = 10; x < 600; x += 90) p.rect('#ffffff', x, 474, 50, 10);
      p.e('☀️', 495, 95, 120); p.e('☁️', 160, 100, 110); p.e('🌳', 85, 320, 140); p.e('🌳', 525, 330, 120);
      p.e('🚗', 300, 455, 230);
    }},
    {name: 'Huset', draw(p){
      p.grad('#a9dcfa', '#e3f4fd', 0, 390); p.rect('#86c56f', 0, 390, 600, 210);
      p.e('☁️', 470, 90, 110); p.e('🏠', 300, 300, 280); p.e('🌳', 95, 330, 160);
      [70, 180, 420, 530].forEach(x => p.e('🌷', x, 530, 70)); p.e('🐈', 475, 455, 90);
    }},
    {name: 'Båten', draw(p){
      p.grad('#ffc98a', '#ffe9c9', 0, 340); p.grad('#4aa2e0', '#1f5f9e', 340, 600);
      p.e('☀️', 115, 110, 120); p.e('🐦', 470, 130, 70); p.e('🐦', 400, 90, 50);
      for(let x = 0; x < 600; x += 80) p.oval('rgba(255,255,255,.35)', x + 40, 360, 34, 6);
      p.e('⛵', 300, 290, 240); p.e('🐟', 150, 500, 80); p.e('🐠', 440, 530, 80);
    }},
    {name: 'Kon', draw(p){
      p.grad('#bfe6ff', '#eaf7ff', 0, 300); p.rect('#98d07a', 0, 300, 600, 300);
      for(let x = 20; x < 600; x += 110) p.rect('#a8763e', x, 270, 14, 90); p.rect('#a8763e', 0, 290, 600, 12); p.rect('#a8763e', 0, 330, 600, 12);
      p.e('☁️', 150, 90, 100); p.e('☁️', 450, 120, 90);
      p.e('🐄', 300, 420, 240); p.e('🌻', 85, 490, 100); p.e('🌻', 520, 510, 100);
    }},
    {name: 'Natten', draw(p){
      p.grad('#0f1b3d', '#28407a', 0, 600); p.oval('#1f4d3a', 300, 640, 420, 200);
      p.e('🌙', 470, 115, 140);
      [[90, 80, 50], [210, 150, 36], [330, 70, 44], [140, 230, 30], [560, 240, 34], [390, 190, 28]].forEach(([x, y, s]) => p.e('⭐', x, y, s));
      p.e('🌲', 95, 430, 150); p.e('🌲', 520, 450, 130); p.e('🦉', 300, 400, 190);
    }},
    {name: 'Tåget', draw(p){
      p.grad('#a8dcff', '#e0f3ff', 0, 400); p.oval('#8cc97a', 140, 420, 260, 120); p.oval('#79bb68', 470, 430, 260, 110);
      p.rect('#8cc97a', 0, 420, 600, 180);
      p.rect('#7a5a3a', 0, 505, 600, 10); p.rect('#7a5a3a', 0, 535, 600, 10);
      for(let x = 0; x < 600; x += 40) p.rect('#9c7a55', x, 500, 14, 50);
      p.e('☀️', 500, 90, 110); p.e('🌲', 75, 330, 120); p.e('🚃', 445, 455, 150); p.e('🚂', 230, 450, 190);
    }}
  ];
  const cache = {};
  function picture(i){
    if(cache[i]) return cache[i];
    const c = document.createElement('canvas'); c.width = c.height = 600;
    const g = c.getContext && c.getContext('2d');
    if(!g) return '';
    SCENES[i].draw(painter(g));
    return (cache[i] = c.toDataURL('image/png'));
  }

  const GRID = {small: 2, big: 3};
  const GHOST = {small: 0.35, big: 0};
  const shuffle = a => { a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const newPuzzle = (level, scene) => {
    const n = GRID[level], N = n * n;
    let order = shuffle(Array.from({length: N}, (_, i) => i));
    if(order.every((x, i) => x === i)) order = order.reverse();
    return {scene, placed: Array(N).fill(false), order, done: false};
  };

  function start(root, opts){
    opts = opts || {};
    const level = opts.level === 'big' ? 'big' : 'small';
    const n = GRID[level], N = n * n;
    const store = opts.storage || {get(){ return null; }, set(){}};
    const key = 'pussel-' + level;
    let st = null;
    try{ st = JSON.parse(store.get(key) || 'null'); }catch(e){}
    if(!st || !Array.isArray(st.placed) || st.placed.length !== N) st = newPuzzle(level, Math.floor(Math.random() * SCENES.length));
    const save = () => { try{ store.set(key, JSON.stringify(st)); }catch(e){} };

    if(!document.getElementById('pz-css')){
      const s = document.createElement('style'); s.id = 'pz-css'; s.textContent = CSS; document.head.append(s);
    }

    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'pz';
    el.innerHTML = `
      <div class="pz-top"><div class="pz-title">Pussel</div><button type="button" class="pz-new">Nytt pussel</button></div>
      <div class="pz-area"><div class="pz-board"><div class="pz-ghost"></div></div></div>
      <div class="pz-end" role="dialog" aria-live="polite"><div class="stars">⭐⭐⭐</div><div class="big">Pusslet är klart!</div><button type="button">Nästa pussel</button></div>`;
    root.append(el);
    const area = el.querySelector('.pz-area'), board = el.querySelector('.pz-board'), ghost = el.querySelector('.pz-ghost');
    const endEl = el.querySelector('.pz-end'), newBtn = el.querySelector('.pz-new');

    // ---------- Ljud ----------
    let ac = null;
    function tone(freqs, vol){
      if(!opts.sound) return;
      try{
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        freqs.forEach((f, i) => {
          const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * 0.13;
          o.type = 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.16, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
          o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.35);
        });
      }catch(e){}
    }
    function say(text){
      if(!opts.sound || !window.speechSynthesis) return;
      try{
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'sv-SE'; u.rate = 0.9;
        const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.replace('_', '-').startsWith('sv'));
        if(v) u.voice = v;
        speechSynthesis.speak(u);
      }catch(e){}
    }

    // ---------- Bitarna ----------
    let pieces = [], geo = null, selected = null;

    function build(){
      pieces.forEach(p => p.remove());
      board.querySelectorAll('.pz-slot').forEach(s => s.remove());
      const url = picture(st.scene);
      ghost.style.backgroundImage = `url(${url})`;
      ghost.style.opacity = GHOST[level];
      for(let i = 0; i < N; i++){
        const s = document.createElement('div'); s.className = 'pz-slot'; board.append(s);
      }
      pieces = Array.from({length: N}, (_, i) => {
        const d = document.createElement('div');
        const r = Math.floor(i / n), c = i % n;
        d.className = 'pz-piece';
        d.tabIndex = 0;
        d.setAttribute('role', 'button');
        d.setAttribute('aria-label', `Pusselbit ${i + 1}`);
        d.style.backgroundImage = `url(${url})`;
        d.style.backgroundSize = `${n * 100}% ${n * 100}%`;
        d.style.backgroundPosition = `${n > 1 ? c / (n - 1) * 100 : 0}% ${n > 1 ? r / (n - 1) * 100 : 0}%`;
        d.addEventListener('pointerdown', e => down(e, i));
        d.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); select(i); } });
        area.append(d);
        return d;
      });
      selected = null;
      layout();
    }

    // Bräda till vänster (liggande) eller överst (stående), lösa bitar i resten av ytan.
    function layout(){
      const W = area.clientWidth, H = area.clientHeight, gap = 16;
      if(!W || !H) return;
      const land = W >= H;
      const S = Math.floor(land ? Math.min(H, W * 0.6) : Math.min(W, H * 0.6));
      const bx = land ? 0 : (W - S) / 2, by = land ? (H - S) / 2 : 0;
      const cell = S / n;
      const tray = land ? {x: S + gap, y: 0, w: W - S - gap, h: H} : {x: 0, y: S + gap, w: W, h: H - S - gap};
      geo = {bx, by, S, cell, tray};
      Object.assign(board.style, {left: bx + 'px', top: by + 'px', width: S + 'px', height: S + 'px'});
      [...board.querySelectorAll('.pz-slot')].forEach((s, i) => {
        Object.assign(s.style, {left: (i % n) * cell + 'px', top: Math.floor(i / n) * cell + 'px', width: cell + 'px', height: cell + 'px'});
      });
      // Lösa bitar: så stora som får plats, högst lika stora som platserna på brädan.
      const loose = st.order.filter(i => !st.placed[i]), k = loose.length;
      let best = {p: 0, cols: 1};
      for(let cols = 1; cols <= Math.max(1, k); cols++){
        const rows = Math.ceil(Math.max(1, k) / cols);
        const p = Math.min(cell, (tray.w - gap * (cols - 1)) / cols, (tray.h - gap * (rows - 1)) / rows);
        if(p > best.p) best = {p, cols};
      }
      const p = Math.max(30, Math.floor(best.p)), cols = best.cols, rows = Math.ceil(Math.max(1, k) / cols);
      const ox = tray.x + (tray.w - (cols * p + gap * (cols - 1))) / 2, oy = tray.y + (tray.h - (rows * p + gap * (rows - 1))) / 2;
      pieces.forEach((d, i) => {
        if(d.classList.contains('drag')) return;
        if(st.placed[i]){
          d.classList.add('placed');
          place(d, bx + (i % n) * cell, by + Math.floor(i / n) * cell, cell);
        }else{
          const j = loose.indexOf(i);
          place(d, ox + (j % cols) * (p + gap), oy + Math.floor(j / cols) * (p + gap), p);
        }
      });
    }
    const place = (d, x, y, s) => Object.assign(d.style, {left: x + 'px', top: y + 'px', width: s + 'px', height: s + 'px'});
    const ro = window.ResizeObserver ? new ResizeObserver(layout) : null;
    if(ro) ro.observe(area); else window.addEventListener('resize', layout);

    // Musens eller fingrets läge i spelytans egna mått (spellabbet kan skala ned spelet).
    function local(e){
      const r = area.getBoundingClientRect(), k = r.width / (area.clientWidth || 1) || 1;
      return {x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k};
    }

    let drag = null;
    function down(e, i){
      if(st.placed[i] || st.done) return;
      e.preventDefault();
      const d = pieces[i];
      d.setPointerCapture && d.setPointerCapture(e.pointerId);
      drag = {i, start: local(e), moved: false};
      const move = ev => {
        const q = local(ev);
        if(!drag.moved && Math.hypot(q.x - drag.start.x, q.y - drag.start.y) < 8) return;
        if(!drag.moved){ drag.moved = true; d.classList.add('drag'); unselect(); tone([440], 0.06); }
        place(d, q.x - geo.cell / 2, q.y - geo.cell / 2, geo.cell);
      };
      const up = ev => {
        d.removeEventListener('pointermove', move); d.removeEventListener('pointerup', up); d.removeEventListener('pointercancel', up);
        const was = drag; drag = null;
        if(!was.moved){ select(i); return; }
        d.classList.remove('drag');
        const q = local(ev);
        const tx = geo.bx + (i % n) * geo.cell + geo.cell / 2, ty = geo.by + Math.floor(i / n) * geo.cell + geo.cell / 2;
        if(Math.hypot(q.x - tx, q.y - ty) < geo.cell * 0.45) lock(i);
        else layout();      // tillbaka bland de lösa bitarna
      };
      d.addEventListener('pointermove', move); d.addEventListener('pointerup', up); d.addEventListener('pointercancel', up);
    }

    // Tryck på en bit och sedan på rätt plats fungerar också.
    function select(i){
      if(st.placed[i]) return;
      if(selected === i){ unselect(); return; }
      unselect(); selected = i; pieces[i].classList.add('sel'); tone([440], 0.06);
    }
    function unselect(){ if(selected != null && pieces[selected]) pieces[selected].classList.remove('sel'); selected = null; }
    board.addEventListener('click', e => {
      if(selected == null) return;
      const q = local(e), c = Math.floor((q.x - geo.bx) / geo.cell), r = Math.floor((q.y - geo.by) / geo.cell);
      if(r * n + c === selected){ const i = selected; unselect(); lock(i); }
      else { const d = pieces[selected]; d.classList.remove('no'); void d.offsetWidth; d.classList.add('no'); tone([300], 0.05); }
    });

    function lock(i){
      st.placed[i] = true;
      tone([523, 659]);
      save();
      layout();
      if(st.placed.every(Boolean)) finish();
    }

    function finish(){
      st.done = true; save();
      tone([523, 659, 784, 1047]);
      say(SCENES[st.scene].name);
      setTimeout(() => endEl.classList.add('on'), 500);
      if(typeof opts.onFinish === 'function') opts.onFinish();
    }

    function next(){
      endEl.classList.remove('on');
      st = newPuzzle(level, (st.scene + 1) % SCENES.length);
      save();
      build();
    }
    endEl.querySelector('button').addEventListener('click', next);

    let sureTimer = null;
    function resetBtn(){ clearTimeout(sureTimer); newBtn.classList.remove('sure'); newBtn.textContent = 'Nytt pussel'; }
    newBtn.addEventListener('click', () => {
      if(st.done){ resetBtn(); next(); return; }
      if(!newBtn.classList.contains('sure')){
        newBtn.classList.add('sure'); newBtn.textContent = 'Tryck igen för nytt pussel';
        sureTimer = setTimeout(resetBtn, 3000);
        return;
      }
      resetBtn(); next();
    });

    build();
    if(st.done) endEl.classList.add('on');

    return {
      stop(){
        clearTimeout(sureTimer);
        if(ro) ro.disconnect(); else window.removeEventListener('resize', layout);
        try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
        try{ if(ac) ac.close(); }catch(e){}
        root.innerHTML = '';
      }
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'pussel', title: 'Pussel', icon: '🧩',
    about: 'Dra bitarna till rätt plats på brädan, eller tryck på en bit och sedan på platsen. Liten: 4 bitar med bilden svagt i bakgrunden. Stor: 9 bitar utan hjälpbild.',
    start
  });
})();
