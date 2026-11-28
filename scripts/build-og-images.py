"""Social preview cards, one per indexable page, plus the site-wide card.

Brand: the Ring monogram (brand/README.md). Orange #EA580C and navy #13212F,
Space Grotesk, the horizontal lockup top left. Each card names the page and
carries its own drawing on a navy panel: no two cards share an image
(check_unique() fails the build if they do).

Layout, 1200 x 628:
  left  (0-700)    off-white: logo, orange topic label, page title, domain
  right (700-1200) navy: faint hexagon tiling and the topic motif in orange

Everything is drawn at 2x and downsampled, so curves and type are smooth.
Fonts are bundled in brand/fonts (SIL OFL), so this runs on any machine.

Run:  py -3 scripts/build-og-images.py            (all cards)
      py -3 scripts/build-og-images.py gpc-trace  (just the named slugs)
Writes og/<page>.png for each page in sitemap.xml and og/site.png.
"""
import math
import os
import re
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "og")
FONTS = os.path.join(ROOT, "brand", "fonts")
LOGO = os.path.join(ROOT, "brand", "logo-horizontal.png")

S = 2                      # supersampling factor
W, H = 1200, 628
SPLIT = 700                # where the navy panel starts

# brand/README.md colours
ORANGE = (234, 88, 12)
ORANGE_SOFT = (251, 146, 60)
NAVY = (19, 33, 47)
MUTED = (91, 102, 117)
PAPER = (250, 248, 245)
SLATE = (120, 138, 158)    # axes and secondary lines on navy


def font(weight, size):
    return ImageFont.truetype(os.path.join(FONTS, f"SpaceGrotesk-{weight}.ttf"), size * S)


F_EYEBROW = font(700, 22)
F_DOMAIN = font(500, 24)
F_AXIS = font(500, 18)


# ---------------------------------------------------------------- topics ----
# slug -> (topic label, motif). Every page has its own motif: no two cards
# share a drawing. check_unique() enforces that at build time.
TOPICS = {
    "site": ("By a polymer chemist, for the bench", "repeat"),
    # analysis
    "gpc-trace": ("GPC / SEC", "gpc_trace"),
    "gpc-peak-interpretation": ("GPC / SEC", "gpc_bimodal"),
    "gpc-calibration": ("GPC / SEC", "gpc_calibration"),
    "mwd-simulator": ("Molecular weight", "mwd_histogram"),
    "dispersity-predictor": ("Molecular weight", "dispersity"),
    "end-group-analysis": ("Spectroscopy", "nmr"),
    "tg-predictor": ("Thermal", "tg_step"),
    "thermal-analysis": ("Thermal analysis", "tga"),
    "thermal-instrument-guide": ("Thermal analysis", "temp_program"),
    "tts-master-curve": ("Rheology", "tts"),
    # kinetics and mechanism
    "radical-kinetics": ("Kinetics", "autoaccel"),
    "conversion-monitoring": ("Kinetics", "aliquots"),
    "isocyanate-cure": ("Kinetics", "ftir_nco"),
    "copolymer-composition": ("Copolymers", "mayo_lewis"),
    "mechanisms": ("Mechanisms", "propagation"),
    # networks and solutions
    "crosslink-density": ("Networks & gels", "rubbery_plateau"),
    "hydrogel-mesh-size": ("Networks & gels", "mesh"),
    "network-formation": ("Networks & gels", "network"),
    "flory-huggins": ("Phase behaviour", "phase"),
    "chain-dimensions": ("Chain physics", "coil"),
    # bench
    "air-free-technique": ("Lab technique", "schlenk"),
    "recipe-scaling": ("Lab technique", "beakers"),
    # families
    "polymer-families": ("Polymer families", "architectures"),
    "acrylate-polymers": ("Polymer families", "acrylate"),
    "methacrylate-polymers": ("Polymer families", "methacrylate"),
    "vinyl-polymers": ("Polymer families", "styrene"),
    "silicone-polymers": ("Polymer families", "siloxane"),
    "diene-elastomers": ("Polymer families", "diene"),
    "polyesters": ("Polymer families", "ester"),
    "polyamides": ("Polymer families", "amide"),
    "ring-opening-polymers": ("Polymer families", "rop"),
    "conjugated-polymers": ("Polymer families", "thiophene"),
    "block-copolymers": ("Polymer families", "block"),
    "bottlebrush-polymers": ("Polymer families", "brush"),
    # site
    "polymer-search": ("Structure search", "search"),
    "polymer-chain-game": ("Interactive", "beads"),
    "calculator": ("Calculator", "keypad"),
    "glossary": ("Reference", "book"),
    "founder": ("About", "ring"),
    "whats-new": ("Updates", "timeline"),
    "privacy": ("Legal", "shield"),
}

# Shorter card titles where the page <title> is too long for a card.
TITLE_OVERRIDES = {
    "thermal-instrument-guide": "Running DSC, TGA and DMA: standard methods",
    "ring-opening-polymers": "Polyethers, lactones and ring-opening polymers",
    "end-group-analysis": "End group & pendant group analysis",
}

def titles():
    sm = open(os.path.join(ROOT, "sitemap.xml"), encoding="utf-8").read()
    pages = re.findall(r"<loc>https://getpolytechniques\.com/([^<]*)</loc>", sm)
    out = []
    for p in pages:
        f = p or "index.html"
        slug = f.replace(".html", "") or "index"
        html = open(os.path.join(ROOT, f), encoding="utf-8", errors="replace").read()
        m = re.search(r"<title>([^<]*)</title>", html)
        t = (m.group(1) if m else f).replace(": PolyTechniques", "").strip()
        t = t.replace("&amp;", "&").replace("&ndash;", "–").replace("&#39;", "'")
        out.append((slug, TITLE_OVERRIDES.get(slug, t)))
    return out


# --------------------------------------------------------------- helpers ----
def P(x, y):
    return (x * S, y * S)


def line(d, pts, fill, width):
    pts = [P(x, y) for x, y in pts]
    d.line(pts, fill=fill, width=int(width * S), joint="curve")
    r = width * S / 2
    for x, y in (pts[0], pts[-1]):          # round caps
        d.ellipse([x - r, y - r, x + r, y + r], fill=fill)


def dot(d, x, y, r, fill, outline=None, ow=0):
    d.ellipse([(x - r) * S, (y - r) * S, (x + r) * S, (y + r) * S], fill=fill,
              outline=outline, width=int(ow * S))


