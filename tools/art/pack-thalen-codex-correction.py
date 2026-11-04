#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "art-source/entregas/thalen-codex-20261104/produccion-01/sources"
CORR = ROOT / "art-source/entregas/thalen-codex-20261104/correccion-01/sources"
OUT = ROOT / "assets/sprites/champions/mago/codex-v1"
CELL = 112
COLS = 4
ROWS = 9

ROWSPEC = [
    ("walk_down", "walk-8.png", 4, 2, 0),
    ("walk_side", "rest-16.png", 4, 4, 0),
    ("walk_up", "walk-8.png", 4, 2, 1),
    ("attack_down", "attacks-12.png", 4, 3, 0),
    ("attack_side", "attacks-12.png", 4, 3, 1),
    ("attack_up", "attacks-12.png", 4, 3, 2),
    ("cast_down", "rest-16.png", 4, 4, 1),
    ("ultimate_down", "rest-16.png", 4, 4, 2),
    ("death_down", "rest-16.png", 4, 4, 3),
]


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    h.update(path.read_bytes())
    return h.hexdigest()


def boundaries(total: int, parts: int) -> list[int]:
    return [round(total * i / parts) for i in range(parts + 1)]


def extract_cell(img: Image.Image, cols: int, rows: int, col: int, row: int) -> Image.Image:
    xs, ys = boundaries(img.width, cols), boundaries(img.height, rows)
    rgb = img.crop((xs[col], ys[row], xs[col + 1], ys[row + 1])).convert("RGB")
    rgba = Image.new("RGBA", rgb.size)
    src = rgb.load()
    dst = rgba.load()
    for y in range(rgb.height):
        for x in range(rgb.width):
            r, g, b = src[x, y]
            # Chroma extraction from an intentionally generated green-only backdrop.
            # Output alpha is binary by construction; no source-art smoothing or filtering.
            bg = g > 82 and g > r + 26 and g > b + 26
            dst[x, y] = (0, 0, 0, 0) if bg else (r, g, b, 255)
    bbox = rgba.getbbox()
    if not bbox:
        raise RuntimeError(f"empty cell {row}:{col}")
    return rgba.crop(bbox)


def place(frame: Image.Image, death: bool = False) -> Image.Image:
    max_w = 106 if death else 104
    max_h = 100
    scale = min(max_w / frame.width, max_h / frame.height)
    w = max(1, round(frame.width * scale))
    h = max(1, round(frame.height * scale))
    frame = frame.resize((w, h), Image.Resampling.NEAREST)
    cell = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    x = (CELL - w) // 2
    y = 106 - h
    cell.alpha_composite(frame, (x, y))
    return cell


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    atlas = Image.new("RGBA", (CELL * COLS, CELL * ROWS), (0, 0, 0, 0))
    index = []
    source_cache: dict[str, Image.Image] = {}
    for row_index, (name, filename, cols, rows, source_row) in enumerate(ROWSPEC):
        source_path = (CORR / filename) if (CORR / filename).exists() else (SRC / filename)
        img = source_cache.setdefault(filename, Image.open(source_path).convert("RGB"))
        for col in range(4):
            raw = extract_cell(img, cols, rows, col, source_row)
            frame = place(raw, death=name == "death_down")
            atlas.alpha_composite(frame, (col * CELL, row_index * CELL))
            bbox = frame.getbbox()
            index.append({
                "index": row_index * 4 + col,
                "state": name,
                "phase": col,
                "source": f"{filename}#{source_row}:{col}",
                "bbox": list(bbox) if bbox else None,
            })
    atlas_path = OUT / "atlas.png"
    atlas.save(atlas_path, optimize=False)

    preview = Image.new("RGBA", (CELL * COLS, CELL * ROWS), (24, 18, 30, 255))
    preview.alpha_composite(atlas)
    draw = ImageDraw.Draw(preview)
    for x in range(1, COLS):
        draw.line((x * CELL, 0, x * CELL, preview.height), fill=(150, 110, 180, 90))
    for y in range(1, ROWS):
        draw.line((0, y * CELL, preview.width, y * CELL), fill=(150, 110, 180, 90))
    preview.save(OUT / "preview.png")

    alpha = atlas.getchannel("A")
    alphas = set(alpha.getdata())
    technical = {
        "atlas": str(atlas_path.relative_to(ROOT)),
        "size": list(atlas.size),
        "cell": [CELL, CELL],
        "frames": len(index),
        "nonEmpty": sum(1 for row in index if row["bbox"]),
        "alphaValues": sorted(alphas),
        "binaryAlpha": alphas.issubset({0, 255}),
        "edgeAlphaPixels": sum(1 for x in range(atlas.width) for y in (0, atlas.height - 1) if alpha.getpixel((x, y))) + sum(1 for y in range(1, atlas.height - 1) for x in (0, atlas.width - 1) if alpha.getpixel((x, y))),
        "sha256": sha256(atlas_path),
        "sources": {name: {"path": str(path.relative_to(ROOT)), "sha256": sha256(path)} for name, path in {name: ((CORR/name) if (CORR/name).exists() else (SRC/name)) for name in {row[1] for row in ROWSPEC}}.items()},
        "index": index,
    }
    (OUT / "technical.json").write_text(json.dumps(technical, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps({k: technical[k] for k in ("size", "frames", "nonEmpty", "alphaValues", "binaryAlpha", "edgeAlphaPixels", "sha256")}, indent=2))


if __name__ == "__main__":
    main()
