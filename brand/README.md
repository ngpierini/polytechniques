# PolyTechniques brand — Ring monogram

The chosen logo: an aromatic-ring hexagon with a bold **P**, and a lowercase
`polytechniques` wordmark ("poly" in orange, "techniques" in navy). All SVG
text is converted to outlines, so no font is needed to render them.

## Files

| File | Use |
|---|---|
| `logo-horizontal.svg` / `.png` | Main lockup on light backgrounds (header, OG image, docs) |
| `logo-horizontal-dark.svg` | Lockup on dark backgrounds / dark theme |
| `logo-mark.svg` | Hexagon mark alone, light backgrounds |
| `logo-mark-dark.svg` | Hexagon mark alone, dark backgrounds |
| `favicon.svg` | Browser favicon (orange hex, white P, transparent) |
| `favicon-32.png` | PNG favicon fallback |
| `app-icon.svg` | Navy rounded tile with the mark (PWA / app icon source) |
| `icon-192.png`, `icon-512.png` | PWA manifest icons |
| `apple-touch-icon.png` | 180×180, full-bleed square (iOS rounds it) |

## Colours

| Token | Hex |
|---|---|
| Accent (orange) | `#EA580C` |
| Accent on dark | `#FB923C` |
| Ink / navy | `#13212F` |
| Muted text | `#5B6675` |

Wordmark typeface: **Space Grotesk** — 700 for "poly", 500 for "techniques",
letter-spacing −0.035em.

## Wiring it into the site (instructions for Claude Code)

These files were dropped in `brand/` and nothing at the site root was touched.
To adopt the new logo:

1. Replace root `favicon.svg`, `icon-192.png`, `icon-512.png` and
   `apple-touch-icon.png` with the versions in this folder.
2. Add `<link rel="icon" type="image/png" sizes="32x32" href="/brand/favicon-32.png">`
   next to the existing SVG favicon link in every page `<head>`.
3. In `manifest.json`, set `theme_color` to `#13212F` (or `#EA580C`).
4. Swap the header/nav logo (see `nav.js`) for `brand/logo-horizontal.svg`,
   using `brand/logo-horizontal-dark.svg` when the dark theme is active (`theme.js`).
5. Bump the service-worker cache version in `sw.js` so returning visitors get
   the new icons.
6. Optionally regenerate `og-image.png` / images in `og/` with the new lockup.
