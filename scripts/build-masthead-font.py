"""Rebuild the six original masthead glyphs with Python and fontTools.

The outlines are SVG paths drawn on a 100-unit cap height, with y increasing
downward. This design tool is independent of the site’s production build.
"""

from pathlib import Path
from fontTools.fontBuilder import FontBuilder
from fontTools.misc.transform import Transform
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.transformPen import TransformPen
from fontTools.svgLib.path import parse_path

# Each group contains a single silhouette and its open-paper incisions.
OUTLINES = {
    "T": (93, """
        M2 0 H91 L91 28 C82 14 74 8 59 7
        L59 78 Q59 92 68 97 L68 100 H25 V97 Q35 92 35 78 V7
        C20 8 11 14 2 28 Z
        M41 10 L41 90 L45 12 Z
    """),
    "U": (88, """
        M1 0 H42 V3 Q33 7 33 20 V64
        C33 83 41 92 55 92 C70 92 77 81 77 61 V23
        Q77 10 63 3 V0 H87 V3 Q83 8 83 20 V62
        C83 86 73 101 49 101 C23 101 8 88 8 64 V18
        Q8 8 1 3 Z
        M14 12 L14 62 Q14 82 27 91 Q18 81 18 60 L18 15 Z
    """),
    "M": (104, """
        M1 0 H34 L60 58 L83 0 H102 V3 Q97 7 97 18 V82
        Q97 93 104 97 V100 H67 V97 Q74 93 74 82 V36
        L50 94 H48 L14 21 V75 Q14 91 28 97 V100 H0 V97
        Q8 92 8 76 V17 Q8 8 1 3 Z
        M80 39 L80 92 L84 31 Z
    """),
    "A": (89, """
        M41 0 H53 L82 84 Q85 93 91 97 V100 H54 V97
        Q61 93 57 82 L53 71 C42 66 31 69 24 77
        Q19 91 33 97 V100 H0 V97 Q9 92 14 78 Z
        M28 65 C36 58 44 57 50 60 L40 28 Z
        M47 10 L73 88 L52 20 Z
    """),
    "N": (87, """
        M1 0 H29 L71 61 V25 Q71 10 58 3 V0 H87 V3
        Q78 8 78 23 V100 H69 L14 21 V75 Q14 91 27 97 V100
        H0 V97 Q8 92 8 77 V17 Q8 9 1 3 Z
        M15 8 L67 85 L22 14 Z
    """),
    "E": (78, """
        M1 0 H74 L75 26 C66 12 56 6 41 6 H33 V49
        C44 48 51 43 58 32 V62 C52 54 43 52 33 54 V94 H40
        C56 94 69 84 78 67 L75 100 H1 V97 Q9 92 9 81 V19
        Q9 8 1 3 Z
        M15 11 L15 91 L19 15 Z
    """),
}


def glyph(outline):
    pen = TTGlyphPen(None)
    if outline:
        curves = Cu2QuPen(pen, max_err=0.8, reverse_direction=False)
        coords = TransformPen(curves, Transform(10, 0, 0, -10, 0, 1000))
        parse_path(outline, coords)
    return pen.glyph()


def main():
    font = FontBuilder(1200, isTTF=True)
    font.setupGlyphOrder([".notdef", "space", *OUTLINES])
    font.setupCharacterMap({32: "space", **{ord(c): c for c in OUTLINES}})
    glyphs = {c: glyph(path) for c, (_, path) in OUTLINES.items()}
    font.setupGlyf({".notdef": glyph(""), "space": glyph(""), **glyphs})
    # Three units of side bearing keep the untracked font usable as plain text.
    metrics = {c: (width * 10 + 34, glyphs[c].xMin) for c, (width, _) in OUTLINES.items()}
    font.setupHorizontalMetrics({".notdef": (400, 0), "space": (250, 0), **metrics})
    font.setupHorizontalHeader(ascent=1040, descent=-160)
    font.setupNameTable({
        "familyName": "Tumaneen Titling",
        "styleName": "Regular",
        "fullName": "Tumaneen Titling",
        "psName": "Tumaneen-Titling",
        "uniqueFontIdentifier": "Tumaneen Titling 1.0",
        "version": "Version 1.0",
    })
    font.setupOS2(sTypoAscender=1040, sTypoDescender=-160, usWinAscent=1040,
                  usWinDescent=160, sCapHeight=1000)
    font.setupPost()
    font.setupMaxp()
    # Fixed OpenType timestamp makes successive exports byte-for-byte identical.
    font.font["head"].created = font.font["head"].modified = 3877286400
    font.font.recalcTimestamp = False
    font.font.flavor = "woff"
    root = Path(__file__).resolve().parents[1]
    font.save(root / "src/assets/fonts/Tumaneen-Titling.woff")


if __name__ == "__main__":
    main()
