"""
Builds the ÉLORIA logo system as pure vector outlines (no font dependency).

    python brand/build_logo.py

Reads Bodoni Moda (opsz 28, wght 450: sturdy hairlines that survive small sizes) and Hanken Grotesk (wght 500) from the frontend's node_modules,
then writes:
  frontend/public/brand/*.svg               primary, stacked, horizontal, wordmark, monogram, favicon, social
  frontend/public/favicon.svg               favicon
  frontend/src/components/brand/logoPaths.ts  the same outlines for the React <Logo> components

Requires: pip install fonttools brotli
"""
from __future__ import annotations

import json
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / "frontend" / "node_modules" / "@fontsource-variable"
OUT = ROOT / "frontend" / "public" / "brand"
TS_OUT = ROOT / "frontend" / "src" / "components" / "brand" / "logoPaths.ts"

ESPRESSO = "#241B17"
IVORY = "#F6F1EA"
CHAMPAGNE = "#B8976A"


def load(path: Path, axes: dict[str, float]) -> TTFont:
    font = TTFont(path)
    return instancer.instantiateVariableFont(font, axes)


bodoni = load(FONTS / "bodoni-moda" / "files" / "bodoni-moda-latin-opsz-normal.woff2", {"opsz": 28, "wght": 450})
hanken = load(FONTS / "hanken-grotesk" / "files" / "hanken-grotesk-latin-wght-normal.woff2", {"wght": 520})


def glyph_path(font: TTFont, name: str, dx: float, scale: float, baseline: float) -> str:
    """Outline of one glyph as SVG path data, flipped to SVG's y-down space."""
    glyph_set = font.getGlyphSet()
    pen = SVGPathPen(glyph_set, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
    glyph_set[name].draw(TransformPen(pen, (scale, 0, 0, -scale, dx, baseline)))
    return pen.getCommands()


def text_paths(font: TTFont, text: str, size: float, tracking: float, baseline: float, x: float = 0.0,
               split_accent: bool = False):
    """Lays out text with fixed tracking (in em). Returns (main path, accent path, advance width)."""
    upm = font["head"].unitsPerEm
    scale = size / upm
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    main, accent = [], []
    cursor = x
    for i, ch in enumerate(text):
        name = cmap[ord(ch)]
        if split_accent and ch == "É":
            # Draw the base E and its acute separately so the accent can carry the champagne colour.
            glyf = font["glyf"][name]
            for component in glyf.components:
                target = accent if "acute" in component.glyphName else main
                target.append(glyph_path(font, component.glyphName, cursor + component.x * scale, scale,
                                         baseline - component.y * scale))
        else:
            main.append(glyph_path(font, name, cursor, scale, baseline))
        cursor += hmtx[name][0] * scale
        if i < len(text) - 1:
            cursor += tracking * size
    return " ".join(main), " ".join(accent), cursor - x


def cap_height(font: TTFont, size: float) -> float:
    return font["OS/2"].sCapHeight * size / font["head"].unitsPerEm


def bbox_of(font: TTFont, name: str, size: float):
    glyf = font["glyf"][name]
    glyf.recalcBounds(font["glyf"])
    s = size / font["head"].unitsPerEm
    return glyf.xMin * s, glyf.yMin * s, glyf.xMax * s, glyf.yMax * s


# ---------- Wordmark ----------
WORD_SIZE = 100
WORD_TRACKING = 0.16
word_cap = cap_height(bodoni, WORD_SIZE)
acute_top = bbox_of(bodoni, "acutecomb" if "acutecomb" in bodoni["glyf"].keys() else "acute", WORD_SIZE)
word_baseline = 140  # leaves room for the accent above the cap height
word_main, word_accent, word_width = text_paths(bodoni, "ÉLORIA", WORD_SIZE, WORD_TRACKING, word_baseline, 0, True)

# Descriptor: AESTHETIC at a fixed small size, tracked so it spans exactly the wordmark width.
desc_size = 17.0
_, _, natural = text_paths(hanken, "AESTHETIC", desc_size, 0, 0)
DESC_TRACKING = (word_width - natural) / (8 * desc_size)
desc_cap = cap_height(hanken, desc_size)

# ---------- Monogram ----------
MONO = 200
mono_size = 128
_, _, e_width = text_paths(bodoni, "É", mono_size, 0, 0)
mono_cap = cap_height(bodoni, mono_size)
# Optical centre: the cap height plus a little of the accent sits in the middle of the circle.
mono_baseline = MONO / 2 + mono_cap / 2 + 12
mono_main, mono_accent, _ = text_paths(bodoni, "É", mono_size, 0, mono_baseline, MONO / 2 - e_width / 2, True)


def svg(width: float, height: float, body: str, title: str) -> str:
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.0f} {height:.0f}" '
            f'role="img" aria-label="{title}"><title>{title}</title>{body}</svg>\n')


