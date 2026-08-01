// Country blocking for the whole site.
//
// A _middleware at the root of /functions runs on every request to the project,
// static pages and /api routes alike, so this is the one place that can gate the
// lot. Cloudflare resolves the client country from the connecting IP and puts it
// on request.cf.country; the two-letter codes are ISO 3166-1 alpha-2.
//
// Deliberately fails OPEN. If request.cf is missing - local dev, a preview
// runner, or Cloudflare simply not supplying geo data - the request is served
// rather than refused. This site is used from locked-down government networks
// where an unexplained blank page is expensive and hard to diagnose, and a
// blocking rule that occasionally takes the site down for its own author is a
// worse failure than one that occasionally lets a blocked country through.
//
// Two things this cannot do, worth knowing before relying on it:
//   * A VPN or proxy defeats it completely. It filters by where the connection
//     appears to come from, which is not the same as who is asking. As a guard
//     on the dataset it is a speed bump, not a lock; the licence in terms.html
//     and the provenance signature carried inside polymer-data.js are what
//     would actually let a copy be traced back here.
//   * It runs inside a Function, so it costs an invocation per request and is
//     only as available as the Functions layer. A Cloudflare WAF custom rule
//     (Security > WAF > Custom rules) blocks at the edge before any of this
//     executes, costs nothing per request, and keeps working if this file has a
//     bug. Use that as the real control; this file is the version-controlled
//     backup that travels with the repo and documents the intent.

// ---------------------------------------------------------------------------
// The list follows the USTR Special 301 Report, 2026 edition, published
// 30 April 2026 - the annual US review of trading partners' intellectual
// property protection. Using a published list rather than an ad-hoc one means
// the choice can be pointed at a source and re-checked when the next report
// lands, rather than resting on anybody's impression of who copies things.
//
// Re-check yearly: the report moves countries between tiers. The 2026 edition
// moved Argentina and Mexico down from Priority Watch to Watch, added the
// European Union, and removed Bulgaria.
// ---------------------------------------------------------------------------

// Priority Foreign Country - the most serious designation.
const PRIORITY_FOREIGN = ["VN"];                       // Vietnam

// Priority Watch List.
const PRIORITY_WATCH = ["CL", "CN", "IN", "ID", "RU", "VE"];
//                      Chile China India Indonesia Russia Venezuela

// Watch List, minus two deliberate exclusions - see below.
const WATCH = [
  "DZ", // Algeria
  "AR", // Argentina
  "BB", // Barbados
  "BY", // Belarus
  "BO", // Bolivia
  "BR", // Brazil
  "CO", // Colombia
  "EC", // Ecuador
  "EG", // Egypt
  "GT", // Guatemala
  "MX", // Mexico
  "PK", // Pakistan
  "PY", // Paraguay
  "PE", // Peru
  "TH", // Thailand
  "TT", // Trinidad and Tobago
  "TR", // Turkey (ISO still uses TR although the country now prefers Turkiye)
];

// NOT blocked, although USTR's 2026 Watch List names both:
//   Canada (CA)
//   the European Union, which USTR lists as a single trading partner and which
//   would expand to all 27 member states
// Excluded by decision, because between them they account for a large part of
// this site's readership. The list below is therefore NOT the Special 301 Watch
// List as published - it is that list with two entries removed - and should not
// be described as the official one.

// Blocked outside the Special 301 lists, by direct instruction rather than by
// any published designation. Singapore appears on neither USTR list.
const ADDITIONAL = ["SG"];

const BLOCKED_COUNTRIES = new Set([].concat(
  PRIORITY_FOREIGN, PRIORITY_WATCH, WATCH, ADDITIONAL
));

// Not covered, each a one-line addition if wanted: Hong Kong (HK) and Macao
// (MO), which have their own codes separate from mainland China; and Tor exit
// nodes, which Cloudflare reports as the pseudo-code T1 rather than any
// country, so a Tor user in a blocked country does not match this list.

const REFUSAL = "This site is not available from your location.\n";

export async function onRequest(context) {
  const country = context.request.cf && context.request.cf.country;

  if (country && BLOCKED_COUNTRIES.has(country)) {
    return new Response(REFUSAL, {
      status: 403,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        // Never let a refusal be cached and then replayed to somebody else, or
        // to the same person after they have moved.
        "cache-control": "no-store",
      },
    });
  }

  return context.next();
}