def curve(f, x0, x1, n=240):
    return [(x0 + (x1 - x0) * i / n, f(x0 + (x1 - x0) * i / n)) for i in range(n + 1)]


def gauss(x, mu, sig):
    return math.exp(-0.5 * ((x - mu) / sig) ** 2)


def hex_pts(cx, cy, r, rot=30):
    return [P(cx + r * math.cos(math.radians(60 * k + rot)),
              cy + r * math.sin(math.radians(60 * k + rot))) for k in range(6)]


def wrap(d, text, fnt, maxw):
    lines = []
    for word in text.split():
        trial = (lines[-1] + " " + word) if lines else word
        if lines and d.textlength(trial, font=fnt) > maxw:
            lines.append(word)
        elif lines:
            lines[-1] = trial
        else:
            lines.append(word)
    return lines


# ---------------------------------------------------------------- panel -----
# Motif box inside the navy panel.
MX0, MX1 = SPLIT + 60, W - 60
MY0, MY1 = 150, 478


# ---------------------------------------------------------------- panel -----
# Motif box inside the navy panel.
MX0, MX1 = SPLIT + 60, W - 60
MY0, MY1 = 150, 478
CX, CY = (MX0 + MX1) / 2, (MY0 + MY1) / 2
LIGHT = (226, 232, 240)
FILL = (234, 88, 12, 60)
F_ATOM = font(600, 26)
F_SMALL = font(600, 20)


def axes(d, label=None, ylabel=None):
    line(d, [(MX0, MY0 - 10), (MX0, MY1), (MX1, MY1)], SLATE, 3)
    if label:
        d.text(P(MX0 + 8, MY1 + 14), label, font=F_AXIS, fill=SLATE)
    if ylabel:
        d.text(P(MX0 + 12, MY0 - 14), ylabel, font=F_AXIS, fill=SLATE)


def text(d, x, y, s, fnt=None, fill=LIGHT, anchor="mm"):
    d.text(P(x, y), s, font=fnt or F_ATOM, fill=fill, anchor=anchor)


def atom(d, x, y, s, fill=LIGHT):
    """An element label sitting on a bond junction, knocked out of the bonds."""
    r = 13 + 6 * (len(s) - 1)
    d.ellipse([P(x - r, y - 16), P(x + r, y + 16)], fill=NAVY)
    text(d, x, y + 1, s, fill=fill)


def rich(d, x, y, parts, fnt=None, fill=LIGHT, anchor="m"):
    """Text with sub/superscripts. parts: list of (string, kind), kind is
    "" (normal), "sub" or "sup". anchor "m" centres the run on x, "l" starts at x."""
    fnt = fnt or F_ATOM
    size = fnt.size / S
    small = font(600, int(size * 0.62))
    widths = [d.textlength(t, font=small if k else fnt) / S for t, k in parts]
    cx = x - sum(widths) / 2 if anchor == "m" else x
    for (t, k), w in zip(parts, widths):
        dy = {"": 0, "sub": size * 0.28, "sup": -size * 0.32}[k]
        d.text(P(cx, y + dy), t, font=small if k else fnt, fill=fill, anchor="lm")
        cx += w


def polar(x, y, length, deg):
    """Point at distance length and screen angle deg (0 = right, 90 = down)."""
    a = math.radians(deg)
    return (x + length * math.cos(a), y + length * math.sin(a))


def dbond(d, a, b, colour=ORANGE, width=5, gap=8, side=1):
    """Double bond: the full line plus a shorter inner line on one side."""
    line(d, [a, b], colour, width)
    dx, dy = b[0] - a[0], b[1] - a[1]
    L = math.hypot(dx, dy)
    nx, ny = -dy / L * gap * side, dx / L * gap * side
    t = 0.16
    a2 = (a[0] + dx * t + nx, a[1] + dy * t + ny)
    b2 = (b[0] - dx * t + nx, b[1] - dy * t + ny)
    line(d, [a2, b2], colour, width)


def arrow(d, a, b, colour=LIGHT, width=4, head=14):
    line(d, [a, b], colour, width)
    ang = math.atan2(b[1] - a[1], b[0] - a[0])
    for s in (-1, 1):
        p = (b[0] - head * math.cos(ang + s * 0.5), b[1] - head * math.sin(ang + s * 0.5))
        line(d, [b, p], colour, width)


def brackets(d, lx, rx, top, bot, n=True, colour=LIGHT):
    for x, sgn in ((lx, 1), (rx, -1)):
        line(d, [(x + sgn * 16, top), (x, top), (x, bot), (x + sgn * 16, bot)], colour, 4)
    if n:
        d.text(P(rx + 8, bot - 10), "n", font=font(500, 28), fill=colour)


def zigzag(x0, y0, n_bonds, L=46, up_first=True):
    """Skeletal-formula zigzag, 120 degree angles, bond length L."""
    dx, dy = L * math.cos(math.radians(30)), L * math.sin(math.radians(30))
    pts = [(x0, y0)]
    for i in range(n_bonds):
        up = (i % 2 == 0) == up_first
        pts.append((pts[-1][0] + dx, pts[-1][1] + (-dy if up else dy)))
    return pts


def chain(d, pts, colour=ORANGE, width=6, doubles=()):
    for k, (a, b) in enumerate(zip(pts, pts[1:])):
        if k in doubles:
            dbond(d, a, b, colour, width, side=1 if pts[k][1] > pts[k + 1][1] else -1)
        else:
            line(d, [a, b], colour, width)


def is_upper(pts, i):
    nb = [pts[j][1] for j in (i - 1, i + 1) if 0 <= j < len(pts)]
    return all(pts[i][1] < y for y in nb)


def centred_zigzag(n_bonds, L=46, cy=None, up_first=True):
    w = n_bonds * L * math.cos(math.radians(30))
    return zigzag(CX - w / 2, (cy or CY) + 11, n_bonds, L, up_first)


# ---------------------------------------------------------- analysis --------
def m_gpc_trace(d):
    axes(d, "elution volume")
    base = MY1 - 4
    f = lambda x: base - 270 * gauss(x, 965, 48) - 70 * gauss(x, 860, 30)
    pts = curve(f, MX0 + 10, MX1 - 6)
    d.polygon([P(x, y) for x, y in pts] + [P(MX1 - 6, base), P(MX0 + 10, base)], fill=FILL)
    line(d, pts, ORANGE, 6)


