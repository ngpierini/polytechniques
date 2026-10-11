// Finds step-growth polyesters that a registry actually holds, and builds
// their repeat units.
//
// The idea runs the opposite way round from scripts/discover-polymers.js,
// which starts from a hand-kept watchlist of monomers. Here the candidate set
// is generated combinatorially - every diol against every diacid - and then
// cut down by asking a registry which of those combinations is a real,
// registered polymer. Enumeration is cheap and mostly wrong; the registry is
// the filter.
//
// That filter matters more than it sounds. Of the 702 diol-by-diacid pairs
// this script enumerates, 63 came back as registered polymers: nine per cent.
// The other 639 are perfectly drawable, and almost all of them are things
// nobody has made. Anything that bulk-generates polymers WITHOUT a check like
// this is mostly generating fiction.
//
// Three independent checks sit between a candidate and an entry:
//
//  1. The registry has to hold it. EPA's Substance Registry Services is asked
//     under the CAS copolymer index name, "<diacid>, polymer with <diol>".
//  2. The formula has to match. EPA answers with either component formulas,
//     (C6H14O2.C6H10O4)x, or a repeat unit, (C12H22N2O2)n. Either is compared
//     against the formula computed here from the structure this script built.
//     A record whose formula disagrees is discarded rather than trusted: a
//     name search on its own cannot tell a polymer from something merely
//     named like one.
//  3. The structure must not already be in the library. Names are compared
//     loosely AND Weisfeiler-Lehman graph hashes are compared exactly, which
//     is what caught poly(ethylene 2,6-naphthalate) as a second copy of
//     poly(ethylene naphthalate): the names differ, the molecules do not.
//
// The builder was validated by making it reproduce fifteen repeat units that
// were drawn by hand - PET, PBT, PTT, PEN, PBS, five nylons, Kevlar and Nomex
// among them - and all fifteen match by graph hash. Run with --verify to
// repeat that check.
//
// What a generated entry does NOT carry: Tg, Tm, or any other measured
// property. Those need a source, this script has none, and the CI data check
// requires a tgSource/tmSource for every value. The notes state only what
// follows from the repeat unit - ester density, chain parity, what a branch
// or a ring does to packing - plus where a monomer comes from.
//
// One caution on coverage: a miss is not proof of absence. EPA holds polymers
// it has listed, and TSCA's polymer exemption leaves many out, so the sweep
// under-counts. Everything it DOES return has been checked; what it misses is
// simply not added.
//
// Usage:
//   node scripts/discover-step-growth.js --verify   builder regression + valence sweep
//   node scripts/discover-step-growth.js --sweep    ask the registry about every pair
//   node scripts/discover-step-growth.js --report   show what a sweep found
//
// It deliberately does not write polymer-data.js. New entries get reviewed
// before they land, the same as with the other discovery script.
"use strict";

// ===================================================================
// Building blocks
// ===================================================================

// Wider building-block table. `chain` is the skeleton BETWEEN the two
// functional groups, in a small notation the builder understands:
//   {k:"linear", els:[...], orders:[...]}  a straight run of atoms
//   {k:"branched", n, me:[i,...]}          n methylenes, methyls on those (1-based)
//   {k:"aryl", sub}                        benzene, 1,2 / 1,3 / 1,4
//   {k:"ring6sat", sub}                    cyclohexane
//   {k:"naph"} {k:"furan"} {k:"biphenyl"} {k:"bisphenolA"}
//   {k:"neopentyl"} {k:"chdm"}
// A block with no `chain` is still enumerated and still gets a CAS; it just
// lands as needsStructure, which is an existing state in this library.
const L = (els, orders) => ({ k: "linear", els: els, orders: orders || els.slice(1).map(() => 1) });
const CH = (n) => L(new Array(n).fill("C"));

const DIACIDS = [
  { key: "oxalate", idx: "Ethanedioic acid", acyl: "oxalate", chain: { k: "linear", els: [], orders: [] } },
  { key: "malonate", idx: "Propanedioic acid", acyl: "malonate", chain: CH(1) },
  { key: "succinate", idx: "Butanedioic acid", acyl: "succinate", chain: CH(2) },
  { key: "glutarate", idx: "Pentanedioic acid", acyl: "glutarate", chain: CH(3) },
  { key: "adipate", idx: "Hexanedioic acid", acyl: "adipate", chain: CH(4) },
  { key: "pimelate", idx: "Heptanedioic acid", acyl: "pimelate", chain: CH(5) },
  { key: "suberate", idx: "Octanedioic acid", acyl: "suberate", chain: CH(6) },
  { key: "azelate", idx: "Nonanedioic acid", acyl: "azelate", chain: CH(7) },
  { key: "sebacate", idx: "Decanedioic acid", acyl: "sebacate", chain: CH(8) },
  { key: "undecanedioate", idx: "Undecanedioic acid", acyl: "undecanedioate", chain: CH(9) },
  { key: "dodecanedioate", idx: "Dodecanedioic acid", acyl: "dodecanedioate", chain: CH(10) },
  { key: "brassylate", idx: "Tridecanedioic acid", acyl: "brassylate", chain: CH(11) },
  { key: "tetradecanedioate", idx: "Tetradecanedioic acid", acyl: "tetradecanedioate", chain: CH(12) },
  { key: "hexadecanedioate", idx: "Hexadecanedioic acid", acyl: "hexadecanedioate", chain: CH(14) },
  { key: "fumarate", idx: "2-Butenedioic acid, (2E)-", alt: ["Fumaric acid"], acyl: "fumarate", chain: L(["C", "C"], [2]) },
  { key: "maleate", idx: "2-Butenedioic acid, (2Z)-", alt: ["Maleic acid"], acyl: "maleate", chain: L(["C", "C"], [2]) },
  { key: "itaconate", idx: "Butanedioic acid, 2-methylene-", alt: ["Itaconic acid"], acyl: "itaconate" },
  { key: "diglycolate", idx: "Acetic acid, 2,2'-oxybis-", alt: ["Diglycolic acid"], acyl: "diglycolate", chain: L(["C", "O", "C"]) },
  { key: "thiodipropionate", idx: "Propanoic acid, 3,3'-thiobis-", alt: ["3,3'-Thiodipropionic acid"], acyl: "3,3'-thiodipropionate", chain: L(["C", "C", "S", "C", "C"]) },
  { key: "terephthalate", idx: "1,4-Benzenedicarboxylic acid", acyl: "terephthalate", chain: { k: "aryl", sub: "1,4" } },
  { key: "isophthalate", idx: "1,3-Benzenedicarboxylic acid", acyl: "isophthalate", chain: { k: "aryl", sub: "1,3" } },
  { key: "phthalate", idx: "1,2-Benzenedicarboxylic acid", acyl: "phthalate", chain: { k: "aryl", sub: "1,2" } },
  { key: "naphthalate", idx: "2,6-Naphthalenedicarboxylic acid", acyl: "2,6-naphthalate", chain: { k: "naph" } },
  { key: "furanoate", idx: "2,5-Furandicarboxylic acid", acyl: "2,5-furandicarboxylate", chain: { k: "furan" } },
  { key: "cyclohexanedicarboxylate", idx: "1,4-Cyclohexanedicarboxylic acid", acyl: "1,4-cyclohexanedicarboxylate", chain: { k: "ring6sat", sub: "1,4" } },
  { key: "biphenyldicarboxylate", idx: "[1,1'-Biphenyl]-4,4'-dicarboxylic acid", acyl: "4,4'-biphenyldicarboxylate", chain: { k: "biphenyl" } }
];

