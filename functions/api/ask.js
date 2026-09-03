// Turn a question in English into a filter over the local polymer library.
//
// The point of this endpoint is what it does NOT do: it never answers a
// chemistry question. It receives a question and the library's own vocabulary,
// and returns a FILTER - tags, class, temperature ranges, a text fragment. The
// browser then applies that filter to the 968 verified entries it already has
// and renders the result through the normal search path.
//
// That split is deliberate. Every fact the visitor sees still comes from data
// curated by hand and checked in CI; the model only decides which rows to show.
// A model that invented a melting point would be a serious problem on a
// reference site. A model that picks the wrong tag merely shows the wrong list,
// which the visitor can see - and the endpoint returns its own reading of the
// question so they can tell that is what happened.
//
// Guards are the same stack as /api/recognize: same-site origin, a size cap, a
// KV-backed global and per-IP daily budget, all failing open when KV is absent.
// The key is an environment secret and never reaches the browser.

const MAX_QUESTION_CHARS = 400;

// A strict tool rather than output_config.format: the wire shape for strict
// tool use is documented for raw HTTP, and this Function talks to the API with
// fetch rather than the SDK. There is no bundler in front of /functions here -
// no package.json dependency for the site, no wrangler build - so an SDK import
// would not survive deployment. /api/recognize made the same call for the same
// reason, and mixing the two styles in one codebase is worse than either.
const FILTER_TOOL = {
  name: "filter_library",
  description:
    "Express the user's question as a filter over the polymer library. " +
    "Use only vocabulary supplied in the message. Leave a field null when the " +
    "question does not constrain it.",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      interpretation: {
        type: "string",
        description:
          "One short sentence, addressed to the user, saying what you took the question to mean. Shown to them verbatim.",
      },
      allTags: {
        type: "array",
        items: { type: "string" },
        description: "Entry must carry every one of these tags. Exact strings from the supplied list.",
      },
      anyTags: {
        type: "array",
        items: { type: "string" },
        description: "Entry must carry at least one of these tags.",
      },
      classContains: {
        type: ["string", "null"],
        description: "Case-insensitive substring of the entry's polymerisation class, from the supplied list.",
      },
      textContains: {
        type: ["string", "null"],
        description: "Case-insensitive substring to look for in the name, aliases, monomer or note.",
      },
      tgMin: { type: ["number", "null"], description: "Minimum glass transition in Celsius." },
      tgMax: { type: ["number", "null"], description: "Maximum glass transition in Celsius." },
      tmMin: { type: ["number", "null"], description: "Minimum melting point in Celsius." },
      tmMax: { type: ["number", "null"], description: "Maximum melting point in Celsius." },
      requireTg: { type: "boolean", description: "Only entries that carry a glass transition value." },
      requireTm: { type: "boolean", description: "Only entries that carry a melting point." },
      requireCas: { type: "boolean", description: "Only entries that carry a CAS registry number." },
      unanswerable: {
        type: "boolean",
        description:
          "True when the question cannot be expressed as a filter over this library - it asks for a property the library does not hold, or asks for advice rather than a list.",
      },
    },
    required: [
      "interpretation", "allTags", "anyTags", "classContains", "textContains",
      "tgMin", "tgMax", "tmMin", "tmMax",
      "requireTg", "requireTm", "requireCas", "unanswerable",
    ],
    additionalProperties: false,
  },
};

const SYSTEM = [
  "You convert a chemist's question into a filter over a curated library of polymer repeat units.",
  "",
  "You do not answer chemistry questions and you never supply facts. Your only job is to choose",
  "which of the library's own rows should be shown. The caller applies your filter locally.",
  "",
  "Rules:",
  "- Use only tag and class strings from the vocabulary in the user message. Never invent one.",
  "- Only 6% of entries carry a glass transition and 4% a melting point. If the question turns on",
  "  a temperature, set the range AND the matching require flag, so the user is told they are",
  "  seeing only the entries where that value is known rather than a silently short list.",
  "- Prefer a tag or class over a text fragment; fall back to textContains for a specific",
  "  substance, element or group the vocabulary cannot express.",
  "- Set unanswerable when the question asks for something the library does not hold (price,",
  "  supplier, toxicity, solubility, mechanical data) or asks for advice rather than a list.",
  "- interpretation is read by the user. Say what you filtered on, plainly, in one sentence.",
].join("\n");

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function originAllowed(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true; // same-origin posts and non-browser callers
  let host;
  try { host = new URL(origin).hostname; } catch (e) { return false; }
  return host === "getpolytechniques.com" ||
         host === "www.getpolytechniques.com" ||
         host.endsWith(".pages.dev") ||
         host === "localhost" || host === "127.0.0.1";
}

