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
// and charges - and, where it is stated, the geometry of a backbone double
// bond. Drawing-level stereo (wedge/hash on a single bond) remains cosmetic;
// what counts is an explicit stereo:"cis"/"trans" on a double bond, which is how
// cis- and trans-1,4-polyisoprene are told apart. See bondKey below.
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

  // Backbone double-bond geometry. A bond may carry stereo:"cis" (the chain
  // continues on the SAME side of the double bond) or "trans" (opposite sides).
  //
  // Deliberately NOT CIP E/Z, and labelled in the words the field uses so it
  // cannot be mistaken for it. Polymer names always describe where the BACKBONE
  // goes - cis-1,4-polyisoprene, trans-1,4-polychloroprene - and for chloroprene
  // the two disagree, because chlorine outranks carbon and CIP calls the
  // backbone-cis polymer E. Storing the priority answer under the chain's name
  // would print "trans" on the cis structure.
  //
  // Until this existed the model had no stereochemistry at all, so cis- and
  // trans-1,4-polyisoprene were one graph: natural rubber and gutta-percha,
  // an elastomer and a hard resin, indistinguishable to an exact match. The
  // library worked around it by leaving the trans forms undrawn, which made
  // them unfindable instead of wrong.
  //
  // A bond WITHOUT stereo contributes exactly what it did before, so every
  // hash in the library that does not involve geometry is unchanged.
  function bondKey(b, blind) {
    return (blind || !b.stereo) ? String(b.order) : b.order + "/" + b.stereo;
  }

  function wlHash(atoms, bonds, iterations, blind) {
    iterations = iterations || 4;
    var adj = {};
    atoms.forEach(function (a) { adj[a.id] = []; });
    bonds.forEach(function (b) {
      if (!adj[b.a] || !adj[b.b]) return;
      var k = bondKey(b, blind);
      adj[b.a].push({ nb: b.b, key: k });
      adj[b.b].push({ nb: b.a, key: k });
    });
    var labels = {};
    atoms.forEach(function (a) { labels[a.id] = atomLabel(a); });
    for (var it = 0; it < iterations; it++) {
      var newLabels = {};
      atoms.forEach(function (a) {
        var parts = adj[a.id].map(function (e) { return e.key + ":" + labels[e.nb]; }).sort();
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
      if (aS) attach.push({ nb: b.b, order: b.order, stereo: b.stereo });
      else if (bS) attach.push({ nb: b.a, order: b.order, stereo: b.stereo });
      else kept.push({ a: b.a, b: b.b, order: b.order, stereo: b.stereo });
    }
    if (attach.length !== 2) return null;            // floating or over-bonded star
    var outAtoms = [];
    atoms.forEach(function (a) {
      if (!starIds[a.id]) outAtoms.push({ id: a.id, el: a.el, charge: a.charge });
    });
    kept.push({
      a: attach[0].nb,
      b: attach[1].nb,                               // may equal attach[0].nb: self-loop, fine
      order: Math.max(attach[0].order, attach[1].order),
      // A cut straight through a double bond leaves its geometry on the stubs;
      // the closure is that same bond put back, so it has to carry it or the
      // framing would decide whether the polymer looked cis or trans.
      stereo: attach[0].stereo || attach[1].stereo
    });
    return { atoms: outAtoms, bonds: kept };
  }

  // ---- repeat-unit folding -------------------------------------------------
  //
  // Closing the unit makes the hash invariant to WHERE the bracket was drawn,
  // but not to HOW MANY units were enclosed. A chemist may legitimately draw
  // poly(ethylene oxide) as *-CH2CH2O-* or as *-CH2CH2OCH2CH2O-*; both are the
  // same polymer, and before folding they hashed differently, so the second
  // drawing missed a library entry containing the first. Folding reduces a unit
  // to its shortest repeating period before hashing.
  //
  // The period is not trusted on inspection - it is VERIFIED by reconstruction.
  // A candidate period d is accepted only if chaining L/d copies of the
  // extracted fragment reproduces a graph isomorphic to the original. That
  // makes the fold safe on rings, pendants and mixed bond orders without
  // needing to reason about each case: anything that does not rebuild exactly
  // is rejected and the unit is left alone.

  function adjacency(atoms, bonds) {
    var adj = {}, i;
    for (i = 0; i < atoms.length; i++) adj[atoms[i].id] = [];
    for (i = 0; i < bonds.length; i++) {
      var b = bonds[i];
      if (!adj[b.a] || !adj[b.b]) continue;
      adj[b.a].push({ nb: b.b, order: b.order, stereo: b.stereo || null });
      adj[b.b].push({ nb: b.a, order: b.order, stereo: b.stereo || null });
    }
    return adj;
  }

  // The chain of backbone atoms running from one "*" to the other. Shortest
  // path, so a ring in the backbone is traversed the short way round; if that
  // choice is wrong for a periodic unit the reconstruction check rejects it.
  function backbonePath(atoms, bonds) {
    var stars = [], byId = {}, i;
    for (i = 0; i < atoms.length; i++) {
      byId[atoms[i].id] = atoms[i];
      if (atoms[i].el === "*") stars.push(atoms[i].id);
    }
    if (stars.length !== 2) return null;
    var adj = adjacency(atoms, bonds);
    var headBond = adj[stars[0]], tailBond = adj[stars[1]];
    if (!headBond || !tailBond || headBond.length !== 1 || tailBond.length !== 1) return null;
    var start = headBond[0].nb, end = tailBond[0].nb;
    if (byId[start].el === "*" || byId[end].el === "*") return null;

    var prev = {}, seen = {}, queue = [start], qi = 0;
    seen[start] = 1;
    while (qi < queue.length) {
      var cur = queue[qi++];
      if (cur === end) break;
      var nb = adj[cur];
      for (i = 0; i < nb.length; i++) {
        var n = nb[i].nb;
        if (seen[n] || byId[n].el === "*") continue;
        seen[n] = 1; prev[n] = cur; queue.push(n);
      }
    }
    if (!seen[end]) return null;
    var path = [end], walk = end;
    while (walk !== start) { walk = prev[walk]; path.push(walk); }
    path.reverse();
    return {
      path: path, adj: adj, byId: byId,
      headStar: stars[0], tailStar: stars[1],
      headOrder: headBond[0].order, tailOrder: tailBond[0].order,
      // Geometry on a chain-end bond has to survive re-capping, or a reframed
      // or folded copy of a cis polymer hashes as the unspecified one and stops
      // matching the entry it came from.
      headStereo: headBond[0].stereo || null, tailStereo: tailBond[0].stereo || null
    };
  }

  // The set of atoms hanging off one backbone atom: substituents, and rings
  // pendant to the backbone. Returns ATOM IDS only - bonds are collected later
  // from the original bond list, because a traversal records only tree edges
  // and would silently drop the closure bond of any pendant ring (phenyl,
  // pyrrolidone, pyridine), turning a ring into an open chain.
  function pendantIds(rootId, bbSet, byId, adj) {
    var out = [], seen = {}, stack = [rootId];
    seen[rootId] = 1;
    while (stack.length) {
      var cur = stack.pop();
      var nb = adj[cur], i;
      for (i = 0; i < nb.length; i++) {
        var n = nb[i].nb;
        if (byId[n].el === "*") continue;              // never absorb a chain end
        if (n !== rootId && bbSet[n]) continue;        // stop at other backbone atoms
        if (seen[n]) continue;
        seen[n] = 1;
        out.push(n);
        stack.push(n);
      }
    }
    return out;
  }

  // Pull out the first d backbone positions plus their pendants, capped with a
  // "*" at each end, as a candidate shorter repeat unit.
  function extractUnit(info, d, allBonds) {
    var path = info.path, byId = info.byId, adj = info.adj, i, k;
    var bbSet = {};
    for (i = 0; i < path.length; i++) bbSet[path[i]] = 1;

    // 1. atom set: the backbone slice plus everything pendant to it
    var inUnit = {}, outAtoms = [];
    function take(id) {
      if (inUnit[id]) return;
      inUnit[id] = 1;
      outAtoms.push({ id: id, el: byId[id].el, charge: byId[id].charge });
    }
    for (i = 0; i < d; i++) {
      take(path[i]);
      var pend = pendantIds(path[i], bbSet, byId, adj);
      for (k = 0; k < pend.length; k++) take(pend[k]);
    }

    // 2. every original bond with BOTH ends inside the unit. This is what
    //    captures ring-closure bonds that a traversal misses.
    var outBonds = [];
    for (i = 0; i < allBonds.length; i++) {
      var b = allBonds[i];
      if (inUnit[b.a] && inUnit[b.b]) outBonds.push({ a: b.a, b: b.b, order: b.order, stereo: b.stereo });
    }

    // 3. cap: head keeps the original head-star bond; tail takes the order of
    //    the bond that linked this fragment to the next one along the backbone.
    var linkOrder = null, linkStereo = null, nb2 = adj[path[d - 1]], j;
    for (j = 0; j < nb2.length; j++) if (nb2[j].nb === path[d]) { linkOrder = nb2[j].order; linkStereo = nb2[j].stereo || null; break; }
    if (linkOrder == null) return null;
    outAtoms.push({ id: "__h", el: "*" });
    outAtoms.push({ id: "__t", el: "*" });
    outBonds.push({ a: "__h", b: path[0], order: info.headOrder, stereo: info.headStereo });
    outBonds.push({ a: path[d - 1], b: "__t", order: linkOrder, stereo: linkStereo });
    return { atoms: outAtoms, bonds: outBonds, linkOrder: linkOrder };
  }

  // Chain k copies of a unit end to end, re-capping the result. Used only to
  // test a candidate fold against the original.
  function chainCopies(unit, k) {
    var atoms = [], bonds = [], c, i;
    var innerA = unit.atoms.filter(function (a) { return a.el !== "*"; });
    var starIds = {};
    unit.atoms.forEach(function (a) { if (a.el === "*") starIds[a.id] = 1; });
    var headAttach = null, tailAttach = null, headOrd = null, tailOrd = null;
    var headSt = null, tailSt = null;
    unit.bonds.forEach(function (b) {
      if (b.a === "__h") { headAttach = b.b; headOrd = b.order; headSt = b.stereo || null; }
      else if (b.b === "__t") { tailAttach = b.a; tailOrd = b.order; tailSt = b.stereo || null; }
    });
    if (headAttach == null || tailAttach == null) return null;
    var prevTail = null;
    for (c = 0; c < k; c++) {
      var pfx = "c" + c + "_";
      for (i = 0; i < innerA.length; i++) atoms.push({ id: pfx + innerA[i].id, el: innerA[i].el, charge: innerA[i].charge });
      for (i = 0; i < unit.bonds.length; i++) {
        var b = unit.bonds[i];
        if (starIds[b.a] || starIds[b.b]) continue;
        // Geometry has to survive the rebuild. foldRepeatUnit accepts a period
        // only if chaining the extracted unit reproduces the ORIGINAL hash, and
        // that hash now includes double-bond geometry - so dropping stereo here
        // made every stereo-bearing unit fail its own fold check. Drawing two
        // repeat units of cis-polybutadiene folded by 1 instead of 2 and then
        // matched nothing in the library.
        bonds.push({ a: pfx + b.a, b: pfx + b.b, order: b.order, stereo: b.stereo });
      }
      if (prevTail !== null) bonds.push({ a: prevTail, b: pfx + headAttach, order: tailOrd, stereo: tailSt || headSt });
      prevTail = pfx + tailAttach;
    }
    atoms.push({ id: "H", el: "*" }, { id: "T", el: "*" });
    bonds.push({ a: "H", b: "c0_" + headAttach, order: headOrd, stereo: headSt });
    bonds.push({ a: prevTail, b: "T", order: tailOrd, stereo: tailSt });
    return { atoms: atoms, bonds: bonds };
  }

  // Reduce a repeat unit to its shortest repeating period. Returns the original
  // arrays unchanged when no shorter period reconstructs exactly.
  function foldRepeatUnit(atoms, bonds) {
    var info = backbonePath(atoms, bonds);
    if (!info) return { atoms: atoms, bonds: bonds, folded: 1 };
    var L = info.path.length;
    if (L < 2) return { atoms: atoms, bonds: bonds, folded: 1 };
    var target = wlHash(atoms, bonds);
    var d;
    for (d = 1; d < L; d++) {
      if (L % d !== 0) continue;
      var unit = extractUnit(info, d, bonds);
      if (!unit) continue;
      var rebuilt = chainCopies(unit, L / d);
      if (!rebuilt) continue;
      if (wlHash(rebuilt.atoms, rebuilt.bonds) === target) {
        return { atoms: unit.atoms, bonds: unit.bonds, folded: L / d };
      }
    }
    return { atoms: atoms, bonds: bonds, folded: 1 };
  }

  // The framing-invariant exact-match key: fold to the shortest period, then
  // hash the closed graph. Null when the unit can't be closed (callers fall
  // back to wlHash of the open graph, preserving behavior for malformed input).
  function closedHash(atoms, bonds, blind) {
    var reduced = foldRepeatUnit(atoms, bonds);
    var closed = closeRepeatUnit(reduced.atoms, reduced.bonds);
    return closed ? wlHash(closed.atoms, closed.bonds, 4, blind) : null;
  }

  // The same identity with geometry ignored. A drawing that leaves a backbone
  // double bond unspecified is not wrong, it is unspecific: the honest answer
  // is every polymer whose skeleton matches, with a note that geometry would
  // separate them. Matching that needs an identity both forms share.
  function blindHash(atoms, bonds) { return closedHash(atoms, bonds, true); }

  // Does this unit have a backbone double bond whose geometry was never stated?
  // That is the trigger for answering stereo-blind and saying so.
  function hasUnsetStereo(atoms, bonds) {
    var byId = {};
    atoms.forEach(function (a) { byId[a.id] = a; });
    for (var i = 0; i < bonds.length; i++) {
      var b = bonds[i];
      if (b.order !== 2 || b.stereo) continue;
      var x = byId[b.a], y = byId[b.b];
      if (!x || !y || x.el !== "C" || y.el !== "C") continue;
      // A double bond inside a ring cannot be cis/trans in the sense meant
      // here, and an aromatic ring is full of them.
      if (inSameRing(atoms, bonds, b)) continue;
      return true;
    }
    return false;
  }

  function inSameRing(atoms, bonds, bond) {
    // Reachable from a to b without using this bond => the bond closes a ring.
    var adj = {};
    atoms.forEach(function (a) { adj[a.id] = []; });
    bonds.forEach(function (b) {
      if (b === bond) return;
      if (!adj[b.a] || !adj[b.b]) return;
      adj[b.a].push(b.b); adj[b.b].push(b.a);
    });
    var seen = {}, stack = [bond.a];
    seen[bond.a] = 1;
    while (stack.length) {
      var cur = stack.pop();
      if (cur === bond.b) return true;
      (adj[cur] || []).forEach(function (n) { if (!seen[n]) { seen[n] = 1; stack.push(n); } });
    }
    return false;
  }

  // ---- canonical PSMILES support ------------------------------------------
  //
  // PSMILES writes a repeat unit as SMILES with two "*" wildcards marking where
  // the chain continues: [*]CCO[*] is poly(ethylene oxide). One polymer has many
  // valid PSMILES because the bracket can be cut at any backbone bond, so a
  // canonical form is needed before the string can be used as an identity.
  //
  // The published recipe is: fold to the shortest unit, cyclize, canonicalize
  // the ring, then break the closure bond back open. Step 4 is the awkward one -
  // after a canonicalizer reorders atoms, the bond you closed is no longer
  // trivially identifiable, and guessing wrong silently emits a valid-looking
  // string for a different polymer.
  //
  // This sidesteps it. Rather than cut one bond and hope, enumerate EVERY legal
  // framing (there are exactly L, one per backbone bond), hand each to the
  // canonicalizer, and let the caller take the lexicographically smallest
  // string. Any starting frame produces the same set, so the minimum is the same
  // from any drawing - which is the property a canonical form has to have. The
  // cost is L canonicalization calls, and L is a handful for any real unit.
  //
  // Only BACKBONE bonds are cut. Cutting a bond in a pendant ring would move the
  // chain ends onto the phenyl of polystyrene and describe a different polymer
  // entirely, so the rotation is restricted to the backbone cycle.
  function repeatUnitFramings(atoms, bonds) {
    var reduced = foldRepeatUnit(atoms, bonds);
    var info = backbonePath(reduced.atoms, reduced.bonds);
    if (!info) return null;
    var path = info.path, L = path.length, i, j;
    var byId = info.byId;

    // core = everything except the two chain-end stars
    var starSet = {};
    starSet[info.headStar] = 1; starSet[info.tailStar] = 1;
    var coreAtoms = [], coreBonds = [];
    for (i = 0; i < reduced.atoms.length; i++) {
      if (!starSet[reduced.atoms[i].id]) coreAtoms.push(reduced.atoms[i]);
    }
    for (i = 0; i < reduced.bonds.length; i++) {
      var b = reduced.bonds[i];
      if (!starSet[b.a] && !starSet[b.b]) coreBonds.push(b);
    }
    // Close the backbone into a cycle, exactly as closeRepeatUnit does - and
    // note that this can create a PARALLEL edge. In any vinyl unit (*-CH2-CH2-*)
    // the two attachment atoms are already bonded, so the cycle carries two
    // distinct edges between the same pair. Cutting has to target one specific
    // edge, so the cycle is indexed by POSITION in the bond list rather than by
    // endpoints; matching on endpoints removes both and disconnects the unit.
    var cyclic = coreBonds.map(function (b) { return { a: b.a, b: b.b, order: b.order, stereo: b.stereo || null }; });

    // Is edge `skip` a bridge of the core graph? If its two ends stay connected
    // without it, it lies in a ring and must NOT be cut. Restricting to the
    // backbone path is not enough on its own: in PET or polycarbonate the
    // backbone runs THROUGH an aromatic ring, so some backbone bonds are ring
    // bonds, and cutting one tears benzene open and emits a star double-bonded
    // to a carbon - a different compound wearing the right atom count.
    function stillConnected(skip) {
      var u = cyclic[skip].a, v = cyclic[skip].b, adj2 = {}, k;
      for (k = 0; k < coreAtoms.length; k++) adj2[coreAtoms[k].id] = [];
      for (k = 0; k < cyclic.length; k++) {
        if (k === skip) continue;
        if (!adj2[cyclic[k].a] || !adj2[cyclic[k].b]) continue;
        adj2[cyclic[k].a].push(cyclic[k].b);
        adj2[cyclic[k].b].push(cyclic[k].a);
      }
      var seen2 = {}, stack = [u];
      seen2[u] = 1;
      while (stack.length) {
        var cur = stack.pop();
        if (cur === v) return true;
        var nb2 = adj2[cur] || [];
        for (k = 0; k < nb2.length; k++) if (!seen2[nb2[k]]) { seen2[nb2[k]] = 1; stack.push(nb2[k]); }
      }
      return false;
    }

    var ringIdx = [], used = {};
    for (i = 0; i + 1 < L; i++) {
      var found = -1;
      for (j = 0; j < cyclic.length; j++) {
        if (used[j]) continue;
        if ((cyclic[j].a === path[i] && cyclic[j].b === path[i + 1]) ||
            (cyclic[j].a === path[i + 1] && cyclic[j].b === path[i])) { found = j; break; }
      }
      if (found === -1) return null;
      used[found] = 1;
      // Cuttable only if it is a bridge (not a ring bond) AND a single bond.
      // PSMILES attachment points are single bonds by convention, and cutting a
      // backbone C=C emits "[*]=C..." - which is not just unconventional, it
      // WINS the lexicographic minimum, because "=" (0x3D) sorts below "C"
      // (0x43). One double bond in the backbone would otherwise hijack the
      // canonical form of every diene rubber in the library.
      if (cyclic[found].order === 1 && !stillConnected(found)) ringIdx.push(found);
    }
    var closeOrder = Math.max(info.headOrder, info.tailOrder);
    cyclic.push({ a: path[L - 1], b: path[0], order: closeOrder, stereo: info.headStereo || info.tailStereo });
    // The closure is where the unit was actually drawn, so it is always legal -
    // but prefer single-bond framings when any exist.
    if (closeOrder === 1 || !ringIdx.length) ringIdx.push(cyclic.length - 1);

    // one framing per backbone bond: drop that edge, cap both loose ends with "*"
    var out = [];
    for (i = 0; i < ringIdx.length; i++) {
      var cutAt = ringIdx[i], cut = cyclic[cutAt];
      var fAtoms = coreAtoms.map(function (a) { return { id: a.id, el: a.el, charge: a.charge }; });
      var fBonds = [];
      for (j = 0; j < cyclic.length; j++) {
        if (j === cutAt) continue;
        fBonds.push({ a: cyclic[j].a, b: cyclic[j].b, order: cyclic[j].order, stereo: cyclic[j].stereo });
      }
      fAtoms.push({ id: "__s0", el: "*" }, { id: "__s1", el: "*" });
      fBonds.push({ a: "__s0", b: cut.b, order: cut.order, stereo: cut.stereo });
      fBonds.push({ a: cut.a, b: "__s1", order: cut.order, stereo: cut.stereo });
      out.push({ atoms: fAtoms, bonds: fBonds });
    }
    return out;
  }

  // ---- valence ------------------------------------------------------------
  //
  // Generous max valence per element (bond-order sum), with slack for formal
  // charge. The purpose is to catch obvious mistakes - a typo'd bond, a
  // fourth substituent on an oxygen - not to referee real edge-case
  // chemistry, so this errs high. Lives here rather than in the CI checker
  // because the editor needs the same answer while you draw: a structure that
  // would fail the data check should look wrong on the canvas immediately,
  // not at search time with a message that names no atom.
  var MAX_VALENCE = {
    H: 1, C: 4, N: 3, O: 2, F: 1, Cl: 1, Br: 1, I: 1,
    S: 6, P: 5, Si: 4, B: 3, Sn: 4
  };

  // Ids of atoms carrying more bonding than the element allows. Unrecognized
  // labels return no opinion at all: "*" chain ends, and the editor's
  // condensed superatom vertices (NO2, Ph, tBu), are not elements and their
  // valence is not this function's to judge.
  function overValentAtoms(atoms, bonds) {
    var sum = {}, byId = {};
    atoms.forEach(function (a) { sum[a.id] = 0; byId[a.id] = a; });
    bonds.forEach(function (b) {
      if (sum[b.a] === undefined || sum[b.b] === undefined) return;
      sum[b.a] += b.order || 0;
      sum[b.b] += b.order || 0;
    });
    var bad = [];
    atoms.forEach(function (a) {
      if (a.el === "*") return;
      var max = MAX_VALENCE[a.el];
      if (max === undefined) return;
      if ((sum[a.id] || 0) > max + Math.abs(a.charge || 0)) bad.push(a.id);
    });
    return bad;
  }

  // ---- monomer recovery ---------------------------------------------------
  //
  // Addition and ring-opening polymerisation are isomerisations: the repeat
  // unit is the monomer with one bond moved. That move is reversible, but only
  // if you know WHICH move it was - and the entry's mechanism class says. So
  // the rule is chosen by declared class, never inferred from the shape of the
  // graph, and a class with no defined reverse yields nothing at all.
  //
  // Every derived monomer is checked by ROUND TRIP: re-apply the forward
  // transform and require the original hash back. A monomer that does not
  // rebuild its own polymer is not returned. That is what makes this safe to
  // put on a page - the alternative, printing a plausible-looking monomer,
  // would be a chemistry claim nobody verified.
  //
  // Step-growth is absent on purpose: a polyester repeat unit came from a diol
  // AND a diacid, and one unit cannot say which pair. Silicones and
  // polyoxymethylene are refused too - closing their unit gives a two-membered
  // ring, when the real monomers are cyclic oligomers (D4, trioxane).
  function starAttachments(atoms, bonds) {
    var stars = {}, n = 0;
    atoms.forEach(function (a) { if (a.el === "*") { stars[a.id] = 1; n++; } });
    if (n !== 2) return null;
    var attach = [];
    for (var i = 0; i < bonds.length; i++) {
      var b = bonds[i], aS = !!stars[b.a], bS = !!stars[b.b];
      if (aS && bS) return null;
      if (aS) attach.push({ at: b.b, order: b.order });
      else if (bS) attach.push({ at: b.a, order: b.order });
    }
    return attach.length === 2 ? { stars: stars, attach: attach } : null;
  }
  function coreOf(atoms, bonds) {
    var stars = {};
    atoms.forEach(function (a) { if (a.el === "*") stars[a.id] = 1; });
    return {
      atoms: atoms.filter(function (a) { return !stars[a.id]; })
                  .map(function (a) { return { id: a.id, el: a.el, charge: a.charge }; }),
      bonds: bonds.filter(function (b) { return !stars[b.a] && !stars[b.b]; })
                  .map(function (b) { return { a: b.a, b: b.b, order: b.order, stereo: b.stereo }; })
    };
  }
  function findBond(list, x, y) {
    for (var i = 0; i < list.length; i++) {
      if ((list[i].a === x && list[i].b === y) || (list[i].a === y && list[i].b === x)) return list[i];
    }
    return null;
  }
  function pathBetween(graph, from, to) {
    var adj = {};
    graph.atoms.forEach(function (a) { adj[a.id] = []; });
    graph.bonds.forEach(function (b) { if (adj[b.a] && adj[b.b]) { adj[b.a].push(b.b); adj[b.b].push(b.a); } });
    var prev = {}, seen = {}, queue = [from];
    seen[from] = 1;
    while (queue.length) {
      var c = queue.shift();
      for (var i = 0; i < adj[c].length; i++) {
        var nb = adj[c][i];
        if (seen[nb]) continue;
        seen[nb] = 1; prev[nb] = c; queue.push(nb);
      }
    }
    if (!seen[to]) return null;
    var path = [to], w = to;
    while (w !== from) { w = prev[w]; path.push(w); }
    return path.reverse();
  }

  // vinyl / acrylate / methacrylate: the two attachment carbons were the alkene
  function monomerVinyl(atoms, bonds) {
    var info = starAttachments(atoms, bonds);
    if (!info) return null;
    var byId = {};
    atoms.forEach(function (a) { byId[a.id] = a; });
    var p = info.attach[0], q = info.attach[1];
    if (!byId[p.at] || !byId[q.at] || byId[p.at].el !== "C" || byId[q.at].el !== "C") return null;
    var link = findBond(bonds, p.at, q.at);
    if (!link || link.order !== 1) return null;
    // The alkene of a vinyl monomer is never a RING bond, so if the chain
    // attaches at two atoms that are already in a ring together, this was not
    // vinyl addition. Poly(anthracene) is filed under "Addition (vinyl)" and
    // is really made by oxidative coupling: turning its ring bond into an
    // alkene produced C14H8, two hydrogens short of anthracene, and drew a
    // monomer that does not exist.
    if (inSameRing(atoms, bonds, link)) return null;
    var m = coreOf(atoms, bonds);
    var lb = findBond(m.bonds, p.at, q.at);
    if (!lb) return null;
    lb.order = 2;
    // The reaction centre: the bond that differs between monomer and polymer.
    // It was already known here - the whole rule is "change this bond" - and
    // was simply being thrown away.
    m.centre = [[p.at, q.at]];
    return m;
  }
  // conjugated diene, 1,4-addition: *-CH2-CH=CH-CH2-* came from CH2=CH-CH=CH2
  function monomerDiene(atoms, bonds) {
    var info = starAttachments(atoms, bonds);
    if (!info) return null;
    var p = info.attach[0], q = info.attach[1];
    if (findBond(bonds, p.at, q.at)) return null;
    var m = coreOf(atoms, bonds);
    var path = pathBetween(m, p.at, q.at);
    if (!path || path.length !== 4) return null;
    var byId = {};
    m.atoms.forEach(function (a) { byId[a.id] = a; });
    for (var i = 0; i < 4; i++) if (!byId[path[i]] || byId[path[i]].el !== "C") return null;
    var b01 = findBond(m.bonds, path[0], path[1]),
        b12 = findBond(m.bonds, path[1], path[2]),
        b23 = findBond(m.bonds, path[2], path[3]);
    if (!b01 || !b12 || !b23 || b12.order !== 2) return null;
    b01.order = 2; b12.order = 1; b23.order = 2;
    m.centre = [[path[0], path[1]], [path[1], path[2]], [path[2], path[3]]];
    // The monomer has no backbone geometry. cis- and trans-1,4-polybutadiene
    // come from the SAME butadiene; which one you get is the catalyst's doing,
    // not the monomer's. So the geometry is dropped here, and the round-trip
    // check for dienes compares stereo-blind for exactly that reason.
    b12.stereo = undefined;
    return m;
  }
  // lactam / lactone / carbonate / epoxide: the ring closes back up.
  //
  // minRing is a floor on the size of the ring that reforms. It exists because
  // closing the unit is only the reverse of the polymerisation when the ring
  // that opens is the ring that closes - and for two whole families it is not:
  //
  //   - N-carboxyanhydrides expel CO2 as they polymerise, so a polypeptide
  //     repeat unit closes to a 3-membered alpha-lactam, not to the 5-membered
  //     NCA that was actually used. Poly(L-leucine) came out as C6H11NO when
  //     leucine NCA is C7H11NO3, a whole CO2 adrift.
  //   - 2-oxazolines rearrange: the 5-ring oxazoline becomes an amide-linked
  //     backbone, which closes to a 3-membered acetylaziridine. Same molecular
  //     formula as the real monomer, so a formula check waves it through -
  //     a different compound entirely.
  //
  // Epoxides legitimately give 3-rings, so the floor is applied per class
  // rather than globally.
  function monomerRingOpen(atoms, bonds, minRing) {
    var closed = closeRepeatUnit(atoms, bonds);
    if (!closed) return null;
    var seen = {};
    for (var i = 0; i < closed.bonds.length; i++) {
      var b = closed.bonds[i];
      if (b.a === b.b) return null;                 // self-loop: not a ring
      var k = [b.a, b.b].sort().join("|");
      if (seen[k]) return null;                     // two-membered ring
      seen[k] = 1;
    }
    if (minRing) {
      // The reformed ring is the shortest path between the two attachment
      // atoms in the open unit, plus the bond that closes it.
      var info = starAttachments(atoms, bonds);
      if (!info) return null;
      var core = coreOf(atoms, bonds);
      var path = pathBetween(core, info.attach[0].at, info.attach[1].at);
      if (!path || path.length < minRing) return null;
    }
    // The bond the ring reforms across is exactly the one that broke on
    // opening - the reaction centre, free of charge.
    var att = starAttachments(atoms, bonds);
    if (att) closed.centre = [[att.attach[0].at, att.attach[1].at]];
    return closed;
  }
  function monomerLactam(atoms, bonds) { return monomerRingOpen(atoms, bonds, 5); }

  // Coupling: the monomer is the repeat unit with its two chain ends capped.
  // Oxidative and cross-coupling polymerisations join ring to ring, losing two
  // hydrogens (FeCl3, oxidative) or two halides (Suzuki, Stille, Yamamoto), so
  // reversing one is simply removing the two attachment points - the implicit
  // hydrogen returns on its own. Thiophene-2,5-diyl becomes thiophene.
  //
  // No reaction centre is reported. For a vinyl polymer the centre is the bond
  // that was the alkene; here the two attachment atoms are not bonded to each
  // other at all, so there is no bond to highlight and claiming one would point
  // at the wrong place.
  function monomerCoupling(atoms, bonds) {
    var info = starAttachments(atoms, bonds);
    if (!info) return null;
    var m = coreOf(atoms, bonds);
    if (!m || !m.atoms.length) return null;
    return { atoms: m.atoms, bonds: m.bonds };
  }

  // Alkyne addition is the vinyl rule one bond order up: the repeat unit's
  // backbone C=C was a C#C in the monomer, just as a vinyl unit's C-C was a
  // C=C. Polyacetylene is -CH=CH- and comes from HC#CH.
  function monomerAlkyne(atoms, bonds) {
    var info = starAttachments(atoms, bonds);
    if (!info) return null;
    var byId = {};
    atoms.forEach(function (a) { byId[a.id] = a; });
    var p = info.attach[0], q = info.attach[1];
    if (!byId[p.at] || !byId[q.at] || byId[p.at].el !== "C" || byId[q.at].el !== "C") return null;
    var link = findBond(bonds, p.at, q.at);
    if (!link || link.order !== 2) return null;
    if (inSameRing(atoms, bonds, link)) return null;
    var m = coreOf(atoms, bonds);
    if (!m) return null;
    var lb = findBond(m.bonds, p.at, q.at);
    if (!lb) return null;
    lb.order = 3;
    lb.stereo = undefined;
    return { atoms: m.atoms, bonds: m.bonds, centre: [[p.at, q.at]] };
  }

  var MONOMER_RULES = {
    "Addition (vinyl)": { back: monomerVinyl, kind: "vinyl" },
    "Addition (acrylate)": { back: monomerVinyl, kind: "vinyl" },
    "Addition (methacrylate)": { back: monomerVinyl, kind: "vinyl" },
    "Addition (diene)": { back: monomerDiene, kind: "diene" },
    "Ring-opening": { back: monomerRingOpen, kind: "ring" },
    "Ring-opening (polyamide)": { back: monomerLactam, kind: "ring" },
    "Ring-opening (silicone)": { back: monomerRingOpen, kind: "ring" },
    "Step-growth (coupling)": { back: monomerCoupling, kind: "coupling" },
    "Addition (alkyne)": { back: monomerAlkyne, kind: "alkyne" }
  };

  // Forward transforms, used only to verify the reverse.
  function forwardAlkyne(m, info) {
    var p = info.attach[0], q = info.attach[1];
    var out = { atoms: m.atoms.slice(), bonds: m.bonds.map(function (b) { return { a: b.a, b: b.b, order: b.order, stereo: b.stereo }; }) };
    var lb = findBond(out.bonds, p.at, q.at);
    if (!lb || lb.order !== 3) return null;
    lb.order = 2;
    out.atoms = out.atoms.concat([{ id: "__m0", el: "*" }, { id: "__m1", el: "*" }]);
    out.bonds.push({ a: "__m0", b: p.at, order: p.order }, { a: q.at, b: "__m1", order: q.order });
    return out;
  }
  function forwardCoupling(m, info) {
    var p = info.attach[0], q = info.attach[1];
    var out = { atoms: m.atoms.slice(), bonds: m.bonds.map(function (b) { return { a: b.a, b: b.b, order: b.order, stereo: b.stereo }; }) };
    out.atoms = out.atoms.concat([{ id: "__m0", el: "*" }, { id: "__m1", el: "*" }]);
    out.bonds.push({ a: "__m0", b: p.at, order: p.order }, { a: q.at, b: "__m1", order: q.order });
    return out;
  }
  function forwardVinyl(m, info) {
    var p = info.attach[0], q = info.attach[1];
    var out = { atoms: m.atoms.slice(), bonds: m.bonds.map(function (b) { return { a: b.a, b: b.b, order: b.order, stereo: b.stereo }; }) };
    var lb = findBond(out.bonds, p.at, q.at);
    if (!lb) return null;
    lb.order = 1;
    out.atoms = out.atoms.concat([{ id: "__m0", el: "*" }, { id: "__m1", el: "*" }]);
    out.bonds.push({ a: "__m0", b: p.at, order: p.order }, { a: q.at, b: "__m1", order: q.order });
    return out;
  }
  function forwardDiene(m, info) {
    var p = info.attach[0], q = info.attach[1];
    var out = { atoms: m.atoms.slice(), bonds: m.bonds.map(function (b) { return { a: b.a, b: b.b, order: b.order, stereo: b.stereo }; }) };
    var path = pathBetween(m, p.at, q.at);
    if (!path || path.length !== 4) return null;
    var b01 = findBond(out.bonds, path[0], path[1]),
        b12 = findBond(out.bonds, path[1], path[2]),
        b23 = findBond(out.bonds, path[2], path[3]);
    if (!b01 || !b12 || !b23) return null;
    b01.order = 1; b12.order = 2; b23.order = 1;
    out.atoms = out.atoms.concat([{ id: "__m0", el: "*" }, { id: "__m1", el: "*" }]);
    out.bonds.push({ a: "__m0", b: p.at, order: p.order }, { a: q.at, b: "__m1", order: q.order });
    return out;
  }
  function forwardRingOpen(m, info) {
    var p = info.attach[0], q = info.attach[1];
    var out = {
      atoms: m.atoms.concat([{ id: "__m0", el: "*" }, { id: "__m1", el: "*" }]),
      bonds: m.bonds.filter(function (b) {
        return !((b.a === p.at && b.b === q.at) || (b.a === q.at && b.b === p.at));
      }).map(function (b) { return { a: b.a, b: b.b, order: b.order, stereo: b.stereo }; })
    };
    out.bonds.push({ a: "__m0", b: p.at, order: p.order }, { a: q.at, b: "__m1", order: q.order });
    return out;
  }
  var MONOMER_FORWARD = { vinyl: forwardVinyl, diene: forwardDiene, ring: forwardRingOpen, coupling: forwardCoupling, alkyne: forwardAlkyne };

  // Returns { atoms, bonds, kind } for the monomer, or null when the class has
  // no defined reverse, the pattern does not match, or the round trip fails.
  function deriveMonomer(atoms, bonds, cls) {
    var rule = MONOMER_RULES[cls];
    if (!rule) return null;
    var info = starAttachments(atoms, bonds);
    if (!info) return null;
    var m;
    try { m = rule.back(atoms, bonds); } catch (e) { return null; }
    if (!m) return null;
    var fwd = MONOMER_FORWARD[rule.kind];
    var rebuilt;
    try { rebuilt = fwd(m, info); } catch (e2) { return null; }
    if (!rebuilt) return null;
    // Dienes compare stereo-blind: the geometry is the catalyst's, not the
    // monomer's, so a correct monomer cannot reproduce it.
    var blind = rule.kind === "diene";
    var h1 = blind ? blindHash(atoms, bonds) : closedHash(atoms, bonds);
    var h2 = blind ? blindHash(rebuilt.atoms, rebuilt.bonds) : closedHash(rebuilt.atoms, rebuilt.bonds);
    if (h1 == null || h1 !== h2) return null;
    return { atoms: m.atoms, bonds: m.bonds, kind: rule.kind, centre: m.centre || [] };
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

  return { wlHash: wlHash, closeRepeatUnit: closeRepeatUnit, closedHash: closedHash, blindHash: blindHash, hasUnsetStereo: hasUnsetStereo, inSameRing: inSameRing, foldRepeatUnit: foldRepeatUnit, chainCopies: chainCopies, MAX_VALENCE: MAX_VALENCE, overValentAtoms: overValentAtoms, deriveMonomer: deriveMonomer, repeatUnitFramings: repeatUnitFramings, elementProfile: elementProfile, profileDistance: profileDistance };
});
