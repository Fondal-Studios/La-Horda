#!/usr/bin/env python3
"""Cometa del Gran Número (Ciudad Maldita, A-09 / B368) pintado a escala nativa (pintor determinista, 0 créditos).
Bola de fuego con estela (cabeza a la derecha, estela hacia la izquierda: cm-render.js la rota hacia donde vuela),
6 cuadros en bucle; versión «reflejado» dorada (el cometa desviado que vuelve contra el Presentador), 6 cuadros.
El impacto reutiliza el estallido existente (cmBoom). Paleta corta por banda, contorno de 1 px y alfa 0/255.
Salida: assets/vfx/ciudad/cometa_vuelo_<0..5>.png y cometa_oro_<0..5>.png (48x48 c/u)."""
import os
import numpy as np
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')) + '/'
S = 48
FIRE = {'outline': (44, 12, 10), 'bands': [(122, 26, 22), (196, 56, 26), (246, 118, 38), (255, 196, 84), (255, 246, 214)], 'spark': (255, 170, 60)}
GOLD = {'outline': (52, 34, 8), 'bands': [(132, 88, 22), (198, 146, 38), (240, 196, 72), (255, 230, 140), (255, 252, 228)], 'spark': (255, 236, 150)}

def hsh(*a):
    h = 2166136261
    for v in a:
        h = ((h ^ (int(v) & 0xffffffff)) * 16777619) & 0xffffffff
    return h / 4294967296.0

def frame(f, pal):
    hx, hy, r, L = 33.0, 24.0, 8.2, 30.0
    yy, xx = np.mgrid[0:S, 0:S].astype(float)
    ph = f * 2 * np.pi / 6
    # cabeza: disco con borde de llamas (radio modulado por ángulo y cuadro)
    ang = np.arctan2(yy - hy, xx - hx); dist = np.hypot(xx - hx, yy - hy)
    rr = r + 1.1 * np.sin(5 * ang + ph) + 0.7 * np.sin(9 * ang - 2 * ph)
    head = np.clip(1 - dist / np.maximum(rr, 1e-3), 0, 1)
    # estela: cono hacia la izquierda con ondulación que avanza
    t = np.clip((hx - xx) / L, 0, 1); behind = xx < hx
    wid = r * (1 - t) ** 0.85 + 0.6
    axis = hy + 1.6 * np.sin((xx * 0.42) + ph * 1.0) * t
    tail = np.where(behind, np.clip(1 - np.abs(yy - axis) / np.maximum(wid, 1e-3), 0, 1) * (1 - t) ** 1.2, 0)
    I = np.maximum(head ** 0.7, tail * 0.82)
    alpha = I > 0.08
    # chispas sueltas detrás de la estela (2-3 por cuadro, avanzan con el cuadro)
    spark = np.zeros((S, S), bool)
    for k in range(4):
        sx = int(hx - 14 - ((k * 9 + f * 3) % 22)); sy = int(hy + (hsh(k, 7) - 0.5) * 14 + np.sin(f + k) * 2)
        if 1 <= sx < S - 1 and 1 <= sy < S - 1 and not alpha[sy, sx]:
            spark[sy, sx] = True
    bands = pal['bands']; edges = [0.08, 0.28, 0.48, 0.68, 0.86]
    img = np.zeros((S, S, 4), np.uint8)
    for i, e in enumerate(edges):
        m = alpha & (I >= e)
        img[m, :3] = bands[i]; img[m, 3] = 255
    # núcleo blanco desplazado hacia adelante (lectura de dirección)
    core = np.hypot(xx - (hx + 1.5), yy - hy) <= 2.6
    img[core, :3] = bands[4]; img[core, 3] = 255
    img[spark, :3] = pal['spark']; img[spark, 3] = 255
    # contorno de 1 px (4-vecinos) alrededor de todo lo opaco
    op = img[..., 3] > 0
    pad = np.pad(op, 1)
    ring = ~op & (pad[:-2, 1:-1] | pad[2:, 1:-1] | pad[1:-1, :-2] | pad[1:-1, 2:])
    img[ring, :3] = pal['outline']; img[ring, 3] = 255
    return img

def main():
    out = R + 'assets/vfx/ciudad/'
    for name, pal in (('cometa_vuelo', FIRE), ('cometa_oro', GOLD)):
        for f in range(6):
            Image.fromarray(frame(f, pal), 'RGBA').save(out + '%s_%d.png' % (name, f), optimize=True)
    print('12 cuadros en', out)

if __name__ == '__main__':
    main()