// Same budget shape as /api/recognize, and deliberately a SEPARATE counter: a
// burst of questions should not spend the image-recognition allowance, and
// whichever one is being abused should be visible on its own.
async function overBudget(env, request) {
  if (!env.RATE_KV) return null;
  const day = new Date().toISOString().slice(0, 10);
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const dailyCap = parseInt(env.ASK_DAILY_CAP, 10) || 400;
  const ipCap = parseInt(env.ASK_IP_DAILY_CAP, 10) || 40;
  const globalKey = "ask:day:" + day;
  const ipKey = "ask:ip:" + day + ":" + ip;
  const [g, i] = await Promise.all([env.RATE_KV.get(globalKey), env.RATE_KV.get(ipKey)]);
  const gc = parseInt(g, 10) || 0;
  const ic = parseInt(i, 10) || 0;
  if (gc >= dailyCap) {
    return json(429, { ok: false, error: "The free question budget for today is used up. Name and category search still work." });
  }
  if (ic >= ipCap) {
    return json(429, { ok: false, error: "You have reached today's per-user limit for questions. Name and category search still work." });
  }
  const ttl = { expirationTtl: 172800 };
  await Promise.all([
    env.RATE_KV.put(globalKey, String(gc + 1), ttl),
    env.RATE_KV.put(ipKey, String(ic + 1), ttl),
  ]);
  return null;
}

// An unhandled throw below would surface as a bare 502 from the edge with no
// body - which is exactly how /api/recipe failed and could not be diagnosed
// from outside. Wrapping the handler turns any such failure into JSON the
// browser can read and display.
export async function onRequestPost(context) {
  try {
    return await handleAsk(context);
  } catch (e) {
    return json(500, { ok: false, error: "The interpreter failed: " + (e && e.message ? e.message : String(e)) });
  }
}

async function handleAsk(context) {
  const { request, env } = context;

  if (!originAllowed(request)) return json(403, { ok: false, error: "Blocked." });
  if (!env.ANTHROPIC_API_KEY) {
    return json(503, { ok: false, error: "Question search is not configured on this deployment." });
  }

  let body;
  try { body = await request.json(); } catch (e) {
    return json(400, { ok: false, error: "Malformed request." });
  }
  const question = String((body && body.question) || "").trim();
  const tags = Array.isArray(body && body.tags) ? body.tags.slice(0, 200) : [];
  const classes = Array.isArray(body && body.classes) ? body.classes.slice(0, 80) : [];
  if (!question) return json(400, { ok: false, error: "Ask a question first." });
  if (question.length > MAX_QUESTION_CHARS) {
    return json(413, { ok: false, error: "That question is too long. Keep it under " + MAX_QUESTION_CHARS + " characters." });
  }

  const limited = await overBudget(env, request);
  if (limited) return limited;

  const vocabulary =
    "Available tags:\n" + tags.join(", ") +
    "\n\nAvailable classes:\n" + classes.join(", ") +
    "\n\nQuestion:\n" + question;

  let apiResp;
  try {
    apiResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-5",
        // Room for adaptive thinking as well as the tool call: thinking is on
        // by default on this model and is billed against max_tokens, so the
        // couple of hundred a bare filter object needs would truncate it
        // mid-reasoning and return nothing usable.
        max_tokens: 2048,
        // A vocabulary lookup, not a hard problem. Low effort keeps the box
        // responsive enough to type into and the per-question cost near zero.
        output_config: { effort: "low" },
        system: SYSTEM,
        tools: [FILTER_TOOL],
        tool_choice: { type: "tool", name: "filter_library" },
        messages: [{ role: "user", content: vocabulary }],
      }),
    });
  } catch (e) {
    return json(502, { ok: false, error: "Could not reach the interpreter. Try again." });
  }

  if (!apiResp.ok) {
    return json(502, { ok: false, error: "The interpreter returned an error. Try again." });
  }

  let data;
  try { data = await apiResp.json(); } catch (e) {
    return json(502, { ok: false, error: "Unreadable response from the interpreter." });
  }

  // stop_details is populated only on a refusal, so check stop_reason before
  // reading content rather than after.
  if (data.stop_reason === "refusal") {
    return json(200, { ok: false, error: "That question was declined. Try rephrasing it as a search." });
  }

  const block = (data.content || []).find((b) => b.type === "tool_use" && b.name === "filter_library");
  if (!block || !block.input) {
    return json(502, { ok: false, error: "The interpreter did not return a filter. Try again." });
  }

  return json(200, { ok: true, filter: block.input });
}
