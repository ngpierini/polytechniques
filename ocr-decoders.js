// PDF and HEIC decoding for the polymer-search OCR upload path.
//
// (c) 2025-2026 Nicholas Pierini. All rights reserved.
//
// The existing OCR uploader hands JPEG/PNG/WEBP directly to Tesseract.js. A
// user uploading a PDF datasheet or an iPhone HEIC of a lab label just gets
// "Could not read that image" - so this adds two routes that rasterize the
// input to a canvas Tesseract already knows how to eat.
//
// PDF:  Mozilla pdf.js v3 (Apache-2.0). v3 is the last release with a UMD
//       pdf.min.js + pdf.worker.min.js pair; v4 ships only .mjs and does not
//       load through the site's existing <script src=...> injection pattern.
//       Loaded lazily from jsdelivr with a 12s timeout, cached on the SW like
//       every other CDN asset. On DoD/Navy networks that blackhole jsdelivr
//       the fallback is the same "could not load" message that already ships.
// HEIC: Safari 17+ (macOS 13+, iOS 17+) decodes HEIC natively through <img>
//       and canvas.drawImage - zero library payload. Chrome and Firefox do
//       not decode HEIC on the web platform as of 2025, and every open JS
//       decoder ultimately links libheif (LGPL-3.0), which fails the site's
//       "no copyleft, no commercial-restriction" licensing rule. Non-Safari
//       users get a clear message asking them to export as PNG/JPEG.
//
// All types are guarded by MAGIC BYTES, not the file extension or MIME type.
// Extensions lie: a JPEG saved as .png parses fine and a .pdf holding
// arbitrary bytes does not.
(function (root) {
  "use strict";

  // Per-format cap enforced BEFORE any decoder loads, so a 200 MB PDF drop
  // does not sit in memory or thrash the CDN loader. Numbers picked from
  // realistic worst cases: an iPhone HEIC burst hits ~15 MB, a 300 DPI
  // scanned 20-page datasheet ~30 MB, so 25 and 40 leave comfortable margin.
  var SIZE_CAPS_MB = { jpeg: 20, png: 20, webp: 20, heic: 25, pdf: 40 };
  var MAX_CANVAS = 4000;   // Tesseract works best around 300 DPI = 2550x3300;
                           // 4000 covers A4/legal with headroom.

  // Match the file's leading bytes rather than trusting extension or
  // File.type. WEBP needs a 12-byte read: RIFF???? WEBP where ??? is the
  // 32-bit chunk size. HEIC's ftyp box lives at bytes 4-7 with the brand
  // at 8-11; the brand allow-list is trimmed to STILL-IMAGE brands only,
  // because Safari <img> does not decode video/sequence brands like hevc.
  function sniffType(buf) {
    var b = new Uint8Array(buf);
    if (b.length < 12) return null;
    if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return 'jpeg';
    if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47 &&
        b[4] === 0x0D && b[5] === 0x0A && b[6] === 0x1A && b[7] === 0x0A) return 'png';
    if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return 'pdf'; // %PDF
    if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
        b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'webp';
    // HEIC: "ftyp" at bytes 4-7, brand at 8-11
    if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) {
      var brand = String.fromCharCode(b[8], b[9], b[10], b[11]);
      if (brand === 'heic' || brand === 'heix' || brand === 'heim' ||
          brand === 'heis' || brand === 'mif1' || brand === 'msf1') return 'heic';
    }
    return null;
  }

  // Pre-flight validation - runs before any decoder loads.
  function guardFile(file, kind) {
    var capMb = SIZE_CAPS_MB[kind];
    if (!capMb) return 'That file format is not supported. Try JPEG, PNG, WEBP, HEIC, or PDF.';
    var sizeMb = file.size / 1024 / 1024;
    if (sizeMb > capMb) {
      return 'That ' + kind.toUpperCase() + ' is ' + sizeMb.toFixed(1) + ' MB, above the ' +
             capMb + ' MB cap. Crop, downscale, or export at lower resolution and try again.';
    }
    return null;
  }

  function scaleForCanvas(w, h) {
    var m = Math.max(w, h);
    if (m <= MAX_CANVAS) return 1;
    return MAX_CANVAS / m;
  }

  // ---- PDF via pdf.js v3 ---------------------------------------------------

  var pdfjsPromise = null;
  function ensurePdfJs() {
    if (typeof pdfjsLib !== 'undefined') return Promise.resolve(true);
    if (pdfjsPromise) return pdfjsPromise;
    pdfjsPromise = new Promise(function (resolve) {
      var done = false;
      var finish = function (ok) { if (!done) { done = true; resolve(ok); } };
      var s = document.createElement('script');
      // v3 has the UMD build. v4 dropped it in favour of ES modules that this
      // <script src=...> injection cannot load synchronously.
      s.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3/legacy/build/pdf.min.js';
      s.onload = function () {
        if (typeof pdfjsLib === 'undefined') { finish(false); return; }
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdn.jsdelivr.net/npm/pdfjs-dist@3/legacy/build/pdf.worker.min.js';
          finish(true);
        } catch (e) { finish(false); }
      };
      s.onerror = function () { finish(false); };
      setTimeout(function () { finish(false); }, 12000);
      document.head.appendChild(s);
    });
    return pdfjsPromise;
  }

  // First page only. Datasheets rarely put the polymer name past page 1, and
  // rendering more pages is a real cost - each is a full canvas rasterisation.
  function pdfToCanvas(file) {
    return ensurePdfJs().then(function (ok) {
      if (!ok) throw new Error('pdf-load-failed');
      return file.arrayBuffer();
    }).then(function (buf) {
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      return pdf.getPage(1);
    }).then(function (page) {
      var vp1 = page.getViewport({ scale: 1 });
      var scale = scaleForCanvas(vp1.width, vp1.height);
      // Boost to at least 1.5 so text stays legible for Tesseract; cap at 2.
      var renderScale = Math.min(2, Math.max(scale, 1.5));
      var vp = page.getViewport({ scale: renderScale });
      var canvas = document.createElement('canvas');
      canvas.width = Math.min(MAX_CANVAS, Math.floor(vp.width));
      canvas.height = Math.min(MAX_CANVAS, Math.floor(vp.height));
      var ctx = canvas.getContext('2d');
      return page.render({ canvasContext: ctx, viewport: vp }).promise.then(function () { return canvas; });
    });
  }

  // ---- HEIC via native <img> (Safari only) --------------------------------

  function heicToCanvas(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      var cleaned = false;
      var cleanup = function () { if (!cleaned) { cleaned = true; URL.revokeObjectURL(url); } };
      img.onload = function () {
        // Non-Safari browsers do not throw - they return an image of natural
        // dimensions 0x0 that draws as nothing. Detect that and fail cleanly.
        if (!img.naturalWidth || !img.naturalHeight) { cleanup(); reject(new Error('heic-unsupported')); return; }
        var scale = scaleForCanvas(img.naturalWidth, img.naturalHeight);
        var canvas = document.createElement('canvas');
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        cleanup();
        resolve(canvas);
      };
      img.onerror = function () { cleanup(); reject(new Error('heic-unsupported')); };
      img.src = url;
    });
  }

  // ---- Route ---------------------------------------------------------------

  // Sniff the file's magic bytes and return { kind, canvas?, error?, message? }.
  // canvas is set when the file was rasterised. For plain raster images
  // (JPEG/PNG/WEBP) canvas is null and the caller passes the file directly to
  // Tesseract, which already handles them.
  function prepareForOcr(file) {
    var reader = file.slice(0, 16).arrayBuffer();
    return reader.then(function (buf) {
      var kind = sniffType(buf);
      if (!kind) return { kind: null, error: 'unknown-format', message: 'This does not look like a JPEG, PNG, WEBP, HEIC, or PDF file. Check the file and try again.' };
      var guard = guardFile(file, kind);
      if (guard) return { kind: kind, error: 'too-large', message: guard };
      if (kind === 'jpeg' || kind === 'png' || kind === 'webp') {
        // Pass the raw File through - Tesseract accepts these directly and
        // rasterising them here would double the memory cost.
        return { kind: kind, canvas: null };
      }
      if (kind === 'pdf') {
        return pdfToCanvas(file).then(function (canvas) { return { kind: 'pdf', canvas: canvas }; });
      }
      if (kind === 'heic') {
        return heicToCanvas(file).then(function (canvas) { return { kind: 'heic', canvas: canvas }; });
      }
      return { kind: kind, error: 'unroutable', message: 'That format is recognised but not handled.' };
    });
  }

  // Human-readable message for each rejection tag.
  function errorMessage(err) {
    var tag = err && err.message ? err.message : String(err);
    if (tag === 'pdf-load-failed') return 'The PDF reader could not load. It is fetched from cdn.jsdelivr.net, which some secure networks block. Try again when online, or export the PDF page as a PNG.';
    if (tag === 'heic-unsupported') return 'This browser cannot decode HEIC. Safari does; Chrome and Firefox do not. Open the file in Photos, export as JPEG or PNG, and try again.';
    return 'Could not read that file. Try a different format.';
  }

  root.OcrDecoders = {
    sniffType: sniffType,
    prepareForOcr: prepareForOcr,
    errorMessage: errorMessage,
    SIZE_CAPS_MB: SIZE_CAPS_MB,
    MAX_CANVAS: MAX_CANVAS
  };
})(typeof window !== "undefined" ? window : this);
