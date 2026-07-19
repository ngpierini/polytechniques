// Shared cross-page navigation strip. Injected into the topbar of every
// interior page so you can hop between tools without going through home.
// home.html doesn't load this (its card grid is the navigation).
(function () {
  "use strict";

  var LINKS = [
    ["calculator.html", "🧮 Calculator"],
    ["polymer-search.html", "🔍 Search"],
    ["copolymer-composition.html", "🧬 Copolymer"],
    ["gpc-calibration.html", "📏 GPC Convert"],
    ["tg-predictor.html", "🌡️ Tg"],
    ["recipe-scaling.html", "⚖️ Scaling"],
    ["mechanisms.html", "⚛️ Mechanisms"],
    ["air-free-technique.html", "💨 Air-Free"],
    ["conversion-monitoring.html", "📊 Conversion"],
    ["gpc-peak-interpretation.html", "📉 GPC Peaks"],
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
    ["polymer-search.html", "Polymer Search", "structure draw name lookup database repeat unit"],
    ["copolymer-composition.html", "Copolymer Composition", "mayo lewis reactivity ratio azeotrope feed"],
    ["gpc-calibration.html", "GPC Calibration Converter", "mark houwink polystyrene equivalent molecular weight"],
    ["tg-predictor.html", "Tg Predictor", "fox equation glass transition blend"],
    ["recipe-scaling.html", "Recipe Scaling", "scale batch size factor"],
    ["calculator.html#pu", "Polyurethane Calculator", "pu prepolymer capping nco oh isocyanate chain extender hard segment mdi tdi bdo"],
    ["calculator.html#em", "Emulsion Polymerization Calculator", "sds kps surfactant micelle particle size nucleation smith-ewart raft atrp controlled persulfate latex"],
    ["mechanisms.html", "Polymerization Mechanisms", "atrp raft romp frp scheme controlled radical"],
    ["air-free-technique.html", "Air-Free Reaction Setup", "schlenk line freeze pump thaw degas inert"],
    ["conversion-monitoring.html", "Monitoring Conversion", "aliquot internal standard kinetics nmr"],
    ["gpc-peak-interpretation.html", "GPC Peak Interpretation", "chromatogram shoulder tailing column detector"],
    ["glossary.html", "Glossary", "terms definitions dispersity dp cta"],
    ["polymer-chain-game.html", "Build a Polymer Chain", "game maze fun"],
    ["whats-new.html", "What's New", "changelog updates"],
    ["founder.html", "About the Founder", "nick pierini bio contact"],
    ["terms.html", "Terms of Use", "license proprietary copyright rights legal"],
    ["home.html", "Home", "toolkit start"]
  ];

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
    line.innerHTML = notice + ' PolyTechniques is proprietary. <a href="terms.html">Terms of Use</a>.';

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

  document.addEventListener("DOMContentLoaded", function () {
    addLegalNotice();

    var topbar = document.querySelector("header.topbar");
    if (!topbar || topbar.querySelector(".site-nav")) return;

    var current = (location.pathname.split("/").pop() || "home.html").toLowerCase();

    var nav = document.createElement("nav");
    nav.className = "site-nav";
    nav.setAttribute("aria-label", "Tools and guides");

    LINKS.forEach(function (l) {
      var a = document.createElement("a");
      a.href = l[0];
      a.textContent = l[1];
      if (l[0] === current) {
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

    buildSectionNav(current);
    buildBackToTop();
  });

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
  var TOC_PAGES = ["gpc-peak-interpretation.html", "mechanisms.html", "conversion-monitoring.html"];

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
