/* Klä på dockan – blanda hattar, tröjor, byxor, skor och saker från olika teman.
   Figuren och alla kläder ritas av spelet i lager. Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.kd{height:100%;display:flex;flex-direction:column;gap:12px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.kd-top{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px}
.kd-title{font-size:1.7rem;font-weight:800;line-height:1}
.kd-done{border:0;background:var(--done,#F2B33D);color:#2B1E00;font:inherit;font-weight:800;border-radius:999px;padding:7px 18px;cursor:pointer}
.kd-main{flex:1;min-height:0;display:flex;gap:14px}
.kd-main.port{flex-direction:column}
.kd-fig{flex:1 1 42%;min-width:0;min-height:0;display:grid;place-items:center;border-radius:26px;
  background:radial-gradient(circle at 50% 35%,#fff7e0,#ffe3a6 70%);position:relative;overflow:hidden}
.kd-svg{position:absolute;left:0;right:0;top:3%;bottom:3%;display:flex;justify-content:center}
.kd-svg svg{height:100%;width:auto;max-width:100%}
.kd-main.port .kd-fig{flex:1 1 56%}
.kd-main.port .kd-panel{flex:1 1 44%}
.kd-floor{position:absolute;left:15%;right:15%;bottom:3%;height:5%;border-radius:50%;background:rgba(0,0,0,.08)}
.kd-panel{flex:1 1 58%;min-width:0;min-height:0;display:flex;flex-direction:column;gap:10px}
.kd-tabs,.kd-themes,.kd-acts{display:flex;gap:8px;flex-wrap:wrap}
.kd-tab{border:0;background:var(--card,#fff);color:inherit;font:inherit;font-weight:700;border-radius:16px;padding:6px 10px;cursor:pointer;
  box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);display:flex;align-items:center;gap:6px;font-size:1rem}
.kd-tab .ic{font-size:1.5rem;line-height:1}
.kd-tab[aria-pressed="true"]{box-shadow:inset 0 0 0 4px var(--accent,#2F6FD6)}
.kd-items{flex:1;min-height:0;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:10px;align-content:start;padding:2px}
.kd-item{border:0;background:var(--card,#fff);color:inherit;font:inherit;border-radius:18px;cursor:pointer;padding:6px 4px 8px;
  box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);display:flex;flex-direction:column;align-items:center;gap:4px}
.kd-item svg{width:100%;height:76px}
.kd-item .lb{font-weight:700;font-size:.85rem;line-height:1.1;text-align:center}
.kd-item[aria-pressed="true"]{box-shadow:inset 0 0 0 5px var(--done,#F2B33D)}
.kd-swatch{width:56px;height:56px;border-radius:50%;border:0;cursor:pointer;box-shadow:inset 0 0 0 3px rgba(0,0,0,.12)}
.kd-swatch[aria-pressed="true"]{box-shadow:0 0 0 4px var(--card,#fff),0 0 0 7px var(--done,#F2B33D)}
.kd-sub{font-weight:700;opacity:.75;grid-column:1/-1;margin-top:4px}
.kd-theme{border:0;background:var(--card,#fff);border-radius:50%;width:54px;height:54px;font-size:1.9rem;line-height:1;cursor:pointer;
  box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);display:grid;place-items:center;padding:0}
.kd-act{border:2px solid var(--line,#C6D1DF);background:var(--card,#fff);color:inherit;font:inherit;font-weight:700;border-radius:999px;padding:6px 14px;cursor:pointer}
.kd button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
.kd-yay{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:12%;gap:6px;pointer-events:none;z-index:5}
.kd-yay.on{display:flex}
.kd-yay .big{font-size:clamp(2rem,6vmin,3.6rem);font-weight:800;line-height:1;text-shadow:0 0 14px #fff,0 0 4px #fff}
.kd-yay .stars{font-size:clamp(2rem,7vmin,3.6rem);line-height:1;animation:kd-hop .8s ease-out 2}
.kd-fig.flash::after{content:"";position:absolute;inset:0;background:#fff;animation:kd-flash .5s ease-out forwards}
@keyframes kd-flash{from{opacity:.9}to{opacity:0}}
@keyframes kd-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-16px)}}
@media (prefers-reduced-motion: reduce){ .kd-yay .stars,.kd-fig.flash::after{animation:none;opacity:0} }`;

  // ---------- Figuren ----------
  const SKINS = ['#f6d3b3', '#e3b48a', '#b97a50', '#7a4a2b'];
  const HAIR_COLORS = [['Brunt', '#6b4226'], ['Ljust', '#e6c35c'], ['Svart', '#2a2421'], ['Rött', '#c2532b']];
  const HAIR_STYLES = [['Kort', 'kort'], ['Långt', 'lang'], ['Lockigt', 'lockigt']];

  function hairBack(style, c){
    return style === 'lang' ? `<path d="M60 64 Q56 148 72 156 L128 156 Q144 148 140 64 Z" fill="${c}"/>` : '';
  }
  function hairFront(style, c){
    if(style === 'lockigt'){
      return [[66,62],[72,46],[86,36],[100,33],[114,36],[128,46],[134,62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="${c}"/>`).join('');
    }
    return `<path d="M63 72 Q60 32 100 33 Q140 32 137 72 Q131 52 112 50 Q104 58 92 52 Q72 52 63 72 Z" fill="${c}"/>`;
  }
  function body(skin){
    return `
      <rect x="79" y="198" width="19" height="152" rx="9" fill="${skin}"/>
      <rect x="102" y="198" width="19" height="152" rx="9" fill="${skin}"/>
      <path d="M74 124 L56 226 M126 124 L144 226" stroke="${skin}" stroke-width="17" stroke-linecap="round" fill="none"/>
      <circle cx="55" cy="232" r="10" fill="${skin}"/><circle cx="145" cy="232" r="10" fill="${skin}"/>
      <rect x="70" y="112" width="60" height="96" rx="14" fill="${skin}"/>
      <rect x="92" y="100" width="16" height="16" fill="${skin}"/>
      <circle cx="63" cy="76" r="7" fill="${skin}"/><circle cx="137" cy="76" r="7" fill="${skin}"/>
      <circle cx="100" cy="72" r="36" fill="${skin}"/>
      <circle cx="87" cy="74" r="4.5" fill="#2a2421"/><circle cx="113" cy="74" r="4.5" fill="#2a2421"/>
      <circle cx="88.5" cy="72.5" r="1.4" fill="#fff"/><circle cx="114.5" cy="72.5" r="1.4" fill="#fff"/>
      <circle cx="79" cy="86" r="6" fill="#ff8a8a" opacity=".45"/><circle cx="121" cy="86" r="6" fill="#ff8a8a" opacity=".45"/>
      <path d="M88 88 Q100 99 112 88" stroke="#7a3a2a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }
  const bareFeet = skin => `<ellipse cx="88" cy="352" rx="13" ry="7" fill="${skin}"/><ellipse cx="112" cy="352" rx="13" ry="7" fill="${skin}"/>`;

  // ---------- Kläderna ----------
  // Varje plagg är en bit SVG i figurens koordinater (200 × 400).
  const shirt = (c, extra = '', sleeve = 178) => `
    <path d="M74 124 L${74 - (sleeve - 124) * 0.18} ${sleeve} M126 124 L${126 + (sleeve - 124) * 0.18} ${sleeve}" stroke="${c}" stroke-width="24" stroke-linecap="round" fill="none"/>
    <rect x="65" y="109" width="70" height="102" rx="16" fill="${c}"/>${extra}`;
  const trousers = (c, extra = '', to = 345) => `
    <rect x="76" y="196" width="25" height="${to - 196}" rx="8" fill="${c}"/><rect x="99" y="196" width="25" height="${to - 196}" rx="8" fill="${c}"/>
    <rect x="68" y="194" width="64" height="30" rx="10" fill="${c}"/>${extra}`;
  const shoes = (c, extra = '') => `
    <path d="M72 342 h28 v12 a6 6 0 0 1 -6 6 h-24 a8 8 0 0 1 0 -12 z" fill="${c}"/>
    <path d="M128 342 h-28 v12 a6 6 0 0 0 6 6 h24 a8 8 0 0 0 0 -12 z" fill="${c}"/>${extra}`;
  const boots = (c, top, extra = '') => `
    <rect x="75" y="${top}" width="27" height="${352 - top}" rx="6" fill="${c}"/><rect x="98" y="${top}" width="27" height="${352 - top}" rx="6" fill="${c}"/>
    <path d="M70 348 h32 v12 h-28 a6 6 0 0 1 -4 -12 z M130 348 h-32 v12 h28 a6 6 0 0 0 4 -12 z" fill="${c}"/>${extra}`;

  const THEMES = [
    {id: 'polis', name: 'Polis', icon: '👮', items: {
      hatt:  ['Polismössa', `<path d="M62 50 Q100 12 138 50 L138 58 L62 58 Z" fill="#23365e"/><rect x="62" y="52" width="76" height="10" fill="#111"/>
              <ellipse cx="100" cy="63" rx="42" ry="7" fill="#111"/><circle cx="100" cy="40" r="7" fill="#f2c94c"/>`],
      troja: ['Polisskjorta', shirt('#2f4b85', `<path d="M90 109 L100 124 L110 109" fill="#23365e"/><path d="M84 140 l5 -8 l5 8 l-5 4 z" fill="#f2c94c"/>
              <rect x="104" y="134" width="18" height="14" rx="3" fill="#23365e"/><rect x="65" y="196" width="70" height="8" fill="#1b2a4a"/>`)],
      byxor: ['Polisbyxor', trousers('#23365e', `<rect x="76" y="230" width="4" height="115" fill="#f2c94c"/><rect x="120" y="230" width="4" height="115" fill="#f2c94c"/>`)],
      skor:  ['Svarta skor', shoes('#151515')],
      sak:   ['Radio', `<rect x="138" y="198" width="17" height="32" rx="4" fill="#222"/><rect x="141" y="203" width="11" height="8" rx="2" fill="#7fd1a8"/>
              <line x1="152" y1="198" x2="152" y2="182" stroke="#222" stroke-width="3" stroke-linecap="round"/>`]
    }},
    {id: 'brandman', name: 'Brandman', icon: '🧑‍🚒', items: {
      hatt:  ['Brandhjälm', `<path d="M58 60 Q58 16 100 16 Q142 16 142 60 Z" fill="#d63b2f"/><ellipse cx="100" cy="62" rx="52" ry="9" fill="#a92c22"/>
              <path d="M90 24 h20 v20 l-10 6 l-10 -6 z" fill="#f2c94c"/>`],
      troja: ['Brandjacka', shirt('#d63b2f', `<rect x="65" y="170" width="70" height="9" fill="#f2c94c"/><rect x="65" y="180" width="70" height="4" fill="#d9dde3"/>
              <path d="M60 165 l12 2 M140 165 l-12 2" stroke="#f2c94c" stroke-width="8"/><rect x="97" y="109" width="6" height="102" fill="#a92c22"/>`, 190)],
      byxor: ['Brandbyxor', trousers('#d63b2f', `<rect x="76" y="300" width="48" height="9" fill="#f2c94c"/><rect x="76" y="310" width="48" height="4" fill="#d9dde3"/>`)],
      skor:  ['Stövlar', boots('#1d1d1d', 312, `<rect x="70" y="356" width="60" height="4" fill="#f2c94c"/>`)],
      sak:   ['Brandsläckare', `<rect x="136" y="200" width="22" height="44" rx="8" fill="#d63b2f"/><rect x="141" y="192" width="12" height="10" fill="#333"/>
              <path d="M153 196 q16 -6 18 14" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round"/>`]
    }},
    {id: 'ballerina', name: 'Ballerina', icon: '🩰', items: {
      hatt:  ['Diadem', `<path d="M68 52 Q100 28 132 52" stroke="#f3a9c9" stroke-width="6" fill="none" stroke-linecap="round"/>
              <path d="M88 40 l6 -14 l6 10 l6 -10 l6 14 z" fill="#f2c94c"/><circle cx="100" cy="30" r="3.5" fill="#ff7aa8"/>`],
      troja: ['Balettdräkt', `<rect x="70" y="114" width="60" height="96" rx="14" fill="#f7a8c8"/><path d="M78 114 v-8 M122 114 v-8" stroke="#f7a8c8" stroke-width="6" stroke-linecap="round"/>
              <circle cx="100" cy="150" r="5" fill="#fff" opacity=".7"/>`],
      byxor: ['Tutu', `<rect x="79" y="198" width="19" height="152" rx="9" fill="#ffd3e4"/><rect x="102" y="198" width="19" height="152" rx="9" fill="#ffd3e4"/>
              <path d="M44 236 q12 -12 22 0 q12 -12 22 0 q12 -12 24 0 q12 -12 22 0 q12 -12 22 0 L148 214 Q100 186 52 214 Z" fill="#ffb6d0"/>
              <path d="M54 228 Q100 204 146 228" stroke="#ff8fb7" stroke-width="3" fill="none"/>`],
      skor:  ['Balettskor', shoes('#f7a8c8', `<path d="M86 342 l-8 -26 M92 342 l8 -26 M108 342 l-8 -26 M114 342 l8 -26" stroke="#f7a8c8" stroke-width="2.5"/>`)],
      sak:   ['Ros', `<path d="M145 232 Q148 210 152 186" stroke="#3f8f45" stroke-width="4" fill="none"/><path d="M149 210 q10 -6 14 2" fill="#3f8f45"/>
              <circle cx="152" cy="182" r="11" fill="#e8384f"/><path d="M146 180 q6 -8 12 0" stroke="#b71d34" stroke-width="2.5" fill="none"/>`]
    }},
    {id: 'pirat', name: 'Pirat', icon: '🏴‍☠️', items: {
      hatt:  ['Piratskepa', `<path d="M48 56 Q100 4 152 56 Q100 40 48 56 Z" fill="#232020"/><path d="M60 50 Q100 34 140 50" stroke="#d4a537" stroke-width="3" fill="none"/>
              <circle cx="100" cy="36" r="7" fill="#fff"/><circle cx="97.5" cy="35" r="1.6" fill="#232020"/><circle cx="102.5" cy="35" r="1.6" fill="#232020"/>
              <path d="M140 46 q16 -26 4 -40" stroke="#d63b2f" stroke-width="5" fill="none" stroke-linecap="round"/>`],
      troja: ['Randig tröja', shirt('#ffffff', `<g fill="#d63b2f"><rect x="65" y="122" width="70" height="9"/><rect x="65" y="142" width="70" height="9"/><rect x="65" y="162" width="70" height="9"/><rect x="65" y="182" width="70" height="9"/></g>
              <path d="M65 118 L80 118 L84 211 L65 211 Z M135 118 L120 118 L116 211 L135 211 Z" fill="#7a4a24"/>`)],
      byxor: ['Piratbyxor', trousers('#7a4a24', `<path d="M76 278 l6 8 l6 -8 l6 8 l6 -8 M100 278 l6 8 l6 -8 l6 8 l6 -8" stroke="#5a3418" stroke-width="3" fill="none"/>
              <rect x="68" y="194" width="64" height="9" fill="#d63b2f"/>`, 282)],
      skor:  ['Piratstövlar', boots('#5a3418', 296, `<rect x="72" y="296" width="33" height="10" rx="3" fill="#7a4a24"/><rect x="95" y="296" width="33" height="10" rx="3" fill="#7a4a24"/>`)],
      sak:   ['Kikare', `<path d="M142 236 L158 224" stroke="#6b4226" stroke-width="15" stroke-linecap="butt"/>
              <path d="M158 224 L172 214" stroke="#8a5a2b" stroke-width="12" stroke-linecap="butt"/>
              <path d="M172 214 L184 205" stroke="#a8703a" stroke-width="9" stroke-linecap="butt"/>
              <path d="M157 225 L160 223 M171 215 L174 213" stroke="#d4a537" stroke-width="17"/>
              <ellipse cx="185" cy="204.5" rx="3" ry="5.5" transform="rotate(-37 185 204.5)" fill="#bfe6ff"/>`]
    }},
    {id: 'astronaut', name: 'Astronaut', icon: '🧑‍🚀', items: {
      hatt:  ['Rymdhjälm', `<circle cx="100" cy="72" r="52" fill="rgba(190,225,255,.35)" stroke="#d9dde3" stroke-width="9"/>
              <path d="M70 46 q14 -16 34 -16" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>`],
      troja: ['Rymddräkt', shirt('#eef1f5', `<rect x="84" y="130" width="32" height="26" rx="5" fill="#9aa3ad"/><circle cx="92" cy="143" r="4" fill="#e8473c"/><circle cx="104" cy="143" r="4" fill="#3b7fe0"/>
              <rect x="70" y="120" width="16" height="10" fill="#3b7fe0"/><rect x="70" y="124" width="16" height="2.5" fill="#f2c94c"/><rect x="76" y="120" width="2.5" height="10" fill="#f2c94c"/>`, 200)],
      byxor: ['Rymdbyxor', trousers('#eef1f5', `<rect x="76" y="270" width="25" height="10" fill="#c7cdd5"/><rect x="99" y="270" width="25" height="10" fill="#c7cdd5"/>`)],
      skor:  ['Rymdkängor', boots('#c7cdd5', 318, `<rect x="70" y="352" width="60" height="8" rx="3" fill="#6f7882"/>`)],
      sak:   ['Flagga', `<line x1="146" y1="244" x2="146" y2="160" stroke="#8a929c" stroke-width="4" stroke-linecap="round"/>
              <rect x="146" y="160" width="40" height="26" fill="#3b7fe0"/><rect x="158" y="160" width="7" height="26" fill="#f2c94c"/><rect x="146" y="170" width="40" height="6" fill="#f2c94c"/>`]
    }},
    {id: 'kock', name: 'Kock', icon: '🧑‍🍳', items: {
      hatt:  ['Kockmössa', `<circle cx="80" cy="26" r="18" fill="#fff"/><circle cx="100" cy="16" r="20" fill="#fff"/><circle cx="120" cy="26" r="18" fill="#fff"/>
              <rect x="72" y="26" width="56" height="26" rx="4" fill="#fff" stroke="#d9dde3" stroke-width="2"/>`],
      troja: ['Kockrock', shirt('#ffffff', `<path d="M100 109 L100 211" stroke="#d9dde3" stroke-width="2"/><g fill="#9aa3ad"><circle cx="90" cy="130" r="3"/><circle cx="90" cy="150" r="3"/><circle cx="90" cy="170" r="3"/><circle cx="110" cy="130" r="3"/><circle cx="110" cy="150" r="3"/><circle cx="110" cy="170" r="3"/></g>
              <path d="M86 109 h28 v8 h-28 z" fill="#e8473c"/>`)],
      byxor: ['Rutiga byxor', trousers('#2a2421', `<g fill="#fff" opacity=".9">${Array.from({length: 13}, (_, r) => Array.from({length: 4}, (_, c) => `<rect x="${77 + c * 12 + (r % 2) * 6}" y="${200 + r * 11}" width="6" height="6"/>`).join('')).join('')}</g>`)],
      skor:  ['Träskor', shoes('#e6e8eb', `<path d="M72 352 h28 M128 352 h-28" stroke="#9aa3ad" stroke-width="2"/>`)],
      sak:   ['Stekpanna', `<line x1="145" y1="232" x2="160" y2="214" stroke="#3a3a3a" stroke-width="6" stroke-linecap="round"/>
              <ellipse cx="174" cy="200" rx="20" ry="16" fill="#3a3a3a"/><ellipse cx="174" cy="200" rx="14" ry="10" fill="#555"/><circle cx="176" cy="199" r="6" fill="#ffd34d"/><circle cx="176" cy="199" r="3" fill="#f2a12e"/>`]
    }}
  ];
  const SLOTS = [
    {id: 'hatt',  name: 'Hattar', icon: '🎩', view: '38 -4 124 104'},
    {id: 'troja', name: 'Tröjor', icon: '👕', view: '28 100 144 120'},
    {id: 'byxor', name: 'Byxor', icon: '👖', view: '38 186 124 176'},
    {id: 'skor',  name: 'Skor', icon: '👟', view: '56 288 88 80'},
    {id: 'sak',   name: 'Saker', icon: '🧸', view: '116 150 90 104'}
  ];
  const item = (slot, theme) => { const t = THEMES.find(x => x.id === theme); return t && t.items[slot]; };

  function figureSvg(st){
    const skin = SKINS[st.skin], hc = HAIR_COLORS[st.hairColor][1], hs = HAIR_STYLES[st.hairStyle][1], w = st.wear;
    const part = slot => w[slot] ? item(slot, w[slot])[1] : '';
    return `<svg viewBox="0 0 200 400" role="img" aria-label="Figuren">
      ${hairBack(hs, hc)}${body(skin)}${w.skor ? '' : bareFeet(skin)}
      ${part('byxor')}${part('skor')}${part('troja')}${hairFront(hs, hc)}${part('hatt')}${part('sak')}
    </svg>`;
  }

  function start(root, opts){
    opts = opts || {};
    const store = opts.storage || {get(){ return null; }, set(){}};
    let st = null;
    try{ st = JSON.parse(store.get('figur') || 'null'); }catch(e){}
    if(!st || !st.wear) st = {skin: 0, hairColor: 0, hairStyle: 0, wear: {}};
    const save = () => { try{ store.set('figur', JSON.stringify(st)); }catch(e){} };

    if(!document.getElementById('kd-css')){
      const s = document.createElement('style'); s.id = 'kd-css'; s.textContent = CSS; document.head.append(s);
    }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'kd';
    el.innerHTML = `
      <div class="kd-top"><div class="kd-title">Klä på dockan</div><button type="button" class="kd-done">Klar!</button></div>
      <div class="kd-main">
        <div class="kd-fig"><div class="kd-floor"></div><div class="kd-svg"></div><div class="kd-yay" aria-live="polite"><div class="stars">✨⭐✨</div><div class="big">Så snygg!</div></div></div>
        <div class="kd-panel">
          <div class="kd-tabs" role="tablist"></div>
          <div class="kd-items" role="group"></div>
          <div class="kd-themes" role="group" aria-label="Hela dräkter"></div>
          <div class="kd-acts"><button type="button" class="kd-act" data-a="slump">🎲 Blanda</button><button type="button" class="kd-act" data-a="av">Ta av allt</button></div>
        </div>
      </div>
`;
    root.append(el);
    const figEl = el.querySelector('.kd-svg'), fig = el.querySelector('.kd-fig'), tabsEl = el.querySelector('.kd-tabs');
    const itemsEl = el.querySelector('.kd-items'), themesEl = el.querySelector('.kd-themes'), mainEl = el.querySelector('.kd-main');
    const yay = el.querySelector('.kd-yay');

    // ---------- Ljud ----------
    let ac = null;
    function tone(freqs, vol){
      if(!opts.sound) return;
      try{
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        freqs.forEach((f, i) => {
          const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * 0.1;
          o.type = 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.14, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
          o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.28);
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

    // ---------- Ritning ----------
    let tab = 'hatt';
    function drawFigure(){ figEl.innerHTML = figureSvg(st); }

    function drawTabs(){
      tabsEl.innerHTML = '';
      SLOTS.concat([{id: 'figur', name: 'Figur', icon: '🙂'}]).forEach(s => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'kd-tab'; b.setAttribute('role', 'tab');
        b.setAttribute('aria-pressed', String(tab === s.id));
        b.innerHTML = '<span class="ic"></span><span class="nm"></span>';
        b.querySelector('.ic').textContent = s.icon; b.querySelector('.nm').textContent = s.name;
        b.addEventListener('click', () => { tab = s.id; drawTabs(); drawItems(); });
        tabsEl.append(b);
      });
    }

    function drawItems(){
      itemsEl.innerHTML = '';
      if(tab === 'figur'){ drawFigureOptions(); return; }
      const slot = SLOTS.find(s => s.id === tab);
      THEMES.forEach(t => {
        const [name, svg] = t.items[slot.id];
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'kd-item';
        b.setAttribute('aria-pressed', String(st.wear[slot.id] === t.id));
        b.innerHTML = `<svg viewBox="${slot.view}" aria-hidden="true">${svg}</svg><span class="lb"></span>`;
        b.querySelector('.lb').textContent = name;
        b.addEventListener('click', () => wear(slot.id, t.id));
        itemsEl.append(b);
      });
    }

    function drawFigureOptions(){
      const sub = t => { const d = document.createElement('div'); d.className = 'kd-sub'; d.textContent = t; itemsEl.append(d); };
      sub('Hud');
      SKINS.forEach((c, i) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'kd-swatch';
        b.style.background = c; b.setAttribute('aria-label', 'Hudfärg ' + (i + 1)); b.setAttribute('aria-pressed', String(st.skin === i));
        b.addEventListener('click', () => { st.skin = i; tone([600], 0.08); changed(); });
        itemsEl.append(b);
      });
      sub('Hårfärg');
      HAIR_COLORS.forEach(([n, c], i) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'kd-swatch';
        b.style.background = c; b.setAttribute('aria-label', n + ' hår'); b.setAttribute('aria-pressed', String(st.hairColor === i));
        b.addEventListener('click', () => { st.hairColor = i; tone([600], 0.08); changed(); });
        itemsEl.append(b);
      });
      sub('Frisyr');
      HAIR_STYLES.forEach(([n, id], i) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'kd-item';
        b.setAttribute('aria-pressed', String(st.hairStyle === i));
        const hc = HAIR_COLORS[st.hairColor][1], skin = SKINS[st.skin];
        b.innerHTML = `<svg viewBox="40 20 120 100" aria-hidden="true">${hairBack(id, hc)}<circle cx="100" cy="72" r="36" fill="${skin}"/>${hairFront(id, hc)}</svg><span class="lb"></span>`;
        b.querySelector('.lb').textContent = n;
        b.addEventListener('click', () => { st.hairStyle = i; tone([600], 0.08); changed(); });
        itemsEl.append(b);
      });
    }

    function drawThemes(){
      themesEl.innerHTML = '';
      THEMES.forEach(t => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'kd-theme';
        b.textContent = t.icon; b.setAttribute('aria-label', 'Hela ' + t.name.toLowerCase() + 'dräkten');
        b.addEventListener('click', () => {
          SLOTS.forEach(s => st.wear[s.id] = t.id);
          tone([523, 659, 784]); say(t.name); changed();
        });
        themesEl.append(b);
      });
    }

    function changed(){ save(); drawFigure(); drawItems(); }

    // Ett tryck tar på plagget; ett tryck till på samma plagg tar av det.
    function wear(slot, theme){
      if(st.wear[slot] === theme){ delete st.wear[slot]; tone([400], 0.07); }
      else { st.wear[slot] = theme; tone([660, 880], 0.1); say(item(slot, theme)[0]); }
      changed();
    }

    el.querySelector('[data-a="slump"]').addEventListener('click', () => {
      SLOTS.forEach(s => {
        if(Math.random() < 0.85) st.wear[s.id] = THEMES[Math.floor(Math.random() * THEMES.length)].id;
        else delete st.wear[s.id];
      });
      tone([523, 784, 659, 988]); changed();
    });
    el.querySelector('[data-a="av"]').addEventListener('click', () => { st.wear = {}; tone([500, 400], 0.08); changed(); });

    let yayTimer = null;
    el.querySelector('.kd-done').addEventListener('click', () => {
      fig.classList.remove('flash'); void fig.offsetWidth; fig.classList.add('flash');
      yay.classList.add('on'); tone([523, 659, 784, 1047]); say('Så snygg!');
      clearTimeout(yayTimer); yayTimer = setTimeout(() => yay.classList.remove('on'), 2200);
      if(typeof opts.onFinish === 'function') opts.onFinish();
    });

    // Liggande: figuren till vänster. Stående: figuren överst.
    function layout(){ mainEl.classList.toggle('port', mainEl.clientHeight > mainEl.clientWidth * 1.05); }
    const ro = window.ResizeObserver ? new ResizeObserver(layout) : null;
    if(ro) ro.observe(mainEl); else window.addEventListener('resize', layout);

    drawFigure(); drawTabs(); drawItems(); drawThemes(); layout();

    return {
      stop(){
        clearTimeout(yayTimer);
        if(ro) ro.disconnect(); else window.removeEventListener('resize', layout);
        try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
        try{ if(ac) ac.close(); }catch(e){}
        root.innerHTML = '';
      }
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'klapadockan', title: 'Klä på dockan', icon: '👗',
    about: 'Klä figuren i hattar, tröjor, byxor, skor och saker från polis, brandman, ballerina, pirat, astronaut och kock – blanda fritt. Välj också hud, hårfärg och frisyr. Samma på båda nivåerna.',
    start
  });
})();