const DIOLS = [
  { key: "ethylene", idx: "1,2-Ethanediol", alt: ["Ethylene glycol"], alkylene: "ethylene", chain: CH(2) },
  { key: "trimethylene", idx: "1,3-Propanediol", alkylene: "trimethylene", chain: CH(3), akaAlk: "propylene" },
  { key: "butylene", idx: "1,4-Butanediol", alkylene: "butylene", chain: CH(4), akaAlk: "tetramethylene" },
  { key: "pentylene", idx: "1,5-Pentanediol", alkylene: "pentylene", chain: CH(5), akaAlk: "pentamethylene" },
  { key: "hexylene", idx: "1,6-Hexanediol", alkylene: "hexylene", chain: CH(6), akaAlk: "hexamethylene" },
  { key: "heptylene", idx: "1,7-Heptanediol", alkylene: "heptylene", chain: CH(7), akaAlk: "heptamethylene" },
  { key: "octylene", idx: "1,8-Octanediol", alkylene: "octylene", chain: CH(8), akaAlk: "octamethylene" },
  { key: "nonylene", idx: "1,9-Nonanediol", alkylene: "nonylene", chain: CH(9), akaAlk: "nonamethylene" },
  { key: "decylene", idx: "1,10-Decanediol", alkylene: "decylene", chain: CH(10), akaAlk: "decamethylene" },
  { key: "undecylene", idx: "1,11-Undecanediol", alkylene: "undecylene", chain: CH(11), akaAlk: "undecamethylene" },
  { key: "dodecylene", idx: "1,12-Dodecanediol", alkylene: "dodecylene", chain: CH(12), akaAlk: "dodecamethylene" },
  { key: "tetradecylene", idx: "1,14-Tetradecanediol", alkylene: "tetradecylene", chain: CH(14) },
  { key: "hexadecylene", idx: "1,16-Hexadecanediol", alkylene: "hexadecylene", chain: CH(16) },
  { key: "propylene12", idx: "1,2-Propanediol", alt: ["Propylene glycol"], alkylene: "1,2-propylene", chain: { k: "branched", n: 2, me: [1] } },
  { key: "butylene13", idx: "1,3-Butanediol", alkylene: "1,3-butylene", chain: { k: "branched", n: 3, me: [1] } },
  { key: "butylene23", idx: "2,3-Butanediol", alkylene: "2,3-butylene", chain: { k: "branched", n: 2, me: [1, 2] } },
  { key: "methylpropylene", idx: "1,3-Propanediol, 2-methyl-", alt: ["2-Methyl-1,3-propanediol"], alkylene: "2-methyltrimethylene", chain: { k: "branched", n: 3, me: [2] } },
  { key: "methylpentylene", idx: "1,5-Pentanediol, 3-methyl-", alt: ["3-Methyl-1,5-pentanediol"], alkylene: "3-methylpentylene", chain: { k: "branched", n: 5, me: [3] } },
  { key: "neopentylene", idx: "2,2-Dimethyl-1,3-propanediol", alt: ["Neopentyl glycol"], alkylene: "neopentylene", chain: { k: "neopentyl" } },
  { key: "diethyleneglycol", idx: "Ethanol, 2,2'-oxybis-", alt: ["Diethylene glycol"], alkylene: "diethylene glycol", chain: L(["C", "C", "O", "C", "C"]) },
  { key: "triethyleneglycol", idx: "Ethanol, 2,2'-[1,2-ethanediylbis(oxy)]bis-", alt: ["Triethylene glycol"], alkylene: "triethylene glycol", chain: L(["C", "C", "O", "C", "C", "O", "C", "C"]) },
  { key: "cyclohexylenedimethylene", idx: "1,4-Cyclohexanedimethanol", alkylene: "1,4-cyclohexylenedimethylene", chain: { k: "chdm" }, akaAlk: "cyclohexanedimethylene" },
  { key: "cyclohexylene14", idx: "1,4-Cyclohexanediol", alkylene: "1,4-cyclohexylene", chain: { k: "ring6sat", sub: "1,4" } },
  { key: "hydroquinone", idx: "1,4-Benzenediol", alt: ["Hydroquinone"], alkylene: "p-phenylene", chain: { k: "aryl", sub: "1,4" } },
  { key: "resorcinol", idx: "1,3-Benzenediol", alt: ["Resorcinol"], alkylene: "m-phenylene", chain: { k: "aryl", sub: "1,3" } },
  { key: "bisphenolA", idx: "Phenol, 4,4'-(1-methylethylidene)bis-", alt: ["Bisphenol A"], alkylene: "bisphenol A", chain: { k: "bisphenolA" } },
  { key: "isosorbide", idx: "D-Glucitol, 1,4:3,6-dianhydro-", alt: ["Isosorbide"], alkylene: "isosorbide" }
];

const DIAMINES = [
  { key: "2", idx: "1,2-Ethanediamine", alt: ["Ethylenediamine"], amine: "ethylene", chain: CH(2) },
  { key: "3", idx: "1,3-Propanediamine", alt: ["1,3-Diaminopropane"], amine: "trimethylene", chain: CH(3) },
  { key: "4", idx: "1,4-Butanediamine", alt: ["1,4-Diaminobutane"], amine: "tetramethylene", chain: CH(4) },
  { key: "5", idx: "1,5-Pentanediamine", alt: ["1,5-Diaminopentane"], amine: "pentamethylene", chain: CH(5) },
  { key: "6", idx: "1,6-Hexanediamine", alt: ["Hexamethylenediamine"], amine: "hexamethylene", chain: CH(6) },
  { key: "7", idx: "1,7-Heptanediamine", amine: "heptamethylene", chain: CH(7) },
  { key: "8", idx: "1,8-Octanediamine", amine: "octamethylene", chain: CH(8) },
  { key: "9", idx: "1,9-Nonanediamine", amine: "nonamethylene", chain: CH(9) },
  { key: "10", idx: "1,10-Decanediamine", amine: "decamethylene", chain: CH(10) },
  { key: "11", idx: "1,11-Undecanediamine", amine: "undecamethylene", chain: CH(11) },
  { key: "12", idx: "1,12-Dodecanediamine", amine: "dodecamethylene", chain: CH(12) },
  { key: "13", idx: "1,13-Tridecanediamine", amine: "tridecamethylene", chain: CH(13) },
  { key: "pPhenylene", idx: "1,4-Benzenediamine", alt: ["p-Phenylenediamine"], amine: "p-phenylene", chain: { k: "aryl", sub: "1,4" } },
  { key: "mPhenylene", idx: "1,3-Benzenediamine", alt: ["m-Phenylenediamine"], amine: "m-phenylene", chain: { k: "aryl", sub: "1,3" } },
  { key: "mXylylene", idx: "1,3-Benzenedimethanamine", alt: ["m-Xylylenediamine"], amine: "m-xylylene" },
  { key: "piperazine", idx: "Piperazine", amine: "piperazine" }
];

// ===================================================================
// Repeat-unit builder
// ===================================================================

// Builds a step-growth repeat-unit graph in polymer-data.js's {atoms,bonds}
// shape. Deterministic and mechanical: a polyester repeat unit from a diol and
// a diacid is -O-R-O-CO-R'-CO-, and nothing about it needs a judgement call.
// The only judgement is WHICH pairs to build, and that is settled by the
// registry check, not here.
//
// Validated by making it reproduce entries that were drawn by hand: see
// verify.js, which compares Weisfeiler-Lehman hashes against the library.

