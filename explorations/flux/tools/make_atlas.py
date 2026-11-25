#!/usr/bin/env python3
"""
Flux — build one texture atlas per column from the separate arm textures.

    python3 explorations/flux/tools/make_atlas.py            (from the repository root)

Reads  explorations/flux/assets/structure.glb and assets/tex/1024 png/col-<c>Box-<nn>.png
Writes explorations/flux/assets/tex/atlas/col-<c>.png        the atlas to paint
       explorations/flux/assets/tex/atlas/col-<c>-guide.png  outlines and labels, to lay over it as a layer
       explorations/flux/assets/tex/atlas/atlas.json         where each face of each arm sits (read by the page)

LAYOUT (each arm is one row, the top arm of the column at the top; 453.5 px per metre, as the arm textures):
    Side A     the +z faces, pivot end on the left            1024 × 136 a row
    Side B     the -z faces, pivot end on the right           1024 × 136
    Pivot end  the -x end caps                                 181 × 136
    Tip end    the +x end caps                                 181 × 136
    Top        the top and bottom faces (they share it)        512 × 91, half scale
Every face is laid out as seen from outside the arm, upright, so the arms of a column stack into one
continuous picture in Side A and in Side B: painting across a panel paints that whole side of the column.
The page (explorations/flux/index.html) rewrites the arms' UVs to this layout with the same rules (atlasUV),
so this script only needs running again to rebuild the atlases from the separate textures.
"""
import json, os, struct, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
GLB = os.path.join(ROOT, "assets", "structure.glb")
SRC = os.path.join(ROOT, "assets", "tex", "1024 png")
OUT = os.path.join(ROOT, "assets", "tex", "atlas")

ROW = 136                      # an arm's height (0.3 m)
SIDE_W, END_W = 1024, 181      # an arm's length (2.258 m), its depth (0.4 m)
TOP_W, TOP_H = 512, 91         # top / bottom, at half scale
GAP, BLEED = 16, 6             # between panels; edge pixels repeated into the gaps (no seams when mipmapped)
PANELS = [("A", "Side A", SIDE_W), ("B", "Side B", SIDE_W), ("P", "Pivot end", END_W), ("E", "Tip end", END_W), ("T", "Top", TOP_W)]
PANEL_X = {}
x = 0
for key, _, w in PANELS:
    PANEL_X[key] = x; x += w + GAP
WIDTH = x - GAP


# ---------- the model ----------
def read_glb(path):
    b = open(path, "rb").read()
    off, chunks = 12, {}
    while off < len(b):
        ln, typ = struct.unpack_from("<II", b, off); chunks[typ] = b[off + 8: off + 8 + ln]; off += 8 + ln
    return json.loads(chunks[0x4E4F534A]), chunks.get(0x004E4942, b"")


def accessor(j, binary, i):
    a = j["accessors"][i]; bv = j["bufferViews"][a["bufferView"]]
    fmt, size = {5126: ("f", 4), 5123: ("H", 2), 5125: ("I", 4)}[a["componentType"]]
    n = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}[a["type"]]
    start, stride = bv.get("byteOffset", 0) + a.get("byteOffset", 0), bv.get("byteStride", size * n)
    return np.array([struct.unpack_from("<" + fmt * n, binary, start + k * stride) for k in range(a["count"])])


# ---------- where a point of a face lands in its panel: s across (0 left … 1 right), t down (0 top … 1 bottom),
# as seen from outside, upright. The page's atlasUV() uses the same rules. ----------
def face_of(n):
    ax = int(np.argmax(np.abs(n)))
    return {(2, 1): "A", (2, -1): "B", (0, -1): "P", (0, 1): "E"}.get((ax, 1 if n[ax] > 0 else -1), "T")


def st(face, p, lo, hi):
    sx, sy, sz = (p - lo) / (hi - lo)
    sy = 1 - sy
    return {"A": (sx, sy), "B": (1 - sx, sy), "P": (sz, sy), "E": (1 - sz, sy), "T": (sx, sz)}[face]


