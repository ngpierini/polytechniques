// Curated reference library of common homopolymer repeat units.
//
// © 2025-2026 Nicholas Pierini. All rights reserved. This dataset (the
// selection, arrangement, naming, and structural encoding of the repeat
// units below) is proprietary to PolyTechniques (getpolytechniques.com) and
// is provided solely for use on that site. Copying, extracting, or reusing
// it elsewhere is prohibited without written permission. The copyright and
// signature notices here and in POLYMER_DB_META are copyright management
// information; removing or altering them is independently unlawful.
// Dataset signature: PT-DB-f42f549c0d74a6c90d1c2dd9cba3e442
//
// Each repeat unit is drawn the way a chemist would bracket it from its
// monomer (two backbone atoms for a vinyl/acrylic polymer, the AABB unit for
// a step-growth polyamide/polyester, etc.) - the same convention used by the
// "Load example" buttons in the structure editor. Two atoms with element "*"
// mark the two open chain ends where the repeat unit connects to its
// neighbors; they are required for structure search to work and are not
// meant to be drawn by hand.
//
// Tg/Tm values are typical literature figures included for reference only,
// not certified data - actual values vary with tacticity, crystallinity,
// and molecular weight. Always verify against a primary source before
// relying on a number here.
window.POLYMER_DB = [
  {
    name: "Polyethylene", aka: ["PE", "HDPE", "LDPE", "polyethene"], monomer: "Ethylene",
    cls: "Addition (vinyl)", cas: "9002-88-4", tg: "-110 °C", tm: "130 °C (HDPE)",
    tags: ["commodity", "packaging"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Polypropylene", aka: ["PP", "polypropene"], monomer: "Propylene",
    cls: "Addition (vinyl)", cas: "9003-07-0", tg: "-10 °C", tm: "165 °C (isotactic)",
    tags: ["commodity", "packaging"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Polystyrene", aka: ["PS"], monomer: "Styrene", cls: "Addition (vinyl)", cas: "9003-53-6",
    tg: "100 °C", tags: ["commodity", "packaging"],
    note: "Ordinary atactic PS is amorphous, so only Tg applies; the 250 °C melting point in Odian's Table 1-3 is for the crystalline (stereoregular) form.",
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" },
      { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 },
      { a: 3, b: 4, order: 2 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 },
      { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 8, b: 3, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Poly(vinyl chloride)", aka: ["PVC"], monomer: "Vinyl chloride", cls: "Addition (vinyl)",
    cas: "9002-86-2", tg: "80 °C", tags: ["commodity", "vinyl-halide", "packaging"],
    note: "Commercial PVC is nearly amorphous (only slight crystallinity), so it is used for its Tg; the 273 °C melting point in Odian's Table 1-3 is for the crystalline form.",
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "Cl" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Poly(vinylidene chloride)", aka: ["PVDC", "Saran"], monomer: "Vinylidene chloride",
    cls: "Addition (vinyl)", cas: "9002-85-1", tg: "-18 °C", tm: "190 °C",
    tags: ["vinyl-halide", "packaging"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "Cl" }, { id: 4, el: "Cl" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Polytetrafluoroethylene", aka: ["PTFE", "Teflon"], monomer: "Tetrafluoroethylene",
    cls: "Addition (vinyl)", cas: "9002-84-0", tm: "327 °C", tags: ["engineering", "fluoropolymer"],
    note: "Multiple sub-ambient and near-ambient transitions are reported instead of a single clean Tg. Standard handbook tables (Brandrup, Odian's Table 1-3) nonetheless quote a Tg near 117 °C.",
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "F" }, { id: 4, el: "F" }, { id: 5, el: "F" }, { id: 6, el: "F" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 1, b: 3, order: 1 }, { a: 1, b: 4, order: 1 }, { a: 2, b: 5, order: 1 }, { a: 2, b: 6, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Poly(vinylidene fluoride)", aka: ["PVDF"], monomer: "Vinylidene fluoride", cls: "Addition (vinyl)",
    cas: "24937-79-9", tg: "-35 °C", tm: "170 °C", tags: ["engineering", "fluoropolymer"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "F" }, { id: 4, el: "F" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Poly(vinyl fluoride)", aka: ["PVF"], monomer: "Vinyl fluoride", cls: "Addition (vinyl)",
    cas: "24981-14-4", tg: "-20 °C", tm: "200 °C", tags: ["fluoropolymer"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "F" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Poly(vinyl acetate)", aka: ["PVAc"], monomer: "Vinyl acetate", cls: "Addition (vinyl)",
    cas: "9003-20-7", tg: "30 °C", tags: ["coating", "adhesive"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "O" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Poly(vinyl alcohol)", aka: ["PVA", "PVOH"], monomer: "Vinyl alcohol (via PVAc hydrolysis)",
    cls: "Addition (vinyl)", cas: "9002-89-5", tg: "85 °C", tm: "230 °C", tags: ["water-soluble", "packaging"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Polyacrylonitrile", aka: ["PAN"], monomer: "Acrylonitrile", cls: "Addition (vinyl)",
    cas: "25014-41-9", tg: "95 °C", tags: ["fiber", "engineering"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "N" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 3 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Poly(methyl acrylate)", aka: ["PMA"], monomer: "Methyl acrylate", cls: "Addition (acrylate)",
    cas: "9003-21-8", tg: "10 °C", tags: ["acrylic"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Poly(methyl methacrylate)", aka: ["PMMA", "acrylic glass", "Plexiglass"], monomer: "Methyl methacrylate",
    cls: "Addition (methacrylate)", cas: "9011-14-7", tg: "105 °C", tags: ["acrylic", "methacrylate", "engineering"],
    note: "Commercial PMMA is atactic and amorphous (Tg only); the 220 °C melting point in Odian's Table 1-3 refers to the crystalline stereoregular form.",
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Poly(ethyl acrylate)", aka: ["PEA"], monomer: "Ethyl acrylate", cls: "Addition (acrylate)",
    cas: "9003-32-1", tg: "-24 °C", tags: ["acrylic"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Polyacrylamide", aka: ["PAM"], monomer: "Acrylamide", cls: "Addition (vinyl)",
    cas: "9003-05-8", tg: "165 °C (dry)", tags: ["water-soluble"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: 5, el: "N" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 3, b: 5, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Poly(acrylic acid)", aka: ["PAA"], monomer: "Acrylic acid", cls: "Addition (vinyl)",
    cas: "9003-01-4", tg: "106 °C", tags: ["acrylic", "water-soluble", "biomedical"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: 5, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 3, b: 5, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Poly(methacrylic acid)", aka: ["PMAA"], monomer: "Methacrylic acid", cls: "Addition (methacrylate)",
    cas: "25087-26-7", tg: "185 °C (dry)", tags: ["acrylic", "water-soluble"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Poly(N-isopropylacrylamide)", aka: ["PNIPAM", "PNIPAAm"], monomer: "N-isopropylacrylamide",
    cls: "Addition (vinyl)", cas: "25189-55-3", tg: "130 °C (dry)", tags: ["acrylic", "biomedical", "water-soluble"],
    note: "Best known for its LCST (~32 °C in water), a solution cloud point, not the same property as Tg.",
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: 5, el: "N" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 6, b: 8, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Poly(2-hydroxyethyl methacrylate)", aka: ["PHEMA", "pHEMA"], monomer: "2-Hydroxyethyl methacrylate",
    cls: "Addition (methacrylate)", cas: "25249-16-5", tg: "55 °C", tags: ["acrylic", "methacrylate", "biomedical"],
    note: "Common hydrogel-forming polymer (contact lenses) once hydrated.",
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Poly(N-vinylpyrrolidone)", aka: ["PVP", "povidone"], monomer: "N-Vinylpyrrolidone", cls: "Addition (vinyl)",
    cas: "9003-39-8", tg: "175 °C (dry)", tags: ["water-soluble", "biomedical"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "N" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 3, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Poly(4-vinylpyridine)", aka: ["P4VP"], monomer: "4-Vinylpyridine", cls: "Addition (vinyl)",
    cas: "9003-68-3", tg: "150 °C", tags: ["specialty"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "N" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 8, b: 3, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Polyisobutylene", aka: ["PIB", "butyl rubber base"], monomer: "Isobutylene", cls: "Addition (vinyl)",
    cas: "9003-27-4", tg: "-70 °C", tags: ["elastomer"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Polychloroprene", aka: ["Neoprene"], monomer: "Chloroprene", cls: "Addition (diene)",
    cas: "9010-98-4", tg: "-43 °C", tm: "45 °C", tags: ["elastomer", "vinyl-halide"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "Cl" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 2 }, { a: 4, b: 5, order: 1 }, { a: 5, b: "S1", order: 1 }]
  },
  {
    name: "Polyisoprene (cis-1,4)", aka: ["Natural rubber", "NR"], monomer: "Isoprene", cls: "Addition (diene)",
    cas: "9003-31-0", tg: "-70 °C", tm: "28 °C", tags: ["elastomer"],
    note: "Nearly amorphous at room temperature (crystalline Tm near 28 °C, Odian's Table 8-1). The trans-1,4 isomer, gutta-percha, is a harder, more crystalline, thermoplastic-like material (Tg near -58 °C, Tm near 74 °C).",
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 2 }, { a: 4, b: 5, order: 1 }, { a: 5, b: "S1", order: 1 }]
  },
  {
    name: "Polybutadiene (cis-1,4)", aka: ["BR", "butadiene rubber"], monomer: "1,3-Butadiene", cls: "Addition (diene)",
    cas: "9003-17-2", tg: "-100 °C", tm: "6 °C", tags: ["elastomer"],
    note: "The trans-1,4 isomer is markedly more crystalline (Tg near -83 °C, Tm near 145 °C, Odian's Table 8-1).",
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: "S1", order: 1 }]
  },
  {
    name: "Poly(ethylene oxide)", aka: ["PEO", "PEG", "polyethylene glycol"], monomer: "Ethylene oxide",
    cls: "Ring-opening", cas: "25322-68-3", tg: "-60 °C", tm: "65 °C", tags: ["polyether", "water-soluble", "biomedical"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }]
  },
  {
    name: "Poly(propylene oxide)", aka: ["PPO", "polypropylene glycol", "PPG"], monomer: "Propylene oxide",
    cls: "Ring-opening", cas: "25322-69-4", tg: "-60 °C", tags: ["polyether"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: "S1", order: 1 }]
  },
  {
    name: "Polyoxymethylene", aka: ["POM", "acetal", "Delrin"], monomer: "Trioxane (or formaldehyde)", cls: "Ring-opening",
    cas: "9002-81-7", tg: "-60 °C", tm: "175 °C", tags: ["engineering"],
    note: "Made two ways: cationic ring-opening copolymerization of trioxane (the tougher acetal copolymer) or anionic chain polymerization of formaldehyde (the Delrin homopolymer). Standard tables (Brandrup/Odian) list Tg near -83 °C and Tm near 181 °C.",
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Poly(dimethylsiloxane)", aka: ["PDMS", "silicone rubber"], monomer: "Dimethylsiloxane / D4 or D3 cyclics",
    cls: "Ring-opening (silicone)", cas: "9016-00-6", tg: "-125 °C", tm: "-40 °C", tags: ["silicone", "elastomer"],
    note: "Crystallizes only well below room temperature, so its melting point (Odian's Table 1-3) is far sub-ambient.",
    atoms: [{ id: 1, el: "Si" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 1, b: 3, order: 1 }, { a: 1, b: 4, order: 1 }, { a: 4, b: "S1", order: 1 }]
  },
  {
    name: "Nylon 6", aka: ["Polycaprolactam", "PA6"], monomer: "Caprolactam", cls: "Ring-opening (polyamide)",
    cas: "25038-54-4", tg: "47 °C", tm: "220 °C", tags: ["polyamide", "engineering", "fiber"],
    atoms: [{ id: 1, el: "N" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 7, b: "S1", order: 1 }]
  },
  {
    name: "Nylon 6,6", aka: ["Polyhexamethylene adipamide", "PA66"], monomer: "Hexamethylenediamine + adipic acid",
    cls: "Step-growth (polyamide)", cas: "32131-17-2", tg: "57 °C", tm: "265 °C", tags: ["polyamide", "engineering", "fiber"],
    atoms: [{ id: 1, el: "N" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" },
      { id: 8, el: "N" }, { id: 9, el: "C" }, { id: 10, el: "O" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" },
      { id: 15, el: "C" }, { id: 16, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 },
      { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 2 },
      { a: 9, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 1 },
      { a: 15, b: 16, order: 2 }, { a: 15, b: "S1", order: 1 }]
  },
  {
    name: "Poly(ethylene terephthalate)", aka: ["PET", "PETE"], monomer: "Ethylene glycol + terephthalic acid",
    cls: "Step-growth (polyester)", cas: "25038-59-9", tg: "75 °C", tm: "260 °C", tags: ["polyester", "commodity", "packaging", "fiber"],
    atoms: [{ id: 1, el: "O" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: 5, el: "C" }, { id: 6, el: "O" },
      { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" },
      { id: 13, el: "C" }, { id: 14, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 },
      { a: 5, b: 6, order: 2 }, { a: 5, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 2 },
      { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 12, b: 7, order: 1 }, { a: 10, b: 13, order: 1 }, { a: 13, b: 14, order: 2 },
      { a: 13, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(butyl acrylate)", aka: ["PBA"], monomer: "butyl acrylate",
    cls: "Addition (acrylate)", cas: "9003-49-0",
    tags: ["acrylic"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 8, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(2-ethylhexyl acrylate)", aka: ["P2EHA"], monomer: "2-ethylhexyl acrylate",
    cls: "Addition (acrylate)", cas: "9003-77-4",
    tags: ["acrylic"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "O" }, { id: 10, el: "C" }, { id: 11, el: "O" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 12, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 5, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 10, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 13, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(tert-butyl acrylate)", aka: ["PtBA"], monomer: "tert-butyl acrylate",
    cls: "Addition (acrylate)", cas: "25232-27-3",
    tags: ["acrylic"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 8, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 2, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(butyl methacrylate)", aka: ["PBMA"], monomer: "butyl methacrylate",
    cls: "Addition (methacrylate)", cas: "9003-63-8",
    tags: ["acrylic", "methacrylate"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 8, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 8, b: 10, order: 1 }, { a: 9, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(tert-butyl methacrylate)", aka: ["PtBMA"], monomer: "tert-butyl methacrylate",
    cls: "Addition (methacrylate)", cas: "25189-00-8",
    tags: ["acrylic", "methacrylate"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 7, b: 9, order: 1 }, { a: 7, b: 10, order: 1 }, { a: 3, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(benzyl methacrylate)", aka: ["PBzMA"], monomer: "benzyl methacrylate",
    cls: "Addition (methacrylate)", cas: "25085-83-0",
    tags: ["acrylic", "methacrylate"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 2 }, { a: 8, b: 13, order: 1 }, { a: 3, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(glycidyl methacrylate)", aka: ["PGMA"], monomer: "glycidyl methacrylate",
    cls: "Addition (methacrylate)", cas: "25067-05-4",
    tags: ["acrylic", "methacrylate", "specialty"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 8, b: 10, order: 1 }, { a: 3, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(2-(dimethylamino)ethyl methacrylate)", aka: ["PDMAEMA"], monomer: "2-(dimethylamino)ethyl methacrylate",
    cls: "Addition (methacrylate)", cas: "25154-86-3",
    tags: ["acrylic", "methacrylate", "water-soluble", "biomedical"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "N" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 9, b: 11, order: 1 }, { a: 3, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(alpha-methylstyrene)", aka: ["PAMS"], monomer: "alpha-methylstyrene",
    cls: "Addition (vinyl)", cas: "25014-31-7",
    tags: ["specialty"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 4, b: 9, order: 1 }, { a: 3, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(4-methylstyrene)", aka: ["P4MS"], monomer: "4-methylstyrene",
    cls: "Addition (vinyl)", cas: "24936-41-2",
    tags: ["specialty"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 8, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 2, b: 7, order: 1 }, { a: 5, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(4-tert-butylstyrene)", aka: ["PtBS"], monomer: "4-tert-butylstyrene",
    cls: "Addition (vinyl)", cas: "26009-55-2",
    tags: ["specialty"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 11, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 2, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 5, b: 10, order: 1 }, { a: 8, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(chlorotrifluoroethylene)", aka: ["PCTFE"], monomer: "chlorotrifluoroethylene",
    cls: "Addition (vinyl)", cas: "9002-83-9", tg: "45 °C", tm: "220 °C",
    tags: ["engineering", "fluoropolymer"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "F" }, { id: 4, el: "Cl" }, { id: 5, el: "F" }, { id: 6, el: "F" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 1, b: 5, order: 1 }, { a: 1, b: 6, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(N-vinylcaprolactam)", aka: ["PVCL"], monomer: "N-vinylcaprolactam",
    cls: "Addition (vinyl)", cas: "25189-83-7",
    tags: ["water-soluble", "biomedical"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "N" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 3, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(vinyl propionate)", aka: ["PVPr"], monomer: "vinyl propionate",
    cls: "Addition (vinyl)", cas: "25035-84-1",
    tags: ["coating"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 6, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(methyl vinyl ether)", aka: ["PMVE"], monomer: "methyl vinyl ether",
    cls: "Addition (vinyl)", cas: "9003-09-2",
    tags: ["specialty"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 3, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(ethyl vinyl ether)", aka: ["PEVE"], monomer: "ethyl vinyl ether",
    cls: "Addition (vinyl)", cas: "25104-37-4",
    tags: ["specialty"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "O" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 4, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(N-vinylformamide)", aka: ["PNVF"], monomer: "N-vinylformamide",
    cls: "Addition (vinyl)", cas: "72018-12-3",
    tags: ["water-soluble"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "N" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (conjugated diene, 1,4-addition) - verify structure before trusting
    name: "Poly(2,3-dimethylbutadiene)", aka: [], monomer: "2,3-dimethyl-1,3-butadiene",
    cls: "Addition (diene)", cas: "25034-65-5",
    tags: ["elastomer"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 3, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 2 }, { a: 4, b: 5, order: 1 }, { a: 4, b: 6, order: 1 }, { a: 5, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (ring-opening (lactam/lactone/carbonate)) - verify structure before trusting
    name: "Poly(caprolactone)", aka: ["PCL"], monomer: "epsilon-caprolactone",
    cls: "Ring-opening", cas: "24980-41-4",
    tags: ["biodegradable", "biomedical"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 4, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 1, b: 8, order: 1 }, { a: 6, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (ring-opening (lactam/lactone/carbonate)) - verify structure before trusting
    name: "Poly(glycolide)", aka: ["PGA"], monomer: "glycolide",
    cls: "Ring-opening", cas: "26202-08-4",
    tags: ["biodegradable", "biomedical"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "O" }, { id: 4, el: "O" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 1, b: 8, order: 1 }, { a: 4, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (ring-opening (lactam/lactone/carbonate)) - verify structure before trusting
    name: "Poly(lactide)", aka: ["PLA"], monomer: "lactide",
    cls: "Ring-opening", cas: "26680-10-4",
    tags: ["biodegradable", "biomedical", "commodity"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "O" }, { id: 9, el: "O" }, { id: 10, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 3, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 7, b: 9, order: 1 }, { a: 2, b: 9, order: 1 }, { a: 6, b: 10, order: 1 }, { a: 5, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (ring-opening (lactam/lactone/carbonate)) - verify structure before trusting
    name: "Poly(valerolactone)", aka: ["PVL"], monomer: "delta-valerolactone",
    cls: "Ring-opening", cas: "26354-94-9",
    tags: ["biodegradable"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 4, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 5, b: 7, order: 1 }, { a: 1, b: 7, order: 1 }, { a: 5, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (ring-opening (lactam/lactone/carbonate)) - verify structure before trusting
    name: "Poly(propiolactone)", aka: [], monomer: "beta-propiolactone",
    cls: "Ring-opening", cas: "25037-58-5",
    tags: ["biodegradable"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "O" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 3, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 1, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (ring-opening (lactam/lactone/carbonate)) - verify structure before trusting
    name: "Poly(trimethylene carbonate)", aka: ["PTMC"], monomer: "trimethylene carbonate",
    cls: "Ring-opening", cas: "31852-84-3",
    tags: ["biodegradable", "biomedical"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "O" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 3, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 1, b: 7, order: 1 }, { a: 4, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (ring-opening (epoxide)) - verify structure before trusting
    name: "Poly(epichlorohydrin)", aka: ["PECH"], monomer: "epichlorohydrin",
    cls: "Ring-opening", cas: "24969-06-0",
    tags: ["elastomer"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "O" }, { id: 4, el: "C" }, { id: 5, el: "Cl" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 3, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (ring-opening (epoxide)) - verify structure before trusting
    name: "Poly(butylene oxide)", aka: ["PBO"], monomer: "1,2-butylene oxide",
    cls: "Ring-opening", cas: "24969-07-1",
    tags: ["polyether"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 4, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (ring-opening (epoxide)) - verify structure before trusting
    name: "Poly(styrene oxide)", aka: [], monomer: "styrene oxide",
    cls: "Ring-opening", cas: "25189-69-9",
    tags: ["specialty"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "O" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 4, b: 9, order: 1 }, { a: 3, b: "S1", order: 1 }]
  },
  {
    name: "Polycarbonate (bisphenol A)", aka: ["PC", "BPA-PC", "Lexan", "Makrolon"],
    monomer: "Bisphenol A + phosgene (or diphenyl carbonate)", cls: "Step-growth (polyester)",
    cas: "25037-45-0", tg: "145 °C", tags: ["engineering"],
    note: "Amorphous; the carbonate linkage makes it a polyester of carbonic acid.",
    atoms: [{ id: 1, el: "O" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" },
      { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" },
      { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" },
      { id: 16, el: "C" }, { id: 17, el: "O" }, { id: 18, el: "C" }, { id: 19, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 },
      { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 7, b: 2, order: 1 }, { a: 5, b: 8, order: 1 },
      { a: 8, b: 9, order: 1 }, { a: 8, b: 10, order: 1 }, { a: 8, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 12, b: 13, order: 1 },
      { a: 13, b: 14, order: 2 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 2 }, { a: 16, b: 11, order: 1 }, { a: 14, b: 17, order: 1 },
      { a: 17, b: 18, order: 1 }, { a: 18, b: 19, order: 2 }, { a: 18, b: "S1", order: 1 }]
  },
  {
    name: "Poly(butylene terephthalate)", aka: ["PBT"], monomer: "1,4-Butanediol + terephthalic acid",
    cls: "Step-growth (polyester)", cas: "24968-12-5", tg: "40 °C", tm: "225 °C",
    tags: ["polyester", "engineering", "fiber"],
    atoms: [{ id: 1, el: "O" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" },
      { id: 6, el: "O" }, { id: 7, el: "C" }, { id: 8, el: "O" }, { id: 9, el: "C" }, { id: 10, el: "C" },
      { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" },
      { id: 16, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 },
      { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 7, b: 9, order: 1 },
      { a: 9, b: 10, order: 2 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 2 },
      { a: 14, b: 9, order: 1 }, { a: 12, b: 15, order: 1 }, { a: 15, b: 16, order: 2 }, { a: 15, b: "S1", order: 1 }]
  },
  {
    name: "Poly(3-hydroxybutyrate)", aka: ["PHB", "P3HB", "PHA"], monomer: "3-Hydroxybutyrate / beta-butyrolactone",
    cls: "Ring-opening", cas: "29435-48-1", tg: "4 °C", tm: "175 °C",
    tags: ["polyester", "biodegradable", "biomedical"],
    note: "The archetypal bacterial polyhydroxyalkanoate; also made by ROP of beta-butyrolactone.",
    atoms: [{ id: 1, el: "O" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 5, b: "S1", order: 1 }]
  },
  {
    name: "Poly(butylene succinate)", aka: ["PBS"], monomer: "1,4-Butanediol + succinic acid",
    cls: "Step-growth (polyester)", cas: "25777-14-4", tg: "-32 °C", tm: "114 °C",
    tags: ["polyester", "biodegradable"],
    atoms: [{ id: 1, el: "O" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "O" },
      { id: 7, el: "C" }, { id: 8, el: "O" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 },
      { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 7, b: 9, order: 1 }, { a: 9, b: 10, order: 1 },
      { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 11, b: "S1", order: 1 }]
  },
  {
    name: "Poly(p-phenylene sulfide)", aka: ["PPS", "Ryton"], monomer: "p-Dichlorobenzene + sodium sulfide",
    cas: "25212-74-2", tg: "88 °C", tm: "285 °C", tags: ["engineering", "specialty"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "S" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 2 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 1, order: 1 }, { a: 4, b: 7, order: 1 }, { a: 7, b: "S1", order: 1 }]
  },
  {
    name: "Nylon 11", aka: ["PA11", "Polyundecanamide", "Rilsan"], monomer: "11-Aminoundecanoic acid",
    cls: "Step-growth (polyamide)", cas: "25035-04-5", tg: "46 °C", tm: "190 °C", tags: ["polyamide", "engineering"],
    note: "Bio-based (castor oil); lower moisture uptake than nylon 6 or 6,6.",
    atoms: [{ id: 1, el: "N" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" },
      { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 },
      { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 },
      { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 2 }, { a: 12, b: "S1", order: 1 }]
  },
  {
    name: "Nylon 12", aka: ["PA12", "Polylaurolactam"], monomer: "Laurolactam",
    cls: "Ring-opening (polyamide)", cas: "24937-16-4", tg: "41 °C", tm: "178 °C", tags: ["polyamide", "engineering", "coating"],
    atoms: [{ id: 1, el: "N" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" },
      { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 },
      { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 },
      { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 2 }, { a: 13, b: "S1", order: 1 }]
  },
  {
    name: "Poly(2-ethyl-2-oxazoline)", aka: ["PEtOx", "PEOX"], monomer: "2-Ethyl-2-oxazoline",
    cls: "Ring-opening", cas: "25805-17-8", tg: "~60 °C", tags: ["water-soluble", "biomedical"],
    note: "A pseudo-polypeptide; studied as a stealth alternative to PEG.",
    atoms: [{ id: 1, el: "N" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 1, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }]
  },
  {
    name: "Poly(N,N-dimethylacrylamide)", aka: ["PDMA", "PDMAm"], monomer: "N,N-Dimethylacrylamide",
    cls: "Addition (vinyl)", cas: "26793-34-0", tg: "~89 °C", tags: ["acrylic", "water-soluble"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: 5, el: "N" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: "S1", order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 5, b: 7, order: 1 }]
  },
  {
    name: "Poly(tetrahydrofuran)", aka: ["PTHF", "PTMO", "PTMEG", "poly(tetramethylene oxide)"], monomer: "Tetrahydrofuran",
    cls: "Ring-opening", cas: "25190-06-1", tg: "-84 °C", tm: "~35 °C", tags: ["polyether", "elastomer"],
    note: "Common soft segment in thermoplastic polyurethanes and elastomers.",
    atoms: [{ id: 1, el: "O" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: "S1", order: 1 }]
  },
  {
    name: "Poly(2,6-dimethyl-1,4-phenylene oxide)", aka: ["PPO", "PPE", "poly(phenylene oxide)"], monomer: "2,6-Dimethylphenol",
    cas: "25134-01-4", tg: "210 °C", tags: ["engineering", "polyether"],
    note: "Oxidative-coupling polymer; usually blended with polystyrene (Noryl).",
    atoms: [{ id: 1, el: "O" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 7, b: 2, order: 1 }, { a: 3, b: 8, order: 1 }, { a: 7, b: 9, order: 1 }, { a: 5, b: "S1", order: 1 }]
  },
  {
    name: "Poly(vinyl methyl ketone)", aka: ["PVMK"], monomer: "Methyl vinyl ketone",
    cls: "Addition (vinyl)", cas: "25038-87-3", tg: "~40 °C", tags: ["specialty"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: 5, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: "S1", order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 3, b: 5, order: 1 }]
  },
  {
    name: "Poly(methacrylonitrile)", aka: ["PMAN"], monomer: "Methacrylonitrile",
    cls: "Addition (vinyl)", cas: "25067-02-1", tg: "~120 °C", tags: ["specialty"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "N" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: "S1", order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 3 }]
  },
  {
    name: "Poly(ether ether ketone)", aka: ["PEEK"], monomer: "4,4'-Difluorobenzophenone + hydroquinone",
    cas: "31694-16-3", tg: "143 °C", tm: "343 °C", tags: ["engineering"],
    note: "High-performance semicrystalline thermoplastic; three aryl rings per repeat.",
    atoms: [{ id: 1, el: "O" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" },
      { id: 8, el: "O" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" },
      { id: 15, el: "C" }, { id: 16, el: "O" }, { id: 17, el: "C" }, { id: 18, el: "C" }, { id: 19, el: "C" }, { id: 20, el: "C" }, { id: 21, el: "C" }, { id: 22, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 7, b: 2, order: 1 }, { a: 5, b: 8, order: 1 },
      { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 2 }, { a: 14, b: 9, order: 1 }, { a: 12, b: 15, order: 1 },
      { a: 15, b: 16, order: 2 }, { a: 15, b: 17, order: 1 }, { a: 17, b: 18, order: 2 }, { a: 18, b: 19, order: 1 }, { a: 19, b: 20, order: 2 }, { a: 20, b: 21, order: 1 }, { a: 21, b: 22, order: 2 }, { a: 22, b: 17, order: 1 }, { a: 20, b: "S1", order: 1 }]
  },
  {
    name: "Nylon 6,10", aka: ["PA610", "Polyhexamethylene sebacamide"], monomer: "Hexamethylenediamine + sebacic acid",
    cls: "Step-growth (polyamide)", cas: "9008-66-6", tg: "50 °C", tm: "215 °C", tags: ["polyamide", "engineering"],
    atoms: [{ id: 1, el: "N" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" },
      { id: 8, el: "N" }, { id: 9, el: "C" }, { id: 10, el: "O" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" },
      { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "C" }, { id: 19, el: "C" }, { id: 20, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 },
      { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 9, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 1 },
      { a: 16, b: 17, order: 1 }, { a: 17, b: 18, order: 1 }, { a: 18, b: 19, order: 1 }, { a: 19, b: 20, order: 2 }, { a: 19, b: "S1", order: 1 }]
  },
  {
    name: "Poly(ethylene naphthalate)", aka: ["PEN"], monomer: "Ethylene glycol + 2,6-naphthalenedicarboxylic acid",
    cls: "Step-growth (polyester)", cas: "24968-11-4", tg: "120 °C", tm: "265 °C", tags: ["polyester", "engineering", "fiber"],
    note: "Stiffer, higher-barrier cousin of PET; the naphthalene ring raises Tg and modulus.",
    atoms: [{ id: 1, el: "O" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: 5, el: "C" }, { id: 6, el: "O" },
      { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" },
      { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 5, b: 7, order: 1 },
      { a: 7, b: 8, order: 2 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 14, order: 2 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 2 }, { a: 16, b: 7, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 2 }, { a: 13, b: 14, order: 1 },
      { a: 12, b: 17, order: 1 }, { a: 17, b: 18, order: 2 }, { a: 17, b: "S1", order: 1 }]
  },
  {
    name: "Poly(trimethylene terephthalate)", aka: ["PTT", "3GT"], monomer: "1,3-Propanediol + terephthalic acid",
    cls: "Step-growth (polyester)", cas: "25009-14-3", tg: "45 °C", tm: "228 °C", tags: ["polyester", "fiber"],
    note: "The 'odd' methylene count gives a kinked chain and good elastic recovery in fibers.",
    atoms: [{ id: 1, el: "O" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "O" },
      { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 },
      { a: 8, b: 9, order: 2 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 2 }, { a: 13, b: 8, order: 1 }, { a: 11, b: 14, order: 1 }, { a: 14, b: 15, order: 2 }, { a: 14, b: "S1", order: 1 }]
  },
  {
    name: "Poly(p-phenylene terephthalamide)", aka: ["PPTA", "Kevlar", "aramid"], monomer: "p-Phenylenediamine + terephthaloyl chloride",
    cls: "Step-growth (polyamide)", cas: "24938-64-5", tags: ["polyamide", "fiber", "engineering"],
    note: "Rigid-rod liquid-crystalline aramid; does not melt (decomposes ~500 °C).",
    atoms: [{ id: 1, el: "N" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" },
      { id: 8, el: "N" }, { id: 9, el: "C" }, { id: 10, el: "O" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 7, b: 2, order: 1 }, { a: 5, b: 8, order: 1 },
      { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 9, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 2 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 2 }, { a: 16, b: 11, order: 1 }, { a: 14, b: 17, order: 1 }, { a: 17, b: 18, order: 2 }, { a: 17, b: "S1", order: 1 }]
  },
  {
    name: "Poly(m-phenylene isophthalamide)", aka: ["MPIA", "Nomex", "meta-aramid"], monomer: "m-Phenylenediamine + isophthaloyl chloride",
    cls: "Step-growth (polyamide)", cas: "24938-60-1", tags: ["polyamide", "fiber"],
    note: "Meta-linked aramid; flexible chains give flame-resistant fiber rather than high stiffness.",
    atoms: [{ id: 1, el: "N" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" },
      { id: 8, el: "N" }, { id: 9, el: "C" }, { id: 10, el: "O" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 7, b: 2, order: 1 }, { a: 4, b: 8, order: 1 },
      { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 9, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 2 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 2 }, { a: 16, b: 11, order: 1 }, { a: 13, b: 17, order: 1 }, { a: 17, b: 18, order: 2 }, { a: 17, b: "S1", order: 1 }]
  },
  {
    name: "Poly(ether sulfone)", aka: ["PES", "PESU"], monomer: "4,4'-Dichlorodiphenyl sulfone + hydroquinone",
    cas: "25608-63-3", tg: "225 °C", tags: ["engineering"],
    note: "Amorphous, transparent high-temperature thermoplastic; the sulfone group stiffens the chain.",
    atoms: [{ id: 1, el: "O" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" },
      { id: 8, el: "S" }, { id: 9, el: "O" }, { id: 10, el: "O" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 7, b: 2, order: 1 }, { a: 5, b: 8, order: 1 },
      { a: 8, b: 9, order: 2 }, { a: 8, b: 10, order: 2 }, { a: 8, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 2 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 2 }, { a: 16, b: 11, order: 1 }, { a: 14, b: "S1", order: 1 }]
  },
  {
    name: "Poly(ethyl methacrylate)", aka: ["PEMA"], monomer: "Ethyl methacrylate",
    cls: "Addition (methacrylate)", cas: "9003-42-3", tg: "65 °C", tags: ["acrylic", "methacrylate", "coating"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: "S1", order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }]
  },
  {
    name: "Poly(cyclohexyl methacrylate)", aka: ["PCHMA"], monomer: "Cyclohexyl methacrylate",
    cls: "Addition (methacrylate)", cas: "25768-50-7", tg: "~92 °C", tags: ["acrylic", "methacrylate"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" },
      { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: "S1", order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 },
      { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 7, order: 1 }]
  },
  {
    name: "Poly(2-vinylpyridine)", aka: ["P2VP"], monomer: "2-Vinylpyridine",
    cls: "Addition (vinyl)", cas: "25014-15-7", tg: "104 °C", tags: ["specialty"],
    note: "The ring nitrogen makes it pH-responsive and metal-coordinating; a common block-copolymer segment.",
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "N" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: "S1", order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 8, b: 3, order: 1 }]
  },
  {
    name: "Poly(dioxanone)", aka: ["PDO", "PDS", "poly(p-dioxanone)"], monomer: "p-Dioxanone (1,4-dioxan-2-one)",
    cls: "Ring-opening", cas: "25656-01-1", tg: "-10 °C", tm: "110 °C", tags: ["biodegradable", "biomedical"],
    note: "The ether oxygen in the backbone gives the flexibility used in monofilament absorbable sutures.",
    atoms: [{ id: 1, el: "O" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: "S1", order: 1 }]
  },
  {
    name: "Poly(3-hydroxyvalerate)", aka: ["PHV", "P3HV"], monomer: "3-Hydroxyvalerate",
    cls: "Ring-opening", cas: "26744-04-7", tg: "-15 °C", tm: "108 °C", tags: ["polyester", "biodegradable"],
    note: "The ethyl-branched PHA; copolymerized with PHB (as PHBV) to toughen it.",
    atoms: [{ id: 1, el: "O" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 2, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: "S1", order: 1 }]
  },
  {
    name: "Poly(ethylene adipate)", aka: ["PEA"], monomer: "Ethylene glycol + adipic acid",
    cls: "Step-growth (polyester)", cas: "24938-37-2", tg: "-50 °C", tm: "50 °C", tags: ["polyester", "biodegradable"],
    note: "Low-melting aliphatic polyester used as a polyol soft segment in polyurethanes.",
    atoms: [{ id: 1, el: "O" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: 5, el: "C" }, { id: 6, el: "O" },
      { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 5, b: 7, order: 1 },
      { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 11, b: "S1", order: 1 }]
  },
  {
    name: "Poly(ethylene succinate)", aka: ["PESu"], monomer: "Ethylene glycol + succinic acid",
    cls: "Step-growth (polyester)", cas: "25569-53-3", tg: "-4 °C", tm: "104 °C", tags: ["polyester", "biodegradable"],
    atoms: [{ id: 1, el: "O" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: 5, el: "C" }, { id: 6, el: "O" },
      { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 5, b: 7, order: 1 },
      { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 9, b: "S1", order: 1 }]
  },
  {
    name: "Poly(ethylene disulfide)", aka: ["ethylene polysulfide", "polyethylene disulfide", "Thiokol"],
    monomer: "1,2-Dichloroethane + sodium disulfide", tg: "-27 °C", tags: ["specialty", "elastomer"],
    note: "A Thiokol-type polysulfide rubber; the S-S linkages give the solvent and weathering resistance used in sealants. The repeat unit is drawn disulfide-centered (-CH2-S-S-CH2-).",
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "S" }, { id: 3, el: "S" }, { id: 4, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: "S1", order: 1 }]
  },
  {
    name: "Poly(geranyl methacrylate)", aka: ["poly(geraniol methacrylate)", "PGerMA", "geraniol methacrylate polymer"],
    monomer: "geranyl methacrylate (geraniol methacrylate)", cls: "Addition (methacrylate)",
    tags: ["acrylic", "methacrylate", "bio-based", "terpene"], verified: false,
    note: "A bio-based methacrylate: the methacrylate ester of the terpene alcohol geraniol. The pendant geranyl group keeps its two C=C double bonds (2,6-diene), which remain available for post-polymerization crosslinking. Studied for greener coatings and binders. Monomer C14H22O2, ~222.3 g/mol.",
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: "S1", order: 1 }, { a: 1, b: 3, order: 1 }, { a: 1, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 9, b: 10, order: 1 }, { a: 9, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 2 }, { a: 14, b: 15, order: 1 }, { a: 14, b: 16, order: 1 }]
  },
  {
    name: "Poly(tetrahydrogeranyl methacrylate)", aka: ["poly(tetrahydrogeraniol methacrylate)", "poly(3,7-dimethyloctyl methacrylate)", "PTHGMA"],
    monomer: "tetrahydrogeranyl methacrylate (3,7-dimethyloctyl methacrylate)", cls: "Addition (methacrylate)",
    tags: ["acrylic", "methacrylate", "bio-based", "terpene"], verified: false,
    note: "The fully hydrogenated version of poly(geranyl methacrylate): the ester of tetrahydrogeraniol (3,7-dimethyl-1-octanol), so the branched C10 pendant is saturated with no residual C=C. A bio-derived, flexible, hydrophobic side group. Monomer C14H26O2, ~226.4 g/mol.",
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: "S1", order: 1 }, { a: 1, b: 3, order: 1 }, { a: 1, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 9, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 14, b: 16, order: 1 }]
  },

  // ---- Copolymers ----------------------------------------------------------
  // No single repeat unit, so these carry type:"copolymer" and a `components`
  // list of the library homopolymer names they are built from (used by the
  // structure search to name a drawn multi-block copolymer, and by name search
  // directly). No atoms/bonds: fingerprintOf skips them for structure matching.
  {
    name: "Styrene-butadiene copolymer", aka: ["SBR", "styrene butadiene rubber", "styrene-butadiene", "E-SBR", "S-SBR"],
    type: "copolymer", arch: "statistical", components: ["Polystyrene", "Polybutadiene (cis-1,4)"],
    monomer: "Styrene + 1,3-butadiene", cls: "Copolymer (addition, diene)", cas: "9003-55-8",
    tags: ["copolymer", "elastomer", "tire", "commodity"],
    note: "Styrene and butadiene arranged at random along the chain: the workhorse tyre rubber, made by emulsion (E-SBR) or solution (S-SBR) polymerisation and vulcanised in use. A random copolymer has one Tg between those of its components and no physical network, so it is not a thermoplastic elastomer - that is the ordered SBS triblock, which is a separate entry. A drawing shows the monomers, not whether the arrangement is random or block."
  },
  {
    name: "Poly(styrene-co-acrylonitrile)", aka: ["SAN", "styrene-acrylonitrile"],
    type: "copolymer", arch: "random", components: ["Polystyrene", "Polyacrylonitrile"],
    monomer: "Styrene + acrylonitrile", cls: "Copolymer (addition, vinyl)", cas: "9003-54-7",
    tags: ["copolymer", "engineering", "transparent"],
    note: "A rigid, transparent, solvent-resistant copolymer; the acrylonitrile raises chemical resistance and stiffness over polystyrene."
  },
  {
    name: "Acrylonitrile-butadiene-styrene", aka: ["ABS"],
    type: "copolymer", arch: "graft", components: ["Polyacrylonitrile", "Polybutadiene (cis-1,4)", "Polystyrene"],
    monomer: "Acrylonitrile + 1,3-butadiene + styrene", cls: "Terpolymer (addition)", cas: "9003-56-9",
    tags: ["copolymer", "terpolymer", "engineering", "impact-resistant"],
    note: "A three-monomer blend/graft: a butadiene rubber phase toughens a rigid SAN matrix. Widely used for impact-tough moldings (LEGO, housings)."
  },
  {
    name: "Nitrile rubber", aka: ["NBR", "acrylonitrile-butadiene rubber", "Buna-N"],
    type: "copolymer", arch: "random", components: ["Polyacrylonitrile", "Polybutadiene (cis-1,4)"],
    monomer: "Acrylonitrile + 1,3-butadiene", cls: "Copolymer (addition, diene)", cas: "9003-18-3",
    tags: ["copolymer", "elastomer", "oil-resistant"],
    note: "An oil- and fuel-resistant rubber; acrylonitrile content sets the balance of oil resistance versus low-temperature flexibility."
  },
  {
    name: "Poly(lactic-co-glycolic acid)", aka: ["PLGA", "poly(lactide-co-glycolide)"],
    type: "copolymer", arch: "random", components: ["Poly(lactide)", "Poly(glycolide)"],
    monomer: "Lactide + glycolide", cls: "Copolymer (ring-opening, polyester)", cas: "26780-50-7",
    tags: ["copolymer", "biodegradable", "biomedical", "drug delivery"],
    note: "A resorbable polyester copolymer; the lactide:glycolide ratio tunes the degradation rate, which is why it dominates controlled-release implants and sutures."
  },
  {
    name: "Ethylene-vinyl acetate", aka: ["EVA", "poly(ethylene-co-vinyl acetate)"],
    type: "copolymer", arch: "random", components: ["Polyethylene", "Poly(vinyl acetate)"],
    monomer: "Ethylene + vinyl acetate", cls: "Copolymer (addition, vinyl)", cas: "24937-78-8",
    tags: ["copolymer", "elastomer", "adhesive", "foam"],
    note: "Vinyl acetate content softens polyethylene into a flexible, rubbery material used in foams, hot-melt adhesives, and film."
  },
  {
    name: "Ethylene-propylene rubber", aka: ["EPR", "EPM", "EPDM", "poly(ethylene-co-propylene)"],
    type: "copolymer", arch: "random", components: ["Polyethylene", "Polypropylene"],
    monomer: "Ethylene + propylene (+ a diene for EPDM)", cls: "Copolymer (addition)", cas: "9010-79-1",
    tags: ["copolymer", "elastomer", "weather-resistant"],
    note: "A saturated-backbone rubber with excellent weather and ozone resistance; EPDM adds a small amount of a diene to allow sulfur vulcanization."
  },
  {
    name: "Polystyrene-b-poly(ethylene oxide)", aka: ["PS-b-PEO", "PS-b-PEG", "polystyrene-b-poly(ethylene glycol)", "PS-PEO"],
    type: "copolymer", arch: "block", components: ["Polystyrene", "Poly(ethylene oxide)"],
    monomer: "Styrene + ethylene oxide", cls: "Block copolymer (amphiphilic)", cas: "104108-24-9",
    tags: ["copolymer", "block", "amphiphilic", "self-assembly"],
    note: "A classic amphiphilic block copolymer: a hydrophobic polystyrene block and a hydrophilic PEO block. It self-assembles into micelles and ordered nanostructures, and is a model system for block-copolymer phase behavior."
  },
  {
    name: "Poly(ethylene oxide-b-propylene oxide)", aka: ["poloxamer", "Pluronic", "PEO-PPO-PEO", "poly(ethylene glycol-b-propylene glycol)"],
    type: "copolymer", arch: "block", components: ["Poly(ethylene oxide)", "Poly(propylene oxide)"],
    monomer: "Ethylene oxide + propylene oxide", cls: "Block copolymer (ring-opening, polyether)", cas: "9003-11-6",
    tags: ["copolymer", "block", "surfactant", "amphiphilic"],
    note: "A PEO-PPO-PEO triblock surfactant. The hydrophilic PEO and hydrophobic PPO blocks drive micellization and gelation, used in drug delivery and as a nonionic surfactant."
  },
  {
    name: "Polystyrene-b-polybutadiene-b-polystyrene", aka: ["SBS", "styrene-butadiene-styrene", "Kraton D1101"],
    type: "copolymer", arch: "block", components: ["Polystyrene", "Polybutadiene (cis-1,4)"],
    monomer: "Styrene + butadiene", cls: "Block copolymer (thermoplastic elastomer)", cas: null,
    tags: ["copolymer", "block", "elastomer", "thermoplastic elastomer", "adhesive", "commodity"],
    note: "Glassy polystyrene end-blocks phase-separate into domains that act as physical, thermally reversible crosslinks, tying both ends of the rubbery polybutadiene mid-block into a network: rubber elasticity without vulcanisation, and melt processability above the PS Tg. Reinforcement fades from about 60-70 C, well below the PS domain Tg, which sets the service ceiling near 80 C. Commercial grades run 25-40 wt% styrene; the base polymer for hot-melt adhesives, bitumen modification and footwear."
  },
  {
    name: "Polystyrene-b-polyisoprene-b-polystyrene", aka: ["SIS", "styrene-isoprene-styrene"],
    type: "copolymer", arch: "block", components: ["Polystyrene", "Polyisoprene (cis-1,4)"],
    monomer: "Styrene + isoprene", cls: "Block copolymer (thermoplastic elastomer)", cas: null,
    tags: ["copolymer", "block", "elastomer", "thermoplastic elastomer", "adhesive"],
    note: "The same physical-crosslink mechanism as SBS, but the isoprene mid-block gives a softer, tackier rubber phase that accepts tackifying resin readily, which is why SIS rather than SBS dominates pressure-sensitive adhesives. Styrene contents are lower than in SBS (typically 14-22 wt%), keeping the PS domains discrete spheres. Isoprene differs from butadiene by a methyl substituent, not an extra double bond; both dienes carry one C=C per 1,4 repeat unit."
  },
  {
    name: "Polystyrene-b-polybutadiene", aka: ["PS-b-PB", "SB diblock", "poly(styrene-block-butadiene)"],
    type: "copolymer", arch: "block", components: ["Polystyrene", "Polybutadiene (cis-1,4)"],
    monomer: "Styrene + butadiene", cls: "Block copolymer (diblock)", cas: null,
    tags: ["copolymer", "block", "self-assembly", "specialty"],
    note: "The diblock counterpart of SBS and one of the model systems for block-copolymer phase behaviour, where the volume fraction of one block selects spheres, cylinders, gyroid or lamellae. Unlike SBS it is not an elastomer: with only one junction the rubbery chain has a free end and no load-bearing network forms, which is precisely why the commercial thermoplastic elastomer is the ABA triblock."
  },
  {
    name: "Polystyrene-b-polyisoprene", aka: ["PS-b-PI", "SI diblock", "poly(styrene-block-isoprene)"],
    type: "copolymer", arch: "block", components: ["Polystyrene", "Polyisoprene (cis-1,4)"],
    monomer: "Styrene + isoprene", cls: "Block copolymer (diblock)", cas: null,
    tags: ["copolymer", "block", "self-assembly", "specialty"],
    note: "The system the classical diblock phase diagram was mapped on (Khandpur et al., Macromolecules 1995, 28, 8796): composition, not chemistry, selects the morphology, and the same sequence of spheres, cylinders, gyroid and lamellae recurs in every strongly segregated diblock. Like PS-b-PB it is not an elastomer - a diblock leaves one rubber chain end free and forms no network."
  },
  {
    name: "Polystyrene-b-poly(methyl methacrylate)", aka: ["PS-b-PMMA", "poly(styrene-block-methyl methacrylate)"],
    type: "copolymer", arch: "block", components: ["Polystyrene", "Poly(methyl methacrylate)"],
    monomer: "Styrene + methyl methacrylate", cls: "Block copolymer (diblock)", cas: null,
    tags: ["copolymer", "block", "self-assembly", "specialty"],
    note: "The workhorse of directed self-assembly lithography. PS and PMMA have nearly identical surface energies at annealing temperature, so neither block preferentially wets the free surface and the lamellae stand perpendicular to the substrate without a top coat - the geometry a patterning process needs. PMMA is then selectively removed by UV or acetic acid, leaving PS as an etch mask. The same low chi that matches the surface energies also caps resolution, plateauing near 11-12 nm half-pitch."
  },
  {
    name: "Polystyrene-b-poly(2-vinylpyridine)", aka: ["PS-b-P2VP", "poly(styrene-block-2-vinylpyridine)"],
    type: "copolymer", arch: "block", components: ["Polystyrene", "Poly(2-vinylpyridine)"],
    monomer: "Styrene + 2-vinylpyridine", cls: "Block copolymer (diblock)", cas: null,
    tags: ["copolymer", "block", "self-assembly", "specialty"],
    note: "High chi relative to PS-b-PMMA, so it reaches smaller domains, and the pyridine nitrogen binds metal salts - the basis of block-copolymer micelle nanolithography, where reverse micelles loaded with a gold precursor are deposited as a monolayer and plasma-treated to leave a hexagonal array of gold nanodots with controllable spacing (Spatz and Moeller). The two block Tg values are close, so microphase separation is established by scattering and microscopy rather than by DSC."
  },
  {
    name: "Polystyrene-b-poly(4-vinylpyridine)", aka: ["PS-b-P4VP", "poly(styrene-block-4-vinylpyridine)"],
    type: "copolymer", arch: "block", components: ["Polystyrene", "Poly(4-vinylpyridine)"],
    monomer: "Styrene + 4-vinylpyridine", cls: "Block copolymer (diblock)", cas: null,
    tags: ["copolymer", "block", "self-assembly", "specialty"],
    note: "The 4-substituted pyridine is the less hindered, stronger hydrogen-bond acceptor, which makes this the classic supramolecular comb-shaped scaffold: small amphiphiles such as 3-n-pentadecylphenol hydrogen-bond to the P4VP block and generate a second, finer length scale inside the block-copolymer morphology - structure within structure (Ikkala and ten Brinke). Also widely used as a nanoporous membrane template, since the P4VP domains swell and open in acid."
  },
  {
    name: "Polystyrene-b-poly(acrylic acid)", aka: ["PS-b-PAA", "poly(styrene-block-acrylic acid)"],
    type: "copolymer", arch: "block", components: ["Polystyrene", "Poly(acrylic acid)"],
    monomer: "Styrene + acrylic acid", cls: "Block copolymer (amphiphilic)", cas: null,
    tags: ["copolymer", "block", "amphiphilic", "self-assembly", "surfactant", "water-soluble", "specialty"],
    note: "The crew-cut micelle system: with a long insoluble PS block and a short PAA corona, shrinking the corona walks the aggregate through spheres, rods, bicontinuous structures, lamellae, vesicles and large compound micelles, so morphology becomes a formulation variable rather than a fixed property (Zhang and Eisenberg). Usually made by hydrolysing poly(styrene-b-tert-butyl acrylate) rather than by direct copolymerisation, so any styrene/acrylic-acid registry number describes a different material."
  },
  {
    name: "Polystyrene-b-poly(tert-butyl acrylate)", aka: ["PS-b-PtBA", "poly(styrene-block-tert-butyl acrylate)"],
    type: "copolymer", arch: "block", components: ["Polystyrene", "Poly(tert-butyl acrylate)"],
    monomer: "Styrene + tert-butyl acrylate", cls: "Block copolymer (diblock)", cas: null,
    tags: ["copolymer", "block", "self-assembly", "specialty"],
    note: "Chiefly a protected precursor: the tert-butyl ester is polymerised cleanly by anionic or controlled-radical methods where acrylic acid itself is not, then removed thermally or with acid to give poly(styrene-b-acrylic acid) with the block lengths set before deprotection. Useful in its own right as a well-defined amorphous diblock, both blocks glassy at room temperature."
  },
  {
    name: "Poly(ethylene oxide)-b-poly(lactide)", aka: ["PEG-b-PLA", "PEO-b-PLA", "mPEG-b-PDLLA", "PEG-PLA"],
    type: "copolymer", arch: "block", components: ["Poly(ethylene oxide)", "Poly(lactide)"],
    monomer: "Ethylene oxide + lactide", cls: "Block copolymer (amphiphilic, degradable)", cas: null,
    tags: ["copolymer", "block", "amphiphilic", "self-assembly", "drug delivery", "biodegradable", "biomedical", "polyester", "polyether"],
    note: "A hydrophobic polylactide core solubilises a water-insoluble drug while the PEG corona provides steric stealth and colloidal stability, and the ester backbone hydrolyses to lactic acid. Genexol-PM is the clinical proof: mPEG 2000-b-poly(D,L-lactide) 1750 micelles about 24 nm across carrying paclitaxel with no Cremophor EL, which raised the maximum tolerated dose to 390 from 175 mg/m2 for Taxol."
  },
  {
    name: "Poly(ethylene oxide)-b-poly(lactide-co-glycolide)", aka: ["PEG-b-PLGA", "mPEG-b-PLGA", "PEG-PLGA"],
    type: "copolymer", arch: "block", components: ["Poly(ethylene oxide)", "Poly(lactide)", "Poly(glycolide)"],
    monomer: "Ethylene oxide + lactide + glycolide", cls: "Block copolymer (amphiphilic, degradable)", cas: null,
    tags: ["copolymer", "block", "amphiphilic", "self-assembly", "drug delivery", "biodegradable", "biomedical", "polyester", "polyether"],
    note: "Adds a tunable degradation clock to the PEG-b-PLA idea: the glycolide fraction sets the hydrolysis rate of the hydrophobic block, fastest near a 50:50 lactide:glycolide ratio and slower in either direction as the block becomes more crystalline. Note the hydrophobic block is itself a random lactide/glycolide copolymer, so this is a two-block architecture whose second block is statistical - the components list names its monomers, not three discrete blocks."
  },
  {
    name: "Poly(lactide-co-glycolide)-b-poly(ethylene oxide)-b-poly(lactide-co-glycolide)", aka: ["PLGA-PEG-PLGA", "ReGel", "OncoGel"],
    type: "copolymer", arch: "block", components: ["Poly(ethylene oxide)", "Poly(lactide)", "Poly(glycolide)"],
    monomer: "Ethylene oxide + lactide + glycolide", cls: "Block copolymer (reverse thermal gelling triblock)", cas: null,
    tags: ["copolymer", "block", "amphiphilic", "drug delivery", "biodegradable", "biomedical", "water-soluble", "polyester", "polyether"],
    note: "A reverse-thermal-gelling ABA triblock: soluble in cold water at roughly 15-23 wt% and gelling as it warms to body temperature, so a drug is mixed into the cold sol and the depot forms in situ after injection. Marketed as ReGel, and as OncoGel with paclitaxel at 6 mg/mL. Both end blocks are random lactide/glycolide copolymers, and the components list cannot express the ABA ordering that makes the gel work."
  },
  {
    name: "Poly(ethylene oxide)-b-poly(caprolactone)", aka: ["PEG-b-PCL", "PEO-b-PCL", "mPEG-b-PCL"],
    type: "copolymer", arch: "block", components: ["Poly(ethylene oxide)", "Poly(caprolactone)"],
    monomer: "Ethylene oxide + caprolactone", cls: "Block copolymer (amphiphilic, degradable)", cas: null,
    tags: ["copolymer", "block", "amphiphilic", "self-assembly", "drug delivery", "biodegradable", "biomedical", "polyester", "polyether"],
    note: "The rubbery, semicrystalline PCL core takes higher drug loadings than a glassy polyester core such as PDLLA, and degrades over months to years without the acid-autocatalysed burst that PLGA depots show. Both blocks crystallise and both have a glass transition near -60 C, so the amorphous fraction is small and the Tg step is often not detectable at all in bulk DSC - the melting endotherms, not the glass transitions, are what the trace shows."
  },
  {
    name: "Poly(caprolactone)-b-poly(lactide)", aka: ["PCL-b-PLA", "PCL-PLA"],
    type: "copolymer", arch: "block", components: ["Poly(caprolactone)", "Poly(lactide)"],
    monomer: "Caprolactone + lactide", cls: "Block copolymer (degradable diblock)", cas: null,
    tags: ["copolymer", "block", "biodegradable", "biomedical", "polyester", "self-assembly"],
    note: "A fully resorbable diblock pairing a soft, slowly hydrolysing PCL block with a stiff, faster-degrading polylactide block; the ABA triblock form is the one that behaves as a resorbable thermoplastic elastomer, since a diblock forms no physical network. A useful diagnostic: sequential ring-opening polymerisation is prone to transesterification, and a single intermediate Tg in place of the two block transitions means the product has been scrambled into an effectively random copolymer."
  },
  {
    name: "Poly(2-ethyl-2-oxazoline)-b-poly(caprolactone)", aka: ["PEtOx-b-PCL", "POx-b-PCL"],
    type: "copolymer", arch: "block", components: ["Poly(2-ethyl-2-oxazoline)", "Poly(caprolactone)"],
    monomer: "2-Ethyl-2-oxazoline + caprolactone", cls: "Block copolymer (amphiphilic)", cas: null,
    tags: ["copolymer", "block", "amphiphilic", "self-assembly", "drug delivery", "biomedical", "specialty", "polyester"],
    note: "A PEG alternative: poly(2-ethyl-2-oxazoline) is a water-soluble, low-fouling pseudo-polypeptide made by living cationic ring-opening polymerisation, and it is cleared renally rather than degraded, so only the PCL block of this micelle is resorbable. Reported paclitaxel loadings are modest (roughly 0.5-8 wt%); the much higher loadings quoted for polyoxazoline micelles belong to the hydrophobic-core PMeOx-b-PBuOx-b-PMeOx triblocks, not to this one."
  },
  {
    name: "Poly(N-isopropylacrylamide)-b-poly(ethylene oxide)", aka: ["PNIPAM-b-PEO", "PNIPAAm-b-PEG"],
    type: "copolymer", arch: "block", components: ["Poly(N-isopropylacrylamide)", "Poly(ethylene oxide)"],
    monomer: "N-isopropylacrylamide + ethylene oxide", cls: "Block copolymer (double-hydrophilic, thermoresponsive)", cas: null,
    tags: ["copolymer", "block", "self-assembly", "water-soluble", "drug delivery", "biomedical", "specialty", "polyether"],
    note: "Double-hydrophilic below about 32 C, where both blocks are hydrated, and amphiphilic above it, where the PNIPAM block dehydrates and collapses into a core while the PEO block keeps the particle colloidally stable - the reason this micellises reversibly on warming where PNIPAM homopolymer simply precipitates. The 32 C transition is a solution cloud point (LCST), not a glass transition, and will not appear on a dry DSC scan."
  },
  {
    name: "Poly(methyl methacrylate)-b-poly(butyl acrylate)-b-poly(methyl methacrylate)", aka: ["MAM", "PMMA-b-PnBA-b-PMMA", "Nanostrength"],
    type: "copolymer", arch: "block", components: ["Poly(methyl methacrylate)", "Poly(butyl acrylate)"],
    monomer: "Methyl methacrylate + butyl acrylate", cls: "Block copolymer (acrylic thermoplastic elastomer)", cas: null,
    tags: ["copolymer", "block", "acrylic", "elastomer", "thermoplastic elastomer", "specialty"],
    note: "The all-acrylic answer to SBS: glassy PMMA end-blocks pin both ends of a rubbery poly(n-butyl acrylate) mid-block into a physical network, but with no backbone unsaturation, so it keeps the weatherability and clarity that the styrenic dienes lack. Made industrially by nitroxide-mediated controlled radical polymerisation rather than anionically, and sold as Arkema Nanostrength for toughening epoxies and acrylics, where it self-assembles into nanodomains inside the cured matrix."
  },
  {
    name: "Poly(methyl methacrylate)-b-poly(butyl acrylate)", aka: ["PMMA-b-PnBA", "PMMA-b-PBA"],
    type: "copolymer", arch: "block", components: ["Poly(methyl methacrylate)", "Poly(butyl acrylate)"],
    monomer: "Methyl methacrylate + butyl acrylate", cls: "Block copolymer (diblock)", cas: null,
    tags: ["copolymer", "block", "acrylic", "self-assembly", "specialty"],
    note: "The diblock half of the MAM system and a standard demonstration polymer for controlled radical polymerisation, since both monomers are radically polymerisable and the second block can be grown straight from a macroinitiator. Widely used as a compatibiliser and as a model for acrylic microphase separation; as a diblock it is not itself an elastomer."
  },
  {
    name: "Polystyrene-b-poly(dimethylsiloxane)", aka: ["PS-b-PDMS", "poly(styrene-block-dimethylsiloxane)"],
    type: "copolymer", arch: "block", components: ["Polystyrene", "Poly(dimethylsiloxane)"],
    monomer: "Styrene + dimethylsiloxane", cls: "Block copolymer (diblock)", cas: null,
    tags: ["copolymer", "block", "self-assembly", "silicone", "specialty"],
    note: "A high-chi block copolymer, so it microphase-separates to much smaller domains than PS-b-PMMA and reaches sub-10 nm features. The silicon content is the other half of its appeal: an oxygen plasma converts the PDMS domains to a silica-like oxide while burning the organic block away, giving an etch contrast far larger than any all-organic pair. The cost is a large surface-energy mismatch, so the film needs a top coat or a neutral layer to orient the domains."
  },
  {
    name: "Poly(dimethylsiloxane)-b-poly(methyl methacrylate)", aka: ["PDMS-b-PMMA", "PMMA-b-PDMS"],
    type: "copolymer", arch: "block", components: ["Poly(dimethylsiloxane)", "Poly(methyl methacrylate)"],
    monomer: "Dimethylsiloxane + methyl methacrylate", cls: "Block copolymer (diblock)", cas: null,
    tags: ["copolymer", "block", "self-assembly", "silicone", "specialty"],
    note: "The same silicon-versus-organic etch contrast as PS-b-PDMS with a polar organic block, which changes the surface-energy balance and the selective solvents available. The two blocks are about as far apart in glass transition as any pair here - PDMS near -125 C against PMMA near 105 C - so the material is a rubbery phase and a glassy phase side by side at room temperature."
  },
  {
    name: "Polyether block amide", aka: ["PEBA", "Pebax", "polyether-block-amide", "poly(nylon 12-b-tetramethylene oxide)", "TPE-A"],
    type: "copolymer", arch: "block", components: ["Nylon 12", "Poly(tetrahydrofuran)"],
    monomer: "Laurolactam + tetrahydrofuran", cls: "Segmented block copolymer (thermoplastic elastomer)", cas: "77402-38-1",
    tags: ["copolymer", "block", "elastomer", "thermoplastic elastomer", "polyamide", "polyether", "engineering", "biomedical"],
    note: "A thermoplastic elastomer in which crystalline polyamide-12 hard segments provide the physical crosslinks and poly(tetramethylene oxide) soft segments provide the elasticity, with stiffness dialled across a wide range purely by the hard:soft ratio. Unlike the styrenic triblocks this is a segmented multiblock made by melt polycondensation of dicarboxyl-terminated PA12 with polyether diol, so segment lengths are statistical and the chain is -(hard-soft)n- rather than a discrete ABA. Used for ski boots, running-shoe plates and catheter tubing."
  },
  {
    name: "Polystyrene-b-polyisobutylene-b-polystyrene", aka: ["SIBS", "styrene-isobutylene-styrene", "SIBSTAR", "Translute"],
    type: "copolymer", arch: "block", components: ["Polystyrene", "Polyisobutylene"],
    monomer: "Styrene + isobutylene", cls: "Block copolymer (thermoplastic elastomer)", cas: null,
    tags: ["copolymer", "block", "elastomer", "thermoplastic elastomer", "biomedical", "drug delivery", "specialty"],
    note: "The saturated answer to SBS: glassy polystyrene end-blocks pin a rubbery polyisobutylene mid-block into a physically crosslinked network, but with no backbone unsaturation to oxidise or crosslink, so it survives as a permanent implant coating where SBS or SIS would degrade. It is the drug-carrier matrix of the TAXUS paclitaxel-eluting coronary stent, releasing by diffusion from a non-degradable film rather than by erosion, and the dense PIB packing also makes it an excellent gas barrier. Textbook product of living cationic polymerisation by sequential monomer addition, a chemistry few block copolymers come from."
  },
  {
    name: "Polybutadiene-b-poly(ethylene oxide)", aka: ["PB-b-PEO", "PBd-PEO", "polybutadiene-b-poly(ethylene glycol)"],
    type: "copolymer", arch: "block", components: ["Polybutadiene (cis-1,4)", "Poly(ethylene oxide)"],
    monomer: "Butadiene + ethylene oxide", cls: "Block copolymer (amphiphilic)", cas: null,
    tags: ["copolymer", "block", "amphiphilic", "self-assembly", "surfactant", "drug delivery", "biomedical", "specialty"],
    note: "The reference amphiphile for polymersomes, where the aggregate shape follows the hydrophilic weight fraction rather than the chemistry: near 0.35 it forms bilayer vesicles, 0.40-0.50 gives wormlike micelles and Y-junction networks, and above about 0.55 curvature forces spheres. The membranes are an order of magnitude tougher and far less permeable than a phospholipid bilayer, and the residual backbone double bonds are a convenient handle for crosslinking after assembly. Note the polymersome-grade material is 1,2-rich polybutadiene made anionically, not the stereoregular cis-1,4 linked here: the block Tg differs by roughly 70 C between the two microstructures, so do not carry the cis-1,4 value across."
  },
  {
    name: "Poly(ethylene oxide)-b-poly(acrylic acid)", aka: ["PEO-b-PAA", "PEG-b-PAA", "poly(ethylene glycol)-block-poly(acrylic acid)"],
    type: "copolymer", arch: "block", components: ["Poly(ethylene oxide)", "Poly(acrylic acid)"],
    monomer: "Ethylene oxide + acrylic acid", cls: "Block copolymer (double-hydrophilic)", cas: null,
    tags: ["copolymer", "block", "water-soluble", "self-assembly", "drug delivery", "specialty", "polyether"],
    note: "Double-hydrophilic rather than amphiphilic: both blocks dissolve, so nothing assembles until assembly is triggered by pH, by multivalent cations, or by an oppositely charged polyion, whereupon the neutralised polyacid collapses into a core under a stabilising PEO corona. Those polyion complex micelles are the standard vehicle for carrying polycations, proteins and nucleic acids behind a stealth shell. The same free polyanion block chelates calcium and adsorbs onto growing mineral faces while the tethered PEO gives steric stabilisation, which is why it works as a scale and crystal-growth inhibitor at single-digit ppm and as a pigment dispersant."
  },
  {
    name: "Poly(lactide)-b-poly(ethylene oxide)-b-poly(lactide)", aka: ["PLA-PEG-PLA", "PDLLA-PEG-PDLLA", "PLA-PEO-PLA"],
    type: "copolymer", arch: "block", components: ["Poly(lactide)", "Poly(ethylene oxide)"],
    monomer: "Lactide + ethylene oxide", cls: "Block copolymer (reverse thermal gelling triblock)", cas: null,
    tags: ["copolymer", "block", "biodegradable", "biomedical", "drug delivery", "polyester", "polyether", "water-soluble"],
    note: "An injectable depot that needs no crosslinker: cold, it is a free-flowing sol, and on warming toward body temperature the polylactide end-blocks dehydrate and aggregate, each chain bridging between micellar junctions into a percolated gel. Release is then governed jointly by diffusion and by hydrolysis of the polylactide junctions. The sol-gel window is very sensitive to the PEG block length and the lactide:ethylene oxide ratio, so small compositional changes move it out of the useful range. Distinct from the PLGA-PEG-PLGA thermogel sold as ReGel, and from the inverted PEG-PLLA-PEG triblock of the original 1997 report."
  },
  {
    name: "Poly(dimethylsiloxane)-b-poly(ethylene oxide)", aka: ["PDMS-b-PEO", "silicone polyether", "dimethicone copolyol", "polyether-modified silicone"],
    type: "copolymer", arch: "block", components: ["Poly(dimethylsiloxane)", "Poly(ethylene oxide)"],
    monomer: "Dimethylsiloxane + ethylene oxide", cls: "Block copolymer (silicone polyether surfactant)", cas: null,
    tags: ["copolymer", "block", "silicone", "surfactant", "amphiphilic", "self-assembly", "coating", "specialty"],
    note: "The siloxane block sits near 20 mN/m, so the surface-energy gap across the junction drives the molecule to any interface and pulls surface tension below what a hydrocarbon surfactant can reach. Silicone polyethers are the cell stabilisers of polyurethane foam: they emulsify the reacting mix, nucleate bubbles, and hold the draining cell walls open by the Gibbs-Marangoni effect until gelation. Worth knowing which architecture you have - most commercial foam stabiliser tonnage is a graft or rake copolymer with polyether combs hung off a siloxane backbone, and the genuinely linear AB and ABA grades described here are a smaller, separately patented class."
  },
  {
    name: "Poly(butylene terephthalate)-b-poly(tetrahydrofuran)", aka: ["PBT-b-PTMO", "copolyester-ether elastomer", "COPE", "TPC-ET", "Hytrel", "Arnitel"],
    type: "copolymer", arch: "block", components: ["Poly(butylene terephthalate)", "Poly(tetrahydrofuran)"],
    monomer: "Dimethyl terephthalate + 1,4-butanediol + poly(tetramethylene ether) glycol", cls: "Segmented block copolymer (thermoplastic elastomer)", cas: null,
    tags: ["copolymer", "block", "elastomer", "thermoplastic elastomer", "polyester", "polyether", "engineering", "specialty"],
    note: "The polyester counterpart of polyether block amide, and the other half of the segmented-TPE pair: crystalline PBT hard segments form lamellae that act as both physical crosslinks and reinforcing filler on a rubbery poly(tetramethylene oxide) matrix, adding the tear strength, creep resistance and hot-oil resistance the styrenic triblocks lack. Modulus and service temperature scale almost linearly with hard-segment weight fraction, which is what separates the grades. Like PEBA it is a segmented (AB)n multiblock from melt transesterification, with statistical segment lengths rather than a discrete ABA architecture."
  }
,
  {
    name: "Polynorbornene", aka: ["PNB", "poly(norbornene)", "polynorbornylene"], monomer: "norbornene (bicyclo[2.2.1]hept-2-ene)",
    cls: "Ring-opening", cas: "25038-76-0",
    tags: ["elastomer", "specialty"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 2 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 3, order: 1 }, { a: 5, b: "S1", order: 1 }],
    note: "The polymer ROMP was built for. Norbornene carries about 27 kcal/mol of ring strain, and relieving it drives metathesis to completion, which is why norbornene macromonomers are the standard route to bottlebrush polymers. Ring-opening is an isomerisation, so the repeat unit has the same formula as the monomer. Commercially it is sold as an oil-extended damping rubber."
  },
  {
    name: "Deoxyribonucleic acid", aka: ["DNA", "dsDNA", "deoxyribonucleic acid", "double-stranded DNA"], monomer: "deoxyribonucleoside 5'-triphosphates (dA, dC, dG, dT)",
    cls: "Step-growth (polyester)", cas: "9007-49-2",
    tags: ["biopolymer", "biomedical", "water-soluble", "self-assembly", "specialty"],
    verified: false,
    needsStructure: true,
    atoms: [],
    bonds: [],
    note: "Carried without a drawn repeat unit, and not as a gap to be filled later: DNA has FOUR repeat units, not one. The backbone is a regular phosphodiester-linked deoxyribose, but each sugar bears one of four bases, so no single graph describes the chain the way one does for a synthetic homopolymer. The structure search matches repeat-unit graphs and would have nothing correct to match against. As a polymer it is a semiflexible polyanion with a persistence length near 50 nm, about a hundred times a synthetic coil, which is why it behaves like no other water-soluble polymer at the same molar mass."
  },
  {
    name: "Poly(norbornene)-graft-poly(ethylene glycol)", aka: ["PNB-g-PEG", "polynorbornene-g-PEG", "PEG bottlebrush", "bottlebrush PEG"],
    type: "copolymer", arch: "bottlebrush", components: ["Polynorbornene", "Poly(ethylene oxide)"],
    monomer: "PEG-functional norbornene macromonomer", cls: "Bottlebrush copolymer (ROMP grafting-through)", cas: null,
    tags: ["copolymer", "bottlebrush", "polyether", "water-soluble", "drug delivery", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: "S1", el: "*" }, { id: 8, el: "C" }, { id: 9, el: "N" }, { id: 10, el: "C" }, { id: 11, el: "O" }, { id: 12, el: "O" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "O" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "O" }, { id: 19, el: "C" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 2 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 3, order: 1 }, { a: 5, b: "S1", order: 1 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 7, order: 1 }, { a: 8, b: 11, order: 2 }, { a: 10, b: 12, order: 2 }, { a: 9, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 1 }, { a: 16, b: 17, order: 1 }, { a: 17, b: 18, order: 1 }, { a: 18, b: 19, order: 1 }],
    repeats: [
      { ends: ["S0", "S1"], label: "m", role: "backbone" },
      { unit: [16, 17, 18], cuts: [[15, 16], [18, 19]], label: "n", role: "sidechain" }
    ],
    note: "The workhorse bottlebrush, and the reason ring-opening metathesis is the default route to this architecture. A PEG chain is capped with a norbornene and that macromonomer is polymerised through its strained ring by a fast-initiating Grubbs catalyst, so every backbone repeat carries a side chain by construction rather than by chance. Grafting-through guarantees the grafting density instead of hoping for it, which is why it dominates despite the macromonomer being the expensive part. The crowded PEG corona forces the backbone to extend, so the molecule behaves as a soft cylinder rather than a coil, and a drug attached to the backbone sits shielded inside a stealth shell."
  },
  {
    name: "Poly(norbornene)-graft-poly(lactide)", aka: ["PNB-g-PLA", "polynorbornene-g-PLA", "PLA bottlebrush"],
    type: "copolymer", arch: "bottlebrush", components: ["Polynorbornene", "Poly(lactide)"],
    monomer: "polylactide-functional norbornene macromonomer", cls: "Bottlebrush copolymer (ROMP grafting-through)", cas: null,
    tags: ["copolymer", "bottlebrush", "polyester", "biodegradable", "self-assembly", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: "S1", el: "*" }, { id: 8, el: "C" }, { id: 9, el: "N" }, { id: 10, el: "C" }, { id: 11, el: "O" }, { id: 12, el: "O" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "O" }, { id: 16, el: "C" }, { id: 17, el: "O" }, { id: 18, el: "C" }, { id: 19, el: "C" }, { id: 20, el: "O" }, { id: 21, el: "C" }, { id: 22, el: "O" }, { id: 23, el: "C" }, { id: 24, el: "C" }, { id: 25, el: "O" }, { id: 26, el: "H" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 2 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 3, order: 1 }, { a: 5, b: "S1", order: 1 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 7, order: 1 }, { a: 8, b: 11, order: 2 }, { a: 10, b: 12, order: 2 }, { a: 9, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 1 }, { a: 16, b: 17, order: 2 }, { a: 16, b: 18, order: 1 }, { a: 18, b: 19, order: 1 }, { a: 18, b: 20, order: 1 }, { a: 20, b: 21, order: 1 }, { a: 21, b: 22, order: 2 }, { a: 21, b: 23, order: 1 }, { a: 23, b: 24, order: 1 }, { a: 23, b: 25, order: 1 }, { a: 25, b: 26, order: 1 }],
    repeats: [
      { ends: ["S0", "S1"], label: "m", role: "backbone" },
      { unit: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25], cuts: [[15, 16], [25, 26]], label: "n", role: "sidechain" }
    ],
    note: "The degradable bottlebrush, and the one that makes the architecture visible to the eye. Bottlebrush block copolymers assemble into lamellae with periods of hundreds of nanometres against the tens a linear block copolymer manages, because the crowded side chains stretch the backbone and there are no entanglements to slow the ordering. Those periods fall in the range of visible wavelengths, so the films are structurally coloured photonic crystals whose reflected colour is set by molar mass alone. The polylactide side chains then hydrolyse, which a polystyrene brush will not."
  },
  {
    name: "Molecular bottlebrush by ATRP grafting-from", aka: ["molecular brush", "PBiBEM-g-PMMA", "grafting-from bottlebrush", "polymer brush (molecular)"],
    type: "copolymer", arch: "bottlebrush", components: ["Poly(2-hydroxyethyl methacrylate)", "Poly(methyl methacrylate)"],
    monomer: "poly(2-(2-bromoisobutyryloxy)ethyl methacrylate) macroinitiator, then grafted monomer", cls: "Bottlebrush copolymer (ATRP grafting-from)", cas: null,
    tags: ["copolymer", "bottlebrush", "acrylic", "methacrylate", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "O" }, { id: 10, el: "C" }, { id: 11, el: "O" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "C" }, { id: 19, el: "O" }, { id: 20, el: "O" }, { id: 21, el: "C" }, { id: 22, el: "Br" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: "S1", order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 10, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 12, b: 14, order: 1 }, { a: 12, b: 15, order: 1 }, { a: 15, b: 16, order: 1 }, { a: 16, b: 17, order: 1 }, { a: 16, b: 18, order: 1 }, { a: 18, b: 19, order: 2 }, { a: 18, b: 20, order: 1 }, { a: 20, b: 21, order: 1 }, { a: 16, b: 22, order: 1 }],
    repeats: [
      { ends: ["S0", "S1"], label: "m", role: "backbone" },
      { unit: [15, 16, 17, 18, 19, 20, 21], cuts: [[12, 15], [16, 22]], label: "n", role: "sidechain" }
    ],
    note: "The other route, and the one that inverts the trade-off. Rather than polymerising a pre-made side chain, a backbone is built carrying an initiator on every repeat - typically by esterifying poly(2-hydroxyethyl methacrylate) with a bromoisobutyryl group - and the side chains are grown outward by atom transfer radical polymerisation. The backbone can be made very long, which grafting-through struggles with, but the side chains grow crowded together where radicals sit close, so termination between neighbours becomes the limiting problem and conversion is deliberately kept low. Grafting-through buys certainty about grafting density; grafting-from buys backbone length. Neither gives both."
  },
  {
    name: "Bottlebrush poly(dimethylsiloxane) elastomer", aka: ["PDMS bottlebrush elastomer", "supersoft elastomer", "solvent-free gel"],
    type: "copolymer", arch: "bottlebrush", components: ["Poly(dimethylsiloxane)", "Poly(methyl methacrylate)"],
    monomer: "PDMS methacrylate macromonomer, crosslinked", cls: "Bottlebrush network (elastomer)", cas: null,
    tags: ["copolymer", "bottlebrush", "elastomer", "silicone", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "Si" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "O" }, { id: 14, el: "Si" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: "S1", order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 10, b: 12, order: 1 }, { a: 10, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 14, b: 16, order: 1 }, { a: 14, b: 17, order: 1 }],
    repeats: [
      { ends: ["S0", "S1"], label: "m", role: "backbone" },
      { unit: [10, 11, 12, 13], cuts: [[9, 10], [13, 14]], label: "n", role: "sidechain" }
    ],
    note: "A way to make a solid as soft as tissue with no solvent in it. An ordinary elastomer cannot be softened much below about 100 kPa, because softening means lengthening the strands between crosslinks and entanglements then take over. Grafting dense side chains onto those strands dilutes the entanglements from the inside: the side chains hold neighbouring backbones apart, and the network reaches a few kPa while staying completely dry. Conventional gels reach that softness only by holding solvent, which evaporates or leaches out. These match the stiffness of brain and fat tissue and stay where they are put."
  },
  {
    name: "DNA bottlebrush", aka: ["DNA molecular brush", "DNA-polymer bottlebrush", "brush DNA"],
    type: "copolymer", arch: "bottlebrush", components: ["Deoxyribonucleic acid", "Poly(ethylene oxide)"],
    monomer: "DNA macromonomer, or synthetic backbone grafted with DNA", cls: "Bottlebrush copolymer (nucleic acid hybrid)", cas: null,
    tags: ["copolymer", "bottlebrush", "biopolymer", "self-assembly", "drug delivery", "biomedical", "specialty"],
    note: "A bottlebrush with DNA as one of its two components, either as side chains grafted from a synthetic backbone or as a main chain wearing a synthetic corona. The corona stiffens the DNA substantially: effective persistence lengths near 250 nm have been measured by nanopore and by AFM, against 50 nm for bare duplex DNA. That stiffening does not by itself buy liquid crystallinity, because the corona thickens the molecule faster than it rigidifies it, so the effective aspect ratio of persistence length over diameter actually falls. See the Chain Dimensions tool, where those numbers appear and a persistence length can be turned into a real chain size."
  },
  {
    name: "Brush-arm star polymer", aka: ["BASP", "brush-arm star", "PEG BASP", "brush-first star polymer"],
    type: "copolymer", arch: "bottlebrush", components: ["Polynorbornene", "Poly(ethylene oxide)"],
    monomer: "PEG-norbornene macromonomer, then a bis-norbornene crosslinker", cls: "Bottlebrush copolymer (ROMP grafting-through)", cas: null,
    tags: ["copolymer", "bottlebrush", "polyether", "water-soluble", "self-assembly", "drug delivery", "biomedical", "specialty"],
    note: "The brush-first route, and the reason a bottlebrush can be turned into a nanoparticle without a template. Macromonomers are polymerised first to give living bottlebrushes; a bis-norbornene crosslinker is then added and couples those brushes together through their living chain ends, so the arms of the resulting star are themselves bottlebrushes rather than linear chains. Particle size is set by how much crosslinker is added, which makes a size series a matter of pipetting rather than of new synthesis. The original report used a photodegradable o-nitrobenzyl crosslinker and nitroxide labels, so the core could be cut with UV light and the core and shell environments distinguished by EPR. Liu, Burts and co-workers (Johnson group, MIT), J. Am. Chem. Soc. 2012, 134, 16337."
  },
  {
    name: "Mikto-brush-arm star polymer", aka: ["MBASP", "mikto-BASP", "mikto-brush-arm star", "miktoarm brush-arm star polymer"],
    type: "copolymer", arch: "bottlebrush", components: ["Poly(ethylene oxide)", "Polystyrene"],
    monomer: "PEG-norbornene and polystyrene-norbornene macromonomers, crosslinked together", cls: "Bottlebrush copolymer (ROMP grafting-through)", cas: null,
    tags: ["copolymer", "bottlebrush", "polyether", "styrenic", "self-assembly", "specialty"],
    note: "What happens when two different bottlebrushes are crosslinked into the same star. Each macromonomer is polymerised separately to a living bottlebrush, the two are mixed in a chosen ratio, and only then is the crosslinker added, so composition is set by a mixing ratio rather than by making a new macromonomer for every point in the series. Because the arms are homopolymer brushes rather than brushes with mixed side chains, the domains inside one particle can be large. Hydrodynamic diameters were 28-32 nm in THF at every composition, both blocks being solvated; in water the polystyrene-rich particles aggregate instead, reaching about 166 nm, while PEG-rich ones stay single molecules with the polystyrene arms shielded. Irradiating the photocleavable core at 365 nm releases the arms as roughly 10 nm bottlebrushes. Shibuya, Nguyen and Johnson (MIT), ACS Macro Lett. 2017, 6, 963."
  },
  {
    name: "Poly(norbornene)-graft-poly(2-ethyl-2-oxazoline)", aka: ["PNB-g-PEtOx", "polyoxazoline bottlebrush", "POx bottlebrush", "PEtOx bottlebrush"],
    type: "copolymer", arch: "bottlebrush", components: ["Polynorbornene", "Poly(2-ethyl-2-oxazoline)"],
    monomer: "norbornene-terminated poly(2-ethyl-2-oxazoline) macromonomer", cls: "Bottlebrush copolymer (ROMP grafting-through)", cas: null,
    tags: ["copolymer", "bottlebrush", "water-soluble", "biomedical", "specialty"],
    needsStructure: true,
    note: "A bottlebrush whose side chains are polyoxazoline rather than PEG. Polyoxazoline is water-soluble and stealthy like PEG but is a polyamide, so it is not degraded by the oxidative chemistry that eventually cuts a polyether, which matters for anything meant to circulate. The side chains are made by cationic ring-opening polymerisation from methyl tosylate and terminated onto a norbornene acid, then that macromonomer is polymerised through its strained ring by a Grubbs third-generation catalyst. Crosslinking those brushes brush-first gave stars of 21-27 nm. Their point was metal-free MRI contrast: a nitroxide radical carried at the core-shell interface gave transverse relaxivities of 1.83-2.28 per mM per s, against 0.14-0.19 for the longitudinal - an organic contrast agent that avoids gadolinium entirely. Alvaradejo and co-workers (Johnson group, MIT), ACS Macro Lett. 2019, 8, 473. Structure not drawn: the paper does not give the norbornene acid used to cap the chain, so the linker would have to be invented."
  },
  {
    name: "Bottlebrush prodrug", aka: ["bottlebrush polymer prodrug", "drug-loaded bottlebrush", "bivalent brush polymer", "polymer prodrug bottlebrush"],
    type: "copolymer", arch: "bottlebrush", components: ["Polynorbornene", "Poly(ethylene oxide)"],
    monomer: "drug-bearing PEG-norbornene macromonomer", cls: "Bottlebrush copolymer (ROMP grafting-through)", cas: null,
    tags: ["copolymer", "bottlebrush", "polyether", "drug delivery", "biomedical", "water-soluble", "specialty"],
    note: "The argument for grafting-through in one line: the drug is attached to the macromonomer before polymerisation, so loading is fixed by the monomer rather than left to a post-polymerisation coupling that never quite goes to completion. Every repeat carries its drug, and the batch has one composition rather than a distribution of them. The first version carried doxorubicin and camptothecin on the same PEG-norbornene macromonomer through a photocleavable linker, and was about thirty times more toxic to cells after irradiation than before. The later work made the linker the design variable rather than the payload: tuning traceless linkers so that release kinetics measured in vitro predicted what the drug did in a tumour, which turned prodrug design into something you can calculate instead of screen. Johnson, Lu, Burts and co-workers, Macromolecules 2010, 43, 10326; Vohidov and co-workers (Johnson group, MIT), J. Am. Chem. Soc. 2021, 143, 4714."
  },
  {
    name: "Janus bottlebrush", aka: ["Janus bottlebrush polymer", "A-branch-B bottlebrush", "Janus brush", "core-shell Janus brush"],
    type: "copolymer", arch: "bottlebrush", components: ["Polystyrene", "Poly(lactide)"],
    monomer: "A-branch-B diblock macromonomer with norbornene at the junction", cls: "Bottlebrush copolymer (ROMP grafting-through)", cas: null,
    tags: ["copolymer", "bottlebrush", "styrenic", "polyester", "self-assembly", "specialty"],
    note: "A bottlebrush that is two-faced along its own length rather than divided into blocks down the backbone. The trick is where the polymerisable group sits: a diblock side chain is made first and the norbornene is installed at the junction between the two blocks, so on polymerisation each repeat projects one polystyrene arm and one polylactide arm from the same point. The backbone then runs down the middle of a molecule that is polystyrene on one side and polylactide on the other, which is a shape that cannot be reached by making the two side chains separately. Kawamoto, Zhong and co-workers (Johnson group, MIT, with Ross and Alexander-Katz), J. Am. Chem. Soc. 2016, 138, 11501."
  },
  {
    name: "Poly(oligo(ethylene glycol) methyl ether methacrylate)", aka: ["POEGMA", "POEGMEMA", "PEGMA brush", "oligo(ethylene glycol) methacrylate brush", "PEG methacrylate brush"],
    arch: "bottlebrush",
    monomer: "oligo(ethylene glycol) methyl ether methacrylate", cls: "Addition (methacrylate)", cas: "25736-86-1",
    tags: ["bottlebrush", "methacrylate", "polyether", "water-soluble", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "O" }, { id: 10, el: "C" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: "S1", order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }],
    repeats: [
      { ends: ["S0", "S1"], label: "m", role: "backbone" },
      { unit: [7, 8, 9], cuts: [[6, 7], [9, 10]], label: "n", role: "sidechain" }
    ],
    note: "The bottlebrush most people actually use, and the one that needs no special chemistry to make. The monomer is sold ready-made as a methacrylate carrying a short methyl-capped PEG tail, so an ordinary radical polymerisation of it gives a brush directly - no macromonomer synthesis, no metathesis catalyst. Grafting density is perfect by construction because every repeat is a macromonomer. Short tails (n of about 4 to 9) give a comb rather than a true brush, and the transition is gradual, which is why the same material gets called both. Sold as OEGMA300 and OEGMA500 after the tail's nominal mass; the CAS is for the monomer, since the polymer is defined by whichever tail length was bought. Widely used as a non-fouling, PEG-like coating where the polyether has to stay attached to something."
  },
  {
    name: "Poly(norbornene)-graft-polystyrene", aka: ["PNB-g-PS", "polystyrene bottlebrush", "PS bottlebrush", "polynorbornene-g-PS"],
    type: "copolymer", arch: "bottlebrush", components: ["Polynorbornene", "Polystyrene"],
    monomer: "polystyrene-functional norbornene macromonomer", cls: "Bottlebrush copolymer (ROMP grafting-through)", cas: null,
    tags: ["copolymer", "bottlebrush", "styrenic", "self-assembly", "specialty"],
    note: "The hydrophobic counterpart to the PEG bottlebrush, and the block that supplies the high-refractive-index or glassy half of most bottlebrush assemblies. Polystyrene is made first by a controlled radical polymerisation and then joined to a norbornene, commonly by copper-catalysed azide-alkyne coupling of an azide-terminated chain to a norbornene alkyne, before being polymerised through the ring. Because the side chains are glassy and immiscible with PEG, the two brushes segregate rather than mix, which is what makes them useful together. Structure not drawn: the norbornene alkyne precursor differs between reports, so the linker joining side chain to backbone would have to be invented."
  },
  {
    name: "Brush block copolymer photonic crystal", aka: ["photonic bottlebrush", "brush block copolymer", "structurally coloured brush polymer", "polyisocyanate brush block copolymer"],
    type: "copolymer", arch: "bottlebrush", components: ["Polynorbornene", "Polystyrene"],
    monomer: "rigid polyisocyanate macromonomers of differing side group", cls: "Bottlebrush copolymer (ROMP grafting-through)", cas: null,
    tags: ["copolymer", "bottlebrush", "self-assembly", "optical", "specialty"],
    note: "Colour from architecture rather than from any dye. Two bottlebrush blocks of different composition segregate into layers, and because a crowded brush is forced into an extended cylinder rather than a coil, the layer spacing lands in the hundreds of nanometres where visible and near-infrared light is reflected. Brushes also order in minutes rather than the long annealing a linear block copolymer of the same period would need, because there are no entanglements to unpick. The polymers that established this used rigid helical polyisocyanate side chains from hexyl and 4-phenylbutyl isocyanate, reached molar masses of 1.5 to 7 MDa, and reflected across the ultraviolet, visible and near-infrared - the near-infrared version was proposed as a heat-rejecting paint. Miyake, Weitekamp, Piunova and Grubbs, J. Am. Chem. Soc. 2012, 134, 14249."
  },
  {
    name: "Macrocyclic bottlebrush", aka: ["cyclic bottlebrush", "ring bottlebrush polymer", "macrocyclic brush"],
    arch: "bottlebrush",
    monomer: "cyclic polymer backbone by ring-expansion polymerisation, then grafting-from", cls: "Addition (vinyl)", cas: null,
    tags: ["bottlebrush", "self-assembly", "specialty"],
    atoms: [], bonds: [],
    needsStructure: true,
    note: "A bottlebrush with no chain ends. The backbone is grown as a macrocycle by ring-expansion polymerisation, then side chains are grown outward from every repeat by atom transfer radical polymerisation, giving molar masses into the megadaltons that can be seen directly as rings by atomic force microscopy. Removing the ends changes real behaviour and not just the drawing: a ring cannot reptate, so it relaxes and diffuses differently from a linear brush of the same mass, and it has no end groups to react or degrade from. Pal, Miao, Garrison, Veige and Sumerlin, Macromolecules 2020, 53, 9717. Structure not drawn: the repeat unit alone cannot express that the backbone closes on itself, which is the whole point of the molecule."
  },
  {
    name: "Core-shell cyclic bottlebrush", aka: ["nanobowl bottlebrush", "amphiphilic cyclic bottlebrush", "core-shell brush macrocycle"],
    type: "copolymer", arch: "bottlebrush", components: ["Polystyrene", "Poly(acrylic acid)"],
    monomer: "cyclic backbone grafted with polystyrene-block-poly(acrylic acid) side chains", cls: "Bottlebrush copolymer (ROMP grafting-through)", cas: null,
    tags: ["copolymer", "bottlebrush", "styrenic", "self-assembly", "specialty"],
    note: "A macrocyclic bottlebrush whose side chains are themselves diblocks, hydrophobic polystyrene next to the backbone and hydrophilic poly(acrylic acid) outside, so each molecule is a core-shell cylinder closed into a ring. Exchanging the solvent from tetrahydrofuran to water walks the assemblies through spheres, then porous spheres, then nanobowls - spheres with a single large opening. A linear bottlebrush of matched backbone and side-chain lengths stops at porous spheres under the same conditions, so the ring topology is doing the work, apparently by changing how fast the aggregate's interior stiffens as solvent leaves. Pal, Garrison, Miao, Diodati, Veige and Sumerlin, Macromolecules 2022, 55, 7446."
  },
  {
    name: "Cationic bottlebrush polymer", aka: ["pDMAEMA bottlebrush", "bottleplex", "cationic brush vector", "gene delivery bottlebrush"],
    type: "copolymer", arch: "bottlebrush", components: ["Polynorbornene", "Poly(2-(dimethylamino)ethyl methacrylate)"],
    monomer: "pDMAEMA macromonomer with a norbornene end", cls: "Bottlebrush copolymer (ROMP grafting-through)", cas: null,
    tags: ["copolymer", "bottlebrush", "methacrylate", "water-soluble", "drug delivery", "biomedical", "specialty"],
    note: "A polycation shaped as a brush instead of a chain, made to carry plasmid DNA into cells. Backbone length was varied over degrees of polymerisation of 13, 20, 26 and 37 while every side chain was held at 57 units, which separates the effect of architecture from the effect of chemistry - the linear macromonomer is the control, and it is the same molecule that makes up the arms. The complexes with DNA, called bottleplexes, gave up to about sixty times more cells expressing the delivered gene than the linear building block, and expression rose with backbone length. Both architectures got the DNA inside cells about equally well, so the advantage lies after uptake rather than in it. Dalal, Kumar, Ohnsorg, Brown and Reineke, ACS Macro Lett. 2021, 10, 886."
  },
  {
    name: "Linear-bottlebrush-linear triblock hydrogel", aka: ["LBL copolymer", "PNIPAM-bbPEG-PNIPAM", "injectable bottlebrush hydrogel", "bottlebrush triblock gel"],
    type: "copolymer", arch: "bottlebrush", components: ["Poly(ethylene oxide)", "Poly(N-isopropylacrylamide)"],
    monomer: "PEG macromonomer for the brush block, N-isopropylacrylamide for the linear ends", cls: "Bottlebrush copolymer (ROMP grafting-through)", cas: null,
    tags: ["copolymer", "bottlebrush", "polyether", "hydrogel", "biomedical", "specialty"],
    note: "An injectable gel that solves two opposite problems with one architecture. The middle block is a PEG bottlebrush, which is compact and barely entangled, so the solution stays thin enough to push through a needle; the linear poly(N-isopropylacrylamide) ends are thermoresponsive and aggregate the moment they reach body temperature, so it sets on arrival with no crosslinking chemistry and nothing to leach. The result matches the deformation response of adipose and brain tissue, stays below about 1 kPa in modulus while surviving 700 percent deformation, and does not expel its water on gelling, which is the usual failure of a physically set gel. Vashahi, Martinez and co-workers (Sheiko and Matyjaszewski groups), Sci. Adv. 2022. See also the dry analogue, the PMMA-bottlebrush-PDMS-PMMA thermoplastic elastomer that this work uses as its comparison."
  },
  {
    name: "DNA-backbone bottlebrush", aka: ["DNA-backboned bottlebrush polymer", "PEGylated oligonucleotide hairpin", "DNA-g-PEG brush"],
    type: "copolymer", arch: "bottlebrush", components: ["Deoxyribonucleic acid", "Poly(ethylene oxide)"],
    monomer: "site-specifically PEGylated oligonucleotide", cls: "Bottlebrush copolymer (nucleic acid hybrid)", cas: null,
    tags: ["copolymer", "bottlebrush", "biopolymer", "water-soluble", "drug delivery", "biomedical", "specialty"],
    note: "The inverse of the usual arrangement: the DNA is the backbone and the synthetic polymer is the corona. PEG chains are attached at chosen positions along an oligonucleotide hairpin, so the sequence still does its job - the hairpins undergo hybridisation chain reaction essentially as well as unmodified ones - while the crowded PEG shell keeps nucleases off. The result resists enzymatic digestion, melts at a higher temperature, and stays in the blood longer, which is what a DNA nanostructure needs before it can be a therapeutic rather than a demonstration. Jia, Wang, Lu and co-workers (Ke Zhang group, Northeastern), Nano Lett. 2018, 18, 7378."
  },
  {
    name: "Oligonucleotide macromonomer bottlebrush", aka: ["protDNA bottlebrush", "DNA-PEG bottlebrush", "Y-shaped DNA macromonomer brush"],
    type: "copolymer", arch: "bottlebrush", components: ["Deoxyribonucleic acid", "Poly(ethylene oxide)"],
    monomer: "norbornene-protected-oligonucleotide-PEG macromonomer", cls: "Bottlebrush copolymer (nucleic acid hybrid)", cas: null,
    tags: ["copolymer", "bottlebrush", "biopolymer", "water-soluble", "self-assembly", "biomedical", "specialty"],
    note: "A way of deciding where in a bottlebrush the DNA sits. Protecting an oligonucleotide so it dissolves in organic solvent lets it be built into a macromonomer alongside PEG, and a custom norbornene phosphoramidite puts the polymerisable group wherever it is wanted along that macromonomer. Put the norbornene at the far end and the result is a linear norbornene-DNA-PEG arm with PEG at the periphery; put it at the junction and the arm is Y-shaped, with DNA and PEG both projecting from the backbone. The same components therefore give a brush with the PEG buried or exposed, which is an unusual amount of control over where each block ends up. Lu, Cai and co-workers (Ke Zhang group, Northeastern), Macromolecules 2022, 55, 2235."
  },
  {
    name: "DNA-grafted polypeptide bottlebrush", aka: ["DNA-polypeptide molecular brush", "polypeptide bottlebrush", "DNA-g-polypeptide"],
    arch: "bottlebrush",
    monomer: "alkyne-bearing polypeptide backbone, then azide-DNA by click coupling", cls: "Ring-opening (polyamide)", cas: null,
    tags: ["bottlebrush", "biopolymer", "self-assembly", "biomedical", "specialty"],
    atoms: [], bonds: [],
    needsStructure: true,
    note: "A bottlebrush built by grafting-onto, with a polypeptide backbone made by ring-opening polymerisation of an N-carboxyanhydride and DNA strands clicked onto it afterwards. Grafting-onto is the awkward one of the three strategies - the side chains have to find their attachment points against increasing crowding, so density is never guaranteed the way grafting-through guarantees it - but it is the only route when both blocks must be made under conditions the other would not survive, which is the case for a polypeptide and an oligonucleotide. Chen, Li, Liu and Li (Chinese Academy of Sciences and Tsinghua), Macromolecules 2012. Not listed as a copolymer of two library entries: the library has no polypeptide to point at, and naming a stand-in would put a component in the data that is not in the molecule."
  },
  {
    name: "Poly(vinyl alcohol)-graft-poly(ethylene oxide)", aka: ["PVA-g-PEO", "PVA-g-PEO bottlebrush", "polyvinyl alcohol bottlebrush"],
    type: "copolymer", arch: "bottlebrush", components: ["Poly(vinyl alcohol)", "Poly(ethylene oxide)"],
    monomer: "poly(vinyl alcohol) backbone grafted with poly(ethylene oxide)", cls: "Bottlebrush copolymer (ROMP grafting-through)", cas: null,
    tags: ["copolymer", "bottlebrush", "polyether", "water-soluble", "specialty"],
    note: "The model system for asking what a bottlebrush actually looks like in water, chosen because both blocks are simple, water-soluble and well parameterised for simulation. Atomistic molecular dynamics on cyclic and linear versions found the side-chain length to be the variable that matters most: short side chains leave the backbone flexible and the molecule coil-like, and only past a certain length does the crowding force the extended cylinder that the word bottlebrush implies. The cyclic and linear forms converge as side chains lengthen, because a long enough corona hides what the backbone is doing. Chen and Dormidontova, Macromolecules 2023, 56, 3286. Structure not drawn: the graft junction depends on how the poly(vinyl alcohol) hydroxyls were derivatised, which varies between preparations."
  },
  {
    name: "Aggrecan", aka: ["aggrecan proteoglycan", "cartilage proteoglycan", "bottlebrush proteoglycan", "CSPG core protein"],
    arch: "bottlebrush",
    monomer: "core protein bearing chondroitin sulfate and keratan sulfate chains", cls: "Step-growth (polyamide)", cas: null,
    tags: ["bottlebrush", "biopolymer", "biomedical", "specialty"],
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The bottlebrush that biology got to first. A protein backbone carries a hundred or so sulfated glycosaminoglycan chains, and many aggrecan molecules in turn attach to a single hyaluronan chain, so cartilage is packed with brushes hanging off brushes. The side chains are densely negatively charged, so they repel each other, hold water under load, and give cartilage its compressive stiffness - the same crowding argument as a synthetic brush, arrived at without a catalyst. Around cells the layer is thick enough to gate access to the surface: adding aggrecan to chondrocytes or mesenchymal stem cells thickened the pericellular matrix about two and a half times, from roughly 7 to 18 micrometres, and the layer sieves nanoparticles by size while trapping positively charged molecules on the sulfate. Chang, McLane and co-workers (Curtis group, Georgia Tech), Biophys. J. 2016."
  },
  {
    name: "Mucin", aka: ["mucin glycoprotein", "MUC5AC", "MUC2", "salivary mucin", "bottlebrush glycoprotein"],
    arch: "bottlebrush",
    monomer: "serine- and threonine-rich protein backbone bearing O-linked glycans", cls: "Step-growth (polyamide)", cas: null,
    tags: ["bottlebrush", "biopolymer", "biomedical", "specialty"],
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The other biological bottlebrush, and the reason mucus behaves as it does. Long stretches of the protein backbone are rich in serine and threonine, and each carries an O-linked sugar chain, so the glycosylated regions are brushes while the sparsely glycosylated regions between them stay flexible and can crosslink. The crowded glycans hold water, make the molecule extended and stiff, and give mucus its lubricity and its selectivity as a barrier - a synthetic brush is often justified by pointing at exactly these properties. Studied here as the natural template rather than from any single paper; treat the composition as variable, since mucins differ by tissue and their glycosylation is not a fixed structure."
  },
  {
    name: "Bottlebrush by grafting-onto", aka: ["grafting-onto bottlebrush", "graft-onto molecular brush", "coupled-side-chain bottlebrush"],
    arch: "bottlebrush",
    monomer: "reactive backbone plus end-functional side chains, coupled together", cls: "Addition (vinyl)", cas: null,
    tags: ["bottlebrush", "self-assembly", "specialty"],
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The third route to a bottlebrush, and the one that trades certainty for freedom. Backbone and side chains are made separately, each under whatever conditions suit it, and joined afterwards through a reactive pair - usually an azide and an alkyne, because that coupling still works when the site is crowded. The freedom is real: the two blocks never have to tolerate each other's chemistry, which is the only way to combine, say, a polypeptide with an oligonucleotide. The cost is that the last side chains have to reach attachment points already surrounded by the ones that got there first, so grafting density falls short of one per repeat and is never quite known. Grafting-through guarantees density but needs a macromonomer; grafting-from gives long backbones but crowds the growing radicals; grafting-onto is the fallback when neither block can be made in the other's presence. Reviewed by Verduzco, Li, Pesek and Stein, Chem. Soc. Rev. 2015, 44, 2405, and by Mullner, Chem. Commun. 2022, 58, 5683."
  }
];

// Provenance / copyright-management information for the dataset above. Not
// consumed by the site; it travels with any wholesale copy of this file and
// lets a copied dataset be traced back to PolyTechniques. Do not remove.
window.POLYMER_DB_META = {
  source: "PolyTechniques — getpolytechniques.com",
  author: "Nicholas Pierini",
  copyright: "© 2025-2026 Nicholas Pierini. All rights reserved.",
  license: "Proprietary. See terms.html. No reuse without written permission.",
  signature: "PT-DB-f42f549c0d74a6c90d1c2dd9cba3e442"
};
