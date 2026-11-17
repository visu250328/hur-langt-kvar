/* Första bokstaven – tre saker som börjar på samma bokstav, välj bokstaven.
   Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.fb{height:100%;display:flex;flex-direction:column;gap:12px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.fb-top{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px}
.fb-title{font-size:1.7rem;font-weight:800;line-height:1}
.fb-prog{display:flex;gap:8px}
.fb-prog span{width:18px;height:18px;border-radius:50%;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);transition:background-color .3s,box-shadow .3s}
.fb-prog span.on{background:var(--done,#F2B33D);box-shadow:none}
.fb-new{border:2px solid var(--line,#C6D1DF);background:var(--card,#fff);color:inherit;font:inherit;font-weight:700;border-radius:999px;padding:5px 14px;cursor:pointer;flex:none}
.fb-new.sure{background:var(--done,#F2B33D);border-color:var(--done,#F2B33D);color:#2B1E00}
.fb-main{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;gap:14px}
.fb-cards,.fb-choices{display:flex;justify-content:center;gap:14px}
.fb-card{box-sizing:border-box;border:0;border-radius:24px;background:var(--card,#fff);color:inherit;font:inherit;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8%;padding:8px;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF)}
.fb-card .pic{line-height:1}
.fb-word{display:flex;align-items:center;font-weight:800;line-height:1;letter-spacing:.04em;white-space:nowrap}
.fb-slot{display:inline-grid;place-items:center;box-sizing:border-box;min-width:1.1em;height:1.25em;margin-right:.08em;border-radius:.2em;
  border:.09em dashed var(--done,#F2B33D);color:#2B1E00}
.fb-slot.filled{background:var(--done,#F2B33D);border-style:solid;animation:fb-pop .35s cubic-bezier(.3,1.6,.6,1)}
.fb-choice{border:0;border-radius:24px;background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;cursor:pointer;display:grid;place-items:center;line-height:1;
  box-shadow:inset 0 0 0 4px var(--accent,#2F6FD6);transition:opacity .3s,transform .3s}
.fb-choice.no{opacity:.3;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);animation:fb-wobble .4s ease}
.fb-choice.yes{box-shadow:inset 0 0 0 6px var(--done,#F2B33D);transform:scale(1.06)}
.fb-choice:disabled{cursor:default}
.fb-card:focus-visible,.fb-choice:focus-visible,.fb-new:focus-visible,.fb-end button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
.fb-end{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;
  background:color-mix(in srgb,var(--sky,#DCEAF6) 92%,transparent);border-radius:inherit}
.fb-end.on{display:flex}
.fb-end .big{font-size:clamp(2.6rem,9vmin,5rem);font-weight:800;line-height:1}
.fb-end .stars{font-size:clamp(2.4rem,8vmin,4.5rem);line-height:1}
.fb-end.on .stars{animation:fb-hop .8s ease-out 2}
.fb-end button{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.3rem;font-weight:800;border-radius:18px;padding:12px 26px;cursor:pointer;margin-top:8px}
@keyframes fb-pop{0%{transform:scale(.6)}100%{transform:scale(1)}}
@keyframes fb-wobble{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
@keyframes fb-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-18px)}}
@media (prefers-reduced-motion: reduce){
  .fb-slot.filled,.fb-choice.no,.fb-end.on .stars{animation:none}
  .fb-choice,.fb-prog span{transition:none}
}`;

  // Ord per bokstav, med en bild som ett barn känner igen. Minst 3 ord per bokstav.
  const WORDS = {
    A: [['APA','🐵'],['ANANAS','🍍'],['ANKA','🦆'],['AMBULANS','🚑']],
    B: [['BOLL','⚽'],['BOK','📕'],['BAJS','💩'],['BIL','🚗'],['BANAN','🍌'],['BUSS','🚌'],['BJÖRN','🐻'],['BI','🐝']],
    C: [['CYKEL','🚲'],['CITRON','🍋'],['CLOWN','🤡']],
    D: [['DRAKE','🐉'],['DÖRR','🚪'],['DELFIN','🐬'],['DOCKA','🪆']],
    E: [['EKORRE','🐿️'],['ELEFANT','🐘'],['ELD','🔥']],
    F: [['FISK','🐟'],['FÅGEL','🐦'],['FLYGPLAN','✈️'],['FJÄRIL','🦋'],['FOT','🦶']],
    G: [['GRIS','🐷'],['GIRAFF','🦒'],['GRODA','🐸'],['GLASS','🍦'],['GURKA','🥒']],
    H: [['HUND','🐶'],['HUS','🏠'],['HÄST','🐴'],['HATT','🎩'],['HJÄRTA','❤️']],
    I: [['IGELKOTT','🦔'],['IS','🧊'],['ISBJÖRN','🐻‍❄️']],
    J: [['JORDGUBBE','🍓'],['JULGRAN','🎄'],['JACKA','🧥']],
    K: [['KATT','🐱'],['KO','🐮'],['KANIN','🐰'],['KAKA','🍪'],['KRONA','👑'],['KAMEL','🐫']],
    L: [['LEJON','🦁'],['LÖV','🍁'],['LAMPA','💡'],['LASTBIL','🚚']],
    M: [['MUS','🐭'],['MÅNE','🌙'],['MJÖLK','🥛'],['MORÖT','🥕']],
    N: [['NYCKEL','🔑'],['NÄSA','👃'],['NÖT','🥜']],
    O: [['ORM','🐍'],['OST','🧀'],['ORANGUTANG','🦧']],
    P: [['PANDA','🐼'],['PIZZA','🍕'],['PINGVIN','🐧'],['PÄRON','🍐']],
    R: [['RÄV','🦊'],['RAKET','🚀'],['REGNBÅGE','🌈'],['ROS','🌹']],
    S: [['SOL','☀️'],['SKO','👟'],['SNÖGUBBE','⛄'],['STJÄRNA','⭐'],['SKÖLDPADDA','🐢']],
    T: [['TÅG','🚆'],['TIGER','🐯'],['TOMAT','🍅'],['TAND','🦷'],['TRÄD','🌳']],
    U: [['UGGLA','🦉'],['UFO','🛸'],['UR','⌚']],
    V: [['VAL','🐋'],['VINDRUVOR','🍇'],['VULKAN','🌋']],
    'Ä': [['ÄPPLE','🍎'],['ÄGG','🥚'],['ÄLG','🫎']],
    'Ö': [['ÖRA','👂'],['ÖGA','👁️'],['ÖRN','🦅']]
  };
  // Liten nivå: vanliga bokstäver som många 4-åringar känner igen.
  const EASY = ['A','B','F','G','H','K','L','M','O','P','S','T'];
  // Stor nivå: felalternativ som liknar rätt bokstav i form eller ljud, så långt det går.
  const SIMILAR = {
    A:['Ä','O','E'], B:['D','P','R'], C:['S','K','G'], D:['B','T','P'], E:['F','Ä','I'], F:['E','V','H'], G:['K','J','C'],
    H:['N','K','F'], I:['J','L','E'], J:['I','G','Y'], K:['G','C','T'], L:['I','T','N'], M:['N','B','V'], N:['M','H','L'],
    O:['Ö','U','A'], P:['B','R','T'], R:['P','B','L'], S:['C','Z','F'], T:['D','P','L'], U:['O','V','Y'], V:['F','U','W'],
    'Ä':['A','E','Ö'], 'Ö':['O','Ä','U']
  };
  const ALL = Object.keys(WORDS);
  const CHOICES = {small: 2, big: 4};
  const ROUND = 5, NEXT_MS = 2500, AFTER_SPEECH_MS = 1200;

  const rnd = n => Math.floor(Math.random() * n);
  const shuffle = a => { a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function makePuzzle(level, letter){
    const words = shuffle(WORDS[letter]).slice(0, 3);
    let others;
    if(level === 'big'){
      const sim = (SIMILAR[letter] || []).filter(x => x !== letter);
      others = shuffle(sim).concat(shuffle(ALL.filter(x => x !== letter && !sim.includes(x))));
    }else{
      others = shuffle(EASY.filter(x => x !== letter));
    }
    const choices = shuffle([letter].concat(others.slice(0, CHOICES[level] - 1)));
    return {letter, words, choices, tried: [], solved: false};
  }
  function newRound(level){
    const letters = shuffle(level === 'big' ? ALL : EASY).slice(0, ROUND);
    return {idx: 0, puzzles: letters.map(l => makePuzzle(level, l)), done: false};
  }

  function start(root, opts){
    opts = opts || {};
    const level = opts.level === 'big' ? 'big' : 'small';
    const store = opts.storage || {get(){ return null; }, set(){}};
    const key = 'runda-' + level;
    let st = null;
    try{ st = JSON.parse(store.get(key) || 'null'); }catch(e){}
    if(!st || !Array.isArray(st.puzzles)) st = newRound(level);
    const save = () => { try{ store.set(key, JSON.stringify(st)); }catch(e){} };

    if(!document.getElementById('fb-css')){
      const s = document.createElement('style'); s.id = 'fb-css'; s.textContent = CSS; document.head.append(s);
    }

    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'fb';
    el.innerHTML = `
      <div class="fb-top"><div class="fb-title">Första bokstaven</div><div class="fb-prog" aria-hidden="true"></div><button type="button" class="fb-new">Nytt spel</button></div>
      <div class="fb-main"><div class="fb-cards" role="group" aria-label="Saker"></div><div class="fb-choices" role="group" aria-label="Välj första bokstaven"></div></div>
      <div class="fb-end" role="dialog" aria-live="polite"><div class="stars">⭐⭐⭐</div><div class="big">Bra jobbat!</div><button type="button">Spela igen</button></div>`;
    root.append(el);
    const cardsEl = el.querySelector('.fb-cards'), choicesEl = el.querySelector('.fb-choices'), progEl = el.querySelector('.fb-prog');
    const mainEl = el.querySelector('.fb-main'), endEl = el.querySelector('.fb-end'), newBtn = el.querySelector('.fb-new');

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
    // done(true) anropas när uppläsningen är klar, done(false) om den inte kunde läsas upp.
    function say(text, done){
      if(!opts.sound || !window.speechSynthesis){ if(done) done(false); return; }
      try{
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'sv-SE'; u.rate = 0.85;
        const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.replace('_', '-').startsWith('sv'));
        if(v) u.voice = v;
        if(done){ u.onend = () => done(true); u.onerror = () => done(false); }
        speechSynthesis.speak(u);
      }catch(e){ if(done) done(false); }
    }
    const cap = w => w.charAt(0) + w.slice(1).toLowerCase();

    // ---------- Ett pussel ----------
    let nextTimer = null, safeTimer = null, stopped = false;
    const cur = () => st.puzzles[st.idx];

    function render(){
      progEl.innerHTML = '';
      st.puzzles.forEach(p => { const s = document.createElement('span'); if(p.solved) s.className = 'on'; progEl.append(s); });
      if(st.done){ endEl.classList.add('on'); return; }
      const P = cur();
      cardsEl.innerHTML = '';
      P.words.forEach(([word, pic]) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'fb-card';
        b.setAttribute('aria-label', P.solved ? cap(word) : 'Tryck för att höra ordet');
        b.innerHTML = '<span class="pic"></span><span class="fb-word"><span class="fb-slot"></span><span class="rest"></span></span>';
        b.querySelector('.pic').textContent = pic;
        const slot = b.querySelector('.fb-slot');
        if(P.solved){ slot.textContent = word.charAt(0); slot.classList.add('filled'); }
        b.querySelector('.rest').textContent = word.slice(1);
        b.dataset.len = word.length;
        b.addEventListener('click', () => say(cap(word)));   // tryck på bilden för att höra ordet
        cardsEl.append(b);
      });
      choicesEl.innerHTML = '';
      P.choices.forEach(l => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'fb-choice'; b.textContent = l; b.setAttribute('aria-label', l);
        if(P.tried.includes(l)) b.classList.add('no');
        if(P.solved && l === P.letter) b.classList.add('yes');
        b.disabled = P.tried.includes(l) || P.solved;
        b.addEventListener('click', () => choose(l, b));
        choicesEl.append(b);
      });
      layout();
    }

    function layout(){
      if(st.done) return;
      const W = mainEl.clientWidth, H = mainEl.clientHeight, gap = 14;
      const cw = Math.max(90, Math.floor(Math.min((W - gap * 2) / 3, H * 0.52 * 0.9, 300)));
      const ch = Math.max(110, Math.floor(Math.min(cw * 1.15, H * 0.55)));
      cardsEl.querySelectorAll('.fb-card').forEach(c => {
        c.style.width = cw + 'px'; c.style.height = ch + 'px';
        c.querySelector('.pic').style.fontSize = Math.round(Math.min(cw, ch) * 0.48) + 'px';
        const len = Number(c.dataset.len) + 0.6;      // tom ruta tar lite mer plats än en bokstav
        c.querySelector('.fb-word').style.fontSize = Math.round(Math.min(cw * 0.17, (cw - 20) / (len * 0.72))) + 'px';
      });
      const n = cur().choices.length;
      const cs = Math.max(64, Math.floor(Math.min((W - gap * (n - 1)) / n, H * 0.3, 140)));
      choicesEl.querySelectorAll('.fb-choice').forEach(b => { b.style.width = b.style.height = cs + 'px'; b.style.fontSize = Math.round(cs * 0.6) + 'px'; });
    }
    const ro = window.ResizeObserver ? new ResizeObserver(layout) : null;
    if(ro) ro.observe(mainEl); else window.addEventListener('resize', layout);

    function choose(l, btn){
      const P = cur();
      if(P.solved || P.tried.includes(l)) return;
      if(l !== P.letter){
        P.tried.push(l);
        tone([300], 0.05);
        btn.classList.add('no'); btn.disabled = true;
        save();
        return;
      }
      P.solved = true;
      tone([523, 659, 784]);
      save();
      render();
      // Gå vidare först när bokstaven och alla tre ord har lästs upp, plus en kort paus.
      // Utan ljud väntar spelet en fast tid, och det väntar aldrig längre än 12 sekunder.
      let advanced = false;
      const advance = () => {
        if(advanced || stopped) return;
        advanced = true; clearTimeout(nextTimer); clearTimeout(safeTimer);
        if(st.idx < st.puzzles.length - 1){ st.idx++; save(); render(); }
        else finish();
      };
      safeTimer = setTimeout(advance, 12000);
      setTimeout(() => say(P.letter + '. ' + P.words.map(w => cap(w[0])).join('. ') + '.',
        ok => { if(!advanced) nextTimer = setTimeout(advance, ok ? AFTER_SPEECH_MS : NEXT_MS); }), 400);
    }

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

    // Ett pussel som löstes precis innan spelet stängdes: gå vidare till nästa.
    if(!st.done && cur().solved){
      if(st.idx < st.puzzles.length - 1) st.idx++; else st.done = true;
      save();
    }
    render();

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
    id: 'forstabokstaven', title: 'Första bokstaven', icon: '🔤',
    about: 'Tre saker som börjar på samma bokstav, med första bokstaven borttagen. Välj rätt bokstav. Tryck på en bild för att höra ordet. Liten: 2 val bland vanliga bokstäver. Stor: 4 val med bokstäver som liknar varandra.',
    start
  });
})();
