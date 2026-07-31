// Chain dimensions: persistence length, characteristic ratio and the geometry
// needed to turn a molar mass into a real chain size.
//
// (c) 2025-2026 Nicholas Pierini. All rights reserved. The selection,
// arrangement, and curation of this dataset is proprietary to PolyTechniques
// (getpolytechniques.com) and is provided solely for use on that site.
//
// PERSISTENCE LENGTH IS NOT A MATERIAL CONSTANT. It is a property of a chain
// in a particular solvent at a particular temperature, and for a charged chain
// it moves with ionic strength as well. Every measured value here therefore
// carries its own solvent, temperature and method, and entries commonly hold
// several that disagree - that disagreement is the data, not noise in it.
//
// Fields
//   M0     g/mol per repeat unit
//   lm     nm of fully extended contour per repeat unit. This is DATA, not
//          derived: for a simple vinyl backbone it is two C-C bonds projected
//          onto the chain axis, but helical and inorganic backbones do not
//          follow that, so each entry justifies its own value in src.
//   cInf   characteristic ratio, unperturbed. null where none is established.
//   geom   backbone geometry for the C-infinity route, with `simple: false`
//          where that route does not apply (see below).
//   lp[]   measured persistence lengths, each with solvent, T, method, src.
//
// THE C-INFINITY ROUTE AND WHERE IT BREAKS. For a freely-rotating chain the
// Kuhn length is b = C_inf * l / cos(theta/2) with theta = 180 - backbone bond
// angle, and the persistence length is b/2. That reproduces the measured value
// within about 15 percent for flexible aliphatic backbones - polyethylene,
// polystyrene, PMMA, polypropylene all check out - and it FAILS for aromatic
// backbones, where the repeat is not a tetrahedral C-C unit at all. Bisphenol-A
// polycarbonate has C_inf 2.4, which the formula turns into 0.22 nm against a
// measured value near 1.0 nm. Entries where the route does not apply carry
// geom.simple = false and the page refuses to offer a prediction for them.
window.CHAIN_DATA = [

  /* ---------------- flexible aliphatic backbones ---------------- */
  {
    id: "pe", name: "Polyethylene", abbr: "PE", cls: "flexible",
    M0: 28.05, lm: 0.2553, cInf: 7.4,
    geom: { bond: 0.154, angle: 112, perRepeat: 2, simple: true },
    lp: [
      { value: 0.57, solvent: "melt / unperturbed", T: 140, method: "SANS", conf: "high" },
      { value: 0.69, solvent: "1-chloronaphthalene (theta)", T: 130, method: "intrinsic viscosity", conf: "medium" }
    ],
    note: "The reference flexible chain, and the one every model is calibrated against. Nothing in common use is more flexible except polydimethylsiloxane.",
    conf: "high",
    src: "C_inf 6.7 to 7.4 depending on temperature and method; 7.4 is the value usually quoted near the melt. The two lp entries are not a contradiction - the melt value is the genuinely unperturbed one and the theta-solvent figure sits slightly higher, which is the normal size of the disagreement between the two routes. lm 0.2553 nm is two C-C bonds of 0.154 nm projected at the tetrahedral angle, 2 x 0.154 x cos(34 deg)."
  },
  {
    id: "pp", name: "Polypropylene (isotactic)", abbr: "iPP", cls: "flexible",
    M0: 42.08, lm: 0.2553, cInf: 5.9,
    geom: { bond: 0.154, angle: 112, perRepeat: 2, simple: true },
    lp: [
      { value: 0.55, solvent: "melt / unperturbed", T: 180, method: "SANS", conf: "medium" }
    ],
    note: "Slightly stiffer per bond than polyethylene in the crystal but a smaller characteristic ratio in the melt, because the methyl group biases the rotational states rather than simply blocking them.",
    conf: "medium",
    src: "C_inf 5.9 for the atactic melt; isotactic and syndiotactic differ, and quoted values run 5.5 to 6.5. lp is the geometric consequence of that C_inf and agrees with SANS melt data to within the spread."
  },
  {
    id: "ps", name: "Polystyrene", abbr: "PS", cls: "flexible",
    M0: 104.15, lm: 0.2553, cInf: 10.0,
    geom: { bond: 0.154, angle: 112, perRepeat: 2, simple: true },
    lp: [
      { value: 1.0, solvent: "cyclohexane (theta)", T: 34.5, method: "light scattering", conf: "high" },
      { value: 0.9, solvent: "melt / unperturbed", T: 160, method: "SANS", conf: "high" }
    ],
    note: "The best characterised synthetic chain there is, and the standard against which GPC columns are calibrated - which is exactly why a GPC molar mass for anything else is a polystyrene-equivalent number rather than a real one.",
    conf: "high",
    src: "C_inf 10.0 is the long-standing value for atactic PS; the pendant phenyl raises it well above polyethylene. Cyclohexane at 34.5 C is the classic theta condition and the 1.0 nm figure is quoted almost universally. The melt SANS value sits marginally lower, as it does for polyethylene."
  },
  {
    id: "pmma", name: "Poly(methyl methacrylate)", abbr: "PMMA", cls: "flexible",
    M0: 100.12, lm: 0.2553, cInf: 9.0,
    geom: { bond: 0.154, angle: 112, perRepeat: 2, simple: true },
    lp: [
      { value: 0.8, solvent: "acetonitrile (theta)", T: 44, method: "light scattering", conf: "medium" }
    ],
    note: "A disubstituted backbone, so both substituents restrict rotation and the chain is stiffer than polystyrene per bond even though the characteristic ratio is slightly lower.",
    conf: "medium",
    src: "C_inf 8 to 9 depending on tacticity, which matters more here than for polystyrene: syndiotactic-rich PMMA is stiffer. 9.0 is representative of the commercial free-radical material, which is syndiotactic-rich."
  },
  {
    id: "pvc", name: "Poly(vinyl chloride)", abbr: "PVC", cls: "flexible",
    M0: 62.50, lm: 0.2553, cInf: 7.6,
    geom: { bond: 0.154, angle: 112, perRepeat: 2, simple: true },
    lp: [
      { value: 0.72, solvent: "cyclohexanone (theta)", T: 22, method: "intrinsic viscosity", conf: "low" }
    ],
    note: "Close to polyethylene in flexibility despite the chlorine, because the dipole interactions that stiffen it locally are largely screened in a polar solvent.",
    conf: "low",
    src: "C_inf near 7.6 is the commonly quoted figure. The lp entry is LOW confidence: theta conditions for PVC are awkward, values in the literature scatter, and it was not possible to pin a single well-attested measurement in this pass."
  },
  {
    id: "pib", name: "Polyisobutylene", abbr: "PIB", cls: "flexible",
    M0: 56.11, lm: 0.2553, cInf: 6.6,
    geom: { bond: 0.154, angle: 112, perRepeat: 2, simple: true },
    lp: [
      { value: 0.62, solvent: "melt / unperturbed", T: 25, method: "SANS", conf: "medium" }
    ],
    note: "The gem-dimethyl substitution makes it unusually compact rather than unusually stiff, which is why it packs so densely and is such a good gas barrier.",
    conf: "medium",
    src: "C_inf 6.6 near ambient. Its low permeability comes from packing, not from chain rigidity, and its persistence length is unremarkable."
  },
  {
    id: "peo", name: "Poly(ethylene oxide)", abbr: "PEO", cls: "flexible",
    M0: 44.05, lm: 0.278, cInf: 4.0,
    geom: { bond: 0.147, angle: 112, perRepeat: 3, simple: true },
    lp: [
      { value: 0.37, solvent: "water", T: 25, method: "SANS", conf: "medium" },
      { value: 0.35, solvent: "aqueous 0.45 M K2SO4 (theta)", T: 34.5, method: "light scattering", conf: "medium" }
    ],
    note: "Among the most flexible chains in common use, because the ether oxygen removes a substituent and lowers the barrier to rotation. Its water solubility is a hydration effect, not a flexibility one.",
    conf: "medium",
    src: "C_inf about 4.0, the lowest of the common carbon-backbone polymers. lm 0.278 nm per repeat is the crystallographic helical rise, NOT the all-trans projection of three bonds (0.366 nm): PEO crystallises in a 7/2 helix and the extended contour is correspondingly shorter, which matters because contour length feeds every downstream number on this page."
  },
  {
    id: "pdms", name: "Poly(dimethylsiloxane)", abbr: "PDMS", cls: "flexible",
    M0: 74.15, lm: 0.29, cInf: 6.8,
    geom: { bond: 0.164, angle: 143, perRepeat: 2, simple: false },
    lp: [
      { value: 0.44, solvent: "melt / unperturbed", T: 25, method: "SANS", conf: "medium" }
    ],
    note: "The most flexible common polymer, and the reason silicones stay rubbery to very low temperature. The Si-O-Si angle opens to about 143 degrees against 112 for carbon, and the barrier to rotation about Si-O is nearly absent.",
    conf: "medium",
    src: "geom.simple is FALSE. The backbone alternates Si-O-Si near 143 degrees with O-Si-O near 110, so a single bond angle does not describe it and the C_inf route would need an averaged geometry it does not have. C_inf 6.8 is carried for reference but no prediction is offered; the 0.44 nm measured value is the number to use."
  },

  /* ---------------- aromatic backbones: model does not apply ---------------- */
  {
    id: "pc", name: "Bisphenol-A polycarbonate", abbr: "PC", cls: "aromatic",
    M0: 254.29, lm: 1.08, cInf: 2.4,
    geom: { bond: null, angle: null, perRepeat: null, simple: false },
    lp: [
      { value: 1.0, solvent: "melt / unperturbed", T: 200, method: "SANS", conf: "medium" }
    ],
    note: "The worked example of why a characteristic ratio cannot be turned into a persistence length without knowing what the backbone looks like.",
    conf: "medium",
    src: "This entry exists mostly as a caution. C_inf 2.4 looks like an extremely flexible chain and is nothing of the kind: the ratio is defined per backbone BOND, and a polycarbonate repeat contains rigid phenylene units and long virtual bonds rather than the tetrahedral C-C the formula assumes. Feeding 2.4 into b = C_inf*l/cos(theta/2) gives 0.22 nm against a measured 1.0 nm, wrong by more than a factor of four. geom.simple is false and the page refuses to predict."
  },
  {
    id: "ppta", name: "Poly(p-phenylene terephthalamide)", abbr: "PPTA / Kevlar", cls: "rigid",
    M0: 238.24, lm: 1.29, cInf: null,
    geom: { bond: null, angle: null, perRepeat: null, simple: false },
    lp: [
      { value: 30, solvent: "concentrated sulfuric acid", T: 25, method: "light scattering", conf: "medium" }
    ],
    note: "A genuinely rigid chain: the para-linked aromatic rings and amide bonds leave almost nothing to rotate about, which is what makes it liquid-crystalline in solution and lets fibres be spun with the chains already aligned.",
    conf: "medium",
    src: "Persistence lengths from 15 to 50 nm appear in the literature depending on molar mass, concentration and how the rod-like scattering is fitted; 30 nm is mid-range. Sulfuric acid is the only practical solvent, which is itself the reason the data is thin. No C_inf: the concept is near-meaningless for a chain this stiff, where the coil limit is never reached at accessible molar mass."
  },

  /* ---------------- nucleic acids ---------------- */
  {
    id: "dsdna", name: "DNA, double stranded", abbr: "dsDNA", cls: "semiflexible",
    M0: 650, lm: 0.34, cInf: null,
    geom: { bond: null, angle: null, perRepeat: null, simple: false },
    lp: [
      { value: 50, solvent: "aqueous, 10-150 mM NaCl", T: 25, method: "single-molecule force / light scattering", conf: "high" },
      { value: 45, solvent: "aqueous, high salt (>1 M NaCl)", T: 25, method: "single-molecule force", conf: "medium" }
    ],
    note: "The most precisely known persistence length of any polymer, and the reference case for semiflexible behaviour. At 50 nm it is about 150 base pairs, so a chain has to exceed roughly a kilobase before it behaves like a coil at all - which is why short DNA is treated as a rod and long DNA as a random walk.",
    conf: "high",
    src: "50 nm under standard physiological-like conditions is quoted almost universally and is supported by single-molecule stretching, cyclisation kinetics and scattering independently. The salt dependence is real but modest for the duplex: adding salt screens the phosphate charges and drops lp toward about 45 nm, far less dramatic than for the single strand. M0 650 g/mol is per BASE PAIR, and lm 0.34 nm is the B-form rise per base pair, so a molar mass entered for this entry is duplex mass."
  },
  {
    id: "ssdna", name: "DNA, single stranded", abbr: "ssDNA", cls: "flexible",
    M0: 325, lm: 0.63, cInf: null,
    geom: { bond: null, angle: null, perRepeat: null, simple: false },
    lp: [
      { value: 1.0, solvent: "aqueous, high salt (>0.5 M NaCl)", T: 25, method: "single-molecule force", conf: "medium" },
      { value: 2.2, solvent: "aqueous, low salt (~10 mM NaCl)", T: 25, method: "single-molecule force", conf: "medium" }
    ],
    note: "Two orders of magnitude more flexible than the duplex, and the clearest demonstration on this page that persistence length is a property of conditions rather than of a molecule. Losing the base pairing removes the rigid ladder and leaves a charged, floppy chain whose stiffness is then dominated by electrostatics.",
    conf: "medium",
    src: "The INTRINSIC persistence length, with electrostatics fully screened, is around 0.7 to 1.0 nm. At low ionic strength the unscreened phosphate repulsion adds an electrostatic contribution and the total rises to roughly 2 to 3 nm. The two entries here bracket that. Values are harder to pin than for the duplex because ssDNA forms transient secondary structure that fitting must account for, and reported numbers depend on the model used. M0 325 g/mol is per nucleotide and lm 0.63 nm is the extended rise per nucleotide, both roughly half the duplex figures per unit of sequence."
  },

  /* ---------------- polysaccharides ---------------- */
  {
    id: "cellulose", name: "Cellulose", abbr: "Cellulose", cls: "semiflexible",
    M0: 162.14, lm: 0.515, cInf: null,
    geom: { bond: null, angle: null, perRepeat: null, simple: false },
    lp: [
      { value: 6.5, solvent: "cadoxen", T: 25, method: "light scattering", conf: "medium" },
      { value: 9.0, solvent: "LiCl / N,N-dimethylacetamide", T: 25, method: "light scattering", conf: "low" }
    ],
    note: "Stiff for a polysaccharide because the equatorial beta-1,4 linkage produces an extended ribbon rather than a coil, and intramolecular hydrogen bonding across the linkage holds it there. That extended conformation is the reason cellulose forms fibres and does not melt.",
    conf: "medium",
    src: "Reported lp spans roughly 5 to 16 nm and the solvent is a large part of why: cellulose only dissolves in aggressive systems, and each perturbs the hydrogen bonding differently. The two entries are chosen to show that spread rather than to hide it. lm 0.515 nm is the rise per anhydroglucose unit in the extended chain."
  },
  {
    id: "chitosan", name: "Chitosan", abbr: "Chitosan", cls: "semiflexible",
    M0: 161.16, lm: 0.515, cInf: null,
    geom: { bond: null, angle: null, perRepeat: null, simple: false },
    lp: [
      { value: 9.0, solvent: "0.3 M acetic acid / 0.2 M sodium acetate", T: 25, method: "dynamic light scattering", conf: "medium" }
    ],
    note: "A charged polysaccharide, so its stiffness is part backbone and part electrostatic. Raising the salt screens the protonated amine groups and the chain relaxes; lowering it stiffens the chain by simple charge repulsion along the backbone.",
    conf: "medium",
    src: "9 nm is the intrinsic value reported by DLS in 0.3 M acetic acid with 0.2 M sodium acetate, a buffer chosen precisely to screen the charge and isolate the backbone contribution. Values from 5 to 25 nm appear elsewhere and most of that spread is ionic strength and degree of deacetylation rather than genuine disagreement, which is why the solvent is quoted here as part of the measurement rather than as a footnote."
  },
  {
    id: "hyaluronan", name: "Hyaluronan (sodium hyaluronate)", abbr: "HA", cls: "semiflexible",
    M0: 401.3, lm: 1.0, cInf: null,
    geom: { bond: null, angle: null, perRepeat: null, simple: false },
    lp: [
      { value: 4.5, solvent: "aqueous 0.2 M NaCl", T: 25, method: "light scattering", conf: "medium" }
    ],
    note: "The polysaccharide of synovial fluid and the vitreous. Moderately stiff and highly hydrated, which is what gives its solutions their viscoelasticity at very low concentration.",
    conf: "medium",
    src: "Reported lp runs about 4 to 9 nm; 4.5 nm in 0.2 M NaCl is a commonly cited intrinsic value at screening salt. Like chitosan it is a polyelectrolyte and the number rises as salt is removed. M0 401.3 is per disaccharide repeat, which is the conventional unit for hyaluronan, and lm 1.0 nm is that repeat extended."
  },
  {
    id: "xanthan", name: "Xanthan gum (ordered helix)", abbr: "Xanthan", cls: "rigid",
    M0: 933, lm: 0.47, cInf: null,
    geom: { bond: null, angle: null, perRepeat: null, simple: false },
    lp: [
      { value: 120, solvent: "aqueous salt, ordered state", T: 25, method: "light scattering", conf: "medium" }
    ],
    note: "One of the stiffest polymers in solution outside the aramids, and the reason a few tenths of a percent thickens a fluid so effectively. The rigidity is conformational rather than covalent: the ordered form is a double helix stabilised by its charged trisaccharide side chains, and heating it through the order-disorder transition collapses the persistence length by an order of magnitude.",
    conf: "medium",
    src: "120 nm for the ordered helix is the widely quoted figure. This entry is conformation-specific and the value is meaningless without saying which state the sample is in: the disordered form above the transition is far more flexible, and the transition temperature itself depends on ionic strength. M0 933 g/mol is per pentasaccharide repeat."
  },
  {
    id: "alginate", name: "Sodium alginate", abbr: "Na alginate", cls: "semiflexible",
    M0: 198.11, lm: 0.5, cInf: null,
    geom: { bond: null, angle: null, perRepeat: null, simple: false },
    lp: [
      { value: 12, solvent: "aqueous 0.1 M NaCl", T: 25, method: "light scattering", conf: "low" }
    ],
    note: "Stiffness depends on sequence in an unusually direct way: the guluronate blocks are the rigid, buckled ones that also bind calcium and form the egg-box junctions, while mannuronate blocks are more flexible. Two alginates of the same molar mass can differ substantially if their M/G ratios differ.",
    conf: "low",
    src: "LOW confidence, and the M/G ratio is why. Reported lp runs roughly 6 to 15 nm across sources and much of that is genuine compositional difference between seaweed species rather than measurement scatter, so a single number for alginate is a convenient fiction. 12 nm at 0.1 M NaCl is mid-range. Anyone using this should measure their own lot or at least know its M/G."
  },

  /* ---------------- helical and cytoskeletal, for scale ---------------- */
  {
    id: "pblg", name: "Poly(gamma-benzyl-L-glutamate), alpha-helix", abbr: "PBLG", cls: "rigid",
    M0: 219.24, lm: 0.15, cInf: null,
    geom: { bond: null, angle: null, perRepeat: null, simple: false },
    lp: [
      { value: 150, solvent: "dimethylformamide (helicogenic)", T: 25, method: "light scattering", conf: "medium" }
    ],
    note: "The classic synthetic rod, and the system in which lyotropic liquid crystallinity in polymers was first worked out. The rigidity is entirely the alpha-helix: put it in a helix-breaking solvent and it becomes an ordinary flexible coil, which is about as direct a demonstration as exists that persistence length belongs to the chain-plus-solvent rather than to the chain.",
    conf: "medium",
    src: "Reported lp for the helical form runs from about 100 to well over 200 nm depending on molar mass and fitting model; 150 nm is representative. lm 0.15 nm is the alpha-helical rise per residue, which is much SHORTER than an extended chain would give - the residues are wound into the helix rather than laid end to end, and using an extended value here would overstate the contour length by a factor of about four."
  },
  {
    id: "f-actin", name: "F-actin filament", abbr: "F-actin", cls: "rigid",
    M0: 42000, lm: 2.75, cInf: null,
    geom: { bond: null, angle: null, perRepeat: null, simple: false },
    lp: [
      { value: 17000, solvent: "aqueous buffer, physiological", T: 25, method: "thermal fluctuation imaging", conf: "medium" }
    ],
    note: "Included to set the scale. At about 17 micrometres its persistence length is longer than most cells, so on the length scale of a cell an actin filament is effectively a rigid rod - which is exactly how the cytoskeleton uses it. Six orders of magnitude separate this from polyethylene.",
    conf: "medium",
    src: "Values from roughly 9 to 20 micrometres are reported, depending on whether the filament is phalloidin-stabilised and on how the bending modes are fitted; 17 um is the commonly cited figure for bare F-actin. M0 42 kg/mol is per actin monomer and lm 2.75 nm is the rise per monomer along the filament, so molar mass entered here is filament mass and the numbers are per-subunit rather than per-covalent-repeat. This is a supramolecular polymer, not a covalent one."
  }
];

window.CHAIN_DATA_META = {
  source: "PolyTechniques - getpolytechniques.com",
  author: "Nicholas Pierini",
  copyright: "(c) 2025-2026 Nicholas Pierini. All rights reserved.",
  license: "Proprietary. See terms.html. No reuse without written permission."
};