def m_gpc_bimodal(d):
    axes(d, "elution volume")
    base = MY1 - 4
    f = lambda x: base - 150 * gauss(x, 850, 26) - 260 * gauss(x, 1010, 30)
    line(d, curve(f, MX0 + 10, MX1 - 6, 300), ORANGE, 6)
    for x, lab in ((850, "2×"), (1010, "1×")):
        line(d, [(x, MY0 - 4), (x, MY0 + 14)], SLATE, 3)
        text(d, x, MY0 - 22, lab, F_SMALL, SLATE)


def m_gpc_calibration(d):
    axes(d, "elution volume", "log M")
    pts = [(x, MY0 + 30 + (MY1 - MY0 - 60) * ((x - MX0) / (MX1 - MX0)) ** 1.0
            + 34 * math.sin(math.pi * (x - MX0) / (MX1 - MX0))) for x in range(int(MX0) + 10, int(MX1) - 6, 2)]
    line(d, pts, ORANGE, 6)
    for k in range(1, 7):
        x, y = pts[int(k * (len(pts) - 1) / 7)]
        dot(d, x, y, 10, NAVY, ORANGE_SOFT, 4)


def m_mwd_histogram(d):
    axes(d, "chain length")
    base = MY1 - 4
    f = lambda x: 270 * (x - MX0) / 90 * math.exp(1 - (x - MX0) / 90) if x > MX0 else 0
    bw = 24
    x = MX0 + 8
    while x + bw < MX1:
        h = f(x + bw / 2)
        d.rectangle([P(x + 3, base - h), P(x + bw - 3, base)], fill=(120, 138, 158, 120))
        x += bw
    line(d, curve(lambda x: base - f(x), MX0 + 6, MX1 - 6), ORANGE, 6)


def m_dispersity(d):
    axes(d, "log M")
    base = MY1 - 4
    line(d, curve(lambda x: base - 150 * gauss(x, 960, 85), MX0 + 10, MX1 - 6), SLATE, 4)
    line(d, curve(lambda x: base - 280 * gauss(x, 960, 34), MX0 + 10, MX1 - 6), ORANGE, 6)
    text(d, 960, MY0 - 16, "Đ", font(700, 30), ORANGE_SOFT)


def m_nmr(d):
    base = MY1 - 4
    line(d, [(MX0, base), (MX1, base)], SLATE, 3)
    peaks = [(800, 70, 6), (845, 210, 5), (905, 120, 5), (990, 290, 4), (1050, 90, 6)]
    f = lambda x: base - sum(h / (1 + ((x - c) / w) ** 2) for c, h, w in peaks)
    line(d, curve(f, MX0 + 4, MX1 - 4, 600), ORANGE, 4)
    # integral steps
    run, pts = 0, []
    for x in range(int(MX0), int(MX1)):
        run += sum(h / (1 + ((x - c) / w) ** 2) for c, h, w in peaks)
        pts.append((x, MY0 + 120 - run * 0.03))
    line(d, pts, SLATE, 3)
    d.text(P(MX1 - 44, MY1 + 14), "ppm", font=F_AXIS, fill=SLATE)


def m_tg_step(d):
    axes(d, "temperature", "heat flow")
    f = lambda x: MY0 + 110 + 120 / (1 + math.exp(-(x - CX) / 16))
    line(d, curve(f, MX0 + 10, MX1 - 6), ORANGE, 6)
    line(d, [(MX0 + 20, MY0 + 106), (CX + 40, MY0 + 112)], SLATE, 3)
    line(d, [(CX - 40, MY0 + 228), (MX1 - 10, MY0 + 234)], SLATE, 3)
    dot(d, CX, f(CX), 11, NAVY, ORANGE_SOFT, 5)
    text(d, CX + 34, f(CX) - 6, "Tg", F_SMALL, ORANGE_SOFT, "lm")


def m_tga(d):
    axes(d, "temperature", "mass %")
    steps = [(840, 70, 14), (960, 120, 16), (1060, 60, 12)]
    f = lambda x: MY0 + 20 + sum(h / (1 + math.exp(-(x - c) / w)) for c, h, w in steps)
    line(d, curve(f, MX0 + 10, MX1 - 6, 300), ORANGE, 6)
    # derivative, dashed
    g = lambda x: MY1 - 10 - sum(h * 1.6 * math.exp(-(x - c) / w) / (1 + math.exp(-(x - c) / w)) ** 2 / w * 10
                                  for c, h, w in steps)
    pts = curve(g, MX0 + 10, MX1 - 6, 300)
    for k in range(0, len(pts) - 4, 8):
        line(d, pts[k:k + 5], ORANGE_SOFT, 3)


def m_temp_program(d):
    line(d, [(MX0, MY0 - 10), (MX0, MY1), (MX1, MY1)], SLATE, 3)
    t = lambda f: MX0 + 10 + (MX1 - MX0 - 20) * f
    T = lambda f: MY1 - 20 - (MY1 - MY0 - 40) * f
    pts = [(t(0), T(0.05)), (t(0.28), T(0.95)), (t(0.38), T(0.95)), (t(0.66), T(0.05)),
           (t(0.74), T(0.05)), (t(1.0), T(0.95))]
    line(d, pts[:3], ORANGE, 6)
    line(d, pts[2:5], ORANGE_SOFT, 6)
    line(d, pts[4:], ORANGE, 6)
    for lab, f in (("heat", 0.12), ("cool", 0.47), ("heat", 0.85)):
        text(d, t(f), MY1 + 26, lab, F_SMALL, SLATE)


def m_tts(d):
    axes(d, "log frequency", "log G'")
    for k in range(4):
        off = k * 55
        f = lambda x, o=off: MY1 - 40 - 230 / (1 + math.exp(-(x - 830 - o) / 18))
        last = k == 3
        line(d, curve(f, MX0 + 10, MX1 - 6), ORANGE if last else SLATE, 6 if last else 4)
    arrow(d, (860, MY0 + 30), (1010, MY0 + 30), ORANGE_SOFT, 3)


# --------------------------------------------------- kinetics, mechanism ----
def m_autoaccel(d):
    axes(d, "time", "conversion")
    f = lambda x: MY1 - 8 - 290 * (0.25 * (1 - math.exp(-(x - MX0) / 60)) +
                                   0.75 / (1 + math.exp(-(x - 990) / 22)))
    line(d, curve(f, MX0 + 6, MX1 - 6, 300), ORANGE, 6)
    text(d, 990 - 24, f(990), "gel effect", F_SMALL, ORANGE_SOFT, "rm")


