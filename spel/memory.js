/* Memory – vänd kort och hitta par. En eller två spelare, ingen vinnare.
   Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.mm{height:100%;display:flex;flex-direction:column;gap:12px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.mm-top{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px}
.mm-title{font-size:1.7rem;font-weight:800;line-height:1}
.mm-players{display:flex;gap:12px;align-items:center}
.mm-chip{display:flex;align-items:center;gap:8px;background:var(--card,#fff);border-radius:999px;padding:4px 14px 4px 6px;
  box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);transition:transform .25s,box-shadow .25s;opacity:.6}
.mm-chip .who{font-size:30px;line-height:1}
.mm-chip .n{font-size:1.5rem;font-weight:800;line-height:1;min-width:1ch;text-align:center}
.mm-chip.turn{opacity:1;transform:scale(1.08);box-shadow:inset 0 0 0 4px var(--done,#F2B33D)}
.mm-new{border:2px solid var(--line,#C6D1DF);background:var(--card,#fff);color:inherit;font:inherit;font-weight:700;border-radius:999px;padding:5px 14px;cursor:pointer;flex:none}
.mm-new.sure{background:var(--done,#F2B33D);border-color:var(--done,#F2B33D);color:#2B1E00}
.mm-gridwrap{flex:1;min-height:0;display:grid;place-items:center}
.mm-grid{display:grid;gap:10px}
.mm-card{display:block;width:100%;height:100%;border:0;padding:0;background:none;cursor:pointer;perspective:800px;font:inherit;-webkit-tap-highlight-color:transparent}
.mm-in{display:block;position:relative;width:100%;height:100%;transition:transform .35s ease;transform-style:preserve-3d}
.mm-card.up .mm-in{transform:rotateY(180deg)}
.mm-face{position:absolute;inset:0;border-radius:20px;display:grid;place-items:center;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.mm-back{background:var(--accent,#2F6FD6);
  background-image:radial-gradient(circle at 25% 25%,rgba(255,255,255,.22) 0 9%,transparent 10%),radial-gradient(circle at 75% 75%,rgba(255,255,255,.22) 0 9%,transparent 10%);
  background-size:40% 40%;box-shadow:inset 0 0 0 4px rgba(0,0,0,.12)}
.mm-back span{opacity:.9;filter:grayscale(.2)}
.mm-front{background:var(--card,#fff);transform:rotateY(180deg);box-shadow:inset 0 0 0 3px var(--line,#C6D1DF)}
.mm-card.matched .mm-front{box-shadow:inset 0 0 0 5px var(--done,#F2B33D)}
.mm-front .by{position:absolute;bottom:6px;right:8px;line-height:1}
.mm-card:focus-visible,.mm-new:focus-visible,.mm-start button:focus-visible,.mm-end button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
.mm-start,.mm-end{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;
  background:color-mix(in srgb,var(--sky,#DCEAF6) 92%,transparent);border-radius:inherit}
.mm-start.on,.mm-end.on{display:flex}
.mm-start .q{font-size:1.4rem;font-weight:700;opacity:.8}
.mm-start .opts{display:flex;gap:18px;flex-wrap:wrap;justify-content:center}
.mm-start .opts button{border:0;background:var(--card,#fff);border-radius:28px;padding:22px 30px;cursor:pointer;box-shadow:inset 0 0 0 4px var(--done,#F2B33D);font:inherit;color:inherit;display:flex;flex-direction:column;align-items:center;gap:6px;min-width:150px}
.mm-start .opts .em{font-size:3.4rem;line-height:1}
.mm-start .opts .lb{font-weight:700;font-size:1.1rem;opacity:.75}
.mm-end .big{font-size:clamp(2.6rem,9vmin,5rem);font-weight:800;line-height:1}
.mm-end .stars{font-size:clamp(2.4rem,8vmin,4.5rem);line-height:1}
.mm-end .res{display:flex;gap:28px;font-size:2rem;font-weight:800}
.mm-end.on .stars{animation:mm-hop .8s ease-out 2}
.mm-end button{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.3rem;font-weight:800;border-radius:18px;padding:12px 26px;cursor:pointer}
@keyframes mm-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-18px)}}
@media (prefers-reduced-motion: reduce){
  .mm-in,.mm-chip{transition:none}
  .mm-end.on .stars{animation:none}
}`;

  const PICS = [
    ['Hund','🐶'],['Katt','🐱'],['Kanin','🐰'],['Räv','🦊'],['Björn','🐻'],['Panda','🐼'],['Groda','🐸'],['Apa','🐵'],
    ['Gris','🐷'],['Ko','🐮'],['Lejon','🦁'],['Tiger','🐯'],['Höna','🐔'],['Pingvin','🐧'],['Sköldpadda','🐢'],['Bläckfisk','🐙'],
    ['Fjäril','🦋'],['Bi','🐝'],['Uggla','🦉'],['Häst','🐴']
  ];
  const WHO = ['🦖', '🦄'];
  const PAIRS = {small: 3, big: 6};
  const FLIP_BACK_MS = 1300;

  const shuffle = a => { a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function newGame(level, players){
    const pics = shuffle(PICS).slice(0, PAIRS[level]);
    const cards = shuffle(pics.concat(pics)).map(([label, e]) => ({label, e, matched: false, by: null}));
    return {phase: 'play', players, turn: 0, scores: [0, 0], cards};
  }

  function start(root, opts){
    opts = opts || {};
    const level = opts.level === 'big' ? 'big' : 'small';
    const store = opts.storage || {get(){ return null; }, set(){}};
    const key = 'spel-' + level;
    let st = null;
    try{ st = JSON.parse(store.get(key) || 'null'); }catch(e){}
    if(!st || !Array.isArray(st.cards)) st = {phase: 'start'};
    const save = () => { try{ store.set(key, JSON.stringify(st)); }catch(e){} };

    if(!document.getElementById('mm-css')){
      const s = document.createElement('style'); s.id = 'mm-css'; s.textContent = CSS; document.head.append(s);
    }

    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'mm';
    el.innerHTML = `
      <div class="mm-top"><div class="mm-title">Memory</div><div class="mm-players"></div><button type="button" class="mm-new">Nytt spel</button></div>
      <div class="mm-gridwrap"><div class="mm-grid" role="group" aria-label="Memorykort"></div></div>
      <div class="mm-start" role="dialog" aria-label="Välj antal spelare">
        <div class="q">Hur många spelar?</div>
        <div class="opts">
          <button type="button" data-p="1"><span class="em">🦖</span><span class="lb">Själv</span></button>
          <button type="button" data-p="2"><span class="em">🦖 🦄</span><span class="lb">Två och två</span></button>
        </div>
      </div>
      <div class="mm-end" role="dialog" aria-live="polite"><div class="stars">🎉</div><div class="big">Alla par!</div><div class="res"></div><button type="button">Nytt spel</button></div>`;
    root.append(el);
    const grid = el.querySelector('.mm-grid'), playersEl = el.querySelector('.mm-players');
    const startEl = el.querySelector('.mm-start'), endEl = el.querySelector('.mm-end'), newBtn = el.querySelector('.mm-new');

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

    // ---------- Korten ----------
    let open = [], busy = false, flipTimer = null;

    function build(){
      grid.innerHTML = '';
      if(!st.cards) return;
      st.cards.forEach((c, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'mm-card';
        b.setAttribute('aria-label', 'Kort ' + (i + 1));
        b.innerHTML = '<span class="mm-in"><span class="mm-face mm-back"><span>🚗</span></span><span class="mm-face mm-front"><span class="e"></span><span class="by"></span></span></span>';
        b.querySelector('.e').textContent = c.e;
        b.addEventListener('click', () => flip(i));
        grid.append(b);
      });
      paint();
      layout();
    }

    function paint(){
      if(!st.cards) return;
      [...grid.children].forEach((b, i) => {
        const c = st.cards[i], up = c.matched || open.includes(i);
        b.classList.toggle('up', up);
        b.classList.toggle('matched', c.matched);
        b.querySelector('.by').textContent = c.matched && st.players === 2 ? WHO[c.by] : '';
        b.setAttribute('aria-label', up ? c.label : 'Kort ' + (i + 1));
      });
      playersEl.innerHTML = '';
      if(st.phase === 'play' && st.players === 2){
        WHO.forEach((w, p) => {
          const chip = document.createElement('div');
          chip.className = 'mm-chip' + (st.turn === p ? ' turn' : '');
          chip.innerHTML = '<span class="who"></span><span class="n"></span>';
          chip.querySelector('.who').textContent = w;
          chip.querySelector('.n').textContent = st.scores[p];
          chip.setAttribute('aria-label', (st.turn === p ? 'Din tur, ' : '') + st.scores[p] + ' par');
          playersEl.append(chip);
        });
      }
    }

    // Så stora kort som möjligt, i det antal kolumner som ger störst kort.
    function layout(){
      if(!st.cards) return;
      const wrap = el.querySelector('.mm-gridwrap'), gap = 10, N = st.cards.length;
      const W = wrap.clientWidth, H = wrap.clientHeight;
      let best = {size: 0, cols: 1};
      for(let c = 1; c <= N; c++){
        const r = Math.ceil(N / c), size = Math.min((W - gap * (c - 1)) / c, (H - gap * (r - 1)) / r);
        if(size > best.size) best = {size, cols: c};
      }
      const size = Math.max(40, Math.floor(best.size));
      grid.style.gridTemplateColumns = `repeat(${best.cols}, ${size}px)`;
      grid.style.gridAutoRows = size + 'px';
      grid.querySelectorAll('.mm-front .e').forEach(e => e.style.fontSize = Math.round(size * 0.55) + 'px');
      grid.querySelectorAll('.mm-back span').forEach(e => e.style.fontSize = Math.round(size * 0.3) + 'px');
      grid.querySelectorAll('.mm-front .by').forEach(e => e.style.fontSize = Math.round(size * 0.2) + 'px');
    }
    const ro = window.ResizeObserver ? new ResizeObserver(layout) : null;
    if(ro) ro.observe(el.querySelector('.mm-gridwrap')); else window.addEventListener('resize', layout);

    function flip(i){
      if(busy || st.phase !== 'play') return;
      const c = st.cards[i];
      if(c.matched || open.includes(i)) return;
      open.push(i);
      tone([520], 0.08);
      paint();
      if(open.length < 2) return;

      const [a, b] = open, A = st.cards[a], B = st.cards[b];
      if(A.e === B.e){
        A.matched = B.matched = true;
        A.by = B.by = st.turn;
        st.scores[st.turn]++;
        open = [];
        tone([523, 659, 784]);
        say(A.label);
        paint();
        if(st.cards.every(x => x.matched)) return finish();
        save();                       // samma spelare fortsätter efter ett par
      }else{
        busy = true;
        flipTimer = setTimeout(() => {
          open = []; busy = false;
          if(st.players === 2) st.turn = 1 - st.turn;
          save();
          paint();
        }, FLIP_BACK_MS);
      }
    }

    function finish(){
      st.phase = 'done';
      save();
      tone([523, 659, 784, 1047]);
      showEnd();
      if(typeof opts.onFinish === 'function') opts.onFinish();
    }
    function showEnd(){
      const res = endEl.querySelector('.res');
      res.innerHTML = '';
      if(st.players === 2){
        WHO.forEach((w, p) => { const s = document.createElement('span'); s.textContent = `${w} ${st.scores[p]}`; res.append(s); });
      }
      endEl.classList.add('on');
      paint();
    }

    // ---------- Start, slut och nytt spel ----------
    function showStart(){
      clearTimeout(flipTimer); open = []; busy = false;
      st = {phase: 'start'}; save();
      grid.innerHTML = ''; playersEl.innerHTML = '';
      endEl.classList.remove('on');
      startEl.classList.add('on');
    }
    startEl.querySelectorAll('[data-p]').forEach(b => b.addEventListener('click', () => {
      st = newGame(level, Number(b.dataset.p));
      save();
      startEl.classList.remove('on');
      build();
    }));
    endEl.querySelector('button').addEventListener('click', showStart);

    let sureTimer = null;
    function resetBtn(){ clearTimeout(sureTimer); newBtn.classList.remove('sure'); newBtn.textContent = 'Nytt spel'; }
    newBtn.addEventListener('click', () => {
      if(st.phase !== 'play'){ resetBtn(); showStart(); return; }
      if(!newBtn.classList.contains('sure')){
        newBtn.classList.add('sure'); newBtn.textContent = 'Tryck igen för nytt spel';
        sureTimer = setTimeout(resetBtn, 3000);
        return;
      }
      resetBtn(); showStart();
    });

    if(st.phase === 'start') startEl.classList.add('on');
    else { build(); if(st.phase === 'done') showEnd(); }

    return {
      stop(){
        clearTimeout(flipTimer); clearTimeout(sureTimer);
        if(ro) ro.disconnect(); else window.removeEventListener('resize', layout);
        try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
        try{ if(ac) ac.close(); }catch(e){}
        root.innerHTML = '';
      }
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'memory', title: 'Memory', icon: '🐶',
    about: 'Vänd kort och hitta par, själv eller två och två. Den som hittar ett par fortsätter. Liten: 6 kort. Stor: 12 kort.',
    start
  });
})();
