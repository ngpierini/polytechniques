"""Social preview cards, one per indexable page, plus the site-wide card.

Why this exists. Every page shared the same og-image.png, and that image had two
faults a chemist notices at once: the repeat-unit subscript n floated under the
chain instead of sitting at the closing bracket, and the chain ran off the left
edge. Shared links also all looked identical, so a link to the GPC trace tool
and a link to the glossary got the same card.

The one memorable element is chemistry's own notation: a bracketed repeat unit,
drawn correctly, with n where a textbook puts it. Everything else is quiet. The
palette and typeface are the site's own (style.css light tokens, the favicon's
three bead colours, Segoe UI), because this is a brand asset rather than a
rebrand.

Run:  py -3 scripts/build-og-images.py
Writes og/<page>.png for each page in sitemap.xml and og/site.png.
"""
import math
import os
import re
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "og")
W, H = 1200, 628

# style.css, light theme
BG = (250, 249, 247)
INK = (31, 35, 40)
DIM = (95, 100, 112)
BLUE = (37, 99, 235)
BORDER = (230, 226, 220)
# favicon.svg bead colours and backbone
BEADS = [(249, 199, 79), (244, 114, 182), (167, 139, 250)]
BACKBONE = (91, 141, 239)

FONTS = r"C:\Windows\Fonts"


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


F_WORD = font("segoeuib.ttf", 70)
F_TITLE = font("segoeuisb.ttf", 42) if os.path.exists(os.path.join(FONTS, "segoeuisb.ttf")) else font("segoeuib.ttf", 42)
F_TAG = font("segoeui.ttf", 30)
F_DOMAIN = font("segoeui.ttf", 26)
F_N = font("segoeuii.ttf", 44) if os.path.exists(os.path.join(FONTS, "segoeuii.ttf")) else font("segoeui.ttf", 44)


def titles():
    sm = open(os.path.join(ROOT, "sitemap.xml"), encoding="utf-8").read()
    pages = re.findall(r"<loc>https://getpolytechniques\.com/([^<]*)</loc>", sm)
    out = []
    for p in pages:
        f = p or "index.html"
        html = open(os.path.join(ROOT, f), encoding="utf-8", errors="replace").read()
        m = re.search(r"<title>([^<]*)</title>", html)
        t = (m.group(1) if m else f).replace(": PolyTechniques", "").strip()
        t = t.replace("&amp;", "&").replace("&ndash;", "–")
        out.append((f.replace(".html", "") or "index", t))
    return out


def draw_repeat_unit(d, x0, y0, w, h):
    """A bracketed vinyl-type repeat unit: zigzag backbone, three pendant beads,
    square brackets, and n at the lower right of the closing bracket. All of it
    inside the box (x0, y0, w, h)."""
    # backbone zigzag of 7 atoms across the box width, leaving room for brackets
    bx0 = x0 + 40
    bx1 = x0 + w - 100
    n_atoms = 9
    step = (bx1 - bx0) / (n_atoms - 1)
    cy = y0 + h * 0.56
    amp = h * 0.15
    pts = []
    # even atoms are the upper vertices of the zigzag, odd atoms the lower
    for i in range(n_atoms):
        pts.append((bx0 + i * step, cy + (amp if i % 2 else -amp)))
    # bonds
    for a, b in zip(pts, pts[1:]):
        d.line([a, b], fill=BACKBONE, width=9)
    # The bracket encloses three repeat units, atoms 1 to 6, with one atom of
    # chain showing on each side for context. In a vinyl polymer the pendant
    # group sits on every second backbone carbon and points AWAY from the chain,
    # so the beads go on the upper vertices and are bonded upward. An earlier
    # draft hung them off the lower vertices, which put them inside the zigzag
    # on top of the bonds: wrong, and it looked wrong.
    lb = pts[1][0] - step * 0.5
    rb = pts[6][0] + step * 0.5
    bead_rise = 62
    r = 24
    top = cy - amp - bead_rise - r - 18
    bot = cy + amp + 40
    arm = 22
    for x, sgn in ((lb, 1), (rb, -1)):
        d.line([(x, top), (x, bot)], fill=INK, width=7)
        d.line([(x, top), (x + sgn * arm, top)], fill=INK, width=7)
        d.line([(x, bot), (x + sgn * arm, bot)], fill=INK, width=7)
    k = 0
    for i in (2, 4, 6):
        x, y = pts[i]
        d.line([(x, y), (x, y - bead_rise)], fill=BACKBONE, width=7)
        c = BEADS[k % 3]
        k += 1
        by = y - bead_rise
        d.ellipse([x - r, by - r, x + r, by + r], fill=c)
        d.ellipse([x - r * 0.55, by - r * 0.65, x - r * 0.1, by - r * 0.25], fill=(255, 255, 255, 140))
    # backbone atoms
    for i, (x, y) in enumerate(pts):
        rr = 11
        d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=BACKBONE)
    # n, at the lower right of the closing bracket, as in print
    d.text((rb + 14, bot - 30), "n", font=F_N, fill=INK)


def card(title_line, subtitle, path):
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im, "RGBA")
    # a thin rule at the foot, the site's border colour, to ground the card
    d.rectangle([0, H - 6, W, H], fill=BORDER)

    draw_repeat_unit(d, 48, 90, 560, 440)

    # text column
    tx = 620
    # wordmark, Poly in blue as on the site itself
    y = 180
    d.text((tx, y), "Poly", font=F_WORD, fill=BLUE)
    pw = d.textlength("Poly", font=F_WORD)
    d.text((tx + pw, y), "Techniques", font=F_WORD, fill=INK)
    y += 100
    # page title, wrapped to the column
    maxw = W - tx - 56
    lines = []
    for word in title_line.split():
        trial = (lines[-1] + " " + word).strip() if lines else word
        if lines and d.textlength(trial, font=F_TITLE) > maxw:
            lines.append(word)
        else:
            if lines:
                lines[-1] = trial
            else:
                lines.append(word)
    for ln in lines[:3]:
        d.text((tx, y), ln, font=F_TITLE, fill=INK)
        y += 54
    if subtitle:
        y += 10
        sub_lines = []
        for word in subtitle.split():
            trial = (sub_lines[-1] + " " + word).strip() if sub_lines else word
            if sub_lines and d.textlength(trial, font=F_TAG) > maxw:
                sub_lines.append(word)
            else:
                if sub_lines:
                    sub_lines[-1] = trial
                else:
                    sub_lines.append(word)
        for ln in sub_lines[:3]:
            d.text((tx, y), ln, font=F_TAG, fill=DIM)
            y += 40
    d.text((tx, H - 78), "getpolytechniques.com", font=F_DOMAIN, fill=DIM)
    im.save(path, optimize=True)


def main():
    os.makedirs(OUT, exist_ok=True)
    # site-wide card
    card("Free calculators and a structure search for polymer chemistry",
         "By a polymer chemist, for the bench.",
         os.path.join(OUT, "site.png"))
    n = 1
    for slug, title in titles():
        if slug == "index":
            continue
        card(title, None, os.path.join(OUT, slug + ".png"))
        n += 1
    print(f"wrote {n} cards to {OUT}")


if __name__ == "__main__":
    main()
