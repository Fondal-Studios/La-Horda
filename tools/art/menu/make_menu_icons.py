#!/usr/bin/env python3
"""Genera assets/ui/menu-icons-16.png: tira 16x16 con iconos de estado y cabecera de los menús (candado, tilde, estrella,
espadas, torre, mundo, regalo, corona, llave, copa, mochila, engranaje). Los dibujos salen de PXI_ART en js/ui/pixel-icons.js
(los mismos del juego) y el contorno de 1 px se calcula igual que allí. Determinista, sin azar.
Uso: python3 tools/art/menu/make_menu_icons.py"""
import os, re
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
src = open(os.path.join(ROOT, "js/ui/pixel-icons.js"), encoding="utf-8").read()
pal_block = re.search(r"const PXI_PAL = \{(.*?)\n\};", src, re.S).group(1)
PAL = {m.group(1): m.group(2) for m in re.finditer(r'\b(\w):"(#[0-9a-fA-F]{6})"', pal_block)}
art_block = src[src.index("const PXI_ART = {"):]
ORDER = ["candado", "check", "estrella", "espadas", "torre", "mundo", "regalo", "corona", "llave", "copa", "mochila", "engranaje"]
def grid(name):
    m = re.search(r"\b" + name + r':\[\s*((?:"[^"]{16}",?\s*){16})\]', art_block)
    if not m: raise SystemExit("falta el icono " + name)
    return re.findall(r'"([^"]{16})"', m.group(1))
def hexrgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
out = Image.new("RGBA", (16 * len(ORDER), 16), (0, 0, 0, 0))
for n, name in enumerate(ORDER):
    g = grid(name)
    at = lambda x, y: g[y][x] if 0 <= x < 16 and 0 <= y < 16 else "."
    for y in range(16):
        for x in range(16):
            ch = at(x, y)
            if ch != "." and ch in PAL: out.putpixel((n * 16 + x, y), hexrgb(PAL[ch]) + (255,))
            elif ch == "." and any(at(x + dx, y + dy) not in (".", "k") for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                out.putpixel((n * 16 + x, y), hexrgb(PAL["k"]) + (255,))
dst = os.path.join(ROOT, "assets/ui/menu-icons-16.png")
out.save(dst, optimize=True)
print("ok", dst, ORDER)