def m_aliquots(d):
    n, vw, vh = 5, 44, 170
    gap = (MX1 - MX0 - n * vw) / (n - 1)
    for i in range(n):
        x = MX0 + i * (vw + gap)
        top, bot = MY0 + 70, MY0 + 70 + vh
        frac = 0.85 - i * 0.17
        lvl = bot - (vh - 30) * 0.8
        d.rounded_rectangle([P(x, lvl), P(x + vw, bot)], radius=10 * S,
                            fill=(234, 88, 12, int(40 + 180 * frac)))
        d.rounded_rectangle([P(x, top), P(x + vw, bot)], radius=10 * S, outline=ORANGE_SOFT, width=4 * S)
        d.rectangle([P(x - 6, top - 22), P(x + vw + 6, top)], fill=SLATE)
        text(d, x + vw / 2, bot + 34, f"t{i + 1}", F_SMALL, SLATE)


def m_ftir_nco(d):
    base = MY0 + 40
    line(d, [(MX0, base), (MX1, base)], SLATE, 3)
    for k, h in enumerate((260, 190, 120, 60, 20)):
        f = lambda x, h=h: base + h * gauss(x, CX, 26)
        line(d, curve(f, MX0 + 10, MX1 - 10), ORANGE if k == 0 else (234, 88, 12, 200 - k * 35), 5)
    rich(d, CX, MY1 + 24, [("N=C=O stretch, 2270 cm", ""), ("-1", "sup")], F_AXIS, SLATE)


def m_mayo_lewis(d):
    axes(d, "feed composition", "copolymer")
    line(d, [(MX0, MY1), (MX1, MY0)], SLATE, 3)
    r1, r2 = 0.45, 0.6

    def F1(f1):
        f2 = 1 - f1
        return (r1 * f1 * f1 + f1 * f2) / (r1 * f1 * f1 + 2 * f1 * f2 + r2 * f2 * f2)
    pts = [(MX0 + (MX1 - MX0) * t / 200, MY1 - (MY1 - MY0) * F1(t / 200)) for t in range(201)]
    line(d, pts, ORANGE, 6)
    # azeotrope point, where F1 = f1
    fa = (1 - r2) / (2 - r1 - r2)
    dot(d, MX0 + (MX1 - MX0) * fa, MY1 - (MY1 - MY0) * fa, 10, NAVY, ORANGE_SOFT, 4)


def m_propagation(d):
    """A growing chain end, a radical, adding across the C=C of a monomer."""
    pts = zigzag(MX0 - 20, CY + 70, 5, 52)
    chain(d, pts, width=7)
    end = pts[-1]
    dot(d, end[0] + 16, end[1] - 4, 8, ORANGE_SOFT)
    m1 = (end[0] + 70, end[1] - 120)
    m2 = polar(*m1, 56, 30)
    dbond(d, m1, m2, LIGHT, 6, side=-1)
    line(d, [m2, polar(*m2, 46, -30)], LIGHT, 6)
    # fishhook arrow from the radical to the alkene
    a0 = (end[0] + 24, end[1] - 18)
    a1 = (m1[0] + 18, m1[1] + 22)
    ctrl = (a0[0] + 70, a0[1] - 20)
    bez = [((1 - t) ** 2 * a0[0] + 2 * (1 - t) * t * ctrl[0] + t * t * a1[0],
            (1 - t) ** 2 * a0[1] + 2 * (1 - t) * t * ctrl[1] + t * t * a1[1]) for t in [i / 30 for i in range(31)]]
    line(d, bez, ORANGE_SOFT, 4)
    ang = math.atan2(bez[-1][1] - bez[-4][1], bez[-1][0] - bez[-4][0])
    line(d, [bez[-1], (bez[-1][0] - 16 * math.cos(ang - 0.5), bez[-1][1] - 16 * math.sin(ang - 0.5))], ORANGE_SOFT, 4)
    text(d, (m1[0] + m2[0]) / 2 + 30, m1[1] - 40, "monomer", F_SMALL, SLATE)
    text(d, pts[2][0], pts[2][1] + 60, "growing chain", F_SMALL, SLATE)


# --------------------------------------------------- networks, solutions ----
def m_rubbery_plateau(d):
    axes(d, "temperature", "log E'")
    f = lambda x: MY0 + 20 + 190 / (1 + math.exp(-(x - 880) / 16))
    line(d, curve(f, MX0 + 10, MX1 - 6), ORANGE, 6)
    for k in range(3):
        y = MY0 + 210
        line(d, [(980 + k * 48, y - 16), (980 + k * 48, y - 4)], ORANGE_SOFT, 3)
    text(d, 1050, MY0 + 246, "rubbery plateau", F_SMALL, ORANGE_SOFT)


def m_mesh(d):
    n, x0, y0, s = 5, MX0 + 30, MY0 + 4, 76
    for i in range(n):
        line(d, [(x0 + i * s, y0), (x0 + i * s, y0 + (n - 1) * s)], SLATE, 4)
        line(d, [(x0, y0 + i * s), (x0 + (n - 1) * s, y0 + i * s)], SLATE, 4)
    for i in range(n):
        for j in range(n):
            dot(d, x0 + i * s, y0 + j * s, 6, ORANGE)
    dot(d, x0 + 1.5 * s, y0 + 1.5 * s, 24, (234, 88, 12, 150))
    dot(d, x0 + 3.0 * s, y0 + 2.6 * s, 50, (234, 88, 12, 60), ORANGE_SOFT, 3)
    arrow(d, (x0 + 0.1 * s, y0 + (n - 1) * s + 24), (x0 + 0.95 * s, y0 + (n - 1) * s + 24), LIGHT, 3, 10)
    arrow(d, (x0 + 0.9 * s, y0 + (n - 1) * s + 24), (x0 + 0.05 * s, y0 + (n - 1) * s + 24), LIGHT, 3, 10)
    text(d, x0 + 1.15 * s, y0 + (n - 1) * s + 25, "mesh size", F_SMALL, LIGHT, "lm")


def m_network(d):
    import random
    rnd = random.Random(7)
    nodes = {}
    for i in range(5):
        for j in range(4):
            nodes[i, j] = (MX0 + 20 + i * (MX1 - MX0 - 40) / 4 + rnd.uniform(-14, 14),
                           MY0 + 10 + j * (MY1 - MY0 - 20) / 3 + rnd.uniform(-14, 14))
    for (i, j), (x, y) in nodes.items():
        for di, dj in ((1, 0), (0, 1)):
            if (i + di, j + dj) in nodes and rnd.random() > 0.18:
                x2, y2 = nodes[i + di, j + dj]
                mx, my = (x + x2) / 2 + rnd.uniform(-12, 12), (y + y2) / 2 + rnd.uniform(-12, 12)
                line(d, [(x, y), (mx, my), (x2, y2)], SLATE, 4)
    for x, y in nodes.values():
        dot(d, x, y, 11, ORANGE)


