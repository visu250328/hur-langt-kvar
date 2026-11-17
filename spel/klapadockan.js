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
    }},
    {id: 'dino', name: 'Dinosaurie', icon: '🦖', items: {
      hatt:  ['Dinoluva', `<path d="M54 84 Q52 26 100 24 Q148 26 146 84 L146 100 Q134 110 128 98 Q132 50 100 46 Q68 50 72 98 Q66 110 54 100 Z" fill="#43b55a"/>
              <g fill="#f28a2e"><path d="M72 34 l6 -16 l10 12 z"/><path d="M92 26 l8 -18 l8 18 z"/><path d="M112 30 l10 -12 l6 16 z"/></g>
              <g><circle cx="80" cy="40" r="7" fill="#fff"/><circle cx="120" cy="40" r="7" fill="#fff"/><circle cx="81" cy="41" r="3.5" fill="#1D2842"/><circle cx="119" cy="41" r="3.5" fill="#1D2842"/></g>
              <g fill="#fff"><path d="M76 52 l4 8 l4 -8 z"/><path d="M90 48 l4 8 l4 -8 z"/><path d="M102 48 l4 8 l4 -8 z"/><path d="M116 52 l4 8 l4 -8 z"/></g>`],
      troja: ['Dinodräkt', shirt('#43b55a', `<ellipse cx="100" cy="165" rx="21" ry="36" fill="#c8eba8"/><path d="M82 146 h36 M80 162 h40 M81 178 h38 M85 194 h30" stroke="#9fd17e" stroke-width="3"/>
              <g fill="#2f8a3f"><circle cx="72" cy="128" r="4"/><circle cx="128" cy="132" r="5"/><circle cx="62" cy="168" r="3.5"/><circle cx="139" cy="172" r="3.5"/></g>`, 200)],
      byxor: ['Dinobyxor', trousers('#43b55a', `<g fill="#2f8a3f"><circle cx="86" cy="236" r="5"/><circle cx="114" cy="252" r="6"/><circle cx="84" cy="290" r="4"/><circle cx="116" cy="306" r="5"/><circle cx="90" cy="326" r="3.5"/><circle cx="110" cy="214" r="4"/></g>`)],
      skor:  ['Dinofötter', `<path d="M66 340 h36 v14 a6 6 0 0 1 -6 6 h-28 a8 8 0 0 1 -2 -20 z M134 340 h-36 v14 a6 6 0 0 0 6 6 h28 a8 8 0 0 0 2 -20 z" fill="#2f8a3f"/>
              <g fill="#fff"><path d="M64 350 l-8 3 l8 4 z"/><path d="M68 342 l-7 -2 l5 7 z"/><path d="M136 350 l8 3 l-8 4 z"/><path d="M132 342 l7 -2 l-5 7 z"/></g>`],
      sak:   ['Dinosvans', `<path d="M122 196 Q168 198 192 252 Q164 232 124 222 Z" fill="#43b55a"/>
              <g fill="#f28a2e"><path d="M140 200 l8 -12 l4 14 z"/><path d="M160 208 l12 -8 l0 14 z"/><path d="M176 222 l14 -4 l-4 14 z"/></g>`]
    }},
    {id: 'snickare', name: 'Snickare', icon: '🔨', items: {
      hatt:  ['Bygghjälm', `<path d="M60 58 Q60 20 100 20 Q140 20 140 58 Z" fill="#f5c02e"/><rect x="50" y="54" width="100" height="9" rx="4.5" fill="#e0a800"/>
              <rect x="94" y="20" width="12" height="36" rx="4" fill="#e0a800"/><path d="M70 44 q4 -14 18 -18" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>`],
      troja: ['Rutig skjorta', shirt('#c9342a', `<g stroke="#8e1f18" stroke-width="3" opacity=".7"><path d="M65 128 h70 M65 150 h70 M65 172 h70 M65 194 h70"/><path d="M78 109 v102 M100 109 v102 M122 109 v102"/></g>
              <g stroke="#f2c0b8" stroke-width="1.5" opacity=".6"><path d="M65 139 h70 M65 161 h70 M65 183 h70"/><path d="M89 109 v102 M111 109 v102"/></g>
              <path d="M90 109 L100 122 L110 109" fill="#8e1f18"/>`, 196)],
      byxor: ['Snickarbyxor', trousers('#5b6470', `<rect x="78" y="290" width="21" height="22" rx="4" fill="#2a2e35"/><rect x="101" y="290" width="21" height="22" rx="4" fill="#2a2e35"/>
              <rect x="66" y="214" width="12" height="40" rx="2" fill="#4a5059"/><rect x="68" y="218" width="8" height="34" fill="#f5c02e"/><path d="M68 226 h8 M68 234 h8 M68 242 h8" stroke="#1D2842" stroke-width="1"/>
              <rect x="68" y="194" width="64" height="8" fill="#3a3f47"/><rect x="96" y="194" width="8" height="8" fill="#c9ced6"/>`)],
      skor:  ['Arbetskängor', boots('#8a5a2b', 318, `<rect x="70" y="354" width="60" height="6" rx="2" fill="#3a2414"/><path d="M82 324 h12 M82 332 h12 M106 324 h12 M106 332 h12" stroke="#f2e2c0" stroke-width="2"/>`)],
      sak:   ['Hammare', `<line x1="146" y1="240" x2="168" y2="186" stroke="#a8743e" stroke-width="7" stroke-linecap="round"/>
              <path d="M152 180 L184 192 L180 202 L160 196 L156 200 Z" fill="#8a929c" stroke="#5b6470" stroke-width="2" stroke-linejoin="round"/>`]
    }},
    {id: 'doktor', name: 'Doktor', icon: '🩺', items: {
      hatt:  ['Pannspegel', `<rect x="62" y="44" width="76" height="8" rx="4" fill="#d9dde3"/><circle cx="100" cy="38" r="13" fill="#c9ced6" stroke="#8a929c" stroke-width="3"/>
              <circle cx="100" cy="38" r="5" fill="#2a2e35"/><path d="M92 32 q4 -4 8 -4" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>`],
      troja: ['Läkarrock', shirt('#ffffff', `<path d="M80 109 L100 150 L120 109" fill="#5cc6a8"/><path d="M80 109 L100 150 L100 211 M120 109 L100 150" stroke="#d9dde3" stroke-width="2" fill="none"/>
              <rect x="108" y="160" width="20" height="18" rx="2" fill="#f3f5f7" stroke="#d9dde3" stroke-width="2"/><rect x="112" y="152" width="3" height="14" fill="#2f6fd6"/><rect x="118" y="152" width="3" height="14" fill="#e8302a"/>
              <path d="M84 112 Q76 150 92 160 Q100 166 100 176" stroke="#3a3f47" stroke-width="3" fill="none"/><path d="M116 112 Q120 140 108 150" stroke="#3a3f47" stroke-width="3" fill="none"/>
              <circle cx="100" cy="180" r="6" fill="#9aa4b0" stroke="#3a3f47" stroke-width="2"/>`, 205)],
      byxor: ['Gröna byxor', trousers('#5cc6a8', `<path d="M100 196 v150" stroke="#46a88c" stroke-width="2"/>`)],
      skor:  ['Vita skor', shoes('#f3f5f7', `<path d="M72 342 h28 v12 a6 6 0 0 1 -6 6 h-24 a8 8 0 0 1 0 -12 z M128 342 h-28 v12 a6 6 0 0 0 6 6 h24 a8 8 0 0 0 0 -12 z" fill="none" stroke="#c9ced6" stroke-width="2"/>`)],
      sak:   ['Läkarväska', `<path d="M146 214 q0 -12 14 -12 q14 0 14 12" stroke="#3a2414" stroke-width="4" fill="none"/><rect x="136" y="214" width="48" height="34" rx="7" fill="#5a3418"/>
              <rect x="155" y="220" width="10" height="22" fill="#fff"/><rect x="149" y="226" width="22" height="10" fill="#fff"/>`]
    }},
    {id: 'super', name: 'Superhjälte', icon: '🦸', items: {
      hatt:  ['Ögonmask', `<path d="M66 68 Q100 56 134 68 Q136 86 116 86 Q104 82 100 78 Q96 82 84 86 Q64 86 66 68 Z" fill="#e8302a"/>
              <ellipse cx="87" cy="73" rx="7" ry="5" fill="#fff"/><ellipse cx="113" cy="73" rx="7" ry="5" fill="#fff"/><circle cx="87" cy="74" r="3.5" fill="#2a2421"/><circle cx="113" cy="74" r="3.5" fill="#2a2421"/>`],
      troja: ['Superdräkt', `<path d="M72 112 L36 270 L64 258 L66 150 Z M128 112 L164 270 L136 258 L134 150 Z" fill="#e8302a"/>` + shirt('#2f6fd6', `<circle cx="100" cy="150" r="20" fill="#f5c02e"/><path d="M104 134 L92 152 L101 152 L96 166 L110 146 L101 146 Z" fill="#e8302a"/>
              <circle cx="55" cy="232" r="11" fill="#e8302a"/><circle cx="145" cy="232" r="11" fill="#e8302a"/>`, 226)],
      byxor: ['Superbyxor', trousers('#2f6fd6', `<rect x="68" y="194" width="64" height="11" fill="#f5c02e"/><rect x="94" y="193" width="12" height="13" rx="2" fill="#e0a800"/>`)],
      skor:  ['Superstövlar', boots('#e8302a', 300, `<path d="M75 300 l14 8 l13 -8 M98 300 l14 8 l13 -8" stroke="#b5241e" stroke-width="3" fill="none"/>`)],
      sak:   ['Sköld', `<circle cx="164" cy="222" r="24" fill="#e8302a"/><circle cx="164" cy="222" r="17" fill="#fff"/><circle cx="164" cy="222" r="11" fill="#2f6fd6"/>` + '<path d=\"M164.0 214.0L166.1 219.1L171.6 219.5L167.4 223.1L168.7 228.5L164.0 225.6L159.3 228.5L160.6 223.1L156.4 219.5L161.9 219.1Z\" fill=\"#fff\"/>']
    }},
    {id: 'trollkarl', name: 'Trollkarl', icon: '🧙', items: {
      hatt:  ['Trollkarlshatt', `<path d="M100 -4 Q112 20 136 52 L64 52 Q88 20 100 -4 Z" fill="#5b3fa8"/><ellipse cx="100" cy="54" rx="50" ry="8" fill="#4a2f8f"/>
              <g fill="#f5c02e"><path d="M92.0 20.0L93.6 23.8L97.7 24.1L94.6 26.8L95.5 30.9L92.0 28.7L88.5 30.9L89.4 26.8L86.3 24.1L90.4 23.8Z"/><path d="M110.0 35.0L111.3 38.2L114.8 38.5L112.1 40.7L112.9 44.0L110.0 42.2L107.1 44.0L107.9 40.7L105.2 38.5L108.7 38.2Z"/></g><circle cx="102" cy="14" r="2.5" fill="#fff"/>`],
      troja: ['Stjärnmantel', shirt('#5b3fa8', `<g fill="#f5c02e"><circle cx="82" cy="134" r="3"/><circle cx="118" cy="128" r="2.5"/><circle cx="110" cy="182" r="3"/><circle cx="86" cy="190" r="2.5"/></g>
              <path d="M108 150 a14 14 0 1 0 6 22 a10 10 0 1 1 -6 -22 z" fill="#f5c02e"/><rect x="65" y="196" width="70" height="8" fill="#f5c02e"/>`, 214)],
      byxor: ['Lång kjortel', `<path d="M66 196 L132 196 L148 344 L52 344 Z" fill="#4a2f8f"/><path d="M52 344 L148 344" stroke="#f5c02e" stroke-width="5"/>
              <g fill="#f5c02e"><circle cx="78" cy="250" r="3"/><circle cx="118" cy="232" r="2.5"/><circle cx="96" cy="292" r="3"/><circle cx="128" cy="300" r="2.5"/><circle cx="70" cy="320" r="2.5"/></g>`],
      skor:  ['Spetsiga skor', `<path d="M74 344 h26 v12 h-30 q-14 0 -14 -12 q0 -6 6 -6 q-2 6 6 6 z" fill="#5b3fa8"/><path d="M126 344 h-26 v12 h30 q14 0 14 -12 q0 -6 -6 -6 q2 6 -6 6 z" fill="#5b3fa8"/>`],
      sak:   ['Trollstav', `<line x1="146" y1="240" x2="170" y2="178" stroke="#6b3a1a" stroke-width="5" stroke-linecap="round"/>` + '<path d=\"M172.0 161.0L174.9 168.0L182.5 168.6L176.7 173.5L178.5 180.9L172.0 176.9L165.5 180.9L167.3 173.5L161.5 168.6L169.1 168.0Z\" fill=\"#f5c02e\"/>' + `<g fill="#fff"><circle cx="186" cy="160" r="2"/><circle cx="158" cy="160" r="1.6"/><circle cx="188" cy="186" r="1.6"/></g>`]
    }},
    {id: 'fotboll', name: 'Fotbollsspelare', icon: '⚽', items: {
      hatt:  ['Keps', `<path d="M62 56 Q62 26 100 26 Q138 26 138 56 Z" fill="#2f6fd6"/><path d="M100 56 Q146 52 160 64 Q140 66 100 62 Z" fill="#1d4ea0"/><circle cx="100" cy="28" r="4" fill="#1d4ea0"/>`],
      troja: ['Fotbollströja', shirt('#f5c02e', `<path d="M90 109 L100 120 L110 109" fill="#2f6fd6"/><text x="100" y="172" font-size="34" font-weight="900" text-anchor="middle" fill="#2f6fd6" font-family="system-ui,sans-serif">10</text>
              <path d="M52 150 l14 -4 M148 150 l-14 -4" stroke="#2f6fd6" stroke-width="7"/>`, 152)],
      byxor: ['Shorts', trousers('#2f6fd6', `<path d="M100 214 v36" stroke="#1d4ea0" stroke-width="2"/><path d="M78 244 h20 M102 244 h20" stroke="#fff" stroke-width="3"/>`, 250)],
      skor:  ['Fotbollsskor', boots('#f5c02e', 292, `<rect x="75" y="306" width="27" height="5" fill="#2f6fd6"/><rect x="98" y="306" width="27" height="5" fill="#2f6fd6"/>
              <path d="M70 344 h32 v12 h-28 a6 6 0 0 1 -4 -12 z M130 344 h-32 v12 h28 a6 6 0 0 0 4 -12 z" fill="#1D2842"/><g fill="#9aa4b0"><rect x="76" y="356" width="4" height="4"/><rect x="88" y="356" width="4" height="4"/><rect x="108" y="356" width="4" height="4"/><rect x="120" y="356" width="4" height="4"/></g>`)],
      sak:   ['Fotboll', `<circle cx="162" cy="224" r="19" fill="#fff" stroke="#1D2842" stroke-width="2.5"/><path d="M162 216 l7 5 l-3 8 h-8 l-3 -8 z" fill="#1D2842"/>
              <path d="M162 216 v-11 M169 221 l10 -3 M166 229 l6 9 M158 229 l-6 9 M155 221 l-10 -3" stroke="#1D2842" stroke-width="2"/>`]
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
