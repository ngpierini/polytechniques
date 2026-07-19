// Minimal offline cache for the static PolyTechniques site.
// Cache-first for same-origin assets so the calculators still work with no
// connection; anything not pre-cached is fetched from the network and
// cached for next time. Bump CACHE_NAME whenever the pre-cache list below
// changes so old clients pick up the new set instead of serving stale files.
const CACHE_NAME = "polytechniques-v3";

const PRECACHE_URLS = [
  "home.html",
  "calculator.html",
  "polymer-search.html",
  "tg-predictor.html",
  "gpc-calibration.html",
  "copolymer-composition.html",
  "recipe-scaling.html",
  "mechanisms.html",
  "gpc-peak-interpretation.html",
  "air-free-technique.html",
  "conversion-monitoring.html",
  "glossary.html",
  "polymer-chain-game.html",
  "founder.html",
  "whats-new.html",
  "404.html",
  "style.css",
  "theme.js",
  "nav.js",
  "polymer-data.js",
  "polymer-search.js",
  "favicon.svg",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.filter(function (name) { return name !== CACHE_NAME; })
             .map(function (name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;

  event.respondWith(
    caches.match(req).then(function (cached) {
      var network = fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(req, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
