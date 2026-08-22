// Pull the components out of a written procedure so the calculator can be
// filled from a paper instead of by hand.
//
// Same split as /api/ask, for the same reason. This endpoint EXTRACTS - it
// reports what the text says was weighed out - and it is forbidden from doing
// any chemistry with those numbers. It never returns a degree of
// polymerisation, a molecular weight target, or a concentration, even though
// the paper often states one. The browser hands the extracted amounts to the
// calculator, which derives all of that itself with the arithmetic it already
// has and already shows.
//
// That matters more here than in /api/ask. A search that filters wrongly shows
// a wrong list, which is visible. A recipe parser that quietly did the division
// itself would put a number in the Target box that looks like the calculator's
// own output and is not - and someone would weigh reagents against it. So the
// model is allowed to read "48.8 mg" off the page and nothing else; DP is the
// calculator's answer, computed from the amounts, every time.
//
// The extraction is also checkable in a way a search result is not: the fields
// it fills are visible side by side with the paragraph it came from, and the
// calculator recomputes the moles from the mass and molar mass it was given.

const MAX_TEXT_CHARS = 6000;

const RECIPE_TOOL = {
  name: "extract_recipe",
  description:
    "Extract the reagents and amounts stated in a polymerisation procedure. " +
    "Report only what the text says. Never calculate a ratio, a degree of " +
    "polymerisation, a target molecular weight, or a concentration.",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      technique: {
        type: "string",
        enum: ["atrp", "raft", "romp", "frp", "unknown"],
        description: "Which polymerisation this is. unknown when the text does not make it clear.",
      },
      monomerName: { type: ["string", "null"] },
      monomerMassGram: { type: ["number", "null"], description: "Mass in grams exactly as stated, converted from mg if needed." },
      monomerMolesMmol: { type: ["number", "null"], description: "Amount in mmol exactly as stated." },
      monomerVolumeML: { type: ["number", "null"] },
      monomerMolarMass: { type: ["number", "null"], description: "Only if the text states it. Do not supply one from memory." },

      carrierRole: {
        type: "string",
        enum: ["initiator", "CTA", "catalyst", "none"],
        description: "What defines a chain: an ATRP/FRP initiator, a RAFT chain transfer agent, or a ROMP catalyst.",
      },
      carrierName: { type: ["string", "null"] },
      carrierMassGram: { type: ["number", "null"] },
      carrierMolesMmol: { type: ["number", "null"] },
      carrierMolarMass: { type: ["number", "null"], description: "Only if the text states it." },

      catalystName: { type: ["string", "null"], description: "Copper source for ATRP, if present." },
      catalystMolesMmol: { type: ["number", "null"] },
      ligandName: { type: ["string", "null"] },
      ligandMolesMmol: { type: ["number", "null"] },

      solventName: { type: ["string", "null"] },
      solventVolumeML: { type: ["number", "null"] },
      temperatureC: { type: ["number", "null"] },

      statedRatio: {
        type: ["string", "null"],
        description:
          "The feed ratio as the text itself writes it, e.g. \"200:1:1:1\", copied verbatim. Null if the text does not state one. Do not derive it.",
      },
      missing: {
        type: "string",
        description:
          "One sentence naming what the procedure did not state and the calculator will therefore need, addressed to the user. Empty string if nothing is missing.",
      },
      unusable: {
        type: "boolean",
        description: "True when the text is not a polymerisation procedure or states no amounts at all.",
      },
    },
    required: [
      "technique", "monomerName", "monomerMassGram", "monomerMolesMmol",
      "monomerVolumeML", "monomerMolarMass", "carrierRole", "carrierName",
      "carrierMassGram", "carrierMolesMmol", "carrierMolarMass",
      "catalystName", "catalystMolesMmol", "ligandName", "ligandMolesMmol",
      "solventName", "solventVolumeML", "temperatureC",
      "statedRatio", "missing", "unusable",
    ],
    additionalProperties: false,
  },
};

