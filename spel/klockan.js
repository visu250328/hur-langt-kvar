/* Klockan – lär dig klockan. Liten nivå: hela timmar, dra den lilla visaren eller tryck på en siffra.
   Stor nivå: ställ klockan (dra minutvisaren, timvisaren följer med som på en riktig klocka) eller välj vad
   klockan är bland tre svar. Svårigheten ökar: hel och halv, sedan kvart över och kvart i, sedan femminuter.
   Inget heter fel: står visarna fel händer inget, ett fel svar blir bara grått, och efter en stund syns en
   skuggvisare som ledtråd. Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.kl{height:100%;display:flex;flex-direction:column;gap:10px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.kl-top{display:flex;align-items:center;gap:12px;min-height:44px;flex-wrap:wrap}
.kl-title{font-size:1.7rem;font-weight:800;line-height:1;margin-right:auto}
.kl-stars{font-size:1.4rem;letter-spacing:2px}
.kl-main{flex:1;min-height:0;display:flex;gap:20px;align-items:center;justify-content:center}
.kl-main.port{flex-direction:column}
.kl-clock{flex:none;touch-action:none}
.kl-clock svg{width:100%;height:100%;display:block}
.kl-side{display:flex;flex-direction:column;gap:14px;align-items:center;max-width:420px;text-align:center}
.kl-task{font-size:clamp(1.4rem,4.4vmin,2.3rem);font-weight:800;line-height:1.15;text-transform:uppercase;letter-spacing:.03em}
.kl-task b{color:#c9342a}
.kl-said{font-size:1.25rem;font-weight:800;color:var(--muted,#56617A);min-height:1.6em;text-transform:uppercase;letter-spacing:.03em}
.kl-opts{display:flex;flex-direction:column;gap:10px;width:100%}
.kl-opt{border:0;border-radius:18px;background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;font-size:1.35rem;padding:12px 20px;cursor:pointer;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);text-transform:uppercase;letter-spacing:.03em}
.kl-opt.no{opacity:.35;animation:kl-shake .35s ease}
.kl-opt.yes{background:#43b55a;color:#fff;box-shadow:none}
.kl-hand{cursor:grab}
.kl-num{cursor:pointer}
.kl-end{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:color-mix(in srgb,var(--sky,#DCEAF6) 70%,transparent);z-index:5}
.kl-end.on{display:flex}
.kl-end .kl-big{font-size:clamp(2rem,7vmin,3.4rem);font-weight:800;text-align:center}
.kl-end button{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.2rem;font-weight:800;border-radius:18px;padding:10px 24px;cursor:pointer}
.kl button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
@keyframes kl-shake{0%,100%{transform:translateX(0)}30%{transform:translateX(-6px)}70%{transform:translateX(6px)}}`;

  const WORD = ['tolv', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv'];
  const hw = h => WORD[((h - 1) % 12 + 12) % 12 + 1];
  // Svenska klockord för timme h (1–12) och minut m (0–55).
  // Med num skrivs timmar och minuter med siffror (8, halv 4, 5 över 3); utan num med ord, för rösten.
  function say(h, m, num){
    const n = h % 12 + 1;   // nästa timme
    const H = x => num ? String(((x - 1) % 12 + 12) % 12 + 1) : hw(x);
    const M = {5: num ? '5' : 'fem', 10: num ? '10' : 'tio', 20: num ? '20' : 'tjugo'};
    return {0: H(h), 5: M[5] + ' över ' + H(h), 10: M[10] + ' över ' + H(h), 15: 'kvart över ' + H(h), 20: M[20] + ' över ' + H(h),
      25: M[5] + ' i halv ' + H(n), 30: 'halv ' + H(n), 35: M[5] + ' över halv ' + H(n), 40: M[20] + ' i ' + H(n),
      45: 'kvart i ' + H(n), 50: M[10] + ' i ' + H(n), 55: M[5] + ' i ' + H(n)}[m];
  }
  // Steg: vilka minuter som kan förekomma.
  const STAGES = [[0, 30], [0, 15, 30, 45], [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]];
  const ROUND = 5;   // uppgifter per omgång

  function start(root, opts){
    opts = opts || {};
    const big = opts.level === 'big';
    const store = opts.storage || {get(){ return null; }, set(){}};
    let stage = big ? Math.min(2, parseInt(store.get('steg') || '0', 10) || 0) : 0;
    const saveStage = () => { try{ store.set('steg', String(stage)); }catch(e){} };

    if(!document.getElementById('kl-css')){ const s = document.createElement('style'); s.id = 'kl-css'; s.textContent = CSS; document.head.append(s); }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'kl';
    el.innerHTML = `<div class="kl-top"><div class="kl-title">Klockan</div><div class="kl-stars" aria-live="polite"></div></div>
      <div class="kl-main"><div class="kl-clock"></div><div class="kl-side"><div class="kl-task" aria-live="polite"></div><div class="kl-opts" role="group"></div><div class="kl-said" aria-live="polite"></div></div></div>
      <div class="kl-end" role="dialog" aria-live="polite"><div class="kl-big"></div><button type="button">Fortsätt</button></div>`;
    root.append(el);
    const main = el.querySelector('.kl-main'), clockEl = el.querySelector('.kl-clock'), taskEl = el.querySelector('.kl-task'), optsEl = el.querySelector('.kl-opts');
    const saidEl = el.querySelector('.kl-said'), starsEl = el.querySelector('.kl-stars'), endEl = el.querySelector('.kl-end');

    let ac = null;
    function tone(freqs, vol, type, gap){
      if(!opts.sound) return;
      try{ ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        freqs.forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * (gap || 0.09);
          o.type = type || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.1, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
          o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.25); }); }catch(e){}
    }
    function speak(text){
      if(!opts.sound || !window.speechSynthesis) return;
      try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'sv-SE'; u.rate = 0.95;
        const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.replace('_', '-').startsWith('sv')); if(v) u.voice = v; speechSynthesis.speak(u); }catch(e){}
    }
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    const clearAll = () => { timers.forEach(clearTimeout); timers.clear(); };

    // ---------- Urtavlan ----------
    const NS = 'http://www.w3.org/2000/svg';
    clockEl.innerHTML = `<svg viewBox="0 0 300 300" aria-label="Klocka">
      <circle cx="150" cy="150" r="144" fill="#2f6fd6"/><circle cx="150" cy="150" r="134" fill="#fff"/>
      ${Array.from({length: 60}, (_, i) => { const a = i * 6 * Math.PI / 180, r1 = i % 5 ? 126 : 118; return `<line x1="${150 + Math.sin(a) * r1}" y1="${150 - Math.cos(a) * r1}" x2="${150 + Math.sin(a) * 130}" y2="${150 - Math.cos(a) * 130}" stroke="#1D2842" stroke-width="${i % 5 ? 1.5 : 3.5}"/>`; }).join('')}
      ${Array.from({length: 12}, (_, i) => { const h = i + 1, a = h * 30 * Math.PI / 180; return `<g class="kl-num" data-h="${h}"><circle cx="${150 + Math.sin(a) * 96}" cy="${150 - Math.cos(a) * 96}" r="19" fill="transparent"/><text x="${150 + Math.sin(a) * 96}" y="${150 - Math.cos(a) * 96 + 1}" font-size="26" font-weight="800" text-anchor="middle" dominant-baseline="middle" fill="#1D2842" font-family="system-ui,sans-serif">${h}</text></g>`; }).join('')}
      <g class="kl-ghost" opacity="0"><line class="gh" x1="150" y1="150" x2="150" y2="85" stroke="#2f6fd6" stroke-width="10" stroke-linecap="round" opacity=".3"/><line class="gm" x1="150" y1="150" x2="150" y2="40" stroke="#e8302a" stroke-width="6" stroke-linecap="round" opacity=".3"/></g>
      <g class="kl-hand" data-h="h"><line x1="150" y1="150" x2="150" y2="85" stroke="#2f6fd6" stroke-width="12" stroke-linecap="round"/><line x1="150" y1="150" x2="150" y2="85" stroke="transparent" stroke-width="40"/></g>
      <g class="kl-hand" data-h="m"><line x1="150" y1="150" x2="150" y2="36" stroke="#e8302a" stroke-width="7" stroke-linecap="round"/><line x1="150" y1="150" x2="150" y2="36" stroke="transparent" stroke-width="40"/></g>
      <circle cx="150" cy="150" r="9" fill="#1D2842"/></svg>`;
    const svg = clockEl.querySelector('svg'), hourG = svg.querySelector('[data-h="h"]'), minG = svg.querySelector('[data-h="m"]'), ghost = svg.querySelector('.kl-ghost');
    let total = 0;   // minuter sedan tolv, 0–719
    const hOf = t => { const h = Math.floor(((t % 720) + 720) % 720 / 60); return h === 0 ? 12 : h; }, mOf = t => ((t % 60) + 60) % 60;
    function setHands(t){
      total = ((t % 720) + 720) % 720;
      hourG.setAttribute('transform', `rotate(${total / 2} 150 150)`); minG.setAttribute('transform', `rotate(${mOf(total) * 6} 150 150)`);
    }
    function setGhost(t, on){ svg.querySelector('.gh').setAttribute('transform', `rotate(${(t % 720) / 2} 150 150)`); svg.querySelector('.gm').setAttribute('transform', `rotate(${mOf(t) * 6} 150 150)`); ghost.setAttribute('opacity', on ? 1 : 0); }

    // ---------- Uppgifter ----------
    let task = null, score = 0, hintTimer = null, busy = false;
    function pickTime(){
      const ms = big ? STAGES[stage] : [0], h = 1 + Math.floor(Math.random() * 12), m = ms[Math.floor(Math.random() * ms.length)];   // liten nivå: bara hela timmar
      return {h, m, t: (h % 12) * 60 + m};
    }
    function paintStars(){ starsEl.textContent = '⭐'.repeat(score) + '☆'.repeat(ROUND - score); }
    function next(){
      clearAll(); busy = false; saidEl.textContent = ''; optsEl.innerHTML = ''; setGhost(0, false);
      let tt = pickTime(); while(task && tt.t === task.t) tt = pickTime();
      // Stor nivå: varannan uppgift är "Vad är klockan?"; liten nivå alltid "Ställ klockan".
      const kind = big && score % 2 === 1 ? 'read' : 'set';
      task = {...tt, kind};
      if(kind === 'set'){
        taskEl.innerHTML = `Ställ klockan på <b>${say(tt.h, tt.m)}</b>!`;
        // Börja en bit ifrån målet, aldrig på målet.
        let s = big ? (tt.t + 120 + Math.floor(Math.random() * 6) * 60) % 720 : ((tt.h + 2 + Math.floor(Math.random() * 7)) % 12) * 60;
        setHands(s);
        hintTimer = later(() => setGhost(tt.t, true), big ? 15000 : 10000);
        speak('Ställ klockan på ' + say(tt.h, tt.m));
      }else{
        taskEl.textContent = 'Vad är klockan?';
        setHands(tt.t);
        const others = new Set([tt.t]); const choices = [tt];
        while(choices.length < 3){ const o = pickTime(); if(!others.has(o.t) && say(o.h, o.m) !== say(tt.h, tt.m)){ others.add(o.t); choices.push(o); } }
        choices.sort(() => Math.random() - 0.5).forEach(c => {
          const b = document.createElement('button'); b.type = 'button'; b.className = 'kl-opt'; b.textContent = say(c.h, c.m);
          b.addEventListener('click', () => answer(b, c)); optsEl.append(b);
        });
      }
    }
    function answer(b, c){
      if(busy || b.classList.contains('no')) return;
      if(c.t === task.t){ b.classList.add('yes'); success(); }
      else { b.classList.add('no'); tone([300], 0.05, 'triangle'); }
    }
    function check(){
      if(busy || !task || task.kind !== 'set') return;
      const ok = big ? total === task.t : hOf(total) === task.h;
      if(ok) success();
    }
    function success(){
      busy = true; clearTimeout(hintTimer); setGhost(0, false);
      saidEl.textContent = 'Klockan är ' + say(task.h, task.m) + '!'; speak('Klockan är ' + say(task.h, task.m) + '!');
      [659, 784, 1047].forEach((f, i) => later(() => tone([f], 0.1), i * 100));
      score++; paintStars();
      if(score >= ROUND) later(roundDone, 1800); else later(next, 2200);
    }
    function roundDone(){
      // Stor nivå: en hel omgång rätt flyttar upp ett steg (hel/halv → kvart → femminuter).
      let msg = 'Bra jobbat! 🎉';
      if(big && stage < 2){ stage++; saveStage(); msg = stage === 1 ? 'Nu kan du hel och halv! Nu kommer kvart! 🎉' : 'Nu kan du kvart! Nu kommer fem över och tio i! 🎉'; }
      endEl.querySelector('.kl-big').textContent = msg; endEl.classList.add('on');
      [523, 659, 784, 1047].forEach((f, i) => later(() => tone([f], 0.1), i * 110));
      if(typeof opts.onFinish === 'function') opts.onFinish();
    }
    endEl.querySelector('button').addEventListener('click', () => { endEl.classList.remove('on'); score = 0; paintStars(); next(); });

    // ---------- Dra visarna ----------
    const angleOf = e => { const r = svg.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * 300 - 150, y = (e.clientY - r.top) / r.height * 300 - 150; return (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360; };
    let drag = null;
    function startDrag(e, which){
      if(busy || !task || task.kind !== 'set') return;
      if(which === 'm' && !big) which = 'h';   // liten nivå: bara timmar
      e.preventDefault(); e.stopPropagation(); try{ svg.setPointerCapture(e.pointerId); }catch(x){}
      drag = {which, lastA: angleOf(e), x0: e.clientX, y0: e.clientY, moved: false, e0: e}; clearTimeout(hintTimer); setGhost(0, false);
    }
    hourG.addEventListener('pointerdown', e => startDrag(e, 'h'));
    minG.addEventListener('pointerdown', e => startDrag(e, 'm'));
    svg.addEventListener('pointermove', e => {
      if(!drag) return;
      if(!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 8) return;
      drag.moved = true;
      const a = angleOf(e);
      if(drag.which === 'm'){
        // Minutvisaren: följ vinkeln, räkna varv så att timvisaren följer med. Hoppar i steg om 5 minuter.
        let d = a - drag.lastA; if(d > 180) d -= 360; if(d < -180) d += 360; drag.lastA = a;
        drag.acc = (drag.acc == null ? total : drag.acc) + d / 6;
        const snapped = Math.round(drag.acc / 5) * 5;
        if(((snapped % 720) + 720) % 720 !== total){ setHands(snapped); tone([1800], 0.015, 'square'); }
      }else{
        // Timvisaren: hoppar till närmaste timme, minuterna står kvar.
        const h = Math.round(a / 30) % 12, t = h * 60 + (big ? mOf(total) : 0);
        if(t !== total){ setHands(t); tone([900], 0.03, 'square'); }
      }
    });
    // Ett kort tryck (utan att dra) på en visare som ligger över en siffra räknas som ett tryck på siffran.
    function tapNumber(e){
      const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 300 - 150, y = (e.clientY - r.top) / r.height * 300 - 150;
      if(Math.hypot(x, y) < 70) return;
      const h = Math.round(angleOf(e) / 30) % 12 || 12;
      setHands((h % 12) * 60 + (big ? mOf(total) : 0)); tone([700], 0.05);
    }
    const endDrag = () => { if(!drag) return; const d = drag; drag = null; if(!d.moved) tapNumber(d.e0); check(); if(!busy && task && task.kind === 'set') hintTimer = later(() => setGhost(task.t, true), big ? 15000 : 10000); };
    svg.addEventListener('pointerup', endDrag); svg.addEventListener('pointercancel', endDrag);
    // Liten nivå: tryck på en siffra så pekar den lilla visaren dit.
    svg.querySelectorAll('.kl-num').forEach(n => n.addEventListener('pointerdown', e => {
      if(busy || !task || task.kind !== 'set' || drag) return;
      e.preventDefault(); const h = +n.dataset.h;
      setHands((h % 12) * 60 + (big ? mOf(total) : 0)); tone([700], 0.05); check();
    }));

    function layout(){
      const W = main.clientWidth, H = main.clientHeight; if(!W || !H) return;
      const port = H > W; main.classList.toggle('port', port);
      const s = port ? Math.min(W - 10, H * 0.62) : Math.min(H - 10, W * 0.55);
      clockEl.style.width = s + 'px'; clockEl.style.height = s + 'px';
    }
    const ro = window.ResizeObserver ? new ResizeObserver(layout) : null; if(ro) ro.observe(main);
    layout(); paintStars(); next();

    return {
      stop(){ clearAll(); if(ro) ro.disconnect(); try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){} try{ if(ac) ac.close(); }catch(e){} root.innerHTML = ''; },
      _test: {task: () => task, total: () => total, setHands, check, score: () => score, stage: () => stage, say, busy: () => busy}
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'klockan', title: 'Klockan', icon: '🕒',
    about: 'Lär dig klockan! Liten: ställ den lilla visaren på rätt timme. Stor: ställ klockan på halv, kvart och fem över, och läs av vad klockan är. Svårigheten ökar efter hand.',
    start
  });
})();
