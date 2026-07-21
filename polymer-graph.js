// Weisfeiler-Leman style structure fingerprint for polymer repeat units.
//
// Single source of truth, shared by three consumers that previously each
// carried their own copy:
//   - the browser (polymer-search.js) for live structure search,
//   - the CI data check (scripts/check-polymer-data.js),
//   - the build-time search-index generator (scripts/build-search-index.js).
//
// It is deliberately DOM-free and dependency-free so the exact same code runs
// in the browser and in Node. Because the algorithm is identical everywhere,
// a hash precomputed at build time is guaranteed to equal the one the browser
// would compute at runtime, which is what lets the index be trusted.
//
// Every atom gets a label seeded by its element (and formal charge, if any),
// then repeatedly refined from its neighbors' labels. After a few rounds the
// sorted label multiset is a fingerprint identical for isomorphic graphs, so
// two repeat units hash the same only if they share connectivity, elements,
// and charges. Bond stereo (wedge/hash) is cosmetic and never affects it.
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();          // Node / CommonJS (CI + build scripts)
  } else {
    root.PolymerGraph = factory();       // browser global
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function fnv1a(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return h.toString(16);
  }

  function atomLabel(a) {
    var chargeSuffix = a.charge ? (a.charge > 0 ? "+" : "") + a.charge : "";
    return a.el + chargeSuffix;
  }

  function wlHash(atoms, bonds, iterations) {
    iterations = iterations || 4;
    var adj = {};
    atoms.forEach(function (a) { adj[a.id] = []; });
    bonds.forEach(function (b) {
      if (!adj[b.a] || !adj[b.b]) return;
      adj[b.a].push({ nb: b.b, order: b.order });
      adj[b.b].push({ nb: b.a, order: b.order });
    });
    var labels = {};
    atoms.forEach(function (a) { labels[a.id] = atomLabel(a); });
    for (var it = 0; it < iterations; it++) {
      var newLabels = {};
      atoms.forEach(function (a) {
        var parts = adj[a.id].map(function (e) { return e.order + ":" + labels[e.nb]; }).sort();
        newLabels[a.id] = fnv1a(labels[a.id] + "|" + parts.join(","));
      });
      labels = newLabels;
    }
    var finalLabels = atoms.map(function (a) { return labels[a.id]; }).sort();
    return fnv1a(finalLabels.join("|") + "#" + bonds.length);
  }

  function elementProfile(atoms) {
    var p = {};
    atoms.forEach(function (a) { if (a.el !== "*") p[a.el] = (p[a.el] || 0) + 1; });
    return p;
  }

  function profileDistance(p1, p2) {
    var keys = {};
    Object.keys(p1).forEach(function (k) { keys[k] = 1; });
    Object.keys(p2).forEach(function (k) { keys[k] = 1; });
    var d = 0;
    Object.keys(keys).forEach(function (k) { d += Math.abs((p1[k] || 0) - (p2[k] || 0)); });
    return d;
  }

  return { wlHash: wlHash, elementProfile: elementProfile, profileDistance: profileDistance };
});
