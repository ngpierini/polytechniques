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
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" },
      { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 },
      { a: 3, b: 4, order: 2 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 2 },
      { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 8, b: 3, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Poly(vinyl chloride)", aka: ["PVC"], monomer: "Vinyl chloride", cls: "Addition (vinyl)",
    cas: "9002-86-2", tg: "80 °C", tags: ["commodity", "vinyl-halide", "packaging"],
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
    note: "Multiple sub-ambient and near-ambient transitions are reported instead of a single clean Tg.",
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
    cas: "9003-20-7", tg: "30 °C", tags: ["acrylic", "coating"],
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
    cls: "Addition (methacrylate)", cas: "9011-14-7", tg: "105 °C", tags: ["acrylic", "engineering"],
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
    cls: "Addition (methacrylate)", cas: "25249-16-5", tg: "55 °C", tags: ["acrylic", "biomedical"],
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
    cas: "9003-31-0", tg: "-70 °C", tags: ["elastomer"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 2 }, { a: 4, b: 5, order: 1 }, { a: 5, b: "S1", order: 1 }]
  },
  {
    name: "Polybutadiene (cis-1,4)", aka: ["BR", "butadiene rubber"], monomer: "1,3-Butadiene", cls: "Addition (diene)",
    cas: "9003-17-2", tg: "-100 °C", tags: ["elastomer"],
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
    name: "Polyoxymethylene", aka: ["POM", "acetal", "Delrin"], monomer: "Formaldehyde", cls: "Ring-opening",
    cas: "9002-81-7", tg: "-60 °C", tm: "175 °C", tags: ["engineering"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    name: "Poly(dimethylsiloxane)", aka: ["PDMS", "silicone rubber"], monomer: "Dimethylsiloxane / D4 or D3 cyclics",
    cls: "Ring-opening (silicone)", cas: "9016-00-6", tg: "-125 °C", tags: ["silicone", "elastomer"],
    atoms: [{ id: 1, el: "Si" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 1, b: 3, order: 1 }, { a: 1, b: 4, order: 1 }, { a: 4, b: "S1", order: 1 }]
  },
  {
    name: "Nylon 6", aka: ["Polycaprolactam", "PA6"], monomer: "Caprolactam", cls: "Ring-opening (polyamide)",
    cas: "25038-54-4", tg: "47 °C", tm: "220 °C", tags: ["polyamide", "engineering", "fiber"],
    atoms: [{ id: 1, el: "N" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: "S1", order: 1 }]
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
    cls: "Addition (acrylate)", cas: "141-32-2",
    tags: ["acrylic"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 8, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(2-ethylhexyl acrylate)", aka: ["P2EHA"], monomer: "2-ethylhexyl acrylate",
    cls: "Addition (acrylate)", cas: "103-11-7",
    tags: ["acrylic"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "O" }, { id: 10, el: "C" }, { id: 11, el: "O" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 12, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 5, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 10, b: 12, order: 1 }, { a: 12, b: 13, order: 1 }, { a: 13, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(tert-butyl acrylate)", aka: ["PtBA"], monomer: "tert-butyl acrylate",
    cls: "Addition (acrylate)", cas: "1663-39-4",
    tags: ["acrylic"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 8, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 2, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(butyl methacrylate)", aka: ["PBMA"], monomer: "butyl methacrylate",
    cls: "Addition (methacrylate)", cas: "97-88-1",
    tags: ["acrylic"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 8, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 8, b: 10, order: 1 }, { a: 9, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(tert-butyl methacrylate)", aka: ["PtBMA"], monomer: "tert-butyl methacrylate",
    cls: "Addition (methacrylate)", cas: "585-07-9",
    tags: ["acrylic"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 7, b: 9, order: 1 }, { a: 7, b: 10, order: 1 }, { a: 3, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(benzyl methacrylate)", aka: ["PBzMA"], monomer: "benzyl methacrylate",
    cls: "Addition (methacrylate)", cas: "2495-37-6",
    tags: ["acrylic"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: 13, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 9, b: 10, order: 1 }, { a: 10, b: 11, order: 2 }, { a: 11, b: 12, order: 1 }, { a: 12, b: 13, order: 2 }, { a: 8, b: 13, order: 1 }, { a: 3, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(glycidyl methacrylate)", aka: ["PGMA"], monomer: "glycidyl methacrylate",
    cls: "Addition (methacrylate)", cas: "106-91-2",
    tags: ["acrylic", "specialty"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 8, b: 10, order: 1 }, { a: 3, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(2-(dimethylamino)ethyl methacrylate)", aka: ["PDMAEMA"], monomer: "2-(dimethylamino)ethyl methacrylate",
    cls: "Addition (methacrylate)", cas: "2867-47-2",
    tags: ["acrylic", "water-soluble", "biomedical"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "N" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 1 }, { a: 9, b: 11, order: 1 }, { a: 3, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(alpha-methylstyrene)", aka: ["PAMS"], monomer: "alpha-methylstyrene",
    cls: "Addition (vinyl)", cas: "98-83-9",
    tags: ["specialty"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 2 }, { a: 4, b: 9, order: 1 }, { a: 3, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(4-methylstyrene)", aka: ["P4MS"], monomer: "4-methylstyrene",
    cls: "Addition (vinyl)", cas: "622-97-9",
    tags: ["specialty"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 8, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 2, b: 7, order: 1 }, { a: 5, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 9, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(4-tert-butylstyrene)", aka: ["PtBS"], monomer: "4-tert-butylstyrene",
    cls: "Addition (vinyl)", cas: "1746-23-2",
    tags: ["specialty"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "C" }, { id: 11, el: "C" }, { id: 12, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 11, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 2, b: 5, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 5, b: 10, order: 1 }, { a: 8, b: 11, order: 1 }, { a: 11, b: 12, order: 1 }, { a: 12, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(chlorotrifluoroethylene)", aka: ["PCTFE"], monomer: "chlorotrifluoroethylene",
    cls: "Addition (vinyl)", cas: "79-38-9",
    tags: ["engineering", "fluoropolymer"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "F" }, { id: 4, el: "Cl" }, { id: 5, el: "F" }, { id: 6, el: "F" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 1, b: 5, order: 1 }, { a: 1, b: 6, order: 1 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(N-vinylcaprolactam)", aka: ["PVCL"], monomer: "N-vinylcaprolactam",
    cls: "Addition (vinyl)", cas: "2235-00-9",
    tags: ["water-soluble", "biomedical"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "N" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: 9, el: "C" }, { id: 10, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 8, b: 9, order: 1 }, { a: 3, b: 9, order: 1 }, { a: 9, b: 10, order: 2 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(vinyl propionate)", aka: ["PVPr"], monomer: "vinyl propionate",
    cls: "Addition (vinyl)", cas: "105-38-4",
    tags: ["coating"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 6, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 3, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(methyl vinyl ether)", aka: ["PMVE"], monomer: "methyl vinyl ether",
    cls: "Addition (vinyl)", cas: "107-25-5",
    tags: ["specialty"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "O" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 3, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(ethyl vinyl ether)", aka: ["PEVE"], monomer: "ethyl vinyl ether",
    cls: "Addition (vinyl)", cas: "109-92-2",
    tags: ["specialty"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "O" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 4, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 5, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (vinyl addition (single non-ring C=C)) - verify structure before trusting
    name: "Poly(N-vinylformamide)", aka: ["PNVF"], monomer: "N-vinylformamide",
    cls: "Addition (vinyl)", cas: "13162-05-5",
    tags: ["water-soluble"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "N" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 2, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (conjugated diene, 1,4-addition) - verify structure before trusting
    name: "Poly(2,3-dimethylbutadiene)", aka: [], monomer: "2,3-dimethyl-1,3-butadiene",
    cls: "Addition (diene)", cas: "513-81-5",
    tags: ["elastomer"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 3, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 2 }, { a: 4, b: 5, order: 1 }, { a: 4, b: 6, order: 1 }, { a: 5, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (ring-opening (lactam/lactone/carbonate)) - verify structure before trusting
    name: "Poly(caprolactone)", aka: ["PCL"], monomer: "epsilon-caprolactone",
    cls: "Ring-opening", cas: "502-44-3",
    tags: ["biodegradable", "biomedical"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 4, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }, { a: 1, b: 8, order: 1 }, { a: 6, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (ring-opening (lactam/lactone/carbonate)) - verify structure before trusting
    name: "Poly(glycolide)", aka: ["PGA"], monomer: "glycolide",
    cls: "Ring-opening", cas: "502-97-6",
    tags: ["biodegradable", "biomedical"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "O" }, { id: 4, el: "O" }, { id: 5, el: "C" }, { id: 6, el: "C" }, { id: 7, el: "O" }, { id: 8, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 2, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 4, b: 5, order: 1 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 2 }, { a: 6, b: 8, order: 1 }, { a: 1, b: 8, order: 1 }, { a: 4, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (ring-opening (lactam/lactone/carbonate)) - verify structure before trusting
    name: "Poly(lactide)", aka: ["PLA"], monomer: "lactide",
    cls: "Ring-opening", cas: "95-96-5",
    tags: ["biodegradable", "biomedical", "commodity"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: 5, el: "O" }, { id: 6, el: "C" }, { id: 7, el: "C" }, { id: 8, el: "O" }, { id: 9, el: "O" }, { id: 10, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 3, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 2 }, { a: 5, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 }, { a: 7, b: 9, order: 1 }, { a: 2, b: 9, order: 1 }, { a: 6, b: 10, order: 1 }, { a: 5, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (ring-opening (lactam/lactone/carbonate)) - verify structure before trusting
    name: "Poly(valerolactone)", aka: ["PVL"], monomer: "delta-valerolactone",
    cls: "Ring-opening", cas: "542-28-9",
    tags: ["biodegradable"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "O" }, { id: 5, el: "C" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 4, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 5, b: 6, order: 2 }, { a: 5, b: 7, order: 1 }, { a: 1, b: 7, order: 1 }, { a: 5, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (ring-opening (lactam/lactone/carbonate)) - verify structure before trusting
    name: "Poly(propiolactone)", aka: [], monomer: "beta-propiolactone",
    cls: "Ring-opening", cas: "57-57-8",
    tags: ["biodegradable"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "O" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 3, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 1, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (ring-opening (lactam/lactone/carbonate)) - verify structure before trusting
    name: "Poly(trimethylene carbonate)", aka: ["PTMC"], monomer: "trimethylene carbonate",
    cls: "Ring-opening", cas: "2453-03-4",
    tags: ["biodegradable", "biomedical"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "O" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 3, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 1, b: 7, order: 1 }, { a: 4, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (ring-opening (epoxide)) - verify structure before trusting
    name: "Poly(epichlorohydrin)", aka: ["PECH"], monomer: "epichlorohydrin",
    cls: "Ring-opening", cas: "106-89-8",
    tags: ["elastomer"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "O" }, { id: 4, el: "C" }, { id: 5, el: "Cl" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 1 }, { a: 3, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (ring-opening (epoxide)) - verify structure before trusting
    name: "Poly(butylene oxide)", aka: ["PBO"], monomer: "1,2-butylene oxide",
    cls: "Ring-opening", cas: "106-88-7",
    tags: ["polyether"],
    verified: false,
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 4, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }, { a: 3, b: 4, order: 1 }, { a: 3, b: 5, order: 1 }, { a: 5, b: "S1", order: 1 }]
  },
  {
    // AUTO-GENERATED by scripts/discover-polymers.js (ring-opening (epoxide)) - verify structure before trusting
    name: "Poly(styrene oxide)", aka: [], monomer: "styrene oxide",
    cls: "Ring-opening", cas: "96-09-3",
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
    cls: "Addition (methacrylate)", cas: "9003-42-3", tg: "65 °C", tags: ["acrylic", "coating"],
    atoms: [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "C" }, { id: 4, el: "C" }, { id: 5, el: "O" }, { id: 6, el: "O" }, { id: 7, el: "C" }, { id: 8, el: "C" }, { id: "S0", el: "*" }, { id: "S1", el: "*" }],
    bonds: [{ a: "S0", b: 1, order: 1 }, { a: 1, b: 2, order: 1 }, { a: 2, b: "S1", order: 1 }, { a: 2, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }, { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 }, { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 1 }]
  },
  {
    name: "Poly(cyclohexyl methacrylate)", aka: ["PCHMA"], monomer: "Cyclohexyl methacrylate",
    cls: "Addition (methacrylate)", cas: "25768-50-7", tg: "~92 °C", tags: ["acrylic"],
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
