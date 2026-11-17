// Hur långt är det kvar – sparar appen i enheten så att den går att öppna utan uppkoppling.
// Ligger i samma mapp som hur-langt-kvar.html. Byt versionsnummer när appens filer ändras.
const SHELL = 'hlk-app-v3';
// Appen, spelvärden och alla spel, så att spelen fungerar utan nät under resan.
const GAME_FILES = ['bilbingo', 'memory', 'monster', 'pussel', 'kurragomma', 'forstabokstaven', 'slangbellan', 'ballonger',
  'helikoptern', 'klapadockan', 'rakna', 'parkera', 'godis', 'farglagg', 'prickar', 'musik', 'byggbilen', 'koppla', 'panelen',
  'masken', 'murbrytaren', 'husdjuret'];
const APP = ['./hur-langt-kvar.html', './sw.js', './spel.html', './spel/lib/matter.min.js'].concat(GAME_FILES.map(n => `./spel/${n}.js`));
const LIBS = [
  'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js',
  'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.css'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL)
    .then(c => Promise.all(APP.concat(LIBS).map(u => c.add(u).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('hlk-app-') && k !== SHELL).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);

  // Appen själv: hämta ny version om det går, annars den sparade.
  if(url.origin === location.origin){
    e.respondWith(fetch(req).then(res => {
      if(res.ok){ const copy = res.clone(); caches.open(SHELL).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, {ignoreSearch: true})));
    return;
  }

  // Kartbiblioteket och typsnitten ändras inte: använd den sparade kopian först.
  if(url.hostname === 'cdn.jsdelivr.net' || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'){
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if(res.ok || res.type === 'opaque'){ const copy = res.clone(); caches.open(SHELL).then(c => c.put(req, copy)); }
      return res;
    })));
  }
  // Allt annat (sökning, vägberäkning, kartdata) hanteras av appen själv.
});
