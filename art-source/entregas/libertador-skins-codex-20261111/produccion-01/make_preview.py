#!/usr/bin/env python3
"""Build a review sheet without modifying source or candidate pixels."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[3]
canvas = Image.new("RGBA", (1800, 1350), (18, 20, 26, 255))
draw = ImageDraw.Draw(canvas)


def fit(path, box):
    image = Image.open(path).convert("RGBA")
    image.thumbnail(box, Image.Resampling.NEAREST)
    return image


def place(image, x, y, w, h):
    canvas.alpha_composite(image, (x + (w - image.width) // 2, y + (h - image.height) // 2))


draw.text((40, 24), "LIBERTADOR · referencia exacta del Codice", fill="white")
place(fit(REPO / "assets/ui/codex/champions/libertador.png", (1720, 390)), 40, 55, 1720, 390)
columns = [
    ("Casaca actual", REPO / "assets/sprites/champions/libertador/skins/libertador_escarcha/atlas.png"),
    ("Casaca candidato 36", ROOT / "candidates/libertador_escarcha/atlas.png"),
    ("Guardia actual", REPO / "assets/sprites/champions/libertador/skins/libertador_ancestral/atlas.png"),
    ("Guardia candidato 36", ROOT / "candidates/libertador_ancestral/atlas.png"),
]
for index, (label, path) in enumerate(columns):
    x = 40 + index * 435
    draw.text((x, 472), label, fill="white")
    place(fit(path, (405, 810)), x, 505, 405, 810)
canvas.save(ROOT / "PREVIEW.png", optimize=True)
