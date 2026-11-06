#!/usr/bin/env python3
"""UI Factory · marcos de botones por héroe (UF-ART v2) a partir de los maestros grises de Runway.
Pasos: (1) recorte del verde (el arte es gris, el verde se detecta por tono); (2) medición del hueco del anillo (región transparente
encerrada) para alinear el marco al botón real; (3) reducción por bloques a la grilla lógica de 2 px CSS; (4) mapa de degradado
con el color PROPIO de cada héroe (luminosidad → rampa de 6 tonos, como el Pintor); (5) atlas por héroe con 4 marcos de tamaño fijo.
Salida: css/ui-factory/fx/hero/<héroe>.png + css/ui-factory/fx/hero/atlas.json. Estado: IMPORTED_NOT_APPROVED (requiere revisión de arte).
Uso: python3 tools/ui-factory/build-hero-frames.py [héroe…]   (sin argumentos: todos los de heroes.json)"""
import json, math, os, sys, colorsys
from PIL import Image
ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
SRC = os.path.join(ROOT, 'art-source', 'runway-hud'); OUT = os.path.join(ROOT, 'css', 'ui-factory', 'fx', 'hero')
BLOCK = 2
# frames del atlas: nombre → (lado del lienzo CSS, diámetro del hueco CSS, maestro 'ring'|'ult')
FRAMES = [('basic', 132, 96, 'ring', 0, .30), ('skill', 80, 58, 'ring', 0, .0), ('ult', 112, 62, 'ult', 0, .15), ('sec', 68, 50, 'ring', 0, .0)]   # el último campo: px lógicos de engrosado
def green_mask(im):
    px = im.load(); w, h = im.size; m = Image.new('L', (w, h), 0); mp = m.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y][:3]
            if g > max(r, b) + 14: mp[x, y] = 255
    return m
def analyse(path):
    im = Image.open(path).convert('RGB'); w, h = im.size; gm = green_mask(im); gp = gm.load()
    # fondo = verde conectado con el borde; hueco = verde encerrado
    seen = [[0] * w for _ in range(h)]; stack = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y][x] or not gp[x, y]: continue
        seen[y][x] = 1; stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    hole = [(x, y) for y in range(h) for x in range(w) if gp[x, y] and not seen[y][x]]
    if len(hole) < 2000: raise SystemExit('hueco no encontrado en ' + path)
    cx = sum(p[0] for p in hole) / len(hole); cy = sum(p[1] for p in hole) / len(hole); r = math.sqrt(len(hole) / math.pi)
    return im, gm, cx, cy, r
def ramp(color):
    c = tuple(int(color[i:i + 2], 16) for i in (1, 3, 5)); mix = lambda a, b, t: tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
    return [(8, 5, 4), mix((0, 0, 0), c, .30), mix((0, 0, 0), c, .60), c, mix(c, (255, 255, 255), .45), mix(c, (255, 255, 255), .88)]
BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
def thicken(out, n):
    for _ in range(n):
        src = out.copy(); sp, op = src.load(), out.load(); w, h = out.size
        for y in range(1, h - 1):
            for x in range(1, w - 1):
                if sp[x, y][3]: continue
                nb = [sp[x + dx, y + dy] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if sp[x + dx, y + dy][3]]
                if len(nb) >= 1 and (x + y) % 2 == 0 or len(nb) >= 2: op[x, y] = max(nb, key=lambda c: c[0] + c[1] + c[2])
    return out
def frame(mpath, canvas, hole_css, color, grow=0, dith=.3):
    im, gm, cx, cy, r = analyse(mpath)
    s = (hole_css / BLOCK) / (2 * r)                 # px de maestro → px lógicos (grilla de 2 px CSS)
    L = canvas // BLOCK
    # lienzo lógico centrado en el centro del hueco; se muestrea con BOX (promedio por bloque)
    box = (cx - L / 2 / s, cy - L / 2 / s, cx + L / 2 / s, cy + L / 2 / s)
    small = im.resize((L, L), Image.BOX, box=box); alpha = gm.point(lambda v: 255 - v).resize((L, L), Image.BOX, box=box)
    sp, ap = small.load(), alpha.load(); pal = ramp(color)
    ys = sorted(0.299 * sp[x, y][0] + 0.587 * sp[x, y][1] + 0.114 * sp[x, y][2] for y in range(L) for x in range(L) if ap[x, y] > 200)
    lo, hi = ys[int(len(ys) * .03)], ys[int(len(ys) * .985)]
    out = Image.new('RGBA', (L, L), (0, 0, 0, 0)); op = out.load()
    for y in range(L):
        for x in range(L):
            if ap[x, y] < 150: continue
            Y = 0.299 * sp[x, y][0] + 0.587 * sp[x, y][1] + 0.114 * sp[x, y][2]
            t = max(0.0, min(1.0, (Y - lo) / max(1, hi - lo)))
            f = t * 5 + (BAYER[y % 4][x % 4] / 16.0 - .5) * dith
            op[x, y] = pal[max(0, min(5, int(round(f))))] + (255,)
    if grow: out = thicken(out, grow)
    return out.resize((L * BLOCK, L * BLOCK), Image.NEAREST)
def build(hero, arch, color):
    os.makedirs(OUT, exist_ok=True); W = sum(f[1] for f in FRAMES); H = max(f[1] for f in FRAMES)
    atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0)); x = 0
    for name, canvas, hole, kind, grow, dith in FRAMES:
        m = os.path.join(SRC, '%s_%s' % (arch, kind), 'master.png')
        atlas.paste(frame(m, canvas, hole, color, grow, dith), (x, 0)); x += canvas
    atlas.save(os.path.join(OUT, hero + '.png'), optimize=True)
if __name__ == '__main__':
    here = os.path.dirname(__file__); heroes = json.load(open(os.path.join(here, 'heroes.json')))
    only = sys.argv[1:]
    for key, v in heroes.items():
        if only and key not in only: continue
        try: build(key, v.get('master', v['arch']), v['color']); print('OK', key, v['arch'], v['color'])
        except (FileNotFoundError, SystemExit) as e: print('SALTA', key, v['arch'], str(e)[:60])
    xs = 0; lay = {}
    for name, canvas, hole, kind, grow, dith in FRAMES: lay[name] = {'x': xs, 'size': canvas, 'hole': hole}; xs += canvas
    json.dump({'block': BLOCK, 'width': xs, 'height': max(f[1] for f in FRAMES), 'frames': lay}, open(os.path.join(OUT, 'atlas.json'), 'w'), indent=1)
