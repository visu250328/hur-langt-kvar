/* Musik – piano (fritt eller lär dig en visa), trummor och gitarr. Alla ljud skapas i enheten,
   inga ljudfiler. Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.mu{height:100%;display:flex;flex-direction:column;gap:10px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.mu-top{display:flex;align-items:center;gap:10px;min-height:48px;flex-wrap:wrap}
.mu-title{font-size:1.7rem;font-weight:800;line-height:1;margin-right:auto}
.mu-tab{border:0;background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;border-radius:16px;padding:6px 14px;cursor:pointer;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);display:flex;align-items:center;gap:6px;font-size:1.05rem}
.mu-tab .ic{font-size:1.6rem;line-height:1}
.mu-tab[aria-pressed="true"]{box-shadow:inset 0 0 0 4px var(--accent,#2F6FD6)}
.mu-mute{display:none;background:#fff3c4;border-radius:14px;padding:6px 12px;font-weight:700;color:#1D2842}
.mu-mute.on{display:block}
.mu-stage{flex:1;min-height:0;display:flex;flex-direction:column;gap:10px;touch-action:none}
.mu-songs{display:flex;gap:8px;flex-wrap:wrap}
.mu-song{border:2px solid var(--line,#C6D1DF);background:var(--card,#fff);color:inherit;font:inherit;font-weight:700;border-radius:999px;padding:5px 12px;cursor:pointer}
.mu-song[aria-pressed="true"]{border-color:#2F6FD6;background:#2F6FD6;color:#fff}
.mu-prog{height:10px;border-radius:999px;background:var(--line,#C6D1DF);overflow:hidden}
.mu-prog div{height:100%;width:0;background:var(--done,#F2B33D);transition:width .2s}
.mu-keys{flex:1;min-height:0;position:relative}
.mu-key{position:absolute;bottom:0;border:0;border-radius:0 0 16px 16px;cursor:pointer;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;padding-bottom:12px;font:inherit;font-weight:800;
  box-shadow:inset 0 -8px 0 rgba(0,0,0,.12),0 0 0 2px #2a2a2a;transition:transform .06s,filter .06s;touch-action:none}
.mu-key .nm{font-size:1.6rem;line-height:1;color:#2a2a2a;background:rgba(255,255,255,.75);border-radius:999px;min-width:1.6em;padding:3px 6px}
.mu-key.black{background:#2a2a2a;z-index:2;border-radius:0 0 10px 10px;box-shadow:inset 0 -6px 0 #000}
.mu-key.black .nm{display:none}
.mu-key.down{transform:translateY(4px);filter:brightness(.85)}
.mu-key.next{animation:mu-glow .8s ease-in-out infinite}
.mu-key.black.next{animation:mu-glowb .8s ease-in-out infinite}
@keyframes mu-glowb{0%,100%{background:#2a2a2a;box-shadow:inset 0 -6px 0 #000}50%{background:#f5c02e;box-shadow:inset 0 -6px 0 #c9930a,0 0 18px 6px #f5c02e}}
.mu-pads{flex:1;min-height:0;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(2,1fr);gap:14px}
.mu-pad{border:0;border-radius:26px;cursor:pointer;color:#fff;font:inherit;font-weight:800;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
  box-shadow:inset 0 -10px 0 rgba(0,0,0,.18);transition:transform .06s,filter .06s;touch-action:none;text-shadow:0 2px 0 rgba(0,0,0,.25)}
.mu-pad .ic{font-size:2.6rem;line-height:1}
.mu-pad .nm{font-size:1.05rem}
.mu-pad.down{transform:scale(.95);filter:brightness(1.25)}
.mu-guitar{flex:1;min-height:0;display:flex;gap:14px}
.mu-chords{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;align-content:center;width:180px;flex:none}
.mu-chord{border:0;border-radius:18px;background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;font-size:1.5rem;padding:14px 0;cursor:pointer;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF)}
.mu-chord[aria-pressed="true"]{background:var(--done,#F2B33D);color:#2B1E00;box-shadow:none}
.mu-neck{flex:1;position:relative;border-radius:22px;background:linear-gradient(#a8703a,#8a5a2b);box-shadow:inset 0 0 0 6px #6b4226;touch-action:none;overflow:hidden}
.mu-hole{position:absolute;right:8%;top:50%;width:26%;aspect-ratio:1;transform:translateY(-50%);border-radius:50%;background:#3a2414;box-shadow:0 0 0 10px #c99a5a}
.mu-str{position:absolute;left:0;right:0;background:linear-gradient(#f3f3f3,#b9b9b9);border-radius:3px;pointer-events:none}
.mu-str.mute{opacity:.3}
.mu-str.hit{animation:mu-vib .35s linear}
.mu-strlabel{position:absolute;left:10px;font-weight:800;color:#fff;font-size:.9rem;pointer-events:none;transform:translateY(-120%)}
.mu-done{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);font-size:clamp(2rem,7vmin,3.6rem);font-weight:800;pointer-events:none;opacity:0;transition:opacity .3s;
  text-shadow:0 0 14px #fff,0 0 4px #fff;z-index:5;text-align:center}
.mu-done.on{opacity:1}
.mu button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
@keyframes mu-glow{0%,100%{box-shadow:inset 0 -8px 0 rgba(0,0,0,.12),0 0 0 2px #2a2a2a}50%{box-shadow:inset 0 -8px 0 rgba(0,0,0,.12),0 0 0 6px #f5c02e,0 0 18px 6px #f5c02e}}
@keyframes mu-vib{0%,100%{transform:translateY(0)}20%{transform:translateY(-3px)}40%{transform:translateY(3px)}60%{transform:translateY(-2px)}80%{transform:translateY(2px)}}
@media (prefers-reduced-motion: reduce){ .mu-key.next,.mu-str.hit{animation:none} .mu-key.next{box-shadow:0 0 0 6px #f5c02e} }`;

  // ---------- Toner ----------
  const freq = m => 440 * Math.pow(2, (m - 69) / 12);
  const WHITE = [['C', 60, '#ff9a9a'], ['D', 62, '#ffc285'], ['E', 64, '#ffe680'], ['F', 65, '#b8eb9a'], ['G', 67, '#9fe0d6'], ['A', 69, '#a9c8ff'], ['H', 71, '#d1b3ff'], ['C', 72, '#ffb3d9']];
  const BLACK = [[61, 0], [63, 1], [66, 3], [68, 4], [70, 5]];       // [ton, efter vilken vit tangent]
  // Tre traditionella barnvisor. Liten nivå spelar början av Blinka lilla stjärna.
  const SONGS = [
    {name: 'Blinka lilla stjärna', icon: '⭐', notes: [60,60,67,67,69,69,67,65,65,64,64,62,62,60,67,67,65,65,64,64,62,67,67,65,65,64,64,62,60,60,67,67,69,69,67,65,65,64,64,62,62,60], small: 14},
    {name: 'Gubben Noak', icon: '🚢', notes: [60,60,60,64,62,62,62,65,64,64,62,62,60]},
    {name: 'Imse vimse spindel', icon: '🕷️', notes: [60,65,65,65,67,69,69,69,67,65,67,69,65]},
    // Broder Jakob (traditionell). Det låga G:et i sista raden spelas som det höga G:et, så att visan ryms på en oktav.
    {name: 'Broder Jakob', icon: '🔔', notes: [60,62,64,60,60,62,64,60,64,65,67,64,65,67,67,69,67,65,64,60,67,69,67,65,64,60,60,67,60,60,67,60], small: 14},
    // Ode till glädjen (Beethoven, 1824).
    {name: 'Ode till glädjen', icon: '🎶', notes: [64,64,65,67,67,65,64,62,60,60,62,64,64,62,62,64,64,65,67,67,65,64,62,60,60,62,64,62,60,60], small: 15},
    // Für Elise (Beethoven, 1810): början, förenklad till melodin utan ackord och flyttad till d-moll så att den
    // ryms på pianot. Den behöver en svart tangent (G#) och finns därför bara på stor nivå.
    {name: 'Für Elise', icon: '🎼', bigOnly: true, notes: [69,68,69,68,69,64,67,65,62,64,65,69,68,69,68,69,64,67,65,62,64,62]}
  ];
  const DRUMS = [
    {id: 'kick', name: 'Bastrumma', icon: '🥁', color: '#e8473c'}, {id: 'snare', name: 'Virvel', icon: '🪘', color: '#f28a2e'},
    {id: 'hat', name: 'Hi-hat', icon: '🎩', color: '#c9930a'}, {id: 'crash', name: 'Cymbal', icon: '💥', color: '#43b55a'},
    {id: 'tom', name: 'Tom', icon: '🔵', color: '#3b7fe0'}, {id: 'clap', name: 'Handklapp', icon: '👏', color: '#9a5bd6'},
    {id: 'tamb', name: 'Tamburin', icon: '✨', color: '#e86fa6'}, {id: 'bell', name: 'Koskälla', icon: '🔔', color: '#2bb3b1'}
  ];
  const OPEN = [40, 45, 50, 55, 59, 64];                                  // E A D G H E, tjockaste först
  const CHORDS = {C: [null,3,2,0,1,0], G: [3,2,0,0,0,3], D: [null,null,0,2,3,2], Am: [null,0,2,2,1,0], Em: [0,2,2,0,0,0], F: [null,null,3,2,1,1]};

  function start(root, opts){
    opts = opts || {};
    const level = opts.level === 'big' ? 'big' : 'small';
    const store = opts.storage || {get(){ return null; }, set(){}};

    if(!document.getElementById('mu-css')){
      const s = document.createElement('style'); s.id = 'mu-css'; s.textContent = CSS; document.head.append(s);
    }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'mu';
    el.innerHTML = `
      <div class="mu-top"><div class="mu-title">Musik</div>
        <button type="button" class="mu-tab" data-t="piano"><span class="ic">🎹</span>Piano</button>
        <button type="button" class="mu-tab" data-t="drums"><span class="ic">🥁</span>Trummor</button>
        <button type="button" class="mu-tab" data-t="guitar"><span class="ic">🎸</span>Gitarr</button></div>
      <div class="mu-mute${opts.sound ? '' : ' on'}">Ljudet är avstängt. Slå på ljudet för att höra instrumenten.</div>
      <div class="mu-stage"></div><div class="mu-done" aria-live="polite"></div>`;
    root.append(el);
    const stage = el.querySelector('.mu-stage'), doneEl = el.querySelector('.mu-done');

    // ---------- Ljudmotor ----------
    let ac = null, master = null, noise = null;
    const pluckCache = {};
    function ctx(){
      if(!opts.sound) return null;
      try{
        if(!ac){
          ac = new (window.AudioContext || window.webkitAudioContext)();
          master = ac.createDynamicsCompressor(); master.connect(ac.destination);
        }
        if(ac.state === 'suspended') ac.resume();
        return ac;
      }catch(e){ return null; }
    }
    function env(a, t, peak, decay){ const g = a.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + decay); g.connect(master); return g; }
    function noiseBuf(a){
      if(noise) return noise;
      noise = a.createBuffer(1, a.sampleRate, a.sampleRate);
      const d = noise.getChannelData(0); for(let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return noise;
    }
    function noiseHit(a, t, type, f, peak, decay, q){
      const s = a.createBufferSource(); s.buffer = noiseBuf(a);
      const fl = a.createBiquadFilter(); fl.type = type; fl.frequency.value = f; if(q) fl.Q.value = q;
      s.connect(fl).connect(env(a, t, peak, decay)); s.start(t); s.stop(t + decay + 0.05);
    }
    function osc(a, t, type, f0, f1, peak, decay){
      const o = a.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t);
      if(f1) o.frequency.exponentialRampToValueAtTime(f1, t + decay * 0.8);
      o.connect(env(a, t, peak, decay)); o.start(t); o.stop(t + decay + 0.05);
    }
    function pianoNote(m){
      const a = ctx(); if(!a) return; const t = a.currentTime, f = freq(m);
      osc(a, t, 'triangle', f, 0, 0.45, 1.6);
      osc(a, t, 'sine', f * 2, 0, 0.12, 0.9);
      osc(a, t, 'sine', f * 3, 0, 0.04, 0.5);
    }
    function drum(id){
      const a = ctx(); if(!a) return; const t = a.currentTime;
      if(id === 'kick'){ osc(a, t, 'sine', 150, 45, 1, 0.45); }
      if(id === 'snare'){ noiseHit(a, t, 'highpass', 1200, 0.6, 0.2); osc(a, t, 'triangle', 190, 0, 0.35, 0.12); }
      if(id === 'hat'){ noiseHit(a, t, 'highpass', 7000, 0.35, 0.07); }
      if(id === 'crash'){ noiseHit(a, t, 'highpass', 4000, 0.4, 1.4); }
      if(id === 'tom'){ osc(a, t, 'sine', 230, 120, 0.8, 0.35); }
      if(id === 'clap'){ [0, 0.012, 0.024].forEach((d, i) => noiseHit(a, t + d, 'bandpass', 1500, i === 2 ? 0.7 : 0.4, i === 2 ? 0.18 : 0.03, 1.2)); }
      if(id === 'tamb'){ noiseHit(a, t, 'highpass', 9000, 0.3, 0.25); noiseHit(a, t + 0.05, 'highpass', 9000, 0.15, 0.15); }
      if(id === 'bell'){ const fl = a.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = 800; const g = a.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.4, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        fl.connect(g).connect(master); [545, 815].forEach(f => { const o = a.createOscillator(); o.type = 'square'; o.frequency.value = f; o.connect(fl); o.start(t); o.stop(t + 0.45); }); }
    }
    // Gitarrsträng: Karplus–Strong, en kort brusstöt som klingar ut i en återkopplad fördröjning.
    function pluck(m){
      const a = ctx(); if(!a) return;
      if(!pluckCache[m]){
        const sr = a.sampleRate, len = Math.floor(sr * 2.2), buf = a.createBuffer(1, len, sr), d = buf.getChannelData(0);
        const N = Math.max(2, Math.round(sr / freq(m))), ring = new Float32Array(N);
        for(let i = 0; i < N; i++) ring[i] = Math.random() * 2 - 1;
        let idx = 0;
        for(let i = 0; i < len; i++){ const v = ring[idx], nx = ring[(idx + 1) % N]; ring[idx] = 0.996 * 0.5 * (v + nx); d[i] = v * 0.5; idx = (idx + 1) % N; }
        pluckCache[m] = buf;
      }
      const s = a.createBufferSource(); s.buffer = pluckCache[m];
      const g = a.createGain(); g.gain.value = 0.7; s.connect(g).connect(master); s.start();
    }

    // ---------- Instrumenten ----------
    let tab = store.get('flik') || 'piano', cleanup = null;
    function setTab(t){
      tab = t; try{ store.set('flik', t); }catch(e){}
      el.querySelectorAll('.mu-tab').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.t === t)));
      if(cleanup) cleanup();
      stage.innerHTML = '';
      cleanup = (t === 'drums' ? drums : t === 'guitar' ? guitar : piano)();
    }
    el.querySelectorAll('.mu-tab').forEach(b => b.addEventListener('click', () => setTab(b.dataset.t)));

    // Tryck med flera fingrar: varje finger hanteras för sig.
    function press(btn, play){
      btn.addEventListener('pointerdown', e => { e.preventDefault(); btn.classList.add('down'); play(); });
      const up = () => btn.classList.remove('down');
      btn.addEventListener('pointerup', up); btn.addEventListener('pointerleave', up); btn.addEventListener('pointercancel', up);
      btn.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); play(); } });
    }

    let doneTimer = null;
    function celebrate(text){
      doneEl.textContent = text; doneEl.classList.add('on');
      clearTimeout(doneTimer); doneTimer = setTimeout(() => doneEl.classList.remove('on'), 2000);
      if(typeof opts.onFinish === 'function') opts.onFinish();
    }

    function piano(){
      stage.innerHTML = `<div class="mu-songs" role="group" aria-label="Läge"></div><div class="mu-prog" hidden><div></div></div><div class="mu-keys" role="group" aria-label="Piano"></div>`;
      const songsEl = stage.querySelector('.mu-songs'), keysEl = stage.querySelector('.mu-keys'), progEl = stage.querySelector('.mu-prog');
      let song = -1, pos = 0, notes = [];
      const list = SONGS.filter(s => !(s.bigOnly && level === 'small'));
      const modes = [{name: 'Spela fritt', icon: '🎵'}].concat(list);
      modes.forEach((s, i) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'mu-song';
        b.textContent = `${s.icon} ${s.name}`; b.setAttribute('aria-pressed', String(i === 0));
        b.addEventListener('click', () => {
          songsEl.querySelectorAll('.mu-song').forEach((x, j) => x.setAttribute('aria-pressed', String(j === i)));
          song = i - 1; pos = 0;
          notes = song < 0 ? [] : (level === 'small' && list[song].small ? list[song].notes.slice(0, list[song].small) : list[song].notes);
          progEl.hidden = song < 0; mark();
        });
        songsEl.append(b);
      });
      const keys = {};
      WHITE.forEach(([nm, m, color], i) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'mu-key';
        b.style.background = color; b.dataset.i = i; b.setAttribute('aria-label', nm);
        b.innerHTML = `<span class="nm">${nm}</span>`;
        press(b, () => played(m)); keysEl.append(b); keys[m] = b;
      });
      if(level === 'big') BLACK.forEach(([m, after]) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'mu-key black';
        b.dataset.after = after; b.setAttribute('aria-label', 'Svart tangent');
        press(b, () => played(m)); keysEl.append(b); keys[m] = b;
      });
      function layout(){
        const W = keysEl.clientWidth, H = keysEl.clientHeight, w = W / 8;
        keysEl.querySelectorAll('.mu-key:not(.black)').forEach(k => Object.assign(k.style, {left: (+k.dataset.i * w + 2) + 'px', width: (w - 4) + 'px', height: H + 'px'}));
        keysEl.querySelectorAll('.mu-key.black').forEach(k => Object.assign(k.style, {left: ((+k.dataset.after + 1) * w - w * 0.3) + 'px', width: (w * 0.6) + 'px', height: (H * 0.6) + 'px', top: 0, bottom: 'auto'}));
      }
      function mark(){
        Object.values(keys).forEach(k => k.classList.remove('next'));
        progEl.firstElementChild.style.width = notes.length ? (pos / notes.length * 100) + '%' : '0';
        if(song >= 0 && pos < notes.length) keys[notes[pos]].classList.add('next');
      }
      function played(m){
        pianoNote(m);
        if(song < 0) return;
        if(m === notes[pos]){
          pos++; mark();
          if(pos >= notes.length){ celebrate('Bravo! 🎉'); setTimeout(() => { pos = 0; mark(); }, 2200); }
        }
      }
      const ro = window.ResizeObserver ? new ResizeObserver(layout) : null; if(ro) ro.observe(keysEl);
      layout();
      return () => { if(ro) ro.disconnect(); };
    }

    function drums(){
      stage.innerHTML = `<div class="mu-pads" role="group" aria-label="Trummor"></div>`;
      const pads = stage.querySelector('.mu-pads');
      DRUMS.forEach(d => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'mu-pad'; b.style.background = d.color;
        b.innerHTML = `<span class="ic">${d.icon}</span><span class="nm">${d.name}</span>`;
        b.setAttribute('aria-label', d.name);
        press(b, () => drum(d.id)); pads.append(b);
      });
      return null;
    }

    function guitar(){
      stage.innerHTML = `<div class="mu-guitar"><div class="mu-chords" role="group" aria-label="Ackord"></div><div class="mu-neck" role="application" aria-label="Strängar: dra över för att slå an"><div class="mu-hole"></div></div></div>`;
      const chordsEl = stage.querySelector('.mu-chords'), neck = stage.querySelector('.mu-neck');
      let chord = 'C';
      Object.keys(CHORDS).forEach(c => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'mu-chord'; b.textContent = c;
        b.setAttribute('aria-pressed', String(c === chord));
        b.addEventListener('click', () => { chord = c; chordsEl.querySelectorAll('.mu-chord').forEach(x => x.setAttribute('aria-pressed', String(x.textContent === c))); paint(); strum(); });
        chordsEl.append(b);
      });
      const strs = OPEN.map((_, i) => {
        const s = document.createElement('div'); s.className = 'mu-str'; neck.append(s);
        const l = document.createElement('div'); l.className = 'mu-strlabel'; neck.append(l);
        return {s, l};
      });
      const ys = () => { const H = neck.clientHeight; return OPEN.map((_, i) => H * (0.14 + i * 0.144)); };
      function layout(){
        ys().forEach((y, i) => { const th = 7 - i; Object.assign(strs[i].s.style, {top: (y - th / 2) + 'px', height: th + 'px'}); strs[i].l.style.top = y + 'px'; });
      }
      function paint(){
        CHORDS[chord].forEach((f, i) => { strs[i].s.classList.toggle('mute', f === null); strs[i].l.textContent = ''; });
      }
      function hit(i){
        const f = CHORDS[chord][i]; if(f === null) return;
        pluck(OPEN[i] + f);
        const s = strs[i].s; s.classList.remove('hit'); void s.offsetWidth; s.classList.add('hit');
      }
      function strum(){ OPEN.forEach((_, i) => setTimeout(() => hit(i), i * 28)); }
      // Dra fingret över strängarna: varje sträng som passeras slås an. Ett tryck nära en sträng knäpper den.
      const localY = e => { const r = neck.getBoundingClientRect(), k = r.height / (neck.clientHeight || 1) || 1; return (e.clientY - r.top) / k; };
      const nearest = y => { let b = -1, bd = neck.clientHeight * 0.072; ys().forEach((sy, i) => { const d = Math.abs(sy - y); if(d < bd){ bd = d; b = i; } }); return b; };
      neck.addEventListener('pointerdown', e => {
        e.preventDefault();
        neck.setPointerCapture && neck.setPointerCapture(e.pointerId);
        let last = localY(e);
        const n = nearest(last); if(n >= 0) hit(n);
        const move = ev => {
          const y = localY(ev), lo = Math.min(last, y), hi = Math.max(last, y);
          const crossed = ys().map((sy, i) => [sy, i]).filter(([sy]) => sy > lo && sy <= hi).map(([, i]) => i);
          (y > last ? crossed : crossed.reverse()).forEach(hit);
          last = y;
        };
        const up = () => { neck.removeEventListener('pointermove', move); neck.removeEventListener('pointerup', up); neck.removeEventListener('pointercancel', up); };
        neck.addEventListener('pointermove', move); neck.addEventListener('pointerup', up); neck.addEventListener('pointercancel', up);
      });
      const ro = window.ResizeObserver ? new ResizeObserver(layout) : null; if(ro) ro.observe(neck);
      layout(); paint();
      return () => { if(ro) ro.disconnect(); };
    }

    setTab(['piano', 'drums', 'guitar'].includes(tab) ? tab : 'piano');

    return {
      stop(){
        clearTimeout(doneTimer);
        if(cleanup) cleanup();
        try{ if(ac) ac.close(); }catch(e){}
        root.innerHTML = '';
      }
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'musik', title: 'Musik', icon: '🎹',
    about: 'Spela piano, trummor och gitarr. Pianot kan också lära ut Blinka lilla stjärna, Gubben Noak, Imse vimse spindel, Broder Jakob, Ode till glädjen och (på stor nivå) Für Elise. Liten: 8 vita tangenter och en kortare visa. Stor: även svarta tangenter och hela visorna.',
    start,
    _test: {SONGS, WHITE}
  });
})();
