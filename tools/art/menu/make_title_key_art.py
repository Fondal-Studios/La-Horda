#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Key-art de la pantalla de título: «TODA La Horda» (determinista, PIL + numpy, sin IA generativa).
Mezcla las 11 panorámicas de assets/ui/codex/arenas en franjas diagonales, con siluetas de enemigos/guardianes
(assets/sprites) en dos filas, paleta limitada con dithering Bayer, viñeta oscura para que se lea el texto.
Salida: assets/ui/title-horda-1280x720.png (16:9) y assets/ui/title-horda-1280x592.png (móvil apaisado).
Uso: python3 tools/art/menu/make_title_key_art.py"""
import os, random
import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
ARENAS = ['bosque', 'hielo', 'acuatica', 'infernal', 'minas', 'ciudad', 'laberinto', 'micelial', 'fortaleza', 'divina', 'abismo']
RIM = {'bosque': (110, 230, 150), 'hielo': (150, 220, 255), 'acuatica': (80, 220, 230), 'infernal': (255, 110, 50),
       'minas': (255, 150, 60), 'ciudad': (255, 170, 90), 'laberinto': (240, 200, 110), 'micelial': (200, 120, 255),
       'fortaleza': (230, 190, 120), 'divina': (240, 150, 230), 'abismo': (140, 120, 255)}
# (ruta relativa a assets/sprites, arena de la que toma el borde de luz)
SPRITES = [('enemies/infernal/zombie/idle1.png', 'infernal'), ('enemies/infernal/esqueleto_h/idle1.png', 'infernal'),
           ('enemies/bosque/ent/idle1.png', 'bosque'), ('enemies/bosque/bestia_bosque/idle1.png', 'bosque'),
           ('enemies/bosque/duende_bosque/idle1.png', 'bosque'), ('enemies/hielo/golem_hielo/idle1.png', 'hielo'),
           ('enemies/hielo/demonio_hielo_fuego/idle1.png', 'hielo'), ('enemies/acuatica/sirena_abisal/idle.png', 'acuatica'),
           ('enemies/acuatica/cangrejo_acorazado/idle.png', 'acuatica'), ('enemies/acuatica/medusa_electrica/idle.png', 'acuatica'),
           ('bosses/laberinto/guardian_laberinto/idle1.png', 'laberinto')]
BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], dtype=np.float32) / 16.0 - 0.5


def load_sprites():
    out = []
    for rel, arena in SPRITES:
        p = os.path.join(ROOT, 'assets', 'sprites', rel)
        if os.path.exists(p):
            out.append((Image.open(p).convert('RGBA'), arena))
    return out


def silhouette(im, body, rim, flip):
    a = np.array(im)[:, :, 3] > 128
    if flip:
        a = a[:, ::-1]
    h, w = a.shape
    m = Image.fromarray((a * 255).astype(np.uint8), 'L').crop((-1, -1, w + 1, h + 1))   # rellena huecos internos (sin bordes de luz falsos)
    ImageDraw.floodfill(m, (0, 0), 128)
    a = (np.array(m)[1:-1, 1:-1] != 128)
    pad = np.zeros((h + 2, w + 2), bool); pad[1:-1, 1:-1] = a
    top_left = a & ~pad[0:-2, 1:-1]   # borde superior/izquierdo = luz de la arena
    rgba = np.zeros((h, w, 4), np.uint8)
    rgba[a] = (*body, 255)
    rgba[top_left] = (*rim, 255)
    return Image.fromarray(rgba, 'RGBA')


def compose(W, H, seed):
    rnd = random.Random(seed)
    arr = np.zeros((H, W, 3), np.float32)
    n = len(ARENAS); slant = 0.42 * H; sw = (W + slant) / n
    ys, xs = np.mgrid[0:H, 0:W]
    u = xs + (H - ys) * 0.42                      # franjas inclinadas hacia la derecha
    idx = np.clip((u / sw).astype(int), 0, n - 1)
    edge = (u % sw)
    for i, name in enumerate(ARENAS):
        pano = Image.open(os.path.join(ROOT, 'assets/ui/codex/arenas', name + '.png')).convert('RGB')
        sc = H / pano.height * 1.0
        pano = pano.resize((max(W, int(pano.width * sc)), H), Image.BOX)
        pw = pano.width
        pa = np.array(pano, np.float32)
        m = idx == i
        cx = (i + 0.5) * sw - (H * 0.5) * 0.42       # centro de la franja a media altura
        sx = np.clip((xs - int(cx) + pw // 2), 0, pw - 1)
        arr[m] = pa[ys[m], sx[m]]
        # separador oscuro entre franjas
    sep = (edge < 1.6) | (edge > sw - 0.4)
    arr[sep] = arr[sep] * 0.15 + np.array([6, 4, 10]) * 0.85
    # oscurecer para legibilidad: base 0.62, más oscuro arriba (título) y abajo (suelo)
    yy = ys / (H - 1)
    shade = 0.95 - 0.42 * np.clip((0.30 - yy) / 0.30, 0, 1) - 0.42 * np.clip((yy - 0.62) / 0.38, 0, 1)
    arr *= shade[..., None]
    # zonas de texto/CTA: franja derecha media y centro superior un poco más oscuras
    cxs = xs / (W - 1)
    arr *= (1 - 0.30 * np.clip(1 - np.abs(cxs - 0.5) / 0.30, 0, 1) * np.clip((0.32 - yy) / 0.32, 0, 1))[..., None]
    arr *= (1 - 0.28 * np.clip((cxs - 0.66) / 0.1, 0, 1) * (1 - np.clip(np.abs(yy - 0.58) / 0.34, 0, 1)))[..., None]
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGB').convert('RGBA')
    # suelo oscuro + horda
    g = np.array(img, np.float32)
    ground = int(H * 0.80)
    gy = np.clip((ys - ground) / (H - ground + 1), 0, 1)
    gm = (ys >= ground)
    g[gm, :3] = g[gm, :3] * (0.45 - 0.3 * gy[gm][:, None]) + np.array([8, 6, 14]) * (0.4 + 0.2 * gy[gm][:, None])
    img = Image.fromarray(np.clip(g, 0, 255).astype(np.uint8), 'RGBA')
    sprites = load_sprites()
    rows = [(int(H * 0.86), (26, 18, 40), 7, 0.6), (int(H * 0.99), (6, 4, 10), 5, 1.0)]
    for base, body, count, _ in rows:
        xsp = [(k + rnd.random() * 0.6) / count * W * 1.04 - 0.02 * W for k in range(count)]
        for x in xsp:
            sp, arena = sprites[rnd.randrange(len(sprites))]
            fx = x / W
            if base > H * 0.9 and 0.20 < fx < 0.42:     # hueco para el héroe
                continue
            sil = silhouette(sp, body, tuple(int(c * (0.55 if base < H * 0.9 else 0.8)) for c in RIM[arena]), rnd.random() < 0.5)
            img.alpha_composite(sil, (int(x - sil.width / 2), base - sil.height))
    # viñeta final
    a = np.array(img, np.float32)[:, :, :3]
    d = np.hypot((cxs - 0.5) * 1.15, (yy - 0.5) * 1.0)
    a *= (1 - 0.55 * np.clip((d - 0.38) / 0.5, 0, 1) ** 1.2)[..., None]
    # paleta limitada con dithering Bayer ordenado
    bay = np.tile(BAYER, (H // 4 + 1, W // 4 + 1))[:H, :W]
    a = np.clip(a + bay[..., None] * 14, 0, 255).astype(np.uint8)
    q = Image.fromarray(a, 'RGB').quantize(colors=56, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    return q.convert('RGB')


def main():
    out = []
    for (W, H, name) in ((320, 180, 'title-horda-1280x720.png'), (320, 148, 'title-horda-1280x592.png')):
        im = compose(W, H, 1337).resize((W * 4, H * 4), Image.NEAREST)
        p = os.path.join(ROOT, 'assets', 'ui', name)
        im.save(p, optimize=True); out.append((p, im.size, os.path.getsize(p)))
    for o in out: print(o)


if __name__ == '__main__':
    main()
