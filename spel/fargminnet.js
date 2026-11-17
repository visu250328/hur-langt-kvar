/* Färgminnet – fyra färgade knappar lyser i en ordning som barnet upprepar. Rätt hela vägen: ordningen blir
   en ton längre. Missar man visas den rätta knappen lugnt och ordningen blir två toner kortare, utan att det
   heter fel. Visa igen spelar upp ordningen en gång till. Rekordet sparas. Liten nivå: börjar med 2 toner och
   spelar långsamt. Stor nivå: börjar med 3 och spelar fortare ju längre ordningen blir.
   Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.fm{height:100%;display:flex;flex-direction:column;gap:10px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.fm-top{display:flex;align-items:center;gap:12px;min-height:44px;flex-wrap:wrap}
.fm-title{font-size:1.7rem;font-weight:800;line-height:1;margin-right:auto}
.fm-rec{font-weight:800;font-size:1.1rem;background:var(--card,#fff);border-radius:999px;padding:4px 14px;box-shadow:inset 0 0 0 2px var(--line,#C6D1DF)}
.fm-again{border:0;border-radius:999px;background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;padding:5px 14px;cursor:pointer;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF)}
.fm-again:disabled{opacity:.4;cursor:default}
.fm-area{flex:1;min-height:0;display:grid;place-items:center}
.fm-board{position:relative;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:4%;padding:4%;border-radius:50%;background:#2e343c;box-shadow:0 8px 0 #1d2128;box-sizing:border-box}
.fm-pad{border:0;cursor:pointer;display:grid;place-items:center;font-size:clamp(1.6rem,7vmin,3.4rem);color:rgba(255,255,255,.75);filter:brightness(.62) saturate(.85);transition:filter .12s,transform .12s;touch-action:manipulation}
.fm-pad:nth-child(1){border-radius:100% 12% 12% 12%}
.fm-pad:nth-child(2){border-radius:12% 100% 12% 12%}
.fm-pad:nth-child(3){border-radius:12% 12% 12% 100%}
.fm-pad:nth-child(4){border-radius:12% 12% 100% 12%}
.fm-pad.lit{filter:brightness(1.25) saturate(1.1);transform:scale(1.03);box-shadow:0 0 30px 6px rgba(255,255,255,.5)}
.fm-pad.calm{animation:fm-calm 1s ease-in-out 2}
.fm-board.locked .fm-pad{cursor:default}
.fm-mid{position:absolute;left:50%;top:50%;width:34%;height:34%;transform:translate(-50%,-50%);border-radius:50%;background:#f4f6f8;box-shadow:0 0 0 8px #2e343c;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;text-align:center;pointer-events:none}
.fm-msg{font-weight:800;font-size:clamp(.9rem,3.4vmin,1.6rem);line-height:1.1;color:#1D2842;padding:0 6px}
.fm-dots{display:flex;flex-wrap:wrap;justify-content:center;gap:4px;max-width:80%}
.fm-dots i{width:clamp(7px,1.6vmin,12px);height:clamp(7px,1.6vmin,12px);border-radius:50%;background:#c6d1df}
.fm-dots i.on{background:#43b55a}
.fm button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
@keyframes fm-calm{0%,100%{filter:brightness(.62)}50%{filter:brightness(1.2)}}
@media (prefers-reduced-motion: reduce){ .fm-pad{transition:none} .fm-pad.calm{animation:none;filter:brightness(1.1)} }`;

  // Färg, symbol och ton per knapp (tonerna ligger i en glad dur-treklang så att alla ordningar låter bra).
  const PADS = [
    {col: '#e8302a', sym: '★', name: 'röd', f: 392.0},
    {col: '#2f6fd6', sym: '●', name: 'blå', f: 523.3},
    {col: '#f5c02e', sym: '▲', name: 'gul', f: 659.3},
    {col: '#43b55a', sym: '■', name: 'grön', f: 784.0}
  ];

  function start(root, opts){
    opts = opts || {};
    const big = opts.level === 'big', START = big ? 3 : 2;
    const store = opts.storage || {get(){ return null; }, set(){}};
    let best = parseInt(store.get('rekord-' + (big ? 'big' : 'small')) || '0', 10) || 0;

    if(!document.getElementById('fm-css')){ const s = document.createElement('style'); s.id = 'fm-css'; s.textContent = CSS; document.head.append(s); }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'fm';
    el.innerHTML = `<div class="fm-top"><div class="fm-title">Färgminnet</div><div class="fm-rec" aria-live="polite"></div><button type="button" class="fm-again">👀 Visa igen</button></div>
      <div class="fm-area"><div class="fm-board" role="group" aria-label="Fyra färgade knappar">
        ${PADS.map((p, i) => `<button type="button" class="fm-pad" data-i="${i}" style="background:${p.col}" aria-label="${p.name}">${p.sym}</button>`).join('')}
        <div class="fm-mid"><div class="fm-msg" aria-live="polite"></div><div class="fm-dots"></div></div></div></div>`;
    root.append(el);
    const area = el.querySelector('.fm-area'), board = el.querySelector('.fm-board'), pads = [...el.querySelectorAll('.fm-pad')];
    const msgEl = el.querySelector('.fm-msg'), dotsEl = el.querySelector('.fm-dots'), recEl = el.querySelector('.fm-rec'), againBtn = el.querySelector('.fm-again');

    let ac = null;
    function note(f, dur, vol, type){
      if(!opts.sound) return;
      try{ ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
        o.type = type || 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.16, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.02); }catch(e){}
    }
    function say(text){
      if(!opts.sound || !window.speechSynthesis) return;
      try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'sv-SE';
        const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.replace('_', '-').startsWith('sv')); if(v) u.voice = v; speechSynthesis.speak(u); }catch(e){}
    }
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    const clearAll = () => { timers.forEach(clearTimeout); timers.clear(); };

    let seq = [], pos = 0, phase = 'show', finishedOnce = false;
    const paintRec = () => { recEl.textContent = `🏆 Rekord: ${best}`; };
    function paintDots(){ dotsEl.innerHTML = seq.map((_, i) => `<i class="${i < pos ? 'on' : ''}"></i>`).join(''); }
    const msg = t => { msgEl.textContent = t; };
    const speed = () => big ? Math.max(330, 620 - seq.length * 25) : 760;   // tid per ton i ms
    function flash(i, ms){ const p = pads[i]; p.classList.add('lit'); note(PADS[i].f, Math.min(0.5, ms / 1000 * 0.8)); later(() => p.classList.remove('lit'), ms * 0.65); }
    function lock(on){ board.classList.toggle('locked', on); againBtn.disabled = on; }
    // Visa ordningen: knapparna lyser en i taget, sedan är det barnets tur.
    function show(){
      clearAll(); phase = 'show'; pos = 0; lock(true); paintDots(); msg('Titta!');
      const ms = speed();
      seq.forEach((i, k) => later(() => flash(i, ms), 700 + k * ms));
      later(() => { phase = 'input'; lock(false); msg('Din tur!'); }, 700 + seq.length * ms);
    }
    function grow(){ seq.push(Math.floor(Math.random() * 4)); }
    function newRound(len){ seq = []; for(let k = 0; k < len; k++) grow(); show(); }
    function press(i){
      if(phase !== 'input') return;
      flash(i, 420);
      if(i === seq[pos]){
        pos++; paintDots();
        if(pos === seq.length){
          phase = 'wait'; lock(true);
          const len = seq.length;
          if(len > best){ best = len; try{ store.set('rekord-' + (big ? 'big' : 'small'), String(best)); }catch(e){} paintRec(); }
          msg(len >= 3 && len === best ? 'Nytt rekord!' : 'Bra!');
          later(() => [523, 659, 784].forEach((f, k) => later(() => note(f, 0.18, 0.1, 'sine'), k * 90)), 250);
          if(len === best && len >= (big ? 6 : 4)) later(() => say(`${len} i rad! Nytt rekord!`), 300);
          if(!finishedOnce && len >= (big ? 8 : 5)){ finishedOnce = true; if(typeof opts.onFinish === 'function') opts.onFinish(); }
          later(() => { grow(); show(); }, 1500);
        }
      }else{
        // Inte rätt: visa lugnt vilken knapp det var, och fortsätt med en kortare ordning. Inget "fel".
        phase = 'wait'; lock(true);
        const right = seq[pos];
        later(() => { pads[right].classList.add('calm'); note(PADS[right].f, 0.5, 0.1, 'sine'); }, 350);
        msg('Det var den här!');
        later(() => { pads[right].classList.remove('calm'); msg('Vi tar en kortare'); }, 2400);
        later(() => newRound(Math.max(START, seq.length - 2)), 3600);
      }
    }
    pads.forEach((p, i) => p.addEventListener('pointerdown', e => { e.preventDefault(); press(i); }));
    pads.forEach((p, i) => p.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); press(i); } }));
    againBtn.addEventListener('click', () => { if(phase === 'input') show(); });
    const onKey = e => { const i = {ArrowUp: 0, ArrowRight: 1, ArrowLeft: 2, ArrowDown: 3, '1': 0, '2': 1, '3': 2, '4': 3}[e.key]; if(i != null){ e.preventDefault(); press(i); } };
    window.addEventListener('keydown', onKey);
    function layout(){ const s = Math.min(area.clientWidth, area.clientHeight) - 16; if(s > 0){ board.style.width = s + 'px'; board.style.height = s + 'px'; } }
    const ro = window.ResizeObserver ? new ResizeObserver(layout) : null; if(ro) ro.observe(area);
    paintRec(); layout(); newRound(START);

    return {
      stop(){ clearAll(); if(ro) ro.disconnect(); window.removeEventListener('keydown', onKey); try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){} try{ if(ac) ac.close(); }catch(e){} root.innerHTML = ''; },
      _test: {seq: () => seq.slice(), phase: () => phase, pos: () => pos, best: () => best, press}
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'fargminnet', title: 'Färgminnet', icon: '🔴',
    about: 'Knapparna lyser i en ordning – tryck i samma ordning! Ordningen blir en ton längre för varje gång. Liten: börjar med 2 toner och spelar långsamt. Stor: börjar med 3 och blir snabbare.',
    start
  });
})();
