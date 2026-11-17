/* Kurragömma – en lugn variant av whack-a-mole. Djur tittar upp ur hål, och barnet
   trycker för att hitta dem. Ingen tidspress som straffar: missar man kryper djuret ned igen.
   Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.ka{height:100%;display:flex;flex-direction:column;gap:12px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.ka-top{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px}
.ka-title{font-size:1.7rem;font-weight:800;line-height:1}
.ka-score{font-size:1.6rem;font-weight:800;line-height:1;background:var(--card,#fff);border-radius:999px;padding:6px 16px;box-shadow:inset 0 0 0 3px var(--done,#F2B33D)}
.ka-score.bump{animation:ka-bump .3s ease}
.ka-field{flex:1;min-height:0;display:grid;place-items:center;border-radius:26px;background:#8cc97a;
  background-image:radial-gradient(circle at 20% 30%,rgba(255,255,255,.12) 0 6%,transparent 7%),radial-gradient(circle at 70% 70%,rgba(255,255,255,.1) 0 5%,transparent 6%);background-size:120px 120px}
.ka-grid{display:grid;gap:14px}
.ka-hole{position:relative;border:0;padding:0;background:none;cursor:pointer;font:inherit;-webkit-tap-highlight-color:transparent}
.ka-dirt{position:absolute;left:8%;right:8%;bottom:6%;height:30%;border-radius:50%;background:#5b3b22;box-shadow:inset 0 10px 0 #3e2716}
.ka-win{position:absolute;left:0;right:0;top:0;bottom:21%;overflow:hidden}
.ka-ani{position:absolute;left:0;right:0;bottom:-4%;display:grid;place-items:end center;line-height:1;transform:translateY(110%);transition:transform .35s ease}
.ka-hole.up .ka-ani{transform:translateY(0)}
.ka-hole.found .ka-ani{transform:translateY(0) scale(1.12) rotate(-6deg);transition:transform .2s ease}
.ka-lip{position:absolute;left:8%;right:8%;bottom:6%;height:15%;border-radius:0 0 50% 50% / 0 0 100% 100%;background:#6e4a2c}
.ka-star{position:absolute;left:50%;top:6%;transform:translate(-50%,0) scale(0);font-size:40px;line-height:1;pointer-events:none;opacity:0}
.ka-hole.found .ka-star{animation:ka-star .7s ease forwards}
.ka-hole:focus-visible,.ka-play:focus-visible,.ka-end button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
.ka-start,.ka-end{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;
  background:color-mix(in srgb,var(--sky,#DCEAF6) 85%,transparent);border-radius:inherit;z-index:5}
.ka-start.on,.ka-end.on{display:flex}
.ka-play{border:0;width:150px;height:150px;border-radius:50%;background:var(--done,#F2B33D);color:#2B1E00;font-size:64px;cursor:pointer;display:grid;place-items:center;padding-left:10px;box-sizing:border-box}
.ka-start .peek{font-size:3rem;line-height:1}
.ka-end .big{font-size:clamp(2.4rem,8vmin,4.5rem);font-weight:800;line-height:1}
.ka-end .stars{font-size:clamp(2.4rem,8vmin,4.5rem);line-height:1}
.ka-end .got{font-size:2.4rem;font-weight:800;line-height:1}
.ka-end.on .stars{animation:ka-hop .8s ease-out 2}
.ka-end button{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.3rem;font-weight:800;border-radius:18px;padding:12px 26px;cursor:pointer;margin-top:8px}
@keyframes ka-star{0%{opacity:1;transform:translate(-50%,10px) scale(.4)}60%{opacity:1;transform:translate(-50%,-30px) scale(1.1)}100%{opacity:0;transform:translate(-50%,-50px) scale(1)}}
@keyframes ka-bump{50%{transform:scale(1.15)}}
@keyframes ka-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-18px)}}
@media (prefers-reduced-motion: reduce){
  .ka-ani{transition:none}
  .ka-hole.found .ka-star,.ka-score.bump,.ka-end.on .stars{animation:none}
}`;

  const ANIMALS = ['🐹', '🐭', '🐰', '🦔', '🐿️', '🐸'];
  // Liten: färre hål, djuren stannar länge och kommer ett i taget.
  // Stor: fler hål, lite snabbare, ibland två samtidigt.
  const LEVELS = {
    small: {cols: 3, rows: 2, every: 1700, stay: 2800, maxUp: 1, total: 15},
    big:   {cols: 3, rows: 3, every: 1150, stay: 2000, maxUp: 2, total: 20}
  };

  function start(root, opts){
    opts = opts || {};
    const level = opts.level === 'big' ? 'big' : 'small';
    const L = LEVELS[level], N = L.cols * L.rows;

    if(!document.getElementById('ka-css')){
      const s = document.createElement('style'); s.id = 'ka-css'; s.textContent = CSS; document.head.append(s);
    }

    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'ka';
    el.innerHTML = `
      <div class="ka-top"><div class="ka-title">Kurragömma</div><div class="ka-score" aria-live="polite">⭐ 0</div></div>
      <div class="ka-field"><div class="ka-grid" role="group" aria-label="Hålen"></div></div>
      <div class="ka-start on"><div class="peek">🐹 🐰 🦔</div><button type="button" class="ka-play" aria-label="Börja">▶</button></div>
      <div class="ka-end" role="dialog" aria-live="polite"><div class="stars">⭐⭐⭐</div><div class="big">Bra jobbat!</div><div class="got"></div><button type="button">Spela igen</button></div>`;
    root.append(el);
    const grid = el.querySelector('.ka-grid'), field = el.querySelector('.ka-field'), scoreEl = el.querySelector('.ka-score');
    const startEl = el.querySelector('.ka-start'), endEl = el.querySelector('.ka-end');

    // ---------- Ljud ----------
    let ac = null;
    function tone(freqs, vol){
      if(!opts.sound) return;
      try{
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        freqs.forEach((f, i) => {
          const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * 0.1;
          o.type = 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.16, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
          o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.3);
        });
      }catch(e){}
    }

    // ---------- Hålen ----------
    const holes = Array.from({length: N}, (_, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'ka-hole'; b.setAttribute('aria-label', 'Hål ' + (i + 1));
      b.innerHTML = '<span class="ka-dirt"></span><span class="ka-win"><span class="ka-ani"></span></span><span class="ka-lip"></span><span class="ka-star">⭐</span>';
      b.addEventListener('pointerdown', e => { e.preventDefault(); hit(i); });
      b.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); hit(i); } });
      grid.append(b);
      return {b, ani: b.querySelector('.ka-ani'), up: false, timer: null};
    });

    function layout(){
      const W = field.clientWidth - 28, H = field.clientHeight - 28, gap = 14;
      const size = Math.max(60, Math.floor(Math.min((W - gap * (L.cols - 1)) / L.cols, (H - gap * (L.rows - 1)) / L.rows)));
      grid.style.gridTemplateColumns = `repeat(${L.cols}, ${size}px)`;
      grid.style.gridAutoRows = size + 'px';
      holes.forEach(h => h.ani.style.fontSize = Math.round(size * 0.7) + 'px');
      el.querySelectorAll('.ka-star').forEach(s => s.style.fontSize = Math.round(size * 0.3) + 'px');
    }
    const ro = window.ResizeObserver ? new ResizeObserver(layout) : null;
    if(ro) ro.observe(field); else window.addEventListener('resize', layout);
    layout();

    // ---------- Omgången ----------
    let running = false, shown = 0, found = 0, spawnTimer = null, paused = false;

    function begin(){
      startEl.classList.remove('on'); endEl.classList.remove('on');
      shown = 0; found = 0; scoreEl.textContent = '⭐ 0';
      holes.forEach(h => { clearTimeout(h.timer); h.up = false; h.b.classList.remove('up', 'found'); });
      running = true;
      tone([392, 523]);
      spawnTimer = setTimeout(spawn, 600);
    }

    function spawn(){
      if(!running || paused) return;
      const upNow = holes.filter(h => h.up).length;
      if(shown < L.total && upNow < L.maxUp && holes.some(h => !h.up && !h.b.classList.contains('found'))){
        const free = holes.map((h, i) => i).filter(i => !holes[i].up && !holes[i].b.classList.contains('found'));
        const i = free[Math.floor(Math.random() * free.length)];
        const h = holes[i];
        h.ani.textContent = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
        h.b.classList.remove('found');
        h.up = true; h.b.classList.add('up');
        shown++;
        h.timer = setTimeout(() => down(i), L.stay);
      }
      if(shown >= L.total){ checkEnd(); return; }
      spawnTimer = setTimeout(spawn, L.every * (0.8 + Math.random() * 0.4));
    }

    function down(i){
      const h = holes[i];
      clearTimeout(h.timer);
      h.up = false; h.b.classList.remove('up');
      checkEnd();
    }

    function hit(i){
      const h = holes[i];
      if(!running || !h.up) return;
      clearTimeout(h.timer);
      h.up = false;
      found++;
      scoreEl.textContent = '⭐ ' + found;
      scoreEl.classList.remove('bump'); void scoreEl.offsetWidth; scoreEl.classList.add('bump');
      h.b.classList.remove('found'); void h.b.offsetWidth; h.b.classList.add('found');
      tone([600 + Math.random() * 300, 900 + Math.random() * 200], 0.12);
      // Djuret blir glatt en kort stund och kryper sedan ned.
      h.timer = setTimeout(() => { h.b.classList.remove('up', 'found'); checkEnd(); }, 450);
    }

    function checkEnd(){
      if(!running || shown < L.total || holes.some(h => h.up || h.b.classList.contains('found'))) return;
      running = false;
      clearTimeout(spawnTimer);
      tone([523, 659, 784, 1047]);
      endEl.querySelector('.got').textContent = '⭐ ' + found;
      setTimeout(() => endEl.classList.add('on'), 400);
      if(typeof opts.onFinish === 'function') opts.onFinish();
    }

    // Pausa om iPaden låses eller appen lämnas, och fortsätt sedan.
    function onVis(){
      if(document.visibilityState === 'hidden'){
        paused = true; clearTimeout(spawnTimer);
        holes.forEach((h, i) => { if(h.up){ clearTimeout(h.timer); h.up = false; h.b.classList.remove('up'); } });
      }else if(paused){
        paused = false;
        if(running) spawnTimer = setTimeout(spawn, 800);
      }
    }
    document.addEventListener('visibilitychange', onVis);

    el.querySelector('.ka-play').addEventListener('click', begin);
    endEl.querySelector('button').addEventListener('click', begin);

    return {
      stop(){
        running = false; clearTimeout(spawnTimer);
        holes.forEach(h => clearTimeout(h.timer));
        document.removeEventListener('visibilitychange', onVis);
        if(ro) ro.disconnect(); else window.removeEventListener('resize', layout);
        try{ if(ac) ac.close(); }catch(e){}
        root.innerHTML = '';
      }
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'kurragomma', title: 'Kurragömma', icon: '🐹',
    about: 'Djur tittar upp ur hål – tryck på dem för att hitta dem. Missar man kryper djuret bara ned igen. Liten: 6 hål, 15 djur, långsamt. Stor: 9 hål, 20 djur, ibland två samtidigt.',
    start
  });
})();
