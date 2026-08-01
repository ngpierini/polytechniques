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
//     appears to come from, which is not the same as who is asking.
//   * It runs inside a Function, so it costs an invocation per request and is
//     only as available as the Functions layer. A Cloudflare WAF custom rule
//     (Security > WAF > Custom rules, expression ip.src.country in {"CN" "RU"})
//     blocks at the edge before any of this executes, costs nothing per
//     request, and keeps working if this file has a bug. Use that as the real
//     control; this file is the version-controlled backup that travels with the
//     repo and documents the intent.

// ISO 3166-1 alpha-2 codes to refuse.
//
//   CN  China (mainland only - see below)
//   RU  Russia
//   TR  Turkey        (ISO still uses TR although the country now prefers Turkiye)
//   SG  Singapore
//
// Deliberately NOT included, each a one-line addition if wanted: Hong Kong (HK)
// and Macao (MO), which have their own codes separate from mainland China;
// Belarus (BY), often grouped with Russia for sanctions; and Tor exit nodes,
// which Cloudflare reports as the pseudo-code T1 rather than any country, so a
// Tor user in a blocked country does not match this list.
const BLOCKED_COUNTRIES = ["CN", "RU", "TR", "SG"];

const REFUSAL = "This site is not available from your location.\n";

export async function onRequest(context) {
  const country = context.request.cf && context.request.cf.country;

  if (country && BLOCKED_COUNTRIES.includes(country)) {
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
