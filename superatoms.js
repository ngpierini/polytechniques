// Superatom dictionary for the polymer-search drawing editor.
//
// (c) 2025-2026 Nicholas Pierini. All rights reserved.
//
// A "superatom" is a label a chemist writes as a single vertex to stand in for
// a small subgraph: Ph for a phenyl ring, Ac for acetyl, OMe for methoxy, and
// so on. The editor lets the user type any of these into the custom-element
// field or pick from a menu; before the drawing goes to RDKit for structure
// search, expandSuperatoms() in polymer-search.js walks the atom list and
// replaces each recognised label with the small graph described here.
//
// Every expansion here traces to RDKit's own abbreviations file
// (Code/GraphMol/Abbreviations/data/abbreviations.txt, BSD-3), which the site
// already vendors under vendor/RDKit_minimal.wasm. That is the single
// authoritative source in this space: it is what RDKit itself expands
// abbreviations to during SMILES/molfile parsing, so a repeat unit drawn here
// with "Ph" on a vertex will canonicalise to the same molecule as one drawn
// elsewhere with a full benzene ring and imported through RDKit.
//
// Every entry is:
//   atoms:   list of { el, charge? } - the fragment atoms, first is the anchor
//   bonds:   list of [i, j, order]  - indices into atoms[]
//   aliases: alternative spellings that must map to the same fragment
//
// The FIRST atom is always the anchor: the atom that keeps the parent bond
// from the drawing. For OAc, the anchor is the ester oxygen (so *-OAc drawn
// on a carbon gives C-O-C(=O)-C, not C-C(=O)-O-C); for Ac, the carbonyl
// carbon (so *-Ac gives C-C(=O)-C).
//
// Aromatic rings are Kekulised with alternating single/double bonds; RDKit
// re-perceives aromaticity when it sanitises the molecule, so the specific
// Kekule form does not matter as long as the alternation is valid.
//
// Deliberately UNSUPPORTED (see UNSUPPORTED_LABELS below):
//   - Bare SO2, SO3, SO4: multiple accepted expansions, no single right answer.
//   - Bare N or S without hydrogens: valence ambiguous.
//   - R, X, Ar, Alk, M: variable-group placeholders, not concrete substituents.
//   - Xy, Tol, Bpy, Cp: positional-isomer or ligand shorthand.
//
// Matching is CASE-SENSITIVE - "Ac" (acetyl) and "AC"/"ac" are treated as
// distinct so the label picker does not conflate acetyl with actinium or a
// mass-spec caption. The lookup takes precedence over the element table for
// any label appearing here.
(function (root) {
  "use strict";

  var SUPERATOMS = {
    "NO2":   { atoms: [{el:"N",charge:1},{el:"O"},{el:"O",charge:-1}], bonds: [[0,1,2],[0,2,1]], aliases: ["nitro"] },
    "SO3H":  { atoms: [{el:"S"},{el:"O"},{el:"O"},{el:"O"}], bonds: [[0,1,2],[0,2,2],[0,3,1]], aliases: ["sulfo","SO3-H"] },
    "OMe":   { atoms: [{el:"O"},{el:"C"}], bonds: [[0,1,1]], aliases: ["MeO","OCH3","methoxy"] },
    "OEt":   { atoms: [{el:"O"},{el:"C"},{el:"C"}], bonds: [[0,1,1],[1,2,1]], aliases: ["EtO","OCH2CH3","ethoxy"] },
    "OAc":   { atoms: [{el:"O"},{el:"C"},{el:"O"},{el:"C"}], bonds: [[0,1,1],[1,2,2],[1,3,1]], aliases: ["AcO","acetoxy"] },
    "OTf":   { atoms: [{el:"O"},{el:"S"},{el:"O"},{el:"O"},{el:"C"},{el:"F"},{el:"F"},{el:"F"}], bonds: [[0,1,1],[1,2,2],[1,3,2],[1,4,1],[4,5,1],[4,6,1],[4,7,1]], aliases: ["TfO","triflate","triflyloxy"] },
    "OTs":   { atoms: [{el:"O"},{el:"S"},{el:"O"},{el:"O"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"}], bonds: [[0,1,1],[1,2,2],[1,3,2],[1,4,1],[4,5,2],[5,6,1],[6,7,2],[7,8,1],[8,9,2],[9,4,1],[7,10,1]], aliases: ["TsO","tosylate","p-toluenesulfonyloxy"] },
    "OMs":   { atoms: [{el:"O"},{el:"S"},{el:"O"},{el:"O"},{el:"C"}], bonds: [[0,1,1],[1,2,2],[1,3,2],[1,4,1]], aliases: ["MsO","mesylate"] },
    "OBn":   { atoms: [{el:"O"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"}], bonds: [[0,1,1],[1,2,1],[2,3,2],[3,4,1],[4,5,2],[5,6,1],[6,7,2],[7,2,1]], aliases: ["BnO","benzyloxy","OCH2Ph"] },
    "Ph":    { atoms: [{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"}], bonds: [[0,1,2],[1,2,1],[2,3,2],[3,4,1],[4,5,2],[5,0,1]], aliases: ["phenyl","C6H5"] },
    "Bn":    { atoms: [{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"}], bonds: [[0,1,1],[1,2,2],[2,3,1],[3,4,2],[4,5,1],[5,6,2],[6,1,1]], aliases: ["benzyl","CH2Ph","PhCH2"] },
    "Bz":    { atoms: [{el:"C"},{el:"O"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"}], bonds: [[0,1,2],[0,2,1],[2,3,2],[3,4,1],[4,5,2],[5,6,1],[6,7,2],[7,2,1]], aliases: ["benzoyl","PhCO","C(O)Ph"] },
    "Ac":    { atoms: [{el:"C"},{el:"O"},{el:"C"}], bonds: [[0,1,2],[0,2,1]], aliases: ["acetyl","COMe","COCH3","C(O)Me","C(O)CH3"] },
    "Me":    { atoms: [{el:"C"}], bonds: [], aliases: ["methyl","CH3"] },
    "Et":    { atoms: [{el:"C"},{el:"C"}], bonds: [[0,1,1]], aliases: ["ethyl","C2H5","CH2CH3"] },
    "Pr":    { atoms: [{el:"C"},{el:"C"},{el:"C"}], bonds: [[0,1,1],[1,2,1]], aliases: ["nPr","n-Pr","propyl","n-propyl","CH2CH2CH3"] },
    "iPr":   { atoms: [{el:"C"},{el:"C"},{el:"C"}], bonds: [[0,1,1],[0,2,1]], aliases: ["i-Pr","isopropyl","iso-propyl","CH(CH3)2"] },
    "Bu":    { atoms: [{el:"C"},{el:"C"},{el:"C"},{el:"C"}], bonds: [[0,1,1],[1,2,1],[2,3,1]], aliases: ["nBu","n-Bu","butyl","n-butyl","CH2CH2CH2CH3"] },
    "tBu":   { atoms: [{el:"C"},{el:"C"},{el:"C"},{el:"C"}], bonds: [[0,1,1],[0,2,1],[0,3,1]], aliases: ["t-Bu","tert-Bu","tert-butyl","C(CH3)3"] },
    "cHex":  { atoms: [{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"}], bonds: [[0,1,1],[1,2,1],[2,3,1],[3,4,1],[4,5,1],[5,0,1]], aliases: ["Cy","cyclohexyl","C6H11"] },
    "CN":    { atoms: [{el:"C"},{el:"N"}], bonds: [[0,1,3]], aliases: ["cyano","nitrile"] },
    "CHO":   { atoms: [{el:"C"},{el:"O"}], bonds: [[0,1,2]], aliases: ["formyl","C(O)H"] },
    "CO2H":  { atoms: [{el:"C"},{el:"O"},{el:"O"}], bonds: [[0,1,2],[0,2,1]], aliases: ["COOH","carboxyl","C(O)OH"] },
    "CO2Me": { atoms: [{el:"C"},{el:"O"},{el:"O"},{el:"C"}], bonds: [[0,1,2],[0,2,1],[2,3,1]], aliases: ["COOMe","methoxycarbonyl","C(O)OMe","MeO2C","MeOOC"] },
    "NH2":   { atoms: [{el:"N"}], bonds: [], aliases: ["amino"] },
    "NMe2":  { atoms: [{el:"N"},{el:"C"},{el:"C"}], bonds: [[0,1,1],[0,2,1]], aliases: ["dimethylamino","N(CH3)2","Me2N"] },
    "NEt2":  { atoms: [{el:"N"},{el:"C"},{el:"C"},{el:"C"},{el:"C"}], bonds: [[0,1,1],[1,2,1],[0,3,1],[3,4,1]], aliases: ["diethylamino","N(Et)2","N(C2H5)2","Et2N"] },
    "NHMe":  { atoms: [{el:"N"},{el:"C"}], bonds: [[0,1,1]], aliases: ["methylamino","MeNH","N(H)Me"] },
    "NHAc":  { atoms: [{el:"N"},{el:"C"},{el:"O"},{el:"C"}], bonds: [[0,1,1],[1,2,2],[1,3,1]], aliases: ["acetamido","AcNH","N(H)Ac"] },
    "N3":    { atoms: [{el:"N"},{el:"N",charge:1},{el:"N",charge:-1}], bonds: [[0,1,2],[1,2,2]], aliases: ["azido","azide"] },
    "NCS":   { atoms: [{el:"N"},{el:"C"},{el:"S"}], bonds: [[0,1,2],[1,2,2]], aliases: ["isothiocyanato","isothiocyanate"] },
    "NCO":   { atoms: [{el:"N"},{el:"C"},{el:"O"}], bonds: [[0,1,2],[1,2,2]], aliases: ["isocyanato","isocyanate"] },
    "CF3":   { atoms: [{el:"C"},{el:"F"},{el:"F"},{el:"F"}], bonds: [[0,1,1],[0,2,1],[0,3,1]], aliases: ["trifluoromethyl","F3C"] },
    "C2F5":  { atoms: [{el:"C"},{el:"F"},{el:"F"},{el:"C"},{el:"F"},{el:"F"},{el:"F"}], bonds: [[0,1,1],[0,2,1],[0,3,1],[3,4,1],[3,5,1],[3,6,1]], aliases: ["pentafluoroethyl","CF2CF3"] },
    "TMS":   { atoms: [{el:"Si"},{el:"C"},{el:"C"},{el:"C"}], bonds: [[0,1,1],[0,2,1],[0,3,1]], aliases: ["trimethylsilyl","SiMe3","Si(CH3)3"] },
    "TBS":   { atoms: [{el:"Si"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"}], bonds: [[0,1,1],[0,2,1],[0,3,1],[3,4,1],[3,5,1],[3,6,1]], aliases: ["TBDMS","t-BuMe2Si","tert-butyldimethylsilyl","SiMe2tBu"] },
    "Boc":   { atoms: [{el:"C"},{el:"O"},{el:"O"},{el:"C"},{el:"C"},{el:"C"},{el:"C"}], bonds: [[0,1,2],[0,2,1],[2,3,1],[3,4,1],[3,5,1],[3,6,1]], aliases: ["BOC","tert-butoxycarbonyl","t-BuOC(O)","C(O)OtBu"] },
    "Cbz":   { atoms: [{el:"C"},{el:"O"},{el:"O"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"}], bonds: [[0,1,2],[0,2,1],[2,3,1],[3,4,1],[4,5,2],[5,6,1],[6,7,2],[7,8,1],[8,9,2],[9,4,1]], aliases: ["Z","benzyloxycarbonyl","PhCH2OC(O)","C(O)OBn"] },
    "Fmoc":  {
      // 17-atom fluorenylmethyloxycarbonyl. Numbering follows the source
      // spec: c0 anchor carbonyl -> o0 (C=O) and o1 (ester O) -> c1 (CH2) ->
      // c9 (fluorenyl 9-position) fused between two benzo rings.
      atoms: [{el:"C"},{el:"O"},{el:"O"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"}],
      bonds: [[0,1,2],[0,2,1],[2,3,1],[3,4,1],[4,5,1],[4,16,1],[5,6,1],[6,7,2],[7,8,1],[8,9,2],[9,10,1],[10,5,2],[10,11,1],[11,16,2],[11,12,1],[12,13,2],[13,14,1],[14,15,2],[15,16,1]],
      aliases: ["9-fluorenylmethyloxycarbonyl","fluorenylmethoxycarbonyl"]
    },
    "Tf":    { atoms: [{el:"S"},{el:"O"},{el:"O"},{el:"C"},{el:"F"},{el:"F"},{el:"F"}], bonds: [[0,1,2],[0,2,2],[0,3,1],[3,4,1],[3,5,1],[3,6,1]], aliases: ["triflyl","trifluoromethanesulfonyl","SO2CF3"] },
    "Ts":    { atoms: [{el:"S"},{el:"O"},{el:"O"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"},{el:"C"}], bonds: [[0,1,2],[0,2,2],[0,3,1],[3,4,2],[4,5,1],[5,6,2],[6,7,1],[7,8,2],[8,3,1],[6,9,1]], aliases: ["tosyl","p-toluenesulfonyl","SO2C6H4CH3"] },
    "Ms":    { atoms: [{el:"S"},{el:"O"},{el:"O"},{el:"C"}], bonds: [[0,1,2],[0,2,2],[0,3,1]], aliases: ["mesyl","methanesulfonyl","SO2Me","SO2CH3"] }
  };

  // Deliberately not expanded. If a user types any of these the editor should
  // reject or prompt for a specific chemistry rather than picking one.
  var UNSUPPORTED_LABELS = {
    "SO2": "Ambiguous - could be a divalent sulfonyl bridge, a monovalent SO2H, or bare SO2. Draw the atoms.",
    "SO3": "Ambiguous - could be sulfonate anion, sulfonyl-oxo with dropped H, or bridged. Use SO3H, or draw the atoms.",
    "SO4": "Ambiguous - half-sulfate ester vs bridged diester vs peroxo. Draw the atoms.",
    "R":   "R is a variable-group placeholder; specify the substituent.",
    "X":   "X is a variable-halogen placeholder; use F, Cl, Br, or I.",
    "Ar":  "Ar is a variable aryl placeholder; use Ph, Bn, or draw the ring.",
    "Alk": "Alk is a variable alkyl placeholder; use Me, Et, Pr, or draw the chain.",
    "M":   "M is a metal placeholder; specify the element.",
    "Xy":  "Xylyl has ortho/meta/para isomers; draw the ring or specify o-Xy/m-Xy/p-Xy.",
    "Tol": "Tolyl has ortho/meta/para isomers; draw the ring or specify o-Tol/m-Tol/p-Tol.",
    "Bpy": "Bipyridine has multiple isomers and no standard bond count from a single vertex.",
    "Cp":  "Cyclopentadienyl is a ligand shorthand with variable hapticity; draw the ring."
  };

  // Fast reverse map: any alias resolves to its canonical label. Built once.
  var ALIAS_MAP = {};
  Object.keys(SUPERATOMS).forEach(function (canon) {
    ALIAS_MAP[canon] = canon;
    (SUPERATOMS[canon].aliases || []).forEach(function (a) { ALIAS_MAP[a] = canon; });
  });

  // Look up a raw label (as typed by the user) and return the canonical name,
  // or null if it is not a recognised superatom. Case-sensitive on purpose:
  // Ac (acetyl) vs AC (actinium) vs ac (nothing) must not collide.
  function canonicalize(label) {
    if (label == null) return null;
    var s = String(label);
    return ALIAS_MAP[s] || null;
  }

  // Element and mass count for the mass readout, so the readout matches the
  // fragment that would be expanded. Uses the atoms only - hydrogen is
  // implicit and computed separately by fragmentMass in polymer-search.js
  // from valence, which handles both bare and superatom vertices uniformly.
  function elementCount(canonicalLabel) {
    var e = SUPERATOMS[canonicalLabel];
    if (!e) return null;
    var counts = {}, i;
    for (i = 0; i < e.atoms.length; i++) {
      var el = e.atoms[i].el;
      counts[el] = (counts[el] || 0) + 1;
    }
    return counts;
  }

  root.PolymerSuperatoms = {
    SUPERATOMS: SUPERATOMS,
    UNSUPPORTED_LABELS: UNSUPPORTED_LABELS,
    canonicalize: canonicalize,
    elementCount: elementCount
  };
})(typeof window !== "undefined" ? window : this);
