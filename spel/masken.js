/* Masken – styr masken till frukterna så att den blir längre. Masken dör aldrig: den går genom väggarna,
   och krockar den med sig själv biter den bara av svansen. Liten: 10 frukter, långsam. Stor: 20 frukter,
   snabbare och stenar att runda. Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.mk{height:100%;display:flex;flex-direction:column;gap:10px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.mk-top{display:flex;align-items:center;gap:12px;min-height:44px}
.mk-title{font-size:1.7rem;font-weight:800;line-height:1;margin-right:auto}
.mk-count{font-weight:800;font-size:1.2rem;background:var(--card,#fff);border-radius:999px;padding:4px 14px;box-shadow:inset 0 0 0 2px var(--line,#C6D1DF)}
.mk-main{flex:1;min-height:0;display:flex;gap:14px;align-items:center;justify-content:center}
.mk-main.port{flex-direction:column}
.mk-board{flex:1;min-width:0;min-height:0;align-self:stretch;display:grid;place-items:center;touch-action:none;position:relative}
.mk-board canvas{border-radius:20px;box-shadow:0 0 0 4px #5b8a3a;touch-action:none}
.mk-pad{display:grid;grid-template-columns:repeat(3,64px);grid-template-rows:repeat(3,64px);gap:6px;flex:none}
.mk-pad button{border:0;border-radius:18px;background:var(--card,#fff);font-size:1.8rem;cursor:pointer;box-shadow:inset 0 -5px 0 rgba(0,0,0,.12),0 0 0 3px var(--line,#C6D1DF);color:var(--ink,#1D2842)}
.mk-pad button:active{transform:translateY(2px)}
.mk-hint{position:absolute;left:50%;top:14%;transform:translate(-50%,0);background:rgba(255,255,255,.92);color:#1D2842;border-radius:16px;padding:10px 18px;font-weight:800;font-size:1.2rem;pointer-events:none;text-align:center}
.mk-end{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:color-mix(in srgb,var(--sky,#DCEAF6) 75%,transparent);z-index:5}
.mk-end.on{display:flex}
.mk-end .big{font-size:clamp(2rem,7vmin,3.6rem);font-weight:800}
.mk-end .stars{font-size:3rem;animation:mk-hop .8s ease 2}
.mk-end button{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.2rem;font-weight:800;border-radius:18px;padding:10px 24px;cursor:pointer}
.mk button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
@keyframes mk-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-16px)}}`;

  const FRUITS = ['🍎', '🍐', '🍌', '🍓', '🍇', '🍊', '🍉', '🍒'];
  const LEVELS = {small: {cols: 12, rows: 9, ms: 330, goal: 10, rocks: 0}, big: {cols: 16, rows: 12, ms: 210, goal: 20, rocks: 7}};
  const DIRS = {up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0]};

  function start(root, opts){
    opts = opts || {};
    const level = opts.level === 'big' ? 'big' : 'small', L = LEVELS[level];
    if(!document.getElementById('mk-css')){ const s = document.createElement('style'); s.id = 'mk-css'; s.textContent = CSS; document.head.append(s); }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'mk';
    el.innerHTML = `<div class="mk-top"><div class="mk-title">Masken</div><div class="mk-count" aria-live="polite"></div></div>
      <div class="mk-main"><div class="mk-board"><canvas aria-label="Spelplan"></canvas><div class="mk-hint">Tryck på en pil<br>eller svep för att börja</div></div>
        <div class="mk-pad" role="group" aria-label="Styr masken">
          <span></span><button type="button" data-d="up" aria-label="Upp">⬆️</button><span></span>
          <button type="button" data-d="left" aria-label="Vänster">⬅️</button><span></span><button type="button" data-d="right" aria-label="Höger">➡️</button>
          <span></span><button type="button" data-d="down" aria-label="Ned">⬇️</button><span></span></div></div>
      <div class="mk-end" role="dialog" aria-live="polite"><div class="stars">🐛🍎🎉</div><div class="big">Masken är mätt!</div><button type="button">Spela igen</button></div>`;
    root.append(el);
    const cv = el.querySelector('canvas'), g = cv.getContext('2d'), board = el.querySelector('.mk-board'), hint = el.querySelector('.mk-hint');
    const countEl = el.querySelector('.mk-count'), endEl = el.querySelector('.mk-end'), main = el.querySelector('.mk-main');

    let ac = null;
    function tone(freqs, vol, type){
      if(!opts.sound) return;
      try{ ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        freqs.forEach((f, i) => { const o = ac.createOscillator(), gg = ac.createGain(), t = ac.currentTime + i * 0.08;
          o.type = type || 'sine'; o.frequency.value = f; gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.02); gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
          o.connect(gg).connect(ac.destination); o.start(t); o.stop(t + 0.2); }); }catch(e){}
    }

    let snake, dir, nextDir, food, fruit, eaten, rocks, running, done, timer = null, cell = 30;
    const key = (x, y) => x + ',' + y;
    function freeCell(){
      const used = new Set(snake.map(p => key(p[0], p[1])).concat(rocks.map(p => key(p[0], p[1]))));
      for(let t = 0; t < 500; t++){ const x = Math.floor(Math.random() * L.cols), y = Math.floor(Math.random() * L.rows); if(!used.has(key(x, y))) return [x, y]; }
      return [0, 0];
    }
    function reset(){
      const cx = Math.floor(L.cols / 2), cy = Math.floor(L.rows / 2);
      snake = [[cx, cy], [cx - 1, cy], [cx - 2, cy]]; dir = 'right'; nextDir = 'right'; eaten = 0; running = false; done = false;
      rocks = [];
      // Stenar (stor nivå) läggs inte nära starten och inte i maskens rad.
      while(rocks.length < L.rocks){
        const x = Math.floor(Math.random() * L.cols), y = Math.floor(Math.random() * L.rows);
        if(Math.abs(y - cy) < 2 || rocks.some(r => r[0] === x && r[1] === y)) continue;
        rocks.push([x, y]);
      }
      food = freeCell(); fruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
      hint.hidden = false; endEl.classList.remove('on'); paintCount(); draw();
    }
    const paintCount = () => { countEl.textContent = `${fruit} ${eaten} av ${L.goal}`; };
    function turn(d){
      if(done) return;
      const [dx, dy] = DIRS[d], [cx, cy] = DIRS[dir];
      if(dx === -cx && dy === -cy && snake.length > 1) return;   // inte rakt bakåt
      nextDir = d;
      if(!running){ running = true; hint.hidden = true; }
    }
    function step(){
      if(!running || done) return;
      dir = nextDir;
      const [dx, dy] = DIRS[dir], h = snake[0];
      const n = [(h[0] + dx + L.cols) % L.cols, (h[1] + dy + L.rows) % L.rows];
      // En sten: masken stannar och väntar på att svänga.
      if(rocks.some(r => r[0] === n[0] && r[1] === n[1])){ tone([150], 0.05, 'square'); return; }
      // Krockar masken med sig själv biter den av svansen där, och kör vidare.
      const hit = snake.findIndex((p, i) => i > 0 && p[0] === n[0] && p[1] === n[1]);
      if(hit > 0){ snake = snake.slice(0, hit); tone([300, 220], 0.06); }
      snake.unshift(n);
      if(n[0] === food[0] && n[1] === food[1]){
        eaten++; tone([523 + eaten * 12, 784 + eaten * 12], 0.11);
        if(eaten >= L.goal){ win(); return; }
        food = freeCell(); fruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
      }else snake.pop();
      paintCount();
    }
    function win(){
      done = true; running = false; paintCount(); draw();
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone([f], 0.12), i * 110));
      setTimeout(() => endEl.classList.add('on'), 400);
      if(typeof opts.onFinish === 'function') opts.onFinish();
    }
    function layout(){
      main.classList.toggle('port', main.clientHeight > main.clientWidth * 0.95);
      const W = board.clientWidth - 8, H = board.clientHeight - 8; if(W <= 0 || H <= 0) return;
      cell = Math.max(10, Math.floor(Math.min(W / L.cols, H / L.rows)));
      const dpr = window.devicePixelRatio || 1;
      cv.width = L.cols * cell * dpr; cv.height = L.rows * cell * dpr; cv.style.width = L.cols * cell + 'px'; cv.style.height = L.rows * cell + 'px';
      g.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
    }
    function draw(){
      if(!snake) return;
      const c = cell;
      for(let y = 0; y < L.rows; y++) for(let x = 0; x < L.cols; x++){ g.fillStyle = (x + y) % 2 ? '#9fd56b' : '#a9dc77'; g.fillRect(x * c, y * c, c, c); }
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = `${Math.floor(c * 0.8)}px system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif`;
      rocks.forEach(r => g.fillText('🪨', r[0] * c + c / 2, r[1] * c + c / 2 + 1));
      if(!done) g.fillText(fruit, food[0] * c + c / 2, food[1] * c + c / 2 + 1);
      // Kroppen: runda leder från mörkgrön vid huvudet till ljusgrön vid svansen.
      for(let i = snake.length - 1; i >= 0; i--){
        const p = snake[i], k = i / Math.max(1, snake.length - 1), r = c * (i === 0 ? 0.5 : 0.44 - k * 0.08);
        g.fillStyle = `hsl(${150 - k * 30} 70% ${26 + k * 14}%)`;
        g.beginPath(); g.arc(p[0] * c + c / 2, p[1] * c + c / 2, r, 0, Math.PI * 2); g.fill();
        g.strokeStyle = 'rgba(0,40,10,.45)'; g.lineWidth = Math.max(1.5, c * 0.05); g.stroke();
      }
      // Huvudet med ögon som tittar framåt.
      const h = snake[0], [dx, dy] = DIRS[dir], hx = h[0] * c + c / 2, hy = h[1] * c + c / 2;
      [-1, 1].forEach(s => {
        const ex = hx + dx * c * 0.15 - dy * s * c * 0.2, ey = hy + dy * c * 0.15 + dx * s * c * 0.2;
        g.fillStyle = '#fff'; g.beginPath(); g.arc(ex, ey, c * 0.13, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#1D2842'; g.beginPath(); g.arc(ex + dx * c * 0.04, ey + dy * c * 0.04, c * 0.07, 0, Math.PI * 2); g.fill();
      });
    }

    el.querySelectorAll('.mk-pad button').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); turn(b.dataset.d); }));
    // Svep på spelplanen.
    let sx = null, sy = null;
    board.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
    board.addEventListener('pointermove', e => {
      if(sx == null) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if(Math.hypot(dx, dy) < 24) return;
      turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
      sx = e.clientX; sy = e.clientY;
    });
    const end = () => { sx = sy = null; };
    board.addEventListener('pointerup', end); board.addEventListener('pointercancel', end);
    const onKey = e => { const d = {ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right'}[e.key]; if(d){ e.preventDefault(); turn(d); } };
    window.addEventListener('keydown', onKey);
    endEl.querySelector('button').addEventListener('click', reset);

    // Jämn takt: ett steg i taget, ritning varje bildruta.
    let raf = 0, acc = 0, last = 0;
    function frame(t){
      raf = requestAnimationFrame(frame);
      const dt = Math.min(200, t - (last || t)); last = t; acc += dt;
      while(acc >= L.ms){ acc -= L.ms; step(); }
      draw();
    }
    const ro = window.ResizeObserver ? new ResizeObserver(layout) : null; if(ro) ro.observe(board);
    reset(); layout(); raf = requestAnimationFrame(frame);

    return {
      stop(){ cancelAnimationFrame(raf); if(ro) ro.disconnect(); window.removeEventListener('keydown', onKey); try{ if(ac) ac.close(); }catch(e){} root.innerHTML = ''; },
      _test: {state: () => ({snake, dir, food, eaten, rocks, running, done, goal: L.goal, cols: L.cols, rows: L.rows}), turn, step}
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'masken', title: 'Masken', icon: '🐛',
    about: 'Styr masken till frukterna så att den blir längre. Masken dör aldrig: den går genom väggarna, och krockar den med sig själv biter den bara av svansen. Liten: 10 frukter. Stor: 20 frukter, snabbare och stenar.',
    start
  });
})();