function Builder() {
  this.atoms = [];
  this.bonds = [];
  this.n = 0;
}
Builder.prototype.add = function (el) {
  const id = ++this.n;
  this.atoms.push({ id: id, el: el });
  return id;
};
Builder.prototype.bond = function (a, b, order) {
  this.bonds.push({ a: a, b: b, order: order || 1 });
};

// Each spacer returns {head, tail}: the two atoms the backbone attaches to,
// or null when the two functional groups join directly (oxalate).
Builder.prototype.spacer = function (chain) {
  const self = this;
  if (!chain) throw new Error("no chain spec");

  if (chain.k === "linear") {
    if (!chain.els.length) return null;
    const ids = chain.els.map(function (el) { return self.add(el); });
    for (let i = 0; i + 1 < ids.length; i++) {
      self.bond(ids[i], ids[i + 1], (chain.orders && chain.orders[i]) || 1);
    }
    return { head: ids[0], tail: ids[ids.length - 1] };
  }

  if (chain.k === "branched") {
    // n backbone carbons, a methyl hung off each position in `me` (1-based).
    const ids = [];
    for (let i = 0; i < chain.n; i++) ids.push(self.add("C"));
    for (let i = 0; i + 1 < ids.length; i++) self.bond(ids[i], ids[i + 1], 1);
    (chain.me || []).forEach(function (pos) {
      const m = self.add("C");
      self.bond(ids[pos - 1], m, 1);
    });
    return { head: ids[0], tail: ids[ids.length - 1] };
  }

  if (chain.k === "aryl") {
    const r = [];
    for (let i = 0; i < 6; i++) r.push(self.add("C"));
    // Kekule ring: alternate 2,1,2,1,2,1 so every carbon gets one double bond.
    for (let i = 0; i < 6; i++) self.bond(r[i], r[(i + 1) % 6], i % 2 === 0 ? 2 : 1);
    const at = { "1,4": 3, "1,3": 2, "1,2": 1 }[chain.sub];
    return { head: r[0], tail: r[at] };
  }

  if (chain.k === "ring6sat") {
    const r = [];
    for (let i = 0; i < 6; i++) r.push(self.add("C"));
    for (let i = 0; i < 6; i++) self.bond(r[i], r[(i + 1) % 6], 1);
    const at = { "1,4": 3, "1,3": 2, "1,2": 1 }[chain.sub];
    return { head: r[0], tail: r[at] };
  }

  if (chain.k === "furan") {
    // 2,5-furandiyl
    const o = self.add("O"), c2 = self.add("C"), c3 = self.add("C"), c4 = self.add("C"), c5 = self.add("C");
    self.bond(o, c2, 1); self.bond(c2, c3, 2); self.bond(c3, c4, 1); self.bond(c4, c5, 2); self.bond(c5, o, 1);
    return { head: c2, tail: c5 };
  }

  if (chain.k === "naph") {
    // 2,6-naphthalenediyl; two fused rings sharing C4a/C8a.
    const c = [];
    for (let i = 0; i < 10; i++) c.push(self.add("C"));
    const i1 = 0, i2 = 1, i3 = 2, i4 = 3, i4a = 4, i5 = 5, i6 = 6, i7 = 7, i8 = 8, i8a = 9;
    self.bond(c[i1], c[i2], 2); self.bond(c[i2], c[i3], 1); self.bond(c[i3], c[i4], 2);
    self.bond(c[i4], c[i4a], 1); self.bond(c[i4a], c[i8a], 2); self.bond(c[i8a], c[i1], 1);
    self.bond(c[i4a], c[i5], 1); self.bond(c[i5], c[i6], 2); self.bond(c[i6], c[i7], 1);
    self.bond(c[i7], c[i8], 2); self.bond(c[i8], c[i8a], 1);
    return { head: c[i2], tail: c[i6] };
  }

  if (chain.k === "biphenyl") {
    const mk = function () {
      const r = [];
      for (let i = 0; i < 6; i++) r.push(self.add("C"));
      for (let i = 0; i < 6; i++) self.bond(r[i], r[(i + 1) % 6], i % 2 === 0 ? 2 : 1);
      return r;
    };
    const a = mk(), b = mk();
    self.bond(a[3], b[0], 1);          // 4,4' link
    return { head: a[0], tail: b[3] };
  }

  if (chain.k === "bisphenolA") {
    // -Ar-C(CH3)2-Ar- ; the O on each side comes from the backbone, so the
    // spacer itself is the two rings and the isopropylidene bridge.
    const mk = function () {
      const r = [];
      for (let i = 0; i < 6; i++) r.push(self.add("C"));
      for (let i = 0; i < 6; i++) self.bond(r[i], r[(i + 1) % 6], i % 2 === 0 ? 2 : 1);
      return r;
    };
    const a = mk();
    const q = self.add("C"), m1 = self.add("C"), m2 = self.add("C");
    const b = mk();
    self.bond(a[3], q, 1); self.bond(q, m1, 1); self.bond(q, m2, 1); self.bond(q, b[0], 1);
    return { head: a[0], tail: b[3] };
  }

  if (chain.k === "neopentyl") {
    const a = self.add("C"), q = self.add("C"), b = self.add("C"), m1 = self.add("C"), m2 = self.add("C");
    self.bond(a, q, 1); self.bond(q, b, 1); self.bond(q, m1, 1); self.bond(q, m2, 1);
    return { head: a, tail: b };
  }

  if (chain.k === "chdm") {
    const a = self.add("C");
    const r = [];
    for (let i = 0; i < 6; i++) r.push(self.add("C"));
    for (let i = 0; i < 6; i++) self.bond(r[i], r[(i + 1) % 6], 1);
    const b = self.add("C");
    self.bond(a, r[0], 1); self.bond(r[3], b, 1);
    return { head: a, tail: b };
  }

  throw new Error("unknown spacer " + chain.k);
};

// -X-<spacer>-X-CO-<spacer>-CO-   X = O (ester) or N (amide)
function buildUnit(hetero, diChain, acidChain) {
  const B = new Builder();
  const x1 = B.add(hetero);
  const sp = B.spacer(diChain);
  if (!sp) throw new Error("the diol/diamine must have a backbone");
  B.bond(x1, sp.head, 1);
  const x2 = B.add(hetero);
  B.bond(sp.tail, x2, 1);
  const c1 = B.add("C");
  B.bond(x2, c1, 1);
  const o1 = B.add("O");
  B.bond(c1, o1, 2);
  const mid = B.spacer(acidChain);
  const c2 = B.add("C");
  if (mid) { B.bond(c1, mid.head, 1); B.bond(mid.tail, c2, 1); }
  else { B.bond(c1, c2, 1); }
  const o2 = B.add("O");
  B.bond(c2, o2, 2);
  B.atoms.push({ id: "S0", el: "*" });
  B.atoms.push({ id: "S1", el: "*" });
  B.bonds.unshift({ a: "S0", b: x1, order: 1 });
  B.bond(c2, "S1", 1);
  return { atoms: B.atoms, bonds: B.bonds };
}

// ===================================================================
// Molecular formulae
// ===================================================================

// Molecular formula of a monomer, derived from the same `chain` spec the
// structure builder uses.
//
// This exists so a registry hit can be CHECKED rather than trusted. EPA SRS
// answers a name query with a polymeric formula - (C6H14O2.C6H10O4)x for
// poly(hexylene adipate) - and if the two components of that formula are not
// the diol and the diacid we asked about, the record is something else and the
// hit is discarded. A name search alone cannot tell the difference.

