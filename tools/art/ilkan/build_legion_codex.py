#!/usr/bin/env python3
"""Ilkan, skin «Caravana de Medianoche» (id interno 'legion'): cosmética pura, derivada por recoloreo determinista del arte vigente.
Antes era un atlas procedural diminuto (tools/art/ilkan/build.py, 128x111) que no se parecía al cuerpo del Códice.
Ahora: humano = assets/.../ilkan/codex-v1/atlas.png (62 cuadros 192x128) y Coloso = assets/.../ilkan/v2/colossus.png (espíritu de arena pintado),
con la misma grilla, mismos cuadros y mismas estadísticas. Cambios de color: verde azulado -> índigo de medianoche; dorado/arena -> plata lunar;
cian -> violeta. Piel, vendas, cuero y contorno no cambian. Sin pérdidas de forma: solo se mueve el matiz/saturación de píxeles opacos.
Además deja el humano y el Coloso vigentes con paleta global de <=48 colores. Salida: codex-v1/atlas.png, v2/colossus.png, skins/legion/{atlas,colossus,preview}.png (+ .webp sin pérdida).   Uso: python3 tools/art/ilkan/build_legion_codex.py"""
import os, colorsys, numpy as np
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')) + '/'
D = R + 'assets/sprites/champions/ilkan/'

def quantize(img, n=48):
    """Paleta global de <=n colores sin dithering ni alfa parcial (el atlas fuente trae 55k-108k colores de degradado)."""
    a = np.asarray(img.convert('RGBA')).copy(); op = a[:, :, 3] > 0
    rgb = a[:, :, :3].copy(); rgb[~op] = (20, 14, 12)
    q = np.asarray(Image.fromarray(rgb, 'RGB').quantize(colors=n, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB'))
    o = np.dstack([q, a[:, :, 3]]); o[~op, :3] = 0
    return Image.fromarray(o, 'RGBA')

def recolor(img, human):
    a = np.asarray(img.convert('RGBA')).copy(); out = a.copy(); cache = {}
    for y, x in zip(*np.where(a[:, :, 3] > 0)):
        key = tuple(int(c) for c in a[y, x, :3])
        if key not in cache:
            h, s, v = colorsys.rgb_to_hsv(*[c/255 for c in key]); hd = h*360; nr = None
            if 140 <= hd <= 215 and s > 0.2 and v > 0.12:                      # verde azulado / cian -> índigo (brillos -> violeta)
                glow = v > 0.8 and not human
                nr = colorsys.hsv_to_rgb((282 if glow else 246 + (hd-180)*0.2)/360, 0.45 if glow else min(1, 0.42 + 0.25*s), min(1, v*0.86 if not glow else 1.0))
            elif human and 28 <= hd <= 36 and v >= 0.69 and s >= 0.62:        # tela dorada -> plata lunar (piel y cuero quedan)
                nr = colorsys.hsv_to_rgb(236/360, 0.16, min(1, 0.36 + v*0.7))
            elif (not human) and 15 <= hd <= 50 and v > 0.2:                  # arena -> arena de luna (conserva luces y sombras)
                nr = colorsys.hsv_to_rgb(240/360, 0.10 + 0.32*s, min(1, 0.18 + v*0.86))
            cache[key] = tuple(int(round(c*255)) for c in nr) if nr else key
        out[y, x, :3] = cache[key]
    return Image.fromarray(out, 'RGBA')

def webp(im, path): im.save(path, 'WEBP', lossless=True, quality=100, method=5, exact=True)

if __name__ == '__main__':
    # 1) paleta <=48 del arte vigente (fuentes originales en art-source/ilkan/), 2) skin Legión = recoloreo de esas mismas imágenes
    srcs = {'atlas': (R+'art-source/ilkan/codex-v1-atlas-original.png', D+'codex-v1/atlas.png'),
            'colossus': (R+'art-source/ilkan/colossus-espiritu-original.png', D+'v2/colossus.png')}
    q = {k: quantize(Image.open(v[0])) for k, v in srcs.items()}
    for k, v in srcs.items():
        q[k].save(v[1], optimize=True)
        if os.path.exists(v[1][:-4]+'.webp') or k == 'colossus': webp(q[k], v[1][:-4]+'.webp')   # solo donde el juego pide la copia .webp (asset-webp.js)
    hum = recolor(q['atlas'], True); col = recolor(q['colossus'], False)
    os.makedirs(D+'skins/legion', exist_ok=True)
    for n, im in (('atlas', hum), ('colossus', col)):
        im.save(D+f'skins/legion/{n}.png', optimize=True); webp(im, D+f'skins/legion/{n}.webp')
    # vista previa 220x316: cielo nocturno + idle de frente del humano a x4
    W, H = 220, 316; pv = Image.new('RGBA', (W, H)); px = pv.load()
    for y in range(H):
        t = y/H
        for x in range(W): px[x, y] = (int(14+34*t), int(18+22*t), int(46+58*t), 255)
    for sx, sy in ((18, 24), (190, 40), (60, 70), (150, 12), (104, 36), (200, 110), (30, 120)): px[sx, sy] = (230, 236, 255, 255)
    cell = hum.crop((0, 0, 192, 128)); cell = cell.crop(cell.getbbox()).resize((cell.crop(cell.getbbox()).width*3, cell.crop(cell.getbbox()).height*3), Image.NEAREST)
    pv.alpha_composite(cell, ((W-cell.width)//2, H-cell.height-24))
    pv.save(D+'skins/legion/preview.png', optimize=True); webp(pv, D+'skins/legion/preview.webp'); print('ok')
