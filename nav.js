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
  });

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