const VALENCE = { C: 4, N: 3, O: 2, S: 2, H: 1 };

// Build the free monomer: the spacer, capped with the functional groups.
//   diol    HO-R-OH          group = "OH"
//   diacid  HOOC-R-COOH      group = "COOH"
//   diamine H2N-R-NH2        group = "NH2"
function monomerFormula(chain, group) {
  // Simplest correct route: ask build-unit for the ester repeat unit of this
  // block against oxalate-with-no-spacer, then count what the block itself
  // contributed. That is fiddly; counting the spec directly is clearer.
  const counts = { C: 0, H: 0, N: 0, O: 0, S: 0 };
  const heavy = [];           // [el, bondOrderSumWithinSkeleton]
  const addEl = function (el) { heavy.push({ el: el, deg: 0 }); return heavy.length - 1; };
  const link = function (i, j, o) { heavy[i].deg += o; heavy[j].deg += o; };

  let head = null, tail = null;
  if (!chain) return null;

  if (chain.k === "linear") {
    if (!chain.els.length) { head = tail = null; }
    else {
      const ids = chain.els.map(addEl);
      for (let i = 0; i + 1 < ids.length; i++) link(ids[i], ids[i + 1], (chain.orders && chain.orders[i]) || 1);
      head = ids[0]; tail = ids[ids.length - 1];
    }
  } else if (chain.k === "branched") {
    const ids = [];
    for (let i = 0; i < chain.n; i++) ids.push(addEl("C"));
    for (let i = 0; i + 1 < ids.length; i++) link(ids[i], ids[i + 1], 1);
    (chain.me || []).forEach(function (pos) { const m = addEl("C"); link(ids[pos - 1], m, 1); });
    head = ids[0]; tail = ids[ids.length - 1];
  } else if (chain.k === "aryl" || chain.k === "ring6sat") {
    const r = [];
    for (let i = 0; i < 6; i++) r.push(addEl("C"));
    for (let i = 0; i < 6; i++) link(r[i], r[(i + 1) % 6], chain.k === "aryl" && i % 2 === 0 ? 2 : 1);
    const at = { "1,4": 3, "1,3": 2, "1,2": 1 }[chain.sub];
    head = r[0]; tail = r[at];
  } else if (chain.k === "furan") {
    const o = addEl("O"), c2 = addEl("C"), c3 = addEl("C"), c4 = addEl("C"), c5 = addEl("C");
    link(o, c2, 1); link(c2, c3, 2); link(c3, c4, 1); link(c4, c5, 2); link(c5, o, 1);
    head = c2; tail = c5;
  } else if (chain.k === "naph") {
    const c = [];
    for (let i = 0; i < 10; i++) c.push(addEl("C"));
    link(c[0], c[1], 2); link(c[1], c[2], 1); link(c[2], c[3], 2); link(c[3], c[4], 1);
    link(c[4], c[9], 2); link(c[9], c[0], 1); link(c[4], c[5], 1); link(c[5], c[6], 2);
    link(c[6], c[7], 1); link(c[7], c[8], 2); link(c[8], c[9], 1);
    head = c[1]; tail = c[6];
  } else if (chain.k === "biphenyl" || chain.k === "bisphenolA") {
    const mk = function () {
      const r = [];
      for (let i = 0; i < 6; i++) r.push(addEl("C"));
      for (let i = 0; i < 6; i++) link(r[i], r[(i + 1) % 6], i % 2 === 0 ? 2 : 1);
      return r;
    };
    const a = mk();
    let b;
    if (chain.k === "biphenyl") { b = mk(); link(a[3], b[0], 1); }
    else {
      const q = addEl("C"), m1 = addEl("C"), m2 = addEl("C");
      b = mk();
      link(a[3], q, 1); link(q, m1, 1); link(q, m2, 1); link(q, b[0], 1);
    }
    head = a[0]; tail = b[3];
  } else if (chain.k === "neopentyl") {
    const a = addEl("C"), q = addEl("C"), b = addEl("C"), m1 = addEl("C"), m2 = addEl("C");
    link(a, q, 1); link(q, b, 1); link(q, m1, 1); link(q, m2, 1);
    head = a; tail = b;
  } else if (chain.k === "chdm") {
    const a = addEl("C");
    const r = [];
    for (let i = 0; i < 6; i++) r.push(addEl("C"));
    for (let i = 0; i < 6; i++) link(r[i], r[(i + 1) % 6], 1);
    const b = addEl("C");
    link(a, r[0], 1); link(r[3], b, 1);
    head = a; tail = b;
  } else {
    return null;
  }

  // Cap both ends with the functional group.
  const capEnd = function (at) {
    if (group === "OH") { const o = addEl("O"); if (at !== null) link(at, o, 1); return; }
    if (group === "NH2") { const n = addEl("N"); if (at !== null) link(at, n, 1); return; }
    // COOH
    const c = addEl("C"), o1 = addEl("O"), o2 = addEl("O");
    link(c, o1, 2); link(c, o2, 1);
    if (at !== null) link(at, c, 1);
    return c;
  };
  if (head === null) {
    // oxalic acid: the two COOH carbons bond to each other
    const c1 = capEnd(null), c2 = capEnd(null);
    link(c1, c2, 1);
  } else {
    capEnd(head);
    if (tail !== head) capEnd(tail); else capEnd(head);
  }

  heavy.forEach(function (a) {
    counts[a.el] = (counts[a.el] || 0) + 1;
    counts.H += Math.max(0, (VALENCE[a.el] || 4) - a.deg);
  });

  let s = "C" + (counts.C > 1 ? counts.C : "") + "H" + (counts.H > 1 ? counts.H : "");
  ["N", "O", "S"].forEach(function (el) {
    if (counts[el]) s += el + (counts[el] > 1 ? counts[el] : "");
  });
  return s;
}

// Molecular formula of a repeat unit as built, in the form EPA prints for a
// structure-based polymer name: nylon 6,6 is (C12H22N2O2)n. The two star atoms
// are chain continuations, so a bond to a star counts as a real bond and the
// atom does not pick up a hydrogen there.
function repeatUnitFormula(atoms, bonds) {
  const deg = {};
  atoms.forEach(function (a) { deg[String(a.id)] = 0; });
  bonds.forEach(function (b) {
    deg[String(b.a)] = (deg[String(b.a)] || 0) + (b.order || 1);
    deg[String(b.b)] = (deg[String(b.b)] || 0) + (b.order || 1);
  });
  const counts = { C: 0, H: 0, N: 0, O: 0, S: 0 };
  atoms.forEach(function (a) {
    if (a.el === "*") return;
    counts[a.el] = (counts[a.el] || 0) + 1;
    counts.H += Math.max(0, (VALENCE[a.el] || 4) - deg[String(a.id)]);
  });
  let s = "C" + (counts.C > 1 ? counts.C : "") + "H" + (counts.H > 1 ? counts.H : "");
  ["N", "O", "S"].forEach(function (el) { if (counts[el]) s += el + (counts[el] > 1 ? counts[el] : ""); });
  return s;
}

// ===================================================================
// Monomer names
// ===================================================================

