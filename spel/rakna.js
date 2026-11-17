/* Räkna – liten nivå: peka och räkna 1–6 och välj svar med siffra och prickar.
   Stor nivå: räkna upp till 20, plus och minus upp till 20, och gånger 2–5 som rader av saker.
   Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.rk{height:100%;display:flex;flex-direction:column;gap:12px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.rk-top{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px}
.rk-title{font-size:1.7rem;font-weight:800;line-height:1}
.rk-prog{display:flex;gap:8px}
.rk-prog span{width:18px;height:18px;border-radius:50%;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);transition:background-color .3s,box-shadow .3s}
.rk-prog span.on{background:var(--done,#F2B33D);box-shadow:none}
.rk-new{border:2px solid var(--line,#C6D1DF);background:var(--card,#fff);color:inherit;font:inherit;font-weight:700;border-radius:999px;padding:5px 14px;cursor:pointer;flex:none}
.rk-new.sure{background:var(--done,#F2B33D);border-color:var(--done,#F2B33D);color:#2B1E00}
.rk-q{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;border-radius:26px;background:var(--card,#fff);
  box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);padding:12px;position:relative}
.rk-eq{font-weight:800;line-height:1;letter-spacing:.04em;display:flex;align-items:center;gap:.35em}
.rk-eq .ans{display:inline-grid;place-items:center;min-width:1.3em;height:1.2em;border-radius:.2em;border:.08em dashed var(--done,#F2B33D);color:var(--done,#F2B33D)}
.rk-eq .ans.filled{background:var(--done,#F2B33D);color:#2B1E00;border-style:solid;animation:rk-pop .35s cubic-bezier(.3,1.6,.6,1)}
.rk-scene{display:flex;align-items:center;justify-content:center;gap:4%}
.rk-group{display:grid;gap:8px;justify-content:center}
.rk-sign{font-weight:800;line-height:1}
.rk-group.rows{padding:6px;border-radius:14px;background:repeating-linear-gradient(transparent 0 0)}
.rk-obj{position:relative;border:0;background:none;padding:0;cursor:pointer;line-height:1;display:grid;place-items:center;font:inherit}
.rk-obj .e{transition:transform .2s}
.rk-obj.away .e{opacity:.3;filter:grayscale(1)}
.rk-obj.away::after{content:"";position:absolute;left:10%;right:10%;top:50%;height:6px;margin-top:-3px;border-radius:3px;background:#e8473c;transform:rotate(-35deg)}
.rk-obj .n{position:absolute;top:-6px;right:-6px;min-width:1.5em;height:1.5em;border-radius:50%;background:var(--accent,#2F6FD6);color:#fff;font-weight:800;
  display:grid;place-items:center;font-size:.42em;transform:scale(0);transition:transform .2s cubic-bezier(.3,1.6,.6,1)}
.rk-obj.counted .n{transform:scale(1)}
.rk-obj.counted .e{transform:scale(.92)}
.rk-hint{font-weight:700;opacity:.6;font-size:1rem}
.rk-answers{display:flex;justify-content:center;gap:14px;flex-wrap:wrap}
.rk-a{border:0;border-radius:24px;background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;line-height:1;
  box-shadow:inset 0 0 0 4px var(--accent,#2F6FD6);transition:opacity .3s,transform .3s}
.rk-a .dots{display:grid;grid-template-columns:repeat(3,11px);grid-auto-rows:11px;gap:3px}
.rk-a .dots i{width:11px;height:11px;border-radius:50%;display:block}
.rk-a .dots i.on{background:var(--accent,#2F6FD6)}
.rk-a.no{opacity:.3;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);animation:rk-wobble .4s ease}
.rk-a.yes{box-shadow:inset 0 0 0 6px var(--done,#F2B33D);transform:scale(1.06)}
.rk-a:disabled{cursor:default}
.rk button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
.rk-end{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;
  background:color-mix(in srgb,var(--sky,#DCEAF6) 92%,transparent);border-radius:inherit;z-index:5}
.rk-end.on{display:flex}
.rk-end .big{font-size:clamp(2.6rem,9vmin,5rem);font-weight:800;line-height:1}
.rk-end .stars{font-size:clamp(2.4rem,8vmin,4.5rem);line-height:1}
.rk-end.on .stars{animation:rk-hop .8s ease-out 2}
.rk-end button{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.3rem;font-weight:800;border-radius:18px;padding:12px 26px;cursor:pointer;margin-top:8px}
@keyframes rk-pop{0%{transform:scale(.6)}100%{transform:scale(1)}}
@keyframes rk-wobble{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
@keyframes rk-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-18px)}}
@media (prefers-reduced-motion: reduce){
  .rk-eq .ans.filled,.rk-a.no,.rk-end.on .stars{animation:none}
  .rk-a,.rk-obj .e,.rk-obj .n,.rk-prog span{transition:none}
}`;

  const THINGS = [
    ['🍎', 'äpple', 'äpplen'], ['🐞', 'nyckelpiga', 'nyckelpigor'], ['🚗', 'bil', 'bilar'], ['⭐', 'stjärna', 'stjärnor'],
    ['🐟', 'fisk', 'fiskar'], ['🦆', 'anka', 'ankor'], ['🎈', 'ballong', 'ballonger'], ['🍓', 'jordgubbe', 'jordgubbar']
  ];
  // Prickar som på en tärning, i ett rutnät 3 × 3.
  const DICE = [[], [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]]
    .map(on => Array.from({length: 9}, (_, i) => on.includes(i)));
  const WORD = ['noll', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio',
    'elva', 'tolv', 'tretton', 'fjorton', 'femton', 'sexton', 'sjutton', 'arton', 'nitton', 'tjugo',
    'tjugoett', 'tjugotvå', 'tjugotre', 'tjugofyra', 'tjugofem'];
  const SIGN = {plus: '+', minus: '−', times: '×'}, SAY = {plus: 'plus', minus: 'minus', times: 'gånger'};
  const ROUND = 5, NEXT_MS = 2500, AFTER_SPEECH_MS = 1200;
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const shuffle = a => { a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // ---------- Uppgifter ----------
  function choices(answer, n, min, max){
    const set = new Set([answer]);
    const near = shuffle([answer - 1, answer + 1, answer - 2, answer + 2, answer + 3, answer - 3]).filter(x => x >= min && x <= max);
    for(const x of near){ if(set.size >= n) break; set.add(x); }
    while(set.size < n){ set.add(rnd(min, max)); }
    return shuffle([...set]);
  }
  function makeTask(level, kind){
    const thing = THINGS[rnd(0, THINGS.length - 1)];
    if(kind === 'count'){
      const n = level === 'big' ? rnd(11, 20) : rnd(1, 6);
      return {kind, thing, a: n, answer: n, choices: choices(n, level === 'big' ? 4 : 3, 1, level === 'big' ? 20 : 6), tried: [], solved: false};
    }
    if(kind === 'plus'){
      const a = rnd(3, 12), b = rnd(2, Math.min(9, 20 - a));
      return {kind, thing, a, b, answer: a + b, choices: choices(a + b, 4, 0, 20), tried: [], solved: false};
    }
    if(kind === 'times'){
      const a = rnd(2, 5), b = rnd(2, 5);
      return {kind, thing, a, b, answer: a * b, choices: choices(a * b, 4, 1, 25), tried: [], solved: false};
    }
    const a = rnd(8, 20), b = rnd(2, Math.min(9, a - 1));
    return {kind: 'minus', thing, a, b, answer: a - b, choices: choices(a - b, 4, 0, 20), tried: [], solved: false};
  }
  function newRound(level){
    const kinds = level === 'big' ? shuffle(['count', 'plus', 'minus', 'times', 'times']) : Array(ROUND).fill('count');
    let tasks = kinds.map(k => makeTask(level, k));
    if(level === 'small'){
      // Början lätt: de två första är högst 3, sedan upp till 6.
      tasks = tasks.map((t, i) => i < 2 ? (n => ({...t, a: n, answer: n, choices: choices(n, 3, 1, 6)}))(rnd(1, 3)) : t);
    }
    return {v: 2, idx: 0, tasks, done: false};
  }

  function start(root, opts){
    opts = opts || {};
    const level = opts.level === 'big' ? 'big' : 'small';
    const store = opts.storage || {get(){ return null; }, set(){}};
    const key = 'runda-' + level;
    let st = null;
    try{ st = JSON.parse(store.get(key) || 'null'); }catch(e){}
    if(!st || !Array.isArray(st.tasks) || st.v !== 2) st = newRound(level);
    const save = () => { try{ store.set(key, JSON.stringify(st)); }catch(e){} };

    if(!document.getElementById('rk-css')){
      const s = document.createElement('style'); s.id = 'rk-css'; s.textContent = CSS; document.head.append(s);
    }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'rk';
    el.innerHTML = `
      <div class="rk-top"><div class="rk-title">Räkna</div><div class="rk-prog" aria-hidden="true"></div><button type="button" class="rk-new">Nytt spel</button></div>
      <div class="rk-q"></div>
      <div class="rk-answers" role="group" aria-label="Svar"></div>
      <div class="rk-end" role="dialog" aria-live="polite"><div class="stars">⭐⭐⭐</div><div class="big">Bra räknat!</div><button type="button">Spela igen</button></div>`;
    root.append(el);
    const qEl = el.querySelector('.rk-q'), ansEl = el.querySelector('.rk-answers'), progEl = el.querySelector('.rk-prog');
    const endEl = el.querySelector('.rk-end'), newBtn = el.querySelector('.rk-new');

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
    function say(text, done){
      if(!opts.sound || !window.speechSynthesis){ if(done) done(false); return; }
      try{
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'sv-SE'; u.rate = 0.9;
        const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.replace('_', '-').startsWith('sv'));
        if(v) u.voice = v;
        if(done){ u.onend = () => done(true); u.onerror = () => done(false); }
        speechSynthesis.speak(u);
      }catch(e){ if(done) done(false); }
    }
    const question = T => T.kind === 'count' ? `Hur många ${T.thing[2]}?` : `${WORD[T.a]} ${SAY[T.kind]} ${WORD[T.b]}`;
    const answerText = T => T.kind === 'count' ? `${WORD[T.answer]} ${T.answer === 1 ? T.thing[1] : T.thing[2]}!`
      : `${WORD[T.a]} ${SAY[T.kind]} ${WORD[T.b]} är ${WORD[T.answer]}!`;

    // ---------- En uppgift ----------
    let nextTimer = null, safeTimer = null, stopped = false, counted = 0;
    const cur = () => st.tasks[st.idx];

    function render(){
      progEl.innerHTML = '';
      st.tasks.forEach(t => { const s = document.createElement('span'); if(t.solved) s.className = 'on'; progEl.append(s); });
      if(st.done){ endEl.classList.add('on'); return; }
      const T = cur();
      counted = 0;
      qEl.innerHTML = '';
      if(T.kind !== 'count'){
        const eq = document.createElement('div'); eq.className = 'rk-eq';
        eq.innerHTML = `<span>${T.a}</span><span>${SIGN[T.kind]}</span><span>${T.b}</span><span>=</span><span class="ans${T.solved ? ' filled' : ''}">${T.solved ? T.answer : '?'}</span>`;
        qEl.append(eq);
      }
      const scene = document.createElement('div'); scene.className = 'rk-scene';
      const groups = sceneGroups(T);
      groups.forEach(({n, cols}, g) => {
        if(g > 0){ const s = document.createElement('div'); s.className = 'rk-sign'; s.textContent = '+'; scene.append(s); }
        const grp = document.createElement('div'); grp.className = 'rk-group' + (T.kind === 'times' ? ' rows' : '');
        grp.style.gridTemplateColumns = `repeat(${cols}, auto)`;
        for(let i = 0; i < n; i++){
          const b = document.createElement('button'); b.type = 'button'; b.className = 'rk-obj';
          const away = T.kind === 'minus' && i >= T.a - T.b;
          if(away) b.classList.add('away');
          b.innerHTML = '<span class="e"></span><span class="n"></span>';
          b.querySelector('.e').textContent = T.thing[0];
          b.setAttribute('aria-label', away ? 'borta' : T.thing[1]);
          if(!away) b.addEventListener('click', () => countIt(b));
          grp.append(b);
        }
        scene.append(grp);
      });
      qEl.append(scene);
      const hint = document.createElement('div'); hint.className = 'rk-hint';
      hint.textContent = T.kind === 'count' ? 'Tryck och räkna' : T.kind === 'minus' ? 'De överkryssade är borta'
        : T.kind === 'times' ? `${T.a} rader med ${T.b} i varje` : 'Tryck och räkna alla';
      qEl.append(hint);

      ansEl.innerHTML = '';
      T.choices.forEach(n => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'rk-a'; b.setAttribute('aria-label', String(n));
        b.innerHTML = `<span class="num">${n}</span>` + (level === 'small' ? `<span class="dots">${DICE[n].map(on => `<i${on ? ' class="on"' : ''}></i>`).join('')}</span>` : '');
        if(T.tried.includes(n)) b.classList.add('no');
        if(T.solved && n === T.answer) b.classList.add('yes');
        b.disabled = T.tried.includes(n) || T.solved;
        b.addEventListener('click', () => choose(n, b));
        ansEl.append(b);
      });
      layout();
    }

    // Peka och räkna: varje tryck sätter nästa tal på saken och läser upp det.
    function countIt(b){
      if(b.classList.contains('counted') || cur().solved) return;
      counted++;
      b.classList.add('counted');
      b.querySelector('.n').textContent = counted;
      tone([440 + counted * 40], 0.07);
      say(WORD[counted] || String(counted));
    }

    // Hur sakerna läggs: rader om högst 5, och vid gånger a rader med b i varje.
    function sceneGroups(T){
      if(T.kind === 'plus') return [{n: T.a, cols: Math.min(5, T.a)}, {n: T.b, cols: Math.min(5, T.b)}];
      if(T.kind === 'times') return [{n: T.a * T.b, cols: T.b}];
      return [{n: T.a, cols: Math.min(5, T.a)}];
    }
    function layout(){
      if(st.done) return;
      const T = cur(), W = qEl.clientWidth - 24, H = qEl.clientHeight - 24;
      const groups = sceneGroups(T);
      const cols = groups.reduce((s, g) => s + g.cols, 0) + (groups.length - 1) * 1.2;
      const rows = Math.max(...groups.map(g => Math.ceil(g.n / g.cols)));
      const eqH = T.kind === 'count' ? 0 : 0.28;
      const size = Math.max(36, Math.floor(Math.min(W / (cols * 1.25), (H * (0.82 - eqH)) / (rows * 1.25), 150)));
      qEl.querySelectorAll('.rk-obj').forEach(o => { o.style.width = o.style.height = size + 'px'; o.style.fontSize = Math.round(size * 0.82) + 'px'; });
      qEl.querySelectorAll('.rk-group').forEach(g => g.style.gap = g.classList.contains('rows')
        ? `${Math.round(size * 0.32)}px ${Math.round(size * 0.12)}px` : Math.round(size * 0.18) + 'px');
      qEl.querySelectorAll('.rk-sign').forEach(s => s.style.fontSize = Math.round(size * 0.8) + 'px');
      const eq = qEl.querySelector('.rk-eq'); if(eq) eq.style.fontSize = Math.round(Math.min(H * 0.18, W / 8)) + 'px';
      const n = T.choices.length, aw = ansEl.clientWidth || W;
      const cs = Math.max(64, Math.floor(Math.min((aw - 14 * (n - 1)) / n, 130)));
      ansEl.querySelectorAll('.rk-a').forEach(b => {
        b.style.width = cs + 'px'; b.style.height = Math.round(cs * (level === 'small' ? 1.15 : 1)) + 'px';
        b.querySelector('.num').style.fontSize = Math.round(cs * 0.5) + 'px';
      });
    }
    const ro = window.ResizeObserver ? new ResizeObserver(layout) : null;
    if(ro) ro.observe(qEl); else window.addEventListener('resize', layout);

    function choose(n, btn){
      const T = cur();
      if(T.solved || T.tried.includes(n)) return;
      if(n !== T.answer){
        T.tried.push(n);
        tone([300], 0.05);
        btn.classList.add('no'); btn.disabled = true;
        save();
        return;
      }
      T.solved = true;
      tone([523, 659, 784]);
      save();
      render();
      let advanced = false;
      const advance = () => {
        if(advanced || stopped) return;
        advanced = true; clearTimeout(nextTimer); clearTimeout(safeTimer);
        if(st.idx < st.tasks.length - 1){ st.idx++; save(); render(); ask(); }
        else finish();
      };
      safeTimer = setTimeout(advance, 10000);
      setTimeout(() => say(answerText(T), ok => { if(!advanced) nextTimer = setTimeout(advance, ok ? AFTER_SPEECH_MS : NEXT_MS); }), 350);
    }
    const ask = () => { if(!cur().solved) setTimeout(() => say(question(cur())), 300); };

    function finish(){
      st.done = true; save();
      tone([523, 659, 784, 1047]);
      render();
      if(typeof opts.onFinish === 'function') opts.onFinish();
    }
    function fresh(){
      clearTimeout(nextTimer); clearTimeout(safeTimer);
      st = newRound(level); save();
      endEl.classList.remove('on');
      render(); ask();
    }
    endEl.querySelector('button').addEventListener('click', fresh);

    let sureTimer = null;
    function resetBtn(){ clearTimeout(sureTimer); newBtn.classList.remove('sure'); newBtn.textContent = 'Nytt spel'; }
    newBtn.addEventListener('click', () => {
      if(st.done){ resetBtn(); fresh(); return; }
      if(!newBtn.classList.contains('sure')){
        newBtn.classList.add('sure'); newBtn.textContent = 'Tryck igen för nytt spel';
        sureTimer = setTimeout(resetBtn, 3000);
        return;
      }
      resetBtn(); fresh();
    });

    if(!st.done && cur().solved){
      if(st.idx < st.tasks.length - 1) st.idx++; else st.done = true;
      save();
    }
    render(); ask();

    return {
      stop(){
        stopped = true;
        clearTimeout(nextTimer); clearTimeout(sureTimer); clearTimeout(safeTimer);
        if(ro) ro.disconnect(); else window.removeEventListener('resize', layout);
        try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
        try{ if(ac) ac.close(); }catch(e){}
        root.innerHTML = '';
      }
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'rakna', title: 'Räkna', icon: '🔢',
    about: 'Liten: tryck och räkna 1–6 saker och välj svaret, som visas både som siffra och prickar. Stor: räkna upp till 20, plus och minus upp till 20, och gånger 2–5 som rader av saker.',
    start
  });
})();
