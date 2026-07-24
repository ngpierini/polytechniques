// Minimal offline cache for the static PolyTechniques site.
// Pages are network-first with a cache fallback (their URLs carry no ?v=, so
// a cache hit would pin the whole deploy); every other same-origin asset is
// cache-first, since its URL is versioned and a hit is always the right file.
// Either way the calculators still work with no connection. Bump CACHE_NAME
// whenever the pre-cache list below changes so old clients pick up the new
// set instead of serving stale files.
const CACHE_NAME = "polytechniques-v59";

const PRECACHE_URLS = [
  "home.html",
  "calculator.html",
  "polymer-search.html",
  "tg-predictor.html",
  "gpc-calibration.html",
  "copolymer-composition.html",
  "dispersity-predictor.html",
  "recipe-scaling.html",
  "mechanisms.html",
  "gpc-peak-interpretation.html",
  "air-free-technique.html",
  "conversion-monitoring.html",
  "glossary.html",
  "polymer-chain-game.html",
  "founder.html",
  "whats-new.html",
  "terms.html",
  "404.html",
  "style.css",
  "theme.js",
  "nav.js?v=6",
  "polymer-calc-core.js?v=1",
  "polymer-data.js",
  "polymer-search.js",
  "search-index.json",
  "favicon.svg",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png"
];

// Cloudflare Pages 308-redirects "home.html" to "home", so a plain addAll
// would store redirected responses — and Chrome refuses to serve a cached
// redirected response for a navigation, which would break offline mode.
// stripRedirect rebuilds the response so the cached copy is a clean 200.
function stripRedirect(res) {
  if (!res.redirected) return Promise.resolve(res);
  return res.blob().then(function (body) {
    return new Response(body, { status: 200, statusText: "OK", headers: res.headers });
  });
}

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(PRECACHE_URLS.map(function (u) {
        return fetch(u).then(function (res) {
          if (!res.ok) return; // skip rather than fail the whole install
          return stripRedirect(res).then(function (clean) { return cache.put(u, clean); });
        }).catch(function () {});
      }));
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

function cachePut(req, res) {
  if (!res || !res.ok) return res;
  var copy = res.clone();
  caches.open(CACHE_NAME).then(function (cache) {
    stripRedirect(copy).then(function (clean) { cache.put(req, clean); });
  });
  return res;
}

self.addEventListener("fetch", function (event) {
  var req = event.request;
  var url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  // Serverless endpoints are live data; caching them would serve stale
  // results and break the /api/health deployment check.
  if (url.pathname.indexOf("/api/") === 0) return;

  // HTML is the one thing here that carries no ?v= in its own URL, so a
  // cache-first hit serves the previous deploy's page, which then asks for
  // the previous deploy's style.css?v=N. Returning visitors stayed a deploy
  // behind until their second load. Pages go to the network first and fall
  // back to the cache, which keeps the site usable offline at the bench.
  var isPage = req.mode === "navigate" || req.destination === "document";
  if (isPage) {
    event.respondWith(
      fetch(req)
        .then(function (res) { return cachePut(req, res); })
        .catch(function () {
          return caches.match(req).then(function (cached) {
            return cached || caches.match("home.html");
          });
        })
    );
    return;
  }

  // Everything else is versioned in its URL, so a cache hit is by definition
  // the right file and the network round trip is pure latency.
  event.respondWith(
    caches.match(req).then(function (cached) {
      var network = fetch(req)
        .then(function (res) { return cachePut(req, res); })
        .catch(function () { return cached; });
      return cached || network;
    })
  );
});