def wordmark_group(x: float, y: float, ink: str, accent: str) -> str:
    return (f'<g transform="translate({x:.2f} {y:.2f})"><path fill="{ink}" d="{word_main}"/>'
            f'<path fill="{accent}" d="{word_accent}"/></g>')


def descriptor(x: float, y: float, ink: str) -> str:
    path, _, _ = text_paths(hanken, "AESTHETIC", desc_size, DESC_TRACKING, y + desc_cap, x)
    return f'<path fill="{ink}" d="{path}"/>'


def monogram_group(x: float, y: float, size: float, ink: str, accent: str, ring: str | None, disc: str | None) -> str:
    k = size / MONO
    parts = []
    if disc:
        parts.append(f'<circle cx="100" cy="100" r="100" fill="{disc}"/>')
    if ring:
        parts.append(f'<circle cx="100" cy="100" r="96" fill="none" stroke="{ring}" stroke-width="2.4"/>')
    parts.append(f'<path fill="{ink}" d="{mono_main}"/><path fill="{accent}" d="{mono_accent}"/>')
    return f'<g transform="translate({x:.2f} {y:.2f}) scale({k:.4f})">{"".join(parts)}</g>'


OUT.mkdir(parents=True, exist_ok=True)
pad = 40
word_top = word_baseline - word_cap - 34  # top of the accent, approximately
rule_gap = 34

files: dict[str, str] = {}

# Stacked / primary: monogram, wordmark, hairline, descriptor.
def stacked(ink: str, accent: str, ring: str) -> str:
    mono_px = 150
    total_w = word_width + pad * 2
    y_mono = pad
    y_word = y_mono + mono_px + 46 - word_top
    rule_y = y_word + word_baseline + rule_gap
    desc_y = rule_y + rule_gap - 6
    height = desc_y + desc_cap + pad
    body = (monogram_group(total_w / 2 - mono_px / 2, y_mono, mono_px, ink, accent, ring, None)
            + wordmark_group(pad, y_word, ink, accent)
            + f'<rect x="{total_w / 2 - 60:.2f}" y="{rule_y:.2f}" width="120" height="1.6" fill="{accent}"/>'
            + descriptor(pad, desc_y, ink))
    return svg(total_w, height, body, "ÉLORIA AESTHETIC")


def primary(ink: str, accent: str) -> str:
    total_w = word_width + pad * 2
    y_word = pad - word_top
    desc_y = y_word + word_baseline + 30
    height = desc_y + desc_cap + pad
    body = wordmark_group(pad, y_word, ink, accent) + descriptor(pad, desc_y, ink)
    return svg(total_w, height, body, "ÉLORIA AESTHETIC")


