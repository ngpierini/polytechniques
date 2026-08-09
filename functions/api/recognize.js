// POST /api/recognize — structure-image recognition for Polymer Search.
//
// Cloudflare Pages Function (this file only runs once the site is hosted on
// Cloudflare Pages; GitHub Pages ignores the /functions directory). Receives
// a base64 image of a chemical structure, sends it to a Claude vision model,
// and returns SMILES the frontend can load into the RDKit editor for visual
// confirmation before searching. The Anthropic API key lives in the
// ANTHROPIC_API_KEY environment secret and never reaches the browser.
//
// Abuse guard for a free public endpoint, in layers:
//   1. Same-site origin check (getpolytechniques.com + *.pages.dev previews).
//   2. Payload cap (~5 MB decoded image).
//   3. Daily budget caps via a KV namespace bound as RATE_KV — a global cap
//      (DAILY_CAP, default 200/day) and a per-IP cap (IP_DAILY_CAP, default
//      20/day). If no KV is bound the endpoint still works, uncapped, so the
//      binding is strongly recommended before announcing the feature.

const MAX_BASE64_CHARS = 7_000_000; // ≈ 5 MB decoded
const ALLOWED_MEDIA = ["image/png", "image/jpeg", "image/webp", "image/gif"];

// The schema used to know two shapes: a repeat unit, or a molecule. A great
// many real polymer drawings are neither - an end-capped oligomer carries
// brackets AND real end groups (amine-terminated polyethers, macromonomers,
// telechelic prepolymers). Asked for "the repeat unit with [*] at the two
// attachment points", the model had nowhere to put the end groups and returned
// a hybrid: fragments that were part repeat unit and part end group. So the
// shape is now something the model states outright, and a telechelic gets to
// report its backbone and its ends separately instead of merging them.
const RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["kind", "smiles", "repeat_unit", "end_groups", "repeat_count", "confidence", "reason"],
  properties: {
    kind: {
      type: "string",
      enum: ["repeat_unit", "telechelic", "molecule", "none"],
      description:
        "repeat_unit: brackets whose ends are open bonds with nothing beyond them. " +
        "telechelic: brackets with a subscript AND real end groups drawn outside them. " +
        "molecule: no brackets. none: nothing could be read.",
    },
    smiles: {
      anyOf: [{ type: "string" }, { type: "null" }],
      description:
        "SMILES for the structure as drawn. For repeat_unit, the unit with two [*]. " +
        "For telechelic, the whole end-capped molecule with NO [*]. Null if nothing was read.",
    },
    repeat_unit: {
      anyOf: [{ type: "string" }, { type: "null" }],
      description:
        "Telechelic only: the bracketed unit alone, with exactly two [*] where the " +
        "bracket crosses the chain. Null for every other kind.",
    },
    end_groups: {
      anyOf: [{ type: "string" }, { type: "null" }],
      description:
        "Telechelic only: the groups outside the brackets in words, e.g. " +
        "\"2-aminopropyl at both ends\". Null for every other kind.",
    },
    repeat_count: {
      anyOf: [{ type: "string" }, { type: "null" }],
      description: "The bracket subscript exactly as printed, e.g. \"x = 2.5\" or \"n\". Null if none.",
    },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
    reason: {
      type: "string",
      description: "One sentence: what was read, or why nothing could be",
    },
  },
};

const PROMPT = [
  "This image should contain a chemical structure: a skeletal formula from a",
  "paper, textbook, label, or a hand drawing. Read it and return its SMILES.",
  "",
  "First decide which shape the drawing is, and set `kind` to say so:",
  "- repeat_unit: brackets whose ends are open bonds with nothing drawn beyond",
  "  them. Return the unit in `smiles` with [*] at the two attachment points.",
  "- telechelic: brackets carrying a subscript AND real end groups drawn outside",
  "  them - an end-capped oligomer, macromonomer or prepolymer, such as an",
  "  amine- or hydroxyl-terminated polyether. The end groups are chemistry, not",
  "  chain ends, so do NOT replace them with [*]. Put the whole end-capped",
  "  molecule in `smiles` with no [*] anywhere, written out at the drawn repeat",
  "  count (round a fractional subscript to the nearest whole number of units).",
  "  Put the bracketed unit alone in `repeat_unit` with exactly two [*]. Copy the",
  "  subscript into `repeat_count` exactly as printed.",
  "- molecule: no brackets at all. Return it in `smiles`.",
  "",
  "Rules:",
  "- `smiles` must be ONE connected structure. Never join fragments with \".\"",
  "  unless the image genuinely shows two separate species.",
  "- Trace the whole chain atom by atom before writing the SMILES, and count the",
  "  backbone atoms in each repeat. Dropping or adding a CH2 is the most common",
  "  way these readings go wrong.",
  "- If several structures are shown, return the largest or most central one.",
  "- If you cannot confidently read a structure (blurry, ambiguous, or the",
  "  image is not chemistry), set kind \"none\", smiles null, and say why in reason.",
  "- Never guess bonds you cannot see; a wrong structure is worse than none.",
].join("\n");

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function originAllowed(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) return true; // non-browser or same-origin contexts without the header
  let host;
  try { host = new URL(origin).hostname; } catch (e) { return false; }
  if (host === "getpolytechniques.com" || host === "www.getpolytechniques.com") return true;
  if (host.endsWith(".pages.dev")) return true; // Cloudflare preview deploys
  if (host === "localhost" || host === "127.0.0.1") return true;
  if (env.EXTRA_ALLOWED_HOST && host === env.EXTRA_ALLOWED_HOST) return true;
  return false;
}

