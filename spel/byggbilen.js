/* Bygg bilen – välj sportbil, SUV eller lastbil och byt färg, dekor, tak, vinge, motorhuv, lampor,
   fälgar och motor. Starta motorn och varva med gaspedalen. Allt ritas och alla ljud skapas i enheten.
   Följer spelbibliotekets gränssnitt: se bilbingo.js. */
(function(){
  const CSS = `
.bg{height:100%;display:flex;flex-direction:column;gap:10px;padding:14px;box-sizing:border-box;color:var(--ink,#1D2842);font-family:inherit;position:relative;user-select:none;-webkit-user-select:none}
.bg-top{display:flex;align-items:center;gap:10px;min-height:48px;flex-wrap:wrap}
.bg-title{font-size:1.7rem;font-weight:800;line-height:1;margin-right:auto}
.bg-btn{border:2px solid var(--line,#C6D1DF);background:var(--card,#fff);color:inherit;font:inherit;font-weight:700;border-radius:999px;padding:5px 14px;cursor:pointer}
.bg-btn.done{border:0;background:var(--done,#F2B33D);color:#2B1E00;font-weight:800}
.bg-types{flex:1;min-height:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;align-content:center}
.bg-type{border:0;background:var(--card,#fff);border-radius:24px;cursor:pointer;padding:12px;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);display:flex;flex-direction:column;align-items:center;gap:8px;font:inherit;color:inherit}
.bg-type svg{width:100%;height:auto}
.bg-type .nm{font-weight:800;font-size:1.3rem}
.bg-main{flex:1;min-height:0;display:flex;gap:12px}
.bg-main.port{flex-direction:column}
.bg-stage{flex:1 1 58%;min-width:0;min-height:0;display:flex;flex-direction:column;gap:8px}
.bg-car{flex:1;min-height:0;border-radius:24px;background:linear-gradient(#cfe9fb,#eef7fd 62%,#c7ccd3 62%,#b4bac2);position:relative;overflow:hidden;display:grid;place-items:center}
.bg-car svg{width:98%;height:96%}
.bg-ctrl{display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap}
.bg-tach{width:170px;height:104px}
.bg-start{width:92px;height:92px;border-radius:50%;border:0;cursor:pointer;font:inherit;font-weight:900;font-size:1rem;color:#fff;background:radial-gradient(#5fd17a,#2f9e44);box-shadow:inset 0 -6px 0 rgba(0,0,0,.2),0 0 0 5px #d9dde3}
.bg-start.on{background:radial-gradient(#ff7a6e,#c9342a)}
.bg-gas{width:84px;height:120px;border:0;border-radius:16px;cursor:pointer;font:inherit;font-weight:900;color:#fff;background:repeating-linear-gradient(#5b6470 0 10px,#4a525d 10px 20px);
  box-shadow:inset 0 -8px 0 rgba(0,0,0,.25);transform-origin:50% 100%;transition:transform .08s;touch-action:none}
.bg-gas.down{transform:perspective(300px) rotateX(18deg)}
.bg-gas:disabled{opacity:.4;cursor:default}
.bg-fuelg{width:120px;height:60px;align-self:center}
.bg-car .bg-world{width:100%;height:100%}
.bg:not(.driving) .bg-speedo,.bg:not(.driving) .bg-shift{display:none}
.bg-gear{width:50px;font-size:1.5rem;font-weight:900}
.bg-mini.bg-gear[aria-pressed="true"]{background:#1D2842;color:#fff;box-shadow:0 0 0 3px #f5c02e}
.bg-brake{background:repeating-linear-gradient(#9c3a32 0 10px,#86302a 10px 20px)}
.bg.driving .bg-panel,.bg.driving [data-a="types"],.bg.driving [data-a="done"],.bg.driving [data-a="drive"]{display:none}
.bg:not(.driving) [data-a="garage"],.bg:not(.driving) [data-a="night"],.bg:not(.driving) .bg-brake{display:none}
.bg-mini b.ic{font-weight:400}
.bg-mini[data-a="fill"].on{background:#e6f3ff;box-shadow:inset 0 0 0 3px #2f6fd6;color:#1D2842}
.bg-note{position:absolute;left:50%;top:5%;transform:translateX(-50%);background:#fff;color:#1D2842;font-weight:800;border-radius:14px;padding:8px 16px;box-shadow:0 4px 12px rgba(0,0,0,.18);
  opacity:0;transition:opacity .25s;pointer-events:none;text-align:center;max-width:90%;z-index:6}
.bg-note.on{opacity:1}
.bg-group{display:flex;gap:4px;padding:4px;border-radius:18px;background:var(--card,#fff);box-shadow:inset 0 0 0 2px var(--line,#C6D1DF)}
.bg-mini{width:60px;height:60px;border:0;border-radius:14px;cursor:pointer;background:transparent;font:inherit;font-size:1.5rem;line-height:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;color:inherit}
.bg-mini span{font-size:.62rem;font-weight:800}
.bg-mini[aria-pressed="true"]{background:#fff3c4;box-shadow:inset 0 0 0 3px #f5c02e;color:#1D2842}
.bg-mini.blink[aria-pressed="true"]{background:#e6f8ea;box-shadow:inset 0 0 0 3px #2fb553;color:#1D2842}
.bg-siren{width:72px;height:72px;border-radius:50%;border:0;cursor:pointer;font-size:2rem;background:var(--card,#fff);box-shadow:inset 0 0 0 3px var(--line,#C6D1DF)}
.bg-siren[aria-pressed="true"]{box-shadow:inset 0 0 0 4px #2f6fd6;background:#dce9ff;color:#1D2842}
.bg-horn{width:72px;height:72px;border-radius:50%;border:0;cursor:pointer;font-size:2rem;background:var(--card,#fff);box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);transition:opacity .2s,transform .1s}
.bg-horn:active{transform:scale(.92)}
.bg-horn.wait{opacity:.4;cursor:default}
.bg-panel{flex:1 1 42%;min-width:0;min-height:0;display:flex;flex-direction:column;gap:8px}
.bg-tabs{display:flex;gap:6px;flex-wrap:wrap}
.bg-tab{border:0;background:var(--card,#fff);color:inherit;font:inherit;font-weight:700;border-radius:14px;padding:5px 9px;cursor:pointer;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);font-size:.9rem;display:flex;align-items:center;gap:4px}
.bg-tab .ic{font-size:1.25rem;line-height:1}
.bg-tab[aria-pressed="true"]{box-shadow:inset 0 0 0 4px var(--accent,#2F6FD6)}
.bg-opts{flex:1;min-height:0;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:8px;align-content:start;padding:2px}
.bg-opt{border:0;background:var(--card,#fff);color:inherit;font:inherit;border-radius:16px;cursor:pointer;padding:6px;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF);display:flex;flex-direction:column;align-items:center;gap:3px}
.bg-opt svg{width:100%;height:auto;pointer-events:none}
.bg-opt .lb{font-weight:800;font-size:.85rem;line-height:1.1;text-align:center}
.bg-opt .sub{font-size:.75rem;opacity:.7;text-align:center}
.bg-opt .eng{display:flex;align-items:center;justify-content:center;width:100%;aspect-ratio:16/10;border-radius:12px;background:linear-gradient(#e9edf2,#cfd5dd);padding:4px;box-sizing:border-box}
.bg-opt .eng svg{width:100%;height:100%}
.bg-opt .eng .en{font-size:1.5rem;font-weight:900;line-height:1}
.bg-opt .eng .pp{font-size:.8rem;letter-spacing:2px;opacity:.7;margin-top:4px}
.bg-opt[aria-pressed="true"]{box-shadow:inset 0 0 0 5px var(--done,#F2B33D)}
.bg-step{grid-column:1/-1;display:flex;align-items:center;gap:10px;background:var(--card,#fff);border-radius:18px;padding:10px 12px;box-shadow:inset 0 0 0 3px var(--line,#C6D1DF)}
.bg-step .nm{font-weight:800;width:104px;font-size:1.05rem}
.bg-stepbtn{width:56px;height:56px;flex:none;border-radius:50%;border:0;cursor:pointer;font:inherit;font-size:2rem;font-weight:900;line-height:1;color:#fff;background:var(--accent,#2F6FD6)}
.bg-stepbtn:disabled{opacity:.3;cursor:default}
.bg-step .lv{flex:1;display:flex;gap:5px;align-items:flex-end;min-width:80px}
.bg-step .lv i{flex:1;border-radius:4px;background:var(--line,#C6D1DF)}
.bg-step .lv i.on{background:var(--done,#F2B33D)}
.bg-step .lv i.zero{box-shadow:0 0 0 2px #1D2842}
.bg-reset{grid-column:1/-1;justify-self:start}
.bg-sw{border:0;border-radius:50%;width:58px;height:58px;cursor:pointer;justify-self:center;box-shadow:inset 0 0 0 3px rgba(0,0,0,.18)}
.bg-sw[aria-pressed="true"]{box-shadow:0 0 0 4px var(--card,#fff),0 0 0 8px var(--accent,#2F6FD6)}
.bg button:focus-visible{outline:3px solid var(--accent,#2F6FD6);outline-offset:3px}
.bg-yay{position:absolute;left:0;right:0;top:6%;display:none;flex-direction:column;align-items:center;pointer-events:none}
.bg-yay.on{display:flex}
.bg-yay .big{font-size:clamp(2rem,6vmin,3.4rem);font-weight:800;line-height:1;text-shadow:0 0 14px #fff,0 0 4px #fff}
.bg-car.flash::after{content:"";position:absolute;inset:0;background:#fff;animation:bg-flash .5s ease-out forwards}
.bg-lit .rl{fill:#fffef0}.bg-lit .rg{opacity:.85}.bg-lit .rb{opacity:.35}.bg-lit .ts{fill:#ffe45c}
.driving .bg-lit .rb{opacity:0}
.bg-blink-a .la{opacity:1}.bg-blink-a .lb{opacity:.25}.bg-blink-b .la{opacity:.25}.bg-blink-b .lb{opacity:1}
@keyframes bg-flash{from{opacity:.9}to{opacity:0}}
@media (prefers-reduced-motion: reduce){ .bg-car.flash::after{animation:none;opacity:0} }`;

  // ---------- Biltyperna, sedda från sidan, fronten åt höger (500 × 260) ----------
  const TYPES = {
    // Sportbilen: en egen kilformad superbil med mittmotor. Vass låg nos, rak motorhuv som stiger mot en mycket
    // lutande vindruta, kort låg kupé framför bakaxeln, lång motorkåpa som sluttar ned mot en rak bakdel.
    // Större hjul bak än fram, stort luftintag framför bakhjulet, skarp kilformad sidolinje, ventiler på
    // motorkåpan och svart tröskel.
    sport: {name: 'Sportbil', shade: true, glass: true,
      body: 'M50 204 L44 198 Q40 192 41 182 L43 158 Q45 150 56 148 L150 136 Q178 128 198 122 L268 118 Q282 118 292 124 L344 156 L470 182 Q480 186 479 192 L477 198 Q474 204 462 204 Z',
      win: 'M214 126 L266 122 Q279 122 288 128 L330 155 L220 153 Q214 140 214 126 Z', winLine: '', door: 'M210 124 L216 198 M336 158 L332 198',
      detail: () => `<path d="M468 182 Q330 166 150 162" stroke="#fff" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/>
        <path d="M466 192 Q330 178 150 174" stroke="#000" stroke-width="2.5" fill="none" opacity=".2" stroke-linecap="round"/>
        <path d="M206 166 L170 164 Q160 176 162 194 L204 194 Z" fill="#1d1d1d" stroke="#222" stroke-width="2" stroke-linejoin="round"/>
        <path d="M203 171 L168 170 M203 178 L164 177 M203 185 L163 185 M203 191 L163 191" stroke="#5b6470" stroke-width="2"/>
        <path d="M84 148 L170 134 M90 154 L176 140" stroke="#1d1d1d" stroke-width="3" stroke-linecap="round" opacity=".55"/>
        <path d="M150 198 L380 198 L380 204 L150 204 Z" fill="#1d1d1d"/>
        <rect x="294" y="162" width="16" height="5" rx="2.5" fill="#1d1d1d"/>`,
      mirror: [318, 148],
      wheels: [[122, 204, 40], [398, 204, 35]], head: [456, 181], tail: [44, 160], roof: [232, 120], wing: [66, 148], hood: [404, 168],
      exhaust: [46, 198], mid: 174, band: 192, doorX: 270, front: 479},
    // SUV:n: en egen modern SUV, upprätt och robust med korta överhäng, lutande vindruta, nästan plant tak och
    // en rak bakdel med lite lutning. Mörka skärmbreddare runt hjulen och längs tröskeln, svarta stolpar mellan
    // rutorna (taket ser ut att sväva), dörrhandtag, backspegel och en skulpterad sidolinje.
    suv: {name: 'SUV', shade: true, glass: true,
      body: 'M62 204 L60 150 Q60 126 66 112 L76 80 Q80 66 96 66 L306 62 Q322 62 332 70 L362 106 Q372 110 386 111 L446 116 Q464 120 466 138 L468 190 Q468 204 456 204 Z',
      win: 'M90 80 L150 79 L150 112 L82 112 Q82 92 90 80 Z M160 79 L232 78 L232 112 L160 112 Z M242 78 L306 76 Q318 76 326 85 L350 112 L242 112 Z',
      winLine: '', door: 'M237 77 L237 196 M155 79 L155 166 M352 116 L348 168',
      detail: c => `<path d="M76 122 Q260 118 448 124" stroke="#fff" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/>
        <path d="M76 132 Q260 128 448 134" stroke="#000" stroke-width="2.5" fill="none" opacity=".15" stroke-linecap="round"/>
        <rect x="149" y="77" width="12" height="37" fill="#1d1d1d"/><rect x="231" y="76" width="12" height="38" fill="#1d1d1d"/>
        <path d="M82 204 A54 54 0 0 1 190 204" stroke="#2a2e35" stroke-width="12" fill="none"/><path d="M338 204 A54 54 0 0 1 446 204" stroke="#2a2e35" stroke-width="12" fill="none"/>
        <path d="M190 192 L338 192 L338 204 L190 204 Z" fill="#2a2e35"/><path d="M440 188 L468 184 L468 200 L444 204 Z" fill="#b9c0c9" stroke="#222" stroke-width="1.5"/>
        <rect x="178" y="126" width="20" height="5" rx="2.5" fill="#d9dde3" stroke="#222" stroke-width="1.2"/><rect x="262" y="126" width="20" height="5" rx="2.5" fill="#d9dde3" stroke="#222" stroke-width="1.2"/>`,
      mirror: [344, 104],
      wheels: [[136, 204, 40], [392, 204, 40]], head: [458, 128], tail: [62, 122], roof: [200, 62], wing: [96, 66], hood: [416, 113],
      exhaust: [62, 198], mid: 150, band: 176, doorX: 290, front: 468},
    lastbil: {name: 'Pickup', shade: true, glass: true,
      detail: c => `<path d="M44 140 L236 140 M244 138 Q350 134 466 142" stroke="#fff" stroke-width="3" fill="none" opacity=".3" stroke-linecap="round"/>
        <path d="M44 134 L236 134" stroke="#222" stroke-width="2" opacity=".35"/><path d="M72 140 L72 196" stroke="#222" stroke-width="2" opacity=".3"/>
        <path d="M66 204 A50 50 0 0 1 166 204 M346 204 A50 50 0 0 1 446 204" stroke="#2a2e35" stroke-width="10" fill="none"/>
        <rect x="282" y="140" width="20" height="5" rx="2.5" fill="#d9dde3" stroke="#222" stroke-width="1.2"/>
        <path d="M352 118 Q364 106 380 110 L380 122 Q364 126 352 118 Z" fill="${c}" stroke="#222" stroke-width="2" stroke-linejoin="round"/>`,
      body: 'M40 204 L40 130 L238 130 L238 88 Q242 74 258 74 L330 74 Q342 74 350 84 L382 124 L450 130 Q470 134 472 154 L472 204 Z',
      win: 'M254 86 L334 86 L362 124 L254 124 Z', winLine: '', door: 'M240 128 L240 196 M330 126 L330 196',
      wheels: [[116, 204, 38], [396, 204, 38]], head: [466, 146], tail: [44, 144], roof: [292, 74], wing: [64, 130], hood: [420, 130],
      exhaust: [44, 198], mid: 158, band: 180, doorX: 290, front: 472},
    buss: {name: 'Buss', shade: true, glass: true,
      detail: () => `<path d="M30 128 L474 128" stroke="#fff" stroke-width="3" opacity=".3"/><path d="M30 186 L474 186" stroke="#d9dde3" stroke-width="3"/><path d="M30 189 L474 189" stroke="#222" stroke-width="1" opacity=".4"/>`,
      body: 'M30 206 L30 70 Q30 56 44 56 L440 56 Q458 56 463 72 L474 122 L474 206 Z',
      win: 'M52 72 L96 72 L96 118 L52 118 Z M104 72 L148 72 L148 118 L104 118 Z M156 72 L200 72 L200 118 L156 118 Z M208 72 L252 72 L252 118 L208 118 Z M260 72 L304 72 L304 118 L260 118 Z M312 72 L356 72 L356 118 L312 118 Z M432 70 L455 72 L466 118 L432 118 Z',
      winLine: '', door: 'M392 72 L392 200 L424 200 L424 72 Z M408 72 L408 200',
      wheels: [[108, 206, 34], [384, 206, 34]], head: [466, 172], tail: [36, 172], roof: [240, 56], wing: [48, 58], hood: [452, 140],
      exhaust: [36, 200], mid: 150, band: 176, doorX: 230, front: 474},
    // Formelbil: en egen modern formelbil. Lång låg kaross med spetsig nos som sluttar ned mot frontvingen,
    // sidolådor med luftintag, motorkåpa som stiger mot ett luftintag ovanför förarens huvud, bakvinge över
    // bakhjulet. Föraren sitter i cockpit (hjälmen ritas under karossen så att den sticker upp ur öppningen)
    // med skyddsbåge (halo). Länkarmar, bottenplatta och frontvinge med ändplatta i bilens färg.
    formel: {name: 'Formelbil', noArch: true, shade: true,
      body: 'M58 198 L58 178 Q60 168 74 166 L148 158 Q176 142 194 122 Q202 110 216 108 L224 108 L228 126 L244 136 Q266 138 292 142 Q356 150 418 168 Q458 180 472 188 Q478 196 466 198 L360 200 L324 204 L120 204 Q96 204 86 200 Z',
      win: 'M284 132 L294 124 L297 141 Z', winLine: '', door: 'M302 160 Q250 150 176 166',
      under: c => `<g stroke="#3a3f47" stroke-width="3.5" stroke-linecap="round"><path d="M142 182 L100 196 M142 198 L100 206"/><path d="M356 188 L400 200 M356 200 L400 210"/></g>
        <path d="M110 204 L384 204 L380 212 L114 212 Z" fill="#2a2a2a"/>
        <circle cx="252" cy="126" r="14" fill="#f5c02e" stroke="#222" stroke-width="2.5"/><path d="M252 118 Q268 117 266 128 L254 130 Z" fill="#2a2a2a"/><path d="M240 120 Q252 110 264 116" stroke="${c === '#e8473c' ? '#2f6fd6' : '#e8473c'}" stroke-width="3" fill="none"/>`,
      detail: () => `<path d="M80 164 Q150 152 190 126" stroke="#fff" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/>
        <path d="M296 146 Q380 156 460 182" stroke="#fff" stroke-width="2.5" fill="none" opacity=".3" stroke-linecap="round"/>
        <path d="M300 160 Q312 160 312 172 L312 186 Q312 196 300 196 Z" fill="#1d1d1d"/>
        <rect x="206" y="110" width="16" height="13" rx="5" fill="#1d1d1d"/>`,
      extra: c => `<path d="M228 124 Q254 108 282 124 L292 142" stroke="#2a2a2a" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M398 208 L486 200 L486 210 L402 216 Z" fill="#2a2a2a" stroke="#222" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M408 202 L484 195 L484 200 L412 207 Z" fill="${c}" stroke="#222" stroke-width="1.5" stroke-linejoin="round"/>
        <rect x="481" y="186" width="9" height="30" rx="2" fill="${c}" stroke="#222" stroke-width="2"/>`,
      wheels: [[100, 200, 40], [400, 204, 36]], head: [460, 186], tail: [48, 182], roof: [220, 108], wing: [64, 168], hood: [334, 147],
      exhaust: [58, 192], mid: 172, band: 186, doorX: 336, front: 488}
  };
  // Tutor per bil: delar [start, längd] i sekunder, toner, vågform, filter och styrka.
  const HORN_GAP = 2000;
  const HORNS = {
    sport:   {parts: [[0, 0.13], [0.19, 0.17]], f: [523, 659], wave: 'sawtooth', cut: 2600, vol: 0.2},          // snabbt, ljust "tu-tut!"
    suv:     {parts: [[0, 0.45]], f: [349, 440], wave: 'square', cut: 1800, vol: 0.18},                           // klassisk tvåtonstuta
    lastbil: {parts: [[0, 0.22], [0.3, 0.3]], f: [247, 311], wave: 'square', cut: 1400, vol: 0.22},              // djupt "honk-honk"
    buss:    {parts: [[0, 0.85]], f: [147, 185, 220], wave: 'sawtooth', cut: 1100, vol: 0.2},                     // lång djup lufttuta
    formel:  {parts: [[0, 0.1], [0.15, 0.1]], f: [880], glide: 1.33, wave: 'triangle', cut: 5000, vol: 0.22}     // snabbt stigande "pip-pip"
  };
  // Reflexer i tonat glas: snedränder över hela bredden, klippta av rutorna.
  const GLARE = [60, 170, 280, 390].map(x => `M${x} 130 L${x + 56} 50 L${x + 80} 50 L${x + 24} 130 Z M${x + 40} 130 L${x + 96} 50 L${x + 106} 50 L${x + 50} 130 Z`).join(' ');
  // Underkanten på karossen, där fjädringen fästs.
  const BOTTOM = {sport: 204, suv: 204, lastbil: 204, buss: 206, formel: 200};

  const COLORS = [['Röd', '#e8473c'], ['Orange', '#f28a2e'], ['Gul', '#f5c02e'], ['Grön', '#43b55a'], ['Turkos', '#2bb3b1'], ['Blå', '#2f6fd6'],
    ['Mörkblå', '#1f2f5c'], ['Lila', '#9a5bd6'], ['Rosa', '#ff8fb7'], ['Vit', '#f4f6f8'], ['Silver', '#b9bec6'], ['Svart', '#2a2a2a']];

  // ---------- Delarna ----------
  const dark = '#1d1d1d';
  const LIVERIES = {
    ingen:  {name: 'Ingen', svg: () => ''},
    racing: {name: 'Racing', svg: T => `<rect x="0" y="${T.mid - 12}" width="500" height="7" fill="#fff"/><rect x="0" y="${T.mid - 2}" width="500" height="7" fill="#fff"/>
              <circle cx="${T.doorX}" cy="${T.mid + 16}" r="17" fill="#fff" stroke="#222" stroke-width="3"/><text x="${T.doorX}" y="${T.mid + 17}" text-anchor="middle" dominant-baseline="central" font-family="system-ui,sans-serif" font-weight="900" font-size="20" fill="#222">7</text>`},
    polis:  {name: 'Polis', svg: T => `<g>${Array.from({length: 26}, (_, i) => `<rect x="${i * 20}" y="${T.band - 4}" width="20" height="11" fill="${i % 2 ? '#f5c02e' : '#1f4e8c'}"/><rect x="${i * 20}" y="${T.band + 7}" width="20" height="11" fill="${i % 2 ? '#1f4e8c' : '#f5c02e'}"/>`).join('')}</g>
              <text x="${T.doorX}" y="${T.band - 14}" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="900" font-size="20" fill="#fff" stroke="#1f4e8c" stroke-width="3" paint-order="stroke">POLIS</text>`},
    flammor:{name: 'Flammor', svg: T => { const F = T.front, y = T.mid;
              const fl = (k, c) => `<path transform="translate(${F} ${y}) scale(${k}) translate(${-F} ${-y})" d="M${F} ${y - 20} Q${F - 60} ${y - 30} ${F - 115} ${y - 38} Q${F - 92} ${y - 18} ${F - 160} ${y - 16} Q${F - 126} ${y - 2} ${F - 205} ${y + 4} Q${F - 128} ${y + 12} ${F - 150} ${y + 28} Q${F - 84} ${y + 18} ${F} ${y + 20} Z" fill="${c}"/>`;
              return fl(1, '#f28a2e') + fl(0.7, '#f5c02e'); }},
    taxi:   {name: 'Taxi', svg: T => `<g>${Array.from({length: 50}, (_, i) => `<rect x="${i * 10}" y="${T.mid - 6 + (i % 2) * 6}" width="10" height="6" fill="#222"/>`).join('')}</g>
              <text x="${T.doorX}" y="${T.mid + 26}" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="900" font-size="18" fill="#222">TAXI</text>`},
    rand:   {name: 'Bred rand', svg: T => `<rect x="0" y="${T.mid - 14}" width="500" height="22" fill="#fff" opacity=".9"/><rect x="0" y="${T.mid - 8}" width="500" height="5" fill="#222"/>`}
  };
  const ROOFS = {
    inget:   {name: 'Inget', svg: () => ''},
    blaljus: {name: 'Blåljus', light: 'blue', svg: () => `<rect x="-36" y="-14" width="72" height="14" rx="5" fill="#d9dde3" stroke="#222" stroke-width="2"/><rect class="la" x="-32" y="-12" width="30" height="10" rx="3" fill="#2f6fd6"/><rect class="lb" x="2" y="-12" width="30" height="10" rx="3" fill="#2f6fd6"/>`},
    gult:    {name: 'Varningsljus', light: 'amber', svg: () => `<rect x="-14" y="-5" width="28" height="5" fill="#555"/><path class="la" d="M-12 -5 Q-12 -24 0 -24 Q12 -24 12 -5 Z" fill="#f28a2e" stroke="#222" stroke-width="2"/>`},
    // Ljusrampen sedd från sidan: fyra lamphus på en takbåge med glaset framåt (åt höger). Tänd: glaset lyser,
    // ett sken framför varje lampa och en ljuskägla framåt och nedåt.
    ramp:    {name: 'Ljusramp', light: 'ramp', svg: () => `<path class="rb" d="M46 -22 L300 18 L300 120 L46 -10 Z" fill="#fff6b0" opacity="0" style="mix-blend-mode:screen"/>
      ${[-33, -11, 11, 33].map(x => `<ellipse class="rg" cx="${x + 16}" cy="-16" rx="18" ry="10" fill="#fff6b0" opacity="0"/>`).join('')}
      <path d="M-40 -2 L-40 -8 L44 -8 L44 -2" stroke="#222" stroke-width="3" fill="none"/><rect x="-44" y="-10" width="92" height="5" rx="2.5" fill="#222"/>
      ${[-33, -11, 11, 33].map(x => `<rect x="${x - 9}" y="-25" width="15" height="18" rx="4" fill="#2a2e35" stroke="#222" stroke-width="1.5"/><rect x="${x - 7}" y="-23" width="9" height="3" rx="1.5" fill="#5b6470"/>
        <ellipse class="rl" cx="${x + 6}" cy="-16" rx="4" ry="8.5" fill="#d8d4c2" stroke="#222" stroke-width="2"/>`).join('')}`},
    box:     {name: 'Takbox', svg: () => `<rect x="-64" y="-22" width="128" height="22" rx="10" fill="#3a3f47"/><rect x="-56" y="-18" width="112" height="4" rx="2" fill="#5b6470"/>`},
    taxi:    {name: 'Taxiskylt', light: 'taxi', svg: () => `<ellipse class="rg" cx="0" cy="-9" rx="40" ry="20" fill="#fff3a0" opacity="0"/><rect class="ts" x="-24" y="-18" width="48" height="18" rx="5" fill="#d9a82a" stroke="#222" stroke-width="2"/><text x="0" y="-9" text-anchor="middle" dominant-baseline="central" font-family="system-ui,sans-serif" font-weight="900" font-size="11" fill="#222">TAXI</text>`}
  };
  const WINGS = {
    ingen: {name: 'Ingen', svg: () => ''},
    lapp:  {name: 'Läpp', svg: c => `<path d="M-22 2 L30 2 L38 -10 Z" fill="${c}" stroke="#222" stroke-width="2.5" stroke-linejoin="round"/>`},
    hog:   {name: 'Hög vinge', svg: c => `<path d="M0 0 L-4 -34 M26 0 L22 -34" stroke="#222" stroke-width="5"/><rect x="-22" y="-46" width="66" height="11" rx="5" fill="${c}" stroke="#222" stroke-width="2.5"/>`},
    dubbel:{name: 'Dubbelvinge', svg: c => `<path d="M0 0 L-4 -40 M26 0 L22 -40" stroke="#222" stroke-width="5"/><rect x="-22" y="-52" width="66" height="9" rx="4" fill="${c}" stroke="#222" stroke-width="2.5"/><rect x="-16" y="-38" width="54" height="8" rx="4" fill="${dark}"/>`},
    gt:    {name: 'GT-vinge', svg: c => `<path d="M2 0 L-6 -46 M30 0 L26 -46" stroke="#222" stroke-width="6"/><rect x="-34" y="-60" width="92" height="12" rx="4" fill="${dark}"/><rect x="-36" y="-70" width="6" height="28" rx="2" fill="${c}" stroke="#222" stroke-width="2"/><rect x="56" y="-70" width="6" height="28" rx="2" fill="${c}" stroke="#222" stroke-width="2"/>`}
  };
  const HOODS = {
    standard: {name: 'Vanlig', svg: () => ''},
    scoop:    {name: 'Luftintag', svg: c => `<path d="M-28 4 L-20 -16 L20 -16 L28 4 Z" fill="${c}" stroke="#222" stroke-width="2.5" stroke-linejoin="round"/><path d="M-16 -13 L16 -13 L19 -3 L-19 -3 Z" fill="${dark}"/>`},
    kupol:    {name: 'Kupol', svg: c => `<path d="M-44 4 Q0 -18 44 4 Z" fill="${c}" stroke="#222" stroke-width="2.5"/><path d="M-26 -4 Q0 -14 22 -6" stroke="#fff" stroke-width="3" fill="none" opacity=".5"/>`},
    ventiler: {name: 'Ventiler', svg: () => [-20, -4, 12].map(x => `<path d="M${x} 0 L${x + 10} -8" stroke="${dark}" stroke-width="5" stroke-linecap="round"/>`).join('')}
  };
  const HEADS = {
    rund:    {name: 'Runda', svg: on => `<circle cx="-11" cy="0" r="9" fill="${on ? '#fffef0' : '#dcd8c8'}" stroke="#222" stroke-width="2.5"/>`},
    smal:    {name: 'Smala LED', svg: on => `<path d="M-34 -2 L2 -9 L2 -2 L-32 3 Z" fill="${on ? '#f4fdff' : '#c8d6de'}" stroke="#222" stroke-width="2.5" stroke-linejoin="round"/>`},
    dubbel:  {name: 'Dubbla', svg: on => `<circle cx="-8" cy="0" r="6.5" fill="${on ? '#fffef0' : '#dcd8c8'}" stroke="#222" stroke-width="2.2"/><circle cx="-24" cy="0" r="6.5" fill="${on ? '#fffef0' : '#dcd8c8'}" stroke="#222" stroke-width="2.2"/>`},
    fyrkant: {name: 'Fyrkantiga', svg: on => `<rect x="-26" y="-8" width="24" height="15" rx="3" fill="${on ? '#fffef0' : '#dcd8c8'}" stroke="#222" stroke-width="2.5"/>`},
    ogon:    {name: 'Arga ögon', svg: on => `<path d="M-34 -1 Q-16 -14 3 -9 L1 3 Q-16 1 -34 -1 Z" fill="${on ? '#fffef0' : '#dcd8c8'}" stroke="#222" stroke-width="2.5" stroke-linejoin="round"/>`}
  };
  const TAILS = {
    rund:    {name: 'Runda', svg: on => `<circle cx="9" cy="0" r="8" fill="${on ? '#ff4d3f' : '#9c2f27'}" stroke="#222" stroke-width="2.5"/>`},
    list:    {name: 'LED-list', svg: on => `<rect x="-2" y="-3" width="38" height="7" rx="3" fill="${on ? '#ff3a2e' : '#9c2f27'}" stroke="#222" stroke-width="2"/>`},
    fyrkant: {name: 'Fyrkantiga', svg: on => `<rect x="-1" y="-10" width="16" height="20" rx="2" fill="${on ? '#ff4d3f' : '#9c2f27'}" stroke="#222" stroke-width="2.5"/><rect x="2" y="2" width="10" height="5" fill="${on ? '#ffb04a' : '#a8682a'}"/>`},
    trekant: {name: 'Trekantiga', svg: on => `<path d="M-1 -11 L24 0 L-1 11 Z" fill="${on ? '#ff4d3f' : '#9c2f27'}" stroke="#222" stroke-width="2.5" stroke-linejoin="round"/>`},
    dubbel:  {name: 'Dubbla', svg: on => `<circle cx="7" cy="0" r="6" fill="${on ? '#ff4d3f' : '#9c2f27'}" stroke="#222" stroke-width="2.2"/><circle cx="21" cy="0" r="6" fill="${on ? '#ff4d3f' : '#9c2f27'}" stroke="#222" stroke-width="2.2"/>`}
  };
  const spokes = (r, n, c, w) => Array.from({length: n}, (_, i) => { const a = i / n * Math.PI * 2; return `<line x1="0" y1="0" x2="${(Math.cos(a) * r).toFixed(1)}" y2="${(Math.sin(a) * r).toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`; }).join('');
  const WHEELS = {
    standard: {name: 'Vanliga', svg: r => `<circle r="${r}" fill="${dark}"/><circle r="${r * 0.56}" fill="#b9bec6" stroke="#8a929c" stroke-width="2"/>${[0, 1, 2, 3, 4].map(i => { const a = i / 5 * Math.PI * 2; return `<circle cx="${(Math.cos(a) * r * 0.3).toFixed(1)}" cy="${(Math.sin(a) * r * 0.3).toFixed(1)}" r="2.2" fill="#6f7882"/>`; }).join('')}`},
    sport:    {name: 'Sportfälgar', svg: r => `<circle r="${r}" fill="${dark}"/><circle r="${r * 0.62}" fill="#3a3f47"/>${spokes(r * 0.58, 5, '#d9dde3', 5)}<circle r="${r * 0.14}" fill="#d9dde3"/>`},
    offroad:  {name: 'Terräng', grow: 6, svg: r => `<circle r="${r}" fill="${dark}" stroke="#444" stroke-width="7" stroke-dasharray="7 6"/><circle r="${r * 0.46}" fill="#2a2a2a" stroke="#6f7882" stroke-width="3"/><circle r="${r * 0.14}" fill="#6f7882"/>`},
    guld:     {name: 'Guldfälgar', svg: r => `<circle r="${r}" fill="${dark}"/><circle r="${r * 0.6}" fill="#c9930a"/>${spokes(r * 0.56, 8, '#f5c02e', 3)}<circle r="${r * 0.15}" fill="#f5c02e"/>`},
    stjarna:  {name: 'Stjärnfälgar', svg: r => { const p = []; for(let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.25 : r * 0.55; p.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`); } return `<circle r="${r}" fill="${dark}"/><circle r="${r * 0.6}" fill="#d9dde3"/><polygon points="${p.join(' ')}" fill="#e8473c"/>`; }}
  };
  // Motorerna: cylindrar, varvtal och ljudkaraktär. pipes = antal avgasrör.
  const ENGINES = {
    el:     {name: 'Elmotor', sub: 'Tyst och snabb', cyl: 0, idle: 0, max: 12000, pipes: 0},
    v6:     {name: 'V6', sub: 'Brummar', cyl: 6, idle: 850, max: 7000, pipes: 1, cutoff: 1000, wave: 'sawtooth'},
    v8:     {name: 'V8', sub: 'Mullrar', cyl: 8, idle: 700, max: 6500, pipes: 2, cutoff: 750, wave: 'sawtooth'},
    v12:    {name: 'V12', sub: 'Skriker', cyl: 12, idle: 650, max: 8500, pipes: 4, cutoff: 700, bright: 5.5, idleVol: 0.06, wave: 'sawtooth'},
    diesel: {name: 'Diesel', sub: 'Knattrar', cyl: 6, idle: 600, max: 3800, pipes: 1, big: true, cutoff: 650, wave: 'square'}
  };
  // Symbol för varje motor: ett motorblock där cylindrarna syns, batteri med blixt för elmotorn
  // och sotig rök för dieseln. Färg och antal cylindrar skiljer motorerna åt.
  const ENGINE_LOOK = {el: '#2bb3b1', v6: '#f28a2e', v8: '#e8473c', v12: '#9a5bd6', diesel: '#4a525d'};
  function engineIcon(key){
    const col = ENGINE_LOOK[key], e = ENGINES[key], k = '#1d1d1d';
    // Elmotor: cylindriskt hus med kylflänsar, axel, fästen och orange högvoltskablar till en kopplingsbox.
    if(!e.cyl) return `<svg viewBox="0 0 160 100" aria-hidden="true">
      <rect x="40" y="78" width="14" height="12" fill="#4a525d"/><rect x="104" y="78" width="14" height="12" fill="#4a525d"/><rect x="30" y="88" width="98" height="6" rx="2" fill="#4a525d"/>
      <rect x="128" y="52" width="24" height="10" rx="2" fill="#b9bec6" stroke="${k}" stroke-width="1.5"/>
      <rect x="30" y="34" width="100" height="50" rx="12" fill="${col}" stroke="${k}" stroke-width="2"/>
      ${Array.from({length: 10}, (_, i) => `<line x1="${40 + i * 9}" y1="38" x2="${40 + i * 9}" y2="80" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>`).join('')}
      <ellipse cx="126" cy="59" rx="6" ry="24" fill="#1f8a88" stroke="${k}" stroke-width="2"/><ellipse cx="34" cy="59" rx="6" ry="24" fill="#1f8a88" stroke="${k}" stroke-width="2"/>
      <path d="M68 34 Q60 22 66 14 M82 34 Q86 22 80 14" stroke="#f28a2e" stroke-width="5" fill="none" stroke-linecap="round"/>
      <rect x="58" y="4" width="34" height="14" rx="3" fill="#2a2a2a" stroke="#fff" stroke-width="1.5"/>
      <path d="M77 6 L70 12 L75 12 L72 17 L80 10 L75 10 Z" fill="#f5c02e"/></svg>`;
    // Diesel: rak sexa från sidan med insprutare, bränsleledningar, turbo, fläkt och rök.
    if(key === 'diesel') return `<svg viewBox="0 0 160 100" aria-hidden="true">
      <circle cx="140" cy="16" r="8" fill="#b9bec6"/><circle cx="149" cy="8" r="6" fill="#d9dde3"/><circle cx="155" cy="3" r="4" fill="#eef1f5"/>
      <path d="M128 36 L136 22" stroke="#6f7882" stroke-width="7" stroke-linecap="round"/>
      <rect x="36" y="78" width="80" height="14" rx="4" fill="#4a525d" stroke="${k}" stroke-width="1.5"/>
      <rect x="30" y="44" width="94" height="36" rx="3" fill="#6f7882" stroke="${k}" stroke-width="2"/>
      ${Array.from({length: 3}, (_, i) => `<rect x="${40 + i * 28}" y="54" width="18" height="18" rx="2" fill="#5b6470"/>`).join('')}
      <rect x="28" y="32" width="98" height="14" fill="#8a929c" stroke="${k}" stroke-width="2"/>
      <rect x="30" y="18" width="94" height="16" rx="5" fill="${col}" stroke="${k}" stroke-width="2"/>
      ${Array.from({length: 6}, (_, i) => `<rect x="${37 + i * 15}" y="10" width="6" height="10" rx="1.5" fill="#d9dde3" stroke="${k}" stroke-width="1.2"/><path d="M${40 + i * 15} 10 Q${40 + i * 15} 4 ${30 + i * 4} 4" stroke="#2a2a2a" stroke-width="1.5" fill="none"/>`).join('')}
      <circle cx="134" cy="54" r="15" fill="#c9893a" stroke="${k}" stroke-width="2"/><path d="M134 54 m-8 0 a8 8 0 1 1 8 8 a5 5 0 1 1 -5 -5" stroke="${k}" stroke-width="2" fill="none"/>
      <circle cx="20" cy="60" r="14" fill="#3a3f47" stroke="${k}" stroke-width="2"/>${[0, 72, 144, 216, 288].map(d => `<path transform="rotate(${d} 20 60)" d="M20 60 L20 48 Q26 50 24 58 Z" fill="#9aa3ad"/>`).join('')}<circle cx="20" cy="60" r="3" fill="#d9dde3"/></svg>`;
    // V-motorer framifrån: oljetråg, block, två cylinderbankar i V, ventilkåpor, insug med luftfilter,
    // avgasgrenrör, remskivor och rem. Tändstiften längs varje bank visar antalet cylindrar.
    const per = e.cyl / 2;
    const plugs = side => Array.from({length: per}, (_, i) => {
      const t = (i + 0.5) / per, x = side < 0 ? 24 + t * 22 : 136 - t * 22, y = side < 0 ? 40 - t * 16 : 40 - t * 16;
      return `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + side * 7).toFixed(1)}" y2="${(y + 4).toFixed(1)}" stroke="#e8473c" stroke-width="2.2" stroke-linecap="round"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="#d9dde3" stroke="${k}" stroke-width="1"/>`;
    }).join('');
    const top = key === 'v8'
      ? `<ellipse cx="80" cy="26" rx="26" ry="9" fill="#d9dde3" stroke="${k}" stroke-width="2"/><ellipse cx="80" cy="24" rx="18" ry="5" fill="#9aa3ad"/><circle cx="80" cy="22" r="3" fill="${k}"/>`
      : key === 'v12'
        ? `<rect x="58" y="22" width="16" height="12" rx="3" fill="#d9dde3" stroke="${k}" stroke-width="1.8"/><rect x="86" y="22" width="16" height="12" rx="3" fill="#d9dde3" stroke="${k}" stroke-width="1.8"/><circle cx="66" cy="28" r="4" fill="#3a3f47"/><circle cx="94" cy="28" r="4" fill="#3a3f47"/>`
        : `<rect x="62" y="24" width="36" height="12" rx="5" fill="#d9dde3" stroke="${k}" stroke-width="2"/><circle cx="98" cy="30" r="5" fill="#3a3f47" stroke="${k}" stroke-width="1.5"/>`;
    return `<svg viewBox="0 0 160 100" aria-hidden="true">
      <path d="M34 50 Q14 60 18 84 M126 50 Q146 60 142 84" stroke="#c9893a" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M50 82 L110 82 L104 96 L56 96 Z" fill="#4a525d" stroke="${k}" stroke-width="1.5"/>
      <rect x="46" y="58" width="68" height="26" rx="3" fill="#8a929c" stroke="${k}" stroke-width="2"/>
      <path d="M50 60 L26 34 L44 22 L72 54 Z" fill="#9aa3ad" stroke="${k}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M110 60 L134 34 L116 22 L88 54 Z" fill="#9aa3ad" stroke="${k}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M22 34 L42 18 L50 26 L30 42 Z" fill="${col}" stroke="${k}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M138 34 L118 18 L110 26 L130 42 Z" fill="${col}" stroke="${k}" stroke-width="2" stroke-linejoin="round"/>
      ${plugs(-1)}${plugs(1)}
      <path d="M64 56 L96 56 L100 34 L60 34 Z" fill="#b9bec6" stroke="${k}" stroke-width="2" stroke-linejoin="round"/>
      ${top}
      <text x="80" y="47" text-anchor="middle" dominant-baseline="central" font-family="system-ui,sans-serif" font-weight="900" font-size="10" fill="${col}">${e.name}</text>
      <circle cx="80" cy="74" r="10" fill="#3a3f47" stroke="${k}" stroke-width="2"/><circle cx="80" cy="74" r="3" fill="#d9dde3"/>
      <circle cx="108" cy="64" r="6" fill="#3a3f47" stroke="${k}" stroke-width="1.5"/><circle cx="54" cy="64" r="5" fill="#3a3f47" stroke="${k}" stroke-width="1.5"/>
      <path d="M71 70 L50 62 M89 70 L113 62 M58 60 L104 59" stroke="${k}" stroke-width="2.5" fill="none"/></svg>`;
  }
  // Emblem baktill på bilen med motorns namn.
  function engineBadge(key){
    const t = {el: 'EL', v6: 'V6', v8: 'V8', v12: 'V12', diesel: 'D'}[key], w = t.length * 8 + 10;
    return `<rect x="${-w / 2}" y="-7" width="${w}" height="14" rx="4" fill="#eef1f5" stroke="#6f7882" stroke-width="1.5"/>
      <text x="0" y="0.5" text-anchor="middle" dominant-baseline="central" font-family="system-ui,sans-serif" font-weight="900" font-size="10" fill="${ENGINE_LOOK[key]}">${t}</text>`;
  }
  const DEFAULTS = {
    sport:   {color: '#e8473c', livery: 'racing', roof: 'inget', wing: 'lapp', hood: 'standard', head: 'smal', tail: 'list', wheels: 'sport', engine: 'v8'},
    suv:     {color: '#2f6fd6', livery: 'ingen', roof: 'inget', wing: 'ingen', hood: 'standard', head: 'fyrkant', tail: 'fyrkant', wheels: 'standard', engine: 'v6'},
    lastbil: {color: '#43b55a', livery: 'ingen', roof: 'ramp', wing: 'ingen', hood: 'kupol', head: 'rund', tail: 'fyrkant', wheels: 'offroad', engine: 'diesel'},
    buss:    {color: '#e8473c', livery: 'ingen', roof: 'inget', wing: 'ingen', hood: 'standard', head: 'fyrkant', tail: 'fyrkant', wheels: 'standard', engine: 'diesel'},
    formel:  {color: '#e8473c', livery: 'racing', roof: 'inget', wing: 'gt', hood: 'standard', head: 'smal', tail: 'list', wheels: 'sport', engine: 'v12'}
  };
  // Höjd: -2 till +4 steg om 12 enheter. Hjulstorlek: -2 till +3 steg om 10 procent.
  const HEIGHT = {min: -2, max: 4, step: 12}, WSIZE = {min: -2, max: 3, step: 0.1};
  const STD = {height: 0, wsize: 0, fuel: 100, battery: 100};
  // Förbrukning i procent per sekund: tomgång plus mer ju högre varv. Påfyllning i procent per sekund.
  const BURN = {idle: 0.5, rev: 2.5}, FILL = 30, LOW = 15;

  // ---------- Körvärlden ----------
  // Fart i världens enheter per sekund (km/h = fart × 0,32) och acceleration för varje motor.
  const DRIVE = {el: {vmax: 560, acc: 520}, v6: {vmax: 500, acc: 300}, v8: {vmax: 560, acc: 360}, v12: {vmax: 640, acc: 400}, diesel: {vmax: 380, acc: 220}};
  const KMH = 0.32, CAR_SCALE = 0.4, REV = 94;
  const smooth = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  // Vägens höjd: platt vid start, sedan lugna kullar. Lutningen är högst cirka 15 grader.
  const groundY = x => 300 + smooth(x / 900) * (26 * Math.sin(x / 380) + 14 * Math.sin(x / 150 + 1.3) + 8 * Math.sin(x / 77 + 0.4));
  const hash = i => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
  // Hjulens mitt och markkontakt i bilens egna mått, samma räkning som i carSvg.
  function wheelGeo(type, c){
    const T = TYPES[type], grow = WHEELS[c.wheels].grow || 0, ws = 1 + (c.wsize || 0) * WSIZE.step;
    const ground = T.wheels[0][1] + T.wheels[0][2] + grow;
    const wh = T.wheels.map(([x, y, r]) => { const R = (r + grow) * ws; return {x, y: y + r + grow - R, R}; });
    return {ground, wh, lift: (c.height || 0) * HEIGHT.step};
  }
  function worldSvg(){
    return `<svg class="bg-world" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Körvärld">
      <defs><linearGradient id="wsky" x1="0" x2="0" y1="0" y2="1"><stop class="ws1" offset="0"/><stop class="ws2" offset="1"/></linearGradient>
        <linearGradient id="wbeam" x1="0" x2="1"><stop offset="0" stop-color="#fff6b0" stop-opacity=".85"/><stop offset="1" stop-color="#fff6b0" stop-opacity="0"/></linearGradient>
        <radialGradient id="wglow"><stop offset="0" stop-color="#fff3b0" stop-opacity=".9"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></radialGradient></defs>
      <rect width="800" height="400" fill="url(#wsky)"/>
      <g class="w-sky"></g><path class="w-far"/><g class="w-mid"></g><g class="w-posts"></g>
      <path class="w-ground"/><path class="w-road" fill="none" stroke-width="24"/><path class="w-line" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="18 22"/>
      <rect class="w-dark" width="800" height="400" fill="#0a1236" opacity="0"/>
      <g class="w-glow"></g><g class="w-beam"></g>
      <g class="w-car"></g>
    </svg>`;
  }

  let uid = 0;
  // Hela bilen som SVG. state: {lights}. Höjd lyfter karossen; hjulstorlek ändrar hjulen men de står kvar på marken.
  function carSvg(type, c, state, view){
    const T = TYPES[type], id = 'bgc' + (uid++), mode = state && state.lights || 'av', on = mode !== 'av', high = mode === 'hel';
    const lift = (c.height || 0) * HEIGHT.step, ws = 1 + (c.wsize || 0) * WSIZE.step;
    const W = WHEELS[c.wheels], grow = W.grow || 0, E = ENGINES[c.engine];
    const ground = T.wheels[0][1] + T.wheels[0][2] + grow;
    const wh = T.wheels.map(([x, y, r]) => { const R = (r + grow) * ws; return {x, y: y + r + grow - R, R}; });
    const pipes = E.pipes ? Array.from({length: E.pipes}, (_, i) => {
      const y = T.exhaust[1] - 4 - (i % 2) * 6 - Math.floor(i / 2) * 0;
      const x = T.exhaust[0] - 12 - Math.floor(i / 2) * 0;
      return `<rect x="${x}" y="${y - (E.big ? 3 : 0)}" width="${E.big ? 18 : 14}" height="${E.big ? 9 : 5}" rx="2" fill="#8a929c" stroke="#222" stroke-width="1.5"/>`;
    }).join('') : '';
    // Halvljus: kortare kägla riktad nedåt. Helljus: längre, bredare och starkare kägla.
    const hy = T.head[1] - lift;
    const beam = !on ? '' : high
      ? `<path d="M${T.head[0] - 6} ${hy - 10} L560 ${hy - 48} L560 ${hy + 56} L${T.head[0] - 6} ${hy + 10} Z" fill="url(#${id}b)"/><path d="M${T.head[0] - 6} ${hy - 6} L560 ${hy - 24} L560 ${hy + 30} L${T.head[0] - 6} ${hy + 6} Z" fill="url(#${id}b)"/>`
      : `<path d="M${T.head[0] - 6} ${hy - 4} L520 ${hy + 2} L520 ${hy + 46} L${T.head[0] - 6} ${hy + 8} Z" fill="url(#${id}b)"/>`;
    return `<svg viewBox="${view || '0 -30 500 290'}" aria-hidden="true">
      <defs><clipPath id="${id}"><path d="${T.body}"/></clipPath><clipPath id="${id}w"><path d="${T.win}"/></clipPath>
        <linearGradient id="${id}b" x1="0" x2="1"><stop offset="0" stop-color="#fff6b0" stop-opacity=".95"/><stop offset="1" stop-color="#fff6b0" stop-opacity="0"/></linearGradient>
        <radialGradient id="${id}h"><stop offset="0" stop-color="#fffbe0" stop-opacity="1"/><stop offset=".45" stop-color="#fff3a0" stop-opacity=".7"/><stop offset="1" stop-color="#fff3a0" stop-opacity="0"/></radialGradient>
        <radialGradient id="${id}t"><stop offset="0" stop-color="#ff5a4a" stop-opacity=".9"/><stop offset=".5" stop-color="#ff3020" stop-opacity=".45"/><stop offset="1" stop-color="#ff3020" stop-opacity="0"/></radialGradient>
        <radialGradient id="${id}i"><stop offset="0" stop-color="#ffc040" stop-opacity="1"/><stop offset=".5" stop-color="#ff9a10" stop-opacity=".55"/><stop offset="1" stop-color="#ff9a10" stop-opacity="0"/></radialGradient>
        <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".3" stop-color="#fff" stop-opacity=".06"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset=".72" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient>
        <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5d7a96"/><stop offset=".45" stop-color="#2c3d52"/><stop offset="1" stop-color="#1b2633"/></linearGradient></defs>
      <ellipse cx="260" cy="${ground - 2}" rx="230" ry="9" fill="rgba(0,0,0,.18)"/>
      ${wh.map(w => {
        // Fjädring: syns bara i glappet mellan karossens underkant och hjulets ovankant.
        const top = BOTTOM[type] - lift - 2, bot = w.y - w.R + 4, len = bot - top;
        if(len < 6) return '';
        const n = Math.max(3, Math.round(len / 7)), seg = len / n;
        const zig = Array.from({length: n + 1}, (_, i) => `${i ? 'L' : 'M'}${w.x + (i % 2 ? 11 : -11)} ${(top + i * seg).toFixed(1)}`).join(' ');
        return `<rect x="${w.x - 4}" y="${top}" width="8" height="${(len + w.R * 0.6).toFixed(1)}" rx="3" fill="#5b6470"/><path d="${zig}" stroke="#f2a52e" stroke-width="4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`; }).join('')}
      ${beam}
      <g class="bg-shake"><g transform="translate(0 ${-lift})">
        <g transform="translate(${T.wing[0]} ${T.wing[1]})">${WINGS[c.wing].svg(c.color)}</g>
        ${pipes}${T.under ? T.under(c.color) : ''}
        <path d="${T.body}" fill="${c.color}" stroke="#222" stroke-width="4" stroke-linejoin="round"/>
        <g clip-path="url(#${id})">${LIVERIES[c.livery].svg(T)}${T.shade ? `<rect x="0" y="40" width="500" height="170" fill="url(#${id}s)"/>` : ''}${T.detail ? T.detail(c.color) : ''}</g>
        <path d="${T.body}" fill="none" stroke="#222" stroke-width="4" stroke-linejoin="round"/>
        ${T.glass ? `<path d="${T.win}" fill="url(#${id}g)" stroke="#222" stroke-width="6" stroke-linejoin="round"/><path d="${T.win}" fill="none" stroke="#d9dde3" stroke-width="2.5" stroke-linejoin="round"/>
          <g clip-path="url(#${id}w)"><path d="${GLARE}" fill="#fff" opacity=".18"/></g>`
          : `<path d="${T.win}" fill="#bfe6ff" stroke="#222" stroke-width="3" stroke-linejoin="round"/>`}
        ${T.winLine ? `<path d="${T.winLine}" stroke="#222" stroke-width="${T.glass ? 7 : 3}"/>` : ''}${typeof T.extra === 'function' ? T.extra(c.color) : (T.extra || '')}${T.mirror ? `<path transform="translate(${T.mirror[0]} ${T.mirror[1]})" d="M-4 0 Q8 -12 24 -8 L24 4 Q8 8 -4 0 Z" fill="${c.color}" stroke="#222" stroke-width="2" stroke-linejoin="round"/>` : ''}
        <path d="${T.door}" stroke="#222" stroke-width="2.5" fill="none" opacity=".7"/>
        <g transform="translate(${T.hood[0]} ${T.hood[1]})">${HOODS[c.hood].svg(c.color)}</g>
        <g transform="translate(${T.roof[0]} ${T.roof[1]})" class="bg-roof">${ROOFS[c.roof].svg()}</g>
        <g transform="translate(${T.head[0]} ${T.head[1]})">${HEADS[c.head].svg(on)}${on ? `<ellipse cx="-12" cy="0" rx="${high ? 52 : 38}" ry="${high ? 32 : 24}" fill="url(#${id}h)" style="mix-blend-mode:screen"/>` : ''}
          <rect class="bg-ind" x="-12" y="11" width="13" height="7" rx="3" fill="#9a6a20" stroke="#222" stroke-width="1.5"/><ellipse class="bg-indg" cx="-5" cy="14" rx="22" ry="15" fill="url(#${id}i)" opacity="0"/></g>
        <g transform="translate(${T.wheels[0][0] + 52} ${T.mid - 14})">${engineBadge(c.engine)}</g>
        <g transform="translate(${T.tail[0]} ${T.tail[1]})">${TAILS[c.tail].svg(on)}${on ? `<ellipse cx="12" cy="0" rx="34" ry="22" fill="url(#${id}t)" style="mix-blend-mode:screen"/>` : ''}
          <rect class="bg-ind" x="0" y="11" width="13" height="7" rx="3" fill="#9a6a20" stroke="#222" stroke-width="1.5"/><ellipse class="bg-indg" cx="6" cy="14" rx="22" ry="15" fill="url(#${id}i)" opacity="0"/>
          <rect class="bg-rev" x="0" y="20" width="13" height="6" rx="2.5" fill="#cfd3d8" stroke="#222" stroke-width="1.5"/><ellipse class="bg-revg" cx="2" cy="23" rx="26" ry="14" fill="url(#${id}h)" opacity="0" style="mix-blend-mode:screen"/></g>
        <g clip-path="url(#${id})">${T.noArch ? '' : wh.map(w => `<circle cx="${w.x}" cy="${(w.y + lift).toFixed(1)}" r="${(w.R + 5).toFixed(1)}" fill="#2a2a2a"/>`).join('')}</g>
      </g></g>
      ${wh.map(w => `<g class="bg-wh" data-t="translate(${w.x} ${w.y.toFixed(1)})" transform="translate(${w.x} ${w.y.toFixed(1)})">${W.svg(w.R)}</g>`).join('')}
      <g class="bg-smoke"></g>
    </svg>`;
  }

  function start(root, opts){
    opts = opts || {};
    // Stor nivå får växelväljaren P R N D i körläget; liten nivå kör automatiskt (bromsen backar).
    const level = opts.level === 'big' ? 'big' : 'small', SHIFT = level === 'big';
    const store = opts.storage || {get(){ return null; }, set(){}};
    let st = null;
    try{ st = JSON.parse(store.get('bil') || 'null'); }catch(e){}
    if(!st || !st.cars) st = {type: null, cars: {}};
    Object.keys(TYPES).forEach(t => { st.cars[t] = Object.assign({}, STD, DEFAULTS[t], st.cars[t] || {}); });
    const save = () => { try{ store.set('bil', JSON.stringify(st)); }catch(e){} };

    if(!document.getElementById('bg-css')){
      const s = document.createElement('style'); s.id = 'bg-css'; s.textContent = CSS; document.head.append(s);
    }
    root.innerHTML = '';
    const el = document.createElement('div'); el.className = 'bg';
    root.append(el);

    // ---------- Ljud ----------
    let ac = null, master = null;
    function ctx(){
      if(!opts.sound) return null;
      try{
        if(!ac){ ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createDynamicsCompressor(); master.connect(ac.destination); }
        if(ac.state === 'suspended') ac.resume();
        return ac;
      }catch(e){ return null; }
    }
    function blip(freqs, vol){
      const a = ctx(); if(!a) return;
      freqs.forEach((f, i) => {
        const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + i * 0.08;
        o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.1, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
        o.connect(g).connect(master); o.start(t); o.stop(t + 0.22);
      });
    }
    function say(text){
      if(!opts.sound || !window.speechSynthesis) return;
      try{
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text); u.lang = 'sv-SE'; u.rate = 0.95;
        const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.replace('_', '-').startsWith('sv')); if(v) u.voice = v;
        speechSynthesis.speak(u);
      }catch(e){}
    }

    // Motorljud: två oscillatorer genom ett lågpassfilter, med amplitudmodulering i tändningstakt.
    let eng = null;
    function engineOn(E){
      const a = ctx(); if(!a) return;
      const out = a.createGain(); out.gain.value = 0.0001; out.connect(master);
      const filt = a.createBiquadFilter(); filt.type = 'lowpass'; filt.Q.value = 2; filt.connect(out);
      if(!E.cyl){
        const o = a.createOscillator(); o.type = 'sine'; o.connect(filt); o.start();
        const h = a.createOscillator(); h.type = 'triangle'; h.frequency.value = 55; const hg = a.createGain(); hg.gain.value = 0.25; h.connect(hg).connect(filt); h.start();
        filt.frequency.value = 4000;
        eng = {a, out, filt, o1: o, extra: [h], el: true};
      }else{
        // Två lager: ett mjukt (sinus och triangel) som bär tomgången och ett vasst (motorns egen vågform)
        // som blandas in först när man gasar. Pulseringen i tändningstakt är svag på tomgång.
        const am = a.createGain(); am.gain.value = 0.7; am.connect(filt);
        const harsh = a.createGain(); harsh.gain.value = 0.12; harsh.connect(am);
        const soft = a.createGain(); soft.gain.value = 0.9; soft.connect(am);
        const o1 = a.createOscillator(); o1.type = E.wave; o1.connect(harsh); o1.start();
        const o2 = a.createOscillator(); o2.type = 'square'; const g2 = a.createGain(); g2.gain.value = 0.35; o2.connect(g2).connect(harsh); o2.start();
        const o3 = a.createOscillator(); o3.type = 'sine'; o3.connect(soft); o3.start();
        const o4 = a.createOscillator(); o4.type = 'triangle'; const g4 = a.createGain(); g4.gain.value = 0.5; o4.connect(g4).connect(soft); o4.start();
        const lfo = a.createOscillator(); lfo.type = 'sine'; const lg = a.createGain(); lg.gain.value = 0.12; lfo.connect(lg).connect(am.gain); lfo.start();
        eng = {a, out, filt, o1, o2, lfo, am, harsh, soft, lg, extra: [o3, o4], o3, o4};
      }
      // Startmotor: ett kort surrande innan motorn tänder.
      if(E.cyl){
        const t = a.currentTime, s = a.createOscillator(), sg = a.createGain();
        s.type = 'sawtooth'; s.frequency.setValueAtTime(30, t); s.frequency.linearRampToValueAtTime(48, t + 0.6);
        sg.gain.setValueAtTime(0.0001, t); sg.gain.exponentialRampToValueAtTime(0.18, t + 0.05); sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
        s.connect(sg).connect(master); s.start(t); s.stop(t + 0.75);
      }
    }
    // calm (0–1) växer när motorn gått på tomgång en stund, och gör tomgången ännu tystare.
    function engineSet(E, rpm, calm){
      if(!eng) return;
      const t = eng.a.currentTime, k = E.max ? rpm / E.max : 0, quiet = 1 - 0.45 * (calm || 0);
      if(eng.el){
        eng.o1.frequency.setTargetAtTime(150 + k * 1900, t, 0.04);
        eng.out.gain.setTargetAtTime(0.02 * quiet + k * 0.12, t, 0.05);
        return;
      }
      const f = rpm / 60 * E.cyl / 2;
      eng.o1.frequency.setTargetAtTime(f, t, 0.03);
      eng.o2.frequency.setTargetAtTime(f * 0.5, t, 0.03);
      eng.o3.frequency.setTargetAtTime(f, t, 0.03);
      eng.o4.frequency.setTargetAtTime(f * 0.5, t, 0.03);
      eng.lfo.frequency.setTargetAtTime(f / 2, t, 0.03);
      eng.harsh.gain.setTargetAtTime(0.12 + 0.88 * k, t, 0.05);
      eng.soft.gain.setTargetAtTime(0.9 - 0.4 * k, t, 0.05);
      eng.lg.gain.setTargetAtTime(0.12 + 0.33 * k, t, 0.05);
      // bright: hur mycket ljusare ljudet blir med varvet; idleVol: ljudnivå på tomgång.
      eng.filt.frequency.setTargetAtTime(E.cutoff * 0.55 + k * E.cutoff * (E.bright || 2.2), t, 0.05);
      eng.out.gain.setTargetAtTime((E.idleVol || 0.08) * quiet + k * 0.3, t, 0.05);
    }
    function engineOff(){
      if(!eng) return;
      const e = eng; eng = null;
      try{
        e.out.gain.setTargetAtTime(0.0001, e.a.currentTime, 0.08);
        setTimeout(() => { [e.o1, e.o2, e.lfo, ...e.extra].forEach(o => { try{ o && o.stop(); }catch(x){} }); }, 400);
      }catch(x){}
    }
    // Sirén: två toner som växlar.
    let siren = null;
    function sirenOn(){
      const a = ctx(); if(!a || siren) return;
      const o = a.createOscillator(), g = a.createGain(); o.type = 'triangle'; g.gain.value = 0.08; o.connect(g).connect(master); o.start();
      let hi = false; o.frequency.value = 650;
      const iv = setInterval(() => { hi = !hi; o.frequency.setTargetAtTime(hi ? 900 : 650, a.currentTime, 0.01); }, 600);
      siren = {o, g, iv};
    }
    function sirenOff(){ if(!siren) return; clearInterval(siren.iv); try{ siren.o.stop(); }catch(e){} siren = null; }

    // ---------- Välj biltyp ----------
    let cleanup = null;
    function showTypes(){
      if(cleanup){ cleanup(); cleanup = null; }
      el.innerHTML = `<div class="bg-top"><div class="bg-title">Bygg bilen</div></div><div class="bg-types" role="group" aria-label="Välj bil"></div>`;
      const box = el.querySelector('.bg-types');
      Object.entries(TYPES).forEach(([t, T]) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'bg-type';
        b.innerHTML = carSvg(t, st.cars[t]) + `<span class="nm">${T.name}</span>`;
        b.setAttribute('aria-label', 'Välj ' + T.name.toLowerCase());
        b.addEventListener('click', () => { st.type = t; save(); blip([523, 659]); say(T.name); build(); });
        box.append(b);
      });
    }

    // ---------- Bygg och kör ----------
    const TABS = [
      {id: 'color', name: 'Färg', icon: '🎨'}, {id: 'livery', name: 'Dekor', icon: '🏁', set: LIVERIES}, {id: 'roof', name: 'Tak', icon: '🚨', set: ROOFS},
      {id: 'wing', name: 'Vinge', icon: '🪽', set: WINGS}, {id: 'hood', name: 'Huv', icon: '🔧', set: HOODS}, {id: 'head', name: 'Framlampor', icon: '💡', set: HEADS},
      {id: 'tail', name: 'Baklampor', icon: '🔴', set: TAILS}, {id: 'wheels', name: 'Fälgar', icon: '🛞', set: WHEELS}, {id: 'engine', name: 'Motor', icon: '⚙️', set: ENGINES}, {id: 'chassi', name: 'Höjd och hjul', icon: '🔩'}
    ];
    let dbg = null;   // bara för test: läser fart och lutning i körläget
    function build(){
      const type = st.type, T = TYPES[type];
      dbg = () => ({v, slope, carX, drive, running, gas, brake});
      let c = st.cars[type], tab = 'color', running = false, idleT = 0, drive = false, v = 0, carX = 0, wheelA = 0, brake = false, slope = 0, gear = 1, stillT = 0, sel = 'P', lamps = 'av', blinker = 'off', indT = 0, indOn = null, rpm = 0, gas = false, lights = false, raf = 0, last = 0, puffT = 0, blinkT = 0, yayTimer = null;
      el.innerHTML = `
        <div class="bg-top"><button type="button" class="bg-btn" data-a="types">← Byt bil</button><button type="button" class="bg-btn" data-a="garage">← Verkstan</button><div class="bg-title">${T.name}</div>
          <button type="button" class="bg-btn" data-a="night"></button><button type="button" class="bg-btn" data-a="drive">🏁 Kör!</button><button type="button" class="bg-btn done" data-a="done">Klar!</button></div>
        <div class="bg-main">
          <div class="bg-stage">
            <div class="bg-car"><div class="bg-yay" aria-live="polite"><div class="big">Vilken bil!</div></div><div class="bg-note" role="status"></div></div>
            <div class="bg-ctrl">
              <svg class="bg-tach" viewBox="0 0 200 120" aria-hidden="true"></svg>
              <svg class="bg-tach bg-speedo" viewBox="0 0 200 120" role="img" aria-label="Hastighetsmätare"></svg>
              ${SHIFT ? `<div class="bg-group bg-shift" role="group" aria-label="Växelväljare">${['P', 'R', 'N', 'D'].map(g => `<button type="button" class="bg-mini bg-gear" data-g="${g}" aria-pressed="${g === 'P'}">${g}<span>${{P: 'Parkera', R: 'Back', N: 'Neutral', D: 'Kör'}[g]}</span></button>`).join('')}</div>` : ''}
              <button type="button" class="bg-start" aria-pressed="false">START</button>
              <button type="button" class="bg-gas bg-brake" aria-label="Broms">BROMS</button>
              <button type="button" class="bg-gas" disabled aria-label="Gaspedal">GAS</button>
              <div class="bg-group" role="group" aria-label="Lampor">
                <button type="button" class="bg-mini" data-l="av" aria-pressed="true">🌑<span>Av</span></button>
                <button type="button" class="bg-mini" data-l="halv" aria-pressed="false">💡<span>Halvljus</span></button>
                <button type="button" class="bg-mini" data-l="hel" aria-pressed="false">🔆<span>Helljus</span></button>
              </div>
              <div class="bg-group bg-fuel" role="group" aria-label="Bränsle">
                <svg class="bg-fuelg" viewBox="0 0 150 60" aria-hidden="true"></svg>
                <button type="button" class="bg-mini" data-a="fill"><b class="ic">⛽</b><span>Tanka</span></button>
              </div>
              <div class="bg-group" role="group" aria-label="Blinkers">
                <button type="button" class="bg-mini blink" data-b="left" aria-pressed="false" aria-label="Blinka vänster">⬅️<span>Vänster</span></button>
                <button type="button" class="bg-mini blink" data-b="hazard" aria-pressed="false" aria-label="Varningsblinkers">⚠️<span>Varning</span></button>
                <button type="button" class="bg-mini blink" data-b="right" aria-pressed="false" aria-label="Blinka höger">➡️<span>Höger</span></button>
              </div>
              <button type="button" class="bg-horn" aria-label="Tuta">📯</button>
              <button type="button" class="bg-siren" hidden aria-pressed="false" aria-label="Blåljus">🚨</button>
            </div>
          </div>
          <div class="bg-panel"><div class="bg-tabs" role="tablist"></div><div class="bg-opts" role="group"></div></div>
        </div>`;
      const carEl = el.querySelector('.bg-car'), tach = el.querySelector('.bg-tach'), startBtn = el.querySelector('.bg-start'), gasBtn = el.querySelector('.bg-gas:not(.bg-brake)');
      // Lampor: av, halvljus eller helljus.
      el.querySelectorAll('[data-l]').forEach(b => b.addEventListener('click', () => {
        lamps = b.dataset.l;
        el.querySelectorAll('[data-l]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        blip(lamps === 'av' ? [700, 520] : lamps === 'hel' ? [880, 1175, 1400] : [880, 1175], 0.07); drawCar();
      }));
      // Blinkers: vänster, höger eller varningsblinkers. Samma knapp igen stänger av.
      el.querySelectorAll('[data-b]').forEach(b => b.addEventListener('click', () => {
        blinker = blinker === b.dataset.b ? 'off' : b.dataset.b;
        el.querySelectorAll('[data-b]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.b === blinker)));
        indT = 0; indOn = null;
      }));
      const sirenBtn = el.querySelector('.bg-siren'), tabsEl = el.querySelector('.bg-tabs'), optsEl = el.querySelector('.bg-opts'), main = el.querySelector('.bg-main'), yay = el.querySelector('.bg-yay');
      const E = () => ENGINES[c.engine];

      // Tutan: varje bil har sin egen. Högst ett tut varannan sekund, så att det inte blir tut-spam i bilen.
      const hornBtn = el.querySelector('.bg-horn');
      let lastHorn = -1e9, hornTimer = null;
      function horn(){
        const now = performance.now();
        if(now - lastHorn < HORN_GAP) return;
        lastHorn = now;
        hornBtn.classList.add('wait'); hornBtn.setAttribute('aria-disabled', 'true');
        clearTimeout(hornTimer); hornTimer = setTimeout(() => { hornBtn.classList.remove('wait'); hornBtn.removeAttribute('aria-disabled'); }, HORN_GAP);
        const a = ctx(); if(!a) return;
        const H = HORNS[type], filt = a.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = H.cut; filt.connect(master);
        H.parts.forEach(([at, dur]) => {
          const t0 = a.currentTime + at, g = a.createGain();
          g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(H.vol, t0 + 0.02);
          g.gain.setValueAtTime(H.vol, t0 + dur - 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
          g.connect(filt);
          H.f.forEach(fr => {
            const o = a.createOscillator(); o.type = H.wave;
            o.frequency.setValueAtTime(fr, t0); if(H.glide) o.frequency.linearRampToValueAtTime(fr * H.glide, t0 + dur);
            o.connect(g); o.start(t0); o.stop(t0 + dur + 0.05);
          });
        });
      }
      hornBtn.addEventListener('click', horn);

      function drawCar(){
        if(drive){
          const g = carEl.querySelector('.w-car');
          g.innerHTML = carSvg(type, c, {lights: lamps}).replace(/^\s*<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
        }else{
          const old = carEl.querySelector('svg'); if(old) old.remove();
          carEl.insertAdjacentHTML('afterbegin', carSvg(type, c, {lights: lamps}));
        }
        const R = ROOFS[c.roof];
        sirenBtn.hidden = !R.light;
        if(!R.light && lights){ lights = false; sirenOff(); }
        sirenBtn.setAttribute('aria-pressed', String(lights));
        sirenBtn.textContent = {amber: '🟠', ramp: '🔦', taxi: '🚕'}[R.light] || '🚨';
        sirenBtn.setAttribute('aria-label', {amber: 'Varningsljus', ramp: 'Ljusramp', taxi: 'Taxiskylt'}[R.light] || 'Blåljus');
      }
      // Symbol i varvräknaren för tända lampor, som på en riktig instrumentbräda:
      // grön halvljussymbol med strålar snett nedåt, blå helljussymbol med raka strålar.
      const lampIcon = () => {
        if(lamps === 'hel') return '<g transform="translate(104 64) scale(.85)" stroke="#2f6fd6" stroke-width="2.5" fill="none" stroke-linecap="round"><path d="M-2 -8 Q10 -8 10 0 Q10 8 -2 8 Z" fill="#2f6fd6"/><path d="M-6 -6 h-8 M-6 -2 h-8 M-6 2 h-8 M-6 6 h-8"/></g>';
        if(lamps === 'halv') return '<g transform="translate(104 64) scale(.85)" stroke="#1f9e3f" stroke-width="2.5" fill="none" stroke-linecap="round"><path d="M-2 -8 Q10 -8 10 0 Q10 8 -2 8 Z" fill="#2fd65a"/><path d="M-6 -6 l-8 3 M-6 -2 l-8 3 M-6 2 l-8 3 M-6 6 l-8 3"/></g>';
        return '';
      };
      // Grön pil i instrumentet som blinkar i takt med blinkersen.
      const arrow = (x, active, dir) => `<path transform="translate(${x} 18) scale(${dir} 1)" d="M10 0 L0 -9 L0 -4 L-10 -4 L-10 4 L0 4 L0 9 Z" fill="${active && indOn ? '#2fd65a' : '#e3e7ec'}" stroke="${active ? '#1f9e3f' : '#c6d1df'}" stroke-width="1.5"/>`;
      function drawTach(){
        const e = E(), max = e.max, k = Math.min(1, rpm / max), ang = Math.PI * (1 - k);
        const nx = 100 + Math.cos(ang) * 74, ny = 104 - Math.sin(ang) * 74;
        const arc = (a0, a1, col, w) => { const p = a => [100 + Math.cos(Math.PI * (1 - a)) * 84, 104 - Math.sin(Math.PI * (1 - a)) * 84];
          const [x0, y0] = p(a0), [x1, y1] = p(a1); return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A84 84 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="${col}" stroke-width="${w}" fill="none"/>`; };
        const steps = Math.round(max / 1000), ticks = Array.from({length: steps + 1}, (_, i) => { const a = Math.PI * (1 - i / steps);
          return `<text x="${(100 + Math.cos(a) * 64).toFixed(1)}" y="${(104 - Math.sin(a) * 64 + 4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" fill="#444" font-family="system-ui,sans-serif">${i}</text>`; }).join('');
        tach.innerHTML = `<path d="M10 104 A90 90 0 0 1 190 104 Z" fill="#fff" stroke="#c6d1df" stroke-width="3"/>${arc(0, 0.85, '#d9dde3', 7)}${arc(0.85, 1, '#e8473c', 7)}${ticks}
          <line x1="100" y1="104" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="#e8473c" stroke-width="4" stroke-linecap="round"/><circle cx="100" cy="104" r="7" fill="#222"/>
          <text x="100" y="86" text-anchor="middle" font-size="12" font-weight="800" fill="#222" font-family="system-ui,sans-serif">${e.name}</text>
          <text x="100" y="24" text-anchor="middle" font-size="9" fill="#666" font-family="system-ui,sans-serif">× 1000 v/min</text>
          ${arrow(28, blinker === 'left' || blinker === 'hazard', -1)}${arrow(172, blinker === 'right' || blinker === 'hazard', 1)}
          ${lampIcon()}`;
      }
      function drawTabs(){
        tabsEl.innerHTML = '';
        TABS.forEach(t => {
          const b = document.createElement('button'); b.type = 'button'; b.className = 'bg-tab'; b.setAttribute('aria-pressed', String(tab === t.id));
          b.innerHTML = `<span class="ic">${t.icon}</span>${t.name}`;
          b.addEventListener('click', () => { tab = t.id; drawTabs(); drawOpts(); });
          tabsEl.append(b);
        });
      }
      function drawOpts(){
        optsEl.innerHTML = '';
        if(tab === 'chassi'){
          // Två reglage med minus och plus, och staplar som visar steget. Den markerade stapeln är normal höjd eller storlek.
          const row = (label, key, R, more, less) => {
            const d = document.createElement('div'); d.className = 'bg-step';
            d.innerHTML = `<div class="nm">${label}</div><button type="button" class="bg-stepbtn" data-d="-1" aria-label="${less}">−</button><div class="lv" aria-hidden="true"></div><button type="button" class="bg-stepbtn" data-d="1" aria-label="${more}">+</button>`;
            const lv = d.querySelector('.lv');
            const paint = () => {
              const v = c[key] || 0;
              lv.innerHTML = Array.from({length: R.max - R.min + 1}, (_, i) => `<i class="${R.min + i <= v ? 'on' : ''}${R.min + i === 0 ? ' zero' : ''}" style="height:${10 + i * 4}px"></i>`).join('');
              d.querySelector('[data-d="-1"]').disabled = v <= R.min; d.querySelector('[data-d="1"]').disabled = v >= R.max;
            };
            d.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
              const dir = +b.dataset.d, v = Math.max(R.min, Math.min(R.max, (c[key] || 0) + dir));
              if(v === (c[key] || 0)) return;
              c[key] = v; save(); blip(dir > 0 ? [523, 784] : [784, 523], 0.07); say(dir > 0 ? more : less);
              drawCar(); paint();
            }));
            paint(); optsEl.append(d);
          };
          row('Höjd', 'height', HEIGHT, 'Högre', 'Lägre');
          row('Hjulstorlek', 'wsize', WSIZE, 'Större hjul', 'Mindre hjul');
          const reset = document.createElement('button'); reset.type = 'button'; reset.className = 'bg-btn bg-reset'; reset.textContent = 'Normal höjd och hjul';
          reset.addEventListener('click', () => { c.height = 0; c.wsize = 0; save(); blip([660], 0.07); drawCar(); drawOpts(); });
          optsEl.append(reset);
          return;
        }
        if(tab === 'color'){
          COLORS.forEach(([name, hex]) => {
            const b = document.createElement('button'); b.type = 'button'; b.className = 'bg-sw'; b.style.background = hex;
            b.setAttribute('aria-label', name); b.setAttribute('aria-pressed', String(c.color === hex));
            b.addEventListener('click', () => { set('color', hex); say(name); });
            optsEl.append(b);
          });
          return;
        }
        const t = TABS.find(x => x.id === tab);
        // Förhandsbilden zoomar in på den del som byts, så att skillnaden syns.
        // Följer med när bilen är höjd eller har större hjul.
        const L = (c.height || 0) * HEIGHT.step, [wx, wy0, wr] = T.wheels[1], wsc = 1 + (c.wsize || 0) * WSIZE.step;
        const wy = wy0 + wr - wr * wsc, wv = 56 * wsc + 4;
        const v = {
          head: `${T.head[0] - 70} ${T.head[1] - L - 42} 110 72`, tail: `${T.tail[0] - 30} ${T.tail[1] - L - 42} 110 72`,
          hood: `${T.hood[0] - 80} ${T.hood[1] - L - 50} 160 86`, roof: `${T.roof[0] - 90} ${T.roof[1] - L - 60} 180 96`,
          wing: `${T.wing[0] - 60} ${T.wing[1] - L - 86} 170 120`, wheels: `${wx - wv} ${wy - wv} ${wv * 2} ${wv * 2}`
        }[tab];
        Object.entries(t.set).forEach(([key, part]) => {
          const b = document.createElement('button'); b.type = 'button'; b.className = 'bg-opt';
          b.setAttribute('aria-pressed', String(c[tab] === key));
          const pic = tab === 'engine'
            ? `<div class="eng">${engineIcon(key)}</div>`
            : carSvg(type, Object.assign({}, c, {[tab]: key}), null, v);
          b.innerHTML = pic + `<span class="lb"></span>` + (part.sub ? `<span class="sub"></span>` : '');
          b.querySelector('.lb').textContent = part.name;
          if(part.sub) b.querySelector('.sub').textContent = part.sub;
          b.addEventListener('click', () => { set(tab, key); say(part.name); });
          optsEl.append(b);
        });
      }
      function set(k, v){
        if(c[k] === v) return;
        // Byter man motor stängs den gamla av, och den nya står still tills man trycker START.
        if(k === 'engine'){ if(running) stopEngine(); if(filling) stopFill(); }
        c[k] = v; save(); blip([660, 880], 0.08);
        drawCar(); drawOpts(); drawTach(); paintFillBtn();
      }

      // ---------- Bränsle och batteri ----------
      const isEl = () => E().cyl === 0;
      const tank = () => isEl() ? c.battery : c.fuel;
      const setTank = v => { if(isEl()) c.battery = v; else c.fuel = v; };
      let filling = false, fillTick = 0, saveT = 0, noteTimer = null;
      const fillBtn = el.querySelector('[data-a="fill"]'), fuelG = el.querySelector('.bg-fuelg'), noteEl = el.querySelector('.bg-note');
      function note(t){ noteEl.textContent = t; noteEl.classList.add('on'); clearTimeout(noteTimer); noteTimer = setTimeout(() => noteEl.classList.remove('on'), 2600); }
      function sputter(){
        const a = ctx(); if(!a) return;
        [0, 0.18, 0.4].forEach((d, i) => {
          const t = a.currentTime + d, o = a.createOscillator(), g = a.createGain();
          o.type = 'square'; o.frequency.setValueAtTime(70 - i * 15, t); o.frequency.exponentialRampToValueAtTime(30, t + 0.15);
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.2 - i * 0.05, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
          const fl = a.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 400;
          o.connect(fl).connect(g).connect(master); o.start(t); o.stop(t + 0.18);
        });
      }
      function paintFillBtn(){
        fillBtn.querySelector('.ic').textContent = isEl() ? '🔌' : '⛽';
        fillBtn.querySelector('span').textContent = filling ? 'Stopp' : isEl() ? 'Ladda' : 'Tanka';
        fillBtn.classList.toggle('on', filling);
        fillBtn.setAttribute('aria-label', isEl() ? 'Ladda batteriet' : 'Tanka');
      }
      function stopFill(){ filling = false; paintFillBtn(); save(); }
      fillBtn.addEventListener('click', () => {
        if(filling){ stopFill(); return; }
        if(drive && Math.abs(v) > 5){ note('Stanna bilen först!'); blip([300], 0.06); return; }
        if(running){ note('Stäng av motorn först!'); blip([300], 0.06); return; }
        if(tank() >= 100){ note(isEl() ? 'Batteriet är redan fullt.' : 'Tanken är redan full.'); return; }
        filling = true; fillTick = 0; paintFillBtn();
      });
      function drawFuel(t){
        const v = Math.max(0, Math.min(100, tank())), low = v < LOW, flash = low && Math.floor(t / 400) % 2 === 0;
        const col = v < LOW ? (flash ? '#e8473c' : '#f28a2e') : v < 35 ? '#f5c02e' : '#43b55a';
        fuelG.innerHTML = `<text x="16" y="38" text-anchor="middle" font-size="22" dominant-baseline="central">${isEl() ? '🔋' : '⛽'}</text>
          <rect x="34" y="24" width="110" height="26" rx="7" fill="#eef1f5" stroke="${low ? '#e8473c' : '#9aa3ad'}" stroke-width="2.5"/>
          <rect x="37" y="27" width="${(104 * v / 100).toFixed(1)}" height="20" rx="5" fill="${col}"/>
          <text x="89" y="38" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="800" fill="#1D2842" font-family="system-ui,sans-serif">${Math.round(v)} %</text>
          <text x="40" y="14" font-size="11" font-weight="700" fill="#56617A" font-family="system-ui,sans-serif">${isEl() ? 'Batteri' : E().name === 'Diesel' ? 'Diesel' : 'Bensin'}</text>`;
      }
      // Körs varje bildruta från frame(): förbrukning, tom tank och påfyllning.
      function fuelStep(dt, t){
        const e = E();
        if(running){
          setTank(Math.max(0, tank() - dt * (BURN.idle + BURN.rev * rpm / e.max)));
          if(tank() <= 0){ stopEngine(); sputter(); note(isEl() ? 'Batteriet tog slut! Tryck på 🔌 för att ladda.' : 'Tanken är tom! Tryck på ⛽ för att tanka.'); save(); }
        }
        if(filling){
          setTank(Math.min(100, tank() + dt * FILL));
          fillTick -= dt;
          if(fillTick <= 0){
            fillTick = isEl() ? 0.25 : 0.11;
            if(isEl()) blip([400 + tank() * 8], 0.05);
            else { const a = ctx(); if(a){ const tt = a.currentTime, o = a.createOscillator(), g = a.createGain(), fl = a.createBiquadFilter();
              o.type = 'sawtooth'; o.frequency.value = 120 + Math.random() * 120; fl.type = 'lowpass'; fl.frequency.value = 500 + Math.random() * 300;
              g.gain.setValueAtTime(0.0001, tt); g.gain.exponentialRampToValueAtTime(0.08, tt + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.1);
              o.connect(fl).connect(g).connect(master); o.start(tt); o.stop(tt + 0.12); } }
          }
          if(tank() >= 100){ stopFill(); blip([660, 880, 1175], 0.09); note(isEl() ? 'Fulladdad! ⚡' : 'Full tank! ⛽'); }
        }
        saveT -= dt; if(saveT <= 0 && (running || filling)){ saveT = 3; save(); }
        drawFuel(t);
      }

      function startEngine(){
        if(filling) stopFill();
        if(tank() <= 0){ sputter(); note(isEl() ? 'Batteriet är tomt! Tryck på 🔌 för att ladda.' : 'Tanken är tom! Tryck på ⛽ för att tanka.'); return; }
        running = true; rpm = 0;
        startBtn.classList.add('on'); startBtn.textContent = 'STOPP'; startBtn.setAttribute('aria-pressed', 'true');
        gasBtn.disabled = false;
        engineOn(E());
        drawCar();
      }
      function stopEngine(){
        running = false; gas = false;
        startBtn.classList.remove('on'); startBtn.textContent = 'START'; startBtn.setAttribute('aria-pressed', 'false');
        gasBtn.disabled = true; gasBtn.classList.remove('down');
        engineOff(); drawCar();
      }
      startBtn.addEventListener('click', () => running ? stopEngine() : startEngine());
      gasBtn.addEventListener('pointerdown', e => { if(!running) return; e.preventDefault(); gas = true; gasBtn.classList.add('down'); gasBtn.setPointerCapture && gasBtn.setPointerCapture(e.pointerId); });
      const gasUp = () => { gas = false; gasBtn.classList.remove('down'); };
      gasBtn.addEventListener('pointerup', gasUp); gasBtn.addEventListener('pointercancel', gasUp);
      gasBtn.addEventListener('keydown', e => { if(e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); gas = true; gasBtn.classList.add('down'); } });
      gasBtn.addEventListener('keyup', gasUp);
      sirenBtn.addEventListener('click', () => {
        lights = !lights; sirenBtn.setAttribute('aria-pressed', String(lights));
        if(lights && ROOFS[c.roof].light === 'blue') sirenOn(); else sirenOff();
        if(ROOFS[c.roof].light === 'ramp' || ROOFS[c.roof].light === 'taxi') blip(lights ? [880, 1175] : [700, 520], 0.07);
      });

      // Varvtal, skakning, rök och blinkande ljus.
      function frame(t){
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
        const e = E(), svg = carEl.querySelector('svg');
        if(drive) driveStep(dt);
        if(running){
          if(drive && SHIFT && (sel === 'P' || sel === 'N')){
            const target = gas ? e.max : e.idle;
            rpm += (target - rpm) * Math.min(1, dt * (gas ? 2.4 : 1.6));
            if(gas && rpm > e.max * 0.97) rpm = e.max * 0.9;
          }else if(drive && SHIFT && sel === 'R'){
            const target = e.cyl ? e.idle + (e.max * 0.5 - e.idle) * Math.min(1, Math.abs(v) / REV) * (gas ? 1 : 0.4) : Math.abs(v) / REV * e.max * 0.3;
            rpm += (target - rpm) * Math.min(1, dt * 6);
          }else if(drive){
            // Varvtalet följer farten. Förbränningsmotorerna har fem växlar; elmotorn har ingen växellåda.
            const dp = DRIVE[c.engine], sp = Math.abs(v);
            let target;
            if(!e.cyl) target = sp / dp.vmax * e.max * 0.95 + (gas ? e.max * 0.05 : 0);
            else{
              const gr = dp.vmax / 5; gear = Math.min(5, Math.floor(sp / gr) + 1);
              const frac = Math.min(1, (sp - (gear - 1) * gr) / gr);
              target = sp < 5 && !gas ? e.idle : e.idle + (e.max * 0.9 - e.idle) * (gas ? 0.3 + 0.7 * frac : 0.12 + 0.5 * frac);
            }
            rpm += (target - rpm) * Math.min(1, dt * 6);
          }else{
            const target = gas ? e.max : e.idle;
            rpm += (target - rpm) * Math.min(1, dt * (gas ? 2.4 : 1.6));
            if(gas && rpm > e.max * 0.97) rpm = e.max * 0.9;          // varvbegränsare
          }
          idleT = gas || drive && Math.abs(v) > 5 || rpm > (e.idle || 0) * 1.3 + 200 ? 0 : idleT + dt;
          engineSet(e, rpm, Math.max(0, Math.min(1, (idleT - 3) / 3)));
        }else rpm += (0 - rpm) * Math.min(1, dt * 3);
        fuelStep(dt, t);
        drawTach();
        if(svg){
          const shake = svg.querySelector('.bg-shake');
          if(shake){
            const amp = running && e.cyl ? 0.5 + (rpm / e.max) * 1.4 : 0;
            shake.setAttribute('transform', `translate(0 ${(Math.sin(t / 1000 * (e.cyl ? 40 + rpm / 60 : 0)) * amp).toFixed(2)})`);
          }
          // rök vid höga varv
          puffT -= dt;
          const smoke = svg.querySelector('.bg-smoke');
          if(smoke && running && e.pipes && rpm > e.max * 0.55 && puffT <= 0){
            puffT = 0.12;
            const p = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            p.setAttribute('cx', T.exhaust[0] - 16); p.setAttribute('cy', T.exhaust[1] - 4 - (c.height || 0) * HEIGHT.step); p.setAttribute('r', 5);
            p.setAttribute('fill', e.big ? '#555' : '#9aa3ad'); p.setAttribute('opacity', '.7'); p.dataset.age = 0;
            smoke.append(p);
          }
          smoke && smoke.querySelectorAll('circle').forEach(p => {
            const age = +p.dataset.age + dt; p.dataset.age = age;
            p.setAttribute('cx', (+p.getAttribute('cx') - 60 * dt).toFixed(1)); p.setAttribute('cy', (+p.getAttribute('cy') - 18 * dt).toFixed(1));
            p.setAttribute('r', (5 + age * 22).toFixed(1)); p.setAttribute('opacity', Math.max(0, 0.7 - age).toFixed(2));
            if(age > 0.7) p.remove();
          });
          blinkT += dt;
          if(blinker !== 'off'){
            indT += dt;
            const phase = Math.floor(indT / 0.38) % 2 === 0;
            if(phase !== indOn){ indOn = phase; blip([indOn ? 1600 : 1150], 0.035); }
          }else indOn = false;
          svg.querySelectorAll('.bg-ind').forEach(x => x.setAttribute('fill', indOn ? '#ffb020' : '#9a6a20'));
          svg.querySelectorAll('.bg-indg').forEach(x => x.setAttribute('opacity', indOn ? '1' : '0'));
          // Backljus: tänt i R på stor nivå, och när bilen rullar bakåt på liten nivå.
          const revOn = drive && (SHIFT ? sel === 'R' : v < -1);
          svg.querySelectorAll('.bg-rev').forEach(x => x.setAttribute('fill', revOn ? '#ffffff' : '#cfd3d8'));
          svg.querySelectorAll('.bg-revg').forEach(x => x.setAttribute('opacity', revOn ? '1' : '0'));
          const roof = svg.querySelector('.bg-roof');
          if(roof){
            const kind = ROOFS[c.roof].light, steady = kind === 'ramp' || kind === 'taxi';
            roof.classList.toggle('bg-lit', lights && steady);
            roof.classList.toggle('bg-blink-a', lights && !steady && Math.floor(blinkT * 3) % 2 === 0);
            roof.classList.toggle('bg-blink-b', lights && !steady && Math.floor(blinkT * 3) % 2 === 1);
          }
        }
      }
      raf = requestAnimationFrame(frame);

      // ---------- Köra i världen ----------
      let night = !!st.night;
      const nightBtn = el.querySelector('[data-a="night"]'), brakeBtn = el.querySelector('.bg-brake');
      function applySky(){
        const w = carEl.querySelector('.bg-world'); if(!w) return;
        w.querySelector('.ws1').setAttribute('stop-color', night ? '#0b1236' : '#7cc4f2');
        w.querySelector('.ws2').setAttribute('stop-color', night ? '#2a3566' : '#e3f4ff');
        w.querySelector('.w-dark').setAttribute('opacity', night ? '.38' : '0');
        w.querySelector('.w-road').setAttribute('stroke', night ? '#3a414c' : '#5b6470');
        w.querySelector('.w-car').style.filter = night ? 'brightness(.85)' : '';
        nightBtn.textContent = night ? '☀️ Dag' : '🌙 Natt';
        nightBtn.setAttribute('aria-label', night ? 'Byt till dag' : 'Byt till natt');
      }
      nightBtn.addEventListener('click', () => { night = !night; st.night = night; save(); applySky(); blip(night ? [523, 392] : [392, 523], 0.07); say(night ? 'Natt' : 'Dag'); });
      function enterDrive(){
        drive = true; v = 0; carX = 0; brake = false; el.classList.add('driving');
        const old = carEl.querySelector('svg'); if(old) old.remove();
        carEl.insertAdjacentHTML('afterbegin', worldSvg());
        applySky(); drawCar(); updateWorld(0);
        setSel('P', true);
        note(SHIFT ? (running ? 'Lägg i D och tryck på GAS!' : 'Starta motorn, lägg i D och tryck på GAS!') : running ? 'Tryck på GAS för att köra!' : 'Starta motorn och tryck på GAS!');
      }
      function exitDrive(){ drive = false; v = 0; brake = false; el.classList.remove('driving'); brakeBtn.classList.remove('down'); drawCar(); }
      el.querySelector('[data-a="drive"]').addEventListener('click', () => { blip([523, 659, 784], 0.08); enterDrive(); });
      el.querySelector('[data-a="garage"]').addEventListener('click', exitDrive);
      brakeBtn.addEventListener('pointerdown', e => { e.preventDefault(); brake = true; brakeBtn.classList.add('down'); brakeBtn.setPointerCapture && brakeBtn.setPointerCapture(e.pointerId); });
      const brakeUp = () => { brake = false; brakeBtn.classList.remove('down'); };
      brakeBtn.addEventListener('pointerup', brakeUp); brakeBtn.addEventListener('pointercancel', brakeUp);
      // Piltangenter: höger = gas, vänster = broms (bra vid test på dator).
      function onKey(ev){
        if(!drive) return;
        const down = ev.type === 'keydown';
        if(ev.key === 'ArrowRight'){ if(running){ gas = down; gasBtn.classList.toggle('down', down); } ev.preventDefault(); }
        if(ev.key === 'ArrowLeft'){ brake = down; brakeBtn.classList.toggle('down', down); ev.preventDefault(); }
        if(SHIFT && down && /^[prnd]$/i.test(ev.key)) setSel(ev.key.toUpperCase());
      }
      window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey);

      // Fysik: gas ger kraft som avtar mot toppfarten, luftmotstånd, backarna drar och bromsen
      // stannar bilen. Håller man inne bromsen när bilen står och motorn går backar den sakta.
      function driveStep(dt){
        const dp = DRIVE[c.engine], canGo = running && tank() > 0;
        if(SHIFT){ shiftStep(dt, dp, canGo); carX += v * dt; updateWorld(dt); return; }
        let a = 0;
        if(gas && canGo) a += dp.acc * Math.max(0, 1 - Math.max(0, v) / dp.vmax);
        a -= 0.22 * v;
        if(!gas && Math.abs(v) > 1) a -= Math.sign(v) * 40;          // rullmotstånd: bilen rullar ut
        if(!(brake && Math.abs(v) < 1)) a += 380 * Math.sin(slope);   // y växer nedåt: nedförsbacke framåt = positiv lutning = rullar framåt
        v += a * dt;
        // Bromsen stannar bilen. Först när bilen stått still med bromsen nere i 0,7 sekunder backar den,
        // och då högst 30 km/h.
        if(brake){
          if(v > 4 || !canGo || stillT < 0.7){ const d = 650 * dt; v = Math.abs(v) <= d ? 0 : v - Math.sign(v) * d; }
          else v = Math.max(-REV, v - 120 * dt);
          stillT = Math.abs(v) < 1 ? stillT + dt : v < 0 ? stillT : 0;
        }else stillT = 0;
        if(!gas && !brake && Math.abs(v) < 8 && Math.abs(slope) < 0.04) v = 0;
        v = Math.max(-REV, Math.min(dp.vmax * 1.05, v));
        carX += v * dt;
        updateWorld(dt);
      }

      // Stor nivå: P står still, R backar med gasen, N rullar fritt och D kör framåt.
      // Bromsen stannar bilen i alla lägen men backar aldrig.
      function shiftStep(dt, dp, canGo){
        if(sel === 'P'){ v = 0; return; }
        let a = 0;
        if(gas && canGo && sel === 'D') a += dp.acc * Math.max(0, 1 - Math.max(0, v) / dp.vmax);
        if(gas && canGo && sel === 'R') a -= 180 * Math.max(0, 1 - Math.max(0, -v) / REV);
        a -= 0.22 * v;
        if(!(gas && (sel === 'D' || sel === 'R')) && Math.abs(v) > 1) a -= Math.sign(v) * 40;
        if(!(brake && Math.abs(v) < 1)) a += 380 * Math.sin(slope);   // y växer nedåt: nedförsbacke framåt = positiv lutning = rullar framåt
        v += a * dt;
        if(brake){ const d = 650 * dt; v = Math.abs(v) <= d ? 0 : v - Math.sign(v) * d; }
        if(!gas && !brake && Math.abs(v) < 8 && Math.abs(slope) < 0.04) v = 0;
        v = Math.max(sel === 'R' ? -REV : -dp.vmax, Math.min(dp.vmax * 1.05, v));
      }
      const gearBtns = el.querySelectorAll('.bg-gear');
      function setSel(g, quiet){
        if(g === sel) return;
        if((g === 'P' || g === 'R') && Math.abs(v) * KMH > 5){ note('Stanna bilen först!'); blip([300], 0.06); return; }
        if(g === 'D' && v < -3 || g === 'R' && v > 3){ note('Stanna bilen först!'); blip([300], 0.06); return; }
        sel = g;
        gearBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.g === g)));
        if(!quiet){ blip([520, 700], 0.06); say({P: 'Parkering', R: 'Back', N: 'Neutral', D: 'Kör'}[g]); }
      }
      gearBtns.forEach(b => b.addEventListener('click', () => setSel(b.dataset.g)));

      // Hastighetsmätare som varvräknaren: 0–240 km/h med farten i siffror och växeln i mitten.
      const speedo = el.querySelector('.bg-speedo');
      function drawSpeedo(){
        const kmh = Math.abs(v) * KMH, MAXK = 240, k = Math.min(1, kmh / MAXK), ang = Math.PI * (1 - k);
        const nx = 100 + Math.cos(ang) * 74, ny = 104 - Math.sin(ang) * 74;
        const ticks = Array.from({length: 7}, (_, i) => { const a = Math.PI * (1 - i / 6);
          return `<text x="${(100 + Math.cos(a) * 64).toFixed(1)}" y="${(104 - Math.sin(a) * 64 + 4).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="700" fill="#444" font-family="system-ui,sans-serif">${i * 40}</text>`; }).join('');
        const minor = Array.from({length: 25}, (_, i) => { const a = Math.PI * (1 - i / 24), r1 = i % 4 ? 80 : 76;
          return `<line x1="${(100 + Math.cos(a) * r1).toFixed(1)}" y1="${(104 - Math.sin(a) * r1).toFixed(1)}" x2="${(100 + Math.cos(a) * 86).toFixed(1)}" y2="${(104 - Math.sin(a) * 86).toFixed(1)}" stroke="#9aa3ad" stroke-width="${i % 4 ? 1.5 : 2.5}"/>`; }).join('');
        const g = SHIFT ? (sel === 'D' ? (E().cyl ? 'D' + gear : 'D') : sel) : (v < -2 ? 'R' : !E().cyl ? 'E' : String(gear));
        speedo.innerHTML = `<path d="M10 104 A90 90 0 0 1 190 104 Z" fill="#fff" stroke="#c6d1df" stroke-width="3"/>${minor}${ticks}
          <line x1="100" y1="104" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="#2f6fd6" stroke-width="4" stroke-linecap="round"/><circle cx="100" cy="104" r="7" fill="#222"/>
          <text x="100" y="74" text-anchor="middle" font-size="20" font-weight="900" fill="#1D2842" font-family="system-ui,sans-serif">${Math.round(kmh)}</text>
          <text x="100" y="90" text-anchor="middle" font-size="10" font-weight="800" fill="#56617A" font-family="system-ui,sans-serif">km/h · ${g}</text>`;
      }

      // Ritar världen runt bilen: himmel, berg, träd och hus, gatlyktor, väg och bilen själv.
      function updateWorld(dt){
        const w = carEl.querySelector('.bg-world'); if(!w) return;
        const camX = carX - 230, n = night;
        // Himlen: sol och moln på dagen, måne och stjärnor på natten.
        let sky = '';
        if(n){
          sky += '<circle cx="660" cy="70" r="26" fill="#f4f1d6"/><circle cx="672" cy="62" r="24" fill="#0b1236" opacity=".85"/>';
          for(let i = 0; i < 40; i++){ const x = ((hash(i) * 1600 - camX * 0.04) % 800 + 800) % 800, y = hash(i + 50) * 180 + 8; sky += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(hash(i + 90) * 1.4 + 0.6).toFixed(1)}" fill="#fff" opacity="${(0.5 + hash(i + 30) * 0.5).toFixed(2)}"/>`; }
        }else{
          sky += '<circle cx="660" cy="70" r="30" fill="#ffd84a"/>';
          for(let i = 0; i < 4; i++){ const x = ((i * 300 - camX * 0.08) % 1200 + 1200) % 1200 - 150, y = 50 + hash(i) * 60;
            sky += `<g fill="#fff" opacity=".95"><circle cx="${x}" cy="${y}" r="20"/><circle cx="${x + 22}" cy="${y - 8}" r="24"/><circle cx="${x + 46}" cy="${y}" r="18"/></g>`; }
        }
        w.querySelector('.w-sky').innerHTML = sky;
        // Berg långt bort, som rör sig långsamt.
        let far = 'M0 400';
        for(let x = 0; x <= 800; x += 20){ const wx = x + camX * 0.25; far += ` L${x} ${(232 + 22 * Math.sin(wx / 260) + 14 * Math.sin(wx / 97 + 2)).toFixed(1)}`; }
        w.querySelector('.w-far').setAttribute('d', far + ' L800 400 Z');
        w.querySelector('.w-far').setAttribute('fill', n ? '#26335a' : '#a9d6c8');
        // Mellanplanet: kullar med träd och hus.
        const k = 0.6, hm = wx => 268 + 10 * Math.sin(wx / 210);
        let mid = 'M0 400';
        for(let x = 0; x <= 800; x += 20) mid += ` L${x} ${hm(x + camX * k).toFixed(1)}`;
        let midSvg = `<path d="${mid} L800 400 Z" fill="${n ? '#1d2b3f' : '#9fd08a'}"/>`;
        const first = Math.floor(camX * k / 150) - 1;
        for(let i = first; i < first + 8; i++){
          const ox = i * 150 + hash(i) * 70, sx = ox - camX * k, by = hm(ox);
          if(sx < -80 || sx > 880) continue;
          if(hash(i + 7) < 0.33){
            const col = ['#f28a2e', '#e8473c', '#f5c02e', '#ff8fb7', '#7ec8f2'][Math.floor(hash(i + 3) * 5)];
            midSvg += `<g transform="translate(${sx.toFixed(1)} ${by.toFixed(1)})"><rect x="-26" y="-40" width="52" height="40" fill="${n ? '#3a3550' : col}" stroke="#222" stroke-width="2"/><path d="M-32 -40 L0 -66 L32 -40 Z" fill="${n ? '#2a2540' : '#8a3a2a'}" stroke="#222" stroke-width="2"/>
              <rect x="-16" y="-30" width="12" height="12" fill="${n ? '#ffe680' : '#bfe6ff'}" stroke="#222" stroke-width="1.5"/><rect x="6" y="-30" width="12" height="12" fill="${n ? '#ffe680' : '#bfe6ff'}" stroke="#222" stroke-width="1.5"/><rect x="-5" y="-16" width="10" height="16" fill="#5b3a1e"/></g>`;
          }else{
            const h = 34 + hash(i + 11) * 24;
            midSvg += `<g transform="translate(${sx.toFixed(1)} ${by.toFixed(1)})"><rect x="-4" y="${-h * 0.45}" width="8" height="${h * 0.45}" fill="#6b4226"/><circle cx="0" cy="${-h * 0.6}" r="${h * 0.38}" fill="${n ? '#163024' : '#3f9e4a'}" stroke="#222" stroke-width="1.5"/></g>`;
          }
        }
        w.querySelector('.w-mid').innerHTML = midSvg;
        // Gatlyktor längs vägen; på natten lyser de.
        let posts = '', glow = '';
        const pFirst = Math.floor(camX / 420) - 1;
        for(let i = pFirst; i < pFirst + 4; i++){
          const px = i * 420 + 200, sx = px - camX, py = groundY(px) - 4;
          if(sx < -60 || sx > 860) continue;
          posts += `<path d="M${sx} ${py} L${sx} ${py - 116} Q${sx} ${py - 126} ${sx + 12} ${py - 126} L${sx + 20} ${py - 126}" stroke="#4a525d" stroke-width="5" fill="none"/><rect x="${sx + 12}" y="${py - 130}" width="16" height="8" rx="3" fill="${n ? '#fff3b0' : '#d9dde3'}" stroke="#222" stroke-width="1.5"/>`;
          if(n) glow += `<circle cx="${sx + 20}" cy="${py - 122}" r="46" fill="url(#wglow)"/><ellipse cx="${sx + 24}" cy="${py + 2}" rx="60" ry="10" fill="#fff3b0" opacity=".25"/>`;
        }
        w.querySelector('.w-posts').innerHTML = posts;
        // Mark och väg.
        let road = '';
        for(let x = -20; x <= 820; x += 10) road += `${x === -20 ? 'M' : ' L'}${x} ${(groundY(x + camX) + 10).toFixed(1)}`;
        w.querySelector('.w-road').setAttribute('d', road);
        w.querySelector('.w-line').setAttribute('d', road);
        w.querySelector('.w-line').setAttribute('stroke-dashoffset', (camX % 40).toFixed(1));
        w.querySelector('.w-ground').setAttribute('d', road + ' L820 400 L-20 400 Z');
        w.querySelector('.w-ground').setAttribute('fill', n ? '#1b2b22' : '#6fb35d');
        // Bilen: bakhjulet står på vägen vid carX och framhjulet där vägen är längre fram.
        const G = wheelGeo(type, c), s = CAR_SCALE, rx = G.wh[0].x, fx = G.wh[1].x;
        const xr = carX, xf = carX + (fx - rx) * s, yr = groundY(xr), yf = groundY(xf);
        slope = Math.atan2(yf - yr, xf - xr);
        const deg = slope * 180 / Math.PI;
        w.querySelector('.w-car').setAttribute('transform', `translate(${(xr - camX).toFixed(1)} ${yr.toFixed(1)}) rotate(${deg.toFixed(2)}) scale(${s}) translate(${-rx} ${-G.ground})`);
        // Hjulen snurrar i takt med farten.
        wheelA += v * dt / (G.wh[0].R * s) * 180 / Math.PI;
        w.querySelectorAll('.bg-wh').forEach(h => h.setAttribute('transform', `${h.dataset.t} rotate(${(wheelA % 360).toFixed(1)})`));
        // Strålkastarnas ljus på vägen på natten.
        let beam = '';
        if(n && lamps !== 'av'){
          const ca = Math.cos(slope), sa = Math.sin(slope), hx = T.head[0] - rx, hy = T.head[1] - G.lift - G.ground;
          const wx = xr - camX + s * (hx * ca - hy * sa), wy = yr + s * (hx * sa + hy * ca);
          const L = lamps === 'hel' ? 420 : 230, sp = lamps === 'hel' ? 75 : 40, b = slope + (lamps === 'hel' ? 0 : 0.12);
          const ex = wx + L * Math.cos(b), ey = wy + L * Math.sin(b);
          beam = `<path d="M${wx.toFixed(1)} ${(wy - 3).toFixed(1)} L${(ex + sp * Math.sin(b)).toFixed(1)} ${(ey - sp * Math.cos(b)).toFixed(1)} L${(ex - sp * Math.sin(b)).toFixed(1)} ${(ey + sp * Math.cos(b)).toFixed(1)} L${wx.toFixed(1)} ${(wy + 3).toFixed(1)} Z" fill="url(#wbeam)" style="mix-blend-mode:screen"/>`;
        }
        // Ljusrampen på taket: en lång, bred kägla framåt och nedåt som lyser upp vägen långt fram.
        if(n && lights && ROOFS[c.roof].light === 'ramp'){
          const ca = Math.cos(slope), sa = Math.sin(slope), hx = T.roof[0] + 40 - rx, hy = T.roof[1] - 16 - G.lift - G.ground;
          const wx = xr - camX + s * (hx * ca - hy * sa), wy = yr + s * (hx * sa + hy * ca);
          const L = 520, sp = 95, b = slope + 0.17;
          const ex = wx + L * Math.cos(b), ey = wy + L * Math.sin(b);
          beam += `<path d="M${wx.toFixed(1)} ${(wy - 6).toFixed(1)} L${(ex + sp * Math.sin(b)).toFixed(1)} ${(ey - sp * Math.cos(b)).toFixed(1)} L${(ex - sp * Math.sin(b)).toFixed(1)} ${(ey + sp * Math.cos(b)).toFixed(1)} L${wx.toFixed(1)} ${(wy + 6).toFixed(1)} Z" fill="url(#wbeam)" style="mix-blend-mode:screen"/>`;
        }
        w.querySelector('.w-beam').innerHTML = beam;
        w.querySelector('.w-glow').innerHTML = glow;
        drawSpeedo();
      }

      el.querySelector('[data-a="types"]').addEventListener('click', showTypes);
      el.querySelector('[data-a="done"]').addEventListener('click', () => {
        carEl.classList.remove('flash'); void carEl.offsetWidth; carEl.classList.add('flash');
        yay.classList.add('on'); blip([523, 659, 784, 1047]); say('Vilken bil!');
        clearTimeout(yayTimer); yayTimer = setTimeout(() => yay.classList.remove('on'), 2200);
        if(typeof opts.onFinish === 'function') opts.onFinish();
      });
      const layout = () => main.classList.toggle('port', main.clientHeight > main.clientWidth * 0.95);
      const ro = window.ResizeObserver ? new ResizeObserver(layout) : null; if(ro) ro.observe(main);
      function onVis(){ if(document.visibilityState === 'hidden'){ if(running) stopEngine(); lights = false; sirenOff(); } }
      document.addEventListener('visibilitychange', onVis);

      drawCar(); drawTabs(); drawOpts(); drawTach(); layout(); paintFillBtn(); drawFuel(0);
      cleanup = () => {
        cancelAnimationFrame(raf); clearTimeout(yayTimer); if(ro) ro.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey);
        engineOff(); sirenOff();
      };
    }

    if(st.type && TYPES[st.type]) build(); else showTypes();

    return {
      _drive: () => dbg ? dbg() : null,   // bara för test
      stop(){
        if(cleanup) cleanup();
        try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
        setTimeout(() => { try{ if(ac) ac.close(); }catch(e){} }, 500);
        root.innerHTML = '';
      }
    };
  }

  (window.HLK_SPEL = window.HLK_SPEL || []).push({
    id: 'byggbilen', title: 'Bygg bilen', icon: '🏎️',
    about: 'Välj sportbil, SUV, pickup, buss eller formelbil och byt färg, dekor, tak, vinge, motorhuv, fram- och baklampor, fälgar, motor, höjd och hjulstorlek. Starta motorn och varva, och kör sedan ute i en 2D-värld på dagen eller natten. Samma på båda nivåerna.',
    start,
    _test: {TYPES, LIVERIES, ROOFS, WINGS, HOODS, HEADS, TAILS, WHEELS, ENGINES}
  });
})();
