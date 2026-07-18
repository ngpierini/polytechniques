(function () {
  var stored = localStorage.getItem('polytechniques_theme');
  if (stored === 'light' || stored === 'dark') {
    document.documentElement.setAttribute('data-theme', stored);
  }
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
  localStorage.setItem('polytechniques_theme', next);
  updateThemeToggleIcons();
}

document.addEventListener('DOMContentLoaded', updateThemeToggleIcons);
