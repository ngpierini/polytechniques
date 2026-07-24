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

  // Canonicalize a linear repeat unit by contracting it to its cyclic
  // quotient: delete the two "*" chain ends and bond the atoms they hung off.
  // The closed graph depends only on the polymer, not on where the bracket was
  // drawn, so hashing it makes exact matching framing-invariant - the same
  // polyester cut at the ester or mid-chain hashes identically. When the two
  // attachment atoms are already bonded (every vinyl unit, *-CH2-CH2-*) the
  // closure deliberately ADDS a parallel edge rather than bumping the existing
  // bond's order: wlHash counts bonds, so the doubled edge keeps polyethylene
  // distinct from polyacetylene, while merging into the order would conflate
  // a closure with a pi bond (a cyclohexylene backbone would hash equal to an
  // unsaturated open chain). The closure order is the max of the two stub-bond
  // orders so a cut through a double bond (*=CH-CH=* vs *-CH=CH-*) still lands
  // on the same closed graph. Returns null when the input isn't a well-formed
  // two-ended linear unit; callers then fall back to the open-graph hash.
  function closeRepeatUnit(atoms, bonds) {
    var starIds = {};
    var starCount = 0;
    atoms.forEach(function (a) {
      if (a.el === "*") { starIds[a.id] = 1; starCount++; }
    });
    if (starCount !== 2) return null;
    var kept = [], attach = [];
    for (var i = 0; i < bonds.length; i++) {
      var b = bonds[i], aS = !!starIds[b.a], bS = !!starIds[b.b];
      if (aS && bS) return null;                     // star-star bond: malformed
      if (aS) attach.push({ nb: b.b, order: b.order });
      else if (bS) attach.push({ nb: b.a, order: b.order });
      else kept.push({ a: b.a, b: b.b, order: b.order });
    }
    if (attach.length !== 2) return null;            // floating or over-bonded star
    var outAtoms = [];
    atoms.forEach(function (a) {
      if (!starIds[a.id]) outAtoms.push({ id: a.id, el: a.el, charge: a.charge });
    });
    kept.push({
      a: attach[0].nb,
      b: attach[1].nb,                               // may equal attach[0].nb: self-loop, fine
      order: Math.max(attach[0].order, attach[1].order)
    });
    return { atoms: outAtoms, bonds: kept };
  }

  // The framing-invariant exact-match key: hash of the closed graph, or null
  // when the unit can't be closed (callers fall back to wlHash of the open
  // graph, which preserves today's behavior for malformed input).
  function closedHash(atoms, bonds) {
    var closed = closeRepeatUnit(atoms, bonds);
    return closed ? wlHash(closed.atoms, closed.bonds) : null;
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

  return { wlHash: wlHash, closeRepeatUnit: closeRepeatUnit, closedHash: closedHash, elementProfile: elementProfile, profileDistance: profileDistance };
});
