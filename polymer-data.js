// Curated reference library of common homopolymer repeat units.
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
  }
];