const SYSTEM = [
  "You read a written polymerisation procedure and report the reagents and amounts it states.",
  "",
  "You are an extractor, not a chemist. Report only figures the text actually contains.",
  "",
  "Hard rules:",
  "- Never calculate. No degree of polymerisation, no target molecular weight, no concentration,",
  "  no equivalents, no ratio of your own. The caller computes all of that from what you report,",
  "  and a number you derived would be indistinguishable from one it derived.",
  "- statedRatio is a quotation, not a calculation. Copy it only if the text writes it out.",
  "- Do not supply a molar mass from memory, even for a monomer you know. Null unless stated.",
  "- Convert units only where it is mechanical: mg to g, µL to mL, mol to mmol. Never infer a",
  "  mass from a volume, which would need a density the text may not give.",
  "- If two procedures appear, take the first complete one and say so in `missing`.",
  "- `missing` is read by the user. Name what was absent, plainly, in one sentence.",
].join("\n");

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function originAllowed(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  let host;
  try { host = new URL(origin).hostname; } catch (e) { return false; }
  return host === "getpolytechniques.com" ||
         host === "www.getpolytechniques.com" ||
         host.endsWith(".pages.dev") ||
         host === "localhost" || host === "127.0.0.1";
}

// Its own counters again. Recipes are longer than questions and cost more per
// call, so they get a tighter cap and their own line in the budget.
async function overBudget(env, request) {
  if (!env.RATE_KV) return null;
  const day = new Date().toISOString().slice(0, 10);
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const dailyCap = parseInt(env.RECIPE_DAILY_CAP, 10) || 200;
  const ipCap = parseInt(env.RECIPE_IP_DAILY_CAP, 10) || 15;
  const globalKey = "recipe:day:" + day;
  const ipKey = "recipe:ip:" + day + ":" + ip;
  const [g, i] = await Promise.all([env.RATE_KV.get(globalKey), env.RATE_KV.get(ipKey)]);
  const gc = parseInt(g, 10) || 0;
  const ic = parseInt(i, 10) || 0;
  if (gc >= dailyCap) {
    return json(429, { ok: false, error: "The free recipe-reading budget for today is used up. The fields below still work by hand." });
  }
  if (ic >= ipCap) {
    return json(429, { ok: false, error: "You have reached today's per-user limit for reading recipes. The fields below still work by hand." });
  }
  const ttl = { expirationTtl: 172800 };
  await Promise.all([
    env.RATE_KV.put(globalKey, String(gc + 1), ttl),
    env.RATE_KV.put(ipKey, String(ic + 1), ttl),
  ]);
  return null;
}

// An unhandled throw anywhere below becomes a bare 502 from the edge with no
// body and nothing in it to debug - which is exactly what happened on the first
// deploy of this endpoint. Wrapping the handler turns any such failure into a
// JSON error the caller can read and the browser can display.
export async function onRequestPost(context) {
  try {
    return await handleParse(context);
  } catch (e) {
    return json(500, { ok: false, error: "The reader failed: " + (e && e.message ? e.message : String(e)) });
  }
}

async function handleParse(context) {
  const { request, env } = context;

  if (!originAllowed(request)) return json(403, { ok: false, error: "Blocked." });
  if (!env.ANTHROPIC_API_KEY) {
    return json(503, { ok: false, error: "Recipe reading is not configured on this deployment." });
  }

  let body;
  try { body = await request.json(); } catch (e) {
    return json(400, { ok: false, error: "Malformed request." });
  }
  const text = String((body && body.text) || "").trim();
  if (!text) return json(400, { ok: false, error: "Paste a procedure first." });
  if (text.length > MAX_TEXT_CHARS) {
    return json(413, { ok: false, error: "That is longer than one procedure. Paste just the synthesis paragraph (under " + MAX_TEXT_CHARS + " characters)." });
  }

  const limited = await overBudget(env, request);
  if (limited) return limited;

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
        max_tokens: 3072,
        // Higher than /api/ask: pulling every reagent out of a dense paragraph
        // without inventing one is harder than picking a tag, and a missed
        // reagent here becomes a wrong recipe rather than a short list.
        output_config: { effort: "medium" },
        system: SYSTEM,
        tools: [RECIPE_TOOL],
        tool_choice: { type: "tool", name: "extract_recipe" },
        messages: [{ role: "user", content: text }],
      }),
    });
  } catch (e) {
    return json(502, { ok: false, error: "Could not reach the reader. Try again." });
  }

  if (!apiResp.ok) {
    return json(502, { ok: false, error: "The reader returned an error. Try again." });
  }

  let data;
  try { data = await apiResp.json(); } catch (e) {
    return json(502, { ok: false, error: "Unreadable response from the reader." });
  }

  if (data.stop_reason === "refusal") {
    return json(200, { ok: false, error: "That text was declined. Paste only the synthesis paragraph." });
  }

  const block = (data.content || []).find((b) => b.type === "tool_use" && b.name === "extract_recipe");
  if (!block || !block.input) {
    return json(502, { ok: false, error: "The reader did not return a recipe. Try again." });
  }

  return json(200, { ok: true, recipe: block.input });
}