def main():
    j, binary = read_glb(GLB)
    arms = {}
    for node in j["nodes"]:
        name = node.get("name", "")
        if name.startswith("LP_P") and "_Box-" in name and "mesh" in node:
            col, num = int(name[4]), int(name.split("-")[-1])
            prim = j["meshes"][node["mesh"]]["primitives"][0]["attributes"]
            arms.setdefault(col, {})[num] = tuple(accessor(j, binary, prim[k]) for k in ("POSITION", "NORMAL", "TEXCOORD_0"))
    os.makedirs(OUT, exist_ok=True)
    layout = {"rowPx": ROW, "panels": {k: label for k, label, _ in PANELS}, "columns": {}, "arms": {}}
    font = ImageFont.load_default(size=22)
    for col in sorted(arms):
        nums = sorted(arms[col]); n = len(nums); H = n * ROW
        atlas = Image.new("RGBA", (WIDTH, H), (0, 0, 0, 0))
        faces = []                                             # (face image, x, y) — pasted twice: bled, then exact
        for num in nums:
            P, N, UV = arms[col][num]
            lo, hi = P.min(0), P.max(0)
            src = Image.open(os.path.join(SRC, f"col-{col}Box-{num:02d}.png")).convert("RGBA")
            SW, SH = src.size
            y0 = (nums[-1] - num) * ROW                       # the top arm in the top row
            rects = {}
            for f0 in range(0, len(P), 4):                    # 4 vertices to a face
                face = face_of(N[f0])
                if face in rects: continue                    # top and bottom share theirs
                w = TOP_W if face == "T" else SIDE_W if face in "AB" else END_W
                h = TOP_H if face == "T" else ROW
                x0 = PANEL_X[face]; fy = y0 + (ROW - h) // 2
                rects[face] = [x0 / WIDTH, fy / H, (x0 + w) / WIDTH, (fy + h) / H]
                # the old texture's uv as an affine function of (s, t), fitted on the face's corners
                S = np.array([[1, *st(face, P[f0 + k], lo, hi)] for k in range(4)])
                coef, *_ = np.linalg.lstsq(S, UV[f0:f0 + 4], rcond=None)      # uv = c0 + c1 s + c2 t
                ax = [SW * coef[0, 0], SW * coef[1, 0] / w, SW * coef[2, 0] / h]
                ay = [SH * coef[0, 1], SH * coef[1, 1] / w, SH * coef[2, 1] / h]
                img = src.transform((w, h), Image.AFFINE, (ax[1], ax[2], ax[0], ay[1], ay[2], ay[0]), Image.BICUBIC)
                faces.append((img, x0, fy))
            layout["arms"][f"P{col}_Box-{num:02d}"] = {"col": col, **rects}
        for img, fx, fy in faces:                             # edges bled outwards first …
            a = np.pad(np.asarray(img), ((BLEED, BLEED), (BLEED, BLEED), (0, 0)), mode="edge")
            atlas.alpha_composite(Image.fromarray(a), (max(0, fx - BLEED), max(0, fy - BLEED)),
                                  (BLEED if fx < BLEED else 0, BLEED if fy < BLEED else 0))
        for img, fx, fy in faces:                             # … then every face exactly
            atlas.paste(img, (fx, fy))
        atlas.save(os.path.join(OUT, f"col-{col}.png"), optimize=True)
        # the guide: a layer of outlines, arm numbers and panel names
        guide = Image.new("RGBA", (WIDTH, H), (0, 0, 0, 0)); g = ImageDraw.Draw(guide)
        for num in nums:
            y0 = (nums[-1] - num) * ROW
            for key, label, w in PANELS:
                h = TOP_H if key == "T" else ROW; fy = y0 + (ROW - h) // 2
                g.rectangle([PANEL_X[key], fy, PANEL_X[key] + w - 1, fy + h - 1], outline=(255, 0, 140, 255), width=2)
            g.text((PANEL_X["A"] + 8, y0 + 6), f"Box-{num:02d}", font=font, fill=(255, 0, 140, 255))
        for key, label, w in PANELS:
            g.text((PANEL_X[key] + w - 8, 6), label + ("  (pivot ←)" if key == "A" else "  (→ pivot)" if key == "B" else ""),
                   font=font, fill=(255, 0, 140, 255), anchor="ra")
        guide.save(os.path.join(OUT, f"col-{col}-guide.png"), optimize=True)
        layout["columns"][str(col)] = {"file": f"col-{col}.png", "size": [WIDTH, H], "arms": n}
        print(f"column {col}: {n} arms, {WIDTH} × {H}")
    with open(os.path.join(OUT, "atlas.json"), "w") as fh:
        json.dump(layout, fh, indent=1)


if __name__ == "__main__":
    sys.exit(main())
