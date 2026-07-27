// Thermal property library: DSC, TGA, and DMA parameters used to generate
// the predicted curves on thermal-analysis.html.
//
// (c) 2025-2026 Nicholas Pierini. All rights reserved. The selection,
// arrangement, and curation of this dataset is proprietary to PolyTechniques
// (getpolytechniques.com) and is provided solely for use on that site.
//
// Values are typical literature/handbook figures for TEACHING and estimation.
// They vary with grade, thermal history, heating rate, and method. The "conf"
// field flags how well established each entry is (high | medium | low); the
// page surfaces anything below "high" to the reader. Always run your own
// standard for quantitative work.
//
// Fields: tg/tm/tcc/decompT in degrees C; dCp in J/(g K); dHm/dHm0/decompH in
// J/g; tga.steps[].t = peak-rate temperature (deg C) and .f = fraction of the
// ORIGINAL mass lost in that step under N2; tga.charN2 / tga.ashAir = fraction
// remaining at ~900 C under N2 / air (ashAir may EXCEED 1 for a metal that
// oxidises); dma.glassy / dma.rubbery in Pa.
window.THERMAL_LIBRARY = [
  {
    id: "pc", name: "Bisphenol-A polycarbonate", abbr: "PC", cls: "thermoplastic",
    note: "Tough amorphous engineering glass for glazing and housings; notable for a strong sub-Tg beta relaxation near -100 C that carries its impact toughness.",
    tg: 147, dCp: 0.22, tm: null, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 520, f: 0.75, l: "carbonate scission / isopropylidene scission" }], charN2: 0.25, ashAir: 0, special: null },
    dma: { type: "linear", glassy: 2400000000, rubbery: 6000000 },
    conf: "high", src: "Tg 145-150 C (Brandrup Polymer Handbook; this site's database lists 145 C); dCp 0.22 J/(g K) from ATHAS. TGA in N2 is a single stage; Jang and Wilkie (Polym. Degrad. Stab. 2004/2005) report Tmax near 540 C at 20 K/min with ~27% char at 700 C, which maps to ~515-525 C at 10 K/min. PC is amorphous as molded, so no Tm/dHm. High rubbery plateau reflects its small entanglement molar mass."
  },
  {
    id: "hdpe", name: "High-density polyethylene", abbr: "HDPE", cls: "thermoplastic",
    note: "Linear, highly crystalline polyolefin used for bottles, pipe, and drum liners; the crystallinity, not the glass transition, sets its stiffness.",
    tg: -125, dCp: 0.18, tm: 133, dHm: 200, dHm0: 293, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 480, f: 0.99, l: "random chain scission / depolymerization" }], charN2: 0.01, ashAir: 0, special: null },
    dma: { type: "semicrystalline", glassy: 3500000000, rubbery: 1200000000 },
    conf: "high", src: "Tg from Odian Table 1-3 (PE -125 C); note the PE glass transition is genuinely method-dependent - assignments run -125 to -80 C depending on which relaxation is called Tg, and this site's polymer database lists -110 C, so treat Tg alone as medium confidence. dHm0 293 J/g is the standard PE crystal value (Wunderlich/ATHAS, ASTM D3418 practice); commercial HDPE Tm 130-137 C. dHm 200 J/g = 68% crystallinity, typical of HDPE. TGA single-step ~470-490 C in N2 with negligible char, 10 K/min."
  },
  {
    id: "ldpe", name: "Low-density polyethylene", abbr: "LDPE", cls: "thermoplastic",
    note: "Free-radical, long-chain-branched PE for film and squeeze bottles; branching suppresses crystallinity so it melts broadly and low.",
    tg: -120, dCp: 0.3, tm: 110, dHm: 120, dHm0: 293, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 470, f: 0.99, l: "random chain scission" }], charN2: 0.01, ashAir: 0, special: null },
    dma: { type: "semicrystalline", glassy: 2800000000, rubbery: 200000000 },
    conf: "medium", src: "Same PE crystal reference (dHm0 293 J/g); Tm 105-115 C and 35-45% crystallinity typical of LDPE (dHm 120 J/g = 41%); Tg assignment for PE is method-dependent (-125 to -110 C), hence medium confidence on Tg/dCp."
  },
  {
    id: "pa6", name: "Nylon 6 (polycaprolactam)", abbr: "PA6", cls: "thermoplastic",
    note: "Ring-opened caprolactam polyamide for gears, film, and fiber; hydrogen bonding drives both the high Tm and the strong moisture sensitivity of Tg.",
    tg: 48, dCp: 0.3, tm: 220, dHm: 70, dHm0: 230, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 455, f: 0.98, l: "amide scission, caprolactam and nitrile evolution" }], charN2: 0.02, ashAir: 0, special: null },
    dma: { type: "semicrystalline", glassy: 3200000000, rubbery: 500000000 },
    conf: "medium", src: "Tm 220-223 C (Odian/site 220-223 C); dHm0 230 J/g (Wunderlich/ATHAS, also TA TN048); dHm 70 J/g = 30% crystallinity, typical. Tg is quoted for DRY PA6 (47-60 C depending on method); absorbed water plasticizes it to near room temperature, which is why confidence is medium on Tg. TGA one step 440-470 C in N2 with 1-3% char."
  },
  {
    id: "pa66", name: "Nylon 6,6", abbr: "PA66", cls: "thermoplastic",
    note: "Hexamethylenediamine/adipic acid polyamide with the highest melting point of the common nylons; standard for under-hood and electrical parts.",
    tg: 50, dCp: 0.28, tm: 262, dHm: 70, dHm0: 255, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 455, f: 0.96, l: "amide scission, CO2/cyclopentanone evolution" }], charN2: 0.04, ashAir: 0, special: null },
    dma: { type: "semicrystalline", glassy: 3400000000, rubbery: 600000000 },
    conf: "medium", src: "Tg 50-57 C (dry) and Tm 265 C per Odian Table 1-3; commercial peak Tm 260-265 C. dHm0 255 J/g (Wunderlich/ATHAS); note some labs use 188-196 J/g, which shifts computed crystallinity substantially - dHm 70 J/g is 27% on the 255 J/g basis. Dry-vs-conditioned Tg spread is the reason for medium confidence. TGA one step 440-470 C in N2, 2-5% char."
  },
  {
    id: "peek", name: "Poly(ether ether ketone)", abbr: "PEEK", cls: "thermoplastic",
    note: "Semicrystalline high-performance aromatic thermoplastic for aerospace and implants; quenched PEEK is a clear amorphous glass that cold-crystallizes on reheating.",
    tg: 143, dCp: 0.22, tm: 343, dHm: 40, dHm0: 130, tcc: 172,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 575, f: 0.52, l: "ether/ketone scission, phenol and CO evolution" }], charN2: 0.48, ashAir: 0, special: null },
    dma: { type: "semicrystalline", glassy: 3700000000, rubbery: 300000000 },
    conf: "high", src: "Tg 143 C and Tm 343 C (Victrex data sheets; Blundell and Osborn, Polymer 1983); dHm0 130 J/g is the conventional crystallinity reference (Blundell/Osborn), acknowledged as an extrapolated rather than directly measured value, so dHm 40 J/g = ~31% crystallinity is a convention-dependent number. dCp 0.22 J/(g K) is the amorphous-phase value; a 30% crystalline specimen shows a proportionally smaller step (~0.15). Melt-quenched PEEK cold-crystallizes at 165-180 C. TGA in N2: onset ~520 C, Tmax 560-585 C, carbon residue 47-48%. In air the same char burns off completely above ~650 C."
  },
  {
    id: "pet", name: "Poly(ethylene terephthalate)", abbr: "PET", cls: "thermoplastic",
    note: "Bottle and fiber polyester; crystallizes slowly enough that a quenched specimen shows the classic Tg / cold-crystallization / melt triple feature.",
    tg: 78, dCp: 0.4, tm: 252, dHm: 45, dHm0: 140, tcc: 130,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 440, f: 0.86, l: "ester scission to vinyl esters, acetaldehyde, CO2" }], charN2: 0.14, ashAir: 0, special: null },
    dma: { type: "semicrystalline", glassy: 3000000000, rubbery: 300000000 },
    conf: "high", src: "Tg 78 C for amorphous PET (site range 61-80 C, Odian); dCp 0.40 J/(g K) amorphous (ATHAS); dHm0 140 J/g is the standard crystallinity reference; commercial peak Tm 250-255 C; cold crystallization at 125-135 C on reheating a melt-quenched sample at 10 K/min; N2 TGA one main step 420-450 C with 12-15% char. dHm 45 J/g corresponds to a typical 32% crystalline molded part - a quenched amorphous specimen gives dHm minus dHcc near zero."
  },
  {
    id: "pla", name: "Poly(lactic acid) (PLLA)", abbr: "PLA", cls: "thermoplastic",
    note: "Bio-based aliphatic polyester for packaging and 3D printing filament; slow crystallization means most parts are largely amorphous and cold-crystallize on reheat.",
    tg: 60, dCp: 0.5, tm: 170, dHm: 35, dHm0: 93, tcc: 105,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 360, f: 0.99, l: "backbiting transesterification to lactide and cyclic oligomers" }], charN2: 0.01, ashAir: 0, special: null },
    dma: { type: "semicrystalline", glassy: 3500000000, rubbery: 1000000 },
    conf: "medium", src: "Tg 55-62 C and PLLA Tm 165-180 C; dHm0 93 J/g is the standard crystallinity reference. dHm 35 J/g is the total melting endotherm of a cold-crystallized specimen (38% on the 93 J/g basis); the NET crystallinity of an as-molded part is much lower once dHcc is subtracted. Cold crystallization at 95-115 C at 10 K/min for a melt-quenched or as-printed specimen. TGA in N2 is one step at 340-375 C with near-zero char. dCp 0.45-0.55 J/(g K) for the amorphous phase; the value drops in proportion to crystallinity. Rubbery E' is the minimum reached just above Tg - it climbs back toward 1e8 Pa once cold crystallization sets in, which shows as a modulus rebound in the DMA trace."
  },
  {
    id: "pmma", name: "Poly(methyl methacrylate)", abbr: "PMMA", cls: "thermoplastic",
    note: "Optically clear glassy acrylic (Plexiglas) that pyrolyzes almost quantitatively back to MMA monomer.",
    tg: 105, dCp: 0.33, tm: null, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 180, f: 0.05, l: "head-to-head linkage scission" }, { t: 290, f: 0.15, l: "chain-end initiated depolymerization (vinylidene ends)" }, { t: 380, f: 0.79, l: "random scission depolymerization to MMA" }], charN2: 0.01, ashAir: 0, special: null },
    dma: { type: "linear", glassy: 3300000000, rubbery: 1000000 },
    conf: "medium", src: "Tg 105 C (Odian Table 1-3); dCp ~0.31-0.33 J/(g K) (ATHAS). The three-stage N2 degradation (head-to-head, unsaturated chain end, random scission) is reported at 165/270/360 C at 2 K/min (Kashiwagi; Ferriol, Polym. Degrad. Stab.) and shifts to roughly 180/290/380 C at 10-20 K/min. The 5/15/79% split is representative of a conventional free-radical grade only - step fractions depend strongly on how the PMMA was made, and anionic or CTA-terminated grades show essentially one step near 380 C. Monomer recovery 90-98%, so char is ~1%."
  },
  {
    id: "pvc", name: "Poly(vinyl chloride), rigid", abbr: "PVC", cls: "thermoplastic",
    note: "Unplasticized PVC for pipe and profile; only ~5-10% crystalline, and thermally the textbook two-step dehydrochlorination/cracking case.",
    tg: 81, dCp: 0.31, tm: null, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 290, f: 0.63, l: "dehydrochlorination (HCl loss, polyene formation)" }, { t: 460, f: 0.25, l: "polyene cracking to benzene and aromatics" }], charN2: 0.12, ashAir: 0, special: null },
    dma: { type: "linear", glassy: 3000000000, rubbery: 3000000 },
    conf: "high", src: "Tg 81 C (Odian Table 1-3). Two-step N2 pyrolysis: stage 1 at 250-350 C (theoretical HCl loss is 58.4 wt%; observed 60-65% because some benzene evolves with it), stage 2 at 350-500 C, residue ~10-13% at 600 C (Marongiu, Polym. Degrad. Stab. 2003; Yu, Waste Manag. 2016 review). Mass balance checks: 0.63 + 0.25 + 0.12 char = 1.00. Char is grade- and stabilizer-sensitive. Rigid PVC has too little crystallinity to give a usable Tm/dHm, so those are left blank."
  },
  {
    id: "pvdf", name: "Poly(vinylidene fluoride)", abbr: "PVDF", cls: "thermoplastic",
    note: "Melt-processable fluoropolymer for chemical piping, battery binders, and piezoelectric film; alpha and beta crystal forms melt in the same window.",
    tg: -40, dCp: 0.15, tm: 170, dHm: 50, dHm0: 104.7, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 480, f: 0.75, l: "dehydrofluorination and chain scission" }], charN2: 0.25, ashAir: 0, special: null },
    dma: { type: "semicrystalline", glassy: 3500000000, rubbery: 1600000000 },
    conf: "medium", src: "dHm0 104.7 J/g is the standard crystallinity reference for the alpha polymorph (Nakagawa and Ishida); dHm 50 J/g = 48% crystallinity, typical of extruded PVDF. Tg -35 to -40 C and alpha-phase Tm 167-172 C (Brandrup Polymer Handbook; Arkema Kynar data; this site's database lists -35 C / 170 C). N2 TGA: onset ~430-450 C, main loss peaking 470-490 C from HF elimination plus scission, leaving a carbonaceous residue of roughly 20-30% at 600 C that continues to erode slowly at higher temperature."
  },
  {
    id: "pom", name: "Polyoxymethylene (acetal)", abbr: "POM", cls: "thermoplastic",
    note: "Highly crystalline polyacetal for precision gears and springs; unzips to formaldehyde unless end-capped or copolymerized, so stabilization dominates its TGA.",
    tg: -60, dCp: 0.1, tm: 178, dHm: 170, dHm0: 326, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 370, f: 0.99, l: "depolymerization (unzipping) to formaldehyde" }], charN2: 0.01, ashAir: 0, special: null },
    dma: { type: "semicrystalline", glassy: 4500000000, rubbery: 2800000000 },
    conf: "medium", src: "CORRECTED: Tg was given as -83 C attributed to Odian Table 1-3; that attribution could not be confirmed and this site's own polymer database lists -60 C. The POM glass transition is genuinely contested - assignments run from about -85 C (low-temperature relaxation, ATHAS-type analysis) through -60 C to -30 C in supplier literature, because the transition is heavily masked by 50-70% crystallinity. -60 C is the middle-of-road choice and Tg should be treated as low confidence. Tm 175-181 C (commercial homopolymer 175-181 C, copolymer 165-175 C). dHm0 326 J/g (Wunderlich/ATHAS; some workers use 318 J/g); dHm 170 J/g = ~52% crystallinity. dCp is small because so little amorphous phase is present. TGA Tmax is highly stabilization-dependent: unstabilized homopolymer unzips from 250 C, well-stabilized copolymer peaks near 370-390 C in N2."
  },
  {
    id: "pp", name: "Polypropylene (isotactic)", abbr: "iPP", cls: "thermoplastic",
    note: "Isotactic polyolefin for closures, fibers, and living hinges; the alpha monoclinic form dominates in normal cooling.",
    tg: -10, dCp: 0.25, tm: 165, dHm: 100, dHm0: 207, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 460, f: 0.99, l: "random scission at tertiary carbons" }], charN2: 0.01, ashAir: 0, special: null },
    dma: { type: "semicrystalline", glassy: 3600000000, rubbery: 1400000000 },
    conf: "high", src: "CORRECTED: Tg was listed as -1 C, which is not the Odian value. Odian Table 1-3 and this site's own polymer database both give iPP Tg = -10 C; DSC/DMA values span -20 to 0 C depending on crystallinity, heating rate, and whether the loss-modulus or tan-delta peak is used. dHm0 207 J/g (ATHAS/TA TN048); dHm 100 J/g = 48% crystallinity. Commercial iPP peak Tm 160-168 C, well below the 176-186 C equilibrium Tm quoted for perfect isotactic crystals. PP degrades ~20 C below PE in N2 because of the labile tertiary hydrogen."
  },
  {
    id: "ps", name: "Polystyrene (atactic)", abbr: "PS", cls: "thermoplastic",
    note: "Amorphous glassy commodity plastic for cups, cases, and foam; the DMA reference material for a clean single-Tg drop.",
    tg: 100, dCp: 0.3, tm: null, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 420, f: 0.98, l: "random scission with monomer/oligomer unzipping" }], charN2: 0.02, ashAir: 0, special: null },
    dma: { type: "linear", glassy: 3200000000, rubbery: 600000 },
    conf: "high", src: "Tg 100 C (Odian Table 1-3); dCp 0.30 J/(g K) from ATHAS; atactic PS is fully amorphous so no Tm/dHm; TGA one step ~410-430 C in N2, ~1-2% char; rubbery plateau from entanglement modulus G_N0 = 0.2 MPa (Fetters), E' ~ 3G."
  },
  {
    id: "ptfe", name: "Polytetrafluoroethylene", abbr: "PTFE", cls: "thermoplastic",
    note: "Fully fluorinated, non-melt-processable fluoropolymer; the most thermally stable common thermoplastic, and it shows crystal-crystal transitions at 19 and 30 C in DSC.",
    tg: -97, dCp: null, tm: 327, dHm: 50, dHm0: 82, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 575, f: 1, l: "depolymerization to tetrafluoroethylene" }], charN2: 0, ashAir: 0, special: null },
    dma: { type: "semicrystalline", glassy: 2000000000, rubbery: 400000000 },
    conf: "medium", src: "Tm 327 C (Odian Table 1-3); dHm0 82 J/g (Starkweather, J. Polym. Sci. Polym. Phys. 1982). Virgin (never-melted) PTFE is 92-98% crystalline with dHm near 60-80 J/g; sintered/molded stock is 50-65%, hence dHm 50 J/g (61%). TGA in N2 shows no loss below ~490 C and a single clean step peaking 560-590 C at 10 K/min with essentially zero residue. Tg is genuinely contested - the -97 C assignment (amorphous-phase relaxation) competes with values near 120-130 C in the literature, so treat Tg as LOW confidence; dCp is not reliably reported and is left blank rather than guessed."
  },
  {
    id: "iir", name: "Butyl rubber (isobutylene-isoprene)", abbr: "IIR", cls: "elastomer",
    note: "Isobutylene with ~1-2 mol% isoprene for cure sites; the lowest gas permeability and highest damping of the common rubbers.",
    tg: -72, dCp: 0.4, tm: null, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 400, f: 0.99, l: "depolymerization to isobutylene (single stage)" }], charN2: 0.01, ashAir: 0, special: null },
    dma: { type: "network", glassy: 2500000000, rubbery: 1000000 },
    conf: "medium", src: "VERIFIED. Tg -72 C for butyl; polyisobutylene itself is -73 to -74 C (Odian Table 1-3 lists PIB at -73 C), and the isoprene comonomer moves it only slightly - reported butyl range -75 to -67 C. Correctly amorphous in practice: PIB strain-crystallizes but butyl does not usefully, so no Tm/dHm. TGA in N2 shows a single depolymerization stage to monomer with essentially zero char; mass balance closes (0.99 + 0.01 = 1.00). CAUTION on Tmax: it is strongly heating-rate dependent - brominated butyl peaks at 334 C (0.5 C/min) to 389 C (20 C/min) and unhalogenated IIR runs somewhat higher, so 400 C at 10 C/min is a reasonable but soft estimate (+/-25 C). dCp 0.40 matches the PIB literature step; DMA moduli are typical gum values."
  },
  {
    id: "htpb-cured", name: "Cured HTPB polyurethane binder (HTPB/IPDI)", abbr: "HTPB-PU", cls: "elastomer",
    note: "A hydroxyl-terminated liquid polybutadiene prepolymer chain-extended and crosslinked with a diisocyanate into a lightly crosslinked polyurethane network; the standard liquid-rubber route to tough, hydrophobic polyurethane elastomers, sealants, and coatings.",
    tg: -76, dCp: 0.45, tm: null, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 375, f: 0.15, l: "urethane dissociation with cyclization/crosslinking of the backbone" }, { t: 465, f: 0.8, l: "main backbone decomposition of the cyclized residue" }], charN2: 0.05, ashAir: 0, special: null },
    dma: { type: "network", glassy: 2000000000, rubbery: 2000000 },
    conf: "medium", src: "VERIFIED for the UNFILLED GUM network (not a filled compound). Tg: HTPB R-45M prepolymer (~20% 1,2-vinyl, 60% trans-1,4, 20% cis-1,4) sits near -80 C (Bhagawan reports -83 C) and IPDI cure raises it a few degrees, so the cured range is -78 to -70 C; -76 C is central. Blank Tm is correct and is the key cross-check against the BR entry: the vinyl/trans/cis microstructure mix kills crystallinity, so unlike high-cis BR this material has no melting endotherm and no dHm - do not copy BR's melt here. DMA tan-delta peak runs 20-30 C above the DSC Tg (roughly -55 to -45 C at 1 Hz), which is the number material specifications usually quote - the DSC value is what is stored. TGA in N2 at 10 C/min: two stages near 350-375 and 465-470 C for HTPB polyurethanes (neat HTPB gives 387 and 465 C); mass balance closes (0.15 + 0.80 + 0.05 = 1.00) and char is low (<5-8% at 600 C). Heavily filled compounds decompose according to the filler and are NOT represented by this entry. dCp estimated from polybutadiene."
  },
  {
    id: "epdm", name: "Ethylene-propylene-diene rubber", abbr: "EPDM", cls: "elastomer",
    note: "Saturated backbone plus a few percent diene for sulfur cure; the go-to weather-, ozone-, and steam-resistant rubber.",
    tg: -54, dCp: 0.45, tm: null, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 473, f: 0.98, l: "main backbone decomposition" }], charN2: 0.02, ashAir: 0, special: null },
    dma: { type: "network", glassy: 2500000000, rubbery: 2000000 },
    conf: "medium", src: "VERIFIED as an AMORPHOUS (45-55 wt% ethylene) grade. Tg -54 C (DSC midpoint of the amorphous fraction); reported range -60 to -45 C depending on ethylene content across commercial grades (45-75 wt% ethylene) - hence medium confidence. Blank Tm/dHm is correct for the amorphous grade modelled here; high-ethylene grades would add a broad PE-type melt near 40-60 C with dHm ~10-30 J/g against the PE reference (293 J/g), which is deliberately NOT entered because it would not apply to this entry. TGA in N2: onset ~455 C, Tmax ~475 C - the highest of the common rubbers because the backbone is saturated; mass balance closes (0.98 + 0.02 = 1.00). dCp and the DMA moduli are estimates typical of unfilled gum EPDM."
  },
  {
    id: "nr", name: "Natural rubber (cis-1,4-polyisoprene)", abbr: "NR", cls: "elastomer",
    note: "The benchmark diene rubber; it strain-crystallizes, which is why unfilled gum NR is unusually tough.",
    tg: -70, dCp: 0.45, tm: 28, dHm: 18, dHm0: 64, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 377, f: 0.98, l: "main chain scission / depolymerization to isoprene and dipentene" }], charN2: 0.02, ashAir: 0, special: null },
    dma: { type: "network", glassy: 2500000000, rubbery: 1200000 },
    conf: "high", src: "VERIFIED. Tg/Tm from Brandrup Polymer Handbook and Odian Table 1-3 (-73 to -70 C, Tm 28 C); DSC midpoint at 10 C/min typically reads -65 to -62 C. dHm0 = 64 J/g checks out on a per-mole basis (ATHAS 4.40 kJ/mol / 68.1 g/mol = 64.6 J/g); measured dHm ~15-20 J/g after cold crystallization, so Xc ~0.28 - self-consistent. TGA DTG Tmax 377 C in N2 (rubber pyrolysis series, 10 C/min); gum NR leaves essentially no residue and mass balance closes (0.98 + 0.02 char = 1.00). DMA moduli are typical unfilled gum-vulcanizate values (~3 GPa glassy, 1-5 MPa rubbery), not measurements on a specific compound. dCp 0.45 J/(g K) vs literature ~0.48 - order correct."
  },
  {
    id: "nbr", name: "Nitrile rubber (acrylonitrile-butadiene, ~34% ACN)", abbr: "NBR", cls: "elastomer",
    note: "Oil- and fuel-resistant rubber; acrylonitrile content trades low-temperature flexibility against solvent resistance.",
    tg: -30, dCp: 0.42, tm: null, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 465, f: 0.92, l: "main decomposition with nitrile cyclization" }], charN2: 0.08, ashAir: 0, special: null },
    dma: { type: "network", glassy: 3000000000, rubbery: 2500000 },
    conf: "medium", src: "VERIFIED. Tg -30 C for a medium-ACN (~34%) grade; medium-nitrile grades are reported -35 to -25 C, low nitrile (18-25% ACN) -50 to -40 C, high nitrile (40-50%) -20 to -10 C, with roughly +2 to +3 C per additional wt% ACN above 32% - the value sits correctly on that trend line. Correctly amorphous (no Tm). TGA in N2: initial decomposition 360-380 C, main DTG peak ~465-475 C, complete by ~500 C. Char is genuinely higher than the pure dienes (reported 5-12% for gum NBR) because the nitrile groups cyclize to a ladder/char structure as in PAN; 0.08 is a mid-range value, and mass balance closes (0.92 + 0.08 = 1.00). dCp 0.42 is an ESTIMATE from a PBD/PAN weighting, not a measured step; DMA moduli are typical unfilled-gum values."
  },
  {
    id: "br", name: "Polybutadiene (cis-1,4, high-cis BR)", abbr: "BR", cls: "elastomer",
    note: "The lowest-Tg common hydrocarbon rubber; blended into treads for abrasion resistance and low rolling loss.",
    tg: -102, dCp: 0.5, tm: 2, dHm: 35, dHm0: 170, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 465, f: 0.97, l: "main chain scission with competing cyclization/crosslinking" }], charN2: 0.03, ashAir: 0, special: null },
    dma: { type: "network", glassy: 2500000000, rubbery: 1500000 },
    conf: "medium", src: "VERIFIED. Tg -102 C (handbook/ATHAS range -106 to -100 C; semicrystalline samples read ~-108 C by TMDSC). Tm 2 C is the HANDBOOK value and is what is used here; note that real DSC on commercial high-cis grades usually shows melting between -10 and 0 C after low-temperature crystallization, with equilibrium Tm ~12 C - so treat the melt position as +/-10 C. dHm0 = 170 J/g checks out per mole (ATHAS 9.2 kJ/mol / 54.1 g/mol = 170 J/g); dHm 35 J/g implies Xc = 0.21, inside the reported 0.20-0.28 window for 93-98% cis grades, so dHm < dHm0 and the pair is self-consistent. Only high-cis grades crystallize; 1,2-vinyl content suppresses it entirely. TGA DTG Tmax 465 C in N2, mass balance closes (0.97 + 0.03 = 1.00). dCp 0.50 is an ATHAS-type estimate (lit ~0.48)."
  },
  {
    id: "cr", name: "Polychloroprene", abbr: "CR / neoprene", cls: "elastomer",
    note: "Chlorine on the backbone buys oil, flame, and weather resistance, and makes it the one common rubber that leaves a large char.",
    tg: -43, dCp: 0.35, tm: 45, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 340, f: 0.38, l: "dehydrochlorination (HCl loss)" }, { t: 450, f: 0.32, l: "polyene chain fragmentation / tar release" }], charN2: 0.3, ashAir: 0, special: null },
    dma: { type: "network", glassy: 3000000000, rubbery: 2000000 },
    conf: "medium", src: "VERIFIED. Tg -43 C and Tm 45 C agree with handbook values (Tg -45 to -40 C, Tm 43-45 C) and Tg < Tm as required. dHm and dHm0 are DELIBERATELY BLANK, not missing: reported enthalpies of fusion for 100%-crystalline polychloroprene scatter widely (~70-100 J/g depending on source), crystallinity is low (~10-15%) and develops slowly on storage so many scans show no melt at all - a guessed pair here would produce a fabricated melting peak. Any generated curve should show the Tm position without an enthalpy-scaled endotherm. TGA in N2 is genuinely two-stage: rapid dehydrochlorination over 275-400 C followed by a defined second step near 450 C, leaving ~30% carbonaceous char at 600 C. Step 1 at 0.38 sits just below the theoretical HCl mass fraction of the repeat unit (36.46/88.54 = 0.412), which is the physically correct relationship (some chlorine is retained in the char); mass balance closes (0.38 + 0.32 + 0.30 = 1.00). That char burns off in air so ashAir ~0 for the gum polymer (compounded CR with MgO/ZnO would leave several percent). dCp 0.35 matches ATHAS (31.8 J/mol K / 88.5 = 0.36). Step fractions medium confidence."
  },
  {
    id: "pdms-rubber", name: "Silicone rubber (crosslinked polydimethylsiloxane)", abbr: "PDMS / VMQ", cls: "elastomer",
    note: "Cured PDMS gum: the widest service range of any common elastomer, and the only one whose DSC shows Tg, cold crystallization, and melting all below -30 C.",
    tg: -127, dCp: 0.3, tm: -40, dHm: 25, dHm0: 61.3, tcc: -95,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 420, f: 0.2, l: "early depolymerization to cyclic siloxanes" }, { t: 555, f: 0.77, l: "main chain unzipping (D3/D4 cyclics)" }], charN2: 0.03, ashAir: 0.3, special: null },
    dma: { type: "network", glassy: 1500000000, rubbery: 1000000 },
    conf: "medium", src: "VERIFIED with one caveat (ashAir). Tg -127 C (Odian Table 1-3); DSC typically reads -125 to -120 C. Thermal sequence is correctly ordered Tg (-127) < Tcc (-95) < Tm (-40): cold crystallization from the quenched glass appears between -110 and -80 C, melting -60 to -40 C, often a double peak near -47 and -39 C. dHm0 = 61.3 J/g is the classic 100%-crystalline reference and checks out per mole (~4.55 kJ/mol / 74.15 g/mol); a 2025 study argues for 37.4 J/g, so any crystallinity number depends on the reference chosen. dHm 25 J/g gives Xc = 0.41 against 61.3 - plausible and dHm < dHm0. TGA in N2: unzipping to volatile cyclics, main loss 400-650 C, residue for unfilled PDMS ~1-5% silicon oxycarbide; N2 mass balance closes (0.20 + 0.77 + 0.03 = 1.00). ashAir 0.30 is an ESTIMATE ONLY - treat as LOW confidence: reported residues for unfilled PDMS burned in air scatter roughly 20-40% (one TGA series averages ~38%) against a stoichiometric SiO2 ceiling of 0.81, and the number depends heavily on network structure and ramp rate. Filled VMQ compounds (20-30 phr fumed silica) leave far more in both atmospheres. dCp 0.30 is an estimate (lit ~0.27); DMA moduli are typical of unfilled cured gum."
  },
  {
    id: "sbr", name: "Styrene-butadiene rubber (emulsion, ~23.5% styrene)", abbr: "SBR", cls: "elastomer",
    note: "The workhorse tire rubber; bound-styrene content is the main lever on Tg and wet grip.",
    tg: -50, dCp: 0.45, tm: null, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 444, f: 0.96, l: "main decomposition (butadiene and styrene fragments)" }], charN2: 0.04, ashAir: 0, special: null },
    dma: { type: "network", glassy: 3000000000, rubbery: 2000000 },
    conf: "medium", src: "VERIFIED. Tg: E-SBR at 23-28% styrene is reported -55 to -45 C (DSC midpoint); handbook values for SBR-1500/1502 run -55 to -50 C, so -50 C is a defensible central value. Strongly composition-dependent: low-styrene S-SBR reaches -65 C, high-styrene (35-45%) grades -35 to -10 C, which is why this stays medium confidence. Correctly amorphous - no Tm, no dHm/dHm0, consistent with the class. TGA DTG Tmax 444 C in N2, consistent with the same NR/SBR/BR pyrolysis series (377/444/465 C); char slightly above the pure dienes because of the styrene units. Mass balance closes (0.96 + 0.04 = 1.00). DMA moduli are typical unfilled-gum values, not a specific measurement."
  },
  {
    id: "viton-a", name: "Viton A fluoroelastomer (VDF-HFP dipolymer)", abbr: "Viton A", cls: "elastomer",
    note: "Vinylidene fluoride / hexafluoropropylene dipolymer, roughly 60/40 by weight (3.5:1 molar VDF:HFP). The HFP comonomer disrupts the PVDF crystal, so unlike PVDF this is fully amorphous - a Tg step and nothing else, no melting endotherm. The standard fluoroelastomer for chemical- and heat-resistant O-rings, seals, gaskets and hose liners, and a common reference elastomer in fluid-compatibility and chemical-resistance testing. One of the most thermally stable elastomers here: nothing happens until pyrolysis well above 400 C.",
    tg: -27, dCp: null, tm: null, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 466, f: 0.97, l: "backbone pyrolysis" }], charN2: 0.03, ashAir: 0, special: null },
    dma: { type: null, glassy: null, rubbery: null },
    conf: "medium", src: "Tg -27 C is the calorimetric value (246 K) from Burnham & Weese, Thermochim. Acta 426 (2004), OSTI 15011541. Hoffman, Polym. Eng. Sci. 43(1) 139-156 (2003) reports the DMA loss-modulus peak at -22 C at 0.1 Hz with a beta relaxation near -80 C; DMA reads above the calorimetric Tg, so the two are consistent and the DSC value is carried here. Composition check: 3.5:1 molar VDF:HFP = 3.5(64.03):1(150.02) = 59.9:40.1 wt%. Fully amorphous - VDF/HFP resins above ~15-19 mol% HFP show no DSC melting endotherm - so tm and dHm are correctly blank. TGA Tmax 466 C is what Burnham & Weese themselves MEASURED at 10 K/min in nitrogen (they read 440 C at 2 K/min; widely quoted 470-490 C figures come from laboratory PVDF-HFP grades, not this commercial dipolymer). Char is heating-rate dependent by their Eq. 2, char = 0.02 + 0.08(1 - e^(-1/Hr)) with Hr in K/min, giving 0.03 at 10 K/min and approaching 0.10 at very slow ramps - quote the ramp with any residue. Their model also needs a minor early parallel reaction whose peak temperature is not resolved, so it is folded into the main step rather than drawn at an invented temperature. DMA moduli are deliberately left null: Hoffman's plateau values are paywalled and were not going to be guessed."
  },
  {
    id: "ctpb", name: "Carboxyl-terminated polybutadiene", abbr: "CTPB", cls: "binder",
    note: "Telechelic liquid polybutadiene with terminal -COOH, cured with epoxides or aziridines. A reactive liquid rubber prepolymer of the same family as HTPB, used where an acid cure is wanted instead of the usual isocyanate/urethane cure, and as a rubber-phase toughener for epoxy systems. Thermally it behaves as polybutadiene, a pure pyrolysis with no exotherm. DMA moduli describe the cured network.",
    tg: -75, dCp: 0.48, tm: null, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 385, f: 0.15, l: "depolymerization / cyclization" }, { t: 465, f: 0.82, l: "backbone chain scission" }], charN2: 0.03, ashAir: 0, special: null },
    dma: { type: "network", glassy: 2000000000, rubbery: 1500000 },
    conf: "medium", src: "Tg -70 to -90 C depending on molecular weight and cis/trans/vinyl microstructure (CTPB property reviews); -75 C taken as representative of a commercial 2-5 kg/mol grade. TGA, dCp and DMA are all inherited from the polybutadiene backbone as for HTPB rather than measured on CTPB itself, which is why this sits at medium and not high."
  },
  {
    id: "cab", name: "Cellulose acetate butyrate", abbr: "CAB", cls: "binder",
    note: "Mixed cellulose ester, a general-purpose lacquer and coating resin and a common inert thermoplastic binder in filled and pigmented systems. Amorphous and stiff, so the DSC 'melt' quoted on supplier datasheets is a softening/flow range, not a crystalline transition, and above ~250 C it overlaps chemical decomposition, leaving no usable rubbery plateau in practice.",
    tg: 130, dCp: null, tm: null, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 90, f: 0.02, l: "moisture" }, { t: 360, f: 0.86, l: "ester side-group loss + chain scission" }], charN2: 0.12, ashAir: 0, special: null },
    dma: { type: "linear", glassy: 3000000000, rubbery: 1000000 },
    conf: "medium", src: "Eastman cellulose ester TDS table: Tg is strongly grade-dependent, 85 C (CAB-551-0.01, 52% butyryl), 101 C (CAB-551-0.2), 115 C (CAB-531-1), 130 C (CAB-381-0.5 and -2), 141 C (CAB-381-20), 161 C (CAB-171-15, 17% butyryl); 130 C is the mid-range 37-38% butyryl grade family used in coating and binder work, and a user with a different grade should expect anywhere in 85-161 C. Quoted 'melting ranges' run 127-205 C and are softening ranges, so tm is correctly left blank. TGA: DTG maximum ~357 C for a CAB derivative; onset 320-340 C rising with butyryl content; residue is the usual cellulose-ester char. Independent DSC/DMA work puts CAB Tg at 136 C. Confidence held at medium because of the grade spread, not because any one number is doubtful."
  },
  {
    id: "htpb", name: "Hydroxyl-terminated polybutadiene", abbr: "HTPB", cls: "binder",
    note: "Liquid hydroxyl-terminated polybutadiene prepolymer (R-45M / R-45HTLO), a telechelic liquid rubber cured with diisocyanates (IPDI or TDI) into a polyurethane network. This is general polyurethane chemistry: sealants, potting and encapsulation compounds, waterproofing membranes, adhesives and tough highly filled elastomers. Its decomposition is endothermic pyrolysis, not an exotherm, which makes it a convenient thermally inert reference polymer when DSC traces of filled systems are compared. The DMA moduli below describe the cured network, not the neat liquid prepolymer.",
    tg: -75, dCp: 0.48, tm: null, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 380, f: 0.15, l: "depolymerization / cyclization" }, { t: 465, f: 0.82, l: "backbone chain scission" }], charN2: 0.03, ashAir: 0, special: null },
    dma: { type: "network", glassy: 2000000000, rubbery: 2000000 },
    conf: "high", src: "Tg -75 C from HTPB R-45M supplier TDS and the 2025 Eur. Polym. J. review of hydroxyl-terminated polybutadiene (quotes HTPB ~ -70 C); microstructure spread -95 to -25 C (Polym. Chem. 2021), high-cis grades to -101 C. TGA anchored to TG-DTG of cured HTPB in argon at 10 K/min (stages peaking 295 and 464 C, near-zero residue); the 295 C stage belongs to the cured urethane, so the uncured prepolymer is modelled with a smaller low-T stage. Treat the 0.15/0.82 split as modelled, the near-zero char as measured. dCp is the ATHAS 1,4-polybutadiene value (ATHAS gives ~0.5 J/(g K); 0.48 used). DMA plateau typical of an IPDI-cured HTPB gum (E' ~ 5 GPa at -120 C falling to a few MPa above Tg; DMA Tg -75 to -85 C at 0.1 Hz). Verified 2026: Tg, char yield and stage temperatures all reproduce in the open literature."
  },
  {
    id: "htpe", name: "Hydroxyl-terminated polyether", abbr: "HTPE", cls: "binder",
    note: "PTHF-PEG-PTHF block copolyether diol cured with a diisocyanate, a polyether soft-segment polyol of the family used to build polyurethane elastomers. The polyether backbone breaks down at a much lower temperature than the polybutadiene backbone of HTPB, so thermal stability rather than Tg is what mainly separates the two. Expect a decomposition onset roughly 55-85 C below HTPB.",
    tg: -65, dCp: null, tm: null, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 210, f: 0.1, l: "urethane dissociation / additive loss" }, { t: 405, f: 0.87, l: "polyether backbone scission" }], charN2: 0.03, ashAir: 0, special: null },
    dma: { type: "network", glassy: 2000000000, rubbery: 2000000 },
    conf: "medium", src: "Tg -60 to -75 C depending on the PEG:PTHF ratio; HTPE polyurethane elastomer measured at -69 C and the TPEG prepolymer at -73.5 C (component homopolymers bracket it: PTMEG ~ -84 C, PEG ~ -60 C). TGA stages from a cured HTPB/HTPE comparison in argon at 10 K/min (HTPE peaks 209.6 and 408.2 C vs HTPB 294.9 and 463.9 C) - note the 210 C stage belongs to the cured urethane, so a neat HTPE diol will show less of it. PEG-rich HTPE can show a small melting endotherm near room temperature; no sourced value, so tm is left blank rather than guessed."
  },
  {
    id: "kel-f-800", name: "Kel-F 800 (chlorotrifluoroethylene-vinylidene fluoride copolymer)", abbr: "Kel-F 800", cls: "binder",
    note: "CTFE/VDF copolymer, nominally 25 +/- 5 mol% VDF, a solvent-soluble thermoplastic fluoropolymer used as a chemically resistant matrix and coating resin. The one binder here whose Tg sits at ROOM TEMPERATURE (~28 C), so a part made with it crosses its own glass transition during ordinary handling and its stiffness is strongly temperature-dependent across the service range. Only 10-18% crystalline, so the melting endotherm near 100 C is small; the crystallites are what hold the modulus up between Tg and Tm.",
    tg: 28, dCp: null, tm: 100, dHm: 6, dHm0: 42, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 300, f: 0.015, l: "emulsifier and low-MW volatiles (modelled midpoint of a 250-350 C loss)" }, { t: 443, f: 0.985, l: "backbone decomposition" }], charN2: 0, ashAir: 0, special: null },
    dma: { type: "semicry", glassy: 5400000000, rubbery: 78000000 },
    conf: "medium", src: "W. E. Cady & L. E. Caley, 'Properties of Kel F-800 Polymer', UCRL-52301, LLL, 21 July 1977 (OSTI 5305005). Tg 28 C is from LLL's own 10 K/min DSC (Table 14 spans 25-34, 22-32, 24-32 C; midpoints 27-29.5); the frequently quoted ~31 C average pools 3M runs made at 20 K/min, so the rate must be stated. Independently, LA-UR-98-3971 gives 'the Tg of Kel F at 28 C' against 25 C for the filled molding powder made with it. tm 100 C is the melting PEAK (Table 17 average 101.5 +/- 2.5); the report's separately calculated Tm is 95.2 +/- 2.8 C, so peak and Tm are not interchangeable here. dHm 6 J/g is mid-range of the 4.2-7.5 J/g lot spread (1.0-1.8 cal/g), and dHm0 42 J/g is implied by LLL's stated basis of 10% crystallinity per cal/g, which puts these lots at 10-18% crystalline. decompT is left blank on purpose: the report gives a TGA weight-loss onset of 155-210 C (air, 15 K/min) and a DTA decomposition onset of 315-375 C (static air, 10 K/min), and neither is a clean nitrogen decomposition peak. The 443 C step is the DTA decomposition peak - no DTG peak temperature is published anywhere in UCRL-52301 - and complete mass loss is reached by 448-455 C, hence zero residue. Moduli are converted from the published torsion-pendulum SHEAR data at 0.2 Hz using E' = 2(1+nu)G': glassy 5.4 GPa from G' ~2000 MPa at -140 to -160 C with nu ~0.35, and rubbery 78 MPa from the 23-29 MPa crystalline plateau at 50-60 C with nu = 0.5. Treat both as converted, not measured."
  },
  {
    id: "pban", name: "Polybutadiene-acrylonitrile-acrylic acid terpolymer", abbr: "PBAN", cls: "binder",
    note: "Carboxy-functional butadiene-acrylonitrile terpolymer cured with an epoxide (e.g. DER-331), the same carboxyl-plus-epoxide cure chemistry that CTBN liquid rubbers use to toughen epoxy resins and adhesives. Nitrile content is the Tg lever: more acrylonitrile raises Tg and hurts cold-temperature response, so PBAN grades run low in AN. DMA moduli describe the epoxide-cured network.",
    tg: -55, dCp: null, tm: null, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 400, f: 0.15, l: "cyclization / volatiles" }, { t: 465, f: 0.8, l: "backbone chain scission" }], charN2: 0.05, ashAir: 0, special: null },
    dma: { type: "network", glassy: 2200000000, rubbery: 2000000 },
    conf: "low", src: "Tg is an ESTIMATE, not a measurement. Published values scatter roughly -65 to -40 C with acrylonitrile content (secondary sources quote ~ -40 C; the primary study, J. Therm. Anal. Calorim. 2018 'Study of thermal analysis and kinetic decomposition of PBAN', measures the nitrile-content dependence explicitly but is paywalled and its numbers could not be read). Chemically it must sit between polybutadiene (-85 C) and an 18% AN nitrile rubber (-40 C); a typical 10-15% AN PBAN interpolates to about -55 C. TGA modelled on the polybutadiene backbone; decomposition kinetics (TGA 0.5-10 K/min, Ea rising 100 to 200 kJ/mol) from Combust. Flame 1999. Confidence deliberately left low: do not quote this Tg as a literature value."
  },
  {
    id: "pu-polyester", name: "Polyurethane, polyester-based", abbr: "PU (polyester)", cls: "binder",
    note: "Segmented poly(ester urethane) of the Estane 5703 type, a poly(butylene adipate) soft segment with MDI/butanediol hard segments. A general-purpose cast or thermoplastic elastomer binder for coatings, adhesives and highly filled composites. Two transitions matter: the soft-segment Tg near -35 C sets low-temperature response, and a hard-segment transition near 70 C sets the upper service limit.",
    tg: -35, dCp: null, tm: null, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 330, f: 0.42, l: "urethane dissociation / hard segment" }, { t: 410, f: 0.53, l: "polyester soft-segment scission" }], charN2: 0.05, ashAir: 0, special: null },
    dma: { type: "linear", glassy: 2000000000, rubbery: 20000000 },
    conf: "medium", src: "Reported soft-segment Tg spans -26 to -38 C and -35 C is a representative DSC-like value, not a single measurement: Estane 5703 quoted at -31 C as an amorphous thermoplastic polyester PU, -37.6 C by DSC in one study, and -29 C and -26 C in the 1 Hz shear loss modulus for the neat polymer and for a highly filled composite of the same binder respectively (DMA reads 5-10 C high). In that composite (94.9% crystalline filler, 2.5% Estane 5703P, 2.5% of a compatible liquid plasticizer, 0.1% Irganox 1010) the same relaxation shifts to -40 +/- 3 C because the added plasticizer softens the soft segment. Hard-segment Tg ~70 C in the loss modulus. tm is left blank, Estane-type polyester PU is essentially amorphous, though hard-domain endotherms appear between 100 and 180 C. The high rubbery plateau (tens of MPa) reflects hard-domain physical crosslinks. TGA follows the standard PU sequence of urethane dissociation then soft-segment breakdown."
  },
  {
    id: "doa", name: "Dioctyl adipate (bis(2-ethylhexyl) adipate)", abbr: "DOA", cls: "plasticizer",
    note: "Inert aliphatic diester plasticizer, a low-temperature plasticizer for flexible PVC and the default plasticizer for hydroxyl-terminated polybutadiene (HTPB) binders cured with diisocyanates (typically 2-4% of a highly filled compound, which is 10-35% of the binder phase). Cuts uncured mix viscosity and drops the cured binder Tg; downsides are vacuum outgassing, migration into adjacent bonded layers, and mild retardation of the isocyanate cure. Under TGA it volatilizes cleanly, so there is no decomposition exotherm to model.",
    tg: null, dCp: null, tm: -68, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 260, f: 0.99, l: "evaporation" }], charN2: 0.01, ashAir: 0, special: null },
    dma: { type: null, glassy: null, rubbery: null },
    conf: "medium", src: "Melting point -67.8 C (205.3 K), boiling point ~405-417 C (405 C most commonly listed), C22H42O4 MW 370.6, all confirmed 2026 across supplier TDS and reference entries. TGA behaviour is volatilization, not decomposition: DOA is reported to leave the sample around 200 C in blend TGA work, with the loss centred nearer 250-280 C for the neat ester at 10 K/min, and essentially no residue. Hansen solubility parameter close to HTPB, which is why it is the default plasticizer for HTPB binders. No sourced glass transition for the neat ester, so tg is left blank rather than estimated."
  },
  {
    id: "idp", name: "Isodecyl pelargonate", abbr: "IDP", cls: "plasticizer",
    note: "Inert aliphatic monoester plasticizer (isodecyl nonanoate) used in highly filled polyurethane elastomer systems where processability is the priority. It gives the lowest slurry viscosity of the common inert ester plasticizers and a lower density than DOA. It is also a mild cure retardant, which is sometimes useful for extending pot life and sometimes a nuisance. The widely repeated claim that IDP is less volatile than DOA traces to supplier marketing copy and is not supported by its lower molecular weight, so treat volatility ranking as unsettled.",
    tg: null, dCp: null, tm: null, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 245, f: 0.99, l: "evaporation" }], charN2: 0.01, ashAir: 0, special: null },
    dma: { type: null, glassy: null, rubbery: null },
    conf: "low", src: "C19H38O2, MW 298.5, CAS 109-32-0; clear low-viscosity liquid. Supplier SDS sheets explicitly list freezing point as 'not available', and no published Tg, pour point or TGA curve for neat IDP could be found, so tg and tm are left blank and the single TGA step is INFERRED from molecular weight and volatility relative to DOA (it is not a measured value). CORRECTED 2026: the previous note repeated a 'lower vapour pressure than DOA' claim that traces only to hobby-supplier marketing copy; IDP's MW of 298.5 versus DOA's 370.6 argues the opposite, so the TGA step is placed BELOW DOA's (245 vs 260 C) and the volatility ranking should be treated as unverified either way. Formulation guidance (viscosity ranking vs DOA/DBP, 10-35% of the binder phase, 2-4% of the total filled formulation) from Defence Science Journal and published plasticizer reviews for filled hydroxyl-terminated polybutadiene binder systems. Everything numeric here is low confidence by construction."
  },
  {
    id: "app", name: "Ammonium polyphosphate", abbr: "APP", cls: "additive",
    note: "Intumescent flame retardant (crystalline form II is the water-resistant high-DP grade) used in polyolefins, epoxies and coatings, and occasionally as a low-energy oxidizer. Decomposition is multi-step and ENDOTHERMIC, so there is no exothermic decomposition peak to report: from about 250-450 C it strips NH3 and H2O (~18%, DTG peak near 330 C) and crosslinks to polyphosphoric acid, which is the species that phosphorylates and chars the host polymer; from 450-700 C the polyphosphoric acid dehydrates and volatilises P2O5, leaving roughly 31-39% residue at 700 C that continues to erode to about 20-25% by 900 C. Exact values depend on chain length and on whether the grade is melamine- or silane-coated.",
    tg: null, dCp: null, tm: null, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 330, f: 0.18, l: "NH3 and H2O loss, crosslinking to polyphosphoric acid" }, { t: 620, f: 0.45, l: "dehydration and P2O5 volatilization" }, { t: 800, f: 0.15, l: "continued phosphate volatilization" }], charN2: 0.22, ashAir: 0.2, special: null },
    dma: { type: null, glassy: null, rubbery: null },
    conf: "medium", src: "Polymers/PMC6479977 (APP in PA11: first step 200-450 C, 18% loss, DTG max ~327 C; ~18% total NH3 release; P2O5 volatilised 450-700 C; residue at 700 C 31-39% under N2) and Prog. Polym. Sci. 2024 review 'Ammonium polyphosphates: correlating structure to application'. No changes: steps sum to 0.78 and charN2 0.22 gives exactly 1.00, and the intermediate residue after the first two steps (1 - 0.63 = 0.37) falls inside the cited 31-39% at 700 C, so the step set is internally consistent with its own source. decompT/decompH correctly blank because decomposition is endothermic. Residue is grade- and coating-dependent, hence medium."
  },
  {
    id: "caco3", name: "Calcium carbonate", abbr: "CaCO3", cls: "additive",
    note: "Ground or precipitated chalk, the cheapest and most common mineral filler in thermoplastics and rubber, and an acid scavenger in PVC. The signature TGA feature is calcination: a single clean step near 700-850 C releasing CO2 for a 44.0% mass loss, leaving CaO. That step is strongly ENDOTHERMIC - about +1781 J/g absorbed - so on DSC it is a large DOWNWARD peak, not a decomposition exotherm, which is why the decompT/decompH exotherm fields are deliberately left blank here. The endotherm is a useful check that a DSC and TGA are looking at the same event. It has no Tg and no melt (it decarbonates long before its 1339 C pressurized melting point).",
    tg: null, dCp: null, tm: null, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 800, f: 0.44, l: "decarbonation, CO2 loss to CaO" }], charN2: 0.56, ashAir: 0.56, special: "carbonate" },
    dma: { type: null, glassy: null, rubbery: null },
    conf: "high", src: "Stoichiometry verified: M(CO2)/M(CaCO3) = 44.01/100.09 = 0.4397; residue CaO = 0.5603. decompH CHANGED from 1780 to blank: the value itself is correct (+178.3 kJ/mol / 100.09 g/mol = 1781 J/g, CRC/NIST formation enthalpies) but it is ENDOTHERMIC, while the decompT/decompH pair is defined for exothermic decomposition, and decompT was already blank. Leaving 1780 in an exotherm field risks the generator drawing a huge false exotherm at the calcination step; the magnitude is preserved in the note. Peak temperature 700-850 C at 10-20 K/min in flowing N2 (J. Therm. Anal. Calorim. 2012; cement-paste TGA literature); exact Tmax is strongly heating-rate, particle-size and CO2-partial-pressure dependent."
  },
  {
    id: "carbon-black", name: "Carbon black", abbr: "CB", cls: "additive",
    note: "Reinforcing filler, black pigment and UV stabiliser in rubber and polyolefins, and an opacifier and (in conductive grades) an antistatic filler in compounded thermoplastics. Its TGA behaviour is the basis of ASTM D6370/D1603 compositional analysis of rubber: under nitrogen it is essentially inert to well past 900 C (only ~1% moisture plus ~1% surface oxygen groups), then when the purge is switched to air it burns off completely between about 550 and 750 C with a peak near 650 C, leaving only the inorganic ash (typically 0.1-1% for furnace blacks). That N2-then-air switch is what separates polymer, carbon black and ash in one run. No Tg, no melt - graphitic carbon sublimes above 3500 C.",
    tg: null, dCp: null, tm: null, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 150, f: 0.01, l: "moisture" }, { t: 700, f: 0.01, l: "surface oxygen groups and volatiles" }], charN2: 0.98, ashAir: 0.005, special: null },
    dma: { type: null, glassy: null, rubbery: null },
    conf: "high", src: "ASTM D6370 (compositional analysis of rubber by TGA: organics 50-550 C in N2, carbon black 310-790 C in air, ash above 790 C) and ASTM D1603 carbon black content. Ash levels from carbon black grade specifications (furnace blacks typically <0.5 wt%). No changes: the large charN2 (0.98) versus ashAir (0.005) gap is correct rather than contradictory, since the two describe different atmospheres and CB survives N2 but burns in air. Steps + charN2 = 1.00."
  },
  {
    id: "fe2o3", name: "Iron(III) oxide (hematite)", abbr: "Fe2O3", cls: "additive",
    note: "Red iron oxide is a synthetic inorganic pigment (Pigment Red 101) used as a colorant and inert filler in coatings, rubber and filled plastics, and it is the active phase in the promoted iron oxide catalysts used industrially to dehydrogenate ethylbenzene to styrene. It is essentially a flat line on TGA in both nitrogen and air to 900 C - no Tg, no melt in range, no mass change - which is exactly why it is a useful internal reference when quantifying it as a filler by TGA. It does not melt cleanly; above roughly 1400 C in air it loses oxygen to magnetite (Fe3O4) before the nominal 1565 C melting point.",
    tg: null, dCp: null, tm: 1565, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [], charN2: 1, ashAir: 1, special: "catalyst" },
    dma: { type: null, glassy: null, rubbery: null },
    conf: "high", src: "CRC Handbook (Fe2O3, M = 159.69 g/mol, mp 1565 C with decomposition to Fe3O4) - verified. Thermal inertness to 900 C is standard practice in ASTM E1131-type filler quantification; catalytic role from the industrial iron oxide dehydrogenation catalyst literature (ethylbenzene to styrene). No changes: all fields checked and consistent."
  },
  {
    id: "silica", name: "Silica (fumed / precipitated SiO2)", abbr: "SiO2", cls: "additive",
    note: "Reinforcing and thixotropic filler - fumed silica in silicones, sealants, adhesives and liquid resin systems, precipitated silica in rubber. Thermally inert: essentially a flat TGA line in both nitrogen and air, with only 1-2% loss for fumed grades (physisorbed water below 150 C, then slow silanol condensation from 200-1000 C). Precipitated grades run higher, around 5% loss on ignition, so the residue value is grade dependent. These grades are AMORPHOUS and have no melting point at all - fused silica merely softens through a glass transition near 1150-1200 C, far above any DSC scan. Only crystalline filler grades show sharp features: quartz melts at 1713 C and gives a small alpha-to-beta inversion endotherm at 573 C.",
    tg: null, dCp: null, tm: null, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 110, f: 0.01, l: "physisorbed water" }, { t: 600, f: 0.01, l: "silanol condensation" }], charN2: 0.98, ashAir: 0.98, special: null },
    dma: { type: null, glassy: null, rubbery: null },
    conf: "medium", src: "tm CHANGED from 1713 to blank - this was an internal contradiction: 1713 C is the melting point of crystalline QUARTZ, but this entry is explicitly fumed/precipitated (amorphous) silica, which the note itself says has no melting point. An amorphous material must not carry a tm, and the quartz value has been moved into the note. Residue data: Evonik AEROSIL technical bulletin (loss on ignition ~1000 C; fumed silica about one third that of precipitated silicas, which run ~5 wt%); silanol-quantification TGA method (200-600 C geminal/vicinal, 600-1000 C isolated silanols). Residue is grade dependent, hence medium confidence."
  },
  {
    id: "tio2", name: "Titanium dioxide", abbr: "TiO2", cls: "additive",
    note: "White pigment and opacifier in coatings and filled plastics; also an inert TGA reference. Flat in both nitrogen and air to 900 C apart from ~0.5% surface moisture, and no Tg or melt in range (rutile melts at 1843 C). The one DSC feature worth knowing is the irreversible anatase-to-rutile phase transition between about 600 and 750 C: a broad, fairly WEAK exotherm - roughly 30-80 J/g - with NO accompanying mass change, which is a good way to distinguish an anatase pigment from a rutile one. Because it is small and broad it is easily missed on a fast scan. Surface-treated (alumina/silica-coated) pigment grades lose slightly more below 300 C.",
    tg: null, dCp: null, tm: 1843, dHm: null, dHm0: null, tcc: null,
    decompT: null, decompH: null,
    tga: { steps: [{ t: 120, f: 0.005, l: "surface moisture" }], charN2: 0.995, ashAir: 0.995, special: null },
    dma: { type: null, glassy: null, rubbery: null },
    conf: "medium", src: "CRC Handbook (rutile TiO2, M = 79.87 g/mol, mp 1843 C) - verified. ERROR CORRECTED: the previous source claimed an anatase-to-rutile enthalpy of 11-12 kJ/mol (140-150 J/g), which is too large by roughly 2-4x. Calorimetric literature gives 2.61 +/- 0.41 kJ/mol (bulk rutile-anatase), 3.26 +/- 0.84 and 2.93 +/- 1.26 kJ/mol by oxide-melt solution calorimetry and DSC (Mitsuhashi & Kleppa; PNAS 'Energetics of nanocrystalline TiO2'), with the older Navrotsky & Kleppa 1967 value of -1.57 kcal/mol (~-6.6 kJ/mol) at 968 K as the high end. Over M = 79.87 g/mol that is ~33-83 J/g, so the note now reads 30-80 J/g. Confidence downgraded to medium because of this correction and because the value is nanostructure dependent."
  }

];

window.THERMAL_LIBRARY_META = {
  source: "PolyTechniques - getpolytechniques.com",
  author: "Nicholas Pierini",
  copyright: "(c) 2025-2026 Nicholas Pierini. All rights reserved.",
  license: "Proprietary. See terms.html. No reuse without written permission."
};
