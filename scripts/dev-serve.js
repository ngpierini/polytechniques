// A minimal static server for previewing the site locally.
//
// It lives here rather than in a temp directory because the session scratchpad
// rotates, and the launch configuration in .claude/launch.json kept pointing at
// a copy that no longer existed. Nothing here is served in production:
// Cloudflare Pages serves the repo root, and this file is never referenced by
// any page.
//
// Deliberately no caching headers, so an edit is always what the browser gets,
// and extensionless paths resolve to .html to mirror Pages' pretty URLs.
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PORT = Number(process.argv[2] || 8123);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".wasm": "application/wasm"
};

http.createServer(function (req, res) {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  let f = path.normalize(path.join(ROOT, p));
  if (!f.startsWith(path.normalize(ROOT))) { res.writeHead(403); res.end("forbidden"); return; }
  if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html";
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, {
    "Content-Type": TYPES[path.extname(f).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-store"
  });
  fs.createReadStream(f).pipe(res);
}).listen(PORT, function () {
  console.log("serving " + ROOT + " on http://localhost:" + PORT);
});
