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
    name: "Poly(2-hydroxyethyl methacrylate)", aka: ["PHEMA"], monomer: "2-Hydroxyethyl methacrylate",
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
    note: "A bottlebrush with DNA as one of its two components, either as side chains grafted from a synthetic backbone or as a main chain wearing a synthetic corona. The corona stiffens the DNA substantially: effective persistence lengths near 250 nm have been measured by nanopore and by AFM, against 50 nm for bare duplex DNA. The stiffening does not translate into a more rod-like molecule, because the corona thickens it faster than it rigidifies it, so the effective aspect ratio of persistence length over diameter falls. It does not follow that liquid crystallinity is lost: a measured case still formed lyotropic phases, and at a lower concentration than bare DNA, because what the corona costs in aspect ratio it more than repays in excluded volume. See the Chain Dimensions tool, where those numbers appear and a persistence length can be turned into a real chain size, and the self-assembled DNA bottlebrush entry for the measurement."
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
  },
  {
    name: "Self-assembled DNA bottlebrush", aka: ["protein-grafted DNA bottlebrush", "electrostatic DNA brush", "C4K12 DNA bottlebrush"],
    arch: "bottlebrush",
    monomer: "duplex DNA with a diblock protein polymer adsorbed along it", cls: "Step-growth (polyester)", cas: null,
    tags: ["bottlebrush", "biopolymer", "water-soluble", "self-assembly", "specialty"],
    atoms: [], bonds: [],
    needsStructure: true,
    note: "A bottlebrush held together by charge rather than by covalent bonds, built to settle whether a dense corona makes a semiflexible chain behave more like a rod. An engineered protein with a twelve-lysine binding block and a four-hundred-residue random coil sticks along DNA electrostatically, giving a brush about 30 nm thick with roughly one side chain every 2.7 nm of duplex. The corona did stiffen the DNA, but it thickened it more, so the effective aspect ratio fell - confirming the theory that a brush coating only raises aspect ratio for very long side chains at very high density. Liquid crystallinity survived anyway, appearing at 8 mg/mL of DNA, about ten times more dilute than bare DNA, and going hexagonal by 12 mg/mL. The lesson is that lower aspect ratio and easier ordering are not contradictory, because the corona also adds excluded volume. Storm, Kornreich and co-workers (de Vries group, Wageningen), J. Phys. Chem. B 2015."
  },
  {
    name: "Neurofilament", aka: ["neurofilament sidearm", "NF-M", "NF-H", "neurofilament projection domain"],
    arch: "bottlebrush",
    monomer: "intermediate filament core protein with unstructured projection domains", cls: "Step-growth (polyamide)", cas: null,
    tags: ["bottlebrush", "biopolymer", "self-assembly", "biomedical", "specialty"],
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The bottlebrush that fills the inside of an axon. A semiflexible filament core carries long unstructured polypeptide projection domains, heavily phosphorylated and so strongly charged, which stick out and hold neighbouring filaments apart. That spacing is what sets the calibre of an axon and therefore how fast it conducts, so the brush is doing a mechanical job with a direct physiological readout. Like other natural bottlebrushes they form lyotropic ordered phases, which is why synthetic semiflexible-core brushes are studied as models for them. Treat the composition as variable: the projection domains differ between the medium and heavy subunits and their phosphorylation state is not fixed."
  },
  {
    name: "Lubricin", aka: ["PRG4", "proteoglycan 4", "superficial zone protein", "bottlebrush lubricant glycoprotein"],
    arch: "bottlebrush",
    monomer: "mucin-like O-glycosylated central domain with binding end domains", cls: "Step-growth (polyamide)", cas: null,
    tags: ["bottlebrush", "biopolymer", "biomedical", "specialty"],
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The boundary lubricant of a joint, and a bottlebrush with grips on both ends. A heavily O-glycosylated mucin-like middle section forms the brush - hydrophilic, negatively charged, holding a water layer - while the end domains bind to the cartilage surface, so the molecule self-assembles into a telechelic brush anchored at both ends with the loop standing proud. Two such layers slide over each other without interdigitating, which is exactly the argument made for synthetic polymer brushes as lubricants, and it is why lubricin is copied by mimics for contact lenses, sensors and antifouling coatings. Losing it is associated with cartilage damage after joint injury."
  },
  {
    name: "Bottlebrush oil-additive friction modifier", aka: ["bottlebrush friction modifier", "anchor group bottlebrush", "graft copolymer lubricant additive", "poly(lauryl acrylate) brush"],
    arch: "bottlebrush",
    monomer: "lauryl acrylate macromonomer with a poly(4-acryloylmorpholine) anchor block", cls: "Addition (acrylate)", cas: null,
    tags: ["bottlebrush", "acrylate", "specialty"],
    atoms: [], bonds: [],
    needsStructure: true,
    note: "A bottlebrush designed to do in an oil what a surface-grafted brush does in water. The grafted poly(lauryl acrylate) part dissolves in the oil and stands away from the surface; a short polar poly(4-acryloylmorpholine) block anchors the molecule to the metal, so the polymer builds its own brush layer wherever the surfaces meet rather than needing to be grafted there. RAFT polymerisation let grafting density and the position of the anchor along the chain be varied independently, which is the point - the architecture, not the chemistry, is the variable. Friction coefficients fell by about half at low additive levels. Worth the trouble given that roughly a fifth of the world's energy goes on overcoming friction. Kerr, Hakkinen and co-workers (Perrier group, Warwick), ACS Appl. Mater. Interfaces 2023, 15, 48574."
  },
  {
    name: "Polypentenamer bottlebrush", aka: ["PCP bottlebrush", "polypentenamer-g-polystyrene", "cyclopentene-based bottlebrush"],
    arch: "bottlebrush",
    monomer: "cyclopentene-based macromonomer, polymerised by ROMP", cls: "Ring-opening", cas: null,
    tags: ["bottlebrush", "styrenic", "specialty"],
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The same architecture on a thinner backbone, and a clean test of how much the backbone matters. Polynorbornene carries a fused imide ring at every repeat, which takes up room next to the backbone and pushes the side chains outward; a polypentenamer backbone, made by ring-opening cyclopentene, has nothing there. The grafts can then occupy space close to the backbone, so the molecule packs denser and its intrinsic viscosity scales more weakly with molar mass - for polystyrene grafts the scaling exponent was 0.11 against 0.19 for the polynorbornene analogue, nearly a factor of two. If a bottlebrush is being used because it is a stiff extended cylinder, the choice of backbone is part of the design rather than a detail. Leo, Jang and co-workers (Kennemur group, Florida State), ACS Polymers Au 2024, 4, 235."
  },
  {
    name: "Bottlebrush by RAFT grafting-through", aka: ["RAFT bottlebrush", "RAFT macromonomer brush", "graft-through RAFT polymer"],
    arch: "bottlebrush",
    monomer: "vinyl-terminated macromonomer polymerised under RAFT control", cls: "Addition (vinyl)", cas: null,
    tags: ["bottlebrush", "specialty"],
    atoms: [], bonds: [],
    needsStructure: true,
    note: "Grafting-through without a metathesis catalyst. A macromonomer is made with an ordinary polymerisable end - usually a methacrylate - and then polymerised under reversible addition-fragmentation chain transfer control, which tolerates water, acids, amines and unprotected functional groups that would stop a ruthenium catalyst. The trade is conversion: a growing radical adds a whole polymer chain each time, so the reaction slows badly as it proceeds and backbones stay shorter than ROMP reaches. Where ROMP wins on backbone length and speed, RAFT wins on what the side chain is allowed to contain, which is why it is the usual choice for charged or biologically functional brushes."
  },
  {
    name: "Comb polymer", aka: ["comb copolymer", "graft copolymer (comb)", "loosely grafted brush"],
    arch: "bottlebrush",
    monomer: "backbone bearing side chains at less than every repeat", cls: "Addition (vinyl)", cas: null,
    tags: ["bottlebrush", "specialty"],
    atoms: [], bonds: [],
    needsStructure: true,
    note: "What a bottlebrush is before it becomes one. Graft a backbone loosely, or with short side chains, and the grafts stay out of each other's way: the backbone keeps its normal flexibility and the molecule is still a coil, just a branched one. Raise the grafting density or lengthen the side chains and the grafts begin to overlap, the steric cost of a coiled backbone becomes unpayable, and the molecule straightens into the extended cylinder that earns the name bottlebrush. There is no sharp line between the two, which is why the same material is called a comb in one paper and a brush in the next, and why quoting a grafting density and a side-chain length says more than either word does."
  },
  {
    name: "Bottlebrush polyelectrolyte", aka: ["polyelectrolyte brush", "charged bottlebrush", "molecular polyelectrolyte brush"],
    type: "copolymer", arch: "bottlebrush", components: ["Polynorbornene", "Poly(acrylic acid)"],
    monomer: "macromonomer with an ionisable side chain", cls: "Bottlebrush copolymer (ROMP grafting-through)", cas: null,
    tags: ["copolymer", "bottlebrush", "water-soluble", "specialty"],
    note: "A bottlebrush whose side chains repel each other electrically as well as sterically, so the molecule stretches further than crowding alone would manage and its size responds to salt and pH. Adding salt screens the charge and lets the corona collapse; removing it swells the molecule again. This is the synthetic version of what aggrecan does in cartilage and what neurofilament sidearms do in an axon - hold water, resist compression, and keep neighbours at a distance - and it is why charged brushes are studied as lubricants and as compression-resistant coatings. The listed components are representative: the same architecture is made with sulfonate, quaternary ammonium and zwitterionic side chains."
  },
  {
    name: "Poly(norbornene)-graft-poly(caprolactone)", aka: ["PNB-g-PCL", "polycaprolactone bottlebrush", "PCL bottlebrush"],
    type: "copolymer", arch: "bottlebrush", components: ["Polynorbornene", "Poly(caprolactone)"],
    monomer: "polycaprolactone-functional norbornene macromonomer", cls: "Bottlebrush copolymer (ROMP grafting-through)", cas: null,
    tags: ["copolymer", "bottlebrush", "polyester", "biodegradable", "biomedical", "specialty"],
    note: "The slow-degrading member of the polyester bottlebrush family. Polycaprolactone side chains are made by ring-opening a lactone from an alcohol on the norbornene, then the macromonomer is polymerised through its ring, the same route as the polylactide brush. The difference is timescale: caprolactone esters hydrolyse far more slowly than lactide ones, so where a polylactide brush is chosen to disappear over weeks to months, a caprolactone brush is chosen to persist and then go, which suits a scaffold or a depot that has to hold its shape first. It is also semicrystalline and much softer, so the two are not interchangeable even before degradation starts."
  },
  {
    name: "Core-shell bottlebrush", aka: ["core-shell brush", "block-side-chain bottlebrush", "amphiphilic bottlebrush"],
    arch: "bottlebrush",
    monomer: "backbone grafted with diblock side chains", cls: "Ring-opening (polyamide)", cas: null,
    tags: ["bottlebrush", "polyester", "polyether", "self-assembly", "biomedical", "specialty"],
    atoms: [], bonds: [],
    needsStructure: true,
    note: "A bottlebrush that is layered outward rather than along its length: every side chain is itself a diblock, so the molecule has an inner shell of one polymer and an outer shell of another around a single backbone. Make the inner block hydrophobic and the outer one hydrophilic and each molecule becomes a unimolecular micelle - a carrier that cannot fall apart on dilution the way an ordinary micelle does below its critical concentration, which is the usual reason a drug-loaded micelle fails in the bloodstream. One route couples pre-made polylactide-block-poly(ethylene glycol) side chains onto a poly(gamma-propyl-L-glutamate) backbone by azide-alkyne click chemistry. Compare the Janus bottlebrush, which divides the same two polymers along the molecule instead of around it. Reviewed by Verduzco, Li, Pesek and Stein, Chem. Soc. Rev. 2015, 44, 2405."
  },
  {
    name: "Poly(methyl methacrylate)-bottlebrush poly(dimethylsiloxane) thermoplastic elastomer", aka: ["PMMA-bbPDMS-PMMA", "bottlebrush thermoplastic elastomer", "dry linear-bottlebrush-linear elastomer"],
    type: "copolymer", arch: "bottlebrush", components: ["Poly(dimethylsiloxane)", "Poly(methyl methacrylate)"],
    monomer: "PDMS macromonomer for the brush block, methyl methacrylate for the linear ends", cls: "Bottlebrush copolymer (ROMP grafting-through)", cas: null,
    tags: ["copolymer", "bottlebrush", "elastomer", "silicone", "methacrylate", "thermoplastic elastomer", "specialty"],
    note: "The dry counterpart of the injectable bottlebrush gel, and the reason that architecture works at all. A bottlebrush poly(dimethylsiloxane) middle block supplies a network strand that is soft and barely entangled; glassy poly(methyl methacrylate) end blocks aggregate into hard domains that act as physical crosslinks, so the material is an elastomer that can still be melted and reshaped. No solvent is present, so there is nothing to evaporate or leach - the softness comes from the architecture rather than from a plasticiser. It is mechanically the weaker of the pair: the aqueous PNIPAM-bottlebrush-PEG version reaches about 3.5 MPa at break against roughly 0.6 MPa here, which is the comparison the injectable work used to make its case."
  },
  {
    name: "Synthetic mucin mimic", aka: ["lubricin mimic", "bottlebrush glycopolymer", "mucin-mimetic brush", "biolubricant mimic"],
    arch: "bottlebrush",
    monomer: "glycosylated or polyelectrolyte side chains on a surface-binding backbone", cls: "Addition (vinyl)", cas: null,
    tags: ["bottlebrush", "biomedical", "water-soluble", "specialty"],
    atoms: [], bonds: [],
    needsStructure: true,
    note: "What happens when the natural bottlebrush lubricants are copied rather than harvested. Mucin and lubricin both work by holding a water layer on a surface and refusing to interdigitate with the layer opposite, and both are hard to produce in quantity with consistent glycosylation. A synthetic version keeps the architecture - a hydrophilic, often charged brush with an end group that binds the surface - and drops the sugars for something easier to make, which is enough to recover much of the lubrication. Reported mimics are used on cartilage, contact lenses and antifouling coatings, sometimes paired with a surface-binding protein to improve wear protection. The composition is deliberately open here: this is an architecture with a design brief, not one compound."
  },
  {
    name: "Polyacetylene", aka: ["PA", "poly(acetylene)", "polyethyne"],
    monomer: "acetylene", cls: "Addition (vinyl)", cas: "25067-58-7",
    tags: ["conductive", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: "S1", order: 1 }],
    note: "The polymer that started conducting polymers, and the one nobody uses. A bare alternating single-double backbone, so the p orbitals overlap along the whole chain and doping raises the conductivity by orders of magnitude - the result that won the 2000 Nobel Prize in Chemistry. It is also insoluble, infusible and oxidises in air within minutes, which is why every conducting polymer since has been an attempt to keep the conjugation and add a side chain that makes the material processable."
  },
  {
    name: "Polythiophene", aka: ["PT", "poly(thiophene)"],
    monomer: "thiophene", cls: "Addition (vinyl)", cas: "25233-34-5",
    tags: ["conductive", "optical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "S" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 2, b: 6, order: 1 }, { a: 5, b: "S1", order: 1 }],
    note: "The parent of the most useful family of conducting polymers. Sulfur in the ring stabilises the conjugated backbone against the oxidation that destroys polyacetylene, so the material survives in air, and the 2,5-linkage keeps the rings coplanar enough for the electrons to delocalise. Unsubstituted polythiophene is still intractable; the whole point of the alkyl-substituted versions is to keep this backbone and make it dissolve."
  },
  {
    name: "Poly(3-hexylthiophene)", aka: ["P3HT", "poly(3-hexylthiophene-2,5-diyl)", "regioregular P3HT"],
    monomer: "3-hexylthiophene", cls: "Addition (vinyl)", cas: null,
    tags: ["conductive", "optical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "S" }, { id: "S1", el: "*" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 2, b: 6, order: 1 }, { a: 5, b: "S1", order: 1 }, { a: 4, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }],
    note: "The workhorse of organic electronics, and a lesson in why regiochemistry matters more than molar mass. A hexyl chain on every third position makes polythiophene soluble in chloroform without breaking the conjugation - but only if the rings are joined head-to-tail. Head-to-head junctions put two hexyls side by side, the rings twist out of plane to avoid each other, and the conjugation and the mobility collapse. Regioregular material stacks into ordered lamellae and carries charge along and between chains; the same polymer made carelessly is an insulator by comparison."
  },
  {
    name: "Poly(3,4-ethylenedioxythiophene)", aka: ["PEDOT", "PEDOT:PSS (as the cation)", "poly(3,4-ethylenedioxythiophene)"],
    monomer: "3,4-ethylenedioxythiophene", cls: "Addition (vinyl)", cas: null,
    tags: ["conductive", "optical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "S" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 3, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 9, b: 10, order: 1 }, { a: 2, b: 10, order: 1 }, { a: 9, b: "S1", order: 1 }],
    note: "The conducting polymer that actually ships, in touchscreens, antistatic films and organic solar cells. Bridging the 3 and 4 positions with a dioxyethylene ring does two things at once: it blocks those positions so the chain cannot branch there, and it pushes electron density into the ring so the doped state is stable in air. It is intractable by itself, so it is sold dispersed with poly(styrene sulfonate), which acts as the counter-ion and carries it into water - the familiar PEDOT:PSS is that pair, not one polymer."
  },
  {
    name: "Polypyrrole", aka: ["PPy", "poly(pyrrole)"],
    monomer: "pyrrole", cls: "Addition (vinyl)", cas: null,
    tags: ["conductive", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "N" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 2, b: 6, order: 1 }, { a: 5, b: "S1", order: 1 }],
    note: "The conducting polymer that can be grown straight onto an electrode. Pyrrole oxidises at an accessible potential in water, so a film deposits electrochemically wherever the current flows, at whatever thickness the charge passed dictates - no solution processing, and patterning comes free from the electrode shape. It is stable in air and reasonably biocompatible, which is why it turns up on neural electrodes and biosensors more than in bulk electronics."
  },
  {
    name: "Polyaniline", aka: ["PANI", "emeraldine", "poly(aniline)", "aniline black"],
    monomer: "aniline", cls: "Addition (vinyl)", cas: "25233-30-1",
    tags: ["conductive", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "N" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 3, b: 8, order: 1 }, { a: 6, b: "S1", order: 1 }],
    note: "The conducting polymer with a switch built in. Unusually, it is doped by acid rather than by oxidation: the half-oxidised emeraldine base is an insulator, protonating the imine nitrogens turns it into the conducting emeraldine salt, and base switches it back, with a colour change each way. That makes it a sensor as much as a conductor. The drawn repeat is the reduced amine unit; a real chain is a mixture of amine and imine units whose ratio is the oxidation state, so treat the structure as one component of a variable material."
  },
  {
    name: "Poly(p-phenylene vinylene)", aka: ["PPV", "poly(1,4-phenylene vinylene)"],
    monomer: "p-xylylene precursor (Gilch or Wessling route)", cls: "Addition (vinyl)", cas: "26009-24-5",
    tags: ["conductive", "optical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 4, b: 9, order: 1 }, { a: 7, b: "S1", order: 1 }],
    note: "The polymer that made light-emitting devices from plastic plausible. Alternating rings and vinylenes conjugate along the chain and the band gap lands in the visible, so a film between electrodes electroluminesces - the 1990 result that opened polymer LEDs. Unsubstituted PPV is insoluble and is made through a soluble precursor that is cast and then eliminated to the conjugated form in place, which is a recurring trick for conjugated polymers."
  },
  {
    name: "Poly(p-phenylene)", aka: ["PPP", "poly(1,4-phenylene)"],
    monomer: "benzene (oxidative) or dihalobenzene (coupling)", cls: "Addition (vinyl)", cas: null,
    tags: ["conductive", "high-temperature", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 2, b: 7, order: 1 }, { a: 5, b: "S1", order: 1 }],
    note: "Nothing but benzene rings joined para. Rigid, conjugated and extraordinarily stable thermally, and correspondingly impossible to dissolve or melt - the reason it is usually met as a building block inside a copolymer or with solubilising side chains rather than on its own. Its stiffness is the structural argument behind the aramids and the polyphenylenes generally."
  },
  {
    name: "Poly(9,9-dioctylfluorene)", aka: ["PFO", "polyfluorene", "F8"],
    monomer: "9,9-dioctylfluorene", cls: "Addition (vinyl)", cas: null,
    tags: ["conductive", "optical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "C" }, { id: 19, el: "C" }, { id: 20, el: "C" }, { id: 21, el: "C" }, { id: 22, el: "C" }, { id: 23, el: "C" }, { id: 24, el: "C" }, { id: 25, el: "C" }, { id: 26, el: "C" }, { id: 27, el: "C" }, { id: 28, el: "C" }, { id: 29, el: "C" }, { id: 30, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 2, b: 7, order: 1 }, { a: 5, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 2 }, { a: 8, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 4, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 1 }, { a: 16, b: 17, order: 1 }, { a: 17, b: 18, order: 1 }, { a: 18, b: 19, order: 1 }, { a: 19, b: 20, order: 1 }, { a: 20, b: 21, order: 1 }, { a: 21, b: 22, order: 1 }, { a: 14, b: 23, order: 1 }, { a: 23, b: 24, order: 1 }, { a: 24, b: 25, order: 1 }, { a: 25, b: 26, order: 1 }, { a: 26, b: 27, order: 1 }, { a: 27, b: 28, order: 1 }, { a: 28, b: 29, order: 1 }, { a: 29, b: 30, order: 1 }, { a: 10, b: "S1", order: 1 }],
    note: "The blue emitter of the polymer LED family. Two benzene rings locked coplanar by a bridging carbon give a wide band gap and efficient blue fluorescence, and that bridging carbon is quaternary, so the two octyl chains hang off it without twisting the conjugated system - solubility bought at no optical cost, which is rare. Its known failure is a green emission band that grows with use, traced to oxidation at the bridge to a fluorenone."
  },
  {
    name: "Poly(sodium 4-styrenesulfonate)", aka: ["PSS", "NaPSS", "poly(styrene sulfonate)", "polystyrene sulfonate"],
    monomer: "sodium 4-styrenesulfonate", cls: "Addition (vinyl)", cas: null,
    tags: ["water-soluble", "polyelectrolyte", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "S" }, { id: 12, el: "O" }, { id: 13, el: "O" }, { id: 14, el: "O" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 5, b: 10, order: 1 }, { a: 8, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 11, b: 13, order: 2 }, { a: 11, b: 14, order: 1 }],
    note: "The standard strong polyanion. The sulfonate is fully ionised at any usable pH, so charge density does not depend on pH the way a carboxylate's does, which is why it is the reference polyanion for layer-by-layer assembly, for polyelectrolyte complexes and as the counter-ion that carries PEDOT into water. Drawn here as the free acid; it is normally handled as the sodium salt."
  },
  {
    name: "Poly(diallyldimethylammonium chloride)", aka: ["PDADMAC", "polyDADMAC", "poly(dimethyldiallylammonium chloride)"],
    monomer: "diallyldimethylammonium chloride", cls: "Addition (vinyl)", cas: null,
    tags: ["water-soluble", "polyelectrolyte", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "N", charge: 1 }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 3, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 7, b: 9, order: 1 }, { a: 5, b: 10, order: 1 }, { a: 10, b: "S1", order: 1 }],
    note: "The strong polycation of water treatment, and a rare case of a diene that cyclises as it polymerises. Each monomer has two allyl groups; the radical adds to one and then closes onto the other before propagating, so the backbone is a chain of five-membered pyrrolidinium rings rather than a crosslinked gel. The quaternary nitrogen is permanently charged, so like the sulfonates its charge does not titrate. Drawn as the cation; the chloride counter-ion is not shown."
  },
  {
    name: "Polyethylenimine", aka: ["PEI", "poly(ethylene imine)", "polyaziridine", "branched PEI"],
    monomer: "aziridine (branched) or 2-oxazoline then hydrolysis (linear)", cls: "Ring-opening", cas: null,
    tags: ["water-soluble", "polyelectrolyte", "drug delivery", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "N" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: "S1", order: 1 }],
    note: "The benchmark for getting DNA into cells, and the benchmark for polymer toxicity too. Every second backbone atom is a nitrogen, so it has the highest charge density of any common polycation and buffers strongly across the endosomal pH range - the proton-sponge effect usually invoked for its efficiency at escaping endosomes. Made by ring-opening aziridine it is heavily branched with primary, secondary and tertiary amines; made by hydrolysing a polyoxazoline it is strictly linear. The drawn repeat is the linear form."
  },
  {
    name: "Poly(allylamine)", aka: ["PAH", "poly(allylamine hydrochloride)", "poly(allyl amine)"],
    monomer: "allylamine", cls: "Addition (vinyl)", cas: "30551-89-4",
    tags: ["water-soluble", "polyelectrolyte", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "N" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 3, b: "S1", order: 1 }],
    note: "A weak polycation with a primary amine on a short arm off the backbone, which makes it both charged and easy to react with. Its charge titrates with pH, unlike a quaternary ammonium, so layer-by-layer films built from it can be assembled and then disassembled by changing pH - the basis of a large fraction of the polyelectrolyte multilayer literature. Normally supplied and used as the hydrochloride."
  },
  {
    name: "Poly(vinylamine)", aka: ["PVAm", "poly(vinyl amine)"],
    monomer: "N-vinylformamide, then hydrolysis", cls: "Addition (vinyl)", cas: null,
    tags: ["water-soluble", "polyelectrolyte", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "N" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: "S1", order: 1 }],
    note: "The amine directly on the backbone rather than on a pendant arm, which gives a higher charge density than poly(allylamine) at the same mass. Vinylamine itself does not exist as a stable monomer - it tautomerises to acetaldimine - so the polymer is made by polymerising N-vinylformamide and hydrolysing off the formyl groups afterwards, which means the product is really a copolymer with whatever amide survived."
  },
  {
    name: "Poly(2-methyl-2-oxazoline)", aka: ["PMeOx", "PMOXA", "poly(2-methyl oxazoline)"],
    monomer: "2-methyl-2-oxazoline", cls: "Ring-opening (polyamide)", cas: null,
    tags: ["water-soluble", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "N" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: 5, order: 2 }, { a: 2, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: "S1", order: 1 }],
    note: "The most hydrophilic of the polyoxazolines and the closest in behaviour to PEG, without the polyether backbone that eventually oxidises. Cationic ring-opening of the oxazoline is living, so the chain length is set by the monomer-to-initiator ratio and both ends can be functionalised - the initiator picks one and the terminating nucleophile the other. Its tertiary amide is a structural isomer of a peptide bond but has no N-H, so it cannot hydrogen-bond to itself and stays soluble."
  },
  {
    name: "Poly(2-isopropyl-2-oxazoline)", aka: ["PiPrOx", "PIPOZ", "poly(2-isopropyl oxazoline)"],
    monomer: "2-isopropyl-2-oxazoline", cls: "Ring-opening (polyamide)", cas: null,
    tags: ["water-soluble", "thermoresponsive", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "N" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 5, b: 7, order: 1 }, { a: 2, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: "S1", order: 1 }],
    note: "The polyoxazoline that behaves like poly(N-isopropylacrylamide): it dissolves cold and precipitates on heating, with a cloud point near body temperature. The isopropyl group is the same one that makes PNIPAM thermoresponsive, and it does the same job here - enough hydrophobic surface that the entropy of the hydrating water wins above a certain temperature. Unlike PNIPAM it also crystallises slowly from the collapsed state, so a solution held hot can turn irreversibly to a precipitate."
  },
  {
    name: "Poly(N-vinylimidazole)", aka: ["PVI", "poly(1-vinylimidazole)"],
    monomer: "1-vinylimidazole", cls: "Addition (vinyl)", cas: null,
    tags: ["water-soluble", "polyelectrolyte", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "N" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "N" }, { id: 9, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 5, b: 9, order: 1 }],
    note: "A weak polybase that buffers around pH 6, the same imidazole that does the job in histidine. That pKa sits in the endosomal range, so it is used to add proton-sponge behaviour to a delivery vehicle, and the free nitrogen also coordinates metals, which makes it a polymeric ligand for catalysis and for metal capture."
  },
  {
    name: "Poly(2-methacryloyloxyethyl phosphorylcholine)", aka: ["PMPC", "poly(MPC)", "phosphorylcholine polymer"],
    monomer: "2-methacryloyloxyethyl phosphorylcholine", cls: "Addition (methacrylate)", cas: null,
    tags: ["water-soluble", "zwitterionic", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: "S1", el: "*" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "O" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "O" }, { id: 12, el: "P" }, { id: 13, el: "O" }, { id: 14, el: "O", charge: -1 }, { id: 15, el: "O" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "N", charge: 1 }, { id: 19, el: "C" }, { id: 20, el: "C" }, { id: 21, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 2 }, { a: 12, b: 14, order: 1 }, { a: 12, b: 15, order: 1 }, { a: 15, b: 16, order: 1 }, { a: 16, b: 17, order: 1 }, { a: 17, b: 18, order: 1 }, { a: 18, b: 19, order: 1 }, { a: 18, b: 20, order: 1 }, { a: 18, b: 21, order: 1 }],
    note: "A polymer that copies the outside of a cell membrane. The phosphorylcholine head group is the one presented by phosphatidylcholine on the outer leaflet, and a surface covered in it is very poorly recognised by proteins - so PMPC coatings resist fouling and clotting better than PEG does, and hold water so tightly that they lubricate. It is the coating on some hip implants and contact lenses. Zwitterionic rather than charged overall, which is why it does not attract counter-ions the way a polyelectrolyte does."
  },
  {
    name: "Poly(sulfobetaine methacrylate)", aka: ["PSBMA", "polysulfobetaine", "poly(sulfobetaine methacrylate)"],
    monomer: "sulfobetaine methacrylate", cls: "Addition (methacrylate)", cas: null,
    tags: ["methacrylate", "water-soluble", "zwitterionic", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: "S1", el: "*" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "O" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "N", charge: 1 }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "S" }, { id: 18, el: "O" }, { id: 19, el: "O" }, { id: 20, el: "O", charge: -1 }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 11, b: 13, order: 1 }, { a: 11, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 1 }, { a: 16, b: 17, order: 1 }, { a: 17, b: 18, order: 2 }, { a: 17, b: 19, order: 2 }, { a: 17, b: 20, order: 1 }],
    note: "A zwitterion with the two charges on the same side chain, quaternary ammonium and sulfonate a few carbons apart. Because the charges pair with each other rather than with salt, it behaves backwards from an ordinary polyelectrolyte: adding salt breaks the intra-chain pairs and makes it MORE soluble, so it has an upper critical solution temperature and dissolves on heating. Used for antifouling coatings where the hydration layer, not steric repulsion, does the work."
  },
  {
    name: "Poly(itaconic acid)", aka: ["PIA", "poly(itaconic acid)", "polymethylenesuccinic acid"],
    monomer: "itaconic acid", cls: "Addition (vinyl)", cas: null,
    tags: ["water-soluble", "polyelectrolyte", "biobased", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "O" }, { id: 9, el: "C" }, { id: 10, el: "O" }, { id: 11, el: "O" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 3, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 9, b: 11, order: 1 }],
    note: "Two carboxylic acids per repeat instead of one, and a monomer made by fermenting sugar rather than from oil - itaconic acid is on every list of priority bio-based platform chemicals. The double acid gives a higher charge density than poly(acrylic acid) and makes it a strong scale inhibitor and dispersant. It polymerises sluggishly because the 1,1-disubstituted alkene is sterically hindered, which is the main reason it has not displaced acrylic acid."
  },
  {
    name: "Cellulose", aka: ["cellulose", "alpha-cellulose", "cotton linters"],
    monomer: "D-glucose (beta-1,4 linked)", cls: "Step-growth (polyester)", cas: "9004-34-6",
    tags: ["biopolymer", "biobased", "biodegradable", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: "S1", el: "*" }, { id: 10, el: "C" }, { id: 11, el: "O" }, { id: 12, el: "C" }, { id: 13, el: "O" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 4, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: "S1", order: 1 }, { a: 8, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 10, b: 12, order: 1 }, { a: 3, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }],
    note: "The most abundant organic polymer on the planet, and the reason wood and cotton behave as they do. Glucose rings joined beta-1,4 alternate their orientation along the chain, which lets the chain lie flat and hydrogen-bond to its neighbours in sheets - so cellulose is crystalline, does not melt, and dissolves in almost nothing despite being covered in hydroxyls. Every industrial use is a way around that: derivatise it, dissolve it in something exotic, or regenerate it. The drawn repeat is the glucose unit; note that starch has the same 2D connectivity and differs only in the anomeric configuration."
  },
  {
    name: "Chitin", aka: ["chitin", "poly(N-acetylglucosamine)"],
    monomer: "N-acetyl-D-glucosamine (beta-1,4 linked)", cls: "Step-growth (polyester)", cas: null,
    tags: ["biopolymer", "biobased", "biodegradable", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: "S1", el: "*" }, { id: 10, el: "C" }, { id: 11, el: "N" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "O" }, { id: 15, el: "C" }, { id: 16, el: "O" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 4, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: "S1", order: 1 }, { a: 8, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 12, b: 14, order: 2 }, { a: 10, b: 15, order: 1 }, { a: 3, b: 15, order: 1 }, { a: 15, b: 16, order: 1 }],
    note: "Cellulose with an acetamide where one hydroxyl should be, and the second most abundant natural polymer - the structural material of insect cuticle, crustacean shell and fungal cell wall. The extra amide adds a hydrogen bond donor and acceptor per ring, so it is even more tightly packed and less soluble than cellulose. Most of what is done with it starts by deacetylating it to chitosan, because chitin itself is so intractable."
  },
  {
    name: "Chitosan", aka: ["chitosan", "deacetylated chitin", "poly(D-glucosamine)"],
    monomer: "D-glucosamine (beta-1,4 linked)", cls: "Step-growth (polyester)", cas: "9012-76-4",
    tags: ["biopolymer", "biobased", "biodegradable", "water-soluble", "polyelectrolyte", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: "S1", el: "*" }, { id: 10, el: "C" }, { id: 11, el: "N" }, { id: 12, el: "C" }, { id: 13, el: "O" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 4, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: "S1", order: 1 }, { a: 8, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 10, b: 12, order: 1 }, { a: 3, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }],
    note: "Chitin with the acetyl groups removed, which changes everything: the free amine protonates below about pH 6.5, so unlike every other abundant polysaccharide chitosan is a polycation and dissolves in dilute acid. That single property carries most of its uses - it sticks to the negatively charged surfaces of cells and mucosa, complexes DNA, flocculates, and is antimicrobial. Sold by degree of deacetylation rather than as a pure compound, because the reaction never goes to completion."
  },
  {
    name: "Amylose", aka: ["amylose", "starch (linear fraction)", "alpha-1,4-glucan"],
    monomer: "D-glucose (alpha-1,4 linked)", cls: "Step-growth (polyester)", cas: "9005-82-7",
    tags: ["biopolymer", "biobased", "biodegradable", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The linear fraction of starch, and cellulose's mirror twin. Same glucose, same 1,4 linkage, but joined alpha rather than beta, so successive rings do not flip - the chain coils into a helix instead of lying flat, cannot pack into sheets, and is digestible and swellable where cellulose is neither. One stereocentre is the whole difference between food and firewood. Not drawn: without stereochemistry its connectivity is identical to cellulose's, so a flat structure would claim the two are the same molecule."
  },
  {
    name: "Hyaluronan", aka: ["hyaluronic acid", "HA", "hyaluronate", "sodium hyaluronate"],
    monomer: "glucuronic acid + N-acetylglucosamine disaccharide", cls: "Step-growth (polyester)", cas: "9004-61-9",
    tags: ["biopolymer", "water-soluble", "polyelectrolyte", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: 7, el: "O" }, { id: 8, el: "O" }, { id: 9, el: "C" }, { id: 10, el: "O" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "O" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "O" }, { id: 17, el: "O" }, { id: 18, el: "C" }, { id: "S1", el: "*" }, { id: 20, el: "C" }, { id: 21, el: "N" }, { id: 22, el: "C" }, { id: 23, el: "C" }, { id: 24, el: "O" }, { id: 25, el: "C" }, { id: 26, el: "O" }, { id: 27, el: "C" }, { id: 28, el: "O" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 5, b: 7, order: 1 }, { a: 4, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 12, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 1 }, { a: 14, b: 17, order: 1 }, { a: 17, b: 18, order: 1 }, { a: 18, b: "S1", order: 1 }, { a: 18, b: 20, order: 1 }, { a: 11, b: 20, order: 1 }, { a: 20, b: 21, order: 1 }, { a: 21, b: 22, order: 1 }, { a: 22, b: 23, order: 1 }, { a: 22, b: 24, order: 2 }, { a: 9, b: 25, order: 1 }, { a: 25, b: 26, order: 1 }, { a: 25, b: 27, order: 1 }, { a: 3, b: 27, order: 1 }, { a: 27, b: 28, order: 1 }],
    note: "The only glycosaminoglycan that is not sulfated and not attached to a protein, and the backbone that aggrecan hangs from to build cartilage's bottlebrush-on-bottlebrush. A carboxylate on every disaccharide makes it a polyanion that holds enormous amounts of water - a few milligrams per millilitre gives a viscoelastic solution - which is why it fills the eye, lubricates joints and is injected as a dermal filler. Turnover in the body is fast, so the medical forms are crosslinked to slow it down."
  },
  {
    name: "Alginate", aka: ["alginic acid", "sodium alginate", "algin"],
    monomer: "mannuronic and guluronic acid", cls: "Step-growth (polyester)", cas: null,
    tags: ["biopolymer", "biobased", "water-soluble", "polyelectrolyte", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: 7, el: "O" }, { id: 8, el: "O" }, { id: 9, el: "C" }, { id: "S1", el: "*" }, { id: 11, el: "C" }, { id: 12, el: "O" }, { id: 13, el: "C" }, { id: 14, el: "O" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 5, b: 7, order: 1 }, { a: 4, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: "S1", order: 1 }, { a: 9, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 11, b: 13, order: 1 }, { a: 3, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }],
    note: "The seaweed polysaccharide that gels the instant it meets calcium, without heat, solvent or chemistry - which is why it is the default for encapsulating live cells. Calcium ions sit in pockets formed between paired guluronate blocks, the egg-box model, so gel strength depends on how the two uronic acids are arranged along the chain and not merely on how much there is. The drawn repeat is one uronic acid unit; a real chain is a block copolymer of the two epimers."
  },
  {
    name: "Dextran", aka: ["dextran", "alpha-1,6-glucan"],
    monomer: "D-glucose (alpha-1,6 linked)", cls: "Step-growth (polyester)", cas: "9004-54-0",
    tags: ["biopolymer", "water-soluble", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: "S1", el: "*" }, { id: 8, el: "C" }, { id: 9, el: "O" }, { id: 10, el: "C" }, { id: 11, el: "O" }, { id: 12, el: "C" }, { id: 13, el: "O" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: "S1", order: 1 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 8, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 10, b: 12, order: 1 }, { a: 4, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }],
    note: "Glucose joined 1,6 instead of 1,4, which puts a free-rotating CH2 in every linkage and makes the chain unusually flexible and very soluble. Made by bacteria rather than extracted, in tightly controlled molar masses, so it has long served as the calibration standard for aqueous size-exclusion chromatography and as a plasma volume expander. Its clean hydroxyl chemistry makes it a common carrier for drugs and contrast agents."
  },
  {
    name: "Lignin", aka: ["lignin", "kraft lignin", "lignosulfonate"],
    monomer: "coniferyl, sinapyl and p-coumaryl alcohol", cls: "Step-growth (polyester)", cas: "9005-53-2",
    tags: ["biopolymer", "biobased", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The second most abundant biopolymer, the stiffening in wood, and the one nobody has tamed. Three phenylpropanoid alcohols are polymerised by radical coupling that is not enzymatically directed, so the linkages form wherever radicals meet and the result is a randomly crosslinked aromatic network with no repeat unit and no two molecules alike. Vast quantities are produced as a pulping by-product and mostly burned. Not drawn: it has no repeat unit to draw, which is the central fact about it."
  },
  {
    name: "Poly(L-lysine)", aka: ["PLL", "poly-L-lysine", "polylysine"],
    monomer: "L-lysine N-carboxyanhydride", cls: "Ring-opening (polyamide)", cas: "25104-18-1",
    tags: ["biopolymer", "water-soluble", "polyelectrolyte", "drug delivery", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "N" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "N" }, { id: 9, el: "C" }, { id: 10, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 3, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 9, b: "S1", order: 1 }],
    note: "A polypeptide that is also a polycation: the lysine side-chain amine is protonated at physiological pH, so the chain binds anything negatively charged - DNA, cell membranes, glass slides. That makes it the standard coating for getting cells to adhere to culture surfaces and one of the earliest non-viral gene delivery agents. Made by ring-opening the N-carboxyanhydride, which gives a synthetic polymer with a peptide backbone and therefore something proteases can cut."
  },
  {
    name: "Poly(L-glutamic acid)", aka: ["PGlu", "poly-L-glutamate", "polyglutamic acid", "poly(glutamic acid)"],
    monomer: "L-glutamic acid N-carboxyanhydride", cls: "Ring-opening (polyamide)", cas: null,
    tags: ["biopolymer", "water-soluble", "polyelectrolyte", "drug delivery", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "N" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "O" }, { id: 9, el: "C" }, { id: 10, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 3, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 9, b: "S1", order: 1 }],
    note: "The polyanionic counterpart to poly(L-lysine), and a textbook helix-coil system: protonate the carboxylates at low pH and the chain folds into an alpha helix, deprotonate them and the charges repel it into a random coil. Degradable by proteases into a natural amino acid, which is why it has carried drugs into clinical trials as a conjugate backbone."
  },
  {
    name: "Poly(gamma-benzyl-L-glutamate)", aka: ["PBLG", "poly(benzyl glutamate)"],
    monomer: "gamma-benzyl-L-glutamate N-carboxyanhydride", cls: "Ring-opening (polyamide)", cas: null,
    tags: ["biopolymer", "liquid crystalline", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "N" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "O" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 2 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 2 }, { a: 10, b: 15, order: 1 }, { a: 3, b: 16, order: 1 }, { a: 16, b: 17, order: 2 }, { a: 16, b: "S1", order: 1 }],
    note: "The classic synthetic alpha helix, and the first synthetic polymer shown to form a liquid crystalline phase in solution. Esterifying glutamic acid with benzyl alcohol removes the charge, so nothing disrupts the intramolecular hydrogen bonds and the chain holds a rigid helix in organic solvent - effectively a molecular rod whose length is set by the degree of polymerisation. Above a critical concentration the rods align into a cholesteric phase, which made it the model system for testing Onsager and Flory's theories of rigid-rod ordering."
  },
  {
    name: "Polyglycine", aka: ["poly(glycine)", "PGly"],
    monomer: "glycine N-carboxyanhydride", cls: "Ring-opening (polyamide)", cas: null,
    tags: ["biopolymer", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "N" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: "S1", order: 1 }],
    note: "The simplest possible polypeptide - a nylon 2 with no side group at all. Having no substituent, the backbone can adopt conformations forbidden to every other residue, which is exactly why glycine appears at the tight turns of real proteins and at every third position in the collagen helix. As a homopolymer it packs into sheets and is insoluble in almost everything, so it is studied rather than used."
  },
  {
    name: "Polysulfone", aka: ["PSU", "polysulfone (bisphenol A)", "Udel"],
    monomer: "bisphenol A + 4,4'-dichlorodiphenyl sulfone", cls: "Step-growth (polyester)", cas: null,
    tags: ["engineering", "high-temperature", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "O" }, { id: 19, el: "C" }, { id: 20, el: "C" }, { id: 21, el: "C" }, { id: 22, el: "C" }, { id: 23, el: "C" }, { id: 24, el: "C" }, { id: 25, el: "S" }, { id: 26, el: "O" }, { id: 27, el: "O" }, { id: 28, el: "C" }, { id: 29, el: "C" }, { id: 30, el: "C" }, { id: 31, el: "C" }, { id: 32, el: "C" }, { id: 33, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 3, b: 8, order: 1 }, { a: 6, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 9, b: 11, order: 1 }, { a: 9, b: 12, order: 1 }, { a: 12, b: 13, order: 2 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 2 }, { a: 15, b: 16, order: 1 }, { a: 16, b: 17, order: 2 }, { a: 12, b: 17, order: 1 }, { a: 15, b: 18, order: 1 }, { a: 18, b: 19, order: 1 }, { a: 19, b: 20, order: 2 }, { a: 20, b: 21, order: 1 }, { a: 21, b: 22, order: 2 }, { a: 22, b: 23, order: 1 }, { a: 23, b: 24, order: 2 }, { a: 19, b: 24, order: 1 }, { a: 22, b: 25, order: 1 }, { a: 25, b: 26, order: 2 }, { a: 25, b: 27, order: 2 }, { a: 25, b: 28, order: 1 }, { a: 28, b: 29, order: 2 }, { a: 29, b: 30, order: 1 }, { a: 30, b: 31, order: 2 }, { a: 31, b: 32, order: 1 }, { a: 32, b: 33, order: 2 }, { a: 28, b: 33, order: 1 }, { a: 31, b: "S1", order: 1 }],
    note: "A transparent, autoclavable engineering thermoplastic, and the membrane material behind most of the world's haemodialysis. The sulfone group is already fully oxidised, so it resists further oxidation and hydrolysis, and the aromatic backbone holds the glass transition near 185 C - high enough to steam-sterilise repeatedly. Differs from poly(ether sulfone) by the bisphenol A unit, which adds flexibility and lowers the glass transition in exchange for easier processing."
  },
  {
    name: "Polyimide (PMDA-ODA)", aka: ["Kapton", "PMDA-ODA polyimide", "poly(pyromellitimide)", "aromatic polyimide"],
    monomer: "pyromellitic dianhydride + 4,4'-oxydianiline", cls: "Step-growth (polyamide)", cas: null,
    tags: ["engineering", "high-temperature", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "N" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "O" }, { id: 13, el: "C" }, { id: 14, el: "O" }, { id: 15, el: "N" }, { id: 16, el: "C" }, { id: 17, el: "O" }, { id: 18, el: "C" }, { id: 19, el: "C" }, { id: 20, el: "C" }, { id: 21, el: "C" }, { id: 22, el: "C" }, { id: 23, el: "C" }, { id: 24, el: "O" }, { id: 25, el: "C" }, { id: 26, el: "C" }, { id: 27, el: "C" }, { id: 28, el: "C" }, { id: 29, el: "C" }, { id: 30, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 5, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 2, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 8, b: 13, order: 1 }, { a: 13, b: 14, order: 2 }, { a: 13, b: 15, order: 1 }, { a: 15, b: 16, order: 1 }, { a: 7, b: 16, order: 1 }, { a: 16, b: 17, order: 2 }, { a: 15, b: 18, order: 1 }, { a: 18, b: 19, order: 2 }, { a: 19, b: 20, order: 1 }, { a: 20, b: 21, order: 2 }, { a: 21, b: 22, order: 1 }, { a: 22, b: 23, order: 2 }, { a: 18, b: 23, order: 1 }, { a: 21, b: 24, order: 1 }, { a: 24, b: 25, order: 1 }, { a: 25, b: 26, order: 2 }, { a: 26, b: 27, order: 1 }, { a: 27, b: 28, order: 2 }, { a: 28, b: 29, order: 1 }, { a: 29, b: 30, order: 2 }, { a: 25, b: 30, order: 1 }, { a: 28, b: "S1", order: 1 }],
    note: "The film that goes to space and into every flexible circuit. Fully aromatic with imide rings locking the backbone, it keeps its properties from about -270 C to over 400 C and does not melt at all. That intractability is handled by processing the soluble poly(amic acid) precursor first - cast it, then heat to close the imide rings in place - which is why polyimide is bought as a film or a varnish rather than as pellets."
  },
  {
    name: "Polybenzimidazole", aka: ["PBI", "poly(2,2'-m-phenylene-5,5'-bibenzimidazole)", "Celazole"],
    monomer: "3,3'-diaminobenzidine + isophthalic acid", cls: "Step-growth (polyamide)", cas: "32075-68-6",
    tags: ["engineering", "high-temperature", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "N" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "N" }, { id: 11, el: "C" }, { id: 12, el: "N" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "C" }, { id: 19, el: "N" }, { id: 20, el: "C" }, { id: 21, el: "C" }, { id: 22, el: "C" }, { id: 23, el: "C" }, { id: 24, el: "C" }, { id: 25, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 4, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 2, b: 10, order: 1 }, { a: 8, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 2 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 2 }, { a: 16, b: 17, order: 1 }, { a: 17, b: 18, order: 2 }, { a: 13, b: 18, order: 1 }, { a: 18, b: 19, order: 1 }, { a: 11, b: 19, order: 1 }, { a: 17, b: 20, order: 1 }, { a: 20, b: 21, order: 2 }, { a: 21, b: 22, order: 1 }, { a: 22, b: 23, order: 2 }, { a: 23, b: 24, order: 1 }, { a: 24, b: 25, order: 2 }, { a: 20, b: 25, order: 1 }, { a: 24, b: "S1", order: 1 }],
    note: "The polymer used where nothing else survives: firefighters' and astronauts' suits, and high-temperature fuel cell membranes. Fused imidazole rings give one of the highest glass transitions of any thermoplastic, around 425 C, with no melting point and essentially no flammability. The N-H on the imidazole takes up phosphoric acid, which lets a PBI membrane conduct protons at 160 C without any water present - the property that made high-temperature PEM fuel cells possible."
  },
  {
    name: "Poly(phenylene ether ketone)", aka: ["PEK", "poly(ether ketone)", "polyetherketone"],
    monomer: "4,4'-difluorobenzophenone + hydroquinone", cls: "Step-growth (polyester)", cas: null,
    tags: ["engineering", "high-temperature", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "O" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 3, b: 8, order: 1 }, { a: 6, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 9, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 2 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 2 }, { a: 11, b: 16, order: 1 }, { a: 14, b: "S1", order: 1 }],
    note: "The one-ether member of the ether-ketone family that PEEK belongs to. Raising the ratio of ketone to ether stiffens the chain and pushes both transitions up, so PEK melts higher than PEEK and is correspondingly harder to process - the family is a straight trade of processability against temperature, tuned by how many ethers sit between the ketones."
  },
  {
    name: "Poly(phthalazinone ether sulfone)", aka: ["PPES", "phthalazinone polymer"],
    monomer: "4-(4-hydroxyphenyl)phthalazin-1(2H)-one + dihalosulfone", cls: "Step-growth (polyester)", cas: null,
    tags: ["engineering", "high-temperature", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "A high-temperature poly(ether sulfone) built around a twisted, non-coplanar phthalazinone unit rather than a flat aromatic one. The twist is deliberate: it stops chains packing and crystallising, so the polymer stays amorphous and soluble in ordinary solvents while its glass transition sits above 260 C - unusually, both processable and heat-resistant, which the fully planar aromatics are not. Not drawn: the phthalazinone unit is reported with several attachment patterns and drawing one would assert a regiochemistry the class does not fix."
  },
  {
    name: "Polyurethane (MDI-butanediol)", aka: ["PU", "polyurethane", "MDI-BDO hard segment"],
    monomer: "4,4'-methylenediphenyl diisocyanate + 1,4-butanediol", cls: "Step-growth (polyester)", cas: null,
    tags: ["elastomer", "engineering", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "O" }, { id: 10, el: "N" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "C" }, { id: 19, el: "C" }, { id: 20, el: "C" }, { id: 21, el: "C" }, { id: 22, el: "C" }, { id: 23, el: "C" }, { id: 24, el: "N" }, { id: 25, el: "C" }, { id: 26, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 8, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 2 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 2 }, { a: 11, b: 16, order: 1 }, { a: 14, b: 17, order: 1 }, { a: 17, b: 18, order: 1 }, { a: 18, b: 19, order: 2 }, { a: 19, b: 20, order: 1 }, { a: 20, b: 21, order: 2 }, { a: 21, b: 22, order: 1 }, { a: 22, b: 23, order: 2 }, { a: 18, b: 23, order: 1 }, { a: 21, b: 24, order: 1 }, { a: 24, b: 25, order: 1 }, { a: 25, b: 26, order: 2 }, { a: 25, b: "S1", order: 1 }],
    note: "The hard segment of a segmented polyurethane, which is the form nearly all polyurethane is used in. Diisocyanate and a short diol give a rigid, strongly hydrogen-bonded block; alternating it with a soft polyester or polyether block gives a material whose hard blocks aggregate into physical crosslinks and whose soft blocks supply the elasticity, so the same two-phase argument as a styrenic thermoplastic elastomer. Changing the soft block from polyether to polyester trades hydrolytic stability for oil resistance. Drawn here as the hard segment alone."
  },
  {
    name: "Polyurea", aka: ["polyurea", "poly(urea)", "MDI-diamine polyurea"],
    monomer: "diisocyanate + diamine", cls: "Step-growth (polyamide)", cas: null,
    tags: ["elastomer", "engineering", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "N" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "N" }, { id: 10, el: "C" }, { id: 11, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 10, b: "S1", order: 1 }],
    note: "What you get when a diisocyanate meets a diamine instead of a diol. The urea linkage has two N-H donors to the urethane's one, so it hydrogen-bonds roughly twice as strongly and the hard phase is tougher and more heat-resistant. The reaction is also far faster - fast enough that polyurea is sprayed as a two-component mix that gels in seconds, which is how truck bed liners and blast-resistant coatings are applied."
  },
  {
    name: "Poly(propylene carbonate)", aka: ["PPC", "poly(propylene carbonate)"],
    monomer: "propylene oxide + carbon dioxide", cls: "Ring-opening", cas: null,
    tags: ["biodegradable", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: 8, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 7, b: "S1", order: 1 }],
    note: "A polymer that is roughly half carbon dioxide by mass, made by copolymerising CO2 with an epoxide over a zinc or cobalt catalyst - one of the few routes that uses CO2 as a feedstock rather than emitting it. It is amorphous with a glass transition near room temperature, so it is soft and creeps, and it depolymerises cleanly back to the cyclic carbonate when heated, which makes it useful as a sacrificial binder that burns out without residue."
  },
  {
    name: "Poly(vinylidene fluoride-co-hexafluoropropylene)", aka: ["PVDF-HFP", "Kynar Flex", "P(VDF-HFP)"],
    monomer: "vinylidene fluoride + hexafluoropropylene", cls: "Addition (vinyl)", cas: "1184966-74-2",
    tags: ["copolymer", "fluoropolymer", "elastomer", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "PVDF with enough hexafluoropropylene copolymerised in to break up its crystallinity. The result keeps the chemical and electrochemical resistance of the fluoropolymer but becomes flexible and soluble, which is why it is the standard binder and gel-electrolyte host in lithium batteries rather than PVDF itself. Higher HFP content takes it from a tough plastic to a true fluoroelastomer. Not drawn as one repeat: it is a random copolymer whose properties are set by the comonomer ratio, so a single unit would misrepresent it."
  },
  {
    name: "Perfluoroalkoxy alkane", aka: ["PFA", "perfluoroalkoxy", "Teflon PFA"],
    monomer: "tetrafluoroethylene + perfluoropropyl vinyl ether", cls: "Addition (vinyl)", cas: "80701-91-3",
    tags: ["fluoropolymer", "high-temperature", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "F" }, { id: 4, el: "F" }, { id: 5, el: "C" }, { id: 6, el: "F" }, { id: 7, el: "F" }, { id: 8, el: "C" }, { id: 9, el: "F" }, { id: 10, el: "O" }, { id: 11, el: "C" }, { id: 12, el: "F" }, { id: 13, el: "F" }, { id: 14, el: "C" }, { id: 15, el: "F" }, { id: 16, el: "F" }, { id: 17, el: "C" }, { id: 18, el: "F" }, { id: 19, el: "F" }, { id: 20, el: "F" }, { id: 21, el: "C" }, { id: 22, el: "F" }, { id: 23, el: "F" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 2, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 5, b: 7, order: 1 }, { a: 5, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 8, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 11, b: 13, order: 1 }, { a: 11, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 14, b: 16, order: 1 }, { a: 14, b: 17, order: 1 }, { a: 17, b: 18, order: 1 }, { a: 17, b: 19, order: 1 }, { a: 17, b: 20, order: 1 }, { a: 8, b: 21, order: 1 }, { a: 21, b: 22, order: 1 }, { a: 21, b: 23, order: 1 }, { a: 21, b: "S1", order: 1 }],
    note: "PTFE that can be melt-processed. A small fraction of a perfluoroalkyl vinyl ether comonomer puts flexible ether branches along the chain, which lowers the melt viscosity enough to injection-mould and extrude while keeping essentially all of PTFE's chemical inertness and its service temperature near 260 C. That is the whole reason it exists: PTFE itself does not flow even above its melting point and has to be sintered like a ceramic. The drawn unit shows one branch point in context, not the true comonomer ratio."
  },
  {
    name: "Poly(methylphenylsiloxane)", aka: ["PMPS", "poly(methyl phenyl siloxane)", "phenyl silicone"],
    monomer: "methylphenyldichlorosilane or its cyclic trimer", cls: "Ring-opening (silicone)", cas: null,
    tags: ["silicone", "high-temperature", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "Si" }, { id: 4, el: "C" }, { id: "S1", el: "*" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 6, b: 11, order: 1 }],
    note: "A silicone with a phenyl in place of one methyl, which is how silicone fluids are stopped from crystallising and pushed to higher temperatures. The bulky aromatic disrupts packing, so the oil stays liquid far below where PDMS would freeze, and it raises the refractive index enough to matter for optical encapsulants. It also absorbs radiation damage better than the all-methyl version, which is why phenyl silicones appear in nuclear and space applications."
  },
  {
    name: "Polydimethylsilane", aka: ["PDMS (silane)", "poly(dimethylsilane)", "polysilane"],
    monomer: "dichlorodimethylsilane", cls: "Ring-opening (silicone)", cas: null,
    tags: ["specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "Si" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 2, b: "S1", order: 1 }],
    note: "A backbone of silicon atoms and nothing else - no oxygen, unlike a siloxane. Sigma bonds between silicon atoms delocalise along the chain, so a polysilane absorbs in the ultraviolet and conducts charge in a way no ordinary saturated polymer does, a phenomenon called sigma conjugation. Its main industrial use is as the precursor that is pyrolysed to silicon carbide fibre. Do not confuse with poly(dimethylsiloxane), which has oxygen in the backbone and is the ordinary silicone."
  },
  {
    name: "Poly(dichlorophosphazene)", aka: ["polyphosphazene", "poly(dichlorophosphazene)", "inorganic rubber"],
    monomer: "hexachlorocyclotriphosphazene", cls: "Ring-opening", cas: "26085-02-9",
    tags: ["elastomer", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "N" }, { id: 3, el: "P" }, { id: 4, el: "Cl" }, { id: 5, el: "Cl" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 3, b: 5, order: 1 }, { a: 3, b: "S1", order: 1 }],
    note: "The gateway to the polyphosphazenes, and useless on its own - the P-Cl bonds hydrolyse in damp air. Its value is that both chlorines on every phosphorus can be displaced by alkoxides or amines, so a single backbone gives access to hundreds of derivatives whose properties are set entirely by what was substituted onto it, from fluoroelastomers to water-soluble drug carriers to biodegradable amino acid esters. Few polymers separate backbone from properties so cleanly."
  },
  {
    name: "Poly(1-butene)", aka: ["PB-1", "polybutene-1", "poly(butene-1)"],
    monomer: "1-butene", cls: "Addition (vinyl)", cas: "9003-28-5",
    tags: ["commodity", "packaging", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 3, b: "S1", order: 1 }],
    note: "A polyolefin whose selling point is creep resistance under sustained pressure at temperature, which is why it is used for hot water pipe. It has an awkward habit: crystallised from the melt it first forms a metastable tetragonal phase and then converts over about a week to the stable trigonal one, getting harder and denser as it goes, so parts have to be conditioned before they are to specification."
  },
  {
    name: "Poly(4-methyl-1-pentene)", aka: ["PMP", "TPX", "poly(4-methylpentene-1)"],
    monomer: "4-methyl-1-pentene", cls: "Addition (vinyl)", cas: "25068-26-2",
    tags: ["commodity", "optical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 5, b: 7, order: 1 }, { a: 3, b: "S1", order: 1 }],
    note: "The transparent polyolefin, and the least dense solid commercial polymer at about 0.83 g/cm3. Its bulky isobutyl side group makes the crystal so loosely packed that the crystalline and amorphous phases have nearly the same refractive index, so light passes without scattering at the boundaries - a semicrystalline polymer that is nonetheless clear. It also melts near 235 C, high for a polyolefin, which is why it is used for autoclavable labware and release film."
  },
  {
    name: "Poly(4-hydroxystyrene)", aka: ["PHS", "poly(vinylphenol)", "poly(4-vinylphenol)"],
    monomer: "4-hydroxystyrene (usually via the acetoxy monomer)", cls: "Addition (vinyl)", cas: null,
    tags: ["optical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "O" }, { id: 10, el: "C" }, { id: 11, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 8, b: 9, order: 1 }, { a: 8, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 5, b: 11, order: 1 }],
    note: "The backbone of deep-UV photoresists, and the reason modern chips can be patterned at all. The phenol is acidic enough to dissolve in aqueous base, so a protected version - typically the tert-butoxycarbonyl ester - is insoluble until acid generated by the exposing light strips the protecting group, at which point the exposed regions wash away. One photon generates a catalyst that deprotects many units, which is the chemical amplification that made 248 nm lithography sensitive enough to be practical."
  },
  {
    name: "Poly(4-chlorostyrene)", aka: ["P4ClS", "poly(p-chlorostyrene)"],
    monomer: "4-chlorostyrene", cls: "Addition (vinyl)", cas: "24991-47-7",
    tags: ["styrenic", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "Cl" }, { id: 10, el: "C" }, { id: 11, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 8, b: 9, order: 1 }, { a: 8, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 5, b: 11, order: 1 }],
    note: "Polystyrene with a chlorine para on the ring, which raises the glass transition by about 20 C and the refractive index with it. Its main use is as a model: it is nearly isomorphous with polystyrene but has a very different electron density, so a block copolymer of the two gives sharp X-ray contrast between domains that would otherwise be invisible."
  },
  {
    name: "Poly(pentafluorostyrene)", aka: ["PPFS", "poly(2,3,4,5,6-pentafluorostyrene)"],
    monomer: "2,3,4,5,6-pentafluorostyrene", cls: "Addition (vinyl)", cas: null,
    tags: ["styrenic", "fluoropolymer", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "F" }, { id: 8, el: "C" }, { id: 9, el: "F" }, { id: 10, el: "C" }, { id: 11, el: "F" }, { id: 12, el: "C" }, { id: 13, el: "F" }, { id: 14, el: "C" }, { id: 15, el: "F" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 8, b: 10, order: 2 }, { a: 10, b: 11, order: 1 }, { a: 10, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 12, b: 14, order: 2 }, { a: 5, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }],
    note: "Polystyrene with every ring hydrogen replaced by fluorine, which inverts the ring's electronics: the electron-poor ring stacks face to face with ordinary electron-rich aromatics rather than edge to face, and the para fluorine is activated toward substitution by thiols. That second point is the useful one - the polymer is a post-polymerisation modification platform where one reaction installs almost any functional group on a well-defined backbone."
  },
  {
    name: "Poly(vinyl carbazole)", aka: ["PVK", "poly(N-vinylcarbazole)"],
    monomer: "N-vinylcarbazole", cls: "Addition (vinyl)", cas: null,
    tags: ["conductive", "optical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "N" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 6, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 2 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 2 }, { a: 15, b: 16, order: 1 }, { a: 16, b: 17, order: 2 }, { a: 5, b: 17, order: 1 }, { a: 12, b: 17, order: 1 }],
    note: "The first photoconductive polymer, and the material that made electrophotography a polymer technology. The carbazole side group is electron-rich and transports positive charge by hopping from one ring to the next, so a doped film discharges where light strikes it - the basis of the photoreceptor drum in a photocopier. It survives in organic LEDs as a hole-transport layer and as a wide-gap host."
  },
  {
    name: "Poly(vinyl butyrate)", aka: ["PVB (butyrate)", "poly(vinyl butanoate)"],
    monomer: "vinyl butyrate", cls: "Addition (vinyl)", cas: null,
    tags: ["specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }],
    note: "Poly(vinyl acetate) with a longer acyl group, which pushes the glass transition down by roughly 50 C - the ester acts as a built-in plasticiser. It is useful mostly as a term in the series: comparing the vinyl esters from acetate through propionate to butyrate isolates the effect of side-group length on chain packing with everything else held constant. Not to be confused with poly(vinyl butyral), the acetal used in laminated glass."
  },
  {
    name: "Poly(2-hydroxyethyl acrylate)", aka: ["PHEA", "poly(hydroxyethyl acrylate)"],
    monomer: "2-hydroxyethyl acrylate", cls: "Addition (acrylate)", cas: null,
    tags: ["acrylate", "water-soluble", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "O" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 5, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }],
    note: "The acrylate twin of the hydrogel standard poly(2-hydroxyethyl methacrylate). Losing the alpha-methyl drops the glass transition far below room temperature, so where the methacrylate gives a firm hydrogel this gives a soft, tacky one - the same hydroxyl chemistry and water uptake, a completely different mechanical result. A reminder that in the acrylate/methacrylate pairs the methyl group, not the ester, sets the stiffness."
  },
  {
    name: "Poly(lauryl methacrylate)", aka: ["PLMA", "poly(dodecyl methacrylate)"],
    monomer: "lauryl methacrylate", cls: "Addition (methacrylate)", cas: null,
    tags: ["methacrylate", "elastomer", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: "S1", el: "*" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "O" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "C" }, { id: 19, el: "C" }, { id: 20, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 1 }, { a: 16, b: 17, order: 1 }, { a: 17, b: 18, order: 1 }, { a: 18, b: 19, order: 1 }, { a: 19, b: 20, order: 1 }],
    note: "A methacrylate with a twelve-carbon tail, which makes it soluble in hydrocarbons and useless in water - the opposite of most of the family. That oil solubility is the point: it is the stabilising block of dispersion polymerisations run in alkanes and the backbone of viscosity index improvers for engine oil, where the coil expands as the oil thins with temperature and offsets the drop in viscosity."
  },
  {
    name: "Poly(trifluoroethyl methacrylate)", aka: ["PTFEMA", "poly(2,2,2-trifluoroethyl methacrylate)"],
    monomer: "2,2,2-trifluoroethyl methacrylate", cls: "Addition (methacrylate)", cas: null,
    tags: ["methacrylate", "fluoropolymer", "optical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: "S1", el: "*" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "O" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "F" }, { id: 12, el: "F" }, { id: 13, el: "F" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 10, b: 12, order: 1 }, { a: 10, b: 13, order: 1 }],
    note: "A methacrylate carrying a fluorinated ester, which drops the refractive index well below PMMA's while keeping the same processability. That is exactly what a plastic optical fibre cladding needs: a low-index skin on a PMMA core so light totally internally reflects. The fluorine also lowers the surface energy, so it doubles as a low-adhesion coating."
  },
  {
    name: "Poly(sebacic anhydride)", aka: ["PSA", "polysebacic anhydride", "poly(sebacic acid)"],
    monomer: "sebacic acid", cls: "Step-growth (polyester)", cas: null,
    tags: ["biodegradable", "drug delivery", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 2 }, { a: 13, b: "S1", order: 1 }],
    note: "The polymer behind implantable chemotherapy wafers, and the clearest case of surface erosion. The anhydride linkage hydrolyses far faster than water can diffuse into the solid, so degradation is confined to the outside and the implant thins from the surface inward rather than falling apart throughout - which means drug release tracks geometry and stays near zero order. A polyester in the same shape would take up water everywhere and dump its payload when the matrix finally collapsed."
  },
  {
    name: "Poly(ethylene furanoate)", aka: ["PEF", "poly(ethylene 2,5-furandicarboxylate)"],
    monomer: "2,5-furandicarboxylic acid + ethylene glycol", cls: "Step-growth (polyester)", cas: "28728-19-0",
    tags: ["biobased", "packaging", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "O" }, { id: 13, el: "C" }, { id: 14, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 11, b: 12, order: 1 }, { a: 8, b: 12, order: 1 }, { a: 11, b: 13, order: 1 }, { a: 13, b: 14, order: 2 }, { a: 13, b: "S1", order: 1 }],
    note: "The bio-based answer to PET, with a furan ring from sugar in place of the terephthalate from oil. It is not merely a substitute: the furan ring is bent rather than linear and rotates far more sluggishly, so chain motion is slower and the barrier to oxygen and carbon dioxide improves by roughly an order of magnitude over PET - which matters commercially for bottled drinks. The same sluggishness makes it crystallise slowly, which complicates processing."
  },
  {
    name: "Poly(butylene adipate-co-terephthalate)", aka: ["PBAT", "Ecoflex", "poly(butylene adipate-terephthalate)"],
    monomer: "1,4-butanediol + adipic acid + terephthalic acid", cls: "Step-growth (polyester)", cas: null,
    tags: ["copolymer", "biodegradable", "packaging", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The flexible half of most compostable plastic film. Aliphatic adipate segments are attacked readily by soil enzymes; aromatic terephthalate segments supply the strength and melt behaviour that a purely aliphatic polyester lacks. The composition is chosen to sit just below the aromatic content at which biodegradation stalls, which is the whole design problem - too little aromatic and the film is too weak to use, too much and it stops composting. Usually blended with polylactide, which is stiff and brittle where this is neither. Not drawn: it is a random copolyester and one repeat unit cannot represent it."
  },
  {
    name: "Poly(ortho ester)", aka: ["POE", "polyorthoester"],
    monomer: "diketene acetal + diol", cls: "Step-growth (polyester)", cas: null,
    tags: ["biodegradable", "drug delivery", "biomedical", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "A degradable polymer designed so that its own degradation products do not accelerate the process. Polyesters hydrolyse to carboxylic acids, which catalyse further hydrolysis, so a thick implant degrades from the inside out and can dump its contents - the well-known autocatalysis problem. An ortho ester hydrolyses to neutral products instead, and the linkage is acid-sensitive rather than acid-generating, so erosion stays at the surface and can even be tuned by the pH of the tissue it sits in. Not drawn: the family covers several distinct linkage chemistries."
  },
  {
    name: "Poly(beta-amino ester)", aka: ["PBAE", "poly(b-amino ester)"],
    monomer: "diacrylate + primary or secondary amine", cls: "Step-growth (polyester)", cas: null,
    tags: ["biodegradable", "polyelectrolyte", "drug delivery", "biomedical", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "A gene delivery polymer whose appeal is how easily it is varied. A diacrylate and an amine simply add together at mild temperature with no catalyst and no by-product, so hundreds of structures can be made in parallel in a plate and screened - which is how the field found its best performers rather than by design. The tertiary amines in the backbone protonate to bind nucleic acids, and the ester linkages then hydrolyse to release them, so binding and release are separate handles. Not drawn: the point of the class is combinatorial variation, so no single repeat represents it."
  },
  {
    name: "Poly(vinylidene cyanide)", aka: ["PVDCN", "poly(1,1-dicyanoethylene)"],
    monomer: "vinylidene cyanide", cls: "Addition (vinyl)", cas: null,
    tags: ["specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "N" }, { id: 7, el: "C" }, { id: 8, el: "N" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 3 }, { a: 3, b: 7, order: 1 }, { a: 7, b: 8, order: 3 }],
    note: "Two nitriles on the same carbon give one of the largest dipole moments per repeat of any polymer, which is why its copolymers with vinyl acetate are studied as piezoelectric films that need no poling stretch the way PVDF does. The monomer is violently reactive toward any nucleophile, including water and amines, so it has to be handled dry and is polymerised anionically almost on contact."
  },
  {
    name: "Poly(acrylamide-co-acrylic acid)", aka: ["PAM-co-AA", "partially hydrolysed polyacrylamide", "HPAM"],
    monomer: "acrylamide + acrylic acid", cls: "Addition (vinyl)", cas: null,
    tags: ["copolymer", "water-soluble", "polyelectrolyte", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The polymer pumped underground in enhanced oil recovery, and the superabsorbent in soil conditioners. Hydrolysing some of polyacrylamide's amides to carboxylates puts charge on the chain, which expands the coil and multiplies the solution viscosity - the property that lets it push oil through rock. Too much hydrolysis and it precipitates with the calcium in brine, so the degree of hydrolysis is the design variable. Not drawn: the composition is the point, and one repeat cannot carry it."
  },
  {
    name: "Poly(N,N-diethylacrylamide)", aka: ["PDEAAm", "poly(diethylacrylamide)"],
    monomer: "N,N-diethylacrylamide", cls: "Addition (acrylate)", cas: null,
    tags: ["acrylate", "water-soluble", "thermoresponsive", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: 7, el: "N" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 5, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 7, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }],
    note: "A thermoresponsive polymer that collapses on heating like poly(N-isopropylacrylamide) but has no N-H at all. That matters: PNIPAM's amide hydrogen lets it hydrogen-bond to itself and to surfaces, which shows up as hysteresis on cooling and as unwanted protein adhesion. With both hydrogens replaced by ethyls, the transition is sharper and more reversible, at the cost of a cloud point that sits a few degrees lower."
  },
  {
    name: "Poly(2-vinylnaphthalene)", aka: ["P2VN", "poly(2-vinyl naphthalene)"],
    monomer: "2-vinylnaphthalene", cls: "Addition (vinyl)", cas: null,
    tags: ["styrenic", "optical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 7, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 2 }, { a: 5, b: 14, order: 1 }],
    note: "Polystyrene with a second fused ring, which raises the glass transition to about 150 C and the refractive index above 1.68 - high for an all-hydrocarbon polymer. The naphthalene also forms excimers between neighbouring side groups, so its fluorescence reports on how close the chain segments are, which made it a standard probe for chain conformation and for miscibility in blends."
  },
  {
    name: "Poly(vinyl formal)", aka: ["PVFM", "Formvar", "poly(vinyl formal)"],
    monomer: "poly(vinyl alcohol) + formaldehyde", cls: "Addition (vinyl)", cas: null,
    tags: ["specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: "S1", el: "*" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "O" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: "S1", order: 1 }, { a: 5, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 3, b: 9, order: 1 }],
    note: "Poly(vinyl alcohol) whose hydroxyls have been paired up into six-membered acetal rings by formaldehyde. Closing the rings removes the hydrogen bonding that makes PVA water-soluble and intractable, leaving a tough film-former that is the classic support film for transmission electron microscopy grids and, mixed with a phenolic, the enamel on magnet wire."
  },
  {
    name: "Poly(vinyl butyral)", aka: ["PVB", "Butvar", "poly(vinyl butyral)"],
    monomer: "poly(vinyl alcohol) + butyraldehyde", cls: "Addition (vinyl)", cas: null,
    tags: ["specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: "S1", el: "*" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "O" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: "S1", order: 1 }, { a: 5, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 8, b: 12, order: 1 }, { a: 3, b: 12, order: 1 }],
    note: "The interlayer in laminated safety glass, and the reason a windscreen holds together after it cracks. The same acetal chemistry as the formal, but with a propyl group hanging off each ring, which keeps the polymer soft and enormously tough while retaining enough residual hydroxyl to bond tightly to glass. Commercial material is deliberately incompletely reacted: the leftover alcohol groups are what stick to the glass, so the degree of acetalisation is specified rather than maximised."
  },
  {
    name: "Poly(methacrylamide)", aka: ["PMAAm", "poly(methacrylamide)"],
    monomer: "methacrylamide", cls: "Addition (methacrylate)", cas: null,
    tags: ["water-soluble", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: "S1", el: "*" }, { id: 6, el: "C" }, { id: 7, el: "N" }, { id: 8, el: "O" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 6, b: 8, order: 2 }],
    note: "Polyacrylamide with an alpha-methyl, which raises the glass transition far above the parent and makes the polymer stiffer and more hydrolytically stable. It is the amide term in the acrylate/methacrylate/acrylamide/methacrylamide grid that gets used to separate the effect of the backbone methyl from the effect of the side group."
  },
  {
    name: "Poly(2-ethylhexyl methacrylate)", aka: ["PEHMA", "poly(2-ethylhexyl methacrylate)"],
    monomer: "2-ethylhexyl methacrylate", cls: "Addition (methacrylate)", cas: null,
    tags: ["methacrylate", "elastomer", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: "S1", el: "*" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "O" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 10, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 1 }],
    note: "A methacrylate with a branched eight-carbon ester, which puts the glass transition around -10 C - soft where PMMA is hard, from the side group alone. The branch is what does it: a linear octyl ester of the same mass packs better and sits higher. Used where an acrylic needs to stay flexible, in pressure-sensitive adhesives and as the soft phase of acrylic block copolymers."
  },
  {
    name: "Poly(furfuryl methacrylate)", aka: ["PFMA", "poly(furfuryl methacrylate)"],
    monomer: "furfuryl methacrylate", cls: "Addition (methacrylate)", cas: null,
    tags: ["methacrylate", "biobased", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: "S1", el: "*" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "O" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "O" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 2 }, { a: 13, b: 14, order: 1 }, { a: 10, b: 14, order: 1 }],
    note: "A methacrylate whose ester comes from furfural, which is made from corn cobs and bagasse rather than from oil. The furan ring is also a diene, so the polymer undergoes Diels-Alder addition with maleimides - and the adduct comes apart again on heating, which is the basis of self-healing and reworkable networks built from it."
  },
  {
    name: "Poly(butylene adipate)", aka: ["PBA (polyester)", "poly(butylene adipate)"],
    monomer: "1,4-butanediol + adipic acid", cls: "Step-growth (polyester)", cas: null,
    tags: ["biodegradable", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "O" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 8, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 2 }, { a: 14, b: "S1", order: 1 }],
    note: "A wholly aliphatic polyester, readily attacked by soil enzymes, and the flexible half of the compostable copolyesters. On its own it melts near 60 C and is too weak to use, which is exactly why it is copolymerised with terephthalate; it also serves as the soft block of hydrolysable polyurethanes."
  },
  {
    name: "Poly(hexamethylene adipamide-co-terephthalamide)", aka: ["PA 66/6T", "nylon 66/6T", "semi-aromatic polyamide"],
    monomer: "hexamethylenediamine + adipic acid + terephthalic acid", cls: "Step-growth (polyamide)", cas: null,
    tags: ["copolymer", "engineering", "high-temperature", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "Nylon with some of the adipic acid replaced by terephthalic, which lifts the melting point above 300 C and holds stiffness far better when hot and wet - the failing that keeps ordinary nylon out of under-bonnet parts. The aromatic content is kept below the level at which the polymer stops melting before it decomposes, which is the constraint the whole semi-aromatic family works inside. Not drawn: it is a random copolyamide and one repeat cannot represent it."
  },
  {
    name: "Poly(ethylene sebacate)", aka: ["PES (sebacate)", "poly(ethylene sebacate)"],
    monomer: "ethylene glycol + sebacic acid", cls: "Step-growth (polyester)", cas: null,
    tags: ["biodegradable", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 1 }, { a: 16, b: 17, order: 2 }, { a: 16, b: "S1", order: 1 }],
    note: "A long-chain aliphatic polyester whose diacid comes from castor oil. Lengthening the diacid from adipic to sebacic pushes the structure toward polyethylene, so the melting point and crystallinity rise while the ester density - and with it the rate of hydrolysis - falls. The aliphatic polyesters are essentially one series with that trade running through it."
  },
  {
    name: "Poly(bisphenol A carbonate-co-siloxane)", aka: ["PC-siloxane", "polycarbonate-siloxane copolymer"],
    monomer: "bisphenol A + phosgene + siloxane block", cls: "Step-growth (polyester)", cas: null,
    tags: ["copolymer", "engineering", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "Polycarbonate with siloxane blocks built in to fix its two weaknesses at once: notch sensitivity in the cold, and flammability. The rubbery siloxane phase separates into domains that blunt a crack tip, so impact strength survives well below where plain polycarbonate turns brittle, and the silicon chars rather than feeding a flame. Not drawn: it is a segmented block copolymer whose properties depend on block length, not on a repeat unit."
  },
  {
    name: "Poly(hydroxybutyrate-co-hydroxyvalerate)", aka: ["PHBV", "Biopol", "PHB-co-PHV"],
    monomer: "3-hydroxybutyrate + 3-hydroxyvalerate", cls: "Step-growth (polyester)", cas: null,
    tags: ["copolymer", "biopolymer", "biobased", "biodegradable", "packaging", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "Bacteria make this as a carbon store, and it is one of the few plastics that is both bio-based and marine-degradable. Pure poly(3-hydroxybutyrate) is unusable - so crystalline that it is brittle, and its melting point sits close to where it degrades. Feeding the bacteria a little propionate makes them copolymerise a valerate unit in, which disrupts the crystal, opens a processing window and buys toughness. Not drawn: the copolymer ratio is the whole design, and it is set by what the bacteria are fed."
  },
  {
    name: "Poly(glycerol sebacate)", aka: ["PGS", "poly(glycerol sebacate)"],
    monomer: "glycerol + sebacic acid", cls: "Step-growth (polyester)", cas: null,
    tags: ["biodegradable", "elastomer", "biomedical", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "A soft degradable elastomer from two metabolites - glycerol and a fatty diacid - crosslinked through glycerol's third hydroxyl. It recovers elastically at strains where the stiff degradable polyesters have long since yielded, which suits tissues that move: heart, blood vessel, nerve. Because the crosslinks are esters it erodes from the surface rather than crumbling. Not drawn: it is a thermoset network whose crosslink density depends on cure, so there is no repeat unit."
  },
  {
    name: "Poly(ether ketone ketone)", aka: ["PEKK", "poly(ether ketone ketone)"],
    monomer: "diphenyl ether + terephthaloyl/isophthaloyl chloride", cls: "Step-growth (polyester)", cas: null,
    tags: ["engineering", "high-temperature", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "O" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "O" }, { id: 19, el: "C" }, { id: 20, el: "C" }, { id: 21, el: "C" }, { id: 22, el: "C" }, { id: 23, el: "C" }, { id: 24, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 3, b: 8, order: 1 }, { a: 6, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 9, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 2 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 2 }, { a: 11, b: 16, order: 1 }, { a: 14, b: 17, order: 1 }, { a: 17, b: 18, order: 2 }, { a: 17, b: 19, order: 1 }, { a: 19, b: 20, order: 2 }, { a: 20, b: 21, order: 1 }, { a: 21, b: 22, order: 2 }, { a: 22, b: 23, order: 1 }, { a: 23, b: 24, order: 2 }, { a: 19, b: 24, order: 1 }, { a: 22, b: "S1", order: 1 }],
    note: "Two ketones per ether instead of PEEK's one, which raises the glass transition and lets the crystallisation rate be tuned by the ratio of para to meta linkages in the acid - unusual control for a semicrystalline engineering polymer, and the reason PEKK is favoured for laser sintering and for composite tape laying where the melt has to stay workable for a while."
  },
  {
    name: "Poly(amide-imide)", aka: ["PAI", "Torlon", "poly(amide imide)"],
    monomer: "trimellitic anhydride chloride + aromatic diamine", cls: "Step-growth (polyamide)", cas: null,
    tags: ["engineering", "high-temperature", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "N" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "N" }, { id: 10, el: "C" }, { id: 11, el: "O" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "C" }, { id: 19, el: "O" }, { id: 20, el: "C" }, { id: 21, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 3, b: 8, order: 1 }, { a: 6, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 10, b: 12, order: 1 }, { a: 12, b: 13, order: 2 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 2 }, { a: 15, b: 16, order: 1 }, { a: 16, b: 17, order: 2 }, { a: 12, b: 17, order: 1 }, { a: 17, b: 18, order: 1 }, { a: 9, b: 18, order: 1 }, { a: 18, b: 19, order: 2 }, { a: 16, b: 20, order: 1 }, { a: 20, b: 21, order: 2 }, { a: 20, b: "S1", order: 1 }],
    note: "Half polyimide, half aromatic polyamide, and the compromise between them. The imide rings supply the heat resistance, the amide links supply enough chain flexibility that the polymer can actually be melt-processed - which the fully imide polymers cannot. It holds strength to about 275 C and is machined into bearings and valve seats that run hot and dry. Drawn with p-phenylenediamine, the simplest of the aromatic diamines used; commercial grades usually use a bridged one, which lengthens the repeat without changing the argument."
  },
  {
    name: "Poly(benzoxazole)", aka: ["PBO", "Zylon", "poly(p-phenylene benzobisoxazole)"],
    monomer: "diaminoresorcinol + terephthalic acid", cls: "Step-growth (polyamide)", cas: null,
    tags: ["engineering", "high-temperature", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "N" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "O" }, { id: 17, el: "O" }, { id: 18, el: "C" }, { id: 19, el: "N" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 2, b: 7, order: 1 }, { a: 5, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 2 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 2 }, { a: 10, b: 15, order: 1 }, { a: 15, b: 16, order: 1 }, { a: 8, b: 16, order: 1 }, { a: 13, b: 17, order: 1 }, { a: 17, b: 18, order: 1 }, { a: 18, b: 19, order: 2 }, { a: 12, b: 19, order: 1 }, { a: 18, b: "S1", order: 1 }],
    note: "The strongest organic fibre made, stronger than aramid by roughly half again, spun from a liquid crystalline solution of an essentially rigid rod. Its weakness is well documented and structural: the oxazole ring hydrolyses slowly in humid air under ultraviolet, so fibre strength decays with age - the reason body armour made from it was recalled."
  },
  {
    name: "Polycarbosilane", aka: ["PCS", "poly(dimethylsilylene methylene)", "SiC precursor"],
    monomer: "polydimethylsilane (thermal rearrangement)", cls: "Ring-opening (silicone)", cas: null,
    tags: ["high-temperature", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "Si" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 2, b: 5, order: 1 }, { a: 5, b: "S1", order: 1 }],
    note: "A polymer made to be destroyed. Alternating silicon and carbon in the backbone means that pyrolysis leaves silicon carbide behind in the shape the polymer was formed in, so a ceramic fibre can be spun as a plastic and then fired - which is how continuous SiC fibre for turbine composites is made at all, ceramics being unspinnable. Obtained by rearranging polydimethylsilane, which has no carbon in its backbone, under heat."
  },
  {
    name: "Poly(bis(trifluoroethoxy)phosphazene)", aka: ["PTFEP", "fluorophosphazene", "poly(bis(trifluoroethoxy)phosphazene)"],
    monomer: "poly(dichlorophosphazene) + trifluoroethoxide", cls: "Ring-opening", cas: null,
    tags: ["fluoropolymer", "elastomer", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "N" }, { id: 3, el: "P" }, { id: 4, el: "O" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "F" }, { id: 8, el: "F" }, { id: 9, el: "F" }, { id: 10, el: "O" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "F" }, { id: 14, el: "F" }, { id: 15, el: "F" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 6, b: 8, order: 1 }, { a: 6, b: 9, order: 1 }, { a: 3, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 12, b: 14, order: 1 }, { a: 12, b: 15, order: 1 }, { a: 3, b: "S1", order: 1 }],
    note: "The best-known derivative of poly(dichlorophosphazene), made by displacing both chlorines with a fluorinated alkoxide. The inorganic backbone is extraordinarily flexible - the glass transition is around -66 C - while the fluorinated side groups give a low-energy, blood-compatible surface, so it is used as a stent coating and as a fuel-resistant elastomer. It shows what the parent polymer is for: the backbone stays, the properties come entirely from what was substituted."
  },
  {
    name: "Cellulose acetate", aka: ["CA", "acetylated cellulose", "cellulose triacetate"],
    monomer: "cellulose + acetic anhydride", cls: "Step-growth (polyester)", cas: null,
    tags: ["biopolymer", "biobased", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "O" }, { id: 10, el: "O" }, { id: 11, el: "C" }, { id: "S1", el: "*" }, { id: 13, el: "C" }, { id: 14, el: "O" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "O" }, { id: 18, el: "C" }, { id: 19, el: "O" }, { id: 20, el: "C" }, { id: 21, el: "C" }, { id: 22, el: "O" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 7, b: 9, order: 2 }, { a: 4, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: "S1", order: 1 }, { a: 11, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 1 }, { a: 15, b: 17, order: 2 }, { a: 13, b: 18, order: 1 }, { a: 3, b: 18, order: 1 }, { a: 18, b: 19, order: 1 }, { a: 19, b: 20, order: 1 }, { a: 20, b: 21, order: 1 }, { a: 20, b: 22, order: 2 }],
    note: "The oldest way round cellulose's intractability, and still the largest. Capping the hydroxyls as acetates breaks the hydrogen bonding that makes cellulose insoluble, so the material dissolves and can be spun, cast or moulded - as cigarette filters, photographic film base and reverse-osmosis membranes. The drawn unit is the fully substituted triacetate; commercial grades are partly hydrolysed back, because the degree of substitution is what sets solubility."
  },
  {
    name: "Chondroitin sulfate", aka: ["CS", "chondroitin 4-sulfate", "chondroitin sulphate"],
    monomer: "glucuronic acid + N-acetylgalactosamine, sulfated", cls: "Step-growth (polyester)", cas: null,
    tags: ["biopolymer", "water-soluble", "polyelectrolyte", "biomedical", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The glycosaminoglycan that hangs off aggrecan by the hundred to make cartilage's bottlebrush. Each disaccharide carries a carboxylate and at least one sulfate, so the charge density is far higher than hyaluronan's, and it is that charge - drawing water in and resisting its expulsion under load - that lets cartilage carry a joint's weight. Not drawn: the sulfation pattern varies along the chain and between tissues, and picking one would assert a regularity the molecule does not have."
  },
  {
    name: "Gelatin", aka: ["gelatine", "denatured collagen", "hydrolysed collagen"],
    monomer: "collagen (hydrolysed)", cls: "Step-growth (polyamide)", cas: null,
    tags: ["biopolymer", "water-soluble", "biomedical", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "Collagen that has been boiled until its triple helix falls apart. On cooling the chains partly re-form helices and physically crosslink, which is why gelatin sets on cooling and melts near body temperature - a thermoreversible gel with no chemistry involved. That reversibility, plus a sequence cells recognise and adhere to, makes it the default cheap scaffold in tissue engineering. Not drawn: it is a hydrolysed protein with no repeat unit."
  },
  {
    name: "Silk fibroin", aka: ["fibroin", "silk protein", "Bombyx mori silk"],
    monomer: "glycine-alanine-serine rich protein", cls: "Step-growth (polyamide)", cas: null,
    tags: ["biopolymer", "biomedical", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "A protein whose strength comes from long runs of glycine alternating with alanine, small enough side groups that the chains pack into tight beta sheets - nanocrystals held in an amorphous matrix, which is a composite made at the molecular scale. Processing controls the sheet content and therefore everything else: the same protein gives a slow-degrading suture or a soft hydrogel depending only on how it is dried. Not drawn: it is a protein with a repetitive but not exactly periodic sequence."
  },
  {
    name: "Poly(gamma-glutamic acid)", aka: ["gamma-PGA", "natto gum", "poly(g-glutamic acid)"],
    monomer: "D/L-glutamic acid (bacterial)", cls: "Step-growth (polyamide)", cas: null,
    tags: ["biopolymer", "biobased", "water-soluble", "polyelectrolyte", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "N" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: "S1", el: "*" }, { id: 9, el: "C" }, { id: 10, el: "O" }, { id: 11, el: "O" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: "S1", order: 1 }, { a: 3, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 9, b: 11, order: 1 }],
    note: "The sticky, stringy polymer in fermented soybeans, and an oddity among polypeptides: the amide bond runs through the side-chain carboxyl rather than the alpha one, so the free acid hangs off the backbone and no protease that cuts ordinary peptides will touch it. Made by bacteria as a capsule, edible, and a strong water-holder, so it turns up as a moisturiser, a thickener and a flocculant."
  },
  {
    name: "Phenol-formaldehyde resin", aka: ["Bakelite", "phenolic resin", "novolac", "resole"],
    monomer: "phenol + formaldehyde", cls: "Step-growth (polyester)", cas: null,
    tags: ["engineering", "high-temperature", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The first fully synthetic plastic, and the archetype of a thermoset: methylene bridges link phenol rings in every direction until the material is one covalently bonded network that cannot be melted or dissolved again. Two versions exist by design - a novolac made with excess phenol needs a separate hardener, a resole made with excess formaldehyde carries its own. Still the binder in brake pads, foundry sand and circuit-board laminate because it chars instead of dripping. Not drawn: a random network has no repeat unit."
  },
  {
    name: "Melamine-formaldehyde resin", aka: ["melamine resin", "MF resin", "Formica"],
    monomer: "melamine + formaldehyde", cls: "Step-growth (polyamide)", cas: null,
    tags: ["engineering", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The hard, colourless thermoset on laminate worktops and in unbreakable tableware. Melamine offers six reactive N-H sites, so the network is far denser than a phenolic's and the surface is correspondingly harder and more scratch resistant - and, unlike phenolics, it is not dark, so it takes any colour. Its known failure is slow hydrolysis of the amine linkages in hot water, which releases formaldehyde. Not drawn: a network with no repeat unit."
  },
  {
    name: "Epoxy (DGEBA-amine)", aka: ["epoxy resin", "DGEBA", "bisphenol A diglycidyl ether network"],
    monomer: "bisphenol A diglycidyl ether + polyamine", cls: "Step-growth (polyester)", cas: null,
    tags: ["engineering", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The adhesive and composite matrix that works because nothing leaves. An amine opens the epoxide ring and adds across it, generating the hydroxyl that helps it stick to metal and glass, with no water or other by-product to escape - so it cures in a thick section without voids and barely shrinks, which is why it bonds and why it holds carbon fibre. Cure chemistry sets everything: an aliphatic amine cures at room temperature and softens near 60 C, an aromatic one needs an oven and reaches 200 C. Not drawn: a network with no repeat unit."
  },
  {
    name: "Vulcanised natural rubber", aka: ["vulcanized rubber", "sulfur-crosslinked polyisoprene", "ebonite (high sulfur)"],
    monomer: "cis-1,4-polyisoprene + sulfur", cls: "Addition (diene)", cas: null,
    tags: ["elastomer", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The invention that made rubber a material rather than a curiosity. A few sulfur bridges per hundred isoprene units tie the chains into a network, so the material springs back instead of flowing, and stops going sticky when warm and brittle when cold. The crosslink density is nearly the only variable: a little sulfur gives a tyre, a lot gives ebonite, a hard black thermoset. Not drawn: crosslinks fall where the sulfur happens to react, so there is no repeat unit."
  },
  {
    name: "Poly(ethylene-alt-tetrafluoroethylene)", aka: ["ETFE", "Tefzel", "ethylene tetrafluoroethylene"],
    monomer: "ethylene + tetrafluoroethylene", cls: "Addition (vinyl)", cas: null,
    tags: ["fluoropolymer", "engineering", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "F" }, { id: 6, el: "F" }, { id: 7, el: "C" }, { id: 8, el: "F" }, { id: 9, el: "F" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 4, b: 6, order: 1 }, { a: 4, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 7, b: 9, order: 1 }, { a: 7, b: "S1", order: 1 }],
    note: "Tetrafluoroethylene and ethylene alternate almost perfectly, which is the point: the CH2 groups break up the fluorine sheath enough to give a melt that can be extruded and a film with real tear strength, while keeping most of the chemical resistance. It is what the pillows of stadium roofs are made from - highly transparent to ultraviolet, self-cleaning, and about one percent the weight of the glass it replaces."
  },
  {
    name: "Poly(ethylene-alt-chlorotrifluoroethylene)", aka: ["ECTFE", "Halar"],
    monomer: "ethylene + chlorotrifluoroethylene", cls: "Addition (vinyl)", cas: null,
    tags: ["fluoropolymer", "engineering", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "F" }, { id: 6, el: "F" }, { id: 7, el: "C" }, { id: 8, el: "F" }, { id: 9, el: "Cl" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 4, b: 6, order: 1 }, { a: 4, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 7, b: 9, order: 1 }, { a: 7, b: "S1", order: 1 }],
    note: "ETFE with one fluorine swapped for chlorine, which is bulkier and more polarisable. That single substitution lowers the melting point by about forty degrees and improves adhesion and barrier properties, so it is used as a lining and a powder coating where ETFE would be needlessly hard to process."
  },
  {
    name: "Poly(tetrafluoroethylene-co-hexafluoropropylene)", aka: ["FEP", "fluorinated ethylene propylene", "Teflon FEP"],
    monomer: "tetrafluoroethylene + hexafluoropropylene", cls: "Addition (vinyl)", cas: null,
    tags: ["copolymer", "fluoropolymer", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The first melt-processable relative of PTFE. Hexafluoropropylene puts a trifluoromethyl branch on the chain often enough to stop the crystal packing, so the polymer flows and can be extruded as wire insulation and heat-shrink tubing - at the cost of a service temperature about sixty degrees below PTFE's. Not drawn: a random copolymer whose comonomer ratio is the design."
  },
  {
    name: "Poly(vinylidene fluoride-co-trifluoroethylene)", aka: ["P(VDF-TrFE)", "PVDF-TrFE"],
    monomer: "vinylidene fluoride + trifluoroethylene", cls: "Addition (vinyl)", cas: null,
    tags: ["copolymer", "fluoropolymer", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The ferroelectric polymer that does not need stretching. Plain PVDF only becomes piezoelectric after mechanical drawing forces it into the polar beta phase; adding trifluoroethylene makes that phase form on its own from the melt, so a spin-coated film is piezoelectric as cast. That is what makes flexible printed sensors and ultrasound transducers practical. Not drawn: the comonomer ratio sets the Curie temperature."
  },
  {
    name: "Nafion", aka: ["PFSA", "perfluorosulfonic acid ionomer", "Nafion 117"],
    monomer: "tetrafluoroethylene + perfluoro sulfonyl fluoride vinyl ether", cls: "Addition (vinyl)", cas: null,
    tags: ["copolymer", "fluoropolymer", "polyelectrolyte", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The membrane in essentially every proton-exchange fuel cell and chlor-alkali cell. A PTFE backbone carries perfluoroether side chains ending in sulfonic acid; the fluorocarbon and the acid cannot mix, so the sulfonates cluster into water-filled channels a few nanometres across that conduct protons while the backbone keeps the film mechanically and chemically intact. Not drawn: a random copolymer whose equivalent weight is the specification."
  },
  {
    name: "Poly(hexafluoropropylene oxide)", aka: ["PFPE", "Krytox", "perfluoropolyether"],
    monomer: "hexafluoropropylene oxide", cls: "Ring-opening", cas: null,
    tags: ["fluoropolymer", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "F" }, { id: 5, el: "C" }, { id: 6, el: "F" }, { id: 7, el: "F" }, { id: 8, el: "F" }, { id: 9, el: "C" }, { id: 10, el: "F" }, { id: 11, el: "F" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 5, b: 7, order: 1 }, { a: 5, b: 8, order: 1 }, { a: 3, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 9, b: 11, order: 1 }, { a: 9, b: "S1", order: 1 }],
    note: "A completely fluorinated polyether, liquid over an enormous temperature range and chemically inert enough to sit in contact with liquid oxygen or fuming acid. It is the lubricant used where a hydrocarbon oil would ignite or dissolve - oxygen service, vacuum pumps, spacecraft mechanisms - and its vapour pressure is so low that it stays put in vacuum."
  },
  {
    name: "Poly(trifluoropropylmethylsiloxane)", aka: ["FVMQ", "fluorosilicone", "poly(3,3,3-trifluoropropylmethylsiloxane)"],
    monomer: "trifluoropropylmethylcyclotrisiloxane", cls: "Ring-opening (silicone)", cas: null,
    tags: ["silicone", "fluoropolymer", "elastomer", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "Si" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "F" }, { id: 9, el: "F" }, { id: 10, el: "F" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 7, b: 9, order: 1 }, { a: 7, b: 10, order: 1 }, { a: 3, b: "S1", order: 1 }],
    note: "Silicone that survives contact with fuel. Ordinary PDMS swells badly in hydrocarbons, which rules it out for seals in engines and aircraft; replacing one methyl per silicon with a trifluoropropyl group raises the solubility parameter enough to resist that swelling while keeping the siloxane backbone's flexibility down to about -60 C."
  },
  {
    name: "Poly(diphenylsiloxane)", aka: ["PDPS", "poly(diphenyl siloxane)"],
    monomer: "diphenyldichlorosilane", cls: "Ring-opening (silicone)", cas: null,
    tags: ["silicone", "high-temperature", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "Si" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 4, b: 9, order: 1 }, { a: 3, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 2 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 2 }, { a: 10, b: 15, order: 1 }, { a: 3, b: "S1", order: 1 }],
    note: "The rigid extreme of the siloxane family. Two phenyls per silicon make the chain stiff and highly crystalline, so unlike PDMS it is a solid that melts above 250 C rather than an oil. Used almost entirely as a comonomer, where a small fraction raises the thermal stability and refractive index of an otherwise dimethyl silicone."
  },
  {
    name: "Poly(methylhydrosiloxane)", aka: ["PMHS", "poly(methylhydrosiloxane)", "polymethylhydrosiloxane"],
    monomer: "methyldichlorosilane", cls: "Ring-opening (silicone)", cas: null,
    tags: ["silicone", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "Si" }, { id: 4, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: "S1", order: 1 }],
    note: "A silicone with a reactive hydrogen on every silicon, which makes it the crosslinker rather than the product. Those Si-H bonds add across vinyl groups under a platinum catalyst, which is the hydrosilylation cure behind every addition-cure silicone rubber, and they also serve as a cheap, air-stable reducing agent in organic synthesis."
  },
  {
    name: "Poly(methylvinylsiloxane)", aka: ["PMVS", "vinyl silicone", "poly(methylvinylsiloxane)"],
    monomer: "methylvinylcyclosiloxane", cls: "Ring-opening (silicone)", cas: null,
    tags: ["silicone", "elastomer", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "Si" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 3, b: "S1", order: 1 }],
    note: "The other half of an addition-cure silicone: the vinyl groups here are what the Si-H of a hydride siloxane adds across. In practice a few mole percent of vinyl is copolymerised into an otherwise dimethyl chain, and that fraction sets the crosslink density and therefore the modulus of the cured rubber."
  },
  {
    name: "Nylon 4", aka: ["PA 4", "poly(2-pyrrolidone)", "polyamide 4"],
    monomer: "2-pyrrolidone", cls: "Ring-opening (polyamide)", cas: null,
    tags: ["engineering", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "N" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: "S1", order: 1 }],
    note: "The most amide-dense nylon that can practically be made, one amide for every four backbone atoms. That gives it the highest moisture regain of the family - closer to cotton than to nylon 6 - which made it attractive as a comfortable synthetic fibre, but it also degrades near its melting point, so it has never been produced at scale."
  },
  {
    name: "Nylon 7", aka: ["PA 7", "polyamide 7", "poly(7-aminoheptanoic acid)"],
    monomer: "7-aminoheptanoic acid", cls: "Step-growth (polyamide)", cas: null,
    tags: ["engineering", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "N" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 9, b: "S1", order: 1 }],
    note: "An odd-numbered nylon, and that parity matters: with an odd count between amides the chains cannot pair every carbonyl with a neighbouring N-H the way even nylons do, so the hydrogen bonding is frustrated and the crystal is different. It is the reason odd nylons show ferroelectric behaviour that even ones do not."
  },
  {
    name: "Nylon 4,6", aka: ["PA 46", "Stanyl", "polyamide 4,6"],
    monomer: "1,4-diaminobutane + adipic acid", cls: "Step-growth (polyamide)", cas: null,
    tags: ["engineering", "high-temperature", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "N" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "N" }, { id: 8, el: "C" }, { id: 9, el: "O" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 8, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 2 }, { a: 14, b: "S1", order: 1 }],
    note: "The highest-melting aliphatic nylon in commercial use, near 295 C. Shortening the diamine from six carbons to four raises the amide density and lets every amide hydrogen bond, so the crystal is unusually perfect and stiffness is retained far closer to the melting point than nylon 6,6 manages - which is why it appears in gears and engine components that run hot."
  },
  {
    name: "Nylon 6,12", aka: ["PA 612", "polyamide 6,12"],
    monomer: "hexamethylenediamine + dodecanedioic acid", cls: "Step-growth (polyamide)", cas: null,
    tags: ["engineering", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "N" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "N" }, { id: 10, el: "C" }, { id: 11, el: "O" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "C" }, { id: 19, el: "C" }, { id: 20, el: "C" }, { id: 21, el: "C" }, { id: 22, el: "C" }, { id: 23, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 10, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 1 }, { a: 16, b: 17, order: 1 }, { a: 17, b: 18, order: 1 }, { a: 18, b: 19, order: 1 }, { a: 19, b: 20, order: 1 }, { a: 20, b: 21, order: 1 }, { a: 21, b: 22, order: 1 }, { a: 22, b: 23, order: 2 }, { a: 22, b: "S1", order: 1 }],
    note: "Nylon 6,6 with a much longer diacid, which dilutes the amides along the chain. Fewer amides means less water absorbed, so it holds its dimensions and stiffness in humid service where nylon 6,6 swells and softens - the reason it is chosen for toothbrush filament, fuel lines and precision mouldings."
  },
  {
    name: "Nylon 10,10", aka: ["PA 1010", "polyamide 10,10", "castor oil nylon"],
    monomer: "1,10-diaminodecane + sebacic acid", cls: "Step-growth (polyamide)", cas: null,
    tags: ["engineering", "biobased", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "N" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "N" }, { id: 14, el: "C" }, { id: 15, el: "O" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "C" }, { id: 19, el: "C" }, { id: 20, el: "C" }, { id: 21, el: "C" }, { id: 22, el: "C" }, { id: 23, el: "C" }, { id: 24, el: "C" }, { id: 25, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 2 }, { a: 14, b: 16, order: 1 }, { a: 16, b: 17, order: 1 }, { a: 17, b: 18, order: 1 }, { a: 18, b: 19, order: 1 }, { a: 19, b: 20, order: 1 }, { a: 20, b: 21, order: 1 }, { a: 21, b: 22, order: 1 }, { a: 22, b: 23, order: 1 }, { a: 23, b: 24, order: 1 }, { a: 24, b: 25, order: 2 }, { a: 24, b: "S1", order: 1 }],
    note: "A nylon made almost entirely from castor oil, both monomers deriving from ricinoleic acid, and one of the earliest bio-based engineering plastics - produced in China at scale since the 1960s. The long aliphatic runs make it flexible and nearly indifferent to water, with a melting point around 200 C."
  },
  {
    name: "Poly(2-methylstyrene)", aka: ["P2MS", "poly(ortho-methylstyrene)"],
    monomer: "2-methylstyrene", cls: "Addition (vinyl)", cas: null,
    tags: ["styrenic", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 5, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }],
    note: "A methyl in the ortho position, right beside the backbone attachment, which hinders rotation of the ring and pushes the glass transition about 30 C above polystyrene's. Compared with the para isomer, which sits only a few degrees above polystyrene, it isolates how much of a substituent's effect comes from where it sits rather than what it is."
  },
  {
    name: "Poly(3-methylstyrene)", aka: ["P3MS", "poly(meta-methylstyrene)"],
    monomer: "3-methylstyrene", cls: "Addition (vinyl)", cas: null,
    tags: ["styrenic", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 9, b: 11, order: 2 }, { a: 5, b: 11, order: 1 }],
    note: "The third member of the methylstyrene set, and the one that changes least: a meta methyl neither crowds the backbone the way ortho does nor sits on the symmetry axis the way para does, so the glass transition barely moves from polystyrene's. Useful mainly as the control in that comparison."
  },
  {
    name: "Poly(4-methoxystyrene)", aka: ["P4MOS", "poly(para-methoxystyrene)"],
    monomer: "4-methoxystyrene", cls: "Addition (vinyl)", cas: null,
    tags: ["styrenic", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "O" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 8, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 5, b: 12, order: 1 }],
    note: "The methoxy group makes the ring strongly electron-rich, which is what matters here: the monomer polymerises readily by cationic initiation where styrene itself is sluggish, and the polymer is easily brominated or nitrated on the ring. It is also acid-cleavable to poly(4-hydroxystyrene), which is why it turns up in resist chemistry."
  },
  {
    name: "Poly(4-acetoxystyrene)", aka: ["PAcOS", "poly(4-acetoxystyrene)"],
    monomer: "4-acetoxystyrene", cls: "Addition (vinyl)", cas: null,
    tags: ["styrenic", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "O" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "O" }, { id: 13, el: "C" }, { id: 14, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 10, b: 12, order: 2 }, { a: 8, b: 13, order: 1 }, { a: 13, b: 14, order: 2 }, { a: 5, b: 14, order: 1 }],
    note: "The protected form in which poly(4-hydroxystyrene) is normally made: the free phenol interferes with radical and anionic polymerisation, so the acetate is polymerised and then hydrolysed off. It is a general lesson in the field - when a functional group fights the polymerisation, polymerise its ester and remove it afterwards."
  },
  {
    name: "Poly(4-bromostyrene)", aka: ["P4BrS", "poly(para-bromostyrene)"],
    monomer: "4-bromostyrene", cls: "Addition (vinyl)", cas: null,
    tags: ["styrenic", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "Br" }, { id: 10, el: "C" }, { id: 11, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 8, b: 9, order: 1 }, { a: 8, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 5, b: 11, order: 1 }],
    note: "Polystyrene carrying a handle. The aryl bromide is inert during polymerisation but reacts cleanly afterwards in palladium-catalysed couplings, so the polymer is a scaffold for attaching almost anything to a well-defined backbone. The heavy atom also gives strong X-ray contrast, useful for imaging domains in block copolymers."
  },
  {
    name: "Poly(4-aminostyrene)", aka: ["PAS", "poly(4-vinylaniline)"],
    monomer: "4-aminostyrene (usually via the nitro or protected monomer)", cls: "Addition (vinyl)", cas: null,
    tags: ["styrenic", "water-soluble", "polyelectrolyte", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "N" }, { id: 10, el: "C" }, { id: 11, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 8, b: 9, order: 1 }, { a: 8, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 5, b: 11, order: 1 }],
    note: "An aromatic amine on every repeat, which makes the polymer a weak polybase, a ligand for metals, and a substrate for diazotisation - the classic route to attaching dyes and biomolecules to a polystyrene support. The free amine inhibits radical polymerisation, so it is normally reached by reducing the nitro polymer."
  },
  {
    name: "Poly(4-vinylbenzyl chloride)", aka: ["PVBC", "poly(vinylbenzyl chloride)", "chloromethylated polystyrene"],
    monomer: "4-vinylbenzyl chloride", cls: "Addition (vinyl)", cas: null,
    tags: ["styrenic", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "Cl" }, { id: 11, el: "C" }, { id: 12, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 8, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 5, b: 12, order: 1 }],
    note: "The benzylic chloride is reactive enough to be displaced by almost any nucleophile at mild temperature, which makes this the standard platform for post-polymerisation modification. Quaternise it with a tertiary amine and it becomes an anion-exchange membrane; treat it with a phosphine, an azide or a thiolate and it becomes whatever else was wanted."
  },
  {
    name: "Poly(divinylbenzene)", aka: ["PDVB", "divinylbenzene resin", "DVB crosslinker"],
    monomer: "divinylbenzene", cls: "Addition (vinyl)", cas: null,
    tags: ["styrenic", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "Two vinyl groups on one ring, so it crosslinks rather than forming chains - the crosslinker in every ion-exchange resin and polymer support bead. The percentage of it in a styrene bead sets the swelling and therefore the accessibility of the interior: 1 to 2 percent gives a gel that swells and lets reagents in, 8 percent gives a rigid bead that does not. Not drawn: a network has no repeat unit."
  },
  {
    name: "Poly(vinyltoluene)", aka: ["PVT", "poly(methylstyrene) mixed isomers"],
    monomer: "vinyltoluene (mixed meta and para isomers)", cls: "Addition (vinyl)", cas: null,
    tags: ["styrenic", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The industrial material behind the methylstyrenes: commercial vinyltoluene is a mixture of the meta and para isomers because separating them is not worth the cost. The mixture is deliberately useful - the isomer distribution frustrates crystallisation and gives a slightly higher glass transition than polystyrene at a similar price. Not drawn: it is an isomer mixture, not one structure."
  },
  {
    name: "Parylene N", aka: ["poly(p-xylylene)", "parylene", "PPX"],
    monomer: "[2.2]paracyclophane (vapour-phase pyrolysis)", cls: "Addition (vinyl)", cas: null,
    tags: ["engineering", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 3, b: 8, order: 1 }, { a: 6, b: 9, order: 1 }, { a: 9, b: "S1", order: 1 }],
    note: "A coating deposited from the vapour with no solvent and no liquid stage at all: the cyclophane dimer is pyrolysed to a reactive quinodimethane that polymerises on contact with any surface in the chamber. Because it grows a molecule at a time it covers sharp edges and creeps into crevices that no liquid coating would reach, which is why it protects circuit boards and implanted electronics."
  },
  {
    name: "Parylene C", aka: ["poly(chloro-p-xylylene)", "parylene C coating"],
    monomer: "dichloro[2.2]paracyclophane", cls: "Addition (vinyl)", cas: null,
    tags: ["engineering", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "Cl" }, { id: 10, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 3, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 6, b: 10, order: 1 }, { a: 10, b: "S1", order: 1 }],
    note: "The workhorse of the parylene family. One chlorine per ring roughly halves the permeability to water vapour and gases compared with parylene N, at some cost in deposition rate, which is exactly the trade wanted for a moisture barrier over electronics. It is the grade used on implantable devices and on the boards inside things that must not corrode."
  },
  {
    name: "Poly(oxetane)", aka: ["poly(trimethylene oxide)", "POX", "poly(oxetane)"],
    monomer: "oxetane", cls: "Ring-opening", cas: null,
    tags: ["specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: "S1", order: 1 }],
    note: "The polyether one methylene longer than poly(ethylene oxide). The four-membered ring is strained enough to open cationically but far less reactive than an epoxide, so the polymerisation is controllable; the resulting chain is more hydrophobic than PEO and crystallises well. Its substituted relatives are the interesting ones, oxetane being an easy handle for building energetic and functional polyethers."
  },
  {
    name: "Poly(glycidol)", aka: ["polyglycidol", "polyglycerol", "PG"],
    monomer: "glycidol", cls: "Ring-opening", cas: null,
    tags: ["water-soluble", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 4, b: "S1", order: 1 }],
    note: "A polyether with a hydroxyl on every repeat - PEG with handles. Polymerised without protection it branches, because the pendant alcohols initiate new chains, giving the hyperbranched polyglycerol used as a PEG alternative in bioconjugation; protecting the hydroxyl first gives a strictly linear chain. It is as water-soluble and as protein-resistant as PEG, and unlike PEG can be loaded with many attachment points."
  },
  {
    name: "Poly(propylene sulfide)", aka: ["PPS (sulfide)", "poly(propylene sulphide)"],
    monomer: "propylene sulfide", cls: "Ring-opening", cas: null,
    tags: ["biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "S" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 4, b: "S1", order: 1 }],
    note: "The sulfur analogue of poly(propylene oxide), and hydrophobic where that is not. Its interest is chemical rather than mechanical: the thioether oxidises to a sulfoxide and then a sulfone, which turns the block hydrophilic, so a block copolymer containing it disassembles in the presence of reactive oxygen species. That makes it the standard oxidation-responsive block for delivery to inflamed tissue."
  },
  {
    name: "Poly(ethylene sulfide)", aka: ["poly(thiirane)", "polyethylene sulphide"],
    monomer: "ethylene sulfide (thiirane)", cls: "Ring-opening", cas: null,
    tags: ["specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "S" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: "S1", order: 1 }],
    note: "Poly(ethylene oxide) with sulfur in place of oxygen, and almost its opposite: highly crystalline, melting near 200 C, and insoluble in water despite the analogy. Sulfur's larger size and weaker hydrogen-bond acceptance change the chain's whole character, which makes the pair a clean demonstration that a backbone heteroatom is not a minor substitution."
  },
  {
    name: "Poly(vinyl stearate)", aka: ["PVS (stearate)", "poly(vinyl octadecanoate)"],
    monomer: "vinyl stearate", cls: "Addition (vinyl)", cas: null,
    tags: ["specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "C" }, { id: 19, el: "C" }, { id: 20, el: "C" }, { id: 21, el: "C" }, { id: 22, el: "C" }, { id: 23, el: "C" }, { id: 24, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 1 }, { a: 16, b: 17, order: 1 }, { a: 17, b: 18, order: 1 }, { a: 18, b: 19, order: 1 }, { a: 19, b: 20, order: 1 }, { a: 20, b: 21, order: 1 }, { a: 21, b: 22, order: 1 }, { a: 22, b: 23, order: 1 }, { a: 23, b: 24, order: 1 }],
    note: "A vinyl ester with an eighteen-carbon tail, long enough that the side chains crystallise among themselves independently of the backbone. That side-chain crystallisation gives a sharp melting transition near 45 C that has nothing to do with the main chain - the basis of comb-like phase change materials and of pour-point depressants for waxy oils."
  },
  {
    name: "Poly(vinyl pivalate)", aka: ["PVPi", "poly(vinyl trimethylacetate)"],
    monomer: "vinyl pivalate", cls: "Addition (vinyl)", cas: null,
    tags: ["specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 8, b: 10, order: 1 }, { a: 8, b: 11, order: 1 }],
    note: "The bulky tert-butyl group beside the ester makes this polymerise with unusually few head-to-head placements and very little chain transfer to polymer, so it gives the most stereoregular and least branched precursor to poly(vinyl alcohol). Hydrolysing it yields a PVA of higher crystallinity and strength than the usual acetate route can reach - which is how high-tenacity PVA fibre is made."
  },
  {
    name: "Poly(vinyl trifluoroacetate)", aka: ["PVTFA", "poly(vinyl trifluoroacetate)"],
    monomer: "vinyl trifluoroacetate", cls: "Addition (vinyl)", cas: null,
    tags: ["fluoropolymer", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "F" }, { id: 10, el: "F" }, { id: 11, el: "F" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 8, b: 10, order: 1 }, { a: 8, b: 11, order: 1 }],
    note: "A vinyl ester whose acyl group is electron-poor enough that the ester hydrolyses under far milder conditions than acetate - mild enough to convert to poly(vinyl alcohol) without the alkaline treatment that degrades sensitive block copolymers. It is used chiefly as that protecting group rather than for its own properties."
  },
  {
    name: "Poly(vinylene carbonate)", aka: ["PVC (carbonate)", "poly(1,3-dioxol-2-one)"],
    monomer: "vinylene carbonate", cls: "Addition (vinyl)", cas: null,
    tags: ["specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "O" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 2, b: 7, order: 1 }, { a: 7, b: "S1", order: 1 }],
    note: "Better known as the additive than the polymer: vinylene carbonate is added at a percent or two to lithium-ion electrolytes, where it reduces on the anode before the solvent does and polymerises into exactly this film. That film is the solid-electrolyte interphase - it passivates the graphite, stops further solvent decomposition, and is most of the reason a cell survives hundreds of cycles."
  }
,
  {
    name: "Poly(isobutyl methacrylate)", aka: ["PiBMA", "poly(isobutyl methacrylate)"],
    monomer: "isobutyl methacrylate", cls: "Addition (methacrylate)", cas: null,
    tags: ["methacrylate", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: "S1", el: "*" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "O" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 10, b: 12, order: 1 }],
    note: "The branched isomer of poly(butyl methacrylate), and about 30 C higher in glass transition because the branch resists the rotation that a straight butyl chain allows freely. The two are a clean demonstration that side-chain shape, not just length, sets where a polymer softens."
  },
  {
    name: "Poly(hexyl methacrylate)", aka: ["PHMA", "poly(n-hexyl methacrylate)"],
    monomer: "hexyl methacrylate", cls: "Addition (methacrylate)", cas: null,
    tags: ["methacrylate", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: "S1", el: "*" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "O" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }],
    note: "A middle term in the n-alkyl methacrylate series, where the glass transition falls steadily from PMMA's 105 C as the ester lengthens - internal plasticisation, the side chain diluting the backbone's own interactions. The trend reverses past about twelve carbons once the side chains begin to crystallise among themselves."
  },
  {
    name: "Poly(stearyl methacrylate)", aka: ["PSMA", "poly(octadecyl methacrylate)"],
    monomer: "stearyl methacrylate", cls: "Addition (methacrylate)", cas: null,
    tags: ["methacrylate", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: "S1", el: "*" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "O" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "C" }, { id: 19, el: "C" }, { id: 20, el: "C" }, { id: 21, el: "C" }, { id: 22, el: "C" }, { id: 23, el: "C" }, { id: 24, el: "C" }, { id: 25, el: "C" }, { id: 26, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 1 }, { a: 16, b: 17, order: 1 }, { a: 17, b: 18, order: 1 }, { a: 18, b: 19, order: 1 }, { a: 19, b: 20, order: 1 }, { a: 20, b: 21, order: 1 }, { a: 21, b: 22, order: 1 }, { a: 22, b: 23, order: 1 }, { a: 23, b: 24, order: 1 }, { a: 24, b: 25, order: 1 }, { a: 25, b: 26, order: 1 }],
    note: "The far end of the n-alkyl methacrylate series, where the eighteen-carbon side chains pack into their own crystalline domains and melt near 35 C independently of the backbone. Comb polymers like this are the active ingredient in pour-point depressants: the side chains co-crystallise with the wax in a fuel and stop it forming a continuous network."
  },
  {
    name: "Poly(phenyl methacrylate)", aka: ["PPhMA", "poly(phenyl methacrylate)"],
    monomer: "phenyl methacrylate", cls: "Addition (methacrylate)", cas: null,
    tags: ["methacrylate", "optical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: "S1", el: "*" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "O" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 2 }, { a: 9, b: 14, order: 1 }],
    note: "An aryl ester rather than an alkyl one, which stiffens the side chain and lifts the glass transition to about 110 C while raising the refractive index well above PMMA's. Aromatic methacrylates are how an acrylic is given the index needed for optical adhesives and high-index lenses without leaving the family."
  },
  {
    name: "Poly(hydroxypropyl methacrylate)", aka: ["PHPMA", "poly(2-hydroxypropyl methacrylate)"],
    monomer: "2-hydroxypropyl methacrylate", cls: "Addition (methacrylate)", cas: null,
    tags: ["methacrylate", "water-soluble", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: "S1", el: "*" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "O" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "O" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 10, b: 12, order: 1 }],
    note: "The hydroxyethyl hydrogel monomer with one more carbon, which is enough to change its behaviour: the extra methyl makes the polymer hydrophobic enough to be water-insoluble while still swelling, and it shows a lower critical solution temperature the hydroxyethyl version does not. Widely used as the drug-carrying block of HPMA copolymer conjugates."
  },
  {
    name: "Poly(isopropyl acrylate)", aka: ["PiPA", "poly(isopropyl acrylate)"],
    monomer: "isopropyl acrylate", cls: "Addition (acrylate)", cas: null,
    tags: ["acrylate", "thermoresponsive", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 5, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 8, b: 10, order: 1 }],
    note: "The ester isomer of poly(N-isopropylacrylamide), with oxygen where the amide nitrogen sits. It is thermoresponsive too, but the loss of the amide's hydrogen bonding drops the transition and makes it far less sharp - a direct measure of how much of PNIPAM's behaviour comes from the amide rather than the isopropyl group."
  },
  {
    name: "Poly(octadecyl acrylate)", aka: ["PODA", "poly(stearyl acrylate)"],
    monomer: "octadecyl acrylate", cls: "Addition (acrylate)", cas: null,
    tags: ["acrylate", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "C" }, { id: 19, el: "C" }, { id: 20, el: "C" }, { id: 21, el: "C" }, { id: 22, el: "C" }, { id: 23, el: "C" }, { id: 24, el: "C" }, { id: 25, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 5, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 1 }, { a: 16, b: 17, order: 1 }, { a: 17, b: 18, order: 1 }, { a: 18, b: 19, order: 1 }, { a: 19, b: 20, order: 1 }, { a: 20, b: 21, order: 1 }, { a: 21, b: 22, order: 1 }, { a: 22, b: 23, order: 1 }, { a: 23, b: 24, order: 1 }, { a: 24, b: 25, order: 1 }],
    note: "The acrylate counterpart to stearyl methacrylate, and softer for the usual reason - no alpha-methyl on the backbone. The side chains still crystallise and melt near 50 C, so the material is a shape-memory polymer in its own right: deform it warm, cool to set the side-chain crystals, and it holds the shape until reheated."
  },
  {
    name: "Poly(cyclohexyl acrylate)", aka: ["PCHA", "poly(cyclohexyl acrylate)"],
    monomer: "cyclohexyl acrylate", cls: "Addition (acrylate)", cas: null,
    tags: ["acrylate", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 5, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 8, b: 13, order: 1 }],
    note: "A saturated ring on the ester, which raises the glass transition well above the linear acrylates without the aromaticity that would raise the refractive index. That combination - stiff but optically ordinary and UV-transparent - is what makes cycloaliphatic esters useful in coatings meant to stay clear outdoors."
  },
  {
    name: "Poly(2-(dimethylamino)ethyl acrylate)", aka: ["PDMAEA", "poly(dimethylaminoethyl acrylate)"],
    monomer: "2-(dimethylamino)ethyl acrylate", cls: "Addition (acrylate)", cas: null,
    tags: ["acrylate", "water-soluble", "polyelectrolyte", "drug delivery", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "N" }, { id: 11, el: "C" }, { id: 12, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 5, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 10, b: 12, order: 1 }],
    note: "The acrylate version of the standard cationic methacrylate, and it does something the methacrylate does not: the ester hydrolyses steadily in water, shedding the amine and turning the polycation into poly(acrylic acid). A gene delivery vehicle that self-destructs on a timer, releasing its cargo without needing any trigger."
  },
  {
    name: "Poly(N-acryloylmorpholine)", aka: ["PNAM", "poly(4-acryloylmorpholine)", "PAcM"],
    monomer: "4-acryloylmorpholine", cls: "Addition (acrylate)", cas: null,
    tags: ["acrylate", "water-soluble", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: 7, el: "N" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "O" }, { id: 11, el: "C" }, { id: 12, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 5, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 7, b: 12, order: 1 }],
    note: "A tertiary acrylamide with an ether in the ring, giving a polymer that is water-soluble at every temperature - no cloud point, unlike most of the acrylamide family - and unusually resistant to hydrolysis. That reliability makes it a PEG alternative for bioconjugation and the polar anchoring block in the bottlebrush friction modifiers."
  },
  {
    name: "Poly(lauryl acrylate)", aka: ["PLA (acrylate)", "poly(dodecyl acrylate)"],
    monomer: "lauryl acrylate", cls: "Addition (acrylate)", cas: null,
    tags: ["acrylate", "elastomer", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "C" }, { id: 19, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 5, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 1 }, { a: 16, b: 17, order: 1 }, { a: 17, b: 18, order: 1 }, { a: 18, b: 19, order: 1 }],
    note: "An acrylate soluble in hydrocarbons rather than water, with a glass transition far below room temperature. It is the oil-soluble grafted segment of bottlebrush friction modifiers and the stabilising block for polymerisations run in alkanes, where a PEG-like block would simply precipitate."
  },
  {
    name: "Poly(2-acrylamido-2-methylpropane sulfonic acid)", aka: ["PAMPS", "poly(AMPS)", "polyAMPS"],
    monomer: "2-acrylamido-2-methylpropane sulfonic acid", cls: "Addition (acrylate)", cas: null,
    tags: ["acrylate", "water-soluble", "polyelectrolyte", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: 7, el: "N" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "S" }, { id: 13, el: "O" }, { id: 14, el: "O" }, { id: 15, el: "O" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 5, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 8, b: 10, order: 1 }, { a: 8, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 2 }, { a: 12, b: 14, order: 2 }, { a: 12, b: 15, order: 1 }],
    note: "A strong polyacid whose sulfonate stays ionised at any pH and, crucially, tolerates hard brine - the calcium that precipitates poly(acrylic acid) leaves it alone. That is why it is the polyelectrolyte used in oilfield fluids, and the quaternary carbon beside the amide protects the linkage from the hydrolysis that degrades polyacrylamide."
  },
  {
    name: "Poly(phenylene ethynylene)", aka: ["PPE", "poly(p-phenylene ethynylene)"],
    monomer: "diethynylbenzene + diiodobenzene (Sonogashira)", cls: "Addition (vinyl)", cas: null,
    tags: ["conductive", "optical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 3 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 4, b: 9, order: 1 }, { a: 7, b: "S1", order: 1 }],
    note: "Rings joined by triple bonds, which cannot twist the way a single bond can, so the backbone is rigid and the conjugation is uninterrupted along its length. That rigidity makes the fluorescence exceptionally bright and, more usefully, exceptionally quenchable: one bound analyte molecule can quench an entire chain, giving the amplified response behind trace-vapour sensors."
  },
  {
    name: "Poly(3-octylthiophene)", aka: ["P3OT", "poly(3-octylthiophene-2,5-diyl)"],
    monomer: "3-octylthiophene", cls: "Addition (vinyl)", cas: null,
    tags: ["conductive", "optical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "S" }, { id: "S1", el: "*" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 2, b: 6, order: 1 }, { a: 5, b: "S1", order: 1 }, { a: 4, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }],
    note: "P3HT with two more carbons on the side chain, which is enough to change the solid state: longer chains push the polymer backbones further apart, lowering the interchain charge transport that P3HT depends on. The alkyl length is a design variable trading solubility against mobility, and hexyl is where the field settled."
  },
  {
    name: "Poly(2-methoxy-5-(2-ethylhexyloxy)-p-phenylene vinylene)", aka: ["MEH-PPV", "MEH PPV"],
    monomer: "substituted p-xylylene precursor", cls: "Addition (vinyl)", cas: null,
    tags: ["conductive", "optical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "O" }, { id: 11, el: "C" }, { id: "S1", el: "*" }, { id: 13, el: "O" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "C" }, { id: 19, el: "C" }, { id: 20, el: "C" }, { id: 21, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 4, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 7, b: "S1", order: 1 }, { a: 6, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 1 }, { a: 16, b: 17, order: 1 }, { a: 15, b: 18, order: 1 }, { a: 18, b: 19, order: 1 }, { a: 19, b: 20, order: 1 }, { a: 20, b: 21, order: 1 }],
    note: "The soluble PPV that made polymer LEDs practical to fabricate. Two alkoxy substituents - one small, one branched - keep the conjugated backbone in solution so a device layer can be spin-coated instead of grown from an insoluble precursor. The alkoxy groups also push the emission to orange-red, which is where this polymer is used."
  },
  {
    name: "Poly(triarylamine)", aka: ["PTAA", "polytriarylamine", "poly(triaryl amine)"],
    monomer: "substituted triarylamine", cls: "Addition (vinyl)", cas: null,
    tags: ["conductive", "optical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "N" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "C" }, { id: 19, el: "C" }, { id: 20, el: "C" }, { id: 21, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 2, b: 7, order: 1 }, { a: 5, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 12, b: 13, order: 1 }, { a: 12, b: 14, order: 1 }, { a: 14, b: 15, order: 2 }, { a: 9, b: 15, order: 1 }, { a: 8, b: 16, order: 1 }, { a: 16, b: 17, order: 2 }, { a: 17, b: 18, order: 1 }, { a: 18, b: 19, order: 2 }, { a: 19, b: 20, order: 1 }, { a: 20, b: 21, order: 2 }, { a: 16, b: 21, order: 1 }, { a: 19, b: "S1", order: 1 }],
    note: "The standard hole-transport polymer, amorphous by design. The nitrogen's lone pair makes each unit easy to oxidise, so positive charge hops readily between them, while the propeller-shaped triarylamine refuses to crystallise - which matters because grain boundaries in a crystalline transport layer trap charge. It is the hole layer in most perovskite solar cells."
  },
  {
    name: "Poly(2,7-carbazole)", aka: ["polycarbazole", "poly(N-alkyl-2,7-carbazole)", "PCz"],
    monomer: "N-alkyl-2,7-dibromocarbazole", cls: "Addition (vinyl)", cas: null,
    tags: ["conductive", "optical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "N" }, { id: 15, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 2, b: 7, order: 1 }, { a: 5, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 2 }, { a: 8, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 4, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 10, b: "S1", order: 1 }],
    note: "Fluorene's nitrogen analogue, and the substitution that fixes fluorene's known defect. Where polyfluorene's bridging carbon oxidises to a fluorenone and turns the blue emission green over time, carbazole's bridging nitrogen simply carries the solubilising alkyl chain and cannot oxidise the same way, so the emission colour is stable."
  },
  {
    name: "Polyfuran", aka: ["PFu", "poly(furan)"],
    monomer: "furan", cls: "Addition (vinyl)", cas: null,
    tags: ["conductive", "biobased", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 2, b: 6, order: 1 }, { a: 5, b: "S1", order: 1 }],
    note: "The oxygen member of the five-membered heterocycle set that includes polythiophene and polypyrrole, and the least useful of the three: oxygen is small and electronegative enough that the ring is easily over-oxidised during polymerisation, so the chains end up short and defective. Its interest is that furan comes from sugars rather than oil."
  },
  {
    name: "Polyetherimide", aka: ["PEI (Ultem)", "Ultem", "poly(ether imide)"],
    monomer: "bisphenol A dianhydride + m-phenylenediamine", cls: "Step-growth (polyamide)", cas: null,
    tags: ["engineering", "high-temperature", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The polyimide that melts. Ether links and a bisphenol A unit between the imide rings give enough chain flexibility to injection-mould and extrude, which a fully aromatic polyimide cannot do, while keeping a glass transition near 217 C and inherent flame resistance. It is amber, transparent, and the usual choice for sterilisable medical parts and aircraft interiors. Not drawn: the repeat is large and reported with several diamine isomers."
  },
  {
    name: "Polyphenylsulfone", aka: ["PPSU", "Radel", "poly(phenyl sulfone)"],
    monomer: "4,4'-biphenol + 4,4'-dichlorodiphenyl sulfone", cls: "Step-growth (polyester)", cas: null,
    tags: ["engineering", "high-temperature", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "O" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "C" }, { id: 19, el: "C" }, { id: 20, el: "C" }, { id: 21, el: "S" }, { id: 22, el: "O" }, { id: 23, el: "O" }, { id: 24, el: "C" }, { id: 25, el: "C" }, { id: 26, el: "C" }, { id: 27, el: "C" }, { id: 28, el: "C" }, { id: 29, el: "C" }, { id: 30, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 2, b: 7, order: 1 }, { a: 5, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 2 }, { a: 8, b: 13, order: 1 }, { a: 11, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 2 }, { a: 16, b: 17, order: 1 }, { a: 17, b: 18, order: 2 }, { a: 18, b: 19, order: 1 }, { a: 19, b: 20, order: 2 }, { a: 15, b: 20, order: 1 }, { a: 18, b: 21, order: 1 }, { a: 21, b: 22, order: 2 }, { a: 21, b: 23, order: 2 }, { a: 21, b: 24, order: 1 }, { a: 24, b: 25, order: 2 }, { a: 25, b: 26, order: 1 }, { a: 26, b: 27, order: 2 }, { a: 27, b: 28, order: 1 }, { a: 28, b: 29, order: 2 }, { a: 24, b: 29, order: 1 }, { a: 27, b: 30, order: 1 }, { a: 30, b: "S1", order: 1 }],
    note: "Polysulfone with a rigid biphenyl in place of the bisphenol A unit, which removes the isopropylidene bridge that limits the parent's toughness and chemical resistance. The result survives repeated steam autoclaving and aggressive disinfectants without crazing, which is why surgical instrument trays and aircraft interior panels are made from it."
  },
  {
    name: "Poly(aryl ether nitrile)", aka: ["PEN (nitrile)", "poly(phthalazinone ether nitrile)", "PAEN"],
    monomer: "bisphenol + 2,6-dichlorobenzonitrile", cls: "Step-growth (polyester)", cas: null,
    tags: ["engineering", "high-temperature", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "O" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: 18, el: "C" }, { id: 19, el: "C" }, { id: 20, el: "C" }, { id: 21, el: "C" }, { id: 22, el: "C" }, { id: 23, el: "N" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 3, b: 8, order: 1 }, { a: 6, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 2 }, { a: 9, b: 14, order: 1 }, { a: 12, b: 15, order: 1 }, { a: 15, b: 16, order: 1 }, { a: 16, b: 17, order: 2 }, { a: 17, b: 18, order: 1 }, { a: 18, b: 19, order: 2 }, { a: 19, b: 20, order: 1 }, { a: 20, b: 21, order: 2 }, { a: 16, b: 21, order: 1 }, { a: 21, b: 22, order: 1 }, { a: 22, b: 23, order: 3 }, { a: 20, b: "S1", order: 1 }],
    note: "An aromatic polyether whose distinguishing group is the nitrile, which is strongly polar and can crosslink on heating. The polarity raises the dielectric constant enough to matter for film capacitors, and the same nitriles can be cured into a network for a thermoset that starts as a processable thermoplastic."
  },
  {
    name: "Poly(1,3,4-oxadiazole)", aka: ["POD", "polyoxadiazole", "poly(aryl oxadiazole)"],
    monomer: "terephthalic acid + hydrazine sulfate", cls: "Step-growth (polyamide)", cas: null,
    tags: ["engineering", "high-temperature", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "N" }, { id: 10, el: "N" }, { id: 11, el: "C" }, { id: 12, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 2, b: 7, order: 1 }, { a: 5, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 11, b: 12, order: 1 }, { a: 8, b: 12, order: 1 }, { a: 11, b: "S1", order: 1 }],
    note: "A rigid heterocycle in place of the amide of an aramid, giving a fibre of comparable strength that is markedly more resistant to hydrolysis - the aramids' weakness. Spun from polyphosphoric acid and used where a high-temperature filter has to survive acid flue gas, though it never displaced the aramids commercially."
  },
  {
    name: "Poly(phenylene sulfide sulfone)", aka: ["PPSS", "poly(phenylene sulfide sulfone)"],
    monomer: "4,4'-dichlorodiphenyl sulfone + sodium sulfide", cls: "Step-growth (polyester)", cas: null,
    tags: ["engineering", "high-temperature", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "S" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "S" }, { id: 10, el: "O" }, { id: 11, el: "O" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 3, b: 8, order: 1 }, { a: 6, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 9, b: 11, order: 2 }, { a: 9, b: 12, order: 1 }, { a: 12, b: 13, order: 2 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 2 }, { a: 15, b: 16, order: 1 }, { a: 16, b: 17, order: 2 }, { a: 12, b: 17, order: 1 }, { a: 15, b: "S1", order: 1 }],
    note: "Poly(phenylene sulfide) with sulfone groups worked into the backbone, which raises the glass transition by over a hundred degrees and turns a semicrystalline polymer into an amorphous one. The trade is deliberate: PPS's crystallinity gives chemical resistance but limits its use temperature to its glass transition, and this recovers the temperature at the cost of the solvent resistance."
  },
  {
    name: "Poly(ethylene oxalate)", aka: ["PEOx (oxalate)", "poly(ethylene oxalate)"],
    monomer: "ethylene glycol + oxalic acid", cls: "Step-growth (polyester)", cas: null,
    tags: ["biodegradable", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 8, b: "S1", order: 1 }],
    note: "The shortest possible aliphatic polyester diacid, two carbonyls bonded directly to each other. That adjacency makes the ester unusually electrophilic and the polymer hydrolyses far faster than any other polyester of its kind - fast enough to be a nuisance rather than a feature, which is why it appears mainly as a sacrificial or rapidly resorbing component."
  },
  {
    name: "Poly(hexamethylene adipate)", aka: ["PHA (adipate)", "poly(hexamethylene adipate)"],
    monomer: "1,6-hexanediol + adipic acid", cls: "Step-growth (polyester)", cas: null,
    tags: ["biodegradable", "elastomer", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "O" }, { id: 10, el: "C" }, { id: 11, el: "O" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "C" }, { id: 17, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 10, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 1 }, { a: 16, b: 17, order: 2 }, { a: 16, b: "S1", order: 1 }],
    note: "One of the standard polyester polyols used as the soft block of polyurethane. Polyester soft blocks give better oil resistance and higher strength than polyether ones, and worse hydrolytic stability - the ester bonds that make them tough are the ones that fail in warm damp service, which is the choice every polyurethane formulator makes."
  },
  {
    name: "Poly(propylene fumarate)", aka: ["PPF", "poly(propylene fumarate)"],
    monomer: "propylene glycol + fumaric acid", cls: "Step-growth (polyester)", cas: null,
    tags: ["biodegradable", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: 8, el: "O" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 7, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 11, b: "S1", order: 1 }],
    note: "A degradable polyester with a carbon-carbon double bond in the backbone, which is the whole design: the polymer is injected as a viscous liquid and then crosslinked through those alkenes in place, so it sets inside a bone defect and takes its shape. Degradation gives fumaric acid, a normal metabolite."
  },
  {
    name: "Poly(cyclohexylenedimethylene terephthalate)", aka: ["PCT", "poly(1,4-cyclohexylenedimethylene terephthalate)"],
    monomer: "1,4-cyclohexanedimethanol + terephthalic acid", cls: "Step-growth (polyester)", cas: null,
    tags: ["engineering", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "O" }, { id: "S1", el: "*" }, { id: 11, el: "C" }, { id: 12, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: "S1", order: 1 }, { a: 7, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 4, b: 12, order: 1 }],
    note: "PET with a cycloaliphatic diol instead of ethylene glycol, which pushes the melting point to about 290 C - high enough for a polyester to survive lead-free solder reflow, which PET and PBT do not. The drawn unit is the diol segment; the full repeat also contains the terephthalate shown under PET."
  },
  {
    name: "Poly(ethylene terephthalate-co-cyclohexylenedimethylene terephthalate)", aka: ["PETG", "glycol-modified PET", "PET-G"],
    monomer: "ethylene glycol + cyclohexanedimethanol + terephthalic acid", cls: "Step-growth (polyester)", cas: null,
    tags: ["copolymer", "packaging", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "PET made deliberately unable to crystallise. Around a third of the ethylene glycol is replaced with the bulkier cyclohexanedimethanol, which disrupts the chain regularity enough that the polymer stays amorphous and clear however slowly it is cooled - so it thermoforms into thick transparent sections and prints well, where PET would go hazy. Not drawn: the diol ratio is the specification."
  },
  {
    name: "Poly(lactide-co-caprolactone)", aka: ["PLCL", "poly(L-lactide-co-caprolactone)"],
    monomer: "lactide + caprolactone", cls: "Step-growth (polyester)", cas: null,
    tags: ["copolymer", "biodegradable", "biomedical", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The copolymer that turns two brittle-or-slow homopolymers into an elastomer. Polylactide is stiff and degrades in months, polycaprolactone soft and degrades over years; mixing the units disrupts both crystal lattices, giving a rubbery material that recovers from large strains and resorbs on a tunable schedule - which is what a vascular or nerve scaffold needs. Not drawn: the ratio is the design."
  },
  {
    name: "Poly(styrene-alt-maleic anhydride)", aka: ["SMA", "poly(styrene-maleic anhydride)", "SMA copolymer"],
    monomer: "styrene + maleic anhydride", cls: "Addition (vinyl)", cas: null,
    tags: ["copolymer", "styrenic", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "O" }, { id: 13, el: "O" }, { id: 14, el: "C" }, { id: 15, el: "O" }, { id: 16, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 3, b: 8, order: 1 }, { a: 2, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 2 }, { a: 11, b: 13, order: 1 }, { a: 13, b: 14, order: 1 }, { a: 14, b: 15, order: 2 }, { a: 14, b: 16, order: 1 }, { a: 10, b: 16, order: 1 }, { a: 16, b: "S1", order: 1 }],
    note: "Maleic anhydride will not homopolymerise but alternates almost perfectly with styrene, so the composition is fixed by the chemistry rather than by the feed. The anhydride opens with amines or alcohols to give acids and half-esters, which is how the polymer becomes a dispersant, and hydrolysed SMA is the reagent that extracts membrane proteins into native nanodiscs without detergent."
  },
  {
    name: "Poly(maleic anhydride-alt-1-octadecene)", aka: ["PMAO", "poly(maleic anhydride-alt-octadecene)"],
    monomer: "maleic anhydride + 1-octadecene", cls: "Addition (vinyl)", cas: null,
    tags: ["copolymer", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The same alternating trick as SMA but with a long alkene, giving a comb whose teeth are hydrophobic and whose backbone is reactive anhydride. It is the standard reagent for making inorganic nanocrystals water-dispersible: the alkyl chains interdigitate with the ligands already on the particle and the opened anhydrides face outward as carboxylates. Not drawn: the alkene is supplied as a chain-length distribution."
  },
  {
    name: "Poly(vinylphosphonic acid)", aka: ["PVPA", "poly(vinyl phosphonic acid)"],
    monomer: "vinylphosphonic acid", cls: "Addition (vinyl)", cas: null,
    tags: ["water-soluble", "polyelectrolyte", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "P" }, { id: 6, el: "O" }, { id: 7, el: "O" }, { id: 8, el: "O" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 5, b: 7, order: 1 }, { a: 5, b: 8, order: 1 }],
    note: "A polyacid with two ionisable protons per repeat and two well-separated pKa values, so its charge climbs in two steps rather than one. Phosphonates also bind calcium and metal oxide surfaces far more strongly than carboxylates, which is why the polymer is used as a scale inhibitor, a bone-targeting group and an adhesion promoter on metal."
  },
  {
    name: "Poly(vinylbenzyl trimethylammonium chloride)", aka: ["PVBTMAC", "poly(vinylbenzyltrimethylammonium chloride)", "quaternised PVBC"],
    monomer: "vinylbenzyl chloride, quaternised with trimethylamine", cls: "Addition (vinyl)", cas: null,
    tags: ["styrenic", "water-soluble", "polyelectrolyte", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "N", charge: 1 }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 10, b: 12, order: 1 }, { a: 10, b: 13, order: 1 }, { a: 8, b: 14, order: 1 }, { a: 14, b: 15, order: 2 }, { a: 5, b: 15, order: 1 }],
    note: "The anion-exchange counterpart to poly(styrene sulfonate), made by quaternising poly(vinylbenzyl chloride). Permanently charged whatever the pH, which is what an anion-exchange membrane needs - though the benzylic quaternary ammonium is its own weakness, degrading by Hofmann elimination in the hot alkali of a fuel cell. Drawn as the cation; the chloride is not shown."
  },
  {
    name: "Poly(butadiene) (1,2-vinyl)", aka: ["1,2-polybutadiene", "vinyl polybutadiene", "syndiotactic 1,2-PBd"],
    monomer: "1,3-butadiene (1,2-addition)", cls: "Addition (diene)", cas: null,
    tags: ["elastomer", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "C" }, { id: 6, el: "C" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }],
    note: "Butadiene polymerised through only one of its double bonds, leaving the other hanging as a pendant vinyl instead of sitting in the backbone. That changes the polymer completely: where 1,4-polybutadiene is a rubber with a glass transition near -100 C, this is a crystallisable plastic, and the pendant vinyls are convenient handles for grafting and crosslinking."
  },
  {
    name: "Polyisoprene (trans-1,4)", aka: ["gutta-percha", "balata", "trans-polyisoprene"],
    monomer: "isoprene (trans-1,4 addition)", cls: "Addition (diene)", cas: null,
    tags: ["biopolymer", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "Natural rubber's geometric isomer, and nothing like it. The trans double bond lets the chains pack into a crystal, so gutta-percha is a hard, non-elastic solid at room temperature where cis-polyisoprene is a rubber - the same atoms, the same connectivity, one double bond facing the other way. It was the insulation on the first transatlantic cables and is still used to fill root canals. Not drawn: the difference from natural rubber is purely geometric, so a flat structure would show them as identical."
  },
  {
    name: "Poly(ethylene-co-vinyl alcohol)", aka: ["EVOH", "ethylene vinyl alcohol copolymer"],
    monomer: "ethylene + vinyl acetate, then hydrolysis", cls: "Addition (vinyl)", cas: null,
    tags: ["copolymer", "packaging", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The oxygen barrier layer inside almost every long-life food package. Poly(vinyl alcohol) has a superb barrier but dissolves in water; adding ethylene units makes it insoluble and processable while keeping most of the barrier, so the ethylene fraction is a direct trade of barrier against moisture tolerance. It is always buried between polyolefin layers, because humidity destroys its performance. Not drawn: the ratio is the specification."
  },
  {
    name: "Ethylene-methacrylic acid ionomer", aka: ["Surlyn", "ionomer", "ethylene-methacrylic acid copolymer"],
    monomer: "ethylene + methacrylic acid, partly neutralised", cls: "Addition (vinyl)", cas: null,
    tags: ["copolymer", "packaging", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "A polyethylene with a few percent of acid groups, partly neutralised with sodium or zinc. The metal carboxylates cluster into ionic aggregates that act as reversible crosslinks - they stiffen the solid and give it extraordinary cut resistance and elastic recovery, then come apart in the melt so it still processes as a thermoplastic. It is the cover of a golf ball and the seal layer of a food package. Not drawn: acid content and degree of neutralisation are the specification."
  }
,
  {
    name: "Pullulan", aka: ["pullulan", "alpha-1,4/1,6-glucan"],
    monomer: "maltotriose (alpha-1,4 and alpha-1,6 linked)", cls: "Step-growth (polyester)", cas: null,
    tags: ["biopolymer", "biobased", "water-soluble", "packaging", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "A fungal glucan whose linkages alternate in a fixed pattern - two alpha-1,4 bonds then one alpha-1,6, repeating - which is unusual for a polysaccharide and is why it behaves as it does. The regular kink stops it crystallising, so films cast from it are transparent, oxygen-impermeable and dissolve instantly in the mouth: breath strips and capsule shells. Not drawn: the repeat is a trisaccharide with two linkage types, and drawing it flat would lose the alternation that matters."
  },
  {
    name: "Curdlan", aka: ["curdlan", "beta-1,3-glucan"],
    monomer: "D-glucose (beta-1,3 linked)", cls: "Step-growth (polyester)", cas: null,
    tags: ["biopolymer", "biobased", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "O" }, { id: 9, el: "O" }, { id: 10, el: "C" }, { id: "S1", el: "*" }, { id: 12, el: "C" }, { id: 13, el: "O" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 6, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: "S1", order: 1 }, { a: 10, b: 12, order: 1 }, { a: 3, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }],
    note: "A bacterial glucan linked beta-1,3 instead of beta-1,4, which coils it into a triple helix rather than laying it flat. Heating a suspension gives two different gels depending on temperature - a reversible one below 60 C, an irreversible one above it - so the same material sets soft or firm according to how it was cooked. The drawn ring is the glucose unit; the 1,3 linkage geometry is not captured by a flat structure."
  },
  {
    name: "Xanthan gum", aka: ["xanthan", "E415"],
    monomer: "glucose backbone with mannose/glucuronic acid trisaccharide side chains", cls: "Step-growth (polyester)", cas: null,
    tags: ["biopolymer", "biobased", "water-soluble", "polyelectrolyte", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "A cellulose backbone wearing a charged trisaccharide on every second glucose - a natural bottlebrush, and the reason it thickens so strongly. The side chains fold back against the backbone into a rigid helix, giving solutions that are enormously viscous at rest and thin dramatically under shear, then recover instantly. That is what makes salad dressing pourable and drilling mud able to carry rock cuttings. Not drawn: the repeat is a pentasaccharide with variable acetylation and pyruvylation."
  },
  {
    name: "Pectin", aka: ["pectin", "polygalacturonic acid", "E440"],
    monomer: "D-galacturonic acid, partly methyl-esterified", cls: "Step-growth (polyester)", cas: null,
    tags: ["biopolymer", "biobased", "water-soluble", "polyelectrolyte", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "O" }, { id: 10, el: "C" }, { id: "S1", el: "*" }, { id: 12, el: "C" }, { id: 13, el: "O" }, { id: 14, el: "C" }, { id: 15, el: "O" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 5, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 4, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: "S1", order: 1 }, { a: 10, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 12, b: 14, order: 1 }, { a: 3, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }],
    note: "The polymer that sets jam, and one that gels by two entirely different mechanisms depending on how much of its acid is esterified. Above about half esterified it needs acid and sugar to gel, by hydrogen bonding and hydrophobic contact; below that it gels with calcium in the egg-box way alginate does. Degree of esterification is therefore the specification, not a detail. Drawn as the fully methylated unit."
  },
  {
    name: "Agarose", aka: ["agarose", "agar (gelling fraction)"],
    monomer: "agarobiose (galactose + 3,6-anhydrogalactose)", cls: "Step-growth (polyester)", cas: null,
    tags: ["biopolymer", "biobased", "water-soluble", "biomedical", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The gel every molecular biology lab runs DNA through. Its disaccharide repeat contains a bridged anhydro sugar that forces a helical twist, and on cooling the helices bundle into fibres that trap water into a gel with pores of a controllable few hundred nanometres - which is exactly the size range that sieves DNA by length. It melts near 85 C and sets near 35 C, a hysteresis wide enough to pour a gel that then stays solid. Not drawn: the repeat is a bridged bicyclic disaccharide whose geometry is the point."
  },
  {
    name: "Carrageenan", aka: ["carrageenan", "kappa-carrageenan", "E407"],
    monomer: "sulfated galactose disaccharide", cls: "Step-growth (polyester)", cas: null,
    tags: ["biopolymer", "biobased", "water-soluble", "polyelectrolyte", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "Agarose's sulfated cousin from red seaweed, and sold in three forms distinguished only by how many sulfates sit on the disaccharide. One sulfate gives a firm brittle gel that needs potassium, two give a soft elastic one that needs calcium, three prevent gelation entirely and give a thickener - a clean illustration of charge density controlling assembly. It is what suspends the cocoa in chocolate milk. Not drawn: the sulfation pattern is what distinguishes the types."
  },
  {
    name: "Guar gum", aka: ["guar", "guaran", "E412"],
    monomer: "mannose backbone with galactose side groups", cls: "Step-growth (polyester)", cas: null,
    tags: ["biopolymer", "biobased", "water-soluble", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "A mannan backbone with a galactose on roughly every second unit, which is precisely what keeps it soluble - the bare mannan would hydrogen-bond to itself and precipitate. It hydrates in cold water to give very high viscosity at low concentration, and its hydroxyls crosslink with borate into the reversible gels used to carry proppant in hydraulic fracturing. Not drawn: the galactose substitution is statistical, not periodic."
  },
  {
    name: "Inulin", aka: ["inulin", "chicory fibre", "fructan"],
    monomer: "D-fructose (beta-2,1 linked) with a terminal glucose", cls: "Step-growth (polyester)", cas: null,
    tags: ["biopolymer", "biobased", "water-soluble", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "A fructose polymer rather than a glucose one, which is why it passes through the small intestine undigested - humans have no enzyme for the beta-2,1 linkage - and is fermented in the colon instead. That makes it the archetypal prebiotic dietary fibre and a fat replacer, since concentrated dispersions form a creamy particulate gel. Not drawn: chains are short and end in a glucose, so there is no clean repeating unit."
  },
  {
    name: "Heparin", aka: ["heparin", "unfractionated heparin", "heparin sodium"],
    monomer: "sulfated glucosamine + uronic acid disaccharide", cls: "Step-growth (polyester)", cas: null,
    tags: ["biopolymer", "water-soluble", "polyelectrolyte", "biomedical", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The most negatively charged biological molecule known, up to three sulfates per disaccharide, and the anticoagulant given by the million of doses. Its action is not general charge but a specific pentasaccharide sequence that binds antithrombin and changes its shape; only about a third of the chains in a preparation carry it. Not drawn: the sulfation pattern is irregular and is the pharmacology."
  },
  {
    name: "Collagen", aka: ["collagen", "type I collagen", "tropocollagen"],
    monomer: "Gly-X-Y repeating tripeptide, X often proline", cls: "Step-growth (polyamide)", cas: null,
    tags: ["biopolymer", "biomedical", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The most abundant protein in a mammal and the tensile element of skin, tendon and bone. Every third residue is glycine because the triple helix leaves room for nothing larger at that position, and the hydroxyproline that stabilises it requires vitamin C to make - which is why scurvy is a structural disease. Not drawn: a protein with a repeating motif but no fixed repeat unit."
  },
  {
    name: "Elastin", aka: ["elastin", "tropoelastin"],
    monomer: "hydrophobic VPGVG-type repeats, crosslinked by desmosine", cls: "Step-growth (polyamide)", cas: null,
    tags: ["biopolymer", "biomedical", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The protein that lets an artery and a lung recoil, and one that stores its elasticity in entropy rather than in bonds. Hydrophobic repeats stay disordered and hydrated; stretching them orders the chains and expels water, and it is the water's entropy driving back that restores the shape. It is crosslinked once during development and essentially never replaced, so the elastin in an adult artery is as old as the person. Not drawn: a crosslinked network with no repeat unit."
  },
  {
    name: "Keratin", aka: ["keratin", "alpha-keratin", "hard keratin"],
    monomer: "cysteine-rich polypeptide, disulfide crosslinked", cls: "Step-growth (polyamide)", cas: null,
    tags: ["biopolymer", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "Hair, horn, nail and feather, and a protein whose properties come from a crosslink rather than a sequence. Cysteine residues pair into disulfide bridges that lock coiled-coil helices into a network, and the crosslink density is what separates soft skin keratin from hard hoof. Those same bonds are what a perm breaks and reforms. Not drawn: a crosslinked protein network."
  },
  {
    name: "Casein", aka: ["casein", "milk protein", "caseinate"],
    monomer: "phosphorylated milk proteins (alpha-s1, beta, kappa)", cls: "Step-growth (polyamide)", cas: null,
    tags: ["biopolymer", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "Four related proteins that assemble into micelles carrying calcium phosphate - nature's way of holding far more calcium in milk than could ever dissolve. Acidifying or adding rennet strips the stabilising kappa fraction and the micelles aggregate, which is cheese. Dried and pressed it was also one of the first commercial plastics, moulded into buttons well before Bakelite. Not drawn: a mixture of proteins with no repeat unit."
  },
  {
    name: "Zein", aka: ["zein", "maize prolamin", "corn protein"],
    monomer: "proline- and glutamine-rich maize storage protein", cls: "Step-growth (polyamide)", cas: null,
    tags: ["biopolymer", "biobased", "packaging", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "A maize storage protein unusual for being soluble in aqueous alcohol but not in water, because it is dominated by hydrophobic and amide residues with almost no charge. That solubility makes it castable into a water-resistant edible film, used to coat confectionery and pharmaceuticals, and it was moulded into fibres and plastics before petrochemicals displaced it. Not drawn: a protein with no repeat unit."
  },
  {
    name: "Ribonucleic acid", aka: ["RNA", "ribonucleic acid", "mRNA"],
    monomer: "ribonucleoside 5'-triphosphates (A, C, G, U)", cls: "Step-growth (polyester)", cas: null,
    tags: ["biopolymer", "water-soluble", "polyelectrolyte", "biomedical", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "DNA's less stable relative, and the difference is one hydroxyl: the 2'-OH that ribose carries and deoxyribose does not sits perfectly placed to attack its own phosphate backbone, so RNA hydrolyses in minutes at high pH where DNA lasts. That instability is why it works as a message rather than an archive, and why an mRNA vaccine must be kept cold and its uridines chemically modified. Not drawn: the four bases give four repeat units, and the sequence is the molecule."
  },
  {
    name: "Poly(aspartic acid)", aka: ["PASP", "polyaspartate", "poly(aspartic acid)"],
    monomer: "aspartic acid (via polysuccinimide)", cls: "Step-growth (polyamide)", cas: null,
    tags: ["biopolymer", "water-soluble", "polyelectrolyte", "biodegradable", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "N" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 5, b: 7, order: 1 }, { a: 3, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 8, b: "S1", order: 1 }],
    note: "The biodegradable answer to poly(acrylic acid), and a rare case of a green substitute that genuinely works: it inhibits scale, disperses pigment and superabsorbs water much as the acrylic does, but hydrolyses to a natural amino acid instead of persisting. Made by heating aspartic acid to polysuccinimide and hydrolysing that, so the chain is a mixture of alpha and beta linkages."
  },
  {
    name: "Poly(malic acid)", aka: ["PMLA", "polymalic acid", "poly(beta-L-malic acid)"],
    monomer: "L-malic acid (microbial)", cls: "Step-growth (polyester)", cas: null,
    tags: ["biopolymer", "water-soluble", "polyelectrolyte", "biodegradable", "drug delivery", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 5, b: 7, order: 1 }, { a: 3, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 8, b: "S1", order: 1 }],
    note: "A water-soluble polyester with a free carboxyl on every repeat - unusual, since most degradable polyesters are hydrophobic and offer nothing to attach to. Those acids are the attachment points for drugs and targeting groups, and the backbone hydrolyses to malic acid, a Krebs cycle intermediate. Produced by moulds, which is how it is obtained in useful quantity."
  },
  {
    name: "Polysialic acid", aka: ["PSA", "polysialic acid", "colominic acid"],
    monomer: "N-acetylneuraminic acid (alpha-2,8 linked)", cls: "Step-growth (polyester)", cas: null,
    tags: ["biopolymer", "water-soluble", "polyelectrolyte", "biomedical", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "A long chain of sialic acid found on the neural cell adhesion molecule during brain development, where its bulk and charge hold cells apart and keep them able to move. Some bacteria coat themselves in the identical polymer, which is why the immune system tolerates them - it cannot distinguish the capsule from self. That same invisibility is why it is used to extend the circulating life of drugs, as an alternative to PEG. Not drawn: the sialic acid unit is a nine-carbon sugar with a variable linkage."
  },
  {
    name: "Poly(2-ethyl-2-oxazoline)-graft chitosan", aka: ["chitosan-g-POx", "grafted chitosan"],
    monomer: "chitosan backbone grafted with poly(2-ethyl-2-oxazoline)", cls: "Ring-opening (polyamide)", cas: null,
    tags: ["copolymer", "biopolymer", "water-soluble", "biomedical", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "Chitosan's usefulness is limited by needing acid to dissolve; grafting a water-soluble polyoxazoline from its amines fixes that without removing the amines' charge entirely. The result stays soluble at neutral pH and keeps enough cationic character to bind nucleic acids and stick to mucosa. Not drawn: grafting density varies and the backbone itself has no fixed degree of deacetylation."
  },
  {
    name: "Polyphosphoester", aka: ["PPE (phosphoester)", "polyphosphate ester", "poly(phosphoester)"],
    monomer: "cyclic phosphoester", cls: "Ring-opening", cas: null,
    tags: ["biodegradable", "drug delivery", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "P" }, { id: 7, el: "O" }, { id: 8, el: "O" }, { id: 9, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 6, b: "S1", order: 1 }],
    note: "A backbone built on the same phosphate ester linkage that DNA uses, which makes it degradable by ordinary hydrolysis and by phosphatases, into phosphate and an alcohol. Its distinguishing feature is the fifth valence on phosphorus: a side group can be varied independently of the backbone, so charge, hydrophobicity or a drug can be changed without touching the degradation chemistry."
  },
  {
    name: "Poly(sodium vinyl sulfonate)", aka: ["PVS", "poly(vinylsulfonic acid)", "PVSA"],
    monomer: "vinylsulfonic acid", cls: "Addition (vinyl)", cas: null,
    tags: ["water-soluble", "polyelectrolyte", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: "S1", el: "*" }, { id: 5, el: "S" }, { id: 6, el: "O" }, { id: 7, el: "O" }, { id: 8, el: "O" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 5, b: 7, order: 2 }, { a: 5, b: 8, order: 1 }],
    note: "The shortest strong polyacid there is - a sulfonate bonded straight to the backbone with no spacer. That gives the highest charge density per gram of any common vinyl polyelectrolyte, though the same crowding makes the monomer polymerise reluctantly to low molar mass. Used where charge density matters more than chain length, in scale control and as a proton conductor. Drawn as the free acid."
  },
  {
    name: "Poly(carboxybetaine methacrylate)", aka: ["PCBMA", "polycarboxybetaine", "poly(carboxybetaine)"],
    monomer: "carboxybetaine methacrylate", cls: "Addition (methacrylate)", cas: null,
    tags: ["methacrylate", "water-soluble", "zwitterionic", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: "S1", el: "*" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "O" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "N", charge: 1 }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: 14, el: "C" }, { id: 15, el: "C" }, { id: 16, el: "O" }, { id: 17, el: "O", charge: -1 }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: "S1", order: 1 }, { a: 3, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 11, b: 13, order: 1 }, { a: 11, b: 14, order: 1 }, { a: 14, b: 15, order: 1 }, { a: 15, b: 16, order: 2 }, { a: 15, b: 17, order: 1 }],
    note: "The other major zwitterionic antifouling polymer, with a carboxylate rather than a sulfonate paired to the quaternary ammonium. The shorter, harder anion binds water more tightly, which gives slightly better resistance to protein adsorption than the sulfobetaine; and unlike it, the carboxylate offers a handle for coupling a ligand, so a surface can be non-fouling and still specific."
  },
  {
    name: "Poly(ethylene glycol) diacrylate network", aka: ["PEGDA", "PEG diacrylate hydrogel", "PEG-DA"],
    monomer: "poly(ethylene glycol) diacrylate", cls: "Addition (acrylate)", cas: null,
    tags: ["acrylate", "water-soluble", "biomedical", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "PEG capped at both ends with acrylates, so light and a photoinitiator turn a solution into a hydrogel in seconds - which is why it is the default matrix for encapsulating cells and for stereolithography of soft parts. Mesh size, and therefore what diffuses through, is set by the molar mass of the PEG between crosslinks. The acrylate junctions themselves do not degrade, so a fully resorbable version needs ester or peptide segments built in. Not drawn: a network with no repeat unit."
  },
  {
    name: "Poly(N-isopropylacrylamide-co-acrylic acid)", aka: ["PNIPAM-co-AA", "poly(NIPAM-co-AA)"],
    monomer: "N-isopropylacrylamide + acrylic acid", cls: "Addition (acrylate)", cas: null,
    tags: ["copolymer", "acrylate", "water-soluble", "thermoresponsive", "biomedical", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The standard way to move PNIPAM's transition where it is wanted. Adding a few percent of acrylic acid raises the cloud point above 37 C and makes it pH-dependent, so a gel can be built that collapses only when both warm and acidic - the combination found in a tumour but not in healthy tissue. The comonomer fraction is the tuning knob. Not drawn: the ratio is the design."
  },
  {
    name: "Poly(vinyl alcohol-co-vinyl acetate)", aka: ["partially hydrolysed PVA", "PVOH-co-PVAc", "partially hydrolyzed poly(vinyl alcohol)"],
    monomer: "vinyl acetate, partly hydrolysed", cls: "Addition (vinyl)", cas: null,
    tags: ["copolymer", "water-soluble", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "Poly(vinyl alcohol) is never made from vinyl alcohol, which does not exist as a stable monomer - it is made by hydrolysing poly(vinyl acetate), and how far that hydrolysis is taken is the specification. Fully hydrolysed grades crystallise and need hot water to dissolve; leaving twelve percent of the acetate on disrupts the crystal enough to dissolve cold. Not drawn: the residual acetate is the point."
  },
  {
    name: "Poly(butylene succinate-co-adipate)", aka: ["PBSA", "poly(butylene succinate adipate)"],
    monomer: "1,4-butanediol + succinic acid + adipic acid", cls: "Step-growth (polyester)", cas: null,
    tags: ["copolymer", "biodegradable", "packaging", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "Poly(butylene succinate) with adipate units mixed in to spoil its crystallinity on purpose. The parent is too stiff and slow to degrade for a compostable film; the adipate disrupts the lattice, lowering the melting point and speeding up enzymatic attack, so the copolymer composts on a useful timescale while staying flexible. Not drawn: the ratio is the design variable."
  },
  {
    name: "Poly(3-hydroxyhexanoate)", aka: ["PHHx", "P3HHx", "poly(3-hydroxyhexanoate)"],
    monomer: "3-hydroxyhexanoate (bacterial)", cls: "Step-growth (polyester)", cas: null,
    tags: ["biopolymer", "biobased", "biodegradable", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 3, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 8, b: "S1", order: 1 }],
    note: "A medium-chain-length polyhydroxyalkanoate, with a propyl side group where poly(3-hydroxybutyrate) has a methyl. That longer branch keeps the polymer from crystallising hard, so where the butyrate is brittle and awkward to melt-process this is soft and tough - the reason it is copolymerised into PHB to make it usable at all."
  },
  {
    name: "Poly(4-hydroxybutyrate)", aka: ["P4HB", "poly(4-hydroxybutyrate)", "Phasix"],
    monomer: "4-hydroxybutyrate (bacterial)", cls: "Step-growth (polyester)", cas: null,
    tags: ["biopolymer", "biodegradable", "biomedical", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: "S1", order: 1 }],
    note: "A polyhydroxyalkanoate with no side group at all, the hydroxyl sitting four carbons along instead of three. Without a branch to disrupt it the chain is flexible and the polymer is a strong elastomer rather than a brittle solid - unique in the family - and it degrades to a compound already present in the body. It is approved for surgical mesh and suture."
  },
  {
    name: "Poly(glycolide-co-trimethylene carbonate)", aka: ["PGA-co-TMC", "Maxon", "poly(glycolide-co-trimethylene carbonate)"],
    monomer: "glycolide + trimethylene carbonate", cls: "Step-growth (polyester)", cas: null,
    tags: ["copolymer", "biodegradable", "biomedical", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The chemistry behind a monofilament absorbable suture. Polyglycolide alone is strong but so stiff that a monofilament of it will not tie; blending in carbonate units softens the chain enough to handle like nylon while keeping the strength and the resorption schedule. The carbonate also degrades to a neutral diol, which moderates the acidity that pure polyglycolide generates. Not drawn: the ratio is the design."
  },
  {
    name: "Poly(vinyl methyl ether-alt-maleic anhydride)", aka: ["PVM/MA", "Gantrez", "poly(methyl vinyl ether-alt-maleic anhydride)"],
    monomer: "methyl vinyl ether + maleic anhydride", cls: "Addition (vinyl)", cas: null,
    tags: ["copolymer", "water-soluble", "specialty"],
    verified: false,
    atoms: [{ id: "S0", el: "*" }, { id: 2, el: "C" }, { id: 3, el: "O" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "O" }, { id: 9, el: "O" }, { id: 10, el: "C" }, { id: 11, el: "O" }, { id: 12, el: "C" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 2, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 7, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 10, b: 12, order: 1 }, { a: 6, b: 12, order: 1 }, { a: 12, b: "S1", order: 1 }],
    note: "Another perfectly alternating anhydride copolymer, and the polymer in denture adhesive and many toothpastes. The anhydride opens in water to a dicarboxylic acid that binds calcium and sticks tenaciously to mucosa and to tooth mineral; in its ester forms it is the film former in hairspray, where the acid groups let it be washed out again."
  },
  {
    name: "Poly(acrylonitrile-co-butadiene-co-styrene) high-rubber", aka: ["HRG ABS", "high rubber graft ABS"],
    monomer: "butadiene rubber grafted with styrene and acrylonitrile", cls: "Addition (diene)", cas: null,
    tags: ["copolymer", "engineering", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "Ordinary ABS is a blend; this is the graft concentrate it is made from, styrene and acrylonitrile polymerised in the presence of polybutadiene latex so that chains grow off the rubber particles. Those grafted chains are what anchor the rubber to the matrix - without them the particles would simply be filler and the toughening would not happen. Not drawn: it is a grafted particulate blend, not a repeat unit."
  },
  {
    name: "Cellulose nanocrystal", aka: ["CNC", "nanocrystalline cellulose", "cellulose nanowhisker"],
    monomer: "cellulose (acid-hydrolysed to the crystalline domains)", cls: "Step-growth (polyester)", cas: null,
    tags: ["biopolymer", "biobased", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "Not a distinct polymer but a distinct material: acid hydrolysis eats the disordered regions of a cellulose fibre and leaves the crystalline segments, rods a few nanometres across and a few hundred long. They have the stiffness of a defect-free crystal, carry sulfate charges from the hydrolysis that keep them dispersed, and above a critical concentration order into a chiral nematic phase that dries to an iridescent film. Not drawn: the chemistry is cellulose's; what is new is the size and shape."
  },
  {
    name: "Lignosulfonate", aka: ["lignosulphonate", "sulfite lignin", "lignin sulfonate"],
    monomer: "lignin, sulfonated during sulfite pulping", cls: "Step-growth (polyester)", cas: null,
    tags: ["biopolymer", "biobased", "water-soluble", "polyelectrolyte", "specialty"],
    verified: false,
    atoms: [], bonds: [],
    needsStructure: true,
    note: "The water-soluble lignin, and the reason sulfite pulping has an economic by-product where kraft pulping mostly burns one. Sulfonate groups introduced during the cook make the randomly crosslinked aromatic network disperse in water, giving a cheap polyelectrolyte used by the megatonne as a concrete plasticiser, a dust suppressant and a dye dispersant. Not drawn: lignin has no repeat unit and sulfonation adds another layer of irregularity."
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
