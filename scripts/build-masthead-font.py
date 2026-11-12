"""Rebuild Tumaneen Brush from the hand-painted alpha atlas in src/assets/fonts.

Run with Python, Pillow, NumPy, contourpy, and fontTools. The atlas is the
editable source. Each pixel is one font unit, with a common baseline in every
cell. SVG text can therefore sample the matching paint for each glyph.
"""

import json
from pathlib import Path

import contourpy
import numpy as np
from PIL import Image, ImageFilter, ImageOps
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen


ASSETS = Path(__file__).resolve().parents[1] / "src/assets/fonts"


def simplify(points, tolerance=0.75):
    """Thin a polyline while retaining edges that deviate by a source pixel."""
    if len(points) <= 2:
        return points
    offsets = points - points[0]
    segment = points[-1] - points[0]
    length_squared = segment @ segment
    if length_squared:
        fractions = np.clip((offsets @ segment) / length_squared, 0, 1)
        offsets = offsets - fractions[:, None] * segment
    squared_error = np.sum(offsets * offsets, axis=1)
    split = int(np.argmax(squared_error))
    if squared_error[split] <= tolerance ** 2:
        return points[[0, -1]]
    return np.concatenate((simplify(points[:split + 1])[:-1], simplify(points[split:])))


def trace(alpha, baseline):
    # A softly expanded contour encloses the translucent dry-brush edges.
    # The atlas retains the finer pigment differences within those contours.
    mask = alpha.point(lambda value: 255 if value > 5 else 0)
    padded = ImageOps.expand(mask, border=2).filter(ImageFilter.GaussianBlur(1))
    contours = contourpy.contour_generator(z=np.asarray(padded)).lines(96)
    pen = TTGlyphPen(None)
    for contour in contours:
        x, y = contour.T
        area = abs(np.dot(x[:-1], y[1:]) - np.dot(y[:-1], x[1:])) / 2
        if area < 32:
            continue
        # Sample coordinates start at pixel centers. Remove the two-pixel pad,
        # add half a pixel, then flip the atlas's downward y axis for TrueType.
        vertices = simplify(contour)[:-1]
        vertices = np.rint(np.column_stack(
            (vertices[:, 0] - 1.5, baseline - (vertices[:, 1] - 1.5))
        )).astype(int)
        pen.moveTo(tuple(vertices[0]))
        for vertex in vertices[1:]:
            pen.lineTo(tuple(vertex))
        pen.closePath()
    return pen.glyph()


def main():
    layout = json.loads((ASSETS / "brush-atlas.json").read_text())
    with Image.open(ASSETS / "brush-atlas.webp") as atlas:
        if atlas.size != (layout["width"], layout["height"]):
            raise ValueError("The atlas dimensions must match brush-atlas.json.")
        alpha = atlas.getchannel("A")

    empty = TTGlyphPen(None).glyph()
    glyphs = {".notdef": empty, "space": empty}
    cmap = {32: "space"}
    for letter, column in layout["glyphs"].items():
        width = layout["cellWidth"]
        box = (column * width, 0, (column + 1) * width, layout["height"])
        glyphs[letter] = trace(alpha.crop(box), layout["baseline"])
        cmap[ord(letter)] = letter

    font = FontBuilder(layout["unitsPerEm"], isTTF=True)
    font.setupGlyphOrder(list(glyphs))
    font.setupCharacterMap(cmap)
    font.setupGlyf(glyphs)
    metrics = {".notdef": (240, 0), "space": (160, 0)}
    for letter in layout["glyphs"]:
        glyph = glyphs[letter]
        metrics[letter] = (glyph.xMax + 4, glyph.xMin)
    font.setupHorizontalMetrics(metrics)
    font.setupHorizontalHeader(ascent=620, descent=-80)
    font.setupNameTable({
        "familyName": "Tumaneen Brush",
        "styleName": "Regular",
        "fullName": "Tumaneen Brush",
        "psName": "Tumaneen-Brush",
        "uniqueFontIdentifier": "Tumaneen Brush 1.0",
        "version": "Version 1.0",
    })
    font.setupOS2(sTypoAscender=620, sTypoDescender=-80, usWinAscent=620,
                  usWinDescent=80, sCapHeight=592, usWeightClass=400)
    font.setupPost()
    font.setupMaxp()
    # Keep the asset reproducible between runs.
    font.font["head"].created = font.font["head"].modified = 3877286400
    font.font.recalcTimestamp = False
    font.font.flavor = "woff"
    font.save(ASSETS / "Tumaneen-Brush.woff")


if __name__ == "__main__":
    main()