def m_phase(d):
    axes(d, "volume fraction")
    cx, w = CX, (MX1 - MX0) / 2 - 24
    yb, ytop = MY1 - 40, MY0 + 10
    binodal = [(cx + w * u, yb - (yb - ytop) * (1 - (1 - u * u) ** 0.32))
               for u in [-1 + 2 * t / 300 for t in range(301)]]
    spin = [(cx + w * 0.8 * u, yb - (yb - ytop) * u * u) for u in [-1 + 2 * t / 120 for t in range(121)]]
    for k in range(0, len(spin) - 3, 6):
        line(d, spin[k:k + 4], ORANGE_SOFT, 3)
    line(d, binodal, ORANGE, 6)
    dot(d, cx, yb, 10, NAVY, ORANGE, 4)


def m_coil(d):
    import random
    rnd = random.Random(11)
    x, y = CX, CY
    pts = [(x, y)]
    ang = 0
    for _ in range(140):
        ang += rnd.uniform(-1.1, 1.1)
        x += 16 * math.cos(ang) + (CX - x) * 0.04
        y += 16 * math.sin(ang) + (CY - y) * 0.04
        pts.append((x, y))
    line(d, pts, ORANGE, 5)
    line(d, [pts[0], pts[-1]], LIGHT, 3)
    dot(d, *pts[0], 9, LIGHT)
    dot(d, *pts[-1], 9, LIGHT)


# ----------------------------------------------------------------- bench ----
def m_schlenk(d):
    neck_w, top = 30, MY0 - 10
    bulb_cy, bulb_r = MY1 - 100, 100
    cx = CX - 40
    line(d, [(cx - neck_w, top), (cx - neck_w, bulb_cy - bulb_r + 14)], ORANGE, 6)
    line(d, [(cx + neck_w, top), (cx + neck_w, bulb_cy - bulb_r + 14)], ORANGE, 6)
    a0 = math.degrees(math.asin(neck_w / bulb_r))
    arc = [(cx + bulb_r * math.sin(math.radians(a)), bulb_cy - bulb_r * math.cos(math.radians(a)))
           for a in [a0 + (360 - 2 * a0) * t / 200 for t in range(201)]]
    line(d, arc, ORANGE, 6)
    r2 = bulb_r - 8
    a1 = math.degrees(math.asin(30 / r2))
    liq = [(cx + r2 * math.cos(math.radians(a)), bulb_cy + r2 * math.sin(math.radians(a)))
           for a in [a1 + t * (180 - 2 * a1) / 100 for t in range(101)]]
    d.polygon([P(x, y) for x, y in liq], fill=(234, 88, 12, 70))
    sy = top + 64
    line(d, [(cx + neck_w, sy), (cx + 170, sy)], ORANGE, 6)
    dot(d, cx + 112, sy, 16, NAVY, ORANGE_SOFT, 5)
    line(d, [(cx + 112, sy - 26), (cx + 112, sy + 26)], ORANGE_SOFT, 5)
    rich(d, cx + 184, sy, [("N", ""), ("2", "sub")], F_SMALL, SLATE, "l")
    # stir bar
    d.rounded_rectangle([P(cx - 26, bulb_cy + 74), P(cx + 26, bulb_cy + 84)], radius=5 * S, fill=LIGHT)


def m_beakers(d):
    def beaker(x, y, w, h, fill_frac):
        lvl = y + h * (1 - fill_frac)
        d.rectangle([P(x + 4, lvl), P(x + w - 4, y + h - 4)], fill=(234, 88, 12, 80))
        line(d, [(x - 8, y), (x, y + 8), (x, y + h), (x + w, y + h), (x + w, y)], ORANGE, 6)
        for k in range(1, 4):
            yy = y + h * k / 4
            line(d, [(x + w - 22, yy), (x + w - 6, yy)], ORANGE_SOFT, 3)
    beaker(MX0 + 10, MY1 - 110, 80, 100, 0.5)
    beaker(MX1 - 170, MY0 + 30, 160, 260, 0.5)
    arrow(d, (MX0 + 110, MY1 - 140), (MX1 - 200, MY0 + 140), LIGHT, 4)
    text(d, MX0 + 70, MY0 + 120, "× 10", font(700, 34), ORANGE_SOFT)


# ------------------------------------------------------------- families -----
def repeat_unit(d):
    """The house motif: bracketed vinyl repeat unit with hollow pendants."""
    n_atoms = 9
    bx0, bx1 = MX0 - 10, MX1 + 10
    step = (bx1 - bx0) / (n_atoms - 1)
    cy, amp = CY + 60, 34
    pts = [(bx0 + i * step, cy + (amp if i % 2 else -amp)) for i in range(n_atoms)]
    for a, b in zip(pts, pts[1:]):
        line(d, [a, b], ORANGE, 7)
    lb, rb = pts[1][0] - step * 0.5, pts[6][0] + step * 0.5
    top, bot = cy - amp - 120, cy + amp + 40
    for x, sgn in ((lb, 1), (rb, -1)):
        line(d, [(x + sgn * 20, top), (x, top), (x, bot), (x + sgn * 20, bot)], LIGHT, 5)
    for i in (2, 4, 6):
        x, y = pts[i]
        line(d, [(x, y), (x, y - 62)], ORANGE, 6)
        dot(d, x, y - 82, 20, NAVY, ORANGE_SOFT, 5)
    for x, y in pts:
        dot(d, x, y, 9, ORANGE)
    d.text(P(rb + 10, bot - 14), "n", font=font(500, 34), fill=LIGHT)
    return pts


def m_repeat(d):
    repeat_unit(d)


