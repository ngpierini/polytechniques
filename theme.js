(function () {
  // Wrapped in try/catch: a hardened/locked-down browser (some corporate and
  // government builds) throws a SecurityError the moment script touches
  // localStorage. Unguarded, that would abort this head script on every page.
  try {
    var stored = localStorage.getItem('polytechniques_theme');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch (e) { /* storage blocked: fall back to the OS colour scheme */ }
})();

function isDarkTheme() {
  var current = document.documentElement.getAttribute('data-theme');
  if (current === 'dark') return true;
  if (current === 'light') return false;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function updateThemeToggleIcons() {
  var dark = isDarkTheme();
  var btns = document.querySelectorAll('.theme-toggle-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].textContent = dark ? '☀️' : '🌙';
    btns[i].setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    btns[i].title = dark ? 'Switch to light theme' : 'Switch to dark theme';
  }
}

function togglePolyTheme() {
  var next = isDarkTheme() ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('polytechniques_theme', next); } catch (e) { /* storage blocked: theme won't persist */ }
  updateThemeToggleIcons();
}

document.addEventListener('DOMContentLoaded', updateThemeToggleIcons);
