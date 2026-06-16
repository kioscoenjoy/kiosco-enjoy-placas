const CACHE = "ke-placas-v5";
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./fonts.css",
  "./generator.css",
  "./src/placa.jsx",
  "./src/catalog.jsx",
  "./src/reel.jsx",
  "./src/app.jsx",
  "./src/tweaks-panel.jsx",
  "./assets/logo-white.svg",
  "./assets/logo-red.svg",
  "./assets/logo-black.svg",
  "./fonts/Exo2-Regular.ttf",
  "./fonts/Exo2-Italic.ttf",
  "./fonts/Exo2-Medium.ttf",
  "./fonts/Exo2-SemiBold.ttf",
  "./fonts/Exo2-Bold.ttf",
  "./fonts/Exo2-BoldItalic.ttf",
  "./fonts/Exo2-ExtraBold.ttf",
  "./fonts/Exo2-ExtraBoldItalic.ttf",
  "./fonts/Exo2-Black.ttf",
  "./fonts/Exo2-BlackItalic.ttf",
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // CDN resources: network first, then cache
  if (e.request.url.includes("unpkg.com") || e.request.url.includes("cdn.jsdelivr")) {
    e.respondWith(
      fetch(e.request).then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // App shell: cache first
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }))
  );
});
