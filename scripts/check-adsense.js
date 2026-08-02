// AdSense fails quietly and expensively when the publisher number in one place
// stops matching the publisher number in another: ads.txt says one account,
// the page code says a different one, and Google restricts serving without an
// obvious error on the site. Three places have to agree, so check that they do.
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const errors = [];

const adsTxtPath = path.join(ROOT, "ads.txt");
const navPath = path.join(ROOT, "nav.js");

const nav = fs.readFileSync(navPath, "utf8");
const clientMatch = nav.match(/var ADSENSE_CLIENT = "([^"]*)"/);
if (!clientMatch) errors.push("nav.js: ADSENSE_CLIENT not found");
const client = clientMatch ? clientMatch[1] : "";

const pages = fs.readdirSync(ROOT).filter(f => f.endsWith(".html"));
const withSnippet = pages.filter(f =>
  /adsbygoogle\.js\?client=/.test(fs.readFileSync(path.join(ROOT, f), "utf8")));

if (!client) {
  // Nothing configured: then nothing else should reference an account either.
  if (fs.existsSync(adsTxtPath)) errors.push("ads.txt exists but nav.js has no ADSENSE_CLIENT");
  if (withSnippet.length) errors.push(withSnippet.length + " page(s) carry the AdSense snippet but nav.js has no ADSENSE_CLIENT");
} else {
  const pub = client.replace(/^ca-/, "");

  if (!fs.existsSync(adsTxtPath)) {
    errors.push("nav.js declares " + client + " but there is no ads.txt; AdSense will eventually restrict serving");
  } else {
    const ads = fs.readFileSync(adsTxtPath, "utf8");
    if (ads.indexOf(pub) === -1) errors.push("ads.txt does not mention " + pub + " (nav.js declares " + client + ")");
    // a stray placeholder is worse than no file at all
    if (/pub-0+[,\s]/.test(ads)) errors.push("ads.txt still contains a placeholder publisher number");
  }

  // Every page that loads nav.js must carry the snippet, or ownership
  // verification and serving are inconsistent across the site.
  const shouldHave = pages.filter(f =>
    /nav\.js\?v=/.test(fs.readFileSync(path.join(ROOT, f), "utf8")));
  shouldHave.forEach(f => {
    const s = fs.readFileSync(path.join(ROOT, f), "utf8");
    if (!/adsbygoogle\.js\?client=/.test(s)) errors.push(f + " loads nav.js but is missing the AdSense snippet");
    else if (s.indexOf("client=" + client) === -1) errors.push(f + " carries an AdSense snippet for a different account than nav.js");
  });
  // and the snippet must be in <head>, which is where Google looks
  shouldHave.forEach(f => {
    const s = fs.readFileSync(path.join(ROOT, f), "utf8");
    const head = s.slice(0, s.indexOf("</head>"));
    if (s.indexOf("adsbygoogle.js?client=") !== -1 && head.indexOf("adsbygoogle.js?client=") === -1) {
      errors.push(f + ": the AdSense snippet is outside <head>");
    }
  });
}

if (errors.length) {
  console.error("AdSense configuration failed its check (" + errors.length + "):\n");
  errors.forEach(e => console.error("  - " + e));
  process.exit(1);
}
console.log(client
  ? "AdSense OK - " + client + " consistent across ads.txt, nav.js and " + withSnippet.length + " page heads."
  : "AdSense OK - not configured, and nothing references an account.");
