// GET /api/health — deployment check for the serverless layer.
//
// Exists so the migration runbook has a one-URL test: if this returns JSON,
// Pages Functions are live (GitHub Pages would 404); keyConfigured and
// rateLimitConfigured confirm the two dashboard steps without exposing any
// secret material.
export async function onRequestGet(context) {
  const env = context.env;
  return new Response(JSON.stringify({
    ok: true,
    functions: "live",
    keyConfigured: Boolean(env.ANTHROPIC_API_KEY),
    rateLimitConfigured: Boolean(env.RATE_KV),
  }), {
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
