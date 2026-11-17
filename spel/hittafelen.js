/* Hitta felen – två bilder bredvid varandra med några skillnader. Tryck där du ser en skillnad, i vilken bild
   som helst: rätt tryck ringar in skillnaden i båda bilderna, fel tryck ger bara ett mjukt ljud. Liten nivå:
   3 tydliga skillnader. Stor nivå: 5 skillnader, en del små. Fyra miljöer; skillnaderna väljs slumpvis
   varje gång. Ledtråd efter en stund utan fynd. Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.hf{height:100%;display:flex;flex-direction:column;gap:10px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.hf-top{display:flex;align-items:center;gap:12px;min-height:44px;flex-wrap:wrap}
.hf-title{font-size:1.7rem;font-weight:800;line-height:1;margin-right:auto}
.hf-count{display:flex;gap:6px;font-size:1.6rem;line-height:1}
.hf-btn{border:0;border-radius:999px;background:var(--card,#fff);color:inherit;font:inherit;font-weight:800;padding:5px 14px;cursor:pointer;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF)}
.hf-pics{flex:1;min-height:0;display:flex;gap:14px;align-items:center;justify-content:center}
.hf-pics.port{flex-direction:column}
.hf-pic{position:relative;border-radius:18px;overflow:hidden;box-shadow:0 0 0 4px var(--card,#fff),0 0 0 7px var(--line,#C6D1DF);touch-action:manipulation;cursor:pointer;background:#fff}
.hf-pic svg{display:block;width:100%;height:100%}
.hf-ring{fill:none;stroke:#e8302a;stroke-width:4;animation:hf-in .35s ease}
.hf-miss{fill:none;stroke:#8a929c;stroke-width:3;animation:hf-miss .6s ease forwards}
.hf-hint{fill:rgba(245,192,46,.18);stroke:#f5c02e;stroke-width:4;stroke-dasharray:8 6;animation:hf-pulse 1.2s ease-in-out infinite}
.hf-end{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:color-mix(in srgb,var(--sky,#DCEAF6) 70%,transparent);z-index:5}
.hf-end.on{display:flex}
.hf-end .big{font-size:clamp(2rem,7vmin,3.4rem);font-weight:800;text-align:center}
.hf-end .em{font-size:3rem}
.hf-end button{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-size:1.2rem;font-weight:800;border-radius:18px;padding:10px 24px;cursor:pointer}
.hf button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
@keyframes hf-in{0%{opacity:0;stroke-width:12}100%{opacity:1;stroke-width:4}}
@keyframes hf-miss{0%{opacity:.9}100%{opacity:0}}
@keyframes hf-pulse{0%,100%{opacity:.5}50%{opacity:1}}`;

  // ---------- Små ritfunktioner ----------
  const sun = (x, y, c, rays) => `<g>${rays ? Array.from({length: 8}, (_, i) => { const a = i * Math.PI / 4; return `<line x1="${x + Math.cos(a) * 22}" y1="${y + Math.sin(a) * 22}" x2="${x + Math.cos(a) * 32}" y2="${y + Math.sin(a) * 32}" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`; }).join('') : ''}<circle cx="${x}" cy="${y}" r="18" fill="${c}"/></g>`;
  const cloud = (x, y) => `<g fill="#fff"><circle cx="${x - 16}" cy="${y + 4}" r="12"/><circle cx="${x}" cy="${y - 4}" r="16"/><circle cx="${x + 18}" cy="${y + 4}" r="12"/><rect x="${x - 28}" y="${y + 2}" width="58" height="14" rx="7"/></g>`;
  const flower = (x, y, c) => `<g><line x1="${x}" y1="${y}" x2="${x}" y2="${y + 22}" stroke="#3c9a3c" stroke-width="3"/>${[0, 72, 144, 216, 288].map(a => `<circle cx="${x + Math.cos(a * Math.PI / 180) * 7}" cy="${y + Math.sin(a * Math.PI / 180) * 7}" r="6" fill="${c}"/>`).join('')}<circle cx="${x}" cy="${y}" r="4" fill="#f5c02e"/></g>`;
  const apple = (x, y, c) => `<circle cx="${x}" cy="${y}" r="6" fill="${c}" stroke="#7a1a12" stroke-width="1"/>`;
  const star = (x, y, r, c) => { let d = ''; for(let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ' ' + (y + Math.sin(a) * rr).toFixed(1); } return `<path d="${d}Z" fill="${c}"/>`; };
  const fish = (x, y, c, dir, s) => { s = s || 1; const d = dir || 1; return `<g transform="translate(${x} ${y}) scale(${d * s} ${s})"><path d="M-18 0 Q0 -14 16 0 Q0 14 -18 0Z" fill="${c}"/><path d="M-16 0 L-28 -10 L-28 10Z" fill="${c}"/><circle cx="8" cy="-3" r="2.6" fill="#1D2842"/></g>`; };
  const ball = (x, y, c1, c2) => `<g><circle cx="${x}" cy="${y}" r="13" fill="${c1}"/><path d="M${x - 13} ${y} A13 13 0 0 0 ${x + 13} ${y}Z" fill="${c2}"/><circle cx="${x}" cy="${y}" r="13" fill="none" stroke="#1D2842" stroke-width="1.5"/></g>`;

  // Varje miljö: bakgrund och saker. En sak har ett läge a och ett annat läge b (tomt = saknas).
  // easy: tydlig nog för liten nivå. x, y, r: var skillnaden finns och hur stort tryckområdet är.
  const SCENES = [
    {name: 'Trädgården', bg: '<rect width="300" height="220" fill="#bfe6ff"/><rect y="150" width="300" height="70" fill="#7cc96b"/>', items: [
      {id: 'sol', x: 255, y: 38, r: 34, easy: true, a: sun(255, 38, '#f5c02e', true), b: sun(255, 38, '#f28a2e', false)},
      {id: 'moln', x: 75, y: 40, r: 32, easy: true, a: cloud(75, 40), b: ''},
      {id: 'tak', x: 90, y: 100, r: 36, easy: true, a: '<path d="M45 115 L90 80 L135 115Z" fill="#a0522d"/>', b: '<path d="M45 115 L90 80 L135 115Z" fill="#2f6fd6"/>'},
      {id: 'skorsten', x: 116, y: 88, r: 16, easy: true, a: '<rect x="110" y="80" width="12" height="20" fill="#7a3f1a"/>', b: ''},
      {id: 'fonster', x: 70, y: 133, r: 16, easy: true, a: '<rect x="60" y="123" width="20" height="20" fill="#9fd6ff" stroke="#fff" stroke-width="3"/><path d="M70 123 V143 M60 133 H80" stroke="#fff" stroke-width="2"/>', b: ''},
      {id: 'dorr', x: 107, y: 145, r: 16, easy: false, a: '<rect x="98" y="128" width="18" height="34" rx="3" fill="#7a3f1a"/><circle cx="112" cy="146" r="2" fill="#f5c02e"/>', b: '<rect x="98" y="128" width="18" height="34" rx="3" fill="#43b55a"/><circle cx="112" cy="146" r="2" fill="#f5c02e"/>'},
      {id: 'apple1', x: 212, y: 100, r: 14, easy: false, a: apple(212, 100, '#e8302a'), b: ''},
      {id: 'apple2', x: 236, y: 116, r: 14, easy: false, a: apple(236, 116, '#e8302a'), b: apple(236, 116, '#9be33a')},
      {id: 'blomma1', x: 165, y: 178, r: 18, easy: true, a: flower(165, 172, '#e8302a'), b: flower(165, 172, '#f5c02e')},
      {id: 'blomma2', x: 190, y: 184, r: 18, easy: true, a: flower(190, 178, '#9a5bd6'), b: ''},
      {id: 'fagel', x: 160, y: 52, r: 16, easy: false, a: '<path d="M150 52 Q155 46 160 52 Q165 46 170 52" fill="none" stroke="#1D2842" stroke-width="2.5"/>', b: ''},
      {id: 'boll', x: 40, y: 190, r: 18, easy: true, a: ball(40, 190, '#e8302a', '#fff'), b: ball(40, 190, '#2f6fd6', '#fff')}],
      fixed: '<rect x="50" y="115" width="80" height="47" fill="#f4d7a8"/><rect x="220" y="125" width="12" height="40" fill="#7a4a1f"/><circle cx="226" cy="108" r="30" fill="#3c9a3c"/>'},
    {name: 'Stranden', bg: '<rect width="300" height="220" fill="#bfe6ff"/><rect y="100" width="300" height="60" fill="#3b8bd6"/><rect y="150" width="300" height="70" fill="#f2d59b"/>', items: [
      {id: 'sol', x: 40, y: 36, r: 34, easy: true, a: sun(40, 36, '#f5c02e', true), b: ''},
      {id: 'segel', x: 200, y: 82, r: 26, easy: true, a: '<path d="M200 60 L200 104 L226 104Z" fill="#fff"/>', b: '<path d="M200 60 L200 104 L226 104Z" fill="#e8302a"/>'},
      {id: 'flagga', x: 204, y: 56, r: 14, easy: false, a: '<path d="M200 50 L212 54 L200 58Z" fill="#f5c02e"/>', b: ''},
      {id: 'parasoll', x: 70, y: 140, r: 34, easy: true, a: '<path d="M40 140 A30 22 0 0 1 100 140Z" fill="#e8302a"/><path d="M55 140 A15 22 0 0 1 70 118 A15 22 0 0 1 85 140Z" fill="#fff"/>', b: '<path d="M40 140 A30 22 0 0 1 100 140Z" fill="#43b55a"/><path d="M55 140 A15 22 0 0 1 70 118 A15 22 0 0 1 85 140Z" fill="#fff"/>'},
      {id: 'boll', x: 150, y: 185, r: 18, easy: true, a: ball(150, 185, '#f5c02e', '#2f6fd6'), b: ''},
      {id: 'hink', x: 230, y: 185, r: 18, easy: true, a: '<path d="M218 176 L242 176 L238 198 L222 198Z" fill="#2f6fd6"/><path d="M218 176 Q230 162 242 176" fill="none" stroke="#1D2842" stroke-width="2"/>', b: '<path d="M218 176 L242 176 L238 198 L222 198Z" fill="#ff7ab0"/><path d="M218 176 Q230 162 242 176" fill="none" stroke="#1D2842" stroke-width="2"/>'},
      {id: 'krabba', x: 270, y: 200, r: 16, easy: false, a: '<g fill="#e8302a"><ellipse cx="270" cy="202" rx="10" ry="6"/><circle cx="259" cy="196" r="4"/><circle cx="281" cy="196" r="4"/></g>', b: ''},
      {id: 'fagel', x: 130, y: 40, r: 16, easy: false, a: '<path d="M120 40 Q125 34 130 40 Q135 34 140 40" fill="none" stroke="#1D2842" stroke-width="2.5"/>', b: ''},
      {id: 'moln', x: 240, y: 30, r: 30, easy: true, a: cloud(240, 30), b: ''},
      {id: 'fisk', x: 100, y: 120, r: 18, easy: false, a: fish(100, 120, '#f28a2e', 1, 0.8), b: fish(100, 120, '#f28a2e', -1, 0.8)},
      {id: 'snacka', x: 30, y: 196, r: 16, easy: false, a: '<path d="M22 204 Q30 186 38 204Z" fill="#ffb6c8" stroke="#c46a84" stroke-width="1.5"/>', b: ''}],
      fixed: '<path d="M170 104 L236 104 L226 118 L180 118Z" fill="#8a5a2b"/><line x1="200" y1="50" x2="200" y2="104" stroke="#5b3a1a" stroke-width="3"/><line x1="70" y1="140" x2="70" y2="196" stroke="#7a4a1f" stroke-width="3"/>'},
    {name: 'Rymden', bg: '<rect width="300" height="220" fill="#1a2350"/>', items: [
      {id: 'mane', x: 250, y: 50, r: 30, easy: true, a: '<circle cx="250" cy="50" r="22" fill="#f2e6b6"/><circle cx="243" cy="45" r="4" fill="#d6c98f"/><circle cx="258" cy="58" r="3" fill="#d6c98f"/>', b: ''},
      {id: 'planet', x: 70, y: 150, r: 34, easy: true, a: '<circle cx="70" cy="150" r="24" fill="#f28a2e"/><ellipse cx="70" cy="150" rx="38" ry="8" fill="none" stroke="#f5c02e" stroke-width="4"/>', b: '<circle cx="70" cy="150" r="24" fill="#9a5bd6"/><ellipse cx="70" cy="150" rx="38" ry="8" fill="none" stroke="#f5c02e" stroke-width="4"/>'},
      {id: 'raketfonster', x: 160, y: 95, r: 14, easy: false, a: '<circle cx="160" cy="95" r="7" fill="#9fd6ff" stroke="#2f6fd6" stroke-width="2"/>', b: ''},
      {id: 'eld', x: 160, y: 158, r: 18, easy: true, a: '<path d="M150 145 Q160 175 170 145Z" fill="#f28a2e"/><path d="M155 145 Q160 165 165 145Z" fill="#f5c02e"/>', b: ''},
      {id: 'fenor', x: 160, y: 135, r: 20, easy: true, a: '<path d="M146 125 L136 145 L146 140Z M174 125 L184 145 L174 140Z" fill="#e8302a"/>', b: '<path d="M146 125 L136 145 L146 140Z M174 125 L184 145 L174 140Z" fill="#43b55a"/>'},
      {id: 'stjarna1', x: 40, y: 40, r: 16, easy: false, a: star(40, 40, 8, '#fff'), b: ''},
      {id: 'stjarna2', x: 120, y: 30, r: 16, easy: false, a: star(120, 30, 7, '#fff'), b: star(120, 30, 7, '#f5c02e')},
      {id: 'stjarna3', x: 210, y: 180, r: 16, easy: false, a: star(210, 180, 8, '#fff'), b: ''},
      {id: 'ufo', x: 240, y: 130, r: 30, easy: true, a: '<ellipse cx="240" cy="134" rx="28" ry="9" fill="#8a929c"/><path d="M226 132 A14 12 0 0 1 254 132Z" fill="#9be33a" opacity=".85"/><circle cx="228" cy="137" r="2.5" fill="#f5c02e"/><circle cx="240" cy="139" r="2.5" fill="#f5c02e"/><circle cx="252" cy="137" r="2.5" fill="#f5c02e"/>', b: ''},
      {id: 'komet', x: 60, y: 80, r: 22, easy: true, a: '<path d="M40 70 L68 84" stroke="#9fd6ff" stroke-width="5" stroke-linecap="round" opacity=".7"/><circle cx="70" cy="85" r="6" fill="#fff"/>', b: ''}],
      fixed: Array.from({length: 18}, (_, i) => `<circle cx="${(i * 67) % 290 + 5}" cy="${(i * 41) % 210 + 5}" r="1.4" fill="#fff" opacity=".7"/>`).join('') + '<path d="M160 60 Q176 85 174 140 L146 140 Q144 85 160 60Z" fill="#eef1f5" stroke="#8a929c" stroke-width="2"/>'},
    {name: 'Havet', bg: '<rect width="300" height="220" fill="#2f8ad6"/><rect y="180" width="300" height="40" fill="#e8d199"/>', items: [
      {id: 'fisk1', x: 70, y: 60, r: 24, easy: true, a: fish(70, 60, '#f5c02e', 1, 1.2), b: fish(70, 60, '#ff7ab0', 1, 1.2)},
      {id: 'fisk2', x: 210, y: 90, r: 24, easy: true, a: fish(210, 90, '#f28a2e', -1, 1.1), b: ''},
      {id: 'fisk3', x: 140, y: 130, r: 18, easy: false, a: fish(140, 130, '#43b55a', 1, 0.7), b: fish(140, 130, '#43b55a', -1, 0.7)},
      {id: 'blacksprut', x: 245, y: 165, r: 30, easy: true, a: '<g fill="#9a5bd6"><circle cx="245" cy="155" r="16"/>' + [-12, -4, 4, 12].map(d => `<path d="M${245 + d} 165 q-4 14 2 22" stroke="#9a5bd6" stroke-width="4" fill="none"/>`).join('') + '<circle cx="239" cy="152" r="2.5" fill="#fff"/><circle cx="251" cy="152" r="2.5" fill="#fff"/></g>', b: '<g fill="#e8302a"><circle cx="245" cy="155" r="16"/>' + [-12, -4, 4, 12].map(d => `<path d="M${245 + d} 165 q-4 14 2 22" stroke="#e8302a" stroke-width="4" fill="none"/>`).join('') + '<circle cx="239" cy="152" r="2.5" fill="#fff"/><circle cx="251" cy="152" r="2.5" fill="#fff"/></g>'},
      {id: 'sjostjarna', x: 60, y: 195, r: 18, easy: true, a: star(60, 195, 13, '#f28a2e'), b: ''},
      {id: 'snacka', x: 130, y: 200, r: 16, easy: false, a: '<path d="M120 208 Q130 186 140 208Z" fill="#ffd6e0" stroke="#c46a84" stroke-width="1.5"/>', b: ''},
      {id: 'skatt', x: 185, y: 192, r: 22, easy: true, a: '<rect x="170" y="184" width="30" height="20" rx="3" fill="#8a5a2b"/><rect x="170" y="184" width="30" height="6" fill="#f5c02e"/>', b: '<rect x="170" y="184" width="30" height="20" rx="3" fill="#8a5a2b"/><rect x="170" y="184" width="30" height="6" fill="#f5c02e"/><circle cx="185" cy="178" r="6" fill="#f5c02e"/><circle cx="176" cy="180" r="4" fill="#fff"/>'},
      {id: 'bubbla1', x: 100, y: 40, r: 14, easy: false, a: '<circle cx="100" cy="40" r="6" fill="none" stroke="#fff" stroke-width="2"/>', b: ''},
      {id: 'bubbla2', x: 230, y: 40, r: 14, easy: false, a: '<circle cx="230" cy="40" r="8" fill="none" stroke="#fff" stroke-width="2"/>', b: '<circle cx="230" cy="40" r="4" fill="none" stroke="#fff" stroke-width="2"/>'},
      {id: 'sjogras', x: 25, y: 160, r: 22, easy: true, a: '<path d="M20 182 Q10 160 22 140 Q30 160 26 182Z" fill="#3c9a3c"/><path d="M30 182 Q40 162 32 148" stroke="#3c9a3c" stroke-width="4" fill="none"/>', b: ''}],
      fixed: '<path d="M285 182 Q276 150 288 120" stroke="#3c9a3c" stroke-width="5" fill="none"/>'}
  ];

  function start(root, opts){
    opts = opts || {};
    const level = opts.level === 'big' ? 'big' : 'small', N = level === 'big' ? 5 : 3;
    const store = opts.storage || {get(){ return null; }, set(){}};
    let sc = parseInt(store.get('bild-' + level) || '0', 10) || 0;
    const save = () => { try{ store.set('bild-' + level, String(sc)); }catch(e){} };

    if(!document.getElementById('hf-css')){ const s = document.createElement('style'); s.id = 'hf-css'; s.textContent = CSS; document.head.append(s); }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'hf';
    el.innerHTML = `<div class="hf-top"><div class="hf-title">Hitta felen</div><div class="hf-count" aria-live="polite"></div><button type="button" class="hf-btn" data-a="new">Ny bild</button></div>
      <div class="hf-pics"><div class="hf-pic" data-s="0" role="img"></div><div class="hf-pic" data-s="1" role="img"></div></div>
      <div class="hf-end" role="dialog" aria-live="polite"><div class="em">🔍⭐</div><div class="big">Du hittade alla!</div><button type="button">Nästa bild</button></div>`;
    root.append(el);
    const picsEl = el.querySelector('.hf-pics'), pics = [...el.querySelectorAll('.hf-pic')], countEl = el.querySelector('.hf-count'), endEl = el.querySelector('.hf-end');

    let ac = null;
    function tone(freqs, vol, type, gap){
      if(!opts.sound) return;
      try{ ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        freqs.forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * (gap || 0.08);
          o.type = type || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.1, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
          o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.25); }); }catch(e){}
    }
    function say(text){
      if(!opts.sound || !window.speechSynthesis) return;
      try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'sv-SE';
        const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.replace('_', '-').startsWith('sv')); if(v) u.voice = v; speechSynthesis.speak(u); }catch(e){}
    }

    let S = null, diffs = [], found = new Set(), hintTimer = null, done = false, endTimer = null;
    function load(){
      clearTimeout(endTimer);   // en slutruta på väg från förra bilden ska inte lägga sig över den nya
      S = SCENES[sc % SCENES.length]; done = false; found = new Set(); endEl.classList.remove('on');
      // Välj skillnader slumpvis; liten nivå bara tydliga. Skillnaderna får inte ligga ovanpå varandra.
      const pool = S.items.filter(it => it.r > 0 && (level === 'big' || it.easy)).sort(() => Math.random() - 0.5);
      diffs = [];
      for(const it of pool){ if(diffs.length >= N) break; if(diffs.every(d => Math.hypot(d.x - it.x, d.y - it.y) > d.r + it.r - 6)) diffs.push(it); }
      const ids = new Set(diffs.map(d => d.id));
      // Höger bild får skillnaderna; ibland byts sidorna, så att det inte alltid är samma bild som "har felen".
      const flip = Math.random() < 0.5;
      pics.forEach((p, k) => {
        const alt = (k === 1) !== flip;
        const body = S.items.map(it => alt && ids.has(it.id) ? it.b : it.a).join('');
        p.innerHTML = `<svg viewBox="0 0 300 220" aria-label="${S.name}, bild ${k + 1}">${S.bg}${S.fixed || ''}${body}<g class="marks"></g></svg>`;
      });
      paintCount(); layout(); idle();
    }
    function paintCount(){ countEl.innerHTML = diffs.map((d, i) => i < found.size ? '🔴' : '⚪').join(''); countEl.setAttribute('aria-label', `${found.size} av ${diffs.length} hittade`); }
    function mark(cls, x, y, r){ pics.forEach(p => { const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); c.setAttribute('class', cls); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', r); p.querySelector('.marks').append(c); if(cls === 'hf-miss') setTimeout(() => c.remove(), 650); }); }
    function tap(e){
      if(done) return;
      const svg = e.currentTarget.querySelector('svg'), pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      const hit = diffs.filter(d => !found.has(d.id)).map(d => [d, Math.hypot(p.x - d.x, p.y - d.y)]).filter(([d, dist]) => dist < d.r + 10).sort((a, b) => a[1] - b[1])[0];
      if(hit){
        const d = hit[0]; found.add(d.id); mark('hf-ring', d.x, d.y, d.r);
        el.querySelectorAll('.hf-hint').forEach(h => h.remove());
        tone([659 + found.size * 60, 880 + found.size * 60], 0.1); paintCount();
        if(found.size === diffs.length) win(); else idle();
      }else{ mark('hf-miss', p.x, p.y, 10); tone([220], 0.05, 'triangle'); }
    }
    function win(){
      done = true; clearTimeout(hintTimer);
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone([f], 0.1), i * 110));
      say('Du hittade alla!');
      sc++; save();
      clearTimeout(endTimer); endTimer = setTimeout(() => endEl.classList.add('on'), 900);
      if(typeof opts.onFinish === 'function') opts.onFinish();
    }
    function idle(){
      clearTimeout(hintTimer);
      hintTimer = setTimeout(() => {
        const d = diffs.find(x => !found.has(x.id)); if(!d || done) return;
        el.querySelectorAll('.hf-hint').forEach(h => h.remove());
        pics.forEach(p => { const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); c.setAttribute('class', 'hf-hint'); c.setAttribute('cx', d.x + (Math.random() * 16 - 8)); c.setAttribute('cy', d.y + (Math.random() * 16 - 8)); c.setAttribute('r', d.r + 26); p.querySelector('.marks').prepend(c); });
      }, level === 'big' ? 25000 : 15000);
    }
    function layout(){
      const W = picsEl.clientWidth, H = picsEl.clientHeight; if(!W || !H) return;
      const port = H > W * 0.9; picsEl.classList.toggle('port', port);
      const ratio = 300 / 220, gap = 14, pad = 10;
      let w = port ? Math.min(W - pad, (H - gap - pad) / 2 * ratio) : Math.min((W - gap - pad) / 2, (H - pad) * ratio);
      pics.forEach(p => { p.style.width = Math.floor(w) + 'px'; p.style.height = Math.floor(w / ratio) + 'px'; });
    }
    pics.forEach(p => p.addEventListener('pointerdown', tap));
    el.querySelector('[data-a="new"]').addEventListener('click', () => { sc++; save(); load(); });
    endEl.querySelector('button').addEventListener('click', load);
    const ro = window.ResizeObserver ? new ResizeObserver(layout) : null; if(ro) ro.observe(picsEl);
    load();

    return {
      stop(){ clearTimeout(hintTimer); clearTimeout(endTimer); if(ro) ro.disconnect(); try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){} try{ if(ac) ac.close(); }catch(e){} root.innerHTML = ''; },
      _test: {diffs: () => diffs.map(d => ({id: d.id, x: d.x, y: d.y, r: d.r})), found: () => found.size, done: () => done, scene: () => S.name, load, next: () => { sc++; save(); load(); }, setScene: i => { sc = i; load(); }}
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'hittafelen', title: 'Hitta felen', icon: '🔍',
    about: 'Två bilder som ser likadana ut – men inte riktigt. Tryck där du ser en skillnad. Liten: 3 tydliga skillnader. Stor: 5 skillnader, en del små. Fyra miljöer: trädgården, stranden, rymden och havet.',
    start
  });
})();