// Common (not index) monomer names, for the `monomer` field. The library
// writes these the way a chemist orders them: "1,4-Butanediol + succinic acid".
const ACID_COMMON = {
  oxalate: "oxalic acid", malonate: "malonic acid", succinate: "succinic acid",
  glutarate: "glutaric acid", adipate: "adipic acid", pimelate: "pimelic acid",
  suberate: "suberic acid", azelate: "azelaic acid", sebacate: "sebacic acid",
  undecanedioate: "undecanedioic acid", dodecanedioate: "dodecanedioic acid",
  brassylate: "brassylic acid", tetradecanedioate: "tetradecanedioic acid",
  hexadecanedioate: "hexadecanedioic acid", fumarate: "fumaric acid",
  maleate: "maleic acid", itaconate: "itaconic acid", diglycolate: "diglycolic acid",
  thiodipropionate: "3,3'-thiodipropionic acid", terephthalate: "terephthalic acid",
  isophthalate: "isophthalic acid", phthalate: "phthalic acid",
  naphthalate: "2,6-naphthalenedicarboxylic acid", furanoate: "2,5-furandicarboxylic acid",
  cyclohexanedicarboxylate: "1,4-cyclohexanedicarboxylic acid",
  biphenyldicarboxylate: "4,4'-biphenyldicarboxylic acid"
};
const DIOL_COMMON = {
  ethylene: "ethylene glycol", trimethylene: "1,3-propanediol", butylene: "1,4-butanediol",
  pentylene: "1,5-pentanediol", hexylene: "1,6-hexanediol", heptylene: "1,7-heptanediol",
  octylene: "1,8-octanediol", nonylene: "1,9-nonanediol", decylene: "1,10-decanediol",
  undecylene: "1,11-undecanediol", dodecylene: "1,12-dodecanediol",
  tetradecylene: "1,14-tetradecanediol", hexadecylene: "1,16-hexadecanediol",
  propylene12: "1,2-propanediol", butylene13: "1,3-butanediol", butylene23: "2,3-butanediol",
  methylpropylene: "2-methyl-1,3-propanediol", methylpentylene: "3-methyl-1,5-pentanediol",
  neopentylene: "neopentyl glycol", diethyleneglycol: "diethylene glycol",
  triethyleneglycol: "triethylene glycol",
  cyclohexylenedimethylene: "1,4-cyclohexanedimethanol",
  cyclohexylene14: "1,4-cyclohexanediol", hydroquinone: "hydroquinone",
  resorcinol: "resorcinol", bisphenolA: "bisphenol A", isosorbide: "isosorbide"
};
const AMINE_COMMON = {
  "2": "ethylenediamine", "3": "1,3-propanediamine", "4": "1,4-butanediamine",
  "5": "1,5-pentanediamine", "6": "hexamethylenediamine", "7": "1,7-heptanediamine",
  "8": "1,8-octanediamine", "9": "1,9-nonanediamine", "10": "1,10-decanediamine",
  "11": "1,11-undecanediamine", "12": "1,12-dodecanediamine", "13": "1,13-tridecanediamine",
  pPhenylene: "p-phenylenediamine", mPhenylene: "m-phenylenediamine",
  mXylylene: "m-xylylenediamine", piperazine: "piperazine"
};

// ===================================================================
// Notes
// ===================================================================

// Notes for generated polyester entries.
//
// Every sentence here is a consequence of the repeat unit, or a fact about
// where a monomer comes from. Nothing is a measured value: no Tg, no Tm, no
// mechanical or barrier numbers, because this script has no source for them
// and the library requires a `tgSource`/`tmSource` for any that it carries.
// The phrasing varies because the chemistry varies, not to disguise a template.

const DIOL_CARBONS = {
  ethylene: 2, trimethylene: 3, butylene: 4, pentylene: 5, hexylene: 6,
  heptylene: 7, octylene: 8, nonylene: 9, decylene: 10, undecylene: 11,
  dodecylene: 12, tetradecylene: 14, hexadecylene: 16
};
const ACID_CARBONS = {
  oxalate: 2, malonate: 3, succinate: 4, glutarate: 5, adipate: 6, pimelate: 7,
  suberate: 8, azelate: 9, sebacate: 10, undecanedioate: 11, dodecanedioate: 12,
  brassylate: 13, tetradecanedioate: 14, hexadecanedioate: 16
};

// What the DIOL contributes, beyond chain length.
const DIOL_CHARACTER = {
  neopentylene:
    "Neopentyl glycol puts a quaternary carbon between the two ester oxygens. " +
    "There is no hydrogen on that carbon for a hydroxyl to be abstracted from and no " +
    "way for the chain to pack regularly, so polyesters of it are amorphous and are " +
    "valued in coating resins for resisting hydrolysis and thermal yellowing rather " +
    "than for crystallinity",
  propylene12:
    "1,2-Propanediol esterifies through a secondary as well as a primary hydroxyl, and the " +
    "pendant methyl sits directly on the backbone. Both spoil chain registration, so this is " +
    "an amorphous, low-melting polyester of the kind used as a soft segment and in alkyd resins",
  butylene13:
    "1,3-Butanediol is unsymmetrical - one primary and one secondary hydroxyl - so the repeat " +
    "unit has a direction and the methyl branches off the backbone. Chains cannot register, and " +
    "the polyester stays amorphous",
  butylene23:
    "Both hydroxyls of 2,3-butanediol are secondary and both methyls sit on the backbone, which " +
    "makes esterification slow and the product irregular and amorphous",
  methylpropylene:
    "The methyl on the middle carbon of 2-methyl-1,3-propanediol interrupts packing without " +
    "shortening the chain, which is the usual reason for choosing it over 1,3-propanediol in a resin",
  methylpentylene:
    "3-Methyl-1,5-pentanediol gives a long, flexible, branched spacer. The methyl keeps the " +
    "polyester amorphous and liquid at low molar mass, which is why diols like this are used to " +
    "make polyester polyols rather than fibres",
  cyclohexylenedimethylene:
    "1,4-Cyclohexanedimethanol contributes a saturated six-membered ring in the backbone. The " +
    "ring is rigid but not planar, and the cis and trans isomers behave differently, which is the " +
    "basis of the CHDM copolyesters used where a clear, tough, thick-walled part is wanted",
  cyclohexylene14:
    "Esterifying 1,4-cyclohexanediol directly puts the ring oxygens on the ring itself, giving a " +
    "short, stiff repeat unit",
  hydroquinone:
    "Hydroquinone esterified at both ends gives a fully aromatic, rod-like repeat unit of the sort " +
    "that forms a liquid-crystalline melt",
  resorcinol:
    "Meta substitution on the resorcinol ring kinks the chain, which is what keeps an all-aromatic " +
    "polyester tractable instead of infusible",
  bisphenolA:
    "The isopropylidene bridge of bisphenol A twists the two rings out of plane, so this aromatic " +
    "polyester is amorphous and transparent rather than crystalline",
  diethyleneglycol:
    "The ether oxygen in diethylene glycol adds a flexible, polar hinge, lowering the glass " +
    "transition and raising water sensitivity compared with the all-carbon diol",
  triethyleneglycol:
    "Two ether oxygens per diol residue make this a soft, hydrophilic polyester, closer in feel to " +
    "a polyether than to a packaging polyester",
  isosorbide:
    "Isosorbide is a rigid, fused bicyclic diol with two secondary hydroxyls of unequal reactivity, " +
    "which makes it slow to esterify but attractive as a wholly sugar-derived way to stiffen a chain"
};

