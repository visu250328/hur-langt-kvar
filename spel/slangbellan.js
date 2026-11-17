/* Slangbellan – skjut bollen mot tornet och få loss alla stjärnor.
   Obegränsat antal skott, stillastående kamera. Kräver fysikbiblioteket Matter.js
   (spel/lib/matter.min.js), som laddas före spelet.
   Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.sb{height:100%;display:flex;flex-direction:column;gap:12px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.sb-top{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px}
.sb-title{font-size:1.7rem;font-weight:800;line-height:1}
.sb-stars{font-size:1.6rem;font-weight:800;line-height:1;background:var(--card,#fff);border-radius:999px;padding:6px 16px;box-shadow:inset 0 0 0 3px var(--done,#F2B33D);letter-spacing:.05em}
.sb-top{flex-wrap:wrap}
.sb-banor{display:flex;gap:8px;margin-left:auto}
.sb-bana{width:40px;height:40px;border-radius:50%;border:0;background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;font-size:1.1rem;cursor:pointer;
  box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);display:grid;place-items:center;padding:0}
.sb-bana.done{background:var(--done,#F2B33D);color:#2B1E00;box-shadow:none}
.sb-bana.cur{box-shadow:0 0 0 3px var(--sky,#DCEAF6),0 0 0 6px var(--accent,#2F6FD6)}
.sb-bana:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
.sb-new{border:2px solid var(--line,#C6D1DF);background:var(--card,#fff);color:inherit;font:inherit;font-weight:700;border-radius:999px;padding:5px 14px;cursor:pointer;flex:none}
.sb-new.sure{background:var(--done,#F2B33D);border-color:var(--done,#F2B33D);color:#2B1E00}
.sb-stage{flex:1;min-height:0;position:relative}
.sb-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;border-radius:22px}
.sb-new:focus-visible,.sb-end button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
.sb-msg{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:24px;font-weight:700}
.sb-end{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;
  background:color-mix(in srgb,var(--sky,#DCEAF6) 55%,transparent);border-radius:inherit;z-index:5}
.sb-end.on{display:flex}
.sb-end .big{font-size:clamp(2.4rem,8vmin,4.5rem);font-weight:800;line-height:1;text-shadow:0 0 12px var(--sky,#DCEAF6)}
.sb-end .stars{font-size:clamp(2.4rem,8vmin,4.5rem);line-height:1}
.sb-end.on .stars{animation:sb-hop .8s ease-out 2}
.sb-end button{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.3rem;font-weight:800;border-radius:18px;padding:12px 26px;cursor:pointer;margin-top:8px}
@keyframes sb-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-18px)}}
@media (prefers-reduced-motion: reduce){ .sb-end.on .stars{animation:none} }`;

  // ---------- Banan, i världens mått 1200 × 700 ----------
  const W = 1200, H = 700, GROUND = 640;
  const SLING = {x: 210, y: 500};          // där bollen ligger innan den skjuts
  const MAX_PULL = 150, POWER = 0.135;     // hur långt man kan dra och hur hårt det skjuter
  const STAR_R = 22, STAR_MOVE = 40;       // en stjärna är loss när den flyttats 40 enheter
  // Banorna. x, y är mitten och w, h bredd och höjd. fast: true är sten som inte rör sig.
  const BANOR = [
    {name: 'Tornet',
     blocks: [
       {x: 850, y: 570, w: 30, h: 140}, {x: 990, y: 570, w: 30, h: 140},
       {x: 920, y: 488, w: 210, h: 24},
       {x: 875, y: 451, w: 50, h: 50}, {x: 965, y: 451, w: 50, h: 50},
       {x: 920, y: 416, w: 150, h: 20},
       {x: 1110, y: 590, w: 40, h: 100}
     ],
     stars: [{x: 920, y: 384}, {x: 920, y: 618}, {x: 1110, y: 518}]},
    {name: 'Två torn',
     blocks: [
       {x: 670, y: 590, w: 30, h: 100}, {x: 740, y: 590, w: 30, h: 100},
       {x: 705, y: 530, w: 110, h: 20},
       {x: 1000, y: 610, w: 60, h: 60}, {x: 1000, y: 550, w: 60, h: 60}, {x: 1000, y: 490, w: 60, h: 60}
     ],
     stars: [{x: 705, y: 498}, {x: 1000, y: 438}, {x: 1110, y: 618}]},
    {name: 'Höga tornet',
     blocks: [
       {x: 880, y: 580, w: 30, h: 120}, {x: 980, y: 580, w: 30, h: 120},
       {x: 930, y: 510, w: 150, h: 20},
       {x: 895, y: 450, w: 26, h: 100}, {x: 965, y: 450, w: 26, h: 100},
       {x: 930, y: 390, w: 120, h: 20},
       {x: 930, y: 355, w: 50, h: 50}
     ],
     stars: [{x: 930, y: 308}, {x: 930, y: 478}, {x: 930, y: 618}]},
    {name: 'Muren',
     blocks: [
       {x: 740, y: 615, w: 50, h: 50}, {x: 740, y: 565, w: 50, h: 50}, {x: 740, y: 515, w: 50, h: 50},
       {x: 900, y: 600, w: 30, h: 80}, {x: 1000, y: 600, w: 30, h: 80},
       {x: 950, y: 550, w: 150, h: 20}
     ],
     stars: [{x: 740, y: 468}, {x: 920, y: 518}, {x: 985, y: 518}]},
    {name: 'Hyllan',
     blocks: [
       {x: 930, y: 380, w: 230, h: 24, fast: true}, {x: 1033, y: 516, w: 24, h: 248, fast: true},
       {x: 865, y: 333, w: 26, h: 70}, {x: 995, y: 333, w: 26, h: 70},
       {x: 930, y: 289, w: 180, h: 18},
       {x: 780, y: 615, w: 50, h: 50}, {x: 780, y: 565, w: 50, h: 50}
     ],
     stars: [{x: 930, y: 258}, {x: 930, y: 346}, {x: 930, y: 618}]},
    {name: 'Pyramiden',
     blocks: [
       {x: 820, y: 615, w: 50, h: 50}, {x: 870, y: 615, w: 50, h: 50}, {x: 920, y: 615, w: 50, h: 50}, {x: 970, y: 615, w: 50, h: 50},
       {x: 845, y: 565, w: 50, h: 50}, {x: 895, y: 565, w: 50, h: 50}, {x: 945, y: 565, w: 50, h: 50},
       {x: 870, y: 515, w: 50, h: 50}, {x: 920, y: 515, w: 50, h: 50},
       {x: 895, y: 465, w: 50, h: 50},
       {x: 1110, y: 580, w: 20, h: 120}
     ],
     stars: [{x: 895, y: 418}, {x: 1040, y: 618}, {x: 1110, y: 498}]},
    {name: 'Borgen',
     blocks: [
       {x: 760, y: 620, w: 40, h: 40}, {x: 760, y: 580, w: 40, h: 40}, {x: 760, y: 540, w: 40, h: 40},
       {x: 1040, y: 620, w: 40, h: 40}, {x: 1040, y: 580, w: 40, h: 40}, {x: 1040, y: 540, w: 40, h: 40},
       {x: 840, y: 590, w: 25, h: 100}, {x: 960, y: 590, w: 25, h: 100},
       {x: 900, y: 530, w: 170, h: 20},
       {x: 850, y: 500, w: 40, h: 40}, {x: 950, y: 500, w: 40, h: 40}
     ],
     stars: [{x: 900, y: 498}, {x: 900, y: 618}, {x: 760, y: 498}]},
    {name: 'Stenhyllan',
     blocks: [
       {x: 800, y: 420, w: 170, h: 22, fast: true}, {x: 873, y: 530, w: 24, h: 198, fast: true},
       {x: 760, y: 379, w: 25, h: 60}, {x: 840, y: 379, w: 25, h: 60},
       {x: 800, y: 341, w: 120, h: 16},
       {x: 1040, y: 610, w: 60, h: 60}, {x: 1040, y: 550, w: 60, h: 60}, {x: 1040, y: 490, w: 60, h: 60}
     ],
     stars: [{x: 800, y: 311}, {x: 1040, y: 438}, {x: 790, y: 618}]}
  ];
  const LEVELS = {small: {ballR: 28, dots: 40}, big: {ballR: 22, dots: 12}};

  // Världen för en bana. Används av spelet och av testerna, så att de räknar likadant.
  function buildWorld(M, bana){
    const engine = M.Engine.create({enableSleeping: true});
    engine.gravity.y = 1;
    const ground = M.Bodies.rectangle(W / 2, GROUND + 40, W * 3, 80, {isStatic: true, friction: 0.9, label: 'ground'});
    const blocks = bana.blocks.map(b => M.Bodies.rectangle(b.x, b.y, b.w, b.h,
      {isStatic: !!b.fast, friction: 0.8, restitution: 0.05, density: 0.002, label: 'block', plugin: {w: b.w, h: b.h}}));
    const stars = bana.stars.map(s => {
      const body = M.Bodies.circle(s.x, s.y, STAR_R, {friction: 0.9, restitution: 0.1, density: 0.0008, label: 'star'});
      return {body, start: {x: s.x, y: s.y}, got: false};
    });
    M.Composite.add(engine.world, [ground, ...blocks, ...stars.map(s => s.body)]);
    return {engine, blocks, stars};
  }
  // Skapas rörlig och görs sedan stilla, så att Matter.js minns massan till skottet.
  function makeBall(M, r){
    const ball = M.Bodies.circle(SLING.x, SLING.y, r, {density: 0.006, friction: 0.5, restitution: 0.3, frictionAir: 0.005, label: 'ball'});
    M.Body.setStatic(ball, true);
    return ball;
  }
  function launch(M, ball, vx, vy){
    M.Body.setStatic(ball, false);
    M.Sleeping.set(ball, false);
    M.Body.setVelocity(ball, {x: vx, y: vy});
  }

  function start(root, opts){
    opts = opts || {};
    const level = opts.level === 'big' ? 'big' : 'small';
    const cfg = LEVELS[level];

    if(!document.getElementById('sb-css')){
      const s = document.createElement('style'); s.id = 'sb-css'; s.textContent = CSS; document.head.append(s);
    }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'sb';
    el.innerHTML = `
      <div class="sb-top"><div class="sb-title">Slangbellan</div><div class="sb-banor" role="group" aria-label="Banor"></div><div class="sb-stars" aria-live="polite"></div><button type="button" class="sb-new">Börja om</button></div>
      <div class="sb-stage"><canvas class="sb-canvas" aria-label="Dra bollen bakåt och släpp för att skjuta"></canvas></div>
      <div class="sb-end" role="dialog" aria-live="polite"><div class="stars">⭐⭐⭐</div><div class="big">Alla stjärnor!</div><button type="button">Spela igen</button></div>`;
    root.append(el);
    const stage = el.querySelector('.sb-stage'), canvas = el.querySelector('.sb-canvas'), ctx = canvas.getContext('2d');
    const starsEl = el.querySelector('.sb-stars'), endEl = el.querySelector('.sb-end'), newBtn = el.querySelector('.sb-new');
    const banorEl = el.querySelector('.sb-banor');

    // Vilken bana man är på och vilka som är klara sparas, en gång per nivå.
    const store = opts.storage || {get(){ return null; }, set(){}};
    const progKey = 'banor-' + level;
    let prog = null;
    try{ prog = JSON.parse(store.get(progKey) || 'null'); }catch(e){}
    if(!prog || !Array.isArray(prog.done)) prog = {current: 0, done: []};
    prog.done = BANOR.map((_, i) => !!prog.done[i]);
    if(!(prog.current >= 0 && prog.current < BANOR.length)) prog.current = 0;
    const saveProg = () => { try{ store.set(progKey, JSON.stringify(prog)); }catch(e){} };
    function renderBanor(){
      banorEl.innerHTML = '';
      BANOR.forEach((b, i) => {
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'sb-bana' + (prog.done[i] ? ' done' : '') + (i === prog.current ? ' cur' : '');
        btn.textContent = i + 1;
        btn.setAttribute('aria-label', `Bana ${i + 1}, ${b.name}` + (prog.done[i] ? ', klar' : '') + (i === prog.current ? ', vald' : ''));
        btn.addEventListener('click', () => goTo(i));
        banorEl.append(btn);
      });
    }
    function goTo(i){ prog.current = i; saveProg(); resetBtn(); build(); }

    const M = window.Matter;
    if(!M){
      stage.innerHTML = '<div class="sb-msg">Fysikbiblioteket saknas. Lägg spel/lib/matter.min.js före spelet.</div>';
      return {stop(){ root.innerHTML = ''; }};
    }

    // ---------- Ljud ----------
    let ac = null;
    function tone(freqs, vol, type){
      if(!opts.sound) return;
      try{
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        freqs.forEach((f, i) => {
          const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * 0.11;
          o.type = type || 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.15, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
          o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.32);
        });
      }catch(e){}
    }

    // ---------- Fysiken ----------
    let engine, ball, ballState, stars, blocks, found, sparkles, launchedAt, restSince, nextBallTimer = null;

    function build(){
      clearTimeout(nextBallTimer);
      ({engine, blocks, stars} = buildWorld(M, BANOR[prog.current]));
      M.Events.on(engine, 'collisionStart', e => {
        e.pairs.forEach(({bodyA, bodyB}) => {
          const other = bodyA === ball ? bodyB : bodyB === ball ? bodyA : null;
          if(other && other.label === 'star') collect(stars.find(s => s.body === other));
        });
      });
      found = 0; sparkles = [];
      endEl.classList.remove('on');
      ball = null;
      newBall();
      updateStars();
      renderBanor();
    }

    function newBall(){
      if(ball) M.Composite.remove(engine.world, ball);
      ball = makeBall(M, cfg.ballR);
      M.Composite.add(engine.world, ball);
      ballState = 'ready';
    }

    function collect(s){
      if(!s || s.got) return;
      s.got = true; found++;
      sparkles.push({x: s.body.position.x, y: s.body.position.y, t: 0});
      M.Composite.remove(engine.world, s.body);
      tone([784, 988, 1175], 0.13);
      updateStars();
      if(found === stars.length){
        prog.done[prog.current] = true; saveProg();
        const last = prog.current === BANOR.length - 1, all = prog.done.every(Boolean);
        endEl.querySelector('.big').textContent = last && all ? 'Alla banor klara!' : 'Alla stjärnor!';
        endEl.querySelector('button').textContent = last ? 'Spela igen från bana 1' : 'Nästa bana';
        renderBanor();
        setTimeout(() => { tone([523, 659, 784, 1047]); endEl.classList.add('on'); }, 700);
        if(typeof opts.onFinish === 'function') opts.onFinish();
      }
    }
    function updateStars(){
      starsEl.textContent = stars.map(s => s.got ? '⭐' : '☆').join(' ');
      starsEl.setAttribute('aria-label', `${found} av ${stars.length} stjärnor`);
    }

    // ---------- Skala: hela banan syns alltid, kameran står still ----------
    let view = {s: 1, ox: 0, oy: 0, cw: 0, ch: 0};
    function resize(){
      const cw = stage.clientWidth, ch = stage.clientHeight, dpr = window.devicePixelRatio || 1;
      if(!cw || !ch) return;
      canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
      const s = Math.min(cw / W, ch / H);
      view = {s, ox: (cw - W * s) / 2, oy: (ch - H * s) / 2, cw, ch, dpr};
    }
    const ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
    if(ro) ro.observe(stage); else window.addEventListener('resize', resize);

    function toWorld(e){
      const r = canvas.getBoundingClientRect(), k = canvas.clientWidth / (r.width || 1);
      const x = (e.clientX - r.left) * k, y = (e.clientY - r.top) * k;
      return {x: (x - view.ox) / view.s, y: (y - view.oy) / view.s};
    }

    // ---------- Sikta och skjuta ----------
    let pull = null, sureTimer = null;
    canvas.addEventListener('pointerdown', e => {
      if(ballState !== 'ready' || found === stars.length) return;
      const p = toWorld(e);
      if(Math.hypot(p.x - SLING.x, p.y - SLING.y) > cfg.ballR + 60) return;   // tryck nära bollen
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
      pull = {x: SLING.x, y: SLING.y};
      ballState = 'aim';
    });
    canvas.addEventListener('pointermove', e => {
      if(ballState !== 'aim') return;
      const p = toWorld(e), dx = p.x - SLING.x, dy = p.y - SLING.y, d = Math.hypot(dx, dy) || 1, k = Math.min(1, MAX_PULL / d);
      pull = {x: SLING.x + dx * k, y: SLING.y + dy * k};
      M.Body.setPosition(ball, pull);
    });
    const release = () => {
      if(ballState !== 'aim') return;
      const vx = (SLING.x - pull.x) * POWER, vy = (SLING.y - pull.y) * POWER;
      if(Math.hypot(vx, vy) < 1.5){ M.Body.setPosition(ball, SLING); ballState = 'ready'; pull = null; return; }   // för kort drag
      launch(M, ball, vx, vy);
      ballState = 'flying'; launchedAt = performance.now(); restSince = null; pull = null;
      tone([300, 500], 0.1, 'triangle');
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);

    // Siktlinjen: samma rörelse som fysiken ger, steg för steg.
    function preview(){
      const pts = [];
      let x = pull.x, y = pull.y, vx = (SLING.x - pull.x) * POWER, vy = (SLING.y - pull.y) * POWER;
      const g = engine.gravity.y * engine.gravity.scale * (1000 / 60) * (1000 / 60);
      for(let i = 0; i < cfg.dots * 3 && y < GROUND; i++){
        vy += g; vx *= 1 - 0.005; vy *= 1 - 0.005; x += vx; y += vy;
        if(i % 3 === 2) pts.push({x, y});
      }
      return pts;
    }

    // ---------- Spelets klocka ----------
    let raf = 0, last = 0, acc = 0, paused = false;
    function frame(t){
      raf = requestAnimationFrame(frame);
      if(paused){ last = t; return; }
      acc += Math.min(100, t - (last || t)); last = t;
      while(acc >= 1000 / 60){ M.Engine.update(engine, 1000 / 60); acc -= 1000 / 60; step(); }
      draw();
    }
    function step(){
      stars.forEach(s => {
        if(!s.got && Math.hypot(s.body.position.x - s.start.x, s.body.position.y - s.start.y) > STAR_MOVE) collect(s);
      });
      sparkles.forEach(p => p.t++);
      sparkles = sparkles.filter(p => p.t < 50);
      if(ballState === 'flying'){
        const now = performance.now(), slow = ball.speed < 0.25 && ball.angularSpeed < 0.02;
        if(slow){ if(!restSince) restSince = now; } else restSince = null;
        const out = ball.position.x > W + 150 || ball.position.x < -150 || ball.position.y > H + 150;
        if(out || (restSince && now - restSince > 900) || now - launchedAt > 9000){
          ballState = 'done';
          nextBallTimer = setTimeout(() => { if(found < stars.length) newBall(); }, 500);
        }
      }
    }

    // ---------- Ritning ----------
    function roundRect(x, y, w, h, r){
      ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
    function draw(){
      const {s, ox, oy, cw, ch, dpr} = view;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      ctx.save(); ctx.translate(ox, oy); ctx.scale(s, s);

      // himmel, kullar och mark
      const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
      sky.addColorStop(0, '#8fd0f7'); sky.addColorStop(1, '#dff2fd');
      ctx.fillStyle = sky; roundRect(0, 0, W, H, 22); ctx.fill();
      ctx.save(); roundRect(0, 0, W, H, 22); ctx.clip();
      ctx.fillStyle = '#a9d98f'; ctx.beginPath(); ctx.ellipse(300, GROUND + 30, 420, 140, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#9bd082'; ctx.beginPath(); ctx.ellipse(950, GROUND + 40, 480, 120, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7cc36b'; ctx.fillRect(0, GROUND, W, H - GROUND);
      ctx.fillStyle = '#6aae5a'; ctx.fillRect(0, GROUND, W, 6);
      ctx.fillStyle = '#fff'; [[160, 110, 40], [205, 100, 52], [255, 112, 38], [760, 80, 34], [800, 70, 46], [845, 82, 32]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(1080, 95, 48, 0, Math.PI * 2); ctx.fill();

      // slangbellans bakre del
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#7a4f2a'; ctx.lineWidth = 16;
      ctx.beginPath(); ctx.moveTo(SLING.x - 4, GROUND); ctx.lineTo(SLING.x - 4, SLING.y + 40); ctx.lineTo(SLING.x - 26, SLING.y - 14); ctx.stroke();
      const bandBack = {x: SLING.x - 26, y: SLING.y - 14}, bandFront = {x: SLING.x + 20, y: SLING.y - 14};
      if(ballState === 'aim' || ballState === 'ready'){
        ctx.strokeStyle = '#5a2f17'; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(bandBack.x, bandBack.y); ctx.lineTo(ball.position.x, ball.position.y); ctx.stroke();
      }

      // siktlinje
      if(ballState === 'aim' && pull){
        ctx.fillStyle = 'rgba(255,255,255,.95)';
        preview().forEach((p, i, a) => { ctx.globalAlpha = 1 - i / (a.length + 4); ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill(); });
        ctx.globalAlpha = 1;
      }

      // klossar
      blocks.forEach(b => {
        const {w, h} = b.plugin;
        ctx.save(); ctx.translate(b.position.x, b.position.y); ctx.rotate(b.angle);
        if(b.isStatic){
          ctx.fillStyle = '#9aa3ad'; roundRect(-w / 2, -h / 2, w, h, 6); ctx.fill();
          ctx.strokeStyle = '#6f7882'; ctx.lineWidth = 3; ctx.stroke();
          ctx.restore();
          return;
        }
        ctx.fillStyle = '#d9a066'; roundRect(-w / 2, -h / 2, w, h, 5); ctx.fill();
        ctx.strokeStyle = '#a8713d'; ctx.lineWidth = 3; ctx.stroke();
        ctx.strokeStyle = 'rgba(168,113,61,.5)'; ctx.lineWidth = 2;
        ctx.beginPath();
        if(w > h){ ctx.moveTo(-w / 2 + 8, -2); ctx.lineTo(w / 2 - 8, -2); } else { ctx.moveTo(-2, -h / 2 + 8); ctx.lineTo(-2, h / 2 - 8); }
        ctx.stroke();
        ctx.restore();
      });

      // stjärnor
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `${STAR_R * 2.1}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
      stars.forEach(st => {
        if(st.got) return;
        ctx.save(); ctx.translate(st.body.position.x, st.body.position.y); ctx.rotate(st.body.angle);
        ctx.fillText('⭐', 0, 2); ctx.restore();
      });
      sparkles.forEach(p => {
        ctx.globalAlpha = 1 - p.t / 50;
        ctx.font = `${STAR_R * (2 + p.t / 25)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
        ctx.fillText('⭐', p.x, p.y - p.t * 1.6);
      });
      ctx.globalAlpha = 1;

      // bollen, med ett glatt ansikte
      if(ball && ballState !== 'gone'){
        const r = cfg.ballR;
        ctx.save(); ctx.translate(ball.position.x, ball.position.y); ctx.rotate(ball.angle);
        ctx.fillStyle = '#e8473c'; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.4, r * 0.28, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2b1e1e';
        ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.08, r * 0.11, 0, Math.PI * 2); ctx.arc(r * 0.3, -r * 0.08, r * 0.11, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#2b1e1e'; ctx.lineWidth = r * 0.09;
        ctx.beginPath(); ctx.arc(0, r * 0.12, r * 0.38, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
        ctx.restore();
      }

      // slangbellans främre del, över bollen
      ctx.strokeStyle = '#8c5a30'; ctx.lineWidth = 16;
      ctx.beginPath(); ctx.moveTo(SLING.x + 4, SLING.y + 40); ctx.lineTo(SLING.x + 20, SLING.y - 14); ctx.stroke();
      if(ballState === 'aim' || ballState === 'ready'){
        ctx.strokeStyle = '#5a2f17'; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(bandFront.x, bandFront.y); ctx.lineTo(ball.position.x, ball.position.y); ctx.stroke();
      }
      // en hand som visar var man drar, tills första skottet
      if(ballState === 'ready' && !engine.__shot){
        const k = (Math.sin(performance.now() / 400) + 1) / 2;
        ctx.globalAlpha = 0.85;
        ctx.font = `48px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
        ctx.fillText('👆', SLING.x - 40 - k * 50, SLING.y + 55 + k * 25);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      ctx.restore();
    }

    // Pausa om iPaden låses eller appen lämnas.
    function onVis(){ paused = document.visibilityState === 'hidden'; }
    document.addEventListener('visibilitychange', onVis);

    function restart(){ build(); }
    endEl.querySelector('button').addEventListener('click', () => { goTo((prog.current + 1) % BANOR.length); });
    function resetBtn(){ clearTimeout(sureTimer); newBtn.classList.remove('sure'); newBtn.textContent = 'Börja om'; }
    newBtn.addEventListener('click', () => {
      if(found === stars.length){ resetBtn(); restart(); return; }
      if(!newBtn.classList.contains('sure')){
        newBtn.classList.add('sure'); newBtn.textContent = 'Tryck igen för att börja om';
        sureTimer = setTimeout(resetBtn, 3000);
        return;
      }
      resetBtn(); restart();
    });

    // Handen försvinner efter första skottet.
    canvas.addEventListener('pointerup', () => { if(ballState === 'flying') engine.__shot = true; });

    build();
    resize();
    raf = requestAnimationFrame(frame);

    return {
      stop(){
        cancelAnimationFrame(raf); clearTimeout(nextBallTimer); clearTimeout(sureTimer);
        document.removeEventListener('visibilitychange', onVis);
        if(ro) ro.disconnect(); else window.removeEventListener('resize', resize);
        try{ if(ac) ac.close(); }catch(e){}
        root.innerHTML = '';
      }
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'slangbellan', title: 'Slangbellan', icon: '🎯',
    about: 'Dra bollen bakåt i slangbellan och släpp. Få loss alla tre stjärnorna på varje bana. 8 banor, hur många skott som helst. Liten: större boll och hel siktlinje. Stor: mindre boll och kort siktlinje.',
    start,
    _test: {BANOR, buildWorld, makeBall, launch, W, H, GROUND, SLING, MAX_PULL, POWER, STAR_MOVE}
  });
})();
