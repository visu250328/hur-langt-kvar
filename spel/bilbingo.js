/* Bilbingo – titta ut genom fönstret och tryck på det du ser.
   Spelbibliotekets gränssnitt (samma för alla spel):
     id, title, icon, about   – namn och symbol
     start(root, opts)        – ritar spelet i root och returnerar {stop()}
   opts: level ('small' = 4 år, 'big' = 6 år), sound (true/false),
         storage ({get(nyckel), set(nyckel, värde)}), onFinish() när spelet är klart. */
(function(){
  const CSS = `
.bb{height:100%;display:flex;flex-direction:column;gap:12px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.bb-top{display:flex;align-items:center;justify-content:space-between;gap:12px}
.bb-title{font-size:1.7rem;font-weight:800;line-height:1}
.bb-new{border:2px solid var(--line,#C6D1DF);background:var(--card,#fff);color:inherit;font:inherit;font-weight:700;border-radius:999px;padding:5px 14px;cursor:pointer}
.bb-new.sure{background:var(--done,#F2B33D);border-color:var(--done,#F2B33D);color:#2B1E00}
.bb-gridwrap{flex:1;min-height:0;display:grid;place-items:center}
.bb-grid{display:grid;gap:10px}
.bb-cell{position:relative;border:0;border-radius:22px;background:var(--card,#fff);color:inherit;font:inherit;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6%;padding:4px;
  box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);transition:background-color .25s,box-shadow .25s}
.bb-emoji{line-height:1;transition:transform .25s}
.bb-emoji svg{width:1.15em;height:1.15em;display:block}
.bb-label{font-weight:700;line-height:1;opacity:.75}
.bb-cell[aria-pressed="true"]{background:var(--done,#F2B33D);box-shadow:inset 0 0 0 3px var(--done,#F2B33D);color:#2B1E00}
.bb-cell[aria-pressed="true"] .bb-emoji{transform:scale(.92)}
.bb-stamp{position:absolute;top:6px;right:6px;width:30%;max-width:44px;aspect-ratio:1;border-radius:50%;
  background:#fff;color:#2B1E00;display:grid;place-items:center;font-weight:800;font-size:clamp(14px,2.4vmin,24px);
  box-shadow:0 0 0 3px #2B1E00;transform:scale(0);transition:transform .25s cubic-bezier(.3,1.6,.6,1)}
.bb-cell[aria-pressed="true"] .bb-stamp{transform:scale(1)}
.bb-cell.line{box-shadow:inset 0 0 0 6px #2B1E00}
.bb-cell:focus-visible,.bb-new:focus-visible,.bb-banner button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
.bb-banner{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;
  background:color-mix(in srgb,var(--sky,#DCEAF6) 88%,transparent);border-radius:inherit;cursor:pointer}
.bb-banner.on{display:flex}
.bb-banner .big{font-size:clamp(2.6rem,9vmin,5rem);font-weight:800;line-height:1}
.bb-banner .stars{font-size:clamp(2.4rem,8vmin,4.5rem);line-height:1}
.bb-banner.on .stars{animation:bb-hop .8s ease-out 2}
.bb-banner button{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.3rem;font-weight:800;border-radius:18px;padding:12px 26px;cursor:pointer;margin-top:8px}
@keyframes bb-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-18px)}}
@media (prefers-reduced-motion: reduce){
  .bb-cell,.bb-emoji,.bb-stamp{transition:none}
  .bb-banner.on .stars{animation:none}
}`;

  // Saker att leta efter. Vanliga passar båda nivåerna, ovanliga bara den stora.
  const COMMON = [
    ['Ko','🐄'],['Häst','🐎'],['Får','🐑'],['Hund','🐕'],['Fågel','🐦'],
    ['Lastbil','🚚'],['Buss','🚌'],['Traktor','🚜'],['Röd bil','🚗'],['Blå bil','🚙'],
    ['Cykel','🚲'],['Motorcykel','🏍️'],['Tåg','🚆'],['Bro','🌉'],['Hus','🏠'],
    ['Gran','🌲'],['Flagga','svg:flagga'],['Trafikljus','🚦'],['Bensinmack','⛽'],['Båt','⛵']
  ];
  const RARE = [
    ['Polisbil','🚓'],['Ambulans','🚑'],['Brandbil','🚒'],['Älg','🫎'],['Rådjur','🦌'],
    ['Flygplan','✈️'],['Kyrka','⛪'],['Slott','🏰'],['Byggkran','🏗️'],['Stoppskylt','🛑'],
    ['Regnbåge','🌈'],['Husbil','🚐']
  ];

  const shuffle = a => { a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function newCard(level){
    const items = level === 'big'
      ? shuffle(shuffle(COMMON).slice(0, 10).concat(shuffle(RARE).slice(0, 6)))
      : shuffle(COMMON).slice(0, 9);
    return {items, marked: items.map(() => false), lines: [], done: false};
  }

  function linesFor(n){
    const L = [];
    for(let r = 0; r < n; r++) L.push(Array.from({length: n}, (_, c) => r * n + c));
    for(let c = 0; c < n; c++) L.push(Array.from({length: n}, (_, r) => r * n + c));
    L.push(Array.from({length: n}, (_, i) => i * n + i));
    L.push(Array.from({length: n}, (_, i) => i * n + (n - 1 - i)));
    return L;
  }

  const FLAG_SVG = '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="4" width="3" height="42" rx="1.5" fill="#8a929c"/><circle cx="6.5" cy="4" r="2.5" fill="#f5c02e"/>'
    + '<rect x="8" y="7" width="36" height="24" rx="2" fill="#1f6fd6"/><rect x="18" y="7" width="6" height="24" fill="#ffd23a"/><rect x="8" y="16" width="36" height="6" fill="#ffd23a"/></svg>';

  function start(root, opts){
    opts = opts || {};
    const level = opts.level === 'big' ? 'big' : 'small';
    const store = opts.storage || {get(){ return null; }, set(){}};
    const key = 'bricka-' + level;
    let st = null;
    try{ st = JSON.parse(store.get(key) || 'null'); }catch(e){}
    if(!st || !Array.isArray(st.items)) st = newCard(level);
    const n = Math.round(Math.sqrt(st.items.length));
    const LINES = linesFor(n);
    const save = () => { try{ store.set(key, JSON.stringify(st)); }catch(e){} };

    if(!document.getElementById('bb-css')){
      const s = document.createElement('style'); s.id = 'bb-css'; s.textContent = CSS; document.head.append(s);
    }

    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'bb';
    el.innerHTML = `
      <div class="bb-top"><div class="bb-title">Bilbingo</div><button type="button" class="bb-new">Ny bricka</button></div>
      <div class="bb-gridwrap"><div class="bb-grid" role="group" aria-label="Bingobricka"></div></div>
      <div class="bb-banner" role="dialog" aria-live="polite"><div class="stars"></div><div class="big"></div></div>`;
    root.append(el);
    const grid = el.querySelector('.bb-grid'), banner = el.querySelector('.bb-banner'), newBtn = el.querySelector('.bb-new');

    // ---------- Ljud: en kort ton och namnet på det man hittade ----------
    let ac = null;
    function tone(freqs){
      if(!opts.sound) return;
      try{
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        freqs.forEach((f, i) => {
          const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * 0.13;
          o.type = 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
          o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.4);
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

    // ---------- Brickan ----------
    function build(){
      grid.innerHTML = '';
      st.items.forEach(([label, emoji], i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'bb-cell';
        b.setAttribute('aria-pressed', String(!!st.marked[i]));
        b.setAttribute('aria-label', label);
        b.innerHTML = '<span class="bb-emoji"></span><span class="bb-label"></span><span class="bb-stamp" aria-hidden="true">✓</span>';
        // Svenska flaggan ritas själv: flaggemojier visas som bokstäverna "SE" på bland annat Windows.
        if(emoji === 'svg:flagga' || emoji === '\u{1F1F8}\u{1F1EA}') b.querySelector('.bb-emoji').innerHTML = FLAG_SVG;   // även äldre sparade brickor
        else b.querySelector('.bb-emoji').textContent = emoji;
        b.querySelector('.bb-label').textContent = label;
        b.addEventListener('click', () => toggle(i));
        grid.append(b);
      });
      grid.style.setProperty('--n', n);
      layout();
      markLines();
    }

    // Rutorna blir så stora som möjligt men alltid kvadratiska.
    function layout(){
      const wrap = el.querySelector('.bb-gridwrap'), gap = 10;
      const size = Math.max(40, Math.floor(Math.min((wrap.clientWidth - gap * (n - 1)) / n, (wrap.clientHeight - gap * (n - 1)) / n)));
      grid.style.gridTemplateColumns = `repeat(${n}, ${size}px)`;
      grid.style.gridAutoRows = size + 'px';
      grid.querySelectorAll('.bb-emoji').forEach(e => e.style.fontSize = Math.round(size * 0.42) + 'px');
      grid.querySelectorAll('.bb-label').forEach(e => e.style.fontSize = Math.max(11, Math.round(size * 0.12)) + 'px');
    }
    const ro = window.ResizeObserver ? new ResizeObserver(layout) : null;
    if(ro) ro.observe(el.querySelector('.bb-gridwrap')); else window.addEventListener('resize', layout);

    function markLines(){
      const on = new Set();
      st.lines.forEach(k => LINES[k].forEach(i => on.add(i)));
      [...grid.children].forEach((c, i) => c.classList.toggle('line', on.has(i)));
    }

    function toggle(i){
      if(st.done) return;
      st.marked[i] = !st.marked[i];
      const cell = grid.children[i];
      cell.setAttribute('aria-pressed', String(st.marked[i]));
      if(st.marked[i]){ tone([660]); say(st.items[i][0]); }
      // En rad som inte längre är hel räknas inte.
      st.lines = st.lines.filter(k => LINES[k].every(j => st.marked[j]));
      const newLines = LINES.map((l, k) => k).filter(k => !st.lines.includes(k) && LINES[k].every(j => st.marked[j]));
      st.lines.push(...newLines);
      markLines();
      if(st.marked.every(Boolean)){
        st.done = true; save();
        tone([523, 659, 784, 1047]);
        showBanner('Hela brickan!', '🎉', true);
        if(typeof opts.onFinish === 'function') opts.onFinish();
        return;
      }
      if(newLines.length){ tone([523, 659, 784]); showBanner('Bingo!', '⭐⭐⭐', false); }
      save();
    }

    // ---------- Firande ----------
    let bannerTimer = null;
    function showBanner(text, stars, final){
      clearTimeout(bannerTimer);
      banner.querySelector('.big').textContent = text;
      banner.querySelector('.stars').textContent = stars;
      const old = banner.querySelector('button'); if(old) old.remove();
      if(final){
        const b = document.createElement('button'); b.type = 'button'; b.textContent = 'Ny bricka';
        b.addEventListener('click', e => { e.stopPropagation(); fresh(); });
        banner.append(b);
      }else{
        bannerTimer = setTimeout(hideBanner, 2600);
      }
      banner.classList.add('on');
    }
    function hideBanner(){ banner.classList.remove('on'); }
    banner.addEventListener('click', () => { if(!st.done) hideBanner(); });

    // ---------- Ny bricka: två tryck, så att ingen råkar börja om ----------
    let sureTimer = null;
    newBtn.addEventListener('click', () => {
      if(!newBtn.classList.contains('sure')){
        newBtn.classList.add('sure'); newBtn.textContent = 'Tryck igen för ny bricka';
        sureTimer = setTimeout(resetBtn, 3000);
        return;
      }
      fresh();
    });
    function resetBtn(){ clearTimeout(sureTimer); newBtn.classList.remove('sure'); newBtn.textContent = 'Ny bricka'; }
    function fresh(){ resetBtn(); hideBanner(); st = newCard(level); save(); build(); }

    build();
    if(st.done) showBanner('Hela brickan!', '🎉', true);

    return {
      stop(){
        clearTimeout(bannerTimer); clearTimeout(sureTimer);
        if(ro) ro.disconnect(); else window.removeEventListener('resize', layout);
        try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
        try{ if(ac) ac.close(); }catch(e){}
        root.innerHTML = '';
      }
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'bilbingo', title: 'Bilbingo', icon: '🐄',
    about: 'Titta ut genom fönstret och tryck på det du ser. Hel rad ger bingo. Liten: 3 × 3 vanliga saker. Stor: 4 × 4 med några ovanliga.',
    start
  });
})();
