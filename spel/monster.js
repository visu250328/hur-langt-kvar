/* Vad kommer sen? – se mönstret och välj vad som kommer härnäst.
   Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.vk{height:100%;display:flex;flex-direction:column;gap:12px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.vk-top{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px}
.vk-title{font-size:1.7rem;font-weight:800;line-height:1}
.vk-prog{display:flex;gap:8px}
.vk-prog span{width:18px;height:18px;border-radius:50%;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);transition:background-color .3s,box-shadow .3s}
.vk-prog span.on{background:var(--done,#F2B33D);box-shadow:none}
.vk-new{border:2px solid var(--line,#C6D1DF);background:var(--card,#fff);color:inherit;font:inherit;font-weight:700;border-radius:999px;padding:5px 14px;cursor:pointer;flex:none}
.vk-new.sure{background:var(--done,#F2B33D);border-color:var(--done,#F2B33D);color:#2B1E00}
.vk-main{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;gap:16px}
.vk-row,.vk-choices{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
.vk-item{box-sizing:border-box;display:grid;place-items:center;border-radius:18px;background:var(--card,#fff);box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);line-height:1}
.vk-q{background:transparent;box-shadow:none;border:4px dashed var(--done,#F2B33D);font-weight:800;color:var(--done,#F2B33D)}
.vk-q.filled{background:var(--done,#F2B33D);border-style:solid;color:inherit;animation:vk-pop .35s cubic-bezier(.3,1.6,.6,1)}
.vk-choice{border:0;border-radius:24px;background:var(--card,#fff);color:inherit;font:inherit;cursor:pointer;display:grid;place-items:center;line-height:1;
  box-shadow:inset 0 0 0 4px var(--accent,#2F6FD6);transition:opacity .3s,transform .3s}
.vk-choice.no{opacity:.3;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);animation:vk-wobble .4s ease}
.vk-choice.yes{box-shadow:inset 0 0 0 6px var(--done,#F2B33D);transform:scale(1.06)}
.vk-choice:disabled{cursor:default}
.vk-choice:focus-visible,.vk-new:focus-visible,.vk-end button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
.vk-end{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;
  background:color-mix(in srgb,var(--sky,#DCEAF6) 92%,transparent);border-radius:inherit}
.vk-end.on{display:flex}
.vk-end .big{font-size:clamp(2.6rem,9vmin,5rem);font-weight:800;line-height:1}
.vk-end .stars{font-size:clamp(2.4rem,8vmin,4.5rem);line-height:1}
.vk-end.on .stars{animation:vk-hop .8s ease-out 2}
.vk-end button{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.3rem;font-weight:800;border-radius:18px;padding:12px 26px;cursor:pointer;margin-top:8px}
@keyframes vk-pop{0%{transform:scale(.6)}100%{transform:scale(1)}}
@keyframes vk-wobble{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
@keyframes vk-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-18px)}}
@media (prefers-reduced-motion: reduce){
  .vk-q.filled,.vk-choice.no,.vk-end.on .stars{animation:none}
  .vk-choice,.vk-prog span{transition:none}
}`;

  // Bildgrupper. Ett mönster använder bilder ur en grupp, så att det blir tydligt.
  const SETS = [
    [['Hund','🐶'],['Katt','🐱'],['Gris','🐷'],['Groda','🐸'],['Ko','🐮'],['Kanin','🐰']],
    [['Äpple','🍎'],['Banan','🍌'],['Päron','🍐'],['Jordgubbe','🍓'],['Druvor','🍇'],['Apelsin','🍊']],
    [['Bil','🚗'],['Buss','🚌'],['Tåg','🚆'],['Båt','⛵'],['Flygplan','✈️'],['Cykel','🚲']],
    [['Röd','🔴'],['Blå','🔵'],['Gul','🟡'],['Grön','🟢'],['Lila','🟣'],['Orange','🟠']],
    [['Sol','☀️'],['Måne','🌙'],['Stjärna','⭐'],['Moln','☁️'],['Blomma','🌸'],['Träd','🌳']]
  ];
  // Mönstertyper per nivå. Bokstäverna står för olika bilder.
  const TYPES = {
    small: ['AB', 'AB', 'ABB', 'AAB'],
    big:   ['ABC', 'AABB', 'ABB', 'AAB', 'ABC', 'AABC']
  };
  const CHOICES = {small: 3, big: 4};
  const ROUND = 5, NEXT_MS = 1400;

  const rnd = n => Math.floor(Math.random() * n);
  const pick = a => a[rnd(a.length)];
  const shuffle = a => { a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function makePuzzle(level){
    const type = pick(TYPES[level]), letters = [...new Set(type)], period = type.length;
    const set = shuffle(pick(SETS));
    const map = {}; letters.forEach((l, i) => map[l] = set[i]);
    // Minst två hela varv, så att mönstret syns, och frågan på varierande plats i varvet.
    const len = Math.min(9, Math.max(6, 2 * period) + rnd(period));
    const seq = Array.from({length: len}, (_, i) => map[type[i % period]]);
    const answer = map[type[len % period]];
    const pool = letters.map(l => map[l]).filter(x => x !== answer).concat(set.slice(letters.length));
    const choices = shuffle([answer].concat(pool.slice(0, CHOICES[level] - 1)));
    return {seq, answer, choices, tried: [], solved: false};
  }
  const newRound = level => ({level, idx: 0, puzzles: Array.from({length: ROUND}, () => makePuzzle(level)), done: false});

  function start(root, opts){
    opts = opts || {};
    const level = opts.level === 'big' ? 'big' : 'small';
    const store = opts.storage || {get(){ return null; }, set(){}};
    const key = 'runda-' + level;
    let st = null;
    try{ st = JSON.parse(store.get(key) || 'null'); }catch(e){}
    if(!st || !Array.isArray(st.puzzles)) st = newRound(level);
    const save = () => { try{ store.set(key, JSON.stringify(st)); }catch(e){} };

    if(!document.getElementById('vk-css')){
      const s = document.createElement('style'); s.id = 'vk-css'; s.textContent = CSS; document.head.append(s);
    }

    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'vk';
    el.innerHTML = `
      <div class="vk-top"><div class="vk-title">Vad kommer sen?</div><div class="vk-prog" aria-hidden="true"></div><button type="button" class="vk-new">Nytt spel</button></div>
      <div class="vk-main"><div class="vk-row" role="group" aria-label="Mönster"></div><div class="vk-choices" role="group" aria-label="Välj vad som kommer sen"></div></div>
      <div class="vk-end" role="dialog" aria-live="polite"><div class="stars">⭐⭐⭐</div><div class="big">Bra jobbat!</div><button type="button">Spela igen</button></div>`;
    root.append(el);
    const rowEl = el.querySelector('.vk-row'), choicesEl = el.querySelector('.vk-choices'), progEl = el.querySelector('.vk-prog');
    const mainEl = el.querySelector('.vk-main'), endEl = el.querySelector('.vk-end'), newBtn = el.querySelector('.vk-new');

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

    // ---------- Ett mönster ----------
    let nextTimer = null;
    const cur = () => st.puzzles[st.idx];

    function render(){
      progEl.innerHTML = '';
      st.puzzles.forEach((p, i) => { const s = document.createElement('span'); if(p.solved) s.className = 'on'; progEl.append(s); });
      if(st.done){ endEl.classList.add('on'); return; }
      const P = cur();
      rowEl.innerHTML = '';
      P.seq.forEach(([label, e]) => {
        const d = document.createElement('div'); d.className = 'vk-item'; d.textContent = e; d.setAttribute('aria-label', label);
        rowEl.append(d);
      });
      const q = document.createElement('div');
      q.className = 'vk-item vk-q' + (P.solved ? ' filled' : '');
      q.textContent = P.solved ? P.answer[1] : '?';
      q.setAttribute('aria-label', P.solved ? P.answer[0] : 'Vad kommer sen?');
      rowEl.append(q);
      choicesEl.innerHTML = '';
      P.choices.forEach(([label, e]) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'vk-choice'; b.textContent = e; b.setAttribute('aria-label', label);
        const wrong = P.tried.includes(e), right = P.solved && e === P.answer[1];
        if(wrong) b.classList.add('no');
        if(right) b.classList.add('yes');
        b.disabled = wrong || P.solved;
        b.addEventListener('click', () => choose(e, b));
        choicesEl.append(b);
      });
      layout();
    }

    // Mönstret på en rad om det går, svarsknapparna större än bilderna i mönstret.
    function layout(){
      if(st.done) return;
      const W = mainEl.clientWidth, H = mainEl.clientHeight, gap = 10;
      const n = cur().seq.length + 1, c = cur().choices.length;
      const item = Math.max(36, Math.floor(Math.min((W - gap * (n - 1)) / n, H * 0.3, 120)));
      const choice = Math.max(56, Math.floor(Math.min(item * 1.35, (W - gap * (c - 1)) / c, H * 0.32, 150)));
      rowEl.querySelectorAll('.vk-item').forEach(d => { d.style.width = d.style.height = item + 'px'; d.style.fontSize = Math.round(item * 0.6) + 'px'; });
      choicesEl.querySelectorAll('.vk-choice').forEach(b => { b.style.width = b.style.height = choice + 'px'; b.style.fontSize = Math.round(choice * 0.58) + 'px'; });
    }
    const ro = window.ResizeObserver ? new ResizeObserver(layout) : null;
    if(ro) ro.observe(mainEl); else window.addEventListener('resize', layout);

    function choose(e, btn){
      const P = cur();
      if(P.solved || P.tried.includes(e)) return;
      if(e !== P.answer[1]){
        // Fel val: knappen tonar bort, inget mer händer.
        P.tried.push(e);
        tone([300], 0.05);
        btn.classList.add('no'); btn.disabled = true;
        save();
        return;
      }
      P.solved = true;
      tone([523, 659, 784]);
      say(P.answer[0]);
      save();
      render();
      nextTimer = setTimeout(() => {
        if(st.idx < st.puzzles.length - 1){ st.idx++; save(); render(); }
        else finish();
      }, NEXT_MS);
    }

    function finish(){
      st.done = true; save();
      tone([523, 659, 784, 1047]);
      render();
      if(typeof opts.onFinish === 'function') opts.onFinish();
    }

    function fresh(){
      clearTimeout(nextTimer);
      st = newRound(level); save();
      endEl.classList.remove('on');
      render();
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

    // Ett mönster som löstes precis innan spelet stängdes: gå vidare till nästa.
    if(!st.done && cur().solved){
      if(st.idx < st.puzzles.length - 1) st.idx++; else st.done = true;
      save();
    }
    render();

    return {
      stop(){
        clearTimeout(nextTimer); clearTimeout(sureTimer);
        if(ro) ro.disconnect(); else window.removeEventListener('resize', layout);
        try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
        try{ if(ac) ac.close(); }catch(e){}
        root.innerHTML = '';
      }
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'vadkommersen', title: 'Vad kommer sen?', icon: '🍎',
    about: 'Se mönstret och välj vad som kommer härnäst. 5 mönster per omgång. Liten: enkla mönster och 3 val. Stor: längre mönster och 4 val.',
    start
  });
})();
