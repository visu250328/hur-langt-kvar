/* Prick till prick – tryck eller dra mellan prickarna i nummerordning. När sista strecket är draget
   stängs figuren och färgläggs automatiskt. Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.pp{height:100%;display:flex;flex-direction:column;gap:12px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.pp-top{display:flex;align-items:center;gap:12px;min-height:48px;flex-wrap:wrap}
.pp-title{font-size:1.7rem;font-weight:800;line-height:1;margin-right:auto}
.pp-pics{display:flex;gap:6px;flex-wrap:wrap}
.pp-pic{width:36px;height:36px;border-radius:50%;border:0;background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;cursor:pointer;
  box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);display:grid;place-items:center;padding:0}
.pp-pic.done{background:var(--done,#F2B33D);color:#2B1E00;box-shadow:none}
.pp-pic.cur{box-shadow:0 0 0 3px var(--sky,#DCEAF6),0 0 0 6px var(--accent,#2F6FD6)}
.pp-new{border:2px solid var(--line,#C6D1DF);background:var(--card,#fff);color:inherit;font:inherit;font-weight:700;border-radius:999px;padding:5px 14px;cursor:pointer}
.pp-new.sure{background:var(--done,#F2B33D);border-color:var(--done,#F2B33D);color:#2B1E00}
.pp-board{flex:1;min-height:0;display:grid;place-items:center;background:var(--card,#fff);border-radius:24px;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);position:relative;overflow:hidden;touch-action:none}
.pp-board svg{width:96%;height:96%;touch-action:none;transition:height .6s ease,margin .6s ease}
.pp-board.won svg{height:74%;margin-bottom:22%}
.pp-dot{transition:r .2s}
.pp-dot.next{animation:pp-pulse 1s ease-in-out infinite}
.pp-dot.no{animation:pp-no .4s ease}
.pp-color{opacity:0;transition:opacity .9s ease}
.pp-color.on{opacity:1}
.pp-dots.fade{opacity:0;transition:opacity .9s ease}
.pp-end{position:absolute;left:0;right:0;bottom:4%;display:none;flex-direction:column;align-items:center;gap:8px;text-align:center;z-index:5}
.pp-end.on{display:flex}
.pp-end .big{font-size:clamp(2rem,6vmin,3.4rem);font-weight:800;line-height:1;text-shadow:0 0 14px #fff,0 0 4px #fff}
.pp-end button{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.2rem;font-weight:800;border-radius:18px;padding:10px 24px;cursor:pointer}
.pp button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
@keyframes pp-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.5)}}
@keyframes pp-no{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
@media (prefers-reduced-motion: reduce){ .pp-dot.next,.pp-dot.no{animation:none} .pp-color,.pp-dots.fade{transition:none} }`;

  // Bilderna i 400 × 300: prickarna i ordning (figuren stängs från sista till första),
  // figurens färg och detaljer som tonar fram när bilden är klar.
  const star = (() => { const p = []; for(let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 46 : 112; p.push([Math.round(200 + r * Math.cos(a)), Math.round(158 + r * Math.sin(a))]); } return p; })();
  const PICS = {
    small: [
      {name: 'Ett hus', fill: '#f2c9a0', pts: [[100,250],[100,140],[200,64],[240,94],[240,58],[272,58],[272,118],[300,140],[300,250]],
       details: '<path d="M240 58 L272 58 L272 118 L240 94 Z" fill="#8a5a2b" stroke="#222" stroke-width="4" stroke-linejoin="round"/><path d="M100 140 L200 64 L300 140 Z" fill="#e8473c" stroke="#222" stroke-width="4" stroke-linejoin="round"/><rect x="180" y="180" width="40" height="70" fill="#8a5a2b" stroke="#222" stroke-width="3"/><rect x="120" y="165" width="40" height="34" fill="#7ec8f2" stroke="#222" stroke-width="3"/><rect x="240" y="165" width="40" height="34" fill="#7ec8f2" stroke="#222" stroke-width="3"/><circle cx="212" cy="218" r="3.5" fill="#f5c02e"/>'},
      {name: 'En stjärna', fill: '#f5c02e', pts: star,
       details: '<circle cx="178" cy="150" r="7" fill="#222"/><circle cx="222" cy="150" r="7" fill="#222"/><path d="M182 174 Q200 190 218 174" stroke="#222" stroke-width="5" fill="none" stroke-linecap="round"/>'},
      {name: 'En fisk', fill: '#f28a2e', pts: [[70,150],[120,106],[200,96],[270,124],[330,94],[318,150],[330,206],[270,176],[200,204],[120,194]],
       details: '<circle cx="118" cy="140" r="9" fill="#fff" stroke="#222" stroke-width="3"/><circle cx="120" cy="140" r="4" fill="#222"/><path d="M175 110 Q160 150 175 196 M215 104 Q200 150 215 200" stroke="#fff" stroke-width="8" fill="none" opacity=".8"/><path d="M200 96 Q215 70 240 90" fill="#e8473c" stroke="#222" stroke-width="3"/>'},
      {name: 'En segelbåt', fill: '#ffffff', pts: [[200,40],[288,196],[330,196],[296,252],[104,252],[70,196],[200,196]],
       details: '<path d="M70 196 L330 196 L296 252 L104 252 Z" fill="#8a5a2b" stroke="#222" stroke-width="4" stroke-linejoin="round"/><path d="M200 40 L288 196 L200 196 Z" fill="#ff8fb7" stroke="#222" stroke-width="4" stroke-linejoin="round"/><path d="M0 268 q25 -12 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 L400 300 L0 300 Z" fill="#7ec8f2"/>'},
      {name: 'Ett hjärta', fill: '#e8473c', pts: [[200,92],[240,56],[290,56],[322,96],[306,152],[200,252],[94,152],[78,96],[110,56],[160,56]],
       details: '<path d="M120 90 Q130 70 150 72" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" opacity=".7"/>'},
      {name: 'En bil', fill: '#3b7fe0', pts: [[60,212],[60,162],[110,150],[150,108],[262,108],[302,150],[342,162],[342,212]],
       details: '<path d="M160 116 L200 116 L200 150 L124 150 Z M210 116 L256 116 L290 150 L210 150 Z" fill="#bfe6ff" stroke="#222" stroke-width="3" stroke-linejoin="round"/><circle cx="120" cy="214" r="26" fill="#222"/><circle cx="120" cy="214" r="11" fill="#aaa"/><circle cx="284" cy="214" r="26" fill="#222"/><circle cx="284" cy="214" r="11" fill="#aaa"/><circle cx="336" cy="174" r="7" fill="#fff6b0" stroke="#222" stroke-width="2"/>'}
    ],
    big: [
      {name: 'En raket', fill: '#d9dde3', pts: [[200,30],[225,70],[230,190],[265,225],[265,258],[230,240],[220,262],[180,262],[170,240],[135,258],[135,225],[170,190],[175,70]],
       details: '<path d="M200 30 L225 70 L175 70 Z" fill="#e8473c" stroke="#222" stroke-width="3" stroke-linejoin="round"/><circle cx="200" cy="125" r="18" fill="#7ec8f2" stroke="#222" stroke-width="4"/><path d="M230 190 L265 225 L265 258 L230 240 Z M170 190 L135 225 L135 258 L170 240 Z" fill="#e8473c" stroke="#222" stroke-width="3" stroke-linejoin="round"/><path d="M182 264 Q200 300 218 264 Z" fill="#f5c02e"/><path d="M190 264 Q200 286 210 264 Z" fill="#f28a2e"/>'},
      {name: 'En katt', fill: '#f28a2e', pts: [[140,260],[135,170],[150,130],[145,70],[175,95],[215,95],[245,70],[240,130],[255,170],[258,240],[300,240],[318,200],[332,206],[312,258]],
       details: '<circle cx="178" cy="125" r="7" fill="#2a2421"/><circle cx="212" cy="125" r="7" fill="#2a2421"/><path d="M190 140 h10 l-5 6 z" fill="#ff8fb7"/><path d="M195 146 q-8 10 -16 4 M195 146 q8 10 16 4 M160 140 h-24 M160 146 l-22 6 M230 140 h24 M230 146 l22 6" stroke="#2a2421" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M160 200 q35 10 70 0" stroke="#c46a1b" stroke-width="6" fill="none"/><path d="M155 72 L170 92 M235 72 L220 92" stroke="#ff8fb7" stroke-width="6"/>'},
      {name: 'Ett flygplan', fill: '#ffffff', pts: [[60,90],[88,90],[118,132],[300,130],[342,142],[356,156],[342,170],[250,172],[195,232],[165,232],[192,172],[100,170],[70,160]],
       details: '<path d="M250 172 L195 232 L165 232 L192 172 Z M60 90 L88 90 L118 132 L80 132 Z" fill="#3b7fe0" stroke="#222" stroke-width="3" stroke-linejoin="round"/><g fill="#7ec8f2" stroke="#222" stroke-width="2">' + [150, 180, 210, 240, 270].map(x => `<circle cx="${x}" cy="148" r="7"/>`).join('') + '</g><path d="M300 136 L330 142 L335 152 L305 150 Z" fill="#7ec8f2" stroke="#222" stroke-width="2"/>'},
      {name: 'En dinosaurie', fill: '#43b55a', pts: [[40,200],[110,170],[170,140],[240,140],[270,110],[290,60],[310,45],[340,50],[345,65],[315,72],[300,120],[290,170],[285,250],[260,250],[250,205],[195,205],[190,250],[165,250],[160,200],[110,195]],
       details: '<circle cx="322" cy="56" r="4.5" fill="#222"/><path d="M332 66 q6 3 10 0" stroke="#222" stroke-width="2.5" fill="none"/><g fill="#2f8a3f">' + [[140,165],[175,150],[210,148],[245,150],[268,125]].map(([x,y]) => `<circle cx="${x}" cy="${y + 12}" r="8"/>`).join('') + '</g><path d="M175 160 q60 30 110 0" stroke="#8bd25f" stroke-width="14" fill="none" opacity=".6"/>'},
      {name: 'En fjäril', fill: '#9a5bd6', pts: [[200,90],[240,50],[320,40],[340,90],[300,145],[330,190],[300,250],[230,220],[200,170],[170,220],[100,250],[70,190],[100,145],[60,90],[80,40],[160,50]],
       details: '<g fill="#f5c02e" stroke="#222" stroke-width="2"><circle cx="280" cy="90" r="20"/><circle cx="120" cy="90" r="20"/><circle cx="275" cy="200" r="14"/><circle cx="125" cy="200" r="14"/></g><g fill="#ff8fb7"><circle cx="300" cy="70" r="7"/><circle cx="100" cy="70" r="7"/></g><path d="M200 70 L200 200" stroke="#2a2421" stroke-width="14" stroke-linecap="round"/><path d="M196 72 q-14 -30 -26 -34 M204 72 q14 -30 26 -34" stroke="#2a2421" stroke-width="3" fill="none" stroke-linecap="round"/>'}
    ]
  };
  const HINT_MS = 5000;

  function start(root, opts){
    opts = opts || {};
    const level = opts.level === 'big' ? 'big' : 'small';
    const LIST = PICS[level];
    const store = opts.storage || {get(){ return null; }, set(){}};
    const key = 'bilder-' + level;
    let prog = null;
    try{ prog = JSON.parse(store.get(key) || 'null'); }catch(e){}
    if(!prog || !Array.isArray(prog.done)) prog = {current: 0, done: []};
    prog.done = LIST.map((_, i) => !!prog.done[i]);
    if(!(prog.current >= 0 && prog.current < LIST.length)) prog.current = 0;
    const save = () => { try{ store.set(key, JSON.stringify(prog)); }catch(e){} };

    if(!document.getElementById('pp-css')){
      const s = document.createElement('style'); s.id = 'pp-css'; s.textContent = CSS; document.head.append(s);
    }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'pp';
    el.innerHTML = `
      <div class="pp-top"><div class="pp-title">Prick till prick</div><div class="pp-pics" role="group" aria-label="Bilder"></div><button type="button" class="pp-new">Börja om</button></div>
      <div class="pp-board"><div class="pp-end" aria-live="polite"><div class="big"></div><button type="button">Nästa bild</button></div></div>`;
    root.append(el);
    const board = el.querySelector('.pp-board'), picsEl = el.querySelector('.pp-pics'), endEl = el.querySelector('.pp-end'), newBtn = el.querySelector('.pp-new');

    // ---------- Ljud ----------
    let ac = null;
    function tone(freqs, vol){
      if(!opts.sound) return;
      try{
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        freqs.forEach((f, i) => {
          const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * 0.11;
          o.type = 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
          o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.25);
        });
      }catch(e){}
    }
    const WORD = ['', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv', 'tretton', 'fjorton', 'femton', 'sexton', 'sjutton', 'arton', 'nitton', 'tjugo'];
    function say(text){
      if(!opts.sound || !window.speechSynthesis) return;
      try{
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'sv-SE'; u.rate = 1;
        const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.replace('_', '-').startsWith('sv'));
        if(v) u.voice = v;
        speechSynthesis.speak(u);
      }catch(e){}
    }

    // ---------- En bild ----------
    let P = null, next = 1, svg = null, dotsG = null, linesG = null, hintTimer = null, finished = false;
    const NS = 'http://www.w3.org/2000/svg';

    function renderPics(){
      picsEl.innerHTML = '';
      LIST.forEach((p, i) => {
        const b = document.createElement('button'); b.type = 'button';
        b.className = 'pp-pic' + (prog.done[i] ? ' done' : '') + (i === prog.current ? ' cur' : '');
        b.textContent = i + 1; b.setAttribute('aria-label', `Bild ${i + 1}` + (prog.done[i] ? ', klar' : ''));
        b.addEventListener('click', () => { resetBtn(); load(i); });
        picsEl.append(b);
      });
    }

    function load(i){
      prog.current = i; save(); renderPics();
      P = LIST[i]; next = 1; finished = false;
      endEl.classList.remove('on'); board.classList.remove('won');
      if(svg) svg.remove();
      const pts = P.pts, cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
      const poly = pts.map(p => p.join(',')).join(' ');
      const labels = pts.map(([x, y], k) => {
        const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1;
        return `<text x="${(x + dx / d * 20).toFixed(1)}" y="${(y + dy / d * 20).toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="15" font-weight="800" fill="#1D2842" font-family="system-ui,sans-serif">${k + 1}</text>`;
      }).join('');
      board.insertAdjacentHTML('afterbegin', `<svg viewBox="0 0 400 300" role="img" aria-label="Prick till prick">
        <g class="pp-color"><polygon points="${poly}" fill="${P.fill}" stroke="#222" stroke-width="5" stroke-linejoin="round"/>${P.details}</g>
        <g class="pp-lines" stroke="#2a2a2a" stroke-width="4" stroke-linecap="round"></g>
        <g class="pp-dots">${labels}${pts.map(([x, y], k) => `<circle class="pp-dot" data-n="${k + 1}" cx="${x}" cy="${y}" r="7" fill="#2a2a2a" style="transform-box:fill-box;transform-origin:center"/>`).join('')}</g>
      </svg>`);
      svg = board.querySelector('svg'); dotsG = svg.querySelector('.pp-dots'); linesG = svg.querySelector('.pp-lines');
      svg.addEventListener('pointerdown', down);
      mark();
    }

    // Markera nästa prick. På liten nivå blinkar den hela tiden, på stor efter en stund utan framsteg.
    function mark(){
      clearTimeout(hintTimer);
      dotsG.querySelectorAll('.pp-dot').forEach(d => {
        const n = +d.dataset.n;
        d.classList.remove('next');
        d.setAttribute('fill', n < next ? '#3b7fe0' : '#2a2a2a');
        d.setAttribute('r', n < next ? 6 : 7);
      });
      const nd = dotsG.querySelector(`[data-n="${next}"]`);
      if(!nd) return;
      if(level === 'small' || next === 1) nd.classList.add('next');
      else hintTimer = setTimeout(() => nd.classList.add('next'), HINT_MS);
    }

    function toSvg(e){
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    }
    function hitDot(p){
      let best = null, bd = 26;
      P.pts.forEach(([x, y], k) => { const d = Math.hypot(p.x - x, p.y - y); if(d < bd){ bd = d; best = k + 1; } });
      return best;
    }

    function down(e){
      if(finished) return;
      e.preventDefault();
      svg.setPointerCapture && svg.setPointerCapture(e.pointerId);
      const n = hitDot(toSvg(e));
      if(n) tap(n, true);
      // Dra fingret vidare: varje rätt prick man passerar kopplas på.
      const move = ev => { if(finished) return; const m = hitDot(toSvg(ev)); if(m === next) tap(m, false); };
      const up = () => { svg.removeEventListener('pointermove', move); svg.removeEventListener('pointerup', up); svg.removeEventListener('pointercancel', up); };
      svg.addEventListener('pointermove', move); svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
    }

    function tap(n, fromTap){
      if(n < next) return;                               // redan klar prick: inget händer
      if(n !== next){
        if(!fromTap) return;
        const d = dotsG.querySelector(`[data-n="${n}"]`);
        d.classList.remove('no'); void d.getBoundingClientRect(); d.classList.add('no');
        tone([280], 0.05);
        return;
      }
      if(n > 1) addLine(P.pts[n - 2], P.pts[n - 1]);
      tone([392 + n * 18], 0.1);
      say(WORD[n] || String(n));
      next++;
      if(next > P.pts.length) complete(); else mark();
    }
    function addLine(a, b){
      const l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', a[0]); l.setAttribute('y1', a[1]); l.setAttribute('x2', b[0]); l.setAttribute('y2', b[1]);
      linesG.append(l);
    }

    function complete(){
      finished = true; clearTimeout(hintTimer);
      addLine(P.pts[P.pts.length - 1], P.pts[0]);       // stäng figuren
      mark();
      setTimeout(() => {
        svg.querySelector('.pp-color').classList.add('on');
        dotsG.classList.add('fade');
        tone([523, 659, 784, 1047]);
        say(P.name + '!');
      }, 400);
      prog.done[prog.current] = true; save(); renderPics();
      const last = prog.current === LIST.length - 1;
      endEl.querySelector('.big').textContent = P.name + '!';
      setTimeout(() => board.classList.add('won'), 1200);
      endEl.querySelector('button').textContent = last ? 'Börja om från bild 1' : 'Nästa bild';
      setTimeout(() => endEl.classList.add('on'), 1300);
      if(typeof opts.onFinish === 'function') opts.onFinish();
    }

    endEl.querySelector('button').addEventListener('click', () => load((prog.current + 1) % LIST.length));
    let sureTimer = null;
    function resetBtn(){ clearTimeout(sureTimer); newBtn.classList.remove('sure'); newBtn.textContent = 'Börja om'; }
    newBtn.addEventListener('click', () => {
      if(finished || next === 1){ resetBtn(); load(prog.current); return; }
      if(!newBtn.classList.contains('sure')){
        newBtn.classList.add('sure'); newBtn.textContent = 'Tryck igen för att börja om';
        sureTimer = setTimeout(resetBtn, 3000);
        return;
      }
      resetBtn(); load(prog.current);
    });

    load(prog.current);

    return {
      stop(){
        clearTimeout(hintTimer); clearTimeout(sureTimer);
        try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
        try{ if(ac) ac.close(); }catch(e){}
        root.innerHTML = '';
      }
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'prickar', title: 'Prick till prick', icon: '✏️',
    about: 'Tryck eller dra mellan prickarna i nummerordning. När sista strecket är draget färgläggs bilden. Liten: 6 bilder med 7–10 prickar och blinkande nästa prick. Stor: 5 bilder med 13–20 prickar.',
    start,
    _test: {PICS}
  });
})();
