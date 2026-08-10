(function () {
  "use strict";

  // ---------- Graph hashing ----------
  // The Weisfeiler-Leman fingerprint, repeat-unit closure and repeat-unit
  // FOLDING all live in polymer-graph.js, which is loaded before this file and
  // is also require()d by the CI data check and the search-index builder. This
  // file used to carry its own copy of that algorithm, kept in sync by hand and
  // labelled "Mirrors polymer-graph.js" - which is exactly how the browser came
  // to be running a different matcher from the one the index was built with.
  // Binding to the shared module is what makes a precomputed hash trustworthy.
  if (!window.PolymerGraph) throw new Error("polymer-graph.js must load before polymer-search.js");
  var PG = window.PolymerGraph;
  if (!window.BracketGeometry) throw new Error("bracket-geometry.js must load before polymer-search.js");
  var BG = window.BracketGeometry;
  var wlHash = PG.wlHash,
      closeRepeatUnit = PG.closeRepeatUnit,
      closedHash = PG.closedHash,
      blindHash = PG.blindHash,
      hasUnsetStereo = PG.hasUnsetStereo,
      inSameRing = PG.inSameRing,
      foldRepeatUnit = PG.foldRepeatUnit,
      elementProfile = PG.elementProfile,
      profileDistance = PG.profileDistance;

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
      // Brackets carry pixel coordinates too, so a canvas resize that shifts
      // atoms has to shift the brackets by the same amount or they drift out
      // of alignment with the atoms they were drawn around. This desync was
      // silently invisible on a load-then-search flow but bit the example
      // buttons: loading polystyrene into a canvas whose size still changed
      // in the same frame left the bracket enclosing only phenyl instead of
      // CH2-CH(phenyl), producing the wrong repeat unit for the search.
      for (var b = 0; b < brackets.length; b++) {
        brackets[b].x1 += dx; brackets[b].x2 += dx;
        brackets[b].y1 += dy; brackets[b].y2 += dy;
        // An angled bracket's bars sit on their own bonds, so they need the same
        // shift; leaving them behind would slide them off the bonds they cut.
        if (brackets[b].bars) brackets[b].bars.forEach(function (bar) { bar.x += dx; bar.y += dy; });
      }
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
    // Reaction arrows. Pure annotation: they carry no chemistry and are kept in
    // their own array precisely so they CANNOT reach the structure search - a
    // scheme is a drawing about a reaction, not a molecule. They do render into
    // the PNG/SVG exports, which is the point of having them.
    var arrows = [];
    // Free text on the canvas. A "+" between reactants is just a label whose
    // text is "+", so one object covers both and there is no separate plus
    // primitive to keep in step. Annotation, like arrows: never searched.
    var labels = [];
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

    // Undo/redo. `history` is the past, `future` is what undo took away.
    // Any new edit invalidates the future, which is the standard contract and
    // the one users already expect from every other editor.
    var future = [];
    function editorState() {
      return JSON.stringify({ atoms: atoms, bonds: bonds, brackets: brackets, arrows: arrows, labels: labels, nextAtomId: nextAtomId, nextBondId: nextBondId });
    }
    function restoreState(json) {
      var s = JSON.parse(json);
      atoms = s.atoms; bonds = s.bonds; brackets = s.brackets || (s.bracket ? [s.bracket] : []);
      arrows = s.arrows || []; labels = s.labels || [];
      nextAtomId = s.nextAtomId; nextBondId = s.nextBondId;
      selectedAtom = null; selectedGroup = []; selectedArrow = null; selectedLabel = null;
      syncAnnotationPanel();
      draw();
      syncHistoryButtons();
    }
    function snapshot() {
      history.push(editorState());
      if (history.length > 40) history.shift();
      future.length = 0;
      syncHistoryButtons();
    }
    function undo() {
      if (!history.length) return;
      future.push(editorState());
      restoreState(history.pop());
    }
    function redo() {
      if (!future.length) return;
      history.push(editorState());
      restoreState(future.pop());
    }
    // A disabled button is how the user finds out there is nothing to undo,
    // instead of pressing it and wondering whether the editor is broken.
    function syncHistoryButtons() {
      var u = document.getElementById('mol-undo'), r = document.getElementById('mol-redo');
      if (u) u.disabled = !history.length;
      if (r) r.disabled = !future.length;
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

    var arrowPreview = null, draggingArrow = null, arrowDragFrom = null, selectedArrow = null;
    var draggingEnd = null, draggingBow = null;           // 1 or 2 while an arrow endpoint is being dragged
    var selectedLabel = null, draggingLabel = null, labelDragFrom = null;
    var ENDPOINT_GRAB = 10;
    // What the NEXT drawn arrow / placed label will be. The "+" button sets
    // pendingLabelText so a plus costs one click and no typing.
    var pendingArrowKind = 'arrow';
    var pendingLabelText = null;

    // A scheme reads as a line, so an arrow dropped a few pixels off the
    // molecules' centre looks like a mistake. Snap to that centre when close,
    // the same way bond angles snap. Returns y unchanged when there is nothing
    // to align to, or when the arrow is deliberately somewhere else.
    var ALIGN_SNAP = 18;
    function structureCentreY() {
      if (!atoms.length) return null;
      var min = Infinity, max = -Infinity;
      atoms.forEach(function (a) { min = Math.min(min, a.y); max = Math.max(max, a.y); });
      return (min + max) / 2;
    }
    function snapToStructureY(y) {
      var c = structureCentreY();
      return (c != null && Math.abs(y - c) <= ALIGN_SNAP) ? c : y;
    }

    // One panel beside the canvas for whichever annotation is selected, rather
    // than typing onto the canvas: the letter keys are already element hotkeys.
    // An arrow wants two strings and a shape; a text label wants one string.
    function syncAnnotationPanel() {
      var wrap = document.getElementById('mol-arrow-labels');
      var ab = document.getElementById('mol-arrow-above');
      var bl = document.getElementById('mol-arrow-below');
      var kindWrap = document.getElementById('mol-arrow-kind');
      var txtWrap = document.getElementById('mol-label-edit');
      var txt = document.getElementById('mol-label-text');
      if (!wrap) return;
      wrap.hidden = !selectedArrow && !selectedLabel;
      var arrowBits = wrap.querySelectorAll('[data-for="arrow"]');
      for (var i = 0; i < arrowBits.length; i++) arrowBits[i].hidden = !selectedArrow;
      if (txtWrap) txtWrap.hidden = !selectedLabel;
      if (selectedArrow) {
        if (ab) ab.value = selectedArrow.above || '';
        if (bl) bl.value = selectedArrow.below || '';
        if (kindWrap) {
          var btns = kindWrap.querySelectorAll('button');
          for (var k = 0; k < btns.length; k++) {
            btns[k].classList.toggle('active', btns[k].getAttribute('data-kind') === (selectedArrow.kind || 'arrow'));
          }
        }
      }
      if (selectedLabel && txt) txt.value = selectedLabel.text || '';
    }
    var syncArrowLabels = syncAnnotationPanel;   // older call sites

    // ---------- View transform (zoom + pan) ----------
    //
    // Atom coordinates are WORLD coordinates and never change when the view
    // moves; only draw() and getPos() know about the transform. Keeping it out
    // of the data is what lets the exports, the bounding box and the whole
    // structure-search path stay exactly as they were - they all work in world
    // space and never had a view to begin with.
    var viewScale = 1, viewX = 0, viewY = 0;
    var VIEW_MIN = 0.25, VIEW_MAX = 6;
    function resetView() { viewScale = 1; viewX = 0; viewY = 0; }
    // canvas pixel -> world
    function toWorld(px, py) { return { x: (px - viewX) / viewScale, y: (py - viewY) / viewScale }; }
    function zoomAbout(px, py, factor) {
      var next = Math.max(VIEW_MIN, Math.min(VIEW_MAX, viewScale * factor));
      if (next === viewScale) return;
      // keep the world point under the cursor pinned to the cursor
      var w = toWorld(px, py);
      viewScale = next;
      viewX = px - w.x * viewScale;
      viewY = py - w.y * viewScale;
      draw();
    }

    function canvasPixel(evt) {
      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      var t = (evt.touches && evt.touches[0]) || (evt.changedTouches && evt.changedTouches[0]);
      var clientX = t ? t.clientX : evt.clientX;
      var clientY = t ? t.clientY : evt.clientY;
      return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    }
    function getPos(evt) {
      var p = canvasPixel(evt);
      return toWorld(p.x, p.y);
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
      arrows.forEach(function (ar) { drawArrow(ar, textColor); });
      labels.forEach(function (lb) { drawLabel(lb, textColor); });
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
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      // Everything below is drawn in world coordinates; the view transform is
      // applied once here and torn down at the end of the function. drawStructure
      // itself must stay transform-free, because the PNG and SVG exports call it
      // with their own ctx and their own transform already set.
      ctx.setTransform(viewScale, 0, 0, viewScale, viewX, viewY);
      var styles = getComputedStyle(document.body);
      var textColor = (styles.getPropertyValue('--text') || '#111').trim() || '#111';
      var bgColor = (styles.getPropertyValue('--card-bg') || '#fff').trim() || '#fff';
      var primary = (styles.getPropertyValue('--primary') || '#2563eb').trim() || '#2563eb';

      drawStructure(textColor, bgColor);

      // Over-valent atoms are marked as you draw them. Before this, a
      // five-bond carbon was accepted silently and only surfaced at search
      // time as "check valences", which named no atom and sent you hunting.
      // Uses the same table the CI data check enforces, so what looks wrong
      // here is exactly what would be rejected there.
      var overValent = PG.overValentAtoms(atoms, bonds);
      if (overValent.length) {
        var badSet = {};
        overValent.forEach(function (id) { badSet[id] = 1; });
        ctx.save();
        atoms.forEach(function (a) {
          if (!badSet[a.id]) return;
          ctx.beginPath();
          ctx.arc(a.x, a.y, ATOM_R + 5, 0, Math.PI * 2);
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
        ctx.restore();
      }

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
      if (mode === 'arrow' && arrowPreview) {
        ctx.save();
        ctx.globalAlpha = 0.55;
        drawArrow(arrowPreview, primary);
        ctx.restore();
      }
      if (mode === 'arrow' && selectedArrow) {
        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = primary;
        ctx.lineWidth = 1;
        var pad = 12;
        ctx.strokeRect(Math.min(selectedArrow.x1, selectedArrow.x2) - pad, Math.min(selectedArrow.y1, selectedArrow.y2) - pad,
                       Math.abs(selectedArrow.x2 - selectedArrow.x1) + pad * 2, Math.abs(selectedArrow.y2 - selectedArrow.y1) + pad * 2);
        ctx.restore();
      }
      if (mode === 'arrow' && selectedArrow) {
        // Endpoint handles, so it is visible that the ends can be grabbed.
        ctx.save();
        ctx.fillStyle = primary;
        var handles = [[selectedArrow.x1, selectedArrow.y1], [selectedArrow.x2, selectedArrow.y2]];
        if (isCurly(selectedArrow)) { var cc = curlyControl(selectedArrow); handles.push([cc.x, cc.y]); }
        handles.forEach(function (p) {
          ctx.beginPath();
          ctx.arc(p[0], p[1], 3.5, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }
      if (mode === 'text' && selectedLabel) {
        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = primary;
        ctx.lineWidth = 1;
        var hw = Math.max(14, labelWidth(selectedLabel)) / 2 + 5;
        ctx.strokeRect(selectedLabel.x - hw, selectedLabel.y - 13, hw * 2, 26);
        ctx.restore();
      }
      if (mode === 'ring' && pendingRing && ringHoverPos) drawRingGhost(primary);
      // Leave the context as we found it, so anything that draws to this canvas
      // without going through draw() is not silently zoomed.
      ctx.setTransform(1, 0, 0, 1, 0, 0);
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
    // Element-count lookup for the mass readout. Populated once from the
    // shared superatom dictionary so it never drifts from the atomic
    // expansions above; falls back to hardcoded NO2 only if the module
    // did not load. Aliased keys also resolve so "MeO" reads the same as
    // "OMe" regardless of which one the user typed.
    var SUPERATOM_COUNTS = (function () {
      var out = { NO2: { N: 1, O: 2 } };
      var SA = window.PolymerSuperatoms;
      if (!SA) return out;
      Object.keys(SA.SUPERATOMS).forEach(function (name) {
        var c = SA.elementCount(name);
        if (c) out[name] = c;
        (SA.SUPERATOMS[name].aliases || []).forEach(function (alias) { out[alias] = c; });
      });
      return out;
    })();

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
      } else if (starCount === 2 && whole.length && brackets.some(function (r) { return r.role === 'sidechain' && r.atomIds; })) {
        // A bottlebrush has two repeats, so one mass cannot describe it: the
        // drawn unit is a backbone repeat carrying exactly ONE side-chain unit
        // plus an end group, and quoting that as "the repeat unit" invites it
        // being read as the mass that repeats along the chain. Report the two
        // repeats separately and say what the leftover end group is.
        var sideRect = brackets.filter(function (r) { return r.role === 'sidechain' && r.atomIds; })[0];
        var sideAtoms = whole.filter(function (a) { return sideRect.atomIds[a.id]; });
        // The end group is what hangs beyond the side chain: flood outward from
        // the unit without re-entering it, and keep whatever does not reach the
        // backbone. For mPEO that is the methyl, for a lactide graft the -OH.
        var adjM = {};
        atoms.forEach(function (a) { adjM[a.id] = []; });
        bonds.forEach(function (b) { if (adjM[b.a]) adjM[b.a].push(b.b); if (adjM[b.b]) adjM[b.b].push(b.a); });
        var mainIds = mainChainIds() || {};
        var capIds = {};
        Object.keys(sideRect.atomIds).forEach(function (uid) {
          (adjM[uid] || []).forEach(function (nb) {
            if (sideRect.atomIds[nb] || capIds[nb]) return;
            var stack = [nb], seenF = {}, reachesMain = false, frag = [];
            seenF[nb] = true;
            while (stack.length) {
              var u = stack.pop(); frag.push(u);
              if (mainIds[u]) reachesMain = true;
              (adjM[u] || []).forEach(function (v) {
                if (sideRect.atomIds[v] || seenF[v]) return;
                seenF[v] = true; stack.push(v);
              });
            }
            if (!reachesMain) frag.forEach(function (id) { capIds[id] = true; });
          });
        });
        var backAtoms = whole.filter(function (a) { return !sideRect.atomIds[a.id] && !capIds[a.id]; });
        var capAtoms = whole.filter(function (a) { return capIds[a.id]; });
        var sideRes = fragmentMass(sideAtoms), backRes = fragmentMass(backAtoms);
        if (!sideRes.unknown && !backRes.unknown && sideAtoms.length && backAtoms.length) {
          var capRes = capAtoms.length ? fragmentMass(capAtoms) : null;
          massReadout.hidden = false;
          massReadout.innerHTML =
            'Backbone repeat (m): ' + formatFormula(backRes.counts) + ' &middot; <strong>' + backRes.mass.toFixed(2) + ' g/mol</strong>' +
            ' <span' + dim + '>&middot;</span> ' +
            'side chain (n): ' + formatFormula(sideRes.counts) + ' &middot; <strong>' + sideRes.mass.toFixed(2) + ' g/mol</strong>' +
            (capRes && !capRes.unknown
              ? ' <span' + dim + '>&middot; end group ' + formatFormula(capRes.counts) + ' &middot; ' + capRes.mass.toFixed(2) + ' g/mol</span>'
              : '') +
            ' <span' + dim + '>&middot; a backbone repeat weighs ' + backRes.mass.toFixed(2) + ' + n &times; ' + sideRes.mass.toFixed(2) +
            (capRes && !capRes.unknown ? ' + ' + capRes.mass.toFixed(2) : '') + '</span>';
          return;
        }
        target = whole;
        label = 'Repeat unit';
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
      // Name the problem next to the mass rather than only ringing the atom
      // in red, so it is clear WHAT is wrong and not just where. The formula
      // above is still shown: it is what was drawn, and hiding it would make
      // the mistake harder to reason about.
      var bad = PG.overValentAtoms(atoms, bonds);
      var valenceHtml = '';
      if (bad.length) {
        var els = [];
        bad.forEach(function (id) {
          var a = atomById(id);
          if (a && els.indexOf(a.el) === -1) els.push(a.el);
        });
        valenceHtml = ' <span style="color:#dc2626;font-size:0.85em;">&middot; ' + bad.length +
          (bad.length === 1 ? ' atom has' : ' atoms have') + ' too many bonds (' + els.join(', ') +
          ') &mdash; ringed in red</span>';
      }
      massReadout.innerHTML = label + ': ' + formatFormula(res.counts) +
        ' &middot; <strong>' + res.mass.toFixed(2) + ' g/mol</strong>' + extraHtml + hint + valenceHtml;
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

      // Geometry is stated as a label rather than inferred from where the user
      // happened to drop the atoms. Atoms here are placed and dragged freely,
      // so the drawn angles are not a reliable claim about cis or trans - but
      // the search now treats geometry as part of the polymer's identity, so
      // what it will match on has to be visible on the canvas.
      if (bond.geom === 'cis' || bond.geom === 'trans') {
        var lx = (x1 + x2) / 2 - px * 13, ly = (y1 + y2) / 2 - py * 13;
        ctx.save();
        ctx.font = '600 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color;
        ctx.fillText(bond.geom, lx, ly);
        ctx.restore();
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
    // A reaction arrow, with optional text above and below the shaft - which is
    // where a scheme puts reagents and conditions. The label is whatever the
    // user types: this tool makes no claim about the chemistry, unlike the
    // derived scheme on a search result, which is checked.
    var ARROW_HEAD = 9;
    // Three shapes, because a polymerisation scheme needs more than one kind of
    // arrow. RAFT, ATRP and ROMP - the mechanisms this site actually teaches -
    // are equilibria, and free-radical steps are drawn with single-barbed
    // fishhooks because one electron moves, not two.
    function arrowBarb(x, y, ux, uy, px, py, bothSides) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - ux * ARROW_HEAD + px * 4.6, y - uy * ARROW_HEAD + py * 4.6);
      if (bothSides) {
        ctx.lineTo(x - ux * ARROW_HEAD - px * 4.6, y - uy * ARROW_HEAD - py * 4.6);
        ctx.closePath();
        ctx.fill();
      } else {
        // a fishhook is a stroked half-head, not a filled triangle
        ctx.stroke();
      }
    }
    // Curly (electron-pushing) arrows are a quadratic Bezier. The control point
    // is stored as a perpendicular offset from the chord midpoint rather than
    // as absolute coordinates, so moving or re-aiming the arrow keeps the bow
    // it was given instead of flattening it.
    function curlyControl(ar) {
      var mx = (ar.x1 + ar.x2) / 2, my = (ar.y1 + ar.y2) / 2;
      var dx = ar.x2 - ar.x1, dy = ar.y2 - ar.y1;
      var len = Math.hypot(dx, dy) || 1;
      var px = -dy / len, py = dx / len;
      var bow = ar.bow == null ? 0.45 : ar.bow;
      return { x: mx + px * len * bow, y: my + py * len * bow };
    }
    function bezierAt(ar, t) {
      var c = curlyControl(ar), s = 1 - t;
      return {
        x: s * s * ar.x1 + 2 * s * t * c.x + t * t * ar.x2,
        y: s * s * ar.y1 + 2 * s * t * c.y + t * t * ar.y2
      };
    }
    function drawCurly(ar, color, halfHead) {
      var c = curlyControl(ar);
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(ar.x1, ar.y1);
      ctx.quadraticCurveTo(c.x, c.y, ar.x2, ar.y2);
      ctx.stroke();
      // head aimed along the curve's tangent at the end, not along the chord
      var near = bezierAt(ar, 0.94);
      var tx = ar.x2 - near.x, ty = ar.y2 - near.y;
      var tl = Math.hypot(tx, ty) || 1;
      var ux = tx / tl, uy = ty / tl;
      arrowBarb(ar.x2, ar.y2, ux, uy, -uy, ux, !halfHead);
      ctx.restore();
    }

    function drawArrow(ar, color) {
      var dx = ar.x2 - ar.x1, dy = ar.y2 - ar.y1;
      var len = Math.hypot(dx, dy);
      if (len < 1) return;
      var ux = dx / len, uy = dy / len;
      var px = -uy, py = ux;
      var kind = ar.kind || 'arrow';
      if (kind === 'curly' || kind === 'curly-half') {
        // A curly arrow shows where electrons go; it carries no reagents, so
        // the above/below text is deliberately not drawn on it.
        drawCurly(ar, color, kind === 'curly-half');
        return;
      }
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.6;
      if (kind === 'equilibrium') {
        // Two offset half-arrows pointing opposite ways, the way a reversible
        // step is drawn.
        var off = 3;
        line(ar.x1 + px * off, ar.y1 + py * off, ar.x2 + px * off - ux * 2, ar.y2 + py * off - uy * 2);
        arrowBarb(ar.x2 + px * off, ar.y2 + py * off, ux, uy, px, py, false);
        line(ar.x2 - px * off, ar.y2 - py * off, ar.x1 - px * off + ux * 2, ar.y1 - py * off + uy * 2);
        arrowBarb(ar.x1 - px * off, ar.y1 - py * off, -ux, -uy, -px, -py, false);
      } else {
        line(ar.x1, ar.y1, ar.x2 - ux * (ARROW_HEAD - 1), ar.y2 - uy * (ARROW_HEAD - 1));
        arrowBarb(ar.x2, ar.y2, ux, uy, px, py, kind !== 'fishhook');
      }
      var mx = (ar.x1 + ar.x2) / 2, my = (ar.y1 + ar.y2) / 2;
      ctx.textAlign = 'center';
      ctx.font = '12px system-ui, sans-serif';
      // The perpendicular (px,py) points to +y for a left-to-right arrow, and
      // +y is DOWN on a canvas - so "above" has to subtract it. Getting that
      // sign backwards put the reagents under the shaft, the conditions over
      // it, and both on top of each other.
      var TEXT_GAP = 13;
      if (ar.above) fillRuns(ar.above, mx - px * TEXT_GAP, my - py * TEXT_GAP, ARROW_FONT, ARROW_SUB_FONT, 'middle');
      if (ar.below) fillRuns(ar.below, mx + px * TEXT_GAP, my + py * TEXT_GAP, ARROW_FONT, ARROW_SUB_FONT, 'middle');
      ctx.restore();
    }

    // Scheme text is chemistry, so "H2O" has to be able to render as H₂O.
    // Digits following a letter drop to a subscript automatically, which is
    // the convention in every formula anyone will type here; "60 C" keeps its
    // digits because they do not follow a letter. An explicit "_" forces one.
    //
    // Drawn as a run of fillText calls rather than one, which means the SVG
    // export gets it for free - the shim implements fillText and nothing here
    // needs a second code path.
    function textRuns(str) {
      var runs = [], i = 0, buf = '', sub = false;
      function flush() { if (buf) { runs.push({ t: buf, sub: sub }); buf = ''; } }
      while (i < str.length) {
        var ch = str.charAt(i);
        if (ch === '_' && i + 1 < str.length) {
          flush(); sub = true;
          buf = str.charAt(i + 1); flush(); sub = false;
          i += 2;
          continue;
        }
        if (/[0-9]/.test(ch) && i > 0 && /[A-Za-z)\]]/.test(str.charAt(i - 1))) {
          flush(); sub = true;
          while (i < str.length && /[0-9]/.test(str.charAt(i))) { buf += str.charAt(i); i++; }
          flush(); sub = false;
          continue;
        }
        buf += ch; i++;
      }
      flush();
      return runs;
    }
    function measureRuns(runs, baseFont, subFont) {
      var w = 0;
      runs.forEach(function (r) {
        ctx.font = r.sub ? subFont : baseFont;
        w += ctx.measureText(r.t).width;
      });
      return w;
    }
    // Draws centred on (x,y); returns the width used.
    function fillRuns(str, x, y, baseFont, subFont, baseline) {
      var runs = textRuns(str);
      var total = measureRuns(runs, baseFont, subFont);
      var cx = x - total / 2;
      var prevAlign = ctx.textAlign, prevBaseline = ctx.textBaseline;
      ctx.textAlign = 'left';
      ctx.textBaseline = baseline || 'middle';
      runs.forEach(function (r) {
        ctx.font = r.sub ? subFont : baseFont;
        ctx.fillText(r.t, cx, r.sub ? y + 3 : y);
        cx += ctx.measureText(r.t).width;
      });
      ctx.textAlign = prevAlign;
      ctx.textBaseline = prevBaseline;
      return total;
    }

    var LABEL_FONT = '600 15px system-ui, sans-serif';
    var LABEL_SUB_FONT = '600 11px system-ui, sans-serif';
    var ARROW_FONT = '12px system-ui, sans-serif';
    var ARROW_SUB_FONT = '9px system-ui, sans-serif';
    function drawLabel(lb, color) {
      if (!lb.text) return;
      ctx.save();
      ctx.fillStyle = color;
      fillRuns(lb.text, lb.x, lb.y, LABEL_FONT, LABEL_SUB_FONT, 'middle');
      ctx.restore();
    }
    function labelWidth(lb) {
      ctx.save();
      var w = measureRuns(textRuns(lb.text || ''), LABEL_FONT, LABEL_SUB_FONT);
      ctx.restore();
      return w;
    }
    function findLabelAt(x, y) {
      for (var i = labels.length - 1; i >= 0; i--) {
        var lb = labels[i];
        var w = Math.max(14, labelWidth(lb)) / 2 + 4;
        if (Math.abs(x - lb.x) <= w && Math.abs(y - lb.y) <= 12) return lb;
      }
      return null;
    }
    function isCurly(ar) { return ar && (ar.kind === 'curly' || ar.kind === 'curly-half'); }
    function findArrowAt(x, y) {
      for (var i = arrows.length - 1; i >= 0; i--) {
        var ar = arrows[i];
        if (isCurly(ar)) {
          // sample the curve; a straight-line test would miss the bow entirely
          for (var t = 0; t <= 1.0001; t += 0.05) {
            var p = bezierAt(ar, t);
            if (Math.hypot(x - p.x, y - p.y) <= 10) return ar;
          }
          continue;
        }
        var dx = ar.x2 - ar.x1, dy = ar.y2 - ar.y1;
        var len2 = dx * dx + dy * dy;
        if (!len2) continue;
        var tt = Math.max(0, Math.min(1, ((x - ar.x1) * dx + (y - ar.y1) * dy) / len2));
        var cx = ar.x1 + tt * dx, cy = ar.y1 + tt * dy;
        if (Math.hypot(x - cx, y - cy) <= 10) return ar;
      }
      return null;
    }

    function drawBracket(rect, color, idx) {
      var x1 = Math.min(rect.x1, rect.x2), x2 = Math.max(rect.x1, rect.x2);
      var y1 = Math.min(rect.y1, rect.y2), y2 = Math.max(rect.y1, rect.y2);
      var tick = 8;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      if (rect.bars && rect.bars.length === 2) {
        // Every bar is drawn across the bond it cuts, with the ticks turned in
        // toward the unit, and stops short of any bond it does not cut. Both
        // matter: perpendicular keeps the bar across the chain rather than along
        // it, and clipping keeps it from slicing through a side group.
        var want = BOND_LEN * 0.5, ends = [];
        rect.bars.forEach(function (bar) {
          var lim = clipBarHalf(bar, want);
          var ax = bar.x - bar.ax * lim.neg, ay = bar.y - bar.ay * lim.neg;
          var bx = bar.x + bar.ax * lim.pos, by = bar.y + bar.ay * lim.pos;
          ends.push({ ax: ax, ay: ay, bx: bx, by: by });
          // The ticks turn in toward the unit and can meet a bond just as the bar
          // can, so they are cut back the same way. A shortened hook still reads
          // as a bracket; one drawn through a bond does not.
          var tA = clearRun(ax, ay, bar.tx, bar.ty, tick, bar.cutA, bar.cutB);
          var tB = clearRun(bx, by, bar.tx, bar.ty, tick, bar.cutA, bar.cutB);
          // Deliberate test seam. A bar or tick drawn through a bond it does not
          // cut says the bracket cuts that bond, and it is not something the eye
          // reliably catches at normal size - it was found by measurement, twice.
          // The other data checkers run in node; this one needs a live canvas and
          // RDKit, so it hangs off a hook: set window.__barCheck, load every
          // entry, and it reports any bar that crosses something it should not.
          if (window.__barCheck) window.__barCheck(bar, ax, ay, bx, by, tA, tB, atoms, bonds);
          ctx.beginPath();
          ctx.moveTo(ax + bar.tx * tA, ay + bar.ty * tA);
          ctx.lineTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.lineTo(bx + bar.tx * tB, by + bar.ty * tB);
          ctx.stroke();
        });
        // Label the bar furthest along the chain, just beyond its outer end.
        var fi = rect.bars[0].x + rect.bars[0].y > rect.bars[1].x + rect.bars[1].y ? 0 : 1;
        var far = rect.bars[fi], fe = ends[fi];
        var lo = (fe.ay > fe.by) ? { x: fe.ax, y: fe.ay } : { x: fe.bx, y: fe.by };
        ctx.font = '600 13px Arial, Helvetica, sans-serif';
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(rect.label || (idx < 0 ? 'n' : (BLOCK_SUBSCRIPTS[idx] || String(idx + 1))),
          lo.x - far.tx * 4 + 2, lo.y - far.ty * 4);
        return;
      }
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
      // A bracket may name its own subscript (a bottlebrush declares backbone m
      // and side chain n), which must win over the positional letter: the side
      // chain is not the second block of a chain, and lettering it by array
      // position would be an accident that happened to agree.
      var sub = rect.label || (idx < 0 ? 'n' : (BLOCK_SUBSCRIPTS[idx] || String(idx + 1)));
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
      if (!atoms.length && !arrows.length && !labels.length) return null;
      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      atoms.forEach(function (a) {
        minX = Math.min(minX, a.x); maxX = Math.max(maxX, a.x);
        minY = Math.min(minY, a.y); maxY = Math.max(maxY, a.y);
      });
      var pad = 28;
      if (atoms.length) { minX -= pad; minY -= pad; maxX += pad; maxY += pad; }
      // Arrows sit outside the atoms - that is the whole point of a scheme -
      // so an export framed on atoms alone crops them off, and a canvas holding
      // only an arrow would export nothing at all. Extra vertical room because
      // the reagent and condition text rides above and below the shaft.
      labels.forEach(function (lb) {
        var hw = labelWidth(lb) / 2 + 8;
        minX = Math.min(minX, lb.x - hw); maxX = Math.max(maxX, lb.x + hw);
        minY = Math.min(minY, lb.y - 14); maxY = Math.max(maxY, lb.y + 14);
      });
      arrows.forEach(function (ar) {
        minX = Math.min(minX, ar.x1, ar.x2) - 10;
        maxX = Math.max(maxX, ar.x1, ar.x2) + 10;
        minY = Math.min(minY, ar.y1, ar.y2) - 26;
        maxY = Math.max(maxY, ar.y1, ar.y2) + 26;
      });
      brackets.forEach(function (bracket) {
        minX = Math.min(minX, bracket.x1, bracket.x2) - 4;
        maxX = Math.max(maxX, bracket.x1, bracket.x2) + 22;
        minY = Math.min(minY, bracket.y1, bracket.y2) - 4;
        maxY = Math.max(maxY, bracket.y1, bracket.y2) + 4;
      });
      return { minX: minX, minY: minY, width: maxX - minX, height: maxY - minY };
    }

    // Downloading a PNG is the wrong verb for the common case: a scheme is
    // going into a slide or a manuscript, which wants a paste, not a file in
    // Downloads. Needs a secure context and a browser with async clipboard
    // images, so it reports honestly when it cannot.
    function copyCanvasToClipboard(sourceCanvas, done) {
      if (!navigator.clipboard || !window.ClipboardItem) {
        done('This browser cannot copy images to the clipboard. Use the export menu to save a file instead.');
        return;
      }
      sourceCanvas.toBlob(function (blob) {
        if (!blob) { done('Could not render that image.'); return; }
        var item = {};
        item[blob.type] = blob;
        navigator.clipboard.write([new window.ClipboardItem(item)])
          .then(function () { done(null); })
          .catch(function () {
            done('The browser refused the clipboard write. Use the export menu to save a file instead.');
          });
      }, 'image/png');
    }

    // Render just the drawing (no selection chrome, on an opaque background)
    // into an offscreen canvas at export resolution. Shared by the clipboard
    // copy and anything else that wants a clean bitmap.
    function renderToOffscreen(scale) {
      var bbox = structureBBox();
      if (!bbox) return null;
      scale = scale || 3;
      var off = document.createElement('canvas');
      off.width = Math.max(1, Math.round(bbox.width * scale));
      off.height = Math.max(1, Math.round(bbox.height * scale));
      var offCtx = off.getContext('2d');
      offCtx.scale(scale, scale);
      offCtx.translate(-bbox.minX, -bbox.minY);
      offCtx.fillStyle = EXPORT_BG;
      offCtx.fillRect(bbox.minX, bbox.minY, bbox.width, bbox.height);
      var savedCtx = ctx;
      ctx = offCtx;
      try { drawStructure(EXPORT_TEXT, EXPORT_BG); } finally { ctx = savedCtx; }
      return off;
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
    // save/restore are part of the contract, not an optional extra. Anything
    // drawStructure calls may bracket its work with them - the cis/trans bond
    // label and the reaction arrow both do - and a shim without them throws
    // "ctx.save is not a function" and silently produces no file at all. Only
    // the style state needs preserving here; this shim has no transform.
    SVGRenderContext.prototype.save = function () {
      (this._stack || (this._stack = [])).push({
        strokeStyle: this.strokeStyle, fillStyle: this.fillStyle, lineWidth: this.lineWidth,
        font: this.font, textAlign: this.textAlign, textBaseline: this.textBaseline
      });
    };
    SVGRenderContext.prototype.restore = function () {
      var s = this._stack && this._stack.pop();
      if (!s) return;
      this.strokeStyle = s.strokeStyle; this.fillStyle = s.fillStyle; this.lineWidth = s.lineWidth;
      this.font = s.font; this.textAlign = s.textAlign; this.textBaseline = s.textBaseline;
    };
    // Dashes are a canvas-only affordance for on-screen previews; the export
    // never draws committed geometry dashed, so accepting and ignoring the call
    // is correct and keeps the shim from throwing.
    SVGRenderContext.prototype.setLineDash = function () {};
    // Curly arrows are quadratic Beziers. Without this the export threw the
    // moment a mechanism arrow was on the canvas - the same failure the missing
    // save/restore caused, so the shim is now checked against everything
    // drawStructure actually calls rather than only what it called at the time.
    SVGRenderContext.prototype.quadraticCurveTo = function (cx, cy, x, y) {
      this._path.push('Q' + this._r(cx) + ' ' + this._r(cy) + ' ' + this._r(x) + ' ' + this._r(y));
    };
    SVGRenderContext.prototype.arc = function (x, y, r, a0, a1) {
      // Only ever used for full circles here (atom halos, ring markers).
      this._path.push('M' + this._r(x + r) + ' ' + this._r(y) +
        'A' + this._r(r) + ' ' + this._r(r) + ' 0 1 1 ' + this._r(x - r) + ' ' + this._r(y) +
        'A' + this._r(r) + ' ' + this._r(r) + ' 0 1 1 ' + this._r(x + r) + ' ' + this._r(y));
    };
    SVGRenderContext.prototype.strokeRect = function (x, y, w, h) {
      this.elements.push('<rect x="' + this._r(x) + '" y="' + this._r(y) + '" width="' + this._r(w) +
        '" height="' + this._r(h) + '" fill="none" stroke="' + this._esc(this.strokeStyle) +
        '" stroke-width="' + this._r(this.lineWidth) + '"/>');
    };
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
      if (!bbox) { smilesNote('Draw something first.'); return; }
      var shim = new SVGRenderContext();
      var savedCtx = ctx;
      ctx = shim;
      // This shim has now silently swallowed an export twice - once for a
      // missing save/restore, once for quadraticCurveTo - because drawStructure
      // grew a call it did not implement and the throw went nowhere. Catch it,
      // name the method, and say so. A loud failure is the point; the next
      // missing method should be a one-line fix, not an afternoon.
      try {
        drawStructure(EXPORT_TEXT, EXPORT_BG);
      } catch (err) {
        ctx = savedCtx;
        var m = /(\w+) is not a function/.exec(String(err && err.message));
        smilesNote('SVG export failed' + (m ? ': the vector exporter has no "' + m[1] + '". ' : '. ') +
          'PNG and JPEG still work — please report this.');
        return;
      }
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
      if (mode === 'text') {
        var hitLb = findLabelAt(pos.x, pos.y);
        if (hitLb) {
          selectedLabel = hitLb; selectedArrow = null;
          draggingLabel = hitLb; labelDragFrom = pos;
          syncAnnotationPanel(); draw();
          return;
        }
        snapshot();
        selectedLabel = { x: pos.x, y: pos.y, text: pendingLabelText || 'text' };
        pendingLabelText = null;
        selectedArrow = null;
        labels.push(selectedLabel);
        syncAnnotationPanel();
        setStatus('Text placed. Edit it in the box under the canvas, or drag it. Text and arrows are annotation only and never affect a search.');
        draw();
        var tin = document.getElementById('mol-label-text');
        if (tin) { tin.focus(); tin.select(); }
        return;
      }
      if (mode === 'arrow') {
        // An endpoint grab resizes; anywhere else on the shaft moves the whole
        // arrow. Without this an arrow's length and angle were fixed the moment
        // it was drawn, which nothing else in the editor is.
        if (selectedArrow) {
          if (isCurly(selectedArrow)) {
            var ctrl = curlyControl(selectedArrow);
            if (Math.hypot(pos.x - ctrl.x, pos.y - ctrl.y) <= ENDPOINT_GRAB) { snapshot(); draggingBow = true; return; }
          }
          if (Math.hypot(pos.x - selectedArrow.x1, pos.y - selectedArrow.y1) <= ENDPOINT_GRAB) {
            snapshot(); draggingEnd = 1; return;
          }
          if (Math.hypot(pos.x - selectedArrow.x2, pos.y - selectedArrow.y2) <= ENDPOINT_GRAB) {
            snapshot(); draggingEnd = 2; return;
          }
        }
        var hitAr = findArrowAt(pos.x, pos.y);
        if (hitAr) {
          selectedArrow = hitAr; selectedLabel = null;
          draggingArrow = hitAr; arrowDragFrom = pos;
          syncAnnotationPanel(); draw();
          return;
        }
        arrowPreview = { x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y };
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

      if (mode === 'text' && draggingLabel && labelDragFrom) {
        draggingLabel.x += pos.x - labelDragFrom.x;
        draggingLabel.y += pos.y - labelDragFrom.y;
        labelDragFrom = pos;
        draw();
        return;
      }
      if (mode === 'arrow') {
        if (draggingBow && selectedArrow) {
          var bdx = selectedArrow.x2 - selectedArrow.x1, bdy = selectedArrow.y2 - selectedArrow.y1;
          var blen = Math.hypot(bdx, bdy) || 1;
          var bpx = -bdy / blen, bpy = bdx / blen;
          var bmx = (selectedArrow.x1 + selectedArrow.x2) / 2, bmy = (selectedArrow.y1 + selectedArrow.y2) / 2;
          selectedArrow.bow = ((pos.x - bmx) * bpx + (pos.y - bmy) * bpy) / blen;
          draw();
          return;
        }
        if (draggingEnd && selectedArrow) {
          // near-horizontal still snaps flat, same as when drawing
          var other = draggingEnd === 1 ? { x: selectedArrow.x2, y: selectedArrow.y2 } : { x: selectedArrow.x1, y: selectedArrow.y1 };
          var ny = Math.abs(pos.y - other.y) < 12 ? other.y : pos.y;
          if (draggingEnd === 1) { selectedArrow.x1 = pos.x; selectedArrow.y1 = ny; }
          else { selectedArrow.x2 = pos.x; selectedArrow.y2 = ny; }
          draw();
          return;
        }
        if (draggingArrow && arrowDragFrom) {
          var ddx = pos.x - arrowDragFrom.x, ddy = pos.y - arrowDragFrom.y;
          draggingArrow.x1 += ddx; draggingArrow.x2 += ddx;
          draggingArrow.y1 += ddy; draggingArrow.y2 += ddy;
          if (draggingArrow.y1 === draggingArrow.y2) {
            var sy2 = snapToStructureY(draggingArrow.y1);
            draggingArrow.y1 = sy2; draggingArrow.y2 = sy2;
          }
          arrowDragFrom = pos;
          draw();
          return;
        }
        if (arrowPreview) {
          arrowPreview.x2 = pos.x; arrowPreview.y2 = pos.y;
          draw();
          return;
        }
      }

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
      if (mode === 'text') {
        draggingLabel = null; labelDragFrom = null; dragStart = null; moved = false;
        return;
      }
      if (mode === 'arrow') {
        if (draggingBow) { draggingBow = null; dragStart = null; moved = false; return; }
        if (draggingEnd) { draggingEnd = null; dragStart = null; moved = false; return; }
        if (draggingArrow) { draggingArrow = null; arrowDragFrom = null; dragStart = null; moved = false; return; }
        if (arrowPreview) {
          var len = Math.hypot(pos.x - arrowPreview.x1, pos.y - arrowPreview.y1);
          var pending = arrowPreview;
          arrowPreview = null;
          if (len < 15) {
            // Too short to be a deliberate drag: lay down a default horizontal
            // arrow at the click, which is what a scheme wants nine times in ten.
            snapshot();
            var cy0 = snapToStructureY(pending.y1);
            selectedArrow = { x1: pending.x1 - 45, y1: cy0, x2: pending.x1 + 45, y2: cy0, above: '', below: '', kind: pendingArrowKind };
            arrows.push(selectedArrow);
          } else {
            snapshot();
            // Nearly-horizontal drags snap flat; schemes read left to right and
            // a two-degree tilt looks like a mistake.
            var flat = pendingArrowKind.indexOf('curly') !== 0 && Math.abs(pos.y - pending.y1) < 12;
            var y1s = flat ? snapToStructureY(pending.y1) : pending.y1;
            var y2s = flat ? y1s : pos.y;
            selectedArrow = { x1: pending.x1, y1: y1s, x2: pos.x, y2: y2s, above: '', below: '', kind: pendingArrowKind };
            arrows.push(selectedArrow);
          }
          selectedLabel = null;
          syncAnnotationPanel();
          setStatus('Arrow added. Type above/below it in the two boxes under the canvas — reagents above, conditions below. Arrows are annotation only and never affect a search.');
          draw();
          dragStart = null; moved = false;
          return;
        }
      }
      if (mode === 'bracket' && draggingBracketHandle === 'new') {
        if (moved) {
          snapshot();
          // Each drawn box adds a repeat-unit bracket, snapped tight onto the
          // backbone bonds. One = a homopolymer unit; two or more = a copolymer
          // (one block each). Undo removes the last.
          brackets.push(makeDrawnBracket({ x1: draggingBracketPreview.x1, y1: draggingBracketPreview.y1, x2: pos.x, y2: pos.y }));
          labelDrawnBrackets();
          var statusEl = document.getElementById('mol-status');
          if (statusEl) {
            var sides = brackets.filter(function (r) { return r.role === 'sidechain'; }).length;
            statusEl.textContent = sides
              ? 'Side chain bracketed (n) off the main chain (m) — a bottlebrush. Press Search this structure.'
              : brackets.length >= 2
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

    function setStatus(msg) {
      var el = document.getElementById('mol-status');
      if (el) el.textContent = msg;
    }

    function bondInRing(bond) { return inSameRing(atoms, bonds, bond); }

    function handleClick(pos) {
      var a = findAtomAt(pos.x, pos.y);
      var b = !a ? findBondAt(pos.x, pos.y) : null;

      // Erase has to reach arrows as well, or a stray one can only be removed
      // by clearing the whole canvas. Atoms and bonds win the hit test, since
      // an arrow drawn across a structure would otherwise shield it.
      if (mode === 'erase' && !a && !b) {
        var deadLabel = findLabelAt(pos.x, pos.y);
        if (deadLabel) {
          snapshot();
          labels = labels.filter(function (x) { return x !== deadLabel; });
          if (selectedLabel === deadLabel) selectedLabel = null;
          syncAnnotationPanel();
          draw();
          return;
        }
        var deadArrow = findArrowAt(pos.x, pos.y);
        if (deadArrow) {
          snapshot();
          arrows = arrows.filter(function (x) { return x !== deadArrow; });
          if (selectedArrow === deadArrow) selectedArrow = null;
          syncAnnotationPanel();
          draw();
          return;
        }
      }

      if (b) {
        if (mode === 'erase') { snapshot(); bonds = bonds.filter(function (x) { return x.id !== b.id; }); draw(); return; }
        if (mode === 'draw-wedge' || mode === 'draw-hash') {
          snapshot(); b.order = 1; b.stereo = (mode === 'draw-wedge') ? 'wedge' : 'hash'; draw(); return;
        }
        if (mode === 'geom') {
          // Only a double bond has geometry to set, and only one outside a
          // ring - a ring double bond's geometry is decided by the ring, so
          // offering a choice there would be offering a lie.
          if (b.order !== 2) { setStatus('Cis/trans applies to a double bond. Click the bond again with the bond tool to make it double first.'); return; }
          if (bondInRing(b)) { setStatus('That double bond is in a ring, where the ring itself fixes its geometry. Cis/trans is for double bonds in the chain.'); return; }
          var cur = geomFromPositions(b);
          if (!cur) { setStatus('That double bond has no cis or trans: one end carries nothing to be on a side of, or two of the same thing.'); return; }
          var want = b.geom === 'cis' ? 'trans' : (b.geom === 'trans' ? null : 'cis');
          snapshot();
          // The label is not allowed to disagree with the picture. Setting the
          // geometry MOVES the far half of the molecule to match, so the
          // drawing, the hash and any SMILES copied out all say the same thing.
          if (want && cur !== want) flipAcrossBond(b);
          b.geom = want;
          setStatus(want === 'cis' ? 'Double bond set to cis: the chain continues on the same side.'
                  : want === 'trans' ? 'Double bond set to trans: the chain continues on opposite sides.'
                  : 'Geometry cleared: a search will now match both isomers, whichever way the bond is drawn.');
          draw(); return;
        }
        if (mode === 'draw' || mode === 'chain') {
          snapshot(); b.stereo = null; b.order = b.order >= 3 ? 1 : b.order + 1;
          if (b.order !== 2) b.geom = null;
          draw(); return;
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
      // geom acts on a bond and nothing else; without this it would fall
      // through to the chain-building fallback below and drop a stray carbon
      // on the canvas every time someone missed the double bond.
      if (mode === 'rotate' || mode === 'bracket' || mode === 'geom' || mode === 'arrow' || mode === 'text') return;

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
      // Ctrl/Cmd+wheel zooms. The PLAIN wheel is already the ring tool's
      // rotation and stays that way; taking it for zoom would break a control
      // that has a live preview attached to it.
      if (evt.ctrlKey || evt.metaKey) {
        evt.preventDefault();
        var p = canvasPixel(evt);
        zoomAbout(p.x, p.y, evt.deltaY > 0 ? 1 / 1.12 : 1.12);
        return;
      }
      if (mode === 'ring' && pendingRing) {
        evt.preventDefault();
        ringRotationSteps += evt.deltaY > 0 ? 1 : -1;
        draw();
      }
    }, { passive: false });

    // Panning is on the middle button and on space-drag, so it works in every
    // tool without stealing the left button from drawing.
    var panning = false, panFrom = null, spaceHeld = false;
    canvas.addEventListener('mousedown', function (evt) {
      if (evt.button === 1 || (evt.button === 0 && spaceHeld)) {
        evt.preventDefault();
        panning = true;
        panFrom = canvasPixel(evt);
      }
    });
    window.addEventListener('mousemove', function (evt) {
      if (!panning) return;
      var p = canvasPixel(evt);
      viewX += p.x - panFrom.x;
      viewY += p.y - panFrom.y;
      panFrom = p;
      draw();
    });
    window.addEventListener('mouseup', function () { panning = false; });
    window.addEventListener('keydown', function (evt) {
      if (evt.code === 'Space') {
        var t = document.activeElement;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
        spaceHeld = true;
      }
    });
    window.addEventListener('keyup', function (evt) { if (evt.code === 'Space') spaceHeld = false; });
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
    // Expand every superatom vertex into its atomic subgraph before handing
    // the drawing to RDKit. Backed by window.PolymerSuperatoms (superatoms.js)
    // which owns the dictionary and its aliases. If the module fails to load,
    // fall back to the previous NO2-only behavior rather than silently emit an
    // invalid molblock full of unknown element labels.
    function expandSuperatoms(atomList, bondList) {
      var SA = window.PolymerSuperatoms;
      var atoms2 = atomList.map(function (a) { return { id: a.id, el: a.el, x: a.x || 0, y: a.y || 0, charge: a.charge }; });
      var bonds2 = bondList.map(function (b) { return { a: b.a, b: b.b, order: b.order, stereo: b.stereo }; });
      var extra = 0;
      // Iterate a SNAPSHOT of the original length: the array grows in-place as
      // fragment atoms are appended, and expanding those appended atoms again
      // would recurse into the fragment's own element symbols (which are real
      // elements, but re-checking them is wasted work).
      var origLen = atoms2.length;
      for (var i = 0; i < origLen; i++) {
        var a = atoms2[i];
        var canon = SA ? SA.canonicalize(a.el) : (a.el === 'NO2' ? 'NO2' : null);
        var entry = SA && canon ? SA.SUPERATOMS[canon] : (canon === 'NO2' ? { atoms: [{ el: 'N', charge: 1 }, { el: 'O' }, { el: 'O', charge: -1 }], bonds: [[0, 1, 2], [0, 2, 1]] } : null);
        if (!entry) continue;
        // First fragment atom REPLACES the parent in-place so any bond that
        // already points to a.id keeps working - no bond rewriting needed.
        var anchor = entry.atoms[0];
        a.el = anchor.el;
        a.charge = anchor.charge || 0;
        // Append the remaining fragment atoms with fresh ids, laid out around
        // (a.x, a.y). The coordinates are cosmetic - RDKit does its own layout
        // if needed - but keeping them near the anchor avoids surprises in the
        // debug SVG and in fitParsedCoords.
        var localIds = [a.id];
        var extraCount = entry.atoms.length - 1;
        for (var k = 1; k < entry.atoms.length; k++) {
          var atom = entry.atoms[k];
          var angle = 2 * Math.PI * (k - 1) / Math.max(1, extraCount);
          var newAtom = { id: '_sa' + (extra++), el: atom.el, x: a.x + 24 * Math.cos(angle), y: a.y + 24 * Math.sin(angle) };
          if (atom.charge) newAtom.charge = atom.charge;
          atoms2.push(newAtom);
          localIds.push(newAtom.id);
        }
        for (var j = 0; j < entry.bonds.length; j++) {
          var b = entry.bonds[j];
          bonds2.push({ a: localIds[b[0]], b: localIds[b[1]], order: b[2] });
        }
      }
      return { atoms: atoms2, bonds: bonds2 };
    }
    document.addEventListener('keydown', function (evt) {
      if (evt.key === 'Escape') {
        var overlayEl = document.getElementById('mol-periodic-overlay');
        if (overlayEl && !overlayEl.hidden) { closePeriodicTable(); return; }
        if (selectedAtom) { selectedAtom = null; draw(); }
        if (selectedGroup.length) { selectedGroup = []; draw(); }
        // Annotations were not cleared here, so an arrow stayed selected after
        // Escape - and the shape buttons act on the selection, which meant
        // picking a shape for the NEXT arrow silently rewrote the last one.
        if (selectedArrow || selectedLabel) {
          selectedArrow = null; selectedLabel = null;
          syncAnnotationPanel();
          draw();
        }
        return;
      }
      var focused = document.activeElement;
      var typing = !!(focused && (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA'));

      // Ctrl/Cmd shortcuts have to be handled BEFORE the modifier early-return
      // below. That return exists so element hotkeys don't fire on browser
      // shortcuts, but it was also swallowing Ctrl+Z whole - the first key
      // anybody presses after a mistake did nothing at all, on a canvas where
      // the Undo button was the only way back.
      if ((evt.ctrlKey || evt.metaKey) && !evt.altKey) {
        if (typing) return;   // a focused text field keeps its own undo stack
        var ck = evt.key.toLowerCase();
        if (ck === 'z' && !evt.shiftKey) { evt.preventDefault(); undo(); return; }
        if ((ck === 'z' && evt.shiftKey) || ck === 'y') { evt.preventDefault(); redo(); return; }
        if (ck === 'd') { evt.preventDefault(); duplicateSelection(); return; }
        return;
      }
      if (typing) return;

      // Delete/Backspace clears the selection. Without it, removing a group
      // means switching to the erase tool and clicking every atom in turn.
      // Handled here because the element-hotkey path below only accepts
      // single letters and would drop "Delete" on the floor.
      if (evt.key === 'Delete' || evt.key === 'Backspace') {
        // A selected arrow or text label is deletable too. It draws a selection
        // box and the Erase tool could already remove it, so the Delete key
        // ignoring it was just an inconsistency.
        if (selectedArrow || selectedLabel) {
          evt.preventDefault();
          snapshot();
          if (selectedArrow) arrows = arrows.filter(function (x) { return x !== selectedArrow; });
          if (selectedLabel) labels = labels.filter(function (x) { return x !== selectedLabel; });
          selectedArrow = null; selectedLabel = null;
          syncAnnotationPanel();
          draw();
          return;
        }
        var doomed = selectedGroup.length ? selectedGroup.slice() : (hoverAtom ? [hoverAtom] : []);
        if (!doomed.length) return;
        evt.preventDefault();
        snapshot();
        doomed.forEach(function (a) { removeAtom(a.id); });
        selectedGroup = [];
        selectedAtom = null;
        hoverAtom = null;
        draw();
        return;
      }

      if ((!hoverAtom && !selectedGroup.length) || evt.altKey) return;
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

    // Copy the selected atoms and every bond BETWEEN them, offset by half a
    // bond length so the copy is visibly separate, and leave the copy selected
    // so it can be dragged straight into place. Bonds to atoms outside the
    // selection are deliberately not copied: they would have to attach the
    // copy back to the original, which is a guess about what was meant.
    //
    // Worth having because polymer repeat units are so often near-symmetric -
    // a diacid, a bisphenol, a diol - and both halves were being drawn by hand.
    function duplicateSelection() {
      // Annotations duplicate too - a scheme with three identical "+" signs
      // should not mean drawing three of them by hand.
      if (selectedArrow || selectedLabel) {
        snapshot();
        if (selectedArrow) {
          var ac = JSON.parse(JSON.stringify(selectedArrow));
          ac.x1 += 18; ac.x2 += 18; ac.y1 += 18; ac.y2 += 18;
          arrows.push(ac);
          selectedArrow = ac;
        } else {
          var lc = JSON.parse(JSON.stringify(selectedLabel));
          lc.x += 18; lc.y += 18;
          labels.push(lc);
          selectedLabel = lc;
        }
        syncAnnotationPanel();
        setStatus('Copied — drag it into place, or Ctrl+D again.');
        draw();
        return;
      }
      if (!selectedGroup.length) {
        setStatus('Select something first: the Select tool for atoms, or click an arrow or label with its own tool.');
        return;
      }
      snapshot();
      var idMap = {};
      var copies = selectedGroup.map(function (a) {
        var made = addAtom(a.el, a.x + BOND_LEN * 0.6, a.y + BOND_LEN * 0.6);
        made.charge = a.charge;
        idMap[a.id] = made.id;
        return made;
      });
      bonds.slice().forEach(function (b) {
        if (idMap[b.a] === undefined || idMap[b.b] === undefined) return;
        addBond(idMap[b.a], idMap[b.b], b.order);
        var nb = bonds[bonds.length - 1];
        if (nb && b.geom) nb.geom = b.geom;
        if (nb && b.stereo) nb.stereo = b.stereo;
      });
      selectedGroup = copies;
      selectedAtom = null;
      setStatus('Copied ' + copies.length + (copies.length === 1 ? ' atom' : ' atoms') + ' — drag to position, or Ctrl+D again.');
      draw();
    }

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
          if (kind === 'clipboard') {
            var off = renderToOffscreen(3);
            if (!off) smilesNote('Draw something first.');
            else copyCanvasToClipboard(off, function (err) {
              smilesNote(err || 'Copied to the clipboard — paste it straight into a slide or a document.');
            });
          }
          else if (kind === 'svg') exportSVG();
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
    var redoBtn = document.getElementById('mol-redo');
    if (redoBtn) redoBtn.addEventListener('click', redo);
    syncHistoryButtons();
    var clearBtn = document.getElementById('mol-clear');
    if (clearBtn) clearBtn.addEventListener('click', function () {
      snapshot();
      atoms = []; bonds = []; brackets = []; arrows = []; labels = [];
      selectedAtom = null; selectedGroup = []; selectedArrow = null; selectedLabel = null; nextAtomId = 1; nextBondId = 1;
      syncAnnotationPanel();
      resetView();
      draw();
    });
    // Zoom buttons act on the middle of the canvas, which is where the
    // structure is laid out, so the drawing stays put rather than sliding off.
    var zoomInBtn = document.getElementById('mol-zoom-in');
    if (zoomInBtn) zoomInBtn.addEventListener('click', function () { zoomAbout(canvas.width / 2, canvas.height / 2, 1.25); });
    var zoomOutBtn = document.getElementById('mol-zoom-out');
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', function () { zoomAbout(canvas.width / 2, canvas.height / 2, 1 / 1.25); });
    var zoomResetBtn = document.getElementById('mol-zoom-reset');
    if (zoomResetBtn) zoomResetBtn.addEventListener('click', function () { resetView(); draw(); });

    // ---------- Repeat-unit extraction + search ----------
    // otherRects (optional): the other blocks' brackets in a copolymer. A pendant
    // fragment that reaches into another block is a chain continuation, not a
    // side group, so it must stay an open end rather than be absorbed.
    function extractRepeatUnit(rect, otherRects) {
      var x1 = Math.min(rect.x1, rect.x2), x2 = Math.max(rect.x1, rect.x2);
      var y1 = Math.min(rect.y1, rect.y2), y2 = Math.max(rect.y1, rect.y2);
      function inside(a) { return a.x >= x1 && a.x <= x2 && a.y >= y1 && a.y <= y2; }
      var interiorIds = {};
      // A bracket built from a declared repeat already knows exactly which atoms
      // it encloses, so believe that over the box. Geometry alone cannot be
      // trusted for a unit that does not lie left-to-right: an upright box drawn
      // around a diagonal oxyethylene clips its terminal O, and the search would
      // go looking for ethylene.
      if (rect.atomIds) atoms.forEach(function (a) { if (rect.atomIds[a.id]) interiorIds[a.id] = true; });
      else atoms.forEach(function (a) { if (inside(a)) interiorIds[a.id] = true; });

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
          subBonds.push({ a: b.a, b: b.b, order: b.order, stereo: b.geom || undefined });
        } else if (aIn || bIn) {
          boundaryCount++;
          var interiorEnd = aIn ? b.a : b.b;
          var starId = 'S' + (starCount++);
          subAtoms.push({ id: starId, el: '*' });
          subBonds.push({ a: interiorEnd, b: starId, order: b.order, stereo: b.geom || undefined });
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
      var subBonds = bonds.map(function (b) { return { a: b.a, b: b.b, order: b.order, stereo: b.geom || undefined }; });
      var starCount = atoms.filter(function (a) { return a.el === '*'; }).length;
      return { atoms: subAtoms, bonds: subBonds, boundaryCount: starCount, atomCount: atoms.length - starCount };
    }

    // Extract a repeat unit from an explicit set of atom ids (the block's known
    // atoms), instead of geometry. Used for loaded copolymers so a tight,
    // image-style bracket can sit on the backbone with acyclic pendants (an
    // ester, a methyl) poking outside without being miscounted as chain ends.
    function extractFromAtomIds(idSet) {
      var subAtoms = [], subBonds = [], starCount = 0, boundaryCount = 0, count = 0;
      atoms.forEach(function (a) { if (idSet[a.id]) { subAtoms.push({ id: a.id, el: a.el, charge: a.charge }); count++; } });
      bonds.forEach(function (b) {
        var ain = !!idSet[b.a], bin = !!idSet[b.b];
        if (ain && bin) { subBonds.push({ a: b.a, b: b.b, order: b.order, stereo: b.geom || undefined }); }
        else if (ain || bin) {
          boundaryCount++;
          var interiorEnd = ain ? b.a : b.b;
          var starId = 'S' + (starCount++);
          subAtoms.push({ id: starId, el: '*' });
          subBonds.push({ a: interiorEnd, b: starId, order: b.order, stereo: b.geom || undefined });
        }
      });
      return { atoms: subAtoms, bonds: subBonds, boundaryCount: boundaryCount, atomCount: count };
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
    // Is there anything for the Draw button to draw? An entry can sit in the
    // library with atoms: [] - a natural bottlebrush, an architecture rather than
    // a compound - and "atoms: []" is truthy, so the button used to be offered on
    // all of them. Clicking it could only ever produce an apology, which is worse
    // than not offering it: the reader learns there is no structure by trying.
    function canDrawEntry(p) {
      if (!p) return false;
      if (p.atoms && p.atoms.length) return true;
      // A brush is not its blocks laid end to end, so the compose-from-components
      // path declines it. One that can be drawn carries its own atoms, caught above.
      if (p.arch === 'bottlebrush') return false;
      if (p.type !== 'copolymer' || !p.components || p.components.length < 2) return false;
      // Every block has to have a structure of its own, or composing fails partway.
      var db = window.POLYMER_DB || [];
      return p.components.every(function (name) {
        return db.some(function (c) { return c.name === name && c.atoms && c.atoms.length; });
      });
    }
    // Why this one has no structure. The note on the entry usually says so in its
    // last sentence ("Not drawn: ...", "Undrawn: ..."), which is more useful than
    // a generic line, so prefer it and fall back to the architecture.
    function noStructureReason(p) {
      var m = (p.note || '').match(/(?:Not drawn|Undrawn|No structure is drawn|No separate structure is drawn)\b[:,]?\s*([^]*)$/i);
      if (m && m[1]) return m[1].replace(/\s+/g, ' ').trim();
      if (p.arch === 'bottlebrush') return 'a brush is an architecture, and its blocks are not laid end to end along one chain.';
      return 'see the publication links below.';
    }
    // The other tools on the site hold real measured data for some of these
    // polymers, and a card had no way to say so. These links are drawn only
    // where the target actually has the material - the cross-reference is
    // precomputed by scripts/build-xref.js, because deciding it live would mean
    // loading a 200 KB thermal library on every visit to this page, and a link
    // that lands on "not in this library" is worse than no link.
    function crossToolLinks(p) {
      var x = (window.POLYMER_XREF || {})[p.name];
      if (!x) return '';
      var out = [];
      if (x.t) out.push('<a class="mol-xref-link" href="thermal-analysis.html?m=' +
        encodeURIComponent(x.t) + '">&#128293; DSC / TGA / DMA</a>');
      if (x.c) out.push('<a class="mol-xref-link" href="chain-dimensions.html?m=' +
        encodeURIComponent(x.c) + '">&#128207; Chain dimensions</a>');
      return out.length ? '<div class="mol-xref">' + out.join('') + '</div>' : '';
    }

    // The end-group block for a telechelic grade. Equivalent weight is the
    // number someone actually weighs out, so it leads; the supplier's own
    // published figure is shown next to it rather than instead of it, because
    // AHEW and equivalent weight are not the same quantity and quietly
    // presenting one as the other is how a formulation ends up off by two.
    function telechelicHtml(p) {
      var t = p && p.telechelic;
      if (!t) return '';
      // On a star the same number means something more concrete: Mn/f is the
      // ARM molecular weight, which is what sets the mesh size of a gel made
      // from it. Saying "per end group" there buries the useful reading.
      var isStar = p.arch === 'star';
      var bits = [escapeHtml(t.endGroup) + '-terminated'];
      bits.push(isStar ? t.functionality + ' arms' + (t.core ? ' on ' + escapeHtml(t.core) : '') : 'f ≈ ' + t.functionality);
      bits.push('<strong>' + t.equivalentWeight + ' g/eq</strong> ' + (isStar ? 'per arm' : 'per end group'));
      if (t.mn) bits.push('M<sub>n</sub> ≈ ' + t.mn + (isStar ? ' total' : ''));
      return '<div class="mol-result-note mol-telechelic">' +
        '<strong>' + (isStar ? 'Arms and end groups.' : 'End groups.') + '</strong> ' +
        bits.join(' &nbsp;&middot;&nbsp; ') +
        '. Supplier figure: ' + escapeHtml(t.spec) + '. ' +
        '<em>' + escapeHtml(t.source) + '</em></div>';
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
        telechelicHtml(p) +
        (p.note ? '<div class="mol-result-note">' + escapeHtml(p.note) + '</div>' : '') +
        (canDrawEntry(p)
          ? '<div class="mol-result-actions">' +
              '<button type="button" class="mol-draw-btn" data-poly-name="' + escapeHtml(p.name) +
              '" title="Load this ' + (p.type === 'copolymer' ? 'copolymer, block by block,' : 'repeat unit') + ' into the editor and pull its publications">' +
              '&#9998; Draw &amp; find publications</button>' +
            '</div>'
          : '<div class="mol-result-actions mol-no-structure">' +
              'No repeat unit on file &mdash; ' + escapeHtml(noStructureReason(p)) +
            '</div>') +
        crossToolLinks(p) +
        publicationLinks(p) +
        '</div>';
    }
    // Clear the previous polymer's identification and publications WITHOUT
    // touching the results list. The decline paths below need exactly this: they
    // tell the reader to use the publication links on the card, so the card has
    // to survive. They used to call renderResults([]), which also wiped the
    // results - so clicking "Draw" on a polymer with no repeat unit replaced the
    // card and its five publication links with "No matches.", and the message
    // pointed at links the same click had just deleted.
    function clearIdentification() {
      var resultsEl = document.getElementById('mol-results');
      var idEl = document.getElementById('mol-identify');   // only the no-match path shows it
      if (idEl) { idEl.hidden = true; idEl.innerHTML = ''; }
      // Restore the publications panel below the results (the no-match path
      // lifts it up under the identification; put it back for exact/browse).
      var pubEl = document.getElementById('mol-publications');
      if (pubEl && resultsEl && resultsEl.nextSibling !== pubEl) resultsEl.parentNode.insertBefore(pubEl, resultsEl.nextSibling);
      renderPublications(null);   // structure-search paths refill this after
    }
    function renderResults(list, schemeFor) {
      var resultsEl = document.getElementById('mol-results');
      if (!resultsEl) return;
      clearIdentification();
      pendingScheme = null;
      if (!list.length) { resultsEl.innerHTML = '<p class="guide-note">No matches.</p>'; return; }
      // Which polymer the scheme belongs to is the CALLER's call, because only
      // the caller knows how confident the answer is. An exact structure match
      // is one polymer. A name search that resolves to one entry is one
      // polymer. Browsing a category is a list, and drawing a scheme for
      // whichever entry sorted first would dress an arbitrary pick up as the
      // answer. Guessing from the list alone got this wrong in both
      // directions - a name search for "polystyrene" returns 23 entries across
      // 7 mechanism classes and showed nothing at all.
      var scheme = schemeFor ? reactionSchemeHtml(schemeFor) : '';
      resultsEl.innerHTML = scheme + list.map(polymerCard).join('');
      drawPendingScheme();
    }

    // For a structure match: the hits share a repeat unit, so they share a
    // monomer - but only claim that when they also agree on the mechanism.
    function schemeCandidate(list) {
      if (!list || !list.length) return null;
      return list.every(function (p) { return p.cls === list[0].cls; }) ? list[0] : null;
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
          // If the vendored script loaded but window.initRDKitModule is
          // missing or throws, the promise would sit unresolved forever and
          // every future Search/Copy would hang the same way. Force it to
          // reject so the .catch below clears rdkitPromise and the next click
          // retries from scratch.
          try {
            if (typeof window.initRDKitModule !== 'function') {
              reject(new Error('initRDKitModule not defined after script load'));
              return;
            }
            var p = window.initRDKitModule({ locateFile: function (f) { return 'vendor/' + f; } });
            if (!p || typeof p.then !== 'function') {
              reject(new Error('initRDKitModule did not return a promise'));
              return;
            }
            p.then(resolve, reject);
          } catch (e) { reject(e); }
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
        // What disqualifies an entry is having no structure, NOT being typed a
        // copolymer - the same correction fingerprintOf already carries. A
        // bottlebrush is typed 'copolymer' and does have one drawable unit,
        // with the side chain nested inside it, so this guard was hiding ten
        // entries from every RDKit-backed answer: similarity ranking, "contains
        // fragment", and SMARTS. They were findable by exact hash and invisible
        // to everything else.
        if (!p.atoms || !p.atoms.length) return;
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
    // Below this a Morgan/Tanimoto score is not telling you anything useful
    // about a repeat unit, so there is no point listing it at all.
    var SIM_WEAK_FLOOR = 0.25;
    var SIM_MAX_SHOWN = 15;
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
      resultsEl.innerHTML = tgAnaloguePanel(ranked) + strong.map(card).join('') +
        (weak.length
          ? '<details class="mol-sim-weak"><summary>' +
            (strong.length ? 'Weaker similarities' : 'No close library structures &mdash; weak similarities') +
            ' (below ' + Math.round(SIM_STRONG * 100) + '%)</summary>' + weak.map(card).join('') + '</details>'
          : '');
    }

    // ---------- Measured Tg of the nearest relatives ----------
    //
    // Deliberately NOT a predicted Tg. A group-contribution model was fitted to
    // this library's own 60 measured values and leave-one-out tested: RMSE 58 K
    // against a 84 K "always guess the mean" baseline, with individual misses
    // over 200 K (polyisobutylene, -70 C, came out at +141 C). Similarity-
    // weighted neighbours do better - RMSE 36 K - but only where a >=95%-similar
    // relative exists, which is barely half the library, and the errors are
    // worst exactly where the structures look most alike: poly(methacrylic acid)
    // is 185 C and PMMA is 105 C at 97% similarity. A single number carrying
    // that error would be read as an answer.
    //
    // So the measured values are shown as themselves, with the spread visible,
    // and the reader does the extrapolating. The panel exists because only 60 of
    // the library's 402 structures carry a Tg at all, so the nearest relative
    // that HAS one is usually not among the similarity cards above.
    var TG_ANALOGUES = 4;
    function tgOf(p) {
      var m = /(-?\d+(?:\.\d+)?)\s*°?\s*C/.exec(p && p.tg);
      return m ? parseFloat(m[1]) : null;
    }
    function tgAnaloguePanel(ranked) {
      var hits = [];
      for (var i = 0; i < ranked.length && hits.length < TG_ANALOGUES; i++) {
        var t = tgOf(ranked[i].p);
        if (t !== null) hits.push({ p: ranked[i].p, sim: ranked[i].sim, tg: t });
      }
      if (hits.length < 2) return '';
      var lo = hits[0].tg, hi = hits[0].tg;
      hits.forEach(function (h) { lo = Math.min(lo, h.tg); hi = Math.max(hi, h.tg); });
      var spread = hi - lo;
      return '<div class="mol-tg-analogues">' +
        '<h4>Measured T<sub>g</sub> of the nearest relatives</h4>' +
        '<ul>' + hits.map(function (h) {
          return '<li><span class="mol-tg-val">' + h.tg + ' &deg;C</span> ' +
            escapeHtml(h.p.name) + ' <span class="mol-tg-sim">' + Math.round(h.sim * 100) + '% similar</span></li>';
        }).join('') + '</ul>' +
        '<p>These are <strong>measured values for other polymers</strong>, not an estimate for your structure. ' +
        (spread >= 40
          ? 'They span ' + Math.round(spread) + ' &deg;C, so this neighbourhood does not pin a value down: a methyl or a hydrogen bond in the wrong place moves T<sub>g</sub> further than the whole spread. '
          : 'They agree to within ' + Math.round(spread) + ' &deg;C here, which is about as tight as structural analogy gets. ') +
        'This site does not compute a group-contribution T<sub>g</sub>, because tested against its own measured values the method was wrong by more than it was right.</p>' +
        '</div>';
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
    var pubRetried = false;     // one retry per request when Crossref throttles
    // Crossref's polite pool wants a contact address; it triples the rate limit.
    // Already published on the founder and privacy pages, so this is not a new
    // disclosure.
    var CROSSREF_CONTACT = 'ngpierini@gmail.com';

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

    // Relevance needles: the distinctive names/phrases for this polymer, used to
    // drop Crossref hits that merely share a generic word ("methacrylate") but
    // aren't about it. Keeps multi-word phrases (the monomer name) and long
    // distinctive tokens, so a common polymer still matches by its phrase while a
    // niche one ("tetrahydrogeranyl methacrylate") isn't buried under generics.
    var PUB_STOP = { methacrylate: 1, methacrylates: 1, acrylate: 1, acrylates: 1, acrylic: 1, polymer: 1, polymers: 1, copolymer: 1, copolymers: 1, homopolymer: 1 };
    function pubNeedles(polymer) {
      var out = [];
      function add(s) { s = String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); if (s) out.push(s); }
      if (polymer.monomer) add(polymer.monomer.split('(')[0]);
      (polymer.aka || []).forEach(add);
      // A telechelic's end group is the whole point of the grade, and the token
      // rule below only promotes words of seven characters or more - so "thiol"
      // and "amine" were thrown away while "maleimide" and "acrylate" survived.
      // Measured on the 4-arm PEGs: of thirty papers fetched, the maleimide and
      // acrylate grades kept 17 and 14, while the thiol kept 1 and the amine and
      // hydroxyl kept 2 each, purely because of that length cutoff. The end
      // group and the core are named in the data, so use them directly.
      if (polymer.telechelic) {
        add(polymer.telechelic.endGroup);
        add(polymer.telechelic.core);
      }
      var nm = String(polymer.name || '').toLowerCase();
      add(nm);
      add(nm.replace(/^poly\s*\(/, '').replace(/\)\s*$/, ''));
      out.slice().forEach(function (phrase) {
        phrase.replace(/[^a-z0-9]+/g, ' ').split(' ').forEach(function (tok) {
          if (tok.length >= 7 && !PUB_STOP[tok]) out.push(tok);
        });
      });
      var norm = out.map(function (n) { return n.replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim(); })
        .filter(function (n) { return n.length >= 4; });
      return norm.filter(function (n, i) { return norm.indexOf(n) === i; });
    }
    function pubIsRelevant(title, needles) {
      var t = ' ' + String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
      return needles.some(function (n) { return t.indexOf(n) !== -1; });
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
      // `mailto` puts this in Crossref's "polite pool". It is not etiquette
      // alone: measured against the live API, an anonymous caller is capped at
      // ONE request per second and starts returning 429 on the third rapid
      // call, while a request carrying a contact address is allowed three. The
      // old code turned any non-200 into an empty list, so a throttled reply
      // was reported as "no journal articles came back" - a user clicking
      // through several polymers, or pressing "New papers" twice, was being
      // told the literature was empty when it was Crossref saying slow down.
      // The address is already published on the founder and privacy pages.
      var url = 'https://api.crossref.org/works?query.bibliographic=' +
        encodeURIComponent(terms.join(' ')) +
        '&filter=' + encodeURIComponent(filters.join(',')) +
        '&rows=30' +
        (pubFetchOffset ? '&offset=' + pubFetchOffset : '') +
        '&mailto=' + encodeURIComponent(CROSSREF_CONTACT) +
        '&select=' + encodeURIComponent('title,author,container-title,short-container-title,DOI,published,published-print,published-online');

      fetch(url).then(function (r) {
        // Throttling is a temporary, self-correcting condition and has to say so
        // rather than masquerade as an empty result set.
        if (r.status === 429) return { __throttled: true };
        return r.ok ? r.json() : null;
      }).then(function (data) {
        if (myToken !== pubToken) return;       // a newer request superseded this
        if (data && data.__throttled) {
          if (pubRetried) {
            pubRetried = false;
            list.innerHTML = '<div class="guide-note">Crossref is limiting requests right now. Give it a few seconds and press &#8635; New papers, or use the search links on the match above.</div>';
            return;
          }
          pubRetried = true;
          list.innerHTML = '<div class="mol-pub-loading guide-note">Crossref asked us to slow down &mdash; retrying&hellip;</div>';
          setTimeout(function () { if (myToken === pubToken) fetchPublications(polymer); }, 1500);
          return;
        }
        pubRetried = false;
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
        // Crossref ranks by relevance but never filters, so a niche polymer with
        // no dedicated literature floats up high-impact papers that merely share
        // a family word ("methacrylate"). Keep only papers that actually name the
        // polymer or its monomer; if none do, say so plainly rather than mislead.
        var needles = pubNeedles(polymer);
        var relevant = needles.length
          ? papers.filter(function (p) { return pubIsRelevant(p.title, needles); })
          : papers;
        if (!relevant.length) {
          if (pubFetchOffset > 0) { pubFetchOffset = 0; fetchPublications(polymer); return; }
          list.innerHTML = '<div class="guide-note">No journal articles that specifically name <strong>' +
            escapeHtml(name) + '</strong> (or its monomer) came back' +
            (rangeDef.days ? ' for the ' + escapeHtml(rangeLabel) : '') +
            '. It may be too new or too niche for the Crossref index &mdash; use the PubChem, Scholar, and Patents links on the match above to look it up directly.</div>';
          return;
        }
        pubFetchOffset += 30;
        // Rank the pool: venue weight minus a relevance-position penalty, so a
        // flagship-journal paper floats up while Crossref's order still breaks
        // ties and ranks the unweighted remainder.
        pubPool = relevant.map(function (p, i) { return { p: p, s: journalWeight(p.journal) - i * 2, i: i }; })
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
    function fitParsedCoords(parsed, target) {
      target = target || canvas;
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
      if (w > 0) scale = Math.min(scale, (target.width - 70) / w);
      if (h > 0) scale = Math.min(scale, (target.height - 70) / h);
      var cx0 = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2;
      var cy0 = (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2;
      return parsed.atoms.map(function (a) {
        return {
          x: target.width / 2 + (a.x - cx0) * scale,
          y: target.height / 2 - (a.y - cy0) * scale
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
    // `ends` overrides how the two ends of the chain are found. A repeat unit
    // marks them with "*"; a depiction has no "*" at all, so it names them in
    // its data instead - the longest path through JEFFAMINE D-230 is a tie
    // between amine-to-amine and methyl-to-methyl, and the wrong choice lays
    // the methyls along the backbone with the amines hanging off the side.
    function layoutRepeatUnit(parsed, ends) {
      var A = parsed.atoms, BND = parsed.bonds, n = A.length;
      function sub(p, q) { return { x: p.x - q.x, y: p.y - q.y }; }
      function nrm(p) { var m = Math.hypot(p.x, p.y) || 1; return { x: p.x / m, y: p.y / m }; }
      function rot(p, a) { var c = Math.cos(a), s = Math.sin(a); return { x: p.x * c - p.y * s, y: p.x * s + p.y * c }; }

      var stars = [];
      if (ends && ends.length === 2) stars = ends.slice();
      else for (var i = 0; i < n; i++) if (A[i].el === '*') stars.push(i);
      if (stars.length !== 2 || stars[0] === stars[1]) return false;
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

    // How badly a candidate layout runs into itself: non-bonded atoms sitting on
    // top of each other, plus bonds crossing. Measured in units of the drawing's
    // own median bond length, so the two candidates can be compared even though
    // one comes back in RDKit's units and the other in canvas pixels.
    function layoutCrowding(parsed) {
      var A = parsed.atoms, B = parsed.bonds;
      if (!B.length) return 0;
      var lens = B.map(function (b) {
        return Math.hypot(A[b.a - 1].x - A[b.b - 1].x, A[b.a - 1].y - A[b.b - 1].y);
      }).sort(function (p, q) { return p - q; });
      var unit = lens[Math.floor(lens.length / 2)] || 1;
      var bonded = {};
      B.forEach(function (b) { bonded[b.a + '-' + b.b] = 1; bonded[b.b + '-' + b.a] = 1; });
      var lim = unit * 0.75, hits = 0, i, j;
      for (i = 0; i < A.length; i++) {
        for (j = i + 1; j < A.length; j++) {
          if (bonded[(i + 1) + '-' + (j + 1)]) continue;
          if (Math.hypot(A[i].x - A[j].x, A[i].y - A[j].y) < lim) hits++;
        }
      }
      // Crossed bonds read as badly as overlapping atoms, and a folded-back
      // pendant arm usually produces them before it produces true overlaps.
      function crosses(p1, p2, p3, p4) {
        function side(a, b, c) { return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x); }
        var d1 = side(p3, p4, p1), d2 = side(p3, p4, p2), d3 = side(p1, p2, p3), d4 = side(p1, p2, p4);
        return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0));
      }
      for (i = 0; i < B.length; i++) {
        for (j = i + 1; j < B.length; j++) {
          var b1 = B[i], b2 = B[j];
          if (b1.a === b2.a || b1.a === b2.b || b1.b === b2.a || b1.b === b2.b) continue;
          if (crosses(A[b1.a - 1], A[b1.b - 1], A[b2.a - 1], A[b2.b - 1])) hits++;
        }
      }
      return hits;
    }

    // Rescale a laid-out unit so one bond spans BOND_LEN, whichever layout
    // produced it. Anything that places several units side by side has to do
    // this first, or it is adding pixel offsets to RDKit-scale coordinates.
    function normalizeBondScale(parsed) {
      var A = parsed.atoms;
      var lens = parsed.bonds.map(function (b) {
        var p = A[b.a - 1], q = A[b.b - 1];
        return Math.hypot(p.x - q.x, p.y - q.y);
      }).filter(function (l) { return l > 1e-6; }).sort(function (x, y) { return x - y; });
      if (!lens.length) return;
      var k = BOND_LEN / lens[Math.floor(lens.length / 2)];
      if (!isFinite(k) || Math.abs(k - 1) < 1e-6) return;
      A.forEach(function (a) { a.x *= k; a.y *= k; });
    }

    // layoutRepeatUnit draws the textbook picture - backbone horizontal, pendants
    // hanging off it - by lifting each pendant's shape from RDKit and rotating it
    // rigidly outward. That is right for a vinyl polymer with a small side group,
    // but a bottlebrush's pendant is a whole chain, and swinging it onto the
    // backbone normal can fold it back through itself. So build both candidates,
    // count how badly each runs into itself, and keep the cleaner one; ties go to
    // the horizontal backbone, which leaves every structure that already drew
    // well exactly as it was.
    // Turn a drawing so a named pair of bonds lies on a horizontal axis, the
    // first on the left. layoutBest orients a repeat unit by its two "*" chain
    // ends; a DEPICTION has none - it is a finished molecule - so both layout
    // routines bail out and it keeps whatever angle RDKit happened to produce.
    // That is why the brackets on a telechelic met their bonds at unrelated
    // angles and did not read as a pair. The bracket's own two cut bonds are
    // the axis a polymer is conventionally drawn along, so use those.
    function orientByCuts(parsed, srcAtoms, cuts) {
      var idxOf = {};
      srcAtoms.forEach(function (a, i) { idxOf[a.id] = i; });
      var mid = cuts.map(function (c) {
        var p = parsed.atoms[idxOf[c[0]]], q = parsed.atoms[idxOf[c[1]]];
        if (!p || !q) return null;
        return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
      });
      if (!mid[0] || !mid[1]) return;
      var dx = mid[1].x - mid[0].x, dy = mid[1].y - mid[0].y;
      if (Math.hypot(dx, dy) < 1e-6) return;
      var ang = Math.atan2(dy, dx), cos = Math.cos(-ang), sin = Math.sin(-ang);
      var cx = 0, cy = 0;
      parsed.atoms.forEach(function (a) { cx += a.x; cy += a.y; });
      cx /= parsed.atoms.length; cy /= parsed.atoms.length;
      parsed.atoms.forEach(function (a) {
        var x = a.x - cx, y = a.y - cy;
        a.x = cx + x * cos - y * sin;
        a.y = cy + x * sin + y * cos;
      });
    }

    function layoutBest(parsed) {
      var rdkit = parsed.atoms.map(function (a) { return { x: a.x, y: a.y }; });
      function restore() { parsed.atoms.forEach(function (a, i) { a.x = rdkit[i].x; a.y = rdkit[i].y; }); }

      if (!layoutRepeatUnit(parsed)) { restore(); orientRepeatUnit(parsed); return; }
      var zig = parsed.atoms.map(function (a) { return { x: a.x, y: a.y }; });
      var zigCrowd = layoutCrowding(parsed);
      if (zigCrowd === 0) return;

      restore();
      orientRepeatUnit(parsed);
      // Fewer collisions wins, and a tie goes to the textbook backbone. Nothing
      // else: an earlier version also preferred whichever drew bigger, which was
      // wrong twice over. It depended on the canvas size, so the same polymer
      // drew differently in different windows; and RDKit's layout can leave both
      // chain ends low and close together, which puts the bracket bars in a
      // huddle at one corner with the repeat unit sitting outside them. The
      // horizontal backbone is what makes a polymer bracket read correctly, so
      // it is only given up for a drawing that genuinely collides less.
      if (layoutCrowding(parsed) < zigCrowd) return;
      parsed.atoms.forEach(function (a, i) { a.x = zig[i].x; a.y = zig[i].y; });
    }

    // One bracket bar, sitting on the bond it cuts. "ax,ay" is the bar's own
    // direction and "tx,ty" the way its ticks turn. A main-chain bracket keeps
    // upright bars even where the backbone zigzags, because that is how the
    // notation is drawn and turning them to each bond makes the pair look
    // crooked. A side chain has no such axis to follow, so its bars are set
    // across the bond instead, which is right at whatever angle it runs.
    // The bracket geometry itself lives in bracket-geometry.js, DOM-free, so
    // scripts/check-bracket-geometry.js can exercise it over a sweep of bond
    // angles in Node. These three are thin adapters that hand it the editor's
    // current atoms and bonds; the call sites are unchanged.
    //
    // BAR_OUT slides each bar along its bond away from the unit. The midpoint is
    // the crowded end whenever the bond leaves a ring - which is exactly when
    // the clipper has least room - so a small outward bias buys clearance
    // without touching the clipper's floor, and the floor is what stops a bar
    // slicing through a neighbouring bond.
    var BAR_OUT = 0.16;
    var BAR_FLOOR_FRAC = 0.22;

    function barOnBond(outside, inside, upright, bias) {
      return BG.barOnBond(outside, inside, upright, bias === undefined ? BAR_OUT : bias);
    }

    function clearRun(px, py, dx, dy, want, cutA, cutB) {
      return BG.clearRun(atoms, bonds, px, py, dx, dy, want, cutA, cutB);
    }

    function clipBarHalf(bar, want) {
      return BG.clipBarHalf(atoms, bonds, bar, want, BOND_LEN * BAR_FLOOR_FRAC);
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
    // Every atom reachable from one atom, as an id map. A repeat unit has to be
    // ONE connected fragment: two separate pieces carrying one open end each are
    // not a repeat unit, however much the pair looks like one on screen.
    function fragmentOf(startId) {
      var seen = {}, stack = [startId];
      seen[startId] = true;
      while (stack.length) {
        var id = stack.pop();
        for (var i = 0; i < bonds.length; i++) {
          var b = bonds[i], other = null;
          if (b.a === id) other = b.b;
          else if (b.b === id) other = b.a;
          else continue;
          if (!seen[other]) { seen[other] = true; stack.push(other); }
        }
      }
      return seen;
    }

    function fragmentCount() {
      var seen = {}, n = 0;
      atoms.forEach(function (a) {
        if (seen[a.id]) return;
        n++;
        var f = fragmentOf(a.id);
        Object.keys(f).forEach(function (k) { seen[k] = true; });
      });
      return n;
    }

    function repeatUnitBracket() {
      var stars = atoms.filter(function (a) { return a.el === '*'; });
      var core = atoms.filter(function (a) { return a.el !== '*'; });
      if (stars.length !== 2 || !core.length) return null;
      // Both open ends must sit on the same fragment. Without this, the image
      // recogniser returning two disconnected pieces with one "*" each was
      // bracketed and announced as "a repeat unit with two attachment points",
      // and then searched as though it were one.
      if (!fragmentOf(stars[0].id)[stars[1].id]) return null;
      function neighborOf(star) {
        for (var i = 0; i < bonds.length; i++) {
          if (bonds[i].a === star.id) return atomById(bonds[i].b);
          if (bonds[i].b === star.id) return atomById(bonds[i].a);
        }
        return null;
      }
      var nA = neighborOf(stars[0]), nB = neighborOf(stars[1]);
      if (!nA || !nB) return null;
      var barsRU = [barOnBond(stars[0], nA, true), barOnBond(stars[1], nB, true)];
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
        y2: yc + halfH,
        bars: barsRU
      };
    }

    // Tight cosmetic bracket for an explicit atom-id set: two bars on the bonds
    // that cross the set's boundary (the backbone entering/leaving), with a small
    // height so pendant groups hang outside. Returns null unless exactly two
    // bonds cross. Shared by the drawn-bracket snap and the copolymer loader.
    function tightBracketForIds(idSet) {
      var crossings = [], barsT = [];
      bonds.forEach(function (b) {
        var ain = !!idSet[b.a], bin = !!idSet[b.b];
        if (ain === bin) return;
        var ia = atomById(ain ? b.a : b.b), ea = atomById(ain ? b.b : b.a);
        // INWARD bias here, the opposite of a repeat-unit bracket. Two adjacent
        // blocks share their junction bond, so each puts a bar on it. Biased
        // outward, each bar slides away from its own block and the two cross:
        // the left block's closing bar ends up to the RIGHT of the right
        // block's opening bar, which draws "[ ]" where "] [" belongs. Measured
        // on polystyrene-b-polyisoprene, where the two bars on the shared bond
        // sat at x = 467 and x = 442. Biasing each toward its own block keeps
        // them in order and separates them at the same time.
        if (ia && ea) { crossings.push({ x: (ia.x + ea.x) / 2, y: (ia.y + ea.y) / 2 }); barsT.push(barOnBond(ea, ia, true, -BAR_OUT)); }
      });
      if (crossings.length !== 2) return null;
      var a = crossings[0], b2 = crossings[1];
      var yc = (a.y + b2.y) / 2;
      var halfH = Math.max(BOND_LEN * 0.6, Math.abs(a.y - b2.y) / 2 + BOND_LEN * 0.4);
      return { x1: Math.min(a.x, b2.x), x2: Math.max(a.x, b2.x), y1: yc - halfH, y2: yc + halfH, bars: barsT };
    }

    // The same thing for a unit that does not run left-to-right. Upright bars in
    // a box only separate a repeat unit when its chain is roughly horizontal; a
    // bottlebrush's pendant chain climbs diagonally, and there the box clips the
    // atom at the far end off the unit (the terminal O of an oxyethylene, which
    // would then read as ethylene). So each bar is drawn across the bond it cuts
    // instead, which is right at any angle. The box is kept as the unit's bounds
    // for panning and for fitting the canvas; extractRepeatUnit reads atomIds.
    function angledBracketForIds(idSet) {
      var bars = [], xs = [], ys = [];
      bonds.forEach(function (b) {
        var ain = !!idSet[b.a], bin = !!idSet[b.b];
        if (ain === bin) return;
        var ia = atomById(ain ? b.a : b.b), ea = atomById(ain ? b.b : b.a);
        if (!ia || !ea) return;
        bars.push(barOnBond(ea, ia, false));
      });
      if (bars.length !== 2) return null;
      atoms.forEach(function (at) { if (idSet[at.id]) { xs.push(at.x); ys.push(at.y); } });
      if (!xs.length) return null;
      bars.forEach(function (bar) { xs.push(bar.x); ys.push(bar.y); });
      return {
        x1: Math.min.apply(null, xs) - 6, x2: Math.max.apply(null, xs) + 6,
        y1: Math.min.apply(null, ys) - 6, y2: Math.max.apply(null, ys) + 6,
        bars: bars
      };
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
      var tight = tightBracketForIds(idSet);
      // Only adopt the tight bracket if it still extracts to a clean two-ended
      // unit. A ring pendant (phenyl) gets re-absorbed and stays valid; an
      // acyclic pendant (methyl, ester) would poke out and add a spurious end,
      // so there we keep the drawn box, which already encloses it.
      if (!tight) return rect;
      return extractRepeatUnit(tight).boundaryCount === 2 ? tight : rect;
    }

    // The main chain is the path between the two open ends. Returns the ids on
    // it, or null when the drawing has no two chain ends to define one.
    function mainChainIds() {
      var stars = atoms.filter(function (a) { return a.el === '*'; });
      if (stars.length !== 2) return null;
      var adj = {};
      atoms.forEach(function (a) { adj[a.id] = []; });
      bonds.forEach(function (b) {
        if (adj[b.a]) adj[b.a].push(b.b);
        if (adj[b.b]) adj[b.b].push(b.a);
      });
      var prev = {}, seen = {}, q = [stars[0].id];
      seen[stars[0].id] = true;
      while (q.length) {
        var u = q.shift();
        if (u === stars[1].id) break;
        adj[u].forEach(function (v) { if (!seen[v]) { seen[v] = true; prev[v] = u; q.push(v); } });
      }
      if (!seen[stars[1].id]) return null;
      var path = {};
      for (var c = stars[1].id; c !== undefined; c = prev[c]) path[c] = true;
      return path;
    }

    // Turn a dragged box into the right kind of bracket. A second bracket used to
    // mean a second block without asking where it sat, so there was no way to
    // draw a bottlebrush: its pendant repeat is not another block further along
    // the chain. A bracket whose atoms all lie OFF the main chain is a side
    // chain, and the drawing already says which that is - no extra tool or mode
    // needed, just where the user dragged the box.
    function makeDrawnBracket(rect) {
      var x1 = Math.min(rect.x1, rect.x2), x2 = Math.max(rect.x1, rect.x2);
      var y1 = Math.min(rect.y1, rect.y2), y2 = Math.max(rect.y1, rect.y2);
      var idSet = {}, count = 0;
      atoms.forEach(function (a) {
        if (a.el === '*') return;
        if (a.x >= x1 && a.x <= x2 && a.y >= y1 && a.y <= y2) { idSet[a.id] = true; count++; }
      });
      var main = mainChainIds();
      var offMain = !!main && count > 0 && Object.keys(idSet).every(function (id) { return !main[id]; });
      if (offMain) {
        var ang = angledBracketForIds(idSet);
        // Only a unit the chain enters once and leaves once can carry a bracket;
        // anything else (a box over a branch point, or over a whole end group)
        // falls through to the ordinary block bracket rather than being drawn as
        // a repeat it is not.
        if (ang) {
          ang.atomIds = idSet;
          ang.role = 'sidechain';
          return ang;
        }
      }
      var box = snapBracketTight(rect);
      if (main && count > 0) box.role = 'backbone';
      return box;
    }

    // Subscripts only mean anything once a side chain is in the picture: until
    // then the brackets are blocks and the existing positional lettering applies.
    function labelDrawnBrackets() {
      if (!brackets.some(function (r) { return r.role === 'sidechain'; })) return;
      var m = 0, n = 0;
      brackets.forEach(function (r) {
        if (r.role === 'sidechain') { n++; r.label = n > 1 ? 'n' + n : 'n'; }
        else { m++; r.label = m > 1 ? 'm' + m : 'm'; }
      });
    }

    // Read double-bond geometry off the laid-out drawing. "cis" here means the
    // two ranking substituents sit on the SAME side of the double bond, which
    // for a polymer repeat unit is the chain on both ends - cis-1,4-polyisoprene
    // in the sense a polymer chemist means it, and CIP Z as well, because the
    // chain outranks the hydrogen or methyl it competes with.
    //
    // Only ever called on a SMILES that actually wrote "/" or "\": RDKit lays
    // an unspecified C=C out in a zigzag like any other, so deriving geometry
    // from coordinates unasked would invent a trans that the input never
    // claimed - and silently turn "which polybutadiene?" into a wrong answer.
    function geomOf(atomList, bondList, bond) {
      if (bond.order !== 2 || inSameRing(atomList, bondList, bond)) return null;
      var by = {};
      atomList.forEach(function (a) { by[a.id] = a; });
      var a1 = by[bond.a], a2 = by[bond.b];
      if (!a1 || !a2) return null;
      // Which branch off this alkene carbon is the CHAIN. Not CIP: "cis-1,4-
      // polyisoprene" and "trans-1,4-polychloroprene" both name where the
      // BACKBONE goes, and for chloroprene those two answers disagree, because
      // chlorine outranks carbon and CIP would call the backbone-cis polymer E.
      // Naming it after the priority rule instead of the chain would have
      // printed "trans" on the cis structure. So: the branch that reaches a
      // chain end wins, and failing that the branch that carries more of the
      // molecule.
      function branch(centre, other) {
        var cands = [];
        bondList.forEach(function (nb) {
          if (nb === bond) return;
          var o = nb.a === centre.id ? by[nb.b] : (nb.b === centre.id ? by[nb.a] : null);
          if (o && o.id !== other.id) cands.push(o);
        });
        if (cands.length === 1) return cands[0];
        if (!cands.length) return null;
        var scored = cands.map(function (o) { return { at: o, s: reach(o, centre.id) }; });
        scored.sort(function (x, y) {
          return (y.s.star - x.s.star) || (y.s.n - x.s.n);
        });
        // Equally sized, equally star-free branches are equivalent substituents,
        // and then the double bond has no cis or trans to state.
        if (scored[0].s.star === scored[1].s.star && scored[0].s.n === scored[1].s.n) return null;
        return scored[0].at;
      }
      // Size of the branch hanging off `from`, and whether it reaches a chain
      // end, walking away from `blocked` (the alkene carbon).
      function reach(from, blocked) {
        var seen = {}, stack = [from.id], n = 0, star = 0;
        seen[blocked] = 1; seen[from.id] = 1;
        while (stack.length) {
          var cur = stack.pop();
          n++;
          if (by[cur] && by[cur].el === '*') star = 1;
          bondList.forEach(function (nb) {
            var o = nb.a === cur ? nb.b : (nb.b === cur ? nb.a : null);
            if (o != null && !seen[o]) { seen[o] = 1; stack.push(o); }
          });
        }
        return { n: n, star: star };
      }
      var r1 = branch(a1, a2), r2 = branch(a2, a1);
      if (!r1 || !r2) return null;
      var ux = a2.x - a1.x, uy = a2.y - a1.y;
      var s1 = ux * (r1.y - a1.y) - uy * (r1.x - a1.x);
      var s2 = ux * (r2.y - a2.y) - uy * (r2.x - a2.x);
      if (!s1 || !s2) return null;
      return (s1 > 0) === (s2 > 0) ? 'cis' : 'trans';
    }

    function geomFromPositions(bond) { return geomOf(atoms, bonds, bond); }

    // Geometry as the SMILES stated it, read off RDKit's own coordinates and
    // keyed by position in parsed.bonds. It has to be taken HERE, before
    // layoutBest runs: that lays the backbone out as a horizontal zigzag, which
    // is trans by construction and would silently turn every cis polymer the
    // user pasted into its own geometric isomer.
    function geomFromParsed(parsed) {
      var shimAtoms = parsed.atoms.map(function (a, i) { return { id: i + 1, el: a.el || 'C', x: a.x, y: a.y }; });
      var out = {};
      parsed.bonds.forEach(function (b, i) {
        var g = geomOf(shimAtoms, parsed.bonds, b);
        if (g) out[i] = g;
      });
      return out;
    }

    // Mirror everything on one side of a double bond across the bond axis. That
    // is the whole of a cis/trans flip: bond lengths and angles are preserved,
    // only which side the far substituents sit on changes. Safe only because
    // the caller has already excluded ring double bonds - in a ring the two
    // ends are connected the other way round too, and there is no "far side".
    function flipAcrossBond(bond) {
      var a1 = atomById(bond.a), a2 = atomById(bond.b);
      if (!a1 || !a2) return;
      var side = {}, stack = [a2.id];
      side[a2.id] = 1;
      while (stack.length) {
        var cur = stack.pop();
        bonds.forEach(function (nb) {
          if (nb === bond) return;
          var o = nb.a === cur ? nb.b : (nb.b === cur ? nb.a : null);
          if (o != null && !side[o]) { side[o] = 1; stack.push(o); }
        });
      }
      if (side[a1.id]) return;   // cyclic the long way round; nothing to mirror
      var ux = a2.x - a1.x, uy = a2.y - a1.y;
      var len = Math.hypot(ux, uy) || 1;
      ux /= len; uy /= len;
      atoms.forEach(function (at) {
        if (!side[at.id] || at.id === a2.id) return;
        var dx = at.x - a1.x, dy = at.y - a1.y;
        var along = dx * ux + dy * uy;
        // reflection across the line: keep the component along it, negate the
        // perpendicular one.
        at.x = a1.x + ux * along * 2 - dx;
        at.y = a1.y + uy * along * 2 - dy;
      });
    }

    // Put the geometry the SMILES stated onto the laid-out drawing, moving the
    // atoms where the layout disagrees. The label and the picture have to say
    // the same thing: the search now reads geometry as part of the polymer's
    // identity, so a drawing that shows trans while the entry means cis would
    // be the wrong answer displayed confidently.
    function applyStatedGeom(made, parsedBonds, stated) {
      Object.keys(stated).forEach(function (k) {
        var rb = parsedBonds[k];
        var ma = made[rb.a - 1], mb2 = made[rb.b - 1];
        if (!ma || !mb2) return;
        bonds.forEach(function (x) {
          if (!((x.a === ma.id && x.b === mb2.id) || (x.a === mb2.id && x.b === ma.id))) return;
          if (x.order !== 2 || bondInRing(x)) return;
          if (geomFromPositions(x) !== stated[k]) flipAcrossBond(x);
          x.geom = stated[k];
        });
      });
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
        // Read geometry off RDKit's coordinates BEFORE layoutBest touches them,
        // and only when the SMILES actually wrote "/" or "\": an unspecified
        // C=C gets laid out in a zigzag like any other, so deriving geometry
        // unasked would invent a trans the input never claimed.
        var stated = (text.indexOf('/') !== -1 || text.indexOf('\\') !== -1) ? geomFromParsed(parsed) : null;
        layoutBest(parsed);
        // A freshly laid-out structure is positioned in canvas coordinates, so
        // any zoom or pan left over from the previous drawing would put it
        // off-screen or the wrong size.
        resetView();
        var pos = fitParsedCoords(parsed);
        snapshot();
        atoms = []; bonds = []; brackets = []; selectedAtom = null; selectedGroup = []; nextAtomId = 1; nextBondId = 1;
        var made = parsed.atoms.map(function (ra, i) { return addAtom(ra.el || 'C', pos[i].x, pos[i].y); });
        parsed.bonds.forEach(function (rb) { addBond(made[rb.a - 1].id, made[rb.b - 1].id, rb.order); });
        if (stated) applyStatedGeom(made, parsed.bonds, stated);
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
        // Naming the actual problem matters most here, because this is where a
        // misread image lands. "Add neighbor stubs" is useless advice for a
        // drawing that came back in pieces.
        var frags = fragmentCount();
        if (frags > 1) {
          smilesNote('Loaded, but this came in as ' + frags + ' disconnected pieces, so it is not a repeat unit — those have to be one connected fragment with two open ends. If this came from an image, the reading is probably wrong: check it against your original before searching.');
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
      if (!p) return;
      // A star has no two-ended backbone, so the graph the library SEARCHES on
      // (one arm's repeat unit) is not what the molecule looks like. Loading
      // that put a linear two-ended PEG on the canvas and presented it as a
      // 4-arm star. Where an entry carries a depiction - the whole molecule,
      // core and all, with a bracket per arm - draw that instead.
      var hasDepiction = p.depiction && Array.isArray(p.depiction.atoms) && p.depiction.atoms.length;
      var src = hasDepiction ? p.depiction : p;
      if (!src.atoms || !src.bonds) return;
      // An entry can be in the library without a drawable repeat unit - a natural
      // bottlebrush, a macrocycle whose point is that it has no ends, a synthetic
      // route rather than one compound. Say so before loading the chemistry
      // engine, and clear the search line: leaving the previous polymer's result
      // sitting there reads as the answer for this one.
      if (!src.atoms.length) {
        smilesNote('No repeat unit on file for ' + p.name + ' — use the publication links on its card.');
        var noStructEl = document.getElementById('mol-status');
        if (noStructEl) noStructEl.textContent = '';
        clearIdentification();   // keep the card: the message points at its links
        return;
      }
      smilesNote(rdkitPromise ? 'Drawing ' + p.name + '…' : 'Loading the chemistry engine (about 7 MB, one time; it stays cached)…');
      ensureRDKit().then(function (RDKit) {
        var mol = molFrom(RDKit, molblockFrom(src.atoms, src.bonds));
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
        // A linear telechelic's depiction names its two chain ends, so it can be
        // laid out as a proper zigzag with the end groups IN LINE with the chain
        // and the substituents hanging off it - the same routine a repeat unit
        // gets. Rotating RDKit's own layout, which is what this did before, put
        // the axis flat but left a terminal NH2 sitting above the chain, so the
        // bond its bracket bar had to cut still pointed steeply up and the two
        // bars came out at unrelated angles. Laying the chain out properly is
        // what actually fixes that. Falls back to the rotation if the zigzag
        // cannot be built (a ring riding in the backbone, say).
        var laidOut = false;
        if (hasDepiction && Array.isArray(src.chainEnds) && src.chainEnds.length === 2) {
          var idxByDepId = {};
          src.atoms.forEach(function (a, i) { idxByDepId[a.id] = i; });
          var e0 = idxByDepId[src.chainEnds[0]], e1 = idxByDepId[src.chainEnds[1]];
          if (e0 !== undefined && e1 !== undefined) laidOut = layoutRepeatUnit(parsed, [e0, e1]);
        }
        if (!laidOut) {
          layoutBest(parsed);
          if (hasDepiction && Array.isArray(src.repeats) && src.repeats.length === 1 &&
              Array.isArray(src.repeats[0].cuts) && src.repeats[0].cuts.length === 2) {
            orientByCuts(parsed, src.atoms, src.repeats[0].cuts);
          }
        }
        // A freshly laid-out structure is positioned in canvas coordinates, so
        // any zoom or pan left over from the previous drawing would put it
        // off-screen or the wrong size.
        resetView();
        var pos = fitParsedCoords(parsed);
        snapshot();
        atoms = []; bonds = []; brackets = []; selectedAtom = null; selectedGroup = []; nextAtomId = 1; nextBondId = 1;
        var made = parsed.atoms.map(function (ra, i) { return addAtom(ra.el || 'C', pos[i].x, pos[i].y); });
        parsed.bonds.forEach(function (rb) { addBond(made[rb.a - 1].id, made[rb.b - 1].id, rb.order); });
        // The entry states its double-bond geometry outright, and the molblock
        // round trip does not carry it. Re-apply it from the entry rather than
        // reading it back off coordinates RDKit invented - and move the drawing
        // to match, so loading cis-polyisoprene shows a cis double bond.
        (function () {
          var byLibId2 = {};
          src.atoms.forEach(function (la, i) { if (made[i]) byLibId2[la.id] = made[i].id; });
          src.bonds.forEach(function (lb) {
            if (lb.stereo !== 'cis' && lb.stereo !== 'trans') return;
            var ea = byLibId2[lb.a], eb = byLibId2[lb.b];
            bonds.forEach(function (x) {
              if (!((x.a === ea && x.b === eb) || (x.a === eb && x.b === ea))) return;
              if (x.order !== 2 || bondInRing(x)) return;
              if (geomFromPositions(x) !== lb.stereo) flipAcrossBond(x);
              x.geom = lb.stereo;
            });
          });
        })();
        Object.keys(parsed.charges).forEach(function (idx) {
          var at = made[parseInt(idx, 10) - 1];
          if (at) at.charge = parsed.charges[idx];
        });
        // Cosmetic repeat-unit bracket on the crossing bonds (matches SMILES import).
        var rbLoad = repeatUnitBracket();
        brackets = rbLoad ? [rbLoad] : [];
        if (rbLoad && src.repeats) {
          var bbRepeat = src.repeats.filter(function (r) { return r.role === 'backbone'; })[0];
          if (bbRepeat) { rbLoad.label = bbRepeat.label; rbLoad.role = 'backbone'; }
        }
        // A bottlebrush's pendant chain is a polymer in its own right, so it gets
        // its own bracket and its own subscript, the way the literature draws it
        // (backbone m, side chain n). Without the second bracket the drawing would
        // assert the side chain is one oxyethylene rather than a chain of them.
        // The declared unit is mapped through the layout: molblockFrom writes atoms
        // in library order, so p.atoms[i] is parsed.atoms[i] is made[i].
        if (src.repeats) {
          var byLibId = {};
          src.atoms.forEach(function (la, i) { if (made[i]) byLibId[la.id] = made[i].id; });
          src.repeats.forEach(function (r) {
            if (r.role === 'backbone' || !Array.isArray(r.unit)) return;
            var set = {}, mapped = true;
            r.unit.forEach(function (u) {
              if (byLibId[u] === undefined) mapped = false; else set[byLibId[u]] = true;
            });
            if (!mapped) return;
            var sb = angledBracketForIds(set);
            if (!sb) return;             // no clean pair of crossing bonds; leave it off
            sb.atomIds = set;
            sb.label = r.label;
            sb.role = 'sidechain';
            brackets.push(sb);
          });
        }
        draw();
        var editorCard = document.getElementById('mol-editor-card');
        if (editorCard) editorCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (hasDepiction) {
          // A depiction is a finished molecule with no open chain ends, so the
          // structure search - which needs exactly two - cannot match it, and
          // running it would answer "no match" about a polymer we already know.
          // Identify it directly instead, which is what the button promised.
          smilesNote('Loaded ' + p.name + ' — the whole molecule, core and all, with a bracket on each arm. ' +
            'It has no open chain ends, so “Search this structure” does not apply to it; the identification is below.');
          renderResults([p], null);
          renderPublications(p);
          var starStatus = document.getElementById('mol-status');
          if (starStatus) starStatus.textContent = p.name + ':';
          return;
        }
        smilesNote('Loaded ' + p.name + ' into the editor.');
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
      // This path chains the components end to end, which says they follow one
      // another along a single chain. That is true of a block copolymer and false
      // of a bottlebrush, whose second component hangs off the first as side
      // chains - and false again of a brush-arm star, where the arms are whole
      // bottlebrushes joined at a crosslinked core. Drawing either as a diblock
      // would state something about the architecture that is not so, and a
      // bottlebrush that can be drawn carries its own atoms and never gets here.
      if (entry.arch === 'bottlebrush') {
        smilesNote(entry.name + ' has no repeat unit on file. Its components are not blocks along one chain, so it is not drawn as a block copolymer — use the publication links on its card.');
        var archEl = document.getElementById('mol-status');
        if (archEl) archEl.textContent = '';
        clearIdentification();   // keep the card: the message points at its links
        return;
      }
      smilesNote(rdkitPromise ? 'Drawing ' + entry.name + '…' : 'Loading the chemistry engine (about 7 MB, one time; it stays cached)…');
      ensureRDKit().then(function (RDKit) {
        var db = window.POLYMER_DB || [];
        var cAtoms = [], cBonds = [], blockCore = [];
        var prevRightIdx = null, firstLeftIdx = null, lastRightIdx = null, xCursor = 0;

        for (var ci = 0; ci < entry.components.length; ci++) {
          // An entry can carry an empty atoms array (a polymer the library names
          // but has no drawable repeat unit for, DNA among them). That is not a
          // structure, so say which block is missing rather than failing later
          // with a generic layout error that reads like a bug.
          var comp = db.filter(function (p) { return p.name === entry.components[ci] && p.atoms && p.atoms.length; })[0];
          if (!comp) {
            smilesNote('No structure on file for "' + entry.components[ci] + '", so ' + entry.name + ' cannot be drawn. Use the publication links on its card.');
            // Clear the search line too, or the last polymer's identification
            // stays on screen and reads as the result for this one.
            var bailEl = document.getElementById('mol-status');
            if (bailEl) bailEl.textContent = '';
            clearIdentification();   // keep the card: the message points at its links
            return;
          }
          var mol = molFrom(RDKit, molblockFrom(comp.atoms, comp.bonds));
          var mb = null;
          if (mol) { try { mb = mol.get_new_coords(); } catch (e) {} if (!mb) { try { mb = mol.get_molblock(); } catch (e2) {} } mol.delete(); }
          var parsed = mb && parseMolblockToEditor(mb);
          if (!parsed || !parsed.atoms.length) { smilesNote('Could not lay out ' + comp.name + '.'); return; }
          if (!layoutRepeatUnit(parsed)) orientRepeatUnit(parsed);
          // The two layouts do not speak the same units: layoutRepeatUnit places
          // atoms in canvas pixels, orientRepeatUnit leaves RDKit's own scale,
          // about twenty times smaller. Blocks are then butted together and
          // spaced by BOND_LEN, so a copolymer that mixes the two drew one block
          // full size and collapsed the other into a knot of overlapping atoms -
          // which is what happens whenever a ring sits in one block's backbone
          // and not the other's. Put every block on the canvas scale first.
          normalizeBondScale(parsed);
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
          var b = tightBracketForIds(set);
          if (b) b.atomIds = set;   // remember the block's atoms for robust re-extraction
          return b;
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
        // A copolymer without a structure of its own is composed from its blocks,
        // chained end to end. That is only right for a linear one: a bottlebrush's
        // side chain hangs off the backbone, not in line with it, so an entry that
        // carries its own atoms is always drawn from those.
        if (p) {
          if (p.atoms && p.atoms.length) loadPolymerStructure(p);
          else if (p.type === 'copolymer') loadCopolymerStructure(p);
          else loadPolymerStructure(p);
        }
      });
      // The architecture selector repaints the copolymer name + publications.
      resultsEl.addEventListener('change', function (e) {
        var sel = e.target.closest && e.target.closest('.mol-arch-select');
        if (sel) paintCopolymer(sel.value);
      });
    })();

    // ---------- Canonical PSMILES ----------
    // PSMILES is a repeat unit written as SMILES with two "*" wildcards where
    // the chain continues: [*]CCO[*] is poly(ethylene oxide). It is what the
    // open polymer-ML datasets are keyed on, so it is the portable identity our
    // internal 32-bit graph hash can never be.
    //
    // Canonicalizing it is the hard part, because one polymer has many valid
    // PSMILES: the bracket can be cut at any backbone bond, and it can enclose
    // any whole number of repeat units. polymer-graph.js handles both - folding
    // to the shortest period, then enumerating every legal framing - and this
    // just canonicalizes each framing with RDKit and keeps the lexicographically
    // smallest. Since every drawing of a given polymer produces the SAME set of
    // framings, the minimum is stable across drawings, which is the whole point.
    //
    // Implemented here from the published four-step recipe rather than ported
    // from the reference package, whose licence forbids commercial use. The
    // canonicalization itself is RDKit's, which is BSD-3 and already vendored.
    function canonicalPSmiles(RDKit, atomList, bondList) {
      if (!window.PolymerGraph || !window.PolymerGraph.repeatUnitFramings) return null;
      var ex = expandSuperatoms(atomList, bondList);
      var framings = window.PolymerGraph.repeatUnitFramings(ex.atoms, ex.bonds);
      if (!framings || !framings.length) return null;
      var best = null, i;
      for (i = 0; i < framings.length; i++) {
        var mol = molFrom(RDKit, molblockFrom(framings[i].atoms, framings[i].bonds));
        if (!mol) continue;
        var s = null;
        try { s = mol.get_smiles(); } catch (e) { s = null; }
        mol.delete();
        if (!s) continue;
        // "*" round-trips out of RDKit unbracketed; PSMILES convention brackets it.
        s = s.replace(/(?:\[\*\]|\*)/g, '[*]');
        if (best === null || s < best) best = s;
      }
      return best;
    }

    function copyCanvasAs(kind, btn) {
      if (!atoms.length) { smilesNote('Draw a structure first.'); return; }
      smilesNote(rdkitPromise ? '' : 'Loading the chemistry engine (about 7 MB, one time)…');
      ensureRDKit().then(function (RDKit) {
        var out = null;
        if (kind === 'psmiles') {
          out = canonicalPSmiles(RDKit, atoms, bonds);
          if (!out) {
            smilesNote('PSMILES needs a repeat unit: bracket the unit so it has exactly two open ' +
                       'chain ends. A whole molecule with no attachment points has no PSMILES form.');
            return;
          }
        } else {
          var ex = expandSuperatoms(atoms, bonds);
          var mol = molFrom(RDKit, molblockFrom(ex.atoms, ex.bonds));
          if (!mol) { smilesNote('The drawing could not be interpreted as a molecule.'); return; }
          try { out = kind === 'inchi' ? mol.get_inchi() : mol.get_smiles(); } catch (e) {}
          mol.delete();
        }
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
        // A freshly laid-out structure is positioned in canvas coordinates, so
        // any zoom or pan left over from the previous drawing would put it
        // off-screen or the wrong size.
        resetView();
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
      var copyPs = document.getElementById('mol-copy-psmiles');
      var cleanBtn = document.getElementById('mol-cleanup');
      if (loadBtn) loadBtn.addEventListener('click', importSmiles);
      if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter') importSmiles(); });
      if (copySmi) copySmi.addEventListener('click', function () { copyCanvasAs('smiles', copySmi); });
      if (copyInchi) copyInchi.addEventListener('click', function () { copyCanvasAs('inchi', copyInchi); });
      if (copyPs) copyPs.addEventListener('click', function () { copyCanvasAs('psmiles', copyPs); });
      if (cleanBtn) cleanBtn.addEventListener('click', cleanUpStructure);
    })();

    // ---------- PubChem helpers: polite queue, synonym ranking, CAS ----------
    // PubChem hard-caps at 5 requests/second (returns 503, and browsers can't
    // read its throttling header), so every call goes through one serial queue
    // with a 220ms floor between requests.
    var pcChain = Promise.resolve();
    var pcLastAt = 0;
    function pcFetch(url, opts) {
      // Hand the caller its own promise and keep the queue itself always
      // fulfilled with .catch. Without this, one rejected fetch (dropped
      // connection, DNS failure, CORS block) leaves pcChain in a rejected
      // state and every subsequent PubChem lookup rejects immediately with
      // the same error until the page reloads. On a locked DoD network
      // that intermittently blocks pubchem.ncbi.nlm.nih.gov that is one
      // transient blip away from bricking name/CAS/structure identification
      // for the entire session.
      var slot = pcChain.then(function () {
        var wait = Math.max(0, 220 - (Date.now() - pcLastAt));
        return new Promise(function (res) { setTimeout(res, wait); });
      });
      pcChain = slot.catch(function () { /* swallow so the queue survives */ });
      return slot.then(function () { pcLastAt = Date.now(); return fetch(url, opts); });
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
      // separately and report the combination. A bottlebrush is the exception:
      // its second bracket is a side chain nested inside the repeat unit, not a
      // second block further along the chain, so it is searched as the single
      // unit it is. Sent down the block path it reports the backbone as having
      // too many open ends, which is true of every graft and beside the point.
      var hasNestedRepeat = brackets.some(function (r) { return r.role === 'sidechain'; });
      if (brackets.length >= 2 && !hasNestedRepeat) { runCopolymerSearch(); return; }

      var sub = currentRepeatUnit();
      if (!sub) {
        // Before refusing, ask the other question: is this a monomer?
        if (searchAsMonomer(statusEl)) return;
        statusEl.textContent = 'Draw a repeat unit and mark it with the Bracket tool — or draw a monomer, and this will tell you what it polymerises to.';
        renderResults([]);
        return;
      }
      searchSub(sub);
    }

    // ---------- Reaction scheme: monomer -> polymer ----------
    //
    // Shown for an exact match whose monomer can be RECOVERED from the repeat
    // unit and verified by round trip (polymer-graph.js deriveMonomer). About
    // 230 of the library's drawn entries qualify; the rest render nothing
    // rather than a guess. Step-growth never qualifies - a polyester unit came
    // from a diol and a diacid, and one unit cannot say which pair.
    //
    // What sits over the arrow is the entry's own mechanism class and nothing
    // else. THERE IS NO REAGENT DATA IN THIS LIBRARY: no initiator, catalyst,
    // solvent or temperature field exists on any of the 654 entries. Printing
    // "AIBN, 60 °C" here would be inventing it, so the arrow carries what is
    // actually known and points at the mechanisms page for the rest.
    var SCHEME_LABEL = {
      vinyl: 'chain-growth addition',
      diene: '1,4-addition',
      ring: 'ring-opening'
    };
    function reactionSchemeHtml(p) {
      if (!p) return '';
      // No stored repeat unit used to return '' here, before anything looked at
      // the conditions - so Butyl rubber and LLDPE, both copolymers with no
      // single unit to draw, showed nothing at all despite having a sourced
      // procedure. The conditions do not depend on there being a structure.
      if (!Array.isArray(p.atoms) || !p.atoms.length) {
        return conditionsOnlyHtml(p, 'no single repeat unit is stored for this entry, so there is nothing to derive a monomer from');
      }
      // Some entries pass every structural test and are still wrong, because
      // the polymerisation is not the isomerisation the class implies and only
      // the curated monomer NAME reveals it. Those carry an explicit opt-out
      // with the reason, rather than being caught by a rule that does not exist.
      if (p.noScheme) return conditionsOnlyHtml(p, p.noScheme);
      var m = PG.deriveMonomer(p.atoms, p.bonds, p.cls);
      // No derivable monomer does not mean nothing is known. Nylon 6,6 and PET
      // are step-growth, so no scheme can ever be drawn for them - and those are
      // exactly the entries where a sourced procedure is the ONLY way the tool
      // can say how the polymer is made. Gating the conditions behind the
      // drawing hid them on the polymers that needed them most.
      if (!m) return conditionsOnlyHtml(p, 'this is a step-growth polymerisation, and one repeat unit cannot say which pair of monomers it came from');
      pendingScheme = { polymer: p, monomer: m };
      return '<div class="mol-scheme" id="mol-scheme">' +
        '<h4>How it is made</h4>' +
        '<canvas id="mol-scheme-canvas" width="900" height="200"></canvas>' +
        '<div class="mol-scheme-actions">' +
        '<button type="button" id="mol-scheme-edit" class="copy-btn" title="Put this scheme on the drawing canvas, where you can add reagents and conditions and export it">&#9998; Edit as a drawing</button>' +
        '<button type="button" id="mol-scheme-copy" class="copy-btn" title="Copy this scheme to the clipboard as an image, ready to paste into a slide or a document">&#128203; Copy image</button>' +
        '</div>' +
        '<p id="mol-scheme-note"></p>' +
        '</div>';
    }
    // The conditions on their own, for a polymer whose reaction cannot be
    // drawn. Same panel, no canvas.
    // `why` is the actual reason no scheme could be drawn, and it differs per
    // entry - step-growth, no stored repeat unit, or a curated noScheme opt-out
    // whose text explains a monomer that does not exist. It used to be hardcoded
    // to the step-growth sentence, which would have told a reader that
    // poly(vinyl alcohol) is a step polymerisation.
    function conditionsOnlyHtml(p, why) {
      var c = p && p.conditions;
      if (!c) return '';
      return '<div class="mol-scheme" id="mol-scheme">' +
        '<h4>How it is made</h4>' +
        '<p id="mol-scheme-note"><span class="mol-cond" style="border-top:0;margin-top:0;padding-top:0;">' +
        '<strong>How it is run (' + escapeHtml(c.process) + ').</strong> ' + escapeHtml(c.detail) +
        ' <em>' + escapeHtml(c.source) + '</em></span>' +
        '<br><span style="font-size:0.92em;">No scheme is drawn: ' + escapeHtml(why || 'no monomer can be derived from this repeat unit') + '. ' +
        '<a href="mechanisms.html">Mechanisms</a> covers how these polymerisations are actually run.</span></p>' +
        '</div>';
    }
    var pendingScheme = null;

    // Lay the monomer in the left third and the polymer in the right third of
    // a box, in that box's coordinates. Shared by the preview panel and by
    // "Edit as a drawing", so the figure you edit is the figure you were shown.
    function schemeLayout(RDKit, job, boxW, boxH) {
      function layout(graph, w, h) {
        var ex = expandSuperatoms(graph.atoms, graph.bonds);
        var mol = molFrom(RDKit, molblockFrom(ex.atoms, ex.bonds));
        var mb = null;
        if (mol) {
          try { mb = mol.get_new_coords(); } catch (e) {}
          if (!mb) { try { mb = mol.get_molblock(); } catch (e2) {} }
          mol.delete();
        }
        var parsed = mb && parseMolblockToEditor(mb);
        if (!parsed || !parsed.atoms.length) return null;
        var pos = fitParsedCoords(parsed, { width: w, height: h });
        return {
          atoms: parsed.atoms.map(function (ra, i) { return { id: i + 1, el: ra.el || 'C', x: pos[i].x, y: pos[i].y }; }),
          bonds: parsed.bonds.map(function (rb) { return { id: rb.a * 1000 + rb.b, a: rb.a, b: rb.b, order: rb.order }; })
        };
      }
      var third = Math.round(boxW * 0.36);
      var left = layout(job.monomer, third, boxH);
      var right = layout({ atoms: job.polymer.atoms, bonds: job.polymer.bonds }, third, boxH);
      if (!left || !right) return null;
      right.atoms.forEach(function (a) { a.x += boxW - third; });
      return { third: third, left: left, right: right };
    }

    // Put the derived scheme on the canvas so it can be finished by hand. This
    // is the join between the two halves of the feature: the tool supplies the
    // chemistry it can prove, and the annotation tools add the conditions it
    // deliberately refuses to invent. Until now the scheme was a picture with
    // no way out of it.
    function editSchemeOnCanvas(job) {
      ensureRDKit().then(function (RDKit) {
        var placed = schemeLayout(RDKit, job, canvas.width, canvas.height);
        if (!placed) { setStatus('That scheme could not be laid out for editing.'); return; }
        snapshot();
        atoms = []; bonds = []; brackets = []; arrows = []; labels = [];
        selectedAtom = null; selectedGroup = []; selectedArrow = null; selectedLabel = null;
        nextAtomId = 1; nextBondId = 1;
        resetView();
        [placed.left, placed.right].forEach(function (part) {
          var map = {};
          part.atoms.forEach(function (a) { map[a.id] = addAtom(a.el, a.x, a.y).id; });
          part.bonds.forEach(function (b) { addBond(map[b.a], map[b.b], b.order); });
        });
        var midY = canvas.height / 2;
        arrows.push({
          x1: placed.third + 24, y1: midY,
          x2: canvas.width - placed.third - 24, y2: midY,
          above: (job.polymer.conditions && job.polymer.conditions.summary) || '',
          below: SCHEME_LABEL[job.monomer.kind] || 'polymerisation',
          kind: 'arrow'
        });
        labels.push({ x: (canvas.width) / 2, y: midY + 24, text: 'n' });
        syncAnnotationPanel();
        draw();
        scrollEditorIntoView();
        setStatus('Scheme loaded for editing. Add your own reagents over the arrow — the library records none, so nothing here is claimed for you. ' +
          'Two molecules are on the canvas now, so "Search this structure" will not apply until you clear it.');
      }).catch(function () { setStatus('The chemistry engine could not load.'); });
    }
    function scrollEditorIntoView() {
      var card = document.getElementById('mol-editor-card');
      if (card && card.scrollIntoView) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Paint a soft band along each reaction-centre bond. `part` is the laid-out
    // half (atoms numbered 1..n in source order); `sourceAtoms` is the graph it
    // came from, so a library atom id maps to a laid-out atom by POSITION -
    // molblockFrom writes atoms in order and the layout preserves it. If the
    // counts disagree (a superatom expanded) the highlight is skipped rather
    // than drawn in the wrong place.
    var CENTRE_COLOR = 'rgba(37, 99, 235, 0.28)';
    function highlightCentre(pctx, part, centre, sourceAtoms) {
      if (!centre || !centre.length || !sourceAtoms) return;
      if (part.atoms.length !== sourceAtoms.length) return;
      var indexOfId = {};
      sourceAtoms.forEach(function (a, i) { indexOfId[a.id] = i; });
      pctx.save();
      pctx.strokeStyle = CENTRE_COLOR;
      pctx.lineWidth = 11;
      pctx.lineCap = 'round';
      centre.forEach(function (pair) {
        var ia = indexOfId[pair[0]], ib = indexOfId[pair[1]];
        if (ia == null || ib == null) return;
        var p1 = part.atoms[ia], p2 = part.atoms[ib];
        if (!p1 || !p2) return;
        // Only mark a bond that is actually THERE. A ring-opening centre is the
        // bond the ring closes across: it exists in the monomer and not in the
        // polymer, and drawing it on the polymer would be a band over nothing.
        var present = part.bonds.some(function (b) {
          return (b.a === p1.id && b.b === p2.id) || (b.a === p2.id && b.b === p1.id);
        });
        if (!present) return;
        pctx.beginPath();
        pctx.moveTo(p1.x, p1.y);
        pctx.lineTo(p2.x, p2.y);
        pctx.stroke();
      });
      pctx.restore();
    }

    function drawPendingScheme() {
      if (!pendingScheme) return;
      var job = pendingScheme;
      pendingScheme = null;
      var cv = document.getElementById('mol-scheme-canvas');
      var note = document.getElementById('mol-scheme-note');
      if (!cv) return;
      // The panel is re-created on every render, so its buttons are wired here
      // rather than once at startup.
      var editBtn = document.getElementById('mol-scheme-edit');
      if (editBtn) editBtn.addEventListener('click', function () { editSchemeOnCanvas(job); });
      var copyBtn = document.getElementById('mol-scheme-copy');
      if (copyBtn) copyBtn.addEventListener('click', function () {
        copyCanvasToClipboard(cv, function (err) {
          if (note) note.textContent = err || 'Scheme copied — paste it into a slide or a document.';
        });
      });
      ensureRDKit().then(function (RDKit) {
        var placed = schemeLayout(RDKit, job, cv.width, cv.height);
        if (!placed) { if (note) note.textContent = ''; return; }
        var third = placed.third, left = placed.left, right = placed.right;
        var pctx = cv.getContext('2d');
        pctx.clearRect(0, 0, cv.width, cv.height);
        var styles = getComputedStyle(document.body);
        var textColor = (styles.getPropertyValue('--text') || '#111').trim() || '#111';
        var bgColor = (styles.getPropertyValue('--card-bg') || '#fff').trim() || '#fff';
        var dim = (styles.getPropertyValue('--text-dim') || '#666').trim() || '#666';

        var savedAtoms = atoms, savedBonds = bonds, savedBrackets = brackets, savedCtx = ctx;
        var savedHover = hoverAtom, savedSel = selectedAtom, savedGroup = selectedGroup;
        ctx = pctx; brackets = []; hoverAtom = null; selectedAtom = null; selectedGroup = [];
        try {
          // The reaction centre, painted UNDER the structure so the bonds that
          // change are obvious without redrawing them. This is what a reaction
          // database charges for, and here it costs nothing: deriveMonomer had
          // to know which bond moved in order to move it.
          highlightCentre(pctx, left, job.monomer.centre, job.monomer.atoms);
          highlightCentre(pctx, right, job.monomer.centre, job.polymer.atoms);
          atoms = left.atoms; bonds = left.bonds;
          drawStructure(textColor, bgColor);
          atoms = right.atoms; bonds = right.bonds;
          drawStructure(textColor, bgColor);
        } finally {
          ctx = savedCtx;
          atoms = savedAtoms; bonds = savedBonds; brackets = savedBrackets;
          hoverAtom = savedHover; selectedAtom = savedSel; selectedGroup = savedGroup;
        }

        // the arrow, and the mechanism over it
        var ax = third + 20, bx = cv.width - third - 20, ay = cv.height / 2;
        pctx.save();
        pctx.strokeStyle = dim;
        pctx.fillStyle = dim;
        pctx.lineWidth = 1.6;
        pctx.beginPath();
        pctx.moveTo(ax, ay);
        pctx.lineTo(bx - 8, ay);
        pctx.stroke();
        pctx.beginPath();
        pctx.moveTo(bx, ay);
        pctx.lineTo(bx - 9, ay - 4.5);
        pctx.lineTo(bx - 9, ay + 4.5);
        pctx.closePath();
        pctx.fill();
        // Sourced conditions ride above the arrow where a scheme puts them;
        // the mechanism drops below it. Where no conditions are recorded the
        // mechanism stays on top and the arrow says no more than it did.
        var cond = job.polymer.conditions;
        pctx.textAlign = 'center';
        if (cond) {
          pctx.font = '600 12px system-ui, sans-serif';
          pctx.textBaseline = 'bottom';
          pctx.fillText(cond.summary, (ax + bx) / 2, ay - 8);
          pctx.font = '11px system-ui, sans-serif';
          pctx.textBaseline = 'top';
          pctx.fillText(SCHEME_LABEL[job.monomer.kind] || 'polymerisation', (ax + bx) / 2, ay + 7);
        } else {
          pctx.font = '600 12px system-ui, sans-serif';
          pctx.textBaseline = 'bottom';
          pctx.fillText(SCHEME_LABEL[job.monomer.kind] || 'polymerisation', (ax + bx) / 2, ay - 7);
          pctx.font = '11px system-ui, sans-serif';
          pctx.textBaseline = 'top';
          pctx.fillText('n', (ax + bx) / 2, ay + 6);
        }
        pctx.restore();

        if (note) {
          var extra = job.monomer.kind === 'diene'
            ? ' The monomer carries no geometry of its own: the same butadiene gives the cis or the trans polymer depending on the catalyst, which is why both are separate entries here.'
            : '';
          var condHtml = cond
            ? ' <span class="mol-cond"><strong>How it is run (' + escapeHtml(cond.process) + ').</strong> ' +
              escapeHtml(cond.detail) + ' <em>' + escapeHtml(cond.source) + '</em></span>'
            : '';
          note.innerHTML = escapeHtml(job.polymer.monomer || 'The monomer') +
            ' polymerises to this repeat unit. The structure on the left is derived from the one on the right and checked by rebuilding the polymer from it.' +
            extra +
            (cond ? '' : ' <strong>No conditions are recorded for this polymer.</strong> Only a handful of entries carry a sourced procedure; the arrow names the mechanism and nothing more for the rest. ') +
            '<a href="mechanisms.html">Mechanisms</a> covers how these polymerisations are actually run.' + condHtml;
        }
      }).catch(function () { if (note) note.textContent = ''; });
    }

    // ---------- Chain preview: what your bracket actually means ----------
    //
    // The most common way a drawn repeat unit is wrong is silent: a bracket
    // cutting the wrong bond, or enclosing two units where one was meant. The
    // drawing looks fine either way, and the first sign of trouble is a search
    // that returns the wrong polymer or nothing at all. So draw the answer:
    // three units joined end to end, which is what the bracket claims.
    //
    // Rendering reuses drawStructure by swapping `ctx` and the atom/bond
    // arrays, the same trick the PNG and SVG exports already use, so the
    // preview cannot drift from how the editor draws.
    var CHAIN_PREVIEW_UNITS = 3;
    function showChainPreview() {
      var wrap = document.getElementById('mol-chain-preview');
      var note = document.getElementById('mol-chain-note');
      var pcanvas = document.getElementById('mol-chain-canvas');
      if (!wrap || !pcanvas) return;
      var sub = currentRepeatUnit();
      if (!sub) {
        wrap.hidden = false;
        if (note) note.textContent = 'Bracket a repeat unit first (or load one with two * chain ends) — the preview shows what that unit repeats into.';
        pcanvas.getContext('2d').clearRect(0, 0, pcanvas.width, pcanvas.height);
        return;
      }
      if (sub.boundaryCount !== 2) {
        wrap.hidden = false;
        if (note) note.textContent = 'A repeat unit needs exactly two open chain ends; this one has ' + sub.boundaryCount + '. Nothing to chain up yet.';
        pcanvas.getContext('2d').clearRect(0, 0, pcanvas.width, pcanvas.height);
        return;
      }
      // chainCopies names the chain ends __h/__t; the extractors name them S0/S1.
      var starIds = sub.atoms.filter(function (a) { return a.el === '*'; }).map(function (a) { return a.id; });
      var rename = {};
      rename[starIds[0]] = '__h';
      rename[starIds[1]] = '__t';
      var unit = {
        atoms: sub.atoms.map(function (a) { return { id: rename[a.id] || a.id, el: a.el, charge: a.charge }; }),
        bonds: sub.bonds.map(function (b) {
          var na = rename[b.a] || b.a, nb = rename[b.b] || b.b;
          // the head bond must read __h -> atom and the tail atom -> __t
          if (nb === '__h' || na === '__t') { var t = na; na = nb; nb = t; }
          return { a: na, b: nb, order: b.order, stereo: b.stereo };
        })
      };
      var chained = PG.chainCopies(unit, CHAIN_PREVIEW_UNITS);
      if (!chained) {
        wrap.hidden = false;
        if (note) note.textContent = 'That unit could not be chained up — its two open ends need to sit on the backbone.';
        return;
      }
      wrap.hidden = false;
      if (note) note.textContent = 'Loading the chemistry engine…';
      ensureRDKit().then(function (RDKit) {
        var ex = expandSuperatoms(chained.atoms, chained.bonds);
        var mol = molFrom(RDKit, molblockFrom(ex.atoms, ex.bonds));
        var mb = null;
        if (mol) {
          try { mb = mol.get_new_coords(); } catch (e) {}
          if (!mb) { try { mb = mol.get_molblock(); } catch (e2) {} }
          mol.delete();
        }
        var parsed = mb && parseMolblockToEditor(mb);
        if (!parsed || !parsed.atoms.length) {
          if (note) note.textContent = 'Could not lay out the chained units.';
          return;
        }
        var pos = fitParsedCoords(parsed, pcanvas);
        // Swap the editor's own state for the chained copy, draw, put it back.
        var savedAtoms = atoms, savedBonds = bonds, savedBrackets = brackets, savedCtx = ctx;
        var savedHover = hoverAtom, savedSel = selectedAtom, savedGroup = selectedGroup;
        atoms = parsed.atoms.map(function (ra, i) { return { id: i + 1, el: ra.el || 'C', x: pos[i].x, y: pos[i].y }; });
        bonds = parsed.bonds.map(function (rb) { return { id: rb.a * 1000 + rb.b, a: rb.a, b: rb.b, order: rb.order }; });
        brackets = []; hoverAtom = null; selectedAtom = null; selectedGroup = [];
        var pctx = pcanvas.getContext('2d');
        pctx.clearRect(0, 0, pcanvas.width, pcanvas.height);
        ctx = pctx;
        var styles = getComputedStyle(document.body);
        try {
          drawStructure((styles.getPropertyValue('--text') || '#111').trim() || '#111',
                        (styles.getPropertyValue('--card-bg') || '#fff').trim() || '#fff');
        } finally {
          ctx = savedCtx;
          atoms = savedAtoms; bonds = savedBonds; brackets = savedBrackets;
          hoverAtom = savedHover; selectedAtom = savedSel; selectedGroup = savedGroup;
        }
        if (note) {
          note.textContent = CHAIN_PREVIEW_UNITS + ' of your repeat unit joined end to end. If this is not the polymer you meant, ' +
            'the bracket is cutting the wrong bond or holding more than one unit.';
        }
      }).catch(function () {
        if (note) note.textContent = 'The chemistry engine could not load. Check your connection and try again.';
      });
    }

    // ---------- Search by monomer ----------
    //
    // The other direction: draw what you HAVE and find what it makes. Until
    // now drawing styrene - the actual monomer - returned "draw a repeat unit"
    // and no matches, even though the library derives styrene from polystyrene
    // for 207 entries. The information was there and only ran one way.
    //
    // Keyed on the plain-molecule hash of the DERIVED monomer, so a match means
    // the same verified round trip that put the scheme on screen; nothing new
    // is claimed here.
    var monomerIdx = null;
    function monomerIndex() {
      if (monomerIdx) return monomerIdx;
      monomerIdx = {};
      (window.POLYMER_DB || []).forEach(function (p) {
        if (!Array.isArray(p.atoms) || !p.atoms.length || p.noScheme) return;
        var m = PG.deriveMonomer(p.atoms, p.bonds, p.cls);
        if (!m) return;
        var h = wlHash(m.atoms, m.bonds);
        (monomerIdx[h] || (monomerIdx[h] = [])).push({ p: p, m: m });
      });
      return monomerIdx;
    }
    function searchAsMonomer(statusEl) {
      if (!atoms.length) return false;
      if (atoms.some(function (a) { return a.el === '*'; })) return false;  // that is a repeat unit
      var ex = expandSuperatoms(atoms, bonds);
      var h = wlHash(ex.atoms, ex.bonds.map(function (b) { return { a: b.a, b: b.b, order: b.order }; }));
      var hits = monomerIndex()[h];
      if (!hits || !hits.length) return false;
      var names = hits.map(function (x) { return x.p.name; });
      // Dienes are the interesting case: one monomer, two polymers, and the
      // catalyst decides which. Say so rather than listing them silently.
      var isDiene = hits.every(function (x) { return x.m.kind === 'diene'; });
      statusEl.textContent = hits.length === 1
        ? 'That is a monomer. It polymerises to ' + names[0] + ':'
        : 'That is a monomer. It polymerises to ' + hits.length + ' polymers in this library' +
          (isDiene ? ' — same monomer, and the catalyst decides which geometry you get' : '') + ':';
      // Several hits from one monomer usually means one polymer with declared
      // variants (polystyrene and its foam) or the diene pair, and those share a
      // repeat unit - so the scheme still belongs to the set.
      var hitPolymers = hits.map(function (x) { return x.p; });
      renderResults(hitPolymers, schemeCandidate(hitPolymers));
      renderPublications(hits[0].p);
      return true;
    }

    // The one place that decides what the drawing's repeat unit IS. The chain
    // preview has to answer this the same way the search does, or it would
    // illustrate a different polymer from the one being matched - which is
    // worse than not illustrating it at all.
    function currentRepeatUnit() {
      if (atoms.filter(function (a) { return a.el === '*'; }).length === 2) return extractFromStars();
      if (brackets.length === 1) return extractRepeatUnit(brackets[0]);
      return null;
    }

    // Match one extracted repeat unit (exactly two open ends) against the
    // library, then fall back to similarity + external identification. Shared by
    // the single-unit search and the homopolymer case of the copolymer search.
    // A repeat unit is one unit, and some polymer identities live in the
    // relationship BETWEEN successive units. Tacticity is the case that
    // matters: the four polypropylenes are genuinely one drawing, so they
    // arrive as one exact match with four entries in it. Listing them with no
    // explanation reads like the matcher failed; saying why is the answer.
    var VARIANT_FIELDS = [
      { key: 'tacticity', what: 'tacticity', why: 'which describes how successive units are arranged, and so cannot be shown in a single unit' },
      { key: 'form', what: 'form', why: 'branching, molar mass and how the solid was made - none of which one repeat unit can show' }
    ];
    function tacticityNote(hits) {
      if (!hits || hits.length < 2) return '';
      for (var f = 0; f < VARIANT_FIELDS.length; f++) {
        var field = VARIANT_FIELDS[f], vals = [];
        hits.forEach(function (p) {
          if (p[field.key] && vals.indexOf(p[field.key]) === -1) vals.push(p[field.key]);
        });
        if (!vals.length) continue;
        return ' These ' + hits.length + ' entries share one repeat unit and differ by ' + field.what +
          ' (' + vals.join('; ') + ') — ' + field.why + '.';
      }
      return '';
    }

    // "cis" / "trans" if the entry declares double-bond geometry, else null.
    function isomerOf(p) {
      if (!p || !Array.isArray(p.bonds)) return null;
      for (var i = 0; i < p.bonds.length; i++) {
        if (p.bonds[i].stereo === 'cis' || p.bonds[i].stereo === 'trans') return p.bonds[i].stereo;
      }
      return null;
    }

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
      // An entry that declines to state its double-bond geometry is compatible
      // with a drawing that states one, and the reverse. HTPB forced this: it is
      // a mixture of cis-1,4, trans-1,4 and 1,2-vinyl, so its repeat unit states
      // no geometry - which made it invisible to anyone who drew trans-1,4
      // polybutadiene, while a geometry-free drawing found HTPB and none of the
      // stereoregular polybutadienes. Two entries that BOTH state a geometry and
      // disagree are still different materials and stay out of this.
      var qCompat = blindHash(sub.atoms, sub.bonds);
      var drawnIsomer = isomerOf(sub);
      var compatible = qCompat == null ? [] : db.filter(function (p) {
        if (exact.indexOf(p) !== -1) return false;
        if (fingerprintOf(p)._bhash !== qCompat) return false;
        return !drawnIsomer || !isomerOf(p);
      });
      function compatibilityNote(extras) {
        if (!extras.length) return '';
        var named = extras.map(function (p) {
          return isomerOf(p) ? p.name + ' (' + isomerOf(p) + ')' : p.name + ' (geometry not stated)';
        });
        return ' Also shown, because one side leaves the backbone double bond’s geometry open rather than because it is the same material: ' +
          named.join(', ') + '.';
      }
      if (exact.length) {
        statusEl.textContent = 'Exact match found:' + tacticityNote(exact) + compatibilityNote(compatible);
        // The scheme stays tied to the exact hits: a merely geometry-compatible
        // entry must not be the one whose reaction gets drawn.
        renderResults(exact.concat(compatible), schemeCandidate(exact));
        renderPublications(exact[0]);
        return;
      }

      // Nothing matched with geometry taken literally. A backbone C=C the user
      // left unspecified is a question, not a miss: *CC=CC* IS 1,4-polybutadiene,
      // the drawing just hasn't said which one. Match again ignoring double-bond
      // geometry and name what would separate the hits, rather than dropping to
      // a similarity ranking that would list the right answer as 96% similar to
      // itself.
      var qBlind = blindHash(sub.atoms, sub.bonds);
      if (qBlind != null) {
        var blind = db.filter(function (p) { return fingerprintOf(p)._bhash === qBlind; });
        if (blind.length) {
          var drawn = isomerOf(sub);
          var named = blind.map(function (p) {
            return isomerOf(p) ? p.name + ' (' + isomerOf(p) + ')' : p.name + ' (geometry not stated)';
          });
          if (!drawn && hasUnsetStereo(sub.atoms, sub.bonds)) {
            // The drawing didn't say, so the honest answer is every isomer of
            // this skeleton plus an explanation of what would narrow it.
            statusEl.textContent = blind.length === 1
              ? 'Matched on skeleton. Your drawing leaves the backbone double bond’s geometry open; the library entry is ' + named[0] +
                '. Use the cis/trans tool to state it.'
              : 'Matched ' + blind.length + ' entries with this skeleton, differing only in the geometry of the backbone double bond: ' +
                named.join(', ') + '. Use the cis/trans tool on the double bond to pick one.' + tacticityNote(blind);
          } else if (drawn) {
            // The drawing DID say, and nothing in the library matches it. Say
            // that plainly rather than showing the other isomer as if it were
            // the answer.
            var allStated = blind.every(function (p) { return isomerOf(p); });
            statusEl.textContent = 'No ' + drawn + ' entry for this skeleton. The library has ' + named.join(', ') + ' — ' +
              (allStated
                ? 'the same connectivity with the double bond the other way round, which is a different material.'
                : 'the same connectivity, with no geometry stated either way.');
          } else {
            statusEl.textContent = 'Matched on skeleton: ' + named.join(', ') + '.';
          }
          renderResults(blind, schemeCandidate(blind));
          renderPublications(blind[0]);
          return;
        }
      }

      // Not a known single repeat unit: maybe it's an alternating/periodic
      // copolymer drawn as one bracket (…A-B-A-B…). If its backbone splits into
      // 2+ distinct known vinyl monomers, report it as a copolymer.
      var altCopoly = tryAlternatingDecompose(sub);
      if (altCopoly) { renderCopolymer(altCopoly.parts, 'alternating'); return; }

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
        }).sort(function (x, y) { return y.sim - x.sim; });
        // Five was an arbitrary cut that could drop a genuinely close relative
        // just off the end. Keep everything that clears the weak floor, capped
        // so a broad fragment cannot return the whole library, and never fewer
        // than the five it used to show. renderRanked already folds anything
        // below SIM_STRONG into a collapsed section, so widening this does not
        // make the answer noisier - it just stops hiding the tail.
        var keep = ranked.filter(function (r) { return r.sim >= SIM_WEAK_FLOOR; }).length;
        ranked = ranked.slice(0, Math.max(5, Math.min(SIM_MAX_SHOWN, keep)));
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

    // Chain architecture: what the drawing/name can and can't tell us. Separate
    // chained brackets are the block notation, so a drawn multi-block copolymer
    // is inferred as 'block'; the user can restate it for the cases geometry
    // can't decide (random/gradient), and a typed name's -co-/-b-/-alt-/-g-
    // infix states it outright.
    var ARCH_INFO = {
      block:       { label: 'Block copolymer',       infix: 'b',    q: 'block copolymer' },
      random:      { label: 'Random copolymer',      infix: 'ran',  q: 'random copolymer' },
      statistical: { label: 'Statistical copolymer', infix: 'stat', q: 'statistical copolymer' },
      alternating: { label: 'Alternating copolymer', infix: 'alt',  q: 'alternating copolymer' },
      gradient:    { label: 'Gradient copolymer',    infix: 'grad', q: 'gradient copolymer' },
      graft:       { label: 'Graft copolymer',       infix: 'g',    q: 'graft copolymer' },
      bottlebrush: { label: 'Bottlebrush polymer',   infix: 'g',    q: 'bottlebrush polymer molecular brush' },
      copolymer:   { label: 'Copolymer',             infix: 'co',   q: 'copolymer' }
    };
    var ARCH_ORDER = ['block', 'random', 'alternating', 'gradient', 'graft', 'statistical'];
    function archInfo(a) { return ARCH_INFO[a] || ARCH_INFO.copolymer; }
    function copolyFormalName(names, arch) {
      var inf = archInfo(arch).infix;
      return names.map(function (n, i) { return i === 0 ? n : n.toLowerCase(); }).join('-' + inf + '-');
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

    // Alternating (single-bracket) decomposition: a repeat unit whose all-carbon
    // backbone splits cleanly into 2-carbon vinyl monomers, each of which is a
    // known library homopolymer, is an alternating/periodic copolymer of those.
    // Heavily guarded so it only fires on genuine vinyl-alt-vinyl units and never
    // on a homopolymer, diene, or ring-opening unit (their halves don't identify).
    // Returns {parts:[{name,entry,count}...]} with 2+ distinct monomers, else null.
    function tryAlternatingDecompose(sub) {
      var atomsL = sub.atoms, bondsL = sub.bonds;
      var stars = atomsL.filter(function (a) { return a.el === '*'; });
      if (stars.length !== 2) return null;
      var byId = {}; atomsL.forEach(function (a) { byId[a.id] = a; });
      var adj = {}; atomsL.forEach(function (a) { adj[a.id] = []; });
      bondsL.forEach(function (b) { adj[b.a].push({ id: b.b, order: b.order }); adj[b.b].push({ id: b.a, order: b.order }); });
      function nbOfStar(s) { return adj[s.id].length ? adj[s.id][0].id : null; }
      var n0 = nbOfStar(stars[0]), n1 = nbOfStar(stars[1]);
      if (n0 == null || n1 == null) return null;
      // Backbone path between the two star neighbours (BFS over non-star atoms).
      var prev = {}, seen = {}, q = [n0]; seen[n0] = 1; prev[n0] = null;
      while (q.length) {
        var u = q.shift(); if (u === n1) break;
        adj[u].forEach(function (e) { if (byId[e.id].el === '*') return; if (!seen[e.id]) { seen[e.id] = 1; prev[e.id] = u; q.push(e.id); } });
      }
      if (!seen[n1]) return null;
      var path = []; for (var cc = n1; cc != null; cc = prev[cc]) path.unshift(cc);
      if (path.length < 4 || path.length % 2 !== 0) return null;   // need an even backbone >= 4
      var onPath = {}; path.forEach(function (id) { onPath[id] = 1; });
      for (var i = 0; i < path.length; i++) if (byId[path[i]].el !== 'C') return null;   // vinyl backbone only
      function bondOrder(a, b) { var e = adj[a].filter(function (x) { return x.id === b; })[0]; return e ? e.order : 0; }
      for (i = 0; i < path.length - 1; i++) if (bondOrder(path[i], path[i + 1]) !== 1) return null;  // no backbone C=C (rules out dienes)

      // Build one monomer sub-unit for the backbone pair (a0,a1): the two carbons
      // plus their (fully terminating) pendants, capped with a star on each bond
      // that leaves the pair.
      function buildMonomer(a0, a1) {
        var core = {}; core[a0] = 1; core[a1] = 1;
        [a0, a1].forEach(function (bk) {
          adj[bk].forEach(function (e) {
            if (byId[e.id].el === '*' || core[e.id] || onPath[e.id]) return;   // star/backbone -> boundary
            var st = [e.id], ls = {}; ls[e.id] = 1;
            var hitsBackbone = false;
            while (st.length) {
              var x = st.pop();
              adj[x].forEach(function (y) {
                if (byId[y.id].el === '*') return;
                if (y.id === a0 || y.id === a1) return;            // the pair's own carbons are the attachment, not a hit
                if (onPath[y.id]) { hitsBackbone = true; return; } // reaching another backbone atom means it isn't a simple pendant
                if (!ls[y.id]) { ls[y.id] = 1; st.push(y.id); }
              });
            }
            if (!hitsBackbone) Object.keys(ls).forEach(function (id) { core[id] = 1; });
          });
        });
        var mAtoms = [], mBonds = [], sc = 0, bc = 0;
        Object.keys(core).forEach(function (id) { var a = byId[id]; mAtoms.push({ id: id, el: a.el, charge: a.charge }); });
        bondsL.forEach(function (b) {
          var ain = !!core[b.a], bin = !!core[b.b];
          if (ain && bin) mBonds.push({ a: b.a, b: b.b, order: b.order });
          else if (ain || bin) { bc++; var inEnd = ain ? b.a : b.b; var sid = 'MS' + (sc++); mAtoms.push({ id: sid, el: '*' }); mBonds.push({ a: inEnd, b: sid, order: b.order }); }
        });
        return bc === 2 ? { atoms: mAtoms, bonds: mBonds } : null;
      }

      var db = window.POLYMER_DB || [];
      function idMonomer(mon) {
        if (!mon) return null;
        var qc = closedHash(mon.atoms, mon.bonds);
        if (qc == null) return null;
        return db.filter(function (p) { if (p.type === 'copolymer' || !p.atoms) return false; return fingerprintOf(p)._chash === qc; })[0] || null;
      }

      // Pair the backbone from the star-defined junction (path[0]/path[1], ...).
      var entries = [];
      for (var m = 0; m < path.length / 2; m++) {
        var e = idMonomer(buildMonomer(path[2 * m], path[2 * m + 1]));
        if (!e) return null;
        entries.push(e);
      }
      var keys = {}; entries.forEach(function (e) { keys[e.name] = (keys[e.name] || 0) + 1; });
      var distinct = Object.keys(keys);
      if (distinct.length < 2) return null;   // all the same -> a homopolymer, not a copolymer
      return { parts: distinct.map(function (n) { var ent = entries.filter(function (e) { return e.name === n; })[0]; return { name: n, entry: ent, count: keys[n] }; }) };
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
        if (r.atomIds) return extractFromAtomIds(r.atomIds);   // loaded block: exact atom set
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
        renderCopolymer(order.map(function (o) { return toPart(o, null); }), 'block');
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
        renderCopolymer(parts, 'block');
      }).catch(function () {
        renderCopolymer(order.map(function (o) { return toPart(o, null); }), 'block');
      });
    }

    // The active copolymer result, so the architecture selector can repaint the
    // name and publications without re-running the structure search.
    var copolyState = null;
    function renderCopolymer(parts, inferredArch) {
      var named = matchNamedCopolymer(parts);
      var arch = (named && named.arch) || inferredArch || 'copolymer';
      copolyState = { parts: parts, named: named };
      paintCopolymer(arch);
    }

    function paintCopolymer(arch) {
      if (!copolyState) return;
      var parts = copolyState.parts, named = copolyState.named;
      copolyState.arch = arch;
      var statusEl = document.getElementById('mol-status');
      var resultsEl = document.getElementById('mol-results');
      if (!resultsEl) return;
      var idEl = document.getElementById('mol-identify');
      if (idEl) { idEl.hidden = true; idEl.innerHTML = ''; }

      var known = parts.filter(function (p) { return p.name; });
      var names = known.map(function (p) { return p.name; });
      var unknownCount = parts.length - known.length;
      var ai = archInfo(arch);

      if (statusEl) {
        statusEl.textContent = named ? 'Copolymer identified: ' + named.name
          : (names.length ? ai.label + ' of ' + joinNames(names) + (unknownCount ? ' (plus ' + unknownCount + ' unidentified)' : '') : 'Could not identify the blocks of this copolymer.');
      }

      var blockList = parts.map(function (p, i) {
        var s = BLOCK_SUBSCRIPTS[i] || String(i + 1);
        return escapeHtml(p.name || 'unidentified') + ' <span style="color:var(--text-dim);">[' + s + (p.count > 1 ? '] &times;' + p.count : ']') + '</span>';
      }).join(' &nbsp;&middot;&nbsp; ');

      var archSelect = '<div class="mol-result-meta" style="margin-top:6px;">Architecture: ' +
        '<select class="mol-arch-select" style="font:inherit;padding:2px 4px;">' +
        ARCH_ORDER.map(function (a) { return '<option value="' + a + '"' + (a === arch ? ' selected' : '') + '>' + archInfo(a).label + '</option>'; }).join('') +
        '</select>' +
        (named ? '' : ' <span style="color:var(--text-dim);">inferred from your bracketing; set it for random / gradient / graft</span>') +
        '</div>';

      var summary = '<div class="mol-result-card" style="border-left:3px solid var(--primary);">' +
        '<div class="mol-result-name">' + (named ? escapeHtml(named.name) : (names.length ? ai.label + ' of ' + escapeHtml(joinNames(names)) : 'Copolymer')) + '</div>' +
        (named && named.aka && named.aka.length ? '<div class="mol-result-aka">' + escapeHtml(named.aka.join(', ')) + '</div>'
          : (names.length ? '<div class="mol-result-aka">' + escapeHtml(copolyFormalName(names, arch)) + '</div>' : '')) +
        '<div class="mol-result-meta">' + (named && named.cls ? escapeHtml(named.cls) + ' &middot; ' : '') + 'blocks: ' + blockList + '</div>' +
        archSelect +
        (named && named.note ? '<div class="mol-result-note">' + escapeHtml(named.note) + '</div>' : '') +
        '<div class="mol-result-note" style="color:var(--text-dim);">A drawing shows which repeat units are present; the architecture is inferred from how the blocks are bracketed (or set above). Random and gradient copolymers have no periodic unit to draw, so state those. Publications below cover this combination.</div>' +
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
                             : [names.join(' ') + ' ' + ai.q];
      renderPublications({ name: named ? named.name : (ai.label + ' of ' + joinNames(names)),
                           aka: named ? (named.aka || []) : [copolyFormalName(names, arch)], queryTerms: queryTerms });
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
        var hits = matchQmol(lib, qmol, frag.atoms.length, qfp);
        qmol.delete();
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

    // Run a prepared query molecule against every library repeat unit. Shared
    // by the drawn-fragment search and the typed-SMARTS search, which differ
    // only in where the query comes from - a second copy of this loop is how
    // the two would drift into answering the same question differently.
    // qHeavy is the query's heavy-atom count, used only for the coverage
    // figure; a SMARTS pattern's "size" is approximate, so coverage is a
    // ranking hint rather than a measurement.
    function matchQmol(lib, qmol, qHeavy, qfp) {
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
      // Coverage first (the fragment is most OF these polymers), similarity
      // breaks ties. All hits render - a fragment search legitimately returns
      // dozens, and truncating would misreport the set.
      hits.sort(function (x, y) { return (y.cov - x.cov) || (y.sim - x.sim); });
      return hits;
    }

    // ---------- Typed SMARTS search ----------
    // The drawn-fragment search above builds its pattern with get_smarts(),
    // which describes exactly what was drawn: those elements, those bond
    // orders. That cannot ask a GENERIC question - "any halogen on the
    // backbone", "any aromatic ring", "an ester however it is substituted" -
    // because there is no way to draw "any halogen". SMARTS is the notation
    // for that, RDKit already understands it, and the matching machinery is
    // the same from get_qmol onward.
    //
    // An empty or unparseable pattern is refused rather than silently matching
    // nothing: RDKit's get_qmol returns a usable object for some nonsense
    // input, and a query that matches everything looks identical to a query
    // that matches nothing if you only read the count.
    function estimateSmartsSize(s) {
      // Rough heavy-atom count: bracketed atom expressions plus bare organic
      // subset symbols. Only feeds the coverage ranking, never a claim.
      var brackets = (s.match(/\[[^\]]*\]/g) || []).length;
      var bare = (s.replace(/\[[^\]]*\]/g, '').match(/Cl|Br|[BCNOPSFIbcnops]/g) || []).length;
      return Math.max(1, brackets + bare);
    }

    function runSmartsSearch() {
      var statusEl = document.getElementById('mol-status');
      var input = document.getElementById('mol-smarts-input');
      if (!statusEl || !input) return;
      var pattern = input.value.trim();
      if (!pattern) {
        statusEl.textContent = 'Type a SMARTS pattern first, or press one of the examples below it.';
        renderResults([]);
        return;
      }
      statusEl.textContent = rdkitPromise ? 'Matching SMARTS…'
        : 'Loading the structure-matching engine (about 7 MB, one time; it stays cached)…';
      ensureRDKit().then(function (RDKit) {
        var qmol = null;
        try { qmol = RDKit.get_qmol(pattern); } catch (e) { qmol = null; }
        if (!qmol) {
          statusEl.textContent = 'That is not a SMARTS pattern RDKit can read. Check the brackets and ring closures.';
          renderResults([]);
          return;
        }
        var lib = prepRdkitLibrary(RDKit);
        var hits = matchQmol(lib, qmol, estimateSmartsSize(pattern), null);
        qmol.delete();
        statusEl.textContent = hits.length
          ? hits.length + ' of ' + lib.length + ' library polymers match ' + pattern +
            (hits.length === lib.length ? ' — which is all of them, so the pattern is not narrowing anything.' : ':')
          : 'No library polymer matches ' + pattern + '. A pattern that matches nothing and a typo look the same here, so check it against a structure you know first.';
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

    ['mol-arrow-above', 'mol-arrow-below'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', function () {
        if (!selectedArrow) return;
        selectedArrow[id === 'mol-arrow-above' ? 'above' : 'below'] = el.value;
        draw();
      });
    });
    var labelTextEl = document.getElementById('mol-label-text');
    if (labelTextEl) labelTextEl.addEventListener('input', function () {
      if (!selectedLabel) return;
      selectedLabel.text = labelTextEl.value;
      draw();
    });
    // Changing the shape applies to the selected arrow AND becomes the default
    // for the next one, so drawing three equilibria is three drags, not six
    // clicks.
    document.querySelectorAll('.mol-kind-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        pendingArrowKind = btn.getAttribute('data-kind');
        if (selectedArrow) { snapshot(); selectedArrow.kind = pendingArrowKind; }
        syncAnnotationPanel();
        draw();
      });
    });
    // The plus is the one glyph a step-growth scheme cannot do without, so it
    // gets its own button rather than making people type it.
    var plusBtn = document.getElementById('mol-plus-btn');
    if (plusBtn) plusBtn.addEventListener('click', function () {
      pendingLabelText = '+';
      var textBtn = document.querySelector('.mol-mode-btn[data-mode="text"]');
      if (textBtn) textBtn.click();
      setStatus('Click where the + belongs, between the two reactants.');
    });

    // Character inserts act on whichever annotation field was last focused, so
    // they work for the arrow's two lines and for a text label alike.
    var lastAnnotationField = null;
    ['mol-arrow-above', 'mol-arrow-below', 'mol-label-text'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('focus', function () { lastAnnotationField = el; });
    });
    document.querySelectorAll('.mol-char-btn').forEach(function (btn) {
      btn.addEventListener('mousedown', function (evt) { evt.preventDefault(); });  // keep focus
      btn.addEventListener('click', function () {
        var el = lastAnnotationField ||
          document.getElementById(selectedLabel ? 'mol-label-text' : 'mol-arrow-above');
        if (!el || el.hidden) return;
        var ch = btn.getAttribute('data-char');
        var at = typeof el.selectionStart === 'number' ? el.selectionStart : el.value.length;
        el.value = el.value.slice(0, at) + ch + el.value.slice(el.selectionEnd != null ? el.selectionEnd : at);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.focus();
        try { el.setSelectionRange(at + ch.length, at + ch.length); } catch (e) {}
      });
    });

    var chainBtn = document.getElementById('mol-chain-btn');
    if (chainBtn) chainBtn.addEventListener('click', showChainPreview);

    var smartsBtn = document.getElementById('mol-smarts-search');
    if (smartsBtn) smartsBtn.addEventListener('click', function () {
      runSmartsSearch();
      scrollResultsIntoView();
    });
    var smartsInput = document.getElementById('mol-smarts-input');
    if (smartsInput) smartsInput.addEventListener('keydown', function (evt) {
      if (evt.key === 'Enter') { evt.preventDefault(); runSmartsSearch(); scrollResultsIntoView(); }
    });
    // The example chips exist because SMARTS is the one input on this page
    // nobody types from memory. Each fills the box AND runs, so the notation
    // is learned by seeing a pattern next to its answer.
    document.querySelectorAll('.mol-smarts-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        if (!smartsInput) return;
        smartsInput.value = chip.getAttribute('data-smarts');
        runSmartsSearch();
        scrollResultsIntoView();
      });
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

    // ---------- Facet search: the library's own metadata ----------
    //
    // Every entry carries tags and a class, curated alongside the structures,
    // and none of it used to be searchable: the ranking only looked at name,
    // aka and CAS. "Biodegradable" returned nothing while 67 entries were
    // tagged biodegradable; "polyester" returned the 10 with the word in their
    // name out of the 165 that are one. This indexes what was already there.
    //
    // It sits BELOW every name tier, so an abbreviation still beats a category:
    // typing PMMA gives you PMMA, not the forty methacrylates.
    var FACET_TIER = 20;         // first facet rank, above every name tier
    var facetIndexCache = null;

    function facetNorm(s) {
      return String(s || '').toLowerCase().replace(/[‐-―]/g, '-').replace(/\s+/g, ' ').trim();
    }

    // A class reads "Step-growth (polyester)" or "Addition (vinyl)". People
    // type "polyester", "step-growth" or "vinyl", so index the whole string and
    // each parenthesised or hyphenated part of it as separate terms.
    function classTerms(cls) {
      var c = facetNorm(cls);
      if (!c) return [];
      var out = [c];
      var inner = c.match(/\(([^)]+)\)/);
      if (inner) out.push(facetNorm(inner[1]));
      var head = c.replace(/\s*\([^)]*\)/g, '').trim();
      if (head && out.indexOf(head) === -1) out.push(head);
      return out;
    }

    function facetTermsOf(p) {
      if (p._facets) return p._facets;
      var terms = [];
      (p.tags || []).forEach(function (t) { terms.push(facetNorm(t)); });
      classTerms(p.cls).forEach(function (t) { if (terms.indexOf(t) === -1) terms.push(t); });
      if (p.arch) terms.push(facetNorm(p.arch));
      if (p.type) terms.push(facetNorm(p.type));
      try { Object.defineProperty(p, '_facets', { value: terms, enumerable: false }); } catch (e) { p._facets = terms; }
      return terms;
    }

    // Counted once so the chip row can show how many entries each facet holds -
    // a category chip with no number is a promise you cannot check.
    function facetIndex() {
      if (facetIndexCache) return facetIndexCache;
      var db = window.POLYMER_DB || [];
      var tagCount = {}, clsCount = {};
      db.forEach(function (p) {
        (p.tags || []).forEach(function (t) {
          var k = facetNorm(t);
          if (k) tagCount[k] = (tagCount[k] || 0) + 1;
        });
        classTerms(p.cls).forEach(function (t) { clsCount[t] = (clsCount[t] || 0) + 1; });
      });
      function toList(obj) {
        return Object.keys(obj).map(function (k) { return { term: k, n: obj[k] }; })
          .sort(function (a, b) { return b.n - a.n || (a.term < b.term ? -1 : 1); });
      }
      facetIndexCache = { tags: toList(tagCount), classes: toList(clsCount) };
      return facetIndexCache;
    }

    // Does this entry answer this single term? Names count too, so a mixed
    // query like "biodegradable polyester" and one like "polylactide hydrogel"
    // both work without the caller knowing which words are which.
    function termMatches(p, term) {
      var facets = facetTermsOf(p);
      for (var i = 0; i < facets.length; i++) {
        if (facets[i] === term || facets[i].indexOf(term) !== -1) return true;
      }
      if (facetNorm(p.name).indexOf(term) !== -1) return true;
      var aka = p.aka || [];
      for (var j = 0; j < aka.length; j++) {
        if (facetNorm(aka[j]).indexOf(term) !== -1) return true;
      }
      return facetNorm(p.monomer).indexOf(term) !== -1;
    }

    // Whole query first, then word-by-word intersection. Order matters: "drug
    // delivery" is one tag, so splitting it up front would turn an exact
    // category into a two-word AND that happens to give the same answer for the
    // wrong reason - and "self-assembly" would break outright.
    function facetQuery(q) {
      var query = facetNorm(q);
      if (query.length < 3) return null;
      var db = window.POLYMER_DB || [];
      var whole = db.filter(function (p) { return facetTermsOf(p).indexOf(query) !== -1; });
      if (whole.length) return { list: whole, terms: [query], exact: true };

      var words = query.split(' ').filter(function (w) { return w.length >= 3; });
      if (!words.length) return null;
      // Every word has to land on something, or "polyester recipe" would quietly
      // answer as if you had only typed "polyester".
      for (var i = 0; i < words.length; i++) {
        var anyHit = false;
        for (var j = 0; j < db.length; j++) {
          if (termMatches(db[j], words[i])) { anyHit = true; break; }
        }
        if (!anyHit) return null;
      }
      var list = db.filter(function (p) {
        return words.every(function (w) { return termMatches(p, w); });
      });
      return list.length ? { list: list, terms: words, exact: false } : null;
    }

    // ---------- Chips, and paging a category that runs to 165 entries ----------

    var activeFacets = [];
    var pendingRest = null;

    function renderMore(rest, label) {
      var resultsEl = document.getElementById('mol-results');
      if (!resultsEl || !rest.length) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn mol-more-btn';
      btn.textContent = 'Show the other ' + rest.length + ' ' + label;
      btn.addEventListener('click', function () {
        btn.remove();
        resultsEl.insertAdjacentHTML('beforeend', rest.map(polymerCard).join(''));
      });
      resultsEl.appendChild(btn);
    }

    // A category answer is a list, not a ranking, so it pages instead of being
    // silently cut to the first twenty the way a name search can afford to be.
    var FACET_PAGE = 24;
    function renderFacetResults(list, statusEl, message, schemeFor) {
      renderResults(list.slice(0, FACET_PAGE), schemeFor);
      if (statusEl) statusEl.textContent = message;
      if (list.length > FACET_PAGE) renderMore(list.slice(FACET_PAGE), 'polymers');
    }

    function facetLabel(term) {
      return term.charAt(0).toUpperCase() + term.slice(1);
    }

    function runActiveFacets() {
      var statusEl = document.getElementById('mol-status');

    var nameInput = document.getElementById('mol-name-search');
      if (!activeFacets.length) {
        renderResults([]);
        if (statusEl) statusEl.textContent = '';
        renderFacetBar();
        return;
      }
      if (nameInput) nameInput.value = '';
      var db = window.POLYMER_DB || [];
      var list = db.filter(function (p) {
        return activeFacets.every(function (t) { return termMatches(p, t); });
      });
      renderFacetBar();
      renderFacetResults(list, statusEl,
        list.length
          ? list.length + ' ' + (list.length === 1 ? 'polymer is' : 'polymers are') + ' ' +
            activeFacets.map(facetLabel).join(' + ') + ':'
          : 'Nothing is ' + activeFacets.map(facetLabel).join(' + ') + '. Remove a filter to widen it.');
    }

    function chipButton(term, count, on) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'mol-facet-chip' + (on ? ' is-on' : '');
      b.textContent = facetLabel(term) + (count != null ? ' ' + count : '');
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.addEventListener('click', function () {
        var at = activeFacets.indexOf(term);
        if (at === -1) activeFacets.push(term); else activeFacets.splice(at, 1);
        runActiveFacets();
      });
      return b;
    }

    var facetBarOpen = false;

    function renderFacetBar() {      var wrap = document.getElementById('mol-facets');
      if (!wrap) return;
      var idx = facetIndex();
      wrap.innerHTML = '';
      wrap.hidden = false;

      var head = document.createElement('div');
      head.className = 'mol-facet-head';
      var label = document.createElement('span');
      label.className = 'mol-recent-label';
      label.textContent = 'Browse ' + (window.POLYMER_DB || []).length + ' polymers:';
      head.appendChild(label);
      wrap.appendChild(head);

      var row = document.createElement('div');
      row.className = 'mol-facet-row';
      // Classes first: they partition the library, so they are the honest way
      // in. Tags overlap and are the second cut.
      var classes = idx.classes.filter(function (c) { return c.n >= 15 && c.term.indexOf('(') === -1; });
      var tags = idx.tags.filter(function (t) { return t.n >= 12; });
      var shown = facetBarOpen ? classes.concat(tags) : classes.slice(0, 6).concat(tags.slice(0, 8));
      shown.forEach(function (f) {
        row.appendChild(chipButton(f.term, f.n, activeFacets.indexOf(f.term) !== -1));
      });
      // Anything switched on that this view would otherwise hide still shows,
      // or a filter could be active with no way to switch it off.
      activeFacets.forEach(function (t) {
        if (!shown.some(function (f) { return f.term === t; })) row.appendChild(chipButton(t, null, true));
      });
      wrap.appendChild(row);

      var more = document.createElement('button');
      more.type = 'button';
      more.className = 'mol-recent-clear';
      more.textContent = facetBarOpen ? 'Fewer categories' : 'All ' + (classes.length + tags.length) + ' categories';
      more.addEventListener('click', function () { facetBarOpen = !facetBarOpen; renderFacetBar(); });
      head.appendChild(more);

      if (activeFacets.length) {
        var clear = document.createElement('button');
        clear.type = 'button';
        clear.className = 'mol-recent-clear';
        clear.textContent = 'Clear filters';
        clear.addEventListener('click', function () { activeFacets = []; runActiveFacets(); });
        head.appendChild(clear);
      }
    }

    // Called here, after the block above: renderFacetBar reads activeFacets,
    // and a var declared later in this handler is still undefined when the
    // line runs, so calling it any earlier threw and left an empty bar.
    renderFacetBar();

    var nameInput = document.getElementById('mol-name-search');
    if (nameInput) {
      nameInput.addEventListener('input', function () {
        var q = nameInput.value.trim().toLowerCase();
        if (activeFacets.length) { activeFacets = []; renderFacetBar(); }
        var statusEl = document.getElementById('mol-status');
        clearTimeout(recentTimer);
        if (!q) { renderResults([]); if (statusEl) statusEl.textContent = ''; return; }
        var db = window.POLYMER_DB || [];
        // How well an entry answers the query. Substring alone is not enough to
        // order by: an abbreviation typed exactly should beat one that merely
        // occurs inside a longer alias, or "PSS" lands on PEDOT (whose alias
        // mentions PEDOT:PSS) and "PBI" on a bottlebrush called PBiBEM-g-PMMA,
        // ahead of the polymers actually abbreviated that way. Lower is better;
        // null means no match at all.
        function rank(p) {
          var name = p.name.toLowerCase();
          var akas = (p.aka || []).map(function (a) { return a.toLowerCase(); });
          if (name === q) return 0;
          if (akas.indexOf(q) !== -1) return 1;
          if (name.indexOf(q) === 0) return 2;
          if (akas.some(function (a) { return a.indexOf(q) === 0; })) return 3;
          if (name.indexOf(q) !== -1) return 4;
          if (akas.some(function (a) { return a.indexOf(q) !== -1; })) return 5;
          // Every result card prints "CAS <rn>", so people paste one back in.
          // These are the polymer registry numbers, not the monomer's, so a
          // monomer RN off a bottle label deliberately does not match here.
          if (p.cas && p.cas.toLowerCase().indexOf(q) !== -1) return 6;
          return null;
        }
        var scored = [];
        db.forEach(function (p, i) {
          var r = rank(p);
          if (r !== null) scored.push({ p: p, r: r, i: i });
        });
        scored.sort(function (a, b) { return a.r - b.r || a.i - b.i; });
        // A typed category is answered from the same box as a typed name, and
        // which of the two leads depends on what was typed.
        //
        // When the query IS a category ("polyester" is a class term), the
        // category leads in library order and only an exact name or alias goes
        // ahead of it. Letting the name tiers lead put Poly(ester urethane)
        // above PET, PLA and PCL - an alias that happens to start with the same
        // letters, ranked above the polymers the word actually means.
        //
        // When the query is a name that also happens to touch a category, the
        // name hits lead and the category widens the list underneath.
        var facet = facetQuery(q);
        var matches, added = 0;
        if (facet && facet.exact) {
          var lead = [], rest = [];
          scored.forEach(function (s) { (s.r <= 1 ? lead : rest).push(s.p); });
          matches = lead.slice();
          var have = {};
          matches.forEach(function (p) { have[p.name] = 1; });
          facet.list.forEach(function (p) {
            if (!have[p.name]) { have[p.name] = 1; matches.push(p); added++; }
          });
          rest.forEach(function (p) { if (!have[p.name]) { have[p.name] = 1; matches.push(p); } });
        } else {
          matches = scored.map(function (s) { return s.p; });
          if (facet) {
            var seen = {};
            matches.forEach(function (p) { seen[p.name] = 1; });
            facet.list.forEach(function (p) {
              if (!seen[p.name]) { seen[p.name] = 1; matches.push(p); added++; }
            });
          }
        }
        var named = scored.map(function (s) { return s.p; });
        if (matches.length) {
          // Some abbreviations genuinely belong to more than one polymer - PPO
          // is both poly(propylene oxide) and poly(phenylene oxide), PEA both
          // the ethyl acrylate and the ethylene adipate. Ranking has to put one
          // of them first, which silently looks like an answer, so say when the
          // query is ambiguous rather than letting the order imply a winner.
          var exact = scored.filter(function (s) { return s.r <= 1; });
          var msg;
          if (exact.length > 1) msg = exact.length + ' polymers are known as "' + nameInput.value.trim() + '" — all shown:';
          // On a category query the category leads, so do not claim the named
          // ones are on top: they are ranked among the rest.
          else if (facet && facet.exact) {
            // Only the facet list is actually IN the category. The rest of the
            // list got here because rank() matches a query as a substring of a
            // name or alias, which is deliberate - it is how abbreviations
            // resolve - but it means typing "star" also brings in "starch
            // (linear fraction)", "animal starch", "SIBSTAR" and "Starburst
            // dendrimer". Counting all of them as "in that category" claimed
            // twelve star polymers where the library has five.
            var inCategory = 0;
            matches.forEach(function (p) { if (facet.list.indexOf(p) !== -1) inCategory++; });
            var alsoNamed = matches.length - inCategory;
            msg = inCategory + ' ' + (inCategory === 1 ? 'polymer is' : 'polymers are') + ' in that category' +
              (alsoNamed
                ? ', and ' + alsoNamed + ' more ' + (alsoNamed === 1 ? 'has' : 'have') +
                  ' "' + nameInput.value.trim() + '" inside a name or alias'
                : '') + ':';
          }
          else if (added && named.length) msg = named.length + ' named that, and ' + added + ' more in that category:';
          else if (added) msg = matches.length + ' ' + (matches.length === 1 ? 'polymer is' : 'polymers are') + ' in that category:';
          else msg = matches.length + ' match' + (matches.length === 1 ? '' : 'es') + ':';
          // One entry answering to the typed name is a confident answer; two
          // polymers sharing an abbreviation (PPO, PEA) is not, and a category
          // query is a list rather than an answer at all.
          renderFacetResults(matches, statusEl, msg, (exact.length === 1 && !(facet && facet.exact)) ? exact[0].p : null);
        } else if (facet) {
          renderFacetResults(facet.list, statusEl, facet.list.length + ' ' +
            (facet.list.length === 1 ? 'polymer is' : 'polymers are') + ' ' + facetLabel(facet.terms.join(' + ')) + ':');
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
    // Resolve a monomer/polymer name fragment (from inside a copolymer name) to
    // a library homopolymer, by name, alias, or monomer.
    function resolveComponent(frag) {
      var db = window.POLYMER_DB || [];
      var full = canonName(frag);
      var mono = full.replace(/^poly[\s(]*/, '').replace(/[)\s]*$/, '').trim();
      function structural(p) { return p.atoms && p.type !== 'copolymer'; }
      return db.filter(function (p) { return structural(p) && (canonName(p.name) === full || (p.aka || []).some(function (a) { return canonName(a) === full; })); })[0]
        || db.filter(function (p) { return structural(p) && p.monomer && canonName(p.monomer) === mono; })[0]
        || db.filter(function (p) { return structural(p) && (p.aka || []).some(function (a) { return canonName(a) === mono; }); })[0]
        || db.filter(function (p) { return structural(p) && p.monomer && mono.length > 3 && canonName(p.monomer).indexOf(mono) !== -1; })[0]
        || null;
    }

    // Parse a typed copolymer name into components + architecture, e.g.
    // "poly(styrene-co-methyl methacrylate)" or "PS-b-PMMA" or
    // "block copolymer of polystyrene and PMMA". Returns null if it doesn't parse.
    function parseCopolymerQuery(q) {
      var s = canonName(q);
      var wrap = s.match(/^poly\s*\((.+)\)\s*$/);
      var inner = wrap ? wrap[1] : s;
      var infixes = [
        { re: /-\s*block\s*-|-\s*b\s*-/, arch: 'block' },
        { re: /-\s*alt\s*-/, arch: 'alternating' },
        { re: /-\s*grad\s*-/, arch: 'gradient' },
        { re: /-\s*stat\s*-/, arch: 'statistical' },
        { re: /-\s*ran\s*-/, arch: 'random' },
        { re: /-\s*co\s*-/, arch: 'random' },
        { re: /-\s*graft\s*-|-\s*g\s*-/, arch: 'graft' }
      ];
      for (var i = 0; i < infixes.length; i++) {
        if (infixes[i].re.test(inner)) {
          var comps = inner.split(infixes[i].re).map(resolveComponent);
          if (comps.length >= 2 && comps.every(Boolean)) {
            return { parts: comps.map(function (e) { return { name: e.name, entry: e, count: 1 }; }), arch: infixes[i].arch };
          }
          return null;
        }
      }
      var m = s.match(/(block|random|statistical|alternating|gradient|graft)?\s*copolymer\s+of\s+(.+?)\s+and\s+(.+)/);
      if (m) {
        var a = resolveComponent(m[2]), b = resolveComponent(m[3]);
        if (a && b) return { parts: [{ name: a.name, entry: a, count: 1 }, { name: b.name, entry: b, count: 1 }], arch: m[1] || 'copolymer' };
      }
      return null;
    }

    function rescueNameSearch(q, statusEl) {
      var db = window.POLYMER_DB || [];
      // A typed copolymer name ("poly(styrene-co-MMA)") that isn't a library
      // entry: identify its components and report it with the stated architecture.
      var copoly = parseCopolymerQuery(q);
      if (copoly) { renderCopolymer(copoly.parts, copoly.arch); return; }
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
    // Explore is one combined filter: every selected tag must be present, then
    // AND with each property range. An entry missing a property that is being
    // filtered on is excluded but COUNTED, so "35 shown, 12 lack Tg data"
    // never silently pretends the library has been fully screened.
    //
    // Tags used to OR-combine, which was wrong here because the chips are not
    // one facet: they mix chemistry (acrylic), architecture (block), and use
    // (biomedical). Picking "acrylic" and "block" returned 21 acrylics plus 2
    // block copolymers and presented the union as though every hit were both.
    // Narrowing is the only reading that makes sense across different facets.
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
        var tags = p.tags || [];
        if (active.length && !active.every(function (t) { return tags.indexOf(t) !== -1; })) return false;
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
        // " + " rather than ", ": a comma list reads as "any of these", which is
        // exactly the wrong impression now that the tags narrow.
        if (active.length) parts.push('tagged ' + active.join(' + '));
        if (tgOn) parts.push(rangeText('Tg', tgMin, tgMax));
        if (tmOn) parts.push(rangeText('Tm', tmMin, tmMax));
        var head;
        if (matches.length) {
          head = matches.length + ' polymer' + (matches.length === 1 ? '' : 's') + ' ' + parts.join(', ');
        } else {
          head = 'No polymers match ' + parts.join(', ');
          // Empty is a normal outcome now that tags narrow, so say why rather
          // than leaving it looking like the library is missing something.
          if (active.length > 1) head += ' — every selected tag has to apply';
        }
        statusEl.textContent = head +
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
    // Tesseract (the in-browser OCR engine) is fetched lazily from a public CDN
    // only when the photo-read feature is actually used, so it never sits in the
    // page's blocking load path. A network that blackholes the CDN (as some
    // secure/government networks do) can no longer stall the rest of the search.
    var tesseractPromise = null;
    function ensureTesseract() {
      if (typeof Tesseract !== 'undefined') return Promise.resolve(true);
      if (tesseractPromise) return tesseractPromise;
      tesseractPromise = new Promise(function (resolve) {
        var done = false;
        var finish = function (ok) { if (!done) { done = true; resolve(ok); } };
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        s.onload = function () { finish(typeof Tesseract !== 'undefined'); };
        s.onerror = function () { finish(false); };
        setTimeout(function () { finish(false); }, 12000);   // give up cleanly if the CDN is blocked/hung
        document.head.appendChild(s);
      });
      return tesseractPromise;
    }
    function runImageOCR(file) {
      var ocrStatusEl = document.getElementById('mol-ocr-status');
      var ocrTextEl = document.getElementById('mol-ocr-text');
      var statusEl = document.getElementById('mol-status');
      if (ocrTextEl) { ocrTextEl.hidden = true; ocrTextEl.textContent = ''; }
      // Route through the decoders first so PDFs and HEICs get rasterised to a
      // canvas Tesseract can eat, and unsupported/oversized files are rejected
      // BEFORE the ~15 MB Tesseract download starts.
      var decoders = window.OcrDecoders;
      var prep = decoders ? decoders.prepareForOcr(file) : Promise.resolve({ kind: 'jpeg', canvas: null });
      if (ocrStatusEl) ocrStatusEl.textContent = 'Checking file…';
      prep.then(function (res) {
        if (res.error) { if (ocrStatusEl) ocrStatusEl.textContent = res.message; return; }
        if (ocrStatusEl) ocrStatusEl.textContent = 'Loading the text reader…';
        return ensureTesseract().then(function (loaded) {
          if (!loaded || typeof Tesseract === 'undefined') {
            if (ocrStatusEl) ocrStatusEl.textContent = 'The in-browser text reader could not load. It is fetched from a public CDN (cdn.jsdelivr.net) that some secure networks block. Type the polymer name in the search box instead.';
            return;
          }
          if (ocrStatusEl) ocrStatusEl.textContent = 'Reading ' + (res.kind === 'pdf' ? 'PDF' : res.kind === 'heic' ? 'HEIC image' : 'image') + '…';
          var input = res.canvas || file;
          return Tesseract.recognize(input, 'eng').then(function (result) {
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
        });
      }).catch(function (err) {
        // PDF/HEIC decoder failures land here. errorMessage maps our internal
        // tags ("pdf-load-failed", "heic-unsupported") to user-facing prose.
        if (ocrStatusEl) ocrStatusEl.textContent = decoders ? decoders.errorMessage(err) : 'Could not read that file.';
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
        // b1 and b2 sit on the usual 30 degree zigzag; the stubs then step OUT
        // horizontally (180 and 0 degrees) so they are guaranteed to sit far
        // enough clear of the pendant phenyl for the bracket to enclose the
        // whole ring without swallowing a stub. A pure zigzag would put stubD
        // only ~36 px past b2 - narrower than the ring is wide - and the
        // extractor would then see either 4 open ends (clipped ring) or 0
        // (engulfed stub).
        var q1 = { x: cx - 40, y: cy + 25 };  var b1 = addAtom('C', q1.x, q1.y);
        var q0 = { x: q1.x - BOND_LEN, y: q1.y }; var stubC = addAtom('C', q0.x, q0.y);
        var q2 = zigzagPos(q1, 30); var b2 = addAtom('C', q2.x, q2.y);
        var q3 = { x: q2.x + BOND_LEN, y: q2.y }; var stubD = addAtom('C', q3.x, q3.y);
        addBond(stubC.id, b1.id, 1);
        addBond(b1.id, b2.id, 1);
        addBond(b2.id, stubD.id, 1);
        // Phenyl hangs straight down from b2; the wider backbone stubs above
        // give it room to fit inside the bracket.
        var psAngle = Math.PI / 2;
        var ringPositions = ringVertexPositions(b2, psAngle, 6);
        var ringR = BOND_LEN * 0.72;
        var ringIpso = { x: b2.x + BOND_LEN * Math.cos(psAngle), y: b2.y + BOND_LEN * Math.sin(psAngle) };
        var psRingCenter = { x: ringIpso.x + ringR * Math.cos(psAngle), y: ringIpso.y + ringR * Math.sin(psAngle) };
        var ids = ringPositions.map(function (p) { return addAtom('C', p.x, p.y).id; });
        addBond(b2.id, ids[0], 1);
        for (var j = 0; j < 6; j++) addBond(ids[j], ids[(j + 1) % 6], j % 2 === 0 ? 2 : 1, psRingCenter);
        var ringXs = ringPositions.map(function (p) { return p.x; });
        var ringYs = ringPositions.map(function (p) { return p.y; });
        // Bracket has to enclose both backbone carbons AND every phenyl atom
        // without touching stubC or stubD. With phenyl at 120 degrees the ring
        // extends further left than b1 and further right than b2 by different
        // amounts, so anchor to the actual atom positions rather than to b1/b2
        // alone - the earlier "b1.x - 20, b2.x + 20" clipped the ring on the
        // right and the extractor saw four open ends instead of two. The 8 px
        // margin sits inside the stub margins (stubs are BOND_LEN * cos(30)
        // = 36 px past b1/b2, so an 8 px ring margin leaves 28 px of clear
        // canvas between the bracket and the stub, plus the stub's own R).
        brackets = [{
          x1: Math.min(b1.x, Math.min.apply(null, ringXs)) - 8,
          x2: Math.max(b2.x, Math.max.apply(null, ringXs)) + 8,
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
        // name search and the copolymer component matcher use them). A
        // bottlebrush is the exception - it does have one drawable unit, with the
        // side chain nested inside it - so what disqualifies an entry is having
        // no structure, not being a copolymer.
        if (!p.atoms || !p.atoms.length) {
          p._hash = null; p._chash = null; p._bhash = null; p._profile = {};
          return p;
        }
        var fp = SEARCH_INDEX && SEARCH_INDEX.fingerprints[p.name];
        if (fp) { p._hash = fp.hash; p._profile = fp.profile; }
        else { p._hash = wlHash(p.atoms, p.bonds); p._profile = elementProfile(p.atoms); }
        // Framing-invariant key: hash of the closed (cyclic-quotient) graph.
        // An index built before this field existed simply lacks it, so compute
        // on demand rather than trusting fp.chash to be present.
        p._chash = (fp && fp.chash != null) ? fp.chash : closedHash(p.atoms, p.bonds);
        // Stereo-blind key, same reasoning: an older index simply lacks it.
        p._bhash = (fp && fp.bhash != null) ? fp.bhash : blindHash(p.atoms, p.bonds);
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
          if (!res.smiles && !res.repeat_unit) {
            note("No structure could be read. " + (res.reason || "Try a sharper, closer photo."));
            return;
          }
          // An end-capped oligomer - brackets plus real end groups, like an
          // amine-terminated polyether - is not a repeat unit and is not a
          // plain molecule. The canvas can only search a repeat unit, so load
          // the backbone and say plainly that the ends were set aside, rather
          // than loading a structure that silently drops them.
          var telechelic = res.kind === "telechelic" && res.repeat_unit;
          var toLoad = telechelic ? res.repeat_unit : res.smiles;
          var smilesInput = document.getElementById("mol-smiles-input");
          var loadBtn = document.getElementById("mol-smiles-load");
          if (smilesInput && loadBtn && toLoad) {
            smilesInput.value = toLoad;
            loadBtn.click();
          }
          if (telechelic) {
            note("Read with " + (res.confidence || "unknown") + " confidence as an end-capped oligomer" +
              (res.repeat_count ? " (" + res.repeat_count + ")" : "") + ", not a plain repeat unit. " +
              "The canvas holds the repeating backbone, which is what a structure search can match; " +
              "the end groups" + (res.end_groups ? " (" + res.end_groups + ")" : "") +
              " are real chemistry and are NOT part of the search." +
              (res.smiles ? " Whole molecule as read: " + res.smiles : "") +
              " Check the drawing against your original first.");
            return;
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
