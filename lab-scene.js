// An 8-bit chemistry lab, drawn to a canvas.
//
// This started life inside the game, where it fills the strips either side of
// the maze. The home page wanted the same scene as a full-bleed banner, so it
// moved out here rather than being copied: one renderer, two mountings.
//
// What a caller supplies is where the rooms go and what colour the chemistry
// glows. Everything else - the fume hood, the reflux, the chemist and the
// eight acts of his synthesis - is the same in both places.
//
//   var lab = PolyLab.create(canvas, {
//     tint:  function () { return ["#5b83e6", "#2a53c4"]; },   // [highlight, face]
//     bands: function (w, h) { return [{ x0: 0, x1: w }]; },   // null for none
//     autoStory: true          // advance the synthesis on a timer with no game
//   });
//   lab.start();  lab.signal("progress", 0.4);  lab.stop();
//
// The scene never reads anything outside itself: the game pushes its state in
// through signal(), and nothing here writes back.
(function () {
  "use strict";

  function create(canvas, opts) {
    if (!canvas || !canvas.getContext) return null;
    opts = opts || {};
    if (!opts.tint) opts.tint = function () { return ["#5b83e6", "#2a53c4"]; };
    if (!opts.bands) opts.bands = function (w) { return [{ x0: 0, x1: w }]; };

  // --- Ambient layer: an 8-bit chemistry lab behind the board ---------------
  //
  // The strips either side of the maze are a synthetic chemistry lab drawn on a
  // pixel grid, so it belongs to the same visual world as the board. It is
  // modelled on a real bench: a fume hood with a sliding sash, a reflux setup
  // clamped to a lattice rod over a stirrer-hotplate, a reagent shelf, and a
  // chemist working in front of them.
  //
  // What he is doing is not decoration on a timer. The maze is a polymerisation
  // - every bead is a repeat unit added to the chain - so the chemist runs the
  // same polymerisation on the bench, and the player's progress through the
  // level is what moves him through it: weigh out, charge, purge, initiate,
  // reflux, pull an aliquot, precipitate, filter. Finish the level and he jars
  // the product and puts it on the shelf, so a full run leaves a shelf of every
  // polymer the player has made. Clear all 25 and he pulls a fibre from the
  // melt and holds the finished material up.
  //
  // Proportions are what makes a scene like this read. The worktop sits at hip
  // height on the figure and his head clears it, which is why the deck and
  // floor lines are pinned to the sprite's height rather than to fractions of
  // the canvas.
  //
  // Everything static - walls, cabinets, shelf, bottles - is rendered once into
  // an offscreen canvas when the size changes. Only what actually moves is
  // drawn per frame.
  //
  // It runs on its own rAF loop, independent of the game tick, and pauses with
  // the game.
  var ambient = canvas;
  var actx = ambient ? ambient.getContext("2d") : null;
  var rooms = [], ambientFrame = null, lastAmbientT = 0;

  var PXL = 5;                        // one pixel block
  function snap(v) { return Math.round(v / PXL) * PXL; }

  function ambientPalette() { return opts.tint(); }

  // Where the rooms go. The game measures the gaps either side of its board;
  // the home page hands over one wide strip for a full-bleed banner.
  function marginBands(w) { return opts.bands(w, ambient.height); }

  // --- The story ------------------------------------------------------------
  //
  // The one channel between the game and the lab, and it runs one way only:
  // the game calls labSignal, the lab reads labStory. Nothing in here ever
  // writes back, so the scene can never affect play.
  //
  // The acts are a real solution polymerisation in the order you would actually
  // do it. Weighing before charging, purging before initiating and sampling
  // before working up are not arbitrary: get the order wrong and any chemist
  // watching would notice immediately.
  var ACTS = [
    // wait: acts where the apparatus is doing the work and you are just
    // watching a clock. Those are the only ones he leaves, because those are
    // the only ones you can leave.
    { key: "weigh", at: "bench" },              // monomer onto the balance
    { key: "charge", at: "hood" },              // into the flask through a funnel
    { key: "purge", at: "hood", wait: true },   // nitrogen line on, oxygen out
    { key: "initiate", at: "hood" },            // initiator in by syringe
    { key: "reflux", at: "hood", wait: true },  // the polymerisation itself
    { key: "sample", at: "bench" },             // aliquot pulled to follow conversion
    { key: "precip", at: "hood" },              // cannula into methanol, polymer drops out
    { key: "isolate", at: "bench" }             // filter, dry, jar it
  ];

  // The banner has room for the rest of the day, and bays to do it in. Setting
  // the reaction up and running it is only the first half of the work; the half
  // that actually takes the time is finding out whether it worked and getting
  // the product clean. Same order any chemist would run it in.
  var ACTS_FULL = [
    { key: "weigh", at: "bench" },              // set up: mass out the monomer
    { key: "charge", at: "hood" },              // set up: charge the flask
    { key: "purge", at: "hood", wait: true },   // set up: oxygen out
    { key: "initiate", at: "hood" },            // start it
    { key: "reflux", at: "hood", wait: true },  // run it
    { key: "sample", at: "bench" },             // pull an aliquot
    { key: "tlc", at: "bench" },                // get a result: has it gone?
    { key: "quench", at: "hood" },              // work-up: kill the reaction
    { key: "extract", at: "bench" },            // work-up: separate the layers
    { key: "rotovap", at: "rotovap" },          // work-up: take the solvent off
    { key: "column", at: "prep" },              // purify: flash column
    { key: "analyse", at: "instrument" },       // get results: run it on the GPC
    { key: "isolate", at: "bench" },            // filter and dry the solid
    { key: "product", at: "bench" }             // the molecule, in a vial, held up
  ];
  function actList() { return opts.variety ? ACTS_FULL : ACTS; }

  var labStory = {
    act: 0, sub: 0,        // which act, and how far through it
    shelf: [],             // one jar per level completed: {tint}
    finale: false, finaleT: 0,
    alarm: 0,              // seconds of red hood alarm left after a termination
    spill: 0,              // seconds of spilled reaction left on the deck
    heat: false,
    playing: false
  };

  function labSignal(kind, data) {
    if (kind === "progress") {
      // Conversion drives the bench work, so the chemist is always exactly as
      // far through the synthesis as the player is through the level.
      var p = Math.max(0, Math.min(0.9999, data)) * actList().length;
      labStory.act = Math.floor(p);
      labStory.sub = p - labStory.act;
      labStory.playing = true;
    } else if (kind === "level") {
      labStory.act = 0; labStory.sub = 0;
      labStory.finale = false; labStory.finaleT = 0;
      labStory.playing = true;
    } else if (kind === "levelDone") {
      // The product goes in a jar in that level's own colour, so the shelf ends
      // up being a record of the run.
      labStory.act = actList().length - 1; labStory.sub = 1;
      labStory.shelf.push({ tint: (data && data.tint) || ambientPalette()[0] });
    } else if (kind === "won") {
      labStory.finale = true; labStory.finaleT = 0;
    } else if (kind === "reset") {
      labStory.shelf = []; labStory.act = 0; labStory.sub = 0;
      labStory.finale = false; labStory.finaleT = 0;
      labStory.alarm = 0; labStory.spill = 0;
    } else if (kind === "terminated") {
      labStory.alarm = 5; labStory.spill = 7;
    } else if (kind === "heat") {
      labStory.heat = !!data;
    } else if (kind === "idle") {
      labStory.playing = false;
    }
  }

  var LAB = {
    k: "#12161f",   // outline, deep frame
    d: "#1e2430",   // cabinet body
    D: "#161b25",   // cabinet shadow
    w: "#a8b3c4",   // hood frame, light metal
    W: "#dbe3ee",   // highlight
    p: "#7d8798",   // metal
    P: "#525b6a",   // metal shadow
    b: "#0a0e18",   // hood interior
    c: "#eef2f8",   // lab coat
    C: "#c0c8d6",   // coat shadow
    s: "#d9a06a",   // skin
    h: "#3a2a1d",   // hair
    g: "#9fe8ff",   // glass, goggles
    t: "#2b3140",   // trousers
    m: "#7fd8ff",   // gloved hand
    y: "#f2c14b",   // safety yellow
    r: "#e2604f",   // hot plate, red LED
    n: "#5fdc8a",   // green LED
    o: "#8a5f34"    // amber reagent bottle
  };

  // The chemist, side on. Two walk frames, two working frames, a reach for the
  // fibre pull and a two-handed pose for holding the finished material up.
  var CHEM = {
    walkA: [
      "....hhhh...",
      "...hhhhhh..",
      "...hssssg..",
      "...hssssg..",
      "....ssss...",
      "....ss.....",
      "...ccccc...",
      "..Cccccccc.",
      "..Cccccccs.",
      "..Ccccccc..",
      "..Ccccccc..",
      "..CCCCCCC..",
      "...CCCCC...",
      "...tttt....",
      "...tt.tt...",
      "...tt.tt...",
      "..kkk.kkk.."
    ],
    walkB: [
      "....hhhh...",
      "...hhhhhh..",
      "...hssssg..",
      "...hssssg..",
      "....ssss...",
      "....ss.....",
      "...ccccc...",
      ".cCcccccc..",
      "sCccccccc..",
      "..Ccccccc..",
      "..Ccccccc..",
      "..CCCCCCC..",
      "...CCCCC...",
      "...tttt....",
      "..tt...tt..",
      ".tt.....tt.",
      "kkk.....kkk"
    ],
    workA: [
      "....hhhh...",
      "...hhhhhh..",
      "...hssssg..",
      "...hssssg..",
      "....ssss...",
      "....ss.....",
      "...ccccc...",
      "..Ccccccccm",
      "..Ccccccc..",
      "..Ccccccc..",
      "..Ccccccc..",
      "..CCCCCCC..",
      "...CCCCC...",
      "...tttt....",
      "...tt.tt...",
      "...tt.tt...",
      "..kkk.kkk.."
    ],
    workB: [
      "....hhhh...",
      "...hhhhhh..",
      "...hssssg..",
      "...hssssg..",
      "....ssss...",
      "....ss.....",
      "...ccccc...",
      "..Ccccccc..",
      "..Ccccccccm",
      "..Ccccccc.m",
      "..Ccccccc..",
      "..CCCCCCC..",
      "...CCCCC...",
      "...tttt....",
      "...tt.tt...",
      "...tt.tt...",
      "..kkk.kkk.."
    ],
    // Two rows taller than the rest, so the raised hand clears his head and
    // reaches the flask neck. Sprites are anchored on their bottom row, which
    // is what lets a frame be a different height without his feet moving.
    reach: [
      "..........m",
      "..........c",
      "....hhhh..c",
      "...hhhhhh.c",
      "...hssssg.c",
      "...hssssg.c",
      "....ssss..c",
      "....ss....c",
      "..Ccccccccc",
      "..Ccccccc..",
      "..Ccccccc..",
      "..Ccccccc..",
      "..Ccccccc..",
      "..CCCCCCC..",
      "...CCCCC...",
      "...tttt....",
      "...tt.tt...",
      "...tt.tt...",
      "..kkk.kkk.."
    ],
    // Five rows taller than the rest so the finished material is held clear
    // above his head instead of merging into his hair. The sample gets a
    // highlight pixel because some level palettes are nearly black, and the
    // one thing this frame exists to show is the material.
    present: [
      "....TTT....",
      "...TWTTT...",
      "...TTTTT...",
      "..mTTTTTm..",
      "..c.....c..",
      "..cchhhcc..",
      "..chhhhhc..",
      "..chsssgc..",
      "..chsssgc..",
      "...csssc...",
      "....ss.....",
      "..ccccccc..",
      ".ccccccccc.",
      ".ccccccccc.",
      ".ccccccccc.",
      ".ccccccccc.",
      ".CCCCCCCCC.",
      "..CCCCCCC..",
      "...tttt....",
      "...tt.tt...",
      "...tt.tt...",
      "..kkk.kkk.."
    ]
  };
  var CHEM_W = 11, CHEM_H = 17;

  function fill(ctx, x, y, w, h, col, alpha) {
    ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    ctx.fillStyle = col;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  // Character grids are how this art was actually authored on the machines
  // being imitated, and they are far easier to read and correct than a list of
  // fill calls. "." is transparent, "T" takes the level tint.
  function sprite(ctx, grid, x, y, alpha, flip, tint) {
    for (var r = 0; r < grid.length; r++) {
      var row = grid[r];
      for (var c = 0; c < row.length; c++) {
        var ch = row.charAt(flip ? row.length - 1 - c : c);
        if (ch === ".") continue;
        var col = ch === "T" ? tint : LAB[ch];
        if (!col) continue;
        fill(ctx, x + c * PXL, y + r * PXL, PXL, PXL, col, alpha);
      }
    }
  }

  // --- Room construction ----------------------------------------------------

  // Every proportion in a room - how wide the hood is against the bench, how
  // far the chemist walks - was tuned against the ~250px strips beside the
  // game board. Handed one 1265px band for a banner, the same code stretched a
  // 120px fume hood across a 1100px bench and gave the chemist a 22-second walk.
  // A wide band is therefore divided into bays of about that tuned width, which
  // is also what a real lab looks like: a row of hoods, not one enormous one.
  var BAY_MAX = 340, BAY_TARGET = 270;
  function splitBands(bands) {
    var out = [];
    bands.forEach(function (b) {
      var w = b.x1 - b.x0;
      if (w <= BAY_MAX) { out.push(b); return; }
      var n = Math.max(2, Math.round(w / BAY_TARGET));
      var step = w / n;
      for (var i = 0; i < n; i++) {
        out.push({ x0: b.x0 + i * step, x1: b.x0 + (i + 1) * step });
      }
    });
    return out;
  }

  // A banner wide enough for five bays showed up the limit of two kinds of
  // room: one synthesis bay and four identical copies of the other, which
  // reads as wallpaper. With variety on, each bay past the first is a
  // different corner of the same lab. It is opt-in because the game only ever
  // has two bays and its pair is already tuned; this is for the banner.
  // Ordered by how much work happens at them, because a narrow banner gets
  // fewer bays and takes them from the front: at four bays there is no room
  // for the store cupboard, and losing that costs the scene nothing, whereas
  // losing the chromatograph would leave an act with nowhere to go.
  var VARIETY_KINDS = ["instrument", "rotovap", "prep", "storage"];
  function hasHood(kind) { return kind === "synth" || kind === "analysis"; }

  function buildAmbient(w, h) {
    rooms = [];
    var bands = marginBands(w);
    if (!bands || !bands.length) return;
    bands = splitBands(bands);
    // The widest bay gets the chemist. Kinds are assigned by position rather
    // than by that width sort, so equal-width bays cannot swap identities
    // between rebuilds and make the banner flicker on a resize.
    var widest = 0;
    for (var k = 1; k < bands.length; k++) {
      if (bands[k].x1 - bands[k].x0 > bands[widest].x1 - bands[widest].x0) widest = k;
    }
    for (var i = 0; i < bands.length; i++) {
      // Counted over the non-synthesis bays rather than over all of them, so
      // the list is taken from the front however the synthesis bay falls.
      var kind = i === widest ? "synth"
        : opts.variety ? VARIETY_KINDS[(i > widest ? i - 1 : i) % VARIETY_KINDS.length]
        : "analysis";
      var room = makeRoom(bands[i], h, kind, i);
      if (room) rooms.push(room);
    }

    // With variety on he works the whole banner rather than one bay, so the
    // stations are pooled: his own hood and bench, plus one in front of each
    // fixture. The game keeps its two, which is why this is behind the flag -
    // there, walking out of his own bay would mean walking across the maze.
    if (!opts.variety) return;
    var home = null;
    rooms.forEach(function (r) { if (r.chem) home = r; });
    if (!home) return;
    var pooled = { hood: home.stations.hood, bench: home.stations.bench };
    rooms.forEach(function (r) {
      if (r === home || r.hood) return;
      // Standing just left of the fixture, facing it, so his working hand lands
      // on the thing rather than on the wall beside it.
      pooled[r.kind] = { workX: snap(r.block.x + r.block.w - PXL * 14), facing: 0 };
    });
    home.stations = pooled;
  }

  function makeRoom(band, h, kind, bayIndex) {
    var x0 = snap(band.x0), x1 = snap(band.x1), w = x1 - x0;
    var cells = Math.floor(w / PXL);
    if (cells < 20 || h < 220) return null;      // too narrow to read as a room

    // Deck at hip height on the figure, floor a little under half a figure
    // below it. Get this wrong and the chemist looks like a child at a counter.
    var floorY = snap(h - PXL * 12);
    var deckY = snap(floorY - PXL * 9);
    var room = {
      x0: x0, w: w, h: h, kind: kind, bay: bayIndex || 0,
      ceilY: snap(h * 0.03),
      deckY: deckY, floorY: floorY,
      bubbles: [], drops: [], puffs: [], flakes: [],
      react: 0, lastBubble: 0, lastFleck: 0,
      stations: {}, beakers: [], chem: null
    };

    // The hood is the anchor; the bench takes what is left, and is dropped
    // rather than squeezed if there is not room for it to read. Sized so the
    // bench keeps enough width to hold a stirrer and still leave the chemist
    // somewhere to stand: a hood that eats the band gives him no second station
    // and he never walks.
    // Every bay has a tall block at its left, whatever stands there: a fume
    // hood, an instrument stack, a drying oven, a solvent cabinet. Keeping the
    // footprint identical is what lets the bench, the aisle and the chemist's
    // two stations be worked out once for all of them.
    var blockCells = Math.min(24, Math.max(16, cells - 24));
    room.block = { x: x0 + PXL, w: blockCells * PXL, top: snap(h * 0.11) };
    if (hasHood(kind)) {
      room.hood = room.block;
      // The reflux setup sits at the right of the hood so the chemist, who works
      // from the left, never stands in front of the thing he is watching.
      room.hood.flaskX = room.hood.x + room.hood.w - PXL * 11;
      room.hood.rodX = room.hood.x + room.hood.w - PXL * 4;
    }

    // The analytical end keeps a clear column at the far edge for the safety
    // shower, which otherwise ends up planted through the reagent shelf.
    var rest = x0 + w - (room.block.x + room.block.w) - PXL * (kind === "analysis" ? 8 : 2);
    room.bench = rest >= PXL * 14
      ? { x: room.block.x + room.block.w + PXL * 2, w: snap(rest) }
      : null;
    if (room.bench) {
      // Leave the right-hand end of the bench clear: that is where the chemist
      // stands, and a stirrer plate under his feet would look wrong.
      var free = room.bench.w / PXL - 13;
      var nb = Math.max(1, Math.floor(free / 7));
      for (var b = 0; b < nb; b++) {
        room.beakers.push({ x: room.bench.x + PXL * (1 + b * 7), phase: b * 1.7, hot: b % 2 === 0 });
      }
    }

    // Where he stands to work each end of the room. facing 1 turns him to his
    // left, which is how he ends up looking at what he is holding.
    var span = CHEM_W * PXL;
    function place(x) { return Math.max(x0, Math.min(x0 + w - span, snap(x))); }
    room.stations.hood = {
      workX: place((room.hood ? room.hood.flaskX : room.block.x + room.block.w) - PXL * 11),
      facing: 0
    };
    // The bench end is placed at the far end of the aisle whether or not there
    // turned out to be room for a bench to work at, because two stations is
    // what makes him a person working a lab rather than an ornament.
    var far = place(room.bench ? room.bench.x + room.bench.w - span - PXL : x0 + w - span);
    room.stations.bench = Math.abs(far - room.stations.hood.workX) > PXL * 8
      ? { workX: far, facing: 1 }
      : room.stations.hood;

    if (kind === "synth") {
      room.chem = {
        x: room.stations.bench.workX, act: -1, state: "work",
        phase: 0, flip: true, lastPour: 0, wander: 0, at: "bench"
      };
    }
    room.statics = paintStatics(room);
    return room;
  }

  // Everything that never moves, rendered once.
  function paintStatics(room) {
    var cv = document.createElement("canvas");
    cv.width = room.w; cv.height = room.h;
    var g = cv.getContext("2d");
    var h = room.h, W = room.w;
    var floor = room.floorY;

    // Back wall, floor, and the skirting where they meet. Blocking in the tone
    // separation is what gives a flat pixel scene its depth.
    fill(g, 0, 0, W, floor, "#0d111b");
    fill(g, 0, floor, W, h - floor, "#151a28");
    fill(g, 0, floor, W, PXL, LAB.P);
    for (var tx = 0; tx < W; tx += PXL * 9) fill(g, tx, floor + PXL * 4, PXL * 7, PXL, "#101623");

    // Ceiling: a service duct and a fluorescent tube, which is what is over
    // your head in every one of those reference shots.
    fill(g, 0, room.ceilY, W, PXL * 3, LAB.P);
    for (var dx = 0; dx < W; dx += PXL * 3) fill(g, dx, room.ceilY, PXL, PXL * 3, LAB.p);
    fill(g, PXL * 2, room.ceilY + PXL * 5, W - PXL * 4, PXL, LAB.W, 0.8);
    fill(g, PXL * 2, room.ceilY + PXL * 6, W - PXL * 4, PXL, LAB.p, 0.45);

    if (room.hood) paintHood(g, room); else paintFixture(g, room);
    if (room.bench) paintBench(g, room);

    if (room.kind === "analysis") {
      // A yellow safety shower and eyewash: the one splash of colour in a real
      // lab, and the thing your eye lands on in every photograph of one.
      var sx = W - PXL * 4;
      fill(g, sx, room.ceilY + PXL * 3, PXL, room.deckY - room.ceilY - PXL * 3, LAB.y);
      fill(g, sx - PXL * 3, room.ceilY + PXL * 8, PXL * 7, PXL, LAB.y);
      fill(g, sx - PXL * 2, room.ceilY + PXL * 9, PXL * 5, PXL, LAB.y, 0.55);
      fill(g, sx - PXL * 4, room.ceilY + PXL * 10, PXL * 2, PXL * 5, LAB.y, 0.9);   // pull handle
    } else {
      paintWallDressing(g, room);
    }
    return cv;
  }

  // The bare wall above the bench is where a lab stops looking like a diagram.
  // Each bay gets a different thing hung on it, chosen by position so it is the
  // same every rebuild, and the ceiling and floor pick up their own variations.
  function paintWallDressing(g, room) {
    var W = room.w, top = room.ceilY, x = W - PXL * 6;
    switch (room.bay % 4) {
      case 0: {   // wall clock
        fill(g, x + PXL, top + PXL * 9, PXL * 4, PXL * 4, LAB.W, 0.55);
        fill(g, x + PXL * 2, top + PXL * 10, PXL * 2, PXL * 2, LAB.k, 0.9);
        break;
      }
      case 1: {   // whiteboard, scrawled on the way every lab whiteboard is
        fill(g, x - PXL * 6, top + PXL * 8, PXL * 12, PXL * 7, LAB.W, 0.5);
        fill(g, x - PXL * 6, top + PXL * 14, PXL * 12, PXL, LAB.P, 0.7);   // pen tray
        for (var r = 0; r < 3; r++) {
          fill(g, x - PXL * 5, top + PXL * (10 + r * 2), PXL * (4 + r * 3), PXL, LAB.k, 0.45);
        }
        break;
      }
      case 2: {   // fire extinguisher on its bracket
        fill(g, x + PXL, top + PXL * 9, PXL * 3, PXL * 7, LAB.r, 0.85);
        fill(g, x + PXL * 2, top + PXL * 8, PXL, PXL, LAB.P);
        fill(g, x, top + PXL * 11, PXL * 5, PXL, LAB.k, 0.6);
        break;
      }
      default: {  // hazard placard
        fill(g, x, top + PXL * 9, PXL * 5, PXL * 5, LAB.y, 0.75);
        fill(g, x + PXL, top + PXL * 10, PXL * 3, PXL * 3, LAB.k, 0.55);
        break;
      }
    }
    // A sprinkler head on alternate bays, and a floor drain on one in three.
    if (room.bay % 2 === 1) {
      fill(g, PXL * 6, room.ceilY + PXL * 3, PXL, PXL * 2, LAB.p);
      fill(g, PXL * 5, room.ceilY + PXL * 5, PXL * 3, PXL, LAB.w, 0.8);
    }
    if (room.bay % 3 === 2) {
      var dy = room.floorY + PXL * 6;
      fill(g, PXL * 8, dy, PXL * 5, PXL * 2, "#0b0f18");
      fill(g, PXL * 9, dy, PXL, PXL * 2, LAB.P, 0.7);
      fill(g, PXL * 11, dy, PXL, PXL * 2, LAB.P, 0.7);
    }
  }

  // --- The other corners of the lab ----------------------------------------
  //
  // Each of these fills the same block a fume hood would, so the bench, the
  // aisle and the chemist's stations do not have to know which one it is. They
  // are drawn from the same 5px grid and the same palette; what makes them read
  // as different rooms is silhouette, not colour.
  function paintFixture(g, room) {
    var B = room.block, x = B.x - room.x0, w = B.w, top = B.top;
    var deck = room.deckY, floor = room.floorY;

    // Base cabinet and worktop, common to all of them - the thing standing on
    // the bench changes, the bench does not.
    fill(g, x, deck - PXL, w, PXL * 2, LAB.k);
    fill(g, x, deck, w, PXL, LAB.P);
    fill(g, x, deck + PXL, w, floor - deck - PXL, LAB.d);
    fill(g, x, deck + PXL, PXL, floor - deck - PXL, LAB.D);

    if (room.kind === "instrument") paintInstrument(g, room, x, w, top, deck);
    else if (room.kind === "prep") paintPrep(g, room, x, w, top, deck);
    else if (room.kind === "rotovap") paintRotovap(g, room, x, w, top, deck);
    else paintStorage(g, room, x, w, top, deck, floor);
  }

  // A stacked chromatograph: pump, column oven, detector, and a screen. The
  // giveaway is the autosampler carousel on top, which nothing else in a lab
  // looks like.
  function paintInstrument(g, room, x, w, top, deck) {
    var y = deck - PXL * 16;
    room.fx = { screenX: x + PXL * 2, screenY: y + PXL * 2, vialY: y - PXL * 3 };
    fill(g, x + PXL, y, w - PXL * 3, PXL * 16, LAB.w);                 // stack body
    fill(g, x + PXL, y, PXL, PXL * 16, LAB.W, 0.5);                    // near edge
    for (var m = 0; m < 4; m++) {                                       // module seams
      fill(g, x + PXL, y + PXL * (4 + m * 4), w - PXL * 3, PXL, LAB.P);
    }
    fill(g, x + PXL * 2, y + PXL * 2, PXL * 8, PXL * 2, LAB.k);        // screen recess
    for (var i = 0; i < 3; i++) {                                       // module handles
      fill(g, x + w - PXL * 5, y + PXL * (6 + i * 4), PXL * 2, PXL, LAB.P);
    }
    // Autosampler: a carousel of vials on the top plate.
    fill(g, x + PXL * 2, y - PXL * 2, w - PXL * 5, PXL * 2, LAB.p);
    for (var v = 0; v < 5; v++) {
      fill(g, x + PXL * (3 + v * 2), y - PXL * 3, PXL, PXL, LAB.g, 0.6);
    }
  }

  // A drying oven with a glass door and a rack of upturned glassware above it:
  // the corner of the lab where everything is either too hot to touch or
  // waiting to be put away.
  function paintPrep(g, room, x, w, top, deck) {
    var oy = deck - PXL * 11;
    room.fx = { ovenX: x + PXL * 3, ovenY: oy + PXL * 2 };
    fill(g, x + PXL, oy, w - PXL * 3, PXL * 11, LAB.w);                // oven body
    fill(g, x + PXL * 2, oy + PXL * 2, w - PXL * 7, PXL * 7, LAB.b);   // door glass
    fill(g, x + PXL * 2, oy + PXL * 2, w - PXL * 7, PXL, LAB.g, 0.25);
    fill(g, x + w - PXL * 4, oy + PXL * 3, PXL, PXL * 5, LAB.P);       // hinge side
    fill(g, x + PXL * 2, oy, PXL * 4, PXL * 2, LAB.k);                 // control panel
    // Trays of glassware behind the door.
    for (var s = 0; s < 2; s++) {
      fill(g, x + PXL * 3, oy + PXL * (5 + s * 3), w - PXL * 9, PXL, LAB.p, 0.8);
      for (var q = 0; q < 3; q++) {
        fill(g, x + PXL * (3 + q * 3), oy + PXL * (3 + s * 3), PXL * 2, PXL * 2, LAB.g, 0.35);
      }
    }
    // Draining rack above: flasks hung upside down on pegs.
    var ry = top + PXL * 4;
    fill(g, x + PXL, ry + PXL * 5, w - PXL * 3, PXL, LAB.p);
    for (var f = 0; f * PXL * 5 < w - PXL * 5; f++) {
      var fx = x + PXL * (2 + f * 5);
      fill(g, fx, ry + PXL * 2, PXL * 3, PXL * 3, LAB.g, 0.3);
      fill(g, fx, ry + PXL * 2, PXL, PXL * 3, LAB.W, 0.25);
      fill(g, fx + PXL, ry, PXL, PXL * 2, LAB.g, 0.35);
    }
  }

  // A rotary evaporator. The flask half-sunk in its bath is the one silhouette
  // every chemist recognises from across a room.
  function paintRotovap(g, room, x, w, top, deck) {
    var cx = x + PXL * 4;
    room.fx = { flaskX: cx, flaskY: deck - PXL * 6, bathX: cx - PXL, bathY: deck - PXL * 4,
                condX: x + PXL * 11, condY: deck - PXL * 17 };
    // Stand and motor head.
    fill(g, x + w - PXL * 5, deck - PXL * 20, PXL, PXL * 20, LAB.p);
    fill(g, x + PXL * 9, deck - PXL * 20, w - PXL * 13, PXL * 3, LAB.w);
    // Condenser: a slanted coil column running down to the receiving flask.
    for (var i = 0; i < 8; i++) {
      fill(g, x + PXL * (11 + i), deck - PXL * (17 - i), PXL * 2, PXL, LAB.g, 0.45);
    }
    fill(g, x + PXL * 10, deck - PXL * 18, PXL * 3, PXL * 2, LAB.p);
    // Water bath, with its own little control panel.
    fill(g, cx - PXL * 2, deck - PXL * 4, PXL * 8, PXL * 4, LAB.w);
    fill(g, cx - PXL * 2, deck - PXL, PXL * 8, PXL, LAB.P);
    fill(g, cx + PXL * 4, deck - PXL * 3, PXL * 2, PXL, LAB.k);
  }

  // Flammables cabinet and the gas cylinders, strapped upright because a loose
  // cylinder is the one thing everybody is taught to be frightened of.
  function paintStorage(g, room, x, w, top, deck, floor) {
    var cy = deck - PXL * 15;
    room.fx = { gaugeX: x + w - PXL * 6, gaugeY: cy + PXL * 2 };
    fill(g, x + PXL, cy, w - PXL * 9, PXL * 15, LAB.y, 0.55);          // cabinet
    fill(g, x + PXL, cy, w - PXL * 9, PXL, LAB.y, 0.85);
    fill(g, x + (w - PXL * 8) / 2, cy, PXL, PXL * 15, LAB.k, 0.5);     // door split
    fill(g, x + (w - PXL * 8) / 2 - PXL * 2, cy + PXL * 7, PXL, PXL * 2, LAB.k, 0.7);
    fill(g, x + (w - PXL * 8) / 2 + PXL * 2, cy + PXL * 7, PXL, PXL * 2, LAB.k, 0.7);
    fill(g, x + PXL * 3, cy + PXL * 2, PXL * 4, PXL * 4, LAB.k, 0.45); // hazard diamond
    // Two cylinders beside it, with a restraining strap across both.
    for (var c = 0; c < 2; c++) {
      var gx = x + w - PXL * (7 - c * 3);
      fill(g, gx, deck - PXL * 18, PXL * 2, PXL * 18, c ? "#4a5a6a" : "#6a5a4a");
      fill(g, gx, deck - PXL * 18, PXL, PXL * 18, LAB.W, 0.18);
      fill(g, gx, deck - PXL * 20, PXL * 2, PXL * 2, LAB.p);           // valve
    }
    fill(g, x + w - PXL * 8, deck - PXL * 12, PXL * 8, PXL, LAB.r, 0.7);  // strap
  }

  // --- What moves on each of them ------------------------------------------

  // Spawn rates were written as a probability per frame, which makes them a
  // function of the frame rate rather than of time: what looked like a drip
  // while the tab was throttled came out as a torrent at 60fps. This gates on
  // the clock instead, so a pour is the same pour on any machine.
  function everyMs(room, key, ms) {
    var now = Date.now();
    if (!room._t) room._t = {};
    if (room._t[key] && now - room._t[key] < ms) return false;
    room._t[key] = now;
    return true;
  }
  function drawFixture(room, t, dt, tint, A) {
    var B = room.block, deck = room.deckY;
    var fx = room.fx || {};
    if (room.kind === "instrument") {
      // A chromatogram crawling across the screen, and the run light beside it.
      var sx = fx.screenX, sy = fx.screenY;
      for (var i = 0; i < 8; i++) {
        var ph = t * 0.7 + i * 0.8;
        var pk = Math.max(0, Math.sin(ph)) * Math.max(0, Math.sin(ph * 3.1));
        fill(actx, room.x0 + sx + PXL * i, sy + PXL - snap(pk * PXL), PXL, PXL, LAB.n, A * 0.9);
      }
      fill(actx, room.x0 + sx + PXL * 9, sy, PXL, PXL,
        (t * 1.1 % 1) < 0.55 ? LAB.n : LAB.k, A);
    } else if (room.kind === "prep") {
      // The oven's set-point display, and heat shimmering off the top of it.
      fill(actx, room.x0 + fx.ovenX, fx.ovenY - PXL * 2, PXL, PXL,
        (t * 0.8 % 1) < 0.5 ? LAB.r : LAB.k, A);
      if (everyMs(room, "ovenPuff", 420)) {
        room.puffs.push({ x: snap(room.x0 + fx.ovenX + PXL * (Math.random() * 5 | 0)),
                          y: fx.ovenY - PXL * 4, life: 0 });
      }
    } else if (room.kind === "rotovap") {
      // The flask turns. Drawing the liquid line at a rolling angle is enough:
      // a rotovap is recognised by the motion, not by the glass.
      var a = t * 1.6;
      var fxp = room.x0 + fx.flaskX, fyp = fx.flaskY;
      fill(actx, fxp, fyp, PXL * 4, PXL * 4, LAB.g, A * 0.4);
      fill(actx, fxp, fyp, PXL, PXL * 4, LAB.W, A * 0.25);
      var lift = snap(Math.sin(a) * PXL);
      fill(actx, fxp, fyp + PXL * 2 + lift, PXL * 4, PXL * 2 - lift, tint, A * 0.8);
      fill(actx, room.x0 + fx.bathX, fx.bathY + PXL, PXL * 6, PXL * 2, tint, A * 0.35);
      if (everyMs(room, "bathPuff", 320)) {
        room.puffs.push({ x: snap(room.x0 + fx.bathX + PXL * (Math.random() * 6 | 0)),
                          y: fx.bathY - PXL, life: 0 });
      }
    } else {
      // A regulator needle that twitches, which is the only thing that ever
      // moves in the corner where the cylinders live.
      fill(actx, room.x0 + fx.gaugeX, fx.gaugeY, PXL * 3, PXL * 3, LAB.w, A);
      fill(actx, room.x0 + fx.gaugeX + PXL + snap(Math.sin(t * 0.9) * PXL) * 0,
        fx.gaugeY + PXL, PXL, PXL, (t * 0.5 % 1) < 0.5 ? LAB.r : LAB.k, A);
    }

    // Vapour and steam rise the same way whatever produced them.
    for (var p = room.puffs.length - 1; p >= 0; p--) {
      var pf = room.puffs[p];
      pf.life += dt;
      if (pf.life > 1.8) { room.puffs.splice(p, 1); continue; }
      fill(actx, pf.x, snap(pf.y - pf.life * 30), PXL, PXL, LAB.W, A * 0.26 * (1 - pf.life / 1.8));
    }
  }

  function paintHood(g, room) {
    var H = room.hood, x = H.x - room.x0, w = H.w, top = H.top;
    var deck = room.deckY, floor = room.floorY;

    // A hood is not a box with a window. What makes one recognisable is the
    // parts that do the work: the baffle at the back that sets where the air is
    // pulled from, the airfoil along the sill that stops the vortex at the
    // opening, the deep side posts the sash runs in, and the services and
    // monitor on the face. Those are all here now; before this it was a carcass
    // and a pane of glass.
    fill(g, x, top, w, deck - top, LAB.k);                        // carcass
    fill(g, x + PXL, top + PXL, w - PXL * 2, deck - top - PXL * 2, LAB.b);  // interior
    fill(g, x, top, w, PXL * 3, LAB.w);                           // head rail
    fill(g, x, top + PXL * 3, w, PXL, LAB.P);
    fill(g, x, top + PXL, w, PXL, LAB.W, 0.35);                   // rail highlight

    // Deep side posts. The sash runs in these, so they read as structure
    // rather than as a painted border.
    fill(g, x, top, PXL * 2, deck - top, LAB.w);
    fill(g, x + PXL, top, PXL, deck - top, LAB.P, 0.55);
    fill(g, x + w - PXL * 2, top, PXL * 2, deck - top, LAB.w);
    fill(g, x + w - PXL * 2, top, PXL, deck - top, LAB.P, 0.55);

    // Interior light strip under the head rail, and the wash of it on the deck.
    fill(g, x + PXL * 3, top + PXL * 4, w - PXL * 6, PXL, LAB.W, 0.55);
    fill(g, x + PXL * 2, deck - PXL * 2, w - PXL * 4, PXL, LAB.W, 0.07);

    // Rear baffle: three slots and the panel they are cut in. This is the part
    // of a hood people forget, and the part that decides where the air goes.
    var bx = x + PXL * 3, bw2 = w - PXL * 6;
    fill(g, bx, top + PXL * 6, bw2, deck - top - PXL * 9, "#11172447");
    for (var s = 0; s < 3; s++) {
      var sy2 = top + PXL * (7 + s * 5);
      fill(g, bx, sy2, bw2, PXL, "#070a12");
      fill(g, bx, sy2 + PXL, bw2, PXL, LAB.P, 0.30);
    }
    fill(g, bx, deck - PXL * 4, bw2, PXL, "#070a12");             // bottom slot

    // Airfoil along the sill: the aerofoil section every modern hood has, with
    // the gap under it that keeps air moving across the worktop.
    fill(g, x + PXL * 2, deck - PXL * 2, w - PXL * 4, PXL, LAB.w);
    fill(g, x + PXL * 2, deck - PXL, w - PXL * 4, PXL, LAB.P);
    fill(g, x, deck - PXL, w, PXL * 2, LAB.k);                    // worktop lip
    fill(g, x, deck, w, PXL, LAB.P);

    // Exhaust duct off the top of the hood, up to the ceiling run.
    fill(g, x + w - PXL * 8, room.ceilY + PXL * 3, PXL * 4, top - room.ceilY - PXL * 3, LAB.p);
    fill(g, x + w - PXL * 8, room.ceilY + PXL * 3, PXL, top - room.ceilY - PXL * 3, LAB.P);
    for (var ry = room.ceilY + PXL * 5; ry < top - PXL; ry += PXL * 3) {
      fill(g, x + w - PXL * 8, ry, PXL * 4, PXL, LAB.P, 0.7);     // duct ribs
    }

    // Lattice rods: an upright bolted to the deck and a horizontal crossbar.
    var rod = H.rodX - room.x0;
    fill(g, rod, top + PXL * 5, PXL, deck - top - PXL * 6, LAB.p);
    fill(g, rod - PXL, deck - PXL * 2, PXL * 3, PXL, LAB.P);
    fill(g, x + PXL * 3, top + PXL * 8, w - PXL * 6, PXL, LAB.p, 0.75);

    // Spare glassware parked at the left of the deck, out of the chemist's way.
    // Glass against a black hood interior needs its near wall picking out in
    // white, or it reads as a hole rather than as a vessel.
    var sp = x + PXL * 2;
    fill(g, sp, deck - PXL * 5, PXL * 4, PXL * 4, LAB.g, 0.30);           // beaker
    fill(g, sp, deck - PXL * 5, PXL, PXL * 4, LAB.W, 0.30);
    fill(g, sp + PXL * 6, deck - PXL * 7, PXL, PXL * 6, LAB.W, 0.40);     // cylinder
    fill(g, sp + PXL * 5, deck - PXL, PXL * 3, PXL, LAB.g, 0.45);
    fill(g, sp + PXL * 10, deck - PXL * 4, PXL * 3, PXL * 3, LAB.o, 0.9); // solvent bottle
    fill(g, sp + PXL * 11, deck - PXL * 5, PXL, PXL, LAB.k);

    // Base cabinet with drawer pulls, and the colour-coded service taps.
    fill(g, x, deck + PXL, w, floor - deck - PXL, LAB.d);
    fill(g, x, deck + PXL, PXL, floor - deck - PXL, LAB.D);
    for (var dy = deck + PXL * 3; dy < floor - PXL * 2; dy += PXL * 4) {
      fill(g, x + PXL * 2, dy, w - PXL * 4, PXL, LAB.D);
      fill(g, x + w / 2 - PXL, dy, PXL * 2, PXL, LAB.p, 0.8);
    }
    // Service fixtures on the face, colour coded the way they always are:
    // yellow gas, green vacuum, blue water, each with its spigot inside.
    var tap = [LAB.y, LAB.n, LAB.g];
    for (var t = 0; t < 3; t++) {
      var ty = deck + PXL * (3 + t * 3);
      fill(g, x + PXL, ty, PXL * 3, PXL, tap[t], 0.95);            // handle
      fill(g, x + PXL * 2, ty - PXL, PXL, PXL, LAB.p, 0.9);        // stem
    }
    // Sockets on the other post, because every hood has too few of them.
    for (var so = 0; so < 2; so++) {
      fill(g, x + w - PXL * 5, deck + PXL * (3 + so * 3), PXL * 3, PXL * 2, LAB.W, 0.35);
      fill(g, x + w - PXL * 4, deck + PXL * (3 + so * 3), PXL, PXL, LAB.k, 0.8);
    }
  }

  function paintBench(g, room) {
    var B = room.bench, x = B.x - room.x0, w = B.w;
    var deck = room.deckY, floor = room.floorY;

    // Reagent shelf over the bench, stacked with amber bottles. The product
    // shelf below it is left empty here: what stands on it is the run so far,
    // so it has to be drawn live.
    var shelf = deck - PXL * 22;
    room.shelfY = shelf;
    room.prodY = deck - PXL * 14;
    fill(g, x, shelf, w, PXL, LAB.p);
    fill(g, x, shelf + PXL, w, PXL, LAB.P);
    for (var bx = x + PXL; bx < x + w - PXL * 3; bx += PXL * 4) {
      var bh = PXL * (3 + ((bx / PXL) % 3));
      fill(g, bx, shelf - bh, PXL * 3, bh, LAB.o);
      fill(g, bx, shelf - bh + PXL, PXL * 3, PXL, LAB.W, 0.32);   // label
      fill(g, bx + PXL, shelf - bh - PXL, PXL, PXL, LAB.k);       // cap
    }
    fill(g, x, room.prodY, w, PXL, LAB.p);
    fill(g, x, room.prodY + PXL, w, PXL, LAB.P);

    fill(g, x, deck - PXL, w, PXL * 2, LAB.k);                    // worktop
    fill(g, x, deck, w, PXL, LAB.P);
    fill(g, x, deck + PXL, w, floor - deck - PXL, LAB.d);
    for (var dy = deck + PXL * 4; dy < floor - PXL * 2; dy += PXL * 5) {
      fill(g, x + PXL, dy, w - PXL * 2, PXL, LAB.D);
    }

    // Stirrer-hotplates. The beaker and its contents are drawn live.
    for (var i = 0; i < room.beakers.length; i++) {
      var sx = room.beakers[i].x - room.x0;
      fill(g, sx - PXL, deck - PXL * 3, PXL * 6, PXL * 2, LAB.w);  // plate top
      fill(g, sx - PXL, deck - PXL, PXL * 6, PXL, LAB.P);          // body
    }
  }

  // --- Per-frame drawing ----------------------------------------------------

  function drawScene(w, h, dt) {
    var tint = ambientPalette()[0], t = Date.now() / 1000;
    if (labStory.finale) labStory.finaleT += dt;
    labStory.alarm = Math.max(0, labStory.alarm - dt);
    labStory.spill = Math.max(0, labStory.spill - dt);
    for (var i = 0; i < rooms.length; i++) drawRoom(rooms[i], t, dt, tint);
    // He is drawn after every bay, not inside his own. Once he can walk the
    // whole banner, drawing him during his own room means the next bay's
    // statics paint straight over him as he crosses into it.
    var home = null;
    for (var j = 0; j < rooms.length; j++) if (rooms[j].chem) home = rooms[j];
    if (home) {
      var act = actList()[labStory.act];
      actx.globalAlpha = 0.66;
      drawChemist(home, t, dt, tint, 0.66, act);
      drawHandWork(home, t, dt, tint, 0.66, act);
    }
    actx.globalAlpha = 1;
  }

  function drawRoom(room, t, dt, tint) {
    var A = 0.66;                       // background, not foreground
    var act = room.chem ? actList()[labStory.act] : null;
    actx.globalAlpha = A;
    actx.drawImage(room.statics, room.x0, 0);

    var H = room.hood;
    if (H) {
      // The sash. A real one is a glazed panel in a frame with vertical
      // mullions, running in the side posts, with a handle bar you pull it down
      // by - and the safe working height marked on the post beside it. He drops
      // it while a reaction runs and raises it to reach in.
      var open = (Math.sin(t * 0.26) * 0.5 + 0.5);
      if (act && (act.at === "hood")) open = 0.85;                 // reaching in
      else if (act && (act.key === "reflux" || act.key === "purge")) open = 0.15;
      var sash = snap(H.top + PXL * 4 + open * PXL * 7);
      var sx0 = H.x + PXL * 2, sw = H.w - PXL * 4;
      fill(actx, sx0, H.top + PXL * 4, sw, sash - H.top - PXL * 4, LAB.g, A * 0.13);
      for (var mu = 1; mu < 3; mu++) {                             // mullions
        fill(actx, sx0 + Math.round(sw * mu / 3), H.top + PXL * 4,
          PXL, sash - H.top - PXL * 4, LAB.w, A * 0.35);
      }
      fill(actx, sx0, sash, sw, PXL, LAB.w, A);                    // sash rail
      fill(actx, sx0, sash + PXL, sw, PXL, LAB.W, A * 0.5);        // handle bar
      fill(actx, sx0 + PXL * 2, sash + PXL, PXL * 3, PXL, LAB.P, A);
      // Safe-working-height mark on the post: green below it, amber above.
      var mark = snap(H.top + PXL * 9);
      fill(actx, H.x + PXL, mark, PXL, PXL, sash >= mark ? LAB.n : LAB.y, A);

      // Digital airflow monitor: a readout, a run light and a mute button.
      // Green normally; a terminated chain in the maze is a reaction lost on the
      // bench, so it goes to a red alarm for a few seconds.
      var alarmed = labStory.alarm > 0;
      var mx = H.x + H.w - PXL * 8, my = H.top + PXL * 5;
      fill(actx, mx, my, PXL * 6, PXL * 4, LAB.d, A);
      fill(actx, mx, my, PXL * 6, PXL, LAB.P, A * 0.8);
      fill(actx, mx + PXL, my + PXL, PXL * 3, PXL * 2, LAB.k, A);  // readout window
      for (var dg = 0; dg < 3; dg++) {                             // face-velocity digits
        fill(actx, mx + PXL * (1 + dg), my + PXL + (dg === (Math.floor(t * 2) % 3) ? PXL : 0),
          PXL, PXL, alarmed ? LAB.r : LAB.n, A * 0.9);
      }
      fill(actx, mx + PXL * 5, my + PXL, PXL, PXL,
        alarmed ? ((t * 5 % 1) < 0.5 ? LAB.r : LAB.k) : ((t * 1.4 % 1) < 0.7 ? LAB.n : LAB.k), A);
      fill(actx, mx + PXL * 5, my + PXL * 2, PXL, PXL, LAB.P, A);  // mute button

      drawReflux(room, t, dt, tint, A, act);
    } else {
      drawFixture(room, t, dt, tint, A);
    }
    if (room.beakers.length) drawBench(room, t, tint, A);
    if (room.bench) drawProductShelf(room, A);

    // Droplets in flight, and the reaction they set going when they land.
    for (var d = room.drops.length - 1; d >= 0; d--) {
      var dr = room.drops[d];
      dr.y += dr.vy * dt; dr.vy += 300 * dt;
      dr.x += (dr.vx || 0) * dt;
      fill(actx, snap(dr.x), snap(dr.y), PXL, PXL, dr.col || tint, A);
      if (dr.y >= dr.ty) {
        room.drops.splice(d, 1);
        room.react = Math.min(5, room.react + 2.4);
      }
    }
    // Precipitated solid, drifting down through the methanol.
    for (var f = room.flakes.length - 1; f >= 0; f--) {
      var fl = room.flakes[f];
      fl.life += dt;
      if (fl.life > fl.max) { room.flakes.splice(f, 1); continue; }
      fill(actx, fl.x, snap(fl.y + fl.life * 26), PXL, PXL, LAB.W, A * 0.8 * (1 - fl.life / fl.max));
    }
    actx.globalAlpha = 1;
  }

  // How full the flask is, in cells, given where the synthesis has got to. It
  // fills as he charges it and empties as he cannulates it out.
  function flaskFill(act) {
    // The finale needs a melt in the flask to draw the fibre out of, whatever
    // act the run happened to end on.
    if (labStory.finale) return labStory.finaleT < 9.4 ? 4 : 1;
    if (!act) return 3;
    switch (act.key) {
      case "weigh": return 0;
      case "charge": return Math.round(labStory.sub * 4);
      case "precip": return Math.round(4 * (1 - labStory.sub));
      case "isolate": return 0;
      default: return 4;
    }
  }

  function drawReflux(room, t, dt, tint, A, act) {
    var H = room.hood, deck = room.deckY;
    var fx = H.flaskX, base = deck - PXL * 2;
    room.react = Math.max(0, room.react - dt);
    var running = act
      ? (act.key === "initiate" || act.key === "reflux" || act.key === "sample")
      : true;
    var hot = running || labStory.heat || room.react > 0;

    // Heating mantle, with its element glowing while the reaction runs.
    fill(actx, fx - PXL, base - PXL * 2, PXL * 8, PXL * 2, LAB.w, A);
    fill(actx, fx - PXL, base, PXL * 8, PXL, LAB.P, A);
    fill(actx, fx + PXL * 5, base - PXL, PXL, PXL, hot ? LAB.r : LAB.n, A);
    if (hot) fill(actx, fx, base - PXL * 3, PXL * 6, PXL, LAB.r, A * 0.35);

    // Round-bottom flask, charged to whatever the synthesis says it holds.
    // The column is sized so the neck lands at the height of a raised hand:
    // apparatus he cannot reach would give the whole scene away.
    var fy = base - PXL * 6;
    fill(actx, fx + PXL, fy, PXL * 4, PXL * 4, LAB.g, A * 0.42);
    fill(actx, fx, fy + PXL, PXL * 6, PXL * 3, LAB.g, A * 0.42);
    fill(actx, fx, fy + PXL, PXL, PXL * 3, LAB.W, A * 0.30);            // rim highlight
    var lvl = PXL * flaskFill(act);
    if (lvl > 0) fill(actx, fx, fy + PXL * 4 - lvl, PXL * 6, lvl, tint, A * 0.85);
    fill(actx, fx + PXL * 2, fy - PXL * 2, PXL * 2, PXL * 2, LAB.g, A * 0.45);  // neck
    room.hood.neck = { x: fx + PXL * 2, y: fy - PXL * 2 };
    room.hood.pot = fy + PXL * 3;

    // Condenser above it: water jacket, hose stubs, clamped back to the rod.
    var cy = fy - PXL * 9;
    fill(actx, fx + PXL * 2, cy, PXL * 2, PXL * 7, LAB.g, A * 0.5);
    fill(actx, fx + PXL * 2, cy, PXL * 2, PXL, LAB.p, A);
    fill(actx, fx + PXL, cy + PXL * 5, PXL, PXL, LAB.p, A);            // water in
    fill(actx, fx + PXL * 4, cy + PXL, PXL, PXL, LAB.p, A);            // water out
    fill(actx, fx + PXL * 4, cy + PXL * 3, H.rodX - fx - PXL * 4, PXL, LAB.p, A * 0.9);
    fill(actx, fx + PXL * 4, base - PXL * 8, H.rodX - fx - PXL * 4, PXL, LAB.p, A * 0.9);

    // Condensate running back down the inside of the jacket: the visible sign
    // that a reflux is actually refluxing rather than just being hot.
    if (hot) {
      for (var q = 0; q < 2; q++) {
        var run = (t * 0.55 + q * 0.5) % 1;
        fill(actx, fx + PXL * (2 + q), snap(cy + PXL + run * PXL * 5), PXL, PXL, LAB.W, A * 0.35);
      }
    }

    // A nitrogen line dropped into the neck while he purges, and a bubbler on
    // the crossbar ticking over to prove the flow.
    if (act && (act.key === "purge" || act.key === "initiate" || act.key === "reflux")) {
      fill(actx, fx + PXL * 5, cy + PXL * 2, PXL, PXL * 6, LAB.p, A * 0.7);
      fill(actx, fx + PXL * 5, cy + PXL * 2, H.rodX - fx - PXL * 5, PXL, LAB.p, A * 0.7);
      fill(actx, H.rodX - PXL, cy - PXL * 2, PXL * 3, PXL * 4, LAB.g, A * 0.4);
      if ((t * 2.2 % 1) < 0.5) fill(actx, H.rodX, cy - PXL, PXL, PXL, LAB.W, A * 0.7);
    }

    // Bubbles: the reaction actually running, faster while it is hot.
    if (Date.now() - room.lastBubble > (hot ? 130 : 430)) {
      room.lastBubble = Date.now();
      if (lvl > 0) {
        room.bubbles.push({ x: snap(fx + PXL * (1 + Math.floor(Math.random() * 4))), y: fy + PXL * 3, life: 0 });
      }
    }
    for (var b = room.bubbles.length - 1; b >= 0; b--) {
      var bu = room.bubbles[b];
      bu.life += dt;
      if (bu.life > 2.4) { room.bubbles.splice(b, 1); continue; }
      fill(actx, bu.x, snap(bu.y - bu.life * 40), PXL, PXL, tint, A * (1 - bu.life / 2.4));
    }

    // Vapour drawn up the back of the hood, which is the whole point of it.
    if (hot && everyMs(room, "refluxPuff", 260)) {
      room.puffs.push({ x: snap(fx + PXL * (1 + Math.floor(Math.random() * 4))), y: cy - PXL, life: 0 });
    }
    for (var p = room.puffs.length - 1; p >= 0; p--) {
      var pf = room.puffs[p];
      pf.life += dt;
      if (pf.life > 1.8) { room.puffs.splice(p, 1); continue; }
      fill(actx, pf.x, snap(pf.y - pf.life * 34), PXL, PXL, LAB.W, A * 0.3 * (1 - pf.life / 1.8));
    }

    // The finale: a filament drawn up out of the melt. Pulling a fibre straight
    // from the flask is the oldest demonstration in polymer chemistry, and it
    // is the only way to show a material rather than a liquid.
    if (labStory.finale && room.chem) {
      var ft = labStory.finaleT;
      // Fades once he has it in his hands: a filament still anchored in the
      // flask while he holds the solid up would be two endings at once.
      var fade = ft < 9.4 ? 1 : Math.max(0, 1 - (ft - 9.4) / 1.6);
      if (ft > 2.4 && fade > 0) {
        var pull = Math.min(1, (ft - 2.4) / 5.5);
        var topY = snap(fy - PXL * 2 - pull * (fy - room.hood.top - PXL * 6));
        for (var yy = topY; yy < fy + PXL; yy += PXL) {
          fill(actx, fx + PXL * 2 + (((yy / PXL) % 2) ? PXL : 0), yy, PXL, PXL, tint, A * 0.95 * fade);
        }
      }
    }
  }

  function drawBench(room, t, tint, A) {
    var deck = room.deckY;
    for (var i = 0; i < room.beakers.length; i++) {
      var bk = room.beakers[i], x = bk.x, y = deck - PXL * 8;
      fill(actx, x, y, PXL * 4, PXL * 5, LAB.g, A * 0.38);              // beaker
      fill(actx, x, y, PXL, PXL * 5, LAB.W, A * 0.28);                 // near wall
      fill(actx, x - PXL, y, PXL, PXL, LAB.g, A * 0.5);                // spout
      // The level breathes with the stir vortex, so the bench is not a photo.
      var lvl = PXL * (2 + Math.round((Math.sin(t * 1.6 + bk.phase) + 1) * 0.5));
      fill(actx, x, y + PXL * 5 - lvl, PXL * 4, lvl, tint, A * 0.7);
      fill(actx, x, y + PXL * 5 - lvl, PXL * 4, PXL, LAB.W, A * 0.25);  // meniscus
      // Stirrer indicator on the plate, each running at its own rate.
      fill(actx, x + PXL * 3, deck - PXL * 2, PXL, PXL,
        ((t * (1.1 + i * 0.4)) % 1) < 0.5 ? (bk.hot ? LAB.r : LAB.n) : LAB.k, A);
    }
  }

  // One jar per level cleared, in that level's own colour. Wider bands hold
  // more; a full 25-level run overflows a narrow one, and the shelf then shows
  // the most recent jars rather than silently dropping the newest.
  function drawProductShelf(room, A) {
    var n = labStory.shelf.length;
    if (!n) return;
    var cap = Math.floor((room.bench.w - PXL * 2) / (PXL * 2));
    var from = Math.max(0, n - cap);
    for (var i = from; i < n; i++) {
      var x = room.bench.x + PXL + (i - from) * PXL * 2;
      var y = room.prodY - PXL * 3;
      fill(actx, x, y, PXL, PXL * 3, labStory.shelf[i].tint, A * 0.95);
      fill(actx, x, y, PXL, PXL, LAB.W, A * 0.5);                      // cap
    }
  }

  // --- The chemist ----------------------------------------------------------
  //
  // He is always walking to, or working at, whichever end of the room the
  // current act belongs to. The act comes from the player's conversion, so the
  // walking is not a loop on a timer: he crosses the aisle when the chemistry
  // says to.
  function drawChemist(room, t, dt, tint, A, act) {
    var c = room.chem;
    c.phase += dt;

    // The finale overrides everything: he goes to the flask, draws the fibre up
    // out of the melt, then holds the finished material up.
    if (labStory.finale) {
      var ft = labStory.finaleT, st = room.stations.hood;
      var grid;
      if (ft < 2.4) {
        var dxf = st.workX - c.x, stepf = 40 * dt;
        if (Math.abs(dxf) <= stepf) { c.x = st.workX; grid = CHEM.workA; }
        else { c.x += (dxf < 0 ? -stepf : stepf); c.flip = dxf < 0; grid = walkFrame(c); }
      } else if (ft < 9.4) {
        c.flip = false;
        grid = CHEM.reach;
      } else {
        c.flip = false;
        grid = CHEM.present;
      }
      drawFrame(room, grid, c, A, tint);
      return;
    }

    // A narrow banner may not have the bay an act asks for. Fall back to the
    // bench and remember that we did, so the apparatus still comes out - he
    // runs the GPC on the bench rather than standing there doing nothing.
    var want = act ? (room.stations[act.at] ? act.at : "bench") : "bench";
    c.want = want;
    // During a purge or a reflux the apparatus is doing the work, so he goes
    // and does something at the other end and comes back. He never leaves an
    // act he has his hands in - and the apparatus follows him, so wandering off
    // mid-weighing would carry the balance into the fume hood.
    c.wander -= dt;
    if (c.act !== labStory.act) {
      c.act = labStory.act; c.at = want; c.state = "walk"; c.wander = 10 + Math.random() * 8;
    } else if (c.wander <= 0) {
      var away = act && act.wait && c.at === want;
      c.at = away ? (want === "hood" ? "bench" : "hood") : want;
      c.state = "walk";
      c.wander = (away ? 5 : 10) + Math.random() * 6;
    }

    var station = room.stations[c.at] || room.stations.bench;
    if (c.state === "walk") {
      // About 1.1 m/s at this scale: he is crossing a lab, not strolling a
      // promenade, and anything slower reads as slow motion.
      var dx = station.workX - c.x, step = (opts.variety ? 82 : 55) * dt;
      if (Math.abs(dx) <= step) { c.x = station.workX; c.state = "work"; }
      else { c.x += (dx < 0 ? -step : step); c.flip = dx < 0; }
    } else {
      c.flip = station.facing === 1;
    }

    // Charging and initiating both go in through the neck, which is over head
    // height, so those two are the acts he reaches up for.
    c.reaching = !!(act && c.at === c.want && c.state === "work" &&
      (act.key === "charge" || act.key === "initiate"));
    var g = c.state === "walk" ? walkFrame(c)
      : c.reaching ? CHEM.reach
      : (Math.floor(c.phase * 2.2) % 2 ? CHEM.workB : CHEM.workA);
    drawFrame(room, g, c, A, tint);
  }

  // Anchored on the bottom row, so a taller frame raises the arm instead of
  // lifting him off the floor.
  function drawFrame(room, grid, c, A, tint) {
    sprite(actx, grid, snap(c.x), room.floorY - PXL * (grid.length - 1),
      Math.min(1, A + 0.22), c.flip, tint);
  }

  function walkFrame(c) { return Math.floor(c.phase * 4.5) % 2 ? CHEM.walkB : CHEM.walkA; }

  // Where his working hand is. The sprite mirrors when he turns, so the hand
  // column mirrors with it; reaching puts the same hand two rows higher.
  function handX(c) { return snap(c.x + (c.flip ? 0 : PXL * 10)); }
  function handY(room, c) {
    return c.reaching ? room.floorY - PXL * (CHEM.reach.length - 1) : room.deckY;
  }

  // --- What is in his hands -------------------------------------------------
  //
  // Drawn after the sprite, so whatever he is working sits on the near edge of
  // the deck in front of him, which is where you would actually put it. Only
  // the current act's apparatus is out and the rest is put away: it is the only
  // way eight stations fit into a strip this narrow, and it is also true to how
  // a bench actually looks.
  //
  // The figure is drawn at NES proportions - a big head on a short body - so
  // his literal hand pixel lands at worktop height. Apparatus is therefore
  // positioned relative to a nominal hand a few cells higher, which is where
  // the eye reads his hands as being.
  function drawHandWork(room, t, dt, tint, A, act) {
    var c = room.chem;
    if (labStory.finale) return;
    // The apparatus follows him, so it only comes out when he is standing at
    // the end of the room the act belongs to.
    if (!act || c.state === "walk" || c.at !== c.want) {
      // Crossing the aisle empty-handed would be odd: every one of these acts
      // is separated from the next by carrying something to the other end.
      if (act && c.state === "walk" && c.at === c.want) {
        var wx = handX(c), wy = room.deckY - PXL * 7;
        fill(actx, wx, wy, PXL * 2, PXL * 3, LAB.g, A * 0.55);
        fill(actx, wx, wy + PXL, PXL * 2, PXL * 2, tint, A * 0.85);
      }
      if (labStory.spill > 0) drawSpill(room, A, tint);
      return;
    }
    var hx = handX(c), hy = handY(room, c), deck = room.deckY;
    var atRight = !c.flip;
    var px = atRight ? hx - PXL : hx - PXL * 4;      // near-deck apparatus origin
    var tap = (Math.floor(c.phase * 2.2) % 2) ? PXL : 0;   // the working hand's rise and fall

    switch (act.key) {
      case "weigh": {
        // Analytical balance: draught shield, pan, and a readout that ticks as
        // solid goes in. The heap on the pan grows with the act.
        fill(actx, px - PXL, deck - PXL * 2, PXL * 6, PXL * 2, LAB.w, A);
        fill(actx, px - PXL, deck - PXL, PXL * 6, PXL, LAB.P, A);
        fill(actx, px - PXL, deck - PXL * 5, PXL, PXL * 3, LAB.W, A * 0.4);   // shield
        fill(actx, px + PXL * 4, deck - PXL * 5, PXL, PXL * 3, LAB.W, A * 0.4);
        fill(actx, px - PXL, deck - PXL * 5, PXL * 6, PXL, LAB.W, A * 0.4);
        fill(actx, px, deck - PXL * 2, PXL * 3, PXL, LAB.k, A);               // readout
        fill(actx, px + PXL * (Math.floor(t * 7) % 3), deck - PXL * 2, PXL, PXL, LAB.n, A);
        fill(actx, px, deck - PXL * 3, PXL * 4, PXL, LAB.W, A * 0.75);        // pan
        var heap = PXL * (1 + Math.round(labStory.sub * 2));
        fill(actx, px + PXL, deck - PXL * 3 - heap, PXL * 2, heap, LAB.W, A * 0.9);
        fill(actx, hx - PXL * 2, hy + tap, PXL * 3, PXL, LAB.p, A);           // spatula
        break;
      }
      case "charge": {
        // Funnel in the neck and the monomer run in out of a cylinder. He is on
        // the reach frame for this, so the cylinder really is over the neck.
        var nk = room.hood.neck;
        if (nk) {
          fill(actx, nk.x - PXL * 2, nk.y - PXL, PXL * 6, PXL, LAB.g, A * 0.6);
          fill(actx, nk.x - PXL, nk.y, PXL * 4, PXL, LAB.g, A * 0.6);
        }
        fill(actx, hx, hy - PXL * 4, PXL * 2, PXL * 5, LAB.g, A * 0.55);      // cylinder
        fill(actx, hx, hy - PXL * 2, PXL * 2, PXL * 3, tint, A * 0.85);
        fill(actx, hx, hy - PXL * 4, PXL, PXL * 5, LAB.W, A * 0.3);
        if (everyMs(room, "chargeDrop", 300)) {
          room.drops.push({ x: hx, y: hy + PXL, vy: 24, ty: room.hood.pot, vx: (room.hood.neck.x - hx) * 0.5 });
        }
        break;
      }
      case "purge": {
        // An oil bubbler on the deck. Counting bubbles is how you know the
        // nitrogen is flowing, and it is what you stand and watch.
        fill(actx, px, deck - PXL * 4, PXL * 2, PXL * 4, LAB.g, A * 0.5);
        fill(actx, px, deck - PXL * 2, PXL * 2, PXL * 2, tint, A * 0.75);
        fill(actx, px, deck - PXL * 5, PXL, PXL, LAB.p, A);                   // inlet
        if ((t * 1.6 % 1) < 0.45) fill(actx, px, deck - PXL * 3, PXL, PXL, LAB.W, A * 0.8);
        break;
      }
      case "initiate": {
        // Initiator in by syringe, a drop at a time, through the neck.
        fill(actx, hx, hy - PXL * 4, PXL, PXL * 5, LAB.W, A * 0.85);          // barrel
        fill(actx, hx, hy - PXL * 5, PXL, PXL, LAB.p, A);                     // plunger
        fill(actx, hx, hy - PXL * 2, PXL, PXL * 2, tint, A * 0.9);
        if (everyMs(room, "initDrop", 900)) {
          room.drops.push({ x: hx, y: hy + PXL, vy: 30, ty: room.hood.pot, vx: (room.hood.neck.x - hx) * 0.5 });
        }
        break;
      }
      case "reflux": {
        // The reaction is running itself, so he is writing it up and watching
        // the condensate line.
        fill(actx, hx - PXL, hy - PXL * 2, PXL * 3, PXL * 4, LAB.W, A * 0.7);
        fill(actx, hx - PXL, hy - PXL * 2, PXL * 3, PXL, LAB.p, A * 0.8);     // clip
        fill(actx, hx, hy + tap, PXL, PXL, LAB.k, A);                         // pen
        break;
      }
      case "sample": {
        // Aliquots into a rack, one per check, which is how you follow a
        // conversion without guessing.
        fill(actx, px - PXL, deck - PXL, PXL * 7, PXL, LAB.p, A);
        var vials = 1 + Math.floor(labStory.sub * 4);
        for (var v = 0; v < vials; v++) {
          fill(actx, px + v * PXL * 2, deck - PXL * 4, PXL, PXL * 3, LAB.g, A * 0.6);
          fill(actx, px + v * PXL * 2, deck - PXL * 3, PXL, PXL * 2, tint, A * 0.9);
        }
        fill(actx, hx, hy - PXL * 2 + tap, PXL, PXL * 4, LAB.W, A * 0.85);    // syringe
        break;
      }
      case "precip": {
        // Cannula from the flask into a beaker of methanol. The polymer comes
        // out of solution the moment it meets the non-solvent, and that is the
        // moment the material stops being a liquid and starts being a thing.
        var byp = deck - PXL * 5;
        fill(actx, px, byp, PXL * 5, PXL * 5, LAB.g, A * 0.34);
        fill(actx, px, byp, PXL, PXL * 5, LAB.W, A * 0.3);
        fill(actx, px, byp + PXL, PXL * 5, PXL * 4, LAB.W, A * 0.14);         // methanol
        var nk3 = room.hood.neck;
        if (nk3) {
          fill(actx, px + PXL * 2, byp - PXL * 2, nk3.x - px, PXL, LAB.p, A * 0.75);
          fill(actx, px + PXL * 2, byp - PXL * 2, PXL, PXL * 2, LAB.p, A * 0.75);
        }
        if (everyMs(room, "flake", 180)) {
          room.flakes.push({ x: snap(px + PXL * (1 + Math.floor(Math.random() * 3))), y: byp + PXL, life: 0, max: 1.0 });
        }
        break;
      }
      case "tlc": {
        // A TLC plate under the lamp: spot it, run it, and look at where the
        // spots ended up. This is the moment you find out whether any of it
        // worked, and it is two spots and a solvent front.
        var py = deck - PXL * 7;
        fill(actx, px, py, PXL * 4, PXL * 7, LAB.W, A * 0.55);            // plate
        fill(actx, px, py + PXL, PXL * 4, PXL, LAB.P, A * 0.5);           // solvent front
        var run = Math.min(1, labStory.sub * 1.6);
        fill(actx, px + PXL, py + PXL * 5 - snap(run * PXL * 3), PXL, PXL, tint, A * 0.95);
        fill(actx, px + PXL * 2, py + PXL * 5 - snap(run * PXL * 2), PXL, PXL, LAB.k, A * 0.6);
        fill(actx, px, py + PXL * 6, PXL * 4, PXL, LAB.g, A * 0.35);      // developing tank
        fill(actx, hx, hy - PXL, PXL, PXL * 2, LAB.p, A);                 // capillary
        break;
      }
      case "quench": {
        // Killing the reaction: water in from a dropping funnel, fast at first
        // and then slower, the way you do it when you do not want an exotherm.
        var nk4 = room.hood.neck;
        if (nk4) {
          fill(actx, nk4.x - PXL, nk4.y - PXL * 6, PXL * 4, PXL * 4, LAB.g, A * 0.42);
          fill(actx, nk4.x - PXL, nk4.y - PXL * 6, PXL, PXL * 4, LAB.W, A * 0.3);
          fill(actx, nk4.x - PXL, nk4.y - PXL * 4, PXL * 4, PXL * 2, LAB.g, A * 0.5);
          fill(actx, nk4.x + PXL, nk4.y - PXL * 2, PXL, PXL * 2, LAB.p, A);   // tap
          if (everyMs(room, "quenchDrop", 340)) {
            room.drops.push({ x: nk4.x + PXL, y: nk4.y - PXL, vy: 30, ty: room.hood.pot, col: LAB.g });
          }
        }
        break;
      }
      case "extract": {
        // A separatory funnel, inverted to vent and then left to settle into two
        // layers. Everyone who has done this remembers the venting.
        var sy3 = deck - PXL * 9;
        var shake = (labStory.sub < 0.45) ? snap(Math.sin(t * 7) * PXL) : 0;
        fill(actx, px, sy3 + shake, PXL * 5, PXL * 5, LAB.g, A * 0.34);   // body
        fill(actx, px, sy3 + shake, PXL, PXL * 5, LAB.W, A * 0.28);
        fill(actx, px + PXL, sy3 + PXL * 5 + shake, PXL * 3, PXL * 2, LAB.g, A * 0.34);
        fill(actx, px + PXL * 2, sy3 + PXL * 7 + shake, PXL, PXL * 2, LAB.p, A);  // stopcock
        fill(actx, px + PXL, sy3 - PXL + shake, PXL * 3, PXL, LAB.p, A);  // stopper
        if (shake === 0) {                                                 // settled: two layers
          fill(actx, px, sy3 + PXL, PXL * 5, PXL * 2, tint, A * 0.55);     // organic on top
          fill(actx, px, sy3 + PXL * 3, PXL * 5, PXL * 2, LAB.g, A * 0.5); // aqueous below
          fill(actx, px, sy3 + PXL * 3, PXL * 5, PXL, LAB.W, A * 0.35);    // the interface
        } else {
          fill(actx, px, sy3 + PXL + shake, PXL * 5, PXL * 4, tint, A * 0.4);
        }
        fill(actx, hx, hy - PXL * 2, PXL, PXL * 3, LAB.c, A * 0.9);        // his hand on it
        break;
      }
      case "rotovap": {
        // At the rotovap: he watches the bath and cracks the vacuum. The flask
        // itself is the bay's own fixture and is already turning.
        fill(actx, px, deck - PXL * 3, PXL * 4, PXL * 3, LAB.w, A);        // the chiller
        fill(actx, px + PXL, deck - PXL * 2, PXL * 2, PXL, LAB.g, A * 0.6);
        fill(actx, hx, hy, PXL, PXL * 2, LAB.p, A);                        // vacuum tap
        if (everyMs(room, "rotoPuff", 500)) {
          room.puffs.push({ x: snap(px + PXL * 2), y: deck - PXL * 5, life: 0 });
        }
        break;
      }
      case "column": {
        // Flash chromatography: a column of silica with a band running down it
        // and fractions collecting underneath. The band moving is the whole
        // point, so it is what is animated.
        var cy2 = deck - PXL * 16;
        fill(actx, px + PXL, cy2, PXL * 3, PXL * 13, LAB.g, A * 0.3);      // barrel
        fill(actx, px + PXL, cy2, PXL, PXL * 13, LAB.W, A * 0.22);
        fill(actx, px + PXL, cy2 + PXL, PXL * 3, PXL * 11, "#c9c2b0", A * 0.45);  // silica
        var band = snap(cy2 + PXL * 2 + labStory.sub * PXL * 9);
        fill(actx, px + PXL, band, PXL * 3, PXL * 2, tint, A * 0.85);      // the band
        fill(actx, px + PXL * 2, cy2 + PXL * 13, PXL, PXL * 2, LAB.g, A * 0.5);  // stem
        for (var fr = 0; fr < 4; fr++) {                                    // fraction tubes
          fill(actx, px + PXL * fr, deck - PXL * 3, PXL, PXL * 3, LAB.g, A * 0.45);
          if (fr < labStory.sub * 4) {
            fill(actx, px + PXL * fr, deck - PXL * 2, PXL, PXL * 2, tint, A * 0.7);
          }
        }
        break;
      }
      case "analyse": {
        // At the chromatograph, watching the trace come up. The peak grows as
        // the run goes on, which is exactly how it feels to stand there.
        fill(actx, px - PXL, deck - PXL * 5, PXL * 7, PXL * 4, LAB.k, A * 0.9);
        fill(actx, px - PXL, deck - PXL * 5, PXL * 7, PXL, LAB.P, A);
        for (var q2 = 0; q2 < 6; q2++) {
          var pk2 = Math.exp(-Math.pow((q2 - 3.2) / 1.1, 2)) * Math.min(1, labStory.sub * 1.8);
          fill(actx, px + PXL * (q2 - 1), deck - PXL * 2 - snap(pk2 * PXL * 2), PXL, PXL, LAB.n, A);
        }
        fill(actx, hx, hy, PXL, PXL, LAB.c, A * 0.9);                      // hand on the keypad
        break;
      }
      case "product": {
        // The molecule, finally: a vial of dry solid, held up to the light and
        // looked at. Everything before this was in aid of this one object.
        var lift = snap(Math.min(1, labStory.sub * 2) * PXL * 3);
        fill(actx, hx - PXL, hy - PXL * 3 - lift, PXL * 3, PXL * 5, LAB.g, A * 0.45);
        fill(actx, hx - PXL, hy - PXL * 3 - lift, PXL, PXL * 5, LAB.W, A * 0.35);
        fill(actx, hx - PXL, hy - PXL * 4 - lift, PXL * 3, PXL, LAB.W, A * 0.7);   // cap
        fill(actx, hx - PXL, hy - PXL - lift, PXL * 3, PXL * 3, LAB.W, A * 0.92);  // the solid
        // The jars already made, lined up beside him on the bench.
        for (var jj = 0; jj < 3; jj++) {
          fill(actx, px + jj * PXL * 2, deck - PXL * 3, PXL, PXL * 3, tint, A * 0.7);
          fill(actx, px + jj * PXL * 2, deck - PXL * 3, PXL, PXL, LAB.W, A * 0.5);
        }
        break;
      }
      case "isolate": {
        // Buchner funnel on a filter flask, with the cake building on the frit.
        fill(actx, px, deck - PXL * 3, PXL * 4, PXL * 3, LAB.g, A * 0.36);    // filter flask
        fill(actx, px + PXL * 4, deck - PXL * 2, PXL, PXL, LAB.p, A);         // vacuum stub
        fill(actx, px + PXL, deck - PXL * 4, PXL * 2, PXL, LAB.W, A * 0.5);   // stem
        fill(actx, px - PXL, deck - PXL * 6, PXL * 6, PXL * 2, LAB.W, A * 0.55);
        var cake = PXL * (1 + Math.round(labStory.sub * 2));
        fill(actx, px, deck - PXL * 6 - cake, PXL * 4, cake, LAB.W, A * 0.92);
        fill(actx, hx, hy + tap, PXL, PXL * 2, LAB.p, A);                     // spatula
        break;
      }
    }
    if (labStory.spill > 0) drawSpill(room, A, tint);
  }
  // A lost chain is a lost reaction: something got spilled on the deck and it
  // is still there for a while afterwards.
  function drawSpill(room, A, tint) {
    var f = Math.min(1, labStory.spill / 7);
    var x = room.hood.flaskX - PXL * 6, y = room.deckY - PXL;
    fill(actx, x, y, PXL * 5, PXL, tint, A * 0.55 * f);
    fill(actx, x + PXL, y - PXL, PXL * 3, PXL, tint, A * 0.35 * f);
  }

  function sizeAmbient() {
    if (!ambient) return false;
    var rect = ambient.getBoundingClientRect();
    var w = Math.max(1, Math.round(rect.width)), h = Math.max(1, Math.round(rect.height));
    if (w === ambient.width && h === ambient.height) return true;
    ambient.width = w; ambient.height = h;
    buildAmbient(w, h);
    return true;
  }

  function drawAmbient() {
    if (!actx || !sizeAmbient()) return;
    var w = ambient.width, h = ambient.height, now = Date.now();
    // Clamped so a pause, or a backgrounded tab, does not teleport the chemist
    // across the room on the first frame back.
    var dt = lastAmbientT ? Math.min(0.05, (now - lastAmbientT) / 1000) : 0.016;
    lastAmbientT = now;
    actx.clearRect(0, 0, w, h);
    if (rooms.length) drawScene(w, h, dt);
  }

  function ambientLoop() {
    drawAmbient();
    ambientFrame = requestAnimationFrame(ambientLoop);
  }
  function startAmbient() { if (!ambientFrame && actx) ambientLoop(); }
  function stopAmbient() {
    if (ambientFrame) { cancelAnimationFrame(ambientFrame); ambientFrame = null; }
  }
  window.addEventListener("resize", function () { if (ambient) { ambient.width = 0; sizeAmbient(); } });
    // With no game driving it, the synthesis walks itself so the scene still
    // tells its story on a page that has no player.
    var autoTimer = null, autoJar = 0;
    // Each finished run gets its own colour, so the shelf reads as a row of
    // different products rather than a repeated one.
    var AUTO_JAR_TINTS = ["#5b83e6", "#43a86e", "#9670dd", "#3fadb9", "#dd8a68",
                          "#b9973f", "#4ab8a4", "#d16a6a"];
    function startAuto() {
      if (autoTimer || !opts.autoStory) return;
      var p = 0;
      labSignal("progress", 0);
      // One jar per completed run, fired on the wrap rather than on "p is
      // small" - the latter was true for several ticks in a row, so the shelf
      // gained a handful of jars every cycle and saturated into a solid bar of
      // colour within a minute of the page being open.
      autoTimer = setInterval(function () {
        var next = p + 0.0022;
        if (next >= 1) {
          next -= 1;
          labSignal("levelDone", { tint: AUTO_JAR_TINTS[autoJar++ % AUTO_JAR_TINTS.length] });
          if (labStory.shelf.length > 12) labStory.shelf.shift();
        }
        p = next;
        labSignal("progress", p);
      }, 260);
    }
    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

    return {
      start: function () { startAmbient(); startAuto(); },
      stop: function () { stopAmbient(); stopAuto(); },
      signal: labSignal,
      // Forces a rebuild at the next frame, for a caller whose layout moved
      // without the window resizing.
      invalidate: function () { if (ambient) ambient.width = 0; }
    };
  }

  window.PolyLab = { create: create };
})();
