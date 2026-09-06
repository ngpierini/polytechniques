// Minimal offline cache for the static PolyTechniques site.
// Pages are network-first with a cache fallback (their URLs carry no ?v=, so
// a cache hit would pin the whole deploy); every other same-origin asset is
// cache-first with a forced-network revalidation behind it. It is served from
// cache for speed, but the cached copy is NOT assumed correct just because the
// URL is versioned - see the fetch handler for the deploy window that makes
// that assumption fail, permanently.
// Either way the calculators still work with no connection. Bump CACHE_NAME
// whenever the pre-cache list below changes so old clients pick up the new
// set instead of serving stale files.
const CACHE_NAME = "polytechniques-v289";

const PRECACHE_URLS = [
  "index.html",
  "calculator.html",
  "polymer-search.html",
  "tg-predictor.html",
  "gpc-calibration.html",
  "copolymer-composition.html",
  "dispersity-predictor.html",
  "recipe-scaling.html",
  "mechanisms.html",
  "gpc-peak-interpretation.html",
  "thermal-analysis.html",
  "chain-dimensions.html",
  "crosslink-density.html",
  "radical-kinetics.html",
  "air-free-technique.html",
  "conversion-monitoring.html",
  "glossary.html",
  "polymer-families.html",
  "structure-map.js?v=2",
  "acrylate-polymers.html",
  "methacrylate-polymers.html",
  "silicone-polymers.html",
  "vinyl-polymers.html",
  "diene-elastomers.html",
  "polyesters.html",
  "polyamides.html",
  "ring-opening-polymers.html",
  "conjugated-polymers.html",
  "block-copolymers.html",
  "bottlebrush-polymers.html",
  "polymer-chain-game.html",
  "founder.html",
  "whats-new.html",
  "diagnostics.html",
  "terms.html",
  "privacy.html",
  "404.html",
  "style.css",
  "theme.js?v=1",
  "nav.js?v=26",
  "polymer-calc-core.js?v=1",
  "polymer-data.js",
  "polymer-xref.js?v=3",
  "monomer-data.js?v=4",
  "lab-scene.js?v=9",
  "polymer-graph.js?v=16",
  "bracket-geometry.js?v=1",
  "superatoms.js?v=1",
  "ocr-decoders.js?v=1",
  "polymer-search.js",
  "thermal-library.js?v=13",
  "chain-data.js?v=1",
  "search-index.json",
  "favicon.svg",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png"
];

// Cloudflare Pages 308-redirects "calculator.html" to "calculator", so a plain addAll
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
        // `cache: "reload"` is load-bearing, not a precaution. PRECACHE_URLS
        // lists these files WITHOUT their ?v=, and _headers gives them
        // `immutable, max-age=31536000` by path - so a plain fetch() here is
        // answered from the browser's own year-long HTTP cache and a brand new
        // CACHE_NAME gets filled with old bytes. Bumping the version then does
        // nothing at all, which is exactly what it did: verified live with
        // cache "polytechniques-v289" already installed and still serving a
        // polymer-data.js that predated the deploy. This forces the network.
        return fetch(new Request(u, { cache: "reload" })).then(function (res) {
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
            return cached || caches.match("index.html");
          });
        })
    );
    return;
  }

  // Everything else is versioned in its URL, so a cache hit is served
  // immediately - but it is NOT "by definition the right file", which is what
  // this used to assume. A deploy is not atomic from the browser's side: for a
  // few seconds the edge serves the new HTML, which asks for polymer-data.js
  // ?v=34, while that URL still returns the previous file. _headers marks it
  // `immutable, max-age=31536000`, so a visitor who lands in that window pins
  // the wrong bytes under the right URL for a year, and the version can never
  // be bumped again to dislodge it. Observed exactly that on this site: the
  // cache held polymer-data.js?v=34 at 718315 bytes while the network had
  // 719883.
  //
  // So: still cache-first for speed, but always revalidate from the network
  // with `cache: "reload"` (bypassing the browser's own pinned copy) and
  // overwrite. A bad pin then costs one stale load instead of a year.
  event.respondWith(
    caches.match(req).then(function (cached) {
      var network = fetch(new Request(req.url, { cache: "reload", credentials: "same-origin" }))
        .then(function (res) { return cachePut(req, res); })
        .catch(function () { return cached; });
      return cached || network;
    })
  );
});