def m_architectures(d):
    cells = [(MX0 + 90, MY0 + 50), (MX1 - 90, MY0 + 50), (MX0 + 90, MY1 - 90), (MX1 - 90, MY1 - 90)]
    # linear
    x, y = cells[0]
    pts = [(x - 80 + i * 20, y + (8 if i % 2 else -8)) for i in range(9)]
    line(d, pts, ORANGE, 5)
    # star
    x, y = cells[1]
    for k in range(6):
        line(d, [(x, y), polar(x, y, 70, k * 60 + 15)], ORANGE, 5)
    dot(d, x, y, 10, ORANGE_SOFT)
    # comb
    x, y = cells[2]
    line(d, [(x - 80, y), (x + 80, y)], ORANGE, 5)
    for k in range(5):
        xx = x - 64 + k * 32
        line(d, [(xx, y), (xx, y - 46)], ORANGE_SOFT, 4)
    # dendrimer
    x, y = cells[3]

    def branch(px, py, ang, length, depth):
        if depth == 0:
            return
        q = polar(px, py, length, ang)
        line(d, [(px, py), q], ORANGE if depth > 1 else ORANGE_SOFT, 4)
        for s in (-35, 35):
            branch(q[0], q[1], ang + s, length * 0.65, depth - 1)
    for k in range(3):
        branch(x, y, k * 120 - 90, 34, 3)
    dot(d, x, y, 9, ORANGE)
    labels = ["linear", "star", "comb", "dendrimer"]
    for (x, y), lab in zip(cells, labels):
        text(d, x, y + {"linear": 40, "star": 96, "comb": 34, "dendrimer": 92}[lab], lab, F_SMALL, SLATE)


def vinyl_ester(d, methyl):
    """One repeat unit, backbone horizontal: CH2 then the substituted carbon
    with its ester (C(=O)OCH3) hanging below and, for a methacrylate, the
    alpha-methyl above. Brackets cross the two backbone bonds."""
    y = CY - 40
    c1, c2 = (CX - 50, y), (CX + 50, y)
    lstub, rstub = (CX - 160, y), (CX + 160, y)
    line(d, [lstub, c1, c2, rstub], ORANGE, 7)
    dot(d, *c1, 8, ORANGE)
    dot(d, *c2, 8, ORANGE)
    if methyl:
        line(d, [c2, (c2[0], c2[1] - 58)], ORANGE, 7)
    carb = (c2[0], c2[1] + 62)
    line(d, [c2, carb], ORANGE, 7)
    o_d = polar(*carb, 52, 150)
    o_s = polar(*carb, 52, 30)
    dbond(d, carb, o_d, ORANGE, 6, side=1)
    line(d, [carb, o_s], ORANGE, 7)
    me = polar(*o_s, 46, 90)
    line(d, [o_s, me], ORANGE, 7)
    atom(d, *o_d, "O")
    atom(d, *o_s, "O")
    brackets(d, CX - 115, CX + 125, y - 90, me[1] + 22)


def m_acrylate(d):
    vinyl_ester(d, methyl=False)


def m_methacrylate(d):
    vinyl_ester(d, methyl=True)


def benzene(d, cx, cy, r, colour=ORANGE, rot=30):
    d.polygon(hex_pts(cx, cy, r, rot), outline=colour, width=5 * S)
    dot(d, cx, cy, r * 0.55, None, colour, 4)


def m_styrene(d):
    pts = centred_zigzag(8, 44, CY + 90)
    chain(d, pts)
    for i in (1, 3, 5, 7):
        c = pts[i]
        top = (c[0], c[1] - 34)
        line(d, [c, top], ORANGE, 6)
        benzene(d, c[0], top[1] - 34, 34, ORANGE_SOFT, rot=90)


def m_siloxane(d):
    n = 5
    xs = [MX0 + 10 + i * (MX1 - MX0 - 20) / (n - 1) for i in range(n)]
    y = CY + 10
    line(d, [(MX0 - 30, y), (MX1 + 30, y)], ORANGE, 6)
    for i, x in enumerate(xs):
        if i % 2 == 0:
            line(d, [(x, y - 70), (x, y + 70)], ORANGE, 6)
            rich(d, x, y - 92, [("CH", ""), ("3", "sub")], F_SMALL, ORANGE_SOFT)
            rich(d, x, y + 90, [("CH", ""), ("3", "sub")], F_SMALL, ORANGE_SOFT)
            atom(d, x, y, "Si")
        else:
            atom(d, x, y, "O")


def mid(a, b):
    return ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)


def m_diene(d):
    """1,4-polybutadiene: CH2-CH=CH-CH2 repeat units."""
    pts = centred_zigzag(9, 48, CY)
    chain(d, pts, doubles=(2, 6))
    lb, rb = mid(pts[0], pts[1])[0], mid(pts[4], pts[5])[0]
    brackets(d, lb, rb, CY - 70, CY + 70)


def m_ester(d):
    """Poly(ethylene oxalate) style repeat: C(=O)-O-CH2-CH2-O-C(=O)."""
    pts = centred_zigzag(7, 50, CY)
    chain(d, pts)
    tops, bots = [], []
    for i in (1, 6):
        up = is_upper(pts, i)
        q = polar(*pts[i], 48, -90 if up else 90)
        dbond(d, pts[i], q, ORANGE, 5, side=1 if up else -1)
        atom(d, *q, "O")
        (tops if up else bots).append(q[1])
    for i in (2, 5):
        atom(d, *pts[i], "O")
    lb, rb = mid(pts[0], pts[1])[0], mid(pts[6], pts[7])[0]
    top = min(tops + [p[1] for p in pts]) - 26
    bot = max(bots + [p[1] for p in pts]) + 26
    brackets(d, lb, rb, top, bot)


def m_amide(d):
    """Two nylon strands joined by N–H···O=C hydrogen bonds."""
    up = centred_zigzag(8, 46, MY0 + 60, up_first=False)
    lo = centred_zigzag(8, 46, MY1 - 80, up_first=True)
    chain(d, up)
    chain(d, lo)
    for k, i in enumerate((2, 6)):
        # upper strand: lower vertices point down at the lower strand
        if k == 0:
            q = polar(*up[i], 44, 90)
            dbond(d, up[i], q, ORANGE, 5)
            atom(d, *q, "O")
            nh_lo = lo[i]
            h = polar(*nh_lo, 40, -90)
            line(d, [nh_lo, h], ORANGE, 5)
            atom(d, *h, "H")
            atom(d, *nh_lo, "N")
            a, b = q, h
        else:
            h = polar(*up[i], 40, 90)
            line(d, [up[i], h], ORANGE, 5)
            atom(d, *h, "H")
            atom(d, *up[i], "N")
            q = polar(*lo[i], 44, -90)
            dbond(d, lo[i], q, ORANGE, 5)
            atom(d, *q, "O")
            a, b = h, q
        ys = [a[1] + 20 + j * 10 for j in range(int((b[1] - a[1] - 40) / 10))]
        for yy in ys[::2]:
            line(d, [(a[0], yy), (a[0], yy + 5)], LIGHT, 3)


