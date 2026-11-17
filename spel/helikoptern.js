/* Helikoptern – håll inne för att stiga, släpp för att sjunka, plocka stjärnor och landa på plattan.
   Byggt för baksätet: bara jämn sidledes rullning, inga skakningar, inga krascher och korta turer.
   Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.hk{height:100%;display:flex;flex-direction:column;gap:12px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.hk-top{display:flex;align-items:center;gap:14px;min-height:48px}
.hk-title{font-size:1.7rem;font-weight:800;line-height:1}
.hk-track{flex:1;position:relative;height:34px;min-width:120px}
.hk-track .line{position:absolute;left:14px;right:22px;top:50%;height:6px;margin-top:-3px;border-radius:3px;background:var(--line,#C6D1DF)}
.hk-track .done{position:absolute;left:14px;top:50%;height:6px;margin-top:-3px;border-radius:3px;background:var(--done,#F2B33D);width:0}
.hk-track .me{position:absolute;top:50%;font-size:26px;line-height:1;transform:translate(-50%,-55%) scaleX(-1)}
.hk-track .flag{position:absolute;right:0;top:50%;font-size:24px;line-height:1;transform:translateY(-55%)}
.hk-score{font-size:1.6rem;font-weight:800;line-height:1;background:var(--card,#fff);border-radius:999px;padding:6px 16px;box-shadow:inset 0 0 0 3px var(--done,#F2B33D)}
.hk-score.bump{animation:hk-bump .3s ease}
.hk-stage{flex:1;min-height:0;position:relative}
.hk-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;border-radius:22px;cursor:pointer}
.hk-start,.hk-end{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;
  background:color-mix(in srgb,var(--sky,#DCEAF6) 75%,transparent);border-radius:inherit;z-index:5}
.hk-start.on,.hk-end.on{display:flex}
.hk-play{border:0;width:150px;height:150px;border-radius:50%;background:var(--done,#F2B33D);color:#2B1E00;font-size:64px;cursor:pointer;display:grid;place-items:center;padding-left:10px;box-sizing:border-box}
.hk-hint{font-weight:700;font-size:1.15rem;opacity:.8}
.hk-hint .hand{font-size:2.4rem;display:block;line-height:1;margin-bottom:4px}
.hk-end .big{font-size:clamp(2.4rem,8vmin,4.5rem);font-weight:800;line-height:1}
.hk-end .stars{font-size:clamp(2.4rem,8vmin,4.5rem);line-height:1}
.hk-end .got{font-size:2.4rem;font-weight:800;line-height:1}
.hk-end.on .stars{animation:hk-hop .8s ease-out 2}
.hk-end button{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.3rem;font-weight:800;border-radius:18px;padding:12px 26px;cursor:pointer;margin-top:8px}
.hk-play:focus-visible,.hk-end button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
@keyframes hk-bump{50%{transform:scale(1.15)}}
@keyframes hk-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-18px)}}
@media (prefers-reduced-motion: reduce){ .hk-score.bump,.hk-end.on .stars{animation:none} }`;

  // Världen är 700 enheter hög; bredden beror på skärmen. Helikoptern står still i sidled
  // på 30 % av bredden och världen rullar förbi i jämn fart.
  const H = 700, TOP = 70;
  const LEVELS = {
    small: {speed: 160, gravity: 380, lift: 560, maxVy: 260, seconds: 60, gap: 460, shapes: ['line', 'wave']},
    big:   {speed: 220, gravity: 520, lift: 760, maxVy: 360, seconds: 60, gap: 320, shapes: ['wave', 'arc', 'dip', 'line']}
  };
  const STAR_R = 26, PICK = 46, HELI_X = 0.3;

  // Mjuka kullar: summan av några sinusvågor.
  const ground = x => 560 + 45 * Math.sin(x / 310) + 28 * Math.sin(x / 137 + 1.3) + 14 * Math.sin(x / 61 + 0.4);

  function makeStars(len, L){
    const stars = [];
    let x = 900;
    while(x < len - 700){
      const shape = L.shapes[Math.floor(Math.random() * L.shapes.length)], n = 5, step = 70;
      const low = Math.min(...Array.from({length: n}, (_, i) => ground(x + i * step))) - 110;
      const base = Math.max(170, low - Math.random() * 220);
      for(let i = 0; i < n; i++){
        const k = Math.sin(i / (n - 1) * Math.PI);
        let y = base;
        if(shape === 'wave') y = base - 50 * k;
        if(shape === 'arc') y = base - 150 * k;
        if(shape === 'dip') y = base + 110 * k;
        y = Math.max(TOP + 40, Math.min(ground(x + i * step) - 80, y));
        stars.push({x: x + i * step, y, got: false});
      }
      x += n * step + L.gap * (0.8 + Math.random() * 0.4);
    }
    return stars;
  }

  function start(root, opts){
    opts = opts || {};
    const level = opts.level === 'big' ? 'big' : 'small';
    const L = LEVELS[level], LEN = L.speed * L.seconds;

    if(!document.getElementById('hk-css')){
      const s = document.createElement('style'); s.id = 'hk-css'; s.textContent = CSS; document.head.append(s);
    }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'hk';
    el.innerHTML = `
      <div class="hk-top"><div class="hk-title">Helikoptern</div>
        <div class="hk-track" aria-hidden="true"><div class="line"></div><div class="done"></div><div class="me">🚁</div><div class="flag">🏁</div></div>
        <div class="hk-score" aria-live="polite">⭐ 0</div></div>
      <div class="hk-stage"><canvas class="hk-canvas" aria-label="Håll inne för att stiga, släpp för att sjunka"></canvas></div>
      <div class="hk-start on"><div class="hk-hint"><span class="hand">👆</span>Håll inne för att flyga upp</div><button type="button" class="hk-play" aria-label="Börja">▶</button></div>
      <div class="hk-end" role="dialog" aria-live="polite"><div class="stars">🚁</div><div class="big">Framme!</div><div class="got"></div><button type="button">Flyg igen</button></div>`;
    root.append(el);
    const stage = el.querySelector('.hk-stage'), canvas = el.querySelector('.hk-canvas'), ctx = canvas.getContext('2d');
    const scoreEl = el.querySelector('.hk-score'), startEl = el.querySelector('.hk-start'), endEl = el.querySelector('.hk-end');
    const trackDone = el.querySelector('.hk-track .done'), trackMe = el.querySelector('.hk-track .me'), track = el.querySelector('.hk-track');

    // ---------- Ljud ----------
    let ac = null;
    function tone(freqs, vol){
      if(!opts.sound) return;
      try{
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        freqs.forEach((f, i) => {
          const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * 0.1;
          o.type = 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.15, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
          o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.28);
        });
      }catch(e){}
    }

    // ---------- Skala ----------
    let view = {s: 1, w: 1200, cw: 0, ch: 0, dpr: 1};
    function resize(){
      const cw = stage.clientWidth, ch = stage.clientHeight, dpr = window.devicePixelRatio || 1;
      if(!cw || !ch) return;
      canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
      const s = ch / H;
      view = {s, w: cw / s, cw, ch, dpr};
      if(!running) draw(0);
    }
    const ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
    if(ro) ro.observe(stage); else window.addEventListener('resize', resize);

    // ---------- Turen ----------
    let running = false, paused = false, holding = false, raf = 0, last = 0, landing = null;
    let x, y, vy, stars, got, sparkles, rotor = 0, bumpTimer = 0;

    function reset(){
      x = 0; y = 300; vy = 0; got = 0; sparkles = []; landing = null;
      stars = makeStars(LEN, L);
      scoreEl.textContent = '⭐ 0';
      progress();
    }
    function begin(){
      startEl.classList.remove('on'); endEl.classList.remove('on');
      reset();
      running = true; holding = false; last = 0;
      tone([392, 523]);
    }

    function progress(){
      const k = Math.min(1, x / LEN), w = track.clientWidth - 36;
      trackDone.style.width = (k * w) + 'px';
      trackMe.style.left = (14 + k * w) + 'px';
    }

    function update(dt){
      if(landing){ land(dt); return; }
      x += L.speed * dt;
      vy += (holding ? -L.lift : L.gravity) * dt;
      vy = Math.max(-L.maxVy, Math.min(L.maxVy, vy));
      y += vy * dt;
      if(y < TOP){ y = TOP; vy = Math.max(vy, 0); }
      const gy = ground(x) - 34;
      if(y > gy){                         // mjuk studs mot backen, ingen krasch
        y = gy; vy = -150;
        if(bumpTimer <= 0){ tone([220, 330], 0.06); bumpTimer = 0.4; }
      }
      bumpTimer -= dt;
      rotor += dt * 30;
      stars.forEach(s => {
        if(!s.got && Math.hypot(s.x - x, s.y - y) < PICK){
          s.got = true; got++;
          sparkles.push({x: s.x, y: s.y, t: 0});
          scoreEl.textContent = '⭐ ' + got;
          scoreEl.classList.remove('bump'); void scoreEl.offsetWidth; scoreEl.classList.add('bump');
          tone([784 + (got % 4) * 60], 0.1);
        }
      });
      sparkles.forEach(p => p.t += dt);
      sparkles = sparkles.filter(p => p.t < 0.7);
      progress();
      if(x >= LEN){ holding = false; landing = {t: 0, x0: x, y0: y, x1: LEN + 120, y1: ground(LEN + 120) - 46}; }
    }

    // Landning på plattan: en mjuk glidning ned under 1,6 sekunder, sedan är turen klar.
    function land(dt){
      landing.t += dt;
      const k = Math.min(1, landing.t / 1.6), e = 1 - Math.pow(1 - k, 3);
      x = landing.x0 + (landing.x1 - landing.x0) * e;
      y = landing.y0 + (landing.y1 - landing.y0) * e;
      vy = 0;
      rotor += dt * 30 * (1 - k * 0.7);
      sparkles.forEach(p => p.t += dt);
      sparkles = sparkles.filter(p => p.t < 0.7);
      if(k >= 1) finish();
    }

    function finish(){
      running = false; holding = false;
      tone([523, 659, 784, 1047]);
      endEl.querySelector('.got').textContent = '⭐ ' + got;
      setTimeout(() => endEl.classList.add('on'), 300);
      if(typeof opts.onFinish === 'function') opts.onFinish();
    }

    function frame(t){
      raf = requestAnimationFrame(frame);
      if(paused){ last = t; return; }
      const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
      if(running) update(dt);
      draw(t);
    }

    // ---------- Ritning ----------
    function draw(t){
      const {s, w, cw, ch, dpr} = view;
      if(!cw) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      ctx.save(); ctx.scale(s, s);
      const camX = (x || 0) - w * HELI_X;       // världens x längst till vänster på skärmen

      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#8fd0f7'); sky.addColorStop(1, '#e6f5fd');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, H);
      ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(w - 110, 100, 46, 0, Math.PI * 2); ctx.fill();

      // moln och avlägsna kullar rör sig långsammare, för djup, men lugnt
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      for(let i = -1; i < w / 380 + 2; i++){
        const cx = i * 380 - ((camX * 0.15) % 380), cy = 120 + (i % 3) * 45;
        [[0, 0, 32], [36, -8, 42], [76, 0, 30]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2); ctx.fill(); });
      }
      ctx.fillStyle = '#b7e0a3';
      ctx.beginPath(); ctx.moveTo(0, H);
      for(let sx = 0; sx <= w + 20; sx += 20){ const wx = camX * 0.35 + sx; ctx.lineTo(sx, 470 + 40 * Math.sin(wx / 260) + 20 * Math.sin(wx / 113)); }
      ctx.lineTo(w, H); ctx.closePath(); ctx.fill();

      // marken
      ctx.fillStyle = '#7cc36b';
      ctx.beginPath(); ctx.moveTo(0, H);
      for(let sx = 0; sx <= w + 10; sx += 10) ctx.lineTo(sx, ground(camX + sx));
      ctx.lineTo(w, H); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#5fa851'; ctx.lineWidth = 6; ctx.beginPath();
      for(let sx = 0; sx <= w + 10; sx += 10){ const gy = ground(camX + sx); if(sx === 0) ctx.moveTo(sx, gy); else ctx.lineTo(sx, gy); }
      ctx.stroke();
      // träd längs vägen
      for(let tx = Math.floor(camX / 520) * 520; tx < camX + w + 520; tx += 520){
        const sx = tx - camX + 200, gy = ground(tx + 200);
        ctx.fillStyle = '#7a5a3a'; ctx.fillRect(sx - 6, gy - 50, 12, 52);
        ctx.fillStyle = '#4f9b45'; ctx.beginPath(); ctx.arc(sx, gy - 62, 30, 0, Math.PI * 2); ctx.fill();
      }

      // helikopterplattan vid målet
      const padX = LEN + 120 - camX;
      if(padX > -200 && padX < w + 200){
        const gy = ground(LEN + 120);
        ctx.fillStyle = '#6f7882'; ctx.fillRect(padX - 80, gy - 14, 160, 16);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 40px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('H', padX, gy - 40);
        ctx.font = '40px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; ctx.fillText('🏁', padX + 70, gy - 50);
      }

      // stjärnor
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `${STAR_R * 2}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
      stars && stars.forEach(st => { if(!st.got){ const sx = st.x - camX; if(sx > -40 && sx < w + 40) ctx.fillText('⭐', sx, st.y); } });
      sparkles && sparkles.forEach(p => {
        ctx.globalAlpha = 1 - p.t / 0.7;
        ctx.fillText('⭐', p.x - camX, p.y - p.t * 90);
      });
      ctx.globalAlpha = 1;

      // helikoptern
      drawHeli(w * HELI_X, y || 300, Math.max(-0.25, Math.min(0.25, (vy || 0) / 900)));
      ctx.restore();
    }

    function drawHeli(hx, hy, tilt){
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(tilt);
      // stjärtbom och stjärtrotor
      ctx.fillStyle = '#e8a52a'; ctx.beginPath(); ctx.moveTo(-20, -6); ctx.lineTo(-78, -12); ctx.lineTo(-78, -2); ctx.lineTo(-20, 8); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.translate(-80, -8); ctx.rotate(rotor * 1.3);
      ctx.fillStyle = '#5b6470'; ctx.fillRect(-2, -14, 4, 28); ctx.restore();
      // medar
      ctx.strokeStyle = '#5b6470'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-26, 30); ctx.lineTo(28, 30); ctx.moveTo(-14, 30); ctx.lineTo(-10, 20); ctx.moveTo(14, 30); ctx.lineTo(10, 20); ctx.stroke();
      // kropp och fönster
      ctx.fillStyle = '#f5c02e'; ctx.beginPath(); ctx.ellipse(0, 2, 34, 22, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#bfe6ff'; ctx.beginPath(); ctx.ellipse(14, -2, 15, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(10, -7, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
      // huvudrotor: bladen syns kortare och längre när de snurrar
      ctx.fillStyle = '#5b6470'; ctx.fillRect(-3, -28, 6, 10);
      const span = 54 * Math.abs(Math.cos(rotor));
      ctx.fillStyle = 'rgba(70,78,90,.85)'; ctx.fillRect(-span, -31, span * 2, 5);
      ctx.restore();
    }

    // ---------- Styrning ----------
    const down = e => { if(!running) return; e.preventDefault(); holding = true; };
    const up = () => { holding = false; };
    canvas.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    const key = e => { if(e.code === 'Space'){ e.preventDefault(); holding = e.type === 'keydown' && running; } };
    window.addEventListener('keydown', key); window.addEventListener('keyup', key);

    // Pausa om iPaden låses eller appen lämnas.
    function onVis(){ paused = document.visibilityState === 'hidden'; holding = false; }
    document.addEventListener('visibilitychange', onVis);

    el.querySelector('.hk-play').addEventListener('click', begin);
    endEl.querySelector('button').addEventListener('click', begin);

    reset();
    resize();
    raf = requestAnimationFrame(frame);

    return {
      stop(){
        running = false; cancelAnimationFrame(raf);
        window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
        window.removeEventListener('keydown', key); window.removeEventListener('keyup', key);
        document.removeEventListener('visibilitychange', onVis);
        if(ro) ro.disconnect(); else window.removeEventListener('resize', resize);
        try{ if(ac) ac.close(); }catch(e){}
        root.innerHTML = '';
      }
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'helikoptern', title: 'Helikoptern', icon: '🚁',
    about: 'Håll inne för att stiga och släpp för att sjunka. Plocka stjärnor och landa på plattan efter cirka 1 minut. Ingen krasch: helikoptern studsar mjukt mot backen. Liten: lugnare. Stor: lite snabbare och fler stjärnor i bågar.',
    start
  });
})();
