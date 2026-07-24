(function () {
  "use strict";

  // ---------- Graph hashing (Weisfeiler-Leman style structure fingerprint) ----------
  // Every atom gets a label seeded by its element (and formal charge, if any),
  // then repeatedly refined using its neighbors' labels. After a few rounds the
  // sorted label multiset is a fingerprint that is identical for isomorphic
  // graphs, so two repeat units hash the same only if they have the same
  // connectivity, elements, and charges. Bond stereo (wedge/hash) is cosmetic
  // only and never affects the hash.
  function fnv1a(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return h.toString(16);
  }

  function atomLabel(a) {
    var chargeSuffix = a.charge ? (a.charge > 0 ? '+' : '') + a.charge : '';
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
        var parts = adj[a.id].map(function (e) { return e.order + ':' + labels[e.nb]; }).sort();
        newLabels[a.id] = fnv1a(labels[a.id] + '|' + parts.join(','));
      });
      labels = newLabels;
    }
    var finalLabels = atoms.map(function (a) { return labels[a.id]; }).sort();
    return fnv1a(finalLabels.join('|') + '#' + bonds.length);
  }

  // Canonicalize a linear repeat unit by contracting it to its cyclic
  // quotient: delete the two "*" chain ends and bond the atoms they hung off.
  // The closed graph depends only on the polymer, not on where the bracket was
  // drawn, so hashing it makes exact matching framing-invariant - the same
  // polyester cut at the ester or mid-chain hashes identically. When the two
  // attachment atoms are already bonded (every vinyl unit, *-CH2-CH2-*) the
  // closure deliberately ADDS a parallel edge rather than bumping the existing
  // bond's order: wlHash counts bonds, so the doubled edge keeps polyethylene
  // distinct from polyacetylene, while merging into the order would conflate a
  // closure with a pi bond. The closure order is the max of the two stub-bond
  // orders so a cut through a double bond still lands on the same closed
  // graph. Returns null for anything that isn't a well-formed two-ended unit;
  // callers then fall back to the open-graph hash. Mirrors polymer-graph.js.
  function closeRepeatUnit(atoms, bonds) {
    var starIds = {};
    var starCount = 0;
    atoms.forEach(function (a) {
      if (a.el === '*') { starIds[a.id] = 1; starCount++; }
    });
    if (starCount !== 2) return null;
    var kept = [], attach = [];
    for (var i = 0; i < bonds.length; i++) {
      var b = bonds[i], aS = !!starIds[b.a], bS = !!starIds[b.b];
      if (aS && bS) return null;
      if (aS) attach.push({ nb: b.b, order: b.order });
      else if (bS) attach.push({ nb: b.a, order: b.order });
      else kept.push({ a: b.a, b: b.b, order: b.order });
    }
    if (attach.length !== 2) return null;
    var outAtoms = [];
    atoms.forEach(function (a) {
      if (!starIds[a.id]) outAtoms.push({ id: a.id, el: a.el, charge: a.charge });
    });
    kept.push({
      a: attach[0].nb,
      b: attach[1].nb,
      order: Math.max(attach[0].order, attach[1].order)
    });
    return { atoms: outAtoms, bonds: kept };
  }

  function closedHash(atoms, bonds) {
    var closed = closeRepeatUnit(atoms, bonds);
    return closed ? wlHash(closed.atoms, closed.bonds) : null;
  }

  function elementProfile(atoms) {
    var p = {};
    atoms.forEach(function (a) { if (a.el !== '*') p[a.el] = (p[a.el] || 0) + 1; });
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

  window.PolymerGraph = { wlHash: wlHash, closeRepeatUnit: closeRepeatUnit, closedHash: closedHash, elementProfile: elementProfile, profileDistance: profileDistance };

  // ---------- Editor + search UI ----------
  document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('mol-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    // First-visit onboarding hint for the structure editor. Shown until
    // dismissed once; the flag lives in localStorage.
    (function () {
      var KEY = 'polytechniques_editor_hint_dismissed';
      var hint = document.getElementById('mol-onboarding');
      var dismiss = document.getElementById('mol-onboarding-dismiss');
      if (!hint || !dismiss) return;
      var seen = false;
      try { seen = localStorage.getItem(KEY) === '1'; } catch (e) {}
      if (!seen) hint.hidden = false;
      dismiss.addEventListener('click', function () {
        hint.hidden = true;
        try { localStorage.setItem(KEY, '1'); } catch (e) {}
      });
    })();

    // Size the canvas to fill its card instead of sitting at a fixed 640px
    // with dead space beside it, keeping the same 16:9 aspect ratio. This
    // has to happen before anything else reads canvas.width/height (ring
    // stamps, worked examples, etc. all center on it).
    (function fitCanvasToContainer() {
      var box = canvas.parentElement;
      if (!box) return;
      var boxRect = box.getBoundingClientRect();
      var boxStyle = getComputedStyle(box);
      var padLeft = parseFloat(boxStyle.paddingLeft) || 0;
      var padRight = parseFloat(boxStyle.paddingRight) || 0;
      var availableWidth = Math.floor(boxRect.width - padLeft - padRight);
      if (availableWidth > 100) {
        canvas.width = availableWidth;
        canvas.height = Math.round(availableWidth * 9 / 16);
      }
    })();

    // Re-fit the canvas backing store when its box changes size (window
    // resize, and entering/leaving the immersive drawing mode). Atoms keep
    // their absolute pixel coordinates, so shift them by the change in the
    // canvas centre to keep the drawing where it was rather than letting it
    // drift off one edge when the canvas grows or shrinks.
    var refitRaf = 0;
    function refitCanvas() {
      var box = canvas.parentElement;
      if (!box) return;
      var boxRect = box.getBoundingClientRect();
      var cs = getComputedStyle(box);
      var padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      var padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
      var availW = Math.floor(boxRect.width - padX);
      if (availW < 100) return;
      var immersive = document.body.classList.contains('mol-immersive');
      var newW = availW;
      var newH = immersive
        ? Math.max(80, Math.floor(boxRect.height - padY))
        : Math.round(availW * 9 / 16);
      if (newW === canvas.width && newH === canvas.height) return;
      var dx = (newW - canvas.width) / 2;
      var dy = (newH - canvas.height) / 2;
      canvas.width = newW;
      canvas.height = newH;
      for (var i = 0; i < atoms.length; i++) { atoms[i].x += dx; atoms[i].y += dy; }
      draw();
    }
    window.addEventListener('resize', function () {
      if (refitRaf) return;
      refitRaf = requestAnimationFrame(function () { refitRaf = 0; refitCanvas(); });
    });

    // Immersive drawing toggle. Fixed-overlay class (works on iOS, where the
    // Fullscreen API does not apply to non-video elements) plus the real API
    // where it exists. refitCanvas runs on each transition so the backing
    // store matches the new box.
    (function () {
      var card = document.getElementById('mol-editor-card');
      var btn = document.getElementById('mol-fs-btn');
      if (!card || !btn) return;
      var label = btn.querySelector('.mol-fs-label');
      var icon = btn.querySelector('.mol-fs-icon');
      function fsElement() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
      function requestFs(el) { var fn = el.requestFullscreen || el.webkitRequestFullscreen; if (fn) { try { fn.call(el); } catch (e) {} } }
      function exitFs() { var fn = document.exitFullscreen || document.webkitExitFullscreen; if (fn && fsElement()) { try { fn.call(document); } catch (e) {} } }
      function setButton(on) {
        if (label) label.textContent = on ? 'Exit' : 'Fullscreen';
        if (icon) icon.innerHTML = on ? '&#10005;' : '&#9974;';
        btn.setAttribute('aria-label', on ? 'Exit fullscreen' : 'Draw fullscreen');
      }
      function enter() { document.body.classList.add('mol-immersive'); setButton(true); requestFs(card); refitCanvas(); }
      function leave() { document.body.classList.remove('mol-immersive'); setButton(false); exitFs(); refitCanvas(); }
      btn.addEventListener('click', function () {
        if (document.body.classList.contains('mol-immersive')) leave(); else enter();
      });
      function onFsChange() { if (!fsElement() && document.body.classList.contains('mol-immersive')) leave(); }
      document.addEventListener('fullscreenchange', onFsChange);
      document.addEventListener('webkitfullscreenchange', onFsChange);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.body.classList.contains('mol-immersive')) leave();
      });
    })();

    var atoms = [];
    var bonds = [];
    var nextAtomId = 1;
    var nextBondId = 1;
    var selectedAtom = null;   // chain-building anchor (draw / wedge / hash / chain modes)
    var selectedGroup = [];    // multi-atom selection (select / rotate modes)
    var mode = 'draw';
    var chargeDelta = 1;
    var currentEl = 'C';
    var brackets = [];   // repeat-unit brackets; 2+ means a copolymer (one block each)
    var draggingAtom = null;
    var draggingBracketHandle = null;
    var draggingBracketPreview = null;
    var groupDragging = false;
    var groupDragOrig = null;
    var marqueeing = false;
    var marqueeRect = null;
    var rotating = false;
    var rotateCentroid = null;
    var rotateStartAngle = 0;
    var rotateOrig = null;
    var chainAnchor = null;
    var chainPreviewPos = null;
    var bondDragAnchor = null;
    var bondPreviewPos = null;
    var hoverAtom = null;
    var comboKey = null;
    var comboTimer = null;
    var shiftHeld = false;
    var pendingRing = null;
    var ringHoverPos = null;
    var ringRotationSteps = 0;
    var ringHoverKey = null;
    var dragStart = null;
    var moved = false;
    var history = [];

    var ATOM_R = 15;
    var BOND_HIT = 7;
    var BOND_LEN = 42;
    var SNAP_STEP = Math.PI / 6; // 30 degrees, matching standard skeletal-formula bond angles

    // Snap a new atom to the nearest 30-degree increment at a fixed bond length
    // from its anchor, so chains come out as proper zigzags (like a real
    // skeletal formula) instead of landing wherever the mouse happened to click.
    function snapFromAnchor(anchor, pos) {
      var dx = pos.x - anchor.x, dy = pos.y - anchor.y;
      var angle = Math.atan2(dy, dx);
      var snapped = Math.round(angle / SNAP_STEP) * SNAP_STEP;
      return { x: anchor.x + BOND_LEN * Math.cos(snapped), y: anchor.y + BOND_LEN * Math.sin(snapped) };
    }

    function snapshot() {
      history.push(JSON.stringify({ atoms: atoms, bonds: bonds, brackets: brackets, nextAtomId: nextAtomId, nextBondId: nextBondId }));
      if (history.length > 40) history.shift();
    }
    function undo() {
      if (!history.length) return;
      var s = JSON.parse(history.pop());
      atoms = s.atoms; bonds = s.bonds; brackets = s.brackets || (s.bracket ? [s.bracket] : []); nextAtomId = s.nextAtomId; nextBondId = s.nextBondId;
      selectedAtom = null; selectedGroup = [];
      draw();
    }

    function atomById(id) {
      for (var i = 0; i < atoms.length; i++) if (atoms[i].id === id) return atoms[i];
      return null;
    }
    function normalizeAngle(a) {
      while (a > Math.PI) a -= 2 * Math.PI;
      while (a <= -Math.PI) a += 2 * Math.PI;
      return a;
    }
    // Pick a sensible bond angle for extending off an atom with a single
    // click, so you never have to aim a second click just to get a clean
    // geometry. A bare atom starts the standard -30 degree zigzag. An atom
    // with one existing bond continues the zigzag, alternating the turn
    // direction from whatever turn was taken one atom back (so chains zigzag
    // back and forth instead of curling into an arc). An atom with two or
    // more bonds already (a branch point) points into the largest open gap
    // between its existing bonds, which is where a substituent belongs.
    function defaultExtendAngle(anchor) {
      var nbrIds = [];
      bonds.forEach(function (b) {
        if (b.a === anchor.id) nbrIds.push(b.b);
        else if (b.b === anchor.id) nbrIds.push(b.a);
      });
      var nbrs = nbrIds.map(atomById).filter(Boolean);

      if (nbrs.length === 0) return -SNAP_STEP * 1; // -30 degrees

      if (nbrs.length === 1) {
        var p = nbrs[0];
        var thetaIn = Math.atan2(anchor.y - p.y, anchor.x - p.x); // P -> anchor
        var grandIds = [];
        bonds.forEach(function (b) {
          if (b.a === p.id && b.b !== anchor.id) grandIds.push(b.b);
          else if (b.b === p.id && b.a !== anchor.id) grandIds.push(b.a);
        });
        var grand = grandIds.map(atomById).filter(Boolean)[0];
        var turnSign = 1;
        if (grand) {
          var thetaPrev = Math.atan2(p.y - grand.y, p.x - grand.x); // G -> P
          turnSign = normalizeAngle(thetaIn - thetaPrev) > 0 ? -1 : 1;
        }
        return thetaIn + turnSign * (2 * SNAP_STEP); // +/- 60 degrees
      }

      var angles = nbrs.map(function (n) { return Math.atan2(n.y - anchor.y, n.x - anchor.x); }).sort(function (x, y) { return x - y; });
      var bestGap = -1, bestMid = angles[0] + Math.PI;
      for (var i = 0; i < angles.length; i++) {
        var a1 = angles[i], a2 = angles[(i + 1) % angles.length];
        var gap = a2 - a1;
        if (gap <= 0) gap += 2 * Math.PI;
        if (gap > bestGap) { bestGap = gap; bestMid = a1 + gap / 2; }
      }
      return bestMid;
    }
    // Where a ring should extend off an atom - unlike defaultExtendAngle
    // (used for plain chain zigzag), a ring substituent goes straight off
    // the incoming bond rather than turning 60 degrees, so the bond into
    // the ring reads as a single straight line (the ipso atom's two ring
    // bonds fan out symmetrically around it), matching how rings are drawn
    // in real skeletal formulas. A branch point (2+ bonds already) still
    // uses the largest open gap, same as a plain substituent would.
    function ringExtendAngle(anchor) {
      var nbrIds = [];
      bonds.forEach(function (b) {
        if (b.a === anchor.id) nbrIds.push(b.b);
        else if (b.b === anchor.id) nbrIds.push(b.a);
      });
      var nbrs = nbrIds.map(atomById).filter(Boolean);

      if (nbrs.length === 0) return -SNAP_STEP * 1; // -30 degrees

      if (nbrs.length === 1) {
        var p = nbrs[0];
        return Math.atan2(anchor.y - p.y, anchor.x - p.x); // straight continuation of P -> anchor
      }

      var angles = nbrs.map(function (n) { return Math.atan2(n.y - anchor.y, n.x - anchor.x); }).sort(function (x, y) { return x - y; });
      var bestGap = -1, bestMid = angles[0] + Math.PI;
      for (var i = 0; i < angles.length; i++) {
        var a1 = angles[i], a2 = angles[(i + 1) % angles.length];
        var gap = a2 - a1;
        if (gap <= 0) gap += 2 * Math.PI;
        if (gap > bestGap) { bestGap = gap; bestMid = a1 + gap / 2; }
      }
      return bestMid;
    }
    function findAtomAt(x, y) {
      for (var i = atoms.length - 1; i >= 0; i--) {
        var a = atoms[i];
        if (Math.hypot(a.x - x, a.y - y) <= ATOM_R) return a;
      }
      return null;
    }
    function distToSeg(px, py, x1, y1, x2, y2) {
      var dx = x2 - x1, dy = y2 - y1;
      var len2 = dx * dx + dy * dy;
      var t = len2 ? Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2)) : 0;
      var cx = x1 + t * dx, cy = y1 + t * dy;
      return Math.hypot(px - cx, py - cy);
    }
    function findBondAt(x, y) {
      for (var i = bonds.length - 1; i >= 0; i--) {
        var b = bonds[i];
        var a1 = atomById(b.a), a2 = atomById(b.b);
        if (!a1 || !a2) continue;
        if (distToSeg(x, y, a1.x, a1.y, a2.x, a2.y) <= BOND_HIT) return b;
      }
      return null;
    }
    function bondExists(id1, id2) {
      return bonds.some(function (b) { return (b.a === id1 && b.b === id2) || (b.a === id2 && b.b === id1); });
    }
    function addAtom(el, x, y) {
      var a = { id: nextAtomId++, el: el, x: x, y: y };
      atoms.push(a);
      return a;
    }
    function addBond(id1, id2, order, ringCenter) {
      if (bondExists(id1, id2)) return;
      var b = { id: nextBondId++, a: id1, b: id2, order: order || 1 };
      if (ringCenter) b.ringCenter = ringCenter;
      bonds.push(b);
    }
    // Same as addBond but tags the new bond with wedge/hash stereo when the
    // Wedge or Hash tool is active, used only at interactive chain-building
    // sites (ring templates and worked examples always want plain bonds).
    function addChainBond(id1, id2) {
      if (bondExists(id1, id2)) return;
      var b = { id: nextBondId++, a: id1, b: id2, order: 1 };
      if (mode === 'draw-wedge') b.stereo = 'wedge';
      else if (mode === 'draw-hash') b.stereo = 'hash';
      bonds.push(b);
    }
    function removeAtom(id) {
      atoms = atoms.filter(function (a) { return a.id !== id; });
      bonds = bonds.filter(function (b) { return b.a !== id && b.b !== id; });
      selectedGroup = selectedGroup.filter(function (a) { return a.id !== id; });
    }
    function groupCentroid(list) {
      var sx = 0, sy = 0;
      list.forEach(function (a) { sx += a.x; sy += a.y; });
      return { x: sx / list.length, y: sy / list.length };
    }

    // Stamp a freestanding ring centered at a point (empty-canvas click).
    function stampRingAt(center, n, aromatic) {
      snapshot();
      var r = BOND_LEN * 0.72; // match the ring radius used everywhere else (attached, fused, worked examples)
      var startAngle = -Math.PI / 2 + ringRotationSteps * SNAP_STEP;
      var ids = [];
      for (var i = 0; i < n; i++) {
        var ang = startAngle + (i * 2 * Math.PI / n);
        ids.push(addAtom('C', center.x + r * Math.cos(ang), center.y + r * Math.sin(ang)).id);
      }
      for (var j = 0; j < n; j++) {
        var order = (aromatic && j % 2 === 0) ? 2 : 1;
        addBond(ids[j], ids[(j + 1) % n], order, center);
      }
      ringRotationSteps = 0;
      draw();
    }
    // Where a ring's n vertices would land if attached to `atom` at a given
    // angle, without actually creating anything (used to test for overlap
    // before committing to a direction, and reused for the final placement
    // so the two can never drift apart). The ring's center sits *beyond* the
    // ipso vertex, so the ring bulges away from the attachment atom instead
    // of folding back over it and crossing the bond leading into it.
    function ringVertexPositions(atom, snappedRad, n) {
      var r = BOND_LEN * 0.72;
      var ipso = { x: atom.x + BOND_LEN * Math.cos(snappedRad), y: atom.y + BOND_LEN * Math.sin(snappedRad) };
      var center = { x: ipso.x + r * Math.cos(snappedRad), y: ipso.y + r * Math.sin(snappedRad) };
      var ipsoAngleDeg = snappedRad * 180 / Math.PI + 180;
      var positions = [];
      for (var i = 0; i < n; i++) {
        var a = (ipsoAngleDeg + i * (360 / n)) * Math.PI / 180;
        positions.push({ x: center.x + r * Math.cos(a), y: center.y + r * Math.sin(a) });
      }
      return positions;
    }
    function overlapsExisting(positions, excludeIds) {
      var minDist = ATOM_R * 1.7;
      var ex = Array.isArray(excludeIds) ? excludeIds : [excludeIds];
      for (var i = 0; i < positions.length; i++) {
        for (var j = 0; j < atoms.length; j++) {
          if (ex.indexOf(atoms[j].id) !== -1) continue;
          if (Math.hypot(atoms[j].x - positions[i].x, atoms[j].y - positions[i].y) < minDist) return true;
        }
      }
      return false;
    }
    // Where a ring's n vertices land when the clicked atom itself becomes
    // one of them (fused directly onto it, no separate connecting bond),
    // at a given angle. position[0] is always exactly the atom's own
    // position, so it never moves - only the other n-1 vertices are new.
    function spiroRingVertexPositions(atom, snappedRad, n) {
      var r = BOND_LEN * 0.72;
      var center = { x: atom.x + r * Math.cos(snappedRad), y: atom.y + r * Math.sin(snappedRad) };
      var atomAngleDeg = snappedRad * 180 / Math.PI + 180;
      var positions = [];
      for (var i = 0; i < n; i++) {
        var a = (atomAngleDeg + i * (360 / n)) * Math.PI / 180;
        positions.push({ x: center.x + r * Math.cos(a), y: center.y + r * Math.sin(a) });
      }
      return positions;
    }
    // Pick the angle a ring attached to `atom` should extend at: the default
    // "open gap" direction, fanned outward in 30-degree steps if that
    // collides with existing structure - unless the user has manually
    // rotated the pending ring with the scroll wheel (ringRotationSteps !=
    // 0), in which case their explicit choice always wins.
    function pickRingAngle(atom, n) {
      var baseAngle = ringExtendAngle(atom);
      var baseSnapped = Math.round(baseAngle / SNAP_STEP) * SNAP_STEP;
      if (ringRotationSteps !== 0) return baseSnapped + ringRotationSteps * SNAP_STEP;
      if (!overlapsExisting(spiroRingVertexPositions(atom, baseSnapped, n), atom.id)) return baseSnapped;
      for (var step = 1; step <= 6; step++) {
        var candidates = [baseSnapped + step * SNAP_STEP, baseSnapped - step * SNAP_STEP];
        for (var c = 0; c < candidates.length; c++) {
          if (!overlapsExisting(spiroRingVertexPositions(atom, candidates[c], n), atom.id)) return candidates[c];
        }
      }
      return baseSnapped;
    }
    // Fuse a ring directly onto an existing atom: the atom itself becomes a
    // ring vertex (no extra bond in between) in the same "open gap" default
    // direction used elsewhere. If the rest of the structure is in the way
    // there, fan outward in 30-degree steps on both sides until a direction
    // is found that doesn't land the ring on top of existing bonds.
    function attachRing(atom, n, aromatic) {
      snapshot();
      var chosen = pickRingAngle(atom, n);
      var positions = spiroRingVertexPositions(atom, chosen, n);
      var ringR = BOND_LEN * 0.72;
      var ringCenter = { x: atom.x + ringR * Math.cos(chosen), y: atom.y + ringR * Math.sin(chosen) };
      var ids = [atom.id];
      for (var i = 1; i < n; i++) ids.push(addAtom('C', positions[i].x, positions[i].y).id);
      for (var j = 0; j < n; j++) {
        var order = (aromatic && j % 2 === 0) ? 2 : 1;
        addBond(ids[j], ids[(j + 1) % n], order, ringCenter);
      }
      selectedAtom = null;
      ringRotationSteps = 0;
      draw();
    }
    function setOrCreateBond(id1, id2, order, ringCenter) {
      var existing = bonds.filter(function (b) { return (b.a === id1 && b.b === id2) || (b.a === id2 && b.b === id1); })[0];
      if (existing) {
        existing.order = order;
        if (ringCenter) existing.ringCenter = ringCenter; else delete existing.ringCenter;
        return;
      }
      addBond(id1, id2, order, ringCenter);
    }
    // Regular n-gon that has [a1, a2] as one exact edge, bulging to
    // whichever side `sideSign` (+1/-1) picks. Vertex order/winding falls
    // out of the actual angle from a1 to a2 around the chosen center, so it
    // always matches that center regardless of which side was picked.
    function fusedRingGeometry(a1, a2, n, sideSign) {
      var dx = a2.x - a1.x, dy = a2.y - a1.y;
      var edgeLen = Math.hypot(dx, dy) || 1;
      var r = edgeLen / (2 * Math.sin(Math.PI / n));
      var apothem = r * Math.cos(Math.PI / n);
      var mx = (a1.x + a2.x) / 2, my = (a1.y + a2.y) / 2;
      var px = -dy / edgeLen, py = dx / edgeLen;
      var center = { x: mx + sideSign * apothem * px, y: my + sideSign * apothem * py };
      var theta1 = Math.atan2(a1.y - center.y, a1.x - center.x);
      var theta2 = Math.atan2(a2.y - center.y, a2.x - center.x);
      var step = normalizeAngle(theta2 - theta1);
      var positions = [{ x: a1.x, y: a1.y }, { x: a2.x, y: a2.y }];
      for (var k = 2; k < n; k++) {
        var ang = theta1 + step * k;
        positions.push({ x: center.x + r * Math.cos(ang), y: center.y + r * Math.sin(ang) });
      }
      return { center: center, positions: positions };
    }
    // Which side of the shared edge the fused ring bulges to: whichever side
    // is clear of existing atoms, unless the user has scrolled to flip sides
    // manually (odd ringRotationSteps), which always wins.
    function pickFusedGeometry(a1, a2, n) {
      var sideA = fusedRingGeometry(a1, a2, n, 1);
      var sideB = fusedRingGeometry(a1, a2, n, -1);
      var aOverlap = overlapsExisting(sideA.positions.slice(2), [a1.id, a2.id]);
      var bOverlap = overlapsExisting(sideB.positions.slice(2), [a1.id, a2.id]);
      if (ringRotationSteps % 2 !== 0) return !bOverlap ? sideB : sideA;
      return !aOverlap ? sideA : sideB;
    }
    // Fuse a ring onto an existing bond (ortho-fusion): the bond's two atoms
    // become a shared edge of the new ring, like naphthalene's central bond.
    function fuseRingOnBond(bond, n, aromatic) {
      var a1 = atomById(bond.a), a2 = atomById(bond.b);
      if (!a1 || !a2) return;
      snapshot();
      var geo = pickFusedGeometry(a1, a2, n);
      var ids = [a1.id, a2.id];
      for (var i = 2; i < n; i++) ids.push(addAtom('C', geo.positions[i].x, geo.positions[i].y).id);
      // Each bridgehead atom may already own a double bond from whichever
      // ring the shared edge was first drawn as part of, and a real Kekule
      // structure gives every atom exactly one. If the shared edge itself
      // is already double, both bridgeheads' one double bond is spent right
      // there, so plain alternation starting double at the shared edge is
      // correct and automatically leaves both of its neighbors single. But
      // if the shared edge is single, each bridgehead got its one double
      // bond from the *other* ring already, so both edges adjacent to the
      // shared edge in this new ring must also stay single before
      // alternation resumes - otherwise a bridgehead ends up with two
      // double bonds at once, breaking the Kekule pattern and overfilling
      // its valence.
      var sharedOrder = aromatic ? (bond.order === 2 ? 2 : 1) : 1;
      for (var j = 0; j < n; j++) {
        var order;
        if (!aromatic) order = 1;
        else if (sharedOrder === 2) order = (j % 2 === 0) ? 2 : 1;
        else order = (j <= 1) ? 1 : (((j - 2) % 2 === 0) ? 2 : 1);
        setOrCreateBond(ids[j], ids[(j + 1) % n], order, geo.center);
      }
      selectedAtom = null;
      ringRotationSteps = 0;
      draw();
    }

    function getPos(evt) {
      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      var t = (evt.touches && evt.touches[0]) || (evt.changedTouches && evt.changedTouches[0]);
      var clientX = t ? t.clientX : evt.clientX;
      var clientY = t ? t.clientY : evt.clientY;
      return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    }

    function elColor(el) {
      var colors = { N: '#3b82f6', NO2: '#3b82f6', O: '#ef4444', S: '#eab308', F: '#22c55e', Cl: '#22c55e', Br: '#a16207', I: '#7c3aed', Si: '#f97316', P: '#f97316', B: '#f97316' };
      return colors[el] || '#111';
    }

    // Just the molecule itself - bonds, atom labels, charges, the repeat-unit
    // bracket - with none of the interactive-only overlays (hover/selection
    // rings, drag previews, marquee, ring ghost). Shared by the live canvas
    // draw() and by image export, which reuses this exact code against a
    // swapped-in offscreen or SVG-recording context so the exported file
    // always matches what's on screen pixel-for-pixel (line for line).
    function drawStructure(textColor, bgColor) {
      var styles = getComputedStyle(document.body);
      var primary = (styles.getPropertyValue('--primary') || '#2563eb').trim() || '#2563eb';
      bonds.forEach(function (b) {
        var a1 = atomById(b.a), a2 = atomById(b.b);
        if (!a1 || !a2) return;
        drawBond(a1, a2, b, textColor);
      });
      atoms.forEach(function (a) {
        var hasLabel = a.el !== 'C';
        var labelRight = 6;
        if (hasLabel) {
          // Condensed journal-style labels: heteroatoms carry their implicit
          // hydrogens (OH, NH2, SH...) using the same valence rules as the
          // molecular-weight readout, so the drawing and the math agree.
          var h = 0;
          if (a.el !== '*') {
            var v = effectiveValence(a);
            if (v != null) {
              var used = 0;
              bonds.forEach(function (b) { if (b.a === a.id || b.b === a.id) used += b.order; });
              h = Math.max(0, v - used);
            }
          }
          // A condensed group label (NO2) draws its digits as subscripts; a
          // plain element symbol goes through the same path as one segment.
          var segs = a.el.match(/\d+|\D+/g) || [a.el];
          var segFont = function (s) { return /^\d/.test(s) ? '600 10px Arial, Helvetica, sans-serif' : '600 15px Arial, Helvetica, sans-serif'; };
          var wEl = 0;
          segs.forEach(function (s) { ctx.font = segFont(s); wEl += ctx.measureText(s).width; });
          ctx.font = '600 13px Arial, Helvetica, sans-serif';
          var wH = h > 0 ? ctx.measureText('H').width : 0;
          ctx.font = '600 10px Arial, Helvetica, sans-serif';
          var wSub = h > 1 ? ctx.measureText(String(h)).width : 0;
          ctx.fillStyle = bgColor;
          ctx.fillRect(a.x - wEl / 2 - 3, a.y - 9, wEl + wH + wSub + 6, 18);
          ctx.fillStyle = elColor(a.el);
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          var lx = a.x - wEl / 2;
          segs.forEach(function (s) {
            ctx.font = segFont(s);
            ctx.fillText(s, lx, a.y + (/^\d/.test(s) ? 5 : 1));
            lx += ctx.measureText(s).width;
          });
          if (h > 0) {
            ctx.font = '600 13px Arial, Helvetica, sans-serif';
            ctx.fillText('H', a.x + wEl / 2 + 0.5, a.y + 1);
            if (h > 1) {
              ctx.font = '600 10px Arial, Helvetica, sans-serif';
              ctx.fillText(String(h), a.x + wEl / 2 + wH + 1, a.y + 5);
            }
          }
          labelRight = wEl / 2 + wH + wSub + 3;
        }
        if (a.charge) {
          var sign = a.charge > 0 ? '+' : '−';
          var mag = Math.abs(a.charge);
          var chargeLabel = (mag > 1 ? mag : '') + sign;
          ctx.font = '700 11px Arial, Helvetica, sans-serif';
          var ccx = a.x + (hasLabel ? labelRight + 1 : 6), ccy = a.y - (hasLabel ? 10 : 8);
          var cw = ctx.measureText(chargeLabel).width;
          ctx.fillStyle = bgColor;
          ctx.fillRect(ccx - 1, ccy - 7, cw + 2, 12);
          ctx.fillStyle = textColor;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(chargeLabel, ccx, ccy);
        }
      });
      brackets.forEach(function (b, i) { drawBracket(b, primary, brackets.length > 1 ? i : -1); });
    }

    function draw() {
      var w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      var styles = getComputedStyle(document.body);
      var textColor = (styles.getPropertyValue('--text') || '#111').trim() || '#111';
      var bgColor = (styles.getPropertyValue('--card-bg') || '#fff').trim() || '#fff';
      var primary = (styles.getPropertyValue('--primary') || '#2563eb').trim() || '#2563eb';

      drawStructure(textColor, bgColor);
      atoms.forEach(function (a) {
        if (a === hoverAtom) {
          ctx.save();
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.arc(a.x, a.y, ATOM_R + 2, 0, Math.PI * 2);
          ctx.strokeStyle = primary;
          ctx.lineWidth = 1.4;
          ctx.stroke();
          ctx.restore();
        }
        var inGroup = selectedGroup.indexOf(a) !== -1;
        if (a === selectedAtom || inGroup) {
          ctx.beginPath();
          ctx.arc(a.x, a.y, ATOM_R - 3, 0, Math.PI * 2);
          if (inGroup) {
            ctx.globalAlpha = 0.16;
            ctx.fillStyle = primary;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
          ctx.strokeStyle = primary;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
      if (mode === 'bracket' && draggingBracketPreview) drawBracket(draggingBracketPreview, primary);
      if (mode === 'select' && marqueeRect) drawMarquee(marqueeRect, primary);
      if (mode === 'chain' && dragStart && chainPreviewPos) {
        var origin = chainAnchor ? { x: chainAnchor.x, y: chainAnchor.y } : dragStart;
        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = primary;
        ctx.lineWidth = 1;
        line(origin.x, origin.y, chainPreviewPos.x, chainPreviewPos.y);
        ctx.restore();
      }
      if ((mode === 'draw' || mode === 'draw-wedge' || mode === 'draw-hash') && bondDragAnchor && bondPreviewPos) {
        var targetAtom = findAtomAt(bondPreviewPos.x, bondPreviewPos.y);
        var previewEnd = targetAtom ? targetAtom : snapFromAnchor(bondDragAnchor, bondPreviewPos);
        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = primary;
        ctx.lineWidth = 1.5;
        line(bondDragAnchor.x, bondDragAnchor.y, previewEnd.x, previewEnd.y);
        ctx.restore();
      }
      if (mode === 'ring' && pendingRing && ringHoverPos) drawRingGhost(primary);
      updateMassReadout();
    }

    // ---- Molecular weight readout -----------------------------------------
    // Standard atomic weights (IUPAC 2021, abridged to 5 significant figures);
    // radioactive elements carry the mass number of their most stable isotope.
    // Covers everything the periodic-table picker offers.
    var ATOMIC_MASS = {
      H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998, Ne: 20.180,
      Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Ar: 39.95,
      K: 39.098, Ca: 40.078, Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996, Mn: 54.938, Fe: 55.845, Co: 58.933,
      Ni: 58.693, Cu: 63.546, Zn: 65.38, Ga: 69.723, Ge: 72.630, As: 74.922, Se: 78.971, Br: 79.904, Kr: 83.798,
      Rb: 85.468, Sr: 87.62, Y: 88.906, Zr: 91.224, Nb: 92.906, Mo: 95.95, Tc: 97, Ru: 101.07, Rh: 102.91,
      Pd: 106.42, Ag: 107.87, Cd: 112.41, In: 114.82, Sn: 118.71, Sb: 121.76, Te: 127.60, I: 126.90, Xe: 131.29,
      Cs: 132.91, Ba: 137.33, La: 138.91, Ce: 140.12, Pr: 140.91, Nd: 144.24, Pm: 145, Sm: 150.36, Eu: 151.96,
      Gd: 157.25, Tb: 158.93, Dy: 162.50, Ho: 164.93, Er: 167.26, Tm: 168.93, Yb: 173.05, Lu: 174.97,
      Hf: 178.49, Ta: 180.95, W: 183.84, Re: 186.21, Os: 190.23, Ir: 192.22, Pt: 195.08, Au: 196.97, Hg: 200.59,
      Tl: 204.38, Pb: 207.2, Bi: 208.98, Po: 209, At: 210, Rn: 222, Fr: 223, Ra: 226, Ac: 227, Th: 232.04,
      Pa: 231.04, U: 238.03
    };

    // Elements that get implicit hydrogens in a skeletal drawing, with their
    // neutral valence. Everything else is taken as drawn, explicit bonds only.
    var IMPLICIT_H_VALENCE = { H: 1, B: 3, C: 4, N: 3, O: 2, F: 1, Si: 4, P: 3, S: 2, Cl: 1, Br: 1, I: 1 };

    // Monoisotopic masses (most abundant isotope) for the exact-mass readout.
    // Covers the organic subset; a structure containing anything else simply
    // omits the exact mass rather than reporting a wrong one.
    var MONO_MASS = {
      H: 1.007825, B: 11.009305, C: 12, N: 14.003074, O: 15.994915, F: 18.998403,
      Si: 27.976927, P: 30.973762, S: 31.972071, Cl: 34.968853, Br: 78.918338, I: 126.904473
    };

    // Condensed group labels: one drawn vertex standing for a whole group,
    // structure and charges implicit (Shift+N writes NO2). The composition
    // feeds the formula/mass readout below; expandSuperatoms() rebuilds the
    // real atoms for anything RDKit sees (search, SMILES, clean-up).
    var SUPERATOM_COUNTS = { NO2: { N: 1, O: 2 } };

    function effectiveValence(a) {
      var v = IMPLICIT_H_VALENCE[a.el];
      if (v == null) return null;
      var q = a.charge || 0;
      if (!q) return v;
      // Carbocations and carbanions both drop one H per unit of charge; for
      // heteroatoms the usual organic convention is valence + charge (N+ makes
      // four bonds, O- makes one).
      if (a.el === 'C') return Math.max(0, v - Math.abs(q));
      return Math.max(0, v + q);
    }

    // Formula and average molecular weight of a set of atoms. Any valence a
    // drawn bond consumes - including bonds that leave the set, or run to a
    // * chain-end marker - never becomes a hydrogen, so highlighting a repeat
    // unit reports the true mass of what sits inside the brackets.
    function fragmentMass(list) {
      var inSet = {};
      list.forEach(function (a) { if (a.el !== '*') inSet[a.id] = true; });
      var counts = {}, mass = 0, hTotal = 0, unknown = null, real = 0;
      var mono = 0, monoOk = true, openOrders = 0;
      list.forEach(function (a) {
        if (a.el === '*') return;
        real++;
        // A condensed group vertex contributes its whole composition and no
        // implicit hydrogens; its bonds still count toward open connections.
        var group = SUPERATOM_COUNTS[a.el];
        if (group) {
          Object.keys(group).forEach(function (el) {
            counts[el] = (counts[el] || 0) + group[el];
            mass += ATOMIC_MASS[el] * group[el];
            mono += MONO_MASS[el] * group[el];
          });
          bonds.forEach(function (b) {
            if (b.a !== a.id && b.b !== a.id) return;
            var other = b.a === a.id ? b.b : b.a;
            if (!inSet[other]) openOrders += b.order;
          });
          return;
        }
        var m = ATOMIC_MASS[a.el];
        if (m == null) { unknown = a.el; return; }
        counts[a.el] = (counts[a.el] || 0) + 1;
        mass += m;
        if (MONO_MASS[a.el] != null) mono += MONO_MASS[a.el]; else monoOk = false;
        var v = effectiveValence(a);
        var used = 0;
        bonds.forEach(function (b) {
          if (b.a !== a.id && b.b !== a.id) return;
          used += b.order;
          // A bond leaving the set (to an unselected atom or a * chain end)
          // stands in for a hydrogen in the ring/double-bond arithmetic below.
          var other = b.a === a.id ? b.b : b.a;
          if (!inSet[other]) openOrders += b.order;
        });
        if (v != null) {
          var h = Math.max(0, v - used);
          hTotal += h;
          mass += h * ATOMIC_MASS.H;
          mono += h * MONO_MASS.H;
        }
      });
      if (hTotal) counts.H = (counts.H || 0) + hTotal;

      // Degree of unsaturation (rings + pi bonds inside the fragment). Open
      // connections count as hydrogens so a repeat unit's two chain-end bonds
      // don't masquerade as a ring. Only computed when every element present
      // has a conventional slot in the formula.
      var TETRA = { C: 1, Si: 1 }, TRI = { N: 1, P: 1, B: 1 }, MONO_V = { F: 1, Cl: 1, Br: 1, I: 1, H: 1 }, DIV = { O: 1, S: 1 };
      var dou = null, douOk = real > 0;
      var c4 = 0, n3 = 0, x1 = 0, hLike = (counts.H || 0) + openOrders;
      Object.keys(counts).forEach(function (el) {
        if (el === 'H') return;
        if (TETRA[el]) c4 += counts[el];
        else if (TRI[el]) n3 += counts[el];
        else if (MONO_V[el]) x1 += counts[el];
        else if (!DIV[el]) douOk = false;
      });
      if (douOk) {
        dou = (2 * c4 + 2 + n3 - hLike - x1) / 2;
        if (dou < 0 || dou !== Math.round(dou)) dou = null;
      }

      return {
        counts: counts, mass: mass, atoms: real, unknown: unknown,
        exact: (monoOk && real > 0) ? mono : null, dou: dou
      };
    }

    // Elemental analysis line: C and H first (the EA convention), then the
    // rest alphabetically, as mass percentages.
    function elementalAnalysis(counts, mass) {
      if (!mass) return '';
      var seq = [];
      if (counts.C) seq.push('C');
      if (counts.H) seq.push('H');
      Object.keys(counts).filter(function (k) { return k !== 'C' && k !== 'H'; }).sort().forEach(function (k) { seq.push(k); });
      return seq.map(function (el) {
        return el + ' ' + (100 * counts[el] * ATOMIC_MASS[el] / mass).toFixed(2) + '%';
      }).join(', ');
    }

    // Hill order: carbon, then hydrogen, then everything else alphabetically.
    function formatFormula(counts) {
      var seq = [];
      if (counts.C) seq.push('C');
      if (counts.H) seq.push('H');
      Object.keys(counts).filter(function (k) { return k !== 'C' && k !== 'H'; }).sort().forEach(function (k) { seq.push(k); });
      return seq.map(function (k) {
        return k + (counts[k] > 1 ? '<sub>' + counts[k] + '</sub>' : '');
      }).join('');
    }

    var massReadout = document.getElementById('mol-mass-readout');
    function updateMassReadout() {
      if (!massReadout) return;
      var sel = selectedGroup.filter(function (a) { return a.el !== '*'; });
      var whole = atoms.filter(function (a) { return a.el !== '*'; });
      var target, label, hint = '';
      var dim = ' style="color:var(--text-dim);font-size:0.85em;"';
      var starCount = atoms.filter(function (a) { return a.el === '*'; }).length;
      // The mass readout describes a single repeat unit; with several blocks
      // bracketed (a copolymer) it reports the most recently drawn one.
      var bracket = brackets.length ? brackets[brackets.length - 1] : null;
      if (sel.length) {
        // A live selection wins: weigh exactly what is highlighted.
        target = sel;
        label = 'Highlighted fragment';
        hint = ' <span' + dim + '>(bonds crossing the selection edge count as connections, not H)</span>';
      } else if (starCount === 2 && whole.length) {
        // Two explicit "*" ends already define the repeat unit, so weigh all of
        // it regardless of the cosmetic bracket's size (the bracket is drawn
        // small, on the backbone bonds, and would otherwise exclude pendants).
        target = whole;
        label = 'Repeat unit';
      } else if (bracket && whole.length) {
        // With a bracket down, report what the search itself would treat as
        // the repeat unit: the atoms inside the bracket, with bonds crossing
        // its edge as chain continuations. The whole sketch rides along in
        // the hint so the neighbor-stub drawing convention doesn't mislead.
        var bx1 = Math.min(bracket.x1, bracket.x2), bx2 = Math.max(bracket.x1, bracket.x2);
        var by1 = Math.min(bracket.y1, bracket.y2), by2 = Math.max(bracket.y1, bracket.y2);
        var interior = whole.filter(function (a) { return a.x >= bx1 && a.x <= bx2 && a.y >= by1 && a.y <= by2; });
        if (interior.length) {
          target = interior;
          label = 'Repeat unit (in bracket)';
          var wholeRes = fragmentMass(whole);
          if (!wholeRes.unknown && whole.length > interior.length) {
            hint = ' <span' + dim + '>whole sketch: ' + formatFormula(wholeRes.counts) + ' &middot; ' + wholeRes.mass.toFixed(2) + ' g/mol</span>';
          }
        } else {
          target = whole;
          label = 'Structure';
        }
      } else if (whole.length) {
        // Explicit * chain-end markers (library-loaded structures) already
        // delimit the repeat unit; otherwise it is just a drawing.
        target = whole;
        label = whole.length !== atoms.length ? 'Repeat unit' : 'Structure';
      } else {
        massReadout.hidden = true;
        return;
      }
      var res = fragmentMass(target);
      massReadout.hidden = false;
      if (res.unknown) {
        massReadout.textContent = label + ': no mass data for element ' + res.unknown + '.';
        return;
      }
      var extra = [];
      if (res.exact != null) extra.push('exact ' + res.exact.toFixed(4));
      if (res.dou != null) extra.push('DoU ' + res.dou);
      var ea = elementalAnalysis(res.counts, res.mass);
      if (ea) extra.push(ea);
      var extraHtml = extra.length
        ? ' <span style="color:var(--text-dim);font-size:0.85em;">&middot; ' + extra.join(' &middot; ') + '</span>'
        : '';
      massReadout.innerHTML = label + ': ' + formatFormula(res.counts) +
        ' &middot; <strong>' + res.mass.toFixed(2) + ' g/mol</strong>' + extraHtml + hint;
    }
    // Dashed preview of where the pending ring will land - atom-fused,
    // edge-fused onto a bond, or freestanding - so the scroll-wheel rotation
    // (or side-flip, for edge fusion) has something live to aim with before
    // the click commits it.
    function drawRingGhost(primary) {
      var n = pendingRing.n;
      var hoverA = findAtomAt(ringHoverPos.x, ringHoverPos.y);
      var hoverB = !hoverA ? findBondAt(ringHoverPos.x, ringHoverPos.y) : null;
      var positions;
      if (hoverA) {
        var chosen = pickRingAngle(hoverA, n);
        positions = spiroRingVertexPositions(hoverA, chosen, n);
      } else if (hoverB) {
        var a1 = atomById(hoverB.a), a2 = atomById(hoverB.b);
        if (!a1 || !a2) return;
        positions = pickFusedGeometry(a1, a2, n).positions;
      } else {
        var startAngle = -Math.PI / 2 + ringRotationSteps * SNAP_STEP;
        positions = [];
        for (var i = 0; i < n; i++) {
          var ang = startAngle + (i * 2 * Math.PI / n);
          positions.push({ x: ringHoverPos.x + (BOND_LEN * 0.72) * Math.cos(ang), y: ringHoverPos.y + (BOND_LEN * 0.72) * Math.sin(ang) });
        }
      }
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = primary;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      for (var k = 0; k < n; k++) {
        var p1 = positions[k], p2 = positions[(k + 1) % n];
        line(p1.x, p1.y, p2.x, p2.y);
      }
      ctx.restore();
    }

    function drawBond(a1, a2, bond, color) {
      var order = bond.order, stereo = bond.stereo;
      var dx = a2.x - a1.x, dy = a2.y - a1.y;
      var len = Math.hypot(dx, dy) || 1;
      var ux = dx / len, uy = dy / len;
      var px = -uy, py = ux;
      var startTrim = a1.el !== 'C' ? 11 : 0;
      var endTrim = a2.el !== 'C' ? 11 : 0;
      var x1 = a1.x + ux * startTrim, y1 = a1.y + uy * startTrim;
      var x2 = a2.x - ux * endTrim, y2 = a2.y - uy * endTrim;

      // ACS 1996 document settings: parallel lines of a multiple bond are
      // spaced 18% of the bond length apart, and lines are drawn hairline
      // thin - the two numbers that most define the "ACS look" versus a
      // generic skeletal drawing.
      var acsSpacing = BOND_LEN * 0.09;

      if (stereo === 'wedge') {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2 + px * 3.4, y2 + py * 3.4);
        ctx.lineTo(x2 - px * 3.4, y2 - py * 3.4);
        ctx.closePath();
        ctx.fill();
        return;
      }
      if (stereo === 'hash') {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.3;
        var steps = 6;
        for (var i = 1; i <= steps; i++) {
          var t = i / steps;
          var wgt = 3.6 * t;
          var mx = x1 + (x2 - x1) * t, my = y1 + (y2 - y1) * t;
          line(mx + px * wgt, my + py * wgt, mx - px * wgt, my - py * wgt);
        }
        return;
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      if (order === 1) {
        line(x1, y1, x2, y2);
      } else if (order === 2) {
        if (bond.ringCenter) {
          // Proper Kekule ring double bond: the bond path itself is one
          // line, and a second, shorter line sits inset just inside the
          // ring - never outside it, regardless of which way the ring was
          // drawn, because the side is picked by which way the ring's
          // actual center lies.
          line(x1, y1, x2, y2);
          var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
          var dot = (bond.ringCenter.x - mx) * px + (bond.ringCenter.y - my) * py;
          var sign = dot >= 0 ? 1 : -1;
          var innerOff = acsSpacing * 1.4 * sign;
          var inset = len * 0.16;
          var iux = ux * inset, iuy = uy * inset;
          line(x1 + iux + px * innerOff, y1 + iuy + py * innerOff, x2 - iux + px * innerOff, y2 - iuy + py * innerOff);
        } else {
          // Chain double bond (not part of a ring): same convention as a
          // real skeletal formula - one line on the true bond path, one
          // shorter line inset toward whichever side the chain's other
          // substituents sit on, so it reads as tucked into the molecule
          // rather than just picking an arbitrary side. Falls back to the
          // old symmetric two-line style only when there's nothing on
          // either end to reference (an isolated double bond in open space).
          var others = [];
          bonds.forEach(function (nb) {
            if (nb === bond) return;
            if (nb.a === a1.id) others.push(atomById(nb.b));
            else if (nb.b === a1.id) others.push(atomById(nb.a));
            else if (nb.a === a2.id) others.push(atomById(nb.b));
            else if (nb.b === a2.id) others.push(atomById(nb.a));
          });
          others = others.filter(Boolean);
          if (others.length) {
            var sx = 0, sy = 0;
            others.forEach(function (o) { sx += o.x; sy += o.y; });
            sx /= others.length; sy /= others.length;
            line(x1, y1, x2, y2);
            var cmx = (x1 + x2) / 2, cmy = (y1 + y2) / 2;
            var cdot = (sx - cmx) * px + (sy - cmy) * py;
            var csign = cdot >= 0 ? 1 : -1;
            var cInnerOff = acsSpacing * 1.4 * csign;
            var cInset = len * 0.16;
            var ciux = ux * cInset, ciuy = uy * cInset;
            line(x1 + ciux + px * cInnerOff, y1 + ciuy + py * cInnerOff, x2 - ciux + px * cInnerOff, y2 - ciuy + py * cInnerOff);
          } else {
            var off = acsSpacing;
            line(x1 + px * off, y1 + py * off, x2 + px * off, y2 + py * off);
            line(x1 - px * off, y1 - py * off, x2 - px * off, y2 - py * off);
          }
        }
      } else {
        var off2 = acsSpacing;
        line(x1, y1, x2, y2);
        line(x1 + px * off2, y1 + py * off2, x2 + px * off2, y2 + py * off2);
        line(x1 - px * off2, y1 - py * off2, x2 - px * off2, y2 - py * off2);
      }
    }
    function line(x1, y1, x2, y2) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // idx < 0: a lone repeat unit, subscript "n". idx >= 0: one block of a
    // copolymer, subscripted m, n, x, y... so each bracketed block reads distinctly.
    var BLOCK_SUBSCRIPTS = ['m', 'n', 'x', 'y', 'z', 'p', 'q'];
    function drawBracket(rect, color, idx) {
      var x1 = Math.min(rect.x1, rect.x2), x2 = Math.max(rect.x1, rect.x2);
      var y1 = Math.min(rect.y1, rect.y2), y2 = Math.max(rect.y1, rect.y2);
      var tick = 8;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1 + tick, y1); ctx.lineTo(x1, y1); ctx.lineTo(x1, y2); ctx.lineTo(x1 + tick, y2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x2 - tick, y1); ctx.lineTo(x2, y1); ctx.lineTo(x2, y2); ctx.lineTo(x2 - tick, y2);
      ctx.stroke();
      ctx.font = '600 13px Arial, Helvetica, sans-serif';
      ctx.fillStyle = color;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      var sub = idx < 0 ? 'n' : (BLOCK_SUBSCRIPTS[idx] || String(idx + 1));
      ctx.fillText(sub, x2 + 3, y2 - 12);
    }

    function drawMarquee(rect, color) {
      ctx.save();
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      var x1 = Math.min(rect.x1, rect.x2), x2 = Math.max(rect.x1, rect.x2);
      var y1 = Math.min(rect.y1, rect.y2), y2 = Math.max(rect.y1, rect.y2);
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      ctx.restore();
    }

    // ---------- Export: PNG / JPEG / SVG ----------
    // Tight bounding box around the actual structure (plus the bracket, if
    // any) so exports crop to the molecule instead of the whole (mostly
    // empty) drawing canvas.
    function structureBBox() {
      if (!atoms.length) return null;
      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      atoms.forEach(function (a) {
        minX = Math.min(minX, a.x); maxX = Math.max(maxX, a.x);
        minY = Math.min(minY, a.y); maxY = Math.max(maxY, a.y);
      });
      var pad = 28;
      minX -= pad; minY -= pad; maxX += pad; maxY += pad;
      brackets.forEach(function (bracket) {
        minX = Math.min(minX, bracket.x1, bracket.x2) - 4;
        maxX = Math.max(maxX, bracket.x1, bracket.x2) + 22;
        minY = Math.min(minY, bracket.y1, bracket.y2) - 4;
        maxY = Math.max(maxY, bracket.y1, bracket.y2) + 4;
      });
      return { minX: minX, minY: minY, width: maxX - minX, height: maxY - minY };
    }

    function downloadBlob(blob, filename) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    // A stand-in for CanvasRenderingContext2D that records the exact same
    // draw calls drawStructure() already makes (moveTo/lineTo/stroke/fill/
    // fillRect/fillText) as SVG elements instead of pixels. Since `ctx` is a
    // plain swappable variable, running drawStructure() against one of
    // these produces a real vector export using the identical geometry the
    // canvas uses - no separate SVG-drawing logic to keep in sync.
    function SVGRenderContext() {
      this.elements = [];
      this.strokeStyle = '#000';
      this.fillStyle = '#000';
      this.lineWidth = 1;
      this.font = '10px sans-serif';
      this.textAlign = 'start';
      this.textBaseline = 'alphabetic';
      this._path = [];
      this._measureCtx = document.createElement('canvas').getContext('2d');
    }
    SVGRenderContext.prototype._r = function (n) { return Math.round(n * 100) / 100; };
    SVGRenderContext.prototype._esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
    SVGRenderContext.prototype.beginPath = function () { this._path = []; };
    SVGRenderContext.prototype.moveTo = function (x, y) { this._path.push('M' + this._r(x) + ' ' + this._r(y)); };
    SVGRenderContext.prototype.lineTo = function (x, y) { this._path.push('L' + this._r(x) + ' ' + this._r(y)); };
    SVGRenderContext.prototype.closePath = function () { this._path.push('Z'); };
    SVGRenderContext.prototype.stroke = function () {
      if (!this._path.length) return;
      this.elements.push('<path d="' + this._path.join(' ') + '" fill="none" stroke="' + this._esc(this.strokeStyle) + '" stroke-width="' + this._r(this.lineWidth) + '" stroke-linecap="round" stroke-linejoin="round"/>');
    };
    SVGRenderContext.prototype.fill = function () {
      if (!this._path.length) return;
      this.elements.push('<path d="' + this._path.join(' ') + '" fill="' + this._esc(this.fillStyle) + '" stroke="none"/>');
    };
    SVGRenderContext.prototype.fillRect = function (x, y, w, h) {
      this.elements.push('<rect x="' + this._r(x) + '" y="' + this._r(y) + '" width="' + this._r(w) + '" height="' + this._r(h) + '" fill="' + this._esc(this.fillStyle) + '"/>');
    };
    SVGRenderContext.prototype.measureText = function (text) {
      this._measureCtx.font = this.font;
      return this._measureCtx.measureText(text);
    };
    SVGRenderContext.prototype.fillText = function (text, x, y) {
      var anchor = this.textAlign === 'center' ? 'middle' : (this.textAlign === 'right' ? 'end' : 'start');
      var dy = this.textBaseline === 'middle' ? '0.35em' : (this.textBaseline === 'top' ? '0.8em' : '0');
      var m = /^\s*(\d+)\s+([\d.]+)px\s+(.+)$/.exec(this.font);
      var weight = m ? m[1] : '400', size = m ? m[2] : '12', family = m ? m[3] : this.font;
      this.elements.push('<text x="' + this._r(x) + '" y="' + this._r(y) + '" dy="' + dy + '" text-anchor="' + anchor + '" font-family="' + this._esc(family) + '" font-size="' + size + '" font-weight="' + weight + '" fill="' + this._esc(this.fillStyle) + '">' + this._esc(text) + '</text>');
    };

    // Exports always render black-on-white regardless of the app's current
    // light/dark theme - reusing the live --text color would go invisible
    // (light text on a forced-white export background) whenever someone
    // exports while in dark mode.
    var EXPORT_TEXT = '#1a1a1a', EXPORT_BG = '#ffffff';

    function exportRaster(format) {
      var bbox = structureBBox();
      if (!bbox) return;
      var scale = 3; // export at higher resolution than the on-screen canvas
      var off = document.createElement('canvas');
      off.width = Math.round(bbox.width * scale);
      off.height = Math.round(bbox.height * scale);
      var offCtx = off.getContext('2d');
      offCtx.scale(scale, scale);
      offCtx.translate(-bbox.minX, -bbox.minY);
      offCtx.fillStyle = EXPORT_BG;
      offCtx.fillRect(bbox.minX, bbox.minY, bbox.width, bbox.height);
      var savedCtx = ctx;
      ctx = offCtx;
      drawStructure(EXPORT_TEXT, EXPORT_BG);
      ctx = savedCtx;
      off.toBlob(function (blob) {
        if (blob) downloadBlob(blob, 'structure.' + (format === 'jpeg' ? 'jpg' : 'png'));
      }, 'image/' + format, 0.95);
    }

    function exportSVG() {
      var bbox = structureBBox();
      if (!bbox) return;
      var shim = new SVGRenderContext();
      var savedCtx = ctx;
      ctx = shim;
      drawStructure(EXPORT_TEXT, EXPORT_BG);
      ctx = savedCtx;
      var bgRect = '<rect x="' + shim._r(bbox.minX) + '" y="' + shim._r(bbox.minY) + '" width="' + shim._r(bbox.width) + '" height="' + shim._r(bbox.height) + '" fill="' + EXPORT_BG + '"/>';
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + shim._r(bbox.minX) + ' ' + shim._r(bbox.minY) + ' ' + shim._r(bbox.width) + ' ' + shim._r(bbox.height) +
        '" width="' + Math.round(bbox.width) + '" height="' + Math.round(bbox.height) + '">' + bgRect + shim.elements.join('') + '</svg>';
      downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), 'structure.svg');
    }

    // ---------- Chain tool: drag to lay down a whole zigzag segment at once ----------
    function buildChain(anchorAtom, startPos, endPos) {
      var origin = anchorAtom ? { x: anchorAtom.x, y: anchorAtom.y } : startPos;
      var dx = endPos.x - origin.x, dy = endPos.y - origin.y;
      var dist = Math.hypot(dx, dy);
      var n = Math.max(1, Math.round(dist / BOND_LEN));
      var baseAngle = Math.round(Math.atan2(dy, dx) / SNAP_STEP) * SNAP_STEP;
      snapshot();
      var prevAtom = anchorAtom || addAtom(currentEl, origin.x, origin.y);
      for (var i = 0; i < n; i++) {
        var stepAngle = baseAngle + (i % 2 === 0 ? -SNAP_STEP : SNAP_STEP);
        var nx = prevAtom.x + BOND_LEN * Math.cos(stepAngle), ny = prevAtom.y + BOND_LEN * Math.sin(stepAngle);
        var newAtom = addAtom(currentEl, nx, ny);
        addChainBond(prevAtom.id, newAtom.id);
        prevAtom = newAtom;
      }
      selectedAtom = prevAtom;
    }

    // ---------- Pointer handling ----------
    function handleDown(pos) {
      dragStart = pos; moved = false;

      if (mode === 'bracket') {
        draggingBracketHandle = 'new';
        draggingBracketPreview = { x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y };
        return;
      }
      if (mode === 'select') {
        var sa = findAtomAt(pos.x, pos.y);
        if (sa) {
          if (selectedGroup.indexOf(sa) === -1) selectedGroup = [sa];
          snapshot();
          groupDragOrig = selectedGroup.map(function (at) { return { id: at.id, x: at.x, y: at.y }; });
          groupDragging = true;
          draw();
          return;
        }
        marqueeing = true;
        marqueeRect = { x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y };
        return;
      }
      if (mode === 'rotate') {
        if (!selectedGroup.length) return;
        rotateCentroid = groupCentroid(selectedGroup);
        rotateStartAngle = Math.atan2(pos.y - rotateCentroid.y, pos.x - rotateCentroid.x);
        rotateOrig = selectedGroup.map(function (at) { return { id: at.id, x: at.x, y: at.y }; });
        snapshot();
        rotating = true;
        return;
      }
      if (mode === 'chain') {
        chainAnchor = findAtomAt(pos.x, pos.y) || null;
        return;
      }
      if (mode === 'draw' || mode === 'draw-wedge' || mode === 'draw-hash') {
        bondDragAnchor = findAtomAt(pos.x, pos.y) || null;
        return;
      }
      if (mode === 'ring') return; // click-only; handleClick does the placement
      var a = findAtomAt(pos.x, pos.y);
      if (a) draggingAtom = a;
    }
    function handleMove(pos) {
      if (dragStart && Math.hypot(pos.x - dragStart.x, pos.y - dragStart.y) > 4) moved = true;

      var nowHover = findAtomAt(pos.x, pos.y);
      if (nowHover !== hoverAtom) { hoverAtom = nowHover; draw(); }

      if (mode === 'ring') {
        ringHoverPos = pos;
        var hk = nowHover ? ('a' + nowHover.id) : null;
        if (!hk) { var hoverB = findBondAt(pos.x, pos.y); hk = hoverB ? ('b' + hoverB.id) : 'empty'; }
        if (hk !== ringHoverKey) { ringHoverKey = hk; ringRotationSteps = 0; }
        draw();
        return;
      }

      if (mode === 'bracket' && draggingBracketHandle === 'new') {
        draggingBracketPreview.x2 = pos.x; draggingBracketPreview.y2 = pos.y;
        draw();
        return;
      }
      if (mode === 'select' && groupDragging) {
        var dx = pos.x - dragStart.x, dy = pos.y - dragStart.y;
        groupDragOrig.forEach(function (o) {
          var at = atomById(o.id);
          if (at) { at.x = o.x + dx; at.y = o.y + dy; }
        });
        draw();
        return;
      }
      if (mode === 'select' && marqueeing) {
        marqueeRect.x2 = pos.x; marqueeRect.y2 = pos.y;
        draw();
        return;
      }
      if (mode === 'rotate' && rotating) {
        var cur = Math.atan2(pos.y - rotateCentroid.y, pos.x - rotateCentroid.x);
        var delta = Math.round((cur - rotateStartAngle) / (Math.PI / 12)) * (Math.PI / 12);
        rotateOrig.forEach(function (o) {
          var at = atomById(o.id);
          if (!at) return;
          var rx = o.x - rotateCentroid.x, ry = o.y - rotateCentroid.y;
          at.x = rotateCentroid.x + rx * Math.cos(delta) - ry * Math.sin(delta);
          at.y = rotateCentroid.y + rx * Math.sin(delta) + ry * Math.cos(delta);
        });
        draw();
        return;
      }
      if (mode === 'chain') {
        chainPreviewPos = pos;
        draw();
        return;
      }
      if ((mode === 'draw' || mode === 'draw-wedge' || mode === 'draw-hash') && bondDragAnchor) {
        bondPreviewPos = pos;
        draw();
        return;
      }
      if (draggingAtom && moved) {
        draggingAtom.x = pos.x; draggingAtom.y = pos.y;
        draw();
      }
    }
    function handleUp(pos) {
      if (mode === 'bracket' && draggingBracketHandle === 'new') {
        if (moved) {
          snapshot();
          // Each drawn box adds a repeat-unit bracket, snapped tight onto the
          // backbone bonds. One = a homopolymer unit; two or more = a copolymer
          // (one block each). Undo removes the last.
          brackets.push(snapBracketTight({ x1: draggingBracketPreview.x1, y1: draggingBracketPreview.y1, x2: pos.x, y2: pos.y }));
          var statusEl = document.getElementById('mol-status');
          if (statusEl) {
            statusEl.textContent = brackets.length >= 2
              ? brackets.length + ' repeat units bracketed. Search identifies each block and reports the copolymer (undo removes the last bracket).'
              : 'Repeat unit bracketed. Add another bracket for a copolymer, or press Search this structure.';
          }
        }
        draggingBracketHandle = null; draggingBracketPreview = null;
        dragStart = null; moved = false;
        draw();
        return;
      }
      if (mode === 'select' && groupDragging) {
        groupDragging = false; groupDragOrig = null;
        dragStart = null; moved = false;
        draw();
        return;
      }
      if (mode === 'select' && marqueeing) {
        marqueeing = false;
        if (moved) {
          var x1 = Math.min(marqueeRect.x1, marqueeRect.x2), x2 = Math.max(marqueeRect.x1, marqueeRect.x2);
          var y1 = Math.min(marqueeRect.y1, marqueeRect.y2), y2 = Math.max(marqueeRect.y1, marqueeRect.y2);
          selectedGroup = atoms.filter(function (a) { return a.x >= x1 && a.x <= x2 && a.y >= y1 && a.y <= y2; });
        } else {
          selectedGroup = [];
        }
        marqueeRect = null;
        dragStart = null; moved = false;
        draw();
        return;
      }
      if (mode === 'rotate' && rotating) {
        rotating = false; rotateOrig = null;
        dragStart = null; moved = false;
        draw();
        return;
      }
      if (mode === 'chain') {
        if (moved) {
          buildChain(chainAnchor, dragStart, pos);
        } else {
          handleClick(pos);
        }
        chainAnchor = null; chainPreviewPos = null;
        dragStart = null; moved = false;
        draw();
        return;
      }
      // Bond / Wedge / Hash: dragging from any atom adds a bond off it - to a
      // brand new, angle-snapped atom if you release over empty space, or to
      // whatever existing atom you release over (e.g. to close a ring).
      // Shift always means "just relabel," even if the click picked up a
      // tiny bit of drag distance, so it never sneaks in an extra bond.
      if ((mode === 'draw' || mode === 'draw-wedge' || mode === 'draw-hash') && bondDragAnchor) {
        if (shiftHeld) {
          snapshot();
          bondDragAnchor.el = currentEl;
          bondDragAnchor = null; bondPreviewPos = null;
          dragStart = null; moved = false;
          draw();
          return;
        }
        if (moved) {
          snapshot();
          var target = findAtomAt(pos.x, pos.y);
          if (target && target !== bondDragAnchor) {
            addChainBond(bondDragAnchor.id, target.id);
            selectedAtom = target;
          } else if (!target) {
            var placePos = snapFromAnchor(bondDragAnchor, pos);
            var newAtom = addAtom(currentEl, placePos.x, placePos.y);
            addChainBond(bondDragAnchor.id, newAtom.id);
            selectedAtom = newAtom;
          }
          bondDragAnchor = null; bondPreviewPos = null;
          dragStart = null; moved = false;
          draw();
          return;
        }
        bondDragAnchor = null; bondPreviewPos = null;
      }
      if (draggingAtom) {
        var wasMoved = moved;
        draggingAtom = null;
        dragStart = null; moved = false;
        if (wasMoved) { draw(); return; }
      }
      handleClick(pos);
      dragStart = null; moved = false;
    }

    function handleClick(pos) {
      var a = findAtomAt(pos.x, pos.y);
      var b = !a ? findBondAt(pos.x, pos.y) : null;

      if (b) {
        if (mode === 'erase') { snapshot(); bonds = bonds.filter(function (x) { return x.id !== b.id; }); draw(); return; }
        if (mode === 'draw-wedge' || mode === 'draw-hash') {
          snapshot(); b.order = 1; b.stereo = (mode === 'draw-wedge') ? 'wedge' : 'hash'; draw(); return;
        }
        if (mode === 'draw' || mode === 'chain') {
          snapshot(); b.stereo = null; b.order = b.order >= 3 ? 1 : b.order + 1; draw(); return;
        }
        if (mode === 'ring') {
          if (!pendingRing) return;
          fuseRingOnBond(b, pendingRing.n, pendingRing.aromatic);
          return;
        }
        return;
      }

      if (mode === 'erase') {
        if (a) { snapshot(); removeAtom(a.id); if (selectedAtom === a) selectedAtom = null; draw(); }
        return;
      }
      if (mode === 'relabel') {
        if (a) { snapshot(); a.el = currentEl; draw(); }
        return;
      }
      if (mode === 'charge') {
        if (a) { snapshot(); a.charge = (a.charge || 0) + chargeDelta; draw(); }
        return;
      }
      if (mode === 'select') {
        selectedGroup = a ? [a] : [];
        draw();
        return;
      }
      if (mode === 'ring') {
        if (!pendingRing) return;
        if (a) attachRing(a, pendingRing.n, pendingRing.aromatic);
        else stampRingAt(pos, pendingRing.n, pendingRing.aromatic);
        return;
      }
      if (mode === 'rotate' || mode === 'bracket') return;

      // draw, draw-wedge, draw-hash, chain (plain click fallback): a single
      // click on any atom immediately adds a bond off it at a sensible
      // default angle (no need to aim a second click), and arms the new atom
      // so the next click keeps extending. A click only ever grows from the
      // atom actually under the cursor - it never bonds back to the previously
      // armed atom, which silently closed rings the user didn't ask for. To
      // connect two existing atoms (close a ring on purpose), drag from one
      // and release on the other.
      // Press Escape to release the current chain without adding another bond.
      // Shift+click just relabels the atom to the selected element instead,
      // without adding anything.
      if (a) {
        if (shiftHeld) {
          snapshot();
          a.el = currentEl;
          draw();
          return;
        }
        snapshot();
        var extendAngle = defaultExtendAngle(a);
        var extendSnapped = Math.round(extendAngle / SNAP_STEP) * SNAP_STEP;
        var extendPos = { x: a.x + BOND_LEN * Math.cos(extendSnapped), y: a.y + BOND_LEN * Math.sin(extendSnapped) };
        var extendAtom = addAtom(currentEl, extendPos.x, extendPos.y);
        addChainBond(a.id, extendAtom.id);
        selectedAtom = extendAtom;
        draw();
        return;
      }
      snapshot();
      var placePos = selectedAtom ? snapFromAnchor(selectedAtom, pos) : pos;
      var newAtom = addAtom(currentEl, placePos.x, placePos.y);
      if (selectedAtom) addChainBond(selectedAtom.id, newAtom.id);
      selectedAtom = newAtom;
      draw();
    }

    canvas.addEventListener('mousedown', function (evt) { shiftHeld = evt.shiftKey; handleDown(getPos(evt)); });
    canvas.addEventListener('mousemove', function (evt) { handleMove(getPos(evt)); });
    canvas.addEventListener('mouseup', function (evt) { shiftHeld = evt.shiftKey; handleUp(getPos(evt)); });
    canvas.addEventListener('mouseleave', function () { if (hoverAtom) { hoverAtom = null; draw(); } });
    canvas.addEventListener('wheel', function (evt) {
      if (mode === 'ring' && pendingRing) {
        evt.preventDefault();
        ringRotationSteps += evt.deltaY > 0 ? 1 : -1;
        draw();
      }
    }, { passive: false });
    canvas.addEventListener('touchstart', function (evt) { evt.preventDefault(); handleDown(getPos(evt)); }, { passive: false });
    canvas.addEventListener('touchmove', function (evt) { evt.preventDefault(); handleMove(getPos(evt)); }, { passive: false });
    canvas.addEventListener('touchend', function (evt) { evt.preventDefault(); handleUp(getPos(evt)); }, { passive: false });

    // Element hotkeys: pick an atom with the Select tool (or a marquee for
    // several at once) and press a letter key to relabel it - no need to keep
    // the mouse parked on the atom. Hovering an atom still works as a
    // fallback when nothing is selected, in any mode. Unambiguous letters
    // (n/o/f) apply immediately; c/s/b wait briefly for a second letter to
    // disambiguate Cl vs C, Si vs S, and Br, falling back to the
    // single-letter element if nothing follows in time.
    var HOTKEY_SINGLE = { n: 'N', o: 'O', f: 'F' };
    var HOTKEY_COMBO = { cl: 'Cl', si: 'Si', br: 'Br' };
    var HOTKEY_FALLBACK = { c: 'C', s: 'S' };
    function applyHotkeyElement(el) {
      var targets = selectedGroup.length ? selectedGroup : (hoverAtom ? [hoverAtom] : []);
      if (!targets.length) return;
      snapshot();
      targets.forEach(function (t) { t.el = el; });
      draw();
    }

    // Expand condensed group labels into their real atoms and bonds for
    // anything RDKit sees. Original atoms keep their array positions (an NO2
    // vertex becomes its nitrogen, charged +1, with =O and -O(-) appended at
    // the end in the charged Lewis form), so callers that map RDKit output
    // back by index can still address the originals. Editor state is never
    // mutated; the canvas keeps the one-vertex label.
    function expandSuperatoms(atomList, bondList) {
      var atoms2 = atomList.map(function (a) { return { id: a.id, el: a.el, x: a.x || 0, y: a.y || 0, charge: a.charge }; });
      var bonds2 = bondList.map(function (b) { return { a: b.a, b: b.b, order: b.order }; });
      var extra = 0;
      atoms2.forEach(function (a) {
        if (a.el !== 'NO2') return;
        a.el = 'N'; a.charge = 1;
        var o1 = { id: '_no2a' + extra, el: 'O', x: a.x + 20, y: a.y - 20 };
        var o2 = { id: '_no2b' + extra, el: 'O', x: a.x + 20, y: a.y + 20, charge: -1 };
        extra++;
        atoms2.push(o1, o2);
        bonds2.push({ a: a.id, b: o1.id, order: 2 }, { a: a.id, b: o2.id, order: 1 });
      });
      return { atoms: atoms2, bonds: bonds2 };
    }
    document.addEventListener('keydown', function (evt) {
      if (evt.key === 'Escape') {
        var overlayEl = document.getElementById('mol-periodic-overlay');
        if (overlayEl && !overlayEl.hidden) { closePeriodicTable(); return; }
        if (selectedAtom) { selectedAtom = null; draw(); }
        if (selectedGroup.length) { selectedGroup = []; draw(); }
        return;
      }
      if ((!hoverAtom && !selectedGroup.length) || evt.ctrlKey || evt.metaKey || evt.altKey) return;
      var target = document.activeElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      var k = evt.key.toLowerCase();
      if (!/^[a-z]$/.test(k)) return;

      // Shift+N turns the selection (or the hovered atom) into a condensed
      // nitro-group vertex: the atom's label becomes NO2, structure and
      // charges implicit. No extra atoms or bonds are drawn.
      if (evt.shiftKey && k === 'n') {
        var nitroTargets = selectedGroup.length ? selectedGroup : (hoverAtom ? [hoverAtom] : []);
        nitroTargets = nitroTargets.filter(function (t) { return t.el !== '*'; });
        if (nitroTargets.length) {
          snapshot();
          nitroTargets.forEach(function (t) { t.el = 'NO2'; t.charge = 0; });
          draw();
        }
        return;
      }

      if (comboKey) {
        var combo = comboKey + k;
        clearTimeout(comboTimer);
        var pendingSingle = comboKey;
        comboKey = null;
        if (HOTKEY_COMBO[combo]) { applyHotkeyElement(HOTKEY_COMBO[combo]); return; }
        if (HOTKEY_FALLBACK[pendingSingle]) applyHotkeyElement(HOTKEY_FALLBACK[pendingSingle]);
      }
      if (HOTKEY_SINGLE[k]) { applyHotkeyElement(HOTKEY_SINGLE[k]); return; }
      if (k === 'c' || k === 's' || k === 'b') {
        comboKey = k;
        comboTimer = setTimeout(function () {
          if (HOTKEY_FALLBACK[comboKey]) applyHotkeyElement(HOTKEY_FALLBACK[comboKey]);
          comboKey = null;
        }, 500);
      }
    });

    function selectElement(el, fromFixedBtn) {
      currentEl = el;
      document.querySelectorAll('.mol-el-btn').forEach(function (x) { x.classList.remove('active'); });
      if (fromFixedBtn) fromFixedBtn.classList.add('active');
      var customInput = document.getElementById('mol-custom-el');
      if (customInput && !fromFixedBtn) customInput.value = el;
      else if (customInput) customInput.value = '';
    }
    document.querySelectorAll('.mol-el-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { selectElement(btn.getAttribute('data-el'), btn); });
    });
    var customElInput = document.getElementById('mol-custom-el');
    if (customElInput) {
      customElInput.addEventListener('change', function () {
        var v = customElInput.value.trim();
        if (!v) return;
        selectElement(v.charAt(0).toUpperCase() + v.slice(1).toLowerCase(), null);
      });
    }

    // ---------- Periodic table popout ----------
    // period/group position for every element, laid out the way a chemist
    // expects to see it; lanthanides and actinides drop into their own two
    // rows below the main table instead of stretching row 6/7 to 32 columns.
    var PERIODIC_MAIN = [
      ['H', 1, 1], ['He', 1, 18],
      ['Li', 2, 1], ['Be', 2, 2], ['B', 2, 13], ['C', 2, 14], ['N', 2, 15], ['O', 2, 16], ['F', 2, 17], ['Ne', 2, 18],
      ['Na', 3, 1], ['Mg', 3, 2], ['Al', 3, 13], ['Si', 3, 14], ['P', 3, 15], ['S', 3, 16], ['Cl', 3, 17], ['Ar', 3, 18],
      ['K', 4, 1], ['Ca', 4, 2], ['Sc', 4, 3], ['Ti', 4, 4], ['V', 4, 5], ['Cr', 4, 6], ['Mn', 4, 7], ['Fe', 4, 8], ['Co', 4, 9], ['Ni', 4, 10], ['Cu', 4, 11], ['Zn', 4, 12], ['Ga', 4, 13], ['Ge', 4, 14], ['As', 4, 15], ['Se', 4, 16], ['Br', 4, 17], ['Kr', 4, 18],
      ['Rb', 5, 1], ['Sr', 5, 2], ['Y', 5, 3], ['Zr', 5, 4], ['Nb', 5, 5], ['Mo', 5, 6], ['Tc', 5, 7], ['Ru', 5, 8], ['Rh', 5, 9], ['Pd', 5, 10], ['Ag', 5, 11], ['Cd', 5, 12], ['In', 5, 13], ['Sn', 5, 14], ['Sb', 5, 15], ['Te', 5, 16], ['I', 5, 17], ['Xe', 5, 18],
      ['Cs', 6, 1], ['Ba', 6, 2], ['La', 6, 3], ['Hf', 6, 4], ['Ta', 6, 5], ['W', 6, 6], ['Re', 6, 7], ['Os', 6, 8], ['Ir', 6, 9], ['Pt', 6, 10], ['Au', 6, 11], ['Hg', 6, 12], ['Tl', 6, 13], ['Pb', 6, 14], ['Bi', 6, 15], ['Po', 6, 16], ['At', 6, 17], ['Rn', 6, 18],
      ['Fr', 7, 1], ['Ra', 7, 2], ['Ac', 7, 3], ['Rf', 7, 4], ['Db', 7, 5], ['Sg', 7, 6], ['Bh', 7, 7], ['Hs', 7, 8], ['Mt', 7, 9], ['Ds', 7, 10], ['Rg', 7, 11], ['Cn', 7, 12], ['Nh', 7, 13], ['Fl', 7, 14], ['Mc', 7, 15], ['Lv', 7, 16], ['Ts', 7, 17], ['Og', 7, 18]
    ];
    var LANTHANIDES = ['Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu'];
    var ACTINIDES = ['Th', 'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm', 'Md', 'No', 'Lr'];

    function buildPeriodicTable() {
      var grid = document.getElementById('mol-periodic-grid');
      if (!grid || grid.childElementCount) return;
      function addCell(sym, row, col) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mol-periodic-el';
        btn.textContent = sym;
        btn.style.gridRow = row;
        btn.style.gridColumn = col;
        btn.addEventListener('click', function () {
          selectElement(sym, null);
          closePeriodicTable();
        });
        grid.appendChild(btn);
      }
      PERIODIC_MAIN.forEach(function (e) { addCell(e[0], e[1], e[2]); });
      LANTHANIDES.forEach(function (sym, i) { addCell(sym, 9, i + 4); });
      ACTINIDES.forEach(function (sym, i) { addCell(sym, 10, i + 4); });
    }
    function openPeriodicTable() {
      buildPeriodicTable();
      var overlay = document.getElementById('mol-periodic-overlay');
      if (overlay) overlay.hidden = false;
    }
    function closePeriodicTable() {
      var overlay = document.getElementById('mol-periodic-overlay');
      if (overlay) overlay.hidden = true;
    }
    var periodicOpenBtn = document.getElementById('mol-periodic-open');
    if (periodicOpenBtn) periodicOpenBtn.addEventListener('click', openPeriodicTable);
    var periodicCloseBtn = document.getElementById('mol-periodic-close');
    if (periodicCloseBtn) periodicCloseBtn.addEventListener('click', closePeriodicTable);
    var periodicOverlay = document.getElementById('mol-periodic-overlay');
    if (periodicOverlay) {
      periodicOverlay.addEventListener('click', function (evt) {
        if (evt.target === periodicOverlay) closePeriodicTable();
      });
    }

    var exportOpenBtn = document.getElementById('mol-export-open');
    var exportMenu = document.getElementById('mol-export-menu');
    if (exportOpenBtn && exportMenu) {
      exportOpenBtn.addEventListener('click', function (evt) {
        evt.stopPropagation();
        exportMenu.hidden = !exportMenu.hidden;
      });
      exportMenu.querySelectorAll('button[data-export]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var kind = btn.getAttribute('data-export');
          if (kind === 'svg') exportSVG();
          else exportRaster(kind);
          exportMenu.hidden = true;
        });
      });
      document.addEventListener('click', function (evt) {
        if (!exportMenu.hidden && !exportMenu.contains(evt.target) && evt.target !== exportOpenBtn) exportMenu.hidden = true;
      });
      document.addEventListener('keydown', function (evt) {
        if (evt.key === 'Escape' && !exportMenu.hidden) exportMenu.hidden = true;
      });
    }
    document.querySelectorAll('.mol-mode-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var newMode = btn.getAttribute('data-mode');
        if (btn.hasAttribute('data-delta')) chargeDelta = parseInt(btn.getAttribute('data-delta'), 10);
        if (btn.hasAttribute('data-ring-n')) {
          pendingRing = { n: parseInt(btn.getAttribute('data-ring-n'), 10), aromatic: btn.getAttribute('data-ring-aromatic') === 'true' };
          ringRotationSteps = 0;
          ringHoverKey = null;
        }
        draggingBracketPreview = null;
        marqueeRect = null; marqueeing = false;
        if (newMode !== 'select' && newMode !== 'rotate') selectedGroup = [];

        // Picking a ring only arms it - it never bonds automatically to
        // whatever atom happened to be highlighted. You always click where
        // you want it: an atom to attach there, or empty space to place it
        // free-standing.
        mode = newMode;
        selectedAtom = null;
        document.querySelectorAll('.mol-mode-btn').forEach(function (x) { x.classList.remove('active'); });
        btn.classList.add('active');
        draw();
      });
    });
    var undoBtn = document.getElementById('mol-undo');
    if (undoBtn) undoBtn.addEventListener('click', undo);
    var clearBtn = document.getElementById('mol-clear');
    if (clearBtn) clearBtn.addEventListener('click', function () {
      snapshot();
      atoms = []; bonds = []; brackets = []; selectedAtom = null; selectedGroup = []; nextAtomId = 1; nextBondId = 1;
      draw();
    });

    // ---------- Repeat-unit extraction + search ----------
    // otherRects (optional): the other blocks' brackets in a copolymer. A pendant
    // fragment that reaches into another block is a chain continuation, not a
    // side group, so it must stay an open end rather than be absorbed.
    function extractRepeatUnit(rect, otherRects) {
      var x1 = Math.min(rect.x1, rect.x2), x2 = Math.max(rect.x1, rect.x2);
      var y1 = Math.min(rect.y1, rect.y2), y2 = Math.max(rect.y1, rect.y2);
      function inside(a) { return a.x >= x1 && a.x <= x2 && a.y >= y1 && a.y <= y2; }
      var interiorIds = {};
      atoms.forEach(function (a) { if (inside(a)) interiorIds[a.id] = true; });

      // Atoms sitting inside a sibling block's bracket: a pendant flood that
      // reaches one of these is crossing into the next block, so it is a
      // backbone continuation and must not be swallowed as a side group.
      var otherIds = {};
      (otherRects || []).forEach(function (r) {
        var ox1 = Math.min(r.x1, r.x2), ox2 = Math.max(r.x1, r.x2);
        var oy1 = Math.min(r.y1, r.y2), oy2 = Math.max(r.y1, r.y2);
        atoms.forEach(function (a) {
          if (a.x >= ox1 && a.x <= ox2 && a.y >= oy1 && a.y <= oy2) otherIds[a.id] = true;
        });
      });

      // Pull in pendant groups that hang past the bracket edge but are still
      // part of the repeat unit - the phenyl of a hand-drawn polystyrene, say,
      // when the box was dragged tight around the backbone. For each bond
      // leaving the interior, flood the outside fragment (without re-entering
      // the interior): a fragment that contains a ring is a side group, so its
      // atoms are absorbed; an acyclic fragment is a neighbor-unit stub and
      // stays an open chain end. Only ever pulls in atoms a tight bracket would
      // otherwise have miscounted as extra ends, so it can't change a search
      // that already worked.
      var adj = {};
      atoms.forEach(function (a) { adj[a.id] = []; });
      bonds.forEach(function (b) { adj[b.a].push(b.b); adj[b.b].push(b.a); });
      var absorbed = {};
      function considerPendant(startId) {
        if (absorbed[startId] || interiorIds[startId]) return;
        var seen = {}, stack = [startId], count = 0;
        seen[startId] = true;
        while (stack.length) {
          var u = stack.pop(); count++;
          adj[u].forEach(function (v) { if (!interiorIds[v] && !seen[v]) { seen[v] = true; stack.push(v); } });
        }
        var reachesOtherBlock = Object.keys(seen).some(function (id) { return otherIds[id]; });
        if (reachesOtherBlock) return;        // crosses into the next block: keep as an open end
        var edges = 0;
        bonds.forEach(function (b) { if (seen[b.a] && seen[b.b]) edges++; });
        if (edges >= count) {                 // a connected fragment with a cycle
          Object.keys(seen).forEach(function (id) { absorbed[id] = true; });
        }
      }
      bonds.forEach(function (b) {
        if (interiorIds[b.a] && !interiorIds[b.b]) considerPendant(b.b);
        else if (interiorIds[b.b] && !interiorIds[b.a]) considerPendant(b.a);
      });
      function isIn(id) { return !!interiorIds[id] || !!absorbed[id]; }

      var interior = atoms.filter(function (a) { return isIn(a.id); });
      var subAtoms = interior.map(function (a) { return { id: a.id, el: a.el, charge: a.charge }; });
      var subBonds = [];
      var starCount = 0;
      var boundaryCount = 0;
      bonds.forEach(function (b) {
        var aIn = isIn(b.a), bIn = isIn(b.b);
        if (aIn && bIn) {
          subBonds.push({ a: b.a, b: b.b, order: b.order });
        } else if (aIn || bIn) {
          boundaryCount++;
          var interiorEnd = aIn ? b.a : b.b;
          var starId = 'S' + (starCount++);
          subAtoms.push({ id: starId, el: '*' });
          subBonds.push({ a: interiorEnd, b: starId, order: b.order });
        }
      });
      return { atoms: subAtoms, bonds: subBonds, boundaryCount: boundaryCount, atomCount: interior.length };
    }

    // A drawing that already carries exactly two "*" attachment points (loaded
    // from a SMILES, or from photo recognition) is itself the repeat unit with
    // its open ends marked. Use the whole drawing as the substructure directly,
    // matching the shape a bracket produces, so no hand-drawn box is needed.
    function extractFromStars() {
      var subAtoms = atoms.map(function (a) { return { id: a.id, el: a.el, charge: a.charge }; });
      var subBonds = bonds.map(function (b) { return { a: b.a, b: b.b, order: b.order }; });
      var starCount = atoms.filter(function (a) { return a.el === '*'; }).length;
      return { atoms: subAtoms, bonds: subBonds, boundaryCount: starCount, atomCount: atoms.length - starCount };
    }

    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }
    // Real chemistry databases don't expose a public "search by structure"
    // API a static page can call directly, so once a structure is matched
    // to a name in the local library, the useful thing we *can* do is hand
    // off to the literature search engines people already use, pre-filled
    // with that name so the click lands straight on results.
    function publicationLinks(p) {
      var q = encodeURIComponent(p.name);
      var sites = [
        { label: 'PubChem', url: 'https://pubchem.ncbi.nlm.nih.gov/#query=' + q },
        { label: 'Google Scholar', url: 'https://scholar.google.com/scholar?q=' + q },
        { label: 'Google Patents', url: 'https://patents.google.com/?q=' + q },
        { label: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=' + q },
        { label: 'ScienceDirect', url: 'https://www.sciencedirect.com/search?qs=' + q }
      ];
      return '<div class="mol-pub-links">' +
        '<span class="mol-pub-label">Find publications:</span>' +
        sites.map(function (s) {
          return '<a class="mol-pub-link" href="' + s.url + '" target="_blank" rel="noopener noreferrer">' + s.label + '</a>';
        }).join('') +
        '</div>';
    }
    function polymerCard(p) {
      var props = [];
      if (p.tg) props.push('T<sub>g</sub> ≈ ' + escapeHtml(p.tg));
      if (p.tm) props.push('T<sub>m</sub> ≈ ' + escapeHtml(p.tm));
      if (p.cas) props.push('CAS ' + escapeHtml(p.cas));
      return '<div class="mol-result-card">' +
        '<div class="mol-result-name">' + escapeHtml(p.name) + '</div>' +
        (p.aka && p.aka.length ? '<div class="mol-result-aka">' + escapeHtml(p.aka.join(', ')) + '</div>' : '') +
        '<div class="mol-result-meta">' + escapeHtml(p.monomer || '') + (p.cls ? ' &middot; ' + escapeHtml(p.cls) : '') + '</div>' +
        (props.length ? '<div class="mol-result-props">' + props.join(' &nbsp;&middot;&nbsp; ') + '</div>' : '') +
        (p.note ? '<div class="mol-result-note">' + escapeHtml(p.note) + '</div>' : '') +
        ((p.atoms && p.bonds) || (p.type === 'copolymer' && p.components && p.components.length >= 2)
          ? '<div class="mol-result-actions">' +
              '<button type="button" class="mol-draw-btn" data-poly-name="' + escapeHtml(p.name) +
              '" title="Load this ' + (p.type === 'copolymer' ? 'copolymer, block by block,' : 'repeat unit') + ' into the editor and pull its publications">' +
              '&#9998; Draw &amp; find publications</button>' +
            '</div>'
          : '') +
        publicationLinks(p) +
        '</div>';
    }
    function renderResults(list) {
      var resultsEl = document.getElementById('mol-results');
      if (!resultsEl) return;
      var idEl = document.getElementById('mol-identify');   // only the no-match path shows it
      if (idEl) { idEl.hidden = true; idEl.innerHTML = ''; }
      // Restore the publications panel below the results (the no-match path
      // lifts it up under the identification; put it back for exact/browse).
      var pubEl = document.getElementById('mol-publications');
      if (pubEl && resultsEl.nextSibling !== pubEl) resultsEl.parentNode.insertBefore(pubEl, resultsEl.nextSibling);
      renderPublications(null);   // structure-search paths refill this after
      if (!list.length) { resultsEl.innerHTML = '<p class="guide-note">No matches.</p>'; return; }
      resultsEl.innerHTML = list.map(polymerCard).join('');
    }

    // ---------- RDKit-powered graph matching ----------
    // The WL-hash comparison above is instant but strictly all-or-nothing.
    // RDKit (self-hosted WASM build, ~7 MB) adds two things: canonical-SMILES
    // identity as a second opinion, and Morgan-fingerprint Tanimoto similarity
    // so a close-but-not-identical drawing surfaces its nearest neighbors
    // instead of a crude element-count ranking. Loaded lazily on the first
    // structure search so name-searchers never pay for it.
    var rdkitPromise = null;
    var rdkitLib = null;
    var FP_OPTS = JSON.stringify({ radius: 2, nBits: 1024 });

    function ensureRDKit() {
      if (rdkitPromise) return rdkitPromise;
      rdkitPromise = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = 'vendor/RDKit_minimal.js';
        s.onload = function () {
          window.initRDKitModule({ locateFile: function (f) { return 'vendor/' + f; } }).then(resolve, reject);
        };
        s.onerror = function () { reject(new Error('RDKit script failed to load')); };
        document.head.appendChild(s);
      }).catch(function (e) {
        rdkitPromise = null;   // allow a retry on the next search
        throw e;
      });
      return rdkitPromise;
    }

    function padCol(v, w) { var s = String(v); while (s.length < w) s = ' ' + s; return s; }

    // Minimal V2000 molblock from editor- or library-format atoms and bonds.
    // Library entries carry no coordinates; zeros are fine, only the topology
    // matters here. Charges ride in M CHG lines; * chain ends parse as dummy
    // atoms, which is exactly the chemistry they represent.
    function molblockFrom(atomList, bondList) {
      var idx = {};
      atomList.forEach(function (a, i) { idx[a.id] = i + 1; });
      var mb = '\n  PolyTech\n\n' + padCol(atomList.length, 3) + padCol(bondList.length, 3) +
        '  0  0  0  0  0  0  0  0999 V2000\n';
      atomList.forEach(function (a) {
        var x = ((a.x || 0) / 40).toFixed(4), y = (-(a.y || 0) / 40).toFixed(4);
        mb += padCol(x, 10) + padCol(y, 10) + padCol('0.0000', 10) + ' ' +
          (a.el + '   ').slice(0, 3) + ' 0  0  0  0  0  0  0  0  0  0  0  0\n';
      });
      bondList.forEach(function (b) {
        mb += padCol(idx[b.a], 3) + padCol(idx[b.b], 3) + padCol(b.order, 3) + '  0\n';
      });
      atomList.forEach(function (a) {
        if (a.charge) mb += 'M  CHG  1' + padCol(idx[a.id], 4) + padCol(a.charge, 4) + '\n';
      });
      mb += 'M  END\n';
      return mb;
    }

    function molFrom(RDKit, mb) {
      var mol = null;
      try { mol = RDKit.get_mol(mb); } catch (e) { mol = null; }
      if (!mol) {
        try { mol = RDKit.get_mol(mb, JSON.stringify({ sanitize: false })); } catch (e2) { mol = null; }
      }
      return mol;
    }

    function tanimoto(fp1, fp2) {
      var inter = 0, uni = 0;
      for (var i = 0; i < fp1.length; i++) {
        var a = fp1.charCodeAt(i) === 49, b = fp2.charCodeAt(i) === 49;
        if (a && b) inter++;
        if (a || b) uni++;
      }
      return uni ? inter / uni : 0;
    }

    // Drop the "*" chain-end pseudo-atoms (and their bonds) so RDKit sees a
    // plain capped fragment. Morgan fingerprints computed WITH the dummies
    // fold "next to a dummy atom" into every environment near a chain end,
    // which distorts similarity; both the query and every library entry go
    // through this same strip so the comparison stays apples-to-apples.
    function stripStars(atomList, bondList) {
      var starIds = {};
      atomList.forEach(function (a) { if (a.el === '*') starIds[a.id] = 1; });
      return {
        atoms: atomList.filter(function (a) { return !starIds[a.id]; }),
        bonds: bondList.filter(function (b) { return !starIds[b.a] && !starIds[b.b]; })
      };
    }

    function prepRdkitLibrary(RDKit) {
      if (rdkitLib) return rdkitLib;
      rdkitLib = [];
      (window.POLYMER_DB || []).forEach(function (p) {
        if (p.type === 'copolymer' || !p.atoms) return;  // no single repeat unit to fingerprint
        var mol = molFrom(RDKit, molblockFrom(p.atoms, p.bonds));
        if (!mol) return;
        var smiles = null;
        try { smiles = mol.get_smiles(); } catch (e) {}
        // Keep the with-dummies mol alive: substructure search matches against
        // it, where the dummies correctly act as repeat-unit boundaries.
        var st = stripStars(p.atoms, p.bonds);
        var capped = molFrom(RDKit, molblockFrom(st.atoms, st.bonds));
        var fp = null;
        if (capped) {
          try { fp = capped.get_morgan_fp(FP_OPTS); } catch (e2) {}
          capped.delete();
        }
        if (smiles && fp) rdkitLib.push({ p: p, smiles: smiles, fp: fp, mol: mol });
        else mol.delete();
      });
      return rdkitLib;
    }

    // Similarity threshold below which a library card is more noise than
    // signal: a 19%-similar polypropylene tells the user nothing about their
    // azlactone. Weak cards still render, but folded away.
    var SIM_STRONG = 0.4;
    function renderRanked(ranked) {
      var resultsEl = document.getElementById('mol-results');
      if (!resultsEl) return;
      function card(r) {
        return '<div class="mol-sim-item">' +
          '<div style="font-size:0.8rem;color:var(--text-dim);margin:10px 0 2px;">' +
          Math.round(r.sim * 100) + '% similar</div>' + polymerCard(r.p) + '</div>';
      }
      var strong = ranked.filter(function (r) { return r.sim >= SIM_STRONG; });
      var weak = ranked.filter(function (r) { return r.sim < SIM_STRONG; });
      resultsEl.innerHTML = strong.map(card).join('') +
        (weak.length
          ? '<details class="mol-sim-weak"><summary>' +
            (strong.length ? 'Weaker similarities' : 'No close library structures &mdash; weak similarities') +
            ' (below ' + Math.round(SIM_STRONG * 100) + '%)</summary>' + weak.map(card).join('') + '</details>'
          : '');
    }

    // Once a structure is matched to a named polymer, pull actual publications
    // for it from Crossref (the same free, keyless, CORS-open source the home
    // page's feed uses) and list them with DOI links, instead of only offering
    // "go search" hand-off buttons. This is matched by name, not a true
    // structure-indexed search of the literature (no free API offers that for
    // a polymer repeat unit) — the PubChem/Patents links on the card remain
    // the route for a structure/patent lookup.
    // Publication time-range options. "Anytime" is the default (broadest, so a
    // match usually has something to show); the others cap how far back Crossref
    // may reach via a from-pub-date filter, letting a user pull only what's new.
    var PUB_RANGES = [
      { id: 'week', label: 'Last week', days: 7 },
      { id: 'month', label: 'Last month', days: 30 },
      { id: 'year', label: 'Last year', days: 365 },
      { id: 'anytime', label: 'Anytime', days: 0 }
    ];
    var pubRange = 'anytime';   // remembered across searches so the choice sticks
    var pubToken = 0;
    var lastPubPolymer = null;  // so the range buttons can re-query the same match
    var pubPool = [];           // venue-ranked papers fetched but not yet shown
    var pubPoolPos = 0;         // next pool index to render
    var pubFetchOffset = 0;     // Crossref offset of the next page to fetch

    // High-impact journal weighting. Crossref can't rank by venue, so each
    // fetched page is re-ranked client-side: a paper in a flagship chemistry
    // or polymer journal floats above same-query hits in lesser-known venues,
    // while Crossref's own relevance position still breaks ties within a tier
    // and orders the unweighted remainder. The polymer terms and the date
    // filter on the query itself are untouched - this only reorders what the
    // query already returned.
    var JOURNAL_WEIGHTS = [
      { m: 'exact', t: 'macromolecules', w: 70 },
      { m: 'prefix', t: 'journal of the american chemical society', w: 70 },
      { m: 'prefix', t: 'nature', w: 70 },
      { m: 'exact', t: 'science', w: 70 },
      { m: 'prefix', t: 'angewandte chemie', w: 65 },
      { m: 'prefix', t: 'chemical reviews', w: 65 },
      { m: 'prefix', t: 'chemical society reviews', w: 65 },
      { m: 'exact', t: 'acs macro letters', w: 60 },
      { m: 'exact', t: 'polymer chemistry', w: 60 },
      { m: 'prefix', t: 'progress in polymer science', w: 60 },
      { m: 'prefix', t: 'macromolecular rapid communications', w: 55 },
      { m: 'exact', t: 'biomacromolecules', w: 55 },
      { m: 'prefix', t: 'advanced materials', w: 50 },
      { m: 'prefix', t: 'acs applied materials', w: 45 },
      { m: 'prefix', t: 'journal of polymer science', w: 45 }
    ];
    function journalWeight(name) {
      var j = String(name || '').toLowerCase().trim();
      if (!j) return 0;
      for (var i = 0; i < JOURNAL_WEIGHTS.length; i++) {
        var e = JOURNAL_WEIGHTS[i];
        if (e.m === 'exact' ? j === e.t : j.indexOf(e.t) === 0) return e.w;
      }
      return 0;
    }

    // Crossref wants from-pub-date as YYYY-MM-DD; build it from "days ago".
    function pubFromDate(days) {
      if (!days) return '';
      var d = new Date(Date.now() - days * 86400000);
      return d.getFullYear() + '-' +
        ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
        ('0' + d.getDate()).slice(-2);
    }

    function renderPublications(polymer) {
      var el = document.getElementById('mol-publications');
      if (!el) return;
      lastPubPolymer = polymer;
      if (!polymer || !polymer.name) { ++pubToken; el.hidden = true; el.innerHTML = ''; return; }

      var name = polymer.name;
      el.hidden = false;
      pubPool = []; pubPoolPos = 0; pubFetchOffset = 0;   // new match: top papers
      // Persistent shell: heading + range control + a results slot that each
      // fetch refills, so re-querying on a range change doesn't rebuild (and
      // re-bind) the buttons under the user's cursor.
      el.innerHTML = '<div class="mol-pub-heading">Publications on ' + escapeHtml(name) + '</div>' +
        '<div class="mol-pub-filter" role="group" aria-label="Publication date range">' +
        PUB_RANGES.map(function (r) {
          return '<button type="button" class="mol-pub-range' + (r.id === pubRange ? ' active' : '') +
            '" data-range="' + r.id + '"' + (r.id === pubRange ? ' aria-pressed="true"' : ' aria-pressed="false"') +
            '>' + escapeHtml(r.label) + '</button>';
        }).join('') +
        '<button type="button" class="mol-pub-refresh" title="Show a different set of papers">&#8635; New papers</button>' +
        '</div>' +
        '<div class="mol-pub-list" id="mol-pub-list"></div>';

      var filter = el.querySelector('.mol-pub-filter');
      if (filter) {
        filter.addEventListener('click', function (e) {
          var btn = e.target.closest('.mol-pub-range');
          if (!btn || btn.getAttribute('data-range') === pubRange) return;
          pubRange = btn.getAttribute('data-range');
          pubPool = []; pubPoolPos = 0; pubFetchOffset = 0;   // new window: top papers
          filter.querySelectorAll('.mol-pub-range').forEach(function (b) {
            var on = b.getAttribute('data-range') === pubRange;
            b.classList.toggle('active', on);
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
          });
          fetchPublications(lastPubPolymer);
        });
      }
      // Refresh shows the next six papers from the venue-ranked pool - no
      // network needed until the pool runs out, at which point the next
      // Crossref page is fetched (wrapping to the top when exhausted).
      var refreshBtn = el.querySelector('.mol-pub-refresh');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', function () {
          if (pubPoolPos < pubPool.length) renderPubPage();
          else fetchPublications(lastPubPolymer);
        });
      }
      fetchPublications(polymer);
    }

    function fetchPublications(polymer) {
      var el = document.getElementById('mol-publications');
      var list = document.getElementById('mol-pub-list');
      if (!el || !list || !polymer || !polymer.name) return;
      var name = polymer.name;
      var myToken = ++pubToken;                 // ignore any earlier in-flight request
      var rangeDef = PUB_RANGES.filter(function (r) { return r.id === pubRange; })[0] || PUB_RANGES[3];
      var rangeLabel = rangeDef.label.toLowerCase();
      list.innerHTML = '<div class="mol-pub-loading guide-note">Finding publications&hellip;</div>';

      // Query the name plus a couple of aliases so an abbreviation-only paper
      // ("PLA") still surfaces, and anchor on "polymer" so a short common name
      // ("Nylon 6") ranks polymer-chemistry papers above tangential hits that
      // merely mention the word. Crossref ranks by relevance to the joined
      // query rather than filtering, so this nudges order without dropping
      // papers that don't happen to say "polymer".
      // External identification can supply its own query terms (the PubChem
      // short common name a paper would actually use) instead of a display name.
      var terms = (polymer.queryTerms && polymer.queryTerms.length
        ? polymer.queryTerms.slice(0, 3)
        : [name].concat((polymer.aka || []).slice(0, 2))).concat(['polymer']);
      var filters = ['type:journal-article'];
      var from = pubFromDate(rangeDef.days);
      if (from) filters.push('from-pub-date:' + from);
      // Fetch a page of 30 so the venue re-ranking has a real pool to work
      // with; "New papers" then walks the ranked pool six at a time without
      // another request until it runs dry.
      var url = 'https://api.crossref.org/works?query.bibliographic=' +
        encodeURIComponent(terms.join(' ')) +
        '&filter=' + encodeURIComponent(filters.join(',')) +
        '&rows=30' +
        (pubFetchOffset ? '&offset=' + pubFetchOffset : '') +
        '&select=' + encodeURIComponent('title,author,container-title,short-container-title,DOI,published,published-print,published-online');

      fetch(url).then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
        if (myToken !== pubToken) return;       // a newer request superseded this
        var items = (data && data.message && data.message.items) || [];
        var papers = items.map(normalizePub).filter(function (p) { return p; });
        // Paged past the end of what Crossref has for this query: wrap back to
        // the top instead of showing an empty page. (Only recurses once - at
        // offset 0 an empty result falls through to the no-results message.)
        if (!papers.length && pubFetchOffset > 0) {
          pubFetchOffset = 0;
          fetchPublications(polymer);
          return;
        }
        if (!papers.length) {
          list.innerHTML = '<div class="guide-note">No indexed journal articles came back for ' +
            (rangeDef.days ? 'the ' + escapeHtml(rangeLabel) : 'this name') +
            '. ' + (rangeDef.days ? 'Try a wider range, or use' : 'Use') +
            ' the search links on the match above for a broader or structure-based lookup.</div>';
          return;
        }
        pubFetchOffset += 30;
        // Rank the pool: venue weight minus a relevance-position penalty, so a
        // flagship-journal paper floats up while Crossref's order still breaks
        // ties and ranks the unweighted remainder.
        pubPool = papers.map(function (p, i) { return { p: p, s: journalWeight(p.journal) - i * 2, i: i }; })
          .sort(function (x, y) { return (y.s - x.s) || (x.i - y.i); })
          .map(function (r) { return r.p; });
        pubPoolPos = 0;
        renderPubPage();
      }).catch(function () {
        if (myToken !== pubToken) return;
        list.innerHTML = '<div class="guide-note">Couldn\'t reach the publication index right now. The search links on the match above still work.</div>';
      });
    }

    // Render the next six papers from the ranked pool into the list slot.
    function renderPubPage() {
      var list = document.getElementById('mol-pub-list');
      if (!list) return;
      var page = pubPool.slice(pubPoolPos, pubPoolPos + 6);
      pubPoolPos += page.length;
      list.innerHTML = page.map(function (p) {
          return '<a class="mol-pub-paper" href="' + escapeHtml(p.url) + '" target="_blank" rel="noopener noreferrer">' +
            '<span class="mol-pub-paper-title">' + escapeHtml(p.title) + '</span>' +
            '<span class="mol-pub-paper-meta">' + escapeHtml(p.meta) + '</span>' +
            '</a>';
        }).join('') +
        '<div class="mol-pub-foot guide-note">Matched by name via Crossref. Not a structure-indexed search &mdash; use the PubChem / Patents links above to search by structure.</div>';
    }

    // Crossref metadata can arrive with HTML entities already baked in
    // (a journal literally containing "&amp;"). Decode to raw text here so the
    // single escapeHtml at render time doesn't double-encode it. A detached
    // textarea decodes named/numeric entities without running any markup.
    var entityDecoder = document.createElement('textarea');
    function decodeEntities(s) { entityDecoder.innerHTML = String(s); return entityDecoder.value; }

    function normalizePub(it) {
      if (!it) return null;
      // Crossref titles carry inline markup (<scp>, <i>, <sub>…); strip the
      // tags so they read as plain text, and collapse the whitespace left over.
      var title = decodeEntities((it.title && it.title[0]) || '')
        .replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (!title) return null;
      var doi = it.DOI || '';
      // Prefer the full journal name for readability; the short form is often a
      // cryptic registered abbreviation ("pk"), so only fall back to it.
      var journal = decodeEntities((it['container-title'] && it['container-title'][0]) ||
        (it['short-container-title'] && it['short-container-title'][0]) || '');
      var dateParts =
        (it.published && it.published['date-parts']) ||
        (it['published-print'] && it['published-print']['date-parts']) ||
        (it['published-online'] && it['published-online']['date-parts']) || [[]];
      var year = dateParts[0] && dateParts[0][0] ? dateParts[0][0] : '';
      var author = '';
      if (it.author && it.author.length) {
        var a0 = it.author[0];
        author = (a0.family || a0.name || '') + (it.author.length > 1 ? ' et al.' : '');
      }
      var meta = [author, journal, year].filter(Boolean).join(' · ');
      // journal rides along raw so journalWeight() can rank by venue.
      return { title: title, meta: meta, journal: journal, url: doi ? 'https://doi.org/' + doi : (it.URL || '#') };
    }

    // ---------- SMILES in/out and structure clean-up ----------
    // Both directions ride on RDKit: paste a SMILES and it lands on the canvas
    // with computed 2D coordinates; copy turns the canvas back into a
    // canonical SMILES or InChI for pasting into PubChem, SciFinder, or a
    // manuscript. Clean-up rewrites the current drawing's coordinates with
    // RDKit's ideal geometry, ChemDraw-style.
    // RDKit writes a [*] attachment point as element "R" (also "R#" / "R1"…)
    // in the molblock. Map those to the editor's own "*" chain-end atom so a
    // loaded repeat unit uses the same representation as the bracket tool and
    // the reference database, instead of an unknown element with no mass.
    // Real two-letter elements starting with R (Rb, Rh, Ru, Re, Ra, Rn, Rf…)
    // are left alone.
    function normalizeDummy(el) {
      if (el === '*' || el === 'R' || el === 'R#' || /^R\d+$/.test(el)) return '*';
      return el;
    }

    function parseMolblockToEditor(mb) {
      var lines = mb.split('\n');
      if (lines.length < 4) return null;
      var nA = parseInt(lines[3].slice(0, 3), 10), nB = parseInt(lines[3].slice(3, 6), 10);
      if (isNaN(nA) || isNaN(nB) || lines.length < 4 + nA + nB) return null;
      var rawAtoms = [], rawBonds = [], charges = {};
      for (var i = 0; i < nA; i++) {
        var L = lines[4 + i];
        rawAtoms.push({ x: parseFloat(L.slice(0, 10)), y: parseFloat(L.slice(10, 20)), el: normalizeDummy(L.slice(31, 34).trim()) });
      }
      for (var j = 0; j < nB; j++) {
        var Lb = lines[4 + nA + j];
        rawBonds.push({ a: parseInt(Lb.slice(0, 3), 10), b: parseInt(Lb.slice(3, 6), 10), order: parseInt(Lb.slice(6, 9), 10) });
      }
      lines.forEach(function (L) {
        if (L.indexOf('M  CHG') !== 0) return;
        var n = parseInt(L.slice(6, 9), 10) || 0;
        for (var k = 0; k < n; k++) {
          var ai = parseInt(L.slice(9 + k * 8, 13 + k * 8), 10);
          var q = parseInt(L.slice(13 + k * 8, 17 + k * 8), 10);
          if (!isNaN(ai) && !isNaN(q)) charges[ai] = q;
        }
      });
      return { atoms: rawAtoms, bonds: rawBonds, charges: charges };
    }

    // Canvas placement for parsed molblock coordinates: scale so the median
    // bond matches the editor's bond length (clamped so the whole structure
    // fits), center it, and flip y (molblock y points up, canvas y down).
    function fitParsedCoords(parsed) {
      var lens = parsed.bonds.map(function (b) {
        var p = parsed.atoms[b.a - 1], q = parsed.atoms[b.b - 1];
        return Math.sqrt((p.x - q.x) * (p.x - q.x) + (p.y - q.y) * (p.y - q.y));
      }).filter(function (l) { return l > 0.01; }).sort(function (x, y) { return x - y; });
      var unit = lens.length ? lens[Math.floor(lens.length / 2)] : 1.5;
      var scale = BOND_LEN / unit;
      var xs = parsed.atoms.map(function (a) { return a.x; });
      var ys = parsed.atoms.map(function (a) { return a.y; });
      var w = Math.max.apply(null, xs) - Math.min.apply(null, xs);
      var h = Math.max.apply(null, ys) - Math.min.apply(null, ys);
      if (w > 0) scale = Math.min(scale, (canvas.width - 70) / w);
      if (h > 0) scale = Math.min(scale, (canvas.height - 70) / h);
      var cx0 = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2;
      var cy0 = (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2;
      return parsed.atoms.map(function (a) {
        return {
          x: canvas.width / 2 + (a.x - cx0) * scale,
          y: canvas.height / 2 - (a.y - cy0) * scale
        };
      });
    }

    var smilesStatusEl = document.getElementById('mol-smiles-status');
    function smilesNote(msg) { if (smilesStatusEl) smilesStatusEl.textContent = msg; }

    // Lay a linear-backbone repeat unit out the textbook way: the chain between
    // the two "*" ends runs as a horizontal zigzag, and each pendant drops off
    // it, so polystyrene reads as a backbone with the phenyl hanging straight
    // down instead of RDKit's arbitrary fold. Pendant shapes (rings, ester
    // arms) are lifted straight from RDKit's coordinates and rigidly rotated
    // onto the backbone, so their geometry stays correct. Returns false when the
    // repeat unit isn't a simple chain (a ring sits in the backbone, e.g. PET),
    // so the caller can fall back to orientRepeatUnit. Rewrites parsed.atoms in
    // place, in the molblock frame fitParsedCoords expects (y up).
    function layoutRepeatUnit(parsed) {
      var A = parsed.atoms, BND = parsed.bonds, n = A.length;
      function sub(p, q) { return { x: p.x - q.x, y: p.y - q.y }; }
      function nrm(p) { var m = Math.hypot(p.x, p.y) || 1; return { x: p.x / m, y: p.y / m }; }
      function rot(p, a) { var c = Math.cos(a), s = Math.sin(a); return { x: p.x * c - p.y * s, y: p.x * s + p.y * c }; }

      var stars = [];
      for (var i = 0; i < n; i++) if (A[i].el === '*') stars.push(i);
      if (stars.length !== 2) return false;
      var adj = []; for (i = 0; i < n; i++) adj.push([]);
      BND.forEach(function (bd) { var a = bd.a - 1, b = bd.b - 1; adj[a].push(b); adj[b].push(a); });

      // Shortest path between the two chain ends is the backbone.
      var prev = new Array(n).fill(-1), seen = new Array(n).fill(false), q = [stars[0]];
      seen[stars[0]] = true;
      while (q.length) {
        var u = q.shift();
        if (u === stars[1]) break;
        adj[u].forEach(function (v) { if (!seen[v]) { seen[v] = true; prev[v] = u; q.push(v); } });
      }
      if (!seen[stars[1]]) return false;
      var backbone = []; for (var c = stars[1]; c !== -1; c = prev[c]) backbone.unshift(c);
      var isBk = new Array(n).fill(false), posInBk = {};
      backbone.forEach(function (b, k) { isBk[b] = true; posInBk[b] = k; });
      // A chord between non-consecutive backbone atoms means a ring rides in the
      // backbone; hand those to the generic layout instead.
      var bail = false;
      BND.forEach(function (bd) {
        var a = bd.a - 1, b = bd.b - 1;
        if (isBk[a] && isBk[b] && Math.abs(posInBk[a] - posInBk[b]) !== 1) bail = true;
      });
      if (bail) return false;

      var Lb = BOND_LEN, dx = Lb * Math.cos(Math.PI / 6), dyv = Lb * Math.sin(Math.PI / 6);
      var P = {};                        // index -> {x, y} in a y-down working frame
      backbone.forEach(function (idx, k) { P[idx] = { x: k * dx, y: (k % 2) * dyv }; });
      function rd(i) { return { x: A[i].x, y: -A[i].y }; }   // RDKit coords, y-down

      // Everything hanging off a backbone atom (a pendant subtree); null if it
      // loops back to another backbone atom (a ring bridging the chain).
      function pendantGroup(start, root) {
        var stack = [start], group = [], ok = true, ls = {}; ls[start] = true;
        while (stack.length) {
          var x = stack.pop(); group.push(x);
          for (var j = 0; j < adj[x].length; j++) {
            var v = adj[x][j];
            if (v === root) continue;
            if (isBk[v]) { ok = false; continue; }
            if (!ls[v]) { ls[v] = true; stack.push(v); }
          }
        }
        return ok ? group : null;
      }

      for (var bi = 0; bi < backbone.length; bi++) {
        var Bx = backbone[bi];
        if (A[Bx].el === '*') continue;                 // no pendants on chain ends
        var gsum = { x: 0, y: 0 };
        adj[Bx].forEach(function (v) {
          if (isBk[v]) { var d = nrm(sub(P[v], P[Bx])); gsum.x += d.x; gsum.y += d.y; }
        });
        var outward = nrm({ x: -gsum.x, y: -gsum.y });
        if (!isFinite(outward.x) || (outward.x === 0 && outward.y === 0)) outward = { x: 0, y: 1 };
        var pend = adj[Bx].filter(function (v) { return !isBk[v]; });
        if (!pend.length) continue;
        // Collect each pendant's whole subtree up front so direction slots can
        // be handed out by size.
        var pgroups = [];
        for (var pj = 0; pj < pend.length; pj++) {
          var g = pendantGroup(pend[pj], Bx);
          if (g === null) return false;                  // ring bridges the backbone
          pgroups.push({ atom: pend[pj], group: g });
        }
        var dirs;
        if (pgroups.length === 1) dirs = [outward];
        else if (pgroups.length === 2) {
          // Textbook vinyl convention (PMMA): the two substituents on one
          // backbone carbon sit on opposite sides of the chain, methyl up and
          // ester down, not fanned to the same side. The bulkier subtree takes
          // the outward slot; the end-of-layout mirror then settles it below
          // the chain with the small group pointing up.
          pgroups.sort(function (a, b) { return b.group.length - a.group.length; });
          dirs = [outward, { x: -outward.x, y: -outward.y }];
        } else {
          dirs = []; for (var pk = 0; pk < pgroups.length; pk++) dirs.push(rot(outward, (pk - (pgroups.length - 1) / 2) * 0.7));
        }
        for (pj = 0; pj < pgroups.length; pj++) {
          var Q = pgroups[pj].atom;
          var group = pgroups[pj].group;
          var dir = dirs[Math.min(pj, dirs.length - 1)];
          var vrd = sub(rd(Q), rd(Bx));
          var rdLen = Math.hypot(vrd.x, vrd.y) || 1;
          var scale = Lb / rdLen;
          var rotAng = Math.atan2(dir.y, dir.x) - Math.atan2(vrd.y, vrd.x);
          var ca = Math.cos(rotAng), sa = Math.sin(rotAng);
          group.forEach(function (a) {
            var rel = sub(rd(a), rd(Bx));
            P[a] = { x: P[Bx].x + (rel.x * ca - rel.y * sa) * scale, y: P[Bx].y + (rel.x * sa + rel.y * ca) * scale };
          });
        }
      }
      for (i = 0; i < n; i++) if (!P[i]) return false;

      // Mirror so the bulk of the pendants hangs below the chain, matching the
      // usual polymer drawing (phenyl down, not up).
      var bkY = 0; backbone.forEach(function (b) { bkY += P[b].y; }); bkY /= backbone.length;
      var pSum = 0, pCount = 0;
      for (i = 0; i < n; i++) if (!isBk[i]) { pSum += P[i].y; pCount++; }
      if (pCount && pSum / pCount < bkY) for (i = 0; i < n; i++) P[i].y = 2 * bkY - P[i].y;

      for (i = 0; i < n; i++) { A[i].x = P[i].x; A[i].y = -P[i].y; }   // back to y-up
      return true;
    }

    // Orient a two-ended repeat unit so its "*" chain ends lie on a horizontal
    // axis, left end first. RDKit's generic 2D layout can fold the backbone so
    // both ends point the same way (its polystyrene puts both "*" on the right),
    // which then collapses a left/right repeat-unit bracket onto a sliver of the
    // chain. Rotating onto the star-star axis lays the backbone across the
    // middle with pendants above/below, the way a repeat unit is drawn, so the
    // bracket spans the whole unit. Mutates parsed.atoms in place; a no-op
    // unless the drawing has exactly two "*" atoms.
    function orientRepeatUnit(parsed) {
      var starIdx = [];
      parsed.atoms.forEach(function (a, i) { if (a.el === '*') starIdx.push(i); });
      if (starIdx.length !== 2) return;
      var s0 = parsed.atoms[starIdx[0]], s1 = parsed.atoms[starIdx[1]];
      var dx = s1.x - s0.x, dy = s1.y - s0.y;
      if (Math.sqrt(dx * dx + dy * dy) < 1e-6) return;
      var ang = Math.atan2(dy, dx), cos = Math.cos(-ang), sin = Math.sin(-ang);
      var cx = 0, cy = 0;
      parsed.atoms.forEach(function (a) { cx += a.x; cy += a.y; });
      cx /= parsed.atoms.length; cy /= parsed.atoms.length;
      parsed.atoms.forEach(function (a) {
        var x = a.x - cx, y = a.y - cy;
        a.x = cx + x * cos - y * sin;
        a.y = cy + x * sin + y * cos;
      });
      // Ensure the first "*" ends up on the left; mirror horizontally if not.
      if (parsed.atoms[starIdx[0]].x > parsed.atoms[starIdx[1]].x) {
        parsed.atoms.forEach(function (a) { a.x = 2 * cx - a.x; });
      }
    }

    // A repeat unit marked by two "*" chain ends gets a cosmetic bracket. Put
    // the two vertical bars ON the bonds that leave the unit (each "*"-to-
    // backbone bond), the way a polymer bracket is drawn, instead of boxing the
    // atom cloud: a wide pendant group (PNIPAM's isopropylamide, say) otherwise
    // shoves a bounding box out past the "*" atoms. Each bar starts at its
    // crossing bond's midpoint, then only moves outward if a pendant atom pokes
    // past it — so a clean backbone keeps its bars on the bonds while a splayed
    // ring (polystyrene's phenyl) still ends up fully enclosed. The height spans
    // the whole unit. Returns null if the drawing isn't a clean two-ended unit,
    // so the caller leaves the bracket off. Runs after orientRepeatUnit, which
    // lays the backbone horizontal so pendants fall above/below, not across a bar.
    function repeatUnitBracket() {
      var stars = atoms.filter(function (a) { return a.el === '*'; });
      var core = atoms.filter(function (a) { return a.el !== '*'; });
      if (stars.length !== 2 || !core.length) return null;
      function neighborOf(star) {
        for (var i = 0; i < bonds.length; i++) {
          if (bonds[i].a === star.id) return atomById(bonds[i].b);
          if (bonds[i].b === star.id) return atomById(bonds[i].a);
        }
        return null;
      }
      var nA = neighborOf(stars[0]), nB = neighborOf(stars[1]);
      if (!nA || !nB) return null;
      // Each bar sits at the midpoint of a "*"-to-backbone bond, so it crosses
      // that bond the way a polymer bracket does. The height is deliberately
      // small: just enough to span the two crossing points (plus a little), so
      // pendant groups hang below the bracket instead of being boxed in. The
      // "repeat unit" readout reads the "*" atoms, not this box, so a compact
      // bracket doesn't change what the unit is.
      var crossA = { x: (stars[0].x + nA.x) / 2, y: (stars[0].y + nA.y) / 2 };
      var crossB = { x: (stars[1].x + nB.x) / 2, y: (stars[1].y + nB.y) / 2 };
      var yc = (crossA.y + crossB.y) / 2;
      var halfH = Math.max(BOND_LEN * 0.6, Math.abs(crossA.y - crossB.y) / 2 + BOND_LEN * 0.4);
      return {
        x1: Math.min(crossA.x, crossB.x),
        x2: Math.max(crossA.x, crossB.x),
        y1: yc - halfH,
        y2: yc + halfH
      };
    }

    // Tight cosmetic bracket for an explicit atom-id set: two bars on the bonds
    // that cross the set's boundary (the backbone entering/leaving), with a small
    // height so pendant groups hang outside. Returns null unless exactly two
    // bonds cross. Shared by the drawn-bracket snap and the copolymer loader.
    function tightBracketForIds(idSet) {
      var crossings = [];
      bonds.forEach(function (b) {
        var ain = !!idSet[b.a], bin = !!idSet[b.b];
        if (ain === bin) return;
        var ia = atomById(ain ? b.a : b.b), ea = atomById(ain ? b.b : b.a);
        if (ia && ea) crossings.push({ x: (ia.x + ea.x) / 2, y: (ia.y + ea.y) / 2 });
      });
      if (crossings.length !== 2) return null;
      var a = crossings[0], b2 = crossings[1];
      var yc = (a.y + b2.y) / 2;
      var halfH = Math.max(BOND_LEN * 0.6, Math.abs(a.y - b2.y) / 2 + BOND_LEN * 0.4);
      return { x1: Math.min(a.x, b2.x), x2: Math.max(a.x, b2.x), y1: yc - halfH, y2: yc + halfH };
    }

    // Shrink a hand-dragged bracket box onto the repeat unit's backbone bonds so
    // a bracketed block reads like a proper polymer bracket (bars on the bonds,
    // pendants hanging out). Falls back to the drawn box when the enclosed region
    // isn't a clean two-ended unit, which still searches correctly.
    function snapBracketTight(rect) {
      var x1 = Math.min(rect.x1, rect.x2), x2 = Math.max(rect.x1, rect.x2);
      var y1 = Math.min(rect.y1, rect.y2), y2 = Math.max(rect.y1, rect.y2);
      var idSet = {};
      atoms.forEach(function (a) { if (a.x >= x1 && a.x <= x2 && a.y >= y1 && a.y <= y2) idSet[a.id] = true; });
      return tightBracketForIds(idSet) || rect;
    }

    function importSmiles() {
      var input = document.getElementById('mol-smiles-input');
      var text = input && input.value.trim();
      if (!text) { smilesNote('Paste a SMILES string first, e.g. CC(c1ccccc1) for a polystyrene backbone.'); return; }
      smilesNote(rdkitPromise ? 'Reading structure…' : 'Loading the chemistry engine (about 7 MB, one time; it stays cached)…');
      ensureRDKit().then(function (RDKit) {
        var mol = null;
        try { mol = RDKit.get_mol(text); } catch (e) { mol = null; }
        if (!mol) { smilesNote('That SMILES could not be parsed. Check for unbalanced rings or brackets.'); return; }
        var mb = null;
        try { mol.convert_to_kekule_form(); } catch (e1) {}
        try { mb = mol.get_new_coords(); } catch (e2) {}
        if (!mb) { try { mb = mol.get_molblock(); } catch (e3) {} }
        mol.delete();
        var parsed = mb && parseMolblockToEditor(mb);
        if (!parsed || !parsed.atoms.length) { smilesNote('That SMILES could not be converted to a drawing.'); return; }
        if (parsed.bonds.some(function (b) { return b.order > 3; })) {
          smilesNote('The aromatic form could not be kekulized; try writing the SMILES in Kekulé form (C1=CC=CC=C1).');
          return;
        }
        if (!layoutRepeatUnit(parsed)) orientRepeatUnit(parsed);
        var pos = fitParsedCoords(parsed);
        snapshot();
        atoms = []; bonds = []; brackets = []; selectedAtom = null; selectedGroup = []; nextAtomId = 1; nextBondId = 1;
        var made = parsed.atoms.map(function (ra, i) { return addAtom(ra.el || 'C', pos[i].x, pos[i].y); });
        parsed.bonds.forEach(function (rb) { addBond(made[rb.a - 1].id, made[rb.b - 1].id, rb.order); });
        Object.keys(parsed.charges).forEach(function (idx) {
          var at = made[parseInt(idx, 10) - 1];
          if (at) at.charge = parsed.charges[idx];
        });
        draw();
        // A SMILES with exactly two attachment points is already a repeat unit
        // with its open ends marked, so it is searchable as-is (see
        // runStructureSearch, which reads the "*" atoms directly). Draw a
        // cosmetic bracket around the core so it reads as a repeat unit rather
        // than an open chain with two loose ends; search does not depend on it.
        var rb = repeatUnitBracket();
        if (rb) {
          brackets = [rb];
          draw();
          smilesNote('Loaded a repeat unit with two attachment points — press Search this structure. Check the drawing first.');
          return;
        }
        smilesNote('Loaded. Add neighbor stubs and drag the Bracket tool over the repeat unit to search.');
      }).catch(function () { smilesNote('The chemistry engine could not load. Check your connection and try again.'); });
    }

    // Explore hands the drawing off to the editor: take a library polymer's
    // repeat-unit graph (its atoms/bonds already carry the two "*" chain ends),
    // lay it out with RDKit's 2D coordinates, drop it on the canvas with a
    // repeat-unit bracket, then run the structure search so the publications
    // panel fills in. Reuses the SMILES-import path's draw/bracket logic; only
    // the source of the molblock differs (library graph, not a pasted SMILES).
    function loadPolymerStructure(p) {
      if (!p || !p.atoms || !p.bonds) return;
      smilesNote(rdkitPromise ? 'Drawing ' + p.name + '…' : 'Loading the chemistry engine (about 7 MB, one time; it stays cached)…');
      ensureRDKit().then(function (RDKit) {
        var mol = molFrom(RDKit, molblockFrom(p.atoms, p.bonds));
        var mb = null;
        if (mol) {
          try { mb = mol.get_new_coords(); } catch (e) {}
          if (!mb) { try { mb = mol.get_molblock(); } catch (e2) {} }
          mol.delete();
        }
        var parsed = mb && parseMolblockToEditor(mb);
        if (!parsed || !parsed.atoms.length) {
          smilesNote('Could not draw ' + p.name + '. Use the publication links on its card instead.');
          return;
        }
        if (!layoutRepeatUnit(parsed)) orientRepeatUnit(parsed);
        var pos = fitParsedCoords(parsed);
        snapshot();
        atoms = []; bonds = []; brackets = []; selectedAtom = null; selectedGroup = []; nextAtomId = 1; nextBondId = 1;
        var made = parsed.atoms.map(function (ra, i) { return addAtom(ra.el || 'C', pos[i].x, pos[i].y); });
        parsed.bonds.forEach(function (rb) { addBond(made[rb.a - 1].id, made[rb.b - 1].id, rb.order); });
        Object.keys(parsed.charges).forEach(function (idx) {
          var at = made[parseInt(idx, 10) - 1];
          if (at) at.charge = parsed.charges[idx];
        });
        // Cosmetic repeat-unit bracket on the crossing bonds (matches SMILES import).
        var rbLoad = repeatUnitBracket();
        brackets = rbLoad ? [rbLoad] : [];
        draw();
        smilesNote('Loaded ' + p.name + ' into the editor.');
        var editorCard = document.getElementById('mol-editor-card');
        if (editorCard) editorCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        runStructureSearch();
      }).catch(function () {
        smilesNote('The chemistry engine could not load. Check your connection and try again.');
      });
    }

    // Draw a named copolymer into the editor as a chained, per-block-bracketed
    // structure (the way one is drawn on paper), then run the search so it
    // round-trips back to the same identification. Each component's repeat unit
    // is laid out horizontally on its own (reusing layoutRepeatUnit, the proven
    // single-unit layout), then the blocks are placed in adjacent, non-
    // overlapping slots and stitched at the junctions, so every block's bracket
    // sits cleanly on its own backbone bonds.
    function loadCopolymerStructure(entry) {
      if (!entry.components || entry.components.length < 2) { smilesNote('This copolymer has no drawable blocks.'); return; }
      smilesNote(rdkitPromise ? 'Drawing ' + entry.name + '…' : 'Loading the chemistry engine (about 7 MB, one time; it stays cached)…');
      ensureRDKit().then(function (RDKit) {
        var db = window.POLYMER_DB || [];
        var cAtoms = [], cBonds = [], blockCore = [];
        var prevRightIdx = null, firstLeftIdx = null, lastRightIdx = null, xCursor = 0;

        for (var ci = 0; ci < entry.components.length; ci++) {
          var comp = db.filter(function (p) { return p.name === entry.components[ci] && p.atoms; })[0];
          if (!comp) { smilesNote('Missing block "' + entry.components[ci] + '".'); return; }
          var mol = molFrom(RDKit, molblockFrom(comp.atoms, comp.bonds));
          var mb = null;
          if (mol) { try { mb = mol.get_new_coords(); } catch (e) {} if (!mb) { try { mb = mol.get_molblock(); } catch (e2) {} } mol.delete(); }
          var parsed = mb && parseMolblockToEditor(mb);
          if (!parsed || !parsed.atoms.length) { smilesNote('Could not lay out ' + comp.name + '.'); return; }
          if (!layoutRepeatUnit(parsed)) orientRepeatUnit(parsed);
          var A = parsed.atoms;
          var starIdx = [];
          for (var i = 0; i < A.length; i++) if (A[i].el === '*') starIdx.push(i);
          if (starIdx.length !== 2) { smilesNote('Could not lay out ' + comp.name + '.'); return; }
          var nbOf = function (si) {
            for (var k = 0; k < parsed.bonds.length; k++) {
              var b = parsed.bonds[k];
              if (b.a - 1 === si) return b.b - 1;
              if (b.b - 1 === si) return b.a - 1;
            }
            return -1;
          };
          var s0 = starIdx[0], s1 = starIdx[1];
          if (A[s0].x > A[s1].x) { var tmp = s0; s0 = s1; s1 = tmp; }   // s0 = left end, s1 = right end
          var leftNbL = nbOf(s0), rightNbL = nbOf(s1);
          var coreLocal = [];
          for (i = 0; i < A.length; i++) if (i !== s0 && i !== s1) coreLocal.push(i);
          var coreXs = coreLocal.map(function (li) { return A[li].x; });
          var shiftX = xCursor - Math.min.apply(null, coreXs);
          var map = {};
          coreLocal.forEach(function (li) {
            map[li] = cAtoms.length;
            cAtoms.push({ el: A[li].el, x: A[li].x + shiftX, y: A[li].y, charge: parsed.charges[li + 1] });
          });
          parsed.bonds.forEach(function (b) {
            var a = b.a - 1, bb = b.b - 1;
            if (a === s0 || a === s1 || bb === s0 || bb === s1) return;
            cBonds.push({ a: map[a], b: map[bb], order: b.order });
          });
          var thisLeftIdx = map[leftNbL], thisRightIdx = map[rightNbL];
          if (prevRightIdx !== null) cBonds.push({ a: prevRightIdx, b: thisLeftIdx, order: 1 });
          else firstLeftIdx = thisLeftIdx;
          prevRightIdx = thisRightIdx;
          lastRightIdx = thisRightIdx;
          blockCore.push(coreLocal.map(function (li) { return map[li]; }));
          xCursor = Math.max.apply(null, coreLocal.map(function (li) { return A[li].x + shiftX; })) + BOND_LEN;
        }

        // Cap the two outer ends with a stub so the end blocks still have a bond
        // crossing their outer side for the bracket.
        function addStub(nbIdx, dir) {
          var idx = cAtoms.length;
          cAtoms.push({ el: 'C', x: cAtoms[nbIdx].x + dir * BOND_LEN, y: cAtoms[nbIdx].y });
          cBonds.push({ a: nbIdx, b: idx, order: 1 });
        }
        addStub(firstLeftIdx, -1);
        addStub(lastRightIdx, 1);

        var parsedC = {
          atoms: cAtoms,
          bonds: cBonds.map(function (b) { return { a: b.a + 1, b: b.b + 1, order: b.order }; }),
          charges: {}
        };
        cAtoms.forEach(function (a, i) { if (a.charge) parsedC.charges[i + 1] = a.charge; });
        var pos = fitParsedCoords(parsedC);
        snapshot();
        atoms = []; bonds = []; brackets = []; selectedAtom = null; selectedGroup = []; nextAtomId = 1; nextBondId = 1;
        var made = cAtoms.map(function (a, i) { return addAtom(a.el, pos[i].x, pos[i].y); });
        cBonds.forEach(function (b) { addBond(made[b.a].id, made[b.b].id, b.order); });
        cAtoms.forEach(function (a, i) { if (a.charge) made[i].charge = a.charge; });
        brackets = blockCore.map(function (idxs) {
          var set = {};
          idxs.forEach(function (i) { set[made[i].id] = true; });
          return tightBracketForIds(set);
        }).filter(Boolean);
        draw();
        smilesNote('Loaded ' + entry.name + ' as a ' + blockCore.length + '-block copolymer. Press Search this structure.');
        var editorCard = document.getElementById('mol-editor-card');
        if (editorCard) editorCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        runStructureSearch();
      }).catch(function () {
        smilesNote('The chemistry engine could not load. Check your connection and try again.');
      });
    }

    // Every result card (Explore by tag, image OCR, or a similarity hit) carries
    // a "Draw & find publications" button; one delegated listener handles them
    // all, since the results list is re-rendered from several code paths.
    (function wireDrawButtons() {
      var resultsEl = document.getElementById('mol-results');
      if (!resultsEl) return;
      resultsEl.addEventListener('click', function (e) {
        var btn = e.target.closest && e.target.closest('.mol-draw-btn');
        if (!btn) return;
        var name = btn.getAttribute('data-poly-name');
        var p = (window.POLYMER_DB || []).filter(function (x) { return x.name === name; })[0];
        if (p) { if (p.type === 'copolymer') loadCopolymerStructure(p); else loadPolymerStructure(p); }
      });
    })();

    function copyCanvasAs(kind, btn) {
      if (!atoms.length) { smilesNote('Draw a structure first.'); return; }
      smilesNote(rdkitPromise ? '' : 'Loading the chemistry engine (about 7 MB, one time)…');
      ensureRDKit().then(function (RDKit) {
        var ex = expandSuperatoms(atoms, bonds);
        var mol = molFrom(RDKit, molblockFrom(ex.atoms, ex.bonds));
        if (!mol) { smilesNote('The drawing could not be interpreted as a molecule.'); return; }
        var out = null;
        try { out = kind === 'inchi' ? mol.get_inchi() : mol.get_smiles(); } catch (e) {}
        mol.delete();
        if (!out) { smilesNote('Conversion failed. Check the structure for impossible valences.'); return; }
        var flash = function () {
          var orig = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(function () { btn.textContent = orig; }, 1200);
          smilesNote('');
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(out).then(flash, function () { smilesNote(out); });
        } else {
          smilesNote(out);
        }
      }).catch(function () { smilesNote('The chemistry engine could not load.'); });
    }

    function cleanUpStructure() {
      if (!atoms.length) { smilesNote('Draw a structure first.'); return; }
      smilesNote(rdkitPromise ? 'Cleaning up…' : 'Loading the chemistry engine (about 7 MB, one time)…');
      ensureRDKit().then(function (RDKit) {
        var ex = expandSuperatoms(atoms, bonds);
        var mol = molFrom(RDKit, molblockFrom(ex.atoms, ex.bonds));
        if (!mol) { smilesNote('The drawing could not be interpreted, so it was left as it is.'); return; }
        var mb = null;
        try { mb = mol.get_new_coords(); } catch (e) {}
        mol.delete();
        var parsed = mb && parseMolblockToEditor(mb);
        if (!parsed || parsed.atoms.length !== ex.atoms.length) {
          smilesNote('Clean-up failed; the drawing was left unchanged.');
          return;
        }
        // molblockFrom writes atoms in array order and RDKit preserves it, so
        // the new coordinates map back onto the same atoms: ids, bonds,
        // charges, and stereo marks all survive. Expanded group atoms sit at
        // the end of the list, so the first atoms.length entries are the
        // editor's own atoms; the appended ones are layout-only and dropped.
        var pos = fitParsedCoords(parsed);
        snapshot();
        atoms.forEach(function (a, i) { a.x = pos[i].x; a.y = pos[i].y; });
        var hadBracket = brackets.length > 0;
        brackets = [];   // the geometry it framed no longer exists
        draw();
        smilesNote(hadBracket
          ? 'Structure cleaned up. The bracket was cleared; drag it over the repeat unit again.'
          : 'Structure cleaned up.');
      }).catch(function () { smilesNote('The chemistry engine could not load.'); });
    }

    (function wireSmilesRow() {
      var loadBtn = document.getElementById('mol-smiles-load');
      var input = document.getElementById('mol-smiles-input');
      var copySmi = document.getElementById('mol-copy-smiles');
      var copyInchi = document.getElementById('mol-copy-inchi');
      var cleanBtn = document.getElementById('mol-cleanup');
      if (loadBtn) loadBtn.addEventListener('click', importSmiles);
      if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter') importSmiles(); });
      if (copySmi) copySmi.addEventListener('click', function () { copyCanvasAs('smiles', copySmi); });
      if (copyInchi) copyInchi.addEventListener('click', function () { copyCanvasAs('inchi', copyInchi); });
      if (cleanBtn) cleanBtn.addEventListener('click', cleanUpStructure);
    })();

    // ---------- PubChem helpers: polite queue, synonym ranking, CAS ----------
    // PubChem hard-caps at 5 requests/second (returns 503, and browsers can't
    // read its throttling header), so every call goes through one serial queue
    // with a 220ms floor between requests.
    var pcChain = Promise.resolve();
    var pcLastAt = 0;
    function pcFetch(url, opts) {
      pcChain = pcChain.then(function () {
        var wait = Math.max(0, 220 - (Date.now() - pcLastAt));
        return new Promise(function (res) { setTimeout(res, wait); }).then(function () {
          pcLastAt = Date.now();
          return fetch(url, opts);
        });
      });
      return pcChain;
    }

    // Synonym ranking: PubChem orders synonyms by depositor frequency, so
    // POSITION dominates the score; length, systematic-name markers, registry
    // codes, and non-chemical trade names only nudge or reject. Tuned and
    // holdout-tested so "2-Vinyl-4,4-dimethylazlactone" beats the oxazolinone
    // systematic name while "Bisphenol A" and "Nylon 6" survive intact.
    var PC_REJECT_PREFIX = new RegExp('^(' + [
      'CHEMBL', 'DTXSID', 'DTXCID', 'SCHEMBL', 'AKOS', 'MFCD', 'EINECS', 'UNII',
      'NSC', 'BRN', 'ZINC', 'CHEBI', 'RefChem', 'HSDB', 'CCRIS', 'CAS[- ]', 'NCGC',
      'BDBM', 'Tox21', 'DB\\d{5}', 'LS-\\d', 'STL\\d', 'SY\\d{6}', 'CS-\\d', 'GS-\\d{3,}',
      'FT-\\d', 'AC1[A-Z0-9]', 'AI3-', 'BRD-', 'EN300', 'WLN', 'InChI', 'UN\\d{4}',
      'EPA\\b', 'Caswell', 'FEMA', 'RCRA', 'NIOSH', 'USAF', 'MLS\\d', 'SMR\\d',
      'BSPBio', 'KBio', 'SPECTRUM', 'Oprea\\d', 'PubChem', 'HY-[A-Z]?\\d', 'Q\\d{6,}',
      'SR-\\d', 'A8\\d{5}', 'J-\\d{6}', 'W-\\d{6}', 'AB\\d{7}', 'BP-\\d{5}', 'DA-\\d{5}',
      'SB\\d{5}', 'KS-\\d', 'NCI\\d', 'CID\\s?\\d', 'EC[- ]?\\d'
    ].join('|') + ')', 'i');
    var PC_REJECT_EXACT = [
      /^\d+$/,
      /^\d{2,7}-\d{2}-\d$/,
      /^\d{3}-\d{3}-\d$/,
      /^(?=[A-Z0-9]{10}$)(?:[A-Z0-9]*\d){2,}[A-Z0-9]*$/,
      /^[A-Z]{14}-[A-Z]{10}-[A-Z]$/,
      /^[A-Z]{2,6}[\s-]?\d{1,6}$/,
      /^[A-Z]{1,4}-\d{2,}[A-Z]*$/,
      /^[A-Z]\d{5,}$/,
      /\bNO\.\s*\d+/i,
      /\bwaste number\b/i,
      /^[A-Za-z]{0,3}\d+[A-Za-z]{0,3}$/
    ];
    var PC_CHEM_SUFFIX = /(?:ene|ane|yne|ol|one|al|oate|ate|ite|amide|amine|imide|imine|nitrile|cyanide|acid|ester|ether|oxide|lactone|lactam|anhydride|ketone|aldehyde|ide|ine|arin)\b/i;
    var PC_CHEM_ROOT = /(?:benz|phenyl|vinyl|allyl|acryl|styr|meth|eth|prop|but|pent|hex|hept|oct|non|dec|azlacton|oxazol|silox|glycol|urethan|sulf|chlor|fluor|brom|iod|nitro|hydroxy|carbox|thio|amin|amid|lacton|bisphenol|nylon)/i;
    function pcLooksChemical(s) { return PC_CHEM_SUFFIX.test(s) || PC_CHEM_ROOT.test(s); }
    var PC_SIGNALS = [
      { re: /,\s*[a-z0-9(),'\s-]*-$/i, pts: 70, title: true },
      { re: /-$|^\s*-/, pts: 40, title: true },
      { re: /\(\d+\)$/, pts: 40, title: true },
      { re: /,\s/, pts: 10, title: true },
      { re: /(?:oxazol|isoxazol|thiazol|imidazol|pyrrolidin|piperidin|pyrimidin|dihydro|tetrahydro|ylidene|ylium|carboxylat|carbonitril|carboxamid)/i, pts: 16, title: true },
      { re: /\b(?:prop|but|pent|hex|eth|non|oct|dec)-\d/i, pts: 14, title: true },
      { re: /\d+H-|\(\d+H\)/, pts: 20, title: true },
      { re: /\d,\d/, pts: 5, title: true },
      { re: /\((?:[RSEZ]|\d*[RSEZ](?:,\s*\d*[RSEZ])*)\)-/, pts: 22, title: true },
      { re: /\b(?:alpha|beta|gamma|delta|epsilon|omega|ortho|meta|para|cis|trans|sym|tert|sec)[\s-]/i, pts: 5, title: true },
      { re: /\b(?:stabilized|inhibited|solution|anhydrous|pure|liquid|gas|technical|grade|compressed|refrigerated|monomer|polymer(?:ized)?|homopolymer|reagent|analytical)\b/i, pts: 26, title: true },
      { re: /\(\d+CI\)|\[[A-Z]{3,}\]|\bUSP\b|\bJAN\b|\bINN\b|\bBAN\b/i, pts: 45, title: true },
      { re: /\s[A-Z]{1,4}\d*$/, pts: 38, title: false }   // trade suffix; Title exempt ("Bisphenol A")
    ];
    function pcIsJunk(s) {
      if (!s) return true;
      var t = String(s).trim();
      if (t.length < 3 || t.length > 40) return true;
      if (PC_REJECT_PREFIX.test(t)) return true;
      for (var i = 0; i < PC_REJECT_EXACT.length; i++) if (PC_REJECT_EXACT[i].test(t)) return true;
      if (/\d/.test(t) && t === t.toUpperCase() && !/[\s,()]/.test(t) && t.length > 8) return true;
      return false;
    }
    function pcNorm(s) { return String(s).toLowerCase().replace(/[^a-z0-9]/g, ''); }
    var PC_KEEP_UPPER = /^(N|O|S|P|C|R|Z|E|D|L|H)$/;
    function pcPrettyCase(s) {
      if (s.replace(/[^A-Za-z]/g, '').length < 4) return s;
      if (s !== s.toUpperCase()) {
        return s.replace(/[A-Z]{4,}/g, function (w) { return w[0] + w.slice(1).toLowerCase(); });
      }
      return s.toLowerCase().replace(/[A-Za-z]+/g, function (w, off) {
        if (w.length <= 2 && PC_KEEP_UPPER.test(w.toUpperCase())) return w.toUpperCase();
        var prev = s[off - 1], prev2 = s[off - 2];
        var afterNumericHyphen = prev === '-' && (prev2 === undefined || /[\d,]/.test(prev2));
        return (off === 0 || prev === ' ' || prev === '(' || afterNumericHyphen)
          ? w[0].toUpperCase() + w.slice(1) : w;
      });
    }
    function pcPickCommonName(synonyms, title) {
      var seen = {}, cands = [];
      var tk = title ? pcNorm(title) : null;
      (synonyms || []).slice(0, 32).forEach(function (raw, i) {
        var s = String(raw).trim();
        if (pcIsJunk(s)) return;
        var k = pcNorm(s);
        if (!k || seen[k]) return;
        seen[k] = 1;
        var isTitle = tk !== null && k === tk;
        var pts = i * 3.2;
        PC_SIGNALS.forEach(function (sig) {
          if (isTitle && !sig.title) return;
          if (sig.re.test(s)) pts += sig.pts;
        });
        pts += Math.max(0, s.length - 14) * 0.95;
        var words = s.trim().split(/\s+/).length;
        if (words > 3) pts += (words - 3) * 10;
        if (/^[a-z]/.test(s) && s === s.toLowerCase() && /\d/.test(s)) pts += 6;
        if (!pcLooksChemical(s)) pts += 30;
        if (isTitle) pts -= 10;
        cands.push({ name: pcPrettyCase(isTitle ? title : s), score: pts });
      });
      cands.sort(function (a, b) { return a.score - b.score; });
      return cands.length ? cands[0].name : (title || null);
    }
    // CAS lives only in the synonym list. The regex is anchored on purpose:
    // EC/EINECS numbers (3-3-1 digits) would otherwise pass, and the check
    // digit rejects near-miss registry strings.
    function pcCasCheck(body) {
      var sum = 0, rev = body.split('').reverse();
      for (var i = 0; i < rev.length; i++) sum += (i + 1) * Number(rev[i]);
      return sum % 10;
    }
    function pcExtractCAS(synonyms) {
      for (var i = 0; i < (synonyms || []).length; i++) {
        var m = /^(\d{2,7})-(\d{2})-(\d)$/.exec(String(synonyms[i]).trim());
        if (m && pcCasCheck(m[1] + m[2]) === Number(m[3])) return m[0];
      }
      return null;
    }

    // ---------- Monomer reconstruction (validated rule chain) ----------
    // When a drawing has no library match, reconstruct the most plausible
    // monomer so PubChem can NAME the polymer, instead of naming an H-capped
    // fragment (polyethylene's unit caps to "ethane"). Rules, in priority
    // order, each validated against the whole library plus adversarial cases:
    //   V vinyl: ends on adjacent atoms -> double that bond (styrene). Guarded
    //     to C-C/C-O/C-N/C-S pairs (never Si=O for a siloxane) outside rings.
    //   D diene: ends 3 bonds apart across C-C=C-C -> shift to C=C-C=C
    //     (butadiene). Ring atoms excluded so poly(p-phenylene) can't misfire.
    //   R ring-opening: ends 3-7 atoms apart, one end C and the other O/N/S,
    //     no ring atoms on the path -> close the ring (caprolactone, lactide).
    //     3-rings with an acyl end (alpha-lactone) or an N-acyl heteroatom
    //     (2-oxazoline backbones) are refused - both would name confidently
    //     wrong monomers.
    //   S condensation: an acyl end plus a heteroatom end -> hydrolytically
    //     cut every internal ester/amide linkage, cap acyls with OH, and
    //     report the co-monomer pieces (PET -> ethylene glycol + terephthalic
    //     acid). The condensate note stays honest: "with loss of water".
    //   Fragment: everything else (PPS, PEEK, siloxanes) - any rule that
    //     named these would name them wrongly.
    var RECON_HETERO = { O: 1, N: 1, S: 1 };
    var RECON_MAXVAL = { C: 4, N: 3, O: 2, S: 2, Si: 4, P: 3, F: 1, Cl: 1, Br: 1, I: 1 };
    var RECON_DBL_OK = { 'C|C': 1, 'C|O': 1, 'C|N': 1, 'C|S': 1 };

    function reconPrep(sub) {
      var stars = sub.atoms.filter(function (a) { return a.el === '*'; });
      if (stars.length !== 2) return null;
      var starId = {}; stars.forEach(function (s) { starId[s.id] = true; });
      var atoms = sub.atoms.filter(function (a) { return !starId[a.id]; })
        .map(function (a) { return { id: a.id, el: a.el, charge: a.charge }; });
      var bonds = sub.bonds.filter(function (b) { return !starId[b.a] && !starId[b.b]; })
        .map(function (b) { return { a: b.a, b: b.b, order: b.order || 1 }; });
      var nbrOfStar = {};
      sub.bonds.forEach(function (b) {
        if (starId[b.a] && !starId[b.b]) nbrOfStar[b.a] = b.b;
        else if (starId[b.b] && !starId[b.a]) nbrOfStar[b.b] = b.a;
      });
      var n0 = nbrOfStar[stars[0].id], n1 = nbrOfStar[stars[1].id];
      if (n0 == null || n1 == null) return null;
      var el = {}, adj = {}, valSum = {};
      atoms.forEach(function (a) { el[a.id] = a.el; adj[a.id] = []; valSum[a.id] = 0; });
      bonds.forEach(function (b) {
        adj[b.a].push({ to: b.b, bond: b }); adj[b.b].push({ to: b.a, bond: b });
        valSum[b.a] += b.order; valSum[b.b] += b.order;
      });
      return { atoms: atoms, bonds: bonds, n0: n0, n1: n1, el: el, adj: adj, valSum: valSum };
    }
    function reconPath(g, from, to) {
      var prev = {}, q = [from];
      prev[from] = null;
      while (q.length) {
        var cur = q.shift();
        if (cur === to) break;
        g.adj[cur].forEach(function (e) { if (!(e.to in prev)) { prev[e.to] = cur; q.push(e.to); } });
      }
      if (!(to in prev)) return null;
      var path = [], c = to;
      while (c != null) { path.unshift(c); c = prev[c]; }
      return path;
    }
    function reconBond(g, x, y) {
      for (var i = 0; i < g.adj[x].length; i++) if (g.adj[x][i].to === y) return g.adj[x][i].bond;
      return null;
    }
    function reconInRing(g, bond) {
      var seen = {}, q = [bond.a];
      seen[bond.a] = 1;
      while (q.length) {
        var cur = q.shift();
        for (var i = 0; i < g.adj[cur].length; i++) {
          var e = g.adj[cur][i];
          if (e.bond === bond) continue;
          if (e.to === bond.b) return true;
          if (!seen[e.to]) { seen[e.to] = 1; q.push(e.to); }
        }
      }
      return false;
    }
    function reconRingAtoms(g) {
      var set = {};
      g.bonds.forEach(function (b) { if (reconInRing(g, b)) { set[b.a] = 1; set[b.b] = 1; } });
      return set;
    }
    function reconCanAdd(g, id, n) {
      var m = RECON_MAXVAL[g.el[id]];
      return m != null && g.valSum[id] + n <= m;
    }
    function reconIsAcyl(g, c) {
      return g.el[c] === 'C' && g.adj[c].some(function (e) { return e.bond.order === 2 && g.el[e.to] === 'O'; });
    }
    function reconVinyl(g) {
      if (g.n0 === g.n1) return null;
      var bb = reconBond(g, g.n0, g.n1);
      if (!bb || bb.order !== 1) return null;
      var pair = [g.el[g.n0], g.el[g.n1]].sort().join('|');
      if (!RECON_DBL_OK[pair]) return null;
      if (reconInRing(g, bb)) return null;
      if (!reconCanAdd(g, g.n0, 1) || !reconCanAdd(g, g.n1, 1)) return null;
      return { kind: 'vinyl', atoms: g.atoms,
        bonds: g.bonds.map(function (b) { return b === bb ? { a: b.a, b: b.b, order: 2 } : { a: b.a, b: b.b, order: b.order }; }) };
    }
    function reconDiene(g) {
      if (g.n0 === g.n1) return null;
      var path = reconPath(g, g.n0, g.n1);
      if (!path || path.length !== 4) return null;
      for (var i = 0; i < 4; i++) if (g.el[path[i]] !== 'C') return null;
      var b1 = reconBond(g, path[0], path[1]), b2 = reconBond(g, path[1], path[2]), b3 = reconBond(g, path[2], path[3]);
      if (b1.order !== 1 || b2.order !== 2 || b3.order !== 1) return null;
      var rings = reconRingAtoms(g);
      for (var j = 0; j < 4; j++) if (rings[path[j]]) return null;
      if (!reconCanAdd(g, path[0], 1) || !reconCanAdd(g, path[3], 1)) return null;
      var bonds = g.bonds.map(function (x) { return { a: x.a, b: x.b, order: x.order }; });
      bonds[g.bonds.indexOf(b1)].order = 2;
      bonds[g.bonds.indexOf(b2)].order = 1;
      bonds[g.bonds.indexOf(b3)].order = 2;
      return { kind: 'diene', atoms: g.atoms, bonds: bonds };
    }
    function reconRing(g) {
      if (g.n0 === g.n1 || reconBond(g, g.n0, g.n1)) return null;
      var path = reconPath(g, g.n0, g.n1);
      if (!path) return null;
      var size = path.length;
      if (size < 3 || size > 7) return null;    // past 7 the closure names wrong macrocycles
      var rings = reconRingAtoms(g);
      for (var i = 0; i < path.length; i++) if (rings[path[i]]) return null;
      var e0 = g.el[g.n0], e1 = g.el[g.n1];
      var het = (RECON_HETERO[e0] ? 1 : 0) + (RECON_HETERO[e1] ? 1 : 0);
      if (het !== 1 || !(e0 === 'C' || e1 === 'C')) return null;
      if (!reconCanAdd(g, g.n0, 1) || !reconCanAdd(g, g.n1, 1)) return null;
      if (size === 3 && (reconIsAcyl(g, g.n0) || reconIsAcyl(g, g.n1))) return null;
      if (size === 3) {
        var hetEnd = RECON_HETERO[e0] ? g.n0 : g.n1;
        if (g.adj[hetEnd].some(function (e) { return reconIsAcyl(g, e.to); })) return null;
      }
      return { kind: 'ring', atoms: g.atoms,
        bonds: g.bonds.map(function (x) { return { a: x.a, b: x.b, order: x.order }; }).concat([{ a: g.n0, b: g.n1, order: 1 }]) };
    }
    function reconStep(g) {
      var endAcyl = reconIsAcyl(g, g.n0) ? g.n0 : (reconIsAcyl(g, g.n1) ? g.n1 : null);
      var endHet = RECON_HETERO[g.el[g.n0]] ? g.n0 : (RECON_HETERO[g.el[g.n1]] ? g.n1 : null);
      if (endAcyl == null || endHet == null || endAcyl === endHet) return null;
      var cuts = [];
      g.bonds.forEach(function (bd) {
        if (bd.order !== 1) return;
        var pairs = [[bd.a, bd.b], [bd.b, bd.a]];
        for (var i = 0; i < 2; i++) {
          var c = pairs[i][0], h = pairs[i][1];
          if (reconIsAcyl(g, c) && RECON_HETERO[g.el[h]] && !reconIsAcyl(g, h)) { cuts.push({ bond: bd, acyl: c }); return; }
        }
      });
      var cutSet = {};
      cuts.forEach(function (c) { cutSet[g.bonds.indexOf(c.bond)] = 1; });
      var atoms = g.atoms.map(function (a) { return { id: a.id, el: a.el, charge: a.charge }; });
      var bonds = g.bonds.filter(function (b, i) { return !cutSet[i]; })
        .map(function (b) { return { a: b.a, b: b.b, order: b.order }; });
      var n = 0;
      cuts.forEach(function (c) { var o = '_oh' + (n++); atoms.push({ id: o, el: 'O' }); bonds.push({ a: c.acyl, b: o, order: 1 }); });
      var oEnd = '_oh' + (n++); atoms.push({ id: oEnd, el: 'O' }); bonds.push({ a: endAcyl, b: oEnd, order: 1 });
      var adj = {}; atoms.forEach(function (a) { adj[a.id] = []; });
      bonds.forEach(function (b) { adj[b.a].push(b.b); adj[b.b].push(b.a); });
      var seen = {}, pieces = [];
      atoms.forEach(function (a) {
        if (seen[a.id]) return;
        var comp = {}, q = [a.id];
        seen[a.id] = 1; comp[a.id] = 1;
        while (q.length) {
          var c = q.shift();
          adj[c].forEach(function (t) { if (!seen[t]) { seen[t] = 1; comp[t] = 1; q.push(t); } });
        }
        pieces.push({
          atoms: atoms.filter(function (x) { return comp[x.id]; }),
          bonds: bonds.filter(function (x) { return comp[x.a] && comp[x.b]; })
        });
      });
      return { kind: pieces.length > 1 ? 'comonomers' : 'condensation', pieces: pieces };
    }
    function reconstructMonomer(sub) {
      var g = reconPrep(sub);
      if (!g) return null;
      return reconVinyl(g) || reconDiene(g) || reconRing(g) || reconStep(g) ||
        { kind: 'fragment', atoms: g.atoms, bonds: g.bonds };
    }

    // ---------- External identification via PubChem ----------
    var identifyToken = 0;
    function smilesOf(RDKit, atomList, bondList) {
      var ex = expandSuperatoms(atomList, bondList);
      var mol = molFrom(RDKit, molblockFrom(ex.atoms, ex.bonds));
      if (!mol) return null;
      var s = null;
      try { s = mol.get_smiles(); } catch (e) {}
      mol.delete();
      return s;
    }
    function pcLookupSmiles(smiles) {
      return pcFetch('https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/property/Title,IUPACName/JSON',
        { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'smiles=' + encodeURIComponent(smiles) })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          var p = data && data.PropertyTable && data.PropertyTable.Properties && data.PropertyTable.Properties[0];
          return (p && p.CID) ? { cid: p.CID, title: p.Title || p.IUPACName || ('CID ' + p.CID) } : null;
        });
    }
    function pcSynonyms(cid) {
      return pcFetch('https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/' + cid + '/synonyms/JSON')
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          var info = data && data.InformationList && data.InformationList.Information && data.InformationList.Information[0];
          return (info && info.Synonym) || [];
        });
    }
    function pcLink(cid, label) {
      return '<a href="https://pubchem.ncbi.nlm.nih.gov/compound/' + cid + '" target="_blank" rel="noopener noreferrer"><strong>' + escapeHtml(label) + '</strong></a>';
    }
    function liftPublications(el) {
      // Sit the publications right under the identification, ahead of the
      // weak "closest in library" cards, so the search visibly continues
      // into the papers for the identified polymer.
      var pubEl = document.getElementById('mol-publications');
      if (pubEl && el.nextSibling !== pubEl) el.parentNode.insertBefore(pubEl, el.nextSibling);
    }

    function identifyExternally(sub, RDKit) {
      var el = document.getElementById('mol-identify');
      var myToken = ++identifyToken;
      var recon = reconstructMonomer(sub);
      if (!el || !recon) { renderPublications(null); return; }

      el.hidden = false;
      el.innerHTML = '<div class="mol-id-body guide-note">Identifying this structure in PubChem&hellip;</div>';
      var HEAD = '<div class="mol-id-head">Not in the reference library &mdash; identified by structure</div>';

      // Condensation family: name each hydrolysis piece (deduped), report the
      // co-monomer pair. Titles here are already common names, so the synonym
      // pass is skipped to stay inside PubChem's rate budget.
      if (recon.kind === 'comonomers' || recon.kind === 'condensation') {
        var smilesList = [], seenSmi = {};
        for (var i = 0; i < recon.pieces.length; i++) {
          var s = smilesOf(RDKit, recon.pieces[i].atoms, recon.pieces[i].bonds);
          if (!s) { showNoId(el, ''); renderPublications(null); return; }
          if (!seenSmi[s]) { seenSmi[s] = 1; smilesList.push(s); }
        }
        Promise.all(smilesList.map(pcLookupSmiles)).then(function (hits) {
          if (myToken !== identifyToken) return;
          hits = hits.filter(function (h) { return h; });
          if (!hits.length) { showNoId(el, smilesList[0]); renderPublications(null); return; }
          var names = hits.map(function (h) { return pcPrettyCase(h.title); });
          var links = hits.map(function (h, j) { return pcLink(h.cid, names[j]); });
          liftPublications(el);
          el.innerHTML = HEAD + '<div class="mol-id-body">This repeat unit is consistent with a condensation polymer of ' +
            links.join(' and ') + ' (with loss of water or another condensate). Publications below cover polymers of ' +
            (names.length > 1 ? 'this pair' : 'this monomer') + '.</div>';
          renderPublications({ name: 'polymers of ' + names.join(' + '), aka: [], queryTerms: names });
        }).catch(function () {
          if (myToken !== identifyToken) return;
          showNoId(el, smilesList[0] || '');
          renderPublications(null);
        });
        return;
      }

      // Single-structure kinds: look up the reconstruction, then refine with
      // the synonym list (short common name + CAS) before naming the polymer.
      var smiles = smilesOf(RDKit, recon.atoms, recon.bonds);
      if (!smiles) { el.hidden = true; el.innerHTML = ''; renderPublications(null); return; }
      var MECH = {
        vinyl: 'The monomer of this repeat unit is ',
        diene: 'This repeat unit is consistent with 1,4-polymerization of the diene ',
        ring: 'This repeat unit is consistent with ring-opening polymerization of ',
        fragment: 'The closest compound in PubChem is '
      };
      pcLookupSmiles(smiles).then(function (hit) {
        if (myToken !== identifyToken) return;
        if (!hit) { showNoId(el, smiles); renderPublications(null); return; }
        if (recon.kind === 'fragment') {
          liftPublications(el);
          el.innerHTML = HEAD + '<div class="mol-id-body">' + MECH.fragment + pcLink(hit.cid, pcPrettyCase(hit.title)) +
            ' (CID ' + hit.cid + '). The linkage chemistry of this backbone can&rsquo;t be reduced to one monomer automatically.</div>';
          renderPublications({ name: pcPrettyCase(hit.title), aka: [] });
          return;
        }
        pcSynonyms(hit.cid).then(function (syn) {
          if (myToken !== identifyToken) return;
          var common = pcPickCommonName(syn, hit.title) || pcPrettyCase(hit.title);
          var cas = pcExtractCAS(syn);
          var polyName = 'poly(' + common.toLowerCase() + ')';
          liftPublications(el);
          el.innerHTML = HEAD + '<div class="mol-id-body">' + MECH[recon.kind] + pcLink(hit.cid, common) +
            (cas ? ' (CAS ' + escapeHtml(cas) + ')' : ' (CID ' + hit.cid + ')') +
            ', so the polymer is likely <strong>' + escapeHtml(polyName) + '</strong>. Publications below are for that polymer.</div>';
          renderPublications({ name: polyName, aka: [common], queryTerms: [polyName, common] });
        }).catch(function () {
          if (myToken !== identifyToken) return;
          var polyName = 'poly(' + hit.title.toLowerCase() + ')';
          liftPublications(el);
          el.innerHTML = HEAD + '<div class="mol-id-body">' + MECH[recon.kind] + pcLink(hit.cid, pcPrettyCase(hit.title)) +
            ' (CID ' + hit.cid + '), so the polymer is likely <strong>' + escapeHtml(polyName) + '</strong>.</div>';
          renderPublications({ name: polyName, aka: [hit.title] });
        });
      }).catch(function () {
        if (myToken !== identifyToken) return;
        showNoId(el, smiles);
        renderPublications(null);
      });
    }
    function showNoId(el, smiles) {
      el.hidden = false;
      el.innerHTML = '<div class="mol-id-head">Not in the reference library</div>' +
        '<div class="mol-id-body">Couldn’t name this structure automatically. Look it up by structure on ' +
        '<a href="https://pubchem.ncbi.nlm.nih.gov/#query=' + encodeURIComponent(smiles) +
        '" target="_blank" rel="noopener noreferrer">PubChem</a>.</div>';
    }

    function runStructureSearch() {
      var statusEl = document.getElementById('mol-status');
      if (!statusEl) return;
      // Explicit "*" attachment points define the repeat unit's ends more
      // directly than a drawn box, so when the drawing has exactly two of them
      // (a loaded or recognized repeat unit) search from those and ignore any
      // cosmetic bracket. Otherwise a hand-drawn bracket marks the unit.
      // Two or more brackets means a copolymer: identify each bracketed block
      // separately and report the combination.
      if (brackets.length >= 2) { runCopolymerSearch(); return; }

      var sub;
      if (atoms.filter(function (a) { return a.el === '*'; }).length === 2) {
        sub = extractFromStars();
      } else if (brackets.length === 1) {
        sub = extractRepeatUnit(brackets[0]);
      } else {
        statusEl.textContent = 'Draw a repeat unit, then use the Bracket tool to mark it before searching.';
        renderResults([]);
        return;
      }
      searchSub(sub);
    }

    // Match one extracted repeat unit (exactly two open ends) against the
    // library, then fall back to similarity + external identification. Shared by
    // the single-unit search and the homopolymer case of the copolymer search.
    function searchSub(sub) {
      var statusEl = document.getElementById('mol-status');
      if (!statusEl) return;
      if (sub.atomCount === 0) {
        statusEl.textContent = 'No atoms found inside the bracket. Drag the bracket over your repeat unit backbone.';
        renderResults([]);
        return;
      }
      if (sub.boundaryCount !== 2) {
        statusEl.textContent = sub.boundaryCount === 0
          ? 'This looks like a closed structure with no open chain ends inside the bracket. This tool matches linear repeat units with two open ends.'
          : 'Found ' + sub.boundaryCount + ' open chain ends inside the bracket; a linear repeat unit has exactly two. If a side group (an ester or alkyl chain) is sticking out past the bracket, enlarge the box to enclose the whole repeat unit. Genuinely branched or crosslinked structures aren’t matched yet.';
        renderResults([]);
        return;
      }
      // Match on the closed-graph hash so the SAME polymer matches no matter
      // where the user cut the repeat unit (*-CH2-S-S-CH2-* and
      // *-CH2-CH2-S-S-* are one polymer, two framings; before this, 186 of
      // the library's 253 possible reframings failed to exact-match). The
      // open-graph hash stays as the fallback for anything closeRepeatUnit
      // can't interpret, which preserves the old behavior exactly there.
      var qClosed = closedHash(sub.atoms, sub.bonds);
      var qOpen = wlHash(sub.atoms, sub.bonds);
      var db = window.POLYMER_DB || [];
      var exact = db.filter(function (p) {
        var f = fingerprintOf(p);
        return qClosed != null ? f._chash === qClosed : f._hash === qOpen;
      });
      if (exact.length) {
        statusEl.textContent = 'Exact match found:';
        renderResults(exact);
        renderPublications(exact[0]);
        return;
      }

      // The old element-composition ranking, kept as the fallback when the
      // matching engine can't load (first visit offline, blocked wasm).
      function compositionFallback(message) {
        var profile = elementProfile(sub.atoms);
        var ranked = db.filter(function (p) { return p.type !== 'copolymer' && p.atoms; }).map(function (p) {
          return { p: p, d: profileDistance(profile, fingerprintOf(p)._profile) };
        }).sort(function (x, y) { return x.d - y.d; }).slice(0, 5).map(function (r) { return r.p; });
        statusEl.textContent = message;
        renderResults(ranked);
        renderPublications(ranked[0]);
      }

      statusEl.textContent = rdkitPromise
        ? 'No instant match. Comparing structures…'
        : 'No instant match. Loading the structure-matching engine (about 7 MB, one time; it stays cached)…';
      ensureRDKit().then(function (RDKit) {
        var ex = expandSuperatoms(sub.atoms, sub.bonds);
        var mol = molFrom(RDKit, molblockFrom(ex.atoms, ex.bonds));
        if (!mol) {
          compositionFallback('The drawing could not be interpreted as a molecule. Closest by composition:');
          return;
        }
        var smiles = null, fp = null;
        try { smiles = mol.get_smiles(); } catch (e) {}
        mol.delete();
        // Fingerprint the capped (star-stripped) form, matching how the
        // library fingerprints are computed in prepRdkitLibrary.
        var exStripped = stripStars(ex.atoms, ex.bonds);
        var molCapped = molFrom(RDKit, molblockFrom(exStripped.atoms, exStripped.bonds));
        if (molCapped) {
          try { fp = molCapped.get_morgan_fp(FP_OPTS); } catch (e1) {}
          molCapped.delete();
        }
        if (!smiles || !fp) {
          compositionFallback('The drawing could not be interpreted as a molecule. Closest by composition:');
          return;
        }
        var lib = prepRdkitLibrary(RDKit);
        var identical = lib.filter(function (e) { return e.smiles === smiles; });
        if (identical.length) {
          statusEl.textContent = 'Exact match found:';
          renderResults(identical.map(function (e) { return e.p; }));
          renderPublications(identical[0].p);
          return;
        }
        var ranked = lib.map(function (e) {
          return { p: e.p, sim: tanimoto(fp, e.fp) };
        }).sort(function (x, y) { return y.sim - x.sim; }).slice(0, 5);
        statusEl.textContent = 'No exact match in the reference library. Closest structures by similarity:';
        renderRanked(ranked);
        // Not in the library: name it from its structure via PubChem and search
        // publications on that, instead of on the weakly-similar local match.
        identifyExternally(sub, RDKit);
      }).catch(function () {
        compositionFallback('The structure-matching engine could not load. Closest by element composition:');
      });
    }

    // ---------- Copolymer search (two or more bracketed blocks) ----------
    // Each bracket is one repeat unit; identify each block with the same
    // machinery a homopolymer uses, then report the combination and drive
    // publications on the monomer pair.
    function canonName(s) { return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
    function joinNames(arr) {
      if (arr.length <= 1) return arr[0] || '';
      if (arr.length === 2) return arr[0] + ' and ' + arr[1];
      return arr.slice(0, -1).join(', ') + ', and ' + arr[arr.length - 1];
    }

    // A named copolymer in the library (type:'copolymer', components:[names])
    // matches when its listed components line up one-to-one with the identified
    // blocks (by each block's name/aka/monomer). Surfaces SBR from PS + PBd, etc.
    function matchNamedCopolymer(parts) {
      var db = window.POLYMER_DB || [];
      // Every drawn block must be identified, or we can't claim a specific named
      // copolymer: an unnamed block could be the piece that makes it a different
      // material (a PS+PBd+? terpolymer is not SBR).
      if (parts.length < 2 || parts.some(function (p) { return !p.name; })) return null;
      var blockIds = parts.map(function (p) {
        var ids = [canonName(p.name)];
        if (p.entry) {
          (p.entry.aka || []).forEach(function (a) { ids.push(canonName(a)); });
          if (p.entry.monomer) ids.push(canonName(p.entry.monomer));
        }
        return ids;
      });
      var co = db.filter(function (p) { return p.type === 'copolymer' && p.components && p.components.length; });
      for (var i = 0; i < co.length; i++) {
        var comps = co[i].components.map(canonName);
        if (comps.length !== blockIds.length) continue;
        var used = {}, ok = true;
        for (var c = 0; c < comps.length; c++) {
          var m = -1;
          for (var b = 0; b < blockIds.length; b++) {
            if (!used[b] && blockIds[b].indexOf(comps[c]) !== -1) { m = b; break; }
          }
          if (m === -1) { ok = false; break; }
          used[m] = true;
        }
        if (ok) return co[i];
      }
      return null;
    }

    // Name one unknown block via reconstruction + PubChem (a lean version of
    // identifyExternally that returns a name instead of rendering).
    function nameBlockExternally(block, RDKit) {
      var recon = reconstructMonomer(block);
      if (!recon) return Promise.resolve(null);
      var a, b;
      if ((recon.kind === 'comonomers' || recon.kind === 'condensation') && recon.pieces && recon.pieces.length) {
        a = recon.pieces[0].atoms; b = recon.pieces[0].bonds;
      } else { a = recon.atoms; b = recon.bonds; }
      if (!a) return Promise.resolve(null);
      var smiles = smilesOf(RDKit, a, b);
      if (!smiles) return Promise.resolve(null);
      return pcLookupSmiles(smiles).then(function (hit) {
        if (!hit) return null;
        if (recon.kind === 'fragment') return { name: pcPrettyCase(hit.title), cid: hit.cid };
        return pcSynonyms(hit.cid).then(function (syn) {
          var common = pcPickCommonName(syn, hit.title) || pcPrettyCase(hit.title);
          return { name: 'poly(' + common.toLowerCase() + ')', cid: hit.cid };
        }).catch(function () { return { name: 'poly(' + String(hit.title).toLowerCase() + ')', cid: hit.cid }; });
      }).catch(function () { return null; });
    }

    function runCopolymerSearch() {
      var statusEl = document.getElementById('mol-status');
      if (!statusEl) return;
      var blocks = brackets.map(function (r, i) {
        return extractRepeatUnit(r, brackets.filter(function (_, j) { return j !== i; }));
      });
      for (var i = 0; i < blocks.length; i++) {
        if (blocks[i].atomCount === 0) {
          statusEl.textContent = 'Bracket ' + (i + 1) + ' is empty. Drag each bracket over one repeat-unit backbone.';
          renderResults([]); return;
        }
        if (blocks[i].boundaryCount !== 2) {
          statusEl.textContent = 'Bracket ' + (i + 1) + ' encloses ' + blocks[i].boundaryCount + ' open chain ends; each block must be a linear repeat unit with exactly two. Enclose the whole repeat unit (side groups included) in each bracket.';
          renderResults([]); return;
        }
      }
      var db = window.POLYMER_DB || [];
      var ided = blocks.map(function (block) {
        var qc = closedHash(block.atoms, block.bonds);
        var qo = wlHash(block.atoms, block.bonds);
        var hit = db.filter(function (p) {
          if (p.type === 'copolymer' || !p.atoms) return false;
          var f = fingerprintOf(p);
          return qc != null ? f._chash === qc : f._hash === qo;
        })[0];
        return { block: block, key: (qc != null ? 'c' + qc : 'o' + qo), entry: hit || null };
      });
      // Collapse identical blocks (PS-b-PS-b-PEG becomes PS + PEG).
      var order = [], byKey = {};
      ided.forEach(function (r) {
        if (!byKey[r.key]) { byKey[r.key] = { key: r.key, entry: r.entry, block: r.block, count: 0 }; order.push(byKey[r.key]); }
        byKey[r.key].count++;
      });
      if (order.length < 2) {
        statusEl.textContent = 'All brackets enclose the same repeat unit, so this is a homopolymer. Searching that unit:';
        searchSub(order[0].block);
        return;
      }
      function toPart(o, nm) {
        return { name: nm ? nm.name : (o.entry ? o.entry.name : null), entry: o.entry, cid: nm ? nm.cid : null, count: o.count };
      }
      if (order.every(function (o) { return o.entry; })) {
        renderCopolymer(order.map(function (o) { return toPart(o, null); }));
        return;
      }
      statusEl.textContent = rdkitPromise ? 'Identifying each block…'
        : 'Loading the structure-matching engine (about 7 MB, one time; it stays cached)…';
      ensureRDKit().then(function (RDKit) {
        return Promise.all(order.map(function (o) {
          if (o.entry) return Promise.resolve(toPart(o, null));
          return nameBlockExternally(o.block, RDKit).then(function (nm) { return toPart(o, nm); });
        }));
      }).then(function (parts) {
        renderCopolymer(parts);
      }).catch(function () {
        renderCopolymer(order.map(function (o) { return toPart(o, null); }));
      });
    }

    function renderCopolymer(parts) {
      var statusEl = document.getElementById('mol-status');
      var resultsEl = document.getElementById('mol-results');
      if (!resultsEl) return;
      var idEl = document.getElementById('mol-identify');
      if (idEl) { idEl.hidden = true; idEl.innerHTML = ''; }

      var known = parts.filter(function (p) { return p.name; });
      var names = known.map(function (p) { return p.name; });
      var unknownCount = parts.length - known.length;
      var named = matchNamedCopolymer(parts);

      if (statusEl) {
        statusEl.textContent = named ? 'Copolymer identified: ' + named.name
          : (names.length ? 'Copolymer of ' + joinNames(names) + (unknownCount ? ' (plus ' + unknownCount + ' unidentified)' : '') + ':'
                          : 'Could not identify the blocks of this copolymer.');
      }

      var blockList = parts.map(function (p, i) {
        var s = BLOCK_SUBSCRIPTS[i] || String(i + 1);
        return escapeHtml(p.name || 'unidentified') + ' <span style="color:var(--text-dim);">[' + s + (p.count > 1 ? '] &times;' + p.count : ']') + '</span>';
      }).join(' &nbsp;&middot;&nbsp; ');

      var summary = '<div class="mol-result-card" style="border-left:3px solid var(--primary);">' +
        '<div class="mol-result-name">' + (named ? escapeHtml(named.name) : 'Copolymer') + '</div>' +
        (named && named.aka && named.aka.length ? '<div class="mol-result-aka">' + escapeHtml(named.aka.join(', ')) + '</div>' : '') +
        '<div class="mol-result-meta">' + (named && named.cls ? escapeHtml(named.cls) + ' &middot; ' : '') + 'blocks: ' + blockList + '</div>' +
        (named && named.note ? '<div class="mol-result-note">' + escapeHtml(named.note) + '</div>' : '') +
        '<div class="mol-result-note" style="color:var(--text-dim);">A structure shows which repeat units are present, not the chain architecture (block, random, gradient, or graft). Publications below cover this monomer combination.</div>' +
        '</div>';

      var blockCards = parts.map(function (p) {
        if (p.entry) return polymerCard(p.entry);
        if (p.name) return '<div class="mol-result-card"><div class="mol-result-name">' + escapeHtml(p.name) + '</div>' +
          '<div class="mol-result-meta">identified by structure' + (p.cid ? ' &middot; PubChem CID ' + p.cid : '') + '</div>' +
          publicationLinks({ name: p.name }) + '</div>';
        return '<div class="mol-result-card"><div class="mol-result-name">Unidentified block</div>' +
          '<div class="mol-result-meta">This repeat unit could not be matched or named. Enclose the whole unit, or search it on its own.</div></div>';
      }).join('');

      resultsEl.innerHTML = summary + blockCards;

      var pubEl = document.getElementById('mol-publications');
      if (pubEl && resultsEl.nextSibling !== pubEl) resultsEl.parentNode.insertBefore(pubEl, resultsEl.nextSibling);
      if (!names.length) { renderPublications(null); return; }
      var queryTerms = named ? [named.name].concat((named.aka || []).slice(0, 2))
                             : [names.join(' ') + ' copolymer'];
      renderPublications({ name: named ? named.name : ('copolymer of ' + joinNames(names)),
                           aka: named ? (named.aka || []) : [], queryTerms: queryTerms });
    }

    // After an explicit search action, bring the Results card into view if it
    // sits below the fold (common on phones, where the editor fills the screen).
    // Name-search typing intentionally doesn't trigger this - scrolling on
    // every keystroke would fight the user.
    function scrollResultsIntoView() {
      var statusEl = document.getElementById('mol-status');
      var card = statusEl && statusEl.closest('.card');
      if (!card) return;
      var rect = card.getBoundingClientRect();
      if (rect.top > window.innerHeight - 120) {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    var searchBtn = document.getElementById('mol-search-structure');
    if (searchBtn) searchBtn.addEventListener('click', function () {
      runStructureSearch();
      scrollResultsIntoView();
    });

    // ---------- Substructure ("contains this fragment") search ----------
    // A different question from repeat-unit matching: which library polymers
    // CONTAIN the drawn motif (an ester linkage, a phenyl ring, a fluorinated
    // backbone)? Any drawing works - no bracket or chain ends required.
    // The query routes molblock -> get_mol -> get_smarts -> get_qmol. Feeding
    // the molblock straight to get_qmol would skip aromaticity perception, so
    // a hand-drawn benzene would match none of the aromatic polymers; and
    // get_smiles-derived SMARTS means aliphatic-only carbon, silently dropping
    // aryl esters. get_smarts emits [#6], which matches both. Chain-end "*"
    // atoms and explicit H are stripped from the query (containment shouldn't
    // care about drawn chain ends), while the library targets KEEP their
    // dummies, which act as repeat-unit boundary walls.
    function runSubstructureSearch() {
      var statusEl = document.getElementById('mol-status');
      if (!statusEl) return;
      if (!atoms.length) {
        statusEl.textContent = 'Draw a fragment first - an ester linkage, a ring, any motif. No bracket needed.';
        renderResults([]);
        return;
      }
      statusEl.textContent = rdkitPromise ? 'Searching for polymers containing this fragment…'
        : 'Loading the structure-matching engine (about 7 MB, one time; it stays cached)…';
      ensureRDKit().then(function (RDKit) {
        var ex = expandSuperatoms(atoms, bonds);
        var st = stripStars(ex.atoms, ex.bonds);
        var hIds = {};
        st.atoms.forEach(function (a) { if (a.el === 'H') hIds[a.id] = 1; });
        var frag = {
          atoms: st.atoms.filter(function (a) { return !hIds[a.id]; }),
          bonds: st.bonds.filter(function (b) { return !hIds[b.a] && !hIds[b.b]; })
        };
        if (!frag.atoms.length) {
          statusEl.textContent = 'Nothing left to match once chain ends are removed - draw the fragment itself.';
          renderResults([]);
          return;
        }
        var mol = molFrom(RDKit, molblockFrom(frag.atoms, frag.bonds));
        if (!mol) {
          statusEl.textContent = 'The fragment could not be interpreted as chemistry. Check valences and try again.';
          renderResults([]);
          return;
        }
        var smarts = null, qfp = null;
        try { smarts = mol.get_smarts(); } catch (e) {}
        try { qfp = mol.get_morgan_fp(FP_OPTS); } catch (e1) {}
        mol.delete();
        var qmol = null;
        if (smarts) { try { qmol = RDKit.get_qmol(smarts); } catch (e2) {} }
        if (!qmol) {
          statusEl.textContent = 'The fragment could not be converted to a search pattern.';
          renderResults([]);
          return;
        }
        var disconnected = smarts.indexOf('.') !== -1;
        var lib = prepRdkitLibrary(RDKit);
        var qHeavy = frag.atoms.length;
        var hits = [];
        lib.forEach(function (e) {
          if (!e.mol) return;
          var parsed = null;
          try { parsed = JSON.parse(e.mol.get_substruct_matches(qmol)); } catch (e3) {}
          // RDKit returns '{}' (not '[]') on no match - only an array is a hit
          var arr = Array.isArray(parsed) ? parsed : [];
          if (!arr.length) return;
          var tHeavy = e.p.atoms.filter(function (a) { return a.el !== '*'; }).length;
          hits.push({ p: e.p, count: arr.length, cov: tHeavy ? Math.min(1, qHeavy / tHeavy) : 0, sim: (qfp && e.fp) ? tanimoto(qfp, e.fp) : 0 });
        });
        qmol.delete();
        // Coverage first (the fragment is most OF these polymers), similarity
        // breaks ties. All hits render - a fragment search legitimately
        // returns dozens, and truncating would misreport the set.
        hits.sort(function (x, y) { return (y.cov - x.cov) || (y.sim - x.sim); });
        statusEl.textContent = hits.length
          ? (hits.length + ' of ' + lib.length + ' library polymers contain this fragment' +
            (disconnected ? ' (the drawing has disconnected pieces; each matched independently)' : '') + ':')
          : ('No library polymer contains this fragment.' + (disconnected ? ' Note: the drawing has disconnected pieces.' : ''));
        renderSubstructHits(hits);
      }).catch(function () {
        statusEl.textContent = 'The structure-matching engine could not load. Check your connection and try again.';
        renderResults([]);
      });
    }
    function renderSubstructHits(hits) {
      var resultsEl = document.getElementById('mol-results');
      if (!resultsEl) return;
      var idEl = document.getElementById('mol-identify');
      if (idEl) { idEl.hidden = true; idEl.innerHTML = ''; }
      var pubEl = document.getElementById('mol-publications');
      if (pubEl && resultsEl.nextSibling !== pubEl) resultsEl.parentNode.insertBefore(pubEl, resultsEl.nextSibling);
      renderPublications(null);
      resultsEl.innerHTML = hits.map(function (h) {
        return '<div class="mol-sim-item">' +
          '<div style="font-size:0.8rem;color:var(--text-dim);margin:10px 0 2px;">appears ' + h.count +
          (h.count === 1 ? ' time' : ' times') + ' &middot; fragment is ' + Math.round(h.cov * 100) + '% of the repeat unit</div>' +
          polymerCard(h.p) + '</div>';
      }).join('');
    }
    var subBtn = document.getElementById('mol-search-substruct');
    if (subBtn) subBtn.addEventListener('click', function () {
      runSubstructureSearch();
      scrollResultsIntoView();
    });

    // Recent name searches, shown as one-click chips under the search box.
    // A query is remembered once it has sat unchanged for a moment with at
    // least one match, so half-typed prefixes don't pollute the list.
    var RECENT_KEY = 'polytechniques_recent_searches';
    var recentTimer = null;
    function getRecent() {
      try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch (e) { return []; }
    }
    function saveRecent(q) {
      var list = getRecent().filter(function (r) { return r.toLowerCase() !== q.toLowerCase(); });
      list.unshift(q);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 5))); } catch (e) {}
      renderRecent();
    }
    function renderRecent() {
      var wrap = document.getElementById('mol-recent');
      if (!wrap) return;
      var list = getRecent();
      if (!list.length) { wrap.hidden = true; return; }
      wrap.hidden = false;
      wrap.innerHTML = '<span class="mol-recent-label">Recent:</span>';
      list.forEach(function (q) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'mol-recent-chip';
        chip.textContent = q;
        chip.addEventListener('click', function () {
          var input = document.getElementById('mol-name-search');
          input.value = q;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.focus();
        });
        wrap.appendChild(chip);
      });
      var clear = document.createElement('button');
      clear.type = 'button';
      clear.className = 'mol-recent-clear';
      clear.textContent = 'clear';
      clear.setAttribute('aria-label', 'Clear recent searches');
      clear.addEventListener('click', function () {
        try { localStorage.removeItem(RECENT_KEY); } catch (e) {}
        renderRecent();
      });
      wrap.appendChild(clear);
    }
    renderRecent();

    var nameInput = document.getElementById('mol-name-search');
    if (nameInput) {
      nameInput.addEventListener('input', function () {
        var q = nameInput.value.trim().toLowerCase();
        var statusEl = document.getElementById('mol-status');
        clearTimeout(recentTimer);
        if (!q) { renderResults([]); if (statusEl) statusEl.textContent = ''; return; }
        var db = window.POLYMER_DB || [];
        var matches = db.filter(function (p) {
          if (p.name.toLowerCase().indexOf(q) !== -1) return true;
          return (p.aka || []).some(function (a) { return a.toLowerCase().indexOf(q) !== -1; });
        }).slice(0, 20);
        if (matches.length) {
          if (statusEl) statusEl.textContent = matches.length + ' match' + (matches.length === 1 ? '' : 'es') + ':';
          renderResults(matches);
        } else {
          rescueNameSearch(q, statusEl);
        }
        if (matches.length && q.length >= 3) {
          var toSave = nameInput.value.trim();
          recentTimer = setTimeout(function () { saveRecent(toSave); }, 1500);
        }
      });

      // Deep link: polymer-search.html?q=name prefills the name search
      // (used by the Ctrl+K palette)
      var deepQ = new URLSearchParams(location.search).get('q');
      if (deepQ) {
        nameInput.value = deepQ;
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    // Zero-hit name searches get two ladders of rescue before giving up:
    // the monomer field ("caprolactam" finds Nylon 6 even though no polymer
    // is NAMED caprolactam), then fuzzy did-you-mean suggestions over every
    // name and alias (catches "polysytrene"). No PubChem fallback here on
    // purpose: its name resolver knows no polymer names or abbreviations,
    // and its fuzzy route returns confidently wrong compounds (Titanium for
    // "Teflon"), which is worse than admitting no match.
    function editDistLe2(a, b) {
      if (Math.abs(a.length - b.length) > 2) return 3;
      var prev = [], i, j;
      for (j = 0; j <= b.length; j++) prev[j] = j;
      for (i = 1; i <= a.length; i++) {
        var cur = [i], rowMin = i;
        for (j = 1; j <= b.length; j++) {
          cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
          if (cur[j] < rowMin) rowMin = cur[j];
        }
        if (rowMin > 2) return 3;   // bounded: past 2 nothing here cares
        prev = cur;
      }
      return prev[b.length];
    }
    function rescueNameSearch(q, statusEl) {
      var db = window.POLYMER_DB || [];
      var byMonomer = db.filter(function (p) {
        return p.monomer && p.monomer.toLowerCase().indexOf(q) !== -1;
      }).slice(0, 20);
      if (byMonomer.length) {
        if (statusEl) statusEl.textContent = 'No polymer is named that, but ' + byMonomer.length + (byMonomer.length === 1 ? ' is' : ' are') + ' made from it:';
        renderResults(byMonomer);
        return;
      }
      var sugg = [];
      db.forEach(function (p) {
        var cands = [p.name].concat(p.aka || []);
        var best = null;
        for (var i = 0; i < cands.length; i++) {
          var d = editDistLe2(q, cands[i].toLowerCase());
          if (d <= 2 && (best == null || d < best.d)) best = { label: cands[i], d: d };
        }
        if (best) sugg.push(best);
      });
      sugg.sort(function (x, y) { return x.d - y.d; });
      sugg = sugg.slice(0, 5);
      if (statusEl) statusEl.textContent = 'No name matches.' + (sugg.length ? ' Did you mean:' : '');
      var resultsEl = document.getElementById('mol-results');
      if (!sugg.length || !resultsEl) { renderResults([]); return; }
      renderResults([]);
      resultsEl.innerHTML = '<div class="mol-suggest-row">' + sugg.map(function (s) {
        return '<button type="button" class="mol-suggest-chip">' + escapeHtml(s.label) + '</button>';
      }).join('') + '</div>';
      resultsEl.querySelectorAll('.mol-suggest-chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
          var input = document.getElementById('mol-name-search');
          input.value = chip.textContent;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });
      });
    }

    // ---------- Explore: browse the library by tag ----------
    function buildTagFilter() {
      var container = document.getElementById('mol-tag-filter');
      if (!container) return;
      var tagSet = {};
      (window.POLYMER_DB || []).forEach(function (p) {
        (p.tags || []).forEach(function (t) { tagSet[t] = true; });
      });
      var tags = Object.keys(tagSet).sort();
      container.innerHTML = tags.map(function (t) {
        return '<button type="button" class="mol-tag-chip" data-tag="' + escapeHtml(t) + '">' + escapeHtml(t) + '</button>';
      }).join('');
      container.querySelectorAll('.mol-tag-chip').forEach(function (btn) {
        btn.addEventListener('click', function () {
          btn.classList.toggle('active');
          runTagFilter();
        });
      });
    }
    // Tg/Tm strings in the library are uniform single integers ("100 °C",
    // "-10 °C", "~92 °C", "130 °C (dry)"); the first signed integer is the
    // value. Missing data stays null so filters can treat it honestly.
    function parseTemp(s) {
      if (s == null) return null;
      var m = String(s).match(/-?\d+/);
      return m ? parseInt(m[0], 10) : null;
    }
    function propInput(id) {
      var el = document.getElementById(id);
      if (!el || el.value.trim() === '') return null;
      var v = parseFloat(el.value);
      return isNaN(v) ? null : v;
    }
    // Explore is one combined filter: tags OR-combine within the row, then
    // AND with each property range. An entry missing a property that is being
    // filtered on is excluded but COUNTED, so "35 shown, 12 lack Tg data"
    // never silently pretends the library has been fully screened.
    function runExploreFilter() {
      var active = Array.prototype.slice.call(document.querySelectorAll('#mol-tag-filter .mol-tag-chip.active')).map(function (b) { return b.getAttribute('data-tag'); });
      var tgMin = propInput('mol-tg-min'), tgMax = propInput('mol-tg-max');
      var tmMin = propInput('mol-tm-min'), tmMax = propInput('mol-tm-max');
      var tgOn = tgMin != null || tgMax != null;
      var tmOn = tmMin != null || tmMax != null;
      var clearBtn = document.getElementById('mol-prop-clear');
      if (clearBtn) clearBtn.hidden = !(tgOn || tmOn);
      var statusEl = document.getElementById('mol-status');
      if (!active.length && !tgOn && !tmOn) { if (statusEl) statusEl.textContent = ''; renderResults([]); return; }
      var db = window.POLYMER_DB || [];
      var noData = 0;
      var matches = db.filter(function (p) {
        if (active.length && !(p.tags || []).some(function (t) { return active.indexOf(t) !== -1; })) return false;
        if (tgOn) {
          var tg = parseTemp(p.tg);
          if (tg == null) { noData++; return false; }
          if (tgMin != null && tg < tgMin) return false;
          if (tgMax != null && tg > tgMax) return false;
        }
        if (tmOn) {
          var tm = parseTemp(p.tm);
          if (tm == null) { noData++; return false; }
          if (tmMin != null && tm < tmMin) return false;
          if (tmMax != null && tm > tmMax) return false;
        }
        return true;
      });
      if (statusEl) {
        // "-130 to -40" style, never a bare dash: a range dash next to a
        // negative sign reads as "–-40".
        var rangeText = function (label, lo, hi) {
          if (lo != null && hi != null) return label + ' ' + lo + ' to ' + hi + ' °C';
          if (lo != null) return label + ' ≥ ' + lo + ' °C';
          return label + ' ≤ ' + hi + ' °C';
        };
        var parts = [];
        if (active.length) parts.push('tagged ' + active.join(', '));
        if (tgOn) parts.push(rangeText('Tg', tgMin, tgMax));
        if (tmOn) parts.push(rangeText('Tm', tmMin, tmMax));
        statusEl.textContent = (matches.length ? matches.length + ' polymer' + (matches.length === 1 ? '' : 's') + ' ' + parts.join(', ') : 'No polymers match ' + parts.join(', ')) +
          (noData ? ' (' + noData + ' more lack the filtered data)' : '') + (matches.length ? ':' : '');
      }
      renderResults(matches);
    }
    var runTagFilter = runExploreFilter;   // tag chips and property inputs share one filter
    (function wirePropFilter() {
      ['mol-tg-min', 'mol-tg-max', 'mol-tm-min', 'mol-tm-max'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('input', runExploreFilter);
      });
      var clearBtn = document.getElementById('mol-prop-clear');
      if (clearBtn) clearBtn.addEventListener('click', function () {
        ['mol-tg-min', 'mol-tg-max', 'mol-tm-min', 'mol-tm-max'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.value = '';
        });
        runExploreFilter();
      });
    })();
    buildTagFilter();

    // ---------- Explore: upload an image, OCR any printed text in it
    // (fully in-browser via Tesseract.js, no server/API key), and check the
    // extracted text against every polymer name, synonym, and CAS number in
    // the library. This reads labels, textbook pages, and datasheets - it
    // does not recognize hand-drawn skeletal structures from a photo, which
    // needs a trained structure-recognition model no static page can run.
    var imageUploadInput = document.getElementById('mol-image-upload');
    if (imageUploadInput) {
      imageUploadInput.addEventListener('change', function () {
        var file = imageUploadInput.files && imageUploadInput.files[0];
        if (file) runImageOCR(file);
      });
    }
    function runImageOCR(file) {
      var ocrStatusEl = document.getElementById('mol-ocr-status');
      var ocrTextEl = document.getElementById('mol-ocr-text');
      var statusEl = document.getElementById('mol-status');
      if (ocrStatusEl) ocrStatusEl.textContent = 'Reading image…';
      if (ocrTextEl) { ocrTextEl.hidden = true; ocrTextEl.textContent = ''; }
      if (typeof Tesseract === 'undefined') {
        if (ocrStatusEl) ocrStatusEl.textContent = 'OCR library did not load (needs an internet connection).';
        return;
      }
      Tesseract.recognize(file, 'eng').then(function (result) {
        var text = ((result && result.data && result.data.text) || '').trim();
        if (!text) {
          if (ocrStatusEl) ocrStatusEl.textContent = 'No readable text found in that image.';
          return;
        }
        if (ocrTextEl) { ocrTextEl.hidden = false; ocrTextEl.textContent = text; }
        var db = window.POLYMER_DB || [];
        var lower = text.toLowerCase();
        var matches = db.filter(function (p) {
          if (lower.indexOf(p.name.toLowerCase()) !== -1) return true;
          if (p.cas && lower.indexOf(p.cas.toLowerCase()) !== -1) return true;
          return (p.aka || []).some(function (a) { return lower.indexOf(a.toLowerCase()) !== -1; });
        });
        if (ocrStatusEl) {
          ocrStatusEl.textContent = matches.length
            ? ('Found ' + matches.length + ' known polymer name' + (matches.length === 1 ? '' : 's') + ' in the image.')
            : 'Read the image, but none of the text matched a polymer in this library.';
        }
        if (matches.length) {
          if (statusEl) statusEl.textContent = matches.length + ' match' + (matches.length === 1 ? '' : 'es') + ' from the image:';
          renderResults(matches);
          scrollResultsIntoView();
        }
      }).catch(function () {
        if (ocrStatusEl) ocrStatusEl.textContent = 'Could not read that image.';
      });
    }

    // ---------- Worked examples ----------
    // Positions are built with zigzagPos so every bond lands on the same
    // 30-degree grid the live editor snaps to, giving a proper skeletal-formula
    // zigzag instead of arbitrary hand-picked coordinates.
    function zigzagPos(anchor, angleDeg) {
      var rad = angleDeg * Math.PI / 180;
      return { x: anchor.x + BOND_LEN * Math.cos(rad), y: anchor.y + BOND_LEN * Math.sin(rad) };
    }
    function loadExample(key) {
      snapshot();
      atoms = []; bonds = []; brackets = []; selectedAtom = null; selectedGroup = []; nextAtomId = 1; nextBondId = 1;
      var cx = canvas.width / 2, cy = canvas.height / 2;
      // Each example draws a stub atom just outside the bracket on both ends,
      // standing in for the neighboring repeat units, so the two bonds that
      // cross the bracket edge are real (matching what the extractor needs).
      if (key === 'pe') {
        var p0 = { x: cx - 130, y: cy + 10 };
        var stubA = addAtom('C', p0.x, p0.y);
        var p1 = zigzagPos(p0, -30); var c1 = addAtom('C', p1.x, p1.y);
        var p2 = zigzagPos(p1, 30); var c2 = addAtom('C', p2.x, p2.y);
        var p3 = zigzagPos(p2, -30); var stubB = addAtom('C', p3.x, p3.y);
        addBond(stubA.id, c1.id, 1);
        addBond(c1.id, c2.id, 1);
        addBond(c2.id, stubB.id, 1);
        brackets = [{ x1: c1.x - 20, y1: Math.min(c1.y, c2.y) - 20, x2: c2.x + 20, y2: Math.max(c1.y, c2.y) + 20 }];
      } else if (key === 'ps') {
        var q0 = { x: cx - 150, y: cy + 10 };
        var stubC = addAtom('C', q0.x, q0.y);
        var q1 = zigzagPos(q0, -30); var b1 = addAtom('C', q1.x, q1.y);
        var q2 = zigzagPos(q1, 30); var b2 = addAtom('C', q2.x, q2.y);
        var q3 = zigzagPos(q2, -30); var stubD = addAtom('C', q3.x, q3.y);
        addBond(stubC.id, b1.id, 1);
        addBond(b1.id, b2.id, 1);
        addBond(b2.id, stubD.id, 1);
        // Same vertex geometry the interactive ring tool uses, so the ring
        // bulges away from b2 (downward here) instead of folding back over
        // it and crossing the b1-b2 bond.
        var ringPositions = ringVertexPositions(b2, Math.PI / 2, 6);
        var ringR = BOND_LEN * 0.72;
        var ringIpso = { x: b2.x + BOND_LEN * Math.cos(Math.PI / 2), y: b2.y + BOND_LEN * Math.sin(Math.PI / 2) };
        var psRingCenter = { x: ringIpso.x + ringR * Math.cos(Math.PI / 2), y: ringIpso.y + ringR * Math.sin(Math.PI / 2) };
        var ids = ringPositions.map(function (p) { return addAtom('C', p.x, p.y).id; });
        addBond(b2.id, ids[0], 1);
        for (var j = 0; j < 6; j++) addBond(ids[j], ids[(j + 1) % 6], j % 2 === 0 ? 2 : 1, psRingCenter);
        var ringXs = ringPositions.map(function (p) { return p.x; });
        var ringYs = ringPositions.map(function (p) { return p.y; });
        var ringMaxX = Math.max.apply(null, ringXs);
        // Keep x2 strictly between the ring's right edge and stubD, whatever
        // the gap between them happens to be, instead of a fixed margin that
        // could land on the wrong side of either one.
        brackets = [{
          x1: b1.x - 20, x2: (ringMaxX + q3.x) / 2,
          y1: Math.min(b1.y, b2.y, Math.min.apply(null, ringYs)) - 15,
          y2: Math.max(b1.y, b2.y, Math.max.apply(null, ringYs)) + 15
        }];
      } else if (key === 'nylon6') {
        // Nylon 6 is -[NH-(CH2)5-CO]-: seven chain atoms after the stub
        // (the N, five CH2, and the carbonyl carbon).
        var s0 = { x: cx - 210, y: cy + 10 };
        var stubE = addAtom('C', s0.x, s0.y);
        var angles = [-30, 30, -30, 30, -30, 30, -30];
        var prevPos = s0, prevAtom = stubE, chain = [];
        for (var k = 0; k < angles.length; k++) {
          var nextPos = zigzagPos(prevPos, angles[k]);
          var el = k === 0 ? 'N' : 'C';
          var nextAtom = addAtom(el, nextPos.x, nextPos.y);
          addBond(prevAtom.id, nextAtom.id, 1);
          chain.push(nextAtom);
          prevPos = nextPos; prevAtom = nextAtom;
        }
        var n1 = chain[0];
        var carbonyl = chain[chain.length - 1];
        // Continue the zigzag into the stub by alternating off the last chain
        // angle. Reusing a fixed -30 leaves the stub collinear with the final
        // chain bond for odd chain lengths, which erases the carbonyl's
        // trigonal gap and sends its oxygen off along the backbone.
        var stubFPos = zigzagPos(prevPos, -angles[angles.length - 1]);
        var stubF = addAtom('C', stubFPos.x, stubFPos.y);
        addBond(carbonyl.id, stubF.id, 1);
        // Compute the carbonyl oxygen's position only after both of its
        // backbone bonds exist, so it lands in the open trigonal gap between
        // them (the same rule the editor uses for a one-click substituent)
        // instead of a hardcoded side that can end up crossing the backbone.
        var oAngle = defaultExtendAngle(carbonyl);
        var oSnapped = Math.round(oAngle / SNAP_STEP) * SNAP_STEP;
        var oPos = { x: carbonyl.x + BOND_LEN * Math.cos(oSnapped), y: carbonyl.y + BOND_LEN * Math.sin(oSnapped) };
        var oAtom = addAtom('O', oPos.x, oPos.y);
        addBond(carbonyl.id, oAtom.id, 2);
        var chainYs = chain.map(function (a) { return a.y; }).concat([oAtom.y]);
        brackets = [{ x1: n1.x - 20, y1: Math.min.apply(null, chainYs) - 15, x2: carbonyl.x + 20, y2: Math.max.apply(null, chainYs) + 15 }];
      }
      draw();
      var statusEl = document.getElementById('mol-status');
      if (statusEl) statusEl.textContent = 'Example loaded. Click "Search this structure" to see it matched.';
      renderResults([]);
    }
    document.querySelectorAll('.mol-example-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { loadExample(btn.getAttribute('data-example')); });
    });

    new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    var firstElBtn = document.querySelector('.mol-el-btn[data-el="C"]');
    if (firstElBtn) firstElBtn.classList.add('active');
    var firstModeBtn = document.querySelector('.mol-mode-btn[data-mode="draw"]');
    if (firstModeBtn) firstModeBtn.classList.add('active');

    // Structure fingerprints come from the build-time search index (a lookup)
    // instead of hashing every entry on load. fingerprintOf falls back to
    // computing with the exact functions the editor uses, so a missing, stale,
    // or mismatched index only costs speed, never correctness. The index is
    // adopted only if its name list matches the loaded library exactly, which
    // rejects any stale cached copy whose entry set or order has drifted.
    var SEARCH_INDEX = null;
    (function loadSearchIndex() {
      var db = window.POLYMER_DB || [];
      if (typeof fetch !== "function") return;
      fetch("search-index.json")
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (idx) {
          if (!idx || !idx.fingerprints || !Array.isArray(idx.names)) return;
          if (idx.names.length !== db.length) return;
          for (var i = 0; i < db.length; i++) {
            if (idx.names[i] !== db[i].name) return;
          }
          SEARCH_INDEX = idx;
        })
        .catch(function () { /* offline or blocked: compute on demand */ });
    })();

    function fingerprintOf(p) {
      if (p._hash === undefined) {
        // Named copolymer entries carry no drawable repeat unit, so they get
        // null hashes: they never match a single-unit structure search (only
        // name search and the copolymer component matcher use them).
        if (p.type === 'copolymer' || !p.atoms) {
          p._hash = null; p._chash = null; p._profile = {};
          return p;
        }
        var fp = SEARCH_INDEX && SEARCH_INDEX.fingerprints[p.name];
        if (fp) { p._hash = fp.hash; p._profile = fp.profile; }
        else { p._hash = wlHash(p.atoms, p.bonds); p._profile = elementProfile(p.atoms); }
        // Framing-invariant key: hash of the closed (cyclic-quotient) graph.
        // An index built before this field existed simply lacks it, so compute
        // on demand rather than trusting fp.chash to be present.
        p._chash = (fp && fp.chash != null) ? fp.chash : closedHash(p.atoms, p.bonds);
      }
      return p;
    }

    draw();
  });
})();