// What the DIACID contributes.
const ACID_CHARACTER = {
  terephthalate:
    "Para-linked terephthalate is the rigid, linear aromatic unit that makes this family of " +
    "polyesters crystallise and melt high",
  isophthalate:
    "Meta-linked isophthalate puts a 120-degree kink in the chain, which frustrates crystallisation; " +
    "it is normally used as a comonomer precisely to keep a polyester clear",
  phthalate:
    "Ortho-phthalate links the two esters on adjacent ring carbons, so the chain turns sharply back " +
    "on itself. Polyesters of it do not crystallise and are the backbone of alkyd and unsaturated " +
    "polyester resins rather than of mouldings",
  naphthalate:
    "The 2,6-naphthalate unit is longer and stiffer than terephthalate, and polyesters built on it " +
    "are chosen when a stiffer, less permeable chain is wanted",
  furanoate:
    "The furan ring is shorter and more angled than a benzene ring, so a furanoate polyester is " +
    "stiffer in some respects than its terephthalate counterpart without being a straight substitute " +
    "for it",
  cyclohexanedicarboxylate:
    "A saturated ring in place of an aromatic one removes the UV absorption of a terephthalate while " +
    "keeping much of the stiffness",
  biphenyldicarboxylate:
    "Two para-linked rings make an unusually long, rigid rod of a repeat unit",
  thiodipropionate:
    "The sulfur in the middle of the diacid is a thioether, the functional group that makes " +
    "thiodipropionate esters useful as antioxidants in their own right",
  oxalate:
    "Oxalate is the shortest possible diacid - the two carbonyls are bonded directly to each other - " +
    "which makes the ester unusually electron-poor and easy to hydrolyse",
  malonate:
    "The single carbon between the two carbonyls of malonate is acidic, so this polyester is more " +
    "chemically reactive than its longer-chain relatives",
  fumarate:
    "The trans double bond of fumarate stays in the backbone after polymerisation and is the site " +
    "that later cross-links, which is the whole point of an unsaturated polyester resin",
  maleate:
    "The cis double bond of maleate survives into the backbone and provides the cross-linking site " +
    "of an unsaturated polyester; it tends to isomerise to the trans form on heating",
  itaconate:
    "Itaconate carries its double bond on a side branch rather than in the chain, so it can be " +
    "cross-linked without disturbing the backbone",
  diglycolate:
    "The ether oxygen between the two carbonyls makes diglycolate both more flexible and more " +
    "readily hydrolysed than a plain aliphatic diacid"
};

const PROVENANCE = {
  azelate: "Azelaic acid is made by ozonolysis of oleic acid, so the chain is partly plant-derived",
  sebacate: "Sebacic acid comes from alkali cleavage of castor-oil ricinoleic acid",
  brassylate: "Brassylic acid is derived from erucic acid, a rapeseed fatty acid",
  furanoate: "2,5-Furandicarboxylic acid is made from sugars via HMF, and is the bio-based answer to terephthalic acid",
  succinate: "Succinic acid is now produced by fermentation as well as from maleic anhydride",
  dodecanedioate: "Dodecanedioic acid is made by fermentation of alkanes or from butadiene",
  undecanedioate: "Undecanedioic acid is a fatty-acid derivative",
  trimethylene: "1,3-Propanediol is produced by fermentation of glucose",
  decylene: "1,10-Decanediol is a castor-oil derivative",
  isosorbide: "Isosorbide is made from sorbitol, so it is wholly sugar-derived"
};

function esterNote(dKey, aKey, cas) {
  const bits = [];
  const d = DIOL_CARBONS[dKey], a = ACID_CARBONS[aKey];

  // 1. Whatever is distinctive about the two monomers.
  if (DIOL_CHARACTER[dKey]) bits.push(DIOL_CHARACTER[dKey] + ".");
  if (ACID_CHARACTER[aKey]) bits.push(ACID_CHARACTER[aKey] + ".");

  // 2. Chain-length and parity, but only where both residues are plain
  //    methylene runs, because that is the only case the argument holds for.
  if (d && a) {
    const ch = d + a - 2;
    bits.push("Two esters per " + (ch + 2) + "-atom repeat unit, so " +
      (ch >= 14
        ? "the chain is mostly methylene and behaves largely like a polyethylene interrupted now and then by an ester"
        : ch >= 8
          ? "the methylene runs dominate, which favours crystallinity and keeps water uptake low"
          : "the esters sit close together, leaving the chain polar and comparatively quick to hydrolyse") + ".");
    bits.push(d % 2 === 0 && a % 2 === 0
      ? "Both residues are even-numbered, the case in which successive chains register properly and the series melts highest."
      : "With " + (d % 2 ? "the diol" : "the diacid") + " odd-numbered, the esters alternate out of register, and odd members of these series melt below their even neighbours.");
  } else if (d && !a) {
    // An aliphatic diol against an aromatic or cyclic diacid. Parity does not
    // carry the same meaning here, but spacer length does: lengthening the
    // methylene run between rigid units is the PET-to-PBT-to-PHT trend.
    bits.push("The diol contributes " + d + " methylenes between the aromatic units. Lengthening that spacer " +
      "gives the chain more room to move, which lowers the glass transition and the melting point " +
      "relative to the shorter-diol members of the same series, and speeds up crystallisation from the melt.");
  } else if (!DIOL_CHARACTER[dKey] && !ACID_CHARACTER[aKey]) {
    bits.push("A linear aliphatic polyester, made by melt condensation of the diol with the diacid.");
  }

  // 3. Where a monomer comes from, when that is worth saying.
  if (PROVENANCE[aKey]) bits.push(PROVENANCE[aKey] + ".");
  else if (PROVENANCE[dKey]) bits.push(PROVENANCE[dKey] + ".");

  // The CAS number is NOT repeated here: the result card already shows it on
  // its own line directly above the note, so a closing "Registered as ..."
  // sentence just says the same thing twice.
  return bits.join(" ");
}

// ===================================================================
// Entry assembly
// ===================================================================

// Turns a confirmed pair into a polymer-data.js entry.
//
// Everything here is either mechanical (the name, the monomer field, the
// structure) or a statement that follows from the repeat unit itself (ester or
// amide density, the odd-even packing effect, where the monomer comes from).
// Nothing is a measured property: no Tg, no Tm, no mechanical numbers. Those
// need a source, and this script has none, so it does not write them.

const acid = (k) => DIACIDS.find((a) => a.key === k);
const ol = (k) => DIOLS.find((a) => a.key === k);
const am = (k) => DIAMINES.find((a) => a.key === k);

const ALIPHATIC_ACIDS = Object.keys(ACID_CARBONS);
const isAliphaticAcid = (k) => ALIPHATIC_ACIDS.indexOf(k) !== -1;
const LINEAR_DIOLS = ["ethylene", "trimethylene", "butylene", "pentylene", "hexylene",
  "heptylene", "octylene", "nonylene", "decylene", "undecylene", "dodecylene",
  "tetradecylene", "hexadecylene"];

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ---- notes --------------------------------------------------------------
// Composed from facts about the repeat unit. Varied by what is actually true
// of the pair rather than by picking a phrasing at random, so two entries read
// differently because they ARE different.
function amideNote(bKey, aKey, cas, nylonName) {
  const d = Number(bKey), a = ACID_CARBONS[aKey];
  const bits = [];
  if (d && a) {
    const both = d % 2 === 0 && a % 2 === 0;
    const dens = (d + a) <= 10 ? "high" : (d + a) <= 16 ? "moderate" : "low";
    bits.push("Amide density is " + dens + " for a nylon" +
      (dens === "high" ? ", so the hydrogen-bond sheets are closely spaced and the polymer takes up a noticeable amount of water"
        : dens === "low" ? ", so the long methylene runs dilute the hydrogen bonding and the material behaves more like a tough polyethylene"
        : ", which is the usual compromise between stiffness and moisture pickup") + ".");
    bits.push(both
      ? "Being even-even, every amide can pair with one on the neighbouring chain, which is why this family melts higher than its odd relatives."
      : "An odd monomer means the amides alternate out of register, costing some of the sheet hydrogen bonding and lowering the melting point.");
  }
  if (PROVENANCE[aKey]) bits.push(cap(PROVENANCE[aKey]) + ".");
  else if (PROVENANCE[bKey]) bits.push(cap(PROVENANCE[bKey]) + ".");
  if (cas) bits.push("Registered as " + cas + ".");
  return bits.join(" ");
}

