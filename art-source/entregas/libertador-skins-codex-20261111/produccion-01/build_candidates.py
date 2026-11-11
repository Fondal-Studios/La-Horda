#!/usr/bin/env python3
"""Extract two 4x9 Codex skin sources onto native 112px cells."""
from pathlib import Path
import hashlib
import json
from PIL import Image

ROOT = Path(__file__).resolve().parent
COLS, ROWS, CELL = 4, 9, 112
GROUND_Y, TARGET_H = 106, 78
SOURCES = {
    "libertador_escarcha": ROOT / "sources" / "casaca-andes-36-source.png",
    "libertador_ancestral": ROOT / "sources" / "guardia-monte-36-source.png",
}


def chroma(pixel):
    r, g, b, _ = pixel
    return r >= 120 and b >= 100 and r >= g * 1.45 and b >= g * 1.45


def key(cell):
    image = cell.convert("RGBA")
    pixels = image.load()
    removed = 0
    for y in range(image.height):
        for x in range(image.width):
            if chroma(pixels[x, y]):
                pixels[x, y] = (0, 0, 0, 0)
                removed += 1
    return image, removed


def build(name, path):
    source = Image.open(path).convert("RGBA")
    sw, sh = source.size
    assert sw % COLS == 0 and sh % ROWS == 0, source.size
    cw, ch = sw // COLS, sh // ROWS
    frames, stats = [], []
    for index in range(COLS * ROWS):
        x, y = (index % COLS) * cw, (index // COLS) * ch
        frame, removed = key(source.crop((x, y, x + cw, y + ch)))
        box = frame.getbbox()
        if not box:
            raise RuntimeError(f"empty frame {index}")
        frames.append(frame.crop(box))
        stats.append({"index": index, "sourceBox": box, "removedBackground": removed})
    scale = min(TARGET_H / max(f.height for f in frames), 100 / max(f.width for f in frames))
    atlas = Image.new("RGBA", (COLS * CELL, ROWS * CELL), (0, 0, 0, 0))
    hashes = []
    for index, frame in enumerate(frames):
        nw, nh = max(1, round(frame.width * scale)), max(1, round(frame.height * scale))
        native = frame.resize((nw, nh), Image.Resampling.NEAREST)
        x = (index % COLS) * CELL + (CELL - nw) // 2
        y = (index // COLS) * CELL + GROUND_Y - nh
        atlas.alpha_composite(native, (x, y))
        hashes.append(hashlib.sha256(native.tobytes()).hexdigest())
        stats[index]["nativeSize"] = [nw, nh]
    output = ROOT / "candidates" / name / "atlas.png"
    atlas.save(output, optimize=True)
    alpha = list(atlas.getchannel("A").get_flattened_data())
    border = sum(atlas.getpixel((x, y))[3] > 0 for x in range(atlas.width) for y in (0, atlas.height - 1))
    border += sum(atlas.getpixel((x, y))[3] > 0 for y in range(atlas.height) for x in (0, atlas.width - 1))
    return {
        "name": name, "source": str(path.relative_to(ROOT)), "sourceSize": [sw, sh],
        "sourceCell": [cw, ch], "atlas": str(output.relative_to(ROOT)),
        "atlasSize": list(atlas.size), "scale": scale, "frames": len(frames),
        "uniqueFrames": len(set(hashes)), "alphaValues": sorted(set(alpha)),
        "partialAlphaPixels": sum(a not in (0, 255) for a in alpha),
        "borderOpaquePixels": border, "sha256": hashlib.sha256(output.read_bytes()).hexdigest(),
        "frameStats": stats,
    }


reports = [build(name, source) for name, source in SOURCES.items()]
(ROOT / "TECHNICAL.json").write_text(json.dumps({"status": "PASS_TECHNICAL_SOURCE_ONLY", "reports": reports}, indent=2) + "\n")
print(json.dumps({r["name"]: {k: r[k] for k in ("frames", "uniqueFrames", "partialAlphaPixels", "borderOpaquePixels", "sha256")} for r in reports}, indent=2))
