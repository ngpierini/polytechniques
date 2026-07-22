# Moving getpolytechniques.com to Cloudflare Pages

The repo is already deploy-ready: the whole site is static files served from
the repo root, and the serverless layer lives in `/functions` (Cloudflare
Pages picks that directory up automatically; GitHub Pages ignores it). The
steps below are the account, DNS, and secret steps only the site owner can
do. Until they are done, GitHub Pages keeps serving the site exactly as
before — nothing breaks in the meantime.

## 1. Create the Pages project (~10 min)

1. Sign up / log in at https://dash.cloudflare.com (free plan is fine).
2. **Workers & Pages → Create → Pages → Connect to Git**, authorize GitHub,
   pick this repository.
3. Build settings:
   - Framework preset: **None**
   - Build command: **(leave empty)**
   - Build output directory: **/** (the repo root)
4. Deploy. You get a `<project>.pages.dev` URL — the full site should work
   there immediately. From now on every `git push origin main` deploys to
   Cloudflare too.

Check: open `https://<project>.pages.dev/api/health` — it should return JSON
with `"functions": "live"`. (On GitHub Pages that URL 404s; that is the
difference the move exists for.)

## 2. Set the API key and rate-limit storage (~5 min)

1. In the Pages project: **Settings → Variables and Secrets → Add**:
   - Name: `ANTHROPIC_API_KEY`, type **Secret**, value: an API key from
     https://console.anthropic.com (create a dedicated key so it can be
     revoked independently). Set it for **Production** (and Preview if you
     want previews to work).
2. Strongly recommended before announcing the feature — the daily caps that
   bound worst-case spend only work with this:
   - **Storage & Databases → KV → Create namespace** (name it e.g.
     `polytechniques-rate`).
   - Back in the Pages project: **Settings → Bindings → Add → KV namespace**,
     variable name `RATE_KV`, select the namespace.
3. Optional plain-text variables (defaults in parentheses):
   - `DAILY_CAP` (200) — total recognitions per day, all users.
   - `IP_DAILY_CAP` (20) — per-IP per day.

Redeploy (Deploys → Retry) so the settings take effect, then re-check
`/api/health`: `keyConfigured` and `rateLimitConfigured` should both be true.

Cost ceiling with defaults: 200 requests/day × ~3¢ ≈ **$6/day worst case**,
normally far less. Set a spend alert in the Anthropic console as a backstop.

## 3. Move the domain (~15 min + DNS propagation)

1. In Cloudflare: **Add a site** → `getpolytechniques.com` → Free plan. It
   imports the existing DNS records — review that the list looks complete.
2. Cloudflare shows two nameservers. At the domain registrar (wherever
   getpolytechniques.com was purchased), replace the current nameservers with
   those two. Propagation is usually minutes, can be up to 24 h.
3. Once Cloudflare shows the site as **Active**: in the Pages project,
   **Custom domains → Set up a domain** → `getpolytechniques.com` (and
   `www.getpolytechniques.com` if you want www to work). Cloudflare creates
   the records and the certificate itself.

During propagation some visitors get GitHub Pages and some get Cloudflare —
both serve the same commit, so this is harmless.

## 4. After cutover

- Verify `https://getpolytechniques.com/api/health` shows all three true/live.
- In the GitHub repo: **Settings → Pages → Source: None** to stop the old
  deployment (optional but tidy; do it only after the domain is serving from
  Cloudflare).
- The `CNAME` file in the repo was for GitHub Pages; Cloudflare ignores it.
  Leave it — it is the instant rollback: re-enabling GitHub Pages and
  pointing the registrar's nameservers back restores the old setup exactly.

## What the serverless layer is

- `functions/api/health.js` — the deployment check used above.
- `functions/api/recognize.js` — structure-image → SMILES via the Anthropic
  API (`claude-opus-4-8`, vision). The key stays server-side; the browser
  never sees it. Guards: same-site origin check, 5 MB payload cap, and the
  KV-backed daily caps. The frontend feature that calls this (upload a
  structure photo in Polymer Search) is built as a separate step once this
  endpoint is live — the endpoint deploying first is intentional.
