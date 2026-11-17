/* Ballonger – poppa ballongerna som sakta stiger. Liten nivå: alla ger stjärna och färgen läses upp.
   Stor nivå: spelet säger vilken färg som gäller; andra färger går att poppa men ger ingen stjärna.
   Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.bl{height:100%;display:flex;flex-direction:column;gap:12px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.bl-top{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px}
.bl-title{font-size:1.7rem;font-weight:800;line-height:1}
.bl-target{display:none;align-items:center;gap:10px;font-weight:800;font-size:1.3rem;background:var(--card,#fff);border-radius:999px;padding:4px 16px 4px 8px;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF)}
.bl-target.on{display:flex}
.bl-target.new{animation:bl-bump .5s ease 2}
.bl-target svg{width:30px;height:40px;display:block}
.bl-score{font-size:1.6rem;font-weight:800;line-height:1;background:var(--card,#fff);border-radius:999px;padding:6px 16px;box-shadow:inset 0 0 0 3px var(--done,#F2B33D)}
.bl-score.bump{animation:bl-bump .3s ease}
.bl-sky{flex:1;min-height:0;position:relative;overflow:hidden;border-radius:26px;touch-action:none;
  background:linear-gradient(#8fd0f7,#e3f4fd)}
.bl-cloud{position:absolute;background:#fff;border-radius:999px;opacity:.85}
.bl-b{position:absolute;left:0;top:0;cursor:pointer;will-change:transform;touch-action:none}
.bl-b svg{width:100%;height:100%;display:block;pointer-events:none;overflow:visible}
.bl-b.pop svg{animation:bl-pop .16s ease-out forwards}
.bl-bit{position:absolute;width:12px;height:12px;border-radius:50%;pointer-events:none;animation:bl-bit .55s ease-out forwards}
.bl-star{position:absolute;font-size:36px;line-height:1;pointer-events:none;animation:bl-star .8s ease-out forwards}
.bl-start,.bl-end{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;
  background:color-mix(in srgb,var(--sky,#DCEAF6) 80%,transparent);border-radius:inherit;z-index:5}
.bl-start.on,.bl-end.on{display:flex}
.bl-play{border:0;width:150px;height:150px;border-radius:50%;background:var(--done,#F2B33D);color:#2B1E00;font-size:64px;cursor:pointer;display:grid;place-items:center;padding-left:10px;box-sizing:border-box}
.bl-start .peek{display:flex;gap:6px}
.bl-start .peek svg{width:44px;height:60px}
.bl-end .big{font-size:clamp(2.4rem,8vmin,4.5rem);font-weight:800;line-height:1}
.bl-end .stars{font-size:clamp(2.4rem,8vmin,4.5rem);line-height:1}
.bl-end .got{font-size:2.4rem;font-weight:800;line-height:1}
.bl-end.on .stars{animation:bl-hop .8s ease-out 2}
.bl-end button{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.3rem;font-weight:800;border-radius:18px;padding:12px 26px;cursor:pointer;margin-top:8px}
.bl-play:focus-visible,.bl-end button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
@keyframes bl-pop{to{transform:scale(1.35);opacity:0}}
@keyframes bl-bit{to{transform:translate(var(--dx),var(--dy)) scale(.3);opacity:0}}
@keyframes bl-star{0%{transform:translate(-50%,0) scale(.5);opacity:1}100%{transform:translate(-50%,-70px) scale(1.1);opacity:0}}
@keyframes bl-bump{50%{transform:scale(1.12)}}
@keyframes bl-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-18px)}}
@media (prefers-reduced-motion: reduce){
  .bl-b.pop svg,.bl-bit,.bl-star,.bl-score.bump,.bl-target.new,.bl-end.on .stars{animation-duration:.01s}
}`;

  const COLORS = [
    {name: 'Röd', plural: 'röda', fill: '#e8473c'},
    {name: 'Blå', plural: 'blå', fill: '#3b7fe0'},
    {name: 'Gul', plural: 'gula', fill: '#f5c02e'},
    {name: 'Grön', plural: 'gröna', fill: '#43b55a'},
    {name: 'Lila', plural: 'lila', fill: '#9a5bd6'},
    {name: 'Orange', plural: 'orange', fill: '#f28a2e'}
  ];
  // Liten: långsamt, få ballonger åt gången. Stor: lite fortare, fler, och en färg som gäller.
  const LEVELS = {
    small: {total: 20, every: 1300, rise: [9000, 11000], maxUp: 3, target: false},
    big:   {total: 26, every: 950,  rise: [6500, 8000],  maxUp: 5, target: true, switchEvery: 7, targetShare: 0.5}
  };

  const balloonSvg = fill => `<svg viewBox="0 0 100 140" aria-hidden="true">
    <path d="M50 96 C 46 108, 56 116, 49 126 S 52 136, 50 140" fill="none" stroke="rgba(60,60,70,.55)" stroke-width="2"/>
    <ellipse cx="50" cy="48" rx="40" ry="46" fill="${fill}"/>
    <ellipse cx="36" cy="30" rx="10" ry="15" fill="rgba(255,255,255,.38)" transform="rotate(-20 36 30)"/>
    <path d="M44 93 L56 93 L50 101 Z" fill="${fill}"/>
  </svg>`;

  function start(root, opts){
    opts = opts || {};
    const level = opts.level === 'big' ? 'big' : 'small';
    const L = LEVELS[level];

    if(!document.getElementById('bl-css')){
      const s = document.createElement('style'); s.id = 'bl-css'; s.textContent = CSS; document.head.append(s);
    }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'bl';
    el.innerHTML = `
      <div class="bl-top"><div class="bl-title">Ballonger</div><div class="bl-target" aria-live="polite"></div><div class="bl-score" aria-live="polite">⭐ 0</div></div>
      <div class="bl-sky" role="application" aria-label="Ballonger att poppa"></div>
      <div class="bl-start on"><div class="peek">${balloonSvg(COLORS[0].fill)}${balloonSvg(COLORS[1].fill)}${balloonSvg(COLORS[2].fill)}</div><button type="button" class="bl-play" aria-label="Börja">▶</button></div>
      <div class="bl-end" role="dialog" aria-live="polite"><div class="stars">🎈🎈🎈</div><div class="big">Bra jobbat!</div><div class="got"></div><button type="button">Spela igen</button></div>`;
    root.append(el);
    const sky = el.querySelector('.bl-sky'), scoreEl = el.querySelector('.bl-score'), targetEl = el.querySelector('.bl-target');
    const startEl = el.querySelector('.bl-start'), endEl = el.querySelector('.bl-end');
    [[8, 12, 120, 44], [60, 8, 160, 52], [30, 30, 100, 36]].forEach(([x, y, w, h]) => {
      const c = document.createElement('div'); c.className = 'bl-cloud';
      Object.assign(c.style, {left: x + '%', top: y + '%', width: w + 'px', height: h + 'px'}); sky.append(c);
    });

    // ---------- Ljud ----------
    let ac = null;
    function tone(freqs, vol, type, len){
      if(!opts.sound) return;
      try{
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        freqs.forEach((f, i) => {
          const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * 0.1;
          o.type = type || 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.15, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + (len || 0.25));
          o.connect(g).connect(ac.destination); o.start(t); o.stop(t + (len || 0.25) + 0.02);
        });
      }catch(e){}
    }
    // Ett mjukt "pop": kort brus som klingar av.
    function pop(){
      if(!opts.sound) return;
      try{
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        const n = ac.sampleRate * 0.08, buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
        for(let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
        const src = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter();
        f.type = 'lowpass'; f.frequency.value = 1800; g.gain.value = 0.35;
        src.buffer = buf; src.connect(f).connect(g).connect(ac.destination); src.start();
      }catch(e){}
    }
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

    // ---------- Omgången ----------
    let balloons = [], running = false, paused = false, spawned = 0, stars = 0, target = null, spawnTimer = null, raf = 0, last = 0;
    const size = () => Math.round(Math.max(70, Math.min(140, sky.clientWidth * 0.11)));

    function setTarget(){
      let c; do{ c = COLORS[Math.floor(Math.random() * COLORS.length)]; }while(target && c === target);
      target = c;
      targetEl.innerHTML = `${balloonSvg(c.fill)}<span></span>`;
      targetEl.querySelector('span').textContent = c.name;
      targetEl.setAttribute('aria-label', `Poppa de ${c.plural}`);
      targetEl.classList.remove('new'); void targetEl.offsetWidth; targetEl.classList.add('new');
      say(`Poppa de ${c.plural}!`);
    }

    function begin(){
      startEl.classList.remove('on'); endEl.classList.remove('on');
      balloons.forEach(b => b.el.remove()); balloons = [];
      spawned = 0; stars = 0; scoreEl.textContent = '⭐ 0';
      targetEl.classList.toggle('on', !!L.target);
      target = null;
      running = true;
      if(L.target) setTarget();
      tone([392, 523]);
      spawnTimer = setTimeout(spawn, L.target ? 1500 : 500);
      last = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    }

    function spawn(){
      if(!running || paused) return;
      if(spawned < L.total && balloons.filter(b => !b.popped).length < L.maxUp){
        if(L.target && spawned > 0 && spawned % L.switchEvery === 0) setTarget();
        const color = L.target && Math.random() < L.targetShare ? target
          : COLORS[Math.floor(Math.random() * COLORS.length)];
        const s = size(), W = sky.clientWidth, H = sky.clientHeight;
        const e = document.createElement('div');
        e.className = 'bl-b'; e.innerHTML = balloonSvg(color.fill);
        e.style.width = s + 'px'; e.style.height = Math.round(s * 1.4) + 'px';
        e.setAttribute('role', 'button'); e.setAttribute('aria-label', color.name + ' ballong');
        const b = {el: e, color, x: Math.random() * Math.max(1, W - s), y: H + 10, s,
                   v: (H + s * 1.6) / (L.rise[0] + Math.random() * (L.rise[1] - L.rise[0])),
                   phase: Math.random() * Math.PI * 2, popped: false};
        e.addEventListener('pointerdown', ev => { ev.preventDefault(); hit(b); });
        sky.append(e); balloons.push(b);
        spawned++;
        place(b, 0);
      }
      if(spawned >= L.total){ checkEnd(); return; }
      spawnTimer = setTimeout(spawn, L.every * (0.8 + Math.random() * 0.4));
    }

    function place(b, t){
      const sway = Math.sin(t / 900 + b.phase) * b.s * 0.12;
      b.el.style.transform = `translate(${b.x + sway}px, ${b.y}px)`;
    }

    function frame(t){
      raf = requestAnimationFrame(frame);
      if(paused || !running){ last = t; return; }
      const dt = Math.min(50, t - (last || t)); last = t;
      balloons.forEach(b => { if(!b.popped){ b.y -= b.v * dt; place(b, t); } });
      const gone = balloons.filter(b => !b.popped && b.y < -b.s * 1.6);
      gone.forEach(b => b.el.remove());
      if(gone.length){ balloons = balloons.filter(b => !gone.includes(b)); checkEnd(); }
    }

    function hit(b){
      if(!running || b.popped) return;
      b.popped = true;
      const counts = !L.target || b.color === target;
      pop();
      const rect = {x: b.x + Math.sin(performance.now() / 900 + b.phase) * b.s * 0.12 + b.s / 2, y: b.y + b.s * 0.48};
      for(let i = 0; i < 9; i++){
        const p = document.createElement('div'); p.className = 'bl-bit';
        const a = i / 9 * Math.PI * 2, r = b.s * (0.5 + Math.random() * 0.3);
        p.style.background = b.color.fill; p.style.left = rect.x - 6 + 'px'; p.style.top = rect.y - 6 + 'px';
        p.style.setProperty('--dx', Math.cos(a) * r + 'px'); p.style.setProperty('--dy', Math.sin(a) * r + 'px');
        sky.append(p); setTimeout(() => p.remove(), 600);
      }
      if(counts){
        stars++;
        scoreEl.textContent = '⭐ ' + stars;
        scoreEl.classList.remove('bump'); void scoreEl.offsetWidth; scoreEl.classList.add('bump');
        const st = document.createElement('div'); st.className = 'bl-star'; st.textContent = '⭐';
        st.style.left = rect.x + 'px'; st.style.top = rect.y - 20 + 'px';
        sky.append(st); setTimeout(() => st.remove(), 850);
        tone([700 + Math.random() * 200], 0.08);
        if(!L.target) say(b.color.name);
      }
      b.el.classList.add('pop');
      setTimeout(() => { b.el.remove(); balloons = balloons.filter(x => x !== b); checkEnd(); }, 180);
    }

    function checkEnd(){
      if(!running || spawned < L.total || balloons.length) return;
      running = false; clearTimeout(spawnTimer);
      tone([523, 659, 784, 1047]);
      endEl.querySelector('.got').textContent = '⭐ ' + stars;
      setTimeout(() => endEl.classList.add('on'), 300);
      if(typeof opts.onFinish === 'function') opts.onFinish();
    }

    // Pausa om iPaden låses eller appen lämnas.
    function onVis(){
      if(document.visibilityState === 'hidden'){ paused = true; clearTimeout(spawnTimer); }
      else if(paused){ paused = false; if(running && spawned < L.total) spawnTimer = setTimeout(spawn, 800); }
    }
    document.addEventListener('visibilitychange', onVis);

    el.querySelector('.bl-play').addEventListener('click', begin);
    endEl.querySelector('button').addEventListener('click', begin);

    return {
      stop(){
        running = false; clearTimeout(spawnTimer); cancelAnimationFrame(raf);
        document.removeEventListener('visibilitychange', onVis);
        try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
        try{ if(ac) ac.close(); }catch(e){}
        root.innerHTML = '';
      }
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'ballonger', title: 'Ballonger', icon: '🎈',
    about: 'Poppa ballongerna som sakta stiger. Liten: alla ballonger ger stjärna och färgen läses upp. Stor: spelet säger vilken färg som gäller, och bara den färgen ger stjärna.',
    start
  });
})();