def m_rop(d):
    """delta-Valerolactone (O, C=O and four CH2 in a six-membered ring) opening
    into its polyester, -[C(=O)-(CH2)4-O]-: the repeat unit carries all four
    CH2 of the ring, so the two drawings agree atom for atom."""
    cx, cy, r = MX0 + 40, CY, 38
    ring = [(cx + r * math.cos(math.radians(60 * k - 90)), cy + r * math.sin(math.radians(60 * k - 90)))
            for k in range(6)]
    for a, b in zip(ring, ring[1:] + ring[:1]):
        line(d, [a, b], ORANGE, 6)
    q = polar(*ring[1], 34, -30)
    dbond(d, ring[1], q, ORANGE, 5)
    atom(d, *q, "O")
    atom(d, *ring[0], "O")
    arrow(d, (cx + 56, cy), (cx + 100, cy), LIGHT, 4)
    # stub, C(=O), CH2 x4, O, stub
    pts = zigzag(cx + 112, cy + 10, 7, 35)
    chain(d, pts)
    q2 = polar(*pts[1], 36, -90)
    dbond(d, pts[1], q2, ORANGE, 5)
    atom(d, *q2, "O")
    atom(d, *pts[6], "O")
    brackets(d, mid(pts[0], pts[1])[0], mid(pts[6], pts[7])[0], cy - 72, cy + 50)


def ring_dbond(d, a, b, centre, colour=ORANGE, width=5):
    """Double bond inside a ring: the inner line goes toward the ring centre."""
    mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
    dx, dy = b[0] - a[0], b[1] - a[1]
    nx, ny = -dy, dx
    side = 1 if (centre[0] - mx) * nx + (centre[1] - my) * ny > 0 else -1
    dbond(d, a, b, colour, width, side=side)


def m_thiophene(d):
    L = 44
    R = L / (2 * math.sin(math.radians(36)))
    dx = math.sqrt(L * L - (0.618 * R) ** 2)
    spacing = 2 * R * math.cos(math.radians(18)) + dx
    rings = 4
    x0 = CX - spacing * (rings - 1) / 2
    prev = None
    for i in range(rings):
        s = 1 if i % 2 == 0 else -1           # S below (1) or above (-1)
        c = (x0 + i * spacing, CY)
        v = [polar(c[0], c[1], R, 90 * s + 72 * k) for k in range(5)]
        # v[0] is S; v[1] and v[4] are the alpha carbons, v[2]=v[3] the C3=C4... bond
        for k in range(5):
            p, q = v[k], v[(k + 1) % 5]
            if k in (1, 3):
                ring_dbond(d, p, q, c)
            else:
                line(d, [p, q], ORANGE, 5)
        atom(d, *v[0], "S")
        left, right = sorted((v[1], v[4]))
        if prev:
            line(d, [prev, left], ORANGE, 5)
        prev = right
    text(d, CX, MY1 - 10, "polythiophene", F_SMALL, SLATE)


def m_block(d):
    import random
    rnd = random.Random(5)
    pts = []
    x, y = MX0, CY
    for i in range(40):
        pts.append((x, y))
        x += (MX1 - MX0) / 39
        y = CY + 70 * math.sin(i / 3.2) + rnd.uniform(-10, 10)
    half = 20
    line(d, pts[:half + 1], ORANGE, 7)
    line(d, pts[half:], SLATE, 7)
    for i, (x, y) in enumerate(pts):
        if i % 2 == 0:
            dot(d, x, y, 9, ORANGE if i <= half else LIGHT)
    text(d, (pts[0][0] + pts[half][0]) / 2, MY1, "block A", F_SMALL, ORANGE_SOFT)
    text(d, (pts[half][0] + pts[-1][0]) / 2, MY1, "block B", F_SMALL, LIGHT)


def m_brush(d):
    pts = centred_zigzag(8, 48, CY)
    chain(d, pts, width=7)
    for i, (x, y) in enumerate(pts):
        sgn = -1 if is_upper(pts, i) or i == 0 else 1
        wig = [(x + 7 * math.sin(t * 1.25), y + sgn * t * 9) for t in range(15)]
        line(d, wig, ORANGE_SOFT, 3)
        dot(d, x, y, 9, ORANGE)


# ----------------------------------------------------------------- site -----
def m_search(d):
    # a small repeat unit, then a magnifier over it
    pts = centred_zigzag(6, 44, CY + 30)
    chain(d, pts, SLATE, 5)
    for i in (1, 3, 5):
        if is_upper(pts, i):
            line(d, [pts[i], (pts[i][0], pts[i][1] - 40)], SLATE, 5)
            dot(d, pts[i][0], pts[i][1] - 54, 14, NAVY, SLATE, 4)
    mx, my, mr = CX + 20, CY - 10, 72
    dot(d, mx, my, mr, (19, 33, 47, 160), ORANGE, 8)
    line(d, [polar(mx, my, mr + 4, 45), polar(mx, my, mr + 80, 45)], ORANGE, 14)


def m_beads(d):
    import random
    cols = [ORANGE, ORANGE_SOFT, LIGHT]
    path = []
    for k in range(13):
        t = k / 12
        path.append((MX0 + 20 + t * (MX1 - MX0 - 120), CY + 60 * math.sin(t * 2 * math.pi)))
    line(d, path, SLATE, 4)
    for k, (x, y) in enumerate(path):
        dot(d, x, y, 16, cols[k % 3])
    # a new bead about to join
    lx, ly = MX1 - 30, CY - 110
    dot(d, lx, ly, 16, ORANGE)
    arrow(d, (lx - 10, ly + 26), (path[-1][0] + 18, path[-1][1] - 22), ORANGE_SOFT, 3, 12)


def m_keypad(d):
    kx, ky, kw, kh, g = MX0 + 40, MY0 + 70, 66, 52, 14
    d.rounded_rectangle([P(MX0 + 26, MY0 - 10), P(MX1 - 26, MY0 + 54)], radius=10 * S,
                        outline=ORANGE_SOFT, width=3 * S)
    text(d, MX1 - 46, MY0 + 22, "Mn = 24 500", font(600, 26), LIGHT, "rm")
    for r in range(4):
        for c in range(4):
            x, y = kx + c * (kw + g), ky + r * (kh + g)
            hot = (r, c) == (3, 3)
            d.rounded_rectangle([P(x, y), P(x + kw, y + kh)], radius=10 * S,
                                fill=ORANGE if hot else (255, 255, 255, 18),
                                outline=None if hot else SLATE, width=2 * S)
    text(d, kx + 3 * (kw + g) + kw / 2, ky + 3 * (kh + g) + kh / 2, "=", font(700, 30), NAVY)


