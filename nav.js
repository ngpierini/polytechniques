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
    ["gpc-peak-interpretation.html", "📉 GPC Peaks"],
    ["thermal-analysis.html", "🔥 Thermal"],
    ["chain-dimensions.html", "📐 Chain Size"],
    ["calculator.html#sg", "🔗 Step-Growth"],
    ["crosslink-density.html", "🕸️ Crosslinks"],
    ["radical-kinetics.html", "⚡ FRP Kinetics"],
    ["glossary.html", "📖 Glossary"]
  ];

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
    ["tg-predictor.html", "Tg Predictor", "fox equation glass transition blend"],
    ["recipe-scaling.html", "Recipe Scaling", "scale batch size factor"],
    ["calculator.html#pu", "Polyurethane Calculator", "pu prepolymer capping nco oh isocyanate chain extender hard segment mdi tdi bdo"],
    ["calculator.html#em", "Emulsion Polymerization Calculator", "sds kps surfactant micelle particle size nucleation smith-ewart raft atrp controlled persulfate latex"],
    ["mechanisms.html", "Polymerization Mechanisms", "atrp raft romp frp scheme controlled radical"],
    ["air-free-technique.html", "Air-Free Reaction Setup", "schlenk line freeze pump thaw degas inert"],
    ["conversion-monitoring.html", "Monitoring Conversion", "aliquot internal standard kinetics nmr"],
    ["gpc-peak-interpretation.html", "GPC Peak Interpretation", "chromatogram shoulder tailing column detector"],
    ["thermal-analysis.html", "Thermal Analysis (DSC, TGA, DMA)", "dsc tga dma thermal thermogravimetric differential scanning calorimetry dynamic mechanical analysis glass transition tg melting tm crystallinity char yield decomposition onset storage loss modulus tan delta crosslink density"],
    ["calculator.html#sg", "Step-Growth & Gel Point", "carothers gel point flory stockmayer functionality stoichiometry conversion xn thermoset network cure polyester polyamide endcapper"],
    ["crosslink-density.html", "Crosslink Density", "flory rehner swelling mc molar mass between crosslinks network rubber elasticity plateau modulus chi swelling ratio"],
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
    line.style.cssText = "font-size:0.78rem;opacity:0.7;margin-top:8px;";
    line.innerHTML = notice + ' PolyTechniques is proprietary. <a href="terms.html">Terms of Use</a> &middot; <a href="privacy.html">Privacy</a>.';

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
      var heads = [];
      for (var h = 0; h < ths.length; h++) heads.push(ths[h].textContent.trim());
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
      '<img src="favicon.svg" alt="" class="brand-mark">' +
      '<span class="brand-name"><span class="brand-poly">Poly</span>Techniques<sup>&trade;</sup></span>';

    wrap.appendChild(btn);
    wrap.appendChild(a);
    inner.appendChild(wrap);
    if (typeof window.updateThemeToggleIcons === "function") window.updateThemeToggleIcons();
  }

  document.addEventListener("DOMContentLoaded", function () {
    addLegalNotice();
    addAdSlot();
    watchTables();

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
  var TOC_PAGES = ["gpc-peak-interpretation.html", "mechanisms.html", "conversion-monitoring.html", "dispersity-predictor.html", "thermal-analysis.html"];

  function buildSectionNav(current) {
    if (TOC_PAGES.indexOf(current) === -1) return;
    var main = document.getElementById("guide");
    if (!main) return;
    var headings = main.querySelectorAll(":scope > .card > h3");
    if (headings.length < 3) return;

    var bar = document.createElement("nav");
    bar.className = "section-nav";
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

    document.body.insertBefore(bar, main);
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
          // keep the highlighted chip visible in the strip
          bar.scrollLeft = hit.a.offsetLeft - (bar.clientWidth - hit.a.offsetWidth) / 2;
        });
      }, { rootMargin: "-15% 0px -70% 0px" });
      links.forEach(function (l) { observer.observe(l.card); });
    }
  }
})();