// Returns null if within budget, else a Response to send back. Counters are
// per-UTC-day keys with a 2-day TTL so KV cleans up after itself.
async function overBudget(env, request) {
  if (!env.RATE_KV) return null;
  const day = new Date().toISOString().slice(0, 10);
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const dailyCap = parseInt(env.DAILY_CAP, 10) || 200;
  const ipCap = parseInt(env.IP_DAILY_CAP, 10) || 20;

  const globalKey = "day:" + day;
  const ipKey = "ip:" + day + ":" + ip;
  const [globalRaw, ipRaw] = await Promise.all([env.RATE_KV.get(globalKey), env.RATE_KV.get(ipKey)]);
  const globalCount = parseInt(globalRaw, 10) || 0;
  const ipCount = parseInt(ipRaw, 10) || 0;

  if (globalCount >= dailyCap) {
    return json(429, { ok: false, error: "The free recognition budget for today is used up. Try again tomorrow." });
  }
  if (ipCount >= ipCap) {
    return json(429, { ok: false, error: "You have reached today's per-user limit. Try again tomorrow." });
  }
  const ttl = { expirationTtl: 172800 };
  await Promise.all([
    env.RATE_KV.put(globalKey, String(globalCount + 1), ttl),
    env.RATE_KV.put(ipKey, String(ipCount + 1), ttl),
  ]);
  return null;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!originAllowed(request, env)) {
    return json(403, { ok: false, error: "This endpoint only serves the PolyTechniques site." });
  }
  if (!env.ANTHROPIC_API_KEY) {
    return json(503, { ok: false, error: "Recognition is not configured yet (missing API key)." });
  }

  let body;
  try { body = await request.json(); } catch (e) {
    return json(400, { ok: false, error: "Send JSON: {\"media_type\": ..., \"data\": <base64>}." });
  }
  const mediaType = body && body.media_type;
  const data = body && body.data;
  if (!ALLOWED_MEDIA.includes(mediaType)) {
    return json(400, { ok: false, error: "media_type must be image/png, image/jpeg, image/webp, or image/gif." });
  }
  if (typeof data !== "string" || data.length === 0) {
    return json(400, { ok: false, error: "data must be a base64 string (no data: prefix)." });
  }
  if (data.length > MAX_BASE64_CHARS) {
    return json(413, { ok: false, error: "Image too large. Resize to under 5 MB." });
  }

  const limited = await overBudget(env, request);
  if (limited) return limited;

  const apiResp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      // Reading a skeletal formula off a photograph is the accuracy bottleneck
      // of this whole feature, so it runs on the newest vision model rather
      // than whichever one was current when the endpoint was written.
      model: "claude-opus-5",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: data } },
          { type: "text", text: PROMPT },
        ],
      }],
      output_config: { format: { type: "json_schema", schema: RESULT_SCHEMA } },
    }),
  });

  if (!apiResp.ok) {
    // Surface the provider's error type and a truncated message alongside the
    // friendly text. This carries no secret material and turns "it returned
    // an error" into something diagnosable (e.g. a credit-balance problem
    // reads completely differently from a malformed request).
    let detail = "";
    try {
      const errBody = await apiResp.json();
      const e = errBody && errBody.error;
      detail = ((e && e.type) || "") + (e && e.message ? ": " + String(e.message).slice(0, 200) : "");
    } catch (err) {}
    if (apiResp.status === 401) return json(503, { ok: false, error: "Recognition is misconfigured (key rejected).", detail });
    if (apiResp.status === 429 || apiResp.status === 529) {
      return json(429, { ok: false, error: "The recognition service is busy. Try again in a minute.", detail });
    }
    return json(502, { ok: false, error: "The recognition service returned an error. Try again.", detail });
  }

  const result = await apiResp.json();

  // A safety refusal is a successful HTTP response; check stop_reason before
  // trusting content (and the schema is not guaranteed on a refusal).
  if (result.stop_reason === "refusal") {
    return json(200, { ok: false, error: "The model declined to process this image." });
  }

  const textBlock = (result.content || []).find(function (b) { return b.type === "text"; });
  let parsed = null;
  try { parsed = JSON.parse(textBlock && textBlock.text); } catch (e) {}
  if (!parsed || typeof parsed !== "object") {
    return json(502, { ok: false, error: "The model returned an unreadable result. Try again." });
  }

  const str = function (v) { return typeof v === "string" && v.trim() ? v.trim() : null; };
  return json(200, {
    ok: true,
    kind: str(parsed.kind) || "molecule",
    smiles: str(parsed.smiles),
    repeat_unit: str(parsed.repeat_unit),
    end_groups: str(parsed.end_groups),
    repeat_count: str(parsed.repeat_count),
    confidence: parsed.confidence || "low",
    reason: parsed.reason || "",
  });
}