def m_book(d):
    cx, top, bot = CX, MY0 + 10, MY1 - 30
    for s in (-1, 1):
        x0 = cx
        x1 = cx + s * 170
        d.polygon([P(x0, top + 16), P(x1, top), P(x1, bot), P(x0, bot + 16)],
                  fill=(255, 255, 255, 12), outline=ORANGE, width=5 * S)
        for k in range(6):
            y = top + 50 + k * 34
            line(d, [(x0 + s * 24, y + 10), (x1 - s * 24, y)], SLATE if k else ORANGE_SOFT, 3 if k else 5)
    text(d, cx - 100, top + 36, "A–Z", font(700, 26), ORANGE_SOFT)


def m_ring(d):
    d.polygon(hex_pts(CX, CY, 150), outline=ORANGE, width=8 * S)
    d.polygon(hex_pts(CX, CY, 116), outline=ORANGE_SOFT, width=3 * S)
    text(d, CX, CY + 4, "P", font(700, 120), LIGHT)


def m_timeline(d):
    y = CY
    line(d, [(MX0, y), (MX1, y)], SLATE, 4)
    xs = [MX0 + 20 + k * (MX1 - MX0 - 40) / 4 for k in range(5)]
    for k, x in enumerate(xs):
        last = k == 4
        if last:
            dot(d, x, y, 28, (234, 88, 12, 70))
        dot(d, x, y, 13 if last else 9, ORANGE if last else SLATE)
        h = 50 + (k % 2) * 40
        sgn = -1 if k % 2 else 1
        line(d, [(x, y + sgn * 18), (x, y + sgn * h)], ORANGE_SOFT if last else SLATE, 3)
        d.rounded_rectangle([P(x - 34, y + sgn * h - (24 if sgn < 0 else 0)),
                             P(x + 34, y + sgn * h + (0 if sgn < 0 else 24))],
                            radius=6 * S, fill=ORANGE if last else (120, 138, 158, 90))
    text(d, xs[-1], y - 130, "new", F_SMALL, ORANGE_SOFT)


def m_shield(d):
    cx, top, w, h = CX, MY0, 130, 300
    pts = [(cx, top), (cx + w, top + 46), (cx + w, top + 150)]
    pts += [(cx + w * math.cos(math.radians(a)) * (1 - (a / 90) * 0.0), top + 150 + (h - 150) * math.sin(math.radians(a)))
            for a in range(0, 91, 5)]
    left = [(2 * cx - x, y) for x, y in pts[::-1]]
    shape = pts + left[1:]
    line(d, shape + [shape[0]], ORANGE, 7)
    # keyhole
    dot(d, cx, top + 135, 26, ORANGE_SOFT)
    d.polygon([P(cx - 14, top + 140), P(cx + 14, top + 140), P(cx + 22, top + 210), P(cx - 22, top + 210)],
              fill=ORANGE_SOFT)


MOTIFS = {k[2:]: v for k, v in globals().items() if k.startswith("m_")}


def panel(d):
    d.rectangle([P(SPLIT, 0), P(W, H)], fill=NAVY)
    # faint hexagon tiling, the logo's ring repeated as texture
    r = 46
    dx, dy = r * math.sqrt(3), r * 1.5
    row = 0
    y = -r
    while y < H + r:
        x = SPLIT - r + (dx / 2 if row % 2 else 0)
        while x < W + r:
            d.polygon(hex_pts(x, y, r, rot=30), outline=(255, 255, 255, 14), width=2 * S)
            x += dx
        y += dy
        row += 1


# ----------------------------------------------------------------- card -----
_logo = None


def logo(height):
    global _logo
    if _logo is None:
        _logo = Image.open(LOGO).convert("RGBA")
    w = round(_logo.width * height * S / _logo.height)
    return _logo.resize((w, height * S), Image.LANCZOS)


def card(slug, title, label, motif, path):
    im = Image.new("RGB", (W * S, H * S), PAPER)
    d = ImageDraw.Draw(im, "RGBA")

    panel(d)
    MOTIFS[motif](d)

    # logo
    lg = logo(48)
    im.paste(lg, P(64, 64), lg)

    # topic label, orange, tracked caps
    x, y = 64, 196
    lab = label.upper()
    cx = x * S
    for ch in lab:
        d.text((cx, y * S), ch, font=F_EYEBROW, fill=ORANGE)
        cx += d.textlength(ch, font=F_EYEBROW) + 2.6 * S
    d.rectangle([P(64, 236), P(112, 241)], fill=ORANGE)

    # title: largest size that fits in three lines
    maxw = (SPLIT - 64 - 56) * S
    for size in (64, 58, 52, 46, 42):
        ft = font(700, size)
        lines = wrap(d, title, ft, maxw)
        if len(lines) <= 3:
            break
    lines = lines[:3]
    lh = size * 1.12
    ty = 268
    for ln in lines:
        d.text(P(64, ty), ln, font=ft, fill=NAVY)
        ty += lh

    # foot
    d.text(P(64, H - 84), "getpolytechniques.com", font=F_DOMAIN, fill=MUTED)
    d.rectangle([P(0, H - 8), P(SPLIT, H)], fill=ORANGE)

    im = im.resize((W, H), Image.LANCZOS)
    im.save(path, optimize=True)


def check_unique():
    motifs = [m for _, m in TOPICS.values()]
    dup = {m for m in motifs if motifs.count(m) > 1}
    if dup:
        sys.exit(f"motifs used on more than one card: {sorted(dup)}")
    missing = [slug for slug, _ in titles() if slug != "index" and slug not in TOPICS]
    if missing:
        sys.exit(f"pages with no motif assigned in TOPICS: {missing}")
    for m in motifs:
        if m not in MOTIFS:
            sys.exit(f"no drawing function m_{m}")


def main():
    os.makedirs(OUT, exist_ok=True)
    only = set(sys.argv[1:])
    n = 0
    check_unique()
    if not only or "site" in only:
        label, motif = TOPICS["site"]
        card("site", "Free polymer chemistry calculators and structure search",
             label, motif, os.path.join(OUT, "site.png"))
        n += 1
    for slug, title in titles():
        if slug == "index" or (only and slug not in only):
            continue
        label, motif = TOPICS[slug]
        card(slug, title, label, motif, os.path.join(OUT, slug + ".png"))
        n += 1
    print(f"wrote {n} cards to {OUT}")


if __name__ == "__main__":
    main()
