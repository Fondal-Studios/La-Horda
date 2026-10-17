#!/usr/bin/env python3
"""Genera TODO el arte de Ilkan (campeón original) por código y lo escribe en assets/sprites/champions/ilkan/.

  python3 tools/art/ilkan/build.py            # reconstruye atlas, skin, efectos y previews
  python3 tools/art/webp_convert.py           # copias .webp sin pérdida (después de actualizar asset-manifest.js)

No usa recursos de terceros ni generadores de imágenes: ver docs/ILKAN_REWORK.md. La grilla (tamaño de celda,
índices de cada animación y ancla de pies) es la misma que usaba el atlas anterior, así que el motor, la
Crystal Wars y los sets de animación no cambian. La skin de set "Caravana de Medianoche" usa la misma grilla.
"""
import os, sys
import numpy as np
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'sprites', 'champions', 'ilkan')

import frames, frames_colossus, fx, fx_skin
from human import BASE, NIGHT, W as HW, H as HH
from colossus import ROCK, CRYSTAL, W as CW, H as CH

HUMAN_N, HUMAN_COLS = 62, 8
COL_N, COL_COLS = 31, 8


def atlas(fn, n, cols, w, h, st):
    rows = (n + cols - 1) // cols
    sheet = Image.new('RGBA', (cols * w, rows * h), (0, 0, 0, 0))
    for i in range(n):
        sheet.alpha_composite(fn(i, st), ((i % cols) * w, (i // cols) * h))
    return sheet


def preview(st_h, st_c, path):
    """Tarjeta 220x316 de la skin (fondo de noche en el desierto, Ilkan al frente, coloso detrás)."""
    W_, H_ = 220, 316
    im = Image.new('RGB', (W_, H_))
    px = im.load()
    for y in range(H_):
        t = y / H_
        for x in range(W_):
            r = int(20 + 70 * t * t); g = int(26 + 60 * t * t); b = int(70 + 40 * (1 - t))
            px[x, y] = (r, g, b)
    d = ImageDraw.Draw(im)
    rs = np.random.RandomState(9)
    for _ in range(60):
        d.point((rs.randint(0, W_), rs.randint(0, 150)), fill=(220, 230, 255))
    d.polygon([(0, 250), (60, 215), (120, 245), (180, 205), (220, 235), (220, H_), (0, H_)], fill=(46, 40, 78))
    d.polygon([(0, 275), (80, 250), (150, 272), (220, 252), (220, H_), (0, H_)], fill=(70, 58, 98))
    col = frames_colossus.colossus_frame(20, st_c).convert('RGBA')
    bb = col.getbbox(); col = col.crop(bb); col = col.resize((int(col.width * 1.5), int(col.height * 1.5)), Image.NEAREST)
    cm = Image.new('RGBA', col.size, (0, 0, 0, 0)); cm.paste(col, (0, 0), col)
    a = np.array(cm); a[:, :, 3] = (a[:, :, 3] * 0.45).astype(np.uint8); cm = Image.fromarray(a, 'RGBA')
    im.paste(cm, ((W_ - cm.width) // 2, 105), cm)
    hum = frames.frame_for(32, st_h).convert('RGBA')
    bb = hum.getbbox(); hum = hum.crop(bb); hum = hum.resize((hum.width * 3, hum.height * 3), Image.NEAREST)
    im.paste(hum, ((W_ - hum.width) // 2, H_ - hum.height - 18), hum)
    im.save(path, optimize=True)


def main():
    os.makedirs(os.path.join(OUT, 'v2', 'fx'), exist_ok=True)
    os.makedirs(os.path.join(OUT, 'skins', 'legion'), exist_ok=True)
    # --- humano y coloso (base)
    atlas(frames.frame_for, HUMAN_N, HUMAN_COLS, HW, HH, BASE).save(os.path.join(OUT, 'v2', 'atlas.png'), optimize=True)
    atlas(frames_colossus.colossus_frame, COL_N, COL_COLS, CW, CH, ROCK).save(os.path.join(OUT, 'v2', 'colossus.png'), optimize=True)
    # --- skin de set (Caravana de Medianoche)
    atlas(frames.frame_for, HUMAN_N, HUMAN_COLS, HW, HH, NIGHT).save(os.path.join(OUT, 'skins', 'legion', 'atlas.png'), optimize=True)
    atlas(frames_colossus.colossus_frame, COL_N, COL_COLS, CW, CH, CRYSTAL).save(os.path.join(OUT, 'skins', 'legion', 'colossus.png'), optimize=True)
    preview(NIGHT, CRYSTAL, os.path.join(OUT, 'skins', 'legion', 'preview.png'))
    # --- efectos
    F = os.path.join(OUT, 'v2', 'fx')
    fx.lance(64, 24).save(os.path.join(F, 'fx_lance_01.png'), optimize=True)
    fx.pillar(48, 83, 1).save(os.path.join(F, 'fx_pillar_01.png'), optimize=True)
    fx.pillar(43, 82, 2).save(os.path.join(F, 'fx_pillar_02.png'), optimize=True)
    for i, (w, h) in enumerate([(43, 66), (37, 49), (43, 57), (41, 52)], 1):
        fx.puff(w, h, 10 + i).save(os.path.join(F, 'fx_sand_0%d.png' % i), optimize=True)
    for i, (w, h) in enumerate([(51, 34), (53, 36), (53, 35)], 1):
        fx.cracks(w, h, 20 + i).save(os.path.join(F, 'fx_crack_0%d.png' % i), optimize=True)
    for i, (w, h) in enumerate([(218, 121), (289, 119), (287, 120)], 1):
        fx.foot(w, h, 30 + i, i).save(os.path.join(F, 'fx_foot_0%d.png' % i), optimize=True)
    fx.silhouettes(324, 122).save(os.path.join(F, 'silhouettes_01.png'), optimize=True)
    # --- efectos de habilidad de la skin (assets/vfx/skins/legion/, ver js/assets/skin-fx-meta.js)
    V = os.path.join(ROOT, 'assets', 'vfx', 'skins', 'legion')
    os.makedirs(V, exist_ok=True)
    fx_skin.streak(41, 18).save(os.path.join(V, 'streak_0.png'), optimize=True)
    fx_skin.ring(97, 38, 3, 1).save(os.path.join(V, 'ring_0.png'), optimize=True)
    fx_skin.spikes(76, 79).save(os.path.join(V, 'spikes_0.png'), optimize=True)
    fx_skin.quake(114, 83).save(os.path.join(V, 'quake_0.png'), optimize=True)
    fx_skin.ring(154, 40, 4, 2).save(os.path.join(V, 'bigring_0.png'), optimize=True)
    print('listo: assets/sprites/champions/ilkan y assets/vfx/skins/legion')


if __name__ == '__main__':
    main()
