/* Färglägg – välj en färg och tryck på en yta i bilden för att fylla den. Åtta egna svartvita bilder.
   Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.fl{height:100%;display:flex;flex-direction:column;gap:12px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.fl-top{display:flex;align-items:center;gap:10px;min-height:48px;flex-wrap:wrap}
.fl-title{font-size:1.7rem;font-weight:800;line-height:1;margin-right:auto}
.fl-btn{border:2px solid var(--line,#C6D1DF);background:var(--card,#fff);color:inherit;font:inherit;font-weight:700;border-radius:999px;padding:5px 14px;cursor:pointer}
.fl-btn.sure{background:var(--done,#F2B33D);border-color:var(--done,#F2B33D);color:#2B1E00}
.fl-btn.done{border:0;background:var(--done,#F2B33D);color:#2B1E00;font-weight:800}
.fl-main{flex:1;min-height:0;display:flex;gap:14px}
.fl-main.port{flex-direction:column}
.fl-pic{flex:1;min-width:0;min-height:0;display:grid;place-items:center;background:var(--card,#fff);border-radius:24px;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);position:relative;overflow:hidden}
.fl-pic svg{width:96%;height:96%}
.fl-pic .fr{cursor:pointer;transition:fill .15s}
.fl-side{display:flex;flex-direction:column;gap:10px;justify-content:center}
.fl-main.port .fl-side{flex-direction:column}
.fl-tools{display:flex;flex-direction:column;gap:6px;align-items:center}
.fl-main.port .fl-tools{flex-direction:row;justify-content:center;gap:18px}
.fl-trow{display:flex;gap:6px}
.fl-tool,.fl-size{width:46px;height:46px;border:0;border-radius:14px;cursor:pointer;background:var(--card,#fff);font-size:1.5rem;display:grid;place-items:center;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);padding:0}
.fl-tool[aria-pressed="true"],.fl-size[aria-pressed="true"]{box-shadow:inset 0 0 0 4px var(--accent,#2F6FD6);background:#e6f0ff}
.fl-size i{display:block;border-radius:50%;background:#1D2842}
.fl-pal{display:grid;grid-template-columns:repeat(2,64px);gap:10px;align-content:center;justify-content:center}
.fl-main.port .fl-pal{grid-template-columns:repeat(7,1fr);grid-auto-rows:52px}
.fl-sw{border:0;border-radius:50%;width:64px;height:64px;cursor:pointer;box-shadow:inset 0 0 0 3px rgba(0,0,0,.18);padding:0}
.fl-main.port .fl-sw{width:52px;height:52px;justify-self:center}
.fl-sw[aria-pressed="true"]{box-shadow:0 0 0 4px var(--card,#fff),0 0 0 8px var(--accent,#2F6FD6)}
.fl-list{flex:1;min-height:0;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:14px;align-content:start;padding:2px}
.fl-thumb{border:0;background:var(--card,#fff);border-radius:20px;cursor:pointer;padding:8px 8px 10px;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);display:flex;flex-direction:column;align-items:center;gap:6px;font:inherit;color:inherit}
.fl-thumb svg{width:100%;height:auto;aspect-ratio:4/3;pointer-events:none}
.fl-thumb .nm{font-weight:800;font-size:1.05rem}
.fl button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
.fl-yay{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:4%;pointer-events:none}
.fl-yay.on{display:flex}
.fl-yay .big{font-size:clamp(2rem,6vmin,3.4rem);font-weight:800;line-height:1;text-shadow:0 0 14px #fff,0 0 4px #fff}
.fl-yay .stars{font-size:clamp(1.8rem,6vmin,3rem);line-height:1;animation:fl-hop .8s ease-out 2}
@keyframes fl-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-16px)}}
@media (prefers-reduced-motion: reduce){ .fl-pic .fr{transition:none} .fl-yay .stars{animation:none} }`;

  const COLORS = [
    ['Röd', '#e8473c'], ['Orange', '#f28a2e'], ['Gul', '#f5c02e'], ['Ljusgrön', '#8bd25f'], ['Grön', '#2f9e44'],
    ['Ljusblå', '#7ec8f2'], ['Blå', '#2f6fd6'], ['Lila', '#9a5bd6'], ['Rosa', '#ff8fb7'], ['Brun', '#8a5a2b'],
    ['Ljusbrun', '#f2c9a0'], ['Grå', '#9aa3ad'], ['Svart', '#2a2a2a'], ['Vit', '#ffffff']
  ];

  // ---------- Bilderna ----------
  // Varje bild är ytor som går att fylla (i ritordning, bakgrunden först) och linjer ovanpå som inte fylls.
  // Ytor: [taggnamn, attribut]. Bilderna ritas i 400 × 300.
  const BG = ['rect', {x: 0, y: 0, width: 400, height: 300}];
  const wheel = (x, y, r) => [['circle', {cx: x, cy: y, r}], ['circle', {cx: x, cy: y, r: Math.round(r * 0.42)}]];
  const PICS = [
    {id: 'fagel', name: 'Fågel', regions: [BG,
      ['path', {d: 'M20 238 Q200 222 385 236 L385 252 Q200 240 20 254 Z'}],
      ['path', {d: 'M128 158 L58 124 L66 182 Z'}],
      ['ellipse', {cx: 200, cy: 165, rx: 82, ry: 60}],
      ['ellipse', {cx: 220, cy: 185, rx: 46, ry: 32}],
      ['path', {d: 'M148 152 Q192 118 236 160 Q194 204 148 152 Z'}],
      ['circle', {cx: 270, cy: 112, r: 40}],
      ['path', {d: 'M304 104 L342 116 L304 128 Z'}],
      ['circle', {cx: 282, cy: 102, r: 10}],
      ['circle', {cx: 340, cy: 52, r: 26}]
    ], lines: '<circle cx="284" cy="103" r="4.5" fill="#222"/><path d="M190 222 L186 240 M212 222 L216 240 M180 240 h14 M208 240 h14" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round"/>'},

    {id: 'polisbil', name: 'Polisbil', regions: [BG,
      ['rect', {x: 0, y: 214, width: 400, height: 86}],
      ['path', {d: 'M38 196 L38 152 Q44 140 70 138 L122 136 L162 100 L272 100 L312 136 L356 140 Q366 146 366 162 L366 196 Z'}],
      ['rect', {x: 38, y: 158, width: 328, height: 18}],
      ['path', {d: 'M170 108 L205 108 L205 134 L142 134 Z'}],
      ['path', {d: 'M212 108 L264 108 L296 134 L212 134 Z'}],
      ['rect', {x: 196, y: 86, width: 21, height: 13}], ['rect', {x: 217, y: 86, width: 21, height: 13}],
      ['circle', {cx: 356, cy: 150, r: 6}],
      ...wheel(110, 196, 28), ...wheel(300, 196, 28)
    ], lines: '<path d="M208 136 L208 196 M140 150 h16 M232 150 h16" stroke="#222" stroke-width="3" fill="none"/><text x="246" y="173" font-family="system-ui,sans-serif" font-weight="900" font-size="15" fill="#fff" stroke="#222" stroke-width="3" paint-order="stroke">POLIS</text>'},

    {id: 'brandbil', name: 'Brandbil', regions: [BG,
      ['rect', {x: 0, y: 220, width: 400, height: 80}],
      ['rect', {x: 38, y: 118, width: 236, height: 80}],
      ['path', {d: 'M272 198 L272 108 L322 108 L360 150 L360 198 Z'}],
      ['path', {d: 'M282 116 L318 116 L346 150 L282 150 Z'}],
      ['rect', {x: 46, y: 98, width: 216, height: 14}],
      ['rect', {x: 52, y: 132, width: 62, height: 48}], ['rect', {x: 124, y: 132, width: 62, height: 48}], ['rect', {x: 196, y: 132, width: 62, height: 48}],
      ['rect', {x: 300, y: 96, width: 28, height: 12}],
      ...wheel(98, 202, 24), ...wheel(176, 202, 24), ...wheel(316, 202, 24)
    ], lines: '<path d="M66 98 v14 M90 98 v14 M114 98 v14 M138 98 v14 M162 98 v14 M186 98 v14 M210 98 v14 M234 98 v14" stroke="#222" stroke-width="3"/><path d="M38 188 h322" stroke="#222" stroke-width="3"/>'},

    {id: 'hjullastare', name: 'Hjullastare', regions: [BG,
      ['rect', {x: 0, y: 234, width: 400, height: 66}],
      ['rect', {x: 104, y: 150, width: 50, height: 50}],
      ['rect', {x: 122, y: 112, width: 10, height: 38}],
      ['path', {d: 'M150 206 L150 140 L252 140 L268 172 L268 206 Z'}],
      ['path', {d: 'M174 140 L174 78 L240 78 L252 140 Z'}],
      ['path', {d: 'M184 88 L232 88 L242 132 L184 132 Z'}],
      ['path', {d: 'M262 168 L322 148 L332 164 L272 188 Z'}],
      ['path', {d: 'M312 136 L374 136 L386 210 L332 210 Q314 184 312 136 Z'}],
      ...wheel(160, 216, 36), ...wheel(292, 216, 36)
    ], lines: ''},

    {id: 'mobilkran', name: 'Mobilkran', regions: [BG,
      ['rect', {x: 0, y: 236, width: 400, height: 64}],
      ['rect', {x: 50, y: 198, width: 12, height: 32}], ['rect', {x: 292, y: 198, width: 12, height: 32}],
      ['rect', {x: 38, y: 172, width: 284, height: 30}],
      ['path', {d: 'M320 202 L320 134 L362 134 L382 166 L382 202 Z'}],
      ['path', {d: 'M328 142 L356 142 L372 166 L328 166 Z'}],
      ['rect', {x: 68, y: 140, width: 28, height: 32}],
      ['rect', {x: 96, y: 132, width: 92, height: 40}],
      ['path', {d: 'M150 142 L322 40 L334 54 L166 154 Z'}],
      ['path', {d: 'M318 112 q8 14 0 22 q-10 4 -12 -6'}],
      ...wheel(92, 214, 20), ...wheel(144, 214, 20), ...wheel(252, 214, 20), ...wheel(350, 214, 20)
    ], lines: '<path d="M328 52 L328 110" stroke="#222" stroke-width="3"/><path d="M180 132 L322 46" stroke="#222" stroke-width="2" stroke-dasharray="6 6"/>'},

    {id: 'gravmaskin', name: 'Grävmaskin', regions: [BG,
      ['rect', {x: 0, y: 238, width: 400, height: 62}],
      ['path', {d: 'M88 236 L270 236 Q292 236 292 214 Q292 192 270 192 L88 192 Q66 192 66 214 Q66 236 88 236 Z'}],
      ['circle', {cx: 92, cy: 214, r: 12}], ['circle', {cx: 150, cy: 214, r: 12}], ['circle', {cx: 208, cy: 214, r: 12}], ['circle', {cx: 266, cy: 214, r: 12}],
      ['rect', {x: 96, y: 140, width: 142, height: 50}],
      ['rect', {x: 104, y: 84, width: 68, height: 56}],
      ['rect', {x: 112, y: 92, width: 52, height: 38}],
      ['path', {d: 'M226 150 L298 70 L314 80 L242 166 Z'}],
      ['path', {d: 'M298 70 L352 108 L342 122 L292 86 Z'}],
      ['path', {d: 'M336 108 L378 124 L362 172 L328 150 Z'}]
    ], lines: ''},

    {id: 'traktor', name: 'Traktor', regions: [BG,
      ['rect', {x: 0, y: 248, width: 400, height: 52}],
      ['rect', {x: 174, y: 150, width: 152, height: 46}],
      ['rect', {x: 270, y: 110, width: 9, height: 40}],
      ['rect', {x: 324, y: 156, width: 12, height: 36}],
      ['path', {d: 'M98 150 L110 66 L192 66 L196 150 Z'}],
      ['path', {d: 'M118 76 L184 76 L188 140 L114 140 Z'}],
      ...wheel(122, 200, 56), ...wheel(300, 216, 32)
    ], lines: '<path d="M80 200 h84 M122 158 v84" stroke="#222" stroke-width="2" opacity=".35"/>'},

    {id: 'segelbat', name: 'Segelbåt', regions: [BG,
      ['path', {d: 'M0 214 Q50 200 100 214 Q150 228 200 214 Q250 200 300 214 Q350 228 400 214 L400 300 L0 300 Z'}],
      ['circle', {cx: 72, cy: 66, r: 32}],
      ['path', {d: 'M200 40 L200 182 L106 182 Z'}],
      ['path', {d: 'M212 64 L212 182 L292 182 Z'}],
      ['path', {d: 'M200 40 L232 48 L200 58 Z'}],
      ['path', {d: 'M92 190 L318 190 L290 232 L120 232 Z'}],
      ['circle', {cx: 150, cy: 210, r: 7}], ['circle', {cx: 200, cy: 210, r: 7}], ['circle', {cx: 250, cy: 210, r: 7}]
    ], lines: '<path d="M206 36 L206 190" stroke="#222" stroke-width="5"/><path d="M40 260 q12 -8 24 0 M300 270 q12 -8 24 0" stroke="#222" stroke-width="3" fill="none"/>'}
  ];

  const attrs = a => Object.entries(a).map(([k, v]) => `${k}="${v}"`).join(' ');
  // Varje yta ritas med sin fyllning, de penseldrag som gjorts i den (klippta till ytan, så att färgen
  // aldrig hamnar utanför linjerna) och sin kontur. Senare ytor täcker tidigare, som i en vanlig
  // målarbok. Linjerna som inte går att fylla ligger överst.
  let picUid = 0;
  const ptsToD = p => p.length < 4 ? '' : `M${p[0]} ${p[1]}` + (p.length === 2 ? ' l0.01 0' : '') + Array.from({length: p.length / 2 - 1}, (_, k) => ` L${p[2 + k * 2]} ${p[3 + k * 2]}`).join('') + (p.length === 2 ? '' : '');
  const strokeSvg = st => `<path d="${st.p.length === 2 ? `M${st.p[0]} ${st.p[1]} l0.01 0` : ptsToD(st.p)}" stroke="${st.c}" stroke-width="${st.w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  function picSvg(p, pic, interactive){
    const id = 'flp' + (picUid++), fills = pic.f, byR = {};
    (pic.s || []).forEach(st => { (byR[st.i] = byR[st.i] || []).push(st); });
    const clips = p.regions.map(([tag, a], i) => `<clipPath id="${id}c${i}"><${tag} ${attrs(a)}/></clipPath>`).join('');
    const body = p.regions.map(([tag, a], i) =>
      `<${tag} ${attrs(a)} class="fr" data-i="${i}" fill="${fills[i] || '#ffffff'}"${interactive ? ' role="button" aria-label="Yta ' + (i + 1) + '"' : ''}/>`
      + `<g class="pg" data-i="${i}" clip-path="url(#${id}c${i})" pointer-events="none">${(byR[i] || []).map(strokeSvg).join('')}</g>`
      + `<${tag} ${attrs(a)} fill="none" stroke="#222" stroke-width="3" stroke-linejoin="round" pointer-events="none"/>`).join('');
    return `<svg viewBox="0 0 400 300" aria-hidden="${interactive ? 'false' : 'true'}"><defs>${clips}</defs>${body}<g pointer-events="none">${p.lines}</g></svg>`;
  }

  function start(root, opts){
    opts = opts || {};
    const store = opts.storage || {get(){ return null; }, set(){}};
    const load = id => {
      let d = null; try{ d = JSON.parse(store.get('bild-' + id) || 'null'); }catch(e){}
      if(Array.isArray(d)) return {f: d, s: []};
      return d && Array.isArray(d.f) ? {f: d.f, s: Array.isArray(d.s) ? d.s : []} : {f: [], s: []};
    };
    const keep = (id, pic) => { try{ store.set('bild-' + id, JSON.stringify(pic)); }catch(e){} };
    // Stor nivå: pensel (förvald) och fyll. Liten nivå: bara fyll.
    const BRUSH = opts.level === 'big';
    const SIZES = [{w: 5, name: 'Liten pensel'}, {w: 11, name: 'Mellan pensel'}, {w: 22, name: 'Stor pensel'}];
    const MAX_STROKES = 600;

    if(!document.getElementById('fl-css')){
      const s = document.createElement('style'); s.id = 'fl-css'; s.textContent = CSS; document.head.append(s);
    }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'fl';
    root.append(el);

    // ---------- Ljud ----------
    let ac = null;
    function tone(freqs, vol){
      if(!opts.sound) return;
      try{
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        freqs.forEach((f, i) => {
          const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * 0.1;
          o.type = 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
          o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.25);
        });
      }catch(e){}
    }
    function say(text){
      if(!opts.sound || !window.speechSynthesis) return;
      try{
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'sv-SE'; u.rate = 0.95;
        const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.replace('_', '-').startsWith('sv'));
        if(v) u.voice = v;
        speechSynthesis.speak(u);
      }catch(e){}
    }

    let color = 0, ro = null, yayTimer = null, sureTimer = null;

    // ---------- Välj bild ----------
    function showList(){
      if(ro){ ro.disconnect(); ro = null; }
      el.innerHTML = `<div class="fl-top"><div class="fl-title">Färglägg</div></div><div class="fl-list" role="group" aria-label="Bilder"></div>`;
      const list = el.querySelector('.fl-list');
      PICS.forEach(p => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'fl-thumb';
        b.innerHTML = picSvg(p, load(p.id), false) + '<span class="nm"></span>';
        b.querySelector('.nm').textContent = p.name;
        b.setAttribute('aria-label', 'Färglägg ' + p.name.toLowerCase());
        b.addEventListener('click', () => { tone([523, 659]); say(p.name); showPic(p); });
        list.append(b);
      });
    }

    // ---------- Måla ----------
    function showPic(p){
      let pic = load(p.id), undo = [], tool = BRUSH ? 'brush' : 'fill', size = 1;
      el.innerHTML = `
        <div class="fl-top"><button type="button" class="fl-btn" data-a="list">← Bilder</button><div class="fl-title"></div>
          <button type="button" class="fl-btn" data-a="undo">↶ Ångra</button><button type="button" class="fl-btn" data-a="clear">Sudda allt</button><button type="button" class="fl-btn done" data-a="done">Klar!</button></div>
        <div class="fl-main"><div class="fl-pic"><div class="fl-yay" aria-live="polite"><div class="stars">🎨⭐🎨</div><div class="big">Så fint!</div></div></div><div class="fl-side"><div class="fl-pal" role="group" aria-label="Färger"></div></div></div>`;
      el.querySelector('.fl-title').textContent = p.name;
      const picEl = el.querySelector('.fl-pic'), pal = el.querySelector('.fl-pal'), main = el.querySelector('.fl-main'), yay = el.querySelector('.fl-yay');
      let svg = null;
      const draw = () => {
        picEl.querySelector('svg') && picEl.querySelector('svg').remove();
        picEl.insertAdjacentHTML('afterbegin', picSvg(p, pic, true));
        svg = picEl.querySelector('svg');
        svg.style.touchAction = 'none';
        svg.addEventListener('pointerdown', down);
      };
      // Den översta ytan under fingret.
      const regionAt = (x, y) => { const hit = document.elementsFromPoint(x, y).find(n => n.classList && n.classList.contains('fr') && svg.contains(n)); return hit ? +hit.dataset.i : -1; };
      function toSvg(e){ const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const q = pt.matrixTransform(svg.getScreenCTM().inverse()); return [Math.round(q.x * 10) / 10, Math.round(q.y * 10) / 10]; }
      function down(e){
        const i = regionAt(e.clientX, e.clientY); if(i < 0) return;
        e.preventDefault();
        if(tool === 'fill'){ fill(i); return; }
        if(pic.s.length >= MAX_STROKES) pic.s.shift();
        // Ett penseldrag stannar i den yta där det började.
        const st = {i, c: COLORS[color][1], w: SIZES[size].w, p: toSvg(e)};
        pic.s.push(st);
        const g = svg.querySelector(`.pg[data-i="${i}"]`);
        g.insertAdjacentHTML('beforeend', strokeSvg(st));
        const path = g.lastElementChild;
        svg.setPointerCapture && svg.setPointerCapture(e.pointerId);
        tone([330 + color * 30], 0.05);
        const move = ev => {
          const [x, y] = toSvg(ev), n = st.p.length;
          if(Math.hypot(x - st.p[n - 2], y - st.p[n - 1]) < 1.6) return;
          st.p.push(x, y); path.setAttribute('d', ptsToD(st.p));
        };
        const up = () => {
          svg.removeEventListener('pointermove', move); svg.removeEventListener('pointerup', up); svg.removeEventListener('pointercancel', up);
          undo.push({t: 'stroke'}); keep(p.id, pic);
        };
        svg.addEventListener('pointermove', move); svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
      }
      function fill(i){
        const c = COLORS[color][1];
        if((pic.f[i] || '#ffffff') === c) return;
        undo.push({t: 'fill', i, prev: pic.f[i]});
        pic.f[i] = c; svg.querySelector(`.fr[data-i="${i}"]`).setAttribute('fill', c);
        keep(p.id, pic);
        tone([330 + color * 30], 0.09);
      }
      // Verktyg på stor nivå: pensel med tre storlekar, och fyll.
      if(BRUSH){
        const tools = document.createElement('div'); tools.className = 'fl-tools'; tools.setAttribute('role', 'group'); tools.setAttribute('aria-label', 'Verktyg');
        tools.innerHTML = `<div class="fl-trow"><button type="button" class="fl-tool" data-t="brush" aria-label="Pensel">🖌️</button><button type="button" class="fl-tool" data-t="fill" aria-label="Fyll hela ytan">🪣</button></div>`
          + `<div class="fl-trow fl-sizes">${SIZES.map((z, k) => `<button type="button" class="fl-size" data-s="${k}" aria-label="${z.name}"><i style="width:${6 + k * 7}px;height:${6 + k * 7}px"></i></button>`).join('')}</div>`;
        const paintTools = () => {
          tools.querySelectorAll('.fl-tool').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.t === tool)));
          tools.querySelectorAll('.fl-size').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.s === size)));
          tools.querySelector('.fl-sizes').style.visibility = tool === 'brush' ? 'visible' : 'hidden';
        };
        tools.addEventListener('click', ev => {
          const b = ev.target.closest('button'); if(!b) return;
          if(b.dataset.t){ tool = b.dataset.t; say(tool === 'brush' ? 'Pensel' : 'Fyll'); }
          if(b.dataset.s){ size = +b.dataset.s; }
          tone([600], 0.05); paintTools();
        });
        pal.before(tools); paintTools();
      }
      COLORS.forEach(([name, hex], i) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'fl-sw';
        b.style.background = hex; b.setAttribute('aria-label', name); b.setAttribute('aria-pressed', String(i === color));
        b.addEventListener('click', () => {
          color = i;
          pal.querySelectorAll('.fl-sw').forEach((x, j) => x.setAttribute('aria-pressed', String(j === i)));
          tone([440 + i * 20], 0.07); say(name);
        });
        pal.append(b);
      });
      el.querySelector('[data-a="list"]').addEventListener('click', showList);
      el.querySelector('[data-a="undo"]').addEventListener('click', () => {
        const last = undo.pop(); if(!last) return;
        if(last.t === 'stroke') pic.s.pop();
        else if(last.prev) pic.f[last.i] = last.prev; else delete pic.f[last.i];
        keep(p.id, pic); draw(); tone([400, 330], 0.07);
      });
      const clearBtn = el.querySelector('[data-a="clear"]');
      clearBtn.addEventListener('click', () => {
        if(!clearBtn.classList.contains('sure')){
          clearBtn.classList.add('sure'); clearBtn.textContent = 'Tryck igen för att sudda';
          clearTimeout(sureTimer); sureTimer = setTimeout(() => { clearBtn.classList.remove('sure'); clearBtn.textContent = 'Sudda allt'; }, 3000);
          return;
        }
        clearTimeout(sureTimer); clearBtn.classList.remove('sure'); clearBtn.textContent = 'Sudda allt';
        pic = {f: [], s: []}; undo = []; keep(p.id, pic); draw(); tone([500, 400, 300], 0.07);
      });
      el.querySelector('[data-a="done"]').addEventListener('click', () => {
        yay.classList.add('on'); tone([523, 659, 784, 1047]); say('Så fint!');
        clearTimeout(yayTimer); yayTimer = setTimeout(() => yay.classList.remove('on'), 2200);
        if(typeof opts.onFinish === 'function') opts.onFinish();
      });
      const layout = () => main.classList.toggle('port', main.clientHeight > main.clientWidth * 0.9);
      ro = window.ResizeObserver ? new ResizeObserver(layout) : null;
      if(ro) ro.observe(main);
      draw(); layout();
    }

    showList();

    return {
      stop(){
        clearTimeout(yayTimer); clearTimeout(sureTimer);
        if(ro) ro.disconnect();
        try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
        try{ if(ac) ac.close(); }catch(e){}
        root.innerHTML = '';
      }
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'farglagg', title: 'Färglägg', icon: '🎨',
    about: 'Välj en bild och en färg och tryck på ytorna för att fylla dem, eller måla med pensel på stor nivå. Fågel, polisbil, brandbil, hjullastare, mobilkran, grävmaskin, traktor och segelbåt. Stor nivå: pensel i tre storlekar som stannar inom ytan.',
    start,
    _test: {PICS, COLORS}
  });
})();
