/* Murbrytaren – flytta plattan med fingret och studsa bollen mot klossarna. Missar man bollen kommer en ny;
   inga liv tar slut. 5 banor där klossarna bildar en bild. Liten: bred platta, långsam boll. Stor: smalare
   platta, snabbare boll och mörka klossar som kräver två träffar. Följer spelbibliotekets gränssnitt. */
(function(){
  const CSS = `
.mb{height:100%;display:flex;flex-direction:column;gap:10px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.mb-top{display:flex;align-items:center;gap:10px;min-height:44px;flex-wrap:wrap}
.mb-title{font-size:1.7rem;font-weight:800;line-height:1;margin-right:auto}
.mb-banor{display:flex;gap:6px}
.mb-bana{width:36px;height:36px;border-radius:50%;border:0;background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;cursor:pointer;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);padding:0}
.mb-bana.done{background:var(--done,#F2B33D);color:#2B1E00;box-shadow:none}
.mb-bana.cur{box-shadow:0 0 0 3px var(--sky,#DCEAF6),0 0 0 6px var(--accent,#2F6FD6)}
.mb-area{flex:1;min-height:0;display:grid;place-items:center;touch-action:none;position:relative}
.mb-area canvas{border-radius:20px;touch-action:none;box-shadow:0 0 0 4px #3b4a6b}
.mb-note{position:absolute;left:50%;top:62%;transform:translate(-50%,-50%);background:rgba(255,255,255,.92);color:#1D2842;border-radius:16px;padding:8px 16px;font-weight:800;font-size:1.15rem;pointer-events:none;opacity:0;transition:opacity .3s;text-align:center}
.mb-note.on{opacity:1}
.mb-end{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:color-mix(in srgb,var(--sky,#DCEAF6) 70%,transparent);z-index:5}
.mb-end.on{display:flex}
.mb-end .big{font-size:clamp(2rem,7vmin,3.4rem);font-weight:800;text-align:center}
.mb-end .stars{font-size:3rem;animation:mb-hop .8s ease 2}
.mb-end button{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.2rem;font-weight:800;border-radius:18px;padding:10px 24px;cursor:pointer}
.mb button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
@keyframes mb-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-16px)}}`;

  const COL = {r: '#e8473c', o: '#f28a2e', y: '#f5c02e', g: '#43b55a', b: '#2f6fd6', p: '#9a5bd6', k: '#ff7ab0', w: '#eef1f5', n: '#8a5a2b', s: '#6b7584'};
  // Banorna: en rad per klossrad, 10 tecken per rad. Punkt = tomt. Versal = klossen kräver två träffar på stor nivå.
  const BANOR = [
    {name: 'Regnbågen', rows: ['RRRRRRRRRR', 'oooooooooo', 'YYYYYYYYYY', 'gggggggggg', 'BBBBBBBBBB', 'pppppppppp']},
    {name: 'Hjärtat', rows: ['.kk....kk.', 'kKKk..kKKk', 'kKKKkkKKKk', 'kKKKKKKKKk', '.kKKKKKKk.', '..kKKKKk..', '...kKKk...', '....kk....']},
    {name: 'Bilen', rows: ['...RRRR...', '..RbbbbR..', '.RRRRRRRR.', 'RRRRRRRRRR', 'RRyRRRRyRR', '.ss....ss.', '.ss....ss.']},
    {name: 'Glada gubben', rows: ['..YYYYYY..', '.YYYYYYYY.', 'YYsYYYYsYY', 'YYYYYYYYYY', 'YsYYYYYYsY', 'YYssssssYY', '.YYYYYYYY.', '..YYYYYY..']},
    {name: 'Fisken', rows: ['...oooo...', '.oOOOOoo.o', 'oOswOOOooo', 'oOOOOOOOoo', '.oOOOOoo.o', '...oooo...']}
  ];
  const W = 800, H = 600, BW = 72, BH = 28, GAP = 4, X0 = (W - (BW * 10 + GAP * 9)) / 2, Y0 = 50;

  function start(root, opts){
    opts = opts || {};
    const level = opts.level === 'big' ? 'big' : 'small';
    const P = level === 'big' ? {pw: 140, speed: 430} : {pw: 230, speed: 300};
    const store = opts.storage || {get(){ return null; }, set(){}};
    let prog = null;
    try{ prog = JSON.parse(store.get('banor-' + level) || 'null'); }catch(e){}
    if(!prog || !Array.isArray(prog.done)) prog = {current: 0, done: []};
    const save = () => { try{ store.set('banor-' + level, JSON.stringify(prog)); }catch(e){} };

    if(!document.getElementById('mb-css')){ const s = document.createElement('style'); s.id = 'mb-css'; s.textContent = CSS; document.head.append(s); }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'mb';
    el.innerHTML = `<div class="mb-top"><div class="mb-title">Murbrytaren</div><div class="mb-banor" role="group" aria-label="Banor"></div></div>
      <div class="mb-area"><canvas aria-label="Spelplan: dra fingret för att flytta plattan"></canvas><div class="mb-note"></div></div>
      <div class="mb-end" role="dialog" aria-live="polite"><div class="stars">🧱💥⭐</div><div class="big"></div><button type="button"></button></div>`;
    root.append(el);
    const cv = el.querySelector('canvas'), g = cv.getContext('2d'), area = el.querySelector('.mb-area'), noteEl = el.querySelector('.mb-note'), endEl = el.querySelector('.mb-end'), banorEl = el.querySelector('.mb-banor');

    let ac = null;
    function tone(f, vol, type, dur){
      if(!opts.sound) return;
      try{ ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        const o = ac.createOscillator(), gg = ac.createGain(), t = ac.currentTime;
        o.type = type || 'sine'; o.frequency.value = f; gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(vol || 0.1, t + 0.01); gg.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.12));
        o.connect(gg).connect(ac.destination); o.start(t); o.stop(t + (dur || 0.12) + 0.02); }catch(e){}
    }
    let noteTimer = null;
    const note = (t, ms) => { noteEl.textContent = t; noteEl.classList.add('on'); clearTimeout(noteTimer); if(ms) noteTimer = setTimeout(() => noteEl.classList.remove('on'), ms); };

    let bricks = [], px = W / 2, balls = [], stuck = true, sparks = [], finished = false, clock = 0, lastHit = 0;
    function renderBanor(){
      banorEl.innerHTML = '';
      BANOR.forEach((b, i) => {
        const btn = document.createElement('button'); btn.type = 'button';
        btn.className = 'mb-bana' + (prog.done[i] ? ' done' : '') + (i === prog.current ? ' cur' : '');
        btn.textContent = i + 1; btn.setAttribute('aria-label', `Bana ${i + 1}: ${b.name}` + (prog.done[i] ? ', klar' : ''));
        btn.addEventListener('click', () => load(i)); banorEl.append(btn);
      });
    }
    function load(i){
      prog.current = i; save(); renderBanor(); endEl.classList.remove('on'); finished = false;
      const rows = BANOR[i].rows, y0 = Y0 + (8 - rows.length) * (BH + GAP) / 2;
      bricks = [];
      rows.forEach((row, r) => [...row].forEach((ch, c) => {
        if(ch === '.') return;
        const lo = ch.toLowerCase(), hp = level === 'big' && ch !== lo ? 2 : 1;
        bricks.push({x: X0 + c * (BW + GAP), y: y0 + r * (BH + GAP), col: COL[lo], hp, max: hp});
      }));
      // Stjärnklossar: fyra per bana från bana 2, på samma platser varje gång (fast frö per bana).
      pw = {};
      if(i > 0){
        let seed = 7919 * (i + 1); const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
        const kinds = ['multi', 'wide', 'fire', 'slow'], idx = bricks.map((_, k) => k);
        for(let k = idx.length - 1; k > 0; k--){ const j = Math.floor(rnd() * (k + 1)); [idx[k], idx[j]] = [idx[j], idx[k]]; }
        idx.slice(0, 4).forEach((k, n) => { bricks[k].pu = kinds[n]; });
      }
      newBall(true); lastHit = clock;
      note(BANOR[i].name + ': tryck för att skjuta iväg bollen', 2500);
    }
    // ---------- Bollar och stjärnklossar ----------
    // Flera bollar kan vara i spel samtidigt. En ny boll kommer först när alla bollar har försvunnit.
    // pw: aktiva effekter från stjärnklossarna, med tiden (clock) då de tar slut.
    const PU = {
      multi: {icon: '🔵', text: 'Fler bollar!'},
      wide: {icon: '↔️', text: 'Bred platta!', secs: 15},
      fire: {icon: '🔥', text: 'Eldboll!', secs: 8},
      slow: {icon: '🐢', text: 'Långsam boll!', secs: 12}
    };
    let pw = {};
    const padW = () => P.pw * (pw.wide > clock ? 1.5 : 1);
    function newBall(first){
      stuck = true; balls = [{x: px, y: 548, vx: 0, vy: 0, r: 11}];
      if(!first) note('Ny boll! Tryck för att skjuta', 1600);
    }
    function launch(){
      if(!stuck || finished) return;
      stuck = false;
      const a = (-90 + (Math.random() * 40 - 20)) * Math.PI / 180, b = balls[0];
      b.vx = Math.cos(a) * P.speed; b.vy = Math.sin(a) * P.speed;
      tone(660, 0.08);
    }
    function powerUp(kind, x, y){
      const p = PU[kind];
      if(kind === 'multi'){
        // Två nya bollar från den boll som är högst upp, i lite olika riktningar.
        const src = balls.slice().sort((a, b) => a.y - b.y)[0] || {x, y, vx: 0, vy: -P.speed, r: 11};
        const sp = Math.max(P.speed * 0.8, Math.hypot(src.vx, src.vy)), base = Math.atan2(src.vy, src.vx);
        [-0.45, 0.45].forEach(d => { if(balls.length < 6){ const a = base + d; balls.push({x: src.x, y: src.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 11}); } });
      }else pw[kind] = clock + p.secs;
      note(p.icon + ' ' + p.text, 1500);
      [784, 988, 1319].forEach((f, i) => setTimeout(() => tone(f, 0.1, 'sine', 0.15), i * 70));
    }
    function burst(x, y, col){ for(let i = 0; i < 10; i++){ const a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 140; sparks.push({x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.6, col}); } }
    function step(dt){
      clock += dt;
      sparks.forEach(s => { s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 300 * dt; s.life -= dt; }); sparks = sparks.filter(s => s.life > 0);
      if(finished) return;
      const pwW = padW(); px = Math.max(pwW / 2, Math.min(W - pwW / 2, px));
      if(stuck){ const b = balls[0]; b.x = px; b.y = 560 - 18 - b.r; return; }
      const mdt = dt * (pw.slow > clock ? 0.65 : 1), fire = pw.fire > clock;
      const queued = [];
      balls = balls.filter(ball => {
        const n = Math.ceil(Math.hypot(ball.vx, ball.vy) * mdt / 6);   // små delsteg så att bollen inte går igenom klossar
        for(let k = 0; k < n; k++){
          const h = mdt / n;
          ball.x += ball.vx * h; ball.y += ball.vy * h;
          if(ball.x < ball.r){ ball.x = ball.r; ball.vx = Math.abs(ball.vx); tone(330, 0.04); }
          if(ball.x > W - ball.r){ ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); tone(330, 0.04); }
          if(ball.y < ball.r){ ball.y = ball.r; ball.vy = Math.abs(ball.vy); tone(330, 0.04); }
          // Plattan: studsvinkeln beror på var bollen träffar, så att barnet kan sikta.
          if(ball.vy > 0 && ball.y + ball.r >= 560 && ball.y + ball.r <= 578 && Math.abs(ball.x - px) <= pwW / 2 + ball.r){
            const off = Math.max(-1, Math.min(1, (ball.x - px) / (pwW / 2))), sp = Math.hypot(ball.vx, ball.vy);
            let a = (-90 + off * 60) * Math.PI / 180;
            // Osynlig hjälp: har ingen kloss träffats på 12 sekunder siktar studsen mot en kvarvarande kloss,
            // så att bollen aldrig fastnar i ett mönster som missar de sista klossarna.
            if(clock - lastHit > 12){
              const left = bricks.filter(b => b.hp > 0), t = left[Math.floor(Math.random() * left.length)];
              if(t){ a = Math.atan2(t.y + BH / 2 - ball.y, t.x + BW / 2 - ball.x); a = Math.max(-160 * Math.PI / 180, Math.min(-20 * Math.PI / 180, a)); lastHit = clock - 6; }
            }
            ball.vx = Math.cos(a) * sp; ball.vy = Math.sin(a) * sp; ball.y = 560 - ball.r; tone(440, 0.07);
          }
          if(ball.y - ball.r > H){ tone(200, 0.06, 'triangle', 0.25); return false; }
          for(const b of bricks){
            if(b.hp <= 0) continue;
            const cx = Math.max(b.x, Math.min(ball.x, b.x + BW)), cy = Math.max(b.y, Math.min(ball.y, b.y + BH));
            if((ball.x - cx) ** 2 + (ball.y - cy) ** 2 > ball.r * ball.r) continue;
            // Eldbollen går rakt igenom och krossar klossen direkt.
            if(fire) b.hp = 0;
            else {
              const ox = Math.min(ball.x + ball.r - b.x, b.x + BW - (ball.x - ball.r)), oy = Math.min(ball.y + ball.r - b.y, b.y + BH - (ball.y - ball.r));
              if(ox < oy) ball.vx = -ball.vx; else ball.vy = -ball.vy;
              b.hp--;
            }
            lastHit = clock;
            if(b.hp <= 0){ burst(b.x + BW / 2, b.y + BH / 2, fire ? '#ff8a2e' : b.col); tone(520 + Math.random() * 300, 0.09); if(b.pu){ queued.push([b.pu, b.x + BW / 2, b.y + BH / 2]); b.pu = null; } }
            else tone(260, 0.07, 'square');
            if(!fire) break;
          }
        }
        return true;
      });
      queued.forEach(q => powerUp(...q));
      if(!balls.length) newBall(false);
      if(bricks.every(b => b.hp <= 0)) win();
    }
    function win(){
      finished = true; prog.done[prog.current] = true; save(); renderBanor();
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.12, 'sine', 0.25), i * 110));
      const last = prog.current === BANOR.length - 1;
      endEl.querySelector('.big').textContent = prog.done.filter(Boolean).length === BANOR.length && last ? 'Alla murar är borta!' : 'Hela muren är borta!';
      endEl.querySelector('button').textContent = last ? 'Börja om från bana 1' : 'Nästa bana';
      setTimeout(() => endEl.classList.add('on'), 600);
      if(typeof opts.onFinish === 'function') opts.onFinish();
    }
    endEl.querySelector('button').addEventListener('click', () => load((prog.current + 1) % BANOR.length));
    function draw(){
      const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#20305a'); sky.addColorStop(1, '#3b4a6b');
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      bricks.forEach(b => {
        if(b.hp <= 0) return;
        g.fillStyle = b.col; roundRect(b.x, b.y, BW, BH, 6); g.fill();
        g.fillStyle = 'rgba(255,255,255,.35)'; roundRect(b.x + 4, b.y + 3, BW - 8, 6, 3); g.fill();
        if(b.max === 2 && b.hp === 2){ g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 3; roundRect(b.x + 2, b.y + 2, BW - 4, BH - 4, 5); g.stroke(); }
        if(b.max === 2 && b.hp === 1){ g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(b.x + 20, b.y + 4); g.lineTo(b.x + 34, b.y + 16); g.lineTo(b.x + 28, b.y + 25); g.stroke(); }
        if(b.pu){
          // Stjärnklossen: en vit rund bricka med stjärna, som pulserar lite så att den syns på alla färger.
          const k = 1 + Math.sin(clock * 5) * 0.08;
          g.fillStyle = '#fff'; g.beginPath(); g.arc(b.x + BW / 2, b.y + BH / 2, 12 * k, 0, Math.PI * 2); g.fill();
          g.font = `${Math.round(17 * k)}px system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('⭐', b.x + BW / 2, b.y + BH / 2 + 1);
        }
      });
      sparks.forEach(s => { g.globalAlpha = Math.max(0, s.life / 0.6); g.fillStyle = s.col; g.fillRect(s.x - 3, s.y - 3, 6, 6); }); g.globalAlpha = 1;
      const pwW = padW(), fire = pw.fire > clock;
      g.fillStyle = pw.wide > clock ? '#7ad6ff' : '#f5c02e'; roundRect(px - pwW / 2, 560, pwW, 18, 9); g.fill();
      g.fillStyle = 'rgba(255,255,255,.5)'; roundRect(px - pwW / 2 + 8, 563, pwW - 16, 5, 3); g.fill();
      balls.forEach(b => {
        if(fire){ g.fillStyle = 'rgba(255,120,30,.45)'; g.beginPath(); g.arc(b.x, b.y, b.r + 7, 0, Math.PI * 2); g.fill(); }
        g.fillStyle = fire ? '#ffb02e' : '#fff'; g.beginPath(); g.arc(b.x, b.y, b.r, 0, Math.PI * 2); g.fill();
      });
      // Aktiva effekter uppe till vänster, med sekunder kvar.
      const act = ['wide', 'fire', 'slow'].filter(k => pw[k] > clock);
      g.font = '22px system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle';
      act.forEach((k, n) => { const x = 14 + n * 86; g.fillStyle = 'rgba(255,255,255,.85)'; roundRect(x, 12, 78, 30, 15); g.fill();
        g.fillStyle = '#1D2842'; g.fillText(PU[k].icon + ' ' + Math.ceil(pw[k] - clock), x + 10, 28); });
    }
    function roundRect(x, y, w, h, r){ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
    function layout(){
      const aw = area.clientWidth - 8, ah = area.clientHeight - 8; if(aw <= 0 || ah <= 0) return;
      const k = Math.min(aw / W, ah / H), dpr = window.devicePixelRatio || 1;
      cv.style.width = W * k + 'px'; cv.style.height = H * k + 'px'; cv.width = W * k * dpr; cv.height = H * k * dpr;
      g.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
    }
    // Plattan följer fingret i sidled; ett tryck skjuter iväg bollen.
    const toX = e => { const r = cv.getBoundingClientRect(); return (e.clientX - r.left) / r.width * W; };
    const movePad = e => { px = Math.max(padW() / 2, Math.min(W - padW() / 2, toX(e))); };
    cv.addEventListener('pointerdown', e => { e.preventDefault(); cv.setPointerCapture && cv.setPointerCapture(e.pointerId); movePad(e); launch(); });
    cv.addEventListener('pointermove', e => { if(e.buttons || e.pointerType === 'mouse') movePad(e); });
    const keys = {};
    const onKey = e => { if(e.key === 'ArrowLeft' || e.key === 'ArrowRight'){ keys[e.key] = e.type === 'keydown'; e.preventDefault(); } if(e.key === ' ' && e.type === 'keydown'){ launch(); e.preventDefault(); } };
    window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey);

    let raf = 0, last = 0;
    function frame(t){
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.033, (t - (last || t)) / 1000); last = t;
      if(keys.ArrowLeft) px = Math.max(padW() / 2, px - 600 * dt);
      if(keys.ArrowRight) px = Math.min(W - padW() / 2, px + 600 * dt);
      step(dt); draw();
    }
    const ro = window.ResizeObserver ? new ResizeObserver(layout) : null; if(ro) ro.observe(area);
    layout(); load(Math.min(prog.current || 0, BANOR.length - 1)); raf = requestAnimationFrame(frame);

    return {
      stop(){ cancelAnimationFrame(raf); clearTimeout(noteTimer); if(ro) ro.disconnect(); window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); try{ if(ac) ac.close(); }catch(e){} root.innerHTML = ''; },
      _test: {bricks: () => bricks, ball: () => balls.slice().sort((a, b) => b.y - a.y)[0], balls: () => balls, pw: () => pw, clock: () => clock, setPad: x => { px = x; }, launch, P, step: dt => step(dt), stuck: () => stuck, finished: () => finished, load}
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'murbrytaren', title: 'Murbrytaren', icon: '🧱',
    about: 'Flytta plattan med fingret och studsa bollen mot klossarna. Missar man bollen kommer en ny. 5 banor: regnbåge, hjärta, bil, glad gubbe och fisk. Stjärnklossar från bana 2 ger fler bollar, bred platta, eldboll eller långsam boll. Stor: smalare platta, snabbare boll och klossar som kräver två träffar.',
    start
  });
})();