// ---- entries ------------------------------------------------------------
// The library names diol residues of five carbons and up the -methylene way:
// twelve entries say hexamethylene and three say decamethylene, while no entry
// says hexylene or decylene. So for those the -methylene form is the name and
// the -ylene form is the alias, and below five carbons the short form wins
// (ethylene, trimethylene, butylene), which is what the library already uses.
const PREFER_METHYLENE = ["pentylene", "hexylene", "heptylene", "octylene", "nonylene",
  "decylene", "undecylene", "dodecylene", "tetradecylene", "hexadecylene"];

function esterEntry(dKey, aKey, cas) {
  const d = ol(dKey), a = acid(aKey);
  let head = d.alkylene, alias = d.akaAlk;
  if (PREFER_METHYLENE.indexOf(dKey) !== -1 && d.akaAlk) { head = d.akaAlk; alias = d.alkylene; }
  const name = "Poly(" + head + " " + a.acyl + ")";
  const aka = [];
  if (alias) aka.push("Poly(" + alias + " " + a.acyl + ")");
  const tags = ["polyester"];
  if (isAliphaticAcid(aKey) && LINEAR_DIOLS.indexOf(dKey) !== -1) tags.push("biodegradable");
  tags.push("specialty");
  const e = {
    name: name,
    aka: aka,
    monomer: cap(DIOL_COMMON[dKey] || d.alkylene) + " + " + (ACID_COMMON[aKey] || a.acyl),
    cls: "Step-growth (polyester)",
    tags: tags,
    note: esterNote(dKey, aKey, cas),
    verified: false
  };
  if (cas) e.cas = cas;
  if (d.chain && a.chain) { const u = buildUnit("O", d.chain, a.chain); e.atoms = u.atoms; e.bonds = u.bonds; }
  else e.needsStructure = true;
  return e;
}

function amideEntry(bKey, aKey, cas) {
  const b = am(bKey), a = acid(aKey);
  const numeric = /^\d+$/.test(bKey) && ACID_CARBONS[aKey];
  let name, aka = [];
  if (numeric) {
    name = "Nylon " + bKey + "," + ACID_CARBONS[aKey];
    aka = ["PA" + bKey + ACID_CARBONS[aKey], "polyamide " + bKey + "," + ACID_CARBONS[aKey],
      "Poly(" + b.amine + " " + a.acyl.replace(/ate$/, "amide").replace(/oate$/, "amide") + ")"];
  } else {
    name = "Poly(" + b.amine + " " + a.acyl.replace(/ate$/, "amide").replace(/oate$/, "amide") + ")";
  }
  const tags = ["polyamide", "engineering", "specialty"];
  const e = {
    name: name,
    aka: aka,
    monomer: cap(AMINE_COMMON[bKey] || b.amine) + " + " + (ACID_COMMON[aKey] || a.acyl),
    cls: "Step-growth (polyamide)",
    tags: tags,
    note: numeric ? amideNote(bKey, aKey, cas, name) : "",
    verified: false
  };
  if (cas) e.cas = cas;
  if (b.chain && a.chain) { const u = buildUnit("N", b.chain, a.chain); e.atoms = u.atoms; e.bonds = u.bonds; }
  else e.needsStructure = true;
  return e;
}
// ===================================================================
// Registry lookup
// ===================================================================

const fs = require("fs");
const https = require("https");
const path = require("path");

const CACHE_FILE = path.join(__dirname, ".step-growth-cache.json");
let cache = {};
try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")); } catch (e) {}
let dirty = 0;
function saveCache() { if (dirty) { fs.writeFileSync(CACHE_FILE, JSON.stringify(cache)); dirty = 0; } }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function get(url) {
  return new Promise(function (resolve) {
    const req = https.get(url, { headers: { "User-Agent": "polytechniques-data-check" } }, function (res) {
      let b = "";
      res.on("data", function (d) { b += d; });
      res.on("end", function () { resolve({ status: res.statusCode, body: b }); });
    });
    req.on("error", function () { resolve({ status: 0, body: "" }); });
    req.setTimeout(30000, function () { req.destroy(); resolve({ status: 0, body: "" }); });
  });
}

// A throttled or dropped response is NOT an answer. An earlier version retried
// once and then cached the failure as "no such polymer", which turned an HTTP
// 429 into a false negative; 556 cached misses had to be thrown away when that
// surfaced. Back off until the service answers, and never cache anything that
// is not a real 200 or 404.
async function fetchJson(url) {
  let r = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    r = await get(url);
    if (r.status === 200 || r.status === 404) break;
    await sleep(2500 * (attempt + 1));
    r = null;
  }
  if (!r) return null;
  if (r.status !== 200) return [];
  try { return JSON.parse(r.body); } catch (e) { return []; }
}

async function epaByName(name) {
  const key = "epa:" + name;
  if (Object.prototype.hasOwnProperty.call(cache, key)) return cache[key];
  const recs = await fetchJson("https://cdxapps.epa.gov/oms-substance-registry-services/rest-api/substance/name/" +
    encodeURIComponent(name));
  if (recs === null) return null;
  const slim = (recs || []).slice(0, 12).map(function (x) {
    return { cas: x.currentCasNumber || null, name: x.epaName || x.systematicName || null, formula: x.molecularFormula || null };
  });
  cache[key] = slim;
  if (++dirty >= 25) saveCache();
  await sleep(120);
  return slim;
}

// "(C6H14O2.C6H10O4)x" -> ["C6H14O2","C6H10O4"]; null when not polymeric.
function polymerComponents(formula) {
  if (!formula) return null;
  const m = /^\(([^()]+)\)[xn]$/i.exec(String(formula).trim());
  if (!m) return null;
  return m[1].split(".").map(function (s) { return s.trim(); });
}

async function confirm(a, b, groupA, groupB, builtUnitFormula) {
  const fa = a.chain ? monomerFormula(a.chain, groupA) : null;
  const fb = b.chain ? monomerFormula(b.chain, groupB) : null;
  const forms = [a.idx + ", polymer with " + b.idx];
  (a.alt || []).forEach(function (x) { forms.push(x + ", polymer with " + b.idx); });
  (b.alt || []).forEach(function (y) { forms.push(a.idx + ", polymer with " + y); });
  for (const nm of forms) {
    const recs = await epaByName(nm);
    if (recs === null) return { ok: false, transient: true };
    for (const rec of recs) {
      const comps = polymerComponents(rec.formula);
      if (!comps) continue;
      if (fa && fb && comps.length >= 2 && comps.indexOf(fa) !== -1 && comps.indexOf(fb) !== -1) {
        return { ok: true, cas: rec.cas, via: nm, formula: rec.formula, by: "components" };
      }
      if (builtUnitFormula && comps.length === 1 && comps[0] === builtUnitFormula) {
        return { ok: true, cas: rec.cas, via: nm, formula: rec.formula, by: "repeat-unit" };
      }
    }
  }
  return { ok: false };
}

