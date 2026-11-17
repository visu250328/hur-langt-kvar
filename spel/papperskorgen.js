/* Papperskorgen (paper toss) – svep uppåt för att kasta en papperstuss i papperskorgen. Svepets riktning
   styr åt vilket håll och längden hur långt. I korgen: swisch och en stjärna. Utanför: tussen rullar bort och
   en ny kommer, inget går förlorat. Liten nivå: korgen nära, ingen vind och en liten hjälp att sikta. Stor nivå:
   en fläkt blåser åt sidan med olika styrka varje kast, och korgen flyttar sig efter varje träff.
   Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.pt{height:100%;display:flex;flex-direction:column;gap:10px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.pt-top{display:flex;align-items:center;gap:12px;min-height:44px;flex-wrap:wrap}
.pt-title{font-size:1.7rem;font-weight:800;line-height:1;margin-right:auto}
.pt-score{font-weight:800;font-size:1.1rem;background:var(--card,#fff);border-radius:999px;padding:4px 14px;box-shadow:inset 0 0 0 2px var(--line,#C6D1DF)}
.pt-area{flex:1;min-height:0;position:relative;border-radius:22px;overflow:hidden;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);touch-action:none}
.pt-area canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
.pt-say{position:absolute;left:50%;top:12%;transform:translateX(-50%);background:rgba(255,255,255,.94);border-radius:16px;padding:8px 18px;font-weight:800;font-size:1.4rem;pointer-events:none;opacity:0;transition:opacity .3s;z-index:3;white-space:nowrap;color:#1D2842}
.pt-say.on{opacity:1}
.pt button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}`;

  const G = 9.8;

  function start(root, opts){
    opts = opts || {};
    const big = opts.level === 'big';
    const store = opts.storage || {get(){ return null; }, set(){}};
    let best = parseInt(store.get('rekord-' + (big ? 'big' : 'small')) || '0', 10) || 0;

    if(!document.getElementById('pt-css')){ const s = document.createElement('style'); s.id = 'pt-css'; s.textContent = CSS; document.head.append(s); }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'pt';
    el.innerHTML = `<div class="pt-top"><div class="pt-title">Papperskorgen</div><div class="pt-score" aria-live="polite"></div></div>
      <div class="pt-area"><canvas aria-label="Svep uppåt för att kasta pappret i papperskorgen"></canvas><div class="pt-say" aria-live="polite"></div></div>`;
    root.append(el);
    const cv = el.querySelector('canvas'), g = cv.getContext('2d'), area = el.querySelector('.pt-area'), sayEl = el.querySelector('.pt-say'), scoreEl = el.querySelector('.pt-score');

    let ac = null;
    function tone(freqs, vol, type, gap, dur){
      if(!opts.sound) return;
      try{ ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        freqs.forEach((f, i) => { const o = ac.createOscillator(), gg = ac.createGain(), t = ac.currentTime + i * (gap || 0.08);
          o.type = type || 'sine'; o.frequency.value = f; gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(vol || 0.1, t + 0.02); gg.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.2));
          o.connect(gg).connect(ac.destination); o.start(t); o.stop(t + (dur || 0.2) + 0.02); }); }catch(e){}
    }
    function swish(){
      if(!opts.sound) return;
      try{ ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        const n = ac.sampleRate * 0.35, buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
        for(let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / n) * 0.5;
        const s = ac.createBufferSource(), f = ac.createBiquadFilter(), gg = ac.createGain(); f.type = 'bandpass'; f.frequency.value = 2200; gg.gain.value = 0.25;
        s.buffer = buf; s.connect(f).connect(gg).connect(ac.destination); s.start(); }catch(e){}
    }
    function speak(text){
      if(!opts.sound || !window.speechSynthesis) return;
      try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'sv-SE';
        const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.replace('_', '-').startsWith('sv')); if(v) u.voice = v; speechSynthesis.speak(u); }catch(e){}
    }
    let sayTimer = null;
    const say = (t, ms) => { sayEl.textContent = t; sayEl.classList.add('on'); clearTimeout(sayTimer); sayTimer = setTimeout(() => sayEl.classList.remove('on'), ms || 1200); };

    // ---------- Världen (meter): x i sidled, y höjd, z avstånd framåt ----------
    const RIM = 0.55, BINR = big ? 0.42 : 0.5, HAND = 0.35, AIM = big ? 0.45 : 0.65;   // AIM: hur mycket hjälp att sikta
    let bin = {x: 0, z: big ? 6.5 : 4.5}, wind = 0, ball = null, inCount = 0, streak = 0, stars = [], finishedOnce = false, hintOn = true, clock = 0;
    function newWind(){ wind = big ? (Math.round((Math.random() * 6 - 3) * 2) / 2) : 0; }
    function newBall(){ ball = {x: 0, y: HAND, z: 0, vx: 0, vy: 0, vz: 0, state: 'ready', t: 0, trail: []}; dirty = true; }
    function paintScore(){ scoreEl.textContent = `🗑️ ${inCount} i korgen · I rad: ${streak} · 🏆 ${best}`; }
    // Kastet: svepets längd uppåt ger fart, sidled ger riktning. Kastvinkeln är fast (cirka 50°).
    function throwBall(dxN, dyN){
      if(!ball || ball.state !== 'ready') return;
      hintOn = false;
      const p = Math.max(0.1, Math.min(1, dyN));
      let v = 5 + p * 4.5, side = dxN * 2.6;   // fart 5–9,5 m/s: lagom känsligt för barnfingrar
      const ang = 50 * Math.PI / 180;
      // Hjälp att sikta: en bit av vägen mot den fart och riktning som träffar (vinden räknas inte med på stor nivå).
      const ideal = Math.sqrt(G * bin.z / Math.sin(2 * ang)) * 0.97, tOfZ = bin.z / (ideal * Math.cos(ang));
      v = v + (ideal - v) * AIM; side = side + ((bin.x - 0) / tOfZ - side) * AIM;
      Object.assign(ball, {vx: side, vy: v * Math.sin(ang), vz: v * Math.cos(ang), state: 'fly', t: 0});
      tone([500, 700], 0.05, 'triangle', 0.05);
    }
    function step(dt){
      clock += dt;
      stars.forEach(s => { s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy -= 300 * dt; }); stars = stars.filter(s => s.t < 0.9);
      if(!ball) return;
      if(ball.state === 'fly'){
        const n = 4, h = dt / n;
        for(let k = 0; k < n && ball.state === 'fly'; k++){
          const py = ball.y;
          ball.vx += wind * 0.5 * h; ball.vy -= G * h;
          ball.x += ball.vx * h; ball.y += ball.vy * h; ball.z += ball.vz * h;
          // Ner i korgen: korsar kanten på väg nedåt inom öppningen.
          if(py >= RIM && ball.y < RIM && ball.vy < 0){
            const d = Math.hypot(ball.x - bin.x, (ball.z - bin.z) * 1.1);
            if(d < BINR * 0.92){ score(); return; }
            if(d < BINR * 1.35){ ball.vy = Math.abs(ball.vy) * 0.35; ball.vx += (ball.x - bin.x) * 3; ball.vz *= 0.4; say('Nära!', 900); tone([330], 0.06, 'square'); }
          }
          if(ball.y <= 0.06){ ball.y = 0.06; miss(); return; }
        }
        ball.trail.push([ball.x, ball.y, ball.z]); if(ball.trail.length > 12) ball.trail.shift();
      }else if(ball.state === 'roll'){
        ball.t += dt; ball.x += ball.vx * dt * 0.3; ball.z += ball.vz * dt * 0.2;
        if(ball.t > 0.9) next();
      }else if(ball.state === 'in'){
        ball.t += dt; ball.y = RIM - ball.t * 0.8; if(ball.t > 0.7) next();
      }
    }
    function score(){
      ball.state = 'in'; ball.t = 0; ball.x = bin.x; ball.z = bin.z;
      inCount++; streak++;
      if(streak > best){ best = streak; try{ store.set('rekord-' + (big ? 'big' : 'small'), String(best)); }catch(e){} }
      paintScore(); swish();
      const words = streak >= 3 && streak === best ? `${streak} i rad! Rekord!` : ['Mitt i!', 'Swisch!', 'Snyggt!', 'I korgen!'][Math.floor(Math.random() * 4)];
      say(words, 1300); if(streak >= 3 && streak === best) speak(words);
      later(() => [659, 880, 1175].forEach((f, i) => setTimeout(() => tone([f], 0.08), i * 80)), 120);
      const p = proj(bin.x, RIM, bin.z); for(let i = 0; i < 14; i++){ const a = Math.random() * Math.PI * 2, s = 120 + Math.random() * 160; stars.push({x: p[0], y: p[1], vx: Math.cos(a) * s, vy: Math.sin(a) * s + 160, t: 0}); }
      if(!finishedOnce && inCount >= (big ? 10 : 5)){ finishedOnce = true; if(typeof opts.onFinish === 'function') opts.onFinish(); }
      ball.moveBin = big;
    }
    function miss(){ ball.state = 'roll'; ball.t = 0; streak = 0; paintScore(); tone([200], 0.04, 'triangle'); }
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    function next(){
      const moveBin = ball && ball.moveBin;
      if(moveBin){ bin = {x: Math.round((Math.random() * 2.4 - 1.2) * 10) / 10, z: 5.5 + Math.random() * 2.5}; }
      newWind(); newBall();
    }

    // ---------- Ritning: perspektiv ----------
    let W = 800, H = 600, dpr = 1;
    const horizon = () => H * 0.38;
    function proj(x, y, z){
      const s = 1 / (1 + z * 0.32);   // längre bort = mindre
      return [W / 2 + x * W * 0.42 * s, horizon() + (H * 0.95 - horizon()) * s - y * H * 0.55 * s, s];
    }
    function draw(){
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Vägg och golv.
      g.fillStyle = '#f3e6cf'; g.fillRect(0, 0, W, horizon());
      const fl = g.createLinearGradient(0, horizon(), 0, H); fl.addColorStop(0, '#c99b6a'); fl.addColorStop(1, '#a8743e'); g.fillStyle = fl; g.fillRect(0, horizon(), W, H - horizon());
      g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 2; for(let i = -8; i <= 8; i++){ const a = proj(i * 0.5, 0, 0), b = proj(i * 0.5, 0, 12); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
      // Fönster på väggen.
      g.fillStyle = '#9fd6ff'; g.fillRect(W * 0.08, H * 0.07, W * 0.2, H * 0.2); g.strokeStyle = '#fff'; g.lineWidth = 6; g.strokeRect(W * 0.08, H * 0.07, W * 0.2, H * 0.2);
      g.beginPath(); g.moveTo(W * 0.18, H * 0.07); g.lineTo(W * 0.18, H * 0.27); g.stroke();
      // Fläkten och vinden (stor nivå).
      if(wind){
        const side = wind > 0 ? -1 : 1, fx = W / 2 + side * W * 0.38, fy = H * 0.24;
        g.fillStyle = '#8a929c'; g.fillRect(fx - 5, fy, 10, H * 0.12);
        g.fillStyle = '#d9dde3'; g.beginPath(); g.arc(fx, fy, 34, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#6b7584'; g.lineWidth = 3; g.stroke();
        g.save(); g.translate(fx, fy); g.rotate(clock * Math.abs(wind) * 6);
        g.fillStyle = '#3b7fe0'; for(let i = 0; i < 3; i++){ g.rotate(Math.PI * 2 / 3); g.beginPath(); g.ellipse(0, -14, 8, 15, 0, 0, Math.PI * 2); g.fill(); } g.restore();
        const n = Math.max(1, Math.round(Math.abs(wind))), dir = Math.sign(wind);
        g.fillStyle = '#2f6fd6'; g.font = `bold ${Math.round(H * 0.045)}px system-ui,sans-serif`; g.textAlign = 'center';
        g.fillText((dir > 0 ? '➜' : '⬅').repeat(n), W / 2, H * 0.08);
        g.font = `bold ${Math.round(H * 0.03)}px system-ui,sans-serif`; g.fillStyle = '#1D2842'; g.fillText('Vind', W / 2, H * 0.12);
      }
      // Papperskorgen: cylinder med öppning.
      const b0 = proj(bin.x, 0, bin.z), b1 = proj(bin.x, RIM, bin.z), rw = BINR * W * 0.42 * b0[2];
      g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(b0[0], b0[1], rw * 1.15, rw * 0.3, 0, 0, Math.PI * 2); g.fill();
      const bg = g.createLinearGradient(b0[0] - rw, 0, b0[0] + rw, 0); bg.addColorStop(0, '#6b7584'); bg.addColorStop(0.5, '#b9c0c9'); bg.addColorStop(1, '#5b6470');
      g.fillStyle = bg; g.beginPath(); g.moveTo(b1[0] - rw, b1[1]); g.lineTo(b0[0] - rw * 0.82, b0[1]); g.ellipse(b0[0], b0[1], rw * 0.82, rw * 0.22, 0, Math.PI, 0, true); g.lineTo(b1[0] + rw, b1[1]); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2; for(let i = -2; i <= 2; i++){ g.beginPath(); g.moveTo(b1[0] + i * rw * 0.38, b1[1] + 4); g.lineTo(b0[0] + i * rw * 0.31, b0[1]); g.stroke(); }
      const ballBehind = ball && ball.z > bin.z + 0.05;
      if(ballBehind) drawBall();
      g.fillStyle = '#3a3f47'; g.beginPath(); g.ellipse(b1[0], b1[1], rw, rw * 0.3, 0, 0, Math.PI * 2); g.fill();
      if(ball && ball.state === 'in') drawBall();
      g.strokeStyle = '#d9dde3'; g.lineWidth = 4; g.beginPath(); g.ellipse(b1[0], b1[1], rw, rw * 0.3, 0, 0, Math.PI * 2); g.stroke();
      if(ball && !ballBehind && ball.state !== 'in') drawBall();
      // Stjärnor vid träff.
      stars.forEach(s => { g.globalAlpha = 1 - s.t / 0.9; g.font = '22px system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif'; g.textAlign = 'center'; g.fillText('⭐', s.x, s.y); g.globalAlpha = 1; });
      // Ledtråd: svep uppåt.
      if(hintOn && ball && ball.state === 'ready'){
        const p = proj(0, HAND, 0), k = (clock % 1.4) / 1.4;
        g.strokeStyle = 'rgba(29,40,66,.5)'; g.lineWidth = 6; g.lineCap = 'round'; g.setLineDash([10, 10]);
        g.beginPath(); g.moveTo(p[0], p[1] + 40); g.lineTo(p[0], p[1] - 160); g.stroke(); g.setLineDash([]);
        g.font = '44px system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif'; g.textAlign = 'center'; g.fillText('👆', p[0] + 26, p[1] + 40 - k * 190);
        g.fillStyle = '#1D2842'; g.font = `bold ${Math.round(H * 0.035)}px system-ui,sans-serif`; g.fillText('Svep uppåt för att kasta!', W / 2, H * 0.97);
      }
    }
    function drawBall(){
      if(ball.state === 'fly') ball.trail.forEach((t, i) => { const p = proj(...t); g.fillStyle = `rgba(255,255,255,${i / ball.trail.length * 0.4})`; g.beginPath(); g.arc(p[0], p[1], 6 * p[2] * W / 800, 0, Math.PI * 2); g.fill(); });
      const p = proj(ball.x, ball.y, ball.z), r = 0.13 * W * 0.42 * p[2];
      // Skugga på golvet.
      if(ball.state !== 'in'){ const s = proj(ball.x, 0, ball.z); g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(s[0], s[1], r * 0.9, r * 0.25, 0, 0, Math.PI * 2); g.fill(); }
      g.save(); g.translate(p[0], p[1]); g.rotate(ball.z * 2 + ball.x);
      g.fillStyle = '#fbfbf7'; g.beginPath();
      for(let i = 0; i < 9; i++){ const a = i / 9 * Math.PI * 2, rr = r * (0.86 + ((i * 7) % 5) * 0.05); g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill();
      g.strokeStyle = '#9aa4b0'; g.lineWidth = Math.max(1, r * 0.07); g.stroke();
      g.beginPath(); g.moveTo(-r * 0.5, -r * 0.2); g.lineTo(r * 0.1, r * 0.1); g.lineTo(r * 0.4, -r * 0.35); g.moveTo(-r * 0.2, r * 0.5); g.lineTo(r * 0.3, r * 0.3); g.stroke();
      g.restore();
    }
    function layout(){
      const w = area.clientWidth, h = area.clientHeight; if(!w || !h) return;
      dpr = window.devicePixelRatio || 1; W = w; H = h; cv.width = w * dpr; cv.height = h * dpr; dirty = true;
    }
    // Svep: från fingrets startpunkt till där det släpps. Uppåt = framåt.
    let sw = null;
    cv.addEventListener('pointerdown', e => { e.preventDefault(); try{ cv.setPointerCapture(e.pointerId); }catch(x){} sw = {x: e.clientX, y: e.clientY, t: performance.now()}; });
    const up = e => {
      if(!sw) return; const dx = e.clientX - sw.x, dy = sw.y - e.clientY; sw = null;
      if(dy < 25) return;
      throwBall(dx / (W * 0.5), dy / (H * 0.6));
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', () => { sw = null; });

    let raf = 0, last = 0;
    // Rita bara när något rör sig (kast, fläkt, stjärnor, ledtråd) – sparar batteri när tussen bara ligger still.
    let dirty = true;
    function frame(t){
      raf = requestAnimationFrame(frame); const dt = Math.min(0.04, (t - (last || t)) / 1000); last = t; step(dt);
      const busy = !ball || ball.state !== 'ready' || hintOn || wind || stars.length;
      if(busy || dirty){ draw(); dirty = false; }
    }
    const ro = window.ResizeObserver ? new ResizeObserver(layout) : null; if(ro) ro.observe(area);
    layout(); newWind(); newBall(); paintScore(); raf = requestAnimationFrame(frame);

    return {
      stop(){ cancelAnimationFrame(raf); timers.forEach(clearTimeout); clearTimeout(sayTimer); if(ro) ro.disconnect(); try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){} try{ if(ac) ac.close(); }catch(e){} root.innerHTML = ''; },
      _test: {throwBall, step, ball: () => ball, bin: () => bin, wind: () => wind, setWind: w => { wind = w; }, inCount: () => inCount, streak: () => streak, best: () => best, next}
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'papperskorgen', title: 'Papperskorgen', icon: '🗑️',
    about: 'Svep uppåt för att kasta pappret i papperskorgen! Liten: korgen står nära och det blåser inte. Stor: en fläkt blåser åt sidan och korgen flyttar sig efter varje träff.',
    start
  });
})();
