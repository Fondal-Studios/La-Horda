#!/usr/bin/env python3
"""Ynara: cast propio y ultimate propio (8 cuadros nuevos) por transformaciones deterministas de SUS cuadros.

No inventa trazos ni colores: parte de reposo (cuadro 0), guardia de ataque (12) y los brazos de 14/15 del atlas
actual (96x96, 4 col) y aplica estiramiento/aplastamiento sobre los pies, salto, vuelo del manto, pelo y
báculo (cabeza del báculo alzada con el eje prolongado). Sin efecto pintado: lo pone el motor.
  python3 tools/art/painter/retouch/ynara_cast_ult.py [--out art-source/ynara-cast-ult]
Escribe atlas.png (11 filas: cuadros 36-39 lanzar, 40-43 definitiva), cells/*.png y sets.json. Alfa binario.
"""
import sys, json
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[4]
SRC = ROOT / 'assets/sprites/champions/ynara/atlas.png'
CS = 96; FEET = 89


def cell(a, i):
    r, c = divmod(i, 4)
    return a[r*CS:(r+1)*CS, c*CS:(c+1)*CS].copy()


def vscale(c, s, dy=0):
    """Escala vertical alrededor de la fila de pies (vecino más cercano) y desplaza dy (negativo = sube)."""
    out = np.zeros_like(c)
    for y in range(CS):
        sy = FEET - (FEET - (y - dy)) / s
        sy = int(round(sy))
        if 0 <= sy < CS:
            out[y] = c[sy]
    return out


def hflare(c, y0, y1, k, cx=44):
    """Manto que vuela: la mitad izquierda se corre a la izquierda y la derecha a la derecha, cada vez mas hacia
    el borde inferior (traslacion, sin remuestrear: no rompe el detalle); el centro se rellena con su columna."""
    out = c.copy()
    maxe = int(round((k - 1) * 22))
    for y in range(y0, y1 + 1):
        t = (y - y0) / max(1, y1 - y0)
        e = int(round(maxe * t * t))
        if e <= 0:
            continue
        row = c[y]; new = np.zeros_like(row)
        L = row[:cx]; R = row[cx:]
        a, b = cx - 14, cx + 14      # el centro (piernas) no se mueve: solo los faldones exteriores
        new[a:b] = row[a:b]
        for x in range(a):
            if row[x, 3] and 0 <= x - e < CS: new[x - e] = row[x]
        for x in range(b, CS):
            if row[x, 3] and 0 <= x + e < CS: new[x + e] = row[x]
        for x in range(a - e, a):
            if new[x, 3] == 0 and row[a, 3]: new[x] = row[a]
        for x in range(b, b + e):
            if new[x, 3] == 0 and row[b - 1, 3]: new[x] = row[b - 1]
        out[y] = new
    return out


def paste(dst, src, x0, x1, y0, y1, dx=0, dy=0):
    patch = src[y0:y1, x0:x1]
    m = patch[..., 3] > 0
    ys, xs = np.where(m)
    for y, x in zip(ys, xs):
        yy, xx = y0 + y + dy, x0 + x + dx
        if 0 <= yy < CS and 0 <= xx < CS:
            dst[yy, xx] = patch[y, x]
    return dst


def staff_up(c, d, x0=59, top=22, cut=44):
    """Sube el báculo con la mano (x>=59, filas 22..43) d px; el hueco se rellena repitiendo la fila 44 (manga)."""
    out = c.copy()
    out[top:cut, x0:] = 0
    for y in range(cut - d, cut):
        row = c[cut, x0:]
        out[y, x0:] = np.where(row[:, 3:] > 0, row, out[y, x0:])
    for y in range(top, cut):
        for x in range(x0, CS):
            if c[y, x, 3] and 0 <= y - d:
                out[y - d, x] = c[y, x]
    return out


def build(a):
    base, guard = cell(a, 0), cell(a, 12)
    arm_up, arm_out = cell(a, 15), cell(a, 14)

    def sq(c, s, dy=0, flare=1.0, st=0, tilt=0.0):
        o = c
        if st: o = staff_up(o, st)
        o = vscale(o, s, dy)
        if flare != 1.0:
            o = hflare(o, 58 + dy, 82 + dy, flare)
        return o

    cast = [
        sq(guard, .95, 0, 1.0, 2),
        sq(guard, 1.04, 0, 1.08, 8),
        sq(paste(guard.copy(), arm_out, 14, 42, 36, 56), 1.05, -2, 1.3, 11, .2),
        sq(guard, 1.0, 0, 1.06, 4),
    ]
    ult = [
        sq(guard, .86, 0, 1.12, 1),
        sq(paste(guard.copy(), arm_up, 14, 42, 28, 56), 1.03, -6, 1.35, 10, .15),
        sq(paste(arm_up.copy(), arm_out, 14, 42, 36, 56), 1.04, -10, 1.65, 12, .3),
        sq(guard, 1.0, -3, 1.18, 7),
    ]
    return cast, ult


def main():
    out = ROOT / 'art-source/ynara-cast-ult'
    if '--out' in sys.argv: out = Path(sys.argv[sys.argv.index('--out') + 1])
    a = np.array(Image.open(SRC).convert('RGBA'))
    cast, ult = build(a)
    big = np.zeros((11 * CS, 4 * CS, 4), np.uint8)
    big[:a.shape[0]] = a
    (out / 'cells').mkdir(parents=True, exist_ok=True)
    for n, c in enumerate(cast + ult):
        i = 36 + n
        r, col = divmod(i, 4)
        big[r*CS:(r+1)*CS, col*CS:(col+1)*CS] = c
        Image.fromarray(c).save(out / 'cells' / f'{("cast" if n < 4 else "ult")}_{n % 4}.png')
    assert set(np.unique(big[..., 3])) <= {0, 255}
    Image.fromarray(big).save(out / 'atlas.png', optimize=True)
    (out / 'sets.json').write_text(json.dumps({'cast': [36, 37, 38, 39], 'ultimate': [40, 41, 42, 43]}))
    print('ok', out)

if __name__ == '__main__':
    main()