// ---------- Photo -> structure (AI recognition) ----------
// Sends a photographed or screenshotted structure to /api/recognize (a
// Cloudflare Pages Function backed by a vision model) and loads the returned
// SMILES through the existing Load SMILES flow, so the user always sees the
// drawn structure and confirms it before searching. The button only appears
// when /api/health reports the endpoint is deployed and configured, so on a
// static-only host (or local dev) the feature simply isn't offered.
(function () {
  "use strict";

  function init() {
    var btn = document.getElementById("mol-photo-btn");
    var input = document.getElementById("mol-photo-input");
    var status = document.getElementById("mol-photo-status");
    if (!btn || !input || !status) return;

    function note(msg) {
      status.textContent = msg;
      status.hidden = !msg;
    }

    fetch("api/health")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (h) { if (h && h.ok && h.keyConfigured) btn.hidden = false; })
      .catch(function () { /* static host: leave the button hidden */ });

    btn.addEventListener("click", function () { input.click(); });

    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      input.value = "";
      if (!file) return;
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        // Downscale to a 1400px long edge on a white background: photos are
        // where the payload and token cost live, and line art survives this
        // easily. JPEG because photographs dominate this path.
        var scale = Math.min(1, 1400 / Math.max(img.width, img.height));
        var c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(img.width * scale));
        c.height = Math.max(1, Math.round(img.height * scale));
        var cx = c.getContext("2d");
        cx.fillStyle = "#ffffff";
        cx.fillRect(0, 0, c.width, c.height);
        cx.drawImage(img, 0, 0, c.width, c.height);
        recognize(c.toDataURL("image/jpeg", 0.9).split(",")[1]);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        note("That file could not be read as an image.");
      };
      img.src = url;
    });

    function recognize(b64) {
      btn.disabled = true;
      note("Reading the structure from your image… this takes a few seconds.");
      fetch("api/recognize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ media_type: "image/jpeg", data: b64 }),
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          btn.disabled = false;
          if (!res || !res.ok) {
            note((res && res.error) || "Recognition failed. Try again.");
            return;
          }
          if (!res.smiles) {
            note("No structure could be read. " + (res.reason || "Try a sharper, closer photo."));
            return;
          }
          var smilesInput = document.getElementById("mol-smiles-input");
          var loadBtn = document.getElementById("mol-smiles-load");
          if (smilesInput && loadBtn) {
            smilesInput.value = res.smiles;
            loadBtn.click();
          }
          note("Read with " + (res.confidence || "unknown") + " confidence: " +
            (res.reason || "") + " Check the drawing carefully before searching.");
        })
        .catch(function () {
          btn.disabled = false;
          note("Recognition is unreachable right now. Try again in a minute.");
        });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
