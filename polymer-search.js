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

  window.PolymerGraph = { wlHash: wlHash, elementProfile: elementProfile, profileDistance: profileDistance };

  // ---------- Editor + search UI ----------
  document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('mol-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

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

    var atoms = [];
    var bonds = [];
    var nextAtomId = 1;
    var nextBondId = 1;
    var selectedAtom = null;   // chain-building anchor (draw / wedge / hash / chain modes)
    var selectedGroup = [];    // multi-atom selection (select / rotate modes)
    var mode = 'draw';
    var chargeDelta = 1;
    var currentEl = 'C';
    var bracket = null;
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
      history.push(JSON.stringify({ atoms: atoms, bonds: bonds, bracket: bracket, nextAtomId: nextAtomId, nextBondId: nextBondId }));
      if (history.length > 40) history.shift();
    }
    function undo() {
      if (!history.length) return;
      var s = JSON.parse(history.pop());
      atoms = s.atoms; bonds = s.bonds; bracket = s.bracket; nextAtomId = s.nextAtomId; nextBondId = s.nextBondId;
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
      var colors = { N: '#3b82f6', O: '#ef4444', S: '#eab308', F: '#22c55e', Cl: '#22c55e', Br: '#a16207', I: '#7c3aed', Si: '#f97316', P: '#f97316', B: '#f97316' };
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
        if (hasLabel) {
          ctx.font = '600 15px Arial, Helvetica, sans-serif';
          var label = a.el;
          var tw = ctx.measureText(label).width;
          ctx.fillStyle = bgColor;
          ctx.fillRect(a.x - tw / 2 - 3, a.y - 9, tw + 6, 18);
          ctx.fillStyle = elColor(a.el);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, a.x, a.y + 1);
        }
        if (a.charge) {
          var sign = a.charge > 0 ? '+' : '−';
          var mag = Math.abs(a.charge);
          var chargeLabel = (mag > 1 ? mag : '') + sign;
          ctx.font = '700 11px Arial, Helvetica, sans-serif';
          var ccx = a.x + (hasLabel ? 11 : 6), ccy = a.y - (hasLabel ? 10 : 8);
          var cw = ctx.measureText(chargeLabel).width;
          ctx.fillStyle = bgColor;
          ctx.fillRect(ccx - 1, ccy - 7, cw + 2, 12);
          ctx.fillStyle = textColor;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(chargeLabel, ccx, ccy);
        }
      });
      if (bracket) drawBracket(bracket, primary);
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

    function drawBracket(rect, color) {
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
      ctx.fillText('n', x2 + 3, y2 - 12);
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
      if (bracket) {
        minX = Math.min(minX, bracket.x1, bracket.x2) - 4;
        maxX = Math.max(maxX, bracket.x1, bracket.x2) + 22;
        minY = Math.min(minY, bracket.y1, bracket.y2) - 4;
        maxY = Math.max(maxY, bracket.y1, bracket.y2) + 4;
      }
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
          bracket = { x1: draggingBracketPreview.x1, y1: draggingBracketPreview.y1, x2: pos.x, y2: pos.y };
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
      // so the next click keeps extending. Clicking a *different*, already
      // armed atom connects the two directly instead (e.g. to close a ring).
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
        if (selectedAtom && selectedAtom !== a) {
          snapshot();
          addChainBond(selectedAtom.id, a.id);
          selectedAtom = a;
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

    // Hover-and-type element hotkeys: hover any atom and press a letter key
    // to relabel it instantly, regardless of the current tool. Unambiguous
    // letters (n/o/f) apply immediately; c/s/b wait briefly for a second
    // letter to disambiguate Cl vs C, Si vs S, and Br, falling back to the
    // single-letter element if nothing follows in time.
    var HOTKEY_SINGLE = { n: 'N', o: 'O', f: 'F' };
    var HOTKEY_COMBO = { cl: 'Cl', si: 'Si', br: 'Br' };
    var HOTKEY_FALLBACK = { c: 'C', s: 'S' };
    function applyHotkeyElement(el) {
      if (!hoverAtom) return;
      snapshot();
      hoverAtom.el = el;
      draw();
    }
    document.addEventListener('keydown', function (evt) {
      if (evt.key === 'Escape') {
        var overlayEl = document.getElementById('mol-periodic-overlay');
        if (overlayEl && !overlayEl.hidden) { closePeriodicTable(); return; }
        if (selectedAtom) { selectedAtom = null; draw(); }
        if (selectedGroup.length) { selectedGroup = []; draw(); }
        return;
      }
      if (!hoverAtom || evt.ctrlKey || evt.metaKey || evt.altKey) return;
      var target = document.activeElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      var k = evt.key.toLowerCase();
      if (!/^[a-z]$/.test(k)) return;

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
      atoms = []; bonds = []; bracket = null; selectedAtom = null; selectedGroup = []; nextAtomId = 1; nextBondId = 1;
      draw();
    });

    // ---------- Repeat-unit extraction + search ----------
    function extractRepeatUnit(rect) {
      var x1 = Math.min(rect.x1, rect.x2), x2 = Math.max(rect.x1, rect.x2);
      var y1 = Math.min(rect.y1, rect.y2), y2 = Math.max(rect.y1, rect.y2);
      function inside(a) { return a.x >= x1 && a.x <= x2 && a.y >= y1 && a.y <= y2; }
      var interior = atoms.filter(inside);
      var interiorIds = {};
      interior.forEach(function (a) { interiorIds[a.id] = true; });
      var subAtoms = interior.map(function (a) { return { id: a.id, el: a.el, charge: a.charge }; });
      var subBonds = [];
      var starCount = 0;
      var boundaryCount = 0;
      bonds.forEach(function (b) {
        var aIn = interiorIds[b.a], bIn = interiorIds[b.b];
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
        publicationLinks(p) +
        '</div>';
    }
    function renderResults(list) {
      var resultsEl = document.getElementById('mol-results');
      if (!resultsEl) return;
      if (!list.length) { resultsEl.innerHTML = '<p class="guide-note">No matches.</p>'; return; }
      resultsEl.innerHTML = list.map(polymerCard).join('');
    }

    function runStructureSearch() {
      var statusEl = document.getElementById('mol-status');
      if (!statusEl) return;
      if (!bracket) {
        statusEl.textContent = 'Draw a repeat unit, then use the Bracket tool to mark it before searching.';
        renderResults([]);
        return;
      }
      var sub = extractRepeatUnit(bracket);
      if (sub.atomCount === 0) {
        statusEl.textContent = 'No atoms found inside the bracket. Drag the bracket over your repeat unit backbone.';
        renderResults([]);
        return;
      }
      if (sub.boundaryCount !== 2) {
        statusEl.textContent = sub.boundaryCount === 0
          ? 'This looks like a closed structure with no open chain ends inside the bracket. This tool matches linear repeat units with two open ends.'
          : 'This tool currently matches linear repeat units with exactly two open chain ends (found ' + sub.boundaryCount + '). Branched or crosslinked structures aren’t matched yet.';
        renderResults([]);
        return;
      }
      var hash = wlHash(sub.atoms, sub.bonds);
      var profile = elementProfile(sub.atoms);
      var db = window.POLYMER_DB || [];
      var exact = db.filter(function (p) { return p.hash === hash; });
      if (exact.length) {
        statusEl.textContent = 'Exact match found:';
        renderResults(exact);
        return;
      }
      var ranked = db.map(function (p) {
        return { p: p, d: profileDistance(profile, p.profile) };
      }).sort(function (x, y) { return x.d - y.d; }).slice(0, 5).map(function (r) { return r.p; });
      statusEl.textContent = 'No exact match in the reference library. Closest by composition:';
      renderResults(ranked);
    }

    var searchBtn = document.getElementById('mol-search-structure');
    if (searchBtn) searchBtn.addEventListener('click', runStructureSearch);

    var nameInput = document.getElementById('mol-name-search');
    if (nameInput) {
      nameInput.addEventListener('input', function () {
        var q = nameInput.value.trim().toLowerCase();
        var statusEl = document.getElementById('mol-status');
        if (!q) { renderResults([]); if (statusEl) statusEl.textContent = ''; return; }
        var db = window.POLYMER_DB || [];
        var matches = db.filter(function (p) {
          if (p.name.toLowerCase().indexOf(q) !== -1) return true;
          return (p.aka || []).some(function (a) { return a.toLowerCase().indexOf(q) !== -1; });
        }).slice(0, 20);
        if (statusEl) statusEl.textContent = matches.length ? (matches.length + ' match' + (matches.length === 1 ? '' : 'es') + ':') : 'No name matches.';
        renderResults(matches);
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
    function runTagFilter() {
      var active = Array.prototype.slice.call(document.querySelectorAll('#mol-tag-filter .mol-tag-chip.active')).map(function (b) { return b.getAttribute('data-tag'); });
      var statusEl = document.getElementById('mol-status');
      if (!active.length) { if (statusEl) statusEl.textContent = ''; renderResults([]); return; }
      var db = window.POLYMER_DB || [];
      var matches = db.filter(function (p) {
        return (p.tags || []).some(function (t) { return active.indexOf(t) !== -1; });
      });
      if (statusEl) statusEl.textContent = matches.length ? (matches.length + ' polymer' + (matches.length === 1 ? '' : 's') + ' tagged ' + active.join(', ') + ':') : 'No polymers with these tags.';
      renderResults(matches);
    }
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
      atoms = []; bonds = []; bracket = null; selectedAtom = null; selectedGroup = []; nextAtomId = 1; nextBondId = 1;
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
        bracket = { x1: c1.x - 20, y1: Math.min(c1.y, c2.y) - 20, x2: c2.x + 20, y2: Math.max(c1.y, c2.y) + 20 };
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
        bracket = {
          x1: b1.x - 20, x2: (ringMaxX + q3.x) / 2,
          y1: Math.min(b1.y, b2.y, Math.min.apply(null, ringYs)) - 15,
          y2: Math.max(b1.y, b2.y, Math.max.apply(null, ringYs)) + 15
        };
      } else if (key === 'nylon6') {
        var s0 = { x: cx - 190, y: cy + 10 };
        var stubE = addAtom('C', s0.x, s0.y);
        var angles = [-30, 30, -30, 30, -30, 30];
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
        var stubFPos = zigzagPos(prevPos, -30);
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
        bracket = { x1: n1.x - 20, y1: Math.min.apply(null, chainYs) - 15, x2: carbonyl.x + 20, y2: Math.max.apply(null, chainYs) + 15 };
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

    // Precompute each database entry's hash and element profile using the exact
    // same functions the editor uses, so the two can never fall out of sync.
    (window.POLYMER_DB || []).forEach(function (p) {
      p.hash = wlHash(p.atoms, p.bonds);
      p.profile = elementProfile(p.atoms);
    });

    draw();
  });
})();
