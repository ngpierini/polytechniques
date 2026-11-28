// Shared cross-page navigation strip. Injected into the topbar of every
// interior page so you can hop between tools without going through home.
// index.html (the home page) doesn't load this - its card grid is the navigation.
(function () {
  "use strict";

  var LINKS = [
    ["calculator.html", "🧮 Calculator"],
    ["polymer-search.html", "🔍 Search"],
    ["polymer-families.html", "🧪 Families"],
    ["copolymer-composition.html", "🧬 Copolymer"],
    ["dispersity-predictor.html", "🎯 Dispersity"],
    ["gpc-calibration.html", "📏 GPC Convert"],
    ["tg-predictor.html", "🌡️ Tg"],
    ["recipe-scaling.html", "⚖️ Scaling"],
    ["mechanisms.html", "⚛️ Mechanisms"],
    ["air-free-technique.html", "💨 Air-Free"],
    ["conversion-monitoring.html", "📊 Conversion"],
    ["thermal-instrument-guide.html", "🌡️ Running DSC/TGA/DMA"],
    ["end-group-analysis.html", "🔬 End Groups"],
    ["gpc-peak-interpretation.html", "📉 GPC Peaks"],
    ["gpc-trace.html", "📈 GPC Trace"],
    ["mwd-simulator.html", "〰️ Distribution"],
    ["flory-huggins.html", "🧊 Phase"],
    ["tts-master-curve.html", "🕰️ Master Curve"],
    ["network-formation.html", "🕸️ Network"],
    ["thermal-analysis.html", "🔥 Thermal"],
    ["chain-dimensions.html", "📐 Chain Size"],
    ["calculator.html#sg", "🔗 Step-Growth"],
    ["crosslink-density.html", "🕸️ Crosslinks"],
    ["isocyanate-cure.html", "🧫 NCO Cure"],
    ["hydrogel-mesh-size.html", "💧 Hydrogel Mesh"],
    ["radical-kinetics.html", "⚡ FRP Kinetics"],
    ["glossary.html", "📖 Glossary"]
  ];

  // ---- Sidebar index (wide screens) ----
  // On a screen wide enough to spare it, every page carries the whole site in
  // a fixed column on the left, grouped the way the home page groups it, so
  // the next tool is one click away instead of a scroll through a chip strip.
  // Below 1200px the column is not shown and the chip strip above does the job.
  var SIDEBAR_GROUPS = [
    ["Start", [
      ["calculator.html", "Calculator"],
      ["polymer-search.html", "Structure search"],
      ["polymer-families.html", "Polymer families"]
    ]],
    ["Plan a polymerization", [
      ["copolymer-composition.html", "Copolymer composition"],
      ["dispersity-predictor.html", "Dispersity predictor"],
      ["mwd-simulator.html", "Distribution simulator"],
      ["tg-predictor.html", "T<sub>g</sub> predictor"],
      ["chain-dimensions.html", "Chain dimensions"],
      ["flory-huggins.html", "Flory&ndash;Huggins phase behaviour"],
      ["calculator.html#sg", "Step-growth and gel point"],
      ["crosslink-density.html", "Crosslink density"],
      ["hydrogel-mesh-size.html", "Hydrogel mesh size"],
      ["network-formation.html", "Network formation"],
      ["radical-kinetics.html", "Free-radical kinetics"],
      ["recipe-scaling.html", "Recipe scaling"]
    ]],
    ["Characterize", [
      ["thermal-analysis.html", "Thermal analysis"],
      ["thermal-instrument-guide.html", "Running DSC, TGA and DMA"],
      ["tts-master-curve.html", "Time&ndash;temperature superposition"],
      ["gpc-calibration.html", "GPC calibration"],
      ["gpc-trace.html", "GPC trace analyzer"],
      ["gpc-peak-interpretation.html", "GPC peak interpretation"],
      ["end-group-analysis.html", "End-group analysis"],
      ["conversion-monitoring.html", "Monitoring conversion"],
      ["isocyanate-cure.html", "Isocyanate cure"]
    ]],
    ["Bench guides", [
      ["mechanisms.html", "Polymerization mechanisms"],
      ["air-free-technique.html", "Air-free technique"],
      ["glossary.html", "Glossary"]
    ]],
    ["About", [
      ["whats-new.html", "What&rsquo;s new"],
      ["founder.html", "About the author"]
    ]]
  ];
  // The mark: the ring monogram, an aromatic-ring hexagon with a bold P, and
  // the lowercase wordmark, all as outlines from brand/logo-horizontal.svg so no
  // font is needed. Colours come from --logo-* tokens in style.css, which flip
  // to the brand's dark-background variant in the dark theme.
  var LOGO_HEX = '<polygon points="32,5 55.4,18.5 55.4,45.5 32,59 8.6,45.5 8.6,18.5" fill="var(--logo-accent)" stroke="var(--logo-accent)" stroke-width="6" stroke-linejoin="round"/>';
  var LOGO_P = '<path fill="var(--logo-p)" d="M24.95 43.5V21.1H34.16Q36.28 21.1 37.89 21.95Q39.51 22.8 40.42 24.33Q41.33 25.87 41.33 27.98V28.43Q41.33 30.51 40.39 32.06Q39.44 33.61 37.83 34.46Q36.21 35.31 34.16 35.31H29.17V43.5ZM29.17 31.47H33.75Q35.25 31.47 36.18 30.64Q37.11 29.8 37.11 28.36V28.04Q37.11 26.6 36.18 25.77Q35.25 24.94 33.75 24.94H29.17Z"/>';
  var LOGO_SVG =
    '<svg class="brand-logo" viewBox="0 0 64 64" aria-hidden="true" focusable="false">' + LOGO_HEX + LOGO_P + "</svg>";
  var LOGO_LOCKUP =
    '<svg class="brand-lockup" viewBox="0 0 576 108" role="img" aria-label="PolyTechniques" focusable="false">' +
    '<g transform="scale(1.6875)">' + LOGO_HEX +
    '<polygon points="32,13 48.5,22.5 48.5,41.5 32,51 15.5,41.5 15.5,22.5" fill="none" stroke="var(--logo-ring)" stroke-width="1.5" stroke-linejoin="round"/>' +
    LOGO_P + "</g>" +
    '<path fill="var(--logo-accent)" d="M134.34 87.85V44.7H142.03V48.42H143.14Q144.2 46.62 146.43 45.23Q148.66 43.83 152.82 43.83Q156.54 43.83 159.7 45.66Q162.86 47.49 164.78 51.02Q166.7 54.56 166.7 59.58V60.57Q166.7 65.59 164.78 69.13Q162.86 72.66 159.7 74.49Q156.54 76.32 152.82 76.32Q150.03 76.32 148.13 75.67Q146.24 75.02 145.1 74Q143.95 72.97 143.27 71.92H142.15V87.85ZM150.46 69.5Q154.12 69.5 156.5 67.17Q158.89 64.85 158.89 60.39V59.77Q158.89 55.3 156.47 52.98Q154.06 50.65 150.46 50.65Q146.86 50.65 144.45 52.98Q142.03 55.3 142.03 59.77V60.39Q142.03 64.85 144.45 67.17Q146.86 69.5 150.46 69.5Z M186.36 76.32Q181.77 76.32 178.11 74.46Q174.45 72.6 172.35 69.07Q170.24 65.53 170.24 60.57V59.58Q170.24 54.62 172.35 51.09Q174.45 47.55 178.11 45.69Q181.77 43.83 186.36 43.83Q190.95 43.83 194.6 45.69Q198.26 47.55 200.37 51.09Q202.48 54.62 202.48 59.58V60.57Q202.48 65.53 200.37 69.07Q198.26 72.6 194.6 74.46Q190.95 76.32 186.36 76.32ZM186.36 69.38Q189.95 69.38 192.31 67.05Q194.67 64.73 194.67 60.39V59.77Q194.67 55.43 192.34 53.1Q190.02 50.78 186.36 50.78Q182.76 50.78 180.41 53.1Q178.05 55.43 178.05 59.77V60.39Q178.05 64.73 180.41 67.05Q182.76 69.38 186.36 69.38Z M207.5 75.45V32.05H215.31V75.45Z M225.17 87.85V81.03H241.91Q243.65 81.03 243.65 79.17V71.42H242.53Q242.03 72.48 240.98 73.53Q239.93 74.58 238.13 75.27Q236.33 75.95 233.54 75.95Q229.94 75.95 227.25 74.3Q224.55 72.66 223.06 69.75Q221.57 66.83 221.57 63.05V44.7H229.39V62.43Q229.39 65.9 231.09 67.64Q232.8 69.38 235.96 69.38Q239.55 69.38 241.54 66.99Q243.52 64.6 243.52 60.32V44.7H251.33V80.91Q251.33 84.07 249.47 85.96Q247.61 87.85 244.51 87.85Z"/>' +
    '<path fill="var(--logo-ink)" d="M269.69 75.45Q266.9 75.45 265.25 73.78Q263.61 72.1 263.61 69.31V50.28H255.18V44.89H263.61V34.78H270V44.89H279.11V50.28H270V68.2Q270 70.06 271.73 70.06H278.12V75.45Z M298.45 76.32Q293.8 76.32 290.33 74.37Q286.86 72.41 284.91 68.85Q282.95 65.28 282.95 60.57V59.83Q282.95 55.05 284.88 51.49Q286.8 47.92 290.24 45.97Q293.68 44.02 298.21 44.02Q302.61 44.02 305.93 45.97Q309.24 47.92 311.1 51.4Q312.96 54.87 312.96 59.52V61.94H289.46Q289.59 65.97 292.16 68.35Q294.73 70.74 298.58 70.74Q302.17 70.74 304 69.13Q305.83 67.52 306.82 65.41L312.09 68.14Q311.23 69.87 309.58 71.79Q307.94 73.72 305.27 75.02Q302.61 76.32 298.45 76.32ZM289.53 57.04H306.45Q306.2 53.57 303.97 51.61Q301.74 49.66 298.14 49.66Q294.55 49.66 292.28 51.61Q290.02 53.57 289.53 57.04Z M332.68 76.32Q328.28 76.32 324.71 74.46Q321.15 72.6 319.07 69.07Q316.99 65.53 316.99 60.57V59.77Q316.99 54.81 319.07 51.3Q321.15 47.8 324.71 45.91Q328.28 44.02 332.68 44.02Q337.08 44.02 340.18 45.63Q343.28 47.24 345.17 49.91Q347.06 52.57 347.62 55.8L341.42 57.1Q341.11 55.05 340.12 53.38Q339.13 51.71 337.33 50.71Q335.53 49.72 332.8 49.72Q330.14 49.72 328 50.93Q325.86 52.14 324.62 54.4Q323.38 56.67 323.38 59.89V60.45Q323.38 63.67 324.62 65.97Q325.86 68.26 328 69.44Q330.14 70.62 332.8 70.62Q336.83 70.62 338.94 68.54Q341.05 66.46 341.61 63.24L347.81 64.66Q347.06 67.83 345.17 70.49Q343.28 73.16 340.18 74.74Q337.08 76.32 332.68 76.32Z M353.01 75.45V32.05H359.4V49.23H360.39Q361.01 48.05 362.16 46.93Q363.31 45.82 365.2 45.1Q367.09 44.39 370 44.39Q373.47 44.39 376.17 45.94Q378.87 47.49 380.42 50.31Q381.97 53.13 381.97 57.1V75.45H375.58V57.6Q375.58 53.63 373.6 51.74Q371.61 49.85 368.14 49.85Q364.17 49.85 361.79 52.45Q359.4 55.05 359.4 60.01V75.45Z M388.97 75.45V44.89H395.24V49.47H396.23Q397.1 47.61 399.33 46Q401.56 44.39 405.96 44.39Q409.43 44.39 412.13 45.94Q414.83 47.49 416.38 50.31Q417.93 53.13 417.93 57.1V75.45H411.54V57.6Q411.54 53.63 409.56 51.74Q407.57 49.85 404.1 49.85Q400.13 49.85 397.75 52.45Q395.36 55.05 395.36 60.01V75.45Z M424.93 75.45V44.89H431.32V75.45ZM428.16 40.73Q426.3 40.73 425.03 39.52Q423.76 38.31 423.76 36.39Q423.76 34.47 425.03 33.26Q426.3 32.05 428.16 32.05Q430.08 32.05 431.32 33.26Q432.56 34.47 432.56 36.39Q432.56 38.31 431.32 39.52Q430.08 40.73 428.16 40.73Z M462.57 87.85V71.3H461.58Q460.89 72.54 459.59 73.69Q458.29 74.83 456.27 75.58Q454.26 76.32 451.28 76.32Q447.44 76.32 444.22 74.46Q440.99 72.6 439.07 69.1Q437.15 65.59 437.15 60.63V59.7Q437.15 54.74 439.1 51.24Q441.05 47.74 444.28 45.88Q447.5 44.02 451.28 44.02Q455.75 44.02 458.13 45.63Q460.52 47.24 461.7 49.29H462.69V44.89H468.95V87.85ZM453.08 70.74Q457.3 70.74 459.96 68.07Q462.63 65.41 462.63 60.45V59.89Q462.63 54.99 459.93 52.33Q457.24 49.66 453.08 49.66Q448.99 49.66 446.29 52.33Q443.6 54.99 443.6 59.89V60.45Q443.6 65.41 446.29 68.07Q448.99 70.74 453.08 70.74Z M487.93 76.01Q484.45 76.01 481.73 74.46Q479 72.91 477.45 70.06Q475.9 67.21 475.9 63.24V44.89H482.28V62.8Q482.28 66.77 484.27 68.66Q486.25 70.55 489.79 70.55Q493.69 70.55 496.08 67.92Q498.47 65.28 498.47 60.32V44.89H504.85V75.45H498.59V70.86H497.6Q496.73 72.72 494.5 74.37Q492.27 76.01 487.93 76.01Z M526.12 76.32Q521.47 76.32 518 74.37Q514.52 72.41 512.57 68.85Q510.62 65.28 510.62 60.57V59.83Q510.62 55.05 512.54 51.49Q514.46 47.92 517.9 45.97Q521.34 44.02 525.87 44.02Q530.27 44.02 533.59 45.97Q536.91 47.92 538.77 51.4Q540.63 54.87 540.63 59.52V61.94H517.13Q517.25 65.97 519.83 68.35Q522.4 70.74 526.24 70.74Q529.84 70.74 531.67 69.13Q533.5 67.52 534.49 65.41L539.76 68.14Q538.89 69.87 537.25 71.79Q535.6 73.72 532.94 75.02Q530.27 76.32 526.12 76.32ZM517.19 57.04H534.12Q533.87 53.57 531.64 51.61Q529.4 49.66 525.81 49.66Q522.21 49.66 519.95 51.61Q517.69 53.57 517.19 57.04Z M558.67 76.32Q552.84 76.32 549 73.72Q545.15 71.11 544.28 65.84L550.24 64.42Q550.73 66.96 551.91 68.45Q553.09 69.93 554.86 70.55Q556.62 71.17 558.67 71.17Q561.71 71.17 563.35 70Q564.99 68.82 564.99 66.96Q564.99 65.1 563.44 64.23Q561.89 63.36 558.85 62.8L556.75 62.43Q553.65 61.87 551.1 60.82Q548.56 59.77 547.07 57.91Q545.59 56.05 545.59 53.13Q545.59 48.79 548.81 46.41Q552.03 44.02 557.37 44.02Q562.51 44.02 565.83 46.34Q569.15 48.67 570.14 52.64L564.19 54.31Q563.63 51.52 561.83 50.37Q560.03 49.23 557.37 49.23Q554.76 49.23 553.27 50.19Q551.79 51.15 551.79 52.88Q551.79 54.74 553.24 55.61Q554.7 56.48 557.18 56.91L559.35 57.29Q562.64 57.84 565.36 58.84Q568.09 59.83 569.67 61.69Q571.25 63.55 571.25 66.65Q571.25 71.24 567.84 73.78Q564.43 76.32 558.67 76.32Z"/>' +
    "</svg>";
  window.PT_LOGO_SVG = LOGO_SVG;
  var NO_SIDEBAR = ["polymer-chain-game", "404", "diagnostics"];

  function buildSidebar(current) {
    if (document.querySelector(".side-nav") || NO_SIDEBAR.indexOf(current) !== -1) return;
    var aside = document.createElement("aside");
    aside.className = "side-nav";
    aside.setAttribute("aria-label", "All tools and guides");
    var h = '<a class="side-brand" href="/">' + LOGO_LOCKUP + '<sup>&trade;</sup></a>' +
      '<button type="button" class="side-search"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M13 13l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
      '<span>Search tools</span><kbd>Ctrl K</kbd></button>';
    var hash = (location.hash || "").toLowerCase();
    SIDEBAR_GROUPS.forEach(function (g) {
      h += '<div class="side-group"><p class="side-group-label">' + g[0] + "</p><ul>";
      g[1].forEach(function (l) {
        var href = l[0], here = pageKey(href) === current;
        // calculator.html and calculator.html#sg are one page; mark the step-growth
        // entry only when that tab is the one open
        if (here && href.indexOf("#") !== -1) here = hash === href.slice(href.indexOf("#")).toLowerCase();
        else if (here && current === "calculator" && hash === "#sg") here = false;
        h += '<li><a href="' + href + '"' + (here ? ' aria-current="page"' : "") + ">" + l[1] + "</a></li>";
      });
      h += "</ul></div>";
    });
    aside.innerHTML = h;
    aside.querySelector(".side-search").addEventListener("click", function () { openPalette(); });
    document.body.insertBefore(aside, document.body.firstChild);
    document.body.classList.add("has-sidebar");
    var cur = aside.querySelector('[aria-current="page"]');
    if (cur) {
      // scroll only when the current entry would otherwise be out of sight,
      // so the brand at the top stays put on most pages
      if (cur.offsetTop + cur.offsetHeight > aside.clientHeight - 24) aside.scrollTop = cur.offsetTop - aside.clientHeight / 2;
    }
  }

  // ---- Inline validation feedback for numeric inputs, site-wide ----
  // The number inputs already carry min/max, so lean on the browser's own
  // validity check: red-flag the field and surface the native message right
  // where the mistake is, instead of only erroring in the results area.
  document.addEventListener("input", function (e) {
    var el = e.target;
    if (!el || el.tagName !== "INPUT" || el.type !== "number") return;
    var bad = el.value !== "" && !el.checkValidity();
    el.classList.toggle("input-invalid", bad);
    var hint = el.nextElementSibling;
    var isHint = !!(hint && hint.classList && hint.classList.contains("input-hint"));
    if (bad) {
      if (!isHint) {
        hint = document.createElement("span");
        hint.className = "input-hint";
        el.insertAdjacentElement("afterend", hint);
      }
      hint.textContent = el.validationMessage || "Invalid value";
    } else if (isHint) {
      hint.remove();
    }
  }, true);

  // ---- PWA install suggestion, shown on a repeat visit ----
  // The site works fully offline via the service worker; this surfaces the
  // install option once for returning visitors, and stays gone if dismissed.
  var INSTALL_DISMISS_KEY = "polytechniques_install_dismissed";
  var VISIT_KEY = "polytechniques_visits";
  try {
    if (!sessionStorage.getItem("pt_visit_counted")) {
      sessionStorage.setItem("pt_visit_counted", "1");
      localStorage.setItem(VISIT_KEY, String((parseInt(localStorage.getItem(VISIT_KEY), 10) || 0) + 1));
    }
  } catch (e) {}

  window.addEventListener("beforeinstallprompt", function (e) {
    var dismissed = false, visits = 0;
    try {
      dismissed = localStorage.getItem(INSTALL_DISMISS_KEY) === "1";
      visits = parseInt(localStorage.getItem(VISIT_KEY), 10) || 0;
    } catch (err) { return; }
    if (dismissed || visits < 2) return;
    e.preventDefault();

    var banner = document.createElement("div");
    banner.className = "install-banner";
    banner.innerHTML =
      '<span class="install-banner-text">📲 Install PolyTechniques &ndash; the whole toolkit works offline at the bench.</span>' +
      '<span class="install-banner-actions">' +
      '<button type="button" class="install-banner-yes">Install</button>' +
      '<button type="button" class="install-banner-no">Not now</button>' +
      "</span>";
    document.body.appendChild(banner);

    banner.querySelector(".install-banner-yes").addEventListener("click", function () {
      banner.remove();
      e.prompt();
    });
    banner.querySelector(".install-banner-no").addEventListener("click", function () {
      try { localStorage.setItem(INSTALL_DISMISS_KEY, "1"); } catch (err) {}
      banner.remove();
    });
  });

  // ---- Ctrl+K / Cmd+K command palette ----
  var PALETTE_PAGES = [
    ["calculator.html", "Calculator", "atrp raft romp frp recipe mn dp block copolymer stock solutions"],
    ["polymer-search.html", "Polymer Search", "structure draw name lookup database repeat unit copolymer block sbr abs plga pluronic"],
    ["copolymer-composition.html", "Copolymer Composition", "mayo lewis reactivity ratio azeotrope feed"],
    ["dispersity-predictor.html", "Dispersity (Đ) Predictor", "dispersity pdi mw mn distribution raft atrp nmp cta cex transfer constant deactivator living controlled radical poisson"],
    ["gpc-calibration.html", "GPC Calibration Converter", "mark houwink polystyrene equivalent molecular weight"],
    ["end-group-analysis.html", "End Group & Pendant Group Analysis", "nmr end group pendant degree of substitution titration hydroxyl value acid value amine value nco ftir maldi uv-vis elemental analysis mn functionality"],
    ["gpc-trace.html", "GPC Trace Analyzer", "chromatogram raw data slice summation integration limits baseline mn mw mz dispersity moments paste trace"],
    ["mwd-simulator.html", "Distribution Simulator", "molecular weight distribution mwd shape schulz zimm flory most probable dead chains termination band broadening simulate raft atrp"],
    ["flory-huggins.html", "Flory-Huggins Phase Behaviour", "chi parameter miscibility blend binodal spinodal critical point cloud point theta solvent odt diblock microphase"],
    ["tts-master-curve.html", "Time-Temperature Superposition", "tts master curve wlf shift factor dma rheology viscoelastic frequency sweep arrhenius activation energy"],
    ["network-formation.html", "Network Formation", "gel point macosko miller recursive sol fraction crosslink density elastic strand functionality stoichiometry cure thermoset"],
    ["tg-predictor.html", "Tg Predictor", "fox equation glass transition blend"],
    ["recipe-scaling.html", "Recipe Scaling", "scale batch size factor"],
    ["calculator.html#pu", "Polyurethane Calculator", "pu prepolymer capping nco oh isocyanate chain extender hard segment mdi tdi bdo"],
    ["isocyanate-cure.html", "Isocyanate Cure Conversion", "nco conversion cure monitoring dsc residual exotherm ftir 2270 isocyanate band dibenedetto tg vitrification arrhenius activation energy pot life gel point index water polyurethane"],
    ["calculator.html#em", "Emulsion Polymerization Calculator", "sds kps surfactant micelle particle size nucleation smith-ewart raft atrp controlled persulfate latex"],
    ["mechanisms.html", "Polymerization Mechanisms", "atrp raft romp frp scheme controlled radical"],
    ["air-free-technique.html", "Air-Free Reaction Setup", "schlenk line freeze pump thaw degas inert"],
    ["conversion-monitoring.html", "Monitoring Conversion", "aliquot internal standard kinetics nmr"],
    ["thermal-instrument-guide.html", "Running DSC, TGA and DMA", "trios stare ta instruments mettler toledo method astm d3418 e1131 e1640 calibration indium"],
    ["gpc-peak-interpretation.html", "GPC Peak Interpretation", "chromatogram shoulder tailing column detector"],
    ["thermal-analysis.html", "Thermal Analysis (DSC, TGA, DMA)", "dsc tga dma thermal thermogravimetric differential scanning calorimetry dynamic mechanical analysis glass transition tg melting tm crystallinity char yield decomposition onset storage loss modulus tan delta crosslink density"],
    ["calculator.html#sg", "Step-Growth & Gel Point", "carothers gel point flory stockmayer functionality stoichiometry conversion xn thermoset network cure polyester polyamide endcapper"],
    ["crosslink-density.html", "Crosslink Density", "flory rehner swelling mc molar mass between crosslinks network rubber elasticity plateau modulus chi swelling ratio"],
    ["hydrogel-mesh-size.html", "Hydrogel Mesh Size", "hydrogel mesh size correlation length peppas merrill canal peppas swelling ratio solute diffusion release drug delivery pore size exclusion mc water content v2s"],
    ["radical-kinetics.html", "Free-Radical Kinetics", "rp rate of polymerization kinetic chain length dpn kp kt kd initiator efficiency chain transfer mayo trommsdorff half life"],
    ["glossary.html", "Glossary", "terms definitions dispersity dp cta"],
    ["polymer-chain-game.html", "Build a Polymer Chain", "game maze fun"],
    ["whats-new.html", "What's New", "changelog updates"],
    ["founder.html", "About the Founder", "nick pierini bio contact"],
    ["terms.html", "Terms of Use", "license proprietary copyright rights legal"],
    ["privacy.html", "Privacy", "privacy policy data cookies analytics gdpr tracking"],
    ["/", "Home", "toolkit start"]
  ];

  // One key per page, agreed on by both the address bar and LINKS above.
  // Strips a trailing slash and a .html extension, and calls the apex "index",
  // so "/", "/index.html" and "index.html" are all one page.
  function pageKey(href) {
    var s = String(href || "").split("?")[0].split("#")[0].replace(/\/+$/, "");
    var last = s.split("/").pop();
    if (!last) return "index";
    return last.replace(/\.html$/i, "").toLowerCase();
  }

  // ---- Ad slot (Google AdSense), injected site-wide ----
  //
  // The LIBRARY is loaded by a literal <script> in the <head> of every page,
  // not from here. That is deliberate: Google verifies ownership by reading the
  // raw HTML, and a script injected by JavaScript is not reliably seen. This
  // function only places the ad UNIT, which needs the slot id of a unit created
  // in the dashboard - and that only exists once the site is approved.
  //
  // Emptying ADSENSE_SLOT is the off switch: the library still loads, but no
  // unit is placed and no space is taken on any page.
  var ADSENSE_CLIENT = "ca-pub-9553775926809206";
  var ADSENSE_SLOT = "5973263397";   // "PolyTechniques below content", a responsive display unit
  // Published so the diagnostics page can run a live fill test against the REAL
  // unit rather than a second copy of these ids that could drift out of step.
  // check-adsense.js reads nav.js, so this stays the single source of truth.
  window.PT_ADS = { client: ADSENSE_CLIENT, slot: ADSENSE_SLOT };
  //
  // STILL OUTSTANDING, and it is not optional: a Google-certified consent
  // management platform, switched on in the AdSense dashboard under Privacy &
  // messaging. Google requires one for traffic from the EEA and the UK, and
  // this site blocks neither. A hand-written banner does NOT satisfy it.
  // Google's own CMP is free. This matters from now rather than from approval,
  // because the library in the page head can set cookies before a single ad
  // has ever served.
  //
  // ads.txt at the site root carries the matching publisher number. Both must
  // agree; if the AdSense account is ever changed, change both.
  //
  // Manual placement, not Auto ads. Auto ads let Google insert units wherever
  // it judges best, which on a page of calculators and drawn structures means
  // between an input and its result. One unit, below the content, where it
  // cannot come between a reader and the tool.
  //
  // Pages that do not get one: the game (an ad beside a game reads as an
  // advergame), the two legal pages, the diagnostics self-test and the 404,
  // where an ad would be noise at the exact moment someone is confused.
  var NO_AD_PAGES = ["polymer-chain-game", "terms", "privacy", "diagnostics", "404", "index", "polyurethane"];

  function addAdSlot() {
    try {
      if (!ADSENSE_CLIENT || !ADSENSE_SLOT) return;
      var page = (location.pathname.split("/").pop() || "home").replace(/\.html$/, "");
      if (!page) page = "home";
      if (NO_AD_PAGES.indexOf(page) !== -1) return;
      if (document.querySelector(".ad-slot")) return;

      var main = document.querySelector("main");
      // Any footer, not footer.footer: 21 pages use that class but
      // chain-dimensions.html uses "site-footer", and the narrow selector
      // silently dropped the slot to the end of <main> there instead.
      var footer = document.querySelector("footer");
      if (!main && !footer) return;

      // The unit must have real WIDTH when adsbygoogle.push() measures it.
      // This used to be built with hidden = true, and `.ad-slot[hidden]` is
      // display:none, so the <ins> was zero-width at push time and AdSense
      // threw "No slot size for availableWidth=0" on every page of the site,
      // every load. It never filled, the observer below then saw "unfilled",
      // and the slot deleted itself - hidden until it fills, unable to fill
      // while hidden. So the container now sits in the flow at full width from
      // the start and is merely EMPTY: the "pending" class collapses its
      // vertical margins and hides the label, and an <ins> with no ad in it
      // has no height, so nothing shows. The label and the spacing appear only
      // when Google reports the unit filled.
      var slot = document.createElement("div");
      slot.className = "ad-slot ad-slot-pending";
      var label = document.createElement("span");
      label.className = "ad-slot-label";
      label.textContent = "Advertisement";
      var ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.style.display = "block";
      ins.setAttribute("data-ad-client", ADSENSE_CLIENT);
      ins.setAttribute("data-ad-slot", ADSENSE_SLOT);
      ins.setAttribute("data-ad-format", "auto");
      ins.setAttribute("data-full-width-responsive", "true");
      slot.appendChild(label);
      slot.appendChild(ins);

      if (footer && footer.parentNode) footer.parentNode.insertBefore(slot, footer);
      else main.appendChild(slot);

      if ("MutationObserver" in window) {
        var mo = new MutationObserver(function () {
          var st = ins.getAttribute("data-ad-status");
          if (st === "filled") { slot.classList.remove("ad-slot-pending"); mo.disconnect(); }
          else if (st === "unfilled") { slot.remove(); mo.disconnect(); }
        });
        mo.observe(ins, { attributes: true, attributeFilter: ["data-ad-status"] });
        // 10 s was tight enough that a slow fill looked like no fill. The slot
        // costs nothing to leave in place while pending - it is empty and takes
        // no vertical space - so the deadline can afford to be generous.
        setTimeout(function () {
          mo.disconnect();
          if (ins.getAttribute("data-ad-status") !== "filled") slot.remove();
        }, 20000);
      }

      // The library is already requested from the page <head>; this only asks
      // it to fill the unit just inserted. adsbygoogle is an array Google
      // drains when it arrives, so pushing before it has loaded is the
      // documented order and avoids a race with the async script.
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) { /* an ad must never break a page */ }
  }

  // ---- Proprietary copyright notice, injected site-wide ----
  // Keeps a single source of truth for the notice instead of hand-editing
  // every page footer. Adds a machine-readable <meta name="copyright"> and a
  // small legal line in the footer (or, on pages without one, at the end of
  // the body). The year auto-extends from 2025 so it never goes stale.
  function addLegalNotice() {
    var startYear = 2025;
    var now = new Date().getFullYear();
    var years = now > startYear ? startYear + "–" + now : String(startYear);
    var notice = "© " + years + " Nicholas Pierini. All rights reserved.";

    if (!document.querySelector('meta[name="copyright"]')) {
      var meta = document.createElement("meta");
      meta.name = "copyright";
      meta.content = notice;
      document.head.appendChild(meta);
    }

    if (document.querySelector(".footer-legal")) return;
    var line = document.createElement("p");
    line.className = "footer-legal";
    line.style.cssText = "font-size:var(--fs-xs);opacity:0.7;margin-top:8px;";
    // Amazon requires this exact sentence "clearly and prominently" on the
    // site (Associates Operating Agreement, section 5). Putting it in the
    // injected legal line puts it on all 44 page footers from one place.
    line.innerHTML = notice + ' PolyTechniques is proprietary. As an Amazon Associate I earn from qualifying purchases. ' +
      '<a href="terms.html">Terms of Use</a> &middot; <a href="privacy.html">Privacy</a>.';

    var footer = document.querySelector("footer.footer");
    if (footer) {
      footer.appendChild(line);
    } else {
      line.style.cssText += "text-align:center;padding:24px 16px;";
      document.body.appendChild(line);
    }
  }

  var palette = null;
  var paletteInput = null;
  var paletteList = null;
  var paletteIndex = 0;

  function buildPalette() {
    if (palette) return;
    palette = document.createElement("div");
    palette.className = "cmdk-overlay";
    palette.hidden = true;
    palette.innerHTML =
      '<div class="cmdk-box" role="dialog" aria-label="Quick navigation">' +
      '<input type="text" class="cmdk-input" placeholder="Jump to a tool, or type a polymer or term&hellip;" aria-label="Search pages">' +
      '<div class="cmdk-list" role="listbox"></div>' +
      '<div class="cmdk-foot">&uarr;&darr; navigate &middot; Enter open &middot; Esc close</div>' +
      "</div>";
    document.body.appendChild(palette);
    paletteInput = palette.querySelector(".cmdk-input");
    paletteList = palette.querySelector(".cmdk-list");

    palette.addEventListener("click", function (e) {
      if (e.target === palette) closePalette();
    });
    paletteInput.addEventListener("input", renderPaletteResults);
    paletteInput.addEventListener("keydown", function (e) {
      var items = paletteList.querySelectorAll(".cmdk-item");
      if (e.key === "ArrowDown") { e.preventDefault(); setPaletteIndex(paletteIndex + 1, items); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setPaletteIndex(paletteIndex - 1, items); }
      else if (e.key === "Enter") {
        e.preventDefault();
        var sel = items[paletteIndex];
        if (sel) location.href = sel.getAttribute("data-href");
      } else if (e.key === "Escape") {
        closePalette();
      }
    });
  }

  function setPaletteIndex(i, items) {
    if (!items.length) return;
    paletteIndex = (i + items.length) % items.length;
    items.forEach(function (el, j) { el.classList.toggle("cmdk-active", j === paletteIndex); });
    items[paletteIndex].scrollIntoView({ block: "nearest" });
  }

  function renderPaletteResults() {
    var q = paletteInput.value.trim().toLowerCase();
    var rows = [];
    PALETTE_PAGES.forEach(function (p) {
      if (!q || p[1].toLowerCase().indexOf(q) !== -1 || p[2].indexOf(q) !== -1) {
        rows.push({ href: p[0], label: p[1], hint: "page" });
      }
    });
    if (q) {
      rows.push({ href: "polymer-search.html?q=" + encodeURIComponent(q), label: 'Search polymers for “' + paletteInput.value.trim() + '”', hint: "polymer search" });
      rows.push({ href: "glossary.html?q=" + encodeURIComponent(q), label: 'Search glossary for “' + paletteInput.value.trim() + '”', hint: "glossary" });
    }
    paletteList.innerHTML = "";
    rows.forEach(function (r) {
      var item = document.createElement("a");
      item.className = "cmdk-item";
      item.setAttribute("data-href", r.href);
      item.href = r.href;
      item.innerHTML = "<span>" + r.label + "</span><span class='cmdk-hint'>" + r.hint + "</span>";
      paletteList.appendChild(item);
    });
    paletteIndex = 0;
    var items = paletteList.querySelectorAll(".cmdk-item");
    if (items.length) items[0].classList.add("cmdk-active");
  }

  function openPalette() {
    buildPalette();
    palette.hidden = false;
    paletteInput.value = "";
    renderPaletteResults();
    paletteInput.focus();
  }
  function closePalette() {
    if (palette) palette.hidden = true;
  }

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      if (palette && !palette.hidden) closePalette();
      else openPalette();
    }
  });

  // ---- "/" focuses the page's search box (glossary, polymer search) ----
  document.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    var box = document.querySelector('input[type="search"], #mol-name-search');
    if (!box) return;
    e.preventDefault();
    box.focus();
    box.select();
  });

  // ---- The structure map ----
  //
  // Draws window.STRUCTURE_MAP, which is generated offline and checked in CI.
  // Canvas rather than SVG or a chart library: 746 points redrawn on every
  // mouse move is trivial for a canvas and would be 746 DOM nodes otherwise,
  // and nothing here needs a dependency.
  //
  // Hit-testing is linear over the points. At this size that is well under a
  // millisecond, and a quadtree would be a structure to maintain for no
  // measurable gain.
  function drawStructureMap() {
    var canvas = document.getElementById("smap");
    var data = window.STRUCTURE_MAP;
    if (!canvas || !data || !data.points || !data.points.length) return;
    if (canvas.dataset.drawn === "1") return;
    canvas.dataset.drawn = "1";

    var readout = document.getElementById("smap-readout");
    var keyBox = document.getElementById("smap-key");
    var ctx = canvas.getContext("2d");

    // Distinguishable at small size in both themes, and deliberately not the
    // per-card accent palette: these are categories, not brand colours.
    var COLOURS = ["#2563eb", "#7c3aed", "#0e9f6e", "#d97706", "#0891b2",
                   "#dc2626", "#4f46e5", "#65a30d", "#db2777", "#0d9488", "#9333ea"];
    var css = getComputedStyle(document.documentElement);
    var dim = (css.getPropertyValue("--text-dim") || "#666").trim();
    var border = (css.getPropertyValue("--border") || "#ccc").trim();

    var PAD = 26;
    var hidden = {};          // family index -> true when switched off
    var hover = null;

    function layout() {
      var rect = canvas.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      // Match the backing store to the CSS size, or the points land in the
      // wrong place the moment the canvas is scaled by its container.
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: rect.width, h: rect.height };
    }

    function place(p, box) {
      return {
        x: PAD + (p.x / 1000) * (box.w - 2 * PAD),
        y: PAD + (1 - p.y / 1000) * (box.h - 2 * PAD),
      };
    }

    function draw() {
      var box = layout();
      ctx.clearRect(0, 0, box.w, box.h);
      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, box.w - 1, box.h - 1);

      data.points.forEach(function (p) {
        if (p.f >= 0 && hidden[p.f]) return;
        var at = place(p, box);
        ctx.beginPath();
        ctx.arc(at.x, at.y, hover === p ? 5.5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = p.f >= 0 ? COLOURS[p.f % COLOURS.length] : dim;
        ctx.globalAlpha = hover && hover !== p ? 0.35 : 0.8;
        ctx.fill();
        if (hover === p) {
          ctx.globalAlpha = 1;
          ctx.lineWidth = 2;
          ctx.strokeStyle = (css.getPropertyValue("--text") || "#000").trim();
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
    }

    function nearest(mx, my) {
      var box = { w: canvas.getBoundingClientRect().width, h: canvas.getBoundingClientRect().height };
      var best = null, bestD = 14 * 14;
      data.points.forEach(function (p) {
        if (p.f >= 0 && hidden[p.f]) return;
        var at = place(p, box);
        var d = (at.x - mx) * (at.x - mx) + (at.y - my) * (at.y - my);
        if (d < bestD) { bestD = d; best = p; }
      });
      return best;
    }

    canvas.addEventListener("mousemove", function (e) {
      var r = canvas.getBoundingClientRect();
      var p = nearest(e.clientX - r.left, e.clientY - r.top);
      if (p === hover) return;
      hover = p;
      canvas.style.cursor = p ? "pointer" : "default";
      if (readout) {
        readout.textContent = p
          ? p.n + (p.f >= 0 ? " — " + data.families[p.f] : "") + (p.t ? " — has a measured Tg" : "")
          : "Hover a point to name it. Click to search for it.";
      }
      draw();
    });
    canvas.addEventListener("mouseleave", function () {
      hover = null;
      canvas.style.cursor = "default";
      if (readout) readout.textContent = "Hover a point to name it. Click to search for it.";
      draw();
    });
    canvas.addEventListener("click", function (e) {
      var r = canvas.getBoundingClientRect();
      var p = nearest(e.clientX - r.left, e.clientY - r.top);
      if (p) window.location.href = "polymer-search.html?q=" + encodeURIComponent(p.n);
    });

    // A key that also filters. Clicking a family isolates it, which is the only
    // way to read an overlapping region.
    if (keyBox) {
      var counts = {};
      data.points.forEach(function (p) { if (p.f >= 0) counts[p.f] = (counts[p.f] || 0) + 1; });
      data.families.forEach(function (name, i) {
        if (!counts[i]) return;
        var b = document.createElement("button");
        b.type = "button";
        b.className = "smap-key-item";
        b.innerHTML = '<span class="smap-dot" style="background:' + COLOURS[i % COLOURS.length] + '"></span>' +
          name + ' <span class="smap-count">' + counts[i] + "</span>";
        b.setAttribute("aria-pressed", "true");
        b.addEventListener("click", function () {
          hidden[i] = !hidden[i];
          b.classList.toggle("is-off", !!hidden[i]);
          b.setAttribute("aria-pressed", hidden[i] ? "false" : "true");
          draw();
        });
        keyBox.appendChild(b);
      });
    }

    draw();
    window.addEventListener("resize", draw);
    // The canvas inherits theme colours, so a theme flip has to redraw it.
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      if (mq.addEventListener) mq.addEventListener("change", function () {
        css = getComputedStyle(document.documentElement);
        draw();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", drawStructureMap);
  // structure-map.js is deferred, so it may land after DOMContentLoaded.
  window.addEventListener("load", drawStructureMap);
  setTimeout(drawStructureMap, 600);

  // ---- Print and copy, on every calculator ----
  //
  // These existed on some pages and not others with no principle behind which:
  // CSV export on one of ten, copy buttons ranging from none to five, print on
  // none at all despite a print stylesheet being written. Someone learns on one
  // page that results can be copied, moves to the next, and it is gone.
  //
  // Injected here rather than added to ten files so the set cannot drift apart
  // again, and so a calculator added later gets them for free. The hook is a
  // .stat-grid, which is what every calculator on this site renders its answers
  // into - no page needs to opt in.
  function resultsAsText() {
    var out = [];
    out.push(document.title.replace(/: PolyTechniques$/, ""));
    out.push("");
    document.querySelectorAll(".panel.active .stat, #guide .stat").forEach(function (stat) {
      var label = stat.querySelector(".label");
      var value = stat.querySelector(".value");
      var sub = stat.querySelector(".sub");
      if (!label || !value) return;
      out.push(label.textContent.trim() + ": " + value.textContent.trim() +
        (sub && sub.textContent.trim() ? " (" + sub.textContent.trim() + ")" : ""));
    });
    // The tables carry the working, which is usually the half worth pasting
    // into a notebook - a list of quantities rather than one headline number.
    document.querySelectorAll(".panel.active table.recipe, #guide table.recipe").forEach(function (table) {
      var rows = table.querySelectorAll("tr");
      if (!rows.length) return;
      out.push("");
      rows.forEach(function (tr) {
        var cells = [];
        tr.querySelectorAll("th, td").forEach(function (c) { cells.push(c.textContent.trim()); });
        if (cells.join("").length) out.push(cells.join("\t"));
      });
    });
    out.push("");
    out.push(location.href);
    return out.join("\n");
  }

  function addCalcActions() {
    // Only where there is something to print or copy, and only once.
    if (document.getElementById("calc-actions")) return;
    if (!document.querySelector(".stat-grid")) return;
    var host = document.getElementById("guide") || document.getElementById("app");
    if (!host) return;

    var bar = document.createElement("div");
    bar.id = "calc-actions";
    bar.className = "calc-actions";

    var copy = document.createElement("button");
    copy.type = "button";
    copy.className = "copy-btn";
    copy.textContent = "Copy results";
    copy.title = "Copy the results and working on this page as plain text";
    copy.addEventListener("click", function () {
      var text = resultsAsText();
      var done = function () {
        copy.textContent = "Copied";
        setTimeout(function () { copy.textContent = "Copy results"; }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { copy.textContent = "Press Ctrl+C"; });
      } else {
        // Clipboard API needs a secure context; a hidden textarea still works
        // on an http preview or an older browser at the bench.
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (e) { copy.textContent = "Press Ctrl+C"; }
        ta.remove();
      }
    });

    var print = document.createElement("button");
    print.type = "button";
    print.className = "copy-btn";
    print.textContent = "Print";
    print.title = "Print this page, or save it as a PDF, laid out for paper";
    print.addEventListener("click", function () { window.print(); });

    bar.appendChild(copy);
    bar.appendChild(print);
    host.appendChild(bar);
  }

  document.addEventListener("DOMContentLoaded", addCalcActions);
  addCalcActions();
  // The calculator builds its panels from JS after this runs, so the stat-grid
  // that gates the bar may not exist yet on first pass.
  setTimeout(addCalcActions, 400);
  setTimeout(addCalcActions, 1500);

  // ---- Numeric column headings follow their figures, site-wide ----
  //
  // Right-aligned tabular figures only read as an improvement if the heading
  // moves with them; a heading sitting left over a right-aligned column looks
  // like a bug, and so does the mirror image. CSS cannot say "align this th
  // like the td beneath it", and a build-time pass cannot either: half these
  // tables have a static <thead> in the HTML and a <tbody> generated at
  // runtime from a template string elsewhere in the file, so nothing in the
  // source connects a heading to its column. At runtime the connection is
  // real, so it is done here.
  //
  // A column counts as numeric when its cell carries .num and does not
  // override with an inline text-align - several tables use .num as a column
  // marker and then put prose in it.
  function alignNumericHeadings(root) {
    (root || document).querySelectorAll("table.recipe:not(.recipe-data)").forEach(function (table) {
      var head = table.querySelector("thead tr");
      var body = table.querySelector("tbody tr");
      if (!head || !body) return;
      var ths = head.querySelectorAll("th");
      body.querySelectorAll("td").forEach(function (td, i) {
        if (!ths[i]) return;
        var numeric = td.classList.contains("num") &&
          !/left/i.test(td.style.textAlign || "");
        ths[i].classList.toggle("num", numeric);
      });
    });
  }

  // The calculators re-render their tables on every keystroke, so this has to
  // run again when rows appear rather than once on load. Debounced to a frame:
  // a burst of row insertions is one realignment.
  var alignQueued = false;
  function queueAlign() {
    if (alignQueued) return;
    alignQueued = true;
    requestAnimationFrame(function () { alignQueued = false; alignNumericHeadings(); });
  }
  document.addEventListener("DOMContentLoaded", queueAlign);
  queueAlign();
  new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      if (muts[i].addedNodes.length) { queueAlign(); return; }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });

  // ---- Click-to-copy on result stat values, site-wide ----
  // Every tool renders results as .stat > .value blocks; clicking one copies
  // the number for pasting into a notebook or ELN.
  document.addEventListener("click", function (e) {
    var value = e.target.closest ? e.target.closest(".stat .value") : null;
    if (!value || !navigator.clipboard) return;
    var text = value.textContent.trim();
    if (!text || text === "n/a") return;
    navigator.clipboard.writeText(text).then(function () {
      value.classList.add("value-copied");
      setTimeout(function () { value.classList.remove("value-copied"); }, 900);
    }).catch(function () { /* clipboard blocked - do nothing */ });
  });

  // ---- Stack wide result tables into per-row cards on narrow screens ----
  // A five- or six-column recipe table on a 375px phone can only scroll
  // sideways, which hides whichever column you were actually reading. Copy
  // each header onto the cells beneath it so the CSS at <=600px can restack
  // a row as a labelled card. Doing it here rather than in every table's
  // markup means the calculator, the reference tables and the other tools
  // all get it from one place. The .recipe-stackable class is what the CSS
  // keys off, so a table this never reaches keeps its current behaviour.
  function labelTableCells(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var tables = scope.querySelectorAll("table.recipe");
    for (var t = 0; t < tables.length; t++) {
      var table = tables[t];
      var ths = table.querySelectorAll("thead th");
      // Two columns already fit a 375px screen, and stacking them would turn
      // a scannable lookup (the Tg reference list) into a column of cards.
      if (ths.length < 3) continue;
      var heads = [], keepCase = [];
      for (var h = 0; h < ths.length; h++) {
        heads.push(ths[h].textContent.trim());
        // A header that opted out of the uppercase treatment means it: the
        // stacked label is the same text and a capital sigma is not a sigma.
        keepCase.push(!!ths[h].querySelector(".keepcase") || ths[h].classList.contains("keepcase"));
      }
      var rows = table.querySelectorAll("tbody tr");
      var labelled = 0;
      for (var r = 0; r < rows.length; r++) {
        var cells = rows[r].children;
        // A row that doesn't line up with the header (a spanning summary row)
        // has no reliable label per cell, so leave it alone.
        if (cells.length !== heads.length) continue;
        // "n/a" is a placeholder that costs nothing to skip in a table row but
        // a whole line once the row is stacked, so flag those cells for the
        // stacked view to drop, and mark the last one that survives so the
        // card doesn't end on a dangling separator.
        var lastKept = null;
        for (var c = 0; c < cells.length; c++) {
          var cell = cells[c];
          if (heads[c] && !cell.hasAttribute("data-label")) cell.setAttribute("data-label", heads[c]);
          if (keepCase[c]) cell.setAttribute("data-label-keepcase", "");
          else cell.removeAttribute("data-label-keepcase");
          cell.removeAttribute("data-stack-last");
          var text = cell.textContent.trim().toLowerCase();
          if (c > 0 && (text === "" || text === "n/a")) cell.setAttribute("data-stack-skip", "");
          else { cell.removeAttribute("data-stack-skip"); lastKept = cell; }
        }
        if (lastKept) lastKept.setAttribute("data-stack-last", "");
        labelled++;
      }
      if (labelled) table.classList.add("recipe-stackable");
    }
  }

  // Results tables are re-rendered on every keystroke, so watch for new ones
  // instead of asking each tool to call in. Batched to one pass per frame.
  function watchTables() {
    labelTableCells(document);
    if (!("MutationObserver" in window)) return;
    var queued = false;
    new MutationObserver(function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        labelTableCells(document);
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  // ---- Shared topbar chrome (theme toggle + brand/home link) ----
  // This block was byte-identical in all 16 interior pages; it now lives here
  // as the single source. The per-page <h1>/subtitle stay in the HTML (they
  // are real per-page content). theme.js's DOMContentLoaded runs before this
  // deferred script's, so the button it injects has to have its icon set here
  // rather than by theme.js's own load-time pass.
  function injectGuideLinks(topbar) {
    var inner = topbar.querySelector(".topbar-inner");
    if (!inner || inner.querySelector(".guide-links")) return;
    var wrap = document.createElement("div");
    wrap.className = "guide-links";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-toggle-btn";
    btn.setAttribute("aria-label", "Toggle theme");
    btn.textContent = "🌙"; // 🌙, replaced by updateThemeToggleIcons
    btn.addEventListener("click", function () {
      if (typeof window.togglePolyTheme === "function") window.togglePolyTheme();
    });

    var a = document.createElement("a");
    a.className = "brand-link";
    a.href = "/";
    a.innerHTML =
      LOGO_LOCKUP + '<sup class="brand-tm">&trade;</sup>';

    wrap.appendChild(btn);
    wrap.appendChild(a);
    inner.appendChild(wrap);
    if (typeof window.updateThemeToggleIcons === "function") window.updateThemeToggleIcons();
  }

  document.addEventListener("DOMContentLoaded", function () {
    addLegalNotice();
    addAdSlot();
    watchTables();
    buildSidebar(pageKey(location.pathname));

    var topbar = document.querySelector("header.topbar");
    if (!topbar) return;
    injectGuideLinks(topbar);
    if (topbar.querySelector(".site-nav")) return;

    // Compare pages by name with the extension stripped, because the address
    // bar and this list disagree about it: Cloudflare Pages 308-redirects
    // "calculator.html" to "calculator", so pathname.pop() returns
    // "calculator" and never matched the "calculator.html" in LINKS. The
    // current-page pill was therefore highlighted on no page of the live site,
    // while working locally where the .html survives. The apex normalises to
    // "index" so the Home entry lights up there.
    var current = pageKey(location.pathname);

    var nav = document.createElement("nav");
    nav.className = "site-nav";
    nav.setAttribute("aria-label", "Tools and guides");

    LINKS.forEach(function (l) {
      var a = document.createElement("a");
      a.href = l[0];
      a.textContent = l[1];
      if (pageKey(l[0]) === current) {
        a.className = "site-nav-current";
        a.setAttribute("aria-current", "page");
      }
      nav.appendChild(a);
    });

    topbar.appendChild(nav);

    // Keep the active pill visible on narrow screens. Scroll the strip
    // itself rather than scrollIntoView, which can also jolt the page.
    var active = nav.querySelector(".site-nav-current");
    if (active && nav.scrollWidth > nav.clientWidth) {
      nav.scrollLeft = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
    }
    enableWheelScroll(nav);

    buildSectionNav(current);
    buildBackToTop();
  });

  // ---- Wheel-to-scroll for the horizontal nav strips ----
  // Both nav strips are `overflow-x: auto` flex rows. A trackpad emits deltaX
  // on a two-finger swipe, so horizontal scrolling already works there, but a
  // wheel mouse only ever emits deltaY: the wheel scrolls the PAGE and the
  // hidden tabs are unreachable without dragging a scrollbar that is styled
  // away. This maps vertical wheel onto horizontal scroll while the pointer is
  // over the strip.
  function enableWheelScroll(el) {
    if (!el) return;
    el.addEventListener("wheel", function (e) {
      var maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 1) return;                       // nothing hidden, let the page scroll
      // A trackpad's horizontal swipe is already handled natively; only step in
      // when the gesture is predominantly vertical (i.e. a real wheel).
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      // deltaMode is per-line on some mice and per-page on a few; normalise so
      // one notch moves a sensible distance rather than a single pixel.
      var step = e.deltaY;
      if (e.deltaMode === 1) step *= 16;                // DOM_DELTA_LINE
      else if (e.deltaMode === 2) step *= el.clientWidth; // DOM_DELTA_PAGE

      // Only swallow the event while the strip can still move that direction.
      // Without this the strip traps the wheel at either end and the user
      // cannot scroll the page while the pointer happens to be over the tabs.
      if ((step < 0 && el.scrollLeft <= 0) ||
          (step > 0 && el.scrollLeft >= maxScroll - 1)) return;

      e.preventDefault();
      el.scrollLeft += step;
    }, { passive: false });
  }

  // ---- Floating back-to-top button, appears after two screens of scroll ----
  function buildBackToTop() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "Back to top");
    btn.innerHTML = "&uarr;";
    btn.hidden = true;
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.body.appendChild(btn);

    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        btn.hidden = window.scrollY < window.innerHeight * 2;
        ticking = false;
      });
    }, { passive: true });
  }

  // ---- "On this page" sticky jump nav for the long guide pages ----
  var TOC_PAGES = ["gpc-peak-interpretation.html", "mechanisms.html", "conversion-monitoring.html", "dispersity-predictor.html", "thermal-analysis.html", "thermal-instrument-guide.html", "end-group-analysis.html", "hydrogel-mesh-size.html"];

  function buildSectionNav(current) {
    // Compare through pageKey. The list is written with ".html" for
    // readability, but "current" has already had the extension stripped, so a
    // direct indexOf never matched and this table of contents had never once
    // rendered - on any page, since the feature was added.
    var listed = TOC_PAGES.map(pageKey).indexOf(current) !== -1;
    var main = document.getElementById("guide");
    if (!main) return;
    var headings = main.querySelectorAll(":scope > .card > h3");
    if (headings.length < 3) return;

    var bar = document.createElement("nav");
    // Pages off the list never had the strip, and keep not having it on a
    // narrow screen; they get only the rail, which takes no reading space.
    bar.className = "section-nav" + (listed ? "" : " rail-only");
    bar.setAttribute("aria-label", "On this page");

    var links = [];
    headings.forEach(function (h, i) {
      var card = h.parentElement;
      if (!card.id) {
        card.id = "sec-" + h.textContent.trim().toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 40);
        if (document.querySelectorAll("#" + CSS.escape(card.id)).length > 1) card.id += "-" + i;
      }
      var a = document.createElement("a");
      a.href = "#" + card.id;
      a.textContent = h.textContent.trim();
      bar.appendChild(a);
      links.push({ a: a, card: card });
    });

    // Wrap the contents and the page in one shell, so that on a wide screen the
    // contents can sit in a sticky column beside the page rather than above it.
    var shell = document.createElement("div");
    shell.className = "guide-shell";
    main.parentNode.insertBefore(shell, main);
    shell.appendChild(bar);
    shell.appendChild(main);
    document.body.classList.add("has-rail");
    enableWheelScroll(bar);

    // Scroll-spy: highlight the section currently in view
    if ("IntersectionObserver" in window) {
      var currentLink = null;
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var hit = links.find(function (l) { return l.card === entry.target; });
          if (!hit || hit.a === currentLink) return;
          if (currentLink) currentLink.classList.remove("section-nav-current");
          hit.a.classList.add("section-nav-current");
          currentLink = hit.a;
          // keep the highlighted entry visible: across in the strip, down in the rail
          bar.scrollLeft = hit.a.offsetLeft - (bar.clientWidth - hit.a.offsetWidth) / 2;
          if (bar.scrollHeight > bar.clientHeight) bar.scrollTop = hit.a.offsetTop - bar.clientHeight / 2;
        });
      }, { rootMargin: "-15% 0px -70% 0px" });
      links.forEach(function (l) { observer.observe(l.card); });
    }
  }

  // ---- Shareable calculator state -------------------------------------------
  // Opt-in. A page hands over the inputs worth sharing and gets two things:
  // its values restored from the query string on load, and the query string
  // rewritten as they change, so the URL that "Copy results" pastes underneath
  // the numbers actually reproduces them.
  //
  // Only values that differ from the ones the page shipped with are written,
  // so an untouched page keeps a clean URL. replaceState rather than pushState,
  // because nudging a number should not fill the back button.
  //
  // Field kinds:
  //   number (default)  min/max clamp a value that arrived off a URL
  //   select            matched on the option's value
  //   optionText        matched on a slug of the option's TEXT, for a list
  //                     built at run time where the index is not stable
  function shareState(fields, onChange) {
    var defaults = {};
    function el(f) { return document.getElementById(f.id); }
    function slug(t) { return String(t).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

    fields.forEach(function (f) {
      var e = el(f);
      if (e) defaults[f.key] = e.value;
    });

    function apply() {
      var touched = false;
      try {
        var q = new URLSearchParams(location.search);
        fields.forEach(function (f) {
          var raw = q.get(f.key), e = el(f);
          if (raw === null || !e) return;
          if (f.kind === "select") {
            for (var i = 0; i < e.options.length; i++) {
              if (e.options[i].value === raw) { e.value = raw; touched = true; return; }
            }
            return;
          }
          if (f.kind === "optionText") {
            for (var j = 0; j < e.options.length; j++) {
              if (slug(e.options[j].textContent) === slug(raw)) { e.selectedIndex = j; touched = true; return; }
            }
            return;
          }
          var v = parseFloat(raw);
          if (!isFinite(v)) return;                       // junk in a URL is not a value
          if (f.min !== undefined) v = Math.max(f.min, v);
          if (f.max !== undefined) v = Math.min(f.max, v);
          e.value = v;
          touched = true;
        });
      } catch (e) { /* a malformed URL is not worth a broken page */ }
      return touched;
    }

    function write() {
      try {
        var q = new URLSearchParams();
        fields.forEach(function (f) {
          var e = el(f);
          if (!e) return;
          if (e.value === "" || e.value === defaults[f.key]) return;
          if (f.kind === "optionText") {
            var opt = e.options[e.selectedIndex];
            if (opt) q.set(f.key, slug(opt.textContent));
            return;
          }
          q.set(f.key, e.value);
        });
        var qs = q.toString();
        history.replaceState(null, "", qs ? location.pathname + "?" + qs : location.pathname);
      } catch (e) { /* replaceState throws on a file:// origin */ }
    }

    // apply() only fills the inputs. If it changed anything the page must
    // recompute, or it renders its defaults under restored values - which is
    // worse than not restoring at all, because the numbers look authoritative
    // and belong to different inputs.
    var restored = apply();
    if (restored && typeof onChange === "function") onChange();
    fields.forEach(function (f) {
      var e = el(f);
      if (!e) return;
      e.addEventListener(e.tagName === "SELECT" ? "change" : "input", function () {
        if (typeof onChange === "function") onChange();
        write();
      });
    });
    return { write: write, apply: apply };
  }

  window.PolyTechniques = window.PolyTechniques || {};
  window.PolyTechniques.shareState = shareState;

  // ---- Download a figure ----------------------------------------------------
  // Every diagram panel gets SVG and PNG buttons, so a figure can go into a
  // slide or a lab notebook. The page's SVG leans on CSS variables and classes
  // that mean nothing outside it, so the export walks the drawing and writes
  // each element's computed colours and type in as plain attributes, over a
  // background rectangle painted the panel's own colour, so the file looks the
  // same opened anywhere, in either theme.
  var FIG_PROPS = ["fill", "fill-opacity", "stroke", "stroke-width", "stroke-dasharray",
    "stroke-opacity", "opacity", "font-size", "font-family", "font-weight", "font-style"];

  function figureFileName(panel, i) {
    var page = (location.pathname.split("/").pop() || "index").replace(/\.html$/, "") || "index";
    return "polytechniques-" + page + "-" + (panel.getAttribute("data-figure") || "figure-" + (i + 1));
  }

  function standaloneSvg(panel) {
    var svg = panel.querySelector("svg.diagram-svg");
    var clone = svg.cloneNode(true);
    var src = svg.querySelectorAll("*"), dst = clone.querySelectorAll("*");
    for (var k = 0; k < src.length; k++) {
      var cs = getComputedStyle(src[k]);
      FIG_PROPS.forEach(function (p) {
        var v = cs.getPropertyValue(p);
        if (v && v !== "normal" && v !== "auto") dst[k].setAttribute(p, v);
      });
      dst[k].removeAttribute("class");
      dst[k].removeAttribute("style");
    }
    clone.removeAttribute("class");
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    var vb = svg.viewBox.baseVal;
    var bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("x", vb.x); bg.setAttribute("y", vb.y);
    bg.setAttribute("width", vb.width); bg.setAttribute("height", vb.height);
    bg.setAttribute("fill", getComputedStyle(panel).backgroundColor || "#ffffff");
    clone.insertBefore(bg, clone.firstChild);
    // what the figure is and where its facts come from travel with the file
    var cap = panel.querySelector(".diagram-caption"), srcLine = panel.querySelector(".diagram-source");
    var desc = document.createElementNS("http://www.w3.org/2000/svg", "desc");
    desc.textContent = (cap ? cap.textContent.trim() : "") + (srcLine ? "\n\nSource: " + srcLine.textContent.trim() : "") +
      "\n\nFrom " + location.href.split("#")[0];
    clone.insertBefore(desc, clone.firstChild);
    return { text: new XMLSerializer().serializeToString(clone), w: vb.width, h: vb.height };
  }

  function saveBlob(blob, name) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function addFigureDownloads() {
    var panels = document.querySelectorAll(".diagram-panel");
    for (var i = 0; i < panels.length; i++) (function (panel, i) {
      if (panel.querySelector(".fig-actions") || !panel.querySelector("svg.diagram-svg")) return;
      var bar = document.createElement("div");
      bar.className = "fig-actions";
      var mk = function (label, title, fn) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "fig-btn";
        b.textContent = label;
        b.title = title;
        b.addEventListener("click", fn);
        bar.appendChild(b);
      };
      mk("SVG", "Download this figure as an SVG, editable in Illustrator or Inkscape", function () {
        var s = standaloneSvg(panel);
        saveBlob(new Blob([s.text], { type: "image/svg+xml" }), figureFileName(panel, i) + ".svg");
      });
      mk("PNG", "Download this figure as a PNG at three times screen size", function () {
        var s = standaloneSvg(panel), scale = 3;
        var img = new Image();
        img.onload = function () {
          var c = document.createElement("canvas");
          c.width = Math.round(s.w * scale); c.height = Math.round(s.h * scale);
          var ctx = c.getContext("2d");
          ctx.drawImage(img, 0, 0, c.width, c.height);
          c.toBlob(function (blob) { if (blob) saveBlob(blob, figureFileName(panel, i) + ".png"); }, "image/png");
        };
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s.text);
      });
      var lead = document.createElement("span");
      lead.textContent = "Download figure";
      bar.insertBefore(lead, bar.firstChild);
      panel.appendChild(bar);
    })(panels[i], i);
  }
  document.addEventListener("DOMContentLoaded", addFigureDownloads);
  addFigureDownloads();

})();