def horizontal(ink: str, accent: str, ring: str) -> str:
    block_h = (word_baseline - word_top) + 30 + desc_cap
    mono_px = block_h + 12
    x_word = pad + mono_px + 44
    total_w = x_word + word_width + pad
    y_word = pad + (mono_px - block_h) / 2 - word_top
    desc_y = y_word + word_baseline + 30
    divider_x = pad + mono_px + 22
    body = (monogram_group(pad, pad, mono_px, ink, accent, ring, None)
            + f'<rect x="{divider_x:.2f}" y="{pad + 18:.2f}" width="1.6" height="{mono_px - 36:.2f}" fill="{accent}"/>'
            + wordmark_group(x_word, y_word, ink, accent) + descriptor(x_word, desc_y, ink))
    return svg(total_w, mono_px + pad * 2, body, "ÉLORIA AESTHETIC")


def wordmark(ink: str, accent: str) -> str:
    total_w = word_width + pad * 2
    height = (word_baseline - word_top) + pad * 2
    return svg(total_w, height, wordmark_group(pad, pad - word_top, ink, accent), "ÉLORIA")


def monogram(ink: str, accent: str, ring: str | None, disc: str | None, title: str = "ÉLORIA monogram") -> str:
    return svg(MONO, MONO, monogram_group(0, 0, MONO, ink, accent, ring, disc), title)


files["eloria-primary.svg"] = primary(ESPRESSO, CHAMPAGNE)
files["eloria-primary-ivory.svg"] = primary(IVORY, CHAMPAGNE)
files["eloria-primary-mono.svg"] = primary(ESPRESSO, ESPRESSO)
files["eloria-stacked.svg"] = stacked(ESPRESSO, CHAMPAGNE, CHAMPAGNE)
files["eloria-stacked-ivory.svg"] = stacked(IVORY, CHAMPAGNE, CHAMPAGNE)
files["eloria-stacked-mono.svg"] = stacked(ESPRESSO, ESPRESSO, ESPRESSO)
files["eloria-horizontal.svg"] = horizontal(ESPRESSO, CHAMPAGNE, CHAMPAGNE)
files["eloria-horizontal-ivory.svg"] = horizontal(IVORY, CHAMPAGNE, CHAMPAGNE)
files["eloria-wordmark.svg"] = wordmark(ESPRESSO, CHAMPAGNE)
files["eloria-monogram.svg"] = monogram(ESPRESSO, CHAMPAGNE, CHAMPAGNE, None)
files["eloria-monogram-mono.svg"] = monogram(ESPRESSO, ESPRESSO, ESPRESSO, None)
files["eloria-favicon.svg"] = monogram(IVORY, CHAMPAGNE, None, ESPRESSO, "ÉLORIA")
files["eloria-social-icon.svg"] = svg(
    1080, 1080,
    f'<rect width="1080" height="1080" fill="{ESPRESSO}"/>'
    + monogram_group(240, 240, 600, IVORY, CHAMPAGNE, CHAMPAGNE, None), "ÉLORIA")

for name, content in files.items():
    (OUT / name).write_text(content, encoding="utf-8")
(ROOT / "frontend" / "public" / "favicon.svg").write_text(files["eloria-favicon.svg"], encoding="utf-8")

# Same outlines for React, so the header logo is the exact brand artwork.
data = {
    "wordmark": {
        "width": round(word_width, 2), "top": round(word_top, 2), "baseline": word_baseline,
        "main": word_main, "accent": word_accent,
    },
    "descriptor": {
        "path": text_paths(hanken, "AESTHETIC", desc_size, DESC_TRACKING, desc_cap, 0)[0],
        "capHeight": round(desc_cap, 2),
    },
    "monogram": {"size": MONO, "main": mono_main, "accent": mono_accent},
}
TS_OUT.parent.mkdir(parents=True, exist_ok=True)
TS_OUT.write_text(
    "/* Generated by brand/build_logo.py from Bodoni Moda and Hanken Grotesk outlines. Do not edit by hand. */\n"
    f"export const logoPaths = {json.dumps(data, ensure_ascii=False, indent=2)} as const\n",
    encoding="utf-8",
)
print("wrote", len(files), "SVGs; wordmark width", round(word_width), "descriptor size", round(desc_size, 2))