// ===================================================================
// Commands
// ===================================================================

const ROOT = path.join(__dirname, "..");
function loadDb() {
  return new Function("window", fs.readFileSync(path.join(ROOT, "polymer-data.js"), "utf8") +
    "\nreturn window.POLYMER_DB;")({});
}

function cmdVerify() {
  const G = require(path.join(ROOT, "polymer-graph.js"));
  const db = loadDb();
  const A = (k) => DIACIDS.find((x) => x.key === k);
  const O = (k) => DIOLS.find((x) => x.key === k);
  const N = (k) => DIAMINES.find((x) => x.key === k);
  const CASES = [
    ["Poly(butylene succinate)", "O", O("butylene"), A("succinate")],
    ["Poly(ethylene succinate)", "O", O("ethylene"), A("succinate")],
    ["Poly(ethylene adipate)", "O", O("ethylene"), A("adipate")],
    ["Poly(ethylene terephthalate)", "O", O("ethylene"), A("terephthalate")],
    ["Poly(butylene terephthalate)", "O", O("butylene"), A("terephthalate")],
    ["Poly(trimethylene terephthalate)", "O", O("trimethylene"), A("terephthalate")],
    ["Poly(ethylene naphthalate)", "O", O("ethylene"), A("naphthalate")],
    ["Nylon 6,6", "N", N("6"), A("adipate")],
    ["Nylon 6,10", "N", N("6"), A("sebacate")],
    ["Nylon 4,6", "N", N("4"), A("adipate")],
    ["Nylon 6,12", "N", N("6"), A("dodecanedioate")],
    ["Nylon 10,10", "N", N("10"), A("sebacate")],
    ["Poly(p-phenylene terephthalamide)", "N", N("pPhenylene"), A("terephthalate")],
    ["Poly(m-phenylene isophthalamide)", "N", N("mPhenylene"), A("isophthalate")],
    ["Poly(hexamethylene terephthalamide)", "N", N("6"), A("terephthalate")]
  ];
  let pass = 0, fail = 0;
  CASES.forEach(function (c) {
    const e = db.find((x) => x.name === c[0]);
    if (!e || !e.atoms) { console.log("  --      " + c[0] + " (not in the library)"); return; }
    const got = buildUnit(c[1], c[2].chain, c[3].chain);
    if (G.wlHash(e.atoms, e.bonds) === G.wlHash(got.atoms, got.bonds)) { pass++; console.log("  match   " + c[0]); }
    else { fail++; console.log("  DIFFER  " + c[0]); }
  });
  console.log("  " + pass + " of " + CASES.length + " hand-drawn repeat units reproduced");

  let built = 0, bad = 0;
  [["O", DIOLS], ["N", DIAMINES]].forEach(function (p) {
    p[1].forEach(function (b) {
      DIACIDS.forEach(function (a) {
        if (!b.chain || !a.chain) return;
        const u = buildUnit(p[0], b.chain, a.chain);
        built++;
        const over = G.overValentAtoms(u.atoms, u.bonds);
        if (over && over.length) { bad++; console.log("  over-valent: " + p[0] + " " + b.key + " x " + a.key); }
      });
    });
  });
  console.log("  " + built + " repeat units built, " + bad + " with a valence problem");
  process.exit(fail || bad ? 1 : 0);
}

async function cmdSweep() {
  const OUT = path.join(__dirname, "step-growth-sweep.json");
  let done = {};
  try { done = JSON.parse(fs.readFileSync(OUT, "utf8")); } catch (e) {}
  let n = 0, hits = 0;
  const total = DIOLS.length * DIACIDS.length;
  for (const d of DIOLS) {
    for (const a of DIACIDS) {
      const id = d.key + ":" + a.key;
      n++;
      if (done[id]) { if (done[id].ok) hits++; continue; }
      let ruf = null;
      if (d.chain && a.chain) { const u = buildUnit("O", d.chain, a.chain); ruf = repeatUnitFormula(u.atoms, u.bonds); }
      const r = await confirm(a, d, "COOH", "OH", ruf);
      if (r.transient) {
        console.error("the registry stopped answering at " + id + "; stopping rather than recording silence as absence");
        fs.writeFileSync(OUT, JSON.stringify(done, null, 1)); saveCache();
        process.exit(2);
      }
      done[id] = r.ok ? { ok: true, cas: r.cas, formula: r.formula, by: r.by } : { ok: false };
      if (r.ok) { hits++; console.log("[" + n + "/" + total + "] " + id + "  " + (r.cas || "(no cas)") + "  " + r.formula); }
      if (n % 50 === 0) { fs.writeFileSync(OUT, JSON.stringify(done, null, 1)); saveCache(); }
    }
  }
  fs.writeFileSync(OUT, JSON.stringify(done, null, 1));
  saveCache();
  console.log("\n" + hits + " registered polymers of " + total + " enumerated pairs");
}

function cmdReport() {
  const G = require(path.join(ROOT, "polymer-graph.js"));
  const OUT = path.join(__dirname, "step-growth-sweep.json");
  let sweep = null;
  try { sweep = JSON.parse(fs.readFileSync(OUT, "utf8")); } catch (e) {
    console.error("no sweep on disk yet - run with --sweep first");
    process.exit(1);
  }
  const db = loadDb();
  const lk = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const byName = new Map();
  db.forEach(function (p) {
    byName.set(lk(p.name), p);
    (p.aka || []).forEach(function (a) { if (!byName.has(lk(a))) byName.set(lk(a), p); });
  });
  const byHash = new Map();
  db.forEach(function (p) { if (p.atoms) { const h = G.wlHash(p.atoms, p.bonds); if (!byHash.has(h)) byHash.set(h, p); } });

  const fresh = [], backfill = [], conflict = [];
  Object.keys(sweep).sort().forEach(function (k) {
    if (!sweep[k].ok) return;
    const parts = k.split(":");
    const e = esterEntry(parts[0], parts[1], sweep[k].cas);
    let hit = byName.get(lk(e.name));
    if (!hit) (e.aka || []).some(function (x) { hit = byName.get(lk(x)); return !!hit; });
    if (!hit && e.atoms) hit = byHash.get(G.wlHash(e.atoms, e.bonds));
    if (!hit) { fresh.push(e.name + "  " + (e.cas || "(no cas)")); return; }
    if (!hit.cas && sweep[k].cas) backfill.push(hit.name + "  " + sweep[k].cas);
    else if (hit.cas && sweep[k].cas && hit.cas !== sweep[k].cas) {
      conflict.push(hit.name + "  library " + hit.cas + " vs registry " + sweep[k].cas);
    }
  });
  console.log("not yet in the library (" + fresh.length + "):");
  fresh.forEach(function (x) { console.log("  + " + x); });
  console.log("");
  console.log("in the library but carrying no CAS (" + backfill.length + "):");
  backfill.forEach(function (x) { console.log("  ~ " + x); });
  console.log("");
  console.log("CAS disagreements (" + conflict.length + ") - CAS registers some polymers twice by synthesis route, so these need a human:");
  conflict.forEach(function (x) { console.log("  ! " + x); });
}

const mode = process.argv[2];
if (mode === "--verify") cmdVerify();
else if (mode === "--sweep") cmdSweep();
else if (mode === "--report") cmdReport();
else {
  console.log("usage: node scripts/discover-step-growth.js [--verify|--sweep|--report]");
  process.exit(1);
}
